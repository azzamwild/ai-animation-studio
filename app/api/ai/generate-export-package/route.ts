import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import type { AnimationStory } from "@/types/story";
import type { StoryboardScene } from "@/types/storyboard";
import type { AnimationExportPackage } from "@/types/exportPackage";

export const runtime = "nodejs";

type RequestBody = {
  projectTitle: string;
  story: AnimationStory;
  scenes: StoryboardScene[];
};

const exportPackageSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
    caption: {
      type: "string",
    },
    hashtags: {
      type: "array",
      items: {
        type: "string",
      },
    },
    thumbnailText: {
      type: "string",
    },
    pinnedComment: {
      type: "string",
    },
    callToAction: {
      type: "string",
    },
  },
  required: [
    "title",
    "description",
    "caption",
    "hashtags",
    "thumbnailText",
    "pinnedComment",
    "callToAction",
  ],
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

    const { projectTitle, story, scenes = [] } = body;

    if (!story) {
      return NextResponse.json(
        {
          error: "Story tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    if (scenes.length === 0) {
      return NextResponse.json(
        {
          error: "Storyboard scenes masih kosong.",
        },
        { status: 400 }
      );
    }

    const sceneText = scenes
      .map((scene) => {
        return `
Scene ${scene.sceneNumber} (${scene.duration})
Background: ${scene.background}
Character: ${scene.character}
Prop: ${scene.prop}
Text Overlay: ${scene.textOverlay}
Narration: ${scene.narration}
Video Prompt: ${scene.videoPrompt}
`;
      })
      .join("\n");

    const prompt = `
You are a short-form video publishing strategist for an AI Animation Studio.

Create a complete publishing export package for this animation story.

PROJECT:
${projectTitle}

STORY:
Title: ${story.title}
Idea: ${story.idea}
Category: ${story.category}
Target Platform: ${story.targetPlatform}
Duration: ${story.duration}
Language: ${story.language}

STORYBOARD:
${sceneText}

RULES:
- Output language must follow story language.
- Make it optimized for ${story.targetPlatform}.
- Make title clickable and emotional, but not clickbait.
- Description must be clear and natural.
- Caption must be short and suitable for social media.
- Hashtags must be relevant, lowercase, and include #.
- Thumbnail text must be very short, maximum 5 words.
- Pinned comment must invite engagement.
- Call to action must be friendly.
- Do not mention AI unless useful.
- Return JSON only.
- Do not add explanation.
`;

    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.interactions.create({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: exportPackageSchema,
      },
    });

    const rawText = response.output_text || "";

    const parsed = JSON.parse(rawText) as Omit<
      AnimationExportPackage,
      "createdAt"
    >;

    const exportPackage: AnimationExportPackage = {
      title: parsed.title || story.title,
      description: parsed.description || "",
      caption: parsed.caption || "",
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      thumbnailText: parsed.thumbnailText || story.title,
      pinnedComment: parsed.pinnedComment || "",
      callToAction: parsed.callToAction || "",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      exportPackage,
    });
  } catch (error) {
    console.error("Gemini export package error:", error);

    return NextResponse.json(
      {
        error: "Gagal generate export package dengan Gemini.",
      },
      { status: 500 }
    );
  }
}