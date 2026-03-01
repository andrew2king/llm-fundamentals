import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const sentences = [
  { text: '猫坐在垫子上', tokens: ['猫', '坐', '在', '垫子', '上'] },
  { text: '人工智能改变世界', tokens: ['人工', '智能', '改变', '世界'] },
  { text: 'Transformer架构很强大', tokens: ['Transformer', '架构', '很', '强大'] },
];

export default function AttentionVisualizer() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedSentence, setSelectedSentence] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeToken, setActiveToken] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const currentSentence = sentences[selectedSentence];
  const tokens = currentSentence.tokens;

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.viz-item');
          if (items && items.length > 0) {
            gsap.fromTo(
              items,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'expo.out' }
            );
          }
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying) {
      let current = 0;
      interval = setInterval(() => {
        setActiveToken(current);
        current = (current + 1) % tokens.length;
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (!isPlaying) {
        setActiveToken(null);
      }
    };
  }, [isPlaying, tokens.length]);

  const getAttentionStrength = (fromIndex: number, toIndex: number) => {
    if (activeToken === null) return 0.1;
    if (fromIndex !== activeToken) return 0.1;
    
    // 模拟注意力模式：当前token关注前面的token更多
    const distance = Math.abs(fromIndex - toIndex);
    if (distance === 0) return 1;
    if (toIndex < fromIndex) return 0.7 - distance * 0.15;
    return 0.3 - distance * 0.1;
  };

  return (
    <section ref={sectionRef} id="visualizer" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="viz-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <span>互动演示</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            注意力机制<span className="text-gradient">可视化</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            观察Transformer如何通过注意力权重理解词与词之间的关系
          </p>
        </div>

        {/* Controls */}
        <div className="viz-item flex flex-wrap items-center justify-center gap-4 mb-12 opacity-0">
          {/* Sentence Selector */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            {sentences.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedSentence(i);
                  setIsPlaying(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedSentence === i
                    ? 'bg-spacex-orange text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                句子 {i + 1}
              </button>
            ))}
          </div>

          {/* Play Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-spacex-blue/30 border border-spacex-blue flex items-center justify-center hover:bg-spacex-blue/50 transition-all duration-300"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveToken(null);
              }}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Info Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              showInfo
                ? 'bg-spacex-orange/30 border border-spacex-orange'
                : 'bg-white/5 border border-white/20 hover:bg-white/10'
            }`}
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Visualization */}
        <div className="viz-item relative bg-black/50 rounded-2xl border border-white/10 p-8 overflow-hidden opacity-0">
          {/* Info Panel */}
          {showInfo && (
            <div className="absolute top-4 right-4 max-w-xs p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm z-10">
              <h4 className="font-semibold mb-2 text-spacex-orange">如何阅读</h4>
              <ul className="text-sm text-white/60 space-y-1">
                <li>• 点击播放查看注意力流动</li>
                <li>• 线条粗细表示注意力强度</li>
                <li>• 颜色越亮表示关联越强</li>
              </ul>
            </div>
          )}

          {/* Attention Matrix */}
          <div className="flex flex-col items-center gap-8">
            {/* Input Tokens */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/40 mr-4">输入:</span>
              {tokens.map((token, i) => (
                <div
                  key={i}
                  onClick={() => setActiveToken(i)}
                  className={`relative px-4 py-3 rounded-xl font-mono text-lg cursor-pointer transition-all duration-300 ${
                    activeToken === i
                      ? 'bg-spacex-orange/30 border-2 border-spacex-orange text-white'
                      : 'bg-white/5 border border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {token}
                  {activeToken === i && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-spacex-orange rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>

            {/* Attention Visualization */}
            <div className="relative w-full max-w-2xl h-64">
              <svg className="w-full h-full" viewBox={`0 0 ${tokens.length * 80} 200`}>
                {/* Connection Lines */}
                {tokens.map((_, fromIndex) =>
                  tokens.map((_, toIndex) => {
                    const strength = getAttentionStrength(fromIndex, toIndex);
                    if (strength < 0.15) return null;

                    const x1 = fromIndex * 80 + 40;
                    const x2 = toIndex * 80 + 40;
                    const y1 = 20;
                    const y2 = 180;

                    return (
                      <line
                        key={`${fromIndex}-${toIndex}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={strength > 0.7 ? '#FF6B35' : '#005288'}
                        strokeWidth={strength * 4}
                        opacity={strength}
                        className="transition-all duration-500"
                      />
                    );
                  })
                )}

                {/* Top Tokens */}
                {tokens.map((token, i) => (
                  <g key={`top-${i}`}>
                    <rect
                      x={i * 80 + 10}
                      y={0}
                      width="60"
                      height="40"
                      rx="8"
                      fill={activeToken === i ? 'rgba(255, 107, 53, 0.3)' : 'rgba(255, 255, 255, 0.05)'}
                      stroke={activeToken === i ? '#FF6B35' : 'rgba(255, 255, 255, 0.2)'}
                      strokeWidth="2"
                    />
                    <text
                      x={i * 80 + 40}
                      y="25"
                      textAnchor="middle"
                      fill="white"
                      fontSize="14"
                      fontFamily="monospace"
                    >
                      {token}
                    </text>
                  </g>
                ))}

                {/* Bottom Tokens */}
                {tokens.map((token, i) => (
                  <g key={`bottom-${i}`}>
                    <rect
                      x={i * 80 + 10}
                      y={160}
                      width="60"
                      height="40"
                      rx="8"
                      fill="rgba(255, 255, 255, 0.05)"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="2"
                    />
                    <text
                      x={i * 80 + 40}
                      y="185"
                      textAnchor="middle"
                      fill="white"
                      fontSize="14"
                      fontFamily="monospace"
                    >
                      {token}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Attention Weights Display */}
            {activeToken !== null && (
              <div className="w-full max-w-2xl p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-medium text-white/60 mb-3">
                  "{tokens[activeToken]}" 的注意力分布:
                </h4>
                <div className="flex items-center gap-4">
                  {tokens.map((token, i) => {
                    const weight = getAttentionStrength(activeToken, i);
                    return (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div
                          className="w-12 bg-gradient-to-t from-spacex-blue to-spacex-orange rounded-t transition-all duration-500"
                          style={{ height: `${weight * 60}px`, opacity: 0.3 + weight * 0.7 }}
                        />
                        <span className="text-xs text-white/60">{token}</span>
                        <span className="text-xs font-mono text-spacex-orange">
                          {(weight * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Explanation Cards */}
        <div className="viz-item grid md:grid-cols-3 gap-6 mt-12 opacity-0">
          {[
            {
              title: '自注意力',
              desc: '每个词都能"看到"句子中的其他所有词，建立全局依赖关系',
            },
            {
              title: '多头注意力',
              desc: '使用多组注意力权重，从不同角度理解词与词的关系',
            },
            {
              title: '位置编码',
              desc: '为每个词添加位置信息，让模型理解词的顺序',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-spacex-orange/50 transition-all duration-300"
            >
              <h4 className="font-semibold mb-2 text-spacex-orange">{item.title}</h4>
              <p className="text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
