# Ví Dụ

Các ví dụ code thực tế minh họa bốn nguyên tắc. Mỗi ví dụ cho thấy LLM thường làm sai ở đâu và nên sửa như thế nào.

---

## 1. Suy Nghĩ Trước Khi Code

### Ví Dụ 1: Giả Định Ẩn

**Yêu cầu của người dùng:** "Thêm tính năng export dữ liệu người dùng"

**❌ Điều LLM Thường Làm (Giả định sai)**

```python
def export_users(format='json'):
    """Xuất tất cả người dùng ra file."""
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

**Vấn đề:**
- Tự cho rằng phải export TOÀN BỘ người dùng (còn pagination? quyền riêng tư?)
- Tự quyết định vị trí file mà không hỏi
- Tự quyết định các field cần có
- Tự suy ra fieldnames cho CSV mà không kiểm tra cấu trúc dữ liệu thật

**✅ Điều Nên Xảy Ra (Làm rõ giả định)**

```
Trước khi triển khai, tôi cần làm rõ:

1. **Phạm vi**: Export toàn bộ người dùng hay chỉ một tập đã lọc? (liên quan đến quyền riêng tư)
2. **Định dạng**: Bạn nói "export" là muốn:
   - Tải file trên trình duyệt?
   - Chạy background job rồi gửi email?
   - API endpoint trả dữ liệu?
3. **Field**: Cần những field nào của người dùng? (một số có thể nhạy cảm)
4. **Khối lượng**: Thông thường có bao nhiêu người dùng? (ảnh hưởng tới cách triển khai)

Cách đơn giản nhất: thêm một API endpoint trả JSON có phân trang.
Nếu export ra file thì tôi cần thêm thông tin.

Bạn muốn hướng nào?
```

### Ví Dụ 2: Nhiều Cách Diễn Giải

**Yêu cầu của người dùng:** "Làm cho phần search nhanh hơn"

**❌ Điều LLM Thường Làm (Tự chọn trong im lặng)**

```python
# Thêm cache, database index, và xử lý async
# mà không hỏi "nhanh hơn" ở đây nghĩa là gì
@lru_cache(maxsize=1000)
async def search(query: str) -> List[Result]:
    # ... 200 dòng code tối ưu hóa
```

**✅ Điều Nên Xảy Ra**

```
"Làm cho phần search nhanh hơn" có thể có nghĩa là:

1. **Thời gian phản hồi nhanh hơn** (< 100ms thay vì 500ms)
   - Thêm database index
   - Cache các truy vấn phổ biến
   - Ước lượng công: 2 giờ

2. **Xử lý được nhiều truy vấn đồng thời hơn** (throughput)
   - Thêm async/await
   - Connection pooling
   - Ước lượng công: 4 giờ

3. **Cảm giác nhanh hơn với người dùng** (UX)
   - Hiển thị một phần kết quả ngay lập tức
   - Progressive loading
   - Ước lượng công: 3 giờ

Hiện tại search mất khoảng ~500ms với truy vấn thông thường.
Khía cạnh nào quan trọng nhất với use case của bạn?
```

---

## 2. Ưu Tiên Sự Đơn Giản

### Ví Dụ 1: Abstraction Quá Mức

**Yêu cầu của người dùng:** "Thêm hàm tính discount"

**❌ Điều LLM Thường Làm (Overengineered)**

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

# Chỉ một phép tính đơn giản mà phải setup hơn 30 dòng
```

**✅ Điều Nên Xảy Ra (Đơn giản)**

```python
def calculate_discount(amount: float, percent: float) -> float:
    """Tính số tiền được giảm. percent nên nằm trong khoảng 0-100."""
    return amount * (percent / 100)

# Cách dùng
discount = calculate_discount(100.0, 10.0)  # giảm 10 đô
```

**Khi nào nên thêm độ phức tạp:** Chỉ khi bạn thực sự cần nhiều loại discount khác nhau. Nếu yêu cầu đó đến sau, lúc ấy hãy refactor.

### Ví Dụ 2: Tính Năng Suy Đoán Trước

**Yêu cầu của người dùng:** "Lưu user preferences vào database"

**❌ Điều LLM Thường Làm (Tính năng không cần thiết)**

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
        """Lưu preferences với tùy chọn merge, validation, và notification."""

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
        # Lại thêm 30 dòng nữa cho một tính năng không ai yêu cầu
        pass
