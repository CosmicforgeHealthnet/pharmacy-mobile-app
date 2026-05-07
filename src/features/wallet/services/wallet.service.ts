import { apiClient } from '@/core/api/client';

export const WALLET_URLS = {
   SUMMARY: "/pharmacy/wallet/summary",
   TRANSACTIONS: "/pharmacy/wallet/transactions",
   TRANSACTION_RECEIPT: (id: string) => `/pharmacy/wallet/transactions/${id}/receipt`,
   EARNINGS: "/pharmacy/wallet/earnings",
   PAYOUTS: "/pharmacy/wallet/payouts",
   PAYOUT_CANCEL: (id: string) => `/pharmacy/wallet/payouts/${id}/cancel`,
   BANK_ACCOUNTS: "/pharmacy/wallet/bank-accounts",
   BANK_ACCOUNT_DETAIL: (id: string) => `/pharmacy/wallet/bank-accounts/${id}`,
   BANK_ACCOUNT_SET_DEFAULT: (id: string) => `/pharmacy/wallet/bank-accounts/${id}/set-default`,
   DISPUTES: "/pharmacy/wallet/disputes",
   DISPUTE_RESPOND: (id: string) => `/pharmacy/wallet/disputes/${id}/respond`,
} as const;

export class WalletService {
    static async getWalletSummary() {
       const response = await apiClient.get<any>(WALLET_URLS.SUMMARY);
       return response?.data ?? {};
    }
 
    static async getTransactions(params?: {
       page?: number;
       limit?: number;
       type?: "credit" | "debit";
       status?: string;
       category?: string;
       dateFrom?: string;
       dateTo?: string;
    }) {
       const response = await apiClient.get<any>(WALLET_URLS.TRANSACTIONS, { params });
       return response?.data ?? { transactions: [], total: 0 };
    }
 
    static async getEarnings(params?: {
       period?: "weekly" | "monthly" | "yearly";
       dateFrom?: string;
       dateTo?: string;
    }) {
       const response = await apiClient.get<any>(WALLET_URLS.EARNINGS, { params });
       return response?.data ?? {};
    }
 
    static async getPayoutRequests(params?: {
       page?: number;
       limit?: number;
       status?: string;
    }) {
       const response = await apiClient.get<any>(WALLET_URLS.PAYOUTS, { params });
       return response?.data ?? { payouts: [], total: 0 };
    }
 
    static async requestPayout(data: any) {
       const response = await apiClient.post<any>(WALLET_URLS.PAYOUTS, data);
       return response?.data ?? {};
    }
 
    static async getDisputes(params?: {
       page?: number;
       limit?: number;
       status?: string;
    }) {
       const response = await apiClient.get<any>(WALLET_URLS.DISPUTES, { params });
       return response?.data ?? { disputes: [], total: 0 };
    }
 }
