# Consigne – le banc du critère algorithmique rouge depuis la présentation en étapes (dimanche 25 octobre 2026)

> Écrite par Cowork le dimanche 25 octobre 2026 à 11 h 53 (Toronto).
> **Ordre (décision de Cowork)** : APRÈS le lot des bibliothèques en cours, AVANT la version du soir. **Sur `main`**, pas sur la branche des bibliothèques. Motif : la vérification complète du soir prendrait ce rouge et bloquerait la mise en ligne.

## 0. Avant tout

- **Sur `main`.** Aucune suite ne tourne en arrière-plan (règle 5) ; pas de suite Playwright complète (règle 7) : ce banc seul, puis ses voisins.
- Commit de docs seul, fichiers nommés : cette consigne et `VERDICT-RELECTURE-2026-10-25-statut-incomplet-retouche.md`.

## 1. Le constat (Claude Code, 25 oct., retouche du statut incomplet)

`tests/integration/critere-algorithmique-dit-vrai.spec.js`, essai « #1131 · un critère algorithmique en création reçoit ses sous-critères… » (l. ~143), est rouge sous WebKit : le bouton « Partir de la liste du français écrit (codes 1 à 10) » (`grilles.js`, l. ~4668) n'est pas visible. Rouge aussi sur `b4e0fd08`, donc antérieur au statut incomplet. Hypothèse non vérifiée : depuis la présentation en cinq étapes, une seule ouverte (`9b70e1b1`, #1150 lot 4, `js/atelier-algo.js`), le banc n'ouvre plus l'étape des sous-critères.

## 2. Ce qu'il faut trancher, par la mesure

- **D'abord : un enseignant, par de vrais gestes, atteint-il ce bouton ?** Ouvre une grille neuve, un critère algorithmique en création, et suis le chemin de l'atelier.
  - **Oui** (il faut ouvrir l'étape) : c'est le banc qui n'est pas à jour. Il ouvre l'étape comme le ferait l'enseignant, puis vérifie ce qu'il vérifiait. Aucun changement de code.
  - **Non** (le bouton est caché ou inatteignable) : c'est une régression de la présentation en étapes, vécue par tout enseignant qui crée un critère algorithmique. Corrige le code, dans le lot qui l'a introduite ; le banc la fixe.
- Écris dans la demande de relecture lequel des deux, et comment tu l'as établi.
- Passe ensuite les autres bancs qui ouvrent l'atelier (`grep -l "atelier\|critere-algo" tests/integration/`) : un même défaut peut en rougir d'autres. Tout autre rouge trouvé : cité, avec sa cause.

## 3. Clôture

- **Pas de release, ni verdict, ni push** : ce lot conditionne la version du soir.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-25-banc-critere-algo-1131.md`.
- Geste à vérifier à l'écran : aucun si c'est le banc ; si c'est le code, le chemin de l'enseignant jusqu'à « Partir de la liste du français écrit ».
