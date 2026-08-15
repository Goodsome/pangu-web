import type { ParagonBoard } from "@pangu/api-client";
import { Badge } from "@pangu/ui";

export function ParagonPanel({ boards }: { boards: ParagonBoard[] }) {
  if (boards.length === 0) {
    return <p className="text-sm text-muted-foreground">无巅峰盘数据</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {boards.map((board) => (
        <div key={board.sno} className="rounded-md border p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{board.codename}</span>
            {board.glyph && (
              <Badge variant="secondary" className="text-xs">
                雕文: {board.glyph.name}
              </Badge>
            )}
          </div>
          {board.legendary_node && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              传奇节点: {board.legendary_node}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
