export enum ERouteName {
  AUTH_ROUTE = 'auth',
  SIGNIN_ROUTE = 'sign-in',
  SIGNUP_ROUTE = 'sign-up',
  USERS_ROUTE = 'users',
  GET_USER = 'user/:id',
  RATE_USER = 'rate/:id',
  MAKE_REVIEW = '/user/make-review',
  GET_REVIEWS = '/user/reviews',
  DELETE_REVIEW = '/user/review/:id',
  USER_UPDATEBYID_ROUTE = 'update/:id',
  DELETE_USER = 'user-delete/:id',
  DELETE_ME = 'user/delete',
  GET_USERS_ROUTE = 'get-all',
  SEND_OTP = 'send-otp',
  VERIFY_OTP = 'verify-otp',

  FOLLOW = ':id/follow',
  UNFOLLOW = ':id/unfollow',
  ISFOLLOWING = '/:id/is-following',

  SAVE_ROLE = 'save-role',
  SAVE_GENERAL_INFO = 'save-general-info',
  SAVE_ADDRESS = 'save-address',
  SAVE_CARD_INFO = 'save-card-info',
  SAVE_SIZES = 'save-sizes',

  GET_CARD_INFO = 'get-card-info',

  ORDERS_ROUTE = 'orders',
  PRODUCTS_ROUTE = 'products',
  GET_PRODUCTS_ROUTE = 'get-products',
  GET_ORDERS_ROUTE = 'get-orders',
  GET_TOTAL_SALES_ROUTE = 'get-total-sales',
  GET_AVERAGE_SALES_ROUTE = 'get-average-sales',
  GET_NUMBER_OF_ORDERS_ROUTE = 'get-number-of-orders',
  GET_TOTAL_SALES_PER_MONTH = 'get-total-sales-per-month',
  GET_TOTAL_SALES_FOR_CATEGORIES = 'get-total-sales-for-categories',
  GET_LAST_ORDERS = 'get-last-orders',

  GOOGLE_ROUTE = 'google',
  GOOGLE_REDIRECT = 'redirect',

  DOCS_ROUTE = 'api',
}
