# Rapport — l'éditeur de pages garde la définition (15 nov. 2026)

**Branche** : `lot/editeur-pages-definition`, partie de `main` à `41f68d315` (1.247.0). **Non fusionnée, sans release, sans verdict complet** (limites des mandats de Cowork, 8 h 14 et 9 h 00).
**Arbre de travail** : `/Users/kuekatsheu/Documents/GitHub/labo-codex-editeur-pages`, et lui seul.
**Fait** : les quatre points du mandat de 8 h 14 (§ 1 à 9) et les trois ajouts du mandat de 9 h 00 (§ 10 à 15) : le PDF réuni à l'import, la confirmation avant « Effacer la page », le carrousel après un remplacement.
**Approuvé par Cowork (9 h 00)** : les mots d'écran des Propriétés et de l'écran d'import (§ 4).
**Reste** : le verdict complet (Playwright entier), la relecture croisée, la fusion ; à approuver : « (réuni en un seul PDF) » (§ 10), la façon dont la confirmation se combine au codex (§ 11), la ligne de Nouvelles (§ 15).
**Stock** : les copies déjà réduites par l'ancien éditeur ou par un ancien import réuni restent réduites. Rien n'est réparé d'office.

## 1. La cause, mesurée

`decomposerPDF` redessinait chaque page à 1 000 px de large (JPEG 0,85) à l'ouverture de l'éditeur ; `pivoterPageEditeur` tournait cette image réduite ; `rendrePagePDF` (« + Ajouter des pages » depuis un PDF) rendait à 800 px. L'essai neuf, sur l'ancien code : une page de 2 728 x 1 748 ressort à 1 000 x 640 après une simple inversion de l'ordre.

## 2. Le moyen retenu pour le point 1, et pourquoi

Une copie importée est un PDF écrit par l'application (jsPDF) : une image JPEG pleine page par page, dont jsPDF colle les octets tels quels. Le module `js/pdf-image-perdue.js` (#1233) savait déjà lire ce PDF. Je lui ai ajouté `lireImagesDesPages` : la position des octets JPEG de chaque page.

- **Page d'un PDF de l'application** : ses octets sont repris par `blob.slice` (ni décodage, ni réencodage, ni copie en mémoire). Une page non modifiée ressort avec ses octets exacts ; l'essai le vérifie octet pour octet.
- **Toute autre page** (PDF d'un autre producteur, PNG laissé par l'ancien pivot, JPEG à balise EXIF) : rendue par pdf.js à la définition de son image numérisée, ou à 250 ppp si elle est du texte. Réencodée une fois (JPEG 0,92) ; aux passages suivants elle est une page de l'application, donc sans perte.
- **Pivot** : seule la vignette tourne à l'écran. Le quart de tour est noté sur la page et fait à l'enregistrement, sur l'image à pleine définition (JPEG 0,92). Quatre quarts de tour : la page repart intacte.
- **Mémoire** : l'éditeur n'affiche que des vignettes de 1 000 px au plus (une par page, plus l'aperçu) ; la pleine définition n'est décodée qu'une page à la fois, à l'enregistrement.

Pourquoi ce moyen : c'est le seul qui tient « une page non modifiée n'est pas réencodée » sans ajouter de bibliothèque (l'application n'a que jsPDF et pdf.js, aucune ne copie une page d'un PDF à l'autre), et il réutilise un lecteur déjà éprouvé.

Vaut pour les trois appelants de `decomposerPDF` (ouverture, fusion depuis l'éditeur, fusion de fichiers) et pour « + Ajouter des pages » ; `rendrePagePDF` est retirée.

## 3. Les mesures

Script : `tests/mesures/editeur-pages-definition.mjs` (WebKit de Playwright sur le Mac, secteur). Copie fictive : quatre pages de 4 000 x 3 000 px, PDF de 25,5 Mo.

| Geste | Avant (`41f68d315`) | Après |
|---|---|---|
| Ouvrir l'éditeur | 1 909 ms, pic +212 Mo | 440 ms, pic +155 Mo |
| Enregistrer (deux pages inversées) | 68 ms, pic +1 Mo | 874 ms, pic +189 Mo |
| Images gardées à l'écran | 2,5 Mo | 2,1 Mo |
| PDF enregistré | 1,5 Mo, pages de 1 000 x 750 | 25,5 Mo, pages de 4 000 x 3 000 |

L'enregistrement coûte plus cher qu'avant : il écrit maintenant 25,5 Mo au lieu de 1,5.

⚠ Limites de la mesure. C'est WebKit du Mac, pas Safari de l'iPad : un ordre de grandeur et un rapport avant/après, pas le chiffre de l'iPad. La mémoire est la mémoire résidente du processus, relevée toutes les 100 ms ; d'un passage à l'autre elle varie de quelques centaines de Mo selon le ramasse-miettes (le pic de l'enregistrement a été relevé à +189, +138 et +484 Mo sur trois passages). Les durées, elles, sont stables (±3 %).

Lecture de la définition d'un PDF (points 2 et 3), même copie :

| Chemin | Durée |
|---|---|
| PDF de l'application (lu dans le fichier) | 179 ms |
| Autre PDF, écran d'import (dictionnaires d'images, sans décodage) | 352 ms |
| Autre PDF, par pdf.js (décode chaque image) | 1 913 ms |

