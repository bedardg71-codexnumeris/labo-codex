# CONSIGNE — « Recevoir », le temps où l'on regarde : les dix bulles, les copies refaites, et le petit lot de la perspective

Écrite par Cowork le 17 nov. 2026 vers 19 h 30, avec Grégoire (conversation du Projet de 18 h 10). Pour **la session du cloud de `claude/ecstatic-brown-urn6v8` (PR n° 28)**, qui a codé le modèle. Tout ce qui suit a été décidé avec Grégoire de 18 h 20 à 19 h 19 ; les décisions, leurs motifs et les mesures sont dans le document du Projet `claude/parcours-recevoir-modele-textes.md` (non lisible d'ici : l'essentiel est recopié ci-dessous).

**Ce qui ne change pas** : pas de fusion dans `main`, pas de release, pas de Nouvelles. Le commit « BRANCHE SEULEMENT » (`4c36db4`) reste et se défait toujours avant toute fusion. Chromium seulement dans le nuage ; le verdict WebKit viendra à la fusion, sur le Mac. Aucun nom réel nulle part.

**Ordre** : A (le petit lot, sur sa branche), puis B (les copies), puis C (les dix étapes et leurs textes), puis D (bancs et porte), puis E (rapport). Tranche toi-même le technique et dis-le en une ligne ; ce qui remonte à Grégoire : la didactique, ses données réelles, les mots que ses élèves lisent.

---

## A. Le petit lot : « Perspective » trouve les coins, et les réglages de lumière remplacent la balance automatique

Sur **sa propre branche, `lot/perspective-coins`, partie de `origin/main`** (`03dc7d2`, 1.249.0), poussée, PR en brouillon. Il change l'outil pour tous les enseignant·es, d'où la branche à part. **Puis fusionne `lot/perspective-coins` dans `claude/ecstatic-brown-urn6v8`**, pour que l'aperçu n° 28 le porte (la bulle 3 le suppose).

### A1. Au toucher de « Perspective », les poignées se posent sur les coins trouvés

Décidé par Grégoire (19 h 00) : « Oui, je suis content de reprendre cette fonctionnalité si elle est ajustable par l'utilisateur. Au départ, on la voulait automatique, mais ça n'a jamais bien fonctionné. »

