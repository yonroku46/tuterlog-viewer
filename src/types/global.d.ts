import { extend } from "lodash";

declare global {
  // Base
  interface Window {
    fbq: any;
    gtag: any;
    dataLayer: any[];
  }
  interface ApiResponse {
    resultCode: number;
    hasErrors: boolean;
    informations: Array<any>;
    errors: Array<any>;
    responseData: any;
  }
  interface ActionRes {
    success: boolean;
    id?: string;
  }
  interface ListRes<T> {
    list: Array<T>
  }
  interface CountRes {
    count: number
  }
  // Business
  type LimitUnitType = 'HOUR' | 'MINUTE';
  type TicketType = 'GROUP' | 'PT';
  type ContentType = 'TICKET' | 'PRODUCT' | 'RESERVATION' | 'CENTER';
  type NotificationIconType = 'LOGO' | 'AVATAR';
  type ReservationStatus = 'COMPLETED' | 'CONFIRMED' | 'CANCELLED' | 'NOSHOW' | 'WAITING';
  type ProfileMenuType = 'CENTER' | 'EDIT_PROFILE' | 'TICKET' | 'PRODUCT' | 'HISTORY' | 'NOTICE_SETTING' | 'SYSTEM_SETTING' | 'PRIVACY' | 'CUSTOMER_CENTER' | null;
  interface Ticket {
    ticketId: string;
    userId: string;
    centerId: string;
    ticketType: TicketType;
    title: string;
    subTitle: string;
    startDate: string;
    endDate: string;
    totalSessions: number;
    usedSessions: number;
    isPt: boolean;
    createTime: string;
  }
  interface Instructor {
    instructorId: string;
    centerId: string;
    name: string;
    profileImg?: string;
    role?: string;
    createTime: string;
  }
  interface Reservation {
    reservationId: string;
    userId: string;
    classId: string;
    status: ReservationStatus;
    createTime: string;
  }
  interface ReservationRes {
    reservationId: string;
    userId: string;
    classId: string;
    centerId: string;
    status: ReservationStatus;
    reservationDate: string;
    startTime: string;
    endTime: string;
    className: string;
    room: string;
    capacity: number;
    reservedCount: number;
    createTime: string;
    instructorId: string;
    instructorName: string;
    instructorProfileImg: string;
    instructorRole: string;
  }
  interface Center {
    centerId: string;
    ownerId: string;
    name: string;
    address: string;
    phone?: string;
    createTime: string;
    businessNum?: string;
    cancelNoLimit?: boolean;
    cancelValue?: number;
    cancelUnit?: LimitUnitType;
    bookingNoLimit?: boolean;
    bookingLimitValue?: number;
    bookingLimitUnit?: LimitUnitType;
    operatingHours?: string;
    logoImg?: string;
  }
  interface CenterPost {
    postId: string;
    centerId: string;
    authorId?: string;
    center: string;
    content: string;
    images: string;
    imageList?: string[];
    likes: number;
    liked?: boolean;
    comments: CenterPostComment[]
    createTime: string;
  }
  interface CenterPostRes extends CenterPost {
    commentCount: number;
    author: UserProfile;
  }
  interface CenterPostComment {
    commentId: string;
    postId: string;
    authorId?: string;
    content: string;
    createTime: string;
  }
  interface CenterPostCommentRes extends CenterPostComment {
    author: UserProfile;
  }
  interface ClassInfo {
    classId: string;
    centerId?: string;
    startTime: string;
    endTime: string;
    name: string;
    instructor: Instructor;
    room: string;
    reserved: number;
    capacity: number;
    waitlist?: number;
    image?: string;
  }
  interface CenterClasses {
    centerName: string;
    types: string[];
  }
  interface Notice {
    noticeId: string;
    centerId?: string;
    tag: string;
    title: string;
    authorId?: string;
    content: string;
    important?: boolean;
    facility?: boolean;
    createTime: string;
  }
  interface NoticeRes extends Notice {
    author: UserProfile;
  }
  interface AppNotification {
    appNotificationId: string;
    userId: string;
    centerId?: string;
    title: string;
    message: string;
    centerName?: string;
    isRead: boolean;
    iconType: NotificationIconType;
    createTime: string;
  }
  interface InquiryReq {
    name: string;
    email: string;
    type: string;
    subject: string;
    message: string;
  }
  // UI Components
  interface TimeFilterOption {
    option: string;
    label: string;
    range: [number, number];
  }
  // API Response
  export interface LoginUserRes {
    userId: string;
    name: string;
    profileImg: string;
    email: string;
    gender: string;
    token: string;
    refreshToken: string;
    centerOwnerFlg?: boolean;
  }
  // DB
  interface UserProfile {
    userId: string;
    name: string;
    phone: string;
    email: string;
    gender?: string;
    profileImg?: string;
    classReminder: boolean;
    marketing: boolean;
    lastUpdated: string;
    createTime: string;
  }
  interface UserCenter extends Center {
    enrolledDate: string;
    expiredDate?: string;
  }
  interface UsageHistoryItem {
    historyId: string;
    contentType: ContentType;
    contentDetail: string;
    createTime: string;
  }
}

export { };