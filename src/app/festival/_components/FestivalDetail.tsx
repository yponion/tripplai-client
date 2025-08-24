import { DetailCommonResponse, DetailImageResponse, DetailInfoResponse, DetailIntroResponse } from "@/types/festival";
import getDetailCommon from "../_services/getDetailCommon";
import getDetailIntro from "../_services/getDetailIntro";
import getDetailInfo from "../_services/getDetailInfo";
import getDetailImage from "../_services/getDetailImage";
import ImageSwiper from "./ImageSwiper";

interface Props {
  id: string;
}

export default async function FestivalDetail({ id }: Props) {
  const [detailCommonResponse, detailIntroResponse, detailInfoResponse, detailImageResponse]: [
    DetailCommonResponse,
    DetailIntroResponse,
    DetailInfoResponse,
    DetailImageResponse
  ] = await Promise.all([getDetailCommon(id), getDetailIntro(id), getDetailInfo(id), getDetailImage(id)]);

  const { title, homepage } = detailCommonResponse.response.body.items.item[0];
  const {
    playtime,
    eventstartdate,
    eventenddate,
    eventplace,
    spendtimefestival,
    usetimefestival,
    sponsor1,
    sponsor1tel,
    sponsor2,
    sponsor2tel,
  } = detailIntroResponse.response.body.items.item[0];
  const items = detailInfoResponse?.response?.body?.items?.item ?? [];
  const infos = items.map((item) => ({ infoname: item?.infoname ?? "", infotext: item?.infotext ?? "" }));
  const images = detailImageResponse.response.body.items.item ?? [];

  const setTitleContent = (title: string, content: string) => {
    if (!content) return null;
    return (
      <div key={title} className="shadow-md border border-gray-200 rounded-xl p-4 mb-4">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <p dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  };

  return (
    <div className="size-full p-3">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-4 border-pink-300 inline-block pb-1">
        🎉 {title}
      </h1>
      <ImageSwiper images={images} />
      {infos.map((info) => setTitleContent(info.infoname, info.infotext))}
      {eventstartdate && eventenddate ? (
        <div className="shadow-md border border-gray-200 rounded-xl p-4 mb-4">
          <h4 className="text-lg font-semibold mb-2">기간</h4>
          <p>
            {eventstartdate} ~ {eventenddate}
          </p>
        </div>
      ) : null}
      {setTitleContent("시간", playtime)}
      {setTitleContent("행사 장소", eventplace)}
      {setTitleContent("관람 소요 시간", spendtimefestival)}
      {setTitleContent("이용 요금", usetimefestival)}
      {homepage ? (
        <div className="shadow-md border border-gray-200 rounded-xl p-4 mb-4">
          <h4 className="text-lg font-semibold mb-2">홈페이지</h4>
          <p dangerouslySetInnerHTML={{ __html: homepage! }} className="underline text-blue-500" />
        </div>
      ) : null}
      {setTitleContent("주최", sponsor1)}
      {setTitleContent("주최 연락처", sponsor1tel)}
      {setTitleContent("주관", sponsor2)}
      {setTitleContent("주관 연락처", sponsor2tel)}
    </div>
  );
}
