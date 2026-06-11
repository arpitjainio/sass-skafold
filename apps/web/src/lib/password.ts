export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Use at least 8 characters, including uppercase, lowercase, and a number.";

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
    );
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getPrimaryRoleLabel(roles?: string[]) {
  if (!roles || roles.length === 0) {
    return "User";
  }

  return roles
    .map((role) => role.charAt(0).toUpperCase() + role.slice(1))
    .join(", ");
}
