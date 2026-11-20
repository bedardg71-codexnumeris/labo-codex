# Rapport du lot `dupliquer-copie-profonde` (19 nov. 2026)

**Dernier relais.** Branche `lot/dupliquer-copie-profonde`, partie de `origin/main` à `ade09e93`. Fait : #1298
inscrit (priorité haute) ; seize gestes de copie corrigés par une copie profonde, bancs vus rouges avant la correction ;
un diagnostic en lecture seule dans Réglages › Données › Maintenance. APERÇU seulement (PR « ne pas fusionner ») : ni
fusion, ni release, ni Nouvelles écrites. Reste : la décision sur les identifiants de critères (point 2, je ne l'ai pas
prise) ; le diagnostic chez Grégoire, qui exige que le lot soit en ligne ; la réparation, à lui proposer.
Consigne : `plans de travail/CONSIGNE-2026-11-19-dupliquer-copie-profonde.md`.

## En bref

- Le défaut est reproduit au navigateur et corrigé dans les deux gestes des grilles, et dans quatorze autres.
- Les identifiants de critères restent ceux de la source. Un seul lecteur suppose qu'un identifiant de critère désigne
  une grille : un outil de console (`CartouchesDecalees`). Je le décris au point 2 et je ne tranche pas.
- Un lien déjà écrit survit au rechargement et à toute modification ordinaire. Il ne voyage pas (codex, sauvegarde,
  partage sont du JSON) ; il se défait quand l'appareil rouvre un codex. Deux appareils peuvent donc diverger.
- Le correctif tarit la source, pas le stock : sur un appareil qui porte une paire liée, modifier la copie modifie
  encore la source après ce lot. D'où le diagnostic.

## 1. La fiche et le banc rouge

- **#1298** au BACKLOG, section du 19 nov., priorité haute. Numéro mesuré sur toutes les branches : #1296 est pris deux
  fois (`lot/glisser-alignement`, `lot/autoevaluation-consignes`), #1297 par `lot/nous-faisons-classe`.
