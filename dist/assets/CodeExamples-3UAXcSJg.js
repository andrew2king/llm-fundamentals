import{c as u,r,g as l,S as m,j as e,B as x}from"./index-DTZS1dPW.js";import{L as g}from"./layers-nroYP5gh.js";import{C as _}from"./cpu-lrn7rNql.js";import{C as f}from"./check-DcblLSXN.js";import{C as b}from"./copy-DbU4KFsF.js";const k=[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]],C=u("terminal",k);l.registerPlugin(m);const d=[{id:"tokenization",title:"Tokenization",icon:C,description:"将文本转换为模型可理解的token序列",language:"python",code:`from transformers import AutoTokenizer

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
print(f"Decoded: {decoded}")`},{id:"embedding",title:"词嵌入",icon:g,description:"将token转换为高维向量表示",language:"python",code:`import torch
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
print(f"Embedding (first 10): {first_token_embedding[:10]}")`},{id:"attention",title:"注意力机制",icon:_,description:"实现Scaled Dot-Product Attention",language:"python",code:`import torch
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
        return self.W_o(output), attn_weights`},{id:"inference",title:"模型推理",icon:x,description:"使用预训练模型进行文本生成",language:"python",code:`from transformers import AutoModelForCausalLM, AutoTokenizer
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
    return probs`}];function T(){const o=r.useRef(null),[s,p]=r.useState(0),[i,a]=r.useState(!1);r.useEffect(()=>{const n=l.context(()=>{m.create({trigger:o.current,start:"top 80%",onEnter:()=>{const t=o.current?.querySelectorAll(".code-item");t&&t.length>0&&l.fromTo(t,{y:40,opacity:0},{y:0,opacity:1,duration:.6,stagger:.1,ease:"expo.out"})},once:!0})},o);return()=>n.revert()},[]);const h=()=>{navigator.clipboard.writeText(d[s].code),a(!0),setTimeout(()=>a(!1),2e3)},c=d[s];return e.jsx("section",{"code-path":"src/sections/CodeExamples.tsx:184:5",ref:o,id:"code",className:"relative py-32 overflow-hidden",children:e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:185:7",className:"max-w-7xl mx-auto px-6",children:[e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:187:9",className:"code-item text-center mb-12 opacity-0",children:[e.jsx("div",{"code-path":"src/sections/CodeExamples.tsx:188:11",className:"inline-flex items-center gap-2 text-sm font-mono text-spacex-orange mb-4",children:e.jsx("span",{"code-path":"src/sections/CodeExamples.tsx:189:13",children:"代码示例"})}),e.jsxs("h2",{"code-path":"src/sections/CodeExamples.tsx:191:11",className:"text-4xl md:text-5xl font-bold mb-4",children:["动手实践",e.jsx("span",{"code-path":"src/sections/CodeExamples.tsx:192:17",className:"text-gradient",children:"LLM"})]}),e.jsx("p",{"code-path":"src/sections/CodeExamples.tsx:194:11",className:"text-white/60 max-w-2xl mx-auto",children:"通过实际代码理解大语言模型的核心实现"})]}),e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:199:9",className:"code-item grid lg:grid-cols-4 gap-6 opacity-0",children:[e.jsx("div",{"code-path":"src/sections/CodeExamples.tsx:201:11",className:"lg:col-span-1 space-y-3",children:d.map((n,t)=>e.jsxs("button",{"code-path":"src/sections/CodeExamples.tsx:203:15",onClick:()=>p(t),className:`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 ${s===t?"bg-spacex-orange/20 border border-spacex-orange":"bg-white/5 border border-white/10 hover:bg-white/10"}`,children:[e.jsx(n.icon,{"code-path":"src/sections/CodeExamples.tsx:212:17",className:`w-5 h-5 ${s===t?"text-spacex-orange":"text-white/60"}`}),e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:217:17",children:[e.jsx("h4",{"code-path":"src/sections/CodeExamples.tsx:218:19",className:"font-medium text-sm",children:n.title}),e.jsx("p",{"code-path":"src/sections/CodeExamples.tsx:219:19",className:"text-xs text-white/40 mt-0.5",children:n.description})]})]},n.id))}),e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:226:11",className:"lg:col-span-3",children:[e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:227:13",className:"rounded-2xl bg-[#1a1a2e] border border-white/10 overflow-hidden",children:[e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:229:15",className:"flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10",children:[e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:230:17",className:"flex items-center gap-3",children:[e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:231:19",className:"flex items-center gap-1.5",children:[e.jsx("div",{"code-path":"src/sections/CodeExamples.tsx:232:21",className:"w-3 h-3 rounded-full bg-red-500"}),e.jsx("div",{"code-path":"src/sections/CodeExamples.tsx:233:21",className:"w-3 h-3 rounded-full bg-yellow-500"}),e.jsx("div",{"code-path":"src/sections/CodeExamples.tsx:234:21",className:"w-3 h-3 rounded-full bg-green-500"})]}),e.jsxs("span",{"code-path":"src/sections/CodeExamples.tsx:236:19",className:"text-sm text-white/40 ml-3",children:[c.title.toLowerCase(),".py"]})]}),e.jsx("button",{"code-path":"src/sections/CodeExamples.tsx:240:17",onClick:h,className:"flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300",children:i?e.jsxs(e.Fragment,{children:[e.jsx(f,{"code-path":"src/sections/CodeExamples.tsx:246:23",className:"w-4 h-4 text-green-500"}),e.jsx("span",{"code-path":"src/sections/CodeExamples.tsx:247:23",className:"text-sm text-green-500",children:"已复制"})]}):e.jsxs(e.Fragment,{children:[e.jsx(b,{"code-path":"src/sections/CodeExamples.tsx:251:23",className:"w-4 h-4 text-white/60"}),e.jsx("span",{"code-path":"src/sections/CodeExamples.tsx:252:23",className:"text-sm text-white/60",children:"复制"})]})})]}),e.jsx("div",{"code-path":"src/sections/CodeExamples.tsx:259:15",className:"p-6 overflow-x-auto",children:e.jsx("pre",{"code-path":"src/sections/CodeExamples.tsx:260:17",className:"text-sm font-mono leading-relaxed",children:e.jsx("code",{"code-path":"src/sections/CodeExamples.tsx:261:19",className:"language-python",children:c.code.split(`
`).map((n,t)=>e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:263:23",className:"flex",children:[e.jsx("span",{"code-path":"src/sections/CodeExamples.tsx:264:25",className:"text-white/30 w-8 text-right mr-4 select-none",children:t+1}),e.jsx("span",{"code-path":"src/sections/CodeExamples.tsx:267:25",dangerouslySetInnerHTML:{__html:E(n)}})]},t))})})})]}),e.jsxs("div",{"code-path":"src/sections/CodeExamples.tsx:280:13",className:"mt-6 p-6 rounded-xl bg-white/[0.03] border border-white/10",children:[e.jsxs("h4",{"code-path":"src/sections/CodeExamples.tsx:281:15",className:"font-semibold mb-2 flex items-center gap-2",children:[e.jsx(x,{"code-path":"src/sections/CodeExamples.tsx:282:17",className:"w-5 h-5 text-spacex-orange"}),"代码解析"]}),e.jsx("p",{"code-path":"src/sections/CodeExamples.tsx:285:15",className:"text-white/60 text-sm leading-relaxed",children:w(c.id)})]})]})]})]})})}function E(o){let s=o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return s=s.replace(/(#.*$)/gm,'<span class="text-green-500">$1</span>'),s=s.replace(/(['"`].*?['"`])/g,'<span class="text-yellow-500">$1</span>'),["import","from","def","class","return","if","else","for","in","with","as","self","super"].forEach(i=>{const a=new RegExp(`\\b(${i})\\b`,"g");s=s.replace(a,'<span class="text-purple-400">$1</span>')}),s=s.replace(/(\w+)(?=\()/g,'<span class="text-blue-400">$1</span>'),s=s.replace(/\b(\d+)\b/g,'<span class="text-orange-400">$1</span>'),s}function w(o){return{tokenization:"Tokenization是LLM处理文本的第一步。它将原始文本拆分成模型可理解的token单元。不同的模型使用不同的tokenization策略，如BPE（Byte Pair Encoding）或WordPiece。理解tokenization有助于优化输入长度和控制生成成本。",embedding:"词嵌入将离散的token ID转换为连续的向量表示。这些向量捕捉了词的语义信息，语义相近的词在向量空间中距离更近。嵌入维度（如768或1024）决定了模型表示能力的上限。",attention:"自注意力机制是Transformer的核心创新。它允许模型在处理每个词时，动态地关注输入序列中的其他词。多头注意力使用多组不同的投影矩阵，从不同角度捕捉词间关系。",inference:"模型推理阶段，我们使用预训练好的模型进行文本生成。关键参数包括temperature（控制随机性）、top_p（nucleus sampling）和max_length（生成长度）。合理的参数设置可以平衡创造性和连贯性。"}[o]||""}export{T as default};
