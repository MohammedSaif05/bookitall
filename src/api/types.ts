/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Auth API Types
 */
export interface SendOTPRequest {
  mobileNo: string;
}

export interface SendOTPResponse {
  message: string;
}

export interface VerifyOTPRequest {
  mobileNo: string;
  otp: string;
  userType: string;
}

export interface VerifyOTPResponse {
  message: string;
  userId: string;
}

export interface UpdateNameRequest {
  name: string;
}

export interface UpdateNameResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    phoneNumber: string;
  };
}

export interface ResendOTPRequest {
  mobileNo: string;
  sessionId?: string;
}

export interface ResendOTPResponse {
  message: string;
  sessionId?: string;
}

export interface UpdateCustomerDetailsRequest {
  customerName: string;
}

export interface UpdateCustomerDetailsResponse {
  message: string;
  userId: string;
  customerName: string;
}

export interface GetCustomerDetailsResponse {
  userId: string;
  customerName?: string;
  mobileNo?: string;
  [key: string]: any;
}

export interface RegisterDeviceRequest {
  deviceId: string;
  platform: 'ios' | 'android';
  fcmToken: string;
  appVersion: string;
}

export interface RegisterDeviceResponse {
  message: string;
  deviceId?: string;
}

/**
 * Categories API Types
 */
export interface Category {
  _id: string;
  slug: string;
  name: string;
  image: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetCategoriesResponse {
  categories: Category[];
}

/**
 * Promotions API Types
 */
export interface Promotion {
  promotionId: string;
  vendorId: string;
  imageUrl: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface GetPromotionsResponse {
  promotions: Promotion[];
}

/**
 * Businesses API Types
 */
export interface BusinessRating {
  average: number;
  count: number;
}

export interface BusinessPriceRange {
  type: 'range' | string;
  min: number;
  max?: number;
}

export interface Business {
  businessId: string;
  businessName: string;
  category: string;
  city: string;
  images: string[];
  rating: BusinessRating;
  distanceInKm: number;
  price: BusinessPriceRange;
}

export interface NearbyBusinessesResponse {
  businesses: Business[];
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Business Details API Types
 */
export interface BusinessAddress {
  address: string;
  landmark: string;
  city: string;
}

export interface BusinessTiming {
  day: string;
  open: string;
  close: string;
  breaks: any[];
  isClosed: boolean;
}

export interface BusinessService {
  serviceId: string;
  serviceName: string;
  price: number;
  durationInMinutes: number;
  serviceImage: string;
}

export interface BusinessReview {
  userName: string;
  rating: number;
  review: string;
  createdAt: string;
}

export interface BusinessDetails {
  business: {
    businessId: string;
    businessName: string;
    category: string;
    city: string;
    images: string[];
    rating: BusinessRating;
    address: BusinessAddress;
    distanceInKm: number;
  };
  timings: BusinessTiming[];
  services: BusinessService[];
  reviews: BusinessReview[];
}

