'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import Button from '@/components/common/Button'
import Link from 'next/link'
import { FaSearch } from 'react-icons/fa'
import { gatheringService, GatheringPost } from '@/services/gatheringService'
import { formatDate } from '@/utils/dateUtils'

export default function GatheringPage() {
  const [page, setPage] = useState(0)
  const [items, setItems] = useState<GatheringPost[]>([])
  const [loading, setLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined)
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await gatheringService.list(page, 12)
    setItems(res.content || [])
    setHasNext(!!res.hasNext)
    setTotalPages(res.totalPages)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((p) =>
      [p.title, p.content, p.author]
        .filter(Boolean)
        .some((v) => (v || '').toLowerCase().includes(q))
    )
  }, [items, query])

  const SkeletonCard = () => (
    <div className="airbnb-card p-4 animate-pulse">
      <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
      <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-5/6 bg-gray-200 rounded" />
    </div>
  )

  const getLocalThumbnail = (title: string) => {
    const t = title.toLowerCase()
    if (/(부산|busan)/.test(t)) return '/images/thumbnails/busan.png'
    if (/(제주|jeju)/.test(t)) return '/images/thumbnails/jeju.png'
    if (/(경주|gyeongju)/.test(t)) return '/images/thumbnails/gyeongju.png'
    if (/(강릉|gangneung|강원|gangwon)/.test(t)) return '/images/thumbnails/gangneung.png'
    if (/(서울|seoul)/.test(t)) return '/images/thumbnails/seoul.png'
    if (/(전주|jeonju)/.test(t)) return '/images/thumbnails/jeonju.png'
    return '/images/thumbnails/busan.png'
  }

  return (
    <Layout>
      <div className="pt-24 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-semibold">여행멤버 구하기</h1>
          <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <div className="w-full sm:w-auto sm:min-w-[420px]">
              <div className="flex items-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden pl-5 pr-2 py-2 border border-gray-200 dark:bg-gray-900">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setQuery(keyword)
                  }}
                  placeholder="제목·내용·작성자 검색"
                  className="w-full text-sm focus:outline-none border-none bg-transparent text-gray-700 dark:text-white"
                  aria-label="검색어"
                />
                <Button variant="primary" size="sm" className="ml-2 rounded-full" onClick={() => setQuery(keyword)}>
                  <FaSearch className="text-sm" />
                </Button>
              </div>
            </div>
            <Link href="/gathering/create">
              <Button variant="primary">모집글 작성</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="airbnb-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-xl font-semibold mb-2">조건에 맞는 모집글이 없어요</div>
            <div className="text-gray-500 mb-6">검색어를 바꾸거나 새로 모집글을 작성해보세요.</div>
            <Link href="/gathering/create">
              <Button variant="primary">첫 모집글 작성하기</Button>
            </Link>
          </div>
        ) : (
          <div className="airbnb-grid">
            {filtered.map((p) => (
              <Link key={p.id} href={`/gathering/${p.id}`} className="group rounded-2xl overflow-hidden shadow-md transition-transform duration-500 ease-out bg-white border border-gray-100 transform-gpu hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl focus-visible:-translate-y-2 focus-visible:scale-[1.02] focus-visible:shadow-2xl">
                <div className="relative h-28 bg-gray-50">
                  {p.thumbnailUrl ? (
                    // 서버가 제공하는 썸네일 우선 사용
                    <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-105" />
                  ) : (
                    // 로컬 대표 썸네일 매핑
                    <img src={getLocalThumbnail(p.title)} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-105" />
                  )}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 text-rose-500 shadow-sm">모집중</div>
                </div>
                <div className="p-4">
                  <div className="text-base font-bold text-gray-800 mb-1 line-clamp-1">{p.title}</div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="h-7 w-7 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-semibold">
                        {(p.author || '익명').slice(0, 1)}
                      </div>
                      <span className="truncate max-w-[140px]">{p.author || '익명'}</span>
                    </div>
                    <div className="text-xs text-gray-400">{p.createdAt ? formatDate(p.createdAt) : ''}</div>
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-2 min-h-[2.5rem]">{p.content}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-600">여행</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-600">모집</span>
                    </div>
                    <span className="text-xs text-rose-500 font-semibold group-hover:translate-x-0.5 transition-transform">자세히 보기 →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0}
          >
            이전
          </Button>
          <div className="text-sm text-gray-600">
            {totalPages ? `${page + 1} / ${totalPages}` : `페이지 ${page + 1}`}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
            disabled={!hasNext}
          >
            다음
          </Button>
        </div>
      </div>
    </Layout>
  )
}


