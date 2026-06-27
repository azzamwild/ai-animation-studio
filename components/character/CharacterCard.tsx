"use client";

import { Trash2, User } from "lucide-react";
import type { AnimationCharacter } from "@/types/character";

type CharacterCardProps = {
  character: AnimationCharacter;
  onDelete: () => void;
};

export default function CharacterCard({
  character,
  onDelete,
}: CharacterCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800">
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <User className="text-blue-500" size={28} />
          )}
        </div>

        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">
        {character.name}
      </h3>

      <p className="mt-1 text-sm text-blue-400">
        {character.role}
      </p>

      <p className="mt-4 line-clamp-3 text-sm text-zinc-400">
        {character.description || "No description yet."}
      </p>
    </div>
  );
}