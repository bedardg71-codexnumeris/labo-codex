# ADR-005 : Échelle IDME plutôt que notation numérique classique

**Statut** : Acté rétroactivement
**Date de décision originale** : septembre-octobre 2025 (avant le démarrage du repo) — formalisation : 14 mai 2026
**Auteur** : Grégoire Bédard

---

## Contexte

La notation au cégep est traditionnellement numérique (0 à 100 %, ou par lettre A-B-C-D-E). Ce système :
- **Compresse** l'information formative : un 72 % et un 74 % apparaissent comme presque identiques alors qu'ils peuvent recouvrir des compréhensions très différentes.
- **Communique mal le diagnostic pédagogique** : une note à 65 % ne dit pas si l'étudiant comprend des points isolés sans liens, ou s'il a une compréhension globale partielle.
- **Détourne l'attention** vers l'arithmétique de la note plutôt que vers la qualité de la compréhension.

Le projet Labo Codex s'inscrit dans une pratique d'observation et de suivi formative inspirée de :
- La **taxonomie SOLO** (Biggs & Collis, 1982) — cinq niveaux qualitatifs de complexité de compréhension : préstructurel, unistructurel, multistructurel, relationnel, abstrait étendu.
- Les pratiques de **rétroaction formative continue** (Hattie & Timperley, 2007).
- La **recherche-action** menée par l'auteur sur 7 ans de pratique de l'enseignement explicite.

L'enjeu : trouver une échelle qui (a) reflète la taxonomie SOLO de façon lisible pour les enseignants non-spécialistes, (b) puisse être convertie en pourcentage pour les besoins administratifs, (c) reste cohérente entre cours et entre enseignants.

---

## Décision

**Adopter l'échelle IDME à quatre niveaux** :

| Niveau IDME | Lettre | SOLO correspondant | Pourcentage canonique | Sens pédagogique |
|---|---|---|---|---|
| **I**nsuffisant | I | Préstructurel + Unistructurel | 40 % | Incompréhension ou compréhension superficielle |
| **D**éveloppement | D | Multistructurel | 65 % | Points pertinents sans liens |
| **M**aîtrisé | M | Relationnel | 75 % | Compréhension globale avec liens |
| **É**tendu | É | Abstrait étendu | 100 % | Transfert à d'autres contextes |

**Note** : la table de conversion exacte (pourcentages canoniques 40/65/75/100) est paramétrable par l'enseignant via `db.getSync('niveauxEchelle', ...)`. La table effective de Grégoire est conforme à la canonique (validé par sous-audit 1.2).

L'échelle IDME est l'**unité de mesure de référence** pour :
- Les évaluations critériées (chaque critère reçoit un niveau IDME).
- Le calcul des indices A-C-P.
- Le diagnostic croisé.
- La conversion vers les notes finales numériques (via les pratiques de notation modulaires, cf. ADR-001 et `docs/decisions/2025-11-systeme-pratiques.md`).

---

## Conséquences

### Positives

- **Lecture diagnostique immédiate** : un I, D, M ou É communique un état de compréhension, pas un score arithmétique.
- **Compatibilité administrative** : conversion en pourcentage automatique selon la table effective.
- **Convergence inter-enseignants** : deux enseignants qui adoptent IDME parlent la même langue formative, même avec des disciplines différentes.
- **Compatibilité SOLO** : assise théorique solide pour expliquer le système (à la direction, aux collègues, aux étudiants).

### Négatives

- **Discrétisation** : la perte de granularité par rapport à un score continu est volontaire mais peut paraître réductrice à un enseignant habitué à attribuer 72 vs 74 %.
- **Mapping non bijectif vers les pourcentages** : un même niveau IDME couvre une plage de scores (M = 75-84 %), donc l'application choisit une valeur canonique (75 %) pour les calculs — décision documentée mais à surveiller (les enseignants qui veulent attribuer 80 % doivent passer par un critère ou un mécanisme distinct).
- **Vocabulaire à enseigner** : le sigle IDME et son lien avec SOLO doivent être expliqués à chaque nouvel enseignant.

### Neutres

- **L'échelle IDME stricte au niveau global** (tous les critères à M pour niveau M, tous à É pour niveau É) reste une option pédagogique en discussion, reportée au 14 mai 2026 (voir mémoire `project-idme-logique-niveau-global`).

---

## Alternatives considérées

### Option A : Notation numérique 0-100 % classique

**Écartée** parce qu'elle entretient la confusion entre note arithmétique et état de compréhension, sans valeur pédagogique ajoutée.

### Option B : Échelle binaire (Acquis / Non-acquis)

Plus simple. **Écartée** parce qu'elle écrase trop d'information formative — un étudiant en multistructurel et un étudiant en préstructurel finissent dans la même case « non-acquis » alors que leurs besoins d'intervention sont très différents.

### Option C : Échelle SOLO native à 5 niveaux

Aurait été le plus orthodoxe. **Écartée** parce que la distinction préstructurel / unistructurel est cliniquement difficile à opérationnaliser pour un enseignant non-spécialiste — l'amalgame dans « Insuffisant » a été jugé acceptable.

---

## Références

- Biggs, J. B., & Collis, K. F. (1982). *Evaluating the Quality of Learning: The SOLO Taxonomy*.
- `.claude/skills/ecosysteme-classe/SKILL.md` — cadre pédagogique du projet.
- `README.md` §"Taxonomie SOLO" — tableau IDME ↔ SOLO.
- Audit annuel 2026, sous-audit 1.1 Traçabilité — matrice 40 concepts.
- Mémoire utilisateur `project-idme-logique-niveau-global` (14 mai 2026, reportée par Grégoire).

---

## Notes de révision

À réviser si :
- La règle IDME stricte au niveau global est adoptée (réécrirait le mécanisme de calcul du niveau global).
- Un enseignant tiers demande une 5e ou 6e graduation pour une discipline particulière.

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
