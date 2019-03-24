import request from 'request';
import nock from 'nock';

interface WeM2kInterceptor extends nock.Interceptor {
    replyWithDefault: (responseCode: number, cb: (body: any) => any) => void;
}

class WeM2k {
    public currentRequest: any;
    public responseGenerator: string;
    private d_defaultScope: nock.Scope | null;

    constructor(responseGenerator: string) {
        this.responseGenerator = responseGenerator;
        this.d_defaultScope = null;
    }
    private defaultScope(): nock.Scope {
        if(!this.d_defaultScope) {
            this.d_defaultScope = nock(this.responseGenerator, {allowUnmocked: true});
        }
        return this.d_defaultScope;
    }

    public mock(options = {allowUnmocked: false}) : nock.Scope {
        (options as any).ssl = {
            getHeader: function(key: string) {
                return this.headers[key.toLocaleLowerCase()];
            }
        }
        let scope = nock(this.responseGenerator, options);
        
        return scope;
    }

    public get(uri: string | RegExp | { (uri: string): boolean; },
               requestBody?: string | RegExp | { (body: any): boolean; } | any,
               interceptorOptions?: nock.Options): WeM2kInterceptor {
        let scope: nock.Scope = this.defaultScope();
        // TODO: Will work when fixed https://jira.we.co/browse/TI-406
        // scope.matchHeader('nock-setting', val => val === undefined);
        let interceptor: nock.Interceptor = scope.get(uri, requestBody, interceptorOptions);
        
        Object.defineProperty(interceptor, 'replyWithDefault', {
            value: function(responseCode: number, modifyBody: (body: any) => any) {
                let interceptor = this;
                interceptor.reply(responseCode, function(uri: any, requestBody: any, nockCallBack: nock.ReplyCallback){
                    let self: any = this as any;
                    let headers = self.req.headers;
                    headers['nock-setting'] = 'bypass';
                    nock.restore(); // TODO: Delete on fix https://jira.we.co/browse/TI-406
                    request({
                        url: self.basePath + uri,
                        method: self.method,
                        body: requestBody,
                        headers: headers
                    }, function (error, response, body) {
                        nock.activate(); // TODO: Delete on fix https://jira.we.co/browse/TI-406
                        nockCallBack(error, modifyBody(body));
                    });
                })
            },
            writable: false
        })
        return interceptor as WeM2kInterceptor;
    }
}


let mocker = new WeM2k('http://example.com');
mocker.get('/hello2').replyWithDefault(201, (body: any): any => {
    console.log(body);
    return 'I have been mocked';
})
nock('http://example.com')
    .get('/hello')
    .reply(201, function (uri: any, requestBody: any, cb: any) {
        console.log(uri);
        console.log(requestBody);
        console.log(this.req.path);
        console.log(this);
        request({
            url: 'http://localhost:8002/package.json',
            method: 'GET',
            body: '',
            headers: {}
        }, function (error, response, body) {
            console.log(error);
            console.log(response);
            console.log(body);
            cb(null, body);
        });
    })