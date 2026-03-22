import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ResumeProvider, useResume } from './context/ResumeContext';
import AuthPage from './components/AuthPage';
import OnboardingScreen from './components/OnboardingScreen';
import PersonalInfoForm from './components/PersonalInfoForm';
import SummaryForm from './components/SummaryForm';
import ExperienceForm from './components/ExperienceForm';
import EducationForm from './components/EducationForm';
import SkillsForm from './components/SkillsForm';
import ProjectsForm from './components/ProjectsForm';
import CertificationsForm from './components/CertificationsForm';
import AchievementsForm from './components/AchievementsForm';
import ResumePreview from './components/ResumePreview';
import ExportModal from './components/ExportModal';
import JobTailorTool from './components/tools/JobTailorTool';
import CoverLetterTool from './components/tools/CoverLetterTool';
import ATSCheckerTool from './components/tools/ATSCheckerTool';
import InterviewPrepTool from './components/tools/InterviewPrepTool';
import ResumeScoreTool from './components/tools/ResumeScoreTool';

const builderSteps = [
  { id: 0, label: 'Personal', icon: '👤' },
  { id: 1, label: 'Experience', icon: '💼' },
  { id: 2, label: 'Education', icon: '🎓' },
  { id: 3, label: 'Skills', icon: '⚡' },
  { id: 4, label: 'Projects', icon: '🚀' },
  { id: 5, label: 'Certs', icon: '🏅' },
  { id: 6, label: 'Awards', icon: '🏆' },
  { id: 7, label: 'Summary', icon: '📝' },
];

const tools = [
  {
    id: 'tailor',
    label: 'Job Tailor',
    gradient: 'from-amber-400 to-orange-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'cover-letter',
    label: 'Cover Letter',
    gradient: 'from-blue-400 to-indigo-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    id: 'ats-check',
    label: 'ATS Check',
    gradient: 'from-emerald-400 to-teal-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    id: 'interview',
    label: 'Interview Prep',
    gradient: 'from-pink-400 to-rose-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    id: 'score',
    label: 'Resume Score',
    gradient: 'from-violet-400 to-purple-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
];

function SaveIndicator() {
  const { saveStatus } = useResume();
  if (saveStatus === 'idle') return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium animate-fade-in">
      {saveStatus === 'saving' && (
        <>
          <span className="inline-block w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Saving...</span>
        </>
      )}
      {saveStatus === 'saved' && (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span className="text-emerald-500">Saved</span>
        </>
      )}
      {saveStatus === 'error' && (
        <>
          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="text-red-400">Save failed</span>
        </>
      )}
    </div>
  );
}

