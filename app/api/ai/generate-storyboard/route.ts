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
  characters: AnimationCharacter[];
  backgrounds: AnimationBackground[];
  props: AnimationProp[];
};

const sceneSchema = {
  type: "object",
  properties: {
    scenes: {
      type: "array",
      description: "List of storyboard scenes.",
      items: {
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
      },
    },
  },
  required: ["scenes"],
  additionalProperties: false,
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const {
      projectTitle,
      story,
      characters = [],
      backgrounds = [],
      props = [],
    } = body;

    if (!story) {
      return NextResponse.json(
        {
          error: "Story tidak ditemukan.",
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

    const prompt = `
You are the Production Director of an AI Animation Studio.

Create a complete short-form animation storyboard.

PROJECT:
${projectTitle}

STORY:
Title: ${story.title}
Idea: ${story.idea}
Category: ${story.category}
Target Platform: ${story.targetPlatform}
Duration: ${story.duration}
Language: ${story.language}

AVAILABLE CHARACTERS:
${characterList}

AVAILABLE BACKGROUNDS:
${backgroundList}

AVAILABLE PROPS:
${propList}

RULES:
- Maximum 6 scenes.
- Total duration around 30-45 seconds.
- Family friendly.
- Emotional but simple.
- Happy ending.
- Always reuse existing characters, backgrounds, and props when available.
- Use exact asset names from the available asset list.
- If no prop is needed, use "No Prop".
- No dialogue.
- No lip sync.
- Vertical 9:16 animation.
- Narration must follow the requested story language.
- Video prompt must be written in English.
- Video prompt must be ready for AI video tools like Flow, Veo, Kling, Runway, or Pika.
- Each video prompt must mention vertical 9:16, natural movement, cute animation, no dialogue, no lip sync.

Return JSON only.
Do not add explanation.
`;

    const result = await generateJsonWithGeminiFallback<{
      scenes: Omit<StoryboardScene, "id">[];
    }>({
      prompt,
      schema: sceneSchema,
      label: "Generate storyboard",
    });

    const now = Date.now();

    const scenes: StoryboardScene[] = result.data.scenes.map(
      (scene: Omit<StoryboardScene, "id">, index: number) => {
        return {
          id: now + index,
          sceneNumber: Number(scene.sceneNumber) || index + 1,
          duration: scene.duration || "",
          background: scene.background || "Default Background",
          character: scene.character || "Main Character",
          prop: scene.prop || "No Prop",
          cameraShot: scene.cameraShot || "",
          cameraMovement: scene.cameraMovement || "",
          characterMovement: scene.characterMovement || "",
          facialExpression: scene.facialExpression || "",
          textOverlay: scene.textOverlay || "",
          narration: scene.narration || "",
          videoPrompt: scene.videoPrompt || "",
        };
      }
    );

    return NextResponse.json({
      scenes,
      provider: {
        name: "gemini",
        keyIndex: result.keyIndex,
        model: result.model,
      },
    });
  } catch (error: any) {
    console.error("Gemini storyboard error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Gagal generate storyboard dengan Gemini.",
      },
      { status: error?.statusCode || error?.status || 500 }
    );
  }
}