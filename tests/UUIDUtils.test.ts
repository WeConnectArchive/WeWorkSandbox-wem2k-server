import { createRawUUID, encodeUUID } from '../lib/UUIDUtils';

function validateParameterMatch(actual: string, expected: string) {
    expect(actual).toHaveLength(expected.length);
    expect(actual).toEqual(expected);
}

describe('Test UUIDUtils Methods', () => {
    const prettyUUID = '2b7a2019-13c5-4337-ba60-90b6437d3920';
    const rawTestUUID = '2b7a201913c54337ba6090b6437d3920';

    describe('createRawUUID', () => {
        it('converts a pretty uuid to a rawUUID', () => {
            const actualRawUUID = createRawUUID(prettyUUID);
            validateParameterMatch(actualRawUUID,rawTestUUID);
        });
        it('converts a raw uuid to a rawUUID', () => {
            const actualRawUUID = createRawUUID(rawTestUUID);
            validateParameterMatch(actualRawUUID,rawTestUUID);
        });
        it('handles extra spaces', () => {
            const actualRawUUID = createRawUUID(' ' + prettyUUID + '  ');
            validateParameterMatch(actualRawUUID,rawTestUUID);
        });
        it('handles tabbed spaces', () => {
            const actualRawUUID = createRawUUID('\t\t' + prettyUUID + '\t');
            validateParameterMatch(actualRawUUID,rawTestUUID);
        });
        it('matches UUID case insensitive', () => {
            const actualRawUUID = createRawUUID('2B7A2019-13c5-4337-ba60-90b6437d3920');
            validateParameterMatch(actualRawUUID,'2B7A201913c54337ba6090b6437d3920');
        });

        it('Invalid inputs return empty string', () => {
            const expectedEmptyString = '';
            validateParameterMatch(createRawUUID(''),expectedEmptyString);
            validateParameterMatch(createRawUUID(' áñúó´p;-!@#$-%^&*-()+=-0987654321qw'),expectedEmptyString);
            validateParameterMatch(createRawUUID('00000000-0000-0000-0000-0000000000001'),expectedEmptyString);
            validateParameterMatch(createRawUUID('00000000-0000-0000-0000-00000000000'),expectedEmptyString);
        });
    });

    describe('encodeUUID', () => {
        it('encodes a raw uuid to base64 encoding', () => {
            const actualEncodedUUID = encodeUUID(rawTestUUID);
            const expectedEncodedValue = 'MmI3YTIwMTkxM2M1NDMzN2JhNjA5MGI2NDM3ZDM5MjA=';
            validateParameterMatch(actualEncodedUUID, expectedEncodedValue);
        });
    });
});
