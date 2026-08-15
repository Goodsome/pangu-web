/**
 * pangu 后端 API 客户端（基于 fetch 的轻量封装）。
 *
 * 后端仓库位于 ../pangu（Python + uv workspace）。
 * 环境变量约定：
 *   PANGU_API_BASE_URL - 后端 API 根地址，例如 http://localhost:8000/api
 */

export interface ApiClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `pangu API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function createApiClient(options: ApiClientOptions) {
  const doFetch = options.fetch ?? fetch;
  const baseUrl = options.baseUrl.replace(/\/+$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await doFetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        // 非 JSON 响应体，忽略
      }
      throw new ApiError(response.status, body);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  return {
    get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: "GET" }),
    post: <T>(path: string, data?: unknown, init?: RequestInit) =>
      request<T>(path, {
        ...init,
        method: "POST",
        body: data === undefined ? undefined : JSON.stringify(data),
      }),
    put: <T>(path: string, data?: unknown, init?: RequestInit) =>
      request<T>(path, {
        ...init,
        method: "PUT",
        body: data === undefined ? undefined : JSON.stringify(data),
      }),
    delete: <T>(path: string, init?: RequestInit) =>
      request<T>(path, { ...init, method: "DELETE" }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export const apiClient = createApiClient({
  baseUrl: process.env.PANGU_API_BASE_URL ?? "http://localhost:8000/api",
});
