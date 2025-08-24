"use client";

import { useState, useRef, type Dispatch, type SetStateAction } from "react";
import { FaChevronRight, FaChevronLeft, FaFilter } from "react-icons/fa";
import useThemeMode from "@/hooks/useDarkMode";
import type { ClassificationSystemCode } from "@/types/tourInfo";

const codeToEmojiMappingData = [
  { code: "AC01", emoji: "🏨" }, // 호텔
  { code: "AC02", emoji: "🏢" }, // 콘도미니엄
  { code: "AC03", emoji: "🏡" }, // 펜션/민박
  { code: "AC04", emoji: "🛏️" }, // 모텔
  { code: "AC05", emoji: "⛺" }, // 캠핑
  { code: "AC06", emoji: "🛌" }, // 호스텔
  { code: "C0112", emoji: "👨‍👩‍👧‍👦" }, // 가족코스
  { code: "C0113", emoji: "🧍" }, // 나홀로코스
  { code: "C0114", emoji: "🧘" }, // 힐링코스
  { code: "C0115", emoji: "🚶" }, // 도보코스
  { code: "C0116", emoji: "⛺" }, // 캠핑코스
  { code: "C0117", emoji: "🍽️" }, // 맛코스
  { code: "EV01", emoji: "🎉" }, // 축제
  { code: "EV02", emoji: "🎭" }, // 공연
  { code: "EV03", emoji: "🎪" }, // 행사
  { code: "EX01", emoji: "🏮" }, // 전통체험
  { code: "EX02", emoji: "🧵" }, // 공예체험
  { code: "EX03", emoji: "🌾" }, // 농.산.어촌 체험
  { code: "EX04", emoji: "🛕" }, // 산사체험
  { code: "EX05", emoji: "🧖‍♀️" }, // 웰니스관광
  { code: "EX06", emoji: "🏭" }, // 산업관광
  { code: "EX07", emoji: "🧩" }, // 기타체험
  { code: "FD01", emoji: "🍚" }, // 한식
  { code: "FD02", emoji: "🍝" }, // 외국식
  { code: "FD03", emoji: "🌭" }, // 간이음식
  { code: "FD04", emoji: "🍺" }, // 주점
  { code: "FD05", emoji: "☕" }, // 카페/찻집
  { code: "HS01", emoji: "🏛️" }, // 역사유적지
  { code: "HS02", emoji: "🗿" }, // 역사유물
  { code: "HS03", emoji: "⛪" }, // 종교성지
  { code: "HS04", emoji: "🛡️" }, // 안보관광지
  { code: "LS01", emoji: "🏃‍♂️" }, // 육상레저스포츠
  { code: "LS02", emoji: "🏄‍♂️" }, // 수상레저스포츠
  { code: "LS03", emoji: "🪂" }, // 항공레저스포츠
  { code: "LS04", emoji: "🎯" }, // 복합레저스포츠
  { code: "NA01", emoji: "⛰️" }, // 자연경관(산)
  { code: "NA02", emoji: "🌊" }, // 자연경관(하천‧해양)
  { code: "NA03", emoji: "🦋" }, // 자연생태
  { code: "NA04", emoji: "🏞️" }, // 자연공원
  { code: "NA05", emoji: "🌿" }, // 기타자연관광
  { code: "SH01", emoji: "🏬" }, // 백화점
  { code: "SH02", emoji: "🛍️" }, // 쇼핑몰
  { code: "SH03", emoji: "🛒" }, // 대형마트
  { code: "SH04", emoji: "🛃" }, // 면세점
  { code: "SH05", emoji: "🏪" }, // 전문매장/상가
  { code: "SH06", emoji: "🧺" }, // 시장
  { code: "SH07", emoji: "🛍️" }, // 기타쇼핑시설
  { code: "VE01", emoji: "🗼" }, // 랜드마크관광
  { code: "VE02", emoji: "🎢" }, // 테마공원
  { code: "VE03", emoji: "🌳" }, // 도시공원
  { code: "VE04", emoji: "🏙️" }, // 도시·지역문화관광
  { code: "VE05", emoji: "🏢" }, // 복합관광시설
  { code: "VE06", emoji: "🎤" }, // 공연시설
  { code: "VE07", emoji: "🖼️" }, // 전시시설
  { code: "VE08", emoji: "🏟️" }, // 행사시설
  { code: "VE09", emoji: "🏫" }, // 교육시설
  { code: "VE10", emoji: "🏓" }, // 레저스포츠시설
  { code: "VE11", emoji: "🚉" }, // 교통시설
  { code: "VE12", emoji: "🏺" }, // 기타문화관광지
];

