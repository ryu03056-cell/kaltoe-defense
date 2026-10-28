# Kenney Modular Character Pack(CC0) 부품 + 직업 소품을 조합해 25종(직업5 × 직급5) 스프라이트 아틀라스 생성
import sys, os, json
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
K = sys.argv[1]; OUT = sys.argv[2]
P = lambda *a: os.path.join(K, 'PNG', *a)
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
def L(p): return Image.open(p).convert('RGBA')
def paste(c, im, cx, cy): c.alpha_composite(im, (int(round(cx - im.size[0] / 2)), int(round(cy - im.size[1] / 2))))
def flip(im): return im.transpose(Image.FLIP_LEFT_RIGHT)
def darken(im, a):
    if not a: return im
    blk = Image.new('RGBA', im.size, (10, 10, 20, int(255 * a))); out = im.copy()
    out.alpha_composite(Image.composite(blk, Image.new('RGBA', im.size, (0, 0, 0, 0)), im.split()[3]))
    return out
def arm_file(col, kind):
    return P('Shirts', col, f'armWhite_{kind}.png') if col == 'White' else P('Shirts', col, f'{col.lower()}Arm_{kind}.png')
def hexc(h, a=255):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

W, H = 520, 760; X = 260; TY = 330; HY = TY - 87 - 70
GOLD = '#f4c542'; GRADECOL = ['#a3abb9', '#4aa3ff', '#b875ff', '#ff9a2e', '#ff4d8d']
JOBCOL = ['#7fe0ff', '#ffe066', '#ffa94d', '#69db7c', '#b197fc']
HAND_L = (X - 134, TY + 110); HAND_R = (X + 134, TY + 110)

def compose(o, hooks):
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); tint = o.get('tint', 1)
    sk = lambda part: L(P('Skin', f'Tint {tint}', f'tint{tint}_{part}.png'))
    for f in hooks.get('back', []): f(c)
    pc = o['pants']; pn = pc.replace(' ', '')
    leg = sk('leg'); pl = L(P('Pants', pc, f'pants{pn}_long.png'))
    LX = 34; LY = TY + 87 + 80
    for s in (-1, 1):
        paste(c, leg if s > 0 else flip(leg), X + s * LX, LY)
        paste(c, pl if s > 0 else flip(pl), X + s * (LX + 6), LY - 2)
    shoe = L(P('Shoes', o['shoe'][0], o['shoe'][1] + '.png'))
    for s in (-1, 1): paste(c, shoe if s > 0 else flip(shoe), X + s * (LX + 30), LY + 86)
    paste(c, L(P('Pants', pc, f'pants{pn}1.png')), X, TY + 90)
    paste(c, sk('neck'), X, TY - 80)
    for f in hooks.get('behind_torso', []): f(c)
    arm = sk('arm'); sl = darken(L(arm_file(o.get('sleeve', o['shirtc']), 'long')), o.get('dark', 0)); hand = sk('hand')
    for s in (-1, 1):
        a = arm.rotate(-64, expand=True, resample=Image.BICUBIC); b = sl.rotate(-64, expand=True, resample=Image.BICUBIC)
        if s < 0: a, b = flip(a), flip(b)
        ax = X + s * 104; ay = TY + 30
        paste(c, a, ax, ay); paste(c, b, ax - s * 4, ay - 6)
    for f in hooks.get('arms', []): f(c)
    for s in (-1, 1): paste(c, hand if s > 0 else flip(hand), X + s * 134, TY + 110)
    shirt = darken(L(P('Shirts', o['shirtc'], f'{o["shirtc"].lower()}Shirt{o["shirt"]}.png')), o.get('dark', 0))
    paste(c, shirt, X, TY)
    for f in hooks.get('torso', []): f(c)
    for f in hooks.get('behind_head', []): f(c)
    paste(c, sk('head'), X, HY)
    # 얼굴 부품
    fc = o['face']
    for s in (-1, 1):
        br = L(P('Face', 'Eyebrows', fc['brow'] + '.png'))
        if s < 0: br = flip(br)
        paste(c, br, X + s * 31, HY - 24 + fc.get('browdy', 0))
        paste(c, L(P('Face', 'Eyes', fc['eye'] + '.png')), X + s * 30, HY + 8)
    paste(c, L(P('Face', 'Nose', f'Tint {tint}', f'tint{tint}Nose1.png')), X, HY + 28)
    paste(c, L(P('Face', 'Mouth', fc['mouth'] + '.png')), X, HY + 54)
    for f in hooks.get('face', []): f(c)
    hr = o.get('hair')
    if hr:
        hi = L(P('Hair', hr[0], hr[1] + '.png'))
        c.alpha_composite(hi, (int(X - hi.size[0] / 2 + o.get('hairx', 0)), int(HY - 84 - 10 + o.get('hairdy', 0))))
    for f in hooks.get('head', []): f(c)
    for f in hooks.get('front', []): f(c)
    return c

