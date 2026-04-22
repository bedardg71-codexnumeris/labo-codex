# Plan — Partage sécurisé de ressources entre utilisateurs (CC BY-NC-SA)

**Date** : 21 avril 2026
**Statut** : Cadrage complet, implémentation non démarrée
**Philosophie-clé** : étendre le modèle d'autonomisation par la démo CC (Plan 1) au partage entre utilisateurs. Un enseignant qui a construit ses propres ressources peut les partager, un autre enseignant peut les observer et les prendre comme modèle selon exactement le même protocole que pour la démo. L'écosystème entier est un tissu CC BY-NC-SA qui circule, se réplique et inspire sans jamais être corrompu.

**Plan prérequis** : `PLAN-AUTONOMISATION-UTILISATEUR.md` (Plan 1) — ce plan s'inscrit en continuité stricte, réutilise les mêmes conventions (sélecteurs à sections, « Dupliquer », attribution visible, interdiction des références mixtes).

---

## 1. Contexte

### 1.1 Continuité avec Plan 1

Plan 1 pose le cycle interne : Labo Codex (dev) produit la démo → l'utilisateur l'observe et prend comme modèle → il crée ses propres ressources. Plan 2 prolonge ce cycle à l'horizontal : un utilisateur produit une ressource → il l'exporte en package CC → un autre utilisateur l'importe, l'observe, et peut la prendre comme modèle à son tour.

Le paradigme pédagogique (enseignement explicite : modélisation → pratique guidée → autonomie) reste valide : un enseignant apprend non seulement des exemples démo fournis par Labo Codex, mais aussi des ressources créées par ses pairs.

### 1.2 Infrastructure existante réutilisable (Beta 91)

Le projet a déjà une fonctionnalité d'export/import intitulée **« Configuration pédagogique complète »** (commit Beta 91, 21 septembre 2025) qui produit un package partageable avec métadonnées CC BY-NC-SA 4.0. Ce plan s'appuie sur cette fondation et l'étend :

- Le format de package existant est conservé et enrichi (si nécessaire)
- Le nouveau pipeline d'import se greffe sur les modules `validerZipSecurite` et `validerMagicBytes` déjà en place (règles documentées dans CLAUDE.md)
- Les sélecteurs à 2 sections (Plan 1) deviennent sélecteurs à 3 sections : « Mes documents » / « Démo » / « Partagés »

### 1.3 Absence d'utilisateurs actuels

Labo Codex est encore en développement actif sans base d'utilisateurs finaux. Ce plan est donc conçu pour :
- Transport initial par **email** (utilisateur A exporte un fichier, l'envoie en pièce jointe, utilisateur B le reçoit et l'importe manuellement)
- Aucune dépendance à un serveur ou une infrastructure de partage
- Préparation sérieuse des garde-fous de sécurité maintenant, **avant** qu'il y ait des utilisateurs susceptibles d'envoyer des packages malveillants

Les modes de partage ultérieurs (URL de partage direct, bibliothèque communautaire en ligne, vérification cryptographique) sont hors périmètre de ce plan mais préparés par l'architecture choisie.

---

## 2. Vision d'ensemble

### 2.1 Principe fondateur

Chaque utilisateur peut **exporter** un ou plusieurs items de ses bibliothèques sous forme de **package CC BY-NC-SA 4.0**. Le package est un fichier ZIP signé par l'identité de l'auteur (non-cryptographique dans Phase 1 — simple métadonnée déclarative) qui contient les entités et leurs médias.

Un autre utilisateur reçoit ce fichier (email, clé USB, peu importe) et l'importe via **Réglages › Import/Export**. Après validation stricte de sécurité et prévisualisation, les items arrivent dans une section nouvelle appelée **« Partagés »** des sélecteurs concernés. Ils sont **en lecture seule**, exactement comme les items démo.

Pour les adopter, l'utilisateur clique sur **« Dupliquer »** — même mécanisme que pour la démo. Un nouveau document est créé dans « Mes documents » avec l'attribution `Inspiré de [nom original] par [nom auteur]`.

### 2.2 Trois types de ressources coexistent dans les sélecteurs

Après livraison de Plan 1 + Plan 2, chaque sélecteur d'entité expose trois sections :

