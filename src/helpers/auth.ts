const AUTH_TOKEN_KEY = "patota_auth_token";

type LoginResponse =
  | string
  | {
      token?: string;
      accessToken?: string;
      access_token?: string;
      jwt?: string;
    };

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function saveAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function extractTokenFromLoginResponse(data: LoginResponse): string | null {
  if (typeof data === "string" && data.trim() !== "") {
    return data;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return data.token || data.accessToken || data.access_token || data.jwt || null;
}
