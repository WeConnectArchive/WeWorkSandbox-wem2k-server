function encodeUUID(uuid: string, encodeFrom: BufferEncoding = 'utf8', encodeTo: string = 'base64'): string {
    const uuidBuffer = Buffer.from(uuid, encodeFrom);
    return uuidBuffer.toString(encodeTo);
}

export = encodeUUID;
