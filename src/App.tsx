import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileUp,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const APP_NAME = 'aurora 的内务小猪手'
const STORAGE_KEY = 'aurora-office-helper-merchants'

type Step = {
  id: string
  stageId: string
  title: string
  description: string
  completed: boolean
  completedAt: string | null
}

type Merchant = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  steps: Step[]
}

type WorkflowStage = {
  id: string
  title: string
  timing?: string
  note?: string
  steps: Array<{
    id: string
    title: string
    description: string
  }>
}

const workflowStages: WorkflowStage[] = [
  {
    id: 'stage-1',
    title: '阶段一：前期洽谈与方案提报',
    timing: '方案大概当天可审批通过',
    steps: [
      {
        id: 'negotiate',
        title: '谈判与收集资料',
        description: '与商户谈判确认合作方案，索要上线资料和商户 Logo。',
      },
      {
        id: 'submit-plan',
        title: '提报方案',
        description: '在公司内网电脑上提报产品合作方案。',
      },
      {
        id: 'director-sign',
        title: '主任签字',
        description: '打印纸质方案交由主任签字。',
      },
      {
        id: 'submit-shiqi',
        title: '提交诗琪',
        description: '签完字后将方案提交给诗琪，并在内务群内接龙。',
      },
    ],
  },
  {
    id: 'stage-2',
    title: '阶段二：系统进件与合同签署',
    note: '个体工商户无需商户盖章，公司性质的商户必须盖章。',
    steps: [
      {
        id: 'mobile-entry',
        title: '手机进件',
        description: '在手机端将商户资料输入系统，生成并打印开户表。',
      },
      {
        id: 'prepare-contract',
        title: '准备合同',
        description: '准备合作合同，填好商户信息与合作产品，找商户完成签字、盖章。',
      },
      {
        id: 'contract-number',
        title: '合同编号',
        description: '将盖完章的合同打印合同确认表，送至西西姐处进行合同编号。',
      },
      {
        id: 'account-form-sign',
        title: '开户表签字',
        description: '将打印好的开户表送至主任和经理处签字。',
      },
    ],
  },
  {
    id: 'stage-3',
    title: '阶段三：资料回迁审核',
    timing: '回迁通过需要 1-2 天',
    steps: [
      {
        id: 'return-folder',
        title: '整理回迁文件夹',
        description:
          '包含三网截图、准入截图、证照资质、身份证明、门店三张图、OMS 表、已签字开户表彩色扫描件。',
      },
      {
        id: 'return-submit',
        title: '提交回迁',
        description: '把整理好的回迁文件夹发给诗琪，并在内务群内接龙。',
      },
      {
        id: 'return-status',
        title: '状态查询',
        description: '在内务群跟进商户回迁状态。',
      },
    ],
  },
  {
    id: 'stage-4',
    title: '阶段四：用印申请与并行准备',
    steps: [
      {
        id: 'numbered-contract',
        title: '获取编号合同',
        description: '去西西姐处拿取已经编号好的合同，在文件上补充合同编号并扫描。',
      },
      {
        id: 'seal-submit',
        title: '提交用印',
        description: '填写用印表，将扫描好的合同和面单放入用印申请文件夹，打包发给主任。',
      },
      {
        id: 'parallel-setup',
        title: '并行准备',
        description: '进行物料下单，完成产品建档并放入建档上线文件夹。',
      },
    ],
  },
  {
    id: 'stage-5',
    title: '阶段五：用印流转与正式上线',
    timing: '用印流转需要 1-2 天',
    steps: [
      {
        id: 'seal-delivery',
        title: '用印审批与派送',
        description: '询问主任用印是否通过。通过后打印用印表，填写送单人，将材料送至闪姐处。',
      },
      {
        id: 'online-folder',
        title: '汇总上线文件',
        description: '用印完成后，将合同扫描件放入建档上线文件夹，并放入商户 Logo。',
      },
      {
        id: 'online-submit',
        title: '提交上线',
        description: '将完整的建档上线文件夹打包发给诗琪进行建档上线，并在内务群内完成接龙。',
      },
    ],
  },
  {
    id: 'stage-6',
    title: '阶段六：后续收尾工作',
    steps: [
      {
        id: 'training',
        title: '门店培训',
        description: '为商户提供系统及业务操作培训。',
      },
      {
        id: 'incentive',
        title: '设置激励',
        description: '完成相应的激励政策设置。',
      },
    ],
  },
]

