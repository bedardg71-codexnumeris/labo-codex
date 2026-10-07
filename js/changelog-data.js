/**
 * changelog-data.js — Données structurées du changelog + rendu HTML
 *
 * Convention : 1 entrée par version MINEURE (cf. CLAUDE.md). Depuis 1.0.0
 * (3 juin 2026), versionnage sémantique (SemVer MAJEUR.MINEUR.CORRECTIF) ;
 * avant, schéma « Beta XX » (95, 96, 97, 98, 99).
 * Pas de dates. Max 6-8 items orientés utilisateur.
 * Couleurs : vert (features), bleu (améliorations), orange (corrections).
 *
 * ⚠ EXCEPTION ASSUMÉE — l'entrée 1.48 (décision Grégoire, 7 août 2026).
 * Elle CONSOLIDE le chantier alignement 1.32 → 1.48. Ce n'est pas un oubli à
 * réparer en la découpant : ces seize versions mineures ont vécu sur une
 * branche non mergée et ont été déployées d'un seul coup. Du point de vue de
 * l'utilisateur, qui passait de 1.31 à 1.48, elles sont UNE livraison — et
 * seize entrées auraient décrit un historique de développement qu'il n'a
 * jamais vécu. La règle « 1 entrée par mineure » vaut pour le rythme normal,
 * où chaque mineure est déployée seule.
 */
