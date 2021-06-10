export interface ILoginRequest {
    username: string;
    password: string;
}

export interface IRegisterRequest {
    username: string;
    fullName: string;
    password: string;
}

export interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ICurrentUser {
    id: string;
    username: string;
    fullName: string;
    bio: string | null;
    picture: string | null;
}
