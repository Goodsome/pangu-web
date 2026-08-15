import type { TalismanAffix, TalismanSnapshot } from "@pangu/api-client";
import { Badge } from "@pangu/ui";

import { rarityStyle } from "@/lib/equipment-meta";

function TalismanStatlines({ statlines }: { statlines: TalismanAffix[] }) {
  if (statlines.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-0.5">
      {statlines.map((affix) => (
        <li key={affix.codename} className="text-sm">
          {affix.stat_type}
          <span className="ml-1">
            {affix.is_greater && <sup className="text-amber-500">大词缀</sup>}
            {affix.is_mythic && <sup className="text-fuchsia-500">神话</sup>}
            {affix.is_set_bonus && <sup className="text-emerald-500">套装</sup>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TalismanPanel({ talismans }: { talismans: TalismanSnapshot | null }) {
  if (!talismans || (!talismans.seal && talismans.charms.length === 0)) {
    return <p className="text-sm text-muted-foreground">无护符数据</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {talismans.seal && (
        <div className="rounded-md border p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">护印</span>
            <Badge variant="secondary" className={rarityStyle(talismans.seal.rarity)}>
              {talismans.seal.rarity}
            </Badge>
            <span className="text-sm font-medium">{talismans.seal.name}</span>
          </div>
          <TalismanStatlines statlines={talismans.seal.statlines} />
        </div>
      )}
      {talismans.charms.map((charm) => (
        <div key={charm.codename} className="rounded-md border p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">护身符</span>
            <Badge variant="secondary" className={rarityStyle(charm.rarity)}>
              {charm.rarity}
            </Badge>
            <span className="text-sm font-medium">{charm.name}</span>
            {charm.set_name && <Badge variant="outline">{charm.set_name}</Badge>}
          </div>
          <TalismanStatlines statlines={charm.statlines} />
        </div>
      ))}
    </div>
  );
}
