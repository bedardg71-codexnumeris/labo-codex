# Exploration Obsidian — trace de réflexion (mai 2026)

> **Période** : 9 mai 2026 (une session de Cowork)
> **Statut** : exploration archivée — pas une référence active
> **Contexte** : réflexion sur ce que Labo Codex peut tirer de l'écosystème Obsidian, sans intention immédiate de mise en œuvre.

---

## Trajectoire de la conversation

La session a évolué en plusieurs pivots successifs, du concret vers le stratégique puis retour au concret.

1. **Question initiale** : faut-il que Codex et Obsidian utilisent le même format pour pouvoir travailler dans les deux apps ?
2. **Premier recadrage** : non, Markdown et JSON encodent des choses différentes. Mais audit large demandé.
3. **Deuxième pivot** : exploration du modèle économique pour la Voûte (sync payante, freemium, coûts serveurs).
4. **Troisième pivot** : ce n'est pas le marché qui intéresse, c'est l'écosystème comme système vivant.
5. **Quatrième pivot** : concrétiser — quelles structures et formats Codex devrait définir ?
6. **Critique de Claude Code** : pushbacks substantiels (over-engineering, conflit licence, lacunes factuelles sur l'état du projet).
7. **Décision finale** : se laisser un an d'observation après le colloque AQPC de juin avant de figer quoi que ce soit. Outil de capture créé : `Retours des testeurs/USAGE-FORMATS.md`.

---

## Les quatre documents archivés

Dans l'ordre chronologique de production :

**1. `Audit-Obsidian-vs-LaboCodex.md`** — Cartographie des formats actuels de Codex (JSON, ZIP, .txt, etc.) et constat que JSON et Markdown encodent des données de natures différentes. Identifie que les cartouches utilisent déjà du Markdown léger pour l'import. Réponse à la question initiale : non, pas le même format pour les deux apps.

**2. `Modele-economique-Voute-Codex.md`** — Analyse du modèle économique freemium pour la Voûte multi-institutions. Identifie que le freemium B2C pur à la Obsidian ne s'aligne pas avec le marché québécois étroit (~22 000 enseignants au cégep). Propose un modèle hybride avec licences institutionnelles comme moteur principal. Conserve sa valeur descriptive même si l'orientation a ensuite pivoté vers l'écosystème.

**3. `Ecosysteme-Obsidian-inspirations-Codex.md`** — Cartographie de onze composantes de l'écosystème Obsidian (format ouvert, local-first, plugins, thèmes, templates partagés, Sync, Publish, communauté, documentation, API, modèle économique). Identifie quatre idées-fortes potentiellement transposables : format comme acte politique, sync E2EE comme produit éthique, Voûte comme marketplace pédagogique vivante, documentation comme premier coffre public.

**4. `Structures-et-formats-a-definir.md`** — Programme de définition (formats, schémas transversaux, structures Voûte). Document le plus détaillé mais aussi le plus contestable. Ses limites sont actées dans la critique ci-dessous.

---

## Critique de Claude Code (synthèse)

Claude Code (instance avec connaissance du code actuel) a relu `Structures-et-formats-a-definir.md` et soulevé six pushbacks importants :

**1. Sur la licence — un malentendu à corriger (mise à jour 10 mai 2026).** Claude Code a signalé un possible conflit en disant que le code utiliserait `CC-BY-SA` (sans NC) tandis que mon document proposait `CC-BY-NC-SA-4.0`. Vérification faite dans la section À propos de l'application (carte « Licences ») : le projet utilise en réalité une **double licence** clairement assumée — **AGPL v3.0 pour le code source** (HTML, JavaScript, CSS) et **CC BY-NC-SA 4.0 pour le contenu pédagogique** (modèles, documentation, aide intégrée, grilles, échelles, cartouches). Ma proposition d'utiliser `CC-BY-NC-SA-4.0` pour les configurations partagées dans la Voûte est donc alignée avec ce qui est déjà décidé pour le contenu pédagogique, pas en contradiction. Pas de décision à prendre — la double licence est cohérente et déjà en place. Le malentendu est probablement venu d'une lecture partielle des fichiers `cc-license.js` côté Claude Code.

**2. Risque de calcification prématurée.** Les principes P1-P6 (spec publique + SemVer + RFC + JSON Schema) sont calibrés pour un projet avec utilisateurs externes. Pour un seul testeur principal + Bruno, c'est de l'over-engineering. Recommandation adoptée : appliquer P1 (spec publique) et P5 (rétro-compat données personnelles) maintenant, différer P2 (SemVer formel), P4 (RFC), P6 (JSON Schema) à la phase Voûte multi-enseignants.

**3. Décision A (format unifié vs par type) sous-spécifiée.** Le penchant initial pour « format par type » ne chiffre pas les coûts (N specs, N parsers, N validateurs, N tests). JSON Canvas a choisi unifié pour cette raison. Recommandation adoptée : hybride — format unifié `.codex-entity.json` avec discriminateur `type` pour les entités structurées, plus `.md` pour les entités à forte composante textuelle (cartouches).

**4. Décision C (schémas transversaux) trop binaire.** La proposition « appliquer dès maintenant » ne dit pas comment migrer les entités existantes. Recommandation adoptée : `schemaVersion: 0` implicite + migration paresseuse (« upgrader à v1 au prochain enregistrement »).

**5. Section 3.E (CLI) à retirer.** Reconnaître que c'est techniquement coûteux pour une web app et l'inclure quand même en « long terme » dilue le doc. À déplacer en « non couvert ». Adopté.

**6. Lacunes factuelles sur l'état actuel du projet.** Plusieurs éléments présentés comme « à créer » sont déjà livrés :
- `meta.json` pour archives : livré 28 avril (Réserve v1.5 FSAPI), spec dans `docs/architecture/SPEC-RESERVE-V1.md`.
- `manifeste-archives.json` : livré (#248).
- `.codex-data.json` : format livré et utilisé, pas « partiellement spécifié ».
- Renommage Réserve → Archives : livré (#259), le doc utilise les deux termes de façon incohérente.
- Nom de clé `pratiquesConfigurables` : obsolète, c'est `CLE_PRATIQUES_CONFIGURATIONS` aujourd'hui.

Ces lacunes reflètent une lecture insuffisante du code et des docs récentes. À ne pas reproduire.

---

## Décision finale (9 mai 2026)

Plutôt que de figer des formats pour des utilisateurs hypothétiques, **se laisser un an d'observation** avant toute formalisation.

**Pourquoi** :
- Pas d'utilisateurs externes contraignants aujourd'hui.
- Le colloque AQPC de juin 2026 amènera un premier bassin de testeurs.
- Les formats actuels vont continuer d'évoluer ; figer maintenant créerait de la dette.
- L'observation d'usages réels donnera des signaux plus fiables que l'extrapolation.

**Risque mitigé** : sans mécanisme de capture, les insights testeurs s'évaporent. D'où l'outil dédié `Retours des testeurs/USAGE-FORMATS.md` (créé en parallèle), avec quatre sections (frictions, besoins de partage, détournements créatifs, questions récurrentes) et un calendrier de bilans (juillet 2026, octobre 2026, février 2027, mai 2027).

**Décision finale en mai 2027** : reprendre `Structures-et-formats-a-definir.md` à la lumière des observations de l'année et trancher A/B/C avec des données réelles plutôt que des penchants.

---

## Ce qui a de la valeur dans cette exploration

Indépendamment de la décision de différer, la session a produit quelques signaux utiles :

- **Le format est un acte politique** (volet A de l'écosystème Obsidian) — l'idée que la spec publique d'un format crée les conditions d'un écosystème de tiers reste un repère solide.
- **La sync E2EE comme produit éthique** — Loi 25 + signal commercial. À garder en réserve quand la Voûte sera concrète.
- **Le pivot vers B2B institutionnel** plutôt que freemium B2C pur — recadrage du modèle économique qui tient indépendamment du calendrier.
- **La critique de Claude Code elle-même** — démontre la valeur d'avoir un regard interne (connaissance du code actuel) qui complète une analyse externe (connaissance de l'écosystème). À reproduire.

---

## Pour s'y retrouver plus tard

- **Pour décider en mai 2027** : commencer par lire `Structures-et-formats-a-definir.md`, sa critique ci-dessus, et le journal `USAGE-FORMATS.md`.
- **Pour onboarder un partenaire institutionnel** sur le contexte stratégique : `Modele-economique-Voute-Codex.md`.
- **Pour réfléchir à l'écosystème en général** : `Ecosysteme-Obsidian-inspirations-Codex.md`.
- **Pour répondre à la question d'un testeur sur Obsidian** : `Audit-Obsidian-vs-LaboCodex.md`.
