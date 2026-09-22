# PLAN #360 — Prévention des doublons d'évaluations

> **Statut** : conception **cadrée** le 28 juin 2026 (workflow adverse v1), puis
> **re-vérifiée contre le code** le 28 juin 2026 (workflow adverse v2 : 8 vérifications
> + synthèse + 3 critiques adverses, 12 agents). **NON CODÉ.** Une décision principale
> reste en attente (§3.2) ; Grégoire a choisi de **consolider d'abord en doc** et de
> coder à une session dédiée.
>
> Ancré sur `main` post-1.23.0 (HEAD `d161aba8`). Mémoire liée :
> `distinguer-reprises-doublons`, `audit-integrite-reconstruction-2026-06-27`,
> `verifier-avant-ecrire-donnees-reelles`.

---

## 1. Le problème (rappel)

Dans `*_evaluationsSauvegardees`, pour un couple **(etudiantDA, productionId)**, deux
phénomènes coexistent et se ressemblent :

- **Reprise légitime** : *signée* — la nouvelle porte `repriseDeId` + `jetonRepriseApplique`
  (ou `repriseDeIdCiblee` + `jetonRepriseCibleeApplique` pour la variante ciblée) ;
  l'originale porte `remplaceeParId` + `archivee`.
- **Doublon orphelin** : re-sauvegarde empilée, **aucune marque**. Né surtout d'une
  re-sauvegarde intra-session (re-clic) ou d'une non-persistance silencieuse au reload
  (cause racine §7).

Piège du cadrage v1 : une reprise « par suppression de l'originale » (le `splice`) est
elle aussi **sans `remplaceeParId`** → indiscernable d'un doublon par la seule absence de marque.

**Objectif #360** : empêcher la **naissance** des doublons orphelins *note-égale* sans
nouveau modèle de données, en réutilisant le prédicat d'exclusion déjà lu par le moteur.

---

## 2. Faits vérifiés — corrections au cadrage v1

| Affirmation v1 | Réel mesuré (code post-1.23.0) |
|---|---|
| `remplaceeParId` lu dans **~62 sites / 34 fichiers** | **134 occurrences / 33 fichiers** de code (hors `pack-demo-20.js` = 11 littéraux de données). |
| Le moteur ne lit **qu'un** prédicat `!remplaceeParId` | `_filtrerEvaluationsArtefactsValides` (`profil-etudiant-actions.js:251-262`) lit **6 conditions** : `!remplaceeParId` **+** `noteFinale` non null/undefined **+** `statutIntegrite ∉ {plagiat, ia}`. **La garde doit reproduire les 6**, sinon faux positifs. |
| auto-save = `.find()` à `evaluation-chargement.js:1387` | C'est un `.findIndex()` aux **lignes 1369-1373** ; `getSync` l.1368 ; `1387` = le `push()` de la branche création ; écriture l.1391. |
| save manuel `.find()` à `evaluation-sauvegarde.js:415` | **Exact** (getSync l.414, écriture l.431-432). |
| splice de reprise à `evaluation-jetons.js:427-461` | Exact pour `appliquerJetonReprise` (branche splice ~458-461), **mais une 2ᵉ variante identique** existe : `appliquerJetonRepriseCiblee` (branche splice **~860-868**), non mentionnée v1 — **à traiter aussi**. |
| `_filtrerEvaluationsArtefactsValides` = « le prédicat » | Fonction **module-privée** (non exposée). Pour la garde, **extraire un helper pur exporté** plutôt que tester une fonction privée. |
| helper de test dans `tests/_helpers/` | Vit en **`tests/unit/_helpers/charger-script.js`**. |

---

## 3. Les deux trous confirmés (absents du cadrage v1)

### 3.1 Bloquant — la persistance du save **manuel**

Le « tarir la source » côté save manuel, tel que cadré, **ne persiste jamais ses marques**.
Sur le chemin de naissance **le plus courant** (re-clic = bascule en modification d'une
active) : `_basculerEnModificationActiveSauv` (`evaluation-sauvegarde.js:280-287`) appelle
`window.sauvegarderEvaluationModifiee()` (`evaluation.js:2520`), qui **re-lit le tableau à
neuf** depuis le disque (`db.getSync`) puis n'écrit que `evaluations[indexEval]`. Le tableau
muté en mémoire (sur lequel la réconciliation a posé `remplaceeParId`) est **jeté**.

Asymétrie aggravante : le chemin **auto-save** (`evaluation-chargement.js:1391`) écrit bien
la réconciliation. Les deux chemins divergeraient donc sur la persistance.

