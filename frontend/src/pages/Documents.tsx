import {
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  FileUp,
  FolderOpen,
  Layers3,
  Loader2,
  Search,
  Sparkles,
  UploadCloud,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  getDocuments,
  uploadDocument,
} from "../services/documentsApi";

import type { DocumentItem } from "../services/documentsApi";

const pipeline = [
  {
    title: "Document Upload",
    description: "PDF, DOCX, PPTX and TXT files",
    icon: UploadCloud,
  },
  {
    title: "Text Extraction",
    description: "Extract meaningful document content",
    icon: FileText,
  },
  {
    title: "Chunking",
    description: "Split content into searchable chunks",
    icon: Layers3,
  },
  {
    title: "Embeddings",
    description: "Convert chunks into vectors",
    icon: BrainCircuit,
  },
  {
    title: "Vector Database",
    description: "Store and retrieve knowledge",
    icon: Database,
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyles(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized === "processed" ||
    normalized === "indexed"
  ) {
    return {
      label: "Indexed",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (
    normalized.includes("fail") ||
    normalized.includes("error")
  ) {
    return {
      label: "Failed",
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    };
  }

  return {
    label: "Processing",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    icon: Loader2,
  };
}

export default function Documents() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDocuments();

      setDocuments(response.documents);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        "Unable to load your documents.";

      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUploadClick = () => {
    if (uploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".pptx",
      ".txt",
    ];

    const extension =
      "." +
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      setError(
        "Unsupported file type. Please upload PDF, DOCX, PPTX or TXT.",
      );
      return;
    }

    const maxSize =
      25 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "File is too large. Maximum allowed size is 25 MB.",
      );
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage(
        `Uploading and indexing "${file.name}"...`,
      );

      const uploadedDocument =
        await uploadDocument(file);

      setDocuments((current) => [
        uploadedDocument,
        ...current.filter(
          (document) =>
            document.id !== uploadedDocument.id,
        ),
      ]);

      setMessage(
        `"${file.name}" was uploaded and indexed successfully.`,
      );
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        "Document upload failed.";

      setError(detail);
      setMessage("");
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments = useMemo(() => {
    const term = searchTerm
      .trim()
      .toLowerCase();

    if (!term) {
      return documents;
    }

    return documents.filter((document) =>
      document.original_filename
        .toLowerCase()
        .includes(term),
    );
  }, [documents, searchTerm]);

  const indexedCount = documents.filter(
    (document) =>
      document.status.toLowerCase() ===
        "processed" ||
      document.status.toLowerCase() ===
        "indexed",
  ).length;

  const processingCount = documents.filter(
    (document) =>
      document.status.toLowerCase() ===
      "processing",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-[1450px] space-y-6">

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.pptx,.txt"
          onChange={handleFileChange}
        />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-teal-100 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Retrieval-Augmented Generation
              </div>

              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Your personal AI knowledge base.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Upload your academic materials and
                AI-NEXUS transforms them into searchable
                knowledge that powers context-aware answers.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}

                  {uploading
                    ? "Processing..."
                    : "Upload Document"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "document-library",
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <FolderOpen className="h-4 w-4" />
                  Browse Library
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Supported: PDF, DOCX, PPTX, TXT · Maximum 25 MB
              </p>

              {message && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Knowledge Base
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-900">
                    {documents.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    documents available to AI
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Database className="h-7 w-7 text-emerald-600" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white bg-white/80 p-3">
                  <p className="text-xs text-slate-500">
                    Indexed
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {indexedCount}
                  </p>
                </div>

                <div className="rounded-xl border border-white bg-white/80 p-3">
                  <p className="text-xs text-slate-500">
                    Processing
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {processingCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RAG Pipeline */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                AI Processing Pipeline
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                From document to intelligent knowledge
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Every uploaded file passes through the RAG
              pipeline before becoming available to the AI Tutor.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {pipeline.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-800">
                    {step.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {step.description}
                  </p>

                  <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-300">
                    0{index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Library */}
        <section
          id="document-library"
          className="rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 p-6 md:p-7">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Document Library
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  Your uploaded study materials
                </h2>
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search documents..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-7">
            {loading ? (
              <div className="flex min-h-56 flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="mt-3 text-sm text-slate-500">
                  Loading your document library...
                </p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <FileText className="h-7 w-7 text-slate-400" />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                  {searchTerm
                    ? "No matching documents"
                    : "No documents uploaded yet"}
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  {searchTerm
                    ? "Try another search term."
                    : "Upload your first study material to build your personal AI knowledge base."}
                </p>

                {!searchTerm && (
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload First Document
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="hidden grid-cols-[1.6fr_0.6fr_0.7fr_0.8fr_0.7fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid">
                  <span>Document</span>
                  <span>Type</span>
                  <span>Size</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>

                {filteredDocuments.map((document) => {
                  const statusInfo =
                    getStatusStyles(
                      document.status,
                    );

                  const StatusIcon =
                    statusInfo.icon;

                  return (
                    <div
                      key={document.id}
                      className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 md:grid-cols-[1.6fr_0.6fr_0.7fr_0.8fr_0.7fr] md:items-center md:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {document.original_filename}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Document #{document.id}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-500">
                        {document.file_type
                          .replace(".", "")
                          .toUpperCase()}
                      </div>

                      <div className="text-xs font-medium text-slate-500">
                        {formatFileSize(
                          document.file_size,
                        )}
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusInfo.className}`}
                        >
                          <StatusIcon
                            className={`h-3.5 w-3.5 ${
                              statusInfo.label ===
                              "Processing"
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-500">
                        {formatDate(
                          document.created_at,
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Explanation */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Why RAG matters
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              AI answers grounded in your materials.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              AI-NEXUS retrieves relevant sections from your
              uploaded documents before generating an answer.
              This helps the AI Tutor stay connected to your
              actual academic content instead of relying only
              on general model knowledge.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-800">
                  Grounded
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  Uses retrieved study material.
                </p>
              </div>

              <div className="rounded-2xl bg-teal-50 p-4">
                <p className="text-sm font-bold text-teal-800">
                  Personalized
                </p>
                <p className="mt-1 text-xs leading-5 text-teal-700">
                  Combines student context with knowledge.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-sm font-bold text-slate-800">
                  Searchable
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Vector retrieval finds relevant chunks.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm md:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              AI-NEXUS Knowledge Engine
            </p>

            <h2 className="mt-3 text-xl font-bold">
              Ready for context-aware learning.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Once indexed, your documents become available
              to the AI Tutor through the retrieval layer.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                  <BrainCircuit className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Vector retrieval active
                  </p>
                  <p className="text-xs text-slate-400">
                    ChromaDB knowledge layer
                  </p>
                </div>

                <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-300" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-3 border-t border-slate-200 py-5 text-xs text-slate-400 md:flex-row md:items-center">
          <p>
            AI-NEXUS · Intelligent Student Learning Platform
          </p>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            RAG Knowledge Engine Online
          </div>
        </footer>
      </div>
    </div>
  );
}
