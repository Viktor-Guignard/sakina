"""Couvertures des modèles en SVG (format A5 : 148 × 210).

Uniquement géométrie et calligraphie : ni figure humaine ni animale, ni
représentation des Lieux saints (voir la charte graphique).
"""
from math import cos, sin, pi
from html import escape


def etoile(cx, cy, R, r_ratio=.765, branches=8, rot=-pi / 2):
    """Polygone d'étoile à n branches (par défaut l'étoile à huit branches, khâtam)."""
    pts = []
    for i in range(branches * 2):
        r = R if i % 2 == 0 else R * r_ratio
        a = rot + i * pi / branches
        pts.append(f'{cx + r * cos(a):.2f},{cy + r * sin(a):.2f}')
    return ' '.join(pts)


def arc_brise(x, y, l, h):
    """Arc brisé (mihrab) : base en (x, y+h), sommet en (x+l/2, y)."""
    return (f'M{x} {y + h}V{y + h * .42:.1f}C{x} {y + h * .2:.1f} {x + l * .22:.1f} {y + h * .08:.1f} {x + l / 2} {y}'
            f'C{x + l * .78:.1f} {y + h * .08:.1f} {x + l} {y + h * .2:.1f} {x + l} {y + h * .42:.1f}V{y + h}')


def motif(m, c):
    t, a = c['trait'], c['accent']
    if m == 'etoile':
        return (f'<polygon points="{etoile(74, 66, 26)}" fill="none" stroke="{t}" stroke-width="1"/>'
                f'<polygon points="{etoile(74, 66, 17)}" fill="none" stroke="{a}" stroke-width=".6"/>'
                f'<circle cx="74" cy="66" r="5" fill="{a}"/>'
                + ''.join(f'<polygon points="{etoile(x, 30, 4)}" fill="{t}" opacity=".5"/>' for x in (34, 54, 94, 114)))
    if m == 'rosace':
        petales = ''.join(f'<ellipse cx="74" cy="48" rx="5.5" ry="15" fill="none" stroke="{a}" stroke-width=".8" transform="rotate({i * 30} 74 66)"/>' for i in range(12))
        return (petales + f'<circle cx="74" cy="66" r="7" fill="{t}"/><circle cx="74" cy="66" r="28" fill="none" stroke="{t}" stroke-width=".8"/>'
                f'<circle cx="74" cy="66" r="31" fill="none" stroke="{t}" stroke-width=".3"/>')
    if m == 'muqarnas':
        arcs = ''.join(f'<path d="{arc_brise(74 - l / 2, 22 + (52 - l) * .55, l, l * 1.15)}" fill="none" stroke="{t}" stroke-width="{.9 if i == 0 else .45}"/>'
                       for i, l in enumerate((52, 42, 32, 22)))
        return arcs + f'<polygon points="{etoile(74, 70, 6)}" fill="{a}"/>'
    if m == 'croissant':
        return (f'<circle cx="70" cy="62" r="20" fill="{a}"/><circle cx="78" cy="56" r="17" fill="{c["fond"]}"/>'
                f'<polygon points="{etoile(92, 50, 5, .45, 5)}" fill="{a}"/>'
                + ''.join(f'<line x1="{x}" y1="14" x2="{x}" y2="{y}" stroke="{t}" stroke-width=".5"/>'
                          f'<path d="M{x - 3} {y}h6l-1 6h-4z" fill="{t}" opacity=".85"/>' for x, y in ((28, 34), (40, 26), (108, 28), (120, 38))))
    if m == 'entrelacs':
        return (f'<rect x="54" y="46" width="40" height="40" fill="none" stroke="{t}" stroke-width="1"/>'
                f'<rect x="54" y="46" width="40" height="40" fill="none" stroke="{t}" stroke-width="1" transform="rotate(45 74 66)"/>'
                f'<rect x="61" y="53" width="26" height="26" fill="none" stroke="{a}" stroke-width=".5" transform="rotate(22.5 74 66)"/>'
                f'<circle cx="74" cy="66" r="4" fill="{a}"/>'
                + ''.join(f'<path d="M{x} 24l4 4-4 4-4-4z" fill="{t}" opacity=".6"/>' for x in range(22, 130, 13)))
    if m == 'dunes':
        return (f'<circle cx="74" cy="52" r="15" fill="none" stroke="{a}" stroke-width="1"/><circle cx="74" cy="52" r="9" fill="{a}" opacity=".35"/>'
                + ''.join(f'<path d="M14 {y}C40 {y - 9} 58 {y + 7} 80 {y}S120 {y - 6} 134 {y}" fill="none" stroke="{t}" stroke-width="{w}"/>'
                          for y, w in ((80, .9), (88, .6), (95, .4))))
    # sobre (janâza) : un filet et une petite étoile, rien de plus
    return f'<line x1="44" y1="66" x2="104" y2="66" stroke="{t}" stroke-width=".5"/><polygon points="{etoile(74, 66, 4)}" fill="{t}"/>'


