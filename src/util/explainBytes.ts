export function explainBytes(bytes: Uint8Array): void {
    console.log("-".repeat(60));

    [
        ["", "bytes[6]", bytes[6]],
        ["&", "0xf", 0xf],
        ["=", "(bytes[6] & 0xf)", bytes[6] & 0x0f],
        ["|", "0x40", 0x40],
        ["=", "0x40 | (bytes[6] & 0xf)", 0x40 | (bytes[6] & 0xf)],
        null,
        ["", "bytes[8]", bytes[8]],
        ["&", "0x3f", 0x3f],
        ["=", "(bytes[8] & 0x3f)", bytes[8] & 0x3f],
        ["|", "0x80", 0x80],
        ["=", "* 0x80 | (bytes[8] & 0x3f)", 0x80 | (bytes[8] & 0x3f)],
    ].forEach((row: [string, string, number] | null) => {
        if (row === null) {
            console.log(" ");
            return;
        }
        const [op, label, value] = row;
        console.log(
            label.padStart(30, " "),
            value.toString().padStart(6, " "),
            ("0x" + value.toString(16).padStart(2, "0")).padStart(7, " "),
            op.padStart(4, " "),
            value.toString(2).padStart(8, "0").padStart(9, " ")
        );
    });
}
