# 课时 22：数据分析 Agent - SQL生成与执行

> Agent 开发实战 - 模块四：实战项目

## 一、项目概述

### 1.1 项目背景

业务人员需要查询数据库，但不懂数据库结构和 SQL 语法。

### 1.2 项目目标

构建数据分析 Agent：
- 自然语言转 SQL
- 安全执行查询
- 智能结果解读

---

## 二、SQL 生成

### 2.1 数据库 Schema 管理

```python
from typing import List, Dict
from pydantic import BaseModel

class TableSchema(BaseModel):
    """表结构"""
    table_name: str
    columns: List[Dict]
    description: str

class DatabaseSchema:
    """数据库 Schema"""

    def __init__(self):
        self.tables: Dict[str, TableSchema] = {}

    def add_table(self, table: TableSchema):
        """添加表"""
        self.tables[table.table_name] = table

    def get_schema_prompt(self) -> str:
        """生成 Schema 提示"""
        prompt = "数据库结构：\n\n"
        for table in self.tables.values():
            prompt += f"表名: {table.table_name}\n"
            prompt += f"说明: {table.description}\n"
            prompt += "字段:\n"
            for col in table.columns:
                prompt += f"  - {col['name']} ({col['type']}): {col.get('description', '')}\n"
            prompt += "\n"
        return prompt

    @classmethod
    def from_database(cls, connection_string: str):
        """从数据库自动提取 Schema"""
        import sqlite3

        schema = cls()
        conn = sqlite3.connect(connection_string)
        cursor = conn.cursor()

        # 获取所有表
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()

        for (table_name,) in tables:
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()

            table_schema = TableSchema(
                table_name=table_name,
                columns=[
                    {
                        "name": col[1],
                        "type": col[2],
                        "nullable": not col[3],
                        "primary_key": col[5]
                    }
                    for col in columns
                ],
                description=""
            )
            schema.add_table(table_schema)

        conn.close()
        return schema


# 示例 Schema
schema = DatabaseSchema()
schema.add_table(TableSchema(
    table_name="orders",
    columns=[
        {"name": "order_id", "type": "INTEGER", "description": "订单ID"},
        {"name": "customer_id", "type": "INTEGER", "description": "客户ID"},
        {"name": "product_id", "type": "INTEGER", "description": "产品ID"},
        {"name": "quantity", "type": "INTEGER", "description": "数量"},
        {"name": "total_price", "type": "DECIMAL", "description": "总金额"},
        {"name": "order_date", "type": "DATE", "description": "下单日期"},
        {"name": "status", "type": "VARCHAR", "description": "订单状态"},
    ],
    description="订单表，存储所有订单信息"
))
```

### 2.2 SQL 生成器

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import re

class SQLQuery(BaseModel):
    """SQL 查询结果"""
    sql: str = Field(description="生成的 SQL 语句")
    explanation: str = Field(description="SQL 解释")

class SQLGenerator:
    """SQL 生成器"""

    SQL_PROMPT = """
你是一个 SQL 专家。根据用户的自然语言问题，生成对应的 SQL 查询语句。

{schema}

注意事项：
1. 只生成 SELECT 查询，不要生成 INSERT/UPDATE/DELETE
2. 使用标准 SQL 语法
3. 添加适当的 WHERE 条件和 ORDER BY
4. 对敏感信息使用参数化查询

用户问题：{question}

{format_instructions}
"""

    def __init__(self, llm: ChatOpenAI, schema: DatabaseSchema):
        self.llm = llm
        self.schema = schema
        self.parser = PydanticOutputParser(pydantic_object=SQLQuery)

    def generate(self, question: str) -> SQLQuery:
        """生成 SQL"""
        prompt = ChatPromptTemplate.from_template(self.SQL_PROMPT)

        chain = prompt | self.llm | self.parser

        result = chain.invoke({
            "schema": self.schema.get_schema_prompt(),
            "question": question,
            "format_instructions": self.parser.get_format_instructions()
        })

        # 清理 SQL
        result.sql = self._clean_sql(result.sql)

        return result

    def _clean_sql(self, sql: str) -> str:
        """清理 SQL"""
        # 移除 markdown 代码块
        sql = re.sub(r'```sql\s*', '', sql)
        sql = re.sub(r'```\s*', '', sql)
        # 移除多余空白
        sql = ' '.join(sql.split())
        return sql.strip()
```

### 2.3 SQL 验证

```python
class SQLValidator:
    """SQL 验证器"""

    FORBIDDEN_KEYWORDS = [
        "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "TRUNCATE",
        "GRANT", "REVOKE", "EXEC", "EXECUTE"
    ]

    @staticmethod
    def validate(sql: str) -> dict:
        """验证 SQL 安全性"""
        sql_upper = sql.upper()

        # 检查禁止关键词
        for keyword in SQLValidator.FORBIDDEN_KEYWORDS:
            if keyword in sql_upper:
                return {
                    "valid": False,
                    "error": f"禁止使用 {keyword} 操作"
                }

        # 检查是否是 SELECT
        if not sql_upper.strip().startswith("SELECT"):
            return {
                "valid": False,
                "error": "只允许 SELECT 查询"
            }

        # 检查注释注入
        if "--" in sql or "/*" in sql:
            return {
                "valid": False,
                "error": "SQL 中不允许包含注释"
            }

        return {"valid": True}

    @staticmethod
    def validate_syntax(sql: str) -> dict:
        """验证 SQL 语法"""
        import sqlparse

        try:
            parsed = sqlparse.parse(sql)
            if not parsed:
                return {"valid": False, "error": "无法解析 SQL"}

            return {"valid": True}
        except Exception as e:
            return {"valid": False, "error": str(e)}
