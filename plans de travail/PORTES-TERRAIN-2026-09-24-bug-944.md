# Portes terrain – #944 (1.159.3) : changer de cartouche sur une copie déjà évaluée

> Écrite le 24 septembre 2026 par Claude Code. **Artefact jumeau : à publier par Cowork** (bouton « Copier mes résultats »).
> ⚠ **Cette porte attend le push** : tant que `https://app.codexnumeris.org` n'affiche pas **1.159.3**, elle jugerait la version d'avant.
> Ce qui échoue devient une fiche au BACKLOG, pas une note mentale.

## §0 · Préalable

- [ ] Sur l'iPad, ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
      ⮕ Attendu : **1.159.3**. Sinon, s'arrêter là : le correctif n'est pas encore en ligne.
- [ ] Fais une sauvegarde Codex avant le §1 : la porte remplace les commentaires d'UNE copie réelle.

## §1 · ⚠⚠ Données — une seule copie, que tu veux de toute façon passer à la cartouche révisée

> **POURQUOI** — C'est ton rapport de 15 h 52 : sur une copie déjà évaluée, choisir « Carte mentale A26 (rev) » au menu ne changeait aucun commentaire. Les tests le prouvent sur une copie inventée ; seule une de tes copies dit que ça tient avec ta vraie grille et ta vraie cartouche.

- [ ] Sur l'iPad, ouvre UNE copie déjà évaluée avec l'ancienne cartouche de la carte mentale. Dans le menu « Cartouche de rétroaction », choisis **Carte mentale A26 (rev)** (le sélecteur de l'iPad, puis « OK »).
      ⮕ Attendu : une fenêtre **« Changer de cartouche »** s'ouvre et nomme « Carte mentale A26 (rev) ». Le menu affiche encore l'ancienne cartouche derrière elle. `iPad` `⚠⚠ Données`
- [ ] Touche **« Garder les commentaires actuels »**.
      ⮕ Attendu : la fenêtre se ferme, le menu montre l'ancienne cartouche, la rétroaction n'a pas bougé. `iPad`
- [ ] Refais le même choix, puis touche **« Remplacer »**.
      ⮕ Attendu : la rétroaction générale montre les commentaires de la cartouche révisée ; avant 1.159.3, elle gardait les anciens. `iPad` `⚠⚠ Données`
- [ ] Enregistre, puis ouvre le PDF de cette copie.
      ⮕ Attendu : le PDF montre les nouveaux commentaires. `iPad`

## §2 · Interface

Rien d'autre : l'ouverture d'une copie sans question, la taille des boutons au doigt (44 px) et les deux réponses sont tenues par la spec WebKit `cartouche-changee-copie-evaluee-944.spec.js`.

## §3 · Décisions

Aucune en attente. Le texte de la fenêtre est le tien ; le titre « Changer de cartouche » est validé par toi (24 sept.).

## §4 · Ce que je n'ai pas pu vérifier

- **Le sélecteur natif de l'iPad** : la spec change le menu par script ; sur l'iPad, le choix ne part qu'au « OK » du sélecteur. C'est la rangée 1 du §1.
- **Ta vraie copie** : je n'ai ni ton rapport (`BUG_grégoire_2026-09-24_15-52-33`, introuvable dans le dépôt) ni ta cartouche révisée ; la reproduction est faite sur une copie de banc.
- **Entrée confirme** dans cette fenêtre même si « Garder » a le focus (clavier du Mac) : inscrit en #945, non corrigé ici.
- **Une copie qui s'ouvrirait avec une autre cartouche que la sienne** : lu dans le code, non mesuré ; inscrit en #946.
