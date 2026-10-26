# Consigne – La mise en ligne du soir : la fusion des bibliothèques, la vérification complète, deux versions (25 octobre 2026)

> Écrite par Cowork le dimanche 25 octobre 2026 à 20 h 05 (Toronto). Plan : `PLAN-2026-10-24-bibliotheques-deux-colonnes.md`, « Les étapes de la mise en ligne groupée » (étapes 3 à 5). Décision de Grégoire (25 oct., 17 h 10) : la vérification complète passe ce soir, et la table de cas commence le 26 sur une version propre.

## 0. Avant tout

- **Ne commence que si** la retouche du lot 6 est commitée sur `bibliotheques-deux-colonnes` **et acceptée par Cowork** (Grégoire te le dit en te donnant cette consigne). **Fait** : la retouche est `50ecd37f`, acceptée par Cowork le 25 oct. à 20 h 15 (les quatre notifications mot pour mot ; « Aucun cours à exporter. » accepté ; les cinq retraits de code mort, aucun appel restant hors commentaires, mesuré par `grep`). Aucune autre session ne tourne. Pas de `git stash`.
- Rituel de début de session. Ce fichier part dans le commit de fusion.

## 1. La fusion (étape 3)

- Fusionne `bibliotheques-deux-colonnes` dans `main` (un commit de fusion, pas de rebase). Les conflits attendus : les jetons `?v=` d'`index.html`, `styles.css`, `RELAIS.md`, `BACKLOG.md`. Garde les deux côtés ; les jetons seront reposés par la release.
- **BACKLOG** : « Dernier ID utilisé » prend le plus grand des deux compteurs ; les fiches des deux côtés restent ; aucun numéro ne resert ; un numéro pris des deux côtés se renumérote du côté de la branche, et se dit.
- Vitest complet sur `main` fusionné. Le seul rouge admis est la sentinelle anti-cache ; la release le résout.

## 2. Deux versions, une seule vérification (étape 5, préparée avant l'étape 4)

Une entrée des Nouvelles compte huit points au plus (skill `release-et-changelog`, § 5) : ce soir en demande deux. **Deux versions mineures posées l'une après l'autre par `scripts/release.mjs`**, sans push entre elles : **1.218** (les lots de la journée qui attendaient sur `main`), puis **1.219** (les bibliothèques). Décision de Cowork : la règle 7 (une seule vérification complète, prise sur le commit de release) tient, puisque la vérification se prend sur le commit de 1.219 et que les deux partent dans le même push.

Les textes sont **validés par Grégoire, mot pour mot** (insécables en `&nbsp;`, apostrophes typographiques, comme les entrées voisines ; note la validation dans le commentaire de chaque entrée).

**1.218**, `vert`, validé le 25 oct. à 20 h :
- Titre : « Des étapes à suivre, et des écrans plus larges »
1. « Cadre : les six parties de la page Trimestre s'ouvrent par la même bande que les bibliothèques. La colonne de gauche est partie et la page prend toute la largeur. La Carte d'alignement prend la même apparence. »
2. « Suivi : dans le profil d'un élève, une bande remplace la barre latérale, avec l'élève en haut et ses sections en boutons dessous. »
3. « Conception : en tête d'une grille, d'une échelle, d'une cartouche, d'une production ou d'une pratique, tu vois les étapes qui la rendent prête à servir. Touche une étape pour aller là où elle se règle. Une case de Préférences › Expérience visuelle les masque. »
4. « Le total des pondérations d'une grille dit la même chose partout : orange sous 100 %, rouge au-dessus. »
5. « Critère algorithmique : ses réglages se suivent en cinq étapes, une seule ouverte à la fois. « Ce que l'élève lira » s'affiche à droite, sur une copie fictive que tu règles. »
6. « Évaluer : une case « Incomplet ; travail en cours » apparaît dans la palette Paramètres. Cochée, la production ne compte pas dans la note de l'élève, mais elle compte comme remise. Quand le travail est terminé, tu remplaces la copie, puis tu décoches. »
7. « Corrigé : « + Nouvelle cartouche » ouvre maintenant une cartouche vide ; avant, elle renommait parfois la cartouche ouverte. Changer la grille d'une cartouche déjà enregistrée en fait une copie, et l'originale reste intacte. »
8. « Aide : elle est rangée en huit sous-onglets, nommés comme l'application. »

**1.219**, `vert`, validé le 25 oct. à 19 h 59 :
- Titre : « Les bibliothèques, plus simples »
1. « Conception : les six bibliothèques (grilles, échelles, cartouches, productions, pratiques, cartes d'alignement) s'ouvrent en deux colonnes, « Dans ce trimestre » à gauche et « Dans ta bibliothèque » à droite. Sur l'iPad en portrait, elles s'empilent. »
2. « Un seul bouton par rangée fait passer un élément d'une colonne à l'autre : « Garder dans ma bibliothèque → » ou « ← Utiliser dans ce trimestre ». Une coche te dit quand il est déjà de l'autre côté. Les autres gestes sont dans le menu ⋮. »
3. « Touche le nom d'un élément pour voir ce qu'il contient, sans quitter la fenêtre. »
4. « Tes tampons ont la même fenêtre : « Dans ta palette » et « Dans ta bibliothèque », rangés par catégorie. »
5. « Cours, trimestres et groupes-cours, dans le Cadre : une seule liste, « Actif » écrit en clair. Ce que tu mets de côté se range en bas, sous « Mis de côté » (« Clos » pour les trimestres), replié. »
6. « « Supprimer définitivement » efface l'élément de ce trimestre, mais garde son exemplaire de ta bibliothèque, et te le dit avant. »
7. « Les fichiers sont réunis dans « Importer ou exporter ▾ », en haut de chaque fenêtre. »
8. « Carte d'alignement : « Partager » s'appelle maintenant « Garder dans ma bibliothèque → ». »

Si un mot se révèle faux à la mesure (un geste ou un endroit qui n'existe pas comme écrit), **ne le change pas** : arrête-toi et dis-le.

## 3. La vérification complète (étape 4), sur le commit de 1.219

`fin-de-session` § 4.5 et § 4.6, règles 7 et 8. **Avant de lancer** : dis à Grégoire « ferme Cowork, Chrome et Safari, je lance la vérification » ; Mac sur secteur ; **regarde la pression mémoire** : le Mac a redémarré la nuit dernière à 2 h 48, mémoire saturée, une machine virtuelle en tête de la charge. Si la pression n'est pas basse, dis-le et attends.

- Verte : push par `scripts/pousser.sh`.
- Rouge : ne pousse pas ; nomme le lot fautif par les commits (les lots du jour ont chacun le leur) ; le rapport va à Cowork.

## 4. Après le push

- Constater « en ligne » chez Netlify, la 1.219 lue en bas de page.
- Le run GitHub du push : le juger contre la baseline Linux (#1114, premier essai du critère de bascule). Une spec neuve rouge sous Linux et verte sur le Mac suit le tri du 25 oct. au matin ; ne corrige rien ce soir, dis-le.
- `RELAIS.md`, `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` : la branche fusionnée et supprimée en local, la 1.219 en ligne, la suite (la table de cas, le 26).
- La porte terrain : `PORTES-TERRAIN-2026-10-25-bibliotheques-deux-colonnes.md` est prête ; Cowork publiera l'artefact quand Grégoire le rouvrira.
