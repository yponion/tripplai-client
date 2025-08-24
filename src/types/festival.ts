export interface BaseParams {
  numOfRows?: number;
  pageNo?: number;
  MobileOS: "IOS" | "AND" | "WIN" | "ETC";
  MobileApp: string;
  serviceKey: string;
  _type?: "json" | "xml";
}

export interface GetFestivalsParams extends BaseParams {
  arrange?: "A" | "C" | "D" | "O" | "Q" | "R"; // 정렬구분 (A=제목순, C=수정일순, D=생성일순) 대표이미지가반드시있는정렬(O=제목순, Q=수정일순, R=생성일순)
  eventStartDate: string; // 행사시작일(형식 :YYYYMMDD)
  eventEndDate?: string; // 행사종료일(형식 :YYYYMMDD)
  areaCode?: string; // 시군구코드(지역코드조회 참고)
  sigunguCode?: string; // 시군구코드(지역코드조회 참고)
  modifiedtime?: string; // 수정일(형식 :YYYYMMDD)
}

export interface DetailCommonParams extends BaseParams {
  contentId: string;
  contentTypeId?: string;
  defaultYN?: "Y" | "N";
  firstImageYN?: "Y" | "N";
  areacodeYN?: "Y" | "N";
  catcodeYN?: "Y" | "N";
  addrinfoYN?: "Y" | "N";
  mapinfoYN?: "Y" | "N";
  overviewYN?: "Y" | "N";
}

export interface DetailIntroParams extends BaseParams {
  contentId: string;
  contentTypeId: string;
}

export interface DetailInfoParams extends BaseParams {
  contentId: string;
  contentTypeId: string;
}

export interface DetailImageParam extends BaseParams {
  contentId: string;
  imageYN?: "Y" | "N";
  subImageYN?: "Y" | "N";
}


export interface Festival {
  addr1: string; // 주소(예, 서울중구다동)를응답
  addr2: string; // 상세주소
  areacode: string; // 지역코드
  booktour: string; // 교과서속여행지여부 (1=여행지, 0=해당없음)
  cat1: string; // 대분류코드
  cat2: string; // 중분류코드
  cat3: string; // 소분류코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 관광타입(관광지, 숙박등) ID
  createdtime: string; // 콘텐츠최초등록일
  eventstartdate: string; // 행사시작일 (형식 : YYYYMMDD)
  eventenddate: string; // 행사종료일 (형식 : YYYYMMDD)
  firstimage: string; // 원본대표이미지 (약 500*333 size) URL 응답
  firstimage2: string; // 썸네일대표이미지 (약 150*100 size) URL 응답
  cpyrhtDivCd: string; // Type1:제1유형(출처표시-권장) Type3:제3유형(제1유형 + 변경금지)
  mapx: string; // GPS X좌표(WGS84 경도좌표) 응답
  mapy: string; // GPS Y좌표(WGS84 위도좌표) 응답
  mlevel: string; // Map Level 응답
  modifiedtime: string; // 콘텐츠수정일
  sigungucode: string; // 시군구코드
  tel: string; // 전화번호
  title: string; // 콘텐츠제목
}

export interface DetailCommon {
  contentid: "string",
  contenttypeid: "string",

  // defaultYN=Y
  booktour?: "string", // 교과서속여행지여부 (1=여행지, 0=해당없음)
  createdtime?: "string", // 콘텐츠최초등록일
  homepage?: "string", // 홈페이지주소
  modifiedtime?: "string", // 콘텐츠수정일
  tel?: "string", // 전화번호
  telname?: "string", // 전화번호명
  title?: "string", // 콘텐츠(제목)

  // firstImageYN=Y
  firstimage?: "string", // 원본대표이미지 (약 500*333 size) URL 응답
  firstimage2?: "string", // 썸네일대표이미지 (약 150*100 size) URL 응답
  cpyrhtDivCd?: "string", // Type1:제1유형(출처표시-권장) Type3:제3유형(제1유형 + 변경금지)

  // areacodeYN=Y
  areacode?: "string", // 지역코드
  sigungucode?: "string", // 시군구코드

  // catcodeYN=Y
  cat1?: "string", // 대분류코드
  cat2?: "string", // 중분류코드
  cat3?: "string", // 소분류코드

  // addrinfoYN=Y  
  addr1?: "string", // 주소(예, 서울중구다동)를응답
  addr2?: "string", // 상세주소
  zipcode?: "string", // 우편번호

  // mapinfoYN=Y
  mapx?: "string", // GPS X좌표(WGS84 경도좌표) 응답
  mapy?: "string", // GPS Y좌표(WGS84 위도좌표) 응답
  mlevel?: "string", // Map Level 응답

  // overviewYN=Y
  overview?: "string", // 콘텐츠개요조회
}

export interface DetailIntro {
  contentid: "string",
  contenttypeid: "string",

  // contentTypeId=15
  agelimit: string, // 관람가능연령
  bookingplace: string, // 예약처
  discountinfofestival: string, // 할인정보
  eventenddate: string, // 행사종료일
  eventhomepage: string, //	행사홈페이지
  eventplace: string, //행사장소
  eventstartdate: string, //행사시작일
  festivalgrade: string, //	축제등급
  placeinfo: string, //	행사장위치안내
  playtime: string, //공연시간
  program: string, //	행사프로그램
  spendtimefestival: string, //	관람소요시간
  sponsor1: string, //주최자정보
  sponsor1tel: string, //	주최자연락처
  sponsor2: string, //주관사정보
  sponsor2tel: string, //	주관사연락처
  subevent: string, //부대행사
  usetimefestival: string, //	이용요금
}

export interface DetailInfo {
  contentid: "string",
  contenttypeid: "string",

  // contentTypeId=15
  fldgubun: string, // 일련번호
  infoname: string, // 제목
  infotext: string, // 내용
  serialnum: string, // 반복일련번호
}

export interface DetailImage {
  contentid: string, // 콘텐츠ID
  imgname: string, // 이미지명
  originimgurl: string, // 원본이미지 (약 500*333 size)
  serialnum: string, // 이미지일련번호
  smallimageurl: string, // 썸네일이미지 (약 160*100 size)
  cpyrhtDivCd: string // 저작권 유형 
}


export interface Response<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    }
    body: {
      items: {
        item: T;
      }
      numOfRows: number;
      pageNo: number;
      totalCount: number; // 전체결과수
    }
  }
}

export type FestivalResponse = Response<Festival[]>;
export type DetailCommonResponse = Response<DetailCommon[]>;
export type DetailIntroResponse = Response<DetailIntro[]>;
export type DetailInfoResponse = Response<DetailInfo[]>;
export type DetailImageResponse = Response<DetailImage[]>;

