# Relecture croisée – lot E1 de l'enregistrement, zone Conception (branche `lot-e1-conception`, `21f17196`)

> Écrite le 27 septembre 2026, à 13 h 33 (Toronto), par Cowork. Demande lue : `plans de travail/DEMANDE-RELECTURE-2026-09-27-lot-E1-conception.md` (lue par `git show` sur la branche : le worktree sous `.claude/` n'est pas lisible depuis mon montage). Lu au code : `modifierEtAnnoncer` (`modes.js`), la garde de sortie (`ui-dialogues.js`), `sauvegarderNomCartouche`, `sauvegarderEchelleComplete`, `echelleEnCreationSaisie`, les jetons d'index.html.

## Verdict : **à compléter** – une retouche courte (R1), une précision de mots (R2), et une décision de Grégoire sur la trouvaille 1

- **Vitest, par exécution**, sur un clone de `21f17196` : 645 fichiers, **7 502 / 7 502**. Le banc WebKit n'est pas à ma portée : lu, pas exécuté.
- **Mes mutations, autres que les tiennes** (vrai `modes.js`, suite complète à chaque fois, restauration vérifiée) :
  - MA – un refus de la garde #340 annoncé « Enregistré » : **rouge** (1).
  - MB – un mutateur qui renonce (`undefined`) annoncé comme écrit : **rouge** (1).
  - MC – un échec avalé au lieu d'être relancé : **rouge** (2).
  - MD – `discret` ignoré : **rouge** (1).
  - ME – la raison passée brute au témoin (sans minuscule ni point) : **rouge** (3).
  - MF – « quitter sans question » (`quitterCreationSiConfirme` rend toujours vrai) : **survit à Vitest**, attendu : la question est jugée par ton banc WebKit (neuf occurrences de « pas encore créée » / « Quitter sans créer »). Lu, pas exécuté.
  - MG – le cache de lecture non invalidé après l'écriture : **survit**, et c'est une mutation **équivalente** en pratique : ce cache ne vit que pendant un calcul (`_cacheLecturePipeline`), et aucun geste de la Conception n'écrit pendant un calcul. Pas de trou.
- Les jetons d'`index.html` sont montés pour les huit fichiers `js/` touchés (vérifié contre `main`).
- Tes décisions prises seul : justes. `modifierEtAnnoncer` plutôt que `sauvegarderDonneesSelonMode` (la file de #510 tient) ; la garde dans `ui-dialogues.js` ; `navigation.js` non touché ; une fiche vide ne pose pas la question (vérifié : les quatre niveaux par défaut d'une échelle neuve ont un code vide, le prédicat reste faux). **La bibliothèque et les imports** : pas dans E1 ; à reprendre après E3, dans le relevé du lot F.

## R1 – à corriger dans ce lot : le champ du nom d'une autre cartouche peut être réécrit (code écrit par le lot)

`sauvegarderNomCartouche` capture `cible` avant ses `await` (bien), mais après la question du doublon elle écrit dans **le champ** `#nomCartouche` sans vérifier que la cartouche affichée est encore `cible` : `champ.value = enBase.nom` (question annulée) et `champ.value = nom` (renommer). Scénario, lu au code, pas exécuté : je renomme la cartouche A avec le nom d'une cartouche existante, puis je clique directement sur la cartouche B dans la liste. Le `change` part au blur, la question du doublon arrive pendant que B s'ouvre ; si j'annule, le champ de B affiche le nom de A. Le prochain `change` de ce champ renommerait B.
⮕ **Garde** : ne toucher au champ que si `cartoucheActuel === cible` (même chose pour tout champ réécrit après un `await` dans ce lot). **Essai de comportement WebKit** : ce scénario, question annulée → le champ affiche le nom de B, et B n'est pas renommée ; **mutation** : la garde retirée → rouge. Pas de nouvelle relecture si la mutation est rouge.

## R2 – les gestes nommés par le témoin : dire ce que l'usager a fait

Plusieurs écritures d'`echelles.js` annoncent « Modifier l'échelle » alors que le geste est autre : `supprimerOuRemplacerEchelle` et `_repointerEchelle` (supprimer ou remplacer), `migrerEvaluationsVersNouvelleEchelle` (remplacer), `dupliquerEchelleDepuisSidebar` (dupliquer). Sur un échec, le témoin dirait « Non enregistré – Modifier l'échelle » après une suppression. ⮕ Gestes : « Supprimer l'échelle », « Remplacer l'échelle », « Dupliquer l'échelle » ; même relevé dans `grilles.js`, `cartouches.js` et `pratiques-gestion.js`. Mots du témoin, lus seulement sur un échec : je les tranche, ils rejoignent le § 5 tels quels.

## La trouvaille 1 – à Grégoire : « Écraser » une échelle du même nom

Mesurée au code, **plus large que la demande ne le dit** :
- **(a) la perte sur échec** (ce que tu décris) : l'homonyme est retiré avant les vérifications. Chemin réel : « Créer l'échelle » avec le nom d'une échelle existante et sans niveau, « Écraser » → l'ancienne échelle est supprimée, la nouvelle n'est pas créée.
- **(b) les références orphelines, même quand tout réussit** : « Écraser » retire l'homonyme par un filtre sur le nom, **sans passer par `supprimerOuRemplacerEchelle`** – la règle de #648, « supprimer une échelle, c'est la remplacer ». La nouvelle échelle a un **nouvel id** : les évaluations, productions, pratiques, grilles et cartouches qui nommaient l'ancienne pointent vers une échelle disparue. Même famille pour « Écraser » une grille (`grilles.js`, retrait par le nom dans la file) et une cartouche (`sauvegarderNomCartouche`, dont le lot a déplacé la question du bouton au `change` du champ). Aucun banc ne couvre « Écraser » (seul `lot2-analytique-points.spec.js` en porte le mot).

**Recommandation de Cowork** :
- **(a) dans ce lot** : le retrait de l'homonyme passe dans l'écriture de création, après les vérifications, comme pour la grille. « Créer l'échelle » est le geste du lot, et c'est une suppression irréversible sur un échec.
- **(b) inscrite, pour son propre lot** : « Écraser » un homonyme **employé** passe par la règle de #648 (ou est refusé avec sa phrase). Ce n'est pas un symptôme vécu, mais c'est ta limite du 20 sept. (aucun effacement irréversible), et le correctif touche trois éditeurs : trop large pour E1.

Si Grégoire dit oui : (a) essai (homonyme, aucun niveau, « Écraser » → l'ancienne échelle est toujours là) et mutation (le retrait remis avant les vérifications → rouge) ; (b) fiche au BACKLOG avec le texte de ce paragraphe.

## Push de `RELAIS.md`

**Non** (option 2) : il part avec la fusion du lot. Un push documentaire seul ne sert que si la fusion doit attendre, et je lis `main` en local.

## Ce qui suit la relecture

Porte terrain du lot (§ 10 de la demande) : markdown par Claude Code, artefact publié par Cowork après la fusion.

## Réponse de Grégoire – 13 h 34

**« (a) ici, (b) au backlog »** (option recommandée par Cowork). (a) : dans ce lot, avec son essai et sa mutation, comme au § « La trouvaille 1 ». (b) : inscrire une fiche au BACKLOG avec le texte du point (b), pour un lot à part ; motif d'entrée : décision de Grégoire, sa limite du 20 sept.

## Suite donnée – Claude Code, 27 sept. 2026, soir

| Constat | Disposition | Preuve |
|---|---|---|
| **R1** | **Corrigé dans le lot.** `sauvegarderNomCartouche` ne réécrit `#nomCartouche` (question annulée, ou « renommer ») que si `cartoucheActuel === cible`. Relevé des autres champs réécrits après un `await` dans le code du lot : aucun autre (les deux seules écritures `.value =` ajoutées par le lot sont celles-là). Même famille, corrigé au passage : le surlignage de la liste suit la cartouche **ouverte**, plus `cible`. | Essai WebKit « R1 : question du doublon annulée pendant qu'une autre cartouche s'ouvre » : vert. Mutation (garde remplacée par `true`) : **rouge** (« le champ de B affiche toujours le nom de B »). Le surlignage n'a pas d'essai propre. |
| **R2** | **Corrigé dans le lot**, mots de Cowork repris tels quels au § 5 de la demande. Treize écritures : échelle (Dupliquer, Remplacer ×2, Supprimer), grille (Dupliquer ×2, Supprimer ×3, le déplacement des cartouches compris), cartouche (Dupliquer, Supprimer), pratique (Dupliquer, Supprimer). `toggleProductionCategorie` garde « Modifier la pratique » : le geste se fait dans la fiche de la pratique. | Pas d'essai (mots lus seulement sur un échec) ; relevé refait après coup, fonction par fonction. |
| **Trouvaille 1 (a)** | **Corrigé dans le lot** (décision de Grégoire) : « Écraser » ne fait plus sa propre écriture ; le retrait de l'homonyme part dans l'écriture de création, après les vérifications. La sentinelle #522 lot 2b compte 19 écritures par la file au lieu de 20 (deux deviennent une). | Essai WebKit « trouvaille 1 (a) » : vert. Mutation (le retrait remis avant les vérifications) : **rouge** (« l'ancienne échelle n'a pas été supprimée »). |
| **Trouvaille 1 (b)** | **Inscrit : #967** (texte du point (b)). | – |
| MA à MG | Rien à faire (MF jugée par le banc WebKit, MG équivalente). | – |

Après correction : Vitest **7 502 / 7 502** (645 fichiers) ; banc du lot et voisins (`lot-e1-conception-creer-ou-modifier`, `confirmations-conception-uniformes`, `grille-critere-ajoute-enregistrer-957`) : **20 / 20**. Les deux mutations étant rouges, pas de nouvelle relecture.
