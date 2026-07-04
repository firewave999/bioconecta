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

export async function apiRequest<TResponse, TBody extends Record<string, unknown>>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const response = await fetch(`${apiUrl}${path}`, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    const message = getErrorMessage(payload);
    throw new ApiError(message, response.status);
  }

  return payload as TResponse;
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