# ---------- 소품 그리기 도우미 ----------
def layer(fn):
    def run(c):
        lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); fn(ImageDraw.Draw(lay), lay); c.alpha_composite(lay)
    return run
def rrect(d, box, r, fill, outline=None, w=0): d.rounded_rectangle(box, r, fill=fill, outline=outline, width=w)
def star(d, cx, cy, r, fill):
    import math
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5; q = r if i % 2 == 0 else r * 0.45
        pts.append((cx + math.cos(a) * q, cy + math.sin(a) * q))
    d.polygon(pts, fill=fill)
def badge(g):
    def f(d, lay):
        if 1 <= g <= 3:
            d.ellipse((X - 52, TY - 58, X - 36, TY - 42), fill=GRADECOL[g], outline=(255, 255, 255, 200), width=2)
        if g == 3: rrect(d, (X + 30, TY - 40, X + 60, TY - 28), 3, GOLD)
        if g == 4: star(d, X - 44, TY - 48, 14, GOLD)
    return layer(f)
def lanyard(col):
    def f(d, lay):
        d.line([(X - 28, TY - 84), (X, TY - 20), (X + 28, TY - 84)], fill=col, width=7)
        rrect(d, (X - 22, TY - 24, X + 22, TY + 30), 5, '#ffffff'); d.rectangle((X - 22, TY - 24, X + 22, TY - 10), fill=col)
        rrect(d, (X - 16, TY - 4, X - 2, TY + 14), 2, '#c5cad3'); d.rectangle((X + 2, TY - 2, X + 16, TY + 3), fill='#c5cad3'); d.rectangle((X + 2, TY + 8, X + 13, TY + 13), fill='#c5cad3')
    return layer(f)
def sweat():
    return layer(lambda d, lay: d.polygon([(X + 66, HY - 40), (X + 76, HY - 18), (X + 66, HY - 10), (X + 56, HY - 18)], fill=(140, 200, 255, 235)))
def glasses_round(col='#151515'):
    def f(d, lay):
        for s in (-1, 1): d.ellipse((X + s * 30 - 19, HY + 8 - 19, X + s * 30 + 19, HY + 8 + 19), outline=col, width=5)
        d.line([(X - 11, HY + 6), (X + 11, HY + 6)], fill=col, width=5)
    return layer(f)
def glasses_square(col='#333333'):
    def f(d, lay):
        for s in (-1, 1): d.rounded_rectangle((X + s * 30 - 20, HY - 5, X + s * 30 + 20, HY + 20), 5, outline=col, width=5)
        d.line([(X - 10, HY + 6), (X + 10, HY + 6)], fill=col, width=5)
    return layer(f)
def sunglasses():
    def f(d, lay):
        for s in (-1, 1): d.rounded_rectangle((X + s * 30 - 22, HY - 6, X + s * 30 + 22, HY + 22), 7, fill='#0b0b0f')
        d.line([(X - 10, HY + 4), (X + 10, HY + 4)], fill='#0b0b0f', width=6)
        for s in (-1, 1): d.polygon([(X + s * 30 - 14, HY - 2), (X + s * 30 - 4, HY - 2), (X + s * 30 - 12, HY + 12)], fill=(255, 255, 255, 110))
    return layer(f)

