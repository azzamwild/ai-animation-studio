"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Download,
  RefreshCcw,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useProjects } from "@/hooks/useProjects";
import type { AnimationStory } from "@/types/story";
import type { AnimationExportPackage } from "@/types/exportPackage";

import {
  buildExportPackageText,
  loadExportPackage,
  loadProjectStories,
  loadStoryboardScenes,
} from "@/lib/localAnimationData";

type ExportItem = {
  story: AnimationStory;
  sceneCount: number;
  exportPackage: AnimationExportPackage | null;
};

export default function ProjectExportPage() {
  const params = useParams();
  const router = useRouter();

  const { loaded, getProjectById } = useProjects();

  const projectId = Number(params.id);
  const project = getProjectById(projectId);

  const [items, setItems] = useState<ExportItem[]>([]);
  const [copiedStoryId, setCopiedStoryId] = useState<number | null>(null);

  function loadData() {
    const stories = loadProjectStories(projectId);

    const nextItems = stories.map((story) => {
      const scenes = loadStoryboardScenes(projectId, story.id);
      const exportPackage = loadExportPackage(projectId, story.id);

      return {
        story,
        sceneCount: scenes.length,
        exportPackage,
      };
    });

    setItems(nextItems);
  }

  async function handleCopy(exportPackage: AnimationExportPackage, storyId: number) {
    const text = buildExportPackageText(exportPackage);

    await navigator.clipboard.writeText(text);

    setCopiedStoryId(storyId);

    setTimeout(() => {
      setCopiedStoryId(null);
    }, 1500);
  }

  useEffect(() => {
    if (!loaded) return;
    loadData();
  }, [loaded, projectId]);

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Loading export...
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
              <h1 className="text-4xl font-bold text-white">
                Export
              </h1>

              <p className="mt-2 text-zinc-400">
                Kelola export package untuk caption, title, hashtags,
                thumbnail text, dan CTA.
              </p>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-blue-500 hover:text-white"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {items.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="text-2xl font-semibold text-white">
                Belum ada story
              </h2>

              <p className="mt-2 text-zinc-400">
                Buat story dan storyboard dulu sebelum membuat export package.
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
                const { story, sceneCount, exportPackage } = item;

                const statusText = exportPackage
                  ? "Export ready"
                  : sceneCount > 0
                    ? "Ready to generate export"
                    : "Need storyboard first";

                return (
                  <div
                    key={story.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold text-white">
                            {story.title}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              exportPackage
                                ? "bg-emerald-500/10 text-emerald-300"
                                : sceneCount > 0
                                  ? "bg-blue-500/10 text-blue-300"
                                  : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {statusText}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-zinc-400">
                          {story.idea || "No story idea."}
                        </p>

                        {exportPackage ? (
                          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                              Export Title
                            </p>

                            <h3 className="mt-1 text-lg font-semibold text-white">
                              {exportPackage.title}
                            </h3>

                            <p className="mt-4 text-sm text-zinc-400">
                              {exportPackage.caption}
                            </p>

                            {exportPackage.hashtags.length > 0 && (
                              <p className="mt-4 text-sm text-blue-300">
                                {exportPackage.hashtags.join(" ")}
                              </p>
                            )}

                            <div className="mt-4 grid gap-3 text-sm text-zinc-400 md:grid-cols-2">
                              <div>
                                <span className="text-zinc-500">
                                  Thumbnail:
                                </span>{" "}
                                {exportPackage.thumbnailText || "-"}
                              </div>

                              <div>
                                <span className="text-zinc-500">
                                  CTA:
                                </span>{" "}
                                {exportPackage.callToAction || "-"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
                            {sceneCount > 0
                              ? "Storyboard sudah ada. Buka story detail lalu klik Generate Export Package."
                              : "Storyboard belum ada. Buat storyboard dulu sebelum export."}
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col gap-3">
                        <button
                          onClick={() =>
                            router.push(
                              `/projects/${projectId}/stories/${story.id}`
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                        >
                          <Download size={16} />
                          {exportPackage
                            ? "Open Export Detail"
                            : sceneCount > 0
                              ? "Generate Export"
                              : "Create Storyboard"}
                        </button>

                        {exportPackage && (
                          <button
                            onClick={() =>
                              handleCopy(exportPackage, story.id)
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-blue-500 hover:text-white"
                          >
                            <Copy size={16} />
                            {copiedStoryId === story.id
                              ? "Copied"
                              : "Copy Export"}
                          </button>
                        )}
                      </div>
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