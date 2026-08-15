import { ApiError, apiClient, type Entry } from "@pangu/api-client";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@pangu/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EquipmentPanel } from "@/components/equipment-panel";
import { ParagonPanel } from "@/components/paragon-panel";
import { SkillsPanel } from "@/components/skills-panel";
import { TalismanPanel } from "@/components/talisman-panel";
import { classMeta } from "@/lib/class-meta";
import { formatDateTime, formatDuration } from "@/lib/format";

interface EntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EntryPage({ params }: EntryPageProps) {
  const { id } = await params;

  let entry: Entry;
  try {
    entry = await apiClient.getEntry(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      notFound();
    }
    throw e;
  }

  const meta = classMeta(entry.player_class);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              ← 返回榜单
            </Link>
            <span className="text-2xl font-bold tracking-tight">{entry.player_name}</span>
            <Badge variant="secondary" className={meta.badge}>
              {meta.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-3 gap-4 text-center">
            <div>
              <dt className="text-xs text-muted-foreground">大秘境层数</dt>
              <dd className="text-2xl font-bold tabular-nums">{entry.tier}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">通关用时</dt>
              <dd className="text-2xl font-bold tabular-nums">
                {formatDuration(entry.duration_ms)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">通关时间</dt>
              <dd className="pt-1.5 text-sm tabular-nums">{formatDateTime(entry.occurred_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">装备（{entry.equipment.length}）</h2>
        <EquipmentPanel equipment={entry.equipment} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">技能（{entry.skills.length}）</h2>
        <SkillsPanel skills={entry.skills} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">巅峰盘（{entry.paragon_boards.length}）</h2>
        <ParagonPanel boards={entry.paragon_boards} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">护符</h2>
        <TalismanPanel talismans={entry.talismans} />
      </section>
    </main>
  );
}