const totalStepCount = workflowStages.reduce((count, stage) => count + stage.steps.length, 0)

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function createWorkflowSteps(): Step[] {
  return workflowStages.flatMap((stage) =>
    stage.steps.map((step) => ({
      id: step.id,
      stageId: stage.id,
      title: step.title,
      description: step.description,
      completed: false,
      completedAt: null,
    })),
  )
}

function createMerchant(name: string): Merchant {
  const now = new Date().toISOString()

  return {
    id: createId(),
    name,
    createdAt: now,
    updatedAt: now,
    steps: createWorkflowSteps(),
  }
}

function formatDateTime(value: string | null) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatElapsed(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const day = 24 * 60 * 60 * 1000
  const hour = 60 * 60 * 1000

  if (diff >= day) {
    return `${Math.floor(diff / day)} 天`
  }

  if (diff >= hour) {
    return `${Math.floor(diff / hour)} 小时`
  }

  return '今天'
}

function getProgress(merchant: Merchant) {
  const completedCount = merchant.steps.filter((step) => step.completed).length

  return {
    completedCount,
    percent: Math.round((completedCount / totalStepCount) * 100),
  }
}

function getStageSteps(merchant: Merchant, stageId: string) {
  return merchant.steps.filter((step) => step.stageId === stageId)
}

function isStageComplete(merchant: Merchant, stageId: string) {
  const steps = getStageSteps(merchant, stageId)
  return steps.length > 0 && steps.every((step) => step.completed)
}

function getCurrentStage(merchant: Merchant) {
  const stage = workflowStages.find((item) => !isStageComplete(merchant, item.id))
  return stage?.title ?? '已上线完成'
}

function normalizeMerchant(candidate: unknown): Merchant | null {
  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const merchant = candidate as Partial<Merchant>
  if (
    typeof merchant.id !== 'string' ||
    typeof merchant.name !== 'string' ||
    typeof merchant.createdAt !== 'string' ||
    typeof merchant.updatedAt !== 'string' ||
    !Array.isArray(merchant.steps)
  ) {
    return null
  }

  const defaultSteps = createWorkflowSteps()
  const importedSteps = new Map(
    merchant.steps
      .filter((step): step is Step => {
        return (
          step &&
          typeof step === 'object' &&
          typeof step.id === 'string' &&
          typeof step.stageId === 'string' &&
          typeof step.title === 'string' &&
          typeof step.description === 'string' &&
          typeof step.completed === 'boolean' &&
          (typeof step.completedAt === 'string' || step.completedAt === null)
        )
      })
      .map((step) => [step.id, step]),
  )

  return {
    id: merchant.id,
    name: merchant.name.trim() || '未命名商户',
    createdAt: merchant.createdAt,
    updatedAt: merchant.updatedAt,
    steps: defaultSteps.map((step) => importedSteps.get(step.id) ?? step),
  }
}

function readImportedMerchants(payload: unknown) {
  const candidates = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === 'object' &&
        'merchants' in payload &&
        Array.isArray((payload as { merchants?: unknown }).merchants)
      ? (payload as { merchants: unknown[] }).merchants
      : []

  return candidates.map(normalizeMerchant).filter((merchant): merchant is Merchant => Boolean(merchant))
}

