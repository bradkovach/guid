import { expect } from 'chai';
import { Guid } from './Guid';

global.crypto = require('crypto').webcrypto;

const uglyGuids = [
    '     {a1c63aa1-e77a-4f15-9a3d-87b86a1c202d}', // outside left 
    // 10100001110001100011101010100001111001110111101001010000000000000000000000000000000000000000000000000000000000000000000000000000
    // 10100001110001100011101010100001111001110111101001001111000101011001101000111101100001111011100001101010000111000010000000101101
    '{     a1c63aa1-e77a-4f15-9a3d-87b86a1c202d}', // inside left
    '     {     a1c63aa1-e77a-4f15-9a3d-87b86a1c202d}', // both left
    '{a1c63aa1-e77a-4f15-9a3d-87b86a1c202d}     ', // outside right
    '{a1c63aa1-e77a-4f15-9a3d-87b86a1c202d     }', // inside right
    '{a1c63aa1-e77a-4f15-9a3d-87b86a1c202d     }     ', // both right

    '     {A1C63AA1-E77A-4F15-9A3D-87B86A1C202D}', // OUTSIDE LEFT
    '{     A1C63AA1-E77A-4F15-9A3D-87B86A1C202D}', // INSIDE LEFT
    '     {     A1C63AA1-E77A-4F15-9A3D-87B86A1C202D}', // BOTH LEFT
    '{A1C63AA1-E77A-4F15-9A3D-87B86A1C202D}     ', // OUTSIDE RIGHT
    '{A1C63AA1-E77A-4F15-9A3D-87B86A1C202D     }', // INSIDE RIGHT
    '{A1C63AA1-E77A-4F15-9A3D-87B86A1C202D     }     ', // BOTH RIGHT

    '     {a1c63aa1-e77a-4f15-9a3d-87b86a1c202d}     ', // outside all
    '{     a1c63aa1-e77a-4f15-9a3d-87b86a1c202d     }', // inside all
    '     {     a1c63aa1-e77a-4f15-9a3d-87b86a1c202d     }     ', // both all

    '     {A1C63AA1-E77A-4F15-9A3D-87B86A1C202D}     ', // OUTSIDE ALL
    '{     A1C63AA1-E77A-4F15-9A3D-87B86A1C202D     }', // INSIDE ALL
    '     {     A1C63AA1-E77A-4F15-9A3D-87B86A1C202D     }     ', // BOTH ALL
];

const invalidVersions = [
    '     {a1c63aa1-e77a-af15-9a3d-87b86a1c202d}', // outside left
    '{     a1c63aa1-e77a-af15-9a3d-87b86a1c202d}', // inside left
    '     {     a1c63aa1-e77a-af15-9a3d-87b86a1c202d}', // both left
    '{a1c63aa1-e77a-af15-9a3d-87b86a1c202d}     ', // outside right
    '{a1c63aa1-e77a-af15-9a3d-87b86a1c202d     }', // inside right
    '{a1c63aa1-e77a-af15-9a3d-87b86a1c202d     }     ', // both right

    '     {A1C63AA1-E77A-AF15-9A3D-87B86A1C202D}', // OUTSIDE LEFT
    '{     A1C63AA1-E77A-AF15-9A3D-87B86A1C202D}', // INSIDE LEFT
    '     {     A1C63AA1-E77A-AF15-9A3D-87B86A1C202D}', // BOTH LEFT
    '{A1C63AA1-E77A-AF15-9A3D-87B86A1C202D}     ', // OUTSIDE RIGHT
    '{A1C63AA1-E77A-AF15-9A3D-87B86A1C202D     }', // INSIDE RIGHT
    '{A1C63AA1-E77A-AF15-9A3D-87B86A1C202D     }     ', // BOTH RIGHT

    '     {a1c63aa1-e77a-af15-9a3d-87b86a1c202d}     ', // outside all
    '{     a1c63aa1-e77a-af15-9a3d-87b86a1c202d     }', // inside all
    '     {     a1c63aa1-e77a-af15-9a3d-87b86a1c202d     }     ', // both all

    '     {A1C63AA1-E77A-AF15-9A3D-87B86A1C202D}     ', // OUTSIDE ALL
    '{     A1C63AA1-E77A-AF15-9A3D-87B86A1C202D     }', // INSIDE ALL
    '     {     A1C63AA1-E77A-AF15-9A3D-87B86A1C202D     }     ', // BOTH ALL
];

