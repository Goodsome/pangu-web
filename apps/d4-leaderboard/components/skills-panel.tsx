import type { Skill } from "@pangu/api-client";
import { Badge } from "@pangu/ui";

export function SkillsPanel({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) {
    return <p className="text-sm text-muted-foreground">无技能数据</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <div
          key={skill.sno}
          className="flex flex-wrap items-center gap-1.5 rounded-md border px-3 py-1.5"
        >
          <span className="text-sm font-medium">{skill.name}</span>
          {skill.modifiers.map((modifier) => (
            <Badge
              key={`${skill.sno}-${modifier.name}`}
              variant={modifier.is_main ? "default" : "secondary"}
              className="text-xs"
            >
              {modifier.name}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}
