# PLAN — Recadrage du SKILL_Ecosysteme_classe.md

**Date** : 5 juin 2026
**Statut** : proposition à valider — exécution différée (« on verra plus tard », Grégoire). NE PAS toucher au skill avant décision.
**Origine** : en confrontant `SKILL_pratiques_notation.md` et `SKILL_Ecosysteme_classe.md` au corpus GfG/CoP, constat de Grégoire : les skills que lit Claude Code orientent peut-être trop Labo Codex vers SA pratique.

---

## 0. Diagnostic

`SKILL_Ecosysteme_classe.md` mêle **trois registres** sans les distinguer :

- **(M) Monographie** — ta pratique du 601-101 (ELLAC, SOLO/IDME, portfolio 65/35, jetons, SRPNF, 10 cartouches, données A2024). **Asset réel et validé.**
- **(D) Doctrine de l'outil** — ce que Labo Codex incarne, qui **doit** être pluraliste (SOM/STD/SPE/DEN, sans hiérarchie).
- **(R) Recherche / pratique** — le panorama neutre des familles.

**Le problème** : là où (M) se présente comme (D), le skill devient une *source de doctrine* biaisée vers ta pratique. Risque concret : Claude Code, l'utilisant comme guide de construction, produit un outil — et surtout du microcopy — qui valorise STD-portfolio et défavorise implicitement SOM. C'est l'inverse exact de la posture conçue (audit de l'assistant ; Comparateur « ne recommande jamais » ; *Gateways* de Clark « focus on the ideas, not the people who use them » ; *start/stop/continue* de Talbert « stop ungrading absolutism »).

**Passages en cause (preuves)** :
- §1.2 : « PAN » défini comme TA sélection portfolio → **dérive terminologique** (PAN = famille STD/SPE/DEN, pas ta variante).
- §1.2 : binaire « Sommative traditionnelle (problématique) — validité faible » vs « PAN (adoptée) — validité supérieure » → **conviction présentée comme fait universel**.
- §1.2-1.3 : structure 65/35, jetons, SRPNF, « principes directeurs » présentés comme « le système » et non « mon instanciation ».
- Titre / front-matter : « Cadre pédagogique pour l'enseignement de la littérature au collégial » → sonne universel, désigne **un cours**.

**Reframe directeur** : le correctif ne *retire* pas ta pratique, il la **relocalise** — de « le cadre » (ambigument universel) à « l'exemple de référence » (une instanciation riche de la famille STD). Ce rôle est même plus utile : un exemple complet, réel et validé, sert mieux Claude Code ET le futur guide PAN qu'une doctrine implicite.

---

## 1. Principes du recadrage

1. **Préserver la monographie** — ne rien appauvrir de ce qui est vrai et validé. On ajoute des étiquettes de registre, on ne coupe pas la richesse spécifique.
2. **Séparer M / D / R** explicitement dans le document.
3. **La conviction reste tienne** — légitime et motrice (c'est elle qui a fait naître l'outil). On la *localise* comme la position du concepteur, on ne l'efface pas, on ne l'impose pas. (*Gateways* appliqué au projet lui-même.)
4. **PAN = famille** ; ta pratique = la variante **STD-portfolio**.
5. **Marquer l'usage** : ce skill décrit une instanciation ; il NE sert PAS de source de doctrine ni de microcopy hiérarchisant les pratiques. Renvoi vers le panorama neutre.

---

## 2. Les moves de correction (sur le document)

**Move A — Recadrer l'identité** (front-matter + titre + intro)
- Portée reformulée : « Instanciation de référence (cours 601-101) d'une PAN par standards — la pratique de Grégoire Bédard », et non « le cadre pédagogique ».
- Encadré d'usage en tête : « Ce skill documente UNE pratique parmi celles que Labo Codex doit servir. Il ne définit pas la doctrine de l'outil, qui est pluraliste (SOM/STD/SPE/DEN, sans hiérarchie). Ne pas en tirer de microcopy qui valorise une famille au détriment d'une autre. Panorama des familles : `SKILL_pratiques_notation` §2 bis. »

