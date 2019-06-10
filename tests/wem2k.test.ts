import WeM2k from '../lib/wem2k';

describe('WeM2k Tests', () => {
  let wem2ktest: WeM2k;
  const simpleRawEncodedUUID = 'MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA=';
  describe('Generic UUID tests for principleUUID', () => {
    beforeEach(() => {
      wem2ktest = new WeM2k('http://example.com',false);
    });

    it('test generic uuid is encoded', () => {
      const simpleUUID = '00000000-0000-0000-0000-000000000000';
      const principleuuid = wem2ktest.principleUUID(simpleUUID);
      expect(principleuuid).toStrictEqual(simpleRawEncodedUUID);
    });

    it('test generic raw uuid is encoded', () => {
      const rawUUID = '00000000000000000000000000000000';
      const principleuuid = wem2ktest.principleUUID(rawUUID);
      expect(principleuuid).toStrictEqual(simpleRawEncodedUUID);
    });

    it('test complex uuid is encoded', () => {
      const complexUUID = '2b7a2019-13c5-4337-ba60-90b6437d3920';
      const principleuuid = wem2ktest.principleUUID(complexUUID);
      expect(principleuuid).toStrictEqual('MmI3YTIwMTkxM2M1NDMzN2JhNjA5MGI2NDM3ZDM5MjA=');
    });
  });
});
