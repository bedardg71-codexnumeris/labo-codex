# HOOKS-PLAN2 — points d'extension pour le partage sécurisé

**Statut** : cadrage livré dans la Phase 7 du Plan 1 Autonomisation (24 avril 2026, Beta 99.24).
**Dépend de** : Plan 1 complet (Phases 1-6).
**Alimente** : `plans de travail/PLAN-PARTAGE-RESSOURCES.md` (Plan 2).

---

## 1. Objet de ce document

Le **Plan 1** a mis en place une démo pédagogique CC BY-NC-SA comme matériel de modélisation, avec un mécanisme de duplication (`forkerItem`), d'attribution (`inspireDe`) et d'interdiction des références mixtes. L'architecture est prête pour un cas d'usage plus large : **l'échange d'items entre utilisateurs** (un·e enseignant·e publie une grille, un·e autre la duplique avec attribution propre).

Ce document :

- Inventorie les points d'extension déjà en place dans le code (helpers, contrats, conventions).
- Identifie les **garde-fous** qui doivent être étendus au chemin import.
- Propose le découpage initial de Plan 2 (non engageant — à raffiner lors du cadrage détaillé).

Il ne pose **aucun code**. C'est un document de référence pour la session de cadrage Plan 2.

---

## 2. Hooks existants dans Plan 1 — inventaire

### 2.1 Détection d'origine (`estItemDemo`)

**Fichier** : `js/bibliotheque-ui.js`.

**Signature** : `estItemDemo(item) → boolean`.

**Logique** : retourne `true` si `item.isDemo === true` OU `item.auteur === 'Labo Codex'`.

**Extension Plan 2** :

- Le test devra se généraliser à d'autres sources : `estItemPartage(item)` qui retourne `true` si `item.origine === 'partage-externe'` ou `item.inspireDe.source !== null`.
- Ou alternative : `estItemDemo` reste spécifique à la démo, et une nouvelle fonction `categoriserItem(item)` retourne `'mes-documents' | 'demo' | 'partage'`.

### 2.2 Attribution CC (`obtenirIdentiteCCUtilisateur`)

**Fichier** : `js/cc-license.js`.

**Signature** : `obtenirIdentiteCCUtilisateur() → string`. Retourne le nom saisi dans Réglages › Enseignant, fallback `'Utilisateur de Labo Codex'`.

**Extension Plan 2** :

- Lors d'un export, l'attribution sera inscrite dans les métadonnées de l'item exporté comme `auteur_original` (champ existant).
- Lors d'un import, `obtenirIdentiteCCUtilisateur()` ne doit PAS écraser `auteur_original` — il sert seulement pour les **nouvelles créations** de l'utilisateur local.
- La chaîne `'Demo Labo Codex'` est **réservée** au pack et ne doit jamais être produite via UI (vérifier côté import).

### 2.3 Fork et métadonnée `inspireDe` (`forkerItem`)

**Fichier** : `js/bibliotheque-ui.js`.

**Signature** : `forkerItem(source, prefixeId) → Object` (clone profond via `JSON.parse(JSON.stringify(...))`).

**Champs générés** :
- Nouveau `id` (avec `prefixeId` + timestamp)
- `inspireDe: { source, id, auteur, type }` — métadonnée CC figée au moment du fork
- Retrait des flags `isDemo` / `estDemo` si présents (l'item devient propriété de l'utilisateur)

**Extension Plan 2** :

- `forkerItem` fonctionne déjà pour n'importe quelle source (démo ou autre utilisateur). L'attribution dans `inspireDe` doit simplement pointer correctement :
  - Depuis un item démo : `inspireDe = { source: 'demo', id, auteur: 'Labo Codex', type }`
  - Depuis un item importé partagé : `inspireDe = { source: 'partage', id, auteur: '<nom original>', type, dateImport: ISO, origine: '<id pack import>' }`
- La fonction actuelle n'a **pas besoin d'être modifiée** : le Plan 2 alimente les champs à la source (au moment de l'import d'un package partagé) et `forkerItem` les propage.

### 2.4 Interdiction des références mixtes (`verifierReferencesPasDemo`)

**Fichier** : `js/bibliotheque-ui.js`.

**Logique actuelle** : avant un `save`, vérifie qu'aucune référence sortante ne pointe vers un item `isDemo`. Appelée en 3 points : trimestre-v2 (GC), evaluation.js (×2), pratiques-gestion.

