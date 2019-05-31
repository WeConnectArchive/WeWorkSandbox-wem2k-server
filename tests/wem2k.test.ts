import { encodeUUID, transformUUIDToRaw } from '../lib/wem2kmethods';

describe('Test WeM2K supporting Methods', () => {
    //const uuidFormat = new RegExp('([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}){1}');
    describe('Properly encodes a UUID and returns a base64 encoded string', () => {
        const uuid = '2b7a201913c54337ba6090b6437d3920';
        const encodeduuid = encodeUUID(uuid);

        it('Has a count of 44', () => {
            expect(encodeduuid).toHaveLength(44);
        });

        it('The UUID is properly encoded', () => {
            expect(encodeduuid).toEqual('MmI3YTIwMTkxM2M1NDMzN2JhNjA5MGI2NDM3ZDM5MjA=');
        });
    });

    describe('Verify proper formation of UUID before encode', () => {
        const prettyuuid = '2b7a2019-13c5-4337-ba60-90b6437d3920';
        const rawuuid = transformUUIDToRaw(prettyuuid);

        it('Has a count of 32', () => {
            expect(rawuuid).toHaveLength(32);
        });

        it('Contains only lowercase alphanumeric characters', () => {
            const pattern = new RegExp('$[a-z0-9]^');
            const isAPass = pattern.test('abcdefghijkln123456');
            expect(isAPass).toBeTruthy();

        });
    });


});

// 2b7a2019-13c5-4337-ba60-90b6437d3920
