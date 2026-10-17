# Proposition – la reconnaissance des grilles collées, d'après douze mises en page réelles

> Cowork, samedi 17 octobre 2026, 12 h 10 (Toronto), sur `CONSIGNE-COWORK-2026-10-17-analyse-12-echantillons.md` (étape 5b du plan de match). **Une proposition, pas une consigne** : la session du plan de match en tire la consigne d'un lot, après l'étape 5.
> ⛔ Ce fichier est public : **structure seulement**. Aucun texte des grilles d'origine, aucun nom. L'analyse détaillée, qui cite les originaux, est hors du dépôt.

## D'où elle vient

Douze grilles d'un même enseignant (littérature et cinéma, de 1995 à 2025), chacune avec une capture de ce que lisait le lot 1. **Mesuré sur `74527da6`** (lot 3b1), **puis remesuré sur `51a7be2b`** (étape 5, commitée pendant l'analyse) : pour chaque mise en page, un tableau de même forme aux textes inventés, passé par `lireHtml` → `proposerRoles` → `modeleDepuisRoles`, puis par `etapesPour` et `calculs`. Puis les rôles qu'un·e enseignant·e choisirait au menu, appliqués par `changerRole` et `relire`, en comptant les gestes. Essai jetable, jamais commité.

⚠ **Biais** : douze grilles d'une seule personne. Les fréquences ci-dessous disent ses habitudes, pas celles du réseau ; elles servent à trouver des formes, pas à les classer par fréquence ailleurs.

## Ce que montrent les douze

| Famille | Nombre | Forme | Lue aujourd'hui |
|---|---|---|---|
| A. Le critère sur deux rangées | 4 | Une bande « nom \| … », puis « liste \| descripteurs » | Juste si la bande porte des codes (lot 3a) ; fausse si elle porte une réglette de points fusionnée |
| B. Un critère par rangée, points dans chaque case | 4 | Chaque case : un descripteur ou un qualificatif, puis **les points du niveau** sur sa dernière ligne ; barème propre à chaque critère | Critères et niveaux justes ; points collés aux descripteurs ; poids en parts égales, donc note fausse |
| C. Liste de constats à cocher | 3 | Points par critère ; un critère sur plusieurs rangées (case de nom vide) ; colonnes de cases « [ ] » ; aucun niveau | 15 à 27 gestes au menu, puis bloquée (« au moins une colonne Un niveau ») |
| D. Liste à barème | 1 | Pas de tableau visible : parties, puces, points alignés à droite | Refusée au chargement |

**La forme type du cadrage** (un critère par rangée, un descripteur par case, une colonne de pondération) **n'apparaît telle quelle dans aucune**. Traits communs : une ligne de total (11 sur 12), des points sous une forme ou une autre (10), une ligne de calcul de la langue en erreurs et en mots (8), des puces dans la case du nom (7 : ↳, ·, •, -), des parties en rangées (6, aucune en colonne).

## Les améliorations proposées

Classées par effet pour un·e enseignant·e qui essaie sa grille lundi, puis par coût. Toutes se règlent dans `proposerRoles` et `modeleDepuisRoles` (`js/materiel-lecture.js`), sans écran neuf.

### Avant lundi

1. **Relecture de l'étape 5 : remesurée sur `51a7be2b` (12 h 15), mêmes formes.**
   - ✓ `charger` ne refuse plus une grille en points : la liste à barème en tableau se charge.
   - ✓ Une rangée dont le nom commence par « Total » va à « À classer ». ✗ « Note finale / 100 » devient encore un critère de 100 points ; le pied non fusionné « ligne de calcul \| légende » aussi (point 2).
   - ✗ **Les critères « / 0 » bloquent la création** (« des points en nombre entier de 1 à 100 pour 3 critères », liste à cocher, après les gestes du menu). Mesuré : `_pourcentageDesPoints` (`evaluation-calcul.js` ~1333) écarte sans erreur une pondération 0, et le partage accepte 0. **Supposition technique retenue : accepter 0.**
   - ✗ Sans rangée d'en-tête, la 1re rangée est encore proposée « À ignorer » (la liste à barème perd son premier critère) : point 9.
   - ✗ Les puces ↳ restent dans les noms et les « · » en tête des lignes de description : point 3.
