import { User } from '@/types/database'

// Mock user for development - bypasses auth
export const mockUser: User = {
  id: 'mock-user-123',
  name: 'Test Student',
  email: 'test@aith.ac.in',
  campus_id: 'mock-campus-aith',
  role: 'student',
  created_at: new Date().toISOString(),
}

export const mockCampus = {
  id: 'mock-campus-aith',
  name: 'AITH Kanpur',
  code: 'aith',
  email_domains: ['aith.ac.in'],
  created_at: new Date().toISOString(),
}
