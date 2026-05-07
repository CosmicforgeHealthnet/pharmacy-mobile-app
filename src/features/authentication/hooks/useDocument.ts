import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/document.service';
import type { DocumentUploadRequest } from '../types';

export const DOCUMENT_KEYS = {
    all: ['documents'] as const,
    list: () => [...DOCUMENT_KEYS.all, 'list'] as const,
};

export function useUploadDocuments() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DocumentUploadRequest) => documentService.uploadDocuments(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.list() });
            queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
        },
    });
}

export function useDocuments() {
    return useQuery({
        queryKey: DOCUMENT_KEYS.list(),
        queryFn: () => documentService.getDocuments(),
    });
}
