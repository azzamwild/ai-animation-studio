import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import type { AnimationStory } from "@/types/story";
import type { AnimationCharacter } from "@/types/character";
import type { AnimationBackground } from "@/types/background";
import type { AnimationProp } from "@/types/prop";
import type { StoryboardScene } from "@/types/storyboard";

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
          sceneNumber: {
            type: "integer",
          },
          duration: {
            type: "string",
          },
          background: {
            type: "string",
          },
          character: {
            type: "string",
          },
          prop: {
            type: "string",
          },
          cameraShot: {
            type: "string",
          },
          cameraMovement: {
            type: "string",
          },
          characterMovement: {
            type: "string",
          },
          facialExpression: {
            type: "string",
          },
          textOverlay: {
            type: "string",
          },
          narration: {
            type: "string",
          },
          videoPrompt: {
            type: "string",
          },
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
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY belum ada di .env.local",
        },
        { status: 500 }
      );
    }

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

    const ai = new GoogleGenAI({
      apiKey,
    });

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

    const response = await ai.interactions.create({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: sceneSchema,
      },
    });

    const rawText = response.output_text || "";

    const parsed = JSON.parse(rawText) as {
      scenes: Omit<StoryboardScene, "id">[];
    };

    const now = Date.now();

    const scenes: StoryboardScene[] = parsed.scenes.map((scene, index) => {
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
    });

    return NextResponse.json({
      scenes,
    });
  } catch (error) {
    console.error("Gemini storyboard error:", error);

    return NextResponse.json(
      {
        error: "Gagal generate storyboard dengan Gemini.",
      },
      { status: 500 }
    );
  }
}