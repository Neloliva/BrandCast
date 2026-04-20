"use client";

import { PLATFORMS, type PlatformId } from "@/src/platforms/registry";

export default function PlatformPicker({
  value,
  onChange,
}: {
  value: PlatformId[];
  onChange: (next: PlatformId[]) => void;
}) {
  function toggle(id: PlatformId) {
    if (value.includes(id)) {
      onChange(value.filter((p) => p !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Platforms
      </label>
      <div className="flex flex-wrap gap-2">
        {Object.values(PLATFORMS).map((p) => {
          const active = value.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {p.displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
