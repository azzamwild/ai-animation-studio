import type { AnimationStory } from "@/types/story";
import type { AnimationCharacter } from "@/types/character";
import type { AnimationBackground } from "@/types/background";
import type { AnimationProp } from "@/types/prop";
import type { StoryboardScene } from "@/types/storyboard";

type GenerateDummyStoryboardParams = {
  story: AnimationStory;
  characters: AnimationCharacter[];
  backgrounds: AnimationBackground[];
  availableProps: AnimationProp[];
};

export function generateDummyStoryboard({
  story,
  characters,
  backgrounds,
  availableProps,
}: GenerateDummyStoryboardParams): StoryboardScene[] {
  const mainCharacter = characters[0]?.name || "Main Character";
  const mainBackground = backgrounds[0]?.name || "Default Background";
  const mainProp = availableProps[0]?.name || "No Prop";

  return [
    {
      id: Date.now() + 1,
      sceneNumber: 1,
      duration: "0-5s",
      background: mainBackground,
      character: mainCharacter,
      prop: mainProp,
      cameraShot: "Wide shot",
      cameraMovement: "Slow push in",
      characterMovement: `${mainCharacter} enters the scene naturally.`,
      facialExpression: "Curious and friendly",
      textOverlay: story.title,
      narration: `Hari itu, ${mainCharacter} memulai petualangan kecil yang tidak terduga.`,
      videoPrompt: `Vertical 9:16 cute 3D animation. ${mainCharacter} enters ${mainBackground} naturally with curious expression. Smooth slow push in camera movement. No dialogue, no lip sync, family friendly animation.`,
    },
    {
      id: Date.now() + 2,
      sceneNumber: 2,
      duration: "5-10s",
      background: mainBackground,
      character: mainCharacter,
      prop: mainProp,
      cameraShot: "Medium shot",
      cameraMovement: "Static camera",
      characterMovement: `${mainCharacter} notices something unusual.`,
      facialExpression: "Surprised",
      textOverlay: "Ada sesuatu yang aneh...",
      narration: `${mainCharacter} melihat sesuatu yang membuatnya penasaran.`,
      videoPrompt: `Vertical 9:16 cute 3D animation. ${mainCharacter} looks surprised while noticing something unusual in ${mainBackground}. Static camera, natural body movement, expressive face, no dialogue.`,
    },
    {
      id: Date.now() + 3,
      sceneNumber: 3,
      duration: "10-18s",
      background: mainBackground,
      character: mainCharacter,
      prop: mainProp,
      cameraShot: "Close up",
      cameraMovement: "Gentle handheld movement",
      characterMovement: `${mainCharacter} tries to understand the situation.`,
      facialExpression: "Concerned",
      textOverlay: "Harus bantu!",
      narration: `Tanpa ragu, ${mainCharacter} memutuskan untuk membantu.`,
      videoPrompt: `Vertical 9:16 cute emotional 3D animation. Close up of ${mainCharacter} with concerned expression. Gentle handheld camera movement, soft lighting, natural breathing and eye movement.`,
    },
    {
      id: Date.now() + 4,
      sceneNumber: 4,
      duration: "18-27s",
      background: mainBackground,
      character: mainCharacter,
      prop: mainProp,
      cameraShot: "Tracking shot",
      cameraMovement: "Follow movement",
      characterMovement: `${mainCharacter} moves quickly to solve the problem.`,
      facialExpression: "Focused and determined",
      textOverlay: "Ayo cepat!",
      narration: `${mainCharacter} berusaha sekuat tenaga agar semuanya baik-baik saja.`,
      videoPrompt: `Vertical 9:16 Pixar-style cute animation. ${mainCharacter} moves quickly with determined expression in ${mainBackground}. Follow camera movement, natural physics, smooth animation, no lip sync.`,
    },
    {
      id: Date.now() + 5,
      sceneNumber: 5,
      duration: "27-36s",
      background: mainBackground,
      character: mainCharacter,
      prop: mainProp,
      cameraShot: "Medium wide shot",
      cameraMovement: "Slow pan",
      characterMovement: `${mainCharacter} finally solves the problem.`,
      facialExpression: "Relieved and happy",
      textOverlay: "Berhasil!",
      narration: `Akhirnya, usaha ${mainCharacter} membuahkan hasil.`,
      videoPrompt: `Vertical 9:16 cute 3D animation. ${mainCharacter} looks relieved and happy after solving the problem. Slow pan camera, warm emotional atmosphere, family friendly.`,
    },
    {
      id: Date.now() + 6,
      sceneNumber: 6,
      duration: "36-45s",
      background: mainBackground,
      character: mainCharacter,
      prop: mainProp,
      cameraShot: "Hero shot",
      cameraMovement: "Slow zoom out",
      characterMovement: `${mainCharacter} smiles warmly at the end.`,
      facialExpression: "Happy and proud",
      textOverlay: "Kebaikan kecil bisa berarti besar",
      narration: `Dari petualangan itu, ${mainCharacter} belajar bahwa kebaikan kecil bisa membuat hari seseorang lebih indah.`,
      videoPrompt: `Vertical 9:16 emotional cute 3D animation. ${mainCharacter} smiles warmly in ${mainBackground}. Hero shot, slow zoom out, happy ending, no dialogue, no lip sync.`,
    },
  ];
}