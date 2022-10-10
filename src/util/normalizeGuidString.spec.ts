import {expect} from 'chai';
import { normalizeGuidString } from './normalizeGuidString';

const uglyGuids = [
    '     {a1c63aa1-e77a-4f15-9a3d-87b86a1c202d}', // outside left 
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

describe('normalizeGuidString', () => {
    it('should strip hyphens, braces, and lowercase all valid but ugly GUID/UUID strings', () => {
        uglyGuids.forEach((guidString) => {
            const normalized = normalizeGuidString(guidString);
            expect(normalized).to.equal('a1c63aa1e77a4f159a3d87b86a1c202d');
            expect(normalized.length).to.equal(32);
        });
    });
});