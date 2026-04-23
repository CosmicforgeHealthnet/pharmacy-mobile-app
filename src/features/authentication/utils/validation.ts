import { SignupFormData, SignupFormErrors, LoginFormData, LoginFormErrors } from "../types";

export const validateEmail = (email: string): boolean => {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
};

// Still Tentative can be changed to 6
export const validatePassword = (password: string): boolean => {
   // At least 8 characters
   return password.length >= 8;
};

export const validatePasswordStrength = (
   password: string,
): {
   isStrong: boolean;
   message: string;
} => {
   if (password.length < 8) {
      return { isStrong: false, message: "Password must be at least 8 characters" };
   }

   const hasUpperCase = /[A-Z]/.test(password);
   const hasLowerCase = /[a-z]/.test(password);
   const hasNumber = /\d/.test(password);

   if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return {
         isStrong: false,
         message: "Password must contain uppercase, lowercase, and number",
      };
   }

   return { isStrong: true, message: "Strong password" };
};

export const validateSignupForm = (formData: SignupFormData): SignupFormErrors => {
   const errors: SignupFormErrors = {};

   // Full Name validation
   if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
   } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
   }

   // Email validation
   if (!formData.email.trim()) {
      errors.email = "Email is required";
   } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
   }

   // Phone Number validation
   if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
   }

   // Specialty validation
   if (!formData.departmentSpecialty || formData.departmentSpecialty === "Select Department (If applicable)") {
      errors.departmentSpecialty = "Please select a specialty";
   }

   // Password validation
   if (!formData.password) {
      errors.password = "Password is required";
   } else if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 8 characters";
   }

   // Confirm Password validation
   if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
   } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
   }

   // Terms validation
   //  if (!formData.agreeToTerms) {
   //     errors.agreeToTerms = "You must agree to the terms and privacy policy";
   //  }

   return errors;
};

export const validateLoginForm = (formData: LoginFormData): LoginFormErrors => {
   const errors: LoginFormErrors = {};

   // Email validation
   if (!formData.email.trim()) {
      errors.email = "Email is required";
   } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
   }

   // Password validation
   if (!formData.password) {
      errors.password = "Password is required";
   }

   return errors;
};
