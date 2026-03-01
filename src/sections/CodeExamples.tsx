import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Copy, Check, Terminal, BookOpen, Cpu, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const codeExamples = [
  {
    id: 'tokenization',
    title: 'Tokenization',
    icon: Terminal,
    description: '将文本转换为模型可理解的token序列',
    language: 'python',
    code: `from transformers import AutoTokenizer

# 加载预训练tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")

# 编码文本
text = "大语言模型改变世界"
tokens = tokenizer.tokenize(text)
print(f"Tokens: {tokens}")
# 输出: ['大', '语', '言', '模', '型', '改', '变', '世', '界']

# 转换为ID
input_ids = tokenizer.encode(text)
print(f"IDs: {input_ids}")
# 输出: [101, 1921, 6381, ...]

# 解码回文本
decoded = tokenizer.decode(input_ids)
print(f"Decoded: {decoded}")`,
  },
  {
    id: 'embedding',
    title: '词嵌入',
    icon: Layers,
    description: '将token转换为高维向量表示',
    language: 'python',
    code: `import torch
import torch.nn as nn

# 定义嵌入层
vocab_size = 30000  # 词汇表大小
embedding_dim = 768  # 嵌入维度

embedding = nn.Embedding(vocab_size, embedding_dim)

# 输入token IDs
input_ids = torch.tensor([[101, 1921, 6381, 102]])

# 获取嵌入向量
embeddings = embedding(input_ids)
print(f"Shape: {embeddings.shape}")
# 输出: torch.Size([1, 4, 768])

# 查看第一个token的嵌入
first_token_embedding = embeddings[0, 1]
print(f"Embedding (first 10): {first_token_embedding[:10]}")`,
  },
  {
    id: 'attention',
    title: '注意力机制',
    icon: Cpu,
    description: '实现Scaled Dot-Product Attention',
    language: 'python',
    code: `import torch
import torch.nn as nn
import math

class SelfAttention(nn.Module):
    def __init__(self, d_model=512, num_heads=8):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, x, mask=None):
        batch_size, seq_len, _ = x.shape
        
        # 生成Q, K, V
        Q = self.W_q(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        
        # 计算注意力分数
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        attn_weights = torch.softmax(scores, dim=-1)
        output = torch.matmul(attn_weights, V)
        
        # 合并多头
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)
        return self.W_o(output), attn_weights`,
  },
  {
    id: 'inference',
    title: '模型推理',
    icon: BookOpen,
    description: '使用预训练模型进行文本生成',
    language: 'python',
    code: `from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# 加载模型和tokenizer
model_name = "gpt2"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# 准备输入
prompt = "人工智能的未来"
inputs = tokenizer(prompt, return_tensors="pt")

# 生成文本
with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_length=50,
        num_return_sequences=1,
        temperature=0.7,
        top_p=0.9,
        do_sample=True
    )

# 解码输出
generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(generated_text)

# 查看生成概率
def get_token_probs(model, tokenizer, text):
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1)
    return probs`,
  },
];

export default function CodeExamples() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeExample, setActiveExample] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          const items = sectionRef.current?.querySelectorAll('.code-item');
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

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeExample].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentExample = codeExamples[activeExample];

  return (
    <section ref={sectionRef} id="code" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="code-item text-center mb-12 opacity-0">
          <div className="inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4">
            <span>代码示例</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            动手实践<span className="text-gradient">LLM</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            通过实际代码理解大语言模型的核心实现
          </p>
        </div>

        <div className="code-item grid lg:grid-cols-4 gap-6 opacity-0">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            {codeExamples.map((example, index) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(index)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${
                  activeExample === index
                    ? 'bg-spacex-orange/20 border border-spacex-orange'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <example.icon
                  className={`w-5 h-5 ${
                    activeExample === index ? 'text-spacex-orange' : 'text-white/60'
                  }`}
                />
                <div>
                  <h4 className="font-medium text-sm">{example.title}</h4>
                  <p className="text-xs text-white/40 mt-0.5">{example.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Code Display */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-[#1a1a2e] border border-white/10 overflow-hidden">
              {/* Code Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm text-white/40 ml-3">
                    {currentExample.title.toLowerCase()}.py
                  </span>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
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
              </div>

              {/* Code Content */}
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  <code className="language-python">
                    {currentExample.code.split('\n').map((line, i) => (
                      <div key={i} className="flex">
                        <span className="text-white/30 w-8 text-right mr-4 select-none">
                          {i + 1}
                        </span>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(line),
                          }}
                        />
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Explanation */}
            <div className="mt-6 p-6 rounded-xl bg-white/[0.03] border border-white/10">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-spacex-orange" />
                代码解析
              </h4>
              <p className="text-white/60 text-sm leading-relaxed">
                {getExplanation(currentExample.id)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Simple syntax highlighting
function highlightCode(line: string): string {
  let highlighted = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  highlighted = highlighted.replace(
    /(#.*$)/gm,
    '<span class="text-green-500">$1</span>'
  );

  // Strings
  highlighted = highlighted.replace(
    /(['"`].*?['"`])/g,
    '<span class="text-yellow-500">$1</span>'
  );

  // Keywords
  const keywords = ['import', 'from', 'def', 'class', 'return', 'if', 'else', 'for', 'in', 'with', 'as', 'self', 'super'];
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="text-purple-400">$1</span>');
  });

  // Functions
  highlighted = highlighted.replace(
    /(\w+)(?=\()/g,
    '<span class="text-blue-400">$1</span>'
  );

  // Numbers
  highlighted = highlighted.replace(
    /\b(\d+)\b/g,
    '<span class="text-orange-400">$1</span>'
  );

  return highlighted;
}

function getExplanation(id: string): string {
  const explanations: Record<string, string> = {
    tokenization:
      'Tokenization是LLM处理文本的第一步。它将原始文本拆分成模型可理解的token单元。不同的模型使用不同的tokenization策略，如BPE（Byte Pair Encoding）或WordPiece。理解tokenization有助于优化输入长度和控制生成成本。',
    embedding:
      '词嵌入将离散的token ID转换为连续的向量表示。这些向量捕捉了词的语义信息，语义相近的词在向量空间中距离更近。嵌入维度（如768或1024）决定了模型表示能力的上限。',
    attention:
      '自注意力机制是Transformer的核心创新。它允许模型在处理每个词时，动态地关注输入序列中的其他词。多头注意力使用多组不同的投影矩阵，从不同角度捕捉词间关系。',
    inference:
      '模型推理阶段，我们使用预训练好的模型进行文本生成。关键参数包括temperature（控制随机性）、top_p（nucleus sampling）和max_length（生成长度）。合理的参数设置可以平衡创造性和连贯性。',
  };
  return explanations[id] || '';
}
