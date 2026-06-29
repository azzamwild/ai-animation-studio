import type { AnimationStory } from "@/types/story";
import type { StoryboardScene } from "@/types/storyboard";
import type { AnimationExportPackage } from "@/types/exportPackage";

function safeParse(value: string | null) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeStory(value: any, projectId: number): AnimationStory | null {
  if (!value || typeof value !== "object") return null;

  const id = Number(value.id);
  const valueProjectId = Number(value.projectId);

  if (!id || valueProjectId !== projectId) return null;
  if (typeof value.title !== "string") return null;

  return {
    id,
    projectId: valueProjectId,
    title: value.title,
    idea: String(value.idea || ""),
    category: String(value.category || ""),
    targetPlatform: String(value.targetPlatform || ""),
    duration: String(value.duration || ""),
    language: String(value.language || ""),
    status: value.status === "Generated" ? "Generated" : "Draft",
    createdAt: String(value.createdAt || ""),
  };
}

function collectStories(
  value: any,
  projectId: number,
  result: Map<number, AnimationStory>
) {
  if (!value) return;

  if (Array.isArray(value)) {
    value.forEach((item) => collectStories(item, projectId, result));
    return;
  }

  if (typeof value !== "object") return;

  const story = normalizeStory(value, projectId);

  if (story) {
    result.set(story.id, story);
    return;
  }

  const possibleArrays = [
    value.stories,
    value.items,
    value.data,
    value.value,
  ];

  possibleArrays.forEach((item) => {
    if (item) collectStories(item, projectId, result);
  });
}

export function loadProjectStories(projectId: number): AnimationStory[] {
  if (typeof window === "undefined") return [];

  const result = new Map<number, AnimationStory>();

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key) continue;

    const parsed = safeParse(localStorage.getItem(key));
    collectStories(parsed, projectId, result);
  }

  return Array.from(result.values()).sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime() || 0;
    const dateB = new Date(b.createdAt).getTime() || 0;

    return dateB - dateA;
  });
}

function normalizeScene(value: any): StoryboardScene | null {
  if (!value || typeof value !== "object") return null;

  if (
    value.sceneNumber === undefined ||
    typeof value.videoPrompt !== "string"
  ) {
    return null;
  }

  return {
    id: Number(value.id) || Date.now(),
    sceneNumber: Number(value.sceneNumber) || 1,
    duration: String(value.duration || ""),
    background: String(value.background || ""),
    character: String(value.character || ""),
    prop: String(value.prop || ""),
    cameraShot: String(value.cameraShot || ""),
    cameraMovement: String(value.cameraMovement || ""),
    characterMovement: String(value.characterMovement || ""),
    facialExpression: String(value.facialExpression || ""),
    textOverlay: String(value.textOverlay || ""),
    narration: String(value.narration || ""),
    videoPrompt: String(value.videoPrompt || ""),
  };
}

function extractScenes(value: any): StoryboardScene[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeScene(item))
      .filter(Boolean) as StoryboardScene[];
  }

  if (typeof value !== "object") return [];

  if (Array.isArray(value.scenes)) {
    return extractScenes(value.scenes);
  }

  if (Array.isArray(value.storyboard)) {
    return extractScenes(value.storyboard);
  }

  return [];
}

export function loadStoryboardScenes(
  projectId: number,
  storyId: number
): StoryboardScene[] {
  if (typeof window === "undefined") return [];

  const exactKeys = [
    `ai-animation-storyboard-${projectId}-${storyId}`,
    `ai-animation-storyboard-${storyId}`,
    `storyboard-${projectId}-${storyId}`,
  ];

  for (const key of exactKeys) {
    const parsed = safeParse(localStorage.getItem(key));
    const scenes = extractScenes(parsed);

    if (scenes.length > 0) {
      return scenes;
    }
  }

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key) continue;

    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes("storyboard") &&
      key.includes(String(projectId)) &&
      key.includes(String(storyId))
    ) {
      const parsed = safeParse(localStorage.getItem(key));
      const scenes = extractScenes(parsed);

      if (scenes.length > 0) {
        return scenes;
      }
    }
  }

  return [];
}

function normalizeExportPackage(
  value: any
): AnimationExportPackage | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value.exportPackage || value.package || value;

  if (!candidate || typeof candidate !== "object") return null;
  if (typeof candidate.title !== "string") return null;

  return {
    title: String(candidate.title || ""),
    description: String(candidate.description || ""),
    caption: String(candidate.caption || ""),
    hashtags: Array.isArray(candidate.hashtags)
      ? candidate.hashtags.map((item: any) => String(item))
      : [],
    thumbnailText: String(candidate.thumbnailText || ""),
    pinnedComment: String(candidate.pinnedComment || ""),
    callToAction: String(candidate.callToAction || ""),
    createdAt: String(candidate.createdAt || ""),
  };
}

export function loadExportPackage(
  projectId: number,
  storyId: number
): AnimationExportPackage | null {
  if (typeof window === "undefined") return null;

  const exactKeys = [
    `ai-animation-export-package-${projectId}-${storyId}`,
    `ai-animation-export-package-${storyId}`,
    `export-package-${projectId}-${storyId}`,
  ];

  for (const key of exactKeys) {
    const parsed = safeParse(localStorage.getItem(key));
    const exportPackage = normalizeExportPackage(parsed);

    if (exportPackage) {
      return exportPackage;
    }
  }

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key) continue;

    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes("export") &&
      key.includes(String(projectId)) &&
      key.includes(String(storyId))
    ) {
      const parsed = safeParse(localStorage.getItem(key));
      const exportPackage = normalizeExportPackage(parsed);

      if (exportPackage) {
        return exportPackage;
      }
    }
  }

  return null;
}

export function buildExportPackageText(
  exportPackage: AnimationExportPackage
) {
  const hashtags = exportPackage.hashtags.join(" ");

  return `
TITLE:
${exportPackage.title}

DESCRIPTION:
${exportPackage.description}

CAPTION:
${exportPackage.caption}

HASHTAGS:
${hashtags}

THUMBNAIL TEXT:
${exportPackage.thumbnailText}

PINNED COMMENT:
${exportPackage.pinnedComment}

CALL TO ACTION:
${exportPackage.callToAction}
`.trim();
}