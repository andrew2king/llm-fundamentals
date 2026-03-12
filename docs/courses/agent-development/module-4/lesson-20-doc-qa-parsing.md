# 课时 20：文档问答 Agent - 文档解析与向量化

> Agent 开发实战 - 模块四：实战项目

## 一、项目概述

### 1.1 项目背景

企业积累了大量文档资料（PDF、Word、Markdown 等），员工查找信息效率低下。

### 1.2 项目目标

构建文档问答系统，实现：
- 多格式文档解析
- 智能问答
- 引用溯源

---

## 二、文档解析

### 2.1 多格式解析器

```python
from langchain.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredMarkdownLoader,
    TextLoader,
    UnstructuredHTMLLoader
)
from pathlib import Path
from typing import List

class DocumentParser:
    """文档解析器"""

    PARSERS = {
        '.pdf': PyPDFLoader,
        '.docx': Docx2txtLoader,
        '.doc': Docx2txtLoader,
        '.md': UnstructuredMarkdownLoader,
        '.txt': TextLoader,
        '.html': UnstructuredHTMLLoader,
    }

    def parse(self, file_path: str) -> List:
        """解析文档"""
        path = Path(file_path)
        suffix = path.suffix.lower()

        parser_class = self.PARSERS.get(suffix)
        if not parser_class:
            raise ValueError(f"不支持的文件格式: {suffix}")

        loader = parser_class(file_path)
        documents = loader.load()

        # 添加元数据
        for doc in documents:
            doc.metadata["source_file"] = path.name
            doc.metadata["file_type"] = suffix

        return documents

    def parse_directory(self, directory: str, recursive: bool = True) -> List:
        """解析目录下所有文档"""
        all_documents = []
        path = Path(directory)

        pattern = "**/*" if recursive else "*"

        for file_path in path.glob(pattern):
            if file_path.is_file() and file_path.suffix.lower() in self.PARSERS:
                try:
                    docs = self.parse(str(file_path))
                    all_documents.extend(docs)
                    print(f"已解析: {file_path.name}")
                except Exception as e:
                    print(f"解析失败 {file_path.name}: {e}")

        return all_documents
```

### 2.2 文本分块策略

```python
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    MarkdownHeaderTextSplitter,
    TokenTextSplitter
)
from typing import List

class SmartTextSplitter:
    """智能文本分块"""

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        # 通用分块器
        self.general_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", "。", "！", "？", "；", " ", ""]
        )

        # Markdown 分块器
        self.markdown_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[
                ("#", "header1"),
                ("##", "header2"),
                ("###", "header3"),
            ]
        )

    def split(self, documents: List, file_type: str = None) -> List:
        """分块"""
        result = []

        for doc in documents:
            if file_type == '.md':
                # Markdown 按标题分块
                md_chunks = self.markdown_splitter.split_text(doc.page_content)
                for chunk in md_chunks:
                    chunk.metadata.update(doc.metadata)
                    result.append(chunk)
            else:
                # 通用分块
                chunks = self.general_splitter.split_documents([doc])
                result.extend(chunks)

        return result

    def split_with_context(self, documents: List) -> List:
        """带上下文的分块"""
        result = []

        for i, doc in enumerate(documents):
            # 获取前后文档作为上下文
            prev_content = documents[i-1].page_content[-200:] if i > 0 else ""
            next_content = documents[i+1].page_content[:200] if i < len(documents) - 1 else ""

            # 添加上下文
            enhanced_content = f"[前文]...{prev_content}\n\n{doc.page_content}\n\n[后文]{next_content}..."

            doc.page_content = enhanced_content
            result.append(doc)

        return result
```

### 2.3 表格处理

```python
import pandas as pd
from langchain.schema import Document

class TableProcessor:
    """表格处理器"""

    def extract_tables_from_pdf(self, pdf_path: str) -> List[Document]:
        """从 PDF 提取表格"""
        import pdfplumber

        documents = []

        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                tables = page.extract_tables()

                for table_idx, table in enumerate(tables):
                    # 转换为 DataFrame
                    df = pd.DataFrame(table[1:], columns=table[0])

                    # 转换为文本
                    text = f"表格 {table_idx + 1}（第 {page_num + 1} 页）：\n"
                    text += df.to_string(index=False)

                    documents.append(Document(
                        page_content=text,
                        metadata={
                            "source": pdf_path,
                            "page": page_num + 1,
                            "type": "table"
                        }
                    ))

        return documents
```

---

## 三、向量化存储

### 3.1 向量数据库选择

