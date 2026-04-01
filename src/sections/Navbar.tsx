import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, BookOpen, Code, Play, Map, Search, Home, Newspaper, Compass } from 'lucide-react';

const navLinks = [
  { label: 'AI日报', href: '#daily-news' },
  { label: '学习路径', href: '#learning-path' },
  { label: '付费课程', href: '#courses' },
  { label: '课程学习', href: '#course-viewer' },
  { label: '核心知识', href: '#core-knowledge' },
  { label: 'Agent 系统', href: '#agent-system' },
  { label: 'Prompt & Skill', href: '#prompt-skill' },
  { label: '资源库', href: '#resource-hub' },
];

// Mobile bottom navigation - key items with icons
const mobileNavLinks = [
  { label: '日报', href: '#daily-news', icon: Newspaper },
  { label: '路径', href: '#learning-path', icon: Map },
  { label: '课程', href: '#courses', icon: BookOpen },
  { label: '学习', href: '#course-viewer', icon: Play },
];

const quickLinks = [
  { label: '论文库', href: '#papers', icon: BookOpen },
  { label: '代码示例', href: '#code', icon: Code },
  { label: '视频教程', href: '#videos', icon: Play },
  { label: '学习路线', href: '#learning-path', icon: Map },
];

type NavbarProps = {
  onOpenSearch?: () => void;
};

export default function Navbar({ onOpenSearch }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      // Detect active section for mobile nav highlighting
      const sections = mobileNavLinks.map(l => l.href.replace('#', ''));
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop/Tablet Top Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-black/95 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent'
        }`}
        style={{
          height: isScrolled ? '60px' : '80px',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group active:scale-95 transition-transform min-h-[44px]"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="返回首页"
          >
            <div className="relative" aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="transition-transform duration-300 group-hover:scale-110"
              >
                <path
                  d="M16 2L28 8V24L16 30L4 24V8L16 2Z"
                  stroke="white"
                  strokeWidth="1.5"
                  fill="none"
                  className="origin-center"
                />
                <path
                  d="M16 8L22 11V21L16 24L10 21V11L16 8Z"
                  fill="white"
                  className="origin-center transition-transform duration-300 group-hover:scale-110"
                />
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight hidden sm:block">
              LLM基础
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="relative text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 group min-h-[44px] flex items-center active:scale-95"
              >
                {link.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-[2px] bg-spacex-orange transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => onOpenSearch?.()}
              className="px-3 py-2 min-h-[44px] text-sm font-medium border border-white/30 rounded hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 active:scale-95"
              aria-label="搜索"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              搜索
            </button>
            {quickLinks.slice(0, 3).map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="p-2 min-w-[44px] min-h-[44px] rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                aria-label={link.label}
              >
                <link.icon className="w-5 h-5" aria-hidden="true" />
              </button>
            ))}
            <button
              onClick={() => scrollToSection('#quiz')}
              className="px-4 py-2 min-h-[44px] text-sm font-medium border border-white/30 rounded hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 group active:scale-95"
              aria-label="开始测验"
            >
              开始测验
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Menu Button (hidden on lg, visible on smaller screens) */}
          <button
            className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-black/98 backdrop-blur-xl transition-transform duration-500 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        aria-hidden={!isMobileMenuOpen}
        role="dialog"
        aria-label="导航菜单"
      >
        <div className="flex flex-col items-center justify-center h-full gap-3 p-6 pb-[80px]">
          <div className="text-sm text-white/40 mb-4">快速导航</div>
          {navLinks.map((link, index) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="text-xl font-semibold text-white/80 hover:text-white active:scale-95 transition-all duration-200 min-h-[48px] flex items-center px-8"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {link.label}
            </button>
          ))}
          <div className="mt-6 pt-6 border-t border-white/10 w-full max-w-xs">
            <button
              onClick={() => {
                onOpenSearch?.();
                setIsMobileMenuOpen(false);
              }}
              className="w-full mb-3 flex items-center justify-center gap-2 p-4 min-h-[48px] rounded-xl bg-white/5 text-white/70 hover:bg-white/10 active:scale-95 transition-all"
              aria-label="搜索"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              搜索
            </button>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="flex items-center gap-2 p-4 min-h-[48px] rounded-xl bg-white/5 text-white/70 hover:bg-white/10 active:scale-95 transition-all"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm">{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Fixed at bottom */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-all duration-300 ${
          isScrolled || window.scrollY > 50
            ? 'bg-black/95 backdrop-blur-xl border-t border-white/10'
            : 'bg-black/80 backdrop-blur-md'
        }`}
        aria-label="移动端底部导航"
      >
        <div className="flex items-center justify-around h-[60px] px-2 safe-area-inset-bottom">
          {/* Home */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all gap-1 ${
              activeSection === '' ? 'text-spacex-orange' : 'text-white/60 hover:text-white'
            } active:scale-90`}
            aria-label="首页"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs">首页</span>
          </button>

          {/* Main Nav Links */}
          {mobileNavLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-all gap-1 ${
                activeSection === link.href.replace('#', '')
                  ? 'text-spacex-orange'
                  : 'text-white/60 hover:text-white'
              } active:scale-90`}
              aria-label={link.label}
            >
              <link.icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-xs truncate max-w-[60px]">{link.label}</span>
            </button>
          ))}

          {/* Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] text-white/60 hover:text-white active:scale-90 transition-all gap-1"
            aria-label="更多导航"
          >
            <Compass className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs">更多</span>
          </button>
        </div>
      </nav>
    </>
  );
}