**Extension Plan 2** :

- Après introduction des items « partagés » (qui ont un `inspireDe.source === 'partage'` mais pas de flag `isDemo`), la fonction doit se décliner en :
  - `verifierReferencesPasDemo` : inchangée, interdit les refs vers démo pure
  - `verifierReferencesEtatCoherent` (nouvelle) : vérifie qu'un item utilisateur ne référence pas un item démo **non encore forké**. Pour les items partagés, les références sont OK (partage fait entre pairs, pas de hiérarchie privilégiée).
- Alternative plus simple : étendre `verifierReferencesPasDemo` avec un argument `{permettrePartage: true}` et renommer.

### 2.5 Sélecteurs à 2 sections (`ajouterOptgroupDemo`)

**Fichier** : `js/bibliotheque-ui.js`.

**Logique actuelle** : injecte un `<optgroup label="Démo">` dans les sélecteurs, avec items préfixés `demo-`.

**Extension Plan 2** :

- Généraliser à N sections : `ajouterOptgroupsBibliotheque(select, groupes)` où `groupes = [{label, items, preselectionable}, ...]`.
- Les 11 sélecteurs à 2 sections deviennent 3 sections : `Mes documents` | `Démo` | `Partagés`.
- L'API `ajouterOptgroupDemo` reste utilisable telle quelle (appel plusieurs fois de suite) ou est refactorée en un seul appel générique.

### 2.6 Lecture seule + bouton Dupliquer (`appliquerModeLectureSeuleDemo`)

**Fichier** : `js/bibliotheque-ui.js`.

**Logique actuelle** : applique la lecture seule + injecte un bandeau orange « Demo » + bouton « Dupliquer pour créer ma X ».

**Extension Plan 2** :

- Fonction à généraliser : `appliquerModeLectureSeuleItem(conteneur, item, action, options)` avec `options.type = 'demo' | 'partage'` pour adapter la couleur du bandeau (orange démo / bleu partage, par exemple) et le texte du bouton.

### 2.7 Configuration pédagogique Beta 91 (base d'export existante)

Labo Codex possède déjà un mécanisme d'**export et import d'une configuration pédagogique** (pratiques, grilles, échelles, cartouches) en JSON signé CC BY-NC-SA. Ce mécanisme a été livré en Beta 91 et sert de **fondation** à Plan 2.

**Fichier** : `js/import-export.js`.

**Contrat actuel** :
- Export : produit un JSON avec `_metadata_cc` (licence, auteur, date, version), `pratiques`, `grilles`, `echelles`, `cartouches`.
- Import : valide le schéma, vérifie la licence, demande confirmation avant merge.

**Extension Plan 2** :

- Ajouter validation stricte à l'import : rejeter tout item dont `auteur === 'Demo Labo Codex'` (usurpation) ou `isDemo === true` (ne pas importer les items du pack démo comme s'ils étaient partagés).
- Ajouter sanitization : échappement des champs texte libres avant ré-injection (cohérent avec les règles de sécurité du projet).
- Étendre le schéma exporté avec : les nouveaux champs `inspireDe`, la chaîne d'attribution (si plusieurs `inspireDe` successifs), le `groupeCours` optionnel (si l'utilisateur veut partager un GC complet avec son horaire et ses étudiants anonymisés — à décider).

---

## 3. Garde-fous à extendre à l'import Plan 2

Les règles suivantes s'appliquent déjà au flow interne (duplication démo). Elles doivent être **strictement répliquées** sur le chemin import de Plan 2 :

