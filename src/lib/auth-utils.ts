import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updatePassword,
    confirmPasswordReset,
    verifyPasswordResetCode,
    updateProfile
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signInWithEmail = async (email: string, pass: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        return result.user;
    } catch (error) {
        console.error("Error signing in with email", error);
        throw error;
    }
};

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(result.user, { displayName: name });
        return result.user;
    } catch (error) {
        console.error("Error signing up with email", error);
        throw error;
    }
};

export const resetPassword = async (email: string) => {
    try {
        const actionCodeSettings = {
            url: `${window.location.origin}/reset-password`,
            handleCodeInApp: true,
        };
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (error) {
        console.error("Error sending password reset email", error);
        throw error;
    }
};

export const changePassword = async (newPassword: string) => {
    try {
        if (auth.currentUser) {
            await updatePassword(auth.currentUser, newPassword);
        } else {
            throw new Error("No user is currently signed in.");
        }
    } catch (error) {
        console.error("Error updating password", error);
        throw error;
    }
};

export const confirmReset = async (code: string, newPassword: string) => {
    try {
        await confirmPasswordReset(auth, code, newPassword);
    } catch (error) {
        console.error("Error confirming password reset", error);
        throw error;
    }
};

export const verifyResetCode = async (code: string) => {
    try {
        return await verifyPasswordResetCode(auth, code);
    } catch (error) {
        console.error("Error verifying reset code", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};
