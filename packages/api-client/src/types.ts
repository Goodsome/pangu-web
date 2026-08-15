/**
 * d4_leaderboard 后端 DTO 的 TypeScript 镜像类型。
 * 字段以后端 contexts/d4_leaderboard 的 application/dtos 与 domain/value_objects 为准，
 * 修改后端模型时需同步更新此处。
 */

/** 职业枚举（packages/d4_types PlayerClass） */
export type PlayerClass =
  | "BARBARIAN"
  | "DRUID"
  | "NECROMANCER"
  | "ROGUE"
  | "SORCERER"
  | "SPIRITBORN"
  | "PALADIN"
  | "WARLOCK";

/** 稀有度 */
export type EquipmentRarity =
  | "Normal"
  | "Magic"
  | "Rare"
  | "Legendary"
  | "Unique"
  | "Mythic Unique"
  | "Mythic"
  | "Set";

/** 装备槽位代码（暴雪 SNO 槽位数值） */
export enum EquipmentSlot {
  HELM = 288,
  CHEST_ARMOR = 304,
  OFF_HAND = 320,
  WEAPON = 336,
  GLOVES = 352,
  BOOTS = 384,
  PANTS = 400,
  RING_1 = 416,
  RING_2 = 432,
  AMULET = 448,
  TWO_HANDED_WEAPON_1 = 465,
  TWO_HANDED_WEAPON_2 = 466,
  ONE_HANDED_WEAPON_1 = 467,
  ONE_HANDED_WEAPON_2 = 468,
  RANGED_WEAPON = 469,
}

/** 插槽种类 */
export type SocketKind = "gem" | "rune";

/** 装备词缀 / 属性行 */
export interface Affix {
  affix_id: number | null;
  codename: string;
  stat_type: string;
  is_greater: boolean;
  is_temper: boolean;
  is_rerolled: boolean;
  is_transfigured: boolean;
  is_masterwork_crit: boolean;
}

/** 装备插槽（宝石/符文） */
export interface Socket {
  id: number;
  kind: SocketKind;
  codename: string;
}

/** 传奇威能 / 专属特效 */
export interface AspectPower {
  id: number;
  codename: string;
  category: number;
  is_transfigured: boolean;
}

/** 单件装备快照 */
export interface Equipment {
  item_id: number;
  codename: string;
  slot: EquipmentSlot;
  base_type: string;
  rarity: EquipmentRarity;
  item_power: number;
  is_ancestral: boolean;
  statlines: Affix[];
  sockets: Socket[];
  aspect_power: AspectPower | null;
}

/** 技能强化/变体选项 */
export interface SkillModifier {
  name: string;
  is_main: boolean;
  bit: number | null;
}

/** 技能快照 */
export interface Skill {
  sno: number;
  codename: string;
  name: string;
  modifiers: SkillModifier[];
}

/** 巅峰雕文 */
export interface ParagonGlyph {
  sno: number;
  name: string;
}

/** 巅峰盘 */
export interface ParagonBoard {
  sno: number;
  codename: string;
  legendary_node: string | null;
  glyph: ParagonGlyph | null;
}

/** 护符/护印词缀 */
export interface TalismanAffix {
  codename: string;
  stat_type: string;
  is_greater: boolean;
  is_mythic: boolean;
  is_set_bonus: boolean;
}

/** 护印（Seal） */
export interface TalismanSeal {
  codename: string;
  name: string;
  rarity: EquipmentRarity;
  statlines: TalismanAffix[];
}

/** 护身符（Charm） */
export interface TalismanCharm {
  codename: string;
  name: string;
  rarity: EquipmentRarity;
  set_name: string | null;
  statlines: TalismanAffix[];
}

/** 护符系统完整快照 */
export interface TalismanSnapshot {
  seal: TalismanSeal | null;
  charms: TalismanCharm[];
}

/** 榜条目 = 一次通关记录 + Build 快照 */
export interface Entry {
  id: string;
  player_name: string;
  player_class: PlayerClass;
  tier: number;
  duration_ms: number;
  occurred_at: string;
  equipment: Equipment[];
  skills: Skill[];
  paragon_boards: ParagonBoard[];
  talismans: TalismanSnapshot | null;
}

/** 分页包装（foundation.common_types.page.Page） */
export interface Page<T> {
  items: T[];
  total: number;
  current: number;
  size: number | null;
}
