// 로컬 이미지를 사용하는 서비스

// 카테고리별 이미지 매핑
const categoryImages: Record<string, string[]> = {
  '음식': [
    '/images/categories/food/food1.jpg',
    '/images/categories/food/food2.jpg'
  ],
  '자연': [
    '/images/categories/nature/nature1.jpg',
    '/images/categories/nature/nature2.jpg'
  ],
  '바다': [
    '/images/categories/sea/sea1.jpg',
    '/images/categories/sea/sea2.jpg'
  ],
  '산': [
    '/images/categories/mountain/mountain1.jpg',
    '/images/categories/mountain/mountain2.jpg'
  ],
  '카페': [
    '/images/categories/cafe/cafe1.jpg',
    '/images/categories/cafe/cafe2.jpg'
  ],
  '문화': [
    '/images/categories/culture/culture1.jpg',
    '/images/categories/culture/culture2.jpg'
  ],
  '공원': [
    '/images/categories/park/park1.jpg',
    '/images/categories/park/park2.jpg'
  ]
};

// 지역별 이미지 매핑
const locationImages: Record<string, string[]> = {
  '서울': [
    '/images/locations/seoul/seoul1.jpg',
    '/images/locations/seoul/seoul2.jpg'
  ],
  '부산': [
    '/images/locations/busan/busan1.jpg',
    '/images/locations/busan/busan2.jpg'
  ],
  '제주도': [
    '/images/locations/jeju/jeju1.jpg',
    '/images/locations/jeju/jeju2.jpg',
    '/images/locations/jeju/jeju3.jpg'
  ],
  '강원도': [
    '/images/locations/gangwon/gangwon1.jpg',
    '/images/locations/gangwon/gangwon2.jpg',
    '/images/locations/gangwon/gangwon3.jpg'
  ],
  '경주': [
    '/images/locations/gyeongju/gyeongju1.jpg',
    '/images/locations/gyeongju/gyeongju2.jpg'
  ],
  '전주': [
    '/images/locations/jeonju/jeonju1.jpg',
    '/images/locations/jeonju/jeonju2.jpg'
  ]
};

// 기본 이미지 경로
const defaultImages = [
  '/images/default/default1.jpg',
  '/images/default/default2.jpg'
];

// 배열 섞기
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 키워드를 기반으로 이미지 검색
export const getImagesByKeyword = async (
  location: string,
  keyword: string = '',
  tag: string = ''
): Promise<string[]> => {
  try {
    // 키워드 처리
    const keywords = [keyword, tag]
      .join(',')
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    // 1. 키워드로 이미지 검색
    if (keywords.length > 0) {
      for (const k of keywords) {
        for (const [category, images] of Object.entries(categoryImages)) {
          if (k.includes(category) || category.includes(k)) {
            return shuffleArray(images);
          }
        }
      }
    }

    // 2. 위치로 이미지 검색
    if (location) {
      const locationParts = location.split(/\s+/).filter(Boolean);

      for (const part of locationParts) {
        for (const [loc, images] of Object.entries(locationImages)) {
          if (part.includes(loc) || loc.includes(part)) {
            return shuffleArray(images);
          }
        }
      }
    }

    // 3. 기본 이미지 반환
    return shuffleArray(defaultImages);
  } catch (error) {
    console.error('이미지 검색 오류:', error);
    return [getDefaultImage(location)];
  }
};

// 백업용 기본 이미지
export const getDefaultImage = (location: string): string => {
  const locationMap: Record<string, string> = {
    '제주도': '/images/locations/jeju/jeju1.jpg',
    '서울': '/images/locations/seoul/seoul1.jpg',
    '부산': '/images/locations/busan/busan1.jpg',
    '경주': '/images/locations/gyeongju/gyeongju1.jpg',
    '전주': '/images/locations/jeonju/jeonju1.jpg',
    '강원도': '/images/locations/gangwon/gangwon1.jpg'
  };

  // 위치에 해당하는 이미지가 있으면 사용, 없으면 기본 이미지 사용
  for (const [key, value] of Object.entries(locationMap)) {
    if (location.includes(key)) return value;
  }

  return '/images/default/default1.jpg';
}; 