export interface AuthPageMetadata {
  title: string;
  subtitle?: string;
}

export interface AuthPageConfig {
  default: AuthPageMetadata;
  states?: Record<string, AuthPageMetadata>;
}

// Base metadata configuration
export const AUTH_PAGE_CONFIG: Record<string, AuthPageConfig> = {
  "/auth/login": {
    default: {
      title: "Welcome back",
      subtitle: "Sign in to your account to continue",
    },
  },
  "/auth/register": {
    default: {
      title: "Create your account",
      subtitle: "Join us and start managing your business",
    },
  },
  "/auth/forgot-password": {
    default: {
      title: "Forgot your password?",
      subtitle: "No worries, we'll send you reset instructions",
    },
    states: {
      submitted: {
        title: "Check your email",
        subtitle: "We've sent you a password reset link",
      },
    },
  },
  "/auth/reset-password": {
    default: {
      title: "Reset your password",
      subtitle: "Enter your new password below",
    },
    states: {
      loading: {
        title: "Validating reset link",
        subtitle: "Please wait while we verify your reset link",
      },
      invalid: {
        title: "Invalid reset link",
        subtitle: "This password reset link is invalid or has expired",
      },
      success: {
        title: "Password reset successful",
        subtitle: "Your password has been updated",
      },
    },
  },
};

// Hook to get metadata based on current path and state
export function useAuthMetadata(
  pathname: string,
  state?: string
): AuthPageMetadata {
  const config = AUTH_PAGE_CONFIG[pathname];

  if (!config) {
    return {
      title: "Welcome",
    };
  }

  // If there's a specific state and it exists in the config, use it
  if (state && config.states?.[state]) {
    return config.states[state];
  }

  // Otherwise return the default metadata
  return config.default;
}

// Function to get metadata for a specific path and state
export function getAuthMetadata(
  pathname: string,
  state?: string
): AuthPageMetadata {
  const config = AUTH_PAGE_CONFIG[pathname];

  if (!config) {
    return {
      title: "Welcome",
    };
  }

  // If there's a specific state and it exists in the config, use it
  if (state && config.states?.[state]) {
    return config.states[state];
  }

  // Otherwise return the default metadata
  return config.default;
}
