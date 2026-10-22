"""Génère le site statique dans site/ : python3 build.py

Deux langues : français à la racine, arabe dans site/ar/ (mêmes noms de
fichiers, dir="rtl"). Au premier passage, une fenêtre en surimpression demande
la langue ; un lien dans l'en-tête permet d'en changer à tout moment.

Pages : accueil, fil d'une vie (+ une page par cérémonie), motifs, notre
éthique, compositeur de livrets ; la charte graphique n'existe qu'en français.
Le contenu est dans contenu.py, contenu_ar.py et livrets.py.
"""
import hashlib
import json
import shutil
from html import escape
from pathlib import Path

from contenu import MARQUE, CEREMONIES, MOTIFS
from contenu_ar import MARQUE_AR, CEREMONIES_AR, MOTIFS_AR
from couvertures import couverture, etoile, arc_brise
from livrets import TEXTES, LIVRETS, TARIFS_VISTAPRINT, MARGE, TVA

RACINE = Path(__file__).parent
SITE = RACINE / 'site'

def version(chemin):
    """Empreinte courte d'un fichier : change à chaque modification, pour contourner le cache des navigateurs."""
    return hashlib.sha256((RACINE / chemin).read_bytes()).hexdigest()[:10]


POLICES = ('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@400;500;600'
           '&family=Manrope:wght@400;500;600;700&family=Marcellus&family=Reem+Kufi:wght@400;600&display=swap')

# Langue de la page en cours de génération ('fr' ou 'ar') ; voir generer().
L = 'fr'
PAGES_AR = set()   # fichiers qui existent aussi en arabe


def t(fr, ar):
    return ar if L == 'ar' else fr


def racine():
    """Chemin relatif vers la racine du site (les pages arabes sont dans ar/)."""
    return '../' if L == 'ar' else ''


def cv(c, cle):
    """Champ d'une cérémonie dans la langue courante."""
    if L == 'ar' and cle in CEREMONIES_AR[c['id']]:
        return CEREMONIES_AR[c['id']][cle]
    return c[cle]


