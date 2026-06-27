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
};