"use client";

import Layout from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { infoApi } from "@/services/api";

// 임시 사용자 정보
const mockData = {
  code: "SU",
  message: "Success",
  id: 9007199254740991,
  email: "test01@email.com",
  nickname: "닉네임",
  phoneNumber: "01012345678",
  provider: "provider",
  providerId: "providerId",
  imageUrl: "",
  customerKey: "customerKey",
  withdrawn: true,
};

// 스키마 정의
const schema = z.object({
  email: z.string().email({ message: "유효한 이메일을 입력해주세요" }),
  password: z.string().min(6, { message: "비밀번호는 최소 6자 이상" }),
  nickname: z.string().min(2, { message: "닉네임은 최소 2자 이상" }),
  phoneNumber: z.string().regex(/^010\d{8}$/, { message: "잘못된 전화번호 형식" }),
  ticket: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function Info() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function fetchUser() {
      const res = await infoApi.getInfo();
      reset({
        nickname: res.nickname,
        email: res.email,
        phoneNumber: res.phoneNumber,
        ticket: res.ticket,
      });
    }
    fetchUser();
  }, [reset]);

  const onSubmit = (data: FormData) => {
    console.log("입력 데이터:", data);
    console.log("선택된 이미지:", imageFile);
    // 서버 전송 로직 추가 가능
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="mt-36 px-10 pb-20 lg:px-[20%]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">개인 정보</h2>

          {/* 프로필 이미지 */}
          <div className="text-center">
            <div className="relative inline-block">
              {preview ? (
                <img
                  src={preview}
                  alt="프로필 이미지"
                  className="w-28 h-28 rounded-full object-cover border border-gray-300 shadow-sm"
                />
              ) : (
                <div className="size-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-sm border border-gray-300 shadow-sm">
                  이미지 없음
                </div>
              )}

              <label
                htmlFor="image-upload"
                className="absolute bottom-0 right-0 size-9 bg-pink-500 text-white p-1 rounded-full cursor-pointer hover:bg-pink-600 transition"
              >
                ✏️
              </label>
              <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              readOnly
              {...register("email")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-slate-100 dark:bg-slate-500 focus:outline-none cursor-not-allowed"
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* 닉네임 */}
          <div>
            <label htmlFor="nickname" className="block mb-1 text-sm font-medium text-gray-700">
              닉네임
            </label>
            <input
              id="nickname"
              {...register("nickname")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
              placeholder="닉네임을 입력하세요"
            />
            {errors.nickname && <p className="text-sm text-red-500 mt-1">{errors.nickname.message}</p>}
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="phoneNumber" className="block mb-1 text-sm font-medium text-gray-700">
              전화번호
            </label>
            <input
              id="phoneNumber"
              {...register("phoneNumber")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
              placeholder="예: 01012345678"
            />
            {errors.phoneNumber && <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              새 비밀번호
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:outline-none"
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* 디켓 */}
          <div>
            <label htmlFor="ticket" className="block mb-1 text-sm font-medium text-gray-700">
              티켓
            </label>
            <input
              id="ticket"
              type="text"
              readOnly
              {...register("ticket")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-slate-100 dark:bg-slate-500 focus:outline-none cursor-not-allowed"
            />
            {errors.ticket && <p className="text-sm text-red-500 mt-1">{errors.ticket.message}</p>}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition-all border-none"
          >
            정보 수정하기
          </button>
        </form>
      </div>
    </Layout>
  );
}
