# Tiny Market

Tiny Market은 보안 코딩 과제용으로 구현한 작은 중고거래 플랫폼입니다.  
단순히 상품을 등록하고 조회하는 기능을 넘어, 회원 인증, 권한 검증, 안전한 이미지 업로드, 대화/흥정 기록, 구매 확정 기반 정산 흐름, 관리자 검토 기능을 포함합니다.

## 주요 기능

- 회원가입 / 로그인 / 로그아웃
- 비밀번호 Argon2 해싱 저장
- 상품 등록, 검색, 상세 조회, 수정, 삭제
- 상품 이미지 파일 업로드
- 판매자 본인만 상품 관리 가능
- 상품 상태 관리
  - 판매중
  - 예약
  - 판매 완료
  - 차단
- 구매자가 상품을 구매하면 상품이 예약 상태로 변경되고 금액이 보류됨
- 구매자가 구매 확정하면 판매자 지갑으로 금액 정산
- 구매 취소 요청 시 판매자 승인 후 취소 처리
- 상품 문의 DM
- 흥정 가능 상품에 가격 제안 전송
- 판매자가 흥정 제안을 수락하면 상품 가격 변경
- 사용자 지갑 충전 요청
- 관리자의 충전 요청 승인 / 거절
- 관리자 페이지
  - 사용자 관리
  - 상품 관리
  - 충전 요청 관리

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- NextAuth v4
- Zod
- Argon2
- CSS

## 프로젝트 구조

```txt
src/
├── app/                  # Next.js App Router 페이지와 API 라우트
├── generated/prisma/     # Prisma Client 생성 파일
├── lib/                  # DB, 인증, 업로드, 검증 유틸
├── services/             # 구매, 송금 등 비즈니스 로직
└── types/                # NextAuth 타입 확장

prisma/
├── schema.prisma         # DB 모델 정의
└── migrations/           # Prisma migration 파일

public/
└── uploads/products/     # 상품 이미지 업로드 저장 위치, Git 제외
```

## 실행 전 준비

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 `.env.example`을 참고해 값을 설정합니다.

```bash
cp .env.example .env
```

필수 환경 변수:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME?schema=public"
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

`AUTH_SECRET`은 아래 명령어로 생성할 수 있습니다.

```bash
openssl rand -base64 32
```

주의: `.env` 파일에는 DB 비밀번호와 인증 시크릿이 들어가므로 Git에 올리면 안 됩니다.

### 3. PostgreSQL 준비

로컬 PostgreSQL을 사용하거나 Docker로 PostgreSQL을 실행할 수 있습니다.

Docker 예시:

```bash
docker run --name tiny-market-postgres \
  -e POSTGRES_USER=tiny_market_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=tiny_market \
  -p 127.0.0.1:5432:5432 \
  -v tiny-market-postgres-data:/var/lib/postgresql/data \
  -d postgres:17-alpine
```

위 값을 사용한다면 `.env`의 `DATABASE_URL`은 다음과 같이 설정할 수 있습니다.

```env
DATABASE_URL="postgresql://tiny_market_user:your_password@localhost:5432/tiny_market?schema=public"
```

## 데이터베이스 설정

Prisma migration을 적용합니다.

```bash
npx prisma migrate dev
```

Prisma Client를 생성합니다.

```bash
npx prisma generate
```

DB 데이터를 확인하거나 테스트 계정을 수정하려면 Prisma Studio를 사용할 수 있습니다.

```bash
npx prisma studio
```

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```txt
http://localhost:3000
```

## 빌드 및 검사

```bash
npm run lint
npm run build
```

## 주요 페이지

```txt
/                       홈
/signup                 회원가입
/login                  로그인
/products               상품 목록 / 검색
/products/new           상품 등록
/products/[id]          상품 상세
/products/[id]/edit     상품 수정
/products/[id]/checkout 상품 구매 확인
/conversations          내 대화 목록
/conversations/[id]     대화 상세
/wallet/charge          지갑 충전 요청
/transfers/new          사용자 간 송금
/mypage                 내 정보 / 지갑 / 구매 / 판매 내역
/admin                  관리자 홈
/admin/users            사용자 관리
/admin/products         상품 관리
/admin/charges          충전 요청 관리
```

## 관리자 계정 설정

초기에는 일반 회원가입으로 생성되는 사용자가 `USER` 역할을 가집니다.  
관리자 페이지를 테스트하려면 Prisma Studio에서 특정 사용자의 `role`을 `ADMIN`으로 변경합니다.

```bash
npx prisma studio
```

1. 회원가입으로 테스트 계정 생성
2. Prisma Studio 실행
3. `User` 테이블에서 해당 사용자의 `role`을 `ADMIN`으로 변경
4. `/admin` 접속

## 지갑 / 구매 테스트 흐름

