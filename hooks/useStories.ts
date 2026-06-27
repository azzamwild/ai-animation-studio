"use client";

import { useEffect, useState } from "react";
import type { AnimationStory } from "@/types/story";

export function useStories(projectId: number) {
  const storageKey = `ai-animation-stories-${projectId}`;

  const [stories, setStories] = useState<AnimationStory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setStories(JSON.parse(saved));
      } catch {
        setStories([]);
      }
    }

    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(storageKey, JSON.stringify(stories));
  }, [stories, loaded, storageKey]);

  function createStory(data: {
    title: string;
    idea: string;
    category: string;
    targetPlatform: string;
    duration: string;
    language: string;
  }) {
    const newStory: AnimationStory = {
      id: Date.now(),
      projectId,
      title: data.title,
      idea: data.idea,
      category: data.category,
      targetPlatform: data.targetPlatform,
      duration: data.duration,
      language: data.language,
      status: "Draft",
      createdAt: new Date().toISOString(),
    };

    setStories((prev) => [newStory, ...prev]);
  }

  function deleteStory(id: number) {
    setStories((prev) => prev.filter((story) => story.id !== id));
  }

  function getStoryById(id: number) {
    return stories.find((story) => story.id === id);
  }

  function markStoryGenerated(id: number) {
    setStories((prev) =>
      prev.map((story) =>
        story.id === id
          ? {
              ...story,
              status: "Generated",
            }
          : story
      )
    );
  }

  return {
    stories,
    loaded,
    createStory,
    deleteStory,
    getStoryById,
    markStoryGenerated,
  };
}