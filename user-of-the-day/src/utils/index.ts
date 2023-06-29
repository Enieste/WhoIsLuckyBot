export const getRandomFromNumber = (n: number): number =>
  Math.floor(Math.random() * n);

export const capitalize = (s: string): string => {
  if (!s) return '';
  const firstLetter = s[0];
  const rest = s.slice(1);
  return firstLetter.toUpperCase() + rest;
}