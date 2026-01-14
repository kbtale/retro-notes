export interface JwtPayload {
  username: string;
  sub: number;
}

export interface LoginResponse {
  access_token: string;
}

export interface ValidatedUser {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
