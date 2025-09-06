"use client";

import { useState, useEffect } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import CategorySlider from "./CategorySlider";
import useThemeMode from "@/hooks/useDarkMode";
import { tour } from "@/services/tour";
import type { AreaBasedList, AreaBasedListParams, ClassificationSystemCode } from "@/types/tourInfo";
import { uniqBy, sampleSize } from "lodash";
import { useRouter } from "next/navigation";

interface RegionSectionProps {
  onFilterClick?: () => void;
}

export default function RegionSection({ onFilterClick }: RegionSectionProps) {
  const [systemCodeData, setSystemCodeData] = useState<ClassificationSystemCode[]>([]);
  const [selectedSystemCode, setSelectedSystemCode] = useState(-1);
  const [regions, setRegions] = useState<AreaBasedList[]>([]);
  const { themeMode } = useThemeMode();
  const router = useRouter();

  // 카테고리 목록 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        const _systemCodeData = await tour.getClassificationSystemCode();
        setSystemCodeData(uniqBy(_systemCodeData?.response.body.items.item, "lclsSystm2Cd"));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // 다크모드 여부
  const isDarkMode = themeMode === "dark";

  // 선택된 카테고리에 따라 지역 필터링
  useEffect(() => {
    const fetchData = async () => {
      try {
        let params: Partial<AreaBasedListParams> = {};
        if (selectedSystemCode !== -1) {
          params = {
            lclsSystm1: systemCodeData[selectedSystemCode].lclsSystm1Cd,
            lclsSystm2: systemCodeData[selectedSystemCode].lclsSystm2Cd,
          };
        }
        const _regions = await tour.getAreaBasedList(params);
        const haveImageRegions = _regions?.response.body.items.item.filter((item) => item.firstimage);
        setRegions(sampleSize(haveImageRegions, 8));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [selectedSystemCode]);

  // 테마에 따른 스타일 결정
  const getSectionStyle = () => {
    return isDarkMode ? "py-16 mb-8 -mt-24 bg-black text-white" : "py-16 mb-8 -mt-24 bg-white text-gray-800";
  };

  // 테마에 따른 텍스트 스타일 변경
  const getHeadingClasses = () => {
    switch (themeMode) {
      case "original":
        return "text-2xl font-bold text-pink-500";
      case "light":
        return "text-2xl font-bold text-gray-800";
      case "dark":
        return "text-2xl font-bold text-white";
      default:
        return "text-2xl font-bold text-pink-500";
    }
  };

  // 테마에 따른 버튼 스타일 변경
  const getButtonClasses = () => {
    switch (themeMode) {
      case "original":
        return "px-4 py-2 bg-white text-pink-600 border border-pink-200 rounded-md shadow-sm hover:bg-pink-50 transition-colors duration-200 font-medium";
      case "light":
        return "px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors duration-200 font-medium";
      case "dark":
        return "px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md shadow-sm hover:bg-gray-700 transition-colors duration-200 font-medium";
      default:
        return "px-4 py-2 bg-white text-pink-600 border border-pink-200 rounded-md shadow-sm hover:bg-pink-50 transition-colors duration-200 font-medium";
    }
  };

  // 테마에 따른 카드 스타일 변경
  const getCardClasses = () => {
    switch (themeMode) {
      case "original":
        return "bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer";
      case "light":
        return "bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer";
      case "dark":
        return "bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer";
      default:
        return "bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer";
    }
  };

  // 텍스트 스타일 변경
  const getCardTitleClasses = () => {
    switch (themeMode) {
      case "original":
        return "text-lg font-bold mb-1 text-pink-600";
      case "light":
        return "text-lg font-bold mb-1 text-gray-800";
      case "dark":
        return "text-lg font-bold mb-1 text-white";
      default:
        return "text-lg font-bold mb-1 text-pink-600";
    }
  };

  const getCardTextClasses = () => {
    switch (themeMode) {
      case "original":
        return "flex items-start text-sm text-gray-600";
      case "light":
        return "flex items-start text-sm text-gray-600";
      case "dark":
        return "flex items-start text-sm text-gray-300";
      default:
        return "flex items-start text-sm text-gray-600";
    }
  };

  const getEmptyMessageClass = () => {
    return isDarkMode ? "text-white" : "text-gray-500";
  };

  // 마커 아이콘 색상
  const getMarkerIconClass = () => {
    if (themeMode === "original") {
      return "text-pink-500";
    } else if (isDarkMode) {
      return "text-white";
    } else {
      return "text-gray-600";
    }
  };

  return (
    <section className={getSectionStyle()}>
      <div className="container mx-auto px-4">
        <CategorySlider
          onFilterClick={onFilterClick}
          systemCodeData={systemCodeData}
          selectedSystemCode={selectedSystemCode}
          setSelectedSystemCode={setSelectedSystemCode}
        />

        <div className="flex items-center justify-between mb-6">
          <h2 className={getHeadingClasses()}>
            {selectedSystemCode !== -1
              ? `${systemCodeData[selectedSystemCode].lclsSystm2Nm} 추천 여행지`
              : "모든 여행지"}
          </h2>

          {selectedSystemCode !== -1 && (
            <button className={getButtonClasses()} onClick={() => setSelectedSystemCode(-1)}>
              전체 보기
            </button>
          )}
        </div>

        {regions.length === 0 ? (
          <div className="text-center py-10">
            <p className={getEmptyMessageClass()}>해당 카테고리에 맞는 여행지가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((region, regionIndex) => (
              <div
                key={regionIndex}
                className={getCardClasses()}
                onClick={() => router.push(`/detail/${region.contentid}`)}
              >
                <div className="h-48 overflow-hidden">
                  {region.firstimage ? (
                    <img
                      src={region.firstimage}
                      alt={region.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">이미지 없음</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className={getCardTitleClasses()}>{region.title}</h3>
                  {region.addr1 && (
                    <div className={getCardTextClasses()}>
                      <FaMapMarkerAlt className={`mt-1 mr-1 flex-shrink-0 ${getMarkerIconClass()}`} />
                      <p>{region.addr1}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
