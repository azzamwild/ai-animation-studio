"use client";

import { Box, Trash2 } from "lucide-react";
import type { AnimationProp } from "@/types/prop";

type PropCardProps = {
  prop: AnimationProp;
  onDelete: () => void;
};

export default function PropCard({ prop, onDelete }: PropCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex h-32 w-full items-center justify-center rounded-xl bg-zinc-800">
          {prop.imageUrl ? (
            <img
              src={prop.imageUrl}
              alt={prop.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <Box className="text-blue-500" size={36} />
          )}
        </div>

        <button
          onClick={onDelete}
          className="ml-3 rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">
        {prop.name}
      </h3>

      <p className="mt-1 text-sm text-blue-400">
        {prop.category}
      </p>

      <p className="mt-4 line-clamp-3 text-sm text-zinc-400">
        {prop.description || "No description yet."}
      </p>
    </div>
  );
}