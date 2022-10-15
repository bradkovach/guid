declare global {
    interface Window {
        msCrypto?: Crypto;
    }
}

/**
 * Use this during development. It provides types.
 */
// import * as nodeCrypto from 'node:crypto';

/**
 * Use during production. This is the same thing, but it doesn't
 * use types provided by the @types/node package
 */
const nodeCrypto = require('node:crypto');

/**
 * Flattens browser/node crypto API
 * @param byteArray Byte array to fill with random data.
 * @returns Byte array filled with random data.
 */
export function getRandomValues(byteArray: Uint8Array ): Uint8Array {
    if(typeof window !== 'undefined'){
        if(window.crypto){
            return window.crypto.getRandomValues(byteArray);
        }
        if(window.msCrypto){
            return window.msCrypto.getRandomValues(byteArray);
        }
    } else if(typeof nodeCrypto !== 'undefined') {
        return nodeCrypto.randomFillSync(byteArray);
    }
    throw Error('Unable to find crypto engine. Please set window.crypto or global.crypto and try again');
}