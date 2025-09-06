import getDetailCommon from "@/app/festival/_services/getDetailCommon";
import NavSection from "@/components/common/NavSection";
import Image from "next/image";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaRegHeart,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  FaSun,
  FaCloud,
  FaCloudSun,
  FaCloudShowersHeavy,
  FaCloudRain,
  FaSnowflake,
  FaUmbrella,
} from "react-icons/fa";
import KakaoMapEmbed from "@/components/common/KakaoMapEmbed";
import { tour } from "@/services/tour";
import type {
  AreaBasedList,
  AreaBasedListResponse,
  AreaCodeResponse,
} from "@/types/tourInfo";
import {
  getShortTermForecast,
  getBestTravelSeason,
} from "@/services/weatherService";

type Params = Promise<{ id: string }>;

export default async function DetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const detailCommonResponse = await getDetailCommon(id);
  const { addr1, addr2, firstimage, homepage, overview, tel, telname, title } =
    detailCommonResponse.response.body.items.item[0];

  // 관련 코스 추천 (contentTypeId: 25)
  let relatedCourses: AreaBasedList[] = [];
  // 오른쪽 사이드에 노출할 주변 맛집 추천 (contentTypeId: 39)
  let nearbyFoods: AreaBasedList[] = [];
  try {
    const areaCodesRes: AreaCodeResponse = await tour.getAreaCode();
    const areaItems = areaCodesRes.response.body.items.item;
    const address = addr1 || "";
    const matched = areaItems.find((a) => address.includes(a.name));

    const paramsForCourses: Record<string, string> = {
      contentTypeId: "25",
      arrange: "O",
      numOfRows: "6",
      pageNo: "1",
    };
    if (matched) paramsForCourses["areaCode"] = matched.code;

    const coursesRes: AreaBasedListResponse = await tour.getAreaBasedList(
      paramsForCourses
    );
    const items = coursesRes.response.body.items.item || [];
    relatedCourses = items.filter((it) => it.firstimage).slice(0, 6);

    // 주변 맛집 추천 (compact)
    const foodParams: Record<string, string> = {
      contentTypeId: "39",
      arrange: "O",
      numOfRows: "3",
      pageNo: "1",
    };
    if (matched) foodParams["areaCode"] = matched.code;
    const foodsRes: AreaBasedListResponse = await tour.getAreaBasedList(
      foodParams
    );
    const foodItems = foodsRes.response.body.items.item || [];
    nearbyFoods = foodItems.filter((it) => it.firstimage).slice(0, 3);
  } catch (e) {
    console.error("related courses fetch error", e);
  }

  // 날씨/최적시기 위젯 데이터
  const regionNameForWeather = addr1 ? addr1.split(" ")[0] : title;
  const forecast = await getShortTermForecast(regionNameForWeather);
  const seasonInfo = getBestTravelSeason(
    `${title} ${addr1 ?? ""}`,
    overview ?? ""
  );

  const getWeatherIcon = (sky: string, pty: string) => {
    if (pty && pty !== "없음") {
      if (pty.includes("눈")) return <FaSnowflake className="text-cyan-400" />;
      if (pty.includes("비")) return <FaCloudRain className="text-blue-500" />;
      return <FaCloudShowersHeavy className="text-blue-500" />;
    }
    if (sky === "맑음") return <FaSun className="text-yellow-400" />;
    if (sky === "구름조금") return <FaCloudSun className="text-amber-300" />;
    if (sky === "구름많음") return <FaCloud className="text-gray-400" />;
    if (sky === "흐림") return <FaCloud className="text-gray-500" />;
    return <FaCloud className="text-gray-400" />;
  };

  return (
    <>
      <NavSection />
      <div className="bg-gradient-to-b from-pink-50 to-white pt-32 md:pt-40 pb-24 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero */}
          <section className="relative rounded-3xl overflow-hidden border border-pink-100 shadow-lg">
            <div className="relative h-64 md:h-96">
              {firstimage ? (
                <Image
                  src={firstimage}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                  이미지가 없습니다
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  {title}
                </h1>
                {addr1 && (
                  <span className="inline-flex items-center gap-2 w-fit bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm">
                    <FaMapMarkerAlt className="text-rose-500" />
                    {addr1}
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <a
                  href="#map"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 text-[#1E1E1E] hover:bg-white"
                  aria-label="지도 보기"
                >
                  <Image
                    src="/icons/kakao-talk.png"
                    alt="kakao map"
                    width={18}
                    height={18}
                  />
                  <span className="text-sm font-medium hidden md:inline">
                    지도
                  </span>
                </a>
                <button
                  type="button"
                  aria-label="찜하기"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 text-rose-600 hover:bg-white"
                >
                  <FaRegHeart />
                  <span className="text-sm font-medium hidden md:inline">
                    찜하기
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Overview */}
            <div className="md:col-span-2 space-y-6">
              {overview && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    소개
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {overview}
                  </p>
                </section>
              )}

              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  주변 지역 명소 추천
                </h2>
                {relatedCourses.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    추천 명소를 불러오지 못했습니다.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {relatedCourses.map((course) => (
                      <Link
                        key={course.contentid}
                        href={`/detail/${course.contentid}`}
                        className="group rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="relative h-40">
                          <Image
                            src={course.firstimage}
                            alt={course.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover group-hover:scale-[1.02] transition-transform"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {course.title}
                          </h3>
                          {course.addr1 && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                              {course.addr1}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Map moved to left column */}
              <section
                id="map"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
              >
                <h2 className="sr-only">지도</h2>
                <KakaoMapEmbed address={addr1} title={title} height={360} />
              </section>
            </div>

            {/* Right: Info + Weather */}
            <aside className="md:col-span-1 space-y-6">
              {(addr1 || tel || homepage) && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:sticky md:top-28">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    기본 정보
                  </h2>
                  <ul className="space-y-4 text-gray-700">
                    {addr1 && (
                      <li className="flex items-start gap-3">
                        <FaMapMarkerAlt className="mt-1 text-rose-500" />
                        <span>
                          {addr1}
                          {addr2 ? ` ${addr2}` : ""}
                        </span>
                      </li>
                    )}
                    {tel && (
                      <li className="flex items-start gap-3">
                        <FaPhone className="mt-1 text-gray-500" />
                        <span>
                          {tel}
                          {telname ? ` (${telname})` : ""}
                        </span>
                      </li>
                    )}
                    {homepage && (
                      <li className="flex items-start gap-3">
                        <FaExternalLinkAlt className="mt-1 text-gray-500" />
                        <p
                          dangerouslySetInnerHTML={{ __html: homepage! }}
                          className="text-rose-600 hover:underline"
                        />
                      </li>
                    )}
                  </ul>
                </section>
              )}

              {/* Weather and best season widget */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  오늘의 날씨 & 최적 여행 시기
                </h2>
                {forecast.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    날씨 정보를 불러오지 못했습니다.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {forecast.slice(0, 6).map((f) => (
                      <div
                        key={`${f.date}-${f.time}`}
                        className="rounded-lg border border-gray-200 p-3 text-center"
                      >
                        <div className="text-xs text-gray-500">{`${f.time.slice(
                          0,
                          2
                        )}시`}</div>
                        <div className="mt-1 flex items-center justify-center text-lg">
                          {getWeatherIcon(f.sky, f.pty)}
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {f.tmp}°C
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                          <FaUmbrella className="text-blue-500" />
                          {f.pop}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 rounded-lg border border-gray-200 p-3">
                  <div className="text-sm text-gray-500">최적 여행 시기</div>
                  <div className="mt-1 text-base font-semibold">
                    {seasonInfo.bestSeason} ({seasonInfo.months})
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    {seasonInfo.conditions}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    준비물: {seasonInfo.preparation}
                  </div>
                </div>
              </section>

              {/* 주변 맛집 추천 (Compact) */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  주변 맛집 추천
                </h2>
                {nearbyFoods.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    맛집 정보를 불러오지 못했습니다.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {nearbyFoods.map((food) => (
                      <Link
                        key={food.contentid}
                        href={`/detail/${food.contentid}`}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 hover:shadow-sm transition-shadow"
                      >
                        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={food.firstimage}
                            alt={food.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {food.title}
                          </div>
                          {food.addr1 && (
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {food.addr1}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
