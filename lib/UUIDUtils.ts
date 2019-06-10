
export type RawUUID = string;

/**
 * This function will return an encoded UUID string
 * @param uuid Pass a clean UUID with only the 32 alphanumeric characters
 * @param encodeFrom Possible values are (defualt: utf8) "ascii" | "utf8" | "utf-8"
 * | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex"
 * @param encodeTo Possible values are (default: base64) "ascii" | "utf8" | "utf-8"
 * | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex"
 */
export function encodeUUID(uuid: string,
                           encodeFrom: BufferEncoding = 'utf8',
                           encodeTo: BufferEncoding = 'base64',
): string {
    const uuidBuffer = Buffer.from(uuid, encodeFrom);
    return uuidBuffer.toString(encodeTo);
}

/**
 * This funciton is used to cleanup incoming UUID's and leave only the 32 alphanumeric characters
 * @param uuid in any format
 * @returns A cleaned up UUID with just the necessary 32 characters.
 */
export function createRawUUID(uuid: string): RawUUID {
    const rawuuid: RawUUID = uuid.replace(/[\s-]*/gmi, '');
    return /^[a-f0-9]{32}$/.test(rawuuid) ? rawuuid : '';
}
