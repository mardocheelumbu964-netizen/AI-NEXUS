import apiClient from "./apiClient";

export interface DocumentItem {
  id: number;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_type: string;
  file_path: string;
  file_size: number;
  extracted_text?: string | null;
  status: string;
  created_at: string;
}

export interface DocumentListResponse {
  documents: DocumentItem[];
  total: number;
}

export const uploadDocument = async (
  file: File,
): Promise<DocumentItem> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<DocumentItem>(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const getDocuments = async (): Promise<DocumentListResponse> => {
  const response = await apiClient.get<DocumentListResponse>(
    "/documents/",
  );

  return response.data;
};
