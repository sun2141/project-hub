# 🚀 Project Hub

모든 프로젝트를 한곳에서 관리하는 통합 프로젝트 관리 시스템

## 📋 개요

Project Hub는 여러 개의 프로젝트를 체계적으로 관리할 수 있는 웹 기반 대시보드입니다. 각 프로젝트의 상태, 기술 스택, 파일, 활동 로그를 추적하고 관리할 수 있습니다.

## ✨ 주요 기능

- **프로젝트 관리**: 프로젝트 생성, 수정, 삭제, 상태 관리
- **통계 대시보드**: 전체 프로젝트 통계 및 상태별 분류
- **활동 로그**: 프로젝트별 모든 활동 기록 및 추적
- **파일 메타데이터**: 프로젝트 파일 정보 저장 및 관리
- **GitHub & Vercel 연동**: 각 프로젝트의 저장소 및 배포 링크 관리
- **로컬 경로 추적**: 컴퓨터 내 프로젝트 위치 관리

## 🛠 기술 스택

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL (Cafe24 호스팅)
- **Deployment**: Vercel (Serverless)

## 🚀 시작하기

### 1. Cafe24 MySQL 데이터베이스 설정

1. Cafe24 관리자 페이지 접속
2. 데이터베이스 메뉴 → 새 데이터베이스 생성
3. 데이터베이스 이름: `project_hub`
4. `database/schema.sql` 파일 내용을 SQL 에디터에 복사 후 실행

### 2. 환경 변수 설정

`.env.local` 파일 생성 및 Cafe24 MySQL 정보 입력:

```env
DB_HOST=your-cafe24-mysql-host.cafe24.com
DB_PORT=3306
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=project_hub
```

### 3. 패키지 설치 및 개발 서버 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인

### 4. 데이터베이스 연결 테스트

개발 서버 실행 시 자동으로 데이터베이스 연결을 테스트합니다.
콘솔에서 `✅ Database connected successfully` 메시지를 확인하세요.

## 📁 프로젝트 구조

```
project-hub/
├── app/
│   ├── page.tsx                    # 메인 대시보드
│   ├── api/
│   │   ├── projects/
│   │   │   ├── route.ts            # GET/POST 프로젝트 목록
│   │   │   └── [slug]/route.ts     # GET/PATCH/DELETE 개별 프로젝트
│   │   └── stats/route.ts          # 통계 API
│   └── layout.tsx
├── lib/
│   ├── db.ts                       # MySQL 연결 풀
│   └── projects.ts                 # 프로젝트 CRUD 함수
├── database/
│   └── schema.sql                  # 데이터베이스 스키마
├── .env.local                      # 환경 변수 (git ignored)
├── .env.example                    # 환경 변수 예제
└── README.md
```

## 💾 데이터베이스 스키마

### projects 테이블
- 프로젝트 기본 정보, 상태, 기술 스택, URL 등

### project_files 테이블
- 프로젝트별 파일 메타데이터

### project_logs 테이블
- 프로젝트 활동 로그 (생성, 수정, 배포 등)

## 🌐 배포

### Vercel 배포

1. GitHub에 push
```bash
git add .
git commit -m "Initial commit"
git push
```

2. Vercel에서 프로젝트 import
3. 환경 변수 추가 (Cafe24 MySQL 정보)
4. Deploy

### 환경 변수 (Vercel)

Vercel 대시보드 → Settings → Environment Variables에 추가:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## 📊 사용 방법

### 프로젝트 추가

1. 메인 대시보드에서 "+ 새 프로젝트" 클릭
2. 프로젝트 정보 입력
3. 저장

### 프로젝트 상태 관리

- **Active (운영 중)**: 현재 운영 중인 프로젝트
- **Development (개발 중)**: 개발 진행 중
- **Maintenance (유지보수)**: 유지보수 단계
- **Archived (보관됨)**: 종료되거나 보관된 프로젝트

## 🔧 주요 API 엔드포인트

- `GET /api/projects` - 모든 프로젝트 조회
- `POST /api/projects` - 새 프로젝트 생성
- `GET /api/projects/[slug]` - 특정 프로젝트 조회
- `PATCH /api/projects/[slug]` - 프로젝트 정보 수정
- `DELETE /api/projects/[slug]` - 프로젝트 삭제
- `GET /api/stats` - 프로젝트 통계

## 💰 비용

- **Next.js (Vercel)**: 무료 (Hobby 플랜)
- **MySQL (Cafe24)**: 호스팅 플랜에 포함
- **총 추가 비용**: $0

## 📝 현재 등록된 프로젝트

1. **Health Blog Automation**
   - 매일 자동으로 건강 블로그 포스트 생성
   - 기술: Next.js, Gemini AI, WordPress, Supabase, Inngest

## 🤝 기여

개인 프로젝트 관리 시스템입니다.

## 📄 라이선스

MIT
