import { GetFestivalsParams } from "@/types/festival";
import { getLastYearDate } from "@/utils/dateUtils";

export default async function getFestivals() {
  const params: GetFestivalsParams = {
    numOfRows: 2000,
    pageNo: 1,
    MobileOS: "ETC",
    MobileApp: process.env.NEXT_PUBLIC_SERVICE_NAME!,
    _type: "json",
    eventStartDate: getLastYearDate(),
    serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY!,
  }

  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)).toString()

  const res = await fetch(`/api/tour/searchFestival2?${query}`, {
    // next: {
    //   tags: ["searchFestival2"],
    //   revalidate: 60 * 60 * 24, // 24시간 캐싱
    // },
    // cache: "force-cache",
  });

  // if (!res.ok) throw new Error("Failed to fetch festival data");

  return await res.json();
}