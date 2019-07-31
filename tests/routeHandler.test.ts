import nock from 'nock'
import RouteHandler from '../lib/routeHandler'
import WeM2kMockDef from '../lib/wem2kMockDef'

describe('RouteHandler', () => {
  describe('addMock', () => {
    let mockDef: WeM2kMockDef
    let routeHandler: RouteHandler
    const expectedResponseGenerator = 'http://example.com'

    beforeEach(() => {
      routeHandler = new RouteHandler(expectedResponseGenerator)
      mockDef = {
        method: 'get',
        path: '/api',
        response: 'response from newly added mock',
        status: 200,
      }
    })

    test('it adds a mock to the existing mocks', () => {
      nock(expectedResponseGenerator)
        .get('/resource')
        .reply(200, 'domain matched')
      expect(nock.pendingMocks().length).toEqual(1)
      routeHandler.addMock(mockDef)
      expect(nock.pendingMocks().length).toEqual(2)
    })

    test('it sets nock uri', () => {
      const scope = routeHandler.addMock(mockDef)
      expect(scope[0].pendingMocks()[0]).toContain(expectedResponseGenerator)
    })
  })
})
