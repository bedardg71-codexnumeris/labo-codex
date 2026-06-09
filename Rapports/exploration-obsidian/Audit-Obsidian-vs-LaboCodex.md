# Audit — Formats de fichiers Labo Codex vs Obsidian

> **Date** : 9 mai 2026
> **Demandeur** : Grégoire
> **Portée demandée** : audit large (architecture + données) + analyse comparative avec Obsidian
> **Contexte** : Grégoire envisage Obsidian pour des notes pédagogiques **en parallèle** de Labo Codex (deux outils complémentaires, pas de partage de fichiers).
> **Auteur de l'audit** : Claude (Cowork). Sources : `docs/`, code `js/`, `CLAUDE.md`. Limites explicitées en section 7.

---

## 1. Réponse courte

**Faut-il unifier les formats de fichiers entre Labo Codex et Obsidian ?**
Non. Les deux outils encodent des données de natures différentes :

- **Labo Codex** stocke de la donnée *structurée et relationnelle* (grilles, indices A-C-P, présences, évaluations, cartouches). Le JSON est techniquement nécessaire — on ne peut pas exprimer une matrice 30 étudiants × 12 indices en Markdown sans perdre la machinabilité.
- **Obsidian** stocke de la *prose lisible humainement* avec un graphe de liens. Le `.md` est nécessaire — on ne peut pas exprimer des notes réflexives ou un wiki personnel en JSON sans perdre la lisibilité.

Vouloir unifier les deux appauvrit les deux. La question utile n'est donc pas « quel format commun ? » mais « **qui fait quoi entre les deux outils ?** » — et c'est la section 5.

**Nuance importante** : le projet utilise déjà du Markdown léger comme format d'échange dans un cas précis (les cartouches s'importent depuis un `.txt` Markdown — voir section 3.b). Cette ouverture vers Markdown est intéressante mais reste *un format d'import-export*, pas un format de stockage interne.

---

## 2. Cartographie des formats dans Labo Codex (état actuel)

### 2.a Stockage interne (runtime de l'app)

| Type | Mécanisme | Exemple |
|------|-----------|---------|
| Petits objets (< 200 Ko) | localStorage | `h2026_groupeEtudiants`, `preferencesUtilisateur` |
| Gros objets (> 200 Ko) | IndexedDB + memoryCache | `evaluationsSauvegardees` (~1.2 Mo), `fichiersTravaux` (~3.8 Mo) |
| Blobs (photos, PDF) | IndexedDB | Photos de productions manuscrites |

Les données sont **toutes en JSON** côté stockage interne, indexées par des clés namespacées par trimestre (`h2026_*`, `a2025_*`). Le format de sérialisation est imposé par les API Web (localStorage et IndexedDB acceptent des objets JS, sérialisés en JSON-like).

> **Conclusion partielle** : le format de stockage runtime n'est pas un choix de design qu'on peut renégocier. Le navigateur impose JSON.

### 2.b Formats de fichiers (échanges avec le système de fichiers)

| Extension | Rôle | Modules sources | Verbe associé |
|-----------|------|-----------------|---------------|
| `.codex.zip` | Codex portable (manifeste + données + travaux) | `codex.js`, `import-export.js` | *enregistrer / ouvrir* |
| `.codex-data.json` | Extrait recherche (sans blobs) — concept livré ou prévu | `codex-data.js`, ECOSYSTEME-DONNEES.md | *extraire / charger* |
| `.json` | Export sélectif, configuration pédagogique, import bibliothèques | `import-export.js` | *exporter / importer* |
| `.zip` | Idem `.codex.zip` mais sans manifeste minimal | `import-export.js` | idem |
| `.txt` | **Cas multiples — voir 2.c** | divers | divers |
| `.pdf` | Synthèse pédagogique générée | `synthese-pdf.js`, `travaux-export-pdf.js` | *exporter* |
| `.csv` | Import liste étudiants (Omnivox), import bilan réflexif | divers | *importer* |
| `.png / .jpg / .heic / .webp` | Travaux (photos de productions) | `travaux-import.js`, `travaux-stockage.js` | *importer / stocker* |

### 2.c Tous les `.txt` du projet (vérifié dans le code)

Le `CLAUDE.md` mentionne « JSON et des txt ». J'ai vérifié — les `.txt` ne sont **pas un format de stockage interne** mais 4 cas d'export-import distincts :

