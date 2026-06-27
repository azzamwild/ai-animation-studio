"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clapperboard,
  FileText,
  Mic,
  PackageCheck,
  User,
  Image,
  Box,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import StoryboardPanel from "@/components/storyboard/StoryboardPanel";
import VoiceOverPanel from "@/components/storyboard/VoiceOverPanel";
import ExportPackagePanel from "@/components/storyboard/ExportPackagePanel";

import { useProjects } from "@/hooks/useProjects";
import { useStories } from "@/hooks/useStories";
import { useCharacters } from "@/hooks/useCharacters";
import { useBackgrounds } from "@/hooks/useBackgrounds";
import { useProps } from "@/hooks/useProps";
import { useStoryboard } from "@/hooks/useStoryboard";

import type { StoryboardScene } from "@/types/storyboard";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);
  const storyId = Number(params.storyId);

  const [showVoiceOver, setShowVoiceOver] = useState(false);
  const [showExportPackage, setShowExportPackage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { loaded: projectLoaded, getProjectById } = useProjects();

  const {
    loaded: storyLoaded,
    getStoryById,
    markStoryGenerated,
  } = useStories(projectId);

  const { characters } = useCharacters(projectId);
  const { backgrounds } = useBackgrounds(projectId);
  const { props } = useProps(projectId);

  const {
    scenes,
    loaded: storyboardLoaded,
    saveStoryboard,
    clearStoryboard,
  } = useStoryboard(projectId, storyId);

  const project = getProjectById(projectId);
  const story = getStoryById(storyId);

  if (!projectLoaded || !storyLoaded || !storyboardLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Loading story...
      </div>
    );
  }

  if (!project || !story) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Story not found.
      </div>
    );
  }

  const currentProject = project;
  const currentStory = story;

  function scrollToElement(id: string) {
    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  async function generateStoryboardScenes() {
    try {
      setIsGenerating(true);

      const response = await fetch("/api/ai/generate-storyboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectTitle: currentProject.title,
          story: currentStory,
          characters,
          backgrounds,
          props,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal generate storyboard.");
      }

      const generatedScenes = data.scenes as StoryboardScene[];

      saveStoryboard(generatedScenes);
      markStoryGenerated(storyId);

      return generatedScenes;
    } catch (error) {
      console.error(error);
      alert("Gagal generate storyboard dengan Gemini. Cek terminal server.");
      return [];
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateStoryboard() {
    await generateStoryboardScenes();
    scrollToElement("storyboard-panel");
  }

  async function handleScenePrompts() {
    if (scenes.length === 0) {
      await generateStoryboardScenes();
    }

    scrollToElement("storyboard-panel");
  }

  async function handleVoiceOver() {
    if (scenes.length === 0) {
      await generateStoryboardScenes();
    }

    setShowVoiceOver(true);
    scrollToElement("voice-over-panel");
  }

  async function handleExportPackage() {
    if (scenes.length === 0) {
      await generateStoryboardScenes();
    }

    setShowVoiceOver(true);
    setShowExportPackage(true);
    scrollToElement("export-package-panel");
  }

  function handleClearStoryboard() {
    clearStoryboard();
    setShowVoiceOver(false);
    setShowExportPackage(false);
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-8">
          <button
            onClick={() => router.push(`/projects/${projectId}/stories`)}
            className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Stories
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-white">
                  {currentStory.title}
                </h1>

                <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-400">
                  {currentStory.status}
                </span>
              </div>

              <p className="mt-2 text-zinc-400">
                Story detail for {currentProject.title}.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-sm text-zinc-500">
                Category
              </h3>

              <p className="mt-2 text-lg font-semibold text-white">
                {currentStory.category}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-sm text-zinc-500">
                Platform
              </h3>

              <p className="mt-2 text-lg font-semibold text-white">
                {currentStory.targetPlatform}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-sm text-zinc-500">
                Duration
              </h3>

              <p className="mt-2 text-lg font-semibold text-white">
                {currentStory.duration}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold text-white">
              Story Idea
            </h2>

            <p className="mt-4 leading-7 text-zinc-300">
              {currentStory.idea}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white">
              Available Assets
            </h2>

            <div className="mt-4 grid grid-cols-3 gap-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <User className="text-blue-500" size={28} />

                <p className="mt-4 text-3xl font-bold text-white">
                  {characters.length}
                </p>

                <p className="text-zinc-400">
                  Characters
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <Image className="text-blue-500" size={28} />

                <p className="mt-4 text-3xl font-bold text-white">
                  {backgrounds.length}
                </p>

                <p className="text-zinc-400">
                  Backgrounds
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <Box className="text-blue-500" size={28} />

                <p className="mt-4 text-3xl font-bold text-white">
                  {props.length}
                </p>

                <p className="text-zinc-400">
                  Props
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold text-white">
              AI Production Tools
            </h2>

            <p className="mt-2 text-zinc-400">
              Generate storyboard, scene prompts, voice over, and export package.
            </p>

            <div className="mt-6 grid grid-cols-4 gap-4">
              <Button
                disabled={isGenerating}
                onClick={handleGenerateStoryboard}
                className="h-24 flex-col gap-2 bg-blue-600 hover:bg-blue-500"
              >
                <Clapperboard size={24} />
                {isGenerating ? "Generating..." : "Generate Storyboard"}
              </Button>

              <Button
                disabled={isGenerating}
                onClick={handleScenePrompts}
                className="h-24 flex-col gap-2 bg-zinc-800 hover:bg-zinc-700"
              >
                <FileText size={24} />
                Scene Prompts
              </Button>

              <Button
                disabled={isGenerating}
                onClick={handleVoiceOver}
                className="h-24 flex-col gap-2 bg-zinc-800 hover:bg-zinc-700"
              >
                <Mic size={24} />
                Voice Over
              </Button>

              <Button
                disabled={isGenerating}
                onClick={handleExportPackage}
                className="h-24 flex-col gap-2 bg-zinc-800 hover:bg-zinc-700"
              >
                <PackageCheck size={24} />
                Export Package
              </Button>
            </div>
          </div>

          <StoryboardPanel
            scenes={scenes}
            onClear={handleClearStoryboard}
          />

          {showVoiceOver && (
            <VoiceOverPanel scenes={scenes} />
          )}

          {showExportPackage && (
            <ExportPackagePanel
              projectTitle={currentProject.title}
              story={currentStory}
              scenes={scenes}
            />
          )}
        </main>
      </div>
    </div>
  );
}