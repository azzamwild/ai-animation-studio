"use client";

import { useState } from "react";
import { Copy, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StoryboardScene } from "@/types/storyboard";

type VoiceOverPanelProps = {
  scenes: StoryboardScene[];
};

export default function VoiceOverPanel({ scenes }: VoiceOverPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);

    setCopied(label);

    setTimeout(() => {
      setCopied(null);
    }, 1500);
  }

  function copyAllVoiceOver() {
    const allVoiceOver = scenes
      .map((scene) => {
        return `Scene ${scene.sceneNumber} (${scene.duration})

${scene.narration}`;
      })
      .join(`

-----------------------------

`);

    copyText(allVoiceOver, "all");
  }

  if (scenes.length === 0) {
    return null;
  }

  return (
    <div
      id="voice-over-panel"
      className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Mic className="text-blue-500" size={28} />

            <h2 className="text-2xl font-semibold text-white">
              Voice Over Script
            </h2>
          </div>

          <p className="mt-2 text-zinc-400">
            Narration script generated from storyboard scenes.
          </p>
        </div>

        <Button
          onClick={copyAllVoiceOver}
          className="bg-blue-600 hover:bg-blue-500"
        >
          <Copy size={18} />
          {copied === "all" ? "Copied" : "Copy All Voice Over"}
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Scene {scene.sceneNumber}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Duration: {scene.duration}
                </p>
              </div>

              <Button
                onClick={() =>
                  copyText(scene.narration, `scene-${scene.sceneNumber}`)
                }
                className="bg-zinc-800 hover:bg-zinc-700"
              >
                <Copy size={16} />
                {copied === `scene-${scene.sceneNumber}`
                  ? "Copied"
                  : "Copy VO"}
              </Button>
            </div>

            <p className="mt-4 rounded-xl bg-zinc-900 p-4 text-sm leading-7 text-zinc-300">
              {scene.narration}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}