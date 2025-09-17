"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaMapMarkedAlt } from "react-icons/fa";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import clsx from "clsx";
import { useState } from "react";

const logo = process.env.NEXT_PUBLIC_SERVICE_NAME;

const items = [
  { titile: "축제리스트", href: "/festival/list" },
  { titile: "축제달력", href: "/festival/calendar" },
];

export default function FestivalNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full h-16 px-5 py-3 shadow-sm bg-white z-50 flex gap-5 items-center justify-between md:justify-normal">
      {/* 로고 */}
      <Link href="/" className="flex items-center group">
        <FaMapMarkedAlt className="text-rose-500 text-3xl mr-2 transition-transform group-hover:scale-110 duration-300" />
        <span className="text-nowrap text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
          {logo}
        </span>
      </Link>

      {/* 데스크탑 nav */}
      <nav className="hidden md:flex items-center">
        <ul className="flex list-none m-0 p-0 gap-5">
          {items.map((item) => (
            <li
              key={item.titile}
              className="text-xl font-medium transition-all hover:text-rose-500"
            >
              <Link
                href={item.href}
                className={clsx("decoration-rose-500 underline-offset-4", {
                  underline: pathname === item.href,
                })}
              >
                {item.titile}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="block md:hidden text-3xl text-rose-500 focus:outline-none bg-transparent border-none"
        aria-label="메뉴 열기"
      >
        {open ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
      </button>

      {/* 모바일 드롭다운 메뉴 */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden animate-fadeIn px-5 py-4">
          <ul className="flex flex-col gap-4 list-none p-0">
            {items.map((item) => (
              <li key={item.titile}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={clsx("text-lg block font-medium", {
                    "text-rose-500 underline": pathname === item.href,
                  })}
                >
                  {item.titile}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