```

**✅ Điều Nên Xảy Ra (Chỉ làm đúng yêu cầu)**

```python
def save_preferences(db, user_id: int, preferences: dict):
    """Lưu user preferences vào database."""
    db.execute(
        "UPDATE users SET preferences = ? WHERE id = ?",
        (json.dumps(preferences), user_id)
    )
```

**Chỉ thêm sau nếu cần:** Cache (khi hiệu năng trở nên quan trọng), validation (khi xuất hiện dữ liệu xấu), merge (khi yêu cầu thực sự xuất hiện).

---

## 3. Chỉnh Sửa Có Chủ Đích

### Ví Dụ 1: Refactor Tiện Tay

**Yêu cầu của người dùng:** "Sửa bug validator bị crash khi email rỗng"

**❌ Điều LLM Thường Làm (Làm quá nhiều)**

```diff
  def validate_user(user_data):
-     # Check email format
-     if not user_data.get('email'):
+     """Xác thực dữ liệu người dùng."""
+     email = user_data.get('email', '').strip()
+
+     # Xác thực email
+     if not email:
          raise ValueError("Email required")
-
-     # Basic email validation
-     if '@' not in user_data['email']:
+     if '@' not in email or '.' not in email.split('@')[1]:
          raise ValueError("Invalid email")

-     # Check username
-     if not user_data.get('username'):
+     # Xác thực username
+     username = user_data.get('username', '').strip()
+     if not username:
          raise ValueError("Username required")
+     if len(username) < 3:
+         raise ValueError("Username too short")
+     if not username.isalnum():
+         raise ValueError("Username must be alphanumeric")

      return True
```

**Vấn đề:**
- "Cải thiện" phần validation email vượt quá bug cần sửa
- Thêm validation cho username mà không ai yêu cầu
- Đổi comment
- Thêm docstring

**✅ Điều Nên Xảy Ra (Chỉnh sửa gọn)**

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

**Chỉ thay đổi:** Những dòng trực tiếp sửa lỗi xử lý email rỗng.

### Ví Dụ 2: Trôi Style

**Yêu cầu của người dùng:** "Thêm logging vào hàm upload"

**❌ Điều LLM Thường Làm (Reformat toàn bộ)**

```diff
- def upload_file(file_path, destination):
+ def upload_file(file_path: str, destination: str) -> bool:
+     """Upload file lên đích với logging."""
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

**Vấn đề:**
- Đổi style quote (`''` thành `""`)
- Thêm type hint mà không ai yêu cầu
- Thêm docstring
- Đổi whitespace
- Đổi luôn logic trả về boolean

**✅ Điều Nên Xảy Ra (Khớp style hiện có)**

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

**Đã khớp:** Single quotes, không có type hint, giữ nguyên pattern boolean hiện có, và style spacing cũ.

---

## 4. Thực Thi Theo Mục Tiêu

### Ví Dụ 1: Mơ Hồ vs. Có Thể Kiểm Chứng

**Yêu cầu của người dùng:** "Sửa hệ thống authentication"

**❌ Điều LLM Thường Làm (Cách tiếp cận mơ hồ)**

```
Tôi sẽ sửa hệ thống authentication bằng cách:
1. Review code
2. Xác định vấn đề
3. Thực hiện cải thiện
4. Test lại thay đổi

[Tiếp tục sửa code mà không có tiêu chí thành công rõ ràng]
```

**✅ Điều Nên Xảy Ra (Mục tiêu có thể kiểm chứng)**

```
Để "sửa authentication", tôi cần xác định tiêu chí thành công.
Cụ thể chúng ta đang giải quyết vấn đề nào?

Nếu vấn đề là "người dùng vẫn còn đăng nhập sau khi đổi mật khẩu":

Kế hoạch:
1. Viết test: Đổi mật khẩu → xác minh session cũ bị vô hiệu hóa
   Verify: Test fail (tái hiện được bug)

2. Triển khai: Vô hiệu hóa session khi đổi mật khẩu
   Verify: Test pass

3. Kiểm tra edge case: Nhiều session đang hoạt động, thay đổi đồng thời
   Verify: Các test bổ sung pass

4. Xác minh không có regression: Các test auth hiện có vẫn pass
   Verify: Toàn bộ test suite xanh

Mức test coverage hiện tại cho auth: [hiển thị coverage]
Bạn đang gặp vấn đề auth cụ thể nào?
```

### Ví Dụ 2: Nhiều Bước Có Xác Minh

**Yêu cầu của người dùng:** "Thêm rate limiting cho API"

**❌ Điều LLM Thường Làm (Làm tất cả cùng lúc)**

