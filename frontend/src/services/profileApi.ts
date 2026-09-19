import apiClient from "./apiClient";

export interface StudentProfile {
  id?: number;
  user_id?: number;
  degree: string;
  university: string;
  academic_year: string;
  cgpa: number | null;
  technical_skills: string;
  learning_interests: string;
  career_goals: string;
  learning_preferences: string;
  bio: string;
}

export const getStudentProfile = async (): Promise<StudentProfile | null> => {
  const response = await apiClient.get<StudentProfile | null>(
    "/profile",
  );

  return response.data;
};

export const saveStudentProfile = async (
  profile: StudentProfile,
): Promise<StudentProfile> => {
  const response = await apiClient.post<StudentProfile>(
    "/profile",
    profile,
  );

  return response.data;
};
