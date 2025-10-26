"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/common/Button";
import { gatheringService, GatheringPost } from "@/services/gatheringService";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/utils/dateUtils";
import { Heart, Users, UserCheck, UserX } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useToast } from "@/hooks/useToast";

export default function GatheringDetailPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const id = Number(params.id);
  const [post, setPost] = useState<GatheringPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [showApplicants, setShowApplicants] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [selectedEnrollId, setSelectedEnrollId] = useState<number | null>(null);
  
  // Toast hook
  const toast = useToast();

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        // 게시글 정보 가져오기
        const p = await gatheringService.get(id);
        setPost(p);
        setTitle(p.title);
        setContent(p.content);

        // 참여자 목록 가져오기
        try {
          const participantsList = await gatheringService.getParticipants(id);
          setParticipants(participantsList);

          // 현재 사용자가 참여중인지 확인
          if (currentMemberId) {
            const isInGroup = participantsList.some(
              (p: any) =>
                p.enrollId === currentMemberId || p.id === currentMemberId
            );
            setIsParticipating(isInGroup);
          }
        } catch (error) {
          console.error("참여자 목록 조회 실패:", error);
        }
      } catch (error) {
        console.error("게시글 조회 실패:", error);
      }
    };
    loadData();
  }, [id, currentMemberId]);

  useEffect(() => {
    try {
      const accessToken =
        typeof window !== "undefined"
          ? sessionStorage.getItem("accessToken")
          : null;
      if (!accessToken) return;
      const payload = JSON.parse(
        atob((accessToken || "").split(".")[1] || "e30=")
      );
      const subStr = payload?.sub;
      if (typeof subStr === "string") {
        const subObj = JSON.parse(subStr);
        const memberId = Number(subObj?.id || 0);
        if (memberId) setCurrentMemberId(memberId);
      }
    } catch {}
  }, []);

  const handleUpdate = async () => {
    if (!post || saving) return;
    setSaving(true);
    const updated = await gatheringService.update(post.id, { title, content });
    setPost(updated);
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!post || deleting) return;
    setDeleting(true);
    try {
      await gatheringService.remove(post.id);
      setShowDeleteModal(false);
      toast.success("모집글이 삭제되었습니다.");
      setTimeout(() => router.push("/gathering"), 500);
    } catch (error) {
      console.error("삭제 실패:", error);
      toast.error("삭제에 실패했습니다.");
    }
    setDeleting(false);
  };

  // 신청자 목록 가져오기
  const loadApplicants = async () => {
    if (!post) return;
    try {
      const list = await gatheringService.getApplicants(post.id);
      setApplicants(list);
    } catch (error) {
      console.error("신청자 목록 조회 실패:", error);
    }
  };

  // 그룹 참가 신청
  const handleParticipate = async () => {
    if (!post || loading) return;
    setLoading(true);
    try {
      await gatheringService.participate(post.id);
      setShowParticipateModal(false);
      toast.success("참가 신청이 완료되었습니다!");
      // 데이터 새로고침
      const updated = await gatheringService.get(post.id);
      setPost(updated);
      setIsParticipating(true);
    } catch (error) {
      console.error("참가 신청 실패:", error);
      toast.error("참가 신청에 실패했습니다.");
    }
    setLoading(false);
  };

  // 그룹 탈퇴
  const handleLeave = async () => {
    if (!post || loading) return;
    setLoading(true);
    try {
      await gatheringService.leave(post.id);
      setShowLeaveModal(false);
      toast.success("탈퇴가 완료되었습니다.");
      // 데이터 새로고침
      const updated = await gatheringService.get(post.id);
      setPost(updated);
      setIsParticipating(false);
    } catch (error) {
      console.error("탈퇴 실패:", error);
      toast.error("탈퇴에 실패했습니다.");
    }
    setLoading(false);
  };

  // 신청 허가
  const handlePermit = async () => {
    if (!post || loading || !selectedEnrollId) return;
    setLoading(true);
    try {
      await gatheringService.permit(post.id, selectedEnrollId);
      setShowPermitModal(false);
      toast.success("신청을 수락했습니다.");
      // 데이터 새로고침
      await loadApplicants();
      const updated = await gatheringService.get(post.id);
      setPost(updated);
      setSelectedEnrollId(null);
    } catch (error) {
      console.error("허가 실패:", error);
      toast.error("신청 수락에 실패했습니다.");
    }
    setLoading(false);
  };

  // 좋아요 토글
  const handleLikeToggle = async () => {
    if (!post || loading) return;
    setLoading(true);
    try {
      if (isLiked) {
        await gatheringService.unlike(post.id);
        setPost({ ...post, groupLikeCount: (post.groupLikeCount || 0) - 1 });
      } else {
        await gatheringService.like(post.id);
        setPost({ ...post, groupLikeCount: (post.groupLikeCount || 0) + 1 });
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("좋아요 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="pt-24 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        {!post ? (
          <div className="airbnb-grid">
            {Array.from({ length: 1 }).map((_, i) => (
              <div key={i} className="lg:col-span-2 card p-6 animate-pulse">
                <div className="h-7 w-3/5 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="p-5 md:p-6">
              {editing ? (
                <>
                  <div className="space-y-4">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="form-control"
                      placeholder="제목"
                    />
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="form-control h-60"
                      placeholder="내용"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setTitle(post.title);
                          setContent(post.content);
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleUpdate}
                        disabled={saving}
                      >
                        {saving ? "저장 중..." : "저장"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                        {post.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-semibold">
                            {(post.author || "익명").slice(0, 1)}
                          </div>
                          <span>{post.author || "익명"}</span>
                        </div>
                        <span>·</span>
                        <span>
                          {post.createdAt ? formatDate(post.createdAt) : ""}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* 좋아요 버튼 - 로그인한 사용자만 */}
                      {currentMemberId && (
                        <Button
                          variant={isLiked ? "primary" : "outline"}
                          size="sm"
                          onClick={handleLikeToggle}
                          disabled={loading}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isLiked ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              window.location.href
                            );
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          } catch {}
                        }}
                      >
                        {copied ? "복사됨" : "링크 복사"}
                      </Button>

                      {/* 작성자 전용 버튼 */}
                      {post?.authorId &&
                        currentMemberId &&
                        Number(post.authorId) === Number(currentMemberId) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowApplicants(!showApplicants);
                                if (!showApplicants) loadApplicants();
                              }}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              신청자 관리
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditing(true)}
                            >
                              수정
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDeleteModal(true)}
                              disabled={deleting}
                            >
                              삭제
                            </Button>
                          </>
                        )}

                      {/* 일반 유저 버튼 - 작성자가 아닌 경우만 */}
                      {currentMemberId &&
                        post?.authorId &&
                        Number(post.authorId) !== Number(currentMemberId) && (
                          <>
                            {isParticipating ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowLeaveModal(true)}
                                disabled={loading}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                탈퇴하기
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowParticipateModal(true)}
                                disabled={loading}
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                참가 신청
                              </Button>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                  
                  {/* Info Section with Counters */}
                  <div className="mt-4 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="text-sm">
                        <strong className="text-gray-900">{post.participateCount || 0}</strong>
                        <span className="text-gray-600"> / {post.maxCount || 10}명</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <span className="text-sm">
                        <strong className="text-gray-900">{post.groupLikeCount || 0}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (post.participateCount || 0) >= (post.maxCount || 10)
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-rose-100 text-rose-600'
                      }`}>
                        {(post.participateCount || 0) >= (post.maxCount || 10) ? '모집 마감' : '모집 중'}
                      </span>
                    </div>
                  </div>

                  <hr className="my-5 border-gray-100" />

                  <div 
                    className="prose max-w-none text-gray-800 leading-relaxed text-base"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* 신청자 목록 - 작성자만 볼 수 있음 */}
                  {showApplicants &&
                    post?.authorId &&
                    currentMemberId &&
                    Number(post.authorId) === Number(currentMemberId) && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">
                          신청자 목록
                        </h3>
                        {applicants.length === 0 ? (
                          <p className="text-gray-500">
                            아직 신청자가 없습니다.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {applicants.map((applicant: any) => (
                              <div
                                key={applicant.enrollId}
                                className="flex items-center justify-between p-3 bg-white rounded border"
                              >
                                <div>
                                  <span className="font-medium">
                                    {applicant.nickname || applicant.email}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    {applicant.accepted === false && "(대기중)"}
                                  </span>
                                </div>
                                {!applicant.accepted && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEnrollId(applicant.enrollId);
                                      setShowPermitModal(true);
                                    }}
                                    disabled={loading}
                                  >
                                    수락
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  {/* 참여자 목록 */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">
                      참여자 목록 ({participants.length}명)
                    </h3>
                    {participants.length === 0 ? (
                      <p className="text-gray-500">아직 참여자가 없습니다.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {participants.map((participant: any) => (
                          <div
                            key={participant.enrollId || participant.id}
                            className="px-3 py-1 bg-white rounded-full text-sm"
                          >
                            {participant.nickname || participant.email}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/gathering">
                      <Button variant="outline">목록으로</Button>
                    </Link>
                    {post?.authorId &&
                      currentMemberId &&
                      Number(post.authorId) === Number(currentMemberId) && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setEditing(true)}
                          >
                            수정
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={deleting}
                          >
                            삭제
                          </Button>
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showParticipateModal}
        onClose={() => setShowParticipateModal(false)}
        onConfirm={handleParticipate}
        title="참가 신청"
        message="이 모집글에 참가 신청하시겠습니까?"
        confirmText="참가 신청"
        type="info"
        loading={loading}
      />

      <ConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeave}
        title="그룹 탈퇴"
        message="정말 탈퇴하시겠습니까? 다시 참가하려면 재신청이 필요합니다."
        confirmText="탈퇴하기"
        type="danger"
        loading={loading}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="모집글 삭제"
        message="정말 삭제하시겠습니까? 삭제된 모집글은 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        type="danger"
        loading={deleting}
      />

      <ConfirmModal
        isOpen={showPermitModal}
        onClose={() => {
          setShowPermitModal(false);
          setSelectedEnrollId(null);
        }}
        onConfirm={handlePermit}
        title="참가 신청 수락"
        message="이 신청자의 참가를 승인하시겠습니까?"
        confirmText="수락"
        type="success"
        loading={loading}
      />

      {/* Toast Container */}
      <toast.ToastContainer />
    </Layout>
  );
}
