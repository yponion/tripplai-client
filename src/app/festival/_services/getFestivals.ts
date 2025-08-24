import { GetFestivalsParams } from "@/types/festival";
import { getLastYearDate } from "@/utils/dateUtils";

export default async function getFestivals() {
  const url = new URL(process.env.NEXT_PUBLIC_TOUR_API_BASE_URL + "/searchFestival2");

  const params: GetFestivalsParams = {
    numOfRows: 2000,
    pageNo: 1,
    MobileOS: "ETC",
    MobileApp: process.env.NEXT_PUBLIC_SERVICE_NAME!,
    _type: "json",
    eventStartDate: getLastYearDate(),
    serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY!,
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value.toString());
    }
  });

  const res = await fetch(url.toString(), {
    next: {
      tags: ["festival"],
      revalidate: 60 * 60 * 24, // 24시간 캐싱
    },
    cache: "force-cache",
  });

  if (!res.ok) throw new Error("Failed to fetch festival data");

  return await res.json();
}