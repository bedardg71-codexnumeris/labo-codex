# Carte — le texte troué, étape 2 : les paliers de projection se composent avec des badges

> **Écrite le 4 septembre 2026, 17 h, par Claude Code, en lecture seule** — réponse au §2 de
> `CONSIGNE-DU-JOUR.md` (Cowork, fin d'après-midi). **Aucune ligne de code n'a été écrite.**
> ▣ **État mesuré à l'écriture** : `git rev-parse --short HEAD origin/main` = `fd2b4ce6` / `fd2b4ce6`
> après `git fetch` ; `version.json` = 1.117.1, build `0904-1507` ; arbre propre hors les fichiers de
> Cowork (`OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-COWORK.md`, la consigne du jour, l'archive de
> l'ancienne, `00-CADRAGES-OUVERTS.md`, le cadrage « codes par grille »). ⚠ Ils ont bougé sur le
> disque PENDANT cette lecture (16 h 30, Cowork) — ils partent avec le premier commit de code, pas avec
> cette carte.
> ▣ Vitest au rituel d'ouverture : voir le bloc 25 de `SESSION.md` (le rituel isolé rend son compte à
> part ; cette carte ne le recopie pas).
>
> **Ce que Cowork attend** : a-e mesurés, puis les deux questions à Grégoire (les noms des jetons ;
> le préfixe engendré). **Puis j'attends.**

---

## 0 · La vue d'ensemble, avant le détail

**Ce qui se réemploie tel quel** : la palette (boutons, deux couleurs, CSS), la pose au curseur
(`insererRepere`, pure, break-testée en neuf cas), le geste sans re-rendu (`insererRepereEnonce`),
les gardes iPad (frontière de mot, espaces, focus). **Ce qui est neuf** : les jetons que la projection
sait remplir (le registre n'en connaît qu'un, `{service}`, et seulement dans un des deux champs), le
remplissage du texte d'un palier, la prévisualisation. **Le risque du lot** : un jeton dans « Ce que
l'élève lit » est rendu **tel quel** par toute version antérieure à ce lot — l'élève lirait
`{erreurs}` — et le stock déjà écrit n'est pas touché (tarir n'est pas réparer).

| volet | verdict court |
|---|---|
| a) le composeur | **le même** : trois fonctions se réemploient sans modification, deux s'ouvrent d'un paramètre |
| b) les jetons | **8 remplissables aujourd'hui** sur les 7 de la maquette + 1 ; `{niveau}` et `{note}` ne le sont PAS sans changer le site d'appel |
| c) le préfixe | recommandation : **devient un jeton**, engendré seulement pour un texte sans jeton — les grilles existantes ne perdent rien (mesuré) |
| d) le format | les accolades voyagent intactes (import, partage) ; **le rendu littéral dans une version antérieure est le risque**, borné par la politique de cache |
| e) l'aperçu | **copies fictives dérivées des paliers**, pas le pack démo (0 copie corrigée sur 106) |

---

## a) Ce que l'étape 1 a livré, et ce qui se réemploie tel quel

**Commande** : `grep -n "rendreBlocEnoncesAlgo\|insererRepereEnonce\|reperesDeCle\|insererRepere\|data-jeton" js/grilles.js js/evaluation-enonces.js`
**Témoin** : le même motif sur `js/evaluation-projection.js` rend **0** — la projection ne connaît rien
du composeur.

Ce que l'étape 1 est, mesuré (confirme la lecture de Cowork) : **un bouton par repère, qui insère le
jeton au curseur d'une zone de texte**. Pas un badge glissé dans une phrase. Le format enregistré est
du texte libre avec accolades ; `rendre` ne sait rien des repères (sentinelle étape 1, cas D.c).

