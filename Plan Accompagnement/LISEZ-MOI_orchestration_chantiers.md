# LISEZ-MOI — Orchestration des chantiers en cours

**Destinataire** : Claude Code
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Date** : 23 mai 2026
**Statut** : Document maître de coordination — à lire AVANT toute implémentation

---

## 1. Pourquoi ce document existe

Cinq plans coexistent dans le dossier Cowork. Certains se chevauchent, d'autres dépendent les uns des autres. Lus isolément, ils peuvent paraître contradictoires. Lus dans le bon ordre et avec la bonne articulation, ils décrivent un ensemble cohérent de chantiers.

Ce document n'ajoute aucune spec. Il sert uniquement à :

- Établir la hiérarchie des plans (lequel est maître, lequel est subordonné)
- Définir l'ordre d'exécution obligatoire
- Préciser les dépendances entre chantiers
- Établir le processus de validation avec Grégoire entre chantiers

**À lire en entier avant d'ouvrir le premier plan d'implémentation.**

---

## 2. Inventaire des plans actifs

| # | Plan | Rôle | Statut |
|---|---|---|---|
| 1 | `PLAN_chrome_unifie_Labo_Codex.md` | Refonte de l'entête + navigation primaire et secondaire | **EN COURS d'exécution par Claude Code** |
| 2 | `PLAN_uniformisation_Accompagnement.md` | Refonte UI de la page Réglages > Accompagnement + guide ACP | À exécuter après #1 |
| 3 | `PLAN_guides_pedagogiques.md` | **Plan maître** d'architecture du module unifié des guides + contenu des guides Enseignement explicite et PAN | À exécuter après #2 |
| 4 | `PLAN_taxonomie_SOLO.md` | Contenu SOLO (tampons + guide + intégration éditeur d'échelle) | À exécuter après #3 |
| 5 | `PLAN_guide_RaI.md` | Contenu et points d'accès du guide RàI | À exécuter après #3 (en parallèle de #4 possible) |

---

## 3. Hiérarchie et articulation des plans

### Plan maître : `PLAN_guides_pedagogiques.md`

Ce plan est le **document de référence architectural** pour tout ce qui touche aux guides pédagogiques. Il définit :

- L'architecture du module unifié `js/guides-pedagogiques.js`
- La structure de données `GUIDES_PEDAGOGIQUES` commune à tous les guides
- Le panneau HTML générique `#guide-pedagogique-panel`
- Les styles CSS partagés `guide-pedagogique-*`
- Le contenu intégral des guides Enseignement explicite (4 pages) et PAN (4 pages)

Les plans `PLAN_taxonomie_SOLO.md` et `PLAN_guide_RaI.md` restent les sources de référence pour leurs **contenus pédagogiques** (texte des pages), mais leur infrastructure technique est désormais celle décrite dans le plan maître. Concrètement :

- Là où ces plans mentionnent `js/guide-solo.js` ou `js/guide-rai.js`, il faut comprendre **« contenu à insérer dans `js/guides-pedagogiques.js` »**
- Là où ces plans mentionnent des classes CSS `guide-solo-*` ou `guide-rai-*`, il faut utiliser les classes communes `guide-pedagogique-*` du plan maître
- Les fonctions comme `ouvrirGuideSOLO()` ou `ouvrirGuideRai()` deviennent `ouvrirGuidePedagogique('solo')` ou `ouvrirGuidePedagogique('rai')`

### Plan subordonné : `PLAN_uniformisation_Accompagnement.md`

Ce plan introduit un patron CSS commun `.option-accompagnement` réutilisé par les plans suivants. Tous les boutons « Guide » dans la page Accompagnement (SOLO, ACP, RàI) utilisent la classe `.option-accompagnement-guide-btn` définie ici.

Le guide ACP est contenu dans ce plan (§5) — il n'est pas dupliqué dans le plan maître, juste intégré au moment de l'exécution.

### Plans de contenu spécifiques

`PLAN_taxonomie_SOLO.md` couvre trois chantiers liés à SOLO :

1. Les tampons SOLO (SVG livrés dans `svg-solo/`)
2. Le guide SOLO (contenu pédagogique des 5 pages)
3. L'intégration SOLO dans l'éditeur d'échelle de performance (sélecteur niveau cognitif par niveau de performance)

Le chantier 2 s'intègre dans le module unifié du plan maître. Les chantiers 1 et 3 sont indépendants techniquement.

`PLAN_guide_RaI.md` couvre uniquement le guide RàI (contenu pédagogique des 4 pages + points d'accès). Le contenu s'intègre dans le module unifié.

---

## 4. Ordre d'exécution obligatoire

```
ÉTAPE 1 — Chrome unifié (PLAN_chrome_unifie_Labo_Codex.md)
            ↓ (validation Grégoire requise)
ÉTAPE 2 — Uniformisation Accompagnement (PLAN_uniformisation_Accompagnement.md)
            ↓ (validation Grégoire requise)
ÉTAPE 3 — Module guides pédagogiques (PLAN_guides_pedagogiques.md §2)
            ↓ (validation Grégoire requise)
ÉTAPE 4a — Contenus SOLO/RàI/ACP intégrés dans le module unifié
ÉTAPE 4b — Nouveaux guides Enseignement explicite et PAN (PLAN_guides_pedagogiques.md §4 et §5)
            ↓ (validation Grégoire requise)
ÉTAPE 5 — Tampons SOLO et intégration éditeur d'échelle (PLAN_taxonomie_SOLO.md §3 et §5)
            ↓ (validation Grégoire requise)
ÉTAPE 6 — Tests fonctionnels complets, finalisation, commit
```

### Pourquoi cet ordre

**L'étape 2 doit précéder l'étape 3** parce que le module unifié des guides s'appuie sur le patron `.option-accompagnement-guide-btn` introduit par l'uniformisation. Si on inverse, il faudra refaire les boutons.

**L'étape 3 doit précéder l'étape 4** parce qu'on a besoin de l'infrastructure (module + panneau + styles) avant d'y insérer les contenus.

**L'étape 4a précède 4b** parce qu'il est plus prudent de migrer le contenu existant (et validé) de SOLO/RàI/ACP dans le module avant d'y ajouter les nouveaux contenus Enseignement explicite et PAN. En cas de problème, on isole la cause.

**L'étape 5 vient en dernier** parce que les tampons SOLO et l'intégration de SOLO dans l'éditeur d'échelle ne dépendent pas du module des guides — ils peuvent venir après sans bloquer le reste. On les place à la fin pour ne pas mélanger les types de modifications.

---

## 5. Comment lire chaque plan

### `PLAN_chrome_unifie_Labo_Codex.md`

Ce plan est autonome et antérieur aux autres. Si tu travailles déjà dessus, continue sans changement. Il ne dépend de rien et rien ne dépend de lui.

### `PLAN_uniformisation_Accompagnement.md`

Lis intégralement les sections 1 à 4 pour comprendre la doctrine du patron `.option-accompagnement`. La section 5 (guide ACP) sera intégrée à l'étape 4a du présent processus, pas pendant l'uniformisation elle-même. Concrètement :

- Pendant l'étape 2, tu fais l'uniformisation UI mais **tu ne crées pas encore `js/guide-acp.js`**
- Le bouton « Guide » de l'option ACP existe dans le HTML (selon le patron) mais ne fait rien tant que le module unifié n'est pas en place (étape 3)
- À l'étape 4a, le contenu du guide ACP (défini dans `PLAN_uniformisation_Accompagnement.md` §5.2) est intégré dans `GUIDES_PEDAGOGIQUES.acp.pages` du module unifié

### `PLAN_guides_pedagogiques.md`

**C'est le plan maître. Lis-le en premier parmi les trois plans de guides** (SOLO, RàI, guides pédagogiques). La section 2 décrit l'architecture du module unifié — c'est ce que tu implémentes à l'étape 3.

Les sections 4 (Enseignement explicite) et 5 (PAN) contiennent les contenus HTML complets des deux nouveaux guides — à intégrer à l'étape 4b.

Ignore les références à `js/guide-solo.js` ou `js/guide-rai.js` dans les autres plans : ces fichiers ne sont **pas** créés. Tout est dans `js/guides-pedagogiques.js`.

### `PLAN_taxonomie_SOLO.md`

Lis les sections 2 et 4 pour le contenu pédagogique du guide SOLO. **N'implémente pas** les recommandations techniques d'architecture (création de fichiers, classes CSS spécifiques) — elles sont remplacées par le plan maître.

Les sections 3 (tampons SOLO) et 5 (intégration éditeur d'échelle) sont à exécuter telles quelles à l'étape 5. Elles ne dépendent pas du module des guides.

Ignore le fait que ce plan présente trois chantiers comme un ensemble : ils sont désormais séparés temporellement dans le processus (étape 4a pour le contenu du guide, étape 5 pour les deux autres).

### `PLAN_guide_RaI.md`

Lis les sections 2 et 4 pour le contenu pédagogique du guide RàI et les points d'accès. **N'implémente pas** les recommandations techniques d'architecture (création de `js/guide-rai.js`, classes CSS `guide-rai-*`) — remplacées par le plan maître.

L'intégration se fait à l'étape 4a : tu copies le contenu des 4 pages dans `GUIDES_PEDAGOGIQUES.rai.pages` et tu ajoutes les boutons d'accès dans l'Accompagnement et le module Interventions selon le patron uniforme.

---

## 6. Résolution des contradictions apparentes

Si tu rencontres une contradiction entre deux plans, voici la règle de précédence :

1. `LISEZ-MOI_orchestration_chantiers.md` (présent document) **PRIME** sur tous les autres
2. `PLAN_guides_pedagogiques.md` **PRIME** sur les plans de contenu (SOLO, RàI, ACP) pour tout ce qui concerne l'architecture technique
3. `PLAN_uniformisation_Accompagnement.md` **PRIME** sur les autres pour le patron `.option-accompagnement` et la structure de la page Accompagnement
4. Les plans de contenu (SOLO, RàI, ACP) **PRIMENT** sur les autres pour leur contenu pédagogique (texte des pages, références académiques)

### Contradictions connues à signaler

**`PLAN_taxonomie_SOLO.md` mentionne `js/guide-solo.js`** : c'est obsolète. Tout va dans `js/guides-pedagogiques.js`.

**`PLAN_guide_RaI.md` mentionne `js/guide-rai.js`** : idem, obsolète.

**`PLAN_taxonomie_SOLO.md` décrit le bouton Guide dans l'Accompagnement avec une structure ad-hoc** : remplacer par le patron `.option-accompagnement-guide-btn` défini dans `PLAN_uniformisation_Accompagnement.md` §2.

**`PLAN_uniformisation_Accompagnement.md` §5 décrit la création de `js/guide-acp.js`** : à remplacer par l'intégration du contenu ACP dans `GUIDES_PEDAGOGIQUES.acp.pages` du module unifié.

---

## 7. Validation entre étapes — processus

Entre chaque étape majeure, demande validation à Grégoire **avant** de commencer la suivante.

### Validation entre étapes 1 et 2

Après le chantier chrome, démontre à Grégoire :

- L'iPhone affiche correctement l'entête sans chevauchement
- La navigation desktop et mobile fonctionnent comme prévu
- Mode sombre et mode clair OK
- Mode anonymisation et trimestre archivé OK

Une fois validé, commit le chantier chrome avec son propre numéro de beta. Puis passer à l'étape 2.

### Validation entre étapes 2 et 3

Après l'uniformisation, démontre à Grégoire :

- La page Accompagnement présente toutes les options dans le patron uniforme
- Les sous-options conditionnelles fonctionnent (test : décocher SOLO masque les éléments dépendants ; idem RàI, ACP)
- Le pliable « Paramètres avancés RàI » s'ouvre et se ferme correctement
- Tous les boutons « Guide » sont visibles mais inactifs (normal, le module n'existe pas encore)

Commit, puis étape 3.

### Validation entre étapes 3 et 4

Après le module unifié, démontre à Grégoire :

- Le module charge correctement (aucune erreur console)
- Un guide test (par exemple `GUIDES_PEDAGOGIQUES.test`) peut s'ouvrir, naviguer entre pages, se fermer
- Les styles s'affichent correctement dans les deux modes (sombre et clair)

Commit, puis étape 4a.

### Validation entre étapes 4 et 5

Après l'intégration des contenus des cinq guides, démontre à Grégoire :

- Chacun des cinq guides s'ouvre depuis chacun de ses points d'accès
- La navigation entre pages fonctionne
- Les références académiques s'affichent en page 1
- La préférence « Enseignement explicite par défaut » fonctionne correctement (création d'une nouvelle leçon, héritage de la préférence, override local)

Commit, puis étape 5.

### Validation finale

Après les tampons SOLO et l'intégration éditeur d'échelle, démontre :

- Les quatre tampons SVG s'affichent dans la palette quand SOLO est activé
- L'éditeur d'échelle propose un sélecteur de niveau SOLO pour chaque niveau de performance
- Les associations IDME ↔ SOLO suggérées par défaut sont correctes
- Le pictogramme + nom SOLO apparaissent à côté de chaque niveau dans l'éditeur

Commit final.

---

## 8. Rappels — contraintes du projet

Ces contraintes s'appliquent à tous les chantiers du processus. Elles sont issues de `CLAUDE.md` du projet.

### Zones protégées — NE PAS modifier

- `js/config.js` (configuration navigation)
- `js/navigation.js` (logique navigation)
- `noms_stables.json` (registre des noms protégés)

Aucun des cinq plans actifs ne requiert de modification de ces fichiers. Si tu identifies un besoin réel, **arrête et demande à Grégoire** avant de toucher quoi que ce soit.

### Règles de sécurité non négociables

- Tout `innerHTML` qui injecte des données utilisateur doit utiliser `echapperHtml()`
- Aucun handler inline (`onclick=`, `onchange=`, etc.) dans le HTML généré — utiliser `data-action`, `data-on-change`
- Aucun `console.log` de debug dans le code committé — `console.warn` ou `console.error` uniquement
- Tests sécurité automatisés (`cd tests && npm test`) avant tout commit qui touche un module sensible

Aucun des chantiers planifiés ne touche aux modules sensibles (`js/securite-*.js`, `js/import-export.js`, `js/cc-license.js`, CSP). Donc pas de nouveau test Vitest/Playwright requis.

### Conventions de design

- Aucune nouvelle variable de couleur en dur — utiliser les `--variables` CSS existantes de `styles.css`
- Vérifier le contraste WCAG 2.1 AA (4.5:1 texte, 3:1 graphiques) dans les deux modes (sombre et clair)
- Cibles tactiles ≥ 44 × 44 px sur iPad
- Focus clavier visible sur tout élément interactif

### Procédure de commit

À chaque commit :

1. Demander à Grégoire le numéro de beta (ne jamais incrémenter sans validation)
2. Mettre à jour `version.json` à la racine :
   ```json
   { "build": "MMJJ-HHMM", "beta": "XX.X" }
   ```
3. Mettre à jour les fallback dans `index.html` ligne ~17166 :
   ```javascript
   let VERSION_MAJEURE = 'XX.X';
   let BUILD_ID = 'MMJJ-HHMM';
   ```
4. Ajouter une entrée au changelog dans `js/changelog-data.js` (voir chaque plan pour la formulation suggérée — 6-8 items maximum, orientés utilisateur)
5. Tester avant push

---

## 9. Ce que tu trouveras dans le dossier Cowork

À l'ouverture du dossier `/Users/kuekatsheu/Documents/Claude H2026 cowork Labo Codex Application web/`, tu verras :

- **Ce document** : `LISEZ-MOI_orchestration_chantiers.md`
- **Cinq plans** d'implémentation (`PLAN_*.md`)
- **Un dossier** `svg-solo/` contenant :
  - Les quatre fichiers SVG des tampons SOLO prêts à intégrer à l'étape 5
  - Un aperçu HTML pour validation visuelle (`apercu-solo.html`)
  - Les versions de travail (`icon-solo-*.svg`) qui peuvent être ignorées — utiliser les versions `comprehension-*.svg`
- **Un fichier** `INVENTAIRE_icones_Labo_Codex.html` qui documente l'inventaire des icônes (référence, pas d'action requise)

Les SVG des tampons SOLO sont à copier dans le dossier `autocollants/` du projet à l'étape 5 (selon les instructions de `PLAN_taxonomie_SOLO.md` §3).

---

## 10. En cas de doute

Si à tout moment tu identifies :

- Une ambiguïté entre deux plans qui n'est pas résolue par la règle de précédence (section 6)
- Une instruction qui contredit `CLAUDE.md` du projet
- Un besoin de modifier une zone protégée
- Un effet de bord inattendu sur un module non visé par le plan en cours

**Arrête l'implémentation, demande à Grégoire**, et reprends seulement après clarification. Il vaut mieux interrompre que produire un travail qui devra être défait.

---

**Bonne implémentation.**

*Document à conserver dans le dossier Cowork comme référence permanente. Les plans individuels peuvent évoluer ; ce document doit être mis à jour en conséquence si la hiérarchie change.*
