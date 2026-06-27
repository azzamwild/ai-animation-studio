export type ExportPackageScene = {
  sceneNumber: number;
  title: string;
  duration: string;
  imagePrompt: string;
  videoPrompt: string;
  cameraMovement: string;
  animationDirection: string;
  voiceOver: string;
  soundEffect: string;
  backgroundMusic: string;
  negativePrompt: string;
};

export type ExportPackage = {
  title: string;
  format: string;
  aspectRatio: string;
  styleGuide: string;
  productionNotes: string;
  scenes: ExportPackageScene[];
};

export type AnimationStory = {
  id: number;
  projectId: number;
  title: string;
  idea: string;
  category: string;
  targetPlatform: string;
  duration: string;
  language: string;
  status: "Draft" | "Generated";
  createdAt: string;

  storyboard?: unknown[];
  scenePrompts?: unknown[];
  voiceOver?: string | string[];
  exportPackage?: ExportPackage | string;
};