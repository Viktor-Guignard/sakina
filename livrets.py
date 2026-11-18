"""Brochures (livrets imprimés A5) : bibliothèque de versets et d'invocations,
textes par défaut de chaque cérémonie. Exporté en JS pour l'atelier.

Chaque texte : arabe vocalisé (ar), translittération (tr), traduction (fr),
référence (ref_fr / ref_ar) et nature (coran, hadith, formule). Les variantes
au féminin (suffixe _f) servent pour la janâza.

TOUT EST À FAIRE RELIRE par un imam avant impression : c'est ce que l'atelier
rappelle au client, et ce que la charte de respect promet.
"""

TEXTES = {
    'fatiha': {
        'nature': 'coran', 'ref_fr': 'Sourate Al-Fâtiha, 1 : 1-7', 'ref_ar': 'سورة الفاتحة، الآيات ١-٧',
        'ar': 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ '
              'مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ '
              'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾',
        'tr': "Bismi-llâhi r-rahmâni r-rahîm. Al-hamdu li-llâhi rabbi l-'âlamîn. Ar-rahmâni r-rahîm. Mâliki yawmi d-dîn. "
              "Iyyâka na'budu wa iyyâka nasta'în. Ihdinâ s-sirâta l-mustaqîm. Sirâta lladhîna an'amta 'alayhim, "
              "ghayri l-maghdûbi 'alayhim wa lâ d-dâllîn.",
        'fr': "Au nom de Dieu, le Tout Miséricordieux, le Très Miséricordieux. Louange à Dieu, Seigneur des mondes, "
              "le Tout Miséricordieux, le Très Miséricordieux, Maître du Jour du jugement. C'est Toi que nous adorons, "
              "c'est Toi dont nous implorons le secours. Guide-nous sur le droit chemin, le chemin de ceux que Tu as "
              "comblés de Tes bienfaits, non de ceux qui ont encouru Ta colère, ni des égarés.",
    },
    'rum21': {
        'nature': 'coran', 'ref_fr': 'Sourate Ar-Rûm, 30 : 21', 'ref_ar': 'سورة الروم، الآية ٢١',
        'ar': 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ '
              'إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
        'tr': "Wa min âyâtihî an khalaqa lakum min anfusikum azwâjan li-taskunû ilayhâ, wa ja'ala baynakum mawaddatan "
              "wa rahmah. Inna fî dhâlika la-âyâtin li-qawmin yatafakkarûn.",
        'fr': "Et parmi Ses signes, Il a créé pour vous, de vous-mêmes, des épouses afin que vous trouviez auprès "
              "d'elles la tranquillité, et Il a mis entre vous affection et miséricorde. Il y a en cela des signes "
              "pour des gens qui réfléchissent.",
    },
    'furqan74': {
        'nature': 'coran', 'ref_fr': 'Sourate Al-Furqân, 25 : 74', 'ref_ar': 'سورة الفرقان، الآية ٧٤',
        'ar': 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
        'tr': "Rabbanâ hab lanâ min azwâjinâ wa dhurriyyâtinâ qurrata a'yunin wa-j'alnâ li-l-muttaqîna imâmâ.",
        'fr': "Seigneur, fais de nos épouses et de nos descendants la joie de nos yeux, et fais de nous un exemple "
              "pour ceux qui Te craignent.",
    },
    'dua_maries': {
        'nature': 'hadith', 'ref_fr': 'Invocation prophétique (Abû Dâwûd, at-Tirmidhî)', 'ref_ar': 'دعاء نبوي (رواه أبو داود والترمذي)',
        'ar': 'بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
        'tr': "Bâraka-llâhu laka, wa bâraka 'alayka, wa jama'a baynakumâ fî khayr.",
        'fr': "Que Dieu te bénisse, qu'Il répande sur toi Sa bénédiction et qu'Il vous unisse tous deux dans le bien.",
    },
    'formule_aqiqa': {
        'nature': 'formule', 'ref_fr': 'Formule traditionnelle de félicitations', 'ref_ar': 'صيغة تهنئة مأثورة',
        'ar': 'بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ',
        'tr': "Bâraka-llâhu laka fi-l-mawhûbi lak, wa shakarta l-wâhib, wa balagha ashuddah, wa ruziqta birrah.",
        'fr': "Que Dieu te bénisse dans l'enfant qui t'a été donné ; puisses-tu remercier Celui qui l'a donné, qu'il "
              "atteigne sa pleine maturité, et que tu connaisses sa bonté.",
    },
    'imran38': {
        'nature': 'coran', 'ref_fr': "Sourate Âl 'Imrân, 3 : 38", 'ref_ar': 'سورة آل عمران، الآية ٣٨',
        'ar': 'رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ الدُّعَاءِ',
        'tr': "Rabbi hab lî min ladunka dhurriyyatan tayyibah, innaka samî'u d-du'â'.",
        'fr': "Seigneur, accorde-moi, venant de Toi, une descendance pure : Tu entends parfaitement l'invocation.",
    },
    'ibrahim40': {
        'nature': 'coran', 'ref_fr': 'Sourate Ibrâhîm, 14 : 40', 'ref_ar': 'سورة إبراهيم، الآية ٤٠',
        'ar': 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
        'tr': "Rabbi-j'alnî muqîma s-salâti wa min dhurriyyatî, rabbanâ wa taqabbal du'â'.",
        'fr': "Seigneur, fais que j'accomplisse la prière, ainsi que ma descendance ; Seigneur, accepte mon invocation.",
    },
    'machallah': {
        'nature': 'formule', 'ref_fr': 'Formule de bénédiction', 'ref_ar': 'صيغة تبريك',
        'ar': 'مَا شَاءَ اللَّهُ، تَبَارَكَ اللَّهُ',
        'tr': "Mâ shâ'a-llâh, tabâraka-llâh.",
        'fr': "Ce que Dieu a voulu ; béni soit Dieu.",
    },
    'qamar17': {
        'nature': 'coran', 'ref_fr': 'Sourate Al-Qamar, 54 : 17', 'ref_ar': 'سورة القمر، الآية ١٧',
        'ar': 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
        'tr': "Wa laqad yassarnâ l-Qur'âna li-dh-dhikri fa-hal min muddakir.",
        'fr': "Nous avons rendu le Coran facile à retenir et à méditer : y a-t-il quelqu'un pour s'en souvenir ?",
    },
    'taha114': {
        'nature': 'coran', 'ref_fr': 'Sourate Tâ-Hâ, 20 : 114', 'ref_ar': 'سورة طه، الآية ١١٤',
        'ar': 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
        'tr': "Wa qul rabbi zidnî 'ilmâ.",
        'fr': "Et dis : « Seigneur, accrois mon savoir. »",
    },
    'khayrukum': {
        'nature': 'hadith', 'ref_fr': 'Hadith (al-Bukhârî)', 'ref_ar': 'حديث (رواه البخاري)',
        'ar': 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
        'tr': "Khayrukum man ta'allama l-Qur'âna wa 'allamah.",
        'fr': "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.",
    },
    'hajj27': {
        'nature': 'coran', 'ref_fr': 'Sourate Al-Hajj, 22 : 27', 'ref_ar': 'سورة الحج، الآية ٢٧',
        'ar': 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ',
        'tr': "Wa adhdhin fi n-nâsi bi-l-hajji ya'tûka rijâlan wa 'alâ kulli dâmirin ya'tîna min kulli fajjin 'amîq.",
        'fr': "Et fais aux gens une annonce pour le pèlerinage : ils viendront à toi, à pied et sur toute monture, "
              "de tout chemin lointain.",
    },
    'talbiya': {
        'nature': 'hadith', 'ref_fr': 'La talbiya du pèlerin (al-Bukhârî, Muslim)', 'ref_ar': 'التلبية (رواه البخاري ومسلم)',
        'ar': 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
        'tr': "Labbayka-llâhumma labbayk, labbayka lâ sharîka laka labbayk, inna l-hamda wa n-ni'mata laka wa l-mulk, "
              "lâ sharîka lak.",
        'fr': "Me voici, ô Dieu, me voici. Me voici, Tu n'as pas d'associé, me voici. La louange, le bienfait et la "
              "royauté T'appartiennent ; Tu n'as pas d'associé.",
    },
    'baqara201': {
        'nature': 'coran', 'ref_fr': 'Sourate Al-Baqara, 2 : 201', 'ref_ar': 'سورة البقرة، الآية ٢٠١',
        'ar': 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        'tr': "Rabbanâ âtinâ fi d-dunyâ hasanatan wa fi l-âkhirati hasanatan wa qinâ 'adhâba n-nâr.",
        'fr': "Seigneur, accorde-nous une belle part ici-bas et une belle part dans l'au-delà, et préserve-nous du "
              "châtiment du Feu.",
    },
    'baqara185': {
        'nature': 'coran', 'ref_fr': 'Sourate Al-Baqara, 2 : 185', 'ref_ar': 'سورة البقرة، الآية ١٨٥',
        'ar': 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ',
        'tr': "Shahru Ramadâna lladhî unzila fîhi l-Qur'ânu hudan li-n-nâsi wa bayyinâtin mina l-hudâ wa l-furqân.",
        'fr': "Le mois de Ramadan, au cours duquel le Coran a été descendu, guide pour les gens, preuves claires de "
              "la bonne direction et du discernement.",
    },
    'baqara186': {
        'nature': 'coran', 'ref_fr': 'Sourate Al-Baqara, 2 : 186', 'ref_ar': 'سورة البقرة، الآية ١٨٦',
        'ar': 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
        'tr': "Wa idhâ sa'alaka 'ibâdî 'annî fa-innî qarîb, ujîbu da'wata d-dâ'i idhâ da'ân.",
        'fr': "Et quand Mes serviteurs t'interrogent à Mon sujet, Je suis tout proche : Je réponds à l'appel de "
              "celui qui M'invoque, quand il M'invoque.",
    },
    'dua_iftar': {
        'nature': 'hadith', 'ref_fr': 'Invocation de la rupture du jeûne (Abû Dâwûd)', 'ref_ar': 'دعاء الإفطار (رواه أبو داود)',
        'ar': 'ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
        'tr': "Dhahaba z-zama'u, wa-btallati l-'urûqu, wa thabata l-ajru in shâ'a-llâh.",
        'fr': "La soif est partie, les veines sont humectées, et la récompense est acquise, si Dieu le veut.",
    },
    'taqabbal': {
        'nature': 'formule', 'ref_fr': "Vœux de l'Aïd", 'ref_ar': 'تهنئة العيد',
        'ar': 'تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ',
        'tr': "Taqabbala-llâhu minnâ wa minkum.",
        'fr': "Que Dieu accepte de nous et de vous.",
    },
    'takbir': {
        'nature': 'formule', 'ref_fr': "Takbîr de l'Aïd", 'ref_ar': 'تكبيرات العيد',
        'ar': 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ',
        'tr': "Allâhu akbar, Allâhu akbar, lâ ilâha illa-llâh, wa-llâhu akbar, Allâhu akbar, wa li-llâhi l-hamd.",
        'fr': "Dieu est le plus grand, Dieu est le plus grand, il n'y a de divinité que Dieu ; Dieu est le plus "
              "grand, Dieu est le plus grand, et à Dieu revient la louange.",
    },
    'inna_lillah': {
        'nature': 'coran', 'ref_fr': 'Sourate Al-Baqara, 2 : 156', 'ref_ar': 'سورة البقرة، الآية ١٥٦',
        'ar': 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
        'tr': "Innâ li-llâhi wa innâ ilayhi râji'ûn.",
        'fr': "Nous appartenons à Dieu, et c'est vers Lui que nous retournerons.",
    },
    'fajr27': {
        'nature': 'coran', 'ref_fr': 'Sourate Al-Fajr, 89 : 27-30', 'ref_ar': 'سورة الفجر، الآيات ٢٧-٣٠',
        'ar': 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ﴿٢٧﴾ ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً ﴿٢٨﴾ فَادْخُلِي فِي عِبَادِي ﴿٢٩﴾ وَادْخُلِي جَنَّتِي ﴿٣٠﴾',
        'tr': "Yâ ayyatuha n-nafsu l-mutma'innah, irji'î ilâ rabbiki râdiyatan mardiyyah, fa-dkhulî fî 'ibâdî, "
              "wa-dkhulî jannatî.",
        'fr': "Ô âme apaisée, retourne vers ton Seigneur, satisfaite et agréée ; entre parmi Mes serviteurs, et "
              "entre dans Mon Paradis.",
    },
    'dua_defunt': {
        'nature': 'hadith', 'ref_fr': 'Invocation de la prière funéraire (Muslim)', 'ref_ar': 'من دعاء صلاة الجنازة (رواه مسلم)',
        'ar': 'اللَّهُمَّ اغْفِرْ لَهُ، وَارْحَمْهُ، وَعَافِهِ، وَاعْفُ عَنْهُ',
        'tr': "Allâhumma-ghfir lahu, wa-rhamhu, wa 'âfihi, wa-'fu 'anh.",
        'fr': "Ô Dieu, pardonne-lui, fais-lui miséricorde, préserve-le et efface ses fautes.",
        'ar_f': 'اللَّهُمَّ اغْفِرْ لَهَا، وَارْحَمْهَا، وَعَافِهَا، وَاعْفُ عَنْهَا',
        'tr_f': "Allâhumma-ghfir lahâ, wa-rhamhâ, wa 'âfihâ, wa-'fu 'anhâ.",
        'fr_f': "Ô Dieu, pardonne-lui, fais-lui miséricorde, préserve-la et efface ses fautes.",
    },
    'imran185': {
        'nature': 'coran', 'ref_fr': "Sourate Âl 'Imrân, 3 : 185", 'ref_ar': 'سورة آل عمران، الآية ١٨٥',
        'ar': 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ',
        'tr': "Kullu nafsin dhâ'iqatu l-mawt.",
        'fr': "Toute âme goûtera la mort.",
    },
    'zukhruf13': {
        'nature': 'coran', 'ref_fr': 'Sourate Az-Zukhruf, 43 : 13-14 (invocation du voyage)', 'ref_ar': 'سورة الزخرف، الآيتان ١٣-١٤ (دعاء السفر)',
        'ar': 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ ﴿١٣﴾ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ ﴿١٤﴾',
        'tr': "Subhâna lladhî sakhkhara lanâ hâdhâ wa mâ kunnâ lahû muqrinîn, wa innâ ilâ rabbinâ la-munqalibûn.",
        'fr': "Gloire à Celui qui a mis ceci à notre service, alors que nous n'aurions pu le maîtriser ; et c'est vers "
              "notre Seigneur que nous retournerons.",
    },
    'laylat_qadr': {
        'nature': 'hadith', 'ref_fr': 'Invocation des dernières nuits de Ramadan (at-Tirmidhî, Ibn Mâja)', 'ref_ar': 'دعاء العشر الأواخر (رواه الترمذي وابن ماجه)',
        'ar': 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
        'tr': "Allâhumma innaka 'afuwwun tuhibbu l-'afwa fa-'fu 'annî.",
        'fr': "Ô Dieu, Tu es Celui qui efface les fautes et Tu aimes effacer : efface les miennes.",
    },
}