2. **Lignes de pied et de calcul : jamais un critère.** Une rangée dont la case de nom ou le texte fusionné commence par « Total », « Note finale », « Note : », « Résultat », ou qui contient une ligne de calcul (« erreurs » et « mots », avec des blancs « ___ »), ou une pénalité, ou « Commentaires : » suivi de lignes vides → **« À classer » avec sa raison** (« Ligne de total », « Ligne de calcul de la langue »), plutôt qu'« À ignorer », pour que rien ne disparaisse en silence. Aujourd'hui, 4 grilles sur 12 en font des critères fantômes (pied non fusionné).
3. **Les puces, retirées partout.** `RE_PUCE` ajoute ↳ · • ▪ ◦ ‣ ➤ – (et garde ☐ ☑ □ ■ * -), et s'applique aussi à la **première ligne**, celle du nom.
4. **Les points d'un niveau.** Dans une rangée de critère, quand la dernière ligne de chaque case de niveau (sauf, au plus, la première) est un nombre, une plage ou une énumération (« 3 », « 7-8 », « 10-11-12 », « 13-14-15-16 »), **le plus grand nombre de la rangée devient les points du critère**, état « repris » ; même règle pour une réglette de bande (point 5). Ces critères sont **analytiques** (Q1, tranchée) : points saisis sur ce maximum, niveau déduit. Le nombre reste dans le descripteur, où il guide la saisie : rien ne se perd. ⚠ À mesurer au lot : une grille entièrement analytique se note sans échelle (#941) ; ce que deviennent alors ses descripteurs par niveau, et où ils se lisent. Sans cette règle, les poids sont en parts égales et la note est fausse (6 grilles sur 12).
5. **La bande à réglette.** Une rangée dont la case de nom est remplie et dont les cases de niveau ne forment qu'**une case fusionnée de nombres** (« 0 1 2 … 15 ») est une bande : « Nom d'un critère », puis « Suite du critère » pour la rangée de contenu, comme une bande à codes. Mesuré : 11 gestes aujourd'hui ; attendu : aucun.
6. **La case de nom sur plusieurs lignes** (prolonge l'étape 5) : 1re ligne = nom ; **lignes à puce = sous-critères, lignes sans puce = description**. Dans une « Suite du critère », c'est une quatrième option, proposée par défaut : « selon les puces » (les trois options du lot 3a restent). Supposition technique : même règle qu'au lot 3a (☐ → sous-critères), étendue aux autres puces.
7. **Une rangée à case de nom vide sous un critère** → « Suite du critère » proposée (aujourd'hui : seulement sous une case fusionnée verticale). Une suite dont la case de nom commence par une minuscule, sans ponctuation finale à la ligne du dessus, **prolonge le nom** (noms coupés sur deux rangées).
8. **Colonnes de cases à cocher** : une colonne dont les cases non vides sont toutes « [ ] », « [ », « ] », « ☐ », « □ » ou un petit numéro (rangée « 1 \| 2 \| 3 ») → « À ignorer » proposé ; la rangée qui ne porte que ces numéros aussi.
9. **Pas d'en-tête.** Si la 1re rangée porte des points (« / 9 ») dans la colonne où les suivantes en portent, ou si aucune de ses cases de niveau n'est courte, c'est un critère : aucune rangée « Noms des niveaux » n'est proposée. (Aujourd'hui, la colonne de points n'est reconnue que **parce que** le 1er critère est pris pour l'en-tête.)

Avec 7 et 8, la famille C passerait de 27 et 15 gestes (mesurés) à 3 ou 4 (estimation : ces règles n'existent pas encore).

### Si le temps le permet

10. **Rôle de rangée neuf « Partie ».** Proposé pour une rangée dont les cases de niveau **répètent** celles de l'en-tête, ou dont seule la case de nom est remplie (souvent en majuscules ou en gras) et que suivent des critères. Quand les parties répètent l'en-tête, **la case d'angle de l'en-tête nomme la première partie**. Nom des critères : même forme que la colonne « Partie » de l'étape 5 (« Partie – Critère »). 6 grilles sur 12 ; aujourd'hui, un geste « À ignorer » par partie rend la grille juste, sans ses regroupements.
11. **Pondération au bout du nom** (« \| 0,20 », « (25 %) », « – 15 pts ») : retirée du nom, reprise ; des décimaux qui totalisent 1 sont multipliés par 100. ⚠ Un pourcentage dans le **titre** au-dessus du tableau est le poids de la production dans le cours : il reste au nom de la grille.
12. **Plusieurs tableaux dans un même collage** (une grille en encadrés) : toutes les `<table>` lues à la suite, chacune pouvant ouvrir une partie. Mesuré : le 2e et le 3e tableau arrivent aujourd'hui en miettes dans « À classer ».

### Après lundi (inscrire)

13. **Ligne de calcul de la langue → critère algorithmique** (le type existe : erreurs, mots, facteur N). 8 grilles sur 12. Relève d'« Aller plus loin », pas de la reconnaissance.
14. Deux critères dans une même case (deux énoncés à puce de premier rang) : non séparés ; « Ajouter un critère » suffit.
15. Un niveau d'en-tête fusionné sur deux colonnes : la seconde reste sans nom, manque déjà nommé ; un texte d'aide.
16. Grille **mixte** (un critère en points seuls, « / 5 » fusionné, parmi des critères à niveaux) : l'étape 5 ne traite que les grilles entièrement en points.

## Deux questions didactiques (pour Grégoire)

- **Q1 – Les points de chaque niveau : tranchée par Grégoire (17 oct., 12 h 11).** « Aussitôt qu'il y a des chiffres, il s'agit d'une note chiffrée. » Une grille qui écrit des points (par niveau, par critère ou en réglette) est **analytique** : points saisis sur le maximum du critère, niveau déduit ; pas de plages tirées de ces points. Rappel du même moment : **l'objectif n'est pas d'adapter ses grilles, mais de comprendre les formats** qu'un·e enseignant·e apporte, pour qu'il ou elle se retrouve dans Labo Codex.
- **Q2 – Les constats à cocher** (famille C) : descripteurs de niveaux écrits en rangées, rétroactions prêtes à cocher (cartouche), ou description du critère ? Recommandation pour lundi : la description (aucune perte, aucune interprétation).

## Les grilles fictives à verser aux bancs

Textes inventés, sans rapport avec les originaux. Pour chacune : la forme, puis la lecture attendue **après** le lot (avant lundi).

- **F1 – Bande à réglette.** Paragraphe-titre ; en-tête « Critères \| 4 niveaux ». Pour 4 critères : bande « NOM \| réglette 0…max fusionnée sur 4 colonnes » (max 10, 20, 15, 25), puis « 3 énoncés en paragraphes précédés de ↳ \| 4 descripteurs de deux paragraphes ». Bande de langue (0…30) puis « légende en une ligne \| ligne de calcul erreurs/mots fusionnée ». Total fusionné sur 5 colonnes. *Attendu* : 5 critères ; points 10, 20, 15, 25, 30 repris ; énoncés en sous-critères sans ↳ ; ligne de calcul et total dans « À classer » avec leur raison.
- **F2 – Bandes à codes + langue** : le banc du lot 3a, plus une bande de langue « I D M E », sa rangée « légende \| ligne de calcul fusionnée » et un total fusionné. *Attendu* : comme au lot 3a ; la ligne de calcul dans « À classer », pas dans un descripteur.
- **F3 – Pondération dans la bande.** En-tête de deux rangées, **titre de grille dans la case d'angle** fusionnée ; 5 bandes « NOM \| 0,15 » (0,15 ; 0,30 ; 0,10 ; 0,25 ; 0,20) avec codes ; contenu : trois paragraphes étiquetés sans puce (« Étiquette : … ») et 4 cases au tutoiement. Pied **non fusionné** « ligne de calcul \| légende fusionnée sur 4 colonnes », puis total. *Attendu* : noms sans « \| 0,15 » ; pondérations 15, 30, 10, 25, 20 reprises ; paragraphes en description ; nature « rétroactions » proposée ; aucun critère tiré du pied.
- **F4a – Parties et points par niveau.** Deux paragraphes au-dessus (titre, objectif). Trois parties dont la première est la rangée d'en-tête : « PARTIE \| 4 noms de niveau » répétée. 6 critères : case de nom « ↳ énoncé » + 2 lignes « · sous-élément » ; cases « • / descripteur » puis « descripteur / points » (barèmes « 2 », « 3 », « 4 » ; « 5-6 », « 7-8 », « 9-10 » ; « 8-9 », « 10-11-12 », « 13-14-15-16 », répartis sur les 6 critères : 4, 10, 4, 4, 10, 16). Total « / 48 » fusionné. *Attendu* : 6 critères, noms sans puce, sous-éléments en sous-critères, points 4, 10, 4, 4, 10, 16 repris ; parties « À ignorer » au moins (« Partie » si le point 10 est fait).
- **F4b – En-têtes faits d'icônes.** Comme F4a, mais l'en-tête des niveaux porte « + », « ++ » et deux cases vides (icônes) ; une case avec deux énoncés « ↳ » ; une rangée fusionnée de calcul de la langue ; un critère aux points énumérés (« 10-11-12 », « 13-14-15-16 », « 17-18-19-20 »). *Attendu* : deux noms de niveau manquants, nommés comme manques ; points repris (max 20) ; calcul et total dans « À classer ».
- **F5 – En-tête à case vide, un niveau sur deux colonnes.** Titre « Projet (30 %) » au-dessus ; en-tête « vide \| PALIER A (fusionné ×2) \| PALIER B \| PALIER C » ; critères à qualificatifs inventés et points (« Rarement 6 », « Souvent 7-8 », « Toujours 9-10 » ; « Peu 3 », « Assez 4 », « Beaucoup 5 ») ; un dernier critère « / 5 » fusionné sur les niveaux ; total avec pénalité. *Attendu* : le nom du 2e niveau manque (nommé) ; points 10 ou 5 repris ; « (30 %) » reste au titre.
- **F6 – Liste à cocher.** 5 colonnes : nom \| points \| case p.1 \| case p.2 \| constat. Parties en rangée (case de nom seule) ; un critère = une rangée « nom \| / N \| [ ] \| [ ] \| constat » puis 1 à 3 rangées à case de nom vide ; rangée « vide \| vide \| 1 \| 2 \| vide » ; seuils sous un nom (« 60% 70% 80% 90% », « 18 21 24 27 ») ; critères « / 0 » ; pied « TOTAL … / 60 \| … \| échelle en points », « LANGUE / 40 », « NOTE FINALE / 100 ». *Attendu* (avec l'étape 5) : critères en points, « / 0 » compris ; constats en description ; colonnes de cases ignorées ; totaux dans « À classer » ; 3 ou 4 gestes au plus.
- **F7 – Sans en-tête, crochets séparés, noms coupés.** 9 colonnes : nom \| points \| « [ » \| « ] » ×3 \| constat. Aucune rangée d'en-tête ; noms sur deux rangées (« Mise en » / « contexte ») ; seuils sous un nom. *Attendu* : la 1re rangée est un critère ; noms recollés ; 6 critères aux points repris.
- **F8 – Liste à barème en tableau sans bordure** (2 colonnes : texte \| points) : « Partie / sous-éléments • \| / 5 » ; « Partie seule \| vide » ; « • critère / sous-éléments - \| / 30 » ; « Commentaires : / lignes vides \| vide » ; « TOTAL \| / 100 ». *Attendu* : chargée sans refus ; 4 critères ; sous-éléments en sous-critères ; commentaires et total dans « À classer ».
- **F8-texte** : les mêmes lignes en texte, avec des tabulations (seules les lignes à points en portent), puis sans tabulation. Mesuré aujourd'hui : avec tabulations, les sous-éléments partent à « À classer » ; sans, « pas de tableau ». Sert de point de départ à l'exploration de la lecture d'un texte brut.