| pièce | où | réemploi à l'étape 2 |
|---|---|---|
| la palette rendue (`reperesDe`) | `grilles.js:3602-3605` — `<button class="repere-enonce repere-enonce--<famille>" data-action="insererRepereEnonce" data-jeton="{…}">` | **tel quel** : même classes, même `data-action`, même attribut |
| les deux couleurs | `styles.css:3223` (`--posee`, bleu) et `:3228` (`--remplie`, vert) ; cible 44 px iPad à `:18100` | **tel quel** |
| la pose au curseur | `evaluation-enonces.js:393` `insererRepere(texte, debut, fin, jeton)` — pure, espaces, frontière de mot, curseur | ⚠ **refuse tout jeton hors de SA palette** (`_repere(jeton)` → `null`, cas C.g). S'ouvre par un 5e paramètre facultatif `palette` (défaut : `REPERES`) : l'étape 1 et ses neuf cas ne bougent pas |
| le geste sans re-rendu | `grilles.js:5449` `insererRepereEnonce(el)` — cherche `textarea[data-enonce-cle]` dans le `.groupe-form`, écrit par `_ecrireTexteEnonce*` | ⚠ **lié aux énoncés** par le sélecteur et par le chemin d'écriture. S'ouvre : la zone devient `textarea` du `.groupe-form` ; l'écriture se choisit sur le `dataset` (`enonceCle` → énoncés ; `palierIndex` + `champ` → `_muterPalier`, `grilles.js:5282`, qui existe déjà et écrit `texte`/`texteAide` par `String(valeur)`) |
| le drapeau « zone visitée » | `grilles.js:5486` `focusin` sur `dataset.enonceCle !== undefined` | s'ouvre d'une condition (`palierIndex`) |
| le clic qui ne prend pas le focus | `grilles.js:5500` `pointerdown`/`mousedown` sur `[data-action="insererRepereEnonce"]` | **tel quel** si le même `data-action` est gardé — recommandé |
| le contrat zone → repères | `evaluation-enonces.js:326` `reperesDeCle(cle)` lit la table `CLES` des énoncés | **ne se réemploie pas** : la projection déclare SON contrat (`texte` / `texteAide`) dans SON registre, comme `CLES` le fait pour les énoncés |
| le remplissage | `evaluation-enonces.js:470` `rendre(texte, valeurs)` itère sur la constante `JETONS` (5) | **ne se réemploie pas tel quel** : un jeton hors des cinq y reste littéral. La projection remplit ses propres jetons dans `_texteDuPalier` (`evaluation-projection.js:362`), avec la même règle « vide → le jeton part avec son espace de tête » |

⮕ **Recommandation : oui, le même composeur, un seul pour tout le gabarit** (celle de Cowork). Ce
qui est mesuré ci-dessus dit que c'est un composeur à **deux registres** : la pose est commune, chaque
registre déclare ses jetons et les remplit. La maquette « badges dans la phrase » est l'étape 3.

