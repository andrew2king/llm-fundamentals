# 课时 12：自定义 Tool 开发实战

> Agent 开发实战 - 模块三：Agent 开发进阶

## 一、本课目标

- 掌握 Tool 开发的完整流程
- 学会处理复杂输入输出
- 实现带状态和权限控制的工具

---

## 二、Tool 开发规范

### 2.1 好的 Tool 应该具备

| 特性 | 说明 |
|------|------|
| **清晰的描述** | Agent 能准确判断何时使用 |
| **类型提示** | 帮助 Agent 构造正确参数 |
| **错误处理** | 优雅地处理异常情况 |
| **幂等性** | 相同输入产生相同输出 |
| **安全性** | 不执行危险操作 |

### 2.2 Tool 开发模板

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Optional, Type

# 1. 定义输入模型
class MyToolInput(BaseModel):
    """工具输入参数"""
    param1: str = Field(description="参数1的描述")
    param2: Optional[int] = Field(default=10, description="参数2的描述")

# 2. 定义工具类
class MyTool(BaseTool):
    """工具描述 - 这句话会显示给 Agent"""

    name = "my_tool"
    description = "工具的详细描述，告诉 Agent 何时使用"
    args_schema: Type[BaseModel] = MyToolInput

    def _run(self, param1: str, param2: int = 10) -> str:
        """执行逻辑"""
        try:
            # 实际业务逻辑
            result = f"处理 {param1}，参数 {param2}"
            return result
        except Exception as e:
            return f"执行失败: {str(e)}"

    async def _arun(self, param1: str, param2: int = 10) -> str:
        """异步执行"""
        return self._run(param1, param2)
```

---

## 三、实战案例

### 3.1 数据库查询工具

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field, validator
from typing import Type, List, Any
import sqlite3
import json

class DatabaseQueryInput(BaseModel):
    """数据库查询输入"""
    table: str = Field(description="表名")
    columns: List[str] = Field(default=["*"], description="要查询的列")
    condition: Optional[str] = Field(default=None, description="WHERE 条件")
    limit: int = Field(default=10, description="返回条数限制")

    @validator('table')
    def validate_table(cls, v):
        # 防止 SQL 注入
        allowed_tables = ['users', 'products', 'orders']
        if v not in allowed_tables:
            raise ValueError(f'不允许查询表: {v}')
        return v

class DatabaseQueryTool(BaseTool):
    """数据库查询工具 - 用于查询业务数据"""

    name = "database_query"
    description = """
    查询数据库中的业务数据。
    适用场景：
    - 查询用户信息
    - 查询产品数据
    - 查询订单记录

    示例用法：
    - 查询所有用户：table="users"
    - 查询特定用户：table="users", condition="id=1"
    """
    args_schema: Type[BaseModel] = DatabaseQueryInput

    def __init__(self, db_path: str):
        super().__init__()
        self.db_path = db_path

    def _run(
        self,
        table: str,
        columns: List[str] = ["*"],
        condition: Optional[str] = None,
        limit: int = 10
    ) -> str:
        """执行查询"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # 构建 SQL
            cols = ", ".join(columns)
            sql = f"SELECT {cols} FROM {table}"

            if condition:
                sql += f" WHERE {condition}"

            sql += f" LIMIT {limit}"

            cursor.execute(sql)
            rows = cursor.fetchall()

            # 获取列名
            col_names = [desc[0] for desc in cursor.description]

            # 转换为字典列表
            results = [dict(zip(col_names, row)) for row in rows]

            conn.close()

            return json.dumps(results, ensure_ascii=False, indent=2)

        except Exception as e:
            return f"查询失败: {str(e)}"

    async def _arun(self, **kwargs) -> str:
        return self._run(**kwargs)

# 使用
db_tool = DatabaseQueryTool("data/business.db")
```

### 3.2 API 调用工具

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type, Optional
import requests
from functools import lru_cache

class WeatherAPIInput(BaseModel):
    """天气 API 输入"""
    city: str = Field(description="城市名称，如：北京、上海")
    days: Optional[int] = Field(default=1, description="预报天数，1-7")

