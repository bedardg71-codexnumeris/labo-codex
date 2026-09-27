# Consigne – lot C de l'enregistrement : l'évaluation d'une copie (D1)

> Écrite le 27 septembre 2026, à 8 h 11 (Toronto), par Cowork. Source qui fait foi : `plans de travail/DECISIONS-2026-09-26-enregistrement.md`, **D1** (et D0). Constat : `plans de travail/INVENTAIRE-ENREGISTREMENT-2026-09-26.md`, § 3 « Évaluer » et « Liste des évaluations », annexe A3 « Évaluer ».
>
> **Condition de départ** : `git log origin/main` montre `21af8288` (1.161.0) ou plus récent, et l'arbre ne porte aucun changement dans `js/`. L'ancienne consigne (lot B) est archivée par Cowork sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-27-lot-B-enregistrement.md` : commite le déplacement avec ce lot. Branche `lot-c-evaluation-verrouiller` ; fusion après la relecture croisée seulement.
>
> **À remesurer avant le code** : numéros de ligne et comptes ci-dessous viennent de l'inventaire du 26 et de ma lecture du 27 vers 8 h 10.

## 1 · Ce que Grégoire a décidé (D1, 26 sept. vers 13 h 28, « c'est bon, je garde »)

- Pendant qu'on évalue, le témoin commun dit « Enregistré » après chaque geste. **Le nombre d'erreurs, le nombre de mots et le statut de remise s'enregistrent eux aussi tout seuls** (aujourd'hui, ils se perdent si on change d'élève).
- Le bouton « Enregistrer » devient **« Verrouiller l'évaluation »**, et il **fusionne avec le cadenas**.
- Dans la Liste des évaluations, au profil et dans les messages, **« Non enregistrée » devient « Non verrouillée »**, avec une courte aide : « ne compte pas encore dans la note ».
- **Aucun avertissement** quand on quitte une évaluation non verrouillée.

## 2 · Ce que j'ai mesuré, et ce qui en découle (décisions techniques de Cowork)

- **« Ne compte pas encore dans la note » est vrai** : `pratique-registre.js` (vers la l. 833) écarte `verrouillee === false` ; la sommative et le profil disent déjà « non comptée ». À revérifier pour chaque famille de pratique (SOM, STD, SPE, DEN) ; si une famille compte une évaluation non verrouillée, **arrête-toi et dis-le** : l'aide mentirait.
- **Une évaluation verrouillée ne s'écrit pas en arrière-plan** (`evaluation-chargement.js`, vers la l. 2051) et son formulaire est en lecture seule. Pour la corriger, on la déverrouille (elle ne compte plus jusqu'à ce qu'on la reverrouille), c'est déjà le trajet d'aujourd'hui : **aucune question de didactique**, on ne change pas cette règle.
- **Une seule fonction verrouille** : « Verrouiller l'évaluation » et tous les cadenas (formulaire, palette, badges de la barre latérale et de la barre d'outils, Liste) passent par elle. Verrouiller **fait les vérifications que fait aujourd'hui « Enregistrer »** (échelle résolue #697, etc.) et crée l'évaluation si elle n'existe pas encore ; le cadenas, qui verrouillait sans vérifier, perd ce raccourci. Déverrouiller ne vérifie rien. Les évaluations déjà verrouillées ne sont pas revérifiées (rien n'est réécrit).
- **Relève d'abord toutes les surfaces** qui portent un « Enregistrer » d'évaluation ou un cadenas d'évaluation (formulaire, visionneuse, Annoter, palettes, badges, Liste, bulle) et dis lesquelles passent par quelle fonction ; les fonctions sans appelant vivant (inventaire A7 : `verrouillerEvaluationIndividuelle`, `deverrouiller…`, `verrouillerToutesEvaluations`, la Banque) **ne se branchent pas** : commente-les.
- **Enregistrement automatique** : le nombre d'erreurs, le nombre de mots, le statut de remise **et l'intégrité** (statut IA, notes d'intégrité : même trou, relevé par l'inventaire) déclenchent le même enregistrement automatique que les niveaux (`_debouncerAutoSave`), avec le témoin. Les gardes de #959, #960 et #961 (chargement, rétroaction réécrite) doivent tenir : un chargement n'écrit rien.
- **Les messages de succès propres à l'évaluation** : « Évaluation sauvegardée : … » (`evaluation-sauvegarde.js`) et « Évaluation modifiée : … » (`evaluation.js`) partent ; le verrouillage dit « Évaluation verrouillée : ‹étudiant·e› – ‹production› », le déverrouillage « Évaluation déverrouillée : … » (mots du § 3). Un seul message par geste.
- **Les mots historiques ne se réécrivent pas** : les anciennes entrées de « Nouvelles » (`changelog-data.js`, 1.14x et avant) restent telles qu'elles ont été publiées.
- **Aide** : relève les textes de l'Aide qui parlent d'« Enregistrer » une évaluation (par exemple `index.html`, vers la l. 11715, « Clique sur Enregistrer… ») et du statut « Non enregistrée » ; ils changent avec le lot (D4 : Grégoire relit les textes touchés).
- **Identifiants internes** (`'non-enregistree'`, `nonEnregistree`) : garde-les si un réglage mémorisé (filtre retenu) les porte ; ne change que ce que l'écran affiche. Dis ce que tu as choisi.
- **Fiches** : cherche dans `BACKLOG.md` ET `Retours des testeurs/SUIVI-BUGS.md` les fiches ouvertes que ce lot règle (mots-clés : nombre d'erreurs, nombre de mots, statut de remise, « non enregistrée », cadenas, verrouiller) et liste-les dans la demande de relecture, avec « réglée / en partie / non ».

## 3 · Les mots – à faire accepter par Grégoire AVANT le push

Déjà décidés (D1) : « Verrouiller l'évaluation » ; « Non verrouillée » ; l'aide « ne compte pas encore dans la note ».

Proposés par Cowork :
- Bouton sur une évaluation verrouillée : **« Déverrouiller l'évaluation »**.
- Infobulles du cadenas : **« Verrouillée – clique pour déverrouiller »** / **« Non verrouillée – clique pour verrouiller »** (remplacent « Modifiable - Clique pour verrouiller »).
- Badge et filtre de la Liste : **« Non verrouillée »**, avec l'infobulle **« Non verrouillée : ne compte pas encore dans la note. »**
- Profil et bilan : **« évaluation non verrouillée, non comptée »** (et `· non comptée` là où c'est la forme actuelle).
- Messages : **« Évaluation verrouillée : ‹étudiant·e› – ‹production› »** ; **« Évaluation déverrouillée : ‹étudiant·e› – ‹production› »**. En anonymisation, le nom affiché est celui de l'anonymisation (règle du lot A).
- **Nouvelles** : « Évaluer : ton évaluation s'enregistre toute seule pendant que tu évalues, nombre d'erreurs, nombre de mots et statut de remise compris ; le témoin le dit. Le bouton « Enregistrer » devient « Verrouiller l'évaluation », et le cadenas fait la même chose : une évaluation compte dans la note une fois verrouillée. Dans la Liste, « Non enregistrée » devient « Non verrouillée ». »

## 4 · Preuves

- Par comportement : (a) changer le nombre d'erreurs, puis changer d'élève sans autre geste → la valeur est en base, le témoin a dit « Enregistré » ; idem nombre de mots, statut de remise, intégrité. (b) « Verrouiller l'évaluation » et chaque cadenas vivant appellent la même fonction et font la même vérification : une évaluation sans échelle résolue est refusée **par le cadenas aussi**. (c) Déverrouiller puis reverrouiller : la note du cours retire puis remet l'évaluation. (d) Un chargement (copie, Liste, en série) n'écrit rien (bancs #959-#961 verts). (e) La Liste, le profil et le bilan disent « Non verrouillée » / « non verrouillée, non comptée » ; plus aucun « Non enregistrée » à l'écran (`grep` sur ce qui s'affiche, historique de « Nouvelles » exclu).
- Mutations, chacune rouge : le nombre d'erreurs sans enregistrement automatique ; un cadenas qui verrouille sans la vérification ; un chargement qui écrit ; « Non enregistrée » laissé dans un badge ; deux messages pour un seul verrouillage.
- Vitest complet ; bancs WebKit voisins (#959, #960, #961, #939, #944, #946, lot A, lot B, `evaluation-*`) verts. Placement du bouton renommé (texte plus long) à 360, 768, 1024 et 1180 px : il ne passe pas sous le témoin du lot B ni ne pousse la barre.

## 5 · Livraison

- **Relecture croisée exigée** (ce qui fait entrer une évaluation dans la note) : commit → `plans de travail/DEMANDE-RELECTURE-2026-09-27-lot-C-evaluation.md` → relecture de Cowork → corrections → verdict → fusion.
- **Cases à cocher** : celles que ta recherche du § 2 trouve réglées, et elles seules ; ligne exacte sous les fiches réglées en partie.
- **Stock** : rien n'est réécrit. Une évaluation non verrouillée le reste ; une verrouillée le reste.
- Release `minor`. Les mots du § 3 et les textes de l'Aide acceptés par Grégoire avant le push.
- **Porte terrain** (iPad, copie réelle) : changer le nombre d'erreurs puis passer à l'élève suivant, revenir – la valeur est là ; verrouiller par le bouton, puis déverrouiller par le cadenas de la barre ; la Liste dit « Non verrouillée » pour une copie évaluée sans verrou.
