import apiClient from "./apiClient";

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  project_type: string;
  status: string;
  progress: number;
  technologies: string | null;
  github_url: string | null;
  live_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  description?: string;
  project_type?: string;
  status?: string;
  progress?: number;
  technologies?: string;
  github_url?: string;
  live_url?: string;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  project_type?: string;
  status?: string;
  progress?: number;
  technologies?: string;
  github_url?: string;
  live_url?: string;
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get<Project[]>("/projects");
  return response.data;
};

export const getProject = async (
  projectId: number,
): Promise<Project> => {
  const response = await apiClient.get<Project>(
    `/projects/${projectId}`,
  );
  return response.data;
};

export const createProject = async (
  project: ProjectCreate,
): Promise<Project> => {
  const response = await apiClient.post<Project>(
    "/projects",
    project,
  );
  return response.data;
};

export const updateProject = async (
  projectId: number,
  project: ProjectUpdate,
): Promise<Project> => {
  const response = await apiClient.put<Project>(
    `/projects/${projectId}`,
    project,
  );
  return response.data;
};

export const deleteProject = async (
  projectId: number,
): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`);
};