class WeatherAPITool(BaseTool):
    """天气查询工具 - 调用天气 API 获取天气信息"""

    name = "weather_api"
    description = """
    查询城市天气信息。
    输入城市名称，返回天气详情。
    支持未来7天天气预报。
    """
    args_schema: Type[BaseModel] = WeatherAPIInput

    api_key: str = ""
    base_url: str = "https://api.weatherapi.com/v1"

    def __init__(self, api_key: str):
        super().__init__()
        self.api_key = api_key

    @lru_cache(maxsize=100)
    def _get_cached_weather(self, city: str, days: int) -> dict:
        """缓存天气数据"""
        url = f"{self.base_url}/forecast.json"
        params = {
            "key": self.api_key,
            "q": city,
            "days": days,
            "lang": "zh"
        }
        response = requests.get(url, params=params, timeout=10)
        return response.json()

    def _run(self, city: str, days: int = 1) -> str:
        """执行查询"""
        try:
            data = self._get_cached_weather(city, days)

            # 解析返回数据
            location = data.get("location", {})
            current = data.get("current", {})

            result = f"""
城市: {location.get('name', city)}
温度: {current.get('temp_c', 'N/A')}°C
天气: {current.get('condition', {}).get('text', 'N/A')}
湿度: {current.get('humidity', 'N/A')}%
风速: {current.get('wind_kph', 'N/A')} km/h
"""
            return result.strip()

        except requests.Timeout:
            return "天气 API 请求超时，请稍后重试"
        except requests.RequestException as e:
            return f"天气 API 请求失败: {str(e)}"
        except Exception as e:
            return f"查询天气失败: {str(e)}"

    async def _arun(self, city: str, days: int = 1) -> str:
        return self._run(city, days)
```

### 3.3 文件操作工具

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field, validator
from typing import Type, Optional
from pathlib import Path
import os

class FileOperationInput(BaseModel):
    """文件操作输入"""
    operation: str = Field(description="操作类型: read, write, list, delete")
    path: str = Field(description="文件或目录路径")
    content: Optional[str] = Field(default=None, description="写入内容（仅 write 操作）")

    @validator('operation')
    def validate_operation(cls, v):
        allowed = ['read', 'write', 'list', 'delete']
        if v not in allowed:
            raise ValueError(f'不支持的操作: {v}')
        return v

class FileOperationTool(BaseTool):
    """文件操作工具 - 安全的文件系统操作"""

    name = "file_operation"
    description = """
    执行文件系统操作。
    支持读取、写入、列表、删除文件。

    注意：只能在允许的目录下操作。
    """
    args_schema: Type[BaseModel] = FileOperationInput

    allowed_dirs: list = []

    def __init__(self, allowed_dirs: list):
        super().__init__()
        self.allowed_dirs = [Path(d).resolve() for d in allowed_dirs]

    def _is_path_allowed(self, path: Path) -> bool:
        """检查路径是否在允许范围内"""
        try:
            resolved = path.resolve()
            return any(
                str(resolved).startswith(str(allowed))
                for allowed in self.allowed_dirs
            )
        except:
            return False

    def _run(
        self,
        operation: str,
        path: str,
        content: Optional[str] = None
    ) -> str:
        """执行操作"""
        file_path = Path(path)

        # 安全检查
        if not self._is_path_allowed(file_path):
            return f"错误: 不允许访问路径 {path}"

        try:
            if operation == "read":
                if not file_path.exists():
                    return f"错误: 文件不存在 {path}"
                return file_path.read_text(encoding='utf-8')

            elif operation == "write":
                if content is None:
                    return "错误: 写入操作需要提供 content"
                file_path.parent.mkdir(parents=True, exist_ok=True)
                file_path.write_text(content, encoding='utf-8')
                return f"成功写入文件: {path}"

            elif operation == "list":
                if not file_path.is_dir():
                    return f"错误: {path} 不是目录"
                items = [f.name for f in file_path.iterdir()]
                return "\n".join(items)

            elif operation == "delete":
                if not file_path.exists():
                    return f"错误: 文件不存在 {path}"
                file_path.unlink()
                return f"成功删除: {path}"

        except Exception as e:
            return f"操作失败: {str(e)}"

    async def _arun(self, **kwargs) -> str:
        return self._run(**kwargs)

# 使用
file_tool = FileOperationTool(allowed_dirs=["/tmp/workspace", "/data/files"])
```

