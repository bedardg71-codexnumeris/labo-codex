# Verdict de relecture – la dissection, lot 7 : « Rattacher »

> Cowork, dimanche 18 octobre 2026, 17 h 15 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-18-dissection-7-rattacher.md` (commit `b20fedb9`, non poussé). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté, avec une correction (C1), dans ton propre lot.** Tes neuf suppositions sont acceptées. Les fonctions pures sont justes à la lecture : `rattacher` garde un seul niveau, `morceauxLus` ne perd aucun texte (lien invalide ignoré, B rendu à part), et la création passe par `comprendre` avec les rattachements (`lire()`), donc l'objet créé est juste.

Une remarque sur la supposition 1, sans changement : A est toujours lu en premier, même si B le précède dans le document (geste fait à l'envers). Acceptée : la ligne d'état affiche aussitôt le texte lu, et un toucher défait le lien.

## C1 – la marque d'une suite ne suit pas l'étiquette posée ensuite sur son A

**Mesuré dans le code.** `appliquer` (le surligneur) ne remarque que le morceau touché (`marquer(id)`, l. 322). Une suite prend la couleur de son A dans `marquer`, mais seulement quand elle est remarquée : à la création du lien (`apresLien`), après une coupe (`rendreFeuille`), après « Retirer les étiquettes ». Conséquences :

- dans l'ordre couper → rattacher → étiqueter (celui du point 7 de la consigne, et celui d'un utilisateur qui découvre l'outil), « renvois) » reste en pointillé gris sous « Nuances fictives du propos » marqué Critère ;
- changer ou retirer l'étiquette de A laisse ses suites dans l'ancienne couleur.

Ta supposition 6 n'est donc vraie que dans l'ordre de ta spec (étiqueter d'abord). Ce n'est pas une trouvaille : c'est ton lot, à finir. Rien n'est faux dans l'objet créé.

**Correction** : dans `appliquer`, après `marquer(id)`, remarquer aussi chaque suite de `id` (`etat.rattachements[b] === id`).

**Preuve** : dans `materiel-dissection-7.spec.js`, rattacher d'abord, étiqueter A ensuite : la suite prend la classe de couleur de A (`dis-t-critere`) ; retirer l'étiquette de A : la suite la perd. Break-test : sans la ligne ajoutée, l'essai rougit.

## Un texte de ce matin à revoir (trouvaille hors du lot : remise sur la page des mots)

« Texte collé : … lignes, sans tableau. L'application rattachera les morceaux par leur ordre. » (`materiel-dissection.js`, l. 949, lot 1). Grégoire l'a validé ce matin (9 h 52, sa page des mots, D5), avant que « Rattacher » existe. Depuis ce soir, « Rattacher » est le nom d'un outil que l'enseignant prend en main, et l'application ne crée jamais de lien d'elle-même : la phrase dit le contraire avec le même mot. Cowork le soumet de nouveau à Grégoire sur sa page des mots, avec une proposition. **N'y touche pas avant sa décision** : elle viendra avec les quinze autres, dans la consigne de la version.

## Les textes neufs

Grégoire les tranche sur sa page « Tes mots pour la dissection » (groupe « Rattacher »), pendant que tu fais C1.

## La porte

D'accord sur les deux rangées : le doigt réel sur deux lignes courtes et voisines (environ 20 px), et la flèche en mode sombre sur sa vraie grille. Cowork les ajoute à la porte.

## RELAIS.md

C'est Cowork qui l'écrit, en fin de journée. Rien à faire de ton côté.

## La suite

C1, un commit, Vitest complet vert, `materiel-*` vertes dans WebKit. **Puis arrête-toi** : pas de version, pas de push.

## Ajout de 17 h 18 – les textes sont tranchés

Grégoire a tranché sur sa page à 17 h 18 : les quatorze autres textes de ta demande tels quels ; le refus « boucle » devient « Ce morceau est déjà la suite de « … » : ils sont déjà rattachés, dans l'autre sens. » ; la ligne d'état du texte collé devient « … L'application rangera les morceaux selon leur ordre. ». **Ne les applique pas dans C1** : la consigne de la version les portera.
