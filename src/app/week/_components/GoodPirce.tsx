"use client";

import { AreaBasedList } from "@/types/tourInfo";
import { FaStore, FaMapMarkerAlt } from "react-icons/fa";

interface Props {
  area: string;
  areaBasedList: AreaBasedList[];
}

export default function GoodPrice({ area, areaBasedList }: Props) {
  // 카카오맵 URL 생성기
  const getKakaoMapsUrl = (address: string) => {
    return `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
  };

  return (
    <section className="mx-auto px-4 py-12 max-w-5xl">
      <h2 className="text-3xl font-bold mb-10 text-center">{area} 추천 음식점</h2>
      <div className="space-y-6">
        {areaBasedList.map((shop, index) => (
          <div
            key={index}
            className="flex items-center gap-6 p-4 rounded-2xl bg-white shadow hover:shadow-md transition hover:scale-105"
          >
            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200">
              {shop.firstimage ? (
                <img src={shop.firstimage} alt={`${shop.title} 이미지`} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-sm">
                  이미지 없음
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold flex items-center gap-2 mb-1">
                <FaStore className="text-pink-500" />
                {shop.title}
              </h3>
              <p className="text-gray-600 mb-2">{shop.tel}</p>
              <a
                href={getKakaoMapsUrl(shop.addr1!)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-500 hover:underline"
              >
                <FaMapMarkerAlt className="mr-1" />
                {shop.addr1}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
