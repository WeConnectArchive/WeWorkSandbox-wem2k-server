import * as nock from 'nock'
import { createFormattedRecordModeLogger, initNock } from '../lib/nockHelpers'

describe('NockHelpers Tests', () => {
  describe ('createFormattedRecordModeLogger', () => {
    test('replaces nock output with WeM2K output', () => {
      let content = ''
      const writeFunc = (output: string) => {
        content = output
      }
      const logger = createFormattedRecordModeLogger({ write: writeFunc } as unknown as NodeJS.WritableStream)
      logger('\nnock("someRandomURI",{})\n\t.someRandomMockingCall({})')
      expect(content).toEqual('\nWeM2k.mock().persist()\n\t.someRandomMockingCall({})')
    })
  })

  describe ('initNock', () => {
    test('initializes nock in record mode if recordOsStream provided', () => {
      const recordMock = jest.fn()
      nock.recorder.rec = recordMock
      initNock({ write: (_: string): void => undefined } as unknown as NodeJS.WritableStream)
      expect(recordMock).toBeCalled()
    })

    test('initializes nock without record mode if recordOsStream absent', () => {
      const recordMock = jest.fn()
      nock.recorder.rec = recordMock
      initNock()
      expect(recordMock).not.toBeCalled()
    })
  })
})
