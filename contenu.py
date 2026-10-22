"""Contenu du site Sakîna : marque, cérémonies, modèles.

Les textes arabes se limitent à des formules et des versets très connus,
avec leur référence. À FAIRE RELIRE par un imam ou un arabisant avant mise en
ligne (voir respect.html : c'est aussi ce que l'on conseille aux clients).
"""

MARQUE = {
    'nom': 'Sakîna',
    'nom_ar': 'سكينة',
    'sous_titre': 'Livrets & papeterie de cérémonie',
    'domaine': 'sakina-livrets.fr',          # provisoire
    'email': 'bonjour@sakina-livrets.fr',     # provisoire
}

# Couleur d'accent par cérémonie (voir la charte graphique).
CEREMONIES = [
    {
        'id': 'nikah', 'nom': 'Nikah & walima', 'ar': 'نكاح', 'translit': 'Nikâh',
        'accent': '#1F4E9C',
        'court': 'Le mariage religieux, contrat béni devant Dieu et devant témoins, puis le repas de noces.',
        'intro': [
            "Le nikâh est le contrat de mariage en islam : un engagement pris devant Dieu et devant témoins, "
            "scellé par le consentement libre des deux époux. Il est le plus souvent suivi de la walîma, le repas "
            "de noces qui annonce l'union aux proches et à la communauté.",
            "Beaucoup d'invités découvrent le nikâh pour la première fois : un livret qui explique chaque moment, "
            "avec les versets, leur traduction et une translittération, permet à chacun de suivre et de s'associer aux invocations.",
        ],
        'deroule': [
            ('Accueil des familles', "Les proches se réunissent à la mosquée, à la maison ou dans la salle de réception."),
            ('Khutbat an-nikâh', "Le sermon du mariage, souvent ouvert par la khutbat al-hâja, rappelle le sens de l'union."),
            ('Le mahr', "Le don nuptial, choisi par l'épouse et remis par l'époux, est mentionné devant l'assemblée."),
            ('Les consentements', "L'offre et l'acceptation (îjâb et qabûl) sont prononcées en présence des témoins — et du tuteur (walî) selon les écoles."),
            ('Invocations pour les mariés', "« Que Dieu vous bénisse et répande sur vous Sa bénédiction, et qu'Il vous unisse dans le bien. »"),
            ('La walîma', "Le repas de noces, offert par les mariés et leurs familles."),
        ],
        'produits': ['Livret de cérémonie (déroulé, versets, traductions)', 'Faire-part et invitations', 'Menu de la walîma',
                     'Plan de table et signalétique', 'Cartes de remerciement'],
        'note': "En France, le mariage civil à la mairie doit précéder la cérémonie religieuse. Les usages varient "
                "selon les écoles et les origines : nos modèles se composent librement, pour suivre le déroulé que vous "
                "aurez convenu avec votre imam.",
        'citation': ('وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
                     "Et parmi Ses signes, Il a créé pour vous, de vous-mêmes, des épouses afin que vous trouviez auprès d'elles la tranquillité, et Il a mis entre vous affection et miséricorde.",
                     'Sourate Ar-Rûm, 30 : 21'),
        'motifs': ['alhambra', 'iznik', 'andalousie'],
    },
    {
        'id': 'aqiqa', 'nom': 'Aqîqa — naissance', 'ar': 'عقيقة', 'translit': 'Aqîqa',
        'accent': '#11706B',
        'court': "Accueillir un nouveau-né : le prénom, le sacrifice partagé et l'aumône.",
        'intro': [
            "Traditionnellement le septième jour après la naissance, la famille célèbre l'aqîqa : on annonce le "
            "prénom de l'enfant, on offre un sacrifice dont la viande est partagée avec les proches, les voisins et "
            "les plus démunis, et l'on donne en aumône le poids de ses premiers cheveux en argent.",
            "C'est souvent le premier grand repas autour du bébé : faire-part, invitations et petites attentions "
            "pour les invités en gardent le souvenir.",
        ],
        'deroule': [
            ('Le prénom', "Le prénom de l'enfant est annoncé — certaines familles le font dès la naissance."),
            ('Le tahnîk', "Selon les familles, une datte écrasée est déposée sur le palais du nouveau-né."),
            ('Le sacrifice', "Un ou deux moutons selon les écoles ; la viande est partagée et offerte."),
            ('Les cheveux et l\'aumône', "Les cheveux du bébé sont rasés ; leur poids en argent est donné en aumône."),
            ('Le repas', "Famille et proches se retrouvent autour du repas de l'aqîqa."),
        ],
        'produits': ['Faire-part de naissance', "Invitation au repas de l'aqîqa", 'Cartes de bienvenue',
                     'Étiquettes pour dragées et boîtes', 'Livret de souvenirs du premier mois'],
        'note': "Le jour retenu (7e, 14e ou 21e jour) et le nombre de bêtes varient selon les écoles et les familles.",
        'citation': ('بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ',
                     "Que Dieu te bénisse dans celui qui t'a été donné.",
                     'Formule traditionnelle de félicitations'),
        'motifs': ['aube', 'iznik'],
    },
    {
        'id': 'khitan', 'nom': 'Khitân — circoncision', 'ar': 'ختان', 'translit': 'Khitân',
        'accent': '#2B5F8A',
        'court': 'La fête de la circoncision, grand moment familial au Maghreb, en Turquie et dans les Balkans.',
        'intro': [
            "Dans de nombreuses familles, la circoncision du garçon donne lieu à une grande fête : tahâra au "
            "Maghreb, sünnet düğünü en Turquie, sunnet dans les Balkans. Tenue traditionnelle, cortège, repas et "
            "cadeaux font de cette journée un souvenir marquant.",
        ],
        'deroule': [
            ("L'accueil", "La famille reçoit les proches, souvent dès la veille."),
            ("L'enfant à l'honneur", "Tenue de fête, cortège ou séance photo selon les traditions."),
            ('La fête', 'Repas, musique et cadeaux pour le jeune garçon.'),
        ],
        'produits': ['Invitations', 'Livret souvenir', 'Menu du repas', 'Étiquettes cadeaux'],
        'note': "Les traditions diffèrent beaucoup d'un pays à l'autre : nos modèles s'adaptent à vos usages familiaux.",
        'citation': None,
        'motifs': ['medine', 'andalousie'],
    },
    {
        'id': 'khatm', 'nom': "Khatm al-Qur'ân", 'ar': 'ختم القرآن', 'translit': "Khatm al-Qur'ân",
        'accent': '#0D6B5E',
        'court': "Célébrer celui ou celle qui a achevé la lecture du Coran.",
        'intro': [
            "Lorsqu'un enfant — ou un adulte — achève la lecture complète du Coran, la famille et l'école "
            "coranique célèbrent ce moment : récitation des dernières sourates, invocation de clôture (du'â' al-khatm) "
            "et repas partagé. On l'appelle aussi « amîn » en Turquie et dans les Balkans.",
        ],
        'deroule': [
            ('La récitation', "Les dernières sourates sont récitées devant l'enseignant et la famille."),
            ("L'invocation de clôture", "La du'â' al-khatm est prononcée pour le lecteur et ses proches."),
            ('La remise', 'Un souvenir ou un certificat est remis, souvent avec un cadeau.'),
            ('Le repas', 'Proches et camarades partagent un repas de fête.'),
        ],
        'produits': ['Invitations', 'Certificat souvenir', 'Livret de la cérémonie', 'Cartes de remerciement'],
        'note': "Le certificat peut porter le nom de l'école et de l'enseignant ; nous le composons avec vous.",
        'citation': None,
        'motifs': ['medine', 'alhambra'],
    },
    {
        'id': 'hajj', 'nom': 'Hajj & omra', 'ar': 'حج', 'translit': 'Hajj',
        'accent': '#8A5A2B',
        'court': 'Fêter le départ et le retour du pèlerin.',
        'intro': [
            "Avant de partir, le futur pèlerin réunit souvent ses proches pour demander pardon et recueillir les "
            "invocations qu'on lui confie. À son retour, la famille l'accueille par une fête — « Hajj mabrûr ! » — "
            "où l'on partage dattes et eau de Zamzam rapportées des Lieux saints.",
        ],
        'deroule': [
            ('Le départ', 'Les proches se réunissent, se pardonnent et confient leurs invocations au pèlerin.'),
            ('Le voyage', 'Hajj ou omra : un carnet de du\'â\' accompagne le pèlerin.'),
            ('Le retour', "Fête d'accueil, félicitations et partage des présents."),
        ],
        'produits': ["Invitations (départ ou retour)", 'Cartes « Hajj mabrûr »', "Carnet de du'â' pour le pèlerin",
                     'Étiquettes pour dattes et eau de Zamzam'],
        'note': "Nous ne représentons pas la Ka'ba ni les Lieux saints sur nos modèles : seuls des motifs géométriques et la calligraphie.",
        'citation': ('وَأَذِّن فِي النَّاسِ بِالْحَجِّ',
                     'Et fais aux gens une annonce pour le pèlerinage.',
                     'Sourate Al-Hajj, 22 : 27'),
        'motifs': ['arafat', 'medine'],
    },
    {
        'id': 'ramadan', 'nom': 'Ramadan & iftar', 'ar': 'رمضان', 'translit': 'Ramadân',
        'accent': '#183A66',
        'court': 'Invitations à la rupture du jeûne, calendriers et cartes de vœux.',
        'intro': [
            "Le mois de Ramadan rassemble familles et voisins autour de l'iftar, la rupture du jeûne. Invitations, "
            "calendrier des horaires (imsâkiyya) de votre mosquée et petites cartes accompagnent ce mois de partage.",
        ],
        'deroule': [
            ('Avant le mois', 'Calendrier des horaires de votre mosquée, à afficher ou à offrir.'),
            ("Les iftars", "Invitations pour la famille, les voisins, l'association ou l'entreprise."),
            ('Le partage', 'Étiquettes pour les paniers solidaires et les dons.'),
        ],
        'produits': ['Invitations à l\'iftar', 'Calendrier imsâkiyya', 'Cartes « Ramadân mubârak »', 'Étiquettes de paniers'],
        'note': "Les horaires du calendrier sont ceux que vous nous transmettez (votre mosquée) : nous ne les calculons pas.",
        'citation': ('شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ',
                     'Le mois de Ramadan, au cours duquel le Coran a été descendu.',
                     'Sourate Al-Baqara, 2 : 185'),
        'motifs': ['nuit', 'medine'],
    },
    {
        'id': 'aid', 'nom': 'Aïd al-Fitr & Aïd al-Adha', 'ar': 'عيد', 'translit': 'Îd',
        'accent': '#B0392A',
        'court': 'Cartes de vœux, invitations aux repas et étiquettes de cadeaux.',
        'intro': [
            "Les deux fêtes de l'année — l'Aïd al-Fitr à la fin du Ramadan, l'Aïd al-Adha au temps du pèlerinage — "
            "se vivent en famille : prière de l'Aïd, visites, repas et cadeaux pour les enfants (l'eidiyya).",
        ],
        'deroule': [
            ('Les vœux', 'Cartes « Îd mubârak » pour la famille, les amis et les collègues.'),
            ('Le repas', 'Invitations aux repas de fête.'),
            ('Les enfants', "Pochettes et étiquettes pour l'eidiyya."),
        ],
        'produits': ['Cartes de vœux', 'Invitations', "Pochettes d'eidiyya", 'Étiquettes cadeaux'],
        'note': "Une même carte peut être déclinée pour les deux Aïd : vous changez simplement le titre.",
        'citation': ('عِيدٌ مُبَارَكٌ', 'Bonne fête bénie.', 'Formule de vœux'),
        'motifs': ['nuit', 'alhambra'],
    },
    {
        'id': 'henne', 'nom': 'Soirée du henné', 'ar': 'حناء', 'translit': 'Hennâ',
        'accent': '#C2412D',
        'court': 'La veillée avant le mariage, selon les traditions du Maghreb, de Turquie ou du sous-continent.',
        'intro': [
            "Tradition culturelle plus que religieuse, la soirée du henné réunit la mariée et ses proches avant le "
            "mariage : chants, tenues traditionnelles et motifs de henné. Elle porte mille noms — henna au Maghreb, "
            "kına gecesi en Turquie, mehndi en Inde et au Pakistan.",
        ],
        'deroule': [
            ("L'accueil", 'Les invitées arrivent en tenue traditionnelle.'),
            ('Le henné', 'Les motifs sont posés sur les mains de la mariée, puis des invitées.'),
            ('La fête', 'Chants, danses et douceurs.'),
        ],
        'produits': ['Invitations', 'Menus', 'Cartes de remerciement', 'Étiquettes pour les cadeaux'],
        'note': "Assortie au faire-part du mariage, la papeterie du henné peut reprendre le même modèle dans une autre couleur.",
        'citation': None,
        'motifs': ['andalousie', 'iznik'],
    },
    {
        'id': 'janaza', 'nom': 'Janâza — funérailles', 'ar': 'جنازة', 'translit': 'Janâza',
        'accent': '#4A5563',
        'court': "Des documents sobres pour annoncer, prier et remercier, préparés en quelques heures.",
        'intro': [
            "En islam, la toilette rituelle, la prière funéraire (salât al-janâza) et l'inhumation ont lieu au plus "
            "vite. La famille reçoit ensuite les condoléances, souvent pendant trois jours.",
            "Nous préparons des documents volontairement sobres — sans dorure ni ornement superflu — et dans des "
            "délais très courts : avis de décès, livret d'invocations pour les proches, cartes de remerciement.",
        ],
        'deroule': [
            ('La toilette et le linceul', 'Accomplis par les proches ou des bénévoles de la mosquée.'),
            ('La salât al-janâza', 'Prière collective, debout, à la mosquée ou au cimetière.'),
            ("L'inhumation", 'Le défunt est inhumé, tourné vers La Mecque.'),
            ('Les condoléances', "La famille reçoit les proches ; on prie pour le défunt."),
        ],
        'produits': ['Avis de décès', "Livret d'invocations pour les proches", 'Cartes de remerciement'],
        'note': "Traitement en priorité, épreuve envoyée en quelques heures. Sur demande, documents sans verset.",
        'citation': ('إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
                     "Nous appartenons à Dieu et c'est vers Lui que nous retournerons.",
                     'Sourate Al-Baqara, 2 : 156'),
        'motifs': ['serenite'],
    },
]