# Par cérémonie : textes proposés (les premiers, jusqu'à « defaut », sont cochés
# d'office), titre et phrase de couverture, exemple de noms, accueil et mot de fin.
# {noms} est remplacé par les noms saisis.
LIVRETS = {
    'nikah': {
        'motif': 'alhambra', 'textes': ['rum21', 'dua_maries', 'furqan74', 'fatiha'], 'defaut': 3,
        'titre_fr': 'Nikâh', 'titre_ar': 'عقد النكاح', 'phrase': 'بارك الله لكما', 'noms': 'Yasmine & Karim', 'noms_ar': 'ياسمين وكريم',
        'noms_label_fr': 'Les mariés', 'noms_label_ar': 'العروسان',
        'accueil_fr': "Ce livret suit le nikâh moment après moment : chacun peut lire les versets, les comprendre et dire « âmîn » avec nous.",
        'accueil_ar': 'يتابع هذا الكتيّب عقدَ النكاح لحظةً بلحظة: ليقرأ الجميع الآيات ويفهموها ويؤمّنوا على الدعاء معنا.',
        'fin_fr': 'Que Dieu vous rende en bien chaque invocation faite pour nous aujourd’hui.',
        'fin_ar': 'شكرًا لكل دعوةٍ دعوتموها لنا اليوم.',
    },
    'aqiqa': {
        'motif': 'aube', 'textes': ['formule_aqiqa', 'imran38', 'ibrahim40', 'fatiha'], 'defaut': 2,
        'titre_fr': 'Aqîqa', 'titre_ar': 'العقيقة', 'phrase': 'ما شاء الله', 'noms': 'Nour', 'noms_ar': 'نور',
        'noms_label_fr': "Prénom de l'enfant", 'noms_label_ar': 'اسم المولود',
        'accueil_fr': 'Al-hamdu li-llâh pour la naissance de {noms}. Voici les gestes de son aqîqa et les invocations que l’on récite pour un nouveau-né.',
        'accueil_ar': 'الحمد لله على ولادة {noms}. هذه أعمال العقيقة والأدعية التي تُقال للمولود.',
        'fin_fr': 'Gardez {noms} dans vos du‘â’ : que Dieu fasse grandir cet enfant dans la paix.',
        'fin_ar': 'أنبت الله {noms} نباتًا حسنًا.',
    },
    'khitan': {
        'motif': 'medine', 'textes': ['machallah', 'fatiha'], 'defaut': 1,
        'titre_fr': 'Khitân', 'titre_ar': 'الختان', 'phrase': 'ما شاء الله', 'noms': 'Adam', 'noms_ar': 'آدم',
        'noms_label_fr': "Prénom de l'enfant", 'noms_label_ar': 'اسم الطفل',
        'accueil_fr': "Aujourd'hui, {noms} est à l'honneur ! Voici le programme de la fête.",
        'accueil_ar': 'اليوم يومُ {noms}! هذا برنامج الحفل.',
        'fin_fr': 'Un grand merci pour les cadeaux, les sourires et la bonne humeur.',
        'fin_ar': 'شكرًا على الهدايا والابتسامات والفرح.',
    },
    'khatm': {
        'motif': 'medine', 'textes': ['qamar17', 'khayrukum', 'taha114', 'fatiha'], 'defaut': 3,
        'titre_fr': "Khatm al-Qur'ân", 'titre_ar': 'ختم القرآن', 'phrase': 'ختم القرآن', 'noms': 'Adam', 'noms_ar': 'آدم',
        'noms_label_fr': 'Le lecteur ou la lectrice', 'noms_label_ar': 'القارئ أو القارئة',
        'accueil_fr': "{noms} a lu le Coran jusqu'à la dernière sourate. Ce livret rassemble les versets et invocations récités pour célébrer ce khatm.",
        'accueil_ar': 'أتمّ {noms} قراءة القرآن حتى آخر سورة. يجمع هذا الكتيّب الآيات والأدعية التي تُتلى احتفاءً بهذا الختم.',
        'fin_fr': 'Que le Coran soit la lumière de nos cœurs, et que {noms} le garde toute sa vie.',
        'fin_ar': 'اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا.',
    },
    'hajj': {
        'motif': 'arafat', 'textes': ['talbiya', 'hajj27', 'baqara201', 'fatiha'], 'defaut': 3,
        'titre_fr': 'Hajj mabrûr', 'titre_ar': 'حج مبرور', 'phrase': 'حج مبرور', 'noms': 'Hadj Mohamed', 'noms_ar': 'الحاج محمد',
        'noms_label_fr': 'Le pèlerin', 'noms_label_ar': 'الحاجّ',
        'accueil_fr': 'Ce carnet part avec {noms} : les invocations que ses proches lui confient, et celles du voyage.',
        'accueil_ar': 'يسافر هذا الدفتر مع {noms}: الأدعية التي يوصيه بها أحبابه، وأدعية الرحلة.',
        'fin_fr': 'Hajj mabrûr, sa\'y mashkûr : un pèlerinage accepté, un effort récompensé.',
        'fin_ar': 'حجٌّ مبرور، وسعيٌ مشكور، وذنبٌ مغفور.',
    },
    'ramadan': {
        'motif': 'nuit', 'textes': ['dua_iftar', 'baqara185', 'baqara186'], 'defaut': 3,
        'titre_fr': 'Ramadân mubârak', 'titre_ar': 'رمضان مبارك', 'phrase': 'رمضان كريم', 'noms': 'Famille Benali', 'noms_ar': 'عائلة بن علي',
        'noms_label_fr': 'Vos hôtes', 'noms_label_ar': 'المضيفون',
        'accueil_fr': 'Au coucher du soleil, notre table vous attend : rompons le jeûne ensemble.',
        'accueil_ar': 'عند الغروب، مائدتنا تنتظركم: لنفطر معًا.',
        'fin_fr': 'Que ce mois soit pour tous un mois de paix et de partage. — {noms}',
        'fin_ar': 'جعله الله شهر سلامٍ ومحبّةٍ للجميع. — {noms}',
    },
    'aid': {
        'motif': 'nuit', 'textes': ['taqabbal', 'takbir'], 'defaut': 2,
        'titre_fr': 'Îd mubârak', 'titre_ar': 'عيد مبارك', 'phrase': 'عيد مبارك', 'noms': 'Famille Benali', 'noms_ar': 'عائلة بن علي',
        'noms_label_fr': 'Vos hôtes', 'noms_label_ar': 'المضيفون',
        'accueil_fr': 'Îd mubârak à tous ! Voici le programme de cette journée de fête.',
        'accueil_ar': 'عيد مبارك للجميع! هذا برنامج يوم العيد.',
        'fin_fr': 'Taqabbala-llâhu minnâ wa minkum. — {noms}',
        'fin_ar': 'تقبّل الله منّا ومنكم. — {noms}',
    },
    'henne': {
        'motif': 'andalousie', 'textes': ['machallah'], 'defaut': 0,
        'titre_fr': 'Soirée du henné', 'titre_ar': 'ليلة الحنّاء', 'phrase': 'مبروك', 'noms': 'Sarah', 'noms_ar': 'سارة',
        'noms_label_fr': 'La mariée', 'noms_label_ar': 'العروس',
        'accueil_fr': 'Ce soir, le henné de {noms} : chants, douceurs et tenues de fête avant le grand jour.',
        'accueil_ar': 'الليلة حنّاء {noms}: أهازيج وحلويات وأزياء العيد قبل اليوم الكبير.',
        'fin_fr': 'Que cette nuit porte bonheur à {noms} : mabrûk !',
        'fin_ar': 'ليلةٌ مباركة لـ{noms}: مبروك!',
    },
    'janaza': {
        'motif': 'serenite', 'textes': ['inna_lillah', 'dua_defunt', 'fajr27', 'fatiha', 'imran185'], 'defaut': 4,
        'titre_fr': 'In memoriam', 'titre_ar': 'في ذكرى', 'phrase': 'إنا لله وإنا إليه راجعون', 'noms': 'Fatima', 'noms_ar': 'فاطمة',
        'noms_label_fr': 'Le ou la défunte', 'noms_label_ar': 'اسم الفقيد',
        'genre': 'f',
        'accueil_fr': "Innâ li-llâhi wa innâ ilayhi râji'ûn. Ces invocations sont à dire pour {noms}, aujourd'hui et dans les jours qui viennent.",
        'accueil_ar': 'إنا لله وإنا إليه راجعون. هذه أدعيةٌ يُدعى بها لِـ{noms}، اليوم وفي الأيام القادمة.',
        'fin_fr': 'Que Dieu lui accorde Sa miséricorde et vous donne la patience.',
        'fin_ar': 'رحمه الله وأحسن عزاءكم.',
        'fin_ar_f': 'رحمها الله وأحسن عزاءكم.',
    },
}

# Tarifs : prix Vistaprint (vistaprint.fr, brochures agrafées A5 portrait, papier
# standard, HT, hors livraison), relevés le 22/10/2026, par nombre de pages puis
# par quantité. Le prix Sakîna est MARGE × ce prix, mêmes paliers que Vistaprint.
MARGE = 3
TVA = 0.20
TARIFS_VISTAPRINT = {
    8:  {10: 34.99, 25: 37.99, 50: 39.99, 100: 59.99, 150: 69.99, 200: 84.99, 250: 99.99, 500: 149.99},
    12: {10: 38.49, 25: 42.59, 50: 44.79, 100: 67.19, 150: 78.39, 200: 95.19, 250: 111.99, 500: 167.99},
    16: {10: 41.59, 25: 46.69, 50: 49.59, 100: 74.39, 150: 86.79, 200: 105.39, 250: 123.99, 500: 185.99},
    20: {10: 45.09, 25: 50.89, 50: 54.39, 100: 81.59, 150: 95.19, 200: 115.59, 250: 135.99, 500: 203.99},
    24: {10: 48.59, 25: 55.09, 50: 61.19, 100: 91.79, 150: 107.09, 200: 129.99, 250: 152.99, 500: 229.49},
}
