import { expect } from 'chai';
import { BYTES_IN_GUID, BYTE_MAX, BYTE_MIN } from './Guid';
import { RandomBytePool } from './RandomBytePool';

describe('RandomBytePool', () => {
    it('should give 16 bytes by default', () => {
        let pool = new RandomBytePool(BYTES_IN_GUID * BYTES_IN_GUID);
        let bytes = pool.getBytes();
        expect(bytes.length).to.equal(16);
    });

    it('should increment currentIdx every time getBytes() is called', () => {
        const guidsInPool = 4;
        const numberOfIterations = guidsInPool * guidsInPool;
        const pool = new RandomBytePool(BYTES_IN_GUID * guidsInPool);
        expect(pool.currentIdx, 'assertion failed at initialization').to.equal(
            BYTES_IN_GUID * guidsInPool
        );
        for (let i = 0; i < numberOfIterations; i++) {
            const expectedIdx = (i % guidsInPool) + 1;
            pool.getBytes();
            expect(pool.currentIdx, `assertion failed on call ${expectedIdx}`).to.equal(
                BYTES_IN_GUID * expectedIdx
            );
        }
    });

    it('should throw on a length < 0', () => {
        expect(() => new RandomBytePool(-1)).to.throw(Error);
    });

    it('should throw on a non-integer', () => {
        expect(() => new RandomBytePool(404.41)).to.throw(Error);
    });

    it('should be empty until getBytes is called', () => {
        let pool = new RandomBytePool(16);
        expect(pool.initialized).to.be.false;

        let bytes = pool.getBytes(4);
        expect(pool.initialized).to.be.true;

        bytes.forEach((byte) => {
            expect(byte, `assertion failed with byte ${byte}`).to.be.greaterThanOrEqual(BYTE_MIN);
            expect(byte).to.be.lessThanOrEqual(BYTE_MAX);
        });
    });

    it("should expand the pool if it can't get the requested number from existing pool", () => {
        let pool = new RandomBytePool(4);
        expect(pool.length).to.equal(4);
        let bytes = pool.getBytes(256);
        expect(bytes.length).to.equal(256);
    });
});
