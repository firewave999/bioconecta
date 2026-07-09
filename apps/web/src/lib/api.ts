const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

type ApiErrorBody = {
  message?: string | string[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type ApiOptions<TBody> = {
  body?: TBody;
  method?: "DELETE" | "GET" | "POST" | "PUT";
  token?: string | null;
};

type TokenResponse = {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export async function apiRequest<TResponse, TBody extends Record<string, unknown>>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  return apiFetch<TResponse, TBody>(path, {
    body,
    method: "POST",
  });
}

export async function apiFetch<
  TResponse,
  TBody extends Record<string, unknown> = Record<string, never>,
>(path: string, options: ApiOptions<TBody> = {}): Promise<TResponse> {
  const response = await sendJsonRequest(path, options, options.token ?? null);

  if (response.ok) {
    return (await response.json().catch(() => ({}))) as TResponse;
  }

  if (response.status === 401 && options.token && path !== "/auth/refresh") {
    const refreshedToken = await refreshStoredTokens();

    if (refreshedToken) {
      const retryResponse = await sendJsonRequest(path, options, refreshedToken);

      if (retryResponse.ok) {
        return (await retryResponse.json().catch(() => ({}))) as TResponse;
      }

      const retryPayload = (await retryResponse.json().catch(() => ({}))) as unknown;
      throw new ApiError(getErrorMessage(retryPayload), retryResponse.status);
    }

    clearStoredTokens();
    throw new ApiError("Sessao expirada. Entre novamente para continuar.", 401);
  }

  const payload = (await response.json().catch(() => ({}))) as unknown;
  throw new ApiError(getErrorMessage(payload), response.status);
}

async function sendJsonRequest<TBody>(
  path: string,
  options: ApiOptions<TBody>,
  token: string | null,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${apiUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
    method: options.method ?? "GET",
  });
}

export async function apiUploadImage(kind: "biologist" | "company", file: File, token: string) {
  const formData = new FormData();
  formData.append("file", file);

  const payload = await sendUploadRequest(`/uploads/${kind}/image`, formData, token);

  return payload as { url: string };
}

export async function apiUploadBiologistDocument(file: File, token: string) {
  const formData = new FormData();
  formData.append("file", file);

  const payload = await sendUploadRequest("/uploads/biologist/document", formData, token);

  return payload as { url: string };
}

async function sendUploadRequest(path: string, formData: FormData, token: string) {
  const response = await fetch(`${apiUrl}${path}`, {
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "POST",
  });

  if (response.ok) {
    return (await response.json().catch(() => ({}))) as unknown;
  }

  if (response.status === 401) {
    const refreshedToken = await refreshStoredTokens();

    if (refreshedToken) {
      const retryResponse = await fetch(`${apiUrl}${path}`, {
        body: formData,
        headers: {
          Authorization: `Bearer ${refreshedToken}`,
        },
        method: "POST",
      });

      const retryPayload = (await retryResponse.json().catch(() => ({}))) as unknown;

      if (retryResponse.ok) {
        return retryPayload;
      }

      throw new ApiError(getErrorMessage(retryPayload), retryResponse.status);
    }

    clearStoredTokens();
    throw new ApiError("Sessao expirada. Entre novamente para continuar.", 401);
  }

  const payload = (await response.json().catch(() => ({}))) as unknown;
  throw new ApiError(getErrorMessage(payload), response.status);
}

export function getStoredAccessToken() {
  return typeof window === "undefined" ? null : localStorage.getItem("bioconecta.accessToken");
}

export function getStoredRefreshToken() {
  return typeof window === "undefined" ? null : localStorage.getItem("bioconecta.refreshToken");
}

export function clearStoredTokens() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("bioconecta.accessToken");
  localStorage.removeItem("bioconecta.refreshToken");
}

export function storeTokens(tokens: TokenResponse["tokens"]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("bioconecta.accessToken", tokens.accessToken);
  localStorage.setItem("bioconecta.refreshToken", tokens.refreshToken);
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshStoredTokens() {
  if (typeof window === "undefined") {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshStoredTokensOnce().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function refreshStoredTokensOnce() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${apiUrl}/auth/refresh`, {
    body: JSON.stringify({ refreshToken }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    clearStoredTokens();
    return null;
  }

  const tokenPayload = payload as TokenResponse;
  storeTokens(tokenPayload.tokens);

  return tokenPayload.tokens.accessToken;
}

function getErrorMessage(payload: unknown) {
  if (typeof payload !== "object" || payload === null || !("message" in payload)) {
    return "Nao foi possivel concluir a acao.";
  }

  const message = (payload as ApiErrorBody).message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return message ?? "Nao foi possivel concluir a acao.";
}
