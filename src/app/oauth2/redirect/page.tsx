"use client";

import Cookies from "js-cookie";
import { useEffect } from "react";

export default function Redirect() {
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      sessionStorage.setItem("accessToken", accessToken);
    }
  }, []);

  return <div>로그인 처리 중...</div>;
}
