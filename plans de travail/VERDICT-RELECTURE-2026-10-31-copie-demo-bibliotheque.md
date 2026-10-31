# Verdict de relecture – Une copie faite pendant la démo rejoint ta bibliothèque (6193601f)

> Cowork, samedi 31 octobre 2026, 14 h (Toronto), sur `main` = `6193601f`. Relecture ciblée du diff (`js/bibliotheque-ui.js`, `js/grilles.js`, `js/demo-activation.js`) et du rapport. Rien exécuté.

## Verdict

**Accepté, pour la grille.**

- `proposerGarderCopieDemo` n'écrit rien : le bouton porte l'action de la rangée de la fenêtre (`garderGrilleDansBibliotheque`), un seul chemin d'écriture. Hors démo, la ligne ne paraît pas ; `desactiverModeDemo` la retire. `innerHTML` : texte du code, `actionGarder` et `copie.id` échappés.
- `garderGrilleDansBibliotheque`, fonction partagée avec la fenêtre : elle enregistre d'abord le formulaire ouvert s'il diffère (nom, description) et ne rouvre plus la fenêtre par-dessus l'édition. Hors démo, l'enregistrement au `change` le faisait déjà ; l'effet nouveau se limite au cas du nom tapé puis bouton touché sans quitter le champ (iPad). Accepté.
- Le § 0.3 lu de façon stricte (arrêter l'échelle et la production, qui ne cassent aucun écran) : accepté. Le bouton aurait écrit leurs défauts dans les vraies données, et « Inspiré de » ne s'efface pas.
- Limite connue et assumée : le clic à la souris sur un nom en doublon, 5 fois sur 10, peut laisser le bouton en place sans rien garder ; aucune donnée perdue.

## À Grégoire

- Les quatre familles arrêtées : **A, décidé par Grégoire le 31 oct. à 13 h 58** (« oui », sur la recommandation de Cowork) : on en reste à la grille, le lot part avec la 1.229. Les défauts de l'échelle et de la production s'inscrivent au BACKLOG (ils existent déjà par la fenêtre de bibliothèque, sans le bouton neuf) ; C écarté, aucun besoin vécu.
- Les mots (la ligne, le guidage réécrit par Claude Code) : à valider avant la release.
- Les cinq trouvailles hors lot du rapport : à lui soumettre après la décision.

## Pour Claude Code

1. **Inscrire au BACKLOG, une fiche, sans rien coder** (décision de Grégoire, 13 h 58) : « Une échelle ou une production copiée depuis la démo, puis gardée dans la bibliothèque, garde ses défauts dans les vraies données » : l'échelle garde `estDemo` (exclue des exports, `js/echelles.js:739`, `js/import-export.js:3959`) ; la production garde le `grilleId` d'une grille du pack, affichée « introuvable » ; « Inspiré de … par Inconnu » (`forgerInspireDe` lit `nom`, une production se nomme par `titre` ; échelles et cartouches du pack sans auteur). Chemin existant : la fenêtre de bibliothèque. Question ouverte, à Grégoire : ce que devient la grille d'une production copiée depuis la démo. Le stock déjà gardé : à mesurer au moment du lot.
2. Les mots et les trouvailles hors lot suivent ci-dessous, à mesure que Grégoire les tranche.


## Les mots (validés par Grégoire)

| # | Où | Texte retenu | Décision |
|---|---|---|---|
| 1 | La ligne au-dessus d'une copie de grille, en démo | « Cette copie reste dans la démo. Quand elle est prête, garde-la dans ta bibliothèque pour la retrouver dans tes vrais trimestres. » | Retouchée par Cowork (« Quand elle est prête, » : l'exemplaire gardé est un instantané), acceptée (13 h 59) |
| 2 | Guidage de la démo, « Autonomie » (`js/accompagnement-contenu-popup.js`) | « Clique sur « Dupliquer pour créer ma grille » (ou mon échelle, ma production, ma pratique) et renomme la copie. Elle reste dans la démo : une nouvelle version du pack l'efface. Une copie de grille peut te suivre : quand elle est prête, garde-la dans ta bibliothèque, et tu la retrouves dans tes vrais trimestres. » | Retouchée par Cowork, acceptée (13 h 59) : « ma cartouche » sort de la liste (aucune cartouche du pack n'offre « Dupliquer » en démo, trouvaille 1 du rapport) ; la fin reprend la ligne n° 1 |

## Les cinq trouvailles hors lot : dispositions de Cowork

Aucune n'est vécue par Grégoire : elles restent au rapport, pas au BACKLOG (règle du 24 août).
- 1 (cartouches du pack jamais en lecture seule en démo) : le guidage ne promet plus de les dupliquer ; rien d'autre.
- 2 (une copie de cartouche survit à une nouvelle version du pack) : sans conséquence observable, la phrase du guidage ne la vise plus.
- 3 (« Inspiré de … par Inconnu ») : entre dans la fiche inscrite ci-dessus.
- 4 (la date d'« Inspiré de » affichée la veille) et 5 (« Dupliquer pour créer ma … » à 37 px) : au rapport ; ils entreront sur un symptôme vécu.

## Pour Claude Code, suite

3. Appliquer les deux textes ci-dessus au caractère près ; la garde du guidage suit.
4. Commit avec ce verdict (et la fiche du point 1). Sans release ni push : le lot part avec la 1.229.