function AppContent() {
  const { user, logout, deleteAccount } = useAuth();
  const [activeView, setActiveView] = useState('builder');
  const [currentStep, setCurrentStep] = useState(0);
  const [latexModalOpen, setLatexModalOpen] = useState(false);
  const [latex, setLatex] = useState('');
  const [latexLoading, setLatexLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState('original');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { resume, loaded, tailoredResume } = useResume();
  const [showOnboarding, setShowOnboarding] = useState(null);

  useEffect(() => {
    if (loaded && showOnboarding === null) {
      const isEmpty = !resume.summary &&
        resume.experience.length === 0 &&
        resume.education.length === 0 &&
        resume.skills.length === 0 &&
        resume.projects.length === 0;
      setShowOnboarding(isEmpty);
    }
  }, [loaded, resume, showOnboarding]);

  if (!loaded || showOnboarding === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">Loading your resume...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  const activeResume = previewMode === 'tailored' && tailoredResume ? tailoredResume : resume;

  const handleExportPDF = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    const html2pdf = (await import('html2pdf.js')).default;
    const suffix = previewMode === 'tailored' && tailoredResume ? '_tailored' : '';
    html2pdf().set({
      margin: 0,
      filename: `${resume.personalInfo.name || 'resume'}${suffix}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
  };

  const handleExportLatex = async () => {
    setLatexModalOpen(true);
    setLatexLoading(true);
    try {
      const res = await fetch('/api/generate-latex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: activeResume })
      });
      const data = await res.json();
      if (data.latex) setLatex(data.latex);
    } catch (err) {
      console.error('LaTeX generation failed:', err);
      setLatex('% Error generating LaTeX. Please try again.');
    }
    setLatexLoading(false);
  };

  const renderBuilderStep = () => {
    switch (currentStep) {
      case 0: return <PersonalInfoForm />;
      case 1: return <ExperienceForm />;
      case 2: return <EducationForm />;
      case 3: return <SkillsForm />;
      case 4: return <ProjectsForm />;
      case 5: return <CertificationsForm />;
      case 6: return <AchievementsForm />;
      case 7: return <SummaryForm />;
      default: return null;
    }
  };

  const renderToolContent = () => {
    switch (activeView) {
      case 'tailor': return <JobTailorTool />;
      case 'cover-letter': return <CoverLetterTool />;
      case 'ats-check': return <ATSCheckerTool />;
      case 'interview': return <InterviewPrepTool />;
      case 'score': return <ResumeScoreTool />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 sticky top-0 h-screen z-30`}>
        <div className="p-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-200 shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm font-bold text-gray-900 tracking-tight">
              Resum<span className="text-violet-600">ify</span>
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          <button
            onClick={() => setActiveView('builder')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeView === 'builder'
                ? 'bg-violet-50 text-violet-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            {!sidebarCollapsed && 'Resumify'}
          </button>

          <div className="pt-3 pb-1 px-3">
            {!sidebarCollapsed && (
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">AI Tools</span>
            )}
            {sidebarCollapsed && <div className="border-t border-gray-100" />}
          </div>

          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveView(tool.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                activeView === tool.id
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
              title={sidebarCollapsed ? tool.label : undefined}
            >
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0`}>
                <div className="text-white [&>svg]:w-3.5 [&>svg]:h-3.5">{tool.icon}</div>
              </div>
              {!sidebarCollapsed && (
                <div className="text-left min-w-0">
                  <div className="truncate">{tool.label}</div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* User section at bottom */}
        <div className="p-2 border-t border-gray-100 space-y-1">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
              title={sidebarCollapsed ? user?.name : undefined}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              {!sidebarCollapsed && (
                <div className="text-left min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-gray-700">{user?.name}</div>
                  <div className="truncate text-[10px] text-gray-400">{user?.email}</div>
                </div>
              )}
            </button>
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-100 rounded-xl shadow-lg p-1 animate-fade-in z-50">
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      try { await deleteAccount(); } catch {}
                    }
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Delete Account
                </button>
                <button
                  onClick={() => { logout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-400">
                {activeView === 'builder' ? (
                  <span>Build your resume step by step</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-gray-300">/</span>
                    AI Tools
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-600">{tools.find(t => t.id === activeView)?.label}</span>
                  </span>
                )}
              </div>
              <SaveIndicator />
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                PDF
              </button>
              <button
                onClick={handleExportLatex}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-sm shadow-violet-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
                Overleaf
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-6 py-6">
          <div className="flex gap-6 items-start max-w-[1200px] mx-auto">
            <div className="w-[45%] min-w-0 shrink-0">
              {activeView === 'builder' ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-0">
                      {builderSteps.map((step, i) => (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                          <button
                            onClick={() => setCurrentStep(step.id)}
                            className="flex flex-col items-center gap-1.5 group relative"
                          >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                              currentStep === step.id
                                ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200 scale-110'
                                : currentStep > step.id
                                  ? 'bg-violet-100 text-violet-600'
                                  : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                            }`}>
                              {currentStep > step.id ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                              ) : (
                                <span className="text-xs">{step.icon}</span>
                              )}
                            </div>
                            <span className={`text-[11px] font-medium transition-colors ${
                              currentStep === step.id ? 'text-violet-700' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </span>
                          </button>
                          {i < builderSteps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-1 mb-5 rounded-full overflow-hidden bg-gray-100">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500 rounded-full"
                                style={{ width: currentStep > i ? '100%' : '0%' }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-6 animate-fade-in" key={currentStep}>
                    {renderBuilderStep()}
                  </div>

                  {currentStep === builderSteps.length - 1 ? (
                    <div className="mt-4 space-y-3 animate-slide-up">
                      <div className="card p-5 bg-gradient-to-br from-violet-50/50 to-purple-50/50 border-violet-100">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">Your resume is ready!</h3>
                        <p className="text-xs text-gray-500 mb-4">Export it, or use the AI tools in the sidebar to optimize further.</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={handleExportPDF}
                            className="flex flex-col items-center gap-2 px-4 py-4 bg-white border border-violet-100 text-violet-700 text-sm font-medium rounded-xl hover:bg-violet-50 hover:border-violet-200 transition-all duration-200 group"
                          >
                            <svg className="w-6 h-6 text-violet-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Download PDF
                          </button>
                          <button
                            onClick={handleExportLatex}
                            className="flex flex-col items-center gap-2 px-4 py-4 bg-white border border-violet-100 text-violet-700 text-sm font-medium rounded-xl hover:bg-violet-50 hover:border-violet-200 transition-all duration-200 group"
                          >
                            <svg className="w-6 h-6 text-violet-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                            </svg>
                            Overleaf Code
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <button onClick={() => setCurrentStep(s => s - 1)} className="btn-secondary">Back</button>
                        <button onClick={() => setCurrentStep(0)} className="btn-secondary">Back to Start</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                        disabled={currentStep === 0}
                        className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                          </svg>
                          Back
                        </span>
                      </button>
                      <button onClick={() => setCurrentStep(s => s + 1)} className="btn-primary">
                        <span className="flex items-center gap-1.5">
                          Next
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="card p-6 animate-fade-in" key={activeView}>
                  {renderToolContent()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 sticky top-20">
              <div className="card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Preview</span>
                  </div>
                  {tailoredResume && (
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                      <button
                        onClick={() => setPreviewMode('original')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                          previewMode === 'original'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Original
                      </button>
                      <button
                        onClick={() => setPreviewMode('tailored')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                          previewMode === 'tailored'
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Tailored
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gradient-to-b from-gray-100 to-gray-200/80 min-h-[600px]">
                  <div className="bg-white shadow-xl shadow-gray-200/50 mx-auto rounded-sm" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
                    <ResumePreview useTailored={previewMode === 'tailored'} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={latexModalOpen}
        onClose={() => setLatexModalOpen(false)}
        latex={latex}
        loading={latexLoading}
      />
    </div>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <ResumeProvider>
      <AppContent />
    </ResumeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
