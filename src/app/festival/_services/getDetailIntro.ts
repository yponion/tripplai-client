import { DetailIntroParams } from "@/types/festival";

export default async function getDetailIntro(id: string) {
  const params: DetailIntroParams = {
    contentId: id,
    contentTypeId: "15",
    MobileOS: "ETC",
    MobileApp: process.env.NEXT_PUBLIC_SERVICE_NAME!,
    _type: "json",
    serviceKey: process.env.NEXT_PUBLIC_TOUR_API_KEY!,
  }

  const query = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)).toString()

  const res = await fetch(`/api/tour/detailIntro2?${query}`, {
    // next: {
    //   tags: ["detailIntro2", id],
    //   revalidate: 60 * 60 * 24, // 24시간 캐싱
    // },
    // cache: "force-cache",
  });

  if (!res.ok) throw new Error("Failed to fetch festival data");

  return await res.json();
}