"use client";

import { useEffect, useRef } from "react";
import { geocodeAddress, loadKakaoMapAPI } from "@/utils/kakaoMapUtils";

interface KakaoMapEmbedProps {
  address?: string;
  title?: string;
  height?: number;
}

export default function KakaoMapEmbed({
  address,
  title,
  height = 320,
}: KakaoMapEmbedProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let destroyed = false;

    const init = async () => {
      try {
        await loadKakaoMapAPI();
        if (destroyed || !mapRef.current) return;

        const query = address || title || "서울특별시";
        const { x, y } = await geocodeAddress(query);

        // @ts-ignore - window.kakao 타입 선언이 유틸에 존재
        const kakao = window.kakao;
        const container = mapRef.current;
        const options = {
          center: new kakao.maps.LatLng(Number(y), Number(x)),
          level: 3,
        };
        const map = new kakao.maps.Map(container, options);
        const marker = new kakao.maps.Marker({ position: options.center });
        marker.setMap(map);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    };

    init();
    return () => {
      destroyed = true;
    };
  }, [address, title]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height }}
      className="rounded-xl overflow-hidden border border-gray-200"
    />
  );
}