def couverture(cle, c):
    """Couverture A5 : le décor s'inscrit dans un arc brisé (mihrab), signe de Sakîna.

    Les textes portent une classe (c-phrase, c-titre, c-noms, c-date) que le
    compositeur ajuste quand ils sont en arabe.
    """
    m = c['motif']
    sobre = m == 'sobre'
    sombre = c['fond'].lower() in ('#11706b', '#0f2747')
    taille_ar = c.get('taille_ar') or (11 if len(c['phrase']) > 14 else 15)
    date = c.get('date', 'Samedi 14 juin 2027')
    y = (104, 126, 145, 156, 167) if sobre else (124, 143, 162, 172, 184)   # phrase, titre, noms, étoile, date
    arc = arc_brise(14, 14, 120, 184)
    return f'''<svg viewBox="0 0 148 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Motif {escape(c['nom'])}">
  <defs><clipPath id="arc-{cle}"><path d="{arc}Z"/></clipPath></defs>
  <rect width="148" height="210" fill="{c['fond']}"/>
  <path d="{arc}" fill="none" stroke="{c['trait']}" stroke-width=".8"/>
  <path d="{arc_brise(18.5, 20, 111, 178)}" fill="none" stroke="{c['trait']}" stroke-width=".25" opacity=".7"/>
  <g clip-path="url(#arc-{cle})">{motif(m, c)}</g>
  <text class="c-phrase" x="74" y="{y[0]}" text-anchor="middle" direction="rtl" font-family="Amiri, 'Noto Naskh Arabic', serif" font-size="{taille_ar}" fill="{c['accent']}">{escape(c['phrase'])}</text>
  <text class="c-titre" x="74" y="{y[1]}" text-anchor="middle" font-family="Manrope, sans-serif" font-size="6.2" font-weight="600" fill="{c['accent'] if not sombre else c['trait']}">{escape(c['titre'])}</text>
  <text class="c-noms" x="74" y="{y[2]}" text-anchor="middle" font-family="Marcellus, serif" font-size="12" fill="{c['texte']}">{escape(c['noms'])}</text>
  <polygon points="{etoile(74, y[3], 2.6)}" fill="{c['trait']}"/>
  <text class="c-date" x="74" y="{y[4]}" text-anchor="middle" font-family="Manrope, sans-serif" font-size="4.6" fill="{c['texte']}" opacity=".75">{escape(date)}</text>
</svg>'''


