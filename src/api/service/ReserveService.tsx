import ApiInstance from '@/api';
import ApiRoutes from '@/api/module/ApiRoutes';

// ──────────────────────────────────────────
// 응답 타입
// ──────────────────────────────────────────
export interface ClassScheduleItem {
  classId: string;
  centerId: string;
  name: string;
  room: string;
  startTime: string;
  endTime: string;
  capacity: number;
  image?: string;
  // 예약 현황
  reservedCount: number;
  waitlistCount: number;
  // 강사 정보
  instructorId: string;
  instructorName: string;
  instructorProfileImg?: string;
  instructorRole?: string;
}

export interface BookClassParams {
  classId: string;
  reservationDate: string;
}

class ReserveService {
  private static instance: ReserveService;

  private constructor() {}

  public static getInstance(): ReserveService {
    if (!ReserveService.instance) {
      ReserveService.instance = new ReserveService();
    }
    return ReserveService.instance;
  }

  /**
   * 센터별 수업 목록 조회
   * GET /reserve/classes?centerId=
   */
  async getClassesByCenter(centerId: string, date: string): Promise<ListRes<ClassScheduleItem> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.RESERVE_CLASSES, { params: { centerId, date } });
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<ClassScheduleItem>;
      }
    } catch (error) {
      console.error('[ReserveService] getClassesByCenter', error);
      throw error;
    }
  }

  /**
   * 수업 예약 (예약 / 대기)
   * POST /reserve/book
   */
  async bookClass(params: BookClassParams): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.RESERVE_BOOK, params);
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[ReserveService] bookClass', error);
      throw error;
    }
  }
}

export default ReserveService.getInstance();
