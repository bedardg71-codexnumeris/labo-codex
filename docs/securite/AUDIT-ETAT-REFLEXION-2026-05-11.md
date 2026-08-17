# Audit de l'état de la réflexion sur la sécurité de Labo Codex

> **Date** : 11 mai 2026 (Beta 99.40, build b0510-1500)
> **Auteur** : Claude (Cowork), à la demande de Grégoire Bédard
> **Périmètre** : `docs/securite/` (~6 200 l. cumulé) + `.claude/skills/securite-donnees/SKILL.md` + `docs/architecture/PLAN2-PHASE1-SPEC.md`
> **Méthode** : croisement docs ↔ code réel (cartographie des 102 modules JS) ↔ skills métier
> **Angle** : prospectif Voûte — anticiper les défis architecturaux avant que la Phase 2 ne soit codée
> **Statut** : diagnostic + ébauche de plan, à la base d'un futur plan de sécurité détaillé

---

## Synthèse exécutive

### Verdict global

La réflexion sécurité de Labo Codex est **mature pour un projet de cette taille**. `MODELE-MENACES.md` (1792 l.) est un threat model d'excellente facture — précis sur le code, scénarios bien construits, plan livré méthodique. Les 4 docs `PROTECTION-*.md` (~2 800 l. cumulé) forment une trilogie cohérente (chiffrement, versioning, anonymisation) plus un singleton transversal (fichiers d'export). Le `.claude/skills/securite-donnees/SKILL.md` (532 l.) sert de source de vérité interne et est correctement référencé par les autres docs.

**Phase 0 livrée intégralement le 6 mai** (7 défenses, 6 commits sur `main` en une journée) et **Défenses A + I livrées le 8 mai** (sandbox iframe + suite de 29 tests). C'est un acquis réel, vérifié par 9 vecteurs d'évasion tous bloqués et par un audit a priori sur les bibliothèques (0 trouvaille suspecte au 6 mai).

### Trois forces

