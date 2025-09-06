"use client";

import { AreaBasedList } from "@/types/tourInfo";
import { useRouter } from "next/navigation";

interface Props {
  area: string;
  areaBasedList: AreaBasedList[];
}

export default function Course({ area, areaBasedList }: Props) {
  const router = useRouter();

  return (
    <section className="mx-auto px-4 py-12 max-w-7xl">
      <h2 className="text-3xl font-bold mb-10 text-center">{area} 추천 코스</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {areaBasedList.map((area, index) => (
          <div
            key={index}
            onClick={() => router.push(`/detail/${area.contentid}`)}
            className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 bg-white cursor-pointer hover:scale-105"
          >
            <div className="h-48 md:h-56 w-full bg-gray-200">
              {area.firstimage ? (
                <img src={area.firstimage} alt={`${area.title} 이미지`} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
                  이미지 없음
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{area.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
