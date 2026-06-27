"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import NewStoryDialog from "@/components/story/NewStoryDialog";
import StoryCard from "@/components/story/StoryCard";
import { useProjects } from "@/hooks/useProjects";
import { useStories } from "@/hooks/useStories";

export default function StoriesPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);

  const { loaded: projectLoaded, getProjectById } = useProjects();
  const {
    stories,
    loaded: storiesLoaded,
    createStory,
    deleteStory,
  } = useStories(projectId);

  const project = getProjectById(projectId);

  if (!projectLoaded || !storiesLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Loading stories...
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
                Stories
              </h1>

              <p className="mt-2 text-zinc-400">
                Manage story ideas for {project.title}.
              </p>
            </div>

            <NewStoryDialog onCreate={createStory} />
          </div>

          {stories.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center">
              <h3 className="text-xl font-semibold text-white">
                No stories yet
              </h3>

              <p className="mt-2 text-zinc-400">
                Add your first story idea before generating storyboard and prompts.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onDelete={() => deleteStory(story.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}