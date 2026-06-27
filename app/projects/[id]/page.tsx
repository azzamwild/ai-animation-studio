"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Image,
  Box,
  BookOpen,
  Clapperboard,
  Download,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useProjects } from "@/hooks/useProjects";

const modules = [
  {
    name: "Characters",
    description: "Manage main characters and expressions.",
    icon: User,
    path: "characters",
    enabled: true,
  },
  {
    name: "Backgrounds",
    description: "Store reusable scenes and locations.",
    icon: Image,
    path: "backgrounds",
    enabled: true,
  },
  {
    name: "Props",
    description: "Manage objects used in animation scenes.",
    icon: Box,
    path: "props",
    enabled: true,
  },
  {
    name: "Stories",
    description: "Create story ideas and episode scripts.",
    icon: BookOpen,
    path: "stories",
    enabled: true,
  },
  {
    name: "Storyboard",
    description: "Break stories into scenes and shots.",
    icon: Clapperboard,
    path: "storyboard",
    enabled: false,
  },
  {
    name: "Export",
    description: "Export prompts for image and video tools.",
    icon: Download,
    path: "export",
    enabled: false,
  },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { loaded, getProjectById } = useProjects();

  const projectId = Number(params.id);
  const project = getProjectById(projectId);

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Loading project...
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
            onClick={() => router.push("/")}
            className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Projects
          </button>

          <div>
            <h1 className="text-4xl font-bold text-white">
              {project.title}
            </h1>

            <p className="mt-2 text-zinc-400">
              Manage assets, stories, storyboard, and prompts for this project.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;

              return (
                <div
                  key={module.name}
                  onClick={() => {
                    if (!module.enabled) return;
                    router.push(`/projects/${projectId}/${module.path}`);
                  }}
                  className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition ${
                    module.enabled
                      ? "cursor-pointer hover:border-blue-500"
                      : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <Icon className="text-blue-500" size={32} />

                  <div className="mt-4 flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-white">
                      {module.name}
                    </h3>

                    {!module.enabled && (
                      <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                        Soon
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-zinc-400">
                    {module.description}
                  </p>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}