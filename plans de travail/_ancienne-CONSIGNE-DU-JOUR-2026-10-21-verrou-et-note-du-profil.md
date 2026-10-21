# Consigne du jour – deux petits correctifs vécus par Grégoire (mercredi 21 octobre 2026)

**Lot 1** : « Verrouiller la saisie » des présences. **Lot 2** (ajouté à 10 h 20) : la note du profil affichée avec quatorze décimales. Un commit par lot, dans cet ordre ; le point 0 vaut pour les deux, la clôture (§ 5) pour chacun.

> Écrite par Cowork le mercredi 21 octobre 2026 à 10 h 07 (Toronto, mesuré par `date`). Elle remplace celle du 19 octobre, temps B de la 1.209 (fait : livré depuis, la 1.212.0 est en ligne), archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-19-version-1.209-temps-B.md`.

# Lot 1 – « Verrouiller la saisie »

## Ce que Grégoire a vécu (ses mots, 21 oct. 2026)

Dans la saisie des présences, « Fermer » et « Verrouiller » ne sont pas clairs. « Fermer » quitte la page, et on ne peut plus verrouiller : on ne sait pas si c'est enregistré ou non. Il veut **le même comportement que « Verrouiller l'évaluation »** : un seul bouton, « Verrouiller la saisie ».

## 0. Arbre propre d'abord

À 10 h 05, une autre session avait des modifications non commitées dans `index.html` et `js/accompagnement-contenu-*.js`. **Ne commence pas avant que l'arbre soit propre** (`git status` vide, sur `main`) : ce lot touche aussi `index.html`, et une seule session écrit à la fois.

## 1. Le modèle à reproduire (déjà en place, à lire avant de coder)

- `js/evaluation.js` : `basculerVerrouillageEvaluationCourante` (une seule porte pour le verrou) et `_libellerBoutonVerrouiller` (le bouton change de libellé, reste toujours actif).
- `index.html`, panneau Paramètres de l'évaluation : `#btnVerrouillerEvaluation`, `btn btn-principal`.

## 2. Le mandat

Dans la barre `#actions-presences-bar` (`index.html`, vers la ligne 8027) :

