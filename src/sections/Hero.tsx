import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown, Play } from 'lucide-react';
import OptimizedImage, { IMAGE_DIMENSIONS } from '@/components/OptimizedImage';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set([titleRef.current, subtitleRef.current, ctaRef.current], {
        opacity: 0,
        y: 50,
      });
      gsap.set(floatingRef.current, {
        opacity: 0,
        scale: 0.8,
        rotateY: 45,
      });

      // Entry animation timeline
      const tl = gsap.timeline({ delay: 0.3 });

      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
      })
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'expo.out',
          },
          '-=0.5'
        )
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
          },
          '-=0.4'
        )
        .to(
          floatingRef.current,
          {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            duration: 1.2,
            ease: 'expo.out',
          },
          '-=0.8'
        );

      // Scroll-triggered parallax
      const scrollTriggers: ScrollTrigger[] = [];

      scrollTriggers.push(
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            if (contentRef.current) {
              gsap.set(contentRef.current, {
                y: self.progress * -150,
                opacity: 1 - self.progress * 1.5,
              });
            }
            if (floatingRef.current) {
              gsap.set(floatingRef.current, {
                y: self.progress * -200,
                rotateY: self.progress * 45,
              });
            }
          },
        })
      );

      return () => {
        scrollTriggers.forEach((st) => st.kill());
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToConcepts = () => {
    const element = document.querySelector('#concepts');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image - Critical for LCP, eager loading */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <OptimizedImage
          src="/hero-bg.jpg"
          alt=""
          width={IMAGE_DIMENSIONS['hero-bg'].width}
          height={IMAGE_DIMENSIONS['hero-bg'].height}
          className="w-full h-full object-cover scale-110"
          loading="eager"
          priority={true}
          placeholder={false}
          fadeIn={false}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
      </div>

      {/* Floating Elements - Lazy loaded */}
      <div
        ref={floatingRef}
        className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[400px] h-[400px] z-10 hidden lg:block"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        aria-hidden="true"
      >
        <OptimizedImage
          src="/hero-float.png"
          alt=""
          width={IMAGE_DIMENSIONS['hero-float'].width}
          height={IMAGE_DIMENSIONS['hero-float'].height}
          className="w-full h-full object-contain animate-float"
          loading="lazy"
          placeholder={true}
          fadeIn={true}
          aria-hidden
        />
        <div className="absolute inset-0 bg-spacex-blue/20 blur-[100px] rounded-full" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-20 max-w-7xl mx-auto px-6 pt-32 pb-20"
      >
        <div className="max-w-2xl">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-spacex-orange animate-pulse" />
            <span className="text-sm font-medium text-white/80">
              大语言模型基础
            </span>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="block">理解驱动</span>
            <span className="block text-gradient">未来的AI</span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-xl"
          >
            探索大语言模型背后的架构、训练和应用——以视觉化、互动式的方式呈现，让复杂的AI概念变得触手可及。
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <button
              onClick={scrollToConcepts}
              className="group px-8 py-4 bg-white text-black font-semibold rounded hover:bg-white/90 transition-all duration-300 flex items-center gap-3"
            >
              开始探索
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <button
              className="group px-8 py-4 border border-white/30 text-white font-semibold rounded hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
              aria-label="观看演示视频"
            >
              <Play className="w-5 h-5" aria-hidden="true" />
              观看演示
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-xs text-white/50 uppercase tracking-widest">
          向下滚动
        </span>
        <ChevronDown className="w-6 h-6 text-white/50 animate-bounce-subtle" />
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </section>
  );
}
