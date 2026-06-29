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

- **Version** : versionnage sémantique depuis le lancement public (3 juin 2026). Numéro courant = `version.json` (source unique de vérité) ; « Bêta publique » est un libellé d'affichage.
- **Objectif** : Suivi de l'apprentissage (dépistage SOLO). Horizon et avancement courants : `ETAT-PROJET.md`.
- **Session en cours** : Voir `SESSION.md`
- **Backlog** : Voir `BACKLOG.md` (taches a faire)
- **Etat du projet** : Voir `ETAT-PROJET.md` (situation vis-a-vis des objectifs de stabilite/perennite/qualite et des plans d'audit)

---

## Principes directeurs

### Stabilite zero-dette (etabli 21 avril 2026)

> Dans un projet sans base d'utilisateurs, il n'y a pas de contrainte de
> retro-compatibilite au-dela de la preservation des donnees personnelles
> du developpeur (qui fait des backups Codex reguliers). Tout nouveau
> chantier RETIRE ce qu'il remplace, il ne l'empile pas a cote. Si un
> refactoring ameliore la stabilite, il est non seulement permis mais
> ATTENDU. La stabilite prime sur la vitesse de livraison.

**Consequences operationnelles** :

- Quand un nouveau systeme est introduit pour remplacer un ancien, le
  chantier n'est pas fini tant que l'ancien n'est pas retire. Pas
  d'alias « au cas ou », pas de code mort « pour plus tard ».
- Refactorisation permise : si un changement rend le code plus propre,
  refactorer meme si le scope s'elargit. Mieux vaut ca qu'un patch qui
  empile la dette.
- Audit des regressions latentes : avant de changer un defaut de
  preference, un flag, une signature de fonction — auditer les
  call-sites pour detecter le code dormant qui pourrait se reveiller.
  (Cas d'ecole : commit `51e5cdc` du 20 avril a reveille primo-accueil
  qui restait silencieux grace au defaut tourGuide=false.)
- Pas de report : ne pas marquer de chantiers « post-AQPC » ou
  « a reporter ». Mieux vaut un codebase propre que des reports.
- Preservation des donnees : la SEULE contrainte de retro-compat est
  que les donnees personnelles de Gregoire (trimestres reels, grilles,
  evaluations) survivent aux changements. Backups Codex reguliers en
  filet de securite, mais on evite quand meme les migrations destructives.

**Comment l'appliquer** :

- Avant chaque chantier : « Est-ce que ce que je remplace est encore
  utilise ? Si non, je supprime en meme temps. Si oui, je migre les
  callers et je supprime ensuite. »
- Ne jamais introduire un nouvel alias ou wrapper « pour compatibilite »
  sans date ou phase explicite de retrait.
- Si un audit revele du code mort, le nettoyer dans la meme session.
- Apres chaque changement de defaut de pref ou flag, grep les callers
  pour identifier les comportements qui vont changer.

---

## Architecture des donnees

**Document fondateur** : `docs/architecture/ECOSYSTEME-DONNEES.md` (26 avril 2026)

Quatre concepts : **Codex** (espace de travail actif), **Archives** (depot local),
**Codex data** (format recherche), **Voute** (bibliotheque partagee).
Lire ce document AVANT de toucher a `codex.js`, `import-export.js`, `db.js`
ou `travaux-stockage.js`.

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

### Tests securite automatises (Defense I, livree 8 mai 2026)
Suite de 29 tests dans `tests/` (Vitest pour fonctions pures + Playwright WebKit pour sandbox/CSP). Couvre A.3 hash CSP, B sanitisation profonde, C validation imports, D whitelist exports, E integration sandbox, F lint statique baseline innerHTML.

**Tout chantier securite Phase 1+ DOIT ajouter au minimum 1 test** qui couvre la defense livree :
- Modification d'une fonction pure → test Vitest dans `tests/unit/` (utiliser `chargerScript()` du helper si la fonction est dans une IIFE)
- Modification d'un comportement browser → test Playwright dans `tests/integration/`

Documentation : `docs/securite/TESTS-AUTOMATISES.md`.

Avant un commit qui touche un module sensible (`js/securite-*.js`, `js/import-export.js`, `js/cc-license.js`, `index.html` CSP) : `cd tests && npm test`. Hook pre-push optionnel : `bash scripts/install-hooks.sh`.

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

**EN TOUT PREMIER, AU DEBUT DE CHAQUE SESSION** : executer le rituel de debut de session decrit dans `Skills pour Claude Code/SKILL_Debut_de_session.md`. Audit factuel git + tests + version + lecture SESSION.md/BACKLOG.md + comparaison avec la premisse de relance recue. Lecture seule, aucune modification. Acte le 28 mai 2026 PM apres ecart de 24h sur le Lot A ✴ (premisse demandait un travail deja livre la veille). Pendant inverse de `SKILL_Fin_de_session.md`.

1. Lire `docs/00-START-HERE.md`
2. **Charger les skills du projet** dans `Skills pour Claude Code/` :
   - `SKILL_labo_codex.md` — architecture, indices A-C-P, pratiques de notation, workflow
   - `SKILL_pratiques_notation.md` — moteur de calcul des pratiques : resolution, deux
     systemes de calcul, simulerIndices, configs executables, pieges (volet TECHNIQUE de
     la notation ; complement de labo_codex §5). Charger pour tout chantier touchant
     `js/pratiques/`, le calcul de la note ou la simulation/comparaison de pratiques.
   - `SKILL_Ecosysteme_classe.md` — cadre pedagogique (ELLAC, SOLO, PAN, SRPNF, IDME, cartouches)
   - `SKILL_Alignement.md` — module Alignement (carte mentale, lecons, sequences, design curriculaire)
   - `SKILL_RaI.md` — depistage SOLO, IPB, diagnostic croise, patterns, interventions RaI
   - `SKILL_Securite_donnees.md` — securite, anonymisation, integrite, modele de menaces, Loi 25
   - `SKILL_integrite_globaux.md` — collections globales partagees (grillesTemplates,
     cours, enseignants, cartouches_*, etc.). Checklist 4 points + 5 anti-patterns
     observes. **Charger en PRIORITE pour tout code qui ecrit/fusionne/filtre dans
     ces cles** (demo-activation.js, reserve.js, import-export.js, futurs modules
     Plan 2). Ne jamais filtrer par flag, toujours par identite de la source.
   - `SKILL_hygiene_donnees_partagees.md` — principes abstraits d'hygiene des
     donnees partagees (observer avant de transformer, transformer explicitement,
     filtrer par identite). Skill parent de `SKILL_integrite_globaux.md`, applicable
     a tout projet. **Charger pour tout nouveau projet ou module manipulant des
     donnees de sources heterogenes.**
   - `SKILL_verification_adverse.md` — principes abstraits pour verifier la qualite
     d'un travail (le sien en auto-verification, ou celui d'une autre session en audit
     tiers). Coeur : l'attestation n'est pas la preuve, et un test doit pouvoir echouer
     (break-test) avant qu'on lui fasse confiance. Skill parent ; instancie en mode A
     par `SKILL_Fin_de_session.md` §4. **Charger AVANT de declarer un chantier fini ou
     quand on demande de verifier/auditer un travail.** Analyse fondatrice :
     `Skills pour Claude Code/ANALYSE-verification-adverse.md`.
   Ces neuf skills sont complementaires et constituent la reference metier du projet.
   **Si travail sur les donnees** (codex, reserve, import/export, anonymisation) :
   charger `SKILL_Securite_donnees.md` EN PRIORITE — les regles de la section 9
   sont obligatoires pour tout code touchant aux donnees.
