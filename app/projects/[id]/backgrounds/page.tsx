"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import NewBackgroundDialog from "@/components/background/NewBackgroundDialog";
import BackgroundCard from "@/components/background/BackgroundCard";
import { useProjects } from "@/hooks/useProjects";
import { useBackgrounds } from "@/hooks/useBackgrounds";

export default function BackgroundsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);

  const { loaded: projectLoaded, getProjectById } = useProjects();
  const {
    backgrounds,
    loaded: backgroundsLoaded,
    createBackground,
    deleteBackground,
  } = useBackgrounds(projectId);

  const project = getProjectById(projectId);

  if (!projectLoaded || !backgroundsLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Loading backgrounds...
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Backgrounds
              </h1>

              <p className="mt-2 text-zinc-400">
                Manage reusable backgrounds for {project.title}.
              </p>
            </div>

            <NewBackgroundDialog onCreate={createBackground} />
          </div>

          {backgrounds.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center">
              <h3 className="text-xl font-semibold text-white">
                No backgrounds yet
              </h3>

              <p className="mt-2 text-zinc-400">
                Add your first background to build your animation asset library.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-3 gap-6">
              {backgrounds.map((background) => (
                <BackgroundCard
                  key={background.id}
                  background={background}
                  onDelete={() => deleteBackground(background.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}