"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import getFestivals from "../../_services/getFestivals";
import { FestivalResponse } from "@/types/festival";
import Card from "../../_components/Card";
import { getDate } from "@/utils/dateUtils";

export default function FestivalList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery<FestivalResponse>({
    queryKey: ["festivals"],
    queryFn: getFestivals,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  const items = data?.response.body.items.item.filter(
    (festival) => festival.eventenddate > getDate()
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filteredSuggestions = items
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
      if (searchTerm.trim() !== "") {
        setSubmittedQuery(searchTerm.trim());
        setSuggestions([]);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setSubmittedQuery(suggestion);
    setSuggestions([]);
  };

  const filteredItems = submittedQuery
    ? items?.filter((festival) =>
        [festival.title, festival.addr1]
          .join(" ")
          .toLowerCase()
          .includes(submittedQuery.toLowerCase())
      )
    : items;

  const sortedItems = filteredItems?.sort(
    (a, b) => Number(a.eventstartdate) - Number(b.eventstartdate)
  );

  return (
    <div className="px-5 py-4 flex flex-col items-center">
      {/* 🔍 검색바 */}
      <div className="mb-6 w-full max-w-2xl relative">
        <input
          type="text"
          placeholder="축제 이름이나 장소를 검색하세요"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-[9999] w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto list-none">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 검색어 결과 타이틀 */}
      {submittedQuery && (
        <h2 className="text-lg font-semibold mb-4 text-purple-700">
          “{submittedQuery}” 검색 결과
        </h2>
      )}

      {/* 축제 리스트 */}
      <ul className="list-none w-full max-w-screen-2xl p-0 transition-all grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {sortedItems?.map((festival) => (
          <li key={festival.contentid}>
            <Card festival={festival} />
          </li>
        ))}
        {sortedItems?.length === 0 && (
          <li className="col-span-full text-center text-gray-500 mt-4">
            검색 결과가 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
}