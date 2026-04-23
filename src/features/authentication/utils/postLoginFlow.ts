import { router } from "expo-router";
import { doctorService } from "@/shared/services/doctor";
import { storage } from "@/core/storage";

const USER_STATUS = {
    PENDING_EMAIL_VERIFICATION: "pending_email_verification",
    PENDING_DOCTOR_VERIFICATION: "pending_doctor_verification",
};

/**
 * Shared logic to handle routing and profile fetching after a successful login
 * (Standard Login, Google, Magic Link)
 */
export const handlePostLoginFlow = async (
   userData: any,
   toast: any,
   routerInstance: typeof router
) => {
   try {
      const userId = userData.id || userData.sub;
      console.log(" >>> EXECUTING SHARED POST-LOGIN FLOW FOR:", userId, "<<< ");

      // 1. Fetch Doctor Profile
      const profileResponse = await doctorService.getDoctorProfile(userId);
      console.log("Doctor Profile Data on Login:", JSON.stringify(profileResponse, null, 2));

      // 2. Profile Setup Check: If null, must set up profile first
      if (!profileResponse || (profileResponse as any).doctorProfile === null) {
         console.log(" >>> ROUTING TO PROFILE SETUP: Profile is missing <<< ");
         toast.info("Complete Your Profile", "Please set up your professional profile to continue.");
         routerInstance.replace("/profile-setup");
         return;
      }

      // 3. Verification Logic
      // Check if verification has been submitted or if doctor is already active
      const isFullyVerified = 
         userData?.isVerified === true ||
         userData?.status === "doctor_active" ||
         userData?.status === "active" ||
         userData?.status === "approved" ||
         userData?.verificationStatus === "approved";

      const hasSubmittedVerification =
         userData?.verificationStatus === "pending" ||
         userData?.verificationStatus === "in_progress" ||
         userData?.verificationStatus === "pending_documents" ||
         userData?.verificationStatus === "pending_verification";

      // Doctor needs verification page if NOT verified AND hasn't even submitted yet
      const needsVerificationPage = !isFullyVerified && !hasSubmittedVerification;

      // Store verification status for app restart persistence (Drawer menu visibility, etc.)
      await storage.setNeedsVerification(needsVerificationPage);

      if (needsVerificationPage) {
         console.log(" >>> ROUTING TO VERIFICATION: Account not verified <<< ");
         toast.info(
            "Verification Required",
            "Kindly finish your verification so patients can connect with you.",
         );
         routerInstance.replace("/verification");
         return;
      }

      // 4. Default Success Routing (Dashboard)
      console.log(" >>> ROUTING TO DASHBOARD: Flow complete <<< ");
      toast.success("Welcome back!", `Hello ${userData?.fullName || userData?.name || "there"}!`);
      routerInstance.replace("/(drawer)/(tabs)");

   } catch (error) {
      console.error(" !!! ERROR IN POST-LOGIN FLOW !!! ", error);
      // Fallback: If profile fetch strictly fails but user is logged in, try to reach dashboard
      routerInstance.replace("/(drawer)/(tabs)");
   }
};