```python
# Triển khai trọn bộ rate limiting với Redis, nhiều chiến lược,
# hệ thống cấu hình và monitoring trong một commit 300 dòng
# Không có các bước xác minh rõ ràng
```

**✅ Điều Nên Xảy Ra (Từng bước, có xác minh)**

```
Kế hoạch cho rate limiting:

1. Thêm rate limiting cơ bản trong memory (một endpoint)
   Verify:
   - Test: 100 request → 10 request đầu thành công, phần còn lại nhận 429
   - Thủ công: curl endpoint 11 lần, thấy lỗi rate limit

2. Tách thành middleware (áp dụng cho mọi endpoint)
   Verify:
   - Test: Rate limit áp dụng cho /users và /posts
   - Các test endpoint hiện có vẫn pass

3. Thêm Redis backend (cho multi-server)
   Verify:
   - Test: Rate limit vẫn giữ sau khi app restart
   - Test: Hai instance app dùng chung bộ đếm rate limit

4. Thêm cấu hình (mỗi endpoint có mức riêng)
   Verify:
   - Test: /search cho phép 10/phút, /users cho phép 100/phút
   - File cấu hình được parse đúng

Mỗi bước đều có thể xác minh và deploy độc lập.
Bắt đầu từ bước 1 chứ?
```

### Ví Dụ 3: Xác Minh Theo Kiểu Test-First

**Yêu cầu của người dùng:** "Phần sorting bị lỗi khi có duplicate scores"

**❌ Điều LLM Thường Làm (Sửa mà không tái hiện)**

```python
# Đổi logic sort ngay lập tức mà chưa xác nhận bug
def sort_scores(scores):
    return sorted(scores, key=lambda x: (-x['score'], x['name']))
```

**✅ Điều Nên Xảy Ra (Tái hiện trước)**

```python
# 1. Trước tiên, viết test để tái hiện vấn đề
def test_sort_with_duplicate_scores():
    """Test sorting khi nhiều item có cùng score."""
    scores = [
        {'name': 'Alice', 'score': 100},
        {'name': 'Bob', 'score': 100},
        {'name': 'Charlie', 'score': 90},
    ]

    result = sort_scores(scores)

    # Bug ở đây: thứ tự trở nên không xác định khi có phần tử trùng điểm
    # Chạy test này nhiều lần, kết quả phải nhất quán
    assert result[0]['score'] == 100
    assert result[1]['score'] == 100
    assert result[2]['score'] == 90

# Verify: Chạy test 10 lần → fail vì thứ tự không nhất quán

# 2. Bây giờ mới sửa bằng stable sort
def sort_scores(scores):
    """Sắp xếp score giảm dần, nếu hòa thì theo tên tăng dần."""
    return sorted(scores, key=lambda x: (-x['score'], x['name']))

# Verify: Test pass ổn định
```

---

## Tóm Tắt Các Phản Mẫu

| Nguyên tắc | Phản mẫu | Cách sửa |
|-----------|----------|----------|
| Suy Nghĩ Trước Khi Code | Âm thầm giả định định dạng file, field, phạm vi | Liệt kê giả định rõ ràng, yêu cầu làm rõ |
| Ưu Tiên Sự Đơn Giản | Dùng strategy pattern cho một phép tính discount duy nhất | Một hàm là đủ cho tới khi thực sự cần thêm độ phức tạp |
| Chỉnh Sửa Có Chủ Đích | Đổi quote, thêm type hint trong lúc sửa bug | Chỉ sửa những dòng trực tiếp xử lý vấn đề được báo |
| Thực Thi Theo Mục Tiêu | "Tôi sẽ review và cải thiện code" | "Viết test cho bug X → làm cho test pass → xác minh không regression" |

## Ý Chính

Các ví dụ "quá phức tạp" không hẳn là sai rõ ràng, chúng vẫn bám theo design pattern và best practice. Vấn đề nằm ở **thời điểm**: chúng thêm độ phức tạp trước khi thực sự cần, dẫn đến:

- Code khó hiểu hơn
- Sinh ra nhiều bug hơn
- Tốn nhiều thời gian triển khai hơn
- Khó test hơn

Các phiên bản "đơn giản" thì:
- Dễ hiểu hơn
- Triển khai nhanh hơn
- Dễ test hơn
- Có thể refactor sau khi độ phức tạp thực sự xuất hiện

**Code tốt là code giải quyết vấn đề của hôm nay một cách đơn giản, không phải giải quyết sớm vấn đề của ngày mai.**
