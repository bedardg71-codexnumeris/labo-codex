# Lot 7 : ce que l'application offre et que l'Aide ne dit pas

*Audit dans le sens code → Aide. 24 oct. 2026, dépôt au commit 35745bd (version 1.216.2), lecture seule.*

## Méthode, et ce qu'elle ne voit pas

- **Inventaire des écrans.** Les 7 onglets et 30 sous-onglets de `configurationsOnglets` (js/config.js:37-106, avec les masquages de js/navigation.js:353-370), l'en-tête et le menu Codex (index.html:3808-3959), l'accueil (js/accueil.js:80-300), puis chaque sous-onglet : le HTML (index.html:4154-9976) et, pour les écrans bâtis en JavaScript, le module qui les rend. Un geste = ce qu'un·e enseignant·e fait (« réassigner une copie »), pas un bouton isolé.
- **Ce qui a été livré.** Les Nouvelles de 1.148 à 1.216 (js/changelog-data.js) et les commits `feat`/`release` depuis le 15 sept. ⚠ Le clone est superficiel : son plus vieux commit date du 4 oct. 2026. Pour le 15 sept.-3 oct., seules les Nouvelles ont servi d'index.
- **Recherche dans l'Aide.** Le texte de index.html:9977-14126, balises retirées, cherché par nom du geste, synonymes et onglet.
- **Classement.** *Couvert* : l'Aide dit comment faire. *Mentionné* : le geste est nommé, mais pas le comment ou pas la règle qui compte. *Absent* : aucune trace. « Couvert » ne veut pas dire « exact » : l'exactitude revient aux lots qui auditent chaque entrée.
- **Fréquence.** Hebdomadaire / occasionnel / rare : une estimation de l'usage d'un·e enseignant·e, pas une mesure.
- **Aide sur l'écran.** Fenêtre « i » (js/accompagnement-contenu-popup.js), bulle (js/accompagnement-contenu-hover.js), guide intégré, ou texte que l'écran porte lui-même.
- **Limite.** Les écrans bâtis en JavaScript sont lus dans le code. Quand le code ne tranche pas, c'est écrit « à voir à l'écran ».

Les identifiants d'entrées sont donnés sans le préfixe `accordeon-aide-`. « Entrée neuve » = une carte à créer.

---

## 1. Les trous, onglet par onglet

Seuls les gestes *absents* ou *mentionnés* figurent ici. Les gestes couverts sont à la section 5.

### En-tête, accueil et menu Codex

