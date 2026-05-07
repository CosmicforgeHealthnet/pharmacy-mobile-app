import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WalletService } from '../services/wallet.service';
import type { AddBankAccountPayload, RespondToDisputePayload, RequestPayoutPayload } from '../types';

export const WALLET_QUERY_KEYS = {
    all: ['wallet'] as const,
    summary: () => [...WALLET_QUERY_KEYS.all, 'summary'] as const,
    transactions: (params: any) => [...WALLET_QUERY_KEYS.all, 'transactions', params] as const,
    earnings: (params: any) => [...WALLET_QUERY_KEYS.all, 'earnings', params] as const,
    payouts: (params: any) => [...WALLET_QUERY_KEYS.all, 'payouts', params] as const,
    disputes: (params: any) => [...WALLET_QUERY_KEYS.all, 'disputes', params] as const,
    bankAccounts: () => [...WALLET_QUERY_KEYS.all, 'bankAccounts'] as const,
};

export function useWalletSummary() {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.summary(),
        queryFn: () => WalletService.getWalletSummary(),
        staleTime: 30 * 1000, // 30 seconds
    });
}

export function useWalletTransactions(params?: any) {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.transactions(params ?? null),
        queryFn: () => WalletService.getTransactions(params),
        staleTime: 30 * 1000,
    });
}

export function useWalletEarnings(params?: any) {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.earnings(params ?? null),
        queryFn: () => WalletService.getEarnings(params),
        staleTime: 60 * 1000,
    });
}

export function useWalletPayouts(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
}) {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.payouts(params ?? null),
        queryFn: () => WalletService.getPayoutRequests(params),
        staleTime: 30 * 1000,
    });
}

export function useWalletDisputes(params?: any) {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.disputes(params ?? null),
        queryFn: () => WalletService.getDisputes(params),
        staleTime: 30 * 1000,
    });
}

export function useRequestPayout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RequestPayoutPayload) => WalletService.requestPayout(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.summary() });
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.payouts(undefined) });
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.transactions(undefined) });
        },
    });
}

export function useCancelPayout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payoutId: string) => WalletService.cancelPayout(payoutId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.summary() });
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.payouts(undefined) });
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.transactions(undefined) });
        },
    });
}

export function useBankAccounts() {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.bankAccounts(),
        queryFn: () => WalletService.getBankAccounts(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useAddBankAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddBankAccountPayload) => WalletService.addBankAccount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.bankAccounts() });
        },
    });
}

export function useSetDefaultBankAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bankAccountId: string) => WalletService.setDefaultBankAccount(bankAccountId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.bankAccounts() });
        },
    });
}

export function useDeleteBankAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bankAccountId: string) => WalletService.deleteBankAccount(bankAccountId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.bankAccounts() });
        },
    });
}

export function useRespondToDispute() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ disputeId, data }: { disputeId: string; data: RespondToDisputePayload }) =>
            WalletService.respondToDispute(disputeId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.disputes(undefined) });
        },
    });
}
