export function chunkItems<T>(items: T[], n: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += n) {
      result.push(items.slice(i, i + n));
    }
    return result;
}