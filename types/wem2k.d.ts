import WeM2k from '../lib/wem2k';
declare global {
    namespace NodeJS {
        interface Global {
            WeM2k: WeM2k;
        }
    }
}