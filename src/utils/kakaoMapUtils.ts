/**
 * 카카오맵 API 관련 유틸리티 함수
 */

// 카카오맵 API 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

// 전역 변수로 API 로드 상태 추적
let isKakaoMapInitialized = false;
let kakaoMapLoadPromise: Promise<void> | null = null;

// 이동 수단 타입
export type TransportType = 'DRIVING' | 'TRANSIT' | 'WALKING';

// 거리 계산 결과 타입
export interface RouteInfo {
  distance: number; // 미터 단위
  duration: number; // 초 단위
  formattedDistance: string; // 포맷된 거리 (예: 3.5km)
  formattedDuration: string; // 포맷된 시간 (예: 15분)
}

// 모든 이동 수단에 대한 경로 정보
export interface AllRouteInfo {
  driving?: RouteInfo;
  transit?: RouteInfo;
  walking?: RouteInfo;
  error?: string;
}

/**
 * 카카오맵 API가 이미 로드되었는지 확인
 * @returns 로드 여부
 */
export const isKakaoMapLoaded = (): boolean => {
  if (isKakaoMapInitialized) return true;

  // 실제 서비스 사용 가능 여부 체크
  const isLoaded = typeof window !== 'undefined' &&
    window.kakao !== undefined &&
    window.kakao.maps !== undefined &&
    window.kakao.maps.services !== undefined;

  if (isLoaded) {

    isKakaoMapInitialized = true;
  }

  return isLoaded;
};

/**
 * 카카오맵 API 스크립트를 로드하는 함수
 * @returns Promise that resolves when the API is loaded
 */
export const loadKakaoMapAPI = (): Promise<void> => {
  // 이미 초기화된 경우 바로 resolved 상태의 Promise 반환
  if (isKakaoMapLoaded()) {
    return Promise.resolve();
  }

  // 이미 로드 중인 경우 해당 Promise 반환
  if (kakaoMapLoadPromise) {
    return kakaoMapLoadPromise;
  }

  // 기존 스크립트 제거 (충돌 방지)
  const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
  if (existingScript) {
    existingScript.remove();
  }

  // 새로운 로드 작업 시작
  kakaoMapLoadPromise = new Promise<void>((resolve, reject) => {
    try {
      // 새로운 스크립트 요소 생성
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;

      // 라이브러리 명시적 포함 (순서 중요: services를 맨 앞에)
      // autoload를 false로 설정하여 명시적으로 로드하도록 함
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer,drawing&autoload=false`;

      // 최대 대기 시간 설정 (10초)
      const timeoutId = setTimeout(() => {
        isKakaoMapInitialized = true;
        resolve();
      }, 10000);

      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            // 타임아웃 취소
            clearTimeout(timeoutId);

            // 기본 maps 객체 확인으로 간소화
            if (window.kakao.maps.services) {
              isKakaoMapInitialized = true;
              resolve();
            } else {
              console.error('카카오맵 API 서비스 객체 없음');
              isKakaoMapInitialized = true; // 오류 발생해도 초기화 완료로 간주
              resolve(); // 오류가 있어도 앱은 계속 진행되도록 reject 대신 resolve 호출
            }
          });
        } else {
          // 타임아웃 취소
          clearTimeout(timeoutId);
          console.error('카카오맵 초기화 실패: kakao 객체 없음');
          isKakaoMapInitialized = true; // 오류 발생해도 초기화 완료로 간주
          resolve(); // 오류가 있어도 앱은 계속 진행되도록 reject 대신 resolve 호출
        }
      };

      script.onerror = (error) => {
        // 타임아웃 취소
        clearTimeout(timeoutId);
        console.error('카카오맵 API 로드 실패:', error);
        kakaoMapLoadPromise = null; // 로드 실패 시 다시 시도할 수 있도록 Promise 참조 초기화
        isKakaoMapInitialized = true; // 오류 발생해도 초기화 완료로 간주
        resolve(); // 오류가 있어도 앱은 계속 진행되도록 reject 대신 resolve 호출
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('카카오맵 API 로드 중 예외 발생:', error);
      kakaoMapLoadPromise = null;
      isKakaoMapInitialized = true; // 오류 발생해도 초기화 완료로 간주
      resolve(); // 오류가 있어도 앱은 계속 진행되도록 reject 대신 resolve 호출
    }
  }).catch(error => {
    // 에러 발생 시 Promise 참조 초기화
    kakaoMapLoadPromise = null;
    isKakaoMapInitialized = true; // 최종 캐치 지점에서도 초기화 완료로 간주
    return Promise.resolve(); // 항상 resolved Promise 반환
  });

  return kakaoMapLoadPromise;
};

/**
 * 시간(초)을 사람이 읽기 쉬운 형식으로 변환합니다.
 * @param seconds 초 단위 시간
 * @returns 포맷된 시간 문자열 (예: 1시간 30분)
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''}`;
  }
  return `${minutes}분`;
};

/**
 * 거리(미터)를 사람이 읽기 쉬운 형식으로 변환합니다.
 * @param meters 미터 단위 거리
 * @returns 포맷된 거리 문자열 (예: 3.5km 또는 500m)
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
};

/**
 * 두 지점 간의 자동차 경로를 계산합니다.
 * @param origin 출발지 (주소 또는 위경도)
 * @param destination 도착지 (주소 또는 위경도)
 * @returns 경로 정보를 담은 Promise
 */
export const getCarRoute = async (origin: string, destination: string): Promise<RouteInfo> => {
  // API 로드 확인
  await loadKakaoMapAPI();

  // API 객체 확인
  if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
    throw new Error('카카오맵 API가 로드되지 않았습니다.');
  }

  // Directions 서비스가 없는 경우 대체 계산 사용
  if (typeof window.kakao.maps.services.Directions !== 'function') {
    console.warn('Directions 서비스를 사용할 수 없어 예상 시간으로 대체합니다.');
    return estimateRouteTime(origin, destination, 'DRIVING');
  }

  return new Promise((resolve, reject) => {
    try {
      const directions = new window.kakao.maps.services.Directions();

      // 주소와 좌표 구분
      const formatPoint = (point: string) => {
        if (point.includes(',')) {
          const [lat, lng] = point.split(',').map(Number);
          return new window.kakao.maps.LatLng(lat, lng);
        }
        return point;
      };

      directions.route({
        origin: formatPoint(origin),
        destination: formatPoint(destination),
        vehicleType: 'car',
      }, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const route = result.routes[0];
          const path = route.result.path[0];

          const distance = path.distance; // 미터 단위
          const duration = path.duration; // 초 단위

          resolve({
            distance,
            duration,
            formattedDistance: formatDistance(distance),
            formattedDuration: formatDuration(duration)
          });
        } else {
          console.warn(`자동차 경로 검색 실패: ${status}, 예상 시간으로 대체합니다.`);
          resolve(estimateRouteTime(origin, destination, 'DRIVING'));
        }
      });
    } catch (error) {
      console.warn('자동차 경로 계산 중 오류:', error);
      resolve(estimateRouteTime(origin, destination, 'DRIVING'));
    }
  });
};

