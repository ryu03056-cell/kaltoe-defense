# 칼퇴 디펜스 — 그림 목록 파일 만들기 (v13)
# pixel/ · mob/ · bg/ 폴더의 새 그림(.png)을 찾아 각 폴더의 manifest.json 을 다시 씀.
# 게임(assets13.js)은 이 목록에 있는 그림만 불러옴. 그림을 넣거나 뺀 뒤 한 번 실행:
#   python tools/make_manifest.py
# pixel/ 은 v13 이름 규칙({key}_{단계}[_throw|_idle]) 그림만 올림 — 예전 이름(doctor.png, intern.png)은 characters6.js가 따로 읽음
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYS = 'doctor lawyer architect accountant developer police fire civil soldier medlaw planner fintech swat emt'.split()
PIX = re.compile(r'^(%s)_[0-4](_throw|_idle)?$' % '|'.join(KEYS))
for d in ('pixel', 'mob', 'bg'):
    p = os.path.join(ROOT, d)
    os.makedirs(p, exist_ok=True)
    names = sorted(f[:-4] for f in os.listdir(p) if f.lower().endswith('.png'))
    if d == 'pixel':
        names = [n for n in names if PIX.match(n)]
    with open(os.path.join(p, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(names, f, ensure_ascii=False)
    print(d, len(names), names[:8], '...' if len(names) > 8 else '')
