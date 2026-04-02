import { useEffect, useState, Suspense, lazy } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// User Context Provider
import { UserProvider } from './contexts/UserContext';

// Global Analytics Provider
import { GlobalAnalyticsProvider } from './components/GlobalAnalyticsProvider';

// Critical components - loaded immediately
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import Footer from './sections/Footer';
import SiteSearch from './components/SiteSearch';
import SectionNav from './sections/SectionNav';

// Error Boundary for sections - prevents section errors from crashing the entire page
import SectionErrorBoundary from './components/SectionErrorBoundary';

// Lazy loaded components - loaded on demand
const DailyNews = lazy(() => import('./sections/DailyNews'));
const LearningPath = lazy(() => import('./sections/LearningPath'));
const Courses = lazy(() => import('./sections/Courses'));
const CoreKnowledgeHub = lazy(() => import('./sections/CoreKnowledgeHub'));
const WhatIsLLM = lazy(() => import('./sections/WhatIsLLM'));
const CoreConcepts = lazy(() => import('./sections/CoreConcepts'));
const Architecture = lazy(() => import('./sections/Architecture'));
const AttentionVisualizer = lazy(() => import('./sections/AttentionVisualizer'));
const Training = lazy(() => import('./sections/Training'));
const CodeExamples = lazy(() => import('./sections/CodeExamples'));
const Stats = lazy(() => import('./sections/Stats'));
const ModelComparison = lazy(() => import('./sections/ModelComparison'));
const EvaluationSafetyHub = lazy(() => import('./sections/EvaluationSafetyHub'));
const EvaluationBenchmarks = lazy(() => import('./sections/EvaluationBenchmarks'));
const SafetyAlignment = lazy(() => import('./sections/SafetyAlignment'));
const ApplicationsHub = lazy(() => import('./sections/ApplicationsHub'));
const RAGDeepDive = lazy(() => import('./sections/RAGDeepDive'));
const RAGEvaluation = lazy(() => import('./sections/RAGEvaluation'));
const ToolCalling = lazy(() => import('./sections/ToolCalling'));
const StructuredOutput = lazy(() => import('./sections/StructuredOutput'));
const LongContext = lazy(() => import('./sections/LongContext'));
const DeploymentEngineering = lazy(() => import('./sections/DeploymentEngineering'));
const Applications = lazy(() => import('./sections/Applications'));
const CaseStudies = lazy(() => import('./sections/CaseStudies'));
const AgentSystemHub = lazy(() => import('./sections/AgentSystemHub'));
const AgentModule = lazy(() => import('./sections/AgentModule'));
const AgentFlowVisualizer = lazy(() => import('./sections/AgentFlowVisualizer'));
const AgentTeams = lazy(() => import('./sections/AgentTeams'));
const PromptSkillHub = lazy(() => import('./sections/PromptSkillHub'));
const PromptEngineering = lazy(() => import('./sections/PromptEngineering'));
const PromptLibrary = lazy(() => import('./sections/PromptLibrary'));
const SkillTool = lazy(() => import('./sections/SkillTool'));
const SkillLibrary = lazy(() => import('./sections/SkillLibrary'));
const SkillEcosystem = lazy(() => import('./sections/SkillEcosystem'));
const MultimodalHub = lazy(() => import('./sections/MultimodalHub'));
const MultimodalSections = lazy(() => import('./sections/MultimodalSections'));
const MultimodalPlaybook = lazy(() => import('./sections/MultimodalPlaybook'));
const Progress = lazy(() => import('./sections/Progress'));
const Certificate = lazy(() => import('./sections/Certificate'));
const PaperLibrary = lazy(() => import('./sections/PaperLibrary'));
const VideoTutorials = lazy(() => import('./sections/VideoTutorials'));
const SiliconOrigin = lazy(() => import('./sections/SiliconOrigin'));
const Glossary = lazy(() => import('./sections/Glossary'));
const Quiz = lazy(() => import('./sections/Quiz'));
const ParamCalculator = lazy(() => import('./sections/ParamCalculator'));
const ResourceHub = lazy(() => import('./sections/ResourceHub'));
const ResourceLibrary = lazy(() => import('./sections/ResourceLibrary'));
const Resources = lazy(() => import('./sections/Resources'));
const CourseViewer = lazy(() => import('./sections/CourseViewer'));

