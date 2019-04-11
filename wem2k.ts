import jwt from 'jwt-simple';
import nock from 'nock';
import request from 'request';

/**
 * This function is used to modify the nock.Interceptor object. I was unable to
 * figure out a way to get at the Interceptor definition so I am grabbing the
 * prototype off of a temporary interceptor.
 */
function adulterateNock() {
  const tempInterceptor: nock.Interceptor = nock('wem2k.com').get('/');
  const interceptorProto = Object.getPrototypeOf(tempInterceptor);
  nock.removeInterceptor(tempInterceptor);
  if (!interceptorProto.replyWithDefault) {
    interceptorProto.replyWithDefault =  function(responseCode: number, modifyBody: (body: any) => any) {
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
}
adulterateNock();

class WeM2k {
  public currentRequest: any;
  public responseGenerator: string;

  constructor(responseGenerator: string) {
    this.responseGenerator = responseGenerator;
  }

  /**
   * This function is used to abstract nock from end users.
   * @param options A list of {@link https://github.com/nock/nock#options | nock options}.
   *
   * Defaults to {allowUnmocked: true}
   * @returns scope
   */
  public mock(options = {allowUnmocked: true}): nock.Scope {
    const scope = nock(this.responseGenerator, options);
    return scope;
  }

  /**
   * This function is used to list pending mocked endpoints.
   * @returns an array of strings containing the url of all pending mocks
   */
  public listPendingMocks(): string[] {
    return nock.pendingMocks();
  }

  /**
   * This function is used to create a JWT (JSON Web Token) for authentication.
   * It depends on the following environment variables:
   *
   * WE_AUTH_PRIVATE_KEY - Set to a valid RS256 private key
   * @param payload
   * @returns an encoded JWT
   */
  public makeJWT(payload: any): string {
    const encodedJWT = jwt.encode(payload, process.env.WE_AUTH_PRIVATE_KEY, 'RS256');
    return encodedJWT;
  }
}
export = WeM2k;
