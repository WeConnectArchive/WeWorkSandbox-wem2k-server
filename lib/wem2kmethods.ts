
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
 * @param uuid Pass in a UUID with dashes, ie a pretty UUID
 * @returns A cleaned up UUID with just the necessary 32 characters.
 */
export function transformUUIDToRaw(uuid: string): string {
    const contexts = [
        {
            action: (u: string, _p: RegExp): string => u,
            pattern:/^[a-z0-9]{32}$/,
        },
        {
            action: (u: string, p: RegExp): string => u.replace(p, '$1$2$3$4$5'),
            pattern:/^([a-z0-9]{8})-([a-z0-9]{4})-([a-z0-9]{4})-([a-z0-9]{4})-([a-z0-9]{12})$/,
        },
    ];

    let rawuuid = '';

    for (let i = 0; i < contexts.length && !rawuuid; i++) {
        const pattern = contexts[i].pattern;
        if (pattern.test(uuid)) {
            rawuuid = contexts[i].action(uuid,pattern);
        }
    }

    return rawuuid;
}
