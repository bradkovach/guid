import { expect } from 'chai';
import { ensureByte } from './ensureByte';

describe('ensureByte(byte)', () => {
    it('should throw errors when values < 0 are supplied', () => {
        expect(() => ensureByte(-1)).to.throw(Error);
        expect(() => ensureByte(Number.MIN_SAFE_INTEGER)).to.throw(Error);
    });

    it('should throw errors when values > 255 are supplied', () => {
        expect(() => ensureByte(256)).to.throw(Error);
        expect(() => ensureByte(Number.MAX_SAFE_INTEGER)).to.throw(Error);
    });

    it('should do nothing when a valid value is supplied', ()=>{
        for(let byte = 0; byte < 256; byte++) {
            expect(ensureByte(byte)).to.equal(void 0);
        }
    })
});
