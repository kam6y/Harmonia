'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import PersonnelHeader from '@/components/personnel/PersonnelHeader'
import AnalysisImprovementHeader from '@/components/common/AnalysisImprovementHeader'
import OrganizationFilter from '@/components/common/OrganizationFilter.js'
import MeasuresTable from '@/components/personnel/MeasuresTable.js'

const OrganizationChartSection = dynamic(
  () => import('../../components/personnel/OrganizationChartSection'),
  {
    ssr: false,
    loading: () => <div className="flex justify-center p-6">読み込み中...</div>,
  }
)

export default function PersonnelMeasuresPage() {
  const router = useRouter()

  // テナントIDをuseStateで直接取得（初回時のみlocalStorageから取得）
  const [tenantId, setTenantId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTenantId = localStorage.getItem("tenant_id")
      return storedTenantId ? JSON.parse(storedTenantId) : 1
    }
    return 1
  })

  const [measures, setMeasures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    score: '',
  })
  const [organizations, setOrganizations] = useState([])
  const [orgLoading, setOrgLoading] = useState(true)
  const baseUrl = 'http://localhost'

  // 施策データを取得する関数
  const fetchMeasures = async (pageNum, filterParams) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('page', pageNum)
      queryParams.append('tenant_id', tenantId)
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
      const response = await fetch(`${baseUrl}/api/measures?${queryParams}`)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      setMeasures(data.measures || data)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching measures:', error)
      setError('データの読み込みに失敗しました。後でもう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  // 組織データを取得する関数
  const fetchOrganizationData = async () => {
    setOrgLoading(true)
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('tenant_id', tenantId)
      const response = await fetch(`${baseUrl}/api/organization-stats?${queryParams}`)
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      if (data.success && data.organizations) {
        setOrganizations(data.organizations)
      } else {
        console.error('Invalid data format from API:', data)
        setOrganizations([])
      }
    } catch (error) {
      console.error('Error fetching organization data:', error)
      setOrganizations([])
    } finally {
      setOrgLoading(false)
    }
  }

  // 組織名クリック時のハンドラー
  const handleOrganizationClick = (departmentId) => {
    router.push({
      pathname: '/personnel/improvement',
      query: { departmentId },
    })
  }

  // フィルター適用時のハンドラー
  const handleFilterApply = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
    fetchMeasures(1, newFilters)
  }

  // 初回レンダリングおよび page, filters の変更時にデータ取得
  useEffect(() => {
    if (tenantId !== null) {
      fetchMeasures(page, filters)
      fetchOrganizationData()
    }
  }, [tenantId, page, filters])

  return (
    <div className="bg-brand-lightGray text-black min-h-full">
      <PersonnelHeader />
      <AnalysisImprovementHeader
        analysisPath="/personnel/dashboard"
        improvementPath="/personnel/measures"
      />

      <h2 className="px-6 text-xl font-bold text-brand-darkBlue pt-28">
        施策一覧
      </h2>
      <OrganizationFilter
        onFilterApply={handleFilterApply}
        initialFilters={filters}
      />

      <main className="p-6 space-y-6">
        {/* 施策テーブル */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cyan"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <button
                onClick={() => fetchMeasures(page, filters)}
                className="mt-2 text-sm underline hover:text-red-800"
              >
                再試行
              </button>
            </div>
          ) : (
            <MeasuresTable
              measures={measures}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onOrganizationClick={handleOrganizationClick}
            />
          )}
        </div>

        {/* 組織図 */}
        <div>
          <h2 className="text-xl font-bold text-brand-darkBlue mb-4">組織構造</h2>
          {orgLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cyan"></div>
            </div>
          ) : (
            <OrganizationChartSection
              organizations={organizations}
              onOrganizationClick={handleOrganizationClick}
            />
          )}
        </div>
      </main>
    </div>
  )
}