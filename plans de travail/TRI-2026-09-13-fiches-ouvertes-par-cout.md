# Tri des fiches ouvertes par coût de preuve – 13 septembre 2026

> Pendant markdown de l'artefact « Tri du chantier Labo Codex » (la TRACE ; l'artefact porte l'OPÉRATION).
> **Mis à jour le 13 sept. en début d'après-midi** – trois lots menés, deux livrés. Comptes vérifiés sur `BACKLOG.md` **de `main`** : 235 cases ouvertes moins le gabarit de la section « Notes » = **234 fiches**, concordance exacte.
> Les questions qui attendent une réponse de Grégoire ne sont pas dans ce document : elles sont dans `plans de travail/QUESTIONS-EN-ATTENTE-2026-09-13.md`, fermées et chiffrées.

## Journal des lots

### Lot 1 – « les jetons de reprise ne mentent plus » ✅ LIVRÉ en 1.139.3

Choisi pour son coût de preuve le plus bas à demande d'attention nulle. Quatre fiches taries (#617, #720, #724, #725) ; la cinquième candidate (#721) **sortie avant codage** – arbitrage de didactique, et risque d'étendre le chantier à trois fichiers. Relecture croisée (`828618b1`) : cinq mutations refaites indépendamment, **trois trous de preuve** trouvés (une moitié de garde qu'aucun essai n'éprouvait, le déliement après écriture acceptée non prouvé, six assertions infalsifiables par construction du harnais). Les trois retouches ont été appliquées (`1c17f5dd`) avant la release.

### Hors séquence – #853 « permettre un délai sur une reprise » ✅ LIVRÉ en 1.140.0