/**
 * 두 지점 간의 대중교통 경로를 계산합니다.
 * @param origin 출발지 (주소 또는 위경도)
 * @param destination 도착지 (주소 또는 위경도)
 * @returns 경로 정보를 담은 Promise
 */
export const getTransitRoute = async (origin: string, destination: string): Promise<RouteInfo> => {
  // API 로드 확인
  await loadKakaoMapAPI();

  // API 객체 확인
  if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
    throw new Error('카카오맵 API가 로드되지 않았습니다.');
  }

  // Directions 서비스가 없는 경우 대체 계산 사용
  if (typeof window.kakao.maps.services.Directions !== 'function') {
    console.warn('Directions 서비스를 사용할 수 없어 예상 시간으로 대체합니다.');
    return estimateRouteTime(origin, destination, 'TRANSIT');
  }

  return new Promise((resolve, reject) => {
    try {
      const directions = new window.kakao.maps.services.Directions();

      // 주소와 좌표 구분
      const formatPoint = (point: string) => {
        if (point.includes(',')) {
          const [lat, lng] = point.split(',').map(Number);
          return new window.kakao.maps.LatLng(lat, lng);
        }
        return point;
      };

      directions.route({
        origin: formatPoint(origin),
        destination: formatPoint(destination),
        vehicleType: 'transit',
      }, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const route = result.routes[0];
          const path = route.result.path[0];

          const distance = path.distance; // 미터 단위
          const duration = path.duration; // 초 단위

          resolve({
            distance,
            duration,
            formattedDistance: formatDistance(distance),
            formattedDuration: formatDuration(duration)
          });
        } else {
          console.warn(`대중교통 경로 검색 실패: ${status}, 예상 시간으로 대체합니다.`);
          resolve(estimateRouteTime(origin, destination, 'TRANSIT'));
        }
      });
    } catch (error) {
      console.warn('대중교통 경로 계산 중 오류:', error);
      resolve(estimateRouteTime(origin, destination, 'TRANSIT'));
    }
  });
};

