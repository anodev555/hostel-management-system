export function generate10DigitId() {
  // Get time in milliseconds (e.g., 1727460000000)
  const now = Date.now().toString();

  // Take the last 6 digits of the timestamp
  const timePart = now.slice(-6);

  // Generate 4 random digits (0000 to 9999)
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  // Combine to make exactly 10 digits
  return timePart + randomPart;
}
