"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import Button from "@/components/common/Button";
import { gatheringService } from "@/services/gatheringService";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Palette,
  Type,
  X,
  Upload,
  FileText,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Eye,
  Save,
  Settings,
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
}

export default function GatheringCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [maxCount, setMaxCount] = useState<number>(6);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("여행");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const canSubmit = title.trim() && content.trim();

  // Rich text editor modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };

  // Image upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => ({
      id: Date.now() + Math.random().toString(),
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    try {
      // Here you would upload images first and get their URLs
      // const uploadedImageUrls = await uploadImages(images);

      const gatheringData = {
        title,
        content,
        maxCount,
        location,
        budget,
        startDate,
        endDate,
        category,
        tags,
        // images: uploadedImageUrls
      };

      console.log("전송할 데이터:", gatheringData);
      const post = await gatheringService.create(gatheringData);
      console.log("서버 응답:", post);

      alert("모집글 작성이 완료되었습니다!");

      if (post?.id) {
        router.push(`/gathering/${post.id}`);
      } else {
        // id가 없으면 목록 페이지로
        router.push("/gathering");
      }
    } catch (error: any) {
      console.error("Error creating gathering:", error);

      // 401이나 302 에러는 인증 문제
      if (error.response?.status === 401 || error.response?.status === 302) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        router.push("/login");
      } else {
        alert("모집글 작성에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    모집글 작성
                  </h1>
                  <p className="text-gray-600">멋진 여행 동행을 찾아보세요</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-0 outline-none"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {previewMode ? "편집" : "미리보기"}
                  </span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (title.length > 0 ? 25 : 0) +
                      (content.length > 0 ? 50 : 0) +
                      (location.length > 0 ? 25 : 0),
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* Title Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Type className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    제목 및 기본 정보
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      제목
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="예) 5월 말 부산 1박2일 같이 가실 분 🌊"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      maxLength={80}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        매력적인 제목으로 더 많은 관심을 받아보세요
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        <span
                          className={
                            title.length > 60
                              ? "text-orange-500"
                              : "text-gray-600"
                          }
                        >
                          {title.length}
                        </span>
                        /80
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        카테고리
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                      >
                        <option value="여행">🏖️ 여행</option>
                        <option value="문화">🎭 문화</option>
                        <option value="스포츠">⚽ 스포츠</option>
                        <option value="음식">🍽️ 음식</option>
                        <option value="스터디">📚 스터디</option>
                        <option value="기타">🎯 기타</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        모집 인원
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={30}
                        value={maxCount}
                        onChange={(e) =>
                          setMaxCount(Number(e.target.value) || 2)
                        }
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        위치
                      </label>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="예) 부산"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Editor Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bold className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      상세 내용
                    </h2>
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    <span
                      className={
                        content.length > 1800
                          ? "text-orange-500"
                          : "text-gray-600"
                      }
                    >
                      {content.length}
                    </span>
                    /2000
                  </div>
                </div>
                {!previewMode ? (
                  <div className="relative">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      placeholder="일정, 예산, 선호 스타일 등을 자세히 적어주세요. 사진도 추가할 수 있어요!"
                      className="custom-quill"
                      style={{ minHeight: "300px" }}
                    />
                  </div>
                ) : (
                  <div
                    className="prose max-w-none border-2 border-gray-200 rounded-xl p-6 min-h-[300px] bg-gray-50"
                    dangerouslySetInnerHTML={{
                      __html:
                        content ||
                        '<p class="text-gray-400">내용을 입력해주세요...</p>',
                    }}
                  />
                )}
              </div>

              {/* Image Upload Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Image className="w-4 h-4 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    사진 업로드
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({images.length}/5)
                  </span>
                </div>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {isDragActive
                      ? "파일을 여기에 드롭하세요"
                      : "사진을 드래그하거나 클릭하여 업로드"}
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, GIF, WEBP (최대 5MB, 5개까지)
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt="Upload preview"
                          className="w-full h-24 object-cover rounded-lg shadow-md"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      고급 설정
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        시작 날짜
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        종료 날짜
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        예상 예산
                      </label>
                      <input
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="예) 1인 15만원"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        태그 추가
                      </label>
                      <div className="flex space-x-2">
                        <input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && (e.preventDefault(), addTag())
                          }
                          placeholder="태그 입력"
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                        />
                        <button
                          onClick={addTag}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          추가
                        </button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              <span>{tag}</span>
                              <button
                                onClick={() => removeTag(tag)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    작성 현황
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">제목</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          title.length > 0 ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {title.length > 0 ? "완료" : "미완료"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">내용</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          content.length > 0
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {content.length > 0 ? "완료" : "미완료"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">사진</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {images.length}개
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600">모집인원</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {maxCount}명
                      </span>
                    </div>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      작성 팁
                    </h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>구체적인 일정과 예산을 명시하세요</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>사진을 추가하면 더 많은 관심을 받을 수 있어요</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>
                        개인 연락처는 댓글 대신 개별 메시지로 교환하세요
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>태그를 활용해 더 쉽게 검색될 수 있어요</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                  <div className="space-y-4">
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={!canSubmit || submitting}
                      fullWidth
                      className="h-12 text-lg font-semibold shadow-lg"
                    >
                      {submitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>등록 중...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="w-5 h-5" />
                          <span>게시글 등록</span>
                        </div>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      fullWidth
                      className="h-12 text-lg font-semibold"
                    >
                      취소
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                      작성하신 글은 검토 후 게시됩니다.
                      <br />
                      문의사항은 고객센터로 연락해주세요.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
