# PLAN — La taxonomie SOLO, l'échelle de performance, et ce que le dépistage a le droit de supposer

> Rédigé le **26 août 2026 au soir**, au terme d'une réflexion avec Grégoire.
> Codage prévu le **jeudi 27 août au matin**.
> Origine : l'audit du dépistage demandé au retour de #529, et la question de Grégoire —
> « pourquoi la taxonomie SOLO est-elle associée aux critères plutôt qu'à l'échelle ? »

---

## 1. La question de départ, et ce qu'elle a ouvert

Grégoire a remarqué qu'un champ « Niveau SOLO » existe dans le formulaire des **critères** de grille, mais pas dans celui de l'**échelle de performance**. Son intuition : ce devrait être l'inverse.

L'intuition est juste sur le fond — SOLO est une taxonomie de résultats **observés** (*Structure of the Observed Learning Outcome*). Mais elle rate un fait : l'échelle porte **déjà** la correspondance SOLO, dans le champ `description` de chaque niveau, en prose libre. Ce que le seed livre :

| Niveau | Description livrée | Lecture SOLO |
|---|---|---|
| I — Incomplet | « Préstructurel, unistructurel » | les deux niveaux bas |
| D — en Développement | « Multistructurel » | multistructurel |
| M — Maîtrisé | « Relationnel » | relationnel |
| E — Étendu | « Abstrait étendu » | abstrait étendu |

Le vrai constat n'est donc pas « SOLO est du mauvais côté ». C'est : **d'un côté SOLO est un champ structuré que le calcul sait lire ; de l'autre c'est de la prose que le calcul ne peut pas lire.**

Et la conversation a fait apparaître un enjeu plus large que le champ lui-même, formulé par Grégoire :

> « La crainte que j'ai, c'est que nous codions en dur ce qui est dans ma tête, alors qu'il faut rendre l'application flexible. L'utilisateur est capable de faire du dépistage même s'il n'a pas exactement la même échelle que moi. Il se sert tout de même de la taxonomie SOLO pour identifier les élèves à risque. »

Cette crainte est **fondée sur des faits**, et elle s'est déjà réalisée au moins une fois — voir §3.

---

## 2. Les décisions actées le 26 août 2026

### D1 — Les deux SOLO sont deux objets distincts, et les deux restent

- **SOLO sur le critère** : « quelle complexité ce critère *exige*-t-il ? » — une **visée** didactique. Trois valeurs (multistructurel, relationnel, abstrait étendu), parce qu'on ne conçoit jamais un critère qui vise l'unistructurel.
- **SOLO sur le niveau d'échelle** : « quelle complexité la réponse *atteint*-elle ? » — un **constat**. Cinq valeurs possibles, parce qu'une réponse, elle, peut être préstructurelle.

⮕ On **ajoute**, on ne déplace pas. Déplacer ferait perdre l'IPB, qui ne surveille que les critères « multistructurels » — les *fondations*. La logique pédagogique tient : un élève qui bloque sur *structure* n'a pas les fondations ; un élève qui bloque sur *nuance* bute sur ce qui est difficile pour tout le monde. Les compter pareil produirait des faux positifs en série.

⮕ **Que les deux menus soient visiblement différents est un acquis, pas un défaut** : c'est ce qui apprend à l'utilisateur qu'il ne répond pas à la même question.

### D2 — Le menu de l'échelle offre les cinq niveaux canoniques, et il est facultatif

Préstructurel · unistructurel · multistructurel · relationnel · abstrait étendu, plus « aucun ».

- **Facultatif** : toutes les échelles n'ont pas une lecture SOLO (une échelle en pourcentages, une échelle A/B/C/D).
- **Pas d'entrée composite**, pas de sélection multiple : chaque lecteur du champ n'a qu'une étiquette à traiter. La nuance « I couvre aussi le préstructurel » reste dans la **description**, qui est le texte que l'élève lit.

### D3 — Le champ `description` du niveau n'est PAS remplacé

Vérifié : `description` part dans les documents remis aux élèves — colonne « Description » du tableau `Code | Nom | Description | Plage` des exports PDF (`export-pdf.js:540, 879, 957, 1230`), plus les cartouches (`cartouches.js:2360`) et le comparateur (`comparateur-pratiques.js:215`).

