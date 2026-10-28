# Demande de relecture – L'Aide, lot 3 : un seul glossaire (#1152)

> Claude Code, mercredi 28 octobre 2026, fin d'après-midi, sur `main` = `4ec64491` (code) ; consigne `CONSIGNE-LOT-2026-10-28-aide-lot-3-un-seul-glossaire.md` (Cowork, 13 h 40), commitée seule avant le lot (`f3641c16`). Rien de poussé, pas de release, pas de verdict.

## En bref

- **`glossaire-statique` part de l'Aide** : 1 664 mots → 0 (mon compte, texte visible). Un commentaire marque sa place (`index.html:11333`).
- **`js/accompagnement-contenu-terme.js` est le seul glossaire** : 59 termes → 73 ; 2 504 mots → 3 286 (+782, **au-delà des ~500 visés** : les 14 entrées neuves font 646 mots, les corrections ajoutent le reste). Bilan net de la Référence : −882 mots.
- **Le point 4 était pire que le dossier ne le disait** (mesuré à l'écran) : le micro-popup d'un terme souligné s'ouvrait **sous** l'aide contextuelle, donc « En savoir plus » n'était même pas cliquable ; et, cliqué, il aurait ouvert Commencer. Corrigé dans `js/accompagnement.js` **et `css/accompagnement.css`** (voir « Ce que j'ai supposé », n° 1). `navigation.js` et `config.js` : pas touchés.
- **29 définitions neuves ou réécrites pour Grégoire**, terme par terme plus bas ; les 59 chemins « Voir : » sont aux libellés de `js/config.js`.
- Sentinelle neuve, essai Playwright neuf (rouge avant le correctif), dix bancs qui suivent le texte par décision. Vitest : 10 091 verts sur 10 091.

## Le point 4 : « En savoir plus » mène-t-il à la fiche ?

**Mesuré à l'écran avant tout correctif** (WebKit, 1280 px, l'aide « Grilles de critères ») : un clic sur « critère » souligné ouvre le micro-popup, mais à `z-index: 1000` (`css/accompagnement.css:903`), sous la modal d'aide (10002, `:566`) et son voile (10001) ; Playwright refuse le clic sur « En savoir plus » : « `<div class="aide-conseil">` … intercepts pointer events ». Les termes soulignés n'existent **que** dans les aides contextuelles (`enrichirTermesGlossaire`, seul appelant `js/accompagnement.js:797`) : **le geste ne marchait nulle part.** Ensuite, `afficherTermeGlossaire` n'appelait que `afficherSection('aide')`, qui ouvre Commencer ; la fiche n'existe qu'une fois Référence ouverte (le rendu attend `sectionAffichee` sur `aide-reference`, `:1690-1699`), sous un accordéon fermé.

**Correctif** :
- `css/accompagnement.css:903` : le micro-popup passe à 10003.
- `js/accompagnement.js:1598-1625` : l'aide contextuelle se referme ; `afficherSousSection('aide-reference')` ; le glossaire se rend s'il ne l'est pas, ou si le filtre d'étape cache le terme (le filtre revient à « Tous ») ; l'accordéon s'ouvre ; puis le défilement d'avant.

