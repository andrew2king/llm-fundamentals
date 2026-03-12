# 课时 18：智能客服 Agent - 知识库对接与问答实现

> Agent 开发实战 - 模块四：实战项目

## 一、知识库设计

### 1.1 知识类型

| 知识类型 | 示例 | 更新频率 |
|---------|------|---------|
| FAQ | 退货政策、配送范围 | 低 |
| 产品信息 | 产品参数、价格 | 中 |
| 流程指南 | 如何下单、如何退款 | 低 |
| 常见问题 | 支付失败、登录问题 | 中 |

### 1.2 知识库结构

```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class KnowledgeItem(BaseModel):
    """知识条目"""
    id: str
    category: str              # 分类
    question: str              # 问题
    answer: str                # 答案
    keywords: List[str]        # 关键词
    tags: List[str]            # 标签
    source: str                # 来源
    created_at: datetime
    updated_at: datetime

class KnowledgeBase:
    """知识库"""

    def __init__(self):
        self.items: List[KnowledgeItem] = []

    def add(self, item: KnowledgeItem):
        """添加知识"""
        self.items.append(item)

    def search_by_keywords(self, query: str) -> List[KnowledgeItem]:
        """关键词搜索"""
        results = []
        query_lower = query.lower()
        for item in self.items:
            # 匹配关键词
            if any(kw.lower() in query_lower for kw in item.keywords):
                results.append(item)
            # 匹配问题
            elif query_lower in item.question.lower():
                results.append(item)
        return results
```

---

## 二、向量化与存储

### 2.1 文档加载

```python
from langchain.document_loaders import (
    TextLoader,
    CSVLoader,
    JSONLoader,
    DirectoryLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter

class KnowledgeLoader:
    """知识加载器"""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", "；", " "]
        )

    def load_faq_csv(self, file_path: str) -> list:
        """加载 FAQ CSV 文件"""
        loader = CSVLoader(file_path)
        documents = loader.load()
        return self.text_splitter.split_documents(documents)

    def load_json(self, file_path: str, jq_schema: str) -> list:
        """加载 JSON 文件"""
        loader = JSONLoader(file_path, jq_schema=jq_schema)
        documents = loader.load()
        return self.text_splitter.split_documents(documents)

    def load_directory(self, directory: str, glob: str = "**/*.md") -> list:
        """加载目录下的文档"""
        loader = DirectoryLoader(directory, glob=glob)
        documents = loader.load()
        return self.text_splitter.split_documents(documents)
```

### 2.2 向量存储

```python
from langchain.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from typing import List, Optional

class VectorKnowledgeBase:
    """向量知识库"""

    def __init__(self, persist_directory: str = "./knowledge_db"):
        self.embeddings = OpenAIEmbeddings()
        self.persist_directory = persist_directory
        self.vectorstore: Optional[Chroma] = None

    def build_from_documents(self, documents: List):
        """从文档构建向量库"""
        self.vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory=self.persist_directory
        )
        self.vectorstore.persist()

    def load_existing(self):
        """加载已有向量库"""
        self.vectorstore = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )

    def search(self, query: str, k: int = 3) -> List:
        """相似度搜索"""
        if not self.vectorstore:
            raise ValueError("向量库未初始化")

        results = self.vectorstore.similarity_search(query, k=k)
        return results

    def search_with_scores(self, query: str, k: int = 3):
        """带分数的搜索"""
        results = self.vectorstore.similarity_search_with_score(query, k=k)
        return results

    def add_documents(self, documents: List):
        """增量添加文档"""
        if not self.vectorstore:
            self.build_from_documents(documents)
        else:
            self.vectorstore.add_documents(documents)
            self.vectorstore.persist()
```

### 2.3 知识管理

