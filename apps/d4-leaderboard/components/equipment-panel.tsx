import type { Equipment } from "@pangu/api-client";
import { Badge } from "@pangu/ui";

import { rarityStyle, slotLabel } from "@/lib/equipment-meta";

/** 词缀特殊标记：太古 / 回火 / 重洗 / 嬗变 / 精炼 */
function AffixMarks({
  isGreater,
  isTemper,
  isRerolled,
  isTransfigured,
  isMasterworkCrit,
}: {
  isGreater: boolean;
  isTemper: boolean;
  isRerolled: boolean;
  isTransfigured: boolean;
  isMasterworkCrit: boolean;
}) {
  return (
    <span className="ml-1 gap-0.5">
      {isGreater && <sup className="text-amber-500">太古</sup>}
      {isTemper && <sup className="text-sky-500">回火</sup>}
      {isRerolled && <sup className="text-muted-foreground">重洗</sup>}
      {isTransfigured && <sup className="text-fuchsia-500">嬗变</sup>}
      {isMasterworkCrit && <sup className="text-red-500">精炼</sup>}
    </span>
  );
}

function EquipmentItem({ item }: { item: Equipment }) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{slotLabel(item.slot)}</span>
        <Badge variant="secondary" className={rarityStyle(item.rarity)}>
          {item.rarity}
        </Badge>
        <span className="text-sm font-medium">{item.base_type}</span>
        {item.is_ancestral && <Badge variant="outline">远古</Badge>}
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          强度 {item.item_power}
        </span>
      </div>

      {item.statlines.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {item.statlines
            .map((affix, idx) => ({
              ...affix,
              key: `${item.item_id}-affix-${affix.affix_id ?? affix.codename}-${idx}`,
            }))
            .map((affix) => (
              <li key={affix.key} className="text-sm">
                {affix.stat_type}
                <AffixMarks
                  isGreater={affix.is_greater}
                  isTemper={affix.is_temper}
                  isRerolled={affix.is_rerolled}
                  isTransfigured={affix.is_transfigured}
                  isMasterworkCrit={affix.is_masterwork_crit}
                />
              </li>
            ))}
        </ul>
      )}

      {(item.sockets.length > 0 || item.aspect_power) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.sockets
            .map((socket, idx) => ({ ...socket, key: `${item.item_id}-socket-${idx}` }))
            .map((socket) => (
              <Badge key={socket.key} variant="outline" className="text-xs">
                {socket.kind === "gem" ? "💎" : " ᚱ"} {socket.codename}
              </Badge>
            ))}
          {item.aspect_power && (
            <Badge
              variant="secondary"
              className="bg-orange-500/15 text-orange-700 dark:text-orange-400"
            >
              威能: {item.aspect_power.codename}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function EquipmentPanel({ equipment }: { equipment: Equipment[] }) {
  if (equipment.length === 0) {
    return <p className="text-sm text-muted-foreground">无装备数据</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {equipment.map((item) => (
        <EquipmentItem key={`${item.slot}-${item.item_id}`} item={item} />
      ))}
    </div>
  );
}
