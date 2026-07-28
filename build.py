#!/usr/bin/env python3
"""
한 파일짜리 게임 만들기  (build.py)

여러 파일로 나뉜 게임을 '독립을향하여.html' 한 개로 합쳐요.
USB 에 담아 아케이드 기계로 옮길 때 이 파일 하나만 있으면 돼요.

쓰는 방법 :  python3 build.py
"""

import re

# 합칠 자바스크립트 파일들 (순서가 중요해요!)
JS_FILES = [
    'js/sound.js',     # 소리
    'js/input.js',     # 조작
    'js/missions.js',  # 미션 보관함
    'js/ch1.js',       # 1장
    'js/ch2.js',       # 2장
    'js/ch3.js',       # 3장
    'js/ch4.js',       # 4장
    'js/ch5.js',       # 5장
    'js/ch6.js',       # 6장
    'js/game.js',      # 게임 전체를 이끄는 파일
]

OUT = '독립을향하여.html'


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def main():
    html = read('index.html')

    # <script src="..."> 줄들을 지워요 (아래에서 코드를 직접 넣을 거예요)
    html = re.sub(r'\s*<script src="js/[^"]+"></script>', '', html)

    # css/style.css 를 <style> 로 바꿔 넣어요
    css = read('css/style.css')
    html = html.replace(
        '<link rel="stylesheet" href="css/style.css">',
        '<style>\n' + css + '\n</style>'
    )

    # 자바스크립트를 순서대로 이어 붙여요
    js = '\n\n'.join(
        '/* ===== %s ===== */\n%s' % (p, read(p)) for p in JS_FILES
    )
    if '</script>' in js:
        raise SystemExit('자바스크립트 안에 </script> 가 있으면 안 돼요!')

    html = html.replace('</body>', '<script>\n' + js + '\n</script>\n</body>')

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)

    print('완성!  %s  (%d 글자)' % (OUT, len(html)))
    print('이 파일 하나만 있으면 어디서든 게임이 돌아가요.')


if __name__ == '__main__':
    main()
