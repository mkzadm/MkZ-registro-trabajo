
import { User, UserRole, ClockRecord, ClockType, GeolocationCoordinates } from '../types';

const MOCK_USERS: User[] = [
  { id: 1, name: 'John Doe', email: 'employee@example.com', role: UserRole.EMPLOYEE },
  { id: 2, name: 'Jane Smith (Admin)', email: 'admin@example.com', role: UserRole.ADMIN },
  { id: 3, name: 'Peter Jones', email: 'peter@example.com', role: UserRole.EMPLOYEE },
  { id: 4, name: 'Mary Johnson', email: 'mary@example.com', role: UserRole.EMPLOYEE },
];

const MOCK_RECORDS: ClockRecord[] = [
    { id: 1, userId: 1, userName: 'John Doe', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), type: ClockType.IN, location: {latitude: 34.0522, longitude: -118.2437, accuracy: 10} },
    { id: 2, userId: 1, userName: 'John Doe', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), type: ClockType.OUT, location: {latitude: 34.0522, longitude: -118.2437, accuracy: 10} },
    { id: 3, userId: 3, userName: 'Peter Jones', timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), type: ClockType.IN, location: {latitude: 40.7128, longitude: -74.0060, accuracy: 15} },
];

const SIMULATED_DELAY = 500;

class ApiService {
  constructor() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem('records')) {
      localStorage.setItem('records', JSON.stringify(MOCK_RECORDS));
    }
  }

  private getUsersFromStorage(): User[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  private getRecordsFromStorage(): ClockRecord[] {
    return JSON.parse(localStorage.getItem('records') || '[]');
  }
  
  async login(email: string, pass: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, 'pass' would be checked.
        const users = this.getUsersFromStorage();
        const user = users.find(u => u.email === email);
        if (user) {
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, SIMULATED_DELAY);
    });
  }

  logout(): void {
    // No-op for mock service
  }
  
  async getUsers(): Promise<User[]> {
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve(this.getUsersFromStorage());
          }, SIMULATED_DELAY);
      });
  }

  async addUser(user: Omit<User, 'id'>): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = this.getUsersFromStorage();
        const newUser: User = {
          ...user,
          id: Date.now(),
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        resolve(newUser);
      }, SIMULATED_DELAY);
    });
  }

  async updateUser(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let users = this.getUsersFromStorage();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          // Update user name in records if it has changed
          if (users[userIndex].name !== user.name) {
              const records = this.getRecordsFromStorage();
              const updatedRecords = records.map(r => 
                  r.userId === user.id ? { ...r, userName: user.name } : r
              );
              localStorage.setItem('records', JSON.stringify(updatedRecords));
          }

          users[userIndex] = user;
          localStorage.setItem('users', JSON.stringify(users));
          resolve(user);
        } else {
            reject(new Error("User not found"));
        }
      }, SIMULATED_DELAY);
    });
  }

  async deleteUser(userId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let users = this.getUsersFromStorage();
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        // Note: We are not deleting user records for history, just the user.
        resolve();
      }, SIMULATED_DELAY);
    });
  }

  async getRecords(): Promise<ClockRecord[]> {
      return new Promise((resolve) => {
          setTimeout(() => {
              const records = this.getRecordsFromStorage();
              resolve(records.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
          }, SIMULATED_DELAY);
      });
  }

  async getUserLastRecord(userId: number): Promise<ClockRecord | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const records = this.getRecordsFromStorage()
                .filter(r => r.userId === userId)
                .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            resolve(records[0] || null);
        }, SIMULATED_DELAY / 2);
    });
  }

  async clock(userId: number, type: ClockType, location: GeolocationCoordinates | null): Promise<ClockRecord> {
      return new Promise((resolve) => {
          setTimeout(() => {
              const users = this.getUsersFromStorage();
              const records = this.getRecordsFromStorage();
              const user = users.find(u => u.id === userId);

              const newRecord: ClockRecord = {
                  id: Date.now(),
                  userId,
                  userName: user?.name || 'Unknown User',
                  timestamp: new Date().toISOString(),
                  type,
                  location,
              };

              records.push(newRecord);
              localStorage.setItem('records', JSON.stringify(records));
              resolve(newRecord);
          }, SIMULATED_DELAY);
      });
  }
}

export const apiService = new ApiService();