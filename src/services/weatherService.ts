/**
 * 기상청 날씨 API 서비스
 * VilageFcstInfoService_2.0 API 사용
 */

// 기상청 API 엔드포인트
const API_ENDPOINT =
  "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0";
const API_KEY =
  "xe6%2F1dkLBOo4GmKdiGkFj1x7uqBZmNdR0LtBLCejOWVGHuNsQSE%2FXqo6qePDv%2B5PSsQ3ngor6pigpKS1OA1w3A%3D%3D";

// 지역 좌표 정보 (격자 X, Y)
// 기상청 API는 격자 좌표계를 사용하므로 주요 지역의 격자 좌표 매핑
interface RegionCoordinate {
  x: number;
  y: number;
}

// 주요 지역 격자 좌표 (행정구역별 좌표는 기상청 제공 파일 참고)
const REGION_COORDINATES: Record<string, RegionCoordinate> = {
  // 서울 지역
  서울: { x: 60, y: 127 },
  서울시: { x: 60, y: 127 },
  서울특별시: { x: 60, y: 127 },
  종로구: { x: 60, y: 127 },
  중구: { x: 60, y: 127 },
  용산구: { x: 60, y: 126 },
  성동구: { x: 61, y: 127 },
  광진구: { x: 62, y: 126 },
  동대문구: { x: 61, y: 127 },
  중랑구: { x: 62, y: 128 },
  성북구: { x: 61, y: 127 },
  강북구: { x: 61, y: 128 },
  도봉구: { x: 61, y: 129 },
  노원구: { x: 61, y: 129 },
  은평구: { x: 59, y: 127 },
  서대문구: { x: 59, y: 127 },
  마포구: { x: 59, y: 127 },
  양천구: { x: 58, y: 126 },
  강서구: { x: 58, y: 126 },
  구로구: { x: 58, y: 125 },
  금천구: { x: 59, y: 124 },
  영등포구: { x: 58, y: 126 },
  동작구: { x: 59, y: 125 },
  관악구: { x: 59, y: 125 },
  서초구: { x: 61, y: 125 },
  강남구: { x: 61, y: 126 },
  송파구: { x: 62, y: 126 },
  강동구: { x: 62, y: 126 },

  // 부산 지역
  부산: { x: 98, y: 76 },
  부산시: { x: 98, y: 76 },
  부산광역시: { x: 98, y: 76 },
  해운대구: { x: 99, y: 75 },
  수영구: { x: 99, y: 75 },
  남구: { x: 98, y: 75 },
  부산진구: { x: 97, y: 75 },
  동래구: { x: 98, y: 76 },

  // 인천 지역
  인천: { x: 55, y: 124 },
  인천시: { x: 55, y: 124 },
  인천광역시: { x: 55, y: 124 },

  // 대전 지역
  대전: { x: 67, y: 100 },
  대전시: { x: 67, y: 100 },
  대전광역시: { x: 67, y: 100 },

  // 대구 지역
  대구: { x: 89, y: 90 },
  대구시: { x: 89, y: 90 },
  대구광역시: { x: 89, y: 90 },

  // 울산 지역
  울산: { x: 102, y: 84 },
  울산시: { x: 102, y: 84 },
  울산광역시: { x: 102, y: 84 },

  // 광주 지역
  광주: { x: 58, y: 74 },
  광주시: { x: 58, y: 74 },
  광주광역시: { x: 58, y: 74 },

  // 세종 지역
  세종: { x: 66, y: 103 },
  세종시: { x: 66, y: 103 },
  세종특별자치시: { x: 66, y: 103 },

  // 제주 지역
  제주: { x: 52, y: 38 },
  제주시: { x: 52, y: 38 },
  제주특별자치도: { x: 52, y: 38 },
  서귀포: { x: 53, y: 33 },
  서귀포시: { x: 53, y: 33 },

  // 경기도 지역
  경기: { x: 60, y: 120 },
  경기도: { x: 60, y: 120 },
  수원: { x: 60, y: 121 },
  수원시: { x: 60, y: 121 },
  성남: { x: 62, y: 123 },
  성남시: { x: 62, y: 123 },
  고양: { x: 58, y: 128 },
  고양시: { x: 58, y: 128 },
  용인: { x: 64, y: 119 },
  용인시: { x: 64, y: 119 },
  부천: { x: 56, y: 125 },
  부천시: { x: 56, y: 125 },
  안산: { x: 58, y: 121 },
  안산시: { x: 58, y: 121 },
  안양: { x: 59, y: 123 },
  안양시: { x: 59, y: 123 },
  남양주: { x: 64, y: 128 },
  남양주시: { x: 64, y: 128 },
  화성: { x: 57, y: 119 },
  화성시: { x: 57, y: 119 },
  평택: { x: 62, y: 114 },
  평택시: { x: 62, y: 114 },
  의정부: { x: 61, y: 131 },
  의정부시: { x: 61, y: 131 },
  파주: { x: 56, y: 131 },
  파주시: { x: 56, y: 131 },
  시흥: { x: 57, y: 123 },
  시흥시: { x: 57, y: 123 },
  김포: { x: 55, y: 128 },
  김포시: { x: 55, y: 128 },
  광명: { x: 58, y: 125 },
  광명시: { x: 58, y: 125 },
  경기광주: { x: 65, y: 123 },
  경기광주시: { x: 65, y: 123 },
  군포: { x: 59, y: 122 },
  군포시: { x: 59, y: 122 },
  하남: { x: 64, y: 126 },
  하남시: { x: 64, y: 126 },
  오산: { x: 62, y: 118 },
  오산시: { x: 62, y: 118 },
  이천: { x: 68, y: 121 },
  이천시: { x: 68, y: 121 },
  구리: { x: 62, y: 127 },
  구리시: { x: 62, y: 127 },
  양주: { x: 61, y: 131 },
  양주시: { x: 61, y: 131 },
  안성: { x: 65, y: 115 },
  안성시: { x: 65, y: 115 },
  포천: { x: 64, y: 134 },
  포천시: { x: 64, y: 134 },
  의왕: { x: 60, y: 122 },
  의왕시: { x: 60, y: 122 },
  여주: { x: 71, y: 121 },
  여주시: { x: 71, y: 121 },
  양평: { x: 69, y: 125 },
  양평군: { x: 69, y: 125 },
  동두천: { x: 61, y: 134 },
  동두천시: { x: 61, y: 134 },
  과천: { x: 60, y: 124 },
  과천시: { x: 60, y: 124 },
  가평: { x: 69, y: 133 },
  가평군: { x: 69, y: 133 },
  연천: { x: 61, y: 138 },
  연천군: { x: 61, y: 138 },

  // 강원도 지역
  강원: { x: 73, y: 134 },
  강원도: { x: 73, y: 134 },
  춘천: { x: 73, y: 134 },
  춘천시: { x: 73, y: 134 },
  원주: { x: 76, y: 122 },
  원주시: { x: 76, y: 122 },
  강릉: { x: 92, y: 131 },
  강릉시: { x: 92, y: 131 },
  속초: { x: 87, y: 141 },
  속초시: { x: 87, y: 141 },
  동해: { x: 97, y: 127 },
  동해시: { x: 97, y: 127 },
  태백: { x: 95, y: 119 },
  태백시: { x: 95, y: 119 },
  삼척: { x: 98, y: 125 },
  삼척시: { x: 98, y: 125 },
  홍천: { x: 75, y: 130 },
  홍천군: { x: 75, y: 130 },
  횡성: { x: 77, y: 125 },
  횡성군: { x: 77, y: 125 },
  영월: { x: 86, y: 119 },
  영월군: { x: 86, y: 119 },
  평창: { x: 84, y: 123 },
  평창군: { x: 84, y: 123 },
  정선: { x: 89, y: 123 },
  정선군: { x: 89, y: 123 },
  철원: { x: 65, y: 139 },
  철원군: { x: 65, y: 139 },
  화천: { x: 72, y: 139 },
  화천군: { x: 72, y: 139 },
  양구: { x: 77, y: 139 },
  양구군: { x: 77, y: 139 },
  인제: { x: 80, y: 138 },
  인제군: { x: 80, y: 138 },
  고성: { x: 85, y: 145 },
  고성군: { x: 85, y: 145 },
  양양: { x: 88, y: 138 },
  양양군: { x: 88, y: 138 },

  // 전라도 지역
  전북: { x: 63, y: 89 },
  전라북도: { x: 63, y: 89 },
  전남: { x: 51, y: 67 },
  전라남도: { x: 51, y: 67 },
  전주: { x: 63, y: 89 },
  전주시: { x: 63, y: 89 },
  목포: { x: 50, y: 67 },
  목포시: { x: 50, y: 67 },
  여수: { x: 73, y: 66 },
  여수시: { x: 73, y: 66 },
  순천: { x: 70, y: 70 },
  순천시: { x: 70, y: 70 },
  나주: { x: 56, y: 71 },
  나주시: { x: 56, y: 71 },
  광양: { x: 73, y: 70 },
  광양시: { x: 73, y: 70 },

  // 경상도 지역
  경북: { x: 89, y: 91 },
  경상북도: { x: 89, y: 91 },
  경남: { x: 91, y: 77 },
  경상남도: { x: 91, y: 77 },
  포항: { x: 102, y: 94 },
  포항시: { x: 102, y: 94 },
  경주: { x: 100, y: 91 },
  경주시: { x: 100, y: 91 },
  안동: { x: 91, y: 106 },
  안동시: { x: 91, y: 106 },
  구미: { x: 84, y: 96 },
  구미시: { x: 84, y: 96 },
  창원: { x: 90, y: 77 },
  창원시: { x: 90, y: 77 },
  진주: { x: 81, y: 75 },
  진주시: { x: 81, y: 75 },

  // 충청도 지역
  충북: { x: 69, y: 107 },
  충청북도: { x: 69, y: 107 },
  충남: { x: 68, y: 100 },
  충청남도: { x: 68, y: 100 },
  청주: { x: 69, y: 106 },
  청주시: { x: 69, y: 106 },
  천안: { x: 63, y: 110 },
  천안시: { x: 63, y: 110 },
  아산: { x: 60, y: 110 },
  아산시: { x: 60, y: 110 },
  보령: { x: 54, y: 100 },
  보령시: { x: 54, y: 100 },
  공주: { x: 63, y: 102 },
  공주시: { x: 63, y: 102 },
  논산: { x: 62, y: 97 },
  논산시: { x: 62, y: 97 },
  계룡: { x: 65, y: 99 },
  계룡시: { x: 65, y: 99 },
  당진: { x: 54, y: 112 },
  당진시: { x: 54, y: 112 },
  서산: { x: 51, y: 110 },
  서산시: { x: 51, y: 110 },
  금산: { x: 69, y: 95 },
  금산군: { x: 69, y: 95 },
  부여: { x: 59, y: 99 },
  부여군: { x: 59, y: 99 },
  서천: { x: 55, y: 94 },
  서천군: { x: 55, y: 94 },
  청양: { x: 57, y: 103 },
  청양군: { x: 57, y: 103 },
  홍성: { x: 55, y: 106 },
  홍성군: { x: 55, y: 106 },
  예산: { x: 58, y: 107 },
  예산군: { x: 58, y: 107 },
  태안: { x: 48, y: 109 },
  태안군: { x: 48, y: 109 },
  진천: { x: 68, y: 111 },
  진천군: { x: 68, y: 111 },
  괴산: { x: 74, y: 111 },
  괴산군: { x: 74, y: 111 },
  음성: { x: 72, y: 113 },
  음성군: { x: 72, y: 113 },
  단양: { x: 84, y: 115 },
  단양군: { x: 84, y: 115 },
  제천: { x: 81, y: 118 },
  제천시: { x: 81, y: 118 },
  충주: { x: 76, y: 114 },
  충주시: { x: 76, y: 114 },
  증평: { x: 71, y: 112 },
  증평군: { x: 71, y: 112 },
  보은: { x: 73, y: 103 },
  보은군: { x: 73, y: 103 },
  옥천: { x: 71, y: 99 },
  옥천군: { x: 71, y: 99 },
  영동: { x: 74, y: 97 },
  영동군: { x: 74, y: 97 },
};

