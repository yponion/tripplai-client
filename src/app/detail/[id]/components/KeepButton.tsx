"use client";

import { keepService } from "@/services/keepService";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function KeepButton({ contentId, children }: { contentId: string; children: React.ReactNode }) {
  const [isKeep, setIsKeep] = useState(false);

  useEffect(() => {
    keepService.keepList().then((res) => {
      setIsKeep(res.data.list.some(({ contentId: id }: { contentId: string }) => id === contentId));
    });
  }, [contentId]);

  const handleKeep = () => {
    if (!contentId) return;

    if (!sessionStorage.getItem("accessToken")) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (isKeep) {
      keepService.unkeep(contentId).then((res) => {
        if (res.data.code === "SU") {
          setIsKeep(!isKeep);
        }
      });
    } else {
      keepService.keep(contentId).then((res) => {
        if (res.data.code === "SU") {
          setIsKeep(!isKeep);
        }
      });
    }
  };

  return (
    <button
      aria-label="찜하기"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 text-rose-600 hover:bg-white"
      onClick={handleKeep}
    >
      {isKeep ? <FaHeart /> : <FaRegHeart />}
      {children}
    </button>
  );
}