Née de la relecture du lot 1 : une question de pédagogie y était « posée à Grégoire » sans être inscrite nulle part. Inscrite, tranchée par lui (« la question dépend de l'utilisateur, je ne veux pas imposer ma pratique à moi »), puis codée. **Deux relectures ont été nécessaires.** La première a trouvé que le moteur était juste mais que **l'interface mentait** : sur une pratique née de l'assistant, la case s'affichait, se cochait, s'enregistrait – et le moteur ne la lisait jamais. La seconde a vérifié le correctif (une note dit désormais que le formulaire est inerte) et a trouvé deux restes : un essai qui passait **à vide** parce que le faux DOM ne portait pas l'état initial de la vraie page, et un cas mixte où l'écran affichait encore des nombres qui ne s'appliquent pas. Corrigés avant la release.

⮕ La cause profonde reste ouverte sous **#854** : le moteur lit la configuration de l'assistant en premier, le formulaire de gestion n'est jamais consulté pour ces pratiques.

### Lot 2 – « la chaîne anti-cache dit la vérité sur ce qu'elle a vérifié » ✅ LIVRÉ en 1.140.1

Choisi sous la règle du 13 sept. : il ne touche que `scripts/` et `tests/`, donc aucun écran à vérifier et aucun arbitrage. Quatre fiches fermées (#675, #547, #600, #826) ; de #602, seule la moitié *lecture* est livrée (les gardes voient désormais les chemins qu'elles ne couvraient pas et les nomment) ; #827 **sortie avant codage** (symptôme conditionnel à une décision que rien n'exige).

Relecture croisée : sept mutations posées indépendamment, **aucune ne survit**, et le garde a été éprouvé en situation réelle (index vide → il ne bloque pas et le dit ; fichier stagé sans jeton → il refuse en nommant le jour du build). Un seul trou, ironique : **le défaut que le lot corrigeait survivait dans son propre repli** – sur un dépôt jeune, le repère retombait sur le commit courant et deux fichiers restaient sous leur ancienne URL, en silence. Retouché avant la release (`d16a61c4`).

⮕ Relu au **sommet de la branche**, pas au commit nommé : elle avait avancé de deux commits, dont le correctif d'un incident où un banc de test écrivait dans le vrai `.git/config` sous le hook pré-push (#856). Config du dépôt vérifiée saine après coup.

### Lot 3 – les interventions ▣ CONSIGNE PRÊTE, PAS ENGAGÉ

Demandé comme « le lot qui touche `js/interventions.js` (6/6) ». **La mesure au code l'a réduit à deux gestes dans un seul fichier, sans une seule question** : les interventions d'un élève suivent son groupe-cours dans son profil comme elles le font déjà dans la liste, et un seuil de dépistage réglé à zéro cesse d'être remplacé en douce par la valeur du projet.

Ce que la mesure a corrigé de ma propre grille – **deux des six fiches ne sont plus dans ce fichier** : les seuils d'alerte ont déménagé le 10 sept. (#742 vit maintenant dans `js/contexte-qualification.js`) et le dépistage SOLO le 27 août. **#542 doit être cochée** : ses deux derniers pas sont livrés et verrouillés par des bancs, ses traînes de données sont portées par trois autres fiches, et son unique reste est la question de #551 dite une seconde fois. #836 attend son mois d'usage, pas un arbitrage. #847 est une décision d'une phrase, pas un défaut.

## Ce que valent les goulots de ce tri – deuxième avertissement, mesuré

La contre-épreuve du matin avait déjà trouvé un goulot faux (#689). Le lot 3 en a trouvé **deux de plus**, et de la même cause : **le goulot a été lu dans la fiche, pas mesuré dans le code**. Une fiche ne suit pas le code quand celui-ci déménage.

⮕ Règle qui en découle, appliquée depuis : **avant d'ouvrir un lot, vérifier que ses fiches vivent encore dans le fichier qu'elles nomment.** C'est une mesure de trente secondes qui, deux fois sur trois lots, a changé la composition du lot.

## La grille

Le palier ne mesure pas la taille du changement, mais **la preuve à produire avant de livrer**.

- **Q – rapide** : des mots, un affichage, une garde locale. Aucune donnée en base, aucune règle de calcul ne change. Une session le prouve seule.
- **I – intermédiaire** : un comportement change, dans un seul module. Comparaison avant/après, souvent une rangée de porte terrain.
- **L – laborieuse** : `données déjà écrites` chez les utilisateurs (« source, stock, ou les deux ? »), `zone protégée`, ou `trois modules et plus` / un format de données.

« Attend une décision de Grégoire » n'est PAS un palier : c'est un **second axe** (*qui doit parler en premier*). Appliqué comme palier, il mettait 56 % des fiches dans « laborieux » – dont 54 qui ne sont lourdes que par l'attente.

**Règle de sélection des lots (Grégoire, 13 sept.)** : prendre ceux qui ne lui demandent **ni arbitrage ni vérification à l'écran**. Ce qui attend une décision se range dans le fichier des questions, pas dans la conversation.

**Ce qu'un lot doit porter, appris des trois relectures** : pour chaque correctif, **la mutation qui ISOLE** le contrôle neuf. Un essai peut passer *pour la mauvaise raison* – un autre garde-fou intercepte avant celui qu'on croit éprouver – ou passer *à vide*, quand le harnais garantit lui-même ce que l'assertion prétend vérifier. Les trois lots ont chacun livré un cas des deux.

## Les comptes – 13 septembre, début d'après-midi

| | fiches |
|---|---:|
| Q – rapides | 43 |
| I – intermédiaires | 85 |
| L – laborieuses | 101 |
| indécidables en l'état | 5 |
| **encore ouvertes, en tout** | **234** |
| dont en attente d'un arbitrage | 80 |
| ✅ livrées depuis le tri | 9 |

Portée des arbitrages en attente : 17 se règlent par une phrase, 25 demandent un écran ou ses données, 13 ouvrent un chantier.

## Ce que vaut ce tri (contre-épreuve)

Le palier de chaque fiche est **lu dans la fiche**, pas mesuré dans le code. Contre-épreuve adverse sur huit fiches reprises au code : **trois cotes fausses** (#690 périmée depuis 1.110.0, #655 → `I`, #595 → `L/multi`) et un goulot faux (#689). Les quatre erreurs venaient de la fiche, aucune de la grille. Corrections appliquées ci-dessous.

⚠ **Bon pour composer un lot, insuffisant pour promettre un coût.** Les trois lots menés l'ont confirmé à chaque fois : la mesure au code a corrigé la fiche – #600 à moitié périmée, #675 et #547 qui sont le même geste, #602 dont seule la moitié *lecture* était livrable, #742 et #542 qui avaient changé de fichier, #746 déjà réparée à moitié.

## Les lots – même point du code

### `index.html` – 9 ouvertes sur 9

*Aide › Référence rapide · chargement des fichiers et 7 autres écrans*

- **Q** Le glossaire réduit la PAN à « garder les N meilleurs travaux » (#803)
- **Q** Un fichier neuf peut entrer sans jamais être chargé, en silence (#657)
- **I** Le style inline d'index.html écrase 13 classes de mise en forme – à Grégoire : choix de produit, à froid ; à revérifier (#766)
- **I** 22 balises perdent en silence leur seconde classe de mise en forme – à Grégoire : choix de produit, à froid (#787)
- **I** Le canal pour donner son avis existe, mais rien ne le laisse deviner (#801)
- **I** Un ancien éditeur caché duplique les identifiants de la page (#520)
- **I** Ajouter les deux guides manquants (#439)
- **I** Des règles CSS dupliquées créent des écarts d'affichage (#297)
- **L** Les emojis rendent mal sur iPad – trois modules et plus (#286)

### `js/echelles.js` – 9 ouvertes sur 9

*Conception › Échelles (A2025) · Conception › Échelles et 6 autres écrans*

- **Q** Renommer les deux échelles homonymes – à Grégoire : ses données, à froid (#450)
- **I** Ouvrir la section des échelles écrit en base sans qu'on ait rien touché (#659)
- **I** On ne peut plus créer un niveau qui ne compte pas dans la note – à Grégoire : pédagogie, une phrase (#546)
- **I** Un niveau neuf naît avec des valeurs choisies par le projet – à Grégoire : pédagogie, à froid (#574)
- **L** Un bouton « Modifier » est dessiné dans une zone que personne ne voit – trois modules et plus (#658)
- **L** Supprimer une échelle laisse des évaluations orphelines – données déjà écrites, trois modules et plus (#624)
- **L** Dupliquer par la barre latérale crée deux jumelles confondues – trois modules et plus (#586)
- **L** Les niveaux d'échelle sont partagés entre tous les trimestres – données déjà écrites ; à revérifier (#601)
- **L** Des noms venus d'un fichier partagé s'affichent sans être échappés – trois modules et plus (#467)

### `js/profil-etudiant-calculs.js` – 9 ouvertes sur 9

*note globale au profil · Suivi › Profil (barres et IPB) et 7 autres écrans*

- **I** Sans texte de rétroaction, la note globale n'affiche aucun niveau (#718)
- **I** Un critère noté en points est lu comme un niveau approximatif – à Grégoire : pédagogie, une phrase (#739)
- **I** Un critère « Aucun » reste un défi partout sauf dans l'IPB – à Grégoire : pédagogie, une phrase (#740)
- **I** Une évaluation sans texte final sort du dépistage mais compte dans la note (#741)
- **I** Le statut de décrochage n'atteint jamais la cible d'intervention – à Grégoire : pédagogie, une phrase (#554)
- **I** Sans donnée convertible, la moyenne affiche 0 au lieu de « rien » – à revérifier (#536)
- **L** La note des standards se construit sur le portfolio, pas sur les cibles – à Grégoire : arbitrage à préciser ; trois modules et plus (#810)
- **L** Trois façons de retrouver une échelle, trois résultats possibles – à Grégoire : arbitrage à préciser ; trois modules et plus (#590)
- **L** Un critère dont le nom varie disparaît du dépistage – à Grégoire : arbitrage à préciser ; trois modules et plus ; à revérifier (#553)

### `js/evaluation-calcul.js` – 6 ouvertes sur 6

*rétroaction imprimée · correction algorithmique et 4 autres écrans*

- **Q** Un critère sans niveau imprime « -- » sur la rétroaction de l'élève – à Grégoire : pédagogie, une phrase (#702)
- **I** Une copie sans faute ne peut pas être notée en mode catégories – à Grégoire : pédagogie, une phrase (#704)
- **I** Un critère « Français écrit » reçoit le texte générique (#686)
- **L** Une note pile entre deux bornes monte l'élève d'un niveau – à Grégoire : pédagogie, à froid ; trois modules et plus (#701)
- **L** Une grille analytique calcule en holistique si le critère n'a pas de type – à Grégoire : arbitrage à préciser ; trois modules et plus (#703)
- **L** Modifier une grille rend « incomplètes » des évaluations déjà remises – à Grégoire : arbitrage à préciser ; données déjà écrites (#705)

### `js/evaluation-jetons.js` – 1 ouvertes sur 6

*reprise sur copie remplacée · retirer une reprise et 4 autres écrans*

- ✅ **Q** Une reprise née d'une copie remplacée disparaît du calcul *(livré 1.139.3)* (#724)
- ✅ **Q** « Originale restaurée » s'affiche même quand l'enregistrement échoue *(livré 1.139.3)* (#725)
- ✅ **Q** Le fichier part à la corbeille même quand l'enregistrement est refusé *(livré 1.139.3)* (#617)
- ✅ **I** Un délai accordé est décompté deux fois après une reprise *(livré 1.139.3)* (#720)
- ✅ **I** Permettre un délai sur une reprise devient un réglage de la pratique – à Grégoire : pédagogie, une phrase *(livré 1.140.0)* (#853)
- **L** Les jetons se mélangent entre trimestres et échappent aux archives – trois modules et plus, données déjà écrites (#721)

### `js/import-export.js` – 6 ouvertes sur 6

*réinitialisation complète · partage et réception d'un document et 3 autres écrans*

- **Q** Deux rechargements de page restent nus, par choix assumé – à revérifier (#800)
- **Q** Rien ne dit qu'un document reçu est une copie (#696)
- **I** Une pratique importée garde une référence vers une échelle renumérotée (#664)
- **I** Des cartouches importées atterrissent hors du trimestre (#655)
- **L** Après un import, une copie peut pointer vers une cartouche disparue – trois modules et plus (#654)
- **L** Un champ importé trop long laisse passer un début de balise HTML – trois modules et plus (#585)

### `js/modes.js` – 6 ouvertes sur 6

*profil sous une pratique importée · tableau de bord d'un groupe et 4 autres écrans*

- **I** Une pratique importée s'affiche « configuration absente » (#712)
- **L** Un groupe sans pratique affiche quand même une note, par deux règles – à Grégoire : pédagogie, une phrase ; trois modules et plus (#710)
- **L** Un ancien identifiant de pratique fait calculer deux notes différentes – à Grégoire : arbitrage à préciser ; données déjà écrites (#711)
- **L** En anonymisation, le volet confidentiel affiche les vraies données – à Grégoire : arbitrage à préciser ; trois modules et plus (#751)
- **L** Un enregistrement raté peut afficher « enregistré » – trois modules et plus (#786)
- **L** « Enregistré » s'affiche alors que rien n'a été écrit – trois modules et plus (#618)

### `js/interventions.js` – 5 ouvertes sur 5

*Suivi › Interventions · Suivi › Rencontres et 3 autres écrans*

- **Q** Deux exemples du formulaire citent les critères de Grégoire (#847)
- **L** Restes du chantier Rencontres à trancher après un mois d'usage – à Grégoire : choix de produit, un chantier ; trois modules et plus (#836)
- **L** Les interventions d'un groupe affichent celles de tous les groupes – trois modules et plus, données déjà écrites *(moitié « liste » livrée le 12 sept. ; moitié « profil » dans le lot 3)* (#746)
- **L** Le risque d'un élève se calcule sur les seuils d'un autre enseignant – à Grégoire : pédagogie, un chantier ; trois modules et plus *(garde seule dans le lot 3 ; le renommage attend une réponse)* (#551)
- **L** Le dépistage suppose l'échelle de Grégoire – à Grégoire : arbitrage à préciser ; trois modules et plus *(à cocher : pas 3 et 4 livrés, son reste EST la question de #551)* (#542)

### `js/bibliotheque-ui.js` – 4 ouvertes sur 4

*bibliothèque des pratiques · import dans les bibliothèques et 2 autres écrans*

- **I** Trois modèles sur cinq disparaîtraient si on uniformise le filtre démo (#692)
- **L** Après un import, rien ne conduit l'œil à l'item ajouté – trois modules et plus (#793)
- **L** Vingt-deux fonctions « Dupliquer » différentes restent à fusionner – à Grégoire : ses données, à froid ; données déjà écrites, trois modules et plus (#476)
- **L** Comparer deux doublons côte à côte et fusionner – à Grégoire : choix de produit, un chantier ; trois modules et plus (#291)

### `js/productions.js` – 4 ouvertes sur 4

*Travaux › Productions · formulaire d'une production et 2 autres écrans*

- **I** Supprimer la production affichée laisse un surlignage mort (#633)
- **I** Ajouter consignes détaillées, format et modalités de remise – à Grégoire : choix de produit, à froid (#279)
- **L** La garde contre les productions du mauvais trimestre ne mord plus – à Grégoire : choix de produit, à froid ; données déjà écrites (#548)
- **L** Verrouiller une production est impossible, et le verrou n'interdirait rien – à Grégoire : arbitrage à préciser ; trois modules et plus (#489)

### `js/snapshots.js` – 4 ouvertes sur 4

*indice C au tableau de bord · indice C historique et 2 autres écrans*

- **I** Le taux de remise d'un groupe peut dépasser 100 % (#726)
- **I** Un travail formatif compte comme un travail dû (#727)
- **L** L'historique de performance n'est pas la note du cours – trois modules et plus, données déjà écrites (#716)
- **L** Les captures déjà écrites gardent un 0 pour une note inexistante – à Grégoire : arbitrage à préciser ; données déjà écrites (#777)

### `js/tableau-bord-apercu.js` – 4 ouvertes sur 4

*Suivi du groupe › barre Assiduité · Suivi du groupe › Détails et 2 autres écrans*

- **Q** Sans périodes saisies, la barre Assiduité reste vide sans rien dire (#830)
- **I** Un filtre trie sur un nombre qu'aucun écran n'affiche – à Grégoire : pédagogie, une phrase (#828)
- **I** La moyenne d'assiduité n'est pas la même sur deux écrans – à Grégoire : pédagogie, une phrase (#750)
- **I** Faut-il rétablir un repli qui n'a jamais rien trouvé ? – à Grégoire : pédagogie, une phrase (#634)

### `js/contexte-qualification.js` – 3 ouvertes sur 3

*profil d'élève – contexte d'apprentissage · tableau de bord et profil d'élève et 1 autres écrans*

- **I** Un palier d'alerte existe dans le code mais ne s'affiche jamais – à Grégoire : pédagogie, à froid (#822)
- **L** Les mots des bandes de couleur ne s'appuient sur rien de nommé – à Grégoire : arbitrage à préciser ; trois modules et plus (#821)
- **L** Les seuils d'alerte des interventions sont écrits en dur – à Grégoire : pédagogie, à froid ; trois modules et plus *(goulot corrigé : la règle a déménagé le 10 sept.)* (#742)

### `js/indices.js` – 3 ouvertes sur 3

*assiduité avec présences facultatives · profil d'un élève exclu et 1 autres écrans*

- **I** Une présence facultative compte en heures, pas en périodes (#728)
- **I** Un élève exclu est quand même calculé, avec une autre règle (#745)
- **L** Un élève sans aucune séance saisie affiche 100 % d'assiduité – trois modules et plus (#743)

### `js/main.js` – 3 ouvertes sur 3

*démarrage · export du plan d'alignement et 1 autres écrans*

- **Q** Retirer le rattrapage temporaire d'un vieux backup (#428)
- **I** Retirer la reprise temporaire des rétroactions de leçon (#430)
- **L** Un nouveau trimestre reste vide, et une suppression vaut pour tous – à Grégoire : arbitrage à préciser ; données déjà écrites (#683)

### `js/partage-schemas.js` – 3 ouvertes sur 3

*partager une échelle · partager une grille*

- **L** Les seuils de maîtrise ne voyagent pas avec l'échelle – trois modules et plus (#680)
- **L** Le fichier partagé ne dit pas de quel trimestre viennent les cartouches – trois modules et plus (#643)
- **L** Partager une échelle perd ses deux repères de maîtrise – à Grégoire : engagement public, une phrase ; trois modules et plus (#583)

### `js/pratiques/pratique-configurable.js` – 3 ouvertes sur 3

*note en dénotation · assistant de pratique et 1 autres écrans*

- **I** Réordonner les cibles plafonne la note des élèves à 59 sans un mot (#717)
- **L** Les reprises se configurent mais ne changent aucune note – à Grégoire : pédagogie, un chantier ; trois modules et plus (#324)
- **L** La pratique hybride ne reproduit pas la note officielle – à Grégoire : arbitrage à préciser ; données déjà écrites, trois modules et plus (#339)

### `js/profil-etudiant-actions.js` – 3 ouvertes sur 3

*profil d'un élève de service · note du cours (tous les artefacts) et 1 autres écrans*

- **I** Un service sans pratique pourrait afficher une note de portfolio – à Grégoire : pédagogie, une phrase (#839)
- **I** Deux écrans calculent deux notes différentes (#715)
- **L** Comparer côte à côte la note selon plusieurs pratiques – trois modules et plus (#307)

### `js/reserve.js` – 3 ouvertes sur 3

*Données › Archiver un trimestre · rouvrir une archive et 1 autres écrans*

- **Q** Le moratoire sur l'archivage tient tant qu'il n'est pas levé – à Grégoire : ses données, à froid ; à revérifier (#622)
- **L** Des cartouches archivées n'apparaissent pas dans la liste – trois modules et plus (#637)
- **L** Consulter une archive sans la désarchiver – trois modules et plus (#257)

### `js/travaux-ui.js` – 3 ouvertes sur 3

*Évaluations › annoter une copie · Travaux › Importer et Exporter et 1 autres écrans*

- **I** Annoter depuis la liste ouvre la copie sans aucune palette (#651)
- **L** Six clés de session sans préfixe de trimestre peuvent se mélanger – trois modules et plus (#596)
- **L** La balance des blancs s'applique aux photos sans aperçu – trois modules et plus (#598)

### `scripts/release.mjs` – 2 ouvertes sur 3

*pages du design system · publication d'une version*

- **Q** Les pages du design system chargent la feuille de style sans jeton *(sortie du lot 2 : symptôme conditionnel à une décision que rien n'exige)* (#827)
- ✅ **I** La release et sa sentinelle ne comptent pas les mêmes fichiers *(livré 1.140.1)* (#675)
- **L** Un fichier périmé reste servi sans qu'aucun contrôle ne le dise – trois modules et plus *(moitié « lecture » livrée en 1.140.1 ; poser les jetons reste)* (#602)

### `styles.css` – 3 ouvertes sur 3

*pages à barre latérale sur iPad · apparence de toute l'application et 1 autres écrans*

- **I** Deux pages restent serrées sous 1024 px (#283)
- **L** Cent douze couleurs appellent une variable qui n'existe pas – trois modules et plus (#813)
- **L** 78 variables jamais définies : bordures et alertes sans couleur – trois modules et plus (#595)

### `tests/integration/` – 3 ouvertes sur 3

*suite de tests · intégration continue*

- **Q** Deux tests rouges en suite, verts isolés – à revérifier (#523)
- **Q** Un test ne passe qu'au second essai (#685)
- **I** Des tests rouges au hasard sur le serveur, verts en local (#833)

## Le reste – fiches isolées ou sans fichier nommé

### module Rythme

- **I** Emporter son portrait temporel hors de l'app (#269)
- **I** Ouvrir une activité du portrait pour voir le détail (#270)
- **?** Voir si l'on évalue plus vite d'une activité à l'autre (#268)
- **?** Planifier plusieurs productions à corriger (#271)

### assistant de pratique

- **I** L'assistant ne demande pas d'abord si on sait ce qu'on veut (#484)
- **L** Une échelle embarquée ne peut pas recevoir ses repères – trois modules et plus (#579)

### bilan PDF de l'élève

- **I** Le bilan PDF juge « faible » et « maîtrisé » avec les lettres IDME (#575b)
- **L** Le bilan juge « maîtrisé » avec les lettres IDME en dur – à Grégoire : arbitrage à préciser ; trois modules et plus (#575)

### ouverture d'une évaluation

- **I** Deux chemins d'ouverture amputent l'échelle de ses champs neufs (#580)
- **L** Ouvrir une évaluation échoue par intermittence – trois modules et plus (#272)

### parcours de rentrée

- **Q** Le badge « X/5 configurés » compte mal (#475)
- **Q** Polir les détails d'interface du parcours de rentrée (#478)

### CI, hors application

- **I** Le verdict des tests navigateur dépend du hasard du plafond de temps – à Grégoire : choix de produit, une phrase (#788)

### Cadre du trimestre

- **L** Absorber un calendrier réémis après une grève – à Grégoire : choix de produit, un chantier ; données déjà écrites, trois modules et plus (#378)

### Cadre › Cours (+ Nouveau cours)

- **I** Sur un service, « + Nouveau cours » ouvre un formulaire Enseignement (#843)

### Cadre › Cours et Groupe-cours

- **I** Deux libellés annoncent l'horaire facultatif alors qu'il est exigé (#848)

### Cadre › Cours – supprimer

- **I** Un service créé par erreur ne peut pas être supprimé dans l'application (#844)

### Cadre › horaire

- **I** Annuler une modification d'horaire ne l'annule pas vraiment (#477)

### Carte d'alignement

- **L** La carte ne dit pas quelles productions sont évaluées mais non planifiées – à Grégoire : arbitrage à préciser ; trois modules et plus (#425)

### Comparateur de pratiques

- **Q** Une reprise « sans pénalité » garde la dernière note, sans le dire (#588)

### Conception (4 sections)

- **L** L'ancien système des quatre sections traîne sous l'interface – trois modules et plus (#628)

### Conception (4 écrans)

- **I** Astérisques sans légende et cibles trop petites (#519)

### Conception (points mineurs)

- **I** Les derniers points mineurs du plan Conception (#629)

### Conception › pratiques

- **I** Retirer le mode « par objectifs », qui n'est plus atteignable (#592)

### Créer mon service

- **L** Un élève déjà inscrit à un autre cours n'entre pas dans un service – à Grégoire : arbitrage à préciser ; trois modules et plus (#838)

### Labo › Exploration des pratiques

- **L** Finir le banc de comparaison et le remettre en vue – zone protégée, trois modules et plus (#326)

### Labo › Outils d'observation (démo)

- **I** En démo, choisir une grille de dépistage écrase le vrai choix (#829)

### Organisateur de leçons

- **L** L'Organisateur oblige à défiler sans fin – trois modules et plus (#140)

### Profil › Développement des habiletés

- **I** Le panneau des habiletés annonce le mauvais nombre d'artefacts (#714)

### Présences et Interventions (anonymisation)

- **L** Le mode anonymisation n'arrête pas l'écriture des présences – trois modules et plus (#736)

### Saisie des présences

- **Q** L'en-tête de la colonne Présence existe en double – à revérifier (#783)

### Suivi du groupe

- **L** Sortir les résultats finaux en PDF – à Grégoire : mots des élèves, à froid ; trois modules et plus (#333)

### Suivi › Profil (carte RàI)

- **?** Le même élève reçoit deux paliers RàI différents sur un même écran – à Grégoire : pédagogie, à froid (#744)

### Trimestre › recoupement horaire

- **I** Le devis compte les heures comme si une période durait une heure (#582)

### aide contextuelle

- **L** Le comparateur et l'import inter-trimestre n'ont aucune aide – à Grégoire : choix de produit, à froid ; trois modules et plus (#364)

### analyse longitudinale

- **L** Comparer quatre trimestres pour mesurer l'effet du RàI – à Grégoire : pédagogie, un chantier ; trois modules et plus (#36)

### annotation d'une copie

- **I** Retirer toutes les annotations laisse l'ancien compte d'erreurs (#700)

### anonymisation avant partage

- **L** Décider si l'anonymisation doit rester réversible – à Grégoire : engagement public, un chantier ; trois modules et plus (#591)

### attribution CC

- **L** Des pratiques de Grégoire portent le nom d'un autre enseignant – données déjà écrites (#342)

### aucun écran

- **Q** Retirer 290 lignes de portfolio qu'aucun écran n'appelle (#722)

### banc d'essai

- **Q** Le corpus d'essai produit des notes peu réalistes (#480)

### bibliothèque des pratiques

- **L** Des pratiques inventées portant des prénoms de collègues sont servies – données déjà écrites ; à revérifier (#690)

### bibliothèque des pratiques (SPE)

- **Q** Une structure morte survit avec un seul modèle dedans (#688)

### cadre d'alignement

- **Q** Le cadre décrit un monde que l'application ne montre pas (#589)

### calcul de la note

- **L** La note calculée ne correspond pas à la pratique configurée – trois modules et plus (#465)

### carte d'alignement › Inspecteur

- **I** L'Inspecteur affiche « semaine 3 » au lieu de la date réelle (#695)

### changement d'identifiant d'un cours

- **L** Une fiche ré-identifiée laisse ses productions en arrière – données déjà écrites, trois modules et plus (#346)

### changement de trimestre

- **I** Confirmer que les productions ne changent plus de trimestre (#340)

### courbe d'impact d'une intervention

- **Q** L'effet d'une intervention se mesure depuis le début du trimestre (#729)

### courbe de progression

- **I** Voir sur la courbe l'effet d'une intervention (#245)

### courbes d'intervention

- **I** Un jeton de reprise réécrit P et masque l'effet – à Grégoire : pédagogie, à froid (#241)

### création d'un service

- **I** Le groupe d'origine d'un élève disparaît quand il entre dans un service – à Grégoire : choix de produit, une phrase (#837)

### créer grilles, échelles, cartouches

- **L** Des alertes bloquantes jalonnent les premiers pas – trois modules et plus (#678)

### diagnostic d'une évaluation

- **I** L'application traite comme anomalie un arrondi voulu (#543)

### diagnostics du profil

- **I** Le seuil qui décide qu'un critère est une « force » n'est pas réglable – à Grégoire : pédagogie, à froid (#677)

### divers écrans

- **L** Quatre fragilités éparses : ids, modales jumelles, borne de purge – trois modules et plus (#481)

### documentation

- **Q** Quatre documents de janvier décrivent une app qui a changé (#471)

### documentation enseignants

- **Q** Aucun guide écrit remis aux enseignants – à Grégoire : engagement public, un chantier (#2)

### documentation interne

- **Q** La doc des pratiques date de janvier et cite un fichier disparu (#804)

### dupliquer une grille partagée

- **I** Une grille dupliquée garde l'échelle d'origine – à Grégoire : choix de produit, une phrase (#656)

### dépistage RàI

- **L** Un brouillon compte comme une copie remise et évaluée – à Grégoire : pédagogie, une phrase ; trois modules et plus (#737)

### dépôt de code

- **L** Six dossiers de retours nominatifs de collègues voyagent avec le dépôt – à Grégoire : choix de produit, un chantier ; trois modules et plus (#694)

### enregistrements automatiques

- **L** Deux enregistrements simultanés peuvent s'écraser – trois modules et plus (#522)

### envoi d'un rapport de bug

- **Q** Un rapport envoyé le soir porte la date du lendemain (#812)

### export au format recherche

- **L** L'export ne dit pas où sont placées suffisance et maîtrise – trois modules et plus (#584)

### export des résultats

- **Q** L'export arrondit la note, le profil affiche une décimale (#723)

### fenêtre de suppression d'une ressource

- **Q** La fenêtre affiche les avertissements de la suppression précédente (#653)

### fiche d'un élève dans le Cadre

- **I** La « mesure d'aide » d'un élève ne s'entre que par import CSV – à Grégoire : choix de produit, une phrase (#792)

### fiche d'un élève et assiduité

- **L** Un élève arrivé en cours de trimestre hérite des absences d'avant – à Grégoire : pédagogie, à froid ; données déjà écrites, trois modules et plus (#735)

### fiche d'un élève et profil individuel

- **L** Le programme d'un élève s'affiche vide sur sa fiche – trois modules et plus (#707)

### fichier archivé

- **Q** Un fichier archivé réémettrait l'événement de démarrage (#417)

### filet de tests

- **I** Rien n'empêche un élément du HTML d'être effacé par un rendu JS (#784)

### formulaire d'une production

- **L** Rendre aux artefacts la grille, l'échelle et la cartouche effacées – données déjà écrites (#453)

### graphique de progression

- **I** Le graphique colore ses zones avec une échelle devinée (#575c)

### hors application

- **L** L'historique git contient encore des exports d'élèves réels – à Grégoire : engagement public, à froid ; trois modules et plus (#781)

### import d'un codex

- **L** Repointer les productions vers les grilles renumérotées – données déjà écrites (#454)

### import d'un codex et calendrier

- **L** Six décisions en attente de l'audit du 5 août – à Grégoire : choix de produit, un chantier ; données déjà écrites, trois modules et plus (#393)

### import d'un codex volumineux

- **I** Un import échoue quand l'iPad est presque plein – à revérifier (#334)

### import d'un trimestre historique

- **I** Le trimestre H2024 manque comme point de départ – à Grégoire : ses données, à froid (#35)

### import d'une archive ou d'un partage

- **L** Quatre imports renumérotent les identifiants de quatre façons – trois modules et plus (#627)

### import de travaux

- **I** Assembler les photos multiples d'une même copie (#178)

### import de travaux (doublons)

- **L** Retirer « Renommer pour distinguer » et son legacy – trois modules et plus (#615)

### import des travaux de Léa

- **I** Importer un dossier Léa complet et associer par DA (#177)

### importer une échelle

- **I** Importer une échelle d'un autre trimestre perd sa provenance (#479)

### infobulles d'aide

- **Q** Couvrir d'infobulles la construction de la note et l'Aide – à Grégoire : pédagogie, à froid (#18)

### journal de bord

- **I** La croix du journal est trop petite et rien d'autre ne le ferme (#814)

### le formulaire des jetons d'une pratique

- **L** Sur une pratique née de l'assistant, le formulaire des jetons n'est pas lu – à Grégoire : choix de produit, à froid ; trois modules et plus (#854)

### livraison d'une version

- ✅ **I** Deux sessions peuvent servir deux contenus sous la même adresse (#826)

### matériel de départ

- **Q** Deux fonctions disent « générique » alors qu'elles sèment « de départ » (#689)

### migration des cartouches

- **Q** Deux fonctions de même nom : celle qui paraît publique est morte (#641)

### modifier un élève (ancien formulaire)

- **Q** Modifier un élève par l'ancien chemin planterait (#791)

### module Alignement

- **Q** Aucune carte mentale d'exemple pour la formation – à Grégoire : engagement public, un chantier (#274)

### nettoyage interne

- **L** Retirer les anciens systèmes de pratiques, grilles, échelles – trois modules et plus (#469)

### noms des grilles de départ

- **L** Le nouveau nom n'atteint que les espaces neufs – données déjà écrites ; à revérifier (#682)

### noms du matériel de départ

- **L** Les utilisateurs déjà en place gardent les anciens noms – à Grégoire : arbitrage à préciser ; données déjà écrites (#684)

### note sous pratique par spécifications

- **I** Une pratique par spécifications non configurée donne 50 % à la classe (#713)

### outillage

- **Q** Le comptage des masquages rate la forme la plus courante (#642)

### ouverture d'un codex

- **L** Ouvrir un codex laisse l'ancien espace et double le stockage – à Grégoire : arbitrage à préciser ; données déjà écrites (#336)

### ouverture de l'application

- **I** L'application met 30 à 45 secondes à s'ouvrir – à revérifier (#825)

### ouverture et changement d'onglet

- **L** L'app redessine tous les onglets au démarrage – trois modules et plus (#470)

### ouvrir une évaluation

- **I** L'ouverture échoue sur une attente qui expire pour rien (#652)

### pack de démonstration

- **Q** Le pack démo n'a aucun dossier d'élève annoté – à Grégoire : engagement public, un chantier (#273)

### page d'erreur

- **Q** L'écran d'erreur parle anglais et fait croire que tout est perdu (#799)

### panneau Portfolio

- **L** Restes d'entretien : tri sans effet, heures ambiguës – trois modules et plus (#402)

### partage de grilles et d'échelles

- **L** Le matériel partagé ne peut pas dire qu'il vient de l'orthopédagogie – à Grégoire : arbitrage à préciser ; trois modules et plus (#840)

### partage entre enseignants

- **L** Ouvrir le pilote de partage par fichiers signés – trois modules et plus (#329)

### partout

- **L** Neuf fonctions portent le même nom : la dernière chargée gagne – trois modules et plus (#587)

### pondérations et note finale

- **I** Une évaluation orpheline pèse comme les autres (#483)

### portes terrain

- **Q** Les listes de vérification délèguent tout, faute d'un tri (#488)

### premier lancement

- **Q** Test d'accueil à froid par Grégoire, puis triage – à Grégoire : choix de produit, à froid (#406)

### profil sous pratique en dénotation

- **I** En dénotation, une note chiffrée s'affiche comme un niveau « M » (#719)

### renommer un cours

- **I** Renommer un cours ne rafraîchit pas le nom affiché ailleurs (#472)

### restaurer une archive

- **Q** Le cours ne voyage pas avec la production – à revérifier (#521)

### rituel de commit

- ✅ **Q** Le rappel de l'anti-cache arrive après le commit (#547)

### rituel de release

- ✅ **Q** Une vérification se déclare verte sans rien vérifier (#600)

### rouvrir une archive ou recevoir un partage

- **I** Le remap cherche un format que presque plus personne n'écrit (#663)

### rétroaction EUF imprimée

- **L** La projection EUF reste en dur et nomme un service disparu – à Grégoire : arbitrage à préciser ; trois modules et plus (#668)

### rétroaction générale copiée

- **I** Les tampons récents n'apparaissent jamais dans le bloc Observations – à Grégoire : mots des élèves, à froid (#760)

### saisie directe des résultats

- **L** Saisir des résultats comme dans un tableur – à Grégoire : arbitrage à préciser ; trois modules et plus (#33)

### sauvegarde et restauration

- **L** Protéger par mot de passe une sauvegarde sur clé USB – trois modules et plus (#47)

### skills de Claude Code

- **Q** Le skill des pratiques n'est pas ancré dans le rapport PAREA (#805)

### suite de tests

- **L** 31 sentinelles rougissent sur un simple commentaire – trois modules et plus (#616)

### supprimer un enseignant

- **I** Supprimer un enseignant laisse son profil derrière lui (#474)

### supprimer une ressource

- **L** Une pratique ou production supprimée revient toute seule – à Grégoire : arbitrage à préciser ; trois modules et plus (#463)

### synthèse de rétroaction

- **?** Des rétroactions plus riches que les descriptifs de palette – à Grégoire : mots des élèves, un chantier (#275)

### taux de complétion

- **L** Un « non remis » noté 0 est compté comme remis – à Grégoire : arbitrage à préciser ; trois modules et plus (#738)

### tests automatiques

- **?** La CI ne démarre plus, et son dernier tour complet était rouge – à Grégoire : choix de produit, à froid (#676)

### tests d'intégration

- **L** Tous les tests Chromium échouent sur une liste recopiée 36 fois – trois modules et plus (#487)

### texte copié vers Léa

- **Q** Le texte copié pour l'élève colle les phrases sans séparation – à Grégoire : mots des élèves, à froid (#759)

### toute interface

- **Q** Rien ne détecte une classe CSS employée mais jamais définie (#679)

### toute suppression de données

- **I** Une donnée supprimée continue d'être lue jusqu'au rechargement (#845)

### zoom au trackpad

- **I** Le zoom saccadé vit encore à deux autres endroits – à revérifier (#660)

### échelles d'un trimestre

- **I** Une échelle réparée a disparu de nouveau (#545)

### évaluation archivée

- **I** Le formulaire clignote « modifiable » avant de se verrouiller (#349)

### évaluation d'A2025

- **L** Une éval d'A25 rouvre avec zéro faute et une note gonflée – données déjà écrites ; à revérifier (#350)

### évaluation d'une copie

- **L** La grille de l'orthopédagogue n'a pas de formule « repérées sur total » – à Grégoire : arbitrage à préciser ; trois modules et plus (#835)

### évaluation en cours

- **L** Deux « évaluations en cours » portent le même nom et ne se voient pas – zone protégée, trois modules et plus (#646)

### évaluations d'Hiver 2026

- **L** 44 évaluations pointent vers une échelle qui n'existe nulle part – à Grégoire : arbitrage à préciser ; données déjà écrites ; à revérifier (#544)

---

Tenu par Cowork. Lecture seule sur le dépôt : aucune fiche du BACKLOG n'a été cochée, renumérotée ni réécrite par ce document.
