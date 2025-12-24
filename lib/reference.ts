export function generateReferenceId(context: string): string {
  const now = new Date();
  const datePart = [
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
  ].join("");

  let randomPart: string;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    randomPart = crypto.randomUUID().slice(0, 8).replace(/-/g, "").toUpperCase();
  } else {
    randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  return `RSM-${context.toUpperCase()}-${datePart}-${randomPart}`;
}