def chiffres(texte):
    return texte.translate(str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')) if L == 'ar' else texte


def logo(classe='marque-signe', couleur='currentColor', or_='#2E9C95'):
    """Signe : un arc brisé (mihrab) qui abrite l'étoile à huit branches."""
    return (f'<svg class="{classe}" viewBox="0 0 40 48" aria-hidden="true">'
            f'<path d="{arc_brise(2, 2, 36, 44)}Z" fill="none" stroke="{couleur}" stroke-width="2"/>'
            f'<polygon points="{etoile(20, 27, 9)}" fill="{or_}"/></svg>')


def marque(lien=True):
    nom, sous = (MARQUE_AR['nom'], MARQUE_AR['sous_titre']) if L == 'ar' else (MARQUE['nom'], MARQUE['sous_titre'])
    contenu = f'{logo()}<span><span class="marque-nom">{nom}</span><span class="marque-sous">{sous}</span></span>'
    return f'<a class="marque" href="index.html" aria-label="{nom} — {t("accueil", "الرئيسية")}">{contenu}</a>' if lien else contenu


def fil(*etapes):
    sep = ' ‹ ' if L == 'ar' else ' › '
    return f'<p class="fil">{sep.join(etapes)}</p>'


CHOIX_LANGUE = '''
  <div class="langue-choix" id="langue-choix" role="dialog" aria-modal="true" aria-labelledby="langue-choix-titre" hidden>
    <div class="langue-choix-carte">
      {logo}
      <p class="langue-choix-titre" id="langue-choix-titre"><span>Bienvenue</span><span lang="ar">أهلًا وسهلًا</span></p>
      <p class="langue-choix-texte">Choisissez votre langue · <span lang="ar">اختر لغتك</span></p>
      <div class="langue-choix-boutons">
        <a class="btn btn-or" href="{fr}" data-langue="fr" lang="fr">Français</a>
        <a class="btn btn-or" href="{ar}" data-langue="ar" lang="ar">العربية</a>
      </div>
      <p class="langue-choix-note">Vous pourrez changer à tout moment en haut de la page. <span lang="ar">يمكنك التغيير في أي وقت من أعلى الصفحة.</span></p>
    </div>
  </div>'''

SCRIPT_COMMUN = '''
  <script>
    (() => {{
      const b = document.querySelector('.nav-bouton'), n = document.getElementById('nav');
      b.addEventListener('click', () => {{ const o = n.classList.toggle('ouverte'); b.setAttribute('aria-expanded', String(o)); }});
      // Langue : mémorisée dans le navigateur ; à la première visite, on la demande.
      const langueGardee = () => {{ try {{ return window.localStorage['sakina-langue'] || null; }} catch (e) {{ return null; }} }};
      const garderLangue = v => {{ try {{ window.localStorage['sakina-langue'] = v; }} catch (e) {{ /* stockage indisponible */ }} }};
      document.querySelectorAll('[data-langue]').forEach(a => a.addEventListener('click', ev => {{
        garderLangue(a.dataset.langue);
        if (a.dataset.langue === document.documentElement.lang) {{ ev.preventDefault(); masquerChoix(); }}
      }}));
      const choix = document.getElementById('langue-choix');
      const masquerChoix = () => {{ choix.hidden = true; document.body.classList.remove('choix-ouvert'); }};
      if (!langueGardee() && !/[?&]langue=/.test(location.search)) {{
        choix.hidden = false; document.body.classList.add('choix-ouvert');
        choix.querySelector('[data-langue="' + document.documentElement.lang + '"]').focus();
        choix.addEventListener('keydown', e => {{ if (e.key === 'Escape') {{ garderLangue(document.documentElement.lang); masquerChoix(); }} }});
      }}
    }})();
  </script>'''


def page(fichier, titre, description, corps, actif='', scripts=''):
    r = racine()
    nav = [('ceremonies.html', t("Le fil d'une vie", 'مسيرة العمر')), ('motifs.html', t('Motifs', 'الزخارف')),
           ('respect.html', t('Notre éthique', 'ميثاقنا'))]
    courant = ' aria-current="page"'
    liens = ''.join(f'<a href="{h}"{courant if h == actif else ""}>{tx}</a>' for h, tx in nav)
    pied_cer = ''.join(f'<li><a href="ceremonie-{c["id"]}.html">{escape(cv(c, "nom"))}</a></li>' for c in CEREMONIES[:5])
    pied_cer2 = ''.join(f'<li><a href="ceremonie-{c["id"]}.html">{escape(cv(c, "nom"))}</a></li>' for c in CEREMONIES[5:])

    # Liens vers la même page dans l'autre langue (accueil arabe si elle n'existe pas).
    if L == 'ar':
        url_fr, url_ar = f'../{fichier}', fichier
    else:
        url_fr, url_ar = fichier, f'ar/{fichier}' if fichier in PAGES_AR else 'ar/index.html'
    bascule = (f'<a class="bascule-langue" href="{url_fr}" data-langue="fr" lang="fr" hreflang="fr">Français</a>' if L == 'ar'
               else f'<a class="bascule-langue" href="{url_ar}" data-langue="ar" lang="ar" hreflang="ar">العربية</a>')
    alternates = ''
    if fichier in PAGES_AR:
        alternates = (f'<link rel="alternate" hreflang="fr" href="{r}{fichier}">'
                      f'<link rel="alternate" hreflang="ar" href="{r}ar/{fichier}">')
    charte_lien = (f'<li><a href="../charte-graphique.html" lang="fr">Charte graphique</a></li>' if L == 'ar'
                   else '<li><a href="charte-graphique.html">Charte graphique</a></li>')
    nom = t(MARQUE['nom'], MARQUE_AR['nom'])

    html = f'''<!DOCTYPE html>
<html lang="{L}" dir="{t('ltr', 'rtl')}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{escape(titre)}</title>
  <meta name="description" content="{escape(description)}">
  <meta property="og:title" content="{escape(titre)}">
  <meta property="og:description" content="{escape(description)}">
  <meta name="theme-color" content="#0F2747">
  {alternates}
  <link rel="icon" href="{r}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="{POLICES}">
  <link rel="stylesheet" href="{r}assets/css/style.css?v={version('assets/css/style.css')}">
</head>
<body>
  <a class="visuellement-cache" href="#contenu">{t('Passer directement au texte', 'الانتقال مباشرةً إلى النص')}</a>
  <header class="entete">
    <div class="conteneur entete-int">
      {marque()}
      <div class="entete-droite">
        {bascule}
        <button class="nav-bouton" type="button" aria-expanded="false" aria-controls="nav" aria-label="{t('Menu', 'القائمة')}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8.5h16M8 15.5h12"/><circle cx="4.6" cy="15.5" r="1.2" fill="currentColor" stroke="none"/></svg>
        </button>
      </div>
      <nav class="nav" id="nav" aria-label="{t('Rubriques du site', 'أقسام الموقع')}">{liens}<a class="btn btn-or" href="composer.html"{courant if actif == 'composer.html' else ''}>{t('Composer', 'صمّم')}</a></nav>
    </div>
  </header>
  <main id="contenu">
{corps}
  </main>
  <footer class="pied">
    <div class="conteneur">
      <div class="pied-grille">
        <div>
          {marque()}
          <p style="margin-top:16px;max-width:34ch;font-size:.9rem">{t("Livrets, faire-part et papeterie pour les grands moments de la vie musulmane, composés en ligne avec soin et respect.", "كتيّبات وبطاقات وأوراق لمناسبات الحياة الإسلامية الكبرى، تُصاغ عبر الإنترنت بعناية واحترام.")}</p>
        </div>
        <div><h4>{t('Cérémonies', 'المناسبات')}</h4><ul>{pied_cer}</ul></div>
        <div><h4>&nbsp;</h4><ul>{pied_cer2}</ul></div>
        <div><h4>{nom}</h4><ul>
          <li><a href="composer.html">{t('Composer un livret', 'صمّم كتيّبًا')}</a></li>
          <li><a href="motifs.html">{t('Les motifs', 'الزخارف')}</a></li>
          <li><a href="respect.html">{t('Notre éthique', 'ميثاقنا')}</a></li>
          {charte_lien}
          <li><a href="mailto:{MARQUE["email"]}" dir="ltr">{MARQUE["email"]}</a></li>
        </ul></div>
      </div>
      <div class="pied-bas"><span>© {chiffres('2026')} {nom}</span><span class="{t('ar', '')}" lang="{t('ar', 'fr')}">{t(MARQUE["nom_ar"], MARQUE["nom"])}</span></div>
    </div>
  </footer>
{CHOIX_LANGUE.format(logo=logo('langue-choix-signe'), fr=url_fr, ar=url_ar)}
{SCRIPT_COMMUN.format()}
{scripts}
</body>
</html>
'''
    dossier = SITE / 'ar' if L == 'ar' else SITE
    (dossier / fichier).write_text(html, encoding='utf-8')


def nom_motif(cle):
    return MOTIFS_AR[cle] if L == 'ar' else MOTIFS[cle]['nom']


def carte_motif(cle, ceremonie=None):
    m = MOTIFS[cle]
    pour = '، '.join(cv(c, 'nom') for c in CEREMONIES if cle in c['motifs']) if L == 'ar' else \
        ', '.join(c['nom'] for c in CEREMONIES if cle in c['motifs'])
    lien = f'composer.html?m={cle}' + (f'&amp;c={ceremonie}' if ceremonie else '')
    return (f'<a class="motif-carte" href="{lien}" id="{cle}"><div class="motif-couv">{couverture(cle, m)}</div>'
            f'<div><p class="motif-nom">{escape(nom_motif(cle))}</p><p class="motif-pour">{escape(pour)}</p></div></a>')


def citation(c):
    if not c['citation']:
        return ''
    ar, trad, ref = c['citation']
    if L == 'ar':
        return f'<figure class="citation"><p class="ar" lang="ar">{ar}</p><figcaption class="ref">{escape(cv(c, "ref"))}</figcaption></figure>'
    return (f'<figure class="citation"><p class="ar" lang="ar">{ar}</p><p class="trad">« {escape(trad)} »</p>'
            f'<figcaption class="ref">{escape(ref)}</figcaption></figure>')


# ------------------------------------------------------------------ accueil

VIE = ['aqiqa', 'khitan', 'khatm', 'henne', 'nikah', 'hajj', 'janaza']   # dans l'ordre d'une vie
ANNEE = ['ramadan', 'aid']
PAR_ID = {c['id']: c for c in CEREMONIES}


def fil_vie():
    """La frise « le fil d'une vie » : les cérémonies de la naissance au dernier adieu, puis celles de l'année."""
    jalons = ''.join(
        f'<li class="jalon" style="--accent:{PAR_ID[i]["accent"]}"><a href="ceremonie-{i}.html">'
        f'<span class="jalon-ar ar" lang="ar">{PAR_ID[i]["ar"]}</span>'
        f'<span class="jalon-texte"><span class="jalon-nom">{escape(cv(PAR_ID[i], "nom"))}</span>'
        f'<span class="jalon-court">{escape(cv(PAR_ID[i], "court"))}</span></span></a></li>' for i in VIE)
    annee = ''.join(
        f'<a class="saison" href="ceremonie-{i}.html" style="--accent:{PAR_ID[i]["accent"]}">'
        f'<span class="ar" lang="ar">{PAR_ID[i]["ar"]}</span><span><strong>{escape(cv(PAR_ID[i], "nom"))}</strong>'
        f'<span>{escape(cv(PAR_ID[i], "court"))}</span></span></a>' for i in ANNEE)
    return f'''<ol class="fil-vie">{jalons}</ol>
        <div class="annee"><p class="annee-titre">{t("Et chaque année", "وفي كل عام")}</p><div class="annee-saisons">{annee}</div></div>'''


def accueil():
    motifs = ''.join(carte_motif(k) for k in ('alhambra', 'iznik', 'medine', 'nuit'))
    questions = [
        (t('Les textes religieux sont-ils vérifiés ?', 'هل النصوص الدينية موثّقة؟'),
         t("Chaque verset est cité avec sa sourate et son numéro, accompagné d'une traduction. Envoyez le lien de votre composition à votre imam : il la relit avant l'impression.",
           'كل آية مذكورة بسورتها ورقمها، مع ترجمتها. أرسلوا رابط تصميمكم إلى إمامكم ليراجعه قبل الطباعة.')),
        (t('Et sans aucun verset ?', 'وبلا أي آية؟'),
         t("C'est possible : chaque motif existe sans verset ni nom divin, pour les documents destinés à être jetés (menus, étiquettes) ou selon votre sensibilité.",
           'ممكن: لكل زخرفة نسخةٌ بلا آية ولا اسمٍ من أسماء الله، للأوراق المعرّضة للإتلاف (قوائم الطعام، الملصقات) أو بحسب رغبتكم.')),
        (t('Tout en arabe ?', 'بالعربية كاملًا؟'),
         t("Oui : français, arabe, ou les deux, avec ou sans translittération. Un livret en arabe se lit de droite à gauche.",
           'نعم: بالفرنسية أو بالعربية أو بهما معًا، مع النطق اللاتيني أو بدونه. والكتيّب العربي يُقرأ من اليمين إلى اليسار.')),
        (t('Mairie avant nikâh ?', 'البلدية قبل النكاح؟'),
         t("En France, le mariage civil doit précéder la cérémonie religieuse. Un même livret peut accompagner les deux journées.",
           'في فرنسا، يجب أن يسبق الزواجُ المدني الحفلَ الديني. ويمكن لكتيّب واحد أن يرافق اليومين.')),
        (t('Et pour des funérailles ?', 'وفي حالة الجنازة؟'),
         t("Les documents de janâza passent avant tout le reste : épreuve en quelques heures, impression au plus vite.",
           'تُقدَّم أوراق الجنازة على كل ما سواها: مسودة في ساعات قليلة، وطباعة في أسرع وقت.')),
    ]
    qr = ''.join(f'<div class="qr"><p class="qr-q">{q}</p><p class="qr-r">{r}</p></div>' for q, r in questions)
    corps = f'''
    <section class="seuil">
      <div class="seuil-cote seuil-cote-g motif-couv" aria-hidden="true">{couverture('medine', MOTIFS['medine'])}</div>
      <div class="seuil-cote seuil-cote-d motif-couv" aria-hidden="true">{couverture('alhambra', MOTIFS['alhambra'])}</div>
      <div class="seuil-arc">
        <p class="seuil-nom ar" lang="ar">سكينة</p>
        <h1>{t("Les mots justes pour les moments qui comptent", "الكلمة الصادقة للحظات التي تبقى")}</h1>
        <p class="seuil-texte">{t("Livrets et papeterie pour le nikâh, l'aqîqa, le hajj, l'Aïd et chaque étape de la vie musulmane — en français, en arabe et en translittération.",
                                  'كتيّبات وأوراق لعقد النكاح والعقيقة والحج والعيد، ولكل مرحلة من حياة المسلم — بالعربية والفرنسية وبالحروف اللاتينية.')}</p>
        <div class="seuil-actions">
          <a class="btn btn-clair" href="composer.html">{t('Composer mon livret', 'صمّم كتيّبي')}</a>
          <a class="lien-clair" href="#fil">{t("Parcourir le fil d'une vie", 'تصفّح مسيرة العمر')} ↓</a>
        </div>
      </div>
    </section>

    <section class="section" id="fil">
      <div class="conteneur">
        <div class="entete-section">
          <h2>{t("Le fil d'une vie", 'مسيرة العمر')}</h2>
          <p class="chapo">{t("De la naissance au dernier adieu, chaque cérémonie a ses gestes et ses mots. Le livret les explique à vos invités, dans l'ordre où ils se vivent.",
                              'من الولادة إلى الوداع الأخير، لكل مناسبة أفعالها وكلماتها. والكتيّب يشرحها لضيوفكم بترتيبها.')}</p>
        </div>
        {fil_vie()}
      </div>
    </section>

    <section class="section section-sable">
      <div class="conteneur ecritures">
        <h2>{t('Trois écritures, une seule page', 'ثلاث كتابات في صفحة واحدة')}</h2>
        <p class="chapo">{t("Ceux qui lisent l'arabe, ceux qui le récitent sans le lire, ceux qui le découvrent : chacun suit.", 'من يقرأ العربية، ومن يردّدها دون قراءتها، ومن يكتشفها: كلٌّ يتابع.')}</p>
        <div class="ecriture-demo">
          <p class="ar" lang="ar">بَارَكَ اللَّهُ لَكُمَا</p>
          <p class="ecriture-tr" lang="fr" dir="ltr">Bâraka-llâhu lakumâ</p>
          <p class="ecriture-fr" lang="fr" dir="ltr">Que Dieu vous bénisse tous les deux</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="conteneur">
        <div class="entete-section">
          <h2>{t('Des motifs, jamais des images', 'زخارف لا صور')}</h2>
          <p class="chapo">{t("Arcs de l'Alhambra, faïences d'Iznik, étoile à huit branches : une géométrie qui élève sans rien représenter.",
                              'أقواس الحمراء، وخزف إزنيق، والنجمة الثمانية: هندسةٌ تسمو دون أن تصوّر شيئًا.')}</p>
        </div>
        <div class="grille-motifs">{motifs}</div>
        <p style="margin-top:28px"><a href="motifs.html">{t('Les huit motifs', 'الزخارف الثماني')} {t('→', '←')}</a></p>
      </div>
    </section>

    <section class="section section-sombre">
      <div class="conteneur engagement">
        <figure class="engagement-verset">
          <p class="ar" lang="ar">هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ</p>
          {t('<p class="trad">« C’est Lui qui a fait descendre la sérénité dans les cœurs des croyants. »</p>', '')}
          <figcaption class="ref">{t('Sourate Al-Fath, 48 : 4 — le verset qui nous a donné notre nom', 'سورة الفتح، الآية ٤ — ومنها اسمنا')}</figcaption>
        </figure>
        <div>
          <h2>{t('Notre éthique', 'ميثاقنا')}</h2>
          <ul class="liste-points">
            <li><span><strong>{t('Des textes justes.', 'نصوص دقيقة.')}</strong> {t("Versets et invocations avec leur référence et leur traduction, à faire relire par votre imam.", "الآيات والأدعية بمراجعها وترجمتها، تُعرض على إمامكم.")}</span></li>
            <li><span><strong>{t('Une mention de respect.', 'تنبيهٌ بالاحترام.')}</strong> {t("Au dos de chaque livret qui contient un verset, une invitation discrète à le conserver.", "على ظهر كل كتيّب فيه آية، دعوةٌ لطيفة إلى حفظه.")}</span></li>
            <li><span><strong>{t('Sans figures.', 'بلا صور.')}</strong> {t("Ni personnes ni animaux ni Lieux saints : géométrie, arabesques et calligraphie.", "لا إنسان ولا حيوان ولا أماكن مقدسة: هندسةٌ وتوريقٌ وخطّ.")}</span></li>
            <li><span><strong>{t('Toutes les traditions.', 'كل التقاليد.')}</strong> {t("Nous suivons vos usages, quelle que soit votre école ou votre origine.", "نتبع أعرافكم، أيًّا كان مذهبكم أو أصلكم.")}</span></li>
          </ul>
          <p style="margin-top:24px"><a class="lien-clair" href="respect.html">{t('Lire notre éthique', 'اقرأ ميثاقنا')} {t('→', '←')}</a></p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="conteneur">
        <div class="entete-section"><h2>{t('On nous demande souvent', 'يسألوننا كثيرًا')}</h2></div>
        <div class="qrs">{qr}</div>
      </div>
    </section>

    <section class="section section-sable appel">
      <div class="conteneur">
        <p class="appel-ar ar" lang="ar">بِسْمِ اللَّه</p>
        <h2>{t('Commencez par la première page', 'ابدأ بالصفحة الأولى')}</h2>
        <p class="chapo">{t('Répondez à quelques questions : les pages se composent au fil de vos réponses.', 'أجيبوا عن بضعة أسئلة: تتكوّن الصفحات مع كل جواب.')}</p>
        <div class="seuil-actions"><a class="btn btn-or" href="composer.html">{t('Composer mon livret', 'صمّم كتيّبي')}</a><a href="mailto:{MARQUE["email"]}">{t('ou écrivez-nous', 'أو راسلونا')}</a></div>
      </div>
    </section>'''
    page('index.html', t(f'{MARQUE["nom"]} — livrets et papeterie pour les cérémonies musulmanes', 'سكينة — كتيّبات وأوراق للمناسبات الإسلامية'),
         t("Livrets de cérémonie et papeterie pour le nikâh, l'aqîqa, le hajj, l'Aïd et la janâza, en français et en arabe, dans le respect du sacré.",
           'كتيّبات وأوراق لعقد النكاح والعقيقة والحج والعيد والجنازة، بالعربية والفرنسية، في احترامٍ للمقدّس.'),
         corps, 'index.html')


def ceremonies():
    corps = f'''
    <section class="section">
      <div class="conteneur">
        {fil(f'<a href="index.html">{t("Accueil", "الرئيسية")}</a>', t("Le fil d'une vie", 'مسيرة العمر'))}
        <div class="entete-section">
          <h1>{t("Le fil d'une vie", 'مسيرة العمر')}</h1>
          <p class="chapo">{t("Fêtes religieuses, traditions familiales ou culturelles : trouvez la vôtre. Les usages varient selon les écoles et les origines ; chaque livret se compose au plus près des vôtres.",
                              'أعيادٌ دينية، أو تقاليد عائلية أو ثقافية: اعثروا على مناسبتكم. تختلف الأعراف بحسب المذاهب والأصول، وكل كتيّب يُصاغ أقرب ما يكون إلى أعرافكم.')}</p>
        </div>
        {fil_vie()}
      </div>
    </section>'''
    page('ceremonies.html', t(f"Le fil d'une vie — {MARQUE['nom']}", 'مسيرة العمر — سكينة'),
         t('Aqîqa, khitân, khatm, henné, nikâh, hajj, janâza, Ramadan et Aïd : un livret pour chaque cérémonie.',
           'العقيقة، الختان، ختم القرآن، الحنّاء، النكاح، الحج، الجنازة، رمضان والعيد: كتيّب لكل مناسبة.'),
         corps, 'ceremonies.html')


def page_ceremonie(c):
    deroule = ''.join(f'<li><strong>{escape(ti)}</strong><span>{escape(d)}</span></li>' for ti, d in cv(c, 'deroule'))
    produits = ''.join(f'<li>{escape(p)}</li>' for p in cv(c, 'produits'))
    intro = ''.join(f'<p class="chapo">{escape(p)}</p>' for p in cv(c, 'intro'))
    motifs = ''.join(carte_motif(k, c['id']) for k in c['motifs'])
    nom = cv(c, 'nom')
    # Cérémonies voisines sur le fil de la vie (ou de l'année).
    suite = VIE if c['id'] in VIE else ANNEE
    i = suite.index(c['id'])
    voisins = ''.join(f'<a class="voisin voisin-{sens}" href="ceremonie-{v}.html"><small>{lib}</small>{escape(cv(PAR_ID[v], "nom"))}</a>'
                      for sens, lib, v in ((('prec', t('Avant', 'قبلها'), suite[i - 1]),) if i > 0 else ())
                      + ((('suiv', t('Après', 'بعدها'), suite[i + 1]),) if i + 1 < len(suite) else ()))
    corps = f'''
    <section class="ceremonie-bandeau" style="--accent:{c["accent"]}">
      <div class="conteneur">
        {fil(f'<a href="index.html">{t("Accueil", "الرئيسية")}</a>', f'<a href="ceremonies.html">{t("Le fil d’une vie", "مسيرة العمر")}</a>', escape(nom))}
        <p class="bandeau-ar ar" lang="ar">{c["ar"]}</p>
        <h1>{escape(nom)}</h1>
        <p class="bandeau-translit" lang="fr">{escape(c["translit"])}</p>
      </div>
    </section>
    <section class="section" style="--accent:{c["accent"]}">
      <div class="conteneur colonnes">
        <div>
          {intro}
          <h2 style="margin-top:36px">{t('Comment cela se passe', 'كيف تجري')}</h2>
          <ol class="deroule">{deroule}</ol>
          {citation(c)}
        </div>
        <aside>
          <div class="encadre"><h3>{t('Ce que nous préparons', 'ما نُعدّه لكم')}</h3><ul>{produits}</ul></div>
          <div class="encadre encadre-note"><h3>{t('À noter', 'للعلم')}</h3><p style="margin:0;color:var(--encre-douce);font-size:.92rem">{escape(cv(c, "note"))}</p></div>
          <a class="btn btn-or" style="width:100%" href="composer.html?c={c["id"]}">{t('Composer ce livret', 'صمّم هذا الكتيّب')}</a>
        </aside>
      </div>
    </section>
    <section class="section section-sable">
      <div class="conteneur">
        <div class="entete-section"><h2>{t('Motifs assortis', 'زخارف تناسبها')}</h2></div>
        <div class="grille-motifs">{motifs}</div>
        <nav class="voisins" aria-label="{t('Cérémonies voisines', 'مناسبات قريبة')}">{voisins}</nav>
      </div>
    </section>'''
    page(f'ceremonie-{c["id"]}.html', t(f'{c["nom"]} — livret et papeterie | {MARQUE["nom"]}', f'{nom} — كتيّب وأوراق | سكينة'),
         cv(c, 'court'), corps, 'ceremonies.html')


def motifs():
    cartes = ''.join(carte_motif(k) for k in MOTIFS)
    corps = f'''
    <section class="section">
      <div class="conteneur">
        {fil(f'<a href="index.html">{t("Accueil", "الرئيسية")}</a>', t('Motifs', 'الزخارف'))}
        <div class="entete-section">
          <h1>{t('Huit motifs', 'ثماني زخارف')}</h1>
          <p class="chapo">{t("Chaque motif s'accorde à toutes les cérémonies : couleurs, textes, langues et versets changent en quelques gestes. Aucun ne représente de personne, d'animal ni de lieu saint.",
                              'كل زخرفة تناسب جميع المناسبات: الألوان والنصوص واللغات والآيات تتغيّر بخطوات قليلة. ولا تصوّر أيٌّ منها إنسانًا ولا حيوانًا ولا مكانًا مقدّسًا.')}</p>
        </div>
        <div class="grille-motifs">{cartes}</div>
      </div>
    </section>'''
    page('motifs.html', t(f'Les motifs — {MARQUE["nom"]}', 'الزخارف — سكينة'),
         t("Huit motifs inspirés des arts de l'islam : Alhambra, Iznik, Médine, Andalousie…", 'ثماني زخارف مستوحاة من الفنون الإسلامية: الحمراء، إزنيق، المدينة، الأندلس…'),
         corps, 'motifs.html')


def respect():
    blocs = [
        (t('Les versets et les noms divins', 'الآيات وأسماء الله'), [
            t("Chaque verset est cité avec sa sourate et son numéro, en arabe vocalisé, avec une traduction en français.", 'كل آية مذكورة بسورتها ورقمها، بالعربية المشكولة، مع ترجمة إلى الفرنسية.'),
            t("Nous ne plaçons jamais un verset sur un support destiné à être jeté (menu, étiquette, emballage) sans vous le signaler.", 'لا نضع آيةً أبدًا على ورقٍ معرّض للإتلاف (قائمة طعام، ملصق، تغليف) دون أن ننبّهكم.'),
            t("Les documents qui contiennent un verset peuvent porter une mention discrète : « Ce document contient des versets du Coran : merci de le conserver ou de le confier à un recyclage respectueux. »",
              'يمكن أن تحمل الأوراق التي تتضمّن آيات تنبيهًا لطيفًا: «تتضمّن هذه الورقة آياتٍ من القرآن الكريم: يُرجى حفظها أو التخلّص منها بطريقة لائقة.»'),
            t('Chaque modèle existe en version sans verset ni nom divin.', 'لكل نموذج نسخةٌ بلا آية ولا اسمٍ من أسماء الله.'),
        ]),
        (t('Les images', 'الصور'), [
            t("Nos modèles ne représentent ni personnes ni animaux, dans la tradition de l'art islamique : géométrie, arabesques, calligraphie.", 'لا تصوّر نماذجنا إنسانًا ولا حيوانًا، على نهج الفن الإسلامي: هندسةٌ وتوريقٌ وخطّ.'),
            t("Nous ne représentons pas la Ka'ba ni les Lieux saints.", 'لا نرسم الكعبة ولا الأماكن المقدسة.'),
            t('Vos photos restent votre choix : vous pouvez en ajouter, ou non.', 'صوركم الشخصية تبقى اختياركم: يمكنكم إضافتها أو لا.'),
        ]),
        (t('Les traditions', 'التقاليد'), [
            t('Les usages varient selon les écoles juridiques et les origines : nous ne tranchons pas, nous suivons les vôtres.', 'تختلف الأعراف بحسب المذاهب الفقهية والأصول: لا نرجّح، بل نتبع أعرافكم.'),
            t("Nous recommandons de faire relire chaque livret par votre imam avant l'impression.", 'ننصح بعرض كل كتيّب على إمامكم قبل الطباعة.'),
            t('La translittération suit une convention unique et lisible (â, î, û pour les voyelles longues).', 'يتّبع النطق اللاتيني اصطلاحًا واحدًا واضحًا (â وî وû للحروف الممدودة).'),
        ]),
    ]
    html_blocs = ''.join(f'<div class="encadre"><h3>{ti}</h3><ul>{"".join(f"<li>{escape(x)}</li>" for x in li)}</ul></div>' for ti, li in blocs)
    corps = f'''
    <section class="section">
      <div class="conteneur" style="max-width:860px">
        {fil(f'<a href="index.html">{t("Accueil", "الرئيسية")}</a>', t('Notre éthique', 'ميثاقنا'))}
        <h1>{t('Notre éthique', 'ميثاقنا')}</h1>
        <p class="chapo">{t("Un livret de cérémonie porte souvent la parole de Dieu. Voici les règles que nous nous imposons, et celles que nous vous proposons.",
                            'كثيرًا ما يحمل كتيّب المناسبة كلامَ الله. هذه هي القواعد التي نلتزم بها، وتلك التي نقترحها عليكم.')}</p>
        <div style="margin-top:32px">{html_blocs}</div>
        <div class="encadre encadre-note" style="--accent:#4A5563"><h3>{t('Les funérailles', 'الجنائز')}</h3><p style="margin:0;color:var(--encre-douce)">{t("Les documents de janâza sont sobres, sans dorure, et traités en priorité. Nous ne relançons jamais une famille endeuillée et ne lui demandons pas d'avis.", 'أوراق الجنازة رصينة، بلا تذهيب، وتُعالَج بأولوية. لا نلاحق عائلةً مكلومة أبدًا، ولا نطلب منها تقييمًا.')}</p></div>
      </div>
    </section>'''
    page('respect.html', t(f'Notre éthique — {MARQUE["nom"]}', 'ميثاقنا — سكينة'),
         t('Versets vérifiés, mention de respect, modèles sans figures : notre charte.', 'آيات موثّقة، وتنبيهٌ بالاحترام، ونماذج بلا صور: ميثاقنا.'),
         corps, 'respect.html')


# ------------------------------------------------------------------ compositeur

def donnees_compositeur():
    """Données du compositeur (assets/js/donnees.js), communes aux deux langues."""
    gabarits = {}
    for cle, m in MOTIFS.items():
        g = dict(m, phrase='@@PHRASE@@', titre='@@TITRE@@', noms='@@NOMS@@', date='@@DATE@@', taille_ar='@@TAILLE@@')
        gabarits[cle] = {'svg': couverture(cle, g), 'nom_fr': m['nom'], 'nom_ar': MOTIFS_AR[cle],
                         'fond': m['fond'], 'trait': m['trait'], 'accent': m['accent'], 'texte': m['texte']}
    ceremonies = {}
    for c in CEREMONIES:
        a = CEREMONIES_AR[c['id']]
        ceremonies[c['id']] = dict(LIVRETS[c['id']], nom_fr=c['nom'], nom_ar=a['nom'], motifs=c["motifs"],
                                   deroule=[{'fr_t': f[0], 'fr_d': f[1], 'ar_t': ar[0], 'ar_d': ar[1]}
                                            for f, ar in zip(c['deroule'], a['deroule'])])
    data = {'textes': TEXTES, 'ceremonies': ceremonies, 'ordre': [c['id'] for c in CEREMONIES], 'motifs': gabarits,
            'email': MARQUE['email'], 'tarifs': TARIFS_VISTAPRINT, 'marge': MARGE, 'tva': TVA}
    (SITE / 'assets' / 'js').mkdir(parents=True, exist_ok=True)
    (SITE / 'assets' / 'js' / 'donnees.js').write_text(
        '/* Généré par build.py — ne pas modifier à la main */\nwindow.SAKINA = ' + json.dumps(data, ensure_ascii=False) + ';\n',
        encoding='utf-8')


def composer():
    """Le compositeur : une question à la fois, le livret se construit à côté."""
    r = racine()
    q = lambda n, titre, aide, contenu: f'''
          <section class="question" data-q="{n}"{'' if n == 0 else ' hidden'}>
            <p class="question-num">{chiffres(str(n + 1))} / {chiffres('8')}</p>
            <h2 class="question-titre">{titre}</h2>
            {f'<p class="question-aide">{aide}</p>' if aide else ''}
            {contenu}
          </section>'''
    questions = ''.join([
        q(0, t('Pour quelle occasion ?', 'لأيّ مناسبة؟'), t("Le déroulé, les versets et les mots d'accueil se préparent selon votre choix.", 'تُعَدّ المراحل والآيات وكلمات الترحيب بحسب اختياركم.'),
          '<div class="choix-occasions" id="f-ceremonie" role="radiogroup"></div>'),
        q(1, t('Sous quel motif ?', 'بأيّ زخرفة؟'), t('Les motifs conseillés pour votre cérémonie viennent en premier.', 'الزخارف المقترحة لمناسبتكم تأتي أولًا.'),
          '<div class="choix-motifs" id="f-motifs" role="radiogroup"></div>'),
        q(2, t('En quelle langue ?', 'بأيّ لغة؟'), t("Les versets figurent toujours en arabe ; la traduction s'ajoute en français.", 'تبقى الآيات دائمًا بالعربية؛ وتُضاف الترجمة بالفرنسية.'),
          f'''<div class="choix-langues" role="radiogroup">
              <label><input type="radio" name="langue" value="fr"><span><strong>{t('Français', 'الفرنسية')}</strong><small>{t('Versets en arabe, traduits', 'الآيات بالعربية مع ترجمتها')}</small></span></label>
              <label><input type="radio" name="langue" value="bi"><span><strong>{t('Les deux', 'اللغتان')}</strong><small>{t('Chaque texte en français et en arabe', 'كل نص بالفرنسية والعربية')}</small></span></label>
              <label><input type="radio" name="langue" value="ar"><span><strong lang="ar">العربية</strong><small>{t('Se lit de droite à gauche', 'يُقرأ من اليمين إلى اليسار')}</small></span></label>
            </div>
            <label class="case"><input type="checkbox" name="translit"> {t('Ajouter la translittération (pour réciter sans lire l’arabe)', 'إضافة النطق اللاتيني (للتلاوة دون قراءة العربية)')}</label>'''),
        q(3, t('Pour qui, et quand ?', 'لمن، ومتى؟'), '',
          f'''<label class="champ"><span id="l-noms">{t('Noms', 'الأسماء')}</span><input name="noms" maxlength="60"></label>
            <div class="champ-genre" id="champ-genre" hidden>
              <span>{t('Invocations accordées au', 'صيغة الدعاء')}</span>
              <label><input type="radio" name="genre" value="m"> {t('masculin', 'للمذكّر')}</label>
              <label><input type="radio" name="genre" value="f"> {t('féminin', 'للمؤنّث')}</label>
            </div>
            <div class="champ-duo">
              <label class="champ"><span>{t('Date', 'التاريخ')}</span><input name="date" maxlength="40"></label>
              <label class="champ"><span>{t('Lieu', 'المكان')}</span><input name="lieu" maxlength="60"></label>
            </div>
            <div class="champ-duo">
              <label class="champ"><span>{t('Titre de couverture', 'عنوان الغلاف')}</span><input name="titre" maxlength="40"></label>
              <label class="champ"><span>{t('Formule en arabe', 'العبارة العربية')}</span><input name="phrase" maxlength="40" dir="rtl" lang="ar" list="phrases"></label>
            </div>
            <datalist id="phrases"><option value="بارك الله لكما"><option value="ما شاء الله"><option value="مبروك"><option value="عيد مبارك"><option value="رمضان كريم"><option value="حج مبرور"><option value="ختم القرآن"><option value="إنا لله وإنا إليه راجعون"></datalist>'''),
        q(4, t('Que voulez-vous dire à vos invités ?', 'ماذا تقولون لضيوفكم؟'), t('Un texte est proposé : gardez-le, ou écrivez le vôtre.', 'نقترح نصًّا: احتفظوا به أو اكتبوا نصّكم.'),
          f'''<label class="case"><input type="checkbox" name="basmala"> {t('Ouvrir par la basmala', 'الافتتاح بالبسملة')} <span lang="ar">(بسم الله الرحمن الرحيم)</span></label>
            <div class="bloc-langue" data-pour="fr"><label class="champ"><span>{t("Mot d'accueil", 'كلمة الترحيب')} · FR</span><textarea name="accueil_fr" rows="3" lang="fr" dir="ltr"></textarea></label></div>
            <div class="bloc-langue" data-pour="ar"><label class="champ"><span>{t("Mot d'accueil", 'كلمة الترحيب')} · <span lang="ar">عربي</span></span><textarea name="accueil_ar" rows="3" lang="ar" dir="rtl"></textarea></label></div>
            <label class="case"><input type="checkbox" name="avec_deroule"> {t('Expliquer le déroulé de la cérémonie', 'شرح مراحل المناسبة')}</label>
            <div id="f-deroule" class="etapes-edition"></div>
            <button type="button" class="btn-petit" id="ajout-etape">+ {t('Ajouter un moment', 'إضافة لحظة')}</button>'''),
        q(5, t('Quels versets et invocations ?', 'أيّ آيات وأدعية؟'), t('Chacun est cité avec sa référence. Faites-les relire par votre imam.', 'كلٌّ منها بمرجعه. اعرضوها على إمامكم.'),
          f'''<div id="f-textes" class="liste-textes"></div>
            <button type="button" class="btn-petit" id="voir-tous">{t('Voir toute la bibliothèque', 'عرض المكتبة كاملة')}</button>'''),
        q(6, t('Comment conclure ?', 'كيف تختمون؟'), '',
          f'''<div class="bloc-langue" data-pour="fr"><label class="champ"><span>{t('Dernier mot', 'كلمة الختام')} · FR</span><textarea name="fin_fr" rows="3" lang="fr" dir="ltr"></textarea></label></div>
            <div class="bloc-langue" data-pour="ar"><label class="champ"><span>{t('Dernier mot', 'كلمة الختام')} · <span lang="ar">عربي</span></span><textarea name="fin_ar" rows="3" lang="ar" dir="rtl"></textarea></label></div>
            <label class="case"><input type="checkbox" name="mention"> {t('Au dos, la mention de respect (si le livret contient un verset)', 'على الظهر، تنبيه الاحترام (إن تضمّن الكتيّب آية)')}</label>'''),
        q(7, t('Votre livret est prêt', 'كتيّبكم جاهز'), t("Avant d'imprimer, envoyez le lien à votre imam pour qu'il relise les versets et les invocations.", 'قبل الطباعة، أرسلوا الرابط إلى إمامكم ليراجع الآيات والأدعية.'),
          f'''<div class="devis">
              <label class="champ"><span>{t('Combien d’exemplaires ?', 'كم نسخة؟')}</span><select name="quantite" id="f-quantite"></select></label>
              <p class="devis-prix" id="devis-prix" aria-live="polite"></p>
            </div>
            <div class="fin-actions">
              <button type="button" class="btn btn-or" id="partager">{t("Copier le lien pour relecture", 'نسخ الرابط للمراجعة')}</button>
              <button type="button" class="btn btn-contour" id="imprimer">{t('Enregistrer en PDF', 'حفظ بصيغة PDF')}</button>
              <a class="btn btn-contour" id="commander" href="#">{t('Le faire imprimer', 'طلب الطباعة')}</a>
            </div>
            <p class="aide" id="message" role="status"></p>
            <button type="button" class="btn-petit" id="reinitialiser">{t('Revenir aux textes proposés', 'العودة إلى النصوص المقترحة')}</button>'''),
    ])
    etoiles = ''.join(f'<li><button type="button" data-aller="{n}" aria-label="{lib}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1l2.6 3.7 4.4-.7-.7 4.4L20 10l-3.7 2.6.7 4.4-4.4-.7L10 20l-2.6-3.7-4.4.7.7-4.4L0 10l3.7-2.6-.7-4.4 4.4.7z"/></svg></button></li>'
                      for n, lib in enumerate([t('Occasion', 'المناسبة'), t('Motif', 'الزخرفة'), t('Langue', 'اللغة'), t('Noms', 'الأسماء'),
                                               t('Accueil', 'الترحيب'), t('Versets', 'الآيات'), t('Conclusion', 'الختام'), t('Prêt', 'جاهز')]))
    corps = f'''
    <section class="composer" data-langue-site="{L}">
      <div class="composer-grille">
        <div class="composer-guide">
          <h1 class="visuellement-cache">{t('Composer un livret', 'تصميم كتيّب')}</h1>
          <ol class="etoiles" id="progression">{etoiles}</ol>
          <form id="compo-form" autocomplete="off">
            {questions}
            <div class="question-nav">
              <button type="button" class="btn-petit" id="precedent">{t('← Retour', 'رجوع →')}</button>
              <button type="button" class="btn btn-or" id="suivant">{t('Continuer', 'متابعة')}</button>
            </div>
          </form>
        </div>
        <div class="compo-apercu">
          <div class="apercu-barre"><span id="nb-pages"></span><span class="aide">A5 · 148 × 210 mm</span></div>
          <div class="apercu-pages" id="apercu" aria-live="polite"></div>
        </div>
      </div>
    </section>'''
    scripts = (f'<script src="{r}assets/js/donnees.js?v={version("site/assets/js/donnees.js")}"></script>\n'
               f'<script src="{r}assets/js/composer.js?v={version("assets/js/composer.js")}"></script>')
    page('composer.html', t(f'Composer un livret — {MARQUE["nom"]}', 'تصميم كتيّب — سكينة'),
         t('Composez en ligne votre livret de cérémonie : nikâh, aqîqa, hajj, Aïd, janâza… En français, en arabe ou les deux, avec versets et invocations référencés.',
           'صمّم كتيّب مناسبتك عبر الإنترنت: النكاح، العقيقة، الحج، العيد، الجنازة… بالعربية أو بالفرنسية أو بهما معًا، مع آيات وأدعية موثّقة.'),
         corps, 'composer.html', scripts)


# ------------------------------------------------------------------ charte graphique (français seulement)

def charte():
    couleurs = [
        ('Bleu de nuit', '#0F2747', 'Fonds sombres, titres, pied de page.'),
        ('Bleu de cobalt', '#1F4E9C', "Boutons, liens, mots en couleur — le bleu des faïences d'Iznik (contraste 7:1)."),
        ('Turquoise', '#2E9C95', 'Motifs, filets, signe.'),
        ('Turquoise profond', '#11706B', 'Surtitres et accents de texte.'),
        ('Turquoise clair', '#A8DCD5', 'Motifs et texte d\'accent sur fond sombre.'),
        ('Rouge corail', '#C2412D', "Accent rare, emprunté aux carreaux d'Iznik : puces, détails."),
        ('Blanc de chaux', '#EEF4F1', 'Fond principal : un blanc froid, à peine céladon.'),
        ('Céladon', '#DCEAE6', 'Sections alternées.'),
        ('Blanc', '#FFFFFF', 'Cartes et encadrés.'),
        ('Encre', '#14202E', 'Texte courant.'),
        ('Ardoise', '#4A5563', "Janâza : sobriété, sans couleur vive."),
    ]
    nuancier = ''.join(f'<div class="nuance"><span style="background:{h}"></span><strong>{escape(n)}</strong><code>{h}</code><small>{escape(u)}</small></div>' for n, h, u in couleurs)
    accents = ''.join(f'<div class="nuance"><span style="background:{c["accent"]}"></span><strong>{escape(c["nom"])}</strong><code>{c["accent"]}</code></div>' for c in CEREMONIES)
    etoile_svg = f'<svg viewBox="0 0 120 120" width="120"><polygon points="{etoile(60, 60, 52)}" fill="none" stroke="#2E9C95" stroke-width="1.5"/><polygon points="{etoile(60, 60, 34)}" fill="none" stroke="#1F4E9C" stroke-width="1"/><circle cx="60" cy="60" r="8" fill="#C2412D"/></svg>'
    arc_svg = f'<svg viewBox="0 0 100 130" width="96"><path d="{arc_brise(4, 4, 92, 122)}Z" fill="#0F2747"/><path d="{arc_brise(14, 18, 72, 106)}" fill="none" stroke="#A8DCD5" stroke-width="1"/></svg>'
    corps = f'''
    <style>
      .charte-bloc {{ margin-top: 56px; }}
      .nuancier {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; margin-top: 20px; }}
      .nuance {{ display: grid; gap: 4px; padding: 12px; background: var(--blanc); border: 1px solid var(--filet); border-radius: var(--r); font-size: .85rem; }}
      .nuance span {{ height: 72px; border-radius: 10px; border: 1px solid var(--filet); }}
      .nuance code {{ color: var(--encre-douce); }} .nuance small {{ color: var(--encre-douce); }}
      .specimens {{ display: grid; gap: 16px; margin-top: 20px; }}
      .specimen {{ display: grid; grid-template-columns: 200px 1fr; gap: 20px; align-items: baseline; padding: 20px; background: var(--blanc); border: 1px solid var(--filet); border-radius: var(--r); }}
      .specimen small {{ color: var(--encre-douce); display: block; }}
      @media (max-width: 700px) {{ .specimen {{ grid-template-columns: 1fr; }} }}
      .motifs {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 20px; }}
      .motif-case {{ display: grid; place-items: center; gap: 12px; padding: 28px 16px; background: var(--blanc); border: 1px solid var(--filet); border-radius: var(--r); text-align: center; font-size: .88rem; color: var(--encre-douce); }}
      .motif-case strong {{ color: var(--nuit); }}
      .faire {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }}
      .faire div {{ padding: 22px; border-radius: var(--r); background: var(--blanc); border: 1px solid var(--filet); }}
      .faire h3 {{ font-size: 1.1rem; }} .faire ul {{ margin: 0; padding-inline-start: 1.1em; display: grid; gap: 8px; color: var(--encre-douce); font-size: .92rem; }}
      @media (max-width: 700px) {{ .faire {{ grid-template-columns: 1fr; }} }}
      .logos {{ display: flex; flex-wrap: wrap; gap: 16px; margin-top: 20px; }}
      .logos > div {{ display: grid; place-items: center; min-width: 240px; padding: 32px; border-radius: var(--r); border: 1px solid var(--filet); }}
    </style>
    <section class="section">
      <div class="conteneur">
        {fil('<a href="index.html">Accueil</a>', 'Charte graphique')}
        <h1>{MARQUE["nom"]} <span class="ar" lang="ar" style="color:var(--or-fonce)">{MARQUE["nom_ar"]}</span></h1>
        <p class="chapo">Une identité inspirée des arts de l'islam — l'arc du mihrab, l'étoile à huit branches, le bleu et la turquoise des faïences d'Iznik —
        fraîche, lumineuse et respectueuse. Le nom vient du Coran : la <em>sakîna</em>, la sérénité que Dieu fait descendre dans les cœurs (48 : 4).</p>

        <div class="charte-bloc">
          <h2>Le signe</h2>
          <p class="chapo">Un arc brisé (le mihrab, qui oriente la prière) abrite l'étoile à huit branches (le khâtam), motif fondateur de la géométrie islamique.</p>
          <div class="logos">
            <div style="background:var(--sable)"><span class="marque" style="pointer-events:none">{marque(False)}</span></div>
            <div style="background:var(--nuit)"><span class="marque" style="color:#FFFFFF;pointer-events:none">{logo(couleur="#FFFFFF", or_="#A8DCD5")}<span><span class="marque-nom">{MARQUE["nom"]}</span><span class="marque-sous" style="color:#A9B2C0">{MARQUE["sous_titre"]}</span></span></span></div>
            <div style="background:var(--blanc)">{logo(classe="", couleur="#12233F").replace('<svg ', '<svg width="72" ')}</div>
          </div>
        </div>

        <div class="charte-bloc">
          <h2>Les couleurs</h2>
          <p class="chapo">La palette des faïences d'Iznik : bleu de cobalt et turquoise sur un blanc de chaux, avec le rouge corail en touche rare. Pas d'or, pas d'ivoire.</p>
          <div class="nuancier">{nuancier}</div>
          <h3 style="margin-top:32px">Une couleur par cérémonie</h3>
          <div class="nuancier">{accents}</div>
        </div>

        <div class="charte-bloc">
          <h2>La typographie</h2>
          <div class="specimens">
            <div class="specimen"><div><strong>Marcellus</strong><small>Titres — capitales lapidaires, douceur des empattements</small></div><p style="font-family:var(--f-titre);font-size:2rem;margin:0;color:var(--nuit)">Nikâh de Yasmine & Karim</p></div>
            <div class="specimen"><div><strong>Manrope</strong><small>Texte courant et interface</small></div><p style="margin:0">Le nikâh est le contrat de mariage en islam, scellé par le consentement libre des deux époux.</p></div>
            <div class="specimen"><div><strong>Amiri</strong><small>Arabe : versets, invocations (naskh classique, vocalisation complète)</small></div><p class="ar" lang="ar" style="font-size:1.9rem;margin:0;color:var(--nuit)">وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً</p></div>
            <div class="specimen"><div><strong>IBM Plex Sans Arabic</strong><small>Texte courant et interface du site en arabe</small></div><p lang="ar" dir="rtl" style="font-family:var(--f-texte-ar);margin:0">النكاح هو عقد الزواج في الإسلام، ويقوم على الرضا الحرّ من الزوجين.</p></div>
            <div class="specimen"><div><strong>Reem Kufi</strong><small>Arabe décoratif : titres du site en arabe, jamais pour un verset</small></div><p class="ar kufi" lang="ar" style="font-size:2rem;margin:0;color:var(--emeraude)">عيد مبارك</p></div>
          </div>
        </div>

        <div class="charte-bloc">
          <h2>Les motifs</h2>
          <div class="motifs">
            <div class="motif-case">{etoile_svg}<strong>L'étoile à huit branches</strong>Médaillons, puces, séparateurs.</div>
            <div class="motif-case">{arc_svg}<strong>L'arc brisé</strong>Cadres, masques d'images, puces.</div>
            <div class="motif-case"><div style="width:100%;height:120px;background:var(--sable);background-image:var(--motif-etoile);border-radius:10px"></div><strong>La trame étoilée</strong>Fonds, à 35 % d'opacité au plus.</div>
            <div class="motif-case"><div class="frise" style="width:100%"></div><strong>La frise</strong>Séparation entre deux sections.</div>
          </div>
        </div>

        <div class="charte-bloc">
          <h2>Les règles</h2>
          <div class="faire">
            <div><h3>À faire</h3><ul>
              <li>Citer chaque verset avec sa référence (sourate : verset) et sa traduction.</li>
              <li>Vocaliser l'arabe des versets ; écrire l'arabe en Amiri, de droite à gauche.</li>
              <li>Translittérer avec â, î, û (voyelles longues) et l'apostrophe pour la hamza ('ayn compris).</li>
              <li>Laisser respirer : marges généreuses, un seul motif par composition.</li>
              <li>Pour la janâza : ardoise et blanc, sans couleur vive ni ornement.</li>
              <li>Sur le site en arabe : jamais d'espacement entre les lettres (il casse les liaisons).</li>
            </ul></div>
            <div><h3>À éviter</h3><ul>
              <li>Toute figure humaine ou animale, toute représentation de la Ka'ba ou des Lieux saints.</li>
              <li>Un verset en pied de page, au dos, ou sur un support jetable.</li>
              <li>Le Reem Kufi pour un verset ; l'arabe en italique ou étiré artificiellement.</li>
              <li>Le vert « drapeau » ; les clichés orientalistes (lanternes partout, dômes).</li>
              <li>L'or, l'ivoire et le crème : ils n'appartiennent pas à cette identité.</li>
            </ul></div>
          </div>
        </div>

        <div class="charte-bloc">
          <h2>Le ton</h2>
          <p class="chapo">Chaleureux, respectueux, jamais prosélyte. On explique sans juger, on propose sans imposer — « selon les écoles », « selon vos usages ».
          On écrit « Dieu » en français et « Allah » dans les formules translittérées.</p>
        </div>
      </div>
    </section>'''
    page('charte-graphique.html', f'Charte graphique — {MARQUE["nom"]}', "Signe, couleurs, typographies et motifs de l'identité Sakîna.", corps)


def favicon():
    (SITE / 'assets' / 'img').mkdir(parents=True, exist_ok=True)
    (SITE / 'assets' / 'img' / 'favicon.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48"><rect width="40" height="48" rx="6" fill="#0F2747"/>'
        f'<path d="{arc_brise(6, 5, 28, 38)}Z" fill="none" stroke="#FFFFFF" stroke-width="2"/>'
        f'<polygon points="{etoile(20, 28, 7)}" fill="#A8DCD5"/></svg>', encoding='utf-8')


def generer(langue):
    global L
    L = langue
    accueil()
    ceremonies()
    for c in CEREMONIES:
        page_ceremonie(c)
    motifs()
    respect()
    composer()
    if langue == 'fr':
        charte()


if __name__ == '__main__':
    if SITE.exists():
        shutil.rmtree(SITE)   # dossier entièrement généré : rien d'autre n'y vit
    (SITE / 'ar').mkdir(parents=True)
    shutil.copytree(RACINE / 'assets' / 'css', SITE / 'assets' / 'css')
    shutil.copytree(RACINE / 'assets' / 'js', SITE / 'assets' / 'js')
    favicon()
    donnees_compositeur()
    PAGES_AR.update(['index.html', 'ceremonies.html', 'motifs.html', 'respect.html', 'composer.html']
                    + [f'ceremonie-{c["id"]}.html' for c in CEREMONIES])
    generer('fr')
    generer('ar')
    print('Pages générées :', len(list(SITE.glob('*.html'))), 'en français,', len(list((SITE / 'ar').glob('*.html'))), 'en arabe')
