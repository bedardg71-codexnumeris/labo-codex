# Consigne du jour – carte d'alignement, lot 3 : une barre sans icône seule

> Écrite par Cowork le 9 octobre 2026 à 11 h 26 (Toronto, mesurée par `date`). Remplace la consigne de la release 1.192.2, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-09-carte-release-1922.md`.

## Où on en est

1.192.2 est en ligne (`8761a3fe`, Netlify à 8 h 53) ; porte de l'export passée par Grégoire le 9 au matin. Dernier lot du chantier : **le reste de la barre**. Toutes les décisions sont prises, une à une, ce matin : `plans de travail/PLAN-2026-10-08-chantier-carte-alignement.md`, section **« Lot 3 – le reste de la barre »** (fin du fichier). Lis-la d'abord ; elle fait foi.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork (cette consigne, son archive, le plan), à écrire dans `BACKLOG.md` et `SUIVI-BUGS.md`, et à faire la release sur `main` local. **Pas de push avant la relecture de Cowork.**

## 0 · Avant tout

Si le résultat de la sonde de Mathieu (#1038) est arrivé dans `Retours des testeurs/`, arrête-toi et dis-le en une ligne.

## 1 · Ce que le lot fait (résumé du plan)

1. **Longue-vue** : la loupe devient « Longue-vue », quitte la barre pour le menu « Vue » (sous « Tout voir », touche L) ; son cadre devient **un cercle**, d'un diamètre où un titre de bloc tient entier au centre. « Loupe » devient « longue-vue » partout où l'outil est nommé (raccourcis, aide, guide, infobulles, commentaires visibles).
2. **« Inspecteur »** : le mot, sans icône, reste dans la barre ; sans bloc sélectionné : « Sélectionne un bloc pour l'inspecter. »
3. **« Guide »** : le mot, sans icône.
4. **La Bibliothèque** : bouton bleu foncé **« Consulter la bibliothèque »**, même style que dans la Conception (Productions, Grilles), **à gauche de la barre, avant la liste des cartes**. Elle devient le lieu où l'on gère ses cartes : quittent « Actions ▾ » « Importer une carte (fichier) », « Importer d'un autre trimestre… », « Exporter cette carte », « Supprimer cette carte » (déjà présents dans la Bibliothèque) ; « Dupliquer » entre dans le menu « ⋮ » de chaque carte de la Bibliothèque. « Actions ▾ » garde 8 commandes (liste au plan). **Mesure d'abord** les bibliothèques de la Conception et aligne celle-ci sur elles (disposition, menu « ⋮ », mots) ; un écart que tu ne peux pas trancher par la mesure remonte, sans être écrit.
5. **Zoom** : l'indicateur « 100% » quitte la barre ; dans le menu « Vue », une rubrique « Zoom » : 100 %, 75 %, 50 %, 25 % ; le niveau en cours coché, aucun entre deux ; le centre de la vue est gardé.
6. **« Rétablir »** juste après « Annuler », même forme (mot, flèche en miroir), grisé quand rien n'est à rétablir ; même effet que ⇧⌘Z.

Zéro-dette : retire ce qui est remplacé (icônes, indicateur, commandes déplacées), sans alias. Toute commande retirée d'un endroit doit exister à son nouvel endroit avant le commit.

## 2 · Mots

Ceux du plan sont arrêtés. **Propose à part, non écrits ailleurs que dans le code**, ceux qui manquent : le libellé exact de « Dupliquer » dans le « ⋮ », le titre de la rubrique « Zoom » s'il en faut un autre, la ligne des Nouvelles. Ils passent par Grégoire avant la release.

## 3 · Captures, avant la release

La barre et le menu « Vue » ouvert, **Chrome et Safari, largeur Mac et largeur iPad (portrait et paysage)**, et la longue-vue ronde sur une carte en « Tout voir ». Dépose-les dans `plans de travail/captures-2026-10-09-barre-lot3/` : Cowork les regarde avant la sortie. Si la barre déborde sur l'iPad, dis-le et propose ; ne retire rien d'autre de toi-même.

## 4 · Tests

Bancs avec break-test : chaque commande déplacée marche à son nouvel endroit et n'existe plus à l'ancien ; « Inspecteur » sans sélection affiche sa phrase ; les quatre niveaux de zoom ; « Rétablir » (grisé, puis actif après « Annuler ») ; la longue-vue ronde (touche L et menu) ; « Dupliquer » dans la Bibliothèque crée une copie, sans toucher l'original. Specs voisins de la carte, Vitest complet. Noms manifestement fictifs.

## 5 · Puis arrête-toi

Commits séparés, **pas de release avant les mots et les captures** : rapport à Grégoire, relecture de Cowork, mots, release minor, verdict (Chrome et Safari fermés), push.

## Ton rapport à Grégoire

En gestes d'utilisateur, numéros entre parenthèses en fin de ligne. Le geste à l'écran, en démo dans une fenêtre privée. Ce que tu as supposé, une ligne par supposition.
