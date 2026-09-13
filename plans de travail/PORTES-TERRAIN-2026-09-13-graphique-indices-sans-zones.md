# Portes terrain — le graphique des indices sans zones de niveaux (#575, septième site)

> Écrit le 13 septembre 2026, soir, par Claude Code, sur `4237e79c` (commité, **non poussé**, pas de release).
> Pendant markdown de l'artefact que **Cowork publie** (bouton « Copier mes résultats »).
> **Ce qui échoue devient une fiche au BACKLOG**, pas une note mentale.
> ⚠ **Cette porte ne se fait PAS sur `app.codexnumeris.org`** : le changement n'y est pas, et c'est voulu — il n'ira en ligne qu'après ton verdict. Elle se fait sur une **copie locale**, dans Chrome, avec les données de démonstration. **Tes vraies données ne sont pas là, et rien n'y est écrit.**

## §0 · Préalable

**0.1** — Ouvre Chrome à l'adresse **`http://localhost:8765`**.
⮕ Attendu : la page d'accueil de Labo Codex. Si la page ne s'ouvre pas, dis-le à Claude Code : c'est lui qui fait tourner cette adresse.

**0.2** — Sur la page d'accueil, clique sur la carte **« Explorer la démo »**.
⮕ Attendu : un bandeau vert **« Mode démonstration »** en bas de l'écran.

**0.3** — Va dans **Labo › Outils d'observation**, carte **« Micro-données ACP »**, et lis la petite phrase sous la case **« Indicateurs visuels des seuils »**.
⮕ Attendu : « … sur le graphique par critère du profil individuel et sur les graphiques du Suivi du groupe. »
⚠ Si elle dit encore « … sur les graphiques de progression du profil individuel », c'est l'ancienne version qui s'affiche : recharge avec vidage de cache (Cmd+Maj+R). *Le numéro en bas de page ne t'aidera pas ici : il reste 1.140.6, puisqu'il n'y a pas de release avant ton verdict.*

**0.4** — Vérifie que cette même case est **cochée**.
⮕ Attendu : cochée. C'est elle qui, avant, allumait les zones sur le graphique des indices.

## §2 · Interface

### 2.1 · Le graphique des indices A-C-P ne porte plus de niveaux

**Pourquoi.** Le graphique qui montre l'assiduité, la complétion et la performance d'un élève semaine après semaine affichait en fond les niveaux d'une échelle de notation (des lignes pointillées colorées, et des lettres dans la marge de droite). Or ces courbes sont des pourcentages cumulés sur tout le trimestre, pas la note d'une production : les situer dans une échelle faite pour juger un travail donnait un repère qui avait l'air de dire quelque chose et ne disait rien. Ta décision du 13 septembre : on les retire, sur ce graphique seulement.

**2.1.1** — Va dans **Suivi › Liste**, ouvre le profil d'un élève de la démo, puis la section **« Progression temporelle ACP »**. Regarde le graphique des trois courbes A, C, P.
⮕ Attendu : **aucune ligne pointillée horizontale**, et **aucune lettre ni aucun nom de niveau dans la marge de droite**. *Avant : des lignes pointillées de couleur et des lettres (par exemple I, D, M, E) à droite.*

**2.1.2** — Sur ce même graphique, regarde les courbes.
⮕ Attendu : les trois courbes A, C et P sont là, avec leurs points. Si l'élève a eu une intervention RàI, son petit triangle est toujours au-dessus des points.

### 2.2 · Le graphique par critère garde ses niveaux

**Pourquoi.** Ta décision ne s'étend pas à ce graphique-là : ses points sont les niveaux des évaluations elles-mêmes, ses zones ont donc un sens. Il ne devait pas changer.

**2.2.1** — Dans le même profil, descends jusqu'au **graphique par critère** (une courbe par critère de la grille).
⮕ Attendu : les **lignes pointillées et les noms de niveaux à droite sont toujours là**, comme avant.

## §3 · Décisions

**Aucune.** La seule question de ce lot (ce canvas seulement, ou aussi les deux graphiques de groupe) est tranchée : ce canvas seulement. Les deux autres sont inscrits sous **#860** et attendent ta décision à part, hors de cette porte.

## §4 · Ce que je n'ai pas pu vérifier

- **Safari et l'iPad** : non vérifiés. Ce lot ne touche aucun CSS ; il retire un dessin sur un graphique. La copie locale n'est pas joignable depuis l'iPad.
- **Le rendu Chart.js réel** n'a pas été regardé par la session : la sentinelle rend le graphique avec un Chart simulé, puis REJOUE le dessin de chaque plugin sur un contexte qui enregistre ses appels (rien n'est dessiné ; et un témoin montre que ce même enregistreur voit les niveaux quand on remet le plugin). C'est ce que le §2.1 tranche à l'écran.
- **Tes vraies données** : non touchées, et non concernées — le lot ne lit ni n'écrit rien de nouveau.
- **Les deux graphiques de groupe** (spaghetti de l'indice P, trajectoires en mode « note finale ») gardent leurs zones : c'est attendu, voir #860. S'ils te paraissent pareils qu'avant, c'est normal.
- **Erreur de la session, rattrapée** : au push de `8acf6a42`, j'avais annoncé que le verdict Playwright ne se lancerait pas ; il s'est lancé, Cowork ouvert, pendant une dizaine de minutes (ma mesure avait été faite dans le mauvais shell). Aucun effet mesuré (61 % de mémoire libre, verdict vert), mais la règle 8 n'a pas été respectée.

## État

| Porte | Verdict |
|---|---|
| §0 (4 rangées) | à faire |
| 2.1.1 · 2.1.2 · 2.2.1 | à faire |

⮕ Après ton verdict : release (patch), push par `scripts/pousser.sh` (Cowork fermé : le verdict Playwright se lancera), puis coup d'œil sur `app.codexnumeris.org`.
