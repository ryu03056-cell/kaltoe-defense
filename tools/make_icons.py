# 칼퇴 디펜스 — 앱 아이콘 만들기 (v14.4)
# 게임 그림(pixel/architect_4.png)으로 앱 아이콘을 만들어 icons/ 폴더에 저장. 그림을 바꾼 뒤 한 번 실행:
#   python tools/make_icons.py
# 만드는 파일
#   icons/icon-192.png · icons/icon-512.png     : 보통 아이콘 (안드로이드·PC)
#   icons/maskable-512.png                      : 안드로이드가 동그라미·둥근 네모로 잘라 쓰는 아이콘 (그림을 안쪽으로 줄임)
#   icons/apple-touch-icon.png (180)            : 아이폰 홈 화면
#   icons/favicon-32.png                        : 브라우저 탭
# 글꼴: Noto Sans CJK(없으면 글자 없이 그림만)
import math, os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'icons')
os.makedirs(OUT, exist_ok=True)
FONTS = ['/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc', 'C:/Windows/Fonts/malgunbd.ttf', '/System/Library/Fonts/AppleSDGothicNeo.ttc']
FONT = next((f for f in FONTS if os.path.exists(f)), None)
HERO = Image.open(os.path.join(ROOT, 'pixel', 'architect_4.png')).convert('RGBA')


def base(S):
    """어두운 배경 + 금빛 햇살"""
    im = Image.new('RGBA', (S, S))
    d = ImageDraw.Draw(im)
    for y in range(S):  # 위→아래 그라데이션
        t = y / S
        d.line([(0, y), (S, y)], fill=(int(40 - 22 * t), int(36 - 20 * t), int(30 - 12 * t), 255))
    rays = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    r = ImageDraw.Draw(rays)
    cx, cy, R = S / 2, S * 0.46, S * 0.9
    for k in range(12):
        a = k * math.pi / 6
        p = [(cx, cy), (cx + R * math.cos(a - 0.13), cy + R * math.sin(a - 0.13)), (cx + R * math.cos(a + 0.13), cy + R * math.sin(a + 0.13))]
        r.polygon(p, fill=(255, 190, 70, 34))
    im.alpha_composite(rays)
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    for i in range(24, 0, -1):  # 가운데 은은한 빛
        rr = S * 0.36 * i / 24
        g.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(255, 196, 80, int(5 + 3 * (24 - i) / 24 * 4)))
    im.alpha_composite(glow)
    return im


def draw(S, inner=1.0, text=True):
    """inner: 그림이 차지하는 비율 (maskable 은 0.72 로 안쪽에 모음)"""
    im = base(S)
    c = S * inner
    off = (S - c) / 2
    hs = int(c * (0.68 if text else 0.86))
    hero = HERO.resize((hs, hs), Image.NEAREST)
    hy = int(off + c * (0.01 if text else 0.06))
    im.alpha_composite(hero, (int((S - hs) / 2), hy))
    if text and FONT:
        d = ImageDraw.Draw(im)
        fs = int(c * 0.23)
        f = ImageFont.truetype(FONT, fs)
        d.text((S / 2, off + c * 0.93), '칼퇴', font=f, anchor='ms', fill=(255, 176, 32, 255), stroke_width=max(2, int(fs * 0.09)), stroke_fill=(20, 14, 6, 255))
    return im


def save(im, name):
    im.convert('RGB').save(os.path.join(OUT, name), optimize=True)
    print('icons/' + name, im.size[0])


big = draw(512)
save(big, 'icon-512.png')
save(big.resize((192, 192), Image.LANCZOS), 'icon-192.png')
save(draw(512, inner=0.72), 'maskable-512.png')
save(big.resize((180, 180), Image.LANCZOS), 'apple-touch-icon.png')
save(draw(128, text=False).resize((32, 32), Image.LANCZOS), 'favicon-32.png')
