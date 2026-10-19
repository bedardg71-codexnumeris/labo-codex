# Idée : l'interface simple d'abord, l'expertise s'active

> **Statut** : décision de principe prise par Grégoire le 19 oct. 2026 (14 h 50) ; **chantier non ouvert**. Rien n'est codé. À cadrer quand l'ébauche du plan pour l'orthopédagogue sera partie (règle du 30 sept. 2026 : on n'ouvre pas un chantier sans écrire l'état de celui qu'on quitte).
>
> Né dans la conversation sur le volet orthopédagogie (`docs/orthopedagogie/2026-10-19 Pour elle — ébauche du plan de suivi (SQUELETTE).md`).

## Ce que Grégoire a dit, dans ses mots, daté (19 oct. 2026)

- 14 h 43 : « on pourrait avoir une interface d'expert et une interface simplifiée. Et le passage d'une interface à l'autre se fait progressivement dans des options d'affichage qui sont dans les réglages. […] un enseignant pourrait décider d'appliquer le modèle de la réponse à l'intervention et coche. Un autre pourrait décider d'utiliser la taxonomie solo, il coche. Un autre pourrait décider de mettre une pratique de notation alternative, il la configure. […] pas de façon binaire. » Ces fonctionnalités pourraient être « bilingues » : parler à la fois orthopédagogie et enseignement.
- 14 h 50 : « Il ne faut pas trop se formaliser de l'usage qui est fait par les membres de la communauté de pratique, parce que l'application est en bêta publique. […] il y a très peu d'utilisateurs, alors c'est un moindre mal que de changer des éléments dans l'application pour avoir une base plus solide pour plus tard. […] Je crois qu'il faudrait remettre en question les choix que j'ai faits. L'application devrait d'abord être simplifiée et progressivement, les utilisateurs ajoutent des fonctionnalités au fil de leur propre développement. »

## Ce que la mesure a trouvé (Cowork, lecture seule, `main` à `d55abef4`)

- [VÉRIFIÉ] Labo › Outils d'observation porte huit cases, rangées dans `preferencesUtilisateur` (`js/preferences.js:54-75`, lues et écrites par `js/preferences-v2.js:76-328`). Défauts : **cochées** SOLO (`afficherDescriptionsSOLO`), RàI (`activerRai`), dépistage ACP (`depistageAcp`), graphiques (`afficherGraphiques`), seuils visuels (`afficherSeuilsVisuels`), développement des habiletés (`afficherDeveloppementHabiletes`) ; **décochées** actions de repérage, liaison et ouverture (`activerActionsRLO`), note différée (`noteDifferee`). Six sur huit : un nouvel utilisateur arrive dans l'interface d'expert.
- [VÉRIFIÉ] `modeExpert` existe aussi (`js/preferences.js`, `js/accueil.js:298`) mais veut dire autre chose : ouvrir directement sur le tableau de bord.
- [INFÉRÉ] Les défauts ne s'appliquent qu'à qui n'a jamais enregistré ces réglages ; les autres gardent leurs cases (à mesurer : `preferences-v2.js` enregistre-t-il les huit d'un coup au premier enregistrement ?).

## Ce qui reste à faire avant tout code (rien n'est tranché ici)

1. Inventorier ce qui, dans l'application, est aujourd'hui visible d'emblée et pourrait devenir une fonction à activer (au-delà des huit cases : pratiques de notation alternatives, jetons, ACP, Alignement, annotation, etc.) ; mesurer où chaque réglage vit (Labo, Réglages, Conception).
2. Proposer à Grégoire le **socle** (ce qu'un nouvel utilisateur voit) et l'**ordre d'activation** suggéré. Didactique : à lui.
3. Prévoir la découverte : une fonction décochée doit pouvoir être trouvée là où elle servirait (précédent : le lien « Régler les outils d'observation » en tête du Suivi du groupe, `index.html:7486`).
4. Données : ce que devient l'écran de Grégoire lui-même et des membres déjà installés (accepté par lui le 19 oct. : bêta publique) ; ses données ne bougent pas, seul l'affichage change.
5. Règle déjà retenue pour le volet orthopédagogie : tout outil neuf entre dans ce panneau, **décoché par défaut**, bilingue par `js/mots-nature.js`.