▣ **Ce qui change à l'écran** : `rendreBlocProjectionAlgo` (`grilles.js:3732`) rend `2 × N` zones ; avec
les six paliers de migration ça fait **12 palettes** dans la carte « Projection », plus les 4 de la carte
« Observation » = **16 sur un même gabarit** (question 4 du cadrage, restée ouverte). La note « Écris
{service}… » (`grilles.js:3864`) tombe : elle enseigne une syntaxe que le bouton rend inutile (même
geste que le cas E.b de l'étape 1).

---

## b) Ce que la projection SAIT par élève, donc ce qu'un jeton peut remplir

**Commande** (le module réel, en Node) :
```
node -e 'const P=require("./js/evaluation-projection.js");const c=P.appliquerAuCritere({},"norme_externe",{nomServiceAide:"Passerelle +"});for(const [e,m] of [[0,460],[4,460],[15,584],[59,460]]){const r=P.calculer(c,{erreurs:e,mots:m});console.log(e,m,r.palier.libelle,Math.round(r.motsParErreur),Math.round(r.params.motsReference*e/m),r.seuilMotsParErreur)}'
```
**Rend** : `0 460 Sans erreur NaN 0 null` · `4 460 Excellent 115 8 30` · `15 584 Risqué 39 23 30` ·
`59 460 Échec 8 115 30`. **Témoin** : `{erreurs: null, mots: null}` rend `applicable: false`,
`raison: "mots-absents"`, `texte: ""` — une copie non corrigée n'a AUCUN texte de projection.

Ce que `_resultat` (`evaluation-projection.js:505`) porte : `ratio`, `motsParErreur`,
`seuilMotsParErreur`, `palier` (avec `libelle`), `params` (`motsReference`, `erreursTolerees`,
`nomServiceAide`, `lienServiceAide`), `prefixe`. Le nombre d'erreurs et de mots sont en amont
(`calculer(critere, {erreurs, mots})`, `:415`) et se portent au résultat d'une ligne.

### Les jetons que le moteur peut remplir SANS toucher au site d'appel

| jeton (nom proposé) | famille | valeur exacte | exemple 15 err / 584 mots | vaut quoi sur le palier « Sans erreur » |
|---|---|---|---|---|
| `{service}` | posé | `params.nomServiceAide` | « Passerelle + » | pareil |
| `{seuil}` | posé | `params.erreursTolerees`, entier | « 30 » | pareil |
| `{longueur}` | posé | `params.motsReference`, entier | « 900 » | pareil |
| `{erreurs}` | rempli | `donnees.erreurs`, le compte BRUT (mode catégories : `totalErreurs`, pas la somme pondérée, `evaluation-calcul.js:525`) | « 15 » | « 0 » |
| `{mots}` | rempli | `donnees.mots` | « 584 » | « 460 » |
| `{moyenne}` | rempli | `Math.round(motsParErreur)` — le nombre du préfixe engendré d'aujourd'hui | « 39 » | **vide** (`motsParErreur` = null) |
| `{projection}` | rempli | `Math.round(motsReference × erreurs ÷ mots)` = les erreurs projetées sur la longueur de référence (identique à `Math.round(ratio × erreursTolerees)`, vérifié sur les 6 couples) | « 23 » | « 0 » |
| `{palier}` | rempli | `palier.libelle` — le nom du palier atteint, celui que l'enseignant tape dans la colonne « Palier » | « Risqué » | « Sans erreur » |

⮕ **Réponse à la question de Cowork** : `{projection}` = **« 23 », le nombre seul**, pas « 23 erreurs
pour 900 mots ». Motif : `{longueur}` existe à côté, et l'arrêté 3 dit que l'enseignant écrit la
phrase entière — « soit {projection} erreurs pour {longueur} mots » est sa phrase, pas la nôtre. Un
jeton composite figerait « erreurs pour » dans le code, ce que ce chantier défait.

### Ce que la maquette montre et que le moteur NE remplit PAS aujourd'hui

- **`{niveau}`** — deux lectures possibles, et la maquette prend la première sans le dire : (1) **le
  palier** (« Bien » / « Risqué » dans sa fonction `valeurs`) — c'est `{palier}` ci-dessus,
  remplissable ; (2) **le niveau IDME** (« D », « M ») — calculé au site d'appel depuis l'échelle
  (`niveauIDME`, `evaluation-calcul.js:683-690`), **jamais passé** à `calculer`. Le remplir exige
  d'élargir `donnees` au site d'appel : `grep -c "projectionAlgo.calculer" js/evaluation-calcul.js`
  rend **1** (`_projectionEUF`, `:201`), lui-même appelé deux fois (`:525`, `:702`). ⛔ Pas dans ce
  lot : « aucune sentinelle du calcul ne change », et #668 H.582 compte exactement ces deux appelants.
- **`{note}`** — même situation (`noteCalculee`, `pctFinal` au site d'appel). Pas dans ce lot.
- **`{lien}`** — `params.lienServiceAide` est là, MAIS la sentinelle #668 F.497 verrouille « le lien
  voyage À PART, il n'entre jamais dans le texte ». L'offrir contredit une décision inscrite. ⛔ Pas
  offert ; à rouvrir seulement si Grégoire le demande.
- **`{facteur}`** (cadrage) — appartient au modèle de FORMULE (`facteurNormalisation`) ; l'en-tête de
  `evaluation-projection.js` dit : « Si un jour une ligne d'ici le lit, c'est un bug ». ⛔ Pas offert.
- **`{s}`** — l'accord du pluriel qui suit `{erreurs}` dans les énoncés (`rendre`, pas un repère). À
  reproduire dans le remplissage des paliers dès que `{erreurs}` y est offert, sinon « 1 erreurs ».

⮕ **Les NOMS remontent à Grégoire** (question 1, plus bas). Ceux proposés ici sont ceux de la maquette
sauf deux : `{moyenne}` (n'existe pas dans la maquette, c'est le préfixe) et `{palier}` au lieu de
`{niveau}` (le mot « niveau » désigne déjà l'IDME partout dans l'application — un badge « niveau » qui
rend « Risqué » serait lu comme un niveau d'échelle).

---

## c) Le préfixe ENGENDRÉ

**Commande** : `grep -n "prefixe" js/evaluation-projection.js` rend **4 lignes** (`:499`, `:508`,
`:512`, `:521`), toutes dans `_nonApplicable` et `_resultat` : `'Tu fais en moyenne 1 erreur à chaque '
+ Math.round(x.motsParErreur) + ' mots.'`, absent du palier zéro erreur, collé DEVANT le verdict.
**Témoin** : `grep -n "prefixe" js/grilles.js` rend **2 lignes**, toutes deux `prefixeId: 'GRILLE_'`
(`:3130`, `:4354`) — un préfixe d'identifiant, rien du préfixe engendré : le gabarit ne le montre
nulle part ; l'enseignant ne peut ni le lire ni le retirer.

### Ce que chaque voie fait perdre aux grilles existantes — mesuré

| voie | grilles existantes (texte sans accolade) | texte composé avec des jetons | ce qui casse |
|---|---|---|---|
| **1 · le préfixe devient `{moyenne}` ; un texte SANS AUCUN jeton garde le préfixe engendré** | **rien** : `PALIERS_MIGRATION` et `PALIERS_GABARIT_NEUF` n'ont aucune accolade dans `texte` (mesuré : `grep -c "texte: '[^']*{" js/evaluation-projection.js` rend **0** ; témoin : le jeton concaténé dans `texteAide`, `grep -c "+ JETON_SERVICE + '\.'"` rend **4**, lignes 129, 136, 162, 163) ; le golden #668 (20 cas, empreinte sur 481 401 couples) passe sans modification | l'enseignant place `{moyenne}` où il veut, ou pas | rien de mesurable dans le dépôt. ⚠ Le stock chez les gens : un `texte` qui porterait déjà une accolade (un `{service}` tapé à la main dans le mauvais champ) perdrait son préfixe — mais ce texte rend DÉJÀ `{service}` littéral à l'élève aujourd'hui (mesuré, §d) : il est déjà faux |
| **2 · le préfixe reste toujours** | rien | ⛔ l'enseignant ne peut pas le retirer, et `{moyenne}` le doublerait : « Tu fais en moyenne 1 erreur à chaque 39 mots. Tu fais 1 erreur par 39 mots… ». Contredit l'arrêté 3 | l'arrêté 3 |
| **3 · un réglage « préfixe : oui / non » sur le critère** | rien | libre | ⚠ un champ de plus qui voyage (import, partage, deux schémas) pour une chose que la voie 1 obtient sans champ |

⮕ **Recommandation : la voie 1**, avec ce discriminant précis : *le préfixe est engendré si et
seulement si le champ `texte` du palier ne contient aucun jeton connu du registre*. Pas « aucune
accolade » — un texte qui porte `{service}` tapé au mauvais endroit reste ce qu'il est. Et le
gabarit dit, sous les paliers, en une ligne : « Une phrase sans badge est précédée de “Tu fais en
moyenne 1 erreur à chaque N mots.” ; dès qu'elle porte un badge, elle est entière. »
⚠ **La décision est à Grégoire** (question 2) : c'est ce que l'élève lit.

---

## d) Où les deux textes s'enregistrent, se lisent, et ce qu'une version antérieure en rend

### Écriture et lecture, mesurées

| geste | où | ce qu'il fait des accolades |
|---|---|---|
| frappe dans une zone de palier | `modifierPalierProjection*Handler` → `_muterPalier` (`grilles.js:5282`) → `paliers[i][champ] = String(valeur)` → `appliquerAuCritere` → `_paliersRetenus` (`evaluation-projection.js:288`) | **conservées** : `texte`/`texteAide` gardés si `typeof === 'string'`, rien d'autre |
| lecture | `normaliser` → `_paliersRetenus` | idem |
| rendu à l'élève | `_texteDuPalier` (`:362`) | `texte` **rendu tel quel** ; dans `texteAide`, seul `{service}` est remplacé (ou fait tomber la phrase), tout autre jeton reste littéral |
| import | `import-export.js:673-674` `texte`/`texteAide` `{ type: 'string', maxLen: 5000 }` → `assainirChaine` (`:383`) | **conservées** : ne retire que `<…>` |
| partage | `partage-schemas.js:264-265` `{ type: 'chaine', max: 5000 }` → `partage-validation.js:103` | **conservées** : type et longueur seulement |

**Commande** (le module réel) :
```
node -e 'const P=require("./js/evaluation-projection.js");const c=P.appliquerAuCritere({},"norme_externe",{nomServiceAide:"Passerelle +"},[{cle:"x",ratioMax:null,texte:"Va voir {service}. Tu as {erreurs} erreurs.",texteAide:"Inscris-toi : {service}. {erreurs} erreurs."}]);console.log(P.calculer(c,{erreurs:15,mots:584}).texte)'
```
**Rend** : `Tu fais en moyenne 1 erreur à chaque 39 mots. Va voir {service}. Tu as {erreurs} erreurs. Inscris-toi : Passerelle +. {erreurs} erreurs.`
▣ **C'est la réponse à la question de Cowork : une version antérieure lit `{erreurs}` tel quel, et
l'élève le lit sur son PDF.** Y compris `{service}` dans « Ce que l'élève lit », déjà aujourd'hui.
**Témoin** : les énoncés (`rendre`, `evaluation-enonces.js:470`) retirent tout jeton connu non fourni
— mais un jeton INCONNU y reste littéral aussi. Les deux registres partagent ce trou pour les jetons
qu'ils ne connaissent pas.

### Ce qui borne le risque, mesuré

- **Une seule version en ligne.** L'application est servie à une adresse ; `netlify.toml:61-93`
  impose `max-age=0, must-revalidate` sur le HTML, `js/*` et `styles.css`, et `no-store` sur
  `version.json` ; `release.mjs` bumpe les jetons `?v=`. **Aucun service worker**
  (`grep -rln serviceWorker js/ index.html` rend 0). Une « version antérieure chez un collègue » est
  donc : un onglet ouvert depuis avant le déploiement, ou une copie locale du dépôt.
- **Le texte rendu est PERSISTÉ à la correction** (`donneesAlgorithmiques[critereId].retroaction`,
  `evaluation-calcul.js:729` ; `criteres[].retroaction` par les collecteurs) — c'est la version qui
  CORRIGE qui fixe ce que l'élève lit, pas celle qui affiche. Une grille 1.118 corrigée dans un onglet
  1.117 écrit `{erreurs}` dans l'évaluation, et ce stock ne se répare pas tout seul (tarir n'est pas
  réparer). ⮕ Le lot doit le DIRE dans le changelog, pas le découvrir.
- **Le sens inverse est sûr** : une grille d'avant (sans jeton) lue par 1.118 rend exactement ce
  qu'elle rend aujourd'hui — témoins : le golden #668 A (20 cas + empreinte) et le témoin négatif du
  spec des énoncés (`texte-troue-reperes-enonces.spec.js:164`) passent sans modification.
- **Une grille 1.118 importée dans une version FUTURE** : les jetons y sont connus. Une grille avec
  un jeton d'une version future importée en 1.118 : rendu littéral — même classe que « modèle
  inconnu » (`herite`, #668 C.284), qui se DIT dans le gabarit ; **un jeton inconnu devrait se dire
  de même** (une ligne orange sous le palier, pas un rendu muet).

⮕ **Ce que je propose d'inscrire au lot** : (1) le remplissage retire tout jeton connu non fourni
(règle de `rendre`) et **laisse un jeton inconnu en place** en le signalant dans le gabarit ; (2)
l'entrée de changelog nomme la contrainte « corrige avec l'application à jour » ; (3) rien dans le
stock de personne.

---

## e) La prévisualisation (arrêtés 4 et 5)

### D'où les copies d'exemple peuvent venir — mesuré

| source | mesure | verdict |
|---|---|---|
| le pack de démonstration | `grep -o 'donneesAlgorithmiques": {[^}]*}' js/pack-demo-20.js \| grep -vc '{}'` rend **0** copies corrigées sur **106** (témoin : `grep -c 'donneesAlgorithmiques": {'` rend 106) ; 1 critère algorithmique, **0** `paliersProjection`/`modeleProjection` | ⛔ rien à montrer, et il faut l'activer (namespace `demo_`) |
| les copies réelles du trimestre | les données de quelqu'un | ⛔ exclu par la consigne |
| des copies fictives codées | aucune donnée touchée ; fonction pure, testable en Node | ✅ |

### Ce que je propose

**Des copies fictives DÉRIVÉES DES PALIERS DU GABARIT, une par palier, plus une non corrigée** —
plutôt que les trois copies fixes de la maquette (7/460, 24/380, ∅). Motif mesuré : avec les paliers
de migration, 7/460 tombe sur « Bien » et 24/380 sur « Échec » ; si l'enseignant règle 5 erreurs
tolérées ou déplace ses seuils, les deux copies fixes peuvent tomber sur le même palier et
**un palier ne serait jamais prévisualisé**. Dérivées des paliers (mots = `motsReference`, erreurs =
`round(ratio médian du palier × erreursTolerees)` ; 0 pour « Sans erreur » ; au-delà du dernier seuil
pour le terminal), chaque phrase de chaque palier est vue, quelle que soit la grille.

**Au niveau du gabarit** (arrêté 4) : une carte « Ce que l'élève lira » sous la carte « Projection »
(ou en bas de « Observation »), qui rend pour chaque copie fictive : le décompte du bloc 3
(`enoncesAlgo.enonce(critere, 'decompte', {erreurs, mots})`, `{points}` vide → retiré) **puis** le
texte de projection (`projectionAlgo.calculer(critere, {erreurs, mots}).texte`), dans l'ordre exact de
`_construireRetroactionAlgoCategories` (`evaluation-calcul.js:514-526`) — les deux blocs, une phrase.
La **copie non corrigée** rend le décompte avec des jetons retirés et **aucune projection**
(`applicable: false`, mesuré) : c'est ce que l'arrêté 5 veut montrer.

⚠ **Ce que l'aperçu ne montre pas, et le dit** : la rétroaction du sous-critère dominant (`:527`), qui
dépend des codes posés sur une vraie copie. Une ligne sous l'aperçu le dit.

▣ Redessin : le gabarit se redessine à chaque frappe ; l'aperçu est un rendu pur du critère, il suit
sans état à conserver (les plis, eux, vivent dans `plisGabaritAlgo`).

---

## Les deux questions à Grégoire — Cowork les porte

**1 · Les noms des badges** (les mots que les collègues lisent, sur le bouton et dans la zone). Proposés :
`service` · `seuil` · `longueur` (posés, bleu) ; `erreurs` · `mots` · `moyenne` · `projection` ·
`palier` (remplis, vert). Deux écarts avec la maquette qu'il a remontrée : **`moyenne`** n'y est pas
(c'est le préfixe engendré, voir 2) ; **`palier`** remplace **`niveau`**, parce que « niveau » est déjà
l'IDME partout dans l'application et que ce badge rend « Risqué », pas « D ». Le niveau IDME et la
note ne sont pas offerts dans ce lot (ils exigent de toucher le calcul).

**2 · Le préfixe « Tu fais en moyenne 1 erreur à chaque N mots. »** Aujourd'hui, le code le colle devant
chaque verdict, sauf « Sans erreur », et personne ne peut le retirer. Recommandation : il devient le
badge `moyenne`, et **une phrase sans badge le garde tel quel** (les grilles existantes ne changent
pas : mesuré, aucun texte livré ne porte d'accolade) ; **dès qu'une phrase porte un badge, elle est
entière** — il place `moyenne` où il veut, ou pas. Réponse attendue : oui à ce mécanisme, ou « le
préfixe reste toujours » (il ne peut alors pas le retirer, et `moyenne` le doublerait).

---

## Ce que la carte ne décide pas, et qui reste à Cowork

- L'ordre des volets de code (§3 de la consigne). Ma lecture, pour info : (1) registre — les jetons
  de la projection, `_texteDuPalier` remplit, sentinelle avec break-test ; (2) gabarit — palette sur
  les deux zones, `insererRepere` ouvert d'un paramètre, `insererRepereEnonce` ouvert d'un chemin ;
  (3) aperçu ; (4) spec WebKit ; puis changelog dont les mots sont à lui.
- La place de l'aperçu à l'écran (carte à part, ou bas de « Projection »). Cadrage design.
- Les 16 palettes sur un gabarit (question 4 du cadrage). Cette carte le mesure, ne le tranche pas.