- **Le banc écrit d'abord** (commit `71aa3e7f`, rouge) : `tests/integration/dupliquer-copie-profonde-1298.spec.js`.
  Par les deux gestes, en paysage et en portrait : la copie partageait `criteres` avec la source dans IndexedDB, et
  réécrire le niveau D dans la copie (par sa case, dans l'éditeur) le réécrivait dans la source.

## 2. Les deux gestes des grilles, et les identifiants de critères

**La correction.** `dupliquerGrilleDepuisSidebar` (bouton « Dupliquer » de l'éditeur) copie la grille par
`JSON.parse(JSON.stringify(…))` avant de poser son identité. `BibliothequeUI.dupliquerVersBibliotheque` (« Dupliquer » de
la bibliothèque, commune aux cinq familles) copie désormais toujours en profondeur ; son paramètre `cloneProfond`, qui
ne servait qu'aux pratiques, est retiré (aucune famille ne veut le lien).

**Les identifiants gardés : ce que j'ai vérifié** (lu au code par un agent, points porteurs relus par moi) :
- les évaluations gardent `grilleId` et relisent chaque critère dans la grille de l'évaluation ;
- les cartouches vivent sous `cartouches_<grilleId>`, leurs commentaires sous `<critereId>_<niveau>` : toujours lus
  dans la clé d'une grille ;
- codex, sauvegardes, export de recherche et partage n'indexent jamais par identifiant de critère hors d'une grille ;
- aucun identifiant d'élément d'écran construit sur un identifiant de critère n'entre en collision (une grille à la fois).

**⛔ Ce qui le suppose, et où je m'arrête.** `js/cartouches-decalees.js:46` (`_grillesDeSesCriteres`, #1145) cherche
« la » grille d'une cartouche décalée parmi les grilles qui portent TOUS ses identifiants de critères. S'il en trouve
plusieurs, il refuse (la source et sa copie intactes donnent ce refus prudent). S'il n'en trouve qu'une, il propose de
ranger la cartouche sous elle. Cas faux : une cartouche de la source dont un critère a disparu de la source, mais pas de
la copie ; l'outil proposerait de déplacer la cartouche de la source vers la copie. Il n'est atteignable qu'à la console
et n'écrit qu'avec `{ reparer: true }` et l'accord de Grégoire.
Je ne choisis pas. Le lot ne change rien aux identifiants : les gestes les gardaient déjà, la copie profonde aussi. Les
deux voies que je vois, pour Cowork :
- garder les identifiants (supposé par Cowork) et apprendre à cet outil à ne pas conclure quand la grille trouvée est une
  copie de celle de la cartouche (`inspireDe.sourceId`) ;
- les régénérer à la duplication, comme le fait `dupliquerGrille` ; on perd alors le report par identifiant quand une
  évaluation change de grille (`evaluation-chargement.js:868-975`, par identifiant puis par nom) et le rattachement par
  identifiant des cartouches (`cartouche-correspondance.js`), sans parler de l'identité commune voulue plus tard.

Deux lecteurs voisins, qui ne supposent pas l'unicité :
- l'import sélectif reconnaît une grille déjà là par son NOM, puis le confirme par ses identifiants
  (`import-export.js:3409`) : ambigu seulement si deux grilles locales portent le même nom ;
- `_naissanceDuCritere` (`evaluation-calcul.js:1291`) lit une date dans l'identifiant : un critère copié « naît » à la
  date de la source. Lecteur restreint à une grille ; inférence : sans effet, puisque toute évaluation faite avec la
  copie est postérieure à sa création.

## 3. Les autres copies : mesuré, corrigé, sain

Un « lien » est un objet partagé entre la copie et sa source, relu par `db.get`. Mesuré au navigateur (Chromium), sur le
code d'avant, en petite collection et en grande (au-delà de 25 Ki caractères, `db` sert la clé par son cache mémoire,
par référence).

**Lien toujours, dans la même clé : huit gestes corrigés.** « Dupliquer » de l'éditeur et de la bibliothèque, pour :

| Famille | Partagé avant | Effet mesuré (changer la copie change la source) |
|---|---|---|
| Grilles | `criteres` | oui, les deux gestes (texte du niveau D) |
| Échelles | `niveaux`, `config` | oui, les deux gestes (nom d'un niveau) |
| Cartouches | `criteres`, `niveaux` ; plus `commentaires` par la bibliothèque | oui par la bibliothèque (un commentaire) ; latent par l'éditeur (ses `commentaires` étaient déjà recopiés, rien n'écrit en place dans `criteres` ni `niveaux`) |
| Productions | `echeancesParGroupe`, `titresBlocs`, `champsPersonnalises` | latent : le formulaire remplace chaque champ en entier, aucun geste n'écrit dans un sous-objet |

**Lien seulement par le cache mémoire (grande collection) : huit gestes corrigés.**
- « Utiliser dans ce trimestre » depuis la bibliothèque, pour une grille, une échelle, une production, une cartouche et
  une pratique (`ajouter*Individuelle`, `ajouterPratiqueALaSelection`) : deux clés, mais en mémoire la copie du
  trimestre et l'original de la bibliothèque partageaient leurs sous-objets. Pour la pratique, l'original peut être un
  modèle prédéfini, une constante en mémoire.
- L'import d'une cartouche d'un autre trimestre (`importerUneCartoucheTrimestre`, chemin 2) : `niveaux`.
- `dupliquerGrille` (critères reconstruits mais étalés : `descripteurs`) et `dupliquerPratique` (`calcul_note`).
- **Effet mesuré de bout en bout pour la grille**, sur le code d'avant : texte réécrit dans la copie du trimestre, la
  grille de la bibliothèque le prend en mémoire ; « garder » ensuite une autre grille dans la bibliothèque l'écrit ;
  après rechargement, la bibliothèque porte le texte de la copie.

**Mesuré sain au navigateur**, petite et grande collection : les cinq « Dupliquer et éditer » (`dupliquerEtEditer*`,
dont « Dupliquer pour créer ma grille », déjà profonds), `dupliquerEchelle`, `dupliquerPratiqueMateriel`, `dupliquerPratiqueBibliotheque`,
`dupliquerEtEditerPratique`, « garder dans la bibliothèque » (grille, échelle, production) et l'import d'une échelle ou
d'une production d'un autre trimestre vers la bibliothèque.

**Lu sain au code, non mesuré** : `copierPratiqueDepuisTrimestre`, `copierGrilleDepuisTrimestre` et le partage
(`partageSection`, copie JSON), `copierCartouchePourGrille`, `dupliquerEnsembleObjectifs`, la duplication d'une carte
d'Alignement et de ses nœuds, `dupliquerGabarit`, le copier-coller d'annotations, le jeton de reprise d'une évaluation.
Non corrigé : `_rangerSousSaGrille` (console, étalement de surface, la source est retirée aussitôt) ; sans conséquence.

**Bancs.** `dupliquer-copie-profonde-1298.spec.js` (8 gestes × 2 orientations : le lien, l'effet là où un geste écrit
en place, avant et après rechargement) ; `dupliquer-copie-profonde-1298-cache.spec.js` (8 gestes en grande collection,
plus le scénario de bout en bout de la grille). **Break-tests** : sur le code d'avant, les 17 essais rougissent en
paysage (lien) ; avec l'assertion du lien retirée, l'effet rougit pour les cinq gestes du tableau qui écrivent en place.

## 4. Ce que devient un lien déjà écrit

Mesuré au navigateur (sonde non gardée), sur une copie qui partage `criteres`, petite et grande collection :
- **il survit au rechargement** ; toute modification ordinaire (`db.modifier`) relit IndexedDB et le garde ;
- **le codex** s'écrit en JSON (`js/codex.js:520`) : le fichier porte deux tableaux de même contenu, aucun lien ;
- **rouvrir ce codex dans le même espace défait le lien**, contenu identique, et cela tient après rechargement ;
- **ouvert dans un espace neuf** (l'autre appareil), pas de lien non plus.

Lu au code, non mesuré : la sauvegarde sélective (« Exporter ») et le partage d'une grille (`.lcz`,
`js/partage-export.js:180`) sont du JSON ; ce qui est reçu est indépendant, et l'appareil qui envoie garde son lien.

**Deux appareils peuvent-ils diverger ? Oui.** C'est une inférence, tirée des mesures ci-dessus : l'appareil où la
copie a été faite garde le lien tant qu'il ne rouvre pas un codex ; l'autre, qui a reçu le codex, ne l'a pas. Le même
geste (réécrire un texte de la copie) modifie la source sur le premier et pas sur le second. Le prochain codex
transporté décide lequel des deux états l'emporte.

## 5. Le diagnostic, en lecture seule

**Où** : Réglages › Données › Maintenance › « Copies liées à leur source », bouton « Vérifier les copies liées », puis
« Copier le résultat ». Même endroit sur l'iPad et sur le Mac. Pourquoi là : la console n'est pas accessible sur l'iPad
sans le Mac, et une page à part changerait la liste blanche de publication arrêtée le 16 oct.
⚠ **Il ne peut se lancer chez Grégoire qu'une fois le lot en ligne** sur son adresse habituelle : l'aperçu Netlify a une
autre origine, donc une autre base (vide). Et dans le navigateur qui porte ses données (Safari et Chrome, sur l'iPad,
ont chacun la leur).

**Ce qu'il fait** (`js/diagnostic-copies-liees.js`) : une transaction `readonly` sur IndexedDB, après `db.flush()` (qui
attend les écritures en cours sans en lancer). Il liste les paires liées des grilles, échelles, cartouches, productions,
pratiques et de leurs bibliothèques, avec leurs noms et le chemin partagé. Ailleurs, il ne donne qu'un nombre et le nom
de la clé, chiffres masqués : aucun nom d'étudiant·e ne peut y paraître. Les trimestres fermés (a2025, h2026) ne sont
pas lus. **Lecture seule prouvée au banc** : aucune écriture IndexedDB (`put`, `add`, `delete`, `clear`) ni localStorage
pendant la vérification, base identique avant et après, lien toujours là. C'est un outil d'un stock : à retirer après
la réparation.

