export interface JwtPayload {
    username: string;
    sub: number;
}

export interface AuthResponse {
    success: boolean;
    user: {
        id: number;
        username: string;
    };
}

export interface ValidatedUser {
    id: number;
    username: string;
    createdAt: Date;
    updatedAt: Date;
}