const invalidVariants = [
    '     {a1c63aa1-e77a-af15-1a3d-87b86a1c202d}', // outside left
    '{     a1c63aa1-e77a-af15-1a3d-87b86a1c202d}', // inside left
    '     {     a1c63aa1-e77a-af15-1a3d-87b86a1c202d}', // both left
    '{a1c63aa1-e77a-af15-1a3d-87b86a1c202d}     ', // outside right
    '{a1c63aa1-e77a-af15-1a3d-87b86a1c202d     }', // inside right
    '{a1c63aa1-e77a-af15-1a3d-87b86a1c202d     }     ', // both right

    '     {a1c63aa1-e77a-af15-1a3d-87b86a1c202d}     ', // outside all
    '{     a1c63aa1-e77a-af15-1a3d-87b86a1c202d     }', // inside all
    '     {     a1c63aa1-e77a-af15-1a3d-87b86a1c202d     }     ', // both all

    '     {A1C63AA1-E77A-AF15-1A3D-87B86A1C202D}', // OUTSIDE LEFT
    '{     A1C63AA1-E77A-AF15-1A3D-87B86A1C202D}', // INSIDE LEFT
    '     {     A1C63AA1-E77A-AF15-1A3D-87B86A1C202D}', // BOTH LEFT
    '{A1C63AA1-E77A-AF15-1A3D-87B86A1C202D}     ', // OUTSIDE RIGHT
    '{A1C63AA1-E77A-AF15-1A3D-87B86A1C202D     }', // INSIDE RIGHT
    '{A1C63AA1-E77A-AF15-1A3D-87B86A1C202D     }     ', // BOTH RIGHT

    '     {A1C63AA1-E77A-AF15-1A3D-87B86A1C202D}     ', // OUTSIDE ALL
    '{     A1C63AA1-E77A-AF15-1A3D-87B86A1C202D     }', // INSIDE ALL
    '     {     A1C63AA1-E77A-AF15-1A3D-87B86A1C202D     }     ', // BOTH ALL
];

const supportedOutputBases = (function () {
    let bases: number[] = [];
    for (let i = 2; i < 37; i++) {
        bases.push(i);
    }
    return bases;
})();

