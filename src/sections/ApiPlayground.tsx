import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Terminal,
  Send,
  Copy,
  Check,
  Settings,
  Code,
  Play,
  RotateCcw,
  Zap,
  AlertCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const examplePrompts = [
  {
    name: '翻译',
    prompt: '将以下中文翻译成英文：\n大语言模型正在改变我们的世界。',
    system: '你是一个专业的翻译助手，准确翻译用户输入的内容。',
  },
  {
    name: '总结',
    prompt: '请总结以下段落的主要观点：\n\nTransformer是一种基于注意力机制的神经网络架构，它彻底改变了自然语言处理领域。与传统的RNN和CNN不同，Transformer完全依赖注意力机制来捕捉输入序列中的全局依赖关系。',
    system: '你是一个专业的文本总结助手，提炼关键信息。',
  },
  {
    name: '代码',
    prompt: '用Python写一个函数，计算斐波那契数列的第n项。',
    system: '你是一个专业的编程助手，提供清晰、高效的代码。',
  },
  {
    name: '解释',
    prompt: '用简单的语言解释什么是注意力机制。',
    system: '你是一个耐心的教育者，用通俗易懂的方式解释复杂概念。',
  },
];

const models = [
  { name: 'GPT-4', value: 'gpt-4', maxTokens: 8192 },
  { name: 'GPT-3.5', value: 'gpt-3.5-turbo', maxTokens: 4096 },
  { name: 'Claude 3', value: 'claude-3', maxTokens: 100000 },
];

export default function ApiPlayground() {
  const sectionRef = useRef<HTMLElement>(null);
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.playground-item');
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

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse('');

    // Simulate API call
    setTimeout(() => {
      const simulatedResponses: Record<string, string> = {
        '将以下中文翻译成英文：\n大语言模型正在改变我们的世界。':
          'Large language models are changing our world.',
        '用Python写一个函数，计算斐波那契数列的第n项。':
          '```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# 或者使用迭代方式更高效\ndef fibonacci_iter(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n```',
        '用简单的语言解释什么是注意力机制。':
          '注意力机制就像是人在阅读时会重点关注某些词语一样。当模型处理一个句子时，它会给每个词分配一个"注意力分数"，告诉模型哪些词更重要、更相关。\n\n比如处理"猫坐在垫子上"这句话时，当模型看到"坐"这个词，它会更多地关注"猫"和"垫子"，因为这些词与"坐"的动作关系最密切。\n\n这让模型能够更好地理解上下文和词与词之间的关系。',
        '请总结以下段落的主要观点：\n\nTransformer是一种基于注意力机制的神经网络架构，它彻底改变了自然语言处理领域。与传统的RNN和CNN不同，Transformer完全依赖注意力机制来捕捉输入序列中的全局依赖关系。':
          '主要观点：\n\n1. **Transformer是一种革命性的神经网络架构**，基于注意力机制\n2. **它改变了NLP领域**，成为现代大语言模型的基础\n3. **与传统架构不同**：不使用RNN或CNN\n4. **核心优势**：通过注意力机制捕捉序列中的全局依赖关系',
      };

      const matchedResponse = Object.entries(simulatedResponses).find(([key]) =>
        prompt.toLowerCase().includes(key.toLowerCase().slice(0, 20))
      );

      if (matchedResponse) {
        // Typewriter effect
        const text = matchedResponse[1];
        let i = 0;
        const interval = setInterval(() => {
          setResponse(text.slice(0, i));
          i++;
          if (i > text.length) {
            clearInterval(interval);
            setIsLoading(false);
          }
        }, 20);
      } else {
        setResponse(
          `这是一个模拟响应。在实际应用中，这里会调用${selectedModel} API返回真实结果。\n\n您输入的提示是：\n"${prompt}"\n\n参数设置：\n- 模型: ${selectedModel}\n- Temperature: ${temperature}\n- Max Tokens: ${maxTokens}`
        );
        setIsLoading(false);
      }
    }, 1500);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = (example: typeof examplePrompts[0]) => {
    setPrompt(example.prompt);
    setSystemPrompt(example.system);
  };

  const generateCode = () => {
    const code = `import openai

# 设置API密钥
openai.api_key = "your-api-key"

# 调用API
response = openai.ChatCompletion.create(
    model="${selectedModel}",
    messages=[
        {"role": "system", "content": "${systemPrompt || 'You are a helpful assistant.'}"},
        {"role": "user", "content": "${prompt}"}
    ],
    temperature=${temperature},
    max_tokens=${maxTokens}
)

# 获取回复
print(response.choices[0].message.content)`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section ref={sectionRef} id="playground" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="playground-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <Terminal className="w-4 h-4" />
            <span>API Playground</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            在线<span className="text-gradient">体验</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            无需注册，直接体验大语言模型的强大能力
          </p>
        </div>

        <div className="playground-item grid lg:grid-cols-3 gap-6 opacity-0">
          {/* Sidebar - Examples */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-white/60 mb-4">示例提示</h3>
            {examplePrompts.map((example) => (
              <button
                key={example.name}
                onClick={() => loadExample(example)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-spacex-orange/50 hover:bg-white/[0.08] transition-all text-left"
              >
                <span className="font-medium">{example.name}</span>
                <p className="text-sm text-white/40 mt-1 line-clamp-1">{example.prompt}</p>
              </button>
            ))}

            {/* Tips */}
            <div className="p-4 rounded-xl bg-spacex-blue/10 border border-spacex-blue/30">
              <h4 className="font-semibold text-spacex-blue mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                提示技巧
              </h4>
              <ul className="text-sm text-white/60 space-y-1">
                <li>• 使用清晰的指令</li>
                <li>• 提供具体的上下文</li>
                <li>• 指定输出格式</li>
                <li>• 使用示例说明期望</li>
              </ul>
            </div>
          </div>

          {/* Main - Playground */}
          <div className="lg:col-span-2 space-y-4">
            {/* Model & Settings */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">模型:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-spacex-orange"
                >
                  {models.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  showSettings
                    ? 'bg-spacex-orange/20 text-spacex-orange'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <Settings className="w-4 h-4" />
                参数设置
              </button>

              <button
                onClick={generateCode}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 text-sm transition-all ml-auto"
              >
                <Code className="w-4 h-4" />
                {copied ? '已复制' : '复制代码'}
              </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Temperature: {temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>确定性</span>
                    <span>创造性</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Max Tokens: {maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <span className="text-sm text-white/60 mb-2 block">System Prompt:</span>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="设置AI的角色和行为..."
                    className="w-full h-20 px-4 py-2 rounded-lg bg-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-spacex-orange resize-none"
                  />
                </div>
              </div>
            )}

            {/* Input */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="输入你的提示..."
                className="w-full h-40 px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-spacex-orange resize-none"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setPrompt('');
                    setResponse('');
                  }}
                  className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                  title="清空"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-spacex-orange text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-spacex-orange/80 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      发送
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output */}
            {(response || isLoading) && (
              <div className="relative p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/60 flex items-center gap-2">
                    <Play className="w-4 h-4 text-spacex-orange" />
                    响应
                  </span>
                  {response && (
                    <button
                      onClick={copyResponse}
                      className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          复制
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="text-white/80 whitespace-pre-wrap font-mono text-sm">
                  {response}
                  {isLoading && !response && (
                    <span className="inline-block w-2 h-4 bg-spacex-orange animate-pulse ml-1" />
                  )}
                </div>
              </div>
            )}

            {/* Note */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-500/80">
                这是演示环境，响应为模拟数据。实际使用需要配置API密钥。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
