import { RandomBytePool } from './RandomBytePool';
import { ensureByte } from './util/ensureByte';
import { isValidVersion4GuidForBase } from './util/isValidVersion4GuidForBase';
import { normalizeGuidString } from './util/normalizeGuidString';

export type ByteConverter = (byte: number) => string;

/**
 * Number of bytes in a GUID/UUID
 */
export const BYTES_IN_GUID = 16;

/**
 * Minimum value for a byte (inclusive).
 */
export const BYTE_MIN = 0;

/**
 * Maximum value for a byte (inclusive).
 */
export const BYTE_MAX = 255;

/**
 * Creates, parses, or represents a GUID/UUID.
 */
export class Guid {
    /**
     * Sometimes COMB guid generation is too fast, and the guids aren't sequential
     * in the unit tests.  combIdx guarantees that these are sequential with no
     * delays, regardless of where they are generated or how (even in loops).
     */
    private static combIdx: number = 0;

    /**
     * Memoized strings used to speed serialization
     */
    private static memoizedStrings: Record<number, string[]> = {};

    /**
     * A RandomBytePool, used to provide random data to construct new, random GUID/UUID instances.
     */
    private static randomBytePool: RandomBytePool = new RandomBytePool(BYTES_IN_GUID * BYTES_IN_GUID);

    /**
     * The internal array of bytes (numbers [0,255]) representing this guid
     */
    private _bytes: Uint8Array;

    /**
     * Private constructor for Guid. See static factories to create new Guids.
     * @see Guid.Empty,
     * @see Guid.newGuid()
     * @see Guid.newCombGuid()
     * @see Guid.fromString()
     * @see Guid.fromBytes()
     */
    private constructor(bytes: Uint8Array) {
        this._bytes = bytes;
    }

    /**
     * Get the empty/null Guid.
     */
    public static get Empty(): Guid {
        const bytes = new Uint8Array(BYTES_IN_GUID).fill(0);
        return new Guid(bytes);
    }

    /**
     * Empties the memoizedStrings cache.
     */
    public static clearMemoizedStrings(): void {
        Guid.memoizedStrings = {};
    }

    /**
     * Construct a new guid from an array of 16 bytes.
     * @throws {Error} when the bytes array is invalid (null or length <> 16)
     */
    public static fromBytes(bytes: Uint8Array) {
        if (!bytes || bytes.length !== BYTES_IN_GUID) {
            throw Error(
                `Unable to create Guid from provided bytes. Ensure array length is ${BYTES_IN_GUID}.`
            );
        }

        /*
            ensure compliance with RFC/v4 spec
                    10101010    start example
                &   00001111    apply & to mask
                =   00001010    first four bits are not kept
                |   01000000    apply | to add
                =   01001010    result has the first four bits set to version
        */
        bytes[6] = 0x40 | (bytes[6] & 0x0f);

        /* 
                 10101010    start example
             &   00111111    apply & to mask
             =   00101010    first two bits are not kept
             |   10000000    apply | to add
             =   10101010    result has first two bits set to variant
        */
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
            return new Guid(bytes);
        } else if (normalizedGuid.length === 48 && isValidVersion4GuidForBase(normalizedGuid, 10)) {
            let bytes = Uint8Array.from(
                normalizedGuid.match(/[0-9]{3}/g).map((octByte) => parseInt(octByte, 10))
            );
            return new Guid(bytes);
        } else if (normalizedGuid.length === 48 && isValidVersion4GuidForBase(normalizedGuid, 8)) {
            let bytes = Uint8Array.from(
                normalizedGuid.match(/[0-7]{3}/g).map((octByte) => parseInt(octByte, 8))
            );
            return new Guid(bytes);
        } else if (normalizedGuid.length === 128 && isValidVersion4GuidForBase(normalizedGuid, 2)) {
            let bytes = Uint8Array.from(
                normalizedGuid.match(/[01]{8}/g).map((binByte) => parseInt(binByte, 2))
            );
            return new Guid(bytes);
        }
        throw Error(
            `Unable to parse valid v4 guid from ${guidString}. String was not valid bin/oct/dec/hex.`
        );
    }

    /**
     * Get a function that can serialize a byte.
     * @param base A valid numeric base (2-36)
     * @returns {ByteConverter} A function that can serialize a byte in the specified base.
     */
    public static getByteSerializer(base: number): ByteConverter {
        if (1 < base && base < 37) {
            // since 255 is the max value of a byte,
            // its width is what we should pad to.
            let width = BYTE_MAX.toString(base).length;
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
     * @throws {Error} Error from Guid.getByteSerializer if the base is invalid;
     * @see Guid.getByteSerializer Throws errors that are re-thrown.
     */
    public static memoize(base: number): string[] {
        try {
            if (!Guid.memoizedStrings[base]) {
                let converter = Guid.getByteSerializer(base);
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
     * Creates a COMB guid, which is guaranteed to be sequential and v4, while still being quite random.
     * This is the same approach as this... https://github.com/danielboven/ordered-uuid-v4/blob/main/src/stringify.js
     * but instead of copying hex strings, this is copying bytes.
     */
    public static newCombGuid(): Guid {
        const bytes = Guid.randomBytePool.getBytes(BYTES_IN_GUID);

        const dateNowMs = Date.now();
        const perfNow = performance.now();
        const combNow = (dateNowMs + perfNow + Guid.combIdx++) * 100;
        const roundNow = Math.round(combNow);

        for (let offset = 0; offset < 6; offset++) {
            const tgtIdx = 5 - offset;
            const shift = offset * 8;

            /**
             * This is a bit shifting operation. JS can only shift 32 bits
             * So this is using rounded, negative exponentiation to achieve the same result
             */
            bytes[tgtIdx] = Math.floor(roundNow * Math.pow(2, shift * -1)) & 255;
        }

        return Guid.fromBytes(bytes);
    }

    /**
     * Get a new, random GUID/UUID
     * @returns New guid built on random information.
     */
    public static newGuid(): Guid {
        return Guid.fromBytes(Guid.randomBytePool.getBytes(BYTES_IN_GUID));
    }

    /**
     * Sets the random byte pool to poolSize number of Guid's worth of random bytes.
     * For example, if poolSize is 1,
     * @param guidCount Set the random byte pool size.  Higher values call the randomization service less.
     */
    public static resizePool(guidCount: number): void {
        Guid.randomBytePool.resize(guidCount * BYTES_IN_GUID);
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