**Correctif (pur, pas une décision)** : sur le save manuel, si le réconciliateur renvoie
`modifie:true`, **persister explicitement** (`sauvegarderDonneesSelonMode('evaluationsSauvegardees', evaluations)`)
**avant** la bascule — qui relira alors un état déjà nettoyé.

### 3.2 DÉCISION — la collision sémantique sur `remplaceeParId`

C'est le point dur, **confirmé par 2 critiques sur 3 (classé bloquant/majeur)**.

Le cadrage v1 pose « **pas de nouveau champ — réutiliser `remplaceeParId** ». Or **deux
writers** traitent *toute* éval portant `remplaceeParId` comme « originale archivée par une
reprise », **sans vérifier qu'une reprise existe** :

- `restaurerOriginaleSiReprise` (`liste-evaluations.js:1947-1962`), **appelée à chaque
  suppression** (l.1996) : `find(e => e.remplaceeParId === idSupprimé)` puis *strippe*
  `remplaceeParId` + `archivee`. Son commentaire (l.1949-1955) dit **explicitement** qu'il
  n'exige **pas** le lien réciproque.
- `retirerJetonReprise` (`evaluation-jetons.js:506-561`).

Conséquences si on marque un doublon en pointant `remplaceeParId` → survivant :

1. **Supprimer le survivant** ré-active le doublon → re-double-compte silencieux.
2. **Pire — rouvrir le doublon marqué** : il ressemble désormais à une « originale remplacée »,
   ce qui déclenche `retirerJetonReprise` → l'app propose de « restaurer », **splice-supprime
   le survivant légitime** (perte de la vraie note) et affiche un message mensonger « originale
   remplacée par une reprise (note %) » alors qu'aucune reprise n'existe.

Autrement dit, le mécanisme du cadrage **rouvre, par une autre porte, le bug qu'il prétend
fermer**. Il faut rendre le marqueur de réconciliation **distinguable** d'une
originale-archivée-par-reprise.

#### Options (à trancher à froid)

- **Option A — drapeau discriminant *(recommandé)*** : poser `remplaceeParId` (le moteur
  l'exclut, comportement **inchangé**) **+** un marqueur distinct (ex. `reconcilieParDoublon:true`)
  que les **2 writers** de reprise ignorent. *Avantages* : changement **localisé**, n'altère
  pas le comportement de l'undo de reprise légitime, sémantiquement honnête (une réconciliation
  n'**est** pas une reprise). *Nuance* : ce n'est **pas** un champ d'état lu par le moteur (le
  piège que le cadrage évitait à juste titre) — c'est un drapeau lu par 2 writers seulement ;
  l'exclusion moteur passe toujours par `remplaceeParId`. L'esprit du « pas de nouveau champ
  d'état » est respecté.
- **Option B — gater les writers** : aucun nouveau champ ; à la place, `restaurerOriginaleSiReprise`
  et la branche originale de `retirerJetonReprise` ne se déclenchent **que si** l'éval
  supprimée/ouverte porte une **vraie marque de reprise**. *Avantage* : fidèle au cadrage strict.
  *Inconvénient* : modifie le comportement de l'undo de reprise pour **tous** les cas (le
  commentaire actuel dit qu'on ne voulait **pas** exiger la réciprocité — il y avait une raison),
  donc **surface de régression** sur la fonctionnalité reprise.

> **Recommandation : A.** Le « pas de nouveau champ » du cadrage visait à éviter un champ
> d'état que **le moteur** ignorerait (dédup cosmétique). Un drapeau lu **uniquement** par 2
> writers ne retombe pas dans ce piège : le moteur, lui, exclut bien via `remplaceeParId`.
> A localise le risque ; B le dilue sur toute la fonctionnalité reprise.

---

## 4. Mécanique retenue (sous réserve de §3.2)

### 4.1 Helper pur `_reconcilierActivesNoteEgale(evaluations, etudiantDA, productionId)`

Fonction **pure**, exportée sur `window` pour testabilité Vitest (`chargerScript`), appelée
depuis les 2 chemins de save **et** le diagnostic rétroactif (SSOT — une seule source de
réconciliation, break-testable comme `GroupeCoursEntite.normaliserCanonique`).

Logique :

1. Isoler les **actives** du couple au sens **moteur (6 conditions)** : `!remplaceeParId`
   **ET** `noteFinale != null` **ET** `statutIntegrite ∉ {plagiat, ia}`.
2. **Exclure du marquage** toute éval portant une marque de reprise — les **quatre** :
   `repriseDeId`, `jetonRepriseApplique`, **`repriseDeIdCiblee`, `jetonRepriseCibleeApplique`**
   (une reprise ciblée **copie** la `noteFinale` de l'originale jusqu'au re-notage → elle est
   *note-égale* à son originale et serait marquée à tort).
3. **Invariant interne `verrouillee`** : ne **jamais** poser `remplaceeParId` sur une active
   `verrouillee === true` (protection lecture-seule #348/#350). Cet invariant vit **dans le
   helper** (pas dans un seul caller), puisque le helper est partagé.
4. Normaliser la note : `n => Math.round(n*10)/10` (1 décimale ; sinon `77.30` vs `77.3000001`
   d'un import a2025 passerait pour divergent).
5. Grouper par note normalisée. Pour tout groupe **note-égale** de taille > 1 : choisir le
   **survivant** par la priorité de `_trouverEvaluationActive` (ciblée > reprise > normale ;
   à défaut le plus stable) et poser `remplaceeParId = <id survivant>` (+ marqueur de l'option A)
   sur les surnuméraires. **`remplaceeParId` doit être un id non vide** (le prédicat moteur est
   truthy : `''`, `0`, `false` laisseraient l'éval dans le pool).
6. Retour `{ modifie:bool, marquees:[ids] }`.

### 4.2 Prédicat de la garde / sentinelle

```
ACTIVES(da, pid) = evals e | e.etudiantDA===da && e.productionId===pid
                            && !e.remplaceeParId
                            && e.noteFinale != null                       // exclusion moteur #2
                            && (e.statutIntegrite||'recevable') ∉ {plagiat, ia}   // exclusion moteur #3
