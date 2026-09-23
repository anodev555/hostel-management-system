export function slugify(text: string): string {
  return text
    .toString() // Ensure input is a string
    .normalize("NFD") // Separate base characters from accents
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks (accents)
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Strip all non-alphanumeric characters except hyphens
    .replace(/-+/g, "-") // Collapse consecutive hyphens into a single one
}
