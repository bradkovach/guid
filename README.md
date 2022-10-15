Zero-dependency RFC 4122-compliant GUID/UUID library written with TypeScript, modern crypto and a proper internal byte representation.

# Quick Start

## Install from npm

```bash
npm install --save @bradkovach/guid
```

## Create, Parse, Serialize!

```typescript
import { Guid } from '@bradkovach/guid';

// Create

// Random, valid v4 GUID/UUID
let guid = Guid.newGuid();

// Random, sequential v4 "COMB" GUID/UUID
// These are time based and also use an internal
// serial number to ensure that they are always sequential
// even if they are generated in a loop
let combGuid = Guid.newCombGuid();

// Empty GUID
let emptyGuid = Guid.Empty;

// Parse

// parse any guid-like string from bin/oct/dec/hex bases
let parsedFromString = Guid.fromString(myString);

// create a guid from existing byte array
let parsedFromBytes = Guid.fromBytes(myBytes);

// Serialize

// To hex
let hex = guid.toString();

// To decimal
let dec = guid.toString(10);

// To octal
let oct = guid.toString(8);

// To binary
let bin = guid.toString(2);
```

# Usage

Creation of new `Guid` instances is performed by calling static methods on the `Guid` class. `Guid` does not offer a public constructor.

## Static Methods

### Create from string

`Guid.fromString(guidString:string): Guid`

This library can parse GUID/UUID strings in binary, octal, decimal and hexadecimal formats and normalizes internally to accommodate lots of common formats, including braced (Microsoft-style), padded with whitespace inside braces, uppercase/lowercase variants.

```typescript
import { Guid } from '@bradkovach/guid';

// all will work
let guid0 = Guid.fromString('c87c33e1-f9a9-43a7-bebb-d33a70883dc6');
let guid1 = Guid.fromString('83870266-9493-42CE-9EE6-8F3AA9D04401');
let guid2 = Guid.fromString('{fa20be72-8325-42e8-b62b-149ba613edcd}');
let guid3 = Guid.fromString('{18F66861-F882-4E95-BDEE-9499C7022C63}');
let guid4 = Guid.fromString('{ fa20be72-8325-42e8-b62b-149ba613edcd }');
let guid5 = Guid.fromString('{ 18F66861-F882-4E95-BDEE-9499C7022C63 }');

// as a binary string
let guid6 = Guid.fromString(
    '10010111110000110101110110110111111110011010101001001101001000001011101111010011010000010000100111000000110011010000100111000110'
);
let guid7 = Guid.fromString(
    '{10010111110000110101110110110111111110011010101001001101001000001011101111010011010000010000100111000000110011010000100111000110}'
);
let guid8 = Guid.fromString(
    '{10010111110000110101110110110111111110011010101001001101001000001011101111010011010000010000100111000000110011010000100111000110}'
);
```

### Create from bytes

`Guid.fromBytes(bytes: Uint8Array): Guid`

The static `Guid.fromBytes(bytes)` method will construct a new Guid instance. `fromBytes` will set the version and variant bits, ensuring that the resulting Guid represents a valid v4 GUID/UUID.

```typescript
import { Guid } from '@bradkovach/guid';

// construct from existing 16-byte array
// This will set version and variant fields
let myBytes = getExistingGuidBytes();
let guid = Guid.fromBytes(myBytes);
```

### Memoization

Call static member `Guid.memoize(base)` to improve the performance of serialization. Internally, `Guid` caches the string representation for the base and byte value when `toString(base)` is called. In benchmarks, this improves serialization performance about 7x.

If you need to clear the memoized string store, call `Guid.clearMemoizedStrings()`.

### Serializing bytes

Call static `Guid.getByteSerializer(base)` to get a function that will turn a valid byte (number from 0-255) into a string representation in any supported javascript base (2-36).

```typescript
import { Guid } from '@bradkovach/guid';

const hexSerializer = Guid.getByteSerializer(16);
const hexString = [1, 2, 3, 4, 5].map(hexSerializer).join('');
```

### Resize random bytes pool

`Guid.resizePool(guidCount)`

If you intend to generate a lot of `Guid` instances (in a loop), you may want to resize the random byte pool to a larger number to improve performance.

By default the pool is large enough for 256 Guids. Provide a `guidCount` integer greater than zero to allocate `guidCount * BYTES_IN_GUID` bytes of random data. If the bytes are used, the pool will refill with new random data.

The random bytes pool is not accessible publicly, but the `RandomBytesPool` class is available.

## Instance Methods

These methods can be called on a `Guid` instance.

### `toBytes(): Uint8Array`

Returns a copy of the internal byte array.

### `toString(base: number = 16): string`

Returns a string representing the Guid in your chosen base. This can be called with any supported JS base from 2 through 36. Unit tests support bin/oct/dec/hex.

Generated GUID/UUID strings will include hyphens. Use the `normalizeGuidString` utility to strip these hyphens.

```typescript
import { Guid } from '@bradkovach/guid';

let guid = Guid.newGuid();

let bin = guid.toString(2);
let oct = guid.toString(8);
let dec = guid.toString(10);
let hex = guid.toString(16);
```

