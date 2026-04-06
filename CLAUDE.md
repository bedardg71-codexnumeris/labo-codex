# Monitorage Pedagogique - Guide Claude Code

> **IMPORTANT** : Ce fichier est un point d'entree leger.
> La documentation complete est dans `/docs/`.

---

## Lecture obligatoire

**Commence TOUJOURS par** : `docs/00-START-HERE.md`

Ce document te guidera vers :
- Les decisions critiques a ne jamais oublier
- L'architecture du systeme
- Le module specifique sur lequel tu travailles

---

## Etat actuel

- **Version** : Beta 99.06 (Build 0406-1520)
- **Objectif** : Plan de consolidation avril 2026 — TOUS LES TIERS TERMINES (0→7.8) + Audit UX cohérence visuelle
- **Session en cours** : Voir `SESSION.md`
- **Backlog** : Voir `BACKLOG.md` (taches a faire)

---

## Contraintes techniques

- **Stack** : HTML5 / CSS3 / JavaScript ES6+ pur (aucune dependance externe sauf Chart.js)
- **Stockage** : Hybride localStorage (< 200 Ko) + IndexedDB/memoryCache (> 200 Ko) via `db.js`
- **Fonctionnement** : 100% hors-ligne
- **CSP** : `script-src 'self'` — zero script inline, zero `eval()`

---

## Regles de securite (audit 26 mars 2026)

**Ces regles sont NON NEGOCIABLES. Tout nouveau code DOIT les respecter.**

