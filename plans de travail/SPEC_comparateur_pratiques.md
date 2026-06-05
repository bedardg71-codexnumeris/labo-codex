# SPEC — Comparateur de pratiques (phase 1, données démo)

**Date** : 5 juin 2026
**Auteur** : Claude (Cowork) en réflexion avec Grégoire — conception close, 8 questions tranchées (voir `NOTE-COWORK-comparateur-pratiques.md`, source des justifications)
**Destinataire** : Claude Code
**Statut** : ✅ prêt pour planification en lots. AUCUN code avant validation du découpage par Grégoire.
**Succède à** : `SPEC_simulation_pratiques_307.md` — la forme « panneau profil » (§2/§4) est close ; le **moteur** (§3), l'**export** (§5) et les **invariants** (§6) de cette spec restent valables et sont référencés ici plutôt que recopiés.
**Versionnage** : `minor` à la livraison (capacité visible nouvelle).

---

## 1. Vision

Une vue d'aide à la **transition SOM → PAN** : l'utilisateur sommatif voit ce que deviendrait sa pédagogie sous d'autres pratiques, sur des profils-types démo. **Asymétrique par construction** : « ta pratique » (référence) face à « ce que ça deviendrait » (1-2 candidates).

**Principe directeur (Grégoire)** : montrer les effets, pas les faire deviner ; **le chemin qui mène au chiffre importe plus que le chiffre**. L'enseignant doit comprendre que le vrai travail n'est pas de choisir le chiffre qu'il préfère, mais de construire le chemin qui mesure ce qu'il veut mesurer. **Le Comparateur débouche sur l'assistant, pas l'inverse.** Il ne recommande jamais.

**Anti-pattern nommé** : laisser la vue se lire comme un palmarès de générosité (« +14 en PAN ! »). Tout l'agencement (E1-E3, §3) existe pour l'empêcher.

## 2. Décisions actées (réflexion du 5 juin)

