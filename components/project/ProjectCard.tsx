"use client";

import { useRouter } from "next/navigation";
import { FolderOpen, Trash2 } from "lucide-react";

type ProjectCardProps = {
  id: number;
  title: string;
  episodes: number;
  characters: number;
  onDelete: () => void;
};

export default function ProjectCard({
  id,
  title,
  episodes,
  characters,
  onDelete,
}: ProjectCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/projects/${id}`)}
      className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500"
    >
      <div className="flex items-start justify-between">
        <FolderOpen className="text-blue-500" size={32} />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">
        {title}
      </h3>

      <div className="mt-4 space-y-1 text-sm text-zinc-400">
        <p>Episodes : {episodes}</p>
        <p>Characters : {characters}</p>
      </div>
    </div>
  );
}