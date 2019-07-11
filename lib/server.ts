/**
 * This module defines the mocking server.
 */

/**
 * Imports
 */
import { IConfig } from 'config';
import fs from 'fs';
import http from 'http';
import httpProxy from 'http-proxy';
import * as cb from './callbacks';
import RouteHandler from './routeHandler';
import WeM2k from './wem2k';

export const defaultResponseGeneratorUrl = 'http://example.com';
export const defaultRecordOutputFilepath = `./tmp/record-output-${Date.now()}.js`;

/**
 * Server is the mocking server. It loads the user supplied `serverConfig` file and can mock REST
 * calls sent to it.
 */
class Server {
  private server: http.Server;
  private port: number;
  private config: IConfig;
  private routeHandler: RouteHandler;
  private recordOutputStream: fs.WriteStream;

  /**
   * Process the configuration and set up the mocking server.
   * @param configuration The configuration for the server can have three optional values, `port`,
   * `responseGenerator`, `serverConfig`, `recordTarget`, and `recordingFilepath`.
   * The behavior of the server is undefined if both ()`responseGenerator` and `serverConfig`)
   * or `recordTarget` are not set:
   * * `port` _(default: '8000')_: The port that the server listens to.
   * * `responseGenerator` _(optional)_: The default response generator URL. If no
   *   response generator is passed the server will require all calls to be explicitly mocked. If
   *   `responseGenerator` is not set and the server receives an un-mocked call it will crash.
   * * `serverConfig` _(optional)_: The path to the mocking config file. If this is not passed the
   *   server will act as a pass through proxy to the `responseGenerator`. Ignored in record mode.
   * * `recordTarget` _(optional)_: setting this will enable WeM2k in record mode. If both `responseGenerator` and this
   *   are set, then an exception is thrown.
   * * `recordingFilepath` _(optional)_: allows `defaultRecordOutputFilepath` to be overwritten. Only
   *   valid when `recordTarget` is set.
   */
  constructor(configuration: IConfig) {
    this.config = configuration;
    if (this.config.has('recordTarget') && this.config.has('responseGenerator')) {
      throw Error('Cannot have both recordTarget and responseGenerator configured');
    }

    global.WeM2k = this.setupWeM2kInstance();

    if (this.config.has('serverConfig')) {
      const currentDir: string = process.cwd();
      const configFileName: string = this.config.get('serverConfig');
      require(require.resolve(configFileName, { paths: [currentDir] }));
    }
    this.routeHandler = new RouteHandler(global.WeM2k.getRemoteTarget());
    const proxyApp = httpProxy.createProxyServer({
      changeOrigin: true,
      selfHandleResponse: false,
      target: global.WeM2k.getRemoteTarget(),
    });
    proxyApp.on('error', (err: Error, _: http.IncomingMessage, res: http.ServerResponse) => {
      res.writeHead(501, {
        'Content-Type': 'text/plain',
      });
      res.end(`The server is misconfigured and you will need to mock the following call\n${err}`);
    });
    this.port = +this.getValueOrDefault('port', '8000');
    this.server = http.createServer((req, res) => {
      if (!this.routeHandler.isWeM2kRoute(req.url)) {
        proxyApp.web(req, res, { target: global.WeM2k.getRemoteTarget() });
        return;
      }
      this.routeHandler.route(req, res);
    });
  }

  /**
   * Asynchronously start the server.
   * @returns Promise<http.Server> The listening http.Server as a Promise.
   */
  public start(): Promise<http.Server> {
    return new Promise<http.Server>((resolve: cb.Callback<http.Server>, reject: cb.ErrorCallback) => {
      this.server.on('listening', () => { resolve(this.server); });
      this.server.on('error', reject);
      this.server.listen(this.port);
    });
  }

  /**
   * Asynchronously stop the server.
   * @returns Promise<http.Server> The stopped http.Server as a Promise.
   */
  public stop(): Promise<http.Server> {
    return new Promise<http.Server>((resolve: cb.Callback<http.Server>, reject: cb.ErrorCallback) => {
      this.server.close((err?: Error) => {
        if (this.recordOutputStream) { this.recordOutputStream.close(); }
        if (err) {
          return reject(err);
        }
        return resolve(this.server);
      });
    });
  }

  /**
   * @param key
   * @param defaultValue
   * @returns string The value retrieved from the configuration or the default if the value was
   * not set in the configuration.
   */
  private getValueOrDefault(key: string, defaultValue: string): string {
    if (this.config.has(key)) {
      return this.config.get(key);
    }
    return defaultValue;
  }

  /**
   * This is a helper function to create a WeM2k instance based on configuration.
   *
   * @returns initialized WeM2k instance
   */
  private setupWeM2kInstance(): WeM2k {
    const remoteTarget = this.getValueOrDefault('recordTarget', '') ||
      this.getValueOrDefault('responseGenerator', defaultResponseGeneratorUrl);

    if (this.config.has('recordTarget')) {
      const filepath = this.getValueOrDefault('recordingFilepath', defaultRecordOutputFilepath);
      this.recordOutputStream = fs.createWriteStream(filepath, {flags:'a'});
      return WeM2k.createRecordInstance(remoteTarget, this.recordOutputStream);
    }
    return new WeM2k(remoteTarget, this.config.has('responseGenerator'));
  }
}

export default Server;
