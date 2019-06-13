import * as UUID from '../lib/UUIDUtils';

describe('Test UUIDUtils Methods', () => {
    const prettyUUID = '2b7a2019-13c5-4337-ba60-90b6437d3920';
    const rawTestUUID = '2b7a201913c54337ba6090b6437d3920';

    describe('sanitizeUUID', () => {
        it('converts a pretty uuid to a rawUUID', () => {
            const actualRawUUID = UUID.sanitizeUUID(prettyUUID);
            expect(actualRawUUID).toEqual(rawTestUUID);
        });
        it('converts a raw uuid to a rawUUID', () => {
            const actualRawUUID = UUID.sanitizeUUID(rawTestUUID);
            expect(actualRawUUID).toEqual(rawTestUUID);
        });
        it('trims whitespace', () => {
            expect(UUID.sanitizeUUID('\t' + prettyUUID + '\t')).toEqual(rawTestUUID);
            expect(UUID.sanitizeUUID('  ' + prettyUUID + ' ')).toEqual(rawTestUUID);
        });
        it('matches UUID case insensitive', () => {
            const actualRawUUID = UUID.sanitizeUUID('2B7A2019-13c5-4337-ba60-90b6437d3920');
            expect(actualRawUUID).toEqual('2B7A201913c54337ba6090b6437d3920');
        });

        it('returns an empty string when the input is not a UUID', () => {
            expect(UUID.sanitizeUUID('')).toEqual('');
            expect(UUID.sanitizeUUID(' áñúó´p;-!@#$-%^&*-()+=-0987654321qw')).toEqual('');
            expect(UUID.sanitizeUUID('00000000-0000-0000-0000-0000000000001')).toEqual('');
            expect(UUID.sanitizeUUID('00000000-0000-0000-0000-00000000000')).toEqual('');
        });
    });

    describe('encodeUUID', () => {
        it('encodes a raw uuid to base64 encoding', () => {
            const actualEncodedUUID = UUID.encodeUUID(rawTestUUID);
            const expectedEncodedValue = 'K3ogGRPFQze6YJC2Q305IA==';
            expect(actualEncodedUUID).toEqual(expectedEncodedValue);
        });

    });
});
