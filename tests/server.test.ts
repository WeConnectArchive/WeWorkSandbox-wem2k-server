import fs from 'fs';
import {
  default as Server,
  defaultRecordOutputFilepath,
  defaultResponseGeneratorUrl,
} from '../lib/server';
import WeM2k from '../lib/wem2k';
import MockConfig from './mock';

jest.mock('../lib/wem2k');

describe('Server Unit Tests', () => {
  describe('invalid config', () => {
    test('should not accept responseGenerator and recordTarget', () => {
      const config = new MockConfig({
        port: '8005',
        recordTarget: 'some_other_url',
        responseGenerator: 'some_url',
      });
      const errRegex = /(?:recordTarget.*responseGenerator|responseGenerator.*recordTarget)/;
      expect(() => new Server(config)).toThrowError(errRegex);
    });
  });
  describe('WeM2k initializaton', () => {
    beforeEach(() => {
      // @ts-ignore
      WeM2k.mockClear();
      const createRecordInstance = jest.fn();
      createRecordInstance.mockReturnValue(new WeM2k('itsdefined.com', false));

      WeM2k.createRecordInstance = createRecordInstance;

    });
    test('default configuration', () => {
      // @ts-ignore
      const _ = new Server(new MockConfig({}));
      expect(WeM2k).toHaveBeenCalledWith(defaultResponseGeneratorUrl, false);
    });
    test('responseGeneratorDefined', () => {
      // @ts-ignore
      const _ = new Server(new MockConfig({
        responseGenerator: 'itsdefined.com',
      }));
      expect(WeM2k).toHaveBeenCalledWith('itsdefined.com', true);
    });
    test('recordTarget defined', () => {
      const streamFunc = jest.fn();
      fs.createWriteStream = streamFunc;
      // @ts-ignore
      const _ = new Server(new MockConfig({
        recordTarget: 'itsdefined.com',
      }));
      expect(streamFunc).toBeCalledWith(defaultRecordOutputFilepath, {flags:'a'});
      expect(WeM2k.createRecordInstance).toHaveBeenCalled();
    });
    test('recordTarget and recordingFilepath defined', () => {
      const streamFunc = jest.fn();
      fs.createWriteStream = streamFunc;
      const filepath = '/tmp/my-own-file';
      // @ts-ignore
      const _ = new Server(new MockConfig({
        recordTarget: 'itsdefined.com',
        recordingFilepath: filepath,
      }));
      expect(streamFunc).toBeCalledWith(filepath, {flags:'a'});
      expect(WeM2k.createRecordInstance).toHaveBeenCalled();
    });
  });
});