Ma première version lisait tout par pdf.js : 1,9 s et un pic relevé à +673 Mo pour cette copie. Exclu à l'import, où des dizaines de fichiers arrivent ensemble. L'écran d'import ne décode plus aucune image (l'essai le verrouille) ; les Propriétés ne passent par pdf.js que pour un PDF d'un autre producteur, un fichier à la fois, à la demande.

## 4. Les mots d'écran écrits (à approuver)

**Propriétés du fichier**, nouveau bloc sous l'aperçu :

- titre : « Définition des pages »
- « Page 1 : 2728 x 1748 px »
- page de texte ou de dessin : « Page 2 : Lettre (page de texte) »
- pendant la lecture : « Lecture des pages… »
- « Non lue : le fichier n'est pas sur cet appareil. » ; « Non lue : le fichier ne se lit pas. »
- le poids reste sous le nom (« 2 pages · 1,4 Mo ») ; s'il manque aux métadonnées : « Poids du fichier : 1,4 Mo »

**Écran d'import**, pour un PDF, colonne « Originaux » ; la colonne « Aperçu » dit la même chose suivie de « (aucun traitement) » :

- « PDF, 2 pages · 2728 x 1748 px »
- pages de définitions différentes : « PDF, 2 pages · la plus petite : 1700 x 2200 px »
- texte : « PDF, 1 page · Lettre » ; formats différents : « PDF, 3 pages · le plus petit format : Lettre »
- mélange : « PDF, 3 pages · 2 numérisées, 2728 x 1748 px · 1 en texte, Lettre »
- tant que la lecture n'est pas faite : « PDF », comme avant

Formats nommés : Lettre, Légal, 11 x 17 po, A4, A3, A5, suivis de « (paysage) » s'il y a lieu ; sinon les côtés en pouces (« 8,5 x 14 po »). Le séparateur « x » est celui que l'écran emploie déjà pour les images.

## 5. Point 4 — le gabarit de « Rés. max. »

`dimensionsResMax(w, h, dpi)` est la source unique de `calculerDimensionsCibles` (ce que l'écran annonce) et de `uniformiser200DPI` (ce qui est fait). Le gabarit est couché pour une image couchée. À 200 ppp, 2 728 x 1 748 devenait 2 200 x 1 410 ; elle reste entière. (À 250 ppp, le réglage par défaut, elle n'était déjà pas réduite.)

## 6. Les preuves

`tests/integration/editeur-pages-definition-2026-11-15.spec.js`, huit essais, images et noms fictifs :

