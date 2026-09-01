# Rapport — le dépistage après le retrait du code en dur, et la venue de l'orthopédagogue

> **Date** : 31 août 2026
> **Destinataire** : Grégoire (document de travail, registre technique et pédagogique mêlés)
> **Rédigé depuis** : session Cowork, sur mesure du dépôt à l'état `82dbaa26`
> **Objet** : établir ce que le dé-durcissement du dépistage a réellement produit, ce
> qu'il permet désormais, ce qu'il ne permet pas encore, et comment préparer
> l'arrivée d'une orthopédagogue dans la Cohorte 1 à l'automne 2026.

---

## 0. Méthode et niveaux de certitude

Tout ce qui suit est marqué :

- **[VÉRIFIÉ]** : lu dans le code ou dans un document du dépôt, avec sa référence.
- **[INFÉRÉ]** : cohérent avec ce qui a été lu, non prouvé.
- **[À ÉTABLIR]** : hypothèse ou question ouverte.

⚠ Avertissement de fiabilité. En préparant ce rapport, deux affirmations initiales
se sont révélées fausses (« la marque de maîtrise manque » et « le dépistage n'a pas
été audité »). Dans les deux cas la cause était la même : lecture de mentions
croisées plutôt que de la source. Les renvois à `#555` dans `BACKLOG.md`
(lignes 2249, 2320, 2338) sont formulés au futur alors que l'item est clos depuis le
30 août ; ils induisent en erreur. **Petit item de ménage à ouvrir.**

---

## 1. Ce que le retrait du code en dur a réellement fait

La taxonomie SOLO n'a pas été retirée de l'application. Elle a changé de statut :
de constante inscrite dans le code, elle est devenue **une donnée que chaque
utilisateur déclare**. Et elle se déclare à deux endroits distincts, qui ne disent
pas la même chose.

### 1.1 Sur le critère de grille : ce que l'on mesure

**[VÉRIFIÉ]** Chaque critère porte un attribut `niveauSOLO` (42 occurrences dans
9 fichiers, dont `grilles.js`, `profil-etudiant-calculs.js`, `interventions.js`,
`partage-schemas.js`). Il dit de quelle nature est la compréhension évaluée par ce
critère (multistructurel, relationnel, abstrait étendu).

C'est la couche qui permet de nommer la cause : « Difficulté persistante –
Structure (multistructurel) », où « Structure » vient de la grille de l'utilisateur
et « multistructurel » du champ qu'il a lui-même configuré.

### 1.2 Sur le niveau d'échelle : ce que vaut un résultat

**[VÉRIFIÉ]** Chaque niveau d'une échelle de performance porte lui aussi un
`niveauSOLO` **structuré** (`js/echelles.js:63`), avec les quatre valeurs
`unistructurel`, `multistructurel`, `relationnel`, `abstrait_etendu`, éditable dans
le formulaire par un menu déroulant (`echelles.js:3236`). Le seed livre la
correspondance avec tes quatre codes :

| Code | Niveau | `niveauSOLO` livré |
|---|---|---|
| I | Incomplet / insuffisant | `unistructurel` |
| D | En développement | `multistructurel` |
| M | Maîtrisé | `relationnel` |
| E | Abstrait étendu | `abstrait_etendu` |

**[VÉRIFIÉ]** L'échelle porte en outre `seuilMaitrise` et ses **repères**
(`echelles.js:417`, `reperesNouvelleEchellePourEnregistrement`), avec l'éditeur
d'échelle neuve qui les gère sur un tampon et revérifie à l'enregistrement (#555
lot 2 (e), livré le 28 août).

### 1.3 Ce que la distinction apporte

Le premier ancrage dit *quoi*, le second dit *combien*. Il fallait les deux, et les
deux existent. C'est ce qui rend la taxonomie disponible **comme référence** sans
l'imposer : un utilisateur qui ne renseigne pas ces champs garde une application
fonctionnelle ; celui qui les renseigne obtient un dépistage justifiable.

⮕ **Réponse directe à la question posée** : non, le retrait du code en dur
n'empêche pas de développer le dépistage et l'intervention. Il en est la condition.
Avant, la fonctionnalité supposait le contexte de Grégoire ; désormais elle suppose
seulement que l'utilisateur ait déclaré son propre cadre.

