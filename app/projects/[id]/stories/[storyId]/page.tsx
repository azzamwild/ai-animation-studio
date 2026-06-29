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
import { useExportPackage } from "@/hooks/useExportPackage";

import type { StoryboardScene } from "@/types/storyboard";
import type { AnimationExportPackage } from "@/types/exportPackage";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);
  const storyId = Number(params.storyId);

  const [showVoiceOver, setShowVoiceOver] = useState(false);
  const [showExportPackage, setShowExportPackage] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [isGeneratingExport, setIsGeneratingExport] = useState(false);
  const [regeneratingSceneId, setRegeneratingSceneId] =
    useState<number | null>(null);

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
    updateScene,
    clearStoryboard,
  } = useStoryboard(projectId, storyId);

  const {
    exportPackage,
    loaded: exportPackageLoaded,
    saveExportPackage,
    clearExportPackage,
  } = useExportPackage(projectId, storyId);

  const project = getProjectById(projectId);
  const story = getStoryById(storyId);

  const isBusy =
    isGeneratingStoryboard ||
    isGeneratingExport ||
    regeneratingSceneId !== null;

  if (
    !projectLoaded ||
    !storyLoaded ||
    !storyboardLoaded ||
    !exportPackageLoaded
  ) {
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
      setIsGeneratingStoryboard(true);

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

      clearExportPackage();
      setShowExportPackage(false);

      return generatedScenes;
    } catch (error) {
      console.error(error);
      alert("Gagal generate storyboard dengan Gemini. Cek terminal server.");
      return [];
    } finally {
      setIsGeneratingStoryboard(false);
    }
  }

  async function generateAIExportPackage(sourceScenes: StoryboardScene[]) {
    try {
      setIsGeneratingExport(true);

      const response = await fetch("/api/ai/generate-export-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectTitle: currentProject.title,
          story: currentStory,
          scenes: sourceScenes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal generate export package.");
      }

      const generatedExportPackage =
        data.exportPackage as AnimationExportPackage;

      saveExportPackage(generatedExportPackage);

      return generatedExportPackage;
    } catch (error) {
      console.error(error);
      alert("Gagal generate export package dengan Gemini. Cek terminal server.");
      return null;
    } finally {
      setIsGeneratingExport(false);
    }
  }

  async function handleRegenerateScene(scene: StoryboardScene) {
    try {
      setRegeneratingSceneId(scene.id);

      const response = await fetch("/api/ai/regenerate-scene", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectTitle: currentProject.title,
          story: currentStory,
          currentScene: scene,
          scenes,
          characters,
          backgrounds,
          props,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal regenerate scene.");
      }

      const regeneratedScene = data.scene as StoryboardScene;

      updateScene(scene.id, regeneratedScene);

      clearExportPackage();
      setShowExportPackage(false);
    } catch (error) {
      console.error(error);
      alert("Gagal regenerate scene dengan Gemini. Cek terminal server.");
    } finally {
      setRegeneratingSceneId(null);
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
    let currentScenes = scenes;

    if (currentScenes.length === 0) {
      currentScenes = await generateStoryboardScenes();
    }

    if (currentScenes.length === 0) {
      return;
    }

    if (!exportPackage) {
      const generated = await generateAIExportPackage(currentScenes);

      if (!generated) {
        return;
      }
    }

    setShowVoiceOver(true);
    setShowExportPackage(true);
    scrollToElement("export-package-panel");
  }

  async function handleRegenerateExportPackage() {
    let currentScenes = scenes;

    if (currentScenes.length === 0) {
      currentScenes = await generateStoryboardScenes();
    }

    if (currentScenes.length === 0) {
      return;
    }

    const generated = await generateAIExportPackage(currentScenes);

    if (!generated) {
      return;
    }

    setShowVoiceOver(true);
    setShowExportPackage(true);
    scrollToElement("export-package-panel");
  }

  function handleUpdateScene(
    sceneId: number,
    data: Partial<StoryboardScene>
  ) {
    updateScene(sceneId, data);

    clearExportPackage();
    setShowExportPackage(false);
  }

  function handleClearStoryboard() {
    clearStoryboard();
    clearExportPackage();

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
              <h3 className="text-sm text-zinc-500">Category</h3>

              <p className="mt-2 text-lg font-semibold text-white">
                {currentStory.category}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-sm text-zinc-500">Platform</h3>

              <p className="mt-2 text-lg font-semibold text-white">
                {currentStory.targetPlatform}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-sm text-zinc-500">Duration</h3>

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

                <p className="text-zinc-400">Characters</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <Image className="text-blue-500" size={28} />

                <p className="mt-4 text-3xl font-bold text-white">
                  {backgrounds.length}
                </p>

                <p className="text-zinc-400">Backgrounds</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <Box className="text-blue-500" size={28} />

                <p className="mt-4 text-3xl font-bold text-white">
                  {props.length}
                </p>

                <p className="text-zinc-400">Props</p>
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
                disabled={isBusy}
                onClick={handleGenerateStoryboard}
                className="h-24 flex-col gap-2 bg-blue-600 hover:bg-blue-500"
              >
                <Clapperboard size={24} />

                {isGeneratingStoryboard
                  ? "Generating..."
                  : "Generate Storyboard"}
              </Button>

              <Button
                disabled={isBusy}
                onClick={handleScenePrompts}
                className="h-24 flex-col gap-2 bg-zinc-800 hover:bg-zinc-700"
              >
                <FileText size={24} />
                Scene Prompts
              </Button>

              <Button
                disabled={isBusy}
                onClick={handleVoiceOver}
                className="h-24 flex-col gap-2 bg-zinc-800 hover:bg-zinc-700"
              >
                <Mic size={24} />
                Voice Over
              </Button>

              <Button
                disabled={isBusy}
                onClick={handleExportPackage}
                className="h-24 flex-col gap-2 bg-zinc-800 hover:bg-zinc-700"
              >
                <PackageCheck size={24} />

                {isGeneratingExport ? "Generating..." : "Export Package"}
              </Button>
            </div>

            {exportPackage && (
              <button
                disabled={isBusy}
                onClick={handleRegenerateExportPackage}
                className="mt-4 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                Regenerate AI Export Package
              </button>
            )}
          </div>

          <StoryboardPanel
            scenes={scenes}
            onClear={handleClearStoryboard}
            onUpdateScene={handleUpdateScene}
            onRegenerateScene={handleRegenerateScene}
            regeneratingSceneId={regeneratingSceneId}
          />

          {showVoiceOver && (
            <VoiceOverPanel scenes={scenes} />
          )}

          {showExportPackage && exportPackage && (
            <ExportPackagePanel
              exportPackage={exportPackage}
              scenes={scenes}
            />
          )}
        </main>
      </div>
    </div>
  );
}