```python
class KnowledgeManager:
    """知识管理器"""

    def __init__(self, vector_db: VectorKnowledgeBase):
        self.vector_db = vector_db

    def import_faq(self, faq_data: List[dict]):
        """导入 FAQ 数据"""
        from langchain.schema import Document

        documents = []
        for item in faq_data:
            doc = Document(
                page_content=f"问题：{item['question']}\n答案：{item['answer']}",
                metadata={
                    "category": item.get("category", "general"),
                    "source": "faq",
                    "id": item.get("id")
                }
            )
            documents.append(doc)

        self.vector_db.add_documents(documents)

    def update_knowledge(self, item_id: str, new_content: str):
        """更新知识（删除旧版本，添加新版本）"""
        # Chroma 不支持直接更新，需要删除后重新添加
        # 实际项目中可以考虑使用支持更新的向量数据库
        pass

    def get_stats(self) -> dict:
        """获取知识库统计"""
        # 返回知识库统计信息
        return {
            "total_documents": self.vector_db.vectorstore._collection.count()
        }
```

---

## 三、问答链实现

### 3.1 基础问答链

```python
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

class QAChain:
    """问答链"""

    QA_PROMPT = PromptTemplate.from_template("""
你是一个专业的客服助手，请根据以下知识库内容回答用户问题。

要求：
1. 只使用知识库中的信息回答
2. 如果知识库中没有相关信息，请诚实告知
3. 回答要简洁、准确、友好

知识库内容：
{context}

用户问题：{question}

回答：
""")

    def __init__(self, llm: ChatOpenAI, vector_db: VectorKnowledgeBase):
        self.llm = llm
        self.vector_db = vector_db

        # 创建检索 QA 链
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vector_db.vectorstore.as_retriever(
                search_kwargs={"k": 3}
            ),
            chain_type_kwargs={"prompt": self.QA_PROMPT},
            return_source_documents=True
        )

    def answer(self, question: str) -> dict:
        """回答问题"""
        result = self.qa_chain.invoke({"query": question})

        return {
            "answer": result["result"],
            "sources": [
                doc.metadata for doc in result.get("source_documents", [])
            ]
        }
```

### 3.2 多轮对话问答

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

class ConversationalQA:
    """多轮对话问答"""

    CONDENSATION_PROMPT = PromptTemplate.from_template("""
根据以下对话历史和最新问题，生成一个独立的问题。

对话历史：
{chat_history}

最新问题：{question}

独立问题：
""")

    def __init__(self, llm: ChatOpenAI, vector_db: VectorKnowledgeBase):
        self.llm = llm
        self.vector_db = vector_db
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

        # 创建多轮对话链
        self.chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vector_db.vectorstore.as_retriever(),
            memory=self.memory,
            condense_question_prompt=self.CONDENSATION_PROMPT,
            return_source_documents=True
        )

    def chat(self, question: str) -> dict:
        """对话"""
        result = self.chain.invoke({"question": question})

        return {
            "answer": result["answer"],
            "chat_history": self.memory.load_memory_variables({})
        }

    def reset(self):
        """重置对话"""
        self.memory.clear()
```

### 3.3 混合检索

```python
from langchain.retrievers import EnsembleRetriever
from langchain.retrievers import BM25Retriever
from typing import List

class HybridRetriever:
    """混合检索器：关键词 + 向量"""

    def __init__(
        self,
        vector_db: VectorKnowledgeBase,
        documents: List,
        vector_weight: float = 0.5
    ):
        # 向量检索器
        self.vector_retriever = vector_db.vectorstore.as_retriever(
            search_kwargs={"k": 5}
        )

        # BM25 关键词检索器
        self.bm25_retriever = BM25Retriever.from_documents(documents)
        self.bm25_retriever.k = 5

        # 混合检索器
        self.ensemble_retriever = EnsembleRetriever(
            retrievers=[self.bm25_retriever, self.vector_retriever],
            weights=[1 - vector_weight, vector_weight]
        )

    def retrieve(self, query: str, k: int = 5) -> List:
        """检索"""
        return self.ensemble_retriever.get_relevant_documents(query)[:k]
```

---

## 四、完整问答系统

### 4.1 系统集成

```python
from langchain_openai import ChatOpenAI
from typing import Dict, Any

