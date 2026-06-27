"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ProjectCard from "@/components/project/ProjectCard";
import NewProjectDialog from "@/components/project/NewProjectDialog";
import { useProjects } from "@/hooks/useProjects";

export default function Home() {
  const { projectList, createProject, deleteProject } = useProjects();

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                My Projects
              </h1>

              <p className="mt-2 text-zinc-400">
                Manage your animation projects
              </p>
            </div>

            <NewProjectDialog onCreate={createProject} />
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {projectList.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                episodes={project.episodes}
                characters={project.characters}
                onDelete={() => deleteProject(project.id)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}