# 示例

展示四大原则的真实代码示例。每个示例展示 LLM 常犯的错误以及如何纠正。

---

## 1. 编码前先思考

### 示例 1：隐藏的假设

**用户请求：** "添加一个导出用户数据的功能"

**❌ LLM 常见做法（错误假设）**

```python
def export_users(format='json'):
    """Export all users to a file."""
    users = User.query.all()
    
    if format == 'json':
        with open('users.json', 'w') as f:
            json.dump([u.to_dict() for u in users], f)
    elif format == 'csv':
        with open('users.csv', 'w') as f:
            writer = csv.DictWriter(f, fieldnames=['id', 'email', 'name'])
            writer.writeheader()
            writer.writerows([u.to_dict() for u in users])
    
    return f"Exported {len(users)} users"
```

**问题：**
- 假设要导出所有用户（分页呢？隐私呢？）
- 未经询问就假设了文件位置
- 假设了要包含哪些字段
- 假设了 CSV 字段名而没有检查实际数据结构

**✅ 正确做法（暴露假设）**

```
在实现之前，我需要澄清：

1. **范围**：导出所有用户还是过滤后的子集？（涉及隐私）
2. **格式**：你说的"导出"是指：
   - 在浏览器中下载文件？
   - 后台任务加邮件通知？
   - 返回数据的 API 端点？
3. **字段**：需要哪些用户字段？（某些可能是敏感信息）
4. **数据量**：通常有多少用户？（影响实现方案）

最简单的方案：添加一个返回分页 JSON 的 API 端点。
基于文件的导出需要更多信息。

你倾向于哪种？
```

### 示例 2：多种解读

**用户请求：** "让搜索更快"

**❌ LLM 常见做法（默默选择）**

```python
# 添加缓存、数据库索引和异步处理
# 却没有问清楚是哪种"更快"
@lru_cache(maxsize=1000)
async def search(query: str) -> List[Result]:
    # ... 200 行优化代码
```

**✅ 正确做法**

```
"让搜索更快"可能意味着：

1. **更快的响应时间**（从 500ms 降到 < 100ms）
   - 添加数据库索引
   - 缓存高频查询
   - 预估工作量：2 小时

2. **处理更多并发搜索**（吞吐量）
   - 添加 async/await
   - 连接池
   - 预估工作量：4 小时

3. **更快的感知速度**（用户体验）
   - 立即显示部分结果
   - 渐进式加载
   - 预估工作量：3 小时

当前搜索典型查询耗时约 500ms。
你的场景中最看重哪个方面？
```

---

## 2. 简洁优先

### 示例 1：过度抽象

**用户请求：** "添加一个计算折扣的函数"

**❌ LLM 常见做法（过度工程化）**

```python
from abc import ABC, abstractmethod
from enum import Enum
from typing import Protocol, Union
from dataclasses import dataclass

class DiscountStrategy(ABC):
    @abstractmethod
    def calculate(self, amount: float) -> float:
        pass

class PercentageDiscount(DiscountStrategy):
    def __init__(self, percentage: float):
        self.percentage = percentage
    
    def calculate(self, amount: float) -> float:
        return amount * (self.percentage / 100)

class FixedDiscount(DiscountStrategy):
    def __init__(self, fixed_amount: float):
        self.fixed_amount = fixed_amount
    
    def calculate(self, amount: float) -> float:
        return min(self.fixed_amount, amount)

@dataclass
class DiscountConfig:
    strategy: DiscountStrategy
    min_purchase: float = 0.0
    max_discount: float = float('inf')

class DiscountCalculator:
    def __init__(self, config: DiscountConfig):
        self.config = config
    
    def apply_discount(self, amount: float) -> float:
        if amount < self.config.min_purchase:
            return 0
        discount = self.config.strategy.calculate(amount)
        return min(discount, self.config.max_discount)

# 一个简单计算需要 30+ 行的初始化代码
```

**✅ 正确做法（简洁）**

```python
def calculate_discount(amount: float, percent: float) -> float:
    """Calculate discount amount. percent should be 0-100."""
    return amount * (percent / 100)

# 使用
discount = calculate_discount(100.0, 10.0)  # 减 $10
```

**何时增加复杂度：** 只在你确实需要多种折扣类型时。如果之后有这个需求，到时候再重构。

### 示例 2：投机性功能

**用户请求：** "把用户偏好设置保存到数据库"

**❌ LLM 常见做法（不必要的功能）**

