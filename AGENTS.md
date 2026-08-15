# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📌 项目概述

**pangu-web** 是基于 **Bun + Turborepo + TypeScript** 的前端单体仓库，承载盘古（Pangu）的内部管理系统（Vite SPA，规划中）与对外业务应用（Next.js SSR）。后端为 `../pangu`（Python + uv workspace DDD 单体仓库）。UI 采用 shadcn/ui + Tailwind CSS v4。

## ⚖️ 编程规范与 Agent 工作流要求

1. **命令行执行规范**：
   - 统一使用 `bun` 运行命令：`bun run dev` / `bun run build` / `bun run lint` / `bun run typecheck`
   - 安装依赖必须用 `bun add` / `bun remove`，禁止手改 `package.json` 的依赖字段（workspace 内部依赖 `"workspace:*"` 除外）
   - shell 中给 bun 传含 `*` 的参数必须加引号：`bun add -d "@pangu/tsconfig@workspace:*"`（zsh 会把 `*` 当 glob 展开）
   - 包管理器为 Bun，不使用 npm / pnpm / yarn
2. **代码风格要求**：
   - 命名：目录与包名 kebab-case（`apps/d4-leaderboard`、`packages/api-client`）；组件文件 PascalCase；工具/hooks 文件 camelCase
   - 共享 TS 配置统一 extends `@pangu/tsconfig`，不要在各包里重复散配置
   - 跨应用共享的组件放入 `packages/ui`（shadcn/ui 约定：用 shadcn CLI 添加，落盘在 `packages/ui/src/components`）
   - 对后端的请求一律走 `@pangu/api-client`，不要在应用里散写 fetch
3. **质量闭环与代码校验**：
   - 每次更新代码后，必须运行 `bun run check`（Biome lint + format 自动修复）并处理报错
   - 提交前 `bun run typecheck` 与 `bun run build` 必须通过

## 🏗️ 架构

- 根 `package.json` 定义 bun workspaces（`apps/*`、`packages/*`）；turbo 与 workspace 均按通配符扫描，**新增应用/包不需要改根配置**，但需在其 `package.json` 里声明用到的 workspace 依赖（bun 隔离安装不会隐式链接，例如 tsconfig 也要 `"@pangu/tsconfig": "workspace:*"`）
- 共享包（`packages/ui`、`packages/api-client`）**不做构建**，`exports` 直接指向 TS 源码，由消费方通过 `transpilePackages` 编译；turbo 中共享包只有 `typecheck` 任务
- `packages/ui` 内部组件使用**相对导入**（`../lib/utils`），不用 `@/` 别名——应用的 `@/*` 路径映射会在类型检查共享包源码时冲突

### Tailwind v4 monorepo 链路（改动样式时必读）

- `@import "tailwindcss"` 和 `@import "tw-animate-css"` **只能放在应用的全局样式**（如 `apps/d4-leaderboard/app/globals.css`）中；放在 `packages/ui` 的 CSS 里会因解析不到包而构建失败
- `packages/ui/src/styles.css` 只放主题 token（CSS 变量 + `@theme inline` 映射），由应用侧 `@import "@pangu/ui/styles.css"` 引入
- 应用的全局样式必须带 `@source "../../../packages/ui/src"`（相对路径从该 CSS 文件算起），否则 ui 包组件的类名不会被生成——**此路径随应用目录深度变化，新增应用时注意调整**
- 修改依赖后若构建报错，先确认相关包的 `node_modules` 链接（bun 每包独立安装，依赖必须显式声明）

## 🔧 常用命令

```bash
bun install                 # 安装全部依赖
bun run dev                 # 启动开发服务器（turbo dev，d4-leaderboard 在 :3000，被占用时自动换端口）
bun run build               # 生产构建（turbo build，带缓存）
bun run lint                # biome check（lint + 格式检查，只读）
bun run check               # biome check --write（自动修复并格式化）
bun run typecheck           # 全量类型检查（turbo typecheck）
bunx biome check <file>     # 检查单个文件
```

环境变量：`PANGU_API_BASE_URL`（后端 API 根地址，见 `apps/*/.env.example`，各应用用自己的 `.env.local`）。
