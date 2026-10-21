export function normalizeForScoring(text: string): string {
  return text
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^\wÀ-ɏ]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