```python
class PreferenceManager:
    def __init__(self, db, cache=None, validator=None):
        self.db = db
        self.cache = cache or InMemoryCache()
        self.validator = validator or DefaultValidator()
    
    def save(self, user_id: int, prefs: dict, 
             merge: bool = True, 
             validate: bool = True,
             notify: bool = False) -> bool:
        """Save preferences with optional merging, validation, and notifications."""
        
        if validate:
            errors = self.validator.validate(prefs)
            if errors:
                raise ValidationError(errors)
        
        existing = self.get(user_id) if merge else {}
        
        if merge:
            existing.update(prefs)
            prefs = existing
        
        self.db.execute(
            "UPDATE users SET preferences = ? WHERE id = ?",
            (json.dumps(prefs), user_id)
        )
        
        if self.cache:
            self.cache.set(f"prefs:{user_id}", prefs)
        
        if notify:
            self.notify_preference_change(user_id, prefs)
        
        return True
    
    def notify_preference_change(self, user_id: int, prefs: dict):
        # 为一个没人要的功能又写了 30 行
        pass
```

**✅ 正确做法（只做被要求的）**

```python
def save_preferences(db, user_id: int, preferences: dict):
    """Save user preferences to database."""
    db.execute(
        "UPDATE users SET preferences = ? WHERE id = ?",
        (json.dumps(preferences), user_id)
    )
```

**按需补充：** 缓存（性能出问题时）、验证（出现脏数据时）、合并（需求出现时）。

---

## 3. 精准修改

### 示例 1：随手重构

**用户请求：** "修复空邮箱导致验证器崩溃的 bug"

**❌ LLM 常见做法（改太多了）**

```diff
  def validate_user(user_data):
-     # Check email format
-     if not user_data.get('email'):
+     """Validate user data."""
+     email = user_data.get('email', '').strip()
+     
+     # Validate email
+     if not email:
          raise ValueError("Email required")
-     
-     # Basic email validation
-     if '@' not in user_data['email']:
+     if '@' not in email or '.' not in email.split('@')[1]:
          raise ValueError("Invalid email")
      
-     # Check username
-     if not user_data.get('username'):
+     # Validate username
+     username = user_data.get('username', '').strip()
+     if not username:
          raise ValueError("Username required")
+     if len(username) < 3:
+         raise ValueError("Username too short")
+     if not username.isalnum():
+         raise ValueError("Username must be alphanumeric")
      
      return True
```

**问题：**
- 超出 bug 修复范围"改进"了邮箱验证
- 添加了没人要的用户名验证
- 改了注释
- 加了 docstring

**✅ 正确做法（精准）**

```diff
  def validate_user(user_data):
      # Check email format
-     if not user_data.get('email'):
+     email = user_data.get('email', '')
+     if not email or not email.strip():
          raise ValueError("Email required")
      
      # Basic email validation
-     if '@' not in user_data['email']:
+     if '@' not in email:
          raise ValueError("Invalid email")
      
      # Check username
      if not user_data.get('username'):
          raise ValueError("Username required")
      
      return True
```

**只改了：** 修复空邮箱处理的特定行。

### 示例 2：风格漂移

**用户请求：** "给上传函数添加日志"

**❌ LLM 常见做法（顺手格式化）**

```diff
- def upload_file(file_path, destination):
+ def upload_file(file_path: str, destination: str) -> bool:
+     """Upload file to destination with logging."""
+     logger.info(f"Uploading {file_path} to {destination}")
+     
      try:
-         with open(file_path, 'rb') as f:
-             data = f.read()
-         
-         response = requests.post(destination, files={'file': data})
-         
-         if response.status_code == 200:
-             return True
-         else:
-             return False
+         with open(file_path, "rb") as f:
+             data = f.read()
+         response = requests.post(destination, files={"file": data})
+         success = response.status_code == 200
+         
+         if success:
+             logger.info(f"Upload successful: {file_path}")
+         else:
+             logger.error(f"Upload failed: {file_path}, status={response.status_code}")
+         
+         return success
      except Exception as e:
-         print(f"Error: {e}")
+         logger.exception(f"Upload error for {file_path}: {e}")
          return False
```

**问题：**
- 改了引号风格（'' 变 ""）
- 加了没人要的类型注解
- 加了 docstring
- 改了空白格式
- 改了布尔值返回逻辑

**✅ 正确做法（匹配现有风格）**

```diff
+ import logging
+ 
+ logger = logging.getLogger(__name__)
+ 
  def upload_file(file_path, destination):
+     logger.info(f'Starting upload: {file_path}')
      try:
          with open(file_path, 'rb') as f:
              data = f.read()
          
          response = requests.post(destination, files={'file': data})
          
          if response.status_code == 200:
+             logger.info(f'Upload successful: {file_path}')
              return True
          else:
+             logger.error(f'Upload failed: {file_path}, status={response.status_code}')
              return False
      except Exception as e:
-         print(f"Error: {e}")
+         logger.exception(f'Upload error: {file_path}')
          return False
```

