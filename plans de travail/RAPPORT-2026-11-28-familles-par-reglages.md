# Rapport – la famille d'une pratique se déduit de ses réglages (28 novembre 2026)

**Branche** : `claude/famille-pratique-reglages-fzu7ax` (le mandat nommait `lot/familles-par-reglages-2026-11-28` ; la session cloud était assignée à cette branche-ci, signalé à l'ouverture). **Base** : `lot/renommage-second-lot-2026-11-28`, `6cff76e`.
**Fait** : la fonction unique au registre, tous les lecteurs branchés, les 14 textes posés, la sentinelle neuve (52 essais), 10 bancs existants réécrits, 10 break-tests rouges, Vitest vert en entier.
**Pas fait, par mandat** : aucune fusion vers `main`, aucun bump de version, aucun changelog. Les jetons anti-cache `?v=` des 13 fichiers `js/` modifiés sont montés dans `index.html` (le hook de pré-commit l'exige ; `version.json` n'est pas touché).
**Reste** : le verdict WebKit (Mac) ; **B du second amendement, non codé** (§ 0 bis : la démo n'offre des jetons que par le défaut du moteur, arrêt demandé par le mandat) ; les listes de textes à relire (§ 6 et § 0 bis). Les deux conséquences renvoyées au premier rapport ont été tranchées : le modèle de la vue simple est renommé (fait) ; la fiche d'une ancienne pratique sans réglage attend B.
> ⚠ **D'ICI LA RELEASE, LA DÉMO DE CETTE BRANCHE N'OFFRE PLUS DE JETONS. C'EST ATTENDU** (troisième amendement, 9 h 05). Ses trois pratiques n'ont aucun réglage de jetons, et le moteur ne prête plus le défaut. La reprise et la reprise ciblée déjà présentes dans son corpus restent comptées, affichées et retirables. La déclaration s'écrit dans `js/pack-demo-10.js` au mandat de release : les lignes exactes sont au § 0 ter.

**Arrêt du matin** : la mesure a déclenchait l'arrêt prévu au mandat ; tranché par Cowork à 8 h 00 (réglage DÉCLARÉ : sans réglage, CUM).

## 0. Amendement du 28 nov., 8 h 40 (décidé par Grégoire à 8 h 36)

Dans une cumulative, seuls les travaux certificatifs ou sommatifs entrent dans le cumul ; « toutes les productions comptent » était trop fort.

**Fait.** Les textes 1, 4, 8 et 13 sont remplacés par ceux de l'amendement, à leur source, au fichier de textes validés et dans les bancs ; les dix autres n'ont pas bougé. Le survol du badge CUM du § 9 et la référence épinglée de la vue simple suivent le texte 8. La table de la règle gagne trois cas, tous CUM : des productions écartées pour tout le groupe (`configuration.productionsExclues`), pour chacun des deux types, et des évaluations formatives déclarées dans la pratique. Un essai fige que la règle ne reçoit que la pratique : elle ne lit ni les productions du cours, ni leurs évaluations, ni les productions écartées. La règle elle-même n'a pas changé d'une ligne (elle ignorait déjà ces réglages). Sentinelle neuve : 56 essais.

**Mesure 1 : peut-on encore créer une production formative ?**

- Le menu « Type » du formulaire d'une production n'offre aucun type formatif (fait, `index.html`, `#productionType` : examen, travail, quiz, laboratoire, présentation, entrevue, projet, stage, autre, portfolio, artefact, terminale).
- Le seul geste qui nomme un type formatif est le bouton « + Ajouter une évaluation formative » de la vue par type (`js/productions.js`, `ajouterProductionAuType('examen-formatif')`). Ce bouton ne s'affiche que s'il existe déjà au moins une production formative, et il pose dans le menu une valeur que le menu n'offre pas. Inférence, non jouée au navigateur : le menu reste vide et aucune production formative n'est créée.
- Le pack de démo n'en contient aucune (fait). Une production formative ne peut donc exister que dans un stock ancien ou importé.
- Conclusion : le commentaire du registre (« les types …-formatif n'ont plus aucun écrivain ») tient. **Il n'existe aujourd'hui aucun moyen de déclarer un travail « formatif » en tant que tel.**

Ce qui permet aujourd'hui de faire qu'un travail n'entre pas dans la note (faits, lus dans le code) : une pondération de 0 dans une pratique de type sommative (décision E1 du 28 oct.) ; la case « compte dans la note » décochée (`productionsExclues`) dans une pratique de type standards hors deux blocs ; une production marquée diagnostique, écartée de tous les calculs.

**Mesure 2 : comment chaque calcul traite une production de type « …-formatif »**

| Calcul | Traitement | Source |
|---|---|---|
| Cumulatif (type sommative) | Aucun filtre sur le type. Elle compte à sa pondération ; à 0, elle n'entre pas ; **sans pondération (champ vide), elle pèse 1**. `productionsExclues` n'y est pas lu (inférence : aucune occurrence dans le moteur sommatif). | `js/pratiques/pratique-sommative.js`, `_ponderationDe` |
| Hybride (type standards) | Aucun filtre sur le type : elle entre dans le pool comme toute production, sauf si elle est décochée (`productionsExclues`, hors deux blocs). | `js/pratiques/pratique-registre.js`, `obtenirArtefactsIdsPoolStd` |
| Autour des calculs | Les listes des deux blocs de la fiche et l'export des productions écartent les types « …-formatif » de ce qu'elles proposent ; la vue par type les range à part. | `js/pratiques-gestion.js`, `js/productions-import-export.js`, `js/productions-liste.js` |

Donc une production formative restée dans un stock ancien **compte dans la note** des deux calculs, sauf pondération à 0 ou case décochée. C'est l'inverse de ce que dit maintenant le texte 1 (« un travail formatif n'entre pas dans la note »). Le texte décrit la pratique de l'enseignant·e ; l'application, elle, ne sait pas qu'un travail est formatif. Rapporté, non corrigé. Issue 2 (inscrire et continuer) : à rattacher par Cowork, la question de fond (comment déclare-t-on un travail formatif ?) revient à Grégoire.

**Les textes 6, 10 et 12, laissés tels quels.** Mon avis, à pondérer (je peux pencher vers la critique pour avoir quelque chose à signaler) :

- Texte 12, « CUM = cumulative (tout compte, sans reprise ; …) » : **encore trop fort**. « Tout compte » est précisément la formule que l'amendement retire.
- Texte 6, « Cumul pondéré de toutes les évaluations, sans reprise », et texte 10, « le cumul pondéré de toutes tes évaluations, sans reprise » : ambigus plutôt que faux. « Évaluations » peut se lire « évaluations sommatives », mais l'application appelle aussi « évaluation » la correction d'un travail formatif.
- Hors des trois : le texte 2 dit « D'autres productions peuvent rester obligatoires et compter toutes », ce qui reste juste (il parle d'un bloc). Le motif interne de la règle s'appelle `tout-compte` : un identifiant, jamais affiché, laissé.

## 0 bis. Second amendement du 28 nov., 8 h 45 (décisions de Grégoire, 8 h 40 et 8 h 42)

### A. Le modèle « Hybride » de la vue simple s'appelle « Cumulative par niveaux » : FAIT

- `js/vue-simple.js` : le titre du modèle (donc le nom de la pratique qu'il crée) et la carte « Ta pratique » de l'accueil, qui énumère les modèles (« Choisis un modèle : par standards, par spécifications ou cumulative par niveaux. … »). Cette seconde phrase est la conséquence mécanique du nom ; elle est PROPOSÉE, à relire.
- Ce que le modèle installe n'a pas bougé : même gabarit (`STD-n-meilleurs`), « Toutes les productions », jetons refusés, même calcul.
- **Source ou stock : source seulement.** Une pratique déjà installée depuis ce modèle garde le nom qu'elle porte (« Hybride » depuis le 27 nov., « Par sélection de productions » du 21 au 27 nov., « Par standards » du 13 au 21 nov.). Ce nom se voit : en vue simple, à l'accueil (l'état de l'étape « Ta pratique ») et au bandeau du tableau, à côté du badge ; en vue étendue, dans le menu et la bibliothèque des pratiques, au titre de la fiche, au Comparateur. Rien n'est renommé chez personne.

**Les noms côte à côte, à l'écran « Ta pratique » (je ne tranche pas) :**

| Carte | Titre |
|---|---|
| 1 | Cumulative par niveaux |
| 2 | Par spécifications |
| 3 | Par standards (à l'essai) |

Deux titres commencent par « Par », le premier non. Aucun ne s'appelle « Cumulative » tout court : pas de collision. L'écart est de forme.

**Trois textes de la vue simple disent encore « hybride », et je ne les ai PAS changés** : ils ne nomment pas le modèle, ils nomment la famille des pratiques que la vue simple sait suivre (le type standards, qu'on peut y régler sur « N meilleures » : une vraie hybride).

- `groupeMotAutres` : « Un groupe dont la pratique n'est ni par standards, ni par spécifications, ni hybride se suit en vue étendue. »
- `pratiqueAutre` : « La pratique de ce groupe n'est ni par standards, ni par spécifications, ni hybride : elle se règle en vue étendue. »
- `tableau.autreFamille` : « Le tableau sert aux pratiques par standards, par spécifications et hybrides. La pratique de ce groupe se suit en vue étendue. »

Ils sont maintenant incomplets : une « Cumulative par niveaux » y est servie sans y être nommée. À faire relire.

**La description de la carte, proposée (non posée).** Le texte actuel : « Chaque production reçoit un niveau. La note se construit à partir des niveaux que la règle retient. » « Que la règle retient » parle d'une sélection, alors que le modèle arrive sur « Toutes ». Proposition : « Chaque production reçoit un niveau. La note est le cumul de tous ces niveaux ; tu peux ensuite ne retenir que les meilleurs ou les plus récents. »

**Bancs.** Vitest vert (12 758). Sous Chromium : `vue-simple.spec.js`, 60 verts sur 61 au passage joué, le rouge étant un texte attendu que j'ai corrigé ensuite (la carte de l'accueil) ; non rejoué après cette correction. Écrans épinglés : sept fragments de la référence WebKit repris à la main (le nom, partout où il s'affiche) ; mesuré sous Chromium, ces sept fragments sont les seuls écarts dus au lot.

### B. Sans déclaration, pas de jetons : mesuré à 8 h 45, arrêt au point 2 ; CODÉ après le troisième amendement (§ 0 ter)

Ce qui suit est la mesure d'avant le code. Elle a fondé l'arrêt, que Grégoire a levé à 8 h 59.

**Point 1 — les jetons déjà accordés : ils tiendraient.** Lu dans le code, non joué.

- La note : aucun calcul de note ne lit la configuration des jetons (hors du moteur des jetons, `obtenirConfigJetons` a huit lecteurs, tous des gestes ou des affichages : l'écran d'évaluation, l'import des travaux, la Liste). Une originale remplacée par une reprise sort de la note par les champs de l'évaluation elle-même (`remplaceeParId`, `repriseDeId`). **Aucune note ne changerait.**
- Comptés : `compterJetonsUtilises` lit les évaluations, pas la configuration.
- Affichés : les badges « Reprise » et « Délai » de l'écran d'évaluation et le bloc « Gestion des jetons » du profil lisent les évaluations. Chez l'élève, rien ne change : `jetonsDeclares` rend déjà « aucun » pour une pratique sans réglage.
- Retirables : la corbeille de chaque badge (`retirerJetonDepuisSidebar`) ne lit pas la configuration.
- Une réserve : le panneau « Jetons » des options de l'évaluation afficherait « Système de jetons désactivé » au lieu de ses cases. Un jeton déjà accordé ne s'y verrait plus ; il resterait visible et retirable par son badge. C'est déjà ce que vit une pratique dont on décoche les jetons après en avoir accordé.

**Point 2 — la démo : ÇA TOURNE MAL, c'est le motif de l'arrêt.**

Faits : les trois pratiques de la démo n'ont aucun réglage de jetons, le pack ne porte aucun ancien réglage du trimestre (`configurationJetons`), et l'activation de la démo n'en pose pas. La démo n'offre donc des jetons QUE par le défaut du moteur. Et elle s'en sert : son corpus contient une reprise accordée (`jetonRepriseApplique`, avec son originale remplacée) et une reprise ciblée.

Ce qui disparaîtrait de la démo sous la règle B, pour ses trois groupes :

1. Le panneau « Jetons » de l'écran d'évaluation (cases « délai » et « reprise », compteurs) : remplacé par « Système de jetons désactivé ».
2. À l'import des travaux : la case « Cette copie est une reprise : appliquer un jeton de reprise… » et la proposition de reprise devant un doublon.
3. Tout geste d'accorder un délai ou une reprise : refusé (`verifierDisponibiliteJeton`).

La reprise déjà présente dans le corpus resterait comptée, affichée par son badge et retirable (point 1). Les parcours assistés ne nomment aucun jeton (mesuré : aucune occurrence dans `js/parcours-*.js`) ; la visite guidée de la démo dit seulement que la Liste montre « sa note et ses jetons », ce qui resterait vrai.

Conséquence pour lundi : un testeur qui explore les jetons dans la démo n'y trouverait plus rien à accorder, tant qu'il n'a pas coché « Activer le système de jetons » dans la fiche de la pratique. Le texte 3 dit par ailleurs « Les jetons de reprise y sont possibles aussi » des PAN : les deux PAN de la démo n'en offriraient plus.

**Les voies que je vois, sans trancher** (la première touche un fichier interdit, la décision revient à Grégoire) :

- (i) donner un réglage de jetons explicite aux pratiques de la démo, dans `js/pack-demo-10.js` : c'est le fichier à ne pas toucher, et la pratique « Hybride (démo) » y gagnerait le motif « retient et offre des reprises » ;
- (ii) poser ce réglage à l'activation de la démo, hors du pack ;
- (iii) accepter que la démo n'offre plus de jetons ;
- (iv) coder B en exceptant la démo, ce qui ferait deux moteurs.

**Point 3 — la pratique codée et l'ancien réglage du trimestre.**

- L'ancien réglage du trimestre (`modalitesEvaluation.configurationJetons`) est lu AVANT le défaut, par le moteur comme par `jetonsDeclares` : sous B, il continuerait de valoir, tel quel. Il n'a plus d'écrivain (commentaire du 29 oct.) : il n'existe que dans un stock ancien.
- La pratique codée sans entrée de bibliothèque (« Cumulative habituelle » désignée directement) n'a pas de bloc à elle : elle suit l'ancien réglage du trimestre s'il existe, sinon elle tombe aujourd'hui sur le défaut (2 / 2 / 2). Sous B, sans ancien réglage, elle n'offrirait plus de jetons, et rien dans l'application ne permettrait de les lui rendre : elle n'a pas de fiche. Il faudrait l'adopter comme pratique de bibliothèque. À dire à Grégoire avant de coder.

**Point 4 — les bancs du 29 oct. à réécrire** (repérés, non touchés) : `tests/integration/jetons-par-defaut-29-oct.spec.js` (deux essais : « sans réglage, la case s'affiche cochée » ; « Jeton de reprise est proposé sans réglage ») ; côté Vitest, `sentinelle-853-delai-sur-reprise` et `sentinelle-wizard-golden-creation-319`, plus ceux que le rouge désignera. Je n'ai pas compté les bancs de navigateur qui accordent un jeton dans la démo sans réglage : une trentaine de fichiers parlent de jetons.

**Source ou stock, pour B tel que décidé** : ni l'un ni l'autre n'est écrit, c'est le comportement du moteur qui change. Mais l'effet tombe sur le stock : toute pratique sans réglage, chez tous, perd les jetons que le défaut lui prêtait, sans qu'aucune donnée ne bouge. Les jetons déjà accordés restent.

## 0 ter. Troisième amendement du 28 nov., 9 h 05 (décisions de Grégoire, 8 h 57 à 8 h 59)

### B, codé : sans déclaration, pas de jetons, pour les anciennes pratiques aussi

**Le moteur** (`js/evaluation-jetons.js`). Une pratique qui ne porte aucun réglage de jetons, et dont le trimestre ne porte pas d'ancien réglage explicite, n'offre plus de jetons : `jetonsSansDeclaration()` rend les valeurs de départ (2 / 2 / 2), jetons éteints. Trois endroits la lisent : `obtenirConfigJetons` (le dernier repli), `configJetonsResolueDeLaPratique` (ce que la fiche affiche), et le « non » explicite, qui valait déjà cela. Aucune exception pour la démo, rien de posé à son activation, le pack n'est pas touché.

**La fiche** (`js/pratiques-gestion.js`).
- Une pratique sans réglage s'ouvre avec « Activer le système de jetons » décochée, les valeurs de départ pré-remplies.
- À l'ouverture, la fiche garde ce qu'elle montre des jetons (`instantaneJetonsMat`). À l'enregistrement, `blocJetonsAEcrireMat` n'écrit un bloc que si la pratique en porte déjà un, ou si les champs des jetons ont bougé depuis l'ouverture. Enregistrer un champ voisin n'écrit donc rien.
- Cocher la case écrit le bloc : le badge passe HYB. Régler un champ des jetons sans cocher écrit aussi le bloc, avec `actif: false` : un refus explicite qui garde la valeur réglée. C'est ma lecture de « coche ou règle » ; à corriger si Grégoire voulait autre chose.

**Les quatre points, après le code.**

1. **Jetons déjà accordés** : comptés, affichés, retirables. Prouvé par trois essais neufs (section « C bis » de la sentinelle du 29 oct.) : la reprise et le délai restent comptés (1 sur 2), le délai et la reprise se retirent, l'originale revient. **La note ne bouge pas** : l'essai (e), qui calcule la note d'un élève dont la reprise à 90 remplace une originale à 60, rend 84 avec ou sans jetons offerts.
2. **La démo** : voir l'encadré de tête et « Pour la release » ci-dessous.
3. **La pratique codée sans entrée de bibliothèque** (« Cumulative habituelle » désignée directement) n'offre plus ni délais ni reprises, sauf ancien réglage explicite du trimestre (accepté par Grégoire tel quel). **L'ancien réglage du trimestre continue de valoir** : un break-test (B5) le prouve.
4. **Les bancs du 29 oct.** : réécrits avec la date et le motif, aucun supprimé (liste plus bas).

**Source ou stock.** Rien n'est écrit dans les données de personne : ni migration, ni réécriture. C'est le comportement du moteur qui change, et l'effet tombe sur le STOCK :
- toute pratique sans réglage de jetons, chez tous, cesse d'offrir les jetons que le défaut lui prêtait depuis le 29 oct. : plus de case « reprise » à l'import, plus de cases dans le panneau « Jetons » de l'évaluation (il dit « Système de jetons désactivé »), plus de délai ni de reprise à accorder ;
- la pratique codée sans entrée de bibliothèque aussi, sans moyen de les lui rendre autrement qu'en adoptant une pratique de la bibliothèque ;
- les jetons déjà accordés restent, et aucune note ne change ;
- pour retrouver les jetons : cocher la case dans la fiche de la pratique. C'est alors une déclaration, et la pratique devient hybride.

**Pour la release : ce qu'il faut écrire dans `js/pack-demo-10.js`** (non touché ici).

Ajouter le même bloc à chacune des trois pratiques, à la racine de la pratique, juste après sa ligne `"calcul_note"` :

```
"jetons": { "actif": true, "delai": { "nombre": 2, "dureeJours": 2 }, "reprise": { "nombre": 2, "maxParProduction": 1, "archiverOriginale": true }, "repriseCiblee": { "actif": true, "nombre": 2, "plafondNote": null } },
```

| Pratique | Ligne de `"calcul_note"` (après laquelle insérer) |
|---|---|
| `demo-std-litt` | 7424 |
| `demo-spe-litt` | 7449 |
| `demo-cib-litt` (bloc `groupeParStandards`) | 10157 |

Un essai fige que ce bloc, lu par le moteur, rend exactement l'ancien défaut (actifs, 2 délais de 2 jours, 2 reprises, 1 par production, originale archivée, reprise ciblée active à 2). Les bancs le lisent dans `tests/unit/_helpers/jetons-declares.js`.

Deux conséquences de cette écriture, à connaître avant la release :
- la pratique « Hybride (démo) » gardera le badge HYB, avec le motif « retient certaines productions et offre des jetons de reprise » ; les deux PAN ne changent pas de badge ;
- la sentinelle neuve des familles fige aujourd'hui que les trois pratiques de la démo n'ont AUCUN réglage de jetons (section F) : elle rougira, à dessein, et se met à jour dans le même commit.

**Une démo déjà ouverte.** Le mandat nomme « Modèle antérieur détecté » : ce message appartient à l'import d'un Codex (`js/codex.js`), pas à la démo. La démo installée se met à jour par un autre mécanisme (`js/demo-namespace.js`) : elle compare la version rangée chez la personne à `_metadata.version` du pack (aujourd'hui « 21.3 », ligne 20).
- Monter cette version (par exemple « 21.4 ») réécrit la démo de chacun à la prochaine ouverture : tout ce qui a été fait DANS la démo est remplacé. C'est le geste que le rapport du 22 nov. avait laissé à Grégoire, et il n'a pas été fait le 27 nov. pour le nom « Hybride (démo) ».
- Ne pas la monter : une démo déjà installée garde ses pratiques sans réglage, donc sans jetons, jusqu'à « Remettre la démo à neuf » (panneau Assistance).
- Le troisième groupe a son propre chemin (`verserGroupeParStandardsSiAbsent`) : il n'ajoute que s'il manque, il ne mettra pas à jour une pratique déjà versée.
La décision de monter ou non la version revient à Grégoire : elle touche ce que les testeurs ont fait dans leur démo.

**Le hook de pré-push** n'a pas bloqué à cause du pack (voir l'état des pushes en fin de section).

### Les travaux formatifs : les mots, pas le calcul

- Glossaire, « CUM — Cumulative » : « Un travail formatif reçoit une pondération de 0 : il reste hors de la note, et cela ne change pas la famille. »
- Bulle des sigles (texte 12) : « CUM = cumulative (un cumul sans reprise ; souvent dite sommative), … »
- Table de la règle : le cas se lit « une production à pondération 0 (un travail formatif) » ; il ne rend pas hybride. La règle ne lit ni les productions ni leur pondération (essai).
- Aucun calcul n'est touché. Le texte dit vrai pour le calcul cumulatif (une pondération de 0 vaut 0, décision E1 du 28 oct.). **Réserve, rapportée sans corriger** : dans le calcul de type standards, une production à pondération 0 ENTRE dans le pool (les artefacts y sont à 0 par construction). « Un travail formatif reçoit une pondération de 0 : il reste hors de la note » n'y est donc pas vrai ; il faut y décocher la production (« compte dans la note »). Le texte vit dans l'entrée « CUM — Cumulative », ce qui limite la portée de la réserve.

### Laissé pour Grégoire, d'un bloc, sans rien poser

1. La description de la carte « Cumulative par niveaux » de la vue simple. Actuelle : « Chaque production reçoit un niveau. La note se construit à partir des niveaux que la règle retient. » Proposée : « Chaque production reçoit un niveau. La note est le cumul de tous ces niveaux ; tu peux ensuite ne retenir que les meilleurs ou les plus récents. »
2. Les trois textes de la vue simple qui disent encore « hybride » (`groupeMotAutres`, `pratiqueAutre`, `tableau.autreFamille`), cités au § 0 bis.
3. La phrase de la carte de l'accueil, POSÉE au second amendement comme conséquence du nom, et qui reste à relire : « Choisis un modèle : par standards, par spécifications ou cumulative par niveaux. Tu règles ensuite ce qui construit la note. »

### Bancs du troisième amendement

**Vitest, suite complète : 986 fichiers, 12 769 essais, tous verts.**

- Réécrits avec la date et le motif, aucun supprimé : `sentinelle-jetons-par-defaut-2026-10-29` (A(a), B(a), C(e), le dernier de D), `sentinelle-941-s3-ce-que-la-synthese-tait`, `sentinelle-jetons-derivation-L2c`, `sentinelle-853-delai-sur-reprise` (le cas « aucune pratique : défaut »).
- Neufs, dans la sentinelle du 29 oct. : la fiche s'ouvre décochée ; l'enregistrer sans toucher aux jetons n'écrit aucun bloc et laisse CUM ; cocher écrit le bloc et le badge passe HYB ; régler un champ écrit un refus explicite ; un bloc porté est récrit ; la décision d'écrire, seule ; la déclaration de la démo rend l'ancien défaut ; l'ancien réglage du trimestre vaut ; une reprise et un délai déjà accordés restent comptés et retirables.
- Bancs qui accordaient un jeton sur le défaut du moteur : ils posent maintenant la déclaration eux-mêmes (`tests/unit/_helpers/jetons-declares.js`, `tests/integration/harness/declarer-jetons.js`). Aucun n'est neutralisé : `sentinelle-725-617-724-720-jetons-de-reprise`, `sentinelle-jeton-retire-fichier-reprise`, `audit-pratique-de-notation-2026-09-05` (par l'ancien réglage du trimestre), `1007-propose-codex-2a2.spec.js`.

**Break-tests de B** (mutation posée, quatre fichiers de bancs lancés, mutation retirée ; 128 verts avant) :

| Mutation | Rouges |
|---|---|
| B1 la fiche récrit le bloc à chaque enregistrement (l'ancien comportement) | 2 |
| B2 la fiche n'écrit plus le bloc quand on coche | 3 |
| B3 le moteur prête de nouveau le défaut | 17 |
| B4 l'instantané n'est plus pris à l'ouverture | 2 |
| B5 l'ancien réglage du trimestre ne vaut plus | 3 |

**Navigateur (Chromium ; rien sous WebKit).** Les onze bancs qui touchent aux jetons, joués un à un après B :

| Banc | Après B | Suite |
|---|---|---|
| `jetons-par-defaut-29-oct` | 2 rouges (il figeait « case cochée » et « reprise proposée sans réglage ») | réécrit avec la date et le motif, un essai neuf ajouté ; 3 verts, deux passages |
| `1007-propose-codex-2a2` (P12, la reprise) | 1 rouge | la démo déclare ses jetons dans la mise en place ; vert |
| `construction-de-la-note-correctifs-28-oct` | 2 rouges | la pratique témoin déclare ses jetons ; 4 verts |
| `copie-non-recevable-note-28-oct` | 2 rouges | pratique codée sans entrée : l'ancien réglage du trimestre est posé ; 3 verts |
| `reunir-en-une-copie-1231` (la reprise en trois photos) | 1 rouge | la démo déclare ses jetons ; vert (cet essai rejoué seul) |
| `reparer-image-perdue-1233` | 1 rouge | **rouge aussi sur la base d'avant B** (`e303f47`) : sans rapport avec le lot, propre à Chromium. Non touché. |
| `audit-parcours-sommatif-2026-09-24`, `bibliotheque-deux-colonnes-1158`, `copie-de-reference-1229`, `lot-e1-conception-creer-ou-modifier`, `tableau-de-notation-1` | verts | rien à faire |

L'essai neuf du banc du 29 oct. joue, dans le vrai navigateur, la suite demandée : une cumulative sans réglage s'ouvre décochée, badge CUM ; un champ voisin change et s'enregistre, aucun bloc de jetons n'est écrit, le badge reste CUM ; la case cochée, le bloc s'écrit et le badge passe HYB avec son survol.

Une retouche de banc à signaler : cet ancien banc jugeait la note « réglés à la création » par sa visibilité à l'écran. La carte des jetons est un accordéon que la section replie après coup : le verdict dépendait du moment. Il la juge maintenant à l'état que la fiche lui pose.

**Non joués** : les autres bancs de navigateur (la suite entière ne tient pas sous Chromium), et tout WebKit. Un banc qui accorderait un jeton dans la démo sans passer par les onze fichiers repérés rougira au verdict du Mac : il lui faudra la même déclaration (`tests/integration/harness/declarer-jetons.js`).

## 0 quater. Quatrième amendement du 28 nov., 10 h 15

Reçu de Cowork : la relecture du troisième envoi est conforme ; le fichier de coordination vit dans le Projet de Cowork (rien à y écrire) ; « coche ou règle » accepté tel quel ; la version du pack ne monte pas (décision de Grégoire, 10 h 06) ; la pondération 0 dans le calcul de type standards est inscrite côté Cowork.

### A. La phrase de la fiche (décision de Grégoire, 10 h 10) : FAIT

« Avec des jetons de reprise, ta pratique est hybride : une note peut être révisée. »

- Elle est posée dans `index.html`, sous la case « Activer le système de jetons » et au-dessus du contenu masquable, en texte, avec des classes existantes (`text-muted u-mb-15 u-texte-09`). Aucun `innerHTML`, aucun handler.
- La condition vit au registre : `familleDeduiteDeLaPratique` rend maintenant `hybrideParReprises`, vrai quand le motif est « reprise » ou « retient et reprise ». La fiche lit ce seul champ (`jetonsRendentHybrideMat`) : aucune seconde règle, et la sentinelle qui interdit de comparer un motif hors du registre l'a refusé à ma première écriture.
- Elle suit les champs en direct : la fiche compose la pratique telle qu'elle la montre (la pratique enregistrée, le type du menu, le bloc de jetons des champs) et en déduit la famille. Rafraîchie à l'ouverture, au geste sur la case, et après chaque enregistrement.
- Déjà hybride par un bloc retenu : j'ai tranché, la phrase reste, elle est vraie.
- Jamais dans une PAN : la règle n'y donne aucun motif. Jamais pour des jetons de délai seuls.
- Le nom de la pratique ne change pas (un essai le fige).

Une limite, due à la fiche et non à la phrase : son bloc de jetons n'a qu'un nombre, partagé par les délais et les reprises. Dans la fiche, la phrase paraît donc dès que la case est cochée. « Des délais seuls » ne s'y règle pas ; ce cas n'existe que pour une pratique réglée dans l'assistant, et la condition le respecte (essai).

### B. Cinq textes de la vue simple : FAIT (proposés à Grégoire à 10 h 06, posés tels quels)

**Vérification préalable : ton hypothèse tient.** La vue simple reconnaît trois familles par le TYPE rangé (`familleDeLaPratique`, `js/vue-simple-donnees.js`) : `cibles`, tout type qui contient « standard », tout type qui contient « spécification ». Tout le reste est « autre », y compris une pratique de type sommative devenue hybride par ses jetons : elle se suit en vue étendue. « Par niveaux (cumulative ou hybride) » décrit donc exactement le type standards.

| N° | Où | Texte posé |
|---|---|---|
| 1 | la carte du modèle | « Chaque production reçoit un niveau. La note est le cumul de tous ces niveaux ; tu peux ensuite ne retenir que les meilleurs ou les plus récents. » |
| 2 | la carte « Ta pratique » de l'accueil | inchangée |
| 3 | `groupeMotAutres` | « Un groupe dont la pratique n’est ni par standards, ni par spécifications, ni par niveaux (cumulative ou hybride) se suit en vue étendue. » |
| 4 | `pratiqueAutre` | « La pratique de ce groupe n’est ni par standards, ni par spécifications, ni par niveaux (cumulative ou hybride) : elle se règle en vue étendue. » |
| 5 | `tableau.autreFamille` | « Le tableau sert aux pratiques par standards, par spécifications et par niveaux (cumulatives ou hybrides). La pratique de ce groupe se suit en vue étendue. » |

Deux remarques :
- les textes 3 et 4 gardent l'apostrophe typographique du fichier (« n’est »), comme tous les textes de la vue simple ;
- un texte voisin, hors de la liste, dit encore « hybrides » pour le même type : le tableau de notation de la vue étendue (`js/tableau-notation.js`, repère T1), « Le tableau de notation sert aux pratiques hybrides et par spécifications. Pour la pratique de ce groupe-cours, la Liste reste la vue de tes évaluations. » Non touché ; à relire avec les autres.

Source ou stock : source seulement, des mots d'écran. Fichier de textes validés mis à jour (repères V2, V5, V6, V7, F1).

### Bancs du quatrième amendement

- **Vitest, suite complète : 986 fichiers, 12 773 essais, tous verts.** Quatre essais neufs sur la phrase (elle paraît ; elle ne paraît pas ; jamais dans une PAN ; aucune seconde règle, et où elle est posée). Trois break-tests, tous rouges : la phrase pour un bloc retenu seul (1), la phrase sans condition (3), la phrase dans une PAN (2).
- **Navigateur, sous Chromium** : `jetons-par-defaut-29-oct` 3 verts, dont l'essai demandé (la phrase est cachée à l'ouverture ; cocher la fait paraître et passe le badge à HYB ; décocher par le vrai geste la retire et rend CUM ; recocher la ramène) ; `vue-simple` 61 verts sur 61. Écrans épinglés : deux fragments de la référence WebKit repris à la main (la description de la carte) ; mesuré sous Chromium, ce sont les seuls écarts dus à l'amendement.
- Comme pour la note « réglés à la création », la phrase se juge à l'état que la fiche lui pose, pas à sa visibilité : la carte des jetons est un accordéon.
- **Rien sous WebKit** : le verdict se prendra sur le Mac à l'assemblage.

## 1. Les mesures demandées avant d'écrire la règle

### a. Une pratique SANS réglage de jetons

Faits, lus dans `js/evaluation-jetons.js` :

- `configJetonsResolueDeLaPratique` et `obtenirConfigJetons` rendent le défaut du moteur (`jetonsParDefaut`) : actifs, 2 délais, 2 reprises, reprise ciblée active.
- `jetonsDeclares` (ce que l'élève lit, D5 du 24 sept.) rend `null` sans réglage.
- Les deux lectures se contredisent sur ce seul cas. Décision relayée par Cowork (28 nov., 8 h 00) : la règle lit le bloc que la pratique PORTE. Sans réglage : CUM.

La règle lit donc `configJetonsDeclareeDeLaPratique(pratique)`, extraite de `obtenirConfigJetonsPratique` (qui l'appelle maintenant) : c'est la lecture de `jetonsDeclares`, sur une pratique donnée. Aucune troisième lecture : la normalisation n'est écrite qu'une fois, un essai le fige.

**À rapporter sans corriger (demandé à 8 h 00)** : pour une pratique sans réglage, le moteur laisse encore l'enseignant·e appliquer un jeton de reprise par défaut alors que le badge dit CUM. **Compte parmi les pratiques fournies et celles de la démo : 0.** Les cinq modèles fournis portent `jetons: { actif: false }`. Les trois pratiques de la démo n'ont aucun réglage de jetons, mais aucune ne s'affiche CUM (une hybride par son bloc retenu, deux PAN). Le cas existe donc seulement dans le stock : une pratique de type sommative créée avant le 29 oct., ou la pratique codée « Cumulative habituelle » désignée sans entrée de bibliothèque. Non compté : ce stock vit chez les gens.

### b. Les jetons personnalisés

`attribuerJetonPersonnalise` incrémente un compteur et un historique dans `jetonsEtudiants`. Il ne touche aucune évaluation et aucun calcul ne lit ce compteur (fait, lu dans le code). Un jeton personnalisé ne révise pas une note par lui-même. Non ajouté à la règle.

### c. Les lecteurs de la famille par type

| Lecteur (avant) | Fichier | Sort |
|---|---|---|
| `genererBadgeTypePratique` (badge de la fiche, bulle par code) | `js/pratiques-gestion.js` | branché |
| `familleDeLaPratique` → ligne de la bibliothèque, ligne d'un modèle fourni, aperçu, description courte (fiche, Comparateur) | `js/pratiques-gestion.js` | branché |
| `TYPE_BADGES[classification.type]` (récapitulatif de l'assistant) | `js/wizard-pratique-v2.js` | branché |
| `libelleFamilleModele` (« Partir d'un modèle ») | `js/wizard-pratique-v2.js` | branché |
| `obtenirBadgeTypePratique(p.type)` (liste des ressources, deux tableaux) | `js/donnees-v2.js` | branché |
| `_badge`, `_sigle`, repli de `_nomPratique`, en-tête du CSV | `js/comparateur-pratiques.js` | branché |
| badge du bandeau | `js/tableau-notation.js` | branché |
| `_nomPratiqueActivePanneau` (carte « Méthodologie de calcul », texte 26 du lot précédent) | `js/profil-etudiant-sections-affichage.js` | branché |
| « pratique active : … » de l'aide des indices (Liste, Suivi du groupe) | `js/etudiants.js` | branché |
| colonne « Pratique (code) » de l'export des résultats finaux | `js/export-resultats-finaux.js` | branché |
| `genererBadgePratiqueHTML('cibles')` | `js/tableau-cibles.js` | laissé : une PAN nommée en dur |
| `window.genererBadgePratique`, `genererBadgePratiqueProfil` | `js/main.js`, `js/profil-etudiant-helpers.js` | laissé : aucun appelant dans l'application |
| `obtenirCouleur()`, `obtenirLabelFamille()` des quatre classes de pratique | `js/pratiques/pratique-*.js` | laissé : aucun appelant |
| `formaterTypePratique` | `js/donnees-v2.js` | laissé : aucun appelant |
| `familleDeLaPratique` de la vue simple | `js/vue-simple-donnees.js` | laissé : c'est un ROUTAGE par type (quel écran, quel tableau), pas un affichage |
| `detailsNoteFinale.pratique: 'Hybride'` (nom de repli au profil quand la pratique n'a pas de nom) | `js/profil-etudiant-actions.js` | laissé : dans le retour du calcul (§ 7, trouvaille 4) |

Le lecteur de nom par type du lot précédent (`obtenirNomTypePratique`) est retiré : son seul appelant lit maintenant la famille déduite.

## 2. La fonction et ses lecteurs

`familleDeduiteDeLaPratique(pratique)`, dans `js/pratiques/pratique-registre.js`. Elle rend `{ type, cle, code, sigle, famille, nom, couleurVar, classe, motif, survol }`, ou `null` sans type connu.

- `type` : le type rangé, celui que le calcul suit. `cle` : la famille affichée, clé des tables de mots (`sommative` pour la cumulative, `standards` pour l'hybride, sinon le type de la PAN).
- `motif` : `tout-compte`, `retenu`, `reprise`, `retenu-et-reprise` ; `null` pour une PAN. `survol` : la phrase des textes 8 et 9.
- Bloc retenu (type standards seulement) : `categories.actif` (les deux blocs), sinon toute méthode autre que « tous ». Sans méthode : « meilleurs », le défaut du moteur.
- Reprises offertes : bloc déclaré actif, avec au moins un jeton de reprise, ou la reprise ciblée active à nombre non nul.

Autour d'elle : `familleDeduiteParId(id)`, `familleDeduiteDeLaPratiqueActive()` et `genererBadgeFamilleDeduiteHTML(famille, survolSansMotif)`.

Trois choix que j'ai faits seul, à corriger au besoin :

1. **La fiche redit son badge après chaque enregistrement** (`rafraichirBadgeFamilleMat`). Cocher « Activer le système de jetons » ou passer la sélection à « Toutes » change le badge sur-le-champ.
2. **Le récapitulatif de l'assistant déduit la famille d'un aperçu de la pratique que « Créer » écrirait.** Pour ne pas lire les réponses deux fois, le bloc qui compose la configuration d'une pratique de type standards est extrait de `creerPratiqueV2`, mot pour mot (`_configurationStandardsDesReponses`). En création, les jetons sont refusés ; en modification, la pratique garde ceux qu'elle porte.
3. **L'aide des indices nommait « Cumulative » toute pratique active qui n'était pas de type standards, PAN comprises.** Elle lit maintenant le nom de la famille déduite : une pratique par spécifications s'y lit « PAN par spécifications ». C'est le seul endroit où une PAN change de mot, et c'était une erreur.

Le calcul ne lit jamais la fonction : un essai parcourt onze fichiers de moteur et de documents de l'élève. Aucune condition ne compare un sigle ou un nom de famille pour router ou filtrer (essai D).

## 3. Les 14 textes

Posés mot pour mot, consignés dans `plans de travail/TEXTES-2026-11-28-familles-par-reglages.md` (repères R1 à R14), que la sentinelle relit à chaque source.

| Texte | Où |
|---|---|
| 1, 2, 3 | `js/accompagnement-contenu-terme.js` (glossaire : CUM, HYB, phrase ajoutée à PAN) |
| 4, 5 | `index.html` (carte « Note » des pratiques) |
| 6, 7 | `js/pratiques-gestion.js` (`FAMILLES_TAXONOMIQUES`) |
| 8, 9 | `js/pratiques/pratique-registre.js` (survols, par motif) |
| 10, 11 | `js/wizard-pratique-v2.js` (`TYPE_BADGES`) |
| 12 | `js/accompagnement-contenu-hover.js` (début de la bulle) |
| 13, 14 | `js/accompagnement-contenu-popup.js` (fenêtre « Pratiques ») |

Les textes 6, 7, 10 et 11 se lisent par la famille déduite. Une réserve de forme : le texte 14 remplace une ligne qui portait une espace insécable devant le point-virgule ; le texte accepté est posé tel que reçu, avec des espaces ordinaires devant les deux-points.

## 4. Avant et après : ce que les testeurs verront lundi

| Pratique | Type | Réglages | Avant | Après |
|---|---|---|---|---|
| Modèle de base (fourni) | dénotation | jetons refusés | DEN | DEN |
| Modèle simple (fourni) | spécifications | jetons refusés | SPE | SPE |
| Modèle cumulatif (fourni) | sommative | jetons refusés | CUM | CUM |
| N meilleures évaluations (fourni) | standards | 7 meilleures, jetons refusés | HYB | HYB |
| N plus récentes (fourni) | standards | 5 plus récentes, jetons refusés | HYB | HYB |
| Hybride (démo) | standards | 6 meilleures, aucun réglage de jetons | HYB | HYB |
| PAN – Spécifications (démo) | spécifications | aucun réglage de jetons | SPE | SPE |
| Par standards (démo) | cibles | aucun réglage de jetons | STD | STD |

Aucune pratique fournie ni de la démo ne change de famille. Ce qui change à l'écran pour elles : les survols, les résumés, les descriptions.

**Ce qui changera pour les testeurs, dès qu'ils règlent :**

- Dans la fiche, cocher « Activer le système de jetons » sur une pratique de type « Cumulative » la fait passer à HYB. Le bloc de jetons de la fiche n'a qu'un nombre, partagé par les délais et les reprises : des jetons activés offrent toujours des reprises (fait, lu dans la normalisation). « Des jetons de délai seuls » ne s'obtient que par la forme écrite par l'assistant.
- Dans la fiche, passer une pratique de type « Hybride » à « Toutes », sans jetons, la fait passer à CUM.
- **En vue simple, le modèle « Hybride » installe une pratique réglée sur « Toutes les productions », jetons refusés** (décision du 9 nov., `pratiqueDepuisModele`). Cette pratique s'affiche donc CUM : dans la bibliothèque, dans la fiche, et **dans la vue simple elle-même**, au bandeau du tableau de notation, où le badge CUM côtoie le nom « Hybride » (mesuré au navigateur, banc des écrans épinglés). La carte qui l'a créée s'intitule « Hybride ». C'est la conséquence la plus visible lundi, et elle touche aussi le stock créé en vue simple depuis le 10 nov. Elle découle de la règle validée (« standards réglée sur Toutes, sans jeton de reprise : CUM ») ; je ne l'ai ni masquée ni corrigée.

## 5. Source ou stock

Rien n'est écrit : aucune clé, aucune pratique, aucune note. Ce qui change est une LECTURE. Le badge d'une pratique déjà créée chez quelqu'un peut donc changer sans qu'on y touche :

- de HYB à CUM : type standards, « Toutes », sans jeton de reprise déclaré (dont les pratiques nées du modèle de la vue simple) ;
- de CUM à HYB : type sommative, bloc de jetons déclaré actif.
- Une pratique de type sommative sans réglage de jetons reste CUM… **jusqu'à ce qu'on enregistre sa fiche.** La fiche affiche la case « Activer le système de jetons » COCHÉE pour une pratique sans réglage (elle montre le défaut du moteur, décision du 29 oct.), et elle écrit le bloc de jetons à chaque enregistrement. Changer n'importe quel champ de la fiche d'une telle pratique y écrit donc des jetons actifs, et le badge passe à HYB. Fait lu dans le code (`appliquerFormulaireDansCollection`), non joué au navigateur. Ce comportement d'écriture existait avant le lot ; le lot le rend visible. À trancher par Grégoire : est-ce le sens voulu ?

C'est assumé par le mandat. Je n'ai mesuré aucun stock réel.

## 6. À rapporter sans corriger

### 6.1 Textes où « cumulative » ou « hybride » désignent encore le calcul par type

Chacun peut maintenant contredire le badge. À relire par Grégoire ; rien n'est changé.

- `index.html:5125` : L'échelle IDME (Incomplet, Développement, Maîtrise, Étendu) basée sur la taxonomie SOLO est utilisée dans la pratique hybride.
- `index.html:5530` : <option value="sommative">Cumulative</option>
- `index.html:5531` : <option value="standards">Hybride</option>
- `index.html:5726` : Active le titre « Note finale » sur les PDF de rétroaction, à la place de « Note actuelle du cours » (pratique cumulative) ou de « Note provisoire » (pratique alternative), et retire la liste « Artefacts à venir ». À activer en fin de session, quand les notes sont arrêtées.
- `index.html:5764` : <strong>Hybride</strong>&nbsp;: la note retient les résultats de l'étudiant·e selon ta «&nbsp;Construction de la note&nbsp;»&nbsp;: les meilleurs, les plus récents ou tous.
- `index.html:10307` : <h4 class="u-mb-10 u-texte-bleu">Cumulative</h4>
- `index.html:10313` : <h4 class="u-mb-10 u-texte-bleu">Hybride</h4>
- `index.html:10349` : <p><strong>Cumulative.</strong> La note est la moyenne de tes évaluations, chacune au poids de la pondération de sa production&nbsp;: une dissertation à 80 (40&nbsp;%) et un examen à 90 (60&nbsp;%) donnent (80 × 40 + 90 × 60) / 100 = 86. Seules comptent les copies évaluées et verrouillées&nbsp;; un brouillon, une copie «&nbsp;In …
- `index.html:10353` : <p><strong>Hybride.</strong> Si ta pratique compte au moins une production de type «&nbsp;Artefact d'un portfolio&nbsp;», la note se calcule à partir de ces artefacts et de l'«&nbsp;Évaluation terminale&nbsp;», s'il y en a une. Sans aucun artefact, elle se calcule à partir de toutes tes productions évaluées, quels que soient leu …
- `index.html:10825` : … sp;; le profil, «&nbsp;Non remis&nbsp;». Le travail reste au total attendu de la complétion (C). La note dépend de ta pratique&nbsp;; par exemple, en cumulative, il n'y entre pas&nbsp;; en hybride à deux blocs, une fois les notes finales cochées, une obligatoire non remise vaut 0.</p> …
- `index.html:10833` : <li>en cumulative, elle vaut 0, sauf si une reprise la remplace ;</li>
- `index.html:10835` : <li>en hybride, elle sort du portfolio : la compétence n'est jugée qu'à la reprise. Exceptions : une terminale non recevable vaut 0, et, à deux blocs une fois les notes finales cochées, une obligatoire non recevable aussi, comme une obligatoire non remise ;</li>
- `index.html:11551` : <p>Conception → Productions affiche le total et dit ce qui manque ou ce qui est en trop, sans bloquer. Les artefacts d'un portfolio n'y entrent pas&nbsp;: seul le portfolio compte. En cumulative, la note se calcule sur les productions évaluées, chacune au poids de sa pondération.</p>
- `js/evaluation-sauvegarde.js:582` : + 'jusque sur le PDF de l\'étudiant·e. Dans la note du cours, elle vaut ce que dit ta pratique\u00a0: 0 en cumulative, '
- `js/evaluation-sauvegarde.js:583` : + 'un travail non satisfaisant en spécifications, hors du portfolio en hybride. Dans la complétion, elle compte '
- `js/etudiants.js:417` : html += '<br>→ <strong>Hybride</strong> : Moyenne des <strong>' + nbArtefacts + ' meilleurs ' + termePlur + '</strong> selon l\'échelle IDME. ';
- `js/etudiants.js:421` : html += '<br>→ <strong>Cumulative</strong> : Moyenne pondérée de <strong>toutes les évaluations</strong>. ';
- `js/etudiants.js:429` : html += '<strong>P</strong> mesure la <strong>qualité de l\'apprentissage</strong> selon la pratique pédagogique choisie (Cumulative, Hybride, ou autre).';
- `js/profil-etudiant-actions.js:155` : return 'Cette pratique est de type Cumulative (moyenne pondérée). La note de session affichée ici se calcule par portfolio, propre aux pratiques hybrides : le calcul cumulatif dans le profil n\'est pas encore branché. Tes données sont cohérentes – c\'est l\'affichage qui ne couvre pas encore cette famille (à venir).';
- `js/profil-etudiant-actions.js:174` : return 'Pratique hybride, mais la carte « Structure des évaluations » de sa fiche n\'est pas réglée (productions pour la note finale, minimum de productions évaluées). Ouvre « Réglages de la pratique » pour la régler.';
- `js/profil-etudiant-actions.js:176` : return 'Pratique hybride, mais sa configuration de portfolio (nombre d\'artefacts à retenir, minimum requis) est absente ou incomplète. Ouvre « Réglages de la pratique » pour la compléter.';
- `js/profil-etudiant-actions.js:509` : pratique: 'Hybride',
- `js/profil-etudiant-actions.js:708` : pratique: 'Hybride',
- `js/wizard-pratique-v2.js:234` : { value: 'moyenne', label: 'Cumulative (CUM)', description: 'Note finale par cumul pondéré des évaluations.' },
- `js/wizard-pratique-v2.js:235` : { value: 'niveaux', label: 'Hybride (HYB)', description: 'Des niveaux (ex. I-D-M-E) ; la note retient certaines productions.' },
- `js/wizard-pratique-v2.js:2353` : html += '<h4>Configuration – Hybride</h4>';
- `js/wizard-pratique-v2.js:3130` : return 'Choisis une échelle de performance (IDME) avant de créer cette pratique hybride. Reviens à l\'étape « Échelle de performance ».';
- `js/vue-simple.js:45` : { ecran: 'pratique', titre: 'Ta pratique', texte: 'Choisis un modèle : par standards, par spécifications ou hybride. Tu règles ensuite ce qui construit la note.', lien: 'Choisir un modèle' },
- `js/vue-simple.js:102` : groupeMotAutres: 'Un groupe dont la pratique n’est ni par standards, ni par spécifications, ni hybride se suit en vue étendue.',
- `js/vue-simple.js:109` : { famille: 'standards', modele: 'STD-n-meilleurs', titre: 'Hybride', texte: 'Chaque production reçoit un niveau. La note se construit à partir des niveaux que la règle retient.', lien: 'Choisir ce modèle' },
- `js/vue-simple.js:207` : pratiqueAutre: 'La pratique de ce groupe n’est ni par standards, ni par spécifications, ni hybride : elle se règle en vue étendue.',
- `js/accompagnement-contenu-hover.js:481` : 'En pratique hybride, la note se construit sur le portfolio ; à l’étape suivante, tu choisis quels artefacts comptent.',
- `js/productions.js:2769` : 'terminale': '<strong>Évaluation terminale :</strong> Production qui clôt le trimestre ; une seule par trimestre, et facultative. En pratique hybride, elle entre dans le calcul avec sa pondération (par exemple 40\u00a0%), le reste allant aux artefacts du portfolio ou, sans artefact, aux productions retenues (par exemple 60\u00a0 …
- `js/comparateur-pratiques.js:69` : var NOTE_DEV_TEXTE = 'L’Exploration des pratiques est en construction. Pour certaines pratiques — surtout « Hybride » — une note peut s’afficher à 0 : le plus souvent, cela veut dire que la note ne peut pas être construite à partir des paramètres choisis et des résultats réels disponibles, pas qu’il y a forcément une erreur. Lis …
- `js/guides-pedagogiques.js:140` : <p>L'indice P est la note courante de l'étudiant·e, calculée selon la pratique de notation active (Cumulative, Hybride, Standards, Spécifications ou Dénotation). Il ne représente <em>pas</em> la note finale du trimestre, mais une projection courante basée sur les productions déjà évaluées.</p>
- `js/profil-etudiant-helpers.js:655` : message: 'La pratique cumulative établit la note globale comme un pourcentage '
- `js/accompagnement-contenu-popup.js:1163` : "Cumulative habituelle\u00a0: la VALEUR PONCTUELLE travaille tout le temps — c’est la note. La plage sert en arrière-plan, pour situer le niveau atteint.",
- `js/accompagnement-contenu-popup.js:1629` : contenu: "L'assistant te guide en 8 étapes pour configurer une pratique de notation alignée avec tes intentions pédagogiques : type d'évaluation, cumulative ou portfolio, règles de reprise, jetons, calcul de la note finale."
- `js/accompagnement-contenu-popup.js:1636` : "<strong>2. Type d'évaluation</strong> — cumulative habituelle, portfolio de progression, ou variante.",
- `js/accompagnement-contenu-terme.js:215` : definition: 'Ta recette complète pour construire la note. Cinq pratiques sont disponibles : cumulative (CUM), hybride (HYB), PAN par standards (STD), PAN par spécifications (SPE) et dénotation (DEN). La pratique détermine comment les résultats de tes évaluations se transforment en note finale. Tu peux toujours la changer.',
- `js/accompagnement-contenu-terme.js:618` : … ion, à cocher quand les notes sont arrêtées. Les PDF de rétroaction titrent alors « Note finale », à la place de « Note actuelle du cours » (pratique cumulative) ou de « Note provisoire » (pratique alternative), et ne listent plus les « Artefacts à venir ». En mode « Deux blocs », une production obligatoire non remise compte alo …
- `js/parcours-evaluer.js:757` : note("Tu additionnes des points d'un travail à l'autre, selon leur pondération ? C'est une pratique de notation, la plus répandue : la notation cumulative, qu'on appelle aussi sommative."),
- `js/parcours-evaluer.js:780` : note("Le code à côté du nom dit sa famille : CUM pour la cumulative, HYB pour l'hybride, STD pour les standards ; les autres codes désignent d'autres pratiques."),
- `js/parcours-evaluer.js:1421` : "Tu additionnes des points d'un travail à l'autre, selon leur pondération ? C'est une pratique de notation, la plus répandue : la notation cumulative, qu'on appelle aussi sommative",
- `js/parcours-evaluer.js:1442` : "Le code à côté du nom dit sa famille : CUM pour la cumulative, HYB pour l'hybride, STD pour les standards ; les autres codes désignent d'autres pratiques",
- `js/parcours-evaluer.js:1449` : "Le récapitulatif dit sa famille et ce qu'elle fait : « Hybride »",
- `js/accueil.js:197` : { action: 'ouvrirWizardPratique', icone: 'ico-acc-data-sheet', titre: 'Adopter ta pratique', desc: 'Construction de la note du cours, cumulative ou alternative.', chemin: 'Conception › Pratiques' },
- `js/profil-etudiant-sections-affichage.js` (phrases de règle du profil, vers 186 et 3653) : « … parmi les meilleurs, hybride) », pour la méthode « récentes parmi les meilleures ».
- `js/pratiques/pratiques-predefines.js:159` et `:482`, `js/pratiques/pratique-sommative.js:45` : les noms « Cumulative habituelle » et « Cumulative avec remplacement » ; `js/pratiques/pratique-pan-standards.js:86` : « Hybride ».

Les plus exposés, à mon avis (interprétation) : le menu « Type » de la fiche (`index.html:5530` et `:5531`), qui offre « Cumulative » et « Hybride » comme des TYPES ; les cartes de la voie rapide de l'assistant ; le titre « Configuration – Hybride » du récapitulatif, qui peut maintenant suivre un badge CUM ; le modèle « Hybride » de la vue simple.

### 6.2 Textes qui disent « niveau de maîtrise »

- `js/parcours-evaluer.js:1443` : « L'exemple prend « N meilleures évaluations », une pratique hybride : chaque production reçoit un niveau de maîtrise et la note retient les 7 meilleures évaluations sur 10 ». C'est le cas visé : un niveau donné à une production, dans une pratique hybride.
- `js/wizard-pratique-v2.js:2122` : « La note refléterait le niveau de maîtrise démontré ; une reprise réussie remplace un premier essai. » (type standards).
- `js/wizard-pratique-v2.js:440` : « Niveaux de maîtrise (ex: I-D-M-E, A-B-C-D) ».
- `js/wizard-pratique-v2.js:541` : « Son niveau de maîtrise le plus avancé ».
- `js/pratiques/pratique-pan-standards.js:95` : « avec évaluation par niveaux de maîtrise et critères configurables. »
- `index.html:5124` : « L'échelle de performance définit les niveaux de maîtrise utilisés pour évaluer les critères. »
- `js/parcours-evaluer.js:759` et `:1423` : « la note s'y construit à partir de niveaux de maîtrise plutôt que de points » (dit des pratiques alternatives : conforme au texte 3, cité pour mémoire).
- `js/guides-pedagogiques.js:321` : « Tu évalues par niveaux de maîtrise (par exemple l'échelle IDME…) ».

### 6.3 Textes reçus par l'élève

Aucun ne montre le badge ni le nom de la famille (fait : aucune occurrence dans `js/synthese-retroaction-rendu.js`, `js/synthese-retroaction-data.js`, `js/export-pdf.js`, `js/evaluation-retroaction.js` ; un essai interdit à ces fichiers de lire la famille déduite). Pas d'arrêt.

### 6.4 Endroits où l'affichage aurait touché un calcul ou un routage

- `js/vue-simple-donnees.js`, `familleDeLaPratique` : route par type. Gardé.
- `js/tableau-notation.js`, `ctx.famille` : le code du type route le tableau. Gardé ; seul le badge du bandeau suit la famille déduite.
- `js/comparateur-pratiques.js`, `_codePratique` et `_estDEN` : gardés, par type.
- `js/profil-etudiant-actions.js`, `pratique: 'Hybride'` dans le retour de `calculerDetailsNoteFinale` : gardé (§ 7, trouvaille 4).

## 7. Trouvailles hors lot, et leur issue

1. **Le menu « Type » de la fiche nomme « Cumulative » et « Hybride » ce qui est maintenant un type de calcul.** Issue 2, inscrire et continuer : c'est l'objet annoncé du lot suivant (le calcul unique à deux blocs). Non inscrit au BACKLOG par moi : à Cowork de le rattacher à ce lot.
2. **Un bloc de jetons réduit à `{ actif: true }` n'est reconnu par aucune forme** : la lecture déclarée rend `null` (donc CUM) alors que le moteur retombe sur son défaut actif. Aucune voie de l'application n'écrit cette forme (mesuré par `grep`). Issue 3.
3. **`window.genererBadgePratique`, `genererBadgePratiqueProfil`, `formaterTypePratique` et les méthodes `obtenirCouleur()` / `obtenirLabelFamille()` n'ont aucun appelant.** Du code étranger et dormant qui lit la famille par type. Issue 3 : nommé dans la sentinelle, qui échouera si un appelant revient.
4. **Le profil nomme « Hybride » une pratique sans nom**, par un champ du retour du calcul de la note. Le changer touche le retour d'un calcul. Issue 2, rapporté ici, non corrigé.
5. **La forme ancienne `pratiques: ['PAN']`** garde son badge « PAN » (point 4 du 21 nov.). Sa classe `badge-type-pan`, qu'aucune règle CSS ne définissait, n'est plus posée : l'apparence est la même (les variantes sont neutralisées dans `styles.css`). Issue 1, dans mon propre lot.

## 8. Les bancs

**Vitest, suite complète, depuis `tests/` : 986 fichiers, 12 758 essais, tous verts (rejouée après l'amendement ; 12 754 au premier commit).**

- Neuf : `tests/unit/sentinelle-familles-par-reglages-2026-11-28.test.js`, 52 essais au premier commit, 56 après l'amendement (§ 0). La table de la règle pour les deux types ; les PAN ; les lecteurs ; l'interdiction d'un second lecteur par type ; les 14 textes ; le tableau avant et après.
- Réécrits pour la règle neuve, aucun supprimé : `sentinelle-familles-cum-hyb-2026-11-27`, `sentinelle-sel-sans-pan-2026-11-21`, `sentinelle-sigles-sel-std-2026-11-21`, `sentinelle-den-reliquats-343`, `sentinelle-routage-representations-2026-06-04`, `sentinelle-renommage-selection-productions`, `sentinelle-comparateur-synthese-recap` (deux descriptions), `sentinelle-467-affichage-echappe` (21 → 19), le cliquet de complexité (`creerPratiqueV2` : 76 → 61, par l'extraction).
- Harnais : `charger-script.js` et `bac-suivi.js` fournissent le VRAI lecteur de famille aux bancs qui montent la fiche ou l'assistant sans le registre.

**Preuve que rien n'est calculé autrement** : aucun banc de note n'a demandé de retouche. Les douze fichiers rouges après le changement étaient tous des bancs de texte, de badge ou de structure.

**Break-tests** (chaque mutation posée dans `js/`, la sentinelle neuve lancée seule, la mutation retirée ; 52 verts avant et après) :

| Mutation | Rouges |
|---|---|
| M1 la règle redevient une lecture du type | 14 |
| M2 les jetons lus par le défaut du moteur | 22 |
| M3 les deux blocs ne comptent plus comme retenus | 1 |
| M4 les jetons de délai rendent hybride | 4 |
| M5 des jetons éteints comptent | 10 |
| M6 « Toutes » compte comme un bloc retenu | 14 |
| M7 la bibliothèque relit le type | 2 |
| M8 le récapitulatif relit le type | 2 |
| M9 un second lecteur par type revient (Comparateur) | 1 |
| M10 un texte de Grégoire retouché (survol CUM) | 5 |

**Navigateur.** WebKit n'existe pas dans ce conteneur : **rien n'a été joué sous WebKit.** Sous Chromium (un indice, pas un verdict Safari), fichier par fichier :

| Banc | Chromium |
|---|---|
| `bibliotheque-deux-colonnes-1156` | 18 verts, 1 sauté |
| `bibliotheque-deux-colonnes-1154` | 10 verts, 1 sauté |
| `modele-fourni-non-supprimable`, `modele-par-standards`, `comparateur-par-standards` | verts (joués ensemble avec le 1156 avant sa retouche : 31 verts, 2 sautés, 1 rouge, le 1156) |
| `audit-pratiques-notation-parcours-2026-09-16` | 5 verts |
| `chaines-etapes-1149-lot-3b` | 9 verts, 1 sauté |
| `import-pratiques-inter-trimestre-briqueC` | 7 verts |
| `par-standards-lots-3-4` | 7 verts |
| `pratiques-compatibles-retirees` | 2 verts |
| `profil-896-obligatoires-brouillon-hybride` | 1 vert |
| `standards-sans-portfolio-lot-3` | 2 verts |
| `tableau-de-notation-1` | 22 verts |
| `vue-simple` | 3 verts |
| `je-regarde-evaluer-2026-11-18` | 1 rouge sur 3 au premier passage (joué pendant d'autres bancs), **3 verts rejoué seul** ; 3 verts sur la base. Je le tiens pour instable sous charge (inférence, deux passages seulement). |
| `vue-simple-modeles-actuels-epingles` | **2 rouges, dont un seul écart dû au lot** (voir ci-dessous) |

**Les écrans épinglés de la vue simple.** Ce banc compare le HTML à une référence prise sous WebKit sur le Mac : sous Chromium il rougit de toute façon (largeurs en pixels, « Ctrl+Z » pour « ⌘Z »). Mesuré en reprenant la référence sous Chromium puis en la remettant : **un seul écart vient du lot**, le badge du bandeau du tableau pour le modèle « Hybride », qui passe de HYB à CUM avec son survol. J'ai repris CE SEUL élément de la référence, à la main, faute de WebKit. À rejouer sur le Mac : s'il rougit ailleurs, la référence se reprend par la commande que le banc documente.

Les autres bancs de navigateur n'ont pas été joués (la suite entière ne tient pas sous Chromium, voir `playwright.chromium.config.js`).

Un banc a été retouché : `bibliotheque-deux-colonnes-1156.spec.js` attendait l'ancien résumé de l'hybride (texte 7).

## 9. Sous Safari

Aucune porte terrain n'est due (règles de tête du skill `portes-terrain`) : le lot est de l'affichage, rien n'est écrit, un raté se corrige. Pas d'artefact jumeau à publier. Ce que je n'ai pas pu vérifier, en mots d'utilisateur, pour qui veut le regarder une fois le lot en ligne :

1. Ouvre `https://app.codexnumeris.org`, recharge, lis le numéro de version en bas de page : c'est celui de la release qui portera ce lot.
2. Conception › Pratiques, ouvre la bibliothèque. La ligne de « Modèle cumulatif » dit « Cumulative · fourni avec l'application » ; celles des deux modèles « N meilleures » et « N plus récentes » disent « Hybride ».
3. Ouvre une pratique de type « Cumulative ». Laisse la souris sur le badge CUM : la bulle dit « Cumulative : toutes les évaluations sommatives comptent, sans reprise. »
4. Dans cette fiche, coche « Activer le système de jetons ». Le badge passe à HYB sans recharger ; sa bulle dit « Hybride : cette pratique offre des jetons de reprise. » Décoche : il revient à CUM.
5. Ouvre une pratique de type « Hybride », mets « Mode de sélection » sur « Toutes les productions » (ou « Tous les artefacts »), jetons décochés : le badge passe à CUM.
6 bis. Ouvre la fiche d'une pratique ancienne, qui n'a jamais eu de jetons réglés : « Activer le système de jetons » est décochée. Change sa description, quitte le champ : le badge reste CUM. Coche la case : il passe à HYB.
6 quater. Dans cette même fiche, sous la case : la phrase « Avec des jetons de reprise, ta pratique est hybride : une note peut être révisée. » paraît quand tu coches, disparaît quand tu décoches. Si la carte « Système de jetons » est repliée, déplie-la d'abord.
6 ter. Dans la démo de cette branche, l'écran d'évaluation dit « Système de jetons désactivé » : c'est attendu jusqu'à la release.
6. Sur iPad, il n'y a pas de survol : la bulle ne s'y lit pas. Le badge, lui, doit changer de la même façon.
7. Dans l'assistant, choisis la famille hybride puis, à « Construction de la note », « Toutes les productions » : le récapitulatif doit dire « Cumulative », en orange.
8. En vue simple, à « Ta pratique », la première carte s'appelle « Cumulative par niveaux ». Choisis-la et va au tableau : le badge dit CUM à côté du nom « Cumulative par niveaux ». Une pratique installée avant garde son ancien nom (« Hybride ») à côté du même badge CUM.

## 10. Fichiers du lot

`js/pratiques/pratique-registre.js`, `js/evaluation-jetons.js`, `js/pratiques-gestion.js`, `js/wizard-pratique-v2.js`, `js/donnees-v2.js`, `js/comparateur-pratiques.js`, `js/tableau-notation.js`, `js/profil-etudiant-sections-affichage.js`, `js/etudiants.js`, `js/export-resultats-finaux.js`, `js/accompagnement-contenu-terme.js`, `js/accompagnement-contenu-hover.js`, `js/accompagnement-contenu-popup.js`, `index.html` ; le fichier de textes validés ; les bancs.

Rituel `/fin-de-session` : non lancé en entier (il mène à la release, exclue par le mandat). Faits à la main : l'audit du diff contre les règles de sécurité (aucun `console.log`, aucun handler en ligne, deux `innerHTML` neufs qui ne reçoivent que des sigles et des phrases du registre), la suite Vitest, les break-tests.
