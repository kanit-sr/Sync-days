export type Role = 'DM' | 'PLAYER';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'deadly';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  characterName?: string;
}

export interface Campaign {
  id: string;
  dmId: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  createdAt: Date;
}

export interface SessionDate {
  id: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  isRecurring: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  campaignId: string;
  dateId: string;
  status: BookingStatus;
  createdAt: Date;
}
