# Portes terrain – lot E1 (1.164.0) : dans la Conception, ce qui existe s'enregistre tout seul

> Écrite le 28 septembre 2026 par Claude Code. **Artefact jumeau : à publier par Cowork** (bouton « Copier mes résultats » ; la rangée du §3 prend un champ de saisie, pas une case).
> ⚠ **Cette porte attend le push** : le 27 sept. au soir, `main` n'était pas encore poussé (verdict Playwright interrompu par manque de mémoire). Tant que `https://app.codexnumeris.org` n'affiche pas **1.164.0**, elle jugerait la version d'avant.
> Ce qui échoue devient une fiche au BACKLOG, pas une note mentale.

## §0 · Préalable

- [ ] Sur l'iPad, ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
      ⮕ Attendu : **1.164.0**. Sinon, s'arrêter là : le lot n'est pas encore en ligne. `iPad`
- [ ] Fais une sauvegarde Codex avant le §1 : la porte renomme une de tes vraies cartouches, puis lui rend son nom.

## §1 · ⚠⚠ Données — le nom d'une cartouche, au doigt

> **POURQUOI** — Avant 1.164.0, le nom d'une cartouche ne s'enregistrait qu'au bouton « Enregistrer ». Maintenant, il s'enregistre tout seul **quand tu quittes le champ**. Sur le Mac, cliquer ailleurs quitte le champ, et les tests le prouvent. Sur l'iPad, toucher directement une autre cartouche dans la liste ne quitte pas toujours le champ : si c'est le cas ici, le nom tapé serait perdu sans rien dire, alors que l'écran promet qu'il est enregistré. Seul ton iPad peut le trancher.

- [ ] Dans Conception › Rétroactions, ouvre une de tes cartouches. Touche la fin de son nom et ajoute « (essai) ».
      ⮕ Attendu : le nom se termine par « (essai) ». Rien d'autre ne se passe encore. `iPad` `⚠⚠ Données`
- [ ] Sans toucher ailleurs, touche **directement une autre cartouche** dans la liste.
      ⮕ Attendu : l'autre cartouche s'ouvre, avec son propre nom (pas celui que tu viens de taper). `iPad`
- [ ] Touche à nouveau la première cartouche dans la liste.
      ⮕ Attendu : son nom se termine toujours par « (essai) ». Avant 1.164.0, il serait revenu à l'ancien. `iPad` `⚠⚠ Données`
- [ ] Retire « (essai) », puis touche une autre cartouche dans la liste, puis reviens sur la première.
      ⮕ Attendu : la cartouche a retrouvé son nom d'origine. C'est le ménage de la porte. `iPad` `⚠⚠ Données`

## §2 · Interface

Rien. Ces gestes sont tenus par le banc WebKit `lot-e1-conception-creer-ou-modifier.spec.js` (11 essais, sur le pack démo) :
- le nom et le contexte d'une cartouche, les jetons d'une pratique, s'écrivent sans bouton ;
- une grille, une échelle, une cartouche neuves n'existent pas avant « Créer la … » ;
- « Fermer » pose la question, « Rester » ne perd rien, « Quitter sans créer » n'écrit rien ;
- l'assistant abandonné n'écrit aucune grille ; en modification, il dit « Appliquer à la pratique » ;
- un échec d'écriture est dit par le témoin ;
- « Fermer » et « Créer la … » restent dans l'écran à 360, 768, 1024 et 1180 px ;
- la question du doublon annulée pendant qu'une autre cartouche s'ouvre ne renomme rien (R1) ;
- « Écraser » une échelle du même nom ne supprime rien si la création échoue ;
- recharger la page avec une grille neuve saisie retient la page (vide ou déjà créée : non).

## §3 · Décisions

> Ce ne sont pas des vérifications : un choix que j'ai posé seul, faute de pouvoir le trancher à ta place.

- **Le titre de l'entrée des Nouvelles 1.164.** Tu as accepté la phrase ; le titre n'était pas dans les mots du § 5. J'ai mis **« Créer ou modifier »**, le nom de ta décision D3. Écris « garder » ou le titre que tu veux : ________

## §4 · Ce que je n'ai pas pu vérifier

- **L'avertissement au rechargement sur l'iPad.** Le banc prouve que l'application retient la page quand une création est en cours. Mais Safari sur iPad ignore souvent cette demande : recharger ou fermer l'onglet peut perdre une grille neuve sans question. La phrase des Nouvelles (« l'application te prévient si tu fermes la fiche ou recharges la page avant ») vaut au Mac ; sur l'iPad, seul « Fermer » est sûr de poser la question. Pas de porte : ce qui se perd n'est qu'une saisie jamais créée. Si tu le vis, c'est une fiche.
- **Changer de section ne pose pas la question** (navigation, zone protégée) : dit dans la demande de relecture, inchangé.
- **Les jetons d'une pratique, au doigt** : même mécanisme que le nom de la cartouche (le champ s'enregistre quand on le quitte), éprouvé au banc sur le Mac seulement. Si le §1 échoue, les jetons sont à regarder aussi.
- **Le surlignage de la liste des cartouches** après un renommage : corrigé avec R1, sans essai propre.
- **Les références d'une échelle, d'une grille ou d'une cartouche « écrasée »** par un homonyme : non corrigé, inscrit en #967.
- **Erreurs de la session** : deux passes de mutation n'ont rien prouvé avant d'être refaites. La première ne s'était pas posée (motif introuvable), et le test a tourné sur le code intact. La seconde était équivalente : retirer une seule des deux lignes qui retiennent la page ne change rien. Refaite en retirant les deux : rouge. Et le relevé des bancs voisins du lot avait oublié `texte-troue-reperes-enonces.spec.js`, rattrapé par le verdict Playwright du 27 sept. au soir.
