import { apiFetch, ApiResponse } from './client';

export interface CreateContactInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactResult {
  id: string;
}

export async function createContact(input: CreateContactInput): Promise<ContactResult> {
  const res = await apiFetch<ApiResponse<ContactResult>>('/contact', {
    method: 'POST',
    body: input,
  });
  return res.data!;
}

// --- Admin contact management ---

export interface AdminContact {
  id: string;
  name: string;
  email: string;
  message: string;
  phoneNumber?: string | null;
  location?: string | null;
  createdAt: string;
}

export async function getAllContacts(token: string): Promise<AdminContact[]> {
  const res = await apiFetch<ApiResponse<AdminContact[]>>('/contact', { token });
  return res.data ?? [];
}

export async function deleteContact(id: string, token: string): Promise<void> {
  await apiFetch(`/contact/${id}`, { method: 'DELETE', token });
}
