# 칼퇴 디펜스 — 그림 목록 파일 만들기 (v14)
# pixel/ · mob/ · bg/ 폴더의 그림(.png)을 찾아 목록을 다시 씀. 그림을 넣거나 빼거나 바꾼 뒤 한 번 실행:
#   python tools/make_manifest.py
# 만드는 파일
#   {폴더}/manifest.json : {"files":[이름...], "v":{이름: 해시}}  — 게임(assets13.js)이 웹에서 읽음.
#                          해시는 그림 내용이 바뀌면 달라져서, 브라우저가 옛 그림을 캐시에서 꺼내 쓰지 않게 해 줌
#   assets_list.js        : 같은 목록을 스크립트로 — index.html 을 파일로 바로 열었을 때(file://) 쓰임
# pixel/ 은 v13 이름 규칙({key}_{단계}[_throw|_idle]) 그림만 올림
import hashlib, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYS = 'doctor lawyer architect accountant developer police fire civil soldier medlaw planner fintech swat emt'.split()
PIX = re.compile(r'^(%s)_[0-4](_throw|_idle)?$' % '|'.join(KEYS))
NAME = re.compile(r'^[a-z0-9_]+$')   # 웹 주소에 그대로 쓸 수 있는 이름만 (소문자·숫자·밑줄)
out = {}
for d in ('pixel', 'mob', 'bg'):
    p = os.path.join(ROOT, d)
    os.makedirs(p, exist_ok=True)
    files, ver, skipped = [], {}, []
    for f in sorted(os.listdir(p)):
        if not f.endswith('.png'):       # .PNG 처럼 대문자 확장자는 웹에서 못 찾으므로 올리지 않음
            if f.lower().endswith('.png'): skipped.append(f)
            continue
        n = f[:-4]
        if not NAME.match(n) or (d == 'pixel' and not PIX.match(n)):
            if d != 'pixel': skipped.append(f)
            continue
        files.append(n)
        with open(os.path.join(p, f), 'rb') as fh:
            ver[n] = hashlib.md5(fh.read()).hexdigest()[:8]
    out[d] = {'files': files, 'v': ver}
    with open(os.path.join(p, 'manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump(out[d], fh, ensure_ascii=False, separators=(',', ':'))
    print(d, len(files), '개', ('· 건너뜀(이름 규칙 위반): ' + ', '.join(skipped)) if skipped else '')
with open(os.path.join(ROOT, 'assets_list.js'), 'w', encoding='utf-8') as fh:
    fh.write('// 자동 생성 — tools/make_manifest.py 를 실행하면 다시 만들어짐. 직접 고치지 마세요.\n')
    fh.write('window.KT_ASSET_LIST=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('assets_list.js 갱신')
