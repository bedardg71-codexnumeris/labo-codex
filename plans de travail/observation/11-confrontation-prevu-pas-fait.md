# Confrontation des 710 « prévu mais pas fait » : préparation

*15 octobre 2026. Suite de l'audit « observer ce que fait réellement l'application » (rapport : `9-rapport-audit.md`, §8, point 2). Préparé par Claude Code ; l'entrevue avec Grégoire et les dispositions suivront dans ce même fichier.*

## Pourquoi ce tri

Le temps 3 (`3-ecarts.md`) a rangé 710 entrées en catégorie 2, « prévu mais pas fait » : l'intention scellée prévoit quelque chose, et l'observation à l'aveugle n'y correspond pas. Pour 690 d'entre elles, l'observation n'en dit simplement rien (« aucune mention »). Ce silence ne prouve pas que la chose manque : l'analyste a pu ne pas la voir. Une machine pouvant trancher en lisant le code, le tri a été fait au code avant de rien demander à Grégoire.

## Méthode

1. **Extraction** des 710 entrées de `3-ecarts.md` (690 « aucune mention », ce qui concorde avec le bilan du temps 3).
2. **Tri au code de la version observée**, 1.199.0 (`b709f2aa`), par dix sous-agents en lecture seule, un lot chacun, avec une consigne commune (annexe A). Quatre verdicts : **fait** (le code le fait ; l'observation ne l'a pas vu), **en partie** (une partie, ou autrement : autre libellé, autre règle), **pas fait**, **indécidable** (seul un essai réel peut trancher). Charge de la preuve : un texte d'aide ou un nom de fonction ne prouvent rien ; « fait » exige du code qui produit le comportement. Contrôle de forme : chaque « fait » et « en partie » cite un `fichier:ligne`, chaque « pas fait » et « indécidable » ses recherches.
3. **Contre-vérification à l'aveugle** : un onzième agent a refait le tri, sans voir le premier, sur un échantillon tiré au hasard dans chaque verdict (47 entrées).
4. **Version actuelle** : chaque « pas fait » a été recherché dans la 1.201.0.

## Résultats

| Verdict | Entrées |
|---|---:|
| fait (le code le fait, l'observation ne l'a pas vu) | 569 |
| en partie | 101 |
| pas fait | 29 |
| indécidable | 11 |
| **Total** | **710** |

**Contre-vérification** : accord exact sur 41 entrées sur 47 (87 %). Les 15 « fait » tirés au hasard sont tous confirmés. Les six désaccords restent entre « en partie », « pas fait » et « indécidable », sauf deux « en partie » que le second tri juge « fait » (6.75, 7.49). Limite : 15 « fait » confirmés sur 569 ne garantissent pas l'absence d'erreur ; avec zéro erreur sur 15, le taux d'erreur réel peut, au seuil habituel de 95 %, aller jusqu'à environ 20 %.

**Version 1.201.0** : les 29 « pas fait » le restent tous ; aucun changement depuis la 1.199.0 ne les touche. Nuances relevées en chemin, sans effet sur les verdicts : 3.48, 2.105, 2.27 et 4.70 (voir leurs fiches ci-dessous).

**Ce que cela dit de l'audit** : sur 710 intentions que l'observation n'avait pas vues, 569 sont pourtant dans le code. Le silence de l'observation tenait surtout à sa couverture, non à des manques de l'application. Les « voulu mais invisible » possibles se réduisent aux 131 entrées ci-dessous.

## Ce qui revient à Grégoire : 131 entrées

*Les « pas fait » et les « en partie », plus les entrées que le second tri range dans l'une de ces cases (A.58). Pour chacune, trois réponses : **toujours voulu** (une fiche est créée) ; **plus voulu** (l'intention est périmée) ; **refusé** (avec motif). Rangées par partie de l'intention.*

### Partie 1 (11)

#### 1.6 · en partie
*Écran* : Écran 1 · Ouverture de l'application · *Geste* : Geste : ouvrir l'application pour la première fois (espace neuf)

- **Intention** (l. 168) : « au premier lancement, l'application propose la démonstration »
- **Ce que fait le code** : La démo est offerte en tout temps par une case de l'Accueil, mais aucune proposition propre au premier lancement (question à accepter ou refuser) n'existe : rien n'appelle activerModeDemo hors de la case (js/accueil.js:339-350).
- **Preuve** : js/accueil.js:263-271 : carte permanente « Données démo » (« Cours fictif déjà configuré ») sur l'Accueil ; js/main.js:368 : la fenêtre de bienvenue (modal-bienvenue) est retirée
- Réponse de Grégoire :
- Disposition :

#### 1.91 · en partie
*Écran* : Écran 4 · En-tête › menu Codex · *Geste* : Sans geste

- **Intention** (l. 335) : « le menu attend que le stockage soit prêt avant de dire « Aucun codex actif » »
- **Ce que fait le code** : Le menu ouvert avant que le stockage soit prêt dit encore « Aucun codex actif » ; il est corrigé après coup, il n'attend pas.
- **Preuve** : js/codex.js:256-273 : si l'état n'est pas lisible au démarrage, il est relu après db-ready ; mais js/codex.js:3134-3166 (_actualiserMenu) affiche « Aucun codex actif » dès que _etat.actif est faux, sans attendre db-ready
- Réponse de Grégoire :
- Disposition :

#### 1.117 · en partie
*Écran* : Écran 8 · Témoin « Enregistré » (tous les écrans) · *Geste* : Sans geste (après chaque écriture)

- **Intention** (l. 407) : « reste affiché jusqu'à la prochaine écriture réussie ou jusqu'à ce qu'on le ferme »
- **Ce que fait le code** : La règle diffère : une écriture réussie d'une autre clé ne le retire pas, contrairement à « la prochaine écriture réussie ».
- **Preuve** : js/temoin-enregistrement.js:155 et 178-185 : le « Non enregistré » ne s'efface que sur une écriture réussie de LA MÊME clé, ou par « Fermer » (bouton js/temoin-enregistrement.js:88-94)
- Réponse de Grégoire :
- Disposition :

#### 1.129 · en partie
*Écran* : Écran 10 · Numéro de version, bandeau de nouvelle version, fenêtre des Nouveautés · *Geste* : Geste : ouvrir les Nouveautés (carte de l'Accueil ou bouton du bandeau)

- **Intention** (l. 440) : « la fenêtre liste les versions, une entrée par version mineure »
- **Ce que fait le code** : La fenêtre n'est pas vide en 1.199.0 et suit la règle une entrée par mineure ; mais 1.7, 1.8, 1.9, 1.12, 1.13, 1.15 à 1.17, 1.22 à 1.24, 1.70 et 1.82 n'ont aucune entrée sans explication (seules 1.62 et 1.32 à 1.47 sont justifiées, js/changelog-data.js:10-17 et 1827).
- **Preuve** : js/changelog-data.js:22-2330 : 175 entrées, une par version mineure, rendues par genererChangelogHTML (js/changelog-data.js:2334-2348) dans #changelog-contenu (js/init-inline.js:362-365)
- Réponse de Grégoire :
- Disposition :

#### 1.130 · en partie
*Écran* : Écran 10 · Numéro de version, bandeau de nouvelle version, fenêtre des Nouveautés · *Geste* : Geste : ouvrir les Nouveautés (carte de l'Accueil ou bouton du bandeau)

- **Intention** (l. 441) : « les Nouvelles passées sont un historique daté auquel on ne touche pas »
- **Ce que fait le code** : Les Nouvelles passées ne sont pas réécrites, mais l'historique n'est pas daté : aucune date n'est stockée ni affichée.
- **Preuve** : js/changelog-data.js:430-437 : l'entrée 1.168 garde ses mots d'alors (« copie de secours ») ; js/changelog-data.js:7 : « Pas de dates » ; js/changelog-data.js:2334-2348 : seuls version et titre sont affichés
- Réponse de Grégoire :
- Disposition :

#### 1.132 · en partie
*Écran* : Écran 11 · En-tête › « Soutenir Labo Codex » (le cœur) · *Geste* : Geste : ouvrir la fenêtre « Soutenir Labo Codex »

- **Intention** (l. 448) : « le bleu ne sert qu'aux liens »
- **Ce que fait le code** : Le bleu des liens sert aussi au titre de la fenêtre.
- **Preuve** : styles.css:5452-5457 et 5474-5478 : titres de bloc et libellés sans lien en couleur de texte ; styles.css:5480-5483 et 5503-5506 : liens en var(--accent-primaire) ; mais styles.css:5376-5379 : le titre « Soutenir Labo Codex » (.modal-titre, js/modal-soutien.js:40) est aussi en var(--accent-primaire)
- Réponse de Grégoire :
- Disposition :

#### 1.133 · en partie
*Écran* : Écran 11 · En-tête › « Soutenir Labo Codex » (le cœur) · *Geste* : Geste : ouvrir la fenêtre « Soutenir Labo Codex »

- **Intention** (l. 449) : « l'abonnement gratuit et l'abonnement de soutien sont deux niveaux du même abonnement, et c'est lui qui finance Labo Codex »
- **Ce que fait le code** : Le financement est dit, mais aucun texte affiché ne dit que l'abonnement gratuit et l'abonnement de soutien sont deux niveaux du même abonnement : seul un commentaire du code le dit (js/modal-soutien.js:31-34).
- **Preuve** : js/modal-soutien.js:81 : « C'est cet abonnement qui finance Labo Codex. » ; js/modal-soutien.js:69 et 80 : les deux abonnements nomment le blogue
- Réponse de Grégoire :
- Disposition :

#### 1.149 · en partie
*Écran* : Écran 14 · Aide · *Geste* : Geste : lire Aide › Codex

- **Intention** (l. 489) : « Aide › Codex ne contient que le flux de travail, les fonctions du menu et la section « Ton codex est-il à jour ? » »
- **Ce que fait le code** : Les trois parties voulues sont là, mais pas seules.
- **Preuve** : index.html:14073-14088 : la carte contient aussi une ligne « Navigation », un paragraphe de présentation et l'encadré « Qu'est-ce qu'un Codex ? », en plus du flux (14090-14096), des fonctions (14098-14109) et de « Ton codex est-il à jour ? » (14111)
- Réponse de Grégoire :
- Disposition :

#### 1.160 · en partie
*Écran* : Écran 14 · Aide · *Geste* : Geste : lire les autres pages de l'Aide

- **Intention** (l. 520) : « les exemples tirés de la pratique de Grégoire (601-101, SRPNF, échelle IDME) restent présentés comme des exemples »
- **Ce que fait le code** : SRPNF et 601-101 sont donnés en exemple ; IDME ne l'est pas partout.
- **Preuve** : index.html:10020, 10263, 13989-13990 : SRPNF présenté comme « l'exemple SRPNF fourni », « Grille d'exemple […] et non une structure du logiciel » ; mais index.html:10131, 13000 et 13172 présentent l'échelle IDME comme la mesure de l'application (« Performance IDME », « Score : Pourcentage selon l'échelle IDME », « Le seuil critique est M »)
- Réponse de Grégoire :
- Disposition :

#### 1.161 · en partie
*Écran* : Écran 14 · Aide · *Geste* : Geste : lire les autres pages de l'Aide

- **Intention** (l. 521) : « Aide › Exporter et archiver les travaux décrit les trois exports que l'écran offre vraiment »
- **Ce que fait le code** : L'Aide décrit bien ce que l'écran offre, mais ce sont deux exports et non trois.
- **Preuve** : index.html:11711-11715 : « Deux façons d'exporter : » « Exporter des travaux » et « Export Léa » ; js/travaux-ui.js:1298-1340 : l'écran n'offre que ces deux cartes
- Réponse de Grégoire :
- Disposition :

#### 1.162 · en partie
*Écran* : Écran 14 · Aide · *Geste* : Geste : lire les autres pages de l'Aide

- **Intention** (l. 522) : « l'Aide décrit les trois types de grille (holistique, analytique, algorithmique) et la note différée »
- **Ce que fait le code** : La note différée n'est décrite nulle part dans l'Aide : elle n'existe que comme réglage (index.html:8875, js/preferences.js:590-594).
- **Preuve** : index.html:10859 : l'Aide nomme les types Holistique, Analytique, Algorithmique ; index.html:11015-11050 : le critère algorithmique est détaillé
- Réponse de Grégoire :
- Disposition :

### Partie 2 (12)

#### 2.3 · en partie
*Écran* : Écran 16 · Cadre (règles communes à toute la section) · *Geste* : Geste : créer une fiche neuve (trimestre, profil, cours ou service, horaire, groupe-cours, élève)

- **Intention** (l. 568) : « pour l'élève « Cet·te étudiant·e n'est pas encore ajouté·e. »), avec « Rester » […] ou « Quitter sans ajouter » »
- **Ce que fait le code** : Les mots et la fenêtre existent, mais le formulaire d'ajout n'a pas de « Fermer » (index.html:7036, bouton caché hors modification) : la question ne vient qu'en ouvrant une autre fiche ; au rechargement, seule la question native du navigateur paraît (ui-dialogues.js:462-471), sans ces mots.
- **Preuve** : ui-dialogues.js:435, :442 et :454-457 : titre « Cet·te étudiant·e n'est pas encore ajouté·e. », boutons « Rester » et « Quitter sans ajouter » ; trimestre-v2-etudiants.js:636 et :917 : la question est posée quand on ouvre une autre fiche par « Modifier » alors que le formulaire d'ajout porte une saisie
- Réponse de Grégoire :
- Disposition :

#### 2.11 · en partie
*Écran* : Écran 17 · Cadre › Trimestre (la fiche du trimestre) · *Geste* : Geste : créer un trimestre

- **Intention** (l. 586) : « éditeurs ouverts refermés »
- **Ce que fait le code** : Le chemin complet de la bascule est bien pris. Mais pour la grille, l'échelle, la cartouche et la pratique, seuls le pointeur d'édition et le tampon sont vidés (grilles.js:2121, echelles.js:3748, cartouches.js:3125, pratiques-gestion.js:2901) : rien ne masque l'éditeur affiché ; seule la journée sans cours est refermée à l'écran (trimestre-v2-init.js:812-816).
- **Preuve** : trimestre-v2-init.js:386-390 : « Créer le trimestre » rejoue changerTrimestreActifV2 quand un trimestre était actif ; trimestre-v2-liste.js:465-479 : ce chemin ferme le formulaire de journée sans cours et remet à zéro les pointeurs des quatre éditeurs de Conception
- Réponse de Grégoire :
- Disposition :

#### 2.21 · en partie
*Écran* : Écran 17 · Cadre › Trimestre (la fiche du trimestre) · *Geste* : Geste : changer de trimestre actif (menu « Trimestre actif »)

- **Intention** (l. 630) : « éditeurs ouverts (journée sans cours, grille, échelle, cartouche, pratique) refermés »
- **Ce que fait le code** : Le contexte de l'ancien trimestre est remis à zéro, mais seule la journée sans cours est refermée à l'écran ; l'éditeur de grille, d'échelle, de cartouche ou de pratique n'est pas masqué, et la réinitialisation de la section à son affichage (navigation.js:219-245, grilles.js initialiserModuleGrilles) ne le masque pas non plus.
- **Preuve** : trimestre-v2-liste.js:461-479 : au changement de trimestre, le formulaire de journée sans cours est fermé (annulerFormEvenementV2) et les quatre éditeurs de Conception sont réinitialisés ; grilles.js:2121-2124, echelles.js:3748-3752, cartouches.js:3125, pratiques-gestion.js:2901 : ces réinitialisations ne vident que le pointeur d'édition et le tampon
- Réponse de Grégoire :
- Disposition :

#### 2.27 · pas fait
*Écran* : Écran 17 · Cadre › Trimestre (la fiche du trimestre) · *Geste* : Sans geste

- **Intention** (l. 645) : « quand un nouveau calendrier change la semaine d'une production, l'application le signale, sans déplacer l'échéance »
- **Ce que fait le code** : Rien ne détecte qu'un nouveau calendrier change la semaine d'une production, ni ne le signale ; l'échéance n'est pas déplacée, mais le changement n'est pas dit.
- **Preuve** : productions.js:1261-1300 : la semaine d'une échéance est seulement relue du calendrier à l'affichage, sans comparaison avec une semaine antérieure ; trimestre.js:55 (genererCalendrierComplet) ne lit pas les productions
- **Note** : Vérification en 1.201.0 : un signal voisin existe (« La carte situe cette remise le … », js/productions.js:1361-1376) ; il ne parle pas de semaine et ne se voit qu'à l'ouverture de la fiche.
- Réponse de Grégoire :
- Disposition :

#### 2.28 · en partie
*Écran* : Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres) · *Geste* : Geste : ouvrir un trimestre depuis la bibliothèque

- **Intention** (l. 658) : « un trimestre clos s'ouvre en lecture seule »
- **Ce que fait le code** : Ouvrir un trimestre clos en lecture seule n'est possible que par le menu « Trimestre actif » (trimestre-v2-liste.js:57-90, qui liste aussi les clos ; bandeau d'archive trimestres.js:1834) ; depuis la bibliothèque, le seul geste offert le rend modifiable.
- **Preuve** : trimestre-v2-liste.js:200-201 : dans la bibliothèque, un trimestre clos n'offre que « Rouvrir » (desarchiverTrimestre, trimestres.js : retire le statut clos sans l'activer) ; seul un trimestre non clos a « Activer » (:217)
- Réponse de Grégoire :
- Disposition :

#### 2.33 · en partie
*Écran* : Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres) · *Geste* : Geste : rouvrir un trimestre clos

- **Intention** (l. 673) : « infobulle « Rouvrir pour permettre les modifications » »
- **Ce que fait le code** : L'infobulle existe mais son texte diffère ; « Rouvrir pour permettre les modifications » n'apparaît nulle part.
- **Preuve** : trimestre-v2-liste.js:201 : le bouton « Rouvrir » a pour infobulle « Restaurer ce trimestre comme actif »
- Réponse de Grégoire :
- Disposition :

#### 2.35 · pas fait
*Écran* : Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres) · *Geste* : Geste : supprimer un trimestre (« Supprimer… »)

- **Intention** (l. 685) : « les fichiers des copies du trimestre partent avec lui »
- **Ce que fait le code** : La liste <trimestre>_fichiersTravaux part avec les autres clés, mais les fichiers des copies eux-mêmes restent dans le magasin.
- **Preuve** : trimestres.js:1444-1500 : supprimerTrimestre efface les clés du magasin keyvalue, de localStorage et du cache mémoire (:1479-1481), jamais le magasin IndexedDB « fichiers » des copies (db.js:490) ; reserve-emprunter.js:21-22 le constate : « supprimerTrimestre laisse … les fichiers des copies »
- Réponse de Grégoire :
- Disposition :

#### 2.92 · pas fait
*Écran* : Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève · *Geste* : Geste : importer des étudiant·es (coller ou déposer un fichier)

- **Intention** (l. 808) : « l'ancienne colonne « CAF » est lue comme « Mesure d'aide » »
- **Ce que fait le code** : La fiche importée n'a pas de champ caf ; seule l'aide (index.html:10715) affirme que les fichiers à l'ancien en-tête restent lisibles. Une valeur de sixième colonne serait même lue comme SA.
- **Preuve** : trimestre-v2-etudiants.js:1290-1315 : analyserListeEtudiantsCollee lit les colonnes par position (DA, groupe, nom, prénom, programme, puis SA en sixième ou septième colonne, :1302) et ne lit aucune colonne CAF ni Mesure d'aide
- Réponse de Grégoire :
- Disposition :

#### 2.105 · pas fait
*Écran* : Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours) · *Geste* : Geste : dupliquer un cours ou un service

- **Intention** (l. 847) : « crée une nouvelle fiche, cours ou service, avec les mêmes champs, sous un nom qui la distingue »
- **Ce que fait le code** : Le geste n'est pas offert ; même appelée, la fonction ne trouverait pas son formulaire et ne créerait ni fiche ni message.
- **Preuve** : trimestre-v2-cours.js:627-670 : dupliquerCoursSelectionneV2 existe, mais aucun bouton ni entrée de menu ne l'appelle, et elle vise des éléments absents de la page (v2-formulaireCours, v2-apercuCours, v2-btnTexteCours)
- **Note** : Vérification en 1.201.0 : le formulaire v2-formulaireCours existe (index.html:6417 en 1.199.0) ; aucun bouton ni menu n'offre le geste.
- Réponse de Grégoire :
- Disposition :

#### 2.106 · pas fait
*Écran* : Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours) · *Geste* : Geste : dupliquer un cours ou un service

- **Intention** (l. 848) : « sur un service, le formulaire dit « Dupliquer le service » »
- **Ce que fait le code** : Sans geste de duplication offert, le formulaire ne dit jamais « Dupliquer le service ».
- **Preuve** : mots-nature.js:75 : le mot « Dupliquer le service » existe, mais il n'est lu que par _titrerFormCoursV2('dupliquer') depuis dupliquerCoursSelectionneV2 (trimestre-v2-cours.js:657), que rien n'appelle
- Réponse de Grégoire :
- Disposition :

#### 2.115 · en partie
*Écran* : Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil ») · *Geste* : Geste : modifier un profil

- **Intention** (l. 890) : « sans profil, l'auteur par défaut est « Utilisateur de Labo Codex » »
- **Ce que fait le code** : cc-license.js étant chargé (index.html:14404), l'auteur par défaut d'un document partagé est « Inconnu », pas « Utilisateur de Labo Codex ».
- **Preuve** : cc-license.js:111-114 : sans profil, obtenirIdentiteCCUtilisateur rend « Inconnu » ; partage-format.js:262-265 et codex-data.js:74-78 n'emploient « Utilisateur de Labo Codex » que si cette fonction est absente
- Réponse de Grégoire :
- Disposition :

#### 2.116 · pas fait
*Écran* : Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil ») · *Geste* : Geste : supprimer un profil

- **Intention** (l. 896) : « supprimer le profil marqué « mon profil » efface aussi cette marque ; il ne revient pas au chargement suivant »
- **Ce que fait le code** : La marque « mon profil » survit à la suppression, et le profil revient au chargement suivant.
- **Preuve** : trimestre-v2-enseignants.js:413-454 : supprimerProfilEnseignantV2 retire le profil de enseignants mais ne touche pas la copie profilEnseignant ; trimestre-v2-enseignants.js:36-57 : au chargement suivant, cette copie est réinjectée dans enseignants quand aucun profil ne porte son courriel
- Réponse de Grégoire :
- Disposition :

### Partie 3 (13)

#### 3.3 · en partie
*Écran* : Écran 25 · Conception (commun aux trois écrans) · *Geste* : Geste : créer avec le nom d'une fiche existante (« Remplacer l'existante », écraser l'homonyme)

- **Intention** (l. 1020) : « si des évaluations ou des productions emploient l'homonyme, refus et rien n'est modifié »
- **Ce que fait le code** : Le refus d'écraser un homonyme employé est fait pour les trois modèles (grille, échelle, cartouche), ce que couvre la source (changelog 1.190). Sur l'écran Productions, « Remplacer l'existante » retire une production homonyme même si des évaluations la nomment : aucun compte, aucun refus.
- **Preuve** : js/modal-doublon.js:281-288 : sur « ecraser », compte les porteurs des homonymes et refuse (alert, retour null, rien d'écrit) ; branché pour la grille (js/grilles.js:691-693), l'échelle (js/echelles.js:3544-3546) et la cartouche (js/cartouches.js:982-983). Mais js/productions.js:1916 appelle verifierEtGererDoublon sans porteursHomonymes, et js/productions.js:1928-1929 retire l'homonyme
- Réponse de Grégoire :
- Disposition :

#### 3.17 · en partie
*Écran* : Écran 25 · Conception (commun aux trois écrans) · *Geste* : Geste : dupliquer une fiche (grille, échelle, production)

- **Intention** (l. 1046) : « sur un échec, le témoin nomme le geste réel (« Dupliquer la grille », « Dupliquer l'échelle ») »
- **Ce que fait le code** : Fait pour la grille et l'échelle. Pour la production (le troisième écran du geste), un échec d'écriture n'est pas dit par le témoin et ne nomme aucun geste.
- **Preuve** : js/grilles.js:5386 (geste « Dupliquer la grille ») et js/echelles.js:3187 (geste « Dupliquer l'échelle ») passent par modifierEtAnnoncer, dont l'échec dit le geste (js/modes.js:1277) ; js/productions-liste.js:328 duplique une production par db.modifier sans geste ni témoin
- Réponse de Grégoire :
- Disposition :

#### 3.19 · en partie
*Écran* : Écran 25 · Conception (commun aux trois écrans) · *Geste* : Geste : changer de trimestre pendant qu'un éditeur est ouvert

- **Intention** (l. 1055) : « les éditeurs ouverts se referment ; les critères ou niveaux d'une fiche en création ne suivent pas dans le nouveau trimestre »
- **Ce que fait le code** : Les critères et niveaux d'une fiche en création ne suivent pas dans le nouveau trimestre. Mais rien ne referme les éditeurs : aucune de ces fonctions ne masque conteneurEditionGrille ou conteneurEditionEchelle, et la production ouverte (productionEnEdition) n'est pas dans la liste réinitialisée.
- **Preuve** : js/trimestre-v2-liste.js:474-479 appelle les réinitialisations ; js/grilles.js:2121-2124 vide grilleTemplateActuelle et tempCriteres ; js/echelles.js:3748-3752 vide l'échelle courante, les niveaux et repères en création
- Réponse de Grégoire :
- Disposition :

#### 3.20 · en partie
*Écran* : Écran 25 · Conception (commun aux trois écrans) · *Geste* : Geste : changer de trimestre pendant qu'un éditeur est ouvert

- **Intention** (l. 1056) : « modifier une fiche restée à cheval sur la bascule est refusé à voix haute, rien n'est écrit au mauvais endroit »
- **Ce que fait le code** : Rien n'est écrit au mauvais endroit. Le refus est dit pour une production restée ouverte (son pointeur survit) ; pour une grille ou une échelle restée affichée, la modification est ignorée en silence au lieu d'être refusée à voix haute.
- **Preuve** : js/grilles.js:801-807, js/echelles.js:610-620, js/productions.js:2156-2158 : refus à voix haute quand la fiche n'est plus dans le trimestre actif ; mais après la bascule, js/grilles.js:2121-2124 et js/echelles.js:3748-3752 mettent le pointeur à null, et js/grilles.js:864-868 (sauvegarderNomGrille) comme js/echelles.js:574-578 ne font alors plus rien, sans un mot
- Réponse de Grégoire :
- Disposition :

#### 3.42 · en partie
*Écran* : Écran 26 · Conception › Productions étudiantes · *Geste* : Geste : choisir la grille, l'échelle et la cartouche de la production

- **Intention** (l. 1109) : « s'affiche « ⚠ introuvable », et l'enregistrement ne l'efface pas »
- **Ce que fait le code** : La référence est préservée à l'enregistrement, mais le texte affiché est « ⚠ ‹type› introuvable (‹id›) », pas « ⚠ introuvable ».
- **Preuve** : js/productions.js:1513-1524 : poserReferenceSelect réinjecte l'id non résolu comme option sélectionnée, texte « ⚠ grille introuvable (‹id›) » (ou échelle, cartouche) ; l'enregistrement relit cette valeur et ne l'efface pas
- Réponse de Grégoire :
- Disposition :

#### 3.48 · pas fait
*Écran* : Écran 26 · Conception › Productions étudiantes · *Geste* : Geste : supprimer une production

- **Intention** (l. 1126) : « une production qui a des évaluations ou des copies ne peut pas être supprimée ; le refus dit combien, comme pour une grille »
- **Ce que fait le code** : Aucun chemin de suppression d'une production ne compte ses évaluations ou ses copies, ni ne refuse ; la grille, elle, refuse (js/grilles.js:2962-2967).
- **Preuve** : js/productions.js:3450-3466 (supprimerProduction) et js/productions-liste.js:399-415 (supprimerProductionActive) : codex, confirmation, puis retrait sans compter évaluations ni copies
- **Note** : Vérification en 1.201.0 : un refus « Utilisée par N évaluation(s) » existe déjà dans Réglages › Données › Gestion avancée des ressources (js/donnees-v2.js:1162-1182, présent en 1.199.0) ; il ne compte pas les copies et ne s'applique pas à la suppression depuis la Conception.
- Réponse de Grégoire :
- Disposition :

#### 3.52 · en partie
*Écran* : Écran 26 · Conception › Productions étudiantes · *Geste* : Sans geste

- **Intention** (l. 1138) : « Une production de démonstration s'ouvre en lecture seule ; elle n'écrit rien »
- **Ce que fait le code** : La lecture seule désactive les champs, pas les boutons : déplacer ou retirer un bloc (ou « + Nouveau champ », qui redessine des champs actifs) écrit dans la production de démonstration.
- **Preuve** : js/productions-liste.js:200-201 et js/bibliotheque-ui.js:325-337 : une production démo ouvre en lecture seule (input, select, textarea désactivés, bandeau) ; mais les boutons des blocs de consignes restent actifs, et js/productions.js:809 (déplacer un bloc) et 794 (retirer un bloc) écrivent par enregistrerProductionModifiee, qui n'a aucune garde démo
- Réponse de Grégoire :
- Disposition :

#### 3.66 · en partie
*Écran* : Écran 27 · Conception › Grilles de critères · *Geste* : Geste : renseigner un critère (nom, descripteur, pondération, type, complexité SOLO)

- **Intention** (l. 1182) : « aide sous le menu : « “Aucun” retire le critère de la lecture SOLO »
- **Ce que fait le code** : Le texte arrêté existe, mais il s'ouvre par l'icône d'aide à côté du libellé, pas comme aide sous le menu.
- **Preuve** : js/accompagnement-contenu-popup.js:1138 : le texte « “Aucun” retire le critère de la lecture SOLO : il compte dans la note comme les autres, mais le dépistage des fondations ne le surveille pas et aucune étiquette ne l'accompagne dans les exports. » vit dans la fenêtre d'aide ; js/grilles.js:3569-3578 : rien sous le menu
- Réponse de Grégoire :
- Disposition :

#### 3.77 · en partie
*Écran* : Écran 27 · Conception › Grilles de critères · *Geste* : Geste : gérer les sous-critères comme codes d'annotation

- **Intention** (l. 1215) : « dans le gabarit algorithmique, on parle d'« observation », jamais de « rétroaction » »
- **Ce que fait le code** : Les sous-critères parlent d'observation, mais deux phrases du gabarit algorithmique disent encore « rétroaction ».
- **Preuve** : js/grilles.js:4507 : le texte du code s'intitule « Observation » ; mais js/grilles.js:3683 (carte Formule : « Le nombre de mots reste saisi pour la rétroaction. ») et js/grilles.js:4177 (carte « Ce que l'élève lit » : « L'aperçu ne montre pas la rétroaction du sous-critère dominant ») emploient encore « rétroaction »
- Réponse de Grégoire :
- Disposition :

#### 3.108 · pas fait
*Écran* : Écran 27 · Conception › Grilles de critères · *Geste* : Geste : supprimer une grille

- **Intention** (l. 1271) : « supprimer la grille de départ dans un trimestre ne la retire que de ce trimestre ; les autres trimestres, et ceux à venir, la reçoivent encore »
- **Ce que fait le code** : Le code fait l'inverse : supprimer la grille de départ dans un trimestre pose une marque globale, et ni les autres trimestres ni ceux à venir ne la reçoivent plus.
- **Preuve** : js/grilles.js:3083-3086 : supprimer GRILLE_GENERIQUE appelle marquerRessourceSupprimee ; js/main.js:139-145 l'inscrit dans la clé globale « ressourcesSupprimees » (non préfixée par trimestre) ; js/grilles.js:1622 : assurerGrilleDeDepart ne sème plus si l'id y figure
- Réponse de Grégoire :
- Disposition :

#### 3.114 · pas fait
*Écran* : Écran 28 · Conception › Échelles de performance · *Geste* : Geste : corriger une échelle déjà employée (sans la supprimer)

- **Intention** (l. 1315) : « le recalcul des évaluations touchées doit être possible ; il est PROPOSÉ, jamais automatique, et la proposition nomme le compte avant le geste ; refusé dans un trimestre clos ou archivé »
- **Ce que fait le code** : Corriger une échelle employée s'enregistre champ par champ ; aucune proposition de recalcul, aucun compte, aucun refus en trimestre clos sur ce geste.
- **Preuve** : js/echelles.js:2858-2904 (modifierNiveauEchelle) écrit le champ sans rien proposer ; aucun code ne propose de recalculer les évaluations d'une échelle corrigée
- Réponse de Grégoire :
- Disposition :

#### 3.115 · en partie
*Écran* : Écran 28 · Conception › Échelles de performance · *Geste* : Geste : renommer une échelle

- **Intention** (l. 1326) : « une échelle hors du trimestre actif ne s'écrit pas, et le refus le dit »
- **Ce que fait le code** : Rien n'est écrit hors du trimestre actif. Le refus dit existe, mais dans le cas réel (échelle restée affichée après un changement de trimestre), le renommage est ignoré en silence.
- **Preuve** : js/echelles.js:610-620 : si l'échelle éditée n'est pas dans le trimestre actif, rien n'est écrit et une erreur le dit ; mais après une bascule js/echelles.js:3748-3752 met le pointeur à null, et js/echelles.js:574-578 ne fait alors plus rien, sans message
- Réponse de Grégoire :
- Disposition :

#### 3.119 · en partie
*Écran* : Écran 28 · Conception › Échelles de performance · *Geste* : Geste : supprimer une échelle

- **Intention** (l. 1339) : « dans un trimestre terminé ou archivé, refus, en disant que le remplacement toucherait des notes déjà remises »
- **Ce que fait le code** : Le refus est fait pour un trimestre archivé ; un trimestre terminé mais pas archivé n'est pas détecté et le remplacement y est proposé.
- **Preuve** : js/echelles.js:3436-3438 : refus « Ce trimestre est clos : remplacer l'échelle … toucherait …, dont des notes déjà remises. » ; mais la garde est estTrimestreArchive (js/trimestres.js:1385-1388), qui ne lit que archive === true
- Réponse de Grégoire :
- Disposition :

### Partie 4 (28)

#### 4.5 · en partie
*Écran* : Écran 29 · Conception › Rétroactions (cartouches) · *Geste* : Geste : Choisir la grille et l'échelle d'une cartouche

- **Intention** (l. 1369) : « une grille, une échelle ou une cartouche introuvable s'affiche « ⚠ introuvable » au lieu de « Aucune », et enregistrer ne l'efface pas »
- **Ce que fait le code** : Fait dans le formulaire de production, avec le libellé « ⚠ <type> introuvable (<id>) » et non « ⚠ introuvable ». L'éditeur de cartouche, où l'intention est placée, ne le fait pas : populerDropdownsCartouche (cartouches.js:3419-3451) n'affiche rien de tel quand la grille ou l'échelle n'existe plus ; le menu retombe sur « -- Grille -- ».
- **Preuve** : js/productions.js:1513-1524 : poserReferenceSelect réinjecte l'id non résolu comme option « ⚠ grille introuvable (id) » (idem échelle, cartouche) au lieu de retomber sur « Aucune »
- Réponse de Grégoire :
- Disposition :

#### 4.22 · en partie
*Écran* : Écran 29 · Conception › Rétroactions (cartouches) · *Geste* : Sans geste

- **Intention** (l. 1434) : « Changer de trimestre referme l'éditeur de cartouche resté ouvert »
- **Ce que fait le code** : Le pointeur d'édition est purgé, mais le formulaire #infoCartouche n'est pas masqué : annulerFormCartouche (cartouches.js:2856) n'est pas appelée, et initialiserModuleCartouches (cartouches.js:118-152), relancé au retour dans la sous-section, ne cache pas non plus l'éditeur. La fiche de l'ancien trimestre reste donc affichée.
- **Preuve** : js/trimestre-v2-liste.js:474-479 et js/cartouches.js:3125 : à la bascule, reinitialiserEditeurCartouchesApresBascule remet seulement cartoucheActuel à null
- Réponse de Grégoire :
- Disposition :

#### 4.23 · en partie
*Écran* : Écran 29 · Conception › Rétroactions (cartouches) · *Geste* : Sans geste

- **Intention** (l. 1436) : « les autres trimestres, et ceux à venir, la reçoivent encore »
- **Ce que fait le code** : La suppression ne vide que la collection du trimestre actif, donc les trimestres qui ont déjà la cartouche la gardent. Mais le marqueur est global : aucun autre trimestre qui ne l'a pas encore, ni aucun trimestre à venir, ne la reçoit plus.
- **Preuve** : js/cartouches.js:1741-1743 : supprimer CART_GENERIQUE appelle marquerRessourceSupprimee ; js/main.js:134-146 : ce marqueur vit dans la clé globale 'ressourcesSupprimees' (non préfixée par trimestre) ; cartouches.js:169 : assurerCartoucheDeDepart sort si le marqueur existe
- **Second tri** : pas fait ; Supprimer la cartouche de départ dans un trimestre empêche de la semer dans les autres trimestres et dans ceux à venir, à l'inverse de l'intention.
- Réponse de Grégoire :
- Disposition :

#### 4.26 · en partie
*Écran* : Écran 30 · Conception › Rétroactions › « Consulter la bibliothèque » (cartouches) · *Geste* : Geste : Retirer une cartouche de la bibliothèque partagée (seconde section)

- **Intention** (l. 1447) : « sinon « Supprimer définitivement «X» de la bibliothèque partagée ? » »
- **Ce que fait le code** : Le cas sans ancrage dans la grille existe, mais le texte dit « de la Bibliothèque » et non « de la bibliothèque partagée ».
- **Preuve** : js/cartouches.js:4686 : question « Supprimer définitivement «X» de la Bibliothèque ? » suivie de « Cette action est irréversible. »
- Réponse de Grégoire :
- Disposition :

#### 4.29 · pas fait
*Écran* : Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) · *Geste* : Geste : Modifier une pratique existante dans l'éditeur

- **Intention** (l. 1464) : « « Annuler » devient « Fermer » »
- **Ce que fait le code** : L'éditeur de pratique n'a ni « Annuler » ni « Fermer » : le bouton d'enregistrement a été retiré (index.html:6093-6094) sans qu'un « Fermer » soit posé, contrairement aux fiches grille, échelle et cartouche (index.html:4920, 5116, 5245).
- **Preuve** : index.html:5465-6100 (conteneurEditionPratique) : seuls « Dupliquer », « Supprimer » et « Appliquer au cours actif » ; aucun bouton « Fermer »
- Réponse de Grégoire :
- Disposition :

#### 4.31 · en partie
*Écran* : Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) · *Geste* : Geste : Modifier une pratique existante dans l'éditeur

- **Intention** (l. 1467) : « le témoin dit « Enregistré » ou « Non enregistré : ‹raison› » »
- **Ce que fait le code** : Le témoin dit bien « Enregistré », mais l'échec s'écrit avec le geste intercalé (tous les appels de pratiques-gestion.js passent geste: 'Modifier la pratique'), et non « Non enregistré : ‹raison› ». Le refus « aucune cible » passe par notifications.erreur (pratiques-gestion.js:1576-1578), pas par le témoin.
- **Preuve** : js/modes.js:1248-1279 : modifierEtAnnoncer dit « Enregistré » après écriture ; en échec, temoinEnregistrement.nonEnregistre(raison, 'Modifier la pratique', …) ; js/temoin-enregistrement.js:171-174 : forme « Non enregistré – Modifier la pratique : ‹raison› »
- Réponse de Grégoire :
- Disposition :

#### 4.33 · en partie
*Écran* : Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) · *Geste* : Geste : Régler les jetons d'une pratique

