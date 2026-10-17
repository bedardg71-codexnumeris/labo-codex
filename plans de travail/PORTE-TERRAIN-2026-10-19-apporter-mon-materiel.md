# Porte terrain – « Apporter mon matériel », version 1.203.0 (lundi 19 octobre 2026, avant 11 h)

> Écrite par Claude Code le samedi 17 octobre 2026 (étape 8 du plan, temps A), pour **lundi matin, avant la rencontre de 11 h**. Une seule porte : le parcours que la communauté fera, **sur tes vraies grilles**, sur le Mac (Safari) puis sur l'iPad. Seul ton matériel peut répondre : ce que Word et Pages mettent vraiment dans le presse-papiers, Safari, et l'iPad au doigt. Tout le reste (la lecture des douze formes de grilles, les règles, la création des trois objets, l'échappement des textes, les textes validés) est mesuré par les bancs.
> **« Créer ma grille » écrit dans ton trimestre en cours** : une grille, et selon le cas une échelle et une cartouche, toutes NEUVES. Rien d'existant n'est modifié, et chacune se supprime dans son outil. Ce n'est pas irréversible : aucune sauvegarde préalable n'est exigée.
> Ce qui échoue devient un item de backlog, avec le numéro de la rangée.
> **Relue par Cowork le 17 octobre à 17 h 48** : trois rangées retirées (règle 1, voir §4), renumérotées 2.1 à 2.7. L'artefact jumeau, aux mêmes neuf rangées : « Porte · Apporter mon matériel », https://claude.ai/artifact/C61zsybw5WJXYV1ivH262Y

## §0 · Préalable

⚠ **Cette porte attend le push.** La version 1.203.0 est commitée (`6cf60f70`), pas poussée : le verdict et le push se font au temps B, Cowork fermé. Tant qu'elle n'est pas en ligne, tu verrais 1.202.0, et la porte jugerait l'ancienne version.

| N° | Geste | Attendu |
|---|---|---|
| 0.1 | Ouvre `https://app.codexnumeris.org` dans Safari, recharge en vidant le cache (⌘ ⇧ R). | La page se recharge. |
| 0.2 | Lis le numéro de version en bas de page. | **1.203.0**. Sinon, arrête-toi ici : la version n'est pas encore en ligne. |

## §2 · Interface – le parcours de lundi

**Pourquoi.** Lundi, les membres de la communauté colleront leurs propres grilles, la plupart depuis Word, certains depuis Pages ou un iPad. Les bancs collent un HTML de Word reconstitué ; seul ton matériel dit ce qui arrive vraiment.

Prends **deux** grilles réelles de formes différentes : une à niveaux (critères en lignes, niveaux en colonnes) et, si tu en as une, une en points ou avec des parties. Sélectionne **le tableau en entier**, puis copie.

| N° | Où | Geste | Attendu | À noter (champ) |
|---|---|---|---|---|
| 2.1 | Mac, Word | Conception → « Apporter mon matériel » ; clique dans la zone, colle (⌘ V). | L'assistant s'ouvre : « Étape 1 sur … », une question, et l'aperçu de ta grille dessous. | Ce qui manque ou est de trop dans l'aperçu, par rapport à ton document |
| 2.2 | Mac | Va à l'étape « Ce que contient ton tableau ». | Le titre dit « Vérifie ce que l’application a lu dans ton tableau » ; un menu au début de chaque rangée, un en tête de chaque colonne. | Le nombre de menus que tu as dû changer pour que la lecture soit juste (mesure, aucun nombre n'est un échec) |
| 2.3 | Mac | Réponds aux étapes jusqu'à « Vérifie ta grille, puis crée-la », puis « Créer ma grille ». | « Ta grille « … » est créée », ses cartes, puis l'encadré « Aller plus loin avec ta grille ». | Le nom de la grille créée |
| 2.4 | Mac | « La voir dans Grilles de critères ». | Ta grille est ouverte et sélectionnée ; sous un critère qui a des descripteurs, le bloc « Ce qui est attendu à chaque niveau » ; le champ du texte du critère s'appelle « Description ». | Ce qui ne correspond pas à ton document |
| 2.5 | Mac, Pages | Ta seconde grille (Pages, ou en points / avec parties) : gestes 2.1 à 2.3. | Comme en 2.1 à 2.3. Une partie écrite en capitales (« INTRODUCTION ») devient « Introduction – ‹critère› ». | Le nombre de menus changés (mesure) |
| 2.6 | iPad | Une grille réelle, au doigt : coller (toucher la zone, puis « Coller »), changer un menu, « Créer ma grille », « La voir dans Grilles de critères ». | Comme sur le Mac. Le tableau défile de côté dans son cadre, la page non ; chaque menu et chaque bouton se touche sans viser. | Un geste difficile au doigt, s'il y en a |
| 2.7 | iPad | En tête de l'onglet, regarde le bandeau. | « 🚧 Cet outil est en développement : … », sur une ligne propre, l'emoji avant le texte. | — |

Si un collage affiche « L’application n’a pas trouvé de tableau dans ce que tu as collé », note-le dans le champ de la rangée, avec l'application et l'appareil : c'est l'information la plus utile de toute la porte.

## §3 · Décisions

Aucune à cette porte.

## §4 · Ce que je n'ai pas pu vérifier

- **Le verdict Playwright complet** n'est pas pris au moment d'écrire cette porte : c'est le temps B, sur le dernier commit au moment du push, qui contient la release `6cf60f70`. Les specs du matériel ont tourné seules dans WebKit à l'étape 7 (21/21, sur `af1fbe99`), pas sur le commit de release.
- **Un vrai presse-papiers de Word ou de Pages, Safari, l'iPad** : rien de cela n'existe dans les bancs.
- **Le bandeau avec son emoji sur l'iPad** (rangée 2.7) : jamais vu sur l'appareil.
- **Trois rangées retirées par Cowork à la relecture** (règle 1 du skill : une machine répond) : l'aperçu qui suit un menu changé (banc `materiel-lot3a-roles`), l'icône « i » du type de critère (banc `icones-i-catalogue-c3`, dans WebKit), et les Nouvelles 1.203 (relues mot pour mot à l'étape 7 ; elles s'affichent d'elles-mêmes au premier chargement de la version). L'artefact et ce markdown portent les mêmes neuf rangées.
