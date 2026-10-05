# Verdict de relecture – #1028, archiver les copies d'un trimestre clos

> Écrit par Cowork le 5 octobre 2026 à 9 h 35 (Toronto, mesurée par `date`). Porte sur `ab24f7d0` (`claude/1028-archiver-copies`) et `DEMANDE-RELECTURE-2026-10-05-1028-archiver-copies.md`.

## Verdict : vert, avec trois corrections et un essai de plus

Relu : la demande en entier ; la carte de `reserve-copies.js` (marque, comparaison, retrait) ; le diff de `reserve-trimestre.js`, `reserve.js`, `reserve-revenir.js`.

**Accepté tel quel** :
- la marque `_copiesAuxArchives`, globale, hors des clés `<trimestre>_*` : c'est ce qui laisse E3 juger le trimestre identique ;
- « aux archives » = marquée ET fichier absent ;
- le refus d'E1 et de l'archive d'un groupe plutôt que la reprise de l'archive précédente (même dossier, par-dessus : le refus est le seul choix sûr) ;
- l'ordre (marque relue, puis chaque fichier relu absent) ;
- « Faire revenir » étendu plutôt que doublé ; la relecture de l'archive partagée avec E3 ;
- **ta supposition sur l'étudiant·e supprimé·e** : sa copie reste. C'est la conséquence directe de deux règles de Grégoire (2 oct. : « Faire revenir » ne le ramène pas ; 20 sept. : rien d'inaccessible) ; pas besoin de la lui soumettre ;
- E3 qui lève toute la marque.

## Les trois corrections : les trouvailles 1, 2 et 3 se corrigent dans ce lot, pour TOUTE copie sans fichier

Tu as déjà ouvert ces sites ; les laisser à demi corrigés serait pire que les deux extrêmes.

1. **La visionneuse** : une copie sans fichier (« manquante » comme « aux archives ») ne laisse jamais la copie précédente à l'écran, et « Évaluer » ne s'enchaîne jamais sur une autre copie. Le message d'une copie manquante est celui qui existe déjà pour elle (sinon : « Le fichier de cette copie est introuvable. »). Une évaluation faite sur la mauvaise copie est une note fausse : on corrige sans attendre un symptôme.
2. **« Fusionner »** ne retire plus jamais une copie dont le fichier n'est pas chargé : refus, avec le même mot que pour une copie aux archives, adapté (« Le fichier de cette copie est introuvable : elle ne peut pas être fusionnée. »). C'est une perte silencieuse de données, contraire à la règle du 20 sept.
3. **`notifications.avertissement`** → la fonction qui existe (`warning`), et cherche par grep s'il y a d'autres appels à une fonction absente de l'API.

Pour chacune : un essai et sa mutation rouge.

**L'essai de plus** : l'aller-retour par le **codex** – écrire un codex quand des copies sont aux archives, l'ouvrir dans un espace neuf : la marque voyage, les copies se disent « aux archives » (pas « manquantes »), et « Faire revenir » les ramène si l'archive est listée. Idem pour l'import d'un ZIP de travaux, au banc. C'est le seul chemin que tu dis écrit et non rejoué.

**La trouvaille 4** (la CI au navigateur) : déjà inscrite (#979) ; rien à faire.

## Les mots

Soumis à Grégoire par Cowork, fenêtre par fenêtre ; ils arriveront avec la consigne de livraison.
