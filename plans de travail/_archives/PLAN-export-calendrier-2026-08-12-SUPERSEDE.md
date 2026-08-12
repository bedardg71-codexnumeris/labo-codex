# PLAN — Export « Calendrier » : six colonnes, une ligne par séance

> **Chantier** : #416 (exports présentables), volet CSV — plus la levée du report
> « colonnes de séance » laissé ouvert par #410/#411.
> **Origine** : demande de Grégoire, 12 août 2026, session Cowork.
> **État de départ** : `main`, 1.75.0, build `0811-1319`, aucune dette de fusion.
> **Statut** : PLAN — rien n'est codé. À valider avant le lot 0.

---

## 1. Le besoin, dans ses mots

Grégoire veut que le produit final de l'export ressemble au CSV qu'il tient
déjà à la main, celui du déroulement H26. Six colonnes :

| # | Colonne | Contenu |
|---|---------|---------|
| 1 | Semaine | 1 à 15 |
| 2 | Séance | A / B |
| 3 | Date | la date réelle de cette séance |
| 4 | Contenu | activités d'enseignement et d'apprentissage |
| 5 | Évaluations | formatives et certificatives |
| 6 | Travail personnel | hors des heures de classe |

---

## 2. Pourquoi ce n'est pas un réglage de l'export existant

Les trois niveaux TSV actuels (`rendreTSV`) émettent **une ligne par nœud** :
une ligne Leçon, puis une ligne par activité, par connaissance, par évaluation.
La capture de l'export personnalisé le montre — « 1B Introduction à la
méthode » revient dix fois de suite.

Le CSV visé émet **une ligne par séance**, avec des cellules qui agrègent
plusieurs items. C'est une autre forme de document, pas une autre profondeur.

⚠ **Conséquence sur le modèle #416.** L'arbitrage D5 du 8 août posait deux axes
orthogonaux : la **profondeur** (Sommaire / En classe / Preuve) et le **format**
(Texte / TSV / Markdown). « Calendrier » n'entre proprement dans ni l'un ni
l'autre : ce n'est pas une profondeur (il montre tout), et ce n'est pas une mise
en forme finale (il change la granularité des lignes). **Décision D5 à trancher
ci-dessous** — je ne veux pas l'introduire en douce et laisser une session
ultérieure découvrir que le modèle à deux axes n'en a plus deux.

---

## 3. Ce qui manque dans le modèle

Deux des six colonnes n'ont aucun logement aujourd'hui, et ton propre backlog
le dit déjà :

> « Le repère de SÉANCE n'est jamais retiré : **la séance n'a pas de logement
> dans le modèle** (colonnes reportées). » — #411

> « le nettoyage des titres, à moitié bloqué tant que les colonnes de séance
> sont reportées » — #410

**Colonne 2 (séance).** « A » ou « B » n'existe que dans le *titre* du nœud
(`3A`, `3B`). C'est exactement la béquille que `analyserRepereTitre` sait
détecter et refuse de retirer, faute d'endroit où poser l'information.

**Colonne 6 (travail personnel).** Aucun type, aucune métadonnée ne dit « hors
classe ». Le patron le plus proche est `metadata.prealable` sur les nœuds
factuels : un drapeau booléen avec sa case dans l'Inspecteur.

**Colonne 3 (date).** Les dates existent déjà, et complètes : `horaire.js`
expose `obtenirSeancesCompletes(coursId)`, une table `date → [séances]` où
chaque séance porte son `numeroSemaine`. Il ne manque que le chaînon leçon →
séance datée, et ce chaînon a besoin de la colonne 2. **La colonne 3 dépend
donc de la colonne 2.**

---

## 4. Décisions à trancher

### D1 — Rang de séance : lettre ou nombre ?

- **Recommandé** : stocker un **rang entier** (`metadata.rangSeance` = 1, 2, 3…)
  et *afficher* A, B, C. Motif : `obtenirRangSeanceDansSemaine()` raisonne déjà
  en rang, et un cours à trois séances par semaine ne casse rien. Stocker « A »
  obligerait à traduire dans l'autre sens à chaque lecture de l'horaire.
- Alternative : stocker la lettre. Plus direct à lire dans un dump, mais adossé
  à l'hypothèse « deux séances par semaine », qui est vraie pour 601-101 et pour
  personne d'autre nécessairement.

