
export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export enum ClockType {
  IN = 'in',
  OUT = 'out',
}

export interface ClockRecord {
  id: number;
  userId: number;
  userName: string;
  timestamp: string;
  type: ClockType;
  location: GeolocationCoordinates | null;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}
