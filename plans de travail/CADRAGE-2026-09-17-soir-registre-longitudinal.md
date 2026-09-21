# Cadrage — Registre longitudinal : suivre un élève d'un trimestre à l'autre

> **#915** — 17 septembre 2026, soir. Cadré par Cowork avec Grégoire, en discussion,
> avant toute ligne de code. **Succède à #913**, livré le matin même.
> Destinataire : Claude Code.
>
> **VERSION 2** — révisée après la relecture croisée de Claude Code
> (`RELECTURE-2026-09-17-soir-registre-longitudinal.md`, mesurée fichier et ligne à
> l'appui). Les corrections de cette relecture sont **toutes** intégrées ci-dessous ;
> quand le texte d'un § a changé, la référence au point de la relecture est donnée
> entre crochets, ex. `[A1]`. Rien n'a été écarté.

---

## 0. Ce qui a changé depuis ce matin, et pourquoi

#913 a livré un bloc « Résultats ultérieurs » dans le **Cadre**, sous la liste des
étudiant·es : une ligne de champs par élève du trimestre actif. Grégoire l'a vu à
l'écran le soir même et a demandé deux choses, dans cet ordre :

1. **Économiser l'espace vertical** — au lieu de répéter tous les élèves et tous
   les champs, un sélecteur d'élève et **une seule** ligne de saisie.
2. **Sortir du Cadre** — « je ne suis pas certain que ces résultats devraient être
   dans l'onglet Cadre. Personnellement, je les mettrais dans un nouveau
   sous-onglet, dans le Labo », avec la possibilité de choisir un élève **parmi
   tous les trimestres répertoriés dans l'application**.

La seconde demande change la nature de l'objet. Un résultat ultérieur n'appartient
pas au trimestre actif : il appartient à l'élève, et l'élève traverse les
trimestres. Le Cadre configure le trimestre courant ; ce registre n'y a pas sa
place.

Puis, en poursuivant : **chaque élève inscrit au registre emporte une copie de son
dossier d'évaluation**, pour que les trimestres archivés puissent être retirés de
l'application ensuite sans perdre le suivi.

⚠ **Ce cadrage remplace la partie « où ça vit » de
`CADRAGE-2026-09-17-resultats-ulterieurs-101-102.md`.** Le reste de ce cadrage-là
(le besoin, la provenance des notes, l'absence de toute analyse) reste valable.

---

## 1. Ce que c'est, en une phrase

Un registre **global, hors trimestre**, où Grégoire inscrit les élèves qu'il veut
suivre dans la durée ; chaque inscription fige une copie datée du dossier
d'évaluation de l'élève, et accueille les notes qu'il obtient ensuite ailleurs.

C'est, à la granularité de l'élève, ce que `ECOSYSTEME-DONNEES.md` § 3 spécifie sous
le nom de **codex data** à la granularité du groupe-cours : données structurées
seules, sans blobs, destinées au Labo.

⚠ **Correction de la v1** `[A4]` : cette filiation vaut pour la SPEC, pas pour le
CODE. `js/codex-data.js` (#251, 6 mai 2026) produit déjà un format `codex-data` v1
— `groupes.<dossier>.{ uuid, trimestre, cours, groupe, <clés namespacées> }` plus
`bibliotheques`, avec hash SHA-256 — que `js/labo-codex-data.js` charge dans le
Labo. **Le registre sera donc un SECOND format**, par élève et lu depuis les
trimestres vivants, là où `codex-data` v1 est par groupe-cours archivé et lu depuis
la Réserve. Dit franchement pour que personne ne croie étendre l'existant. La
conversion de l'un vers l'autre est le lot d'export, hors périmètre (§ 8).

---

## 2. Décisions déjà prises, avec Grégoire, dans la discussion du 17 au soir

| Question | Décision | Qui |
|---|---|---|
| Où ça vit | Septième sous-onglet du **Labo**, pas le Cadre | Grégoire |
| Nom du sous-onglet | **« Suivi longitudinal »** | Grégoire |
| Portée du sélecteur | **Tous** les trimestres répertoriés, **sauf la démo** `[B6]` | Grégoire / mesure |
| Clé d'identité | Le **DA** (sept chiffres, format du collège) | Grégoire |
| Nom affiché | Les **noms** d'élèves, pas les DA — « je reconnais mes élèves à leur nom » | Grégoire |
| Indices capturés | **Assiduité et complétion** nommément demandées ; performance et paliers RàI suivent | Grégoire |
| Anonymisation | **Hors périmètre.** « Il est trop tôt pour penser à anonymiser » | Grégoire |
| Les copies numériques | **Exclues.** « Je ne crois pas qu'il soit nécessaire d'avoir une photo du travail de l'élève pour être en mesure d'évaluer son parcours » ; elles restent dans le trimestre archivé | Grégoire |
| Ce qu'on capture | Les **évaluations** (critères, niveaux, notes, rétroactions), **les interventions et les instantanés hebdomadaires** ; portfolios après mesure | Grégoire |
| Motif de la suppression d'un trimestre | **La place**, pas l'archivage : la copie vit dans les Archives sur disque ➔ le registre a un **budget de poids** (§ 4.1 bis) | Grégoire |
| Stabilité des grilles | Critères, échelles, productions et lectures **inchangés depuis H2024** — mais prévoir qu'un jour ce ne sera plus vrai | Grégoire |
| Stockage | **Vivant dans l'app** (clé globale), pas seulement un fichier exporté | Cowork, annoncé |
| Nature de la capture | **Instantané daté et figé**, pas un lien vivant | Cowork, annoncé |
| Source des mesures | **Pack démo** pour l'ordre de grandeur, **réel à la porte terrain** du lot 2 `[A3]` | Cowork, tranché |
| `navigation.js` | **Voie canonique**, entrée dans `INITIALISATEURS_SOUS_SECTION` `[A5]` | Cowork, tranché |
| Sélecteur d'élève | **Champ de recherche**, pas menu déroulant `[§ 5.2]` | Cowork, tranché |

### Les décisions annoncées, et leur motif

**Stockage vivant.** La spec du codex data en fait un fichier extrait des Archives.
L'usage de Grégoire — inscrire un élève, revenir la semaine suivante, ajouter une
note reçue de la Direction des études — exige un stockage que l'app relit. L'export
en `.codex-data.json` reste possible par-dessus, plus tard.

**Instantané figé.** Un lien vivant vers le trimestre viderait le registre le jour
où Grégoire supprime le trimestre archivé — ce qui ruine l'objectif. Conséquence
assumée et à écrire à l'écran : **si une évaluation change après la capture, la
copie ne bouge pas.** L'écran affiche la date de capture et offre de re-capturer.

---

## 3. Structure de données

### Clé

`registreLongitudinal` — **globale, NON namespacée par trimestre**.

⚠ `[B4]` **À inscrire à `CLES_GLOBALES`** (`js/trimestres.js`, l. 196) : `cle()`
(l. 412) avertit sur toute clé absente de cette liste. Sans cette inscription, la
console crie à chaque lecture.

⮕ À inscrire aussi au registre des propriétaires : `docs/DATA-OWNERSHIP.md`.
⮕ Module **seul écrivain** : `js/registre-longitudinal.js`.
⮕ `[C5]` **Écriture par `db.set` (asynchrone)**. Ne rien décider sur IndexedDB : le
   seuil est automatique (`SEUIL_IDB_FIRST` = 25 Ki, `db.js` l. 120). La v1 disait
   « passer par IndexedDB » — phrase retirée, elle n'avait pas d'objet.

### Pérennité `[C4]` — mesuré

- Le registre **est** dans l'export complet (`import-export.js` l. 1025 énumère
  `db.keys()`).
- Il **survit** à `supprimerTrimestre` (le filtre `includes(id)` ne l'atteint pas —
  c'est précisément ce qu'on veut).
- Il **n'est pas** dans la Réserve (`CLES_GLOBALES_INCLUSES`, `reserve.js` l. 53,
  qui travaille par trimestre).

⮕ À écrire à l'écran, en une ligne : **le registre est sauvegardé par l'export
complet seulement**, jusqu'à ce que l'export `.codex-data.json` existe.

### Forme

```js
{
  format: 'registre-longitudinal',   // [A4] — distinct de codex-data v1
  version: 1,
  eleves: {
    "1234567": {                       // le DA, clé primaire
      da: "1234567",
      nom: "B.", prenom: "Alya",
      inscritLe: "2026-09-17",

      dossiers: [                      // un par trimestre-cours où Grégoire l'a eu
        {
          capteLe: "2026-09-17T23:30:00.000Z",
          trimestre: "a2025",
          coursId, coursCode: "601-101-MQ", groupe: "00001",
          statut: "actif",             // [B2] copié TEL QUEL depuis groupeEtudiants
                                       //      (valeurs réelles : inactif, décrochage, abandon)

          empreinte: {                 // § 4.2 — pour détecter la dérive future
            grilles:  [{ id, nom, nbCriteres, empreinte }],
            echelles: [{ id, nom, niveaux: ["Incomplet","Développement","Maîtrise","Étendu"] }]
          },

          evaluations: [ /* copie intégrale, sans blobs — § 4.1 */ ],
          presences:   [ /* [B3] les entrées de CE DA, telles quelles : la clé
                            <trim>_presences est un TABLEAU (saisie-presences.js
                            l. 911), pas un objet par séance */ ],

          interventions: [ /* RàI et rencontres de ce DA — § 4.1 bis */ ],
          snapshots:     [ /* indices hebdomadaires de ce DA, la trajectoire */ ],
          portfolio:     null,         // après mesure de poids au lot 2

          indices: {                   // § 4.2 bis — LUS au stockage, jamais recalculés
            completion:  { C, detail },       // indice C — demandé nommément
            assiduite:   { taux, detail },    // assiduité — demandée nommément
            performance: { P, noteConstructible },
            patternsRaI: { /* palier, pattern */ }
          }
        }
      ],

      resultatsUlterieurs: [           // repris de #913, format inchangé
        { cours: "601-102-MQ", trimestre: "H2025", note: 91 }
      ]
    }
  }
}
```

**Pourquoi `dossiers` est une liste** : Grégoire peut avoir eu le même élève dans
deux trimestres (reprise de cours, cheminement). Un élève, N dossiers, N résultats
ultérieurs.

---

## 4. La capture

### 4.1 Ce qu'elle emporte, ce qu'elle laisse

**Emporte** — tout ce qui se lit sans ouvrir un fichier :

- les évaluations du trimestre pour ce DA (`<trim>_evaluationsSauvegardees`
  filtrées), avec critères, niveaux, notes, jetons, rétroactions rédigées ;
- **les grilles et les échelles utilisées, par COPIE et non par référence** — sans
  quoi, le trimestre supprimé, il reste « critère 3 : niveau 2 » sans savoir ce que
  mesurait le critère 3 ni ce que valait le niveau 2. `[C3]` La copie prend
  **celles que les évaluations de ce DA référencent par `grilleId`**, pas tout le
  catalogue (`<trim>_grillesTemplates` et `<trim>_echellesTemplates` sont déjà
  namespacées par trimestre, #358) ;
- les présences (`<trim>_presences`, entrées de ce DA) ;
- **les indices** — l'assiduité et la complétion, demandées nommément par Grégoire
  le 17 sept. au soir ; voir § 4.2 bis ;
- **les interventions et les instantanés hebdomadaires** (RàI, rencontres,
  trajectoire) — ajoutés par Grégoire le 17 au soir ; voir § 4.1 bis.

**Laisse** — décision de Grégoire :

- les blobs : photos, PDF des copies, annotations graphiques. Ils restent dans le
  trimestre archivé, où il ira les chercher s'il en a besoin.

⮕ `[B7]` **Poids : à MESURER, pas à estimer.** La v1 annonçait « quelques centaines
de kilooctets par élève » — ce chiffre n'était pas mesuré et il est retiré. Les
évaluations ne portent pas de blob (l'objet de `evaluation-sauvegarde.js` porte des
ids et du texte), mais l'ordre de grandeur reste à établir au lot 2. Si un dossier
dépasse le mégaoctet, mesurer ce qui pèse et le dire — ne pas tronquer en silence.

### 4.1 bis — Ce que la capture laisse derrière, et qui meurt avec le trimestre

⚠ **Point le plus important de la relecture** `[A2]`. Le but déclaré est de survivre
à la suppression du trimestre. `supprimerTrimestre` (`js/trimestres.js` l. 1509)
efface **toute** clé qui contient l'id du trimestre. Sont donc détruites, et
absentes de la liste « Emporte » de la v1 :

| Clé namespacée | Ce que c'est | Par DA ? |
|---|---|---|
| `interventions` | RàI, rencontres (chantier « Rencontres ») | oui |
| `snapshots` | indices hebdomadaires — la trajectoire DANS le trimestre | par semaine, puis par DA |
| `portfoliosEleves` | portfolio par élève | oui |
| `etudiantsSuivis` | liste de suivi | oui |
| `notesRapport` | notes du rapport | à vérifier |

⚠ **Pourquoi Grégoire supprime un trimestre — précisé par lui le 17 au soir, et
ça change l'arbitrage.** « Si je supprime un trimestre archivé dans l'application,
c'est parce que j'en ai une copie ailleurs dans mes Archives. La raison est purement
pratique : j'ai besoin d'avoir de la mémoire et mes codex ne peuvent pas grossir
indéfiniment. »

➔ Donc **rien n'est perdu pour de bon** : ce qui sort de l'application vit encore
dans ses Archives sur disque. Une re-capture reste possible, au prix d'un réimport
de l'archive. L'enjeu de la capture n'est pas la survie des données, c'est **de ne
pas avoir à réimporter une archive pour consulter le parcours d'un élève**.

➔ Et surtout : **le registre a un budget.** Il existe pour libérer de la place. Un
registre qui pèse autant que les trimestres qu'il permet de retirer ne sert à rien.
C'est la raison de fond de l'exclusion des blobs (§ 4.1).

✅ **MESURÉ AU LOT 2 (18 sept. 2026, pack démo) — ET LE CRITÈRE SE CORRIGE.** Un
dossier de dix évaluations pèse **43 Ko** ; un registre de dix élèves pèse **448 Ko**
face à un trimestre structuré de **438 Ko** — **rapport 1,02**.

⚠ Donc le critère « au moins un ordre de grandeur » que la v2 posait **ne vaut pas
en général** : il ne vaut que pour les trimestres qui portent des **copies
numériques**. La formulation juste, mesurée :

> **Le registre libère la place occupée par les blobs, pas celle des données
> structurées.** Un trimestre sans copies importées ne libère presque rien à la
> suppression, registre ou pas. Un trimestre avec ses copies (l'ordre du gigaoctet,
> `ECOSYSTEME-DONNEES.md` § 1) libère tout sauf quelques centaines de kilooctets.

Ce n'est pas un défaut du lot : c'est un fait sur la forme des données, à savoir
avant de décider quel trimestre retirer. La porte 1.3 mesure le cas réel de
Grégoire (son A2025 porte 303 évaluations et aucune copie).

⚠ **Erreur de la session, rattrapée avant livraison** : la première forme copiait
grilles et échelles **dans chaque dossier** (15,5 Ko sur 58 par élève, répétés). Les
modèles sont désormais rangés **une fois par trimestre** dans `modeles`.

✅ **TRANCHÉ PAR GRÉGOIRE, 17 sept. 2026 au soir** : « oui, ajoute ces informations ».

**La capture emporte donc aussi**, filtrés par DA :

- **`interventions`** — RàI et rencontres. Sans elles, il manque ce que Grégoire a
  FAIT pendant le trimestre, qui est souvent ce qui explique la suite.
- **`snapshots`** — les indices hebdomadaires, c'est-à-dire la trajectoire DANS le
  trimestre. Sans eux, le dossier est un bilan de fin de trimestre et non un
  parcours : un élève qui décroche en semaine 6 puis remonte ressemble, à l'arrivée,
  à un élève régulier.
- **`portfoliosEleves`** — **après mesure de poids au lot 2.** S'il pèse lourd au
  regard du budget ci-dessus, le dire et ne pas l'emporter ; c'est une décision de
  mesure, pas d'opinion.

**Restent hors capture**, et le motif est écrit : `etudiantsSuivis` et `notesRapport`
sont des outils de travail de Grégoire — sa liste de suivi, ses notes personnelles —
et non des données de l'élève. Si l'un des deux lui manque un jour, il le dira.

### 4.2 L'empreinte de grille — pour le jour où les grilles bougeront

Grégoire confirme que critères, échelles, productions et lectures sont inchangés
depuis l'hiver 2024. **On ne construit donc rien de compliqué pour un problème
qu'il n'a pas.** Une empreinte suffit : l'identifiant, le nom, le nombre de
critères et les libellés de niveaux de chaque grille et échelle utilisée.

Le jour où deux dossiers d'un même élève porteront des empreintes différentes,
l'écran le **signale** au lieu d'afficher une progression comme si c'était une
série continue. C'est un avertissement, pas un blocage.

### 4.2 bis — Les indices : d'où ils viennent, et ce qu'ils ne doivent pas déclencher

Grégoire a demandé nommément **l'assiduité et la complétion**. Motif dit dans la
discussion : un parcours d'apprentissage, c'est autant l'engagement que le
rendement, et c'est souvent l'écart entre les deux qui explique la suite.

Sources mesurées, à lire **au stockage** :

| Ce que Grégoire nomme | Dans le code | Clé |
|---|---|---|
| Complétion | indice **C** (`calculerTauxCompletion`, `etudiants.js` l. 285) | `<trim>_indicesCP` |
| Assiduité | taux d'assiduité | `<trim>_indicesAssiduite[da]` |
| (suivent) | performance (indice **P**) et paliers RàI | `<trim>_indicesCP`, `<trim>_indicesPatternsRaI` |

⚠ `[B1]` **Correction de la v1** : `<trim>_indicesAssiduiteDetailles` **n'est jamais
écrite** — aucune écriture dans `js/`, une seule mention (`js/modes.js` l. 723). La
v1 la citait comme source ; elle est retirée. L'assiduité se lit dans
`indicesAssiduite[da]`, point.

La performance et les paliers RàI ne sont pas demandés explicitement, mais ils
coûtent quelques octets, vivent dans les mêmes clés, et sans eux la complétion n'a
pas de contrepoint. **Supposition nommée** : on les capture aussi. Un mot de
Grégoire suffit à les retirer.

⚠ **Une valeur capturée est une valeur LUE, jamais RECALCULÉE.** Si un indice est
absent du stockage pour ce DA, le dossier porte `null` et l'écran dit « non calculé
à la capture ». On ne déclenche aucun calcul : `calculerEtStockerIndicesCP` ÉCRIT,
et écrire dans un trimestre archivé est exactement ce que le § 4.3 interdit.

⚠ Un `P = 0` accompagné de `noteConstructible: false` **n'est pas une performance
nulle** (#775, règle arrêtée par Grégoire le 7 sept. 2026). Le drapeau voyage avec
la valeur, et l'écran du dossier ne doit jamais afficher ce zéro comme un résultat.

### 4.3 Ce que la capture n'a pas le droit de faire

⚠ **La capture est en LECTURE SEULE sur les trimestres.** Elle n'écrit que dans
`registreLongitudinal`. À prouver par un banc : stock du trimestre source identique
**octet pour octet** après une capture, y compris sur un trimestre archivé — comme
l'a fait #913.

⚠ Rappel mesuré au lot #913 : **l'ouverture de la « Liste des étudiant·es »
(`etudiants.js`) réécrit `indicesCP`, `indicesPatternsRaI` et `indicesAssiduite`,
même sur un trimestre archivé.** Si la capture a besoin des indices, elle les lit
au stockage — elle ne passe pas par cet écran.

### 4.4 Les deux gestes, sans ambiguïté `[C1, C2]`

- **« Inscrire »** capture, **en un seul geste**, tous les trimestres où ce DA
  figure : un dossier par trimestre-cours.
- **« Re-capturer »** remplace le dossier du **même `trimestre` + `coursId`** et
  garde les autres. `inscritLe` ne bouge pas ; `capteLe` oui.

---

## 5. L'écran

### 5.1 Où `[A5]`

`js/config.js`, section `'labo'`, **septième entrée**, après `'bilan'`.
Identifiant de sous-section : `longitudinal` (conteneur `labo-longitudinal`).

**Trois fichiers sont touchés au lot 1, pas un :**

1. `js/config.js` — l'entrée du sous-onglet ;
2. `js/navigation.js` — une entrée dans `INITIALISATEURS_SOUS_SECTION` (l. 205 et
   suiv., consommée l. 629). `TOOLTIPS_SOUS_NAV` (l. 149) est facultative :
   `labo-comparateur` n'y est pas ;
3. `index.html` — un conteneur `<div id="labo-longitudinal" class="sous-section">`,
   auprès des six autres (l. 8645-9073).

⚠ **`config.js` ET `navigation.js` sont des zones protégées.** Grégoire a autorisé
le sous-onglet dans la discussion du 17 au soir. **Supposition nommée par Cowork** :
cette autorisation couvre les deux tables, puisqu'ajouter un sous-onglet EST cette
addition — le commentaire de `navigation.js` dit lui-même « pour ajouter une
sous-section : 1. config.js, 2. cette table ».

**Écarté, et pourquoi** : le contournement par l'événement public `sectionAffichee`
(l. 668, `detail.idSousSection`) existe et fonctionnerait sans toucher
`navigation.js`. Il est écarté parce qu'il ferait du septième sous-onglet le seul
qui ne s'initialise pas comme les six autres — une exception au patron, donc de la
dette, pour éviter une ligne dans une table. Si Grégoire refuse la modification,
le contournement est la solution de repli et **rien d'autre ne change**.

### 5.2 Ce qu'on voit, de haut en bas

**(a) Choisir un élève.** Grégoire a demandé un menu déroulant. Ses archives portent
sept groupes-cours (a2024 ×2, h2024 ×2, a2025, h2026 ×2), soit de l'ordre de
200 noms : au-delà d'une cinquantaine d'entrées, un menu déroulant est impraticable.

⮕ **Tranché par Cowork : un champ de recherche par nom** (« Bois… » → « B., Alya — 601-101-MQ, A2025 »), qui se comporte comme un menu déroulant tant que la
liste est courte. Le nom d'abord, le trimestre en suffixe : c'est ainsi que Grégoire
reconnaît ses élèves. L'intention de sa demande était l'économie verticale, et le
champ de recherche la sert au moins aussi bien.

⚠ `[B6]` **Le registre des trimestres contient `demo`** (`trimestres.js` l. 325).
Le sélecteur **exclut la démo** : ce sont des élèves fictifs.

⚠ `[B5]` **« Un même DA apparaît une fois » ne vaut que pour les DA du collège.**
Tant que #914 n'est pas corrigé, un élève ajouté à la main dans deux trimestres
porte deux DA fabriqués (`da: da || \`DA${Date.now()}\``) et apparaît deux fois.
L'écran ne prétend pas le contraire ; il les affiche tels quels. Grégoire a confirmé
le 17 sept. qu'aucun DA fictif ne dort dans ses trimestres réels.

**(b) Bouton « Inscrire au registre ».** Capture le dossier (§ 4.4), affiche ce qui
a été capturé (« 9 évaluations, 28 séances, grille SRPNF × IDME — capturé le
17 sept. »). Un élève déjà inscrit : le bouton dit « Re-capturer », et prévient que
la capture précédente de ce trimestre-cours sera remplacée.

**(c) La liste des élèves inscrits** — c'est le cœur de l'écran, et c'est ce qui
répond à la demande d'économie verticale. **Une ligne par élève inscrit**, pas une
par élève de la classe. Repliée, la ligne montre : nom, trimestre d'origine, date
de capture, et les résultats ultérieurs déjà saisis. Dépliée : le dossier (§ 5.3).

**(d) La ligne de saisie unique**, telle que Grégoire l'a décrite :

```
[ Élève ▾ ]  [ Cours ]  [ Trimestre ]  [ Note ]  [ Ajouter ]
```

Après un ajout, le cours et le trimestre restent (mémoire de séance, jamais
écrite — comme #913), l'élève passe au suivant, le curseur va à la note. Le
résultat ajouté apparaît immédiatement sous l'élève concerné dans la liste (c),
avec un bouton « Retirer ».

⮕ **Ce qui disparaît** : la répétition d'un bloc de champs par élève. C'est la
demande initiale, et elle est satisfaite par (a) + (d).

### 5.3 Le dossier déplié — ce que Grégoire veut comprendre

Son objectif, dans ses mots : « avoir le maximum d'informations sur cet élève pour
me permettre de mieux comprendre son parcours ».

Rendu minimal du lot 4 : les évaluations en ordre chronologique, critère par
critère, avec le niveau obtenu et le libellé de ce niveau **tel qu'il était au
moment de la capture** ; les indices de fin de trimestre ; l'assiduité ; puis, en
bas, les résultats ultérieurs.

⛔ **Aucune analyse, aucun calcul neuf, aucun graphique, aucun seuil, aucune
corrélation dans ce chantier.** Comme #913. Ce qu'on livre, c'est le dossier
lisible ; ce qu'on en tire viendra après, et se cadrera à part.

---

## 6. Le stock de #913, et l'export de recherche

### 6.1 Le stock

`<trim>_resultatsUlterieurs` existe depuis ce matin et **contient peut-être déjà
des saisies de Grégoire.**

⮕ Le registre la **lit et la reprend** au premier chargement, en le disant à
   l'écran. **Aucune mesure préalable n'est nécessaire** `[A3]` : le code traite les
   deux cas, clé vide ou non.
⛔ **L'ancienne clé n'est ni effacée ni réécrite** : écrire dans les données de
   Grégoire lui revient (CLAUDE.md, « tarir n'est pas réparer »). On recopie, on ne
   déplace pas.
⮕ Le bloc du Cadre est **retiré** dans le même lot (zéro-dette : un chantier retire
   ce qu'il remplace). `js/resultats-ulterieurs.js` est absorbé par le module neuf
   ou en devient le lecteur de reprise — au choix de Claude Code, qui le dit.

### 6.2 L'export de recherche `[A1]` — sans quoi les notes disparaissent en silence

**Fait mesuré** : `js/trimestres.js` l. 2025 lit `cle('resultatsUlterieurs')` et sort
`observations.etudiants[].resultats_ulterieurs` (l. 2245, `version_format` 1.2). Deux
sentinelles le figent (`sentinelle-913-resultats-ulterieurs.test.js`,
`sentinelle-902-export-recherche-vrais-indices.test.js` l. 122).

⮕ **À livrer au lot 3** : l'export de recherche (`exporterFormatRecherche`) lit
désormais **le registre par DA** pour chaque élève du trimestre exporté, et
l'ancienne clé `<trim>_resultatsUlterieurs` **en repli (union, sans doublon)** tant
qu'elle existe. Le DA ne sort toujours pas. `version_format` **reste 1.2** : la forme
de sortie ne change pas.

⚠ Sans cela, toute note saisie après le lot 3 serait absente du fichier de
recherche, **sans que rien ne le signale**.

---

## 7. Découpage en lots

| Lot | Contenu | Ce qui le prouve |
|---|---|---|
| **1** | La clé (+ `CLES_GLOBALES`, `DATA-OWNERSHIP`), le module, le sous-onglet (`config.js`, `navigation.js`, `index.html`), l'écran vide | Le sous-onglet s'ouvre ; aucun avertissement de `cle()` ; rien d'écrit ailleurs |
| **2** | Le sélecteur multi-trimestres (démo exclue) et la capture | Banc : capture sur trimestre archivé, **stock source identique octet pour octet** ; un DA du collège dans deux trimestres = une entrée ; **poids réel d'un dossier, mesuré, ET rapporté au poids du trimestre qu'il permet de retirer** (§ 4.1 bis) ; décision sur `portfoliosEleves` rendue par cette mesure ; `[D]` **mutation : envelopper `calculerEtStockerIndicesCP` et compter ZÉRO appel pendant une capture** |
| **3** | La ligne de saisie, la liste des inscrits, **retrait du bloc du Cadre**, reprise du stock #913, **l'export de recherche (§ 6.2)** | `[A1]` L'export porte une note saisie dans le registre **ET** une note du stock #913 ; l'ancienne clé intacte ; plus aucun bloc dans le Cadre |
| **4** | Le dossier déplié | Rendu à 768 px, deux modes, cibles ≥ 44 px |

### Ajouts de la relecture `[D]`

- **Avant le lot 1** : commiter les fiches #914/#915 et ce cadrage. Ils ne vivent
  que sur le disque de Grégoire, mesuré par l'audit de début de session.
- **Lot 3** : le **trou R3** nommé au relais de 1.143.0 — `nettoyerTexte`
  (`js/resultats-ulterieurs.js`) peut perdre son `.slice(0, LONGUEUR_MAX_TEXTE)` sans
  qu'aucun essai rougisse. Le relais le réservait « au prochain lot qui passe par ce
  fichier » : **c'est le lot 3**. Une ligne dans la colonne preuve.
- **Lot 3** : `sentinelle-913-resultats-ulterieurs.test.js` attend l'écriture
  namespacée (l. 41, 52-53). **Elle rougira et devra se réancrer** — le dire dans le
  rapport pour que ce ne soit pas pris pour une régression.

**Porte terrain due au lot 2 et au lot 4** (iPad, Safari, corpus réel). Deux
livrables jumeaux : le markdown ici, l'artefact publié par Cowork.

---

## 8. Hors périmètre — nommé pour que rien ne s'élargisse

- **La suppression des trimestres archivés.** C'est la suite logique, ce n'est pas
  ce lot. ➔ Rappel du § 4.1 bis : Grégoire supprime **pour la place**, et sa copie
  reste dans les Archives ; la voie de retour est le réimport de l'archive
  (`ECOSYSTEME-DONNEES.md`, verbe *réimporter*). ⚠ Et elle n'est **pas neutre** : l'Exploration des pratiques, le Rythme de
  travail et le Bilan réflexif lisent ces trimestres. Le registre y survivrait ;
  eux se videraient. À mesurer et à dire à Grégoire **avant** qu'il supprime quoi
  que ce soit.
- **L'export en `.codex-data.json`**, et la conversion depuis le format du registre
  vers `codex-data` v1 `[A4]`.
- **L'anonymisation.** Écartée par Grégoire pour l'instant.
- **La validation du DA — #914.** Inscrite séparément, à prendre avant ou après,
  mais pas dans ce chantier.
- **Toute analyse** : corrélations 101 → 102, prédiction de réussite, graphiques de
  trajectoire. C'est l'objet du projet à terme ; ce n'est pas l'objet de ce lot.

---

## 9. Ce qui est dû à Grégoire, et rien d'autre

1. ~~Ce que la capture emporte~~ — **tranché le 17 sept. au soir** : interventions et
   instantanés hebdomadaires ajoutés ; portfolios sur mesure de poids (§ 4.1 bis).
   **Aucune question ouverte à la clôture du cadrage.**
2. Les mots de l'avertissement de dérive de grille (§ 4.2), le jour où il servira —
   pas maintenant.

### Ce que Cowork a tranché plutôt que de le lui renvoyer

- **La source des mesures** `[A3]` : pack démo pour l'ordre de grandeur, corpus réel
  à la porte terrain du lot 2. Aucune mesure préalable n'exige que Grégoire aille
  ouvrir un écran — et la mesure du stock #913 devient inutile puisque le code
  traite les deux cas (§ 6.1).
- **`navigation.js`** `[A5]` : voie canonique, avec le repli nommé s'il refuse.
- **Le champ de recherche** (§ 5.2) : tranché, motif écrit.
- **Les cinq ambiguïtés** `[C1-C5]` : tranchées comme Claude Code le proposait,
  écrites aux § 3, 4.1, 4.4.

---

## 9 bis. Relevé de la porte terrain du 18 sept. — ce qu'il change

**7 portes sur 7, zéro échec.** Trois décisions rendues.

### La mesure sur le corpus réel (porte 1.3)

> 11 évaluations · 32 séances · 3 grilles (Grille-5 FR-HOLIS-30 A25, Grille-4 A25,
> Grille-5 FR-ALGO-30 A25) · 1 dossier, **65 Ko** — Copie du 2026-09-18

Cohérent avec le pack démo (43 Ko pour dix évaluations). Le budget du § 4.1 bis
tient : l'ordre de grandeur est bien la dizaine de kilooctets par élève.

### ⚠ Un fait sur son corpus, dit par Grégoire le 18 sept.

« Je n'ai les élèves qu'une seule fois puisque je donne le même cours à chaque
trimestre. Il est arrivé d'avoir à nouveau un même élève, mais c'est une exception. »

➔ **`dossiers[]` vaut presque toujours 1.** La forme reste juste — l'exception
existe — mais le multi-dossiers n'est **pas** le cas courant et ne mérite aucune
optimisation ni aucun écran dédié.

➔ **Erreur de cadrage de Cowork, nommée** : la porte 1.1 demandait « un élève que
tu as eu dans deux trimestres », c'est-à-dire un cas exceptionnel chez lui. Elle est
verte **sans avoir éprouvé ce qu'elle visait**. La règle « un DA du collège, une
entrée » reste tenue par la sentinelle, et rien d'irréversible n'en dépend :
**aucune porte de reprise** (règles 1 et 2 du skill `portes-terrain`).

### Les trois décisions

- **3.1 — Retrait du registre : (a), un bouton « Retirer du registre » au lot 3.**
  Motif donné par Grégoire : « pour corriger une erreur ». ➔ C'est un geste de
  réparation, pas de gestion : il demande une confirmation, et il doit **dire ce
  qu'il emporte** quand des résultats ultérieurs ont déjà été saisis pour cet élève
  (les perdre en silence sur un clic de correction serait le pire des cas).
- **3.2 — « capture » disparaît de l'écran, remplacé par « copie ».**
  Grégoire a jugé « capture » calqué de l'anglais et proposé « instantané ».
  ⚠ **Objection de Cowork, acceptée par lui** : « instantané » est **déjà pris**
  dans son écosystème (`ECOSYSTEME-DONNEES.md` : les ex-TimeMachine des Archives) —
  et ce sont précisément les instantanés hebdomadaires que le dossier emporte. « Un
  instantané qui contient des instantanés » est illisible dans six mois.
  ➔ **Mot retenu : « copie »**, que l'écran écrit déjà (« Copie du 2026-09-18 »).
  « Inscrire au registre » ne bouge pas ; « Re-capturer » devient
  **« Refaire la copie »**. Plus aucune occurrence de « captur* » dans ce que
  Grégoire lit — le vocabulaire interne du code n'est pas concerné.
- **3.3 — Les trois phrases de « Nouvelles » 1.144 : tel quel.**

### Un défaut de forme relevé dans la mesure

La ligne de résumé n'accorde pas ses pluriels : « 11 évaluation·s »,
« 32 séance·s », « 1 dossier·s ». Le point médian n'a rien à faire là : ce n'est
pas de l'écriture inclusive, c'est un pluriel non calculé. ➔ À corriger au lot 3
(un helper, pas onze conditions).

---

## 10. Une note, pas un obstacle

Conserver des données nominales d'élèves qui ne sont plus les siens, hors Archives
et sans échéance, change la nature du traitement au sens de la **Loi 25**. Grégoire
a déjà un cadre écrit (`CONFIDENTIALITE.md`, `PRIVACY.md`, et #862 sur ce que la loi
demande à l'utilisateur). Signalé ici pour que la décision soit **prise** et non
subie — il a précisé que les notes lui sont transmises par la Direction des études
**avec l'accord explicite des élèves** (cf. #913).
