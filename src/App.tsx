import { useEffect, useState, Suspense, lazy } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// User Context Provider
import { UserProvider } from './contexts/UserContext';

// Critical components - loaded immediately
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import Footer from './sections/Footer';
import SiteSearch from './components/SiteSearch';
import SectionNav from './sections/SectionNav';

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
      <div className="relative bg-black text-white min-h-screen overflow-x-hidden">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
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
      <main className="relative z-10">
        {/* Hero is critical - loaded immediately */}
        <Hero />

        {/* Daily News - AI日报 */}
        <Suspense fallback={<SectionSkeleton />}>
          <DailyNews />
        </Suspense>

        {/* Lazy loaded sections with Suspense */}
        <Suspense fallback={<SectionSkeleton />}>
          <LearningPath />
        </Suspense>

        <Suspense fallback={<SectionSkeleton cardCount={3} />}>
          <Courses />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <CourseViewer />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <CoreKnowledgeHub />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <WhatIsLLM />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <CoreConcepts />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Architecture />
        </Suspense>

        <Suspense fallback={<SectionSkeleton cardCount={2} />}>
          <AttentionVisualizer />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Training />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <CodeExamples />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Stats />
        </Suspense>

        <Suspense fallback={<SectionSkeleton cardCount={5} />}>
          <ModelComparison />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <EvaluationSafetyHub />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <EvaluationBenchmarks />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <SafetyAlignment />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <ApplicationsHub />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <RAGDeepDive />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <RAGEvaluation />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <ToolCalling />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <StructuredOutput />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <LongContext />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <DeploymentEngineering />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Applications />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <CaseStudies />
        </Suspense>

        <Suspense fallback={<SectionSkeleton cardCount={4} />}>
          <AgentSystemHub />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AgentModule />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AgentFlowVisualizer />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AgentTeams />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <PromptSkillHub />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <PromptEngineering />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <PromptLibrary />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <SkillTool />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <SkillLibrary />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <SkillEcosystem />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <MultimodalHub />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <MultimodalSections />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <MultimodalPlaybook />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <PaperLibrary />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <VideoTutorials />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Glossary />
        </Suspense>

        <Suspense fallback={<SectionSkeleton cardCount={2} />}>
          <Quiz />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <ParamCalculator />
        </Suspense>

        <Suspense fallback={<SectionSkeleton cardCount={5} />}>
          <ResourceHub />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <ResourceLibrary />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Resources />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Progress />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Certificate />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />

      {/* Site Search */}
      <SiteSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Section Nav */}
      <SectionNav />
    </div>
    </UserProvider>
  );
}

export default App;