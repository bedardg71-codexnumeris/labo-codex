# Consigne – L'Aide, lot 3 : un seul glossaire (#1152)

> Écrite par Cowork le mercredi 28 octobre 2026 à 13 h 40 (Toronto, mesuré par `date`), sur `main` = `ad56f6f8` (les huit parties de l'Aide réécrites et relues ; rien de poussé). Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> Plan : `PLAN-2026-10-24-refonte-de-l-aide.md`, lot 3. Sources, **dans cet ordre** : `audit-aide-2026-10-24/REMESURE-2026-10-27.md` (Référence : les trois constats sur `glossaire-statique` et le terme « Échelle de performance » de `js/accompagnement-contenu-terme.js:115`), puis `AUDIT-AIDE-2026-10-24.md` (D1 à D13 ; **D5** : une seule définition du sous-critère, un élément observable ; dans un critère algorithmique, une catégorie de ce qu'on compte), puis `lot-6-reference.md` (`glossaire` et `glossaire-statique`, avec le tableau « Comparaison des deux glossaires, terme par terme »).
> **Les lots 2 servent de modèle** pour la méthode et les tests ; ici, le texte vit dans `js/accompagnement-contenu-terme.js` (un fichier `js/` : le bloc de jetons d'`index.html` suit).

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Rituel de début de session.
- Commit de docs seul, fichiers nommés : ce fichier et `VERDICT-RELECTURE-2026-10-28-aide-lot-2d.md`. Rien d'autre (`CONSIGNE-DEMARRAGE-COWORK.md` et les deux icônes non suivies restent hors du commit).

## 1. Le mandat

Deux glossaires se contredisent ; un seul est branché sur l'aide contextuelle (« En savoir plus » d'un terme souligné), celui de `terme.js`. **`glossaire-statique` part de l'Aide** (~1 770 mots → 0) ; ce qu'il a d'unique et de juste passe dans `terme.js` (~500 mots visés) ; `terme.js` est corrigé. Aucun comportement de l'application ne change, sauf le point 4 s'il est mesuré.

## 2. Le travail

