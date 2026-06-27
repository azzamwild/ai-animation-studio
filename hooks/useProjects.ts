"use client";

import { useEffect, useState } from "react";
import { projects as defaultProjects } from "@/data/projects";
import type { Project } from "@/types/project";

const STORAGE_KEY = "ai-animation-projects";

export function useProjects() {
  const [projectList, setProjectList] = useState<Project[]>(defaultProjects);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setProjectList(JSON.parse(saved));
      } catch {
        setProjectList(defaultProjects);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projectList));
  }, [projectList, loaded]);

  function createProject(title: string) {
    const newProject: Project = {
      id: Date.now(),
      title,
      episodes: 0,
      characters: 0,
    };

    setProjectList((prev) => [newProject, ...prev]);
  }

  function deleteProject(id: number) {
    setProjectList((prev) => prev.filter((project) => project.id !== id));
  }

  function getProjectById(id: number) {
    return projectList.find((project) => project.id === id);
  }

  return {
    projectList,
    loaded,
    createProject,
    deleteProject,
    getProjectById,
  };
}