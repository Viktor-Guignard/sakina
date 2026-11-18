"""Modèles du compositeur : les pièces que l'on peut composer, en plus du livret
de cérémonie (livrets.py).

Deux familles :
- « livret » : brochure A5 agrafée (multiple de 4 pages), comme le livret de
  cérémonie, avec un contenu propre (carnet du pèlerin, 30 nuits…) ;
- « carte » : papeterie à une ou deux faces (faire-part, menu, marque-page…).

Pour chaque modèle : les cérémonies où il est proposé, le format en mm, les
textes proposés (FR et AR) qui remplacent ceux du livret de cérémonie, et, pour
les livrets, les pages à remplir à la main (« pages libres »).

TOUT EST À FAIRE RELIRE (textes arabes, déroulé de la prière de l'Aïd, juz').
"""

# Les 30 juz' du Coran : sourate et verset de départ (mushaf de Médine).
JUZ = [
    ('Al-Fâtiha', 'الفاتحة', 1), ('Al-Baqara', 'البقرة', 142), ('Al-Baqara', 'البقرة', 253),
    ("Âl 'Imrân", 'آل عمران', 93), ("An-Nisâ'", 'النساء', 24), ("An-Nisâ'", 'النساء', 148),
    ("Al-Mâ'ida", 'المائدة', 82), ("Al-An'âm", 'الأنعام', 111), ("Al-A'râf", 'الأعراف', 88),
    ('Al-Anfâl', 'الأنفال', 41), ('At-Tawba', 'التوبة', 93), ('Hûd', 'هود', 6),
    ('Yûsuf', 'يوسف', 53), ('Al-Hijr', 'الحجر', 1), ("Al-Isrâ'", 'الإسراء', 1),
    ('Al-Kahf', 'الكهف', 75), ("Al-Anbiyâ'", 'الأنبياء', 1), ("Al-Mu'minûn", 'المؤمنون', 1),
    ('Al-Furqân', 'الفرقان', 21), ('An-Naml', 'النمل', 56), ("Al-'Ankabût", 'العنكبوت', 46),
    ('Al-Ahzâb', 'الأحزاب', 31), ('Yâ-Sîn', 'يس', 28), ('Az-Zumar', 'الزمر', 32),
    ('Fussilat', 'فصلت', 47), ('Al-Ahqâf', 'الأحقاف', 1), ('Adh-Dhâriyât', 'الذاريات', 31),
    ('Al-Mujâdala', 'المجادلة', 1), ('Al-Mulk', 'الملك', 1), ("An-Naba'", 'النبأ', 1),
]

TOUTES = ['nikah', 'aqiqa', 'khitan', 'khatm', 'hajj', 'ramadan', 'aid', 'henne', 'janaza']
FETES = [c for c in TOUTES if c != 'janaza']

# Ce que l'on fête, pour les invitations : « … vous convier à {occasion} ».
OCCASIONS = {
    'nikah':   ('la célébration de notre nikâh', 'حفل عقد قراننا'),
    'aqiqa':   ("l'aqîqa de notre enfant", 'عقيقة مولودنا'),
    'khitan':  ('la fête du khitân', 'حفل الختان'),
    'khatm':   ("la fête du khatm al-Qur'ân", 'الاحتفاء بختم القرآن'),
    'hajj':    ('fêter le retour de notre pèlerin', 'الاحتفاء بعودة حاجّنا'),
    'ramadan': ('rompre le jeûne à notre table', 'الإفطار على مائدتنا'),
    'aid':     ("fêter l'Aïd avec nous", 'الاحتفال بالعيد معنا'),
    'henne':   ('la soirée du henné', 'ليلة الحنّاء'),
}

