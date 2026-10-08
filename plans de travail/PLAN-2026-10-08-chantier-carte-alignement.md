# Plan – chantier de la carte d'alignement (après l'enregistrement)

> Écrit par Cowork le 8 octobre 2026 à 14 h 26 (Toronto), à partir des propositions de Grégoire du même jour. **À ouvrir après la mise en ligne du lot 7 de l'enregistrement (#976)** : une seule session écrit dans `js/` à la fois. La mesure (lot 0) peut tourner avant, en lecture seule.

## Les propositions de Grégoire (8 oct. 2026), telles quelles

1. **Barre d'outils** : la désengorger ; n'y garder que des icônes significatives ou des menus clairs.
2. **Couleurs de fond** : retirer la palette des couleurs de fond du canevas (à droite de la barre, `planif-btn-fond`) ; son contenu passe dans **le menu qui porte le nom de la carte** (« Sans titre » tant qu'elle n'a pas de nom ; confirmé par Grégoire), comme le menu « Annoter » de la page « Annoter et évaluer ».
3. **Menu « Vue »** (nouveau) : des mots brefs au lieu d'icônes ambiguës.
   - les flèches vers l'extérieur (`planif-btn-plein-ecran`) → « Vue plein écran » ;
   - le double cercle (`planif-btn-recentrer`, ⌘1) → « Recentrer la carte » ;
   - les flèches vers l'intérieur (`planif-btn-tout-voir`) → « Tout voir » ;
   - **tous les raccourcis clavier en bas de ce menu** ; la palette indépendante des raccourcis (`planif-palette-raccourcis-btn`, `planif-raccourcis-panel`) disparaît ; **chaque raccourci décrit doit fonctionner**.
4. **Planificateur** : retirer la présentation horizontale (on ne peut pas y glisser du contenu qui arrive à la même hauteur que du contenu non planifié) ; garder la vue verticale seulement. À côté du titre « PLANIFICATEUR » : **les dates de début et de fin du trimestre**, lues dans Cadre › Trimestre ; si elles ne sont pas entrées, une invitation à le faire.

## Déjà inscrit pour ce chantier (backlog)

- #974 : l'export du plan laisse vide « Objectifs servis » quand un bloc sert l'objectif.
- #970 : la carte démo enseigne l'ancien geste « se vérifie par ».
- #971 : la pastille d'évaluation recalcule l'index à chaque évaluation (~21 ms par sauvegarde sur 720 nœuds).
- #972 : `aria-label` sur un `span` sans rôle, pour les deux pastilles.
- #973 : le défaut de semaine de « Télécharger un modèle » n'est gardé par aucun essai navigateur.

## Les lots, dans l'ordre proposé par Cowork

| Lot | Ce que Grégoire verra | Arbitrage | Palier |
|---|---|---|---|
| 0 – Mesure (lecture seule) | Rien | aucun | petit |
| 1 – Couleurs de fond et menu « Vue » | La palette de fond quitte la barre ; un menu « Vue » avec trois commandes en mots et les raccourcis en bas ; la palette des raccourcis disparaît ; chaque raccourci marche | les mots du menu (les trois commandes sont déjà données par Grégoire ; libellé de la rubrique « Couleur de fond » et de chaque raccourci à soumettre) | intermédiaire |
| 2 – Le planificateur vertical, avec ses dates | Plus de bouton de présentation horizontale ; les dates du trimestre à côté du titre, ou l'invitation | la phrase d'invitation | intermédiaire |
| 3 – Le reste de la barre | Ce que la mesure aura montré d'ambigu ou d'inutile, proposé icône par icône | **Grégoire, une icône à la fois** | à mesurer |
| 4 – Les cinq fiches inscrites | L'export du plan dit vrai (#974), la démo à jour (#970) ; le reste sans geste visible | #970 : peut-être des mots | intermédiaire |

**Motif de l'ordre** : les lots 1 et 2 portent les décisions déjà prises par Grégoire ; le lot 3 a besoin de la mesure et de ses arbitrages ; le lot 4 est surtout technique. ⚠ #974 (un export qui dit faux) pourrait passer avant le lot 3 si Grégoire s'en sert : à lui demander à l'ouverture.

