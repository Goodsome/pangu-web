import type { PlayerClass, SkillBuildDistribution, SkillBuildItem } from "@pangu/api-client";
import { apiClient, EquipmentSlot } from "@pangu/api-client";
import { Badge, Button } from "@pangu/ui";
import Link from "next/link";

import { classMeta, isPlayerClass, PLAYER_CLASSES } from "@/lib/class-meta";

/** 层数门槛选项（后端 le=150），与词缀分布页保持一致 */
const MIN_TIERS = [100, 110, 120, 130, 140] as const;

/** 最多展示的 build 条数 */
const TOP_N = 20;

const DEFAULT_CLASS: PlayerClass = "BARBARIAN";

interface BuildsPageProps {
  searchParams: Promise<{ class?: string; tier?: string }>;
}

export default async function BuildsPage({ searchParams }: BuildsPageProps) {
  const params = await searchParams;
  const playerClass = isPlayerClass(params.class) ? params.class : DEFAULT_CLASS;
  const parsedTier = Number.parseInt(params.tier ?? "", 10);
  const minTier = (MIN_TIERS as readonly number[]).includes(parsedTier) ? parsedTier : 100;

  let data: SkillBuildDistribution | null = null;
  let error: string | null = null;
  try {
    data = await apiClient.getSkillBuildDistribution({ playerClass, minTier });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const buildHref = (next: { class?: string; tier?: number }) => {
    const qs = new URLSearchParams();
    qs.set("class", next.class ?? playerClass);
    const tier = next.tier ?? minTier;
    if (tier !== 100) qs.set("tier", String(tier));
    return `/builds?${qs.toString()}`;
  };

  /** 跳转到该 build 的词缀分布（沿用当前职业与层数，部位取默认头部） */
  const affixHref = (item: SkillBuildItem) => {
    const qs = new URLSearchParams();
    qs.set("class", playerClass);
    qs.set("slot", String(EquipmentSlot.HELM));
    qs.set("build", item.build_key);
    if (minTier !== 100) qs.set("tier", String(minTier));
    return `/affixes?${qs.toString()}`;
  };

  const sorted = data ? [...data.items].sort((a, b) => b.count - a.count) : [];
  const top = sorted.slice(0, TOP_N);
  // 条形长度按最大占比归一化
  const maxPercentage = top.length > 0 ? Math.max(...top.map((item) => item.percentage)) : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">技能 Build 分布</h1>
        <div className="flex items-baseline gap-4">
          <Link
            href="/affixes"
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
          >
            词缀分布 →
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
          >
            ← 返回排行榜
          </Link>
        </div>
      </div>

      {/* 筛选：职业 */}
      <section className="flex flex-wrap items-center gap-2">
        <span className="w-12 text-sm text-muted-foreground">职业</span>
        {PLAYER_CLASSES.map((cls) => (
          <Button key={cls} asChild variant={playerClass === cls ? "default" : "outline"} size="sm">
            <Link href={buildHref({ class: cls })}>{classMeta(cls).label}</Link>
          </Button>
        ))}
      </section>

      {/* 筛选：层数门槛 */}
      <section className="flex flex-wrap items-center gap-2">
        <span className="w-12 text-sm text-muted-foreground">层数</span>
        {MIN_TIERS.map((tier) => (
          <Button key={tier} asChild variant={minTier === tier ? "default" : "outline"} size="sm">
            <Link href={buildHref({ tier })}>≥ {tier}</Link>
          </Button>
        ))}
      </section>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          无法连接后端服务（{error}）。请确认 d4_backend 已启动，且 PANGU_API_BASE_URL 配置正确。
        </div>
      )}

      {data && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          命中 {data.entry_count} 条榜单记录 · {data.build_count} 种 build
          <Badge variant="secondary" className={classMeta(playerClass).badge}>
            {classMeta(playerClass).label}
          </Badge>
          <Badge variant="outline">≥ {data.min_tier} 层</Badge>
        </p>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          当前筛选条件下暂无技能数据
        </div>
      )}

      {top.length > 0 && (
        <div className="flex flex-col gap-2">
          {top.map((item, index) => (
            <div key={item.build_key} className="flex flex-col gap-2 rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs tabular-nums text-muted-foreground">#{index + 1}</span>
                {item.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(item.percentage / maxPercentage) * 100}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {item.count} 条 · {item.percentage.toFixed(1)}%
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link href={affixHref(item)}>词缀分布 →</Link>
                </Button>
              </div>
            </div>
          ))}
          {sorted.length > top.length && (
            <p className="text-xs text-muted-foreground">
              仅展示前 {top.length} 个 build，其余 {sorted.length - top.length} 个略
            </p>
          )}
        </div>
      )}
    </main>
  );
}
