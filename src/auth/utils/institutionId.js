export function generateInstitutionId(companyName) {
  if (!companyName || !companyName.trim()) return "";
  const stopWords = ["pt", "cv", "tbk", "persero", "the", "and", "&", "-"];
  const words = companyName.trim().split(/\s+/).filter(
    wrd => !stopWords.includes(wrd.toLowerCase().replace(/[^a-z]/g, ""))
  );
  const prefix = words
    .slice(0, 3)
    .map(wrd => wrd.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3))
    .join("");
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = ((hash << 5) - hash + companyName.charCodeAt(i)) | 0;
  }
  const suffix = String(Math.abs(hash) % 9000 + 1000);
  return `CT-${prefix.slice(0, 6)}-${suffix}`;
}