⮕ Le remplacer par une liste fermée priverait toute échelle non SOLO du seul endroit où dire ce que son niveau signifie. Le menu SOLO **s'ajoute à côté**.

### D4 — Le niveau « 0 » : un jugement suspendu, pas une performance

Verdict de Grégoire, mot pour mot :

> « Le niveau 0 n'est pas une performance, c'est que le travail n'est pas recevable (plagiat, utilisation de l'IA, etc.) et mon jugement d'enseignant est suspendu. »

Puis, plus loin :

> « Lorsqu'un étudiant remet un travail qui est non recevable, dans l'application, je considère que le travail n'est pas remis. Donc je n'ai jamais attribué de zéro à un élève. »

⮕ **Conséquence pour sa pratique** : son niveau 0 est **inutilisé**. L'application sert déjà correctement le cas — un travail au statut « non reçu » n'affiche même pas la grille de critères (`evaluation-chargement.js:801` : « Le travail doit être reçu avant évaluation »), donc aucun niveau n'est saisi et aucun score n'entre dans les moyennes.

⮕ **Le risque n'est donc pas actif sur ses données, il est LATENT** — pour un autre utilisateur qui emploierait un niveau 0 comme « échec », et pour le pack de démonstration qui en contient un. Voir §3-A5, et le lot 0 qui mesure avant de réparer.

⮕ **Question ouverte, à Grégoire** : retirer le niveau 0 de son échelle « 0-IDME (5 niv.) ». Ce n'est pas une décision de code mais une décision sur ses données, et elle exige d'abord la mesure du lot 0 (des évaluations existantes portent-elles ce niveau ?).

⮕ 15 oct. 2026, décision de Grégoire : pas de niveau hors calcul. Le seul cas réel, le plagiat soupçonné, se traite au niveau de la copie (« Non recevable »). Voir DECISIONS-2026-10-15-groupe-3.md, question 4.

### D5 — SOLO est le levier qui doit remplacer les seuils codés en dur

C'est la réponse à la crainte de Grégoire, et le cœur du chantier.

Chemin **actuel** du dépistage :

1. niveau choisi → score numérique (`valeurCalcul`)
2. moyenne des scores
3. moyenne comparée à **0,64 / 0,75 / 0,85** → verdict I/D/M/E
4. verdict → phrase d'interprétation SOLO, **codée en dur**

L'étape 3 est le problème : ces trois seuils vivent dans `interpretation-config.js`, **à côté** de l'échelle, sans lien avec elle. Or chaque niveau d'échelle porte **déjà** ses propres bornes — les champs Min % et Max %, obligatoires, remplis par l'utilisateur.

Chemin **visé** :

3′. la moyenne est située dans les **plages de l'échelle de l'utilisateur** ;
4′. le niveau obtenu livre son **étiquette SOLO**, qui donne l'interprétation.

⮕ À l'arrivée, le dépistage ne connaît plus ni « IDME », ni 0,64, ni « Structure ». Il sait seulement : *ce niveau-ci est étiqueté unistructurel, donc l'élève est à risque.*

⚠ **Ce qui restera numérique, et pourquoi.** Agréger plusieurs évaluations exige une moyenne, donc des nombres. Ce qui doit disparaître n'est pas le calcul, c'est le fait que les **bornes** viennent d'ailleurs que de l'échelle de l'utilisateur.

### D6 — L'échelle proposée quand le dépistage est activé : proposer, jamais exiger

Le dépistage n'a pas besoin d'« IDME ». Il a besoin d'une échelle **interprétable** : des valeurs ponctuelles, des plages, et le mapping SOLO. Proposer « IDME » comme point de départ modifiable est du **seed**, conforme à la règle du projet. L'exiger reviendrait à coder la pratique de Grégoire en dur d'un cran plus haut.

---

## 3. L'état mesuré au 26 août 2026

⚠ **Les numéros de ligne sont ceux du soir du 26 août.** Une session parallèle travaille sur #540 et modifie `js/interventions.js`, `js/indices.js`, `js/etudiants.js` et `js/profil-etudiant-sections-affichage.js`. **Re-localiser chaque site avant d'éditer.**

### A — Le dépistage est faux ou muet, en silence