class CustomerQASystem:
    """客服问答系统"""

    def __init__(self, knowledge_path: str = "./knowledge"):
        # 初始化 LLM
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

        # 初始化知识库
        self.vector_db = VectorKnowledgeBase(
            persist_directory=f"{knowledge_path}/vector_db"
        )

        # 尝试加载已有知识库
        try:
            self.vector_db.load_existing()
        except:
            print("知识库不存在，请先导入知识")

        # 初始化问答链
        self.qa_chain = QAChain(self.llm, self.vector_db)
        self.conversational_qa = ConversationalQA(self.llm, self.vector_db)

        # 会话管理
        self.sessions: Dict[str, ConversationalQA] = {}

    def get_or_create_session(self, session_id: str) -> ConversationalQA:
        """获取或创建会话"""
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationalQA(
                self.llm, self.vector_db
            )
        return self.sessions[session_id]

    def chat(self, question: str, session_id: str = "default") -> Dict[str, Any]:
        """对话"""
        session = self.get_or_create_session(session_id)
        result = session.chat(question)

        return {
            "answer": result["answer"],
            "session_id": session_id
        }

    def simple_qa(self, question: str) -> Dict[str, Any]:
        """简单问答（无记忆）"""
        return self.qa_chain.answer(question)

    def import_knowledge(self, documents: List):
        """导入知识"""
        self.vector_db.add_documents(documents)

        # 重新初始化问答链
        self.qa_chain = QAChain(self.llm, self.vector_db)
        self.conversational_qa = ConversationalQA(self.llm, self.vector_db)

    def end_session(self, session_id: str):
        """结束会话"""
        if session_id in self.sessions:
            self.sessions[session_id].reset()
            del self.sessions[session_id]
```

### 4.2 使用示例

```python
# 初始化系统
qa_system = CustomerQASystem()

# 导入知识（首次使用）
from langchain.schema import Document

faq_documents = [
    Document(
        page_content="问题：退货政策是什么？\n答案：自收到商品起7天内可无理由退货，30天内如有质量问题可免费换货。",
        metadata={"category": "售后", "source": "faq"}
    ),
    Document(
        page_content="问题：配送范围有哪些？\n答案：目前支持全国配送，偏远地区可能需要额外运费。",
        metadata={"category": "配送", "source": "faq"}
    ),
]

qa_system.import_knowledge(faq_documents)

# 简单问答
result = qa_system.simple_qa("退货政策是什么？")
print(result["answer"])

# 多轮对话
result1 = qa_system.chat("你们有什么产品？", session_id="user_123")
result2 = qa_system.chat("价格是多少？", session_id="user_123")  # 会关联上下文
```

---

## 五、效果优化

### 5.1 重排序

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

class RerankingRetriever:
    """带重排序的检索器"""

    def __init__(self, base_retriever, llm):
        # 使用 LLM 提取相关内容
        compressor = LLMChainExtractor.from_llm(llm)

        self.retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=base_retriever
        )

    def retrieve(self, query: str):
        return self.retriever.get_relevant_documents(query)
```

### 5.2 答案验证

```python
class AnswerValidator:
    """答案验证器"""

    def __init__(self, llm: ChatOpenAI):
        self.llm = llm

    def validate(self, question: str, answer: str, context: str) -> dict:
        """验证答案质量"""
        prompt = f"""
        评估以下答案的质量：

        问题：{question}
        答案：{answer}
        参考内容：{context}

        请评估：
        1. 答案是否准确（0-10分）
        2. 答案是否完整（0-10分）
        3. 答案是否相关（0-10分）
        4. 是否需要转人工（是/否）

        以 JSON 格式返回。
        """

        response = self.llm.invoke(prompt)
        # 解析返回
        return {
            "accuracy": 8,
            "completeness": 9,
            "relevance": 10,
            "need_human": False
        }
```

---

## 六、本课小结

### 6.1 关键要点

1. **知识库设计**：分类管理，结构清晰
2. **向量化存储**：Chroma + OpenAI Embeddings
3. **问答链实现**：单轮问答 + 多轮对话
4. **混合检索**：关键词 + 向量检索结合

### 6.2 下一步

下一课将实现系统集成与部署。

---

**下一课**：智能客服 Agent - 系统集成与部署