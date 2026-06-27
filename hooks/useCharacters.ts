"use client";

import { useEffect, useState } from "react";
import type { AnimationCharacter } from "@/types/character";

export function useCharacters(projectId: number) {
  const storageKey = `ai-animation-characters-${projectId}`;

  const [characters, setCharacters] = useState<AnimationCharacter[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setCharacters(JSON.parse(saved));
      } catch {
        setCharacters([]);
      }
    }

    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(storageKey, JSON.stringify(characters));
  }, [characters, loaded, storageKey]);

  function createCharacter(data: {
    name: string;
    role: string;
    description: string;
    imageUrl?: string;
  }) {
    const newCharacter: AnimationCharacter = {
      id: Date.now(),
      projectId,
      name: data.name,
      role: data.role,
      description: data.description,
      imageUrl: data.imageUrl,
      createdAt: new Date().toISOString(),
    };

    setCharacters((prev) => [newCharacter, ...prev]);
  }

  function deleteCharacter(id: number) {
    setCharacters((prev) => prev.filter((character) => character.id !== id));
  }

  return {
    characters,
    loaded,
    createCharacter,
    deleteCharacter,
  };
}