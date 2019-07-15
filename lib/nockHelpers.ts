/**
 * Imports
 */
import nock from 'nock';
import request from 'request';

/**
 * This function is used to modify the nock.Interceptor object. I was unable to figure out a way to
 * get at the Interceptor definition so I am grabbing the prototype off of a temporary interceptor.
 */
function adulterateNock() {
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
}

/**
 * EXPORTED FOR TESTING ONLY:
 * This function returns a function compatible for outputting wem2k formatted mocks,
 * when nock records a request/response pair. This is exported for testing purposes.
 *
 * @param outputStream stream for writing recording results
 * @returns logging function that parses nock output and converts it WeM2k calls
 */
export function createFormattedRecordModeLogger(outputStream: NodeJS.WritableStream): (_: string) => void {
  return (content: string) => {
    content = content.replace(/\nnock\([^)]+\)\n/, '\nWeM2k.mock().persist()\n');
    outputStream.write(content);
  };
}

/**
 * This function bootstraps nock with some custom behavior. This should be called before
 * http requests begin.
 *
 * @param recordOsStream _(optional)_: providing this parameter will configure record mode
 *   and cause nock to write recorded results to this osStream.
 */
export function initNock(recordOsStream?: NodeJS.WritableStream): void {
  adulterateNock();
  if (recordOsStream !== undefined) {
    nock.recorder.rec({
      enable_reqheaders_recording: true,
      logging: createFormattedRecordModeLogger(recordOsStream),
      use_separator: false,
    });
  }
}