**Move B — Désamorcer la posture partisane** (§1.2)
- Garder la conviction, la marquer comme telle : « Pourquoi *j'ai* choisi une PAN par standards dans MON contexte » plutôt que « PAN (adoptée) supérieure / SOM problématique ».
- Requalifier les jugements de validité présentés comme faits : « dans mon contexte, pour mes objectifs » + une phrase pluraliste explicite (la sommative reste un choix légitime que l'outil sert sans jugement).

**Move C — Corriger la terminologie PAN** (partout)
- « PAN » = libellé de famille (décision Session A). Renommer les occurrences où « PAN » désigne en réalité ton STD-portfolio.

**Move D — Distinguer générique et spécifique**
- *Transférable* (reste) : ELLAC, SOLO, droit à l'erreur, principes de rétroaction (commenter le travail, pas l'élève ; sans superlatifs ; etc.).
- *Propre à ton cours* (étiqueté « exemple de cette instanciation », pas « le système ») : structure 65/35, 4 meilleurs + 2 terminaux, nombre de jetons, les 10 artefacts, SRPNF×IDME.

**Move E — Rafraîchir les poussières datées**
- §6.4 « Beta 99 → 1.0 » (fait, 1.x livré) ; données limitées à A2024 (A2025/H2026 existent) ; nombre de chroniques (incohérent entre skills).

**Move F — Carte de coordination inter-skills**
- Tableau « qui dit quoi » : Ecosysteme = monographie STD ; `pratiques_notation` §2 bis = panorama recherche + écarts code ; `labo_codex` §5 = aperçu des familles ; (futur) panorama neutre = doctrine pluraliste.

---

## 3. Phase systémique — l'enjeu réel que tu as soulevé

Le problème dépasse Ecosysteme : « *ces* skills » orientent vers ta pratique. **Inférence à vérifier** (je n'ai pas encore lu ces skills en entier) : la même dérive « ma pratique = le système » peut exister dans `SKILL_labo_codex` §5, `SKILL_Alignement`, `SKILL_RaI`, et l'ancien `SKILL_pratiques`.

Action proposée : **audit léger de l'ensemble des skills** contre une règle d'or unique —

> Tout skill doit distinguer ce qui est **instanciation** (la pratique de Grégoire), **doctrine de l'outil** (pluraliste) et **recherche** (neutre). Aucun ne doit présenter une pratique particulière comme la bonne.

Livrable de cette phase : une note « registres des skills » + corrections ciblées là où la dérive existe.

---

## 4. Risques du recadrage lui-même

- **Sur-neutralisation** : diluer la monographie en généralités tièdes = perte sèche d'un asset. Garde-fou : on étiquette les registres, on ne coupe pas le spécifique.
- **Désync inter-skills** : 3-4 documents qui se renvoient peuvent dériver. Garde-fou : une seule source par registre, renvois plutôt que copies.
- **Tension préservée (ne pas lisser)** : Grégoire a bâti l'outil DEPUIS sa conviction que les PAN valent mieux ; l'outil doit servir des enseignants qui ne la partagent pas. Le plan ne tranche pas cette tension — il la *localise* : la conviction est celle du concepteur (légitime, motrice), pas une doctrine imposée par l'outil.

---

## 5. Séquencement

1. **`SKILL_pratiques_notation` §2 bis d'abord** (déjà proposé) — il crée le panorama (R) vers lequel Ecosysteme renverra. Sans lui, le recadrage d'Ecosysteme n'a pas de cible de renvoi.
2. **Recadrage d'Ecosysteme** (moves A-F) — après le §2 bis.
3. **Audit systémique** (phase 3) — après la vague #319 / Comparateur, à froid.

---

## Décisions qui te reviennent (différées)

1. Va-t-on jusqu'à **renommer la portée** du skill (« instanciation de référence » au lieu de « le cadre ») ?
2. Le **panorama neutre (R)** vit où : dans le §2 bis du skill technique (option 1 d'hier) ou dans un **3ᵉ skill dédié** (option 3) que tous pointent ?
3. L'**audit systémique** des autres skills : maintenant, ou après #319/Comparateur ?
