import type { AffixDistribution, AffixDistributionItem, SkillBuildItem } from "@pangu/api-client";
import { apiClient, EquipmentSlot, type PlayerClass } from "@pangu/api-client";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pangu/ui";
import Link from "next/link";

import { classMeta, isPlayerClass, PLAYER_CLASSES } from "@/lib/class-meta";
import { EQUIPMENT_SLOTS, parseEquipmentSlot, slotLabel } from "@/lib/equipment-meta";

/** 层数门槛选项（后端 le=150） */
const MIN_TIERS = [100, 110, 120, 130, 140] as const;

/** 每个分类最多展示的词缀条数 */
const TOP_N = 15;

/** Build 下拉可选项数量 */
const BUILD_OPTIONS_N = 10;

/** 职业与部位的默认选择 */
const DEFAULT_CLASS: PlayerClass = "BARBARIAN";
const DEFAULT_SLOT = EquipmentSlot.HELM;

const CATEGORIES = [
  {
    key: "innate",
    title: "自带词缀",
    description: "装备掉落自带的词缀（含太古 / 重洗）",
    barClass: "bg-primary",
    denominator: (d: AffixDistribution) => d.item_count,
  },
  {
    key: "temper",
    title: "回火词缀",
    description: "通过回火手册附加的词缀",
    barClass: "bg-sky-500",
    denominator: (d: AffixDistribution) => d.item_count,
  },
  {
    key: "transfigured",
    title: "嬗变词缀",
    description: "通过嬗变石改造出的词缀",
    barClass: "bg-fuchsia-500",
    denominator: (d: AffixDistribution) => d.item_count,
  },
  {
    key: "masterwork_crit",
    title: "精炼暴击",
    description: "精炼（大师之作）点出的暴击词缀，可跨类别汇总",
    barClass: "bg-red-500",
    denominator: (d: AffixDistribution) => d.masterwork_item_count,
  },
] as const;

interface AffixesPageProps {
  searchParams: Promise<{ class?: string; slot?: string; tier?: string; build?: string }>;
}

