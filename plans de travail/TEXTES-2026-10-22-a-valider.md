# Textes à valider – « Coller sa liste de codes » et les Nouvelles de la prochaine version

> **VALIDÉS par Grégoire le 22 oct. 2026 à 13 h 05** : tout accepté tel quel, retouches de Cowork comprises ; « Poids » est gardé (A3, B1). Cinq textes diffèrent de la proposition ci-dessous et sont appliqués au mot près dans le code et les Nouvelles 1.214 :
> - **Titre des Nouvelles** : « Essayer sa formule et coller sa liste de codes » (sans virgule).
> - **Sixième ligne des Nouvelles, ajoutée** : « En mode anonymisé, le vrai DA ne paraît plus dans les propriétés d’un fichier, l’import des copies ni le Comparateur. Un trimestre clos refuse les modifications, sauf si tu coches « Permission d’écriture ». Une production employée ne se supprime plus. Le rapport de bogue ne garde plus le texte des boutons cliqués. »
> - **A3, bulle de « Poids »** : « Un nombre plus grand que 0 ; sans poids, le code pèse 1. Il devient la pondération de son sous-critère. »
> - **E2** : « Avant d’ajouter, il faut : » (au lieu de « il reste »).
> - **G4** : « L’ajout n’a pas abouti ; rien n’a été ajouté. Réessaie. »
>
> Tous les autres textes (lignes 1 à 5 des Nouvelles, l’écran des codes, les mots de #1075) restent tels qu’écrits.
>
> **Sixième ligne resserrée, VALIDÉE par Grégoire à 13 h 17** (Cowork, d'après #1140 : 56 écritures directes ne passent pas par le refus du trimestre clos). Seule la deuxième phrase change : « Un trimestre clos refuse maintenant d’enregistrer une évaluation ou des présences, sauf si tu coches « Permission d’écriture ». Les imports, entre autres, y écrivent encore. »

> Claude Code, jeudi 22 octobre 2026, sur `main` après `3203a510`. Demandé par Cowork (réponse sur l'étape 5). Cowork en fait une page pour Grégoire.
> Tous les textes de la partie 1 sont **provisoires** : écrits par Claude Code à l'étape 5, jamais lus par Grégoire. Ils s'affichent à l'enseignant, pas à l'élève ; le **commentaire** collé, lui, passe tel quel à l'élève et n'est pas un texte de l'application.
> Numéros de ligne : ceux de `3203a510`.

## Partie 1 – L'écran « Coller sa liste de codes »

Où : « Apporter mon matériel », une fois une liste collée et disséquée. Dès qu'un morceau porte une étiquette du groupe « Les codes », la zone de création ne crée plus de grille : elle propose d'ajouter la liste à un critère algorithmique existant.

### A. La palette des étiquettes (`js/materiel-dissection-lecture.js`, l. 63-66)

Chaque étiquette a un nom, une aide courte (sous le nom) et une précision (la bulle). Groupe affiché : « Les codes ».

| | Nom | Aide | Précision (bulle) |
|---|---|---|---|
| A1 | Code | Ce que tu écris sur la copie | Un code d’annotation : des lettres ou des chiffres (par ex. « 3 », « S ») |
| A2 | Nom du code | Ce que le code désigne | – |
| A3 | Poids | Ce que pèse un code posé | Un nombre plus grand que 0 ; sans poids, le code pèse 1 |
| A4 | Commentaire | Ce que l’élève lit pour ce code | Il passe tel quel dans la rétroaction |

⚠ « Poids » ici, « Pondération » dans « Grilles de critères » pour la même valeur (le poids devient la pondération du sous-critère). À trancher : garder « Poids » (plus court, distinct de la pondération du critère) ou aligner sur « Pondération ».

### B. La lecture de la liste (`js/materiel-dissection.js`, `tableCodes` et `rendreLecture`)

- **B1, en-têtes du tableau** : « Code », « Nom », « Poids », « Commentaire ». Une case vide affiche « — ».
- **B2, constats au-dessus** : « 1 code » / « N codes » ; « 1 morceau sans étiquette » / « N morceaux sans étiquette ».

### C. Le choix du critère (`js/materiel-dissection.js`, `TEXTES_CODES`)

- **C1, titre du choix** : « Où vont ces codes ? »
- **C2, aide sous le titre** : « Dans un critère algorithmique qui n’a pas encore de codes. Il garde sa formule et sa pondération ; rien n’est remplacé. »
- **C3, aucun critère possible** : « Aucun critère algorithmique dans les grilles de ce trimestre. Crée-le d’abord dans « Grilles de critères », puis reviens. »
- Chaque option affiche « « nom du critère » » puis, dessous, le nom de sa grille.

### D. Les motifs d'un critère grisé (`js/materiel-dissection-lecture.js`, `MOTIFS_CODES`)

Affichés sous l'option, qui ne se coche pas.

- **D1** : « Seul le premier critère algorithmique d’une grille reçoit des codes » (la limite de #1132).
- **D2** : « Il a déjà des codes ou des sous-critères : rien n’est remplacé »
- **D3** : « Il reçoit encore les dix codes du français écrit : rien n’est remplacé » (un critère d'avant le 21 oct., sans la marque ; refus confirmé par Cowork).

### E. Le bouton et ce qui le bloque (`js/materiel-dissection.js`, `TEXTES_CODES` et `codesCompris`)

- **E1, bouton** : « Ajouter ces codes » ; pendant l'écriture : « Ajout… »
- **E2, titre de la liste des blocages** : « Avant d’ajouter, il reste : »
- Puis une ligne par blocage, chacune complète la phrase E2 :
  - **E3** : « une liste de codes seule : retire les étiquettes de grille (critères, réponses, titre…), ou celles des codes »
  - **E4** : « au moins un code : surligne chaque code avec l’étiquette « Code » »
  - **E5** : « au plus 30 codes (ta liste en a N) »
  - **E6** : « des codes faits de lettres, de chiffres, de « - » ou de « _ », 20 caractères au plus (codes en cause) »
  - **E7** : « des codes différents (codes en cause en double) »
  - **E8** : « un poids plus grand que 0 (codes en cause) »
  - **E9** : « un poids de 100 au plus (codes en cause) »
  - **E10** : « des noms plus courts (200 caractères au plus) pour codes en cause »
  - **E11** : « des commentaires plus courts (5 000 caractères au plus) pour codes en cause »
  - **E12** : « une place pour le morceau étiqueté listé plus bas » / « une place pour les N morceaux étiquetés listés plus bas »
  - **E13** : « le critère qui recevra ces codes »

### F. Les morceaux sans place (`js/materiel-dissection-lecture.js`, `lireMorceauDeCode`)

Sous la phrase existante « Ces morceaux ont une étiquette, mais l’application ne saurait pas où les ranger : », chaque ligne se lit « « texte » (étiquette) : raison ». Raisons neuves :

- **F1** : « aucun code dans sa rangée » (dans un tableau)
- **F2** : « aucun code avant lui » (dans un texte)
- **F3** : « son code a déjà un poids (N) »
- (« aucun nombre » existait déjà pour les points.)

### G. Le résultat (`js/materiel-creation.js`, `MESSAGES_CODES`, et `TEXTES_CODES.ajoutes`)

- **G1, confirmation** : « N codes ajoutés à « critère » (grille « grille »). Tu les retrouves dans « Grilles de critères ». » (« 1 code ajouté » au singulier.)
- **G2, critère disparu entre-temps** : « Ce critère n’est plus là : rien n’a été ajouté. Choisis-en un autre. »
- **G3, refusé à l'écriture** : « Rien n’a été ajouté. » suivi du motif D1, D2 ou D3 et d'un point.
- **G4, échec de l'écriture** : « L’ajout n’a pas abouti, et rien n’a été ajouté. Tu pourrais réessayer. »

## Partie 2 – Les Nouvelles de la prochaine version

Proposition : **1.214**, `minor` (nouveautés sans rupture ; aucun changement de format de données – les codes collés prennent la forme d'un sous-critère existant). Couleur `vert`. Cinq items, dans l'ordre où l'enseignant les rencontre (règles du skill `release-et-changelog` §5 : pas de date, orientés usage, rien d'interne).

**Titre** : « Essayer sa formule, et coller sa liste de codes »

1. **Le miroir** : « Critère algorithmique : sous la formule, un essai sur quelques copies fictives montre la note et la phrase que l’élève lirait. Il suit tes réglages à mesure que tu les changes. »
2. **Coller sa liste de codes** : « Dans « Apporter mon matériel », tu peux coller ta liste de codes de correction (code, nom, poids, commentaire) et l’ajouter à un critère algorithmique qui n’a pas encore de codes. Rien n’est remplacé. »
3. **La limite des deux critères** : « Quand une grille a deux critères algorithmiques, les codes posés dans Annoter vont tous au premier. L’éditeur de grille et Annoter le disent maintenant, et nomment le critère qui les reçoit. »
4. **La grille à niveaux nommés et à points** : « Une grille en points qui nomme ses niveaux (par ex. « Sommaire », « Efficace ») se crée avec son barème : chaque niveau devient une tranche, ses points dans le champ Points plutôt que dans le texte. »
5. **La virgule** : « Tous les nombres s’écrivent à la française, plus seulement les notes : pondérations, points, indices, taux, graphiques et indicateurs (« 17,5 % », « 3,25 / 4 »). »

⚠ L'item 2 suppose que les textes de la partie 1 soient validés avant la version ; sinon, le retirer de l'entrée ou livrer l'écran tel quel en le sachant provisoire.
⚠ L'item 3 ne dit pas « on corrigera » : la fiche #1132 reste ouverte, et la règle (deux critères au même numéro) revient à Grégoire.