3. Consulter `BACKLOG.md` pour les taches en attente
4. Consulter `SESSION.md` pour le contexte actuel
   - Consulter aussi `ETAT-PROJET.md` pour se situer vis-a-vis des objectifs de stabilite/perennite/qualite et de l'avancement des plans (document de reference a tenir a jour, distinct du backlog)
5. Identifier le module concerne dans `docs/modules/`
6. Verifier `docs/legacy/` pour les problemes connus
7. **Si travail visuel/UI** : consulter `design-system.html`

---

## Priorite absolue : Retours testeurs

**Quand un testeur signale un bug ou un besoin, on interrompt le plan en cours.**
Les retours utilisateurs passent AVANT le backlog prevu.

**Trackers** :
- `Retours des testeurs/SUIVI-BUGS.md` — bugs ouverts vs corriges avec date/build.
  Consulter AVANT de corriger un bug (evite le travail en double).
- `Retours des testeurs/USAGE-FORMATS.md` — journal d'observation sur l'usage
  des formats par les testeurs (frictions, besoins de partage, detournements
  creatifs, questions recurrentes). Ne pas le laisser dormant : si une
  observation pertinente sur les formats emerge dans une session, l'y noter
  en moins de 30 secondes (date + initiales + 1-3 lignes). Bilans periodiques
  prevus (juillet 2026, octobre 2026, fevrier 2027, mai 2027 = decision
  formats). Compagnon de l'exploration `Rapports/exploration-obsidian/`.

