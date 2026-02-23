export function safeLogError(message: string, meta?: Record<string, any>) {
  // nunca logar tokens/segredos
  const sanitized = meta ? JSON.parse(JSON.stringify(meta, (k, v) => {
    const key = String(k).toLowerCase();
    if (key.includes("token") || key.includes("secret") || key.includes("authorization")) return "[REDACTED]";
    return v;
  })) : undefined;

  console.error(message, sanitized);
}
