"use client";

import { keepService } from "@/services/keepService";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Image from "next/image";
import Layout from "@/components/Layout";
import getDetailCommon from "../festival/_services/getDetailCommon";

export default function KeepsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [keeps, setKeeps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadKeeps = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await keepService.keepList();
      // 백엔드 응답 형태 방어코드
      const data = res?.data?.list.map(({ contentId }: { contentId: string }) => contentId) ?? [];
      setKeeps(data);
    } catch (e: any) {
      // 401 등 권한 문제 대응
      if (e?.response?.status === 401) {
        setError("로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
      } else {
        setError("목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeeps();
  }, []);

  const hasKeeps = useMemo(() => keeps && keeps.length > 0, [keeps]);

  useEffect(() => {
    Promise.all(
      keeps.map(async (keep) => {
        const detailCommonResponse = await getDetailCommon(keep);
        const { addr1, addr2, firstimage, homepage, overview, tel, telname, title } =
          detailCommonResponse.response.body.items.item[0];
        return {
          addr1,
          addr2,
          firstimage,
          homepage,
          overview,
          tel,
          telname,
          title,
        };
      })
    ).then((res) => {
      setCards(res);
    });
  }, [keeps]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-[80px] pb-16">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">나의 찜 목록</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 rounded-full bg-gray-100">총 {keeps.length}개</span>
            <Button variant="outline" size="sm" onClick={loadKeeps}>
              새로고침
            </Button>
          </div>
        </div>

        {/* 상태 영역 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <div className="animate-spin inline-block size-8 border-[3px] border-current border-t-transparent text-pink-500 rounded-full mb-4" />
            불러오는 중입니다...
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Image src="/images/popular/info.png" alt="오류" width={56} height={56} className="mb-4 opacity-80" />
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={loadKeeps}>다시 시도</Button>
          </div>
        )}

        {!isLoading && !error && !hasKeeps && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Image src="/images/popular/map_pin.png" alt="빈 목록" width={56} height={56} className="mb-4 opacity-80" />
            <p className="text-gray-700 mb-2">아직 찜한 항목이 없습니다.</p>
            <p className="text-gray-500 text-sm mb-5">여행지 상세 페이지에서 하트를 눌러 찜해보세요.</p>
            <Button onClick={loadKeeps}>새로고침</Button>
          </div>
        )}

        {/* 그리드 */}
        {!isLoading && !error && hasKeeps && cards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.title ?? card.contentId}
                className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                {/* 썸네일 */}
                {card.firstimage || card.firstimage2 ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={(card.firstimage || card.firstimage2) as string}
                      alt={(card.title || "찜한 항목") as string}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center">
                    <Image
                      src="/images/popular/Time.png"
                      alt="placeholder"
                      width={40}
                      height={40}
                      className="opacity-40"
                    />
                  </div>
                )}

                {/* 본문 */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold line-clamp-1 mb-1">{card.title || "이름 없음"}</h3>
                  {card.addr1 || card.addr2 ? (
                    <p className="text-sm text-gray-500 line-clamp-2">{card.addr1 || card.addr2}</p>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (card.contentId) {
                          window.location.href = `/detail/${card.contentId}`;
                        }
                      }}
                    >
                      자세히 보기
                    </Button>
                    {card.createdtime ? (
                      <span className="text-xs text-gray-400">{new Date(card.createdtime).toLocaleDateString()}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