/**
 * 두 지점 간의 도보 경로를 계산합니다.
 * @param origin 출발지 (주소 또는 위경도)
 * @param destination 도착지 (주소 또는 위경도)
 * @returns 경로 정보를 담은 Promise
 */
export const getWalkingRoute = async (origin: string, destination: string): Promise<RouteInfo> => {
  // API 로드 확인
  await loadKakaoMapAPI();

  // API 객체 확인
  if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
    throw new Error('카카오맵 API가 로드되지 않았습니다.');
  }

  // Directions 서비스가 없는 경우 대체 계산 사용
  if (typeof window.kakao.maps.services.Directions !== 'function') {
    console.warn('Directions 서비스를 사용할 수 없어 예상 시간으로 대체합니다.');
    return estimateRouteTime(origin, destination, 'WALKING');
  }

  return new Promise((resolve, reject) => {
    try {
      const directions = new window.kakao.maps.services.Directions();

      // 주소와 좌표 구분
      const formatPoint = (point: string) => {
        if (point.includes(',')) {
          const [lat, lng] = point.split(',').map(Number);
          return new window.kakao.maps.LatLng(lat, lng);
        }
        return point;
      };

      directions.route({
        origin: formatPoint(origin),
        destination: formatPoint(destination),
        vehicleType: 'walking',
      }, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const route = result.routes[0];
          const path = route.result.path[0];

          const distance = path.distance; // 미터 단위
          const duration = path.duration; // 초 단위

          resolve({
            distance,
            duration,
            formattedDistance: formatDistance(distance),
            formattedDuration: formatDuration(duration)
          });
        } else {
          console.warn(`도보 경로 검색 실패: ${status}, 예상 시간으로 대체합니다.`);
          resolve(estimateRouteTime(origin, destination, 'WALKING'));
        }
      });
    } catch (error) {
      console.warn('도보 경로 계산 중 오류:', error);
      resolve(estimateRouteTime(origin, destination, 'WALKING'));
    }
  });
};

/**
 * 두 지점 간 이동 시간을 직선 거리 기반으로 예상 계산합니다.
 * Directions 서비스를 사용할 수 없을 때 대체 수단으로 사용됩니다.
 */
function estimateRouteTime(origin: string, destination: string, mode: 'DRIVING' | 'TRANSIT' | 'WALKING'): Promise<RouteInfo> {
  return new Promise(async (resolve) => {
    try {
      // Places 서비스를 사용하여 두 지점의 좌표를 구함
      let originCoords: { x: number, y: number };
      let destCoords: { x: number, y: number };

      if (origin.includes(',')) {
        const [lat, lng] = origin.split(',').map(Number);
        originCoords = { y: lat, x: lng };
      } else {
        try {
          const result = await geocodeAddress(origin);
          originCoords = { x: parseFloat(result.x), y: parseFloat(result.y) };
        } catch {
          // 주소 변환 실패 시 기본값 사용 (서울시청)
          originCoords = { x: 126.978, y: 37.566 };
        }
      }

      if (destination.includes(',')) {
        const [lat, lng] = destination.split(',').map(Number);
        destCoords = { y: lat, x: lng };
      } else {
        try {
          const result = await geocodeAddress(destination);
          destCoords = { x: parseFloat(result.x), y: parseFloat(result.y) };
        } catch {
          // 주소 변환 실패 시 기본값 사용 (경복궁)
          destCoords = { x: 126.977, y: 37.579 };
        }
      }

      // 직선 거리 계산 (하버사인 공식)
      const R = 6371000; // 지구 반경 (미터)
      const dLat = (destCoords.y - originCoords.y) * Math.PI / 180;
      const dLon = (destCoords.x - originCoords.x) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(originCoords.y * Math.PI / 180) * Math.cos(destCoords.y * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      // 직선 거리 (미터)
      const distance = R * c;

      // 실제 도로 거리는 직선 거리보다 약 1.3~1.5배 길다고 가정
      const roadFactor = 1.4;
      const roadDistance = distance * roadFactor;

      // 이동 수단별 속도 (미터/초)
      let speed = 13.9; // 자동차 기본 (50km/h)

      switch (mode) {
        case 'DRIVING':
          speed = 13.9; // 50km/h
          break;
        case 'TRANSIT':
          speed = 8.3;  // 30km/h
          break;
        case 'WALKING':
          speed = 1.4;  // 5km/h
          break;
      }

      // 이동 시간 계산 (초)
      const duration = Math.round(roadDistance / speed);

      resolve({
        distance: Math.round(roadDistance),
        duration,
        formattedDistance: formatDistance(Math.round(roadDistance)),
        formattedDuration: formatDuration(duration)
      });
    } catch (error) {
      console.error('예상 시간 계산 오류:', error);

      // 오류 발생 시 기본값 사용
      const defaultDistance = 5000; // 5km
      let defaultDuration = 600; // 10분

      switch (mode) {
        case 'DRIVING':
          defaultDuration = 600; // 10분
          break;
        case 'TRANSIT':
          defaultDuration = 900; // 15분
          break;
        case 'WALKING':
          defaultDuration = 3600; // 60분
          break;
      }

      resolve({
        distance: defaultDistance,
        duration: defaultDuration,
        formattedDistance: formatDistance(defaultDistance),
        formattedDuration: formatDuration(defaultDuration)
      });
    }
  });
}

/**
 * 두 지점 간의 모든 이동 수단에 대한 경로를 계산합니다.
 * @param origin 출발지 (주소 또는 위경도)
 * @param destination 도착지 (주소 또는 위경도)
 * @returns 모든 이동 수단에 대한 경로 정보를 담은 Promise
 */
export const getAllRoutes = async (origin: string, destination: string): Promise<AllRouteInfo> => {
  try {
    const result: AllRouteInfo = {};

    try {
      result.driving = await getCarRoute(origin, destination);
    } catch (error) {
      console.warn('자동차 경로 계산 실패:', error);
    }

    try {
      result.transit = await getTransitRoute(origin, destination);
    } catch (error) {
      console.warn('대중교통 경로 계산 실패:', error);
    }

    try {
      result.walking = await getWalkingRoute(origin, destination);
    } catch (error) {
      console.warn('도보 경로 계산 실패:', error);
    }

    if (!result.driving && !result.transit && !result.walking) {
      result.error = '모든 이동 수단에 대한 경로 계산에 실패했습니다.';
    }

    return result;
  } catch (error) {
    console.error('경로 계산 오류:', error);
    return { error: '경로 계산 중 오류가 발생했습니다.' };
  }
};

// 객체의 안전한 접근을 위한 유틸리티 함수
const safeAccess = (obj: any, keys: string[]): any => {
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return current;
};

// 서비스 안전하게 가져오기
const getKakaoService = (serviceName: string): any => {
  if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
    console.warn(`카카오맵 services 객체 없음 (${serviceName} 요청)`);
    return null;
  }

  const service = window.kakao.maps.services[serviceName];
  if (typeof service !== 'function') {
    console.warn(`카카오맵 ${serviceName} 서비스 사용 불가`);
    return null;
  }

  return service;
};

