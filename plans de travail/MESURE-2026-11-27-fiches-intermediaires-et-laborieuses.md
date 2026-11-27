# Fiches I et L du « Tri du chantier Labo Codex », mesurées contre le dépôt

Source : page d'artefact du 16 nov. 2026 (tableau FICHES, lu en entier), dépôt en 1.259.0, branche de travail `lot/file-sans-gregoire-2026-11-27` lue telle quelle, le 27 nov. 2026. Lecture seule.

## Comptes

- Palier I, non livrées : 95, dont 12 attendent Grégoire et 83 mesurées ici : A 10 · B 7 · C 13 · D 44 · E 9
- Palier L, non livrées : 85, dont 6 attendent Grégoire et 79 mesurées ici : A 9 · B 4 · C 7 · D 49 · E 10
- Ensemble (162 mesurées) : A 19 · B 11 · C 20 · D 93 · E 19

Catégories : **A** déjà réglée ou close ; **B** ouverte, technique, sans navigateur ni décision ; **C** ouverte, demande un navigateur ; **D** ouverte, remonte à Grégoire ; **E** non mesurée.

## Limites de la mesure

- Une fiche est comptée « attend Grégoire » selon la règle de la page : une décision nommée, et un état qui ne commence ni par « livré » ni par « tranché ».
- La case du BACKLOG ne départage presque rien : sur les 158 fiches cherchées, une seule est cochée (#1167). Plusieurs fiches réglées dans le code gardent une case vide (#1171, #1224, #1225, #1226, #1227, #592).
- Catégorie A, deux sortes : réglée dans le code (preuve fichier:ligne), ou close par une décision que la fiche rapporte, sans code attendu (« close par décision ») ; ces dernières ne sont pas vérifiées au-delà du texte de la fiche.
- La plupart des D et des C sont rangées d'après le texte de la fiche et l'en-tête de son entrée au BACKLOG, pas d'après une lecture du code : c'est dit dans la colonne « Preuve ou piste » (« non mesuré », « non lu »).
- Les numéros de ligne cités d'après le BACKLOG pour #1056 n'ont pas été revérifiés dans le fichier actuel.
- #1167 est faite sur la branche de travail, pas vérifiée sur `main`.

## Palier I (83 fiches mesurées)

| N° | Fiche | Cat. | Preuve ou piste |
|---|---|---|---|
| à inscrire · archivage | Exporter et archiver : case sans cadenas quand deux copies divergent | E | Non retrouvée au BACKLOG (grep) ; js/travaux-archivage.js:412 traite la sélection, l'affichage du cadenas (js/travaux-ui.js) non lu |
| à inscrire · pincement | Parcours, écran agrandi au pincement : la bulle n'est pas réécrite | C | js/parcours-moteur.js ; geste de pincement, WebKit/iPad |
| file 37 | Verdict GitHub rouge à chaque passage, liste de référence Linux périmée | E | Demande des passages sur GitHub ; rien de mesurable dans le clone |
| file 36 | Parcours : halo à 1 px près après défilement, essai intermittent | C | js/parcours-moteur.js ; mise en page, Playwright |
| #1281 | Reste de l'exercice d'étiquetage guidé, Apporter mon matériel | D | Mots d'écran et didactique du parcours ; BACKLOG.md:334 [ ] (une partie livrée en 1.247.0) |
| #1278 | « Non enregistré : le navigateur a refusé l'écriture » ne dit ni quoi ni pourquoi | B | js/modes.js:1715-1718 : l'abonné reçoit (cleEcrite, error) ; garder la clé et le nom de l'erreur pour le rapport de bug (js/rapport-bug.js), sans changer le message montré (le texte, lui, remonte) |
| #1273 | Parcours Évaluer, étape 1 : grille créée avant « Commencer » n'avance pas | D | js/parcours-evaluer.js:164-165 (grilleCreee lit grillesAvant) inchangé ; BACKLOG.md:323 : « ne pas corriger seul », iPad |
| #1271 | Préparer : la production choisie pour le lot n'est jamais remise à zéro | D | js/travaux-import.js:222, 2167 ; js/travaux-ui.js:2921 : aucune remise à zéro vue ; doute B/D : la persistance peut être voulue, et elle prime sur le nom donné par Léa |
| #1076 | Note au dixième, entier pour Léa (tranché) | D | js/export-resultats-finaux.js:75 dit déjà « arrondie à l'entier » ; le reste (dixième ailleurs, bulletin PDF) touche l'export et le sens de la note ; non mesuré écran par écran |
| #1074 | Export anonymisé retire aussi programme, services adaptés, résultats ultérieurs (tranché) | D | js/trimestres.js:1997-2004 lit encore resultatsUlterieurs dans l'export recherche : paraît ouvert ; format d'export |
| #1067 | Groupe-cours neuf sans pratique ; 0 % au lieu d'un tiret | D | BACKLOG.md:741 ; défaut de pratique = pédagogie (et #1118 dit « aucune n'est imposée ») ; volet tiret : js/etudiants.js:811, 959 déjà en partie |
| #1066 | Pratique « retirée » introuvable si elle n'existe que dans le trimestre | D | js/pratiques-gestion.js:92, 325 filtrent dansBibliotheque ; où la remontrer = choix d'écran |
| #1065 | Supprimer un horaire ne nomme pas les groupes-cours qui l'emploient | D | js/trimestre-v2-horaires.js:1019 : confirm() nu, inchangé ; mots d'écran + horaireId orphelins déjà écrits |
| #1059 | Import de cartouche depuis un fichier texte : succès annoncé sans rien enregistrer | D | js/cartouches.js:2097 (importerCartoucheDepuisTxt) ; import + mots lus par les élèves ; corps non lu |
| #1058 | Texte d'annotation validé par Entrée ajouté deux fois | C | js/travaux-annotation.js:1590-1606 : Entrée puis clic extérieur appellent tous deux confirmerTexte ; garde d'idempotence non vérifiée ; à rejouer au navigateur ; doublons déjà écrits = stock |
| #1057 | Supprimer la pratique d'un groupe-cours arrête ses notes sans prévenir | D | js/pratiques-gestion.js:1036 ; avertissement = mots d'écran, et ce que la suppression emporte |
| #1056 | Retoucher une production peut effacer son échéance par groupe | B | js/productions.js (BACKLOG.md:730 cite l. 1556, 995-1031, 1438-1447, lignes non revérifiées) : en mode simple, ne pas réécrire echeancesParGroupe[gc].date quand dateEcheance est absente ; stock à assumer |
| #1054 | Import CSV du bilan réflexif s'arrête sur deux erreurs | B | js/bilan-reflexif-csv.js:98, 569, 577 appellent genId et CLE_RESULTATS sans les lier (l. 30-32 ne lient que etat, afficherToast, tronquer) ; les prendre de BilanReflexifCore (core:253, 311, 403) ; l'écran d'import reste retiré (index.html:11307) |
| #1053 | Deux modules enveloppent la navigation (tranché, zone protégée) | D | js/navigation.js protégé ; BACKLOG.md:778 |
| #1044 | Boutons à icône seule ailleurs dans l'application (tranché) | D | Mesure possible sans lui, mais les mots lui reviennent écran par écran |
| #1026 | Vignettes des copies d'un trimestre revenu non refaites | C | js/reserve-emprunter.js ; coût mesuré au navigateur (1 min pour 394 copies) |
| #1020 | Rouvrir un codex : reste le nom des mises à jour après la réouverture | D | js/codex.js ; codex et mots de fenêtre |
| #1019 | Supprimer un trimestre laisse les fichiers de ses copies | D | Suppression de données ; js/reserve-renvoyer.js:368 le fait pour le renvoi, js/trimestres.js (supprimerTrimestre) non lu |
| #1004 | Onglet resté ouvert garde l'ancienne version | C | js/init-inline.js:325-329 ; BACKLOG.md:926 : à mesurer dans son Chrome avant de corriger |
| #997 | Copie d'H2026 « manquante », réparable par son geste (tranché) | D | Ses données réelles ; js/reserve-revenir.js |
| #996 | Partage du codex : fichier entier en mémoire, à mesurer sur l'iPad | C | js/fichier-sortant.js ; mesure sur l'iPad |
| #825 | L'application met 30 à 45 secondes à s'ouvrir (douteux) | E | Serveur et cache ; tests/unit/sentinelle-825-ouverture-immuable.test.js existe ; non mesurable ici |
| #833 | Tests rouges au hasard sur le serveur, verts en local | E | Passages GitHub requis |
| #844 | Service créé par erreur impossible à supprimer | D | js/trimestre-v2-cours.js:352 (garde #449) ; suppression de données |
| #848 | Deux libellés annoncent l'horaire facultatif alors qu'il est exigé | D | Arbitré option A le 12 sept. (BACKLOG.md:1370) ; mots d'écran ; js/trimestre-v2-groupes-cours.js:299 ; état non établi |
| #814 | Croix du journal trop petite | B | js/journal.js:295 (.journal-modal-fermer) : cible à 44 px en CSS et fermeture par Échap ; aucun écouteur Escape trouvé dans js/journal.js |
| #766 | Style inline d'index.html écrase 13 classes (tranché) | C | Captures avant et après exigées |
| #788 | Verdict des tests navigateur, plafond de temps | A | Close par décision du 10 oct. (dit par la fiche) ; aucun code attendu ; case BACKLOG.md:1992 restée vide |
| #592 | Retirer le mode « par objectifs » | A | js/pratique-notation-v2.js n'existe plus (retiré avec #469, 1.199.0) ; case BACKLOG.md:6313 restée vide |
| #582 | Recoupement horaire, période = heure | A | Close par décision du 15 oct. (dit par la fiche) ; aucun code attendu ; case BACKLOG.md:6125 vide |
| #580 | Deux chemins d'ouverture amputent l'échelle | A | Close par décision (fiche) ; BACKLOG.md:6163 : correction retirée ; case vide |
| #629 | Derniers points mineurs du plan Conception | E | Contenu de la fiche non lu (BACKLOG.md:4129, en partie livré en 1.199.0) |
| #545 | Une échelle réparée a disparu de nouveau | D | Données réelles d'un ancien trimestre |
| #519 | Astérisques sans légende et cibles trop petites, Conception | C | design-system.html ; mise en page |
| #479 | Importer une échelle d'un autre trimestre perd sa provenance | D | Import ; BACKLOG.md:8624 |
| #483 | Pondération 0 ne compte pas dans la note (tranché) | D | Sens de la note ; BACKLOG.md:8628 : « reste à Grégoire » ; js/grilles.js cite #483 |
| #484 | L'assistant de pratique ne demande pas d'abord si on sait ce qu'on veut | D | Mots et ordre des écrans de l'assistant |
| #430 | Retirer la reprise temporaire des rétroactions de leçon (tranché) | D | js/main.js, js/planification-export.js citent #430 ; BACKLOG.md:9059 « À Grégoire » : anciens fichiers |
| #439 | Ajouter les deux guides manquants dans l'Aide | D | Texte de guides |
| #349 | Évaluation archivée : le formulaire clignote « modifiable » | C | js/evaluation.js ; scintillement, navigateur |
| #340 | Confirmer que les productions ne changent plus de trimestre | D | Garde en place (tests/unit/sentinelle-namespace-productions-340.test.js) ; reste la confirmation sur ses données |
| #283 | Deux pages serrées sous 1024 px sur iPad | C | styles.css ; mise en page |
| #297 | Règles CSS dupliquées, écarts d'affichage | C | index.html / styles.css ; rendu |
| #245 | Voir sur la courbe l'effet d'une intervention | D | Fonction nouvelle, pédagogie |
| #177 | Importer un dossier Léa complet et associer par DA | D | Import, chantier |
| #269 | Rythme : emporter son portrait temporel | D | Export, fonction nouvelle |
| #270 | Rythme : ouvrir une activité du portrait | D | Fonction nouvelle |
| #879 | Cadre, six boutons « + Nouveau… » hétérogènes, 27 px | C | « Ne pas ouvrir avant qu'un retour le demande » |
| #1090 | Grille partagée part sans son échelle | D | js/partage-format.js ; format de partage |
| #1096 | Import d'une sélection : descripteurs réduits aux codes des niveaux | D | js/import-export.js:189-197 : le commentaire confirme que l'import sélectif n'appelle pas la règle ; import |
| #1097 | Grille en plusieurs tableaux : seul le premier est lu | D | js/materiel-dissection-lecture.js ; BACKLOG.md:671 n'a qu'une proposition ; doute B/D |
| #1098 | Ligne de calcul de la langue, à classer | D | Ce qu'un critère mesure |
| #1108 | « Grille de base » de l'assistant : poids sans pondération | D | js/wizard-pratique-v2.js:2066-2069 : poids: 25 toujours là ; mesurer d'abord si une copie compte ses critères |
| #1111 | Mise à jour de Vitest 2 → 5 | B | tests/package.json : monter esbuild avec Vitest, puis rejouer la suite ; demande le registre npm |
| #1112 | Sans évaluation, le profil d'un élève cache son suivi | E | Chantier orthopédagogie en cours ; aucune trace de #1112 dans js/ ; non mesuré |
| #1114 | Liste de référence Linux, puis verdict du soir confié à GitHub | E | Passages GitHub requis |
| #1116 | Neuf essais d'« Apporter mon matériel » rouges sous Linux | E | Passages GitHub requis |
| #1128 | Anciens chemins vers le PDF à retirer | B | js/export-pdf.js:3874, 4332 : afficherFormulairePDFDepuisEchelle sans appelant hors du fichier ; absente de noms_stables.json ; BACKLOG.md:588 liste la chaîne morte (modale exportPDF-*, #formulairePreparationPDF) |
| #1132 | Deux critères algorithmiques dans une grille (en partie) | D | js/evaluation-enonces.js:131 ; « ta règle sera due pour aller plus loin » |
| #1161 | « Tout garder dans ma bibliothèque » verse un second exemplaire | B | js/grilles.js:3114 (ajouterMesGrillesALaBibliotheque) : reconnaître une grille venue de la bibliothèque ; même patron que #1167 ; garde non lue en entier |
| #1167 | « ← Utiliser » sur un tampon intégré écrit un doublon | A | js/tampons-bibliotheque.js:166 ; tests/unit/sentinelle-1167-tampon-integre-sans-doublon.test.js ; BACKLOG.md:541 [x] ; sur la branche lot/file-sans-gregoire-2026-11-27, pas vérifié sur main |
| #1171 | Conception › Productions montre tous les cours sans nommer le leur | A | js/productions-liste.js:69, 161, 452 ; tests/unit/productions-menu-cours-1171.test.js ; case BACKLOG.md:544 restée vide |
| #1183 | Fusion de codex : palette des tampons coupée en deux familles | D | js/codex.js:2192 (REGLAGES_DE_L_APPAREIL) ; codex |
| #1189 | Un seul séparateur de chemin « › » dans les textes d'écran | D | Mots d'écran ; convention arrêtée, donc doute B/D |
| #1194 | H2026 a montré 3 grilles au lieu de 7 (douteux) | E | Non reproduit, cause non établie |
| #1195 | Ancien trimestre rouvert ne montre aucun défi | D | Dépistage et anciens trimestres |
| #1199 | L'échelle « du groupe » est celle du cours | D | js/contexte-qualification.js:159 ; lecture des bandes de P |
| #1201 | La garde des repères teste la famille, pas « en points » | D | js/contexte-qualification.js:164 ; même zone |
| #1203 | « — » du profil et niveau ne lisent pas le même minimum | D | « || 3 » en trois endroits : js/etudiants.js:970, js/profil-etudiant-sections-affichage.js:382, js/profil-etudiant-calculs.js:1869 ; sans cas vécu |
| #1204 | Le critère effondré ne voit pas le mode des codes | D | js/evaluation-retroaction.js (la l. 1007 citée a bougé) ; rétroaction lue par les élèves ; doute B/D |
| #1224 | Messages rouges et orange affichés jusqu'à « OK » | A | js/utils-notifications.js:44, 63 ; tests/unit/notifications-1224-ok-et-pile.test.js ; case BACKLOG.md:448 vide |
| #1225 | Trajectoires : case « Sans jetons » | A | index.html:7531 ; js/graphiques-progression.js:3603, 3654 ; tests/unit/trajectoires-sans-jetons-1225.test.js ; case vide |
| #1226 | Trajectoires lit la note brute d'une copie non recevable | A | js/graphiques-progression.js:3642, 3929 ; tests/unit/habiletes-non-recevable-1226.test.js ; case vide |
| #1227 | Mode Habiletés : copie non recevable laisse un point vide | A | js/graphiques-progression.js:2114, 3747 : c'est le comportement décidé le 4 nov. ; case vide |
| #1237 | Déplacer Modélisation de Labo vers Suivi › Animation | D | Navigation protégée |
| #1247 | « Exporter pour Léa » envoie comme « sur papier » une copie numérisée introuvable | D | js/travaux-archivage.js:419 ; BACKLOG.md:383 pose une question à Grégoire |
| #1258 | Échap ferme aussi l'aperçu du codex et annule la mise à jour | C | js/accompagnement.js:1117 ; ordre de deux écouteurs sur le document, à prouver au navigateur |
| #1261 | Bilan d'intervention : compare aussi assiduité, complétion, écart au groupe | D | js/interventions.js:1143-1152 : snapshotAvant sans A ni C ; mots du bilan et « avant » déjà figés |

## Palier L (79 fiches mesurées)

| N° | Fiche | Cat. | Preuve ou piste |
|---|---|---|---|
| #1085 | Partie 8 (Labo), neuf écarts | D | Lot composite, mots d'écran ; non mesuré entrée par entrée |
| #1084 | Partie 7 (dépistage, interventions, rencontres), neuf écarts | D | Lot composite, mots et dépistage ; non mesuré entrée par entrée |
| #1083 | Partie 6 (Suivi, profils, présences), neuf écarts et un code mort | D | Un point lui revient (note différée) ; js/indices.js et js/profil-etudiant-sections-affichage.js citent #1083 : en partie entamé, non mesuré |
| #1082 | Partie 5 (Évaluation), dix-huit écarts | D | Mots lus par les élèves ; non mesuré entrée par entrée |
| #1081 | Partie 4 (Rétroactions, Pratiques, Carte, bibliothèques, partage), vingt et un écarts | D | Mots et partage ; non mesuré |
| #1080 | Partie 3 (Productions, Grilles, Échelles), huit écarts | D | Mots (« rétroaction » dans le gabarit) ; les volets témoin d'écriture seraient B ; non mesuré |
| #1079 | Partie 2 (le Cadre), dix écarts, dont « Dupliquer » un cours | D | Bouton à créer, mots ; non mesuré |
| #1078 | Partie 1 (entrée, codex, témoin, Nouveautés, aide), dix écarts | D | Mots et codex ; js/codex.js:3134-3166 cité, non relu |
| #1077 | Supprimer un trimestre laisse les fichiers de ses copies | D | Suppression de données ; voir #1019 |
| #1075 | Protection et intégrité des données, neuf défauts (en partie) | A | Sources en ligne en 1.214.0 (js/modes.js, js/partage-section.js ; tests/unit/sentinelle-1075-*.test.js) ; le reste est #1140 |
| #1071 | Codex écrit en clair (tranché : pas de chiffrement) | D | Reste la fenêtre « Confidentiel », ses mots à lui soumettre ; non mesuré |
| #1064 | Verrouillage, trois défauts | D | Passe par js/config.js (#646), zone protégée |
| #1063 | Gestes du Cadre réécrivent le cours actif sans son groupe-cours | D | Interventions déjà estampillées au cours = stock ; BACKLOG.md:737 |
| #1062 | Présence d'intervention marque la séance « saisie » pour le sous-groupe | D | Assiduité et présences déjà écrites |
| #1051 | Contenir la complexité : second lot possible | B | tests/unit/_helpers/complexite.js ; mesurer dépendances circulaires et couplage (tests seulement) ; facultatif, sans symptôme |
| #1043 | Jetons et jugements de dénotation hors de leur trimestre (tranché) | D | Déplacement de clés dans ses données ; non mesuré |
| #992 | Codex de plus de 2 Go ne se rouvre pas | A | Close par décision du 14 oct. (fiche : codex à 254,7 Mo) ; aucun code vérifié |
| #978 | Intervention modifiée après sa complétion ne reporte rien | E | La fiche dit la source corrigée ; non revérifié dans js/interventions.js |
| #836 | Restes du chantier Rencontres | D | Attend le retour de l'orthopédagogue |
| #838 | Élève déjà inscrit à un autre cours n'entre pas dans un service | A | Close par décision du 15 oct. (fiche) ; aucun code attendu |
| #840 | Matériel partagé ne dit pas qu'il vient de l'orthopédagogie | D | Format de partage |
| #813 | Cent douze couleurs appellent une variable qui n'existe pas | C | styles.css ; chaque couleur est un choix d'apparence |
| #810 | La note des standards se construit sur le portfolio | D | Sens de la note ; chantier des standards |
| #707 | Le programme d'un élève s'affiche vide | E | js/profil-etudiant-sections-affichage.js:2555 passe par obtenirNomProgramme : peut-être réglée ; à confirmer sur ses données |
| #721 | Jetons mélangés entre trimestres, hors des archives | D | Clé nue jetonsEtudiants ; données déjà écrites, archives |
| #738 | « Non remis » noté 0 compté comme remis | D | Sens de la note ; volet complétion livré |
| #781 | Historique git avec des exports d'élèves réels (tranché) | E | Hors application ; purge non vérifiable depuis ce clone |
| #694 | Six dossiers de retours nominatifs dans le dépôt (tranché) | E | Idem #781 |
| #616 | Sentinelles qui rougissent sur un commentaire (en partie) | B | tests/unit/ : reborner les 41 lignes restantes dans 28 bancs ; tests/unit/sentinelle-616-bornes-en-caracteres.test.js tient le cliquet |
| #615 | Retirer « Renommer pour distinguer » et son legacy | B | Décidé (D3 = A) ; js/travaux-ui.js:4604-4608 et js/travaux-import.js:2787, 2841 encore là ; retire un geste d'écran : à confirmer avant |
| #690 | Pratiques inventées aux prénoms de collègues | E | js/pratiques/pratiques-predefines.js existe encore ; tests/unit/sentinelle-690-aucun-prenom-dans-le-code.test.js existe ; contenu non lu |
| #682 | Le nouveau nom n'atteint que les espaces neufs (douteux) | D | Nom de grille imprimé sur les PDF ; stock |
| #668 | Projection EUF en dur (tranché : encadré dans le PDF) | D | Mots du PDF à lui soumettre |
| #646 | Deux « évaluations en cours » sous le même nom | D | js/config.js, zone protégée |
| #628 | Ancien système des quatre sections | D | noms_stables.json, zone protégée |
| #551 | Risque calculé sur les seuils d'un autre enseignant (tranché) | D | Dépistage ; js/interventions.js cite #551 ; état non mesuré |
| #579 | Échelle embarquée ne reçoit pas ses repères (tranché) | D | Sens des résultats, confirmation à l'écran |
| #584 | Export recherche ne dit pas où sont suffisance et maîtrise | D | Arbitré (les deux repères partent) ; aucun champ de repère trouvé dans js/trimestres.js ; format d'export |
| #587 | Neuf fonctions de même nom (en partie) | D | Reste = enveloppes de la navigation (#1053), zone protégée |
| #595 | 78 variables CSS jamais définies | C | styles.css ; 68 noms restants selon BACKLOG.md:6867 ; apparence |
| #598 | Balance des blancs appliquée aux photos sans aperçu | D | Volet A fait (js/travaux-ui.js:1639, 1844 ; sentinelle-598) ; volet B = un réglage à l'écran |
| #548 | Garde contre les productions du mauvais trimestre | A | Close par décision du 15 oct. (fiche) ; aucun code attendu |
| #602 | Fichier périmé servi sans contrôle (en partie) | B | scripts/release.mjs : reste à donner leur jeton aux fichiers chargés par un worker ; js/travaux-visionneuse.js cite #602 |
| #463 | Ressource supprimée qui revient | A | Close par décision : « on ne change rien » |
| #465 | La note calculée ne correspond pas à la pratique configurée | D | Calcul de la note |
| #469 | Retirer les anciens systèmes (en partie) | A | Fiche : restent 21 fonctions gardées avec leur raison ; tests/unit/sentinelle-469-lot22-code-mort-la-fin.test.js ; rien à faire |
| #470 | L'application redessine tous les onglets au démarrage | C | Vitesse de rendu, navigateur |
| #476 | Vingt-deux « Dupliquer » à fusionner (tranché) | D | Écrit des copies dans ses bibliothèques ; non mesuré |
| #481 | Quatre fragilités éparses | E | Contenu non lu (BACKLOG.md:8626) |
| #425 | Productions évaluées mais non planifiées sur la carte | D | Chantier de la carte, choix d'écran |
| #678 | Alertes bloquantes aux premiers pas (en partie) | C | Restent deux parcours et une notification sur l'iPad en portrait |
| #453 | Rendre aux artefacts la grille, l'échelle et la cartouche effacées | D | Réparation de ses données d'H2026 |
| #402 | Portfolio, restes d'entretien | E | Contenu non lu (BACKLOG.md:9665) |
| #393 | Six décisions de l'audit du 5 août (tranché : techniques) | E | Les six restes non lus (BACKLOG.md:9693) |
| #364 | Comparateur et import inter-trimestre sans aide (tranché) | D | Texte d'aide à relire par lui |
| #346 | Fiche ré-identifiée laisse ses productions en arrière | D | Ses données d'H2026 |
| #342 | Pratiques portant le nom d'un autre enseignant | D | Réparation de données déjà estampillées |
| #326 | Finir le banc de comparaison et le remettre en vue | D | Zone protégée, choix de produit |
| #378 | Calendrier réémis après une grève (tranché) | D | Chantier, mots du signalement |
| #333 | Résultats finaux en PDF (tranché) | D | Mots et mise en page à lui soumettre |
| #329 | Pilote de partage par fichiers signés | D | Partage, engagement public |
| #291 | Comparer et fusionner deux doublons (tranché) | D | Fusion dans ses bibliothèques |
| #286 | Les emojis rendent mal sur iPad | C | Icônes, rendu iPad |
| #336 | Ouvrir un codex double le stockage | A | Retirée par décision du 15 oct. (ne rien effacer seul) |
| #272 | Ouvrir une évaluation échoue par intermittence | C | Refonte en machine à états ; intermittence à rejouer au navigateur |
| #47 | Mot de passe sur une sauvegarde | D | Format de sauvegarde, produit |
| #854 | Formulaire des jetons non lu sur une pratique de l'assistant | A | Close par décision du 15 oct. (fiche) |
| #1118 | Interface simple au départ : ni SOLO ni RàI par défaut (tranché) | E | Livraison non vérifiée ; aucune trace de #1118 dans js/ |
| #1140 | Trimestre clos : 56 écritures hors du refus | D | Suite à décider ; plans de travail/FICHE-2026-10-22-ecritures-directes-trimestre-clos.md |
| #1142 | Compte d'erreurs écrit dans l'évaluation d'une autre copie | A | Source : js/evaluation-calcul.js:265, 322 ; tests/integration/compte-erreurs-autre-copie-1142.spec.js. Stock : js/comptes-erreurs-stock.js mesure et répare sur accord ; le geste sur ses données lui revient |
| #1146 | Uniformiser les suites d'étapes sur la barre du Trimestre | C | Présentation ; index.html |
| #1152 | Refonte de l'Aide (en partie) | D | Textes d'aide |
| #1160 | Grille retirée du trimestre, absente de la bibliothèque, introuvable | D | index.html:10133 la dit à faire ; choix d'écran |
| #1166 | « ← Utiliser dans ma palette » perd l'image du tampon | D | js/tampons-bibliotheque.js:182-186 : commentaire « rien ne lit tamponsImages » ; écrire l'image ailleurs change les données |
| #1176 | Demander ce que vaut une copie non recevable | E | Codé sur une branche non fusionnée selon la fiche ; branche non lue ; sens de la note |
| #1178 | Standards sans portfolio ni terminale (en partie) | D | Sens de la note ; suites inscrites |
| #1206 | Les autres lecteurs de la note affichée | D | js/profil-etudiant-sections-affichage.js:1097 lit déjà noteDuCoursAffichee ; liste et fiche Performance non vérifiées ; note montrée |
| #1211 | Échelle ou production copiée de la démo garde ses défauts | D | Données déjà écrites, exclusion des exports (js/echelles.js) |
| #1236 | Ouverture et fusion du codex rendent des blobs sans type | D | js/codex.js:974, 3032 ; BACKLOG.md:410 : format d'échange |

## Fiches I et L qui attendent Grégoire (18, non mesurées)

| N° | Palier | Fiche | Ce qu'on attend de lui |
|---|---|---|---|
| #1277 | I | Ligne de conversion (« Résultat sur 80 ») sans étiquette | pédagogie : la conversion change-t-elle la note, ou son affichage ? |
| #1060 | I | Table code ↔ DA téléchargée en clair avec l'export anonymisé | engagement public : sa forme, après la réponse du cégep (Loi 25) |
| #1088 | I | Conditionnel à appliquer à la carte RàI, à l'aide et au guide | choix de produit : les mots de remplacement |
| #1102 | I | Niveaux nommés par un nombre seul rangés en ordre croissant | arbitrage : la correction |
| #1103 | I | Grille mêlant points et niveaux garde ses « % » | pédagogie : ce que veut dire le total |
| #1109 | I | La dissection ne lit pas une multiplication (« X 2 ») | pédagogie : pondération doublée ou facteur ? |
| #1133 | I | Mode Catégories sans écran qui l'active | choix de produit : la suite |
| #1163 | I | « Garder une cartouche dans ma bibliothèque » : geste absent | choix de produit |
| #1164 | I | « Garder une pratique dans ma bibliothèque » : geste absent | choix de produit |
| #1198 | I | Un seul repère posé : tout P au-dessus est jaune | pédagogie |
| #1239 | I | En-tête compacté au défilement | choix de produit |
| #1249 | I | Export recherche lit les niveaux d'une copie non recevable | choix de produit |
| #835 | L | Grille de l'orthopédagogue sans formule « repérées sur total » | arbitrage ; attendait sa question du 19 oct. à l'orthopédagogue |
| #591 | L | L'anonymisation doit-elle rester réversible ? | engagement public ; attend son courriel aux responsables de la Loi 25, puis leur réponse |
| #1165 | L | Relier une carte d'alignement à son exemplaire gardé | choix de produit |
| #1170 | L | Aucun geste ne change le cours d'un·e élève ou d'un groupe | choix de produit |
| #1259 | L | Dépister quand les critères varient d'une production à l'autre | pédagogie, un chantier |
| #1260 | L | Recommandations transparentes, sur lesquelles on a prise | pédagogie, un chantier |
