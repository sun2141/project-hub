# Project Hub 설정 가이드

## 📋 준비사항

- [x] Cafe24 유료 계정 (MySQL 사용)
- [ ] Cafe24 MySQL 데이터베이스 생성
- [ ] 환경 변수 설정
- [ ] GitHub Repository 생성
- [ ] Vercel 계정

## 🚀 단계별 설정

### 1단계: Cafe24 MySQL 데이터베이스 설정 (5분)

1. **Cafe24 관리자 페이지 접속**
   - URL: https://www.cafe24.com/
   - 로그인

2. **MySQL 데이터베이스 생성**
   - 호스팅 관리 → 데이터베이스 → MySQL 관리
   - "새 데이터베이스 생성" 클릭
   - 데이터베이스 이름: `project_hub`
   - 문자 집합: `utf8mb4_unicode_ci`

3. **데이터베이스 접속 정보 확인**
   - 호스트: `xxxxx.cafe24.com`
   - 포트: `3306`
   - 사용자: Cafe24에서 제공한 사용자명
   - 비밀번호: 설정한 비밀번호

4. **스키마 실행**
   - SQL 관리 도구 접속 (phpMyAdmin 또는 Cafe24 SQL Editor)
   - `database/schema.sql` 파일 내용 복사
   - SQL 에디터에 붙여넣기 후 실행
   - 성공 메시지 확인:
     - `projects` 테이블 생성 완료
     - `project_files` 테이블 생성 완료
     - `project_logs` 테이블 생성 완료
     - Health Blog Automation 초기 데이터 삽입 완료

### 2단계: 환경 변수 설정 (2분)

1. **`.env.local` 파일 생성**
   ```bash
   cd /Users/sun/project-hub
   cp .env.example .env.local
   ```

2. **Cafe24 MySQL 정보 입력**
   `.env.local` 파일을 열고 다음 정보 입력:
   ```env
   DB_HOST=xxxxx.cafe24.com
   DB_PORT=3306
   DB_USER=your_cafe24_mysql_username
   DB_PASSWORD=your_cafe24_mysql_password
   DB_NAME=project_hub
   ```

### 3단계: 로컬 테스트 (3분)

1. **개발 서버 실행**
   ```bash
   cd /Users/sun/project-hub
   npm run dev
   ```

2. **브라우저에서 확인**
   - URL: http://localhost:3000
   - 로딩 화면 → 대시보드 표시 확인
   - 콘솔에서 `✅ Database connected successfully` 메시지 확인

3. **초기 데이터 확인**
   - "전체 프로젝트: 1" 표시
   - "Health Blog Automation" 프로젝트 카드 표시
   - "최근 활동" 섹션에 초기 로그 표시

### 4단계: GitHub Repository 생성 (3분)

1. **GitHub에 새 Repository 생성**
   - Repository 이름: `project-hub`
   - Private 또는 Public 선택
   - README 및 .gitignore 추가하지 않음 (이미 있음)

2. **원격 저장소 연결 및 푸시**
   ```bash
   cd /Users/sun/project-hub
   git remote add origin https://github.com/YOUR_USERNAME/project-hub.git
   git branch -M main
   git push -u origin main
   ```

### 5단계: Vercel 배포 (5분)

1. **Vercel 로그인**
   - URL: https://vercel.com
   - GitHub 계정으로 로그인

2. **프로젝트 Import**
   - "Add New Project" 클릭
   - `project-hub` Repository 선택
   - "Import" 클릭

3. **환경 변수 추가**
   - Configure Project 화면에서 "Environment Variables" 펼치기
   - 다음 변수 추가:
     - `DB_HOST`: Cafe24 MySQL 호스트
     - `DB_PORT`: `3306`
     - `DB_USER`: Cafe24 MySQL 사용자
     - `DB_PASSWORD`: Cafe24 MySQL 비밀번호
     - `DB_NAME`: `project_hub`

4. **배포 시작**
   - "Deploy" 버튼 클릭
   - 배포 완료까지 1-2분 대기

5. **배포 확인**
   - Vercel이 제공하는 URL 클릭 (예: `project-hub-xxxxx.vercel.app`)
   - 대시보드가 정상적으로 표시되는지 확인

## ✅ 설정 완료 체크리스트

- [ ] Cafe24 MySQL 데이터베이스 생성 완료
- [ ] `database/schema.sql` 실행 완료
- [ ] `.env.local` 파일 설정 완료
- [ ] 로컬 개발 서버 정상 작동 (http://localhost:3000)
- [ ] 데이터베이스 연결 성공 (`✅ Database connected successfully`)
- [ ] Health Blog Automation 프로젝트 표시 확인
- [ ] GitHub Repository 생성 및 푸시 완료
- [ ] Vercel 배포 완료
- [ ] 배포된 URL에서 정상 작동 확인

## 🎯 다음 단계

### 프로젝트 추가하기

1. 대시보드에서 "+ 새 프로젝트" 버튼 클릭
2. 프로젝트 정보 입력:
   - 이름
   - Slug (URL 친화적 이름, 예: `my-awesome-project`)
   - 설명
   - 상태 (Active, Development, Maintenance, Archived)
   - 기술 스택
   - GitHub URL
   - Vercel URL
   - 로컬 경로
3. 저장

### Cafe24 MySQL 관리 팁

**접속 방법**:
1. Cafe24 관리자 → 데이터베이스 → phpMyAdmin
2. 또는 MySQL Workbench 등 클라이언트 사용

**백업 권장**:
- 주기: 주 1회
- Cafe24 자동 백업 기능 활용
- 또는 SQL 덤프 수동 백업

**용량 모니터링**:
- Cafe24 관리자에서 데이터베이스 용량 확인
- 무료 할당량 확인

## 🐛 문제 해결

### 데이터베이스 연결 실패

**증상**: `❌ Database connection failed`

**해결 방법**:
1. `.env.local` 파일의 DB 정보 확인
2. Cafe24에서 MySQL 서비스 활성화 확인
3. 방화벽 설정 확인
4. Cafe24 MySQL 포트 `3306` 열림 확인

### Vercel 배포 후 데이터베이스 연결 실패

**증상**: 배포는 성공했지만 데이터를 불러오지 못함

**해결 방법**:
1. Vercel → Project → Settings → Environment Variables
2. 모든 DB 환경 변수가 정확한지 확인
3. 환경 변수 수정 후 "Redeploy" 필요

### Health Blog Automation 프로젝트가 표시되지 않음

**증상**: 대시보드가 비어있음

**해결 방법**:
1. Cafe24 MySQL에 접속
2. `database/schema.sql`의 INSERT 문 다시 실행
3. 또는 대시보드에서 수동으로 프로젝트 추가

## 📞 도움말

프로젝트 관련 문제가 있으면:
1. GitHub Repository의 Issues 확인
2. `README.md` 참조
3. Cafe24 고객 지원 (MySQL 관련)

## 🎉 완료!

Project Hub가 정상적으로 설정되었습니다!
이제 모든 프로젝트를 한곳에서 관리할 수 있습니다.
