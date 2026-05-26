import ApiInstance from '@/api';
import ApiRoutes from '@/api/module/ApiRoutes';

class HomeService {
  private static instance: HomeService;

  private constructor() { }

  public static getInstance(): HomeService {
    if (!HomeService.instance) {
      HomeService.instance = new HomeService();
    }
    return HomeService.instance;
  }

  /**
   * 내가 가입한 센터 목록
   * GET /user/centers
   */
  async getMyCenters(): Promise<ListRes<UserCenter> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.PROFILE_CENTERS);
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<UserCenter>;
      }
    } catch (error) {
      console.error('[HomeService] getMyCenters', error);
      throw error;
    }
  }

  /**
   * 특정 센터의 내 수강권 목록
   * GET /user/tickets/center?centerId=
   */
  async getTicketsByCenter(centerId: string): Promise<ListRes<Ticket> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.HOME_TICKETS_BY_CENTER, { params: { centerId } });
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<Ticket>;
      }
    } catch (error) {
      console.error('[HomeService] getTicketsByCenter', error);
      throw error;
    }
  }

  /**
   * 특정 센터의 내 예약 목록
   * GET /user/reservations?centerId=
   */
  async getReservationsByCenter(centerId: string): Promise<ListRes<ReservationRes> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.HOME_RESERVATIONS, { params: { centerId } });
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<ReservationRes>;
      }
    } catch (error) {
      console.error('[HomeService] getReservationsByCenter', error);
      throw error;
    }
  }

  /**
   * 예약 취소
   * PATCH /user/reservations/cancel
   */
  async cancelReservation(reservationId: string): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.patch(ApiRoutes.HOME_RESERVATION_CANCEL, { reservationId });
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[HomeService] cancelReservation', error);
      throw error;
    }
  }
}

export default HomeService.getInstance();