---

## 2. Ce que l'application sait faire aujourd'hui

**[VÉRIFIÉ]** La chaîne, telle qu'elle tourne (skill `depistage-rai`,
`js/profil-etudiant-calculs.js`) :

```
Grille de critères (chacun avec son niveauSOLO)
  → Échelle de performance (chaque niveau avec son niveauSOLO + repères)
    → Évaluation des artefacts → indices A-C-P
      → IPB : nombre d'artefacts consécutifs récents sous le seuil de défi,
              calculé sur les critères multistructurels
        → Diagnostic croisé IPB × direction
          → Niveau d'intervention RàI (1 / 2 / 3)
            → Accompagnement au profil étudiant
              → Planification, bilan, suivi
```

Les indices A-C-P (`docs/modules/indices-cp.md`) :

| Indice | Mesure | Source | Stockage |
|---|---|---|---|
| **A** — Assiduité | engagement cognitif (présence) | `saisie-presences.js` | `indicesAssiduiteDetailles` |
| **C** — Complétion | mobilisation (remise des travaux) | `portfolio.js` | `indicesCP` |
| **P** — Performance | maîtrise (qualité des productions) | `portfolio.js` | `indicesCP` |

Le diagnostic croisé, qui est le cœur du classement en trois niveaux :

| IPB | Direction | Diagnostic | Niveau RàI |
|---|---|---|---|
| 0 | — | Maîtrise acquise | 1 |
| 1 | ↗ | Difficulté résolue | 1 |
| 1 | → ou ↘ | Difficulté émergente | 1 |
| 2 | ↗ | Progression | 2 |
| 2 | → | Plateau | 2 |
| 2 | ↘ | Difficulté constante | 2 |
| ≥ 3 | ↗ | Progression lente | 2 |
| ≥ 3 | → ou ↘ | Difficulté persistante | 3 |

Les trois niveaux : **1 Universel**, **2 Préventif**, **3 Intensif**, plus deux cas
spéciaux (« Non-participation » : présent sans production, niveau 3 ; « En
attente » : aucune donnée).

**[VÉRIFIÉ]** Le skill pose explicitement la RàI comme **inspiration, pas cadre
normatif**, et l'universalité comme règle : « Rien dans l'architecture ne doit être
codé en dur pour une pratique personnelle, une discipline ou un cours spécifique. »

---

## 3. Le point de tension : deux définitions concurrentes de la maîtrise

C'est le constat central de ce rapport, et il n'est pas un défaut d'inattention
mais un chantier nommé et reporté.

**[VÉRIFIÉ]** Depuis #555 (clos le 30 août), la « Consolidation des apprentissages »
tire son seuil de maîtrise **des repères posés par l'utilisateur sur son échelle**.
Le curseur « Seuil de défi spécifique » (Labo → Outils d'observation) le dit
maintenant à l'écran : il règle le dépistage seulement. Une sentinelle rougit si un
second réglage de maîtrise réapparaît dans cet écran.

**[VÉRIFIÉ]** Mais `determinerNiveauRaiPedagogique` et `identifierPatternActuel`
(`js/profil-etudiant-calculs.js`) lisent toujours :

```js
const seuilIdmeMaitrise     = obtenirSeuil('idme.maitrise');      // 0,85
const seuilIdmeDeveloppement = obtenirSeuil('idme.developpement'); // 0,75
const seuilIdmeInsuffisant   = obtenirSeuil('idme.insuffisant');   // 0,64
```

`js/interventions.js:1119-1120` fait de même. Ces valeurs viennent de
`js/interpretation-config.js`, dont l'en-tête précise qu'il n'y a **aucune interface
de réglage depuis la refonte nav #299** : elles vivent en localStorage, sans moyen
de les toucher.

⮕ Autrement dit : **le niveau d'intervention est encore décidé par des pourcentages
que l'utilisateur ne peut pas voir ni régler, alors que la marque de maîtrise vit
désormais sur son échelle.** Le nommage de #555 lot 2 (d) a distingué les deux sens
(`seuilMaitrise` = le code de niveau porté par l'échelle ; `seuilIdmeMaitrise` = la
préférence 0-1) sans encore les réconcilier.

C'est **#551**, ouvert. Il n'a pas d'urgence pour Grégoire, dont les seuils sont
justes. Il en a une pour toute personne dont l'échelle ne se convertit pas
naturellement en pourcentage.

---

## 4. Les limites connues, en vue d'une autre profession

Le modèle est aujourd'hui **extensible en valeurs, mais pas en dimensions ni en
cadres**. C'est la distinction qui commande la préparation de l'automne.

### 4.1 Extensible en valeurs — ce qui marche

Critères, échelle, niveaux, repères, seuil de défi, pondérations : configurables.
Une orthopédagogue peut poser son propre appareil d'évaluation sans toucher au code.

### 4.2 Non extensible en dimensions **[VÉRIFIÉ]**

Le contexte d'apprentissage est fixé à A-C-P : assiduité, complétion, performance.
Rien ne permet de déclarer une quatrième dimension d'entrée. Une orthopédagogue
observe vraisemblablement d'autres choses (persistance de l'erreur, temps de
réalisation, réponse à l'étayage, degré d'autonomie, transfert), mais **[À ÉTABLIR]**
lesquelles exactement : c'est à elle de le dire, pas à nous de le deviner.

