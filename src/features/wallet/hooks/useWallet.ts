import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WalletService } from '../services/wallet.service';

export const WALLET_QUERY_KEYS = {
    all: ['wallet'] as const,
    summary: () => [...WALLET_QUERY_KEYS.all, 'summary'] as const,
    transactions: (params: any) => [...WALLET_QUERY_KEYS.all, 'transactions', params] as const,
    earnings: (params: any) => [...WALLET_QUERY_KEYS.all, 'earnings', params] as const,
    payouts: (params: any) => [...WALLET_QUERY_KEYS.all, 'payouts', params] as const,
    disputes: (params: any) => [...WALLET_QUERY_KEYS.all, 'disputes', params] as const,
};

export function useWalletSummary() {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.summary(),
        queryFn: () => WalletService.getWalletSummary(),
        initialData: {},
    });
}

export function useWalletTransactions(params?: any) {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.transactions(params ?? null),
        queryFn: () => WalletService.getTransactions(params),
        initialData: { transactions: [], total: 0 },
    });
}

export function useWalletEarnings(params?: any) {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.earnings(params ?? null),
        queryFn: () => WalletService.getEarnings(params),
        initialData: { allTime: 0, currentMonth: 0, lastMonth: 0, last3Months: 0, byPeriod: [] },
    });
}

export function useWalletPayouts(params?: any) {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.payouts(params ?? null),
        queryFn: () => WalletService.getPayoutRequests(params),
        initialData: { payouts: [], total: 0 },
    });
}

export function useWalletDisputes(params?: any) {
    return useQuery({
        queryKey: WALLET_QUERY_KEYS.disputes(params ?? null),
        queryFn: () => WalletService.getDisputes(params),
        initialData: { disputes: [], total: 0 },
    });
}

export function useRequestPayout() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: any) => WalletService.requestPayout(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.summary() });
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.payouts(undefined) });
            queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.transactions(undefined) });
        },
    });
}
