export function chunkText(texts: string[], n: number): string[][] {
    let chars = 0;
    let start = 0;
    const result: string[][] = [];
    for (let i = 0; i < texts.length; i++) {
      chars += texts[i].length;
      if (chars > n) {
        result.push(texts.slice(start, i));
        chars = texts[i].length;
        start = i;
      }
    }
    result.push(texts.slice(start));
    return result;
  }