# Champs communs : t = titre de couverture, a = accueil (ou message), f = mot de fin,
# d = déroulé (liste de (titre, texte) FR puis AR), x = textes proposés, n = textes cochés.
MODELES = {
    # ------------------------------------------------------------------ livrets A5
    'livret': {
        'famille': 'livret', 'format': (148, 210), 'ceremonies': TOUTES,
        'nom_fr': 'Livret de cérémonie', 'nom_ar': 'كتيّب المناسبة',
        'court_fr': 'Le fil de la cérémonie, les versets et leur traduction.',
        'court_ar': 'سير المناسبة والآيات وترجمتها.',
    },
    'pelerin': {
        'famille': 'livret', 'format': (148, 210), 'ceremonies': ['hajj'],
        'nom_fr': 'Carnet du pèlerin', 'nom_ar': 'دفتر الحاجّ',
        'court_fr': 'Les invocations du voyage, et des pages où les proches confient leurs du‘â’.',
        'court_ar': 'أدعية السفر، وصفحاتٌ يكتب فيها الأحباب ما يوصون به من دعاء.',
        't': ('Carnet du pèlerin', 'دفتر الحاجّ'),
        'a': ('Ce carnet part avec {noms}. Avant le départ, chacun y écrit les invocations qu’il lui confie : elles seront dites là-bas.',
              'يرافق هذا الدفتر {noms} في رحلته. قبل السفر، يكتب فيه كلٌّ ما يوصيه به من دعاء، ليُدعى به هناك.'),
        'f': ('Hajj mabrûr, sa‘y mashkûr : un pèlerinage accepté, un effort récompensé.', 'حجٌّ مبرور، وسعيٌ مشكور، وذنبٌ مغفور.'),
        'x': ['zukhruf13', 'talbiya', 'baqara201', 'hajj27', 'fatiha'], 'n': 4, 'avec_deroule': False,
        'libres': {'gabarit': 'entrees', 'min': 2, 'max': 12, 'defaut': 4,
                   'titre_fr': 'Les du‘â’ qu’on vous confie', 'titre_ar': 'أدعيةٌ أوصاكم بها أحبابكم',
                   'champ_fr': 'De la part de', 'champ_ar': 'من'},
    },
    'nuits': {
        'famille': 'livret', 'format': (148, 210), 'ceremonies': ['ramadan'],
        'nom_fr': 'Les 30 nuits de Ramadan', 'nom_ar': 'ثلاثون ليلة من رمضان',
        'court_fr': 'Une page par nuit : le juz’ du jour, le jeûne, la prière, l’aumône, et une ligne pour soi.',
        'court_ar': 'لكل ليلة موضع: جزء اليوم، والصيام، والتراويح، والصدقة، وسطرٌ للنفس.',
        't': ('30 nuits de Ramadan', 'ثلاثون ليلة'),
        'a': ('Un juz’ par jour, et le Coran est lu en entier avant l’Aïd. Cochez au fil des jours, et notez une intention, une invocation, un souvenir.',
              'جزءٌ كلّ يوم، فيُختم القرآن قبل العيد. علّموا على ما أنجزتم يومًا بعد يوم، ودوّنوا نيّةً أو دعاءً أو ذكرى.'),
        'f': ('Que Dieu accepte notre jeûne et nos prières.', 'تقبّل الله صيامنا وقيامنا.'),
        'x': ['baqara185', 'dua_iftar', 'baqara186'], 'n': 2, 'avec_deroule': False, 'nuits': True,
    },
    'priere_aid': {
        'famille': 'livret', 'format': (148, 210), 'ceremonies': ['aid'],
        'nom_fr': 'La prière de l’Aïd', 'nom_ar': 'صلاة العيد',
        'court_fr': 'Les gestes de la prière de l’Aïd expliqués simplement, et le takbîr à réciter.',
        'court_ar': 'شرحٌ ميسّر لصلاة العيد، والتكبيرات.',
        't': ('La prière de l’Aïd', 'صلاة العيد'),
        'a': ('Ce livret accompagne ceux qui découvrent la prière de l’Aïd, ou qui veulent suivre chaque geste avec l’imam.',
              'يرافق هذا الكتيّب من يشهد صلاة العيد أوّل مرّة، أو من يريد متابعتها مع الإمام.'),
        'f': ('Taqabbala-llâhu minnâ wa minkum. — {noms}', 'تقبّل الله منّا ومنكم. — {noms}'),
        'x': ['takbir', 'taqabbal', 'fatiha'], 'n': 2, 'avec_deroule': True,
        'titre_deroule': ('La prière, geste par geste', 'الصلاة خطوةً خطوة'),
        'd': [
            (('Le takbîr du matin', 'Dès le lever, et sur le chemin de la mosquée, on répète le takbîr à voix basse ou haute.'),
             ('تكبيرات الصباح', 'من الصباح وفي الطريق إلى المصلّى، يُردَّد التكبير سرًّا أو جهرًا.')),
            (('La zakât al-fitr', 'Pour l’Aïd al-Fitr, elle est versée avant la prière, pour que chacun puisse fêter ce jour.'),
             ('زكاة الفطر', 'في عيد الفطر تُخرَج قبل الصلاة، ليفرح الجميع بهذا اليوم.')),
            (('Deux rak‘a, sans adhân', 'La prière compte deux unités, sans appel ni iqâma.'),
             ('ركعتان بلا أذان', 'الصلاة ركعتان، بلا أذانٍ ولا إقامة.')),
            (('Les takbîr de la prière', 'Des takbîr s’ajoutent au début de chaque rak‘a ; leur nombre varie selon les écoles : on suit l’imam.'),
             ('التكبيرات الزوائد', 'تُزاد تكبيراتٌ في أوّل كلّ ركعة، ويختلف عددها بين المذاهب: نتبع الإمام.')),
            (('La khutba', 'Après la prière, l’imam prononce le sermon : on l’écoute avant de se saluer.'),
             ('الخطبة', 'بعد الصلاة يخطب الإمام: نستمع إليه ثم نتبادل التهاني.')),
            (('Les vœux', '« Taqabbala-llâhu minnâ wa minkum » : puis on rend visite aux proches.'),
             ('التهاني', '«تقبّل الله منّا ومنكم»، ثم نزور الأهل والأرحام.')),
        ],
    },
    'prenom': {
        'famille': 'livret', 'format': (148, 210), 'ceremonies': ['aqiqa'],
        'nom_fr': 'Le livret du prénom', 'nom_ar': 'كتيّب الاسم',
        'court_fr': 'Le prénom et son sens, la naissance, les invocations, et des pages pour les mots des proches.',
        'court_ar': 'الاسم ومعناه، والولادة، والأدعية، وصفحاتٌ لكلمات الأحباب.',
        't': ('Bienvenue', 'أهلًا وسهلًا'),
        'a': ('Al-hamdu li-llâh : {noms} est arrivé parmi nous. Voici son prénom, ce qu’il veut dire, et les premiers mots de ceux qui l’aiment.',
              'الحمد لله على قدوم {noms}. هذا اسمه ومعناه، وأولى كلمات من يحبّونه.'),
        'f': ('Que Dieu fasse grandir {noms} dans la paix et la lumière.', 'أنبت الله {noms} نباتًا حسنًا.'),
        'x': ['formule_aqiqa', 'imran38', 'ibrahim40', 'furqan74'], 'n': 2, 'avec_deroule': True,
        'titre_deroule': ('Son prénom, son histoire', 'اسمه وحكايته'),
        'd': [
            (('Le sens du prénom', 'Ce que veut dire son prénom, et pourquoi vous l’avez choisi.'),
             ('معنى الاسم', 'ما يعنيه اسمه، ولماذا اخترتموه.')),
            (('Sa naissance', 'Le jour, l’heure et le lieu de sa naissance.'),
             ('ولادته', 'يوم ولادته وساعتها ومكانها.')),
            (('Ses parents', 'Les prénoms de ses parents, de ses frères et sœurs.'),
             ('والداه', 'اسما والديه وأسماء إخوته وأخواته.')),
            (('Son aqîqa', 'Le jour où l’on a fêté sa venue, et ceux qui étaient là.'),
             ('عقيقته', 'يوم الاحتفاء بقدومه، ومن حضر.')),
        ],
        'libres': {'gabarit': 'entrees', 'min': 2, 'max': 12, 'defaut': 4,
                   'titre_fr': 'Des mots pour {noms}', 'titre_ar': 'كلماتٌ إلى {noms}',
                   'champ_fr': 'De la part de', 'champ_ar': 'من'},
    },
    'condoleances': {
        'famille': 'livret', 'format': (148, 210), 'ceremonies': ['janaza'],
        'nom_fr': 'Registre de condoléances', 'nom_ar': 'سجلّ التعازي',
        'court_fr': 'Un registre sobre où chacun laisse son nom et une invocation pour le défunt.',
        'court_ar': 'سجلٌّ هادئ يترك فيه كلٌّ اسمه ودعاءً للفقيد.',
        't': ('In memoriam', 'في ذكرى'),
        'a': ('Laissez ici votre nom et, si vous le souhaitez, une invocation pour {noms}. La famille les lira dans les jours qui viennent.',
              'اتركوا هنا أسماءكم، ودعاءً لِـ{noms} إن شئتم. ستقرؤها العائلة في الأيام القادمة.'),
        'f': ('', ''),
        'x': ['inna_lillah', 'dua_defunt', 'fajr27', 'imran185'], 'n': 2, 'avec_deroule': False,
        'libres': {'gabarit': 'registre', 'min': 4, 'max': 20, 'defaut': 8,
                   'titre_fr': 'Vos mots pour {noms}', 'titre_ar': 'كلماتكم لِـ{noms}',
                   'champ_fr': 'Nom', 'champ_ar': 'الاسم'},
    },

    # ------------------------------------------------------------------ papeterie
    'faire_part': {
        'famille': 'carte', 'format': (105, 148), 'faces': 2, 'ceremonies': ['nikah', 'aqiqa'],
        'nom_fr': 'Faire-part', 'nom_ar': 'بطاقة إعلان',
        'court_fr': 'A6, recto verso : l’annonce, la date, et un verset au dos.',
        'court_ar': 'مقاس A6، على الوجهين: الإعلان والتاريخ، وآيةٌ على الظهر.',
        'a_par': {
            'nikah': ('Avec la grâce de Dieu, {noms} ont la joie de vous annoncer leur union.', 'بفضل الله، يسرّ {noms} أن يعلنا لكم زواجهما.'),
            'aqiqa': ('Al-hamdu li-llâh : nous avons la joie de vous annoncer la naissance de {noms}.', 'الحمد لله، يسرّنا أن نعلن لكم ولادة {noms}.'),
        },
        'n': 1,
    },
    'invitation': {
        'famille': 'carte', 'format': (105, 148), 'faces': 2, 'ceremonies': FETES,
        'nom_fr': 'Invitation', 'nom_ar': 'دعوة',
        'court_fr': 'A6, recto verso : qui invite, à quoi, où et quand.',
        'court_ar': 'مقاس A6، على الوجهين: من يدعو، وإلى ماذا، وأين ومتى.',
        'a': ('Nous avons le plaisir de vous convier à {occasion}.', 'يسعدنا أن ندعوكم إلى {occasion}.'),
        'n': 0,
    },
    'menu': {
        'famille': 'carte', 'format': (99, 210), 'faces': 1, 'ceremonies': ['nikah', 'aqiqa', 'khitan', 'khatm', 'ramadan', 'aid', 'henne', 'hajj'],
        'nom_fr': 'Menu', 'nom_ar': 'قائمة الطعام',
        'court_fr': 'Format long (99 × 210 mm), à poser sur chaque assiette.',
        'court_ar': 'مقاسٌ طويل (٩٩ × ٢١٠ مم)، يوضع على كل صحن.',
        't': ('Menu', 'قائمة الطعام'), 'a': ('', ''), 'n': 0, 'avec_deroule': True,
        'titre_deroule': ('Les plats', 'الأطباق'),
        'd': [
            (('Pour commencer', 'Dattes, lait, soupe'), ('للبداية', 'تمر، حليب، شوربة')),
            (('Le plat', 'Couscous aux sept légumes'), ('الطبق الرئيسي', 'كسكس بالخضار السبع')),
            (('Le dessert', 'Pâtisseries et fruits de saison'), ('الحلوى', 'حلويات وفواكه الموسم')),
            (('Le thé', 'Thé à la menthe et douceurs'), ('الشاي', 'شاي بالنعناع وحلويات')),
        ],
    },
    'remerciement': {
        'famille': 'carte', 'format': (148, 105), 'faces': 2, 'ceremonies': TOUTES,
        'nom_fr': 'Carte de remerciement', 'nom_ar': 'بطاقة شكر',
        'court_fr': 'A6 à l’italienne, recto verso, à glisser avec un cadeau ou à envoyer après la fête.',
        'court_ar': 'مقاس A6 بالعرض، على الوجهين، تُرفق بهديةٍ أو تُرسل بعد الحفل.',
        'a': ('Jazâkumu-llâhu khayran : que Dieu vous rende chacune de vos attentions.', 'جزاكم الله خيرًا على كلّ لفتةٍ طيّبة.'),
        'a_par': {'janaza': ('Votre soutien nous a portés dans l’épreuve : que Dieu vous en récompense.',
                             'كان سندُكم عونًا لنا في المصاب، جزاكم الله خيرًا.')},
        't': ('Jazâkum Allâh khayran', 'جزاكم الله خيرًا'), 'n': 0,
    },
    'etiquette': {
        'famille': 'carte', 'format': (50, 50), 'faces': 1, 'rond': True,
        'ceremonies': ['nikah', 'aqiqa', 'khitan', 'khatm', 'hajj', 'ramadan', 'aid', 'henne'],
        'nom_fr': 'Étiquettes rondes', 'nom_ar': 'ملصقات دائرية',
        'court_fr': 'Ø 50 mm, pour les dragées, les paniers, les cadeaux.',
        'court_ar': 'قطر ٥٠ مم، للحلوى والسلال والهدايا.',
        'a': ('', ''), 'n': 0,
    },
    'marque_page': {
        'famille': 'carte', 'format': (50, 150), 'faces': 2, 'ceremonies': TOUTES,
        'nom_fr': 'Marque-page à verset', 'nom_ar': 'فاصل كتاب بآية',
        'court_fr': '50 × 150 mm : le motif d’un côté, un verset et sa référence de l’autre.',
        'court_ar': '٥٠ × ١٥٠ مم: الزخرفة على وجه، وآيةٌ بمرجعها على الآخر.',
        'a': ('', ''), 'n': 1,
    },
    'certificat': {
        'famille': 'carte', 'format': (297, 210), 'faces': 1, 'ceremonies': ['khatm'],
        'nom_fr': 'Certificat de khatm', 'nom_ar': 'شهادة ختم القرآن',
        'court_fr': 'A4 à l’italienne : à remettre au lecteur, signé par son enseignant.',
        'court_ar': 'مقاس A4 بالعرض: يُسلَّم للقارئ بتوقيع معلّمه.',
        't': ("Certificat de khatm al-Qur'ân", 'شهادة ختم القرآن الكريم'),
        'a': ('qui a achevé la lecture du Coran, de la première à la dernière sourate, avec l’aide de Dieu.',
              'لإتمام قراءة القرآن الكريم كاملًا، من أوّله إلى آخره، بتوفيق الله.'),
        'x': ['khayrukum', 'qamar17', 'taha114'], 'n': 1,
        'signatures': [('L’enseignant', 'المعلّم'), ('Les parents', 'الوالدان')],
    },
}

# Prix de la papeterie : à relever chez Vistaprint (mêmes règles que les livrets :
# MARGE × prix HT, TVA en plus). Tant qu'un modèle n'a pas de grille, il est « sur devis ».
TARIFS_PAPETERIE = {
    # 'faire_part': {10: 0.0, 25: 0.0, 50: 0.0, 100: 0.0, ...},
}
QUANTITES_PAPETERIE = [10, 25, 50, 100, 150, 200, 250, 500]
