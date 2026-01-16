# Address Converter

어떤 언어로 입력된 주소든 자동으로 언어를 감지하고, 사용자가 선택한 언어로 행정적으로 올바른 주소 포맷으로 변환하는 웹 애플리케이션입니다.

## 주요 기능

1. **주소 입력**: 모든 언어로 주소 입력 가능
2. **자동 언어 감지**: GPT-4 API를 사용한 입력 언어 자동 감지
3. **언어 변환**: 9개 주요 언어 지원 (한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어, 러시아어, 아랍어)
4. **2단계 변환 프로세스**:
   - Step 1: 주소를 의미 기반 JSON 구조로 변환
   - Step 2: 목표 언어 및 국가의 공식 주소 작성 규칙에 따라 재구성
5. **결과 관리**: 변환된 주소 복사 및 텍스트 파일 다운로드
6. **Google Maps 연동**: 변환된 주소를 Google Maps에서 확인

## 기술 스택

- **Frontend**: React 18 + TypeScript + Next.js 14
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4 API
- **Maps**: Google Maps (Geocoding API)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**API 키 발급 방법:**

- **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급
- **Google Maps API Key**: [Google Cloud Console](https://console.cloud.google.com/)에서 Maps JavaScript API 및 Geocoding API 활성화 후 발급

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 사용 방법

1. **주소 입력**: 텍스트 영역에 변환하고자 하는 주소를 입력합니다 (어떤 언어든 가능).
2. **언어 자동 감지**: 주소가 충분히 입력되면 자동으로 언어가 감지되어 표시됩니다.
3. **출력 언어 선택**: 드롭다운에서 변환할 언어를 선택합니다.
4. **주소 변환**: "주소 변환" 버튼을 클릭합니다.
5. **결과 확인**: 변환된 주소가 표시됩니다.
6. **추가 작업**:
   - "복사하기": 변환된 주소를 클립보드에 복사
   - "다운로드 (.txt)": 변환된 주소를 텍스트 파일로 다운로드
   - "지도에서 위치 확인": Google Maps에서 변환된 주소의 위치 확인

## 프로젝트 구조

```
address-converter/
├── app/
│   ├── api/
│   │   ├── detect-language/
│   │   │   └── route.ts          # 언어 감지 API
│   │   └── convert-address/
│   │       └── route.ts          # 주소 변환 API
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── components/
│   ├── AddressConverter.tsx      # 메인 컴포넌트
│   └── AddressConverter.module.css # 컴포넌트 스타일
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## API 엔드포인트

### POST /api/detect-language

입력된 주소의 언어를 감지합니다.

**Request Body:**
```json
{
  "address": "서울특별시 강남구 테헤란로 123"
}
```

**Response:**
```json
{
  "language": "Korean"
}
```

### POST /api/convert-address

주소를 구조화하고 목표 언어로 변환합니다.

**Request Body:**
```json
{
  "address": "서울특별시 강남구 테헤란로 123",
  "targetLanguage": "English"
}
```

**Response:**
```json
{
  "convertedAddress": "123 Teheran-ro, Gangnam-gu, Seoul, South Korea",
  "structuredAddress": {
    "country": "South Korea",
    "state_or_province": "",
    "city": "Seoul",
    "district": "Gangnam-gu",
    "street": "Teheran-ro",
    "building_number": "123",
    "postal_code": ""
  }
}
```

## 주의사항

- OpenAI API 사용 시 비용이 발생할 수 있습니다. 사용량을 모니터링하세요.
- Google Maps API도 사용량에 따라 비용이 발생할 수 있습니다.
- API 키는 절대 공개 저장소에 커밋하지 마세요.

## 라이선스

MIT
