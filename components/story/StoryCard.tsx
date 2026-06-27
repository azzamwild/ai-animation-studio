"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Trash2 } from "lucide-react";
import type { AnimationStory } from "@/types/story";

type StoryCardProps = {
  story: AnimationStory;
  onDelete: () => void;
};

export default function StoryCard({ story, onDelete }: StoryCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() =>
        router.push(`/projects/${story.projectId}/stories/${story.id}`)
      }
      className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500"
    >
      <div className="flex items-start justify-between">
        <BookOpen className="text-blue-500" size={32} />

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

      <div className="mt-4 flex items-center gap-2">
        <h3 className="text-xl font-semibold text-white">
          {story.title}
        </h3>

        <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
          {story.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-blue-400">
        {story.category} • {story.targetPlatform}
      </p>

      <p className="mt-4 line-clamp-4 text-sm text-zinc-400">
        {story.idea}
      </p>

      <div className="mt-5 space-y-1 text-xs text-zinc-500">
        <p>Duration: {story.duration}</p>
        <p>Language: {story.language}</p>
      </div>
    </div>
  );
}