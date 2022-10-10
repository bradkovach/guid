import { expect } from 'chai';

import { Guid } from '../Guid';
import { isValidVersion4GuidForBase } from './isValidVersion4GuidForBase';

describe('isValidVersion4GuidForBase', () => {
    const guid = Guid.fromString('ac0c6a94-c873-4dea-894c-a1ff614536ba');

    it('should fail hex when version is not 4', () => {
        for (let digit = 0; digit < 16; digit++) {
            if (digit === 4) {
                continue;
            }
            const version = digit.toString(16);
            const guidStr = `ac0c6a94-c873-${version}dea-894c-a1ff614536ba`;
            let isValidHex = isValidVersion4GuidForBase(guidStr, 16);

            expect(isValidHex, `assertion failed with version ${version}`).to.be.false;
        }
    });

    it('should fail hex when variant is not 8,9,a,b', () => {
        for (let digit = 0; digit < 16; digit++) {
            if (8 <= digit && digit <= 11) {
                continue;
            }
            const variant = digit.toString(16);
            const guidStr = `ac0c6a94-c873-4dea-${variant}94c-a1ff614536ba`;
            let isValidHex = isValidVersion4GuidForBase(guidStr, 16);

            expect(isValidHex, `assertion failed with variant ${variant}`).to.be.false;
        }
    });

    it('should validate hexadecimal', () => {
        ['8', '9', 'a', 'b'].forEach((variant) => {
            let guidStr = `ac0c6a94-c873-4dea-${variant}94c-a1ff614536ba`;
            let isValidHex = isValidVersion4GuidForBase(guidStr, 16);
            expect(isValidHex, `assertion failed with variant '${variant}'`).to.be.true;
        });
    });

    it('should validate decimal', () => {
        const dec = guid.toString(10);
        let isValidDec = isValidVersion4GuidForBase(dec, 10);
        expect(isValidDec).to.be.true;
    });

    it('should validate octal', () => {
        const oct = guid.toString(8);
        let isValidOct = isValidVersion4GuidForBase(oct, 8);
        expect(isValidOct).to.be.true;
    });

    it('should validate binary', () => {
        const bin = guid.toString(2);
        let isValidBin = isValidVersion4GuidForBase(bin, 2);
        expect(isValidBin).to.be.true;
    });

    it('should fail bin/oct/dec/hex when length is wrong', () => {
        [2, 8, 10, 16].forEach((base) => {
            const largestDigit = (base - 1).toString(base);
            const guidString = guid.toString(base) + largestDigit;
            let isValidGuidForBase = isValidVersion4GuidForBase(guidString, base);
            expect(
                isValidGuidForBase,
                `assertion failed with base ${base} with extra '${largestDigit}' appended`
            ).to.be.false;
        });
    });

    it('should fail bin/oct/dex/hex when invalid chars are present', () => {
        [2, 8, 10, 16].forEach((base) => {
            const invalidDigit = base.toString(base + 1);
            const guidCharArray = guid.toString(base).split('');
            const replaceIdx = guidCharArray.length - 1;
            guidCharArray[replaceIdx] = invalidDigit;
            const guidString = guidCharArray.join('');
            let isValidGuidForBase = isValidVersion4GuidForBase(guidString, base);
            expect(
                isValidGuidForBase,
                `assertion failed for base ${base} with last char replaced with ${invalidDigit}`
            ).to.be.false;
        });
    });

    it('should use hexadecimal by default', () => {
        const invalidDigit = (16).toString(17);
        const validDigit = (15).toString(16);

        let validStr = `ac0c6a94-c873-4dea-894c-a1ff614536b${validDigit}`;
        let invalidStr = `ac0c6a94-c873-4dea-894c-a1ff614536b${invalidDigit}`;

        expect(isValidVersion4GuidForBase(validStr), 'assertion failed for valid guid').to.be.true;
        expect(isValidVersion4GuidForBase(invalidStr), `assertion failed for invalid guid`).to.be.false;
    });
});
