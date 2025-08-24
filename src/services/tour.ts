import { AreaBasedListParams, AreaCodeParams } from "@/types/tourInfo";

export const tour = {
  getAreaBasedList: async (customParams?: Partial<AreaBasedListParams>) => {
    const url = new URL(process.env.NEXT_PUBLIC_TOUR_API_BASE_URL + "/areaBasedList2");

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
        revalidate: 60 * 60 * 24 * 7, // 7일 캐싱
      },
      cache: "force-cache",
    });

    if (!res.ok) throw new Error("Failed to fetch area based list data");

    return await res.json();
  },

  getAreaCode: async (customParams?: Partial<AreaCodeParams>) => {
    const url = new URL(process.env.NEXT_PUBLIC_TOUR_API_BASE_URL + "/areaCode2");

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
        revalidate: 60 * 60 * 24 * 7, // 7일 캐싱
      },
      cache: "force-cache",
    });

    if (!res.ok) throw new Error("Failed to fetch area based list data");

    return await res.json();
  }


}