1. **Retirer « Fermer »** (`data-action="fermerSaisiePresences"`) **et la case à cocher** (`#controle-verrouillage-presences`, sa case, son libellé, son icône). Zéro dette : `fermerSaisiePresences`, son export `window.` et tout code qui ne servait qu'à la case partent avec.
2. **Ajouter un seul bouton** `btn btn-principal btn-compact`, branché par `data-action` sur la porte existante `basculerVerrouillageDateActive` → `basculerVerrouillageDate` (qui enregistre déjà la séance avant de la verrouiller ; n'y change rien). Libellé : **« Verrouiller la saisie »** sous une séance non verrouillée, **« Déverrouiller la saisie »** sous une séance verrouillée. Toujours actif, comme celui de l'évaluation. Caché quand aucune date valide n'est affichée (comme l'est la case aujourd'hui).
3. **L'état dit le verrou.** Sous une séance verrouillée, `#etat-seance-presences` lit **« Séance verrouillée »**, précédé de `icons/icon-lock.svg`, au lieu de « Séance saisie ». C'est la réponse à « on ne sait pas si c'est enregistré ». La bordure du compteur garde sa couleur actuelle selon l'état.
4. **Ne rien changer à** « Rapport », « Confirmer la séance » (hypothèse de Cowork, à dire dans ton rapport : c'est un autre geste, « tout le monde est là », hors de la demande), aux messages de `basculerVerrouillageDate`.
5. **Le retour à la liste** se fait par le sous-onglet « Liste » de la navigation. ⚠ « Fermer » vidait l'écriture en attente avant de partir. **Mesure** qu'une saisie suivie, dans la seconde, d'un clic sur le sous-onglet « Liste » est bien en base. Si elle se perd, corrige dans `saisie-presences.js` **sans toucher à `js/navigation.js` ni `js/config.js`** (zones protégées) ; si c'est impossible sans elles, arrête-toi et dis-le.

## 3. Les tests

Ces fichiers nomment « Fermer » ou la case et doivent être réécrits pour garder l'invariant nouveau, pas supprimés : `tests/unit/audit-sous-onglets-suivi-2026-09-06.test.js` (S5), `tests/unit/sentinelle-lot-d-presences-enregistrement.test.js` (« Fermer emporte l'écriture en attente » → le verrou l'emporte ; quitter vers « Liste » l'emporte, selon la mesure du point 5), `tests/integration/presences-lot-d-enregistrement.spec.js` (la barre à 360 px), `tests/integration/lot-a-anonymisation-enregistre.spec.js`, `tests/integration/temoin-enregistrement-lot-b.spec.js`. La sentinelle #768/#782 doit rester verte sans modification. Break-test pour chaque test neuf ou réécrit (skill `verification-adverse`).

Vitest depuis `tests/`, puis les seules specs Playwright des présences. **Pas de verdict complet ni de release maintenant** : cadence du 11 oct., le verdict tourne le soir, quand Grégoire dit que sa journée est finie.

## 4. iPad

La règle des 44 px de `#actions-presences-bar .btn` (`styles.css`, vers la ligne 10460) couvre le nouveau bouton : vérifie-le, et que la barre passe à la ligne proprement à 360 px et à la largeur de l'iPad Air.

## 5. Clôture

- Commit sur `main`, puis demande de relecture à Cowork avant le push (règle 2 de `PROTOCOLE.md`).
- Un item « Nouvelles » proposé dans ton rapport, **pas écrit** dans `changelog-data.js` : Grégoire le valide à la release du soir.
- Toute trouvaille hors du lot : trois issues (`CLAUDE.md`), « inscrire et continuer » par défaut.
- Termine par **le geste à vérifier à l'écran**, en une phrase d'utilisateur.

# Lot 2 – la note du profil avec quatorze décimales

## Ce que Grégoire a vécu (rapport de bug, 21 oct. 2026, 10 h 16, version 1.212.0, Chrome sur Mac, gravité « gênant »)

Profil d'un·e élève, tableau « Liste des productions », colonne Note : « E 89.23679060665361% », « M 79.33333333333333% », alors que les autres lignes lisent « I 57.5% », « D 67% ». Sa description : « Il y a trop de décimales dans le résultat. On avait pourtant réglé ce bug… »

À inscrire dans `Retours des testeurs/SUIVI-BUGS.md` (lecture ciblée, 120 Ko). ⚠ Ne recopie PAS la liste « Dernières actions » du rapport : elle porte des noms d'élèves réels.

## Ce que Cowork a mesuré (à remesurer, règle 1 de `PROTOCOLE.md`)

- **Pourquoi « on l'avait réglé »** : le bogue 123 (24 mai, `SUIVI-BUGS.md` vers la ligne 644) a arrondi l'affichage de la seule « Liste des évaluations » ; la note se stockait alors arrondie. Depuis #572 (29 août) et #701, `noteFinale` est stockée **exacte, délibérément** (`window.noteCalculeeCourante`, `evaluation-calcul.js` vers la ligne 1684). Tout affichage qui la lit brute montre donc le bruit.
- **Ce n'est pas un problème de stock** : la valeur exacte en base est voulue. On ne touche à aucune donnée ; on corrige l'affichage seulement.
- **La convention d'affichage déjà en place** : `Math.round(note * 10) / 10` suivi de `%` (une décimale au plus, pas de zéro final : « 67% », « 57.5% », « 89.2% »). Copies inline : `liste-evaluations.js` (vers 1212, 1385, 1856), `evaluation.js` (vers 1401).
- **Les affichages bruts trouvés par `grep`** (balaie-en d'autres) : `profil-etudiant-sections-affichage.js` vers 2875 (le bogue vu), `travaux-ui.js` vers 7205, `travaux-export-pdf.js` vers 1055 et 1063 (l'aperçu du PDF de l'élève), `journal.js` vers 192 et 231.

## Le mandat

1. **Une seule fonction d'affichage** de la note en pourcentage, à la convention ci-dessus, placée où les quatre modules peuvent la lire. Tous les affichages bruts passent par elle, et les copies inline existantes aussi (zéro dette : une convention, un endroit).
2. **Ne change pas** la valeur stockée, ni le calcul, ni les `toFixed(1)` de la note finale du profil (autre affichage, hors du bogue ; trouvaille à inscrire si tu juges qu'il faut les unifier).
3. **Une sentinelle** qui garde l'invariant, pas des exemples (leçon de #768/#782) : aucun fichier de `js/` n'interpole `noteFinale` suivi de `%` sans passer par la fonction. Break-test : remettre la ligne 2875 d'origine doit la rougir.

## Le geste à vérifier à l'écran

Rouvrir le profil du même élève : « Portrait de lecteur/lectrice » et « Artefact 4 » lisent une décimale au plus.
