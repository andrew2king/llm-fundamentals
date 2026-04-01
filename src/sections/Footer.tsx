import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Twitter, Linkedin, Github } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  concepts: [
    { label: '嵌入', href: '#concepts' },
    { label: '注意力', href: '#concepts' },
    { label: 'Transformer', href: '#architecture' },
  ],
  resources: [
    { label: '论文', href: '#resources' },
    { label: '课程', href: '#resources' },
    { label: '工具', href: '#resources' },
  ],
  company: [
    { label: '关于', href: '#' },
    { label: '联系', href: '#' },
    { label: '隐私', href: '#' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scrollTriggers: ScrollTrigger[] = [];

      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: footerRef.current,
          start: 'top 90%',
          onEnter: () => {
            // Line draw
            const line = footerRef.current?.querySelector('.footer-line');
            if (line) {
              gsap.fromTo(
                line,
                { scaleX: 0 },
                { scaleX: 1, duration: 0.8, ease: 'expo.out' }
              );
            }

            // Content fade in
            const items = contentRef.current?.querySelectorAll('.footer-item');
            if (items && items.length > 0) {
              gsap.fromTo(
                items,
                { y: 30, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.5,
                  stagger: 0.05,
                  ease: 'expo.out',
                  delay: 0.2,
                }
              );
            }

            // Social icons pop
            const socials = footerRef.current?.querySelectorAll('.social-icon');
            if (socials && socials.length > 0) {
              gsap.fromTo(
                socials,
                { scale: 0 },
                {
                  scale: 1,
                  duration: 0.4,
                  stagger: 0.1,
                  ease: 'elastic.out(1, 0.5)',
                  delay: 0.5,
                }
              );
            }
          },
          once: true,
        })
      );

      return () => {
        scrollTriggers.forEach((st) => st.kill());
      };
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    if (href === '#') return;
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer ref={footerRef} className="relative pt-20 pb-8 overflow-hidden">
      {/* Top line */}
      <div className="footer-line absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent origin-center" />

      <div className="max-w-7xl mx-auto px-6">
        <div ref={contentRef}>
          {/* Main footer content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 footer-item opacity-0">
              <div className="flex items-center gap-3 mb-4" aria-hidden="true">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="animate-pulse-glow"
                >
                  <path
                    d="M16 2L28 8V24L16 30L4 24V8L16 2Z"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M16 8L22 11V21L16 24L10 21V11L16 8Z"
                    fill="white"
                  />
                </svg>
                <span className="font-semibold text-lg">LLM基础</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                通过沉浸式、视觉化的学习体验，理解大语言模型。
              </p>
            </div>

            {/* Links */}
            <div className="footer-item opacity-0">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                概念
              </h4>
              <ul className="space-y-3">
                {footerLinks.concepts.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-sm text-white/50 hover:text-spacex-orange hover:translate-x-1 transition-all duration-200 inline-block"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-item opacity-0">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                资源
              </h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-sm text-white/50 hover:text-spacex-orange hover:translate-x-1 transition-all duration-200 inline-block"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-item opacity-0">
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                公司
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-sm text-white/50 hover:text-spacex-orange hover:translate-x-1 transition-all duration-200 inline-block"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="footer-item text-sm text-white/40 opacity-0">
              © 2024 LLM基础。保留所有权利。
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="social-icon w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-spacex-orange/20 hover:scale-110 hover:rotate-[10deg] transition-all duration-300 opacity-0"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-white/60 hover:text-spacex-orange" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
