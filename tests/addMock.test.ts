import nock from 'nock';
import WeM2k from '../lib/wem2k';

describe('Add mock', () => {
  test('it adds a mock to the existing mocks', () => {
    const wem2ktest = new WeM2k('http://example.com', false);

    nock('http://www.example.com')
      .get('/resource')
      .reply(200, 'domain matched');
    expect(nock.pendingMocks().length).toEqual(1);

    const mockDef = {
        method: 'get',
        path: '/api',
        response: 'response from newly added mock',
        status: 200,
    };
    wem2ktest.addMock(mockDef);

    expect(nock.pendingMocks().length).toEqual(2);
  });
  test('it sets nock uri to responseGenerator of server', () => {
    const responseGenerator = 'http://example.com';
    const wem2ktest = new WeM2k(responseGenerator, false);
    const mockDef = {
      method: 'get',
      path: '/api',
      response: 'response from newly added mock',
      status: 200,
    };
    const scope = wem2ktest.addMock(mockDef);
    expect(scope[0].pendingMocks()[0]).toContain(responseGenerator);
  });
  test('it throws an error when port and scope conflict', () => {
    const wem2ktest = new WeM2k('http://example.test:8000', false);
    const mockDef = {
      method: 'get',
      path: '/scope',
      port: 1234,
      response: 'response from newly added mock',
      status: 200,
    };
    expect(() => {wem2ktest.addMock(mockDef); }).toThrowError();
  });
  test('it throws an error when method is not set', () => {
    const wem2ktest = new WeM2k('http://example.test:8000', false);
    const mockDef = {
      method: '',
      path: '/scope',
      port: 1234,
      response: 'response from newly added mock',
      status: 200,
    };
    expect(() => {wem2ktest.addMock(mockDef); }).toThrowError();
  });
});
