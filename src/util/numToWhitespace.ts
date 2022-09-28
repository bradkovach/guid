export function numToWhitespace(arr: (string | number)[]): string {
  return arr
    .map((strOrNumb) =>
      typeof strOrNumb === 'number' ? ' '.repeat(strOrNumb) : strOrNumb
    )
    .join('');
}