1. **Threat model ancré dans le code** : les scénarios D-01, X-01, I-01 citent les bons fichiers et lignes (`import-export.js:21, 66, 221, 275` ; `grilles-bibliotheque.js:77, 91, 125` ; `db.js:766, 788` etc.). Pas un threat model abstrait.
2. **Phase 0 sous-estimée en effort réel** : 12-18 jours estimés, ~5 h réels. Indicateur que le code est bien factorisé et que la sanitisation centralisée (`assainirObjet`) est un bon point d'attache.
3. **Audit innerHTML productif** : a trouvé un **vrai XSS LIVE** dans `cc-license.js:genererBadgeCC` (5 champs non échappés interpolés dans le badge CC, appelé par les 4 modales d'import). Corrigé au commit suivant. La méthode d'audit fonctionne.

### Trois faiblesses

1. **Trois surfaces réelles absentes de la cartographie §3 du `MODELE-MENACES.md`** : import MD planification (`organisateur.js:parserPlanMD` l. 1942), jetons de reprise multi-appareil (clé `evaluationId`), couche `memoryCache` de `db.js`. Voir §4 ci-dessous.
2. **Angle mort structurel sur Safari** : `showDirectoryPicker` n'existe pas dans Safari (Mac + iPad). Toutes les défenses FSAPI (Défense D, scénario D-03) **ne s'appliquent pas dans le workflow principal de Grégoire** (Safari file://). Le `BENCHMARK-OBSIDIAN.md` §9 le pointe mais aucune conséquence n'est tirée dans le modèle de menaces ni dans la cartographie code.
3. **Spec Voûte (PLAN2-PHASE1-SPEC.md) muette sur 3 décisions architecturales lourdes** : stockage (serveur centralisé vs fédéré), hébergement (TI cégep / GitHub / autre), rôles humains (modérateurs, comité). Le format de partage est bien spécifié, l'infrastructure qui l'accueillera ne l'est pas.

### Cinq décisions architecturales à prendre avant la Voûte

Détaillées au §6. En résumé :

| # | Décision | Bloque |
|---|---|---|
| **D1** | Voûte serveur centralisée ou fédérée (P2P, GitHub, fichiers signés) ? | Toute architecture Phase 2 |
| **D2** | Signature ECDSA en Phase 1 Voûte ou repoussée en Phase 2 ? | Défense F (anti-usurpation U-01) |
| **D3** | Annuaire des clés publiques : centralisé / TOFU / WoT ? | Confiance dans `auteur.nom` |
| **D4** | Modération humaine : auto / humaine / mixte ? Qui modère ? | Défense L, gouvernance |
| **D5** | Mot de passe utilisateur pour chiffrement local : opt-in ou jamais ? | PROTECTION-DONNEES-CHIFFREMENT-REPOS Phase 1 entière |

---

## 1. Cartographie de la surface d'attaque réelle (depuis le code, 10 mai 2026)

Section construite à partir de la lecture directe des modules concernés. Référence à `fichier.js:ligne` quand l'information est précise. Les écarts avec ce que la doc affirme sont signalés en gras.

### 1.1 Ingress (où entrent les données externes)

| Surface | Module:ligne | Validation | Couvert par doc ? |
|---|---|---|---|
| Import codex `.codex.zip` | `codex.js:452` `chargerCodex()` | `validerZipSecurite` + `validerMagicBytes` blobs | ✅ MODELE-MENACES §3.2 |
| Import codex data `.codex-data.json` | n'existe pas (format pas implémenté) | n/a | ✅ §3.3 dit « futur Plan 2 » |
| Import jetons de reprise | `codex.js` parse `evaluationId` dans ZIP | aucune validation spécifique | **❌ non couvert** |
| Import MD planification | `organisateur.js:1942` `parserPlanMD` | parser regex, **aucun schéma** | **❌ non couvert** |
| Import blob image/PDF | `travaux-import.js:35` `validerMagicBytes` | PNG/JPEG/PDF/WebP/HEIC magic bytes | ✅ §3.2 et I-02 |
| Hydratation FSAPI au boot | `reserve.js:1066` `_hydrateManifesteDepuisFSAPI` | `JSON.parse` direct, **pas de schéma** | partiel §3.4 |
| Drag-drop travaux | implicite, passe par `validerMagicBytes` | OK | ✅ §3.5 |

**Écart 1 — Import MD planification non documenté.** `parserPlanMD()` (`organisateur.js:1942`) est un parser regex maison qui lit le format markdown utilisateur (séquences `[Séquence | Sem. X–Y]`, leçons `[Leçon | durée]`) et appelle `planificationCarte.injecterNoeuds()` pour écrire dans la carte mentale. Aucune validation de schéma. Les titres parsés sont rendus en HTML par `planification-carte.js` (40 occurrences `innerHTML` selon audit). C'est un canal d'ingestion **codé aujourd'hui** qui contourne complètement le pipeline `assainirObjet`. À ajouter au threat model.

**Écart 2 — Jetons de reprise non documentés.** Les jetons (champ `evaluationId` sur fichiers) sont importés via `chargerCodex()` comme des fichiers spéciaux. La modale de doublons offre « Appliquer comme jeton de reprise », et la réassociation propose l'option « Jeton de reprise » dans le sélecteur. C'est un mécanisme de **partage entre appareils** (mémoire projet `project_jetons_fichiers.md`) qui n'apparaît pas dans la cartographie §3 du MODELE-MENACES. Surface de partage codée, non analysée.

### 1.2 Persistance (où les données vivent)

| Stockage | Module | Données |
|---|---|---|
| `localStorage` (< ~5 Mo) | `db.js:302` `_setLocalStorage` | Petites clés, préférences, cache sync |
| `IndexedDB` (jusqu'à plusieurs Go) | `db.js` (store `keyvalue` dans `MonitoragePedagogique`) | Grosses clés (h2026_fichiersTravaux ~3.8 Mo, evaluationsSauvegardees ~1.2 Mo) |
| `memoryCache` (Map JS) | `db.js:57` | Fallback quand quota localStorage dépassé. **Perte au rechargement de page.** |
| `FileSystemDirectoryHandle` | `db.js:766` `storeFSAPIHandle` → IDB store `handles` | Pointer vers `Monitorage_Travaux`, `Archives_LaboCodex` |
| Flag `fsapi_persistance_handles` | localStorage, en clair | Contrôle la persistance des handles FSAPI |

**État du chiffrement** : **aucun**. Tout est en clair dans localStorage + IndexedDB. La couche `db.js` accepte n'importe quel `JSON.stringify`-able sans transformation. Confirmé.

**Écart 3 — memoryCache non listé en §3.6.** La cartographie des couches transverses mentionne db.js mais pas le 3e niveau memoryCache. C'est une nuance importante pour D-03 (D-03 cible IDB et FSAPI ; un payload qui itère `db.keyvalue` ne voit pas les clés en memoryCache). Bénin mais à compléter.

**Écart 4 — flag FSAPI en clair.** Défense D (révocation FSAPI par défaut + opt-in) est livrée, mais le toggle est piloté par `fsapi_persistance_handles` en localStorage **en clair**. Un payload qui contrôle le JS peut le flip avant la prochaine session. Pas dans D-03 C1 du modèle de menaces.

### 1.3 Egress (où les données sortent)

| Sortie | Module:ligne | Validation export | Sceau / signature |
|---|---|---|---|
| Export Codex ZIP | `codex.js:819` `genererCodex` | `validerCodex` avant export | **Pas de sceau livré** |
| Verser à la Réserve (ZIP v1) | `reserve.js:1240+` | `validerStructureZip` (Défense K) | hash SHA-256 dans meta.json |
| Verser à la Réserve (FSAPI v1.5) | `reserve.js:1206` `_ecrireVersementDirect` | idem | hash SHA-256 |
| Export Codex data | n'existe pas | n/a | n/a |
| Exports CC (PDF, JSON) | `cc-license.js` + modules biblio | Défense H (sceau SHA-256) sur **2 types seulement** : configuration-complète + tampons | partiel |
| Synthèse rétroaction PDF | `travaux-export-pdf.js` (html2canvas rasterisé) | contient noms d'étudiants en clair | hors périmètre actuel |
| Partage individuel biblio | retiré sauf pour `pratiques-gestion.js` | n/a | n/a |

**Écart 5 — Défense H (sceau SHA-256) partiellement livrée par rapport à PROTECTION-FICHIERS-EXPORT.md.** Le doc D propose le hash sur **tous** les exports JSON (Phase A, 1 jour). Le code a livré la fonctionnalité sur 2 types seulement (configuration-complète et tampons). Les exports Codex et Réserve ont leur propre mécanisme de hash dans `meta.json` (cohérent avec SKILL §4.3) mais les exports CC individuels (grilles, échelles, cartouches, productions) **ne sont pas scellés**. Phase A doc D n'est pas terminée.

### 1.4 Surface XSS

| Métrique | Valeur (audit 6 mai) |
|---|---|
| Modules avec `innerHTML` | 67 sur 112 |
| Occurrences `.innerHTML =` totales | 699 |
| Catégorisées « statiques » | 517 |
| Catégorisées « sécurisées » (`echapperHtml` ligne courante ou suivantes) | 57 |
| Catégorisées « suspectes » (interpolation sans échappement détecté) | **125** |
| Vrais XSS trouvés à l'audit ciblé (22 cas examinés) | **5** (tous dans `cc-license.js:genererBadgeCC`) |
| Faux positifs sur les 22 cas | 17 |
| `eval`, `new Function`, `setTimeout(string)` | **0 occurrence** |

**Top 5 modules par occurrences `.innerHTML`** : `trimestre-v2.js` (57), `evaluation.js` (52), `travaux-ui.js` (50), `planification-carte.js` (40), `productions.js` (39).

**Écart 6 — La doc cible la migration `innerHTML → textContent`, mais la stratégie réelle est différente.** L'audit du 6 mai a montré que sur 22 cas examinés, 17 sont des faux positifs. Migration unitaire à 103 cas restants serait coûteuse pour peu de gain. La stratégie effective adoptée — qui n'est **pas formalisée** dans MODELE-MENACES Défense E — est : **sandbox iframe (Défense A) comme défense en profondeur générique + migration ciblée seulement sur les modules qui rendent du contenu importé**. Recalibrage de Défense E à documenter.

### 1.5 CSP réelle vs documentée

**CSP actuelle dans `index.html`** (telle qu'observée par l'agent code) :
```
default-src 'self';
script-src 'self' 'sha256-1tomo64F3gr/x4SLsGiKrU+vB3+2ULQdooxMT0v8oNQ=';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: file:;
worker-src 'self' blob:;
```

**CSP documentée dans MODELE-MENACES §3.6** :
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
worker-src 'self' blob:;
```

**Écart 7 — désynchro CSP**. Deux ajouts manquants dans la doc :
- `'sha256-1tomo64F3gr/...'` : hash du `MESSENGER_SCRIPT` livré avec Défense A (8 mai). Documenté en §I-01 P1 mais pas en §3.6.
- `file:` dans `img-src` : ajouté pour les SVG locaux dans le sandbox iframe (Safari file://). Idem, mentionné en §I-01 P1 mais pas en §3.6.

À mettre à jour dans MODELE-MENACES.md §3.6 et §I-01 C5 pour cohérence.

---

## 2. Matrice surface × couverture × écart × statut Voûte

Légende :
- **Couvert** : ✅ couvert, ⚠️ partiel, ❌ absent
- **Fidélité** : ✅ OK, ⚠️ dérive de code, ❌ fausse ou périmée
- **Calibration risque** : ⚖️ juste, ↑ sur-estimé, ↓ sous-estimé
- **Statut Voûte** : 🟢 couvert, 🟡 lacune anticipée, 🔴 décision bloquante

| Surface | Couverture doc | Fidélité au code | Calibration | Implémentabilité contre-mesure | Statut Voûte |
|---|---|---|---|---|---|
| **Import codex ZIP** | ✅ MODELE §3.2, scénarios D-04, I-03 | ✅ | ⚖️ | livrée (validerZipSecurite, Défense P unification tampons) | 🟢 réutilisable |
| **Import MD planification** | ❌ absent | n/a | ↓ ignoré | facile (ajouter schéma) | 🟡 lacune |
| **Import jetons de reprise** | ❌ absent | n/a | ↓ ignoré | hérité du pipeline codex ZIP | 🟡 lacune |
| **Import blob image/PDF** | ✅ I-02 | ✅ (mais WebP fix non mentionné) | ⚖️ | livrée (validerMagicBytes), re-encodage prévu Phase 2 | 🟡 médias Voûte v2 |
| **FSAPI hydratation au boot** | ✅ §3.4, D-03 | ✅ | ⚖️ | livrée (Défense D opt-in) | 🟢 indépendant Voûte |
| **localStorage / IDB en clair** | ✅ PROTECTION-CHIFFREMENT | ✅ | ⚖️ | non livrée, Phase 1 ~3-4 sem | 🔴 décision D5 |
| **memoryCache** | ❌ non listé en §3.6 | n/a | ↓ bénin | n/a | 🟢 |
| **Flag FSAPI en clair** | ⚠️ implicite D-03 C1 | ⚠️ nuance manquante | ↓ | ajouter sceau ou marqueur | 🟡 |
| **Export Codex ZIP** | ✅ §3.2, X-02 | ✅ | ⚖️ | livrée K whitelist | 🟢 |
| **Export Réserve** | ✅ SKILL §5, MODELE §3.4 | ✅ | ⚖️ | livrée K + H | 🟢 |
| **Export CC individuel** | ⚠️ PROTECTION-FICHIERS Phase A | ⚠️ sceau partiel | ⚖️ | compléter Défense H sur 4 types | 🟡 prérequis Voûte |
| **Synthèse rétroaction PDF** | ❌ absent du modèle | n/a | ↓ ignoré | re-évaluer (noms étudiants en clair) | 🟡 lacune |
| **Surface `innerHTML` 125 suspects** | ✅ I-01, Défense E | ✅ | ⚖️ | sandbox iframe livrée 8 mai, migration ciblée plutôt que globale | 🟢 |
| **CSP `script-src` durcie** | ⚠️ désynchro §3.6 | ❌ doc périmée | ⚖️ | mettre à jour doc | 🟢 |
| **Voûte — format de partage** | ✅ PLAN2-PHASE1-SPEC | ✅ (spec papier) | ⚖️ | 7h estimées (3 modules ~650 l.) | 🟢 spec mature |
| **Voûte — auth auteur** | ⚠️ champ `auteur.nom` texte | n/a (pas codé) | ↓ | Défense F ECDSA, 2-3 sem code + gouvernance | 🔴 décision D2, D3 |
| **Voûte — modération** | ⚠️ SKILL §6.2 (6 questions ouvertes) | n/a | ⚖️ | Défense L, gouvernance | 🔴 décision D4 |
| **Voûte — révocation / kill list** | ⚠️ MODELE Défense G | n/a | ⚖️ | 1 sem + maintenance | 🔴 dépend D4 |
| **Voûte — hébergement** | ❌ spec muette | n/a | n/a | n/a | 🔴 décision D1 |
| **Voûte — collision IDs** | ✅ SKILL_integrite_globaux AP-1 | ⚠️ spec dit « ré-attribuer à l'import » mais détaille pas | ⚖️ | re-générer IDs avec préfixe `PARTAGE_*` à l'import | 🟢 pattern connu |
| **Anonymisation codex data** | ✅ PROTECTION-ANONYMISATION | ⚠️ format pas codé | ⚖️ | Phase 1 3-4 sem | 🟡 bloque exports VOUTE riches |
| **Versioning / snapshots** | ✅ PROTECTION-VERSIONING | ⚠️ pas codé | ⚖️ | Phase 1 3-4 sem | 🟢 indépendant Voûte |
| **Chiffrement au repos** | ✅ PROTECTION-CHIFFREMENT | ⚠️ pas codé | ⚖️ | Phase 1 3-4 sem + UX mot de passe | 🔴 décision D5 |

**Synthèse de la matrice** :
- 6 surfaces 🟢 entièrement couvertes et solides
- 8 surfaces 🟡 avec lacunes anticipables (à corriger avant Voûte ouverte)
- 5 surfaces 🔴 décisions bloquantes (humaines/gouvernance, pas techniques)
- 3 surfaces ❌ absentes de la doc (MD planification, jetons, synthèse rétroaction PDF)

---

## 3. Validation des sources de vérité

### 3.1 .claude/skills/securite-donnees/SKILL.md ↔ docs/securite/

`.claude/skills/securite-donnees/SKILL.md` (26 avril 2026, 532 l.) est antérieur aux docs `docs/securite/` (rédigés autour du 6 mai 2026, ~6 000 l.).

**Relation effective** :
- Les 4 docs `PROTECTION-*` étendent le skill : ils prennent un thème du skill (chiffrement, anonymisation, versioning, fichiers) et le détaillent en architecture complète. Pas de contradiction majeure.
- `MODELE-MENACES.md` étend aussi : le skill avait 8 scénarios M1-M8 textuels, le modèle en a 14 (4 D + 2 X + 3 I + 3 U + 2 C) avec récits narratifs et plan de défense.
- `BENCHMARK-OBSIDIAN.md` est nouveau (pas dans le skill) — comparaison externe.

**Source de vérité après évolution** : le skill reste le **document de référence court** (résumé des règles opérationnelles, classification 4 niveaux, 16 règles code). Les docs sont les **références d'architecture détaillées** par chantier. Aucun à supprimer, mais une note de coordination en tête du skill (« voir docs/securite/PROTECTION-* pour détails ») clarifierait.

**Une vraie tension** : le skill §6.2 liste 6 questions de gouvernance Voûte. Le PLAN2-PHASE1-SPEC.md ne les reprend pas et ne les résout pas. Le `MODELE-MENACES.md` §U-01 défense P1 dit « plusieurs mois pour la mise en place de l'annuaire et de la gouvernance ». Le sujet est mentionné partout mais nulle part traité. Voir §6.2 de ce rapport.

### 3.2 MODELE-MENACES.md ↔ code réel

**Forces** :
- Citations `fichier:ligne` globalement correctes (dérive 2-7 lignes due à l'évolution du code entre 6 mai et 10 mai)
- `§3.1.bis` audit comparatif 6 bibliothèques : très précis, validé par le code
- §4 cartographie destruction : tableau précis avec lignes de code

**Désynchros / écarts** :

| Section | Écart | Sévérité |
|---|---|---|
| §3.6 CSP | hash sha256 + `file:` manquants | mineure (cosmétique mais peut induire en erreur) |
| §X-02 fiche | « Statut défense : Aucun » contredit §6 récap « Bon (K) » | **moyenne** (incohérence interne) |
| §I-03 statut | « Bon » mais P1 normalisation Unicode non livrée — devrait être « Partiel » | mineure |
| §I-02 cause racine | ne mentionne pas la faille WebP magic bytes corrigée récemment | mineure |
| §D-03 cause racine | nuance manquante sur le flag `fsapi_persistance_handles` en localStorage clair | moyenne |
| Lignes citées | dérive 2-7 lignes (ex. `db.js:773` vs réalité `db.js:766`) | mineure (dette de fraîcheur) |

**Surfaces manquantes en §3** : import MD planification, jetons de reprise, memoryCache (cf. §1.1 et §4 ci-dessous).

### 3.3 Cohérence interne des docs

Trois incohérences relevées :

1. **§X-02 fiche vs §6 récap MODELE-MENACES** (cité ci-dessus) — la fiche du scénario n'a pas été mise à jour après la livraison Défense K du 6 mai.
2. **§I-03 statut « Bon » vs P1 non livrée** — devrait être « Partiel » jusqu'à ce que la normalisation Unicode/URL des paths ZIP soit appliquée.
3. **CSP §3.6 vs §I-01 C5** — deux endroits du même doc décrivent la CSP différemment.

Aucune contradiction entre docs distincts. Les `PROTECTION-*` sont mutuellement cohérents (`PROTECTION-ANONYMISATION` table de correspondance chiffrée par la clé maître de `PROTECTION-CHIFFREMENT-REPOS` ; les snapshots de `PROTECTION-VERSIONING` sont chiffrés si chiffrement actif).

---

## 4. Surfaces réelles non couvertes par la doc actuelle

### 4.1 Import MD planification

`organisateur.js:1942` `parserPlanMD(texte)` est un parser regex maison qui lit le markdown utilisateur :
- Marqueurs `[Séquence | Sem. X–Y]` → nouveau nœud séquence
- Marqueurs `[Leçon | durée]` → nouveau nœud leçon
- Reste : nom, objectif, évaluation, notes — stockés bruts

Le contenu parsé est ensuite injecté dans la carte mentale via `window.planificationCarte.injecterNoeuds()` (`planification-carte.js`). Ce module fait **40 occurrences `innerHTML`** selon l'audit du 6 mai. Aucune sanitisation centralisée n'est appliquée entre le parser et le rendu.

**Vecteur d'attaque réaliste** : un enseignant partage un plan markdown contenant `[Leçon | 60min]\nObjectif: <img src=x onerror="...">`. Importé par un collègue, le payload s'exécute lors du rendu de la leçon dans la carte.

**Impact** : équivalent à I-01 (XSS stocké). Probabilité : faible aujourd'hui (canal de partage de plans MD pas très utilisé), mais **canal de partage légitime** existant qui contourne le pipeline ZIP/`assainirObjet`.

**Recommandation** : ajouter un schéma `SCHEMAS_IMPORT.planMD` et appeler `assainirObjet` sur les nœuds avant injection. À discuter pour ajout au MODELE-MENACES.md comme scénario I-04 court.

### 4.2 Jetons de reprise multi-appareil

Le système de jetons (mémoire projet `project_jetons_fichiers.md`) permet de :
- Importer un fichier comme jeton de reprise (champ `evaluationId`)
- Réassocier un fichier comme jeton via le sélecteur
- Marquer une évaluation comme reprise (`estReprise: true`, badge « À réévaluer »)

C'est un **canal de partage entre appareils du même utilisateur** : exporter un codex sur le Mac, l'importer sur l'iPad avec jetons. Mais c'est aussi un canal de partage **entre utilisateurs** si Grégoire partage un jeton à un collègue (cas légitime : « voici la reprise de l'étudiant X »).

Le mécanisme passe par le pipeline `chargerCodex()` donc bénéficie de `validerZipSecurite`. Mais le champ `evaluationId` est lu sans validation de format, et les fichiers importés comme jetons peuvent avoir des métadonnées personnalisées.

**Impact** : faible aujourd'hui (validation ZIP couvre l'essentiel). Mais à clarifier : si la Voûte ouvre un mécanisme de « publication de jetons de reprise comme exemples pédagogiques », nouvelle surface à valider.

**Recommandation** : ajouter une mention en §3.2 du MODELE-MENACES, sans scénario dédié pour l'instant.

### 4.3 FSAPI ≠ Safari (angle mort structurel)

**`BENCHMARK-OBSIDIAN.md` §9** pointe que Safari (Mac + iPad) **ne supporte pas** la File System Access API. `showDirectoryPicker` n'existe pas dans Safari. Apple n'a pas annoncé d'engagement public sur cette API ; seul OPFS est implémenté.

**Conséquences pour le workflow réel de Grégoire** :
- Grégoire utilise **Safari sur Mac et iPad** (workflow file://)
- Sur Safari, la Réserve FSAPI est **inopérante** : seul le mode ZIP v1 fonctionne (téléchargement manuel)
- Sur Safari, le dossier Travaux FSAPI est **inopérant** : pas de stockage disque permanent pour les blobs
- Défense D (révocation FSAPI par défaut + opt-in) **n'a aucun effet visible sur Safari** parce que les handles FSAPI n'existent pas
- Scénario D-03 (effacement disque via FSAPI rémanent) **ne s'applique pas dans le workflow Grégoire** mais s'applique aux utilisateurs Chrome/Edge

**Implication pour l'audit** : le MODELE-MENACES traite FSAPI comme une surface universelle ; en réalité, c'est une surface **conditionnelle au navigateur**. Cette nuance n'apparaît qu'en §9 du benchmark, jamais dans la cartographie §3 du modèle ni dans `.claude/skills/securite-donnees/SKILL.md`.

**Question structurelle à trancher** (citée dans benchmark §9.4) :
> Quel navigateur cible Labo Codex ? Safari only (cohérent avec workflow Grégoire, mais alors `reserve.js` et `travaux-stockage.js` doivent avoir un fallback ZIP pleinement supporté) ou multi-navigateurs (asymétrique, à documenter clairement pour les futurs utilisateurs) ?

**Recommandation** : décision architecturale à prendre au plus tôt. Si Safari only → simplifier le code FSAPI (juste un fallback élégant), revoir la priorité des défenses FSAPI. Si multi-navigateurs → documenter explicitement que Safari = mode dégradé pour FSAPI.

### 4.4 memoryCache (3e couche db.js)

`db.js:57` `memoryCache = new Map()` est le 3e niveau du stockage hybride. Quand une clé dépasse le quota localStorage et que l'utilisateur n'a pas IDB disponible (rare), elle reste en mémoire jusqu'au rechargement de la page.

Le MODELE-MENACES §3.6 mentionne db.js mais traite localStorage + IDB. memoryCache n'est pas listé. C'est bénin (un payload dans le contexte JS y a accès comme aux autres) mais sa présence change la cartographie de destruction §4 : un effacement IDB ne touche pas memoryCache, donc un payload qui veut vraiment tout détruire doit aussi viser `db._memoryCache` ou recharger la page.

**Recommandation** : mentionner en §3.6 et §4. Bénin mais pour complétude.

### 4.5 Codex data référencé mais inexistant

Le format `.codex-data.json` (codex anonymisé pour la recherche) est référencé dans :
- `.claude/skills/labo-codex/SKILL.md` §3 (tableau des 4 concepts de données)
- `.claude/skills/securite-donnees/SKILL.md` §3.2 (anonymisation)
- `MODELE-MENACES.md` §3.3 (« futur Plan 2 »)
- `PROTECTION-DONNEES-ANONYMISATION.md` (architecture complète proposée)
- `docs/architecture/ECOSYSTEME-DONNEES.md` (présumément)

**Réalité du code** (confirmée par l'agent code) : **aucune fonction d'export ou d'import codex data n'existe**. Le format n'est pas implémenté.

Pas un écart de sécurité, mais une dette de cohérence documentaire. Quand quelqu'un (Grégoire, un futur contributeur, une IA) lit la doc, il croit que le format existe. Si quelqu'un d'autre commence à coder l'import codex data en lisant `PROTECTION-DONNEES-ANONYMISATION.md`, il risque d'écraser la conception qui doit venir d'abord.

**Recommandation** : ajouter une mention claire « format non implémenté au [date] » dans les docs concernés.

---

## 5. Statut effectif des défenses livrées (au 10 mai 2026)

État réel, croisé avec les commits sur `main` :

| Code | Défense | Statut | Référence livraison |
|---|---|---|---|
| **A** | Sandbox iframe pour aperçu d'imports | ✅ livrée 8 mai | `feature/securite-defense-a-sandbox`, 5 commits, 9 vecteurs d'évasion bloqués |
| **B-α** | Sanitisation profonde imports (6 bibliothèques) | ✅ livrée 6 mai | commit `f9f6865` |
| **B-β** | Passage obligé `ajouter*ALaBibliotheque` | ⏳ en suspens | Pré-requis : modéliser `pratique.configuration` |
| **C** | Wrapper destructif `localStorage.clear` / IDB / FSAPI | ❌ non livrée | Phase 1, 1-2 sem |
| **D** | Révocation FSAPI par défaut + opt-in | ✅ livrée 6 mai | commit `d0a0903`, toggle UI dans Réglages > Sécurité |
| **E** | Migration `innerHTML → textContent` ciblée | ⏳ partielle | Audit 6 mai a fait Phase 1, 22 cas examinés ; reste 103 (non bloquants grâce à A) |
| **F** | Signature ECDSA + annuaire | ❌ non livrée | Dépend décisions D2, D3 |
| **G** | Kill list + quarantaine | ❌ non livrée | Phase 2 |
| **H** | Sceau SHA-256 sur exports | ⚠️ partiellement livrée (6 mai) | commit `404b924` ; **2 types couverts** (config-complète + tampons) sur 6 attendus |
| **I** | Suite de tests automatisés (29 tests) | ✅ livrée 8 mai | `feature/securite-defense-i-tests`, branche fusionnée |
| **J** | Hook pré-commit (`innerHTML`, db.set sensibles) | ✅ livrée 6 mai | commit `48c1a2d`, `scripts/hooks/pre-commit` ~165 l. |
| **K** | Whitelist structure ZIP/JSON sortants | ✅ livrée 6 mai | commit `0218d07`, 4 pipelines branchés |
| **K-β** | Preview UI contenu export avant download | ⏳ en suspens | Suite UX |
| **L** | Modération humaine Voûte | ❌ non livrée | Dépend D4 |
| **M** | Diff visuel à l'import (collisions par contenu) | ❌ non livrée | Phase 2 |
| **N** | Renforcement CSP avec nonces | ❌ non livrée | Phase 2, test Safari requis |
| **O** | Re-encodage images au canvas | ❌ non livrée | Phase 2 |
| **P-α** | Sanitisation tampons (canal isolé) | ✅ livrée 6 mai | commit `a9eadae` |

**Bilan** : 8 défenses ✅ livrées, 3 ⚠️ partielles, 8 ❌ non livrées. Couverture solide sur l'ingestion (B, D, J, K, P-α) et la sortie (H, K). Lacunes structurelles : signature (F), wrapper destructif (C), modération (L), kill list (G), re-encodage images (O), CSP nonces (N).

---

## 6. Décisions architecturales bloquantes pour la Voûte

Cette section regroupe les arbitrages à prendre **avant** que le code Phase 2 de la Voûte démarre. Séparation technique / humain.

### 6.1 Décisions techniques

#### D1 — Stockage de la Voûte : centralisée, fédérée, ou par fichiers signés ?

**Spec actuelle** : muette. Le format `labo-codex-partage-v1` est défini, mais l'infrastructure qui l'accueillera ne l'est pas.

**Options** :
- **(a) Voûte serveur centralisée** : un serveur HTTPS qui héberge les packages, validés à l'upload. Avantage : modération possible, annuaire des clés publiques centralisé, statistiques d'usage. Inconvénient : infrastructure à maintenir, dépendance institution garante (TI cégep / autre).
- **(b) Voûte fédérée** (modèle ActivityPub / Matrix) : plusieurs serveurs interopérables. Avantage : résilience, pas de point unique. Inconvénient : complexité gouvernance × N, signature et annuaire fédérés.
- **(c) Voûte par fichiers signés** (modèle Obsidian community plugins via GitHub) : pas de serveur, partage par téléchargement de ZIP signés depuis un repo GitHub officiel. Avantage : zéro infrastructure, vérification par hash + signature GitHub. Inconvénient : pas de modération en temps réel, pas de statistiques, moins ergonomique.

**Implication sur la sécurité** :
- (a) requiert Défense L (modération) + Défense F (signature) + auth utilisateur
- (b) requiert tout (a) + protocole fédéré
- (c) requiert signature GitHub + processus de PR/review

**Recommandation pour la décision** : la décision dépend du modèle économique (qui maintient ?) et du modèle de gouvernance (qui décide ?). À discuter avec partenaires institutionnels (AQPC, cégep, ministère ?) avant de coder.

#### D2 — Signature ECDSA en Phase 1 Voûte ou en Phase 2 ?

**Spec actuelle** (`PLAN2-PHASE1-SPEC.md`) : le manifest contient `auteur.nom` en clair. La signature ECDSA est reportée à « après ».

**Conséquence** : Phase 1 Voûte ouvre **sans** protection anti-usurpation (scénario U-01). Un attaquant peut publier sous le nom de Robert Tremblay sans aucune vérification.

**Options** :
- **(a) Signer dès Phase 1** : ajouter la signature au manifest avant ouverture. Coût : +2-3 sem code, gestion de la première paire de clés par utilisateur.
- **(b) Phase 1 sans signature, Phase 2 avec** : ouvrir la Voûte aux pilotes invités d'abord (cercle de confiance), signer plus tard.
- **(c) TOFU pur** (Trust On First Use) : à l'import, l'app mémorise la clé publique du premier package signé par Marie-Hélène. Tout package ultérieur signé par une clé différente sous le même nom est rejeté. Pas d'annuaire central.

**Recommandation pour la décision** : (b) est tenable pour un pilote restreint mais **doit avoir une date butoir explicite** avant ouverture multi-cégep (sinon U-01 devient une faille connue exploitable). (c) est intermédiaire et plus simple à coder.

#### D3 — Annuaire des clés publiques : centralisé / TOFU / WoT ?

**Lié à D1 et D2**. Si (a) Voûte centralisée → annuaire centralisé naturel. Si (c) fichiers signés via GitHub → annuaire = `keys.json` dans le repo. Si TOFU → pas d'annuaire, chaque utilisateur mémorise les clés rencontrées.

**Compromis** :
- Centralisé : autorité claire pour révocation, point d'attaque unique
- TOFU : zéro infrastructure, mais pas de récupération si Marie-Hélène perd sa clé privée
- Web of Trust : les enseignants se signent mutuellement (modèle PGP), résilient mais complexe

**Recommandation pour la décision** : commencer par TOFU + annuaire optionnel `keys.json` dans un repo public. Évoluer si besoin.

#### D4 — Modération : auto / humaine / mixte ? Qui modère ?

**SKILL_Securite_donnees §6.2** liste 6 questions de gouvernance. Aucune n'est résolue dans les docs.

**Aspects à trancher** :
- Modération **automatique** : tous les packages passent par `assainirObjet` strict + sandbox iframe + audit XSS automatique. Suffisant pour les attaques techniques (D-01, I-01) mais pas pour les attaques sociales (U-01, contenu offensant).
- Modération **humaine** : un comité valide chaque dépôt. Robuste mais ne passe pas à l'échelle.
- Modération **mixte** : automatique d'abord, humaine sur signalement.

**Qui modère ?** : un admin Labo Codex (Grégoire seul au début ?) ; un comité communautaire ; l'institution garante ; vote par les utilisateurs ?

**Recommandation pour la décision** : un seul modérateur initial (Grégoire) pour le pilote, avec délégation au fur et à mesure. Pas de comité avant 10+ utilisateurs actifs.

#### D5 — Chiffrement local : opt-in avec mot de passe ou jamais ?

**`PROTECTION-DONNEES-CHIFFREMENT-REPOS.md`** propose 3 phases de chiffrement IndexedDB avec dérivation de clé par mot de passe (Phase 1) ou Touch ID (Phase 2). Coût UX : saisie mot de passe à chaque ouverture de session.

**Question fondamentale** : Grégoire veut-il gérer un mot de passe ?

**Conséquences** :
- **Si oui** : protection en cas de vol de la machine (en plus de FileVault), au prix d'une friction UX et d'un risque de perte définitive si oubli mot de passe + perte phrase de récupération.
- **Si non** : les données restent en clair localement. FileVault macOS protège déjà contre le vol physique de la machine. Le chiffrement applicatif protégerait surtout contre un compromis du compte (session ouverte non verrouillée, mais cas couvert par responsabilité utilisateur).

**Argument pour ne pas chiffrer** : duplication avec FileVault (qui est universel sur macOS moderne), friction quotidienne pour un gain marginal sur le workflow réel. À discuter.

**Recommandation pour la décision** : **trancher D5 avant de coder Phase 1 chiffrement**. Si la réponse est « pas maintenant », économiser 3-4 semaines d'effort et libérer la priorité pour les chantiers Voûte.

#### D6 — Safari only ou multi-navigateurs ?

Voir §4.3. Décision structurelle qui affecte FSAPI, tests Playwright, et la calibration de la priorité des défenses FSAPI.

#### D7 — IDs à l'import Voûte : conserver ou ré-attribuer ?

`PLAN2-PHASE1-SPEC.md §9` ouvre cette question. La recommandation de la spec est « conserver à l'import + ré-attribuer en cas de collision Phase 3 ». 

Compatible avec `.claude/skills/integrite-globaux/SKILL.md` AP-1 (préfixer à la conception, pas en runtime). À confirmer : préfixe `PARTAGE_*` à l'import dans tous les cas, plutôt que conserver l'ID original avec collision potentielle.

**Recommandation pour la décision** : **préfixer à l'import** systématiquement. Décollement de l'ID Voûte et de l'ID local. Simple, conforme au skill, élimine la classe d'anti-pattern AP-1.

### 6.2 Décisions humaines / légales / gouvernance

Décisions qui ne peuvent pas être tranchées par Claude ou par le code. Elles bloquent ou cadrent les décisions techniques précédentes.

#### G1 — Avis Loi 25 : pseudonymisation réversible acceptable, ou anonymisation irréversible obligatoire ?

**Source** : `PROTECTION-DONNEES-ANONYMISATION.md` §10.1 et §12 Q1 ; `.claude/skills/securite-donnees/SKILL.md` §3.1.

**Conséquence si « irréversible » imposée** : retirer la table de correspondance, simplifier le module, mais Grégoire perd la possibilité de corriger un export après publication.

**Action recommandée** : consultation directe avec un responsable de la protection des renseignements personnels au niveau réseau collégial (SRAM, ministère, CPVP).

#### G2 — Consentement étudiant pour la recherche : requis et sous quelle forme ?

**Source** : `.claude/skills/securite-donnees/SKILL.md` §8 question 3 ; `PROTECTION-DONNEES-ANONYMISATION.md` §10.3.

**Action** : avis CER (comité d'éthique de la recherche) + position de l'institution. Bloque la Voûte « codex data » mais pas la Voûte « bibliothèques pédagogiques » (qui n'a pas de données étudiantes).

#### G3 — Propriété intellectuelle des grilles créées dans le cadre de l'emploi

**Source** : `.claude/skills/securite-donnees/SKILL.md` §8 question 5.

**Conséquence** : qui peut publier dans la Voûte ? L'enseignant seul ? Avec accord du cégep ?

**Action** : avis du syndicat enseignant + position des conventions collectives applicables.

#### G4 — Hébergement de la Voûte : qui héberge, qui paie, qui contrôle ?

**Source** : `.claude/skills/securite-donnees/SKILL.md` §6.2 questions 4 et 5.

**Liée à D1**. Si serveur centralisé, qui ? AQPC ? Un cégep ? Le ministère ? Un consortium ?

**Action** : démarches auprès des partenaires potentiels. Sans réponse, D1 ne peut pas être tranchée.

#### G5 — Modération de la Voûte : qui modère, sur quelles règles, avec quel recours ?

**Source** : `.claude/skills/securite-donnees/SKILL.md` §6.2 questions 1, 2, 3, 6.

**Liée à D4**. À documenter dans un `MODELE-CONFIANCE.md` (recommandé par `BENCHMARK-OBSIDIAN.md` §8) **avant** ouverture Voûte. Inclut : procédure de signalement, autorité de décision, droit d'appel, révocation d'accès.

#### G6 — Continuité de la Voûte en cas de disparition de l'institution garante

**Source** : `.claude/skills/securite-donnees/SKILL.md` §6.2 question 5.

**Conséquence** : plan de migration des données et des clés publiques si Labo Codex change de mainteneur ou de financement. Important pour la confiance des contributeurs.

---

## 7. Écarts prioritaires (top 12)

Classés par : **gravité × probabilité × proximité Voûte**. Distinction entre :
- 🔥 **À corriger immédiatement** (bug actif ou désynchro grave)
- ⚙️ **À corriger avant Voûte** (prérequis pour Phase 2)
- 📐 **À intégrer dans plan global** (sans urgence)

### 🔥 À corriger immédiatement

**E1. Désynchros internes MODELE-MENACES** (effort : 30 min)
- §X-02 fiche dit « Aucun », §6 récap dit « Bon (K) » — mettre à jour la fiche
- §I-03 statut « Bon » → « Partiel » jusqu'à livraison P1 (normalisation Unicode)
- §3.6 CSP : ajouter le hash sha256 messenger et `file:` dans img-src
- §I-02 : ajouter mention de la faille WebP magic bytes corrigée
- §D-03 C1 : ajouter nuance sur le flag `fsapi_persistance_handles` en clair
- Lignes citées : rafraîchir db.js:773 → 766 et autres dérives

**E2. Cohérence documentaire codex data « format non implémenté »** (effort : 15 min)
- Ajouter mention « format non implémenté au 10 mai 2026 » dans `SKILL_labo_codex` §3, `SKILL_Securite_donnees` §3.2, `MODELE-MENACES` §3.3, `PROTECTION-ANONYMISATION` introduction. Évite qu'un futur contributeur croie que le format existe.

### ⚙️ À corriger avant Voûte

**E3. Ajouter import MD planification au MODELE-MENACES** (effort : 2 h)
- Nouveau scénario I-04 court : « XSS via plan MD partagé »
- Cause racine : `parserPlanMD` n'applique pas `assainirObjet`
- Défense : ajouter schéma `SCHEMAS_IMPORT.planMD` + `assainirObjet` avant `injecterNoeuds`

**E4. Compléter Défense H (sceau SHA-256) sur les 4 types d'exports restants** (effort : 1 jour)
- Aujourd'hui : config-complète + tampons
- À ajouter : grilles individuelles, échelles, cartouches, productions
- Prérequis pour interopérabilité Voûte (Phase A doc D complète)

**E5. Décider D5 (chiffrement local) avant d'engager 3-4 semaines** (effort : conversation)
- Si « non » : économie significative, retirer le chantier du plan
- Si « oui » : prioriser la dérivation de clé et l'UX de mot de passe d'abord

**E6. Décider D6 (Safari only vs multi-navigateurs)** (effort : conversation + tests rapides)
- Affecte la calibration de toutes les défenses FSAPI
- Affecte l'effort de tests cross-browser pour la Voûte

**E7. Décider D1-D4 (architecture Voûte)** (effort : démarches institutionnelles, mois)
- Bloque toute Phase 2 Voûte qui dépasse le format de partage
- Démarches AQPC / cégep / ministère / syndicat à entamer maintenant

**E8. Rédiger `MODELE-CONFIANCE.md`** (effort : 1 jour) 
- Recommandé par `BENCHMARK-OBSIDIAN.md` §8.3
- Documente les cercles de confiance Labo Codex (personnel → partage informel → Voûte)
- Prérequis pédagogique avant ouverture Voûte

**E9. Compléter Défense E migration `innerHTML`** sur les modules `evaluation.js`, `wizard-pratique-v2.js`, `evaluations-apercu.js` (effort : 1-2 sem selon résultats d'audit scripté)
- Audit du 6 mai a couvert les modules d'import, pas ceux d'aperçu interne
- Sandbox A protège l'import, pas l'aperçu interne
- Refléter la **stratégie réelle** (sandbox + migration ciblée, pas migration globale) dans MODELE-MENACES Défense E

### 📐 À intégrer dans plan global

**E10. Mentionner jetons de reprise et memoryCache** dans la cartographie §3 (effort : 30 min)
- Pas de scénario nouveau, juste compléter la liste

**E11. Synthèse rétroaction PDF — contient des noms d'étudiants** (effort : audit 30 min puis décision)
- Rasterisée html2canvas → PDF
- Si le PDF est destiné à l'étudiant lui-même : OK
- Si le PDF peut être partagé entre collègues : à anonymiser
- Clarifier l'usage attendu

**E12. Décider G1-G6 (volet humain)** (effort : démarches au long cours)
- Aucune urgence technique mais conditionne le périmètre fonctionnel de la Voûte
- À entamer en parallèle des chantiers techniques

---

## 8. Ébauche de plan de sécurité (orientation, pas plan détaillé)

Cette section esquisse l'ordre de bataille suggéré par le diagnostic. C'est un point de départ pour la conversation, pas un plan détaillé.

### Pilier 1 — Fermeture des écarts immédiats (1-2 jours)

Actions E1, E2, E10 ci-dessus. Mise à jour de la doc pour qu'elle reflète l'état du code au 10 mai. Aucun nouveau code.

### Pilier 2 — Prérequis Voûte (4-6 semaines, parallélisable)

Actions à mener avant ouverture Voûte, indépendamment des décisions de gouvernance :
- E3 — Schéma + sanitisation import MD planification (1-2 jours)
- E4 — Compléter Défense H sceau SHA-256 (1 jour)
- E8 — Rédiger `MODELE-CONFIANCE.md` (1 jour)
- E9 — Audit + migration ciblée `innerHTML` sur modules aperçu (1-2 sem)
- **Défense C** — Wrapper destructif localStorage/IDB/FSAPI (1-2 sem) — protège contre D-01 + D-03 résiduels
- **Implémentation PLAN2-PHASE1-SPEC** — 3 modules `partage-*.js` (~7 h selon spec)

Total : 3-4 semaines code + parallèle gouvernance.

### Pilier 3 — Chantiers de fond (8-12 semaines, après décisions D5, D6, D7)

Selon ce que tu décides :
- **Si D5 = chiffrement** : Phase 1 chiffrement (3-4 sem)
- **Si Versioning prioritaire** : Phase 1 snapshots (3-4 sem) — protège contre destruction même si chiffrement absent
- **Anonymisation Phase 1** : seulement après G1 (avis Loi 25), 3-4 sem
- **Tests Défense I** : maintenance continue, ajouter 1 test par défense livrée

### Pilier 4 — Voûte ouverte (dépend des décisions humaines)

- **Défense F signature ECDSA** : 2-3 sem code, démarre quand D2, D3 tranchées
- **Défense L modération** : démarre quand G5 + D4 tranchées
- **Défense G kill list** : démarre après ouverture Voûte (besoin retours d'incidents)
- **Annuaire des clés publiques** : démarre quand D1, D3 tranchées

### Pilier 5 — Maintenance permanente

- Audit trimestriel des bibliothèques (script `audit-bibliotheques-securite.js` déjà existant)
- Audit `innerHTML` semestriel ou à chaque release majeure
- Revue de ce document à chaque évolution majeure (nouveau format, Voûte ouverte, accès étudiant)
- Veille sur les dépendances (Chart.js, JSZip)

### Séquencement suggéré

| Mois | Actions principales |
|---|---|
| **Mois 1 (mai-juin 2026)** | Pilier 1 (fermeture écarts immédiats) + démarche D5, D6, D7 + ouverture démarches G1-G6 + début Pilier 2 |
| **Mois 2 (juin-juillet 2026)** | Pilier 2 complet (prérequis Voûte) + implémentation PLAN2-PHASE1-SPEC |
| **Mois 3-4 (été 2026)** | Pilier 3 (chantiers de fond selon décisions) |
| **Mois 5+ (rentrée automne 2026)** | Pilier 4 (Voûte ouverte) si décisions humaines mûres ; sinon, ouverture pilote restreint et plein Pilier 4 plus tard |

---

## Annexes

### A. Désynchros docs ↔ code à corriger (action E1 détaillée)

| Doc | Section | À corriger |
|---|---|---|
| MODELE-MENACES.md | §3.6 | Ajouter le hash sha256 du messenger + `file:` dans img-src dans la CSP affichée |
| MODELE-MENACES.md | §X-02 | Statut défense : « Aucun » → « Bon (K whitelist livrée) » |
| MODELE-MENACES.md | §I-02 | Mentionner la faille WebP magic bytes (offset 8-11) corrigée récemment |
| MODELE-MENACES.md | §I-03 | Statut défense : « Bon » → « Partiel » (P1 normalisation Unicode non livrée) |
| MODELE-MENACES.md | §D-03 C1 | Ajouter nuance : flag `fsapi_persistance_handles` en localStorage clair, manipulable par payload qui contrôle le JS |
| MODELE-MENACES.md | §3 cartographie | Ajouter §3.7 « Import MD planification » et §3.8 « Jetons de reprise multi-appareil » |
| MODELE-MENACES.md | §4 cartographie destruction | Ajouter ligne « memoryCache (Map JS) » avec capacité « Lecture, écriture, perte au rechargement » |
| Lignes citées | Plusieurs | Rafraîchir `db.js:773` → `db.js:766` et autres dérives 2-7 lignes |
| MODELE-MENACES.md | Défense E §8.1 | Recalibrer : sandbox A en défense en profondeur, migration `innerHTML` ciblée plutôt que globale |
| .claude/skills/labo-codex/SKILL.md | §3 tableau | Mention « codex data non implémenté » sur la ligne Codex data |
| .claude/skills/securite-donnees/SKILL.md | §3.2 | Mention « format codex data non implémenté » |
| MODELE-MENACES.md | §3.3 | Préciser « format non implémenté au 10 mai 2026 » |
| PROTECTION-DONNEES-ANONYMISATION.md | Introduction | Idem |

### B. Questions ouvertes (consolidées de tous les docs)

**Loi 25 / juridique** (à un responsable de la protection des renseignements personnels) :
1. Durée légale de conservation des données étudiantes pour un enseignant collégial
2. Stockage DA hors SRAM/Clara — encadré ?
3. Données pédagogiques pour la recherche — consentement spécifique ? CER ?
4. Photos manuscrites = renseignement personnel ?
5. Propriété intellectuelle des grilles créées dans le cadre de l'emploi
6. Pseudonymisation réversible suffisante ou anonymisation irréversible obligatoire ?
7. Obligations institutionnelles si la Voûte est hébergée par un TI de cégep
8. IndexedDB = « fichier de renseignements personnels » au sens de la Loi sur l'accès ?
9. Hébergement obligatoire au Canada si serveur ?

**Gouvernance Voûte** (à trancher humainement) :
10. Qui retire un dépôt problématique ? (admin, vote, auteur seul)
11. Qui tranche un litige de propriété intellectuelle ?
12. Qui définit les règles d'admission ?
13. Qui finance et maintient le serveur ?
14. Plan de continuité si l'institution garante disparaît
15. Procédure et autorité de révocation d'accès

**Architecture** (techniques + humaines) :
16. Voûte centralisée / fédérée / fichiers signés ? (D1)
17. Signature ECDSA Phase 1 ou Phase 2 ? (D2)
18. Annuaire des clés publiques : centralisé / TOFU / WoT ? (D3)
19. Modération auto / humaine / mixte ? (D4)
20. Chiffrement local opt-in ou jamais ? (D5)
21. Safari only ou multi-navigateurs ? (D6)
22. IDs Voûte à l'import : conserver ou ré-attribuer ? (D7)
23. Limite de taille du package (50 Mo ou plus strict) ?
24. Médias en Phase 1 ou Phase 2 Voûte ?
25. Format `chaineAttribution` : UTF-8 brut ou normalisé ?
26. Licence CC BY-NC-SA stricte ou flexible pour dérivées ?
27. Compatibilité ascendante export JSON nu indéfiniment ou imposer `.lcz` ?

**Ergonomie / UX** (à expérimenter ou trancher) :
28. Mode anonymisation par défaut : pseudonymisation ou irréversible ? (Q1 ANONYMISATION)
29. Blobs exclus par défaut, sélection manuelle individuelle ? (Q2 ANONYMISATION)
30. Journal exclus par défaut ? (Q3 ANONYMISATION)
31. Chiffrement activation par défaut ou opt-in ? (Q1 CHIFFREMENT)
32. Délai d'inactivité avant verrouillage chiffrement ? (Q4 CHIFFREMENT)
33. Format phrase de récupération ? (12 mots BIP39 français recommandé)
34. Politique de rétention snapshots ? (Time Machine 24h/7j/4sem/12m par défaut)
35. Quelles clés journaliser Phase 2 versioning ?
36. Externalisation snapshots vers Réserve : automatique ou manuelle ?
37. Affichage systématique statut signature ou seulement en cas problème ?
38. UX vérification hash : automatique ou opt-in ?

### C. Mapping doc → scénario → défense → statut

| Doc | Scénario clé | Défense | Statut au 10 mai 2026 |
|---|---|---|---|
| MODELE-MENACES.md | D-01 (bombe biblio) | A, B, C, E, F, G | A ✅, B-α ✅, C ❌, E ⏳, F ❌, G ❌ |
| MODELE-MENACES.md | D-02 (corruption silencieuse) | H, F, M | H ⚠️ (2/6), F ❌, M ❌ |
| MODELE-MENACES.md | D-03 (effacement FSAPI) | A, C, D | A ✅, C ❌, D ✅ |
| MODELE-MENACES.md | D-04 (ZIP bomb) | validerZipSecurite (couvert) | ✅ |
| MODELE-MENACES.md | X-01 (vol données) | A, K, P3 chiffrement | A ✅, K ✅, chiffrement ❌ |
| MODELE-MENACES.md | X-02 (export piégé) | K | ✅ |
| MODELE-MENACES.md | I-01 (XSS stocké) | A, B, E, N | A ✅, B-α ✅, E ⏳, N ❌ |
| MODELE-MENACES.md | I-02 (polyglotte image) | validerMagicBytes (partiel), O | partiel, O ❌ |
| MODELE-MENACES.md | I-03 (path traversal) | validerZipSecurite | ⚠️ (partiel, P1 Unicode non livrée) |
| MODELE-MENACES.md | U-01 (usurpation enseignant) | F, L, G | tous ❌ |
| MODELE-MENACES.md | U-02 (faux pack démo) | H + IDs préfixés | ⚠️ (préfixage ✅, hash officiel pack ❌) |
| MODELE-MENACES.md | U-03 (méta CC truquées) | F | ❌ |
| MODELE-MENACES.md | C-01 (régression code) | I, J, audit | I ✅, J ✅, audit ⏳ |
| MODELE-MENACES.md | C-02 (IA contourne) | I, J, skills chargés | I ✅, J ✅, skills convention ⚠️ |
| PROTECTION-CHIFFREMENT | (transversal X-01, machine volée) | Phase 1 mot de passe | ❌ |
| PROTECTION-VERSIONING | (transversal D-01, D-03 résiduels) | Phase 1 snapshots | ❌ |
| PROTECTION-ANONYMISATION | (codex data partagé Voûte) | Phase 1 module anonymisation | ❌ |
| PROTECTION-FICHIERS-EXPORT | Phase A hash | Défense H | ⚠️ (2/6 types) |
| PROTECTION-FICHIERS-EXPORT | Phase B conteneur `.lcz` | nouveau format | ❌ |
| PROTECTION-FICHIERS-EXPORT | Phase C signature | Défense F | ❌ |
| PLAN2-PHASE1-SPEC | format `labo-codex-partage-v1` | 3 modules `partage-*.js` | ❌ (spec papier) |

---

## Conclusion

L'état de la réflexion est solide. La quasi-totalité des surfaces d'attaque existant aujourd'hui sont identifiées, et les défenses livrées (Défenses A, B-α, D, H, I, J, K, P-α) constituent une base réelle. Les écarts sont principalement de trois types :

1. **Dette de mise à jour** : la doc accuse 4-7 jours de retard sur le code (CSP, statuts X-02 et I-03, lignes citées). Bénin si rafraîchi régulièrement.
2. **Surfaces réelles oubliées** : import MD planification, jetons de reprise, memoryCache, synthèse rétroaction PDF. À ajouter.
3. **Angle mort Safari** : FSAPI ne fonctionne pas sur Safari, ce qui change la nature de plusieurs scénarios. À documenter explicitement.

Pour la **Voûte**, l'angle prospectif que tu m'as demandé d'adopter, la situation est :
- **Format de partage : spec mature**, prête à implémenter (~7 h)
- **Architecture de la Voûte : non décidée** (D1) — c'est le vrai goulet
- **Identité auteur (D2, D3) et modération (D4) : décisions humaines à prendre maintenant** parce qu'elles ont des délais incompressibles (consultations institutionnelles)
- **Chantiers techniques en attente** : signature ECDSA (Défense F), modération (Défense L), annuaire des clés publiques — tous bloqués par décisions

Le bon ordre opérationnel suggéré par ce diagnostic :

1. **Maintenant** : décider D5 (chiffrement) et D6 (Safari) — ce sont des arbitrages courts qui dégagent ou éliminent des chantiers de 3-4 semaines chacun.
2. **Cette semaine** : entamer les démarches G1-G6 (avis juridique, gouvernance, hébergement). Délais incompressibles, à démarrer en parallèle.
3. **Mois 1** : Pilier 1 (fermeture écarts) + début Pilier 2 (prérequis Voûte techniques).
4. **Mois 2** : Pilier 2 complet + implémentation PLAN2-PHASE1-SPEC (format).
5. **Mois 3-4** : Pilier 3 (chantiers de fond selon décisions).
6. **Mois 5+** : Pilier 4 (Voûte ouverte) une fois D1-D4 + G1-G6 mûres.

---

## Historique du document

| Date | Version | Changement |
|---|---|---|
| 2026-05-11 | 1.0 | Création. Audit de l'état de la réflexion sécurité au 10-11 mai 2026, croisement docs ↔ code ↔ skills, angle prospectif Voûte. Inputs : .claude/skills/securite-donnees/SKILL.md + MODELE-MENACES.md (1792 l.) + 4 PROTECTION-*.md (~2 800 l.) + BENCHMARK-OBSIDIAN.md (499 l.) + 4 audits (~800 l.) + PLAN2-PHASE1-SPEC.md + cartographie code 102 modules JS. Méthode : agents Explore + lecture directe + croisement matrices. Livrable destiné à alimenter le plan de sécurité Labo Codex. |