describe('public static methods', () => {
    describe('Empty', () => {
        let nullGuid = Guid.Empty;
        it('should return the null GUID/UUID as an object', () => {
            expect(nullGuid).to.be.instanceOf(Guid);
            expect(nullGuid.toString()).to.equal('00000000-0000-0000-0000-000000000000');
        });

        it('toBytes() should return 16 bytes, each 0', () => {
            nullGuid.toBytes().forEach((byte) => expect(byte).to.equal(0));
        });

        it('toString() should return the null GUID/UUID string in binary', () => {
            // 111111111111111111111111111111111111111111111111
            expect(nullGuid.toString(2)).to.equal(
                [
                    '0'.repeat(32),
                    '0'.repeat(16),
                    '0'.repeat(16),
                    '0'.repeat(16),
                    '0'.repeat(48),
                ].join('-')
            );
        });

        it('toString() should return the null GUID/UUID string in octal', () => {
            expect(nullGuid.toString(8)).to.equal(
                ['0'.repeat(12), '0'.repeat(6), '0'.repeat(6), '0'.repeat(6), '0'.repeat(18)].join(
                    '-'
                )
            );
        });
    });

    describe('fromBytes()', () => {
        it('should throw when a too-short byte array is provided', () => {
            let notEnoughBytes = new Uint8Array(1);
            notEnoughBytes.fill(0);
            expect(() => {
                return Guid.fromBytes(notEnoughBytes);
            }).to.throw(Error);
        });

        it('should throw when a too-long byte array is provided', () => {
            let tooManyBytes = new Uint8Array(17);
            tooManyBytes.fill(0);
            expect(() => {
                return Guid.fromBytes(tooManyBytes);
            }).to.throw(Error);
        });

        it('should set version and variant', () => {
            let byteArray = new Uint8Array(16);
            crypto.getRandomValues(byteArray);
            byteArray[6] = 0;
            byteArray[8] = 0;
            let guid = Guid.fromBytes(byteArray.slice());
            let guidBytes = guid.toBytes();

            expect(guidBytes[6]).to.not.equal(0, 'byte 6 was not enforced');
            expect(guidBytes[8]).to.not.equal(0, 'byte 8 was not enforce');
        });
    });

    describe('fromString()', () => {
        it('should return valid GUID/UUID with uppercase-hyphenated hex GUIDs', () => {
            let uppercase = 'AAAAAAAA-AAAA-4AAA-BAAA-AAAAAAAAAAAA';
            let guid = Guid.fromString(uppercase);
            expect(guid).to.be.instanceOf(Guid);
            expect(guid.toString()).to.equal('aaaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa');
        });
        it('should return valid GUID/UUID with lowercase-hyphenated hex GUIDs', () => {
            let lowercase = 'aaaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa';
            let guid = Guid.fromString(lowercase);
            expect(guid).to.be.instanceOf(Guid);
            expect(guid.toString()).to.equal('aaaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa');
        });
        it('should return valid GUID/UUID with binary string', () => {
            let binary =
                '10101010' + // 0
                '10101010' + // 1
                '10101010' + // 2
                '10101010' + // 3
                '10101010' + // 4
                '10101010' + // 5
                '01001010' + // 6 -- a special byte (first four must be 0100)
                '10101010' + // 7
                '10111010' + // 8 -- a special byte (first two must be 10)
                '10101010' + // 9
                '10101010' + // 10
                '10101010' + // 11
                '10101010' + // 12
                '10101010' + // 13
                '10101010' + // 14
                '10101010' + // 15
                ''; // omg i had to make the numbers above line up.
            let guid = Guid.fromString(binary);
            expect(guid).to.be.instanceOf(Guid);
            expect(guid.toString()).to.equal('aaaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa');
        });

        it('should throw when constructing from an invalid string', () => {
            let notValidGuidString = 'NOT A VALID GUID STRING';
            expect(() => Guid.fromString(notValidGuidString)).to.throw(Error);
        });
    });

    describe('getByteConverter', () => {
        it('should return a byte converter for supported bases', () => {
            expect(() =>
                supportedOutputBases.map((base) => Guid.getByteConverter(base))
            ).to.not.throw();

            expect(() => Guid.getByteConverter(37)).to.throw(Error);
        });

        it('should convert to binary strings', () => {
            let base = 2;
            let toBinary = Guid.getByteConverter(base);
            let zero = toBinary(0);
            let basePlus1 = toBinary(base + 1);
            let endOfByte = toBinary(255);

            expect(zero).to.equal('00000000');
            expect(basePlus1).to.equal('00000011');
            expect(endOfByte).to.equal('11111111');
        });

        it('should convert to octal strings', () => {
            let base = 8;
            let toOctal = Guid.getByteConverter(base);
            let zero = toOctal(0);
            let basePlus1 = toOctal(base + 1);
            let endOfByte = toOctal(255);

            expect(zero).to.equal('000');
            expect(basePlus1).to.equal('011');
            expect(endOfByte).to.equal('377');
        });

        it('should convert to decimal strings', () => {
            let base = 10;
            let toDecimal = Guid.getByteConverter(base);
            let zero = toDecimal(0);
            let basePlus1 = toDecimal(base + 1);
            let endOfByte = toDecimal(255);

            expect(zero).to.equal('000');
            expect(basePlus1).to.equal('011');
            expect(endOfByte).to.equal('255');
        });

        it('should convert to hexadecimal strings', () => {
            let base = 16;
            let toHex = Guid.getByteConverter(base);
            let zero = toHex(0);
            let basePlus1 = toHex(base + 1);
            let endOfByte = toHex(255);

            expect(zero).to.equal('00');
            expect(basePlus1).to.equal('11');
            expect(endOfByte).to.equal('ff');
        });

        it('should throw Error when non-byte numbers are passed', () => {
            let belowRange = 0 - 1;
            let aboveRange = 0b11111111 + 1;
            expect(() => {
                let convertToBinary = Guid.getByteConverter(2);
                convertToBinary(belowRange);
            }).to.throw(Error);
            expect(() => {
                let convertToBinary = Guid.getByteConverter(2);
                convertToBinary(aboveRange);
            }).to.throw(Error);
        });
    });

    describe('isHexString', () => {
        // adequately tested by other tests
    });

    describe('isValidV4HexString', () => {
        it('should validate GUID/UUID strings with braces and optional whitespace', () => {
            uglyGuids.forEach((guidString) => {
                let isValid = Guid.isValidV4HexString(guidString);
                expect(isValid).to.be.true;
            });
        });

        it('should NOT validate GUID/UUID strings with invalid version field', () => {
            invalidVersions.forEach((guidString) => {
                let isValid = Guid.isValidV4HexString(guidString);
                expect(isValid).to.be.false;
            });
        });

        it('should NOT validate GUID/UUID strings with invalid variant field', () => {
            invalidVariants.forEach((guidString) => {
                let isValid = Guid.isValidV4HexString(guidString);
                expect(isValid).to.be.false;
            });
        });

        it('should NOT validate empty strings', () => {
            let isValid = Guid.isValidV4HexString('');
            expect(isValid).to.be.false;
        });

        it('should NOT validate if any non-hex characters are present', () => {
            let isValid = Guid.isValidV4HexString('a1c63aa1-e77a-4f1z-9a3d-87b86a1c202d');
            expect(isValid).to.be.false;
        });
    });

    describe('memoize', () => {
        it('should throw if attempting to memoize an base less than 2', () => {
            expect(() => Guid.memoize(1)).to.throw();
        });

        it('should throw if attempting to memozie a base greater than 36', () => {
            expect(() => Guid.memoize(37)).to.throw();
        });

        it('should serialize faster if the base is memoized', () => {
            const rounds = 15;

            const startUnmemoized = performance.now();
            for (let i = 0; i < rounds; i++) {
                Guid.clearMemoizedStrings();
                const guid = Guid.newGuid();
                const string = guid.toString();
                expect(string.length).to.equal(36);
            }
            const endUnmemoized = performance.now();

            Guid.memoize(16);
            const startMemoized = performance.now();
            for (let i = 0; i < rounds; i++) {
                const guid = Guid.newGuid();
                const string = guid.toString();
                expect(string.length).to.equal(36);
            }
            const endMemoized = performance.now();

            const durationUnmemoized = endUnmemoized - startUnmemoized;
            const durationMemoized = endMemoized - startMemoized;

            expect(durationMemoized).to.be.lessThan(durationUnmemoized);
        });
    });

    describe('newCombGuid', () => {
        it('should produce valid v4 GUID/UUID', () => {
            let combGuid = Guid.newCombGuid();
            let combString = combGuid.toString();
            expect(Guid.isValidV4HexString(combString)).to.be.true;
        });

        it('should produce sequential values', async () => {
            const snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

            const combGuids: Guid[] = [];
            for await (const num of [0, 1, 2, 3, 4]) {
                combGuids.push(Guid.newCombGuid());
                await snooze(1 + num * 0);
            }

            expect(combGuids.length).to.be.equal(5, 'comb guids did not populate properly.');

            expect(
                combGuids.every((curr, idx, all) => {
                    if (idx === 0) return true;

                    const last = all[idx - 1];
                    return last.valueOf() < curr.valueOf();
                })
            ).to.be.true;
        });
    });

    describe('newGuid()', () => {
        it('should allow a new, random GUID/UUID to be created.', () => {
            const guid = Guid.newGuid();
            expect(guid.toString()).to.length(36);
        });
    });

    describe('normalizeGuidString', () => {
        it('should strip hyphens, braces, and lowercase all valid but ugly GUID/UUID strings', () => {
            uglyGuids.forEach((guidString) => {
                const normalized = Guid.normalizeGuidString(guidString);
                expect(normalized).to.equal('a1c63aa1e77a4f159a3d87b86a1c202d');
                expect(normalized.length).to.equal(32);
            });
        });
    });

    describe('isValidGuidForBase', () => {
        const guid = Guid.fromString('ac0c6a94-c873-4dea-894c-a1ff614536ba');
        it('should validate hexadecimal', () => {
            ['8', '9', 'a', 'b'].forEach((variant) => {
                let guidStr = `ac0c6a94-c873-4dea-${variant}94c-a1ff614536ba`;
                let isValidHex = Guid.isValidGuidForBase(guidStr, 16);
                expect(isValidHex, `assertion failed with variant '${variant}'`).to.be.true;
            });
        });

        it('should validate decimal', () => {
            const dec = guid.toString(10);
            let isValidDec = Guid.isValidGuidForBase(dec, 10);
            expect(isValidDec).to.be.true;
        });

        it('should validate binary', () => {
            const bin = guid.toString(2);
            let isValidBin = Guid.isValidGuidForBase(bin, 2);
            expect(isValidBin).to.be.true;
        });
    });
});

