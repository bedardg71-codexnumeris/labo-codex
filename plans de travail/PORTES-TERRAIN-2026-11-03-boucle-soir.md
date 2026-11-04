# Portes terrain – la 1.232.0, boucle sans relais, passage du soir (3 novembre 2026)

> **La trace.** L'opération est l'artefact « Portes terrain 1.232.0 ». Cowork le publie à partir de ce fichier, avec le bouton « Copier mes résultats ». Les deux rangées du §3 portent un champ de saisie, pas une case.
> **Contexte.** Second passage de la boucle sans relais, le 3 nov. au soir. Il a donné deux versions, poussées ensemble sur `origin/main` le 3 nov. à 19 h 50 :
> - la 1.231.2, qui contient l'entrée 6 bis et les entrées 7 à 10 ;
> - la 1.232.0, qui contient la case « Sans jetons » (10 quater) ; build 1103-1758, commit `fee50d2d`.
>
> Le verdict du Mac est vert sur `c9612655`.
> **Le contenu.** Deux gestes et deux décisions. Le premier geste, sur tes données, n'aura lieu qu'à ton prochain import de copies du groupe concerné. Le second est la première vue de « Sans jetons ». Tout le reste est mesuré par les essais, ou relève de l'usage normal (§4).
> **Elle ne vaut qu'une fois la version en ligne** : tant que le bas de page n'affiche pas 1.232.0, elle juge la version d'avant.
> Un échec devient un item de `Retours des testeurs/SUIVI-BUGS.md`, pas une note mentale.

## §0 · Préalable
- [ ] 0.1 · Mac · Ouvre app.codexnumeris.org, recharge en vidant le cache (Cmd+Maj+R), puis lis le numéro en bas de page. ⮕ 1.232.0.

## §1 · ⚠⚠ Données · La reprise d'une élève qui n'avait pas d'original (à ton prochain import)
Pourquoi : le 3 nov., une élève a remis une reprise pour une production qu'elle n'avait jamais remise. Tu as vu un message rouge, « Jetons non appliqués … le jeton doit être appliqué manuellement ». Ta décision, à 16 h 35 : sa copie devient son original, sans consommer de jeton. Sa copie déjà importée bascule d'elle-même au prochain import du groupe, qu'elle soit évaluée ou non.
- [ ] 1.1 · Mac · ⚠⚠ Données · Enregistre ton codex, puis fais ton prochain import de copies dans ce groupe, comme d'habitude. ⮕ Aucun message rouge « Jetons non appliqués » pour cette élève.
- [ ] 1.2 · Mac · Ouvre la copie de cette élève pour cette production. ⮕ Elle est une copie ordinaire, pas une reprise.
- [ ] 1.3 · Mac · Regarde son compteur de jetons. ⮕ Il n'a pas baissé.

## §2 · Interface · « Sans jetons », la première vue
Pourquoi : c'est ta demande du soir, livrée le soir même. Dans Suivi du groupe, la carte « Trajectoires par production » a une case « Sans jetons », à côté de « Médiane du groupe ». Cochée, elle montre le groupe comme si personne n'avait repris : la note de la copie d'origine remplace celle de la reprise, et la médiane suit.
- [ ] 2.1 · iPad · Dans Suivi du groupe › « Trajectoires par production », sur une production où des élèves ont repris, touche « Sans jetons ». ⮕ Les points de ces élèves descendent (ou restent en place) à cette production, et la médiane bouge avec eux.
- [ ] 2.2 · iPad · Touche-la de nouveau. ⮕ Les courbes reviennent comme avant.
- [ ] 2.3 · iPad · Quitte la carte, puis rouvre-la. ⮕ La case est décochée.

## §3 · Décisions
Ce ne sont pas des vérifications : ce sont deux suppositions posées sur l'entrée 6 bis, faute de pouvoir les trancher à ta place. Cowork ne les a pas commentées. Réponds dans le champ.
- 3.1 · Une élève a une copie ordinaire, pas encore évaluée, pour une production. Elle remet ensuite une reprise de cette même production. Aujourd'hui, la reprise devient un second original : l'élève a alors deux copies ordinaires. Est-ce ce que tu veux, ou la reprise doit-elle se rattacher à la première copie ? Champ : ______
- 3.2 · Tu as marqué une copie « reprise » à la main, sans évaluation de l'original. Aujourd'hui, au prochain import du groupe, elle redevient une copie ordinaire. Est-ce ce que tu veux ? Champ : ______

## §4 · Ce que je n'ai pas pu vérifier
- **La version en ligne.** Je n'ai pas pu la lire depuis la session, parce que l'adresse demande l'identification Cloudflare. C'est pour cela que la rangée 0.1 existe.
- **« Sans jetons » au doigt (§2).** Le câblage de la case et les nombres sont mesurés par Vitest (7 essais, avec break-tests). Les specs Playwright du Suivi passent, dans Chromium et dans WebKit sur le Mac. Le vrai Safari de l'iPad n'y est pas.
- **« Sans jetons » ne voit pas encore les copies non recevables (#1226).** Une copie d'origine non recevable ressort à sa note brute. Tu as tranché « à 0, comme la note du cours » : c'est l'entrée 10 quinquies, au prochain passage.
- **L'import en mode anonymisation (6 bis).** Le message vert et la mention des rattachements disent « Élève N ». C'est mesuré par Vitest (deux essais, break-test fait), sans porte : rien ne s'y écrit.
- **Le PDF de la grille (7).** Le nom du critère est en gras et les éléments en maigre. Le rendu a été comparé avant et après, en Chromium ; je n'ai pas fait d'impression réelle. Il n'y a pas de porte, d'après la règle 2, car c'est de l'apparence.
- **« Apporter mon matériel » (8, 9, 10).** Le faux écart des deux sous-totaux, la plage de 0 à 100 et les raisons qui nomment le critère sont mesurés par Vitest et Playwright. Pas de porte.
- **Le stock (§1).** La copie du 3 nov. reste écrite comme reprise jusqu'à ton prochain import. Rien n'est réécrit d'office chez toi.
- **Le verdict du Mac.** Sur 1 358 essais : 1 353 verts, 1 vert au second essai (`bibliotheque-liste-1159`), 4 rouges connus, 23 sautés.