### innerHTML et donnees utilisateur
Tout `innerHTML` qui injecte des donnees utilisateur (noms d'etudiants, titres de productions, texte libre, donnees importees) **DOIT** utiliser `echapperHtml()`. Pas d'exception.
```javascript
// INTERDIT :
container.innerHTML = '<div>' + etudiant.nom + '</div>';
// OBLIGATOIRE :
container.innerHTML = '<div>' + echapperHtml(etudiant.nom) + '</div>';
```

### Handlers inline
Zero handler inline (`onclick=`, `onchange=`, etc.) dans le HTML genere. Utiliser `data-action`, `data-on-change`, etc. (voir dispatcher dans `main.js` lignes 700-780).

### Imports ZIP
Tout import ZIP **DOIT** passer par `validerZipSecurite(zip)` (definie dans `import-export.js`). Cette fonction verifie : taille decompressee < 2 Go, pas de path traversal, pas de chemins absolus.

### Imports images/PDF
Tout import de fichier image ou PDF **DOIT** passer par `validerMagicBytes(blob)` (definie dans `travaux-import.js`). Verifie les signatures PNG/JPEG/PDF/WebP/HEIC.

### console.log
Nouveau code = `console.warn` / `console.error` uniquement. Les `console.log` de debug doivent etre retires avant commit.

---

## Zones protegees

**NE JAMAIS MODIFIER sans autorisation** :
- `js/config.js` - Configuration navigation
- `js/navigation.js` - Logique navigation
- `noms_stables.json` - Registre des noms proteges

---

## Principe architectural

**Single Source of Truth** : Chaque donnee a UNE source unique.
Les modules ne se parlent JAMAIS directement - communication via localStorage/IndexedDB uniquement.
Registre complet des cles avec proprietaires : `docs/DATA-OWNERSHIP.md`.

---

## Namespacing des donnees

Les donnees sont prefixees par trimestre : `h2026_groupeEtudiants`, `a2025_presences`, etc.
Utiliser `window.cle('nomCle')` pour obtenir la cle namespacee.

---

## Procedure de developpement

1. Discussion sur la fonctionnalite (Cowork au besoin)
2. Lire les fichiers concernes AVANT de planifier
3. Planification detaillee, etape par etape (Cowork au besoin)
4. Anticiper les erreurs utilisateur sur Mac et iPad separement
5. Implementer UN fichier a la fois
6. Valider fonctionnellement apres chaque fichier
7. Debuguer avant de passer a l'etape suivante
8. Documenter, committer et pusher seulement apres validation
9. En fin de session : resume de ce qui est fait, ce qui reste, les risques

---

## Avant de coder

1. Lire `docs/00-START-HERE.md`
2. **Charger les skills du projet** dans `Skills pour Claude Code/` :
   - `SKILL_labo_codex.md` — architecture, indices A-C-P-E, pratiques de notation, workflow
   - `SKILL_Ecosysteme_classe.md` — cadre pedagogique (ELLAC, SOLO, PAN, SRPNF, IDME, cartouches)
   - `SKILL_Alignement.md` — module Alignement (carte mentale, lecons, sequences, design curriculaire)
   Ces trois skills sont complementaires et constituent la reference metier du projet.
3. Consulter `BACKLOG.md` pour les taches en attente
4. Consulter `SESSION.md` pour le contexte actuel
5. Identifier le module concerne dans `docs/modules/`
6. Verifier `docs/legacy/` pour les problemes connus
7. **Si travail visuel/UI** : consulter `design-system.html`

---

## Priorite absolue : Retours testeurs

**Quand un testeur signale un bug ou un besoin, on interrompt le plan en cours.**
Les retours utilisateurs passent AVANT le backlog prevu.

**Tracker** : `Retours des testeurs/SUIVI-BUGS.md`
- Consulter AVANT de corriger un bug (evite le travail en double)
- Bugs ouverts vs corriges avec date/build

---

## En cas de doute

**Pose la question plutot que de supposer.**
Gregoire a la memoire contextuelle reelle du projet.

---

## Avant chaque commit

1. **Demander le numero de beta** a Gregoire. Ne jamais renumeroter automatiquement.
2. **Mettre a jour `version.json`** a la racine du projet — c'est la **source unique de verite** :
```json
{"build":"MMJJ-HHMM","beta":"XX.X"}
```
Format BUILD : mois-jour-heure-minute (Toronto). Exemple : `"0201-0840"` = 1er fevrier, 08h40.
L'en-tete de l'app charge `version.json` au demarrage et synchronise `VERSION_MAJEURE` et `BUILD_ID` automatiquement. Les valeurs dans `index.html` ne sont que des fallback hors-ligne.
3. **Mettre a jour les fallback** dans `index.html` (ligne ~17166) :
```javascript
let VERSION_MAJEURE = 'XX.X';
let BUILD_ID = 'MMJJ-HHMM';
```
Les deux endroits doivent avoir les memes valeurs que `version.json`.

---

## Reference visuelle obligatoire (Design System)

**AVANT de creer ou modifier tout element visuel** (bouton, carte, formulaire, alerte, badge, tableau, navigation, etc.), consulter OBLIGATOIREMENT :

**`design-system.html`** (racine du projet)

Ce document est la source de verite pour :
- La palette de couleurs (modes sombre et clair)
- Les surfaces, ombres et border-radius
- Les boutons, formulaires, cartes, en-tetes
- La navigation, les tableaux, alertes et badges

**Regles** :
- Tout nouveau composant DOIT utiliser les variables CSS existantes de `styles.css`
- Ne jamais inventer de nouvelles couleurs en dur — utiliser les `--variables`
- Verifier la conformite dans les DEUX modes (sombre et clair)
- L'ancien design system modulaire (01a-07) est archive dans `Design system - Modules/_archives/`

---

## References visuelles importantes

### Animation bulles en-tete (parallaxe)
Points colores qui circulent de gauche a droite dans l'en-tete :
- **CSS** : `index.html` lignes 1465-1560 (`.bulles-container`, `.bulle`, `@keyframes floatUp`)
- **JS** : `js/main.js` lignes 128-240 (`creerUneBulle()`, `genererBullesApprentissage()`)
- **Effet parallaxe** : grandes=rapides (proches), petites=lentes (eloignees)

### Points etudiants tableau de bord (3D)
Points blancs dans les barres graduees de l'apercu :
- **CSS** : `styles.css` lignes 9058-9120 (`.barre-etudiant`, `@keyframes float-vertical`)
- **Effet 3D** : gradient + box-shadow avec lumiere gauche→droite

---

## Regles de design d'interface

**Principe directeur** : L'interface sert un enseignant en action. Chaque ecran doit permettre de detecter, comprendre et agir rapidement — pas d'ornementation, pas de complexite inutile.

### Processus obligatoire pour tout changement visuel

1. **Consulter `design-system.html`** — source de verite pour couleurs, composants, surfaces, modes sombre/clair
2. **Utiliser les variables CSS de `styles.css`** — jamais de couleurs en dur, jamais de nouvelles variables sans raison documentee
3. **Tester les deux modes** (sombre et clair) avant de considerer le travail termine
4. **Verifier l'accessibilite de base** : contraste texte/fond >= 4.5:1, cibles tactiles >= 44px (iPad), focus clavier visible

### Hierarchie visuelle

L'interface est dense par necessite (tableaux de bord, listes d'etudiants, graphiques). Regles pour maintenir la lisibilite :

