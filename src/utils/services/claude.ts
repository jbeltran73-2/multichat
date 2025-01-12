import axios, { isAxiosError } from 'axios';
import type { ClaudeResponse, APIError } from '../../types/models';

const API_URL = 'http://localhost:3000/api'; // Adjust port as needed

export const callClaude = async (message: string): Promise<ClaudeResponse> => {
  try {
    const response = await axios.post<ClaudeResponse>(`${API_URL}/claude`, {
      message,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as APIError;
      throw new Error(apiError.message || 'An error occurred');
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to call Claude API');
  }
};