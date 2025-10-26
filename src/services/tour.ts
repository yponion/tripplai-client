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

    const query = new URLSearchParams(
      Object.entries(finalParams).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)).toString()

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tour/areaBasedList2?${query}`, {
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

    const query = new URLSearchParams(
      Object.entries(finalParams).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)).toString()

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tour/areaCode2?${query}`, {
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

    const query = new URLSearchParams(
      Object.entries(finalParams).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)).toString()

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tour/lclsSystmCode2/?${query}`, {
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
