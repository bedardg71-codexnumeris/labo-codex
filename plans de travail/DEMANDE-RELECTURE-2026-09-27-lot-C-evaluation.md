# Demande de relecture – lot C de l'enregistrement : l'évaluation d'une copie (D1)

> Écrite le 27 septembre 2026 par Claude Code, pour Cowork. Branche `lot-c-evaluation-verrouiller`, partie de `21af8288` (1.161.0). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (27 sept., 8 h 11). Source : `DECISIONS-2026-09-26-enregistrement.md`, D1. **Pas de release ni de fusion avant ta relecture**, et pas de push avant que Grégoire ait accepté les mots du § 5 et les textes de l'Aide du § 6.

## 1 · Ce que le lot change

| Pièce | Avant | Après |
|---|---|---|
| Bouton du panneau Paramètres (`index.html`, `#btnVerrouillerEvaluation`) | « Enregistrer », `data-action="sauvegarderEvaluation"`, éteint sous le verrou | « Verrouiller l'évaluation » ; sous le verrou, « Déverrouiller l'évaluation », jamais éteint ; `data-action="basculerVerrouillageEvaluationCourante"` |
| `basculerVerrouillageEvaluationCourante` (`evaluation.js:2624`) | le cadenas basculait `verrouillee` sans vérifier ; sans id : « Aucune évaluation en cours » | **la porte unique** : non verrouillée (ou pas encore créée) → `sauvegarderEvaluation`, avec ses vérifications (références, échelle #697, portée #674) ; verrouillée → déverrouiller, sans vérification |
| Nombre d'erreurs, nombre de mots (`evaluation-handlers.js:29`) | aucune écriture automatique | arment `_debouncerAutoSave`, dans le **geste** (pas dans le calcul, que la porte du verrou relance aussi) |
| Intégrité : statut (`evaluation-sauvegarde.js`, `changerStatutIntegrite`) et notes (`notesIntegriteModifiees`, `data-on-input`) | écrites par « Enregistrer » seulement | écrites par l'enregistrement automatique ; **portées dans l'instantané** (`_lireIntegriteEcran`, `evaluation-chargement.js:2098`) |
| Création automatique | exigeait un niveau | un niveau **ou** une intégrité signalée (« IA » posé avant tout niveau) ; une existante reçoit son intégrité même sans niveau dans l'instantané, ses critères non (garde d'origine) |
| Après une création automatique (`_signalerEvaluationCreeeAutoSave`) | l'id restait sur l'instantané seul | l'id passe au pivot `window` et le cadenas ouvert s'affiche, **si l'écran montre encore cette copie** |
| Messages | « Évaluation sauvegardée : … », « Évaluation modifiée : … », « Évaluation verrouillée - Modification impossible » | « Évaluation verrouillée : ‹élève› – ‹production› », « Évaluation déverrouillée : … » (`messageVerrouEvaluation`, nom anonymisé en anonymisation) ; un seul par geste |
| Geste nommé par le témoin sur un échec | « Enregistrement de l'évaluation » | « Verrouillage de l'évaluation » ; le tableau lu est **rendu** sur un échec, aux deux chemins (R4 du lot B : le verrou passe maintenant par eux) |
| `_flusherAutoSave` | privé à l'IIFE ; `travaux-annotation.js` le cherchait par son nom nu : `typeof` toujours faux | exporté sur `window` (`evaluation-chargement.js:2184`) : la fermeture de la copie et le **rechargement** vident l'écriture en attente (inventaire : « Recharger dans la seconde et demie : perdu ») |
| Liste, profil, bilan, récit sommatif | « Non enregistrée », « évaluation non enregistrée · non comptée » | « Non verrouillée » (+ infobulle), « évaluation non verrouillée · non comptée » / « …, non comptée » |

## 2 · Relevé des surfaces (§ 2 de la consigne)

