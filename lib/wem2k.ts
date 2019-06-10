/**
 * This module controls how we use [nock](http://github.com/nock/nock) and defines the methods that
 * are made available to the `serverConfig` file.
 */

/**
 * Imports
 */
import * as jwt from 'jwt-simple';
import nock from 'nock';
import request from 'request';
import { createRawUUID, encodeUUID } from './UUIDUtils';

/**
 * This function is used to modify the nock.Interceptor object. I was unable to figure out a way to
 * get at the Interceptor definition so I am grabbing the prototype off of a temporary interceptor.
 */
(function adulterateNock() {
    const tempInterceptor: nock.Interceptor = nock('wem2k.com').get('/');
    const interceptorProto = Object.getPrototypeOf(tempInterceptor);
    nock.removeInterceptor(tempInterceptor);
    if (!interceptorProto.replyWithDefault) {
        interceptorProto.replyWithDefault = function(responseCode: number, modifyBody: (body: any) => any) {
            const interceptor: nock.Interceptor = this;
            // TODO: Will work when fixed https://jira.we.co/browse/TI-406
            // interceptor.reply(...).matchHeader('nock-setting', val => val === undefined);
            return interceptor.reply(responseCode, (uri: any, requestBody: any, nockCallBack: nock.ReplyCallback) => {
                const self: any = interceptor;
                const headers = self.req.headers;
                headers['nock-setting'] = 'bypass';
                nock.restore(); // TODO: Delete on fix https://jira.we.co/browse/TI-406
                request({
                    body: requestBody,
                    headers,
                    method: self.method,
                    url: self.basePath + uri,
                }, (error: any, _: request.Response, body: any) => {
                    nock.activate(); // TODO: Delete on fix https://jira.we.co/browse/TI-406
                    nockCallBack(error, modifyBody(body));
                });
            });
        };
    }
})();

/**
 * The WeM2k class controls how the server handles mocking and sets up methods that can be used in
 * the `serverConfig` file.
 */
class WeM2k {
    private responseGenerator: string;
    private enableNetConnect: boolean;

    /**
     * @param responseGenerator The URI to the response generator.
     * @param enableNetConnect This controls how the server handles un-mocked calls. If it is set to
     * true the server will forward un-mocked calls to the responseGenerator. If it is set to false
     * the server will reply with an error for un-mocked calls.
     */
    constructor(responseGenerator: string, enableNetConnect: boolean) {
        this.responseGenerator = responseGenerator;
        this.enableNetConnect = enableNetConnect;
    }
    /**
     * This function is used to abstract nock from end users.
     * @param options
     * @returns scope
     */
    public mock(options: nock.Options = { allowUnmocked: this.enableNetConnect }): nock.Scope {
        const scope = nock(this.responseGenerator, options);
        return scope;
    }

    /**
     * This function is used to create a JWT (JSON Web Token) for authentication.  It requires
     * WE_AUTH_PRIVATE_KEY to be set to a valid RS256 private key in the environment.
     * @param payload
     * @returns an encoded JWT
     */
    public makeJWT(payload: object): string {
        const encodedJWT = jwt.encode(payload, process.env.WE_AUTH_PRIVATE_KEY, 'RS256');
        return encodedJWT;
    }

    /**
     * This function is used to create a token transform for authentication.
     * @param uuid in any format
     * @returns base64 encoded raw UUID, or empty string for invalid inputs.
     */
    public principleUUID(uuid: string): string {
        const rawUUID = createRawUUID(uuid);
        return !rawUUID ? '' : encodeUUID(rawUUID);
    }
}

export = WeM2k;