# 의사
def coat(g):
    def f(d, lay):
        trim = GOLD if g >= 4 else '#c8d0dc'
        for s in (-1, 1):
            pts = [(X + s * 4, TY - 86), (X + s * 78, TY - 70), (X + s * 86, TY + 200), (X + s * 22, TY + 200)]
            d.polygon(pts, fill='#ffffff'); d.line(pts + [pts[0]], fill=(0, 0, 0, 45), width=3)
            d.polygon([(X + s * 6, TY - 84), (X + s * 40, TY - 40), (X + s * 22, TY + 10)], fill='#e3e8f0')
            d.line([(X + s * 22, TY + 10), (X + s * 22, TY + 200)], fill=trim, width=4)
        rrect(d, (X - 72, TY + 10, X - 36, TY + 44), 4, None, '#c8d0dc', 3)
        d.rectangle((X - 66, TY - 4, X - 62, TY + 22), fill='#e03131'); d.rectangle((X - 57, TY - 6, X - 53, TY + 22), fill='#3b5bdb')
        rrect(d, (X + 34, TY - 52, X + 70, TY - 38), 3, GOLD if g >= 4 else '#e9edf3', '#c8d0dc', 2)
        for k in range(3): d.ellipse((X + 26 - 5, TY + 60 + k * 36 - 5, X + 26 + 5, TY + 60 + k * 36 + 5), fill=trim)
        if g >= 3: d.line([(X - 86, TY + 196), (X - 22, TY + 196)], fill=GOLD if g >= 4 else '#5aa9e6', width=7); d.line([(X + 22, TY + 196), (X + 86, TY + 196)], fill=GOLD if g >= 4 else '#5aa9e6', width=7)
    return layer(f)
def stethoscope(g):
    def f(d, lay):
        col = GOLD if g >= 4 else '#7d8799'
        d.arc((X - 40, TY - 120, X + 40, TY + 20), 20, 160, fill=col, width=8)
        d.line([(X - 37, TY - 75), (X - 40, TY - 86)], fill=col, width=8); d.line([(X + 37, TY - 75), (X + 40, TY - 86)], fill=col, width=8)
        d.ellipse((X - 13, TY + 12, X + 13, TY + 38), fill=col, outline=(0, 0, 0, 60), width=3); d.ellipse((X - 6, TY + 19, X + 1, TY + 26), fill=(255, 255, 255, 160))
    return layer(f)
def head_mirror(g):
    def f(d, lay):
        d.arc((X - 88, HY - 86, X + 88, HY + 60), 200, 340, fill='#444444', width=7)
        d.ellipse((X - 28, HY - 104, X + 28, HY - 48), fill='#e3eaf2', outline=GOLD if g >= 4 else '#8a94a6', width=7)
        d.ellipse((X - 16, HY - 94, X - 2, HY - 80), fill='#ffffff'); d.ellipse((X - 6, HY - 82, X + 6, HY - 70), fill='#8a94a6')
    return layer(f)
def clipboard(g):
    def f(d, lay):
        x, y = HAND_R
        rrect(d, (x - 32, y - 70, x + 30, y + 10), 6, '#b98b5a'); rrect(d, (x - 26, y - 62, x + 24, y + 4), 3, '#ffffff')
        rrect(d, (x - 12, y - 76, x + 10, y - 62), 4, GOLD if g >= 4 else '#8a94a6')
        d.rectangle((x - 6, y - 50, x + 4, y - 22), fill='#e03131'); d.rectangle((x - 15, y - 41, x + 13, y - 31), fill='#e03131')
        for k in range(2): d.rectangle((x - 20, y - 14 + k * 8, x + 18 - k * 12, y - 10 + k * 8), fill='#ced4da')
    return layer(f)
# 변호사
def blouse(g):
    def f(d, lay):
        d.polygon([(X - 30, TY - 84), (X + 30, TY - 84), (X, TY - 18)], fill='#ffffff')
        rib = GOLD if g >= 4 else '#c92a2a'
        d.polygon([(X, TY - 70), (X - 24, TY - 84), (X - 24, TY - 56)], fill=rib); d.polygon([(X, TY - 70), (X + 24, TY - 84), (X + 24, TY - 56)], fill=rib); d.ellipse((X - 7, TY - 77, X + 7, TY - 63), fill=rib)
        d.polygon([(X - 64, TY - 46), (X - 40, TY - 46), (X - 52, TY - 62)], fill='#ffffff')
        for k in range(2): d.ellipse((X - 5, TY + 20 + k * 26 - 5, X + 5, TY + 20 + k * 26 + 5), fill=GOLD if g >= 4 else '#c9a227')
        if g >= 2: d.ellipse((X + 34, TY - 54, X + 54, TY - 34), fill=GOLD, outline='#b8860b', width=3)
    return layer(f)
