export interface AdminUser {
  id: string;
  firebaseUid: string;
  role: string;
  status: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresInDays: number;
  user: AdminUser;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  requestId?: string;
}

export interface ApiErrorBody {
  success: false;
  error?: {
    message?: string;
    code?: string;
  };
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}