1. **Attribution `Demo Labo Codex` protégée** : à l'import, tout item dont `auteur === 'Demo Labo Codex'` est rejeté. Message d'erreur explicite à l'utilisateur.
2. **IDs préfixés `demo-` réservés** : tout item dont `id.startsWith('demo-')` est rejeté à l'import.
3. **Flags `isDemo` / `estDemo` réservés** : si un item importé a un de ces flags à `true`, le flag est **retiré silencieusement** (pas bloquant, mais empêche l'usurpation).
4. **Sanitization texte** : champs nom, description, attribution, etc. passés par `echapperHtml()` avant ré-injection DOM.
5. **Validation schéma** : rejeter tout item qui n'a pas les champs obligatoires du type déclaré. Liste par type à formaliser dans le schéma d'import (spec Plan 2).
6. **Préservation `inspireDe`** : si un item importé a déjà un `inspireDe` (issu d'un fork précédent), le préserver tel quel. Si l'utilisateur décide ensuite de forker cet item, `forkerItem` doit poser un nouveau `inspireDe` qui référence l'item importé, pas écraser l'ancien. La chaîne d'attribution est cumulative (au moins 2 niveaux à afficher dans la UI).

---

## 4. Découpage initial proposé pour Plan 2 (à raffiner)

**Phase 2.1 — Mécanisme d'export d'un package partagé**
Export depuis une carte biblio, via un bouton « Partager » à côté de « Dupliquer ». Produit un fichier `.codex-share.json` signé CC BY-NC-SA avec `auteur = obtenirIdentiteCCUtilisateur()`. Inclut l'item principal + toutes ses dépendances (une grille exporte ses cartouches, une production exporte sa grille, etc.).

**Phase 2.2 — Mécanisme d'import + validation stricte**
Bouton « Importer un partage » dans les bibliothèques concernées. Validation schéma, rejets décrits §3, confirmation utilisateur avec aperçu (nom original, auteur, date, licence). Les items importés atterrissent dans une **nouvelle section « Partagés »** des sélecteurs (après « Mes documents » et « Démo »).

**Phase 2.3 — Affichage et duplication des items partagés**
Les items partagés sont non modifiables directement (comme les items démo) — l'utilisateur doit les forker via « Dupliquer pour créer ma copie ». Le bandeau de lecture seule est bleu (distinct du orange démo). La chaîne d'attribution affiche maintenant 2 niveaux visibles : « Inspiré de X (par Y), à partir de Z (par W) ».

**Phase 2.4 — Interface d'échange (email, puis bibliothèque communautaire)**
Le .codex-share.json peut être :
- Envoyé par email (`mailto:` avec pièce jointe).
- (Plus tard) Publié sur une bibliothèque communautaire centralisée. Pas avant que le mécanisme d'échange email soit utilisé en conditions réelles.

**Phase 2.5 — Tests et durcissement**
Tests manuels des 4 garde-fous (§3). Scénarios d'attaque (package avec ID démo usurpé, schéma invalide, champ texte avec XSS potentiel). Tests unitaires `verifierReferencesPasDemo` et `forkerItem`.

---

## 5. Critères de cadrage de Plan 2

Avant d'attaquer l'implémentation, à trancher avec l'utilisateur :

- **Format .codex-share.json v1** : champs obligatoires, extension multi-trimestre, exports partiels vs complets.
- **Comportement si doublon à l'import** (item partagé avec un `id` qui existe déjà localement) : fusion, rejet, rename automatique.
- **Gestion des versions** : si un item a été forké puis le partageur original en publie une version améliorée, quel est le comportement ? (Mise à jour optionnelle, ou simple signalement ?)
- **Anonymisation** si un GC + étudiants est partagé : masquage des DA + noms, modalités.
- **Mécanisme de signature ou de vérification d'origine** (optionnel — la licence CC n'impose pas d'authentification).

---

## 6. Statut d'avancement

| Hook | État au 24 avril 2026 | Prêt pour Plan 2 ? |
|---|---|---|
| `estItemDemo` | Livré Phase 3 | Oui, à généraliser |
| `obtenirIdentiteCCUtilisateur` | Livré Phase 4.A | Oui |
| `forkerItem` | Livré Phase 4.B | Oui |
| `verifierReferencesPasDemo` | Livré Phase 4.C | Oui, à généraliser |
| `ajouterOptgroupDemo` | Livré Phase 2 | Oui, à généraliser |
| `appliquerModeLectureSeuleDemo` | Livré Phase 4.B | Oui, à généraliser |
| Garde-fou « Demo Labo Codex » UI | Livré Phase 4.A | Oui |
| Validation schéma import | **À livrer Plan 2** | — |
| Rejet imports usurpés | **À livrer Plan 2** | — |
| Sélecteurs à 3 sections | **À livrer Plan 2** | — |
| Chaîne d'attribution multi-niveaux | **À livrer Plan 2** | — |

---

Plan 1 est techniquement prêt pour accueillir Plan 2. Le cadrage détaillé de Plan 2 peut commencer dès qu'un besoin concret émerge (premier partage effectif entre enseignants, par exemple en contexte AQPC).
