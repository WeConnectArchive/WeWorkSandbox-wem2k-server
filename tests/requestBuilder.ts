import { IConfig } from 'config';
import request from 'request';
import * as cb from '../lib/callbacks';

export interface RBResponse {
    response: request.Response;
    body: any;
}

/**
 * This is a test utility to build request as promises against localhost.
 */
export class RequestBuilder {
    private baseURI: string;
    /**
     * @param config The configuration settings must contain a `port` setting.
     */
    constructor(config: IConfig) {
        this.baseURI = 'http://localhost:' + config.get('port');
    }

    /**
     * Contruct a request against localhost.
     * @param httpMethod
     * @param path The uri path.
     * @returns The [[RBResponse]] as a Promise.
     */
    public request(httpMethod: string, path: string): Promise<RBResponse> {
        return new Promise((resolve: cb.Callback<RBResponse>, reject: cb.ErrorCallback) => {
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