(function() {
    'use strict';

    var CHANGELOG = [
        {
            // 1.189 (#1039 : générateur d'équipes, barre d'outils d'animation) — lignes et titre validés
            // par Grégoire le 7 oct. 2026 à 16 h 21, par Cowork (plans de travail/MOTS-2026-10-07-1039-equipes.md),
            // posés tels quels.
            version: '1.189',
            couleur: 'vert',
            titre: 'Former des équipes en classe',
            items: [
                'Suivi › Animation&nbsp;: un nouvel outil forme des équipes au hasard, sans les absent·es du jour. Tu choisis la taille (2, 3 ou 4) et, s\'il reste des étudiant·es, comment les répartir&nbsp;; «&nbsp;Retenir ces équipes&nbsp;» évite ensuite de remettre ensemble les mêmes.',
                'Les trois outils d\'animation (questions flash, tirage au sort, équipes) se choisissent maintenant dans une barre à gauche.'
            ]
        },
        {
            // 1.188 (#975, #1030, #1031 : l'enregistrement, lots 3 et 5) — lignes validées par Grégoire
            // le 7 oct. 2026 à 7 h 57, par Cowork (relecture de la consigne du jour), posées telles
            // quelles. Titre de Claude Code.
            // 1.188.1 (#975 suite : « Annuler ») — ligne validée par Grégoire le 7 oct. 2026 à 10 h 18,
            // par Cowork, posée telle quelle (patch consolidé dans l'entrée 1.188).
            version: '1.188',
            couleur: 'vert',
            titre: 'Créer un trimestre par son formulaire',
            items: [
                'Cadre&nbsp;: «&nbsp;+ Nouveau trimestre&nbsp;» ouvre maintenant le formulaire du trimestre, comme pour ton premier. «&nbsp;Créer le trimestre&nbsp;» le crée et l\'active, sans fenêtre à remplir.',
                'Une suppression qui n\'a pas pu être enregistrée le dit maintenant («&nbsp;Non enregistré&nbsp;»), au lieu de réapparaître au rechargement suivant.',
                'iPad&nbsp;: une copie importée juste après un retour dans l\'application ne se perd plus.',
                'Cadre&nbsp;: pendant la création d\'un trimestre, «&nbsp;Annuler&nbsp;» ramène la fiche de ton trimestre actif sans rien créer.'
            ]
        },
        {
            // 1.187 (T3 du chantier du démo) — ligne validée par Grégoire le 7 oct. 2026, par Cowork,
            // posée telle quelle. Titre de Claude Code.
            version: '1.187',
            couleur: 'vert',
            titre: 'Retirer les copies de la démo',
            items: [
                'Démo&nbsp;: un bouton «&nbsp;Retirer les copies&nbsp;» dans le bandeau vert efface les copies importées dans la démo, sans toucher à tes vraies copies.'
            ]
        },
        {
            // 1.186 (#1028 : archiver les copies d'un trimestre clos) — ligne acceptée par Grégoire
            // le 5 oct. 2026 à 10 h 10 (MOTS-2026-10-05-1028-archiver-copies.md), posée telle quelle.
            // Titre de Claude Code.
            // 1.186.1 (#962, #986, #1029 : l'enregistrement, lot 1) — ligne de la consigne de Cowork
            // du 5 oct. 2026 à 13 h 44, posée telle quelle (patch consolidé dans l'entrée 1.186).
            // 1.186.2 (#982, #984 : l'enregistrement, lot 2) — ligne de la consigne de Cowork du
            // 5 oct. 2026 à 19 h 12, posée telle quelle (patch consolidé dans l'entrée 1.186).
            // 1.186.4 (#1032) — ligne de Cowork, acceptée par Grégoire le 6 oct. 2026, posée telle
            // quelle (patch consolidé dans l'entrée 1.186).
            // 1.186.6 (T2 du chantier du démo) — ligne validée par Grégoire le 6 oct. 2026, par Cowork,
            // posée telle quelle (patch consolidé dans l'entrée 1.186).
            version: '1.186',
            couleur: 'vert',
            titre: 'Archiver les copies d\'un trimestre clos',
            items: [
                'Archives&nbsp;: «&nbsp;Archiver les copies…&nbsp;» retire de l\'application les copies d\'un trimestre clos que son archive vérifiée garde à l\'identique&nbsp;; toutes ses données restent (résultats, grilles, rétroactions), et le codex s\'allège d\'autant. «&nbsp;Faire revenir&nbsp;» ramène les copies.',
                'Enregistrement&nbsp;: quand une écriture échoue, l\'application dit «&nbsp;Non enregistré&nbsp;» et le message reste, au lieu d\'afficher «&nbsp;Enregistré&nbsp;». Sur l\'iPad, elle rétablit seule sa liaison après une mise en arrière-plan, et le témoin s\'affiche au-dessus du clavier.',
                'Enregistrement&nbsp;: les gestes qui enregistraient sans rien dire affichent désormais «&nbsp;Enregistré&nbsp;», comme partout ailleurs&nbsp;; un échec dit «&nbsp;Non enregistré&nbsp;», et le message reste.',
                'Évaluation&nbsp;: une évaluation verrouillée ne demande plus, à chaque ouverture, s\'il faut garder ou remplacer sa rétroaction finale&nbsp;; elle reste telle qu\'enregistrée. La question revient si on la déverrouille.',
                'Démo&nbsp;: ton codex n\'emporte plus la démo, et ouvrir un codex ne la modifie plus.'
            ]
        },
        {
            // 1.185 (#1024, E3 : renvoyer un trimestre aux archives) — ligne de Cowork, acceptée par
            // Grégoire le 5 oct. 2026 (consigne de 7 h 51), posée telle quelle. Titre de Claude Code.
            version: '1.185',
            couleur: 'vert',
            titre: 'Renvoyer un trimestre aux archives',
            items: [
                'Archives&nbsp;: «&nbsp;Renvoyer aux archives&nbsp;» retire de l\'application un trimestre clos que son archive vérifiée garde à l\'identique&nbsp;; «&nbsp;Faire revenir&nbsp;» le ramène tel quel. Si le trimestre a changé depuis son archive, rien n\'est retiré.'
            ]
        },
        {
            // 1.184 (#1023, E2 : faire revenir un trimestre archivé) — ligne de Cowork, acceptée par
            // Grégoire le 4 oct. 2026 (consigne de 19 h 46), posée telle quelle. Titre de Claude Code.
            version: '1.184',
            couleur: 'vert',
            titre: 'Faire revenir un trimestre archivé',
            items: [
                'Dans Réglages › Données › Archives, «&nbsp;Faire revenir&nbsp;» ramène aussi un trimestre archivé entier dans l\'application, clos, tel qu\'il a été archivé, sans toucher aux autres trimestres, aux cours ni aux réglages.'
            ]
        },
        {
            // 1.183 (#1022, E1 : archiver un trimestre clos entier ; #1006) — ligne de Cowork, acceptée
            // par Grégoire le 4 oct. 2026 (consigne de 17 h 19), posée telle quelle. Titre de Claude Code.
            version: '1.183',
            couleur: 'vert',
            titre: 'Archiver un trimestre entier',
            items: [
                'Dans la bibliothèque des trimestres, un trimestre clos peut être archivé tout entier, avec ses données et ses copies, dans un fichier hors de l\'application, puis vérifié. Rien n\'est retiré de l\'application.'
            ]
        },
        {
            // 1.182 (#1002, lot A5 du chantier des archives) — ligne de Cowork, acceptée par
            // Grégoire le 4 oct. 2026 (consigne de 14 h 41), posée telle quelle. Titre de Claude Code.
            version: '1.182',
            couleur: 'bleu',
            titre: 'Un trimestre terminé se dit «&nbsp;clos&nbsp;»',
            items: [
                'Un trimestre terminé se dit maintenant «&nbsp;clos&nbsp;» : dans la bibliothèque des trimestres, «&nbsp;Clore&nbsp;» et «&nbsp;Rouvrir&nbsp;» remplacent «&nbsp;Archiver&nbsp;» et «&nbsp;Désarchiver&nbsp;», et clore un trimestre ne télécharge plus de fichier.'
            ]
        },
        {
            // 1.181 (#1000, lot A3 du chantier des archives) — ligne de Cowork, acceptée par
            // Grégoire le 4 oct. 2026 (consigne de 12 h 47), posée telle quelle. Titre de Claude Code.
            version: '1.181',
            couleur: 'vert',
            titre: 'Faire revenir les copies d\'une archive',
            items: [
                'Dans Réglages › Données › Archives, «&nbsp;Faire revenir&nbsp;» remet dans l\'application les copies d\'une archive vérifiée qui n\'y sont plus. Rien n\'est remplacé ni effacé.'
            ]
        },
        {
            // 1.180 (#1013) — ligne de Cowork, ACCEPTÉE par Grégoire le 4 oct. 2026 avant la
            // consigne de 11 h 04, posée telle quelle ; « ni dans l'export pour Léa » ajouté comme
            // la consigne le prévoit (le banc l'écarte de l'export pour Léa). Titre de Claude Code.
            version: '1.180',
            couleur: 'vert',
            titre: 'Un·e étudiant·e supprimé·e ne paraît plus dans tes listes',
            items: [
                'Quand tu supprimes un·e étudiant·e dans le Cadre, ses copies ne paraissent plus dans la Liste des évaluations ni dans «&nbsp;Annoter et évaluer&nbsp;», et ses données ne partent plus dans l\'export pour la recherche ni dans l\'export pour Léa. Rien n\'est effacé&nbsp;: ton codex garde tout.'
            ]
        },
        {
            // 1.179 (#1010) — ligne de Cowork, ACCEPTÉE par Grégoire le 4 oct. 2026 avant la
            // consigne de 9 h 28, posée telle quelle. Titre de Claude Code, dit à Grégoire au rendu.
            version: '1.179',
            couleur: 'vert',
            titre: 'Des consignes pas encore transmises, signalées à l\'évaluation',
            items: [
                'Quand tu ouvres l\'évaluation d\'une copie dont le groupe a la case «&nbsp;Consignes transmises&nbsp;» décochée, un bandeau te le signale, et un bouton coche la case.'
            ]
        },
        {
            // 1.178 (#1007, lot 2b) — ligne proposée par Claude Code (§ 4 de la demande de
            // relecture), ACCEPTÉE par Grégoire le 4 oct. 2026 à 0 h 07 (« oui sans le nombre »,
            // consigne de Cowork), posée telle quelle. Titre de Claude Code, dit à Grégoire au rendu.
            version: '1.178',
            couleur: 'vert',
            titre: 'Ton codex à jour, avant de retirer une ligne notée',
            items: [
                'Avant de retirer un critère, un sous-critère, un niveau d\'échelle ou une cible de dénotation déjà employés dans une évaluation, l\'application te propose de mettre ton codex à jour. Une ligne qu\'aucune évaluation n\'emploie se retire comme avant.'
            ]
        },
        {
            // 1.177 (#1007, lot 2a-2) — ligne proposée par Claude Code (§ 6 de la demande de
            // relecture), ACCEPTÉE par Grégoire le 3 oct. 2026 à 11 h 25 (« oui », consigne de Cowork),
            // posée telle quelle. Titre de Claude Code, dit à Grégoire au rendu.
            version: '1.177',
            couleur: 'vert',
            titre: 'Ton codex à jour, avant d\'autres effacements',
            items: [
                'La proposition de mettre ton codex à jour avant d\'effacer s\'étend à la fusion de copies, aux pages retirées d\'une copie, aux jetons de reprise, au remplacement d\'un élément du même nom, à la réinitialisation d\'une séance, à «&nbsp;Effacer tout&nbsp;» sur une page annotée, au registre longitudinal et aux résultats du bilan réflexif.',
                // 1.177.1 — ligne de Claude Code sur la consigne de Cowork de 17 h 48 (décision de Grégoire, « oui »).
                'Dans la saisie des présences, le bouton qui met tout le monde présent dit «&nbsp;✓&nbsp;»&nbsp;; son infobulle et le lecteur d\'écran disent «&nbsp;Mettre tout le monde présent&nbsp;».'
            ]
        },
        {
            // 1.176 (#1007, second lot, 2a-1) — ligne proposée par Claude Code (§ 7 de la demande de
            // relecture), ACCEPTÉE par Grégoire le 3 oct. 2026 à 7 h 56 (« oui », consigne de Cowork),
            // posée telle quelle. Titre de Claude Code, dit à Grégoire au rendu.
            version: '1.176',
            couleur: 'vert',
            titre: 'Avant d\'effacer, ton codex à jour',
            items: [
                'Avant d\'effacer une évaluation, une production, une grille, une pratique, une copie ou tout autre élément de ton matériel, l\'application te propose de mettre ton codex à jour, si ce n\'est pas déjà fait&nbsp;: il pourra te rendre ce que tu as supprimé.'
            ]
        },
        {
            // 1.175 (#1007, premier lot) — ligne proposée par Claude Code (§ 10 de la demande de
            // relecture), ACCEPTÉE par Grégoire le 3 oct. 2026 à 3 h 25 (« oui », consigne de Cowork),
            // posée telle quelle. Titre de Claude Code, proposé à Grégoire au rendu.
            version: '1.175',
            couleur: 'vert',
            titre: 'Avant de supprimer, un codex à part',
            items: [
                'Avant d\'effacer un trimestre, un groupe-cours, un groupe d\'élèves, toute ta liste ou toutes tes données, l\'application écrit d\'abord un codex à part, sous un autre nom&nbsp;: tes mises à jour suivantes n\'y touchent pas, et il te permet de revenir en arrière.'
            ]
        },
        {
            // 1.174 (#1012, l'avertissement) — titre et ligne proposés par Claude Code, relus par
            // Cowork, ACCEPTÉS par Grégoire le 1er oct. 2026 à 18 h 57 (« c'est ok », consigne de
            // release de Cowork), posés tels quels. Le titre perd son point final : usage de ce fichier.
            version: '1.174',
            couleur: 'vert',
            titre: 'Ton codex te prévient quand des copies lui manquent',
            items: [
                'Si des copies ne sont pas dans l\'application quand tu écris ton codex, une fenêtre le dit avant d\'écrire, puis l\'application te demande où ranger le fichier au lieu de remplacer l\'ancien. «&nbsp;Exporter une sélection&nbsp;» n\'écrit plus dans ton fichier de codex. Et le bilan d\'un codex ouvert incomplet dit, pour chaque cause, si le rouvrir peut ramener les copies.',
                // 1.174.1 (#1012, l'ancien .zip par la case) — titre et ligne proposés par Claude Code
                // (§ 11 de la demande de relecture), ACCEPTÉS par Grégoire le 2 oct. 2026 à 7 h 49
                // (« oui », consigne de Cowork de 7 h 50), posés tels quels. La ligne entre dans
                // l'entrée de sa mineure, son titre en tête.
                '<strong>Un ancien fichier ouvert dans Réglages ne fait plus perdre de copies.</strong> Quand tu ouvres un ancien fichier .zip par «&nbsp;Ouvrir un Codex…&nbsp;» et que tu coches «&nbsp;Fichiers travaux&nbsp;», ses copies s\'ajoutent maintenant aux tiennes au lieu de prendre leur place. Ton codex, à sa prochaine mise à jour, les contient toutes.',
                // 1.174.2 (#1012, la sélection) — titre et ligne proposés par Claude Code, ACCEPTÉS par
                // Grégoire le 2 oct. 2026 avec sa correction (« avant, il l'écrivait sans elles, sans
                // rien dire »), posés tels quels. La ligne entre dans l'entrée de sa mineure.
                '<strong>Une sélection exportée te prévient aussi.</strong> Quand des copies ne sont pas dans l\'application, «&nbsp;Exporter une sélection&nbsp;» le dit dans une fenêtre avant d\'écrire le fichier&nbsp;; avant, il l\'écrivait sans elles, sans rien dire.',
                // 1.174.3 (#1012, les quatre cases) — titre et ligne ACCEPTÉS par Grégoire le 2 oct.
                // 2026 à 11 h 22 (« oui », consigne de Cowork de 11 h 22), posés tels quels. La ligne
                // entre dans l'entrée de sa mineure, son titre en tête.
                '<strong>Ouvrir un ancien fichier ne remplace plus tes élèves, tes présences, tes notes ni tes annotations.</strong> Quand tu coches ces cases dans «&nbsp;Ouvrir un Codex…&nbsp;», ce que le fichier apporte de neuf s\'ajoute à ce que tu as&nbsp;; ce que tu as déjà ne change pas.',
                // 1.174.4 (#1012, l'élève désinscrit) — titre et ligne retouchés par Cowork, ACCEPTÉS
                // par Grégoire le 2 oct. 2026 à 12 h 54 (« oui », consigne de Cowork de 12 h 54),
                // posés tels quels. La ligne entre dans l'entrée de sa mineure, son titre en tête.
                '<strong>Un élève que tu supprimes ne revient plus par un ancien fichier.</strong> Quand tu ouvres un ancien fichier par «&nbsp;Ouvrir un Codex…&nbsp;», rien de lui n\'entre&nbsp;: ni sa fiche, ni ses copies, ni ses notes, ni ses présences, ni ses annotations. Cela vaut pour les élèves supprimés à partir de cette version&nbsp;; un élève en décrochage n\'est pas touché.',
                // 1.174.5 (#1012, les mots) — titre et ligne proposés par Claude Code, retouchés par
                // Cowork, ACCEPTÉS par Grégoire le 2 oct. 2026, posés tels quels. La ligne entre dans
                // l'entrée de sa mineure, son titre en tête.
                '<strong>La fenêtre d\'ouverture ne te conseille plus de supprimer ton codex.</strong> Après une ouverture complète, elle te dit de le garder&nbsp;: c\'est ta copie hors de l\'application. Au bilan de «&nbsp;Ouvrir un Codex…&nbsp;», les présences se comptent en dates de cours, et une ligne te dit combien d\'élèves que tu avais supprimés n\'ont pas été ramenés.',
                // 1.174.6 (#1014, le codex complet) — titre et ligne ACCEPTÉS par Grégoire le 2 oct.
                // 2026 à 19 h 12 (« oui », consigne de Cowork de 19 h 12), posés tels quels. La ligne
                // entre dans l'entrée de sa mineure, son titre en tête.
                '<strong>Ton codex emporte maintenant aussi ta corbeille et ta Modélisation.</strong> Les copies que tu as mises à la corbeille et les fichiers ouverts en Modélisation partent dans le codex, et reviennent quand tu l\'ouvres sur un autre appareil.'
            ]
        },
        {
            // 1.173 (lot I bis, #985, D9 : un seul terme) — titre et ligne VALIDÉS par Grégoire le
            // 1er oct. 2026, entre 2 h 07 et 2 h 12 (consigne du jour de Cowork), mot pour mot.
            version: '1.173',
            couleur: 'bleu',
            titre: 'La copie de secours cède la place au codex',
            items: [
                'Dans Réglages › Données, le bouton «&nbsp;Faire une copie de secours&nbsp;» disparaît&nbsp;: pour mettre ton travail en sûreté, mets ton codex à jour. Un fichier de copie de secours déjà fait s\'ouvre toujours, par «&nbsp;Ouvrir un Codex…&nbsp;», qui ouvre maintenant aussi un codex. Supprimer un trimestre demande un codex à jour.',
                // 1.173.2 (#1011) — titre et ligne proposés par Cowork (second verdict de relecture,
                // 1er oct. 2026, 11 h 30), ACCEPTÉS par Grégoire le même jour. Correctif : la ligne
                // entre dans l'entrée de sa mineure, son titre en tête.
                '<strong>Ouvrir un codex quand l\'espace manque.</strong> Quand l\'espace vient à manquer pendant l\'ouverture d\'un codex, l\'application va jusqu\'au bout et te dit combien de copies n\'ont pas pu revenir, au lieu d\'un simple «&nbsp;Erreur&nbsp;». Le message de refus d\'espace ne suppose plus que tu es sur un iPad.',
                // 1.173.3 (#1012, premier lot) — titre et ligne proposés par Cowork, ACCEPTÉS par
                // Grégoire le 1er oct. 2026 à 13 h 40 (« ça marche », consigne de release de Cowork),
                // posés tels quels. Même usage : la ligne entre dans l'entrée de sa mineure.
                '<strong>Le bilan d\'un codex incomplet reste à l\'écran.</strong> Quand des copies n\'ont pas pu revenir à l\'ouverture d\'un codex, une fenêtre le dit, explique comment les retrouver, et reste là jusqu\'à ta réponse. Dans Chrome, un fichier que tu as choisi puis refusé n\'est plus celui que «&nbsp;Mettre à jour le codex&nbsp;» réécrit.'
            ]
        },
        {
            // 1.172 (chantier des archives, lots A1 et A2, #998 et #999) — titre et ligne ACCEPTÉS par
            // Grégoire le 30 sept. 2026 (« j'accepte », consigne de release de Cowork de 16 h 59),
            // réécrits plus court par Cowork.
            version: '1.172',
            couleur: 'vert',
            titre: 'Vérifier une archive, copie par copie',
            items: [
                'Dans Réglages › Données › Archives, «&nbsp;Vérifier&nbsp;» relit une archive et dit si chaque copie y est, intacte. La liste garde la date de la vérification. Une archive faite avant cette version est à refaire&nbsp;: «&nbsp;Archiver…&nbsp;» range maintenant chaque copie avec son empreinte, sans charger tout le groupe en mémoire.'
            ]
        },
        {
            // 1.171 (lots J0, J0 bis et J0 ter, #988) — titre et ligne ACCEPTÉS par Grégoire le
            // 30 sept. 2026 (« accepté », consigne du jour de Cowork), après la porte passée sur l'iPad.
            version: '1.171',
            couleur: 'orange',
            titre: 'Un gros codex se met à jour sur l\'iPad',
            items: [
                'Sur l\'iPad, la mise à jour d\'un gros codex pouvait s\'arrêter en chemin&nbsp;: la page se rechargeait, ou le fichier n\'était pas enregistré au premier essai. Le fichier est maintenant préparé sans charger tes copies en mémoire, et beaucoup plus vite. Quand il est prêt, la fenêtre «&nbsp;Ton codex est prêt&nbsp;» te demande de toucher «&nbsp;Enregistrer&nbsp;» pour choisir où le ranger. Le fichier pèse un peu plus lourd (environ 3&nbsp;%)&nbsp;: tes copies y sont rangées telles quelles.'
            ]
        },
        {
            // 1.170 (lot I, #985, D8) — titre et ligne ACCEPTÉS par Grégoire le 29 sept. 2026 vers
            // 20 h 50, « Oui, telle quelle » (consigne du jour de Cowork).
            version: '1.170',
            couleur: 'orange',
            titre: 'Le rappel te propose de mettre ton codex à jour',
            items: [
                'À l\'ouverture, le rappel te propose maintenant de mettre ton codex à jour, au lieu de faire une copie de secours. Après une mise à jour réussie, ou si tu le fermes par la croix, il ne revient pas avant 14 jours. Sur l\'Accueil, la carte «&nbsp;Ton codex&nbsp;» y mène aussi.'
            ]
        },
        {
            // 1.169 (lot G, #988) — la ligne est le texte 6 ACCEPTÉ par Grégoire le 29 sept. 2026
            // (réponse relue avec Cowork). Titre retenu par Grégoire (1.169.1) : le codex se « met à
            // jour » ; « enregistré » veut seulement dire écrit dans l'application (D4, 26 sept.).
            version: '1.169',
            couleur: 'orange',
            titre: 'Le codex dit quand il n\'a pas pu être mis à jour',
            items: [
                'Si «&nbsp;Mettre à jour le codex&nbsp;» n\'arrive pas à enregistrer le fichier, l\'application le dit maintenant, avec sa taille, et te propose de réessayer ou de le télécharger à la place. Après un téléchargement, c\'est toi qui confirmes que le fichier est bien là.'
            ]
        },
        {
            // 1.168.0 (lot F de l'enregistrement, les mots D4) — titre et huit lignes ACCEPTÉS par
            // Grégoire le 29 sept. 2026, 6 h 08, mot pour mot (relecture finale de Cowork).
            version: '1.168',
            couleur: 'bleu',
            titre: 'Des mots qui disent vrai&nbsp;: enregistré, codex, copie de secours',
            items: [
                '«&nbsp;Enregistré&nbsp;» ne veut plus dire qu\'une chose&nbsp;: écrit dans l\'application, sur ton appareil.',
                'Le codex a son verbe&nbsp;: «&nbsp;Mettre à jour le codex&nbsp;». Son menu te dit si ton codex est à jour ou s\'il n\'a pas tes derniers changements.',
                'Au premier lancement de cette version, ton codex est marqué «&nbsp;pas à jour&nbsp;»&nbsp;: mets-le à jour une fois pour repartir d\'un état juste.',
                'L\'enregistrement automatique du codex toutes les 5 minutes est retiré&nbsp;: ton fichier ne change que lorsque tu le mets à jour.',
                'La sauvegarde de Réglages › Données s\'appelle maintenant «&nbsp;Copie de secours&nbsp;», sur l\'Accueil comme dans le rappel, qui t\'y mène directement.',
                'Le codex et la copie de secours n\'ont pas le même rôle. Le codex contient toutes tes données et les copies de tes étudiant·es&nbsp;; tu l\'emportes d\'un appareil à l\'autre, et son menu te dit s\'il est à jour. La copie de secours contient ce que tu coches (tout, avec «&nbsp;Toutes les clés&nbsp;»)&nbsp;: c\'est une photo de tes données, que tu gardes à part pour les retrouver si ton navigateur les perd.',
                'Archiver un groupe dit «&nbsp;Groupe archivé&nbsp;»&nbsp;; sous Safari, une archive annulée n\'apparaît plus dans la liste.',
                'L\'Aide, la foire aux questions et plusieurs écrans ont été relus selon ces mots.'
            ]
        },
        {
            // 1.167.0 (lot E3 de l'enregistrement : productions, interventions, volet confidentiel, réglages) —
            // titre et texte ACCEPTÉS par Grégoire le 28 sept. 2026, 19 h 46, mot pour mot (relecture de Cowork).
            version: '1.167',
            couleur: 'vert',
            titre: 'Productions et interventions&nbsp;: créer ou modifier',
            items: [
                'Productions, interventions, rencontres et le volet confidentiel du profil s\'enregistrent tout seuls, champ par champ&nbsp;; le témoin le dit. Pour en créer une nouvelle, un bouton nomme le geste («&nbsp;Créer la production&nbsp;», «&nbsp;Créer l\'intervention&nbsp;»), et l\'application te prévient si tu fermes la fiche ou recharges la page avant. «&nbsp;Annuler&nbsp;» devient «&nbsp;Fermer&nbsp;». Quand tu marques une intervention complétée, tu choisis si la présence de tes étudiant·es compense une absence au cours&nbsp;: rien ne s\'écrit dans l\'assiduité sans ce choix. Dans Réglages et dans ton auto-réflexion, le bouton «&nbsp;Enregistrer&nbsp;» disparaît&nbsp;: chaque réglage s\'écrit dès que tu le changes, et des seuils dans le désordre sont refusés sans rien enregistrer.'
            ]
        },
        {
            // 1.166.0 (lot E2 de l'enregistrement, le Cadre) — titre et texte ACCEPTÉS par Grégoire le
            // 28 sept. 2026, 14 h 03, mot pour mot (relecture finale de Cowork).
            version: '1.166',
            couleur: 'vert',
            titre: 'Cadre&nbsp;: créer ou modifier',
            items: [
                'Cadre&nbsp;: le trimestre, ton profil, un cours, un horaire, un groupe-cours ou la fiche d\'un·e étudiant·e s\'enregistrent tout seuls, champ par champ&nbsp;; le témoin le dit. Pour en créer un nouveau, un bouton nomme le geste («&nbsp;Créer le cours&nbsp;», «&nbsp;Ajouter l\'étudiant·e&nbsp;»), et l\'application te prévient si tu fermes la fiche ou recharges la page avant. «&nbsp;Annuler&nbsp;» devient «&nbsp;Fermer&nbsp;». Le DA d\'une fiche existante ne se modifie plus&nbsp;: il relie ses évaluations et ses présences.',
                // 1.166.1 (#977) — proposé par Claude Code, à relire par Grégoire.
                'Labo › Suivi longitudinal&nbsp;: en mode anonymisation, les élèves y sont désormais nommés «&nbsp;Élève R1&nbsp;», «&nbsp;Élève R2&nbsp;»… partout, rétroactions comprises. Leurs vrais noms s\'affichaient.'
            ]
        },
        {
            // 1.165.0 (carte d'alignement, #963 à #966) — titre et phrases ACCEPTÉS par Grégoire le 28 sept. 2026
            // (§ 12 de la relecture après rebase ; phrases de a133389c, mot pour mot).
            version: '1.165',
            couleur: 'vert',
            titre: 'Carte d\'alignement',
            items: [
                'Carte d\'alignement&nbsp;: Actions ▸ «&nbsp;Télécharger un modèle…&nbsp;» produit un fichier à coller dans l\'IA de ton choix, pour faire relire ta carte. Rien n\'est modifié dans ta carte. Le principe «&nbsp;Évaluer ce qu\'on enseigne, et enseigner ce qu\'on évalue, au même niveau d\'exigence.&nbsp;» s\'affiche sous le titre.',
                'Une évaluation se relie désormais à ses objectifs&nbsp;: dans son Inspecteur, coche ceux qu\'elle vérifie, dans sa leçon ou dans une leçon placée avant elle. Ses badges et ceux de tes objectifs suivent ces cases. Les liens «&nbsp;se vérifie par&nbsp;» déjà tracés restent en place et comptent comme avant.',
                'Chaque évaluation porte une pastille qui dit si ce qu\'elle vérifie a été enseigné avant elle&nbsp;: ✓ oui, ⚠ seulement après, ✕ jamais, ? impossible de le dire, ! aucun objectif coché.',
                'Le guide de la carte décrit ces nouveautés.'
            ]
        },
        {
            // 1.164.0 (lot E1 de l'enregistrement, Conception, D3) — phrase ACCEPTÉE par Grégoire le 27 sept. 2026
            // (tous les mots du § 5 de la demande de relecture, Nouvelles telles quelles). Titre : nom de D3.
            version: '1.164',
            couleur: 'vert',
            titre: 'Créer ou modifier',
            items: [
                'Conception&nbsp;: une grille, une échelle, une cartouche ou une pratique existante s\'enregistre toute seule, champ par champ, nom et jetons compris&nbsp;; le témoin le dit. Pour en créer une nouvelle, un bouton nomme le geste («&nbsp;Créer la grille&nbsp;»), et l\'application te prévient si tu fermes la fiche ou recharges la page avant. «&nbsp;Annuler&nbsp;» devient «&nbsp;Fermer&nbsp;».'
            ]
        },
        {
            // 1.163.0 (lot D de l'enregistrement, D2, D2 bis) — phrase ACCEPTÉE par Grégoire le 27 sept. 2026
            // (« Tous acceptés », texte de Cowork).
            version: '1.163',
            couleur: 'vert',
            titre: 'Confirmer la séance',
            items: [
                'Présences&nbsp;: tout changement dans une séance s\'enregistre tout seul, et le témoin le dit&nbsp;; les élèves que tu n\'as pas touché·es comptent présent·es. Une séance à laquelle tu n\'as pas touché le dit&nbsp;: «&nbsp;Séance non saisie&nbsp;». «&nbsp;Enregistrer&nbsp;» devient «&nbsp;Confirmer la séance&nbsp;», pour une séance où tout le monde était là.'
            ]
        },
        {
            // 1.162.0 (lot C de l'enregistrement, D1) — phrase ACCEPTÉE par Grégoire le 27 sept. 2026 (option 1) :
            // texte de Cowork, « statut de remise » remplacé par « intégrité » (aucun geste ne change le statut de remise).
            version: '1.162',
            couleur: 'vert',
            titre: 'Verrouiller l\'évaluation',
            items: [
                'Évaluer&nbsp;: ton évaluation s\'enregistre toute seule pendant que tu évalues, nombre d\'erreurs, nombre de mots et intégrité compris&nbsp;; le témoin le dit. Le bouton «&nbsp;Enregistrer&nbsp;» devient «&nbsp;Verrouiller l\'évaluation&nbsp;», et le cadenas fait la même chose&nbsp;: une évaluation compte dans la note une fois verrouillée. Dans la Liste, «&nbsp;Non enregistrée&nbsp;» devient «&nbsp;Non verrouillée&nbsp;».'
            ]
        },
        {
            // 1.161.0 (lot B de l'enregistrement, #618, #786) — phrase ACCEPTÉE par Grégoire le 27 sept. 2026,
            // telle quelle (« Oui, tels quels ») ; titre repris de ses mots, comme en 1.160.
            version: '1.161',
            couleur: 'vert',
            titre: 'Un même témoin',
            items: [
                'Quand l\'application enregistre une évaluation, un jeton, une rétroaction ou des présences, un même témoin dit «&nbsp;Enregistré&nbsp;» en bas de l\'écran. Si l\'écriture échoue, il dit «&nbsp;Non enregistré&nbsp;» et pourquoi, et reste affiché jusqu\'à la prochaine écriture réussie – au lieu d\'un message de réussite.'
            ]
        },
        {
            // 1.160.0 (lot A de l'enregistrement, #751, #736) — Nouvelles VALIDÉES par Grégoire le 26 sept. 2026,
            // telles quelles (texte de Cowork) ; titre repris de leurs premiers mots.
            version: '1.160',
            couleur: 'bleu',
            titre: 'Mode anonymisation',
            items: [
                'Mode anonymisation&nbsp;: tu travailles normalement et tout s\'enregistre&nbsp;; seuls les noms, et tout ce qui pourrait identifier un·e élève, sont cachés à l\'écran.',
                // 1.160.1 (#959) — ACCEPTÉ par Grégoire le 26 sept. 2026, tel quel (texte de Cowork).
                'Évaluer&nbsp;: une évaluation ouverte depuis la copie garde son statut d\'intégrité et ses notes quand tu l\'enregistres.',
                // 1.160.2 (#960) — ACCEPTÉ par Grégoire le 26 sept. 2026, tel quel (texte de Cowork).
                'Évaluer&nbsp;: ouvrir une copie ne remplace plus ta rétroaction finale réécrite à la main, et un commentaire de critère laissé vide reste vide.',
                // 1.160.3 (#961) — ACCEPTÉ par Grégoire le 26 sept. 2026, tel quel (texte de Cowork).
                'Évaluer&nbsp;: une rétroaction finale que tu as réécrite à la main n\'est plus remplacée quand tu changes un niveau&nbsp;; «&nbsp;Régénérer&nbsp;» la refait à la demande. Sur une copie évaluée avant le 26 septembre, l\'application te le demande une fois.',
                // 1.160.4 (accueil) — ACCEPTÉ par Grégoire le 27 sept. 2026, tel quel (texte de Cowork).
                'Accueil&nbsp;: «&nbsp;Par où commencer&nbsp;?&nbsp;» se lit en trois étapes, et un bouton ouvre les tutoriels de Labo Codex sur le blogue Codex Numeris.'
            ]
        },
        {
            // 1.159.0 (#941, lot S2) — VALIDÉ par Grégoire le 24 sept. 2026, tel quel (texte de Claude Code).
            version: '1.159',
            couleur: 'vert',
            titre: 'Sommative : le bilan d\'une grille en points',
            items: [
                // 1.159.13 (#957) — VALIDÉ par Grégoire le 26 sept. 2026 (texte de Cowork, sous-critères ajoutés, option b).
                'Grilles&nbsp;: un critère ou un sous-critère ajouté n\'est plus perdu quand on clique «&nbsp;Enregistrer&nbsp;» ensuite.',
                // 1.159.12 (#953) — VALIDÉ par Grégoire le 26 sept. 2026, tel quel (texte de Cowork, pratiques ajoutées).
                'Archives&nbsp;: une archive rouverte propose aussi ses grilles, ses échelles et ses pratiques, et ses cartouches ne s\'y disent plus «&nbsp;grille manquante&nbsp;».',
                // 1.159.11 (#643, #654, #637) — VALIDÉ par Grégoire le 26 sept. 2026, tel quel (texte de Cowork).
                'Partage et archives&nbsp;: les cartouches arrivent entières. Un fichier partagé dit de quel trimestre viennent ses cartouches, une production importée retrouve sa cartouche, et une archive rouverte les montre toutes.',
                // 1.159.10 (#888) — VALIDÉ par Grégoire le 25 sept. 2026, tel quel (texte de Cowork).
                'Horaire&nbsp;: dans une séance, le mot «&nbsp;pér.&nbsp;» reste affiché à côté du nombre de périodes, même une fois la case remplie.',
                // 1.159.9 (#583, #680) — VALIDÉ par Grégoire le 25 sept. 2026, tel quel (texte de Cowork, complété avec lui).
                'Partage&nbsp;: une échelle partagée emporte maintenant ses repères de maîtrise, les descriptions de ses niveaux, leur étiquette SOLO et sa discipline. Chez la personne qui la reçoit, le bilan de la rétroaction («&nbsp;Présentement…&nbsp;», «&nbsp;Points récurrents&nbsp;») fonctionne comme chez toi. Les échelles reçues avant cette version n\'ont pas leurs repères&nbsp;: on peut les poser dans l\'éditeur d\'échelle.',
                // 1.159.8 (#950) — VALIDÉ par Grégoire le 25 sept. 2026, tel quel (texte de Claude Code, corrigé avec lui).
                'Export Léa en mode anonymisation&nbsp;: le PDF se nomme «&nbsp;Élève 32_Artefact-2_Evalue.pdf&nbsp;», et sa page de rétroaction n\'affiche plus que «&nbsp;Élève 32&nbsp;» et le groupe, sans nom ni numéro de DA.',
                // 1.159.7 (#947) — VALIDÉ par Grégoire le 25 sept. 2026, tel quel (texte de Cowork).
                'Évaluer&nbsp;: dans la visionneuse, une copie déjà évaluée ne reçoit plus la dernière grille, échelle ou cartouche que tu as utilisée ailleurs&nbsp;; elle garde ce qui a été enregistré avec elle.',
                // 1.159.6 (#948, #949) — VALIDÉ par Grégoire le 25 sept. 2026, tel quel (texte de Claude Code).
                'Exporter des travaux en mode anonymisation. L\'archive ne contient plus le nom ni le numéro de DA des élèves&nbsp;: dossiers «&nbsp;Élève 32&nbsp;», copies «&nbsp;Élève 32_Artefact 1_1.pdf&nbsp;», et les rétroactions jointes remplacent les prénoms. Ce qui reste hors d\'atteinte&nbsp;: ce qui est écrit à l\'intérieur d\'une copie, et un nom de famille tapé dans une rétroaction.',
                'Arrêter un export. Pendant un export de travaux, le bouton «&nbsp;Arrêter l\'export&nbsp;» remplace «&nbsp;Télécharger&nbsp;». À l\'arrêt, rien n\'est téléchargé.',
                // 1.159.5 (#945) — VALIDÉ par Grégoire le 25 sept. 2026, tel quel (texte de Cowork).
                'Confirmations&nbsp;: quand une action efface ou remplace quelque chose, la touche Entrée choisit le bouton sélectionné, «&nbsp;Annuler&nbsp;» au départ. Pour confirmer, clique sur le bouton rouge.',
                // 1.159.4 (#946) — VALIDÉ par Grégoire le 25 sept. 2026, tel quel (texte de Cowork).
                'Évaluer&nbsp;: ouvrir une copie déjà évaluée garde la cartouche avec laquelle elle a été évaluée, même quand la production en prévoit une autre.',
                // 1.159.3 (#944) — VALIDÉ par Grégoire le 24 sept. 2026, tel quel (texte de Claude Code).
                'Évaluer&nbsp;: sur une copie déjà évaluée, choisir une autre cartouche au menu propose maintenant de remplacer ses commentaires par ceux de la nouvelle cartouche. Tu confirmes ou tu gardes les commentaires actuels&nbsp;; une cartouche retouchée ailleurs ne change toujours pas une copie déjà évaluée.',
                // 1.159.2 (#943) — VALIDÉ par Grégoire le 24 sept. 2026, tel quel (texte de Claude Code).
                'Annoter&nbsp;: une ligne (fléchée ou non) qu\'on vient de tracer montre aussitôt ses poignées. Tire son milieu pour la courber, ou une extrémité pour la déplacer, sans passer par l\'outil Sélection.',
                // 1.159.1 (#941, lot S3) — VALIDÉ par Grégoire le 24 sept. 2026, tel quel (texte de Claude Code).
                'La rétroaction de ton élève ne montre plus de jetons que ta pratique n\'offre pas, n\'écrit plus «&nbsp;Présentement, il faut se concentrer sur&nbsp;» quand rien ne suit, et n\'affiche plus l\'étiquette «&nbsp;Contexte&nbsp;» vide quand la copie n\'a pas de cartouche.',
                'Avec une grille en points, le bilan de ton élève nomme maintenant chaque critère sous 60&nbsp;%, avec sa définition, dans «&nbsp;Présentement, il faut se concentrer sur&nbsp;», et «&nbsp;Points récurrents&nbsp;» dit depuis combien de productions il revient. Un critère à 60&nbsp;% ou plus n\'y figure pas.'
            ]
        },
        {
            // 1.158.0 (#941, lot S1) — VALIDÉ par Grégoire le 24 sept. 2026, tel quel (texte de Claude Code).
            version: '1.158',
            couleur: 'vert',
            titre: 'Sommative : une grille en points se note sans échelle',
            items: [
                'Une grille entièrement en points se note maintenant sans échelle de performance, et aucune échelle n\'est plus choisie à ta place. Ton élève lit ses points, «&nbsp;Note de la copie&nbsp;» en tête de sa rétroaction et sa note provisoire, sans aucun nom de niveau, même sur les copies déjà évaluées.'
            ]
        },
        {
            // 1.157.0 (#942) — VALIDÉ par Grégoire le 24 sept. 2026, tel quel (texte de Cowork, titre de Claude Code).
            version: '1.157',
            couleur: 'vert',
            titre: 'Profil : la leçon manquée',
            items: [
                'Profil › Engagement&nbsp;: chaque absence nomme la leçon prévue ce jour-là dans ta carte d\'alignement, pour voir d\'un coup d\'œil la matière manquée.'
            ]
        },
        {
            // 1.156.0 (#895) — VALIDÉ par Grégoire le 23 sept. 2026 (deux retouches de Cowork : « étudiant·e » dans l'aide ; « maintenant » et la phrase du nettoyage dans Nouvelles).
            version: '1.156',
            couleur: 'bleu',
            titre: 'Exporter et archiver : une seule carte pour exporter',
            items: [
                '«&nbsp;Exporter des travaux&nbsp;» remplace maintenant «&nbsp;Trimestre complet&nbsp;». Laisse «&nbsp;Toutes&nbsp;» et «&nbsp;Tous&nbsp;» et clique «&nbsp;Télécharger&nbsp;» : tu reçois l\'archive de tout le groupe, sans avoir à choisir d\'abord une production ou un·e étudiant·e. Deux options s\'ajoutent : ranger les dossiers par étudiant·e et production, ou par étudiant·e seulement, et compresser l\'archive. Toute copie mise dans l\'archive est marquée «&nbsp;exportée&nbsp;», archive complète comprise&nbsp;: «&nbsp;Proposer un nettoyage&nbsp;» peut donc te la proposer, et rien n\'est retiré sans ta confirmation.',
                // 1.156.1 (#830) — VALIDÉ par Grégoire le 23 sept. 2026, tel quel (proposition de Cowork).
                'Suivi du groupe&nbsp;: quand aucune séance de l\'horaire ne porte son nombre de périodes, la barre Assiduité le dit et indique où le saisir, au lieu de rester vide.',
                // 1.156.2 (#760, #759) — VALIDÉ par Grégoire le 24 sept. 2026, tel quel (proposition de Cowork).
                'Rétroaction&nbsp;: le bloc «&nbsp;Observations&nbsp;» liste maintenant les tampons que tu poses, avec tes noms, tes textes et tes catégories, comme la rétroaction spécifique. Le texte copié vers Léa garde ses phrases séparées.',
                // 1.156.3 (#939) — VALIDÉ par Grégoire le 24 sept. 2026 (version ajustée : aucune réécriture par critère n'existe).
                'Rétroaction&nbsp;: le texte copié vers Léa donne pour chaque critère le même commentaire que le PDF, celui qui a été enregistré avec l\'évaluation&nbsp;; une cartouche retouchée après coup ne le change plus. Ni l\'un ni l\'autre n\'écrit «&nbsp;[Non défini]&nbsp;».',
                // 1.156.4 (#940) — VALIDÉ par Grégoire le 24 sept. 2026, tel quel (proposition de Cowork).
                'Synthèse de rétroaction&nbsp;: «&nbsp;Présentement, il faut se concentrer sur&nbsp;» donne de nouveau la définition de chaque critère à travailler. «&nbsp;Points récurrents&nbsp;» nomme ce qui revient d\'une copie à l\'autre, dès deux productions, et depuis combien de productions.'
            ]
        },
        {
            // 1.155.0 (#695, élargie à l'évaluation le 22 sept. 2026) — VALIDÉ par Grégoire le 22 sept. 2026.
            version: '1.155',
            couleur: 'vert',
            titre: 'Carte d\'alignement : la date réelle dans l\'Inspecteur',
            items: [
                'L\'Inspecteur d\'une leçon, et de l\'évaluation qu\'elle contient, affiche la date où elle aura lieu, une ligne par groupe. Quand la date n\'existe pas (séance non fixée, congé, horaire non saisi), il le dit au lieu d\'en deviner une.',
                // 1.155.1 (#714, lot N3) — VALIDÉ par Grégoire le 22 sept. 2026 ; « l'étudiant·e » VALIDÉ par Grégoire le 23 sept. 2026 (option 2 : sans « et ouvrir un profil ne modifie plus rien »).
                'Profil de l\'étudiant·e, «&nbsp;Développement des habiletés&nbsp;»&nbsp;: le détail du calcul donne le nombre d\'évaluations retenues par ta pratique, et les mêmes évaluations que la carte de la note. «&nbsp;Calcul impossible&nbsp;» n\'apparaît plus sous une note calculée.',
                // 1.155.2 (#716, lot N2) — VALIDÉ par Grégoire le 23 sept. 2026 au matin (relayé par la relecture de Cowork) ; « l'étudiant·e » VALIDÉ par Grégoire le 23 sept. 2026.
                'Suivi de l\'étudiant·e&nbsp;: la courbe de performance suit maintenant la note du cours, semaine par semaine, en pratique Standards, sommative ou par spécifications. En dénotation, la courbe n\'a plus de point&nbsp;: elle affichait un barème qui n\'était pas ta note. Les semaines déjà enregistrées se mettent à jour avec «&nbsp;Recalculer les captures&nbsp;» (Réglages › Captures et recherche).',
                // 1.155.4 (#713 volet plancher, #854 volet spécifications, lot N4) — « un·e étudiant·e » VALIDÉ par Grégoire le 23 sept. 2026 ; VALIDÉ par Grégoire le 23 sept. 2026 (option A, telle quelle).
                'Pratique par spécifications&nbsp;: un·e étudiant·e qui n\'atteint aucun forfait n\'a plus de note tant que ta pratique n\'en prévoit pas une. Le profil, le Suivi et l\'export écrivent «&nbsp;—&nbsp;» et en disent la raison. Pour donner une note dans ce cas, ajoute un forfait sans travaux requis (Conception → Pratiques de notation). Rouvrir la pratique dans l\'assistant ne change plus son seuil, ses forfaits ni ses jetons.',
                // 1.155.5 (#717, lot N5) — VALIDÉ par Grégoire le 23 sept. 2026 (option B : « étudiant·es », jamais « élèves »).
                'Pratique par dénotation&nbsp;: les cibles s\'éditent maintenant une par ligne. Déplacer, renommer ou retirer une cible ne déplace plus les coches déjà faites. Si tu retires une cible déjà cochée, l\'application te dit laquelle et pour combien d\'étudiant·es avant d\'enregistrer.',
                // 1.155.5 (#936, bug testeur) — VALIDÉ par Grégoire le 23 sept. 2026 (tel quel).
                'Annoter&nbsp;: une fois zoomé, on peut maintenant défiler jusqu\'au bord gauche du travail. La roue de la palette d\'annotation ne se transforme plus en «&nbsp;−&nbsp;» quand on replie la palette.',
                // 1.155.6 (#937, retour testeur) — VALIDÉ par Grégoire le 23 sept. 2026 (« ok », tel quel).
                'Annoter&nbsp;: le chronomètre revient dans la barre du haut, à droite, au lieu d\'occuper une palette sur la copie. Pour lui faire de la place, trois éléments quittent cette barre&nbsp;: les flèches pour passer d\'un élève à l\'autre (le carrousel fait ce geste), et les boutons «&nbsp;pleine largeur&nbsp;» et «&nbsp;pleine hauteur&nbsp;». La couleur du fond se choisit maintenant dans le menu Actions.',
                // 1.155.7 (#935 volet nom, #900, lot N6) — VALIDÉ par Grégoire le 23 sept. 2026
                'Pratiques de notation&nbsp;: le seuil d\'acceptabilité d\'une pratique par spécifications ne change plus quand tu l\'enregistres dans Conception&nbsp;→ Pratiques de notation (un seuil de 70 y passait à 75 sans avertissement). Une pratique par dénotation doit avoir au moins une cible. L\'assistant ne pose plus quatre questions dont la réponse ne servait nulle part.'
            ]
        },
        {
            // 1.154.0 (#932, #934 ; #933 refusé) — deux items VALIDÉS par Grégoire le 22 sept. 2026 (§6 du rapport du lot).
            version: '1.154',
            couleur: 'vert',
            titre: 'Réassigner une copie : un seul geste, qui montre la copie, et en lot',
            items: [
                'Déplacer une copie vers une autre production passe par un seul geste, qui montre la copie (vignette, nom du fichier) et demande avant de remplacer un fichier existant — en nommant les deux.',
                'Dans la Liste des évaluations, coche plusieurs copies et réassigne-les d\'un coup&nbsp;: une seule question compte, nomme les fichiers et les conflits.',
                // 1.154.1 — porte terrain 1.154.0, décision 3.1 de Grégoire (« aligner »), mot validé.
                'Quand l\'ancienne production garde une évaluation, la question le dit avec les mêmes mots que le geste en lot&nbsp;: l\'évaluation déjà faite n\'aura plus de copie liée, et elle est conservée.'
            ]
        },
        {
            // 1.153.0 (lots N1a + N1b, #710 à #713, #719) — phrase VALIDÉE par Grégoire le 21 sept. 2026 (question fermée), telle quelle.
            version: '1.153',
            couleur: 'bleu',
            titre: 'Pratiques de notation : sans pratique assignée, aucune note par défaut',
            items: [
                'Un groupe-cours sans pratique de notation assignée n\'affiche plus de note calculée par défaut&nbsp;: la complétion et la performance se lisent «&nbsp;—&nbsp;», aucun élève n\'est signalé pour cette raison, et le profil indique où choisir la pratique (Conception → Pratiques de notation). Rien n\'est effacé&nbsp;: les notes reviennent dès qu\'une pratique est assignée.',
                // 1.153.1 (#930, retours de Grégoire du 22 sept. 2026) — mots à valider par lui avant le push.
                'Productions étudiantes&nbsp;: la date d\'échéance se pose d\'avance, même si «&nbsp;Consignes transmises&nbsp;» est décochée. C\'est la case seule qui décide que la production est due (calendrier, complétion, performance). Le champ ne se grise plus.',
                'Productions étudiantes&nbsp;: le tri «&nbsp;par échéance&nbsp;» de la liste de gauche fonctionne de nouveau (il échouait en silence depuis mai).',
                // 1.153.2 (#931) — mots à valider par Grégoire avant le push.
                'Liste des évaluations&nbsp;: sur une ligne sans copie, «&nbsp;Réassocier&nbsp;» ne prend plus en silence une autre copie de l\'élève. Une copie se réassocie depuis sa propre ligne, et la question «&nbsp;Remplacer l\'existant&nbsp;?&nbsp;» nomme maintenant les deux fichiers.'
            ]
        },
        {
            // Entrée VALIDÉE par Grégoire le 21 sept. 2026 (#909, #903) — « Deux items » ; l'item 2 repris par lui à 9 h 01
            // (les reprises ont aussi quitté la branche Standards).
            // Le 3e item (#908, en-tête de l'export recherche, 1.152.1) est VALIDÉ par Grégoire le 21 sept. 2026.
            version: '1.152',
            couleur: 'bleu',
            titre: 'Pratiques de notation : l\'écran promet ce qui s\'applique',
            items: [
                'Adopter un modèle Standards dans un trimestre qui n\'a aucune échelle de performance&nbsp;: l\'application le dit, indique où créer l\'échelle (Conception → Échelles de performance) et n\'adopte rien, au lieu d\'adopter un modèle qui ne pouvait pas calculer la note.',
                'L\'assistant de pratique ne propose plus le plafonnement ni le remplacement pour une sommative, ni le choix des reprises&nbsp;: rien ne les appliquait à la note. Le Comparateur ne les annonce plus «&nbsp;Actif&nbsp;». Tes pratiques déjà créées ne perdent rien.',
                'Export anonymisé pour la recherche&nbsp;: l\'en-tête du fichier porte maintenant la vraie version de Labo Codex et décrit les indices A, C et P tels que l\'application les calcule.',
                // 1.152.2 (#715, #723) — phrase VALIDÉE par Grégoire le 21 sept. 2026, telle quelle.
                'Une pratique Standards réglée sur «&nbsp;tous&nbsp;» compte maintenant toutes les productions évaluées, au profil comme à l\'export&nbsp;: le profil s\'arrêtait au nombre à retenir. Le fichier des résultats finaux titre sa colonne «&nbsp;Note finale (arrondie à l\'entier)&nbsp;»&nbsp;; les notes elles-mêmes ne changent pas.',
                // 1.152.3 (#553) — phrase VALIDÉE par Grégoire le 21 sept. 2026 (question fermée), telle quelle.
                'Profil d\'un·e élève › forces et défis&nbsp;: un critère dont le nom commence par «&nbsp;Français&nbsp;» («&nbsp;Français écrit&nbsp;», par exemple) y figure de nouveau&nbsp;; s\'il est le plus faible, il devient le défi principal et la cible d\'intervention. Deux critères de français (oral, écrit) ont maintenant chacun leur valeur. Les interventions déjà enregistrées gardent leur bilan.',
                // 1.152.4 (F4-1 de l'audit du 21 sept.) — phrase VALIDÉE par Grégoire le 21 sept. 2026 (question fermée), telle quelle.
                // 1.152.6 (trois derniers « artefact » du PDF) — dernière phrase AJOUTÉE, validée par Grégoire le 21 sept. 2026 (question fermée).
                'Bilan de l\'élève (rétroaction et PDF de synthèse)&nbsp;: la phrase adressée à qui maîtrise tous les critères deux productions de suite ne parle plus d\'«&nbsp;artefact&nbsp;» ni du «&nbsp;niveau É&nbsp;», des mots propres à un seul cours. Dans le PDF, une production sans titre s\'appelle maintenant «&nbsp;Production&nbsp;». L\'en-tête, la rangée de note et la liste «&nbsp;à venir&nbsp;» du PDF disent aussi «&nbsp;production&nbsp;».',
                // 1.152.5 (demies de l'indice P) — phrase VALIDÉE par Grégoire le 21 sept. 2026 (question fermée), telle quelle.
                'Une note finale exactement en ,5 s\'arrondit maintenant toujours vers le haut (57,5&nbsp;→&nbsp;58), au fichier des résultats finaux, au profil et au Comparateur&nbsp;: quatre valeurs (14,5&nbsp;· 28,5&nbsp;· 56,5&nbsp;· 57,5) descendaient par erreur. Les autres notes ne changent pas.'
            ]
        },
        {
            // Entrée PROPOSÉE le 20 sept. 2026 (#926, #927, #928) — le mot « évaluation non enregistrée » est validé par
            // Grégoire ; la prose de l'entrée reste à valider.
            // Le 5e item (#929, planificateur) est VALIDÉ par Grégoire le 20 sept. 2026 ; les quatre premiers restent à valider.
            // Le 6e item (#893, aide de « Exporter et archiver ») est VALIDÉ par Grégoire le 20 sept. 2026.
            version: '1.151',
            couleur: 'orange',
            titre: 'Une évaluation non enregistrée se voit, et s\'enregistre',
            items: [
                'Évaluer&nbsp;: quand tu consultes une évaluation non verrouillée juste après une évaluation verrouillée, le bouton «&nbsp;Enregistrer&nbsp;» ne reste plus grisé sous un cadenas ouvert. Tu peux l\'enregistrer, et elle compte alors dans la note et dans la complétion.',
                'Le mot «&nbsp;brouillon&nbsp;» disparaît&nbsp;: il laissait croire que c\'était le travail de l\'élève qui était un brouillon. L\'application dit maintenant «&nbsp;évaluation non enregistrée&nbsp;», au profil, dans la note de session et dans le message qui refuse une évaluation incomplète. La règle ne change pas&nbsp;: tant qu\'elle n\'est pas enregistrée, une évaluation ne compte nulle part.',
                'Liste des évaluations&nbsp;: une évaluation non enregistrée porte le badge «&nbsp;Non enregistrée&nbsp;» au lieu de «&nbsp;Évalué&nbsp;», et le filtre Statut offre «&nbsp;Non enregistrée&nbsp;» pour les retrouver d\'un geste.',
                'Cadre&nbsp;› Trimestre&nbsp;: le menu et la liste des trimestres suivent le calendrier, du plus ancien au plus récent — l\'hiver avant l\'automne d\'une même année — et non plus l\'ordre où tu les as créés.',
                'Dans le planificateur de la carte, la zone «&nbsp;Non planifié&nbsp;» reste visible même quand tout est planifié&nbsp;: on peut toujours y glisser une leçon pour la retirer du calendrier, et le bouton de disposition la déplace à gauche ou sous la grille.',
                'Aide&nbsp;› Exporter et archiver&nbsp;: la page décrit maintenant les trois exports que l\'écran offre vraiment. Dans l\'écran, le bloc «&nbsp;Espace de stockage&nbsp;» est écrit en français courant, accents compris.',
                'L\'aide de «&nbsp;Préparer et importer les travaux&nbsp;» dit comment nommer les pages d\'une remise en plusieurs fichiers pour qu\'elles s\'assemblent en un seul document.',
                'Exporter et archiver&nbsp;: quand l\'espace manque, «&nbsp;Proposer un nettoyage&nbsp;» ne retire plus que les copies déjà exportées. Tu vois la liste avant de confirmer, et s\'il n\'y en a aucune, rien ne s\'efface.'
            ]
        },
        {
            // Entrée validée par Grégoire le 19 sept. 2026 (#701, #702, #703, #704, #705, #686).
            version: '1.150',
            couleur: 'orange',
            titre: 'Ce que l\'élève lit une fois sa note calculée',
            items: [
                'Le niveau suit la note arrondie&nbsp;: 74,5&nbsp;% compte comme 75&nbsp;% au moment de trouver le niveau, 74,4&nbsp;% reste au niveau du dessous. La note, elle, garde toutes ses décimales. La même règle vaut pour le niveau général, pour un critère qui compte des erreurs et pour un critère noté en points.',
                'Un critère qui compte des erreurs ne reçoit plus «&nbsp;--&nbsp;» comme niveau&nbsp;: sur une échelle dont les bornes laissent un vide, il prend le niveau le plus proche, comme le niveau général le faisait déjà.',
                'Une copie sans faute reçoit sa note&nbsp;: en mode catégories, aucun code sur un texte dont tu as saisi le nombre de mots donne la note complète du critère, comme en mode simple. Un niveau que tu avais choisi à la main au menu du critère reste le tien.',
                'Tu ajoutes un critère à une grille déjà utilisée&nbsp;? Les évaluations faites avant gardent leur note, et leur PDF conclut normalement. En ouvrant une de ces copies, un avis te nomme le critère ajouté depuis.',
                'Conception&nbsp;› Grilles&nbsp;: quand tu passes une grille en «&nbsp;Analytique&nbsp;» ou en «&nbsp;Algorithmique&nbsp;» et que certains de ses critères n\'ont pas de type, l\'éditeur te le dit et t\'offre un bouton pour le leur appliquer. Rien ne change sans ce geste, et les évaluations déjà faites gardent leur note.',
                'Quand la grille d\'une ancienne évaluation est introuvable, un critère qui s\'appelle «&nbsp;Français écrit&nbsp;» garde les mots du français dans la rétroaction et sur le PDF.'
            ]
        },
        {
            // Entrée validée par Grégoire le 19 sept. 2026 (#872, mécanisme B — #924).
            version: '1.149',
            couleur: 'vert',
            titre: 'Un groupe, c\'est un numéro dans un cours',
            items: [
                'Cadre&nbsp;› liste du groupe&nbsp;: le menu «&nbsp;Groupe&nbsp;» nomme maintenant le cours de chaque groupe («&nbsp;00001&nbsp;· 601-101-MQ&nbsp;»). Si deux de tes cours ont chacun un groupe 00001, tu vois deux entrées, et chacune montre ses propres élèves. Avant, les deux groupes étaient mêlés dans une seule liste.',
                '«&nbsp;Supprimer le groupe&nbsp;» ne retire que le groupe choisi, dans son cours. Avant, le groupe du même numéro dans un autre cours partait avec lui.',
                '«&nbsp;+&nbsp;Nouveau groupe&nbsp;» crée le groupe dans ton cours actif&nbsp;: un second cours peut avoir son propre groupe 00001.',
                'Un·e élève ajouté·e à la main rejoint le cours du groupe affiché. Modifier la fiche d\'un·e élève ne change plus son cours.'
            ]
        },
        {
            version: '1.148',
            couleur: 'vert',
            titre: 'L\'import d\'élèves dit où vont les élèves',
            items: [
                'Cadre&nbsp;› liste du groupe&nbsp;: avant de confirmer un import, l\'écran dit à quel cours la liste sera rattachée, et un menu permet d\'en choisir un autre sur place. Choisir un cours dans ce menu ne change pas ton cours actif. Avant, les élèves rejoignaient le cours actif sans que rien ne le dise.',
                'Le formulaire d\'ajout d\'un·e élève nomme lui aussi le cours auquel l\'élève sera rattaché·e.',
                'À l\'import, le DA suit la même règle qu\'au formulaire&nbsp;: sept chiffres, comme celui du collège. Une ligne sans DA, ou dont le DA n\'a pas sept chiffres, n\'est pas importée&nbsp;: l\'aperçu la signale, le bouton dit combien d\'élèves entreront, et le message final nomme les lignes laissées de côté. Les autres lignes entrent normalement. Les élèves déjà inscrit·es ne changent pas.'
            ]
        },
        {
            version: '1.147',
            couleur: 'vert',
            titre: 'L\'assiduité qui manque',
            items: [
                'Cadre&nbsp;› liste du groupe&nbsp;: la fiche d\'un·e élève a un nouveau champ facultatif, «&nbsp;Date d\'arrivée&nbsp;». Pour un·e étudiant·e arrivé·e en cours de trimestre, l\'assiduité se compte à partir de cette date&nbsp;: les séances d\'avant ne sont plus comptées comme des absences. Sans date, rien ne change.',
                'Tant qu\'aucune séance n\'est saisie pour un·e élève, son assiduité est inconnue&nbsp;: un tiret s\'affiche à la place de 100&nbsp;%, au profil, dans la Liste, au Suivi du groupe et dans le rapport. Le contexte d\'apprentissage ne dit plus «&nbsp;Très favorable&nbsp;» sans aucune présence notée.',
                'Les deux moyennes d\'assiduité du groupe (Liste et Suivi du groupe) disent maintenant le même chiffre&nbsp;: un·e élève à l\'assiduité inconnue n\'y entre pas&nbsp;; un·e élève absent·e à toutes les séances saisies y entre, à 0&nbsp;%.',
                'Cadre&nbsp;› liste du groupe&nbsp;: le DA est maintenant obligatoire à l\'ajout d\'un·e élève, et il compte sept chiffres, comme celui du collège. Laissé vide, l\'application n\'en fabrique plus un à ta place&nbsp;: elle refuse l\'ajout et te le dit. Les élèves déjà inscrit·es ne changent pas.'
            ]
        },
        {
            version: '1.146',
            couleur: 'vert',
            titre: 'Le dossier d\'un·e élève se déplie',
            items: [
                'Labo&nbsp;› Suivi longitudinal&nbsp;: sous chaque élève inscrit·e, «&nbsp;Voir le dossier&nbsp;» déplie la copie que tu as faite — pour chaque trimestre, ses évaluations dans l\'ordre où elles ont eu lieu, critère par critère, avec le niveau obtenu et le nom que ce niveau portait au moment de la copie.',
                'Les indices au moment de la copie — assiduité, complétion, performance — sont écrits tels qu\'ils étaient rangés. Quand un indice n\'avait pas été calculé, ou qu\'une note était impossible à calculer, l\'écran le dit plutôt que d\'afficher un zéro.',
                'Chaque évaluation est une tuile, et les tuiles se suivent côte à côte dans l\'ordre des dates&nbsp;: la production, la date, la note et le niveau se lisent d\'emblée&nbsp;; les critères et la rétroaction se déplient dans la tuile. Rien n\'est recalculé et rien n\'est écrit quand tu déplies un dossier&nbsp;; aucune analyse ni graphique pour l\'instant.',
                'Cadre&nbsp;› Trimestre&nbsp;: la barre d\'étapes du haut suit maintenant ce que tu viens d\'enregistrer. Importer tes étudiant·es, créer un horaire ou un groupe-cours coche l\'étape tout de suite, sans recharger la page.',
                'Évaluer sans copie (une note saisie depuis la Liste des évaluations)&nbsp;: deux flèches en tête du formulaire mènent d\'un·e élève à l\'autre — «&nbsp;Élève 3 de 54&nbsp;». Ce que tu viens de saisir est enregistré avant de changer d\'élève&nbsp;; la production, la grille et l\'échelle restent.',
                'Correction&nbsp;: dans un trimestre où aucune copie n\'a été ouverte, «&nbsp;Enregistrer&nbsp;» par-dessus une évaluation déjà faite n\'écrivait rien, sans le dire. La retouche est maintenant enregistrée. Si tu as retouché des notes ainsi, rouvre-les pour vérifier qu\'elles portent ta dernière valeur.',
                'Profil d\'un·e élève&nbsp;› Productions&nbsp;: avec une pratique sommative, la note de session se lit maintenant sous la liste — chaque production comptée avec sa note et son poids, la ligne de calcul de la moyenne pondérée, puis le total. Un brouillon est nommé, et dit «&nbsp;non comptée&nbsp;». Avec une pratique à catégories (Sélection et Obligatoires), un brouillon d\'obligatoire n\'entre plus dans l\'addition affichée&nbsp;: la carte le nomme, et sa formule redonne le total.',
                'Profil d\'un·e élève&nbsp;› Engagement&nbsp;: sous une pratique sommative, la section parle enfin sommative. La carte Complétion liste les productions que sa fraction compte, et la carte Performance montre la moyenne pondérée, chaque production avec son poids.',
                'Assistant de pratique&nbsp;: la liste des échelles n\'offre plus que celles de ta bibliothèque. Une échelle que tu as retirée de la barre latérale n\'y paraît plus, sauf si la pratique que tu rouvres l\'utilise déjà&nbsp;: elle reste alors choisie.',
                'Suivi&nbsp;› tableau de bord du groupe&nbsp;: la phrase sous la barre «&nbsp;Structure des apprentissages fondamentaux&nbsp;» décrit le groupe affiché dès qu\'il change. Après l\'ajout, le retrait ou le décrochage d\'un·e élève, elle décrivait encore l\'ancien groupe jusqu\'à l\'affichage suivant.'
            ]
        },
        {
            version: '1.145',
            couleur: 'vert',
            titre: 'Les résultats ultérieurs rejoignent le Suivi longitudinal',
            items: [
                'Labo&nbsp;› Suivi longitudinal&nbsp;: une seule ligne de saisie pour tous tes élèves inscrits — élève, cours, trimestre, note finale. Après chaque ajout, le cours et le trimestre restent en place et la ligne passe à l\'élève suivant&nbsp;: il ne reste qu\'à taper la note. Chaque résultat paraît sous le nom de l\'élève, avec son bouton «&nbsp;Retirer&nbsp;».',
                'Le bloc «&nbsp;Résultats ultérieurs&nbsp;» quitte Cadre&nbsp;› Trimestre. Ce que tu y avais déjà saisi n\'est pas perdu&nbsp;: c\'est repris sous le nom de l\'élève quand tu l\'inscris, avec la mention «&nbsp;saisi dans le Cadre&nbsp;», et l\'écran nomme les élèves qui ont des résultats saisis dans le Cadre. L\'export anonymisé pour la recherche porte les deux.',
                '«&nbsp;Retirer du registre&nbsp;»&nbsp;: pour corriger une inscription faite par erreur. Avant d\'agir, le dialogue dit ce qui sera effacé — la copie du dossier et chaque résultat ultérieur déjà saisi. Tes trimestres ne sont pas modifiés.',
                'Tout cela fonctionne aussi quand le trimestre affiché est archivé, sans cocher «&nbsp;Permission d\'écriture&nbsp;»&nbsp;: le registre n\'appartient à aucun trimestre.',
                'Corrigé&nbsp;: le résumé d\'une copie accorde ses pluriels («&nbsp;11 évaluations · 32 séances · 1 dossier&nbsp;»).',
            ]
        },
        {
            version: '1.144',
            couleur: 'vert',
            titre: 'Suivre un·e élève d\'un trimestre à l\'autre',
            items: [
                'Labo&nbsp;› Suivi longitudinal&nbsp;: un nouvel onglet où tu inscris les élèves que tu veux suivre dans la durée. Tu les cherches par nom, dans tous tes trimestres&nbsp;; un même élève vu dans deux trimestres n\'apparaît qu\'une fois.',
                'Inscrire un·e élève fige une copie datée de son dossier&nbsp;: évaluations, grilles et échelles utilisées, présences, interventions, indices de fin de trimestre — sans les copies numériques. Tes trimestres ne sont pas modifiés, même archivés.',
                'Le registre est conservé par l\'export complet (Réglages&nbsp;› Données), pas par l\'archive d\'un trimestre&nbsp;; l\'écran le rappelle. La saisie des résultats ultérieurs reste dans le Cadre pour l\'instant&nbsp;: elle rejoint cet onglet au prochain lot.',
                'Corrigé&nbsp;: dans Cadre&nbsp;› Trimestre, le menu «&nbsp;Trimestre actif&nbsp;» restait sur «&nbsp;Chargement...&nbsp;» quand le cours du groupe actif n\'était plus dans ta bibliothèque de cours — on ne pouvait plus changer de trimestre. Le menu se remplit de nouveau.',
            ]
        },
        {
            version: '1.143',
            couleur: 'vert',
            titre: 'Les résultats de tes anciens élèves',
            items: [
                'Sur un trimestre passé, tu peux maintenant noter les résultats obtenus par tes élèves dans les cours qui ont suivi le tien. Ces notes ressortent dans l\'export de recherche, sans identité.',
            ]
        },
        {
            version: '1.142',
            couleur: 'vert',
            titre: '«&nbsp;Évaluer&nbsp;» mène au bon élève, avec ou sans copie',
            items: [
                'Liste des évaluations&nbsp;: «&nbsp;Dossier PDF&nbsp;» fonctionne maintenant pour une évaluation sans copie importée — tu obtiens la page de synthèse de la rétroaction, seule.',
                'Relire une évaluation d\'un ancien trimestre ne donne plus «&nbsp;Erreur de chargement&nbsp;» après avoir évalué une copie dans le trimestre courant.',
                'Pratiques de notation&nbsp;: adopter un modèle «&nbsp;N meilleures évaluations&nbsp;» ou «&nbsp;N plus récentes&nbsp;» demande maintenant son échelle de performance — que tu partes d\'un modèle dans l\'assistant ou que tu l\'ajoutes depuis la bibliothèque. Sans échelle, le profil de l\'élève calculait une note pendant que l\'export des résultats écrivait «&nbsp;non constructible&nbsp;»&nbsp;; les deux disent maintenant la même chose. Une pratique déjà adoptée sans échelle n\'est pas corrigée&nbsp;: ouvre-la par l\'assistant et choisis son échelle.',
                'Export anonymisé pour la recherche (Réglages&nbsp;› Captures et recherche)&nbsp;: le fichier porte maintenant les vrais indices A, C et P de chaque élève, de 0 à 100 — il écrivait 0 partout. Quand la note d\'un élève n\'est pas encore constructible, P y est laissé vide plutôt qu\'à 0. Un export déjà produit n\'est pas corrigé&nbsp;: génère-le de nouveau.',
                'Annoter et évaluer&nbsp;: après plusieurs heures dans le même onglet, les copies PDF pouvaient toutes afficher «&nbsp;Erreur ouverture PDF&nbsp;» jusqu\'au rechargement de la page. Ce n\'est plus le cas.',
                'Élève en décrochage, inactif ou en abandon&nbsp;: son profil s\'ouvre maintenant depuis la Liste (il répondait «&nbsp;Étudiant·e introuvable&nbsp;»). Ses indices sont calculés avec ta pratique de notation, comme ceux des autres, et son statut paraît sous son nom&nbsp;: «&nbsp;Décrochage · hors des moyennes du groupe&nbsp;». Dans la Liste, sa ligne grisée montre son assiduité réelle plutôt que 0&nbsp;%. Les moyennes et les statistiques du groupe ne changent pas.',
                'Suivi du groupe&nbsp;: le bilan des fondamentaux écrit «&nbsp;difficulté récente&nbsp;» (une seule production récente sous le seuil) là où il écrivait «&nbsp;émergente&nbsp;». «&nbsp;Difficulté émergente&nbsp;» ne désigne plus que le profil d\'apprentissage de la carte RàI, qui donne seule le niveau d\'intervention&nbsp;; le tableau de l\'Aide est accordé.',
                'Dépistage&nbsp;: une copie encore en brouillon ne lève plus de signalement&nbsp;; il paraît quand la copie est enregistrée.',
                'Profil d\'un élève&nbsp;: la carte Complétion dit maintenant la même chose que sa fraction. Elle écrit «&nbsp;Productions remises&nbsp;: 9/10&nbsp;», montre la production qui manque — l\'évaluation terminale comprise — sous «&nbsp;1 production non remise ou non recevable&nbsp;», et n\'écrit «&nbsp;Toutes les productions sont remises&nbsp;!&nbsp;» que si rien ne manque. Un brouillon n\'y paraît plus parmi les remises.',
                'Complétion&nbsp;: une copie marquée «&nbsp;plagiat&nbsp;» ou «&nbsp;IA non autorisée&nbsp;» n\'est plus comptée comme une remise. La complétion d\'un élève qui en a une baisse avec cette mise à jour&nbsp;; sa note ne change pas.',
                'Exploration des pratiques&nbsp;: une pratique «&nbsp;N derniers&nbsp;» affiche «&nbsp;Récence (dernier essai retenu)&nbsp;» à la ligne des reprises.',
                'Pratiques de notation&nbsp;: dans une pratique sommative créée par l\'assistant, le «&nbsp;Verrou sur une évaluation&nbsp;» s\'applique maintenant à la note. Si l\'évaluation nommée (le titre de la production) est sous le seuil, la note est plafonnée, au profil comme à l\'export. Si tu avais déjà coché ce verrou, des notes peuvent baisser avec cette mise à jour. Rouvrir une pratique sommative ne ramène plus ses règles aux valeurs par défaut. Le «&nbsp;Remplacement automatique&nbsp;» et le «&nbsp;Plafonnement conditionnel&nbsp;» ne sont pas encore appliqués à la note.',
                'Aide&nbsp;: la dénotation y est dite disponible, et le récapitulatif d\'une pratique Spécifications dit où régler les types de productions et les forfaits.',
                'Pratiques de notation&nbsp;: un modèle «&nbsp;N plus récentes&nbsp;» rouvert par l\'assistant garde sa méthode («&nbsp;N derniers artefacts&nbsp;») au lieu de revenir à «&nbsp;N meilleurs&nbsp;». Et l\'export des résultats n\'écrit plus «&nbsp;0, final&nbsp;» pour une pratique Spécifications dont les types de travaux et les forfaits ne sont pas encore réglés&nbsp;: il écrit «&nbsp;non constructible&nbsp;».',
                'Profil d\'un élève&nbsp;: la fraction écrite à côté de la complétion compte maintenant les mêmes productions que le pourcentage, évaluation terminale comprise — «&nbsp;80%&nbsp;» se lit avec «&nbsp;8 / 10&nbsp;», plus avec «&nbsp;7 / 9&nbsp;». Le pourcentage, lui, n\'a pas changé. Dans le profil comme dans le rapport.',
                'Profil d\'un élève&nbsp;: l\'assiduité montre les présences telles que tu les as saisies, demi-période comprise — «&nbsp;90% (22,5 / 25 périodes)&nbsp;» au lieu de «&nbsp;90% (23 / 25)&nbsp;». Le pourcentage découle de la fraction affichée, dans le profil comme dans le rapport.',
                'Dans le Suivi du groupe, le filtre «&nbsp;A+C &lt; 65%&nbsp;» devient «&nbsp;A ou C &lt; 70%&nbsp;»&nbsp;: il retient l\'élève dont l\'assiduité ou la complétion est sous le seuil critique du profil, le même que la carte Mobilisation. Les courbes du groupe et les trajectoires en mode Note finale ne dessinent plus les niveaux d\'une échelle sous des pourcentages&nbsp;; le mode Habiletés les garde.',
                '«&nbsp;Évaluer&nbsp;» dans le profil d\'un élève (et dans la liste des évaluations) choisit maintenant l\'élève et la production pour toi. Avant, tu arrivais sur Évaluation sans que rien ne soit choisi.',
                'Si la copie est importée, elle s\'ouvre directement en mode Évaluer, annotée ou non. «&nbsp;Annoter&nbsp;» reste à un clic. Choisi dans le menu «&nbsp;Actions…&nbsp;» de la liste, il ouvre maintenant la copie avec ses outils, même après un passage en mode Évaluer.',
                'Une évaluation dont un critère a été retiré de la grille s\'ouvre de nouveau (avant&nbsp;: «&nbsp;Erreur de chargement&nbsp;»). Un avis nomme ce critère et le niveau enregistré, que l\'évaluation garde. Si tu modifies la copie, la note se recalcule sur la grille actuelle.',
                'Nombre d\'erreurs&nbsp;: retirer tous les codes d\'erreur posés sur une copie remet maintenant le compte à 0. Un nombre que tu as tapé toi-même n\'est jamais effacé. Une évaluation déjà enregistrée garde le compte qu\'elle portait.',
                'Sans copie importée — une copie remise sur papier, par exemple —, tu arrives sur le formulaire d\'évaluation avec les mêmes outils&nbsp;: le nom de l\'élève en tête, les vues Générale, Spécifique et Bilan de la rétroaction, «&nbsp;Copier tout&nbsp;», «&nbsp;Copier&nbsp;» et le cadenas — et «&nbsp;Consulter&nbsp;» une évaluation sans copie aussi. Le statut part à «&nbsp;Reçu&nbsp;»&nbsp;; pour une non-remise, repasse-le à «&nbsp;Non reçu&nbsp;».',
                'Cadre › Groupe d\'étudiant·es&nbsp;: un bouton «&nbsp;+ Nouveau groupe&nbsp;» crée un 2e groupe. Le formulaire d\'ajout suit le groupe choisi&nbsp;: tes élèves ne tombent plus dans le premier groupe. Le bouton «&nbsp;Supprimer un groupe&nbsp;» est maintenant toujours visible&nbsp;: choisis le groupe dans le menu, et tous ses élèves partent d\'un seul geste.',
                'Un groupe importé ou créé apparaît tout de suite à l\'étape 3 du groupe-cours&nbsp;: tu peux l\'y choisir et enregistrer sans recharger.',
                'Réimporter une liste exportée depuis Labo Codex n\'ajoute plus un élève fantôme nommé «&nbsp;Groupe&nbsp;».',
                'Aide › «&nbsp;Exporter et sauvegarder tes données&nbsp;»&nbsp;: un encadré dit ce que la Loi 25 te demande — où vivent les données de tes élèves, qui en répond, comment les protéger — avec un lien vers la page publique qui détaille tout.',
                'Import des copies&nbsp;: les photos d\'un même élève pour une même production s\'assemblent de nouveau en un seul PDF, au lieu d\'être annoncées comme doublons à renommer, même quand tu reprends une file avec «&nbsp;Re-déposer les fichiers&nbsp;» (tu fais le tri dans l\'aperçu, rangé par date). Une vignette sans image dit maintenant pourquoi&nbsp;— et, pour une photo HEIC que le navigateur n\'a pas pu lire, la raison s\'affiche quand tu cliques sur le fichier. «&nbsp;+ Ajouter des pages&nbsp;» ajoute de nouveau tes pages quand tu confirmes sans réglage. Plusieurs PDF remis par un même élève pour une même production s\'assemblent aussi en un seul PDF, comme ses photos (leurs pages y deviennent des images&nbsp;: le texte n\'y est plus sélectionnable). Une copie mise à la corbeille dans «&nbsp;Exporter et archiver&nbsp;» disparaît aussi du carrousel d\'«&nbsp;Annoter et évaluer&nbsp;». Tes réglages spécifiques (perspective, rognage…) sont de nouveau appliqués quand tu reprends une file avec «&nbsp;Re-déposer les fichiers&nbsp;» après un rechargement&nbsp;: avant, la photo partait sans correction. En annotation, avec l\'outil Texte, cliquer sur un texte existant l\'ouvre pour le modifier, au lieu de créer un 2e bloc par-dessus.',
                '«&nbsp;Exporter et archiver&nbsp;» › «&nbsp;Télécharger&nbsp;»&nbsp;: une copie illisible ne fait plus perdre toute l\'archive. Les autres copies partent, et un bilan nomme celle qui manque, comme pour «&nbsp;Trimestre complet&nbsp;». Le nom du ZIP et des dossiers garde les accents («&nbsp;Écrit 1&nbsp;», plus «&nbsp;_crit_1&nbsp;») et ne se casse plus sur un nom d\'élève qui contient «&nbsp;/&nbsp;». Une copie qui n\'a pas pu partir n\'est plus marquée «&nbsp;exportée&nbsp;». Même chose pour «&nbsp;Télécharger ZIP des travaux&nbsp;» dans le profil d\'un élève.',
                'Profil d\'un élève&nbsp;: le dépistage lit un critère noté en points à sa note (22/30 = 73&nbsp;%), comme les courbes, au lieu du niveau déduit&nbsp;— les barres, la persistance des fondations et le défi disent le même chiffre. Un critère réglé «&nbsp;Aucun&nbsp;» au menu «&nbsp;Niveau SOLO&nbsp;» ne compte plus que dans la note&nbsp;: plus de barre, de défi ni de cible d\'intervention proposée pour lui.',
                'Profil d\'un élève et Suivi&nbsp;: la note, la complétion, le rapport, le dépistage (barres, persistance des fondations, défi) et la carte RàI lisent maintenant les mêmes copies. Une copie enregistrée compte, avec ou sans commentaire final&nbsp;; un brouillon ne compte nulle part, pas même parmi les productions du rapport. Un travail «&nbsp;Non reçu&nbsp;» n\'entre jamais dans la complétion, sous aucune pratique&nbsp;: un 0 inscrit n\'est pas un travail remis.',
                'Rétroaction&nbsp;: le bouton «&nbsp;Régénérer&nbsp;» ne disparaît plus en mode Évaluer. «&nbsp;Niveau de performance&nbsp;»&nbsp;: le choix est maintenant enregistré dès que tu le coches, et le PDF remis à l\'élève le respecte. Le bloc «&nbsp;Note provisoire&nbsp;» y garde les artefacts avec leur niveau, sans pourcentage, sans calcul ni note finale. Un travail diagnostique ne compte plus parmi les travaux évalués du profil et du PDF, et la ligne «&nbsp;Sélection&nbsp;» dit «&nbsp;1 retenue sur 4 possibles&nbsp;» au lieu de «&nbsp;les 1 meilleures sur 2 évaluées&nbsp;».',
            ]
        },
        {
            version: '1.141',
            couleur: 'vert',
            titre: 'Rapport du profil : une zone de notes qui reste',
            items: [
                'La section «&nbsp;Rapport&nbsp;» du profil d\'un élève porte maintenant une zone «&nbsp;Mes notes&nbsp;», sous le rapport. Ce que tu y écris est enregistré à mesure et tu le retrouves en revenant, d\'une visite à l\'autre.',
                'Le bouton «&nbsp;Copier&nbsp;» emporte le rapport et tes notes ensemble.',
                'Le rapport lui-même, au-dessus, continue d\'être refait à chaque ouverture avec les chiffres du jour&nbsp;: ce que tu y tapes ne se garde pas, pour que tu ne copies jamais des données périmées. C\'est «&nbsp;Mes notes&nbsp;» qui retient.',
                'En mode anonymisation, tes notes ne s\'affichent pas&nbsp;: un écran montré à une salle ne dévoile pas ce que tu écris sur un élève.',
                'Enregistrer un commentaire dans «&nbsp;Informations confidentielles&nbsp;» ne répond plus «&nbsp;Étudiant·e introuvable&nbsp;». Le commentaire était bien enregistré&nbsp;; c\'est le profil qui se rafraîchissait sans savoir de quel élève il s\'agissait — et la barre latérale du profil restait sourde ensuite.',
            ]
        },
        {
            version: '1.140',
            couleur: 'vert',
            titre: 'Jetons : un délai sur une reprise, si ta pratique le permet',
            items: [
                'Dans les jetons de ta pratique, une nouvelle case, «&nbsp;Permettre un délai sur une reprise&nbsp;», décide si une copie reprise peut encore recevoir un délai. Décochée par défaut : rien ne change tant que tu ne la coches pas.',
                'Sur une pratique dont les jetons ont été réglés à sa création, le formulaire le dit et ne laisse plus rien modifier en vain.',
                'Le profil d\'un élève, son historique d\'accompagnement, ses graphiques et le compteur de la Liste ne montrent plus que les interventions du groupe où tu es, comme la liste des interventions. Celles écrites avant le 12 septembre restent visibles partout.',
                'Le bouton «&nbsp;Suggérer&nbsp;» d\'une intervention dit maintenant le pourcentage visé, sans nommer de niveau de l\'échelle. Les objectifs déjà enregistrés gardent leur phrase.',
                'Quand une nouvelle version s\'ouvre, son bandeau porte un bouton «&nbsp;Voir les nouveautés&nbsp;» qui les affiche, au lieu de dire où les chercher.',
                'Le graphique de progression d\'un élève n\'affiche plus les paliers d\'une échelle de notation en arrière-plan. Ces courbes cumulent des pourcentages sur tout le trimestre : les situer dans une échelle faite pour juger une seule production donnait un repère qui n\'en était pas un. Le graphique par critère, lui, garde les siens.',
                'La préparation d\'un premier trimestre se fait d\'un trait : le trimestre créé est actif d\'emblée, et quand un horaire n\'a encore aucun groupe à associer, un message dit où le créer — dans l\'accordéon «&nbsp;Groupe d\'étudiant·es&nbsp;», juste au-dessus.',
                'En mode anonymisation, la liste des étudiant·es du Cadre (accordéon «&nbsp;Groupe d\'étudiant·es&nbsp;») affiche maintenant les pseudonymes, comme le reste de l\'application. Pour modifier ou supprimer un·e étudiant·e, repasse en mode normal.',
            ]
        },
        {
            version: '1.139',
            couleur: 'bleu',
            titre: 'Interventions : rien n\'est écrit avant «&nbsp;Enregistrer&nbsp;»',
            items: [
                'Dans Suivi › Interventions, planifier n\'enregistre plus rien tant que tu n\'as pas cliqué Enregistrer ; le bilan avant / après lit les mêmes seuils que le reste de l\'application.',
                'Le bandeau de nouvelle version affiche le même numéro que la carte «&nbsp;Nouveautés&nbsp;», et une fois fermé, il ne revient plus à chaque ouverture.',
                'La démonstration compte maintenant dix élèves au lieu de vingt, avec des profils de suivi variés : elle se parcourt plus vite. Une démonstration déjà installée se met à jour d\'elle-même.',
                'Dans la démonstration, l\'Artefact 9 est maintenant un plan de rédaction, et ses rétroactions en parlent comme tel.',
                'Dans l\'en-tête, choisir un cours «&nbsp;(tous groupes)&nbsp;» affiche de nouveau les élèves de tous ses groupes dans une même liste, et non plus seulement ceux du dernier groupe choisi.',
                'Retirer un jeton de reprise dont l\'enregistrement échoue affiche l\'échec, et rien ne bouge : plus de «&nbsp;Originale restaurée&nbsp;» trompeur, plus de fichier envoyé à la corbeille. Une reprise accordée part propre : elle ne recompte plus le délai déjà accordé sur l\'originale, et une copie déjà remplacée n\'en reçoit plus.',
            ]
        },
        {
            version: '1.138',
            couleur: 'vert',
            titre: 'L\'accueil parle aux deux métiers',
            items: [
                '<strong>L\'accueil nomme les deux usages de l\'application.</strong> Dans le bandeau «&nbsp;Bienvenue&nbsp;», «&nbsp;Par où commencer&nbsp;?&nbsp;» répond à l\'enseignant·e et à l\'orthopédagogue, chacun par son chemin ; les paragraphes sur les guides et sur le courriel mensuel sont plus courts.',
                '<strong>Une orthopédagogue trouve sa porte dès l\'accueil</strong>&nbsp;: la carte «&nbsp;Tu es orthopédagogue&nbsp;?&nbsp;», au-dessus des tâches, mène en un geste à Suivi › Rencontres, où son service se décrit en trois questions.',
                '<strong>Les rencontres d\'orthopédagogie ne demandent plus de cibler des critères d\'évaluation.</strong> Sur un service, le formulaire d\'une rencontre n\'affiche plus «&nbsp;Critères ciblés&nbsp;», «&nbsp;Objectif visé&nbsp;» ni «&nbsp;Suggérer&nbsp;», et le bilan dit simplement «&nbsp;Ce que tu retiens de la rencontre.&nbsp;» Sur un cours, le formulaire d\'une intervention ne change pas.',
                '<strong>Les prochains rendez-vous d\'une orthopédagogue s\'affichent en tête de sa liste.</strong> Dans Suivi › Rencontres, sur un service, «&nbsp;Tes prochains rendez-vous&nbsp;» montre les quatre rencontres à venir les plus proches, la plus proche en premier&nbsp;: la date, l\'heure si elle est notée, le titre, individuelle ou en sous-groupe. La liste des rencontres, dessous, ne change pas d\'ordre.',
            ]
        },
        {
            version: '1.137',
            couleur: 'bleu',
            titre: 'La section Cours du Cadre parle le métier choisi, et ne se contredit plus sur l\'horaire',
            items: [
                '<strong>Dans Cadre, la section «&nbsp;Cours et services&nbsp;» suit la fiche et le contexte.</strong> Sur un service d\'orthopédagogie, le formulaire dit «&nbsp;Modifier le service&nbsp;», «&nbsp;Nouveau service&nbsp;» dès que le menu Nature bascule, le bandeau «&nbsp;Mode modification — Service&nbsp;», la synthèse «&nbsp;Aucun service sélectionné&nbsp;», et les menus qui nomment une personne disent «&nbsp;Sélectionner un·e orthopédagogue&nbsp;» — y compris après un rafraîchissement du menu, qui les remettait à «&nbsp;— Sélectionner —&nbsp;». Sur un cours, tout redit cours et enseignant·e.',
                '<strong>La phrase des éléments obligatoires du groupe-cours ne dit plus l\'horaire obligatoire pour un service</strong>&nbsp;: elle en compte quatre (trimestre, service d\'orthopédagogie, numéro de groupe, orthopédagogue) et dit que l\'horaire et la pratique de notation sont facultatifs — ce que le champ disait déjà deux lignes plus bas. Pour un cours, elle en compte cinq, comme avant.',
            ]
        },
        {
            version: '1.136',
            couleur: 'vert',
            titre: 'Deux usages nommés dans le Cadre : l\'enseignement et l\'orthopédagogie',
            items: [
                '<strong>Dans Cadre › Cours, le menu «&nbsp;Nature&nbsp;» dit désormais «&nbsp;Enseignement&nbsp;» ou «&nbsp;Orthopédagogie&nbsp;»</strong> (à la place de «&nbsp;Cours&nbsp;» / «&nbsp;Service&nbsp;»). L\'application connaît deux façons de l\'utiliser, et le dit à la porte principale&nbsp;: un cours d\'enseignement porte le devis ministériel&nbsp;; un service d\'orthopédagogie n\'a que son nom. Rien d\'autre ne change&nbsp;: tes cours, tes champs, tes données sont intacts.',
                '<strong>Quand le contexte actif est un service d\'orthopédagogie, le Cadre parle d\'orthopédagogue</strong> là où il parle d\'enseignant·e (le profil, le formulaire de groupe-cours, la carte du groupe-cours)&nbsp;; sur un cours, il redit «&nbsp;enseignant·e&nbsp;». Un mot suit le contexte, aucun champ ne bouge.',
                '<strong>Dans Suivi, les rencontres se disent d\'orthopédagogie</strong>&nbsp;: les trois questions créent «&nbsp;ton service d\'orthopédagogie&nbsp;», le bouton dit «&nbsp;Créer mon service d\'orthopédagogie&nbsp;», et sur un groupe-cours ordinaire la carte nomme l\'orthopédagogie directement.',
            ]
        },
        {
            version: '1.135',
            couleur: 'vert',
            titre: 'Rencontres : un service est un cours, un sous-onglet pour tenir ses rencontres, une intervention qui sait où elle est née',
            items: [
                '<strong>Un sous-onglet «&nbsp;Rencontres&nbsp;» dans Suivi, pour un service.</strong> Quand le contexte actif est un service (un cours de nature «&nbsp;Service&nbsp;», voir ci-dessous), tu y tiens tes rencontres individuelles ou en sous-groupe&nbsp;: date, heure, participants, notes par élève, bilan. Sur un groupe-cours ordinaire, le sous-onglet ne liste rien&nbsp;: il offre seulement de créer un service, ou d\'activer celui qui existe déjà dans le trimestre&nbsp;; tes interventions restent sous «&nbsp;Interventions&nbsp;», qui ne change pas. Sur un poste sans trimestre, trois questions suffisent&nbsp;: les dates, le nom de ton service, ta liste d\'élèves&nbsp;; l\'application crée le reste, visible dans Cadre.',
                '<strong>Un cours peut être un «&nbsp;Service&nbsp;».</strong> Dans Cadre › Cours, le choix «&nbsp;Nature&nbsp;: Cours / Service&nbsp;»&nbsp;: un service n\'a ni code, ni discipline, ni compétence — seul son nom est requis — et son groupe-cours peut n\'avoir aucun horaire&nbsp;; la présence se note dans la rencontre.',
                '<strong>Une intervention sait dans quel groupe-cours elle est née.</strong> La liste des interventions d\'un groupe-cours ne mêle plus celles d\'un autre groupe du même cours&nbsp;; en mode cours (tous les groupes), tu les vois toutes. Celles d\'avant restent visibles partout et prennent leur contexte au prochain Enregistrer.',
                '<strong>Dans un service, la liste montre tous tes élèves</strong> (1.135.1). Une ligne collée d\'Omnivox garde le numéro de groupe de ton collège, et la Liste des étudiant·es la comptait sans l\'afficher&nbsp;: dans un service, un élève appartient par son service, pas par un numéro de groupe — rien n\'est réécrit, l\'élève réapparaît. Et une ligne illisible (plusieurs élèves collés sur une seule ligne) est refusée et nommée, au lieu de donner un élève fantôme.',
            ]
        },
        {
            version: '1.134',
            couleur: 'vert',
            titre: 'Profil d\'un élève : un seul rendu à l\'ouverture, des graphiques qui lisent l\'échelle de chaque évaluation',
            items: [
                '<strong>Le profil d\'un élève s\'ouvre en un seul rendu.</strong> Ce que tu tapes dans la zone de texte du rapport n\'est plus effacé une fraction de seconde après l\'ouverture&nbsp;; une note de dénotation en cours de saisie non plus.',
                '<strong>Les graphiques de progression lisent l\'échelle de chaque évaluation</strong> — la tienne, et celles de tes collègues, y compris à trois paliers ou en points. Une valeur qui ne se convertit pas dans son échelle n\'est plus tracée à une valeur devinée&nbsp;: le point est absent et le graphique dit combien d\'évaluations sont dans ce cas. Les zones colorées du fond sont celles de l\'échelle des évaluations tracées.',
                '<strong>Les cases «&nbsp;Inclure…&nbsp;» du rapport appartiennent au trimestre</strong> et se mémorisent quand tu les coches, pas à chaque affichage.',
                '<strong>Volet confidentiel&nbsp;: la case «&nbsp;Services adaptés&nbsp;» suit la liste des étudiant·es</strong> (Cadre › Trimestre) et ne se coche plus à part&nbsp;; la catégorie et la sous-catégorie ne s\'affichent que pour un élève marqué «&nbsp;Oui&nbsp;». Le bloc «&nbsp;Portrait de lecteur&nbsp;», propre à une pratique particulière, est retiré.',
                '<strong>Dans Accompagnement, le bouton «&nbsp;+ Nouvelle intervention&nbsp;» est à droite du titre HISTORIQUE</strong>, sur la même ligne, la carte de l\'historique dessous.',
            ]
        },
        {
            version: '1.133',
            couleur: 'vert',
            titre: 'Saisie des présences : le verrou d\'une date ne vaut que pour ce groupe-cours et ce trimestre',
            items: [
                '<strong>Dans Suivi › Saisie des présences, verrouiller une date ne vaut plus que pour le groupe-cours et le trimestre où tu le fais.</strong> Jusqu\'ici, une date verrouillée dans un groupe l\'était dans tous les autres, et le restait d\'un trimestre à l\'autre. Les dates verrouillées avant cette version restent verrouillées dans chacun de tes groupes&nbsp;; rien n\'est changé au passé.',
                '<strong>La date, le sous-groupe, le tri et la recherche de l\'écran appartiennent au trimestre.</strong> La démonstration ne prend plus ta date et te la rend au retour&nbsp;; un trimestre neuf part à vide.',
                '<strong>La démonstration n\'annonce plus une configuration incomplète.</strong> Elle ouvre la saisie sur la dernière séance passée, avec ses élèves. Sans date mémorisée, l\'écran ouvre de lui-même sur la dernière séance, et «&nbsp;← Précédent&nbsp;» y va aussi.',
            ]
        },
        {
            version: '1.132',
            couleur: 'vert',
            titre: 'Liste des étudiant·es : les abandons restent visibles, les tris trient, la recherche ignore les accents',
            items: [
                '<strong>Dans Suivi › Liste des étudiant·es, les élèves en abandon, inactifs ou en décrochage restent visibles, grisés, avec leur statut.</strong> La note sous le tableau le disait déjà&nbsp;; le tableau les retirait. Les moyennes et les corrélations, elles, restent calculées sur les élèves actifs, comme avant.',
                '<strong>Les tris par numéro et par DA trient.</strong> Le clic sur «&nbsp;#&nbsp;» renverse l\'ordre d\'arrivée&nbsp;; le tri par DA est numérique (999999 avant 1000123).',
                '<strong>La recherche ignore les accents et la casse</strong>&nbsp;: «&nbsp;aime&nbsp;» trouve Aimé, «&nbsp;cesaire&nbsp;» trouve Césaire. Et une lettre tapée ne recalcule plus tout le groupe trois fois&nbsp;: la liste se rafraîchit quand tu cesses d\'écrire.',
                '<strong>Le filtre «&nbsp;Profils d\'apprentissage&nbsp;» offre les six profils que l\'application calcule</strong> («&nbsp;En progression&nbsp;», qui n\'existait pas, est retiré&nbsp;; «&nbsp;Non-participation&nbsp;» et «&nbsp;Données insuffisantes&nbsp;» s\'ajoutent). La case «&nbsp;≥ Min.&nbsp;» garde son effet après un tri, et un élève sans aucune évaluation compte comme «&nbsp;sous le minimum&nbsp;».',
                '<strong>Dans Cadre › Trimestre, un DA déjà présent dans le groupe est refusé à l\'ajout, et ignoré à l\'import</strong> (le message compte les ajoutés et les déjà présents). Le numéro de groupe s\'écrit toujours sur cinq chiffres&nbsp;: «&nbsp;1&nbsp;» et «&nbsp;00001&nbsp;» ne font plus deux entrées dans le filtre Groupe.',
            ]
        },
        {
            version: '1.131',
            couleur: 'vert',
            titre: 'Suivi du groupe : tes élèves suivis sont gardés par groupe-cours',
            items: [
                '<strong>Tes élèves suivis sont maintenant gardés par groupe-cours&nbsp;: changer de groupe ne les efface plus.</strong> Jusqu\'ici, ouvrir « Détails » sous ton deuxième groupe vidait, en base et sans un mot, la liste des élèves suivis du premier. Chaque groupe-cours a sa liste (au plus cinq)&nbsp;; ta liste actuelle est reprise dans le groupe où sont ces élèves, et la valeur d\'avant reste en place.',
                '<strong>Un sixième clic dit pourquoi il refuse</strong> («&nbsp;Cinq élèves suivis au maximum&nbsp;»), un élève passé en abandon libère son siège, et le filtre «&nbsp;P&nbsp;<&nbsp;65&nbsp;%&nbsp;» ne retient plus un élève dont le P s\'affiche «&nbsp;—&nbsp;». Le bandeau «&nbsp;Étudiant·es prioritaires&nbsp;», qui ne s\'ouvrait jamais, est parti&nbsp;; en mode Détails, une ligne dit où cliquer pour ouvrir un profil.',
                '<strong>En démonstration, le dépistage n\'est plus muet</strong>&nbsp;: la famille «&nbsp;Défi spécifique&nbsp;» du Suivi du groupe se calcule sur la grille du pack de démonstration, sans toucher à ta propre grille de référence.',
                '<strong>L\'assiduité (A) des trimestres passés s\'affiche de nouveau.</strong> Depuis la fin août, le nombre de périodes d\'une séance se lit dans l\'horaire, séance par séance&nbsp;; un horaire créé avant ne le portait pas, et la barre A du Suivi du groupe restait vide sans rien dire. Une séance sans nombre de périodes reprend maintenant le format déclaré de son horaire («&nbsp;N séances de P périodes&nbsp;»). Rien n\'est réécrit dans tes horaires ni tes présences.',
            ]
        },
        {
            version: '1.130',
            couleur: 'bleu',
            titre: 'Labo › Outils d\'observation se lit sans rien déplier',
            items: [
                '<strong>Tout l\'écran est visible d\'un coup.</strong> Les deux sections repliables (« Paramètres avancés », « Seuils d\'interprétation ») sont devenues des blocs ouverts, et les trois cartes ne se referment plus. Un sommaire en tête (« Sur cette page ») mène à chacune. Les réglages vont deux par rangée&nbsp;: la page tient en deux écrans au lieu de quatre.',
                '<strong>Chaque réglage dit où il agit.</strong> Sous chaque option, de petites étiquettes nomment l\'écran où son effet se voit (Profil, Liste des élèves, Suivi du groupe…) ; en ambre, celles qui agissent hors de Suivi (la palette d\'annotation, la liste des évaluations, l\'export recherche).',
                '<strong>Les seuils se tapent au lieu de se glisser.</strong> Les trois curseurs (progression des artefacts, sensibilité des flèches, seuil de défi) sont devenus des champs chiffrés avec leur unité, comme les trois seuils Fragile / Acceptable / Bon. Tes valeurs sont les mêmes qu\'avant, à la même place&nbsp;; les deux boutons « Remettre les valeurs par défaut » disent maintenant lesquelles (3 · 10 · 5 · 70 et 70 · 80 · 85).',
                '<strong>Depuis le Suivi, un lien mène aux réglages qui le gouvernent.</strong> En tête du Suivi du groupe et sous le titre de la carte RàI d\'un profil, « Régler les outils d\'observation » ouvre Labo&nbsp;›&nbsp;Outils d\'observation. L\'écran reste dans Labo&nbsp;: quatre de ses réglages agissent hors de Suivi (palette d\'annotation, liste des évaluations, badge de grille, export recherche).',
                '<strong>L\'application s\'ouvre plus vite&nbsp;:</strong> ce qui a déjà été téléchargé n\'est plus redemandé au serveur à chaque ouverture. La première ouverture après une mise à jour reste plus longue, le temps de recevoir ce qui a changé.',
            ]
        },
        {
            version: '1.129',
            couleur: 'bleu',
            titre: 'Deux réglages qui ne faisaient rien s\'en vont, la fenêtre d\'analyse fonctionne',
            items: [
                '<strong>Deux réglages de Labo&nbsp;›&nbsp;Outils d\'observation sont retirés&nbsp;: «&nbsp;Découpler Performance (P) et Niveau d\'attention (N)&nbsp;» et «&nbsp;Unité d\'affichage de l\'assiduité&nbsp;».</strong> Tu pouvais les changer, aucun écran ne bougeait&nbsp;: rien ne les lisait. Ils promettaient ce que l\'application ne faisait pas. Rien de ce que tu as saisi n\'est touché, et si tu les avais réglés, ce réglage ne changeait déjà rien.',
                '<strong>La «&nbsp;Fenêtre d\'analyse des patterns&nbsp;» fonctionne maintenant.</strong> Le nombre de dernières productions que tu tapais restait dans le panneau&nbsp;: les calculs du profil (indice de progression, flèches par critère, «&nbsp;sur N&nbsp;» de fiabilité du Suivi du groupe) analysaient toujours <strong>trois</strong> productions, quoi que tu tapes. La valeur du champ s\'applique désormais. ⚠ <strong>Si tu y avais mis un autre nombre, il est reparti à trois</strong>&nbsp;: comme il n\'a jamais eu d\'effet, le reprendre aurait changé tes profils sans que tu l\'aies demandé. Retape-le, et cette fois ça compte.',
                '<strong>Le curseur «&nbsp;Direction du risque&nbsp;» s\'appelle «&nbsp;Sensibilité des flèches par critère&nbsp;».</strong> Il agit, mais pas sur ce que son nom disait&nbsp;: il règle la variation minimale de la moyenne d\'un critère, d\'une fenêtre d\'analyse à la précédente, pour qu\'une flèche (→ ou ←) apparaisse après ce critère dans le profil (carte RàI, barres SRPNF, phrase «&nbsp;Apprentissage&nbsp;: présentement en amélioration&nbsp;»). Sa valeur et son effet ne changent pas&nbsp;; seuls le nom et l\'aide disent enfin la vérité.',
                '<strong>L\'échelle IDME dit les mêmes quatre mots partout&nbsp;: Incomplet, Développement, Maîtrise, Étendu.</strong> Selon l\'écran, le I s\'appelait «&nbsp;Insuffisant&nbsp;» ou «&nbsp;Insuffisant ou incomplet&nbsp;», le E «&nbsp;Excellent&nbsp;» ou «&nbsp;Excellence&nbsp;», le D et le M «&nbsp;en Développement&nbsp;» et «&nbsp;Maîtrisé&nbsp;». Ces mots jugeaient&nbsp;; les quatre retenus décrivent. Les noms des niveaux de tes échelles ne bougent pas&nbsp;: ce sont tes mots, et ils voyagent avec elles.',
                '<strong>Le bloc «&nbsp;Seuils d\'interprétation&nbsp;» dit ce que ses trois champs font.</strong> Il annonçait des étiquettes IDME, et ses champs s\'appellent Fragile, Acceptable et Bon. Il dit maintenant qu\'ils colorent les colonnes Assiduité, Complétion, Performance et Mobilisation de la liste des élèves et qualifient l\'engagement dans le profil, sans toucher ni la note ni l\'échelle IDME.',
                '<strong>Deux aides corrigées, et «&nbsp;cueillette&nbsp;» devient «&nbsp;collecte&nbsp;».</strong> L\'aide des «&nbsp;Indicateurs visuels des seuils&nbsp;» promettait des étiquettes IDME sur les graphiques&nbsp;: ce sont les niveaux de ton échelle qui s\'y tracent, et l\'aide le dit. Le repère «&nbsp;note différée&nbsp;» renvoyait à Réglages&nbsp;›&nbsp;Préférences&nbsp;; son réglage est dans Labo&nbsp;›&nbsp;Outils d\'observation.',
                '<strong>L\'échelle de départ et le bilan disent les mêmes mots que le reste de l\'application.</strong> L\'« Échelle de départ (IDME) » offerte à un nouvel espace nomme ses niveaux Incomplet, Développement, Maîtrise, Étendu ; ton échelle à toi ne bouge pas (renomme-la dans Conception&nbsp;›&nbsp;Échelles si tu veux les mêmes mots). Dans le bilan de l\'élève, un critère de français effondré se lit « Incomplet », plus « Insuffisant ».',
            ]
        },
        {
            version: '1.128',
            couleur: 'bleu',
            titre: 'La Consolidation des apprentissages est retir\u00e9e',
            items: [
                '<strong>Le module «&nbsp;Consolidation des apprentissages&nbsp;» n\'existe plus.</strong> Il mesurait si les acquis tenaient d\'une production \u00e0 la suivante, et il n\'a jamais rien donn\u00e9 de concluant. La carte du Labo dispara\u00eet, et avec elle <strong>deux affichages du profil \u00e9tudiant</strong>&nbsp;: la ligne «&nbsp;Consolidation&nbsp;» de l\'onglet <em>Forces et d\u00e9fis</em>, et les mentions «&nbsp;Consolid\u00e9 depuis cette production&nbsp;» qui apparaissaient au survol du graphique de progression. Rien de ce que tu as saisi n\'est touch\u00e9&nbsp;: ce module ne faisait que lire.',
                '<strong>Le rep\u00e8re «&nbsp;Ma\u00eetris\u00e9 \u00e0 partir de&nbsp;» de tes \u00e9chelles garde tout son effet.</strong> Il servait aussi \u00e0 ce module, mais il en a d\'autres lecteurs&nbsp;: les cartouches et le classement des r\u00e9sultats par niveau continuent de s\'appuyer dessus.',
                '<strong>La fen\u00eatre «&nbsp;Soutenir Labo Codex&nbsp;» dit \u00e0 quoi on s\'abonne.</strong> «&nbsp;Suivre le projet&nbsp;» passe au-dessus de «&nbsp;Avec tes moyens&nbsp;», et les trois abonnements nomment le <strong>blogue Codex Numeris</strong>&nbsp;: l\'abonnement gratuit et l\'abonnement de soutien sont deux niveaux du m\u00eame abonnement au blogue, et c\'est lui qui finance Labo Codex. Rien ne le disait, et \u00e7a se lisait comme un abonnement \u00e0 l\'application.',
                '<strong>Les quatre modes de sélection du portfolio font ce que leur nom annonce.</strong> «&nbsp;N derniers artefacts&nbsp;» retenait en réalité les N <em>meilleurs</em>, et «&nbsp;Hybride&nbsp;» ignorait le bloc Obligatoires&nbsp;: deux modes sur quatre retombaient sur le même calcul. <strong>Ta note du cours n\'était pas touchée</strong> — elle passe par un autre calcul, qui était déjà juste. Ce qui était faux, c\'est ce que le panneau Portfolio du profil cochait, et qu\'il enregistrait. En mode hybride, tu ne pouvais pas non plus cocher à la main autant d\'artefacts que la note en compte&nbsp;: le plafond suit maintenant la même règle (les N de la Sélection, plus les Obligatoires).',
                '<strong>Le seuil qui départage une force d\'un défi est celui que tu règles.</strong> Le diagnostic par critère utilisait 71,25&nbsp;% en dur pour reconnaître une force, pendant que ton curseur «&nbsp;Seuil de défi spécifique&nbsp;» décidait du défi. Un critère entre les deux était donc <strong>listé comme force et peint en couleur de défi</strong>. Les deux lisent maintenant ton curseur, et le titre affiche la valeur en vigueur au lieu d\'un nombre figé.',
                '<strong>Les repères de couleur du tableau de bord annoncent les bonnes valeurs.</strong> La légende disait 30-49&nbsp;/&nbsp;50-64&nbsp;/&nbsp;65-79&nbsp;/&nbsp;≥&nbsp;80&nbsp;%&nbsp;; les vraies bornes du dégradé sont 30&nbsp;/&nbsp;47,5&nbsp;/&nbsp;65&nbsp;/&nbsp;82,5. <strong>La barre ne change pas d\'un pixel</strong> — seuls les chiffres annoncés étaient faux, et ils se calculent désormais. Le glossaire dit aussi ce qu\'est vraiment cette barre&nbsp;: un dégradé continu, où la couleur d\'un point est interpolée, et non des paliers.',
                '<strong>Les trois seuils d\'interprétation servent enfin à quelque chose.</strong> Les trois champs «&nbsp;Fragile&nbsp;/&nbsp;Acceptable&nbsp;/&nbsp;Bon&nbsp;» de Labo&nbsp;›&nbsp;Outils d\'observation&nbsp;›&nbsp;Micro-données ACP&nbsp;›&nbsp;Seuils d\'interprétation (deux blocs à déplier, c\'est pourquoi on les cherche) gardaient la valeur que tu posais et te la remontraient, mais <strong>aucun calcul ne la lisait</strong>&nbsp;: la couleur des indices dans la liste et l\'interprétation de l\'assiduité et de la complétion restaient sur 70&nbsp;/&nbsp;80&nbsp;/&nbsp;85, quoi que tu règles. Les deux bouts sont rebranchés. ⚠ <strong>Si tu avais déjà déplacé un de ces curseurs, ton réglage prend effet maintenant</strong>&nbsp;: les couleurs de ta liste peuvent bouger. C\'est ton réglage qui s\'applique, aucune valeur nouvelle n\'a été posée à ta place.'
            ]
        },
        {
            version: '1.127',
            couleur: 'bleu',
            titre: 'Le Comparateur parle en six param\u00e8tres',
            items: [
                '<strong>Le tableau du Comparateur est rang\u00e9 sous les six param\u00e8tres de la recherche.</strong> Objet, r\u00e9visabilit\u00e9, agentivit\u00e9, communication, granularit\u00e9, d\u00e9termination\u00a0: les m\u00eames que ceux pr\u00e9sent\u00e9s dans l\'Aide. Les lignes n\'ont pas chang\u00e9 de sens et aucun chiffre ne bouge\u00a0\u2014 elles sont regroup\u00e9es, de sorte qu\'on voit sur quelle dimension deux pratiques diff\u00e8rent vraiment.',
                '<strong>Ce que l\'application ne couvre pas est \u00e9crit, pas tu.</strong> L\'agentivit\u00e9 \u2014 les choix et la flexibilit\u00e9 laiss\u00e9s \u00e0 l\'\u00e9tudiant\u00b7e \u2014 n\'a aucun r\u00e9glage dans Labo Codex, et le tableau le dit au lieu de laisser un blanc. M\u00eame chose pour les niveaux de la note du cours, et pour l\'alignement de la note sur des cibles d\'apprentissage l\u00e0 o\u00f9 elle porte sur des instruments. Un silence se lirait comme une lacune de ta pratique alors que c\'est une limite de l\'outil.',
                '<strong>Deux lignes neuves, sans rien \u00e0 configurer.</strong> «\u00a0Ce \u00e0 quoi la note se rapporte\u00a0» dit si elle porte sur des cibles d\'apprentissage ou sur des instruments d\'\u00e9valuation. «\u00a0Temporalit\u00e9 de la note\u00a0» rappelle que la note diff\u00e9r\u00e9e est un r\u00e9glage global, dans R\u00e9glages\u00a0\u203a\u00a0Pr\u00e9f\u00e9rences \u2014 pas un attribut de la pratique compar\u00e9e.',
                '<strong>Les r\u00e8gles sp\u00e9ciales d\'une pratique sommative ne sont plus entass\u00e9es sur une ligne.</strong> Le remplacement automatique appara\u00eet sous la r\u00e9visabilit\u00e9, le verrou et le plafonnement sous la d\u00e9termination, le portfolio sous l\'objet\u00a0: chacune l\u00e0 o\u00f9 elle agit.',
                '<strong>Le nombre de niveaux de ton \u00e9chelle a sa propre ligne.</strong> Il \u00e9tait gliss\u00e9 entre parenth\u00e8ses \u00e0 c\u00f4t\u00e9 du nom de l\'\u00e9chelle\u00a0; il se lit maintenant aussi sous la granularit\u00e9, o\u00f9 on le cherche.',
                '<strong>Ta grille de crit\u00e8res pour le d\u00e9pistage reste choisie.</strong> Elle se vidait d\'elle-m\u00eame, et il fallait la red\u00e9signer r\u00e9guli\u00e8rement sans que rien ne le signale. Deux causes, et aucune n\'\u00e9tait un geste de ta part\u00a0: l\'\u00e9cran des forces et d\u00e9fis effa\u00e7ait le r\u00e9glage chaque fois qu\'il ouvrait un profil avant que la base soit pr\u00eate, et le panneau des r\u00e9glages l\'\u00e9crasait d\u00e8s qu\'on touchait \u00e0 une case voisine pendant que la liste des grilles n\'\u00e9tait pas encore remplie. Le premier ne touche plus \u00e0 rien\u00a0; le second n\'enregistre un choix vide que si tu l\'as vraiment fait. <strong>Le r\u00e9glage d\u00e9j\u00e0 perdu ne revient pas tout seul\u00a0: d\u00e9signe ta grille une fois, elle tiendra.</strong> Et quand elle est introuvable dans le trimestre, le menu le dit, au lieu d\'afficher \u00ab\u00a0S\u00e9lectionner une grille\u00a0\u00bb comme si tu n\'avais rien choisi. Le message qui te r\u00e9clame une grille indique enfin le bon chemin \u2014 Labo\u00a0\u203a\u00a0Outils d\'observation, o\u00f9 le r\u00e9glage se trouve, et non Conception\u00a0\u203a\u00a0Pratiques de notation, o\u00f9 il n\'est plus.',
                '<strong>La fiche d\'une production ne laisse plus un grand vide au milieu.</strong> Sur un artefact, la description du type tombait tout en bas de la colonne de gauche, sous un espace blanc\u00a0: elle \u00e9tait align\u00e9e sur le bas de la colonne voisine, qui grandit quand la pondération dispara\u00eet \u2014 et les artefacts n\'en ont pas. La description occupe maintenant toute la largeur, juste sous les champs qui la d\u00e9terminent\u00a0; la case \u00ab\u00a0Travail diagnostique\u00a0\u00bb reste \u00e0 gauche avec la pond\u00e9ration, l\u00e0 o\u00f9 le poids d\'un travail se d\u00e9cide\u00a0; le bouton \u00ab\u00a0Pr\u00e9parer le PDF\u00a0\u00bb et les trois choix \u2014 grille, \u00e9chelle, cartouche \u2014 sont \u00e0 droite, leurs libell\u00e9s align\u00e9s au lieu de d\u00e9marrer \u00e0 trois hauteurs. <strong>Et le bouton d\'enregistrement des Outils d\'observation remonte aupr\u00e8s du titre</strong>, comme dans les autres pages, au lieu de s\'\u00e9taler tout en bas o\u00f9 on ne le voyait pas.',
                '<strong>Et le tableau se lit d\'un coup d\'\u0153il.</strong> Les en-t\u00eates ne se distinguaient pas des lignes qu\'ils coiffent — passer de deux \u00e0 huit rendait le tableau confus. Titres de section, param\u00e8tres et lignes ont maintenant trois traitements distincts, en mode clair comme en mode sombre. Au passage&nbsp;: une case de r\u00e8gle sommative porte enfin le m\u00eame nom partout — l\'assistant faisait cocher «\u00a0Verrou sur une \u00e9valuation\u00a0» et son r\u00e9capitulatif r\u00e9pondait «\u00a0Verrou d\'\u00e9valuation\u00a0».',
                '<strong>Les mots de l\'application disent ce qu\'elle fait.</strong> Le texte d\'accueil de l\'Aide affirmait que le code est ouvert — le dépôt est privé depuis juin — et que tes données restent «&nbsp;en sécurité&nbsp;» chez toi, alors qu\'aucun chiffrement ne les protège sur ton appareil. Un paragraphe neuf, «&nbsp;Où vont tes données&nbsp;?&nbsp;», répond sans rien promettre&nbsp;: rien ne part vers un serveur, tu transportes ton travail par un fichier que tu déplaces toi-même, et le matériel que tu partages avec un collègue est signé et sous licence Creative Commons. <strong>La passerelle vers une IA est assumée</strong> plutôt que seulement niée&nbsp;: l\'application n\'en contient aucune, mais elle te fournit des gabarits vides à lui confier — jamais les données de tes élèves. Et en PAN&nbsp;–&nbsp;Standards, la note ne «&nbsp;repose&nbsp;» plus sur des cibles d\'apprentissage&nbsp;: elle les <strong>vise</strong>, et l\'Aide dit maintenant par quoi Labo Codex les lit aujourd\'hui — les traces retenues au portfolio. <strong> Et deux champs s\'appelaient «&nbsp;Niveau SOLO&nbsp;» sans désigner la même chose</strong>&nbsp;: dans ta grille, c\'est la <strong>complexité qu\'un critère exige</strong>&nbsp;; dans ton échelle, le <strong>palier qu\'un élève atteint</strong>. Sous un seul nom, «&nbsp;mon seuil est le relationnel&nbsp;» pouvait se lire comme si des critères passaient sous ce seuil. Ils s\'appellent maintenant «&nbsp;Complexité SOLO du critère&nbsp;» et «&nbsp;Palier SOLO du niveau&nbsp;» — l\'étiquette à l\'écran change, rien de ce qui est enregistré dans tes grilles ni dans tes échelles ne bouge.',
                '<strong>La fenêtre «&nbsp;Soutenir Labo Codex&nbsp;» se lit d\'un coup d\'œil.</strong> Quatre sections en liste deviennent <strong>trois blocs cadrés</strong>&nbsp;: «&nbsp;Avec ton temps&nbsp;», «&nbsp;Avec tes moyens&nbsp;» et «&nbsp;Suivre le projet&nbsp;», le contact en pied. Le bleu ne sert plus qu\'aux liens — les titres de section le portaient aussi, si bien que rien ne ressortait — et les filets entre les lignes disparaissent. <strong>Le blogue dit enfin sur quoi il porte</strong>&nbsp;: procédures, trucs et astuces de Labo Codex, et des analyses critiques sur la technologie, la pédagogie et l\'éducation.',
                '<strong>Le journal de bord d\'une évaluation redevient lisible.</strong> Son panneau s\'ouvrait <strong>sans fond</strong>&nbsp;: le contenu se lisait à même le voile de la fenêtre, et la liste des évaluations le traversait — bandeau bleu, pastilles d\'état, boutons. Repéré sur iPad, mais l\'écran ne changeait rien&nbsp;: le fond n\'existait nulle part. Le journal a maintenant le même panneau opaque que les autres fenêtres de l\'application, en mode clair comme en mode sombre, et ses étiquettes de détail (durée, note, niveau) se lisent au lieu de se deviner.',
                '<strong>Le bouton coccinelle ne sert pas qu\'aux bugs.</strong> Il annonçait «&nbsp;Signaler un bug&nbsp;», alors que la fenêtre porte deux modes depuis toujours&nbsp;: signaler un bug, ou partager un commentaire. Sans bug à déclarer, personne n\'avait de raison de l\'ouvrir. Il dit maintenant «&nbsp;<strong>Signaler un bug ou donner ton avis</strong>&nbsp;», et la fenêtre des Nouveautés porte un bouton «&nbsp;Donner ton avis&nbsp;» — là où il reste, plutôt que dans le bandeau de version, qui disparaît au bout de quelques instants.'
            ]
        },
        {
            version: '1.126',
            couleur: 'bleu',
            titre: 'L\'Aide ne confond plus une pratique avec la d\u00e9finition',
            items: [
                '<strong>La carte d\'aide sur les pratiques alternatives de notation ne d\u00e9crit plus une seule fa\u00e7on de faire.</strong> Elle d\u00e9finissait la PAN par la s\u00e9lection des N meilleurs artefacts \u2014 c\'est une mani\u00e8re de faire parmi d\'autres, pas la d\u00e9finition. Elle dit maintenant ce que les PAN ont en commun&nbsp;: le droit \u00e0 l\'erreur sans p\u00e9nalit\u00e9, et une note compos\u00e9e \u00e0 partir des traces les plus r\u00e9centes ou les plus repr\u00e9sentatives. <strong>Le glossaire de la R\u00e9f\u00e9rence rapide dit la m\u00eame chose</strong>&nbsp;: les entr\u00e9es \u00ab\u00a0PAN\u00a0\u00bb, \u00ab\u00a0Performance\u00a0\u00bb et \u00ab\u00a0Portfolio\u00a0\u00bb ne pr\u00e9sentent plus \u00ab\u00a0les N meilleurs artefacts\u00a0\u00bb comme la r\u00e8gle \u2014 c\'est une m\u00e9thode de s\u00e9lection parmi celles que tu peux choisir.',
                '<strong>Les quatre familles sont pr\u00e9sent\u00e9es c\u00f4te \u00e0 c\u00f4te, sans hi\u00e9rarchie.</strong> Sommative, PAN\u00a0\u2013\u00a0Standards, PAN\u00a0\u2013\u00a0Sp\u00e9cifications et PAN\u00a0\u2013\u00a0D\u00e9notation, chacune en une phrase, avec les m\u00eames mots que l\'assistant de configuration. La d\u00e9notation n\'est plus annonc\u00e9e comme \u00ab\u00a0\u00e0 venir\u00a0\u00bb\u00a0: elle est l\u00e0, et l\'assistant la configure.',
                '<strong>Six questions pour situer ta pratique.</strong> Objet, r\u00e9visabilit\u00e9, agentivit\u00e9, communication, granularit\u00e9, d\u00e9termination\u00a0: deux coll\u00e8gues qui se r\u00e9clament de la m\u00eame \u00e9tiquette peuvent r\u00e9pondre diff\u00e9remment \u00e0 chacune. C\'est une grille de lecture, pas un formulaire de plus \u00e0 remplir.',
                '<strong>La carte \u00ab\u00a0Choisir ta pratique de notation\u00a0\u00bb ne recommande plus de chiffres.</strong> Elle annon\u00e7ait \u00ab\u00a08-14 artefacts recommand\u00e9s\u00a0\u00bb et \u00ab\u00a03-4 jetons maximum\u00a0\u00bb, qui \u00e9taient les r\u00e9glages d\'une classe en particulier. Chaque famille dit d\u00e9sormais son principe, puis ce qu\'il y a \u00e0 r\u00e9gler \u2014 et un mot sur ce que la recherche observe des reprises, sans imposer de nombre.',
                '<strong>R\u00e9glages\u00a0\u203a\u00a0\u00c0 propos cite le rapport de recherche qu\u00e9b\u00e9cois sur les PAN.</strong> \u00ab\u00a0Laissons-les se tromper\u00a0\u00bb (rapport de recherche PAREA, C\u00e9gep Andr\u00e9-Laurendeau, 2026), d\'o\u00f9 vient la grille des six param\u00e8tres. Le lien vers le rapport complet et ses auteurs est dans la carte \u00ab\u00a0Sources et remerciements\u00a0\u00bb.'
            ]
        },
        {
            version: '1.125',
            couleur: 'vert',
            titre: 'Un travail qui repère sans compter',
            items: [
                '<strong>Une case « Travail diagnostique — ne compte dans aucun calcul », sur la fiche du travail.</strong> Pour ce qu\'on fait produire en début de trimestre afin de situer les élèves : le travail reste entier dans le dossier de chacun — copie, annotation, rétroaction, résultat — mais il ne pèse ni sur la note, ni sur la performance, ni sur la complétion, ni sur le palier RàI. Tu peux la cocher sur un travail déjà corrigé.',
                '<strong>Un élève arrivé en retard ne bascule plus en « Niveau 3 » à cause de ce travail-là.</strong> C\'était le piège de la première semaine : un seul travail dû et une seule copie corrigée suffisaient à déclarer « non-participation » ceux qui n\'avaient pas encore leur horaire. Le travail diagnostique ne déclenche plus ce verdict.',
                '<strong>Et il peut lever un signalement, dans tes mots.</strong> Sur chaque palier de ta grille de projection, une case « ce palier lève un signalement », et un champ où tu écris la phrase que TU veux lire — « Aide en français recommandée », « Reprise du module 2 à prévoir ». Elle apparaît à côté du palier RàI de l\'élève et dans la vue du groupe, avec le nombre d\'élèves concernés, pour voir l\'ampleur avant de contacter qui que ce soit. Rien n\'est écrit sur la copie de l\'élève, et rien n\'est écrit dans tes données : le signalement se recalcule, donc décocher un palier le fait disparaître.',
                '<strong>Le champ « CAF » de la fiche de l\'élève s\'appelle maintenant « Mesure d\'aide ».</strong> Il dit un fait administratif — l\'élève EST inscrit à une mesure — et rien dans l\'application ne suppose plus une discipline en particulier. Tes fichiers d\'élèves déjà constitués restent lisibles : l\'ancienne colonne est toujours reconnue à l\'import.',
                '<strong>Une grille importée se montre.</strong> Après « Importer des grilles (JSON) », la bibliothèque était bien mise à jour — mais la nouvelle venue s\'ajoutait tout en bas de la liste, hors de l\'écran, dans une fenêtre qui repartait du haut : rien ne bougeait sous les yeux. Elle est maintenant amenée à l\'écran et mise en évidence quelques secondes, pour qu\'on voie laquelle vient d\'arriver. Et quand un filtre la masque — la case « Masquer les éléments déjà dans la barre latérale », ou le matériel de démonstration en mode normal — l\'application le dit, au lieu d\'annoncer un import réussi devant une liste inchangée.',
                '<strong>Après avoir chargé un codex, l\'application ne se recharge plus dans le vide.</strong> Quand le serveur ne répond pas au moment précis du rechargement, la page pouvait être remplacée par un message d\'erreur du service d\'hébergement — juste après une importation, au pire moment. L\'application vérifie maintenant que le serveur répond avant de recharger ; s\'il ne répond pas, elle reste ouverte et dit que tes données sont enregistrées.',
                '<strong>Le bouton du mode annonce le bon mode.</strong> Dans « Annoter et évaluer », il pouvait afficher « Évaluer » alors qu\'on était en annotation — selon le chemin par lequel on était arrivé à l\'écran. Le libellé suit désormais le mode réel, quel que soit le trajet.',
                '<strong>Trois ajustements d\'affichage.</strong> Le menu « Actions » de la liste des évaluations a la même largeur d\'une ligne à l\'autre ; dans la palette des codes, un libellé long revient à la ligne au lieu de sortir du cadre ; et le bandeau de nouvelle version indique où les nouveautés se trouvent vraiment — la carte « Nouveautés » de l\'accueil, et non « Réglages › À propos ».'
            ]
        },
        {
            version: '1.124',
            couleur: 'orange',
            titre: 'Verrouiller une séance n\'efface plus ses présences',
            items: [
                '<strong>Cocher « Verrouillée » sur une date dont la séance n\'est pas affichée n\'efface plus les présences déjà saisies.</strong> Le verrouillage enregistrait au passage ce que l\'écran montrait ; quand la séance n\'était pas ouverte, l\'écran ne montrait rien, et les présences de cette date disparaissaient sans un mot — le cadenas se posant sur une séance vide. Seules les présences réellement affichées sont désormais remplacées. Cette correction empêche que ça se reproduise ; elle ne ramène pas une séance déjà perdue.',
                '<strong>Fini les notes à quinze décimales.</strong> Dans Évaluations \u203a Liste, la colonne « Note % » affichait « 92.52136752136752% ». Elle affiche « 92.5% », comme la note originale d\'une reprise le fait depuis toujours, juste à côté. Le calcul et la note enregistrée ne changent pas : c\'est l\'affichage qui montrait le nombre entier de la machine.',
            ]
        },
        {
            version: '1.123',
            couleur: 'orange',
            titre: 'Le Suivi ne compte plus une reprise deux fois, et ne déclare personne « non-participant » avant le premier travail',
            items: [
                '<strong>Une reprise remplace aussi dans le dépistage.</strong> La note du cours remplaçait déjà l\'originale ; le suivi des fondations, la performance du RàI, les moyennes par critère et le défi principal la comptaient encore. Un élève qui a repris et réussi n\'est plus lu au palier de sa première copie.',
                '<strong>« Non-participation » seulement quand un travail est dû et qu\'une copie du groupe est évaluée.</strong> Au début d\'un trimestre, la classe entière n\'est plus en « Non-participation, niveau 3 » : la carte RàI, la cible d\'intervention, la barre RàI du groupe et l\'alerte disent « En attente » tant qu\'il n\'y a rien à remettre.',
                '<strong>Le bouton « Rapport » d\'un profil produit un rapport.</strong> Il écrivait un message d\'erreur depuis mai. Ses nombres — assiduité, complétion, performance — sont désormais ceux du profil : « Performance : 77% (note du cours) », et la liste des évaluations qui comptent dans la note.',
                '<strong>Les courbes de performance des archives sont celles de l\'élève.</strong> Dans un cours sommatif, tous les élèves portaient la même courbe (la moyenne du groupe). Les captures déjà faites gardent leur valeur ; la prochaine écrit la bonne.',
                'Les observations d\'une intervention et deux champs du volet confidentiel sont échappés avant d\'entrer dans la page.',
                '<strong>Le texte copié vers Léa dit « Note finale : 63.5 % », plus « 63.5 %% ».</strong> La dernière ligne de la rétroaction générale doublait le signe de pourcentage (1.123.1).',
                '<strong>Le bilan copié vers Léa ne prend plus la copie pour son propre artefact précédent.</strong> Dès l\'enregistrement automatique, il annonçait « prioritaire depuis 3 productions » après un seul travail antérieur, et taisait « Progrès : I → D » et « Tu as progressé en… ». Il lit l\'historique comme la page de synthèse du PDF le fait déjà (1.123.1).',
                '<strong>Dans le profil d\'un élève, la vignette d\'un travail ouvre la copie.</strong> Sous « Travaux soumis », cliquer un travail menait à une page vide : l\'onglet Annoter et évaluer s\'activait sans que la section Évaluations s\'affiche. Le geste arrive d\'abord dans Évaluations, puis ouvre la copie (1.123.2).',
                '<strong>« Appliquer au cours actif » assigne vraiment la pratique au groupe-cours.</strong> Depuis juin, le bouton n\'appliquait que les réglages et disait « appliquée » ; le groupe-cours restait sans pratique, tout calculait en sommative et le profil parlait d\'une pratique « introuvable ». Le bouton assigne, la barre latérale marque « Active », et le profil dit « aucune pratique assignée » quand c\'est le cas. Une pratique adoptée depuis un modèle sommatif n\'est plus refusée pour une échelle qu\'elle n\'a pas à fournir (1.123.3). ⚠ Si ton profil affichait ce message : ouvre ta pratique et clique « Appliquer au cours actif » une fois.',
                '<strong>Le Cadre montre la pratique que tu viens d\'appliquer.</strong> Le formulaire du groupe-cours (Calendrier › Cadre) ne se remplissait qu\'au chargement de la page : une pratique appliquée dans Conception restait « À compléter » au champ 6 jusqu\'au rechargement. Il relit tes données chaque fois qu\'il s\'affiche. Et dans la barre latérale des pratiques, le badge « Active » se distingue des caractéristiques (1.123.4).',
                '<strong>« Copier tout » livre la rétroaction entière, même sans cartouche.</strong> Sur une grille dont le critère est algorithmique et qui n\'a pas de cartouche, la rétroaction générale restait vide et le collage ne portait que la spécifique et le bilan ; chaque phrase de la spécifique était coupée à 120 caractères, à l\'écran comme dans le collage. La générale s\'écrit avec ou sans cartouche (celle-ci n\'ajoute que son contexte et ses commentaires), et la spécifique porte les textes entiers (1.123.5).',
                '<strong>Dans la barre d\'annotation, le sélecteur de production se lit en entier.</strong> Son texte (« Portrait de lecteur/lectrice (28) ») était coupé au milieu des lettres : la boîte de 28 px recevait un padding prévu pour un champ de formulaire. Elle porte le sien (1.123.6).',
                '<strong>Le mode anonymisation fonctionne sur un trimestre neuf.</strong> Sur un trimestre qui n\'avait jamais été anonymisé (un nouveau trimestre, la démonstration), basculer en anonymisation vidait le Suivi : chaque lecture des élèves échouait sur une variable jamais déclarée, depuis février. Le mapping se crée et les écrans se remplissent (1.123.7).',
                '<strong>Dans la saisie des présences, « Annuler » ramène à la liste des étudiant·es, et « Rapport » reste disponible.</strong> Dès qu\'une date était choisie, la barre se reconstruisait sans le bouton « Rapport » (le PDF des présences devenait inatteignable) et son « Annuler » visait un écran qui n\'existe plus : l\'onglet Suivi restait blanc (1.123.7).',
                '<strong>Confirmer un import d\'élèves le dit.</strong> L\'import écrivait bien les élèves, puis échouait avant la confirmation : rien ne disait « N étudiant(s) importé(s) ». La notification donne le compte du lot importé et le compte du groupe (1.123.7).',
                '<strong>Enregistrer une intervention ne détruit plus ce que le formulaire n\'a pas montré.</strong> Décocher un élève absent effaçait sa note individuelle ; rouvrir une intervention planifiée sous un autre groupe-cours et l\'enregistrer retirait tous ses participants et leurs notes. Ce que le formulaire affiche s\'écrit tel quel ; le reste est conservé (1.123.7).',
                'Le titre et la description d\'une intervention, et les noms de la modale du tirage au sort, sont échappés avant d\'entrer dans la page (1.123.7).',
                '<strong>Sur iPad, les palettes se redimensionnent au doigt.</strong> Le coin inférieur droit de la palette des codes (et des palettes Annotation, Tampons et Évaluer) ne se laissait pas saisir sur l\'iPad : la poignée était celle du navigateur, que Safari ne montre pas au toucher. Le coin porte maintenant une vraie poignée, au doigt, au Pencil ou à la souris, et la taille choisie est retrouvée à la prochaine ouverture (1.123.8).',
                '<strong>La palette mise en bandeau (↔) ne couvre plus la copie.</strong> Elle prenait les trois cinquièmes de la hauteur de l\'écran même quand ses codes tenaient en deux lignes : le reste était vide, et posé sur le travail de l\'élève. Le bandeau prend maintenant la hauteur de ce qu\'il contient (1.123.9).',
                '<strong>Sur iPad, le zoom de la carte d\'alignement suit les doigts.</strong> Pincer pour agrandir ou réduire la carte accrochait, et le zoom se recentrait sur le milieu de l\'écran plutôt que sur l\'endroit pincé : deux mécanismes de zoom tournaient en même temps sur le même geste, et chacun refaisait la mise en page de toute la carte à chaque instant. Le pincement se comporte maintenant comme dans Annoter et Évaluer. Au trackpad, le zoom suit l\'ampleur du geste plutôt que sa cadence (1.123.10).',
                '<strong>Sur iPad, les bulles blanches des barres de dégradés se saisissent au doigt.</strong> Une bulle fait dix pixels et elle bouge : la toucher tenait de la chance. Un toucher à côté saisit maintenant la bulle la plus proche, et c\'est bien la plus proche du doigt qui est prise, pas celle qui se trouve au-dessus des autres. Le premier toucher ouvre l\'infobulle directement, au lieu de servir de survol pour rien. À la souris, rien ne change (1.123.11).',
                '<strong>Une note qui ne se construit pas encore n\'est plus comptée comme un zéro.</strong> Dans Suivi › Groupe, tant que ta pratique n\'a pas de quoi construire la note du cours (une PAN-Standards qui attend ses artefacts, en début de trimestre), la barre Performance rangeait tout le groupe dans « Incomplet ou insuffisant », annonçait « 28 étudiant·es en difficulté » et plaçait tout le monde au « Niveau 3 — Intensif » — pendant que la barre des patterns, elle, lisait les copies et disait « Progression stable ». La carte ne répartit plus que les élèves dont la note existe, et dit combien restent en attente. Le palier RàI se décide alors sur le dépistage seul, la même donnée que la barre des patterns (1.123.12).',
            ]
        },
        {
            version: '1.122',
            couleur: 'orange',
            titre: 'La note du cours ne compte plus les brouillons, et les spécifications calculent',
            items: [
                '<strong>Une évaluation en brouillon n\'entre plus dans la note du cours.</strong> Une copie non enregistrée (enregistrement automatique en cours, reprise pas encore réévaluée, copie déverrouillée pour modification) ou enregistrée sans aucun critère ne compte plus, dans les quatre pratiques de notation. Le profil et l\'export des résultats disent combien ont été écartées : « 2 évaluations en brouillon, non comptées ».',
                '<strong>Une pratique par spécifications configurée dans l\'application calcule.</strong> Le « Modèle simple », l\'éditeur de gabarit et leurs forfaits (« Excellence », « Réussite ») rendaient 0 % à toute la classe : le moteur ne lisait pas leur forme. Il la lit maintenant, et un type de travail nommé « Examen » ou « Projet » s\'apparie aux productions du même type. Rien n\'est réécrit dans tes pratiques.',
                '<strong>Plus de « 0 » qui a l\'air d\'une note.</strong> Au premier calcul d\'un trimestre, pour un élève qu\'on vient d\'ajouter, ou dans l\'export lancé avant un recalcul, une pratique sommative ou par spécifications affichait 0 % comme un résultat. Elle calcule sa note tout de suite, et dit « non constructible » quand il n\'y a rien à calculer.'
            ]
        },
        {
            version: '1.121',
            couleur: 'orange',
            titre: 'Trois chemins où une note pouvait se tromper sont fermés',
            items: [
                '<strong>Une échelle introuvable ne fait plus enregistrer un zéro.</strong> Si l\'échelle de performance d\'une copie n\'existe plus dans le trimestre (supprimée, ou grille importée sans son échelle), Enregistrer refuse et nomme l\'échelle à choisir. Avant, un 0 s\'écrivait en silence, la liste l\'affichait « - » et la note du cours le comptait.',
                '<strong>Effacer les codes ou le nombre de mots d\'un critère algorithmique efface aussi son résultat.</strong> La note se recalcule tout de suite et le critère redevient « sans niveau ». Avant, l\'ancien pourcentage restait en mémoire, s\'enregistrait, et le PDF pouvait imprimer « 0 erreur → 87,5 % ».',
                '<strong>Rouvrir une copie et changer un niveau : l\'enregistrement automatique et le bilan suivent.</strong> Ils écrivaient la nouvelle note avec les anciens niveaux par critère, et le bilan gardait l\'ancien défi ; les deux lisent maintenant ce que le calcul a lu.'
            ]
        },
        {
            version: '1.120',
            couleur: 'bleu',
            titre: 'La carte « Bilan » ne dit que ce que l\'élève lit',
            items: [
                '<strong>La carte « Observation » s\'appelle « Bilan ».</strong> Dans un critère algorithmique, elle ne porte plus que les deux phrases qui vont dans le bilan de l\'élève (« Défi prioritaire », « Quand tout est maîtrisé ») et le menu du modèle, renommé « Modèle des phrases (bilan et décompte) ». Rien n\'est écrit à deux endroits.',
                '<strong>« Aucune annotation » a déménagé.</strong> Cette phrase, que toi seul lis, vit maintenant dans la liste « Sous-critères », sous la case des codes d\'annotation, dans un pli « Quand la copie ne porte aucun code ».',
                '<strong>Le modèle « Français écrit » porte son vrai nom.</strong> Plus de « formulations d\'origine » ni de numéro de fiche dans le menu ; sa description dit quand le choisir et quand préférer « Générique ». Tes grilles et ce que tes élèves ont déjà reçu ne changent pas.'
            ]
        },
        {
            version: '1.119',
            couleur: 'vert',
            titre: 'Les badges s\'affichent dans la phrase, tes réglages de projection s\'enregistrent sous un nom',
            items: [
                '<strong>Le badge s\'affiche dans la phrase.</strong> Dans toute zone qui offre des badges (verdict, recommandation, décompte, énoncés), un badge posé se montre comme une pastille dans le fil du texte, plus comme « {erreurs} ». Il s\'efface d\'un coup, par la touche d\'effacement ou par sa croix. Ce qui est enregistré ne change pas : tes grilles gardent le même texte.',
                '<strong>Tes réglages de projection sous un nom.</strong> Dans la carte « Ce que l\'élève lit », « Enregistrer ces paliers sous un nom… » garde le modèle, ses réglages et ses paliers ; tu les retrouves sous « Mes collections » dans le menu de projection de toutes tes grilles. Choisir une collection copie ses valeurs dans le critère : la corriger ou la supprimer ensuite ne change aucune grille, ni ce qu\'un élève a déjà lu.',
                '<strong>Une seule liste pour les sous-critères et les codes.</strong> La carte « Codes d\'annotation » disparaît : la case « Utiliser ces sous-critères comme codes d\'annotation » est en tête de la liste ; cochée, chaque rangée montre sa couleur et un pli « Observation » qui porte le texte du code. Une ligne dit où vit la palette générale.',
                '<strong>Les mêmes gestes partout.</strong> La corbeille remplace le « ✕ » rouge dans la bibliothèque, la pratique de notation et l\'éditeur d\'échelles ; les chevrons à côté du nom remplacent la colonne « Ordre ». Ce que chaque suppression fait et dit ne change pas.',
                '<strong>Sur iPad en portrait, les formulaires à deux colonnes s\'empilent</strong> (le groupe-cours, les paliers), l\'étiquette au-dessus de chaque champ.',
                '<strong>Rien ne change dans tes grilles ni tes évaluations enregistrées</strong> ; les grilles partagées et importées gardent leur texte.'
            ]
        },
        {
            version: '1.118',
            couleur: 'vert',
            titre: 'Ce que l\'élève lit se compose en une seule carte, avec des badges',
            items: [
                '<strong>Une seule carte pour ce que l\'élève lit.</strong> « Projection » s\'appelle maintenant « Ce que l\'élève lit » et se lit de haut en bas comme la phrase de l\'élève : le décompte des erreurs (venu de la carte « Observation »), puis les paliers, chacun avec son verdict et sa recommandation. « Observation » garde le modèle et les énoncés du bilan.',
                '<strong>Huit badges dans chaque palier.</strong> Tu poses service, seuil, longueur, erreurs, mots, moyenne, projection ou palier au curseur, dans le verdict ou la recommandation, comme dans le décompte.',
                '<strong>La phrase se remplit pour chaque élève.</strong> Le badge « moyenne » remplace la phrase « Tu fais en moyenne 1 erreur à chaque N mots » : un palier sans badge la garde telle quelle ; un palier qui en porte un dit exactement ce que tu as écrit.',
                '<strong>« L\'élève lira » sous chaque palier.</strong> En gris ce que l\'application engendre, le décompte et la moyenne ; dans l\'encre, ton verdict et ta recommandation, remplis pour une copie fictive du palier. La ligne se met à jour quand tu quittes le champ ; un badge inconnu se signale en orange.',
                '<strong>Corrige avec l\'application à jour.</strong> Un onglet ouvert d\'avant cette version ne connaît pas les badges : il écrirait « {erreurs} » tel quel dans la rétroaction de l\'élève, et cette rétroaction s\'enregistre à la correction. Recharge avant de corriger avec une grille qui porte des badges.',
                '<strong>Tes grilles existantes ne changent pas.</strong> Un palier écrit sans badge se lit comme avant ; les grilles partagées et importées gardent leur texte.'
            ]
        },
        {
            version: '1.117',
            couleur: 'vert',
            titre: 'Le gabarit du critère algorithmique se range, et une grille analytique a ses paliers',
            items: [
                '<strong>Le critère algorithmique s\'ouvre sur ses sous-critères.</strong> Ils viennent en tête, puis quatre cartes repliables : la formule ouverte, le commentaire, la projection et les codes repliés. Une carte reste comme tu l\'as laissée pendant que tu tapes.',
                '<strong>Les paliers de projection tiennent sur deux rangées</strong>, numérotés, le nom du palier lisible en entier. « Modèle de rétroaction » s\'appelle maintenant « Modèle d\'observation », et « Norme externe (épreuve uniforme) », « Projection à l\'EUF ».',
                '<strong>Un critère algorithmique neuf naît sans projection.</strong> Tu choisis la projection à l\'EUF si tu la veux ; tes critères existants gardent la leur.',
                '<strong>Une grille analytique attache sa cartouche à des paliers en %.</strong> Le champ dit « Paliers (bornes en %) », l\'échelle de départ est déjà choisie, et les colonnes de la cartouche portent les bornes de ton échelle (« 65–74,99 % ») au lieu des noms de niveaux.',
                '<strong>« Aucun » au menu « Niveau SOLO ».</strong> Le critère compte dans la note comme les autres, mais le dépistage des fondations ne le surveille pas.',
                '<strong>Un seul geste pour supprimer, un seul pour déplacer</strong>, dans l\'éditeur de grille : la corbeille en coin, et les chevrons à côté d\'elle, pour les critères comme pour les sous-critères. « Description » s\'appelle « Descripteur ».',
                '<strong>Rien ne change dans tes grilles ni tes évaluations enregistrées.</strong>'
            ]
        },
        {
            version: '1.116',
            couleur: 'vert',
            titre: 'Une grille analytique se note en points, et l\'élève ne lit que le chiffre',
            items: [
                '<strong>Un champ « sur 30 » à la place du menu de niveaux.</strong> Sur un critère analytique, tu tapes des points sur le poids du critère : 24 sur 30 fait 80 %. Le champ vide affiche « – » ; un vrai zéro se tape.',
                '<strong>Le chiffre trouve son niveau, et ta cartouche s\'ouvre.</strong> 24 sur 30 tombe dans un niveau de ton échelle, et la rétroaction que tu as attachée à ce niveau apparaît, sans que tu choisisses de niveau nulle part.',
                '<strong>L\'élève ne voit que le chiffre.</strong> Sur son PDF, dans le texte copié vers LÉA et dans le bilan, un critère analytique dit « 24 / 30 », jamais le niveau qui a servi à choisir le commentaire. Sur une grille entièrement analytique, la légende des niveaux disparaît du PDF.',
                '<strong>Le critère analytique compte partout.</strong> Il entre dans l\'évaluation enregistrée avec ses points, donc le dépistage, le profil de l\'élève et les archives le voient comme les autres.',
                '<strong>Rien ne change pour tes critères holistiques et algorithmiques</strong>, ni pour tes évaluations déjà enregistrées.'
            ]
        },
        {
            version: '1.115',
            couleur: 'vert',
            titre: 'Ta grille déclare sa manière d\'évaluer, et ses critères en héritent',
            items: [
                '<strong>Un menu « Type de la grille », à côté du nom.</strong> Choisis holistique, analytique ou algorithmique en créant ta grille : chaque critère neuf reçoit ce type sans que tu aies rien à cocher. Le menu de chaque critère reste là pour déroger. Le type voyage avec la grille au partage et à l\'import.',
                '<strong>Tes grilles existantes ne changent pas.</strong> Leur menu dit « Non précisé », et une ligne dessous dit ce que leurs critères sont — « Tes critères sont tous holistiques. » Le badge de composition continue de dire ce qui est vraiment dans la grille : une grille déclarée analytique dont un critère passe en algorithmique affiche MIXTE.'
            ]
        },
        {
            version: '1.114',
            couleur: 'vert',
            titre: 'Les codes d\'annotation suivent ta grille, et les phrases de rétroaction se composent sans rien taper',
            items: [
                '<strong>Une grille peut fournir ses propres codes d\'annotation.</strong> Sous le critère algorithmique, coche « Utiliser ces sous-critères comme codes d\'annotation » : dans Annoter, la palette Codes montre tes sous-critères — numéro, nom, couleur et rétroaction — pour toute copie évaluée avec cette grille. Un enseignant de philosophie pose « Thèse non dégagée » ; il n\'avait aucun chemin.',
                '<strong>Rien ne change tant que tu ne coches pas.</strong> Les dix codes de départ restent la palette de toute grille sans ce geste, avec tes noms, couleurs, ordre et textes. Sur une copie gouvernée par sa grille, l\'engrenage de la palette te dit d\'où viennent les codes et où les modifier.',
                '<strong>Chaque sous-critère porte sa couleur</strong>, choisie parmi les douze de la palette ou hors palette, et le sélecteur se referme quand tu cliques ailleurs. Le geste et les couleurs voyagent avec la grille au partage et à l\'import.',
                '<strong>Les phrases de rétroaction d\'un critère algorithmique se composent en posant des repères d\'un clic</strong> — {critere}, {erreurs}, {mots}, {points} — au-dessus de chaque zone : plus d\'accolade à taper, un repère ne se pose jamais au milieu d\'un mot, et chaque zone n\'offre que ce qui y vaut quelque chose. Tes textes existants sont inchangés.',
                '<strong>Les cases « Pratiques compatibles » sont parties</strong> des grilles, échelles, cartouches, objectifs et productions : elles ne faisaient rien. Les grilles portent à la place un badge qui dit leur composition — ALGO, HOLIS, ANALY ou MIXTE — déduit de leurs critères.',
                'L\'écran de réglage des dix codes s\'intitule « Rétroactions — Codes d\'annotation ». Codes et tampons sont deux palettes : le code identifie un élément du travail, le tampon le commente.'
            ]
        },
        {
            version: '1.113',
            couleur: 'vert',
            titre: '« Décloner » : un seul mot, et le geste là où on le cherche',
            items: [
                '<strong>« Détacher de sa famille de clones » s\'appelle désormais « Décloner ».</strong> Le mot que tu cherchais dans l\'application y est maintenant, dans les boutons comme dans l\'aide.',
                '<strong>L\'Inspecteur d\'un bloc cloné offre « Décloner »</strong>, à côté de « N instances · Voir les autres ». Là où tu vois les instances, tu peux en sortir — sans passer par le menu Actions.',
                '<strong>Rien n\'est supprimé.</strong> Le bloc devient indépendant : il cesse de suivre son original, et son contenu ne bouge pas. Sur l\'original, ce sont tous ses clones qui deviennent indépendants.',
                'Le menu Actions garde « Décloner la sélection » pour plusieurs blocs à la fois, et l\'aide de la carte nomme les deux chemins.'
            ]
        },
        {
            version: '1.112',
            couleur: 'vert',
            titre: 'Supprimer une échelle, c\'est la remplacer',
            items: [
                '<strong>Supprimer une échelle que des évaluations emploient n\'est plus un saut dans le vide : l\'application te demande par quelle échelle la remplacer, et tout ce qui la nommait suit</strong> — évaluations, productions, pratiques de notation, grilles et cartouches du trimestre. L\'ancienne n\'est retirée qu\'après. Avant, selon l\'écran, elle partait sans un mot, ou le bouton se bloquait sans dire quoi faire.',
                '<strong>Seules les échelles aux mêmes niveaux sont proposées.</strong> Une évaluation retient le niveau de chaque critère par son code (I, D, M, E…) : un remplacement vers une échelle aux codes différents laisserait les notes sans correspondance. S\'il n\'existe aucune échelle compatible, l\'écran le dit, nomme les codes, et ne touche à rien.',
                '<strong>Dans un trimestre archivé, l\'application refuse</strong>, et dit que le remplacement toucherait des notes déjà remises.',
                '<strong>Une échelle que rien n\'emploie se supprime comme avant, sans un mot de plus.</strong> Ce n\'est pas un déchet : c\'est peut-être un projet qui n\'est pas terminé.',
                'La même question, avec le choix du remplacement, depuis l\'onglet Données — où le bouton restait bloqué sur « Suppression impossible » sans issue.'
            ]
        },
        {
            version: '1.111',
            couleur: 'orange',
            titre: 'La note dit sur quoi elle porte',
            items: [
                '<strong>Un critère laissé sans niveau ne fait plus monter la note en silence.</strong> Avant, il sortait du calcul et les autres critères se partageaient ses points : sur une grille 50/30/20, une copie à 84 % passait à 95 % dès que le critère à 20 % n\'avait pas de niveau. Maintenant la note affiche « -- », et une ligne sous elle <strong>nomme le critère et son poids</strong>. Dès qu\'il reçoit son niveau, la note revient, sans un mot de plus.',
                '<strong>Enregistrer refuse une évaluation incomplète, et te dit pourquoi</strong> — mais <strong>ton travail est conservé en brouillon</strong> : la copie reste ouverte, rien ne se perd, tu complètes et tu enregistres.',
                '<strong>Le PDF de l\'élève refuse de conclure</strong> tant que la note ne porte pas sur toute la grille : à la place du niveau général, il écrit « Cette copie n’a pas de niveau général : <em>tel critère</em> reste à évaluer. » Et l\'export te l\'annonce avant la remise.',
                '<strong>Une échelle dont les niveaux n\'ont pas de valeur ponctuelle est dite</strong>, au lieu de rendre « 0,0 % » comme un résultat. C\'était le cas des copies des anciennes échelles disciplinaires : la ligne sous la note te dit quels niveaux sont muets, et où leur donner une valeur.',
                '<strong>Chaque évaluation enregistre désormais sur quelle part de la grille sa note a été calculée.</strong> Les évaluations déjà en base sont relues à partir de leurs critères : celles qui étaient incomplètes le sont dites, sans qu\'aucune note soit réécrite.',
                '<strong>Le nom de la grille est imprimé dans l\'en-tête du PDF</strong>, sous la ligne de l\'élève.',
                '⚠ <strong>Un critère ajouté dans l\'éditeur de grille en lignes naît maintenant avec son identifiant.</strong> Depuis octobre 2025, cet éditeur en créait sans, et l\'écran d\'évaluation confondait alors ces critères en un seul : le niveau choisi sur l\'un valait pour tous, et le PDF répétait la description du premier. <strong>Si le PDF d\'une copie répète la même description sous plusieurs critères, ta grille est concernée</strong> : supprime ces critères et recrée-les dans l\'éditeur, puis réévalue les copies faites avec.',
                '<strong>Les fenêtres de suppression disent ce qui part, et ce qui reste.</strong> Supprimer une cartouche depuis la liste nomme sa grille (« Supprimer la cartouche «X» de sa grille « G » ? ») et dit que c\'est sans retour ; avant, elle demandait seulement « Es-tu sûr ? ». Si une copie vit aussi dans la Bibliothèque, ou si des évaluations emploient la cartouche, la question le dit : <strong>la copie reste, et les rétroactions déjà rédigées sont conservées</strong>. Depuis la Bibliothèque, « Supprimer » dit s\'il retire la cartouche de sa grille <em>et</em> de la Bibliothèque, ou de la Bibliothèque seulement. Supprimer pour de bon la copie d\'un élève dit désormais : <strong>« Le fichier, ses annotations et toutes les évaluations de cet élève pour cette production seront effacés. »</strong> Quand rien de plus ne part, la question reste courte. Et « la bibliothèque partagée » s\'appelle maintenant <strong>« la Bibliothèque »</strong>, partout : ce qu\'elle contient sont tes copies — un document reçu d\'un collègue est indépendant de son original, et le supprimer ne change rien chez lui.'
            ]
        },
        {
            version: '1.110',
            couleur: 'orange',
            titre: 'Ton interface ne parle plus d\'une mati\u00e8re ni d\'un service qui ne sont pas les tiens',
            items: [
                '<strong>Le service d\'aide propos\u00e9 \u00e0 tes \u00e9l\u00e8ves porte le nom que TU lui donnes.</strong> Le r\u00e9glage existait ; ce qui changeait, c\'est ce qu\'il proposait par d\u00e9faut. Il annon\u00e7ait « Centre d\'aide en fran\u00e7ais (CAF) » \u2014 un service qui n\'existe pas dans tous les coll\u00e8ges, et qui a chang\u00e9 de nom dans certains. Le d\u00e9part est maintenant <strong>« Centre d\'aide du coll\u00e8ge »</strong>, et le champ s\'appelle simplement « Nom du service d\'aide ». ⚠ <strong>Si tu avais d\u00e9j\u00e0 inscrit le tien, ta valeur ne bouge pas.</strong>',
                '<strong>La phrase lue par l\'\u00e9l\u00e8ve ne nomme plus de discipline</strong> : « … au service d\'aide de ton coll\u00e8ge : <em>le nom que tu as inscrit</em>. » Si tu laisses le nom vide, la recommandation dispara\u00eet proprement au lieu de laisser une phrase bancale.',
                '<strong>Le plan de rattrapage ne pr\u00e9suppose plus les services de ton \u00e9tablissement.</strong> Les trois lignes qui nommaient des sigles (« SA », « CAF ») disent d\u00e9sormais « du coll\u00e8ge », sans supposer qu\'il en existe un.',
                '<strong>Aucune pratique offerte \u00e0 l\'adoption n\'affiche plus de mati\u00e8re.</strong> Sept d\'entre elles annon\u00e7aient Chimie, Litt\u00e9rature, Math\u00e9matiques, Philosophie ou Biologie, et nommaient un c\u00e9gep pr\u00e9cis. Elles n\'annoncent plus rien de tel : seules TES pratiques peuvent porter ta discipline.',
                '<strong>Plus aucun nom de personne dans le code de l\'application.</strong> Des identifiants, des constantes et une quarantaine de commentaires portaient le pr\u00e9nom du coll\u00e8gue ou du testeur dont le mat\u00e9riel avait servi d\'exemple. Ce code est servi au navigateur de tout le monde : un nom grav\u00e9 dedans est un nom publi\u00e9 sans qu\'on l\'ait demand\u00e9 \u00e0 son porteur.'
            ]
        },
        {
            version: '1.109',
            couleur: 'orange',
            titre: 'Le mat\u00e9riel fourni ne se r\u00e9clame plus d\'une discipline',
            items: [
                '<strong>Cinq mod\u00e8les de pratique nomm\u00e9s par discipline sont retir\u00e9s</strong> (Chimie, Comptabilit\u00e9, G\u00e9ographie, Philosophie \u00d72). Ils avaient \u00e9t\u00e9 engendr\u00e9s par une IA, <strong>aucun enseignant de ces mati\u00e8res ne les avait valid\u00e9s</strong>, et leur justesse \u00e9tait inconnue. C\'est la m\u00eame raison qui avait fait retirer les huit \u00e9chelles disciplinaires. ⚠ <strong>Si tu en avais adopt\u00e9 un dans tes propres pratiques, ta copie reste telle quelle</strong> — elle t\'appartient.',
                '<strong>Il reste au moins un mod\u00e8le par famille</strong> (jugement, sp\u00e9cifications, standards, sommative). Le mod\u00e8le sommatif est conserv\u00e9 et s\'appelle maintenant « Mod\u00e8le sommatif » : il vient d\'une pratique r\u00e9elle au coll\u00e9gial, ce que sa description dit d\u00e9sormais, au lieu de se pr\u00e9senter comme le mod\u00e8le d\'une mati\u00e8re.',
                '<strong>Les quatre modes de calcul par objectifs perdent leur \u00e9tiquette de mati\u00e8re.</strong> « Comptage (Chimie) » devient « Comptage », et ainsi de suite : ce sont des m\u00e9caniques de calcul, utilisables dans n\'importe quelle discipline. Rien n\'est supprim\u00e9, seulement d\u00e9baptis\u00e9.',
                '<strong>Les mod\u00e8les de forfaits disent ce qu\'ils font</strong> : « Forfaits progressifs », « Forfait unique », « Forfaits flexibles » — au lieu de « Mod\u00e8le Sciences » et « Mod\u00e8le Litt\u00e9rature », qui invitaient une discipline \u00e0 se reconna\u00eetre. Tes pratiques d\u00e9j\u00e0 cr\u00e9\u00e9es affichent le nouveau nom sans rien changer \u00e0 leur configuration.',
                '<strong>Quand aucun mod\u00e8le n\'est disponible, l\'\u00e9cran le dit</strong> — et il <strong>nomme la famille</strong> concern\u00e9e (« Aucun mod\u00e8le « Sommative » fourni »), au lieu de rester vide sans explication.',
                '<strong>Le mod\u00e8le sommatif ne reproduit plus la pratique d\'une seule personne.</strong> Ses \u00e9valuations et ses crit\u00e8res \u00e9taient ceux d\'un cours de litt\u00e9rature — « Analyse partielle », « Coh\u00e9rence textuelle », un double verrou, un portfolio de 5 \u00e0 7 travaux. Il propose maintenant <strong>deux travaux et deux examens</strong>, et <strong>les quatre crit\u00e8res de la grille de d\u00e9part</strong> (Compr\u00e9hension, Application, Analyse, Synth\u00e8se) : le m\u00eame vocabulaire des deux c\u00f4t\u00e9s. ⚠ <strong>Si tu l\'avais d\u00e9j\u00e0 adopt\u00e9, ta copie reste telle quelle.</strong>'
            ]
        },
        {
            version: '1.108',
            couleur: 'vert',
            titre: 'Une r\u00e9troaction ne parle que de ta discipline',
            items: [
                '<strong>Le mot « fran\u00e7ais » ne s\'imprime plus dans le PDF d\'un \u00e9l\u00e8ve dont le crit\u00e8re s\'appelle autrement.</strong> Un crit\u00e8re qui compte des erreurs \u00e9tait titr\u00e9 « Fran\u00e7ais \u00e9crit » sur la copie remise, et la phrase engendr\u00e9e annon\u00e7ait « Ta r\u00e9daction contient N erreurs de fran\u00e7ais » — quelle que soit la mati\u00e8re enseign\u00e9e. Le titre porte maintenant <strong>le nom que tu as donn\u00e9 \u00e0 ton crit\u00e8re</strong>, et la phrase ne nomme plus aucune discipline.',
                '<strong>Tes textes actuels ne changent pas d\'un caract\u00e8re.</strong> Un crit\u00e8re dont le nom dit « fran\u00e7ais » garde exactement les phrases d\'avant : tes \u00e9l\u00e8ves ne verront aucune diff\u00e9rence. Les \u00e9valuations d\u00e9j\u00e0 enregistr\u00e9es gardent aussi le texte qu\'elles portaient — rien n\'est r\u00e9\u00e9crit dans ton dos. <strong>Ce qui change, c\'est pour les autres mati\u00e8res</strong> : un crit\u00e8re \u00e0 compte d\'erreurs dont le nom ne dit pas « fran\u00e7ais » re\u00e7oit d\u00e9sormais la phrase neutre, sans nom de discipline.',
                '<strong>Les quatre phrases d\'un crit\u00e8re \u00e0 compte d\'erreurs se r\u00e8glent depuis le gabarit de la grille</strong> : le d\u00e9compte, le d\u00e9fi prioritaire, ce qui reste \u00e0 travailler, et l\'\u00e9tat « aucune annotation ». Tu peux les r\u00e9\u00e9crire dans tes mots, ou <strong>vider une zone pour faire taire la phrase</strong>. Deux mod\u00e8les de d\u00e9part : g\u00e9n\u00e9rique, ou les formulations d\'origine.',
                '<strong>Ces phrases voyagent avec la grille</strong> quand tu la partages ou l\'exportes. Ce que tu as r\u00e9\u00e9crit arrive chez la personne qui la re\u00e7oit, au lieu d\'\u00eatre remplac\u00e9 en silence par les textes par d\u00e9faut.'
            ]
        },
        {
            version: '1.107',
            couleur: 'vert',
            titre: 'Le matériel de départ calcule, et se dit « de départ »',
            items: [
                '<strong>Les huit échelles « disciplinaires » de la bibliothèque (Chimie, Bio, Philo, Info, Géo…) sont retirées.</strong> Aucun de leurs niveaux ne portait de valeur de calcul : une première évaluation faite avec l\'une d\'elles rendait <strong>0,0 %</strong>, sans un mot. ⚠ Si tu en avais déjà ajouté une à ta sélection, <strong>ta copie reste telle quelle</strong> — l\'application ne réécrit pas ce qui est déjà chez toi. Remplace-la par l\'échelle de départ ci-dessous.',
                '<strong>Une échelle de départ qui calcule vraiment arrive dans un espace neuf.</strong> Grille, cartouche et échelle : le triptyque est maintenant complet dès la première ouverture, et une première évaluation produit une vraie note. Elle est modifiable et supprimable comme les tiennes.',
                '<strong>Le matériel fourni se dit « de départ ».</strong> Grille de départ, Cartouche de départ, Échelle de départ (IDME) — pour qu\'on ne le confonde plus avec ce que tu as créé toi-même. ⚠ Dans un espace déjà en place, les noms actuels ne changent pas.',
                '<strong>Choisir une grille sans échelle dit maintenant ce qui manque</strong>, au lieu de ne rien afficher du tout.',
                '<strong>Cinq gabarits « [SPE] » qui revenaient après chaque suppression sont retirés pour de bon.</strong> Ils se réinscrivaient à chaque ouverture de la page. La pratique de notation par spécifications, elle, est intacte.',
                '<strong>À l\'import de productions, un numéro d\'élève absent du groupe est annoncé avant</strong>, et le fichier reste visible dans la liste après, au lieu de disparaître sans trace. Un import lancé sans groupe-cours actif est refusé, et le refus est dit.',
                '<strong>L\'application n\'est plus accessible que par app.codexnumeris.org.</strong> Si tu avais mis en signet une adresse en .netlify.app, elle t\'y redirige. On te demandera ton adresse courriel, puis tu y recevras un code de connexion. Il ouvre une session valable un mois.'
            ]
        },
        {
            version: '1.106',
            couleur: 'vert',
            titre: 'Les rep\u00e8res se posent partout o\u00f9 l\'\u00e9chelle se pense',
            items: [
                '<strong>Correction : le texte d\'exemple d\'un gabarit de r\u00e9troaction ne part plus dans le PDF de l\'\u00e9l\u00e8ve.</strong> Quand un crit\u00e8re de fran\u00e7ais \u00e9tait corrig\u00e9 sans cat\u00e9gories d\'erreurs, l\'amorce du gabarit \u00e9tait enregistr\u00e9e comme si tu l\'avais \u00e9crite, puis remise \u00e0 l\'\u00e9l\u00e8ve. Corrig\u00e9 des deux c\u00f4t\u00e9s : pour les corrections \u00e0 venir, et pour celles d\u00e9j\u00e0 enregistr\u00e9es.',
                '<strong>Correction : un compte d\'erreurs devenu inapplicable ne laisse plus sa r\u00e9troaction p\u00e9rim\u00e9e derri\u00e8re lui.</strong> Le r\u00e9sultat repassait \u00e0 \u00ab -- \u00bb pendant que le texte de la saisie pr\u00e9c\u00e9dente restait affich\u00e9, et l\'enregistrement le gardait. Ce que tu as \u00e9crit toi-m\u00eame n\'est jamais effac\u00e9 \u2014 seul le texte engendr\u00e9 par l\'application l\'est.',
                '<strong>La phrase qui situe l\'\u00e9l\u00e8ve face \u00e0 l\'\u00e9preuve uniforme se r\u00e8gle maintenant depuis le gabarit de la grille.</strong> Les cinq verdicts, leurs seuils et le nom du service d\'aide \u00e9taient \u00e9crits dans le logiciel. Tes grilles existantes gardent exactement les textes d\'aujourd\'hui, au mot pr\u00e8s.',
                '<strong>Une grille partag\u00e9e ou import\u00e9e arrive compl\u00e8te.</strong> Les r\u00e9troactions de ses cat\u00e9gories d\'erreurs et ses r\u00e9glages de projection voyagent d\u00e9sormais avec elle. Auparavant, la personne qui la recevait basculait en silence vers un calcul plus simple que celui que tu avais r\u00e9gl\u00e9, et perdait la pond\u00e9ration \u00e0 la demi-faute.',
                '<strong>La Liste des \u00e9valuations est plus juste.</strong> Trier par DA, Nom ou Pr\u00e9nom change bien la fl\u00e8che de la Liste (elle changeait celle du tableau des \u00e9tudiants) ; la fl\u00e8che est lisible en mode clair ; une reprise cibl\u00e9e se classe avec les reprises ; la vue Corbeille nomme la production.',
                '<strong>Correction : en mode anonymisation, supprimer un fichier ou vider la corbeille te dit maintenant que les \u00e9valuations li\u00e9es n\'ont pas \u00e9t\u00e9 retir\u00e9es</strong>, au lieu de les retirer en silence.',
                '<strong>Correction : refuser une r\u00e9association n\'applique plus de jeton de reprise</strong> \u2014 le fichier reste sur sa production, aucun jeton n\'est consomm\u00e9.',
                '<strong>Le PDF de r\u00e9troaction anonymise aussi le texte de tes r\u00e9troactions</strong> en mode anonymis\u00e9, et reste lisible sur les niveaux aux couleurs claires. Le compteur de l\'export L\u00e9a annonce le nombre de PDF r\u00e9ellement produits.',
                '<strong>Sur iPad, les fl\u00e8ches de la visionneuse, les pastilles de fond et le menu d\'actions de la Liste sont plus faciles \u00e0 toucher</strong> (44 px) ; sur Mac, rien ne change.',
                '<strong>Correction : la note finale enregistr\u00e9e est la valeur calcul\u00e9e</strong>, plus la relecture de ce qui \u00e9tait affich\u00e9 \u00e0 l\'\u00e9cran.',
                '<strong>Une cartouche neuve prend l\'\u00e9chelle que tu choisis dans son formulaire \u2014 et l\'\u00e9crit.</strong> Elle prenait la premi\u00e8re \u00e9chelle du trimestre, quoi que tu aies choisi. Sans \u00e9chelle choisie, la matrice le dit au lieu d\'inventer des colonnes. Et les deux listes Grille / \u00c9chelle du formulaire de cartouche, muettes depuis trois jours, r\u00e9pondent de nouveau.',
                '<strong>Le panneau orange de version revient au chargement</strong>, une fois par nouvelle version : il nomme la version et le build, sans te demander de recharger. Le fermer le fait taire jusqu\'\u00e0 la suivante.',
                '<strong>La case \u00ab Reprise cibl\u00e9e \u00bb du formulaire d\'\u00e9valuation est retir\u00e9e.</strong> La d\u00e9cocher ne retirait rien. Les reprises cibl\u00e9es d\u00e9j\u00e0 faites restent visibles dans la liste et le bilan.',
                '<strong>Plus aucune \u00e9chelle n\'est cr\u00e9\u00e9e \u00e0 ta place.</strong> L\'\u00ab \u00c9chelle g\u00e9n\u00e9rique (exemple) \u00bb et les deux gabarits d\'\u00e9chelle n\'avaient pas de valeur ponctuelle et ne pouvaient donc rien calculer. Ceux d\u00e9j\u00e0 pr\u00e9sents chez toi restent, et se suppriment comme les autres.',
                '<strong>Les rep\u00e8res de ma\u00eetrise se posent partout o\u00f9 une \u00e9chelle se cr\u00e9e.</strong> L\'\u00e9diteur d\'\u00e9chelle neuve porte le bloc \u00ab Suffisant \u00e0 partir de \u00bb / \u00ab Ma\u00eetris\u00e9 \u00e0 partir de \u00bb d\u00e8s la cr\u00e9ation, avec les m\u00eames refus que l\'\u00e9diteur d\'une \u00e9chelle existante : aucune \u00e9chelle ne na\u00eet plus sans qu\'on t\'ait demand\u00e9 o\u00f9 commence la ma\u00eetrise.',
                '<strong>L\'assistant de pratique te fait choisir les rep\u00e8res de l\'\u00e9chelle qu\'il retient.</strong> L\'\u00e9tape \u00ab \u00c9chelle de performance \u00bb affiche les deux rep\u00e8res, t\'avertit s\'il en manque un, et le r\u00e9capitulatif les redit avant d\'enregistrer.',
                '<strong>Le seuil de ma\u00eetrise se lit sur ton \u00e9chelle, et l\'application dit quand elle ne le peut pas.</strong> Il \u00e9tait devin\u00e9 par une convention \u00e9crite dans le logiciel \u2014 \u00ab l\'avant-dernier niveau \u00bb \u2014 qui tombait juste sur une \u00e9chelle \u00e0 quatre paliers et faux sur toutes les autres.',
                '<strong>Correction : vider la corbeille ne d\u00e9truit que ce qu\'elle annonce.</strong> La modale comptait les fichiers du groupe-cours actif, mais la suppression emportait ceux de TOUS les groupes. \u00ab 2 fichiers \u00bb pouvait en effacer cinq, d\u00e9finitivement.',
                '<strong>Correction : un jeton d\'\u00e9valuation qui n\'a pas pu \u00eatre enregistr\u00e9 te le dit.</strong> En mode anonymisation ou sur une erreur de stockage, l\'\u00e9cran affichait un succ\u00e8s pendant que rien n\'\u00e9tait \u00e9crit ; au rechargement, le jeton avait disparu.',
                '<strong>Correction : dans le poste de pr\u00e9paration des travaux, la date saisie ne recule plus d\'un jour \u00e0 l\'affichage</strong>, et chaque ouverture ne laisse plus tourner un compteur invisible.',
                '<strong>La fonctionnalit\u00e9 \u00ab All\u00e9ger \u00bb les fichiers export\u00e9s est retir\u00e9e.</strong> Elle \u00e9tait masqu\u00e9e depuis juin et n\'\u00e9tait plus atteignable ; rien de ce que tu utilises ne dispara\u00eet.',
                '<strong>Correction : dans l\'\u00e9diteur de pratique, une saisie ne s\'efface plus toute seule.</strong> Quitter un champ pour cliquer dans le suivant lan\u00e7ait deux enregistrements coup sur coup ; le second r\u00e9\u00e9crivait la pratique sans la modification du premier, sans message et sans erreur. M\u00eame chose entre deux zones du m\u00eame \u00e9cran \u2014 un type de travail et un forfait. Et partager une pratique effa\u00e7ait tout ce qui avait \u00e9t\u00e9 enregistr\u00e9 pendant que tu remplissais le formulaire de licence.',
                '<strong>Le curseur \u00ab Seuil de d\u00e9fi \u00bb dit maintenant ce qu\'il ne r\u00e8gle pas.</strong> Il r\u00e8gle le d\u00e9pistage seulement : la \u00ab Consolidation des apprentissages \u00bb ne le lit pas, son seuil de ma\u00eetrise vient des rep\u00e8res pos\u00e9s sur ton \u00e9chelle (Conception \u2192 \u00c9chelles).',
                '<strong>Correction : dupliquer un mod\u00e8le de biblioth\u00e8que n\'\u00e9crase plus une modification faite au m\u00eame moment.</strong> Deux enregistrements lanc\u00e9s coup sur coup pouvaient se recouvrir, sans message et sans erreur. Corrig\u00e9 d\'un seul geste pour les cinq biblioth\u00e8ques \u2014 grilles, \u00e9chelles, cartouches, productions et pratiques.',
                '<strong>Sur l\'\u00e9cran Cartouche, les actions de la fiche montent en t\u00eate</strong>, comme sur Grille et sur \u00c9chelle : Dupliquer, Supprimer, Annuler et Enregistrer sont group\u00e9es au m\u00eame endroit sur les trois \u00e9crans. Les actions qui portent sur le document restent \u00e0 c\u00f4t\u00e9, hors de la barre.',
                '<strong>Les photos prises avec un t\u00e9l\u00e9phone (format HEIC) sont maintenant lues \u2014 et quand elles ne peuvent pas l\u2019\u00eatre, l\u2019application te le dit.</strong> Elles entraient dans la file d\u2019importation sans aper\u00e7u, sans dimensions et sans pouvoir \u00eatre annot\u00e9es : exactement l\u2019allure d\u2019un fichier ab\u00eem\u00e9. Le format est d\u00e9sormais converti quand ton navigateur le permet ; sinon la copie affiche \u00ab HEIC non d\u00e9cod\u00e9 \u00bb, avec la raison et la marche \u00e0 suivre. Et les listes de formats accept\u00e9s n\u2019annoncent plus le HEIC l\u00e0 o\u00f9 il n\u2019est pas lisible.',
                '<strong>Correction : une saisie ne dispara\u00eet plus quand deux gestes se suivent de pr\u00e8s.</strong> C\u2019est le \u00ab des fois \u00e7a enregistre, des fois non \u00bb : un enregistrement lanc\u00e9 pendant qu\u2019un autre \u00e9tait en cours pouvait effacer le premier, sans un mot. Corrig\u00e9 dans les \u00e9diteurs d\u2019\u00e9chelle, de grille, de cartouche et de production, dans la liste de tes \u00e9tudiant\u00b7es et dans les biblioth\u00e8ques partag\u00e9es \u2014 quatre-vingt-douze endroits, tous invisibles un par un.',
                '<strong>Le stockage sur disque explique enfin pourquoi il te redemande l\u2019acc\u00e8s au dossier \u00e0 chaque d\u00e9marrage.</strong> Ce n\u2019est pas un oubli : c\u2019est un r\u00e9glage de s\u00e9curit\u00e9, d\u00e9sactiv\u00e9 par d\u00e9faut, que tu peux lever dans R\u00e9glages > Pr\u00e9f\u00e9rences > S\u00e9curit\u00e9. L\u2019\u00e9cran d\u2019importation le dit maintenant \u00e0 l\u2019endroit o\u00f9 tu cliques, et l\u2019infobulle pr\u00e9cise quels navigateurs le permettent et quel dossier choisir.',
                '<strong>Correction : \u00ab\u00a0Remplacer l\u2019existant\u00a0\u00bb ne fait plus dispara\u00eetre les deux travaux.</strong> Le nouveau fichier n\u2019\u00e9tait jamais \u00e9crit, et l\u2019ancien partait quand m\u00eame \u00e0 la corbeille \u2014 l\u2019\u00e9cran annon\u00e7ait pourtant une r\u00e9ussite. Le remplacement n\u2019est d\u00e9sormais confirm\u00e9 que si le rempla\u00e7ant a vraiment \u00e9t\u00e9 \u00e9crit ; sinon l\u2019original est conserv\u00e9 et l\u2019\u00e9chec est dit. Les fichiers d\u00e9j\u00e0 perdus de cette fa\u00e7on sont dans la corbeille de la Liste des \u00e9valuations.',
                '<strong>Un travail remis en plusieurs pages num\u00e9rot\u00e9es est reconnu comme UN seul travail.</strong> Les suffixes \u00ab\u00a0-p1\u00a0\u00bb, \u00ab\u00a0-p2\u00a0\u00bb, \u00ab\u00a0partie 2\u00a0\u00bb ou \u00ab\u00a0(2)\u00a0\u00bb \u00e9taient lus comme des noms de production diff\u00e9rents : les pages n\u2019\u00e9taient pas assembl\u00e9es, et deux pages d\u2019un m\u00eame travail \u00e9taient annonc\u00e9es comme des doublons. Elles sont maintenant regroup\u00e9es et remises dans l\u2019ordre de leur num\u00e9ro.',
                '<strong>Correction : dans la Liste des \u00e9valuations, la mention \u00ab\u00a0Fichier sous\u2026\u00a0\u00bb ne s\u2019affiche plus sur les travaux \u00e0 venir.</strong> D\u00e8s qu\u2019un \u00e9l\u00e8ve avait remis un seul travail, toutes ses autres lignes portaient la mention \u2014 elle donnait l\u2019impression que les productions non encore remises \u00e9taient rattach\u00e9es \u00e0 celle qui venait d\u2019\u00eatre import\u00e9e. Un travail qui a sa propre ligne dans le tableau y est d\u00e9j\u00e0 visible : la mention ne para\u00eet d\u00e9sormais que lorsqu\u2019elle est la seule trace du fichier.',
                '<strong>Correction : dans la corbeille, chaque valeur est maintenant sous l\u2019en-t\u00eate qui la nomme.</strong> La corbeille empruntait l\u2019en-t\u00eate du tableau des \u00e9valuations : le nom de fichier s\u2019affichait sous \u00ab\u00a0Pr\u00e9nom\u00a0\u00bb, la date de suppression sous \u00ab\u00a0Statut\u00a0\u00bb et les jours restants sous \u00ab\u00a0Niveau\u00a0\u00bb. Elle a d\u00e9sormais ses propres colonnes \u2014 \u00c9l\u00e8ve, Fichier, Production, Supprim\u00e9 le, Expire dans, Actions \u2014 et le choix des colonnes, qui ne la concerne pas, dispara\u00eet le temps que tu y es.',
                '<strong>Correction : annuler une reprise rend bien le travail ORIGINAL.</strong> La reprise était effacée, mais le fichier importé pour elle restait actif — et comme c’était le plus récent des deux, la ligne de l’évaluation restaurée ouvrait le travail de la reprise qu’on venait d’annuler. Le fichier de la reprise part maintenant à la corbeille avec elle, et la question posée avant l’annulation le dit. Vaut par les deux chemins : en retirant le jeton, comme en supprimant la reprise depuis la Liste des évaluations.',
                '<strong>Correction : « Appliquer comme jeton de reprise » n’est plus proposé quand la production a déjà eu toutes ses reprises.</strong> Le bouton ne regardait que les jetons restants de l’élève, jamais le maximum fixé pour cette production : le fichier entrait comme reprise, aucun jeton n’était accordé, et l’écran annonçait pourtant « 1 jeton de reprise appliqué ». Et un fichier simplement ajouté à une reprise déjà accordée est maintenant annoncé comme tel, plus comme un jeton de plus.',
                '<strong>Correction : l’assemblage automatique ne soude plus des copies qui n’ont rien à voir.</strong> Deux photos portant le même nom de fichier — deux « IMG_0412.jpg » venus de deux appareils — étaient prises pour les deux pages d’un même travail : la seconde disparaissait dans le PDF de la première, et son élève restait « Non reçu » sans un mot. Et deux remises d’un même élève faites à des dates différentes étaient collées en un seul document ; elles sont maintenant deux travaux distincts, et le doublon est signalé. Les pages d’une même remise, elles, restent regroupées comme avant.',
                '<strong>Correction : un travail nommé au nom de l’élève ne part plus chez un autre.</strong> L’application cherchait le nom comme un simple morceau de texte : « Martineau » contenant « Martin », le devoir de l’un était rangé sous le dossier de l’autre — et comme une association avait bien été faite, aucun avertissement ne s’affichait. À l’inverse, un nom court comme « Roy », ou un nom accentué écrit sans accent dans le nom du fichier, n’étaient jamais reconnus. Les noms sont désormais comparés mot à mot, les accents ne comptent plus, et quand deux élèves du groupe portent le même nom, l’application ne choisit pas à ta place : elle te laisse trancher.',
                '<strong>Correction : un import interrompu ne fabrique plus de doublons silencieux, et un travail re-déposé revient au bon élève.</strong> Si l’appareil se mettait en veille au milieu d’un lot, la file affichait TOUS les fichiers comme « à re-déposer » alors qu’une partie était déjà entrée : les re-déposer les importait une seconde fois, sans un mot. Et quand deux fichiers portaient le même nom, le re-dépôt pouvait donner le travail de l’un à l’autre. La file retient maintenant chaque fichier au fur et à mesure, et le rattachement compare aussi la taille du fichier d’origine.',
                '<strong>Correction : restaurer une sauvegarde ne dit plus « réussi » quand des documents manquent.</strong> Les fichiers que l’archive ne contenait pas étaient passés sous silence, et leur fiche restait marquée comme présente : tu découvrais le trou en ouvrant le travail. La restauration compte désormais ce qu’elle n’a pas pu rendre, le marque comme manquant, et te le dit une seule fois.',
                '<strong>Fusionner un codex vérifie maintenant le contenu réel de chaque document.</strong> Un fichier dont les octets ne correspondent pas au format annoncé est refusé, au lieu d’être écrit tel quel — la même vérification que celle déjà faite à l’importation.',
                '<strong>Correction : archiver un trimestre ne retire plus aucun de tes modèles.</strong> L’archivage effaçait du stockage toute grille, toute échelle et toute pratique du trimestre qui n’avait servi à aucune note — et il n’en gardait de copie nulle part. Il ne fait plus que LIRE : rien n’est retiré, et la sauvegarde qu’il dépose contient désormais tout, pas seulement les survivants.',
                '<strong>Correction : le fichier produit en archivant un trimestre contient bien les données de CE trimestre.</strong> Les présences y arrivaient vides et les captures venaient d’un autre trimestre — dans le fichier même qui sert de copie avant une suppression définitive.',
                '<strong>Correction : ce que tu saisis dans un éditeur ne suit plus le changement de trimestre.</strong> Les critères d’une grille en cours de création, et les niveaux d’une échelle en cours de création, survivaient à la bascule et à l’abandon : ils repartaient dans la fiche suivante, ou dans le nouveau trimestre.',
            ]
        },
        {
            version: '1.105',
            couleur: 'vert',
            titre: 'Ton \u00e9chelle dit o\u00f9 commence la ma\u00eetrise',
            items: [
                '<strong>Chaque \u00e9chelle porte maintenant deux rep\u00e8res : \u00ab Suffisant \u00e0 partir de \u00bb et \u00ab Ma\u00eetris\u00e9 \u00e0 partir de \u00bb.</strong> Tu les choisis dans l\'\u00e9diteur d\'\u00e9chelle, sous les niveaux. Jusqu\'ici, l\'application devinait o\u00f9 se trouvait la ma\u00eetrise \u00e0 partir des lettres I, D, M et E \u2014 ce qui ne voulait rien dire sur une \u00e9chelle qui n\'emploie pas ces lettres.',
                '<strong>La r\u00e9troaction distingue d\u00e9sormais trois \u00e9tats au lieu de deux.</strong> Sous ton seuil de suffisance : une priorit\u00e9. Entre les deux rep\u00e8res : un acquis en d\u00e9veloppement, \u00e0 consolider. Au-dessus : acquis.',
                '<strong>Un \u00e9l\u00e8ve qui sort de l\'insuffisance le lit maintenant dans son bilan.</strong> \u00ab Tu as fait de beaux progr\u00e8s : maintenant il faut les consolider \u00bb \u2014 distinct de \u00ab Tu as progress\u00e9 \u00bb, r\u00e9serv\u00e9 \u00e0 ce qui est acquis.',
                '<strong>Le PDF remis \u00e0 l\'\u00e9l\u00e8ve et le bilan \u00e0 l\'\u00e9cran disent la m\u00eame chose</strong>, avec tes niveaux et tes mots. Le tri des priorit\u00e9s, \u00ab ta force \u00bb et la ligne \u00ab Progr\u00e8s \u00bb suivent l\'ordre de TON \u00e9chelle.',
                '<strong>Correction : \u00ab Enregistrer \u00bb ne fermait plus la cartouche qu\'il venait d\'enregistrer.</strong> L\'\u00e9cran repartait \u00e0 vide et ce que tu tapais ensuite n\'atteignait pas la base, sans un mot. C\'est la cause du \u00ab des fois \u00e7a enregistre, des fois non \u00bb.',
                '<strong>Correction : l\'enregistrement automatique d\'une cartouche te pr\u00e9vient quand il n\'a rien \u00e9crit</strong>, au lieu de perdre la saisie en silence.',
                '<strong>Correction : les listes de l\'\u00e9diteur d\'\u00e9chelle ne sont plus tronqu\u00e9es</strong>, et le champ \u00ab Niveau SOLO \u00bb retrouve sa place au lieu de s\'empiler mot par mot.'
            ]
        },
        {
            version: '1.104',
            couleur: 'vert',
            titre: 'La structure se lit dans TES niveaux',
            items: [
                '<strong>La carte \u00ab Observation de la structure \u00bb montre un bloc par niveau de TON \u00e9chelle.</strong> Les quatre cat\u00e9gories \u00e9crites dans le logiciel \u2014 forces exceptionnelles, forces identifi\u00e9es, d\u00e9fis en d\u00e9veloppement, d\u00e9fis critiques \u2014 disparaissent. Chaque bloc porte le nom que tu as donn\u00e9 \u00e0 ton niveau, sa couleur, et les crit\u00e8res qui y tombent. Un niveau que personne n\'atteint n\'appara\u00eet pas : la carte montre la structure observ\u00e9e, pas ton \u00e9chelle en entier.',
                '<strong>Quand un niveau porte une \u00e9tiquette SOLO, son interpr\u00e9tation accompagne le bloc.</strong> Sans \u00e9tiquette, c\'est le nom de ton niveau qui s\'affiche, et l\'absence est signal\u00e9e une seule fois \u2014 pas une fois par bloc.',
                '<strong>Correction : sans grille de r\u00e9f\u00e9rence d\u00e9sign\u00e9e, le d\u00e9pistage annon\u00e7ait \u00ab aucune force ni d\u00e9fi identifi\u00e9 \u00bb.</strong> Cette phrase se lit comme un verdict rassurant sur l\'\u00e9l\u00e8ve, alors qu\'elle voulait dire \u00ab je n\'ai aucun crit\u00e8re \u00e0 quoi comparer \u00bb. Et la liste \u00ab Progression par crit\u00e8re \u00bb restait vide, ce qui se lit comme \u00ab rien \u00e0 signaler \u00bb. La cause est maintenant nomm\u00e9e, et elle se r\u00e9pare \u2014 un silence, non.',
                '<strong>Ton crit\u00e8re de langue appara\u00eet maintenant dans la carte \u00ab Observation de la structure \u00bb.</strong> Il en \u00e9tait exclu par son NOM, \u00e9crit dans le logiciel. Le d\u00e9pistage ne r\u00e9serve plus de traitement particulier \u00e0 un crit\u00e8re : ce qui compte est le niveau SOLO que tu as configur\u00e9, pas le nom que tu lui as donn\u00e9.',
                '<strong>Le niveau SOLO d\'un crit\u00e8re vient de ce que tu as configur\u00e9 dans ta grille.</strong> Il \u00e9tait devin\u00e9 en cherchant cinq mots-cl\u00e9s dans le NOM du crit\u00e8re \u2014 structure, rigueur, fran\u00e7ais, plausibilit\u00e9, nuance \u2014 c\'est-\u00e0-dire les crit\u00e8res d\'un seul enseignant, appliqu\u00e9s \u00e0 tout le monde. La devinette pouvait contredire le champ que tu avais rempli toi-m\u00eame.',
                '<strong>L\'export de recherche livre les vraies \u00e9chelles de tes \u00e9valuations</strong>, au lieu d\'en annoncer une seule pour l\'ensemble. \u26a0 Le champ \u00ab niveau_solo \u00bb y passe du vocabulaire anglais au vocabulaire fran\u00e7ais que tu configures : un fichier export\u00e9 avant cette version et un fichier export\u00e9 apr\u00e8s ne portent pas les m\u00eames valeurs dans cette colonne.'
            ]
        },
        {
            version: '1.103',
            couleur: 'vert',
            titre: 'Le niveau vient de ta pratique',
            items: [
                '<strong>Le niveau affich\u00e9 avec la performance globale d\u2019un \u00e9l\u00e8ve vient maintenant de TON \u00e9chelle.</strong> Il \u00e9tait calcul\u00e9 par une formule \u00e9crite dans le logiciel \u2014 85 pour \u00ab E \u00bb, 75 pour \u00ab M \u00bb, 65 pour \u00ab D \u00bb \u2014 c\u2019est-\u00e0-dire tes propres bornes, recopi\u00e9es il y a des mois et appliqu\u00e9es \u00e0 tout le monde.',
                '<strong>C\u2019est ta pratique de notation qui d\u00e9cide.</strong> Une pratique par niveaux affiche le code du niveau atteint, tir\u00e9 de l\u2019\u00e9chelle de tes \u00e9valuations. Une pratique sommative n\u2019en affiche plus : sa note globale est un pourcentage pond\u00e9r\u00e9, et un pourcentage n\u2019est pas un niveau atteint. Survole le pourcentage, l\u2019explication s\u2019y trouve.',
                '<strong>Chaque niveau de ton \u00e9chelle peut porter une \u00e9tiquette SOLO</strong> \u2014 pr\u00e9structurel, unistructurel, multistructurel, relationnel, abstrait \u00e9tendu. Quand elle est pos\u00e9e, son interpr\u00e9tation appara\u00eet au survol du niveau. Sans \u00e9tiquette, c\u2019est le nom que tu as donn\u00e9 au niveau qui s\u2019affiche : rien ne se tait.',
                '<strong>Correction :</strong> un \u00e9l\u00e8ve dont une seule \u00e9valuation d\u00e9signait une \u00e9chelle disparue du trimestre n\u2019avait plus AUCUN niveau affich\u00e9. Cette \u00e9valuation est pourtant d\u00e9j\u00e0 \u00e9cart\u00e9e du calcul, et l\u2019encadr\u00e9 \u00ab D\u00e9pistage incomplet \u00bb le dit \u2014 une \u00e9chelle absente n\u2019est pas une \u00e9chelle concurrente.',
                '<strong>Le mod\u00e8le de cartouche \u00e0 faire remplir emporte les consignes du travail.</strong> Un menu \u00ab Consignes du travail \u00bb s\u2019ajoute \u00e0 c\u00f4t\u00e9 de la grille et de l\u2019\u00e9chelle : l\u2019objectif, la t\u00e2che, le d\u00e9tail et tes champs nomm\u00e9s partent avec le fichier. L\u2019assistant \u00e9crivait jusqu\u2019ici des commentaires sur une t\u00e2che qu\u2019il ne connaissait pas. Le menu dit aussi quelles productions n\u2019ont pas encore de consignes.',
                '<strong>Les consignes adress\u00e9es \u00e0 l\u2019assistant sont r\u00e9\u00e9crites</strong> : trois phrases par commentaire, un conseil concret sous le seuil de ma\u00eetrise, aucun au-dessus, et l\u2019interdiction d\u2019inventer le moindre d\u00e9tail d\u2019une copie qui n\u2019a pas encore \u00e9t\u00e9 remise.',
                '<strong>Correction :</strong> le profil d\u2019un \u00e9l\u00e8ve pouvait cesser de s\u2019afficher enti\u00e8rement lorsqu\u2019une pratique configurable avait \u00e9t\u00e9 supprim\u00e9e ou que sa configuration \u00e9tait devenue invalide.'
            ]
        },
        {
            version: '1.102',
            couleur: 'orange',
            titre: 'Des p\u00e9riodes r\u00e9elles, un d\u00e9pistage qui dit vrai',
            items: [
                '<strong>Une heure d\u2019horloge n\u2019est pas une p\u00e9riode.</strong> Un bloc de 08:00 \u00e0 11:00, ce sont trois p\u00e9riodes de 50 minutes s\u00e9par\u00e9es de pauses \u2014 pas quatre. L\u2019application divisait ton temps d\u2019horloge par la seule dur\u00e9e d\u2019enseignement et comptait une p\u00e9riode de trop d\u00e8s qu\u2019un bloc d\u00e9passait deux heures. Or ce nombre est le d\u00e9nominateur de l\u2019assiduit\u00e9 : un \u00e9l\u00e8ve pouvait \u00eatre compt\u00e9 absent d\u2019une p\u00e9riode qui n\u2019existait pas.',
                '<strong>Chaque s\u00e9ance porte maintenant SON nombre de p\u00e9riodes</strong>, que tu saisis. L\u2019application ne convertit plus jamais une dur\u00e9e en p\u00e9riodes, parce qu\u2019elle ne le peut pas : elle demande les deux et les confronte. Le r\u00e9glage \u00ab Dur\u00e9e d\u2019une p\u00e9riode \u00bb dispara\u00eet \u2014 il ne servait qu\u2019\u00e0 r\u00e9concilier deux mani\u00e8res de saisir la m\u00eame chose.',
                '<strong>Les semaines de ton trimestre se comptent au calendrier</strong>, au lieu d\u2019\u00eatre suppos\u00e9es au nombre de quinze. Un cours 2-2-3 sur onze semaines vaut 44 heures, pas 60.',
                '<strong>La pond\u00e9ration du cours devient obligatoire</strong>, et ta dur\u00e9e hebdomadaire cesse d\u2019\u00eatre invisible. L\u2019horaire que tu saisis est confront\u00e9 au devis du cours, et l\u2019\u00e9cart t\u2019est dit \u2014 sans jamais bloquer ta saisie.',
                '<strong>Correction de fond : le d\u00e9pistage classait tout le monde au niveau le plus \u00e9lev\u00e9.</strong> Un pourcentage \u00e9tait compar\u00e9 \u00e0 un seuil exprim\u00e9 dans une autre unit\u00e9, si bien que tout crit\u00e8re au-dessus de 1 % ressortait \u00ab \u00c9tendu \u00bb \u2014 y compris \u00e0 12 %. Le bloc \u00ab Forces et d\u00e9fis \u00bb ne pouvait afficher que des forces exceptionnelles, pour tous tes \u00e9l\u00e8ves, y compris ceux en difficult\u00e9 sur tous leurs crit\u00e8res.',
                '<strong>Le d\u00e9pistage dit d\u00e9sormais quand il ne peut pas conclure.</strong> Quand les \u00e9valuations d\u2019un \u00e9l\u00e8ve ne se convertissent pas \u2014 aucune \u00e9chelle d\u00e9sign\u00e9e, ou une \u00e9chelle introuvable dans le trimestre \u2014 il l\u2019annonce et nomme la cause, au lieu de rendre un portrait rassurant qui ne repose sur rien.',
                '<strong>Chaque niveau de ton \u00e9chelle peut recevoir une \u00e9tiquette SOLO</strong> (pr\u00e9structurel, unistructurel, multistructurel, relationnel, abstrait \u00e9tendu), dans l\u2019\u00e9diteur d\u2019\u00e9chelles. C\u2019est facultatif, et \u00e7a pr\u00e9pare un d\u00e9pistage qui s\u2019interpr\u00e8te avec TON \u00e9chelle plut\u00f4t qu\u2019avec des valeurs \u00e9crites dans le code.'
            ]
        },
        {
            version: '1.101',
            couleur: 'vert',
            titre: 'Le profil de l\u2019\u00e9l\u00e8ve lit ta grille',
            items: [
                '<strong>Les barres du profil viennent de TA grille, dans TON ordre \u2014 toutes.</strong> Elles cherchaient auparavant cinq crit\u00e8res nomm\u00e9s dans le code (Structure, Rigueur, Plausibilit\u00e9, Nuance, Fran\u00e7ais) : avec une autre grille, les blocs restaient vides sans expliquer pourquoi.',
                '<strong>Correction :</strong> un crit\u00e8re que le logiciel ne reconnaissait pas s\u2019affichait \u00ab Fran\u00e7ais \u00bb.',
                '<strong>Les scores par crit\u00e8re sont lus dans les donn\u00e9es de l\u2019\u00e9valuation</strong>, et non plus rep\u00e9r\u00e9s dans le TEXTE de tes r\u00e9troactions.',
                '<strong>Trois tables de conversion \u00e9crites dans le code ont \u00e9t\u00e9 retir\u00e9es</strong> \u2014 et elles ne disaient pas la m\u00eame chose : selon l\u2019\u00e9cran emprunt\u00e9, un m\u00eame niveau valait 0,40 ou 0,55. Les valeurs viennent maintenant de ton \u00e9chelle, que tu vois et que tu modifies.',
                '<strong>L\u2019aide ne pr\u00e9sente plus SRPNF comme la structure du logiciel</strong>, mais comme la grille d\u2019exemple fournie, attribu\u00e9e au mod\u00e8le ELLAC \u2014 onze passages recadr\u00e9s : glossaire, fen\u00eatre du profil, survols, note des grilles.'
            ]
        },
        {
            version: '1.100',
            couleur: 'vert',
            titre: 'Un modèle de cartouche à faire remplir',
            items: [
                '<strong>Un bouton \u00ab T\u00e9l\u00e9charger un mod\u00e8le \u00bb</strong> dans les cartouches de r\u00e9troaction. Il construit un fichier texte \u00e0 partir de la grille et de l\u2019\u00e9chelle que tu as choisies : tous les crit\u00e8res, tous les niveaux, une ligne par commentaire \u00e0 \u00e9crire. Tu le fais remplir \u2014 par un assistant, ou \u00e0 la main \u2014 et tu le r\u00e9importes pour obtenir ta cartouche.',
                'Le fichier porte <strong>ses propres consignes en t\u00eate</strong> : ce qu\u2019on attend, et le format exact \u00e0 ne pas d\u00e9former. Un assistant laiss\u00e9 libre reformate, et un fichier reformat\u00e9 ne se r\u00e9importe plus.',
                '<strong>Correction de fond sur l\u2019import texte :</strong> les niveaux reconnus viennent d\u00e9sormais de TON \u00e9chelle. Ils \u00e9taient \u00e9crits dans le code \u2014 et pas de la m\u00eame fa\u00e7on selon le bouton emprunt\u00e9 : le niveau \u00ab 0 \u00bb de l\u2019\u00e9chelle \u00ab 0-IDME \u00bb passait par un chemin et disparaissait en silence par les deux autres. Une \u00e9chelle A-B-C-D, elle, n\u2019\u00e9tait lue par aucun.',
            ]
        },
        {
            version: '1.99',
            couleur: 'vert',
            titre: 'Le document de consignes, et des gabarits qui se ressemblent',
            items: [
                'Le bouton <strong>\u00ab Pr\u00e9parer le PDF \u00bb</strong> t\u2019am\u00e8ne directement \u00e0 l\u2019aper\u00e7u, avec la grille, l\u2019\u00e9chelle et la cartouche de la production ouverte. Il ne te redemande plus ce que ta fiche sait d\u00e9j\u00e0 \u2014 et il ne te propose plus, par erreur, la grille du document que tu as pr\u00e9par\u00e9 avant.',
                '<strong>L\u2019aper\u00e7u montre enfin de vraies pages lettre.</strong> Elles s\u2019empilent au lieu de s\u2019\u00e9tirer sans fin, et les consignes ont leur page \u00e0 elles : c\u2019est la feuille que ton \u00e9tudiant garde sous les yeux en travaillant. Ce que tu vois \u00e0 l\u2019\u00e9cran est ce que le PDF contient.',
                'Un r\u00e9glage <strong>\u00ab Contenu \u00bb</strong> \u00e0 trois crans : les consignes seules, puis la grille et l\u2019\u00e9chelle, puis la cartouche. Un cran sans mati\u00e8re est d\u00e9sactiv\u00e9 et te dit pourquoi, plut\u00f4t que de dispara\u00eetre du menu.',
                'Un r\u00e9glage <strong>\u00ab Disposition \u00bb</strong> : au fil du texte, ou en deux colonnes avec un bandeau qui annonce chaque bloc. Les retours \u00e0 la ligne de tes consignes num\u00e9rot\u00e9es sont enfin pr\u00e9serv\u00e9s.',
                '<strong>La date de remise est toujours dans les consignes.</strong> Avec plusieurs groupes, toutes les dates apparaissent, chacune nomm\u00e9e \u2014 personne ne re\u00e7oit la date d\u2019un autre groupe. Tant qu\u2019elle n\u2019est pas fix\u00e9e, le document dit \u00ab \u00c0 pr\u00e9ciser \u00bb au lieu de se taire.',
                '<strong>Tu peux ajouter tes propres champs</strong> au gabarit d\u2019une production : \u00ab Format et mise en page \u00bb, \u00ab Remise du travail \u00bb, \u00ab \u00c0 v\u00e9rifier \u00bb\u2026 Tu les nommes, tu les ordonnes, et ils rejoignent les consignes. Les trois champs d\u2019origine se d\u00e9placent et se renomment de la m\u00eame fa\u00e7on.',
                '<strong>Les boutons d\u2019action sont pass\u00e9s en haut</strong> des productions, des grilles et des \u00e9chelles \u2014 plus besoin de descendre au bas d\u2019un formulaire pour enregistrer. Et monter, descendre ou retirer un bloc a partout la m\u00eame apparence.',
                '<strong>Un ast\u00e9risque rouge marque les champs vraiment obligatoires</strong>, un ast\u00e9risque gris ceux qui sont recommand\u00e9s \u2014 ceux dont l\u2019absence fait dispara\u00eetre une ligne de tes r\u00e9troactions sans rien dire. Une l\u00e9gende explique les deux.',
                '<strong>Corrections :</strong> le s\u00e9lecteur \u00ab Production \u00bb de la carte d\u2019alignement restait vide ; la colonne \u00ab Production \u00bb du plan de cours affichait \u00ab undefined \u00bb ; le logo de licence occupait les deux tiers de la page ; et un titre long recouvrait les informations du cours.',
                '<strong>Corrections et ajustements (1.99.1 et 1.99.2) :</strong> deux champs remplis coup sur coup restent d\u00e9sormais tous les deux enregistr\u00e9s \u2014 c\u2019est la cause du \u00ab des fois \u00e7a enregistre, des fois non \u00bb ; la matrice d\u2019une cartouche et son contexte s\u2019enregistrent au fil de la saisie, comme une grille ou une \u00e9chelle, au lieu d\u2019attendre le bouton ; une nouvelle production n\u2019h\u00e9rite plus des consignes de la pr\u00e9c\u00e9dente et affiche ses blocs d\u00e8s le premier geste ; un bloc de consignes rempli mais sans nom te pr\u00e9vient avant d\u2019\u00eatre \u00e9cart\u00e9 ; un crit\u00e8re sans nom est refus\u00e9, comme l\u2019ast\u00e9risque le promettait, et tous les ast\u00e9risques d\u2019obligation sont enfin rouges ; une production partag\u00e9e arrive avec ses consignes au lieu d\u2019une coquille ; une production sans grille peut produire son document de consignes ; et un d\u00e9tail de t\u00e2che long se poursuit sur la page suivante du PDF au lieu de dispara\u00eetre \u00e0 l\u2019impression.'
            ]
        },
        {
            version: '1.98',
            couleur: 'vert',
            titre: 'Les \u00e9ch\u00e9ances viennent de ta carte d\u2019alignement',
            items: [
                'Quand une production est rattach\u00e9e \u00e0 un bloc \u00c9valuation de ta carte d\u2019alignement, sa <strong>date de remise se remplit toute seule</strong>. La le\u00e7on est pos\u00e9e en semaine 4, deuxi\u00e8me s\u00e9ance\u00a0? L\u2019\u00e9ch\u00e9ance tombe au jour o\u00f9 tu rencontres r\u00e9ellement ce groupe-l\u00e0.',
                '<strong>Chaque groupe re\u00e7oit SA date.</strong> M\u00eame case de la carte, mais deux horaires\u00a0: lundi pour l\u2019un, mardi pour l\u2019autre. Plus besoin de recalculer chaque remise groupe par groupe.',
                '<strong>Une date que tu as saisie n\u2019est jamais \u00e9cras\u00e9e.</strong> Si elle diff\u00e8re de ce que dit la carte, l\u2019\u00e9cart est signal\u00e9 sous le champ, avec un lien pour adopter la date de la carte si tu le veux. Tu gardes la main.',
                'Sans carte d\u2019alignement, rien ne change\u00a0: tu saisis la date \u00e0 la main comme avant. Il en va de m\u00eame si la le\u00e7on n\u2019a pas encore de semaine ou de s\u00e9ance, ou si l\u2019horaire du groupe n\u2019est pas saisi \u2014 mieux vaut un champ vide qu\u2019une date approximative.',
                'La case <strong>\u00ab\u00a0Consignes transmises\u00a0\u00bb existe maintenant aussi quand tu n\u2019as qu\u2019un seul groupe.</strong> Elle n\u2019\u00e9tait offerte qu\u2019en multi-groupe. Une production peut donc \u00eatre pr\u00e9par\u00e9e \u00e0 l\u2019avance, date comprise, sans \u00eatre compt\u00e9e comme remise aux \u00e9tudiant\u00b7es\u00a0: elle garde son badge \u00ab\u00a0\u00e0 planifier\u00a0\u00bb et n\u2019entre ni au calendrier ni dans les indices.',
                '<strong>Correction\u00a0:</strong> le s\u00e9lecteur \u00ab\u00a0Production\u00a0\u00bb de la carte d\u2019alignement \u00e9tait vide. Aucune production ne pouvait y \u00eatre rattach\u00e9e \u2014 ni artefact, ni portfolio, ni laboratoire, ni pr\u00e9sentation, ni stage. Les douze types du formulaire y sont d\u00e9sormais offerts, class\u00e9s comme dans Conception.',
                '<strong>Correction\u00a0:</strong> la colonne \u00ab\u00a0Production\u00a0\u00bb de ton plan de cours export\u00e9 affichait \u00ab\u00a0undefined\u00a0\u00bb au lieu du titre. Elle dit maintenant le nom que tes \u00e9tudiant\u00b7es reconnaissent.'
            ]
        },
        {
            version: '1.97',
            couleur: 'vert',
            titre: 'Retransmettre un document re\u00e7u d\u2019un coll\u00e8gue',
            items: [
                'Le menu \u22ee des cartes \u00ab\u00a0Partag\u00e9s par des coll\u00e8gues\u00a0\u00bb offre maintenant \u00ab\u00a0Exporter pour partager\u00a0\u00bb, comme tes propres cartes. Tu peux donc faire suivre \u00e0 un coll\u00e8gue un document qu\u2019on t\u2019a transmis \u2014 ou r\u00e9cup\u00e9rer ton propre mat\u00e9riel r\u00e9import\u00e9 pour le renvoyer ailleurs.',
                '<strong>L\u2019attribution d\u2019origine part avec le fichier.</strong> Le package retransmis nomme la personne dont vient le travail, et conserve la cha\u00eene compl\u00e8te si le document avait d\u00e9j\u00e0 chang\u00e9 de mains. Rien n\u2019est r\u00e9\u00e9mis sous ton seul nom.',
                'Quand le document vient de TOI \u2014 tes propres exports r\u00e9import\u00e9s \u2014 aucun maillon inutile n\u2019est ajout\u00e9\u00a0: le fichier te nomme d\u00e9j\u00e0 comme auteur.',
                'Une grille partag\u00e9e repart <strong>avec toutes ses cartouches</strong>, et la fen\u00eatre de confirmation annonce exactement ce que le fichier contiendra.'
            ]
        },
        {
            version: '1.96',
            couleur: 'vert',
            titre: 'Supprimer un document partag\u00e9 par un coll\u00e8gue',
            items: [
                'Les cartes de la section \u00ab\u00a0Partag\u00e9s par des coll\u00e8gues\u00a0\u00bb ont maintenant le m\u00eame menu \u22ee que les autres, avec \u00ab\u00a0Supprimer\u00a0\u00bb. Jusqu\u2019ici elles n\u2019offraient que \u00ab\u00a0Dupliquer\u00a0\u00bb\u00a0: une fois un fichier .lcz import\u00e9, rien ne permettait d\u2019en retirer un \u00e9l\u00e9ment. Le menu est l\u00e0 dans les cinq biblioth\u00e8ques \u2014 grilles, \u00e9chelles, cartouches, productions et pratiques.',
                'Supprimer un partag\u00e9 ne touche QUE la copie import\u00e9e. Tes propres documents, y compris ce que tu avais d\u00e9j\u00e0 dupliqu\u00e9 dans tes affaires, restent intacts \u2014 et tu peux r\u00e9importer le fichier .lcz quand tu veux.',
                'Supprimer une grille partag\u00e9e emporte SES cartouches partag\u00e9es, et la confirmation les nomme avant de le faire. Sans sa grille, une cartouche partag\u00e9e ne peut plus \u00eatre dupliqu\u00e9e\u00a0: la laisser derri\u00e8re, ce serait laisser une carte dont le seul bouton \u00e9choue.',
                'La carte \u00ab\u00a0Packages import\u00e9s\u00a0\u00bb de R\u00e9glages \u203a Donn\u00e9es suit\u00a0: elle annonce ce qui reste, pas ce qui est entr\u00e9 un jour. Un package vid\u00e9 \u00e9l\u00e9ment par \u00e9l\u00e9ment dispara\u00eet de la liste.'
            ]
        },
        {
            version: '1.95',
            couleur: 'vert',
            titre: 'Reprendre ses cartouches d\u2019un trimestre \u00e0 l\u2019autre',
            items: [
                'La biblioth\u00e8que de cartouches a maintenant sa section \u00ab\u00a0Importer depuis un autre trimestre\u00a0\u00bb, comme les grilles, les \u00e9chelles, les productions et les pratiques. Choisis le trimestre, regarde ses cartouches, importe celle que tu veux \u2014 ou tout le lot d\u2019un coup. C\u2019\u00e9tait la seule des cinq biblioth\u00e8ques \u00e0 ne pas l\u2019avoir.',
                'Une cartouche arrive toujours AVEC sa grille. Si la grille est d\u00e9j\u00e0 dans le trimestre courant, la cartouche s\u2019y range\u00a0; sinon elle est copi\u00e9e avec elle. Ce n\u2019est pas un choix de confort\u00a0: une cartouche est rang\u00e9e SOUS sa grille, et sans grille d\u2019accueil elle serait introuvable.',
                'Le rattachement se d\u00e9cide sur la filiation de la grille, jamais sur son nom \u2014 deux grilles homonymes restent deux grilles. Cons\u00e9quence directe\u00a0: importer une cartouche dans un trimestre o\u00f9 tu as d\u00e9j\u00e0 import\u00e9 sa grille ne t\u2019en fabrique pas une seconde copie.',
                'R\u00e9importer une cartouche d\u00e9j\u00e0 pr\u00e9sente te le dit, au lieu d\u2019en empiler un second exemplaire en silence. Pour en avoir vraiment deux, \u00ab\u00a0Dupliquer\u00a0\u00bb reste l\u00e0.',
                'L\u2019aper\u00e7u annonce, grille par grille, ce qui va se passer\u00a0: \u00ab\u00a0sa grille est d\u00e9j\u00e0 dans ce trimestre\u00a0\u00bb ou \u00ab\u00a0sa grille sera copi\u00e9e avec elle\u00a0\u00bb. Tu sais ce que tu d\u00e9clenches avant de cliquer.',
                'La section \u00ab\u00a0Importer depuis un autre trimestre\u00a0\u00bb RESTE ouverte apr\u00e8s chaque import\u00a0: le trimestre choisi, la liste d\u00e9pli\u00e9e et ta position dans la fen\u00eatre sont conserv\u00e9s. Importer dix cartouches ne demande plus dix fois de tout rouvrir. Le d\u00e9faut \u00e9tait le m\u00eame dans les cinq biblioth\u00e8ques \u2014 productions, grilles, \u00e9chelles, cartouches et pratiques \u2014 et il est corrig\u00e9 partout.',
                'Le menu \u00ab\u00a0Grille\u00a0\u00bb du formulaire de cartouche ne propose plus que les grilles de ta S\u00c9LECTION \u2014 celles de ta barre lat\u00e9rale. Il listait tout ce que le trimestre contient, y compris les grilles d\u2019un trimestre pr\u00e9c\u00e9dent que tu avais explicitement retir\u00e9es\u00a0: trois grilles \u00e0 gauche, sept dans le menu. Configurer une cartouche sur l\u2019une d\u2019elles la rattachait hors de ton plan de travail. M\u00eame correction pour le menu \u00ab\u00a0\u00c9chelle\u00a0\u00bb.',
                'Une cartouche d\u00e9j\u00e0 li\u00e9e \u00e0 une grille que tu as retir\u00e9e depuis continue de l\u2019afficher dans son menu\u00a0: l\u2019ouvrir pour la relire ne la rebranche pas en silence sur une autre grille.',
                'Supprimer une grille qui porte des cartouches est maintenant REFUS\u00c9, et le message nomme les cartouches en cause. Jusqu\u2019ici la grille partait et ses cartouches restaient en place \u2014 intactes, mais plus rien ne pouvait les lire, puisque l\u2019app n\u2019affiche que les cartouches des grilles PR\u00c9SENTES. C\u2019est ce qui donnait l\u2019impression qu\u2019une cartouche \u00ab\u00a0n\u2019avait pas \u00e9t\u00e9 enregistr\u00e9e\u00a0\u00bb.'
            ]
        },
        {
            version: '1.94',
            couleur: 'vert',
            titre: 'Préparer une production sans avoir à l\u2019annoncer',
            items: [
                'Une production s\u2019enregistre maintenant sans date d\u2019échéance. Tu peux préparer tes gabarits \u2014 objectif, tâche, consignes, grille \u2014 pendant l\u2019été ou entre deux trimestres, et ne fixer l\u2019échéance qu\u2019au moment de transmettre le travail. Jusqu\u2019ici, l\u2019app exigeait la date pour enregistrer\u00a0: il fallait avoir déjà distribué le travail pour avoir le droit de le préparer.',
                'Les productions qui n\u2019ont pas encore d\u2019échéance portent un badge \u00ab\u00a0à planifier\u00a0\u00bb dans la liste de gauche. Un gabarit oublié reste visible d\u2019un coup d\u2019\u0153il, sans avoir à ouvrir chaque fiche.',
                'En multi-groupes, décocher tous les groupes est désormais un état enregistrable\u00a0: c\u2019est exactement ce que l\u2019écran annonçait déjà (\u00ab\u00a0décoché = les étudiant\u00b7es n\u2019ont pas encore reçu le travail\u00a0\u00bb), mais que la sauvegarde refusait.',
                'Une production sans échéance n\u2019apparaît ni au calendrier ni dans les indices C (complétion) et P (performance)\u00a0: rien n\u2019est dû tant que rien n\u2019est annoncé. Elle rejoint ces calculs dès que tu poses la date.',
                'Dans toute la section Conception, une sauvegarde se confirme maintenant de la même façon\u00a0: le bandeau vert qui glisse en haut à droite et s\u2019efface seul. Selon que tu enregistrais une production, une grille, une échelle, une cartouche ou une pratique, l\u2019app répondait jusqu\u2019ici de trois manières différentes \u2014 dont une fenêtre du navigateur qu\u2019il fallait refermer d\u2019un clic avant de pouvoir continuer.',
                'Enregistrer une échelle ou une cartouche n\u2019annonce plus \u00ab\u00a0sauvegardée\u00a0\u00bb quand rien n\u2019a été écrit \u2014 par exemple si l\u2019élément que tu édites n\u2019appartient pas au trimestre actif. Le refus le dit, et la confirmation n\u2019apparaît que si la sauvegarde a bien eu lieu.'
            ]
        },
        {
            version: '1.93',
            couleur: 'vert',
            titre: 'Le Cadre te prévient avant de créer un double',
            items: [
                'Créer un second groupe-cours pour le même trimestre, le même cours et le même groupe d\u2019étudiants demande maintenant confirmation. Les deux porteraient le même nom dans tous les menus, et tes présences comme tes évaluations pourraient se répartir entre les deux sans que rien ne le signale. Le geste reste possible \u2014 deux enseignants sur un même groupe, c\u2019est légitime \u2014 mais il n\u2019est plus silencieux.',
                'Créer un second profil d\u2019enseignant\u00b7e avec un courriel déjà utilisé demande confirmation, et nomme le profil en place. C\u2019est le courriel qui fait l\u2019identité, jamais le nom : deux homonymes restent deux personnes distinctes, et l\u2019app ne s\u2019en mêle pas.',
                'Le contrôle qui empêche deux fiches de cours au même code s\u2019applique désormais partout, y compris à l\u2019import d\u2019un fichier et quand tu modifies le code d\u2019une fiche existante. La casse ne compte plus : \u00ab\u00a0601-101-mq\u00a0\u00bb et \u00ab\u00a0601-101-MQ\u00a0\u00bb sont le même cours, alors qu\u2019un import pouvait auparavant en installer deux côte à côte.'
            ]
        },
        {
            version: '1.92',
            couleur: 'vert',
            titre: 'Les doublons : savoir enfin lesquels sont lesquels',
            items: [
                'Le bandeau des doublons ne se contente plus d\u2019annoncer un nombre : il dit ce que chaque groupe EST. Une collision d\u2019identifiant (anomalie \u00e0 signaler), des copies issues d\u2019un m\u00eame original (tu peux n\u2019en garder qu\u2019une), ou de simples homonymes \u2014 deux \u00e9l\u00e9ments distincts qui portent le m\u00eame nom, ce qui n\u2019est pas un d\u00e9faut. L\u2019ancienne consigne, qui affirmait le contraire de la r\u00e9alit\u00e9, a \u00e9t\u00e9 retir\u00e9e.',
                'Chaque carte de biblioth\u00e8que affiche d\u00e9sormais son identifiant court, avec l\u2019identifiant complet au survol. Le bandeau citait des identifiants que rien \u00e0 l\u2019\u00e9cran ne permettait de retrouver.',
                'Un bouton \u00ab\u00a0Voir\u00a0\u00bb sur chaque exemplaire du bandeau am\u00e8ne directement \u00e0 la bonne carte et la met en \u00e9vidence deux secondes \u2014 fini la recherche \u00e0 la main par num\u00e9ro.',
                '\u00ab\u00a0Retirer\u00a0\u00bb et \u00ab\u00a0Supprimer\u00a0\u00bb sont accessibles sur place, depuis le bandeau, au lieu d\u2019exiger d\u2019ouvrir le menu \u22ee de la bonne carte. Retirer conserve les donn\u00e9es\u00a0; supprimer demande toujours confirmation.',
                'Un deuxi\u00e8me \u00ab\u00a0Ajouter \u00e0 ma s\u00e9lection\u00a0\u00bb refuse maintenant, et nomme l\u2019exemplaire d\u00e9j\u00e0 pr\u00e9sent au lieu d\u2019en empiler un second en silence. Le blocage porte sur l\u2019identit\u00e9 de l\u2019\u00e9l\u00e9ment, jamais sur son nom\u00a0: deux \u00e9chelles homonymes restent parfaitement l\u00e9gitimes. Et \u00ab\u00a0Dupliquer\u00a0\u00bb, lui, n\u2019est jamais bloqu\u00e9.',
                'Dupliquer une copie ne donne plus \u00ab\u00a0X (copie) (copie) (copie)\u00a0\u00bb\u00a0: les copies se num\u00e9rotent \u2014 \u00ab\u00a0X (copie)\u00a0\u00bb, \u00ab\u00a0X (copie 2)\u00a0\u00bb, \u00ab\u00a0X (copie 3)\u00a0\u00bb.',
                'Les cinq biblioth\u00e8ques (grilles, \u00e9chelles, cartouches, productions, pratiques) v\u00e9rifient d\u00e9sormais que l\u2019ajout a r\u00e9ellement \u00e9t\u00e9 enregistr\u00e9 avant d\u2019annoncer un succ\u00e8s. Un enregistrement refus\u00e9 le dit, au lieu d\u2019afficher \u00ab\u00a0ajout\u00e9e\u00a0\u00bb sans rien \u00e9crire.',
                'Une demande de confirmation ne se cache plus derri\u00e8re la fen\u00eatre qui l\u2019a ouverte\u00a0: \u00ab\u00a0Supprimer de la biblioth\u00e8que partag\u00e9e\u00a0\u00bb s\u2019affichait SOUS la biblioth\u00e8que, hors d\u2019atteinte. Et l\u2019identifiant des cartes est maintenant assez grand et assez contrast\u00e9 pour se lire sur iPad, y compris en mode clair.'
            ]
        },
        {
            version: '1.91',
            couleur: 'bleu',
            titre: 'La grille des présences ajustée, et des boutons qui tiennent parole',
            items: [
                'Un trimestre pouvait devenir incapable de recevoir la moindre production : la protection anti-mélange attribuait les productions à un trimestre en lisant la fiche de cours, devenue commune à tous les trimestres. Elle lit désormais les groupes-cours, qui appartiennent bien à un seul trimestre — et ne bloque plus quand l’attribution est ambiguë.',
                'Un ajout de production refusé par la protection anti-mélange de trimestres ne s’annonce plus comme un succès : l’app dit clairement que l’enregistrement n’a pas eu lieu, au lieu d’afficher « ajoutée à ton cours » sans rien enregistrer.',
                'Bibliothèque de productions : « Ajouter à ma sélection » a enfin un effet visible — la production quitte la liste des disponibles dès qu’elle est ajoutée, et le bouton ne peut plus être recliqué pour en empiler un second exemplaire sans le dire.',
                'Dans Suivi › Saisie des présences, « Grille imprimable » s’appelle maintenant « Rapport », et son bouton est passé dans la barre d’actions, juste à gauche d’« Enregistrer ».',
                'Les séances d’un horaire tiennent enfin sur une seule ligne : les heures ont la place de s’afficher en entier et le local ne bascule plus à la ligne suivante.',
                'La durée d’une période est maintenant de 50 minutes par défaut, et ce réglage atteint enfin tous les calculs : le nombre de périodes affiché pour une séance et le total hebdomadaire suivent la durée que tu as choisie, au lieu de rester figés sur 55 minutes.',
                'Deux groupes qui ont cours le même jour à des heures différentes gardent désormais leurs deux séances : la seconde n’est plus perdue au passage, ni pour le calendrier ni pour la saisie des présences.',
                'Un horaire que tu viens de créer peut être supprimé tout de suite : le bouton Supprimer apparaît dès l’enregistrement, sans devoir passer par un autre horaire et revenir.',
                'Les noms venus d’un import (horaires, profils d’enseignant·e, locaux de séance) s’affichent toujours tels que tu les as écrits, même s’ils contiennent des caractères spéciaux.',
                'La grille imprimable s’ouvre maintenant d’un bouton bien en vue dans l’en-tête de la saisie des présences, qui affiche ses options dans une fenêtre — fini le panneau replié en bas de page.',
                'Choisis la notation des cases : crochets (✓ présence, ✗ absence), X sur les absences seulement, périodes de présence (2 / 1 / 0) ou périodes d’absence. La légende imprimée suit ton choix, et ta préférence est mémorisée.',
                'Les dates d’en-tête ne sont plus coupées (« 21… ») : le jour et le mois sont toujours complets, et la police du tableau a été réduite pour une grille plus aérée — retouches issues du premier essai d’impression réel.',
                'Changer de trimestre remet vraiment tout à zéro : créer un trimestre et l’activer utilise le même chemin complet que le sélecteur (plus de groupe-cours ni d’horaires de l’ancien trimestre qui traînent), et les éditeurs restés ouverts (journée sans cours, grille, échelle, cartouche, pratique) sont refermés au passage.',
                'Modifier une fiche à cheval sur un changement de trimestre ne « réussit » plus en silence : l’app le dit clairement et n’écrit rien au mauvais endroit ; sélectionner un élément qui n’existe plus est refusé à voix haute. Et changer le type d’un critère de grille n’affiche plus « Aucun critère défini » par erreur.',
                'Dans la bibliothèque de cours, « Exporter » télécharge maintenant vraiment un fichier JSON du cours choisi. Le geste qui rend une fiche disponible aux autres a son entrée à part, « Déposer dans les cours disponibles » — les deux ne se confondent plus.',
                'Des gestes qui s’arrêtaient juste après avoir agi vont désormais au bout : supprimer une échelle le dit, ajouter ou retirer un niveau aboutit, une pratique dupliquée ou une maquette adoptée réapparaît dans ta liste, les cases du mode hybride s’affichent enfin, et un gabarit de bibliothèque supprimé ne revient plus au rechargement suivant.',
                'Retoucher une production ne la déverrouille plus, ne la remet plus dans la bibliothèque et ne la réattribue plus au cours affiché du moment — et ses échéances par groupe ne s’effacent plus au passage. Une nouvelle production part aussi avec un tableau d’échéances vierge.'
            ]
        },
        {
            version: '1.90',
            couleur: 'vert',
            titre: 'La grille des présences s’imprime',
            items: [
                'Nouveau dans Suivi › Saisie des présences : « Grille imprimable » génère un PDF format lettre en paysage — les élèves en rangées, une colonne par séance du trimestre avec son code (1a, 1b…) et sa date.',
                'Les séances déjà saisies se lisent d’un coup d’œil : un crochet pour une présence complète, une croix pour une absence, le nombre de périodes pour une présence partielle.',
                'Les cases vides sont les séances non saisies : la feuille sert de liste de présences papier en classe, à reporter ensuite dans l’écran de saisie, séance par séance.',
                'Tu choisis les colonnes d’identification à imprimer — numéro de DA, sous-groupe, programme, services adaptés — et tes choix sont mémorisés pour la prochaine fois.',
                'Plusieurs groupes ? Une feuille par groupe dans le même PDF, chacune avec son en-tête cours · groupe · trimestre.'
            ]
        },
        {
            version: '1.89',
            couleur: 'bleu',
            titre: 'Chaque trimestre garde ses données pour lui',
            items: [
                'La durée de période se règle maintenant par trimestre : changer la tienne pour l’automne ne touche plus les calculs des sessions passées, et le mode démonstration utilise la sienne au lieu de la tienne.',
                'Un nouveau trimestre naît vraiment vide : il ne ressuscite plus d’anciennes pratiques de notation ni les séances d’horaire de la session précédente.',
                'Les huit échelles d’exemple (chimie, informatique, philosophie…) ne sont plus recréées d’office dans chaque trimestre : elles vivent désormais dans la bibliothèque partagée, où tu peux les consulter, les dupliquer ou les supprimer pour de bon.',
                'Le bilan réflexif, le chronomètre d’évaluation et les notes confidentielles d’étudiants sont maintenant propres à chaque trimestre, au lieu d’être partagés entre toutes les sessions et la démonstration.',
                'La protection qui empêche d’utiliser un exemple de démonstration dans un vrai groupe-cours fonctionne à nouveau pour les grilles et les échelles.',
                'Les conversions de niveaux des profils étudiants lisent l’échelle du trimestre en cours, plus un réglage résiduel d’une ancienne manipulation.'
            ]
        },
        {
            version: '1.88',
            couleur: 'vert',
            titre: 'Supprimer une fiche de cours, depuis la Bibliothèque',
            items: [
                'Le menu ⋮ de chaque fiche de la Bibliothèque de cours offre deux gestes distincts : « Retirer de ma sélection » (réversible — la fiche reste disponible à ajouter) et « Supprimer la fiche » (définitif). Avant, supprimer exigeait de passer par le formulaire du Cadre, en mode modification.',
                'La suppression est refusée tant que le cours porte des données : groupes-cours avec étudiant·es, évaluations, présences, productions ou captures hebdomadaires. Le message liste ce qui s’y rattache encore, trimestre par trimestre.',
                'Le cours étant global, la confirmation le dit en toutes lettres : la fiche disparaît de tous les trimestres.',
                'Le bouton Supprimer du Cadre passe par le même garde : plus aucune suppression de cours ne peut laisser de données orphelines.',
                'En amont, créer un cours dont le code existe déjà demande confirmation — le devis ministériel ne change pas d’un trimestre à l’autre, une seule fiche sert toutes les sessions.',
                'Le formulaire Enseignant·e du Cadre suit maintenant le patron des autres sections : tant que rien n’est sélectionné, un message guide vers « + Nouveau profil » au lieu d’un formulaire vide toujours affiché.',
                'Modifier le format d’un horaire existant (séances par semaine, périodes par séance) ne remet plus les séances déjà saisies aux valeurs par défaut : jours, heures et locaux sont conservés, seules les lignes ajoutées repartent des défauts.',
                'Rouvrir une pratique de notation dans l’assistant pour la retoucher ne détruit plus sa fiche d’identité : la mention « Inspiré de … », le statut de maquette, la licence et l’auteur d’origine survivent maintenant à « Enregistrer ».'
            ]
        },
        {
            version: '1.87',
            couleur: 'vert',
            titre: 'Copier et cloner deviennent deux gestes distincts',
            items: [
                'Actions ▸ « Détacher de sa famille de clones » libère un bloc déjà cloné : il cesse de suivre son original, et son contenu ne change pas. Sur l’original, c’est toute la famille qui se dissout.',
                'Une copie est indépendante : la modifier ne touche plus l’original. Un clone reste lié : titre, durée et type se propagent entre ses instances.',
                'Une seule règle pour les deux raccourcis : sans ⇧ c’est une copie, avec ⇧ c’est un clone. ⌥ en glissant ou ⌘D copient ; ⇧⌥ ou ⇧⌘D clonent.',
                'Avant, ⌥ en glissant produisait toujours un clone sur une activité ou une connaissance — sans que rien ne le dise, jusqu’à ce que le doublon se mette à suivre son original.',
                'L’Inspecteur offre les deux boutons côte à côte : « Copier » et « Cloner (lié) ». Tes cartes existantes ne sont pas touchées.',
                'Une grille, une échelle, une cartouche ou une pratique copiée nomme enfin son origine : « Inspiré de … par … » affiche le titre et l’auteur réels. Cette ligne annonçait « par Inconnu », et souvent « Inspiré de Inconnu », même quand les deux étaient connus.',
                'Reprendre une production de la bibliothèque n’emporte plus les dates de remise du trimestre précédent : la copie arrive sans date d’échéance, et tu saisis celles de ton nouveau calendrier.',
                'Une grille, une échelle ou une cartouche que l’app ne retrouve plus s’affiche « ⚠ introuvable » au lieu de retomber en silence sur « Aucune » — et enregistrer ne l’efface plus. À la source, recharger un codex ne renumérote plus une ressource en double identique : c’est ce qui coupait ces références.',
                'L’app démarre maintenant complètement même quand le stockage avancé du navigateur est indisponible (navigation privée, réglages stricts) : plus aucune initialisation n’était lancée dans ce mode, sans message.'
            ]
        },
        {
            version: '1.86',
            couleur: 'vert',
            titre: 'Chaque bloc change de type dans son en-tête',
            items: [
                'Le menu de l’en-tête s’étend à TOUS les blocs : une Factuelle devient Conceptuelle, un Exposé devient une Activité, une Compétence devient une Idée maîtresse — sans recréer le bloc. Le titre, la durée et les objectifs servis restent en place.',
                'Le menu n’offre que les types de la même famille. Séquence et Leçon n’en ont pas : elles ne sont pas interchangeables.',
                'Un bloc Évaluation choisit désormais sa visée : formative ou certificative. Tant que tu n’as rien choisi, les exports continuent d’écrire « Évaluation », comme avant.',
                'Quand un changement de type laisse un lien avec un verbe qui ne lui correspond plus, l’app te le dit — elle ne réécrit jamais un verbe que tu as posé.',
                'Une seule couleur par famille au lieu d’un dégradé par bloc : la famille se repère d’un coup d’œil, le nom dit lequel c’est.',
                'La poignée ⠿ passe au coin supérieur gauche de tous les blocs, et devient le premier élément de chaque en-tête.',
                'La section « Preuve de réussite » de la palette s’appelle maintenant « Vérification ».'
            ]
        },
        {
            version: '1.85',
            couleur: 'vert',
            titre: 'Changer de phase sans refaire le bloc',
            items: [
                'Sur un bloc d’enseignement explicite, le nom de la phase devient un menu : « pratique guidée » se change en « pratique autonome » sans recréer le bloc ni y recoller le contenu. Durée, objectifs servis et liens sont conservés.',
                'Le menu s’arrête aux cinq phases de la méthode — passer à « exposé » ou « activité » serait un changement de nature, pas de phase.',
                'Ces blocs gagnent une poignée ⠿ à gauche de leur en-tête : c’est par là qu’on les attrape désormais, le nom étant devenu un menu.',
                'Les leçons sortent enfin dans l’ordre des semaines dans les exports — une leçon planifiée tard mais créée tôt ne remonte plus en tête de document.',
                'L’aperçu d’un gabarit met ses colonnes en colonnes : leur contenu ne se chevauche plus. Le fichier copié ou téléchargé, lui, reste un vrai TSV.'
            ]
        },
        {
            version: '1.84',
            couleur: 'bleu',
            titre: 'La modale des gabarits d’export, revue',
            items: [
                'Elle s’ouvre enfin par-dessus le plein écran de la Carte d’alignement : plus besoin d’en sortir pour la voir.',
                'Elle est nettement plus courte — les colonnes « à ajouter » se rangent maintenant côte à côte, en blocs qui se serrent, au lieu de s’empiler une par ligne.',
                'Elle tient toujours dans l’écran, quel que soit le nombre de colonnes : les boutons Copier et Télécharger restent atteignables sans faire défiler la page.',
                'Les colonnes gardent une position fixe : une case ne change plus de place d’un affichage à l’autre.'
            ]
        },
        {
            version: '1.83',
            couleur: 'vert',
            titre: 'Les liens contournent, et disent mieux',
            items: [
                'Les liens ne passent plus par-dessus les blocs : ils choisissent leur côté de départ et d’arrivée, et contournent ce qui gêne quand aucun passage direct n’existe.',
                'Le libellé d’un lien se pose maintenant SUR la courbe, et s’écarte s’il tombe sur un bloc — avant, il se posait à mi-chemin entre les deux extrémités, un point qui n’appartenait pas au tracé.',
                'Nouveau verbe « se réactive dans » : une connaissance reliée à une Ouverture ou à une Révision ne s’y acquiert pas, elle y est remise en service. C’est le rappel de début de leçon, et la pratique répartie.',
                'Le menu d’un lien offre désormais TOUS les verbes, sous ceux qu’il suggère. Un verbe suggéré qui ne convient pas ne bloque plus.',
                'Le contournement se règle : Actions ▸ « Liens : contourner les blocs ». Actif par défaut ; le décocher redonne le tracé direct d’avant, pour les cartes assez aérées pour s’en passer.',
                'Tes liens déjà tracés sont mis à jour tout seuls : ceux qui reliaient une connaissance à une Ouverture ou à une Révision passent de « s’acquiert par » à « se réactive dans » à l’ouverture de la carte. Un message te dit combien, et lesquels.',
                'Le badge 🎯 d’une leçon est de nouveau gris tant qu’aucun objectif n’est posé, et en couleur dès qu’il y en a un. Il reste repérable : son liséré pointillé garde la teinte de la leçon.',
                'Ce même badge est plus facile à toucher sur iPad — sa zone sensible passe à 44 px sans que les blocs de la carte grandissent.'
            ]
        },
        {
            version: '1.81',
            couleur: 'vert',
            titre: 'Chercher un mot dans la carte',
            items: [
                'Un champ de recherche dans la barre d’outils de la Carte d’alignement : tape un mot, les blocs qui le contiennent s’allument sur le canevas et la liste dit lesquels.',
                'La recherche fouille le titre du bloc, sa description, les objectifs des leçons — et le type de bloc, pour retrouver d’un coup toutes les évaluations ou toutes les leçons.',
                'Chaque résultat dit OÙ le mot a été trouvé, et montre la phrase autour : on reconnaît le bon bloc sans avoir à y aller.',
                'Les accents sont indifférents : « litterature » trouve « littérature », et l’inverse.',
                'Clic sur un résultat pour s’y rendre, Entrée pour passer au suivant (Maj+Entrée pour revenir), Échap pour refermer la liste puis effacer.',
                'Les blocs trouvés restent allumés quand la liste se referme — de quoi prendre du recul avec « Tout voir » et les relire à la loupe.'
            ]
        },
        {
            version: '1.80',
            couleur: 'bleu',
            titre: 'La tâche se termine, l’objectif se poursuit',
            items: [
                'Les info-bulles du gabarit des productions disent enfin en quoi la tâche et l’objectif diffèrent. La tâche est locale et bornée : ce qui est produit ici, sur quoi, en quelle quantité — on peut cocher qu’elle est faite.',
                'L’objectif est transférable et sans terme : la capacité qui servira à l’artefact suivant, au cours suivant, ailleurs. On ne coche pas un objectif atteint, on en observe la progression.',
                'Le champ « Détail de la tâche » a maintenant sa propre info-bulle et sa fiche d’aide : cinq critères pour relire ses consignes avant de publier — dont celui qui coûte le plus cher à l’étudiant·e, une exigence qui n’apparaît que dans le détail et qu’il découvre après avoir planifié son travail.'
            ]
        },
        {
            version: '1.79',
            couleur: 'vert',
            titre: 'Les repères « séance 2 » peuvent quitter les titres',
            items: [
                'Quand une leçon porte son rang de séance dans le modèle, l’outil de nettoyage des titres propose enfin de retirer le « séance 2 » écrit à la main — ce qu’il refusait de faire jusqu’ici, faute d’endroit où ranger l’information.',
                'Trois conditions, et aucune n’est facultative : le titre annonce un rang, la leçon en porte un, et les deux concordent. Si ta leçon n’a pas de rang posé, le titre reste intact — l’application ne devine jamais un rang à partir de ce que tu as écrit.',
                'Deux rangs qui se contredisent restent intacts aussi : toi seul sais lequel fait foi.',
                'Dans les gabarits d’export, « nom d’usine » devient « nom générique ».'
            ]
        },
        {
            version: '1.78',
            couleur: 'vert',
            titre: 'Le travail hors classe ne compte plus dans le temps de classe',
            items: [
                'Dans l’Inspecteur, une activité ou une évaluation peut être marquée « Travail hors classe » : une lecture à faire à la maison, un artefact à remettre entre deux séances.',
                'Ce temps-là SORT du total de la leçon. Le compteur de l’en-tête et la jauge du planificateur ne disent plus que du temps de classe — c’est ce qui permet de décider quoi couper.',
                'Un nœud marqué hors classe n’a plus de champ Durée : la question ne se pose pas, plutôt que d’être grisée.',
                'Dans le gabarit Calendrier, ces éléments remplissent la colonne « Travail personnel » — et ils quittent les colonnes Contenu et Évaluations, pour ne jamais apparaître deux fois sur la même ligne.',
                'Le Calendrier exporté en Markdown sort désormais en sections (« ### Semaine 3 », puis les champs) et non plus en tableau : coller un tableau Markdown dans Pages ne produisait pas un tableau, seulement des barres verticales.',
                'Dans l’éditeur de gabarits, une colonne qui ne peut rien afficher dans la présentation choisie est signalée sur place — plutôt que de sortir vide sans explication.'
            ]
        },
        {
            version: '1.77',
            couleur: 'vert',
            titre: 'Des gabarits d’export, et un calendrier qui se date tout seul',
            items: [
                'Nouveau gabarit « Calendrier » : une ligne par rencontre, avec la semaine, la séance (A, B…), la date, le contenu et les évaluations. C’est le déroulement que tu tiens à la main, produit par l’application.',
                'La date n’est jamais saisie : elle se déduit de la semaine de la leçon, de son rang dans la semaine et de l’horaire du groupe. Déplace une leçon, corrige un congé — la date suit.',
                'Quand un cours a plusieurs groupes, l’export demande lequel avant de dater. Avec un seul groupe, il ne demande rien.',
                'Tu peux créer tes propres gabarits : duplique-en un, choisis les colonnes, mets-les dans l’ordre voulu, renomme-les pour coller aux exigences de ton département.',
                'Les tableaux s’exportent aussi en Markdown — celui qui se colle dans Pages ou Word en gardant sa forme de tableau.',
                '⚠ Le niveau « Personnalisé » est remplacé par les gabarits. Ton réglage existant est converti automatiquement en un gabarit nommé « Mon export personnalisé » : rien n’est perdu, tu peux le renommer.'
            ]
        },
        {
            version: '1.76',
            couleur: 'vert',
            titre: 'Une leçon peut dire à quelle séance de la semaine elle a lieu',
            items: [
                'Dans la Carte d’alignement, l’en-tête d’un bloc Leçon porte un nouveau sélecteur, juste à côté de celui de la semaine : A, B, C ou D — la première, la deuxième, la troisième rencontre de cette semaine-là.',
                'Jusqu’ici, cette information ne pouvait vivre que dans le titre de la leçon, écrite à la main. L’application ne pouvait ni la lire ni la retirer sans te faire perdre ce que tu avais noté.',
                'Les séquences n’ont pas ce sélecteur, et c’est voulu : une séquence s’étend sur plusieurs semaines, elle n’a pas de rang à l’intérieur d’une semaine.',
                '⚠ Les exports ne montrent pas encore la séance : c’est la prochaine étape. Ce que tu poses maintenant sera repris tel quel.'
            ]
        },
        {
            version: '1.75',
            couleur: 'orange',
            titre: 'Réimporter un codex n’ajoute plus de doublons',
            items: [
                'Quand tu réimportes un codex que tu as déjà importé, l’application reconnaît maintenant ce qui est déjà là et ne le recopie plus. Avant, chaque import ajoutait une couche : cartouches, grilles, échelles, productions et pratiques se dédoublaient en silence.',
                'Un cas plus sournois est bouché aussi : une grille identique recevait un nouvel identifiant, et ses cartouches partaient dans un magasin que plus rien ne consultait. Rien ne semblait avoir changé à l’écran, mais l’espace se remplissait.',
                '⚠ Rien n’est jamais écrasé : si deux éléments portent le même identifiant mais un contenu réellement différent, les DEUX sont conservés, et la console le signale.',
                'Deux ressources qui portent le même nom restent deux ressources : le rapprochement se fait sur le contenu, jamais sur le titre.',
                'Le message de fin d’import annonce désormais ce qui est réellement entré, pas ce qui a été reçu.'
            ]
        },
        {
            version: '1.74',
            couleur: 'vert',
            titre: 'Les blocs de la Carte d’alignement s’alignent entre eux',
            items: [
                'Guides magnétiques : en glissant un bloc, il colle sur les bords, les centres et les milieux des blocs voisins, et une ligne pointillée montre sur quoi il s’aligne. Elle disparaît dès que tu relâches.',
                'Six commandes d’alignement — à gauche, au centre, à droite, en haut, au milieu, en bas — dans une petite barre qui apparaît d’elle-même dès que deux blocs sont sélectionnés.',
                'Une leçon alignée emmène ses activités : elle ne se détache jamais de son contenu.',
                'Un seul ⌘Z défait un alignement complet.',
                'Tout fonctionne au doigt sur iPad : les boutons font 44 px et l’aimant tient compte du zoom, pour ne pas happer la carte entière quand tu es en vue d’ensemble.',
                'Loupe : cliquer directement dans la carte t’y emmène — avant, seul un clic dans le cadre de la loupe fonctionnait. Et le pointeur devient un petit rectangle aux proportions de la loupe, qui montre la zone que tu vas examiner.'
            ]
        },
        {
            version: '1.73',
            couleur: 'vert',
            titre: 'Lire une grande carte sans changer de zoom : « Tout voir » et la loupe',
            items: [
                'Nouveau bouton « Tout voir » dans la barre d’outils de la Carte d’alignement : il ajuste le zoom pour que la carte ENTIÈRE tienne à l’écran, blocs isolés compris. « Recentrer » (⌘1) ne touchait jamais au zoom — les deux commandes coexistent.',
                'Nouvelle loupe : active-la (bouton, ou touche L), promène le pointeur ou le doigt, et lis à l’échelle normale sans que la carte bouge. Clique — ou tape « Aller ici » — et la carte s’y rend. La loupe s’éteint, le clavier est libre pour écrire.',
                'Les deux ensemble servent à se déplacer : prendre du recul, repérer la zone, lire à la loupe, sauter à l’endroit voulu.',
                'La loupe fonctionne au doigt sur iPad, et glisser en mode loupe ne déplace aucun bloc.',
                'Le zoom arrière descend désormais plus bas que 25 % — une grande carte ne tenait pas à l’écran à cette limite.'
            ]
        },
        {
            version: '1.72',
            couleur: 'vert',
            titre: 'Dupliquer plusieurs blocs d’un coup dans la Carte d’alignement',
            items: [
                '⌘D duplique désormais TOUS les blocs sélectionnés, et plus seulement le dernier. Sélectionne-en cinq, appuie une fois : tu obtiens cinq copies, déjà sélectionnées pour que tu puisses les glisser où tu veux dans la foulée.',
                'Un seul ⌘Z défait la duplication entière — pas copie par copie.',
                'Si tu sélectionnes une leçon ET l’une de ses activités, l’activité n’est pas copiée deux fois : la copie de la leçon emporte déjà son contenu.'
            ]
        },
        {
            version: '1.71',
            couleur: 'orange',
            titre: 'Le bouton Supprimer d’un groupe-cours réapparaît',
            items: [
                'Le bouton « Supprimer » d’un groupe-cours restait invisible quand tu arrivais sur la section : l’application restaurait bien ton groupe actif et ouvrait son formulaire, mais la commande de suppression ne s’affichait pas. Elle n’apparaissait qu’après avoir rouvert le menu déroulant.'
            ]
        },
        {
            version: '1.69',
            couleur: 'orange',
            titre: 'L’assistant ne propose plus « Par objectifs »',
            items: [
                'L’étape « Approche d’évaluation » de l’assistant de pratique n’offrait encore que deux choix, dont « Par objectifs d’apprentissage » — un paradigme retiré de l’application en 1.63, moteur compris. L’assistant promettait donc quelque chose que plus rien ne calculait. La carte disparaît.',
                'L’étape reste, avec sa seule approche réelle déjà cochée : elle dit ce sur quoi PAN-Standards s’appuie au lieu de le décider en coulisse.',
                'Une pratique enregistrée autrefois « par objectifs » s’ouvre maintenant sur le portfolio, sans rien perdre : sa configuration n’est ni effacée ni réécrite tant que tu ne sauvegardes pas toi-même.'
            ]
        },
        {
            version: '1.68',
            couleur: 'vert',
            titre: 'Relier une activité à un objectif, au tracé',
            items: [
                'Tu peux maintenant tracer un lien depuis une activité, un exposé ou une évaluation et le déposer sur la ligne d’un objectif de sa leçon : la case « objectifs servis » se coche toute seule. Les cases de l’Inspecteur restent là — c’est le même geste, par un autre chemin.',
                'Si le dépôt ne peut pas aboutir (bloc d’une autre leçon, type qui ne sert pas d’objectif), l’application te le dit au lieu de ne rien faire.',
                'Les pastilles des objectifs (!, ⚠, ✓) ont enfin une légende : dans l’Inspecteur de la leçon et dans la page 5 du guide. Leur sens ne vivait que dans une infobulle au survol — invisible sur iPad.'
            ]
        },
        {
            version: '1.67',
            couleur: 'orange',
            titre: 'Changer de trimestre ne laisse plus rien derri\u00e8re',
            items: [
                'Le groupe-cours que tu avais laiss\u00e9 actif dans un trimestre est bien celui qui revient quand tu y retournes. Avant, l\u2019application reprenait le premier de la liste \u2014 ton groupe actif pouvait changer sans que rien ne le signale, et les \u00e9crans de suivi suivaient.',
                'La barre de progression du Cadre et le s\u00e9lecteur des groupes-cours se mettent \u00e0 jour imm\u00e9diatement : ils affichaient encore les chiffres et les groupes du trimestre que tu venais de quitter.',
                'Correction : une fiche d\u2019\u00e9tudiant\u00b7e sans nom (import incomplet) emp\u00eachait l\u2019affichage de la liste enti\u00e8re et faisait \u00e9chouer le tirage au sort, sans message.',
                'Correction : ta biblioth\u00e8que de cours accumulait des exemplaires identiques du m\u00eame cours \u00e0 chaque import \u2014 la m\u00eame fiche pouvait appara\u00eetre deux ou trois fois dans le s\u00e9lecteur. Les imports n\u2019en ajoutent plus.'
            ]
        },
        {
            version: '1.66',
            couleur: 'vert',
            titre: 'Carte d\u2019alignement \u2014 utilisable au doigt',
            items: [
                'Un double-tap sur un bloc ouvre l\u2019Inspecteur sur iPad. Le double-clic n\u2019y fonctionnait pas : la dur\u00e9e, la semaine, les objectifs servis et la r\u00e9troaction formative n\u2019\u00e9taient atteignables que par le bouton \u00ab Inspecteur \u00bb.',
                'Les boutons Inspecteur, Raccourcis, Guide et Biblioth\u00e8que passent du bas de la palette \u00e0 la barre d\u2019outils \u2014 ils y sont toujours visibles, m\u00eame sur un \u00e9cran court.',
                'Les six familles de la palette \u00ab N\u0153uds \u00bb se replient d\u2019un toucher sur leur titre. Ton choix est m\u00e9moris\u00e9.',
                'La corbeille quitte la palette : elle appara\u00eet au bas de la carte d\u00e8s que tu commences \u00e0 d\u00e9placer un bloc, et dispara\u00eet ensuite.'
            ]
        },
        {
            version: '1.65',
            couleur: 'orange',
            titre: 'Carte d’alignement — la durée s’affiche, les objectifs se réordonnent',
            items: [
                'La durée d’un bloc est maintenant visible dès que tu le poses. Elle n’apparaissait qu’après un rechargement de la page — sur les Exposés comme sur les cinq étapes d’enseignement explicite.',
                'Même correctif pour une Leçon qu’on vient de créer : son total Σ, son sélecteur de semaine, son badge 🎯 et sa poignée de redimensionnement sont là tout de suite.',
                'Deux nouvelles flèches ▲▼ sur chaque objectif de leçon : change leur ordre sans les retaper. Les liens entre un objectif et les activités qui le servent suivent le déplacement.',
                'Un titre collé depuis une autre application prend la typographie de la carte au lieu de garder la sienne.',
                'Les cinq étapes d’enseignement explicite partagent une seule couleur sarcelle : la famille se repère d’un coup d’œil.',
                'Le bandeau « Présentement en développement actif » est retiré de l’en-tête du module.',
                'Correction : les onglets de Conception (Productions, Grilles, Échelles, Cartouches, Pratiques) affichaient une page vide — ils s’affichent de nouveau.'
            ]
        },
        {
            version: '1.64',
            couleur: 'bleu',
            titre: 'Les réglages d’une pratique s’appliquent partout, tout de suite',
            items: [
                'Les écrans de suivi (profil, aperçu du groupe, liste des étudiant·es) lisent maintenant la configuration de ta pratique directement à sa source. Avant, ils lisaient une copie figée au moment où tu avais appliqué la pratique : modifier le nombre d’artefacts à retenir changeait la note du profil, mais pas les autres écrans, qui restaient sur l’ancienne valeur sans rien signaler.',
                'Ménage interne : cette copie figée n’est plus entretenue nulle part, et l’ancien mécanisme de migration qui s’exécutait à chaque démarrage est retiré.'
            ]
        },
        // (1.62 n'a jamais été déployée — consolidée dans 1.63, même précédent
        //  que l'entrée 1.48 : l'utilisateur ne verra qu'UNE livraison.)
        {
            version: '1.63',
            couleur: 'orange',
            titre: 'Une seule question sur la construction de la note',
            items: [
                'Dans les réglages d’une pratique PAN-Standards, le champ « Comment construis-tu la note finale ? » disparaît : il posait la même question que « Mode de sélection », avec d’autres mots, et les deux réponses pouvaient se contredire. Une seule commande reste.',
                'Chaque mode de sélection affiche une courte explication de ce qu’il fait.',
                'Le mode « Par objectifs (4 modes de calcul) » est retiré de l’application. Il n’a jamais pu calculer une note — le lien entre productions et objectifs qu’il supposait n’a jamais existé — et son panneau de réglages ne s’était jamais affiché. Les quatre gabarits du catalogue qui l’illustraient partent avec lui.',
                'Une pratique enregistrée avec ce mode s’ouvre désormais sur son mode de sélection réel, sans rien perdre : sa configuration n’est ni effacée ni réécrite.'
            ]
        },
        {
            version: '1.61',
            couleur: 'bleu',
            titre: 'L’onglet s’appelle « Carte d’alignement »',
            items: [
                'L’onglet « Alignement pédagogique » devient « Carte d’alignement ». Les six autres onglets de Conception nomment un objet de travail ; celui-là nommait une théorie — et « carte d’alignement » était déjà le mot employé partout ailleurs dans l’application.',
                'Le guide de la carte gagne une étape : « Ce que la leçon vise ». Elle explique où saisir l’objectif d’une leçon (le badge 🎯 de son en-tête) et comment cocher, sur chaque activité, les objectifs qu’elle sert.',
                'Le manuel décrit à nouveau l’application réelle : l’aide, les info-bulles, le glossaire et la visite guidée ne renvoient plus à des pages ni à des commandes retirées cet été.',
                'La zone « Enseignement explicite » de la palette a maintenant son info-bulle, comme les cinq autres.'
            ]
        },
        {
            version: '1.60',
            couleur: 'vert',
            titre: 'Une corbeille dans la palette — supprimer au doigt',
            items: [
                'Nouvelle corbeille au bas de la palette « Nœuds » : glisse un bloc dessus pour le supprimer. Sur iPad, c’était le geste qui manquait — la suppression exigeait jusqu’ici un clavier, ou trois touchers en passant par l’Inspecteur.',
                'La corbeille apparaît dès que tu commences à déplacer un bloc, et devient rouge quand le doigt la survole : tu vois ce qui va se passer avant de relâcher.',
                'Un bloc supprimé par erreur revient avec le bouton « Annuler » de la barre d’outils — le message te le rappelle au moment de la suppression.'
            ]
        },
        {
            version: '1.59',
            couleur: 'bleu',
            titre: 'Les guides se ressemblent enfin',
            items: [
                'Tous les guides — celui de la carte d’alignement comme les guides SOLO, ACP, RàI, sommative et modalités — partagent désormais la même présentation : une seule taille de texte, les mêmes encadrés, la même mise en page.',
                'Correction : dans le guide de la carte, certains paragraphes s’affichaient beaucoup plus gros que les listes, et le texte du guide était trop petit pour être lu confortablement.',
                'Correction : les pictogrammes de badge (✓, !, ⚠) n’apparaissaient pas dans le guide — ils sont maintenant affichés en toutes lettres.',
                'La dernière page du guide décrit le nouvel export du plan (menu Actions, trois niveaux, personnalisation) au lieu de l’ancienne page « Plan de la leçon » qui n’existe plus.',
                'La page sur les activités mentionne maintenant l’Exposé et les cinq étapes de l’enseignement explicite.'
            ]
        },
        {
            version: '1.58',
            couleur: 'vert',
            titre: 'L’export du plan se règle à ta façon',
            items: [
                'Nouveau niveau « Personnalisé » dans « Exporter le plan… » : coche les contenus que tu veux voir (objectifs, activités, évaluations, durées, rétroactions, connaissances, liens, détail des productions) et choisis l’ordre des sections — pour te conformer au gabarit de ton département.',
                'Un aperçu VIVANT montre le document pendant que tu règles : chaque case cochée ou section déplacée se reflète immédiatement, dans le format de ton choix.',
                'Ton réglage est mémorisé : le niveau « Personnalisé » du menu d’export le réutilise tel quel, et tu peux repartir d’un des trois niveaux de base en un clic.',
                'Correction : le tableau TSV n’a plus deux colonnes de semaine — une seule, qui porte l’étendue sur la ligne de séquence et le numéro sur la ligne de leçon.'
            ]
        },
        {
            version: '1.57',
            couleur: 'vert',
            titre: 'La Carte exporte ton plan — et la page « Plan de la leçon » tire sa révérence',
            items: [
                'Nouveau menu « Exporter le plan… » dans les Actions de la carte : trois niveaux (Plan de cours, En classe, Preuve d’alignement) croisés avec trois formats (texte, tableau collable, Markdown). Neuf documents, un seul geste — Copier ou Télécharger.',
                'Le niveau « Plan de cours » donne le sommaire collable : séquences, semaines, leçons et évaluations avec leur pondération. « En classe » ajoute les objectifs, les activités, les durées et les rétroactions. « Preuve d’alignement » montre tout : connaissances, liens verbalisés, objectifs servis, grilles.',
                'Les documents disent enfin « Leçon » (plus jamais « Séance » pour une leçon), les durées sont les totaux réels de la carte — fini le double comptage — et TOUS les objectifs sortent, plus seulement le premier.',
                'La rétroaction formative se pose maintenant sur les activités, directement dans l’Inspecteur. Le sélecteur du nœud Évaluation reste et se clarifie : « Rétroaction sur le rendu » — deux notions, deux libellés.',
                'Correction : les sélecteurs Rétroaction et Production du nœud Évaluation ne sauvegardaient plus rien — ils réagissent de nouveau.',
                'La page « Plan de la leçon » est retirée : tout ce qu’elle faisait vit désormais dans la carte. Tes rétroactions déjà posées y sont transportées automatiquement au démarrage.',
                'Reprendre une carte d’un autre trimestre ne transporte plus de références mortes vers des productions qui n’existent pas dans le trimestre d’arrivée.'
            ]
        },
        {
            version: '1.56',
            couleur: 'vert',
            titre: 'Carte d’alignement : l’enseignant y entre, et le temps s’y compte',
            items: [
                'Nouveau nœud « Exposé », en tête de la famille « Déroulement » (l’ancienne « Mise en action »). Il te donne enfin un bloc pour dire « j’enseigne » : ton temps de parole se pose dans la leçon, porte une durée, et compte dans le total.',
                'Correction : les cinq nœuds d’enseignement explicite (Ouverture, Modélisation, Pratique guidée, Pratique autonome, Clôture) ne pouvaient être reliés à AUCUNE connaissance ni à aucune évaluation — le lien était refusé. Ils avaient une couleur et une place, mais aucune relation. « Cette connaissance procédurale s’acquiert par cette modélisation » se trace maintenant, et le verbe s’écrit tout seul.',
                'La durée estimée se saisit directement dans l’en-tête du bloc, sur la carte — plus besoin d’ouvrir l’Inspecteur ni de la faire apparaître. L’évaluation en porte une elle aussi : elle occupe du temps de classe comme le reste.',
                'Les leçons et les séquences affichent un compteur « Σ » : le total de ce qu’elles contiennent, mis à jour pendant que tu tapes. Une activité de 20 min ajoutée à une leçon fait monter le total de la leçon ET celui de sa séquence.',
                'Cliquer une leçon dans le planificateur ne remplace plus la carte par une fiche en lecture seule : la carte se déplace jusqu’à l’élément et le sélectionne, pour que tu l’édites sur place au lieu de le relire.',
                'La carte montre désormais TOUT, tout le temps. Ouvrir une séquence ne masque plus les autres, et les séquences ne se replient plus en pastille résumée. Le bouton « Vue globale » disparaît — il n’y a plus de vue à quitter pour y revenir.',
                'Deux boutons dans la barre d’outils, « Nœuds » et « Planificateur », affichent ou masquent chaque palette. Ton choix est mémorisé d’une séance à l’autre.',
                'Un objectif de leçon saisi dans l’ancienne fiche de lecture n’était plus jamais réaffiché : ces textes sont récupérés et remis dans les objectifs de la leçon, sans doublon.',
                'Sur iPad, la carte répond enfin au doigt : déplacer un bloc, sortir une évaluation d’une leçon, tracer un lien — tout ce qui exigeait une souris. Le badge 🎯 d’une leçon sans objectif redevient repérable, et la semaine changée dans l’Inspecteur se reflète immédiatement sur le bloc.'
            ]
        },
        {
            version: '1.55',
            couleur: 'orange',
            titre: 'Des réglages qui ne se perdent plus au démarrage',
            items: [
                'Tes préférences sont de nouveau reprises au démarrage. Certains réglages faits il y a plusieurs mois n’étaient plus relus et l’application repartait de ses valeurs par défaut : ils peuvent réapparaître à ce premier lancement.',
                'La section Données affiche enfin ses compteurs et ses statistiques de captures au chargement.',
                'La case « Données démo » ne se décoche plus toute seule quand tu recharges la page.',
                'Tes raccourcis d’annotation ne sont plus remplacés par les raccourcis par défaut au démarrage.',
                'La liste des grilles et ta grille de référence pour le dépistage se rechargent correctement à l’ouverture.',
                'Après une mise à jour, ton navigateur ne peut plus servir d’anciennes versions des fichiers : les corrections arrivent du premier coup.'
            ]
        },
        {
            version: '1.54',
            couleur: 'vert',
            titre: 'Alignement : l’enseignement explicite entre dans la carte',
            items: [
                'Cinq nouveaux nœuds dans la palette — Ouverture, Modélisation, Pratique guidée, Pratique autonome, Clôture. Tu les glisses dans une leçon comme des activités : ils portent une durée, se relient aux connaissances et servent les objectifs. Le dégradé de leur couleur suit le transfert de responsabilité de la méthode.',
                'Les étapes à cocher du Plan de la leçon sont retirées : la méthode se construit maintenant dans la carte, au même endroit que le reste de ta leçon.',
                'Les sections de la palette parlent ton vocabulaire : Intention curriculaire, Types de connaissances, Mise en action, Preuve de réussite, Organisation — une ligne au lieu de deux, plus de place pour les nœuds.'
            ]
        },
        {
            version: '1.53',
            couleur: 'vert',
            titre: 'Alignement : la réserve « Non planifié » au choix',
            items: [
                'Un bouton dans la barre du planificateur place la réserve « Non planifié » sous la grille (comme avant) ou EN COLONNE à sa gauche. En colonne, elle ne défile plus avec la grille : tu y puises une pastille et tu la déposes dans n’importe quelle semaine sans la perdre de vue.',
                'Passer en colonne élargit la palette au minimum nécessaire si elle est trop étroite — sinon la grille n’aurait plus la place d’aligner deux pastilles et la colonne coûterait plus qu’elle ne rapporte. Revenir à la disposition du bas ne rétrécit rien : ta largeur reste la tienne.',
                'Le choix est mémorisé.'
            ]
        },
        {
            version: '1.52',
            couleur: 'vert',
            titre: 'Alignement : le planificateur en pastilles',
            items: [
                'Les leçons et les séquences ne s’étirent plus sur toute la largeur de leur rangée : elles épousent leur contenu, comme des pastilles. Une semaine chargée se lit d’un coup d’œil au lieu de défiler, et il en tient plusieurs par ligne.',
                'Actions → « Nettoyer les repères de semaine… » : maintenant que la semaine se choisit dans le bloc, les « Sem. 11 – » écrits dans tes titres font double emploi. L’outil te les montre un par un, avec l’avant et l’après, et rien ne part sans ton clic.',
                'Il refuse de trancher à ta place : si le titre annonce une semaine différente de celle qui est posée, il te le signale sans rien toucher. Si retirer le repère ne laissait rien de lisible, il te laisse réécrire le titre toi-même. Et il ne touche jamais aux repères de séance — la séance n’a pas encore sa place dans le modèle.'
            ]
        },
        {
            version: '1.51',
            couleur: 'vert',
            titre: 'Alignement : la semaine se choisit dans le bloc',
            items: [
                'Un sélecteur de semaine apparaît à côté du type, dans chaque leçon et chaque séquence. Plus besoin d’écrire « Sem. 11 » dans tes titres : le bloc se place tout seul dans le planificateur. Sur une séquence, choisir une semaine DÉPLACE tout le bloc — ses leçons suivent en gardant leurs écarts.',
                'Le sélecteur et le glisser dans la grille sont deux façons de faire le même geste : ce que tu changes d’un côté se voit immédiatement de l’autre.',
                'Le planificateur ne répète plus le nom d’une séquence sur chacune de ses leçons quand elle est déjà affichée dans la même semaine. Il le garde pour les leçons qui s’affichent loin de leur séquence, où le repère sert vraiment.'
            ]
        },
        {
            version: '1.50',
            couleur: 'orange',
            titre: 'Alignement : les notes de leçon cessent de se mélanger',
            items: [
                'Les Objectif et Notes des vues leçon appartiennent désormais à LEUR carte et à LEUR trimestre. Ils étaient partagés : deux cartes pouvaient afficher la même note sans que tu l’aies écrite deux fois, et la démo écrivait au même endroit que tes vraies sessions. Tes notes existantes sont réparties automatiquement au premier démarrage — chaque carte garde exactement ce qu’elle affichait, rien n’est perdu.',
                'Supprimer une leçon efface aussi ses notes. Elles survivaient au nœud, et une leçon créée plus tard pouvait hériter des notes d’une leçon disparue.'
            ]
        },
        {
            version: '1.49',
            couleur: 'vert',
            titre: 'Alignement : reprendre ta carte d’une session à l’autre',
            items: [
                'À la rentrée, un planificateur vide te propose de reprendre la carte du même cours de la session précédente — en un clic, sans fouiller la liste des trimestres. La carte d’origine reste intacte : tu peux retoucher la copie sans toucher au plan de la session déjà donnée.',
                'Actions → « Importer d’un autre trimestre… » remonte en tête les cartes qui portent le même cours, sous « Même cours ». Le reste de la liste ne bouge pas.'
            ]
        },
        {
            version: '1.48',
            couleur: 'vert',
            titre: 'Alignement pédagogique : le planificateur',
            items: [
                'Un planificateur en grille remplace le sommaire et la Vue calendrier : une rangée par semaine, tirée directement de ton Cadre du trimestre — plus rien à ressaisir. Les leçons d’une même semaine s’affichent côte à côte, et tu déplaces ton contenu d’une semaine à l’autre en le glissant. Ce qui n’est pas encore placé attend en pied de grille, dans « Non planifié ».',
                'La semaine appartient maintenant à la leçon, et non plus à la séquence qui pouvait la contredire : l’étendue d’une séquence se calcule à partir des leçons qu’elle contient. Une leçon ancrée hors du cadre de ton trimestre retombe dans « Non planifié » au lieu de disparaître.',
                'Les objectifs d’une leçon s’écrivent et se voient directement dans la carte, au pluriel, avec des boutons pour en ajouter ou en retirer. Reformuler un objectif ne le remplace pas : ses liens survivent à la retouche.',
                'Chaque objectif indique s’il est servi par une activité et vérifié par une évaluation — tu coches les nœuds concernés dans l’inspecteur, et une pastille par objectif montre ce qui reste à couvrir.',
                'Une séquence peut contenir des séquences : tu regroupes à l’échelle que ta discipline demande — module, étape, thème — sans nouveau type de nœud à apprendre.',
                'Le déplacement a été repensé : saisir un bloc déplace ce bloc, ⌘+glisser en fait une copie, et « Dans la leçon » range un nœud depuis l’inspecteur sans aucun geste de glisser. Un conteneur se duplique avec tout son contenu.',
                'Les blocs et la palette se redimensionnent — à la souris comme au doigt sur iPad, avec retour à la taille automatique par double-clic.',
                'Une carte peut être rattachée à son cours, pour la retrouver d’une session à l’autre. Le cours s’affiche à côté du nom de la carte.'
            ]
        },
        {
            version: '1.31',
            couleur: 'vert',
            titre: 'Trimestre : journées sans cours unifiées',
            items: [
                'Une seule carte « Journées sans cours » remplace les deux listes d’événements — congés, fériés et journées personnelles au même endroit, tes données existantes migrent toutes seules.',
                'Nouvelle nature « Férié (collège fermé) » : la fête du Travail n’est plus étiquetée « Institutionnel ».',
                'Avertissements de cohérence sur les bornes du trimestre : une remise de notes avant la fin du trimestre ou une semaine à moitié saisie est signalée — rien n’est bloqué.',
                'Les libellés de reprise disent maintenant « Reprise le [date] (horaire du lundi) » : fini l’ambiguïté sur le jour.',
                'Les champs des semaines spéciales ne se chevauchent plus, et les deux compteurs de semaines/jours de cours affichent enfin le même calcul partout.',
                'La numérotation des semaines suit la règle officielle du cégep : des paquets de 5 jours de cours effectifs, qui s’étirent autour des fériés et enjambent les pauses — elle ne peut plus reculer ni inventer une 17e semaine.'
            ]
        },
        {
            version: '1.30',
            couleur: 'vert',
            titre: 'Alignement : importer une carte d’un autre trimestre',
            items: [
                'Actions → « Importer d’un autre trimestre… » : copie une carte mentale d’un trimestre vers le trimestre actif sans sortir de l’application — comme pour les grilles et les productions. La carte d’origine reste intacte, et les notes de séance des leçons suivent la copie.'
            ]
        },
        {
            version: '1.29',
            couleur: 'vert',
            titre: 'Alignement pédagogique : comptabilité du temps',
            items: [
                'Estime la durée de tes activités (en minutes) dans la carte mentale : la durée d’une leçon se calcule toute seule (somme de ses activités) et s’affiche en périodes dans le sommaire — selon la « Durée d’une période » réglée dans Cadre › Horaire, jamais une valeur fixe.',
                'Jauge de temps au pied de la palette Navigation : total planifié en périodes et en heures, comparé aux heures d’enseignement (RREC) du cours — indicatif et jamais bloquant, les imprévus de session font partie de la vraie vie.',
                'La vue globale affiche la durée totale de chaque séquence à côté de son nombre de leçons.'
            ]
        },
        {
            version: '1.28',
            couleur: 'bleu',
            titre: 'Alignement pédagogique : navigation repensée',
            items: [
                'Nouvelle palette « Navigation » dans la carte mentale : un sommaire montre d’un coup d’œil toute la hiérarchie Vue globale › séquences › leçons — un clic ouvre directement la séquence ou la leçon voulue. La palette se déplace et se réduit comme celle des nœuds.',
                'La barre d’outils de la carte est simplifiée : les carrousels de séquences et de leçons, les compteurs et leurs flèches sont remplacés par le sommaire ; le titre de la carte (en double avec le sélecteur) cède sa place — renomme ta carte via Actions → « Renommer cette carte ».',
                'Nouveau bouton « Recentrer » (◎, aussi ⌘1) : ramène la vue sur le contenu — sur la séquence ouverte s’il y en a une. Il remplace les zooms pleine largeur/hauteur peu utilisés.',
                'Le plein écran de la carte est maintenant vraiment plein écran : le titre de section et la navigation de l’application s’effacent, comme dans la page Annoter.',
                'Nouveau raccourci : ⌥ (Mac) / Alt (Windows) + glisser un bloc en crée un doublon prêt à déposer — et l’aide-mémoire des raccourcis de la palette est complété (⌘D y manquait).'
            ]
        },
        {
            version: '1.27',
            couleur: 'vert',
            titre: 'Suppression de trimestre et corrections d’import',
            items: [
                'Tu peux maintenant supprimer définitivement un trimestre inutile (tests, essais) depuis la gestion des trimestres : confirmation forte en retapant son nom, export de sauvegarde automatique avant l’effacement, et le trimestre actif reste toujours protégé.',
                'Page Calendrier scolaire : les trois indicateurs (semaines scolaires, jours de cours, congés avec reprise) rejoignent la carte « Légende », remontée en tête de page — une seule carte au lieu de quatre. Sur écran étroit, les mois s’empilent maintenant au lieu de déborder à droite.',
                'Réglages du trimestre : les boutons disent maintenant « Créer » ou « Enregistrer » selon le contexte, et le trimestre ne se sauvegarde plus qu’au clic sur « Enregistrer » — fini l’enregistrement silencieux à chaque champ. Le contenu de la page ne déborde plus à droite sur portable.',
                'Import de travaux : le sélecteur global « Production » n’écrase plus une correction faite sur un fichier précis via « Modifier », et l’interface explique la différence entre les deux.',
                'Correction : évaluer une production sans fichier importé n’affiche plus le document d’une autre production.',
                'Correction : les captures de progression automatiques ne créent plus de captures pour les jours où seul un autre groupe a cours, et recapturer une même séance ne crée plus de doublon.',
                'Consultation d’un trimestre archivé : tu peux de nouveau passer d’un·e élève à l’autre dans une évaluation verrouillée (la navigation reste en lecture seule).',
                'Accessibilité : le popup d’aide « Conseil » est maintenant annoncé correctement par les lecteurs d’écran et rend le focus au bouton qui l’a ouvert.'
            ]
        },
        {
            version: '1.26',
            couleur: 'bleu',
            titre: 'Retour du comparateur de pratiques',
            items: [
                'Le comparateur de pratiques est de nouveau accessible en tout temps, dans le Labo sous « Exploration des pratiques » : compare 2 ou 3 pratiques (ou maquettes) côte à côte sur des profils-types tirés de ton échelle, sans passer par le mode démonstration.',
                'Quand une pratique n’est pas encore complète, sa colonne affiche « — non constructible » au lieu d’un 0 trompeur ; les pratiques abouties construisent la note normalement.',
                'Dériver une maquette te dépose directement sur l’arbre d’exploration (plus d’ouverture du formulaire de configuration) ; copier une maquette conserve fidèlement sa configuration.'
            ]
        },
        {
            version: '1.25',
            couleur: 'bleu',
            titre: 'Données plus fiables et modèles isolés par trimestre',
            items: [
                'Fiabilité renforcée : tes saisies, notes et corrections sont maintenant enregistrées de façon durable, même après un rechargement complet de la page — fini les retours en arrière inattendus après un rafraîchissement.',
                'Chaque trimestre conserve ses propres grilles et échelles d’évaluation : les modifier dans un trimestre n’altère plus celles des autres, et changer de trimestre n’affecte pas tes modèles.',
                'Correction : quand une même évaluation existe en double avec une note identique, elle n’est plus comptée deux fois dans le calcul de la note finale.'
            ]
        },
        {
            version: '1.21',
            couleur: 'vert',
            titre: 'Import de pratiques de notation d’un autre trimestre',
            items: [
                'Tu peux maintenant importer une pratique de notation depuis un autre trimestre : elle est copiée dans le trimestre courant et l’originale reste intacte. Un avertissement te signale si son échelle ou ses grilles ne sont pas reprises automatiquement.',
                'Correction : au désarchivage d’un trimestre, les copies de modèles (grilles, échelles, pratiques) ne sont plus dupliquées.'
            ]
        },
        {
            version: '1.20',
            couleur: 'vert',
            titre: 'Note différée, export des résultats et bibliothèques complètes',
            items: [
                'Nouvelle option « Masquer les notes par travail » (Réglages › Préférences) : la note chiffrée de chaque travail est remplacée par un repère « note différée » dans la liste, le profil et le portfolio, pour que ta rétroaction passe d’abord. Les niveaux et la note finale de session restent visibles ; aucun calcul n’est modifié.',
                'Export CSV des résultats finaux du groupe (Suivi › Suivi du groupe) : une ligne par étudiant·e avec la note finale et la pratique en vigueur, pour tes archives.',
                'Tes gabarits, modèles par défaut et exemples par discipline (échelles, grilles, pratiques) réapparaissent dans les bibliothèques — ils étaient masqués à tort.',
                'Au comparateur, une note qui ne peut pas être construite affiche « — non constructible » au lieu d’un 0 trompeur.',
                'Correction : à l’import des travaux, la production choisie (ou détectée d’après le nom du fichier) n’est plus perdue après un rechargement.',
                'Des info-bulles d’aide ont été ajoutées aux outils du Labo (tirage au sort, questions flash) et à la saisie des présences.',
                'Attribution Creative Commons : sans enseignant·e identifié·e, le matériel n’est plus signé d’un nom ni de coordonnées par défaut (mention « Inconnu »).'
            ]
        },
        {
            version: '1.19',
            couleur: 'vert',
            titre: 'Comparateur de pratiques refondu en « banc de décision »',
            items: [
                'Le comparateur génère des profils-types fictifs à partir de TON échelle de performance (autant de profils que de niveaux, plus un parcours irrégulier) — plus besoin du mode démonstration pour l’utiliser.',
                'Compare 2 ou 3 pratiques (ou maquettes) côte à côte sur les mêmes parcours : seules les règles de chaque pratique changent.',
                'Le tableau montre d’abord COMMENT chaque pratique construit la note (pondération, reprises, nombre de productions comptées, méthode de sélection…), puis le résultat sur chaque profil.',
                'Un lien par colonne ouvre le formulaire de la pratique pour l’ajuster ; tu peux aussi comparer sur les données réelles de ton groupe actif.',
                'En dénotation, la colonne rappelle que la note finale est un jugement — pas un calcul — et la pratique peut désormais s’appuyer sur une grille et une échelle pour la rétroaction.',
                'Le menu « Exploration des pratiques » parle maintenant de « maquettes » : crée une maquette, dérive-la une fois, puis adopte-la quand elle te convient (correction au passage de l’erreur « Pratique introuvable » au moment de jeter une maquette).'
            ]
        },
        {
            version: '1.18',
            couleur: 'bleu',
            titre: 'Des fenêtres claires à la place des popups du navigateur',
            items: [
                'Les confirmations, les saisies (nom de codex, de configuration…) et les messages d’information des bibliothèques (productions, planification, pratiques) et du menu Codex s’affichent maintenant dans des fenêtres intégrées à Labo Codex — au style de l’app, en mode clair comme sombre — au lieu des popups gris du navigateur.',
                'Les suppressions définitives sont signalées par un bouton rouge distinct ; Échap annule, Entrée confirme.',
                'Correction : « Dupliquer » et « Dériver une variante » d’une pratique sont de nouveau opérationnels (ils restaient sans effet sur les pratiques créées par l’assistant).',
                'Correction : en plein écran de la carte mentale d’alignement, l’en-tête de l’app ne chevauche plus la carte.'
            ]
        },
        {
            version: '1.14',
            couleur: 'bleu',
            titre: 'Ouverture de codex plus sûre (surtout iPad)',
            items: [
                'Avant d’ouvrir un codex, Labo Codex vérifie qu’il reste assez d’espace : si l’appareil est presque plein, l’ouverture est refusée avec un message clair (combien il faut libérer, où, comment) plutôt que d’échouer à mi-chemin.',
                'En cas d’import incomplet (espace qui se remplit en cours de route, fichier abîmé), tu obtiens un bilan honnête « Import terminé — incomplet » qui dit ce qui manque et quoi faire, au lieu d’un « Codex chargé ! » trompeur.',
                'Rappel utile après l’ouverture : le fichier ZIP d’origine reste dans Fichiers — tu peux le supprimer pour récupérer de l’espace.'
            ]
        },
        {
            version: '1.11',
            couleur: 'vert',
            titre: 'Importe les ressources partagées par tes collègues',
            items: [
                'Tu reçois un fichier .lcz ? Importe-le par le bouton « Importer un partage (.lcz) » de tes bibliothèques, ou par Réglages › Données › « Partage entre collègues » (glisser-déposer accepté).',
                'Avant d’accepter, Labo Codex vérifie tout : structure du fichier, signature de la personne qui l’a créé, continuité de sa clé — puis te présente une prévisualisation (contenu, auteur·e, licence).',
                'Au premier import d’une personne, sa clé de signature est mémorisée. Si un fichier ultérieur se présente sous son nom avec une autre clé, une alerte bloquante te demande de confirmer par un autre canal avant de continuer.',
                'Les items importés restent à part, en lecture seule, dans la section « Partagés par des collègues » de chaque bibliothèque — rien n’est mélangé à tes documents.',
                '« Dupliquer vers mes documents » crée ta copie modifiable : une grille vient avec ses cartouches, une production avec sa grille. L’attribution d’origine est conservée.',
                '« Retirer » (Réglages › Données) supprime un package importé sans toucher tes propres documents.',
                'Pour éviter la confusion, les anciens boutons d’export/import par fichier sont renommés « … (JSON) ».',
                'Correction (iPad surtout) : après « Codex chargé », le rechargement pouvait repartir « sans codex actif » — l’app attend maintenant la fin des écritures avant de proposer le rechargement.',
                'Correction : défaire un jeton de reprise est maintenant un geste clair (décocher = supprimer la reprise et restaurer l’originale, avec confirmation) ; supprimer une évaluation de reprise restaure l’originale même si le lien était abîmé.',
                'Correction : le menu Codex pouvait afficher « Aucun codex actif » au démarrage alors que tes données étaient bien chargées — l’indicateur attend maintenant que le stockage soit prêt.'
            ]
        },
        {
            version: '1.10',
            couleur: 'vert',
            titre: 'Partage tes ressources avec des collègues (.lcz)',
            items: [
                'Nouveau dans le menu ⋮ de tes bibliothèques (grilles, échelles, cartouches, productions, pratiques) : « Exporter pour partager » génère un fichier .lcz (Labo Codex Zip) à transmettre par courriel ou USB.',
                'Le fichier embarque ce qu’il faut pour fonctionner chez l’autre personne : une grille part avec ses cartouches, une production avec sa grille.',
                'Chaque fichier est signé avec ta clé personnelle (créée automatiquement, elle ne quitte jamais ta machine) : la personne qui l’importera pourra vérifier qu’il vient bien de toi et qu’il n’a pas été modifié en chemin.',
                'Le contenu est publié sous licence CC BY-NC-SA 4.0, avec ton attribution — une fenêtre de confirmation te récapitule tout avant l’export.',
                'Le fichier .lcz ne s’ouvre pas au double-clic, c’est normal : il est destiné à être importé dans Labo Codex.'
            ]
        },
        {
            version: '1.6',
            couleur: 'vert',
            titre: 'Des dossiers dans toutes tes bibliothèques',
            items: [
                'Les « Mes dossiers » arrivent aussi dans les bibliothèques de grilles, d’échelles et de productions : crée tes propres dossiers pour ranger ce que tu veux, comme pour les pratiques.',
                'Chaque dossier regroupe ses éléments dans un menu compact ; choisis-en un et ajoute-le à ta barre latérale. Ce qui n’est pas rangé reste sous « Non classées ».',
                'Classe, déplace d’un dossier à l’autre ou sors un élément en un geste — il est toujours rangé à un seul endroit.',
                'Les anciens filtres par discipline (et par pratique pour les échelles) laissent la place à tes dossiers, plus souples.',
                'Les cartouches restent organisées par grille : c’est leur classement naturel, on n’y touche pas.',
                'Comme pour les pratiques, le classement n’organise que l’affichage — il ne modifie jamais tes contenus.',
                'Correction : dans un cours à deux groupes, le taux d’assiduité comptait à tort les séances de l’autre groupe — il reflète maintenant uniquement les séances du groupe de chaque étudiant·e.'
            ]
        },
        {
            version: '1.5',
            couleur: 'vert',
            titre: 'Ranger tes pratiques dans des dossiers',
            items: [
                'Crée tes propres dossiers (« Mes dossiers ») pour classer tes pratiques de notation dans la bibliothèque — tes essais, tes hypothèses, les pratiques reçues de collègues — et t’y retrouver.',
                'Chaque dossier regroupe ses pratiques dans un menu compact : choisis-en une et ajoute-la à ta barre latérale. Ce qui n’est pas rangé reste sous « Non classées ».',
                'Classe, déplace d’un dossier à l’autre ou sors une pratique en un geste. Une pratique est rangée à un seul endroit.',
                'La zone « Mes dossiers » se replie pour gagner de l’espace.',
                'Le classement n’organise que l’affichage : il ne modifie jamais tes pratiques.'
            ]
        },
        {
            version: '1.4',
            couleur: 'vert',
            titre: 'Soutenir le projet + correctifs',
            items: [
'Nouveau bouton « Soutenir Labo Codex » dans l’en-tête (le cœur, à côté du bouton bug) : une fenêtre réunit les façons de contribuer — communauté de pratique, blogue, abonnement de soutien, offrir un abonnement, don. Tu peux aussi nous écrire à labo@codexnumeris.org (commentaire ou demande de présentation).',
                'Le rappel de sauvegarde n’apparaît plus que lorsque tu as de vraies données à protéger (évaluations enregistrées ou travaux importés) — jamais sur une page vide ni en mode démonstration.',
                'Le bandeau de mise à jour ne réapparaît plus en boucle après un rechargement : il ne s’affiche désormais que lors d’une vraie mise à jour déployée pendant que tu travailles.',
                'Assistant de pratique : l’indicateur d’étapes ne s’emballe plus dans le parcours « Je ne suis pas certain·e ».',
                'Correction : certaines icônes du menu mobile (Visite guidée, Assistance, Aide) ne s’affichaient pas sur iPhone.'
            ]
        },
        {
            version: '1.3',
            couleur: 'vert',
            titre: 'Dénotation : une famille de pratique complète',
            items: [
                'Nouvelle famille « Dénotation » : la note finale est un jugement que tu poses, gardé par la confirmation que chaque cible d’apprentissage est atteinte — sortir de la logique du cumul tout en restant certificatif.',
                'Création dans l’assistant (voie rapide → Dénotation) : tu définis tes cibles d’apprentissage et une suggestion statistique d’ancrage (mode, médiane ou moyenne).',
                'Saisie dans le profil étudiant (section « Jugement ») : coche les cibles atteintes, lis la suggestion comme repère, saisis la note et une justification ; une garde t’indique quand la note ne peut pas encore certifier la réussite.',
                'Assistant de pratique : « Je ne suis pas certain·e » ne repose plus la même question — deux questions sur ce que tu fais concrètement (comment tu corriges, ce qu’il advient d’une reprise) suffisent à déduire ta famille.'
            ]
        },
        {
            version: '1.2',
            couleur: 'vert',
            titre: 'Comparateur de pratiques et assistant repensé',
            items: [
                'Comparateur de pratiques : une nouvelle section du Labo met plusieurs pratiques de notation en regard sur des profils-types — pour voir la maîtrise atteinte derrière chaque note, sans en faire un palmarès. Export CSV.',
                'Assistant de pratique repensé : partir d’un modèle existant (copié fidèlement) ou décrire sa pratique ; voie rapide pour les familles connues (sommative, standards, spécifications).',
                'Reprises configurables et garde-fous pédagogiques dans l’assistant : limiter les reprises, alerte au-delà de 15 objectifs.',
                'Récapitulatif enrichi : un exemple chiffré d’ordre de grandeur, et le rappel que ta pratique active n’est pas modifiée.',
                'La famille Dénotation est reconnue à l’édition (création à venir).',
                'Corrections : le titre des fenêtres d’aide est annoncé aux lecteurs d’écran ; icônes de suppression plus lisibles.'
            ]
        },
        {
            version: '1.1',
            couleur: 'vert',
            titre: 'Guides pédagogiques intégrés',
            items: [
                'Trois guides pédagogiques consultables directement dans l’app : taxonomie SOLO (5 pages), Micro-données ACP (3 pages) et modèle RàI (4 pages).',
                'Accessibles depuis Labo → Outils d’observation (bouton « Guide » de chaque carte), depuis la palette d’annotation (catégorie Compréhension, bouton « ? ») et depuis le module Interventions.',
                'Signalés aussi là où le concept apparaît : bannière d’accueil, étape « Labo » de la visite guidée, popups d’aide et fiches du glossaire.',
                'Navigation au clavier (flèches gauche/droite, Échap pour fermer) et points de page cliquables.',
                'La catégorie « Compréhension » (tampons SOLO) de la palette d’annotation suit désormais la préférence « Taxonomie SOLO » des Outils d’observation, comme la catégorie « Action » suit l’observation des actions.',
                'Références académiques citées : Biggs et Collis (1982) pour SOLO, Desrochers (2021) pour la RàI.'
            ]
        },
        {
            version: '1.0',
            couleur: 'vert',
            titre: 'Lancement public',
            items: [
                'Planification\u00a0: carte mentale d\u2019objectifs, alignement p\u00e9dagogique et organisateur de le\u00e7on.',
                '\u00c9valuation\u00a0: grilles de crit\u00e8res, \u00e9chelles de performance et grilles descriptives, calcul automatique.',
                'Annotation des copies au stylet, avec r\u00e9troactions visuelles et cartouches de commentaires.',
                'Suivi du groupe\u00a0: pr\u00e9sences et remises semaine apr\u00e8s semaine, signaux pr\u00e9coces avant la note.',
                'D\u00e9veloppement des habilet\u00e9s\u00a0: trajectoires A-C-P, d\u00e9pistage SOLO et interventions R\u00e0I.',
                'Pratique de notation \u00e0 ta main\u00a0: sommative, par standards ou par sp\u00e9cifications, configur\u00e9e pas \u00e0 pas par un assistant.',
                'Partage entre coll\u00e8gues sous licence Creative Commons \u2014 100\u00a0% hors ligne, donn\u00e9es locales, sans compte.',
                'Version b\u00eata publique, en \u00e9volution\u00a0: un pli\u00a0? Le bouton \u00ab\u00a0Signaler un bug\u00a0\u00bb va droit au d\u00e9veloppeur.'
            ]
        },
        {
            version: 'Beta 99',
            couleur: 'vert',
            titre: 'Consolidation',
            items: [
                'Ent\u00eate repens\u00e9e\u00a0: identit\u00e9 de l\u2019app, contexte de travail (s\u00e9lecteur de groupe-cours) et navigation en zones distinctes. Boutons utilitaires regroup\u00e9s en deux clusters (Bug\u00a0/\u00a0Anonymisation\u00a0/\u00a0Th\u00e8me, puis Aide\u00a0/\u00a0R\u00e9glages) s\u00e9par\u00e9s par une ligne verticale. Navigation primaire (7\u00a0boutons) coll\u00e9e en haut au scroll.',
                'Adaptation iPad et iPhone\u00a0: en dessous de 1024\u00a0px, les boutons de navigation deviennent des menus d\u00e9roulants natifs et les 5\u00a0boutons utilitaires sont regroup\u00e9s dans un menu \u00ab\u00a0\u22ef\u00a0\u00bb. Correction des chevauchements visuels sur iPhone.',
                'Mode d\u00e9monstration refondu\u00a0: les donn\u00e9es d\u00e9mo sont d\u00e9sormais permanentes et disponibles dans des s\u00e9lecteurs \u00e0 deux sections (\u00ab\u00a0Mes documents\u00a0\u00bb / \u00ab\u00a0D\u00e9mo\u00a0\u00bb). Active ou d\u00e9sactive le mode sans risque pour tes vraies donn\u00e9es.',
                'Duplication CC\u00a0: tout item d\u00e9mo (grille, \u00e9chelle, cartouche, production, pratique, groupe-cours) peut \u00eatre dupliqu\u00e9 pour servir de mod\u00e8le \u00e0 tes propres documents. L\u2019attribution \u00ab\u00a0Inspir\u00e9 de\u00a0\u00bb est conserv\u00e9e dans les m\u00e9tadonn\u00e9es.',
                'Nouvelle observation \u2014 Actions RLO (Rep\u00e9rage, Liaison, Ouverture)\u00a0: tampons cognitifs pos\u00e9s sur les productions, agr\u00e9g\u00e9s dans chaque \u00e9valuation, visualis\u00e9s en courbe d\u2019\u00e9volution par production et exportables en recherche anonymis\u00e9e (gestes cognitifs et en difficult\u00e9 avec ratios).',
                'Profil \u00e9tudiant \u2014 onglets \u00ab\u00a0Crit\u00e8res / Forces et d\u00e9fis / Gestes cognitifs\u00a0\u00bb dans \u00ab\u00a0D\u00e9veloppement des habilet\u00e9s\u00a0\u00bb pour r\u00e9duire le d\u00e9filement vertical ; bloc \u00ab\u00a0Consolidation\u00a0\u00bb rapatri\u00e9 ici (portrait par crit\u00e8re\u00a0: consolid\u00e9 / fragile / non consolid\u00e9).',
                'R\u00e9glages r\u00e9organis\u00e9s\u00a0: l\u2019onglet \u00ab\u00a0Outils d\u2019observation\u00a0\u00bb regroupe les 6 outils d\u2019observation (SOLO, Actions RLO, Micro donn\u00e9es ACP, graphiques d\u2019\u00e9volution, D\u00e9veloppement des habilet\u00e9s, unit\u00e9 d\u2019assiduit\u00e9). Chaque case nomme maintenant l\u2019\u00e9cran qu\u2019elle affecte.',
                'Indice E (Engagement) enti\u00e8rement retir\u00e9 du code, de l\u2019affichage et de l\u2019export. La pratique p\u00e9dagogique reste, l\u2019ancien indice dispara\u00eet.',
                'Nouveau\u00a0: Rythme de travail \u2014 statistiques de dur\u00e9e par activit\u00e9, estimation de la charge et planning hebdomadaire.',
                'Travaux\u00a0: tri par titre / type / date d\u2019\u00e9ch\u00e9ance, import 250\u00a0dpi par d\u00e9faut (200\u2013300 configurable), gestion de 68+ fichiers sans crash, previews instantan\u00e9es.',
                'Fiabilit\u00e9\u00a0: erreurs de fran\u00e7ais et crit\u00e8res algorithmiques sauvegard\u00e9s imm\u00e9diatement au changement d\u2019\u00e9l\u00e8ve.',
                'Interventions R\u00e0I\u00a0: formulaire unifi\u00e9, crit\u00e8res cibl\u00e9s depuis le d\u00e9pistage, objectif mesurable, bilan avant/apr\u00e8s.',
                'Num\u00e9rotation des semaines align\u00e9e sur le calendrier officiel de la D\u00c9\u00a0: les permutations (gr\u00e8ve, EUF, f\u00e9ri\u00e9s d\u00e9plac\u00e9s) sont maintenant prises en compte. Nouveau champ \u00ab\u00a0Type d\u2019\u00e9v\u00e9nement\u00a0\u00bb (Institutionnel\u00a0/ Personnel) qui distingue les annulations coll\u00e8ge des absences personnelles\u00a0; les absences personnelles ne d\u00e9calent plus la num\u00e9rotation des semaines. Les num\u00e9ros de semaine s\u2019affichent aussi sur les jours ouvrables hors horaire du groupe.',
                'S\u00e9curit\u00e9 \u2014 nouveau r\u00e9glage \u00ab\u00a0M\u00e9moriser le dossier Travaux et les Archives entre les sessions\u00a0\u00bb (R\u00e9glages > Pr\u00e9f\u00e9rences > S\u00e9curit\u00e9, d\u00e9sactiv\u00e9 par d\u00e9faut). Quand d\u00e9sactiv\u00e9, l\u2019app demande \u00e0 chaque d\u00e9marrage l\u2019acc\u00e8s au dossier \u2014 plus s\u00fbr face \u00e0 un script malveillant qui s\u2019ex\u00e9cuterait pendant une session.',
                'Confirmation avant chaque export\u00a0: une nouvelle fen\u00eatre liste les fichiers du Codex / archive / configuration / tampons avant le t\u00e9l\u00e9chargement. Tu peux v\u00e9rifier qu\u2019aucun fichier inattendu ne s\u2019est gliss\u00e9 dans l\u2019envoi avant de confirmer.',
                'V\u00e9rification d\u2019int\u00e9grit\u00e9 \u2014 chaque ressource partag\u00e9e (grille, \u00e9chelle, cartouche, pratique, production, tampon) est scell\u00e9e \u00e0 l\u2019export avec une empreinte SHA-256. \u00c0 l\u2019import, l\u2019app v\u00e9rifie la signature et alerte si une ressource a \u00e9t\u00e9 modifi\u00e9e en transit.',
                'Page d\u2019accueil \u2014 invitation \u00e0 rejoindre la Communaut\u00e9 de pratique Labo Codex h\u00e9berg\u00e9e par l\u2019AQPC. L\u2019application reste publiquement accessible, sans date de fermeture.'
            ]
        },
        {
            version: 'Beta 98',
            couleur: 'vert',
            titre: 'S\u00e9curit\u00e9 renforc\u00e9e et codex USB',
            items: [
                'S\u00e9curit\u00e9\u00a0: politique CSP active, z\u00e9ro script inline, protection XSS sur les donn\u00e9es utilisateur.',
                'Validation des imports\u00a0: v\u00e9rification taille ZIP, signatures images/PDF, protection path traversal.',
                'R\u00e9troactions personnalisables\u00a0: tampons, codes d\u2019erreur, ic\u00f4nes et couleurs modifiables par l\u2019enseignant.',
                'Biblioth\u00e8que de tampons\u00a0: partage, export et import de collections par cat\u00e9gorie.',
                'Outils d\u2019annotation enrichis\u00a0: ligne, vague, duplication, s\u00e9lection et formes.',
                'Codex USB pour transporter tes donn\u00e9es entre appareils.',
                'Corr\u00e9lations longitudinales et impact des jetons\u00a0: deux graphiques d\u2019analyse (maintenant dans Labo \u203a \u00c9tudes).',
                'Console all\u00e9g\u00e9e\u00a0: 2600+ messages de debug retir\u00e9s pour une exp\u00e9rience plus propre.'
            ]
        },
        {
            version: 'Beta 97',
            couleur: 'vert',
            titre: 'Planification, parcours et travaux',
            items: [
                'Nouvel onglet Planification\u00a0: carte mentale, alignement p\u00e9dagogique, clonage, verbes d\u2019Anderson.',
                'Parcours d\u2019apprentissage guid\u00e9 (2\u00a0modes\u00a0: \u00e9tape par \u00e9tape ou exploration).',
                'Module Travaux\u00a0: import, annotation au stylet, \u00e9valuation c\u00f4te \u00e0 c\u00f4te, export PDF.',
                'Assistant de configuration\u00a0: d\u00e9tecte automatiquement ton type de pratique de notation.',
                'Suivi d\u2019\u00e9tudiants color\u00e9s au tableau de bord (jusqu\u2019\u00e0 5\u00a0\u00e9l\u00e8ves).',
                'Aide contextuelle compl\u00e8te (100\u00a0% des sections document\u00e9es).'
            ]
        },
        {
            version: 'Beta 96',
            couleur: 'bleu',
            titre: 'Graphiques et synchronisation',
            items: [
                'Graphiques spaghetti (trajectoires A\u2011C\u2011P) et courbes de distribution.',
                'Bo\u00eete \u00e0 outils\u00a0: tirage au sort et questions flash.',
                'Synchronisation MacBook \u2194 iPad fiable.',
                'Gestion des ressources (nettoyage des \u00e9l\u00e9ments inutilis\u00e9s).'
            ]
        },
        {
            version: 'Beta 95',
            couleur: 'bleu',
            titre: 'Architecture groupe-cours',
            items: [
                'Architecture modulaire\u00a0: cours, enseignant, horaire et groupe-cours s\u00e9par\u00e9s.',
                'Gestion multi-trimestres avec donn\u00e9es isol\u00e9es.',
                'Saisie des pr\u00e9sences en p\u00e9riodes (fractions possibles).',
                'Export PDF des grilles descriptives.'
            ]
        }
    ];

    /**
     * Génère le HTML complet du changelog à partir du tableau CHANGELOG.
     * @returns {string} HTML des entrées changelog
     */
    function genererChangelogHTML() {
        var html = '';
        for (var i = 0; i < CHANGELOG.length; i++) {
            var entry = CHANGELOG[i];
            var titreSuffix = entry.titre ? ' \u2014 ' + entry.titre : '';
            html += '<div class="changelog-entry changelog-entry--' + entry.couleur + '">';
            html += '<strong class="changelog-title">' + entry.version + titreSuffix + '</strong>';
            html += '<ul class="changelog-list">';
            for (var j = 0; j < entry.items.length; j++) {
                html += '<li>' + entry.items[j] + '</li>';
            }
            html += '</ul>';
            html += '</div>';
        }
        return html;
    }

    // Export global
    window.CHANGELOG = CHANGELOG;
    window.genererChangelogHTML = genererChangelogHTML;
})();
