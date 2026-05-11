import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export const tokenPrefix = 'Bearer';
const isClient = typeof window !== 'undefined';

const ApiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// 응답 인터셉터: response.data 언래핑
ApiInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => Promise.reject(error)
);

if (isClient) {
  // 요청 인터셉터: localStorage의 토큰을 Authorization 헤더에 주입
  ApiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      try {
        const raw = localStorage.getItem('currentUser');
        if (raw) {
          const user = JSON.parse(raw);
          if (user?.token) {
            config.headers['Authorization'] = `${tokenPrefix} ${user.token}`;
          }
          if (user?.refreshToken) {
            config.headers['RefreshToken'] = `${tokenPrefix} ${user.refreshToken}`;
          }
        }
      } catch {
        // 파싱 실패 시 무시
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );
}

export default ApiInstance;
