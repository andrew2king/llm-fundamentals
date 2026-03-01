import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calculator, Info, Copy, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CalcResult {
  totalParams: number;
  memoryGB: number;
  trainingCost: number;
  inferenceCost: number;
  flops: number;
}

export default function ParamCalculator() {
  const sectionRef = useRef<HTMLElement>(null);
  const [vocabSize, setVocabSize] = useState(50000);
  const [hiddenSize, setHiddenSize] = useState(768);
  const [numLayers, setNumLayers] = useState(12);
  const [numHeads, setNumHeads] = useState(12);
  const [intermediateSize, setIntermediateSize] = useState(3072);
  const [maxPosition, setMaxPosition] = useState(2048);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.calc-item');
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

  const calculate = () => {
    // Embedding parameters
    const tokenEmbedding = vocabSize * hiddenSize;
    const positionEmbedding = maxPosition * hiddenSize;
    const embeddingParams = tokenEmbedding + positionEmbedding;

    // Transformer layer parameters
    // Self-attention: 4 * hiddenSize^2 (Q, K, V, O projections)
    const attentionParams = 4 * hiddenSize * hiddenSize;
    // FFN: 2 * hiddenSize * intermediateSize
    const ffnParams = hiddenSize * intermediateSize + intermediateSize * hiddenSize;
    // Layer norms: 2 * hiddenSize per layer
    const layerNormParams = 2 * hiddenSize;

    const layerParams = attentionParams + ffnParams + layerNormParams;
    const allLayersParams = layerParams * numLayers;

    // Output layer
    const outputParams = hiddenSize * vocabSize;

    // Total
    const totalParams = embeddingParams + allLayersParams + outputParams;

    // Memory estimation (FP32)
    const memoryBytes = totalParams * 4;
    const memoryGB = memoryBytes / (1024 ** 3);

    // FLOPs per token (rough estimation)
    const flops = 2 * totalParams;

    // Cost estimation (rough)
    const trainingCost = (totalParams / 1e9) * 0.5; // $0.5 per billion params
    const inferenceCost = (totalParams / 1e9) * 0.001; // $0.001 per billion params per 1K tokens

    setResult({
      totalParams,
      memoryGB,
      trainingCost,
      inferenceCost,
      flops,
    });
  };

  const copyResult = () => {
    if (!result) return;
    const text = `模型参数统计:
总参数量: ${formatNumber(result.totalParams)}
显存需求: ${result.memoryGB.toFixed(2)} GB (FP32)
训练成本估算: $${result.trainingCost.toFixed(2)}M
推理成本估算: $${result.inferenceCost.toFixed(4)}/1K tokens
FLOPs: ${formatNumber(result.flops)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  const presets = [
    { name: 'GPT-2 Small', vocab: 50257, hidden: 768, layers: 12, heads: 12, intermediate: 3072, pos: 1024 },
    { name: 'GPT-2 Medium', vocab: 50257, hidden: 1024, layers: 24, heads: 16, intermediate: 4096, pos: 1024 },
    { name: 'BERT-Base', vocab: 30522, hidden: 768, layers: 12, heads: 12, intermediate: 3072, pos: 512 },
    { name: 'BERT-Large', vocab: 30522, hidden: 1024, layers: 24, heads: 16, intermediate: 4096, pos: 512 },
    { name: 'GPT-3', vocab: 50257, hidden: 12288, layers: 96, heads: 96, intermediate: 49152, pos: 2048 },
  ];

  const loadPreset = (preset: typeof presets[0]) => {
    setVocabSize(preset.vocab);
    setHiddenSize(preset.hidden);
    setNumLayers(preset.layers);
    setNumHeads(preset.heads);
    setIntermediateSize(preset.intermediate);
    setMaxPosition(preset.pos);
    setResult(null);
  };

  return (
    <section ref={sectionRef} id="calculator" className="relative py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="calc-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Calculator className="w-4 h-4" />
            <span>参数计算器</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            LLM<span className="text-gradient">参数估算</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            估算Transformer模型的参数量、内存需求和训练成本
          </p>
        </div>

        {/* Presets */}
        <div className="calc-item flex flex-wrap items-center justify-center gap-2 mb-8 opacity-0">
          <span className="text-sm text-white/40 mr-2">快速选择:</span>
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="calc-item grid lg:grid-cols-2 gap-8 opacity-0">
          {/* Input Form */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-spacex-orange" />
              模型配置
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    词汇表大小 (Vocab Size)
                  </label>
                  <input
                    type="number"
                    value={vocabSize}
                    onChange={(e) => setVocabSize(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-spacex-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    隐藏层维度 (Hidden Size)
                  </label>
                  <input
                    type="number"
                    value={hiddenSize}
                    onChange={(e) => setHiddenSize(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-spacex-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    层数 (Num Layers)
                  </label>
                  <input
                    type="number"
                    value={numLayers}
                    onChange={(e) => setNumLayers(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-spacex-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    注意力头数 (Num Heads)
                  </label>
                  <input
                    type="number"
                    value={numHeads}
                    onChange={(e) => setNumHeads(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-spacex-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    FFN中间维度 (Intermediate)
                  </label>
                  <input
                    type="number"
                    value={intermediateSize}
                    onChange={(e) => setIntermediateSize(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-spacex-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    最大位置 (Max Position)
                  </label>
                  <input
                    type="number"
                    value={maxPosition}
                    onChange={(e) => setMaxPosition(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-spacex-orange"
                  />
                </div>
              </div>

              <button
                onClick={calculate}
                className="w-full py-4 rounded-xl bg-spacex-orange text-white font-semibold hover:bg-spacex-orange/80 transition-colors"
              >
                计算参数
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">计算结果</h3>
              {result && (
                <button
                  onClick={copyResult}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/60">复制</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-sm text-white/60 mb-1">总参数量</div>
                  <div className="text-3xl font-bold text-gradient">{formatNumber(result.totalParams)}</div>
                  <div className="text-sm text-white/40">{result.totalParams.toLocaleString()} 参数</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-sm text-white/60 mb-1">显存需求 (FP32)</div>
                    <div className="text-xl font-semibold text-spacex-blue">{result.memoryGB.toFixed(2)} GB</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-sm text-white/60 mb-1">显存需求 (FP16)</div>
                    <div className="text-xl font-semibold text-spacex-orange">{(result.memoryGB / 2).toFixed(2)} GB</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-sm text-white/60 mb-1">训练成本估算</div>
                  <div className="text-xl font-semibold">${result.trainingCost.toFixed(2)}M</div>
                  <div className="text-xs text-white/40">基于每B参数$0.5M估算</div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-sm text-white/60 mb-1">推理成本估算</div>
                  <div className="text-xl font-semibold">${result.inferenceCost.toFixed(4)}</div>
                  <div className="text-xs text-white/40">每1K tokens</div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-sm text-white/60 mb-1">FLOPs (每token)</div>
                  <div className="text-xl font-semibold font-mono">{formatNumber(result.flops)}</div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/40">
                <div className="text-center">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>输入参数后点击计算</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="calc-item mt-8 p-6 rounded-xl bg-white/[0.03] border border-white/10 opacity-0">
          <h4 className="font-semibold mb-4">计算公式说明</h4>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-white/60">
            <div>
              <h5 className="text-white font-medium mb-2">嵌入层</h5>
              <ul className="space-y-1">
                <li>• Token Embedding: vocab_size × hidden_size</li>
                <li>• Position Embedding: max_position × hidden_size</li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-medium mb-2">Transformer层 (每层)</h5>
              <ul className="space-y-1">
                <li>• Self-Attention: 4 × hidden_size²</li>
                <li>• FFN: 2 × hidden_size × intermediate_size</li>
                <li>• Layer Norm: 2 × hidden_size</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