**Ce que ferait la réparation** (non faite) : pour chaque collection qui porte une paire, la réécrire une fois, chaque
élément lié copié en profondeur, contenu conservé tel qu'il est aujourd'hui ; avec un codex à jour exigé avant, comme
le fait `CartouchesDecalees`.

**Ce qu'elle ne peut pas savoir.** Source et copie partagent un seul objet : il n'existe qu'un texte. Rien ne dit si une
modification visait la source ou la copie, ni ce que la source disait avant que la copie l'écrase. Ce texte n'est plus
dans la base ; seul un codex ou une archive d'avant le porte encore, et la comparaison se ferait à la main. Pour les
liens par le cache mémoire (point 3), rien n'est persisté comme lien : si la bibliothèque a été réécrite entre-temps,
le texte de la copie y est entré comme une modification ordinaire, que rien ne distingue.

**Une observation, pas une proposition** : enregistrer le codex puis le rouvrir défait aussi les liens sans changer le
contenu (mesuré). Mais c'est une ouverture de toute la base ; la décision revient à Grégoire.

## 6. Les cartouches ne suivent pas la copie d'une grille (rien changé)

Mesuré au navigateur : une grille portant une cartouche, dupliquée par l'éditeur ; la copie n'a aucune cartouche. Dans
Conception › Productions, une production attachée à la source et à sa cartouche, passée à la copie de la grille :
- le menu « Cartouche de rétroaction » n'offre plus que « Aucune », et la cartouche choisie n'y est plus ;
- sous le menu : « Aucune cartouche n'est rangée sous la grille « Grille fictive (copie) » : écris-en une dans
  Conception › Cartouches, avec cette grille, pour la choisir ici. »

