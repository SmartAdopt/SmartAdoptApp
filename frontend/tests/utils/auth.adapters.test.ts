import { describe, it, expect } from 'vitest';
import { adaptLoginResponse } from '../../src/utils/auth.adapters';
import type { LoginApiResponse } from '../../src/types/auth.types';

describe('Auth Adapters', () => {
  it('should adapt raw FastAPI login response to React AuthSession', () => {
    // Arrange
    const rawBackendResponse: LoginApiResponse = {
      access_token: 'dummy_token',
      token_type: 'bearer',
      message: 'Login successful',
      id: 123,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+1234567890',
      role: 'adopter',
      created_at: '2026-07-12T10:00:00Z',
    };

    // Act
    const result = adaptLoginResponse(rawBackendResponse);

    // Assert
    expect(result).toEqual({
      id: 123,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone_number: '+1234567890',
      role: 'adopter',
      createdAt: '2026-07-12T10:00:00Z',
    });
  });

  it('should handle missing last_name correctly to avoid trailing spaces', () => {
    // Arrange
    const rawBackendResponse: LoginApiResponse = {
      access_token: 'dummy_token',
      token_type: 'bearer',
      message: 'Login successful',
      id: 124,
      first_name: 'Jane',
      last_name: '',
      email: 'jane@example.com',
      phone_number: undefined,
      role: 'admin',
      created_at: '2026-07-12T11:00:00Z',
    };

    // Act
    const result = adaptLoginResponse(rawBackendResponse);

    // Assert
    expect(result.name).toBe('Jane'); // The trim() in adapter should remove trailing space
  });
});
