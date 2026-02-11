export interface AppState {
  apiKey: string;
  universeId: string;
  experienceName: string;
}

export interface SavedKey {
  id: string;
  label: string;
  apiKey: string;
}

export interface Session {
  id: string;
  apiKey: string;
  universeId: string;
  experienceName: string;
  lastUsed: number;
}

export interface GamePass {
  id: string;
  name: string;
  description: string;
  price: number;
  isForSale: boolean;
  isRegionalPricingEnabled: boolean;
  iconUrl?: string;
}

export interface DeveloperProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  isForSale: boolean;
  isRegionalPricingEnabled: boolean;
  iconUrl?: string;
}

export interface BulkCreateItem {
  name: string;
  description: string;
  price: number;
  isRegionalPricingEnabled: boolean;
  imageFile: File | null;
}

export interface CreateResult {
  name: string;
  id: string;
  price: number;
  error?: string;
}