- **Un seul element d'attention primaire par ecran** — le regard doit savoir ou aller
- **Les indices A-C-P-E utilisent un code couleur coherent** partout dans l'app (voir `design-system.html`)
- **Les alertes RaI (niveaux 1-2-3) sont visuellement distinctes** — ne jamais les confondre avec des alertes systeme
- **Les graphiques Chart.js respectent la palette** definie dans les variables CSS

### UX copy et ton

- **Langue** : francais quebecois, vouvoiement evite (l'enseignant tutoie l'app)
- **Ton** : professionnel mais accessible — outil d'enseignant, pas logiciel d'entreprise
- **Vocabulaire pedagogique** : utiliser les termes exacts du projet (indices A-C-P-E, artefact, pratique de notation, IDME, RaI). Consulter `SKILL_Ecosysteme_classe.md` en cas de doute
- **Messages d'erreur** : dire ce qui s'est passe, pourquoi, et quoi faire — en une phrase si possible
- **Etats vides** : guider l'enseignant vers l'action suivante (pas juste « aucune donnee »)

### Accessibilite (minimum requis)

Labo Codex est utilise sur MacBook (M3) et iPad Air (M1). Cibles :

- **Contraste** : WCAG 2.1 AA minimum (4.5:1 texte, 3:1 elements graphiques)
- **Navigation clavier** : tout element interactif atteignable par Tab, activable par Entree/Espace
- **Focus visible** : outline ou indicateur clair sur l'element focus — ne jamais le masquer
- **SPA et focus** : lors des changements de vue, deplacer le focus vers le titre ou le contenu principal de la nouvelle vue
- **Tactile (iPad)** : zones de toucher minimum 44x44px, espacement suffisant entre cibles adjacentes
- **Graphiques Chart.js** : fournir un equivalent textuel (tableau ou resume) pour les donnees critiques

### Responsive

- **Desktop** (>1024px) : disposition par defaut
- **Tablette** (768-1024px, iPad Air) : adapter les tableaux et tableaux de bord. C'est le second cas d'usage principal
- **Mobile** (<768px) : non prioritaire actuellement, mais ne pas casser l'affichage

### Anti-patterns a eviter

- Inventer des couleurs hors de la palette (`--variables` de `styles.css`)
- Ajouter des animations purement decoratives (sauf les bulles parallaxe de l'en-tete, deja en place)
- Creer des modales ou dialogues quand un panneau lateral ou une section inline suffit
- Masquer de l'information derriere des interactions non evidentes (hover-only, gestes exotiques)
- Dupliquer du microcopy existant au lieu de le reutiliser

---

## Changelog (`js/changelog-data.js`)

Le changelog est affiche aux utilisateurs dans la section « Nouvelles » de l'accueil. Regles :

- **1 entree par version majeure** (Beta 95, 96, 97, 98) — consolider les sous-versions
- **Pas de dates** — seulement le numero de beta (`Beta 98`, pas `Beta 98 (20 fevrier)`)
- **Max 6-8 items par entree** — orientes fonctionnalite utilisateur
- **Retirer** : corrections CSS, refactos internes, details d'implementation technique
- **Garder** : fonctionnalites nouvelles, corrections de bugs visibles par l'utilisateur
- **Fonction de rendu** : `genererChangelogHTML()` dans le meme fichier — ne pas afficher les dates

Structure d'une entree :
```javascript
{ version: 'Beta XX', couleur: 'vert', titre: 'Titre court', items: ['...'] }
```
Couleurs : vert (features), bleu (ameliorations), orange (corrections).

**Derniere mise a jour** : 14 mars 2026
