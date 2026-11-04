// 칼퇴 디펜스 — 협동 서버(Firebase) 설정
// Firebase 프로젝트: kaltoe-defense (ryu03056@gmail.com) · 실시간 DB 위치: 싱가포르(asia-southeast1)
// 보안 규칙: tools/firebase_rules.json (콘솔 → Realtime Database → 규칙 에 적용됨) · 로그인: 익명(30일 지난 익명 계정 자동 정리)
// 이 값은 비밀번호가 아니라 공개 주소임 (웹 앱이면 누구나 볼 수 있음). 보안은 실시간 DB 규칙으로 막음
// null 로 바꾸면 같은 브라우저 탭끼리만 연결되는 시험 모드
window.KT_FIREBASE={
  apiKey:"AIzaSyCLYoofi4kjS646zHlLJvvPWjUIFC50Qg8",
  authDomain:"kaltoe-defense.firebaseapp.com",
  databaseURL:"https://kaltoe-defense-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"kaltoe-defense",
  storageBucket:"kaltoe-defense.firebasestorage.app",
  messagingSenderId:"104457827414",
  appId:"1:104457827414:web:88cd9e91b28ee0409237f7"
};
