import express from 'express';
import http from 'http';

class StaticServer {
    private app: express.Express;
    private server: http.Server;

    constructor(config: (app: express.Express) => void ) {
        this.app = express();
        config(this.app);
        this.server = http.createServer(this.app);
    }
    public start(port: number): Promise<void> {
        return new Promise((resolve: any, reject: any) => {
            this.server.on('listening', () => {
                resolve();
            });
            this.server.on('error', reject);
            this.server.listen(port);
        });
    }
    public stop(): Promise<void> {
        const self = this;
        return new Promise((resolve, reject) => {
            self.server.close((err?: Error) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }
}

export = StaticServer;
