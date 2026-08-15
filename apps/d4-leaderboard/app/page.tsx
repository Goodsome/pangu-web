import { Button } from "@pangu/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">D4 Leaderboard</h1>
      <p className="text-muted-foreground">Pangu Web monorepo 已就绪。</p>
      <div className="flex gap-3">
        <Button>默认按钮</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </main>
  );
}
