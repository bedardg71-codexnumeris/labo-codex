# RELAIS — Session d'alignement pédagogique du 6 août 2026

> **Consigne de démarrage** pour la prochaine instance.
> Branche : `claude/pedagogical-alignment-mindmap-qa60a4` (NON mergée dans main).

---

## 1. Prémisse à vérifier au rituel de début

| Élément | Valeur attendue |
|---------|-----------------|
| Branche | `claude/pedagogical-alignment-mindmap-qa60a4` |
| Version | **1.37.0** |
| Vitest | **1478/1478** |
| Dernier ID BACKLOG | **#402** (aucun item numéroté créé ce jour) |
| `main` | à `74ba81c` + 2 commits docs — **la branche du 6 août n'y est pas** |

⚠ Playwright WebKit non exécutable dans le conteneur (limite connue) → CI à la PR.

---

## 2. Ce qui s'est passé le 6 août

Mode de travail : **développement piloté par la pratique** (inauguré le 4 août,
poursuivi ici). Grégoire aligne son cours 601-101 pour A2026 ; chaque friction
rencontrée devient un correctif au fil de l'eau. **En parallèle**, un document
de méthode se construit — il est la seconde livraison de la session, à parité
avec le code.

### Livré — 9 releases, 1.31.22 → 1.37.0