# Modèles : couleurs et composition (voir couvertures.py).
MOTIFS = {
    'alhambra':  {'nom': 'Alhambra',   'fond': '#FFFFFF', 'trait': '#1F4E9C', 'texte': '#0F2747', 'accent': '#1F4E9C', 'motif': 'muqarnas',
                  'phrase': 'بارك الله لكما', 'titre': 'Nikâh', 'noms': 'Yasmine & Karim'},
    'iznik':     {'nom': 'Iznik',      'fond': '#EEF4F1', 'trait': '#1F4E9C', 'texte': '#0F2747', 'accent': '#C2412D', 'motif': 'rosace',
                  'phrase': 'بارك الله لكما', 'titre': 'Mariage', 'noms': 'Inès & Bilal'},
    'medine':    {'nom': 'Médine',     'fond': '#11706B', 'trait': '#A8DCD5', 'texte': '#FFFFFF', 'accent': '#A8DCD5', 'motif': 'etoile',
                  'phrase': 'ختم القرآن', 'titre': "Khatm al-Qur'ân", 'noms': 'Adam'},
    'nuit':      {'nom': 'Nuit de Ramadan', 'fond': '#0F2747', 'trait': '#A8DCD5', 'texte': '#FFFFFF', 'accent': '#A8DCD5', 'motif': 'croissant',
                  'phrase': 'رمضان كريم', 'titre': 'Iftar', 'noms': 'Famille Benali'},
    'andalousie': {'nom': 'Andalousie', 'fond': '#FFFFFF', 'trait': '#C2412D', 'texte': '#0F2747', 'accent': '#C2412D', 'motif': 'entrelacs',
                  'phrase': 'مبروك', 'titre': 'Soirée du henné', 'noms': 'Sarah'},
    'arafat':    {'nom': 'Arafat',     'fond': '#DCEAE6', 'trait': '#11706B', 'texte': '#0F2747', 'accent': '#11706B', 'motif': 'dunes',
                  'phrase': 'حج مبرور', 'titre': 'Hajj mabrûr', 'noms': 'Hadj Mohamed'},
    'aube':      {'nom': 'Aube',       'fond': '#E6F0FA', 'trait': '#2E9C95', 'texte': '#0F2747', 'accent': '#1F4E9C', 'motif': 'etoile',
                  'phrase': 'ما شاء الله', 'titre': 'Aqîqa', 'noms': 'Nour'},
    'serenite':  {'nom': 'Sérénité',   'fond': '#F4F6F8', 'trait': '#4A5563', 'texte': '#2A313B', 'accent': '#4A5563', 'motif': 'sobre',
                  'phrase': 'إنا لله وإنا إليه راجعون', 'titre': 'In memoriam', 'noms': 'Fatima'},
}