| Question | Décision |
|---|---|
| Public | Utilisateur **SOM en exploration** (P1→P3 de l'audit assistant). |
| Référence | **Sa pratique** (SOM typiquement) — pas « la pratique active » neutre. |
| Candidates | **Gabarits prédéfinis** (`pratiques-bibliotheque.js`) + créations de l'utilisateur. Max 2 simulées (+ référence = 3 colonnes). |
| Données | **Démo exclusivement** (phase 1), mode démo actif **requis** ; invitation à l'activer sinon. |
| Profils-types | **4, curés** dans `pack-demo-20` : fort / moyen / en difficulté / irrégulier. Ajuster le pack fait partie du chantier. |
| Disposition | **Hiérarchie** : matrice (vue d'ensemble) → fiche de profil (récit) au clic. Pas de bascule. |
| Contenu | Engagements E1-E2-E3 (§3). |
| Entrée | Bouton dans **Conception → Pratiques de notation** + portes contextuelles. **Pas d'entrée de menu** en phase 1 (zéro contact `config.js`/`navigation.js`). |
| Essais | Pas de statut spécial : créer dans l'assistant sans assigner → la pratique vit dans la bibliothèque. (#320 répertoires = chantier distinct, aucune dépendance.) |
| Trace | **CSV seulement** (spec #307 §5 inchangée). |

## 3. La vue

### 3.1 Matrice (défaut)

- Lignes = 4 profils-types ; colonnes = référence d'abord (marquée « Ta pratique »), puis 1-2 simulées (marquées « Simulation », accent + bordure pointillée — variables du design system, pas de nouvelle couleur).
- Cellule = **note finale** + delta **discret** vs référence (E3 : petit, gris, jamais en vedette).
- **Ligne de garde** sous la matrice (texte fixe) : « Des pratiques différentes mesurent des choses différentes — un écart n'est ni un bonus ni une erreur. »
- **(E1) Chaque colonne porte sa question** : sous le nom et le badge famille (registre — `genererBadgePratiqueHTML`, `pratique-registre.js:132`), une ligne fixe par famille « ce que cette note mesure ». Microcopy de départ (à valider par Grégoire, ton tutoiement non requis ici — texte descriptif) :
  - SOM : « La moyenne pondérée des performances, chacune comptée une fois, au moment où elle a eu lieu. »
  - STD : « Le niveau de maîtrise démontré — les reprises remplacent les premiers essais. »
  - SPE : « Les exigences satisfaites parmi celles annoncées. »
  - (DEN : à ajouter quand la famille sera créable — #318.)
- Sélection des candidates : zone inline (pas de modale — anti-pattern projet), 1-2 sélecteurs peuplés des gabarits + pratiques de la bibliothèque, badge famille par item, `echapperHtml()` sur les noms.

### 3.2 Fiche de profil (au clic sur une ligne)

- **Phrase de contexte écrite à la main** pour chacun des 4 profils démo (livrable de contenu, pas de génération) — ex. : « A raté l'examen de mi-session (poids 30 %) ; maîtrise démontrée sur les productions suivantes. »
- **(E2) Récit de calcul par pratique** : pour chaque pratique, le **sort de chaque résultat** du profil — « compté 30 % » / « remplacé par la reprise » / « écarté (7 meilleurs retenus) » / « non exigé pour le forfait B » / « obligatoire ». Source : la décomposition par famille déjà spécifiée (spec #307 §4.2), re-présentée comme trajectoire résultat par résultat, pas comme tableau de paramètres.
- Retour à la matrice = un clic ; aucun état persisté entre deux ouvertures (éphémère).

### 3.3 Non calculable

Diagnostic **par cellule/colonne** via le mécanisme #128 (`_diagnostiquerNoteNonCalculable`, `profil-etudiant-actions.js:174` — à paramétrer par pratique si nécessaire) ; les autres colonnes calculent. Jamais d'échec global.

### 3.4 Garde démo

Si le mode démo est inactif : la vue n'affiche pas la matrice mais une **invitation** — une phrase sur ce que la vue permet + bouton « Activer les données démo » → `activerModeDemo()` (`demo-activation.js:250` ; bascule `trimestreActif = 'demo'`, réversible, non destructif) → retour direct à la vue. Symétriquement, prévoir le retour (le bandeau démo existant gère déjà la désactivation).

### 3.5 Accessibilité et responsive

Spec #307 §4.3 inchangée : `<th scope="col">`, clavier, cibles ≥ 44 px, 3 colonnes sur iPad (sinon défilement horizontal du seul tableau), deux modes. La fiche de profil reçoit le focus à l'ouverture (règle SPA du projet).

## 4. Profils-types et pack démo

- **Lot de démarrage obligatoire** : passer `simulerIndices(da, pratiqueId)` (`portfolio.js:714`, lecture seule) sur les 20 étudiant·es démo × 3 pratiques de référence ; retenir les 4 profils qui séparent le mieux les pratiques. **Critère dur** : l'« irrégulier » doit produire l'écart signature (échec à fort poids en SOM, maîtrise démontrée ensuite → SOM nettement sous STD/SPE) ; « fort » et « en difficulté » doivent montrer la **convergence** (les PAN ne donnent pas des notes farfelues — rassurant pour le sceptique).
- **Si les contrastes manquent : ajuster `pack-demo-20.js` fait partie du chantier** (décision Grégoire). Respecter l'idempotence du seed (`demo-namespace.js`, flag `demo-version-installee` — incrémenter `_metadata.version`) et l'attribution « Demo Labo Codex ».
- Les 4 profils retenus sont **étiquetés en dur** (DA + libellé + phrase de contexte) dans le module du Comparateur — stables et racontables, pas de détection dynamique.
- ⚠️ Le terme « groupe 9999 » est un vestige : la démo = namespace `demo_*` (cf. NOTE §2). Ne pas réintroduire 9999.

## 5. Moteur, export, invariants (référence à la spec #307)

- **Moteur** : `calculerDetailsNoteFinale(da, pratiqueIdDemande)` (`profil-etudiant-actions.js:403`, câblé jusqu'à la config — PR #28) et `simulerIndices(da, pratiqueId)` (PR #29). **Conservés tels quels** ; le Comparateur est un consommateur.
- **Export CSV** : spec #307 §5 inchangée (horodatage, anonymisation, whitelist Défense D, précédent `bilan-reflexif-csv.js`, `SKILL_Securite_donnees.md` §9). Une colonne par pratique comparée. Sur données démo, l'anonymisation est sans objet mais le chemin d'export reste le chemin validé.
- **Invariants** : spec #307 §6 inchangée — aucune écriture namespacée, pratique active strictement inchangée, test snapshot avant/après. S'ajoute : **aucune écriture dans `demo_*`** non plus (la vue lit ; seul l'ajustement du pack — §4, chantier de seed distinct — écrit, via le mécanisme de version existant).

## 6. Hors périmètre (phase 1)

Vue sur groupe réel (phase 2 — avec réévaluation : entrée de menu Labo, calculabilité PAN sur données purement SOM, option moteur namespace) ; graphique d'évolution ; sortie présentable/capture (CSV suffit — décision Grégoire, chronique explicitement hors champ) ; recommandation ou score de « meilleure pratique » (jamais) ; répertoires de bibliothèques (#320) ; famille DEN (#318).

## 7. Tests

1. **Invariant non-destructif** : snapshot des clés (réelles ET `demo_*`) avant/après une session de comparaison — égalité stricte.
2. **Parité moteur** : pour la pratique de référence, la note affichée dans le Comparateur = la note du panneau profil (mêmes appels).
3. **Divergence** : sur les profils retenus, simuler pratique ≠ référence produit des notes distinctes sur les mêmes artefacts (verrou déjà posé par la sentinelle Lot 2/5 — l'étendre aux 4 profils).
4. Non calculable → diagnostic dans la cellule, les autres colonnes calculent.
5. Garde démo : mode inactif → invitation ; activation → vue fonctionnelle.
6. Export CSV conforme (contenu, whitelist).
7. `cd tests && npm test` + au moins 1 test ajouté par lot livré ; Mac + iPad, modes sombre et clair, validation terrain Grégoire avant push.

## 8. Lots proposés (à valider avec Grégoire avant exécution)

| Lot | Contenu | Effort estimé |
|---|---|---|
| C0 | **Profils-types** : campagne `simulerIndices` sur la démo, sélection des 4 profils, ajustement éventuel de `pack-demo-20`, phrases de contexte (contenu à valider par Grégoire) | 2-4 h (selon ajustement du pack) |
| C1 | **Matrice** : structure de la vue, sélection des candidates, cellules note+delta, E1 (lignes « ce que cette note mesure »), ligne de garde, garde démo (§3.4) | 4-5 h |
| C2 | **Fiche de profil** : récit de calcul E2 (sort de chaque résultat, par famille), phrase de contexte, navigation matrice↔fiche | 4-5 h |
| C3 | **Export CSV** + diagnostic par cellule (#128) | 2-3 h |
| C4 | **Portes d'entrée** : bouton Conception → Pratiques de notation ; coordination #319 Lot 4 (le récap du wizard consomme un **extrait** de C1-C2 — mêmes appels, rendu réduit) | 2 h |
| C5 | **Validation terrain + release `minor`** + changelog (1 entrée utilisateur) + relais | 1-2 h |

**Séquencement** : C0 → C1 → C2 → (C3 ∥ C4) → C5. **Coordination #319** : si Claude Code atteint le Lot 4 de #319 avant C1, implémenter l'extrait du récap comme appel direct au moteur (sans rendu Comparateur) et le raccorder en C4.

## 9. Précautions d'exécution

Rituel de début de session ; charger `SKILL_labo_codex.md` (indices, pratiques) et `SKILL_Securite_donnees.md` (export) ; design system (`design-system.html`, variables, 2 modes) ; `echapperHtml()` sur tout nom de pratique ; `data-action` (zéro handler inline) ; corriger les numéros de ligne de ce document contre le code réel au moment de coder (ils datent du 5 juin 2026).
