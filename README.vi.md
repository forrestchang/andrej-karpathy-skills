# Các Nguyên Tắc Hướng Dẫn Claude Code Lấy Cảm Hứng Từ Karpathy

> Khám phá dự án mới của tôi [Multica](https://github.com/multica-ai/multica) — một nền tảng mã nguồn mở để chạy và quản lý các agent lập trình với các kỹ năng có thể tái sử dụng.
>
> Theo dõi tôi trên X: [https://x.com/jiayuan_jy](https://x.com/jiayuan_jy)

Một tệp `CLAUDE.md` duy nhất để cải thiện hành vi của Claude Code, được đúc kết từ [những quan sát của Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) về các cạm bẫy lập trình của LLM.

[English](./README.md) | [简体中文](./README.zh.md) | Tiếng Việt

## Các Vấn Đề

Từ bài đăng của Andrej:

> "Các mô hình tự đưa ra các giả định sai lầm thay bạn và tiếp tục chạy với chúng mà không kiểm tra lại. Chúng không tự quản lý được sự nhầm lẫn của mình, không tìm kiếm sự làm rõ, không bộc lộ những điểm mâu thuẫn, không đưa ra các sự đánh đổi, không phản biện lại khi cần thiết."

> "Chúng thực sự rất thích làm phức tạp hóa mã nguồn và API, làm cồng kềnh các abstraction, không dọn dẹp mã chết (dead code)... triển khai một cấu trúc cồng kềnh hơn 1000 dòng mã trong khi 100 dòng là đủ."

> "Đôi khi chúng vẫn thay đổi/xóa bỏ các chú thích và mã mà chúng không hiểu rõ như là những tác dụng phụ, ngay cả khi nó không liên quan đến nhiệm vụ."

## Giải Pháp

Bốn nguyên tắc trong một tệp trực tiếp giải quyết các vấn đề này:

| Nguyên Tắc | Giải Quyết |
|-----------|-----------|
| **Suy Nghĩ Trước Khi Code** | Các giả định sai lầm, sự nhầm lẫn tiềm ẩn, thiếu sự rạch ròi về đánh đổi |
| **Ưu Tiên Sự Đơn Giản** | Làm phức tạp hóa quá mức, abstraction cồng kềnh |
| **Thay Đổi Có Chủ Đích (Surgical Changes)** | Chỉnh sửa không liên quan, chạm vào mã mà bạn không nên chạm |
| **Thực Thi Hướng Mục Tiêu** | Tận dụng phương pháp test-first (kiểm thử trước), các tiêu chí thành công có thể xác minh được |

## Chi Tiết Bốn Nguyên Tắc

### 1. Suy Nghĩ Trước Khi Code

**Đừng tự giả định. Đừng giấu giếm sự nhầm lẫn. Bộc lộ các đánh đổi.**

LLMs thường lặng lẽ chọn một cách hiểu và chạy theo nó. Nguyên tắc này ép buộc sự suy luận rõ ràng:

- **Nêu rõ các giả định** — Nếu không chắc chắn, hãy hỏi thay vì đoán.
- **Trình bày nhiều cách hiểu khác nhau** — Đừng âm thầm chọn khi có sự mơ hồ.
- **Phản biện lại khi cần thiết** — Nếu có cách tiếp cận đơn giản hơn, hãy nói ra.
- **Dừng lại khi bối rối** — Gọi tên điểm không rõ ràng và yêu cầu làm rõ.

### 2. Ưu Tiên Sự Đơn Giản

**Viết tối thiểu mã để giải quyết vấn đề. Không làm những thứ suy đoán.**

Chống lại xu hướng làm phức tạp cấu trúc (overengineering):

- Không thêm tính năng ngoài những gì được yêu cầu.
- Không tạo abstraction cho mã chỉ dùng một lần.
- Không tạo sự "linh hoạt" hay "có thể cấu hình" nếu không được yêu cầu.
- Không xử lý ngoại lệ cho các tình huống không thể xảy ra.
- Nếu 200 dòng mã có thể viết trong 50 dòng, hãy viết lại nó.

**Bài kiểm tra:** Liệu một kỹ sư senior có nói rằng nó bị phức tạp hóa quá mức không? Nếu có, hãy làm nó đơn giản lại.

### 3. Thay Đổi Có Chủ Đích

**Chỉ chạm vào những gì cần thiết. Chỉ dọn dẹp đống lộn xộn của chính bạn.**

Khi chỉnh sửa mã hiện có:

- Đừng "cải thiện" mã, chú thích, hoặc định dạng lân cận.
- Đừng refactor những thứ không bị hỏng.
- Tuân theo phong cách mã hiện tại, ngay cả khi bạn có thể làm khác.
- Nếu bạn nhận thấy mã chết không liên quan, hãy đề cập đến nó — đừng xóa nó.

Khi những thay đổi của bạn tạo ra các thành phần bị thừa:

- Xóa các thư viện/biến/hàm bị thừa do những thay đổi CỦA BẠN.
- Đừng xóa mã chết đã có từ trước trừ khi được yêu cầu.

**Bài kiểm tra:** Mỗi dòng thay đổi phải bám sát theo đúng yêu cầu của người dùng.

### 4. Thực Thi Hướng Mục Tiêu

**Xác định các tiêu chí thành công. Lặp lại cho đến khi được xác minh.**

Chuyển các mệnh lệnh nhiệm vụ thành các mục tiêu có thể xác minh:

| Thay vì... | Hãy chuyển thành... |
|--------------|-----------------|
| "Thêm validation" | "Viết test cho các đầu vào không hợp lệ, sau đó code để nó pass" |
| "Sửa bug" | "Viết một test để tái tạo bug đó, sau đó code để nó pass" |
| "Refactor X" | "Đảm bảo các test vẫn pass trước và sau khi refactor" |

Đối với các nhiệm vụ nhiều bước, hãy nêu ra một kế hoạch ngắn gọn:

```
1. [Bước] → xác minh: [kiểm tra]
2. [Bước] → xác minh: [kiểm tra]
3. [Bước] → xác minh: [kiểm tra]
```

Các tiêu chí thành công mạnh mẽ giúp LLM có thể tự lặp lại các bước. Những tiêu chí yếu (ví dụ: "làm cho nó hoạt động") đòi hỏi cần làm rõ liên tục.

## Cài Đặt

**Cách A: Claude Code Plugin (Khuyên dùng)**

Từ bên trong Claude Code, trước tiên thêm marketplace:
```
/plugin marketplace add forrestchang/andrej-karpathy-skills
```

Sau đó cài đặt plugin:
```
/plugin install andrej-karpathy-skills@karpathy-skills
```

Việc này sẽ cài đặt các hướng dẫn dưới dạng Claude Code plugin, giúp nó khả dụng trên tất cả các dự án của bạn.

**Cách B: Sử dụng tệp CLAUDE.md (theo từng dự án)**

Dự án mới:
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md
```

Dự án đang có (thêm vào cuối):
```bash
echo "" >> CLAUDE.md
curl https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

## Sử Dụng Với Cursor

Kho lưu trữ này bao gồm một tệp rule dự án đã được commit của Cursor ([`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)) nên các hướng dẫn tương tự sẽ được áp dụng khi bạn mở dự án trong Cursor. Xem **[CURSOR.md](CURSOR.md)** để biết cách thiết lập, cách sử dụng các quy tắc này trong dự án khác và cách nó liên quan tới Claude Code.

## Điểm Cốt Lõi

Từ Andrej:

> "LLMs đặc biệt xuất sắc trong việc lặp lại cho đến khi chúng đạt được những mục tiêu cụ thể... Đừng bảo nó phải làm gì, hãy cung cấp cho nó những tiêu chí thành công và xem nó làm việc."

Nguyên tắc "Thực Thi Hướng Mục Tiêu" nắm bắt được ý này: biến đổi các mệnh lệnh hướng dẫn thành các mục tiêu mang tính khai báo cùng với các vòng lặp xác minh.

## Làm Sao Để Biết Rằng Nó Đang Hiệu Quả

Những hướng dẫn này đang hoạt động hiệu quả nếu bạn thấy:

- **Ít các thay đổi không cần thiết trong difs** — Chỉ những thay đổi được yêu cầu mới xuất hiện.
- **Ít sự viết lại do sự làm phức tạp quá mức** — Mã nguồn tối giản ngay từ lần đầu.
- **Có các câu hỏi làm rõ trước khi việc triển khai thực thi** — Không phải là sau khi đã làm sai.
- **Các PRs rõ ràng, tối giản** — Không có sự refactoring "tiện tay" hay những sự "cải tiến" vô ý.

---

> Được xây dựng dựa trên nguyên tắc của [Andrej Karpathy](https://x.com/karpathy).