def earrings(g):
    def f(d, lay):
        for s in (-1, 1):
            d.ellipse((X + s * 84 - 7, HY + 30, X + s * 84 + 7, HY + 44), fill=GOLD)
            if g >= 3: d.ellipse((X + s * 84 - 5, HY + 46, X + s * 84 + 5, HY + 56), fill='#ffffff')
    return layer(f)
def briefcase(g):
    def f(d, lay):
        x, y = HAND_R
        d.arc((x - 18, y - 22, x + 18, y + 14), 180, 360, fill=GOLD if g >= 4 else '#5a3418', width=7)
        rrect(d, (x - 44, y - 2, x + 44, y + 62), 8, '#1c1c1c' if g >= 4 else '#7a4b2a', (0, 0, 0, 80), 3)
        d.line([(x - 44, y + 22), (x + 44, y + 22)], fill=(0, 0, 0, 70), width=3); rrect(d, (x - 9, y + 14, x + 9, y + 30), 3, GOLD if g >= 4 else '#c9a227')
    return layer(f)
def gavel(g):
    def f(d, lay):
        x, y = HAND_L; hc = GOLD if g >= 4 else '#6b3f1e'
        d.line([(x + 6, y + 6), (x - 30, y - 70)], fill='#8b5a2b', width=11)
        pts = [(x - 70, y - 82), (x - 18, y - 108), (x + 2, y - 70), (x - 50, y - 44)]
        d.polygon(pts, fill=hc); d.line(pts + [pts[0]], fill=(0, 0, 0, 90), width=3)
    return layer(f)
# 건축가
def turtleneck():
    return layer(lambda d, lay: rrect(d, (X - 40, TY - 98, X + 40, TY - 70), 10, '#2b3a4c', (0, 0, 0, 60), 2))
def vest(g):
    def f(d, lay):
        vc = '#ffb000' if g >= 4 else '#ff8c1a'; st = GOLD if g >= 4 else '#e9eef4'
        for s in (-1, 1):
            d.polygon([(X + s * 18, TY - 82), (X + s * 70, TY - 74), (X + s * 74, TY + 86), (X + s * 14, TY + 86)], fill=vc)
            for yy in (TY + 4, TY + 44):
                d.polygon([(X + s * 15, yy), (X + s * 73, yy), (X + s * 73, yy + 13), (X + s * 15, yy + 13)], fill=st)
        rrect(d, (X - 66, TY - 56, X - 34, TY - 30), 3, '#ffffff'); d.rectangle((X - 66, TY - 56, X - 34, TY - 48), fill='#3b7dd8')
    return layer(f)
def helmet(g):
    def f(d, lay):
        col = '#f5c518' if g == 2 else '#f6f6f6'; brim = '#d9ab0b' if g == 2 else '#d5d5d5'
        d.pieslice((X - 96, HY - 128, X + 96, HY + 40), 180, 360, fill=col, outline=(0, 0, 0, 60), width=3)
        d.rectangle((X - 10, HY - 128, X + 10, HY - 44), fill=GOLD if g >= 4 else (0, 0, 0, 30))
        rrect(d, (X - 110, HY - 52, X + 110, HY - 32), 9, brim)
        d.ellipse((X - 62, HY - 106, X - 22, HY - 86), fill=(255, 255, 255, 120))
        fnt = ImageFont.truetype(FONT, 26)
        if g == 3: d.text((X - 64, HY - 80), '감리', font=fnt, fill='#3b7dd8')
        if g == 2: d.ellipse((X + 26, HY - 96, X + 64, HY - 58), fill='#2b8a3e'); d.text((X + 31, HY - 92), '안전', font=ImageFont.truetype(FONT, 14), fill='#ffffff')
    return layer(f)
def pencil():
    def f(d, lay):
        d.polygon([(X + 70, HY - 30), (X + 82, HY - 36), (X + 104, HY + 18), (X + 92, HY + 24)], fill='#ffd43b')
        d.polygon([(X + 92, HY + 24), (X + 104, HY + 18), (X + 102, HY + 34)], fill='#333333')
    return layer(f)