| # | Geste | Classe | Preuve | Fréquence | Taille d'explication | Aide sur l'écran |
|---|---|---|---|---|---|---|
| T3 | Fusionner son codex avec un autre | mentionné (`codex`, 13991, une ligne) | index.html:3847 ; js/codex.js:3957-3961 (analyse puis résolution des conflits) | rare | une phrase dans `codex` : ce que fait la fenêtre de résolution | non |
| T4 | Comparer son codex avec un autre fichier (rapport texte, rien n'est modifié) | absent | index.html:3850 ; js/codex.js:4147-4151 | rare | une phrase dans `codex` | non |
| T5 | Voir les détails du codex | absent | index.html:3843 ; js/codex.js:3897 | rare | une demi-phrase dans la liste du menu de `codex` | non |
| T6 | Exporter une sélection (sous-ensemble par trimestre) | mentionné (`codex`, 13992) | index.html:3853 ; js/codex.js:4350 | rare | rien de plus | non |
| T7 | Archiver un groupe-cours (Codex › Archiver…) | mentionné (`codex`, 13971 et 13989) | index.html:3856 | occasionnel (fin de trimestre) | dans l'entrée neuve « Archives » (voir K7) | oui : fenêtre « Archiver » (popup.js:1260-1293) |
| T8 | Ouvrir une archive pour en reprendre des ressources | mentionné (`codex`, 13990) | index.html:3859 | occasionnel | dans l'entrée neuve « Archives » | oui : popup.js:1321-1380 |
| T10 | Répondre au rappel de mise à jour du codex (revient après 14 jours) | absent | js/modal-backup-reminder.js:24, 236 | occasionnel | une phrase dans `codex` | la fenêtre se suffit |
| T11 | Écrire un codex avant de supprimer (codex à jour, ou « codex à part ») | absent | js/codex.js:3670-3685, 3844 (1.175-1.178) | occasionnel | une phrase dans `codex` | la fenêtre se suffit |
| T14 | Signaler un bogue, et savoir ce que le rapport contient | absent | index.html:3887 ; js/rapport-bug.js:1-18 | occasionnel | une question dans `faq` | oui : bulle à jour (hover.js:24-25) |
| T15 | Soutenir Labo Codex | absent | index.html:3888 | rare | aucune | oui : bulle (hover.js:48-49) |
| T20 | Retirer les copies importées dans la démo | absent | js/demo-activation.js:604-610 (1.187) | rare | une phrase dans `demo` | bouton nommé dans le bandeau vert |
| T21 | Lire les Nouveautés | absent | js/accueil.js:252 | rare | une demi-phrase dans `apropos` | oui : popup.js:1570 |
| T22 | Ouvrir un guide pédagogique (SOLO, ACP, RàI, sommative, modalités) | absent | js/guides-pedagogiques.js:33-337 ; boutons « Guide » index.html:8792, 8922, 9019, 5506-5510 ; js/accueil.js:116 | occasionnel | une phrase dans `prise-en-main` | le texte d'accueil les nomme (js/accueil.js:111) |
| T23 | Consulter un trimestre clos (lecture seule, « Permission d'écriture », « Anonymiser ») | mentionné (`archivage`, 11249 : « reste accessible pour consultation ») | index.html:3961-3982 ; js/modes.js:1057 | occasionnel | une phrase dans `archivage` | bandeau à l'écran, sans explication de la permission |
| T24 | Entrer dans l'application (code reçu par courriel, valable un mois) | absent | js/accueil.js:110 ; le mécanisme n'est pas dans le dépôt (à voir) | rare (mensuel) | une question dans `faq` | texte d'accueil |

### Cadre

| # | Geste | Classe | Preuve | Fréquence | Taille d'explication | Aide sur l'écran |
|---|---|---|---|---|---|---|
| K2 | Poser les semaines spéciales (planification, examens) | absent | index.html:6354-6390 | occasionnel | une phrase dans `trimestre` | non |
| K3 | Déclarer une journée sans cours (nature, horaire de reprise) | mentionné (`horaire` 10829-10830, glossaire « Congé », « Reprise ») | index.html:6400-6450 | occasionnel | une phrase dans `trimestre` | bulle « Trimestre » (hover.js:58) |
| K4 | Passer d'un trimestre à l'autre (« Trimestre actif », Bibliothèque › Activer) | absent | index.html:6270-6282 ; js/trimestre-v2-liste.js:240 | occasionnel | une phrase dans `trimestre` | bulle sur « Bibliothèque » |
| K6 | Supprimer un trimestre (codex à part, nom à taper) | absent | js/trimestre-v2-liste.js:238 (1.175, 1.199) | rare | une phrase dans `archivage` | la fenêtre se suffit |
| K7 | Archiver un trimestre clos entier, puis le vérifier | absent | js/reserve-trimestre.js:53 ; js/trimestre-v2-liste.js:225-227 (1.183) | occasionnel (fin de trimestre) | **entrée neuve « Archives »**, avec K8, K9, R4, T7, T8 (~160 mots) | non |
| K8 | Renvoyer un trimestre clos aux archives ; « Terminer le renvoi » | absent | js/reserve-renvoyer.js:78, 131 ; js/trimestre-v2-liste.js:233-235 (1.185) | occasionnel | entrée neuve « Archives » | non |
| K9 | Archiver les copies d'un trimestre clos (ses données restent) | absent | js/reserve-copies.js:83-99 ; js/trimestre-v2-liste.js:229-231 (1.186) | occasionnel | entrée neuve « Archives » | non |
| K11 | Créer un service (nature « service » d'un cours) | absent | index.html:6527-6531, 7389-7405 | occasionnel | dans l'entrée neuve « Rencontres » (S17) | voir S17 |
| K12 | Supprimer un cours (refusé s'il porte des données) | absent | index.html:6737-6738 (1.200) | rare | une phrase dans `cours` | la fenêtre dit ce qui s'y rattache |
| K15 | Choisir le cours auquel une liste importée se rattache | absent | index.html:7163-7172 (1.148) | occasionnel | une phrase dans `etudiants` | texte à l'écran |
| K16 | Corriger un DA mal tapé | absent | index.html:7084-7086 (1.191) | occasionnel | une phrase dans `etudiants` | texte à l'écran |
| K17 | Marquer un·e étudiant·e en inactivité ou en décrochage | mentionné, avec les mauvais mots (`faq` 13686-13691 : « Actif », « Inactif », « Abandon ») | js/trimestre-v2-etudiants.js:408-414, 1166-1186 (colonne « Remarque » : Aucune, Inactivité, Décrochage) | occasionnel | réécrire la question de `faq` (~30 mots) | la question de confirmation le dit |
| K18 | Supprimer un·e étudiant·e : ce qui disparaît des listes, ce que le codex garde, ce qu'un ancien fichier ne ramène plus | absent | js/trimestre-v2-etudiants.js:1146-1160 (1.174, 1.180) | occasionnel | une phrase dans `etudiants` | à voir à l'écran |
| K19 | Saisir une date d'arrivée | absent | index.html:7121 | occasionnel | une demi-phrase dans `etudiants` | bulle (reglages-etudiants-date-arrivee) |
| K20 | Gérer les groupes (nouveau, supprimer, vider la liste) | absent | index.html:7021-7060 (1.149) | rare | une phrase dans `etudiants` | non |

### Conception

| # | Geste | Classe | Preuve | Fréquence | Taille d'explication | Aide sur l'écran |
|---|---|---|---|---|---|---|
| N3 | « Essayer avec un exemple », « Taper ma grille à la main » | absent | index.html:4199-4200 | rare | une phrase dans `apporter-grille` | bulles (hover.js:875-877) |
| N4 | Revenir à sa dissection après « Créer ma grille » | absent | js/materiel.js:110 ; js/materiel-dissection.js:155 (1.210) | occasionnel | une phrase dans `apporter-grille` | bouton nommé |
| N5 | Coller sa liste de codes de correction vers un critère algorithmique | absent | js/materiel-creation.js:18 ; js/materiel-dissection-lecture.js:61, 1061 (1.214) | occasionnel | une phrase dans `apporter-grille` ou `sous-criteres` | à voir à l'écran |
| N7 | Placer les leçons dans le planificateur (grille des semaines, « Non planifié ») | absent | index.html:4335, 4507-4517 | occasionnel | une phrase dans `lecons` | non (le guide de la carte n'en parle pas) |
| N8 | Relier une évaluation à ses objectifs ; lire ses pastilles ✓ ⚠ ✕ ? ! | mentionné (`lecons` 11655 : « les objectifs qu'il sert ») | js/planification-carte.js:1752, 2701 (1.165) | occasionnel | deux phrases dans `lecons` | oui : guide de la carte (planification-carte.js:1907, 1964, 2009) |
| N9 | Gérer ses cartes dans la bibliothèque (importer, exporter, dupliquer, supprimer) | mentionné (`lecons` 11663-11664) | index.html:4278 (1.193) | rare | corriger la ligne existante | non |
| N10 | Télécharger un modèle pour faire relire sa carte par une IA | mentionné (`presentation` 10024, en général) | index.html:4294 (1.165) | rare | une phrase dans `lecons` | non |
| N11 | Autres réglages de la carte (recherche, longue-vue, cours rattaché, repères de semaine, tracé des liens, fond) | absent | index.html:4284-4290, 4319, 4349, 4359 | rare | aucune | raccourcis au bas du menu Vue |
| N13 | Marquer un travail diagnostique (ne compte dans aucun calcul) | absent | index.html:4813-4814 (1.202) | occasionnel | une phrase dans `creer-productions` | texte à l'écran |
| N14 | Échéances par groupe ; la case « Consignes transmises » décide qu'un travail est dû | absent | index.html:4912-4915 (1.153) | occasionnel (chaque production) | une phrase dans `creer-productions` | oui : popup.js:1003-1027 |
| N15 | Rédiger les consignes (blocs, « + Nouveau champ ») et « Préparer le PDF » d'une production | mentionné (`creer-grilles` 10956-10957, aperçu PDF de la grille) | index.html:4826-4889 (1.212) | occasionnel | deux phrases dans `creer-productions` | oui : popup « Aperçu et options du document PDF » (popup.js:1622) |
| N17 | Choisir le type de la grille (le défaut de ses critères) | mentionné (reste de D.4) | index.html:5096-5101 ; js/grilles.js:3126 | occasionnel | une phrase dans `creer-grilles` | popup « Type de critère » (popup.js:1128) |
| N19 | Ajouter, renommer, réordonner, retirer les sous-critères d'un critère holistique ou analytique | absent | js/grilles.js:4590-4599 (1.211) | occasionnel | une phrase dans `creer-grilles` | non |
| N22 | Critère algorithmique : écrire ce que l'étudiant·e lit (énoncés, palette de blocs) et régler les paliers qui le situent face à une norme | mentionné (`sous-criteres` 11204 : « la phrase du décompte écrite dans la grille ») | js/palette-algo.js:1-30 ; js/grilles.js:3772-3812 ; js/evaluation-projection.js:1-30 (1.215, 1.216) | occasionnel | deux ou trois phrases dans `sous-criteres` | l'aide du critère dans son gabarit (1.213), à voir à l'écran |
| N23 | Critère algorithmique : essayer la formule sur des copies fictives | absent | js/miroir-algo.js:1-10 (1.214) | occasionnel | une phrase dans `sous-criteres` | à voir à l'écran |
| N24 | Deux critères algorithmiques dans une grille : les codes vont au premier | absent | js/grilles.js:3852 (1.214) | rare | une phrase dans `sous-criteres` | oui : l'éditeur le dit |
| N27 | Cartouche : télécharger un modèle, exporter en texte ou en PDF, choisir les consignes du travail | mentionné (`presentation` 10024) | index.html:5358-5365, 5423 | rare | aucune | non |
| N29 | Appliquer une pratique au groupe-cours actif (sans pratique, pas de note) | mentionné (`groupe-cours` 10755, composante) | index.html:6183-6184 (1.153) | occasionnel (une fois par trimestre) | une phrase dans `pratique` | bulle (hover.js:317-318) |
| N30 | « Notes finalisées » (Note provisoire → Note finale sur le PDF) ; affichage de la note (chiffrée ou niveau) | absent | index.html:5772-5788 | occasionnel (fin de trimestre) | dans l'entrée neuve « Ce que lit l'étudiant·e » (E18) | texte à l'écran |
| N32 | Bibliothèques : partir d'un gabarit de départ, dupliquer, supprimer | mentionné (`creer-productions` 10913) | index.html:4621-4626, 5531 (1.202) | occasionnel | une phrase dans `partage` | oui : popup « Comment fonctionne la bibliothèque » (popup.js:404) |
| N35 | Recevoir une ressource d'un·e collègue (.lcz) : où l'importer ; elle arrive non modifiable, « Dupliquer » en fait sa copie | mentionné, lieu inexact (`collaboration` 12277 : « boutons d'import dans chaque section ») | index.html:9590-9615 ; js/partage-section.js:688 | occasionnel | corriger une phrase de `collaboration` (~30 mots) | texte à l'écran |

### Évaluation

| # | Geste | Classe | Preuve | Fréquence | Taille d'explication | Aide sur l'écran |
|---|---|---|---|---|---|---|
| E2 | Examiner les fichiers multiples d'un·e étudiant·e | mentionné (`preparer-importer` 11694) | index.html:8403-8404 ; js/liste-evaluations.js:1609-1613 | occasionnel | aucune | oui : popup.js:1509-1569 |
| E3 | Modifier un document : réordonner, retirer, pivoter, ajouter des pages, fusionner | mentionné (`preparer-importer` 11712 : réordonner, supprimer) | js/travaux-ui.js:6400-6432, 6858 | occasionnel | une phrase dans `preparer-importer` | non |
| E4 | Ouvrir les Propriétés d'une copie (renommer, marquer comme reprise) | absent | js/liste-evaluations.js:1574-1577, 1795, 1822 | occasionnel | **entrée neuve « Une copie au mauvais endroit »**, avec E5-E7 (~90 mots) | non |
| E5 | Réassigner une copie, ou une sélection de copies | absent | js/liste-evaluations.js:832, 1600-1603 ; index.html:8395 (1.154) | occasionnel | entrée neuve, avec E4 | non (la popup de la Liste n'en parle pas) |
| E6 | Restaurer une copie depuis la corbeille ; savoir qu'elle s'efface d'elle-même après 30 jours | absent | js/liste-evaluations.js:2732-2767, 2872 ; js/travaux-stockage.js:1013, 1145 | occasionnel | entrée neuve, avec E4 | non |
| E7 | Transférer des copies vers un autre groupe-cours | absent | js/liste-evaluations.js:1579-1582 ; js/travaux-ui.js:7339 | rare | entrée neuve, avec E4 | non |
| E8 | Ouvrir le journal d'une évaluation | absent | js/liste-evaluations.js:1552-1555, 1677-1680 | rare | une demi-phrase dans `annoter-evaluer` | non |
| E9 | Lire la Liste des évaluations (filtres, statuts, colonnes) | mentionné (badges de reprise dans `jetons-reprise` 12644-12649) | index.html:8338-8389 | hebdomadaire | aucune, si la popup est corrigée (voir § 4) | popup.js:554-588, en partie fausse |
| E11 | Créer ses propres tampons d'observation (« Personnaliser ») ; ils s'écrivent dans le bloc « Observations » de la rétroaction | mentionné (`annoter-evaluer` 11750 : « marqueurs visuels prédéfinis ») | js/travaux-outils.js:290, 360, 504, 2609 (1.156) | hebdomadaire | une phrase dans `annoter-evaluer` | non |
| E16 | Appliquer un jeton : depuis le panneau Évaluer ou les Propriétés de la copie | mentionné, chemin inexact (`jetons-reprise` 12631-12633, `gerer-jetons` 11883 : la Liste) | index.html:8623 ; js/liste-evaluations.js:1822 | occasionnel | corriger `jetons-reprise` (0 mot net) | non |
| E17 | Réécrire la rétroaction, puis « Régénérer » | mentionné (`annoter-evaluer` 11761, 11769) | index.html:8684-8701 (1.160) | hebdomadaire | une phrase dans `annoter-evaluer` | texte à l'écran (index.html:8699) |
| E18 | Produire le Dossier PDF d'une copie, et savoir ce que l'étudiant·e y lit (« Note provisoire », « Présentement, il faut se concentrer sur », « Points récurrents », jetons, travaux à venir) | absent (seul le PDF de l'Export Léa est nommé, `exporter-archiver` 11789) | js/liste-evaluations.js:1564-1567 ; js/travaux-export-pdf.js:832-850 ; js/synthese-retroaction-data.js:821-832 | hebdomadaire | **entrée neuve « Ce que lit l'étudiant·e »**, avec N30 (~110 mots) | non |
| E19 | Évaluer sans copie (présentation orale) et passer d'un élève à l'autre | absent | index.html:8512-8517 ; js/liste-evaluations.js:1539-1541 | occasionnel | une phrase dans `annoter-evaluer` | non |
| E20 | Chronométrer ses évaluations (pause) | mentionné (`preferences` 11292) | index.html:9406-9409 ; js/travaux-ui.js (chrono-btn-pause) | occasionnel | dans l'entrée neuve « Rythme de travail » (L6) | texte à l'écran |
| E23 | Ranger ses copies dans un dossier du disque | mentionné (`preparer-importer` 11715) | js/travaux-ui.js:984 ; index.html:9452-9458 | occasionnel | une phrase dans `preparer-importer` | oui : popup « Mode automatique ou manuel » (popup.js:1294) |

### Suivi

| # | Geste | Classe | Preuve | Fréquence | Taille d'explication | Aide sur l'écran |
|---|---|---|---|---|---|---|
| S2 | Ouvrir le panneau « Détails » : qui y entre (P < 65 %, A ou C sous la borne, Suivi, RàI 2-3, filtres cumulés) et dans quel ordre (score d'urgence) | absent | index.html:7504-7506 ; js/tableau-bord-apercu.js:326-371, 441-447 | hebdomadaire | deux ou trois phrases dans `tableau-bord` (~70 mots) | non (seul le `title` du bouton) |
| S3 | Suivre jusqu'à cinq étudiant·es sur le tableau de bord | absent | index.html:7515-7521 | occasionnel | une phrase dans `tableau-bord` | texte à l'écran |
| S4 | Lire le développement du groupe semaine par semaine | mentionné (`snapshots` 12140-12145) | index.html:7581-7613 | occasionnel | aucune | texte à l'écran |
| S5 | Lire les trajectoires par production | absent | index.html:7622-7692 | occasionnel | une demi-phrase dans `tableau-bord` | oui : texte à l'écran (7658-7674) |
| S6 | Exporter la synthèse des résultats finaux (CSV) | absent | index.html:7700-7706 ; js/export-resultats-finaux.js:178 | occasionnel (fin de trimestre) | une phrase dans `tableau-bord` ou `archivage` | texte à l'écran |
| S7 | Lire la liste des étudiant·es (filtres, colonnes, moyennes, r↔P) | mentionné (`diagnostics` 12871 : couleurs) | index.html:7733-7832 | hebdomadaire | aucune | oui : bloc « Comment lire l'en-tête » à l'écran, popup.js:364 |
| S9 | « Confirmer la séance » et « Verrouiller la saisie » ; une séance non saisie ne compte pas dans A | mentionné (glossaire « Assiduité », 13741) | index.html:8029-8033 ; js/saisie-presences.js:881, 1163 (1.163, 1.213) | hebdomadaire | deux phrases dans `saisie-presences` (~50 mots) | non (popup.js:301-328 n'en parle pas) |
| S10 | Imprimer le rapport de présences (feuille par groupe, à remplir au crayon) | absent | index.html:8027, 8082-8143 ; js/presences-rapport.js:296, 554 | occasionnel | une phrase dans `saisie-presences` | texte de la fenêtre |
| S12 | Copier le rapport d'un profil (texte) | absent | js/profil-etudiant-rapport.js:237, 323 ; js/profil-etudiant-sections-affichage.js:2687 | occasionnel | une phrase dans `guide-profil` | non |
| S13 | Télécharger le ZIP des travaux d'un·e étudiant·e | absent | js/profil-etudiant-sections-affichage.js:4568, 4597 | rare | une demi-phrase dans `guide-profil` | non |
| S14 | Poser le jugement final en dénotation (cibles atteintes, note, justification) | absent | js/pratiques/denotation-saisie-ui.js:1-17, 136-180 ; js/profil-etudiant-sections-affichage.js:2647-2651 | occasionnel (fin de trimestre, en DEN) | deux phrases dans `pratique` | non |
| S15 | Remplir la fiche confidentielle | mentionné (`guide-profil` 13003, `modes-formation` 11349) | js/profil-etudiant-confidentiel.js | occasionnel | une phrase dans `guide-profil` | oui : popup.js:1645 |
| S17 | Tenir les rencontres d'un service d'orthopédagogie : les trois questions, le DA provisoire en « 9 », les rencontres, le bilan | absent | js/rencontres.js:1-25, 140-150, 210-213 ; js/accueil.js:79, 181 ; js/navigation.js:353-370 | hebdomadaire (pour l'orthopédagogue) | **entrée neuve « Rencontres »** (~120 mots) | bulle de l'onglet seulement (hover.js:767) |
| S18 | Gérer la banque de questions flash | mentionné (`tirage-sort` 12558) | index.html:8218-8254 | occasionnel | une phrase dans `tirage-sort` | bulle (hover.js:839) |
| S20 | Former des équipes (taille, reste, sans les absent·es, « Retenir ces équipes ») | absent | js/equipes.js:1-14 ; index.html:8201-8208, 8296 (1.189) | occasionnel | deux phrases dans `tirage-sort` (~35 mots) | non |

### Labo

| # | Geste | Classe | Preuve | Fréquence | Taille d'explication | Aide sur l'écran |
|---|---|---|---|---|---|---|
| L2 | Masquer les notes par travail (note différée) | absent (trou D.5) | index.html:8965-8970 ; js/preferences.js:593 | occasionnel | deux phrases dans `rai-solo` | texte à l'écran |
| L3 | Observation des actions, indicateurs visuels des seuils, sensibilité des flèches, progression des artefacts | mentionné (`preferences` 11297, par leur nom) | index.html:8823-8905, 8953-8958 | rare | aucune | texte à l'écran, avec « où ça agit » |
| L5 | Explorer les pratiques : comparer deux ou trois pratiques sur des profils fictifs ou le groupe ; dériver, adopter, jeter une maquette | absent | js/comparateur-pratiques.js:1-35, 579-584 ; js/config.js:88 | occasionnel | **entrée neuve « Exploration des pratiques »** (~90 mots), ou un renvoi vers sa fenêtre « i » | oui : popup.js:1753-1784 |
| L6 | Rythme de travail : charge estimée, date objectif, rappels de pause, portrait temporel | absent | index.html:9055-9180 ; js/rythme.js:1-12 | occasionnel | **entrée neuve « Rythme de travail »** (~70 mots), avec E20 | non |
| L8 | Analyser plusieurs trimestres : extraire un codex data (Réglages), le charger (menu Codex), le lire dans Études | absent | index.html:3862, 8745-8755, 9571-9581 | rare | une phrase dans `labo`, une dans `export-import` | oui : popup « Extraire un codex data » (popup.js:1701) |
| L10 | Suivi longitudinal : inscrire un·e élève, refaire la copie, saisir ses résultats ultérieurs | absent | js/registre-longitudinal.js:1-70, 92-132 ; js/config.js:92 | rare | entrée neuve courte (~70 mots) ou paragraphe dans `labo` | texte à l'écran (registre-longitudinal.js:93-94) |

### Réglages

| # | Geste | Classe | Preuve | Fréquence | Taille d'explication | Aide sur l'écran |
|---|---|---|---|---|---|---|
| R2 | Préférences : système d'information scolaire, informations contextuelles des graphiques, mémoriser le dossier | absent | index.html:9357-9361, 9416-9465 | rare | aucune | texte à l'écran |
| R4 | Archives : « Vérifier », « Faire revenir » (copies, ou trimestre entier) | absent | js/reserve-reglages.js:79, 118, 212, 299 ; js/reserve-revenir.js:55 ; js/reserve-emprunter.js:72 (1.172, 1.181, 1.184) | occasionnel | entrée neuve « Archives » (K7) | oui, en une ligne : popup.js:1463-1505 |
| R6 | Export anonymisé pour la recherche : deux fichiers, dont une table de correspondance à garder privée | absent | index.html:9685-9696 ; js/trimestres.js:1940-2035 | rare | deux phrases dans `export-import` (~45 mots) | texte à l'écran, qui ne nomme pas la table |
| R7 | Réinitialiser toutes les données | mentionné (`export-import` 13938) | index.html:9713-9722 | rare | aucune | texte à l'écran (voir § 4) |
| R8 | Gestion avancée des ressources (auditer, remplacer, supprimer) | absent | index.html:9740-9820 | rare | aucune | oui : popup.js:1813 |

---

## 2. Les trous déjà relevés : où en sont-ils ?

| Trou | Relevé par | État au 23 oct. 2026 | Preuve |
|---|---|---|---|
| Comparateur de pratiques | 15 oct., « rien » | **ouvert** dans la section Aide (0 occurrence) ; une fenêtre « i » existe depuis la 1.202 | popup.js:1753-1784 ; L5 |
| Registre longitudinal et résultats ultérieurs | 15 oct., « rien » | **ouvert** (0 occurrence de « longitudinal » au sens du registre, 0 de « résultats ultérieurs ») | L10 |
| Panneau « Détails » du Suivi du groupe | 15 oct., « rien » | **ouvert** ; l'Aide donne ailleurs d'autres seuils (`verification-hebdo` 12092 : P < 60 %) | S2 |
| Ce que produit l'export anonymisé (table de correspondance, clé) | 15 oct., « rien » | **ouvert** ; la reprise côté code (#1060, #1074) n'est pas tranchée | R6 |
| Mention « Note provisoire » du Dossier PDF | 15 oct., « en partie » | **ouvert** ; le réglage qui la change (« Notes finalisées ») n'est pas non plus dans l'Aide | E18, N30 |
| D.4, les trois types de grille | 10 sept., en attente | **comblé en grande partie** : `creer-grilles` 10948 nomme les trois types, `bareme` 11019-11025 distingue holistique et analytique, `sous-criteres` traite l'algorithmique. Reste : le type de la grille, défaut de ses critères | N17 ; js/grilles.js:3126 (la référence `grilles.js:3252` de l'audit a bougé) |
| D.5, la note différée | 10 sept., en attente | **ouvert** (0 occurrence de « différée ») ; le réglage a déménagé de Réglages › Préférences à Labo › Outils d'observation | L2 ; js/preferences.js:593 (la référence `liste-evaluations.js:1153` a bougé) |
| DA provisoire en « 9 » | 15 oct., « en partie » | ouvert | S17 |
| Statut « décrochage » | 15 oct., « en partie » | ouvert ; la FAQ parle encore d'« Inactif » et d'« Abandon » | K17 |
| Chronomètre et « Portrait temporel » | 15 oct., « rien » | ouvert | L6, E20 |
| Un cours qui porte des données ne se supprime pas | 15 oct., « rien » | ouvert | K12 |
| Journal horodaté des évaluations | 15 oct., « rien » | ouvert | E8 |
| Les 20 derniers clics gardés pour le rapport de bogue | 15 oct., « rien » | ouvert dans la section Aide ; la bulle du bouton le dit maintenant | T14 |

---

## 3. L'inverse : ce que l'Aide décrit et qui n'existe plus

Liste et preuve seulement ; les lots par entrée détaillent.

1. **La vue « Aperçu des présences » et ses quatre cartes** (`presences-apercu`, 12724-12749). Le module n'a aucun appelant et ses cibles n'existent pas dans la page : js/presences-apercu.js:18-23.
2. **L'onglet « Aperçu »** comme lieu de navigation (`tableau-bord` 12704, `presences-apercu` 12731, `verification-hebdo` 12061, `validation-grille` 11530, `preferences` 11294, `architecture` 13503). Il n'existe plus : le tableau de bord est Suivi › Suivi du groupe (js/config.js:69 ; index.html:7478-7480).
3. **Le bouton « Régénérer » le calendrier** dans Cadre › Trimestre (`problemes` 13532 et 13549, `faq` 13652-13656). Aucun bouton de ce nom hors de l'Aide ; « Régénérer le calendrier » ne vit que dans des commentaires (js/trimestres.js:592, js/saisie-presences.js:53).
4. **L'assiduité « alternative »** (AE/AI ; « 3, 7 ou 12 derniers artefacts ») (`saisie-presences` 11832-11835, `verification-hebdo` 12065 et 12099, `profil-etudiant` 12813). Retirée : js/indices.js:589 (commentaire « #224 : Plus de branche alternatif », sommatif seulement), 632-633.
5. **Les cases « pratiques compatibles » d'une grille** (`creer-grilles` 10941). Retirées le 3 sept. 2026 : index.html:5083.
6. **Le bouton « Enregistrer les réglages »** de Labo › Outils d'observation (`grille-depistage` 11145, `validation-grille` 11499 et 11512). Retiré : chaque réglage s'enregistre au changement (index.html:8763-8765).
7. **L'« Aperçu aléatoire » d'une cartouche** (`creer-cartouches` 11101). Aucun bouton ni fonction : la seule trace est l'en-tête de js/cartouches.js:13.
8. **La carte « Parcours d'apprentissage » des Préférences** et les cases info-bulles, repères et « Mode clair » sous Navigation (`preferences` 11294-11295, 11303, 11308-11309). Les Préférences ont Expérience visuelle, Navigation, Outils de saisie, SIS et Sécurité (index.html:9338-9465) ; le thème est un choix sous Expérience visuelle (9367-9375) ; l'assistance se règle sur l'accueil. « Parcours d'apprentissage » n'existe dans aucun fichier js.
9. **La carte « Explorer la démo »** (`demo` 11385). Aucune chaîne de ce nom dans le code ; la démo s'active par la case « Données démo » (js/accueil.js:270-283).
10. **« Choisis un module »** dans la visite guidée (`parcours` 11416). Aucune chaîne de ce nom dans le code.
11. **« Jeton de reprise » dans les actions de la Liste des évaluations** (`jetons-reprise` 12631-12633 ; `gerer-jetons` 11883). Le menu « Actions… » n'en offre pas (js/liste-evaluations.js:1536-1621).
12. **Le statut « Actif » / « Inactif » / « Abandon »** (`faq` 13688). La colonne « Remarque » offre Aucune, Inactivité, Décrochage (js/trimestre-v2-etudiants.js:408-414).
13. **« Deux outils », « 2 cartes disponibles »** dans Animation (`tirage-sort` 12554-12556). Il y en a trois depuis la 1.189 (index.html:8201-8208).
14. **Le verrouillage des productions, grilles, échelles et cartouches** (glossaire « Verrouillage » 13891-13892, « Cartouche de rétroaction » 13758). Aucun geste ne le déclenche : `basculerVerrouillageCritere` n'a aucun appelant (js/grilles.js:1185, 2097) et le champ est déclaré inerte (js/cartouches.js:1523).
15. *À voir à l'écran* : **la bascule « Voir formules »** du profil (`guide-profil` 13109-13114). La fonction `toggleDetailsTechniques` n'a aucun appelant (js/profil-etudiant-sections-affichage.js:2008) ; l'icône voisine porte la classe `primo-aide` (2699).

---

## 4. Trouvé en chemin, hors de la section Aide

Disposition proposée pour chacun : *inscrire et continuer*.

- L'écran Grilles de critères dit que les grilles peuvent être « verrouillées une fois finalisées » (index.html:4970). Le geste n'existe pas (§ 3, point 14).
- Réglages › Données › Maintenance annonce « Triple confirmation requise + mot de passe «EFFACER» » (index.html:9722). Le point 10 du 15 octobre visait la bulle ; le texte de l'écran porte le même écart. À vérifier contre js/import-export.js:1959-1980.
- « Notes finalisées » dit qu'elle retire la liste « Artefacts à venir » (index.html:5788), alors que la 1.152 a fait dire « production » au PDF.
- La popup de la Liste des évaluations promet un export CSV des résultats filtrés et des statuts « complétées, en cours, à faire » (popup.js:567-580). La popup « Évaluer une production » renvoie à « Structure », ancien nom de Conception (popup.js:126).
- Les bulles d'onglet « Animation » (hover.js:790-791 : tirage et questions, pas les équipes) et « Rythme de travail » (hover.js:771-772 : « copies imposées vs restantes ») ne décrivent pas l'écran actuel. Labo › Exploration des pratiques et Labo › Suivi longitudinal n'ont pas d'entrée dans `TOOLTIPS_SOUS_NAV` (js/navigation.js:149-191).
- Le glossaire de l'Aide annonce « 48 termes » (13455) ; js/accompagnement-contenu-terme.js porte 59 `definition:` (à voir à l'écran : certains sont peut-être filtrés).

---

## 5. Les gestes couverts

Pour mémoire, avec l'entrée qui les explique. Leur exactitude revient aux autres lots.

- **En-tête et accueil** : mettre à jour et ouvrir son codex, changer d'appareil (`codex`, `faq`) ; nouveau codex, autre fichier, fermer (`codex`) ; mode anonymisé (`modes`, `modes-formation`, glossaire) ; thème (`preferences`) ; visite guidée et assistance (`prise-en-main`) ; changer de groupe-cours actif (`trimestre`, `groupe-cours`) ; données démo (`demo`).
- **Cadre** : créer un trimestre (`trimestre`) ; clore et rouvrir (`archivage`) ; créer un cours (`cours`) ; profil enseignant·e (`trimestre`) ; importer ou ajouter des étudiant·es (`etudiants`, `groupe`) ; exporter la liste (`etudiants`) ; horaire (`cours`, `horaire`) ; groupe-cours (`groupe-cours`) ; calendrier scolaire (`presences-calendrier`).
- **Conception** : apporter sa grille, couper, rattacher (`apporter-grille`) ; carte d'alignement, blocs, clones, Inspecteur, export du plan (`lecons`) ; créer une production (`creer-productions`) ; créer une grille (`creer-grilles`) ; barème (`bareme`) ; modifier les réponses d'un critère (`apporter-grille`) ; critère algorithmique, formule, codes, noms, pondérations (`sous-criteres`) ; échelle (`creer-echelles`) ; cartouche et import .txt (`creer-cartouches`, `collaboration`) ; pratique et assistant (`pratique`) ; jetons (`jetons-reprise`) ; importer depuis un autre trimestre (`partage`) ; partager un .lcz (`collaboration`).
- **Évaluation** : importer des copies (`preparer-importer`) ; annoter (`annoter-evaluer`) ; codes d'annotation (`annoter-evaluer`, `sous-criteres`) ; évaluer et verrouiller (`annoter-evaluer`) ; intégrité (`irrecevables`) ; exporter des travaux et Export Léa (`exporter-archiver`) ; espace de stockage (`exporter-archiver`).
- **Suivi** : indices, patterns et niveaux RàI du groupe (`tableau-bord`, `patterns`) ; saisir les présences (`saisie-presences`) ; profil (`profil-etudiant`, `guide-profil`) ; interventions (`planifier-rai`, `rai-absences`) ; tirage au sort (`tirage-sort`).
- **Labo** : outils d'observation (`grille-depistage`, `rai-solo`, `suivi-apprentissage`) ; modélisation (`modelisation`) ; études (`labo`) ; bilan réflexif (`bilan-reflexif`).
- **Réglages** : préférences (`preferences`) ; exporter sa config, ouvrir un codex (`export-import`) ; captures (`snapshots`) ; à propos (`apropos`).

---

## Bilan

**Gestes inventoriés : 144.** Couverts : 52. Mentionnés sans explication suffisante : 32. Absents : 60. Par onglet, la part absente la plus forte est au Cadre (13 sur 24) et au Suivi (10 sur 20) ; au Labo, la moitié des gestes sont absents (5 sur 10). Dans l'autre sens, 14 éléments décrits par l'Aide n'existent plus, plus un à voir à l'écran (§ 3).

**Les cinq trous qui comptent le plus**, et pourquoi je les retiens :

1. **Les rencontres d'un service d'orthopédagogie** (S17, avec K11). C'est une catégorie d'utilisatrices, que l'accueil invite à entrer (« Tu es orthopédagogue ? »), et l'Aide n'en dit rien : ni les trois questions, ni le DA provisoire, ni la différence avec Interventions. Hors de la bulle de l'onglet, aucune aide.
2. **Le panneau « Détails » du Suivi du groupe** (S2). C'est le seul endroit où l'application range des élèves par urgence. Il sert chaque semaine. Le trou est ouvert depuis le 15 octobre, et l'Aide donne ailleurs d'autres seuils.
3. **Ce que lit l'étudiant·e** (E18, avec N30). Le Dossier PDF, sa « Note provisoire » et le réglage « Notes finalisées » qui la change. Ce sont les mots que reçoivent les élèves, chaque semaine de correction, et en fin de trimestre.
4. **« Confirmer la séance » et « Verrouiller la saisie »** (S9). C'est un geste de chaque semaine. Une séance non saisie n'entre pas dans A : l'Aide ne le dit que dans le glossaire, et la fenêtre « i » des présences pas du tout.
5. **Les archives de fin de trimestre** (K7, K8, K9, R4). La chaîne livrée de la 1.172 à la 1.186 (archiver le trimestre, vérifier, renvoyer aux archives, archiver les copies, faire revenir) retire des données du navigateur. Elle repose sur la distinction clos/archivé que tu as tranchée, et la section Aide n'en parle pas. La fin du trimestre d'automne la rendra utile.

Juste derrière : réassigner une copie et la corbeille, qui s'efface seule après 30 jours (E4-E6) ; l'Exploration des pratiques (L5), déjà couverte par sa fenêtre « i ».

**Mots à ajouter, si on comble sobrement :**
- les cinq trous ci-dessus : environ **500 mots** (trois entrées neuves courtes, quatre ou cinq phrases dans `tableau-bord` et `saisie-presences`) ;
- tous les gestes hebdomadaires et occasionnels : environ **2 000 mots** ;
- en ajoutant les gestes rares : environ **2 300 mots**, soit 11 % des 21 000 mots actuels.

Les retraits du § 3 en libèrent une partie : l'entrée `presences-apercu` entière (92 mots), et des passages de `verification-hebdo`, `saisie-presences`, `creer-cartouches`, `preferences`, `demo` et `parcours`. La décision revient aux lots par entrée.

**Tests à prévoir.** Toute prose neuve passera sous sept sentinelles qui lisent toute la section Aide : tests/unit/sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js, -lot-D-ne-promet-pas-l-inexistant, -lot-E-exemples-restent-des-exemples, -15-oct-ce-que-fait-l-application, sentinelle-803-aide-pan-famille-pas-mecanique, sentinelle-862-aide-loi-25 et critere-algorithmique-mots. Parmi les entrées à compléter, six sont épinglées par des tests particuliers : `archivage` (sentinelle-1002-mots-clos), `sous-criteres` (critere-algorithmique-mots, unitaire et intégration), `apporter-grille` (materiel-aide-accompagnement, bareme-2-pieces-d-aide, sentinelle-aide-apporter-mon-materiel), `exporter-archiver` (aide-exporter-archiver-893, sentinelle-893), `preparer-importer` (sentinelle-878-aide-nommer-les-pages), et `export-import` (sentinelle-862-aide-loi-25). Les autres entrées visées ne sont épinglées par aucun test.