```

---

## 三、SQL 执行

### 3.1 安全执行器

```python
import sqlite3
from typing import List, Dict, Any
import time

class SafeSQLExecutor:
    """安全 SQL 执行器"""

    def __init__(self, connection_string: str, max_rows: int = 1000):
        self.connection_string = connection_string
        self.max_rows = max_rows

    def execute(self, sql: str) -> dict:
        """执行 SQL 查询"""
        # 验证
        validation = SQLValidator.validate(sql)
        if not validation["valid"]:
            return {"success": False, "error": validation["error"]}

        try:
            conn = sqlite3.connect(self.connection_string)
            cursor = conn.cursor()

            # 执行查询
            start_time = time.time()
            cursor.execute(sql)

            # 获取结果
            rows = cursor.fetchmany(self.max_rows)
            columns = [desc[0] for desc in cursor.description]

            # 转换为字典列表
            results = [dict(zip(columns, row)) for row in rows]

            # 获取总数（如果有更多）
            total_rows = len(results)

            conn.close()

            return {
                "success": True,
                "data": results,
                "columns": columns,
                "row_count": total_rows,
                "execution_time": time.time() - start_time
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
```

### 3.2 查询结果处理

```python
class QueryResultProcessor:
    """查询结果处理器"""

    @staticmethod
    def format_as_table(results: dict) -> str:
        """格式化为表格"""
        if not results["success"]:
            return f"查询失败: {results['error']}"

        data = results["data"]
        columns = results["columns"]

        if not data:
            return "查询结果为空"

        # 计算列宽
        col_widths = {col: len(col) for col in columns}
        for row in data:
            for col in columns:
                col_widths[col] = max(col_widths[col], len(str(row.get(col, ""))))

        # 构建表格
        lines = []

        # 表头
        header = " | ".join(col.ljust(col_widths[col]) for col in columns)
        lines.append(header)
        lines.append("-" * len(header))

        # 数据行
        for row in data:
            line = " | ".join(
                str(row.get(col, "")).ljust(col_widths[col])
                for col in columns
            )
            lines.append(line)

        return "\n".join(lines)

    @staticmethod
    def summarize(results: dict, question: str) -> str:
        """生成结果摘要"""
        if not results["success"]:
            return f"查询失败: {results['error']}"

        data = results["data"]
        row_count = results["row_count"]

        summary = f"查询返回 {row_count} 条记录。\n"

        # 数值统计
        numeric_cols = []
        for col in results["columns"]:
            values = [row.get(col) for row in data if row.get(col) is not None]
            if values and all(isinstance(v, (int, float)) for v in values):
                numeric_cols.append(col)

        if numeric_cols:
            summary += "\n数值统计：\n"
            for col in numeric_cols:
                values = [row.get(col) for row in data]
                summary += f"  {col}: 平均值={sum(values)/len(values):.2f}, 总和={sum(values):.2f}\n"

        return summary
```

---

## 四、完整数据分析 Agent

```python
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain.agents import initialize_agent, AgentType

class DataAnalysisAgent:
    """数据分析 Agent"""

    def __init__(
        self,
        connection_string: str,
        schema: DatabaseSchema,
        model: str = "gpt-4-turbo"
    ):
        self.llm = ChatOpenAI(model=model, temperature=0)
        self.schema = schema
        self.sql_generator = SQLGenerator(self.llm, schema)
        self.executor = SafeSQLExecutor(connection_string)

        # 创建 Agent
        self._create_agent()

    def _create_agent(self):
        """创建 Agent"""
        tools = [
            Tool(
                name="query_database",
                func=self._query_database,
                description="执行数据库查询。输入自然语言问题，返回查询结果。"
            )
        ]

        self.agent = initialize_agent(
            tools=tools,
            llm=self.llm,
            agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True
        )

    def _query_database(self, question: str) -> str:
        """查询数据库"""
        # 生成 SQL
        sql_result = self.sql_generator.generate(question)
        print(f"生成 SQL: {sql_result.sql}")

        # 执行查询
        results = self.executor.execute(sql_result.sql)

        # 格式化结果
        if results["success"]:
            formatted = QueryResultProcessor.format_as_table(results)
            summary = QueryResultProcessor.summarize(results, question)
            return f"{formatted}\n\n{summary}"
        else:
            return f"查询失败: {results['error']}"

    def analyze(self, question: str) -> str:
        """分析数据"""
        return self.agent.run(f"分析数据: {question}")

    def query(self, question: str) -> dict:
        """直接查询"""
        sql_result = self.sql_generator.generate(question)
        results = self.executor.execute(sql_result.sql)

        return {
            "sql": sql_result.sql,
            "explanation": sql_result.explanation,
            "results": results
        }


# 使用示例
agent = DataAnalysisAgent(
    connection_string="data/business.db",
    schema=schema
)

# 自然语言查询
result = agent.query("上个月销售额最高的前10个客户是谁？")
print(f"SQL: {result['sql']}")
print(f"解释: {result['explanation']}")
print(f"结果: {result['results']}")
```

---

## 五、本课小结

### 5.1 关键要点

1. **Schema 管理**：自动提取数据库结构
2. **SQL 生成**：自然语言转 SQL
3. **安全执行**：验证 + 限制操作
4. **结果处理**：格式化 + 摘要

### 5.2 下一课

下一课将实现图表自动生成功能。

---

**下一课**：数据分析 Agent - 图表自动生成