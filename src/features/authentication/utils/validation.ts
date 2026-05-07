// ─── Validation Helpers ───────────────────────────────────────────────────────

export const validateEmail = (email: string): boolean => {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
};

export const validatePassword = (password: string): boolean => {
    return password.length >= 8;
};

export const validateStrongPassword = (password: string): boolean => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
};

export const validatePhone = (phone: string): boolean => {
    const cleaned = phone.trim().replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15;
};

export const validateUsername = (username: string): boolean => {
    const trimmed = username.trim();
    return trimmed.length >= 3 && /^[a-zA-Z0-9_]+$/.test(trimmed);
};

// ─── Login Form ───────────────────────────────────────────────────────────────

export interface LoginFormData {
    email: string;
    password: string;
}

export interface LoginFormErrors {
    email?: string;
    password?: string;
}

export const validateLoginForm = (data: LoginFormData): LoginFormErrors => {
    const errors: LoginFormErrors = {};
    const trimmedEmail = data.email.trim();

    if (!trimmedEmail) {
        errors.email = 'Email is required';
    } else if (!validateEmail(trimmedEmail)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!data.password) {
        errors.password = 'Password is required';
    } else if (data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    return errors;
};

// ─── Register Form Step 1 ─────────────────────────────────────────────────────

export interface RegisterStep1Data {
    fullName: string;
    phone: string;
    email: string;
}

export interface RegisterStep1Errors {
    fullName?: string;
    phone?: string;
    email?: string;
}

export const validateRegisterStep1 = (data: RegisterStep1Data): RegisterStep1Errors => {
    const errors: RegisterStep1Errors = {};
    const trimmedFullName = data.fullName.trim();
    const trimmedPhone = data.phone.trim();
    const trimmedEmail = data.email.trim();

    if (!trimmedFullName) {
        errors.fullName = 'Full name is required';
    } else if (trimmedFullName.length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedFullName)) {
        errors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!trimmedPhone) {
        errors.phone = 'Phone number is required';
    } else if (!validatePhone(trimmedPhone)) {
        errors.phone = 'Please enter a valid phone number (7-15 digits)';
    }

    if (!trimmedEmail) {
        errors.email = 'Email is required';
    } else if (!validateEmail(trimmedEmail)) {
        errors.email = 'Please enter a valid email address';
    }

    return errors;
};

// ─── Register Form Step 2 ─────────────────────────────────────────────────────

export interface RegisterStep2Data {
    pharmacyName: string;
    registrationNumber: string;
    address: string;
    preferredUsername: string;
    primaryContact: string;
}

export interface RegisterStep2Errors {
    pharmacyName?: string;
    registrationNumber?: string;
    address?: string;
    preferredUsername?: string;
    primaryContact?: string;
}

export const validateRegisterStep2 = (data: RegisterStep2Data): RegisterStep2Errors => {
    const errors: RegisterStep2Errors = {};
    const trimmedPharmacyName = data.pharmacyName.trim();
    const trimmedRegistrationNumber = data.registrationNumber.trim();
    const trimmedAddress = data.address.trim();
    const trimmedUsername = data.preferredUsername.trim();
    const trimmedPrimaryContact = data.primaryContact.trim();

    if (!trimmedPharmacyName) {
        errors.pharmacyName = 'Pharmacy name is required';
    } else if (trimmedPharmacyName.length < 3) {
        errors.pharmacyName = 'Pharmacy name must be at least 3 characters';
    }

    if (!trimmedRegistrationNumber) {
        errors.registrationNumber = 'Registration number is required';
    }

    if (!trimmedAddress) {
        errors.address = 'Address is required';
    } else if (trimmedAddress.length < 10) {
        errors.address = 'Please provide a complete address';
    }

    if (!trimmedUsername) {
        errors.preferredUsername = 'Username is required';
    } else if (trimmedUsername.length < 3) {
        errors.preferredUsername = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        errors.preferredUsername = 'Username can only contain letters, numbers, and underscores';
    }

    if (!trimmedPrimaryContact) {
        errors.primaryContact = 'Primary contact is required';
    } else if (!validatePhone(trimmedPrimaryContact)) {
        errors.primaryContact = 'Please enter a valid phone number (7-15 digits)';
    }

    return errors;
};

// ─── Register Form Step 3 ─────────────────────────────────────────────────────

export interface RegisterStep3Data {
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
}

export interface RegisterStep3Errors {
    password?: string;
    confirmPassword?: string;
    acceptedTerms?: string;
}

export const validateRegisterStep3 = (data: RegisterStep3Data): RegisterStep3Errors => {
    const errors: RegisterStep3Errors = {};

    if (!data.password) {
        errors.password = 'Password is required';
    } else if (data.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    } else if (!validateStrongPassword(data.password)) {
        errors.password = 'Password must contain uppercase, lowercase, number & symbol';
    }

    if (!data.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    if (!data.acceptedTerms) {
        errors.acceptedTerms = 'You must accept the Terms and Conditions';
    }

    return errors;
};

// ─── Helper to check if form has errors ───────────────────────────────────────

export const hasErrors = (errors: any): boolean => {
    return Object.values(errors).some(error => !!error);
};