Mesuré par Cowork sur `main` :
- `detecterCoinsDocument` (`js/travaux-preparation.js`, Canny + Hough, sur une copie réduite à 400 px) est arrivée le 18 févr. 2026 (`a9f86ac8`), réglée le même jour (`b183c449`, `1aab8e15`, `15088e6f` ; `a5a69b03` annulé par `c96f2726`) ; le bouton « Auto-perspective » a été retiré le 20 févr. (`6121f2b4`) ; la fonction n'a pas changé depuis (sauf les `console.log`, `9fc7417a`). `detecterCoinsAuto` existe, mais rien ne l'appelle ; `activerPerspective` pose les quatre poignées à 5 % et 95 % des bords.
- Essai de Cowork (Chromium, la fonction de `main` exposée dans une copie du fichier, sur les nouvelles photos de la partie B) : photo de Tapir sur le bureau (3024 × 4032), coins trouvés (0,049 ; 0,096) (0,852 ; 0,075) (0,946 ; 0,879) (0,068 ; 0,914), vrais coins (0,050 ; 0,106) (0,850 ; 0,073) (0,950 ; 0,880) (0,070 ; 0,917), en 145 ms ; photo de Loutre (la feuille remplit l'image) : `null`.

À faire : « Perspective » lance la détection ; les poignées se posent sur les coins trouvés, sinon à leur place actuelle ; l'utilisateur les ajuste comme aujourd'hui, puis « Confirmer perspective ». Un seul chemin : `activerPerspective` appelle la détection avec son repli, et le doublon `detecterCoinsAuto` disparaît (zéro-dette). Aucun mot d'écran neuf (le bouton reste « Perspective »). Banc : la photo de Tapir (partie B) donne des poignées à moins de 2 % des vrais coins ; celle de Loutre, le repli à 5 % ; break-test (la détection débranchée, le premier rougit).

### A2. Des réglages de couleur ou de lumière remplacent la balance automatique au lieu de s'y ajouter

Remarque de Grégoire (19 h 02) : les réglages spécifiques sont pour des photos d'exception ; ceux de l'utilisateur ne devraient pas s'additionner au traitement par défaut. Décidé (19 h 04).

Mesuré par Cowork sur `main` :
- le traitement automatique est la seule balance des blancs (`appliquerBalanceBlancsCanvas`, `js/travaux-ui.js` : chaque canal ramené au blanc d'après les 5 % de pixels les plus clairs), décidée par `balanceActiveePour(f)` (`BALANCE_GLOBALE_ACTIVE` et l'exception `skipBalance`) ;
- à l'import (`js/travaux-ui.js`, vers la l. 4663), `autoBalanceBlancs` s'applique à `f.fichier`, qui est déjà le rendu des réglages spécifiques (`reglagesEnRejeu`, `renduFinal`) : les deux s'additionnent ; les aperçus (vers les l. 1789 et 2787) lisent la même `balanceActiveePour` ;
- les types que le poste enregistre : `whiteBalance`, `brightness`, `contrast`, `exposure`, `grayscale` (couleur ou lumière) ; `fineRotation`, `crop`, `perspective` (et la rotation à 90°, à mesurer) (géométrie).

À faire : `balanceActiveePour(f)` rend `false` quand `f.operations` contient un réglage de couleur ou de lumière ; la géométrie seule laisse la balance s'appliquer. Une seule source, que l'import et les deux aperçus lisent déjà. Banc : une photo avec « Perspective » seule reçoit la balance ; une photo avec « Luminosité » ne la reçoit pas, à l'import comme dans l'aperçu ; break-test. Source ou stock : la file d'attente seulement (persistée depuis #884), aucune donnée d'évaluation touchée ; dis-le.

**Trouvaille de la même famille, à corriger dans ce lot** (mesuré) : `decrireOperation` (`js/travaux-ui.js`, le badge « Spécifique » de l'Aperçu) attend `contraste`, `luminosite`, `niveaux-gris`, `balance-blancs`, `rotation`, alors que le poste écrit `contrast`, `brightness`, `grayscale`, `whiteBalance`, `fineRotation` (et `exposure`, absent) : le badge affiche aujourd'hui le nom anglais brut (inférence d'après le `default`). Fais-le parler des types réellement écrits, en mots d'enseignant (« Luminosité +N », « Contraste +N », « Exposition +N », « Niveaux de gris », « Balance des blancs », « Rotation +N° », « Rognage », « Perspective ») ; mots d'écran lus par l'enseignant·e seulement : ils partent tels quels.

Nouvelles : aucune maintenant ; une ligne à proposer à Grégoire au moment de la release.

---

## B. Les trois copies, refaites

Validées par Grégoire de 18 h 28 à 18 h 46. Motif : en PDF, l'utilisateur ne voit ni l'ajustement automatique ni les réglages spécifiques (un PDF seul passe « (aucun traitement) », l'engrenage reste grisé, `btnReglagesDisabled`). Et la démo est « Pack démo A2025 » : les copies portaient « A2026 ».

**Récupère la branche `materiel/recevoir-dix-bulles`** (un commit de Cowork sur `597fb11`) **et fusionne-la dans `claude/ecstatic-brown-urn6v8`**. Elle porte, dans `plans de travail/materiel-2026-11-17-copies-deux-rives/` :
- `Enjouee_9900002_Artefact-1_Remis_le_2025-09-08_23h41m12s.jpg` : photo de téléphone, 2550 × 3300 px, environ 1,0 Mo (la feuille remplit l'image, légèrement de travers) ;
- `Doux_9900005_Artefact-1_Remis_le_2025-09-09_07h58m03s.jpg` : 3024 × 4032 px (12 Mpx), environ 1,5 Mo ; la feuille posée sur un bureau de bois clair, photographiée de biais (appareil penché de 7°, feuille tournée de 3,2°), sous une lampe jaune ; les quatre coins visibles sur le bois ; c'est elle qu'on redresse ;
- `Vaillante_9900006_Artefact-1_Remis_le_2025-09-08_19h22m47s.pdf` : une page lettre, une image JPEG de 2550 × 3300 à 300 ppp, environ 1,1 Mo (numérisée par une application) ;
- les trois en-têtes portent « A2025 » ; page, annotations et texte inchangés (même hasard, mêmes polices) ;
- les trois anciens PDF (datés de 2026 dans leur nom) sont retirés ;
- `fabrique/` : `gabarit.html`, `fabrique_hd.py` (les trois copies, capture Chrome à l'échelle 4), `tapir_bureau.py` (le bureau et la perspective) ; les polices (Caveat, Shadows Into Light, Kalam, licence OFL) se téléchargent de `github.com/google/fonts` (`ofl/caveat/Caveat[wght].ttf`, `ofl/shadowsintolight/ShadowsIntoLight.ttf`, `ofl/kalam/Kalam-Regular.ttf`) dans `fabrique/polices/`.

À faire : refais `js/materiel-copies-deux-rives.js` à partir de ces trois fichiers (mêmes noms, ceux de 2025 ; deux `image/jpeg`, un `application/pdf`) ; la sentinelle compare octet pour octet aux nouveaux fichiers ; les JPEG passent `validerMagicBytes`. Le script passe d'environ 1,1 Mo à environ 4,9 Mo en base64 : supposé acceptable, puisqu'il ne se charge qu'au clic sur « Remplir » ; s'il gêne un banc, la garde anti-cache ou le hook, dis-le. À l'import, les photos passent par la balance des blancs et « Rés. max. » (250 ppp par défaut) : l'étape de l'import attend la fin du traitement (déjà le cas, à revérifier avec des images plus lourdes).

---

## C. Les dix étapes et leurs textes

### La structure (décidée avec Grégoire)

Le modèle passe de neuf à **dix** étapes : la vérification et l'import se séparent, une étape s'insère pour redresser la photo de Tapir, et l'export fusionne avec la fin.

1. **Leurs productions** : inchangée (« Remplir » dépose les trois copies).
2. **Vérifie avant d'importer** : Évaluation › Préparer. Pointé : la copie de Tapir Doux dans la file, puis l'engrenage « Réglages spécifiques » (grisé tant qu'aucune image n'est choisie). Avance quand le poste de préparation s'ouvre sur la copie de Tapir. Si une autre copie est ouverte, une ligne le dit (à toi de la proposer, mots d'enseignant).
3. **Redresse une photo** : le poste de préparation (`#travaux-preparation-modal`, plein écran). Pointé : « Perspective » (section « Découpe »), puis « Confirmer perspective » (sur le canevas). La bulle **devient** sa seconde forme quand une opération `perspective` est appliquée ; pointé ensuite : « Confirmer les réglages spécifiques » (en-tête). Avance quand le poste se referme et que la copie de Tapir porte l'opération. La bulle passe au-dessus du poste et ne couvre ni l'image ni ses poignées, iPad debout et couché (à mesurer).
4. **Importe-les** : Préparer. Pointé : le menu « Production » sous « Inspecteur », puis « Importer », puis « Oui, importer ». Avance quand l'import est fini (comme l'ancienne étape 2).
5. **La liste** : l'ancienne étape 3.
6. **Tes tampons** : l'ancienne étape 4 (« Annuler », pas « Enregistrer » : décision maintenue). La bulle devient sa seconde forme quand la fenêtre des tampons est ouverte.
7. **Annoter** : l'ancienne étape 5.
8. **Évaluer** : l'ancienne étape 6 (ta garde plus ferme, maintenue).
9. **Ta rétroaction** : l'ancienne étape 7.
10. **Rends tes rétroactions** : les anciennes étapes 8 et 9 fusionnées. Première forme avant l'export ; la bulle **devient** la seconde à `travaux-export-lea-telecharge`. Fin du parcours : trois boutons de même poids, « Le refaire avec ma classe », « Voir le parcours suivant », « Terminer » (comme « Mettre ta classe en place »).

Le compteur dit « N sur 10 ».

### Les textes, mot pour mot

Conventions (celles de « Mettre ta classe en place » et de « Découvrir », déjà dans le moteur) : la ligne « C'est fait : … » est la confirmation (`confirme`) ; la ligne « Tu es dans … » nomme la section, encadrée ou pointée ; les lignes en **gras** sont les consignes (la ligne orange), toujours en dernier ; « devient » marque la seconde forme d'une bulle après le geste ; dans la dernière bulle, « Objectif atteint… » en gras entre deux filets ; dans la première, le rappel sur la poignée en petit et en gris. Les guillemets sont des chevrons avec espaces insécables, comme ailleurs.

**1 · Leurs productions**

À la fin de ce parcours, tu seras en mesure de décrire le chemin d'une production dans l'application, de sa remise à la rétroaction que tu rends.

Tu es dans « Évaluation », à la section « Préparer » : c'est là que tu reçois les productions de tes étudiant·es.

Dans la démo, trois étudiant·es du deuxième groupe t'ont remis leur production. Rien ne touche à tes données.

– Avec ta classe, elles viennent de Léa : tu les télécharges, puis tu les déposes ici
– **Regarde-les arriver : touche « Remplir »**

(en petit, gris) Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir.

**2 · Vérifie avant d'importer**

C'est fait : les trois copies sont dans la zone. Rien n'est encore importé.

– Sous « Originaux », les trois fichiers déposés : deux photos et un PDF
– Sous « Aperçu », chaque copie a trouvé son étudiant·e : Léa a mis son DA dans le nom du fichier, et l'application l'a lu
– C'est le moment de vérifier qu'aucune copie ne s'est trompée de nom
– Les deux photos ont déjà été ajustées : l'application a corrigé leurs couleurs (la balance des blancs). Le PDF passe tel quel
– La photo de Tapir Doux a été prise de travers : on la redresse avant d'importer
– **Touche la copie de Tapir Doux, puis l'engrenage « Réglages spécifiques »**

**3 · Redresse une photo**

C'est fait : les réglages de la photo de Tapir Doux sont ouverts.

Tu es dans les réglages spécifiques : ce que tu y fais ne touche que cette photo.

– Dans « Découpe », l'outil « Perspective » remet droite une feuille photographiée de biais
– Il cherche les coins de la feuille et y pose une poignée ; s'il en rate un, tu le glisses à sa place
– **Touche « Perspective », puis ajuste les poignées au besoin**
– **Touche « Confirmer perspective »**

Devient :

– La feuille remplit maintenant l'image, droite, comme vue d'en haut
– Tu n'as rien d'autre à régler : à l'import, l'application ajuste d'office les couleurs de chaque photo
– Les réglages spécifiques, c'est pour une photo d'exception : prise de travers, trop sombre, mal cadrée
– **Touche « Confirmer les réglages spécifiques »**

**4 · Importe-les**

C'est fait : la photo de Tapir Doux est redressée.

– Sous « Aperçu », sa copie porte maintenant la mention « Spécifique : Perspective » : son réglage s'appliquera à l'import
– Il reste à dire à quelle production les trois copies répondent : leur grille et leur cartouche viendront avec elle
– **Sous « Inspecteur », choisis la production « Appliquer des stratégies de lecture variées (Deux-Rives) »**
– **Touche « Importer », puis « Oui, importer »**

(Le titre de la production vient de la donnée, comme aujourd'hui avec `choisir(titre)`.)

**5 · La liste**

C'est fait : les trois copies sont importées.

Tu es dans « Évaluation », à la section « Liste » : c'est là que tu vois où en est chaque copie de ton groupe.

– Loutre Enjouée, Tapir Doux et Antilope Vaillante : « Importé ». Leur copie attend d'être annotée et évaluée
– Les sept autres étudiant·es ont déjà leur évaluation, posée par l'exemple, sans copie : l'export, à la fin, portera ainsi sur une classe entière
– **Sur la ligne de Loutre Enjouée, touche « Actions › Annoter »**

(La ligne « Ce modèle travaille la copie de Loutre Enjouée : reviens à la Liste et ouvre la sienne. » reste, pour une autre copie ouverte.)

**6 · Tes tampons**

C'est fait : la copie de Loutre Enjouée est ouverte.

Tu es dans « Évaluation », à la section « Annoter » : c'est là que tu lis la copie et que tu y écris, comme au stylo.

– La palette « Tampons » : un tampon est un signe que tu poses sur la copie ; chacun ajoute sa phrase à la rétroaction de l'étudiant·e
– Ces phrases sont les tiennes : tu les écris une fois, elles servent d'une copie à l'autre et d'un trimestre à l'autre
– **Touche l'engrenage de la palette « Tampons »**

Devient :

– Chaque tampon, avec la phrase qu'il ajoute
– Dans la démo, on regarde sans enregistrer : ces réglages sont les tiens, hors de la démo
– **Lis les phrases, puis touche « Annuler »** (avec ta classe, tu les réécris à ta façon et tu touches « Enregistrer »)

**7 · Annoter**

C'est fait : tu as vu tes tampons.

– Les couleurs et les notes déjà sur la copie sont celles de Loutre Enjouée : sa tâche était d'annoter le texte avec trois stratégies de lecture
– Pour un commentaire, prends l'outil « Texte » : tu tapes un paragraphe lisible, qui reste d'un seul tenant
– Garde le « Stylo » pour encercler, souligner ou tracer une flèche : écrit à la main, chaque trait devient un élément à part sur la page
– Ici, on essaie les outils (texte, stylo, tampons), l'endroit importe peu. Loutre retrouvera tes marques dans le PDF que tu lui rendras
– **Quand tu as fini, touche « Annoter ▾ », puis choisis « Évaluer »**

**8 · Évaluer**

C'est fait : tu es en mode Évaluer.

– La palette « Évaluation » reprend ce que porte la production : sa grille (les critères), son échelle (les niveaux) et sa cartouche (une phrase de rétroaction prévue pour chaque critère et chaque niveau)
– Tout ça est déjà en place : tu n'as rien à choisir
– **Choisis un niveau pour chaque critère, celui que tu veux** (suggestion pour suivre l'exemple : M, D, D, D)

**9 · Ta rétroaction**

C'est fait : chaque critère a son niveau.

– La palette « Rétroaction » montre ce que Loutre Enjouée lira
– « Générale » : les phrases de la cartouche, choisies d'après les niveaux que tu viens de donner
– « Spécifique » : les phrases des tampons que tu as posés sur sa copie
– « Bilan » : ses défis et sa force du moment ; plus tard, son progrès d'une production à l'autre
– Verrouiller dit que l'évaluation est terminée : seules les évaluations verrouillées partent à l'export
– **Relis, puis touche le cadenas « Verrouiller »**

**10 · Rends tes rétroactions**

C'est fait : l'évaluation de Loutre Enjouée est verrouillée.

Tu es dans « Évaluation », à la section « Exporter » : c'est là que tu prépares ce que tu remets à tes étudiant·es.

– Huit évaluations verrouillées partent : celle de Loutre Enjouée et les sept de l'exemple
– Tapir Doux et Antilope Vaillante n'ont pas encore d'évaluation : rien ne part pour eux
– Chacun·e reçoit un PDF : sa copie annotée et sa synthèse, ou sa synthèse seule s'il n'y a pas de copie
– **Dans la carte « Export Léa », choisis la production « Appliquer des stratégies de lecture variées (Deux-Rives) » et laisse « Étudiant·e » à « — Tous — »**
– **Touche « Exporter pour Léa »**

Devient (le fichier ZIP téléchargé) :

– Garde ce fichier tel quel : son nom, avec la production et la date, en fait une archive facile à retrouver
– Pour Léa, fais-en une copie renommée « travaux.zip » : c'est le nom qu'elle attend pour remettre chaque PDF à l'étudiant·e dont il porte le nom et le DA
– **Objectif atteint : tu es en mesure de décrire le chemin d'une production dans l'application, de sa remise à la rétroaction que tu rends.** (entre deux filets)
– Chaque parcours a son objectif. C'est toi qui choisis la suite
– Pour revoir une étape, touche « 10 sur 10 »

Trois boutons de même poids : « Le refaire avec ma classe », « Voir le parcours suivant », « Terminer ».

**Ne change pas** : le nom du ZIP (`Lea_<production>_<date>.zip`) : Grégoire le garde en archive comme un standard ; la bulle dit de renommer une copie. Les PDF s'appellent déjà `Nom_DA_<production>_Evalue.pdf` (mesuré).

**Ce que tu peux proposer toi-même** (mots lus par l'enseignant·e seulement : ils partent tels quels, corrigeables) : la ligne pour une autre photo choisie à l'étape 2 ; le refus du panneau, s'il doit changer. Si une bulle dit quelque chose que l'écran contredit (un nom de bouton, une section, ce qui paraît sous « Aperçu »), ne la change pas : signale l'écart au rapport, avec ce que montre l'écran.

---

## D. Bancs et porte

- Les bancs A, B, C mis à dix étapes ; B passe par le redressement (poignées, « Confirmer perspective », « Confirmer les réglages spécifiques ») et l'import des photos ; aucune donnée réelle touchée, clés comme fichiers ; break-test pour chaque garde neuve (étape 2 sur la copie de Tapir, étape 3 sur l'opération `perspective`).
- Les bancs de A1 et A2 (plus haut), sur `lot/perspective-coins`.
- Vitest vert depuis `tests/`.
- **La porte terrain** : le markdown dans `plans de travail/` (ton livrable) ; Cowork la mènera dans la conversation, un geste à la fois, sans artefact. Gestes à y mettre, ceux que seul l'iPad tranche : les dix bulles lisibles sans masquer ce dont elles parlent, debout et couché ; le redressement au doigt (les poignées posées sur les coins, un ajustement, la feuille droite) ; le temps de l'import des deux photos ; l'export et le ZIP.

## E. Rapport

En tête, le bloc de quinze lignes pour la conversation du Projet, comme ce soir. Puis : ce qui est fait, les écarts avec cette consigne (et pourquoi), ce que tu as supposé, ce qui n'est pas vérifié. Pousse `lot/perspective-coins` (PR en brouillon) et `claude/ecstatic-brown-urn6v8` (la PR n° 28 se met à jour) ; donne l'aperçu n° 28 et son build.