export default async function AffixesPage({ searchParams }: AffixesPageProps) {
  const params = await searchParams;
  const playerClass = isPlayerClass(params.class) ? params.class : DEFAULT_CLASS;
  const parsedTier = Number.parseInt(params.tier ?? "", 10);
  const minTier = (MIN_TIERS as readonly number[]).includes(parsedTier) ? parsedTier : 100;
  const slot = parseEquipmentSlot(params.slot) ?? DEFAULT_SLOT;
  const buildKey = params.build ? params.build : undefined;

  let data: AffixDistribution | null = null;
  let buildOptions: SkillBuildItem[] = [];
  let error: string | null = null;
  try {
    // build 选项与词缀分布并行请求
    const [affixResult, buildResult] = await Promise.all([
      apiClient.getAffixDistribution({ playerClass, slot, minTier, buildKey }),
      apiClient.getSkillBuildDistribution({ playerClass, minTier }),
    ]);
    data = affixResult;
    buildOptions = [...buildResult.items]
      .sort((a, b) => b.count - a.count)
      .slice(0, BUILD_OPTIONS_N);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  // 当前选中的 build 不在 Top 选项里时补进去，避免 select 显示空
  if (buildKey && !buildOptions.some((b) => b.build_key === buildKey)) {
    buildOptions = [
      { build_key: buildKey, skills: buildKey.split("+"), count: 0, percentage: 0 },
      ...buildOptions,
    ];
  }

  const buildHref = (next: { class?: string; slot?: string; tier?: number; build?: string }) => {
    const qs = new URLSearchParams();
    qs.set("class", next.class ?? playerClass);
    qs.set("slot", next.slot ?? String(slot));
    const tier = next.tier ?? minTier;
    if (tier !== 100) qs.set("tier", String(tier));
    // build 与职业绑定，切职业时丢弃
    const nextBuild =
      next.build !== undefined
        ? next.build
        : next.class !== undefined && next.class !== playerClass
          ? undefined
          : buildKey;
    if (nextBuild) qs.set("build", nextBuild);
    return `/affixes?${qs.toString()}`;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">词缀分布</h1>
        <div className="flex items-baseline gap-4">
          <Link
            href="/builds"
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
          >
            Build 分布 →
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

      {/* 筛选：部位 */}
      <section className="flex flex-wrap items-center gap-2">
        <span className="w-12 text-sm text-muted-foreground">部位</span>
        {EQUIPMENT_SLOTS.map((s) => (
          <Button key={s} asChild variant={slot === s ? "default" : "outline"} size="sm">
            <Link href={buildHref({ slot: String(s) })}>{slotLabel(s)}</Link>
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

      {/* 筛选：技能 Build */}
      {buildOptions.length > 0 && (
        <form action="/affixes" className="flex flex-wrap items-center gap-2">
          <span className="w-12 text-sm text-muted-foreground">Build</span>
          <input type="hidden" name="class" value={playerClass} />
          <input type="hidden" name="slot" value={String(slot)} />
          {minTier !== 100 && <input type="hidden" name="tier" value={String(minTier)} />}
          <select
            name="build"
            defaultValue={buildKey ?? ""}
            className="h-8 max-w-md truncate rounded-md border border-input bg-transparent px-2 text-sm shadow-xs"
          >
            <option value="">全部 Build</option>
            {buildOptions.map((build) => (
              <option key={build.build_key} value={build.build_key}>
                {buildOptionLabel(build)}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" size="sm">
            应用
          </Button>
          {buildKey && (
            <Button asChild variant="ghost" size="sm">
              <Link href={buildHref({ build: undefined })}>清除</Link>
            </Button>
          )}
        </form>
      )}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          无法连接后端服务（{error}）。请确认 d4_backend 已启动，且 PANGU_API_BASE_URL 配置正确。
        </div>
      )}

      {data && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          命中 {data.entry_count} 条榜单记录 · {data.item_count} 件装备
          <Badge variant="secondary" className={classMeta(playerClass).badge}>
            {classMeta(playerClass).label}
          </Badge>
          <Badge variant="outline">{slotLabel(slot)}</Badge>
          <Badge variant="outline">≥ {data.min_tier} 层</Badge>
          {buildKey && (
            <Badge variant="secondary" className="max-w-xs truncate font-normal">
              Build: {buildKey.split("+").join(" + ")}
            </Badge>
          )}
        </p>
      )}

      {data && data.item_count === 0 && (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          当前筛选条件下暂无装备数据
        </div>
      )}

      {data && data.item_count > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.key} category={category} data={data} />
          ))}
        </div>
      )}
    </main>
  );
}

type Category = (typeof CATEGORIES)[number];

/** Build 下拉选项文案：技能代号拼接，过长截断 */
function buildOptionLabel(build: SkillBuildItem): string {
  const label = build.skills.join(" + ");
  return label.length > 60 ? `${label.slice(0, 60)}…` : label;
}

function CategoryCard({ category, data }: { category: Category; data: AffixDistribution }) {
  const items = data[category.key];
  const denominator = category.denominator(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{category.title}</CardTitle>
        <CardDescription>
          {category.description} · 分母 {denominator} 件
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">无此类词缀</p>
        ) : (
          <DistributionList items={items} barClass={category.barClass} />
        )}
      </CardContent>
    </Card>
  );
}

function DistributionList({
  items,
  barClass,
}: {
  items: AffixDistributionItem[];
  barClass: string;
}) {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, TOP_N);
  // 条形长度按组内最大占比归一化，长尾更易读
  const maxPercentage = Math.max(...top.map((item) => item.percentage));

  return (
    <div className="flex flex-col gap-1.5">
      {top.map((item) => (
        <div key={item.codename} className="flex items-center gap-2">
          <span className="w-44 shrink-0 truncate text-sm" title={item.stat_type}>
            {item.stat_type}
          </span>
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${barClass}`}
              style={{ width: `${(item.percentage / maxPercentage) * 100}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {item.count} 件 · {item.percentage.toFixed(1)}%
          </span>
        </div>
      ))}
      {sorted.length > top.length && (
        <p className="mt-1 text-xs text-muted-foreground">
          仅展示前 {top.length} 项，其余 {sorted.length - top.length} 种词缀略
        </p>
      )}
    </div>
  );
}
