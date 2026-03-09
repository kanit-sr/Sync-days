export type Role = 'DM' | 'PLAYER';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'DEADLY';

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  role: Role;
  characterName?: string;
  characterClass?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  dmId: string;
  campaignName: string;
  description?: string;
  difficulty: Difficulty;
  maxPartySize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDate {
  id: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  isAvailable: boolean;
  isRecurring: boolean;
  location?: string;
  createdAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  campaignId: string;
  dateId: string;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