## Lot 0 – ce que la mesure doit rendre

1. **L'inventaire de la barre d'outils** (`index.html`, ids `planif-btn-*`, `planif-palette-*`, menus) : pour chaque élément, l'icône ou le mot affiché, ce qu'il fait, son raccourci, et s'il a un équivalent ailleurs. Relevé au 8 oct. par Cowork : 27 boutons `planif-btn-*` et 6 éléments `planif-palette-*`.
2. **Les raccourcis** : la liste affichée dans la palette des raccourcis, et pour chacun : branché ou non (`keydown`), et s'il fait ce qu'il dit. Un raccourci décrit mais inopérant est un défaut à corriger au lot 1 (demande de Grégoire).
3. **La présentation horizontale du planificateur** : son code, sa préférence enregistrée (clé et valeurs possibles), ce que deviendra un usager qui l'avait choisie (il retombe sur la verticale ; **rien n'est effacé** de ses données, seule la préférence cesse d'être lue).
4. **Les dates du trimestre** : la clé du cadre lue (`dateDebut`, `finTrimestre`, ou `finCours` ?) ; à dire : laquelle est « la fin du trimestre » pour Grégoire, et proposer.
5. **Le menu de la carte** (« Sans titre ») et le menu « Annoter » d'« Annoter et évaluer » : leur structure, pour que la rubrique des couleurs de fond suive le même modèle.

Rendu : `plans de travail/MESURE-2026-10-xx-barre-carte-alignement.md`, puis rapport à Grégoire en gestes d'utilisateur.

## Règles communes

- Mots d'écran : soumis à Grégoire avant la release ; guillemets français ; tutoiement.
- Chaque lot finit par un geste à l'écran, en démo si possible.
- Aucune donnée d'usager effacée.
- Verdict complet : Chrome et Safari fermés.

## Décisions de Grégoire après la mesure (8 oct. 2026)

- **14 h 34 – Couleurs de fond : dans le menu « Vue », pas sous le nom de la carte** (« oui »). Motif mesuré au lot 0 : le menu au nom de la carte n'existe pas (le nom est une liste déroulante, les commandes sont dans « Actions ▾ ») et la couleur de fond vaut pour **toutes** les cartes. Le menu « Vue » réunit : « Vue plein écran », « Recentrer la carte », « Tout voir », puis un sous-titre « Fond du canevas » avec les couleurs (comme dans « Annoter »), et les raccourcis en bas. La proposition 2 est remplacée par celle-ci.
- **14 h 35 – Dates à côté du titre : « Début du trimestre » et « Fin du trimestre »** du Cadre (« oui »). Exemple de forme : « PLANIFICATEUR · du 25 août au 19 décembre 2026 ».
- **14 h 36 – Phrase quand les dates manquent** (« oui ») : « Les dates du trimestre ne sont pas entrées. Ajoute-les dans Cadre › Trimestre. », où « Cadre › Trimestre » est un lien qui ouvre cette section (l'avis actuel renvoie à tort vers « Réglages », trouvaille du lot 0).

## Décisions techniques de Cowork (8 oct. 2026), dites à Grégoire

- **Raccourcis du menu « Vue »** : chaque raccourci affiché doit marcher dans Chrome et Safari. Un raccourci pris par le navigateur (⌘1, probablement) est remplacé par une touche libre, choisie par Claude Code et affichée telle quelle ; les descriptions inexactes (⌘0, « Ctrl+Z » du bouton « Annuler ») sont corrigées ; les huit raccourcis qui marchent sans être décrits sont ajoutés à la liste. Les libellés en mots passent par Grégoire avec le lot.
- **Les trois trouvailles du lot 0** entrent dans les lots 1 et 2, sans fiche à part : l'avis du planificateur qui renvoie vers « Réglages » (lot 2), le bouton « Recentrer » branché deux fois (lot 1), les deux couleurs de fond absentes de `docs/DATA-OWNERSHIP.md` (lot 1).
- **Lots 1 et 2 prêts** : toutes leurs décisions sont prises. Ils partent après la mise en ligne du lot 7 de l'enregistrement (#976), dans une seule session. Le lot 3 (le reste de la barre, icône par icône) attend ces deux lots : la barre aura changé.
