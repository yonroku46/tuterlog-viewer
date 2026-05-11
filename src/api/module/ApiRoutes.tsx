const ROOT = process.env.NEXT_PUBLIC_API_ROOT || '';

// lounge
const LOUNGE_ROOT = `${ROOT}/lounge`;
const LOUNGE_POST_LIST   = `${LOUNGE_ROOT}/posts`;
const LOUNGE_POST        = `${LOUNGE_ROOT}/post`;
const LOUNGE_POST_LIKE   = `${LOUNGE_ROOT}/post/like`;
const LOUNGE_POST_REPORT = `${LOUNGE_ROOT}/post/report`;
const LOUNGE_COMMENT_LIST = `${LOUNGE_ROOT}/comments`;
const LOUNGE_COMMENT      = `${LOUNGE_ROOT}/comment`;

// center
const CENTER_ROOT = `${ROOT}/center`;
const CENTER_LIST = `${CENTER_ROOT}/list`;

// notice
const NOTICE_ROOT = `${ROOT}/notice`;
const NOTICE_LIST = `${NOTICE_ROOT}/list`;
const NOTICE_INFO = `${NOTICE_ROOT}/info`;

// profile (user)
const PROFILE_ROOT = `${ROOT}/user`;
const PROFILE_INFO              = `${PROFILE_ROOT}/profile`;
const PROFILE_CENTERS           = `${PROFILE_ROOT}/centers`;
const PROFILE_TICKETS           = `${PROFILE_ROOT}/tickets`;
const PROFILE_PRODUCTS          = `${PROFILE_ROOT}/products`;
const PROFILE_HISTORY           = `${PROFILE_ROOT}/history`;
const PROFILE_NOTIFICATION      = `${PROFILE_ROOT}/notification-settings`;

const ApiRoutes = {
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
};

export default ApiRoutes;
