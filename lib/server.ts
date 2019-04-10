import { IConfig } from 'config';
import http from 'http';
import httpProxy from 'http-proxy';
import WeM2k from './wem2k';

class Server {
    private server: http.Server;
    private proxyApp: httpProxy;
    private port: number;
    private config: IConfig;

    constructor(config: IConfig) {
        this.config = config;
        const port: string = this.getOrDefault('port', '8000');
        let responseGeneratorUrl: string;
        // TODO: We need to set this global up before we do the require
        if (this.config.has('responseGenerator')) {
            responseGeneratorUrl = this.config.get('responseGenerator');
            global.WeM2k = new WeM2k(responseGeneratorUrl, true);
        } else {
            responseGeneratorUrl = 'http://example.com';
            global.WeM2k = new WeM2k(responseGeneratorUrl, false);
        }
        if (config.has('serverConfig')) {
            require(config.get('serverConfig'));
        }

        this.proxyApp = httpProxy.createProxyServer({
            changeOrigin: true,
            selfHandleResponse: false,
            target: responseGeneratorUrl,
        });
        this.port = +port;
        this.server = http.createServer(this.proxyApp.web.bind(this.proxyApp));
    }

    public start(): Promise<void> {
        return new Promise((resolve: any, reject: any) => {
            this.server.on('listening', resolve);
            this.server.on('error', reject);
            this.proxyApp.on('error', reject);
            this.server.listen(this.port);
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.close((err?: Error) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
             });
        });
    }

    private getOrDefault(key: string, defaultValue: string): string {
        if (this.config.has(key)) {
            return this.config.get(key);
        }
        return defaultValue;
    }
}

export = Server;
