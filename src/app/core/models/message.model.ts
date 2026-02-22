// ========== Request Models ==========

export interface SendTextRequest {
  number: string;
  text: string;
  delay?: number;
}

export interface SendMediaRequest {
  number: string;
  mediatype: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  fileName: string;
  url: string;
  caption?: string;
}

export interface Contato {
  number: string;
  nome?: string;
}

export interface SendBulkTextRequest {
  contatos: Contato[];
  text: string;
  delayMinMs?: number;
  delayMaxMs?: number;
}

export interface SendBulkMediaRequest {
  contatos: Contato[];
  url: string;
  caption?: string;
  mediatype: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  delayMinMs?: number;
  delayMaxMs?: number;
}

// ========== Response Model ==========

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ========== Media type helper ==========

export const MEDIA_TYPES = [
  { value: 'image', label: 'Imagem' },
  { value: 'video', label: 'Vídeo' },
  { value: 'document', label: 'Documento' },
  { value: 'audio', label: 'Áudio' },
] as const;

export const MIME_TYPE_MAP: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/mpeg', 'video/webm'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4'],
};
