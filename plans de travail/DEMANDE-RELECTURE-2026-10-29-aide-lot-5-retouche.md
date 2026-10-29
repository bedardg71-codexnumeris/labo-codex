# Demande de relecture – L'Aide, lot 5 : la retouche et la retouche 2 (#1152)

> Claude Code, jeudi 29 octobre 2026, sur `main` (non poussé). Verdict : `VERDICT-RELECTURE-2026-10-29-aide-lot-5.md`.
> Commits : `f6a3827f` (retouche 1, avec la ligne ↻ de Cowork dans TEXTES, que la sentinelle lit), `809c7d04` (retouche 2), et un commit de docs (le verdict, cette demande).
> Vitest (depuis `tests/`) : 847 fichiers, 10 259 tests, tout vert. Playwright ciblé, WebKit : 23 verts (Aide 2c bis et 2d, Exploration des pratiques, Cadre et pratiques). Pas de verdict Playwright complet, pas de release, pas de push.

## Retouche 1 – `f6a3827f`

| Point | Avant | Après |
|---|---|---|
| 1. « le comparateur » | `comparateur-pratiques.js:59, 69, 722` : « Le comparateur est un outil expérimental… », « …est en construction… », « …s'appuie sur… » | « L'Exploration des pratiques est un outil expérimental… », « …est en construction… », « …s'appuie sur… » (accords inchangés : « un outil », « son amélioration ») |
| | `wizard-pratique-v2.js:2062` : « Ouvrir le comparateur du Labo » | « Ouvrir l'Exploration des pratiques » |
| | **en plus**, `pratiques-gestion.js:399` (la note des maquettes de la bibliothèque) : « dans le Labo → Comparateur » | « dans Labo → Exploration des pratiques » ; la sentinelle N6, qui épinglait la flèche, suit |
| 2. la reprise ciblée offerte | bulle `cn-pratique-jetons` : « …Délai (…), Reprise (…) ou Reprise ciblée (reprendre un aspect spécifique). » | « …Délai (prolonger l'échéance) ou Reprise (refaire la production). » |
| | aide de l'assistant : « délai, reprise, reprise ciblée (optionnel) » | « délai, reprise (optionnel) » |
| | bulle `eval-niveau-idme` (`:360`) : « …(ex. : reprise ciblée). » | « Niveau calculé automatiquement. Modifie uniquement si nécessaire. » |
| | `evaluation-chargement.js:1189, 1224` : « Modifiez uniquement si nécessaire (ex: jeton de reprise ciblée). » | « Modifie uniquement si nécessaire. » |
| | **gardé** : bulles `:381`, `:383`, badges, profil, filtre et badge de la Liste, synthèse, impact des jetons | |
| 3. la cartouche verrouillée | le conseil « Les cartouches peuvent être verrouillées une fois finalisées… » | parti (l'aide `construction-cartouches` garde ses autres sections) |
| 4. le HEIC | bulle `nav-labo-modelisation` : « (PDF, JPG, PNG ou HEIC) » ; l'Aide `labo` : idem | « (PDF, JPG, PNG ; HEIC selon le navigateur) » aux deux endroits ; la sentinelle du lot 2d suit |

Non touché : `js/config.js:123` (« Ouvrir le comparateur du Labo » dans un commentaire) : zone protégée, et ce n'est pas un écran.

**Tests.** La sentinelle du lot 5 gagne un bloc « retouche » : les dix formes retirées sont absentes des écrans (lignes et blocs de commentaire exclus ; mot entier, sinon « cel**le comparateur** », une classe CSS, répondait) ; ce qui nomme une reprise ciblée déjà faite reste ; le n° 9, lu dans TEXTES, est dans la bulle, au bouton et dans l'Aide. **Break-test** : la bulle reprend « ou HEIC » → 3 rouges ; arbre restauré, sha256 identique ; témoin vert.

## Retouche 2 – `809c7d04` (décision de Grégoire, 6 h 46, A)

- **Le formulaire** : le bloc « Séance concernée : » et son `input` partent, avec le pré-remplissage depuis la date de l'intervention (`gererVisibiliteContexteIntervention`, ancien `:801-807`, que le verdict ne nommait pas : il n'écrivait que dans ce champ). « Gestion des absences » garde sa phrase ; `marquerNonParticipantsMotives` ne change pas.
- **L'écriture** : à l'enregistrement, plus de `seanceConcernee` (ni la valeur, ni le `null` hors rattrapage) ; à la création, plus de clé.
- **Le code sans appelant** : `obtenirAbsencesMotiveesParDate` et son export (grep sur `js/` et `tests/` : aucun appelant ; seul #733 posait la clé dans une donnée de banc).
- **Les commentaires** : l'en-tête (`:99-104`) et celui du service (`:786`) disent ce qui reste.
- **Aucune donnée réécrite** : une intervention qui porte `seanceConcernee` la garde (l'objet stocké est modifié en place) ; le report des présences ne change pas.
- **L'Aide** `planifier-rai` :
  - avant : « …et le statut, « En préparation » ou « Complétée ». En rattrapage, « Gestion des absences » porte la séance concernée. Coche les étudiant·es… »
  - après : « …et le statut, « En préparation » ou « Complétée ». Coche les étudiant·es… »
  - La phrase entière part : son seul contenu était « porte la séance concernée » ; « En rattrapage, « Gestion des absences » » seul n'aurait pas fait de phrase. **Si tu préfères la garder sous une autre forme, ce sont des mots : à dire.**

**Tests.** Bancs suivis, chacun avec sa ligne ↻ : #733 (la valeur piégée ne se rend plus du tout), #772, #834, lot E3, lot 5 cadrage 11, rencontre lot C, les deux audits de Suivi. **Deux essais neufs** dans #772 : le formulaire d'un rattrapage a « Gestion des absences » et sa phrase, et plus aucun « Séance concernée » ni la date stockée ; une intervention qui portait la clé la garde après enregistrement, `obtenirAbsencesMotiveesParDate` n'existe plus, la création n'écrit plus la clé. **Break-test** : l'ancien `interventions.js` (HEAD d'avant) → les 2 essais neufs rouges ; arbre restauré, sha256 identique ; témoin vert.

## Ce qui reste à Grégoire (inchangé)

Les jetons actifs par défaut (à mesurer par Cowork d'abord) ; les bulles de la démo (`TEXTES-2026-10-28-guidage-demo.md`, relues par Cowork d'abord).

## Jetons anti-cache

`20261028h` (retouche 1), `20261028i` (`interventions.js`, retouche 2).
