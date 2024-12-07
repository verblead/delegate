"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  priority: "low" | "medium" | "high";
  deadline: string | null;
  created_at: string;
  created_by: string;
  team_members: string[];
  files_count: number;
  tasks_count: number;
  team_members_count: number;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          team_members_count,
          files_count,
          tasks_count
        `)
        .or(`created_by.eq.${user.id},project_members.cs.{${user.id}}`)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data);
      } else if (error) {
        console.error("Error fetching projects:", error);
      }
      setLoading(false);
    };

    fetchProjects();

    const channel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects"
        },
        fetchProjects
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  const createProject = async (project: Partial<Project>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...project,
          created_by: user.id,
          status: "planning",
          project_members: [user.id]
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating project:", error);
      return null;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId)
        .eq("created_by", user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating project:", error);
      return false;
    }
  };

  return {
    projects,
    loading,
    createProject,
    updateProject
  };
}