"use client";

import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const banners = [
  {
    id: 1,
    text: "지금 떠나야 할 이유,\n충분하니까",
    image: "/images/course/banner1.jpg",
  },
  {
    id: 2,
    text: "지금 떠나야 할 이유,\n충분하니까",
    image: "/images/course/banner2.jpg",
  },
];

export default function BannerSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
  };

  return (
    <div className="w-full overflow-hidden">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id} className="relative w-full h-[420px]">
            <Image
              src={banner.image}
              alt="배너 이미지"
              fill
              objectFit="cover"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col justify-center items-start text-white text-left px-40">
              <p className="text-5xl font-bold whitespace-pre-line leading-snug border-y-2 py-3 px-6 border-white text-white/80">
                {banner.text}
              </p>
              <span className="text-4xl mt-4"></span>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
