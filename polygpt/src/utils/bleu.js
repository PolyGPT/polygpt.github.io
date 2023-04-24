//TODO: 추후 언어에 따라 달라질수있음
const SPLIT_TOKEN = ' ';

function countNgrams(sentence, n) {
  const ngrams = {};
  const words = sentence.split(SPLIT_TOKEN);
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(SPLIT_TOKEN);
    if (ngram in ngrams) {
      ngrams[ngram]++;
    } else {
      ngrams[ngram] = 1;
    }
  }
  return ngrams;
}

function countMaxReferenceNgrams(candidate, reference, n) {
  const ngrams = countNgrams(reference, n);
  const count = Object.keys(ngrams).reduce((sum, key) => sum + Math.min(ngrams[key], countNgrams(candidate, n)[key] || 0), 0);
  return count;
}

export function calculateBLEU(candidate, reference, maxN) {
  const weights = Array.from({ length: maxN }, (_, i) => 1 / maxN);
  const candidateLength = candidate.split(SPLIT_TOKEN).length;
  const referenceLength = reference.split(SPLIT_TOKEN).length;
  let matchedNgrams = Array.from({ length: maxN }, () => 0);
  for (let n = 1; n <= maxN; n++) {
    const count = countMaxReferenceNgrams(candidate, reference, n);
    matchedNgrams[n - 1] = count;
  }
  const brevityPenalty = candidateLength >= referenceLength ? 1 : Math.exp(1 - referenceLength / candidateLength);
  const precision = matchedNgrams.reduce((product, count, i) => product * Math.pow(count / (candidateLength - i), weights[i]), 1);
  return brevityPenalty * precision;
}