note(e) = Math.round(e.noteFinale*10)/10

ROUGIT  ⟺  ∃ groupe note-égale avec  countActivesSansMarqueDeReprise > 1
           ET aucune des surnuméraires n'est verrouillee===true
        (= état illégal : >1 active note-égale sans marque sur un couple)

VERT (Fictivam)  ⟺  les 2+ actives ont des notes normalisées DIFFÉRENTES (groupes distincts de taille 1)
VERT aussi      ⟺  une seule active, OU surnuméraire = reprise marquée (4 marques), OU verrouillée
```

### 4.3 Sites d'édition (cœur de prévention)

| Fichier | Localisation | Changement |
|---|---|---|
| Helper (module entité testable, ex. dédié) | `_reconcilierActivesNoteEgale` exporté | Créer la fonction pure (§4.1). |
| `evaluation-sauvegarde.js` | save manuel, l.414-421 | Appeler le réconciliateur sur le tableau lu l.414 ; **si `modifie`, persister AVANT la bascule** (§3.1). Conserver la garde double-clic. |
| `evaluation-chargement.js` | auto-save, après l.1368, avant `findIndex` l.1369 | Appeler le réconciliateur (l'invariant `verrouillee` vit dans le helper). |

### 4.4 Sentinelle Vitest (≥ 1 break-test)

| Cas | Attendu | Break-test |
|---|---|---|
| 2 actives note-égale sans marque | après réconciliation, exactement 1 active sans `remplaceeParId` | **oui** |
| 2 actives **divergentes** (Fictivam 77,3 / 79) | **aucun** marquage ; 2 actives restent | non (contre-cas) |
| reprise légitime note-égale (marquée) | non re-marquée | non |
| surnuméraire plagiat/ia ou `noteFinale` null | déjà écarté par le moteur → aucun marquage | non |
| paire note-égale dont la non-survivante est **verrouillée** | **aucun** marquage | oui |
| (reporté avec le splice) ratchet statique : la branche `splice(indexOriginal…)` a disparu des 2 fonctions | `expect(source).not.toMatch(...)` | non |

---

## 5. Carte des consommateurs (corrigés vs dangereux)

**Corrigés** par la réconciliation (ils sur-comptaient les doublons, pas l'inverse) :
`pratiques/pratique-sommative.js:74-99` (somme `note*pond` sans dédup),
`pratiques/pratique-pan-standards.js:169-220` (top-N non dédup),
`pratiques/pratique-pan-specifications.js:166-178` (comptage par type),
`profil-etudiant-actions.js:265-337` (hybride/legacy top-N),
`consolidation.js:100-124`, `actions-rlo.js:176-202`, `etudiants.js:898-909`
(flag **dépistage** `performanceInsuffisante`), `evaluation.js:702-721`, `impact-jetons.js:202-207`.

**À border (collision §3.2)** : `liste-evaluations.js:1947-1962` (`restaurerOriginaleSiReprise`)
et `evaluation-jetons.js:506-561` (`retirerJetonReprise`) — résolus par l'option retenue en §3.2.
Faux positif cosmétique à border aussi : `liste-evaluations.js:1655-1656` (avertissement
« lié à une reprise » sur un doublon réconcilié).

**Second lecteur du prédicat** : `_obtenirNoteTerminaleEtudiant` (`profil-etudiant-actions.js:379-390`)
prend la 1ʳᵉ active (`.find`) — un doublon terminal note-égale n'y casse pas la valeur.

---

## 6. Périmètre et séquencement

- **Cœur de prévention (1 session de code)** : helper §4.1 + 2 chemins de save (avec fix
  persistance §3.1) + résolution collision §3.2 + garde/sentinelle break-testée §4.4.
  *Différé par la décision « Pause » du 28 juin : à coder à la prochaine session.*
- **Sous-lot reporté 1 — tarir le `splice`** : **pas du code mort.** Le splice est branché
  sur une **préférence utilisateur vivante** (radio `mat-reprise-originale value="supprimer"`,
  `index.html:6372` → `pratiques-gestion.js:1218-1224` / `1589-1596` → `evaluation-jetons.js:46/66/149`,
  `archiverOriginale:false`). Le retirer sous zéro-dette oblige à retirer **toute la chaîne
  UI+config** (sinon contrôle d'interface qui ne fait plus rien — pire que le splice) →
  **décision produit de Grégoire** + entrée changelog. Bénéfice connexe : répare l'undo
  (`retirerJetonReprise`) qui ne peut restaurer l'originale que si elle existe encore.
- **Sous-lot reporté 2 — diagnostic rétroactif** : greffer sur `migration-diagnostic.js`,
  **patron `reparerCoursIdProductions`** (Brique D), pas `migrationSupprimerFichierId`.
  `dryRun` par défaut (`options.dryRun !== false`) ; parcours **par trimestre** via
  `cleSource('evaluationsSauvegardees', t.id)` + `db` (**pas** `obtenirDonneesSelonMode` =
  mode courant) ; pool d'actives via le **prédicat 6 conditions** (la section existante l.35
  filtre sur le `!remplaceeParId` nu → à corriger) ; refus de trancher les divergents
  (= « Fictivam juge de paix ») ; corriger la **faille [0]** (section l.55-70 étiquette par
  `groupe[0]`/ordre du tableau → étiqueter par **ordre moteur**, tri `noteFinale` desc).
  **Touche les vraies données → session dédiée, backup Codex + dry-run d'abord** (comme la migration).

---

## 7. Limite assumée et cause racine

- **La prévention ne couvre que les surnuméraires *note-égale*.** Un orphelin **re-noté
  divergent** (re-save ratée puis re-notée légèrement différemment, ex. 79,0 / 79,4) est
  *laissé intact* — comme Fictivam — alors qu'il **double** la production dans le top-N
  (`pratique-pan-standards.js`), la somme pondérée et la consolidation. Le code n'a aucun
  champ pour distinguer « double remise intentionnelle » (Fictivam, validé Omnivox) d'« orphelin
  re-noté ». **Décision actée : ne jamais trancher un divergent automatiquement.** Le
  diagnostic rétroactif (sous-lot 2) devra au minimum **lister** ces couples divergents
  multi-actifs pour revue humaine, pour qu'ils ne restent pas invisibles.
- **Cause racine des doublons existants (hors périmètre #360)** : non-persistance silencieuse
  — `_trackWrite` (`db.js:1093-1110`) avale l'échec de flush IDB en `console.warn` (l.1104),
  `flush()` non garanti avant rechargement. **Ne PAS faire rejeter `_trackWrite`** (casserait
  le `Promise.all` de `flush()` et le contrat fire-and-forget de `setSync`). #360 ne réduit
  que la naissance **intra-session** (réconciliation au save) ; la perte au reload reste un
  chantier distinct, connecté aux 🔴 #352/#353 (quota saturé).

---

## 8. Décision en attente (résumé pour relecture à froid)

**Une seule décision principale avant de coder** : §3.2 — *comment lever la collision sur
`remplaceeParId`* → **Option A (drapeau discriminant, recommandé)** vs **Option B (gater les
writers)**. Tout le reste (§3.1 persistance, §4 mécanique, §4.4 sentinelle) est dérivé et ne
demande pas d'arbitrage. Les deux sous-lots reportés (§6) feront chacun l'objet de leur propre
ouverture (splice = décision produit ; diagnostic = session dédiée à risque données).
