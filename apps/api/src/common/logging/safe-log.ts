export function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return "[invalid-email]";
  }

  const prefix = localPart.slice(0, 2);

  return `${prefix}***@${domain}`;
}

export function safeJson(input: Record<string, unknown>) {
  return JSON.stringify(input);
}