// 날씨 정보 인터페이스
export interface WeatherData {
  date: string; // 날짜
  time: string; // 시간
  sky: string; // 하늘 상태 (맑음, 구름많음, 흐림)
  pty: string; // 강수 형태 (없음, 비, 비/눈, 눈, 소나기...)
  tmp: number; // 기온
  pop: number; // 강수확률 (%)
  pcp: string; // 1시간 강수량 (mm)
  reh: number; // 습도 (%)
  wsd: number; // 풍속 (m/s)
}

// 계절 정보 인터페이스
export interface SeasonalInfo {
  bestSeason: string; // 최적 계절 (봄, 여름, 가을, 겨울)
  months: string; // 추천 월 (예: "3-5월, 9-11월")
  conditions: string; // 날씨 조건 설명
  preparation: string; // 준비물 권장사항
}

/**
 * 지역명으로 격자 좌표를 조회하는 함수
 */
export function getGridCoordinateByRegion(
  regionName: string
): RegionCoordinate | null {
  // 지역명에서 첫 두 글자만 추출 (예: "서울특별시" -> "서울")
  const shortRegionName = regionName.substring(0, 2);

  // 정확한 매칭 시도
  if (REGION_COORDINATES[regionName]) {
    return REGION_COORDINATES[regionName];
  }

  // 주요 도시명으로 시작하는지 확인
  for (const [region, coord] of Object.entries(REGION_COORDINATES)) {
    if (regionName.startsWith(region)) {
      return coord;
    }
  }

  // 첫 두 글자로 매칭 시도
  if (REGION_COORDINATES[shortRegionName]) {
    return REGION_COORDINATES[shortRegionName];
  }

  // 단어 포함 여부로 검색
  for (const [region, coord] of Object.entries(REGION_COORDINATES)) {
    if (regionName.includes(region)) {
      return coord;
    }
  }

  // 매칭 실패 시 서울 좌표 반환 (기본값)
  return REGION_COORDINATES["서울"];
}

