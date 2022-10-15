import { BYTE_MAX, BYTE_MIN } from "../Guid";

/**
 * Use to block/stop execution if a number cannot be represented in a byte (0-255)
 * @param byte A number to be evaluated as a byte
 */
export function ensureByte(byte: number) {
    if (byte < BYTE_MIN || byte > BYTE_MAX) {
        throw Error(`Supplied number is not a valid byte. Value ${byte} is not in range 0 to 255.`);
    }
}