def blueprint(g):
    def f(d, lay):
        x, y = HAND_L
        r = Image.new('RGBA', (60, 200), (0, 0, 0, 0)); rd = ImageDraw.Draw(r)
        rrect(rd, (4, 4, 56, 196), 24, '#3b7dd8'); rd.ellipse((4, 4, 56, 30), fill='#d0e4ff')
        rd.line([(22, 40), (22, 170)], fill=(255, 255, 255, 180), width=3); rd.line([(36, 60), (36, 150)], fill=(255, 255, 255, 180), width=3)
        if g >= 4: rd.rectangle((4, 30, 56, 44), fill=GOLD); rd.rectangle((4, 172, 56, 186), fill=GOLD)
        r = r.rotate(25, expand=True, resample=Image.BICUBIC); lay.alpha_composite(r, (int(x - r.size[0] / 2 + 10), int(y - r.size[1] / 2 - 50)))
    return layer(f)
# 회계사
def arm_sleeves():
    def f(d, lay):
        for s in (-1, 1):
            cx = X + s * 126
            d.rounded_rectangle((cx - 26, TY + 24, cx + 26, TY + 72), 12, fill='#2b2b30')
            d.line([(cx - 24, TY + 32), (cx + 24, TY + 32)], fill=(255, 255, 255, 50), width=3); d.line([(cx - 24, TY + 64), (cx + 24, TY + 64)], fill=(255, 255, 255, 50), width=3)
    return layer(f)
def necklace(g):
    def f(d, lay):
        d.arc((X - 30, TY - 100, X + 30, TY - 40), 20, 160, fill=GOLD, width=4); d.ellipse((X - 7, TY - 46, X + 7, TY - 32), fill=GOLD)
    return layer(f)
def calculator(g):
    def f(d, lay):
        x, y = HAND_R
        rrect(d, (x - 40, y - 76, x + 30, y + 14), 8, '#d9dde3', (0, 0, 0, 70), 3)
        d.rectangle((x - 32, y - 66, x + 22, y - 44), fill='#7fd18b')
        d.text((x - 20, y - 68), '1,000', font=ImageFont.truetype(FONT, 15), fill='#2f6b45')
        for r in range(3):
            for k in range(3): d.rectangle((x - 30 + k * 18, y - 36 + r * 16, x - 18 + k * 18, y - 26 + r * 16), fill='#ff922b' if (k == 2 and r == 2) else '#6b7280')
    return layer(f)
def moneybag(g):
    def f(d, lay):
        x, y = HAND_L; col = GOLD if g >= 4 else '#c8a24a'
        d.ellipse((x - 44, y - 30, x + 40, y + 56), fill=col, outline=(0, 0, 0, 60), width=3)
        d.polygon([(x - 16, y - 34), (x + 12, y - 34), (x + 4, y - 20), (x - 8, y - 20)], fill='#b38f3a')
        d.text((x - 16, y - 10), '₩', font=ImageFont.truetype(FONT, 40), fill='#5a4510')
    return layer(f)
# 개발자
def hood(col, dark):
    def f(d, lay):
        h = Image.new('RGBA', (W, H), (0, 0, 0, 0)); hd = ImageDraw.Draw(h)
        hd.ellipse((X - 104, HY - 108, X + 104, HY + 96), fill=col); h = darken(h, dark + 0.15); lay.alpha_composite(h)
    return layer(f)
def hood_rim(col, dark):
    def f(d, lay):
        h = Image.new('RGBA', (W, H), (0, 0, 0, 0)); hd = ImageDraw.Draw(h)
        hd.arc((X - 104, HY - 108, X + 104, HY + 96), 200, 340, fill=col, width=22); h = darken(h, dark); lay.alpha_composite(h)
    return layer(f)
def strings(g):
    def f(d, lay):
        col = GOLD if g >= 4 else '#ececf3'
        for s in (-1, 1): d.line([(X + s * 16, TY - 80), (X + s * 16, TY - 20)], fill=col, width=5); d.rounded_rectangle((X + s * 16 - 5, TY - 22, X + s * 16 + 5, TY - 8), 3, fill=col)
        if g >= 4: d.text((X - 30, TY + 30), 'CTO', font=ImageFont.truetype(FONT, 26), fill=GOLD)
    return layer(f)
