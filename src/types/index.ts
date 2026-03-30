export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  other?: string[];
}

export interface GiftSuggestion {
  title: string;
  reason: string;
  searchUrl: string;
}

export interface GiftSuggestions {
  generatedAt: string;
  suggestions: GiftSuggestion[];
}

export interface Person {
  id: string;
  name: string;
  birthday: string; // YYYY-MM-DD format
  socialLinks: SocialLinks;
  preferences: string;
  giftSuggestions?: GiftSuggestions;
  lastNotifiedYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PeopleFile {
  schemaVersion: number;
  people: Person[];
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AppConfig {
  telegramChatId?: string;
  notifyDaysBefore: number;
  appVersion: string;
}
