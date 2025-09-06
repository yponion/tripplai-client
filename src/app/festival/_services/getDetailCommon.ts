import { DetailCommonParams } from "@/types/festival";

export default async function getDetailCommon(id: string) {
  const url = new URL(
    process.env.NEXT_PUBLIC_TOUR_API_BASE_URL + "/detailCommon2"
  );

  const params: DetailCommonParams = {
    contentId: id,
    MobileOS: "ETC",
    MobileApp: process.env.NEXT_PUBLIC_SERVICE_NAME!,
    _type: "json",
    serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY!,
  };

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value.toString());
    }
  });

  const res = await fetch(url.toString(), {
    next: {
      tags: ["festival", "detail", "common", id],
      revalidate: 60 * 60 * 24, // 24시간 캐싱
    },
    cache: "force-cache",
  });

  if (!res.ok) throw new Error("Failed to fetch festival data");

  return await res.json();
}