function App() {
  const [merchants, setMerchants] = useState<Merchant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return []
    }

    try {
      return readImportedMerchants(JSON.parse(saved))
    } catch {
      return []
    }
  })
  const [newMerchantName, setNewMerchantName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectedMerchant = merchants.find((merchant) => merchant.id === selectedMerchantId) ?? null

  const filteredMerchants = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    if (!keyword) {
      return merchants
    }

    return merchants.filter((merchant) => merchant.name.toLowerCase().includes(keyword))
  }, [merchants, searchQuery])

  const sortedMerchants = useMemo(() => {
    return [...filteredMerchants].sort(
      (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
    )
  }, [filteredMerchants])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merchants))
  }, [merchants])

  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timer)
  }, [notice])

  function addMerchant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newMerchantName.trim()

    if (!name) {
      setNotice('请输入商户名称')
      return
    }

    const merchant = createMerchant(name)
    setMerchants((current) => [merchant, ...current])
    setNewMerchantName('')
    setSelectedMerchantId(merchant.id)
    setNotice('商户已创建')
  }

  function toggleStep(stepId: string) {
    const now = new Date().toISOString()

    setMerchants((current) =>
      current.map((merchant) => {
        if (merchant.id !== selectedMerchantId) {
          return merchant
        }

        return {
          ...merchant,
          updatedAt: now,
          steps: merchant.steps.map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  completed: !step.completed,
                  completedAt: step.completed ? null : now,
                }
              : step,
          ),
        }
      }),
    )
  }

  function deleteSelectedMerchant() {
    if (!selectedMerchant) {
      return
    }

    const confirmed = window.confirm(`删除「${selectedMerchant.name}」？`)
    if (!confirmed) {
      return
    }

    setMerchants((current) => current.filter((merchant) => merchant.id !== selectedMerchant.id))
    setSelectedMerchantId(null)
    setNotice('商户已删除')
  }

  function exportData() {
    const payload = {
      app: APP_NAME,
      exportedAt: new Date().toISOString(),
      merchants,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `aurora-office-helper-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setNotice('备份文件已导出')
  }

  async function importData(file: File) {
    try {
      const text = await file.text()
      const importedMerchants = readImportedMerchants(JSON.parse(text))

      if (importedMerchants.length === 0) {
        setNotice('没有可导入的商户数据')
        return
      }

      setMerchants((current) => {
        const merged = new Map(current.map((merchant) => [merchant.id, merchant]))
        importedMerchants.forEach((merchant) => merged.set(merchant.id, merchant))
        return [...merged.values()].sort(
          (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
        )
      })
      setNotice(`已导入 ${importedMerchants.length} 个商户`)
    } catch {
      setNotice('导入失败，请检查 JSON 文件')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const dashboardProgress = merchants.length
    ? Math.round(
        merchants.reduce((sum, merchant) => sum + getProgress(merchant).percent, 0) / merchants.length,
      )
    : 0
  const finishedCount = merchants.filter((merchant) => getProgress(merchant).completedCount === totalStepCount).length

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">商户上线流程</p>
          <h1>{APP_NAME}</h1>
        </div>
        <div className="header-mark" aria-hidden="true">
          A
        </div>
      </header>

      {notice ? <div className="toast">{notice}</div> : null}

      {selectedMerchant ? (
        <section className="detail-view" aria-label={`${selectedMerchant.name} 流程详情`}>
          <div className="detail-topbar">
            <button className="icon-button" type="button" onClick={() => setSelectedMerchantId(null)} aria-label="返回">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="eyebrow">当前商户</p>
              <h2>{selectedMerchant.name}</h2>
            </div>
            <button className="icon-button danger" type="button" onClick={deleteSelectedMerchant} aria-label="删除商户">
              <Trash2 size={19} />
            </button>
          </div>

          <MerchantSummary merchant={selectedMerchant} />

          <div className="workflow">
            {workflowStages.map((stage) => {
              const stageSteps = getStageSteps(selectedMerchant, stage.id)
              const stageDone = isStageComplete(selectedMerchant, stage.id)

              return (
                <section className="stage-panel" key={stage.id}>
                  <div className="stage-heading">
                    <div>
                      <h3>{stage.title}</h3>
                      <p>{stageDone ? '已完成' : `${stageSteps.filter((step) => step.completed).length}/${stageSteps.length}`}</p>
                    </div>
                    {stageDone ? <CheckCircle2 className="stage-done-icon" size={22} /> : null}
                  </div>

                  {stage.timing ? (
                    <p className="stage-meta">
                      <Clock3 size={15} />
                      {stage.timing}
                    </p>
                  ) : null}
                  {stage.note ? <p className="stage-note">{stage.note}</p> : null}

                  <div className="step-list">
                    {stageSteps.map((step) => (
                      <label className="step-row" key={step.id}>
                        <input
                          type="checkbox"
                          checked={step.completed}
                          onChange={() => toggleStep(step.id)}
                          aria-label={step.title}
                        />
                        <span className="custom-check" aria-hidden="true">
                          {step.completed ? <CheckCircle2 size={18} /> : null}
                        </span>
                        <span className="step-content">
                          <span className="step-title">{step.title}</span>
                          <span className="step-description">{step.description}</span>
                          {step.completedAt ? (
                            <span className="step-time">完成于 {formatDateTime(step.completedAt)}</span>
                          ) : null}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="home-view" aria-label="商户列表">
          <section className="dashboard">
            <div>
              <span className="metric-value">{merchants.length}</span>
              <span className="metric-label">商户</span>
            </div>
            <div>
              <span className="metric-value">{dashboardProgress}%</span>
              <span className="metric-label">平均进度</span>
            </div>
            <div>
              <span className="metric-value">{finishedCount}</span>
              <span className="metric-label">已完成</span>
            </div>
          </section>

          <form className="add-form" onSubmit={addMerchant}>
            <input
              value={newMerchantName}
              onChange={(event) => setNewMerchantName(event.target.value)}
              placeholder="输入商户名称"
              aria-label="商户名称"
            />
            <button type="submit">
              <Plus size={18} />
              添加
            </button>
          </form>

          <div className="toolbar">
            <label className="search-box">
              <Search size={17} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索商户"
                aria-label="搜索商户"
              />
            </label>
            <div className="toolbar-actions">
              <button className="icon-button" type="button" onClick={() => fileInputRef.current?.click()} aria-label="导入">
                <FileUp size={19} />
              </button>
              <button className="icon-button" type="button" onClick={exportData} aria-label="导出">
                <Download size={19} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              className="hidden-input"
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  void importData(file)
                }
              }}
            />
          </div>

          <div className="merchant-list">
            {sortedMerchants.length ? (
              sortedMerchants.map((merchant) => (
                <button
                  className="merchant-card"
                  key={merchant.id}
                  type="button"
                  onClick={() => setSelectedMerchantId(merchant.id)}
                >
                  <div className="merchant-card-head">
                    <h2>{merchant.name}</h2>
                    <span>{getProgress(merchant).percent}%</span>
                  </div>
                  <p>{getCurrentStage(merchant)}</p>
                  <div className="progress-track" aria-hidden="true">
                    <span style={{ width: `${getProgress(merchant).percent}%` }} />
                  </div>
                  <div className="merchant-card-foot">
                    <span>{getProgress(merchant).completedCount}/{totalStepCount} 步</span>
                    <span>更新 {formatElapsed(merchant.updatedAt)}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="empty-state">
                <p>{searchQuery ? '没有匹配的商户' : '还没有商户'}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

function MerchantSummary({ merchant }: { merchant: Merchant }) {
  const progress = getProgress(merchant)

  return (
    <section className="merchant-summary" aria-label="商户进度概览">
      <div>
        <span className="summary-label">当前阶段</span>
        <strong>{getCurrentStage(merchant)}</strong>
      </div>
      <div>
        <span className="summary-label">完成进度</span>
        <strong>{progress.percent}%</strong>
      </div>
      <div>
        <span className="summary-label">已耗时</span>
        <strong>{formatElapsed(merchant.createdAt)}</strong>
      </div>
      <div className="summary-progress">
        <span style={{ width: `${progress.percent}%` }} />
      </div>
    </section>
  )
}

export default App
