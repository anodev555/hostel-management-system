"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUrlParams } from "./use-url-params";
import { useDebouncedCallback } from "@/utils/useDebounceCallback";

export function DataTableSearch({
  placeholder = "Search...",
}: {
  placeholder?: string;
}) {
  const { push, searchParams } = useUrlParams();
  const current = searchParams.get("search") ?? "";
  const [text, setText] = useState(current);
  const inputRef = useRef<HTMLInputElement>(null);
  // Last value we pushed to the URL, so our own update doesn't overwrite typing
  const lastPushed = useRef(current);

  // Sync only when the URL changes from outside (back/forward, reset)
  useEffect(() => {
    if (current !== lastPushed.current) {
      lastPushed.current = current;
      setText(current);
    }
  }, [current]);

  const debouncedPush = useDebouncedCallback((query: string) => {
    const value = query.trim();
    if (value === lastPushed.current) return;
    lastPushed.current = value;
    push({ search: value || undefined, page: 1 });
  }, 400);

  function handleChange(value: string) {
    setText(value);
    debouncedPush(value);
  }

  function handleClear() {
    setText("");
    lastPushed.current = "";
    push({ search: undefined, page: 1 });
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={inputRef}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {text && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground smooth hover:bg-muted hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
