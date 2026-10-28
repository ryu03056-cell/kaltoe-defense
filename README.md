# 칼퇴 디펜스

진상 클라이언트·상사·업무를 막고 칼퇴하는 직장인 랜덤 디펜스 게임 (프로토타입).

- 플레이(항상 최신): https://ryu03056-cell.github.io/kaltoe-defense/
- 버전별: `v1.html` ~ `v6.html` · 캐릭터 도감: `dex2.html`(v6) / `dex.html`(v5)
- 모듈: `characters4.js` + `kenney_chars.png`(직원, v6~) · `characters3.js`(직원, v5) · `profiles.js`(캐릭터 설정) · `characters2.js`(직원, v4) · `characters.js`(직원, v2~v3) · `enemies.js`(적·보스) · `sound.js`(효과음·BGM)

## 규칙
- 채용: 랜덤 직업·직급 직원 입사 / 같은 직원 3명 → 합성
- 인턴·대리 합성은 직업 랜덤(이직), 과장부터 직업 유지(승진)
- 인턴 → 대리 → 과장 → 부장 → 대표 (같은 직업 부장 3명 = OO 대표)
- 발령: 골드로 직원 직업 변경 / 드래그: 자리 이동
- 직업별 사거리: 의사 140 · 회계사 170 · 건축가 180 · 변호사 205 · 개발자 250
- 쌓인 업무 100건 = 야근 확정, 10웨이브마다 상사 보스

밸런스 수치는 각 html 상단 `CFG`에서 조정.

## 크레딧
- 직원 캐릭터 원화: [Kenney](https://kenney.nl) "Modular Character Pack" — CC0(퍼블릭 도메인). 직업 소품은 직접 추가.
- `tools/build_kenney_atlas.py`: Kenney 부품 + 소품을 조합해 `kenney_chars.png`(5×5 아틀라스)를 만드는 스크립트
