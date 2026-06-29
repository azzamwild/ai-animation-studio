"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clapperboard,
  RefreshCcw,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useProjects } from "@/hooks/useProjects";
import type { AnimationStory } from "@/types/story";

import {
  loadExportPackage,
  loadProjectStories,
  loadStoryboardScenes,
} from "@/lib/localAnimationData";

type StoryboardItem = {
  story: AnimationStory;
  sceneCount: number;
  hasExportPackage: boolean;
};

export default function ProjectStoryboardPage() {
  const params = useParams();
  const router = useRouter();

  const { loaded, getProjectById } = useProjects();

  const rawProjectId = params.id;
  const projectId = Number(
    Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId
  );

  const project = getProjectById(projectId);

  const [items, setItems] = useState<StoryboardItem[]>([]);

  function loadData() {
    const stories = loadProjectStories(projectId);

    const nextItems = stories.map((story) => {
      const scenes = loadStoryboardScenes(projectId, story.id);
      const exportPackage = loadExportPackage(projectId, story.id);

      return {
        story,
        sceneCount: scenes.length,
        hasExportPackage: Boolean(exportPackage),
      };
    });

    setItems(nextItems);
  }

  useEffect(() => {
    if (!loaded) return;
    loadData();
  }, [loaded, projectId]);

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Loading storyboard...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Project not found.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-8">
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Project
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Storyboard</h1>

              <p className="mt-2 text-zinc-400">
                Pilih story untuk generate, edit, regenerate scene, dan lanjut
                ke export package.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-blue-500 hover:text-white"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>

              <button
                onClick={() => router.push(`/projects/${projectId}/stories`)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                <BookOpen size={16} />
                Manage Stories
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-2xl font-semibold text-white">
                Belum ada story
              </h2>

              <p className="mt-2 text-zinc-400">
                Buat story dulu sebelum membuat storyboard.
              </p>

              <button
                onClick={() => router.push(`/projects/${projectId}/stories`)}
                className="mt-6 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Create Story
              </button>
            </div>
          ) : (
            <div className="mt-10 grid gap-6">
              {items.map((item) => {
                const { story, sceneCount, hasExportPackage } = item;

                return (
                  <div
                    key={story.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold text-white">
                            {story.title}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              sceneCount > 0
                                ? "bg-blue-500/10 text-blue-300"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {sceneCount > 0
                              ? `${sceneCount} scenes`
                              : "Need storyboard"}
                          </span>

                          {hasExportPackage && (
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                              Export ready
                            </span>
                          )}
                        </div>

                        <p className="mt-3 max-w-4xl text-sm text-zinc-400">
                          {story.idea || "No story idea."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                          <span>{story.category || "No category"}</span>
                          <span>•</span>
                          <span>{story.targetPlatform || "No platform"}</span>
                          <span>•</span>
                          <span>{story.duration || "No duration"}</span>
                          <span>•</span>
                          <span>{story.language || "No language"}</span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          router.push(
                            `/projects/${projectId}/stories/${story.id}`
                          )
                        }
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                      >
                        <Clapperboard size={16} />
                        {sceneCount > 0
                          ? "Open Storyboard"
                          : "Generate Storyboard"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}