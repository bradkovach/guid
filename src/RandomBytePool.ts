import { getRandomValues } from './util/getRandomValues';
import { BYTES_IN_GUID } from './Guid';

/**
 * Manages a pool of random bytes.  Used as a private, static member.
 */

export class RandomBytePool {
    /**
     * Pool of random bytes maintained to speed up Guid creation.
     */
    private _bytes: Uint8Array;
    
    /**
     * Pointer to the next random byte in the internal array.
     */
    private _currentIdx: number = 0;

    /**
     * Build a new RandomBytePool with a specified number of bytes.
     * @param poolLength Initial size of the pool
     */
    constructor(poolLength: number) {
        this.resize(poolLength);
    }

    /**
     * Returns the current pointer to the next random byte.
     * @readonly
     */
    public get currentIdx(): number {
        return this._currentIdx;
    }

    /**
     * Returns true when the internal array is filled with any non-zero values.
     */
    public get initialized(): boolean {
        return !this._bytes.every(byte => byte === 0);
    }

    /**
     * The length of the internal bytes array.
     */
    public get length(): number {
        return this._bytes.length;
    }

    /**
     * The current index/pointer of the internal pointer.
     */
    private set currentIdx(idx: number){
        this._currentIdx = idx;
    }

    /**
     * Get random bytes from the random byte pool.
     * @param byteCount Number of bytes to return from the random pool
     * @returns Byte array filled with byteCount random bytes.
     */
    public getBytes(byteCount: number = BYTES_IN_GUID): Uint8Array {
        /**
         * If the pool is too small, make a one-off byte array.
         */
        if (byteCount > this._bytes.length) {
            this.resize(byteCount);
        }

        if (this.currentIdx > this._bytes.length - byteCount) {
            getRandomValues(this._bytes);
            this.currentIdx = 0;
        }
        return this._bytes.slice(this.currentIdx, (this.currentIdx += byteCount));
    }

    /**
     * Resizes the internal array, and sets the pointer to the end.
     * @param length Number of bytes to instantiate in the pool.
     * @returns void
     */
    public resize(length: number): void {
        if (0 < length && Number.isInteger(length)) {
            this._bytes = new Uint8Array(length);
            this.currentIdx = length;
            return;
        }
        throw Error('Pool length must be a non-negative integer.');
    }
}