```
┌─────────────────────────────────────────┐
│  Mes documents                          │
│  ───────────────                        │
│  • [+ Nouveau]                          │
│  • Ma grille de dissertation            │
│                                         │
│  Démo (par Demo Labo Codex)             │
│  ───────────────                        │
│  • Grille d'analyse littéraire          │
│                                         │
│  Partagés                               │
│  ───────────────                        │
│  • Grille d'argumentation (par Martin X.)│
│  • Grille de lecture critique (par Iris Y.)│
└─────────────────────────────────────────┘
```

Les items « Partagés » sont **traités exactement comme les items Démo** côté UX : lecture seule par défaut, bouton « Dupliquer » pour débloquer l'édition, génération d'un nouveau document avec attribution préservée.

### 2.3 Le parallèle CC BY-NC-SA, toujours

Chaque niveau du cycle respecte strictement les 3 piliers CC :
- **Attribution (BY)** : chaque item conserve son auteur original et, au fork, la ligne « Inspiré de » est préservée. Chaîne complète visible en cas d'inspirations successives.
- **Non commercial (NC)** : aligné sur la mission de Labo Codex. Les packages exportés mentionnent explicitement la licence.
- **Share-alike (SA)** : les items forkés adoptent la même licence, et peuvent être re-partagés à leur tour.

---

## 3. Design du flow utilisateur

### 3.1 Export d'une ressource

À partir d'un item dans « Mes documents » (formulaire ou carte), un bouton **« Exporter pour partager »** ouvre une modale :

```
┌──────────────────────────────────────────────────────┐
│  Exporter « Ma grille de dissertation »              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  En exportant ce document, tu acceptes qu'il soit    │
│  partagé sous licence CC BY-NC-SA 4.0 :              │
│                                                      │
│    ✓ Ton nom (tel qu'il apparaît dans Réglages ›    │
│      Enseignant) sera inclus comme auteur            │
│    ✓ Le destinataire pourra l'utiliser et le         │
│      modifier, mais devra te créditer                │
│    ✓ Ses versions dérivées resteront sous CC         │
│    ✗ Il ne pourra pas être utilisé commercialement   │
│                                                      │
│  Contenu du package :                                │
│    - 1 grille                                        │
│    - 12 critères                                     │
│    - 3 échelles référencées (incluses)               │
│                                                      │
│                    [ Annuler ]  [ Exporter ZIP ]     │
└──────────────────────────────────────────────────────┘
```

Clic sur « Exporter ZIP » → téléchargement du fichier `partage-grille-dissertation-2026-04-21.zip`.

L'utilisateur le joint ensuite à un email manuellement (aucun hook email en Phase 1).

### 3.2 Import d'un package

Entry point : **Réglages › Import/Export › « Importer un package partagé »**.

1. File picker pour sélectionner un `.zip`
2. **Validation stricte** (voir §4 et §5) — si échec, message clair, aucune donnée intégrée
3. **Modale de prévisualisation** avant intégration :

```
┌──────────────────────────────────────────────────────┐
│  Aperçu du package reçu                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Nom : Grille d'argumentation                        │
│  Auteur déclaré : Martin X. (martinx@cegep.qc.ca)    │
│  Institution : Cégep de Sherbrooke                   │
│  Discipline : Philosophie                            │
│  Date d'export : 15 avril 2026                       │
│  Licence : CC BY-NC-SA 4.0                           │
│                                                      │
│  Contenu :                                           │
│    - 1 grille (12 critères)                          │
│    - 3 échelles (réutilisées dans la grille)         │
│                                                      │
│  Chaîne d'attribution :                              │
│    Martin X. (original)                              │
│    └ Inspiré de : Demo Labo Codex (démo d'origine)  │
│                                                      │
│  ⚠️  Avertissement : vérifie que tu reconnais        │
│     la source de ce fichier avant d'importer.        │
│                                                      │
│            [ Annuler ]  [ Prévisualiser ]  [ Importer ] │
└──────────────────────────────────────────────────────┘
```

- **Annuler** : package ignoré, aucune modification
- **Prévisualiser** : ouvre un second panneau montrant le détail des critères, échelles, etc. en lecture seule
- **Importer** : les items arrivent dans la section « Partagés » des sélecteurs concernés. Rien n'atterrit dans « Mes documents ».

### 3.3 Utilisation d'un item partagé

