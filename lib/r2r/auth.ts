// Authentication utilities for R2R

import { getR2RClient } from './client'

export interface AuthResult {
  success: boolean
  accessToken?: string
  error?: string
}

export async function authenticateR2R(
  email?: string,
  password?: string
): Promise<AuthResult> {
  try {
    const client = getR2RClient()
    await client.authenticate(email, password)

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    }
  }
}

export async function refreshR2RToken(): Promise<AuthResult> {
  try {
    const client = getR2RClient()
    await client.refreshToken()

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    }
  }
}

export function checkAuthRequired(): boolean {
  // Check if authentication is required based on environment
  return Boolean(process.env.R2R_ADMIN_EMAIL && process.env.R2R_ADMIN_PASSWORD)
}
