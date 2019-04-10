import { IConfig, IUtil } from 'config';

/* tslint:disable:max-classes-per-file */

class MockUtil implements IUtil {
    public extendDeep(_1: any, _2: any, _3?: number | undefined) {
        throw new Error('Method not implemented.');
    }
    public cloneDeep(_1: any, _2?: number | undefined) {
        throw new Error('Method not implemented.');
    }
    public equalsDeep(_1: any, _2: any, _3?: number | undefined): boolean {
        throw new Error('Method not implemented.');
    }
    public diffDeep(_1: any, _2: any, _3?: number | undefined) {
        throw new Error('Method not implemented.');
    }
    public makeImmutable(_1: any, _2?: string | undefined, _3?: string | undefined) {
        throw new Error('Method not implemented.');
    }
    public makeHidden(_1: any, _2: string, _3?: string | undefined) {
        throw new Error('Method not implemented.');
    }
    public getEnv(_: string): string {
        throw new Error('Method not implemented.');
    }
    public loadFileConfigs(_: string) {
        throw new Error('Method not implemented.');
    }
    public getConfigSources(): Array<import ('config').IConfigSource> {
        throw new Error('Method not implemented.');
    }
    public toObject(_?: any) {
        throw new Error('Method not implemented.');
    }
    public setModuleDefaults(_1: string, _2: any) {
        throw new Error('Method not implemented.');
    }
}

class MockConfig implements IConfig {
    public util: IUtil;
    private dict: object;
    constructor(dict: object) {
        this.util = new MockUtil();
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
