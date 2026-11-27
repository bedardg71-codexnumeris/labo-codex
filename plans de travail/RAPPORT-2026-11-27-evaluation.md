# Rapport : Évaluation, sept fiches décidées par Grégoire (27 novembre 2026)

Branche `lot/evaluation-2026-11-27`, partie de `lot/file-sans-gregoire-2026-11-27` à `951de3f89`. **Aucune fusion vers `main`, aucun bump, rien au changelog.** Un commit par fiche, plus deux retouches nommées et les commits de ce rapport.

**Dernier relais (27 nov., suite de 15 h 19 et 15 h 20)** : les sept fiches sont faites. Matin : #1271, #1204, #598 volet B, #1132 ; #1247 arrêtée à la mesure. Après-midi, sur tes décisions : #1247 reprise et cochée (la copie à la corbeille comptée à part), fiche 6 (l'aide survolée d'« Optimisation »), fiche 7 (l'onglet d'un seul PDF habillé, et les exports d'une rétroaction alignés). Vitest complet vert (970 fichiers, 12 529 essais). Bancs d'écran sous Chromium seulement ; rien sous WebKit : le verdict du Mac reste dû avant toute fusion, et la page d'attente de l'onglet est à voir sous Safari et sur l'iPad. Numéros réservés #1325 à #1329 : aucun pris.

## Fiche par fiche

### Fiche 1, #1271 : la production choisie pour le lot (fait)

- Le choix « S'applique à tout le lot » tombe après chaque importation réussie et après « Annuler tout ». Pendant un même lot, il reste. Au dépôt suivant, le nom porté par les fichiers propose la production.
- Il vivait à deux endroits, qui tombent ensemble : la variable `productionSelectionnee` (`travaux-import.js`) et les deux clés de session que l'Inspecteur relit (`travaux-pipeline-production`, `travaux-jeton-production`). Une seule fonction, `oublierProductionDuLot`.
- **Supposé** : une importation est « réussie » quand elle a écrit des fichiers ET vidé la file. Si une erreur ou un doublon laissé de côté reste dans la file, c'est encore le même lot, et le choix reste. Un doublon arbitré qui vide la file fait tomber le choix.
- « Vider la file » (fichiers expirés après un rechargement) n'est pas touché : la décision nomme l'importation et « Annuler tout ».
- Preuve : `tests/unit/production-du-lot-1271.test.js` (les vrais `travaux-import.js` et `travaux-ui.js`, même session), 4 rouges avant le correctif, six break-tests rouges. Source seulement : rien n'est stocké hors de la session du navigateur, aucun stock à reprendre.

### Fiche 2, #1247 : une copie numérisée introuvable à l'export pour Léa (arrêtée à la mesure le matin ; faite l'après-midi)

**La mesure demandée : le code peut-il distinguer « jamais importée » de « importée puis introuvable » ? Réponse : pour une copie à la corbeille seulement.**

- **À la corbeille** : distinguable. La corbeille (`corbeilleFichiers`) garde l'élève, la production et parfois l'`evaluationId` de la copie, jusqu'à « Vider la corbeille » ou la purge des 30 jours.
- **Supprimée** (« Supprimer définitivement », corbeille vidée, purge des 30 jours, suppression directe) : aucune trace. Les métadonnées, le fichier, la vignette et les annotations partent ensemble (#572), et l'évaluation ne porte aucune référence à sa copie (le lien se fait par élève et production ; « fichierId supprimé » depuis la phase 3b de `travaux-resolution.js`).
- **Réassociée** à un autre élève ou une autre production : retrouvable seulement si la copie porte l'`evaluationId`, que quelques chemins posent.

Rien n'est codé. La mesure est inscrite à la fiche, case non cochée.

**Proposition, pour ta décision** :
1. Compter à part ce que le code sait : une copie à la corbeille part avec « dont N dont la copie est introuvable », sa synthèse envoyée quand même. Une copie supprimée reste comptée « sur papier » : il faut l'assumer et le dire, car c'est le cas le plus probable (la corbeille se vide).
2. Pour que les copies supprimées à l'avenir soient reconnues, une trace serait à écrire au moment où la copie est importée ou évaluée (par exemple une marque sur l'évaluation : « évaluée sur une copie importée »). C'est un changement de ce qu'on enregistre : il ne vaudrait que pour les évaluations faites après lui, jamais pour le stock. À toi de dire si on l'ouvre.