Flux identique à celui de la démo (défini dans Plan 1 §3) :
- Clic sur item partagé → formulaire en lecture seule avec attribution visible
- Clic sur « Dupliquer » → formulaire bascule en édition, saisie du nom obligatoire
- Save → nouveau document dans « Mes documents » avec attribution `Inspiré de [nom original] par Martin X.`
- La chaîne de provenance est préservée : si Martin s'était lui-même inspiré de la démo, cette information est conservée dans la métadonnée (affichée en mode replié, développable au clic)

### 3.4 Attribution chain affichée intelligemment

Affichage par défaut sur une carte ou dans un formulaire :

```
┌─────────────────────────────────────────────────┐
│  Ma grille d'argumentation                      │
│  par Grégoire Bédard                            │
│  Inspiré de Grille d'argumentation (par Martin X.) ▼ │
└─────────────────────────────────────────────────┘
```

Clic sur le chevron (▼) déploie la chaîne complète :

```
┌─────────────────────────────────────────────────┐
│  Ma grille d'argumentation                      │
│  par Grégoire Bédard                            │
│  Inspiré de :                                   │
│    • Grille d'argumentation par Martin X.       │
│      ↳ Inspiré de Demo Labo Codex               │
│    (chaîne totale : 2 intermédiaires)           │
└─────────────────────────────────────────────────┘
```

Toujours transparent, toujours traçable, conformément à la philosophie CC BY.

---

## 4. Architecture technique

### 4.1 Format du package

Réutiliser et étendre le format de « Configuration pédagogique complète » (Beta 91) :

```
partage-xxx-2026-04-21.zip
├── manifest.json         — métadonnées du package
├── entites/
│   ├── grilles/
│   │   └── grille-XXX.json
│   ├── echelles/
│   │   └── echelle-YYY.json
│   └── ...
└── medias/
    └── production-ZZZ.png (si entité concernée a des médias)
```

Contenu de `manifest.json` :

```json
{
    "format": "labo-codex-partage-v1",
    "licence": "CC BY-NC-SA 4.0",
    "dateExport": "2026-04-21T10:30:00Z",
    "auteur": {
        "nom": "Martin X.",
        "courriel": "martinx@cegep.qc.ca",
        "institution": "Cégep de Sherbrooke",
        "discipline": "Philosophie"
    },
    "entites": [
        { "type": "grille", "id": "XXX", "fichier": "entites/grilles/grille-XXX.json" },
        { "type": "echelle", "id": "YYY", "fichier": "entites/echelles/echelle-YYY.json" }
    ],
    "references": [
        { "depuis": "grille-XXX", "vers": "echelle-YYY", "type": "utilise" }
    ],
    "chaineAttribution": [
        { "niveau": 0, "auteur": "Demo Labo Codex", "nomItem": "Grille d'analyse littéraire" }
    ]
}
```

### 4.2 Validation au import (6 niveaux de contrôle)

Le pipeline d'import passe par 6 contrôles stricts, dans l'ordre :

1. **ZIP sécurisé** (`validerZipSecurite` déjà en place) : taille < 50 Mo, pas de path traversal, pas de chemins absolus, nombre de fichiers raisonnable (< 1000).
2. **Structure du package** : présence obligatoire de `manifest.json`, structure conforme au schéma `labo-codex-partage-v1`. Rejet si format inconnu ou version non supportée.
3. **Magic bytes des médias** (`validerMagicBytes` déjà en place) : tout fichier image/PDF dans `medias/` doit avoir une signature valide (PNG, JPEG, WebP, HEIC, PDF). Rejet sinon.
4. **Schema fermé pour chaque entité** : les champs permis, leurs types et leurs longueurs max sont définis par type d'entité. Tout champ inconnu ou malformé = rejet du package entier (pas d'import partiel).
5. **Sanitization de tout texte** : tout string passé par `echapperHtml()` avant stockage ou rendu. Aucune exception. Les champs comme nom de critère, description, libellé d'étape, etc. sont strictement sanitizés.
6. **Attribution réservée** : si le manifest ou une entité contient la chaîne `"Demo Labo Codex"` comme auteur, **le package est rejeté**. Cette valeur est technique, réservée au code. Un utilisateur ne peut pas produire un package prétendant venir de Demo Labo Codex.

### 4.3 Limites de taille granulaires

Au-delà du plafond ZIP global (50 Mo), des limites par champ et par type :

- Nom d'un item : 200 caractères max
- Description d'un item : 2000 caractères max
- Texte d'un critère : 5000 caractères max
- Fichier PNG/JPEG : 2 Mo max chacun
- Fichier PDF : 10 Mo max chacun
- Nombre de critères par grille : 50 max
- Nombre d'échelles par package : 20 max

