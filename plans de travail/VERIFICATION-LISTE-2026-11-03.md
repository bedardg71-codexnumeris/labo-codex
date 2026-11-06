# Vérification de la liste des fiches, 3 nov. 2026

Demandée par Grégoire le 3 nov. à 7 h 06 : avant de choisir les prochaines tâches, vérifier que la liste de la page du tri est encore valide. Faite par Cowork en lecture seule, sur une copie du dépôt à `af6e1c73` (2 nov. au soir), par huit agents en parallèle ; trois verdicts recontrôlés à la main (#1069, #1070, #1113), conformes.

Verdicts : **VRAIE** (le défaut est toujours dans le code), **PARTIELLE**, **RÉGLÉE**, **PÉRIMÉE** (l'écran ou la décision a changé), **À L'ÉCRAN** (le code ne suffit pas à trancher). « Boucle ? » : le correctif peut-il passer par `BOUCLE-SANS-RELAIS.md` (§ 3).

## Le résultat

**Les 114 fiches de la page du tri** : 63 vraies, 35 partielles, 3 réglées, 6 périmées, 7 à l'écran. La liste tient : 98 sur 114 restent à faire en tout ou en partie. Les dix fiches « Partie N » de l'audit d'octobre portent à elles seules 98 écarts, dont 86 restent.

**Les 51 fiches inscrites depuis le 22 oct., jamais classées** : 33 vraies, 5 partielles, 11 réglées (cases à cocher au `BACKLOG.md`), 1 périmée, 1 à l'écran.

Fiches à fermer (réglées ou périmées) : #1069, #1072, #478 ; #843, #454, #543, #692, #307, #487 ; #1154, #1155, #1156, #1157, #1158, #1159, #1169, #1182, #1184, #1186, #1217 ; #1202.

Doublons repérés : #1077 et #1019 (le même magasin `fichiers` non vidé à la suppression d'un trimestre) ; #833 et #1114 ; #813, #595 et #1050 (les couleurs indéfinies).

Une contradiction à soumettre à Grégoire : #1077 et #1019 ont été tranchées le 15 oct. (effacer les fichiers d'un trimestre supprimé), ce qui heurte sa limite du 20 sept. (aucun effacement irréversible).

## Audit d'observation, parties 1 à 5 (#1077 à #1081)

| Fiche | Verdict | Preuve | Ce qui reste | Boucle ? | Décision de Grégoire ? |
|---|---|---|---|---|---|
| #1077 | VRAIE | supprimerTrimestre n'efface pas le magasin fichiers (même défaut que #1019) | tarir la source ; nettoyage du stock | non (effacer) | tranchée le 15 oct. mais heurte sa limite du 20 sept. : à reconfirmer |
| #1078 | PARTIELLE | 2 écarts sur 10 réglés ou périmés | 8 restent : « Aucun codex actif » avant stockage prêt ; « Non enregistré » ; versions sans Nouveautés ; historique non daté ; titre soutien bleu ; deux niveaux d'abonnement ; note différée absente de l'Aide | oui | oui pour Nouveautés, soutien, Aide (mots) |
| #1079 | VRAIE | 10 écarts sur 10 restent (Cadre) | Dupliquer ; Fermer au formulaire ; éditeurs pas masqués au changement de trimestre ; semaine ; trimestre clos en lecture ; infobulle ; colonne CAF ; auteur « Inconnu » | oui sauf 2 (formats) | non |
| #1080 | PARTIELLE | 7 écarts sur 8 restent (Conception) | échec de duplication muet ; éditeurs qui survivent au changement de trimestre ; aide SOLO ; recalcul après correction d'échelle ; trimestre terminé non archivé | oui sauf 3.114 (notes) | oui pour 3.114 |
| #1081 | PARTIELLE | 19 écarts sur 21 restent (rétroactions, pratiques, carte, bibliothèques, partage) | voir rapport : introuvable, Fermer, mots, cibles de 28 px, refus sans nom, partage non listé, PDF sommative, recalcul, crédit Voisard (peut-être périmé : noms retirés le 2 sept.) | oui sauf 4.36 (PDF élève), 4.45 (notes) | oui pour 4.36, 4.45, 4.49 |

Compte g1a : écarts 43 vrais / 50, 2 partiels, 2 réglés, 3 périmés. Doutes : 4.33, 1.149, 4.26, 3.114, #1077 (contradiction avec sa limite du 20 sept.).

## Audit d'observation, parties 5 à 8 et annexe (#1082 à #1086)

| Fiche | Verdict | Preuve | Ce qui reste | Boucle ? | Décision de Grégoire ? |
|---|---|---|---|---|---|
| #1082 | PARTIELLE | banque d'évaluations retirée (8a79d7d2) ; 5.208 périmée | 16 sur 18 restent (Évaluation : filtre au masculin, « Fichier sous » partout, Annoter au menu, jeton sur fichier sans élève, chrono, jeton de délai muet, point médian…) ; 2 textes du PDF de l'élève | oui pour 14 ; non pour les 2 textes du PDF | oui pour les 2 textes du PDF |
| #1083 | PARTIELLE | 6.65 réglée (16dea020) ; code mort parti | 8 sur 9 restent (Suivi, profils, présences) | oui pour 6 ; non pour 6.100 et 6.37 | oui pour ce que la note différée doit cacher |
| #1084 | PARTIELLE | 7.49 sans objet | 8 sur 9 restent (dépistage, interventions, rencontres : « Progression lente », cause Décrochage non lue, gabarit EUF, report des présences, carte RàI sur un service, rendez-vous manqué, calendrier) | oui pour 4 ; non pour 3 (présences, dépistage) | oui pour rendez-vous manqué dans A et gabarit EUF |
| #1085 | VRAIE | 9 sur 9 inchangés (Labo › Outils d'observation : mise en page des réglages, aides) | 9 | oui | non |
| #1086 | PARTIELLE | A.58 sans objet | 2 sur 3 : export cellule vide sans pratique ; aide attachée à la date | non (export) ; oui (aide) | non |

Compte g1b : 43 écarts sur 48 restent. Doutes : 7.49, A.58, 6.37, 7.37, 8.24 et export recherche (le code paraît plus juste que l'intention).

## Cadre, trimestres, cours, codex, imports et exports

| Fiche | Verdict | Preuve | Ce qui reste | Boucle ? | Décision de Grégoire ? |
|---|---|---|---|---|---|
| #1067 | VRAIE | formulaire neuf vide la pratique (trimestre-v2-groupes-cours.js:553) ; C additionne des null → 0 ; P sans noteConstructible | SOM par défaut ; tiret au lieu de « moy=0 % » ; 0 % sur note non constructible | oui | non |
| #1065 | VRAIE | confirmation ne nomme que l'horaire (trimestre-v2-horaires.js:1016) | nommer les groupes-cours touchés ; horaireId orphelins restent | oui (nommer) | non |
| #1063 | VRAIE | infoCours réécrit sans _groupeCoursId ; intervention estampillée par l'id du cours | source et stock | source oui ; stock non | stock : oui |
| #1026 | VRAIE | vignettes « non refaites » (reserve-emprunter.js:38) | refaire à l'affichage | oui (supposé) | non |
| #1019 | VRAIE | supprimerTrimestre ne vide pas le magasin fichiers | source ; fichiers orphelins | non (effacer ; db.js) | oui |
| #1004 | À L'ÉCRAN | code inchangé | regarder dans Chrome si index.html vient du cache | – | – |
| #996 | À L'ÉCRAN | partage envoie toujours le File entier | mesurer la mémoire sur iPad | – | – |
| #843 | PÉRIMÉE | décision « tel quel » du 12 sept. | rien | – | – |
| #844 | VRAIE | capture vide = motif de refus de supprimer un cours | voie a (ne plus compter) ou b (emporter) | a oui / b non | oui |
| #848 | VRAIE | option A arbitrée le 12 sept., non appliquée | menu Cours ; phrase des éléments obligatoires | oui | non |
| #340 | À L'ÉCRAN | bascule ne vide pas les écritures en attente | reproduire | – | – |
| #346 | PARTIELLE | outil de réparation livré | fiches de cours en double dans ses données | non (données) | oui |
| #454 | PÉRIMÉE | vecteur fermé (1.87.4) ; #831 a recréé les grilles | rien (déduit) | – | – |
| #453 | PARTIELLE | source réglée (1.87.4) | rendre aux artefacts A25/H26 leurs références | non (données) | oui |
| #47 | VRAIE | aucun chiffrement | toute la fonction | non (format codex) | oui |
| #615 | VRAIE | « Renommer pour distinguer » toujours là | retrait + mineurs | non (retirer) | non (tranché) |
| #177 | PARTIELLE | découpage Léa présent | choisir un dossier entier dans Travaux | oui | non |
| #1096 | VRAIE | rebranchement grille absent des imports | correctif | non (import-export.js) | non |
| #1060 | VRAIE | table de correspondance en clair | après réponse Loi 25 | non | oui |
| #1061 | VRAIE | export lit une clé que personne n'écrit | correctif | non (format) | non |
| #584 | VRAIE | échelles exportées sans repères | repères + version_format 1.4 | non (format) | non |

Compte g2 : 13 VRAIE, 3 PARTIELLE, 2 PÉRIMÉE, 3 À L'ÉCRAN, 0 RÉGLÉE. Doutes : #454, #453 (peut-être sans objet : A25/H26 non rouverts), #1004, #346.

## Grilles, Apporter mon matériel, PDF de la grille, échelles

| Fiche | Verdict | Preuve | Ce qui reste | Boucle ? | Décision de Grégoire ? |
|---|---|---|---|---|---|
| #1097 | VRAIE | materiel-lecture.js:85 ne lit que la 1re table | lire toutes les tables | oui | non |
| #1098 | VRAIE | aucune étiquette pour la ligne de calcul de la langue | tout ; « À classer » parti, la ligne s'étiquette « À ignorer » | non (calcul) | oui |
| #1102 | PARTIELLE | réglé à la source (b677b6d5) | grilles en points du 18-22 oct. relues en ordre croissant (bareme.js:140) | non (données) | oui (s'il en a) |
| #1103 | VRAIE | grille mixte compte en % (gabarits-utils.js:94) | trancher le sens du total | non (sens du total) | oui |
| #1104 | VRAIE | grilles.js:832, :1356 inchangés | affichage ; contredit l'avertissement de #483 | oui | non |
| #1105 | VRAIE | plageValide ne vérifie que min ≤ max | borner à la saisie | oui | non |
| #1106 | VRAIE | deux « Total » : seul le dernier compte | tout | oui | non |
| #1107 | VRAIE | raisons qui comptent sans nommer | nommer les critères (4 raisons) | oui | non |
| #1108 | VRAIE | wizard-pratique-v2.js:1745 porte encore poids: 25 | source ; stock à compter | source oui ; stock non | stock : oui |
| #1109 | VRAIE | aucune lecture de facteur | tout, après sa décision | non (calcul) | oui |
| #1126 | VRAIE | gabarit grilles.js:3540 inchangé ; règle seulement ≤1180 px | tout | oui | non |
| #1128 | VRAIE | anciens chemins PDF sans appelant | retirer | non (retirer des fonctions – code mort) | non |
| #1129 | VRAIE | colonne 0 en gras (export-pdf.js:2818) | tout | oui | non |
| #479 | VRAIE | echelles-bibliotheque.js:325 cherche *_echelles au lieu de *_echellesTemplates | reprendre la façon des grilles | non (import de données) | non |
| #545 | À L'ÉCRAN | enquête, rien depuis 10 oct. | regarder dans sa base | – | – |
| #543 | PÉRIMÉE | depuis #1173 (27 oct.), copie verrouillée affiche sa note remise | rien | – | – |

Compte g3a : 13 VRAIE, 1 PARTIELLE, 1 PÉRIMÉE, 1 À L'ÉCRAN. Doutes : #543, #545, #1098 (peut-être périmée), #1104 (contredit #483).

## Pratiques, productions, cartouches, partage, comparateur

| Fiche | Verdict | Preuve | Ce qui reste | Boucle ? | Décision de Grégoire ? |
|---|---|---|---|---|---|
| #1066 | VRAIE | une pratique retirée disparaît des deux colonnes de la bibliothèque | la lister, comme les productions | oui | non |
| #1057 | VRAIE | supprimer une pratique ne regarde pas les groupes-cours qui l'emploient | prévenir ou refuser avant | oui | non |
| #1056 | VRAIE | en mode « un seul groupe », la date d'échéance se perd | lire l'entrée du groupe | oui (source) | stock : oui |
| #1059 | VRAIE | import de cartouches non enregistré ; niveau vide avalé | enregistrer, corriger le prétraitement | non (mots des élèves) | non |
| #1069 | RÉGLÉE | e3f42ec4, 24 oct. | – | – | – |
| #629 | PARTIELLE | 3 points faits | double registre, notes de séance perdues à la copie, garde muette | non (purge) | oui (purge) |
| #484 | VRAIE | assistant de pratique : deux portes à l'étape 2 | les remonter | oui | non |
| #692 | PÉRIMÉE | la bibliothèque filtre déjà la démo | écart voisin : l'assistant offre les modèles démo hors démo | – | – |
| #1110 | VRAIE | refus seulement pour une grille | refuser avant pour cartouche et production | non (partage) | oui (mots du refus) |
| #1090 | VRAIE | une grille partagée part sans son échelle | l'emporter | non (format) | non |
| #1091 | PARTIELLE | saisie bornée dans Apporter mon matériel | départ et codex non bornés | non (format) | non |
| #1072 | RÉGLÉE | 6c954d61, 29 oct. | un commentaire | – | – |
| #696 | VRAIE | rien ne dit « copie indépendante » | poser sa phrase | oui | non |
| #329 | À L'ÉCRAN | code du pilote de partage en place | ouvrir le pilote avec des collègues | – | oui (public) |
| #465 | PARTIELLE | 6 sous-points faits | jetons à trois endroits, échelle figée, échelle introuvable, cache, CO-23 | non (calcul) | oui (échelle introuvable) |
| #588 | PARTIELLE | sommative dite | Standards ne dit pas la règle des reprises | oui | non |
| #326 | PARTIELLE | banc refondu | « Outil en développement », Standards = 0 à revoir | non (calcul) | oui |
| #342 | À L'ÉCRAN | source tarie | lancer l'audit sur ses données | – | oui (données) |

Compte g3b : 8 VRAIE, 5 PARTIELLE, 2 RÉGLÉE, 1 PÉRIMÉE, 2 À L'ÉCRAN. Doutes : #692, #326, #465.

## Évaluation, suivi, profil, RàI, interventions, présences

| Fiche | Verdict | Preuve | Ce qui reste | Boucle ? | Décision de Grégoire ? |
|---|---|---|---|---|---|
| #1064 | VRAIE | Déverrouiller sans pivot renvoie à un enregistrement refusé ; liste-evaluations.js:2571 écrit verrouillee=false à l'ouverture | trois défauts | non (zone protégée, config.js) | non |
| #1062 | VRAIE | rattrapage écrit une fiche « facultatif » par élève → « Séance saisie », Confirmer caché | source + stock | non (présences enregistrées) | non |
| #1058 | PARTIELLE | réglé à la source (52d5faf3, 31 oct.) | doublons déjà écrits dans les annotations | non (données) | oui |
| #1054 | VRAIE | bilan-reflexif-csv.js appelle 3 noms jamais importés ; import-export-texte.js:755 idem | import CSV, démo, « Importer un questionnaire » | non (import) | non |
| #1088 | PARTIELLE | niveaux 2 et 3 réécrits (9e2be4b4, 30 oct.) | trois textes : non-participation, aide RàI, guide | oui | oui (ses mots) |
| #1112 | VRAIE | profil : retour anticipé si A, C, P nuls, sans regarder les interventions | tout | oui | non |
| #1133 | VRAIE | mode Catégories sans écran ; PDF exige erreurs | sort du mode ; ligne du PDF | non (PDF élève) | oui |
| #1113 | VRAIE | evaluation-retroaction.js:1265, 1327 non échappés | 2 sites + banc Vitest | oui | non |
| #707 | VRAIE | code inconnu rendu vide | table unique, repli au code brut | oui (repli) | non |
| #721 | PARTIELLE | invite retirée (8a5c2f3f) ; écrit encore {} à la lecture | tarir l'écriture ; effet visible : aucun (inférence) | oui (tarir) | non |
| #307 | PÉRIMÉE | Exploration des pratiques compare sur le groupe réel (#326) | accès depuis le profil seulement | – | – |
| #272 | VRAIE | pas de machine à états du chargement ; drapeaux globaux | refonte | non (navigation.js) | non |
| #349 | VRAIE | formulaire rempli puis verrouillé : flash « modifiable » | le flash | oui | non |
| #402 | PARTIELLE | tri réglé (#816) | « heures » à double sens, borne, ⌈jours/5⌉, fonction sans appelant | oui sauf « heures » | non |
| #245 | PARTIELLE | triangles RàI sur la courbe | delta P avant/après | oui | oui (didactique) |
| #269 | VRAIE | rythme.js sans export | tout (reportée 📦) | non (export) | non |
| #270 | VRAIE | aucun écouteur sur une ligne d'activité | tout (reportée 📦) | oui | non |
| #814 | VRAIE | journal : seul chemin de fermeture, ni voile ni Échap | cible 44 px, fermeture | oui | non |
| #869 | PARTIELLE | 1 fonction retirée (aaa37857) | 9 sur 10 sans appelant | oui | non |
| #870 | PARTIELLE | 3 classes définies depuis | 4 sur 7 restent ; effet à mesurer | oui | non |
| #1073 | VRAIE | export lit nom/titre au lieu de nomCours/codeCours | Cours toujours vide ; Groupe vide en mode cours | non (export) | non |

Compte g4 : 13 VRAIE, 7 PARTIELLE, 1 PÉRIMÉE. Doutes : #307, #721 (peut-être périmée), #870, #349 et #272 (à l'écran).

## Apparence, aide, rapport de bug, forge et tests

| Fiche | Verdict | Preuve | Ce qui reste | Boucle ? | Décision de Grégoire ? |
|---|---|---|---|---|---|
| #1050 | PARTIELLE | badge parti avec les anciennes cartes | --vert-principal indéfinie (4 usages) | oui | non |
| #813 | PARTIELLE | 77 usages sans repli (112 à l'inscription) | 77 | oui | non |
| #595 | PARTIELLE | arrondis livrés | 64 noms de couleurs à ramener à la palette | oui | non |
| #519 | PARTIELLE | C2, C3 réglés | C1 doc du design system ; C5 Supprimer rouge au milieu | oui | non |
| #283 | À L'ÉCRAN | Conception a quitté la barre latérale | Liste et Calendrier sur iPad portrait | – | – |
| #297 | VRAIE | 43 sélecteurs en double index.html/styles.css | 13 identiques à retirer, 30 à trancher | oui | non |
| #286 | PARTIELLE | lots A et C livrés | ≈150 glyphes ; lots B, D, E | oui | non |
| #879 | PARTIELLE | hauteur 44 px réglée | variantes de boutons mêlées | oui | non |
| #470 | PARTIELLE | cartouches ne se réécrivent plus | onglets rendus au démarrage | non (migrations) | non |
| #478 | RÉGLÉE | 5 frictions traitées | – | – | – |
| #481 | PARTIELLE | 3 points faits | marque de suppression qui grossit | oui (source) | non |
| #439 | VRAIE | 5 guides seulement | guides RREC et Enseignement explicite déjà rédigés | oui | oui (didactique) |
| #1070 | VRAIE | corbeille fixed + test offsetParent → jamais de suppression | retirer le test | oui | non |
| #1068 | VRAIE | « Copier » marque le rapport « envoyé » | distinguer copié/envoyé | oui | non |
| #799 | VRAIE | aucune page 404 | mesurer d'abord | oui | non |
| #812 | VRAIE | date UTC et heure locale mêlées | heure locale | oui | non |
| #859 | VRAIE | repère écrit deux fois | un seul chemin | oui | non |
| #833 | PARTIELLE | 4 essais sortis de la baseline | 28 intermittents ; recoupe #1114 | oui | non |
| #598 | PARTIELLE | volet A livré | volet B : balance globale en dur | oui | non |
| #487 | PÉRIMÉE | GitHub juge WebKit à chaque push | dette : 121 copies | – | – |
| #488 | PARTIELLE | a, b, c faits | d : contrôle automatique | oui | non |
| #589 | VRAIE | skill alignement : 3 questions « ouvertes » déjà tranchées | reporter les réponses | oui | non |
| #480 | VRAIE | corpus d'essai : pondération 1 partout | poids réaliste | oui | oui (poids de la terminale) |
| #1089 | VRAIE | crédit Icons8 seulement dans À propos | autocollants imprimés sans mention | oui | oui (licence) |
| #1111 | VRAIE | Vitest 2, esbuild 0.21 | monter | oui | non |
| #1114 | PARTIELLE | baseline Linux et juge en place | condition de bascule non remplie : 0 push conforme sur 3 ; un essai sans nom de bloc | oui | non |
| #1115 | VRAIE | spec attend ⌘Z | lire la plateforme | oui | non |
| #1116 | VRAIE | 7 des 9 essais materiel-* dans la baseline Linux | cause supposée | oui | non |

Compte g5 : 13 VRAIE, 12 PARTIELLE, 1 RÉGLÉE, 1 PÉRIMÉE, 1 À L'ÉCRAN.

## Les 51 fiches récentes, jamais classées (#1142 à #1217)

RÉGLÉES (11, cases à cocher) : #1154, #1155, #1156, #1157, #1158, #1159 (bibliothèque en deux colonnes, 1.219) ; #1169 (signalement voyage au partage) ; #1182 (fusion, 1.225.1 ; voyage des suppressions : plus tard, sa décision) ; #1184 (codex sans les archives, 1.226) ; #1186 (fusion montre ce qu'on choisit, 1.226) ; #1217 (doigt en Évaluer, 1.230.1).
PÉRIMÉE (1) : #1202.
À L'ÉCRAN (1) : #1194.
PARTIELLES (5) : #1142 L (stock des comptes d'erreurs : réparer, PDF à refaire – données, oui) ; #1146 I (2 suites d'étapes restent ; peut-être périmée) ; #1152 Q (porte de lecture, D6, 2 définitions) ; #1178 Q (hors lot : l'hybride) ; #1199 I (filtre par groupe-cours – calcul).
VRAIES (33) :
 Q boucle oui : #1162 (contraste des pastilles), #1167, #1171 (nommer le cours des productions), #1181 (témoin couvre la barre en démo), #1185 (témoin rouge après partage annulé), #1188 (mots), #1192 (« 5 points »), #1197 (échappement), #1205 (colonne RàI), #1208 (accord du verbe)
 Q hors boucle : #1168 (« --- Langue --- » : mots des élèves, oui), #1187 (mots du minimum, oui), #1200 (seuil 60 dans PDF élève, oui), #1204 (bilan élève)
 Q/L : #1196 (présents : source boucle oui ; stock : oui)
 I boucle oui : #1206 (aligner lecteurs de la note, règle aussi #1203), #1166 (source)
 I hors boucle : #1163, #1164, #1165 (gestes « garder dans ma bibliothèque » / lien), #1183 (palette à la fusion, codex), #1190 (codes en dur, sens), #1193 (seuils 60/80, oui pour 80), #1195 (défis ancien trimestre), #1198 (jaune sans maîtrise, oui)
 L : #1160, #1161 (boucle oui, petits filtres répétés), #1189 (séparateur « → », boucle oui) ; #1170 (changer le cours d'un élève, oui), #1176 (non recevable à la création, oui), #1211 (copies de démo, oui)
 #1203 : sa décision du 30 oct. = attendre un cas vécu.