```python
from langchain.vectorstores import Chroma, FAISS, Pinecone
from langchain_openai import OpenAIEmbeddings
from typing import List, Optional

class VectorStoreManager:
    """向量存储管理器"""

    def __init__(
        self,
        store_type: str = "chroma",
        persist_directory: Optional[str] = None
    ):
        self.embeddings = OpenAIEmbeddings()
        self.store_type = store_type
        self.persist_directory = persist_directory
        self.vectorstore = None

    def build(self, documents: List):
        """构建向量库"""
        if self.store_type == "chroma":
            self.vectorstore = Chroma.from_documents(
                documents=documents,
                embedding=self.embeddings,
                persist_directory=self.persist_directory
            )
        elif self.store_type == "faiss":
            self.vectorstore = FAISS.from_documents(
                documents=documents,
                embedding=self.embeddings
            )
        else:
            raise ValueError(f"不支持的向量库类型: {self.store_type}")

        return self.vectorstore

    def load(self):
        """加载已有向量库"""
        if self.store_type == "chroma" and self.persist_directory:
            self.vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings
            )
        return self.vectorstore

    def add_documents(self, documents: List):
        """增量添加文档"""
        if not self.vectorstore:
            return self.build(documents)

        self.vectorstore.add_documents(documents)

        if self.persist_directory:
            self.vectorstore.persist()
```

### 3.2 元数据管理

```python
class DocumentMetadata:
    """文档元数据管理"""

    @staticmethod
    def enrich_metadata(documents: List, extra_metadata: dict = None):
        """丰富元数据"""
        import hashlib
        from datetime import datetime

        for doc in documents:
            # 生成文档 ID
            doc_id = hashlib.md5(doc.page_content.encode()).hexdigest()[:12]
            doc.metadata["doc_id"] = doc_id

            # 添加时间戳
            doc.metadata["indexed_at"] = datetime.now().isoformat()

            # 添加额外元数据
            if extra_metadata:
                doc.metadata.update(extra_metadata)

        return documents

    @staticmethod
    def filter_by_metadata(documents: List, filters: dict) -> List:
        """按元数据过滤"""
        result = []
        for doc in documents:
            match = True
            for key, value in filters.items():
                if doc.metadata.get(key) != value:
                    match = False
                    break
            if match:
                result.append(doc)
        return result
```

---

## 四、完整处理流程

### 4.1 文档处理流水线

```python
from typing import List, Optional
from pathlib import Path

class DocumentPipeline:
    """文档处理流水线"""

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        vector_store_type: str = "chroma",
        persist_directory: str = "./vector_db"
    ):
        self.parser = DocumentParser()
        self.splitter = SmartTextSplitter(chunk_size, chunk_overlap)
        self.vector_manager = VectorStoreManager(
            store_type=vector_store_type,
            persist_directory=persist_directory
        )
        self.table_processor = TableProcessor()

    def process_file(self, file_path: str) -> dict:
        """处理单个文件"""
        # 1. 解析文档
        documents = self.parser.parse(file_path)

        # 2. 提取表格（如果是 PDF）
        if file_path.endswith('.pdf'):
            tables = self.table_processor.extract_tables_from_pdf(file_path)
            documents.extend(tables)

        # 3. 分块
        file_type = Path(file_path).suffix
        chunks = self.splitter.split(documents, file_type)

        # 4. 丰富元数据
        chunks = DocumentMetadata.enrich_metadata(
            chunks,
            {"source_file": Path(file_path).name}
        )

        return {
            "documents": documents,
            "chunks": chunks,
            "chunk_count": len(chunks)
        }

    def process_directory(self, directory: str) -> dict:
        """处理目录"""
        all_chunks = []
        processed_files = []

        path = Path(directory)
        for file_path in path.glob("**/*"):
            if file_path.is_file() and file_path.suffix.lower() in self.parser.PARSERS:
                try:
                    result = self.process_file(str(file_path))
                    all_chunks.extend(result["chunks"])
                    processed_files.append(file_path.name)
                except Exception as e:
                    print(f"处理失败 {file_path}: {e}")

        # 构建向量库
        vectorstore = self.vector_manager.build(all_chunks)

        return {
            "total_chunks": len(all_chunks),
            "processed_files": processed_files,
            "vectorstore": vectorstore
        }

    def update_index(self, file_path: str):
        """增量更新索引"""
        result = self.process_file(file_path)
        self.vector_manager.add_documents(result["chunks"])
        return result
```

### 4.2 使用示例

```python
# 初始化流水线
pipeline = DocumentPipeline(
    chunk_size=500,
    chunk_overlap=50,
    persist_directory="./doc_vector_db"
)

# 处理单个文件
result = pipeline.process_file("./docs/manual.pdf")
print(f"生成 {result['chunk_count']} 个文本块")

# 处理整个目录
result = pipeline.process_directory("./documents")
print(f"处理了 {len(result['processed_files'])} 个文件")
print(f"共 {result['total_chunks']} 个文本块")

# 搜索测试
vectorstore = result["vectorstore"]
results = vectorstore.similarity_search("如何配置系统？", k=3)
for doc in results:
    print(f"\n来源: {doc.metadata.get('source_file')}")
    print(f"内容: {doc.page_content[:200]}...")
```

---

## 五、本课小结

### 5.1 关键要点

1. **文档解析**：支持 PDF、Word、Markdown 等格式
2. **文本分块**：智能分块，保留语义完整性
3. **向量化存储**：Chroma/FAISS 向量数据库
4. **元数据管理**：文档溯源和过滤

### 5.2 下一课

下一课将实现检索策略与答案生成。

---

**下一课**：文档问答 Agent - 检索策略与答案生成