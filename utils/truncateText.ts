export function truncateText(text: string): string {
    return text.length > 50 ? text.substring(0, 47) + '...' : text;
  }