export function encodeUUID(uuid: string, encodeFrom: BufferEncoding = 'utf8', encodeTo: string = 'base64'): string {
    const uuidBuffer = Buffer.from(uuid, encodeFrom);
    return uuidBuffer.toString(encodeTo);
}

export function transformUUIDToRaw(uuid: string): string {
    const patterns = [
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
    for (let i = 0; i < patterns.length && !rawuuid; i++) {
        const pattern = patterns[i].pattern;
        if (pattern.test(uuid)) {
            rawuuid = patterns[i].action(uuid,pattern);
        }
    }

    return rawuuid;
}
