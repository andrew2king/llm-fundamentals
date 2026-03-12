# 课时 21：文档问答 Agent - 检索策略与答案生成

> Agent 开发实战 - 模块四：实战项目

## 一、检索策略

### 1.1 多种检索方法

```python
from langchain.retrievers import (
    VectorStoreRetriever,
    MultiQueryRetriever,
    ContextualCompressionRetriever,
    EnsembleRetriever
)
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain_openai import ChatOpenAI
from typing import List

class RetrievalStrategy:
    """检索策略"""

    def __init__(self, vectorstore, llm: ChatOpenAI):
        self.vectorstore = vectorstore
        self.llm = llm

    def basic_retrieval(self, query: str, k: int = 4) -> List:
        """基础向量检索"""
        retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": k}
        )
        return retriever.get_relevant_documents(query)

    def multi_query_retrieval(self, query: str, k: int = 4) -> List:
        """多查询检索：生成多个相关查询"""
        retriever = MultiQueryRetriever.from_llm(
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": k}),
            llm=self.llm
        )
        return retriever.get_relevant_documents(query)

    def compression_retrieval(self, query: str, k: int = 4) -> List:
        """压缩检索：提取相关内容"""
        base_retriever = self.vectorstore.as_retriever(search_kwargs={"k": k * 2})
        compressor = LLMChainExtractor.from_llm(self.llm)

        retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=base_retriever
        )
        return retriever.get_relevant_documents(query)

    def similarity_search_with_threshold(
        self,
        query: str,
        k: int = 4,
        threshold: float = 0.7
    ) -> List:
        """带阈值相似度检索"""
        results = self.vectorstore.similarity_search_with_score(query, k=k)

        # 过滤低于阈值的结果
        filtered = [(doc, score) for doc, score in results if score >= threshold]

        return [doc for doc, _ in filtered]
```

### 1.2 混合检索

```python
from langchain.retrievers import BM25Retriever

class HybridRetrieval:
    """混合检索：向量 + 关键词"""

    def __init__(self, vectorstore, documents: List, llm: ChatOpenAI):
        self.vectorstore = vectorstore
        self.documents = documents
        self.llm = llm

        # 创建 BM25 检索器
        self.bm25_retriever = BM25Retriever.from_documents(documents)
        self.bm25_retriever.k = 5

        # 创建向量检索器
        self.vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

        # 创建混合检索器
        self.ensemble_retriever = EnsembleRetriever(
            retrievers=[self.bm25_retriever, self.vector_retriever],
            weights=[0.3, 0.7]  # BM25 权重 0.3，向量权重 0.7
        )

    def retrieve(self, query: str, k: int = 5) -> List:
        """执行混合检索"""
        return self.ensemble_retriever.get_relevant_documents(query)[:k]
```

---

## 二、答案生成

### 2.1 问答链实现

```python
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

class DocumentQA:
    """文档问答"""

    QA_PROMPT = PromptTemplate.from_template("""
你是一个专业的文档助手，请根据提供的文档内容回答问题。

要求：
1. 只使用文档中的信息回答
2. 如果文档中没有相关信息，请明确说明
3. 回答要准确、完整、有条理
4. 在回答末尾标注信息来源

文档内容：
{context}

问题：{question}

回答：
""")

    def __init__(self, vectorstore, llm: ChatOpenAI = None):
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo", temperature=0)
        self.vectorstore = vectorstore

        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={"k": 4}),
            chain_type_kwargs={"prompt": self.QA_PROMPT},
            return_source_documents=True
        )

    def ask(self, question: str) -> dict:
        """提问"""
        result = self.qa_chain.invoke({"query": question})

        return {
            "answer": result["result"],
            "sources": [
                {
                    "content": doc.page_content[:200],
                    "source": doc.metadata.get("source_file", "未知"),
                    "page": doc.metadata.get("page", "")
                }
                for doc in result.get("source_documents", [])
            ]
        }
```

### 2.2 带引用的答案