---

## En cas de doute

**Pose la question plutot que de supposer.**
Gregoire a la memoire contextuelle reelle du projet.

---

## Avant chaque commit

0. **Rituel de fin de session** — lancer **`/fin-de-session`** (commande qui déroule
   `SKILL_Fin_de_session.md` §1-§6, dont le **§4 break-test** : faire ROUGIR chaque
   sentinelle de correctif données/sécurité/SSOT avant de lui faire confiance). Le
   filet **mécanique** (Défense I/J : contrôle innerHTML au commit, Vitest au push)
   s'active tout seul via le hook SessionStart (`.claude/hooks/session-start.sh` →
   `scripts/install-hooks.sh`) ; le **§4 adverse** (jugement) reste à ta charge —
   c'est l'étape que le biais d'auteur saute, donc la non négociable.
1. **Décider l'intention de version** (ton jugement) : correction de bug → `patch`,
   nouveauté sans rupture → `minor`, rupture ou changement de format de données → `major`.
   **Confirmer avec Grégoire avant un `major`** (acte visible publiquement) ; `patch`/`minor`
   relèvent du jugement courant.
2. **Lancer le script de release** (source unique, écriture atomique des 4 points de vérité) :
   ```
   node scripts/release.mjs patch|minor|major
   # ou : node scripts/release.mjs --set X.Y.Z      (fixer une version précise)
   # ou : node scripts/release.mjs --build-only      (commit doc/UI sans changer le numéro)
   # ajouter --dry-run pour prévisualiser sans écrire
   ```
   Le script calcule le numéro SemVer, horodate le build (Toronto, `MMJJ-HHMM`) et synchronise
   `version.json`, les deux fallbacks de `js/init-inline.js` et le snapshot de `js/main.js`.
   Plus de recopie manuelle, plus de désync « scripts périmés ».
3. **Vérifier** `git diff` (les 4 points cohérents), puis `cd tests && npm test`.

> `version.json` reste la **source unique de vérité**. « Bêta publique » est un libellé
> d'affichage (`init-inline.js`, `rapport-bug.js`), pas le numéro.

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
- **Les indices A-C-P utilisent un code couleur coherent** partout dans l'app (voir `design-system.html`)
- **Les alertes RaI (niveaux 1-2-3) sont visuellement distinctes** — ne jamais les confondre avec des alertes systeme
- **Les graphiques Chart.js respectent la palette** definie dans les variables CSS

### UX copy et ton

- **Langue** : francais quebecois, vouvoiement evite (l'enseignant tutoie l'app)
- **Ton** : professionnel mais accessible — outil d'enseignant, pas logiciel d'entreprise
- **Vocabulaire pedagogique** : utiliser les termes exacts du projet (indices A-C-P, artefact, pratique de notation, IDME, RaI). Consulter `SKILL_Ecosysteme_classe.md` en cas de doute
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

- **1 entree par version mineure** (`1.24`, `1.25`, `1.26`…) — consolider les patches
- **Pas de dates** — seulement le numero SemVer (`1.25`, pas `1.25 (20 fevrier)`)
- **Max 6-8 items par entree** — orientes fonctionnalite utilisateur
- **Retirer** : corrections CSS, refactos internes, details d'implementation technique
- **Garder** : fonctionnalites nouvelles, corrections de bugs visibles par l'utilisateur
- **Fonction de rendu** : `genererChangelogHTML()` dans le meme fichier — ne pas afficher les dates

Structure d'une entree :
```javascript
{ version: '1.26', couleur: 'vert', titre: 'Titre court', items: ['...'] }
```
Couleurs : vert (features), bleu (ameliorations), orange (corrections).

**Derniere mise a jour** : 28 juin 2026 (schema SemVer — cf. `js/changelog-data.js`)
