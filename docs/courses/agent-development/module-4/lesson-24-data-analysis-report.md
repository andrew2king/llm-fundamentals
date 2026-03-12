# 课时 24：数据分析 Agent - 报告输出与展示

> Agent 开发实战 - 模块四：实战项目

## 一、报告生成

### 1.1 报告结构设计

```python
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class ReportSection(BaseModel):
    """报告章节"""
    title: str
    content: str
    chart_config: Optional[dict] = None
    table_data: Optional[List[Dict]] = None

class Report(BaseModel):
    """数据分析报告"""
    title: str
    created_at: datetime
    summary: str
    sections: List[ReportSection]
    conclusions: List[str]
    recommendations: List[str]
```

### 1.2 报告生成器

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from typing import List, Dict

class ReportGenerator:
    """报告生成器"""

    REPORT_PROMPT = PromptTemplate.from_template("""
根据以下数据分析结果，生成一份完整的分析报告。

分析问题：{question}

数据结果：
{data_summary}

图表信息：
{chart_info}

请生成包含以下内容的报告：
1. 概述：简要说明分析目的和背景
2. 数据分析：详细分析数据特征和趋势
3. 关键发现：列出 3-5 个重要发现
4. 结论与建议：给出结论和改进建议

以 Markdown 格式输出。
""")

    def __init__(self, llm: ChatOpenAI = None):
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo", temperature=0.7)

    def generate(
        self,
        question: str,
        data: List[Dict],
        chart_config: dict = None
    ) -> Report:
        """生成报告"""
        # 数据摘要
        data_summary = self._summarize_data(data)

        # 图表信息
        chart_info = f"图表类型: {chart_config.get('chart_type', 'N/A')}" if chart_config else "无图表"

        # 生成报告内容
        prompt = self.REPORT_PROMPT.format(
            question=question,
            data_summary=data_summary,
            chart_info=chart_info
        )

        response = self.llm.invoke(prompt)

        # 解析报告内容
        sections = self._parse_sections(response.content)
        conclusions = self._extract_conclusions(response.content)
        recommendations = self._extract_recommendations(response.content)

        return Report(
            title=f"数据分析报告 - {question}",
            created_at=datetime.now(),
            summary=data_summary,
            sections=sections,
            conclusions=conclusions,
            recommendations=recommendations,
            chart_config=chart_config
        )

    def _summarize_data(self, data: List[Dict]) -> str:
        """数据摘要"""
        if not data:
            return "无数据"

        summary = f"共 {len(data)} 条记录\n"

        # 数值统计
        for key in data[0].keys():
            values = [row.get(key) for row in data if row.get(key) is not None]
            if values and all(isinstance(v, (int, float)) for v in values):
                summary += f"- {key}: 最小={min(values)}, 最大={max(values)}, 平均={sum(values)/len(values):.2f}\n"

        return summary

    def _parse_sections(self, content: str) -> List[ReportSection]:
        """解析章节"""
        sections = []
        lines = content.split('\n')
        current_title = ""
        current_content = []

        for line in lines:
            if line.startswith('## '):
                if current_title:
                    sections.append(ReportSection(
                        title=current_title,
                        content='\n'.join(current_content)
                    ))
                current_title = line[3:]
                current_content = []
            else:
                current_content.append(line)

        if current_title:
            sections.append(ReportSection(
                title=current_title,
                content='\n'.join(current_content)
            ))

        return sections

    def _extract_conclusions(self, content: str) -> List[str]:
        """提取结论"""
        conclusions = []
        lines = content.split('\n')

        in_conclusion = False
        for line in lines:
            if '结论' in line or '发现' in line:
                in_conclusion = True
                continue
            if in_conclusion and line.startswith('- '):
                conclusions.append(line[2:])
            elif in_conclusion and line.startswith('#'):
                break

        return conclusions

    def _extract_recommendations(self, content: str) -> List[str]:
        """提取建议"""
        recommendations = []
        lines = content.split('\n')

        in_recommendations = False
        for line in lines:
            if '建议' in line:
                in_recommendations = True
                continue
            if in_recommendations and line.startswith('- '):
                recommendations.append(line[2:])
            elif in_recommendations and line.startswith('#'):
                break

        return recommendations
