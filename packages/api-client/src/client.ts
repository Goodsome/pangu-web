/**
 * pangu 后端 API 客户端（基于 fetch 的轻量封装）。
 *
 * 后端仓库位于 ../pangu（Python + uv workspace），d4_backend 服务默认监听 :8000，
 * 路由无 /api 前缀（如 GET /entries/）。
 * 环境变量约定：
 *   PANGU_API_BASE_URL - 后端 API 根地址，例如 http://localhost:8000
 */

import type {
  AffixDistribution,
  Entry,
  EquipmentSlot,
  Page,
  PlayerClass,
  SkillBuildDistribution,
} from "./types";

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

export interface ListEntriesParams {
  current?: number;
  size?: number;
  playerClass?: PlayerClass;
}

export interface AffixDistributionParams {
  playerClass?: PlayerClass;
  slot?: EquipmentSlot;
  /** 最低层数（后端 ge=1 le=150，默认 100） */
  minTier?: number;
  /** 技能组合 build 签名（见 skill-builds 接口） */
  buildKey?: string;
}

export interface SkillBuildDistributionParams {
  playerClass?: PlayerClass;
  /** 最低层数（后端 ge=1 le=150，默认 1） */
  minTier?: number;
}

/** d4_leaderboard 榜单客户端 */
export function createLeaderboardClient(options: ApiClientOptions) {
  const http = createApiClient(options);

  return {
    /** 分页榜单（后端固定 tier DESC / duration ASC 排序） */
    listEntries(params: ListEntriesParams = {}): Promise<Page<Entry>> {
      const search = new URLSearchParams();
      if (params.current !== undefined) search.set("current", String(params.current));
      if (params.size !== undefined) search.set("size", String(params.size));
      if (params.playerClass !== undefined) search.set("player_class", params.playerClass);
      const qs = search.toString();
      return http.get<Page<Entry>>(`/entries/${qs ? `?${qs}` : ""}`);
    },

    /** 单条榜条目（含完整 Build 快照） */
    getEntry(id: string): Promise<Entry> {
      return http.get<Entry>(`/entries/${id}`);
    },

    /** 词缀选择分布：统计指定职业 / 部位 / 层数门槛 / build 下的词缀频次与占比 */
    getAffixDistribution(params: AffixDistributionParams = {}): Promise<AffixDistribution> {
      const search = new URLSearchParams();
      if (params.playerClass !== undefined) search.set("player_class", params.playerClass);
      if (params.slot !== undefined) search.set("slot", String(params.slot));
      if (params.minTier !== undefined) search.set("min_tier", String(params.minTier));
      if (params.buildKey !== undefined) search.set("build_key", params.buildKey);
      const qs = search.toString();
      return http.get<AffixDistribution>(`/entries/affix-distribution${qs ? `?${qs}` : ""}`);
    },

    /** 技能组合 build 分布：统计指定职业 / 层数门槛下各技能组合的使用频次 */
    getSkillBuildDistribution(
      params: SkillBuildDistributionParams = {},
    ): Promise<SkillBuildDistribution> {
      const search = new URLSearchParams();
      if (params.playerClass !== undefined) search.set("player_class", params.playerClass);
      if (params.minTier !== undefined) search.set("min_tier", String(params.minTier));
      const qs = search.toString();
      return http.get<SkillBuildDistribution>(`/entries/skill-builds${qs ? `?${qs}` : ""}`);
    },
  };
}

export type LeaderboardClient = ReturnType<typeof createLeaderboardClient>;

export const apiClient = createLeaderboardClient({
  baseUrl: process.env.PANGU_API_BASE_URL ?? "http://localhost:8000",
});