1. **Corriger `terme.js`** d'après le dossier (`lot-6-reference.md`, `glossaire`) : l'en-tête (« 48 termes » : compte réel) ; Portfolio et Artefact (#803 : les modes réels, N meilleurs, N derniers, Tous, Hybride, pas « les meilleurs ») ; Trimestre (trois dates, pas « 15 semaines ») ; Progression (10 points, pas 5) ; Mode assistance (le bouton « Assistance » de l'en-tête ou la case de l'accueil ; pas de 📍) ; Jeton, « Reprise ciblée » (plus aucun geste ne l'applique : dis-le, ou retire-la, d'après l'écran) ; Trimestres séparés (« Importer depuis un autre trimestre », dans chaque bibliothèque) ; les 21 chemins « Voir : » périmés, aux libellés de `js/config.js` ; Évaluation (un niveau, des points ou un calcul, selon le type de critère) ; Niveau RàI (« sauf « Aucun » » seulement quand l'observation SOLO est cochée) ; Cartouche (plus de « idéalement 50 à 75 mots ») ; DEN (« PRÉN » et « RREC » définis ou renvoyés). **La remesure** : « Échelle de performance » (`:115`) dit cinq niveaux par défaut, « PS – Préstructurel » en tête, sans recopier les bornes si l'écran les lit dans l'échelle de chacun.
2. **Lever les contradictions** :
   - PAN : déjà tranché par Grégoire le 17 sept. (`terme.js:497` : la Dénotation est une PRÉN, l'application lui donne le badge « PAN » par commodité) ; le statique part, la contradiction avec lui. `sentinelle-803` exigeait « PAN – Dénotation » dans le statique : adapte-la par décision, en citant cette consigne.
   - Sous-critère : **D5**, une seule définition, celle de `terme.js` (validée le 19 oct.) complétée du sens algorithmique (validé les 21-22 oct., `critere-algorithmique-mots`) ; la remesure : ils se règlent à l'étape « Codes utilisés » du critère.
   - Pondération : deux objets réels (le poids d'un critère dans la grille, validé le 19 oct. ; le poids d'une production dans la note) : deux sens dans une même définition, le premier gardé mot pour mot.
   - Assiduité : celle de `terme.js` (« pas un jugement… »), avec la formule de A du statique (séances saisies), dite comme dans l'entrée `acp` du Suivi (lot 2c bis) ; « engagement cognitif » part.
3. **Porter ce que le statique a d'unique** (liste du dossier : Codex, Anonymisation, Données démo, Local, Journée sans cours et Reprise, Verrouillage, SRPNF, la formule de A, Notes finalisées, les méthodes du portfolio), chacun **remesuré au code** avant d'être écrit (les valeurs fausses du statique, le verrou des productions et des cartouches, « Congé imprévu », « Mode provisoire », « Bac à sable », ELLAC : ne passent pas). La remesure : Verrouillage dit l'évaluation verrouillée (le verrou de la palette Annotation, la note remise). **Les mots tranchés du plan** : codex, clos, archivé, « Faire revenir », réassigner, observation, chacun s'il n'a pas déjà sa définition.
4. **« En savoir plus » mène-t-il à la fiche ?** Le dossier l'a lu, pas vu : `afficherTermeGlossaire` (`js/accompagnement.js:1595`) appelle `afficherSection('aide')`, qui ouvrirait la première partie (Commencer), alors que le glossaire est dans Référence. **Mesure à l'écran d'abord.** S'il n'y mène pas, corrige dans `js/accompagnement.js` seulement : `js/navigation.js` et `js/config.js` sont des zones protégées (CLAUDE.md), n'y touche pas ; si la correction l'exige, arrête-toi et dis-le.
5. **Les ancres des tests qui lisaient le statique** (`lot-6-reference.md`, « Tests qui l'épinglent ») : `sentinelle-803`, `sentinelle-audit-aide-lot-E` (SRPNF, seule occurrence), la sentinelle du 15 oct. (« Séance non saisie », « Parcours en 7 étapes », la phrase RàI comptée au moins trois fois), `critere-algorithmique-mots` (G1, les sous-critères). Chacune suit le texte là où il va, par décision, en citant cette consigne ; si une exigence ne peut plus tenir, dis pourquoi.

**D2** : aucune définition ne présente la pratique de Grégoire comme la règle. **Aucun nom de personne réelle** dans les exemples.

## 3. Les mots

Pour Grégoire, dans la demande de relecture : **toute définition neuve ou réécrite au-delà d'une correction de fait** (les mots tranchés, les termes portés du statique, Pondération à deux sens, Sous-critère réuni, Assiduité réunie), terme par terme, avant et après. Les textes déjà validés (19 oct., 21-22 oct., 17 sept.) restent mot pour mot là où ils restent vrais.

## 4. Les tests

- Les sentinelles qui lisent `terme.js` (liste du dossier : `sentinelle-audit-aide-15-oct-…`, `-lot-B-surfaces-concordent`, `sentinelle-aide-apporter-mon-materiel`, `bareme-1-editeur`, `bareme-2-pieces-d-aide`, `critere-algorithmique-mots`, `sentinelle-textes-relus-15-oct`, `sentinelle-lot-29-cinq-textes-901-899`, `sentinelle-descriptions-denotation-343`, `sentinelle-carte-alignement-421-426`, `sentinelle-823-fenetre-analyse-rebranchee`) avant de toucher.
- **Une sentinelle neuve**, `tests/unit/sentinelle-aide-2026-10-28-lot-3.test.js`, calculée des deux côtés : `accordeon-aide-glossaire-statique` absente ; l'en-tête de `terme.js` dit le nombre réel de termes (compté en exécutant le fichier) ; aucune définition ne dit « les meilleurs sont retenus », « 15 semaines », « 5 points », « 📍 », « idéalement » ; chaque chemin « Voir : » commence par un libellé de `js/config.js` ; la Progression par défaut lue dans `interpretation-config.js`. Break-test, arbre restauré par sha256.
- **Un essai Playwright ciblé** : un terme souligné d'une aide, « En savoir plus », ouvre Aide › Référence et montre sa fiche (s'il ne le faisait pas avant le point 4, l'essai est rouge avant le correctif).
- Vitest depuis `tests/` ; bloc de jetons d'`index.html` à jour.

## 5. Ce qui n'entre pas

Les sept trous (lot 4) ; les textes d'écran hors de l'Aide (lot 5), dont « PAN-Dénotation » à l'écran. Le réglage de la copie non recevable (#1176).

## 6. Clôture

- `BACKLOG.md` : sous #1152, le lot 3 ; le plan dit « 3 : codé, en relecture ».
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-aide-lot-3.md` (terme par terme, avant et après, preuves `fichier:ligne`, tests, « Pour Grégoire »).
- Pas de release, de verdict ni de push sans le signal de Grégoire.
- Le geste à vérifier à l'écran après la mise en ligne : Aide › Référence, un seul glossaire ; toucher un terme souligné dans une aide, puis « En savoir plus », mène à sa fiche.