1. **`LISEZMOI.txt`** (`import-export.js` ligne ~3232) — documentation lisible générée à côté d'un export JSON de configuration. Texte brut, pas Markdown.
2. **Import cartouche `.txt`** (`cartouches.js` ligne 1987, `importerCartoucheDepuisTxt`) — **ceci est du Markdown léger**, format documenté ainsi :
   ```
   ## NOM_DU_CRITÈRE
   **NOM_DU_CRITÈRE (I)** : Commentaire…
   **NOM_DU_CRITÈRE (D)** : Commentaire…
   **NOM_DU_CRITÈRE (M)** : Commentaire…
   **NOM_DU_CRITÈRE (E)** : Commentaire…
   ```
   Ce parser est tolérant aux variations (sauts de ligne Windows/Mac, astérisques mal placés, espaces). C'est le **seul vrai pont Markdown** existant dans l'app.
3. **Modèle bilan réflexif** (`bilan-reflexif.js` ligne 1683) — `modele-bilan-reflexif.txt`, modèle vide à compléter par l'étudiant.
4. **Rapport de bug** (`rapport-bug.js`) — texte brut de diagnostic généré.

> **Implication** : le projet a déjà mis un pied dans Markdown via les cartouches. Si tu voulais multiplier les ponts vers Obsidian, c'est ce mécanisme-là qui se généraliserait.

### 2.d Documentation

167 fichiers `.md` dans le projet, dont 108 dans `docs/` et 8 dans `Skills pour Claude Code/`. **Toute ta documentation projet est déjà en Markdown** — donc déjà compatible Obsidian sans aucune migration.

---

## 3. Cartographie par nature de donnée

C'est la grille de lecture qui répond vraiment à ta question. Je distingue quatre natures :

### 3.a Donnée fortement structurée (JSON, irremplaçable)

Doit rester JSON. Tout ce qui a un schéma, des relations, des contraintes, du calcul :

- Étudiants, groupes, présences, évaluations
- Indices A-C-P (calculés, dérivés)
- Grilles, échelles, productions, cartouches (templates)
- Calendrier, snapshots, planification mindmap
- Préférences, profil enseignant, modes d'application

Markdown est inadapté ici : pas de validation, pas de requêtage, pas de relations vérifiables.

### 3.b Donnée semi-structurée (Markdown léger possible)

C'est la zone grise intéressante. Données qui ont une **structure légère** mais dont le contenu principal est du texte :

- **Cartouches** : déjà importables depuis `.txt` Markdown. Le stockage reste JSON, mais l'import-export `.md` est viable.
- **Bilan réflexif** : texte avec sections, déjà exporté en `.txt` modèle.
- **Configurations pédagogiques** (descriptions, métadonnées CC) : pourraient être enrichies de blocs Markdown sans casser le JSON (champ `description` qui contient du Markdown).

> Possibilité concrète : étendre le pattern « import-export `.txt` Markdown » des cartouches à d'autres entités. Mais ça reste un *pont*, pas une migration.

### 3.c Texte libre (champs string dans JSON)

Identifié dans le code : 202 occurrences combinées de `commentaire` ou `observation` réparties dans 15+ modules. Plusieurs champs textuels existent déjà :

| Champ | Module | Taille typique |
|-------|--------|----------------|
| `cartouche.commentaires[critère][niveau]` | `cartouches.js` | 0–1000 caractères / cellule |
| `cartouche.description` | `cartouches.js` | 0–500 caractères |
| `pratique.description` | `pratique-notation-v2.js` | 0–500 caractères |
| `cc-derniere-description` | `cc-license.js` | 0–2000 caractères |

**Limite de mon audit (transparence)** : je n'ai pas eu le temps de vérifier **s'il existe déjà un système de notes libres orienté enseignant** (journal de bord, observations sur étudiants en prose). Le mot « observation » apparaît 202 fois mais souvent dans des contextes différents (cartouches, autocollants pédagogiques, suivi RaI). Si un tel système existe, il chevauche le territoire d'Obsidian. Si non, c'est précisément ce qu'Obsidian peut combler.

### 3.d Blobs (images, PDF)

Photos de productions, exports PDF. Aucun rapport avec Obsidian — Markdown ne stocke pas de blobs (sauf en référence externe). Reste tel quel.

---

## 4. Comparaison Labo Codex / Obsidian

