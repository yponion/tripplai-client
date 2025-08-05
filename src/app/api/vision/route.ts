import { NextRequest, NextResponse } from 'next/server';

// 지역 인식을 위한 패턴 정의 (더 포괄적으로 개선)
const LOCATION_PATTERNS = {
  // 주요 도시 및 역명 포함
  CITIES: /(서울|부산|대구|인천|광주|대전|울산|세종|고양|수원|안양|성남|용인|부천|안산|화성|파주|김포|천안|아산|천안아산|평택|김천|대전|익산|전주|광주|목포|부산|울산|포항|경주|안동|춘천|강릉|원주|청주|충주|제천|군산|순천|여수|창원|마산|진주|통영|사천|밀양|거제|양산)/i,
  
  // 구/동 및 주요 지역
  DISTRICTS: /(강남구|서초구|종로구|마포구|송파구|용산구|용산|영등포구|강서구|관악구|구로구|금천구|노원구|도봉구|동대문구|동작구|서대문구|성동구|성북구|양천구|은평구|중구|중랑구|일산동구|일산서구|분당구|덕양구|수지구|기흥구|처인구|팔달구|영통구|권선구|장안구)/i,
  
  // 도/광역시 (간단한 형태도 포함)
  PROVINCES: /(경기도|경기|강원도|강원|충청북도|충북|충청남도|충남|전라북도|전북|전라남도|전남|경상북도|경북|경상남도|경남|제주도|제주)/i,
  
  // 세부 지역 및 관광지
  DETAIL_AREAS: /(일산|분당|판교|동탄|송도|정자동|대화동|백석동|덕이동|청계동|명동|홍대|강남|역삼|선릉|삼성|잠실|가산|구로|영등포|여의도|마포|상암|성수|건대|왕십리|청량리|동대문|이태원|압구정|청담|논현|신사|한남|반포|서초|양재|사당|신림|노원|수유|창동|도봉|상계|중계|하계)/i
};

// 파일을 base64로 변환 (서버사이드용)
async function fileToBase64(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return base64;
  } catch (error) {
    console.error('Base64 변환 오류:', error);
    throw new Error('파일을 Base64로 변환하는데 실패했습니다.');
  }
}

