import { IConfig, IUtil } from 'config'

class MockConfig implements IConfig {
  util: IUtil
  private dict: object
  constructor(dict: object) {
    this.util = {} as IUtil
    this.dict = dict
  }
  get<T>(setting: string): T {
    return (this.dict as any)[setting] as T
  }
  has(setting: string): boolean {
    return this.dict.hasOwnProperty(setting)
  }
}

export = MockConfig
