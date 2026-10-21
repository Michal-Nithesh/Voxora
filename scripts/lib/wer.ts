import { normalizeForScoring as normalizeText } from './wer-normalize';

export interface Alias {
  from: string;
  to: string;
}

export function parseAliases(text: string): Alias[] {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).flatMap(line => {
    const separator = line.indexOf('=');
    if (separator < 1) return [];
    return [{ from: line.slice(0, separator).trim(), to: line.slice(separator + 1).trim() }];
  });
}

export function normalizeForScoring(text: string, aliases: Alias[] = []): string {
  let normalized = normalizeText(text);
  for (const alias of aliases) {
    normalized = normalized.replace(new RegExp(`\\b${escapeRegExp(normalizeText(alias.from))}\\b`, 'g'), normalizeText(alias.to));
  }
  return normalized;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function editDistance(reference: string[], hypothesis: string[]): number {
  const row = Array.from({ length: hypothesis.length + 1 }, (_, index) => index);
  for (let i = 1; i <= reference.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= hypothesis.length; j++) {
      const above = row[j];
      row[j] = reference[i - 1] === hypothesis[j - 1]
        ? diagonal
        : Math.min(diagonal + 1, row[j] + 1, row[j - 1] + 1);
      diagonal = above;
    }
  }
  return row[hypothesis.length];
}

export function computeWER(reference: string, hypothesis: string): number {
  const referenceWords = reference.split(/\s+/).filter(Boolean);
  const hypothesisWords = hypothesis.split(/\s+/).filter(Boolean);
  if (referenceWords.length === 0) return hypothesisWords.length === 0 ? 0 : 1;
  return editDistance(referenceWords, hypothesisWords) / referenceWords.length;
}

export function computeCER(reference: string, hypothesis: string): number {
  if (!reference.length) return hypothesis.length === 0 ? 0 : 1;
  return editDistance(reference.split(''), hypothesis.split('')) / reference.length;
}

export function deletionRuns(reference: string, hypothesis: string): number[] {
  const referenceWords = reference.split(/\s+/).filter(Boolean);
  const hypothesisWords = hypothesis.split(/\s+/).filter(Boolean);
  const runs: number[] = [];
  let deletions = 0;
  let row = Array.from({ length: hypothesisWords.length + 1 }, (_, index) => index);
  for (let i = 1; i <= referenceWords.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= hypothesisWords.length; j++) {
      const above = row[j];
      const same = referenceWords[i - 1] === hypothesisWords[j - 1];
      row[j] = same ? diagonal : Math.min(diagonal + 1, row[j] + 1, row[j - 1] + 1);
      if (same && deletions > 0) { runs.push(deletions); deletions = 0; }
      else if (!same && row[j] === diagonal + 1) deletions++;
      diagonal = above;
    }
  }
  if (deletions > 0) runs.push(deletions);
  return runs;
}

export function countAsrArtifacts(text: string): number {
  return (text.match(/\b(?:muziek|music|ondertiteling|applaus|laughter)\b/gi) ?? []).length
    + (text.match(/\*{2,}/g) ?? []).length;
}
