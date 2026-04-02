# Plan de consolidation — Avril 2026 (Beta 99)

> **Objectif** : Application solide, logique et perenne pour le colloque AQPC (debut juin 2026).
> **Methode** : Refactorisation, nettoyage, assainissement. Zero nouvelle fonctionnalite.
> **Rythme** : Claude Code travaille en tache de fond sans perturber le flux quotidien de Gregoire.
> **Mai** : Reserve aux mises a jour mineures uniquement.
> **Audit source** : Discussion Cowork du 27 mars 2026 (audit exploratoire complet du codebase).
> **Mise a jour** : Ajout Tier 0 (anonymisation), Tier 2.5 (securite imports), Tier 3.5 (coherence visuelle), Tier 4.5 (metadonnees/CC) — 27 mars 2026.
> **Mise a jour** : Ajout Tier 5.5 (preparation colloque AQPC — presentation 150 personnes, MacBook) — 27 mars 2026.
> **Mise a jour** : Ajout Tier 6 (consolidation SSOT) et Tier 7 (systeme d'aide utilisateur) — issus des audits exhaustifs AUDIT-SSOT.md et AUDIT-AIDE.md du 2 avril 2026. Plans detailles dans PLAN-SSOT.md et PLAN-AIDE.md.
> **Contre-expertise** : Verification code par Claude Code (27 mars 2026). Corrections factuelles appliquees — voir errata ci-dessous.
> **Contexte colloque** : Presentation devant ~150 personnes sur MacBook (pas iPad). Pas de kiosque. USB codex non termine.
> **Demo** : La demo au colloque doit refleter l'experience reelle de Gregoire (donnees, flux de travail). La preparation du scenario de demo est un chantier separe, a planifier fin avril / debut mai.

---

## Errata — Corrections issues de la contre-expertise (27 mars 2026)

Les audits Cowork contiennent **5 affirmations factuellement incorrectes** qui ont ete corrigees dans ce plan :

1. **« groupeEtudiants — aucune ecriture detectee »** → FAUX. L'ecriture existe dans `donnees-demo.js:512` (`db.setSync(cleEtudiants, groupeEtudiants)`) et dans `fix-data.js:23`. L'audit a manque les cas ou la cle est construite via variable. L'entite n'est pas « fantome ». Les lectures sans namespace restent de vrais bugs.
2. **« guidage-demo.js — code mort / orphelin »** → FAUX. Le fichier EST charge dans `index.html:16924`. Ne pas archiver.
3. **« indicesPatternsRaI — write-only, jamais lue »** → FAUX. Deux lecteurs existent : `tableau-bord-apercu.js:610` et `profil-etudiant.js:8665`. Cle declaree dans `trimestres.js:51`.
4. **« obtenirEtudiants — 4 variantes »** → PARTIELLEMENT FAUX. Seulement 3 variantes confirmees. La 4e dans `evaluation.js:~150` n'existe pas.
5. **« beforeunload absent de db.js »** → FAUX. Le handler existe deja dans `db.js:1073-1078` avec `_pendingWrites`.

Ajouts non identifies par l'audit :
- `spe-specifications.js:917` contient aussi un `db.set('grilles', grilles)` — c'est une **ecriture** qui corrompt la cle globale, pas juste une lecture du mauvais trimestre.
- `evaluation.js:3973` concatene des noms de groupes dans innerHTML sans `echapperHtml()` — violation XSS.
- **546 appels `alert()`** dans le codebase JS — risque majeur pour la demo AQPC.

---

## Principes directeurs

1. **Ne rien casser.** Chaque chantier est testable independamment. En cas de doute, demander a Gregoire.
2. **Un chantier a la fois.** Terminer, valider, committer avant de passer au suivant.
3. **Mesurer avant/apres.** Chaque chantier a un critere de reussite verifiable.
4. **Pas de refactoring structurel lourd.** Pas de split de gros fichiers, pas de migration async. C'est post-AQPC.

---

## Tier 0 — Anonymisation (confidentialite etudiante — colloque AQPC)

**Priorite** : BLOQUANTE POUR TOUTE DEMO — faire en tout premier
**Effort** : ~2 heures
**Risque si non fait** : Noms reels d'etudiants visibles lors de presentations publiques

### 0.1 Fuites dans les exports PDF

**Probleme** : `travaux-export-pdf.js` contourne le mode anonymisation a 3 endroits.

**Fichiers a corriger** :

- **`travaux-export-pdf.js:826`** — L'en-tete du PDF affiche `evaluation.etudiantNom` en clair.
  Fix : verifier le mode anonymisation et utiliser `anonymiserNom(evaluation.etudiantDA)` si actif.
  ```
  // AVANT (ligne 826)
  const nomEtudiantEntete = (evaluation.etudiantNom || '') + ...
  // APRES
  const nomAnonyme = typeof anonymiserNom === 'function' && anonymiserNom(evaluation.etudiantDA);
  const nomEtudiantEntete = nomAnonyme || (evaluation.etudiantNom || '') + ...
  ```

- **`travaux-export-pdf.js:1652`** — Le nom du fichier PDF telecharge contient le vrai nom.
  Fix : utiliser le nom anonymise pour le fichier de sortie.
  ```
  // AVANT (ligne 1652)
  const nomEtudiant = etudiant ? `${etudiant.prenom}_${etudiant.nom}` : da;
  // APRES — etudiant vient deja de obtenirDonneesSelonMode, donc
  // prenom/nom sont deja anonymises SI la lecture passe par le bon canal.
  // Verifier que c'est bien le cas.
  ```

- **`travaux-export-pdf.js:1110`** — Historique lu via `db.getSync()` au lieu de `obtenirDonneesSelonMode()`.
  Fix : remplacer `db.getSync(cle('evaluationsSauvegardees'), [])` par `obtenirDonneesSelonMode('evaluationsSauvegardees')`.

**Procedure** :
1. Grep pour tous les `db.getSync` dans `travaux-export-pdf.js` — chaque occurrence qui lit des donnees etudiantes doit passer par `obtenirDonneesSelonMode`
2. Grep pour tous les `etudiantNom`, `etudiantDA`, `etudiant.nom`, `etudiant.prenom` dans le meme fichier — chaque affichage doit etre anonymise si le mode est actif
3. Tester en mode anonymisation : exporter un PDF et verifier qu'aucun nom reel n'apparait dans le contenu NI dans le nom du fichier

### 0.2 Noms de fichiers travaux non anonymises

**Probleme** : `fichiersTravaux` n'est pas couvert par `anonymiserDonnees()` dans `modes.js` (le switch/case ligne 716-758 ne traite que `groupeEtudiants`, `evaluationsSauvegardees`, `presences`). Les noms de fichiers importes (ex: `Tremblay_Sophie_TP2.pdf`) sont affiches tels quels.

**Fichiers concernes** :
- `js/travaux-ui.js` : lignes 2266, 2677, 2743 — affiche `nomFichier` dans les badges et miniatures
- `js/travaux-preparation.js` — affiche les noms de fichiers dans le pipeline

**Procedure** :
1. Ajouter un case `'fichiersTravaux'` dans `anonymiserDonnees()` (modes.js) qui :
   - Remplace `nomFichier` par un nom generique (ex: `Document_001.pdf`, `Document_002.pdf`)
   - Preserve l'extension originale
   - Ou : anonymise le nom de l'etudiant dans le nom de fichier si un pattern est detectable (ex: remplacer `Tremblay_Sophie` par `Eleve_5`)
2. Alternative plus simple : dans les modules d'affichage, si mode anonymisation actif, afficher un nom generique au lieu de `nomFichier`

**Critere de reussite** : En mode anonymisation, aucun nom de fichier contenant un nom d'etudiant n'est visible a l'ecran ni dans les exports.

### 0.3 Retroactions dans les exports PDF

**Probleme** : La fonction `anonymiserTexteRetroaction()` existe dans `modes.js` (ligne 460) mais n'est pas appelee dans le flux d'export PDF (`travaux-export-pdf.js`). Si une retroaction mentionne l'etudiant par son prenom (ex: «Bravo Sophie, ton analyse...»), le prenom reel apparait dans le PDF exporte en mode anonymisation.

**Procedure** :
1. Dans `travaux-export-pdf.js`, identifier tous les endroits ou `retroactionFinale` ou `c.retroaction` est rendu dans le PDF
2. Si le mode anonymisation est actif, passer le texte par `anonymiserTexteRetroaction(texte, etudiantDA)` avant rendu

**Critere de reussite** : En mode anonymisation, les retroactions dans les PDF ne contiennent aucun prenom reel.

### 0.4 Couverture d'anonymisation — audit de completude

**Probleme** : `anonymiserDonnees()` ne couvre que 3 types de donnees sur ~15. Les types non couverts retournent les donnees brutes (ligne 755-757 : `default: return donnees`).

**Types manquants a evaluer** :
- `fichiersTravaux` → traite en 0.2
- `interventions` → peuvent contenir des noms d'etudiants dans le texte libre
- `snapshots` → contiennent des copies des donnees brutes
- `productions` → les titres ne sont pas sensibles, mais verifier
- `objectifs`, `grilles`, `echelles`, `cartouches` → normalement pas de donnees etudiantes, mais verifier

**Procedure** :
1. Pour chaque type non couvert, verifier s'il contient des donnees etudiantes directes ou indirectes
2. Si oui, ajouter un case dans `anonymiserDonnees()` ou traiter au niveau de l'affichage
3. Porter une attention particuliere aux `interventions` (texte libre lie a un etudiant)

**Critere de reussite** : Liste exhaustive documentee de ce qui est anonymise et ce qui ne l'est pas, avec justification pour chaque exclusion.

---

## Tier 1 — Corrections critiques (donnees incorrectes possibles)

**Priorite** : IMMEDIATE — faire en premier
**Effort** : ~1.5 heure (scope elargi par la contre-expertise : + violations primo-*, spe-specifications ecriture, XSS)
**Risque si non fait** : Lecture de donnees du mauvais trimestre, corruption de grilles, crash silencieux

### 1.1 Lectures et ecritures sans namespace trimestre

**Probleme** : Plusieurs appels `db.get()`/`db.getSync()`/`db.set()` sans `cle()` lisent ou ecrivent les donnees hors namespace trimestre. En contexte multi-trimestre, ces appels retournent ou corrompent les mauvaises donnees.

**Fichiers a corriger (lectures)** :
- `js/echelles.js` ligne 3715 : `db.get('evaluations')` → `db.get(cle('evaluationsSauvegardees'))`
- `js/echelles.js` ligne 3744 : meme probleme
- `js/spe-specifications.js` ligne 917 : `db.get('grilles')` → `db.get(cle('grilles'))`
- `js/primo-accueil.js` lignes 38, 436 : `db.getSync('groupeEtudiants')` → `db.getSync(cle('groupeEtudiants'))`
- `js/primo-validation-champs.js` ligne 164 : meme probleme
- `js/rapport-bug.js` ligne 450 : meme probleme — verifier si l'acces global est intentionnel (rapport-bug veut peut-etre TOUS les etudiants)

**Fichier a corriger (ecriture — CORRUPTION)** :
- `js/spe-specifications.js` ligne 917 : `db.set('grilles', grilles)` → `db.set(cle('grilles'), grilles)`. Ce n'est pas seulement une lecture du mauvais trimestre — c'est une **ecriture qui ecrase la cle globale** avec des donnees qui devraient etre namespacees.

**Procedure** :
1. Lire les lignes concernees et leur contexte (10 lignes avant/apres)
2. Verifier la cle exacte attendue (le nom peut differer : `evaluations` vs `evaluationsSauvegardees`)
3. Corriger avec `cle('...')`
4. Chercher d'autres occurrences : `grep -n "db\.get\('" js/*.js | grep -v "cle("` pour trouver tout appel db.get avec une string litterale non wrappee dans cle()

**Critere de reussite** : Zero appel `db.get('string_litterale')` ou `db.getSync('string_litterale')` pour les cles de donnees namespacees par trimestre. Les cles globales (ex: `pratiquesConfigurables`, `preferences`, `profilEnseignant`) sont exclues de cette verification — elles sont intentionnellement non namespacees.

**⚠️ ATTENTION** : Certaines cles sont legitimement globales (pas de namespace trimestre). Avant de wrapper un appel dans `cle()`, verifier dans `js/trimestres.js` lignes 40-80 la liste des cles namespacees. En cas de doute, demander a Gregoire.

### 1.2 Acces tableau sans verification de bornes

**Probleme** : `evaluation.js:4252` accede a `triees[1]` sans verifier que le tableau contient au moins 2 elements.

**Procedure** :
1. Lire le contexte de la ligne 4252 dans `evaluation.js`
2. Ajouter une verification `if (triees.length > 1)` ou equivalent
3. Verifier s'il y a d'autres acces similaires dans le meme fichier (chercher `[1]`, `[2]`, etc. sur des tableaux dont la taille n'est pas garantie)

**Critere de reussite** : L'acces a un index > 0 est precede d'une verification de longueur.

### 1.3 Normaliser les lectures de `groupeEtudiants`

**Probleme** : Deux patterns de lecture coexistent dans le codebase :
- **Correct** : `obtenirDonneesSelonMode('groupeEtudiants')` — namespace + filtrage automatiques
- **Problematique** : `obtenirDonneesSelonMode(cle('groupeEtudiants'))` — double namespace (la fonction applique `cle()` en interne)
- **Problematique** : `db.getSync(cle('groupeEtudiants'))` — contourne le filtrage par cours et par mode

L'heuristique dans `modes.js:528` detecte et compense le double namespace, mais c'est fragile.

**Fichiers concernes** (liste non exhaustive, a verifier par grep) :
- `js/travaux-import.js` : lignes 160, 170, 923
- `js/travaux-ui.js` : lignes 1024, 2273, 2746, 5075, 5101
- `js/travaux-archivage.js` : lignes 32, 95, 158
- `js/travaux-resolution.js` : ligne 122

**Procedure** :
1. Grep pour tous les `obtenirDonneesSelonMode(cle('groupeEtudiants'))` et `db.getSync(cle('groupeEtudiants'))`
2. Pour chaque occurrence, evaluer si le filtrage par cours/mode est necessaire :
   - Si oui : remplacer par `obtenirDonneesSelonMode('groupeEtudiants')`
   - Si non (cas rare, ex: rapport-bug qui veut TOUS les etudiants) : documenter l'intention avec un commentaire
3. Faire la meme verification pour les autres entites namespacees : `evaluationsSauvegardees`, `presences`, `productions`, `fichiersTravaux`

**Critere de reussite** : Tous les appels `obtenirDonneesSelonMode()` recoivent une cle de base (sans namespace), sauf cas documentes explicitement.

### 1.4 Echappement HTML manquant dans evaluation.js

**Probleme** : `evaluation.js:3973` concatene des noms de groupes directement dans `innerHTML +=` sans `echapperHtml()`. Violation de la regle de securite CLAUDE.md.

**Procedure** :
1. Lire la ligne 3973 de `evaluation.js`
2. Remplacer la concatenation directe par `echapperHtml(groupe)` ou equivalent
3. Verifier les lignes voisines (3983, 3998) — celles-ci utilisent deja `echapperHtml()`, confirme

**Critere de reussite** : Aucun `innerHTML +=` dans `evaluation.js` ne concatene de donnees sans echappement.

---

## Tier 2 — Storage (perte de donnees possible)

**Priorite** : HAUTE — faire immediatement apres Tier 1
**Effort** : ~2.5 heures (reduit : 2.2 est deja implemente, 2.4 est partiellement intentionnel)
**Risque si non fait** : Perte de donnees au Cmd+Q, saturation localStorage progressive

### 2.1 Extraire les thumbnails de `fichiersTravaux`

**Probleme** : `thumbnailDataUrl` (base64) represente ~80% des 3.8 Mo de `fichiersTravaux`. Chaque thumbnail = 15-30 Ko. Avec 184 fichiers, ca sature localStorage.

**Procedure** :
1. Creer une cle IDB dediee `thumbnails` (ou utiliser le store `fichiers` existant) indexee par `fichierTravail.id`
2. Dans l'objet metadonnees (`travaux-stockage.js:306-332`), remplacer `thumbnailDataUrl: metadonnees.thumbnailDataUrl || ''` par `hasThumbnail: true/false`
3. Creer `obtenirThumbnail(fichierId)` async qui lit depuis IDB
4. Modifier les 2 consommateurs :
   - `js/profil-etudiant.js` ligne 8996
   - `js/travaux-preparation.js` ligne 2366
   Pour charger les thumbnails a la demande (lazy loading)
5. Ecrire une migration one-shot qui extrait les thumbnails existants et nettoie les metadonnees

**Critere de reussite** : `fichiersTravaux` passe sous 800 Ko. Les thumbnails s'affichent toujours dans le profil etudiant et la preparation des travaux.

### 2.2 Valider le flush IDB dans `beforeunload` (deja implemente)

**Etat** : Le mecanisme existe deja dans `db.js:1073-1078`. Le handler `beforeunload` detecte les ecritures IDB en cours via `_pendingWrites` et bloque la fermeture si necessaire. **Ce chantier est de la validation, pas de l'implementation.**

**Procedure** :
1. Relire le code de `db.js:1073-1078` — verifier que le `Set` `_pendingWrites` est correctement alimente (ajout avant `_setIndexedDB()`, retrait dans `.then()`)
2. Tester specifiquement sur Safari `file://` (limitations connues de `beforeunload`) :
   - Safari macOS (M3)
   - Safari iPadOS (M1, iPad Air 5)
   - Scenario : modifier une evaluation → Cmd+Q immediat → reouverture
3. Si le test echoue sur Safari `file://`, envisager un fallback (ex: ecriture synchrone pour les cles critiques)

**Critere de reussite** : Apres modification + fermeture immediate + reouverture, les donnees sont preservees. Le mecanisme existant est valide ou corrige.

### 2.3 Seuil IDB-first explicite

**Probleme** : Actuellement, `setSync()` tente TOUJOURS localStorage d'abord, echoue sur quota, puis bascule en memoryCache + IDB. Ce comportement accidentel devrait etre intentionnel.

**Procedure** :
1. Ajouter une constante `SEUIL_IDB_DIRECT = 200000` (200 Ko) en haut de `db.js`
2. Dans `setSync()`, avant le try/catch localStorage : estimer la taille (`this._estimateSize(value)`). Si > seuil, aller directement en memoryCache + IDB sans tenter localStorage
3. Documenter le comportement dans l'en-tete de `db.js`

**Critere de reussite** : Zero `QuotaExceededError` dans la console pendant une session normale.

### 2.4 Nettoyer les appels directs a localStorage

**Probleme** : 7 fichiers JS contournent `db.js` avec des appels `localStorage.setItem/getItem/removeItem` directs. Ca gaspille du quota et echappe au mecanisme de fallback.

**Nuance (contre-expertise)** : L'audit d'architecture montre que la majorite de ces acces sont **intentionnels** — etat UI local (panneaux), donnees de prototypage, synchro snapshots. Seuls 2-3 fichiers meritent reellement une migration.

**Fichiers a migrer (acces non justifies)** :
- `js/travaux-ui.js` : 11 appels pour l'etat des panneaux — devrait utiliser `db.setSync()` avec une cle non namespacee
- `js/planification-donnees.js` : 7 appels pour les prototypes — devrait utiliser `db.setSync()`

**Fichiers a documenter (acces intentionnels)** :
- `js/snapshots.js` : synchro localStorage ↔ IDB explicite — laisser tel quel, ajouter commentaire
- `js/rapport-bug.js` : donnees testeur hors cycle pedagogique — laisser tel quel, ajouter commentaire
- `js/init-inline.js` : bootstrap/debug, s'execute avant `db.js` — exception documentee
- `js/organisateur.js` : etat UI — faible priorite
- `js/statistiques.js` : 1 seul appel — faible priorite

**Procedure** :
1. Migrer `travaux-ui.js` et `planification-donnees.js` vers `db.setSync()`/`db.getSync()`
2. Ajouter un commentaire `// ACCES DIRECT INTENTIONNEL — [raison]` dans les autres fichiers
3. **Exception** : `init-inline.js` — documenter que db.js n'est pas encore charge a ce moment

**Critere de reussite** : Les acces directs restants sont documentes. Les 2 fichiers prioritaires sont migres.

### 2.5 Fusionner la double synchronisation au demarrage

**Probleme** : `_prechargerDepuisIDB()` (ligne 142) et `syncToLocalStorageCache()` (ligne 609) font un travail redondant au demarrage. Le premier charge les cles IDB manquantes dans memoryCache, le second ecrase ce travail en tentant de remettre TOUTES les cles IDB dans localStorage.

**Procedure** :
1. Supprimer l'appel a `_prechargerDepuisIDB()` dans le callback `onsuccess` (ligne 114)
2. Dans `syncToLocalStorageCache()`, s'assurer que le comportement de fallback memoryCache est correct (c'est deja le cas, lignes 634-644)
3. Garder `_prechargerDepuisIDB()` comme methode disponible mais non appelee automatiquement (au cas ou)

**Critere de reussite** : Un seul mecanisme de synchronisation au demarrage. Le log console montre les memes cles chargees en memoryCache qu'avant.

### 2.6 Documenter la source de verite dans `db.js`

**Probleme** : L'en-tete (ligne 6) dit « localStorage = Store primaire de facto ». Le commentaire de `syncToLocalStorageCache` (ligne 627) dit « IndexedDB = source de verite ». Les deux sont vrais dans des contextes differents.

**Procedure** : Reecrire l'en-tete de `db.js` pour clarifier :
- Petites cles (< SEUIL_IDB_DIRECT) : localStorage est la source de verite, IDB est le backup
- Grosses cles (> SEUIL_IDB_DIRECT) : IDB est la source de verite, memoryCache est le cache synchrone
- Au demarrage, `syncToLocalStorageCache` reconcilie les deux

**Critere de reussite** : Les commentaires refletent le comportement reel du code.

---

## Tier 2.5 — Securite des imports (echanges entre collegues)

**Priorite** : MOYENNE — l'audit montre que les protections sont en place, mais a valider par test reel
**Effort** : ~1 heure de test + corrections ponctuelles si necessaire
**Risque si non fait** : Injection de code via fichiers echanges entre collegues (theorique)

### Verdict de l'audit

Les protections multi-couches sont fonctionnelles :
- **JSON.parse()** pour les backups (pas d'eval, pas de new Function)
- **CSP script-src 'self'** bloque les scripts inline meme si du HTML est injecte
- **echapperHtml()** utilise systematiquement sur les donnees affichees via innerHTML
- **validerZipSecurite()** verifie taille et path traversal
- **validerMagicBytes()** verifie les signatures binaires des fichiers

### 2.5.1 Test reel de XSS via grille importee

**Procedure** : Creer une grille de test dont un critere s'appelle `<img src=x onerror=alert(1)>` et une description contenant `<script>alert('xss')</script>`. Importer cette grille et verifier que le HTML est echappe dans :
- `js/grilles.js` (affichage de la grille)
- `js/evaluation.js` (interface d'evaluation avec la grille)
- `js/profil-etudiant.js` (resultats avec noms de criteres)
- `js/travaux-export-pdf.js` (export PDF avec grille)

**Critere de reussite** : Le HTML malveillant est affiche en texte brut, pas execute. Aucune alerte ne s'affiche.

### 2.5.2 Verifier l'absence de validation de schema

**Probleme identifie (non critique)** : Les imports JSON ne valident pas la structure des donnees (schema). Un fichier de backup avec des champs inattendus ou des types incorrects sera accepte. Ca ne cause pas de XSS (echapperHtml le bloque) mais pourrait corrompre les donnees.

**Decision** : Documenter comme risque accepte pour Beta 99. La validation de schema est un chantier post-AQPC.

---

## Tier 3 — Performance perceptible

**Priorite** : MOYENNE — faire apres Tiers 1 et 2
**Effort** : ~2 heures
**Risque si non fait** : Lenteurs visibles au colloque avec beaucoup de donnees

### 3.1 Optimiser la boucle O(N*M) dans `etudiants.js`

**Probleme** : Ligne ~1002, une boucle `forEach` sur les etudiants contient un `filter` sur les evaluations. Pour 30 etudiants et 500 evaluations = 15 000 comparaisons.

**Procedure** :
1. Lire le code concerne
2. Pre-construire un `Map<etudiantDA, count>` en une seule passe sur les evaluations
3. Dans la boucle etudiants, faire un simple `map.get(da)` au lieu du `filter`

**Critere de reussite** : Complexite O(N+M) au lieu de O(N*M). Affichage de la liste etudiants instantane meme avec 500+ evaluations.

### 3.2 Eliminer les `innerHTML +=` en boucle

**Probleme** : 25 instances d'`innerHTML +=` en boucle forcent un reflow DOM a chaque iteration.

**Fichiers principaux** :
- `js/evaluation.js`
- `js/export-pdf.js`
- `js/cartouches.js`

**Procedure** :
1. Pour chaque instance, accumuler le HTML dans un tableau `parts.push(...)` ou une string
2. Assigner une seule fois a la fin : `element.innerHTML = parts.join('')`

**Critere de reussite** : `grep -n 'innerHTML +=' js/*.js` retourne zero resultat dans des boucles.

### 3.3 Diagnostic storage au demarrage

**Probleme** : Aucune visibilite sur l'etat du storage en production.

**Procedure** :
1. Apres `syncToLocalStorageCache`, stocker un objet `window._storageStats` avec :
   - Nombre de cles localStorage vs memoryCache
   - Taille estimee de localStorage
   - Top 5 des cles les plus volumineuses
2. Ne PAS utiliser `console.log` (regle du projet). Stocker dans `window._storageStats` pour consultation manuelle en console de debug.

**Critere de reussite** : `window._storageStats` accessible en console, avec des valeurs coherentes.

---

## Tier 3.5 — Coherence visuelle (uniformisation des styles)

**Priorite** : MOYENNE-HAUTE — impact visuel direct au colloque
**Effort** : ~3-4 heures
**Risque si non fait** : Impression d'incoherence lors des demos (meme donnee, couleurs differentes selon le graphique)

### Contexte

Le design system existe et est bien defini (`styles.css` lignes 13-90, palette «Ocean & Boussole»). Le probleme n'est pas l'absence de systeme, c'est que les graphiques Chart.js et certains composants definissent leurs propres couleurs en dur au lieu d'utiliser les variables CSS.

### 3.5.1 Centraliser les couleurs Chart.js dans un fichier unique

**Probleme critique** : Les indices A-C-P-E ont 3 palettes differentes selon le graphique.

| Indice | graphiques-progression.js | correlations-longitudinales.js | Design system (CSS) |
|--------|--------------------------|-------------------------------|---------------------|
| A      | `#1976D2`                | `#4FC3F7`                     | `--std-bleu: #0277bd` |
| C      | `#FF6B35`                | `#FF7043`                     | `--som-orange: #ff6f00` |
| P      | `#4CAF50`                | `#4CAF50`                     | `--spe-vert: #22c55e` |
| E      | `#9C27B0`                | `#AB47BC`                     | `--den-violet: #8b5cf6` |

Resultat : un meme indice change de couleur selon le graphique qu'on regarde.

**Procedure** :
1. Creer `js/couleurs.js` — module centralisateur des couleurs pour Chart.js et le JS en general
2. Au chargement, lire les variables CSS via `getComputedStyle(document.documentElement).getPropertyValue('--std-bleu')` etc.
3. Exporter un objet global `COULEURS` avec les palettes :
   - `COULEURS.indices.A`, `.C`, `.P`, `.E` — alignees sur les variables CSS
   - `COULEURS.pratiques.SOM`, `.STD`, `.SPE`, `.DEN` — idem
   - `COULEURS.risque.nul`, `.faible`, `.modere`, `.eleve`, `.critique`
   - `COULEURS.graphiques.fond`, `.grille`, `.texte` — pour les options Chart.js
4. Modifier `graphiques-progression.js` (supprimer `COULEURS_INDICES` lignes 27-32) pour utiliser `COULEURS.indices`
5. Modifier `correlations-longitudinales.js` (supprimer `COULEURS_CORR` lignes 25-28) pour utiliser `COULEURS.indices`
6. Modifier tout autre module qui definit ses propres couleurs d'indices

**Avantage** : Les couleurs suivront automatiquement le mode sombre/clair si les variables CSS changent entre modes.

**Critere de reussite** : Un seul indice = une seule couleur partout dans l'app (graphiques, badges, tableaux). Zero constante de couleur hex en dur dans les modules graphiques.

### 3.5.2 Aligner les couleurs des tampons d'annotation

**Probleme** : `travaux-outils.js` lignes ~1205 definit une palette de 11 couleurs pour les tampons d'annotation. 9 sur 11 ne correspondent pas aux variables du design system.

**Decision a prendre avec Gregoire** : Les tampons d'annotation sont un outil de dessin libre. Les couleurs ne representent pas des donnees pedagogiques (contrairement aux indices A-C-P-E). Il est possible que la palette soit intentionnellement differente du design system — c'est une palette d'artiste, pas une palette de donnees.

**Procedure** :
1. Demander a Gregoire : ces couleurs sont-elles intentionnelles ou arbitraires ?
2. Si intentionnelles : documenter la decision dans le code et dans `design-system.html`
3. Si arbitraires : aligner sur la palette du design system la ou c'est possible

### 3.5.3 Nettoyer les couleurs hex orphelines dans `styles.css`

**Probleme** : ~381 couleurs hex en dur dans `styles.css`. Beaucoup sont des fallbacks `var(--x, #fallback)` (legitimes), mais certaines sont des vestiges pre-design-system.

**Cas prioritaires** :
- `#9fc5e8` utilise a 5 endroits (lignes 932, 969, 1316, 19537, 19549) — aucune variable correspondante
- `#f06878`, `#d4b878` (lignes 2325, 2333) — alertes en dur au lieu des variables `--alerte-texte-*`
- `#818cf8`, `#a78bfa` (lignes 2570, 2582) — indigo/violet non declares

**Procedure** :
1. Pour chaque couleur hex en dur (hors `:root` et `[data-theme]`), determiner :
   - Existe-t-il une variable CSS equivalente ? → la remplacer
   - Est-ce un fallback de `var()` ? → verifier que la variable existe reellement (certains fallbacks referencent des variables inexistantes comme `--surface-conteneur` ou `--violet-jeton`)
   - Est-ce une couleur unique sans equivalent ? → creer la variable si elle est utilisee > 2 fois, sinon documenter
2. Ce nettoyage est MECANIQUE et peut etre fait progressivement par Claude Code en tache de fond

**⚠️ ATTENTION** : Ne pas modifier les couleurs sans verifier le rendu dans les DEUX modes (sombre et clair). Chaque remplacement doit etre valide visuellement.

**Critere de reussite** : Les couleurs hex en dur dans `styles.css` (hors declarations de variables) sont reduites de 50%. Les variables inexistantes referencees dans les fallbacks sont corrigees.

### 3.5.4 Verifier la coherence des composants entre modules

**Constat de l'audit** : Les composants HTML (cartes, badges, boutons, tableaux) sont structurellement coherents — les bibliotheques utilisent les memes classes CSS. Pas de chantier urgent ici.

**Verification recommandee** :
- Les 6 modules de bibliotheque (`grilles-bibliotheque.js`, `echelles-bibliotheque.js`, `cartouches-bibliotheque.js`, `productions-bibliotheque.js`, `pratiques-bibliotheque.js`, `tampons-bibliotheque.js`) utilisent-ils le meme pattern de carte ?
- Les badges de source (Locale/Bibliotheque) ont-ils le meme style partout ?
- Verification rapide, pas de refactoring sauf si incoherence flagrante trouvee

**Critere de reussite** : Confirmation documentee que les composants recurrents sont coherents, ou liste des ecarts a corriger.

---

## Tier 4 — Hygiene structurelle (perennite)

**Priorite** : BASSE — faire si le temps le permet en avril, sinon debut mai
**Effort** : ~3-4 heures
**Risque si non fait** : Confusion pour le developpement futur, pas d'impact utilisateur

### 4.1 Documenter les ecritures `pratiquesConfigurables`

**Contexte** : L'audit Cowork identifie une « race condition critique » sur `pratiquesConfigurables` (6 modules, 13 appels `setSync`). La contre-expertise nuance : en contexte single-user hors-ligne, un enseignant n'importe pas 50 pratiques pendant qu'il en cree une. Le risque de race condition est **theorique, pas observe en production**.

**Procedure (approche legere)** :
1. Identifier les fonctions d'ecriture dans chaque module (grep `setSync.*pratiquesConfigurables`)
2. Ajouter un commentaire d'en-tete dans chaque module qui ecrit, documentant quel type d'ecriture il fait (creation, modification, suppression, import, archivage)
3. S'assurer que les validations sont identiques entre modules

**Approche lourde (post-AQPC, si des bugs apparaissent)** : Creer un `PratiquesStorage.js` comme point d'ecriture unique. Reporter a apres le colloque.

**Critere de reussite** : Chaque module qui ecrit `pratiquesConfigurables` documente clairement son role. Les validations sont coherentes.

### 4.2 Clarifier les paires V1/V2

**Probleme** : 4 paires coexistent : `trimestre.js`/`trimestre-v2.js`, `donnees-v2.js`, `preferences-v2.js`, `pratique-notation-v2.js`.

**Procedure** :
1. Pour chaque paire, verifier dans `index.html` quels fichiers sont charges
2. Si V1 n'est plus charge : l'archiver dans un dossier `js/_archives/`
3. Si les deux sont charges : documenter le partage de responsabilites

**Critere de reussite** : Chaque paire V1/V2 a un statut clair (archive, actif, ou partage documente).

### 4.3 Nettoyer fichiers orphelins et zombie

**Fichier zombie confirme** :
- `js/entites-ui.js` (926 lignes) : N'est PAS dans `index.html`. Les fonctions qu'il definit ont ete migrees vers `trimestre-v2.js`. A archiver dans `js/_archives/`.

**Fichier NON orphelin (erreur audit Cowork)** :
- `js/guidage-demo.js` : EST charge dans `index.html:16924`. NE PAS archiver. Verifier si les fonctions `afficherGuidageDemo()` / `retirerGuidageDemo()` sont effectivement appelees quelque part — si non, evaluer leur utilite future avant de supprimer.

**Procedure** :
1. Archiver `entites-ui.js` dans `js/_archives/`
2. Pour `guidage-demo.js` : grep pour ses fonctions. Si non appelees, demander a Gregoire si c'est une feature en cours ou du code a retirer.
3. Scan global : `diff <(ls js/*.js) <(grep 'script src="js/' index.html | sed ...)` pour identifier tout autre fichier non charge

**Critere de reussite** : Chaque fichier JS dans `js/` est soit charge par `index.html`, soit archive.

### 4.4 Lazy-loader `pack-demo-20.js`

**Probleme** : 18 737 lignes (1.1 Mo) de donnees demo chargees a chaque demarrage, meme en production.

**Procedure** :
1. Verifier comment le fichier est charge dans `index.html`
2. Le charger conditionnellement (ex: uniquement quand le mode demo est active)
3. Si c'est une balise `<script>` statique, la remplacer par un chargement dynamique dans `donnees-demo.js`

**Critere de reussite** : En mode production normal, `pack-demo-20.js` n'est pas telecharge/parse.

### 4.5 Supprimer les `console.log` commentes et trier les TODO/FIXME

**Procedure** :
1. `grep -rn '// *console\.log' js/*.js` — supprimer toutes les lignes
2. `grep -rn 'TODO\|FIXME\|HACK\|XXX' js/*.js` — pour chaque occurrence, soit l'ajouter au BACKLOG.md, soit la supprimer si obsolete

**Critere de reussite** : Zero `console.log` (meme commente) dans le code. Zero TODO/FIXME sans entree correspondante dans BACKLOG.md.

---

## Tier 4.5 — Metadonnees et licences CC (uniformisation des creations)

**Priorite** : MOYENNE — important pour la credibilite du partage entre collegues et pour le colloque
**Effort** : ~3-4 heures
**Risque si non fait** : Metadonnees incompletes dans les exports, affichage inegal entre bibliotheques

### Contexte

Le module `cc-license.js` fournit une fonction `ajouterMetadonnéesCC()` qui genere un bloc complet de metadonnees (auteur, licence CC BY-NC-SA 4.0, dates, institution, discipline, contributeurs, version). Le probleme est que son integration est inegale : certains types de creations l'utilisent a la creation, d'autres non. L'affichage dans les bibliotheques est minimaliste.

### 4.5.1 Ajouter `metadata_cc` a la creation des echelles

**Probleme** : Les echelles (`echelles.js:949-956`) sont le seul type de creation qui ne cree pas de bloc `metadata_cc` lors de la sauvegarde initiale. Les grilles, cartouches, productions et pratiques le font toutes.

**Procedure** :
1. Lire la fonction de creation dans `echelles.js` (autour de la ligne 949)
2. Ajouter la creation d'un bloc `metadata_cc` identique a celui des grilles :
   ```javascript
   metadata_cc: {
       auteur_original: profilAuteur?.auteur_original || 'Auteur inconnu',
       date_creation: new Date().toISOString(),
       contributeurs: []
   }
   ```
3. Verifier que `ajouterContributeurSiNecessaire()` est appele lors des modifications (comme pour les cartouches)

**Critere de reussite** : Toute nouvelle echelle creee contient un bloc `metadata_cc` avec auteur et date de creation.

### 4.5.2 Uniformiser les exports de bibliotheques

**Probleme** : Les exports individuels (depuis grilles.js, echelles.js, etc.) passent par `ajouterMetadonnéesCC()`. Les exports de bibliotheques (`*-bibliotheque.js`) ne le font PAS — ils exportent les items tels quels, sans enrichir les metadonnees.

**Fichiers concernes** :
- `grilles-bibliotheque.js` (export ~ligne 145)
- `echelles-bibliotheque.js` (export ~ligne 145)
- `cartouches-bibliotheque.js` (export ~ligne 145)
- `productions-bibliotheque.js` (export ~ligne 153)
- `pratiques-bibliotheque.js` (export ~ligne 972)
- `tampons-bibliotheque.js` (export ~ligne 351)

**Procedure** :
1. Pour chaque module, modifier la fonction d'export de bibliotheque pour appeler `ajouterMetadonnéesCC()` sur chaque item exporte
2. Attention aux tampons : leur structure `metadata_cc` utilise `auteur` au lieu de `auteur_original` — a harmoniser

**Critere de reussite** : Un export de bibliotheque (grilles, echelles, etc.) contient les metadonnees CC completes pour chaque item.

### 4.5.3 Harmoniser le nommage du champ auteur

**Probleme** : Le champ auteur a 3 noms differents selon le contexte :
- `metadata_cc.auteur_original` (grilles, cartouches, productions, pratiques)
- `metadata_cc.auteur` (tampons)
- `auteur` (champ direct sur certains objets)

**Procedure** :
1. Choisir UN nom canonique — recommandation : `metadata_cc.auteur_original` (c'est le plus explicite et le plus utilise)
2. Dans `tampons-bibliotheque.js`, migrer `metadata_cc.auteur` vers `metadata_cc.auteur_original`
3. Ecrire une migration qui ajoute `metadata_cc.auteur_original` sur les objets tampons existants

**Critere de reussite** : Tous les types de creations utilisent `metadata_cc.auteur_original` pour l'auteur.

### 4.5.4 Enrichir l'affichage des metadonnees dans les bibliotheques

**Probleme** : Les cartes de bibliotheque n'affichent que l'auteur (et pas toujours). Les dates, la licence, la discipline et la description sont absentes, meme quand les donnees existent.

**Decision (27 mars 2026)** : Option A — minimaliste. L'enseignant ne doit pas etre sature d'informations. Les metadonnees riches sont conservees dans l'objet pour la tracabilite et les exports, mais pas affichees dans les cartes de selection.

**Affichage dans les cartes** : Auteur + indication de source (locale/importee). C'est tout.

**Procedure** :
1. Modifier le rendu des cartes dans `bibliotheque-ui.js` (ou dans chaque `*-bibliotheque.js` si le rendu est specifique)
2. Utiliser un format uniforme pour les 6 types de bibliotheques : nom, auteur, source
3. Ne PAS afficher : dates, licence, discipline, institution, description
4. Ces donnees restent dans `metadata_cc` pour les exports et les imports — c'est de la conservation de donnees en arriere-plan

**Critere de reussite** : Les 6 bibliotheques affichent les memes champs (auteur + source) avec le meme format. Les metadonnees completes sont preservees dans les objets sans etre visibles.

### 4.5.5 Preserver les metadonnees CC a l'import

**Probleme** : Lors de l'import d'items depuis une bibliotheque partagee par un collegue, les metadonnees CC ne sont pas systematiquement preservees. Seules les grilles preservent clairement `metadata_cc` a l'import.

**Procedure** :
1. Pour chaque module d'import (`*-bibliotheque.js`), verifier que `metadata_cc` est copie tel quel dans l'objet importe
2. Si l'objet importe a un `metadata_cc.auteur_original`, ne PAS l'ecraser avec l'auteur courant
3. Ajouter l'auteur courant dans `metadata_cc.contributeurs` si ce n'est pas deja fait

**Critere de reussite** : Un item importe depuis un collegue conserve l'auteur original et ajoute l'importeur comme contributeur.

---

## Tier 5 — Consolidation documentaire

**Priorite** : OPTIONNELLE — a faire si tout le reste est termine
**Effort** : ~2 heures

### 5.1 Verifier `index.html` pour handlers inline residuels

**Procedure** : Grep pour `onclick=`, `onchange=`, `onsubmit=`, `onkeydown=`, `onerror=`, etc. dans `index.html`. Migrer vers le dispatcher `data-action` de `main.js`.

### 5.2 Audit CSS (`styles.css`) — FAIT (session 2 avril 2026 soir)

**5 commits, -640 lignes.** Rapport complet : `docs/audit-css-tier5.2.md`

Resultats :
- 28 variables CSS mortes supprimees (+ re-declarations dans 4 modes)
- 70 selecteurs CSS morts supprimes (sidebar legacy, profil x25, Beta 91 x38, etc.)
- 39 `!important` elimines (112 → 73), inline styles nettoyes dans index.html/JS
- Breakpoints alignes (10 → 6), @media print fusionnes, body.mode-clair simplifie
- Inventaire des 6 breakpoints officiels documente en en-tete de styles.css

**Reste (optionnel, Chantier 1 P2-P3)** :
- P2 : Selecteurs morts dans Patterns/RaI (lignes ~10239-11850) et Accordeon/Bibliotheque (lignes ~7100-8600) — ~350 classes a auditer
- P3 : Module Planification (lignes ~12400-21900) — ~900 classes, module actif, risque de faux positifs
- Plan detaille dans `.claude/plans/buzzing-wiggling-flask.md`

### 5.3 Notification utilisateur de quota

**Probleme** : Le quota overflow est silencieux. L'enseignant ne sait pas que ca arrive.

**Procedure** : Dans `sauvegarderDonneesSelonMode` (modes.js), si le retour est `'quota'`, afficher une notification discrere (toast ou bandeau) : « Les donnees sont sauvegardees, mais l'espace de stockage est presque plein. »

---

## Tier 5.5 — Preparation colloque AQPC (fiabilite de la demo live)

**Contexte** : Presentation devant ~150 personnes, sur MacBook (M3), projetee sur ecran/projecteur. Pas de kiosque. Pas d'iPad. L'audience voit tout — chaque erreur, chaque lenteur, chaque message technique.
**Priorite** : A FAIRE FIN AVRIL / DEBUT MAI — apres la consolidation technique, avant le gel de mai
**Effort** : ~6-9 heures total (revise a la hausse — 546 alert() a trier au lieu de « quelques dizaines »)

### 5.5.1 Preparation des donnees reelles anonymisees pour la demo

**Contexte** : Gregoire utilisera ses donnees reelles en mode anonymisation pour la demo AQPC. C'est plus convaincant que des donnees fictives et ca correspond a son experience reelle d'enseignant. Le jeu de donnees demo (`donnees-demo.js`) n'est donc PAS la cible pour le colloque.

**Prerequis** : Le Tier 0 (anonymisation etanche) DOIT etre termine et valide avant ce chantier.

**Procedure** :
1. Charger les donnees reelles de Gregoire sur le MacBook de presentation
2. Activer le mode anonymisation
3. Parcourir CHAQUE section de l'app en verifiant :
   - Aucun nom reel d'etudiant visible (ecran, titres, badges, graphiques, tooltips)
   - Aucun nom reel dans les noms de fichiers travaux affiches
   - Les retroactions ne contiennent pas de prenoms reels
   - Les exports PDF sont anonymises (contenu ET nom du fichier telecharge)
   - Les graphiques et tableaux de bord affichent des donnees coherentes avec les noms anonymises
4. Documenter tout ce qui fuit — chaque fuite est un bug Tier 0 non corrige
5. Verifier que le volume de donnees reelles ne cause pas de lenteur perceptible (transitions de section, chargement des graphiques)

**Critere de reussite** : Navigation complete dans toutes les sections de l'app avec les donnees reelles anonymisees, sans aucune fuite de nom reel, sans lenteur, sans erreur console. C'est le test de validation final du Tier 0.

### 5.5.2 Nettoyage des console.log herites

**Probleme** : La regle CLAUDE.md impose `console.warn`/`console.error` uniquement pour le nouveau code, mais les ~100 modules herites contiennent probablement des dizaines de `console.log` de debug. Si un participant curieux ouvre les outils developpeur, ou si un collegue reproduit la demo sur son poste, l'avalanche de logs fait amateur.

**Procedure** :
1. `grep -rn 'console\.log' js/ --include='*.js'` — inventaire complet
2. Pour chaque occurrence :
   - Si c'est du debug obsolete → supprimer
   - Si c'est une information utile au diagnostic → convertir en `console.warn` avec un prefixe module (ex: `console.warn('[db]', ...)`)
   - Si c'est un point d'entree de flux important → convertir en `console.info` (optionnel)
3. Ne PAS supprimer les `console.error` existants — ceux-la sont legitimes

**Critere de reussite** : `grep -c 'console\.log' js/*.js` → 0 resultat. Mesure #9 du plan.

### 5.5.3 Audit des messages d'erreur visibles par l'utilisateur

**Probleme** : En demo devant 150 personnes, un `alert()` avec un message technique (« QuotaExceededError in setSync... ») tue la credibilite. Il faut que chaque message d'erreur visible soit comprehensible par un enseignant.

**Ampleur reelle (contre-expertise)** : La verification du code a identifie **~546 appels `alert()`** dans le codebase JS. C'est considerablement plus que ce que l'audit Cowork laissait entendre. Les fichiers les plus concernes :
- `productions.js` (~48), `echelles.js` (~48), `pratiques.js` (~47), `cartouches.js` (~45)
- `grilles.js` (~39), `trimestre-v2.js` (~37), `import-export.js` (~31)
- `codex.js` (~21), `travaux-ui.js` (~18), `evaluation.js` (~10)

**⚠️ Ce chantier est plus gros que prevu.** L'objectif n'est PAS de remplacer tous les `alert()` — beaucoup sont des confirmations utilisateur legitimes. L'objectif est de s'assurer qu'**aucun alert ne contient de jargon technique** et que les messages sont en francais actionnable.

**Procedure** :
1. `grep -rn 'alert(' js/ --include='*.js'` — inventaire complet (~546 occurrences)
2. Trier en 3 categories :
   - **Confirmations utilisateur** (ex: « Veux-tu supprimer cette grille ? ») → garder tels quels si bien formules
   - **Messages d'erreur en francais** → verifier qu'ils sont actionnables, corriger si necessaire
   - **Messages techniques** (noms de fonctions, types d'erreur JS, anglais) → remplacer par des messages orientés action
3. **Priorite** : Se concentrer sur les modules qui seront demontres au colloque (tableau de bord, profil etudiant, evaluations, graphiques). Les modules secondaires (import-export, codex) sont moins critiques pour la demo.
4. Verifier les `confirm()` — meme traitement
5. Identifier les erreurs qui s'affichent dans l'interface (notifications, toasts, bandeaux) — meme verification

**Effort revise** : ~4-5 heures (au lieu de 2h estimees initialement), a cause du volume

**Critere de reussite** : Dans les modules de la demo AQPC, aucun message d'erreur visible ne contient de jargon technique. Tout est en francais, actionnable.

### 5.5.4 Purge des donnees orphelines de trimestres anciens

**Probleme** : Le namespacing par trimestre (`h2026_`, `a2025_`, `h2025_`...) protege les donnees actives, mais les anciennes cles restent dans localStorage indefiniment. Sur un MacBook de test utilise depuis des mois, l'accumulation peut approcher la limite de quota. Risque de `QuotaExceededError` en pleine demo.

**Procedure** :
1. Ajouter une fonction utilitaire `listerTrimestresOrphelins()` qui :
   - Scanne toutes les cles localStorage
   - Identifie les prefixes de trimestre presents
   - Compare avec le trimestre actif (`window.cle('')` sans suffixe)
   - Retourne la liste des prefixes inactifs avec leur taille totale
2. Ajouter dans la section Reglages un bouton « Nettoyer les anciens trimestres » qui :
   - Affiche les trimestres detectes avec leur taille
   - Demande confirmation
   - Supprime les cles des trimestres selectionnes
3. **Pour la demo** : executer ce nettoyage AVANT la presentation pour partir avec un localStorage propre

**Critere de reussite** : Fonction accessible dans Reglages. Avant la demo, `localStorage` ne contient que les cles du trimestre actif + les cles globales (preferences, config).

### 5.5.5 Resilience aux erreurs pendant la demo

**Probleme** : Si une erreur JS non interceptee survient pendant la demo, l'app peut se figer ou afficher un ecran blanc. Il n'y a pas de filet de securite global.

**Procedure** :
1. Verifier que le `window.onerror` global et le `unhandledrejection` (deja interceptes par `rapport-bug.js`) ne bloquent PAS l'app — ils doivent logger silencieusement, pas afficher un alert
2. Pour les modules critiques de la demo (tableau de bord, graphiques, profil etudiant) :
   - S'assurer que chaque fonction de rendu est dans un `try/catch` qui affiche un etat degrade plutot qu'un crash (ex: « Donnees non disponibles » plutot qu'un ecran vide)
3. **Script de pre-demo** : creer un petit script `pre-demo.js` (ou une checklist manuelle) que Gregoire execute avant la presentation :
   - Verifie que les donnees demo sont chargees
   - Verifie que le mode anonymisation est actif
   - Verifie que localStorage est sous 3 Mo
   - Verifie qu'aucune erreur console n'est presente au demarrage
   - Affiche un « Pret pour la demo ✓ » dans la console

**Critere de reussite** : Le script pre-demo passe au vert. Une erreur JS provoquee volontairement (ex: suppression d'une cle localStorage) ne fait pas planter l'affichage — l'app affiche un etat degrade lisible.

### 5.5.6 Lisibilite sur projecteur (modes sombre et clair)

**Probleme** : Les projecteurs de salle de conference varient en qualite. Un bon projecteur laser dans une salle obscurcie rendra le mode sombre tres bien. Un projecteur moyen avec lumiere ambiante lavera les gris fonces. Le choix du mode se fera le jour J selon les conditions de la salle.

**Procedure — verifier LES DEUX modes** :
1. **Mode sombre** (preference de Gregoire) :
   - Verifier que les textes clairs sur fond sombre ont un contraste suffisant (minimum 4.5:1)
   - Verifier que les graphiques Chart.js sont lisibles sur fond sombre
   - Attention aux gris moyens (ex: `--gris-moyen`) qui peuvent disparaitre sur projecteur
   - Les badges indices A-C-P-E doivent rester distinguables
2. **Mode clair** (option de repli) :
   - Verifier que le mode clair fonctionne correctement dans toutes les sections
   - Texte principal sur fond blanc/clair → minimum 4.5:1
   - Badges et graphiques lisibles
3. **Pour les deux modes** :
   - Tester les tailles de police sur un ecran externe ou projecteur (la distance de lecture est de 3-15 metres, pas 50 cm)
   - Si necessaire, prevoir un « mode presentation » minimal (CSS override) qui augmente legerement la taille de police de base et renforce les contrastes des elements critiques — applicable sur les deux modes

**Critere de reussite** : Gregoire peut naviguer dans toute la demo dans le mode de son choix sans texte ni graphique illisible. A tester idealement sur un projecteur reel avant le colloque. Le choix final du mode se fait le jour J.

---

## Chantier separe — Scenario de demo AQPC

La demo au colloque doit refleter l'**experience reelle** de Gregoire : ses donnees, son flux de travail, ses cas d'usage quotidiens — pas une vitrine artificielle. Ce chantier est distinct de la consolidation technique et doit etre planifie separement (fin avril / debut mai).

Il inclut :
- **Jeu de donnees** : donnees reelles de Gregoire en mode anonymisation (decision prise 27 mars 2026)
- **Script de presentation** : parcours narratif a travers les fonctionnalites cles, avec un fil conducteur pedagogique
- **Repetition** : walkthrough complet sur le MacBook de presentation, idealement avec projecteur
- **Plan B** : que faire si l'app plante pendant la demo ? (ecran de secours, captures d'ecran)

Ce chantier ne fait PAS partie du plan de consolidation d'avril — il sera planifie dans un document separe.

---

## Tier 6 — Consolidation SSOT (source unique de verite)

**Source** : AUDIT-SSOT.md (2 avril 2026) — plan detaille dans PLAN-SSOT.md
**Priorite** : HAUTE — les violations SSOT peuvent produire des donnees incoherentes visibles en demo
**Effort** : ~21-29 heures (4 sprints sur 8 semaines)
**Risque si non fait** : Deux chiffres differents pour le meme indice selon l'ecran, caches obsoletes, contournements non documentes

### Contexte

L'audit SSOT du 2 avril a cartographie 127 cles de stockage, identifie 12 violations de severite variable, et confirme 3 patterns exemplaires. Ce tier couvre les corrections et garde-fous qui ne sont PAS deja dans les Tiers 1-5.5.

**Chevauchements avec les tiers existants** :
- Les anomalies de namespacing (PLAN-SSOT Sprint 1.3) sont deja couvertes par le **Tier 1.1** — ne pas dupliquer
- Le test de regression avec donnees reelles (PLAN-SSOT Sprint 4.2) est deja couvert par le **Tier 5.5.1** — ne pas dupliquer
- La documentation des ecritures `pratiquesConfigurables` (PLAN-SSOT reportee) est deja couverte par le **Tier 4.1** — ne pas dupliquer

### 6.1 Retirer le recalcul de secours dans `etudiants.js`

**Violation #7 de l'audit** : `calculerTauxCompletion()` (~L.305) recalcule l'indice C avec une logique differente de `portfolio.js` quand `indicesCP` est absent. Resultat : deux chiffres potentiellement differents pour le meme indice selon le chemin d'acces.

**Procedure** :
1. Remplacer le recalcul a la volee par un retour `null` + `console.warn`
2. Verifier tous les appelants — s'assurer qu'ils gerent `null`
3. Tester : indices C identiques partout (profil, tableau de bord, liste)

**Effort** : ~1-2h. Risque faible — on supprime du code, on n'en ajoute pas.

### 6.2 Consolider `indicesEvaluation` — un seul calculateur

**Violation #6** : Deux fonctions ecrivent dans `cle('indicesEvaluation')` avec des algorithmes potentiellement differents : `evaluation.js:3542` et `liste-evaluations.js:147`.

**Procedure** :
1. Identifier lequel des deux calculs est le bon (lecture comparative)
2. Supprimer le doublon et faire appeler le calcul canonique depuis les deux contextes
3. Tester : evaluer une production, verifier les indices, ouvrir la liste et verifier qu'ils n'ont pas change

**Decision requise (D-SSOT-1)** : Gregoire, les deux fonctions calculent-elles la meme chose differemment, ou ont-elles des roles distincts ?

**Effort** : ~1-2h. Risque modere — necessite de comprendre les deux algorithmes avant de choisir.

### 6.3 Invalider les caches de moyennes apres modification

**Violation #9 (partielle)** : `window._moyennesQualifies` et `window._moyennesToutes` (`etudiants.js:1071-1072`) ne sont jamais invalidees. Un enseignant qui modifie une note puis retourne au tableau de bord voit les anciennes moyennes.

**Procedure** :
1. Identifier les fonctions qui modifient les evaluations/notes
2. Ajouter `window._moyennesQualifies = null; window._moyennesToutes = null;` dans ces fonctions
3. Tester : modifier une note → tableau de bord → moyennes a jour

**Effort** : ~1h. Risque faible — on invalide un cache, le recalcul existe deja.

### 6.4 Centraliser les ecritures `grillesTemplates`, `echellesTemplates`, `presences`

**Violations #2, #3, #5** : Plusieurs modules ecrivent directement dans ces cles au lieu de passer par le module proprietaire.

**Strategie** : Exposer des fonctions d'API dans les modules proprietaires et rediriger les contourneurs.

| Cle | Module proprietaire | Fonction a creer | Contourneurs a migrer |
|-----|--------------------|--------------------|----------------------|
| `grillesTemplates` | `grilles.js` | `importerGrillesExternes()` | `import-export.js`, `primo-modal.js`, `donnees-demo.js`, `spe-specifications.js` |
| `echellesTemplates` | `echelles.js` | `importerEchellesExternes()` | `import-export.js`, `primo-modal.js`, `donnees-demo.js` |
| `presences` | `saisie-presences.js` | `modifierNotePresence()`, `ajouterPresenceIntervention()` | `profil-etudiant.js`, `interventions.js` |

Chaque fonction centralisee declenche automatiquement le recalcul des indices associes.

**Effort** : ~7-10h. Risque modere — les contourneurs font parfois du merge specifique a preserver.

### 6.5 Creer le registre de propriete des cles (`DATA-OWNERSHIP.md`)

Documenter formellement qui a le droit d'ecrire dans chaque cle :

1. Creer `docs/DATA-OWNERSHIP.md` avec un tableau : cle, type, module proprietaire, lecteurs principaux
2. Peupler avec les ~25 cles principales identifiees dans AUDIT-SSOT.md §2
3. Documenter les 3 patterns exemplaires : `calendrierComplet` (trimestre.js:842), `indicesAssiduite` (indices.js:260), `indicesCP` (portfolio.js:719)
4. Ajouter une reference dans `docs/00-START-HERE.md` et `CLAUDE.md`

**Effort** : ~2h. Risque nul — documentation pure.

### 6.6 Assertions SSOT en mode developpement (optionnel)

Wrapper `db.setSync` en mode dev pour loguer un `console.warn` si l'ecrivain n'est pas le proprietaire declare. Desactive en production.

**Decision requise (D-SSOT-2)** : Gregoire, est-ce que les assertions dev valent ~2-3h maintenant, ou tu preferes te fier au registre documentaire (6.5) ?

### 6.7 Securiser le flux donnees de demonstration

Complement au Tier 5.5 — verifier que `restaurerEtatApresDemo()` restaure correctement **toutes** les cles qu'il touche, et ajouter un snapshot de sauvegarde automatique avant le chargement des donnees demo.

**Effort** : ~2h. C'est le test le plus important : si le nettoyage demo a un bug, les donnees reelles de Gregoire sont en danger pendant la presentation AQPC.

### Decision majeure : `modalitesEvaluation` reportee apres AQPC

C'est la violation #1 (CRITIQUE — 25+ ecrivains, 36 lecteurs), mais la decomposition est un chantier de plusieurs jours avec risque de regression eleve. Le registre de propriete (6.5) pose les fondations pour attaquer ce chantier sereinement apres l'AQPC. Justification detaillee dans PLAN-SSOT.md §« Reporté après AQPC ».

### Resume Tier 6

| Sprint | Semaines | Effort | Theme | Items |
|:------:|:--------:|:------:|-------|-------|
| 1 | 1-2 | 4-6h | Corrections chirurgicales | 6.1, 6.2, 6.3 + corrections namespacing (Tier 1.1) |
| 2 | 3-5 | 7-10h | Centralisation ecritures | 6.4 |
| 3 | 6-7 | 4-6h | Documentation et garde-fous | 6.5, 6.6 |
| 4 | 7-8 | 6-7h | Stabilisation pre-AQPC | 6.7 + regression (Tier 5.5.1) |

---

## Tier 7 — Systeme d'aide utilisateur

**Source** : AUDIT-AIDE.md (2 avril 2026) — plan detaille dans PLAN-AIDE.md
**Priorite** : HAUTE — le systeme d'aide sera le premier contact des visiteurs AQPC avec l'application
**Effort** : ~19-27 heures (4 sprints sur 8 semaines)
**Risque si non fait** : Visiteurs AQPC bloques sans aide, boutons inaccessibles sur iPad, articles obsoletes

### Contexte

L'audit du 2 avril a inventorie les 5 couches du systeme d'aide : 280 tooltips, 17 articles d'aide contextuelle (dont 3 orphelins), 65 articles thematiques, 25 popups Primo, 12 etapes de guidage. L'evaluation porte sur 16 criteres de qualite (structurels, de contenu, techniques). Le BACKLOG contient deja #18 (deploiement tooltips) et #2 (guide PDF) — ce tier s'y articule sans les dupliquer.

### 7.1 Debloquer les 3 articles contextuels orphelins

3 articles existent dans `aide-contextuelle-contenu.js` mais n'ont aucun bouton d'acces dans l'interface : `evaluations-proceder`, `evaluations-annoter`, `bibliotheque-fonctionnement`.

**Procedure** : Ajouter un bouton `📍` dans l'HTML pour chacun.

**Effort** : ~30 min. Aucun risque — ajout de HTML statique.

### 7.2 Cibles tactiles aide contextuelle (28px → 44px)

Les boutons `.btn-aide-contextuelle` font 28×28px (`styles.css:12513-12530`). Le minimum WCAG et le seuil pratique pour iPad est 44×44px.

**Procedure** :
1. Passer a min 44×44px (padding ou taille)
2. Verifier le rendu sur iPad Air (pas de chevauchement)
3. Tester en mode sombre ET clair

**Effort** : ~1h (CSS + test visuel).

### 7.3 Semantique ARIA sur les modales d'aide

Les modales d'aide contextuelle et de Primo n'ont pas `role="dialog"`, `aria-modal`, ni `aria-labelledby`. Le focus n'est pas piege dans la modale.

**Procedure** :
1. Ajouter `role="dialog"`, `aria-modal="true"`, `aria-labelledby` sur les modales (`aide-contextuelle.js:106-152`, `primo-tooltips.js:22-59`)
2. Implementer le focus trap (Tab/Shift+Tab)
3. Restaurer le focus sur le bouton declencheur a la fermeture
4. Ajouter `aria-label="Fermer"` sur le bouton × de Primo

**Effort** : ~2-3h. Risque faible — modifications localisees.

### 7.4 `prefers-reduced-motion`

Aucune media query pour desactiver les animations pour les utilisateurs sensibles. Ajouter `@media (prefers-reduced-motion: reduce)` pour les tooltips (`css/tooltips.css`) et les modales Primo (`styles.css` ~L.11020).

**Effort** : ~30 min.

### 7.5 Aide contextuelle pour les zones critiques de la demo AQPC

Le profil etudiant (38 tooltips, zone la plus dense de l'app) et le module d'interventions (RaI) n'ont **aucune aide contextuelle** (📍). Ce sont les ecrans les plus susceptibles d'etre montres en demo.

| Zone | Articles a creer | Contenu |
|------|------------------|---------|
| Profil etudiant | `profil-etudiant-indicateurs`, `profil-etudiant-accompagnement` | Lire les indices A-C-P-E, interpreter les barres SRPNF, niveaux RaI |
| Interventions | `interventions-planification` | Les 3 niveaux RaI, quand intervenir, comment documenter |
| Import/Export | `donnees-import-export` | Formats supportes, precautions, que faire en cas d'erreur |

**Effort** : ~4-7h (redaction du contenu pedagogique + integration HTML).

### 7.6 Completer les tooltips — Boite a outils

La Boite a outils n'a qu'**1 seul tooltip** (`nav-bao-tirage`). C'est le trou le plus visible dans la couverture tooltips. Lie au **#18** du BACKLOG.

**Effort** : ~1-2h (inventaire + redaction de 5-10 tooltips).

### 7.7 Audit de fraicheur des 65 articles thematiques

3 mois de developpement intensif se sont ecoules depuis la derniere mise a jour (janvier 2026). Points a verifier :

1. Les 19 articles « Utilisation hebdomadaire » (`index.html` L.13900-15097)
2. Terminologie : toute mention de « portfolio » → « indices C-P » ou « pratique de notation »
3. Articles Codex : refletent-ils les phases 1-4 (et pas seulement la phase 1) ?
4. Mecanisme de reprise des jetons (L.14314)
5. Acronymes non definis dans les tooltips (PAN, ELLAC, SOLO, SRPNF, IDME)

**Effort** : ~4-5h (relecture intensive + corrections).

### 7.8 Polish parcours AQPC (semaines 7-8)

1. Tester le parcours complet : Primo → donnees demo → tutoriel 7 etapes → exploration libre
2. Verifier le glossaire (L.16299) pour les termes susceptibles d'etre cherches par un visiteur AQPC
3. Verifier que `_verifierPreDemo()` couvre les verifications d'aide

**Decisions requises** :
- **(D-AIDE-1)** : Rendre les boutons d'aide contextuelle visibles en mode Normal ? (Plus de decouverte vs plus d'encombrement)
- **(D-AIDE-2)** : Differencier visuellement aide contextuelle (`?`) vs Primo (`📍`) ? (~1-2h si oui)

**Effort** : ~2-4h (selon les decisions).

### Reporte apres AQPC (aide)

| # | Tache | Justification du report |
|---|-------|------------------------|
| R-A1 | Centraliser les 25 divs Primo dans un fichier JS dedie | Refactoring interne — aucun impact utilisateur |
| R-A2 | `aria-live="polite"` sur la bulle de tooltip | Amelioration screen reader — faible probabilite d'impact AQPC |
| R-A3 | Textes alternatifs aux icones emoji dans l'aide contextuelle | Amelioration screen reader |
| R-A4 | Mecanisme « deja vu » pour les contenus Primo | Fonctionnalite nouvelle — pas prioritaire v1.0 |
| R-A5 | Lien « En savoir plus » dans les tooltips vers l'article thematique | Effort significatif, benefice incremental |
| R-A6 | Guide PDF utilisateurs (#2 du BACKLOG) | Contenu thematique disponible dans la section Aide |
| R-A7 | Recherche dans l'aide contextuelle et les tooltips | La recherche thematique couvre le besoin immediat |

### Resume Tier 7

| Sprint | Semaines | Effort | Theme | Items |
|:------:|:--------:|:------:|-------|-------|
| 1 | 1-2 | 5-6h | Corrections critiques | 7.1, 7.2, 7.3, 7.4 |
| 2 | 3-4 | 6-9h | Couverture zones cles | 7.5, 7.6 |
| 3 | 5-6 | 5-7h | Qualite du contenu | 7.7 |
| 4 | 7-8 | 3-5h | Polish AQPC | 7.8 |

---

## Hors scope (post-AQPC)

Ces chantiers sont documentes mais explicitement reportes :

- **Split des gros fichiers** : `profil-etudiant.js` (9076 lignes), `evaluation.js` (7127 lignes), `travaux-ui.js` (6545 lignes). Refactoring structurel a haut risque de regression.
- **PratiquesStorage.js centralisé** : Centralisation des ecritures pratiquesConfigurables dans un module unique. Reporter sauf si des bugs de race condition sont observes.
- **Migration vers tout-async** : Transformer `getSync` en `await db.get()`. Incompatible avec l'architecture synchrone actuelle.
- **Refactoring CSS** : `styles.css` fait 22 000 lignes. Chantier majeur.
- **Audit compatibilite Safari `file://`** : Verifier les API qui se comportent differemment en contexte local.
- **Experience iPad peaufine** : L'app cible iPad Air M1 mais l'experience tactile n'est pas optimisee. Report post-AQPC.
- **Systeme codex USB** : Distribution sur cle USB non terminee. Report post-AQPC.
- **Decomposition `modalitesEvaluation`** (SSOT violation #1, CRITIQUE) : 25+ ecrivains, 36 lecteurs. Migration de donnees requise, risque de regression trop eleve pour 8 semaines. Le registre DATA-OWNERSHIP.md (Tier 6.5) pose les fondations. Voir justification detaillee dans PLAN-SSOT.md.
- **Centraliser `infoCours`** (SSOT violation #4, HAUTE) : `trimestre-v2.js` ecrit a 9 endroits — refactoring massif dans un fichier de 5800+ lignes.
- **Isoler les donnees demo dans un namespace `demo_`** : Refactoring structural — le Tier 6.7 securise le flux actuel sans le refactorer.
- **Event bus pour communication inter-modules** : Changement de paradigme — pas pertinent pour la v1.0.
- **Centraliser contenu Primo** (25 divs dans index.html → fichier JS dedie) : Refactoring interne, aucun impact utilisateur.
- **`aria-live="polite"` sur tooltips, textes alternatifs icones emoji** : Ameliorations screen reader, faible probabilite d'impact AQPC.
- **Guide PDF utilisateurs** (#2 du BACKLOG) : Le contenu thematique existant dans la section Aide couvre le besoin immediat.
- **Recherche dans aide contextuelle et tooltips** : La recherche thematique couvre le besoin immediat.

---

## Mesures de reussite globales (fin avril)

1. **Anonymisation etanche** : en mode anonymisation, zero nom reel visible a l'ecran, dans les exports PDF et dans les noms de fichiers telecharges
2. **Zero `QuotaExceededError`** dans la console pendant une session normale
3. **Zero lecture/ecriture sans namespace** sur les cles namespacees par trimestre (inclut le fix d'ecriture spe-specifications.js)
4. **localStorage sous 2 Mo** avec un jeu de donnees typique (184 fichiers, 189 evaluations)
5. **Donnees preservees** apres modification + Cmd+Q immediat + reouverture (valider le mecanisme existant)
6. **XSS bloque** : une grille importee avec du HTML malveillant dans les noms de criteres n'execute aucun script. Aucun innerHTML sans echappement sur des donnees utilisateur.
7. **Couleurs unifiees** : un indice A-C-P-E = une seule couleur dans toute l'app (graphiques, badges, tableaux)
8. **Temps de demarrage** : pas de regression perceptible
9. **Zero `console.log`** dans le code (meme commente)
10. **Donnees reelles anonymisees** : navigation complete dans toutes les sections avec les donnees reelles de Gregoire en mode anonymisation, sans aucune fuite de nom reel
11. **Messages d'erreur francophones** : dans les modules de la demo AQPC, aucun alert() ne contient de jargon technique (~546 alert() au total, prioriser les modules demos)
12. **Script pre-demo au vert** : toutes les verifications passent avant la presentation
13. **Lisibilite projecteur** : tous les textes et graphiques lisibles dans les deux modes (sombre et clair) pour projection
14. **Zero fichier zombie** : chaque JS dans `js/` est charge par index.html ou archive
15. **SSOT — zero recalcul de secours** : `calculerTauxCompletion()` retourne `null` si `indicesCP` absent (pas de recalcul divergent)
16. **SSOT — un seul calculateur `indicesEvaluation`** : une seule fonction ecrit dans cette cle
17. **SSOT — caches invalides** : `window._moyennesQualifies` et `window._moyennesToutes` se reinitient apres modification d'une note
18. **SSOT — ecritures centralisees** : `grillesTemplates`, `echellesTemplates` et `presences` ont chacun un point d'ecriture unique dans leur module proprietaire
19. **SSOT — registre de propriete** : `docs/DATA-OWNERSHIP.md` existe et documente les ~25 cles principales avec proprietaire, lecteurs, patterns
20. **Aide — zero article orphelin** : les 3 articles contextuels orphelins ont un bouton d'acces dans l'interface
21. **Aide — cibles tactiles ≥ 44px** : `.btn-aide-contextuelle` respecte le seuil WCAG/iPad
22. **Aide — ARIA sur modales** : `role="dialog"`, `aria-modal`, focus trap sur les modales d'aide et Primo
23. **Aide — couverture zones demos** : profil etudiant et interventions ont chacun au moins un article d'aide contextuelle
24. **Aide — articles a jour** : les 65 articles thematiques relus et mis a jour pour la Beta 99

---

## Notes pour Claude Code

- **Zones protegees** (ne jamais modifier sans autorisation) : `js/config.js`, `js/navigation.js`, `noms_stables.json`
- **Regles de securite** : tout `innerHTML` avec donnees utilisateur → `echapperHtml()`. Zero handler inline. Zero `eval()`.
- **Avant chaque commit** : demander le numero de beta a Gregoire. Mettre a jour `version.json` ET le fallback dans `index.html`.
- **Tests** : tester sur Safari macOS (M3). L'iPad n'est PAS la cible pour le colloque AQPC.
- **Demo AQPC** : presentation devant ~150 personnes sur MacBook + projecteur. Gregoire prefere le mode sombre ; le mode clair est l'option de repli. Les deux modes doivent etre lisibles sur projecteur. Donnees reelles anonymisees (pas donnees demo).
- **Decisions en attente** : 5 decisions requises de Gregoire avant de progresser sur certains items — D-SSOT-1 (indicesEvaluation), D-SSOT-2 (assertions dev), D-AIDE-1 (aide contextuelle en mode Normal), D-AIDE-2 (differenciation visuelle aide/Primo), D-SSOT/AIDE-3 (priorite relative des deux plans vs BACKLOG)
- **Plans detailles** : PLAN-SSOT.md et PLAN-AIDE.md contiennent les procedures pas-a-pas, numeros de lignes exacts et justifications completes. Ce document (Tiers 6 et 7) est le resume integre.
- **En cas de doute** : poser la question a Gregoire plutot que de supposer.
