import WeM2k from '../lib/wem2k';

describe('WeM2k Tests', () => {
  let wem2ktest: WeM2k;
  const uuid = '2b7a2019-13c5-4337-ba60-90b6437d3920';
  const rawUUID = uuid.replace('-', '');

  describe('networkEncodeUUID', () => {
    beforeEach(() => {
      wem2ktest = new WeM2k('http://example.com', false);
    });

    test('encodes uuid', () => {
      const principaluuid = wem2ktest.networkEncodeUUID(uuid);
      expect(principaluuid).toEqual('K3ogGRPFQze6YJC2Q305IA==');
    });

    test('encodes raw uuid', () => {
      const principaluuid = wem2ktest.networkEncodeUUID(rawUUID);
      expect(principaluuid).toEqual('K3ogGRPFQze6YJC2Q305IA==');
    });

    test('compares encoded uuid and encoded raw uuid are equal', () => {
      expect(wem2ktest.networkEncodeUUID(uuid)).toEqual(wem2ktest.networkEncodeUUID(rawUUID));
    });
  });
});
