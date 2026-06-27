"use client";

import { useState } from "react";
import { Copy, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AnimationStory } from "@/types/story";
import type { StoryboardScene } from "@/types/storyboard";

type ExportPackagePanelProps = {
  projectTitle: string;
  story: AnimationStory;
  scenes: StoryboardScene[];
};

export default function ExportPackagePanel({
  projectTitle,
  story,
  scenes,
}: ExportPackagePanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const title = `${story.title} | Cerita Animasi Pendek`;

  const description = `Cerita animasi pendek dari project ${projectTitle}.

${story.idea}

Video ini dibuat untuk format ${story.targetPlatform}, durasi ${story.duration}, dengan bahasa ${story.language}.`;

  const caption = `${story.title}

${story.idea}

Tonton sampai akhir ya!`;

  const hashtags =
    "#animasi #ceritaanak #shorts #aianimation #storytelling #kartunlucu";

  const thumbnailText = story.title;

  const allScenePrompts = scenes
    .map((scene) => {
      return `Scene ${scene.sceneNumber} (${scene.duration})

${scene.videoPrompt}`;
    })
    .join(`

-----------------------------

`);

  const allVoiceOver = scenes
    .map((scene) => {
      return `Scene ${scene.sceneNumber} (${scene.duration})

${scene.narration}`;
    })
    .join(`

-----------------------------

`);

  const exportPackage = `TITLE:
${title}

DESCRIPTION:
${description}

CAPTION:
${caption}

HASHTAGS:
${hashtags}

THUMBNAIL TEXT:
${thumbnailText}

SCENE PROMPTS:
${allScenePrompts}

VOICE OVER:
${allVoiceOver}`;

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);

    setCopied(label);

    setTimeout(() => {
      setCopied(null);
    }, 1500);
  }

  if (scenes.length === 0) {
    return null;
  }

  return (
    <div
      id="export-package-panel"
      className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <PackageCheck className="text-blue-500" size={28} />

            <h2 className="text-2xl font-semibold text-white">
              Export Package
            </h2>
          </div>

          <p className="mt-2 text-zinc-400">
            Final publishing package for video production and upload.
          </p>
        </div>

        <Button
          onClick={() => copyText(exportPackage, "all")}
          className="bg-blue-600 hover:bg-blue-500"
        >
          <Copy size={18} />
          {copied === "all" ? "Copied" : "Copy All Export"}
        </Button>
      </div>

      <div className="mt-6 space-y-5">
        <ExportItem
          label="Title"
          value={title}
          copied={copied === "title"}
          onCopy={() => copyText(title, "title")}
        />

        <ExportItem
          label="Description"
          value={description}
          copied={copied === "description"}
          onCopy={() => copyText(description, "description")}
        />

        <ExportItem
          label="Caption"
          value={caption}
          copied={copied === "caption"}
          onCopy={() => copyText(caption, "caption")}
        />

        <ExportItem
          label="Hashtags"
          value={hashtags}
          copied={copied === "hashtags"}
          onCopy={() => copyText(hashtags, "hashtags")}
        />

        <ExportItem
          label="Thumbnail Text"
          value={thumbnailText}
          copied={copied === "thumbnail"}
          onCopy={() => copyText(thumbnailText, "thumbnail")}
        />

        <ExportItem
          label="All Scene Prompts"
          value={allScenePrompts}
          copied={copied === "prompts"}
          onCopy={() => copyText(allScenePrompts, "prompts")}
        />

        <ExportItem
          label="All Voice Over"
          value={allVoiceOver}
          copied={copied === "voiceover"}
          onCopy={() => copyText(allVoiceOver, "voiceover")}
        />
      </div>
    </div>
  );
}

type ExportItemProps = {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
};

function ExportItem({
  label,
  value,
  copied,
  onCopy,
}: ExportItemProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">
          {label}
        </h3>

        <Button
          onClick={onCopy}
          className="bg-zinc-800 hover:bg-zinc-700"
        >
          <Copy size={16} />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <p className="mt-4 whitespace-pre-line rounded-xl bg-zinc-900 p-4 text-sm leading-7 text-zinc-300">
        {value}
      </p>
    </div>
  );
}