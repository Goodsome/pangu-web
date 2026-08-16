import { apiClient, type Entry, type Page } from "@pangu/api-client";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pangu/ui";
import Link from "next/link";

import { classMeta, isPlayerClass, PLAYER_CLASSES, rankStyle } from "@/lib/class-meta";
import { formatDateTime, formatDuration } from "@/lib/format";

const PAGE_SIZE = 50;

interface HomeProps {
  searchParams: Promise<{ page?: string; class?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const current = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const playerClass = isPlayerClass(params.class) ? params.class : undefined;

  let data: Page<Entry> | null = null;
  let error: string | null = null;
  try {
    data = await apiClient.listEntries({ current, size: PAGE_SIZE, playerClass });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const filterHref = (cls?: string) => {
    const qs = new URLSearchParams();
    if (cls) qs.set("class", cls);
    return qs.toString() ? `/?${qs}` : "/";
  };
  const pageHref = (page: number) => {
    const qs = new URLSearchParams();
    if (playerClass) qs.set("class", playerClass);
    if (page > 1) qs.set("page", String(page));
    return qs.toString() ? `/?${qs}` : "/";
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">大秘境排行榜</h1>
        <div className="flex items-baseline gap-4">
          <Link
            href="/affixes"
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
          >
            词缀分布 →
          </Link>
          {data && (
            <p className="text-sm text-muted-foreground">
              共 {data.total} 条记录 · 第 {data.current}/{totalPages} 页
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant={!playerClass ? "default" : "outline"} size="sm">
          <Link href={filterHref()}>全部</Link>
        </Button>
        {PLAYER_CLASSES.map((cls) => {
          const meta = classMeta(cls);
          return (
            <Button
              key={cls}
              asChild
              variant={playerClass === cls ? "default" : "outline"}
              size="sm"
            >
              <Link href={filterHref(cls)}>{meta.label}</Link>
            </Button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          无法连接后端服务（{error}）。请确认 d4_backend 已启动，且 PANGU_API_BASE_URL 配置正确。
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          暂无榜单数据
        </div>
      )}

      {data && data.items.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-right">排名</TableHead>
              <TableHead>玩家</TableHead>
              <TableHead>职业</TableHead>
              <TableHead className="text-right">层数</TableHead>
              <TableHead className="text-right">用时</TableHead>
              <TableHead className="text-right">通关时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((entry, index) => {
              const rank = (data.current - 1) * PAGE_SIZE + index + 1;
              const meta = classMeta(entry.player_class);
              return (
                <TableRow key={entry.id}>
                  <TableCell className={`text-right tabular-nums ${rankStyle(rank) ?? ""}`}>
                    {rank}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/entries/${entry.id}`}
                      className="font-medium hover:underline underline-offset-4"
                    >
                      {entry.player_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={meta.badge}>
                      {meta.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {entry.tier}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDuration(entry.duration_ms)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {formatDateTime(entry.occurred_at)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          {data.current > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(data.current - 1)}>上一页</Link>
            </Button>
          ) : (
            <span />
          )}
          {data.current < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(data.current + 1)}>下一页</Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      )}
    </main>
  );
}