def headphones(g):
    def f(d, lay):
        d.arc((X - 100, HY - 112, X + 100, HY + 80), 195, 345, fill='#1f1f26', width=14)
        for s in (-1, 1):
            rrect(d, (X + s * 96 - 22, HY - 24, X + s * 96 + 22, HY + 36), 12, GOLD if g >= 4 else '#1f1f26')
            d.ellipse((X + s * 96 - 7, HY - 1, X + s * 96 + 7, HY + 13), fill='#fff2b3' if g >= 4 else '#b197fc')
        if g >= 3: d.arc((X - 104, HY + 0, X - 20, HY + 70), 90, 180, fill='#1f1f26', width=5); d.ellipse((X - 52, HY + 60, X - 38, HY + 74), fill='#b197fc')
    return layer(f)
def dark_circles():
    def f(d, lay):
        for s in (-1, 1): d.arc((X + s * 30 - 16, HY + 6, X + s * 30 + 16, HY + 30), 20, 160, fill=(110, 80, 160, 190), width=4)
    return layer(f)
def laptop(g):
    def f(d, lay):
        x, y = X, TY + 70
        d.polygon([(x - 70, y + 20), (x + 70, y + 20), (x + 90, y - 120), (x - 90, y - 120)], fill=(160, 200, 255, 40))
        rrect(d, (x - 80, y - 40, x + 80, y + 40), 8, '#2b2b2b' if g >= 4 else '#c9ced8', (0, 0, 0, 80), 3)
        rrect(d, (x - 70, y - 32, x + 70, y + 30), 5, GOLD if g >= 4 else '#7aa7ff')
        for k, w in enumerate((70, 100, 54)): d.rectangle((x - 58, y - 22 + k * 16, x - 58 + w, y - 16 + k * 16), fill=(255, 255, 255, 220))
        rrect(d, (x - 30, y + 2, x + 30, y + 10), 3, (255, 255, 255, 90))
        d.text((x + 34, y - 26), '</>', font=ImageFont.truetype(FONT, 18), fill='#2b2b2b' if g >= 4 else '#ffffff')
    return layer(f)
def coffee():
    def f(d, lay):
        x, y = HAND_R
        rrect(d, (x - 26, y - 46, x + 22, y + 14), 8, '#f2f2f2', (0, 0, 0, 60), 3)
        d.arc((x + 10, y - 34, x + 40, y - 4), 270, 90, fill='#f2f2f2', width=8)
        d.rectangle((x - 20, y - 40, x + 16, y - 32), fill='#6b4423'); d.rectangle((x - 26, y - 14, x + 22, y - 6), fill='#b197fc')
        for k in (-10, 6): d.arc((x + k - 10, y - 84, x + k + 10, y - 50), 100, 260, fill=(255, 255, 255, 140), width=4)
    return layer(f)

def face_for(g, browcol, eye):
    return {0: dict(brow=f'{browcol}Brow2', eye=f'eye{eye}_small', mouth='mouth_oh', browdy=-4),
            1: dict(brow=f'{browcol}Brow1', eye=f'eye{eye}_large', mouth='mouth_happy'),
            2: dict(brow=f'{browcol}Brow1', eye=f'eye{eye}_large', mouth='mouth_glad'),
            3: dict(brow=f'{browcol}Brow3', eye=f'eye{eye}_large', mouth='mouth_teethLower'),
            4: dict(brow=f'{browcol}Brow1', eye=f'eye{eye}_large', mouth='mouth_teethUpper')}[g]

