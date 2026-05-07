import { apiClient } from '@/core/api/client';
import {
    DocumentsListResponse,
    DocumentUploadRequest,
    DocumentUploadResponse,
} from '../types';

export const DOCUMENT_URLS = {
    BASE: '/pharmacy/documents',
    UPLOAD: '/pharmacy/documents/upload',
    DETAIL: (id: string) => `/pharmacy/documents/${id}`,
} as const;

export class DocumentService {
    async uploadDocuments(data: DocumentUploadRequest): Promise<DocumentUploadResponse> {
        const formData = new FormData();

        data.files.forEach((file, index) => {
            formData.append('files', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType,
            } as any);
            formData.append(`documentType_${index}`, data.documentTypes[index]);
            formData.append(`documentName_${index}`, data.documentNames[index]);
        });

        const response = await apiClient.post<DocumentUploadResponse>(
            DOCUMENT_URLS.UPLOAD,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response;
    }

    async getDocuments(): Promise<DocumentsListResponse> {
        const response = await apiClient.get<DocumentsListResponse>(DOCUMENT_URLS.BASE);
        return response;
    }

    async deleteDocument(documentId: string): Promise<{ message: string }> {
        const response = await apiClient.delete<{ message: string }>(
            DOCUMENT_URLS.DETAIL(documentId)
        );
        return response;
    }
}

export const documentService = new DocumentService();
