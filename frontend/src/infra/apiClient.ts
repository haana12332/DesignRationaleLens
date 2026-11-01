// バックエンド（Express）との通信をまとめるクライアント
// 開発中は Vite の proxy により "/api" が Express に転送される（vite.config.ts 参照）
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api"

export class ApiError extends Error {
    readonly status: number
    readonly body: unknown

    constructor(status: number, body: unknown) {
        super(`API error: ${status}`)
        this.status = status
        this.body = body
    }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: "include", // Cookie（セッション）を送る
    })

    const text = await res.text()
    const data: unknown = text ? JSON.parse(text) : undefined

    if (!res.ok) throw new ApiError(res.status, data)
    return data as T
}

export const apiClient = {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
    put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
    patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
    delete: <T>(path: string) => request<T>("DELETE", path),
}
