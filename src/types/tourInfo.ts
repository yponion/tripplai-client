export interface BaseParams {
  numOfRows?: number;
  pageNo?: number;
  MobileOS: "IOS" | "AND" | "WIN" | "ETC";
  MobileApp: string;
  serviceKey: string;
  _type?: "json" | "xml";
}

export interface AreaBasedListParams extends BaseParams {
  arrange?: "A" | "C" | "D" | "O" | "Q" | "R"; // 정렬구분 (A=제목순, C=수정일순, D=생성일순) 대표이미지가반드시있는정렬(O=제목순, Q=수정일순, R=생성일순)
  contentTypeId?: string; // 관광타입(12:관광지, 14:문화시설, 15:축제공연행사, 25:여행코스, 28:레포츠, 32:숙박, 38:쇼핑, 39:음식점) ID
  areaCode?: string // 지역코드(지역코드조회 참고)
  sigunguCode?: string; // 시군구코드(지역코드조회 참고)
  cat1?: string; // 대분류(서비스분류코드조회 참고)
  cat2?: string; // 중분류(서비스분류코드조회 참고)
  cat3?: string; // 소분류(서비스분류코드조회 참고)
  modifiedtime?: string; // 수정일(형식 :YYYYMMDD)
  lclsSystm1?: string; // 대분류(분류체계코드조회 참고)
  lclsSystm2?: string; // 중분류(분류체계코드조회 참고)
  lclsSystm3?: string; // 소분류(분류체계코드조회 참고)
}

export interface AreaCodeParams extends BaseParams {
  areaCode?: string // 지역코드(지역코드조회 참고)
}

export interface TatalCnt {
  totalCnt: number, // 콘텐츠 개수
}

export interface AreaBasedList {
  addr1: string; // 주소
  addr2: string; // 상세주소
  areacode: string; // 지역코드
  cat1: string; // 대분류
  cat2: string; // 중분류
  cat3: string; // 소분류
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 관광타입 ID
  createdtime: string; // 등록일
  dist: string; // 거리
  firstimage: string; // 대표이미지(원본)
  firstimage2: string; // 대표이미지(썸네일)
  cpyrhtDivCd: string; // 저작권 유형
  mapx: string; // GPS X좌표
  mapy: string; // GPS Y좌표
  mlevel: string; // Map Level
  modifiedtime: string; // 수정일
  sigungucode: string; // 시군구코드
  tel: string; // 전화번호
  title: string; // 제목
  lDongRegnCd: string; // 법정동 시도 코드
  lDongSignguCd: string; // 법정동 시군구 코드
  lclsSystm1: string; // 분류체계 대분류
  lclsSystm2: string; // 분류체계 중분류
  lclsSystm3: string; // 분류체계 소분류
  zipcode: string; // 우편번호
}

export interface AreaCode {
  code: string,
  name: string,
  rnum: string,
}

export interface ClassificationSystemCodeParams extends BaseParams {
  lclsSystm1?: string; // 대분류
  lclsSystm2?: string; // 중분류
  lclsSystm3?: string; // 소분류
  lclsSystmListYn?: "Y" | "N";//	분류체계 목록조회 여부
}

export type ClassificationSystemCode = {
  lclsSystm1Cd: string;
  lclsSystm1Nm: string;
  lclsSystm2Cd: string;
  lclsSystm2Nm: string;
  lclsSystm3Cd: string;
  lclsSystm3Nm: string;
  rnum: number;
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

export type CountResponse = Response<TatalCnt[]>;
export type AreaBasedListResponse = Response<AreaBasedList[]>;
export type AreaCodeResponse = Response<AreaCode[]>;
export type ClassificationSystemCodeResponse = Response<ClassificationSystemCode[]>;