| Version | Objet |
|---------|-------|
| 1.32.0 | **F1** — l'objectif de leçon devient visible dans la carte ; il migre de `planification_seances` (clé nue, partagée, dictionnaire plat) vers `noeud.metadata` ; badge 🎯 promu en bascule |
| 1.32.1 | L'Organisateur suit la même source (8 sites laissés derrière) + cache-busting oublié |
| 1.33.0 | Retrait des **notes de leçon** (champ + export + import Markdown + CSS) |
| 1.33.1 | Badges d'alignement effacés au repli d'un objectif (ordre d'appel) |
| 1.34.0 | Objectifs au **pluriel** — liste d'objets **porteurs d'un id** |
| 1.35.0 | Boutons **+ / −** sur chaque objectif |
| 1.35.1 | Boutons absents de la ligne d'accueil + espace resserré |
| 1.35.2 | **Hauteur d'en-tête mesurée** au lieu d'une constante (les activités chevauchaient le titre) |
| 1.36.0 | **Poignée de redimensionnement** (feuilles) + retrait des boutons « Copier » |
| 1.36.1 | La poignée était plafonnée par `max-width: 240px` |
| 1.37.0 | **Option B** — largeur plancher sur les conteneurs |

Sentinelles neuves : `sentinelle-objectif-lecon-metadata.test.js` (42 cas),
`sentinelle-poignee-redimension-noeud.test.js` (21 cas).
**28 break-tests** ROUGE → VERT au total.

### Les trois régressions du jour (toutes de mon fait, toutes corrigées)

Elles ont une cause commune — **une structure partagée modifiée sans auditer
ses consommateurs** :

1. 8 sites d'`organisateur.js` laissés sur l'ancienne clé après la bascule des
   objectifs → auraient affiché des objectifs vides et réécrit dans une clé
   morte.
2. `sauvegarder()` appelé **avant** `reconstruireDOM()` → les badges de
   validation, posés par `appendChild`, étaient effacés aussitôt.
3. `LAYOUT_HEADER_H = 45` — constante devenue fausse quand l'en-tête est devenu
   variable → les activités chevauchaient le titre.

Aucune n'a été trouvée par les tests ; **les trois par une capture d'écran de
Grégoire**. À retenir : sur ce module, le rendu ne se valide qu'à l'œil.

---

## 3. Le document de méthode — la seconde livraison

`docs/utilisateur/METHODE-ALIGNEMENT.md`

Il consigne la démarche réelle d'un enseignant qui aligne son cours, et en
extrait progressivement une méthode générale. Sa **convention de lecture** est
le cœur du dispositif :

- **▣ GÉNÉRAL** — vaut pour tout enseignant ; candidat à devenir instruction
- **▢ PARTICULIER** — propre à Grégoire / 601-101 ; illustratif, jamais prescriptif
- **◈ OUVERT** — non tranché ; à résoudre par l'usage, pas par déduction

**Règle de promotion** : un élément ne passe de ▢ à ▣ que si l'on peut dire
*pourquoi* il vaudrait pour un enseignant d'une autre discipline.

**À tenir à jour à chaque session d'alignement.** C'est un document vivant, et
il est daté : les décisions y portent leur date parce que le vocabulaire de
l'enseignant dérive.

### Décisions structurantes prises le 6 août

- La **séquence** est une unité **logique** (plancher pratique : la semaine, pas de plafond).
- Le regroupement au-dessus sera une **séquence de séquences** (récursivité), pas un nouveau type.
- L'**objectif de leçon est un maillon**, pas une étiquette : les objectifs forment une chaîne convergeant vers la compétence terminale.
- Les objectifs vivent **au niveau de la leçon**, un point.
- **Cours ≠ leçon** : le cours est l'objet disciplinaire au programme, la leçon ce qui est délivré en classe.
- La **période mesure**, elle ne contient pas — le temps d'enseignement déborde par nature.
- Les types seront **renommables** ; l'outil raisonne sur la structure, pas les étiquettes.
- **On déplace dans le temps ce qui a une place au calendrier, on compose dans la carte ce qui a une place dans une leçon.**

---

## 4. Ce qui attend la prochaine session

### Chantier principal — le planificateur en grille

**→ `plans de travail/PLAN-planificateur-grille-2026-08-06.md`**

Plan écrit, non commencé. 7 décisions prises, 4 questions à trancher avant le
lot 1, 3 lots livrables séparément. **Lire ce plan avant toute chose** si le
chantier est repris.

### Queues plus petites

| Sujet | État |
|-------|------|
| **Séquences de séquences** | Tranché (voie A), non livré. À faire **avant** le lot 2 de la grille |
| **Liens objectif → activité** | Piste ouverte ; le modèle est prêt (objectifs porteurs d'ids) |
| **#367** — `planification_seances` | Toujours ouvert, mais **allégé** : l'objectif en est sorti, les notes ont disparu. Ne restent que les rétroactions d'activité |
| **Niveaux cognitifs des objectifs** | Convergence relevée : les verbes de Grégoire (Appliquer, Identifier, Formuler) sont déjà dans `BANQUE_VERBES`. Piste, non tranchée |
| **Skill Alignement à mettre à jour** | 5 écarts listés (D1-D5, §4.3 du document de méthode). À faire **à la fin** du chantier, pas au fil de l'eau |

### Portes terrain non fermées

- La poignée au **doigt sur iPad** (28 px, sous les 44 px recommandés).
- Le **glisser de nœuds au tactile** (préexistant : événements souris seulement).
- L'ajout/retrait d'objectifs **au milieu** d'une liste, pas seulement à la fin.
- Redimensionner **en étant dézoomé** (c'est là que le calcul du zoom se prouve).

---

## 5. Trois pièges rencontrés ce jour — à ne pas refaire

1. **`release.mjs` lancé depuis `tests/`** → échec silencieux, commit parti sans
   bump ni cache-busting. **Trois fois.** Toujours depuis la racine, ou en
   chemin absolu.
2. **Cache-busting oublié** → Grégoire ne voyait aucun changement malgré un
   `git pull`. Tout fichier touché doit voir son `?v=` bumpé dans `index.html`.
3. **Travail invisible parce que sur la mauvaise branche.** Grégoire était sur
   `main`. Si un changement « n'apparaît pas », vérifier dans l'ordre : branche,
   `pull`, `?v=`.

---

## 6. Ce qu'il faut avoir compris avant de coder

Ce module se conçoit **en marchant**. Les décisions ne viennent pas d'une
spécification mais de l'usage réel, et elles se corrigent quand l'usage les
contredit — l'option A pour la poignée avait été retenue sur mon analyse, une
seule capture l'a invalidée.

Deux conséquences pratiques :

- **Ne pas anticiper.** Ce qui n'a pas été demandé par une friction ne se
  construit pas. Mais **ne pas se fermer la porte** non plus : les objectifs ont
  été stockés avec un identifiant dès le premier jour, ce qui rendra les liens
  possibles sans migration.
- **Proposer, ne pas décider seul.** Les choix de conception appartiennent à
  Grégoire. Le travail consiste à instruire la décision — vérifier au code,
  nommer le coût, comparer les options — puis exécuter ce qu'il tranche.
