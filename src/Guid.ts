import { ensureByte } from './util/ensureByte';
import { isValidVersion4GuidForBase } from './util/isValidVersion4GuidForBase';
import { normalizeGuidString } from './util/normalizeGuidString';

export type ByteConverter = (byte: number) => string;

export class Guid {
    /**
     * Memoized strings used to speed serialization
     */
    private static memoizedStrings: Record<number, string[]> = {};

    /**
     * The internal array of bytes (numbers [0,255]) representing this guid
     */
    private _bytes: Uint8Array;

    /**
     * Private constructor for Guid. use newGuid(), newCombGuid(), fromString(), fromBytes()
     * to build new Guid
     */
    private constructor(bytes: Uint8Array) {
        this._bytes = bytes;
    }

    /**
     * Get the empty/null Guid.
     */
    public static get Empty(): Guid {
        const bytes = new Uint8Array(16);
        bytes.fill(0);
        return new Guid(bytes);
    }

    /**
     * Construct a new guid from an array of 16 bytes.
     * @throws {Error} when the bytes array is invalid (null or length <> 16)
     */
    public static fromBytes(bytes: Uint8Array) {
        if (!bytes || bytes.length !== 16) {
            throw Error('Unable to create Guid from provided bytes');
        }

        // ensure compliance with RFC/v4 spec
        //          10101010    start
        //      &   00001111    apply & to mask
        //      =   00001010    first four bits are not kept
        //      |   01000000    apply | to add
        //      =   01001010    result has the first four bits set to version
        bytes[6] = 0x40 | (bytes[6] & 0xf);

        //          10101010    start
        //      &   00111111    apply & to mask
        //      =   00101010    first two bits are not kept
        //      |   10000000    apply | to add
        //      =   10101010    result has first two bits set to variant
        bytes[8] = 0x80 | (bytes[8] & 0x3f);

        return new Guid(bytes);
    }

    /**
     * Construct a new Guid from a string.
     * @param guidString a hex or binary string, with or without hyphens.
     * @returns Valid guid if guidString can be parsed
     * @throws Error if the string is not valid.
     */
    public static fromString(guidString: string) {
        const normalizedGuid = normalizeGuidString(guidString);
        if (normalizedGuid.length === 32 && isValidVersion4GuidForBase(normalizedGuid, 16)) {
            let bytes = Uint8Array.from(
                normalizedGuid.match(/[a-f0-9]{2}/g).map((hexByte) => parseInt(hexByte, 16))
            );
            return Guid.fromBytes(bytes);
        } else if (normalizedGuid.length === 48 && isValidVersion4GuidForBase(normalizedGuid, 10)) {
            let bytes = Uint8Array.from(
                normalizedGuid.match(/[0-9]{3}/g).map((octByte) => parseInt(octByte, 10))
            );
            return Guid.fromBytes(bytes);
        } else if (normalizedGuid.length === 48 && isValidVersion4GuidForBase(normalizedGuid, 8)) {
            let bytes = Uint8Array.from(
                normalizedGuid.match(/[0-7]{3}/g).map((octByte) => parseInt(octByte, 8))
            );
            return Guid.fromBytes(bytes);
        } else if (normalizedGuid.length === 128 && isValidVersion4GuidForBase(normalizedGuid, 2)) {
            let bytes = Uint8Array.from(
                normalizedGuid.match(/[01]{8}/g).map((binByte) => parseInt(binByte, 2))
            );
            return Guid.fromBytes(bytes);
        }
        throw Error(
            `Unable to parse valid v4 guid from ${guidString}. String was not valid hex or binary.`
        );
    }

    /**
     * Get a function that can serialize a byte.
     * @param base A valid numeric base (2-36)
     * @returns {ByteConverter} A function that can serialize a byte in the specified base.
     */
    public static getByteConverter(base: number): ByteConverter {
        if (1 < base && base < 37) {
            // since 255 is the max value of a byte,
            // its width is what we should pad to.
            let width = (255).toString(base).length;
            return (byte: number) => {
                ensureByte(byte);
                if (Guid.memoizedStrings[base] && Guid.memoizedStrings[base][byte]) {
                    return Guid.memoizedStrings[base][byte];
                }
                return byte.toString(base).padStart(width, '0');
            };
        }
        throw Error(`Unable to get byte converter for base ${base}.`);
    }

