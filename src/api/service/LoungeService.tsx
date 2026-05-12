import ApiInstance from '@/api';
import ApiRoutes from '@/api/module/ApiRoutes';

// ──────────────────────────────────────────
// 요청 / 응답 타입
// ──────────────────────────────────────────
export interface PostListParams {
  centerId?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface CreatePostParams {
  centerId: string;
  content: string;
  imageFiles?: File[];
}

export interface CreateCommentParams {
  postId: string;
  content: string;
}

// ──────────────────────────────────────────
// LoungeService (Singleton)
// ──────────────────────────────────────────
class LoungeService {
  private static instance: LoungeService;

  private constructor() {}

  public static getInstance(): LoungeService {
    if (!LoungeService.instance) {
      LoungeService.instance = new LoungeService();
    }
    return LoungeService.instance;
  }

  /**
   * 게시글 목록 조회
   * GET /lounge/posts?centerId=&keyword=&page=&size=
   */
  async getPostList(params?: PostListParams): Promise<ListRes<CenterPostRes> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.LOUNGE_POST_LIST, { params });
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<CenterPostRes>;
      }
    } catch (error) {
      console.error('[LoungeService] getPostList', error);
      throw error;
    }
  }

  /**
   * 게시글 단건 조회 (댓글 포함)
   * GET /lounge/post?postId=
   */
  async getPost(postId: string): Promise<CenterPost | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.LOUNGE_POST, { params: { postId } });
      if (response && !response.hasErrors) {
        return response.responseData as CenterPost;
      }
    } catch (error) {
      console.error('[LoungeService] getPost', error);
      throw error;
    }
  }

  /**
   * 게시글 작성 (이미지 포함 multipart)
   * POST /lounge/post
   */
  async createPost(params: CreatePostParams): Promise<ActionRes | undefined> {
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const form = new FormData();
      form.append(
        'req',
        new Blob(
          [JSON.stringify({ centerId: params.centerId, content: params.content })],
          { type: 'application/json' }
        )
      );
      if (params.imageFiles && params.imageFiles.length > 0) {
        params.imageFiles.forEach((file) => form.append('imageFiles', file));
      }
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.LOUNGE_POST, form, config);
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[LoungeService] createPost', error);
      throw error;
    }
  }

  /**
   * 게시글 삭제
   * DELETE /lounge/post?postId=
   */
  async deletePost(postId: string): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.delete(ApiRoutes.LOUNGE_POST, { params: { postId } });
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[LoungeService] deletePost', error);
      throw error;
    }
  }

  /**
   * 좋아요 토글
   * POST /lounge/post/like  (like)
   * DELETE /lounge/post/like (unlike)
   */
  async toggleLike(postId: string, liked: boolean): Promise<ActionRes | undefined> {
    try {
      const method = liked ? 'delete' : 'post';
      const response: ApiResponse = await ApiInstance[method](ApiRoutes.LOUNGE_POST_LIKE, { postId });
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[LoungeService] toggleLike', error);
      throw error;
    }
  }

  /**
   * 게시글 신고
   * POST /lounge/post/report
   */
  async reportPost(postId: string): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.LOUNGE_POST_REPORT, { postId });
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[LoungeService] reportPost', error);
      throw error;
    }
  }

  /**
   * 댓글 목록 조회
   * GET /lounge/comments?postId=
   */
  async getCommentList(postId: string): Promise<ListRes<CenterPostCommentRes> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.LOUNGE_COMMENT_LIST, { params: { postId } });
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<CenterPostCommentRes>;
      }
    } catch (error) {
      console.error('[LoungeService] getCommentList', error);
      throw error;
    }
  }

  /**
   * 댓글 작성
   * POST /lounge/comment
   */
  async createComment(params: CreateCommentParams): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.post(ApiRoutes.LOUNGE_COMMENT, params);
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[LoungeService] createComment', error);
      throw error;
    }
  }

  /**
   * 댓글 삭제
   * DELETE /lounge/comment?commentId=
   */
  async deleteComment(commentId: string): Promise<ActionRes | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.delete(ApiRoutes.LOUNGE_COMMENT, { params: { commentId } });
      if (response && !response.hasErrors) {
        return response.responseData as ActionRes;
      }
    } catch (error) {
      console.error('[LoungeService] deleteComment', error);
      throw error;
    }
  }

  /**
   * 가입된 센터 목록 조회 (필터 칩용)
   * GET /center/list
   */
  async getCenterList(): Promise<ListRes<Center> | undefined> {
    try {
      const response: ApiResponse = await ApiInstance.get(ApiRoutes.CENTER_LIST);
      if (response && !response.hasErrors) {
        return response.responseData as ListRes<Center>;
      }
    } catch (error) {
      console.error('[LoungeService] getCenterList', error);
      throw error;
    }
  }
}

export default LoungeService.getInstance();