```

---

## 二、报告导出

### 2.1 Markdown 导出

```python
class MarkdownExporter:
    """Markdown 导出器"""

    @staticmethod
    def export(report: Report) -> str:
        """导出为 Markdown"""
        md = f"""# {report.title}

> 生成时间：{report.created_at.strftime('%Y-%m-%d %H:%M')}

## 概述

{report.summary}

"""

        for section in report.sections:
            md += f"""## {section.title}

{section.content}

"""

        if report.conclusions:
            md += """## 关键发现

"""
            for conclusion in report.conclusions:
                md += f"- {conclusion}\n"
            md += "\n"

        if report.recommendations:
            md += """## 建议与行动

"""
            for rec in report.recommendations:
                md += f"- {rec}\n"
            md += "\n"

        return md
```

### 2.2 HTML 导出

```python
class HTMLExporter:
    """HTML 导出器"""

    @staticmethod
    def export(report: Report) -> str:
        """导出为 HTML"""
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{report.title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }}
        h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
        h2 {{ color: #34495e; margin-top: 30px; }}
        .meta {{ color: #7f8c8d; font-size: 14px; margin-bottom: 20px; }}
        .conclusion {{ background: #e8f4f8; padding: 15px; border-radius: 5px; }}
        .recommendation {{ background: #fef9e7; padding: 15px; border-radius: 5px; }}
        ul {{ padding-left: 20px; }}
    </style>
</head>
<body>
    <h1>{report.title}</h1>
    <p class="meta">生成时间：{report.created_at.strftime('%Y-%m-%d %H:%M')}</p>

    <h2>概述</h2>
    <p>{report.summary}</p>
"""

        for section in report.sections:
            html += f"""
    <h2>{section.title}</h2>
    <p>{section.content}</p>
"""

        if report.conclusions:
            html += """
    <h2>关键发现</h2>
    <div class="conclusion">
        <ul>
"""
            for conclusion in report.conclusions:
                html += f"            <li>{conclusion}</li>\n"
            html += """        </ul>
    </div>
"""

        if report.recommendations:
            html += """
    <h2>建议与行动</h2>
    <div class="recommendation">
        <ul>
"""
            for rec in report.recommendations:
                html += f"            <li>{rec}</li>\n"
            html += """        </ul>
    </div>
"""

        html += """
</body>
</html>
"""
        return html
```

### 2.3 PDF 导出

```python
class PDFExporter:
    """PDF 导出器"""

    @staticmethod
    def export(report: Report, output_path: str):
        """导出为 PDF"""
        try:
            from weasyprint import HTML

            html_content = HTMLExporter.export(report)
            HTML(string=html_content).write_pdf(output_path)
            return True
        except ImportError:
            print("请安装 weasyprint: pip install weasyprint")
            return False
```

---

## 三、完整数据分析系统

```python
from langchain_openai import ChatOpenAI
from typing import List, Dict, Optional

class DataAnalysisSystem:
    """完整数据分析系统"""

    def __init__(self, connection_string: str, schema: DatabaseSchema):
        self.llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)

        # 初始化组件
        self.sql_agent = SQLGenerator(self.llm, schema)
        self.executor = SafeSQLExecutor(connection_string)
        self.chart_generator = SmartChartGenerator(self.llm)
        self.report_generator = ReportGenerator(self.llm)

    def analyze(
        self,
        question: str,
        generate_chart: bool = True,
        generate_report: bool = True
    ) -> dict:
        """完整分析流程"""
        result = {
            "question": question,
            "sql": None,
            "data": None,
            "chart": None,
            "report": None
        }

        # 1. 生成 SQL
        sql_result = self.sql_agent.generate(question)
        result["sql"] = sql_result.sql

        # 2. 执行查询
        query_result = self.executor.execute(sql_result.sql)
        if not query_result["success"]:
            result["error"] = query_result["error"]
            return result

        result["data"] = query_result["data"]

        # 3. 生成图表
        if generate_chart and query_result["data"]:
            chart_result = self.chart_generator.generate(
                query_result["data"],
                question
            )
            result["chart"] = chart_result

        # 4. 生成报告
        if generate_report:
            report = self.report_generator.generate(
                question,
                query_result["data"],
                result.get("chart")
            )
            result["report"] = report

        return result

    def export_report(
        self,
        report: Report,
        format: str = "markdown",
        output_path: str = None
    ) -> str:
        """导出报告"""
        if format == "markdown":
            content = MarkdownExporter.export(report)
        elif format == "html":
            content = HTMLExporter.export(report)
        elif format == "pdf":
            if output_path:
                PDFExporter.export(report, output_path)
                return output_path
            else:
                raise ValueError("PDF 导出需要指定 output_path")
        else:
            raise ValueError(f"不支持的格式: {format}")

        if output_path and format != "pdf":
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)

        return content


# 使用示例
system = DataAnalysisSystem(
    connection_string="data/business.db",
    schema=schema
)

# 完整分析
result = system.analyze("分析最近一个月的销售趋势")

print(f"SQL: {result['sql']}")
print(f"数据: {len(result['data'])} 条")

# 导出报告
if result['report']:
    markdown = system.export_report(result['report'], format="markdown")
    print(markdown)

    # 导出 HTML
    system.export_report(result['report'], format="html", output_path="report.html")
```

---

## 四、课程总结

### 4.1 模块四知识图谱

```
模块四：实战项目
│
├── 项目一：智能客服 Agent（课时 17-19）
│   ├── 需求分析与架构设计
│   ├── 知识库对接与问答实现
│   └── 系统集成与部署
│
├── 项目二：文档问答 Agent（课时 20-21）
│   ├── 文档解析与向量化
│   └── 检索策略与答案生成
│
└── 项目三：数据分析 Agent（课时 22-24）
    ├── SQL 生成与执行
    ├── 图表自动生成
    └── 报告输出与展示
```

### 4.2 核心技能总结

| 技能 | 应用场景 | 关键技术 |
|------|---------|---------|
| Agent 架构设计 | 所有项目 | 状态管理、路由分发 |
| RAG 实现 | 客服、文档问答 | 向量检索、知识库 |
| SQL 生成 | 数据分析 | Schema 管理、安全执行 |
| 可视化 | 数据分析 | ECharts、图表选择 |
| 报告生成 | 数据分析 | LLM 总结、多格式导出 |

### 4.3 课程完整知识体系

```
Agent 开发实战课程
│
├── 模块一：Agent 基础概念（4 课时）
│   └── 定义、架构、范式、技术选择
│
├── 模块二：LangChain 核心组件（6 课时）
│   └── LLM、Memory、Tool、Chain、Parser、回调
│
├── 模块三：Agent 开发进阶（6 课时）
│   └── AgentExecutor、自定义 Tool、Multi-Agent、错误处理、流式输出、成本优化
│
└── 模块四：实战项目（8 课时）
    └── 智能客服、文档问答、数据分析
```

---

## 五、后续学习路径

### 5.1 进阶方向

- **Multi-Agent 系统**：LangGraph 深入、复杂协作模式
- **Agent 工具生态**：更多工具集成、自定义工具开发
- **生产部署**：性能优化、监控告警、高可用架构
- **安全与隐私**：数据安全、访问控制、审计日志

### 5.2 推荐资源

- [LangChain 官方文档](https://python.langchain.com/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [Claude API 文档](https://docs.anthropic.com/)

---

**恭喜你完成 Agent 开发实战课程！**