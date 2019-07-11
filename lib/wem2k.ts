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
import * as UUID from './UUIDUtils';

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
  /**
   * returns function compatible for logging wem2k formatted mocks
   *
   * @param outputStream stream for writing recording results
   * @returns logging function that parses nock output and converts it WeM2k calls
   */
  public static createLoggerForRecording(outputStream: NodeJS.WritableStream): (_: string) => void {
    return (content: string) => {
      content = content.replace(/\nnock\([^)]+\)\n/, '\nWeM2k.mock().persist()\n');
      outputStream.write(content);
    };
  }

  /**
   * factory method to inititalize an instance of WeM2k with record enabled
   *
   * @param remoteTarget URL to use as a source for recording
   * @param outputStream stream for writing recording results
   * @returns instance of WeM2k
   */
  public static createRecordInstance(remoteTarget: string, outputStream: NodeJS.WritableStream): WeM2k {
    const instance = new WeM2k(remoteTarget, false /* can be true or false */);
    instance.startRecording(this.createLoggerForRecording(outputStream));
    return instance;
  } // end static methods.

  private remoteTarget: string;
  private enableNetConnect: boolean;

  /**
   * @param remoteTarget The URI to the response generator.
   * @param enableNetConnect This controls how the server handles un-mocked calls. If it is set to
   * true the server will forward un-mocked calls to the responseGenerator. If it is set to false
   * the server will reply with an error for un-mocked calls.
   */
  constructor(remoteTarget: string, enableNetConnect: boolean) {
    this.remoteTarget = remoteTarget;
    this.enableNetConnect = enableNetConnect;
  }

  public getRemoteTarget(): string { return this.remoteTarget; }

  /**
   * This function is used to abstract nock from end users.
   * @param options
   * @returns scope
   */
  public mock(options: nock.Options = { allowUnmocked: this.enableNetConnect }): nock.Scope {
    const scope = nock(this.remoteTarget, options);
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
    public networkEncodeUUID(uuid: string): string {
        const rawUUID = UUID.sanitizeUUID(uuid);
        return !rawUUID ? '' : UUID.encodeUUID(rawUUID);
    }

  private startRecording(logger: (content: string) => void): void {
    nock.recorder.rec({
      enable_reqheaders_recording: true,
      logging: logger,
      use_separator: false,
    });
  }
}

export = WeM2k;
