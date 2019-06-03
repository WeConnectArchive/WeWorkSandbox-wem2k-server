import { createRawUUIDFrom, encodeUUID } from '../lib/wem2kmethods';

describe('Test WeM2K supporting Methods', () => {
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
        const rawuuid = createRawUUIDFrom(prettyuuid);

        it('Has a count of 32', () => {
            expect(rawuuid).toHaveLength(32);
        });

        it('Contains only lowercase alphanumeric characters', () => {
            const pattern = new RegExp('^[a-z0-9]+$');
            const isAPass = pattern.test(rawuuid);
            expect(isAPass).toBeTruthy();

        });
    });

    describe('Verify UUID that are already raw', () => {
        const rawtestuuid = '2b7a201913c54337ba6090b6437d3920';
        const resultuuid = createRawUUIDFrom(rawtestuuid);
        it('Given a raw UUID, Verify the same raw UUID is returned', () => {
            expect(resultuuid).toStrictEqual(rawtestuuid);
        });
        it('Raw formatted UUID is should have a character count of 32', () => {
            expect(resultuuid).toHaveLength(32);
        });
    });

    describe('Test transformUUIDToRaw for invalid inputs', () => {
        it('Given an empty string, should return empty string', () => {
            expect(createRawUUIDFrom('')).toStrictEqual('');
        });
        it('Given improper characters, should return empty string', () => {
            expect(createRawUUIDFrom(' áñúó´p;-!@#$-%^&*-()+=-0987654321qw')).toStrictEqual('');
        });
        it('Given too many characters, should return empty string', () => {
            expect(createRawUUIDFrom('00000000-0000-0000-0000-0000000000001')).toStrictEqual('');
        });
        it('Given too few characters, should return empty string', () => {
            expect(createRawUUIDFrom('00000000-0000-0000-0000-00000000000')).toStrictEqual('');
        });
        it('Given extra whitespace on the edges', () => {
            expect(createRawUUIDFrom(' 00000000-0000-0000-0000-000000000000 '))
            .toStrictEqual('00000000000000000000000000000000');
        });
        it('Given extra white space on the edges in the form of a tab', () => {
            expect(createRawUUIDFrom('\t00000000-0000-0000-0000-000000000000\t'))
            .toStrictEqual('00000000000000000000000000000000');
        });
    });

});
