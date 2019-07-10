import nock from 'nock';
import WeM2k from '../lib/wem2k';
import WeM2kMockDef from '../lib/wem2kMockDef';

describe('WeM2k Tests', () => {
  let wem2ktest: WeM2k;
  const uuid = '2b7a2019-13c5-4337-ba60-90b6437d3920';
  const rawUUID = uuid.replace('-', '');
  let mockDef: WeM2kMockDef;
  const expectedResponseGenerator='http://example.com';
  describe('networkEncodeUUID', () => {
    beforeEach(() => {
      wem2ktest = new WeM2k('http://example.com', false);
    });

    it('encodes uuid', () => {
      const principaluuid = wem2ktest.networkEncodeUUID(uuid);
      expect(principaluuid).toEqual('K3ogGRPFQze6YJC2Q305IA==');
    });

    it('encodes raw uuid', () => {
      const principaluuid = wem2ktest.networkEncodeUUID(rawUUID);
      expect(principaluuid).toEqual('K3ogGRPFQze6YJC2Q305IA==');
    });

    it('compares encoded uuid and encoded raw uuid are equal', () => {
      expect(wem2ktest.networkEncodeUUID(uuid)).toEqual(wem2ktest.networkEncodeUUID(rawUUID));
    });
  });
  describe('addMock', () => {
    beforeEach(() => {
      wem2ktest = new WeM2k(expectedResponseGenerator, false);
      mockDef = {
        method: 'get',
        path: '/api',
        response: 'response from newly added mock',
        status: 200,
      };
    });

    test('it adds a mock to the existing mocks', () => {
      nock(expectedResponseGenerator)
        .get('/resource')
        .reply(200, 'domain matched');
      expect(nock.pendingMocks().length).toEqual(1);
      wem2ktest.addMock(mockDef);
      expect(nock.pendingMocks().length).toEqual(2);
    });

    test('it sets nock uri to responseGenerator of server', () => {
      const scope = wem2ktest.addMock(mockDef);
      expect(scope[0].pendingMocks()[0]).toContain(expectedResponseGenerator);
    });

    test('it throws an error when method is not set', () => {
      const def = {
        path: '/',
        response: 'yo',
      };
      expect(() => { wem2ktest.addMock(def); }).toThrowError();
    });
  });
});
