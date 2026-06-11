import ApiInstance from '@/api';
import ApiRoutes from '@/api/module/ApiRoutes';

export interface UpdateCenterParams {
  name: string;
  phone?: string;
  address?: string;
  businessNum?: string;
  operatingHours?: string;
  cancelNoLimit: boolean;
  cancelValue?: number;
  cancelUnit?: LimitUnitType;
  bookingNoLimit: boolean;
  bookingLimitValue?: number;
  bookingLimitUnit?: LimitUnitType;
  logoImg?: string | null;
}

class ManageService {
  private static instance: ManageService;

  private constructor() { }

  public static getInstance(): ManageService {
    if (!ManageService.instance) {
      ManageService.instance = new ManageService();
    }
    return ManageService.instance;
  }

  /**
   * 센터 정보 상세 조회
   * GET /center
   */
  async getCenterInfo(): Promise<Center | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.MANAGE_CENTER);
      if (response && !response.hasErrors) {
        return response.responseData as Center;
      }
    } catch (error) {
      console.error('[ManageService] getCenterInfo', error);
      throw error;
    }
  }

  /**
   * 센터 정보 업데이트 (JSON)
   * PATCH /center
   */
  async updateCenterInfo(params: UpdateCenterParams): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.patch(ApiRoutes.MANAGE_CENTER, params);
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[ManageService] updateCenterInfo', error);
      throw error;
    }
  }
}

export default ManageService.getInstance();