def spec(j, g):
    hooks = {k: [] for k in ('back', 'behind_torso', 'arms', 'torso', 'behind_head', 'face', 'head', 'front')}
    if g == 0:
        o = dict(tint=1, shirtc='Grey', shirt=1, pants='Grey', shoe=('Black', 'blackShoe1'), hair=('Brown 1', 'brown1Man4'), face=face_for(0, 'brown1', 'Black'))
        hooks['torso'] += [lanyard(JOBCOL[j])]; hooks['head'] += [sweat()]
        return o, hooks
    if j == 0:  # 의사 나진료
        hc = ('Black', 'blackMan1') if g <= 2 else (('Grey', 'greyMan1') if g == 3 else ('White', 'whiteMan1'))
        bc = 'black' if g <= 2 else ('grey' if g == 3 else 'white')
        o = dict(tint=1, shirtc='Blue', shirt=5, sleeve='White', pants='Light Blue', shoe=('Grey', 'greyShoe1'), hair=hc, face=face_for(g, bc, 'Brown'))
        hooks['torso'] += [coat(g), badge(g)]
        if g >= 2: hooks['torso'] += [stethoscope(g)]
        if g >= 3: hooks['head'] += [head_mirror(g)]
        hooks['front'] += [clipboard(g)]
    elif j == 1:  # 변호사 이소송
        o = dict(tint=2, shirtc='Navy', shirt=5, pants='Navy', shoe=('Black', 'blackShoe3'), hair=('Black', 'blackWoman3'), face=face_for(g, 'black', 'Blue'), dark=0.35 if g >= 4 else 0)
        hooks['torso'] += [blouse(g), badge(g)]
        if g >= 2: hooks['face'] += [earrings(g)]; hooks['front'] += [briefcase(g)]
        if g >= 3: hooks['front'] += [gavel(g)]
    elif j == 2:  # 건축가 도면석
        o = dict(tint=3, shirtc='Navy', shirt=1, pants='Tan', shoe=('Brown 2', 'brown2Shoe2'), hair=('Brown 2', 'brown2Man5'), face=face_for(g, 'brown2', 'Black'), dark=0.2)
        hooks['torso'] += [turtleneck()]
        if g >= 2: hooks['torso'] += [vest(g)]
        hooks['torso'] += [badge(g)]
        hooks['face'] += [glasses_round(GOLD if g >= 4 else '#151515')]
        if g >= 2: hooks['head'] += [helmet(g)]; hooks['front'] += [blueprint(g)]
        else: hooks['head'] += [pencil()]
    elif j == 3:  # 회계사 정산미
        sc = 'Pine'; shn = 7 if g <= 2 else 5
        o = dict(tint=1, shirtc=sc, shirt=shn, pants='Grey', shoe=('Black', 'blackShoe4'), hair=('Brown 2', 'brown2Woman4'), face=face_for(g, 'brown2', 'Green'), dark=0.35 if g >= 3 else 0)
        if g <= 2: hooks['arms'] += [arm_sleeves()]
        if g >= 3: hooks['torso'] += [necklace(g)]
        hooks['torso'] += [badge(g)]
        if g >= 2: hooks['face'] += [glasses_square(GOLD if g >= 4 else '#333333')]; hooks['front'] += [calculator(g)]
        if g >= 3: hooks['front'] += [moneybag(g)]
    else:  # 개발자 배포중
        sc, dk = ('Blue', 0) if g <= 2 else ('Navy', 0.1 if g == 3 else 0.55)
        o = dict(tint=4, shirtc=sc, shirt=2, pants='Blue 1', shoe=('Grey', 'greyShoe2'), hair=('Black', 'blackMan2'), face=face_for(g, 'black', 'Black'), dark=dk)
        hcol = '#3498db' if sc == 'Blue' else '#34495e'
        hooks['behind_head'] += [hood(hcol, dk)]; hooks['head'] += [hood_rim(hcol, dk)]
        hooks['torso'] += [strings(g), badge(g)]
        if g == 3: hooks['face'] += [dark_circles()]
        if g >= 4: hooks['face'] += [sunglasses()]
        if g >= 2: hooks['head'] += [headphones(g)]; hooks['front'] += [laptop(g)]
        if g >= 3: hooks['front'] += [coffee()]
    return o, hooks

def outline(im, px, col=(18, 18, 26, 255)):
    a = im.split()[3].filter(ImageFilter.MaxFilter(px * 2 + 1))
    base = Image.new('RGBA', im.size, col); base.putalpha(a); base.alpha_composite(im); return base

if __name__ == '__main__':
    CW, CH = 240, 350  # 아틀라스 칸 크기 (원본 520x760의 46%)
    atlas = Image.new('RGBA', (CW * 5, CH * 5), (0, 0, 0, 0))
    for j in range(5):
        for g in range(5):
            o, hk = spec(j, g); im = compose(o, hk)
            im = im.resize((CW, CH), Image.LANCZOS)
            im = outline(im, 3, (60, 42, 0, 255) if g == 4 else (18, 18, 26, 255))
            atlas.alpha_composite(im, (g * CW, j * CH))
    atlas.save(OUT, optimize=True)
    print('saved', OUT, os.path.getsize(OUT))