Inférence, non mesurée : enregistrée ainsi, la production perd sa cartouche. Le chemin existant, que la phrase ne
nomme pas : ouvrir la cartouche et changer sa grille (« Changer de grille crée une copie de cette cartouche pour la
grille choisie… ») ; comme la copie de grille garde les identifiants de critères, tous les commentaires passent
(inférence : `rattacher` relie d'abord par identifiant). Avec « une grille par production », ce geste se répétera.

## Vérifications

- Vitest complet : 933 fichiers, 11 926 tests verts (après le renommage de quatre variables `cle` qui masquaient
  `cle()`, cliquet #642, dans mon module).
- Chromium, portrait (820 × 1180) et paysage (1180 × 820) : les trois bancs du lot et le banc de caractérisation des
  duplications (#476), relancés sur l'état final (résultat au relais de la PR).
- Pas fait : Safari ni l'iPad. La copie profonde est du JSON, indépendante du moteur ; le diagnostic, lui, sera éprouvé
  par son premier passage chez Grégoire. Je ne pose donc pas de porte terrain à part.

## Ce que j'ai supposé

1. « Lien confirmé » veut dire : un objet partagé, relu par `db.get`. Pour les copies entre clés, il n'existe qu'en
   grande collection ; je n'ai pas mesuré la taille des collections de Grégoire et j'ai corrigé quand même (le prix :
   une copie JSON).
2. J'ai lu « arrête-toi et décris-le » (point 2) comme : ne pas trancher la question des identifiants. Le reste du lot
   ne dépend pas d'elle, je l'ai mené.
3. La copie profonde passe par JSON, comme `forkerItem` : elle perd ce que JSON ne sait pas porter, comme le stockage
   local et le codex déjà.
4. L'endroit du diagnostic, ses mots (lus par Grégoire, pas par les élèves) et l'exclusion des trimestres fermés.
5. Le retrait de `cloneProfond` : un paramètre devenu toujours vrai.

## Proposé pour les Nouvelles

« Dans Conception, « Dupliquer » donne maintenant à la copie ses propres critères, niveaux et commentaires : modifier la
copie ne modifie plus l'original. »

À décider : annoncer aussi « Copies liées à leur source » aux testeurs. Ils pourraient y trouver des paires sans
qu'aucune réparation leur soit offerte.

## Trouvailles (trois issues)

- `CartouchesDecalees` et les copies (point 2) : à trancher par Cowork, avec la question des identifiants.
- La phrase « écris-en une » ne nomme pas le changement de grille d'une cartouche (point 6) : signalé, rien changé.
- `js/cartouches.js:4186` affirme qu'une grille dupliquée reçoit des identifiants neufs ; vrai pour `dupliquerGrille`
  seulement. Sans conséquence (le code traite les deux cas) : laissé tel quel.
