
import { backendUrl } from '@/config/backendUrl';
import type { loginUser, ResetPasswordFormData, signupUser } from "@/validation/userSchema";

import axios from 'axios';

const BASE_URL = `${backendUrl}/api/v1`

// Auth client - WITH credentials (for login/signup that receives/sends cookies)
const authClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // Needed to receive refresh token cookie
});

// Public client - NO credentials (for email verification, password reset, etc.)
const publicClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});


export const signUp = async (data: signupUser) => {
  return publicClient.post('/auth/signup', data)  // No cookie needed for signup
}

export const signIn = async (data: loginUser) => {
  return authClient.post('/auth/signin', data)  // Receives refresh token cookie
}

export const forgotPassword = async (data: { email?: string }) => {
  return publicClient.post('/auth/reset-password', data)
}

export const verifyUserEmail = async (verificationToken: string | undefined) => {
  return publicClient.get(`/auth/verify-email/${verificationToken}`)
}

export const verifyResetToken = async (resetToken: string | undefined) => {
  return publicClient.get(`/auth/verify-token/${resetToken}`)
}

export const resetPassword = async (data: ResetPasswordFormData, resetToken: string | undefined) => {
  return publicClient.post(`/auth/reset-password/${resetToken}`, data)
}