- **Intention** (l. 1473) : « la carte de la pratique affiche « N jetons » quand des jetons sont réglés »
- **Ce que fait le code** : Les jetons réglés par l'assistant vivent dans configuration.jetons (wizard-pratique-v2.js:2694-2711 ; pratiques-gestion.js:1367-1370) et ne produisent pas le badge : une pratique par spécifications à jetons créée par l'assistant n'affiche pas « N jetons ».
- **Preuve** : js/pratiques-gestion.js:229-232 : le badge « ${nbJetons} jetons » n'est posé que si pratique.jetons?.actif (bloc plat du formulaire)
- Réponse de Grégoire :
- Disposition :

#### 4.36 · en partie
*Écran* : Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) · *Geste* : Geste : Choisir l'affichage de la note (« note en lettre »)

- **Intention** (l. 1483) : « le PDF remis à l'élève le respecte »
- **Ce que fait le code** : Le PDF respecte « Niveau de performance » pour la note provisoire d'une pratique à portfolio, mais pas pour une sommative : construireNoteSommative (l.1218-1265) reçoit seule la main et écrit la moyenne et les notes chiffrées sans lire ce réglage.
- **Preuve** : js/synthese-retroaction-data.js:1197-1206 : affichageNiveauxSeulement lit le choix de l'évaluation puis celui de la pratique ; l.810 et 1403-1420 : le bloc de note portfolio retire tous les chiffres
- Réponse de Grégoire :
- Disposition :

#### 4.45 · pas fait
*Écran* : Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) · *Geste* : Geste : Dupliquer une pratique, ou en dériver une variante

- **Intention** (l. 1513) : « une retouche de l'échelle ne recalcule pas ses notes d'office : le recalcul est proposé, comme pour une échelle déjà employée »
- **Ce que fait le code** : Rien ne relie une pratique ancienne à une échelle de référence ni ne propose un recalcul : la seule question liée à l'emploi d'une échelle porte sur sa suppression ou son remplacement (echelles.js:3426-3479).
- **Preuve** : js/echelles.js : aucune proposition de recalcul à la retouche d'une échelle ; aucun lien d'une pratique ancienne vers une « échelle de référence »
- Réponse de Grégoire :
- Disposition :

#### 4.49 · pas fait
*Écran* : Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur) · *Geste* : Énoncé 4, côté pratiques

- **Intention** (l. 1524) : « l'idée « l'algorithme propose, le jugement tranche » est présentée comme inspirée de Bruno Voisard, « La machine à produire des notes », Substack, 4 mai 2026 (section « En guise de conclusion : quelques pistes de solution »), sans guillemets de citation »
- **Ce que fait le code** : L'idée apparaît, mais citée entre guillemets et sans être présentée comme inspirée de Bruno Voisard ni de son texte Substack ; le nom n'apparaît que dans des références sans lien avec cette idée (index.html:9866, 9872, 14127).
- **Preuve** : js/wizard-pratique-v2.js:261 : « L'algorithme propose, le jugement tranche » entre guillemets, sans source ; js/guides-pedagogiques.js:341 : l'idée sans attribution
- Réponse de Grégoire :
- Disposition :

#### 4.52 · pas fait
*Écran* : Écran 32 · Assistant de pratique · *Geste* : Geste : Ouvrir l'assistant et choisir une porte

- **Intention** (l. 1540) : « au-delà d'environ 15 objectifs, une alerte non bloquante »
- **Ce que fait le code** : L'alerte non bloquante au-delà d'environ 15 objectifs n'existe plus dans l'assistant (l'étape par objectifs a été retirée) ; aucune condition sur un nombre d'objectifs n'est évaluée.
- **Preuve** : js/wizard-pratique-v2.js:1175 et 1449 : seuls des commentaires mentionnent le garde-fou « >15 objectifs » ; aucun champ nbObjectifs ni alerte
- Réponse de Grégoire :
- Disposition :

#### 4.53 · en partie
*Écran* : Écran 32 · Assistant de pratique · *Geste* : Geste : Configurer une sommative

- **Intention** (l. 1547) : « le seuil, les jetons »
- **Ce que fait le code** : Le seuil est là, mais le parcours sommatif ne propose aucun jeton : utiliserJetons n'existe qu'à l'étape config-specifications (l.783) et l'assistant n'écrit des jetons que pour une spécification (l.2689-2711 ; construction-attributs.js:35-38).
- **Preuve** : js/wizard-pratique-v2.js:583-620 : config-sommative-regles propose, pour le verrou, le seuil minimum (seuilVerrou) et le plafond ; options de regles-sommative l.476-492 : verrou, portfolio, aucune
- Réponse de Grégoire :
- Disposition :

#### 4.70 · pas fait
*Écran* : Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques · *Geste* : Geste : Parcourir les modèles offerts

- **Intention** (l. 1586) : « « Aucun modèle « Sommative » fourni » »
- **Ce que fait le code** : Le code qui nommerait la famille est mort : rien ne l'appelle. L'écran réel « Partir d'un modèle » (wizard-pratique-v2.js:179-197, 991-1011) liste tous les modèles sans filtre par famille et n'a pas d'état vide qui la nomme.
- **Preuve** : js/pratiques-bibliotheque.js:727-741 : le texte « Aucun modèle « ${badge.label} » fourni : enregistre le tien » n'existe que dans genererSelecteurModelesPratiques, rendu dans #v2-spec-dropdown-modeles, élément absent de index.html (l.752, 766)
- **Second tri** : en partie ; La famille est bien nommée, mais le message ajoute « enregistre le tien » : le texte exact diffère de l'intention.
- **Note** : Vérification en 1.201.0 : le texte « Aucun modèle « Sommative » fourni » vivait en code mort, retiré depuis (commit 7aa1e7d7).
- Réponse de Grégoire :
- Disposition :

#### 4.72 · en partie
*Écran* : Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques · *Geste* : Geste : Adopter un modèle Standards (« N meilleures » ou « N plus récentes »)

- **Intention** (l. 1594) : « la note de l'élève est la même au profil, à l'export et au Comparateur »
- **Ce que fait le code** : Les trois écrans tirent la note du même moteur, mais l'export écrit la note arrondie à l'entier (export-resultats-finaux.js:68-75, en-tête « Note finale (arrondie à l'entier) ») alors que le profil l'affiche au dixième ; le Comparateur ne lit les vraies données qu'en source « réel ».
- **Preuve** : js/portfolio.js:540-560 : simulerIndices passe par calculerDetailsNoteFinale (profil-etudiant-actions.js:379) pour une Standards ; js/export-resultats-finaux.js:186 et js/comparateur-pratiques.js:335-336 lisent simulerIndices
- Réponse de Grégoire :
- Disposition :

#### 4.84 · en partie
*Écran* : Écran 34 · Conception › Carte d'alignement › canevas · *Geste* : Geste : Cocher les objectifs vérifiés d'une évaluation

- **Intention** (l. 1643) : « infobulle de l'activité d'évaluation : « Vérification : l'évaluation ferme la boucle »
- **Ce que fait le code** : La phrase de l'intention y figure mot pour mot, mais l'infobulle continue avec deux phrases de plus (« Le menu de son en-tête choisit sa visée… », « Tant que tu n'as rien choisi, tes exports écrivent « Évaluation », comme avant. »).
- **Preuve** : js/accompagnement-contenu-hover.js:617-618 : infobulle 'planif-design-apprentissages' de la famille « Vérification » de la palette (index.html:4350), qui ne contient que le bloc Évaluation
- Réponse de Grégoire :
- Disposition :

#### 4.111 · en partie
*Écran* : Écran 34 · Conception › Carte d'alignement › canevas · *Geste* : Sans geste

- **Intention** (l. 1708) : « Liens déjà tracés d'une connaissance vers une Ouverture ou une Révision passent de « s'acquiert par » à « se réactive dans » à l'ouverture de la carte ; un message dit combien, et lesquels »
- **Ce que fait le code** : La bascule et le compte sont faits ; la liste des liens concernés ne part que dans la console (console.warn), pas dans le message montré à l'utilisateur.
- **Preuve** : js/planification-carte.js:6527-6532 : à l'ouverture, un lien « s'acquiert par » dont le couple résout « se réactive dans » est basculé ; js/planification-carte.js:6559-6568 : le toast dit seulement « N lien(s) mis à jour : « se réactive dans » »
- Réponse de Grégoire :
- Disposition :

#### 4.114 · en partie
*Écran* : Écran 35 · Conception › Carte d'alignement › barre et menus · *Geste* : Geste : Lire la barre

- **Intention** (l. 1719) : « de gauche à droite : « Consulter la bibliothèque », la liste des cartes, « Actions ▾ », « Annuler », « Rétablir » ; la recherche ; « Nœuds », « Planificateur », « Vue ▾ », « Inspecteur », « Guide » ; plus aucune icône seule »
- **Ce que fait le code** : L'ordre et les mots sont ceux de l'intention, mais le bouton d'effacement de la recherche (index.html:4233-4236, icône icon-close-window seule) reste une icône sans mot dans la barre, visible dès qu'on tape.
- **Preuve** : index.html:4187-4216 puis 4227-4237 puis 4239-4292 : Consulter la bibliothèque, liste des cartes, Actions ▾, Annuler, Rétablir ; la recherche ; Nœuds, Planificateur, Vue ▾, Inspecteur, Guide
- Réponse de Grégoire :
- Disposition :

#### 4.115 · en partie
*Écran* : Écran 35 · Conception › Carte d'alignement › barre et menus · *Geste* : Geste : Lire la barre

- **Intention** (l. 1720) : « les boutons de la barre sont à 44 px au doigt »
- **Ce que fait le code** : Les boutons principaux montent à 44 px au doigt, mais le bouton d'effacement de la recherche reste à 28 × 28 px sur iPad (styles.css:20584) et le champ de recherche à 32 px (styles.css:20582).
- **Preuve** : styles.css:22454-22459 : sous pointer: coarse, Vue ▾, Nœuds, Planificateur, Inspecteur, Guide, Actions, Annuler, Rétablir à min-height 44px ; styles.css:22464-22466 : liste des cartes à 44px ; styles.css:24337-24339 et 27686-27690 : le .btn de la bibliothèque à 44px
- Réponse de Grégoire :
- Disposition :

#### 4.142 · en partie
*Écran* : Écran 36 · Conception › Carte d'alignement › Planificateur · *Geste* : Sans geste

- **Intention** (l. 1815) : « À la rentrée, un planificateur vide propose de reprendre la carte du même cours de la session précédente, en un clic »
- **Ce que fait le code** : Avec un seul candidat, la reprise se fait en un clic ; avec plusieurs, le bouton ouvre la Bibliothèque pour choisir (11109-11116), et le code ne désigne pas la session précédente (aucun tri chronologique, planification-donnees.js:450-455).
- **Preuve** : js/planification-carte.js:10326-10329 et 11086-11121 : un planificateur vide affiche « Reprendre « X » (trimestre) », qui reprend la carte en un clic quand il n'y a qu'un candidat ; js/planification-donnees.js:458-469 liste les cartes du même cours dans les autres trimestres
- Réponse de Grégoire :
- Disposition :

#### 4.154 · en partie
*Écran* : Écran 38 · Conception › Carte d'alignement › Guide · *Geste* : Geste : Lire le guide de la carte

- **Intention** (l. 1843) : « tous les guides partagent la même présentation »
- **Ce que fait le code** : Le corps du texte est unifié, mais la navigation diffère (guide de la carte : boutons de 28 px et points de 7 px, styles.css:22590-22611 ; guides pédagogiques : boutons de 44 px, styles.css:23214-23225) et les références aussi (.guide-pedagogique-ref en italique avec filet, styles.css:23196-23204, contre .planif-guide-ref à opacité 0,7, styles.css:22575-22578).
- **Preuve** : styles.css:23151-23188 : même taille de texte, mêmes listes et mêmes encadrés pour .planif-guide-corps et .guide-pedagogique-corps
- Réponse de Grégoire :
- Disposition :

#### 4.163 · en partie
*Écran* : Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) · *Geste* : Geste : Ajouter un élément de la bibliothèque à sa sélection (barre latérale)

- **Intention** (l. 1871) : « le refus nomme l'exemplaire présent : « « X » est déjà dans ta sélection. » et propose « Dupliquer » »
- **Ce que fait le code** : Le refus nomme l'exemplaire et renvoie à « Dupliquer » par une phrase, sans bouton ; pour une pratique déjà présente sous le même id, le message reste « Cette pratique est déjà dans ta sélection. » sans nom ni renvoi (js/pratiques-gestion.js:899-901).
- **Preuve** : js/grilles.js:2688, js/echelles.js:1387, js/cartouches.js:4547 (alert), js/productions-bibliotheque-ui.js:356-358 et js/pratiques-gestion.js:904-906 (notification) : « « X » est déjà dans ta sélection. » suivi de « Pour en avoir un second exemplaire, utilise « Dupliquer ». »
- Réponse de Grégoire :
- Disposition :

#### 4.169 · en partie
*Écran* : Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) · *Geste* : Geste : Supprimer un élément

- **Intention** (l. 1883) : « la corbeille remplace le « ✕ » rouge, les chevrons à côté du nom remplacent la colonne « Ordre » »
- **Ce que fait le code** : La corbeille remplace le ✕ et les chevrons remplacent la colonne « Ordre », mais ils sont placés dans le bloc d'outils en coin (bloc-coin-outils), pas à côté du nom ; et deux tableaux du matériel gardent un bouton rouge plein (js/pratiques-gestion.js:1886, 2033).
- **Preuve** : js/ui-blocs.js:69-86 : boutonRetirerBloc rend une corbeille (icons8-trash.svg), utilisée dans la bibliothèque (js/bibliotheque-ui.js:1583) et l'éditeur d'échelles (js/echelles.js:1978, 2458) ; js/echelles.js:1970-1977 et 2450-2456 : chevrons à la place de la cellule « Ordre »
- Réponse de Grégoire :
- Disposition :

#### 4.178 · en partie
*Écran* : Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) · *Geste* : Geste : Lire le bandeau des doublons

- **Intention** (l. 1907) : « chaque ligne porte le nom, l'identifiant court, la date de modification, et « Dans ta barre latérale » ou « Bibliothèque partagée » ; un groupe mixte est classé « Copies » avec un numéro de lignée ; tous les groupes sont dépliés »
- **Ce que fait le code** : Tout est là et aucun groupe n'est replié, mais la seconde étiquette dit « Bibliothèque » et non « Bibliothèque partagée » (js/bibliotheque-ui.js:1198).
- **Preuve** : js/bibliotheque-ui.js:1192-1199 : chaque ligne porte le nom, la puce d'identifiant court, « modifié le » et la date, puis « Dans ta barre latérale » ou « Bibliothèque » ; js/identite-item.js:188-209 classe un groupe mixte en « copie » ; js/bibliotheque-ui.js:1147 et 1184-1186 numérotent les lignées
- Réponse de Grégoire :
- Disposition :

#### 4.181 · pas fait
*Écran* : Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) · *Geste* : Geste : Lire le bandeau des doublons

- **Intention** (l. 1910) : « les doublons se comparent côte à côte, et « Tout fusionner » les réunit en un seul »
- **Ce que fait le code** : Aucune vue de comparaison côte à côte des doublons ni de commande « Tout fusionner » dans le code ; le bandeau ne propose que Voir, Retirer et Supprimer.
- **Preuve** : « Tout fusionner », « fusionner », « côte à côte », « comparer » dans js/bibliotheque-ui.js, js/identite-item.js, js/grilles.js, js/echelles.js, js/cartouches.js, js/productions-bibliotheque-ui.js, js/pratiques-gestion.js, js/modal-doublon.js ; grep -rln fusionner sur js/ (seulement fusion de données ailleurs)
- Réponse de Grégoire :
- Disposition :

#### 4.183 · en partie
*Écran* : Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) · *Geste* : Sans geste

- **Intention** (l. 1920) : « (une puce grise), complet au survol, lisible sur iPad sans zoomer et en mode clair »
- **Ce que fait le code** : La puce et l'identifiant complet au survol existent, mais la puce est teintée de bleu et non grise (styles.css:89-91 et 492-494), et les cartes « Partagés par des collègues » n'en portent pas (js/partage-section.js:651-680, sans afficherId) ; la lisibilité sur iPad reste à voir à l'écran.
- **Preuve** : js/bibliotheque-ui.js:42-47 : puce « #xxxxxx » avec title « Identifiant complet : … » ; styles.css:4611-4629 : 0.875rem, chasse fixe ; affichée sur les cartes des cinq familles (afficherId: true, ex. js/grilles.js:2265, 2303)
- Réponse de Grégoire :
- Disposition :

#### 4.184 · en partie
*Écran* : Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles) · *Geste* : Sans geste

- **Intention** (l. 1921) : « la carte importée est amenée à l'écran et mise en évidence, dans les cinq familles ; si un filtre la masque, la notification le dit »
- **Ce que fait le code** : La mise en évidence est faite dans les cinq familles, mais la notification ne dit qu'une carte est masquée que si c'est la case « Masquer… » (ou le filtre démo des grilles) ; un dossier replié ou un autre filtre la laisse muette (js/bibliotheque-ui.js:1334-1339), et rien ne se passe si la bibliothèque est fermée.
- **Preuve** : js/bibliotheque-ui.js:1326-1340 : conduireAuxImportes redessine la bibliothèque ouverte, fait défiler jusqu'aux cartes importées et les entoure (pointerVersItems, 1280-1306) ; appelé par les cinq familles (grilles.js:2076, echelles.js:1043, cartouches.js:2100, productions-import-export.js:343, pratiques-gestion.js:2537)
- Réponse de Grégoire :
- Disposition :

#### 4.186 · en partie
*Écran* : Écran 41 · Partage entre collègues · *Geste* : Geste : Exporter pour partager

- **Intention** (l. 1929) : « licence CC BY-NC-SA 4.0, attribution, et exactement ce que le fichier contiendra »
- **Ce que fait le code** : La licence et l'attribution sont récapitulées, mais le contenu n'est donné que par un compte avec une parenthèse générique « (grille et cartouches associées) », pas la liste exacte de ce que le fichier contiendra.
- **Preuve** : js/partage-export.js:275-279 : la fenêtre dit la licence (« sous licence CC BY-NC-SA 4.0 ») et l'attribution ; js/partage-export.js:238-250 : l'item principal et un nombre de ressources liées
- Réponse de Grégoire :
- Disposition :

#### 4.195 · en partie
*Écran* : Écran 41 · Partage entre collègues · *Geste* : Geste : Importer un partage (.lcz)

- **Intention** (l. 1947) : « un paquet de pratique emporte son échelle ; à l'import, la pratique suit cette échelle, même si celle-ci change d'identifiant »
- **Ce que fait le code** : La pratique suit son échelle quand l'échelle change d'identifiant dans ces deux chemins, mais un paquet .lcz de pratique n'emporte pas son échelle : rassemblerDependances n'ajoute aucune dépendance pour une pratique (js/partage-format.js:40-41 et 241).
- **Preuve** : js/import-export.js:137-150 et 3395 : rebrancherEchellePratique fait suivre à une pratique son échelle renommée, à l'import sélectif et à la réouverture d'archive (js/reserve-ouvrir.js:1155)
- Réponse de Grégoire :
- Disposition :

### Partie 5 (24)

#### 5.4 · en partie
*Écran* : Écran 43 · Évaluation (toute la section) · *Geste* : Sans geste

- **Intention** (l. 2012) : « En mode anonymisation, on travaille normalement et tout s'enregistre ; seul l'affichage protège l'identité ; aucune valeur de substitution (« Élève 32 », DA masqué) n'est écrite dans les données réelles ; rien d'identifiant ne s'affiche »
- **Ce que fait le code** : L'écriture est faite comme dit. L'affichage n'est pas entièrement protégé : anonymiserDonnees (js/modes.js:1386-1407) garde le vrai DA dans « da » et met le masque dans « daAffichage », que ces deux menus ne lisent pas ; le DA réel s'affiche donc même quand l'option de DA masqué est active.
- **Preuve** : js/modes.js:1185-1187 et 927-983 : en anonymisation on écrit comme en mode normal, après retrait des substitutions (« Élève N », DA masqué, groupe « Gr. A ») ; mais js/liste-evaluations.js:1827 affiche le vrai DA (e.da) dans le menu Étudiant·e de « Propriétés du fichier », et js/travaux-import.js:1550 aussi
- Réponse de Grégoire :
- Disposition :

#### 5.18 · en partie
*Écran* : Écran 44 · Évaluation › Liste des évaluations · *Geste* : Geste : Lire et trier la liste

- **Intention** (l. 2027) : « son infobulle propose de filtrer par statut (« …annotée, évaluée, non verrouillée (ne compte pas encore dans la note) ») ou par type de jeton »
- **Ce que fait le code** : L'infobulle existe et propose bien statut ou type de jeton, mais au masculin (« annoté, évalué ») là où l'intention cite « annotée, évaluée ».
- **Preuve** : js/accompagnement-contenu-hover.js:317-318 : l'infobulle eval-filtre-statut dit « Filtre par statut de progression : non reçu, reçu, importé, annoté, évalué, non verrouillée (ne compte pas encore dans la note) ... ou par type de jeton. »
- Réponse de Grégoire :
- Disposition :

#### 5.20 · en partie
*Écran* : Écran 44 · Évaluation › Liste des évaluations · *Geste* : Geste : Lire et trier la liste

- **Intention** (l. 2028) : « le filtre Statut offre, dans cet ordre : « Toutes », « Non reçue », « Reçue », « Importée », « Annotée », « Évaluée », « Non verrouillée », « Non évaluée », « Non associée », « Jeton de délai », « Jeton de reprise », « Jeton de reprise ciblée », « Tous les jetons », « Remplacée » »
- **Ce que fait le code** : L'ordre est celui de l'intention, mais les libellés ne sont pas accordés au féminin (« Tous » au lieu de « Toutes », « Non reçu », « Reçu », « Importé », « Annoté », « Évalué », « Non évalué », « Non associé »). Aucun code JS ne réécrit ces options.
- **Preuve** : index.html:8257-8271 : les options du filtre Statut sont, dans l'ordre : « Tous », « Non reçu », « Reçu », « Importé », « Annoté », « Évalué », « Non verrouillée », « Non évalué », « Non associé », « Jeton de délai », « Jeton de reprise », « Jeton de reprise ciblée », « Tous les jetons », « Remplacée »
- Réponse de Grégoire :
- Disposition :

#### 5.23 · en partie
*Écran* : Écran 44 · Évaluation › Liste des évaluations · *Geste* : Geste : Lire et trier la liste

- **Intention** (l. 2030) : « la mention « Fichier sous… » ne paraît que lorsqu'elle est la seule trace du fichier, jamais sur les travaux à venir »
- **Ce que fait le code** : Le cas des fichiers visibles ailleurs dans le tableau est réglé. Il reste un cas : un fichier sous le portfolio fait paraître « Fichier sous … » sur chaque ligne sans fichier de cet élève, travaux à venir compris, car aucune condition ne porte sur la date ou la remise.
- **Preuve** : js/liste-evaluations.js:105-121 : la mention n'est posée que pour un fichier rangé sous une production qui n'a pas de ligne (productionGenereUneLigne, :30-32, écarte le portfolio), donc quand elle est la seule trace ; mais elle est alors posée sur toutes les lignes sans copie de l'élève
- Réponse de Grégoire :
- Disposition :

#### 5.26 · en partie
*Écran* : Écran 44 · Évaluation › Liste des évaluations · *Geste* : Geste : Choisir « Évaluer » dans le menu « Actions… »

- **Intention** (l. 2036) : « si la copie est importée, elle s'ouvre directement en mode Évaluer, annotée ou non, et « Annoter » reste à un clic »
- **Ce que fait le code** : L'ouverture directe en mode Évaluer est faite. « Annoter » demande deux clics (ouvrir le menu, puis choisir), et non un seul.
- **Preuve** : js/evaluation.js:216-229 : evaluerProduction ouvre la copie importée (travauxUI.ouvrirFichier) puis bascule en mode Évaluer (basculerMode('evaluer')), qu'elle soit annotée ou non ; js/travaux-ui.js:1180-1183 : « Annoter » est un article du menu déroulant « Évaluer ▾ »
- Réponse de Grégoire :
- Disposition :

#### 5.28 · en partie
*Écran* : Écran 44 · Évaluation › Liste des évaluations · *Geste* : Geste : Choisir « Consulter »

- **Intention** (l. 2042) : « sur un trimestre en lecture seule, en lecture seule »
- **Ce que fait le code** : La lecture seule d'un trimestre clos repose sur une règle CSS : les boutons qu'elle vise sont ceux à onclick (index.html:1153-1156), qui n'existent plus ; les boutons data-action (cadenas, Enregistrer, outils d'annotation) restent actifs, et sauvegarderDonneesSelonMode (js/modes.js:1178) ne refuse pas d'écrire dans un trimestre archivé. Une évaluation non verrouillée n'y est donc pas en lecture seule complète.
- **Preuve** : js/evaluation.js:1603-1611 : une évaluation verrouillée se charge avec desactiverFormulaireEvaluation(true) ; index.html:1150-1167 : en trimestre archivé, body.mode-archive coupe le pointeur sur input, textarea et select
- Réponse de Grégoire :
- Disposition :