### 3.4 带权限控制的工具

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type, Optional, Callable
from functools import wraps

class PermissionDeniedError(Exception):
    """权限拒绝错误"""
    pass

def require_permission(permission: str):
    """权限检查装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            if not self._check_permission(permission):
                raise PermissionDeniedError(f"缺少权限: {permission}")
            return func(self, *args, **kwargs)
        return wrapper
    return decorator

class AdminToolInput(BaseModel):
    """管理员工具输入"""
    action: str = Field(description="操作类型")
    target: str = Field(description="操作目标")

class AdminTool(BaseTool):
    """管理员工具 - 需要特定权限"""

    name = "admin_tool"
    description = "执行管理员操作，需要管理员权限"
    args_schema: Type[BaseModel] = AdminToolInput

    def __init__(self, permission_checker: Callable[[str], bool]):
        super().__init__()
        self._check_permission = permission_checker

    def _run(self, action: str, target: str) -> str:
        try:
            if action == "delete_user":
                return self._delete_user(target)
            elif action == "reset_password":
                return self._reset_password(target)
            else:
                return f"未知操作: {action}"
        except PermissionDeniedError as e:
            return f"权限不足: {str(e)}"

    @require_permission("user:delete")
    def _delete_user(self, user_id: str) -> str:
        """删除用户"""
        return f"已删除用户: {user_id}"

    @require_permission("user:reset_password")
    def _reset_password(self, user_id: str) -> str:
        """重置密码"""
        return f"已重置用户 {user_id} 的密码"

# 使用
def check_permission(perm: str) -> bool:
    # 实际实现中从用户上下文获取权限
    user_permissions = ["user:reset_password"]
    return perm in user_permissions

admin_tool = AdminTool(permission_checker=check_permission)
```

---

## 四、工具测试

### 4.1 单元测试

```python
import pytest
from unittest.mock import Mock, patch

class TestWeatherAPITool:
    """天气 API 工具测试"""

    @pytest.fixture
    def tool(self):
        return WeatherAPITool(api_key="test_key")

    def test_input_validation(self, tool):
        """测试输入验证"""
        # 有效输入
        result = tool._run(city="北京")
        assert result is not None

        # 无效输入
        with pytest.raises(Exception):
            tool._run(city="")

    @patch('requests.get')
    def test_api_call(self, mock_get, tool):
        """测试 API 调用"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "location": {"name": "北京"},
            "current": {"temp_c": 25, "condition": {"text": "晴"}}
        }
        mock_get.return_value = mock_response

        result = tool._run(city="北京")
        assert "北京" in result
        assert "25" in result

    def test_error_handling(self, tool):
        """测试错误处理"""
        with patch('requests.get', side_effect=TimeoutError()):
            result = tool._run(city="北京")
            assert "超时" in result or "失败" in result
```

### 4.2 集成测试

```python
def test_tool_with_agent():
    """测试工具与 Agent 集成"""
    from langchain.agents import initialize_agent, AgentType
    from langchain_openai import ChatOpenAI

    tools = [
        WeatherAPITool(api_key="test"),
        DatabaseQueryTool("test.db")
    ]

    llm = ChatOpenAI(model="gpt-4", temperature=0)
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION
    )

    result = agent.run("北京天气怎么样？")
    assert result is not None
```

---

## 五、本课小结

### 5.1 关键要点

1. **输入验证**：使用 Pydantic 确保参数正确
2. **错误处理**：优雅处理所有异常情况
3. **安全控制**：限制危险操作
4. **缓存优化**：减少重复请求

### 5.2 开发清单

- [ ] 定义清晰的输入模型
- [ ] 编写详细的工具描述
- [ ] 实现完整的错误处理
- [ ] 添加输入验证
- [ ] 实现安全控制
- [ ] 编写单元测试

---

**下一课**：Multi-Agent 协作基础 - 构建协作式智能系统