Tout dépassement = rejet du package avec message précis sur la limite violée.

### 4.4 Section « Partagés » dans le storage

Namespace dédié : `partage_*` (parallèle à `demo_*` et aux namespaces trimestre).

Helpers :
- `window.clePartage('nomCollection')` → `partage_nomCollection`
- Chaque item importé porte son `id` original de provenance + un `id` local réattribué par le système pour éviter les collisions

Le namespace `partage_*` est :
- **Peuplé** uniquement par import d'un package
- **Lu seulement** par les sélecteurs pour afficher la section Partagés
- **Écrit** uniquement lors d'un import ou d'une suppression explicite par l'utilisateur depuis Réglages
- **Isolé** des namespaces trimestre de l'utilisateur

### 4.5 Interdiction stricte des références mixtes (prolonge règle Plan 1)

Une entité utilisateur (dans « Mes documents ») ne peut référencer :
- Ni un item démo (règle Plan 1)
- Ni un item partagé (règle Plan 2)

Si l'utilisateur tente d'assembler un groupe-cours avec une grille partagée non forkée, même message clair que pour la démo :

> « Cette grille a été partagée par Martin X. Pour l'utiliser dans ton groupe-cours, clique sur "Dupliquer" d'abord et donne-lui ton propre nom. »

Les forks, eux, sont de l'utilisateur et peuvent être référencés normalement.

---

## 5. Sécurité — couches de défense

### 5.1 Récapitulatif des défenses en place dans le projet (CLAUDE.md)

Déjà bétonné :
- **Échappement HTML** obligatoire sur tout `innerHTML` avec données externes (`echapperHtml()`)
- **ZIP sécurisé** (`validerZipSecurite`) : taille, path traversal, chemins absolus
- **Magic bytes** (`validerMagicBytes`) : vérifie signatures PNG/JPEG/WebP/HEIC/PDF
- **Pas de handlers inline** : zéro `onclick=`, utilise `data-action` et le dispatcher
- **CSP strict** : `script-src 'self'`, zéro inline, zéro `eval`
- **Pas d'URL externe dynamique** chargée automatiquement

### 5.2 Défenses spécifiques ajoutées par ce plan

- **Schéma fermé strict** à l'import : rejet si champ inconnu, type erroné, valeur hors bornes
- **Attribution « Demo Labo Codex » techniquement réservée** : chaîne rejetée dans tout package importé ; même au niveau des métadonnées de la chaîne d'attribution, doit pointer vers le code de chargement du dev et non vers une valeur utilisateur
- **Prévisualisation obligatoire** avant intégration : l'utilisateur voit le contenu avant qu'il ne soit ajouté au storage
- **Isolation dans namespace dédié** : le package ne peut pas écraser ou modifier les items utilisateur ou démo ; il vit dans `partage_*` jusqu'à ce que l'utilisateur crée des forks
- **Limites de taille granulaires** (§4.3)
- **Aucune exécution de code** : les entités ne peuvent contenir aucun champ exécutable. Pas de JavaScript, pas de CSS injecté, pas de HTML brut (tout texte est traité comme texte pur)

### 5.3 Défenses à concevoir en parallèle (Phase 2+)

- **Signature cryptographique** des packages officiels (futures distributions Labo Codex, partages communautaires vérifiés)
- **Liste noire** de sources connues pour abus (un système de modération si une bibliothèque communautaire est lancée)
- **Quarantaine optionnelle** : les items importés atterrissent dans « Partagés », et un second toggle « Valider manuellement chaque import » force une confirmation avant que les items soient visibles dans les sélecteurs

Pour Phase 1 livrée par ce plan, on se contente des 6 couches de contrôle §4.2. Les défenses avancées viendront quand la base d'utilisateurs justifiera leur complexité.

---

## 6. Chaîne d'attribution préservée (détail)

### 6.1 Modèle de données

Chaque entité en « Mes documents » peut porter :

