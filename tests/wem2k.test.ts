import WeM2k from '../lib/wem2k';

describe('WeM2k Tests', () => {
  let wem2ktest: WeM2k;
  const uuid = '2b7a2019-13c5-4337-ba60-90b6437d3920';
  const rawUUID = uuid.replace('-','');
  describe('principalUUID', () => {
    beforeEach(() => {
      wem2ktest = new WeM2k('http://example.com',false);
    });

    it('encodes uuid', () => {
      const principaluuid = wem2ktest.principalUUID(uuid);
      expect(principaluuid).toEqual('MmI3YTIwMTkxM2M1NDMzN2JhNjA5MGI2NDM3ZDM5MjA=');
    });

    it('encodes raw uuid', () => {
      const principaluuid = wem2ktest.principalUUID(rawUUID);
      expect(principaluuid).toEqual('MmI3YTIwMTkxM2M1NDMzN2JhNjA5MGI2NDM3ZDM5MjA=');
    });

    it('encoded uuid and encoded raw uuid are equal', () => {
      expect(wem2ktest.principalUUID(uuid)).toEqual(wem2ktest.principalUUID(rawUUID));
    });
  });
});
