import WeM2k from '../wem2k';
import * as nk from 'nock'
declare global {
    namespace NodeJS {
        interface Global {
            WeM2k: WeM2k;
        }
    }
}

declare namespace nock {
    interface Interceptor {
        replyWithDefault(): nk.Scope
    }
}
