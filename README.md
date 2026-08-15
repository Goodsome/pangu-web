# pangu-web

盘古（Pangu）Web 前端单体仓库。后端位于 [`../pangu`](../pangu)（Python + uv workspace DDD 单体仓库）。

## 技术栈

- **Bun** — 运行时与包管理（workspace）
- **Turborepo** — 任务编排与构建缓存
- **TypeScript** — 严格模式，共享 tsconfig 位于 `packages/tsconfig`
- **Biome** — lint + 格式化（不使用 ESLint/Prettier）
- **React 19** — SPA 用 Vite，SSR 用 Next.js（App Router）
- **shadcn/ui + Tailwind CSS v4** — 共享组件库位于 `packages/ui`

## 目录结构

```
apps/
  d4-leaderboard/       # 对外业务应用：Next.js (App Router)，对应后端 contexts/d4_leaderboard
packages/
  ui/                   # 共享 UI 库（shadcn/ui 组件 + Tailwind 主题）
  api-client/           # 后端 API 类型化客户端（PANGU_API_BASE_URL）
  tsconfig/             # 共享 TS 配置（base / next / react-library）
```

新增应用：在 `apps/` 下建目录（kebab-case），包名 `@pangu/<name>`，turbo 与 workspace 按 `apps/*` 通配符自动识别，无需改根配置。

## 常用命令

```bash
bun install            # 安装全部依赖
bun run dev            # 启动开发服务器（turbo dev）
bun run build          # 生产构建（turbo build，带缓存）
bun run lint           # biome check（lint + 格式检查）
bun run check          # biome check --write（自动修复并格式化）
bun run typecheck      # 全量类型检查（turbo typecheck）
```

## 环境变量

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `PANGU_API_BASE_URL` | pangu 后端 API 根地址 | `http://localhost:8000/api` |

各应用有自己的 `.env.local`（不入库），参考 `apps/*/.env.example`。
