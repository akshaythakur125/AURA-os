const VALID_PRODUCT_TYPES = ["quick_fix", "aura_report", "dating_audit", "glowup_plan"];
const VALID_AUDIT_TYPES = ["photo", "instagram", "dating", "outfit", "background"];
const MAX_STRING_LENGTH = 5000;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function validateProductType(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: false, error: "Product type is required" };
  if (!VALID_PRODUCT_TYPES.includes(value)) {
    return { valid: false, error: `Invalid product type: "${value}". Must be one of: ${VALID_PRODUCT_TYPES.join(", ")}` };
  }
  return { valid: true };
}

export function validateAuditType(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: false, error: "Audit type is required" };
  if (!VALID_AUDIT_TYPES.includes(value)) {
    return { valid: false, error: `Invalid audit type: "${value}"` };
  }
  return { valid: true };
}

export function validateOfferCode(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: true }; // optional
  if (value.length > 20) return { valid: false, error: "Offer code too long" };
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    return { valid: false, error: "Offer code contains invalid characters" };
  }
  return { valid: true };
}

export function validateEmail(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: false, error: "Email is required" };
  if (value.length > 200) return { valid: false, error: "Email too long" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
}

export function validateContact(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: false, error: "Contact is required" };
  if (value.length > 20) return { valid: false, error: "Contact too long" };
  return { valid: true };
}

export function validateString(value: string, fieldName: string, maxLength: number = MAX_STRING_LENGTH): { valid: boolean; error?: string } {
  if (!value) return { valid: false, error: `${fieldName} is required` };
  if (value.length > maxLength) return { valid: false, error: `${fieldName} exceeds maximum length of ${maxLength}` };
  return { valid: true };
}

export function sanitizeUserText(value: string): string {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<[^>]*>/g, "")
    .slice(0, MAX_STRING_LENGTH);
}

export function validateImageSize(bytes: number): { valid: boolean; error?: string } {
  if (bytes > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Image too large. Maximum size is ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB` };
  }
  return { valid: true };
}

export function validateUrl(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: false, error: "URL is required" };
  if (value.length > 2000) return { valid: false, error: "URL too long" };
  try {
    new URL(value);
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}
