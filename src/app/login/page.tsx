"use client";

import LoginComponent from "@/components/login/Login";
import Link from "next/link";

const logo = process.env.NEXT_PUBLIC_SERVICE_NAME;

export default function Login() {
  return (
    <div className="overflow-y-scroll">
      <div className="flex items-center justify-around h-dvh">
        <div className="max-md:hidden">
          <Link href="/">
            <h1 className="text-3xl lg:text-5xl xl:text-7xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              {logo}
            </h1>
          </Link>
          <span className="text-sm lg:text-xl xl:text-2xl text-center w-full block text-gray-600 mt-2 tracking-wide">
            최적의 여행 계획을 세워보세요!
          </span>
        </div>
        <LoginComponent />
      </div>
    </div>
  );
}
