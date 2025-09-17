"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaStar,
  FaUpload,
  FaCheck,
  FaSpinner,
  FaImage,
  FaTrash,
} from "react-icons/fa";
import useThemeMode from "@/hooks/useDarkMode";
import { CreateReviewFormData } from "@/types/review";

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    reviewData: CreateReviewFormData,
    proofImage?: File | null,
    reviewImages?: File[]
  ) => void;
  requireProofImage?: boolean;
}

interface ExtractedTravelInfo {
  location?: string;
  parentLocation?: string;
  storeName?: string;
  date?: string;
}

// 지역 정보 매핑
const LOCATION_MAPPING = {
  // 서울 지역
  강남구: "서울",
  서초구: "서울",
  종로구: "서울",
  마포구: "서울",
  송파구: "서울",
  용산구: "서울",
  영등포구: "서울",
  // 경기도 지역
  일산동구: "경기도",
  일산서구: "경기도",
  분당구: "경기도",
  덕양구: "경기도",
  일산: "경기도",
  분당: "경기도",
  판교: "경기도",
  동탄: "경기도",
  // 제주도
  제주: "제주도",
  서귀포: "제주도",
  // 기타 도시
  부산: "부산",
  대구: "대구",
  인천: "인천",
  광주: "광주",
  대전: "대전",
  울산: "울산",
  세종: "세종",
} as const;

// 지역 표시 포맷팅 함수
const formatLocation = (location: string, parentLocation?: string) => {
  // 지역과 상위지역이 같은 경우 (예: location='제주', parentLocation='제주도')
  if (location && parentLocation && parentLocation.includes(location)) {
    return parentLocation;
  }
  // 그 외의 경우 "상위지역 하위지역" 형식으로 표시
  return location && parentLocation
    ? `${parentLocation} ${location}`
    : location || parentLocation || "";
};

