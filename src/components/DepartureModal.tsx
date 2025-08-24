"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaMapMarkerAlt, FaSearch, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { loadKakaoMapAPI, isKakaoMapLoaded, geocodeAddress } from "@/utils/kakaoMapUtils";

interface AddressItem {
  address_name: string;
  road_address?: {
    address_name: string;
  };
  place_name?: string;
  category_name?: string;
  category_group_name?: string;
}

interface AddressResult {
  address_name: string;
  place_name?: string;
  x: string;
  y: string;
}

interface DepartureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (departure: string) => void;
  currentDeparture?: string;
  colorMode?: "dark" | "light" | "neutral";
}

const DepartureModal: React.FC<DepartureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentDeparture = "",
  colorMode = "light",
}) => {
  const [inputValue, setInputValue] = useState<string>(currentDeparture);
  const [searchResults, setSearchResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true);

    // 카카오맵 API가 이미 로드되어 있는지 확인
    if (isKakaoMapLoaded()) {
      return;
    }

    // 카카오맵 API 로드
    const initializeKakaoMap = async () => {
      try {
        await loadKakaoMapAPI();
      } catch (error) {
        console.error("DepartureModal: 카카오맵 API 로드 실패:", error);
        setErrorMessage("카카오맵 API 로드에 실패했습니다.");
      }
    };

    initializeKakaoMap();

    return () => setMounted(false);
  }, []);

  // 모달이 열릴 때 입력 필드에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // 현재 출발지 가져오기
      setInputValue(currentDeparture);

      // 포커스 및 커서 끝으로 이동
      setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current) {
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 100);
    }
  }, [isOpen, currentDeparture]);

  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // 에러 메시지 초기화
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // 주소 검색 함수
  const searchAddress = async (keyword: string) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      // API 로드 확인
      if (!isKakaoMapLoaded()) {
        await loadKakaoMapAPI();
      }

      // 여기서 추가 안전 검사
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        throw new Error("카카오맵 API 서비스가 준비되지 않았습니다");
      }

      // Places 서비스 존재 여부 확인 후 안전하게 사용
      if (window.kakao.maps.services && typeof window.kakao.maps.services.Places === "function") {
        const places = new window.kakao.maps.services.Places();

        places.keywordSearch(keyword, (results: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            // 검색 결과 처리
            const addressList = results.map((result: any) => ({
              address_name: result.address_name,
              place_name: result.place_name,
              x: result.x,
              y: result.y,
            }));

            setSearchResults(addressList);
          } else {
            // API는 있지만 검색 실패
            console.warn("DepartureModal: 주소 검색 실패:", status);
            setErrorMessage("주소를 찾을 수 없습니다. 다른 검색어를 시도해 보세요.");
          }
          setIsLoading(false);
        });
      } else {
        // Places 서비스가 없어서 geocodeAddress 함수 사용
        const coords = await geocodeAddress(keyword);

        // 좌표만 있는 단일 결과
        setSearchResults([
          {
            address_name: keyword,
            x: coords.x,
            y: coords.y,
          },
        ]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("DepartureModal: 주소 검색 오류:", error);
      setErrorMessage("주소 검색 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsLoading(false);
      setSearchResults([]);
    }
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    if (!inputValue.trim()) {
      setErrorMessage("검색어를 입력해주세요");
      return;
    }

    searchAddress(inputValue.trim());
  };

  // 엔터 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 결과 선택 핸들러
  const handleSelect = (address: string) => {
    onSave(address);
    onClose();
  };

  // 배경 클릭 시 모달 닫기 방지 (이벤트 버블링 중단)
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 모달 스타일
  const getModalStyle = () => {
    if (colorMode === "dark") {
      return "bg-gray-800 text-white";
    }
    if (colorMode === "neutral") {
      return "bg-[#f1f5f9] text-[#334155]";
    }
    return "bg-white text-gray-800";
  };

  // 입력 필드 스타일
  const getInputStyle = () => {
    if (colorMode === "dark") {
      return "bg-gray-700 text-white placeholder-gray-400 focus:outline-none border-0";
    }
    if (colorMode === "neutral") {
      return "bg-[#f1f5f9] text-[#334155] focus:outline-none border-0";
    }
    return "bg-gray-50 text-gray-800 focus:outline-none border-0";
  };

  // 버튼 스타일
  const getButtonStyle = (isPrimary = false) => {
    if (isPrimary) {
      if (colorMode === "dark") {
        return "bg-blue-600 hover:bg-blue-700 text-white";
      }
      if (colorMode === "neutral") {
        return "bg-[#7c3aed] hover:bg-[#6d28d9] text-white";
      }
      return "bg-blue-500 hover:bg-blue-600 text-white";
    } else {
      if (colorMode === "dark") {
        return "bg-gray-700 hover:bg-gray-600 text-gray-300";
      }
      if (colorMode === "neutral") {
        return "bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#475569]";
      }
      return "bg-gray-100 hover:bg-gray-200 text-gray-700";
    }
  };

  // 모달 컨텐츠
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className={`w-full max-w-md p-6 rounded-lg shadow-xl ${getModalStyle()}`} onClick={handleModalClick}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold">출발지 설정</h3>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 bg-transparent border-0 outline-none focus:outline-none p-1"
            aria-label="닫기"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-5">
          <div className="flex items-center rounded-lg overflow-hidden bg-transparent border-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="주소 또는 장소 이름 입력"
              className={`flex-grow py-3 px-4 border-0 outline-none shadow-none ${getInputStyle()}`}
            />
            <button
              onClick={handleSearch}
              className={`p-3 border-0 outline-none ${getButtonStyle(true)}`}
              disabled={isLoading}
            >
              <FaSearch />
            </button>
          </div>
          {errorMessage && <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-0 bg-blue-500 opacity-25"></div>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className={`text-center py-4 ${colorMode === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                주소를 검색하여 출발지를 설정하세요
              </p>
            ) : (
              <ul className="space-y-1">
                {searchResults.map((result, index) => (
                  <li
                    key={index}
                    className={`py-2 px-2 cursor-pointer rounded-md hover:${
                      colorMode === "dark" ? "bg-gray-700" : colorMode === "neutral" ? "bg-slate-200" : "bg-gray-100"
                    }`}
                    onClick={() => handleSelect(result.address_name)}
                  >
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="mt-1 mr-2 text-red-500 flex-shrink-0" />
                      <div>
                        {result.place_name && <p className="font-medium">{result.place_name}</p>}
                        <p
                          className={`${result.place_name ? "text-sm" : "font-medium"} ${
                            colorMode === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {result.address_name}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className={`px-4 py-2 rounded-lg border-0 outline-none ${getButtonStyle(false)}`}>
            취소
          </button>
          {currentDeparture && (
            <button
              onClick={() => {
                onSave(currentDeparture);
                onClose();
              }}
              className={`px-4 py-2 rounded-lg border-0 outline-none ${getButtonStyle(true)}`}
            >
              기존 주소 사용
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // isOpen이 false거나 클라이언트 사이드에서 렌더링되지 않으면 null 반환
  if (!isOpen || !mounted) return null;

  // Portal을 사용하여 모달을 document.body에 직접 렌더링
  return createPortal(modalContent, document.body);
};

export default DepartureModal;
