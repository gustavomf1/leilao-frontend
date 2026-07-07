export interface PaginaResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual, 0-indexada
  size: number;
}