### D2 — Où se pose le rang ?

- **Recommandé** : dans le **bloc du planificateur**, à côté du sélecteur de
  semaine livré par #410. Motif retenu ce jour-là, et vérifié trois fois :
  *un champ qui n'est pas là où le travail se fait se fait compenser dans le
  texte.* Même porte d'écriture unique, sur le patron de `definirSemaineLecon`.
- Alternative : dans l'Inspecteur seulement. Moins de travail, mais c'est
  précisément le placement qui a échoué pour la semaine.

### D3 — Le travail hors classe porte-t-il une durée ?

- **Recommandé** : **non**. Un nœud marqué hors classe n'accepte pas de durée,
  comme les types de connaissances. Motif : `dureeRollupNoeud` additionne tous
  les descendants d'une leçon, et ta règle dit qu'*une minute de classe
  appartient à exactement un nœud*. Une durée hors classe gonflerait le Σ d'une
  leçon avec du temps qui n'est pas du temps de classe — un total faux, sans
  rien pour le signaler.
- Alternative : la durée est permise mais exclue du Σ. Plus riche, mais elle
  crée deux sortes de durées dans le même champ, et `TYPES_AVEC_DUREE` ne suffit
  plus à répondre à la question « ce nœud a-t-il une durée ? ».

### D4 — Quels nœuds peuvent être « hors classe » ?

- **Recommandé** : les évaluations **et** les frères d'Activité. Ton CSV met
  dans cette colonne des remises d'artefacts (évaluations) et du travail de
  lecture ou de rédaction (activités).
- Alternative : les évaluations seulement. Plus étroit que ton usage réel.

### D5 — « Calendrier » est-il un niveau, ou autre chose ?

- **Recommandé** : un **quatrième niveau**, à côté de Sommaire / En classe /
  Preuve d'alignement, avec un commentaire explicite dans `NIVEAUX` disant que
  « niveau » signifie désormais *profondeur ou forme*. L'interface « Partir de »
  se lit déjà comme une liste de préréglages ; c'est la lecture la plus proche
  de ce que tu vois à l'écran.
- Alternative : un **format** de plus (« Calendrier (TSV) »), orthogonal à la
  profondeur. Mais la profondeur ne voudrait alors rien dire pour lui — trois
  combinaisons sur douze seraient sans effet, et ça se verrait.

### D6 — Quels formats de sortie pour ce niveau ?

