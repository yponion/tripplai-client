import Link from "next/link";
import { FaMapMarkedAlt } from "react-icons/fa";

/* before:bg-[url('/images/festival/2.jpg')] 에 동적 url이 들어갈 수 없어서(문자열로 들어가는듯) 하드코딩함.. */

const logo = process.env.NEXT_PUBLIC_SERVICE_NAME;

export default function Festival() {
  return (
    <>
      <Link
        href="/"
        className="fixed left-16 top-10 flex items-center group z-20"
      >
        <FaMapMarkedAlt className="text-rose-500 text-3xl mr-2 transition-transform group-hover:scale-110 duration-300" />
        <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
          {logo}
        </span>
      </Link>
      <div className="w-dvw h-dvh flex items-center justify-center">
        <div className="absolute size-full bg-[url('/images/festival/festival.webp')] bg-cover bg-center bg-no-repeat z-[-2]"></div>
        <div
          className="flex-1 h-full flex items-center justify-center group before:bg-[url('/images/festival/list.webp')] after:bg-gradient-to-b after:from-blue-900/80 after:to-blue-900/40
          hover:before:animate-festival-nav-bg before:content-[''] before:absolute before:h-full before:opacity-0 before:w-1/3 before:transition-all before:bg-cover before:bg-no-repeat before:z-[-1] before:bg-fixed
          hover:after:animate-festival-nav-fg after:content-[''] after:absolute after:top-0 after:opacity-0 after:h-full after:w-1/3 after:transition-all"
        >
          <Link
            href="/festival/list"
            className="size-full flex items-center justify-center z-10"
          >
            <div className="bg-blue-900 rounded-3xl size-52 transition-all duration-1000 group-hover:-translate-y-5 group-hover:bg-transparent flex items-center justify-center flex-col">
              <h1 className="text-white">축제</h1>
              <h1 className="text-white">리스트</h1>
            </div>
          </Link>
        </div>
        <div
          className="flex-1 h-full flex items-center justify-center group before:bg-[url('/images/festival/calendar.webp')] after:bg-gradient-to-b after:from-teal-600/80 after:to-teal-600/40
          before:right-0 hover:before:animate-festival-nav-bg before:content-[''] before:absolute before:h-full before:opacity-0 before:w-1/3 before:transition-all before:bg-cover before:bg-no-repeat before:z-[-1] before:bg-fixed
          hover:after:animate-festival-nav-fg after:content-[''] after:absolute after:opacity-0 after:h-full after:w-1/3 after:transition-all"
        >
          <Link
            href="/festival/calendar"
            className="size-full flex items-center justify-center z-10"
          >
            <div className="bg-teal-600 rounded-3xl size-52 transition-all duration-1000 group-hover:-translate-y-5 group-hover:bg-transparent flex items-center justify-center flex-col">
              <h1 className="text-white">축제</h1>
              <h1 className="text-white">달력</h1>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
