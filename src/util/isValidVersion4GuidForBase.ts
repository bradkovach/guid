import { normalizeGuidString } from './normalizeGuidString';

/**
 * Test a string to see if it is a valid V4 GUID/UUID encoded in a specific base.
 * @param guidString A GUID/UUID string that is encoded in a base between 2 and 36
 * @param base base between 2 and 36
 * @returns true, when the guidString is valid
 */

export function isValidVersion4GuidForBase(guidString: string, base: number = 16): boolean {
    const normalizedGuidString = normalizeGuidString(guidString);
    // get started w/ string lengths
    const byteWidth = (255).toString(base).length;
    const expectedWidth = byteWidth * 16;
    if (expectedWidth !== normalizedGuidString.length) {
        return false;
    }

    // this only validates the alphabets
    const alphabet = Array.apply(null, { length: base })
        .map(eval.call, Number)
        .map((num) => num.toString(base));
    const regExp = new RegExp(`^[${alphabet.join('')}]{${expectedWidth}}$`, 'i');
    if (!regExp.test(normalizedGuidString)) {
        return false;
    }

    // extract the required bytes
    const byte6str = normalizedGuidString.slice(6 * byteWidth, 7 * byteWidth);
    const byte8str = normalizedGuidString.slice(8 * byteWidth, 9 * byteWidth);

    // parse version and variant
    const byte6 = parseInt(byte6str, base);
    const byte8 = parseInt(byte8str, base);
    const version = (byte6 & 0b11110000) >> 4;
    const variant = (byte8 & 0b11000000) >> 6;

    if (version !== 4 || variant !== 2) {
        return false;
    }

    return true;
}
