"use client";

import { ImageIcon, Trash2 } from "lucide-react";
import type { AnimationBackground } from "@/types/background";

type BackgroundCardProps = {
  background: AnimationBackground;
  onDelete: () => void;
};

export default function BackgroundCard({
  background,
  onDelete,
}: BackgroundCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex h-32 w-full items-center justify-center rounded-xl bg-zinc-800">
          {background.imageUrl ? (
            <img
              src={background.imageUrl}
              alt={background.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <ImageIcon className="text-blue-500" size={36} />
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
        {background.name}
      </h3>

      <p className="mt-1 text-sm text-blue-400">
        {background.locationType}
      </p>

      <p className="mt-4 line-clamp-3 text-sm text-zinc-400">
        {background.description || "No description yet."}
      </p>
    </div>
  );
}