    /**
     * Memoizes toString values for a base. Improves toString(base) performance.
     * @param base Any JS-supported base for memoization
     * @returns {string[]} A lookup array for number (0-255) to base string
     * @throws {Error} Error from getByteConverter if the base is invalid;
     */
    public static memoize(base: number): string[] {
        try {
            if (!Guid.memoizedStrings[base]) {
                let converter = Guid.getByteConverter(base);
                Guid.memoizedStrings[base] = [];
                for (let i = 0; i < 256; i++) {
                    Guid.memoizedStrings[base][i] = converter(i);
                }
            }
            return Guid.memoizedStrings[base];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Empties the memoizedStrings cache.
     */
    public static clearMemoizedStrings(): void {
        Guid.memoizedStrings = {};
    }

    /**
     * Creates a COMB guid, which is guaranteed to be sequential and v4, while still being quite random.
     * This is the same approach as this... https://github.com/danielboven/ordered-uuid-v4/blob/main/src/stringify.js
     * but instead of copying hex strings, this is copying bytes.
     */
    public static newCombGuid(): Guid {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);

        const dateNow = Date.now();
        // const dateNow = 1_664_395_277_441;
        // const dateNow = 2_000_000_000_000;
        // const dateNow = parseInt(`1${'0'.repeat(48)}`, 2);
        // const dateNow = Math.pow(2, 48);
        const perfNow = performance.now();
        // const perfNow = 9999999.9999;
        const combNow = (dateNow + perfNow) * 100;
        const roundNow = Math.round(combNow);

        for (let offset = 0; offset < 6; offset++) {
            const tgtIdx = 5 - offset;
            const shift = offset * 8;

            // doesn't work because JS can only shift 32 bits
            // bytes[tgtIdx] = (roundNow >> shift) & 255;
            bytes[tgtIdx] = Math.floor(roundNow * Math.pow(2, shift * -1)) & 255;
        }

        return Guid.fromBytes(bytes);
    }

    /**
     * Get a new, random GUID/UUID
     * @returns New guid built on random information.
     */
    public static newGuid(): Guid {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return Guid.fromBytes(bytes);
    }

    /**
     * Gets the Uint8Array of numbers comprising the GUID/UUID value;
     * @returns a copy of the bytes array representing this GUID/UUID
     */
    public toBytes(): Uint8Array {
        return this._bytes.slice();
    }

    /**
     * Returns the guid as a string value in any supported base.
     * @param base A base from 2 thru 36 (inclusive) to convert to
     * @returns GUID/UUID string in the specified base
     * @note This is a variant of the uuid js toString method, but with support for any JS base
     * @see https://github.com/uuidjs/uuid/blob/main/src/stringify.js#L13-L38
     */
    public toString(base: number = 16): string {
        const r = Guid.memoize(base);
        return (
            r[this._bytes[0]] +
            r[this._bytes[1]] +
            r[this._bytes[2]] +
            r[this._bytes[3]] +
            '-' +
            r[this._bytes[4]] +
            r[this._bytes[5]] +
            '-' +
            r[this._bytes[6]] +
            r[this._bytes[7]] +
            '-' +
            r[this._bytes[8]] +
            r[this._bytes[9]] +
            '-' +
            r[this._bytes[10]] +
            r[this._bytes[11]] +
            r[this._bytes[12]] +
            r[this._bytes[13]] +
            r[this._bytes[14]] +
            r[this._bytes[15]]
        ).toLowerCase();
    }

    /**
     * Gets a value suitable for equality and greater-than/less-than comparisons.
     * @returns {BigInt}
     */
    public valueOf(): BigInt {
        return BigInt(normalizeGuidString(this.toString(10)));
    }
}
