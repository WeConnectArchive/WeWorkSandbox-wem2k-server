import WeM2k from '../lib/wem2k';

describe('Add mock', () => {
  test('it adds mock to the existing scope', () => {
    const wem2ktest = new WeM2k('http://example.com', false);
    const mockDef = {
        method: 'get',
        path: '/api',
        response: 'response from newly added mock',
        status: 200,
    };
    const scope = wem2ktest.addMock(mockDef);
    expect(scope.length).toEqual(1);
  });
  test('it sets scope to responseGenerator', () => {
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
