import fs from 'fs'
import { initNock } from '../lib/nockHelpers'
import {
  default as Server,
  defaultRecordOutputFilepath,
  defaultResponseGeneratorUrl,
} from '../lib/server'
import WeM2k from '../lib/wem2k'
import MockConfig from './mock'
import portfinder from 'portfinder'
import http from 'http'

jest.mock('../lib/wem2k')
jest.mock('../lib/nockHelpers')

function getFreePort(): Promise<any> {
  return new Promise((resolve, reject) => {
    portfinder.getPortPromise()
      .then((port) => {
        return resolve(port)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

describe('Server Unit Tests', () => {
  describe('invalid config', () => {
    test('should not accept responseGenerator and recordTarget', () => {
      const config = new MockConfig({
        port: '8005',
        recordTarget: 'some_other_url',
        responseGenerator: 'some_url',
      })
      const errRegex = /(?:recordTarget.*responseGenerator|responseGenerator.*recordTarget)/
      expect(() => new Server(config)).toThrowError(errRegex)
    })
  })
  describe('valid config', () => {
    const fakeOsStream = { write: (_: string): void => undefined } as unknown as NodeJS.WritableStream
    const createWriteStreamMock = jest.fn().mockReturnValue(fakeOsStream)

    beforeEach(() => {
      // @ts-ignore
      WeM2k.mockClear()
      // @ts-ignore
      initNock.mockClear()
      fs.createWriteStream = createWriteStreamMock
    })

    test('default configuration inititalizes WeM2k with default generator and no proxying', () => {
      // @ts-ignore
      const _ = new Server(new MockConfig({}))
      expect(createWriteStreamMock).not.toBeCalled()
      expect(initNock).toBeCalledWith() // no args
      expect(WeM2k).toHaveBeenCalledWith(defaultResponseGeneratorUrl, false)
    })
    test('responseGenerator defined initialiazes wem2k with proxying enabled', () => {
      // @ts-ignore
      const _ = new Server(new MockConfig({
        responseGenerator: 'itsdefined.com',
      }))
      expect(createWriteStreamMock).not.toBeCalled()
      expect(initNock).toBeCalledWith() // no args
      expect(WeM2k).toHaveBeenCalledWith('itsdefined.com', true) // proxy enabled
    })
    test('recordTarget defined without recordingFilepath initializes record mode with default filepath', () => {
      // @ts-ignore
      const _ = new Server(new MockConfig({
        recordTarget: 'itsdefined.com',
      }))

      expect(createWriteStreamMock).toBeCalledWith(defaultRecordOutputFilepath, { flags: 'a' })
      expect(initNock).toBeCalledWith(fakeOsStream)
      expect(WeM2k).not.toBeCalled()
    })
    test('recordTarget and recordingFilepath defined initializes record mode with recordingFilepath as output', () => {
      const filepath = '/tmp/my-own-file'
      // @ts-ignore
      const _ = new Server(new MockConfig({
        recordTarget: 'itsdefined.com',
        recordingFilepath: filepath,
      }))
      expect(createWriteStreamMock).toBeCalledWith(filepath, { flags: 'a' })
      expect(initNock).toBeCalledWith(fakeOsStream)
      expect(WeM2k).not.toBeCalled()
    })
  })
})
