"use client";

import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StoryboardScene } from "@/types/storyboard";

type StoryboardPanelProps = {
  scenes: StoryboardScene[];
  onClear: () => void;
};

export default function StoryboardPanel({
  scenes,
  onClear,
}: StoryboardPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);

    setCopied(label);

    setTimeout(() => {
      setCopied(null);
    }, 1500);
  }

  function copyAllPrompts() {
    const allPrompts = scenes
      .map((scene) => {
        return `Scene ${scene.sceneNumber} (${scene.duration})

${scene.videoPrompt}`;
      })
      .join(`

-----------------------------

`);

    copyText(allPrompts, "all");
  }

  if (scenes.length === 0) {
    return null;
  }

  return (
    <div
      id="storyboard-panel"
      className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Generated Storyboard
          </h2>

          <p className="mt-2 text-zinc-400">
            {scenes.length} scenes generated. Copy prompts for video generation.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={copyAllPrompts}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Copy size={18} />
            {copied === "all" ? "Copied" : "Copy All Prompts"}
          </Button>

          <Button
            onClick={onClear}
            className="bg-red-600 hover:bg-red-500"
          >
            <Trash2 size={18} />
            Clear
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Scene {scene.sceneNumber}
              </h3>

              <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-400">
                {scene.duration}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Background</p>
                <p className="mt-1 text-white">
                  {scene.background}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Character</p>
                <p className="mt-1 text-white">
                  {scene.character}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Prop</p>
                <p className="mt-1 text-white">
                  {scene.prop}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Camera Shot</p>
                <p className="mt-1 text-white">
                  {scene.cameraShot}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Camera Movement</p>
                <p className="mt-1 text-white">
                  {scene.cameraMovement}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-zinc-500">
                Character Movement
              </p>

              <p className="mt-1 text-sm text-zinc-300">
                {scene.characterMovement}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-sm text-zinc-500">
                Facial Expression
              </p>

              <p className="mt-1 text-sm text-zinc-300">
                {scene.facialExpression}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-sm text-zinc-500">
                Text Overlay
              </p>

              <p className="mt-1 text-sm text-zinc-300">
                {scene.textOverlay}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-sm text-zinc-500">
                Narration
              </p>

              <p className="mt-1 text-sm text-zinc-300">
                {scene.narration}
              </p>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">
                  Video Prompt
                </p>

                <Button
                  onClick={() =>
                    copyText(scene.videoPrompt, `scene-${scene.sceneNumber}`)
                  }
                  className="bg-zinc-800 hover:bg-zinc-700"
                >
                  <Copy size={16} />
                  {copied === `scene-${scene.sceneNumber}`
                    ? "Copied"
                    : "Copy Prompt"}
                </Button>
              </div>

              <p className="mt-3 rounded-xl bg-zinc-900 p-4 text-sm leading-6 text-zinc-300">
                {scene.videoPrompt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}