interface CategorySliderProps {
  onFilterClick?: () => void;
  systemCodeData: ClassificationSystemCode[];
  selectedSystemCode: number;
  setSelectedSystemCode: Dispatch<SetStateAction<number>>;
}

export default function CategorySlider({
  onFilterClick,
  systemCodeData,
  selectedSystemCode,
  setSelectedSystemCode,
}: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { themeMode } = useThemeMode();

  // 다크모드 여부
  const isDarkMode = themeMode === "dark";

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left" ? current.scrollLeft - scrollAmount : current.scrollLeft + scrollAmount;

      current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  // 테마에 따른 스타일 결정
  const getTextClass = () => {
    return isDarkMode ? "font-medium text-sm text-white" : "font-medium text-sm text-gray-600";
  };

  const getFilterButtonClass = () => {
    return isDarkMode
      ? "flex items-center px-3 py-1 text-sm rounded-full border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors"
      : "flex items-center px-3 py-1 text-sm rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors";
  };

  const getScrollButtonClass = () => {
    return isDarkMode
      ? "absolute z-10 rounded-full bg-gray-800 border border-gray-600 p-2 hover:bg-gray-700"
      : "absolute z-10 rounded-full bg-white shadow-sm border border-gray-200 p-2 hover:bg-gray-100";
  };

  const getIconClass = () => {
    return isDarkMode ? "text-white" : "text-gray-600";
  };

  const getCategoryItemClass = (isSelected: boolean) => {
    let baseClass = "flex items-center justify-center w-[50px] h-[50px] mb-1 p-2 rounded-md shadow-sm text-2xl ";

    if (isDarkMode) {
      baseClass += isSelected ? "bg-gray-700 border-2 border-pink-500" : "bg-gray-800";
    } else {
      baseClass += isSelected ? "bg-white border-2 border-pink-500" : "bg-white";
    }

    return baseClass;
  };

  const getCategoryTextClass = (isSelected: boolean) => {
    let baseClass = "text-xs text-center font-medium mt-1 ";

    if (isDarkMode) {
      baseClass += isSelected ? "text-pink-400" : "text-white";
    } else {
      baseClass += isSelected ? "text-pink-600" : "text-gray-700";
    }

    return baseClass;
  };

  return (
    <div className={`relative -mt-12 mb-16 mx-auto max-w-7xl ${isDarkMode ? "bg-black" : ""}`}>
      <div className="flex justify-between items-center mb-3">
        <p className={getTextClass()}>추천 카테고리</p>
        <button className={getFilterButtonClass()} onClick={onFilterClick}>
          <FaFilter className={`mr-2 ${getIconClass()}`} />
          <span className={getIconClass()}>필터</span>
        </button>
      </div>

      {showLeftArrow && (
        <button
          aria-label="Scroll left"
          className={`${getScrollButtonClass()} left-2 top-1/2 transform -translate-y-1/2`}
          onClick={() => scroll("left")}
        >
          <FaChevronLeft className={getIconClass()} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="overflow-x-auto py-2 px-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
        onScroll={handleScroll}
      >
        <div className="flex">
          {systemCodeData.map((systemCode, systemCodeIndex) => (
            <div
              key={systemCodeIndex}
              className={`flex flex-col items-center min-w-[80px] mx-2 cursor-pointer transition-transform duration-200 hover:translate-y-[-2px] ${
                selectedSystemCode === systemCodeIndex ? "scale-110" : ""
              }`}
              onClick={() => {
                if (selectedSystemCode === systemCodeIndex) {
                  setSelectedSystemCode(-1);
                } else {
                  setSelectedSystemCode(systemCodeIndex);
                }
              }}
            >
              <div className={getCategoryItemClass(selectedSystemCode === systemCodeIndex)}>
                {codeToEmojiMappingData.find((item) => item.code === systemCode.lclsSystm2Cd)?.emoji}
              </div>
              <p className={getCategoryTextClass(selectedSystemCode === systemCodeIndex)}>{systemCode.lclsSystm2Nm}</p>
            </div>
          ))}
        </div>
      </div>

      {showRightArrow && (
        <button
          aria-label="Scroll right"
          className={`${getScrollButtonClass()} right-2 top-1/2 transform -translate-y-1/2`}
          onClick={() => scroll("right")}
        >
          <FaChevronRight className={getIconClass()} />
        </button>
      )}
    </div>
  );
}
