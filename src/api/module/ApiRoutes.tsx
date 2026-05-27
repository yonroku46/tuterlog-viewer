const ROOT = process.env.NEXT_PUBLIC_API_ROOT || '';

// lounge
const LOUNGE_ROOT = `${ROOT}/lounge`;
const LOUNGE_POST_LIST = `${LOUNGE_ROOT}/posts`;
const LOUNGE_POST = `${LOUNGE_ROOT}/post`;
const LOUNGE_POST_LIKE = `${LOUNGE_ROOT}/post/like`;
const LOUNGE_POST_REPORT = `${LOUNGE_ROOT}/post/report`;
const LOUNGE_COMMENT_LIST = `${LOUNGE_ROOT}/comments`;
const LOUNGE_COMMENT = `${LOUNGE_ROOT}/comment`;

// center
const CENTER_ROOT = `${ROOT}/center`;
const CENTER_LIST = `${CENTER_ROOT}/list`;

// notice
const NOTICE_ROOT = `${ROOT}/notice`;
const NOTICE_LIST = `${NOTICE_ROOT}/list`;
const NOTICE_INFO = `${NOTICE_ROOT}/info`;

// profile
const PROFILE_ROOT = `${ROOT}/user`;
const PROFILE_INFO = `${PROFILE_ROOT}/profile`;
const PROFILE_CENTERS = `${PROFILE_ROOT}/centers`;
const PROFILE_TICKETS = `${PROFILE_ROOT}/tickets`;
const PROFILE_PRODUCTS = `${PROFILE_ROOT}/products`;
const PROFILE_HISTORY = `${PROFILE_ROOT}/history`;
const PROFILE_NOTIFICATION = `${PROFILE_ROOT}/notification-settings`;

// home (center-specific)
const HOME_TICKETS_BY_CENTER = `${PROFILE_ROOT}/tickets/center`;
const HOME_RESERVATIONS = `${PROFILE_ROOT}/reservations`;
const HOME_RESERVATION_CANCEL = `${PROFILE_ROOT}/reservations/cancel`;

// reserve
const RESERVE_ROOT = `${ROOT}/reserve`;
const RESERVE_CLASSES = `${RESERVE_ROOT}/classes`;
const RESERVE_BOOK = `${RESERVE_ROOT}/book`;

// notification
const NOTIFICATION_ROOT = `${ROOT}/notification`;
const NOTIFICATION_LIST = `${NOTIFICATION_ROOT}/list`;
const NOTIFICATION_READ = `${NOTIFICATION_ROOT}/read`;
const NOTIFICATION_READ_ALL = `${NOTIFICATION_ROOT}/read-all`;
const NOTIFICATION_SUBSCRIBE = `${NOTIFICATION_ROOT}/subscribe`;

// auth
const AUTH_ROOT = `${ROOT}/auth`;
const AUTH_LOGIN = `${AUTH_ROOT}/login`;
const AUTH_REGISTER = `${AUTH_ROOT}/register`;
const AUTH_REFRESH = `${AUTH_ROOT}/refresh`;
const AUTH_VERIFY_SEND = `${AUTH_ROOT}/verify/send`;
const AUTH_VERIFY_CONFIRM = `${AUTH_ROOT}/verify/confirm`;
const AUTH_FORGOT_PASSWORD = `${AUTH_ROOT}/forgot-password`;
const AUTH_RESET_PASSWORD = `${AUTH_ROOT}/reset-password`;

const ApiRoutes = {
  AUTH_LOGIN,
  AUTH_REGISTER,
  AUTH_REFRESH,
  AUTH_VERIFY_SEND,
  AUTH_VERIFY_CONFIRM,
  AUTH_FORGOT_PASSWORD,
  AUTH_RESET_PASSWORD,
  LOUNGE_POST_LIST,
  LOUNGE_POST,
  LOUNGE_POST_LIKE,
  LOUNGE_POST_REPORT,
  LOUNGE_COMMENT_LIST,
  LOUNGE_COMMENT,
  CENTER_LIST,
  NOTICE_LIST,
  NOTICE_INFO,
  PROFILE_INFO,
  PROFILE_CENTERS,
  PROFILE_TICKETS,
  PROFILE_PRODUCTS,
  PROFILE_HISTORY,
  PROFILE_NOTIFICATION,
  HOME_TICKETS_BY_CENTER,
  HOME_RESERVATIONS,
  HOME_RESERVATION_CANCEL,
  RESERVE_CLASSES,
  RESERVE_BOOK,
  NOTIFICATION_LIST,
  NOTIFICATION_READ,
  NOTIFICATION_READ_ALL,
  NOTIFICATION_SUBSCRIBE,
};

export default ApiRoutes;
