import type { PlayerClass } from "@pangu/api-client";

interface ClassMeta {
  label: string;
  /** 徽章样式（完整类名字面量，保证被 Tailwind 扫描到） */
  badge: string;
}

const CLASS_META: Record<PlayerClass, ClassMeta> = {
  BARBARIAN: { label: "野蛮人", badge: "bg-red-500/15 text-red-700 dark:text-red-400" },
  DRUID: { label: "德鲁伊", badge: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  NECROMANCER: {
    label: "死灵法师",
    badge: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  },
  ROGUE: { label: "游侠", badge: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
  SORCERER: { label: "法师", badge: "bg-sky-500/15 text-sky-700 dark:text-sky-400" },
  SPIRITBORN: { label: "魂灵师", badge: "bg-teal-500/15 text-teal-700 dark:text-teal-400" },
  PALADIN: { label: "圣骑士", badge: "bg-orange-500/15 text-orange-700 dark:text-orange-400" },
  WARLOCK: { label: "术士", badge: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400" },
};

export const PLAYER_CLASSES = Object.keys(CLASS_META) as PlayerClass[];

export function classMeta(playerClass: PlayerClass): ClassMeta {
  return CLASS_META[playerClass];
}

export function isPlayerClass(value: string | undefined): value is PlayerClass {
  return value !== undefined && value in CLASS_META;
}

/** 前三名排名样式 */
export function rankStyle(rank: number): string | undefined {
  if (rank === 1) return "text-amber-500 font-bold";
  if (rank === 2) return "text-slate-400 font-bold";
  if (rank === 3) return "text-orange-700 dark:text-orange-400 font-bold";
  return undefined;
}
