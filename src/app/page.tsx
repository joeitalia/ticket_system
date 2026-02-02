"use client"

import DefaultLayout from "@/components/Layout/DefaultLayout"
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Home() {
  return (
    <DefaultLayout>
      <div className="max-w-8/12! mx-auto shadow-lg rounded-lg overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          slidesPerView={1}
          autoplay={{ delay: 3000 }}
          loop={true}
        >
          <SwiperSlide className="w-full!">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image src="/images/6a423af7-7083-406b-93e0-fde2877803e4.jpeg" alt="Slide 1" width={800} height={400} className="w-full" />
            </div>
          </SwiperSlide>

          <SwiperSlide className="w-full!">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image src="/images/61f8a7ce-fd9f-4cb2-aa6c-deeb6bd2de00.jpeg" alt="Slide 2" width={800} height={400} className="w-full" />
            </div>
          </SwiperSlide>

          <SwiperSlide className="w-full!">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image src="/images/67ccfc64-8e5d-4c80-a806-5033f2df3742.jpeg" alt="Slide 3" width={800} height={400} className="w-full" />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </DefaultLayout>
  );
}
