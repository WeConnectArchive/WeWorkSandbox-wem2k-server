import request from 'request';
import nock from 'nock';

/*
** This function is used to modify the nock.Interceptor object. I was unable to
** figure out a way to get at the Interceptor definition so I am grabbing the
** prototype off of a temporary interceptor.
*/
function adulterateNock() {
    let tempInterceptor: nock.Interceptor = nock("wem2k.com").get('/');
    let interceptorProto = Object.getPrototypeOf(tempInterceptor);
    nock.removeInterceptor(tempInterceptor);
    if(!interceptorProto.replyWithDefault){
        interceptorProto.replyWithDefault =  function(responseCode: number, modifyBody: (body: any) => any) {
            let interceptor: nock.Interceptor = this;
            // TODO: Will work when fixed https://jira.we.co/browse/TI-406
            // interceptor.reply(...).matchHeader('nock-setting', val => val === undefined);
            return interceptor.reply(responseCode, (uri: any, requestBody: any, nockCallBack: nock.ReplyCallback) => {
                let self: any = interceptor;
                let headers = self.req.headers;
                headers['nock-setting'] = 'bypass';
                nock.restore(); // TODO: Delete on fix https://jira.we.co/browse/TI-406
                request({
                    url: self.basePath + uri,
                    method: self.method,
                    body: requestBody,
                    headers: headers
                }, function (error: any, _: request.Response, body: any) {
                    nock.activate(); // TODO: Delete on fix https://jira.we.co/browse/TI-406
                    nockCallBack(error, modifyBody(body));
                });
            });
        }
    }
};

adulterateNock();

class WeM2k {
    public currentRequest: any;
    public responseGenerator: string;

    constructor(responseGenerator: string) {
        this.responseGenerator = responseGenerator;
    }

    public mock(options = {allowUnmocked: false}) : nock.Scope {
        let scope = nock(this.responseGenerator, options);
        return scope;
    }
}

export = WeM2k;