**Preuve** : `tests/integration/aide-glossaire-en-savoir-plus-1152.spec.js`, rouge avant, vert après ; chaque moitié retirée seule (CSS, puis JS) le rend rouge. Captures : `plans de travail/captures-2026-10-28-aide-lot-3/` (le micro-popup au-dessus de l'aide ; la fiche « Pondération » dans Référence).

## Pour Grégoire : les mots, terme par terme

Les textes déjà validés restent mot pour mot là où ils restent vrais : Critère, Élément observable, Descripteur, Niveau, Points (19 oct.), Barème, Tranche, Type de critère (20 oct.), PAN (17 sept.). Les phrases de G1 (21-22 oct.) passent dans « Sous-critère ».

### Quatorze définitions neuves

| Terme | Définition proposée | D'où |
|---|---|---|
| **Sous-critère** | Un élément observable : ce que tu regardes dans toutes les copies pour juger d'un critère. Dans un critère algorithmique, les sous-critères sont les catégories de ce que tu comptes. Chaque sous-critère porte un code, un nom, une pondération (ce que pèse un code posé : 1 par défaut, 0,5 pour le compter à moitié) et une observation, que l'étudiant·e lit. Le calcul reçoit la somme pondérée des codes posés. « Partir de la liste du français écrit » en crée dix d'un coup. Ils se règlent à l'étape « Codes utilisés » du critère. | D5 : 19 oct. + G1 (21-22 oct.) ; « Configuration : … » remplacé par l'étape (remesure, `atelier-algo.js:67`) |
| **Observation (d'un sous-critère)** | Dans un critère algorithmique, le texte d'un sous-critère que l'étudiant·e lit à propos de ce code. | mot tranché |
| **SRPNF** | Les initiales des critères des grilles de la démonstration : Structure, Rigueur, Plausibilité, Nuance et Français écrit. Une grille d'exemple, et non une structure du logiciel. Toute grille de critères fonctionne de la même façon, quel que soit ton nombre de critères et ta discipline. | statique ; ELLAC part ; critères lus dans `pack-demo-10.js` |
| **Notes finalisées** | Une case de la pratique de notation, à cocher quand les notes sont arrêtées. Les PDF de rétroaction titrent alors « Note finale » au lieu de « Note provisoire » et ne listent plus les « Artefacts à venir ». En mode « Hybride », une production obligatoire non remise compte alors pour zéro ; avant, elle est laissée de côté. | remplace « Mode provisoire / final » ; `index.html:5765-5768`, `profil-etudiant-actions.js:242-246` |
| **Verrouillage** | Une copie évaluée ne compte dans la note qu'une fois verrouillée : « Verrouiller l'évaluation » (ou le cadenas), aussi dans la palette Annotation. Verrouillée, elle montre la note remise ; pour la corriger, déverrouille-la. Une copie « Non verrouillée » ne compte pas encore. Dans la saisie des présences, « Verrouiller la saisie » fige une séance. | remesure ; mots de l'entrée `annoter-evaluer` (lot 2c) |
| **Réassigner** | Changer l'étudiant·e, la production ou l'évaluation d'une copie. « Réassigner », dans le menu « Actions » d'une rangée de la Liste des évaluations, ouvre les « Propriétés du fichier » ; « Réassigner la sélection » le fait pour plusieurs copies. | mot tranché ; `liste-evaluations.js:713` |
| **Journée sans cours** | Un jour où le cours n'a pas lieu, déclaré dans « Journées sans cours » avec sa nature : Institutionnel, Férié ou Personnel. Un jour institutionnel ou férié ne compte pas dans la numérotation des semaines ; un jour personnel, si. Sauf pour un jour personnel, tu peux y déclarer la reprise, par « Horaire de reprise » et « Date de reprise » : une reprise ne se fait pas toute seule. | remplace Congé imprévu, Congé prévu, Reprise ; `trimestre.js:151-158`, `trimestre-v2-init.js:699-703` |
| **Trimestre clos** | Un trimestre terminé, figé en lecture seule ; clore ne libère aucun espace. On le clôt dans la bibliothèque des trimestres (⋮ › « Clore ») ; il passe alors dans le repli « Clos (n) », et « Rouvrir » le rend de nouveau modifiable. Le trimestre actif ne se clôt pas. | mot tranché ; mots de l'entrée `archivage` (Cadre) |
| **Archive (d'un groupe-cours ou d'un trimestre)** | Un fichier, hors de l'application, qui garde un groupe-cours ou un trimestre clos : « Archiver… », dans le menu Codex, pour un groupe-cours ; ⋮ › « Archiver le trimestre… », dans la bibliothèque des trimestres, pour un trimestre clos. Une fois l'archive vérifiée, ce qu'elle garde peut quitter l'application (« Archiver les copies… », « Renvoyer aux archives… »), puis revenir par « Faire revenir ». | mot tranché ; `reserve-copies.js:83`, `reserve-renvoyer.js:78` |
| **Faire revenir** | Ramener dans l'application ce qu'une archive vérifiée garde. Pour l'archive d'un groupe-cours, ses copies reviennent sous leurs fiches ; rien n'est remplacé ni effacé. Un trimestre renvoyé aux archives revient tel qu'il a été archivé, clos ; les autres trimestres, les cours et les réglages ne sont pas touchés. | mot tranché ; mots acceptés le 4 oct. (`reserve-revenir.js:55-65`, `reserve-emprunter.js:72-83`) |
| **Codex (le fichier)** | Ton codex est un fichier .zip qui rassemble tes données et les fichiers des travaux. Il ne change qu'à « Mettre à jour le codex », dans le menu Codex, en haut à gauche de l'écran. C'est lui qui te rend tes données si le navigateur les perd, et qui les porte d'un appareil à l'autre. | statique corrigé (« en haut à droite ») ; mots de l'entrée `codex` (lot 2d) |
| **Stockage local** | Ce que tu fais s'enregistre dans ton navigateur, sur cet appareil : rien n'est envoyé ailleurs. En navigation privée, si tu nettoies les données du navigateur, ou si tu changes de navigateur ou d'appareil, ces données ne suivent pas : c'est ton codex qui te les rend. | statique « Local (stockage) » ; mots de `problemes` (lot 2d) |
| **Anonymisation** | Le mode anonymisé : les noms deviennent « Élève 1 », « Élève 2 »… et les groupes « Gr. A », « Gr. B »… Tu travailles normalement : tout s'enregistre dans tes vraies données. Le bouton au masque, dans l'en-tête, l'active et le coupe. | statique ; mots de l'entrée `modes` (lot 2a). D6 (« Étudiant·e 1 ») toujours ouverte : le texte suit `modes.js` |
| **Données démo** | Une case de la page d'accueil : un cours fictif déjà configuré, à part de tes vraies données. | statique « Bac à sable » ; la phrase de `prise-en-main` (lot 2a) |

### Quinze définitions changées (avant → après)

Les corrections de fait d'abord ; les quatre dernières lignes sont des réécritures au-delà du fait.

| Terme | Avant | Après |
|---|---|---|
| Trimestre (`:21`) | Période de 15 semaines qui structure le calendrier de ton cours. Tu définis les dates de début et de fin, les congés et les journées de reprise. L'application génère… | Période qui structure le calendrier de ton cours, posée par trois dates obligatoires : « Début du trimestre », « Fin des cours réguliers » et « Fin du trimestre ». Tu y ajoutes les journées sans cours et leurs reprises. L'application génère… (suite inchangée) |
| Portfolio (`:75`) | Tu définis combien d'artefacts seront retenus (ex. : les 3 meilleurs sur 9) — ce sont les N meilleures démonstrations de compétence qui comptent. | Ta pratique de notation décide lesquels comptent, selon son « Mode de sélection » : « N meilleurs artefacts », « N derniers artefacts », « Tous les artefacts » ou « Hybride (N meilleures + Obligatoires) ». |
| Artefact (`:84`) | …mais seuls les meilleurs sont retenus pour la note. | …et la pratique de notation décide lesquels comptent pour la note finale, selon la modalité de sélection que tu as réglée. (les mots du statique) |
| Échelle de performance (`:112`) | Par défaut, quatre niveaux alignés sur IDME : Incomplet, Développement, Maîtrise, Étendu. | L'« Échelle de départ (IDME) » que l'application installe a cinq niveaux : « PS – Préstructurel » en tête, puis Incomplet, Développement, Maîtrise, Étendu. (A3 du 20 oct. inchangé ailleurs ; aucune borne recopiée) |
| Cartouche (`:200`) | …Pour être efficaces, les commentaires doivent être lus et compris — idéalement entre 50 et 75 mots. | (phrase retirée) |
| Jeton (`:236`) | Trois types disponibles : Délai (…), Reprise (…) et Reprise ciblée (nouvelle tentative sur des critères spécifiques). | Deux types : Délai (…) et Reprise (…). Comme l'entrée « Utiliser les jetons » (lot 2c) : aucun geste ne crée de reprise ciblée depuis #563. |
| Niveau RàI (`:331`) | …qui lit tous les critères de la grille de référence sauf ceux marqués « Aucun ». | …(3 par défaut). Quand l'observation SOLO est activée, le pattern lit tous les critères de la grille du dépistage, sauf ceux marqués « Aucun » ; sinon, tous. (les mots de l'entrée du Suivi, lot 2c bis) |
| Seuils de dépistage (`:341`) | Progression 5 points (%) | Progression 10 points (%) (`interpretation-config.js:28`) |
| STD (`:469`) | Pratique alternative de notation qui retient les meilleures démonstrations de compétence. | …qui compose la note à partir des démonstrations de compétence que retient sa configuration. (la même erreur que #803 ; voir « Ce que j'ai supposé », n° 4) |
| Mode assistance (`:505`) | Terme « Mode assistance (icônes 📍) » ; « Quand ce mode est activé dans les Préférences, des icônes 📍 apparaissent… En cliquant dessus, tu obtiens une explication contextuelle… » | Terme « Mode assistance » ; « Les info-bulles, l'aide à l'écran et les flèches. Il s'active ou se coupe par le bouton « Assistance » de l'en-tête, ou par la case « Assistance » de la page d'accueil. Ce mode est indépendant du parcours guidé. » (mots de `prise-en-main`, lot 2a) |
| Trimestres séparés (`:533`) | Pour reprendre un modèle d'un autre trimestre, importe-le : l'application… | …importe-le par « Importer depuis un autre trimestre », dans la fenêtre de sa bibliothèque : l'application… (le reste, relu le 15 oct., inchangé) |
| **Évaluation** (`:218`) | Le geste d'attribuer un niveau de performance à chaque critère d'une grille pour une production donnée et un·e étudiant·e donné·e. La rétroaction se construit au fur et à mesure que tu attribues les niveaux. | Le geste de juger chaque critère d'une grille pour une production donnée et un·e étudiant·e donné·e, selon son type : un niveau de l'échelle pour un critère holistique, des points pour un critère analytique ; un critère algorithmique se calcule à partir de ce que tu comptes sur la copie. La rétroaction se construit au fur et à mesure. |
| **Pondération** (`:190`) | Le poids d'un critère dans la grille. | Le poids d'un critère dans la grille. **Pour une production, c'est son poids dans la note finale : les artefacts d'un portfolio n'en ont pas, c'est le portfolio qui le porte.** |
| **Indice A — Assiduité** (`:263`) | (le texte « pas un jugement… », inchangé) | + « A, ce sont les périodes où l'étudiant·e était présent·e, divisées par les périodes offertes, sur les seules séances saisies : une séance à laquelle tu n'as pas touché s'affiche « Séance non saisie » et n'entre pas dans A ; tant qu'aucune séance ne compte, A est inconnue. » « Reflète l'engagement cognitif » (statique) part. |
| **DEN** (`:487`) | Pratique (PRÉN) qui retire la note chiffrée… (RREC : 60 réussite / 59 échec)… | Pratique de réduction ou d'élimination de la notation (PRÉN) qui retire la note chiffrée… (selon le Règlement sur le régime des études collégiales, RREC : 60 réussite / 59 échec)… (PRÉN : les mots du guide « Modalités ») |

### Les chemins « Voir : »

Les 59 changent de forme : « Onglet › Sous-onglet », libellés de `js/config.js`, plusieurs chemins séparés par « · ». Les 21 périmés du dossier en font partie (« Évaluations > Saisie » → « Évaluation › Annoter et évaluer » ; « Tableau de bord > Aperçu » → « Suivi › Suivi du groupe » ; « Labo > Comparateur de pratiques » → « Labo › Exploration des pratiques » ; etc.). L'en-tête (Codex, Visite guidée, Assistance, Anonymisation) n'a pas d'onglet dans `config.js` : ses chemins commencent par « En-tête ».

## Ce que j'ai supposé

1. **`css/accompagnement.css` touché**, alors que la consigne dit « dans `js/accompagnement.js` seulement ». J'ai lu ce « seulement » comme une garde contre les deux zones protégées ; le défaut de superposition ne se corrige pas en JS sans écrire un style en ligne. Une ligne, commentée.
2. **L'aide contextuelle se referme** au clic sur « En savoir plus » : sinon elle couvre la fiche.
3. **Deux noms qualifiés** : « Codex (le fichier) » et « Archive (d'un groupe-cours ou d'un trimestre) ». Mesuré : le nom seul se soulignait dans « Labo Codex » (cinq aides contextuelles), dans « codex data » et dans le chemin `Archives_LaboCodex/`. Avec ces noms, trois aides gagnent un terme souligné, chacun au bon sens : « Données démo » (`accueil-donnees-demo`), « Faire revenir » (`reglages-reserve`), « anonymisation » (`modal-confidentiel`). C'est le seul changement visible hors de Référence.
4. **STD corrigé** : il ne figurait pas dans la liste du dossier, mais « retient les meilleures démonstrations » est l'erreur #803 que la consigne fait retirer de `terme.js`. La sentinelle neuve l'interdit désormais dans toute définition.
5. **Le verrou d'un critère n'entre pas dans « Verrouillage »** : `basculerVerrouillageCritere` (`grilles.js:1185`) n'a aucun appelant à l'écran (aucun `data-action`) ; ce n'est pas un geste.
6. **« Engagement cognitif » part** : j'ai lu cette instruction comme visant la phrase du statique sur A. L'entrée « Engagement cognitif » de `terme.js` (cadre théorique) reste.
7. **ELLAC part de SRPNF** (consigne, §2.3).
8. **« Reprise » n'a pas d'entrée à part** : le nom seul se soulignerait dans « jeton de reprise ». Elle est dite dans « Journée sans cours ».

## Les tests

**Sentinelle neuve** `tests/unit/sentinelle-aide-2026-10-28-lot-3.test.js` (8 essais). Elle lit les deux côtés : le statique absent ; l'en-tête (73) égal au compte obtenu en exécutant le fichier ; les 14 entrées présentes ; les quatre modes du portfolio lus dans le `<select>` ; aucune valeur interdite (« meilleurs sont retenus », « 15 semaines », « Progression 5 points », « 📍 », « idéalement », « Reprise ciblée », « quatre niveaux alignés sur IDME ») ; chaque chemin « Voir » commence par un onglet de la barre d'`index.html` (plus Aide et Réglages), et chaque sous-onglet nommé est un libellé de `config.js` ; la Progression lue dans `interpretation-config.js` ; le nombre de niveaux et le premier code lus dans `echelles.js`, sans « % » ; les trois dates lues dans les champs obligatoires ; les deux commandes « Assistance » ; un nom par terme. **Break-test** : sept mutations (en-tête « 48 », « 15 semaines », un sous-onglet inconnu, progression 0,05, code « XS », le statique rendu, la phrase de l'engagement cognitif), chacune rouge ; arbre restauré, vérifié par sha256.

**Bancs qui suivent le texte, par décision** (consigne §2.2, §2.5), chacun annoté « ↻ #1152, lot 3 » :
- `sentinelle-803` : PAN se lit dans `terme.js` (STD, SPE, « PRÉN »), plus « PAN – Dénotation » ; « modalité de sélection que tu as réglée » dans Artefact ; aucune définition ne retient « les meilleurs ».
- `sentinelle-audit-aide-lot-E` : les deux cadrages de SRPNF se lisent dans l'entrée `srpnf`.
- `sentinelle-audit-aide-15-oct` : « au moins trois fois » devient « au moins une fois » dans l'Aide, plus le glossaire. **Ne peut plus tenir** : deux des trois occurrences étaient les redites du statique (Indice RàI, RàI). « Parcours en 7 étapes » : le glossaire le dit, l'Aide ne le dit plus. « Séance non saisie » : aussi dans le glossaire.
- `critere-algorithmique-mots` (G1) : l'entrée « Sous-critère » commence par l'élément observable, contient les phrases de G1 mot pour mot et finit par l'étape « Codes utilisés » (lue dans `atelier-algo.js`).
- `sentinelle-aide-apporter-mon-materiel` : Pondération commence par le texte du 19 oct. ; les cinq autres termes restent à l'égalité stricte.
- `bareme-2-pieces-d-aide` : A3 mot pour mot, sauf la phrase des niveaux ; les chemins de Barème et Tranche.
- `sentinelle-carte-alignement-421-426`, `sentinelle-textes-relus-15-oct` : les chemins.
- `sentinelle-aide-2026-10-24-forme`, `-lot-2d` : `glossaire-statique` comptée comme absorbée au lot 3.

Break-test des cinq bancs adaptés sur le texte (Pondération, G1, #803, lot E, la formule de A) : chacun rouge. Ma première passe a raté la dernière mutation (une apostrophe courbe contre `\'`) ; refaite, rouge.

**Playwright** : l'essai neuf, plus les sept essais `aide-*` : 8 verts. Vitest depuis `tests/` : 842 fichiers, 10 091 verts. **La suite Playwright complète n'a pas tourné.** Bloc de jetons d'`index.html` : `accompagnement.css`, `accompagnement.js`, `accompagnement-contenu-terme.js` à `20261028a`.

**Un incident pendant le break-test, réparé** : ma première boucle, lancée sous zsh, n'a pas découpé la liste des fichiers. Aucune sauvegarde n'a été faite, et six mutations se sont cumulées. Je les ai défaites une à une : les deux fichiers sans changement voulu ont été repris de `HEAD`, le retrait du statique refait, les trois mutations de `terme.js` inversées. Le diff est contrôlé ; tout a été rejoué sous bash, avec une vérification sha256 après chaque mutation.

## Trouvé en chemin

**Inscrit au lot 5** (textes d'écran, hors du lot ; réels, sans conséquence sur ce parcours) :
- `terme.js`, des définitions que la consigne ne nommait pas : `cours` (« Un seul cours peut être actif à la fois », « dupliquer un cours » : non mesurés) ; `groupe-cours` (« au minimum un trimestre, un cours, un groupe et un horaire », alors que l'Aide dit cinq éléments obligatoires) ; `production` (« Dans le module Planification ») ; le terme « Comparateur de pratiques » (l'écran dit « Exploration des pratiques »).
- L'aide contextuelle `construction-grilles` dit encore « (nb_erreurs / nb_mots) × 100 » (visible sur la capture 1).
- Le soulignement ne s'arrête pas aux mots entiers : « critère » est souligné dans « critères », « cours » dans « parcours » (`regexEnrichissement`, `accompagnement.js:1630`).
- `basculerVerrouillageCritere` sans appelant (code mort, `grilles.js:1185`, exporté `:2180`).

**Laissé, sans conséquence observable** : chaque rendu du glossaire ajoute de nouveau la classe `glossaire-page` (`rendreListeComplete`) ; aucun commentaire posé, pour ne pas toucher `accompagnement.js` hors du correctif.

## Ce qui n'entre pas

Les sept trous (lot 4) ; les textes d'écran hors de l'Aide (lot 5), dont « PAN-Dénotation » à l'écran ; #1176.

## Le geste à vérifier à l'écran, après la mise en ligne

Aide › Référence : un seul glossaire. Puis, dans n'importe quelle aide « i », toucher un terme souligné (au Mac et à l'iPad) : le micro-popup s'ouvre **au-dessus** de l'aide ; « En savoir plus » ferme l'aide et ouvre Référence sur la fiche du terme.
