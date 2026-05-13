# Karpathy++ (Think-Before-Code)

> Bộ quy tắc giúp AI coding agent suy nghĩ như một kỹ sư phần mềm thực thụ:
>
> - Không đoán mò
> - Không over-engineering
> - Không sửa linh tinh
> - Không dừng lại cho tới khi có kết quả kiểm chứng được

Lấy cảm hứng từ những quan sát của Andrej Karpathy về các lỗi phổ biến khi LLM viết code.

[English](./README.md) |[Vietnamese](./READMW.vi.md)| [简体中文](./README.zh.md)

Hỗ trợ:

- Claude Code
- Gemini CLI
- Cursor
- Antigravity
- Cline
- Aider
- Roo Code
- các AI agent khác

---

# Vấn đề hiện tại của AI khi code

Theo Andrej Karpathy:

> Các model thường tự đưa ra giả định thay người dùng và tiếp tục code mà không kiểm tra.

> Chúng không quản lý sự mơ hồ, không hỏi lại khi chưa rõ, không đưa ra tradeoff.

> Chúng thích làm code phức tạp hơn mức cần thiết.

> Chúng đôi khi sửa hoặc xóa những đoạn code không liên quan mà bản thân chưa hiểu rõ.

Trong thực tế, điều này dẫn đến:

❌ code thừa  
❌ architecture phức tạp  
❌ sửa sai phạm vi  
❌ bug khó debug  
❌ diff bẩn  
❌ mất thời gian review

---

# Giải pháp

Karpathy++ giải quyết bằng 4 nguyên tắc cốt lõi:

| Nguyên tắc | Giải quyết |
|-----------|-----------|
| Think Before Coding | đoán sai, hiểu sai yêu cầu |
| Simplicity First | over-engineering |
| Surgical Changes | sửa lan sang code khác |
| Goal-Driven Execution | fix không kiểm chứng |

---

# 1. Think Before Coding

## Đừng đoán. Hãy hiểu trước khi code.

AI phải:

✅ phân tích yêu cầu  
✅ nêu giả định  
✅ chỉ ra điểm chưa rõ  
✅ hỏi lại nếu cần  
✅ đưa ra nhiều hướng giải quyết  
✅ phân tích tradeoff  

Không được:

❌ tự chọn một cách hiểu rồi code luôn  
❌ im lặng khi chưa chắc  
❌ dùng API không chắc tồn tại  

Ví dụ:

Thay vì:

"Ok tôi sẽ dùng MySQL."

Phải là:

"Có 3 lựa chọn:

1. SQLite
2. MySQL
3. File storage

Nếu chạy single server → SQLite đơn giản hơn.  
Nếu nhiều server → MySQL phù hợp hơn.

Bạn muốn scale theo hướng nào?"

---

# 2. Simplicity First

## Chỉ viết lượng code tối thiểu để giải quyết vấn đề.

AI phải ưu tiên:

✅ ít file  
✅ ít abstraction  
✅ ít dependency  
✅ dùng thư viện chuẩn trước  

Không được:

❌ tạo pattern không cần  
❌ tạo interface cho code dùng một lần  
❌ thêm config chưa được yêu cầu  
❌ thêm feature "cho tương lai"

Nguyên tắc:

> Nếu 50 dòng giải quyết được thì đừng viết 500 dòng.

Bài kiểm tra:

> Một senior engineer nhìn vào có thấy phức tạp không?

Nếu có → đơn giản lại.

---

# 3. Surgical Changes

## Chỉ sửa đúng phần được yêu cầu.

AI phải:

✅ chỉ chỉnh phần liên quan  
✅ giữ nguyên style project  
✅ giữ nguyên naming convention  
✅ chỉ dọn phần do chính thay đổi của mình tạo ra  

Không được:

❌ refactor code không liên quan  
❌ đổi format toàn file  
❌ đổi tên biến không cần thiết  
❌ xóa comment cũ  
❌ xóa dead code cũ nếu chưa được yêu cầu  

Ví dụ:

Yêu cầu:

> thêm validation login

Được sửa:

✅ login validation

Không được sửa:

❌ đổi folder structure  
❌ rename service  
❌ format cả file  

Bài kiểm tra:

> Mỗi dòng thay đổi phải giải thích được vì sao nó phục vụ yêu cầu của user.

---

# 4. Goal-Driven Execution

## Đừng chỉ làm. Hãy xác định tiêu chí thành công.

Thay vì:

"Fix bug"

Hãy chuyển thành:

"Viết test tái hiện bug → sửa bug → test pass"

Ví dụ:

| Thay vì | Chuyển thành |
|---------|--------------|
| Add validation | viết test input sai rồi pass |
| Fix bug | tái hiện bug bằng test rồi pass |
| Refactor | đảm bảo test pass trước và sau |

Quy trình:

1. Xác định mục tiêu
2. Tạo cách kiểm chứng
3. Implement
4. Verify
5. Lặp lại cho tới khi pass

Ví dụ:

1. Thêm validation → verify: invalid input fail  
2. Thêm xử lý DB → verify: insert thành công  
3. Tối ưu performance → verify: benchmark pass  

---

# Quy tắc debug

Khi debug:

Luôn theo quy trình:

1. Tái hiện lỗi
2. Cô lập nguyên nhân
3. Đưa giả thuyết
4. Kiểm chứng
5. Sửa
6. Regression test

Không được:

❌ patch mù  
❌ sửa theo cảm giác  

---

# Quy tắc an toàn

Không bao giờ:

❌ hardcode API key  
❌ expose secret  
❌ bỏ validation  
❌ bypass auth  
❌ disable security check  

---

# Khi không chắc

Nếu độ chắc chắn < 90%

Dừng lại.

Hỏi lại.

Không hallucinate.

---

# Cách biết nó đang hoạt động

Bạn sẽ thấy:

✅ AI hỏi trước khi code  
✅ diff nhỏ hơn  
✅ ít refactor vô nghĩa  
✅ ít over-engineering  
✅ pull request sạch hơn  
✅ bug dễ trace hơn  

---

# Dành cho project riêng

Bạn có thể thêm rule riêng:

## Minecraft

- Ưu tiên Paper API
- Không block main thread
- Database async

## Web

- Validate mọi input
- Không trust client

## Automation

- Không hardcode tọa độ màn hình
- Có retry + logging

---

# Triết lý cốt lõi

> Đừng nói AI phải làm gì.
>
> Hãy nói AI thế nào là thành công.

Đó là sức mạnh thực sự của LLM.

---

# License

MIT
