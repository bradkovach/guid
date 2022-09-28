import { numToWhitespace } from "./numToWhitespace";

export function debugGuid(guidString: string) {
    const version = guidString.charAt(14),
        variant = guidString.charAt(19);
    console.log(`${guidString}; version: ${version}; variant: ${variant}`);
    console.log(numToWhitespace([14, "^", 4, "^"]));
    console.log(
        numToWhitespace([
            14,
            "|",
            4,
            "+---> ",
            variant,
            3,
            ["8", "9", "a", "b"].indexOf(variant) > -1 ? "valid" : "invalid",
            1,
            "variant",
        ])
    );
    console.log(
        numToWhitespace([14, "+--------> ", version, 3, version === "4" ? "valid" : "invalid", 1, "version"])
    );
    console.log(
        numToWhitespace([29, guidString.length === 36 ? "valid" : "invalid", 1, `length: ${guidString.length}`])
    );
}
