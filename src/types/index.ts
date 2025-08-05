export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Course {
  courseId: number
  contentId: string
  thumbnailUrl: string
  title: string
  area: string
  likeCount: number
  rating?: number
}

export interface Destination {
  destinationId: number;
  destinationAddr1: string;
  destinationAddr2: string;
  destinationContentId: string;
  destinationLatitude: number;
  destinationLongitude: number;
  destinationName: string;
  destinationOriginImageUrl: string;          // 원본 이미지 URL
  destinationRating: number;                  // 평점
  destinationTel: string;
  destinationThumbnailImageUrl: string;       // 썸네일 URL
  destinationAddressId: number;
  destinationCategoryId: number;
}

// 이력서 관련 인터페이스 삭제

// 여기에 다른 타입 정의가 있다면 그대로 유지 