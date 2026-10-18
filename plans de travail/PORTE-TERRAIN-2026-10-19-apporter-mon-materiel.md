> **PÉRIMÉE, remplacée par `PORTE-TERRAIN-2026-10-18-la-dissection.md`** (18 oct. 2026) : elle visait l'assistant en sept étapes, débranché au lot 1 de la dissection. Gardée pour son relevé de 5 h 10.

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

---

## Relevé de Grégoire – dimanche 18 octobre, de 5 h 10 à 5 h 36 (Mac, Chrome ; grille « 101-04-Grille Cornell 1 (103) A2023 », Pages)

> Versé par Cowork à 5 h 44. Captures : dossier `~/Desktop/captures test 1 18 oct` (14 images, 5 h 10 à 5 h 36). Rangées 2.5 à 2.7 non faites.

```
4 passées / 0 échec / 5 non traitées
[v] 0.1 · [ ] 0.2 Version affichée : Bêta publique 1.203.0 (Build 1017-1629)
[v] 2.1 Ce qui manque ou est de trop dans l'aperçu : voir capture
[v] 2.2 Nombre de menus changés : Je ne vois pas de «Menu» (défilant?) Voir capture. Je ne sais pas quoi lire où. Je ne comprends pas ce qu'on me demande. Ok, j'ai cliqué sur «Suivant» et maintenant je vois la page et les «Menus». Voir capture.
[ ] 2.3 Nom de la grille créée : Est-ce que c'est normal que l'étape précédente s'affiche sous l'étape actuelle (en dessous du bouton «Suivant»)? Voir capture. Je ne peux pas mettre de «note retenue» puisque je ne suis pas en train d'évaluer. Voir capture.
[v] 2.4 Ce qui ne correspond pas : J'ai du mal à comprendre ce qui se passe à chaque étape. Je ne sais pas où regarder, quoi lire et ce qui est attendu de moi. Est-ce que je dois reproduire ma grille telle que je l'ai dans ma tête ou sur ma feuille de papier (traitement de texte) où je dois l'expliquer à l'application ? Je ne connais pas ce vocabulaire. Je suis confus. Si toute l'application me met dans cet étape, je ne suis pas intéressé.
[ ] 2.5 Comment faire pour en créer une nouvelle ? Voir capture.
```

### Ce que les captures montrent (lu par Cowork, faits)

- **La grille** : six critères en trois sections (droite, gauche, bas) ; chaque ligne de section porte les noms des quatre niveaux (« En voie d'acquisition », « Sommaire », « Organisé », « Efficace ») ; des points par niveau et par critère (3 / 4 / 5, 6-7 / 8-9 / 10…) ; une ligne « TOTAL : / 50 ».
- **La lecture** : les noms de niveaux des lignes de section ne sont pas reconnus (« Niveau sans nom », codes N à N4) ; la ligne de titre et la section de droite deviennent un critère, les sections de gauche et du bas aussi : **9 critères au lieu de 6**, et les noms de niveaux deviennent les descripteurs de ces faux critères. Les points des niveaux restent dans le texte des cases. Pondérations lues 5, 10, 5, 5, 10, 15 (= 50), ramenées à 100 %.
- **Aucun menu changé** : à l'étape 2, rien ne dit que les lignes de section portent les noms des niveaux, ni comment le dire.
- **Étape « Plages de notes »** : il a inventé des noms de niveaux qui ne sont pas les siens (insuffisant, passable, moyen, bon ; 0-60, 60-70, 70-80, 80-100) ; chevauchement 60/60 signalé. « Note retenue » incompris.
- **L'échelle créée** porte une valeur ponctuelle **0** aux quatre niveaux (capture 5 h 33 m 46). À vérifier : saisie par lui pour franchir le blocage, ou écrite par l'application.
- **« Ce que tu as pris pour l'étape précédente »** sous « Suivant » : c'est l'aperçu de la grille (capture 5 h 21 m 58).
- **Créer une autre grille** : le lien « Apporter autre chose », petit, au bas de la confirmation (capture 5 h 36 m 10), n'a pas été vu.