/**
 * 주소나 장소명을 좌표로 변환합니다.
 * @param address 주소 또는 장소명
 * @returns 좌표 정보를 담은 Promise
 */
export const geocodeAddress = async (address: string): Promise<{ x: string, y: string }> => {
  try {
    await loadKakaoMapAPI();

    // 카카오맵 API가 제대로 로드되었는지 확인
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.warn('카카오맵 API services 객체가 없습니다. 기본 좌표를 반환합니다.');
      return { x: '126.978', y: '37.566' }; // 서울시청 좌표
    }

    return new Promise((resolve, reject) => {
      try {
        // tryGeocoder 함수를 미리 정의 (함수 표현식 사용)
        const tryGeocoder = () => {
          const Geocoder = getKakaoService('Geocoder');
          if (Geocoder) {
            const geocoder = new Geocoder();

            geocoder.addressSearch(address, (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK) {
                resolve({
                  x: result[0].x, // 경도
                  y: result[0].y  // 위도
                });
              } else {
                console.warn('Geocoder 서비스 검색 실패, 기본 좌표 반환');
                resolve({ x: '126.978', y: '37.566' }); // 서울시청 좌표
              }
            });
          } else {
            console.warn('모든 검색 서비스 실패, 기본 좌표 반환');
            resolve({ x: '126.978', y: '37.566' }); // 서울시청 좌표
          }
        };

        // Places 서비스 먼저 시도
        const Places = getKakaoService('Places');
        if (Places) {
          const places = new Places();

          places.keywordSearch(address, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
              resolve({
                x: result[0].x, // 경도
                y: result[0].y  // 위도
              });
            } else {
              console.warn('Places 서비스 검색 실패, Geocoder 시도');
              tryGeocoder();
            }
          });
          return;
        }

        // Places 없으면 Geocoder 시도
        tryGeocoder();
      } catch (error) {
        console.error('주소 검색 처리 중 오류:', error);
        resolve({ x: '126.978', y: '37.566' }); // 오류 시 서울시청 좌표
      }
    });
  } catch (error) {
    console.error('주소 검색 오류 (최상위):', error);
    return { x: '126.978', y: '37.566' }; // 오류 시 서울시청 좌표
  }
}; 