# pangu-web 项目 Agent 指导文档

## 📌 项目概述

**pangu-web** 是基于 **Bun + Turborepo + TypeScript** 的前端单体仓库，承载盘古（Pangu，后端在 `../pangu`）的内部管理系统与对外业务应用。UI 采用 shadcn/ui + Tailwind CSS v4。

## ⚖️ 编程规范与 Agent 工作流要求

1. **命令行执行规范**：
   - 统一使用 `bun` 运行命令：`bun run dev` / `bun run build` / `bun run lint` / `bun run typecheck`
   - 安装依赖必须用 `bun add` / `bun remove`，禁止手改 `package.json` 的依赖字段（workspace 内部依赖 `"workspace:*"` 除外）
   - 包管理器为 Bun，不使用 npm / pnpm / yarn
2. **代码风格要求**：
   - 命名：目录与包名 kebab-case（`apps/d4-leaderboard`、`packages/api-client`）；组件文件 PascalCase；工具/hooks 文件 camelCase
   - 共享 TS 配置统一 extends `@pangu/tsconfig`，不要在各包里重复散配置
   - 跨应用共享的组件放入 `packages/ui`（shadcn/ui 约定：用 shadcn CLI 添加，落盘在 `packages/ui/src/components`）
   - 对后端的请求一律走 `@pangu/api-client`，不要在应用里散写 fetch
3. **质量闭环与代码校验**：
   - 每次更新代码后，必须运行 `bun run check`（Biome lint + format 自动修复）并处理报错
   - 提交前 `bun run typecheck` 与 `bun run build` 必须通过
