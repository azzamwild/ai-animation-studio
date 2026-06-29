"use client";

import { useState } from "react";
import { Copy, Pencil, RefreshCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { StoryboardScene } from "@/types/storyboard";

type StoryboardPanelProps = {
  scenes: StoryboardScene[];
  onClear: () => void;
  onUpdateScene: (
    sceneId: number,
    data: Partial<StoryboardScene>
  ) => void;
  onRegenerateScene: (scene: StoryboardScene) => void | Promise<void>;
  regeneratingSceneId: number | null;
};

type SceneForm = {
  sceneNumber: string;
  duration: string;
  background: string;
  character: string;
  prop: string;
  cameraShot: string;
  cameraMovement: string;
  characterMovement: string;
  facialExpression: string;
  textOverlay: string;
  narration: string;
  videoPrompt: string;
};

const emptyForm: SceneForm = {
  sceneNumber: "",
  duration: "",
  background: "",
  character: "",
  prop: "",
  cameraShot: "",
  cameraMovement: "",
  characterMovement: "",
  facialExpression: "",
  textOverlay: "",
  narration: "",
  videoPrompt: "",
};

export default function StoryboardPanel({
  scenes,
  onClear,
  onUpdateScene,
  onRegenerateScene,
  regeneratingSceneId,
}: StoryboardPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [editingScene, setEditingScene] =
    useState<StoryboardScene | null>(null);

  const [form, setForm] = useState<SceneForm>(emptyForm);

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

  function openEdit(scene: StoryboardScene) {
    setEditingScene(scene);

    setForm({
      sceneNumber: String(scene.sceneNumber),
      duration: scene.duration,
      background: scene.background,
      character: scene.character,
      prop: scene.prop,
      cameraShot: scene.cameraShot,
      cameraMovement: scene.cameraMovement,
      characterMovement: scene.characterMovement,
      facialExpression: scene.facialExpression,
      textOverlay: scene.textOverlay,
      narration: scene.narration,
      videoPrompt: scene.videoPrompt,
    });
  }

  function handleChange(field: keyof SceneForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSaveEdit() {
    if (!editingScene) return;

    onUpdateScene(editingScene.id, {
      sceneNumber:
        Number(form.sceneNumber) || editingScene.sceneNumber,
      duration: form.duration,
      background: form.background,
      character: form.character,
      prop: form.prop,
      cameraShot: form.cameraShot,
      cameraMovement: form.cameraMovement,
      characterMovement: form.characterMovement,
      facialExpression: form.facialExpression,
      textOverlay: form.textOverlay,
      narration: form.narration,
      videoPrompt: form.videoPrompt,
    });

    setEditingScene(null);
  }

  if (scenes.length === 0) {
    return null;
  }

  return (
    <>
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
              {scenes.length} scenes generated. You can edit or regenerate each scene.
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
          {scenes.map((scene) => {
            const isRegenerating =
              regeneratingSceneId === scene.id;

            return (
              <div
                key={scene.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Scene {scene.sceneNumber}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {scene.duration}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => openEdit(scene)}
                      disabled={isRegenerating}
                      className="bg-zinc-800 hover:bg-zinc-700"
                    >
                      <Pencil size={16} />
                      Edit
                    </Button>

                    <Button
                      onClick={() => onRegenerateScene(scene)}
                      disabled={isRegenerating}
                      className="bg-purple-600 hover:bg-purple-500"
                    >
                      <RefreshCcw size={16} />
                      {isRegenerating ? "Regenerating..." : "Regenerate"}
                    </Button>

                    <Button
                      onClick={() =>
                        copyText(
                          scene.videoPrompt,
                          `scene-${scene.sceneNumber}`
                        )
                      }
                      disabled={isRegenerating}
                      className="bg-zinc-800 hover:bg-zinc-700"
                    >
                      <Copy size={16} />
                      {copied === `scene-${scene.sceneNumber}`
                        ? "Copied"
                        : "Copy Prompt"}
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
                  <InfoItem label="Background" value={scene.background} />
                  <InfoItem label="Character" value={scene.character} />
                  <InfoItem label="Prop" value={scene.prop} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Camera Shot" value={scene.cameraShot} />
                  <InfoItem
                    label="Camera Movement"
                    value={scene.cameraMovement}
                  />
                </div>

                <SectionItem
                  label="Character Movement"
                  value={scene.characterMovement}
                />

                <SectionItem
                  label="Facial Expression"
                  value={scene.facialExpression}
                />

                <SectionItem
                  label="Text Overlay"
                  value={scene.textOverlay}
                />

                <SectionItem
                  label="Narration"
                  value={scene.narration}
                />

                <div className="mt-5">
                  <p className="text-sm text-zinc-500">
                    Video Prompt
                  </p>

                  <p className="mt-3 rounded-xl bg-zinc-900 p-4 text-sm leading-6 text-zinc-300">
                    {scene.videoPrompt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!editingScene}
        onOpenChange={(open) => {
          if (!open) setEditingScene(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-950 text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Edit Scene {editingScene?.sceneNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Scene Number"
                value={form.sceneNumber}
                onChange={(value) =>
                  handleChange("sceneNumber", value)
                }
              />

              <TextField
                label="Duration"
                value={form.duration}
                onChange={(value) =>
                  handleChange("duration", value)
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <TextField
                label="Background"
                value={form.background}
                onChange={(value) =>
                  handleChange("background", value)
                }
              />

              <TextField
                label="Character"
                value={form.character}
                onChange={(value) =>
                  handleChange("character", value)
                }
              />

              <TextField
                label="Prop"
                value={form.prop}
                onChange={(value) => handleChange("prop", value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Camera Shot"
                value={form.cameraShot}
                onChange={(value) =>
                  handleChange("cameraShot", value)
                }
              />

              <TextField
                label="Camera Movement"
                value={form.cameraMovement}
                onChange={(value) =>
                  handleChange("cameraMovement", value)
                }
              />
            </div>

            <TextAreaField
              label="Character Movement"
              value={form.characterMovement}
              onChange={(value) =>
                handleChange("characterMovement", value)
              }
            />

            <TextAreaField
              label="Facial Expression"
              value={form.facialExpression}
              onChange={(value) =>
                handleChange("facialExpression", value)
              }
            />

            <TextAreaField
              label="Text Overlay"
              value={form.textOverlay}
              onChange={(value) =>
                handleChange("textOverlay", value)
              }
            />

            <TextAreaField
              label="Narration"
              value={form.narration}
              onChange={(value) =>
                handleChange("narration", value)
              }
            />

            <TextAreaField
              label="Video Prompt"
              value={form.videoPrompt}
              onChange={(value) =>
                handleChange("videoPrompt", value)
              }
              minHeight="min-h-40"
            />

            <Button
              onClick={handleSaveEdit}
              className="w-full bg-blue-600 hover:bg-blue-500"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-zinc-500">{label}</p>
      <p className="mt-1 text-white">{value}</p>
    </div>
  );
}

function SectionItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mt-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-zinc-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  minHeight = "min-h-24",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}) {
  return (
    <div>
      <label className="text-sm text-zinc-400">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ${minHeight}`}
      />
    </div>
  );
}