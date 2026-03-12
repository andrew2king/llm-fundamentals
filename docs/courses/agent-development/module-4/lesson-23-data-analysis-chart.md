# 课时 23：数据分析 Agent - 图表自动生成

> Agent 开发实战 - 模块四：实战项目

## 一、图表类型选择

### 1.1 图表类型映射

```python
from enum import Enum
from typing import List, Dict

class ChartType(Enum):
    """图表类型"""
    LINE = "line"           # 折线图：趋势
    BAR = "bar"             # 柱状图：比较
    PIE = "pie"             # 饼图：占比
    SCATTER = "scatter"     # 散点图：相关性
    AREA = "area"           # 面积图：趋势+量
    TABLE = "table"         # 表格：精确数据

class ChartSelector:
    """图表选择器"""

    @staticmethod
    def select_chart(
        data: List[Dict],
        x_column: str,
        y_columns: List[str],
        purpose: str = None
    ) -> ChartType:
        """选择合适的图表类型"""
        # 根据数据特征判断

        # 1. 时间序列 → 折线图
        if ChartSelector._is_time_column(x_column):
            return ChartType.LINE

        # 2. 分类比较 → 柱状图
        if ChartSelector._is_category_column(data, x_column):
            if len(data) <= 8:
                return ChartType.BAR
            else:
                return ChartType.TABLE

        # 3. 占比分析 → 饼图
        if purpose and "占比" in purpose or "比例" in purpose:
            return ChartType.PIE

        # 4. 相关性分析 → 散点图
        if len(y_columns) >= 2 and purpose and "相关" in purpose:
            return ChartType.SCATTER

        # 默认柱状图
        return ChartType.BAR

    @staticmethod
    def _is_time_column(column_name: str) -> bool:
        """判断是否时间列"""
        time_keywords = ["date", "time", "日期", "时间", "year", "month", "年", "月"]
        return any(kw in column_name.lower() for kw in time_keywords)

    @staticmethod
    def _is_category_column(data: List[Dict], column: str) -> bool:
        """判断是否分类列"""
        unique_values = set(row.get(column) for row in data)
        # 唯一值较少，可能是分类
        return len(unique_values) < len(data) * 0.5
```

---

## 二、ECharts 配置生成

### 2.1 图表配置生成器

```python
import json
from typing import List, Dict, Optional

class EChartsConfigGenerator:
    """ECharts 配置生成器"""

    @staticmethod
    def generate_line_chart(
        data: List[Dict],
        x_column: str,
        y_columns: List[str],
        title: str = ""
    ) -> dict:
        """生成折线图配置"""
        x_data = [row.get(x_column) for row in data]

        series = []
        for y_col in y_columns:
            series.append({
                "name": y_col,
                "type": "line",
                "data": [row.get(y_col) for row in data],
                "smooth": True
            })

        return {
            "title": {"text": title},
            "tooltip": {"trigger": "axis"},
            "legend": {"data": y_columns},
            "xAxis": {"type": "category", "data": x_data},
            "yAxis": {"type": "value"},
            "series": series
        }

    @staticmethod
    def generate_bar_chart(
        data: List[Dict],
        x_column: str,
        y_columns: List[str],
        title: str = "",
        horizontal: bool = False
    ) -> dict:
        """生成柱状图配置"""
        x_data = [str(row.get(x_column)) for row in data]

        series = []
        for y_col in y_columns:
            series.append({
                "name": y_col,
                "type": "bar",
                "data": [row.get(y_col) for row in data]
            })

        if horizontal:
            return {
                "title": {"text": title},
                "tooltip": {"trigger": "axis"},
                "legend": {"data": y_columns},
                "xAxis": {"type": "value"},
                "yAxis": {"type": "category", "data": x_data},
                "series": series
            }

        return {
            "title": {"text": title},
            "tooltip": {"trigger": "axis"},
            "legend": {"data": y_columns},
            "xAxis": {"type": "category", "data": x_data},
            "yAxis": {"type": "value"},
            "series": series
        }

    @staticmethod
    def generate_pie_chart(
        data: List[Dict],
        name_column: str,
        value_column: str,
        title: str = ""
    ) -> dict:
        """生成饼图配置"""
        pie_data = []
        for row in data:
            pie_data.append({
                "name": str(row.get(name_column)),
                "value": row.get(value_column)
            })

        return {
            "title": {
                "text": title,
                "left": "center"
            },
            "tooltip": {
                "trigger": "item",
                "formatter": "{a} <br/>{b}: {c} ({d}%)"
            },
            "legend": {
                "orient": "vertical",
                "left": "left"
            },
            "series": [{
                "name": title,
                "type": "pie",
                "radius": "50%",
                "data": pie_data,
                "emphasis": {
                    "itemStyle": {
                        "shadowBlur": 10,
                        "shadowOffsetX": 0,
                        "shadowColor": "rgba(0, 0, 0, 0.5)"
                    }
                }
            }]
        }

    @staticmethod
    def generate_scatter_chart(
        data: List[Dict],
        x_column: str,
        y_column: str,
        title: str = ""
    ) -> dict:
        """生成散点图配置"""
        scatter_data = [
            [row.get(x_column), row.get(y_column)]
            for row in data
        ]

        return {
            "title": {"text": title},
            "tooltip": {"trigger": "item"},
            "xAxis": {"type": "value", "name": x_column},
            "yAxis": {"type": "value", "name": y_column},
            "series": [{
                "type": "scatter",
                "data": scatter_data,
                "symbolSize": 10
            }]
        }
```