1. inverser l'ordre : pixels et octets de chaque page gardés ;
2. retirer une page : idem pour la page restante ;
3. pivoter : mêmes pixels, côtés inversés, repères au bon coin ; l'autre page garde ses octets ;
4. une page PNG d'avant ce lot garde ses pixels par le repli ;
5. l'éditeur n'affiche aucune image de plus de 1 000 px ;
6. Propriétés : PDF numérisé, PDF de texte, PDF d'un autre producteur, image ;
7. écran d'import : PDF numérisé, PDF de texte, PDF d'un autre producteur, dans les deux colonnes, sans aucune image décodée ;
8. le gabarit dans les deux sens.

Contre-épreuve : les huit sont rouges sur `41f68d315` ; l'assertion « aucune image décodée » rougit (3 lectures) quand on retire le chemin sans décodage.

Passés : Vitest complet (926 fichiers, 11 807 essais, vert) ; passage Playwright ciblé de 26 essais (ce fichier, `1007-propose-codex-2a2`, `1028-archiver-copies`, `ajouter-pages-photo-droite`, `reparer-image-perdue-1233`, `import-anonymisation-1221`, `import-bandeaux-612`), vert. **Non passé : la suite Playwright entière.**

## 7. Ce que j'ai laissé

| Constat | Disposition |
|---|---|
| **Import groupé de PDF** (`pagesImagesDuFichier`, #880) : quand un élève remet plusieurs fichiers dont un PDF, chaque page du PDF est rendue à 1 400 px au plus. Même famille de défaut, autre chemin, hors des fonctions nommées au mandat. Conséquence sur ce lot : pour un PDF qui sera fusionné, la colonne « Aperçu » dit « (aucun traitement) », ce qui est faux. | **À inscrire** — décision de Cowork ; non corrigé ici |
| Une page de plus de 16,7 millions de pixels (limite d'un canevas sur iPad), pivotée ou passée par le repli, est réduite à cette limite. Une page sans pivot d'un PDF de l'application n'est pas concernée. | Limite assumée, commentée dans le code |
| Une page de texte qui passe par l'éditeur devient une image (250 ppp au lieu de 1 000 px de large) ; son texte n'est plus sélectionnable. C'était déjà le cas. | Inchangé |
| L'écran d'import lit un PDF d'un autre producteur sans le décoder : il sait dire la plus petite définition, pas l'ordre des pages. Si le PDF n'a pas une image par page aux proportions d'une page, il repasse par pdf.js (exact, plus lent). | Assumé, commenté dans le code |
| Copies déjà réduites | Non réparées (mandat) |
| Annotations | Non touchées. Leurs coordonnées sont normalisées (0 à 1) : la taille de la page ne les déplace pas. |
| Portes terrain | Aucune écrite. L'iPad reste à éprouver par Grégoire : ouvrir l'éditeur sur une vraie copie, inverser, enregistrer, zoomer dans Annoter. |

## 8. Incident de session

Cette session a démarré dans l'arbre principal (`/Users/kuekatsheu/Documents/GitHub/labo-codex`), où une autre session (`lot/gel-etape-7`) travaillait en même temps et a changé de branche pendant que j'écrivais. Mes changements non commités y ont séjourné d'environ 8 h 15 à 8 h 28 ; pendant ma contre-épreuve je les ai retirés puis remis une fois (`git stash` limité à `js/` et `styles.css`). Un passage d'essais de l'autre session lancé dans cet intervalle a pu tourner sur mon code. J'ai ensuite déplacé mon travail dans un arbre à part et retiré mes seuls changements de l'arbre principal (patch inversé, vérifié identique). Je n'ai touché à aucun fichier de l'autre session.

## 9. Ligne de Nouvelles proposée

> **Tes copies restent nettes.** Réordonner, retirer ou pivoter une page dans l'éditeur de pages ne réduit plus sa définition. Les Propriétés d'un fichier et l'écran d'import indiquent maintenant les dimensions en pixels de chaque page, PDF compris.

---

# Suite — mandat de Cowork de 9 h 00

## 10. Le PDF réuni à l'import

**Fait.** `pagesImagesDuFichier` (#880) rendait chaque page d'un PDF à 1 400 px au plus quand plusieurs fichiers d'un élève étaient réunis. Elle passe maintenant par le même moyen que l'éditeur, mis en commun (`imagesDuPDF`) : les octets de la page repris tels quels quand le PDF est de l'application, sinon un rendu à la définition de son image numérisée (250 ppp pour du texte). La page garde sa taille physique.

**« (aucun traitement) » est vrai partout où il s'affiche.** Un PDF seul n'est pas touché : il le dit toujours. Un PDF qui sera réuni à d'autres fichiers est réécrit dans le PDF commun : il dit maintenant sa définition suivie de **« (réuni en un seul PDF) »**. Mots neufs, à approuver.

**Essai** (dans `editeur-pages-definition-2026-11-15.spec.js`) : un élève fictif remet le PDF d'un numériseur, un PDF de l'application et une photo ; le PDF réuni a cinq pages, dans l'ordre, chacune à ses pixels (2 728 x 1 748, 1 700 x 2 200…) et à sa taille physique ; les pages du PDF de l'application y sont avec leurs octets. Rouge sur le code d'avant, vert après.

**Laissé.** Le test unitaire `sentinelle-880` jugeait l'ordre et la taille des pages sur des doublures de pdf.js et du canevas, qui ne décrivent plus le code : ces deux essais sont retirés et repris au navigateur, sur les vraies bibliothèques. Les deux autres essais du fichier restent. Un PDF de texte réuni pèse plus lourd qu'avant (250 ppp au lieu de 1 400 px) : c'est le prix de l'invariant.

## 11. La confirmation avant « Effacer la page »

**Fait.** `travauxAnnotation.effacerPage` pose la fenêtre de confirmation de l'application (`uiDialogues.confirmerAction`), aux mots de Grégoire, mot pour mot : « Effacer les 12 annotations de cette page ? » / « Effacer l'annotation de cette page ? » ; « Tu pourras les rétablir avec la flèche de retour arrière. » / « la rétablir » ; boutons « Annuler » et « Effacer ».

**Comment elle se combine avec le codex : une seule question, jamais deux.**

| État du codex | Ce qui s'affiche |
|---|---|
| À jour (le cas de Grégoire ce matin) | La fenêtre du codex ne s'affiche pas. La confirmation se pose. |
| En retard, ou aucun codex | La fenêtre du codex se pose (« Annuler » y arrête tout). Sur « Supprimer sans… » ou « Mettre à jour, puis supprimer », la page est effacée sans seconde question. |

C'est une décision de ma part : la fenêtre du codex demande déjà si l'on veut effacer, la confirmation derrière elle aurait fait deux questions pour un geste. Si Grégoire préfère les deux à la suite, c'est une ligne à retirer (`codexQuestionne`).

⚠ À lui signaler : la fenêtre du codex dit « "Effacer la page" efface pour de bon les annotations de cette page », alors que le retour arrière les rétablit. Ces mots existaient avant ce lot ; ils contredisent la ligne qu'il vient d'approuver. Je ne les ai pas touchés.

**Le retour arrière rétablit toujours la page** : vérifié dans les deux cas.

**Essais** (`effacer-la-page-confirmation-2026-11-15.spec.js`, trois) : codex à jour, les mots exacts, « Annuler » garde tout, « Effacer » efface, le retour arrière rétablit ; le singulier ; sans codex, la fenêtre du codex est la seule question. Les deux premiers sont rouges sur le code d'avant ; le troisième y est vert, c'est un essai de non-régression.

## 12. Le carrousel après un remplacement

**La cause, reproduite sur des copies fictives.** Le carrousel d'Annoter n'était refait que par deux chemins : la reconstruction générale (`afficherFichiers`) et le retour simple dans Annoter. Quand on arrive dans Annoter par un geste qui ouvre une copie (« Annoter » d'une ligne de la Liste, une vignette du profil), ces deux chemins sont sautés exprès, pour ne pas reconstruire la page sous l'ouverture qui vient. Le carrousel d'avant reste donc en place : il porte encore le badge de la copie partie à la corbeille, et pas celui de la copie réimportée. Toucher l'ancien badge demande un fichier qui n'existe plus : « [Travaux-Visionneuse] Fichier introuvable », toujours avec le même identifiant, et la copie précédente reste à l'écran. Un rechargement refait tout, ce qui concorde avec la précision de Grégoire (8 h 58).

Les deux pistes de Cowork : `_htmlBadgesGrille` est bien en cause (c'est le carrousel gardé en mémoire, avec celui de la page). `travaux-dernier-fichier` ne l'est pas : il est vérifié avant chaque réouverture.

**La correction.** À chaque ouverture d'une copie, `travauxUI.ouvrirFichier` compare les badges du carrousel aux copies d'aujourd'hui et le refait s'ils diffèrent (`_mettreLeCarrouselAJour`). Demander une copie qui n'existe plus ne change plus rien à l'écran : la copie affichée garde son badge actif.

**Essais** (`carrousel-apres-remplacement-2026-11-15.spec.js`, deux) : le scénario de Grégoire (corbeille, réimport, retour par « Annoter » de la Liste), le carrousel montre la nouvelle copie, elle s'ouvre, aucun « Fichier introuvable » ; et l'ouverture d'une copie partie. Rouges sur le code d'avant, verts après.

**Non reproduit.** La première erreur de son rapport, à 8 h 28 min 30 s, « sans toucher de sa part ». Ma reproduction n'en produit aucune sans toucher. Je ne sais pas quel geste l'a déclenchée.

**Observé, laissé.** Après une suppression, la visionneuse garde en mémoire la copie supprimée comme « copie ouverte » jusqu'à l'ouverture d'une autre. Les chemins qui la relisent vérifient déjà qu'elle existe (#881). Sans symptôme : non touché.

## 13. Ce que la suppression d'une copie fait de ses annotations et de son évaluation (constat, rien de changé)

| Geste | Fichier | Annotations | Évaluation |
|---|---|---|---|
| « Déplacer à la corbeille » (Liste) | À la corbeille 30 jours, restaurable | Gardées tant que la copie est à la corbeille ; effacées avec elle à la suppression définitive ou à l'expiration | Non touchée |
| « Supprimer ce fichier importé » (`supprimerFichierImporte`) | Effacé pour de bon, sans corbeille | **Non effacées : elles restent en base, sans fichier pour les lire** | Effacée avec le fichier si l'on confirme ; sinon rien n'est supprimé |

Deux conséquences pour un remplacement comme celui de Grégoire. La copie réimportée reçoit un nouvel identifiant : les annotations de l'ancienne ne la suivent pas (elles restent attachées à l'ancienne, à la corbeille). L'évaluation, elle, se retrouve par l'élève et la production : la copie réimportée retrouve l'évaluation existante.

Le second geste laisse des annotations orphelines, ce que #572 avait corrigé pour la corbeille seulement. Constat, sans symptôme vécu : je ne l'inscris pas, la décision revient à Cowork.

## 14. Jugé, et ce qui s'oppose selon moi à une mise en ligne aujourd'hui

**Jugé.** Vitest complet vert (926 fichiers, 11 805 essais : deux de moins, ceux retirés de `sentinelle-880`). Deux passages Playwright ciblés, verts : 55 essais (1 sauté, sur demande) puis 40 (1 sauté). Quatorze essais neufs au total sur la branche. **Non passé : la suite Playwright entière.**

Deux sentinelles mises à jour, à relire : `sentinelle-1007` (la question de « Effacer la page » est maintenant la confirmation) et le cliquet de complexité (`initialiserModuleTravaux` 37 → 34, par extraction).

**Ce qui s'oppose à une mise en ligne aujourd'hui**, par ordre de poids. C'est une lecture argumentée, pas un avis de pair.

1. **Le verdict complet n'est pas passé.** Le lot touche `travaux-ui.js`, `travaux-import.js` et `travaux-annotation.js`, trois fichiers que beaucoup d'essais traversent. C'est le seul obstacle que je tiens pour bloquant.
2. **Rien n'a été éprouvé sur l'iPad.** Les pages gardent maintenant leur pleine définition : l'enregistrement de l'éditeur et l'import réuni manipulent des fichiers bien plus lourds qu'avant (25,5 Mo au lieu de 1,5 dans ma mesure). Sur le Mac, c'est moins d'une seconde ; sur l'iPad, où une page a gelé ce matin, je n'ai aucun chiffre. Un essai de Grégoire sur une vraie copie de quatre pages, avant ou juste après la mise en ligne, lèverait ce doute.
3. **Aucune relecture croisée** de ces trois ajouts ni du premier lot.
4. **Trois textes ou décisions à approuver** : « (réuni en un seul PDF) », la règle « une seule question » avec le codex, la ligne de Nouvelles.

Ne s'y oppose pas, mais à savoir : la première erreur « sans toucher » du point 3 reste inexpliquée, et les copies déjà réduites le restent.

## 15. Ligne de Nouvelles révisée

> **Tes copies restent nettes.** Réordonner, retirer ou pivoter une page dans l'éditeur de pages, ou réunir plusieurs fichiers d'un élève à l'import, ne réduit plus la définition. Les Propriétés d'un fichier et l'écran d'import indiquent les dimensions en pixels de chaque page, PDF compris. « Effacer la page » demande maintenant une confirmation. Et après avoir remplacé la copie d'un élève, la bande des copies d'Annoter montre la nouvelle sans qu'il faille recharger la page.

## 16. Avant l'essai sur l'iPad (consigne de 9 h 31)

Approuvés par Cowork : « (réuni en un seul PDF) » et la règle d'une seule question. Annotations orphelines de « Supprimer ce fichier importé » : rien d'inscrit, rien d'effacé (décision relayée). La ligne de Nouvelles attend Grégoire.

**Les mots de la fenêtre du Codex avant « Effacer la page »** (`js/codex.js`, registre `PROPOSITIONS_AVANT_SUPPRESSION`, clé `annotationsPage`, la seule touchée) :

- avant : « « Effacer la page » efface pour de bon les annotations de cette page. Ton codex à jour pourra te les rendre, jusqu'à ta mise à jour suivante. »
- après : « « Effacer la page » efface les annotations de cette page. Tu pourras les rétablir avec la flèche de retour arrière. Ton codex à jour pourra te les rendre, jusqu'à ta mise à jour suivante. »

La deuxième phrase reprend celle que Grégoire a approuvée pour la confirmation. Laissé, à savoir : le titre et les boutons de cette fenêtre disent toujours « supprimer » (« Écrire un codex avant de supprimer ? », « Supprimer sans codex »), comme pour tous les gestes du registre. L'essai « sans codex » de `effacer-la-page-confirmation-2026-11-15.spec.js` juge maintenant les mots entiers de la fenêtre.

**Les gestes de l'iPad** : `plans de travail/GESTES-IPAD-2026-11-15-editeur-pages-definition.md`, six gestes. L'adresse de l'aperçu est dans la PR de la branche.

**Le build du pied de page ne distingue pas l'aperçu** : il vient de `version.js`, écrit par la release ; l'aperçu affiche donc celui de la 1.247.0. C'est l'adresse qui dit qu'on est sur l'aperçu.

## 17. Retouches après l'essai sur l'iPad (consigne de 11 h 52)

Essai de Grégoire sur l'aperçu n° 26 : gestes 1 à 5 réussis, geste 6 non fait.

**1. « Effacer la page » : toujours la confirmation simple** (décision de Grégoire, 11 h 44). `effacerPage` n'appelle plus la fenêtre du codex. Retiré : la clé `annotationsPage` du registre `PROPOSITIONS_AVANT_SUPPRESSION` (et donc les mots écrits au § 16), la variable `codexQuestionne`, la ligne P14 de la sentinelle 1007. La sentinelle verrouille maintenant l'inverse : `effacerPage` ne nomme plus `Codex`. L'essai « sans codex » juge la confirmation simple et compte zéro appel à la fenêtre du codex.

**2. La colonne « Originaux »**. Mesuré à 1180 x 820 : il restait 66 px aux mots, « min. 1632 x 3042 px » en demande 108. Deux moyens ensemble : la colonne passe de 250 à 300 px (116 px pour les mots), et la définition d'un PDF s'écrit en deux lignes d'un seul tenant. Mots retenus :

- « PDF, 4 pages » puis « min. 1632 x 3042 px » (pages de définitions différentes : la plus petite) ;
- « PDF, 2 pages » puis « 2728 x 1748 px » (pages pareilles) ;
- « PDF, 1 page » puis « Lettre » (page de texte) ;
- dans « Aperçu », une troisième ligne : « (aucun traitement) » ou « (réuni en un seul PDF) », inchangées.

« la plus petite : » devient « min. ». Changé aussi, à savoir : un PDF qui mêle pages numérisées et pages de texte ne dit plus que ses pages numérisées (avant : « 2 numérisées, … · 1 en texte, Lettre ») ; les Propriétés disent toujours chaque page. `direDefinitionPDF` est remplacée par `lignesDefinitionPDF`. L'essai de l'écran d'import se joue à 1180 x 820 et juge : deux lignes, aucune cassée, aucune plus large que sa place (rouge à 250 px, vert à 300).

**3. « Import refusé »** tutoie : « Choisis un groupe-cours dans l'en-tête, puis relance l'import. »

**4. L'écart de poids (9,8 Mo à l'import, 8,3 Mo aux Propriétés)**. Mesure : `tests/mesures/poids-apres-editeur.mjs`, copie fictive de quatre pages.

| Geste | Avant (octets) | Après (octets) | Écart |
|---|---|---|---|
| Import d'un PDF seul | 8 746 172 | 8 746 172, mêmes octets | 0 |
| Éditeur, PDF de l'application, pages réordonnées | 8 746 172 | 8 746 172 | 0 |
| Éditeur, PDF de l'application, une page pivotée | 8 746 172 | 8 669 360 | −0,9 % |
| Éditeur, PDF d'un autre producteur, pages réordonnées | 8 746 172 | 8 461 587 | −3,3 % |

Fait : l'import ne réécrit pas un PDF seul, « (aucun traitement) » dit vrai, et les deux écrans disent le poids par la même fonction (`TailleFichier.dire`) sur la même valeur. Fait : l'éditeur de pages réencode en JPEG (qualité 0,92) la page qu'on pivote, et toutes les pages d'un PDF qu'il ne sait pas reprendre octet pour octet ; les pixels sont gardés, le poids change. Inférence : l'écart vu vient du pivot de la page de 4403 x 3809 (la plus lourde), fait avant la lecture des Propriétés ; l'ampleur dépend de la qualité du JPEG d'origine. Je n'ai pas le fichier de l'essai : à confirmer par l'ordre des gestes. Rien de corrigé : il n'y a ni réécriture à l'import ni désaccord de calcul. Un pivot sans réencodage (rotation écrite dans le PDF) est possible ; c'est un autre lot, non inscrit.

**Inscrit** : #1283, le mode démonstration sans entrée visible (tel que dit par Grégoire, non mesuré au code).

**Trouvé en chemin, hors lot, non inscrit** : l'essai « une copie réunie survit au rechargement » (`reunir-en-une-copie-1231.spec.js`) est instable, sur `main` aussi (1 rouge sur 28 passages sur `main`, 2 sur 24 sur la branche) : une coche touchée pendant un rafraîchissement de la liste se perd. Il peut rougir au verdict complet.

**Jugé** : sentinelle 1007 verte ; passage ciblé de 40 essais (import, palette d'annotation, confirmation, carrousel) : 38 verts, 1 sauté, 1 instable (celui-là) ; `editeur-pages-definition` 9 sur 9.
