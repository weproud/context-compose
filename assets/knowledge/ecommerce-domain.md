# 이커머스 어드민 도메인 지식

이 문서는 AI가 이커머스 어드민 프로젝트를 이해하는 데 필요한 핵심 용어와 비즈니스 규칙을 정의합니다.

## 1. 용어 사전 (Glossary)

- **MRR (Monthly Recurring Revenue)**: 월간 반복 매출. 구독 기반 상품의 월별 총 수익.
- **Churn Rate**: 고객 이탈률. 특정 기간 동안 서비스를 해지한 고객의 비율.
- **LTV (Lifetime Value)**: 고객 생애 가치. 한 명의 고객이 서비스 사용 기간 동안 발생시킬 것으로 예상되는 총 수익.
- **SKU (Stock Keeping Unit)**: 재고 관리 코드. 개별 상품을 식별하는 고유 단위.

## 2. 핵심 비즈니스 규칙 (Core Business Rules)

- **주문 상태 (Order Status)**: 모든 주문은 다음 상태 중 하나를 가집니다.
  - `PENDING`: 결제 대기 중
  - `PROCESSING`: 결제 완료, 배송 준비 중
  - `SHIPPED`: 배송 중
  - `DELIVERED`: 배송 완료
  - `CANCELLED`: 주문 취소
- **사용자 권한 (User Roles)**:
  - `Admin`: 모든 데이터에 접근 및 수정 가능. 사용자 계정 관리 권한 포함.
  - `Manager`: 주문 및 상품 데이터에 접근 및 수정 가능. 사용자 계정 관리는 불가능.
  - `Viewer`: 모든 데이터를 읽기 전용으로만 접근 가능.

## 3. API 응답 정책 (API Response Policy)

- `GET /orders/{id}`: 주문 정보를 조회합니다.
  - `Admin` 또는 `Manager`만 접근 가능합니다. `Viewer`가 요청 시 `403 Forbidden`을 반환해야 합니다.
- `DELETE /products/{sku}`: 상품을 삭제합니다.
  - `Admin`만 가능합니다. `Manager`가 요청 시 `403 Forbidden`을 반환해야 합니다.
