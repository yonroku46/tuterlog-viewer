import ApiInstance from '@/api';
import ApiRoutes from '@/api/module/ApiRoutes';

export type NoticeType = 'center' | 'service';

class NoticeService {
  private static instance: NoticeService;

  private constructor() {}

  public static getInstance(): NoticeService {
    if (!NoticeService.instance) {
      NoticeService.instance = new NoticeService();
    }
    return NoticeService.instance;
  }

  /**
   * 공지 목록 조회
   * GET /notice/list?type=center|service&page=&size=
   */
  async getNoticeList(type: NoticeType, page: number = 1, size: number = 10): Promise<ListRes<NoticeRes> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.NOTICE_LIST, { 
        params: { type, page, size } 
      });
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<NoticeRes>;
      }
    } catch (error) {
      console.error('[NoticeService] getNoticeList', error);
      throw error;
    }
  }

  /**
   * 공지 단건 조회
   * GET /notice/info?noticeId=
   */
  async getNoticeInfo(noticeId: string): Promise<NoticeRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.NOTICE_INFO, { params: { noticeId } });
      if (response && !response.hasErrors) {
        return response.responseData as NoticeRes;
      }
    } catch (error) {
      console.error('[NoticeService] getNoticeInfo', error);
      throw error;
    }
  }
}

export default NoticeService.getInstance();
