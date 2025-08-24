"use client";

import Layout from "@/components/Layout";
import useThemeMode from "@/hooks/useDarkMode";
import Course from "./_components/Course";
import GoodPrice from "./_components/GoodPirce";
import Event from "./_components/Event";
import { useEffect, useState } from "react";
import { tour } from "@/services/tour";
import { AreaBasedList, AreaBasedListResponse, AreaCodeResponse, CountResponse } from "@/types/tourInfo";
import getCurrentWeekNumber from "@/utils/getCurrentWeekNumber";
import { getRandomInt } from "@/utils/getRandomInt";

export default function RegionHighlights() {
  const [courseList, setCourseList] = useState<AreaBasedList[]>([]); // contentTypeId 25
  const [foodList, setFoodList] = useState<AreaBasedList[]>([]); // contentTypeId 39
  const [eventList, setEventList] = useState<AreaBasedList[]>([]); // contentTypeId 15
  const [area, setArea] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const displayCount = 3;

      const areaCodeResponse: AreaCodeResponse = await tour.getAreaCode();
      const areaCode = areaCodeResponse.response.body.items.item;
      const weekNumber = getCurrentWeekNumber();
      const index = weekNumber % areaCode.length;

      setArea(areaCode[index].name);

      // @ts-ignore
      // 여행 코스 (contentTypeId: 25)
      const courseCountRes: CountResponse = await tour.getAreaBasedList({
        areaCode: areaCode[index].code,
        contentTypeId: "25",
        arrange: "O",
      });
      const courseTotalCount = courseCountRes.response.body.items.item[0].totalCnt;
      const randomCoursePage = getRandomInt(0, Math.max(1, Math.floor(courseTotalCount / displayCount)));
      const courseRes: AreaBasedListResponse = await tour.getAreaBasedList({
        numOfRows: displayCount,
        pageNo: randomCoursePage,
        areaCode: areaCode[index].code,
        contentTypeId: "25",
        arrange: "O",
      });
      setCourseList(courseRes.response.body.items.item);

      // @ts-ignore
      // 음식점/가성비 업소 (contentTypeId: 39)
      const foodCountRes: CountResponse = await tour.getAreaBasedList({
        areaCode: areaCode[index].code,
        contentTypeId: "39",
        arrange: "O",
      });
      const foodTotalCount = foodCountRes.response.body.items.item[0].totalCnt;
      const randomFoodPage = getRandomInt(0, Math.max(1, Math.floor(foodTotalCount / displayCount)));
      const foodRes: AreaBasedListResponse = await tour.getAreaBasedList({
        numOfRows: displayCount,
        pageNo: randomFoodPage,
        areaCode: areaCode[index].code,
        contentTypeId: "39",
        arrange: "O",
      });
      setFoodList(foodRes.response.body.items.item);

      // @ts-ignore
      // 지역 이벤트/행사 (contentTypeId: 15)
      const eventCountRes: CountResponse = await tour.getAreaBasedList({
        areaCode: areaCode[index].code,
        contentTypeId: "15",
        arrange: "O",
      });
      const eventTotalCount = eventCountRes.response.body.items.item[0].totalCnt;
      const randomEventPage = getRandomInt(0, Math.max(1, Math.floor(eventTotalCount / displayCount)));
      const eventRes: AreaBasedListResponse = await tour.getAreaBasedList({
        numOfRows: displayCount,
        pageNo: randomEventPage,
        areaCode: areaCode[index].code,
        contentTypeId: "15",
        arrange: "O",
      });
      setEventList(eventRes.response.body.items.item);
    };

    fetch();
  }, []);

  const { themeMode } = useThemeMode();

  const backgroundGradient = {
    original: "from-pink-50 to-white",
    light: "from-blue-50 to-white",
    dark: "from-gray-900 to-gray-800",
  };

  const containerClassName = `py-16 min-h-screen relative overflow-hidden bg-gradient-to-b ${backgroundGradient[themeMode]}`;

  return (
    <Layout>
      <div className={containerClassName}>
        <Course areaBasedList={courseList} area={area} />
        <GoodPrice areaBasedList={foodList} area={area} />
        <Event areaBasedList={eventList} area={area} />
      </div>
    </Layout>
  );
}
