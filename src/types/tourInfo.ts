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
}

export interface AreaCodeParams extends BaseParams {
  areaCode?: string // 지역코드(지역코드조회 참고)
}

export interface TatalCnt {
  totalCnt: number, // 콘텐츠 개수
}

export interface AreaBasedList {
  contentid: string, // 콘텐츠ID
  imgname: string, // 이미지명
  originimgurl: string, // 원본이미지 (약 500*333 size)
  serialnum: string, // 이미지일련번호
  smallimageurl: string, // 썸네일이미지 (약 160*100 size)
  cpyrhtDivCd: string // 저작권 유형 
  firstimage?: string;
  firstimage2?: string;
  title?: string;
  addr1?: string;
  tel?: string;
}

export interface AreaCode {
  code: string,
  name: string,
  rnum: string,
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