/**
 * This module defines the mocking server.
 */

/**
 * Imports
 */
import { IConfig } from 'config'
import fs from 'fs'
import http from 'http'
import httpProxy from 'http-proxy'
import * as cb from './callbacks'
import { initNock } from './nockHelpers'
import RouteHandler from './routeHandler'
import WeM2k from './wem2k'

export const defaultResponseGeneratorUrl = 'http://example.com'
export const defaultRecordOutputFilepath = `./tmp/record-output-${Date.now()}.js`

/**
 * Server is the mocking server. It loads the user supplied `serverConfig` file and can mock REST
 * calls sent to it.
 */
class Server {
  private server: http.Server
  private port: number
  private config: IConfig
  private recordOutputStream: fs.WriteStream

  /**
   * Process the configuration and set up the mocking server.
   * This server can be configured three different ways:
   * 1. proxy with mocking. This mode proxies all unmocked calls to `responseGenerator`.
   * 2. mocking with no proxy. This mode returns a 501 for all unmocked calls.
   * 3. record mode. This mode does not mock calls but acts as a man-in-the-middle
   *    between client and the `recordTarget` and outputs all HTTP exchanges to a file
   *    for the purpose of generating mocks for the `recordTarget`.
   *
   * @param configuration The configuration consists of `port`,`responseGenerator`, `serverConfig`,
   *   `recordTarget`, and `recordingFilepath`.
   *   The behavior of the server is undefined if neither `responseGenerator`, `serverConfig`, nor
   * `recordTarget` are set.
   * * `port` _(default: '8000')_: The port that the server listens to.
   * * `responseGenerator` _(optional)_: The default response generator URL. If no
   *   response generator is passed the server will require all calls to be explicitly mocked. If
   *   `responseGenerator` is not set and the server receives an un-mocked call it will crash.
   * * `serverConfig` _(optional)_: The path to the mocking config file. If this is not passed the
   *   server will act as a pass through proxy to the `responseGenerator`. Ignored in record mode.
   * * `recordTarget` _(optional)_: setting this will enable WeM2k in record mode. If both `responseGenerator`
   *   and `recordTarget` are set, an exception is thrown.
   * * `recordingFilepath` _(optional)_: allows `defaultRecordOutputFilepath` to be overwritten. Only
   *   valid when `recordTarget` is set.
   */
  constructor(configuration: IConfig) {
    this.config = configuration
    if (this.config.has('recordTarget') && this.config.has('responseGenerator')) {
      throw Error('Cannot have both recordTarget and responseGenerator configured')
    }

    const remoteTarget = this.getValueOrDefault('recordTarget', '') ||
      this.getValueOrDefault('responseGenerator', defaultResponseGeneratorUrl)
    this.port = +this.getValueOrDefault('port', '8000')
    this.configureNockDependencies(remoteTarget)
    this.initHttpServer(remoteTarget)
  }

  /**
   * Asynchronously start the server.
   * @returns Promise<http.Server> The listening http.Server as a Promise.
   */
  start(): Promise<http.Server> {
    return new Promise<http.Server>((resolve: cb.Callback<http.Server>, reject: cb.ErrorCallback) => {
      this.server.on('listening', () => { resolve(this.server) })
      this.server.on('error', reject)
      this.server.listen(this.port)
    })
  }

  /**
   * Asynchronously stop the server.
   * @returns Promise<http.Server> The stopped http.Server as a Promise.
   */
  stop(): Promise<http.Server> {
    return new Promise<http.Server>((resolve: cb.Callback<http.Server>, reject: cb.ErrorCallback) => {
      this.server.close((err?: Error) => {
        if (this.recordOutputStream) { this.recordOutputStream.close() }
        if (err) {
          return reject(err)
        }
        return resolve(this.server)
      })
    })
  }

  /**
   * This function bootstraps nock and initializes WeM2k if record mode isn't enabled.
   *
   * @param remoteTarget used by WeM2k as baseRoute for nock
   */
  private configureNockDependencies(remoteTarget: string): void {
    if (this.config.has('recordTarget')) {
      const filepath = this.getValueOrDefault('recordingFilepath', defaultRecordOutputFilepath)
      this.recordOutputStream = fs.createWriteStream(filepath, {flags: 'a'})
      initNock(this.recordOutputStream)
      return // WeM2k not initialized if in record mode.
    }

    initNock()
    global.WeM2k = new WeM2k(remoteTarget, this.config.has('responseGenerator'))
    if (this.config.has('serverConfig')) {
      const currentDir: string = process.cwd()
      const configFileName: string = this.config.get('serverConfig')
      require(require.resolve(configFileName, { paths: [currentDir] }))
    }
  }

  /**
   * This is a helper function to initialize the http server.
   *
   * @param remoteTarget used by server to determine where to proxy requests
   */
  private initHttpServer(remoteTarget: string) {
    const routeHandler = new RouteHandler(remoteTarget)
    const proxyApp = httpProxy.createProxyServer({
      changeOrigin: true,
      selfHandleResponse: false,
      target: remoteTarget,
    })
    proxyApp.on('error', (err: Error, _: http.IncomingMessage, res: http.ServerResponse) => {
      res.writeHead(501, {
        'Content-Type': 'text/plain',
      })
      res.end(`The server is misconfigured and you will need to mock the following call\n${err}`)
    })

    this.server = http.createServer((req, res) => {
      if (!routeHandler.isWeM2kRoute(req.url)) {
        proxyApp.web(req, res, { target: remoteTarget })
        return
      }
      routeHandler.route(req, res)
    })
  }

  /**
   * @param key
   * @param defaultValue
   * @returns string The value retrieved from the configuration or the default if the value was
   * not set in the configuration.
   */
  private getValueOrDefault(key: string, defaultValue: string): string {
    if (this.config.has(key)) {
      return this.config.get(key)
    }
    return defaultValue
  }
}

export default Server
