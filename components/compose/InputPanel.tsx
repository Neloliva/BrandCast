"use client";

import { useState } from "react";
import { Link2, FileText, Upload, Type, X } from "lucide-react";
import type { ComposeSource } from "./ComposeRoot";

type Mode = "url" | "file" | "text";

export default function InputPanel({
  value,
  onChange,
}: {
  value: ComposeSource | null;
  onChange: (v: ComposeSource | null) => void;
}) {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  function commit(next: Partial<{ url: string; text: string; file: File }>) {
    if (mode === "url") {
      const u = next.url ?? url;
      onChange(u ? { kind: "url", url: u } : null);
    } else if (mode === "text") {
      const t = next.text ?? text;
      onChange(t ? { kind: "text", text: t } : null);
    } else if (mode === "file") {
      const f = next.file ?? file;
      onChange(f ? { kind: "file", file: f } : null);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const f = files[0];
    setFile(f);
    setMode("file");
    onChange({ kind: "file", file: f });
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-1 rounded-md border border-border bg-muted/50 p-1 text-sm">
        <ModeTab active={mode === "url"} onClick={() => setMode("url")} icon={<Link2 size={14} />}>
          URL
        </ModeTab>
        <ModeTab active={mode === "file"} onClick={() => setMode("file")} icon={<Upload size={14} />}>
          File
        </ModeTab>
        <ModeTab active={mode === "text"} onClick={() => setMode("text")} icon={<Type size={14} />}>
          Paste text
        </ModeTab>
      </div>

      {mode === "url" && (
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              commit({ url: e.target.value });
            }}
            placeholder="https://example.com/article"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {url && (
            <p className="mt-2 truncate text-xs text-muted-foreground">
              <Link2 size={12} className="mb-0.5 mr-1 inline" />
              {safeHostname(url)}
            </p>
          )}
        </div>
      )}

      {mode === "file" && (
        <div>
          <label
            htmlFor="file-input"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex h-44 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-sm transition ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30 hover:bg-muted/50"
            }`}
          >
            <Upload size={20} className="mb-2 text-muted-foreground" />
            <span className="text-muted-foreground">
              Drop a file here, or <span className="underline">click to browse</span>
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PDF, DOCX, MD, TXT — up to 10MB
            </span>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".pdf,.docx,.md,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          {file && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <FileText size={14} className="text-muted-foreground" />
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button
                onClick={() => {
                  setFile(null);
                  onChange(null);
                }}
                className="ml-auto rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "text" && (
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            commit({ text: e.target.value });
          }}
          rows={10}
          placeholder="Paste an article, transcript, or notes…"
          className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-sm transition ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
