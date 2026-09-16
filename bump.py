#!/usr/bin/env python3
"""Recalcule les empreintes de cache de style.css et main.js dans index.html."""
import pathlib, re, hashlib
p = pathlib.Path(__file__).parent
vc = hashlib.md5((p/"assets/css/style.css").read_bytes()).hexdigest()[:8]
vj = hashlib.md5((p/"assets/js/main.js").read_bytes()).hexdigest()[:8]
h = (p/"index.html").read_text(encoding="utf-8")
h = re.sub(r'href="assets/css/style\.css(\?v=[a-f0-9]+)?"', f'href="assets/css/style.css?v={vc}"', h)
h = re.sub(r'src="assets/js/main\.js(\?v=[a-f0-9]+)?"',     f'src="assets/js/main.js?v={vj}"', h)
(p/"index.html").write_text(h, encoding="utf-8")
print(f"css={vc} js={vj}")