| # | Défaut | Site | Effet | État |
|---|---|---|---|---|
| A1 | Un pourcentage 0-100 comparé à des seuils 0-1 | `profil-etudiant-helpers.js` | tout critère classé « Étendu », même à 12 % | ✅ **CORRIGÉ #541** (`69ce1483`) |
| A2 | `echelleId = "pratique-*"` non résolu — la table ne lit que `echellesTemplates` | `profil-etudiant-calculs.js:52-95` vs `evaluation-chargement.js:251-267` | scores `null` → aucun défi, pattern « Stable », RàI sur P seul | ouvert |
| A3 | Évaluation sans `echelleId` + plusieurs échelles → `null` | `profil-etudiant-calculs.js:136-143` | même effet muet sur les évaluations antérieures | ouvert, **choix assumé** de #529 |
| A4 | `seuils.acceptable` est `undefined` — la clé vit sous `interpretation.acceptable` | `interventions.js:221` | `score < undefined` toujours faux → **`defisCommuns` toujours vide** | ouvert |
| A5 | `c.valeur > 0` exclut un 0 légitime de la liste des défis | `profil-etudiant-sections-affichage.js:854` | un 0 pèse dans la moyenne et l'IPB mais disparaît de leur explication | ouvert |

**A4 est de la même famille que A1** : une comparaison à `undefined` qui ne lève rien, ne dit rien, et rend un verdict rassurant. Aucun test ne l'exerçait.

### B — Valeurs et noms encore en dur

| # | Ce qui est en dur | Site | Note |
|---|---|---|---|
| B1 | **Quatrième repli IDME** `{0:0, I:32, D:69.5, M:79.5, E:92.5}` | `portfolio.js:543-551` | #529 en annonçait trois ; celui-ci a été manqué |
| B2 | La clé `echellesPerformance` est **lue et jamais écrite** | `portfolio.js:554` | donc B1 est **toujours** actif — patron `feedback-cle-db-lue-jamais-ecrite` |
| B3 | Les cinq noms de critères de Grégoire, en accumulateur | `interventions.js:252-257` | `'Structure','Rigueur','Plausibilité','Nuance','Français'` |
| B4 | Les mêmes cinq, en tableau littéral | `interventions.js:219` | |
| B5 | Cibles d'intervention comparées au nom exact | `profil-etudiant-calculs.js:1366-1377` | `N === 'Français'`, `'Rigueur'`… sensible à la casse |
| B6 | `NOM_CRITERE_LANGUE = 'francais'` | `profil-etudiant-calculs.js:830`, `pratiques/pratique-pan-standards.js:1131` | assumé par #529, versé au backlog (#537) |
| B7 | Filtre de notes `['I','D','M','E']` | `liste-evaluations.js:368` | une échelle A/B/C/D rend le filtre inutilisable |
| B8 | Export `echelle: ['I','D','M','E']`, `seuil_reussite: 'M'` | `trimestres.js:1778` | |
| B9 | `obtenirNiveauSOLO()` **redevine** SOLO depuis le nom du critère | `trimestres.js:1950-1965` | **contredit** le champ `niveauSOLO` que l'utilisateur configure |
| B10 | `ORDRE_NIV = { E:4, M:3, D:2, I:1, '0':0 }` | `synthese-retroaction-data.js:19` | |
| B11 | Couleurs de niveau par défaut + `nom.includes('idme')` | `profil-etudiant-helpers.js:146-160` | l'échelle est choisie par son NOM |
| B12 | Les seuils `idme.*` eux-mêmes | `interpretation-config.js:38-44` | **calqués sur l'échelle de Grégoire** — voir l'encadré ci-dessous |
| B13 | Les quatre descriptions SOLO du profil | `profil-etudiant-sections-affichage.js:1071-1128` | + borne `0.85` en dur alors que `idme.maitrise` est configurable |

> **La preuve que la crainte de Grégoire s'est déjà réalisée.**
> Sa console rend : `0-IDME → 0=0  I=40  D=65  M=75  E=100`.
> Le repli codé en dur que #529 a retiré ce matin valait `{0:0, I:0.40, D:0.65, M:0.75, E:1.00}`.
> **Ce sont ses valeurs, au chiffre près.** Le calcul ne se repliait pas sur une convention : il se repliait sur son échelle à lui, recopiée dans le code il y a des mois.

