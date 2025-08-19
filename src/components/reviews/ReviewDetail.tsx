"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Review } from "@/types/review";
import { 
  FaStar, 
  FaCalendarAlt, 
  FaEdit, 
  FaTrash, 
  FaHeart, 
  FaRegHeart,
  FaShare,
  FaFlag,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaCamera,
  FaCheck
} from "react-icons/fa";
import { formatDate } from "@/utils/dateUtils";
import { deleteReview } from "@/services/reviewService";
import ShareButtons from "@/components/common/ShareButtons";
import { toast } from "react-hot-toast";

interface ReviewDetailProps {
  review: Review;
}

export default function ReviewDetail({ review }: ReviewDetailProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // 현재 로그인한 사용자 확인
  const currentUser = typeof window !== 'undefined' ? sessionStorage.getItem('nickname') : null;
  const isOwner = currentUser === review.nickname;

  // 이미지 URL 처리
  // 업로드 경로 폴백 제거: 서버는 파일명만 반환하며 정적 경로는 /image/{filename}로 통일

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://3.34.52.239:8080').replace(/\/$/, '');
    if (imageUrl.startsWith('/')) {
      const finalUrl = `${apiUrl}${imageUrl}`;
      if (process.env.NODE_ENV !== 'production') console.log('[ReviewDetail] imageUrl(mapped):', finalUrl);
      return finalUrl;
    }
    const finalUrl = `${apiUrl}/image/${imageUrl}`;
    if (process.env.NODE_ENV !== 'production') console.log('[ReviewDetail] imageUrl(mapped):', finalUrl);
    return finalUrl;
  };

  // 유효한 이미지 필터링
  const validImages = review.images?.filter(img => !imageError[getImageUrl(img.imageUrl)]) || [];

  // 클라이언트 사이드에서만 랜덤 값 설정
  useEffect(() => {
    // 리뷰 ID를 기반으로 일관된 값 생성
    const baseLike = (review.receiptReviewId * 7) % 40 + 10;
    const baseView = (review.receiptReviewId * 13) % 900 + 100;
    setLikeCount(baseLike);
    setViewCount(baseView);
    setImageError({});
  }, [review.receiptReviewId, review.images]);

  const handleImageError = (imageSrc: string) => {
    setImageError(prev => ({ ...prev, [imageSrc]: true }));
  };

  const handleEdit = () => {
    router.push(`/reviews/${review.receiptReviewId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;
    
    setIsDeleting(true);
    try {
      await deleteReview(review.receiptReviewId);
      toast.success('리뷰가 삭제되었습니다.');
      router.push('/reviews');
    } catch (error) {
      console.error('삭제 실패:', error);
      toast.error('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast.success(isLiked ? '좋아요를 취소했습니다.' : '이 리뷰가 도움이 되었습니다!');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success('링크가 복사되었습니다!');
  };

  const handleReport = () => {
    if (!reportReason) {
      toast.error('신고 사유를 선택해주세요.');
      return;
    }
    toast.success('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
    setShowReportModal(false);
    setReportReason("");
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  return (
    <>
      <article className="max-w-6xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-4">{review.title}</h1>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 text-sm">
              {/* 평점 */}
              <div className="flex items-center gap-1">
                <FaStar className="text-red-500" />
                <span className="font-medium">{review.rating.toFixed(1)}</span>
              </div>
              
              {/* 좋아요 수 */}
              <div className="flex items-center gap-1">
                <FaHeart className="text-gray-400" />
                <span>{likeCount}명이 도움이 되었다고 했어요</span>
              </div>
              
              {/* 작성일 */}
              <div className="flex items-center gap-1 text-gray-500">
                <FaCalendarAlt />
                <span>{formatDate(review.createdAt)}</span>
              </div>
            </div>
            
            {/* 액션 버튼들 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaShare />
                <span className="hidden sm:inline">공유</span>
              </button>
              
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked ? 'text-red-500' : 'hover:bg-gray-50'
                }`}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                <span className="hidden sm:inline">도움이 돼요</span>
              </button>
              
              {!isOwner && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaFlag />
                  <span className="hidden sm:inline">신고</span>
                </button>
              )}
              
              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaEdit />
                    <span>수정</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <FaTrash />
                    <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 이미지 갤러리 */}
        {validImages.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
              {/* 메인 이미지 */}
              <div 
                className="relative aspect-[4/3] cursor-pointer"
                onClick={() => setShowLightbox(true)}
              >
                <Image
                  src={getImageUrl(validImages[selectedImageIndex].imageUrl)}
                  alt={review.title}
                  fill
                  className="object-cover hover:brightness-95 transition-all"
                  onError={() => { const key = validImages[selectedImageIndex].imageUrl; const u = getImageUrl(key); handleImageError(u); if (process.env.NODE_ENV !== 'production') console.error('[ReviewDetail] image onError:', u); }}
                  priority
                  unoptimized
                />
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <FaCamera />
                  <span>{selectedImageIndex + 1} / {validImages.length}</span>
                </div>
              </div>
              
              {/* 썸네일 그리드 */}
              {validImages.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {validImages.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] cursor-pointer"
                      onClick={() => {
                        if (index < 3) {
                          setSelectedImageIndex(index + 1);
                        } else {
                          setShowLightbox(true);
                        }
                      }}
                    >
                      <Image
                        src={getImageUrl(image.imageUrl)}
                        alt={`${review.title} ${index + 2}`}
                        fill
                        className="object-cover hover:brightness-95 transition-all"
                        onError={() => { const key = image.imageUrl; const u = getImageUrl(key); handleImageError(u); if (process.env.NODE_ENV !== 'production') console.error('[ReviewDetail] thumb onError:', u); }}
                        unoptimized
                      />
                      {index === 3 && validImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                          <span className="text-xl font-medium">+{validImages.length - 5}장</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 컨텐츠 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2">
            {/* 작성자 정보 */}
            <div className="flex items-center gap-4 pb-8 border-b">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                {review.nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{review.nickname}</h3>
                <p className="text-gray-500 text-sm">여행 리뷰어</p>
              </div>
            </div>
            
            {/* 리뷰 내용 */}
            <div className="py-8 border-b">
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-line leading-relaxed text-gray-700">
                  {review.content}
                </p>
              </div>
            </div>
            
            {/* 댓글 섹션 (UI만 구현) */}
            <div className="py-8">
              <h3 className="text-xl font-semibold mb-4">댓글</h3>
              <div className="rounded-lg p-6 text-center text-gray-500 border border-gray-100">
                <p>아직 댓글이 없습니다.</p>
                <p className="text-sm mt-1">첫 번째 댓글을 남겨보세요!</p>
              </div>
            </div>
          </div>
          
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* 평점 상세 */}
              <div className="rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold mb-4">평점 상세</h3>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold">{review.rating.toFixed(1)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg ${
                            star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {review.rating >= 4.5 ? '훌륭해요' : 
                       review.rating >= 4 ? '매우 좋아요' :
                       review.rating >= 3 ? '좋아요' : '보통이에요'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 리뷰 통계 */}
              <div className="rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold mb-4">리뷰 통계</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">조회수</span>
                    <span className="font-medium">{viewCount}회</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">도움이 됐어요</span>
                    <span className="font-medium">{likeCount}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">사진</span>
                    <span className="font-medium">{validImages.length}장</span>
                  </div>
                </div>
              </div>
              
              {/* 작성자의 다른 리뷰 (UI만) */}
              <div className="rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold mb-4">작성자의 다른 리뷰</h3>
                <p className="text-sm text-gray-500">
                  {review.nickname}님의 다른 리뷰를 준비 중입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* 이미지 라이트박스 */}
      {showLightbox && validImages.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
          >
            <FaTimes size={24} />
          </button>
          
          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
              >
                <FaChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
              >
                <FaChevronRight size={24} />
              </button>
            </>
          )}
          
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Image
              src={getImageUrl(validImages[selectedImageIndex].imageUrl)}
              alt={review.title}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
            {selectedImageIndex + 1} / {validImages.length}
          </div>
        </div>
      )}

      {/* 공유 모달 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">공유하기</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isCopied ? <FaCheck className="text-green-500" /> : <FaShare />}
                <span>{isCopied ? '링크가 복사되었습니다!' : '링크 복사하기'}</span>
              </button>
              
              <div className="flex justify-center gap-4">
                <ShareButtons
                  title={review.title}
                  description={review.content.substring(0, 100) + '...'}
                  url={window.location.href}
                  location=""
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 신고 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">리뷰 신고하기</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-3">
              {['부적절한 내용', '스팸/광고', '개인정보 노출', '허위 정보', '기타'].map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="text-red-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReport}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