#### 5.45 · en partie
*Écran* : Écran 44 · Évaluation › Liste des évaluations · *Geste* : Geste : Supprimer une évaluation (« Supprimer l'évaluation »)

- **Intention** (l. 2081) : « le même geste se comporte de la même façon depuis la Liste, le profil ou le panneau d'évaluation »
- **Ce que fait le code** : Seule la Liste offre le geste. Le panneau d'évaluation et le profil n'ont pas de déclencheur ; la banque d'évaluations a sa propre suppression (js/evaluation.js:2543-2562) avec une autre confirmation, sans proposition de codex ni retour de l'originale.
- **Preuve** : js/liste-evaluations.js:1670-1671 : la Liste appelle supprimerEvaluation (:2222) ; js/evaluation.js:3081-3090 : confirmerSuppressionEvaluationSidebar appelle la même fonction mais aucun bouton ne la déclenche ; js/profil-etudiant-actions.js:753-756 : le geste du profil a été retiré
- Réponse de Grégoire :
- Disposition :

#### 5.49 · pas fait
*Écran* : Écran 44 · Évaluation › Liste des évaluations · *Geste* : Geste : Ouvrir la corbeille et supprimer définitivement une copie

- **Intention** (l. 2095) : « quand d'autres fichiers du même couple restent (une reprise encore active), la question le dit : ils restent, mais sans évaluation »
- **Ce que fait le code** : La question ne dit jamais que d'autres fichiers du couple (une reprise encore active) restent, sans évaluation.
- **Preuve** : js/liste-evaluations.js:2928-2930 : la question n'a que deux formes, avec ou sans évaluations du couple ; rien ne compte ni ne nomme les autres fichiers du même couple qui restent
- Réponse de Grégoire :
- Disposition :

#### 5.64 · en partie
*Écran* : Écran 45 · Évaluation › Préparer et importer · *Geste* : Geste : Laisser l'import assembler les pages d'une remise

- **Intention** (l. 2126) : « rangé par date »
- **Ce que fait le code** : Le document assemblé est rangé par date, mais l'aperçu ne l'est pas ; et l'ordre fait à la main dans l'aperçu (Monter, Descendre, js/travaux-import.js:1825-1843) est retrié par date à l'assemblage (js/travaux-ui.js:4653) dès que les fichiers portent une date.
- **Preuve** : js/travaux-import.js:1338-1352 : à l'assemblage, les pages sont triées par numéro de page, puis par date de remise ; js/travaux-ui.js:1865 : l'aperçu montre la file dans l'ordre du dépôt
- Réponse de Grégoire :
- Disposition :

#### 5.69 · en partie
*Écran* : Écran 45 · Évaluation › Préparer et importer · *Geste* : Geste : Résoudre un doublon à l'import (remplacer, ou appliquer un jeton de reprise)

- **Intention** (l. 2136) : « et jamais pour un fichier sans élève »
- **Ce que fait le code** : La vérification porte sur l'élève du fichier existant, pas sur celui du nouveau : dans un doublon « même nom et même taille » (js/travaux-import.js:826-841), un nouveau fichier sans DA face à un existant rattaché à un élève se voit offrir le jeton.
- **Preuve** : js/travaux-ui.js:4243 et 4297-4304 : le bouton n'est offert que si _jetonRepriseOffrable rend vrai (jetons restants et maximum par production), et jamais si le fichier EXISTANT n'a pas d'élève
- Réponse de Grégoire :
- Disposition :

#### 5.70 · en partie
*Écran* : Écran 45 · Évaluation › Préparer et importer · *Geste* : Geste : Résoudre un doublon à l'import (remplacer, ou appliquer un jeton de reprise)

- **Intention** (l. 2137) : « si le jeton ne peut pas être appliqué, une erreur explicite dit que le fichier est importé comme reprise et qu'aucun jeton n'est consommé »
- **Ce que fait le code** : Fait pour le choix « Appliquer comme jeton de reprise » de la fenêtre de doublon. Le balayage d'après import (mode « Jeton de reprise » du sélecteur) se tait quand le maximum est atteint (js/travaux-ui.js:4543-4547, « Ne pas notifier si c'est juste une limite »).
- **Preuve** : js/travaux-ui.js:4366-4377 : dans la fenêtre de doublon, un jeton refusé donne l'erreur « Jeton non appliqué : Le fichier de … est importé comme reprise, mais aucun jeton n'a été consommé (maximum de reprises atteint pour cette production). »
- Réponse de Grégoire :
- Disposition :

#### 5.72 · en partie
*Écran* : Écran 45 · Évaluation › Préparer et importer · *Geste* : Geste : Résoudre un doublon à l'import (remplacer, ou appliquer un jeton de reprise)

- **Intention** (l. 2138) : « codex proposé après le choix « Remplacer l'existante », avant le remplacement, s'il n'est pas à jour »
- **Ce que fait le code** : C'est fait pour la fenêtre « Conflit de nom » des modèles (grilles, échelles, cartouches). Dans la fenêtre « Doublon détecté » des copies à l'import, le bouton s'appelle « Remplacer l'existant » et ne propose pas le codex (js/travaux-ui.js:4394-4419) ; l'ancienne copie y va à la corbeille.
- **Preuve** : js/modal-doublon.js:290-293 : après « Remplacer l'existante » et avant le remplacement, Codex.proposerAvantSuppression('remplacement') est demandé
- Réponse de Grégoire :
- Disposition :

#### 5.77 · en partie
*Écran* : Écran 45 · Évaluation › Préparer et importer · *Geste* : Geste : Régler une copie dans le poste de préparation (résolution, balance, « + Ajouter des pages »)

- **Intention** (l. 2151) : « le sélecteur global « Production » n'écrase pas une correction faite sur un fichier précis par « Modifier », et l'écran explique la différence »
- **Ce que fait le code** : Fait pour le choix d'une production. Le choix « Jeton de reprise » du même sélecteur remet à vide la production de tous les fichiers de la file, corrections à la main comprises (js/travaux-ui.js:2490-2497).
- **Preuve** : js/travaux-ui.js:2505-2509 : le sélecteur global saute un fichier corrigé à la main (productionIdParFichier) ; js/travaux-ui.js:1942 : l'écran dit « S'applique à tout le lot. Une correction faite via « Modifier » sur un fichier est conservée. »
- Réponse de Grégoire :
- Disposition :

#### 5.79 · pas fait
*Écran* : Écran 45 · Évaluation › Préparer et importer · *Geste* : Geste : Modifier les pages d'une copie (éditeur de pages)

- **Intention** (l. 2155) : « une page retirée emporte ses annotations »
- **Ce que fait le code** : Les annotations sont rangées par numéro de page (js/travaux-annotation.js:350-362) ; aucune ne part avec la page retirée, ni n'est renumérotée.
- **Preuve** : js/travaux-ui.js:6441-6449 (supprimerPageEditeur) retire la page de editionPages ; js/travaux-ui.js:6645-6727 (sauvegarderEdition) réécrit le fichier sans toucher aux annotations
- Réponse de Grégoire :
- Disposition :

#### 5.85 · en partie
*Écran* : Écran 45 · Évaluation › Préparer et importer · *Geste* : Geste : Choisir le rangement des copies sur disque

- **Intention** (l. 2168) : « et quels navigateurs le permettent »
- **Ce que fait le code** : Le texte visible ne dit ni que c'est un réglage de sécurité ni quels navigateurs le permettent ; l'infobulle le dit en partie, par la négative, sans nommer les navigateurs qui le permettent.
- **Preuve** : js/travaux-ui.js:895-903 : sous le bouton, « L'accès au dossier sera redemandé à chaque démarrage. Pour le mémoriser : Réglages > Préférences > Sécurité. » ; js/accompagnement-contenu-hover.js:404-405 : l'infobulle dit que c'est un choix de sécurité et que le stockage n'existe « ni dans Safari, ni dans Firefox, ni dans aucun navigateur de tablette »
- Réponse de Grégoire :
- Disposition :

#### 5.88 · en partie
*Écran* : Écran 45 · Évaluation › Préparer et importer · *Geste* : Sans geste

- **Intention** (l. 2178) : « un cercle barré quand il n'y a rien à lire, des points pendant le calcul »
- **Ce que fait le code** : Pour une photo, cercle barré et points sont faits. Pour un PDF, ni le cercle barré ni les points ne paraissent : l'icône de page s'affiche quel que soit l'état.
- **Preuve** : js/travaux-ui.js:1544-1548 : absent → icons/icon-unavailable.svg (cercle barré), attente → points de suspension ; mais js/travaux-ui.js:1565 : pour un PDF hors échec, le signe est toujours 📄
- Réponse de Grégoire :
- Disposition :

#### 5.117 · pas fait
*Écran* : Écran 46 · Évaluation › Annoter et évaluer · *Geste* : Geste : Chronométrer l'évaluation

- **Intention** (l. 2238) : « sans copie, donc sans annotation, l'enseignant le lance lui-même »
- **Ce que fait le code** : Aucun bouton ni geste ne permet à l'enseignant de lancer lui-même le chronomètre ; le chronomètre vit dans la barre de la visionneuse (travaux-ui.js:1220), absente du formulaire sans copie.
- **Preuve** : js/travaux-annotation.js:468-471 : seul appel de demarrerChrono, à la première annotation ; js/travaux-ui.js:80-84 : le bouton chrono-btn-pause reste caché tant que le chronomètre n'est pas lancé et ne fait que pause et reprise (:143-146)
- Réponse de Grégoire :
- Disposition :

#### 5.146 · en partie
*Écran* : Écran 46 · Évaluation › Annoter et évaluer · *Geste* : Geste : Appliquer ou retirer un jeton (délai, reprise)

- **Intention** (l. 2307) : « « Choisis d'abord un niveau : l'évaluation n'existe pas encore. » »
- **Ce que fait le code** : Le message existe mot pour mot, mais seulement pour la reprise ; le jeton de délai sans évaluation suit une autre règle, silencieuse.
- **Preuve** : js/evaluation-sauvegarde.js:924-929 : le message exact « Choisis d'abord un niveau : l'évaluation n'existe pas encore. » pour le jeton de reprise ; js/evaluation-sauvegarde.js:891-900 et :288-296 : pour le délai, sans évaluation, la case reste cochée sans message et le jeton s'applique au verrouillage
- Réponse de Grégoire :
- Disposition :

#### 5.156 · en partie
*Écran* : Écran 46 · Évaluation › Annoter et évaluer · *Geste* : Geste : Verrouiller l'évaluation (bouton ou cadenas), ou la déverrouiller

- **Intention** (l. 2320) : « profil et bilan : « évaluation non verrouillée, non comptée » »
- **Ce que fait le code** : Le profil a les mots exacts ; le récit des résultats les écrit avec un point médian au lieu de la virgule, et aucun « bilan » portant la tournure exacte n'a été trouvé hors du profil.
- **Preuve** : js/profil-etudiant-sections-affichage.js:3013 et :4008 : « évaluation non verrouillée, non comptée » (et son pluriel) au profil ; js/profil-etudiant-actions.js:607 : le récit des résultats écrit « évaluation non verrouillée · non comptée »
- Réponse de Grégoire :
- Disposition :

#### 5.182 · en partie
*Écran* : Écran 47 · Évaluation › Exporter et archiver · *Geste* : Geste : Lancer l'export pour Léa

- **Intention** (l. 2381) : « un élève en échec n'avorte pas le lot ; un bilan final dit « N réussis, M échoués : … » »
- **Ce que fait le code** : Le lot n'avorte pas et la copie sans page de synthèse est signalée (:791-797), mais le bilan n'a pas la forme « N réussis, M échoués : … ».
- **Preuve** : js/travaux-archivage.js:457-492 : un élève en échec est attrapé et la boucle continue ; js/travaux-archivage.js:786-789 : le bilan dit « N exporté(s) sur T, M en échec : » et ne paraît que s'il y a un échec ou une copie sans synthèse
- Réponse de Grégoire :
- Disposition :

#### 5.184 · en partie
*Écran* : Écran 47 · Évaluation › Exporter et archiver · *Geste* : Geste : Lancer l'export pour Léa

- **Intention** (l. 2383) : « une note en ,5 s'arrondit vers le haut »
- **Ce que fait le code** : La règle existe, mais là où le changelog 1.152 la place ; les PDF de l'export Léa n'arrondissent pas à l'entier, donc la règle n'y joue pas.
- **Preuve** : js/portfolio.js:307-309 : arrondirIndiceSurCent fait monter une note exactement en ,5 (57,5 donne 58), pour le fichier des résultats finaux destiné à Léa (js/export-resultats-finaux.js:70-75), le profil et le Comparateur ; js/synthese-retroaction-data.js:1261 et js/synthese-retroaction-rendu.js:707 : les PDF de l'export Léa écrivent les notes au dixième
- Réponse de Grégoire :
- Disposition :

#### 5.208 · en partie
*Écran* : Écran 47 · Évaluation › Exporter et archiver · *Geste* : Geste : Lire l'aide « Exporter et archiver les travaux »

- **Intention** (l. 2424) : « la fiche « i » s'intitule « Deux modes d'archivage » »
- **Ce que fait le code** : Les mots sont là, mais comme intertitre de la liste à l'intérieur de la fiche, pas comme titre de la fiche.
- **Preuve** : js/accompagnement-contenu-popup.js:510-524 : la fiche « i » archiver-travaux s'intitule « Exporter et archiver » ; « Deux modes d'archivage » est le titre de sa liste (:519)
- Réponse de Grégoire :
- Disposition :

#### 5.214 · en partie
*Écran* : Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse) · *Geste* : Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)

- **Intention** (l. 2442) : « la colonne « Observations » liste les tampons, une colonne par catégorie utilisée »
- **Ce que fait le code** : Les tampons sont listés par catégorie en colonnes, mais la section porte le titre « Commentaires ciblés (tampons) » et non « Observations ».
- **Preuve** : js/synthese-retroaction-rendu.js:500-513 : une colonne par catégorie de tampons utilisée, dans une grille de colonnes, sous l'intertitre « Commentaires ciblés (tampons) »
- Réponse de Grégoire :
- Disposition :

#### 5.220 · en partie
*Écran* : Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse) · *Geste* : Geste : Produire le PDF de rétroaction d'une copie (ou la synthèse seule)

- **Intention** (l. 2454) : « « Cette copie n'a pas de note ni de niveau général : ‹critère› (‹pondération›) reste à évaluer. » »
- **Ce que fait le code** : Il manque « de note ni » : le texte de la version observée est celui du 2 sept., pas celui de l'intention.
- **Preuve** : js/synthese-retroaction-rendu.js:410 et :414-417 : la phrase imprimée est « Cette copie n'a pas de niveau général : ‹critère› (‹pondération›) reste à évaluer. »
- Réponse de Grégoire :
- Disposition :

### Partie 6 (14)

#### 6.5 · en partie
*Écran* : Écran 49 · Suivi (commun aux quatre écrans de cette partie) · *Geste* : Sans geste

- **Intention** (l. 2491) : « Tout ce qui s'enregistre le dit par un même témoin en bas de l'écran »
- **Ce que fait le code** : Le témoin commun existe et la plupart des écrivains passent par lui (modes.js:1128-1150). Certains gestes de l'usager écrivent pourtant en silence, par exemple les préférences du rapport du profil (cocherSectionRapport → sauvegarderPreferencesRapport).
- **Preuve** : js/temoin-enregistrement.js:60-160 et styles.css:6138-6146 : un témoin unique en bas à gauche ; mais js/profil-etudiant-rapport.js:496-507 écrit les cases « Inclure… » par db.setSync sans annonce
- Réponse de Grégoire :
- Disposition :

#### 6.6 · en partie
*Écran* : Écran 49 · Suivi (commun aux quatre écrans de cette partie) · *Geste* : Sans geste

- **Intention** (l. 2491) : « « Non enregistré » et la raison en cas d'échec, qui reste affiché jusqu'à la prochaine écriture réussie »
- **Ce que fait le code** : Le message et la raison s'affichent et ne s'effacent avec aucun délai, mais la règle diffère : une écriture réussie d'une autre clé ne l'efface pas, et l'usager peut le fermer à la main.
- **Preuve** : js/temoin-enregistrement.js:151-167 et 129-140 : « Non enregistré : ‹raison› » reste affiché jusqu'à une écriture réussie de LA MÊME clé, ou jusqu'au bouton Fermer (×)
- Réponse de Grégoire :
- Disposition :

#### 6.16 · en partie
*Écran* : Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écrans) · *Geste* : Sans geste

- **Intention** (l. 2516) : « colorent les colonnes A, C, P et Mobilisation de la Liste »
- **Ce que fait le code** : Les seuils d'interprétation colorent bien A, C et P de la Liste, mais aucune colonne Mobilisation n'existe (obtenirCouleurMobilisation, js/etudiants.js:1544, ne sert à aucune colonne).
- **Preuve** : js/etudiants.js:1187-1205 : A, C et P sont colorés par obtenirCouleurSelonSeuils (js/contexte-qualification.js:217-230) ; index.html:7745-7781 : la Liste n'a pas de colonne Mobilisation
- Réponse de Grégoire :
- Disposition :

#### 6.37 · en partie
*Écran* : Écran 52 · Suivi › Suivi du groupe · *Geste* : Geste : lire « Observation globale des besoins d'intervention »