async function callGoogleVisionAPI(base64Image: string) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API 키가 설정되지 않았습니다.');
    }

    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 10
            }
          ],
          imageContext: {
            languageHints: ['ko']
          }
        }
      ]
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vision API 에러 응답:', errorData);
      throw new Error(`Vision API error: ${response.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Google Vision API 호출 오류:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Vision API 호출됨');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // FormData에서 파일 추출
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('FormData 파싱 오류:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'FormData를 파싱할 수 없습니다.' 
        },
        { status: 400 }
      );
    }
    
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      console.error('이미지 파일이 없습니다');
      return NextResponse.json(
        { 
          success: false,
          error: '이미지 파일이 없습니다.' 
        },
        { status: 400 }
      );
    }

    console.log('이미지 파일:', imageFile.name, imageFile.type, imageFile.size);

    // 파일 타입 검증
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { 
          success: false,
          error: '이미지 파일만 업로드 가능합니다.' 
        },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (4MB 제한)
    if (imageFile.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false,
          error: '이미지 크기가 너무 큽니다. 4MB 이하의 이미지를 사용해주세요.' 
        },
        { status: 400 }
      );
    }

    // 파일을 base64로 변환
    const base64Image = await fileToBase64(imageFile);
    console.log('Base64 변환 완료, 길이:', base64Image.length);

    // Google Vision API 호출
    const visionResponse = await callGoogleVisionAPI(base64Image);
    console.log('Vision API 응답:', visionResponse);
    
    if (!visionResponse.responses || !visionResponse.responses[0]) {
      return NextResponse.json(
        { 
          success: false,
          error: '이미지 분석에 실패했습니다.' 
        },
        { status: 500 }
      );
    }

    const textAnnotations = visionResponse.responses[0].textAnnotations;
    if (!textAnnotations || textAnnotations.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: '이미지에서 텍스트를 찾을 수 없습니다.' 
        },
        { status: 400 }
      );
    }

    // 전체 텍스트 추출
    const extractedText = textAnnotations[0].description;
    console.log('추출된 텍스트:', extractedText);

    // 지역 정보 추출
    const locationInfo = extractLocationInfo(extractedText);
    console.log('추출된 지역 정보:', locationInfo);

    // 핵심 정보만 정리해서 반환
    const cleanedText = cleanExtractedText(extractedText);
    
    // 주요 지역 정보 통합
    const mainLocation = getMainLocation(locationInfo);

    return NextResponse.json({
      success: true,
      extractedText: cleanedText, // 정리된 텍스트
      text: cleanedText, // 하위 호환성을 위해 두 필드 모두 제공
      locationInfo,
      mainLocation,
      locationOptions: [],
      allLocations: locationInfo
    });
  } catch (error) {
    console.error('Vision API 처리 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '이미지 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 텍스트 정리 함수 (불필요한 내용 제거)
function cleanExtractedText(text: string): string {
  // 줄바꿈으로 분리
  const lines = text.split('\n').filter(line => line.trim());
  
  // 중요한 정보만 필터링 (짧고 의미있는 줄들)
  const importantLines = lines.filter(line => {
    const trimmed = line.trim();
    // 너무 짧거나 긴 줄 제외
    if (trimmed.length < 2 || trimmed.length > 50) return false;
    // 특수문자나 숫자만 있는 줄 제외
    if (/^[\d\s\-\.\/\(\)\+\*]+$/.test(trimmed)) return false;
    return true;
  });
  
  // 상위 10개 줄만 반환 (너무 많은 정보 방지)
  return importantLines.slice(0, 10).join('\n');
}

// 주요 지역 정보 추출 함수
function getMainLocation(locationInfo: any): string {
  // 우선순위: 도시 > 구/동 > 도/광역시 > 세부지역
  if (locationInfo.cities && locationInfo.cities.length > 0) {
    return locationInfo.cities[0];
  }
  if (locationInfo.districts && locationInfo.districts.length > 0) {
    return locationInfo.districts[0];
  }
  if (locationInfo.provinces && locationInfo.provinces.length > 0) {
    return locationInfo.provinces[0];
  }
  if (locationInfo.detailAreas && locationInfo.detailAreas.length > 0) {
    return locationInfo.detailAreas[0];
  }
  return '';
}

// 텍스트에서 지역 정보 추출 함수
function extractLocationInfo(text: string) {
  const locations: { [key: string]: string[] } = {
    cities: [],
    districts: [],
    provinces: [],
    detailAreas: [],
  };
  
  // 도/광역시 검색
  const provinceMatches = text.match(new RegExp(LOCATION_PATTERNS.PROVINCES, 'g'));
  if (provinceMatches) {
    locations.provinces = [...new Set(provinceMatches)]; // 중복 제거
  }
  
  // 시/군 검색
  const cityMatches = text.match(new RegExp(LOCATION_PATTERNS.CITIES, 'g'));
  if (cityMatches) {
    locations.cities = [...new Set(cityMatches)]; // 중복 제거
  }
  
  // 구/동 검색
  const districtMatches = text.match(new RegExp(LOCATION_PATTERNS.DISTRICTS, 'g'));
  if (districtMatches) {
    locations.districts = [...new Set(districtMatches)]; // 중복 제거
  }
  
  // 상세 지역 검색
  const areaMatches = text.match(new RegExp(LOCATION_PATTERNS.DETAIL_AREAS, 'g'));
  if (areaMatches) {
    locations.detailAreas = [...new Set(areaMatches)]; // 중복 제거
  }
  
  return locations;
} 