| Dimension | Labo Codex | Obsidian |
|-----------|------------|----------|
| **Modèle de données** | Base relationnelle légère (clés-valeurs structurées, namespacées) | Graphe de notes textuelles avec liens `[[wiki]]` |
| **Format primaire** | JSON (interne) + ZIP (portable) | Markdown `.md` (fichiers plats) |
| **Lisibilité hors app** | Faible (JSON technique) | Élevée (texte brut) |
| **Requêtabilité** | Forte (modules calculent indices, agrègent) | Faible nativement (plugins type Dataview compensent) |
| **Schéma/validation** | Oui (implicite dans le code, registre `DATA-OWNERSHIP.md`) | Aucun (texte libre) |
| **Liens entre entités** | Par ID (étudiantId, grilleId) | Par nom de fichier `[[Note]]` |
| **Synchronisation multi-appareil** | Manuelle (clé USB, ZIP) | Obsidian Sync (payant) ou iCloud / Git |
| **Hors-ligne** | Total (Web App) | Total (app native Mac/iPad) |
| **Modèle d'évolution** | Migrations explicites, `version.json` | Pas de versioning de schéma (pas de schéma) |
| **Plateforme** | Mac + iPad (Safari) | Mac + iPad (apps natives) |
| **Cible utilisateur** | Toi (enseignant) + collègues (Voûte future) | Toi (notes personnelles) |

**Constat** : ce sont deux outils qui répondent à des besoins disjoints. Aucune dimension où ils sont substituables.

---

## 5. Recommandation : qui fait quoi

### 5.a Reste exclusivement dans Labo Codex

Tout ce qui est donnée structurée pédagogique : groupes, présences, évaluations, indices, grilles, échelles, cartouches, productions, planification curriculaire (mindmap), snapshots, calendrier. Aucun gain à les exposer à Obsidian.

### 5.b Candidats légitimes pour Obsidian (en parallèle)

Cas d'usage où Obsidian apporte ce que Codex ne fait pas (et n'a pas vocation à faire) :

1. **Journal de bord enseignant** : observations narratives au fil des cours, remarques sur la dynamique de groupe, intuitions à creuser. Ce type de prose libre, datée, interconnectable, est exactement le terrain d'Obsidian.
2. **Réflexion pédagogique longue** : préparation d'AQPC, articles, communication, retour sur une session. Avec liens `[[étudiant-X]]` ou `[[séquence-Y]]` pour relier ta pensée.
3. **Base de connaissances métier** : ELLAC, SOLO, IDME, RàI, PAN, SRPNF — tu as déjà ces concepts dans `Skills pour Claude Code/`. Obsidian rendrait ces connexions navigables comme un wiki.
4. **Veille et lectures** : articles, citations, fiches de lecture pédagogique.
5. **Planification non encore structurée** : idées de séquences avant qu'elles ne deviennent des entités Codex.
6. **Documentation du projet pour toi-même** : tes 167 `.md` dans `docs/` — Obsidian les ouvre directement, te donne la vue graphe et la recherche full-text instantanée. Tu pourrais ouvrir le dépôt Monitorage_v6 comme un coffre Obsidian sans rien migrer.

### 5.c Frontière à tenir (gouvernance)

Pour éviter la dérive, deux règles simples :

- **Une donnée à la fois** : un étudiant, une évaluation, un indice n'existe qu'à un seul endroit (Codex). Pas de duplication dans Obsidian.
- **Une note à la fois** : une réflexion, une observation narrative n'existe qu'à un seul endroit (Obsidian). Pas de duplication dans Codex.

La frontière passe par la **forme** : si c'est du calcul ou de la mesure → Codex. Si c'est de la prose → Obsidian.

### 5.d Pont éventuel (si jamais tu en veux un)

Si plus tard tu veux relier les deux outils sans les fusionner, voici les options viables, du plus léger au plus invasif :

1. **Rien** — c'est l'option par défaut et probablement la bonne pour commencer. Deux outils, deux usages, deux mémoires.
2. **Convention de nommage** dans Obsidian : `étudiant-DA12345.md`, `groupe-h2026-gr00002.md`. Tu peux référencer un étudiant Codex dans une note Obsidian. Pas d'automatisation, juste une convention humaine.
3. **Export Codex → Obsidian** : ajouter à `import-export.js` une fonction qui exporte un trimestre comme dossier `.md` (un fichier par étudiant, avec front-matter YAML pour les métadonnées). Lecture seule. Utile pour relire un trimestre passé en mode wiki.
4. **Pont bidirectionnel** : à éviter. Maintenir la cohérence entre deux représentations de la même donnée est une source de bugs garantie. Si tu y penses sérieusement un jour, ça mérite un ADR (`engineering:architecture`).

---

## 6. Architecture des données — observations annexes

Pendant l'audit, j'ai relevé deux points qui sortent du scope Obsidian mais méritent d'être notés.

### 6.a `noms_stables.json` mentionné mais non trouvé

