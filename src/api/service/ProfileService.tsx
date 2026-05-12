import ApiInstance from '@/api';
import ApiRoutes from '@/api/module/ApiRoutes';

class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * 내 프로필 조회
   * GET /user/profile
   */
  async getProfile(): Promise<UserProfile | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.PROFILE_INFO);
      if (response && !response.hasErrors) {
        return response.responseData as UserProfile;
      }
    } catch (error) {
      console.error('[ProfileService] getProfile', error);
      throw error;
    }
  }

  /**
   * 내 프로필 수정
   * PATCH /user/profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.patch(ApiRoutes.PROFILE_INFO, data);
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[ProfileService] updateProfile', error);
      throw error;
    }
  }

  /**
   * 내 가입 센터 목록
   * GET /user/centers
   */
  async getMyCenters(): Promise<ListRes<UserCenter> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.PROFILE_CENTERS);
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<UserCenter>;
      }
    } catch (error) {
      console.error('[ProfileService] getMyCenters', error);
      throw error;
    }
  }

  /**
   * 내 수강권 내역
   * GET /user/tickets
   */
  async getMyTickets(): Promise<ListRes<UsageHistoryItem> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.PROFILE_TICKETS);
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<UsageHistoryItem>;
      }
    } catch (error) {
      console.error('[ProfileService] getMyTickets', error);
      throw error;
    }
  }

  /**
   * 내 상품 내역
   * GET /user/products
   */
  async getMyProducts(): Promise<ListRes<UsageHistoryItem> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.PROFILE_PRODUCTS);
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<UsageHistoryItem>;
      }
    } catch (error) {
      console.error('[ProfileService] getMyProducts', error);
      throw error;
    }
  }

  /**
   * 전체 이용 내역
   * GET /user/history
   */
  async getUsageHistory(): Promise<ListRes<UsageHistoryItem> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.PROFILE_HISTORY);
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<UsageHistoryItem>;
      }
    } catch (error) {
      console.error('[ProfileService] getUsageHistory', error);
      throw error;
    }
  }
}

export default ProfileService.getInstance();
