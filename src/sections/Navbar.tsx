import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, BookOpen, Code, Play, Map, Search } from 'lucide-react';

const navLinks = [
  { label: '学习路径', href: '#learning-path' },
  { label: '付费课程', href: '#courses' },
  { label: '课程学习', href: '#course-viewer' },
  { label: '核心知识', href: '#core-knowledge' },
  { label: 'Agent 系统', href: '#agent-system' },
  { label: 'Prompt & Skill', href: '#prompt-skill' },
  { label: '资源库', href: '#resource-hub' },
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
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
            className="flex items-center gap-3 group"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="relative">
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
                className="relative text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 group"
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
              className="px-3 py-2 text-sm font-medium border border-white/30 rounded hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2"
              title="搜索"
            >
              <Search className="w-4 h-4" />
              搜索
            </button>
            {quickLinks.slice(0, 3).map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                title={link.label}
              >
                <link.icon className="w-5 h-5" />
              </button>
            ))}
            <button
              onClick={() => scrollToSection('#quiz')}
              className="px-4 py-2 text-sm font-medium border border-white/30 rounded hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 group"
            >
              开始测验
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-black/98 backdrop-blur-xl transition-transform duration-500 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
          <div className="text-sm text-white/40 mb-4">快速导航</div>
          {navLinks.map((link, index) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="text-xl font-semibold text-white/80 hover:text-white transition-colors duration-200"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {link.label}
            </button>
          ))}
          <div className="mt-8 pt-8 border-t border-white/10 w-full max-w-xs">
            <button
              onClick={() => onOpenSearch?.()}
              className="w-full mb-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
            >
              <Search className="w-5 h-5" />
              搜索
            </button>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-sm">{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
