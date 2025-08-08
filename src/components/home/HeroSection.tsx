'use client'

import { useState } from 'react'
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import useThemeMode from '@/hooks/useDarkMode'

// 지원되는 여행지 목록
const SUPPORTED_LOCATIONS = ['제주도', '강릉', '부산', '여수', '경주', '전주', '속초', '울산'];

export default function HeroSection() {
  const [location, setLocation] = useState('')
  const [adults, setAdults] = useState('2')
  const [children, setChildren] = useState('0')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { themeMode } = useThemeMode()
  
  const router = useRouter()
  
  const handleSearch = () => {
    if (!location) {
      alert('여행지를 입력해주세요.');
      return;
    }
    
    // 지원되는 여행지인지 확인
    if (!SUPPORTED_LOCATIONS.includes(location)) {
      alert('지원되는 여행지가 아닙니다. 현재 지원되는 여행지는 제주도, 강릉, 부산, 여수, 경주, 전주, 속초, 울산입니다.');
      return;
    }
    
    // 날짜 입력이 없으면 현재 날짜 기준으로 설정
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formattedToday = today.toISOString().split('T')[0];
    const formattedTomorrow = tomorrow.toISOString().split('T')[0];
    
    const params = new URLSearchParams({
      location,
      startDate: startDate || formattedToday,
      endDate: endDate || formattedTomorrow
    });
    
    router.push(`/travel/create?${params.toString()}`);
  };
  
  // 테마에 따른 비디오 오버레이 클래스 결정
  const getVideoOverlayClass = () => {
    switch(themeMode) {
      case 'dark':
        return "absolute inset-0 bg-black/80";
      case 'light':
        return "absolute inset-0 bg-gradient-to-r from-gray-800/60 to-gray-600/40";
      default:
        return "absolute inset-0 bg-gradient-to-r from-gray-800/70 to-gray-600/40";
    }
  };
  
  // 섹션 배경 클래스 결정
  const getSectionClasses = () => {
    switch(themeMode) {
      case 'dark':
        return "relative pt-20 pb-8 md:pb-12 lg:pb-16 overflow-hidden bg-black text-white";
      case 'light':
        return "relative pt-20 pb-8 md:pb-12 lg:pb-16 overflow-hidden bg-white text-gray-800";
      default:
        return "relative pt-20 pb-8 md:pb-12 lg:pb-16 overflow-hidden bg-white text-gray-800";
    }
  };
  
  return (
    <section className={getSectionClasses()}>
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full">
          <div className="relative w-full h-[70vh] min-h-[550px] max-h-[700px]">
            <div className={getVideoOverlayClass()}></div>
            <video 
              src="/videos/travel-video.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 h-full">
        <div className="h-full flex flex-col justify-center pt-16 md:pt-24 pb-12 lg:pb-16 max-w-4xl">
          {/* 타이틀 & 서브타이틀 */}
          <div className="text-white mb-10 md:mb-16 drop-shadow-lg">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight text-white">
              AI로 계획하는<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-400 drop-shadow-none">당신만의 특별한 여행</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-xl">
              목적지와 일정만 입력하면 AI가 당신만을 위한 최적의 여행 코스를 즉시 추천해 드립니다
            </p>
            
            <div className="mt-6 md:hidden">
              <button 
                onClick={() => {
                  // 기본 여행 정보로 여행 계획 페이지 이동
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  
                  const formattedToday = today.toISOString().split('T')[0];
                  const formattedTomorrow = tomorrow.toISOString().split('T')[0];
                  
                  const params = new URLSearchParams({
                    location: '제주도', // 기본 여행지
                    startDate: formattedToday,
                    endDate: formattedTomorrow
                  });
                  
                  router.push(`/travel/create?${params.toString()}`);
                }}
                className="bg-white text-rose-500 hover:bg-gray-100 font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                여행 계획 시작하기
              </button>
            </div>
          </div>
          
          {/* 검색 패널 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl z-10 search-panel animate-fade-in">
            <div className="p-5 lg:p-6">
              <h2 className="text-xl font-bold text-gray-700 dark:text-white mb-4 hidden md:block">나만의 여행 계획 만들기</h2>
              
              {/* 검색 필드 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 위치 */}
                <div className="md:col-span-4 lg:col-span-1">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-rose-500" />
                    <span>여행지</span>
                  </label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="어디로 여행가세요?"
                  />
                </div>
                
                {/* 체크인/체크아웃 날짜 */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2 text-rose-500" />
                    <span>출발일</span>
                  </label>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2 text-rose-500" />
                    <span>도착일</span>
                  </label>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                
                {/* 인원수 */}
                <div className="lg:col-span-1">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2 flex items-center">
                    <FaUser className="mr-2 text-rose-500" />
                    <span>인원</span>
                  </label>
                  <div className="flex gap-3">
                    <div className="w-1/2">
                      <select 
                        className="w-full px-2 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs border-gray-300 dark:border-gray-600 rounded-lg"
                        value={adults}
                        onChange={(e) => setAdults(e.target.value)}
                        style={{ paddingRight: '25px' }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num}명 성인</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-1/2">
                      <select 
                        className="w-full px-2 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs border-gray-300 dark:border-gray-600 rounded-lg"
                        value={children}
                        onChange={(e) => setChildren(e.target.value)}
                        style={{ paddingRight: '25px' }}
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num}명 어린이</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 검색 버튼 */}
              <div className="mt-5 flex justify-end">
                <button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center border-0 outline-none"
                >
                  <FaSearch className="mr-2" />
                  여행 계획 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 