### 4.3 Non extensible en cadres **[VÉRIFIÉ]**

SOLO est le seul cadre d'interprétation. La fenêtre d'analyse (3 dernières
productions), la table IPB × direction et les trois niveaux RàI sont écrits une
fois pour toutes. **[INFÉRÉ]** Une orthopédagogue pourrait vouloir un autre modèle
de progression ou un autre découpage de l'intensité.

### 4.4 Trois défauts ouverts qui la toucheront

| Item | Défaut | Portée pour elle |
|---|---|---|
| **#553** | Le rabotage `startsWith('francais')`, 8 sites. Un critère dont le nom varie entre deux écritures produit une clé qui n'existe pas dans `moyennes` : « Français écrit » → `francaisecrit`, absent. **Le critère est filtré du diagnostic, sans un mot, avec des 0 %.** | **Le premier mur, et il est muet.** Elle ne nommera pas ses critères comme Grégoire. En traitement au terminal ce 31 août. |
| **#551** | Les seuils `idme.*` du §3 ci-dessus | Son échelle peut ne pas se convertir en pourcentage |
| **#554** | `determinerCibleIntervention` ne reçoit jamais `statutDecrochage` : la branche « Décrochage » est inatteignable | Cas limite, mais pertinent en orthopédagogie |

### 4.5 Documentation périmée **[VÉRIFIÉ]**

`docs/modules/depistage-et-suivi.md` (11 avril 2026) cite `js/profil-etudiant.js`,
qui n'existe plus (éclaté en `-calculs`, `-diagnostics`, `-helpers`,
`-sections-affichage`), et décrit une page « Réglages > Dépistage » introuvable dans
`index.html` après #299. Elle décrit la chaîne d'avant la refonte du 27 août.
**À reprendre avant de mettre quoi que ce soit entre les mains d'une nouvelle
utilisatrice.**

### 4.6 Vocabulaire flottant **[VÉRIFIÉ]**

Trois nommages coexistent pour le même triplet : **A-C-P** (`indices-cp.md`, la
référence), **A-C-M** avec « Mobilisation » à la place de « Complétion »
(`interpretation-config.js`), **A-C-P-E** (`depistage-et-suivi.md`). Sans
conséquence sur le calcul, mais coûteux pour qui découvre le modèle.

---

## 5. Préparer la venue de l'orthopédagogue

### 5.1 Le principe qui commande le reste

Ne rien concevoir avant de l'avoir écoutée. Concevoir l'extensibilité sur ce qu'on
imagine de son métier reproduirait exactement l'erreur qu'on vient de corriger :
imposer un contexte. La règle du 27 août vaut ici mot pour mot :

> « Les utilisateurs auront tous des besoins et des conditions différentes et je ne
> veux pas imposer mon contexte. »

Ce qui se prépare avant sa venue, c'est donc **de quoi la rendre capable de dire ce
qui lui manque**, pas une architecture qui anticiperait sa réponse.

### 5.2 Ce qu'elle peut s'approprier tel quel

