import * as UUID from '../lib/UUIDUtils';

function validateParameterMatch(actual: string, expected: string) {
    expect(actual).toHaveLength(expected.length);
    expect(actual).toEqual(expected);
}

describe('Test UUIDUtils Methods', () => {
    const prettyUUID = '2b7a2019-13c5-4337-ba60-90b6437d3920';
    const rawTestUUID = '2b7a201913c54337ba6090b6437d3920';

    describe('sanitizeUUID', () => {
        it('converts a pretty uuid to a rawUUID', () => {
            const actualRawUUID = UUID.sanitizeUUID(prettyUUID);
            validateParameterMatch(actualRawUUID,rawTestUUID);
        });
        it('converts a raw uuid to a rawUUID', () => {
            const actualRawUUID = UUID.sanitizeUUID(rawTestUUID);
            validateParameterMatch(actualRawUUID,rawTestUUID);
        });
        it('trims whitespace', () => {
            const actualRawUUID = UUID.sanitizeUUID('\t' + prettyUUID + '  ');
            validateParameterMatch(actualRawUUID,rawTestUUID);
        });
        it('matches UUID case insensitive', () => {
            const actualRawUUID = UUID.sanitizeUUID('2B7A2019-13c5-4337-ba60-90b6437d3920');
            validateParameterMatch(actualRawUUID,'2B7A201913c54337ba6090b6437d3920');
        });

        it('returns an empty string when the input is not a UUID', () => {
            const emptyString = '';
            validateParameterMatch(UUID.sanitizeUUID(''),emptyString);
            validateParameterMatch(UUID.sanitizeUUID(' áñúó´p;-!@#$-%^&*-()+=-0987654321qw'),emptyString);
            validateParameterMatch(UUID.sanitizeUUID('00000000-0000-0000-0000-0000000000001'),emptyString);
            validateParameterMatch(UUID.sanitizeUUID('00000000-0000-0000-0000-00000000000'),emptyString);
        });
    });

    describe('encodeUUID', () => {
        it('encodes a raw uuid to base64 encoding', () => {
            const actualEncodedUUID = UUID.encodeUUID(rawTestUUID);
            const expectedEncodedValue = 'K3ogGRPFQze6YJC2Q305IA==';
            validateParameterMatch(actualEncodedUUID, expectedEncodedValue);
        });


    });
});
