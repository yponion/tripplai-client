"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/common/Button";
import { gatheringService, GatheringPost } from "@/services/gatheringService";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/utils/dateUtils";

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

  useEffect(() => {
    if (!id) return;
    gatheringService.get(id).then((p) => {
      setPost(p);
      setTitle(p.title);
      setContent(p.content);
    });
  }, [id]);

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
    const ok = confirm("정말 삭제하시겠어요?");
    if (!ok) return;
    setDeleting(true);
    await gatheringService.remove(post.id);
    setDeleting(false);
    router.push("/gathering");
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
                      {post?.authorId &&
                        currentMemberId &&
                        Number(post.authorId) === Number(currentMemberId) && (
                          <>
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
                              onClick={handleDelete}
                              disabled={deleting}
                            >
                              {deleting ? "삭제 중..." : "삭제"}
                            </Button>
                          </>
                        )}
                    </div>
                  </div>

                  <hr className="my-5 border-gray-100" />

                  <div className="whitespace-pre-line text-gray-800 leading-relaxed text-base">
                    {post.content}
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
                            onClick={handleDelete}
                            disabled={deleting}
                          >
                            {deleting ? "삭제 중..." : "삭제"}
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
    </Layout>
  );
}
