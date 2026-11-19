"""Questions fréquentes (page questions-frequentes.html, FR et AR).

Réponses honnêtes : aucun délai chiffré tant que l'imprimeur n'est pas choisi (Viktor),
aucune promesse que le service ne peut pas tenir. Les mentions religieuses restent à relire.
"""

FAQ = [
    ('Composer', 'التصميم', [
        ("Faut-il créer un compte ?", "هل يجب إنشاء حساب؟",
         "Non. La pièce se compose dans votre navigateur, sans compte. Elle est gardée sur votre appareil, et un lien permet de la rouvrir ou de la faire relire.",
         "لا. تُصمَّم القطعة في متصفّحكم دون حساب، وتُحفظ على جهازكم، ورابطٌ يتيح فتحها من جديد أو عرضها للمراجعة."),
        ("Puis-je écrire mes propres textes ?", "هل يمكنني كتابة نصوصي؟",
         "Oui : chaque texte proposé (accueil, fil de la cérémonie, mot de fin, menu) se modifie librement. Les versets et invocations, eux, se choisissent dans une bibliothèque où chacun porte sa référence.",
         "نعم: كلّ نصٍّ مقترح (الترحيب، سير المناسبة، كلمة الختام، قائمة الطعام) يُعدَّل بحرّية. أمّا الآيات والأدعية فتُختار من مكتبةٍ يحمل فيها كلّ نصٍّ مرجعه."),
        ("En arabe, en français, ou les deux ?", "بالعربية أم بالفرنسية أم بهما؟",
         "Les trois. Les versets restent toujours en arabe ; vous ajoutez la traduction, la translittération, ou les deux. Une pièce en arabe se lit de droite à gauche, avec les chiffres arabes-indiens.",
         "الثلاثة. تبقى الآيات بالعربية دائمًا، وتضيفون الترجمة أو النطق اللاتيني أو كليهما. والقطعة العربية تُقرأ من اليمين إلى اليسار بالأرقام العربية المشرقية."),
        ("Pourquoi un filigrane sur l'aperçu ?", "لماذا العلامة المائية على المعاينة؟",
         "L'aperçu et le PDF de relecture portent le nom Sakîna en filigrane. Le fichier remis à l'imprimeur, lui, n'en a pas : il est préparé par nous après votre commande.",
         "تحمل المعاينةُ وملفُّ المراجعة اسم سكينة علامةً مائية. أمّا الملفّ الذي يُرسَل إلى المطبعة فلا يحملها، ونُعدّه نحن بعد طلبكم."),
    ]),
    ('Les textes religieux', 'النصوص الدينية', [
        ("Les versets sont-ils vérifiés ?", "هل الآيات موثّقة؟",
         "Chaque verset est cité avec sa sourate et son numéro, chaque invocation avec sa source. Nous vous demandons de faire relire votre pièce par votre imam ou un arabisant : un lien de relecture est prévu pour cela.",
         "كلّ آيةٍ مذكورة بسورتها ورقمها، وكلّ دعاءٍ بمصدره. ونطلب منكم عرض قطعتكم على إمامكم أو على عارفٍ بالعربية، وقد أعددنا لذلك رابط مراجعة."),
        ("Et si je ne veux aucun verset ?", "وإن لم أُرد أيّ آية؟",
         "C'est possible pour toutes les pièces. Le menu et les étiquettes n'en portent pas par défaut : ils sont faits pour être jetés.",
         "ممكنٌ في كلّ القطع. ولا تحمل قائمةُ الطعام والملصقاتُ آيةً أصلًا، لأنّها تُرمى بعد الاستعمال."),
        ("Que deviennent les livrets après la cérémonie ?", "ماذا يحلّ بالكتيّبات بعد المناسبة؟",
         "Au dos de chaque pièce qui contient un verset, une mention discrète invite à la conserver ou à la confier à un recyclage respectueux.",
         "على ظهر كلّ قطعةٍ فيها آية، تنبيهٌ لطيف يدعو إلى حفظها أو التخلّص منها بطريقةٍ لائقة."),
    ]),
    ('Commande et impression', 'الطلب والطباعة', [
        ("Comment se passe une commande ?", "كيف يجري الطلب؟",
         "Vous payez en ligne, nous préparons l'épreuve et vous l'envoyons par e-mail. Vous la validez, ou vous demandez une correction. Rien n'est imprimé avant votre accord ; ensuite, impression et envoi avec un numéro de suivi.",
         "تدفعون عبر الإنترنت، فنُعدّ نسخة المراجعة ونرسلها إليكم بالبريد. توافقون عليها أو تطلبون تعديلًا. ولا يُطبع شيءٌ قبل موافقتكم؛ ثم الطباعة والشحن مع رقم تتبّع."),
        ("Comment payer ?", "كيف أدفع؟",
         "Par carte bancaire, sur la page de paiement sécurisée de Stripe. Nous ne voyons jamais votre numéro de carte. Certaines pièces sont sur devis : nous vous écrivons le prix, puis vous réglez depuis votre page de suivi.",
         "بالبطاقة المصرفية، في صفحة الدفع الآمنة لدى Stripe، ولا نطّلع أبدًا على رقم بطاقتكم. وبعض القطع بعرض سعر: نرسل إليكم السعر، ثم تدفعون من صفحة المتابعة."),
        ("Quel est le délai ?", "ما المدّة؟",
         "L'épreuve vous est envoyée rapidement. Le délai d'impression et de livraison est indiqué avant le paiement ; nous ne promettons jamais un délai que l'imprimeur ne peut pas tenir.",
         "تصلكم نسخة المراجعة سريعًا. وتُبيَّن مدّة الطباعة والتوصيل قبل الدفع، ولا نَعِد أبدًا بمدّةٍ لا تستطيعها المطبعة."),
        ("Et pour une janâza ?", "وفي حالة الجنازة؟",
         "Les documents de janâza passent avant tout le reste : l'épreuve est préparée en priorité, et nous vous disons avant la commande le délai d'impression réellement possible.",
         "تُقدَّم أوراق الجنازة على كلّ ما سواها: نُعدّ نسخة المراجعة على وجه الأولوية، ونخبركم قبل الطلب بمدّة الطباعة الممكنة فعلًا."),
        ("Où livrez-vous ?", "إلى أين توصّلون؟",
         "En France et dans les pays proches ; la liste exacte et le prix de la livraison s'affichent sur la page de paiement.",
         "إلى فرنسا والبلدان القريبة منها؛ وتظهر القائمة الدقيقة وتكلفة التوصيل في صفحة الدفع."),
        ("Puis-je annuler ?", "هل يمكنني الإلغاء؟",
         "Tant que l'épreuve n'est pas validée, oui, et vous êtes remboursé. Une fois l'épreuve validée, la pièce est personnalisée et part à l'impression.",
         "نعم، ما دمتم لم توافقوا على نسخة المراجعة، ويُردّ إليكم مالكم. وبعد الموافقة، تُعدّ القطعة شخصيةً وتذهب إلى الطباعة."),
    ]),
]
