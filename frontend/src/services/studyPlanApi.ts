import apiClient from "./apiClient";

export interface StudyPlan {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StudyTask {
  id: number;
  study_plan_id: number;
  subject: string;
  topic: string;
  scheduled_date: string;
  duration_minutes: number;
  priority: string;
  status: string;
  completion_percentage: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudyPlanDetail {
  plan: StudyPlan;
  tasks: StudyTask[];
}

export interface StudyPlanProgress {
  study_plan_id: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_duration_minutes: number;
  completed_duration_minutes: number;
  progress_percentage: number;
}

export interface StudyPlanCreate {
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  status?: string;
}

export interface StudyPlanUpdate {
  title?: string;
  description?: string | null;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface StudyTaskCreate {
  subject: string;
  topic: string;
  scheduled_date: string;
  duration_minutes: number;
  priority?: string;
  status?: string;
  completion_percentage?: number;
  notes?: string | null;
}

export interface StudyTaskUpdate {
  subject?: string;
  topic?: string;
  scheduled_date?: string;
  duration_minutes?: number;
  priority?: string;
  status?: string;
  completion_percentage?: number;
  notes?: string | null;
}

export async function generateStudyPlan(
  question: string,
  startDate: string,
  endDate: string
): Promise<StudyPlanDetail> {
  const response = await apiClient.post<StudyPlanDetail>(
    "/study-plans/generate",
    null,
    {
      params: {
        question,
        start_date: startDate,
        end_date: endDate,
      },
    }
  );

  return response.data;
}

export async function getStudyPlans(): Promise<StudyPlan[]> {
  const response = await apiClient.get<StudyPlan[]>("/study-plans/");
  return response.data;
}

export async function getStudyPlan(
  planId: number
): Promise<StudyPlanDetail> {
  const response = await apiClient.get<StudyPlanDetail>(
    `/study-plans/${planId}`
  );

  return response.data;
}

export async function createStudyPlan(
  data: StudyPlanCreate
): Promise<StudyPlan> {
  const response = await apiClient.post<StudyPlan>(
    "/study-plans/",
    data
  );

  return response.data;
}

export async function updateStudyPlan(
  planId: number,
  data: StudyPlanUpdate
): Promise<StudyPlan> {
  const response = await apiClient.put<StudyPlan>(
    `/study-plans/${planId}`,
    data
  );

  return response.data;
}

export async function deleteStudyPlan(
  planId: number
): Promise<void> {
  await apiClient.delete(`/study-plans/${planId}`);
}

export async function getStudyTasks(
  planId: number
): Promise<StudyTask[]> {
  const response = await apiClient.get<StudyTask[]>(
    `/study-plans/${planId}/tasks`
  );

  return response.data;
}

export async function createStudyTask(
  planId: number,
  data: StudyTaskCreate
): Promise<StudyTask> {
  const response = await apiClient.post<StudyTask>(
    `/study-plans/${planId}/tasks`,
    data
  );

  return response.data;
}

export async function updateStudyTask(
  planId: number,
  taskId: number,
  data: StudyTaskUpdate
): Promise<StudyTask> {
  const response = await apiClient.put<StudyTask>(
    `/study-plans/${planId}/tasks/${taskId}`,
    data
  );

  return response.data;
}

export async function deleteStudyTask(
  planId: number,
  taskId: number
): Promise<void> {
  await apiClient.delete(
    `/study-plans/${planId}/tasks/${taskId}`
  );
}

export async function getStudyPlanProgress(
  planId: number
): Promise<StudyPlanProgress> {
  const response = await apiClient.get<StudyPlanProgress>(
    `/study-plans/${planId}/progress`
  );

  return response.data;
}

export async function getStudyTasksForDate(
  planId: number,
  scheduledDate: string
): Promise<StudyTask[]> {
  const response = await apiClient.get<StudyTask[]>(
    `/study-plans/${planId}/tasks/date/${scheduledDate}`
  );

  return response.data;
}