| Surface | Porte |
|---|---|
| Bouton « Verrouiller l'évaluation » (panneau Paramètres, en palette avec copie, dans le formulaire sans copie : le même nœud) | `basculerVerrouillageEvaluationCourante` |
| Cadenas `#btnVerrouPalette` (en-tête de la palette ou du formulaire, `travaux-ui.js`, `poserBoutonVerrou`) | `basculerVerrouillageEvaluationCourante` |
| Badges de la barre latérale et de la barre d'outils (`.travaux-badge-verrou`) | **aucune** : témoins d'état, non cliquables (mesuré : aucun gestionnaire) |
| Liste des évaluations | **aucun cadenas** (mesuré : ses `data-action` sont corbeille, propriétés, fermeture) ; badge et filtre seulement |
| Annoter (visionneuse) | le même cadenas, dans la palette |
| Bulle de rétroaction du badge (`travaux-ui.js:7128`) | ne verrouille pas ; son « Sauvegarder » est hors D1 (lot D/E) — inchangé |
| Banque d'évaluations (`basculerVerrouillageEvaluation`) | **sans écran** : la modale `modalBanqueEvaluations` n'existe pas, `ouvrirBanqueAvecRecherche` n'a pas d'appelant. Commentée, non branchée |
| `verrouillerEvaluationIndividuelle`, `deverrouillerEvaluationIndividuelle`, `verrouillerToutesEvaluations` | sans appelant. Commentées, non branchées |
| `productions.js:verrouillerEvaluation` | verrouille une **production** (nom trompeur) : hors lot |

## 3 · Ce que j'ai mesuré, et les décisions techniques prises seul

