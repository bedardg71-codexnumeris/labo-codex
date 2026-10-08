# Consigne du jour – chantier de l'enregistrement, lot 6 : « Écraser » refusé pour un homonyme employé (#967)

> Écrite par Cowork le 7 octobre 2026 à 18 h 59 (Toronto, mesurée par `date`), pour la session du 8 au matin. Remplace la consigne du lot 4, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-07-enregistrement-lot-4.md`.

## Où on en est

1.189.0 est en ligne (`9f9c304d`, Netlify le 7 à 17 h 23). Lots 3, 4 et 5 du plan en ligne ; équipes de Mathieu en ligne (#1039), porte passée. Plan : `plans de travail/PLAN-2026-10-07-chantier-enregistrement-suite.md`, **lot 6**.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, `SUIVI-BUGS.md`, `RELAIS.md` et `OU-EN-EST-ON.md`, et à faire la release sur `main` local. **Pas de push avant la relecture de Cowork.**

## 0 · Avant tout

- Si le résultat de la sonde de Mathieu (#1038) est arrivé dans `Retours des testeurs/`, **arrête-toi** et dis-le en une ligne : un retour testeur passe avant ce lot.

## 1 · Ménage de la veille (sans push isolé)

1. **Commite** les fichiers de Cowork : cette consigne, son archive, `CONSIGNE-DEMARRAGE-COWORK.md`.
2. **`RELAIS.md`** : la section de 1.189.0 dit encore « Rien n'est poussé » ; corrige-la (en ligne le 7 à 17 h 23, Netlify `6ac6b845`, `commit_ref` `9f9c304d`, verdict vert).
3. **`OU-EN-EST-ON.md`** : mets-le à jour pour le 7 (trimestre créé par la fiche du Cadre et « Annuler », porte passée ; équipes, porte passée ; le reste sans geste visible). Une ligne ne passe à « fait » qu'avec sa phrase « vérifié comment ».
4. **Retire le worktree `1039-equipes`** (branche fusionnée en avance rapide dans `main`).

Ces trois écritures partent avec la release du lot, pas seules.

## 2 · Le lot 6 – #967

**Décision de Grégoire (7 oct. 2026, 6 h 08, par Cowork), telle qu'au plan :** un homonyme **employé** n'est pas écrasé. Refus avec la phrase validée, même forme pour les trois éditeurs, compte réel par `decrirePorteurs…` :

> Une échelle porte déjà ce nom, et 12 évaluations et 2 productions l'emploient : l'écraser changerait leurs notes. Donne un autre nom à la nouvelle.

(« Une grille », « Une cartouche » ; « l'emploie » au singulier ; les nombres sont des exemples, accorde-les.) **Un homonyme que rien n'emploie s'écrase comme avant**, sans laisser de référence. Remplacer un modèle employé reste le rôle de « Supprimer » (#648).

1. **Mesure d'abord** : les chemins « Écraser » de `js/echelles.js` (~3543), `js/grilles.js` (~677), `js/cartouches.js` (~938 et ~1085) ; ce que chacun compte comme « employé » (évaluations, productions, pratiques, grilles, cartouches) ; s'il existe un `decrirePorteurs…` pour la grille et la cartouche (Cowork n'a trouvé que `decrirePorteursEchelle`, `echelles.js:3363`). S'il en manque, écris-le sur le même modèle : c'est ton lot.
2. **Le cas de la cartouche ouverte** (noté à la fiche) : si l'homonyme est la cartouche qu'on vient d'ouvrir pendant la question, rien ne doit disparaître sous les yeux.
3. **Stock** (« tarir n'est pas réparer ») : des références orphelines laissées par d'anciens « Écraser » peuvent exister chez les usagers. **Mesure-les sur le pack démo seulement** et dis dans ton rapport s'il en existe ; ne répare rien d'office (écrire dans les données de quelqu'un remonte à Grégoire).
4. **Aucune suppression irréversible** (limite de Grégoire, 20 sept.).
5. **Tests** : banc avec break-test pour chaque éditeur — homonyme employé : refus, rien n'est écrit, la phrase s'affiche avec les vrais nombres ; homonyme non employé : écrasé, aucune référence orpheline. Specs voisins, Vitest complet. Noms manifestement fictifs.
6. **Release** minor par `scripts/release.mjs` (le geste visible change), commits séparés, relais écrit. Ligne des Nouvelles proposée dans ton rapport, à part, non écrite. Puis arrête-toi : relecture de Cowork, verdict (Chrome et Safari fermés), push.

## Ton rapport à Grégoire

En gestes d'utilisateur, numéros entre parenthèses en fin de ligne. Un geste à l'écran **qui n'écrit rien dans ses vraies données** (en démo si nécessaire), ou dis pourquoi il n'y en a pas. Ce que tu as supposé, une ligne par supposition.

## Suite – relecture de 1.190.0 et mots de Grégoire (8 oct. 2026, 7 h 09, Toronto)

**Relecture faite, rien ne bloque.** Lus : `f785400b` (refus dans `verifierEtGererDoublon` par `options.porteursHomonymes` ; comptes `compterPorteursHomonymesEchelle`, `compterPorteursHomonymesGrille`, cartouches), `32d9156f` (release). Tests non relancés par Cowork. L'`alert` du refus est accepté pour ce lot (même forme que les autres refus de ces éditeurs) ; la grille ouverte pendant la question (motif faux) reste en commentaire, comme tu l'as classée.

**Trois décisions de Grégoire, à poser telles quelles :**

1. **Phrase de refus** : « leurs notes » devient « des notes », au singulier comme au pluriel. Exemple : « Une échelle porte déjà ce nom, et 1 évaluation l'emploie : l'écraser changerait des notes. Donne un autre nom à la nouvelle. » Mets à jour le plan (`PLAN-2026-10-07-chantier-enregistrement-suite.md`, lot 6) et les bancs qui lisent la phrase.
2. **Témoin de la cartouche ouverte** : la raison devient « tu as ouvert la cartouche qui porte déjà ce nom. » (le témoin affiche « Non enregistré : » devant).
3. **Nouvelles**, entrée 1.190, couleur bleu, avec le commentaire de provenance habituel :
   - Titre : Un modèle employé n'est plus remplacé
   - Conception : « Remplacer l'existante » refuse maintenant de remplacer une échelle, une grille ou une cartouche que des évaluations ou des productions emploient. La fenêtre dit combien, et rien n'est modifié ; donne un autre nom à la nouvelle.

Typographie du fichier : espaces insécables (`&nbsp;`) dans les guillemets et avant le deux-points.

Puis : commits (mots, changelog), Chrome et Safari fermés, verdict complet, push, vérification de la mise en ligne chez Netlify. Rapport en gestes d'utilisateur, avec le geste en démo de ton rapport (attendu : « … 23 évaluations l'emploient : l'écraser changerait des notes. … »).
