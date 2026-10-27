# Consigne – Le barème, lot 3 : évaluer une copie avec le barème, et ce que l'étudiant·e lit (#1120, gestes 3 et 4)

> Écrite par Cowork le mardi 27 octobre 2026 à 10 h 29 (Toronto, mesuré par `date`), sur `main` = `0053ce5d` (étape 4 du critère algorithmique en cours, lot 4c). **À lancer après la clôture du lot 4c** (ordre de Grégoire, 26 oct., 21 h 24 : le barème aussitôt après l'étape 4).
> Plan : `PLAN-2026-10-19-bareme.md` (gestes 3 et 4, les invariants, les cinq réponses de Grégoire du 19 oct.). Faits : le geste 1 (l'éditeur, `js/bareme.js`), ses pièces d'aide, la grille vierge du PDF, le geste 2 (la dissection). Textes : `TEXTES-2026-10-27-bareme-evaluation.md` (**ne lance pas avant que son en-tête dise « validés »**).
> **Découpage décidé par Cowork** : les gestes 3 et 4 en un seul lot. Le geste 4 n'ajoute aucun mot : il pose sous le chiffre un texte que l'enseignant·e a déjà écrit.

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Les documents non commités de Cowork ne sont pas un obstacle.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, `TEXTES-2026-10-27-bareme-evaluation.md`.

## 1. Les invariants du plan (à tenir mot pour mot)

1. **Le barème n'entre dans aucun calcul** : ni la note, ni P, ni le Comparateur, ni l'export, ni le dépistage. Sentinelle : mêmes points, même note et même P, avec ou sans barème.
2. **Une seule lecture** : `bareme.js` (`tranchesDuCritere`, `trancheDesPoints`), pour l'évaluation, le PDF et le bilan. Le PDF reçoit la tranche, il ne la calcule pas.
3. **Le zéro est une valeur** ; une tranche sans points est `null`, pas 0 ; la virgule se lit.
4. **Aucune valeur fabriquée** : toucher une tranche de plusieurs valeurs offre ses entiers, bornes incluses ; la saisie directe sert au reste (5,5). Tant que rien n'est choisi, rien ne s'enregistre.
5. **Rien ne s'efface** ; **seuls les points s'enregistrent** (réponse 1 du 19 oct.) : aucune donnée neuve sur l'évaluation.

## 2. Ce que l'enseignant·e voit, en gestes

- **Geste 3, évaluer** : sous un critère analytique qui a un barème, ses tranches dans l'ordre du barème : le nom (s'il y en a un), les points (`pointsEnTexte`), le texte, **lisibles avant de toucher** (ni infobulle, ni fenêtre). Toucher une tranche fait paraître ses valeurs entières, sans rien déplacer sous le doigt ; une tranche d'une seule valeur pose ses points d'un coup. Toucher une valeur pose les points dans le champ, **par le même chemin que la frappe** (`pointsSaisis`). Le champ reste, précédé de H2. La tranche des points saisis se montre choisie, que les points viennent d'un toucher ou de la frappe. Des points qu'aucune tranche ne couvre portent la marque H3, ni en alerte de dépistage ni en erreur ; une tranche sans points, la marque H4, et ne se touche pas. La bulle H1 sur le barème. Cibles de 44 × 44 px, espacées ; Tab, puis Entrée ou Espace.
- **Les deux surfaces d'évaluation** qui montrent le champ `eval_pts_` (`js/evaluation-chargement.js` l. ~1232 et ~1424) : les deux.
- **Une copie verrouillée** : les tranches se lisent, ne se touchent pas (`desactiverFormulaireEvaluation`).
- **Geste 4, ce que l'étudiant·e lit** : dans le PDF (`lectureNiveauCritere`, `synthese-retroaction-data.js` l. ~820) et dans le bilan de l'application (`_lectureNiveauBilan`, `evaluation-retroaction.js` l. ~962) : le chiffre (« 3 / 5 »), et dessous le **texte** de la tranche atteinte, **sans son nom**. Hors barème, ou sans barème : le chiffre seul. Les deux disent la même chose du même critère.
- **Un critère sans barème** : rien ne change, à l'écran comme sur le PDF.

## 3. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. Les valeurs offertes d'une tranche : ses entiers de `pointsMin` à `pointsMax` ; une tranche aux bornes décimales (2,5 à 4) offre 3 et 4, la saisie directe sert au reste. Au-delà de 20 valeurs, n'offre que les bornes : la saisie directe fait le reste.
2. Deux tranches du stock qui se chevauchent (« 3-4 » et « 4-5 », lu dans d'anciennes réponses) : la tranche choisie et celle du PDF sont celles que rend `trancheDesPoints`, la règle existante. Mesure-la et dis-la.
3. **Le texte du PDF vient du barème actuel** : seuls les points s'enregistrent. Un barème réécrit après la remise change donc le texte d'un PDF refait plus tard. Ne change rien à cela ; mesure-le et dis-le dans la demande de relecture.

## 4. Pièges connus

1. La sentinelle de l'invariant 1, avec et sans barème ; le relevé des notes d'une grille sans barème, identique.
2. Les points posés par un toucher arment l'enregistrement exactement comme une frappe ; rien de plus.
3. Règles 1, 2 et 4 de `CLAUDE.md` : le nom et le texte d'une tranche par `echapperHtml` dans les trois affichages (évaluation, PDF, bilan) ; un essai pose un `<img onerror>` dans un nom et un texte de tranche ; `data-action`, aucun gestionnaire en ligne ; aucun `console.log`. Aucun nom d'élève réel.
4. Les pièces d'aide : H1, H3 et H4 ont leur entrée au catalogue des bulles (`accompagnement-contenu-hover.js`) ; le banc des bulles le vérifie.
5. Le texte d'une tranche est la rétroaction propre du critère : sur le PDF, il garde ses sauts de ligne et sa typographie.

## 5. Preuve exigée

- **Vitest** : les valeurs offertes (une valeur, plusieurs, bornes décimales, plus de 20) ; la tranche des points (dedans, aux bornes, hors barème, 0, sans points) ; la lecture du PDF et du bilan (chiffre et texte ; chiffre seul) ; l'invariant 1. Break-test pour chacun.
- **Playwright (WebKit)** : une grille avec un critère analytique à barème (l'exemple Journal de lecture) et un holistique ; toucher une tranche, puis une valeur ; taper 2,5 ; des points hors barème ; une tranche à compléter ; la copie enregistrée, puis son PDF (vrai trajet) : le chiffre et le texte sans le nom ; le bilan ; la copie verrouillée ; un critère sans barème inchangé ; 1 440, 1 180, 820 et 700 px.
- **Captures** : le barème à l'évaluation (rien de choisi, une tranche ouverte, hors barème), le critère dans le PDF, 1 440 et 820 px, clair et sombre.
- Portes terrain : skill `portes-terrain`, ses deux règles de tête d'abord. La livraison déclare non éprouvés le toucher sur l'iPad et le zoom (plan, « Portes et déclarations »).

## 6. Ce qui n'entre pas

Le barème d'un critère algorithmique ; des cartouches par tranche ; l'objectif d'intervention en tranches ; un texte de tranche gardé sur la copie.

## 7. Clôture

- `BACKLOG.md` : #1120, les gestes 3 et 4 faits ; le skill `pratiques-notation` reçoit sa section « barème » après son § 7 bis (plan, « Portes et déclarations »).
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-bareme-3-evaluer.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
