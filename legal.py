"""Brouillons des pages légales (français). À FAIRE VALIDER par un juriste avant toute vente :
les passages entre crochets sont à compléter par Viktor. Pages non liées au menu, jamais indexées."""

A_COMPLETER = '[à compléter]'

PAGES_LEGALES = {
    'mentions-legales.html': ('Mentions légales', [
        ('Éditeur du site', [
            f"Le site Sakîna est édité par {A_COMPLETER} (forme juridique, capital, adresse du siège, numéro SIREN/RCS, "
            f"numéro de TVA intracommunautaire).",
            f"Directeur de la publication : {A_COMPLETER}. Contact : {A_COMPLETER} (adresse e-mail réelle de Sakîna).",
        ]),
        ('Hébergement', [
            "Le site et le service de commande sont hébergés par Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, "
            "États-Unis (cloudflare.com).",
        ]),
        ('Textes religieux', [
            "Les versets du Coran et les invocations proposés sont cités avec leur référence. Leurs traductions sont des "
            "propositions de sens, non le texte révélé. Nous conseillons de les faire relire par un imam avant impression.",
        ]),
        ('Propriété intellectuelle', [
            "Les motifs, couvertures, mises en page et textes du site sont la propriété de Sakîna. Les pièces composées "
            "en ligne portent un filigrane : elles ne peuvent être imprimées ou diffusées sans commande.",
            "Les polices utilisées sont publiées sous la licence SIL Open Font License.",
        ]),
    ]),
    'cgv.html': ('Conditions générales de vente', [
        ('Objet', [
            "Ces conditions s'appliquent aux livrets et à la papeterie composés sur le site et commandés auprès de "
            f"Sakîna ({A_COMPLETER} : dénomination et coordonnées du vendeur).",
        ]),
        ('Commande et épreuve', [
            "Le client compose sa pièce en ligne, puis la commande. Après le paiement, Sakîna prépare une épreuve et "
            "l'envoie au client par un lien personnel. Rien n'est imprimé avant que le client ait validé cette épreuve.",
            "Le client est seul responsable des textes qu'il saisit (noms, dates, lieux, mots personnels). Sakîna "
            "recommande de faire relire les versets et invocations par un imam ; Sakîna peut refuser un texte contraire "
            "au respect dû au sacré ou à la loi.",
        ]),
        ('Prix et paiement', [
            "Les prix sont indiqués en euros, toutes taxes comprises. Les frais de livraison sont indiqués avant le "
            f"paiement ({A_COMPLETER} : montant). Certaines pièces sont sur devis.",
            "Le paiement se fait en ligne par carte bancaire, par l'intermédiaire de Stripe. Sakîna n'a jamais accès aux "
            "numéros de carte.",
        ]),
        ('Délais et livraison', [
            f"Les pièces sont imprimées après validation de l'épreuve, puis expédiées sous {A_COMPLETER} jours ouvrés, "
            f"vers {A_COMPLETER} (pays livrés). Un numéro de suivi est communiqué lorsqu'il existe.",
            "Pour une janâza, nous indiquons le délai réellement possible avant la commande : nous ne promettons "
            "jamais un délai que l'imprimeur ne peut pas tenir.",
        ]),
        ('Droit de rétractation', [
            "Les pièces étant confectionnées selon les indications du client et nettement personnalisées, le droit de "
            "rétractation ne s'applique pas (article L221-28, 3° du Code de la consommation). Tant que l'épreuve n'est pas "
            "validée, le client peut toutefois annuler sa commande et être remboursé.",
        ]),
        ('Défauts et réclamations', [
            "Une pièce abîmée ou non conforme à l'épreuve validée est réimprimée ou remboursée. Le client nous écrit "
            f"sous {A_COMPLETER} jours après réception, avec une photo.",
            "Les garanties légales de conformité et contre les vices cachés s'appliquent.",
        ]),
        ('Médiation', [
            f"En cas de litige, le client peut recourir gratuitement au médiateur de la consommation : {A_COMPLETER} "
            "(nom et site du médiateur choisi par Sakîna).",
        ]),
    ]),
    'confidentialite.html': ('Confidentialité', [
        ('Ce que nous recueillons', [
            "Pour une commande : nom, adresse e-mail, téléphone, adresse de livraison et contenu de la pièce composée "
            "(noms, dates, textes). Pour limiter les abus, une empreinte chiffrée de l'adresse IP, jamais l'adresse elle-même.",
            "La pièce en cours de composition est gardée dans votre navigateur seulement, tant que vous ne commandez pas.",
        ]),
        ('Pourquoi', [
            "Préparer, imprimer et livrer la commande, vous envoyer l'épreuve et vous tenir au courant. Base légale : "
            "l'exécution du contrat. Aucune publicité, aucune revente, aucun traceur publicitaire.",
        ]),
        ('Qui y a accès', [
            "Sakîna, et ses prestataires pour ce seul usage : Cloudflare (hébergement et base de données), Stripe "
            f"(paiement), Brevo (envoi des courriels), {A_COMPLETER} (imprimeur).",
        ]),
        ('Combien de temps', [
            f"Les commandes sont gardées {A_COMPLETER} (durée de conservation comptable : en principe 10 ans pour les "
            "pièces comptables) ; le contenu des pièces, un an après la livraison, puis supprimé.",
        ]),
        ('Vos droits', [
            f"Vous pouvez demander l'accès, la correction ou la suppression de vos données en écrivant à {A_COMPLETER}. "
            "Vous pouvez aussi saisir la CNIL (cnil.fr).",
        ]),
        ('Mesure d\'audience', [
            "Le site n'utilise aucun cookie de mesure d'audience. Les polices sont hébergées par Sakîna, sans appel à un service tiers.",
        ]),
    ]),
}