Ma recommandation : le 1 seul pour l'instant. Le 2 ajoute un champ aux évaluations pour un cas qu'aucun vécu n'a montré (la fiche le dit : « Aucun cas vécu »).

**Reprise (décision de 15 h 19 : le 1, sans trace nouvelle ; tes mots « dont N dont la copie est à la corbeille »)** :
- `selectionnerEvaluationsLea` rend `aLaCorbeille`, les évaluations sans copie résolue dont la copie est à la corbeille du groupe-cours actif. Même résolution que pour une copie présente : par l'évaluation (ou celle qu'elle reprend), sinon par l'élève et la production. `sansFichier` ne change pas : ces synthèses partent comme avant, le PDF de l'élève ne change pas.
- Le compteur que lit l'enseignant·e : la phrase est invariable, comme « sur papier ». **Les deux cas ensemble** : le papier d'abord, la corbeille ensuite, et le total compte les deux : « 12 PDF pour 12 étudiant·es, dont 2 sur papier (synthèse seule), dont 1 dont la copie est à la corbeille ». Corbeille seule : « 5 PDF pour 5 étudiant·es, dont 1 dont la copie est à la corbeille ».
- Un seul élève choisi : la phrase d'avant, « 1 évaluation prête (synthèse seule) », que la copie soit sur papier ou à la corbeille (le compteur n'y a pas de « dont »).
- **Limite assumée** : une copie supprimée pour de bon reste comptée « sur papier ». Aucune trace n'est ajoutée aux évaluations.
- Laissé tel quel (texte existant) : si la synthèse d'une copie à la corbeille ne peut pas être faite, le bilan d'échec dit « … — sur papier : … », comme pour le papier.
- Preuve : `tests/unit/lea-copie-a-la-corbeille-1247.test.js`, 6 rouges avant, six break-tests rouges (dont la copie reliée par son évaluation seule, et la production ignorée) ; le banc #1245 vert sans retouche. Fiche cochée au BACKLOG.

### Fiche 6 : l'aide survolée de l'étape « Optimisation » (fait)

- `js/accompagnement-contenu-hover.js`, la seule entrée `travaux-pipeline-optimisation`, tes mots : « Traitements appliqués aux images : balance des blancs si sa case est cochée, uniformisation DPI selon le sélecteur, compression JPEG. Les fichiers d'un·e même étudiant·e pour une même production sont regroupés (multi-pages). Les PDF sont importés tels quels. »
- Les deux lignes « Balance des blancs : correction colorimétrique des photos prises en classe » (`accompagnement-contenu-popup.js`) restent telles quelles ; le banc les compte (l'une porte une espace insécable avant le deux-points, l'autre non : laissées ainsi).
- Preuve : `tests/unit/aide-optimisation-balance-du-lot.test.js`, rouge avant ; break-test rouge. Jeton `20261126e` ; la session du Suivi touche aussi ce fichier : à l'assemblage, une seule lettre par fichier.

### Fiche 7 : l'export d'un seul PDF ne s'ouvre plus sans prévenir (fait)

- **La page d'attente** du nouvel onglet est habillée et dit tes mots : « Labo Codex prépare la rétroaction de [Prénom Nom]. Le PDF s'affichera ici. Pour revenir à l'application, ferme cet onglet. » La première phrase en tête, en gras ; les deux autres dessous, en plus discret. Titre de l'onglet : « Rétroaction en PDF » (celui du 20 nov.).
- **Comment elle est habillée, sans script** : l'onglet s'ouvre vide (même origine que l'application) ; l'application le remplit d'ici, par le DOM, avec les couleurs qu'elle affiche à cet instant, lues sur son `body` (fond de page, carte, texte, texte discret, accent, bordure : sombre ou clair selon ton réglage). Aucun script n'entre dans l'onglet ; le nom passe en texte, jamais en HTML. Une largeur d'appareil est posée pour que l'iPad n'affiche pas une page de bureau réduite.
- **[Prénom Nom] en anonymisation** : ce que l'écran affiche déjà pour cette personne, c'est-à-dire le nom anonyme (« Élève 32 », sans nom de famille), jamais le nom réel. Hors anonymisation : prénom puis nom. Élève introuvable : l'onglet dit la phrase de la préparation, comme avant.
- **Sous « Exporter pour Léa »**, quand une seule évaluation est prête : « Un seul PDF : il s'ouvrira dans un nouvel onglet. » Rien sinon.
- **L'onglet s'ouvre quand la sélection annonce un seul PDF**, un·e étudiant·e choisi·e ou « — Tous — » avec une seule évaluation prête. Avant, « — Tous — » avec un seul PDF le téléchargeait : c'est un changement, fait au nom de « tout export d'un seul PDF ». Plusieurs PDF : le ZIP, téléchargé, comme avant. Rien de prêt : aucun onglet ne s'ouvre (avant, un onglet s'ouvrait puis se refermait). Le navigateur refuse l'onglet : le PDF est téléchargé, comme avant.
- **Les autres exports d'un seul PDF** (inventaire) :