**匹配了：** 单引号、无类型注解、现有布尔模式、缩进风格。

---

## 4. 目标驱动执行

### 示例 1：模糊 vs. 可验证

**用户请求：** "修复认证系统"

**❌ LLM 常见做法（模糊方案）**

```
我将通过以下步骤修复认证系统：
1. 审查代码
2. 发现问题
3. 做出改进
4. 测试变更

[然后在没有明确成功标准的情况下开始改代码]
```

**✅ 正确做法（可验证的目标）**

```
要"修复认证"，我需要定义成功标准。
具体要解决什么问题？

如果问题是"用户修改密码后仍处于登录状态"：

计划：
1. 编写测试：修改密码 → 验证旧会话已失效
   验证：测试失败（复现了 bug）

2. 实现：密码修改时使会话失效
   验证：测试通过

3. 检查边界情况：多个活跃会话、并发修改
   验证：额外测试通过

4. 验证无回归：现有认证测试仍然通过
   验证：完整测试套件为绿

当前认证测试覆盖率：[显示覆盖率]
你遇到的具体认证问题是什么？
```

### 示例 2：带验证的多步骤

**用户请求：** "给 API 添加限流"

**❌ LLM 常见做法（一步到位）**

```python
# 在一次 300 行的提交中实现了完整的限流：
# Redis、多种策略、配置系统和监控
# 没有清晰的验证步骤
```

**✅ 正确做法（增量迭代 + 验证）**

```
限流实施计划：

1. 添加基本的内存限流（单个端点）
   验证：
   - 测试：100 次请求 → 前 10 次成功，其余返回 429
   - 手动：curl 端点 11 次，看到限流错误

2. 抽取为中间件（应用到所有端点）
   验证：
   - 测试：限流对 /users 和 /posts 都生效
   - 现有端点测试仍通过

3. 添加 Redis 后端（多服务器支持）
   验证：
   - 测试：限流在应用重启后仍有效
   - 测试：两个应用实例共享限流计数器

4. 添加配置（按端点设置不同速率）
   验证：
   - 测试：/search 允许 10 次/分钟，/users 允许 100 次/分钟
   - 配置文件正确解析

每一步都可以独立验证和部署。
从第 1 步开始？
```

### 示例 3：测试先行验证

**用户请求：** "分数相同时排序会出错"

**❌ LLM 常见做法（不复现就修）**

```python
# 没有确认 bug 就直接修改排序逻辑
def sort_scores(scores):
    return sorted(scores, key=lambda x: (-x['score'], x['name']))
```

**✅ 正确做法（先复现）**

```python
# 1. 首先，编写复现问题的测试
def test_sort_with_duplicate_scores():
    """Test sorting when multiple items have same score."""
    scores = [
        {'name': 'Alice', 'score': 100},
        {'name': 'Bob', 'score': 100},
        {'name': 'Charlie', 'score': 90},
    ]
    
    result = sort_scores(scores)
    
    # bug：重复分数时排序不确定
    # 多次运行这个测试，结果应该一致
    assert result[0]['score'] == 100
    assert result[1]['score'] == 100
    assert result[2]['score'] == 90

# 验证：运行测试 10 次 → 因排序不一致而失败

# 2. 现在用稳定排序修复
def sort_scores(scores):
    """Sort by score descending, then name ascending for ties."""
    return sorted(scores, key=lambda x: (-x['score'], x['name']))

# 验证：测试一致通过
```

---

## 反模式总结

| 原则 | 反模式 | 修正 |
|------|--------|------|
| 编码前先思考 | 默默假设文件格式、字段、范围 | 明确列出假设，请求澄清 |
| 简洁优先 | 为单个折扣计算使用策略模式 | 一个函数就够，等真的需要复杂度再说 |
| 精准修改 | 修 bug 时顺手改引号风格、加类型注解 | 只改修复问题的行 |
| 目标驱动 | "我来审查和改进代码" | "为 bug X 写测试 → 让测试通过 → 验证无回归" |

## 核心洞察

那些"过度复杂"的示例并非明显错误——它们遵循设计模式和最佳实践。问题在于**时机**：它们在需要之前就引入了复杂度，导致：

- 代码更难理解
- 引入更多 bug
- 实现耗时更长
- 更难测试

而"简洁"版本：
- 更易理解
- 实现更快
- 更易测试
- 真正需要复杂度时再重构也不迟

**好的代码是简洁地解决今天的问题，而不是过早地解决明天的问题。**