```json
{
    "id": "grille-0001",
    "nom": "Ma grille d'argumentation",
    "auteur": {
        "nom": "Grégoire Bédard",
        "institution": "Cégep Ste-Foy",
        "discipline": "Littérature"
    },
    "inspireDe": {
        "nomItem": "Grille d'argumentation",
        "auteur": "Martin X.",
        "date": "2026-04-15"
    },
    "chaineAttribution": [
        { "niveau": 0, "auteur": "Demo Labo Codex", "nomItem": "Grille d'analyse littéraire" },
        { "niveau": 1, "auteur": "Martin X.", "nomItem": "Grille d'argumentation" }
    ]
}
```

Au moment du fork, `chaineAttribution` est construite comme suit :
- Copier la `chaineAttribution` de l'item source (si elle existe, sinon tableau vide)
- Ajouter l'auteur de l'item source en dernier niveau
- Le nouvel item est considéré comme niveau N+1 implicite (pas stocké dans sa propre chaîne)

### 6.2 Export et import conservent la chaîne

Lors de l'export, le champ `chaineAttribution` est sérialisé dans le package. À l'import, il est conservé tel quel — l'utilisateur importateur voit toute la chaîne.

Lors du fork d'un item partagé, la chaîne s'étend d'un niveau supplémentaire (l'auteur du item partagé est ajouté).

### 6.3 Affichage progressif

UI par défaut :
- Ligne 1 : `par [auteur]`
- Ligne 2 (si `inspireDe` présent) : `Inspiré de [nomItem] (par [auteur])`

Si la `chaineAttribution` contient plus d'un niveau, un chevron (▼) propose de dérouler la chaîne complète. Sinon, rien de plus.

---

## 7. Migration et compatibilité

### 7.1 Pont avec « Configuration pédagogique complète » (Beta 91)

L'export Beta 91 existant utilise un format proche mais pas identique au `labo-codex-partage-v1` proposé ici. Deux options :

- **A** — Aligner les deux formats : l'export Beta 91 devient le même format que Plan 2. Gain : un seul pipeline d'import/export à maintenir.
- **B** — Garder les deux en parallèle : l'ancien format Beta 91 pour les backups complets, le nouveau format pour le partage ciblé item-par-item. Les deux peuvent cohabiter via la détection du champ `format` dans le manifest.

Recommandation : **option A** en Phase 2 de ce plan, après stabilisation. En Phase 1, on livre le nouveau format pour le partage et on laisse l'ancien en place.

### 7.2 Migration des exports existants

