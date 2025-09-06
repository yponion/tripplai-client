import type {
  AreaBasedListParams,
  AreaBasedListResponse,
  AreaCodeParams,
  ClassificationSystemCodeParams,
  ClassificationSystemCodeResponse,
} from "@/types/tourInfo";

export const tour = {
  getAreaBasedList: async (
    customParams?: Partial<AreaBasedListParams>
  ): Promise<AreaBasedListResponse> => {
    const url = new URL(
      process.env.NEXT_PUBLIC_TOUR_API_BASE_URL + "/areaBasedList2"
    );

    // 기본 params
    const defaultParams: AreaBasedListParams = {
      numOfRows: 2000,
      pageNo: 1,
      MobileOS: "ETC",
      MobileApp: process.env.NEXT_PUBLIC_SERVICE_NAME!,
      _type: "json",
      serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY!,
    };

    // 기본 params에 customParams를 덮어씀
    const finalParams = { ...defaultParams, ...customParams };

    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });

    const res = await fetch(url.toString(), {
      next: {
        tags: ["area", "based", "list"],
        revalidate: 60 * 60 * 24, // 1일 캐싱
      },
      cache: "force-cache",
    });

    if (!res.ok) throw new Error("Failed to fetch area based list data");

    return await res.json();
  },

  getAreaCode: async (customParams?: Partial<AreaCodeParams>) => {
    const url = new URL(
      process.env.NEXT_PUBLIC_TOUR_API_BASE_URL + "/areaCode2"
    );

    // 기본 params
    const defaultParams: AreaCodeParams = {
      numOfRows: 20,
      pageNo: 1,
      MobileOS: "ETC",
      MobileApp: process.env.NEXT_PUBLIC_SERVICE_NAME!,
      _type: "json",
      serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY!,
    };

    // 기본 params에 customParams를 덮어씀
    const finalParams = { ...defaultParams, ...customParams };

    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });

    const res = await fetch(url.toString(), {
      next: {
        tags: ["area", "code"],
        revalidate: 60 * 60 * 24, // 1일 캐싱
      },
      cache: "force-cache",
    });

    if (!res.ok) throw new Error("Failed to fetch area based list data");

    return await res.json();
  },

  getClassificationSystemCode: async (
    customParams?: Partial<ClassificationSystemCodeParams>
  ): Promise<ClassificationSystemCodeResponse> => {
    const url = new URL(
      process.env.NEXT_PUBLIC_TOUR_API_BASE_URL + "/lclsSystmCode2"
    );

    const defaultParams: ClassificationSystemCodeParams = {
      serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY!,
      MobileApp: process.env.NEXT_PUBLIC_SERVICE_NAME!,
      MobileOS: "ETC",
      _type: "json",
      numOfRows: 2000,
      pageNo: 1,
      lclsSystmListYn: "Y",
    };

    const finalParams = { ...defaultParams, ...customParams };

    Object.entries(finalParams).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value.toString());
    });

    const res = await fetch(url.toString(), {
      next: {
        tags: ["getClassificationSystemCode"],
        revalidate: 60 * 60 * 24, // 1일 캐싱
      },
      cache: "force-cache",
    });

    if (!res.ok)
      throw new Error("Failed to fetch classification system code data");

    return await res.json();
  },
};