Le `CLAUDE.md` cite `noms_stables.json` comme fichier protégé à la racine. L'agent d'exploration ne l'a pas trouvé. À vérifier :
- Soit il a été déplacé / renommé sans mise à jour du `CLAUDE.md`
- Soit il est ignoré par git (`.gitignore`) et ne vit que sur ta machine
- Soit la mention est obsolète

> **Action suggérée** : `grep -r noms_stables` dans le projet, ou question à toi-même : ce fichier existe-t-il vraiment ?

### 6.b `LISEZMOI.txt` n'utilise pas Markdown

C'est du texte brut. Si tu en faisais un `.md`, il deviendrait lisible directement dans Obsidian, GitHub, Finder Quick Look macOS — sans rien casser. Petit gain, zéro coût. Pas urgent.

### 6.c Format des cartouches `.txt` — un précédent

Le parser de cartouches dans `importerCartoucheDepuisTxt()` est tolérant et bien documenté. Si tu voulais un jour ouvrir d'autres entités (échelles, gabarits de productions, configurations) à un import-export Markdown, tu as un pattern réutilisable sous la main.

---

## 7. Limites de cet audit (transparence)

Ce que je n'ai **pas** fait, et que je signale honnêtement :

- **Pas lu le code en profondeur** : `import-export.js` fait probablement plusieurs milliers de lignes, je n'ai vérifié que les sections qui touchaient ma question. Un bug ou un format que j'aurais raté est possible.
- **Pas lu `02-ARCHITECTURE-OVERVIEW.md`** : Glob ne l'a pas trouvé sous le chemin attendu. Il existe peut-être sous un autre nom ou pas du tout.
- **Pas vérifié l'existence d'un système de journal/notes enseignant** : si tu en as un et que je l'ai manqué, mes recommandations 5.b sont à recadrer.
- **Pas testé Obsidian** : tu m'as dit que tu l'envisages seulement. Je m'appuie sur la description fournie par Gemini + ma connaissance générale d'Obsidian (modèle Vault + Markdown + plugins). Je ne peux pas garantir le comportement précis de la dernière version d'Obsidian sur iPadOS 18.5 / macOS 15.5 sans test.
- **Pas évalué les coûts** : Obsidian Sync (~96 USD/an si tu veux la sync officielle entre Mac et iPad). iCloud Drive est gratuit mais pose des problèmes connus de conflits sur les coffres Obsidian. Git est gratuit mais nécessite Working Copy ou équivalent sur iPad.
- **Pas considéré le contexte humain** : si tu prends déjà des notes pédagogiques quelque part (Notes Apple, papier, autre), une migration vers Obsidian implique une transition. Je ne sais pas où tu en es.

---

## 8. Décisions à prendre (de ton côté)

Si tu veux pousser plus loin, voici les questions concrètes :

1. **Y a-t-il déjà un système de notes libres dans Codex que j'aurais raté ?** (vérifier dans le code ou de mémoire)
2. **Que veux-tu faire dans Obsidian en priorité ?** Journal de bord ? Base de connaissances métier ? Documentation projet ?
3. **Comment vas-tu synchroniser Mac ↔ iPad ?** Sync officiel, iCloud, Git ?
4. **Veux-tu un pont automatisé Codex → Obsidian un jour ?** Si oui, quel sens du flux et quelle granularité ?
5. **Est-ce qu'on garde le `LISEZMOI.txt` en `.txt` ou on le passe en `.md` ?** (mini chantier d'opportunité)

---

## Annexe — Faits techniques vérifiés

- `js/cartouches.js` ligne 1987 : `importerCartoucheDepuisTxt()` parse du Markdown léger (`##` headings + `**bold**` + structure I/D/M/E).
- `js/import-export.js` lignes ~3232–3268 : génération `LISEZMOI.txt` à côté d'un export config JSON.
- `js/bilan-reflexif.js` ligne 1683 : export `modele-bilan-reflexif.txt`.
- `version.json` à la racine : source unique de vérité pour le numéro de version (build + beta).
- `docs/architecture/ECOSYSTEME-DONNEES.md` (26 avril 2026) : 4 concepts — Codex, Archives, Codex data, Voûte.
- `docs/DATA-OWNERSHIP.md` (3 avril 2026) : registre des propriétaires de clés de stockage.
- 167 fichiers `.md` total dans le projet (108 dans `docs/`, 8 dans `Skills pour Claude Code/`, 6 à la racine, 13 dans rapports, divers ailleurs).
- 95 PNG dans `autocollants/` (assets UI).