- Poser ses propres critères, avec le niveau SOLO de chacun.
- Poser sa propre échelle, avec l'étiquette SOLO de chaque niveau et ses repères.
- Régler son seuil de défi.
- Obtenir un dépistage dont la cause est nommée dans son vocabulaire à elle.

### 5.3 Les questions à lui poser

Cinq questions, une par point d'articulation du modèle. Chacune est posée là où le
modèle est aujourd'hui figé : sa réponse dira s'il faut l'ouvrir.

**1. Ce que tu observes.** L'application mesure trois choses : la présence, la
remise des travaux, la qualité des productions. Qu'observes-tu, toi, qui n'est
dans aucune de ces trois ? Et parmi ce que tu observes, qu'est-ce qui se compte,
qu'est-ce qui se constate ?

**2. Comment tu qualifies une performance.** L'application demande une échelle à
niveaux, chacun rattaché à un degré de la taxonomie SOLO, avec un repère qui marque
le passage à la maîtrise. Est-ce que ta façon de qualifier un résultat entre dans
cette forme ? Sinon, qu'est-ce qui en déborde ?

**3. Comment tu lis une évolution.** L'application regarde les trois dernières
productions et compte les blocages consécutifs. Est-ce la bonne fenêtre ? Un élève
qui progresse lentement mais sûrement, tu le vois comment ?

**4. Comment tu décides d'intervenir, et à quelle intensité.** L'application croise
la persistance du blocage et la direction, et en tire trois niveaux (universel,
préventif, intensif). Est-ce que trois niveaux suffisent ? Est-ce que ce sont les
bons déclencheurs ?

**5. Ce que tu fais ensuite.** L'application nomme la cause et te laisse planifier.
De quoi as-tu besoin qu'elle garde, entre deux interventions, pour que le suivi
tienne ?

**Question transversale, à poser en dernier** : qu'est-ce qui, dans ta pratique,
n'a pas d'équivalent dans ce que tu viens de voir ? C'est celle qui rapporte le
plus, et elle ne se pose qu'après les autres.

### 5.4 Ce qu'il faut avoir fait avant la rencontre de mi-septembre

| Priorité | Geste | Motif |
|---|---|---|
| 1 | **#553** | Sinon elle rencontre un résultat faux muet dès ses premiers critères |
| 2 | Reprendre `docs/modules/depistage-et-suivi.md` | La seule doc du module décrit un état périmé |
| 3 | Unifier A-C-P / A-C-M / A-C-P-E | Coût d'entrée inutile |
| 4 | Ouvrir un item « extensibilité du dépistage » | Pour que ses réponses aient où se déposer |

**[INFÉRÉ]** #551 et #554 peuvent attendre : ils ne produisent pas de résultat faux
silencieux, contrairement à #553.

---

## 6. Ce qui reste à décider par Grégoire

1. Faut-il ouvrir dès maintenant un item « dimensions d'entrée configurables », ou
   attendre septembre ? (Ce rapport recommande d'attendre, et de préparer la
   question plutôt que la réponse.)
2. La rencontre de mi-septembre est-elle le bon moment pour les cinq questions du
   §5.3, ou faut-il un entretien séparé ?
3. La documentation du §4.5 : la reprendre soi-même, ou la confier à une session ?

---

## Annexe — sources de ce rapport

Tout ce qui est marqué [VÉRIFIÉ] vient de :

- `js/profil-etudiant-calculs.js` (`determinerNiveauRaiPedagogique`,
  `identifierPatternActuel`, `diagnostiquerSuiviApprentissage`, `calculerIPB`)
- `js/echelles.js` (lignes 63, 91-121, 417, 3103, 3236-3237, 2976-3313)
- `js/interpretation-config.js`, `js/interventions.js:1119-1120`
- `.claude/skills/depistage-rai/SKILL.md`
- `docs/modules/indices-cp.md`, `docs/modules/depistage-et-suivi.md`
- `BACKLOG.md` (item #555 clos, lignes 3483 et suivantes ; #551, #553, #554 ouverts)
- `plans de travail/PLAN-SOLO-echelle-et-depistage.md` (26 août)
- `plans de travail/CONSIGNE-552-537-535-cibles-intervention-sans-contexte-impose.md`
  (27 août, §10 : ce que le chantier a livré)
