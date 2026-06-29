# Analyse de conformité RREC — heures d'enseignement des cours

> **Note terminologique (#304)** : ce document emploie « heures d'enseignement »
> (terme recommandé par l'OQLF), qui remplace l'ancien « heures-contact » (calque
> de *contact hour*, déconseillé). Le **champ de données** `heuresContact` du code
> n'a pas été renommé (renommer la clé migrerait les codex) : les occurrences entre
> backticks désignent l'identifiant technique, pas la terminologie d'affichage.

> **Statut** : analyse de code (lecture seule). Aucune modification appliquée.
> **Date** : 29 mai 2026 · **Beta de référence** : 99.72 (HEAD `cddbd03`)
> **Auteur** : Claude Code, à la demande de Grégoire (pour planification Cowork)
> **Déclencheur** : trimestre d'Été 2026 — la vue calendaire affiche « 5 semaines ·
> 24 jours de cours », sans aucun total d'heures permettant de vérifier la conformité
> au Règlement sur le régime des études collégiales (RREC, C-29, r. 4).

---

## 1. Vue d'ensemble

Labo Codex ne mesure aujourd'hui **aucun total d'heures d'enseignement**. Il compte des
**jours** à partir du cadre calendaire, et n'a nulle part où stocker l'**exigence**
réglementaire d'un cours. La conformité RREC est donc **non vérifiable** par l'outil
en l'état — ce n'est pas un bug isolé mais l'absence de toute une chaîne.

Le cas de l'été le rend visible : un trimestre intensif fait **les mêmes heures**
qu'un trimestre régulier en **moins de jours**. Tant qu'on raisonne en jours, le
chiffre paraît « petit » et l'on ne peut pas conclure. Dès qu'on raisonne en
heures d'enseignement, on dispose de l'invariant qui traverse régulier et intensif.

---

## 2. Cadre réglementaire de référence

> Source : RREC (C-29, r. 4) + Composantes de la formation générale, dictés par
> Grégoire (les deux PDF déposés dans `docs/` sont des scans sans couche texte,
> non extractibles par l'outillage présent ; chiffres validés par Grégoire).

| Notion | Définition | Exemple 601-101-MQ |
|---|---|---|
| **Unité** | 45 h d'« activités d'apprentissage » — **inclut le travail personnel** | 2 ⅓ unités |
| **Total d'apprentissage** | unités × 45 h | 2 ⅓ × 45 = **105 h** |
| **Pondération** | théorie – laboratoire – travail personnel (heures/sem. sur 15 sem.) | 2 – 2 – 3 |
| **Heures d'enseignement** | (théorie + labo) × 15 — **temps en classe seulement** | (2+2) × 15 = **60 h** |
| **Travail personnel** | 3e nombre × 15 | 3 × 15 = 45 h |

**Vérification croisée** : 60 h (contact) + 45 h (personnel) = 105 h = 2 ⅓ × 45. ✓
Les chiffres se valident mutuellement, ce qui sécurise le modèle.

### Distinction décisive pour la conception

Les **unités ne suffisent pas** à déduire les heures d'enseignement : 2 ⅓ unités = 105 h
*incluant* le travail personnel. Pour isoler les 60 h de classe, il faut la
**pondération** (ou directement les heures d'enseignement). C'est pourquoi le champ
à ajouter doit porter sur les **heures d'enseignement**, pas seulement sur les unités.

> ⚠️ Le facteur « × 15 semaines » est une **convention du trimestre régulier**.
> En été, on vise les **mêmes 60 h en ~5 semaines** : la pondération hebdomadaire
> « 2-2-3 » devient littéralement fausse (≈ 12-12-? h/sem), alors que **les 60
> heures d'enseignement restent l'invariant**. La source de vérité de la conformité doit
> donc être les heures d'enseignement, pas un calcul reposant sur « 15 ». (Cohérent avec
> la règle projet « zéro fallback arbitraire ».)

---

## 3. La chaîne de conformité : 3 maillons, 2 manquants

Pour que « conforme » ait un sens, il faut comparer un **réalisé** à une **exigence**.

| Maillon | Rôle | État actuel |
|---|---|---|
| **① Exigence** | Heures d'enseignement attendues du cours (60), saisies au gabarit | ❌ **absent** |
| **② Réalisé** | Heures d'enseignement effectives = Σ(séances × durée) sur les jours de cours | ❌ **absent** |
| **③ Comparaison** | Réalisé vs Exigence → conforme / écart, avec message | ❌ impossible (① et ② manquent) |

Le « 24 jours » observé est le **symptôme du maillon ② manquant** : l'app mesure le
cadre, jamais l'enseignement réel.

---

## 4. Constats de code (vérifiés)

### 4.1 Le gabarit de cours n'a aucune notion d'heures

`js/entites/cours-entite.js` — l'objet `Cours` (créé par `creerCours`, l. 45-55 ;
champs modifiables l. 147) contient exactement :

```
id · codeCours · nomCours · discipline · numeroCompetence ·
competence · elementsCompetence · dateCreation · dateModification
```

→ **Aucun** champ `heuresContact`, `ponderation` ou `unites`. (Le `c.ponderation`
trouvé dans `trimestres.js:1282` concerne la pondération d'un **critère de grille**
dans l'export Codex data — sans rapport, donc pas de doublon à craindre.)

**Nuance importante** : l'objet cours **assemblé** par l'UI (`_construireObjetCoursV2`,
`trimestre-v2-cours.js:1077-1078) porte déjà deux champs liés à la charge horaire —
`periodesParSemaine` (défaut 4) et `formatHoraire` (défaut `'2x2'`), lus par
`_lireChampsSessionDOM` (l. 1029-1030). Il existe donc **une notion d'heures
hebdomadaires**, mais :
- ces champs vivent sur l'objet cours **assemblé** (clé `cours`), pas sur l'entité
  pure `cours-entite.js` — incohérence de modèle à noter ;
- ils décrivent un **rythme/semaine**, jamais multiplié par les semaines réelles →
  ne produisent aucun total d'heures d'enseignement ;
- ils ne séparent pas contact / travail personnel (cf. §2) ;
- en été, `periodesParSemaine = 4` serait factuellement faux (le rythme intensif
  est bien plus dense), ce qui confirme qu'un **rythme hebdomadaire ne peut pas être
  la source de vérité** — seul le total d'heures d'enseignement l'est.

Le formulaire (`js/trimestre-v2-cours.js`) pour les infos pédagogiques :
- Lecture DOM : `_lireChampsInfosCoursDOM()` (l. 1004-1013) lit `v2-codeCours`,
  `v2-nomCours`, `v2-disciplineCours`, `v2-numeroCompetence`, `v2-competence`,
  `v2-elementsCompetence`.
- Construction objet : `_construireObjetCoursV2()` (l. 1055-1082).
- HTML : inputs `#v2-codeCours`, `#v2-nomCours`, `#v2-numeroCompetence`,
  `#v2-competence` dans `index.html` (l. 6955-6975). Pas de champ heures d'enseignement.

### 4.2 Le « réalisé » n'est compté qu'en jours

`afficherStatistiquesTrimestreV2()` (`js/trimestre-v2.js:19`) parcourt
`calendrierComplet` et compte les jours `statut === 'cours'` / `'reprise'`. Aucune
sommation d'heures. C'est la source des « 24 jours » et de « 5 semaines »
(via `maxSemaine`).

> Note connexe (hors périmètre RREC, à traiter séparément) : la **vue calendaire**
> `js/calendrier-vue.js:469-473` tente de lire `#nombreSemaines`/`#nombreJoursCours`
> — ids **inexistants** (les vrais sont préfixés `v2-`) — et retombe donc toujours
> sur des fallbacks **15/75 codés en dur** (l. 465-466). Bug réel d'affichage, mais
> distinct de la question de conformité ; signalé ici pour mémoire.

### 4.3 Les briques de calcul d'heures existent déjà (réutilisables)

`js/horaire.js` fournit tout le nécessaire — **rien à réinventer** :
- `obtenirSeancesHoraire(coursId)` (l. 100) : séances du groupe-cours actif.
- `obtenirDureePeriode()` (l. 286) : durée d'une période (SSOT
  `modalitesEvaluation.dureePeriodeMinutes`, défaut 55 min).
- `periodesVersHeures(n)` (l. 307) : conversion périodes → heures.
- Chaque séance porte `nombrePeriodes` **et** `duree` (en heures) — cf.
  `js/trimestre-v2-horaires.js:229-235`.

Le maillon ② consiste donc à **sommer** ces durées sur les jours réels de cours,
pas à créer une nouvelle mécanique.

---

## 5. Recommandations de conception (pour décision Cowork)

> Décision déjà prise par Grégoire : champ **heures d'enseignement + pondération** au gabarit.

### Maillon ① — champ au gabarit de cours
- Ajouter `heuresContact` (nombre) comme **source de vérité unique de l'exigence**
  (cf. décision §6). C'est la seule valeur comparée à l'horaire réel.
- Ajouter `ponderation` (ex. `"2-2-3"`) comme **métadonnée de saisie** : elle
  *propose* `heuresContact` (= (théorie+labo) × 15) et *dérive* le repère d'unités
  (= somme × 15 / 45). Jamais valeur de référence (cf. §2, invariant été).
- Le **repère d'unités** est dérivé/affiché, jamais saisi ni normatif.
- Points de greffe : `cours-entite.js` (création + champs modifiables),
  `_lireChampsInfosCoursDOM` + `_construireObjetCoursV2`
  (`trimestre-v2-cours.js`), et le bloc formulaire HTML (`index.html`).
- ⚠️ Préservation des données : champ **optionnel** par défaut (les cours existants
  de Grégoire n'ont pas la valeur) ; pas de migration destructive.

### Maillon ② — calcul des heures d'enseignement réalisées
- Nouvelle fonction (idéalement dans `horaire.js`, près des helpers existants) :
  Σ sur les jours `cours`/`reprise` du calendrier × durée des séances de ce jour
  via `obtenirSeancesHoraire` + `duree`/`periodesVersHeures`.
- Intervalle : **début → fin des cours** (choix de Grégoire), cohérent avec le
  compteur de jours actuel.

### Maillon ③ — indicateur de conformité
- Comparer réalisé (②) vs exigence (①) : afficher « 60 / 60 h ✓ » ou un écart
  « 48 / 60 h — horaire incomplet ? ». C'est ce signal qui aurait révélé la saisie
  d'horaire incomplète du test été 2026.
- Emplacement naturel : la zone stats de la page Conception (sidebar trimestre)
  et/ou l'en-tête de la vue calendaire.

### Hors périmètre (à planifier à part)
- Le bug d'affichage 15/75 de la vue calendaire (§4.2 note) — correctif distinct.
- L'affichage des unités comme libellé descriptif — cosmétique, optionnel.

---

## 6. Décision actée (Grégoire, 29 mai 2026)

**Heures d'enseignement = seule source de vérité de la conformité. Unités = repère affiché.**

- Le **contrôle RREC** se fait exclusivement sur les **heures d'enseignement** (réalisé ②
  vs exigence ①). Aucune autre grandeur n'entre dans le verdict conforme/écart.
- Les **unités** (ex. 2 ⅓) sont un **repère descriptif affiché**, **dérivé** et non
  saisi comme référence. Le travail personnel (3e nombre de la pondération) sert
  uniquement à calculer ce repère d'unités ; il n'intervient jamais dans le contrôle.

Conséquences de conception :
- Le champ de référence au gabarit est **`heuresContact`** (ex. 60). C'est lui qu'on
  compare à l'horaire réel.
- La **pondération** (ex. `"2-2-3"`) reste une métadonnée de saisie pratique : elle
  *propose* `heuresContact` = (théorie + labo) × 15 et *calcule* le repère
  d'unités = (somme des 3) × 15 / 45. Mais une fois `heuresContact` posé, c'est lui
  qui fait foi (cohérent avec l'invariant été du §2).
- Affichage : « Heures d'enseignement : 48 / 60 h » comme indicateur de conformité +
  « ≈ 2 ⅓ unités » comme repère discret, non normatif.
