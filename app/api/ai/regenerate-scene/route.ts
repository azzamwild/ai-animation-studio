import { NextResponse } from "next/server";

import type { AnimationStory } from "@/types/story";
import type { AnimationCharacter } from "@/types/character";
import type { AnimationBackground } from "@/types/background";
import type { AnimationProp } from "@/types/prop";
import type { StoryboardScene } from "@/types/storyboard";

import { generateJsonWithGeminiFallback } from "@/services/ai/geminiFallback";

export const runtime = "nodejs";

type RequestBody = {
  projectTitle: string;
  story: AnimationStory;
  currentScene: StoryboardScene;
  scenes: StoryboardScene[];
  characters: AnimationCharacter[];
  backgrounds: AnimationBackground[];
  props: AnimationProp[];
};

const sceneSchema = {
  type: "object",
  properties: {
    sceneNumber: { type: "integer" },
    duration: { type: "string" },
    background: { type: "string" },
    character: { type: "string" },
    prop: { type: "string" },
    cameraShot: { type: "string" },
    cameraMovement: { type: "string" },
    characterMovement: { type: "string" },
    facialExpression: { type: "string" },
    textOverlay: { type: "string" },
    narration: { type: "string" },
    videoPrompt: { type: "string" },
  },
  required: [
    "sceneNumber",
    "duration",
    "background",
    "character",
    "prop",
    "cameraShot",
    "cameraMovement",
    "characterMovement",
    "facialExpression",
    "textOverlay",
    "narration",
    "videoPrompt",
  ],
  additionalProperties: false,
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const {
      projectTitle,
      story,
      currentScene,
      scenes = [],
      characters = [],
      backgrounds = [],
      props = [],
    } = body;

    if (!story || !currentScene) {
      return NextResponse.json(
        {
          error: "Story atau scene tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    const characterList =
      characters.length > 0
        ? characters
            .map((character) => {
              return `- ${character.name} (${character.role}): ${
                character.description || "No description"
              }`;
            })
            .join("\n")
        : "- No character available";

    const backgroundList =
      backgrounds.length > 0
        ? backgrounds
            .map((background) => {
              return `- ${background.name} (${background.locationType}): ${
                background.description || "No description"
              }`;
            })
            .join("\n")
        : "- No background available";

    const propList =
      props.length > 0
        ? props
            .map((prop) => {
              return `- ${prop.name} (${prop.category}): ${
                prop.description || "No description"
              }`;
            })
            .join("\n")
        : "- No prop available";

    const currentSceneIndex = scenes.findIndex(
  (scene) => scene.id === currentScene.id
);

const contextScenes = [
  scenes[currentSceneIndex - 1],
  currentScene,
  scenes[currentSceneIndex + 1],
].filter(Boolean) as StoryboardScene[];

const sceneContext = contextScenes
  .map((scene) => {
    return `
Scene ${scene.sceneNumber} (${scene.duration})
Background: ${scene.background}
Character: ${scene.character}
Prop: ${scene.prop}
Camera Shot: ${scene.cameraShot}
Camera Movement: ${scene.cameraMovement}
Character Movement: ${scene.characterMovement}
Facial Expression: ${scene.facialExpression}
Text Overlay: ${scene.textOverlay}
Narration: ${scene.narration}
`;
  })
  .join("\n");

    const creativeDirections = [
      "make it more emotional",
      "make it more cinematic",
      "make it more funny and cute",
      "make it more dramatic but still family friendly",
      "make it more visually dynamic",
      "make it warmer and more heartwarming",
    ];

    const randomDirection =
      creativeDirections[
        Math.floor(Math.random() * creativeDirections.length)
      ];

    const prompt = `
You are the Production Director of an AI Animation Studio.

Regenerate ONLY ONE storyboard scene.

PROJECT:
${projectTitle}

STORY:
Title: ${story.title}
Idea: ${story.idea}
Category: ${story.category}
Target Platform: ${story.targetPlatform}
Duration: ${story.duration}
Language: ${story.language}

FULL STORYBOARD CONTEXT:
${sceneContext}

SCENE TO REGENERATE:
Scene Number: ${currentScene.sceneNumber}
Duration: ${currentScene.duration}
Background: ${currentScene.background}
Character: ${currentScene.character}
Prop: ${currentScene.prop}
Camera Shot: ${currentScene.cameraShot}
Camera Movement: ${currentScene.cameraMovement}
Character Movement: ${currentScene.characterMovement}
Facial Expression: ${currentScene.facialExpression}
Text Overlay: ${currentScene.textOverlay}
Narration: ${currentScene.narration}
Video Prompt: ${currentScene.videoPrompt}

CREATIVE DIRECTION:
${randomDirection}

AVAILABLE CHARACTERS:
${characterList}

AVAILABLE BACKGROUNDS:
${backgroundList}

AVAILABLE PROPS:
${propList}

RULES:
- Regenerate only this one scene.
- Keep the same sceneNumber.
- Keep the same duration unless absolutely necessary.
- Keep continuity with previous and next scenes.
- Preserve the story purpose of this scene.
- But make the regenerated result noticeably different from the current scene.
- Do not copy the same narration sentence.
- Do not copy the same video prompt sentence.
- Change at least 4 of these fields:
  cameraShot, cameraMovement, characterMovement, facialExpression, textOverlay, narration, videoPrompt.
- Use more specific and cinematic visual details.
- Use exact asset names from available assets when possible.
- If no prop is needed, use "No Prop".
- Narration must follow story language.
- Video prompt must be written in English.
- Video prompt must be ready for AI video tools.
- Video prompt must mention vertical 9:16, natural movement, cute animation, no dialogue, no lip sync.
- No dialogue.
- No lip sync.
- Family friendly.
- Return JSON only.
- Do not add explanation.
`;

    const result = await generateJsonWithGeminiFallback<
      Omit<StoryboardScene, "id">
    >({
      prompt,
      schema: sceneSchema,
      label: "Regenerate scene",
    });

    const parsed = result.data;

    const regeneratedScene: StoryboardScene = {
      id: currentScene.id,
      sceneNumber: Number(parsed.sceneNumber) || currentScene.sceneNumber,
      duration: parsed.duration || currentScene.duration,
      background: parsed.background || currentScene.background,
      character: parsed.character || currentScene.character,
      prop: parsed.prop || currentScene.prop,
      cameraShot: parsed.cameraShot || currentScene.cameraShot,
      cameraMovement: parsed.cameraMovement || currentScene.cameraMovement,
      characterMovement:
        parsed.characterMovement || currentScene.characterMovement,
      facialExpression:
        parsed.facialExpression || currentScene.facialExpression,
      textOverlay: parsed.textOverlay || currentScene.textOverlay,
      narration: parsed.narration || currentScene.narration,
      videoPrompt: parsed.videoPrompt || currentScene.videoPrompt,
    };

    return NextResponse.json({
      scene: regeneratedScene,
      provider: {
        name: "gemini",
        keyIndex: result.keyIndex,
        model: result.model,
      },
    });
  } catch (error: any) {
    console.error("Gemini regenerate scene error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Gagal regenerate scene dengan Gemini.",
      },
      { status: error?.statusCode || error?.status || 500 }
    );
  }
}