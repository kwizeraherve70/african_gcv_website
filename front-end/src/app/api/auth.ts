import { apiFetch, ApiResponse } from './client';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  photo?: string | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

interface SigninResponseData {
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  roles: string[];
  photo?: string | null;
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const res = await apiFetch<ApiResponse<SigninResponseData>>('/auth/signin', {
    method: 'POST',
    body: { email, password },
  });
  const { token, ...user } = res.data!;
  return { token, user };
}

interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface SignupResponseData {
  token: string;
  photo?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export async function signup(input: SignupInput): Promise<AuthSession> {
  const res = await apiFetch<ApiResponse<SignupResponseData>>('/auth/signup', {
    method: 'POST',
    body: input,
  });
  const { token } = res.data!;
  // The signup response has no `id` (a backend quirk — see
  // UserService.signUpUser), so fetch the full profile with the new token.
  const user = await getMe(token);
  return { token, user };
}

export async function getMe(token: string): Promise<AuthUser> {
  const res = await apiFetch<ApiResponse<AuthUser>>('/auth/me', { token });
  return res.data!;
}
