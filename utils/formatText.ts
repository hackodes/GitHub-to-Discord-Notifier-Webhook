export function formatText(n: number, name: string): string {
    if (n === 1) {
      name = name.replace(/s$/, '');
    }
    return `${n.toLocaleString()} ${name}`;
  }