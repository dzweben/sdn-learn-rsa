/**
 * Root app — manages navigation, welcome screen.
 * Static website version (no terminal, editor, or file browser).
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import Layout, { TabId } from './components/Layout'
import SectionNav from './components/SectionNav'
import AppContext, { type AppContextType } from './context/AppContext'

// ─── Bundled script sources (inlined at build time via ?raw) ─
import src_2_generate_timing from './assets/scripts/2_generate_timing.sh?raw'
import src_3a_afni_proc_template from './assets/scripts/3a_afni_proc_template.sh?raw'
import src_3b_fallback_patch from './assets/scripts/3b_fallback_patch.py?raw'
import src_3_run_glm from './assets/scripts/3_run_glm.sh?raw'
import src_audit_server from './assets/scripts/audit_server.sh?raw'
import src_1_fix_events from './assets/scripts/1_fix_events.py?raw'
import src_enrich_events from './assets/scripts/enrich_events.py?raw'

// ─── Content components ──────────────────────────────────────
import PaperLibrary from './content/papers/PaperLibrary'
import BigQuestion from './content/papers/finn-2020/BigQuestion'
import IsRsaFramework from './content/papers/finn-2020/IsRsaFramework'
import TwoModels from './content/papers/finn-2020/TwoModels'
import Results from './content/papers/finn-2020/Results'
import Implications from './content/papers/finn-2020/Implications'
import LearnConnection from './content/papers/finn-2020/LearnConnection'
import FullPaper from './content/papers/finn-2020/FullPaper'

// ─── Foundations content ─────────────────────────────────────
import LabServer from './content/foundations/LabServer'
import TerminalEssentials from './content/foundations/TerminalEssentials'
import Ssh from './content/foundations/Ssh'
import RsaLearnTour from './content/foundations/RsaLearnTour'
import EditingOnServer from './content/foundations/EditingOnServer'

// ─── Data content ────────────────────────────────────────────
import WhatIsBids from './content/data/WhatIsBids'
import LearnTaskTheory from './content/data/LearnTaskTheory'
import EightConditions from './content/data/EightConditions'
import EventsDeepDive from './content/data/EventsDeepDive'
import AcrossSubjects from './content/data/AcrossSubjects'
import WhyThisMatters from './content/data/WhyThisMatters'
import PredictionChoice from './content/data/PredictionChoice'
import EnrichEventsLab from './content/data/EnrichEventsLab'

// ─── Timing Labs ─────────────────────────────────────────────
import TimingOverview from './content/timing/TimingOverview'
import TimingBuildScript from './content/timing/TimingBuildScript'
import TimingRunAndVerify from './content/timing/TimingRunAndVerify'

// ─── GLM Labs ────────────────────────────────────────────────
import GlmConcepts from './content/glm/GlmConcepts'
import GlmAfni from './content/glm/GlmAfni'
import ProcLabSetup from './content/glm/ProcLabSetup'
import ProcLabBlocks from './content/glm/ProcLabBlocks'
import ProcLabRegressors from './content/glm/ProcLabRegressors'
import ProcLabGlts from './content/glm/ProcLabGlts'
import ProcLabTest from './content/glm/ProcLabTest'
import FallbackLab from './content/glm/FallbackLab'
import OrchestratorLab from './content/glm/OrchestratorLab'
import PipelineRun from './content/glm/PipelineRun'

// ─── Next Steps content ──────────────────────────────────────
import BetasToRsa from './content/next/BetasToRsa'
import Hypotheses from './content/next/Hypotheses'
import ReadingList from './content/next/ReadingList'

// ─── Finn section order ──────────────────────────────────────
const FINN_SECTIONS = [
  { id: 'finn-big-question', title: 'The Big Question' },
  { id: 'finn-is-rsa', title: 'The IS-RSA Framework' },
  { id: 'finn-two-models', title: 'Two Models of Individuality' },
  { id: 'finn-results', title: 'Results' },
  { id: 'finn-implications', title: 'Implications' },
  { id: 'finn-learn', title: 'Connection to LEARN' }
]

const FINN_COMPONENTS: Record<string, React.ComponentType> = {
  'finn-big-question': BigQuestion,
  'finn-is-rsa': IsRsaFramework,
  'finn-two-models': TwoModels,
  'finn-results': Results,
  'finn-implications': Implications,
  'finn-learn': LearnConnection,
  'finn-full-paper': FullPaper
}

// ─── Tab component maps ─────────────────────────────────────

const FOUNDATIONS_COMPONENTS: Record<string, React.ComponentType> = {
  'lab-server': LabServer,
  'terminal-essentials': TerminalEssentials,
  'ssh': Ssh,
  'rsa-learn-tour': RsaLearnTour,
  'editing': EditingOnServer
}

const DATA_COMPONENTS: Record<string, React.ComponentType> = {
  'what-is-bids': WhatIsBids,
  'learn-task': LearnTaskTheory,
  'eight-conditions': EightConditions,
  'events-deep-dive': EventsDeepDive,
  'across-subjects': AcrossSubjects,
  'why-matters': WhyThisMatters,
  'prediction-choice': PredictionChoice,
  'enrich-events-lab': EnrichEventsLab
}

const TIMING_COMPONENTS: Record<string, React.ComponentType> = {
  'timing-overview': TimingOverview,
  'timing-build-script': TimingBuildScript,
  'timing-run-and-verify': TimingRunAndVerify
}

const GLM_COMPONENTS: Record<string, React.ComponentType> = {
  'glm-concepts': GlmConcepts,
  'glm-afni': GlmAfni,
  'proc-lab-setup': ProcLabSetup,
  'proc-lab-blocks': ProcLabBlocks,
  'proc-lab-regressors': ProcLabRegressors,
  'proc-lab-glts': ProcLabGlts,
  'proc-lab-test': ProcLabTest,
  'fallback-lab': FallbackLab,
  'orchestrator-lab': OrchestratorLab,
  'pipeline-run': PipelineRun
}

const NEXT_COMPONENTS: Record<string, React.ComponentType> = {
  'betas-to-rsa': BetasToRsa,
  'hypotheses': Hypotheses,
  'reading-list': ReadingList
}

const TAB_COMPONENTS: Record<string, Record<string, React.ComponentType>> = {
  foundations: FOUNDATIONS_COMPONENTS,
  data: DATA_COMPONENTS,
  timing: TIMING_COMPONENTS,
  glm: GLM_COMPONENTS,
  next: NEXT_COMPONENTS
}

// ─── Module definitions ─────────────────────────────────────

const MODULE_NAV: Record<TabId, { id: string; title: string }[]> = {
  papers: [
    { id: 'library', title: 'Paper Library' }
  ],
  foundations: [
    { id: 'lab-server', title: 'The Lab Server' },
    { id: 'terminal-essentials', title: 'Terminal Essentials' },
    { id: 'ssh', title: 'SSH & Remote Access' },
    { id: 'rsa-learn-tour', title: 'The RSA-learn Directory' },
    { id: 'editing', title: 'Editing on the Server' }
  ],
  data: [
    { id: 'what-is-bids', title: 'What is BIDS?' },
    { id: 'learn-task', title: 'The LEARN Task — Theory' },
    { id: 'eight-conditions', title: 'The 8 Feedback Conditions' },
    { id: 'events-deep-dive', title: 'Events Files Deep Dive' },
    { id: 'across-subjects', title: 'Across Subjects' },
    { id: 'why-matters', title: 'Why This Matters' },
    { id: 'prediction-choice', title: 'The Missing Piece' },
    { id: 'enrich-events-lab', title: 'Lab: Enrich the Events' }
  ],
  timing: [
    { id: 'timing-overview', title: 'What We\'re Building' },
    { id: 'timing-build-script', title: 'Build the Script' },
    { id: 'timing-run-and-verify', title: 'Run & Verify' }
  ],
  glm: [
    { id: 'glm-concepts', title: 'GLM in 5 Minutes' },
    { id: 'glm-afni', title: 'AFNI & afni_proc.py' },
    { id: 'proc-lab-setup', title: 'Lab: Create Proc Template' },
    { id: 'proc-lab-blocks', title: 'Lab: Processing Blocks' },
    { id: 'proc-lab-regressors', title: 'Lab: The 41 Regressors' },
    { id: 'proc-lab-glts', title: 'Lab: The 45 GLTs' },
    { id: 'proc-lab-test', title: 'Lab: Test One Subject' },
    { id: 'fallback-lab', title: 'Lab: Fallback Patch' },
    { id: 'orchestrator-lab', title: 'Lab: The Orchestrator' },
    { id: 'pipeline-run', title: 'Lab: Run & Audit' }
  ],
  next: [
    { id: 'betas-to-rsa', title: 'From Betas to RSA' },
    { id: 'hypotheses', title: 'The Hypotheses' },
    { id: 'reading-list', title: 'Key Papers' }
  ]
}

// ─── Welcome Screen ──────────────────────────────────────────

function WelcomeScreen({ onGetStarted }: { onGetStarted: () => void }): React.JSX.Element {
  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(99,102,241,0.15), transparent)'
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse 400px 300px at 30% 60%, rgba(45,212,191,0.1), transparent)'
        }}
      />

      <div className="relative z-10 text-center max-w-xl px-8 animate-fade-up">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent-subtle)] border border-[rgba(99,102,241,0.15)]">
            <span className="text-xs font-medium text-[var(--color-accent-bright)] tracking-wider uppercase">
              Interactive Walkthrough
            </span>
          </div>
        </div>

        <h1
          className="text-5xl font-bold tracking-tight mb-4 font-[var(--font-heading)]"
          style={{ lineHeight: 1.1 }}
        >
          <span className="text-gradient">LEARN RSA</span>
        </h1>

        <p className="text-lg text-[var(--color-text-secondary)] mb-2 leading-relaxed">
          From paper to pipeline.
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mb-10 max-w-md mx-auto leading-relaxed">
          An interactive guide to understanding inter-subject RSA, navigating the
          LEARN fMRI dataset, and running the full analysis pipeline.
        </p>

        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white
                     bg-[var(--color-accent)] rounded-xl hover:bg-[var(--color-accent-dim)]
                     transition-all shadow-[var(--shadow-glow)]
                     hover:shadow-[0_0_40px_var(--color-accent-glow)]"
        >
          Get Started
          <span className="text-lg">&rarr;</span>
        </button>

        <p className="text-[10px] text-[var(--color-text-dim)] mt-4">
          <kbd className="kbd">Ctrl+1</kbd>&ndash;<kbd className="kbd">Ctrl+6</kbd> to switch tabs
        </p>
      </div>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────

export default function App(): React.JSX.Element {
  const [showWelcome, setShowWelcome] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('papers')
  const [activeModule, setActiveModule] = useState<string>('library')

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      if (e.key >= '1' && e.key <= '6') {
        e.preventDefault()
        const tabs: TabId[] = ['papers', 'foundations', 'data', 'timing', 'glm', 'next']
        const tab = tabs[parseInt(e.key) - 1]
        setActiveTab(tab)
        setActiveModule(MODULE_NAV[tab][0].id)
        setShowWelcome(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Bundled scripts ──
  const BUNDLED_SCRIPTS: Record<string, string> = useMemo(
    () => ({
      '2_generate_timing.sh': src_2_generate_timing,
      '3a_afni_proc_template.sh': src_3a_afni_proc_template,
      '3b_fallback_patch.py': src_3b_fallback_patch,
      '3_run_glm.sh': src_3_run_glm,
      'audit_server.sh': src_audit_server,
      '1_fix_events.py': src_1_fix_events,
      'enrich_events.py': src_enrich_events
    }),
    []
  )

  const getScriptContent = useCallback(
    (scriptName: string): string | null => {
      return BUNDLED_SCRIPTS[scriptName] || null
    },
    [BUNDLED_SCRIPTS]
  )

  const appContextValue = useMemo<AppContextType>(
    () => ({ getScriptContent }),
    [getScriptContent]
  )

  // ── Navigation ──
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    setActiveModule(MODULE_NAV[tab][0].id)
    setShowWelcome(false)
  }, [])

  const navigateToModule = useCallback((moduleId: string) => {
    setActiveModule(moduleId)
    setShowWelcome(false)
  }, [])

  // ── Module nav (contextual for papers) ──
  const isInsideFinnPaper = activeTab === 'papers' && activeModule.startsWith('finn-')

  const moduleNavContent = useMemo(() => {
    if (activeTab === 'papers' && !isInsideFinnPaper) {
      return (
        <div className="space-y-0.5">
          <button
            onClick={() => {
              setActiveModule('finn-big-question')
              setShowWelcome(false)
            }}
            className="module-item w-full text-left group"
          >
            <span className="module-num">1</span>
            <div className="min-w-0">
              <span className="truncate block">Finn et al. (2020)</span>
              <span className="text-[10px] text-[var(--color-text-dim)] truncate block mt-0.5 italic">
                Idiosynchrony
              </span>
            </div>
          </button>
          {[
            { label: 'Greco et al. (2024)', sub: 'Predictive learning' },
            { label: 'Baek et al. (2023)', sub: 'Loneliness & ISC' },
            { label: 'Shen et al. (2025)', sub: 'Neural similarity' },
            { label: 'Lamba et al. (2020)', sub: 'Anxiety & social learning' }
          ].map((p) => (
            <div
              key={p.label}
              className="module-item w-full text-left opacity-40 cursor-default"
            >
              <span className="module-num">&middot;</span>
              <div className="min-w-0">
                <span className="truncate block">{p.label}</span>
                <span className="text-[10px] text-[var(--color-text-dim)] truncate block mt-0.5 italic">
                  {p.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (isInsideFinnPaper) {
      return (
        <div className="space-y-0.5">
          <button
            onClick={() => {
              setActiveModule('library')
              setShowWelcome(false)
            }}
            className="module-item w-full text-left group mb-2"
          >
            <span className="text-[var(--color-text-dim)] group-hover:text-[var(--color-accent-bright)] transition-colors text-xs mr-1">&larr;</span>
            <span className="truncate text-[var(--color-text-muted)]">All Papers</span>
          </button>
          <div className="px-3 pb-2 pt-1">
            <p className="text-[10px] font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
              Finn et al. (2020)
            </p>
            <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5 italic">
              Idiosynchrony
            </p>
          </div>
          {FINN_SECTIONS.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveModule(sec.id)
                setShowWelcome(false)
              }}
              className={`module-item w-full text-left ${activeModule === sec.id && !showWelcome ? 'active' : ''}`}
            >
              <span className="module-num">{idx + 1}</span>
              <span className="truncate">{sec.title}</span>
            </button>
          ))}
          <div className="my-3 mx-3 border-t border-[var(--color-border)]" />
          <button
            onClick={() => {
              setActiveModule('finn-full-paper')
              setShowWelcome(false)
            }}
            className={`module-item w-full text-left ${activeModule === 'finn-full-paper' && !showWelcome ? 'active' : ''}`}
          >
            <span className="text-sm mr-1.5">📄</span>
            <span className="truncate">Full Paper</span>
          </button>
        </div>
      )
    }

    const modules = MODULE_NAV[activeTab]
    return (
      <div className="space-y-0.5">
        {modules.map((mod, idx) => (
          <button
            key={mod.id}
            onClick={() => {
              setActiveModule(mod.id)
              setShowWelcome(false)
            }}
            className={`module-item w-full text-left ${activeModule === mod.id && !showWelcome ? 'active' : ''}`}
          >
            <span className="module-num">{idx + 1}</span>
            <span className="truncate">{mod.title}</span>
          </button>
        ))}
      </div>
    )
  }, [activeTab, activeModule, showWelcome, isInsideFinnPaper])

  // ── Scroll to top on module change ──
  useEffect(() => {
    const mainEl = document.querySelector('main')
    if (mainEl) mainEl.scrollTop = 0
  }, [activeModule])

  // ── Content routing ──
  const contentElement = useMemo(() => {
    if (showWelcome) return null

    if (activeTab === 'papers') {
      if (activeModule === 'library') {
        return (
          <PaperLibrary
            onSelectPaper={(moduleId) => setActiveModule(moduleId)}
          />
        )
      }
      if (activeModule === 'finn-full-paper') {
        return <FullPaper />
      }
      const FinnComponent = FINN_COMPONENTS[activeModule]
      if (FinnComponent) {
        const sectionIdx = FINN_SECTIONS.findIndex((s) => s.id === activeModule)
        const prevSection = sectionIdx > 0 ? FINN_SECTIONS[sectionIdx - 1] : null
        const nextSection =
          sectionIdx < FINN_SECTIONS.length - 1 ? FINN_SECTIONS[sectionIdx + 1] : null
        return (
          <>
            <FinnComponent />
            <SectionNav prev={prevSection} next={nextSection} onNavigate={navigateToModule} />
          </>
        )
      }
    }

    const tabComponents = TAB_COMPONENTS[activeTab]
    if (tabComponents) {
      const TabComponent = tabComponents[activeModule]
      if (TabComponent) {
        const modules = MODULE_NAV[activeTab]
        const moduleIdx = modules.findIndex((m) => m.id === activeModule)
        const prevModule = moduleIdx > 0 ? modules[moduleIdx - 1] : null
        const nextModule = moduleIdx < modules.length - 1 ? modules[moduleIdx + 1] : null
        return (
          <>
            <TabComponent />
            <SectionNav prev={prevModule} next={nextModule} onNavigate={navigateToModule} />
          </>
        )
      }
    }

    return null
  }, [showWelcome, activeTab, activeModule, navigateToModule])

  const mainContent = showWelcome ? (
    <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />
  ) : (
    contentElement
  )

  return (
    <AppContext.Provider value={appContextValue}>
      {showWelcome ? (
        <div className="flex h-screen bg-[var(--color-bg-deep)]">
          <div className="flex flex-col items-center w-[54px] shrink-0 bg-[var(--color-bg-base)] border-r border-[var(--color-border)]">
            <div className="h-[12px]" />
          </div>
          {mainContent}
        </div>
      ) : (
        <Layout
          activeTab={activeTab}
          onTabChange={handleTabChange}
          content={mainContent}
          moduleNav={moduleNavContent}
        />
      )}
    </AppContext.Provider>
  )
}
