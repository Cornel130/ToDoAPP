export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  mfaRequired?: boolean;
  mfaConfigured?: boolean;
  tempToken?: string;
}
