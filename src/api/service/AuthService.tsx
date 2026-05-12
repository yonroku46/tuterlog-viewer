import ApiInstance from '@/api';
import ApiRoutes from '@/api/module/ApiRoutes';

export interface AuthRes {
  user: UserProfile;
  token: string;
  refreshToken: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * 로그인
   * POST /auth/login
   */
  async login(email: string, password: string): Promise<AuthRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.AUTH_LOGIN, { email, password });
      if (response && !response.hasErrors) {
        return response.responseData as AuthRes;
      }
    } catch (error) {
      console.error('[AuthService] login', error);
      throw error;
    }
  }

  /**
   * 회원가입
   * POST /auth/register
   */
  async register(data: any): Promise<AuthRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.AUTH_REGISTER, data);
      if (response && !response.hasErrors) {
        return response.responseData as AuthRes;
      }
    } catch (error) {
      console.error('[AuthService] register', error);
      throw error;
    }
  }

  /**
   * 이메일 인증번호 전송
   * POST /auth/verify/send
   */
  async sendVerificationCode(email: string): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.AUTH_VERIFY_SEND, { email });
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[AuthService] sendVerificationCode', error);
      throw error;
    }
  }

  /**
   * 이메일 인증번호 확인
   * POST /auth/verify/confirm
   */
  async verifyCode(email: string, code: string): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.AUTH_VERIFY_CONFIRM, { email, code });
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[AuthService] verifyCode', error);
      throw error;
    }
  }

  /**
   * 비밀번호 찾기 (인증번호 발송)
   */
  async forgotPassword(email: string): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.AUTH_FORGOT_PASSWORD, { email });
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[AuthService] forgotPassword', error);
      throw error;
    }
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(data: any): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.AUTH_RESET_PASSWORD, data);
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[AuthService] resetPassword', error);
      throw error;
    }
  }

  /**
   * 토큰 갱신
   * POST /auth/refresh
   */
  async refresh(refreshToken: string): Promise<{ token: string } | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.AUTH_REFRESH, { refreshToken });
      if (response && !response.hasErrors) {
        return response.responseData as { token: string };
      }
    } catch (error) {
      console.error('[AuthService] refresh', error);
      throw error;
    }
  }
}

export default AuthService.getInstance();
