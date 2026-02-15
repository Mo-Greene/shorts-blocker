# YouTube Shorts Blocker

YouTube에서 Shorts 노출을 줄이고 `/shorts` 진입을 막는 크롬 확장 프로그램입니다.

## Features

- `/shorts`, `/feed/shorts`, 채널 `.../shorts` 경로 접근 시 홈으로 리다이렉트
- 홈 피드/검색/사이드바의 Shorts 관련 UI 제거
- 확장 아이콘 클릭으로 ON/OFF 토글

## Local Install

1. Chrome에서 `chrome://extensions` 접속
2. 우측 상단 `개발자 모드` 활성화
3. `압축해제된 확장 프로그램을 로드합니다.` 클릭
4. 이 프로젝트 폴더 선택 (`manifest.json` 위치)

## Usage

- 확장 아이콘 클릭 시 차단 기능 ON/OFF 전환
- 배지 `ON`: 차단 활성화
- 배지 `OFF`: 차단 비활성화

## Project Files

- `manifest.json`: 확장 설정
- `content.js`: Shorts 차단/DOM 제거 로직
- `background.js`: 토글 상태 저장 및 배지 표시
- `icon/blocker.png`: 확장 아이콘