| Export | Où | Disposition |
|---|---|---|
| « Exporter pour Léa », un seul PDF | Évaluations › Exporter | aligné (ci-dessus) |
| « Dossier PDF », synthèse seule comprise | liste des évaluations, menu Actions | **aligné** : même onglet, même page d'attente |
| « Exporter le PDF » | fenêtre de révision avant export | **aligné** |
| « Télécharger PDF » | Archivage, aperçu d'une copie | laissé : le bouton promet un téléchargement, et le PDF est déjà affiché dans l'application |
| PDF du matériel : productions, grille(s), échelle(s), cartouche, référentiel, grille + échelle + cartouche | Conception | laissés : pas une rétroaction, la phrase validée n'y convient pas |
| Rapport des présences, rapport du bilan réflexif | Suivi, Bilan réflexif | laissés : même raison |

  ⮕ **Question pour toi** : les PDF laissés passent toujours par le téléchargement de jsPDF. Si, sur l'iPad, eux aussi prennent la place de l'application dans son onglet, il leur faudrait le même chemin, avec une phrase d'attente à eux.
- Preuve : `tests/unit/onglet-du-pdf-attente.test.js` (19 essais), rouge avant, neuf break-tests rouges (texte, ordre du nom, couleurs, largeur d'appareil, HTML au lieu de texte, onglet ouvert seulement avec un·e étudiant·e choisi·e, phrase dès un PDF, onglet ouvert après l'attente, `doc.save` revenu).
- Banc d'écran `evaluation-lot-2026-11-27.spec.js`, essai neuf, **sous Chromium** : la phrase sous le bouton ; l'onglet, son texte, ses couleurs égales à celles de l'application en sombre PUIS en clair, aucun script, puis le PDF qui arrive dans le même onglet ; l'application reste dans le sien. Deux break-tests rouges (fond fixe, phrase absente). Captures (`CAPTURES_PARCOURS=1`) : la carte au centre, lisible dans les deux thèmes.
- **Cinq bancs retouchés** (`bareme-3-evaluer`, `copie-non-recevable-note-28-oct`, `dossier-912-synthese-sans-copie`, `echelle-depart-prestructurel-1152`, `note-remise-1173`) : ils jugent le CONTENU du PDF en observant le téléchargement de jsPDF ; le PDF partant maintenant dans l'onglet, ils ne le voyaient plus (15 rouges sous Chromium). Ils refusent l'onglet, une ligne chacun, commentée : le PDF passe par le téléchargement qu'ils observent. Rejoués : verts, sauf deux rouges de `bareme-3-evaluer` (le focus), rouges aussi sans mon code.

### Fiche 3, #1204 : la phrase du bilan d'un critère tombé à 0 (fait)

