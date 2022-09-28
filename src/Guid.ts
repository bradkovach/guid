export class Guid {
	public static isValidV4HexString(guidString: string): boolean {
		const noHyphens = guidString.replace(/-/g, "").trim().toLocaleLowerCase();
		const version = noHyphens.charAt(12);
		const variant = noHyphens.charAt(16);
		return (
			noHyphens.length === 32 &&
			Guid.isHex(noHyphens) &&
			version === "4" &&
			["8", "9", "a", "b"].indexOf(variant) > -1
		);
	}

	private _bytes: Uint8Array;

	public static newGuid() {
		const bytes = new Uint8Array(16);
		crypto.getRandomValues(bytes);
		return Guid.fromBytes(bytes);
	}

	/**
	 * Creates a COMB guid, which is guaranteed to be sequential and v4, while still being quite random.
	 */
	public static newCombGuid() {
		const bytes = new Uint8Array(16);
		const time = Date.now() * 10000;
		crypto.getRandomValues(bytes);
		// modify some bytes to guarantee that the values are sequential
		bytes[5] = time >> 40;
		bytes[4] = time >> 32;
		bytes[3] = time >> 24;
		bytes[2] = time >> 16;
		bytes[1] = time >> 8;
		bytes[0] = time;
		return Guid.fromBytes(bytes);
	}

	public static isHex = (maybeHex: string) =>
		maybeHex.length !== 0 && maybeHex.length % 2 === 0 && !/[^a-fA-F0-9]/u.test(maybeHex);

	public static get Empty(): Guid{
		const bytes = new Uint8Array(16);
		bytes.fill(0);
		return new Guid(bytes)
	}

	public static fromString(guidString: string) {
		const noHyphens = guidString.replace(/-/g, "").trim().toLowerCase();
		if (this.isValidV4HexString(noHyphens)) {
			let bytes = Uint8Array.from(noHyphens.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
			return new Guid(bytes);
		} else if (/^[01]{128,128}$/i.test(noHyphens)) {
			let bytes = Uint8Array.from(noHyphens.match(/[0,1]{8,8}/g).map((binByte) => parseInt(binByte, 2)));
			return new Guid(bytes);
		}
		throw new Error(`Unable to parse valid v4 guid from ${guidString}. String was not valid hex or binary.`);
	}

	/**
	 * This is actually an array of ints from 0 to 255;
	 */
	public static fromBytes(bytes: Uint8Array) {
		if (bytes.length !== 16) {
			throw Error("Unable to create Guid from bytes");
		}

		// ensure compliance with RFC/v4 spec
		//          10101010
		//  & 0xf   00001111
		//      =   00001010
		// | 0x40   01000000
		//      =   01001010
		bytes[6] = 0x40 | (bytes[6] & 0xf);

		//          10101010
		//      &   00111111 (0x3f, as a mask)
		//      =   00101010
		//      |   10000000 (0x80, as an or)
		//      =   10101010
		bytes[8] = 0x80 | (bytes[8] & 0x3f);

		return new Guid(bytes);
	}

	/**
	 * Private constructor for Guid. use newGuid(), fromString(), fromBytes()
	 * to build new Guid
	 */
	private constructor(bytes: Uint8Array) {
		this._bytes = bytes;
	}

	public toString(addHyphens: boolean = true, radix: number = 16): string {
		const byteConv = {
			2: (byte: number) => byte.toString(2).padStart(8, "0"),
			8: (byte: number) => byte.toString(8).padStart(4, "0"),
			16: (byte: number) => byte.toString(16).padStart(2, "0"),
		};
		const bytesToBaseConverters = {
			2: (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byteConv[2](byte), ""),
			8: (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byteConv[8](byte), ""),
			16: (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byteConv[16](byte), ""),
		};

		if (!bytesToBaseConverters[radix]) {
			throw Error(`Unable to get converter for base ${radix}`);
		}

		return [
			this._bytes.slice(0, 4),
			this._bytes.slice(4, 6),
			this._bytes.slice(6, 8),
			this._bytes.slice(8, 10),
			this._bytes.slice(10, 16),
		]
			.map(bytesToBaseConverters[radix])
			.join(addHyphens ? "-" : "");
	}

	public toBytes(): Uint8Array {
		return this._bytes;
	}
}
