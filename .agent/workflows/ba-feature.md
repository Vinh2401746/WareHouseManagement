---
description: /ba-feature - Workflow phân tích nghiệp vụ (Business Analysis) chuyên sâu trước khi triển khai tính năng mới
---

# 🎯 Mục tiêu
Sử dụng workflow này khi cần đóng vai trò là Business Analyst (BA) để mổ xẻ, phân tích một yêu cầu hoặc tính năng mới. Giúp làm rõ scope, luồng nghiệp vụ, các edge cases và dữ liệu trước khi bắt tay vào thiết kế kiến trúc hoặc triển khai code.

# 🚀 Quy trình thực hiện (Dành cho Agent)

Trong quá trình chạy workflow này, Agent KHÔNG ĐƯỢC PHÉP tự ý viết code. Phải ưu tiên đặt câu hỏi và phân tích.

## Bước 1: Khai thác yêu cầu (Requirement Gathering)
- Lắng nghe yêu cầu khái quát từ user.
- Đặt 3-5 câu hỏi trọng tâm để làm rõ:
  - 👥 Tính năng này dành cho ai? (Role/Actor: Admin, Staff, Customer...)
  - 🎯 Giải quyết bài toán gì? Giá trị mang lại là gì?
  - ⏳ Bối cảnh sử dụng là lúc nào?

## Bước 2: Phân tích luồng nghiệp vụ (Business Process Analysis)
- Đề xuất Luồng công việc, sử dụng **ASCII flow diagram** để minh họa.
- Xác định đầu vào (Input) và đầu ra (Output).
- Trình bày cho user xem và **yêu cầu xác nhận**. *Chỉ chuyển sang bước tiếp theo khi user đồng ý với luồng cơ bản.*

## Bước 3: Đào sâu dữ liệu và quy tắc nghiệp vụ (Data & Business Rules)
- Xác định các thực thể (Entities/Models) liên quan trong DB.
- Đề xuất các quy tắc xác thực (Validation Rules).
- Chỉ ra các ràng buộc nghiệp vụ (Business Constraints).
- Liệt kê các trạng thái (States) nếu có (VD: `Pending` -> `Approved` -> `Rejected`).

## Bước 4: Nhận diện Edge Cases và Rủi ro (Risk Management)
- Tự động suy luận tối thiểu 3-5 trường hợp ngoại lệ (Edge Cases).
  - *VD: Mất mạng giữa chừng, thao tác đồng thời (Concurrency), click đúp submit, dữ liệu bị reference ràng buộc...*
- Đánh giá tác động ngược (Regression Impact) đến các tính năng hiện tại của hệ thống.

## Bước 5: Tổng hợp Tài liệu Đặc tả (BRD/PRD)
- Tổng hợp lại toàn bộ thông tin đã thống nhất thành một tài liệu Spec ngắn gọn. 
- Lưu tài liệu vào thư mục `/.agent/docs/feature_[tên_tính_năng]_spec.md` (hoặc theo yêu cầu cụ thể của user).
- **Cấu trúc File tài liệu bắt buộc gồm:** 
  1. Tóm tắt
  2. Actor & Use Cases
  3. Flow Diagram
  4. Business Rules & Validations
  5. Edge Cases & Rủi ro
  6. Acceptance Criteria (Tiêu chí nghiệm thu BDD: Given-When-Then)