// Loading fallback component
import SectionSkeleton from './components/SectionSkeleton';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Initialize smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    // Handle resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || event.key === '/') {
        const target = event.target as HTMLElement | null;
        const tagName = target?.tagName;
        if (event.key === '/' && (tagName === 'INPUT' || tagName === 'TEXTAREA' || target?.isContentEditable)) {
          return;
        }
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <UserProvider>
      <GlobalAnalyticsProvider>
        <div className="relative bg-black text-white min-h-screen overflow-x-hidden">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-spacex-orange focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        跳转到主要内容
      </a>

      {/* Background gradient overlay */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 20%, rgba(0, 82, 136, 0.15) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 80% 80%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Navigation */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main content */}
      <main id="main-content" className="relative z-10" tabIndex={-1}>
        {/* Hero is critical - loaded immediately */}
        <Hero />

        {/* Daily News - AI日报 */}
        <SectionErrorBoundary sectionName="AI日报">
          <Suspense fallback={<SectionSkeleton />}>
            <DailyNews />
          </Suspense>
        </SectionErrorBoundary>

        {/* Lazy loaded sections with Suspense */}
        <SectionErrorBoundary sectionName="学习路径">
          <Suspense fallback={<SectionSkeleton />}>
            <LearningPath />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="课程">
          <Suspense fallback={<SectionSkeleton cardCount={3} />}>
            <Courses />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="课程学习中心">
          <Suspense fallback={<SectionSkeleton />}>
            <CourseViewer />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="核心知识">
          <Suspense fallback={<SectionSkeleton />}>
            <CoreKnowledgeHub />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="什么是LLM">
          <Suspense fallback={<SectionSkeleton />}>
            <WhatIsLLM />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="核心概念">
          <Suspense fallback={<SectionSkeleton />}>
            <CoreConcepts />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="架构">
          <Suspense fallback={<SectionSkeleton />}>
            <Architecture />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="注意力可视化">
          <Suspense fallback={<SectionSkeleton cardCount={2} />}>
            <AttentionVisualizer />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="训练">
          <Suspense fallback={<SectionSkeleton />}>
            <Training />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="代码示例">
          <Suspense fallback={<SectionSkeleton />}>
            <CodeExamples />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="统计">
          <Suspense fallback={<SectionSkeleton />}>
            <Stats />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="模型对比">
          <Suspense fallback={<SectionSkeleton cardCount={5} />}>
            <ModelComparison />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="评估与安全">
          <Suspense fallback={<SectionSkeleton />}>
            <EvaluationSafetyHub />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="评估基准">
          <Suspense fallback={<SectionSkeleton />}>
            <EvaluationBenchmarks />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="安全对齐">
          <Suspense fallback={<SectionSkeleton />}>
            <SafetyAlignment />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="应用中心">
          <Suspense fallback={<SectionSkeleton />}>
            <ApplicationsHub />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="RAG深入">
          <Suspense fallback={<SectionSkeleton />}>
            <RAGDeepDive />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="RAG评估">
          <Suspense fallback={<SectionSkeleton />}>
            <RAGEvaluation />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="工具调用">
          <Suspense fallback={<SectionSkeleton />}>
            <ToolCalling />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="结构化输出">
          <Suspense fallback={<SectionSkeleton />}>
            <StructuredOutput />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="长上下文">
          <Suspense fallback={<SectionSkeleton />}>
            <LongContext />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="部署工程">
          <Suspense fallback={<SectionSkeleton />}>
            <DeploymentEngineering />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="应用">
          <Suspense fallback={<SectionSkeleton />}>
            <Applications />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="案例研究">
          <Suspense fallback={<SectionSkeleton />}>
            <CaseStudies />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="Agent系统">
          <Suspense fallback={<SectionSkeleton cardCount={4} />}>
            <AgentSystemHub />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="Agent模块">
          <Suspense fallback={<SectionSkeleton />}>
            <AgentModule />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="Agent流程">
          <Suspense fallback={<SectionSkeleton />}>
            <AgentFlowVisualizer />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="Agent团队">
          <Suspense fallback={<SectionSkeleton />}>
            <AgentTeams />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="提示与技能">
          <Suspense fallback={<SectionSkeleton />}>
            <PromptSkillHub />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="提示工程">
          <Suspense fallback={<SectionSkeleton />}>
            <PromptEngineering />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="提示库">
          <Suspense fallback={<SectionSkeleton />}>
            <PromptLibrary />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="技能工具">
          <Suspense fallback={<SectionSkeleton />}>
            <SkillTool />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="技能库">
          <Suspense fallback={<SectionSkeleton />}>
            <SkillLibrary />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="技能生态">
          <Suspense fallback={<SectionSkeleton />}>
            <SkillEcosystem />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="多模态">
          <Suspense fallback={<SectionSkeleton />}>
            <MultimodalHub />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="多模态内容">
          <Suspense fallback={<SectionSkeleton />}>
            <MultimodalSections />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="多模态指南">
          <Suspense fallback={<SectionSkeleton />}>
            <MultimodalPlaybook />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="论文库">
          <Suspense fallback={<SectionSkeleton />}>
            <PaperLibrary />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="视频教程">
          <Suspense fallback={<SectionSkeleton />}>
            <VideoTutorials />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="术语表">
          <Suspense fallback={<SectionSkeleton />}>
            <Glossary />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="测验">
          <Suspense fallback={<SectionSkeleton cardCount={2} />}>
            <Quiz />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="参数计算器">
          <Suspense fallback={<SectionSkeleton />}>
            <ParamCalculator />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="资源中心">
          <Suspense fallback={<SectionSkeleton cardCount={5} />}>
            <ResourceHub />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="资源库">
          <Suspense fallback={<SectionSkeleton />}>
            <ResourceLibrary />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="资源">
          <Suspense fallback={<SectionSkeleton />}>
            <Resources />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="进度">
          <Suspense fallback={<SectionSkeleton />}>
            <Progress />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="证书">
          <Suspense fallback={<SectionSkeleton />}>
            <Certificate />
          </Suspense>
        </SectionErrorBoundary>

        {/* 硅基起源 - 内容品牌 */}
        <SectionErrorBoundary sectionName="硅基起源">
          <Suspense fallback={<SectionSkeleton />}>
            <SiliconOrigin />
          </Suspense>
        </SectionErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Site Search */}
      <SiteSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Section Nav */}
      <SectionNav />
    </div>
      </GlobalAnalyticsProvider>
    </UserProvider>
  );
}

export default App;