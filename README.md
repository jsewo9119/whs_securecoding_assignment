# Tiny Market

Tiny Market은 보안 코딩 과제용으로 구현한 작은 중고거래 플랫폼입니다. 사용자는 회원가입/로그인 후 상품을 등록하고, 상품에 대해 문의 메시지를 주고받으며, 다른 사용자에게 송금할 수 있습니다. 관리자는 사용자와 상품을 차단하거나 차단 해제할 수 있습니다.

## 주요 기능

- 회원가입 / 로그인
- 비밀번호 Argon2 해싱 저장
- 상품 등록, 목록 조회, 검색, 상세 조회
- 판매자 본인만 상품 수정, 삭제, 상태 변경 가능
- 상품 문의 및 대화 메시지
- 사용자 간 송금
- 마이페이지에서 잔액 및 송금 내역 확인
- 관리자 페이지
  - 사용자 목록 조회
  - 사용자 차단 / 차단 해제
  - 상품 목록 조회
  - 상품 차단 / 차단 해제

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- NextAuth v4
- Zod
- Argon2
- Tailwind CSS / 기본 CSS

## 프로젝트 구조

```txt
src/
├── app/                  # Next.js App Router 페이지/API 라우트
├── generated/prisma/     # Prisma Client 생성 파일
├── lib/                  # DB, 인증, 검증 유틸
├── services/             # 비즈니스 로직
└── types/                # 타입 확장

prisma/
├── schema.prisma
└── migrations/
```

## 실행 전 준비

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정합니다.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME?schema=public"
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

`AUTH_SECRET`은 아래 명령어로 생성할 수 있습니다.

```bash
openssl rand -base64 32
```

주의: `.env` 파일은 Git에 올리면 안 됩니다.

### 3. PostgreSQL 실행

로컬 PostgreSQL을 사용하거나 Docker로 PostgreSQL을 실행합니다.

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

위 값을 사용한다면 `.env`의 `DATABASE_URL` 예시는 다음과 같습니다.

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

DB 내용을 확인하거나 테스트 데이터를 수정하려면 Prisma Studio를 사용할 수 있습니다.

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

## 관리자 계정 설정

회원가입 후 Prisma Studio에서 특정 사용자의 `role`을 `ADMIN`으로 변경하면 관리자 페이지에 접근할 수 있습니다.

1. 개발 서버 실행
2. 회원가입
3. Prisma Studio 실행

```bash
npx prisma studio
```

4. `User` 테이블에서 해당 사용자의 `role`을 `ADMIN`으로 변경
5. `/admin` 접속

## 송금 테스트 방법

현재 별도의 결제/충전 시스템은 구현하지 않았습니다. 송금 테스트를 위해 Prisma Studio에서 테스트 사용자의 `balance` 값을 직접 넣어주세요.

예시:

```txt
student1.balance = 100000
```

그 후 `/transfers/new`에서 다른 사용자에게 송금할 수 있습니다.

## 주요 페이지

```txt
/                       홈
/login                  로그인
/products               상품 목록 / 검색
/products/new           상품 등록
/products/[id]          상품 상세
/conversations          내 대화 목록
/conversations/[id]     대화 상세
/transfers/new          송금
/mypage                 내 정보 / 잔액 / 송금 내역
/admin                  관리자 홈
/admin/users            사용자 관리
/admin/products         상품 관리
```

## 보안 고려사항

### 인증 / 인가

- NextAuth 세션 기반 로그인 사용
- 로그인한 사용자만 상품 등록, 대화, 송금 가능
- 관리자 기능은 `ADMIN` 역할만 접근 가능
- 관리자 페이지뿐 아니라 관리자 API에서도 권한 확인

### 비밀번호 보호

- 비밀번호는 평문 저장하지 않음
- Argon2로 해싱 후 `passwordHash`만 저장
- 로그인 응답과 세션에 `passwordHash`를 포함하지 않음

### 입력값 검증

- Zod로 회원가입, 로그인, 상품, 메시지, 송금 입력값 검증
- 알 수 없는 필드는 `.strict()`로 거부
- 상품 가격, 송금 금액, 메시지 길이 제한

### 권한 검증

- 상품 수정/삭제/상태 변경은 판매자 본인만 가능
- 대화 조회/메시지 전송은 대화 참여자만 가능
- 송금의 보내는 사람은 클라이언트 입력이 아니라 세션에서 결정
- 관리자 기능은 서버에서 `role` 확인

### 차단 기능

- 차단된 사용자는 로그인 불가
- 차단된 상품은 일반 상품 목록과 상세 페이지에서 숨김
- 관리자는 사용자와 상품을 차단/해제 가능

### 송금 정합성

- 송금은 DB transaction으로 처리
- 보내는 사람 차감, 받는 사람 증가, 거래 기록 생성을 하나의 작업으로 처리
- 잔액 부족, 자기 자신 송금, 차단 사용자 송금 방지

## 개발 과정에서 확인한 보안 약점 및 개선

- 비밀번호 평문 저장 위험
  - Argon2 해싱 저장으로 개선
- 클라이언트가 `sellerId`, `senderId` 등을 조작할 위험
  - 서버 세션과 DB 조회값을 기준으로 처리하도록 개선
- 다른 사용자의 상품/대화에 접근할 수 있는 IDOR 위험
  - 상품 소유자, 대화 참여자 확인 로직 추가
- 차단 상품이 일반 사용자에게 노출될 위험
  - 일반 상품 조회에서 `BLOCKED` 상태 제외
- 관리자 버튼 숨김만으로 권한을 처리하는 위험
  - API와 서버 페이지에서 관리자 권한을 다시 확인
- 송금 중 일부 작업만 성공할 위험
  - transaction으로 잔액 변경과 송금 기록 생성을 묶음

## 유지보수 메모

- 새로운 API를 만들 때는 인증/인가 검사를 API 내부에서 반드시 수행합니다.
- 클라이언트 컴포넌트에서는 Prisma Client를 직접 import하지 않습니다.
- 민감정보는 `select`에서 제외하고 필요한 필드만 응답합니다.
- `.env`와 DB 비밀번호는 Git에 포함하지 않습니다.
- 배포 환경에서는 `AUTH_SECRET`, `DATABASE_URL`, `NEXTAUTH_URL`을 별도로 설정해야 합니다.