1. 일반 사용자로 회원가입
2. `/wallet/charge`에서 충전 요청 생성
3. 관리자 계정으로 로그인
4. `/admin/charges`에서 충전 요청 승인
5. 구매자 계정으로 상품 구매
6. 상품은 `예약` 상태가 되고 구매 금액은 보류
7. 구매자가 마이페이지에서 구매 확정
8. 판매자 지갑으로 금액 정산

취소 흐름:

1. 구매자가 구매 취소 요청
2. 판매자가 취소 요청 승인
3. 구매자에게 금액 환불
4. 상품은 다시 판매중 상태로 변경

## 이미지 업로드 정책

상품 등록/수정 시 이미지는 URL 입력이 아니라 로컬 파일 업로드 방식으로 처리합니다.

- 허용 확장자: `png`, `jpg`, `jpeg`
- 허용 MIME 타입: `image/png`, `image/jpeg`
- 파일 시그니처 검사 수행
- 최대 파일 크기 제한
- 업로드 파일명은 원본 파일명을 그대로 쓰지 않고 UUID 기반으로 생성
- 업로드 파일은 `public/uploads/products/`에 저장
- 업로드 파일 디렉터리는 Git에 포함하지 않음

## 보안 고려사항

### 인증 / 인가

- NextAuth 세션 기반 로그인 사용
- 로그인한 사용자만 상품 등록, 대화, 구매, 충전 요청 가능
- 관리자 기능은 `ADMIN` 역할만 접근 가능
- 관리자 페이지뿐 아니라 관리자 API에서도 권한 재확인
- 판매자 본인만 상품 수정, 삭제, 상태 변경 가능
- 대화 조회와 메시지 전송은 대화 참여자만 가능

### 비밀번호 보호

- 비밀번호를 평문 저장하지 않음
- Argon2로 해싱 후 `passwordHash`만 저장
- 로그인 응답과 세션에 `passwordHash`를 포함하지 않음

### 입력값 검증

- Zod를 사용해 회원가입, 로그인, 상품, 메시지, 송금, 충전 요청 입력값 검증
- 알 수 없는 필드는 `.strict()`로 거부
- 상품 가격, 메시지 길이, 송금 금액, 충전 금액 제한
- 클라이언트에서 전달된 `sellerId`, `senderId` 등을 신뢰하지 않고 서버 세션과 DB 조회값 기준으로 처리

### 안전한 이미지 업로드

- 확장자만 믿지 않고 MIME 타입과 파일 시그니처를 함께 확인
- 허용된 이미지 형식만 저장
- 파일 크기 제한으로 과도한 업로드 방지
- 랜덤 파일명 사용으로 경로 추측과 파일명 충돌 가능성 감소

### 거래 정합성

- 구매, 구매 확정, 구매 취소, 송금, 충전 승인 등 금액 변경 로직은 DB transaction으로 처리
- 구매 금액은 바로 판매자에게 지급하지 않고 구매 확정 전까지 보류
- 잔액 부족, 자기 상품 구매, 차단 상품 구매 방지
- 취소는 구매자 요청과 판매자 승인 절차를 거치도록 구현

### 차단 및 관리자 대응

- 차단된 사용자는 로그인 불가
- 차단된 상품은 일반 상품 목록과 상세 페이지에서 숨김
- 관리자는 사용자, 상품, 충전 요청을 확인하고 조치 가능

## 개발 과정에서 확인한 보안 약점 및 개선

- 비밀번호 평문 저장 위험
  - Argon2 해싱 저장으로 개선
- 클라이언트가 `sellerId`, `senderId`, `buyerId`를 조작할 위험
  - 서버 세션과 DB 조회값 기준으로 처리하도록 개선
- 다른 사용자의 상품/대화/구매 내역에 접근할 수 있는 IDOR 위험
  - 상품 소유자, 대화 참여자, 구매자/판매자 확인 로직 추가
- 이미지 업로드 시 악성 파일이 저장될 위험
  - MIME 타입, 확장자, 파일 시그니처, 크기 제한 검증 추가
- 차단 상품이 일반 사용자에게 노출될 위험
  - 일반 상품 조회에서 `BLOCKED` 상태 제외
- 관리자 버튼 숨김만으로 권한을 처리하는 위험
  - API와 서버 페이지에서 관리자 권한을 다시 확인
- 금액 처리 중 일부 작업만 성공할 위험
  - transaction으로 잔액 변경과 거래 기록 생성을 묶음

## 유지보수 메모

- 새로운 API를 만들 때는 인증/인가 검사를 API 내부에서 반드시 수행합니다.
- 클라이언트 컴포넌트에서는 Prisma Client를 직접 import하지 않습니다.
- 민감정보는 응답에 포함하지 않고 필요한 필드만 `select`합니다.
- `.env`, DB 비밀번호, 인증 시크릿은 Git에 포함하지 않습니다.
- 배포 환경에서는 `AUTH_SECRET`, `DATABASE_URL`, `NEXTAUTH_URL`을 별도로 설정해야 합니다.