/**
 * 단기 예보 조회 함수
 * @param regionName 지역명 (예: '서울', '제주', '부산')
 * @returns 날씨 예보 데이터 배열
 */
export async function getShortTermForecast(
  regionName: string
): Promise<WeatherData[]> {
  try {
    // 공백 제거
    const cleanRegionName = regionName.trim();

    // 격자 좌표 조회
    const coord = getGridCoordinateByRegion(cleanRegionName);
    if (!coord) {
      throw new Error(
        `지역 "${cleanRegionName}"에 대한 좌표를 찾을 수 없습니다.`
      );
    }

    // 현재 날짜 포맷팅 (yyyyMMdd)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}${month}${day}`;

    // 현재 시간 포맷팅 - API 요청에 맞춰 발표 시간 사용
    const hour = today.getHours();

    // 기상청 발표 시간은 02:10, 05:10, 08:10, 11:10, 14:10, 17:10, 20:10, 23:10
    // 가장 최근 발표 시간으로 설정
    let baseTime;
    if (hour < 2) {
      baseTime = "2300";
    } else if (hour < 5) {
      baseTime = "0200";
    } else if (hour < 8) {
      baseTime = "0500";
    } else if (hour < 11) {
      baseTime = "0800";
    } else if (hour < 14) {
      baseTime = "1100";
    } else if (hour < 17) {
      baseTime = "1400";
    } else if (hour < 20) {
      baseTime = "1700";
    } else if (hour < 23) {
      baseTime = "2000";
    } else {
      baseTime = "2300";
    }

    // 기준 날짜 설정 (새벽 시간대는 전날 데이터 사용)
    const baseDate =
      hour < 2
        ? new Date(today.setDate(today.getDate() - 1))
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "")
        : formattedDate;

    // Next.js API 라우트를 통해 간접 호출 (CORS 우회)
    const path = `/api/weather/forecast?serviceKey=${API_KEY}&base_date=${baseDate}&base_time=${baseTime}&nx=${coord.x}&ny=${coord.y}`;

    // 서버 환경에서는 절대 URL이 필요함
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"
        : "";

    const response = await fetch(`${baseUrl}${path}`);

    if (!response.ok) {
      throw new Error(
        `날씨 API 오류: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // 응답 데이터 파싱 및 가공
    if (data.response?.body?.items?.item) {
      // 시간별로 데이터 정리
      const forecastMap = new Map<string, WeatherData>();
      const forecastItems = data.response.body.items.item;

      // 현재 시간 이후의 예보만 필터링하기 위한 기준 시간 (현재 시간의 시간대)
      const currentHourString = String(hour).padStart(2, "0") + "00";

      // 각 항목을 순회하며 시간별로 데이터 모으기
      forecastItems.forEach((item: any) => {
        const dateTime = `${item.fcstDate}-${item.fcstTime}`;

        // 현재 날짜 기준으로 미래 날짜이거나,
        // 같은 날짜라면 현재 시간 이후의 예보만 처리
        const isCurrentDate = item.fcstDate === formattedDate;
        const isFutureTime = isCurrentDate
          ? item.fcstTime >= currentHourString
          : true;

        if (!forecastMap.has(dateTime)) {
          forecastMap.set(dateTime, {
            date: item.fcstDate,
            time: item.fcstTime,
            sky: "",
            pty: "",
            tmp: 0,
            pop: 0,
            pcp: "",
            reh: 0,
            wsd: 0,
          });
        }

        const forecast = forecastMap.get(dateTime)!;

        // 각 카테고리별 데이터 매핑
        switch (item.category) {
          case "SKY": // 하늘상태
            forecast.sky = getSkyCondition(Number(item.fcstValue));
            break;
          case "PTY": // 강수형태
            forecast.pty = getPrecipitationType(Number(item.fcstValue));
            break;
          case "TMP": // 1시간 기온
            forecast.tmp = Number(item.fcstValue);
            break;
          case "POP": // 강수확률
            forecast.pop = Number(item.fcstValue);
            break;
          case "PCP": // 1시간 강수량
            forecast.pcp = item.fcstValue;
            break;
          case "REH": // 습도
            forecast.reh = Number(item.fcstValue);
            break;
          case "WSD": // 풍속
            forecast.wsd = Number(item.fcstValue);
            break;
        }
      });

      // Map을 배열로 변환
      const forecastArray = Array.from(forecastMap.values());

      // 시간순 정렬 후 반환
      return forecastArray.sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      });
    }

    return [];
  } catch (error) {
    console.error("날씨 데이터 가져오기 실패:", error);
    // 오류 시 빈 배열 반환
    return [];
  }
}

// 하늘상태 코드 변환 함수
function getSkyCondition(code: number): string {
  // 새로운 기상청 코드 체계에 맞춤
  switch (code) {
    case 1:
      return "맑음";
    case 2:
      return "구름조금";
    case 3:
      return "구름많음";
    case 4:
      return "흐림";
    default:
      return "알 수 없음";
  }
}

// 강수형태 코드 변환 함수
function getPrecipitationType(code: number): string {
  switch (code) {
    case 0:
      return "없음";
    case 1:
      return "비";
    case 2:
      return "비/눈";
    case 3:
      return "눈";
    case 4:
      return "소나기";
    default:
      return "알 수 없음";
  }
}

/**
 * 지역 특성과 키워드에 따른 최적 여행 시기 판단 함수
 */
export function getBestTravelSeason(
  addressOrTitle: string,
  overview: string
): SeasonalInfo {
  // 주요 키워드 기반 분석 - 우선순위를 위해 명확한 키워드 목록 사용
  const isBeach =
    overview.includes("해변") ||
    overview.includes("바다") ||
    overview.includes("해수욕장") ||
    addressOrTitle.includes("해변") ||
    addressOrTitle.includes("바다");

  const isMountain =
    addressOrTitle.includes("산") ||
    addressOrTitle.includes("국립공원") ||
    addressOrTitle.includes("봉") ||
    addressOrTitle.includes("계곡") ||
    overview.includes("산") ||
    overview.includes("등산") ||
    overview.includes("산맥") ||
    overview.includes("봉우리") ||
    overview.includes("계곡") ||
    overview.includes("트레킹");

  // 스키장 검색 시 더 명확한 키워드 사용
  const isSkiResort =
    addressOrTitle.toLowerCase().includes("스키") ||
    addressOrTitle.toLowerCase().includes("스노우") ||
    addressOrTitle.toLowerCase().includes("snow") ||
    addressOrTitle.toLowerCase().includes("ski") ||
    overview.toLowerCase().includes("스키장") ||
    overview.toLowerCase().includes("스키 리조트") ||
    overview.toLowerCase().includes("스키타기") ||
    overview.toLowerCase().includes("스노보드");

  const isFlower =
    overview.includes("꽃") ||
    overview.includes("벚꽃") ||
    overview.includes("진달래") ||
    overview.includes("철쭉") ||
    addressOrTitle.includes("꽃");

  const isLeaf =
    overview.includes("단풍") ||
    overview.includes("가을") ||
    overview.includes("낙엽") ||
    addressOrTitle.includes("단풍");

  const isIsland =
    overview.includes("섬") ||
    addressOrTitle.includes("도") ||
    addressOrTitle.includes("섬");

  const isJeju = addressOrTitle.includes("제주");

  let result: SeasonalInfo;

  // 지역별 최적 여행 시기 결정 - 우선순위 조정
  // 명확한 자연 환경부터 체크
  if (isJeju) {
    // 제주는 봄과 가을이 가장 좋음
    result = {
      bestSeason: "봄/가을",
      months: "4-5월, 9-10월",
      conditions: "한라산과 해안가 모두 즐기기 좋은 날씨",
      preparation: "바람막이, 자외선 차단제, 편한 신발",
    };
  } else if (isSkiResort) {
    result = {
      bestSeason: "겨울",
      months: "12-2월",
      conditions: "스키/스노보드 최적 설질 기간",
      preparation: "방한복, 장갑, 스키/보드 장비 준비",
    };
  } else if (isBeach) {
    result = {
      bestSeason: "여름",
      months: "7-8월",
      conditions: "해수욕 및 수영 최적 기간",
      preparation: "수영복, 자외선 차단제, 비치타월 준비",
    };
  } else if (isMountain) {
    // 산은 봄/가을이 좋음
    result = {
      bestSeason: "봄/가을",
      months: "4-5월, 9-10월",
      conditions: "쾌적한 기온과 맑은 날씨로 등산하기 좋은 시기",
      preparation: "등산화, 편한 옷, 물, 등산 스틱",
    };
  } else if (isFlower) {
    result = {
      bestSeason: "봄",
      months: "3-5월",
      conditions: "꽃과 신록이 아름다운 시기",
      preparation: "가벼운 아우터, 편한 신발, 알러지약(필요시)",
    };
  } else if (isLeaf) {
    result = {
      bestSeason: "가을",
      months: "10-11월",
      conditions: "단풍과 선선한 날씨가 좋은 시기",
      preparation: "편한 신발, 가벼운 겉옷, 카메라",
    };
  } else if (isIsland) {
    // 섬은 여름이 접근성 좋음
    result = {
      bestSeason: "여름",
      months: "6-9월",
      conditions: "파도가 잔잔하고 접근성이 좋은 시기",
      preparation: "여벌옷, 멀미약, 자외선 차단제",
    };
  } else {
    // 기본은 봄/가을 추천
    result = {
      bestSeason: "봄/가을",
      months: "4-5월, 9-10월",
      conditions: "쾌적한 기온과 맑은 날씨",
      preparation: "편안한 신발, 가벼운 겉옷, 카메라",
    };
  }

  return result;
}

/**
 * 기상 예보 기반 여행 적합도 평가 (향후 구현)
 * - 오늘부터 1주일 간의 예보를 기반으로 여행 적합도 평가
 * - 강수확률, 기온, 풍속 등 고려
 */
export async function getTravelSuitabilityForecasting(
  regionName: string
): Promise<{ date: string; score: number }[]> {
  // 향후 구현...
  return [];
}

/**
 * 계절별 추천 지역 반환
 * (특정 계절에 가장 추천되는 지역 목록)
 */
export function getRecommendedRegionsBySeason(season: string): string[] {
  switch (season) {
    case "봄":
      return ["경주", "서울", "진해", "제주", "담양"];
    case "여름":
      return ["부산", "강릉", "동해", "제주", "속초"];
    case "가을":
      return ["설악산", "내장산", "부산", "서울", "담양"];
    case "겨울":
      return ["평창", "강원도", "전주", "서울", "부산"];
    default:
      return ["서울", "부산", "제주", "강원도", "전주"];
  }
}