Les packages déjà exportés en format Beta 91 (s'il en existe chez des utilisateurs) restent importables via l'ancien pipeline. Pas de migration destructive. Si un utilisateur tente d'importer un package Beta 91 via le nouveau flux de Plan 2, le système détecte le format et propose soit de passer par l'ancien pipeline, soit de convertir (Phase 2).

---

## 8. Phases de livraison

### Phase 1 — Format de package et manifest
- Définition du format `labo-codex-partage-v1`
- Validation stricte (schema fermé, limites de taille)
- Tests unitaires sans UI

### Phase 2 — Pipeline d'export
- Bouton « Exporter pour partager » sur les entités (grilles, échelles, cartouches, productions, pratiques dans un premier temps — les 5 entités Structure)
- Modale de confirmation CC
- Génération du fichier ZIP téléchargeable

### Phase 3 — Pipeline d'import
- Entry point Réglages › Import/Export
- Validation 6 niveaux (§4.2)
- Prévisualisation obligatoire
- Intégration au namespace `partage_*`

### Phase 4 — Section « Partagés » dans les sélecteurs
- Adaptation des sélecteurs des 5 entités Structure (après Plan 1 qui a ajouté la section Démo, Plan 2 ajoute la section Partagés)
- Comportement identique à la section Démo (lecture seule, « Dupliquer »)

### Phase 5 — Attribution chain complète
- Stockage et sérialisation de `chaineAttribution` dans les métadonnées
- Affichage progressif (chevron déroulable)
- Préservation au fork

### Phase 6 — Extension aux 6 entités de Contexte
- Trimestre, Cours, Enseignant, Groupe d'étudiants, Horaire, Groupe-cours
- Mêmes mécanismes que les 5 entités Structure

### Phase 7 — Documentation et Guide utilisateur
- Guide dans Aide expliquant le partage de ressources, le cycle CC, la sécurité
- Exemples de flows (exporter une grille, l'envoyer par email, recevoir un package, prendre comme modèle)

### Phase 8 — Alignement des formats (option A §7.1)
- Convergence du format Beta 91 vers `labo-codex-partage-v1`
- Retrait de l'ancien pipeline après transition

---

## 9. Critères d'acceptation

Sur iPad Safari et Mac Safari, mode clair et sombre :

1. L'utilisateur peut exporter une grille depuis « Mes documents » et recevoir un fichier ZIP valide.
2. Le ZIP exporté contient un `manifest.json` conforme au schéma et une `chaineAttribution` correcte.
3. L'utilisateur peut importer un ZIP via Réglages › Import/Export.
4. La prévisualisation affiche auteur, institution, nombre d'items, chaîne d'attribution avant intégration.
5. Un package corrompu (ZIP invalide) est rejeté avec message clair.
6. Un package avec champ schéma inconnu est rejeté.
7. Un package prétendant être de « Demo Labo Codex » est rejeté.
8. Un package avec un champ HTML brut dans un texte est sanitizé (pas de XSS, rendu comme texte brut).
9. Les items importés apparaissent dans la section « Partagés » des sélecteurs concernés.
10. Un clic sur un item partagé ouvre le formulaire en lecture seule.
11. Un clic sur « Dupliquer » débloque l'édition, exige un nom.
12. Le save crée un nouveau document dans « Mes documents » avec attribution visible incluant la chaîne complète.
13. Une tentative de référencer un item partagé dans un assemblage (groupe-cours, pratique) est refusée avec message clair.
14. Le namespace `partage_*` est isolé : suppression d'items partagés sans effet sur « Mes documents » ni sur la démo.

---

## 10. Risques et points d'attention

- **Sophistication progressive des attaques** : un utilisateur malveillant pourrait composer un package qui passe la validation de schéma mais contient des données sémantiquement perverses (ex. un critère qui affirme être une obligation légale). Le schéma valide la **forme**, pas le sens. Défense : l'utilisateur est responsabilisé par la prévisualisation obligatoire et les avertissements de reconnaissance de source.
- **Éclatement de la chaîne d'attribution** : après plusieurs niveaux de fork, la chaîne peut devenir longue. Affichage replié par défaut, déroulable au besoin. Si la chaîne dépasse N niveaux (ex. 10), on pourrait condenser en « N intermédiaires » avec lien vers une vue détail.
- **Harmonisation UX avec Plan 1** : les trois sections (« Mes documents », « Démo », « Partagés ») doivent visuellement cohérentes. Chaque sélecteur a le même pattern, même hiérarchie, mêmes boutons d'action. Éviter à tout prix deux UX parallèles.
- **Quid de la désinstallation d'un package partagé** ? Un utilisateur pourrait vouloir « désinstaller » un package qu'il a importé. Prévoir dans Réglages › Import/Export une liste des packages importés avec action « Retirer ». La suppression n'affecte que `partage_*` — les forks que l'utilisateur a déjà créés restent (ils sont sa propriété).
- **Tentation d'aller plus loin rapidement** : signature cryptographique, bibliothèque communautaire, URL de partage direct. Ces fonctionnalités ne sont **pas** à livrer dans ce plan. Discipline : livrer Phase 1-7 solidement, attendre qu'il y ait des utilisateurs réels, puis étendre.

---

## 11. Hors périmètre de ce plan

- **Transport en ligne** (URL de partage, bibliothèque communautaire persistante) : reporté à un plan ultérieur, prévu quand une base d'utilisateurs le justifiera.
- **Signature cryptographique** des packages : reportée à Phase 2+ de l'écosystème de partage, hors périmètre ici.
- **Système de modération** pour une bibliothèque publique : hors périmètre.
- **Traduction/internationalisation** des packages : hors périmètre (les packages sont en français par convention).
- **Versioning des items partagés** (un auteur met à jour son grille exportée) : hors périmètre. Un nouveau export produit un nouveau package ; l'importateur doit ré-importer pour avoir la nouvelle version.

---

## Suivi du chantier

| Phase | État | Commit | Notes |
|---|---|---|---|
| Phase 1 — Format de package | À faire | — | |
| Phase 2 — Pipeline d'export | À faire | — | |
| Phase 3 — Pipeline d'import | À faire | — | |
| Phase 4 — Section Partagés (5 entités Structure) | À faire | — | |
| Phase 5 — Chaîne d'attribution | À faire | — | |
| Phase 6 — Extension aux 6 entités Contexte | À faire | — | |
| Phase 7 — Documentation | À faire | — | |
| Phase 8 — Alignement formats | À faire | — | |

Mise à jour : au fil des commits.