### C — Incohérences internes

| # | Constat | Site |
|---|---|---|
| C1 | `evaluation.criteres` traité comme un **objet** (`Object.keys`) alors qu'il est un **tableau** partout ailleurs | `interventions.js:261-268` |
| C2 | Trois normalisations de clé de critère coexistent, dont deux inline | `helpers.js:293` (`cleCritere`), `helpers.js:337`, `calculs.js:180` |
| C3 | `genererTableauObjectifs` n'a **aucun appelant** — code mort | `profil-etudiant-sections-affichage.js:2948` |
| C4 | L'astérisque « Champ obligatoire » sur *Valeur ponctuelle* n'est **pas appliqué** | `echelles.js:2881, 3164` — #524 ne refuse que le code et le nom |

**C4 est une bonne nouvelle mal dite** : un niveau **sans** valeur ponctuelle est déjà exclu de partout — table de conversion (`calculs.js:86`), moyennes, IPB, et note finale où le critère sort du numérateur **et du dénominateur** (`evaluation-calcul.js:609`). Le mécanisme « jugement suspendu » existe déjà de bout en bout. Ce qui manque, c'est de le **dire** — et de cesser d'annoncer une obligation que rien n'exige.

⮕ 15 oct. 2026, décision de Grégoire : pas de niveau hors calcul. Le seul cas réel, le plagiat soupçonné, se traite au niveau de la copie (« Non recevable »). Voir DECISIONS-2026-10-15-groupe-3.md, question 4.

---

## 4. Les lots, dans l'ordre

Chaque lot tient dans une séance courte et porte un critère de fin vérifiable. **Ne pas en enchaîner plus de deux dans une matinée.**

### Lot 0 — Mesurer (~20 min, aucune écriture)

Avant de réparer quoi que ce soit sur le niveau 0, savoir s'il y a quelque chose à réparer.

- Combien d'évaluations portent un niveau dont le code n'existe plus dans l'échelle qui les a produites ?
- Combien portent le niveau `0` ?
- Combien portent un `echelleId` préfixé `pratique-` (A2) ?
- Combien n'ont **aucun** `echelleId` (A3) ?

Livrable : une sonde **en lecture seule**, collée en console par Grégoire, qui rend un tableau. Patron : les sondes de #442 et #453.

**Fin** : on sait si A2, A3 et le niveau 0 sont des risques actifs ou latents sur ses données réelles.

### Lot 1 — Refermer les silences du dépistage (~90 min)

Le dépistage doit cesser de rendre un verdict rassurant quand il n'a rien pu calculer.

- **A4** — `seuils.acceptable` → `seuils.interpretation.acceptable`. Une ligne, sentinelle obligatoire : c'est un défaut qu'aucun test n'attrapait.
- **A2** — la table de conversion résout aussi les échelles de pratique (`pratique-<id>` → `pratiquesConfigurables[].config.echelle`). Le chemin existe déjà dans `evaluation-calcul.js:526-537` ; on converge, on n'invente pas.
- **A3 + A2** — quand la conversion échoue, l'écran le **DIT**. Pas un `console.warn` : un message dans le bloc concerné. Un dépistage muet qui affiche « Stable » est pire qu'un dépistage qui s'avoue aveugle.

**Fin** : aucune des trois situations ne peut plus produire un verdict silencieux. Chacune a sa sentinelle, chacune est rouge au break-test.

### Lot 2 — Le menu SOLO sur l'échelle (~90 min)

- Menu à cinq valeurs + « aucun », **facultatif**, ajouté **à côté** de `description` (D2, D3), dans les **deux** éditeurs d'échelle (`echelles.js:2881` et `3164` ont chacun leur copie du formulaire).
- Retirer l'astérisque trompeur de *Valeur ponctuelle* (C4) et **documenter ce que le vide signifie** : « le niveau ne produit pas de note — le critère est retiré du calcul ».
- Migration : les descriptions existantes restent intactes. Le champ SOLO naît vide partout, y compris sur le seed. **Aucune reprise automatique** : deviner l'étiquette depuis la prose serait exactement le défaut B9.
- Le seed IDME reçoit ses étiquettes, puisqu'il est livré et qu'un seed est une échelle livrée, pas une valeur inventée.