- **Intention** (l. 2594) : « Sortie : la barre RàI du groupe et la carte Contexte disent « En attente » tant qu'aucun travail n'est dû et qu'aucune copie du groupe n'est évaluée »
- **Ce que fait le code** : La barre RàI du groupe suit la règle (niveau 0 « En attente » tant que rien n'est dû ou évalué), avec un libellé un peu différent. Aucune « carte Contexte » du Suivi du groupe n'applique cette règle : la carte Contexte d'apprentissage du profil dit « En attente » selon les remises de l'élève lui-même (js/profil-etudiant-calculs.js:1937-1952), pas selon le groupe.
- **Preuve** : js/tableau-bord-apercu.js:2586-2597 : la barre RàI dit « En attente de données pour N étudiant(s). » quand tous sont au niveau 0 ; règle travail dû et copie évaluée : js/profil-etudiant-calculs.js:1726-1755 et 1799-1832
- Réponse de Grégoire :
- Disposition :

#### 6.40 · en partie
*Écran* : Écran 52 · Suivi › Suivi du groupe · *Geste* : Geste : lire la barre « Structure des apprentissages fondamentaux »

- **Intention** (l. 2600) : « Sortie : la phrase écrit « difficulté récente » (une seule production récente sous le seuil) et non « émergente » »
- **Ce que fait le code** : Le mot « émergente » a quitté la phrase, mais elle n'écrit pas « difficulté récente » d'un tenant : elle dit « en difficulté sur les fondamentaux (N récente) ».
- **Preuve** : js/tableau-bord-apercu.js:1475-1483 : la phrase écrit « N (x %) en difficulté sur les fondamentaux (1 récente, …) » ; js/profil-etudiant-calculs.js:1230-1232 : diagnostic « Difficulté récente » pour IPB = 1
- Réponse de Grégoire :
- Disposition :

#### 6.46 · en partie
*Écran* : Écran 53 · Suivi › Liste des étudiant·es · *Geste* : Geste : ouvrir la Liste

- **Intention** (l. 2627) : « Sortie : les colonnes A, C, P et Mobilisation sont colorées selon les seuils d'interprétation »
- **Ce que fait le code** : Trois des quatre colonnes nommées sont colorées selon les seuils ; la colonne Mobilisation n'existe pas.
- **Preuve** : js/etudiants.js:1187-1205 : A, C, P colorés selon seuilsInterpretation ; index.html:7745-7781 : aucune colonne Mobilisation dans la Liste
- Réponse de Grégoire :
- Disposition :

#### 6.53 · en partie
*Écran* : Écran 54 · Suivi › Profils individuels (le profil d'un élève) · *Geste* : Geste : ouvrir le profil d'un élève (sélecteur, Liste ou Suivi du groupe)

- **Intention** (l. 2667) : « un élève qui n'est plus dans le groupe : « N'est plus dans le groupe », sans calcul »
- **Ce que fait le code** : « Sans calcul » est fait, mais aucun écran n'écrit « N'est plus dans le groupe » ; horsGroupe n'est lu nulle part.
- **Preuve** : js/indices.js:536-540 : un DA hors du groupe n'est pas calculé (horsGroupe: true) ; js/profil-etudiant-sections-affichage.js:2530-2533 : le profil répond par alert('Étudiant·e introuvable')
- Réponse de Grégoire :
- Disposition :

#### 6.64 · en partie
*Écran* : Écran 54 · Suivi › Profils individuels (le profil d'un élève) · *Geste* : Geste : lire la section Productions (productions et évaluations)

- **Intention** (l. 2686) : « le profil dit combien d'évaluations ont été écartées (ex. « 2 évaluations en brouillon, non comptées ») »
- **Ce que fait le code** : Le profil dit bien combien d'évaluations sont écartées, mais avec « non verrouillée » au lieu de « en brouillon » (mot de la décision suivante, voir 6.67).
- **Preuve** : js/profil-etudiant-sections-affichage.js:4003-4017 : « N évaluation(s) non verrouillée(s), non comptée(s) » et « N évaluation(s) sans critère évalué, non comptée(s) » ; affiché 1173-1175, 3139, 3209
- Réponse de Grégoire :
- Disposition :

#### 6.65 · en partie
*Écran* : Écran 54 · Suivi › Profils individuels (le profil d'un élève) · *Geste* : Geste : lire la section Productions (productions et évaluations)

- **Intention** (l. 2687) : « un travail diagnostique ne compte pas parmi les travaux évalués du profil »
- **Ce que fait le code** : Le décompte « N évaluées » de la note exclut le diagnostique ; le « sur N » de la section Accompagnement le compte encore (evaluationEntreDansLaNote, js/pratiques/pratique-registre.js:842-849, ne regarde pas le diagnostique).
- **Preuve** : js/profil-etudiant-actions.js:452-461 : la note (calculerDetailsNoteFinale) retire les productions diagnostiques ; mais js/profil-etudiant-sections-affichage.js:954 : le « (sur N) » de la carte RàI compte les évaluations sans ce filtre
- Réponse de Grégoire :
- Disposition :

#### 6.75 · en partie
*Écran* : Écran 54 · Suivi › Profils individuels (le profil d'un élève) · *Geste* : Geste : lire la section Développement des habiletés (onglets Critères, Forces et défis, Gestes cognitifs)

- **Intention** (l. 2710) : « le seuil de défi réglé dans Labo agit sur la couleur des badges « Forces et défis » et sur le défi principal de la carte RàI »
- **Ce que fait le code** : Le seuil agit sur le défi principal ; l'onglet Forces et défis montre des barres sur le dégradé de l'échelle (3683-3714), sans badge coloré par ce seuil.
- **Preuve** : js/profil-etudiant-calculs.js:1272-1276 : le seuil defiSpecifique décide du défi principal de la carte RàI ; mais js/profil-etudiant-sections-affichage.js:4184-4192 : obtenirCouleurBadge, qui lit ce seuil, n'est appelée nulle part
- **Second tri** : fait ; Le même seuil réglé dans le Labo décide du vert des badges Forces et défis et du critère retenu comme « Défi principal » de la carte RàI.
- Réponse de Grégoire :
- Disposition :

#### 6.94 · pas fait
*Écran* : Écran 54 · Suivi › Profils individuels (le profil d'un élève) · *Geste* : Geste : cocher des artefacts dans le panneau Portfolio

- **Intention** (l. 2754) : « les cases cochées automatiquement suivent le mode choisi (« N derniers », meilleurs, hybride avec le bloc Obligatoires) ; en hybride, on peut cocher à la main autant d'artefacts que la note en compte ; la note du cours n'en dépend pas »
- **Ce que fait le code** : Il n'y a pas, en 1.199.0, de panneau Portfolio avec des cases à cocher dans le profil.
- **Preuve** : js/portfolio.js:139-144 : chargerPortfolioEleveDetail et toggleArtefactPortfolio retirées (#722), leur conteneur #portfolioEleveDetail n'existe pas ; selectionnerArtefactsSelonModalite (78) n'a plus d'appelant
- Réponse de Grégoire :
- Disposition :

#### 6.100 · en partie
*Écran* : Écran 54 · Suivi › Profils individuels (le profil d'un élève) · *Geste* : Geste : lire une note par travail avec la note différée active

- **Intention** (l. 2764) : « un repère « note différée » remplace la note chiffrée de chaque travail (Engagement, Productions, Complétion, Portfolio) »
- **Ce que fait le code** : Le repère existe pour Engagement et Productions ; genererSectionCompletion (3472), qui le portait, n'est appelée nulle part, et le Portfolio n'a plus de panneau. Au passage, 3975 masque aussi la note de session sommative.
- **Preuve** : badgeNoteDifferee remplace la note par travail dans Engagement (js/profil-etudiant-sections-affichage.js:775, 829) et Productions (2871-2872, 3000-3009, 3950) ; pas de panneau Portfolio (js/portfolio.js:139-144) et la carte Complétion ne montre aucune note
- Réponse de Grégoire :
- Disposition :

#### 6.107 · en partie
*Écran* : Écran 55 · Suivi › Saisie des présences · *Geste* : Geste : marquer une absence ou un nombre de périodes (demi-période possible), ou taper une note

- **Intention** (l. 2788) : « ce qui est en attente d'écriture part avant tout changement de séance, de sous-groupe, de tri, d'onglet »
- **Ce que fait le code** : Quitter l'onglet pour une autre section ne vide rien sur-le-champ : seule la minuterie de 1,5 s (1096) écrit ensuite.
- **Preuve** : js/saisie-presences.js:1251-1254 : initialiserSaisiePresences vide l'écriture en attente, et le changement de date, de sous-groupe ou de tri l'appelle (index.html:7879, 7888-7896) ; 1166-1179 : Fermer, pagehide, beforeunload, visibilitychange
- Réponse de Grégoire :
- Disposition :

#### 6.119 · en partie
*Écran* : Écran 55 · Suivi › Saisie des présences · *Geste* : Geste : cliquer « Rapport » (grille imprimable des présences)

- **Intention** (l. 2825) : « le bouton « Rapport » est dans la barre d'actions de la saisie des présences, juste à gauche de « Confirmer la séance » »
- **Ce que fait le code** : Quand la séance n'est pas saisie, l'état de la séance s'affiche entre « Rapport » et « Confirmer la séance » ; le bouton n'est donc pas juste à gauche.
- **Preuve** : index.html:7932-7934 : « Rapport » est dans #actions-presences-bar, devant « Confirmer la séance », mais le span #etat-seance-presences (« Séance non saisie ») se place entre les deux
- Réponse de Grégoire :
- Disposition :

### Partie 7 (9)

#### 7.13 · en partie
*Écran* : Écran 56 · Le dépistage : ce qu'il calcule (transversal, lu dans le Suivi) · *Geste* : Sans geste

- **Intention** (l. 2867) : « le tableau de l'Aide « Comment interpréter les diagnostics ? » n'a plus de colonne « Niveau RàI » et porte la ligne « En consolidation » »
- **Ce que fait le code** : La colonne « Niveau RàI » est bien absente, mais la ligne « En consolidation » n'existe pas : le tableau porte « Progression lente » à sa place.
- **Preuve** : index.html:10215-10235 : le tableau « Comment interpréter les diagnostics ? » a trois colonnes (IPB, Direction, Diagnostic), sans « Niveau RàI » ; mais sa ligne « ≥ 3 / ↗ » dit encore « Progression lente » (index.html:10232)
- Réponse de Grégoire :
- Disposition :

#### 7.14 · en partie
*Écran* : Écran 56 · Le dépistage : ce qu'il calcule (transversal, lu dans le Suivi) · *Geste* : Sans geste

- **Intention** (l. 2868) : « se dit « En consolidation » (et non plus « Progression lente ») »
- **Ce que fait le code** : La catégorie existe sous l'ancien libellé « Progression lente » ; « En consolidation » n'est écrit nulle part (ni diagnostic, ni bilan « 1 en consolidation », ni Aide).
- **Preuve** : js/profil-etudiant-calculs.js:1242-1245 : le cas IPB ≥ 3 avec direction ↗ existe mais se nomme « Progression lente » ; js/tableau-bord-apercu.js:1450-1452 : ce cas n'entre dans aucune phrase du bilan
- **Second tri** : pas fait ; Aucun code n'écrit « En consolidation » pour un critère resté sous le seuil dont les résultats montent ; l'ancien libellé est en place.
- Réponse de Grégoire :
- Disposition :

#### 7.19 · en partie
*Écran* : Écran 57 · Suivi › Profils individuels › Accompagnement : la carte RàI et les niveaux RàI · *Geste* : Sans geste

- **Intention** (l. 2882) : « quand la fiche porte la remarque « Décrochage », la cible d'intervention de l'élève le nomme comme cause »
- **Ce que fait le code** : La donnée est produite, mais aucun écran ne lit le champ « cible » : le seul appelant (js/tableau-bord-apercu.js:3003) ne lit que .pattern et .niveau, et js/profil-etudiant-sections-affichage.js:1010-1025 dit que le profil n'appelle plus cette fonction ; la cause n'est donc nommée nulle part à l'écran.
- **Preuve** : js/profil-etudiant-calculs.js:2106-2113 : determinerCibleIntervention lit la remarque de la fiche (statut « décrochage », choisie dans js/trimestre-v2-etudiants.js:413) et rend cible « Décrochage »
- Réponse de Grégoire :
- Disposition :

#### 7.37 · pas fait
*Écran* : Écran 59 · Le dépistage du français en semaine 1 : le travail diagnostique et son signalement · *Geste* : Geste : Cocher « ce palier lève un signalement » sur un palier de projection, et écrire la phrase du signalement

- **Intention** (l. 2926) : « le gabarit d'exemple « critères EUF » coche « Risqué » et « Échec » et porte la phrase « Aide en français recommandée » »
- **Ce que fait le code** : Aucun gabarit d'exemple ne coche « Risqué » et « Échec » ni ne porte la phrase « Aide en français recommandée » ; cette phrase n'apparaît que comme exemple dans le texte d'aide du champ (l. 386).
- **Preuve** : js/evaluation-projection.js:306-320 : PALIERS_GABARIT_NEUF recopie les paliers sans aucun leveSignalement ; l. 383-390 : libelleSignalement a pour défaut une chaîne vide
- Réponse de Grégoire :
- Disposition :

#### 7.49 · en partie
*Écran* : Écran 60 · Suivi › Interventions · *Geste* : Sans geste

- **Intention** (l. 2945) : « une rencontre de service y paraît « Hors classe · Niveau 3 » »
- **Ce que fait le code** : Une rencontre individuelle paraît bien « Hors classe » et « Niveau 3 » (deux badges séparés) ; une rencontre en sous-groupe (niveau 2, contexte « hors-classe » posé à la l. 1534) paraît « Groupe » et « Niveau 2 ».
- **Preuve** : js/interventions.js:468-476 : dans la vue Interventions, une intervention individuelle ou de niveau 3 reçoit les badges « Hors classe » et « Niveau 3 »
- **Second tri** : fait ; Une rencontre de service « Individuelle » (niveauRai 3) qui paraît sous Suivi › Interventions porte deux badges côte à côte, « Hors classe » et « Niveau 3 » ; le point médian de l'intention transcrit ces deux badges. Le filtre interventionsDuContexteActif (l. 535-539) la laisse visible quand le contexte l'accepte.
- Réponse de Grégoire :
- Disposition :

#### 7.65 · pas fait
*Écran* : Écran 60 · Suivi › Interventions · *Geste* : Geste : Marquer une intervention « Complétée »

- **Intention** (l. 2991) : « quand on ajoute un participant à une intervention complétée, ou qu'on corrige sa date, l'application explique le report des présences et demande s'il faut le faire »
- **Ce que fait le code** : Ajouter un participant ou corriger la date d'une intervention déjà complétée enregistre le champ sans question ni explication du report.
- **Preuve** : js/interventions.js:1751-1762 : surChangementFicheIntervention ne pose la question de report qu'au passage du statut à « Complétée » ; l. 1690 : le report n'a lieu qu'à ce passage
- Réponse de Grégoire :
- Disposition :

#### 7.88 · en partie
*Écran* : Écran 61 · Suivi › Rencontres · *Geste* : Ce qui reste manuel, et ce qui n'est pas tranché

- **Intention** (l. 3068) : « sur un service, l'assiduité et la complétion restent muettes et la carte RàI ne s'affiche pas »
- **Ce que fait le code** : A et C se taisent sur un service par l'effet général (pas d'horaire, pas de pratique), mais aucun code ne masque la carte RàI sur un service : aucune branche contexteActifEstService dans les modules du profil.
- **Preuve** : js/indices.js:229 et 555-580 : sans séance l'assiduité vaut null et sans pratique la complétion vaut null, ce qui les rend muettes ; mais js/profil-etudiant-sections-affichage.js:912-918 (sans données) et 1075 (avec données) rendent toujours la carte « Modèle de la Réponse à l'intervention (RàI) »
- Réponse de Grégoire :
- Disposition :

#### 7.89 · pas fait
*Écran* : Écran 61 · Suivi › Rencontres · *Geste* : Ce qui reste manuel, et ce qui n'est pas tranché

- **Intention** (l. 3069) : « sur un service, un rendez-vous manqué vaut une absence »
- **Ce que fait le code** : Un élève non coché à une rencontre de service ne reçoit aucune absence.
- **Preuve** : js/interventions.js:1774-1830 : transfererPresencesVersModule n'écrit une absence que pour un rattrapage (marquerNonParticipantsMotives), contexte jamais posé sur un service (l. 1534 : « hors-classe »)
- Réponse de Grégoire :
- Disposition :

#### 7.92 · pas fait
*Écran* : Écran 61 · Suivi › Rencontres · *Geste* : Ce qui reste manuel, et ce qui n'est pas tranché

- **Intention** (l. 3073) : « le calendrier du trimestre montre, par date, les rencontres d'un service, en vue mensuelle »
- **Ce que fait le code** : Les rencontres d'un service n'apparaissent pas dans le calendrier du trimestre.
- **Preuve** : js/calendrier-vue.js:258-300 et 474 : le calendrier mensuel ne place que le calendrier du trimestre et les échéances des productions (construireMapEcheancesProductions)
- Réponse de Grégoire :
- Disposition :

### Partie 8 (14)

#### 8.1 · pas fait
*Écran* : Introduction de la partie · *Geste* : (annexe)

- **Intention** (l. 3121) : « L'écran « Labo › Démo » est décrit avec le mode démonstration, dans la partie 1. »
- **Ce que fait le code** : Aucun écran « Labo › Démo » n'existe ; la démonstration s'active depuis l'accueil et se décrit dans Aide › Formation et démonstration (index.html:11282-11313).
- **Preuve** : js/config.js:79-87 : le Labo a sept sous-onglets (Outils d'observation, Modélisation, Exploration des pratiques, Rythme de travail, Études, Bilan réflexif, Suivi longitudinal), sans « Démo »
- Réponse de Grégoire :
- Disposition :

#### 8.2 · en partie
*Écran* : Écran 63 · Labo › Outils d'observation · *Geste* : Sans geste

- **Intention** (l. 3127) : « aucun bloc repliable, les trois cartes ne se referment pas, un sommaire « Sur cette page » en tête, deux réglages par rangée »
- **Ce que fait le code** : Rien ne se replie et le sommaire existe, mais les champs chiffrés ne sont pas deux par rangée : quatre paramètres d'analyse et trois seuils d'interprétation par rangée sur grand écran (styles.css:11760-11772).
- **Preuve** : index.html:8683-8688 : sommaire « Sur cette page » en tête ; l. 8699, 8829 et 8926 : les trois cartes sont .carte-pilier, sans classe accordeon ; l. 8707, 8837 et 8934 : options en .grille-2col ; mais l. 8768 (.grille-4col-form) et 8897 (.grille-3col-form)
- Réponse de Grégoire :
- Disposition :

#### 8.3 · en partie
*Écran* : Écran 63 · Labo › Outils d'observation · *Geste* : Sans geste

- **Intention** (l. 3128) : « Sous chaque réglage, de petites étiquettes nomment l'écran où son effet se voit ; en ambre, celles qui agissent hors de Suivi : palette d'annotation, liste des évaluations, badge de grille, export recherche »
- **Ce que fait le code** : Les étiquettes ambre sont les quatre de l'intention, mais les champs chiffrés n'ont pas chacun leurs étiquettes : une seule rangée d'étiquettes par bloc (index.html:8763 et 8889).
- **Preuve** : index.html:8717, 8739, 8755 et 8881 : chaque option porte ses étiquettes .etiquette-effet ; .etiquette-effet-hors (couleur ambre, styles.css:2647-2650) marque Annotation › palette, Évaluation › Liste des évaluations, Conception › Grilles › badge « dépistage » et Réglages › Données › export recherche
- Réponse de Grégoire :
- Disposition :

#### 8.5 · en partie
*Écran* : Écran 63 · Labo › Outils d'observation · *Geste* : Sans geste

- **Intention** (l. 3131) : « « collecte » remplace « cueillette », dans l'introduction et dans la case du bloc Micro-données ACP »
- **Ce que fait le code** : « cueillette » a disparu de tout le code servi et la case dit « collecte », mais l'introduction n'emploie pas le mot « collecte ».
- **Preuve** : index.html:8842 : la case du bloc Micro-données ACP dit « Activer la collecte des données… » ; index.html:8680-8682 : l'introduction ne contient ni « collecte » ni « cueillette »
- Réponse de Grégoire :
- Disposition :

#### 8.8 · en partie
*Écran* : Écran 63 · Labo › Outils d'observation · *Geste* : Sans geste

- **Intention** (l. 3137) : « Sous chaque champ chiffré, la plage permise en mots (« De 5 (sensible) à 20 (moins sensible) ») »
- **Ce que fait le code** : Trois champs chiffrés sur sept portent leur plage en mots ; la Fenêtre d'analyse dit seulement « Valeur basse = détection précoce | Valeur élevée = détection plus fiable », et les trois seuils d'interprétation n'ont aucune aide.
- **Preuve** : index.html:8790, 8802 et 8814 : la plage en mots est écrite sous Progression des artefacts (« De 5 (sensible) à 20 (moins sensible). »), Sensibilité des flèches et Seuil de défi ; index.html:8778 et 8897-8918 : rien de tel sous la Fenêtre d'analyse ni sous Fragile, Acceptable, Bon
- Réponse de Grégoire :
- Disposition :

#### 8.24 · en partie
*Écran* : Écran 63 · Labo › Outils d'observation · *Geste* : Geste : Lire les aides de l'écran

- **Intention** (l. 3182) : « l'aide « Indicateurs visuels des seuils » dit « Lignes pointillées et étiquettes des niveaux de ton échelle sur les graphiques de progression du profil individuel. » »
- **Ce que fait le code** : Le texte diffère de celui de l'intention (« sur les graphiques de progression du profil individuel ») ; l'infobulle js/accompagnement-contenu-hover.js:180 dit encore autre chose.
- **Preuve** : index.html:8867 : l'aide dit « Lignes pointillées et étiquettes des niveaux de ton échelle sur le graphique par critère du profil individuel et sur les trajectoires du Suivi du groupe, en mode Habiletés. »
- Réponse de Grégoire :
- Disposition :

#### 8.30 · en partie
*Écran* : Écran 63 · Labo › Outils d'observation · *Geste* : Geste : Masquer les notes par travail (note différée)

- **Intention** (l. 3203) : « le repère renvoie à Labo › Outils d'observation »
- **Ce que fait le code** : Le repère nomme l'écran dans son infobulle, mais il n'a ni lien ni data-action qui y mène.
- **Preuve** : js/preferences.js:597 : le repère est un <span> dont le titre dit « Réglage dans Labo › Outils d'observation. »
- Réponse de Grégoire :
- Disposition :

#### 8.36 · pas fait
*Écran* : Écran 64 · Labo › Suivi longitudinal · *Geste* : Sans geste

- **Intention** (l. 3222) : « l'aide de l'écran dit que le R des pseudonymes vient de « registre » »
- **Ce que fait le code** : Aucune aide de l'écran ne dit que le R vient de « registre ».
- **Preuve** : js/registre-longitudinal.js:160 : le pseudonyme « Élève R‹rang› » est fabriqué sans qu'aucun texte de l'écran l'explique ; index.html:9220-9224 : la sous-section n'a pas de bouton d'aide
- Réponse de Grégoire :
- Disposition :

#### 8.53 · en partie
*Écran* : Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques) · *Geste* : Geste : Créer, dériver, adopter ou jeter une maquette

- **Intention** (l. 3296) : « elle reste hors du sélecteur de pratique active tant qu'elle n'est pas adoptée »
- **Ce que fait le code** : Une maquette porte dansBibliotheque: true (js/pratiques.js:869) et apparaît donc dans le menu du Cadre où se choisit la pratique d'un groupe-cours.
- **Preuve** : js/pratiques-gestion.js:118 et 336-344 : la barre latérale et la bibliothèque filtrent les maquettes (filtrerParMaquette) ; mais js/trimestre-v2.js:375-388 : le menu de pratique du groupe-cours (v2-gc-pratique) ne filtre que dansBibliotheque et isDemo
- Réponse de Grégoire :
- Disposition :

#### 8.55 · en partie
*Écran* : Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques) · *Geste* : Geste : Exporter la comparaison (CSV)

- **Intention** (l. 3306) : « en anonymisation, le nom et le DA exportés sont anonymisés »
- **Ce que fait le code** : En anonymisation, le nom exporté est anonymisé mais le DA exporté reste le vrai DA : daAffichage n'est pas utilisé.
- **Preuve** : js/comparateur-pratiques.js:321-326 et 1113 : le CSV écrit prof.label (e.nom, anonymisé par js/modes.js:1403) et prof.da (e.da, que l'anonymisation laisse réel : js/modes.js:1400-1402)
- Réponse de Grégoire :
- Disposition :

#### 8.56 · pas fait
*Écran* : Écran 66 · Labo › Données · *Geste* : Sans geste

- **Intention** (l. 3313) : « Affiche les comptes des données de l'application, dont le nombre d'interventions »
- **Ce que fait le code** : L'écran Labo › Données n'existe pas ; le seul compte d'interventions affiché ailleurs est celui des captures (Réglages › Données, js/donnees-v2.js:117) ou celui d'une archive ouverte (js/reserve-ouvrir.js:831).
- **Preuve** : js/config.js:79-87 : le Labo n'a pas de sous-onglet « Données » ; index.html:8673-9224 : aucune sous-section labo-donnees
- Réponse de Grégoire :
- Disposition :

#### 8.57 · pas fait
*Écran* : Écran 66 · Labo › Données · *Geste* : Sans geste

- **Intention** (l. 3314) : « Lit les données telles qu'elles sont rangées : un ancien brouillon peut y être compté »
- **Ce que fait le code** : Sans écran Labo › Données, aucune lecture brute des données (brouillons compris) n'y est faite.
- **Preuve** : js/config.js:79-87 : aucun sous-onglet « Données » dans le Labo
- Réponse de Grégoire :
- Disposition :

#### 8.58 · pas fait
*Écran* : Écran 66 · Labo › Données · *Geste* : Sans geste

- **Intention** (l. 3315) : « l'écran est en lecture seule : on n'y fait aucun geste, il ne fait qu'afficher les comptes »
- **Ce que fait le code** : L'écran en lecture seule décrit n'existe pas.
- **Preuve** : js/config.js:79-87 : aucun sous-onglet « Données » dans le Labo
- Réponse de Grégoire :
- Disposition :

#### 8.65 · en partie
*Écran* : Écran 70 · Labo › Rythme de travail · *Geste* : Sans geste

- **Intention** (l. 3356) : « que sa case « Consignes transmises » soit cochée ou non »
- **Ce que fait le code** : La case n'écarte plus aucune production, mais une production n'est estimée que si son activité a des durées mesurées (js/rythme.js:185-186 et 304-312) ; des copies seulement importées, sans durée dans l'activité, ne la font pas paraître.
- **Preuve** : js/rythme.js:199-215 : estimerCharge ne lit plus la case « Consignes transmises » et garde tout lot qui a une échéance, estimerPourLot ne rendant null que sans copie ni évaluation
- Réponse de Grégoire :
- Disposition :

### Annexe (6)

#### A.29 · en partie
*Écran* : Notés par l'analyste « Conception II » · *Geste* : (annexe)

- **Intention** (l. 3652) : « La visionneuse ne pose plus la cartouche ou l'échelle d'une autre copie »
- **Ce que fait le code** : La visionneuse ne pose plus la grille, l'échelle ou la cartouche d'une autre copie sur une copie déjà évaluée (#947, changelog 1.159.7) ; sur une copie non évaluée, elle pré-remplit toujours avec les choix faits sur une autre copie.
- **Preuve** : js/travaux-ui.js:5202-5211 : la mémoire des derniers choix n'est pas appliquée à une copie évaluée ; :5213-5233 : elle l'est encore à une copie sans évaluation
- Réponse de Grégoire :
- Disposition :

#### A.36 · en partie
*Écran* : Notés par l'analyste « Conception II » · *Geste* : (annexe)

- **Intention** (l. 3660) : « Sans pratique assignée, profil, Suivi et export écrivent un tiret au lieu d'une note »
- **Ce que fait le code** : Sans pratique assignée (portfolio.js:408-433, noteConstructible false), le profil et le Suivi écrivent un tiret ; l'export des résultats n'écrit pas de tiret mais une note vide avec un statut, et l'export recherche écrit null (trimestres.js:2287).
- **Preuve** : Écrans : js/profil-etudiant-sections-affichage.js:732-734 et js/tableau-bord-apercu.js:548, :568-573 affichent le tiret ; export : js/export-resultats-finaux.js:93-97 écrit une cellule vide et le statut « non constructible »
- Réponse de Grégoire :
- Disposition :

#### A.52 · en partie
*Écran* : Notés par l'analyste « Évaluation » · *Geste* : (annexe)

- **Intention** (l. 3682) : « son aide sur les indices C et P »
- **Ce que fait le code** : La case existe, et une aide nomme la case et les indices C et P, mais elle est attachée à la date d'échéance ; la note propre à la case (productions.js:930) ne parle pas de C ni de P.
- **Preuve** : Case : js/productions.js:911-930 ; aide C et P : js/accompagnement-contenu-popup.js:982-992 ('echeance-indices') et js/accompagnement-contenu-hover.js:251, rattachées au champ de date
- Réponse de Grégoire :
- Disposition :

#### A.58 · indécidable
*Écran* : Notés par l'analyste « Suivi I » · *Geste* : (annexe)

- **Intention** (l. 3695) : « Les barres à bulles visibles aussi depuis l'Accueil »
- **Ce que fait le code** : Le chemin depuis l'Accueil recharge bien le Suivi du groupe, mais que les bulles des barres soient visibles relève du rendu à l'écran.
- **Preuve** : js/accueil.js:55-57 (carte « Observer le groupe ») mène à navigation.js:261-263 (chargerTableauBordApercu)
- **Second tri** : en partie ; Les barres à bulles ne s'affichent pas sur l'Accueil lui-même ; on y accède depuis l'Accueil par une carte qui ouvre le Suivi du groupe.
- Réponse de Grégoire :
- Disposition :

#### A.66 · en partie
*Écran* : Notés par l'analyste « Suivi II » · *Geste* : (annexe)

- **Intention** (l. 3709) : « « Par où commencer ? » à deux branches »
- **Ce que fait le code** : « Par où commencer ? » donne maintenant trois étapes numérotées (sans nommer l'enseignant·e), puis un paragraphe à part « Tu es orthopédagogue ? » ; les deux chemins existent, mais pas sous la forme de deux branches d'une même réponse.
- **Preuve** : js/accueil.js:93-99
- Réponse de Grégoire :
- Disposition :

#### A.72 · pas fait
*Écran* : Notés par l'analyste « Suivi II » · *Geste* : (annexe)

- **Intention** (l. 3714) : « formule « taux de repérage » pour la grille de l'orthopédagogue »
- **Ce que fait le code** : Aucune formule « taux de repérage » n'est offerte aux grilles ; l'intention elle-même la dit non livrée.
- **Preuve** : js/evaluation-formules.js:88, :114, :147 : seuls penalite_normalisee, ratio_cible et penalite_par_erreur existent
- Réponse de Grégoire :
- Disposition :

## Indécidables au code : 10

*Seul un essai réel peut trancher. Destination à décider : porte terrain (iPad, Safari, largeurs d'écran) ou mise de côté.*

- **1.22** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : « une question peut paraître, à accepter ». L'intention ne nomme aucune question (« une question peut paraître ») : c'est une consigne de banc, pas un comportement. Le code ne pose aucune question à l'entrée, donc rien à accepter.
- **1.121** (Écran 8 · Témoin « Enregistré » (tous les écrans)) : « le témoin s'affiche au-dessus du clavier ». Le code existe, mais seul un essai sur iPad, clavier ouvert, en vertical et en horizontal, peut dire que le témoin est bien au-dessus du clavier.
- **3.85** (Écran 27 · Conception › Grilles de critères) : « les paliers tiennent sur deux rangées, numérotés, le nom lisible en entier ; sur l'iPad en portrait, les deux colonnes s'empilent ». Les deux rangées numérotées sont dans le code. Que le nom se lise en entier et que les colonnes s'empilent sur l'iPad en portrait dépend du rendu : le seuil est 768 px, alors que plusieurs iPad font plus de 768 px en portrait ; seul un essai tranche.
- **4.110** (Écran 34 · Conception › Carte d'alignement › canevas) : « celles d'une grande carte se recalculent environ dix fois plus vite ». Le code met en place l'optimisation (un seul index par passe au lieu d'un par évaluation), mais le gain « environ dix fois plus vite » est une durée qui ne se mesure qu'en faisant tourner une grande carte.
- **4.116** (Écran 35 · Conception › Carte d'alignement › barre et menus) : « les douze pastilles de couleur visibles en entier, aucun défilement horizontal, sous Chrome et Safari, sur grand écran comme sur iPad en paysage ». Le code prévoit la place des douze pastilles, mais seul un rendu réel sous Chrome et Safari, sur grand écran et sur iPad en paysage, peut dire si elles tiennent en entier sans défilement horizontal.
- **4.125** (Écran 35 · Conception › Carte d'alignement › barre et menus) : « chaque raccourci affiché marche dans Chrome et Safari ». Que chaque raccourci affiché agisse réellement sous Chrome et sous Safari (sans être pris par le navigateur) ne se vérifie qu'au clavier dans les deux navigateurs.
- **6.110** (Écran 55 · Suivi › Saisie des présences) : « il tient sur une ligne à 1024, 768 et 390 px ». Que le bouton tienne sur une ligne à 1024, 768 et 390 px dépend du rendu réel.
- **6.122** (Écran 55 · Suivi › Saisie des présences) : « le témoin s'affiche au-dessus du clavier et ne recouvre pas les boutons des présences ». Le code existe, mais l'effet sur l'iPad (clavier, recouvrement des boutons) ne se juge qu'à l'essai.
- **6.123** (Écran 55 · Suivi › Saisie des présences) : « la barre de boutons passe à la ligne sur un écran étroit et reste dans sa carte (360, 768, 1024, 1180 px) ». Le passage à la ligne et le maintien dans la carte à 360, 768, 1024 et 1180 px ne se vérifient qu'au rendu.
- **7.63** (Écran 60 · Suivi › Interventions) : « les seuils d'alerte restent gelés jusqu'aux usages d'octobre ». L'intention décrit une absence de changement dans le temps (« restent gelés jusqu'aux usages d'octobre ») sans désigner quels seuils ; rien ne peut être cherché positivement, et le gel ne se lit pas dans une seule version du code.

## Annexe A : faits dans le code, non vus par l'observation (569)

*Repère, écran, et la localisation qui le réalise dans la 1.199.0.*

- **1.8** (Écran 2 · Accueil) : js/accueil.js:93-98 : « Par où commencer ? » puis une liste <ol> de trois étapes (« Pose ton cadre. », « Conçois tes productions et tes évaluations. », « Apprends geste par geste. »)
- **1.9** (Écran 2 · Accueil) : js/accueil.js:77-114 : le bandeau et son encadré CoP ne contiennent aucun tiret cadratin (ni le caractère U+2014, ni l'entité &mdash;, ni l'échappement \u2014)
- **1.10** (Écran 2 · Accueil) : js/accueil.js:110 : le lien porte <span class="u-lecteur-ecran"> (s'ouvre dans un nouvel onglet)</span> ; styles.css:736 masque visuellement cette classe
- **1.11** (Écran 2 · Accueil) : js/accueil.js:105-110 : les trois boutons portent « btn btn-secondaire » ou « btn btn-primaire » ; styles.css:27105-27115 : .banniere-bienvenue-actions .btn donne au lien <a> le même inline-flex, min-height 44px, line-height et police que les <button>
- **1.12** (Écran 2 · Accueil) : styles.css:27098-27102 : .banniere-bienvenue-actions en display:flex avec flex-wrap: wrap et gap 12px
- **1.14** (Écran 2 · Accueil) : js/accueil.js:165-175 : la carte #accueil-porte-ortho suit le bandeau et précède le libellé « Tâches » ; index.html:744-754 : même fond, même trait fin et même rayon que .accueil-action (index.html:821-825), sans bord épais ni couleur propre ; styles.css:25016-25023 : même règle en mode clair
- **1.15** (Écran 2 · Accueil) : js/accueil.js:170 : « Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre. »
- **1.16** (Écran 2 · Accueil) : js/accueil.js:238-239 : titre « Ton codex », sous-titre « Mets-le à jour : une copie complète de tes données. »
- **1.19** (Écran 2 · Accueil) : index.html:10549 et 10561-10564 : la carte d'Aide « Prendre en main l'application » présente « Assistance » parmi « Trois outils t'accompagnent au début »
- **1.21** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : index.html:3987-3995 : #bandeau-demo « Mode démonstration » ; index.html:451-462 : position fixed, bottom 0, fond var(--vert-doux) (vert, styles.css:59 et 605) ; js/demo-activation.js:341-343 : affiché à l'activation
- **1.23** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : js/pack-demo-10.js:7447 : « presences » porte 32 dates, de 2025-08-25 à 2025-12-10 (compté) ; js/demo-namespace.js:216-229 : converties et écrites dans demo_presences
- **1.27** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : js/pack-demo-10.js:7447 : 32 dates de présence ; js/demo-namespace.js:216-229 : écrites dans demo_presences (10 élèves et 101 évaluations dans le même pack)
- **1.28** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : js/bibliotheque-ui.js:325-350 : appliquerModeLectureSeuleDemo désactive champs et menus d'un item démo et pose le bandeau « Exemple fourni par Labo Codex (lecture seule) » avec « Dupliquer » ; appelé par js/grilles.js:4820, js/echelles.js:2296, js/cartouches.js:1678, js/productions-liste.js:201
- **1.29** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : js/demo-activation.js:360-367 : l'activation relance initialiserModuleSaisiePresences ; js/saisie-presences.js:96-102 et 136-143 : sans date mémorisée, la date devient la dernière séance passée ; js/saisie-presences.js:1215-1235 : le bandeau « Configuration incomplète » se masque dès qu'il y a des séances
- **1.30** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : js/profil-etudiant-helpers.js:777-786 : en démo, la grille de dépistage se résout à la lecture sur la grille du pack (désignée si présente, sinon la première grille démo à critères), sans écrire la préférence
- **1.31** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : js/trimestres.js:172-173 : questionnaireBilan et resultatsBilan sont des clés namespacées ; js/bilan-reflexif-core.js:310-313 : le bilan lit cle('questionnaireBilan') etc., donc demo_* en démo
- **1.32** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : js/trimestres.js:175 : confidentielEtudiants est namespacée ; js/profil-etudiant-confidentiel.js:124 et 366 : lecture et écriture par cle('confidentielEtudiants')
- **1.33** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : js/travaux-ui.js:3710 : « Rangement : dans le navigateur » quand dossierEnJeu() est faux, ce qui est toujours le cas en démo (js/travaux-stockage.js:190-192) ; js/travaux-ui.js:924 et 975-982 : le bloc « Stockage sur disque actif » est masqué en démo
- **1.36** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : index.html:3987-3995 : le bandeau « Mode démonstration » porte « Quitter la démo » et le bouton « Retirer les copies » ; index.html:451-462 : fond vert var(--vert-doux)
- **1.41** (Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et Labo › Démo)) : js/accompagnement-contenu-popup.js:1176 : aide « accueil-donnees-demo » : « Ce que tu fais dans la démo est provisoire : une nouvelle version du pack démo remplace tes évaluations, et « Retirer les copies » efface les copies importées. »
- **1.44** (Écran 4 · En-tête › menu Codex) : js/codex.js:3139-3141 et 3161 : la ligne d'état dit « Ton codex est à jour » ou « Ton codex n'a pas tes derniers changements » ; styles.css:7543-7550 : pastille verte ou orange
- **1.45** (Écran 4 · En-tête › menu Codex) : js/codex.js:3164-3166 : sans codex, l'état commence par « Aucun codex actif » ; js/codex.js:3881-3885 : le détail s'intitule « Aucun codex actif » et propose « Ouvrir un codex », « Nouveau codex », « Mettre à jour le codex »
- **1.75** (Écran 4 · En-tête › menu Codex) : js/codex.js:3342 : notifications.erreur('Le codex n'a pas pu être ouvert', e.message) ; js/utils-notifications.js:82-91 : le titre en gras, le détail sur une ligne en dessous
- **1.77** (Écran 4 · En-tête › menu Codex) : js/codex.js:3313 et 3331 : écritures vidées puis rechargerSiLeServeurRepond ; js/rechargement-sur.js:30-54 et 62-70 : si version.json ne répond pas, la page reste et une fenêtre dit « Tes données sont enregistrées »
- **1.90** (Écran 4 · En-tête › menu Codex) : js/codex.js:315-319 : _marquerStockAvantLotF marque « pas à jour » un état actif sans temoinFiable, une fois, et n'écrit que _codex_etat ; appelé js/codex.js:253-255 et 266-268
- **1.101** (Écran 6 · Fenêtres du codex avant une suppression (tous les écrans)) : js/codex.js:3672-3673 : « Écrire le codex à part » en variante 'danger' ; js/ui-dialogues.js:116-120 : variante danger donne btn-supprimer ; styles.css:5084-5087 et 107 : fond rouge (#7a3a3a)
- **1.102** (Écran 6 · Fenêtres du codex avant une suppression (tous les écrans)) : js/trimestre-v2-liste.js:330-334 : le codex à part est écrit avant toute suppression ; js/codex.js:3682 et 455-477 : genererCodex y met toutes les clés de tous les trimestres
- **1.105** (Écran 6 · Fenêtres du codex avant une suppression (tous les écrans)) : js/saisie-presences.js:1889-1903 : la fenêtre du codex et la question « Réinitialiser la séance » ne viennent que si la séance a une fiche en base (seanceSaisie)
- **1.118** (Écran 8 · Témoin « Enregistré » (tous les écrans)) : js/modes.js:1042 : raison « le navigateur a refusé l'écriture. » ; js/modes.js:1049-1054 : retenue pour toute erreur qui n'est pas de quota ; passée à temoin.nonEnregistre (js/modes.js:1104)
- **1.120** (Écran 8 · Témoin « Enregistré » (tous les écrans)) : js/modes.js:1084-1100 : pour une grosse clé (attente.grosse), « Enregistré » n'est dit qu'au commit IndexedDB ; un échec du commit dit « Non enregistré »
- **1.128** (Écran 10 · Numéro de version, bandeau de nouvelle version, fenêtre des Nouveautés) : index.html:331-333 : .bandeau-mise-a-jour a pour fond var(--acc-fond), défini à #e8923a (orange) à styles.css:274 ; js/init-inline.js:409 : « Nouvelle version chargée. Tes données persistent. »
- **1.131** (Écran 11 · En-tête › « Soutenir Labo Codex » (le cœur)) : js/modal-soutien.js:45-91 : blocs « Avec ton temps » (colonne gauche), « Suivre le projet » puis « Avec tes moyens » (colonne droite) ; js/modal-soutien.js:95 : pied avec labo@codexnumeris.org ; styles.css:5447-5451 : chaque bloc encadré
- **1.134** (Écran 11 · En-tête › « Soutenir Labo Codex » (le cœur)) : js/modal-soutien.js:70 : « Le blogue du développeur : procédures, trucs et astuces de Labo Codex, et des analyses critiques sur la technologie, la pédagogie et l'éducation. »
- **1.135** (Écran 12 · En-tête › « Signaler un bug ou donner ton avis » (la coccinelle)) : js/rapport-bug.js:332-354 : section « --- DERNIÈRE MISE À JOUR DU CODEX --- » (début et fin, étape atteinte, tailles, stratégie, erreur, issue) ; ajoutée au rapport js/rapport-bug.js:721
- **1.136** (Écran 12 · En-tête › « Signaler un bug ou donner ton avis » (la coccinelle)) : js/rapport-bug.js:349 : ligne « Toucher frais: ‹issue› » (« non demandé » par défaut)
- **1.137** (Écran 12 · En-tête › « Signaler un bug ou donner ton avis » (la coccinelle)) : js/rapport-bug.js:152-172 : id, prénom, date et description passent par echapperHtml ; js/rapport-bug.js:231 : le rapport complet est montré par alert(), en texte
- **1.141** (Écran 13 · En-tête › menu du cours ou du groupe-cours actif) : js/trimestre-v2-orchestre.js:318-395 : la bascule rafraîchit les vues visibles sans appeler afficherSection ; js/contexte.js:24-25 et js/navigation.js:455-464 : la barre de Suivi se reconstruit sur place et ne change de sous-onglet que si le courant disparaît (Interventions vers Rencontres)
- **1.143** (Écran 14 · Aide) : index.html:9935 : « Il n'y a aucune intelligence artificielle dans l'application. » suivi du gabarit vide
- **1.144** (Écran 14 · Aide) : index.html:9943 : « Où vont tes données ? Nulle part. »
- **1.145** (Écran 14 · Aide) : index.html:9945 : « Labo Codex est un commun à construire. Il est gratuit, il fonctionne sur ton appareil et son développement est guidé par une communauté de pratique. »
- **1.146** (Écran 14 · Aide) : index.html:14093 : « Avant de partir, mets à jour le codex sur ta clé USB (Codex → Mettre à jour le codex) »
- **1.147** (Écran 14 · Aide) : index.html:14111-14112 : section « Ton codex est-il à jour ? »
- **1.148** (Écran 14 · Aide) : index.html:14064-14113 : la carte Aide › Codex ne contient pas la question ; aucune occurrence de « quelle différence » ni « copie de secours » dans index.html ni js/ hors js/changelog-data.js
- **1.150** (Écran 14 · Aide) : index.html:14029-14037 : « Deux options : » « Exporter ma config » et « Ouvrir un Codex : Ouvre un codex ou une configuration partagée. Le type est détecté automatiquement. », puis « Pour mettre ton travail en sûreté ou le transporter, mets ton codex à jour : menu Codex, en haut de l'écran. »
- **1.151** (Écran 14 · Aide) : index.html:14048 : « Ton codex est ta seule protection. »
- **1.152** (Écran 14 · Aide) : index.html:14051-14053 : encadré Loi 25 (données dans le navigateur, responsabilité de l'établissement, protection de l'appareil, lien public) avec « Personne ne met ton codex à jour à ta place : utilise « Mettre à jour le codex » régulièrement. »
- **1.154** (Écran 14 · Aide) : index.html:14037 et 14048 : l'Aide renvoie au codex seul ; aucune occurrence de « copie de secours » dans index.html ni js/ hors js/changelog-data.js
- **1.155** (Écran 14 · Aide) : index.html:13715-13718 : FAQ « Mes données s'enregistrent-elles toutes seules ? », réponse « Oui, dans l'application. »
- **1.156** (Écran 14 · Aide) : index.html:13664-13667 : « Données perdues », solution « Rouvrir ton codex (menu Codex, en haut de l'écran → Ouvrir un codex…) »
- **1.157** (Écran 14 · Aide) : index.html:13872-13873 : glossaire « Codex » : « Fichier portable (format ZIP) contenant toutes tes données et les fichiers de travaux »
- **1.158** (Écran 14 · Aide) : index.html:10542-10566 : carte « Prendre en main l'application » : « Données démo », « Visite guidée », « Assistance », chacune située à son endroit réel
- **1.159** (Écran 14 · Aide) : js/accompagnement.js:1081-1086 : l'étape « Conception » reconnaît la sous-section 'conception-pratiques-notation' (id réel, index.html:5401)
- **1.163** (Écran 14 · Aide) : js/accompagnement-contenu-popup.js:1648 : « Mets toujours ton codex à jour avant un import : c'est ton filet de sécurité… » ; js/accompagnement-contenu-popup.js:1630 : transporter son travail passe par le codex ; aide ouverte par index.html:14589
- **1.166** (Écran 15 · Au chargement de l'application) : js/cours.js:63-79 et 95-110 : les migrations n'écrivent cours que si pratiqueId ou dansBibliotheque manque ; js/cours.js:191-194 : lancées après db-ready pour ne pas être réécrasées
- **2.1** (Introduction de la partie) : styles.css:14309-14315 : une seule règle place le bouton « + Nouveau… » (classe btn-nouvelle-entite) juste sous le menu déroulant de l'entité ; index.html:6188, 6405, 6686, 6935, 7117, 7235 : dans les six accordéons du Cadre, le bouton suit immédiatement ce menu, dans le panneau de gauche
- **2.7** (Écran 16 · Cadre (règles communes à toute la section)) : trimestre-v2-horaires.js:633-640 : nom d'horaire, jour, heures et local de séance passés par echapperHtml avant innerHTML ; trimestre-v2-horaires.js:143-145 : idem dans la liste des séances ; trimestre-v2-cours.js:993-995 : nom, courriel et institution du profil posés par textContent ; trimestre-v2-enseignants.js:190 : noms du menu des profils échappés
- **2.14** (Écran 17 · Cadre › Trimestre (la fiche du trimestre)) : index.html:6265 et styles.css:21497-21501 : les deux semaines spéciales sont dans un conteneur flex en colonne (pile-semaines-speciales), l'une sous l'autre
- **2.15** (Écran 17 · Cadre › Trimestre (la fiche du trimestre)) : trimestre-v2-init.js:508-533 et :550-575 : vident les quatre bornes (ou les quatre dates des semaines spéciales) et écrivent par sauvegarderDonneesSelonMode avec le geste « Réinitialiser les bornes » ou « Réinitialiser les semaines spéciales » ; modes.js:1178-1220 : cette écriture dit « Enregistré » ou « Non enregistré » par le témoin
- **2.17** (Écran 17 · Cadre › Trimestre (la fiche du trimestre)) : trimestre-v2-init.js:633 et :648 : la nature « ferie » ajoute le badge « Férié » à la carte de la journée ; styles.css:3406-3409 : badge-ferie en vert (var(--vert-leger))
- **2.20** (Écran 17 · Cadre › Trimestre (la fiche du trimestre)) : trimestre-v2-liste.js:465-467 : au changement de trimestre, appel de annulerFormEvenementV2 ; trimestre-v2-init.js:812-816 : remet evenementEnEditionV2 à null et masque le formulaire
- **2.22** (Écran 17 · Cadre › Trimestre (la fiche du trimestre)) : trimestre-v2-cours.js:315-325 : quand le cours actif (infoCours) n'est plus dans la bibliothèque, le formulaire passe à l'état vide sans recharger le menu des cours ; le commentaire dit que cette récursion interrompait initialiserTrimestreV2 avant le sélecteur de trimestre, rempli ensuite (trimestre-v2-init.js:66-67)
- **2.24** (Écran 17 · Cadre › Trimestre (la fiche du trimestre)) : trimestre-v2.js:549-603 : mettreAJourBarreContexte recalcule chaque étape (élèves, horaires, groupes-cours) et pose ou retire bc-complet ; appelée après chaque relecture de la liste des élèves (trimestre-v2-etudiants.js:297-299, avant le retour « liste vide »), après un horaire par populerDropdownsAssemblageV2 (trimestre-v2-horaires.js:1046, trimestre-v2.js:399) et après un groupe-cours (trimestre-v2-groupes-cours.js:180-182)
- **2.25** (Écran 17 · Cadre › Trimestre (la fiche du trimestre)) : trimestres.js:247-265 : obtenirTrimestres rend la liste dédoublonnée par id seulement (le premier de chaque id), sans réécrire le stockage
- **2.29** (Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres)) : reserve-emprunter.js:99 : refus « … est déjà dans l'application : ouvre-le depuis la bibliothèque des trimestres. Rien n'a été écrit. », posé quand le trimestre à faire revenir est déjà au registre (:170, :180) et affiché par :421-422
- **2.30** (Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres)) : index.html:11162-11166 : l'aide « Qu'est-ce que clore un trimestre ? » finit par « Clore ne libère aucun espace. »
- **2.34** (Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres)) : modes.js:1041 : raison « la mémoire du navigateur est pleine. Pour libérer de la place : Cadre › Trimestre › Bibliothèque, « Supprimer… » sur un ancien trimestre. » ; dite par le témoin sur une erreur de quota (modes.js:1050-1054 et :1219)
- **2.49** (Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trimestres)) : reserve-renvoyer.js:83 : menuTitre « Retirer ce trimestre de l'application : son archive vérifiée le garde » ; trimestre-v2-liste.js:212 : passé en title de l'entrée « Renvoyer aux archives… » ; bibliotheque-ui.js:860 : rendu en attribut title
- **2.67** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : index.html:6988 : l'étiquette « DA » porte l'astérisque (span champ-requis) ; index.html:6989 : inputmode=numeric sur le champ v2-etudiantDA
- **2.68** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:802 : après « Ajouter l'étudiant·e », chargerListeEtudiantsV2 ; :301-310 : il repeuple le menu « Groupe associé » de l'horaire (populerDropdownGroupesHoraireV2, exporté trimestre-v2-horaires.js:1281) et l'étape 3 du groupe-cours (populerDropdownGroupesAssemblageV2)
- **2.69** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : index.html:6997-7029 : chaque champ de la fiche porte data-on-change sauvegarderChampEtudiantV2 ; trimestre-v2-etudiants.js:643-645 et :658-680 : en modification, les valeurs sont lues et écrites au changement (en quittant le champ), avant que editerEtudiantV2 (:916-944) remplisse le formulaire avec l'autre fiche
- **2.70** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : index.html:7020 : le sélecteur s'intitule « Mesure d'aide » ; profil-etudiant-sections-affichage.js:1304 et :2632 : le profil de l'élève dit « Mesure d'aide » ; index.html:10715 : l'aide la définit comme l'inscription à une mesure d'aide du collège
- **2.71** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : indices.js:216-220 et :386-391 : les séances datées avant dateArrivee sont exclues du calcul de l'assiduité ; profil-etudiant-sections-affichage.js:1830-1832 : idem à l'affichage
- **2.72** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:773 : date d'arrivée vidée à l'écran, la clé dateArrivee est supprimée de la fiche fusionnée
- **2.73** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:186-191 : en modification, une fiche sans coursId affiche « Rattaché·e à aucun cours. »
- **2.76** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : correction-da.js:165-181 : la famille globale jetonsEtudiants est déplacée sous le nouveau DA (une entrée vide sous le nouveau DA n'est pas un conflit)
- **2.77** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : correction-da.js:154-164 : la famille globale registreLongitudinal déplace eleves[ancien DA] et son champ da sous le nouveau DA
- **2.78** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : correction-da.js:348-351 : marque correctionDA posée d'abord sur la fiche ; :354-362 : chaque clé réécrite d'un bloc dans sa file ; :365-369 : recompte avant de changer le DA de la fiche, en dernier (:371-378) ; :256 et :283-287 : refaire le geste reprend la même correction
- **2.79** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : correction-da.js:290 : refus « Le nouveau DA doit avoir sept chiffres. » ; :293 : refus d'un DA déjà porté par un·e autre étudiant·e du trimestre
- **2.80** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:403 : l'option vide du menu « Action » dit « Choisir… » ; :411 : celle de « Remarque » dit « Aucune »
- **2.81** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:1127-1136 : « Supprimer » écrit le DA dans <trimestre>_elevesDesinscrits ; import-export.js:3186-3192 puis :3498, :3523, :3557, :3668, :3701 : à l'ouverture d'un ancien fichier (import par cases), fiche, présences, évaluations, copies et annotations de ces DA sont écartées avant la fusion
- **2.82** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : import-export.js:1691-1697 : un DA de la trace qui est de nouveau dans la liste du trimestre n'est plus écarté ; import-export.js:1709-1711 : même règle pour les vues (dasElevesSupprimes) ; trimestre-v2-etudiants.js:1110-1120 : la suppression n'avait retiré que la fiche
- **2.83** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:1127 : la trace n'est écrite que par le geste « Supprimer » ; import-export.js:1691-1697 : seuls les DA de la trace sont écartés ; aucune migration n'écrit elevesDesinscrits
- **2.85** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : travaux-stockage.js:461-465 : obtenirFichiersAffiches retire les copies des DA supprimés ; employé par liste-evaluations.js:1078-1079 (lignes et compte), travaux-ui.js:711, :1083, :1279, :3373, :3599 (Annoter et évaluer, Exporter et archiver) et travaux-archivage.js:383-385 (export pour Léa) ; trimestres.js:1945-1950 (export pour la recherche) et tableau-bord-apercu.js:1680-1683 (seuils « en attente ») écartent ses présences et évaluations
- **2.86** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:1060-1076 : si le numéro tapé correspond déjà à une entrée du menu « Groupe » pour ce cours, l'option n'est pas recréée et le menu la sélectionne
- **2.87** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:532-534 : les entrées du menu « Groupe » sont triées par numéro, puis par libellé (donc par cours)
- **2.88** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:149-154 : une fiche sans coursId forme le libellé « ‹numéro› · sans cours »
- **2.90** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:1533-1535 : « Vider la liste » écrit une liste vide puis appelle chargerListeEtudiantsV2 ; :297-299 : la barre d'étapes y est recalculée avant le retour « liste vide » ; trimestre-v2.js:568-571 et :591 : l'étape des élèves perd bc-complet
- **2.91** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:260 : le DA de chaque ligne importée est débarrassé de tous ses espaces avant le test des sept chiffres (:262)
- **2.94** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:1366-1369 : sans ligne importable, le bouton dit « Aucune ligne à importer » et passe à disabled
- **2.95** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:1453-1458 : les lignes écartées sont nommées par nom et prénom, huit au plus (NB_NOMMEES = 8), puis « , et N autres. »
- **2.98** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : trimestre-v2-etudiants.js:354-355 : en anonymisation, les rangées passent par anonymiserDonnees (pseudonymes) ; :934-937 et _masquerIdentiteV2 : DA, nom et prénom laissés vides et désactivés à l'ouverture de la fiche ; :665-672 : l'écrivain réécrit l'identité telle qu'elle est en base
- **2.99** (Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe) et fiche d'un·e élève) : styles.css:24829-24832 : en mode clair, les en-têtes du tableau des élèves (#v2-listeEtudiants th) ont un fond var(--bleu-principal) et un texte blanc
- **2.100** (Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours)) : trimestre-v2-cours.js:1456-1470 : un service n'a pas de code et ne passe pas par la garde de doublon ; identite-naturelle.js:89-91 et :149 : l'identité d'une fiche est son code seul, une fiche sans code n'est jamais jugée doublon
- **2.101** (Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours)) : trimestre-v2-cours.js:1174 : « + Nouveau cours » remet toujours le menu « Nature » sur cours (Enseignement), sans lire le contexte actif
- **2.102** (Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours)) : trimestre-v2-cours.js:1517-1527 : en modification, donner le code d'une autre fiche pose « Une fiche « … » existe déjà. … Donner quand même ce code à cette fiche ? »
- **2.103** (Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours)) : mots-nature.js:73-76 : « Sélectionner un service... », « Aucun service sélectionné », « Modifier le service » ; trimestre-v2-cours.js:464-469 (titre selon le menu Nature), :196 (option vide du menu), :936 (synthèse vide) ; index.html:6399 : « ‹Objet› : » marqué data-mot-nature, posé par trimestre-v2-orchestre.js:452-458
- **2.104** (Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours)) : trimestre-v2-cours.js:1421-1439 : après l'écriture d'un cours, chargerDropdownCoursV2, populerDropdownsAssemblageV2 puis rafraichirAffichageGroupesCoursV2 ; trimestre-v2-groupes-cours.js:265-273 : refait le menu des groupes-cours, la carte du groupe-cours ouvert et l'en-tête (peuplerDropdownGroupeCoursActif)
- **2.107** (Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque de cours)) : cours.js:548-579 : supprimerFicheCoursAvecGarde refuse tant qu'une donnée pend au cours ; sinon il réécrit chaque clé groupesCours sans les groupes-cours de ce cours (:572), puis retire la fiche du magasin global (:573-574)
- **2.111** (Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil »)) : ui-dialogues.js:431 : titre « Ce profil n'est pas encore créé. » ; trimestre-v2-enseignants.js:163 déclare la fiche en création, et :212, :260, :400 posent la question avant de la quitter
- **2.112** (Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil »)) : trimestre-v2-enseignants.js:306-313 et :319 : la copie « mon profil » (profilEnseignant) n'est réécrite que pour le profil dont l'id porte la marque enseignantId
- **2.113** (Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil »)) : index.html:6703-6705 : état vide « Sélectionne un profil pour le modifier, ou crée ton profil avec + Nouveau profil. » ; trimestre-v2-enseignants.js:217-222 et :27-32 : sans sélection, l'état vide remplace le formulaire
- **2.119** (Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil »)) : trimestre-v2-enseignants.js:185 : chaque reconstruction du menu pose l'option vide depuis motsNatureContexteActif().choisirPersonne ; mots-nature.js:44 et :68 : « Sélectionner un enseignant·e » et « Sélectionner un·e orthopédagogue » ; trimestre-v2-orchestre.js:462-468 : reposée à chaque activation
- **2.121** (Écran 22 · Cadre › Trimestre › Horaire) : horaire-fusion.js:46-76 : fusion des séances de tous les horaires, dédoublonnée par jour ET heure de début ; employée à l'enregistrement (trimestre-v2-horaires.js:1017) et à la génération du calendrier (trimestre.js:69-75), qui alimentent le calendrier et la saisie des présences
- **2.122** (Écran 22 · Cadre › Trimestre › Horaire) : trimestre-v2-horaires.js:1043 : après « Créer l'horaire », editerHoraireV2 passe la fiche en modification ; :767-769 : le bouton « Supprimer » perd u-hide
- **2.124** (Écran 22 · Cadre › Trimestre › Horaire) : trimestre-v2-horaires.js:1151-1176 : une ligne par séance, défauts 08:00 et 10:00 : jour, début « à » fin, case des périodes suivie du mot « pér. » hors de la case, local ; styles.css:10332-10340 : grille de sept colonnes sur une rangée ; styles.css:10385-10404 : sous 720 px, deux colonnes
- **2.125** (Écran 22 · Cadre › Trimestre › Horaire) : trimestre-v2-horaires.js:1046-1048 : après l'écriture d'un horaire, populerDropdownsAssemblageV2 puis rafraichirAffichageGroupesCoursV2 (trimestre-v2-groupes-cours.js:265-273 : menu, carte et en-tête des groupes-cours)
- **2.126** (Écran 22 · Cadre › Trimestre › Horaire) : trimestre-v2-horaires.js:1081-1089 : après suppression, horaireHebdo est refait par fusionnerSeancesHoraires sur les horaires restants, dédoublonnés par jour et heure (horaire-fusion.js:46-76)
- **2.127** (Écran 22 · Cadre › Trimestre › Horaire) : trimestre-v2-horaires.js:1056-1106 : supprimerHoraireV2 n'écrit que horaires, horaireHebdo et horaireSelectionne ; aucune écriture des présences, ni là ni dans genererCalendrierComplet (trimestre.js:55)
- **2.129** (Écran 22 · Cadre › Trimestre › Horaire) : trimestre-v2-etudiants.js:301-306 : chaque relecture de la liste repeuple le menu « Groupe associé » (populerDropdownGroupesHoraireV2, exporté trimestre-v2-horaires.js:1281) en gardant la sélection ; trimestre-v2-horaires.js:690-692 : libellé « 00001 (1 étud.) »
- **2.130** (Écran 23 · Cadre › Trimestre › Groupe-cours) : index.html:7296 : l'étiquette du champ 2 est écrite en dur « 2. Cours ou service », sans data-mot-nature
- **2.131** (Écran 23 · Cadre › Trimestre › Groupe-cours) : mots-nature.js:52-54 et :78-80 : « 5 éléments obligatoires » pour un cours, « 4 éléments obligatoires » pour un service ; index.html:7213, :7258, :7285 : phrases marquées data-mot-nature ; trimestre-v2-orchestre.js:452-458 : posées selon le contexte actif
- **2.132** (Écran 23 · Cadre › Trimestre › Groupe-cours) : trimestre-v2-groupes-cours.js:780 : le refus dit « Choisis l'orthopédagogue. » quand le champ 2 est un service, « Choisis l'enseignant·e. » sinon (clé personne de mots-nature.js)
- **2.135** (Écran 23 · Cadre › Trimestre › Groupe-cours) : trimestre-v2-groupes-cours.js:673-674 : editerGroupeCoursV2 retire u-hide du bouton « Supprimer », y compris quand chargerGroupeCoursV2 restaure le groupe-cours actif à l'arrivée sur la section (commentaire :664-672)
- **2.137** (Écran 23 · Cadre › Trimestre › Groupe-cours) : trimestre-v2-init.js:90-96 : initialiserModuleTrimestre relit le stockage à chaque affichage du Cadre (appelée par navigation.js:250-251) ; trimestre-v2.js:375-389 : le menu du champ 6 est reconstruit depuis pratiquesConfigurables ; trimestre-v2-groupes-cours.js:643 : la valeur reprend gc.pratiqueId, mis à jour quand la pratique est appliquée (main.js:811)
- **2.138** (Écran 23 · Cadre › Trimestre › Groupe-cours) : trimestre-v2-groupes-cours.js:487-488 : l'enseignant et la pratique ne comptent au badge que si _enseignantExistePourGC (:435) et _pratiqueExistePourGC (:451) les retrouvent
- **2.139** (Écran 23 · Cadre › Trimestre › Groupe-cours) : trimestre-v2-groupes-cours.js:490-492 : un score de 5 donne « Complet », sinon « N/5 configurés »
- **2.141** (Écran 23 · Cadre › Trimestre › Groupe-cours) : trimestre-v2-groupes-cours.js:483 : un service sans horaire reçoit le point de l'horaire
- **2.142** (Écran 23 · Cadre › Trimestre › Groupe-cours) : trimestre-v2-groupes-cours.js:240-255 : nomGroupeCours recompose le nom (trimestre, code du cours, groupe, séances) à chaque affichage ; :257-261 : le nom stocké ne sert qu'en repli et n'est pas réécrit ; employé au menu (:162) et à la carte (:500)
- **2.143** (Écran 24 · Cadre › Calendrier scolaire) : styles.css:12572-12593 : la grille des mois (cal-grid-2col) passe à une colonne sous 1024 px, avec min-width 0 pour éviter le débordement
- **2.144** (Écran 24 · Cadre › Calendrier scolaire) : calendrier-vue.js:506-575 : carte « Légende » en tête, couleurs dans calendrier-legende-grille, trois chiffres (semaines scolaires, jours de cours, congés avec reprise) dans calendrier-legende-metriques ; styles.css:7844-7849 : deux colonnes ; styles.css:7857-7861 : une colonne sous 768 px
- **2.146** (Écran 24 · Cadre › Calendrier scolaire) : calendrier-vue.js:266 et :272 : en-tête DIM à SAM, décalage par getDay (dimanche en premier) ; trimestre-v2-horaires.js:1129 : jours de séance Lundi à Vendredi ; index.html:6336-6342 : menu de reprise « Horaire du lundi » à « Horaire du vendredi »
- **2.147** (Écran 24 · Cadre › Calendrier scolaire) : trimestre.js:149-158 : dans la numérotation par paquets de cinq, les jours de la semaine de planification et de la semaine d'examens ne comptent pas (compte = false)
- **3.1** (Introduction de la partie) : js/config.js:56 : « pratiques-notation » est la dernière entrée du tableau « conception » (js/config.js:39-57)
- **3.4** (Écran 25 · Conception (commun aux trois écrans)) : js/grilles.js:723, js/echelles.js:3622, js/productions.js:2265 : le retrait de l'homonyme se fait dans le mutateur de la file d'écriture (modifierEtAnnoncer / db.modifier), après les vérifications (nom js/grilles.js:663-667 ; niveaux et repères js/echelles.js:3569-3590 ; champs js/productions.js:2233)
- **3.5** (Écran 25 · Conception (commun aux trois écrans)) : js/modal-doublon.js:302-306 : phraseRefusEcrasement compose « Une échelle porte déjà ce nom, et ‹porteurs› l'emploient : l'écraser changerait des notes. Donne un autre nom à la nouvelle. » ; js/echelles.js:3360-3372 rend « 12 évaluations et 2 productions »
- **3.6** (Écran 25 · Conception (commun aux trois écrans)) : js/modal-doublon.js:293 : après le choix « ecraser », Codex.proposerAvantSuppression('remplacement') ; js/codex.js:3826 rend true sans fenêtre si le codex est à jour ; js/codex.js:3775 porte le message du remplacement
- **3.8** (Écran 25 · Conception (commun aux trois écrans)) : js/ui-dialogues.js:451-459 : la question de sortie passe texteAnnuler « Rester » et variante 'danger' ; js/ui-dialogues.js:155 met le focus sur ce bouton ; js/ui-dialogues.js:136-141 : Entrée fait ce que fait le bouton qui a le focus
- **3.10** (Écran 25 · Conception (commun aux trois écrans)) : js/ui-dialogues.js:452 : quitterCreationSiConfirme rend true sans question si le prédicat de saisie est faux ; prédicats js/grilles.js:5440-5447, js/echelles.js:2214-2222, js/productions.js:2207-2215
- **3.11** (Écran 25 · Conception (commun aux trois écrans)) : js/navigation.js : aucun appel à uiDialogues ni à quitterCreationSiConfirme (grep vide) ; js/ui-dialogues.js:411-412 dit que ce chemin n'avertit pas
- **3.13** (Écran 25 · Conception (commun aux trois écrans)) : js/identite-item.js:424-458 : nommerCopie rend « X (copie) », puis « X (copie 2) », « X (copie 3) » en sautant les rangs déjà pris ; appelé par js/grilles.js:5373, js/echelles.js:3175, js/productions-liste.js:347
- **3.14** (Écran 25 · Conception (commun aux trois écrans)) : js/db.js:700-716 : db.modifier sérialise lecture-modification-écriture par clé ; les duplications passent par cette file (js/grilles.js:5356, js/echelles.js:3162, js/productions-liste.js:328)
- **3.22** (Écran 26 · Conception › Productions étudiantes) : js/productions.js:2198-2201 et js/productions.js:1535 : sur une production existante, rendreModeFicheProduction(false) masque « Créer la production » ; index.html:4591-4592 : « Fermer » dans les actions en haut de la fiche (index.html:4561)
- **3.25** (Écran 26 · Conception › Productions étudiantes) : js/productions.js:1848-1852 : raisonChampsObligatoiresProduction refuse sans nom, sans type, ou pondération 0 (hors artefact) ; appelé avant toute écriture à js/productions.js:2233
- **3.28** (Écran 26 · Conception › Productions étudiantes) : styles.css:6138-6143 : .temoin-enregistrement en position fixe, left 16px, bottom 16px ; js/temoin-enregistrement.js:160 retire « Enregistré » après 2 s ; l'écriture d'une production passe par modifierEtAnnoncer (js/productions.js:2138)
- **3.29** (Écran 26 · Conception › Productions étudiantes) : js/productions.js:1850 : « choisis le type de la production. »
- **3.31** (Écran 26 · Conception › Productions étudiantes) : js/productions.js:2123-2127 : si la question du doublon est annulée, le champ reprend stockee.titre, le nom enregistré
- **3.37** (Écran 26 · Conception › Productions étudiantes) : js/entites/production-diagnostique.js:75-120 (estDiagnostique, filtres) ; js/pratiques/pratique-sommative.js:707-735 (note, P, C) ; js/profil-etudiant-helpers.js:467 (fenêtre des patterns) ; js/profil-etudiant-calculs.js:1738-1752 (non-participation, palier RàI) ; js/productions.js:2000-2002 (la case s'écrit aussi sur une production existante et évaluée)
- **3.39** (Écran 26 · Conception › Productions étudiantes) : index.html:4710-4727 : dans la colonne gauche en flex vertical, #champPonderation puis la case #productionDiagnostique juste dessous
- **3.41** (Écran 26 · Conception › Productions étudiantes) : index.html:4733-4769 : colonne droite de la grille à deux colonnes, bouton « Préparer le PDF » puis #champGrille à trois colonnes ; styles.css:27899-27903 pousse les sélecteurs au pied pour aligner les libellés en haut
- **3.43** (Écran 26 · Conception › Productions étudiantes) : js/export-pdf.js:3084-3087 : chaque option du sélecteur de cran indisponible reçoit disabled et un title ; js/export-pdf.js:1858-1873 : raisonCranIndisponible dit pourquoi (aucun bloc de consignes, aucune grille, aucune cartouche)
- **3.44** (Écran 26 · Conception › Productions étudiantes) : index.html:14707-14710 : sélecteur « Disposition » (Continu / Deux colonnes) ; js/export-pdf.js:2243-2262 : aperçu, bandeau par bloc en deux colonnes, white-space: pre-line ; js/export-pdf.js:2097-2110 : PDF, bandeau par bloc et texte découpé par splitTextToSize
- **3.45** (Écran 26 · Conception › Productions étudiantes) : js/export-pdf.js:1935-1947 : blocEcheance ; avec plusieurs dates, chaque ligne est « gr. 0000N : ‹date› » (js/export-pdf.js:1982-1991)
- **3.49** (Écran 26 · Conception › Productions étudiantes) : js/productions.js:2350-2353 : annulerFormProduction retire la classe active de tous les .sidebar-item ; appelé après la suppression (js/productions-liste.js:419 ; js/productions.js:3475-3477)
- **3.50** (Écran 26 · Conception › Productions étudiantes) : js/productions.js:2327-2358 : un seul corps annulerFormProduction (masque la fiche, rend l'accueil, retire le surlignage, productionEnEdition = null), atteint par « Fermer » (js/productions.js:2219-2222), la création et les suppressions
- **3.51** (Écran 26 · Conception › Productions étudiantes) : js/navigation.js : aucune question de sortie ; js/navigation.js:213-217 appelle initialiserModuleProductions, qui (js/productions.js:3170-3190) ne redessine que la barre et le tableau, sans toucher #formulaireProduction
- **3.53** (Écran 26 · Conception › Productions étudiantes) : index.html:4694-4698 : #carteDefinitionType est un bloc pleine largeur placé juste après la rangée Type / Activité, hors de la grille à deux colonnes
- **3.54** (Écran 27 · Conception › Grilles de critères) : index.html:4995 : astérisque class champ-requis ; styles.css:4120-4124 : color var(--rouge-erreur) ; js/grilles.js:663-667 : refus « Le nom de la grille est obligatoire » au clic « Créer la grille » (index.html:4921)
- **3.57** (Écran 27 · Conception › Grilles de critères) : index.html:5005 : option « Non précisé » ; js/grilles.js:4808 pose le menu sur grille.type ; js/grilles.js:3356-3359 : « Tes critères sont tous ‹type›s. » seulement sans type déclaré ; js/grilles.js:6159-6168 : choisir ou retirer le type réécrit puis redessine la ligne
- **3.58** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:3398-3432 : sous le menu, le compte des critères sans type et un bouton « Le passer / Les passer en ‹type› » ; js/grilles.js:3435-3447 : seul ce bouton leur applique le type ; js/grilles.js:6159-6166 : changer le menu ne touche pas les critères
- **3.60** (Écran 27 · Conception › Grilles de critères) : js/evaluation-calcul.js:1002-1020 : porteeDepuisEvaluation retire de la référence les critères ajoutés depuis l'évaluation (criteresAjoutesDepuis, js/evaluation-calcul.js:1115)
- **3.61** (Écran 27 · Conception › Grilles de critères) : js/evaluation-chargement.js:1854-1880 : à l'ouverture d'une copie, avis « Un critère a été ajouté à la grille après cette évaluation » avec le nom et la pondération du critère
- **3.62** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:3540 et 4875 : astérisque du nom du critère en class champ-requis ; styles.css:4120-4124 la colore en rouge ; les autres marques d'obligation (prep-pdf-requis styles.css:14493, cc-meta-required styles.css:4437) sont aussi en rouge
- **3.67** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:5309-5313 et 518-521 : critère employé, Codex.proposerAvantSuppression('critere') avant la question ; js/codex.js:3781 et 3800-3804 composent « Supprimer ce critère l'efface pour de bon. Ton codex à jour pourra te le rendre, jusqu'à ta mise à jour suivante. » ; « Annuler » rend false et la fonction s'arrête
- **3.68** (Écran 27 · Conception › Grilles de critères) : js/evaluation-chargement.js:1818-1842 : avis « Un critère évalué n'est plus dans la grille » listant ‹nom› (‹niveau ou points›), l'évaluation gardant ses entrées
- **3.70** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:4567-4576 : rendreCartesGabaritAlgo pose la carte Formule ouverte (false), « Bilan » et « Ce que l'élève lit » fermées (true), après les sous-critères
- **3.71** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:4333-4349 : plisGabaritAlgo, objet en mémoire, relevé avant chaque redessin (js/grilles.js:3517, 4850) et relu par pliGabaritAlgoFerme ; aucune écriture dans la grille
- **3.72** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:4473 : la case « Utiliser ces sous-critères comme codes d'annotation » (js/grilles.js:3870-3894) est rendue en tête de la liste ; cochée, js/grilles.js:4439-4442 ajoute la couleur et js/grilles.js:4451 le pli « Observation » (js/grilles.js:4500-4515, champ sc.retroaction)
- **3.73** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:3906 : rendreCouleurSousCritere emploie travauxOutils.renderPickerCouleur (js/travaux-outils.js:56, douze pastilles et « Personnalisé… ») ; js/partage-schemas.js:325 et 350, js/import-export.js:825 et 914 transportent couleur et codesDepuisSousCriteres
- **3.74** (Écran 27 · Conception › Grilles de critères) : js/travaux-outils.js:623-640 : à l'ouverture d'une copie, la grille résolue par codesAnnotation.grilleDeCopie régénère la palette des codes ; js/codes-annotation.js:27-34 : chaque code porte numero, nom, couleur, retroaction
- **3.75** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:3892 : « Sans cette case, la copie utilise la palette générale (Annoter › palette). »
- **3.76** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:4474 et 4536-4552 : pli « Quand la copie ne porte aucun code », fermé par défaut (pliGabaritAlgoFerme(clePli, true)), juste sous la case ; rendu seulement en édition (js/grilles.js:4398-4401 s'arrête en création)
- **3.78** (Écran 27 · Conception › Grilles de critères) : js/codes-annotation.js:3-11 et 23-34 : les codes sont les sous-critères, numérotés et rattachés au critère ; js/travaux-outils.js:2463 et js/evaluation-calcul.js:1676-1700 : leur comptage alimente la note du critère algorithmique ; les tampons (action-*, obs-*) ne sont lus par aucun calcul
- **3.80** (Écran 27 · Conception › Grilles de critères) : js/evaluation-enonces.js:287-289 : modèle « Français écrit », description identique au texte arrêté ; affichée sous le menu par js/grilles.js:3841
- **3.81** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:3840 : « Fournit le texte de départ des deux phrases du bilan et du décompte de la carte « Ce que l'élève lit ». »
- **3.83** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:4182-4198 : la carte rend le menu et ses réglages, puis le décompte (${blocDecompte}, l. 4194), puis les paliers (l. 4196), chacun avec Verdict et Recommandation (js/grilles.js:4148-4159)
- **3.84** (Écran 27 · Conception › Grilles de critères) : js/evaluation-projection.js:316-318 : la recommandation du gabarit neuf devient « au service d'aide de ton collège : ‹service›. »
- **3.86** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:4117-4170 : la rangée d'un palier ne porte que la corbeille (retirerBloc), aucun reordonnerBloc ; js/grilles.js:4044-4046 en donne le motif
- **3.87** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:4103-4115 et 4167 : sous chaque palier, ligne « L'élève lira : » avec la partie engendrée, la partie écrite et la copie fictive
- **3.88** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:4161-4165 : chaque palier porte une case « Ce palier lève un signalement » (champ leveSignalement) ; js/evaluation-projection.js:385-386 : la phrase du signalement est un paramètre du critère, vide par défaut
- **3.89** (Écran 27 · Conception › Grilles de critères) : js/entites/signalement-depistage.js:65-89 : les signalements sont recalculés à la lecture depuis l'évaluation et le palier (leveSignalement) ; js/entites/signalement-depistage.js:14-19 et 31 : rien n'est écrit
- **3.107** (Écran 27 · Conception › Grilles de critères) : js/grilles.js:3080-3091 : _retirerGrilleDeLaListe écrit par modifierEtAnnoncer avec geste « Supprimer la grille » ; js/modes.js:1277 dit le geste sur un échec
- **3.109** (Écran 27 · Conception › Grilles de critères) : index.html:5005 « Non précisé » ; js/grilles.js:4808 (menu sur grille.type) ; js/grilles.js:4847 puis 3356-3365 (phrase « Tes critères sont tous … » dans #precisionTypeGrille, index.html:5011)
- **3.111** (Écran 28 · Conception › Échelles de performance) : js/echelles.js:2258 : ouvrir une autre échelle vide window._niveauEnAttente ; js/echelles.js:2240 : fermer l'échelle le vide aussi ; aucune question (le prédicat de création, js/echelles.js:2214-2222, est faux pour une échelle existante)
- **3.112** (Écran 28 · Conception › Échelles de performance) : js/profil-etudiant-helpers.js:345-372 : interpreterNiveauAtteint rend l'interprétation SOLO, ou sans étiquette le nom du niveau ; js/profil-etudiant-helpers.js:653-660 et js/profil-etudiant-sections-affichage.js:1231-1236 la posent en title (survol) du niveau
- **3.113** (Écran 28 · Conception › Échelles de performance) : js/echelles.js:3025-3034 : supprimerNiveauEchelle propose le codex ('niveau') seulement si une évaluation emploie le code du niveau, puis « Supprimer ce niveau ? »
- **3.116** (Écran 28 · Conception › Échelles de performance) : js/echelles.js:3162-3187 : la duplication passe par modifierEtAnnoncer avec geste « Dupliquer l'échelle »
- **3.120** (Écran 28 · Conception › Échelles de performance) : js/echelles.js:3472 : retrait par modifierEtAnnoncer, geste « Supprimer l'échelle » ; js/echelles.js:3238 et 3382 : les écritures du remplacement portent le geste « Remplacer l'échelle »
- **4.3** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:3646 : creerNouvelleCartouche appelle BibliothequeUI.quitterModeLectureSeuleDemo sur #infoCartouche avant de remettre les champs à neuf ; js/bibliotheque-ui.js:363 et 324-350 : réactive tous les champs et retire le bandeau .bandeau-demo-readonly
- **4.4** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:3424-3432 : le menu Grille garde, en plus des grilles de la sélection, la grille actuellement liée (id ou idOriginal) et la présélectionne
- **4.6** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:3362-3369 et 3408-3411 : le champ dit « Paliers (bornes en %) » pour une grille analytique ; 3497-3505 : préremplit ECHELLE_IDME_DEPART ; 3393-3399 et 678-682 : colonnes titrées « 65–74,99 % »
- **4.9** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:962-1000 : sauvegarderNomCartouche, branchée par data-on-change sur #nomCartouche (index.html:5306), appelle verifierEtGererDoublon au changement du nom
- **4.10** (Écran 29 · Conception › Rétroactions (cartouches)) : js/modal-doublon.js:76-77 : « Une <strong>cartouche de rétroaction</strong> porte déjà le nom « X ». » (TYPES_FR l.22) ; l.106-111 : sous « Remplacer l'existante », « L'existante sera remplacée par la nouvelle, si rien ne l'emploie. Cette action est irréversible. »
- **4.11** (Écran 29 · Conception › Rétroactions (cartouches)) : js/modal-doublon.js:281-288 : sur « Remplacer », compte les porteurs des homonymes et rend null si total > 0 ; js/cartouches.js:913-946 : compte évaluations et productions qui nomment la cartouche ; cartouches.js:989-992 : null restaure le nom, rien n'est écrit
- **4.12** (Écran 29 · Conception › Rétroactions (cartouches)) : js/modal-doublon.js:301-306 : « Une cartouche porte déjà ce nom, et ${N…} l'emploient : l'écraser changerait des notes. Donne un autre nom à la nouvelle. » (verbe au singulier pour 1)
- **4.13** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:1013-1016 (renommage) et 1200-1204 (création) : avec ecraserLeDoublon, l'homonyme est retiré de la liste dans la file d'écriture
- **4.14** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:1001-1010 : si la cartouche ouverte pendant la question est l'homonyme, retour sans écriture et temoinEnregistrement.nonEnregistre('tu as ouvert la cartouche qui porte déjà ce nom.', …)
- **4.15** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:2479-2503 : consignes « Aucun travail n'a été remis… N'invente aucun détail de copie », « Trois phrases, de 45 à 70 mots. », conseil concret sous le niveau « Maîtrisé à partir de », aucun conseil à partir de ce niveau
- **4.16** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:2498-2503 : sans repère, le modèle écrit « cette échelle ne porte PAS de repère « Maîtrisé à partir de » : juge d'après le nom et la description de chaque niveau »
- **4.18** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:1564 : nom: nommerCopie(cartoucheOriginal.nom, cartouches) ; js/identite-item.js:425-460 : « X (copie) », puis « X (copie 2) », « X (copie 3) », sans empiler
- **4.20** (Écran 29 · Conception › Rétroactions (cartouches)) : js/cartouches.js:1748-1750 : la suppression ne filtre que cle(`cartouches_${grilleId}`) ; js/evaluation.js:656-660 : l'évaluation rouverte affiche sa retroactionFinale stockée
- **4.27** (Écran 30 · Conception › Rétroactions › « Consulter la bibliothèque » (cartouches)) : js/cartouches.js:4498-4530 : la cartouche déjà présente est retrouvée par id ou idOriginal (aucune copie ajoutée), puis ajouterAvecGardeIdentite refuse un exemplaire de même identité ; js/identite-item.js:112-122 et 386-398 : comparaison par jetons d'identité, jamais par nom
- **4.28** (Écran 30 · Conception › Rétroactions › « Consulter la bibliothèque » (cartouches)) : js/cartouches.js:4545-4548 : alert(`« ${nomEnConflit} » est déjà dans ta sélection.\n\nPour en avoir un second exemplaire, utilise « Dupliquer ».`)
- **4.34** (Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur)) : js/pratiques-gestion.js:235-237 : caracteristiques.push('notes finalisées') si configuration.notesFinales ; l.1635 : la case mat-notes-finales écrit configuration.notesFinales
- **4.35** (Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur)) : js/synthese-retroaction-rendu.js:702 : titreBloc = estFinale ? 'Note finale' : 'Note provisoire' ; js/profil-etudiant-sections-affichage.js:3113, 3171, 3981 : « Note finale de session » / « Note provisoire de session »
- **4.37** (Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur)) : js/pratiques/editeur-cibles.js:41-56 et 89-94 : chaque ligne porte son id (data-cible-id), conservé quand on monte, descend ou renomme ; js/pratiques/pratique-configurable.js:384-389 : les coches sont lues par cible.id des cibles actuelles
- **4.39** (Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur)) : js/pratiques/pratique-pan-specifications.js:841-843 : sans palier atteint et sans palier d'échec, _determinerPalierBundle rend null ; l.272-273 : calculerPerformance rend alors null
- **4.41** (Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur)) : js/portfolio.js:408-437 : sans pratique, indices écrits noteConstructible:false et completionConstructible:false (affichés par un tiret, indices.js:562-584) ; js/profil-etudiant-actions.js:141-143 : « Aucune pratique de notation n'est assignée à ce groupe-cours. Ouvre Conception → Pratiques de notation, choisis ta pratique et clique « Appliquer au cours actif ». »
- **4.44** (Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur)) : js/pratiques-gestion.js:1066 et 2201 ; js/pratiques.js:818 : nommerCopie(source.nom, liste) pour toutes les duplications de pratique
- **4.50** (Écran 31 · Conception › Pratiques de notation (barre latérale, carte d'une pratique, éditeur)) : js/trimestre-v2-liste.js:474-479 et js/pratiques-gestion.js:2901 : la bascule remet pratiqueEnEditionMateriel à null ; js/pratiques-gestion.js:86-90 : à l'entrée dans la sous-section, l'éditeur est masqué et l'accueil réaffiché (hook navigation.js:233-238)
- **4.55** (Écran 32 · Assistant de pratique) : js/wizard-pratique-v2.js:1668-1671 : la liste ne garde que les échelles offertes par obtenirEchellesOffertesAdoption (dansBibliotheque !== false, pratiques-bibliotheque.js:863-866), plus celle déjà choisie
- **4.57** (Écran 32 · Assistant de pratique) : js/wizard-pratique-v2.js:1689 : echapperHtml(e.nom) dans les options ; l.2081 et 2099 : echapperHtml(echelle?.nom) au récapitulatif ; js/ui-dialogues.js : la question d'adoption pose les libellés en texte
- **4.71** (Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques) : js/wizard-pratique-v2.js:2517-2530 : l'adoption écrit un clone à id neuf dans cle('pratiquesConfigurables') ; js/pratiques-bibliotheque.js:159-163 : le retrait ne touche que la liste des modèles prédéfinis
- **4.74** (Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques) : js/pratiques-bibliotheque.js:838 : PHRASE_AUCUNE_ECHELLE_ADOPTION, mot pour mot ; l.883-885 : uiDialogues.informer({ titre: modele.nom, … }) ; js/ui-dialogues.js:245 : bouton « Fermer » par défaut
- **4.75** (Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » et bibliothèque des pratiques) : js/pratiques-bibliotheque.js:883-885 : rend { adopter: false } ; js/pratiques-gestion.js:842-843 et js/wizard-pratique-v2.js:2516-2517 : return avant toute écriture
- **4.76** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:7799-7809 : le sélecteur de semaine passe par deposerDansGrille ; l.10146-10164 : sur une séquence, deplacerSequenceVersSemaine (l.10084-10140) décale toutes ses leçons en gardant leurs écarts
- **4.77** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:370-424 : appliquerObjectifs conserve l'id d'un objectif par id fourni, puis par texte inchangé, puis par rang
- **4.78** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:6205-6213 : le badge 🎯 est toujours rendu, avec la classe planif-badge-objectif--vide sans objectif ; styles.css:23788-23795 : grayscale(1) sur le glyphe dans cet état
- **4.80** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:4429-4500 : deposerLienSurObjectif affiche un message pour chaque refus (bloc non servant, autre leçon, évaluation hors leçons proposées, déjà coché)
- **4.81** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:3249-3252 : titre de groupe « Cette leçon » ou « Leçon « X » (semaine N, séance B) » dans « Objectifs vérifiés » ; leconsProposeesAEvaluation l.261-275
- **4.82** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:286-294 : leconsInspecteurEvaluation ajoute les leçons des objectifs déjà cochés qui ne sont plus proposées ; l.3629-3647 : chaque case réécrit la liste à partir de toutes les cases affichées
- **4.83** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:313-325 : definirObjectifsServis retire la clé objectifsServis quand la liste devient vide ; l.3631-3646 : la liste est reconstruite à partir des cases
- **4.85** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:4467 : « Objectif coché : cette évaluation le vérifie désormais. » ; l.4456 : « Déjà coché : cette évaluation vérifie cet objectif. » ; l.4452 : « Une évaluation coche les objectifs de sa leçon ou d'une leçon placée avant elle. »
- **4.86** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:1316 : se_verifie_par reste dans TYPES_LIENS (affiché « se vérifie par ») ; l.1360-1369 : seuls les verbes automatiques vers une évaluation sont retirés ; l.2693-2704 : les liens déjà tracés valident encore le badge amont
- **4.87** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:2305-2314 : obtenirLabelNoeud rend « Évaluation » (TYPES l.1266) tant que viseeChoisie est vide ; js/planification-export.js:109, 1954, 2042, 2105 : les exports prennent ce libellé
- **4.90** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:4307-4316 : dupliquerSelection écarte les descendants d'un conteneur sélectionné et ne duplique que les racines
- **4.94** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:832-835 : dureeControleHTML rend une chaîne vide quand estHorsClasseNoeud(n)
- **4.95** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:6603-6635 et 6767 : l'aimantation trace une ligne de classe planif-guide-alignement ; styles.css:20710-20713 : stroke-dasharray: 5 3
- **4.96** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:6810-6822 et 6871 : alignerSelection n'aligne que les racines et les déplace avec deplacerNoeudEtDescendants
- **4.97** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:2726-2731 : appliquerBadge pose ✓ et backgroundColor = couleur du bloc quand le lien est posé
- **4.98** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:2699-2706 : badge amont de l'évaluation : « Vérifie N objectif(s) » si au moins un objectif, sinon « Aucun objectif coché : coche dans l’Inspecteur les objectifs qu’elle vérifie »
- **4.99** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:2428-2439 : ideeMaitresseAtteinEvaluation lève le ⚠ quand une leçon reliée (ou une leçon enfant de la séquence reliée) a un objectif vérifié ; leconAObjectifVerifie l.307-310 cherche une évaluation dans toute la carte
- **4.100** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:2629-2648 : l'Exposé entre dans le calcul des activités : « ! » (« Aucune connaissance reliée ») sans lien vers une connaissance
- **4.101** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:3180-3190 : « Pastilles des objectifs » et legendePastillesObjectifHTML dans l'Inspecteur d'une leçon à objectifs ; l.1955-1965 : même légende dans la 5e page du guide (« Ce que la leçon vise »)
- **4.103** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:1793-1796 : un objectif dont au moins un bloc servant est « avant » est jugé « avant », même s'il est aussi servi après
- **4.104** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:1788-1798 : GRAVITE { avant: 0, incertain: 1, apres: 2, nonEnseigne: 3 } et conservation du pire état sur tous les objectifs
- **4.105** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:1794-1795 : « avant » est testé avant « inconnu » : un bloc sûrement avant suffit, même si un autre ne peut pas être situé
- **4.106** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:237-242 : objectifsVerifiesPar ne lit que metadata.objectifsServis, jamais les liens
- **4.107** (Écran 34 · Conception › Carte d'alignement › canevas) : styles.css:24068-24104 : « ! » contour pointillé 55 %, opacité 0,55, couleur de l'évaluation ; « ✕ » --rouge-erreur ; « ⚠ » #F59E0B ; « ? » --gris-moyen, trait plein ; « ✓ » contour 1,5 px couleur de l'évaluation
- **4.108** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:2001-2010 : legendePastillesEvaluationHTML dans la 8e page du guide (« Vérifie que c’est acquis ») ; l.1844-1845 et 3194 : « Pastille de l'évaluation » dans l'Inspecteur
- **4.109** (Écran 34 · Conception › Carte d'alignement › canevas) : js/planification-carte.js:1825 et 2541-2543 : les pastilles d'évaluation et d'objectif portent role="img" et un aria-label égal à leur message ; js/planification-carte.js:1840 et 2564 tiennent l'aria-label à jour au recalcul
- **4.112** (Écran 34 · Conception › Carte d'alignement › canevas) : js/demo-namespace.js:76 et 81 : les deux évaluations de la carte démo portent metadata.objectifsServis égal à l'objectif de leur leçon ; js/demo-namespace.js:83-96 : aucun lien « se_verifie_par » dans les liens ; écrit par js/demo-namespace.js:270
- **4.117** (Écran 35 · Conception › Carte d'alignement › barre et menus) : js/planification-carte.js:2897-2903 : chaque préréglage n'est coché (aria-checked) que si le zoom arrondi égale sa valeur ; styles.css:22365 affiche la coche
- **4.118** (Écran 35 · Conception › Carte d'alignement › barre et menus) : js/planification-carte.js:2907-2911 : zoomerAuNiveau zoome autour du centre de la zone de travail ; js/planification-carte.js:2874-2890 : zoomer garde fixe le point visé
- **4.119** (Écran 35 · Conception › Carte d'alignement › barre et menus) : styles.css:20622-20632 : #planif-loupe a width et height de 300px et border-radius: 50%
- **4.121** (Écran 35 · Conception › Carte d'alignement › barre et menus) : js/planification-carte.js:12466-12468 : tout clic sur un bouton du menu « Vue », dont la ligne « Raccourcis clavier », appelle fermerMenuVue
- **4.122** (Écran 35 · Conception › Carte d'alignement › barre et menus) : js/planification-carte.js:12588-12590 : un pointerdown sur la palette des raccourcis lui donne un z-index supérieur (++_zIndexPanneaux) ; aussi à l'ouverture (12526)
- **4.123** (Écran 35 · Conception › Carte d'alignement › barre et menus) : js/planification-carte.js:12516-12520 et 12537 : la ligne « Raccourcis clavier » appelle basculerPaletteRaccourcis, qui ferme la palette si elle est ouverte
- **4.124** (Écran 35 · Conception › Carte d'alignement › barre et menus) : js/planification-carte.js:12353 (« Déplacer un bloc ; par le cadre d'une leçon ou d'une séquence, tout le groupe suit ») et 12363 (« Recherche : refermer la liste ; une seconde fois, tout effacer »), rendus dans la palette par rendreRaccourcisPalette (12382-12398)
- **4.126** (Écran 35 · Conception › Carte d'alignement › barre et menus) : js/planification-carte.js:12344-12365 : la liste contient L (12346), Ctrl+molette (12349), Retour arrière (12358), ⇧⌘D (12355), ⇧⌥+glisser (12357), ⇧⌘Z (12360), ↓ / ↑ de la recherche (12362) et Échap hors recherche (12364)
- **4.127** (Écran 35 · Conception › Carte d'alignement › barre et menus) : index.html:4214-4216 : « Annuler » et « Rétablir » ont la même forme (icône puis mot) ; icons/icon-redo.svg est le tracé miroir d'icons/icon-undo.svg ; js/planification-carte.js:5867-5870 grise Rétablir quand la pile est vide
- **4.129** (Écran 35 · Conception › Carte d'alignement › barre et menus) : js/planification-carte.js:1103 : seanceRetirable exige un rang dans le titre, un rang posé sur la leçon et leur égalité ; js/planification-carte.js:773-788 : le rang ne s'écrit que par definirRangSeance, appelé seulement par le sélecteur (7834)
- **4.131** (Écran 35 · Conception › Carte d'alignement › barre et menus) : js/planification-carte.js:8490-8507 : l'échelle est lue sur production.echelleId, « Aucune échelle » sinon ; js/planification-export.js:175-181 : « Aucun objectif de cette leçon » quand le bloc ne sert que des objectifs d'une autre leçon, utilisé dans le texte (750), le tableau (933) et le Markdown (1395)
- **4.133** (Écran 35 · Conception › Carte d'alignement › barre et menus) : index.html:4177 : « Évaluer ce qu'on enseigne, et enseigner ce qu'on évalue, au même niveau d'exigence. » en text-muted sous le titre h2 « Carte d'alignement » (4170-4173)
- **4.134** (Écran 36 · Conception › Carte d'alignement › Planificateur) : index.html:4426 : « Les dates du trimestre ne sont pas entrées. Ajoute-les dans Cadre › Trimestre. » avec un lien ; js/planification-carte.js:9795-9801 l'affiche quand les dates manquent
- **4.135** (Écran 36 · Conception › Carte d'alignement › Planificateur) : js/planification-carte.js:9804-9812 : ouvrirCadreTrimestre quitte d'abord le plein écran (togglePleinEcranCarte, 12622-12632, retire la classe du body) puis navigue vers Cadre › Trimestre
- **4.136** (Écran 36 · Conception › Carte d'alignement › Planificateur) : js/planification-carte.js:10407-10412 : la zone « Non planifié » porte data-grille-semaine="" ; js/planification-carte.js:10146-10161 : y déposer une leçon appelle definirSemaineLecon(id, '')
- **4.137** (Écran 36 · Conception › Carte d'alignement › Planificateur) : js/planification-carte.js:11283-11287 puis 8134-8149 : naviguerSommaireLecon sélectionne la leçon et fait défiler la carte jusqu'à elle (scrollTo), avec un halo
- **4.138** (Écran 36 · Conception › Carte d'alignement › Planificateur) : styles.css:20982-20988 : .planif-grille-cellule en flex avec flex-wrap ; styles.css:21002-21006 : chaque bloc garde sa largeur de contenu ; js/planification-carte.js:10053-10056 enveloppe chaque élément
- **4.139** (Écran 36 · Conception › Carte d'alignement › Planificateur) : js/planification-carte.js:10399-10412 et 10414 : la zone « Non planifié » est rendue même vide (« Glisse ici une leçon pour la retirer du calendrier. ») et ajoutée après la grille
- **4.140** (Écran 36 · Conception › Carte d'alignement › Planificateur) : js/planification-carte.js:9963-9966 et 10394-10398 : une leçon dont la semaine n'a pas de rangée va dans « Non planifié », avec la pastille « Sem. N hors cadre » (10011-10014)
- **4.141** (Écran 36 · Conception › Carte d'alignement › Planificateur) : js/planification-carte.js:10358-10370 : besoinContexte est faux quand la séquence de la leçon est posée dans la même rangée ; l'étiquette de séquence n'est alors pas rendue (itemLeconGrille, 9998-10001)
- **4.143** (Écran 37 · Conception › Carte d'alignement › « Télécharger un modèle… » (faire relire sa carte par une IA)) : js/planification-export.js:2258 « Blocs rattachés à aucune leçon » ; 2149-2159 « aucun », « aucune » et « non précisée » ; 2155 « introuvable dans ce trimestre » ; 2210 « Aucun cours n'est rattaché à cette carte. »
- **4.144** (Écran 37 · Conception › Carte d'alignement › « Télécharger un modèle… » (faire relire sa carte par une IA)) : js/planification-carte.js:10645 : afficherToastLien('Le modèle n’a pas pu être produit : aucune carte active.') quand aucun modèle n'est produit
- **4.145** (Écran 37 · Conception › Carte d'alignement › « Télécharger un modèle… » (faire relire sa carte par une IA)) : js/planification-export.js:1827 (« Carte bâtie jusqu'à la semaine {N}{SUR}. ») et 1859-1867 : {SUR} vaut '' quand nbSemaines est absent ; js/planification-export.js:2117-2124 : nbSemaines est null sans Cadre du trimestre
- **4.146** (Écran 37 · Conception › Carte d'alignement › « Télécharger un modèle… » (faire relire sa carte par une IA)) : js/planification-carte.js:10610-10613 : sans leçon planifiée, semaineParDefautModele rend null et la semaine retenue est borne, c'est-à-dire le nombre de semaines du trimestre
- **4.147** (Écran 38 · Conception › Carte d'alignement › Guide) : js/planification-carte.js:1895-1908 : la page 1 dit le principe, les trois étages (compétence, idées maîtresses, leçons), les deux chemins et les trois signaux (badges, ⚠, pastilles)
- **4.148** (Écran 38 · Conception › Carte d'alignement › Guide) : js/planification-carte.js:1910-1913 : références Anderson (2026), Biggs (2014), Gauthier, Bissonnette et Richard (2013), ERPI
- **4.149** (Écran 38 · Conception › Carte d'alignement › Guide) : js/planification-carte.js:1925 : page 2, « Ces niveaux sont les processus cognitifs de la taxonomie révisée d'Anderson et Krathwohl … mémoriser, comprendre, appliquer, analyser, évaluer, créer »
- **4.150** (Écran 38 · Conception › Carte d'alignement › Guide) : js/planification-carte.js:1979 : page 6, « Si tu connais plutôt les connaissances déclaratives, procédurales et conditionnelles : les déclaratives regroupent les factuelles et les conceptuelles, et les conditionnelles … relèvent de la métacognitive »
- **4.151** (Écran 38 · Conception › Carte d'alignement › Guide) : js/planification-carte.js:1940 : titre de la page 4 « Organise dans le temps »
- **4.152** (Écran 38 · Conception › Carte d'alignement › Guide) : js/planification-carte.js:2001 (titre « Vérifie que c'est acquis ») et 2010 (legendePastillesEvaluationHTML) : page 8 avec la légende des pastilles de l'évaluation
- **4.153** (Écran 38 · Conception › Carte d'alignement › Guide) : js/planification-carte.js:1961 : page 5, « Dans l'Inspecteur d'une activité ou d'un exposé de cette leçon, coche les objectifs servis ; dans celui d'une évaluation, les objectifs vérifiés, ceux de sa leçon ou d'une leçon placée avant elle. C'est ainsi que tu vérifies qu'aucun objectif ne reste sans moyen. »
- **4.155** (Écran 38 · Conception › Carte d'alignement › Guide) : js/planification-carte.js:1905-1906 et 1934 : ✓, ! et ⚠ écrits en texte dans des span .guide-glyphe ; styles.css:23191-23194 leur donne couleur et graisse
- **4.156** (Écran 38 · Conception › Carte d'alignement › Guide) : js/planification-carte.js:1909 : « Tu peux le consulter à tout moment par le bouton « Guide » de la barre. »
- **4.157** (Écran 39 · Conception › Carte d'alignement › « Consulter la bibliothèque » (cartes)) : index.html:4187 : bouton « Consulter la bibliothèque » en btn btn-principal, premier élément de la barre, juste avant le select des cartes (4188) ; même classe que les bibliothèques de la Conception (index.html:4531, 5438)
- **4.162** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : js/identite-item.js:385-399 : ajouterAvecGardeIdentite refuse tout item de même identité (memeIdentite), jamais sur le nom ; appelé au point d'écriture dans js/grilles.js:2671, js/pratiques-gestion.js:885 et les autres familles
- **4.165** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : js/grilles.js:2700-2711, js/echelles.js:1396-1406, js/cartouches.js:4556-4566, js/productions-bibliotheque-ui.js:371-394, js/pratiques-gestion.js:912-925 : relecture de la collection avant le succès, message « n'a PAS pu être ajoutée » sinon
- **4.167** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : styles.css:5252-5254 : #overlay-ui-dialogue à z-index 10005, au-dessus des modales de bibliothèque posées à 10000 (js/bibliotheque-ui.js:1371) ; les autres familles confirment par confirm() natif
- **4.170** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : js/identite-item.js:423-458 : nommerCopie donne « X (copie) », puis « X (copie 2) », « X (copie 3) », en sautant les noms pris, et ne retire que le suffixe « (copie …) », donc garde une parenthèse d'origine
- **4.173** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : js/bibliotheque-ui.js:326-354 : pour un item d'exemple, tous les champs sont désactivés et le bandeau « Exemple fourni par Labo Codex (lecture seule). Duplique-le pour créer ta propre version. » est inséré ; styles.css:4786-4788 masque les boutons d'enregistrement ; appliqué dans les cinq familles (grilles.js:4821, echelles.js:2297, cartouches.js:1679, productions-liste.js:201, pratiques-gestion.js:1133)
- **4.175** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : js/partage-section.js:257-264 : une grille est copiée avec ses cartouches (dupliquerGrillePartagee, 220-243) ; 285-309 : une production avec sa grille ; 120-131 : copiePropre garde inspireDe
- **4.176** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : js/grilles.js:3467, js/echelles.js:1780, js/cartouches.js:3646, js/productions-liste.js:242 : « + Nouvelle … » appelle quitterModeLectureSeuleDemo (js/bibliotheque-ui.js:363-365) avant de remettre le formulaire à neuf ; la pratique passe par l'assistant (js/pratiques.js:1090-1097)
- **4.177** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : js/bibliotheque-ui.js:1057-1083 : 🔴 « Collision d'identifiant » (« Anomalie de données … signale-le ») et 🟠 « Copies » (« … Tu peux n'en garder qu'un. »)
- **4.180** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : js/bibliotheque-ui.js:1162-1180 : sur une ligne de la barre latérale, « Retirer » et « Supprimer » ; sinon, « Supprimer » seul (supprimerPartagee) ; les cinq familles passent les trois actions (grilles.js:2416-2424, echelles.js:1308-1316, cartouches.js:4034-4042, productions-bibliotheque-ui.js:254-262, pratiques-gestion.js:535-543)
- **4.185** (Écran 40 · Barre latérale de la Conception et bibliothèques partagées (cinq familles)) : js/bibliotheque-ui.js:1332-1336 : la phrase sur « Masquer les éléments déjà dans la barre latérale » n'est rendue que si la case est trouvée et cochée dans la modale ; la case n'est rendue que pour les grilles, échelles et cartouches (js/grilles.js:2384, js/echelles.js:1276, js/cartouches.js:4016)
- **4.191** (Écran 41 · Partage entre collègues) : js/partage-import.js:526 et 592-597 : la prévisualisation ajoute « Cartouches tirées du trimestre : » suivi du nom ; js/partage-validation.js:611-612 : seulement si le paquet porte des cartouches et le champ trimestreCartouches
- **4.193** (Écran 41 · Partage entre collègues) : js/partage-schemas.js:301-326 : les sousCriteres d'un critère voyagent avec la grille ; js/evaluation-calcul.js:1688-1697 : c'est leur présence qui choisit le calcul par catégories ; js/partage-schemas.js:209-214 : le type de grille voyage aussi
- **4.194** (Écran 41 · Partage entre collègues) : js/import-export.js:3242-3253 : une grille reçue de même nom n'est rattachée à la grille locale (remapGrilles) que si memesIdentifiantsElements confirme les mêmes ids de critères (js/import-export.js:247-254)
- **4.196** (Écran 41 · Partage entre collègues) : js/grilles.js:2263 et 2302, js/pratiques-gestion.js:146, 357 et 481, js/partage-section.js:653 : le nom est passé par echapperHtml au moment du rendu ; js/utils-notifications.js:85-93 rend les messages par textContent
- **4.217** (Écran 42 · Importer depuis un autre trimestre (dans chaque bibliothèque)) : js/bibliotheque-ui.js:1437-1494 : capturerImportTrimestre garde le trimestre choisi, l'aperçu déplié et le défilement, restaurerImportTrimestre les repose après reconstruction ; utilisé par les cinq familles (grilles.js:2592, echelles.js:1726, cartouches.js:4396, pratiques-gestion.js:743, productions-bibliotheque-ui.js:598 avec le filtre de cours)
- **4.218** (Écran 42 · Importer depuis un autre trimestre (dans chaque bibliothèque)) : js/grilles.js:2594, js/echelles.js:1728, js/cartouches.js:4469, js/pratiques-gestion.js:799, js/productions-bibliotheque-ui.js:601 : notifications.succes('Import terminé', compte) ; styles.css:6066-6081 : toast vert (var(--vert-succes)) à z-index 11000, au-dessus des modales à 10000
- **5.1** (Écran 43 · Évaluation (toute la section)) : js/temoin-enregistrement.js:62-148 et 150-160 : un nœud unique #temoin-enregistrement, créé une fois puis retrouvé par son id, affiche « Enregistré » ; js/modes.js:1178-1244 (sauvegarderDonneesSelonMode), 1248-1290 (modifierEtAnnoncer), 1296-1312 (ecrireEtAnnoncer), 1136-1170 (annoncerEcritureUsager) le font parler après chaque écriture de l'usager
- **5.3** (Écran 43 · Évaluation (toute la section)) : js/modes.js:1071-1105 (_annoncerEnregistre) : pour une grosse clé, « Enregistré » attend le commit IndexedDB (db.commitEnAttente, js/db.js:386) ; js/modes.js:1088-1092 : un lot (copies, annoncerEcritureUsager appelé par js/travaux-stockage.js:309) attend toujours ses commits
- **5.7** (Écran 43 · Évaluation (toute la section)) : js/travaux-stockage.js:461-466 (obtenirFichiersAffiches) écarte des écrans les copies d'un élève supprimé ; js/travaux-archivage.js:383-385 : l'export pour Léa l'écarte ; js/trimestres.js:1945-1952 : l'export pour les chercheurs écarte ses évaluations, présences et captures ; js/codex.js:42 et 495 : le codex emporte toutes les listes sans filtre
- **5.11** (Écran 43 · Évaluation (toute la section)) : js/codex.js:3826 : proposerCodexAvantSuppression rend true sans rien afficher quand le codex est actif et sans modification depuis sa dernière mise à jour
- **5.13** (Écran 44 · Évaluation › Liste des évaluations) : js/liste-evaluations.js:1418-1428 : avec noteDiffereeActive(), la cellule Note % reçoit badgeNoteDifferee() au lieu du pourcentage ; js/preferences.js:593-597 : le repère dit « note différée » ; index.html:8876 : le réglage s'appelle « Masquer les notes par travail (note différée) »
- **5.15** (Écran 44 · Évaluation › Liste des évaluations) : js/liste-evaluations.js:1405-1407 : le badge « Non verrouillée » porte title="Non verrouillée : ne compte pas encore dans la note."
- **5.22** (Écran 44 · Évaluation › Liste des évaluations) : index.html:3508-3515 : .thead-sticky-bleu .tri-indicateur hérite de la couleur de l'en-tête (blanc sur --bleu-moyen), opacité 0,8 ; js/liste-evaluations.js:2438-2456 : les flèches de la Liste ont leurs propres id tri-eval-*
- **5.24** (Écran 44 · Évaluation › Liste des évaluations) : styles.css:3178-3188 : .eval-actions-select a une largeur fixe de 150 px ; styles.css:19045-19049 : sous @media (pointer: coarse), min-height: 44px
- **5.29** (Écran 44 · Évaluation › Liste des évaluations) : js/travaux-ui.js:1087-1096 : avant de vider le conteneur pour un groupe sans copie, la visionneuse ferme le mode Évaluer (fermerModeEvaluation) pour rendre au formulaire ses trois panneaux
- **5.30** (Écran 44 · Évaluation › Liste des évaluations) : js/evaluation.js:804-832 : _naviguerEtudiant passe à l'élève précédent ou suivant et recharge son évaluation ; js/evaluation.js:1609-1611 : une évaluation verrouillée se recharge en lecture seule
- **5.34** (Écran 44 · Évaluation › Liste des évaluations) : js/travaux-export-pdf.js:883-886 : avec copie, le fichier est enregistré sous `dossier_${prenom}_${nom}_${productionId}.pdf`
- **5.36** (Écran 44 · Évaluation › Liste des évaluations) : js/liste-evaluations.js:1795-1813 : apercuHTML compose la vignette de la première page (obtenirThumbnailSync, ou chargement depuis IndexedDB :1896-1897) et le nom du fichier ; :1866-1867 : il est posé juste sous le titre « Propriétés du fichier », avant Nom, Étudiant·e, Production, Évaluation liée
- **5.38** (Écran 44 · Évaluation › Liste des évaluations) : js/liste-evaluations.js:1797 et 1870 : nom de fichier passé par anonymiserNomFichier ; js/travaux-ui.js:4855-4877 : la question nomme l'élève par anonymiserNom et les fichiers par anonymiserNomFichier
- **5.39** (Écran 44 · Évaluation › Liste des évaluations) : js/travaux-ui.js:5507-5534 : appliquerCorrectionIdentite (correction d'identité du panneau) passe par reassignerCopie et attend son verdict ; js/travaux-ui.js:4930-4950 : reassignerCopie porte la porte de conflit
- **5.40** (Écran 44 · Évaluation › Liste des évaluations) : js/travaux-ui.js:4908-4914 : ecrireReassignation envoie l'existant en conflit à la corbeille (deplacerEnCorbeille) avant de réassocier ; js/liste-evaluations.js:900-907 : le geste en lot écrit chaque mesure par elle
- **5.41** (Écran 44 · Évaluation › Liste des évaluations) : js/liste-evaluations.js:721-725 : basculerToutSelectionnerEval coche les cases présentes dans #corps-tableau-evaluations, c'est-à-dire les seules lignes affichées après filtre
- **5.42** (Écran 44 · Évaluation › Liste des évaluations) : js/liste-evaluations.js:796-800 : un bloc « <N> conflit(s) » liste pour chaque conflit « élève : fichier existant → remplacé par nouveau fichier » et dit qu'il ira à la corbeille
- **5.46** (Écran 44 · Évaluation › Liste des évaluations) : styles.css:26848-26858 : .journal-modal a un fond --surface-carte (opaque : #1a3040 en sombre, #ffffff en clair, styles.css:248 et 531) ; styles.css:26962-26971 : les puces de détail sont en --texte-principal (contraste mesuré 7,22:1 et 15,90:1 dans le commentaire)
- **5.47** (Écran 44 · Évaluation › Liste des évaluations) : js/travaux-stockage.js:1069-1093 : supprimerDefinitivement appelle supprimerAnnotationsFichiers([id]) ; :1103-1110 retire de annotationsTravaux les annotations du fichier
- **5.48** (Écran 44 · Évaluation › Liste des évaluations) : js/liste-evaluations.js:2976-2986 : l'écriture des évaluations retirées passe par sauvegarderDonneesSelonMode avec le geste « Suppression des évaluations du fichier » ; sur un échec, le témoin dit « Non enregistré » et le message final ne compte que les évaluations réellement retirées (:2999-3001)
- **5.52** (Écran 44 · Évaluation › Liste des évaluations) : js/codex.js:42 : LISTES_DE_FICHIERS comprend corbeilleFichiers ; :494-495 : l'écriture du codex emporte les fichiers de la corbeille ; :886-888 : l'ouverture d'un codex restaure ceux des listes déclarées, corbeille comprise
- **5.53** (Écran 44 · Évaluation › Liste des évaluations) : js/liste-evaluations.js:1079 : les lignes de fichiers viennent de obtenirFichiersAffiches, qui écarte les copies d'un élève supprimé (js/travaux-stockage.js:461-466) ; :625-626 : le compte « N résultat(s) » est celui des lignes affichées
- **5.56** (Écran 44 · Évaluation › Liste des évaluations) : js/travaux-stockage.js:1117-1145 : purgerCorbeilleExpiree retire les fichiers de plus de 30 jours et, à la ligne 1135, leurs annotations (supprimerAnnotationsFichiers)
- **5.57** (Écran 44 · Évaluation › Liste des évaluations) : js/liste-evaluations.js:1443-1462 : DA, nom, prénom, nom de production et identifiants passent tous par echapperHtml avant d'entrer dans le HTML de la ligne
- **5.62** (Écran 45 · Évaluation › Préparer et importer) : js/travaux-import.js:408-420 : normalisation sans accent (NFD) et découpe en mots entiers ; :451-480 (_apparierParNom) : nom et prénom trouvés en entier pour un seul élève, sinon nom seul pour un seul élève, sinon null
- **5.65** (Écran 45 · Évaluation › Préparer et importer) : js/travaux-import.js:1430-1495 : assemblerPDFGroupe rend chaque page de PDF en image JPEG (pdf.js puis canvas) et les met dans un seul PDF ; js/travaux-ui.js:4653-4657 : les PDF entrent dans l'assemblage d'un groupe
- **5.66** (Écran 45 · Évaluation › Préparer et importer) : js/travaux-import.js:118 : le suffixe de page n'accepte que p, page, part, partie ou (n), pas une lettre ; :195-198 : la clé de document est DA + nom de production, donc « Artefact 1a » et « Artefact 1b » sont deux documents ; :1182-1187 : l'appariement de production se fait par mot entier
- **5.67** (Écran 45 · Évaluation › Préparer et importer) : js/travaux-import.js:1328-1333 : un fichier sans clé de document reste seul ; la clé, quand elle existe, contient le DA (:195-198, :641-647)
- **5.68** (Écran 45 · Évaluation › Préparer et importer) : js/travaux-ui.js:4408-4419 : l'import du remplaçant d'abord ; sans identifiant rendu, une erreur est levée, l'existant n'est pas envoyé à la corbeille, et la notification dit « Le remplacement a échoué : le fichier d'origine a été conservé. »
- **5.80** (Écran 45 · Évaluation › Préparer et importer) : js/travaux-ui.js:6229-6238 et 6247 : ouvrirEditeurPages refuse une copie aux archives par RC.MOTS.copie.refusGeste ; js/reserve-copies.js:155 : « Cette copie est aux archives : fais-la revenir avant de modifier ses pages. »
- **5.81** (Écran 45 · Évaluation › Préparer et importer) : js/travaux-ui.js:7033 : fusionnerFichiers refuse dès qu'une copie n'a pas son fichier ; :7080-7084 : une image sans fichier arrête le chargement au lieu d'être sautée ; :6919 : la fusion depuis l'éditeur refuse aussi
- **5.82** (Écran 45 · Évaluation › Préparer et importer) : js/travaux-ui.js:6220 : MOT_FUSION_SANS_FICHIER = « Le fichier de cette copie est introuvable : elle ne peut pas être fusionnée. » ; :7033 et 6919 l'affichent par _refuserSansFichier
- **5.83** (Écran 45 · Évaluation › Préparer et importer) : js/travaux-ui.js:6235 : dans _refuserSansFichier, une copie aux archives reçoit RC.MOTS.copie.refusGeste, aussi pour la fusion ; js/reserve-copies.js:155 : « … fais-la revenir avant de modifier ses pages. »
- **5.86** (Écran 45 · Évaluation › Préparer et importer) : index.html:11607 et 11614 : sous « 1. Déposer les fichiers : », le paragraphe « Une remise en plusieurs fichiers : pour que les pages s'assemblent en un seul document, numérote-les à la fin du nom … Une lettre … crée une AUTRE production … »
- **5.91** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation.js:581-608 : le chargement d'une évaluation existante pose sa grille, sa cartouche et son échelle enregistrées ; js/evaluation-chargement.js:687-697 : la cartouche du modèle de la production ne se pose que sur une copie sans évaluation ; js/travaux-ui.js:5202-5211 : la mémoire des derniers choix ne pré-remplit qu'une copie sans évaluation
- **5.93** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-visionneuse.js:161-168 et 215-237 : une copie sans fichier passe par ouvrirSansFichier, qui ferme l'ancienne copie (événement travaux-fichier-ferme), fait de celle-ci la copie ouverte et dit pourquoi
- **5.95** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-visionneuse.js:204-207 : MOTS_SANS_FICHIER.introuvable = « Le fichier de cette copie est introuvable. », affiché par ouvrirSansFichier (:236)
- **5.96** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-visionneuse.js:111-138 : assurerWorkerPDF charge une fois le worker de PDF.js par fetch et le sert ensuite depuis la mémoire (URL blob) ; un échec n'est pas mémorisé et le prochain essai repart de zéro
- **5.97** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-ui.js:709-724 : au retour dans Annoter et évaluer, les badges du carrousel sont régénérés à chaque fois depuis obtenirFichiersAffiches, et la copie ouverte n'est pas rouverte si elle n'y est plus
- **5.98** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-ui.js:1084-1104 : quand le groupe a des copies mais qu'aucune n'est affichable, le message devient « Aucune copie à afficher : celles de ce groupe appartiennent à des étudiant·es supprimé·es. »
- **5.100** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-annotation.js:578-587 : avec l'outil Texte, trouverAnnotationAuPoint cherche un texte sous le clic ; s'il y en a un, editerTexte l'ouvre en édition, sinon ajouterTexte crée un bloc
- **5.102** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-annotation.js:855-863 : une flèche ou une ligne tracée reste sélectionnée (selectionApresTrace) ; :594-607 : un clic sur une poignée l'attrape ; :1773-1790 : poignées cp (milieu), p1, p2 ; :712 : tirer cp courbe la ligne ; :2070-2079 : tirer p1 ou p2 déplace l'extrémité
- **5.103** (Écran 46 · Évaluation › Annoter et évaluer) : styles.css:18941-18955 : .travaux-canvas-container en overflow:auto avec justify-content:flex-start (commentaire #936) ; styles.css:19064-19068 : le wrapper porte margin 100vh 100vw
- **5.105** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-outils.js:2233-2279 : poignée de redimensionnement en Pointer Events (doigt, stylet, souris), sauvegarde à pointerup ; js/travaux-outils.js:2159-2190 : largeur et hauteur enregistrées dans localStorage par palette et restaurées ; styles.css:19482-19490 : poignée 44 px, touch-action:none
- **5.106** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-retroaction.js:338 : genererRetroaction ajoute _rendreAnnotationsVisuelles(), qui lit les tampons posés sur la copie (:235-246)
- **5.107** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-retroaction.js:194-210 : _rendreObservationsAnnotations écrit « --- Observations --- » puis, par catégorie, chaque tampon avec son nombre et son texte, via travauxOutils.observationsDesTampons (js/travaux-outils.js:1052)
- **5.108** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-outils.js:1439-1471 : la catégorie comprehension n'est rendue dans la palette que si la préférence afficherDescriptionsSOLO n'est pas false, sur le même patron que la catégorie action (activerActionsRLO)
- **5.109** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-outils.js:3465-3467 : l'import d'un fichier de tampons retire les balises de toute chaîne (retirerBalisesProfond) ; js/travaux-outils.js:1453-1460 et js/tampons-bibliotheque.js:327-338 : le nom de tampon est échappé à l'affichage
- **5.112** (Écran 46 · Évaluation › Annoter et évaluer) : js/codes-annotation.js:197-250 : sous une grille dont le critère algorithmique porte codesDepuisSousCriteres, listeCodes rend les sous-critères (numéro, nom, couleur, rétroaction) ; js/codes-annotation.js:276-288 : grilleDeCopie résout la grille de la copie ; js/travaux-outils.js:1402-1418 : la palette affiche numéro, couleur et nom
- **5.113** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-outils.js:1535-1538 : sur une copie gouvernée, l'infobulle de l'engrenage porte la phrase de _phraseSourceCodes (:601-604) ; js/travaux-outils.js:3566-3578 : l'engrenage ouvre une fenêtre qui ne montre que cette phrase
- **5.114** (Écran 46 · Évaluation › Annoter et évaluer) : styles.css:26447-26459 : dans .palette-flottante, .travaux-errfr-nom passe à white-space:normal et overflow-wrap:break-word
- **5.115** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-ui.js:1220 et :62 : l'infobulle du chronomètre est « Démarre à la 1re annotation et s'arrête au verrouillage. »
- **5.126** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-enonces.js:137-158 : critereAlgorithmiqueOuNomme rend { nom: critereNom } lu dans l'évaluation enregistrée quand la grille est introuvable ; utilisé à l'écran (js/evaluation-retroaction.js:680-683, js/evaluation-calcul.js:470-478) et au PDF (js/synthese-retroaction-data.js:690-693 et :889-890)
- **5.127** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-calcul.js:950 : un critère dont le niveau n'a pas de valeur est classé niveau-sans-valeur ; :1165-1170 : la phrase nomme critère et niveau et renvoie à Conception, Échelles de performance ; :1592 : la note affiche « -- » au lieu d'un pourcentage
- **5.128** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-calcul.js:985-1050 : porteeDepuisEvaluation retire de la référence les critères ajoutés après l'évaluation (criteresAjoutesDepuis, :1115-1129) et garde la portée déclarée ; aucune écriture
- **5.129** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-chargement.js:1866-1868 : l'avis titre « Un critère a été ajouté à la grille après cette évaluation » (pluriel sinon), avec le nom et la pondération puis l'explication
- **5.130** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-chargement.js:1816-1838 : _signalerCriteresHorsGrille pose un encadré .alerte.alerte-attention qui nomme le critère retiré et son niveau (ou ses points) enregistré ; styles.css:142-143 et :3933-3936 : couleurs ambre de l'alerte attention
- **5.133** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation.js:562-567 : sans évaluation pour l'élève, le menu statutIntegrite est remis à « recevable » et l'événement change vide les notes
- **5.136** (Écran 46 · Évaluation › Annoter et évaluer) : js/synthese-retroaction-data.js:483-505 : commentaireDuCritere ne prend pas la cartouche quand le commentaire enregistré est une chaîne vide ; js/evaluation-chargement.js:1429-1444 et :1462-1470 : à l'ouverture, le div du critère reçoit ce vide
- **5.137** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-retroaction.js:441-461 : question « Garder la mienne » / « Remplacer » ; :304-307 : posée seulement si la copie est marquée à demander, ni pendant un chargement ni sur une copie verrouillée ; :397-401 et :417-425 : une fois par copie, pour une évaluation sans clé retroactionReecrite
- **5.138** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-retroaction.js:821-831 : _chargerHistoriqueBilan lit historiqueAnterieur, la même fonction que lireHistorique du PDF (js/synthese-retroaction-data.js:1445-1450, :1474)
- **5.142** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-jetons.js:585-594 : la reprise ne recopie pas jetonDelaiApplique, delaiAccorde, dureeDelaiJours ni remplaceeParId ; :519-522 : refus sur une évaluation déjà remplacée ; :373-376 : refus du délai sur une copie remplacée
- **5.145** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-jetons.js:276-278 : _persisterEvaluationsJetons passe le geste à sauvegarderDonneesSelonMode ; js/modes.js:1197-1219 : sur refus ou exception, le témoin dit « Non enregistré » avec le geste et la raison ; js/evaluation-jetons.js:401 : rien ne bascule ensuite
- **5.147** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-jetons.js:560-567 : si la pratique supprime l'originale (archiverOriginale faux), Codex.proposerAvantSuppression('repriseOriginale') est appelé avant d'appliquer la reprise ; js/codex.js:3819-3826 : rien n'est demandé si le codex est actif et à jour
- **5.151** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation.js:2637-2645 : basculerVerrouillageEvaluationCourante passe par sauvegarderEvaluation pour verrouiller ; js/travaux-ui.js:5338-5342 : le cadenas appelle cette fonction
- **5.155** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation.js:2825-2826 : TITRE_CADENAS_VERROUILLE « Verrouillée – clique pour déverrouiller » et TITRE_CADENAS_OUVERT « Non verrouillée – clique pour verrouiller », posés en title et aria-label (:2712-2713)
- **5.157** (Écran 46 · Évaluation › Annoter et évaluer) : index.html:11691 : dans l'aide « Annoter et évaluer un travail », « Ton évaluation s'enregistre toute seule pendant que tu évalues ; le témoin « Enregistré » le dit. Quand elle est prête, clique sur Verrouiller l'évaluation (ou sur le cadenas) : elle compte alors dans la note… »
- **5.165** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation.js:1206-1222 : sans copie, les panneaux travaux-eval-gauche et travaux-eval-droite sont montrés ; index.html:8484-8538 : grille, échelle, cartouche, intégrité et jetons dans le panneau gauche ; index.html:8550 : critères dans le panneau droit
- **5.166** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-ui.js:5352-5359 : equiperFormulaireSansCopie pose le cadenas dans l'en-tête Paramètres et équipe la rétroaction ; js/travaux-ui.js:5291-5306 : boutons « Copier tout » et « Copier »
- **5.167** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-ui.js:5524-5533 : la correction d'identité du panneau d'évaluation appelle reassignerCopie et, sur refus, n'écrit rien et le dit ; js/travaux-ui.js:4917-4932 : reassignerCopie rend false sans écrire si un confirm est refusé
- **5.168** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-ui.js:4892-4901 : texteDeLaPorte nomme le fichier existant et celui qui le remplace, et l'élève avec la production quand l'élève change
- **5.170** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation-chargement.js:2089 : l'auto-save écrit par sauvegarderDonneesSelonMode ; js/modes.js:1210-1211 : une écriture réussie fait dire « Enregistré » au témoin commun (_annoncerEnregistre, :1071-1100)
- **5.171** (Écran 46 · Évaluation › Annoter et évaluer) : js/travaux-annotation.js:115-120 : à la fermeture de la copie, _flusherAutoSave ; js/travaux-annotation.js:131-145 : au beforeunload, sauvegarde de l'annotation en attente puis _flusherAutoSave
- **5.172** (Écran 46 · Évaluation › Annoter et évaluer) : js/evaluation.js:1519-1545 : _attendreSaisiePremierCritereModif guette n'importe quel critère enregistré et, à défaut, accepte la grille rendue au lieu de rejeter
- **5.174** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-archivage.js:334-340 : exporterTravaux ajoute _evaluations.json au ZIP avec les copies
- **5.175** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-archivage.js:309-327 : un fichier illisible est attrapé, nommé dans echecs, et la boucle continue ; :701 : l'archive part quand même ; :783-790 : le bilan liste les copies en échec
- **5.176** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-archivage.js:35-43 : _assainirSegmentChemin remplace « / » et les caractères interdits mais garde les accents ; appliqué aux dossiers (:298-305) et au nom du ZIP (:685-697)
- **5.177** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-archivage.js:91-97 : _libelleEleve rend en anonymisation le nom anonyme seul, sans DA, pour le dossier ; js/modes.js:331 et :368 : le nom anonyme est « Élève N »
- **5.178** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-archivage.js:283 : exporterTravaux part de obtenirFichiersGroupeActif ; js/travaux-stockage.js:446-452 : cette liste ne filtre pas les élèves supprimés, contrairement à obtenirFichiersAffiches (:461-466)
- **5.181** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-archivage.js:383-421 : selectionnerEvaluationsLea part des évaluations non remplacées, en garde une par élève avec priorité à la reprise, et ne retient que les DA des copies affichées, sans élèves supprimés
- **5.183** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-archivage.js:467-478 : en anonymisation, le PDF se nomme libellé anonyme + nom de production + « _Evalue.pdf » ; :443-444 : le nom de production garde les lettres accentuées et met des tirets ailleurs
- **5.190** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-ui.js:709-724 : au retour dans Annoter et évaluer, la copie ouverte n'est gardée que si elle est encore listée, et la bande de badges (le carrousel) est régénérée à chaque retour depuis obtenirFichiersAffiches
- **5.207** (Écran 47 · Évaluation › Exporter et archiver) : index.html:11711-11715 : sous « Deux façons d'exporter : », l'item « Exporter des travaux : les productions en PDF et les évaluations en JSON, dans un ZIP. Laisse « Toutes » et « Tous » pour l'archive de tout le groupe… », puis « Export Léa »
- **5.209** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-ui.js:3711-3716 : quand quota.alerteQuota est vrai, le bloc dit « L'espace est presque plein. » et « Exporte tes anciens travaux avant d'en importer d'autres. »
- **5.210** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-ui.js:1275-1292 : la grille des copies est rendue à partir de obtenirFichiersAffiches, sans les copies d'élèves supprimés, et son aperçu s'ouvre depuis cette grille ; le compte « en stock » garde obtenirFichiersGroupeActif
- **5.211** (Écran 47 · Évaluation › Exporter et archiver) : js/travaux-ui.js:1291-1293 : sans fichier, l'écran affiche un paragraphe placeholder-vide « Aucun fichier en stock pour ce groupe. Importe des travaux dans « Préparer et importer »… »
- **5.213** (Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse)) : js/synthese-retroaction-data.js:1489-1493 : ligneCritereATravailler écrit « Nom (niveau) : définition » ; js/synthese-retroaction-rendu.js:660 : rangée « Présentement, il faut se concentrer sur »
- **5.215** (Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse)) : js/synthese-retroaction-data.js:905-907 : quand la copie précédente avait aussi tout acquis, la phrase « Tous les critères sont maîtrisés depuis plus d'une production. Tu peux aider tes collègues : … »
- **5.216** (Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse)) : js/synthese-retroaction-data.js:1400-1424 : en niveaux seulement, la sélection garde les productions avec leur niveau, note mise à null, sans pondération ni moyenne ; js/synthese-retroaction-rendu.js:706-712 et :805 : sans note ni moyenne, ni pourcentage, ni calcul, ni note finale
- **5.217** (Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse)) : js/synthese-retroaction-rendu.js:744-747 et :755-757 : la ligne « Sélection (1 retenue sur 4 possibles) » est formée de nombreSelection et nombreARetenirSelection
- **5.218** (Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse)) : js/synthese-retroaction-data.js:207-216 : en anonymisation, l'en-tête reçoit le nom anonyme, un DA vide et le groupe ; js/synthese-retroaction-rendu.js:154-158 : la ligne de l'élève ne montre le DA que s'il existe et ajoute « Gr. »
- **5.219** (Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse)) : js/synthese-retroaction-rendu.js:412-424 : renderPorteeIncomplete nomme chaque critère en attente avec sa pondération (ou son niveau) suivi de « reste à évaluer » (ou « restent »)
- **5.222** (Écran 48 · Sortie commune : le PDF de rétroaction de l'élève (Dossier PDF, export Léa, page de synthèse)) : js/synthese-retroaction-rendu.js:123-136 : texteSur choisit l'encre ou le papier selon le meilleur rapport de contraste WCAG avec le fond ; utilisé sur les couleurs de l'échelle (:210, :213, :356, :464, :558)
- **6.2** (Écran 49 · Suivi (commun aux quatre écrans de cette partie)) : js/trimestre-v2-etudiants.js:1108-1115 : « Supprimer » retire seulement la fiche de groupeEtudiants ; js/import-export.js:1694-1710 : un DA ajouté de nouveau à la liste n'est plus écarté
- **6.9** (Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écrans)) : js/horaire.js:143-151 : projeterPeriodesParSeance donne periodesParSeance de l'horaire à toute séance sans nombrePeriodes, en lecture
- **6.10** (Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écrans)) : js/indices.js:228-230 et 297-299 : A vaut null sans séance saisie ; js/etudiants.js:1192-1196 (Liste), js/tableau-bord-apercu.js:568-572 (Suivi du groupe), js/profil-etudiant-sections-affichage.js:584 et 2375 (profil), js/profil-etudiant-rapport.js:92 (rapport)
- **6.11** (Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écrans)) : js/indices.js:216-221 : les séances antérieures à dateArrivee sont filtrées avant le calcul de A ; même filtre js/profil-etudiant-sections-affichage.js:1830-1832
- **6.14** (Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écrans)) : js/pratiques/pratique-sommative.js:288, js/pratiques/pratique-configurable.js:613, js/pratiques/pratique-pan-standards.js:368 : une production facultatif est retirée du dénominateur de C
- **6.15** (Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écrans)) : js/profil-etudiant-helpers.js:425-428 lit seuilsInterpretation.nombreProductionsAnalyse (réglé js/preferences-v2.js:400-402) ; profil js/profil-etudiant-calculs.js:1815 ; Suivi du groupe js/tableau-bord-apercu.js:3054 et 3184
- **6.18** (Écran 51 · Suivi : les captures hebdomadaires) : js/snapshots.js:576-594 : le numérateur ne compte que les DA des élèves actifs du groupe (Set, donc chacun une fois), le dénominateur est le nombre de ces élèves
- **6.20** (Écran 51 · Suivi : les captures hebdomadaires) : js/snapshots.js:286-291 : estDenotation (code DEN) empêche tout calcul de P historique ; indiceP reste null
- **6.21** (Écran 51 · Suivi : les captures hebdomadaires) : js/snapshots.js:524-533 : chaque capture garde le P de chaque élève ; js/snapshots.js:602 : moyenneP du groupe
- **6.22** (Écran 51 · Suivi : les captures hebdomadaires) : js/snapshots.js:859-881 : la reconstruction vide les seules captures hebdomadaires et garde interventions et dernierSnapshotIntervention
- **6.24** (Écran 52 · Suivi › Suivi du groupe) : js/tableau-bord-apercu.js:1951-1952 : linear-gradient continu ; 2071-2104 : couleur d'un point interpolée entre deux arrêts ; js/accompagnement-contenu-terme.js:234 : le glossaire dit « c'est un dégradé continu, dont la couleur est interpolée »
- **6.25** (Écran 52 · Suivi › Suivi du groupe) : js/tableau-bord-apercu.js:1617 : la phrase exacte ; 1738-1740 et 1884 : affichée dans la barre A quand des présences existent et qu'aucune séance de l'horaire ne porte de périodes
- **6.26** (Écran 52 · Suivi › Suivi du groupe) : js/horaire.js:117-151 : les séances d'un horaire d'avant #540 reprennent periodesParSeance, ce qui redonne un dénominateur à A
- **6.28** (Écran 52 · Suivi › Suivi du groupe) : js/tableau-bord-apercu.js:1680-1690 : présences et évaluations des DA de dasElevesSupprimes() retirées avant de compter séances et évaluations « en attente »
- **6.29** (Écran 52 · Suivi › Suivi du groupe) : js/graphiques-progression.js:4064-4066 : le plugin des zones n'est monté qu'en mode « habiletes » ; 4171-4173 : zones tirées de l'échelle majoritaire des évaluations tracées ; 1817-1877 : lignes pointillées et lettres de niveau
- **6.30** (Écran 52 · Suivi › Suivi du groupe) : index.html:8867 : « Lignes pointillées et étiquettes des niveaux de ton échelle sur le graphique par critère du profil individuel et sur les trajectoires du Suivi du groupe, en mode Habiletés » ; js/accompagnement-contenu-hover.js:179-180
- **6.31** (Écran 52 · Suivi › Suivi du groupe) : index.html:7569 : « En mode Habiletés, les lignes pointillées et les lettres des niveaux … viennent de l'échelle de tes évaluations … Le mode Note finale n'en affiche pas »
- **6.32** (Écran 52 · Suivi › Suivi du groupe) : js/tableau-bord-apercu.js:155-171 : à la première lecture d'un groupe-cours sans clé, la liste nue (ou du trimestre) est filtrée sur les élèves suivables du groupe et semée ; la clé d'origine n'est ni effacée ni réécrite
- **6.33** (Écran 52 · Suivi › Suivi du groupe) : js/tableau-bord-apercu.js:191-193 : ajout refusé si le DA n'est pas dans dasSuivablesDuGroupe ; 133-137 et 184-187 : un exclu (abandon compris) sort des visibles et ne compte plus dans le plafond de cinq
- **6.34** (Écran 52 · Suivi › Suivi du groupe) : js/tableau-bord-apercu.js:568-572 : valeur A nulle, badge « A » suivi d'un tiret avec title « Assiduité inconnue : aucune séance saisie ne compte encore pour cet·te étudiant·e. »
- **6.36** (Écran 52 · Suivi › Suivi du groupe) : js/tableau-bord-apercu.js:2773-2783 (barre RàI) et 2542-2551 (barre des patterns) : ligne en italique « Analyse préliminaire, basé sur n production(s) sur N configurées » ou « Certains étudiants ont moins de N productions évaluées »
- **6.38** (Écran 52 · Suivi › Suivi du groupe) : js/profil-etudiant-helpers.js:777-787 : en démonstration, la grille de référence se résout À LA LECTURE (grille désignée si dans le pack, sinon première grille du pack avec critères), sans rien écrire
- **6.39** (Écran 52 · Suivi › Suivi du groupe) : js/tableau-bord-apercu.js:1354-1358 : calculerEtudiantsPrioritaires() rafraîchit la liste enrichie (élèves actifs, 255-256) AVANT les barres qui la lisent ; 1428-1488 : la phrase est bâtie sur cette liste
- **6.42** (Écran 52 · Suivi › Suivi du groupe) : js/correlations-longitudinales.js:234-239 : sans séance à la date de l'intervention ou après, idxDebut vaut le nombre de séances, et moyennesPDuGroupe (200-201) laisse tous les points à null
- **6.43** (Écran 52 · Suivi › Suivi du groupe) : js/tableau-bord-apercu.js:177-187 : nettoyerEtudiantsSuivis filtre à la lecture (élèves du groupe actif, non exclus) et n'écrit jamais ; seuls ajouter, retirer, réinitialiser appellent sauvegarderEtudiantsSuivis
- **6.44** (Écran 53 · Suivi › Liste des étudiant·es) : js/etudiants.js:637-640 (plus de filtre statut actif), 1142-1147 (classe etudiant-inactif), 1173 : nom suivi de « (Décrochage) », « (Inactivité) » ou « (Abandon) »
- **6.45** (Écran 53 · Suivi › Liste des étudiant·es) : js/indices.js:336-338 : A est calculé pour tous les élèves, exclus compris ; js/etudiants.js:1192-1193 affiche indices.A sur la ligne grisée
- **6.47** (Écran 53 · Suivi › Liste des étudiant·es) : js/etudiants.js:1184-1196 : sans assiduité connue (A null), la cellule A affiche un tiret gris
- **6.48** (Écran 53 · Suivi › Liste des étudiant·es) : js/interventions.js:223-226 et 535-540 : obtenirInterventionsEtudiant ne garde que les interventions du groupe-cours actif, ou sans groupeCoursId (celles d'avant l'estampille) ; js/etudiants.js:1226-1229 l'utilise pour le compteur
- **6.50** (Écran 53 · Suivi › Liste des étudiant·es) : js/etudiants.js:463 et 485 : le bouton [data-aide] est retiré puis remis dans le titre à chaque rendu ; js/accompagnement.js:971-978 : clic délégué au document
- **6.51** (Écran 53 · Suivi › Liste des étudiant·es) : js/etudiants.js:633-697 : filtrerEtudiants applique groupe, programme, RàI, pattern et recherche à toute la liste, sans filtre de statut
- **6.52** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:2627 : sous le nom, « ‹libellé› · hors des moyennes du groupe » pour un exclu ; js/main.js:125-127 : libellés Inactivité, Décrochage, Abandon
- **6.54** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-actions.js:141-143 : phrase identique ; affichée par les retours erreur (181, 404) et la carte contexte (js/profil-etudiant-calculs.js:1932)
- **6.55** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-actions.js:146-151 : « La pratique assignée à ce groupe-cours est introuvable dans la bibliothèque (supprimée, ou assignation vers un identifiant obsolète)… »
- **6.56** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-actions.js:178-181 et 395-409 : une pratique absente ou sans configuration portfolio rend un objet { erreur } au lieu de lever une exception
- **6.57** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/pratiques/pratique-pan-specifications.js:272 et 85 : aucun forfait atteint sans palier d'échec, pas de note, cause « Ta pratique ne dit pas quelle note donner quand aucun forfait n'est atteint. » ; js/profil-etudiant-sections-affichage.js:1110-1114 : tiret plus cause
- **6.59** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:1751-1761 et 1886-1887 : lecteurLeconsDuGroupe du groupe-cours de l'élève donne les leçons de chaque date d'absence ou de retard ; 635 : titre rendu dans la pastille
- **6.61** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:485-497 : hors Standards, les pastilles de la carte Complétion sont les productions que obtenirDetailsCompletion compte (remises et non remises)
- **6.62** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-calculs.js:1960-1971 : A inconnu avec C calculable, libellé en tiret et recommandation exacte ; js/profil-etudiant-sections-affichage.js:1275-1299 : rendus dans la carte Contexte d'apprentissage
- **6.63** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:368-370 (contenu vide) et 2564, 2653-2657 (entrée « Engagement ACP » absente de la barre latérale) quand depistageAcp est faux ; index.html:8841-8843 : case « Activer la collecte… »
- **6.66** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/portfolio.js:309-311 : arrondirIndiceSurCent (demie vers le haut, bruit flottant retiré) ; utilisé 469 (P stocké, profil) et 582 (P simulé, lu par l'export js/export-resultats-finaux.js:93-100)
- **6.67** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:3013 et 4008, js/profil-etudiant-actions.js:607 : « non verrouillée »
- **6.70** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-diagnostics.js:299-310 : l'onglet « Gestes cognitifs » n'est ajouté que si activerActionsRLO vaut true (case « Observation des actions », index.html:8733)
- **6.71** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:4037-4076 : nombre et liste des évaluations retenues lus dans calculerDetailsNoteFinale, null hors Standards ; 4085-4096 : la ligne de calcul n'est écrite que si elle redonne la moyenne
- **6.73** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-helpers.js:905-917 et 950-956 : un critère niveauSOLO « aucun » sort des critères surveillés, donc ni barre ; js/profil-etudiant-calculs.js:1297 : ni défi ni cible (diagnostiquerForcesChallenges part de cette liste)
- **6.74** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-calculs.js:918-933 : clé = nom normalisé entier (deux critères de français distincts) ; 1297-1343 : aucun critère exclu par son nom, le plus faible sous le seuil devient principalDefi ; 2145-2148 : la cible d'intervention le nomme
- **6.76** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:4099-4101 (contenu vide) et 2566, 2667-2671 (entrée retirée de la barre latérale) quand afficherDeveloppementHabiletes est faux
- **6.78** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/graphiques-progression.js:2077-2094 : chaque valeur se convertit dans l'échelle de SON évaluation (tableConversionPourEvaluation), un critère en points par sa fraction ; 2325 : zones de l'échelle des évaluations
- **6.79** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/graphiques-progression.js:2087-2091 : une valeur non convertible rend null (point absent) et est comptée ; 2118-2122 et 2313-2322 : « n évaluation(s) sans valeur convertible dans cette échelle »
- **6.80** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/graphiques-progression.js:2316-2318 : si plusieurs échelles coexistent, « Zones : échelle « nom » (n évaluations sur m) »
- **6.81** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:3361 (contenu vide) et 2565, 2660-2664 (entrée « Progression temporelle ACP » absente) quand afficherGraphiques est faux
- **6.82** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/graphiques-progression.js:2382 : plugins pluginGradientFond100 (vide, 1987-1993) et pluginEtiquettesZones100 ; 1892-1950 : lignes setLineDash et codes de niveau dans la marge, aucun remplissage
- **6.83** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:1078-1080 (palier), 1257 (défi principal), 1243-1245 (flèche après chaque critère) ; flèches selon obtenirSeuil('directionRisque'), 2268-2295
- **6.86** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-sections-affichage.js:2563 et 2674-2678 : l'entrée « Accompagnement » n'existe que si activerRai est vrai
- **6.87** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-calculs.js:1799-1832 : sans artefact et sans travail dû ou copie évaluée, label « En attente » (niveau 0) ; js/profil-etudiant-sections-affichage.js:1078-1080 l'affiche dans la carte RàI
- **6.88** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-confidentiel.js:325-330 : écouteur change délégué ; 314-320 : chaque champ déclenche l'écriture ; 304 : sauvegarderDonneesSelonMode avec un geste, donc par le témoin
- **6.89** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-confidentiel.js:161-167 et 296-297 : l'objet est réécrit sans les champs portrait*, sans aucune purge ; index.html:14858 : bloc retiré
- **6.90** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : index.html:14831 (Parcours), 14873 (Défis particuliers), 14895 (Diagnostic), 14863 (Notes personnelles), 14926 (Notes de présences)
- **6.91** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-confidentiel.js:159 : notes posées par .value ; 185-193 et 223-227 : notes de présences passées par escapeHtml, attributs par echapperHtml
- **6.101** (Écran 54 · Suivi › Profils individuels (le profil d'un élève)) : js/profil-etudiant-calculs.js:124 : obtenirEchelleResolue lit cle('echellesTemplates'), clé préfixée par le trimestre actif
- **6.102** (Écran 55 · Suivi › Saisie des présences) : js/saisie-presences.js:99-101 : sans date mémorisée, derniereSeancePassee() propose une date ; 1209-1240 : le bandeau n'apparaît que sans séance d'horaire ni séance complète ; js/demo-namespace.js:241-242 : la démo a un horaire
- **6.103** (Écran 55 · Suivi › Saisie des présences) : js/horaire-fusion.js:45-76 : dédoublonnage par (jour, heure de début) ; appelé par js/trimestre.js:71 et js/trimestre-v2-horaires.js:1017
- **6.104** (Écran 55 · Suivi › Saisie des présences) : js/saisie-presences.js:1465-1467 : la grille lit obtenirEtudiantsCoursActif ; js/trimestre-v2-etudiants.js:1108-1115 : la suppression retire la fiche de cette liste
- **6.105** (Écran 55 · Suivi › Saisie des présences) : js/saisie-presences.js:1541-1544 : séance saisie pour le sous-groupe et pas de fiche, valeur 0 ; 947 et 1578-1579 : mention « Non saisi·e : compté·e absent·e »
- **6.106** (Écran 55 · Suivi › Saisie des présences) : js/saisie-presences.js:2200-2204 : la recherche cache les lignes par une classe sans les retirer du DOM ; 965-992 et 1027-1030 : l'écrivain prend toutes les lignes rendues, cachées comprises, et les non marquées gardent leur valeur présente (1533-1536)
- **6.111** (Écran 55 · Suivi › Saisie des présences) : js/saisie-presences.js:1615-1631 : seuls les deux boutons de l'en-tête sont mis à jour ; index.html:7957 : le span data-tooltip « presences-presence-col » n'est plus réécrit
- **6.112** (Écran 55 · Suivi › Saisie des présences) : js/saisie-presences.js:1893-1898 : confirmerAction avec variante 'danger' ; js/ui-dialogues.js:154-155 : en variante danger, le focus va sur Annuler
- **6.113** (Écran 55 · Suivi › Saisie des présences) : index.html:7967-7968 : title et aria-label « Réinitialiser (tout le monde absent) » ; js/saisie-presences.js:1628 ne change que disabled
- **6.114** (Écran 55 · Suivi › Saisie des présences) : js/saisie-presences.js:808-827 : à la première lecture d'un groupe-cours, la liste nue datesVerrouillees (ou du trimestre) est semée entière dans la clé du groupe ; l'ancienne n'est ni effacée ni réécrite
- **6.115** (Écran 55 · Suivi › Saisie des présences) : js/saisie-presences.js:975-978 : seules les lignes rendues pour cette date s'écrivent ; 1044-1048 : ne retirer que ce qui sera réécrit, jamais un autre cours
- **6.116** (Écran 55 · Suivi › Saisie des présences) : js/saisie-presences.js:854-866 : si ecrirePresencesSeance rend false, le contrôle revient à non verrouillé et la date n'est pas ajoutée
- **6.118** (Écran 55 · Suivi › Saisie des présences) : js/presences-rapport.js:481-483 et 491-515 : dessinerLegende(doc, y, notation) écrit une légende propre à chacune des notations
- **6.120** (Écran 55 · Suivi › Saisie des présences) : js/main.js:1131-1138 : initialiserModuleSaisiePresences passe par window.auDbPret, qui attend l'événement db-ready (js/db.js:2240-2261)
- **6.121** (Écran 55 · Suivi › Saisie des présences) : js/db.js:296-337 : _avecReprise rouvre la connexion IndexedDB perdue et refait l'opération ; 468-470 : onclose marque la connexion perdue
- **7.10** (Écran 56 · Le dépistage : ce qu'il calcule (transversal, lu dans le Suivi)) : js/profil-etudiant-helpers.js:779-788 : en démo, diagnostiquerGrilleReferenceDepistage prend la grille désignée si elle est dans le pack, sinon la première grille du pack qui a des critères, sans rien écrire ; js/profil-etudiant-calculs.js:1282 : diagnostiquerForcesChallenges (d'où vient le défi principal du pattern « Défi spécifique ») lit cette grille
- **7.12** (Écran 56 · Le dépistage : ce qu'il calcule (transversal, lu dans le Suivi)) : js/tableau-bord-apercu.js:1449 et 1479 : genererInterpretationSuiviFondamentaux compte « Difficulté récente » et écrit « N récente(s) » dans la phrase du bilan
- **7.16** (Écran 57 · Suivi › Profils individuels › Accompagnement : la carte RàI et les niveaux RàI) : js/tableau-bord-apercu.js:3004-3006 : afficherPatternsApprentissage écarte de la barre tout élève dont determinerCibleIntervention rend le niveau 0 ; js/profil-etudiant-calculs.js:1818-1830 et 2125-2150 : sans présence ni production, la carte rend « En attente » niveau 0 et la cible reprend ce palier
- **7.34** (Écran 59 · Le dépistage du français en semaine 1 : le travail diagnostique et son signalement) : index.html:4704-4726 : dans la grille à deux colonnes de la fiche, la colonne de gauche contient #champPonderation puis la case #productionDiagnostique
- **7.35** (Écran 59 · Le dépistage du français en semaine 1 : le travail diagnostique et son signalement) : js/entites/signalement-depistage.js:89 : un signalement ne se lève que si le palier atteint porte leveSignalement === true ; js/grilles.js:4161-4164 : la case « Ce palier lève un signalement » est posée sur chaque palier du gabarit
- **7.45** (Écran 60 · Suivi › Interventions) : js/interventions.js:414-417 : afficherListeInterventions passe par interventionsDuContexteActif ; l. 535-556 : seules les interventions du groupe-cours actif sont gardées, celles sans groupeCoursId restent, et en mode cours toutes celles des groupes-cours du cours sont acceptées
- **7.47** (Écran 60 · Suivi › Interventions) : js/interventions.js:1624-1629 : à l'enregistrement, une intervention sans groupeCoursId reçoit celui du contexte actif (obtenirIdContexteActif)
- **7.48** (Écran 60 · Suivi › Interventions) : js/interventions.js:238-243 : _interventionsLisibles écarte les entrées jamaisSauvegardee sans les supprimer ; utilisée par la liste (l. 412) et par les comptes par élève (obtenirInterventionsEtudiant, l. 223-224)
- **7.50** (Écran 60 · Suivi › Interventions) : js/interventions.js:482, 497 et 510 : titre par echapperHtml(_titreAffiche(...)), description et observations par _texteLibreAffiche, qui appelle echapperHtml (l. 17-21)
- **7.52** (Écran 60 · Suivi › Interventions) : js/interventions.js:123 et 1006 : placeholder du titre « Ex. Intervention sur deux critères ciblés » ; l. 1135 : placeholder de l'objectif « Ex. Amener un critère au seuil visé »
- **7.54** (Écran 60 · Suivi › Interventions) : js/interventions.js:1512-1528 : les participants que le formulaire n'a pas montrés sont gardés ; l. 1561-1570 : les notes partent de celles en base et seuls les champs affichés les modifient, coché ou non
- **7.55** (Écran 60 · Suivi › Interventions) : js/temoin-enregistrement.js:163-176 : nonEnregistre écrit « Non enregistré – ‹geste› : ‹raison› » ; js/interventions.js:1674-1680 : un id ni en base ni en brouillon appelle nonEnregistre avec la raison « intervention non trouvée. » et rend false
- **7.60** (Écran 60 · Suivi › Interventions) : js/interventions.js:738-760 : genererAffichageNotesIndividuelles rend la note d'un élève absent du groupe avec la classe etud-texte-gris-clair, son nom (fiche du trimestre) ou son DA, suivi de « (n'est plus dans le groupe) » ; l. 762-768 : le compteur « Notes individuelles » vaut le nombre de lignes rendues
- **7.68** (Écran 60 · Suivi › Interventions) : js/correlations-longitudinales.js:233-240 : sans séance à la date de l'intervention ou après, idxDebut vaut le nombre de séances, donc la courbe reste vide ; l. 247-253 : la courbe est quand même ajoutée à interventionsCourbes
- **7.71** (Écran 61 · Suivi › Rencontres) : js/interventions.js:582 : sans rendez-vous à venir, le bloc dit « Aucun rendez-vous à venir. Tes rencontres passées restent dans la liste ci-dessous. » ; l. 449-457 : sans aucune rencontre, la fonction sort avant le bloc
- **7.72** (Écran 61 · Suivi › Rencontres) : js/rencontres.js:85-91 puis js/interventions.js:417 et 535-540 : la liste des rencontres passe par interventionsDuContexteActif, qui ne garde que les interventions estampillées du groupe-cours actif (ou sans estampille)
- **7.73** (Écran 61 · Suivi › Rencontres) : js/navigation.js:455-465 : rafraichirSousNavigationSelonContexte, appelée par js/contexte.js:25 à chaque changement de contexte, envoie sur « suivi-rencontres » quand l'onglet actif était « suivi-interventions » et qu'il disparaît
- **7.75** (Écran 61 · Suivi › Rencontres) : js/accueil.js:170 : la carte de la porte orthopédagogue dit « Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre. »
- **7.78** (Écran 61 · Suivi › Rencontres) : js/rencontres.js:376-378 : un service créé en démo reçoit isDemo et creeEnDemonstration ; js/demo-activation.js:435-437 : retirerItemsDemoDesGlobaux, appelée par desactiverModeDemo (l. 514), retire ces cours de la clé globale
- **7.81** (Écran 61 · Suivi › Rencontres) : js/rencontres.js:207, 250 et 273 : toute ligne lue, Omnivox comprise, reçoit groupe GROUPE_SERVICE (« 00001 ») quel que soit son numéro d'origine ; l. 388 : la fiche ajoutée au trimestre porte ce même groupe
- **7.82** (Écran 61 · Suivi › Rencontres) : js/interventions.js:156 : aideBilan du vocabulaire « rencontres » vaut « Ce que tu retiens de la rencontre. » ; l. 1224 : ce texte est rendu sous le titre du bilan
- **7.83** (Écran 61 · Suivi › Rencontres) : js/interventions.js:1597-1604 : les critères ciblés et l'objectif ne sont relus que si leur conteneur ou leur champ existe ; sur un service, la carte n'est pas rendue (l. 1115), donc les valeurs en base restent
- **7.84** (Écran 61 · Suivi › Rencontres) : js/interventions.js:141 : pasEncoreCree du vocabulaire « rencontres » vaut « Cette rencontre n'est pas encore créée. » ; l. 874 : fermerFicheIntervention le passe comme titre à uiDialogues.quitterCreationSiConfirme (js/ui-dialogues.js:451-459)
- **7.85** (Écran 61 · Suivi › Rencontres) : js/modes.js:774-781 et 1750 : sur un service, l'appartenance des élèves se conclut sur le coursId, donc les listes communes rendent les élèves du service ; js/profil-etudiant-sections-affichage.js, js/profil-etudiant-rapport.js et js/profil-etudiant-confidentiel.js n'ont aucune branche propre au service
- **7.86** (Écran 61 · Suivi › Rencontres) : js/profil-etudiant-sections-affichage.js:4437-4475 : naviguerVersNouvelleIntervention et naviguerVersIntervention appellent afficherSousSection('suivi-interventions') ; js/navigation.js:507-520 : afficherSousSection valide l'id contre configurationsOnglets complet, alors que seule la barre filtre l'onglet sur un service (l. 391-393)
- **7.87** (Écran 61 · Suivi › Rencontres) : js/rencontres.js:408 : le groupe-cours d'un service naît avec pratiqueId null ; js/indices.js:542-546 et 567-571 : sans pratique assignée rien n'est simulé et noteConstructible vaut false
- **7.93** (Écran 61 · Suivi › Rencontres) : js/interventions.js:1044 : le champ de durée s'intitule « Durée (périodes) : » ; l. 443-445 : le bouton « Guide RàI » de la liste ; l. 648-689 : les cartes « Patterns d'apprentissage » et « Niveaux RàI » de l'aperçu, sans branche qui les retire sur un service
- **7.97** (Écran 62 · Suivi › Animation) : index.html:8105 : sous le titre de l'Animation, « Outils pour animer la classe : questions flash, tirage au sort et équipes. »
- **7.99** (Écran 62 · Suivi › Animation) : js/boite-outils.js:274, 310, 320 et 405 : les prénoms et noms du tirage passent par echapperHtml ; l. 706, 735 et 909 : le texte des questions aussi
- **7.106** (Écran 62 · Suivi › Animation) : js/equipes.js:205-208 : sans étudiant·e retenu·e ni absent·e, le conteneur affiche « Aucun·e étudiant·e dans le groupe actif. »
- **8.4** (Écran 63 · Labo › Outils d'observation) : index.html:8895-8896 : « Ces trois seuils colorent les colonnes Assiduité, Complétion, Performance et Mobilisation de la liste des élèves, et qualifient l'engagement dans le profil. Ils ne touchent ni la note ni l'échelle IDME. »
- **8.6** (Écran 63 · Labo › Outils d'observation) : js/preferences-v2.js:160-167 : en démo, le sélecteur prend l'id de la grille résolue par diagnostiquerGrilleReferenceDepistage, donc l'option « Grille enregistrée, introuvable dans ce trimestre » (l. 173) n'est pas ajoutée quand une grille du pack est résolue
- **8.7** (Écran 63 · Labo › Outils d'observation) : index.html:8761-8767 et 8887-8893 : « Paramètres d'analyse » et « Seuils d'interprétation » sont des .sous-titre-bloc toujours visibles, suivis de leurs champs, sans repli
- **8.14** (Écran 63 · Labo › Outils d'observation) : js/preferences-v2.js:190-193 : le champ lit seuilsInterpretation.nombreProductionsAnalyse ; js/interpretation-config.js:38 : défaut 3 ; l'ancienne préférence fenetrePatterns n'est plus lue nulle part (seulement citée en commentaire, preferences-v2.js:182 et preferences.js:281)
- **8.16** (Écran 63 · Labo › Outils d'observation) : js/profil-etudiant-calculs.js:1151 : le suivi des fondations lit obtenirNombreProductionsPourPatterns ; js/profil-etudiant-sections-affichage.js:2184 : les flèches par critère aussi ; js/tableau-bord-apercu.js:3054-3062 : la ligne de fiabilité « sur N » du Suivi du groupe prend la même fenêtre
- **8.22** (Écran 63 · Labo › Outils d'observation) : js/contexte-qualification.js:110-116 : les trois seuils sont lus à chaque appel ; l. 217-230 : obtenirCouleurSelonSeuils colore les indices de la liste (js/etudiants.js:265, 309, 338, 1545) ; l. 124-190 : interpreterAssiduite et interpreterCompletion qualifient A et C
- **8.25** (Écran 63 · Labo › Outils d'observation) : js/preferences.js:596-598 : badgeNoteDifferee rend « note différée » avec le titre « Note différée : la rétroaction passe d'abord. Réglage dans Labo › Outils d'observation. »
- **8.27** (Écran 63 · Labo › Outils d'observation) : js/travaux-outils.js:1442-1443 et 1471 : la palette saute la catégorie « comprehension » quand la préférence afficherDescriptionsSOLO vaut false ; js/preferences-v2.js:312 et 341-345 : la case v2-pref-solo écrit cette préférence et rafraîchit la palette
- **8.29** (Écran 63 · Labo › Outils d'observation) : js/liste-evaluations.js:1419-1422 (liste), js/profil-etudiant-sections-affichage.js:775, 829, 2871-2872, 2998-3009 et 3600 (profil et panneau Portfolio) : quand noteDiffereeActive() est vrai, la note chiffrée est remplacée par badgeNoteDifferee()
- **8.31** (Écran 63 · Labo › Outils d'observation) : js/graphiques-progression.js:1817-1840 : pluginEtiquettesZones trace des lignes pointillées aux bornes des zones tirées de l'échelle de l'utilisateur (zonesPourChart) ; l. 2382 et 4065 : ces tracés suivent la préférence afficherSeuilsVisuels
- **8.32** (Écran 64 · Labo › Suivi longitudinal) : js/registre-longitudinal.js:74 : le registre vit dans la clé globale registreLongitudinal ; index.html:1162-1164 : la garde CSS du mode archive exempte les champs .rl-champ, posés sur les champs du registre (registre-longitudinal.js:824), et ses boutons ne portent ni .btn-ajouter ni .btn-supprimer (l. 865)
- **8.37** (Écran 64 · Labo › Suivi longitudinal) : js/registre-longitudinal.js:225 : les trimestres répertoriés excluent « demo » ; l. 248-261 : elevesDeTousLesTrimestres regroupe par DA (Map), un même DA vu dans deux trimestres donne une seule entrée à deux présences
- **8.38** (Écran 64 · Labo › Suivi longitudinal) : js/registre-longitudinal.js:1010-1014 : après un ajout réussi, daSaisie passe au DA de l'élève inscrit suivant ; l. 1007-1008 : le cours et le trimestre sont gardés
- **8.45** (Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques)) : js/pratiques/construction-attributs.js:50-57 : PARAMETRES déclare objet, révisabilité, agentivité, communication, granularité, détermination ; l. 474-483 : extraire range chaque ligne sous l'un d'eux ; js/comparateur-pratiques.js:368-389 et 414-426 : le tableau rend un en-tête par paramètre puis ses lignes
- **8.46** (Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques)) : js/pratiques/construction-attributs.js:91 et 394-397 : agentivité « Non couvert par l'application » ; l. 419 : « Niveaux de la note du cours » non couvert ; l. 197-200 et 368-369 : « Alignement sur des cibles d'apprentissage » non couvert hors dénotation ; l. 401 et 412 : lignes « Ce à quoi la note se rapporte » et « Temporalité de la note »
- **8.47** (Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques)) : js/portfolio.js:309-311 : arrondirIndiceSurCent arrondit d'abord au millionième puis à l'entier, donc 57,5 donne 58 ; l. 580-582 : la simulation lue par le Comparateur (simulerIndices, js/comparateur-pratiques.js:334-337) l'emploie
- **8.48** (Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques)) : js/pratiques/construction-attributs.js:260-262 et 287 : « remplacement » et « plafonnement » sont dans REGLES_RETIREES, filtrées de _clesRegles, et n'ont plus d'entrée « Actif »
- **8.49** (Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques)) : js/pratiques/construction-attributs.js:136-141 : pour une sélection « derniers » (alias de « recents »), la ligne Reprises vaut « Récence (dernier essai retenu) »
- **8.50** (Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiques)) : js/pratiques/construction-attributs.js:402-411 : en dénotation, lignes Échelle de performance et Grille de critères ; l. 425-427 : Note finale « Jugement saisi, gardé par l'atteinte des cibles (RREC 60/59) » ; js/comparateur-pratiques.js:444-447 : la cellule de note d'une colonne DEN dit « jugement », sans simulation
- **9.4** (Introduction de la partie) : js/reserve.js:523-531 : _formaterTaille rend « 1,08 Go », « 80,0 Ko » (toFixed puis replace('.', ','))
- **9.5** (Introduction de la partie) : js/import-export.js:728 (assainirImportJson) et :447 (balises retirées à l'import) ; affichage échappé : js/grilles.js:2263, js/pratiques-gestion.js:357, js/tampons-bibliotheque.js:341, js/partage-section.js:653, js/reserve-reglages.js:286-290, js/reserve-ouvrir.js:933
- **9.52** (Écran 72 · Réglages › Données › « Ouvrir une archive… ») : js/reserve-ouvrir.js:97 : « Le fichier choisi n'est pas un ZIP valide. » ; :88-95 et :103-107 : un nom suspect est refusé par validerZipSecurite
- **9.53** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:3662-3676 et :1536-1553 (fusionnerCopiesImportees), :1773-1828 (_ajouterCopiesImportees)
- **9.54** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:1625-1653 (fusionnerDonneesPersoImportees), appelée :3498-3506, :3523-3530, :3557-3563, :3701-3708
- **9.55** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:1735-1754 (ecarterElevesDesinscrits) appliquée :3498, :3523, :3557, :3668, :3701 ; trace écrite par js/trimestre-v2-etudiants.js:1120-1136
- **9.56** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:1306-1318 (_sansLeDemoDuFichier) appliquée :1462, :1504, :2013 avant l'aperçu
- **9.57** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:166-232 (fusionnerParIdentite), :3247-3253 (grilles de même nom), :3289-3296 (échelles), :3359-3364 (cartouches), :3404 (pratiques par id), :3449 (productions par nom), :1625 (données personnelles)
- **9.58** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:2624 (aperçu en dates via compterDatesPresences), :3531-3536 (bilan : dates des seules fiches entrées), :1675-1680 et :3742-3743 (ligne des élèves écartés)
- **9.59** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:1846-1912 (_restaurerBlobsDepuisZip : compte idsManquants, pose blobStatut 'manquant') et :3679-3690 (une seule ligne au bilan)
- **9.62** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:1343-1382 (_ressourcesDesTrimestresSurLesClesNues), appliquée :2459 (aperçu) et :3152 (import) ; écriture par cle() :3271, :3313, :3341, :3411
- **9.63** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:3255-3258 et :3341 (cartouches sous cle('cartouches_' + nouvel id de grille)), :3346-3347 (grilleId et echelleId rebranchés)
- **9.64** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:3359-3364 : fusionnerParIdentite avec CHAMPS_POSES_PAR_L_IMPORT (:240)
- **9.65** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:1068-1080 (calcul_note.methode), :1175-1188 (regles de production), :1214 (description de cartouche, 2000 car.), :508-515 (nombreImporte : « 40 » devient 40)
- **9.66** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:1306-1318 (clés demo_* retirées) et :1352-1355 (seuls les préfixes [aeh] + année sont repliés)
- **9.67** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/main.js:708-745 : la migration S5 des cartouches ne tourne qu'une fois (drapeau migration_cartouches_namespacees_done) ; js/import-export.js:3359 ne touche que la clé cible
- **9.68** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : js/import-export.js:3376 : « ${nbDejaPresentes} cartouche(s) déjà présente(s) à l'identique, non ajoutée(s) »
- **9.69** (Écran 73 · Réglages › Données › carte « Ouverture et partage ») : index.html:9388 : <h3 class="carte-titre-bleu">Ouverture et partage</h3>
- **9.72** (Écran 74 · Réglages › Données › « Partage entre collègues » et « Packages importés ») : js/import-export.js:3247-3253 : une grille de même nom n'est rattachée (remapGrilles) que si memesIdentifiantsElements(g, memeNom, 'criteres', 'id') ; js/partage-section.js:221-240 : une grille d'un .lcz dupliquée est copiée entière, jamais rattachée par nom
- **9.73** (Écran 74 · Réglages › Données › « Partage entre collègues » et « Packages importés ») : js/partage-validation.js:573-589 : auteur « Demo Labo Codex » (partage-schemas.js:48) ou id du pack démo : erreur USURPATION_DEMO et rejet ; appelée par js/partage-import.js:683
- **9.74** (Écran 74 · Réglages › Données › « Partage entre collègues » et « Packages importés ») : js/partage-import.js:332-362 (oublierEntites : l'entrée du registre ne survit que s'il lui reste une entité) appelée par js/partage-section.js:419-421
- **9.77** (Écran 75 · Réglages › Captures et recherche) : js/snapshots.js:860-878 : la reconstruction vide les seules captures hebdomadaires et garde avant.interventions tel quel
- **9.81** (Écran 75 · Réglages › Captures et recherche) : js/trimestres.js:2250 : description 'Indices calculés par Labo Codex' ; :2252 : indice_A 'assiduité : périodes présentes ÷ périodes offertes, cumulées depuis le début du trimestre (%)'
- **9.82** (Écran 75 · Réglages › Captures et recherche) : js/trimestres.js:2136 : niveau_solo: (c.niveauSOLO || 'multistructurel') ; :2167 pour les niveaux d'échelle
- **9.83** (Écran 75 · Réglages › Captures et recherche) : js/trimestres.js:2301-2307 (profilsRLO seulement si activerActionsRLO === true) et :2466-2520 (gestes_cognitifs : reperage, liaison, ouverture)
- **9.84** (Écran 75 · Réglages › Captures et recherche) : js/trimestres.js:1944-1956 : dasElevesSupprimes() puis filtre des évaluations, présences et snapshots
- **9.85** (Écran 75 · Réglages › Captures et recherche) : js/trimestres.js:2309-2318 : l'export est calculé au clic et téléchargé (Blob, lien .click()), rien n'en est gardé ; seule la table de correspondance est stockée (:2321-2328)
- **9.86** (Écran 75 · Réglages › Captures et recherche) : js/snapshots.js:343-385 : les dates capturées viennent de obtenirSeancesCompletes() du groupe-cours actif (horaire.js:730), pas du calendrier partagé
- **9.94** (Écran 79 · Réglages › À propos) : index.html:9855-9872 (onglet À propos, index.html:9740) : carte « Sources et remerciements », ligne « Laissons-les se tromper », Cégep André-Laurendeau, rapport de recherche PAREA, 2026, lien eduq.info
- **9.100** (Écran 80 · Mode anonymisation (transversal)) : js/modes.js:286 (doitRegenerer déclaré, fin du ReferenceError) et :343-375 (mapping « Élève N » créé quand le trimestre n'en a pas)
- **A.2** (Notés par l'analyste « entrée et codex ») : index.html:9388 : titre de carte « Ouverture et partage »
- **A.4** (Notés par l'analyste « entrée et codex ») : js/import-export.js:1735-1754 et :3498, :3523, :3557, :3668, :3701 ; trace : js/trimestre-v2-etudiants.js:1120-1136
- **A.11** (Notés par l'analyste « entrée et codex ») : js/travaux-import.js:100 (motif DEMO###) et :300-306 (essayé en mode démo seulement)
- **A.12** (Notés par l'analyste « entrée et codex ») : js/profil-etudiant-helpers.js:779-786 (en démo, la grille du pack sert au dépistage) ; js/evaluation-sauvegarde.js:170-177 (T5 : enregistrer une évaluation dans la démo n'est pas refusé)
- **A.15** (Notés par l'analyste « Cadre ») : js/main.js:1131-1138 : initialiserModuleSaisiePresences passe par window.auDbPret (db.js:2240)
- **A.16** (Notés par l'analyste « Cadre ») : js/import-export.js:1675-1680 (ligneElevesEcartes) et :3742-3743
- **A.18** (Notés par l'analyste « Cadre ») : js/tableau-bord-apercu.js:1617 (TEXTE_A_SANS_PERIODES), :1626-1629, :1738-1740, :1884
- **A.19** (Notés par l'analyste « Conception I ») : js/cartouches.js:3409-3411 (« Paliers (bornes en %) » pour une grille analytique), :3520-3525 (échelle ECHELLE_IDME_DEPART préremplie), :3393-3399 et :681, :708 (colonnes titrées « 65–74,99 % »)
- **A.21** (Notés par l'analyste « Conception I ») : js/bibliotheque-ui.js:1326-1340 (conduireAuxImportes) et :1280-1305 (pointerVersItems : défilement et classe biblio-carte--pointee 2,2 s) ; appelée par grilles.js:2076, echelles.js:1043, cartouches.js:2100, pratiques-gestion.js:2537, productions-import-export.js:343
- **A.25** (Notés par l'analyste « Conception I ») : js/synthese-retroaction-rendu.js:500-540 (« Commentaires ciblés (tampons) ») ; js/synthese-retroaction-data.js:620-640
- **A.27** (Notés par l'analyste « Conception II ») : js/evaluation-chargement.js:694-696 (_cartoucheModelePourLaCopie) et :748-756 ; js/evaluation.js:1382 (cartouche de l'évaluation posée)
- **A.28** (Notés par l'analyste « Conception II ») : js/evaluation-chargement.js:1586-1594 : confirmerAction « Remplacer les commentaires de cette copie par ceux de la cartouche … ? »
- **A.30** (Notés par l'analyste « Conception II ») : js/evaluation-retroaction.js:175-188 et js/synthese-retroaction-data.js:483-493 (commentaireDuCritere : l'enregistré d'abord)
- **A.31** (Notés par l'analyste « Conception II ») : js/synthese-retroaction-rendu.js:293-296 : les cellules vides du ruban (dont CONTEXTE) ne s'affichent pas ; js/export-pdf.js:2056-2058
- **A.33** (Notés par l'analyste « Conception II ») : js/modal-doublon.js:103-117 (bouton « Remplacer l'existante ») et :274-293 ; utilisé par echelles.js:3544-3570 et grilles.js:684-710
- **A.35** (Notés par l'analyste « Conception II ») : js/profil-etudiant-sections-affichage.js:1883-1887 (leçon de la carte à la date de l'absence) et :635 (badge-absence-lecon)
- **A.37** (Notés par l'analyste « Conception II ») : js/import-export.js:3341 (cle('cartouches_' + grille rebranchée)), :3346 (grilleId rebranché), :3359-3364 (fusion sans doublon)
- **A.38** (Notés par l'analyste « Conception II ») : js/import-export.js:3376
- **A.40** (Notés par l'analyste « Conception II ») : js/reserve-ouvrir.js:1143-1144 (archive rouverte), js/import-export.js:3462 (import sélectif) et :3058 (configuration complète)
- **A.41** (Notés par l'analyste « Évaluation ») : js/evaluation-projection.js:84 (JETON_SERVICE = '{service}') et :562-580 (remplacé par le nom du service, ou retiré selon sa place)
- **A.42** (Notés par l'analyste « Évaluation ») : js/echelles.js:3025-3033 : supprimerNiveauEchelle propose le codex quand le niveau est employé par une évaluation ; js/grilles.js:521 pour un critère
- **A.43** (Notés par l'analyste « Évaluation ») : js/grilles.js:3398-3448 (motsAvisCriteresSansType, rendreAvisCriteresSansType, appliquerTypeGrilleAuxCriteresSansType), appelée :3365
- **A.44** (Notés par l'analyste « Évaluation ») : js/profil-etudiant-sections-affichage.js:4003-4016, appelée :1173, :3139, :3209
- **A.49** (Notés par l'analyste « Évaluation ») : js/codex.js:42 (LISTES_DE_FICHIERS inclut corbeilleFichiers) et :494-495
- **A.50** (Notés par l'analyste « Évaluation ») : js/codex.js:1210-1219 (construireAvertissementCopiesManquantes) et :3465-3483 (fenêtre avant écriture)
- **A.51** (Notés par l'analyste « Évaluation ») : js/import-export.js:1735-1754 et ses cinq appels :3498-3701
- **A.54** (Notés par l'analyste « Suivi I ») : js/profil-etudiant-calculs.js:2104-2112 : determinerCibleIntervention lit fiche.statut === 'décrochage' et rend la cible « Décrochage »
- **A.55** (Notés par l'analyste « Suivi I ») : js/profil-etudiant-sections-affichage.js:3360-3363 et :4098-4101 (sections vides si la préférence est fausse) ; cases index.html:8722 et :8852, lues par preferences-v2.js:326-330
- **A.57** (Notés par l'analyste « Suivi I ») : styles.css:329 (--section-suivi: #56cadc, « cyan ») et :1791-1792, :24638-24639
- **A.59** (Notés par l'analyste « Suivi II ») : js/grilles.js:4117-4166 (éditeur des paliers : nom, seuil, Verdict, Recommandation) ; js/evaluation-projection.js:368-373 (Nom du service d'aide) et :284 (« Il est recommandé de t'inscrire au {service}. »)
- **A.60** (Notés par l'analyste « Suivi II ») : js/grilles.js:4161-4165 : case « Ce palier lève un signalement » ; js/evaluation-projection.js:375-388 (libelleSignalement)
- **A.61** (Notés par l'analyste « Suivi II ») : js/tableau-bord-apercu.js:1428-1490 (genererInterpretationSuiviFondamentaux) et :2539-2557
- **A.63** (Notés par l'analyste « Suivi II ») : js/profil-etudiant-sections-affichage.js:2627 et js/main.js:125-127
- **A.65** (Notés par l'analyste « Suivi II ») : index.html:7296 : <label>2. Cours ou service</label>
- **A.67** (Notés par l'analyste « Suivi II ») : js/reserve.js:81-99 (presences, interventions, indicesAssiduite filtrés par DA) et :225-260 (_filtrerParDA)
- **A.68** (Notés par l'analyste « Suivi II ») : js/reserve.js:227-238 : la rencontre est copiée entière (Object.assign), seuls etudiants, notesIndividuelles et snapshotAvant sont réduits au groupe
- **A.69** (Notés par l'analyste « Suivi II ») : js/trimestres.js:2136
- **A.71** (Notés par l'analyste « Suivi II ») : js/travaux-outils.js:1437-1471 (catégories action et comprehension masquées selon activerActionsRLO et afficherDescriptionsSOLO) ; cases index.html:8711 et :8733 dans Outils d'observation (:8678)
- **A.74** (Notés par l'analyste « Labo et Réglages ») : js/codex.js:1213 et :3469-3477
- **A.75** (Notés par l'analyste « Labo et Réglages ») : js/codex.js:1130-1200 (construireBilanImport, titre « Codex ouvert, mais incomplet ») et :3294-3298
- **A.78** (Notés par l'analyste « Labo et Réglages ») : js/travaux-ui.js:1288 (bouton d'aide data-aide="archiver-travaux") → js/accompagnement-contenu-popup.js:510-531 ; carte d'aide index.html:11699-11721
- **A.80** (Notés par l'analyste « Labo et Réglages ») : js/pratiques-gestion.js:385-407 (bannière et bouton « Gérer mes maquettes ») ; js/config.js:118 (COMPARATEUR_VISIBLE = true)

## Annexe B : consigne du tri

La consigne commune des onze agents est archivée dans `archive/consignes/tri-prevu-pas-fait-CONSIGNE.md`. Les verdicts complets (710 objets JSON, avec explications et recherches) sont dans `archive/tri-prevu-pas-fait/`.