export default function CreateReviewModal({
  isOpen,
  onClose,
  onSubmit,
  requireProofImage = false,
}: CreateReviewModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const { themeMode } = useThemeMode();

  // 증명 이미지 업로드 관련 상태
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const proofImageInputRef = useRef<HTMLInputElement>(null);

  // 리뷰 이미지 업로드 관련 상태
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState<string[]>([]);
  const reviewImagesInputRef = useRef<HTMLInputElement>(null);

  // 모달 트랩 포커스 효과를 위한 ref
  const modalRef = useRef<HTMLDivElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedTravelInfo>({});
  const [scanPosition, setScanPosition] = useState(0);

  useEffect(() => {
    // ESC 키로 모달 닫기
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // 모달 열릴 때 포커스 설정
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // 스캔 애니메이션 효과
  useEffect(() => {
    if (isScanning) {
      let position = 0;
      const scanInterval = setInterval(() => {
        position += 2;
        setScanPosition(position);
        if (position > 100) {
          position = 0;
          setScanPosition(0);
        }
      }, 50);

      return () => clearInterval(scanInterval);
    }
  }, [isScanning]);

  if (!isOpen) return null;

  // 여행 관련 정보 추출 함수 (개선된 지역 인식)
  const extractTravelInfo = (text: string): ExtractedTravelInfo => {
    const info: ExtractedTravelInfo = {};

    // 텍스트 정규화 (공백 정리, 특수문자 통일)
    const normalizedText = text.replace(/\s+/g, " ").trim();

    // 1. 한국 도시/지역 전체 매핑 (더 상세한 지역 인식)
    const locationMappings: { [key: string]: string } = {
      // 서울 및 수도권
      강남: "서울",
      강남구: "서울",
      서초: "서울",
      서초구: "서울",
      종로: "서울",
      종로구: "서울",
      용산: "서울",
      용산구: "서울",
      마포: "서울",
      마포구: "서울",
      영등포: "서울",
      영등포구: "서울",
      송파: "서울",
      송파구: "서울",
      강동: "서울",
      관악: "서울",
      동작: "서울",
      성북: "서울",
      노원: "서울",
      도봉: "서울",
      강북: "서울",
      은평: "서울",
      서대문: "서울",
      양천: "서울",
      구로: "서울",
      금천: "서울",
      동대문: "서울",
      중랑: "서울",
      성동: "서울",
      광진: "서울",
      서울역: "서울",
      명동: "서울",
      홍대: "서울",
      신촌: "서울",
      이태원: "서울",
      삼성: "서울",
      잠실: "서울",
      여의도: "서울",

      // 인천
      인천공항: "인천",
      인천국제공항: "인천",
      연수: "인천",
      연수구: "인천",
      남동: "인천",
      남동구: "인천",
      부평: "인천",
      부평구: "인천",
      계양: "인천",
      계양구: "인천",
      서구: "인천",
      미추홀: "인천",
      동구: "인천",
      중구: "인천",
      강화: "인천",
      옹진: "인천",

      // 경기도
      수원: "경기도",
      수원시: "경기도",
      용인: "경기도",
      용인시: "경기도",
      성남: "경기도",
      성남시: "경기도",
      안양: "경기도",
      안양시: "경기도",
      부천: "경기도",
      부천시: "경기도",
      안산: "경기도",
      안산시: "경기도",
      고양: "경기도",
      고양시: "경기도",
      일산: "경기도",
      파주: "경기도",
      의정부: "경기도",
      김포: "경기도",
      광명: "경기도",
      시흥: "경기도",
      군포: "경기도",
      하남: "경기도",
      오산: "경기도",
      이천: "경기도",
      안성: "경기도",
      화성: "경기도",
      평택: "경기도",
      과천: "경기도",
      구리: "경기도",
      남양주: "경기도",
      포천: "경기도",
      양주: "경기도",
      여주: "경기도",
      동두천: "경기도",
      가평: "경기도",
      양평: "경기도",
      분당: "경기도",
      판교: "경기도",
      동탄: "경기도",
      광교: "경기도",

      // 부산
      해운대: "부산",
      해운대구: "부산",
      영도: "부산",
      영도구: "부산",
      부산진: "부산",
      부산진구: "부산",
      동래: "부산",
      동래구: "부산",
      사하: "부산",
      사하구: "부산",
      금정: "부산",
      금정구: "부산",
      연제: "부산",
      연제구: "부산",
      수영: "부산",
      수영구: "부산",
      사상: "부산",
      사상구: "부산",
      광안리: "부산",
      남포동: "부산",
      서면: "부산",
      부산역: "부산",
      센텀: "부산",
      센텀시티: "부산",

      // 대구
      수성: "대구",
      수성구: "대구",
      달서: "대구",
      달서구: "대구",
      달성: "대구",
      달성군: "대구",
      동성로: "대구",

      // 대전
      유성: "대전",
      유성구: "대전",
      대덕: "대전",
      대덕구: "대전",
      둔산: "대전",

      // 울산
      울주: "울산",
      울주군: "울산",

      // 광주
      광산: "광주",
      광산구: "광주",

      // 강원도
      춘천: "강원도",
      춘천시: "강원도",
      원주: "강원도",
      원주시: "강원도",
      강릉: "강원도",
      강릉시: "강원도",
      속초: "강원도",
      속초시: "강원도",
      동해: "강원도",
      동해시: "강원도",
      태백: "강원도",
      태백시: "강원도",
      삼척: "강원도",
      삼척시: "강원도",
      홍천: "강원도",
      횡성: "강원도",
      영월: "강원도",
      평창: "강원도",
      정선: "강원도",
      철원: "강원도",
      화천: "강원도",
      양구: "강원도",
      인제: "강원도",
      고성: "강원도",
      양양: "강원도",

      // 충청북도
      청주: "충청북도",
      청주시: "충청북도",
      충주: "충청북도",
      충주시: "충청북도",
      제천: "충청북도",
      제천시: "충청북도",
      보은: "충청북도",
      옥천: "충청북도",
      영동: "충청북도",
      증평: "충청북도",
      진천: "충청북도",
      괴산: "충청북도",
      음성: "충청북도",
      단양: "충청북도",

      // 충청남도
      천안: "충청남도",
      천안시: "충청남도",
      아산: "충청남도",
      아산시: "충청남도",
      천안아산: "충청남도",
      공주: "충청남도",
      공주시: "충청남도",
      보령: "충청남도",
      보령시: "충청남도",
      서산: "충청남도",
      서산시: "충청남도",
      논산: "충청남도",
      논산시: "충청남도",
      계룡: "충청남도",
      계룡시: "충청남도",
      당진: "충청남도",
      당진시: "충청남도",
      금산: "충청남도",
      부여: "충청남도",
      서천: "충청남도",
      청양: "충청남도",
      홍성: "충청남도",
      예산: "충청남도",
      태안: "충청남도",

      // 전라북도
      전주: "전라북도",
      전주시: "전라북도",
      군산: "전라북도",
      군산시: "전라북도",
      익산: "전라북도",
      익산시: "전라북도",
      정읍: "전라북도",
      정읍시: "전라북도",
      남원: "전라북도",
      남원시: "전라북도",
      김제: "전라북도",
      김제시: "전라북도",
      완주: "전라북도",
      진안: "전라북도",
      무주: "전라북도",
      장수: "전라북도",
      임실: "전라북도",
      순창: "전라북도",
      고창: "전라북도",
      부안: "전라북도",

      // 전라남도
      목포: "전라남도",
      목포시: "전라남도",
      여수: "전라남도",
      여수시: "전라남도",
      순천: "전라남도",
      순천시: "전라남도",
      나주: "전라남도",
      나주시: "전라남도",
      광양: "전라남도",
      광양시: "전라남도",
      담양: "전라남도",
      곡성: "전라남도",
      구례: "전라남도",
      고흥: "전라남도",
      보성: "전라남도",
      화순: "전라남도",
      장흥: "전라남도",
      강진: "전라남도",
      해남: "전라남도",
      영암: "전라남도",
      무안: "전라남도",
      함평: "전라남도",
      영광: "전라남도",
      장성: "전라남도",
      완도: "전라남도",
      진도: "전라남도",
      신안: "전라남도",

      // 경상북도
      포항: "경상북도",
      포항시: "경상북도",
      경주: "경상북도",
      경주시: "경상북도",
      김천: "경상북도",
      김천시: "경상북도",
      안동: "경상북도",
      안동시: "경상북도",
      구미: "경상북도",
      구미시: "경상북도",
      영주: "경상북도",
      영주시: "경상북도",
      영천: "경상북도",
      영천시: "경상북도",
      상주: "경상북도",
      상주시: "경상북도",
      문경: "경상북도",
      문경시: "경상북도",
      경산: "경상북도",
      경산시: "경상북도",
      군위: "경상북도",
      의성: "경상북도",
      청송: "경상북도",
      영양: "경상북도",
      영덕: "경상북도",
      청도: "경상북도",
      고령: "경상북도",
      성주: "경상북도",
      칠곡: "경상북도",
      예천: "경상북도",
      봉화: "경상북도",
      울진: "경상북도",
      울릉: "경상북도",

      // 경상남도
      창원: "경상남도",
      창원시: "경상남도",
      진주: "경상남도",
      진주시: "경상남도",
      통영: "경상남도",
      통영시: "경상남도",
      사천: "경상남도",
      사천시: "경상남도",
      김해: "경상남도",
      김해시: "경상남도",
      밀양: "경상남도",
      밀양시: "경상남도",
      거제: "경상남도",
      거제시: "경상남도",
      양산: "경상남도",
      양산시: "경상남도",
      의령: "경상남도",
      함안: "경상남도",
      창녕: "경상남도",
      남해: "경상남도",
      하동: "경상남도",
      산청: "경상남도",
      함양: "경상남도",
      거창: "경상남도",
      합천: "경상남도",

      // 제주도
      제주: "제주도",
      제주시: "제주도",
      서귀포: "제주도",
      서귀포시: "제주도",
      한라산: "제주도",
      성산: "제주도",
      우도: "제주도",
      마라도: "제주도",
      중문: "제주도",
      애월: "제주도",
      한림: "제주도",
      조천: "제주도",
      구좌: "제주도",
      성산읍: "제주도",
      표선: "제주도",
      안덕: "제주도",
      대정: "제주도",
      한경: "제주도",

      // 세종
      세종: "세종시",
      세종시: "세종시",
    };

    // 2. 주요 관광지/랜드마크 매핑
    const landmarkMappings: { [key: string]: string } = {
      // 서울 랜드마크
      남산타워: "서울",
      N서울타워: "서울",
      경복궁: "서울",
      창덕궁: "서울",
      덕수궁: "서울",
      창경궁: "서울",
      경희궁: "서울",
      북촌한옥마을: "서울",
      인사동: "서울",
      동대문: "서울",
      남대문: "서울",
      광화문: "서울",
      청계천: "서울",
      한강: "서울",
      롯데타워: "서울",
      코엑스: "서울",
      동대문디자인플라자: "서울",
      DDP: "서울",
      서울숲: "서울",
      남산: "서울",

      // 부산 랜드마크
      해운대해수욕장: "부산",
      광안대교: "부산",
      태종대: "부산",
      감천문화마을: "부산",
      자갈치시장: "부산",
      국제시장: "부산",
      용두산공원: "부산",
      부산타워: "부산",
      해동용궁사: "부산",
      범어사: "부산",
      송정해수욕장: "부산",
      다대포: "부산",

      // 제주 랜드마크
      한라산: "제주도",
      성산일출봉: "제주도",
      만장굴: "제주도",
      천지연폭포: "제주도",
      정방폭포: "제주도",
      천제연폭포: "제주도",
      주상절리: "제주도",
      섭지코지: "제주도",
      우도: "제주도",
      마라도: "제주도",
      협재해수욕장: "제주도",
      함덕해수욕장: "제주도",

      // 경주 랜드마크
      불국사: "경상북도",
      석굴암: "경상북도",
      첨성대: "경상북도",
      안압지: "경상북도",
      동궁과월지: "경상북도",
      대릉원: "경상북도",
      천마총: "경상북도",
      경주월드: "경상북도",

      // 강원도 랜드마크
      설악산: "강원도",
      오대산: "강원도",
      경포대: "강원도",
      정동진: "강원도",
      낙산사: "강원도",
      속초해수욕장: "강원도",
      남이섬: "강원도",
      대관령: "강원도",
    };

    // 3. 교통 관련 키워드로 지역 추출
    const transportPatterns = [
      // KTX/기차역
      /([가-힣]+)역?\s*(?:KTX|기차|열차|역)/gi,
      /KTX\s*([가-힣]+)/gi,
      // 공항
      /([가-힣]+)\s*(?:국제)?공항/gi,
      /([가-힣]+)\s*(?:에서|부터|출발)/gi,
      /(?:도착|도착지|목적지)\s*:\s*([가-힣]+)/gi,
      // 버스터미널
      /([가-힣]+)\s*(?:버스)?터미널/gi,
      /([가-힣]+)\s*(?:고속|시외)?버스/gi,
    ];

    // 4. 상호명에서 지역 정보 추출
    const businessPatterns = [
      /([가-힣]+)\s*(?:점|지점|매장|센터|몰|백화점|아울렛)/gi,
      /(?:호텔|모텔|펜션|리조트|게스트하우스|민박|텔)\s*([가-힣]+)/gi,
      /([가-힣]+)\s*(?:맛집|식당|카페|베이커리|빵집|커피|치킨|피자)/gi,
      /([가-힣A-Za-z]+(?:마트|백화점|아울렛|면세점|편의점|스토어))/gi,
    ];

    // 5. 지역 추출 시작
    let foundLocation = "";
    let foundParentLocation = "";

    // 5-1. 직접적인 지역명 매칭
    for (const [key, value] of Object.entries(locationMappings)) {
      const regex = new RegExp(`\\b${key}\\b`, "gi");
      if (regex.test(normalizedText)) {
        foundLocation = key;
        foundParentLocation = value;
        break;
      }
    }

    // 5-2. 랜드마크로 지역 추출
    if (!foundLocation) {
      for (const [landmark, region] of Object.entries(landmarkMappings)) {
        if (normalizedText.includes(landmark)) {
          foundLocation = landmark;
          foundParentLocation = region;
          break;
        }
      }
    }

    // 5-3. 교통 패턴으로 지역 추출
    if (!foundLocation) {
      for (const pattern of transportPatterns) {
        const matches = normalizedText.match(pattern);
        if (matches && matches[1]) {
          const place = matches[1].trim();
          if (locationMappings[place]) {
            foundLocation = place;
            foundParentLocation = locationMappings[place];
            break;
          }
        }
      }
    }

    // 5-4. 상호명 패턴으로 지역 추출
    if (!foundLocation) {
      for (const pattern of businessPatterns) {
        const matches = normalizedText.match(pattern);
        if (matches && matches[1]) {
          const place = matches[1].trim();
          if (locationMappings[place]) {
            foundLocation = place;
            foundParentLocation = locationMappings[place];
            break;
          }
        }
      }
    }

    // 6. 결과 설정
    if (foundLocation) {
      info.location = foundLocation;
      info.parentLocation = foundParentLocation;
    }

    // 7. 날짜 추출 (더 정확한 패턴)
    const datePatterns = [
      /(\d{4})[-/.년]\s*(\d{1,2})[-/.월]\s*(\d{1,2})(?:일)?/g,
      /(\d{2})[-/.년]\s*(\d{1,2})[-/.월]\s*(\d{1,2})(?:일)?/g,
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g,
    ];

    for (const pattern of datePatterns) {
      const dateMatch = normalizedText.match(pattern);
      if (dateMatch) {
        info.date = dateMatch[0];
        break;
      }
    }

    // 8. 상호명 추출 (개선된 패턴)
    const storeNamePatterns = [
      // 항공사
      /(제주항공|대한항공|아시아나|에어부산|티웨이|진에어|이스타|에어서울|에어프레미아)/gi,
      // 교통
      /(코레일|KORAIL|SRT|KTX|무궁화|새마을)/gi,
      // 숙박
      /([가-힣]+(?:호텔|모텔|펜션|리조트|게스트하우스|민박|텔))/gi,
      // 음식점
      /([가-힣]+(?:식당|레스토랑|카페|베이커리|빵집|커피|치킨|피자))/gi,
      // 기타
      /([가-힣A-Za-z]+(?:마트|백화점|아울렛|면세점|편의점|스토어))/gi,
    ];

    if (!info.storeName) {
      for (const pattern of storeNamePatterns) {
        const storeMatch = normalizedText.match(pattern);
        if (storeMatch) {
          info.storeName = storeMatch[0];
          break;
        }
      }
    }

    return info;
  };

  // 이미지에서 텍스트 추출 함수
  const extractTextFromImage = async (file: File) => {
    setIsProcessing(true);
    try {
      // FormData 방식으로 변경
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/vision", {
        method: "POST",
        body: formData, // JSON 대신 FormData 사용
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("모달 - Vision API 오류 응답:", errorData);
        throw new Error(`영수증 분석 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.extractedText) {
        const info = extractTravelInfo(data.extractedText);
        setExtractedInfo(info);

        // Vision API에서 제공하는 mainLocation을 우선 사용
        let locationToSet = "";

        if (data.mainLocation) {
          // Vision API가 이미 추출한 주요 지역 사용
          locationToSet = data.mainLocation;
        } else if (info.parentLocation || info.location) {
          // 대체 방법: extractTravelInfo 결과 사용
          locationToSet = info.parentLocation || info.location || "";
        }

        // locationInfo를 extractedInfo에 추가
        if (data.locationInfo) {
          const locationInfo = data.locationInfo;
          // 도시 정보가 있으면 사용
          if (locationInfo.cities && locationInfo.cities.length > 0) {
            const city = locationInfo.cities[0];
            // locationMappings에서 상위 지역 찾기
            const parentLocation =
              LOCATION_MAPPING[city as keyof typeof LOCATION_MAPPING] || city;
            setExtractedInfo({
              ...info,
              location: city,
              parentLocation: parentLocation,
            });
            // 지역 설정 업데이트
            if (!locationToSet && city) {
              locationToSet = parentLocation || city;
            }
          }
        }

        if (locationToSet) {
          setLocation(locationToSet);
        }

        alert(`✅ 영수증 분석 완료!

📝 추출된 정보:
• 지역: ${
          locationToSet ||
          info.parentLocation ||
          info.location ||
          "자동 추출 실패"
        }
• 상호명: ${info.storeName || "없음"}
• 날짜: ${info.date || "없음"}

${
  !locationToSet
    ? "지역 정보를 수동으로 입력해주세요."
    : "정보를 확인하고 필요시 수정해주세요."
}`);
      } else {
        console.warn(
          "모달 - Vision API 응답에 success나 extractedText가 없음:",
          data
        );
        // Vision API 실패해도 계속 진행 가능하도록 수정
        alert(`⚠️ 영수증 분석에 실패했습니다.

수동으로 여행지 정보를 입력해주세요.
증명 이미지는 업로드되었으니 리뷰 작성을 계속 진행할 수 있습니다.`);
        // 빈 extractedInfo 설정
        setExtractedInfo({});
      }
    } catch (error) {
      console.error("모달 - 영수증 분석 상세 오류:", error);

      let errorMessage = "영수증 분석 중 오류가 발생했습니다.";

      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "Google API 키가 유효하지 않습니다.";
        } else if (error.message.includes("403")) {
          errorMessage = "Google Vision API 접근 권한이 없습니다.";
        } else if (error.message.includes("429")) {
          errorMessage =
            "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = error.message;
        }
      }

      // Vision API 실패해도 리뷰 작성은 계속 진행 가능
      alert(`⚠️ ${errorMessage}

하지만 걱정하지 마세요! 
증명 이미지는 정상적으로 업로드되었으니, 수동으로 여행지 정보를 입력하고 리뷰 작성을 계속 진행하실 수 있습니다.`);

      // 빈 extractedInfo 설정 (오류 상황에서도)
      setExtractedInfo({});
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProofFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // 파일 검증 (2MB 제한 - Vercel 배포 환경 고려)
      if (file.size > 2 * 1024 * 1024) {
        alert(
          `파일 크기가 너무 큽니다. (${Math.round(
            file.size / 1024 / 1024
          )}MB > 2MB)\n배포 환경에서는 2MB 이하의 이미지를 선택해주세요.`
        );
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
      }

      const supportedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!supportedTypes.includes(file.type)) {
        alert("지원하지 않는 이미지 형식입니다.\n지원 형식: JPG, PNG, WEBP");
        return;
      }

      setProofImage(file);

      // 스캔 애니메이션 시작
      setIsScanning(true);
      setScanComplete(false);

      // 초기화
      setExtractedInfo({});

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = async () => {
        // 스캔 애니메이션 표시를 위해 더 긴 지연 추가
        setTimeout(async () => {
          setImagePreview(reader.result as string);

          // 텍스트 추출 시작 전에 스캔 애니메이션을 더 오래 보여줌
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await extractTextFromImage(file);

          // 스캔 완료 애니메이션
          setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
          }, 1000);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReviewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      // 파일 검증
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      newFiles.forEach((file) => {
        // 파일 크기 검증 (2MB 제한 - Vercel 배포 환경 고려)
        if (file.size > 2 * 1024 * 1024) {
          invalidFiles.push(
            `${file.name} (크기: ${Math.round(
              file.size / 1024 / 1024
            )}MB > 2MB)`
          );
          return;
        }

        // 파일 형식 검증
        if (!file.type.startsWith("image/")) {
          invalidFiles.push(`${file.name} (이미지 파일이 아님)`);
          return;
        }

        // 지원하는 형식 검증
        const supportedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        if (!supportedTypes.includes(file.type)) {
          invalidFiles.push(`${file.name} (지원하지 않는 형식)`);
          return;
        }

        validFiles.push(file);
      });

      // 검증 실패한 파일들 알림
      if (invalidFiles.length > 0) {
        alert(
          `다음 파일들은 업로드할 수 없습니다:\n${invalidFiles.join(
            "\n"
          )}\n\n지원 형식: JPG, PNG, WEBP (최대 2MB)`
        );
      }

      if (validFiles.length === 0) {
        return; // 유효한 파일이 없으면 중단
      }

      // 최대 3개까지만 허용 (Vercel 배포 환경 고려)
      const totalFiles = [...reviewImages, ...validFiles];
      const filesToAdd = totalFiles.slice(0, 3);

      if (totalFiles.length > 3) {
        alert(
          `배포 환경에서는 최대 3개의 이미지만 업로드할 수 있습니다. ${
            validFiles.length
          }개 중 ${3 - reviewImages.length}개만 추가됩니다.`
        );
      }

      setReviewImages(filesToAdd);

      // 이미지 미리보기 생성
      Promise.all(
        filesToAdd.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result as string);
              };
              reader.onerror = () => {
                reject(new Error(`이미지 미리보기 생성 실패: ${file.name}`));
              };
              reader.readAsDataURL(file);
            })
        )
      )
        .then((previews) => {
          setReviewImagePreviews(previews);
        })
        .catch((error) => {
          console.error("이미지 미리보기 생성 오류:", error);
          alert("일부 이미지의 미리보기 생성에 실패했습니다.");
        });
    }
  };

  const removeReviewImage = (index: number) => {
    const newImages = [...reviewImages];
    newImages.splice(index, 1);
    setReviewImages(newImages);

    const newPreviews = [...reviewImagePreviews];
    newPreviews.splice(index, 1);
    setReviewImagePreviews(newPreviews);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!title.trim()) {
      alert("리뷰 제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    if (!location.trim()) {
      const confirmWithoutLocation = confirm(
        "여행지 정보가 입력되지 않았습니다.\n\n증명 이미지에서 자동 추출에 실패한 것 같습니다.\n수동으로 여행지를 입력하시겠습니까?\n\n'취소'를 누르면 여행지 없이 리뷰를 등록합니다."
      );

      if (confirmWithoutLocation) {
        // 사용자가 수동 입력을 원하는 경우 - 포커스를 여행지 필드로 이동
        const locationInput = document.querySelector(
          'input[placeholder*="여행지"]'
        ) as HTMLInputElement;
        if (locationInput) {
          locationInput.focus();
          locationInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      // 사용자가 여행지 없이 진행하기를 원하는 경우 - 계속 진행
    }

    // 필수 이미지 체크
    if (!proofImage) {
      alert(
        "여행 증명 이미지가 필요합니다. 영수증, 항공권, 버스티켓 등을 업로드해주세요."
      );
      return;
    }

    // 리뷰 이미지 개수 확인 (선택사항이지만 알림)
    if (reviewImages.length === 0) {
      const confirmSubmit = confirm(
        "리뷰 이미지가 없습니다. 여행 사진을 추가하면 더 매력적인 리뷰가 됩니다.\n\n그래도 계속 진행하시겠습니까?"
      );
      if (!confirmSubmit) {
        return;
      }
    }

    // 추출된 정보를 포함한 리뷰 데이터 구성
    const reviewData = {
      title,
      content,
      location,
      rating,
      createdAt: new Date().toISOString(),
      // 추출된 정보 추가 (undefined 값은 옵셔널 프로퍼티로 처리)
      ...(extractedInfo.date && { startDate: extractedInfo.date }),
      ...(extractedInfo.date && { endDate: extractedInfo.date }),
      ...(extractedInfo.storeName && { storeName: extractedInfo.storeName }),
      ...(extractedInfo.location && {
        detailedLocation: extractedInfo.location,
      }),
      ...(extractedInfo.parentLocation && {
        parentLocation: extractedInfo.parentLocation,
      }),
    };

    onSubmit(reviewData, proofImage, reviewImages);

    // 폼 초기화
    setTitle("");
    setContent("");
    setLocation("");
    setRating(5);
    setProofImage(null);
    setImagePreview(null);
    setScanComplete(false);
    setExtractedInfo({});
    setReviewImages([]);
    setReviewImagePreviews([]);

    onClose();
  };

  // 테마에 따른 모달 배경 스타일
  const getModalStyle = () => {
    switch (themeMode) {
      case "dark":
        return "bg-gray-900 border border-gray-700 shadow-2xl";
      case "light":
        return "bg-white border border-gray-200 shadow-xl";
      case "original":
        return "bg-white border border-pink-100 shadow-xl";
      default:
        return "bg-white border border-gray-200 shadow-xl";
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-all overflow-y-auto">
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`${getModalStyle()} rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transition-colors duration-300 transform animate-modal-scale my-auto relative`}
      >
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            리뷰 작성하기
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-none"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {/* 증명 이미지 업로드 영역을 맨 위로 이동 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                여행 증명 이미지{" "}
                {requireProofImage && <span className="text-red-500">*</span>}
                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                  영수증, 항공권, 버스티켓 등 여행을 증명할 수 있는 이미지를
                  업로드해주세요 (검증용, 공개되지 않음)
                </span>
              </label>

              <div className="mt-3">
                {isScanning ? (
                  <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden h-64 bg-gray-50 dark:bg-gray-900">
                    {/* 이미지 컨테이너 */}
                    <div className="absolute inset-0">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="스캔 중인 이미지"
                          className="w-full h-full object-contain opacity-90"
                        />
                      )}
                    </div>

                    {/* 스캔 라인 - 직접 위치 조정 */}
                    <div
                      className="absolute inset-x-0 z-30 pointer-events-none"
                      style={{
                        top: `${scanPosition}%`,
                        height: "2px",
                        background:
                          "linear-gradient(90deg, transparent, #ec4899 50%, transparent)",
                        boxShadow: "0 0 20px 5px rgba(236, 72, 153, 0.7)",
                        filter: "blur(0.5px)",
                      }}
                    >
                      {/* 레이저 빔 효과 */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: 0,
                          height: "50px",
                          background:
                            "linear-gradient(180deg, rgba(236, 72, 153, 0.5), transparent)",
                          transform: "translateY(0)",
                        }}
                      ></div>
                    </div>

                    {/* 로딩 상태 표시 */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 px-6 py-4 rounded-xl shadow-lg">
                        <div className="flex items-center space-x-3">
                          <FaSpinner className="text-pink-500 text-2xl animate-spin" />
                          <p className="text-gray-800 dark:text-gray-200 font-medium">
                            {isProcessing
                              ? "텍스트 추출 중..."
                              : "이미지 스캔 중..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : imagePreview ? (
                  <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden h-64 group bg-white dark:bg-gray-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="증명 이미지 미리보기"
                        className="max-w-full max-h-full object-contain p-2"
                      />
                    </div>

                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setProofImage(null);
                          setImagePreview(null);
                          setScanComplete(false);
                          setExtractedInfo({});
                          setLocation(""); // 지역 정보도 초기화
                        }}
                        className="bg-red-500 text-white rounded-full p-3 transform hover:scale-110 transition-transform shadow-lg border-none"
                      >
                        <FaTimes size={18} />
                      </button>
                    </div>

                    {scanComplete && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
                        <FaCheck size={14} />
                      </div>
                    )}

                    {/* 추출된 정보 표시 (호버 시 표시) */}
                    {Object.keys(extractedInfo).length > 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-help">
                        <div className="bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 p-4 rounded-lg shadow-lg space-y-2 max-w-xs text-center">
                          <div className="text-green-600 dark:text-green-400 font-bold text-lg mb-2">
                            ✅ 분석 완료!
                          </div>
                          {(extractedInfo.location ||
                            extractedInfo.parentLocation) && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-medium">🗺️ 지역:</span>{" "}
                              {formatLocation(
                                extractedInfo.location || "",
                                extractedInfo.parentLocation
                              )}
                            </p>
                          )}
                          {extractedInfo.storeName && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-medium">🏪 상호명:</span>{" "}
                              {extractedInfo.storeName}
                            </p>
                          )}
                          {extractedInfo.date && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-medium">📅 날짜:</span>{" "}
                              {extractedInfo.date}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            호버해서 결과 확인
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => proofImageInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="bg-pink-50 dark:bg-pink-900 rounded-full p-5 mb-4 group-hover:bg-pink-100 dark:group-hover:bg-pink-800 transition-colors">
                      <FaUpload className="text-pink-500 text-3xl" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                      클릭하여 이미지 업로드
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      JPG, PNG, WEBP (최대 2MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={proofImageInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleProofFileChange}
                />
              </div>
            </div>

            {/* 나머지 폼 필드들... */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  여행지
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="방문한 여행지를 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="리뷰 제목을 입력하세요"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[150px] transition-colors"
                placeholder="여행 경험을 자세히 공유해주세요"
                required
              />
            </div>

            {/* 평점 선택 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                평점
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl focus:outline-none transition-transform hover:scale-110 ${
                      rating >= star
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                    }}
                  >
                    <FaStar />
                  </button>
                ))}
                <span className="ml-2 text-gray-600 dark:text-gray-300">
                  {rating}/5
                </span>
              </div>
            </div>

            {/* 리뷰 이미지 업로드 영역 */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                <div className="flex items-center">
                  <span>리뷰 이미지</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    (첫 번째 이미지가 썸네일로 사용됩니다, 공개됨)
                  </span>
                </div>
              </label>

              <div className="mt-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reviewImagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className={`relative border ${
                        index === 0
                          ? "border-pink-500"
                          : "border-gray-200 dark:border-gray-700"
                      } rounded-xl overflow-hidden aspect-square bg-white dark:bg-gray-900 group`}
                    >
                      <img
                        src={preview}
                        alt={`리뷰 이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-md">
                          썸네일
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeReviewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border-none"
                        aria-label="이미지 제거"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}

                  {reviewImagePreviews.length < 3 && (
                    <div
                      onClick={() => reviewImagesInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="bg-pink-50 dark:bg-pink-900 rounded-full p-3 mb-2 group-hover:bg-pink-100 dark:group-hover:bg-pink-800 transition-colors">
                        <FaImage className="text-pink-500 text-xl" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                        이미지 추가
                      </p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={reviewImagesInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleReviewImagesChange}
                  multiple
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium border-none"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-pink-500 text-white rounded-xl shadow-sm hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-none"
                disabled={!proofImage}
              >
                리뷰 작성하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Portal을 사용하여 body에 직접 렌더링
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
