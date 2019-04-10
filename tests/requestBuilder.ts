import { IConfig } from 'config';
import request from 'request';

export interface RBResponse {
    response: request.Response;
    body: any;
}

export class RequestBuilder {

    private baseURI: string;
    constructor(config: IConfig) {
        this.baseURI = 'http://localhost:' + config.get('port');
    }
    public request(httpMethod: string, path: string): Promise<RBResponse> {
        return new Promise((resolve: (value: RBResponse) => void, reject: (error: any) => void) => {
            request({
                method: httpMethod,
                timeout: 500,
                uri: this.baseURI + path,
            }, (error: any, response: request.Response, body: any): void  => {
                if (error) {
                    return reject(error);
                }
                return resolve({response, body});
            });
        });
    }
}
