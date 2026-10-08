# Consigne du jour – petit lot : le verrou d'un exemple et les mots de « Conflit de nom » (patch)

> Écrite par Cowork le 8 octobre 2026 à 9 h 52 (Toronto, mesurée par `date`). Remplace la consigne du lot 6, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-08-enregistrement-lot-6.md`.

## Où on en est

1.190.0 est en ligne (`eae9caf7`, Netlify à 8 h 51) ; la porte de #967 est passée par Grégoire en démo à 9 h 50 (« 23 évaluations l'emploient »). En la passant, il a trouvé deux défauts ; ce lot les règle.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md` et `SUIVI-BUGS.md`, et à faire la release sur `main` local. **Pas de push avant la relecture de Cowork.**

## 1 · Le verrou d'un exemple (symptôme vécu par Grégoire, 8 oct. 9 h 48)

**Constat** : en démo, après avoir ouvert une échelle d'exemple (lecture seule, bandeau « Exemple fourni par Labo Codex… »), « + Nouvelle échelle » ouvre un formulaire vide **mais toujours verrouillé** : le nom ne se saisit pas, le bandeau reste.
**Cause lue par Cowork** (à confirmer) : `BibliothequeUI.appliquerModeLectureSeuleDemo` (`bibliotheque-ui.js:324`) pose `disabled` et le bandeau à l'ouverture d'un exemple (`echelles.js:2402`) ; `creerNouvelleEchelle` (`echelles.js:1868`) ne le retire jamais.
**À faire** : inscris la fiche au backlog, puis corrige. Mesure le même chemin pour la grille et la cartouche (« + Nouvelle grille », « + Nouvelle cartouche » après un exemple) et pour le mode réel s'il montre des exemples en lecture seule ; corrige tous ceux qui ont le défaut, d'une seule façon.

## 2 · Les mots de « Conflit de nom » (`js/modal-doublon.js`), validés par Grégoire (« oui », 9 h 52)

- Phrase d'ouverture : « Une échelle de performance porte déjà le nom «&nbsp;IDME 4 niv&nbsp;». » (même forme pour « grille de critères », « cartouche de rétroaction » ; guillemets français ; le nom en gras couleur comme aujourd'hui).
- Sous « Remplacer l'existante » : « L'existante sera remplacée par la nouvelle, si rien ne l'emploie. Cette action est irréversible. » (la seconde phrase en gras comme aujourd'hui).
- Les libellés de type (`modal-doublon.js:19-23`) reprennent leurs accents : « grille de critères », « échelle de performance », « cartouche de rétroaction ». Tout autre texte **visible** du fichier sans ses accents se corrige de même (les commentaires, non).

## 3 · Tests, release

Bancs avec break-test : après un exemple, « + Nouvelle … » donne un formulaire modifiable, sans bandeau ; la fenêtre affiche les nouveaux mots. Specs voisins (lot E1, #967), Vitest complet. Noms manifestement fictifs.

Release patch par `scripts/release.mjs`, commits séparés, relais écrit. Ligne des Nouvelles proposée dans ton rapport, à part, non écrite (patch consolidé dans l'entrée 1.190). Puis arrête-toi : relecture de Cowork, verdict (Chrome et Safari fermés), push.

## Ton rapport à Grégoire

En gestes d'utilisateur, numéros entre parenthèses en fin de ligne. Le geste à l'écran, en démo dans une fenêtre privée : ouvrir l'échelle « IDME 4 niv », puis « + Nouvelle échelle » ; le nom se saisit. Ce que tu as supposé, une ligne par supposition.

## Suite – relecture de 1.190.1 (8 oct. 2026, 10 h 10, Toronto)

**Relecture faite, rien ne bloque.** Lus : `759a8835` (`quitterModeLectureSeuleDemo`, appelé avant la remise à neuf dans les quatre créations ; `estItemDemo(null)` rend faux), `53e0ebf6` (mots), `2f247642` (release). Tests non relancés par Cowork.

**Ligne des Nouvelles validée par Grégoire** (« oui », 10 h 10). Ajoute-la telle quelle comme item de l'entrée 1.190 (1.190.1 consolidé), avec le commentaire de provenance habituel :

- Conception : après l'ouverture d'un exemple, « + Nouvelle échelle » (ou grille, cartouche, production) ouvre un formulaire que tu peux remplir.

Typographie du fichier : espaces insécables (`&nbsp;`) dans les guillemets et avant le deux-points.

Puis : commit du changelog, Chrome et Safari fermés, verdict complet, push, vérification de la mise en ligne chez Netlify. Rapport en gestes d'utilisateur, avec le geste en démo de ton rapport.