def piece(sorte, cle, c, phrase, noms, date=''):
    """Vignette d'une pièce de papeterie (accueil, page des motifs), à l'échelle de son format :
    faire-part (105 × 148), menu (99 × 210), marque-page (50 × 150), étiquette ronde (Ø 50).
    Même décor que la couverture : le motif dans un arc brisé, jamais de cadre rectangulaire."""
    formats = {'faire_part': (105, 148), 'menu': (99, 210), 'marque_page': (50, 150), 'etiquette': (50, 50)}
    l, h = formats[sorte]
    sombre = c['fond'].lower() in ('#11706b', '#0f2747')
    accent = c['trait'] if sombre else c['accent']
    idc = f'pc-{sorte}-{cle}'
    if sorte == 'etiquette':
        corps = (f'<defs><clipPath id="{idc}"><circle cx="25" cy="25" r="22"/></clipPath></defs>'
                 f'<circle cx="25" cy="25" r="25" fill="{c["fond"]}"/><circle cx="25" cy="25" r="22.5" fill="none" stroke="{c["trait"]}" stroke-width=".45"/>'
                 f'<g clip-path="url(#{idc})" opacity=".28"><g transform="translate({25 - 74 * .7:.2f} {25 - 66 * .7:.2f}) scale(.7)">{motif(c["motif"], c)}</g></g>'
                 f'<text x="25" y="25" text-anchor="middle" direction="rtl" font-family="Amiri, serif" font-size="8" fill="{accent}">{escape(phrase)}</text>'
                 f'<text x="25" y="33" text-anchor="middle" font-family="Marcellus, serif" font-size="4.6" fill="{c["texte"]}">{escape(noms)}</text>')
    else:
        m = 6 if l < 60 else 8
        ah = 74 if sorte == 'menu' else h - 2 * m
        aw = l - 2 * m
        s_ = aw / 128
        corps = (f'<defs><clipPath id="{idc}"><path d="{arc_brise(m, m, aw, ah)}Z"/></clipPath></defs>'
                 f'<rect width="{l}" height="{h}" fill="{c["fond"] if sorte != "menu" else "#FFFFFF"}"/>'
                 + (f'<path d="{arc_brise(m, m, aw, ah)}Z" fill="{c["fond"]}"/>' if sorte == 'menu' else '')
                 + f'<path d="{arc_brise(m, m, aw, ah)}" fill="none" stroke="{c["trait"]}" stroke-width=".7"/>'
                 f'<g clip-path="url(#{idc})"><g transform="translate({m + aw / 2 - 74 * s_:.2f} {m + ah * .3 - 66 * s_:.2f}) scale({s_:.3f})">{motif(c["motif"], c)}</g></g>')
        if sorte == 'menu':
            corps += (f'<text x="{l / 2}" y="{m + ah * .78}" text-anchor="middle" direction="rtl" font-family="Amiri, serif" font-size="9" fill="{accent}">{escape(phrase)}</text>'
                      f'<text x="{l / 2}" y="104" text-anchor="middle" font-family="Marcellus, serif" font-size="13" fill="{c["accent"] if not sombre else c["fond"]}">Menu</text>'
                      + ''.join(f'<line x1="{l * .28:.1f}" x2="{l * .72:.1f}" y1="{y}" y2="{y}" stroke="{c["trait"]}" stroke-width=".4" opacity=".6"/>'
                                for y in (124, 130, 146, 152, 168, 174, 190)))
        elif sorte == 'marque_page':
            corps += (f'<text x="{l / 2}" y="{h * .62}" text-anchor="middle" direction="rtl" font-family="Amiri, serif" font-size="8" fill="{accent}">{escape(phrase)}</text>'
                      f'<text x="{l / 2}" y="{h * .72}" text-anchor="middle" font-family="Marcellus, serif" font-size="5.5" fill="{c["texte"]}">{escape(noms)}</text>')
        else:
            corps += (f'<text x="{l / 2}" y="{h * .6}" text-anchor="middle" direction="rtl" font-family="Amiri, serif" font-size="11" fill="{accent}">{escape(phrase)}</text>'
                      f'<text x="{l / 2}" y="{h * .72}" text-anchor="middle" font-family="Marcellus, serif" font-size="9" fill="{c["texte"]}">{escape(noms)}</text>'
                      f'<polygon points="{etoile(l / 2, h * .78, 1.8)}" fill="{c["trait"]}"/>'
                      f'<text x="{l / 2}" y="{h * .84}" text-anchor="middle" font-family="Manrope, sans-serif" font-size="3.6" fill="{c["texte"]}" opacity=".75">{escape(date)}</text>')
    return f'<svg viewBox="0 0 {l} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">{corps}</svg>'