```python
class AnswerWithCitations:
    """带引用的答案生成"""

    CITATION_PROMPT = PromptTemplate.from_template("""
根据以下文档片段回答问题，并在答案中标注引用来源。

文档片段：
{documents}

问题：{question}

请按以下格式回答：
1. 首先给出直接答案
2. 然后列出引用的具体内容
3. 标注每个引用的文档来源（使用 [来源: 文件名] 格式）

回答：
""")

    def __init__(self, llm: ChatOpenAI, retriever):
        self.llm = llm
        self.retriever = retriever

    def answer_with_citations(self, question: str) -> dict:
        """生成带引用的答案"""
        # 检索相关文档
        docs = self.retriever.get_relevant_documents(question)

        # 格式化文档
        formatted_docs = ""
        for i, doc in enumerate(docs, 1):
            formatted_docs += f"\n[文档 {i}] 来源: {doc.metadata.get('source_file', '未知')}\n"
            formatted_docs += f"{doc.page_content}\n"

        # 生成答案
        prompt = self.CITATION_PROMPT.format(
            documents=formatted_docs,
            question=question
        )

        response = self.llm.invoke(prompt)

        return {
            "answer": response.content,
            "citations": [
                {
                    "source": doc.metadata.get("source_file"),
                    "content": doc.page_content[:300]
                }
                for doc in docs
            ]
        }
```

### 2.3 对话式问答

```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

class ConversationalDocQA:
    """对话式文档问答"""

    def __init__(self, vectorstore, llm: ChatOpenAI = None):
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo", temperature=0)
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

        self.chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=vectorstore.as_retriever(),
            memory=self.memory,
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

---

## 三、完整文档问答系统

```python
from langchain_openai import ChatOpenAI
from typing import List, Optional

class DocumentQASystem:
    """完整文档问答系统"""

    def __init__(
        self,
        vectorstore,
        model: str = "gpt-4-turbo"
    ):
        self.llm = ChatOpenAI(model=model, temperature=0)
        self.vectorstore = vectorstore

        # 初始化检索策略
        self.retrieval = RetrievalStrategy(vectorstore, self.llm)

        # 初始化问答组件
        self.basic_qa = DocumentQA(vectorstore, self.llm)
        self.citation_qa = AnswerWithCitations(
            self.llm,
            vectorstore.as_retriever()
        )
        self.conversational_qa = ConversationalDocQA(vectorstore, self.llm)

        # 会话管理
        self.sessions: dict = {}

    def ask(
        self,
        question: str,
        mode: str = "basic",
        session_id: Optional[str] = None
    ) -> dict:
        """提问

        Args:
            question: 问题
            mode: 模式 (basic/citation/conversational)
            session_id: 会话ID（对话模式需要）
        """
        if mode == "basic":
            return self.basic_qa.ask(question)

        elif mode == "citation":
            return self.citation_qa.answer_with_citations(question)

        elif mode == "conversational":
            if not session_id:
                session_id = "default"

            if session_id not in self.sessions:
                self.sessions[session_id] = ConversationalDocQA(
                    self.vectorstore, self.llm
                )

            return self.sessions[session_id].chat(question)

        else:
            raise ValueError(f"不支持的模式: {mode}")

    def end_session(self, session_id: str):
        """结束会话"""
        if session_id in self.sessions:
            self.sessions[session_id].reset()
            del self.sessions[session_id]


# 使用示例
vectorstore = pipeline.process_directory("./docs")["vectorstore"]
qa_system = DocumentQASystem(vectorstore)

# 基础问答
result = qa_system.ask("如何配置系统？", mode="basic")
print(result["answer"])

# 带引用的问答
result = qa_system.ask("系统有哪些功能？", mode="citation")
print(result["answer"])
print("引用:", result["citations"])

# 对话式问答
result1 = qa_system.ask("系统支持哪些格式？", mode="conversational", session_id="user1")
result2 = qa_system.ask("第二个格式怎么用？", mode="conversational", session_id="user1")
```

---

## 四、项目二总结

### 4.1 关键要点

1. **检索策略**：向量检索、混合检索、多查询检索
2. **答案生成**：基础问答、带引用、对话式
3. **会话管理**：多用户对话支持

### 4.2 系统架构

```
用户问题
    ↓
[问题理解] → 识别问题类型
    ↓
[检索策略] → 选择合适的检索方法
    ↓
[答案生成] → 生成答案并添加引用
    ↓
[结果返回] → 返回给用户
```

---

**下一课**：数据分析 Agent - SQL生成与执行