# Traduction arabe, pour information : en cas de différence, le texte français fait foi.
# À FAIRE RELIRE par un arabisant et valider par le juriste en même temps que le français.
A_COMPLETER_AR = '[يُستكمل]'

PAGES_LEGALES_AR = {
    'mentions-legales.html': ('البيانات القانونية', [
        ('ناشر الموقع', [
            f"ينشر موقعَ سكينة {A_COMPLETER_AR} (الشكل القانوني، رأس المال، عنوان المقرّ، رقم التسجيل، رقم الضريبة على القيمة المضافة).",
            f"مدير النشر: {A_COMPLETER_AR}. للتواصل: {A_COMPLETER_AR} (عنوان البريد الحقيقي لسكينة).",
        ]),
        ('الاستضافة', [
            "يستضيف الموقعَ وخدمةَ الطلبات Cloudflare, Inc.، ‏101 Townsend St، سان فرانسيسكو، كاليفورنيا 94107، الولايات المتحدة (cloudflare.com).",
        ]),
        ('النصوص الدينية', [
            "تُذكر الآيات القرآنية والأدعية المقترحة بمراجعها. وترجماتها اجتهادٌ في بيان المعنى، لا النصّ المنزَّل نفسه. وننصح بعرضها على إمامٍ قبل الطباعة.",
        ]),
        ('الملكية الفكرية', [
            "الزخارف والأغلفة والتصاميم ونصوص الموقع ملكٌ لسكينة. وتحمل القطع المصمَّمة عبر الإنترنت علامةً مائية: لا تُطبع ولا تُنشر دون طلب.",
            "الخطوط المستعملة منشورة برخصة SIL Open Font License.",
        ]),
    ]),
    'cgv.html': ('شروط البيع العامة', [
        ('الموضوع', [
            f"تسري هذه الشروط على الكتيّبات والأوراق المصمَّمة في الموقع والمطلوبة من سكينة ({A_COMPLETER_AR}: اسم البائع وبياناته).",
        ]),
        ('الطلب ونسخة المراجعة', [
            "يصمّم العميل قطعته عبر الإنترنت ثم يطلبها. وبعد الدفع تُعدّ سكينة نسخةً للمراجعة وترسلها إليه برابطٍ خاص. ولا يُطبع شيءٌ قبل أن يوافق العميل على هذه النسخة.",
            "العميل وحده مسؤولٌ عن النصوص التي يكتبها (الأسماء والتواريخ والأماكن والكلمات الخاصة). وتوصي سكينة بعرض الآيات والأدعية على إمام، ويحقّ لها رفض نصٍّ يخالف احترام المقدّس أو القانون.",
        ]),
        ('الأسعار والدفع', [
            f"الأسعار باليورو، شاملةً جميع الضرائب. وتُبيَّن تكلفة التوصيل قبل الدفع ({A_COMPLETER_AR}: المبلغ). وبعض القطع بعرض سعر.",
            "يتمّ الدفع عبر الإنترنت بالبطاقة المصرفية، بواسطة Stripe. ولا تطّلع سكينة أبدًا على أرقام البطاقات.",
        ]),
        ('المواعيد والتوصيل', [
            f"تُطبع القطع بعد الموافقة على نسخة المراجعة، ثم تُشحن خلال {A_COMPLETER_AR} أيام عمل، إلى {A_COMPLETER_AR} (البلدان المشمولة). ويُرسَل رقم التتبّع إن وُجد.",
            "في الجنازة، نذكر قبل الطلب المدّة الممكنة فعلًا: لا نَعِد أبدًا بمدّةٍ لا تستطيعها المطبعة.",
        ]),
        ('حقّ التراجع', [
            "لأنّ القطع تُصنع وفق مواصفات العميل وتحمل طابعًا شخصيًّا واضحًا، فلا يسري عليها حقّ التراجع (المادة L221-28، الفقرة 3، من قانون الاستهلاك الفرنسي). غير أنّ للعميل إلغاءَ طلبه واستردادَ ماله ما دام لم يوافق على نسخة المراجعة.",
        ]),
        ('العيوب والشكاوى', [
            f"القطعة التالفة أو المخالفة للنسخة المعتمدة تُعاد طباعتها أو يُردّ ثمنها. يكتب إلينا العميل خلال {A_COMPLETER_AR} أيام من الاستلام، مع صورة.",
            "وتسري الضمانات القانونية للمطابقة وللعيوب الخفية.",
        ]),
        ('الوساطة', [
            f"عند النزاع، يمكن للعميل اللجوء مجانًا إلى وسيط الاستهلاك: {A_COMPLETER_AR} (اسم الوسيط الذي تختاره سكينة وموقعه).",
        ]),
    ]),
    'confidentialite.html': ('الخصوصية', [
        ('ما نجمعه', [
            "عند الطلب: الاسم، والبريد الإلكتروني، والهاتف، وعنوان التوصيل، ومحتوى القطعة المصمَّمة (الأسماء والتواريخ والنصوص). وللحدّ من الإساءة، بصمةٌ مشفَّرة لعنوان IP، لا العنوان نفسه.",
            "القطعة قيد التصميم تُحفظ في متصفّحكم وحده ما دمتم لم تطلبوها.",
        ]),
        ('لماذا', [
            "لإعداد الطلب وطباعته وتوصيله، وإرسال نسخة المراجعة إليكم وإطلاعكم على سيره. الأساس القانوني: تنفيذ العقد. بلا إعلانات، ولا بيعٍ للبيانات، ولا متتبّعاتٍ إعلانية.",
        ]),
        ('من يطّلع عليها', [
            f"سكينة، ومزوّدوها لهذا الغرض وحده: Cloudflare (الاستضافة وقاعدة البيانات)، وStripe (الدفع)، وBrevo (إرسال البريد)، و{A_COMPLETER_AR} (المطبعة).",
        ]),
        ('إلى متى', [
            f"تُحفظ الطلبات {A_COMPLETER_AR} (مدّة الحفظ المحاسبي: عشر سنوات في الأصل للمستندات المحاسبية)؛ ومحتوى القطع سنةً بعد التوصيل، ثم يُحذف.",
        ]),
        ('حقوقكم', [
            f"يمكنكم طلب الاطّلاع على بياناتكم أو تصحيحها أو حذفها بالكتابة إلى {A_COMPLETER_AR}. ويمكنكم أيضًا مراجعة الهيئة الفرنسية لحماية البيانات CNIL ‏(cnil.fr).",
        ]),
        ('قياس الزيارات', [
            "لا يستعمل الموقع أيّ ملفّ تعريفٍ لقياس الزيارات. والخطوط مستضافةٌ لدى سكينة، دون اللجوء إلى خدمةٍ خارجية.",
        ]),
    ]),
}
