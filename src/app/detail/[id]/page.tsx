import getDetailCommon from "@/app/festival/_services/getDetailCommon";
import NavSection from "@/components/common/NavSection";
import Image from "next/image";
import { FaMapMarkerAlt, FaPhone, FaRegHeart } from "react-icons/fa";

type Params = Promise<{ id: string }>;

export default async function DetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const detailCommonResponse = await getDetailCommon(id);
  const { addr1, addr2, firstimage, homepage, overview, tel, telname, title } =
    detailCommonResponse.response.body.items.item[0];

  return (
    <>
      <NavSection />
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-48 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {addr1 && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  <FaMapMarkerAlt className="text-rose-500" />
                  {addr1}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {firstimage ? (
                <div className="overflow-hidden rounded-2xl shadow-lg border border-pink-100">
                  <Image
                    src={firstimage}
                    alt={title}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="h-72 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
                  이미지가 없습니다
                </div>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  aria-label="찜하기"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 transition-colors shadow-sm"
                >
                  <FaRegHeart className="text-rose-500" />
                  <span className="text-sm font-medium">찜하기</span>
                </button>
              </div>
            </div>

            <div>
              {(addr1 || tel || homepage) && (
                <section className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>
                  <ul className="space-y-3 text-gray-700">
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
                        <span className="mt-1 text-gray-500">🔗</span>
                        <p dangerouslySetInnerHTML={{ __html: homepage! }} className="text-rose-600 hover:underline" />
                      </li>
                    )}
                  </ul>
                </section>
              )}

              {overview && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">소개</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{overview}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
