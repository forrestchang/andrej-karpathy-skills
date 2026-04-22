# Hướng Dẫn Claude Code Theo Cảm Hứng Từ Karpathy

> Hãy xem dự án mới của tôi [Multica](https://github.com/multica-ai/multica) — một nền tảng mã nguồn mở để chạy và quản lý coding agent với các skill có thể tái sử dụng.
>
> Theo dõi tôi trên X: [https://x.com/jiayuan_jy](https://x.com/jiayuan_jy)

Một file `CLAUDE.md` duy nhất để cải thiện cách Claude Code làm việc, được đúc kết từ [những quan sát của Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) về các lỗi thường gặp khi LLM viết code.

[English](./README.md) | [简体中文](./README.zh.md) | Tiếng Việt

## Vấn Đề

Từ bài đăng của Andrej:

> "Các mô hình tự đưa ra giả định sai thay bạn rồi cứ thế làm tiếp mà không kiểm tra. Chúng không quản lý sự bối rối của mình, không hỏi để làm rõ, không chỉ ra chỗ mâu thuẫn, không trình bày các đánh đổi, và không phản biện khi đáng lẽ phải phản biện."

> "Chúng rất thích làm code và API trở nên quá phức tạp, phình to các tầng abstraction, không dọn dead code... triển khai một cấu trúc cồng kềnh hơn 1000 dòng trong khi 100 dòng là đủ."

> "Đôi khi chúng vẫn sửa hoặc xóa comment và code mà chúng chưa hiểu đủ, như một tác dụng phụ, dù phần đó không liên quan trực tiếp đến nhiệm vụ."

## Giải Pháp

Bốn nguyên tắc trong một file, trực tiếp xử lý các vấn đề này:

| Nguyên tắc | Xử lý |
|-----------|-------|
| **Suy Nghĩ Trước Khi Code** | Giả định sai, mơ hồ bị che giấu, thiếu đánh đổi |
| **Ưu Tiên Sự Đơn Giản** | Quá phức tạp, abstraction cồng kềnh |
| **Chỉnh Sửa Có Chủ Đích** | Sửa lan sang phần không liên quan, đụng vào phần không nên đụng |
| **Thực Thi Theo Mục Tiêu** | Tận dụng test-first và tiêu chí thành công có thể kiểm chứng |

## Chi Tiết Bốn Nguyên Tắc

### 1. Suy Nghĩ Trước Khi Code

**Đừng giả định. Đừng che giấu sự mơ hồ. Hãy nêu rõ các đánh đổi.**

LLM thường âm thầm chọn một cách hiểu rồi cứ thế triển khai. Nguyên tắc này buộc quá trình suy luận phải rõ ràng:

- **Nêu rõ giả định** — Nếu chưa chắc, hãy hỏi thay vì đoán
- **Trình bày nhiều cách hiểu** — Khi có mơ hồ, đừng tự chọn trong im lặng
- **Phản biện khi cần** — Nếu có cách đơn giản hơn, hãy nói ra
- **Dừng lại khi chưa rõ** — Chỉ ra điều gì đang mơ hồ và yêu cầu làm rõ

### 2. Ưu Tiên Sự Đơn Giản

**Chỉ viết lượng code tối thiểu để giải quyết vấn đề. Không thêm phần suy đoán trước.**

Để chống lại xu hướng overengineering:

- Không thêm tính năng ngoài yêu cầu
- Không tạo abstraction cho phần code chỉ dùng một lần
- Không thêm "tính linh hoạt" hay "khả năng cấu hình" nếu không được yêu cầu
- Không viết xử lý lỗi cho các tình huống không thể xảy ra
- Nếu 200 dòng có thể viết còn 50 dòng, hãy viết lại

**Phép thử:** Một senior engineer có thấy đoạn này đang bị làm quá không? Nếu có, hãy đơn giản hóa.

### 3. Chỉnh Sửa Có Chủ Đích

**Chỉ chạm vào những gì bắt buộc. Chỉ dọn thứ do chính bạn tạo ra.**

Khi sửa code sẵn có:

- Đừng "cải thiện" code, comment, hay format ở khu vực lân cận
- Đừng refactor thứ không bị hỏng
- Hãy khớp với style hiện có, kể cả khi bạn thích cách khác
- Nếu thấy dead code không liên quan, hãy nhắc tới nó, đừng tự xóa

Khi thay đổi của bạn tạo ra phần thừa:

- Xóa import/variable/function trở nên không dùng nữa do CHÍNH thay đổi của bạn gây ra
- Đừng xóa dead code có sẵn từ trước nếu không được yêu cầu

**Phép thử:** Mỗi dòng thay đổi đều phải truy được trực tiếp về yêu cầu của người dùng.

### 4. Thực Thi Theo Mục Tiêu

**Xác định tiêu chí thành công. Lặp lại cho tới khi kiểm chứng được.**

Biến các yêu cầu mệnh lệnh thành mục tiêu có thể xác minh:

| Thay vì... | Hãy biến thành... |
|------------|-------------------|
| "Thêm validation" | "Viết test cho input không hợp lệ, rồi làm cho test pass" |
| "Sửa bug" | "Viết test tái hiện bug, rồi làm cho test pass" |
| "Refactor X" | "Đảm bảo test pass trước và sau khi refactor" |

Với các tác vụ nhiều bước, hãy nêu một kế hoạch ngắn:

```
1. [Bước] → verify: [kiểm tra]
2. [Bước] → verify: [kiểm tra]
3. [Bước] → verify: [kiểm tra]
```

Tiêu chí thành công mạnh giúp LLM tự lặp và tự kiểm chứng. Tiêu chí yếu ("làm cho nó chạy được") sẽ dẫn đến phải hỏi đi hỏi lại.

## Cài Đặt

**Tùy chọn A: Plugin Claude Code (khuyến nghị)**

Từ bên trong Claude Code, trước tiên hãy thêm marketplace:
```
/plugin marketplace add forrestchang/andrej-karpathy-skills
```

Sau đó cài plugin:
```
/plugin install andrej-karpathy-skills@karpathy-skills
```

Việc này cài bộ nguyên tắc dưới dạng plugin Claude Code, giúp skill khả dụng trên mọi project của bạn.

**Tùy chọn B: CLAUDE.md (theo từng project)**

Project mới:
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md
```

Project đã có sẵn (append):
```bash
echo "" >> CLAUDE.md
curl https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md >> CLAUDE.md
```

## Dùng Với Cursor

Repo này đã có sẵn Cursor project rule ([`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)), nên cùng bộ nguyên tắc đó sẽ được áp dụng khi bạn mở project bằng Cursor. Xem **[CURSOR.md](CURSOR.md)** để biết cách thiết lập, dùng rule này cho project khác, và mối quan hệ của nó với Claude Code.