### 2.2 智能图表生成器

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

class SmartChartGenerator:
    """智能图表生成器"""

    CHART_PROMPT = PromptTemplate.from_template("""
根据以下数据，选择最合适的图表类型并生成 ECharts 配置。

数据：
{data}

分析需求：{question}

请提供：
1. 图表类型选择及理由
2. ECharts 配置（JSON格式）
3. 图表标题建议
""")

    def __init__(self, llm: ChatOpenAI = None):
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo", temperature=0)
        self.config_generator = EChartsConfigGenerator()

    def generate(
        self,
        data: List[Dict],
        question: str,
        x_column: str = None,
        y_columns: List[str] = None
    ) -> dict:
        """生成图表"""
        # 如果没有指定列，尝试自动推断
        if not x_column or not y_columns:
            x_column, y_columns = self._infer_columns(data, question)

        # 选择图表类型
        chart_type = ChartSelector.select_chart(data, x_column, y_columns, question)

        # 生成配置
        if chart_type == ChartType.LINE:
            config = self.config_generator.generate_line_chart(
                data, x_column, y_columns, title=question
            )
        elif chart_type == ChartType.BAR:
            config = self.config_generator.generate_bar_chart(
                data, x_column, y_columns, title=question
            )
        elif chart_type == ChartType.PIE:
            config = self.config_generator.generate_pie_chart(
                data, x_column, y_columns[0], title=question
            )
        elif chart_type == ChartType.SCATTER:
            config = self.config_generator.generate_scatter_chart(
                data, x_column, y_columns[0], title=question
            )
        else:
            config = {"type": "table", "data": data}

        return {
            "chart_type": chart_type.value,
            "config": config,
            "x_column": x_column,
            "y_columns": y_columns
        }

    def _infer_columns(self, data: List[Dict], question: str) -> tuple:
        """推断 x, y 列"""
        if not data:
            return None, []

        columns = list(data[0].keys())

        # 简单推断：第一列作为 x，数值列作为 y
        x_column = columns[0]
        y_columns = []

        for col in columns[1:]:
            values = [row.get(col) for row in data if row.get(col) is not None]
            if values and all(isinstance(v, (int, float)) for v in values):
                y_columns.append(col)

        return x_column, y_columns
```

---

## 三、图表渲染服务

### 3.1 后端 API

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional

app = FastAPI(title="Chart Generation API")

class ChartRequest(BaseModel):
    data: List[Dict]
    question: str
    x_column: Optional[str] = None
    y_columns: Optional[List[str]] = None

class ChartResponse(BaseModel):
    chart_type: str
    config: dict
    x_column: str
    y_columns: List[str]

@app.post("/chart/generate", response_model=ChartResponse)
async def generate_chart(request: ChartRequest):
    """生成图表配置"""
    generator = SmartChartGenerator()

    result = generator.generate(
        data=request.data,
        question=request.question,
        x_column=request.x_column,
        y_columns=request.y_columns
    )

    return ChartResponse(**result)
```

### 3.2 前端渲染

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
</head>
<body>
    <div id="chart" style="width: 800px; height: 500px;"></div>

    <script>
        // 获取图表配置
        async function loadChart() {
            const response = await fetch('/chart/generate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    data: [...], // 数据
                    question: "销售趋势分析"
                })
            });

            const result = await response.json();

            // 渲染图表
            const chart = echarts.init(document.getElementById('chart'));
            chart.setOption(result.config);
        }

        loadChart();
    </script>
</body>
</html>
```

---

## 四、本课小结

### 4.1 关键要点

1. **图表选择**：根据数据特征自动选择
2. **配置生成**：ECharts 标准配置
3. **智能推断**：自动识别 x/y 列
4. **API 服务**：前后端分离架构

### 4.2 下一课

下一课将实现报告输出与展示功能。

---

**下一课**：数据分析 Agent - 报告输出与展示