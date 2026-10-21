# Textes – Le critère algorithmique : l'aide et un texte lu par les élèves (lot de mots)

> Cowork, mercredi 21 octobre 2026, 9 h 51 (Toronto, mesuré par `date`). Proposés par Cowork à 9 h 40 dans la page « Les textes du critère algorithmique » ; **réglés par Grégoire à 9 h 51**, tous acceptés, E1 dans sa version. Sources : `MESURE-2026-10-21-critere-algorithmique.md` (constats 1, 2, 3, 6, 7, 12), verdict de 9 h 16, principe de Grégoire de 9 h 20 (`PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`).
> ⚠ Les textes D5 et D6 décrivent l'écran **après l'étape 0** (le bouton « Partir de la liste du français écrit » ; un critère neuf sans les dix codes de repli). Le lot de mots passe après elle. Apostrophes : suivre la convention de chaque site (`evaluation-enonces.js` l'explique) ; le texte de Grégoire en E1 est reproduit tel qu'il l'a écrit.

## Le type de critère

- **A1, lexique, « Type de critère »** (`accompagnement-contenu-terme.js` l. 105) : « La méthode d’évaluation d’un critère dans une grille. Trois types sont disponibles : holistique (tu attribues un niveau de l’échelle de performance), analytique (tu attribues des points, que son barème décrit) et algorithmique (une formule calcule la note à partir de ce que tu comptes sur la copie). »
- **A2, aide « i » « Type de critère d’évaluation », ligne Algorithmique** (`accompagnement-contenu-popup.js` l. 1139) : « Algorithmique : une formule calcule la note à partir de ce que tu comptes sur la copie. »
- **A3, bulle du champ « Type de critère »** (`accompagnement-contenu-hover.js` l. 263) : « Méthode d’évaluation du critère : holistique (tu attribues un niveau de l’échelle), analytique (tu attribues des points, que son barème décrit) ou algorithmique (une formule calcule la note à partir de ce que tu comptes). »

## Les bulles de l'évaluation (`accompagnement-contenu-hover.js`)

- **B1, `eval-francais-ecrit`** (badge « ALGORITHMIQUE ») : « La note de ce critère se calcule par une formule. « Nombre d’erreurs » se remplit avec les codes que tu poses dans Annoter, ou se tape ; « Nombre de mots » se tape. La rétroaction se compose avec les phrases écrites dans la grille. »
- **B2, `eval-col-niveau`** (colonne « Niveau », Liste des évaluations) : « Le niveau de chaque évaluation, dans l’échelle qu’elle emploie. »
- **B3, `eval-note-finale`** : « Résultat calculé en temps réel : le pourcentage pondéré, et son niveau dans l’échelle de l’évaluation. »

## L'élément des phrases `{points}` (`evaluation-enonces.js` l. 199-200)

- **C1, libellé** : « somme pondérée »
- **C2, aide** : « Entre parenthèses, le nombre une fois pondéré : « (5 une fois pondérées) ». Il ne paraît que si un sous-critère ne pèse pas 1 ; place-le juste après le nombre. Une phrase sans lui ne montre que le nombre posé, mais la ligne du calcul, dans le PDF, montre la parenthèse. »

## La section 5c de l'onglet Aide (`index.html`, l. 11182 et suivantes)

- **D1, titre** : « 5c. Les critères algorithmiques »
- **D2, « Qu’est-ce qu’un critère algorithmique ? »** : « Un critère algorithmique calcule sa note par une formule, à partir de ce que tu comptes sur la copie. Tu choisis la formule dans le gabarit de la grille : un modèle, puis ses paramètres. » Puis, une ligne par modèle : « Pénalité normalisée : Note = Pondération − (Erreurs pondérées ÷ Mots × Facteur). Le nombre est ramené à une longueur de référence. » ; « Ratio mots par erreur : atteindre le ratio visé donne la note complète. » ; « Pénalité fixe par erreur : chaque erreur retire un nombre de points donné, sans égard à la longueur. » ; « La formule, avec tes valeurs, s’affiche dans le gabarit et sous le résultat au moment d’évaluer. »
- **D3, paragraphe neuf, juste après** : « Les mots du calcul, « erreurs » et « mots », sont ceux d’un critère de rédaction. Ils valent pour tout ce qui se compte : des unités oubliées sur douze calculs, des fautes de rythme sur trente-deux mesures. » (Part avec l'étape 2 du plan.)
- **D4, « Pourquoi des sous-critères ? »**, remplace le paragraphe et l'« Exemple concret » : « Les sous-critères sont les catégories de ce que tu comptes. Chacun porte un code, un nom, une pondération et une observation : ce que l’étudiant·e lit à propos de ce code. La pondération dit ce que pèse une occurrence : 1 par défaut, 0,5 pour la compter à moitié ; un sous-critère de pondération 0 ne se pose pas. » Puis : « Exemple : sept codes posés, trois d’un sous-critère qui pèse 1 et quatre d’un sous-critère qui pèse 0,5. La formule reçoit 3 + 2 = 5, et l’étudiant·e lit « 7 erreurs (5 une fois pondérées) ». »
- **D5, remplace les étapes 1, 2 et 3** (dont la liste des onze codes), **ajusté par Cowork à 9 h 58** après la décision de Grégoire de 9 h 57 (le bouton donne sa liste, codes 1 à 10) : « Sous le critère, « + Ajouter un sous-critère » en crée un. « Partir de la liste du français écrit » crée d’un coup dix catégories d’une correction du français (codes 1 à 10), toutes de pondération 1, que tu modifies ensuite comme les tiennes. »
- **D6, remplace « Comment utiliser lors de l’évaluation », le paragraphe des codes d’annotation et « Mode simple disponible »**, **ajusté par Cowork à 9 h 58** : depuis l'étape 0 (`a32bdb41`), un critère neuf n'a plus la case, ses sous-critères sont ses codes. Texte : « Dans Annoter, les sous-critères sont les codes que tu poses, sur toute copie évaluée avec cette grille. Chaque code posé compte une occurrence de son sous-critère ; « Nombre d’erreurs » se remplit tout seul, et la formule reçoit le nombre pondéré. Sans code posé, tu tapes le nombre : il compte tel quel, sans pondération. Une grille plus ancienne montre la case « Utiliser ces sous-critères comme codes d’annotation » ; décochée, sa palette garde les dix codes de départ, des codes de correction du français. »
- **D7, paragraphe neuf** : « L’étudiant·e lit la phrase du décompte écrite dans la grille et, dans son PDF, la ligne du calcul : « 7 erreurs (5 une fois pondérées) sur 400 mots → 13,75/20 (68,8 %) ». La parenthèse ne paraît que si le nombre pondéré diffère du nombre posé. »
- **D8, conseil neuf, en encadré** : « Règle les pondérations avant de corriger. Une copie déjà évaluée garde sa note jusqu’à ce que tu y ajoutes ou retires un code ; la pondération s’applique alors à toute la copie. »
- **D9, « Avantages pédagogiques »** : retiré, décision de Grégoire.

## Le gabarit

- **F1, description du modèle « Pénalité normalisée »** (`evaluation-formules.js`, l. 90), tranché par Cowork à 9 h 58 (texte lu par l'enseignant ; trouvaille de Claude Code à l'étape 0) : retirer la phrase « Formule employée depuis l’origine pour le français écrit. » ; le reste de la description ne change pas.

## Ce que les élèves lisent : la liste du français écrit

- **Décision de Grégoire, 9 h 55 et 9 h 57** : les onze sous-critères par défaut d'aujourd'hui (`grilles.js`, `initialiserSousCriteresParDefaut`, écrits le 20 nov. 2025 au commit `6d841a03d`) ne sont pas les siens : « Je ne sais pas d'où viennent ces commentaires. Les miens devaient être offerts par défaut à l'utilisateur en ce qui concerne le français. » Le bouton « Partir de la liste du français écrit » donne **sa** liste.
- **Où elle est** (mesuré) : dans le pack démo, grille « Grille-5 FR-ALGO-20 H26 », critère « Français écrit » (`js/pack-demo-10.js`) : codes 0 à 10, les mêmes noms que sa capture de 9 h 55 (« Construction syntaxique ou accord du verbe », « Subordonnées employées seules », « Ponctuation », « Groupe du nom »…), aucune référence à un manuel.
- **Sans le code 0** (décision de 9 h 57) : ses vraies grilles n'en ont plus, « Quand la copie ne porte aucun code » le remplace. La liste va de 1 à 10 ; le bouton dit « (codes 1 à 10) ».
- Les retouches E1 à E5 proposées à 9 h 40 et 9 h 54 sont **sans objet** : les anciens textes partent avec l'ancienne liste.
- Stock : une grille qui porte déjà des sous-critères les garde ; seul ce que crée le bouton change. Le pack démo garde sa grille telle quelle (c'est une donnée, comme la grille d'un utilisateur).
