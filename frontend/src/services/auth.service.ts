// src/services/auth.service.ts
import { apiClient } from './apiClient';
import type { LoginResponse, RegisterRequest } from '../types/auth.types';

export const authService = {
  login: async (email: string, password?: string): Promise<LoginResponse> => {
    // Temporary mock logic using json-server. 
    // Later it will be: await apiClient.post<LoginResponse>('/auth/login', { email, password })
    const response = await apiClient.get(`/users?email=${email}`);
    const users = response.data;
    
    if (users.length > 0) {
      return {
        access_token: 'JWT_SMARTADOPT_MOCK_STRING',
        token_type: 'bearer',
        user: users[0]
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData: RegisterRequest): Promise<void> => {
    // We use json-server to save the new user in db.json
    await apiClient.post('/users', userData);
  }
};