**Fin** : Grégoire peut étiqueter les niveaux de son échelle, et laisser un niveau hors calcul en connaissance de cause.

### Lot 3 — Délier le dépistage de l'échelle de Grégoire (~90 min, le cœur)

C'est D5. À ne pas ouvrir avant que les lots 1 et 2 soient clos.

- La situation d'une moyenne dans un niveau lit les **plages de l'échelle** de l'évaluation, plus `interpretation-config.js`.
- L'interprétation affichée lit l'**étiquette SOLO** du niveau, plus les quatre textes en dur (B13).
- La borne `0.85` en dur disparaît avec eux.
- **B9 supprimé** : `obtenirNiveauSOLO()` contredit le champ ; il n'a plus de raison d'être.

⚠ **Le devenir des seuils `idme.*` est à trancher dans ce lot, pas avant.** Deux lectures : ils deviennent un repli pour les échelles sans plages exploitables, ou ils disparaissent. La réponse dépend de ce que le lot 0 aura montré.

**Fin** : un utilisateur avec une échelle A/B/C/D obtient un dépistage juste, sans avoir rien nommé « IDME ».

### Lot 4 — Le reste du codé-en-dur (~90 min)

B1+B2 (le quatrième repli et sa clé morte), B3, B4, B7, B8, B10, B11. Plus C1, C2, C3.

**B1+B2 en premier** : c'est le seul du lot qui produit des chiffres faux aujourd'hui.

**Fin** : plus aucun jeu de valeurs IDME en dur dans le dépôt ; `grep` à l'appui.

### Lot 5 — Écrire (~60 min)

> « La documentation là-dessus n'est nulle part que dans ma tête. » — Grégoire, 26 août

Un document de référence court dans `docs/`, qui dise : les deux SOLO et leur différence, le sens du niveau hors jugement, pourquoi le dépistage repose sur SOLO et non sur des seuils, et ce qu'une échelle doit fournir pour être « interprétable ».

Plus l'aide contextuelle des deux formulaires, qui doit distinguer *visé* et *atteint* — le malentendu de départ vient de son absence.

**Fin** : quelqu'un d'autre que Grégoire peut comprendre ces choix sans les lui demander.

---

## 5. Ordre recommandé pour jeudi matin

**Lot 0, puis Lot 1.** Rien d'autre.

Le lot 0 est court et conditionne les autres. Le lot 1 est celui dont le bénéfice est immédiat : le dépistage cesse de mentir par omission. Les lots 2 et 3 sont le chantier de fond et méritent une matinée à eux.

⮕ Premier geste : **inscrire ce chantier au backlog sous #542** (le prochain ID libre), avant d'employer le numéro nulle part.

---

## 6. Ce qui n'est pas tranché

1. **Retirer le niveau 0 de l'échelle de Grégoire** — décision sur ses données, après le lot 0.
2. **Le devenir des seuils `idme.*`** — repli ou disparition ; se décide dans le lot 3.
3. **A3 — le choix de #529** (ne pas deviner l'échelle quand plusieurs existent) reste juste, mais son silence ne l'est pas. Le lot 1 corrige le silence, pas le choix.
4. **#537 (le critère de langue reconnu par son nom)** et **#538 (les cibles RàI indexées par nom)** restent des questions de conception ouvertes, déjà au backlog. Ce plan ne les rouvre pas.

---

## 7. Précautions

- **Session parallèle** : #540 (lots C et D) touche `interventions.js`, `indices.js`, `etudiants.js`, `profil-etudiant-sections-affichage.js`. Or les lots 1 et 4 y touchent aussi. **Vérifier `git status` avant chaque staging**, et préférer `git add -N` puis `git commit -- <chemins>` dans la **même** commande — l'index est partagé et un `git add` ne réserve rien.
- **Vitest se lance depuis `tests/`**, jamais de la racine.
- **Aucun bump de version** tant que l'application de Grégoire est ouverte en `file://`.
- **Chaque correctif de ce plan porte sa sentinelle, avec break-test rouge vérifié.** Les défauts A1 et A4 ont survécu à des milliers de tests verts parce que rien n'appelait les fonctions fautives : un test d'existence n'est pas un test de comportement.