- **Reproduit d'abord** : une copie du mode des codes par catégorie (sa mémoire porte `codes`, `totalErreurs`, `pourcentage: 0`, pas `erreurs`) n'était pas repérée par `_detecterAlgoA0Bilan` (`evaluation-retroaction.js`) tant que la copie annotée n'était pas ouverte ; la seconde source ne rattrapait que les copies annotées, par une estimation de la formule sans les poids des sous-critères.
- La détection lit maintenant `erreurs`, sinon `totalErreurs` (la lecture déjà faite par `comptes-erreurs-stock.js`), par une petite fonction `_erreursDitesAlgo`. Le nombre dit à l'élève est le nombre brut de codes, celui qu'il lit partout ailleurs. Aucun mot nouveau.
- **Ce que l'élève lit change pour ce cas** (accepté par Grégoire) : les synthèses déjà remises ne changent pas ; une copie rouverte ou réévaluée peut gagner la phrase de bilan, puisque le bilan se recalcule à l'ouverture.
- Preuve : `tests/unit/bilan-critere-effondre-codes-1204.test.js`, 2 rouges avant, quatre break-tests rouges (dont l'inversion de la priorité entre les deux champs).
- Retouche `9b167ea78` : la suite complète a rougi sur la sentinelle de complexité (434 fonctions au-dessus de 15 pour 433). Mon ternaire portait la fonction anonyme de la détection de 15 à 16 ; la lecture est sortie en fonction nommée, l'anonyme revient à 15.
- Voisin, non touché : #1133 note que la ligne de calcul du PDF manque aussi en mode des codes (même cause, `totalErreurs`), déjà inscrit.

### Fiche 4, #598 volet B : la balance des blancs pour tout le lot (fait)

- Dans l'Inspecteur de Préparer, sur la ligne de « Rés. max. » : la case « Balance des blancs », cochée au départ. Décochée, la balance automatique ne s'applique ni aux deux aperçus ni à l'image importée ; les trois lisent `balanceActiveePour`, qui lit la case (la constante `BALANCE_GLOBALE_ACTIVE` est retirée). Le geste refait les aperçus ; le cache des vignettes garde déjà les deux versions.
- **Retenue d'un lot à l'autre, comme « Rés. max. »** (mesuré : « Rés. max. » survit à l'import et à « Annuler tout », et la session le relit après un rechargement ; il revient à son défaut quand l'onglet se ferme). La case fait exactement pareil : variable du module, et la session sous `travaux-pipeline-balance`. Nom nu, comme `travaux-pipeline-dpi` : c'est la règle de #596 pour une préférence sans identifiant (le piège noté le 30 août, « passer par `cle()` », date d'avant cette règle).
- **Comment la case du lot et les réglages spécifiques se composent** (ces derniers ne changent pas) :
  - le bouton « Balance des blancs » des réglages spécifiques (la pipette, une image) pose une correction cuite dans l'image par `renduFinal` ; elle s'applique case cochée ou non, et elle remplace la balance automatique pour cette image (règle du 17 nov.) ;
  - la case « Ne pas appliquer la balance des blancs à ce document » reste une exception qui ne peut qu'enlever : case du lot décochée, elle n'a plus rien à enlever.
- Preuve : `tests/unit/balance-du-lot-598-volet-b.test.js`, 6 rouges sur le code d'avant, six break-tests rouges ; sentinelle 598 verte (son cas 3 lit le nouveau nom) ; sentinelle 596 : la nouvelle clé nue ajoutée à la liste de son commentaire.
- Retouche `f3bf9396f` : mesurée sous Chromium, l'étiquette de la case faisait 164 × 26 px, sous la cible tactile de l'iPad. Elle passe à 44 px de haut ; la ligne reste d'un tenant à 820 et 1180 px.
- Banc d'écran `tests/integration/evaluation-lot-2026-11-27.spec.js` (page réelle) : la case et sa ligne, la vignette qui perd la balance case décochée (mesuré au pixel : le bleu d'une page jaunie) et la retrouve recochée, l'import sans balance, et #1271 (« Annuler tout » puis nouveau dépôt). **Joué sous Chromium seulement** : vert, deux break-tests rouges.

### Fiche 5, #1132 : close (fait)

Cochée au BACKLOG avec la décision et sa date : la limite est dite à l'écran depuis le 22 oct. ; la fiche se rouvrira le jour où quelqu'un a besoin de deux critères qui comptent. Aucun code.

## Vérifié, et pas vérifié

- Vitest complet, depuis `tests/` : 970 fichiers, 12 529 essais verts (27 nov., après la fiche 7, conteneur). Le matin : 967 fichiers, 12 498 essais.
- Sous Chromium 1243 (le conteneur n'a pas WebKit) : le banc du lot (2 essais) vert ; le banc de G5 (`je-regarde-recevoir`, l'export Léa dans un onglet) 4 sur 4 ; `parcours-4-recevoir-et-rendre` (deux PDF, le ZIP ; premier signe à 13 ms), `export-lea-verrouillees`, `emojis-et-syntheses-papier`, `1028-archiver-copies`, `nous-faisons-recevoir` verts ; les cinq bancs retouchés verts, sauf les deux rouges préexistants du focus. **Rien sous WebKit, ni Safari, ni l'iPad.** Les autres specs n'ont pas été jouées.
- Jetons anti-cache au jour du build en ligne : `travaux-import.js?v=20261126e`, `evaluation-retroaction.js?v=20261126e`, `travaux-ui.js?v=20261126h`, `travaux-archivage.js?v=20261126c`, `travaux-export-pdf.js?v=20261126e`, `accompagnement-contenu-hover.js?v=20261126e` (le garde pre-commit exige une lettre neuve à chaque commit qui touche le fichier). La release les avancera.
- Hors périmètre, non touchés : les fichiers du Suivi (session parallèle ; dans `accompagnement-contenu-hover.js`, la seule entrée de la fiche 6), `js/config.js`, `js/navigation.js`, `noms_stables.json`. Dans `index.html`, seules les lignes de jeton de mes fichiers.