- **« Ne compte pas encore dans la note » est vrai pour les quatre familles.** SOM, STD, SPE (et la configurable) passent par `evaluationEntreDansLaNote` (`pratique-registre.js:833`, `verrouillee === false` → faux). DEN ne lit pas les évaluations : sa note est un jugement saisi (`_calculerPerformanceDenotation`). Aucune famille ne compte une non verrouillée : je ne me suis pas arrêté.
- **Statut de remise : pas branché, et je le dis.** Son menu est caché depuis `ba30cf7c` (`<div class="groupe-form u-hide">`, et la pastille `travaux-eval-statut-pill` n'existe pas dans le HTML) ; seuls des **chargeurs** l'écrivent (`travaux-ui.js:5606`, `evaluation.js:1416`). Le brancher sur l'enregistrement automatique ferait écrire un chargement, sans gain pour l'usager. « Verrouiller l'évaluation » l'écrit comme « Enregistrer » avant. ⮕ **Conséquence sur les mots** : la phrase des Nouvelles proposée nomme le statut de remise (§ 5).
- **Un chargement écrivait – trouvé par la preuve (d), corrigé.** Le chargeur par la copie relance le calcul du critère algorithmique 100 ms après coup (`evaluation.js:726`), soit à +560 ms mesurés : hors de la suspension de 500 ms. Avant ce lot, sans effet (le calcul n'armait rien) ; avec lui, l'ouverture réécrivait la copie. La relance passe sous le compteur de #960.
- **Identifiants internes gardés** : `'non-enregistree'` (le filtre retenu le mémorise, `liste-evaluations.js:458-484`), `nonEnregistree`, la classe CSS, et la clé d'infobulle `eval-btn-sauvegarder`. Seul l'affiché change.
- **Nom de la fonction de verrouillage gardé** : `sauvegarderEvaluation` reste le nom de la porte (elle écrit `verrouillee: true`) ; la renommer toucherait onze bancs pour rien d'observable.
- **Retiré en chemin (zéro dette)** : un vidage de l'écriture en attente au début de `demarrerEvaluationDepuisFichier`, que j'avais ajouté : la mutation l'a montré redondant (`chargerEvaluationsEtudiant` vide déjà sur ce trajet).
- **Écouteur du rechargement** : posé par l'initialisation d'Annoter (`travauxAnnotation.initialiser`), faite dès qu'une copie s'ouvre. Sans copie ouverte depuis le chargement de la page, le rechargement ne vide rien (inchangé ; issue 3, noté ici).

## 4 · Fiches

Recherche dans `BACKLOG.md` et `SUIVI-BUGS.md` (ouverts) sur : nombre d'erreurs, nombre de mots, statut de remise, non enregistrée, cadenas, verrouiller, intégrité, perdu.

| Fiche | Verdict |
|---|---|
| #350 (A25 : « Français écrit » affiche 0 erreur à l'ouverture) | **non** : affichage à l'ouverture, pas l'enregistrement ; et A25 n'est pas rouvert |
| #522 (auditer les autres autosaves, course lecture-écriture) | **non** |
| #962 (échec asynchrone d'IndexedDB) | **non** |
| SUIVI-BUGS, ouverts | aucune fiche sur ces mots |

**Aucune case à cocher.** Le lot répond à D1, pas à une fiche ouverte.

## 5 · Les mots – à faire accepter par Grégoire avant le push

> **ACCEPTÉS par Grégoire le 27 sept. 2026 (option 1)** : les mots de ce § et l'Aide du § 6, retouche des Nouvelles comprise (« intégrité » au lieu de « statut de remise »).

Déjà décidés (D1) : « Verrouiller l'évaluation » ; « Non verrouillée » ; « ne compte pas encore dans la note ».

Ceux du § 3 de la consigne, posés tels quels : « Déverrouiller l'évaluation » ; « Verrouillée – clique pour déverrouiller » / « Non verrouillée – clique pour verrouiller » ; « Non verrouillée : ne compte pas encore dans la note. » ; « évaluation non verrouillée, non comptée » (et `· non comptée`) ; « Évaluation verrouillée : ‹élève› – ‹production› » ; « Évaluation déverrouillée : … ».

**Ajoutés par le relevé (même règle, à relire) :**

| Où | Avant | Après |
|---|---|---|
| Refus #697 (`evaluation-calcul.js`) | « …Choisis une échelle de performance, puis enregistre. » | « …puis verrouille. » (idem « Choisis une échelle, puis verrouille. ») |
| Refus #674 | « Ton travail est conservé, mais l'évaluation n'est pas enregistrée : complète-la, puis enregistre. » | « Ton travail est enregistré, mais l'évaluation n'est pas verrouillée : complète-la, puis verrouille. » |
| Avis #652 (critère ajouté après coup) | « …donner un niveau avant d'enregistrer. » | « …avant de verrouiller. » |
| Sans élève ni production (`alert`) | « …avant d'enregistrer. » | « …avant de verrouiller. » |
| Jeton de reprise sans évaluation | « Enregistre d'abord l'évaluation avant d'appliquer un jeton » | « Choisis d'abord un niveau : l'évaluation n'existe pas encore. » |
| Chrono de la barre d'Annoter (infobulle) | « …s'arrête à l'enregistrement. » | « …s'arrête au verrouillage. » |
| Infobulle du filtre de la Liste | « …annoté, évalué — ou par type de jeton. » | « …annoté, évalué, non verrouillée (ne compte pas encore dans la note) — ou par type de jeton. » |
| Infobulle du bouton | « Enregistre l'évaluation courante. Sauvegarde les niveaux… » | « L'évaluation s'enregistre toute seule pendant que tu évalues. La verrouiller la fait compter dans la note ; une évaluation verrouillée se déverrouille par ce même bouton ou par le cadenas. » |

**Nouvelles – une retouche proposée.** La phrase de Cowork nomme « statut de remise » ; aucun geste ne le change à l'écran (§ 3). Proposé : « Évaluer : ton évaluation s'enregistre toute seule pendant que tu évalues, nombre d'erreurs, nombre de mots et intégrité compris ; le témoin le dit. Le bouton « Enregistrer » devient « Verrouiller l'évaluation », et le cadenas fait la même chose : une évaluation compte dans la note une fois verrouillée. Dans la Liste, « Non enregistrée » devient « Non verrouillée ». »

## 6 · L'Aide (D4 : Grégoire relit les textes touchés)

- `index.html`, Aide « Annoter et évaluer » (ex-l. 11714) : titre « Sauvegarder : » → « Enregistrer et verrouiller : » ; texte : « Ton évaluation s'enregistre toute seule pendant que tu évalues ; le témoin « Enregistré » le dit. Quand elle est prête, clique sur **Verrouiller l'évaluation** (ou sur le cadenas) : elle compte alors dans la note, et le badge de l'étudiant·e passe au statut « Évalué ». Une évaluation non verrouillée ne compte pas encore dans la note ; la Liste des évaluations la dit « Non verrouillée ». Pour la corriger ensuite, déverrouille-la. » ; et « …avant de sauvegarder. » → « …avant de verrouiller. »
- `index.html`, Aide « Intégrité académique », procédure (ex-l. 11922) : « Sauvegarder l'évaluation » → « Verrouiller l'évaluation (le statut et les notes s'enregistrent tout seuls) ».
- Relevé sans changement : aucun autre texte de l'Aide ni de l'accompagnement ne parle d'« Enregistrer » une évaluation ni de « Non enregistrée » (grep sur `index.html` et `js/accompagnement-*.js`).

## 7 · Preuves

**Comportement** – `tests/integration/evaluation-lot-c-verrouiller.spec.js` (neuf, WebKit, 8 essais verts) :

- (a) nombre d'erreurs et nombre de mots changés, élève suivant sans autre geste : en base, témoin « Enregistré » ; intégrité, **statut seul** puis **notes seules** : idem, et l'écran de la copie suivante (« recevable ») n'écrit rien dans la précédente ; rechargement dans la seconde et demie : l'écriture en attente part avant ; copie neuve : « IA » posé avant tout niveau crée l'évaluation non verrouillée, et le cadenas ouvert apparaît.
- (b) échelle introuvable : le cadenas **et** le bouton refusent (« Échelle introuvable »), rien n'est verrouillé ; verrouillage par le cadenas : un seul message, « Évaluation verrouillée : Daniel Témoin – Portrait témoin ».
- (c) déverrouiller par le bouton puis reverrouiller : `evaluationEntreDansLaNote` rend faux puis vrai ; aucun doublon.
- (d) ouverture par la copie d'une évaluation « IA » aux champs algorithmiques : la base est identique après 2 s, aucune écriture.
- (e) Liste : « Non verrouillée » et son infobulle (`evaluation-926`) ; profil et bilan (`profil-896`, `profil-921`, `sentinelle-706`) ; grep de l'affiché : aucun « Non enregistrée » d'évaluation hors historique des Nouvelles (restent le Codex, lot F, et la Banque sans écran).
- Placement (`evaluer-868`, 8 essais) : « Déverrouiller l'évaluation » à 360, 768, 1024 et 1180 px, avec et sans copie : entier, hors du témoin (affiché en échec), sur la ligne du bouton ↺, dans son panneau. ⚠ Mesuré en chemin : à 360 px avec copie, la palette « Paramètres » **commence déjà à −74 px** avec l'ancien « Enregistrer » (même largeur de bouton, 152 px) : ce n'est pas le lot ; issue 3, noté ici.

**Mutations, chacune rouge** (restauration par copie et empreinte) : M1 nombre d'erreurs sans enregistrement automatique ; M2 intégrité (statut) sans enregistrement automatique ; M3 cadenas qui verrouille sans la vérification ; M4 relance différée du chargeur hors compteur (un chargement qui écrit) ; M5 « Non enregistrée » laissé dans le badge ; M6 deux messages pour un seul verrouillage ; M7 export de `_flusherAutoSave` retiré (rechargement qui perd). M2 et M7 ont d'abord **survécu** : le banc d'intégrité tapait aussi des notes (scindé), et le vidage de `demarrerEvaluationDepuisFichier` était redondant (retiré, § 3).

**Suites** : Vitest 643 fichiers, 7 473 tests verts. Bancs WebKit voisins (#652, #674, #699, #882, #911, #919, #920, #926, #939, #944, #946, #947, #959 ×2, #960/#961, lot A, lot B, `evaluation-*`, `evaluer-868`, profil-896, profil-921) : 117 verts, 1 rouge attendu (ancien mot de #674, aligné) ; relancés après le retrait du vidage redondant (lot C, #868, #674, #959 ×2, #960/#961, #947, #944, #946, #920, #699, #939) : 85 verts.

## 8 · Stock

Rien n'est réécrit. Une évaluation non verrouillée le reste ; une verrouillée le reste et n'est pas revérifiée. Aucune migration.

## 9 · Livraison prévue après ta relecture

Corrections → mots et Aide acceptés par Grégoire → changelog (`minor`, 1.162.0) → verdict Playwright → fusion dans `main` → push. Porte terrain (iPad, copie réelle) : changer le nombre d'erreurs puis passer à l'élève suivant, revenir – la valeur est là ; verrouiller par le bouton, puis déverrouiller par le cadenas de la barre ; la Liste dit « Non verrouillée » pour une copie évaluée sans verrou.