describe('public instance methods', () => {
    describe('toBytes()', () => {
        it('should return copies of the byte array', () => {
            let guid = Guid.newGuid();
            let bytes1 = guid.toBytes();
            let bytes2 = guid.toBytes();

            expect(bytes1 === bytes2).to.be.false;
        });
    });

    describe('toString()', () => {
        it('should return a GUID/UUID string in any supported JS base', () => {
            let guid = Guid.newGuid();
            supportedOutputBases.forEach((base) => {
                expect(() => guid.toString(base)).to.not.throw();
            });
        });
    });

    describe('valueOf()', () => {
        it('should allow different object and value equality comparison', () => {
            let guidStr = '50d800ac-9a47-4684-8f31-9f651eab9492';
            let guidOne = Guid.fromString(guidStr);
            let guidTwo = Guid.fromString(guidStr);

            // not the same instance
            let isSameObject = Object.is(guidOne, guidTwo);
            expect(isSameObject).to.be.false;

            // not the same identity
            let isSameValue = guidOne === guidTwo;
            expect(isSameValue).to.be.false;

            // but same value
            let isEqualPrimitive = guidOne.valueOf() === guidTwo.valueOf();
            expect(isEqualPrimitive).to.be.true;
        });

        it('should allow greater than comparison', () => {
            let guidOne = Guid.newCombGuid();
            let guidTwo = Guid.newCombGuid();
            let isGreaterThan = guidTwo > guidOne;

            expect(isGreaterThan).to.be.true;
        });

        it('should allow less than comparison', () => {
            let guidOne = Guid.newCombGuid();
            let guidTwo = Guid.newCombGuid();
            let isLessThan = guidOne < guidTwo;

            expect(isLessThan).to.be.true;
        });
    });
});
