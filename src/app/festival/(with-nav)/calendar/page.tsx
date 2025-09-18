"use client";

import { getDaysForMonth, getDate } from "@/utils/dateUtils";
import clsx from "clsx";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FestivalResponse } from "@/types/festival";
import getFestivals from "../../_services/getFestivals";
import { useRouter } from "next/navigation";

const days = ["일", "월", "화", "수", "목", "금", "토"];

export default function Calendar() {
  const router = useRouter();
  const today = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery<FestivalResponse>({
    queryKey: ["festivals"],
    queryFn: getFestivals,
  });

  if (isLoading)
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-40 rounded-2xl bg-gradient-to-r from-rose-100 to-pink-100" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      </div>
    );

  const baseYear = today.getFullYear();
  const baseMonth = today.getMonth();
  const year = new Date(baseYear, baseMonth + currentMonthIndex).getFullYear();
  const month =
    new Date(baseYear, baseMonth + currentMonthIndex).getMonth() + 1;

  const allDays = getDaysForMonth(year, month);
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const items = data?.response.body.items.item.filter(
    (festival) => festival.eventenddate > getDate()
  );
  const sortedItems = items?.sort(
    (a, b) => Number(a.eventstartdate) - Number(b.eventstartdate)
  );

  const toDateStr = (d: number) =>
    `${year}${String(month).padStart(2, "0")}${String(d).padStart(2, "0")}`;
  const validDaysInMonth = allDays.filter(
    (d) => typeof d === "number" && !isNaN(d as number)
  ) as number[];
  const countsByDate: Record<string, number> = {};
  validDaysInMonth.forEach((d) => {
    const ds = toDateStr(d);
    const c =
      sortedItems?.filter(
        (item) => item.eventstartdate <= ds && ds <= item.eventenddate
      ).length || 0;
    countsByDate[ds] = c;
  });
  const maxDailyCount = Math.max(1, ...Object.values(countsByDate));

  const handleDateClick = (day: number) => {
    const dateStr = `${year}${String(month).padStart(2, "0")}${String(
      day
    ).padStart(2, "0")}`;
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filteredSuggestions = sortedItems
        ?.map((festival) => festival.title)
        .filter((title) => title.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filteredSuggestions || []);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSubmittedQuery(searchTerm.trim());
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSubmittedQuery(suggestion);
    setSuggestions([]);
  };

  const filteredFestivals = sortedItems?.filter((festival) => {
    let matchesSearch = true;
    let matchesDate = true;

    // 검색어 필터링
    if (submittedQuery.trim()) {
      const title = festival.title?.toLowerCase() || "";
      const addr = festival.addr1?.toLowerCase() || "";
      const keyword = submittedQuery.toLowerCase();
      matchesSearch = title.includes(keyword) || addr.includes(keyword);
    }

    // 날짜 필터링
    if (selectedDate) {
      matchesDate =
        festival.eventstartdate <= selectedDate &&
        selectedDate <= festival.eventenddate;
    }

    return matchesSearch && matchesDate;
  });

  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const monthStartStr = `${year}${String(month).padStart(2, "0")}01`;
  const monthEndStr = `${year}${String(month).padStart(2, "0")}${String(
    lastDayOfMonth
  ).padStart(2, "0")}`;
  const monthHighlights = sortedItems
    ?.filter(
      (item) =>
        item.eventenddate >= monthStartStr && item.eventstartdate <= monthEndStr
    )
    .slice(0, 30);

  // 축제 정렬
  const getSortedFestivals = (festivals: typeof filteredFestivals) => {
    if (!festivals) return [];

    if (selectedDate) {
      return [...festivals].sort((a, b) => {
        const aDuration = parseInt(a.eventenddate) - parseInt(a.eventstartdate);
        const bDuration = parseInt(b.eventenddate) - parseInt(b.eventstartdate);

        const isLongA = aDuration > 10000;
        const isLongB = bDuration > 10000;

        if (isLongA && !isLongB) return 1;
        if (!isLongA && isLongB) return -1;

        const aDistance = Math.abs(
          parseInt(a.eventstartdate) - parseInt(selectedDate)
        );
        const bDistance = Math.abs(
          parseInt(b.eventstartdate) - parseInt(selectedDate)
        );

        return aDistance - bDistance;
      });
    }

    return [...festivals].sort(
      (a, b) => parseInt(a.eventstartdate) - parseInt(b.eventstartdate)
    );
  };

  const rawListItems =
    selectedDate || submittedQuery.trim() ? filteredFestivals : monthHighlights;
  const listItems = getSortedFestivals(rawListItems);

  const imageFallback =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stop-color="#fecdd3"/>
            <stop offset="100%" stop-color="#f9a8d4"/>
          </linearGradient>
        </defs>
        <rect width="200" height="140" fill="url(#g)" rx="12"/>
        <path d="M60 54a14 14 0 1 0 0-28 14 14 0 0 0 0 28Zm-22 60h124a6 6 0 0 0 5.2-9.1l-28-46.6a6 6 0 0 0-10.3-.4l-18.6 28.3-9.5-14.3a6 6 0 0 0-10.1.3L33.4 103a6 6 0 0 0 4.6 11Z" fill="#ffffff" opacity=".85"/>
      </svg>`
    );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* 상단 헤더 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white mb-8">
        <div className="px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm/6 opacity-90">월별 축제 달력</p>
              <h2 className="mt-1 text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-400 drop-shadow-none">
                {year}.{String(month).padStart(2, "0")}
              </h2>
              <p className="mt-2 text-sm sm:text-base opacity-90">
                국내 주요 축제를 한눈에 확인하세요.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label="이전 달"
                onClick={() => setCurrentMonthIndex((prev) => prev - 1)}
                className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 text-white text-xl flex items-center justify-center transition"
                title="이전 달"
              >
                ←
              </button>
              <button
                aria-label="다음 달"
                onClick={() => setCurrentMonthIndex((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 text-white text-xl flex items-center justify-center transition"
                title="다음 달"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2열 레이아웃 */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* 달력 */}
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white lg:h-[70vh] flex flex-col">
            <div className="grid grid-cols-7 bg-gray-50/60 text-center text-xs sm:text-sm font-semibold text-gray-700">
              {days.map((day, i) => (
                <div
                  key={day}
                  className={clsx(
                    "py-3 sm:py-4 uppercase tracking-wide",
                    i === 0 && "text-red-500",
                    i === 6 && "text-blue-500"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="flex-1 grid grid-cols-7 grid-rows-5 border-t border-gray-200 bg-white">
              {weeks.map((week, weekIdx) =>
                week.map((day, i) => {
                  const isValidDay = typeof day === "number" && !isNaN(day);
                  const dateStr = isValidDay ? toDateStr(day) : "";
                  const count = isValidDay ? countsByDate[dateStr] || 0 : 0;
                  const isSelected = selectedDate === dateStr;
                  const isToday = isValidDay && dateStr === getDate();
                  const isWeekend = i === 0 || i === 6;

                  return (
                    <div
                      key={`${weekIdx}-${i}`}
                      onClick={() => isValidDay && handleDateClick(day)}
                      role={isValidDay ? "button" : undefined}
                      tabIndex={isValidDay ? 0 : -1}
                      aria-pressed={isValidDay ? isSelected : undefined}
                      className={clsx(
                        "group relative p-2 sm:p-3 border border-gray-100 transition min-h-0 flex flex-col",
                        !isValidDay
                          ? "bg-gray-50 cursor-default"
                          : "bg-white hover:bg-rose-50 cursor-pointer",
                        isSelected && "ring-2 ring-pink-500 ring-inset",
                        isToday && "bg-rose-50/50"
                      )}
                      aria-label={
                        isValidDay
                          ? `${month}월 ${day}일, 축제 ${count}개`
                          : undefined
                      }
                    >
                      {isValidDay && (
                        <div className="flex h-full w-full flex-col justify-between">
                          <div className="flex items-start justify-between">
                            <span
                              className={clsx(
                                "font-semibold text-sm sm:text-base lg:text-lg",
                                isSelected
                                  ? "text-pink-700"
                                  : isWeekend
                                  ? i === 0
                                    ? "text-rose-600"
                                    : "text-blue-600"
                                  : "text-gray-900"
                              )}
                            >
                              {day}
                            </span>
                            {count > 0 && (
                              <span className="rounded-full bg-pink-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 shadow">
                                {count}
                              </span>
                            )}
                          </div>
                          <div className="mt-auto mb-1">
                            <div className="h-1 sm:h-1.5 w-full rounded-full bg-gray-100">
                              <div
                                className="h-1 sm:h-1.5 rounded-full bg-pink-500 transition-all duration-300"
                                style={{
                                  width: `${Math.max(
                                    count > 0 ? 15 : 0,
                                    Math.round((count / maxDailyCount) * 100)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* 리스트 */}
        <aside className="mt-10 lg:mt-0 lg:col-span-7">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {selectedDate
                  ? `${selectedDate.slice(0, 4)}.${selectedDate.slice(
                      4,
                      6
                    )}.${selectedDate.slice(6, 8)} 축제 ${
                      listItems?.length || 0
                    }개`
                  : submittedQuery
                  ? `검색 결과 ${listItems?.length || 0}개`
                  : `이번 달 주요 축제 ${listItems?.length || 0}개`}
              </h3>
              {!selectedDate && !submittedQuery && (
                <p className="mt-1 text-sm text-gray-500">
                  선택한 날짜가 없어요. 달력에서 날짜를 눌러 상세 리스트를
                  확인하세요.
                </p>
              )}
            </div>
            <div className="w-full sm:w-80 relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="축제 이름이나 장소 검색"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                aria-label="축제 검색"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSubmittedQuery("");
                    setSuggestions([]);
                  }}
                  aria-label="검색어 지우기"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
                >
                  ×
                </button>
              )}
              {suggestions.length > 0 && (
                <ul
                  role="listbox"
                  aria-label="검색 제안"
                  className="absolute z-[9999] w-full bg-white border border-gray-200 rounded-md mt-2 max-h-60 overflow-y-auto shadow-lg"
                >
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      role="option"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm max-h-[70vh] overflow-y-auto p-2 sm:p-3">
            {listItems && listItems.length > 0 ? (
              <ul className="space-y-2">
                {listItems.map((item) => (
                  <li
                    key={item.contentid}
                    className="flex items-center gap-3 sm:gap-4 rounded-xl border border-gray-100 p-2 sm:p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/festival/detail/${item.contentid}`, {
                        scroll: false,
                      })
                    }
                  >
                    <img
                      src={item.firstimage || imageFallback}
                      alt={item.title}
                      className="h-16 w-16 sm:h-20 sm:w-28 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          imageFallback;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600 truncate">
                        📅 {item.eventstartdate} ~ {item.eventenddate}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        📍 {item.addr1 || "장소 정보 없음"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/festival/detail/${item.contentid}`, {
                          scroll: false,
                        });
                      }}
                      className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-700 border-0 outline-none focus:outline-none"
                    >
                      보기
                      <span aria-hidden>→</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
                표시할 축제가 없습니다. 날짜를 선택하거나 검색어를 변경해
                보세요.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