## Ce que seul un écran peut juger

Aucune porte terrain formelle : rien dans ce lot n'écrit de façon irréversible dans tes données (règle 2 du skill `portes-terrain`), et le lot n'est pas en ligne (pas fusionné). Voici les gestes qui restent à l'écran, à faire quand le lot sera en ligne, en usage normal :

1. Préparer : choisir une production en haut, importer ; au dépôt suivant, le menu « Production » montre « — Choisir une production — » et chaque fichier de Léa reçoit sa production. (Sous Chromium : vu pour « Annuler tout », pas pour l'importation.)
2. Même chose après « Annuler tout ». (Vu sous Chromium.)
3. Une importation où un fichier échoue : la production reste choisie pour les fichiers restants. (Banc Vitest seulement.)
4. Sur l'iPad : la case « Balance des blancs » sur la ligne de « Rés. max. », et se cocher au doigt du premier coup.
5. Décocher la case : les vignettes « Aperçu » et le grand aperçu reprennent les couleurs d'origine en moins d'une seconde ; recocher : elles reviennent. (Vignette vue sous Chromium ; grand aperçu, non.)
6. Importer une photo case décochée : dans Annoter, elle a ses couleurs d'origine.
7. Case décochée, puis « Annuler tout » ou un nouveau lot : elle reste décochée. Fermer l'onglet et rouvrir : elle revient cochée (comme « Rés. max. »).
8. Une image corrigée à la pipette « Balance des blancs » des réglages spécifiques, case du lot décochée : la correction est bien appliquée.
9. #1204 : une copie du mode des codes dont le critère algorithmique tombe à 0 montre au bilan la phrase « Défi prioritaire » du gabarit. Ce mode n'a pas d'écran qui l'active (#1133) : en pratique, seules les évaluations du démo sous « Grille-5 FR-ALGO-20 H26 » le portent.
10. #1247 : une copie mise à la corbeille, puis le compteur de « Exporter pour Léa » : « dont 1 dont la copie est à la corbeille » ; l'export donne sa synthèse.
11. Survoler l'étape « Optimisation » : l'aide dit « balance des blancs si sa case est cochée ».

**Fiche 7, sous Safari et sur l'iPad** (rien de cela n'a été vu hors de Chromium) :

12. « Exporter pour Léa », un·e étudiant·e choisi·e : l'onglet s'ouvre (Safari ne le bloque pas), passe devant avec la carte « Labo Codex prépare la rétroaction de … », à tes couleurs, lisible sans zoomer sur l'iPad ; puis le PDF la remplace.
13. Même chose en thème clair.
14. En anonymisation : la carte dit « Élève N », pas le nom réel.
15. Une seule évaluation prête : la phrase sous le bouton ; « — Tous — » ouvre aussi l'onglet.
16. « Dossier PDF » depuis le menu Actions de la liste des évaluations : sur l'iPad, ce menu est un sélecteur natif ; Safari pourrait refuser un onglet ouvert depuis ce choix. S'il le refuse, le PDF est téléchargé comme avant (rien de perdu), mais la page d'attente ne s'affiche pas : à voir.
17. « Exporter le PDF » dans la fenêtre de révision : même onglet.
18. Revenir à l'application en fermant l'onglet : l'application est là, telle quelle.

## Trouvailles (aucune inscrite)

- **Lu au code, pas vécu** : après un rechargement de la page en plein lot, le menu « Production » de l'Inspecteur peut montrer la production gardée en session alors que les fichiers déposés ensuite ne la reçoivent pas (la variable du module repart vide). La fenêtre de confirmation dit alors une production que les fichiers ne portent pas. Disposition : *commentée dans le code* (`travaux-import.js`, à la déclaration de `productionSelectionnee`) ; aucun symptôme vécu, cas rare (rechargement au milieu d'un lot). Ce lot le rend plus rare encore : la clé de session tombe maintenant à l'importation et à « Annuler tout ».
- ~~Texte laissé tel quel (consigne)~~ : l'aide survolée de l'étape d'import. Retouchée par la fiche 6, avec tes mots.
