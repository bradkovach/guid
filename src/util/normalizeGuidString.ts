/**
 * Cleans up a string to be parsed or compared.
 * @param guidString Potentially ugly GUID/UUID string
 * @returns Lowercase GUID/UUID string with whitespace, hyphens and braces removed.
 */

export function normalizeGuidString(guidString: string): string {
    return guidString
        .trim()
        .toLowerCase()
        .replace(/-/g, '')
        .replace(/^\{/, '')
        .replace(/\}$/, '')
        .trim();
}
