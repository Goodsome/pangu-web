import type { EquipmentRarity } from "@pangu/api-client";
import { EquipmentSlot } from "@pangu/api-client";

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  [EquipmentSlot.HELM]: "头部",
  [EquipmentSlot.CHEST_ARMOR]: "胸甲",
  [EquipmentSlot.OFF_HAND]: "副手",
  [EquipmentSlot.WEAPON]: "武器",
  [EquipmentSlot.GLOVES]: "手套",
  [EquipmentSlot.BOOTS]: "鞋子",
  [EquipmentSlot.PANTS]: "裤子",
  [EquipmentSlot.RING_1]: "戒指 Ⅰ",
  [EquipmentSlot.RING_2]: "戒指 Ⅱ",
  [EquipmentSlot.AMULET]: "项链",
  [EquipmentSlot.TWO_HANDED_WEAPON_1]: "双手武器 Ⅰ",
  [EquipmentSlot.TWO_HANDED_WEAPON_2]: "双手武器 Ⅱ",
  [EquipmentSlot.ONE_HANDED_WEAPON_1]: "单手武器 Ⅰ",
  [EquipmentSlot.ONE_HANDED_WEAPON_2]: "单手武器 Ⅱ",
  [EquipmentSlot.RANGED_WEAPON]: "远程武器",
};

export function slotLabel(slot: EquipmentSlot): string {
  return SLOT_LABELS[slot] ?? `槽位 ${slot}`;
}

/** 稀有度徽章配色（完整类名字面量，保证被 Tailwind 扫描到） */
const RARITY_STYLES: Record<EquipmentRarity, string> = {
  Normal: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  Magic: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  Rare: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  Legendary: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  Unique: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  "Mythic Unique": "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400",
  Mythic: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Set: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

export function rarityStyle(rarity: EquipmentRarity): string {
  return RARITY_STYLES[rarity] ?? RARITY_STYLES.Normal;
}
