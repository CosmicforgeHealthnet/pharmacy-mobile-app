import type { Pharmacy, OperatingHours, PricingItem } from '@/features/authentication/types';

export type NotificationType = 'warning' | 'info' | 'error';

export interface PharmacyNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    items?: string[];
    actionLabel?: string;
    actionRoute?: string;
}

/**
 * Check if operating hours have at least one day configured
 */
function hasOperatingHours(hours: OperatingHours | undefined): boolean {
    if (!hours) return false;
    return Object.keys(hours).length > 0;
}

export function getPharmacyNotifications(
    profile: Pharmacy | undefined,
    pricing?: PricingItem[],
): PharmacyNotification[] {
    if (!profile) return [];

    const alerts: PharmacyNotification[] = [];

    // Use pricing from parameter if provided, otherwise fall back to profile.pricing
    const effectivePricing = pricing ?? profile.pricing;

    // Standalone: Pricing (critical - revenue blocked)
    if (!effectivePricing || effectivePricing.length === 0) {
        alerts.push({
            id: 'no-pricing',
            type: 'warning',
            title: 'Pricing not configured',
            message:
                "You haven't set any service fees or delivery pricing yet. Patients won't receive accurate cost estimates until pricing is configured.",
            actionLabel: 'Set Pricing',
            actionRoute: '/profile/pricing',
        });
    }

    // Grouped: Profile completeness
    const missingCritical: string[] = [];
    const missingOptional: string[] = [];

    if (!profile.address) missingCritical.push('Pharmacy address');
    if (!profile.phone) missingCritical.push('Phone number');
    if (!profile.logoUrl) missingOptional.push('Pharmacy logo');
    if (!hasOperatingHours(profile.operatingHours)) missingOptional.push('Operating hours');
    if (profile.serviceRadius == null) missingOptional.push('Service radius');
    if (!profile.description) missingOptional.push('Pharmacy description');

    const allMissing = [...missingCritical, ...missingOptional];

    if (allMissing.length > 0) {
        const hasCritical = missingCritical.length > 0;
        alerts.push({
            id: 'profile-incomplete',
            type: hasCritical ? 'warning' : 'info',
            title: 'Your profile is incomplete',
            message: hasCritical
                ? 'Some required information is missing. Complete your profile so patients can find and trust your pharmacy.'
                : 'A few optional details are missing. Filling them in helps patients learn more about your pharmacy.',
            items: allMissing,
            actionLabel: 'Complete Profile',
            actionRoute: '/profile',
        });
    }

    return alerts;
}
