import apiClient from "./apiClient";

export interface AnalyticsOverview {
  study_progress?: number;
  learning_progress?: number;
  study_consistency?: number;

  career_readiness?: number;
  resume_readiness?: number;
  resume_score?: number;

  skill_progress?: number;

  projects_completed?: number;
  assessments_completed?: number;
  assessment_average?: number;

  study_hours?: number;
  weekly_hours?: number;
  weekly_target?: number;
  weekly_target_progress?: number;

  learning_streak?: number;
  activity_count?: number;

  completed_tasks?: number;
  total_tasks?: number;

  weekly_activity?: {
    day: string;
    date: string;
    hours: number;
  }[];

  skill_breakdown?: {
    name: string;
    progress: number;
    status: string;
  }[];

  [key: string]: unknown;
}

export interface SkillIntelligenceItem {
  name: string;
  level: number;
  status: string;
  description: string;
}

export interface SkillIntelligenceResponse {
  overall_score: number;
  skills: SkillIntelligenceItem[];
}

export const getAnalyticsOverview =
  async (): Promise<AnalyticsOverview> => {
    const response = await apiClient.get<AnalyticsOverview>(
      "/analytics/overview",
    );

    return response.data;
  };

export const getSkillIntelligence =
  async (): Promise<SkillIntelligenceResponse> => {
    const response = await apiClient.get<SkillIntelligenceResponse>(
      "/assessment/skill-intelligence",
    );

    return response.data;
  };