## Ý Chính

Từ Andrej:

> "LLM đặc biệt giỏi lặp cho đến khi đạt mục tiêu cụ thể... Đừng nói nó phải làm gì, hãy đưa ra tiêu chí thành công rồi quan sát nó tự hoàn thành."

Nguyên tắc "Thực Thi Theo Mục Tiêu" đúc kết ý này: biến yêu cầu mệnh lệnh thành mục tiêu mang tính khai báo, có vòng lặp xác minh.

## Dấu Hiệu Cho Thấy Nó Hoạt Động

Những nguyên tắc này đang phát huy tác dụng nếu bạn thấy:

- **Ít thay đổi thừa hơn trong diff** — Chỉ có các thay đổi thực sự được yêu cầu
- **Ít phải viết lại do quá phức tạp** — Code ngay từ đầu đã gọn
- **Câu hỏi làm rõ xuất hiện trước khi triển khai** — Không phải sau khi đã làm sai
- **PR sạch và gọn** — Không có refactor tiện tay hay "cải thiện" lan man

## Tùy Biến

Các nguyên tắc này được thiết kế để ghép với hướng dẫn riêng của từng project. Hãy thêm chúng vào `CLAUDE.md` hiện có của bạn hoặc tạo file mới.

Với rule riêng theo project, bạn có thể thêm các phần như:

```markdown
## Hướng Dẫn Riêng Của Project

- Dùng TypeScript strict mode
- Mọi API endpoint phải có test
- Tuân theo pattern xử lý lỗi hiện có trong `src/utils/errors.ts`
```

## Ghi Chú Về Đánh Đổi

Các nguyên tắc này ưu tiên **sự cẩn trọng hơn tốc độ**. Với các tác vụ rất nhỏ (sửa typo đơn giản, one-liner quá rõ ràng), hãy dùng phán đoán của bạn, không phải thay đổi nào cũng cần đủ toàn bộ quy trình.

Mục tiêu là giảm các sai sót tốn kém trong công việc không tầm thường, chứ không phải làm chậm các tác vụ đơn giản.

## Giấy Phép

MIT
