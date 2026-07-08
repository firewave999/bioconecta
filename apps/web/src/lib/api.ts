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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${apiUrl}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
    method: options.method ?? "GET",
  });

  const payload = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    const message = getErrorMessage(payload);
    throw new ApiError(message, response.status);
  }

  return payload as TResponse;
}

export async function apiUploadImage(kind: "biologist" | "company", file: File, token: string) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiUrl}/uploads/${kind}/image`, {
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "POST",
  });

  const payload = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload), response.status);
  }

  return payload as { url: string };
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