- **Recommandé** : **TSV** (le tableur, ton besoin premier) et **Markdown**
  (le tableau collable dans Pages ou Word, deuxième format demandé par #416).
  **Pas de Texte** : un calendrier en texte suivi n'est que le TSV en moins
  lisible.
- Alternative : les trois, pour la symétrie. Symétrie payée par un rendeur qui
  ne servira pas.

---

## 5. Les lots

Chaque lot est livrable et vérifiable seul. Rien n'est fusionné sans ton
accord ; rien n'est poussé sans que le harnais soit vert.

### Lot 0 — Vérification (lecture seule, aucune modification)

- Harnais Vitest au vert **avant** de commencer, pour disposer d'un point de
  comparaison honnête.
- Vérifier sur tes données A26 réelles que `obtenirSeancesCompletes()` rend bien
  les dates attendues, avec leur `numeroSemaine`, pour le cours 601-101.
- Vérifier si la carte v3 que tu viens d'importer porte un `coursId`. ⚠ Elle
  n'en porte probablement **pas** : l'export JSON ne transporte que le contenu
  de la carte, pas son entrée d'index. Sans cours rattaché, la colonne Date
  sortira vide — à réparer par Actions ▸ « Cours rattaché… », pas par du code.

### Lot A — Le rang de séance entre dans le modèle

- `metadata.rangSeance` sur le nœud leçon, porte d'écriture unique
  `definirRangSeance()` sur le patron de `definirSemaineLecon()`.
- Sélecteur dans le bloc du planificateur, à côté de celui de la semaine,
  rendu paresseux (mêmes contraintes que #410 : `reconstruireDOM` passe souvent).
- Sentinelle dédiée + break-tests.

### Lot B — Le travail hors classe entre dans le modèle

- `metadata.horsClasse` (booléen), case à cocher dans l'Inspecteur, sur le
  patron de `metadata.prealable`.
- Selon D3 : le champ Durée disparaît quand la case est cochée, et le nœud sort
  de `dureeRollupNoeud`.
- Sentinelle + break-tests, dont le cas qui compte : **le Σ d'une leçon ne
  bouge pas** quand on marque un de ses nœuds hors classe.

### Lot C — La date, dérivée et jamais stockée

- Fonction pure `dateDeLecon(lecon)` : `coursId` de la carte + `semaine` +
  `rangSeance` → date, par lecture seule de `obtenirSeancesCompletes()`.
- Trois états dégradés, tous silencieux et non bloquants : pas de cours
  rattaché, pas de rang posé, semaine sans séance à ce rang. La colonne sort
  vide — une carte reste utilisable sans horaire.
- Sentinelle + break-tests.

### Lot D — Le niveau « Calendrier »

- Six colonnes, une ligne par leçon, dans l'ordre semaine puis rang.
- Colonne 4 : les frères d'Activité non marqués hors classe, un par ligne dans
  la cellule. Colonne 5 : les évaluations non marquées hors classe. Colonne 6 :
  tout ce qui est marqué hors classe, activités et évaluations confondues.
- Rendeurs TSV et Markdown (selon D6), branchés dans `genererExport`.
- Sentinelle de forme (le nombre de colonnes, l'ordre des lignes) + une
  sentinelle de contenu montée sur une carte d'essai.

### Lot E — Zéro-dette : les repères de séance quittent les titres

- Maintenant que la séance a un logement, `analyserRepereTitre` peut proposer
  le retrait de « séance 2 » comme il propose déjà celui de « Sem. 11 ».
- La catégorie `vide` se vide de la moitié qu'elle ne contenait que par défaut
  de modèle. Le report de #410/#411 est levé, pas contourné.
- ⚠ **Réciproque de la règle du 6 août** : on ne LIT jamais le rang depuis le
  titre pour le poser d'office. Le retrait reste proposé et confirmé, jamais
  appliqué tout seul.

### Lot F — Clôture

- `release.mjs minor` (nouveauté sans rupture), changelog utilisateur,
  BACKLOG (#416 avance, #410/#411 se ferment sur leur moitié restante),
  SESSION.md, `Retours des testeurs/USAGE-FORMATS.md`.
- **Porte terrain** selon `SKILL_portes_terrain.md` : ce chantier livre des
  changements que la session ne peut pas éprouver elle-même — le rendu du
  sélecteur sur iPad, la colle du tableau Markdown dans Pages, l'ouverture du
  TSV dans Numbers.

---

## 6. Risques

**Le plus sérieux — le Σ des leçons.** Le lot B touche `dureeRollupNoeud`, qui
alimente l'en-tête de chaque bloc et le compteur du planificateur. Une erreur
ici se voit partout et ne ressemble pas à un bug d'export. C'est le lot qui
mérite le plus de break-tests.

**Le sournois — le vert et inerte.** Trois occurrences en deux jours au début
d'août : des sentinelles qui vérifiaient le balisage ou la présence d'une chaîne
dans la source, pas le comportement. Le lot A pose un sélecteur, donc un glyphe,
donc exactement le terrain de 1.53.1. Les sentinelles de ce chantier seront
**comportementales**, et chacune sera break-testée avant qu'on lui fasse
confiance.

**L'ambigu — l'ancrage des cartes importées.** Ta v3 vient d'un fichier ; son
rattachement au cours est à refaire à la main. Si le lot C sort des dates vides
au premier essai, c'est probablement ça, et non le code.

**Le calendaire.** Tu es en retard sur ta préparation. Ce chantier fait six
lots avec sentinelles et break-tests — ce n'est pas une heure de travail. Si
l'échéance serre, les lots A + C + D suffisent aux colonnes 1 à 5, et la
colonne 6 se remplit à la main en attendant le lot B.

---

## 7. Ce que je ne ferai pas sans te le redemander

- Fusionner vers `main` ou pousser quoi que ce soit.
- Lancer `release.mjs`.
- Toucher aux zones protégées (`js/config.js`, `js/navigation.js`,
  `noms_stables.json`).
- Modifier tes données réelles A26.
