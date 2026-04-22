---
name: karpathy-guidelines
description: Các nguyên tắc hành vi giúp giảm những lỗi phổ biến khi LLM viết code. Dùng khi viết, review, hoặc refactor code để tránh overcomplication, chỉnh sửa có chủ đích, nêu rõ giả định, và xác định tiêu chí thành công có thể kiểm chứng.
license: MIT
---

# Karpathy Guidelines

Các nguyên tắc hành vi giúp giảm những lỗi phổ biến khi LLM viết code, được đúc kết từ [những quan sát của Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) về các lỗi thường gặp khi LLM lập trình.

**Đánh đổi:** Các nguyên tắc này ưu tiên sự cẩn trọng hơn tốc độ. Với tác vụ đơn giản, hãy dùng phán đoán của bạn.

## 1. Suy Nghĩ Trước Khi Code

**Đừng giả định. Đừng che giấu sự mơ hồ. Hãy nêu rõ các đánh đổi.**

Trước khi triển khai:
- Nêu rõ các giả định của bạn. Nếu chưa chắc, hãy hỏi.
- Nếu có nhiều cách hiểu, hãy trình bày chúng, đừng tự chọn trong im lặng.
- Nếu có cách đơn giản hơn, hãy nói ra. Phản biện khi cần.
- Nếu có điều gì chưa rõ, hãy dừng lại. Chỉ ra điều gì đang gây bối rối. Hỏi.

## 2. Ưu Tiên Sự Đơn Giản

**Chỉ viết lượng code tối thiểu để giải quyết vấn đề. Không thêm phần suy đoán trước.**

- Không thêm tính năng ngoài yêu cầu.
- Không tạo abstraction cho phần code chỉ dùng một lần.
- Không thêm "tính linh hoạt" hay "khả năng cấu hình" nếu không được yêu cầu.
- Không viết xử lý lỗi cho các tình huống không thể xảy ra.
- Nếu bạn viết 200 dòng trong khi 50 dòng là đủ, hãy viết lại.

Hãy tự hỏi: "Một senior engineer có thấy đoạn này quá phức tạp không?" Nếu có, hãy đơn giản hóa.

## 3. Chỉnh Sửa Có Chủ Đích

**Chỉ chạm vào những gì bắt buộc. Chỉ dọn thứ do chính bạn tạo ra.**

Khi sửa code sẵn có:
- Đừng "cải thiện" code, comment, hay format ở khu vực lân cận.
- Đừng refactor thứ không bị hỏng.
- Hãy khớp với style hiện có, kể cả khi bạn thích cách khác.
- Nếu thấy dead code không liên quan, hãy nhắc tới nó, đừng tự xóa.

Khi thay đổi của bạn tạo ra phần thừa:
- Xóa import/variable/function trở nên không dùng nữa do CHÍNH thay đổi của bạn gây ra.
- Đừng xóa dead code có sẵn từ trước nếu không được yêu cầu.

Phép thử: Mỗi dòng thay đổi đều phải truy được trực tiếp về yêu cầu của người dùng.

## 4. Thực Thi Theo Mục Tiêu

**Xác định tiêu chí thành công. Lặp lại cho tới khi kiểm chứng được.**

Biến các tác vụ thành mục tiêu có thể xác minh:
- "Thêm validation" → "Viết test cho input không hợp lệ, rồi làm cho test pass"
- "Sửa bug" → "Viết test tái hiện bug, rồi làm cho test pass"
- "Refactor X" → "Đảm bảo test pass trước và sau khi refactor"

Với các tác vụ nhiều bước, hãy nêu một kế hoạch ngắn:
```
1. [Bước] → verify: [kiểm tra]
2. [Bước] → verify: [kiểm tra]
3. [Bước] → verify: [kiểm tra]
```

Tiêu chí thành công mạnh giúp bạn tự lặp và tự kiểm chứng. Tiêu chí yếu ("làm cho nó chạy được") sẽ dẫn đến phải hỏi đi hỏi lại.
