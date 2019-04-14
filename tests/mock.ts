import { IConfig, IUtil } from 'config';

class MockConfig implements IConfig {
    public util: IUtil;
    private dict: object;
    constructor(dict: object) {
        this.util = {} as IUtil
        this.dict = dict;
    }
    public get<T>(setting: string): T {
        return (this.dict as any)[setting] as T;
    }
    public has(setting: string): boolean {
        return this.dict.hasOwnProperty(setting);
    }
}

export = MockConfig;
