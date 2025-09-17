export interface ReviewImage {
  reviewImageId: number;
  imageUrl: string;
}

export interface Review {
  receiptReviewId: number;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  nickname: string;
  images: ReviewImage[];
}

export interface ReviewListResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CreateReviewRequest {
  address: string;
  title: string;
  content: string;
  rating: number;
  startDate?: string;
  endDate?: string;
  storeName?: string;
  detailedLocation?: string;
  parentLocation?: string;
}

export interface CreateReviewFormData {
  title: string;
  content: string;
  location: string;
  rating: number;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  storeName?: string;
  detailedLocation?: string;
  parentLocation?: string;
}
