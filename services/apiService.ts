import { User, UserRole, ClockRecord, ClockType, GeolocationCoordinates } from '../types';

// Base URL for the API. Adjust if your backend is hosted elsewhere.
const API_BASE_URL = '/api';

class ApiService {

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  async login(email: string, pass: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: pass }),
    });
    return this.handleResponse<User>(response);
  }

  logout(): void {
    // In a real app, you might want to call a /logout endpoint.
    // For now, it's handled by the App component by clearing state.
  }
  
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`);
    return this.handleResponse<User[]>(response);
  }

  async addUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return this.handleResponse<User>(response);
  }

  async updateUser(user: User): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    return this.handleResponse<User>(response);
  }

  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete user' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    // DELETE might not return a body, so we don't call handleResponse
  }

  async getRecords(): Promise<ClockRecord[]> {
    const response = await fetch(`${API_BASE_URL}/records`);
    return this.handleResponse<ClockRecord[]>(response);
  }

  async getUserLastRecord(userId: number): Promise<ClockRecord | null> {
    const response = await fetch(`${API_BASE_URL}/records/user/${userId}/last`);
    // Handle cases where no record is found (e.g., 404), which we can treat as null.
    if (response.status === 404) {
        return null;
    }
    return this.handleResponse<ClockRecord>(response);
  }

  async clock(userId: number, type: ClockType, location: GeolocationCoordinates | null): Promise<ClockRecord> {
      const response = await fetch(`${API_BASE_URL}/clock`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, type, location }),
      });
      return this.handleResponse<ClockRecord>(response);
  }
}

export const apiService = new ApiService();