### `valueOf(): BigInt`

Converts the Guid into a BigInt. Creating Guid instances from a `BigInt` is not supported, however, the following should produce a string that can be parsed by `Guid.fromString()`.

```typescript
let bigInt = Guid.newGuid().valueOf();
let hexGuid = bigInt.toString(16).padStart(32, '0');
let cloned = Guid.fromString(hexGuid);
```

## Equality and Comparison

When you're working with COMB Guid instances, or guids created from comb guids, you can compare using less-than/greater-than. This could be useful for comparing Correlation IDs to compare which correlation ID happened first.

```typescript
import { Guid } from '@bradkovach/guid';

let guidOne = Guid.newCombGuid();
let guidTwo = Guid.newCombGuid();

// compare using LT/GT
let isLessThan = guidOne < guidTwo; // true
let isGreaterThan = guidOne > guidTwo; // false

// compare value equality
let guidOneClone = Guid.fromBytes(guidOne.toBytes());
let isEqualValue = guidOne.valueOf() === guidOneClone.valueOf(); // true

// compare object identity
let isEqualIdentity = guidOne === guidOneClone; // false
```

## Helpful Constants

A number of constants are available. These should be used to cut down on arbitrary magic numbers.

### `BYTES_IN_GUID: number = 16`

Used for instantiating arrays.

### `BYTE_MIN: number = 0`

Minimum valid value of a byte. Used for comparing byte values and to make code intent clearer.

### `BYTE_MAX: number = 255`

Maximum valid value of a byte. Used for comparing byte values and to make code intent clearer.

## Class `RandomBytePool`

`Guid` uses a private static instance of `RandomBytePool` to manage its random data. `RandomBytePool` can be instantiated and used if you want a source of random bytes. `RandomBytePool` is a standalone class to ensure 100% test coverage of its functionality.

The pool will automatically resize itself if `getBytes(count)` is called with a count greater than the length of the pool. `Guid` uses `RandomBytePool` by allocating in increments of `BYTES_IN_GUID`, and it reads values in these increments as well. Although even multiples aren't required when reading bytes with `getBytes(count)`, this is the most efficient memory allocation.

The pool can be resized after instantiation by calling `resize(newSize)`. This can be used to shrink or expand the pool.

```typescript --run
import { RandomBytePool, BYTES_IN_GUID } from '@bradkovach/guid';

// instantiate with 256 bytes
let rbp = new RandomBytePool(256);

// => returns 5 random bytes
let five = rbp.getBytes(5);

// => returns 1024 bytes, after resizing the pool.
let tooMany = rbp.getBytes(1024);

// resizes the pool to 128 Guids worth of random bytes
rbp.resize(128 * BYTES_IN_GUID);

// Returns false when the pool hasn't
// yet been read from.
let isInitialized = rbp.initialized;

// Returns the length of the internal array
console.log(rbp.length);

// Returns the index of the next random byte
console.log(rbp.currentIdx);
```

## Utilities

These functions are used internally by `Guid` to safely verify and normalize strings before parsing. If you are dealing with inconsistent data, these functions may be helpful.

```typescript
import * as util from '@bradkovach/guid/util';

// or

import { ensureByte, isValidVersion4GuidForBase, normalizeGuidString } from '@bradkovach/guid/util';
```

### `util.ensureByte(byte): void`

Throws an error when `byte` is not a number between 0 and 255, inclusive. Can be used to stop execution of code.

### `util.isValidVersion4GuidForBase(guid, base): boolean`

Normalizes and tests a guid string for validity in the provided base. Should work in all JS bases, but is tested in 2, 8, 10 and 16.

### `util.normalizeGuidString(guid): string`

Normalizes a guid string by trimming, removing braces, removing hyphens and returning lowercase.

# Acknowledgements

I used the following resources to learn everything there is to know about the RFC 4122 standard, and its implementation.

-   [IETF RFC 4122](https://www.ietf.org/rfc/rfc4122.txt)
-   [uuidjs/uuid](https://github.com/uuidjs/uuid/)
-   [Generate a UUID compliant with RFC 4122](https://www.cryptosys.net/pki/uuid-rfc4122.html)
-   [Add a header containing a correlation id](https://learn.microsoft.com/en-us/azure/api-management/policies/add-correlation-id)

# Contributing

Pull requests are welcome! Please ensure that new code includes test coverage.

```bash
# clone with http
https://github.com/bradkovach/guid.git

# clone with ssh
git clone git@github.com:bradkovach/guid.git

# open
cd guid

# restore packages
npm install

# run tests in watch mode
# probably the fastest way to develop
npm run test:watch

# check code coverage
npm run test:coverage

# build artifacts using bradkovach-guid-test package name
# this can be linked with `npm link` and used in another
# test project with `npm link bradkovach-guid-test`
npm run build-dev

# build artifacts using @bradkovach/guid package name
npm run build-prod
```

# Motivation

-   Provide a proper TypeScript implementation of UUID/GUID generation using byte arrays.
-   Sharpen skills working with bits/bytes in TS/JS.
-   Build a high-performance COMB Guid implementation that I can use for logging.
