Zero-dependency RFC 4122-compliant GUID/UUID library written with TypeScript, modern crypto and a proper byte.

# Quick Start

## Install from npm

```bash
npm install --save @bradkovach/guid
```

## Create new, random Guid instances

```typescript
import { Guid } from '@bradkovach/guid';

// Random, valid v4 GUID/UUID
let guid = Guid.newGuid();

// Random, sequential v4 "COMB" GUID/UUID
let combGuid = Guid.newCombGuid();
```

## Parse an existing GUID/UUID string int a Guid instance

This library can parse GUID/UUID strings in binary and hexadecimal and normalizes internally to accommodate lots of common formats, including braced (Microsoft-style), padded with whitespace inside braces, uppercase/lowercase variants.

```typescript
import { Guid } from '@bradkovach/guid';

// all are valid
let guid0 = Guid.fromString('c87c33e1-f9a9-43a7-bebb-d33a70883dc6');
let guid1 = Guid.fromString('83870266-9493-42CE-9EE6-8F3AA9D04401');
let guid2 = Guid.fromString('{fa20be72-8325-42e8-b62b-149ba613edcd}');
let guid3 = Guid.fromString('{18F66861-F882-4E95-BDEE-9499C7022C63}');
let guid4 = Guid.fromString('{ fa20be72-8325-42e8-b62b-149ba613edcd }');
let guid5 = Guid.fromString('{ 18F66861-F882-4E95-BDEE-9499C7022C63 }');

// as is a binary string
let guid6 = Guid.fromString('10010111110000110101110110110111111110011010101001001101001000001011101111010011010000010000100111000000110011010000100111000110');
let guid6 = Guid.fromString('{10010111110000110101110110110111111110011010101001001101001000001011101111010011010000010000100111000000110011010000100111000110}');
let guid6 = Guid.fromString('{10010111110000110101110110110111111110011010101001001101001000001011101111010011010000010000100111000000110011010000100111000110}');
```

## Serializing Guid instances

```typescript
import { Guid } from '@bradkovach/guid';

let guid = Guid.newGuid();

let bin = guid.toString(2);
let oct = guid.toString(8);
let dec = guid.toString(10);
let hex = guid.toString(16);
```

## Test

When you're working with COMB Guid instances, or guids created from comb guids, you can compare using less-than/greater-than. This could be useful for comparing Correlation IDs to see which

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

# Usage

## Comparing to other numbers

Since GUID/UUID values are just huge numbers, you can compare them to each other directly. Guid implements `valueOf()` using BigInt.

```typescript
import { Guid } from '@bradkovach/guid';

// construct from existing hex
let guid = Guid.fromString('83870266-9493-42CE-9EE6-8F3AA9D04401');

// construct from existing bin
let guid = Guid.fromString('');

// construct from existing 16-byte array
// This will set version and variant fields
let myBytes = Uint8Array(/* ... */);
let guid = Guid.fromBytes(myBytes);

// construct from
```
