import { apiRequest } from '@/config/api';

type ApiOk = { success: true; message?: string; data: { user: any; token: string } }
type ApiLegacy = { success: true; message?: string; token?: string; user?: any; data?: any }

function normalizeSignupResponse(r: ApiLegacy): ApiOk {
  console.log('🔍 Normalizing signup response:', r);

  // Check if response is already in expected format: {success: true, data: {user, token}}
  if (r?.success && r?.data?.token && r?.data?.user) {
    console.log('✅ Response already in correct format');
    return r as ApiOk;
  }

  // Handle legacy format: {success: true, token, user} (direct properties)
  // Also handles case where data: null but token/user are direct properties
  if (r?.success && r?.token && r?.user) {
    console.log('🔄 Converting legacy format to new format');
    return {
      success: true,
      message: r.message ?? 'Registration successful',
      data: { user: r.user, token: r.token }
    };
  }

  // Handle partial legacy format: {token, user} without success flag
  if (r?.token && r?.user) {
    console.log('🔄 Converting partial legacy format');
    return {
      success: true,
      message: 'Registration successful',
      data: { user: r.user, token: r.token }
    };
  }

  console.error('❌ Invalid response format:', r);
  throw new Error('Signup failed - invalid response format');
}

export { normalizeSignupResponse };
export type { ApiOk, ApiLegacy };
