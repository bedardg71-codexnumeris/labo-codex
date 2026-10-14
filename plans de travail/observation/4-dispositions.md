# Observation, temps 4 : dispositions

*14 octobre 2026. Ce que deviennent les écarts de `3-ecarts.md`, pour que l'audit soit fermé et non laissé en suspens (CLAUDE.md, « Ce qu'un audit doit produire »). Tri et vérification par Claude Code, à la demande de Grégoire ; décisions de Grégoire du 14 oct. : inscrire au BACKLOG les écarts de gravité haute ou moyenne confirmés au code, noter les autres sans fiche.*

## Comment ce tri a été fait

1. Les 199 entrées « fait autrement » ont été lues une à une et rangées en six groupes : données et calculs ; règles à trancher ; cohérence de l'interface ; écritures sans geste déjà connues ; mots et libellés ; sans suite. Ce rangement est un jugement (inférence), pas une mesure.
2. Les 37 entrées du groupe « données et calculs » (≈ 25 problèmes), plus quatre écarts que l'observation met en tête de son résumé (pratique supprimée, export JSON de pratique, export CSV des résultats, export pour la recherche), ont été vérifiés **au code de `main`** (HEAD `9caefeb46`) par quatre agents en lecture seule : 24 confirmés, 4 non confirmés, 1 résolu (l'assiduité compte en périodes).
3. Ce qui a été observé l'a été sur la copie 1.199.0 (`b709f2a`), dans Chromium sans tête, avec des données fictives.

## Ce qui est inscrit

- **#1055** la case « diagnostique » se reporte (haute) · **#1056** échéance par groupe effacée · **#1057** pratique appliquée supprimée · **#1058** texte d'annotation en double · **#1059** import de cartouche non enregistré · **#1060** table de correspondance en clair · **#1061** export pour la recherche sans captures · **#1062** présence d'intervention et séance « saisie » · **#1063** `infoCours` sans `_groupeCoursId` · **#1064** verrouillage · **#1065** horaire supprimé · **#1066** pratique retirée introuvable · **#1067** groupe-cours sans pratique et 0 affichés.
- **#1054** élargie (`rendreInterface`, `rendreAideHTML`).

## Notés sans fiche (gravité basse, confirmés au code)

- Export CSV des résultats finaux : colonnes Groupe et Cours vides (`js/export-resultats-finaux.js:147-148` lit des champs que l'objet cours ne porte pas).
- « Exporter (JSON) » d'une pratique produit un fichier que « Importer » refuse (`js/pratiques-gestion.js:2314-2328` contre l. 2480-2491 ; « retrait prévu », P8 #329).
- Assistant de pratique abandonné : les repères choisis restent écrits sur l'échelle (#577).
- Import d'élèves : lignes de moins de 4 colonnes ignorées sans le dire (`js/trimestre-v2-etudiants.js:1300`).
- Sceau `_hash_v1` invalide accepté par l'import d'une configuration JSON (le .lcz, lui, refuse) : règle à trancher.
- Mémoire pleine au tout premier démarrage : erreur non capturée (`js/securite-prefs.js:41`, famille #670).
- Réparation sans geste des `groupeCoursId` des copies (`js/travaux-ui.js:812`, idempotente ; réserve non mesurée : un élève dans deux groupes-cours).
- Trouvaille en chemin : `importerCommentaires` (`js/cartouches.js:1293`) n'a ni appelant ni zone de saisie, code mort.

## Ce qui reste à faire

- **Étape 2, à Grégoire** : les entrées marquées « question de règle » ci-dessous (≈ 13 questions), présentées une à une avec une recommandation.
- **Lots sans fiche**, à prendre quand Grégoire le décidera : cohérence de l'interface (fenêtres du navigateur encore employées, attribution « Inconnu » des copies, clone lié de la carte, etc.) et lot des mots.
- **Les autres catégories de `3-ecarts.md`** : la catégorie 2 « aucune mention » (690 entrées) mesure le silence de l'observation, pas un défaut ; la catégorie 4 (413) est non comparable ; **la catégorie 1 « fait sans être prévu » (351) n'a pas encore été triée.**

## Les 199 entrées « fait autrement »

Décompte : noté sans fiche 95, sans suite 35, question de règle 25, inscrit 21, déjà inscrit 16, non confirmé 4, résolu 2, comportement décidé 1.

| Entrée | Écran | Groupe | Disposition |
|---|---|---|---|
| 1.4 | Écran 1 · Ouverture de l'application | Sans suite | sans suite : détail ou limite de l'observation |
| 1.26 | Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et L | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 1.42 | Écran 3 · Mode démonstration (case « Données démo » de l'Accueil, et L | Règles à trancher | question de règle (étape 2) |
| 1.108 | Écran 7 · Rappel « Mets ton codex à jour » | Sans suite | sans suite : détail ou limite de l'observation |
| 1.110 | Écran 7 · Rappel « Mets ton codex à jour » | Sans suite | sans suite : détail ou limite de l'observation |
| 1.113 | Écran 8 · Témoin « Enregistré » (tous les écrans) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 1.114 | Écran 8 · Témoin « Enregistré » (tous les écrans) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 1.115 | Écran 8 · Témoin « Enregistré » (tous les écrans) | Mots et libellés | noté sans fiche : lot des mots |
| 1.116 | Écran 8 · Témoin « Enregistré » (tous les écrans) | Données et calculs | noté sans fiche (basse : premier démarrage seulement, famille #670) |
| 1.122 | Écran 9 · Fenêtres de confirmation de l'application (tous les écrans) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 1.123 | Écran 9 · Fenêtres de confirmation de l'application (tous les écrans) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 1.124 | Écran 9 · Fenêtres de confirmation de l'application (tous les écrans) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 1.125 | Écran 9 · Fenêtres de confirmation de l'application (tous les écrans) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 1.126 | Écran 9 · Fenêtres de confirmation de l'application (tous les écrans) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 1.127 | Écran 9 · Fenêtres de confirmation de l'application (tous les écrans) | Données et calculs | non confirmé : déjà corrigé avant la copie (#945, 1.159.5) |
| 1.153 | Écran 14 · Aide | Mots et libellés | noté sans fiche : lot des mots |
| 1.164 | Écran 15 · Au chargement de l'application | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 1.165 | Écran 15 · Au chargement de l'application | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 2.2 | Écran 16 · Cadre (règles communes à toute la section) | Mots et libellés | noté sans fiche : lot des mots |
| 2.6 | Écran 16 · Cadre (règles communes à toute la section) | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 2.9 | Écran 17 · Cadre › Trimestre (la fiche du trimestre) | Sans suite | sans suite : détail ou limite de l'observation |
| 2.10 | Écran 17 · Cadre › Trimestre (la fiche du trimestre) | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 2.12 | Écran 17 · Cadre › Trimestre (la fiche du trimestre) | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 2.13 | Écran 17 · Cadre › Trimestre (la fiche du trimestre) | Mots et libellés | noté sans fiche : lot des mots |
| 2.16 | Écran 17 · Cadre › Trimestre (la fiche du trimestre) | Règles à trancher | question de règle (étape 2) |
| 2.19 | Écran 17 · Cadre › Trimestre (la fiche du trimestre) | Sans suite | sans suite : détail ou limite de l'observation |
| 2.26 | Écran 17 · Cadre › Trimestre (la fiche du trimestre) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 2.31 | Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trime | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 2.32 | Écran 18 · Cadre › Trimestre › Bibliothèque (la bibliothèque des trime | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 2.74 | Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe)  | Mots et libellés | noté sans fiche : lot des mots |
| 2.75 | Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe)  | Écritures sans geste (connues) | déjà inscrit : #1043 |
| 2.89 | Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe)  | Mots et libellés | noté sans fiche : lot des mots |
| 2.93 | Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe)  | Données et calculs | noté sans fiche (basse : une liste Omnivox a toujours 4 colonnes) |
| 2.96 | Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe)  | Mots et libellés | noté sans fiche : lot des mots |
| 2.97 | Écran 19 · Cadre › Trimestre › Groupe d'étudiant·es (liste du groupe)  | Mots et libellés | noté sans fiche : lot des mots |
| 2.108 | Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque d | Mots et libellés | noté sans fiche : lot des mots |
| 2.109 | Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque d | Données et calculs | comportement décidé (#449, livré en 1.88.0) ; l'intention le contredit : question de règle (étape 2) |
| 2.110 | Écran 20 · Cadre › Trimestre › Cours et services (et la Bibliothèque d | Règles à trancher | question de règle (étape 2) |
| 2.114 | Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil ») | Sans suite | sans suite : détail ou limite de l'observation |
| 2.117 | Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil ») | Données et calculs | inscrit #1065 |
| 2.118 | Écran 21 · Cadre › Trimestre › Enseignant·e (« mon profil ») | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 2.120 | Écran 22 · Cadre › Trimestre › Horaire | Règles à trancher | question de règle (étape 2) |
| 2.123 | Écran 22 · Cadre › Trimestre › Horaire | Mots et libellés | noté sans fiche : lot des mots |
| 2.128 | Écran 22 · Cadre › Trimestre › Horaire | Règles à trancher | question de règle (étape 2) |
| 2.134 | Écran 23 · Cadre › Trimestre › Groupe-cours | Mots et libellés | noté sans fiche : lot des mots |
| 2.136 | Écran 23 · Cadre › Trimestre › Groupe-cours | Mots et libellés | noté sans fiche : lot des mots |
| 2.140 | Écran 23 · Cadre › Trimestre › Groupe-cours | Données et calculs | inscrit #1067 |
| 2.145 | Écran 24 · Cadre › Calendrier scolaire | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 3.2 | Écran 25 · Conception (commun aux trois écrans) | Données et calculs | inscrit #1055 |
| 3.15 | Écran 25 · Conception (commun aux trois écrans) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 3.16 | Écran 25 · Conception (commun aux trois écrans) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 3.23 | Écran 26 · Conception › Productions étudiantes | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 3.24 | Écran 26 · Conception › Productions étudiantes | Données et calculs | inscrit #1055 |
| 3.26 | Écran 26 · Conception › Productions étudiantes | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 3.27 | Écran 26 · Conception › Productions étudiantes | Données et calculs | inscrit #1056 |
| 3.30 | Écran 26 · Conception › Productions étudiantes | Règles à trancher | question de règle (étape 2) |
| 3.32 | Écran 26 · Conception › Productions étudiantes | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 3.33 | Écran 26 · Conception › Productions étudiantes | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 3.46 | Écran 26 · Conception › Productions étudiantes | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 3.55 | Écran 27 · Conception › Grilles de critères | Règles à trancher | question de règle (étape 2) |
| 3.63 | Écran 27 · Conception › Grilles de critères | Règles à trancher | question de règle (étape 2) |
| 3.69 | Écran 27 · Conception › Grilles de critères | Mots et libellés | noté sans fiche : lot des mots |
| 3.110 | Écran 28 · Conception › Échelles de performance | Règles à trancher | question de règle (étape 2) |
| 3.121 | Écran 28 · Conception › Échelles de performance | Règles à trancher | question de règle (étape 2) |
| 4.1 | Écran 29 · Conception › Rétroactions (cartouches) | Mots et libellés | noté sans fiche : lot des mots |
| 4.2 | Écran 29 · Conception › Rétroactions (cartouches) | Sans suite | sans suite : détail ou limite de l'observation |
| 4.7 | Écran 29 · Conception › Rétroactions (cartouches) | Mots et libellés | noté sans fiche : lot des mots |
| 4.17 | Écran 29 · Conception › Rétroactions (cartouches) | Données et calculs | inscrit #1059 |
| 4.19 | Écran 29 · Conception › Rétroactions (cartouches) | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.21 | Écran 29 · Conception › Rétroactions (cartouches) | Règles à trancher | question de règle (étape 2) |
| 4.24 | Écran 30 · Conception › Rétroactions › « Consulter la bibliothèque » ( | Mots et libellés | noté sans fiche : lot des mots |
| 4.25 | Écran 30 · Conception › Rétroactions › « Consulter la bibliothèque » ( | Mots et libellés | noté sans fiche : lot des mots |
| 4.30 | Écran 31 · Conception › Pratiques de notation (barre latérale, carte d | Sans suite | sans suite : détail ou limite de l'observation |
| 4.32 | Écran 31 · Conception › Pratiques de notation (barre latérale, carte d | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.40 | Écran 31 · Conception › Pratiques de notation (barre latérale, carte d | Règles à trancher | question de règle (étape 2) |
| 4.42 | Écran 31 · Conception › Pratiques de notation (barre latérale, carte d | Données et calculs | non confirmé : le geste observé est « Ajouter » (voulu, #476 D7), toutes les copies changent l'id |
| 4.43 | Écran 31 · Conception › Pratiques de notation (barre latérale, carte d | Mots et libellés | noté sans fiche : lot des mots |
| 4.51 | Écran 32 · Assistant de pratique | Sans suite | sans suite : détail ou limite de l'observation |
| 4.60 | Écran 32 · Assistant de pratique | Données et calculs | noté sans fiche (basse : repère choisi par l'enseignant, #577) |
| 4.61 | Écran 32 · Assistant de pratique | Données et calculs | noté sans fiche (basse : repère choisi par l'enseignant, #577) |
| 4.69 | Écran 33 · Conception › Pratiques de notation › « Partir d'un modèle » | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.88 | Écran 34 · Conception › Carte d'alignement › canevas | Règles à trancher | question de règle (étape 2) |
| 4.89 | Écran 34 · Conception › Carte d'alignement › canevas | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.91 | Écran 34 · Conception › Carte d'alignement › canevas | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.92 | Écran 34 · Conception › Carte d'alignement › canevas | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.93 | Écran 34 · Conception › Carte d'alignement › canevas | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.102 | Écran 34 · Conception › Carte d'alignement › canevas | Règles à trancher | question de règle (étape 2) |
| 4.128 | Écran 35 · Conception › Carte d'alignement › barre et menus | Mots et libellés | noté sans fiche : lot des mots |
| 4.130 | Écran 35 · Conception › Carte d'alignement › barre et menus | Mots et libellés | noté sans fiche : lot des mots |
| 4.164 | Écran 40 · Barre latérale de la Conception et bibliothèques partagées  | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.166 | Écran 40 · Barre latérale de la Conception et bibliothèques partagées  | Données et calculs | inscrit #1066 |
| 4.168 | Écran 40 · Barre latérale de la Conception et bibliothèques partagées  | Règles à trancher | question de règle (étape 2) |
| 4.171 | Écran 40 · Barre latérale de la Conception et bibliothèques partagées  | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.172 | Écran 40 · Barre latérale de la Conception et bibliothèques partagées  | Données et calculs | déjà inscrit : #476 D6 et #481 (I10), confirmé au code |
| 4.174 | Écran 40 · Barre latérale de la Conception et bibliothèques partagées  | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.182 | Écran 40 · Barre latérale de la Conception et bibliothèques partagées  | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.198 | Écran 41 · Partage entre collègues | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 4.199 | Écran 41 · Partage entre collègues | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 5.5 | Écran 43 · Évaluation (toute la section) | Règles à trancher | question de règle (étape 2) |
| 5.6 | Écran 43 · Évaluation (toute la section) | Sans suite | sans suite : détail ou limite de l'observation |
| 5.8 | Écran 43 · Évaluation (toute la section) | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 5.9 | Écran 43 · Évaluation (toute la section) | Données et calculs | noté sans fiche (basse : réparation idempotente, origine SUIVI-BUGS #81) |
| 5.14 | Écran 44 · Évaluation › Liste des évaluations | Mots et libellés | noté sans fiche : lot des mots |
| 5.16 | Écran 44 · Évaluation › Liste des évaluations | Mots et libellés | noté sans fiche : lot des mots |
| 5.17 | Écran 44 · Évaluation › Liste des évaluations | Mots et libellés | noté sans fiche : lot des mots |
| 5.19 | Écran 44 · Évaluation › Liste des évaluations | Mots et libellés | noté sans fiche : lot des mots |
| 5.27 | Écran 44 · Évaluation › Liste des évaluations | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 5.33 | Écran 44 · Évaluation › Liste des évaluations | Mots et libellés | noté sans fiche : lot des mots |
| 5.37 | Écran 44 · Évaluation › Liste des évaluations | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 5.54 | Écran 44 · Évaluation › Liste des évaluations | Mots et libellés | noté sans fiche : lot des mots |
| 5.58 | Écran 45 · Évaluation › Préparer et importer | Sans suite | sans suite : détail ou limite de l'observation |
| 5.59 | Écran 45 · Évaluation › Préparer et importer | Mots et libellés | noté sans fiche : lot des mots |
| 5.60 | Écran 45 · Évaluation › Préparer et importer | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 5.61 | Écran 45 · Évaluation › Préparer et importer | Mots et libellés | noté sans fiche : lot des mots |
| 5.71 | Écran 45 · Évaluation › Préparer et importer | Mots et libellés | noté sans fiche : lot des mots |
| 5.78 | Écran 45 · Évaluation › Préparer et importer | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 5.87 | Écran 45 · Évaluation › Préparer et importer | Sans suite | sans suite : détail ou limite de l'observation |
| 5.89 | Écran 46 · Évaluation › Annoter et évaluer | Données et calculs | inscrit #1064 |
| 5.90 | Écran 46 · Évaluation › Annoter et évaluer | Données et calculs | inscrit #1064 |
| 5.101 | Écran 46 · Évaluation › Annoter et évaluer | Données et calculs | inscrit #1058 |
| 5.116 | Écran 46 · Évaluation › Annoter et évaluer | Sans suite | sans suite : détail ou limite de l'observation |
| 5.131 | Écran 46 · Évaluation › Annoter et évaluer | Sans suite | sans suite : détail ou limite de l'observation |
| 5.139 | Écran 46 · Évaluation › Annoter et évaluer | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 5.140 | Écran 46 · Évaluation › Annoter et évaluer | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 5.149 | Écran 46 · Évaluation › Annoter et évaluer | Sans suite | sans suite : détail ou limite de l'observation |
| 5.152 | Écran 46 · Évaluation › Annoter et évaluer | Sans suite | sans suite : détail ou limite de l'observation |
| 5.154 | Écran 46 · Évaluation › Annoter et évaluer | Données et calculs | inscrit #1064 |
| 5.173 | Écran 47 · Évaluation › Exporter et archiver | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 6.1 | Écran 49 · Suivi (commun aux quatre écrans de cette partie) | Données et calculs | inscrit #1067 |
| 6.3 | Écran 49 · Suivi (commun aux quatre écrans de cette partie) | Règles à trancher | question de règle (étape 2) |
| 6.7 | Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écr | Règles à trancher | résolu : le calcul compte en périodes ; seul le texte d'aide de js/etudiants.js:381-382 parle d'heures (lot des mots) |
| 6.8 | Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écr | Règles à trancher | résolu : le calcul compte en périodes ; seul le texte d'aide de js/etudiants.js:381-382 parle d'heures (lot des mots) |
| 6.12 | Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écr | Sans suite | sans suite : détail ou limite de l'observation |
| 6.13 | Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écr | Données et calculs | inscrit #1062 |
| 6.17 | Écran 50 · Suivi : les indices A, C, P (règles lues par les quatre écr | Règles à trancher | question de règle (étape 2) |
| 6.19 | Écran 51 · Suivi : les captures hebdomadaires | Données et calculs | inscrit #1063 |
| 6.27 | Écran 52 · Suivi › Suivi du groupe | Sans suite | sans suite : détail ou limite de l'observation |
| 6.41 | Écran 52 · Suivi › Suivi du groupe | Sans suite | sans suite : détail ou limite de l'observation |
| 6.58 | Écran 54 · Suivi › Profils individuels (le profil d'un élève) | Données et calculs | non confirmé : deux élèves différents ; seul écart, un libellé de complétion |
| 6.93 | Écran 54 · Suivi › Profils individuels (le profil d'un élève) | Données et calculs | non confirmé : deux élèves différents ; seul écart, un libellé de complétion |
| 6.97 | Écran 54 · Suivi › Profils individuels (le profil d'un élève) | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 6.99 | Écran 54 · Suivi › Profils individuels (le profil d'un élève) | Écritures sans geste (connues) | déjà inscrit : #1040, #981 (écritures sans geste) |
| 6.109 | Écran 55 · Suivi › Saisie des présences | Sans suite | sans suite : détail ou limite de l'observation |
| 7.1 | Écran 56 · Le dépistage : ce qu'il calcule (transversal, lu dans le Su | Règles à trancher | question de règle (étape 2) |
| 7.2 | Écran 56 · Le dépistage : ce qu'il calcule (transversal, lu dans le Su | Règles à trancher | question de règle (étape 2) |
| 7.15 | Écran 57 · Suivi › Profils individuels › Accompagnement : la carte RàI | Sans suite | sans suite : détail ou limite de l'observation |
| 7.29 | Écran 59 · Le dépistage du français en semaine 1 : le travail diagnost | Données et calculs | inscrit #1055 |
| 7.46 | Écran 60 · Suivi › Interventions | Données et calculs | inscrit #1063 |
| 7.53 | Écran 60 · Suivi › Interventions | Sans suite | sans suite : détail ou limite de l'observation |
| 7.67 | Écran 60 · Suivi › Interventions | Sans suite | sans suite : détail ou limite de l'observation |
| 7.69 | Écran 61 · Suivi › Rencontres | Mots et libellés | noté sans fiche : lot des mots |
| 7.79 | Écran 61 · Suivi › Rencontres | Mots et libellés | noté sans fiche : lot des mots |
| 7.80 | Écran 61 · Suivi › Rencontres | Sans suite | sans suite : détail ou limite de l'observation |
| 7.94 | Écran 61 · Suivi › Rencontres | Sans suite | sans suite : détail ou limite de l'observation |
| 7.98 | Écran 62 · Suivi › Animation | Mots et libellés | noté sans fiche : lot des mots |
| 7.101 | Écran 62 · Suivi › Animation | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 7.102 | Écran 62 · Suivi › Animation | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 7.103 | Écran 62 · Suivi › Animation | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 7.104 | Écran 62 · Suivi › Animation | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 7.105 | Écran 62 · Suivi › Animation | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 8.9 | Écran 63 · Labo › Outils d'observation | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 8.11 | Écran 63 · Labo › Outils d'observation | Mots et libellés | noté sans fiche : lot des mots |
| 8.12 | Écran 63 · Labo › Outils d'observation | Mots et libellés | noté sans fiche : lot des mots |
| 8.13 | Écran 63 · Labo › Outils d'observation | Mots et libellés | noté sans fiche : lot des mots |
| 8.21 | Écran 63 · Labo › Outils d'observation | Règles à trancher | question de règle (étape 2) |
| 8.23 | Écran 63 · Labo › Outils d'observation | Règles à trancher | question de règle (étape 2) |
| 8.26 | Écran 63 · Labo › Outils d'observation | Règles à trancher | question de règle (étape 2) |
| 8.33 | Écran 64 · Labo › Suivi longitudinal | Mots et libellés | noté sans fiche : lot des mots |
| 8.43 | Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiqu | Règles à trancher | question de règle (étape 2) |
| 8.44 | Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiqu | Sans suite | sans suite : détail ou limite de l'observation |
| 8.51 | Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiqu | Sans suite | sans suite : détail ou limite de l'observation |
| 8.54 | Écran 65 · Labo › Exploration des pratiques (le Comparateur de pratiqu | Mots et libellés | noté sans fiche : lot des mots |
| 8.60 | Écran 67 · Labo › Bilan réflexif | Données et calculs | déjà inscrit : #1054, élargie le 14 oct. |
| 8.63 | Écran 69 · Labo › Études | Sans suite | sans suite : détail ou limite de l'observation |
| 9.2 | Introduction de la partie | Mots et libellés | noté sans fiche : lot des mots |
| 9.49 | Écran 72 · Réglages › Données › « Ouvrir une archive… » | Mots et libellés | noté sans fiche : lot des mots |
| 9.60 | Écran 73 · Réglages › Données › carte « Ouverture et partage » | Données et calculs | déjà inscrit : #1012, relevé (c), confirmé au code |
| 9.61 | Écran 73 · Réglages › Données › carte « Ouverture et partage » | Données et calculs | déjà inscrit : #1012, relevé (c), confirmé au code |
| 9.71 | Écran 74 · Réglages › Données › « Partage entre collègues » et « Packa | Données et calculs | noté sans fiche (basse) : le .lcz refuse un partage altéré ; le JSON de « Exporter ma config » l'accepte avec une ligne dans la notification. Question de règle (étape 2) |
| 9.79 | Écran 75 · Réglages › Captures et recherche | Données et calculs | inscrit #1060 |
| 9.80 | Écran 75 · Réglages › Captures et recherche | Données et calculs | inscrit #1061 |
| 9.92 | Écran 77 · Réglages › Données › Maintenance | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| 9.95 | Écran 79 · Réglages › À propos | Sans suite | sans suite : artefact de la préparation (changelog vidé dans la copie) |
| 9.96 | Écran 80 · Mode anonymisation (transversal) | Sans suite | sans suite : détail ou limite de l'observation |
| 9.97 | Écran 80 · Mode anonymisation (transversal) | Sans suite | sans suite : détail ou limite de l'observation |
| A.3 | Notés par l'analyste « entrée et codex » | Données et calculs | déjà inscrit : #1012, relevé (c), confirmé au code |
| A.6 | Notés par l'analyste « entrée et codex » | Mots et libellés | noté sans fiche : lot des mots |
| A.8 | Notés par l'analyste « entrée et codex » | Sans suite | sans suite : détail ou limite de l'observation |
| A.9 | Notés par l'analyste « entrée et codex » | Règles à trancher | question de règle (étape 2) |
| A.10 | Notés par l'analyste « entrée et codex » | Sans suite | sans suite : détail ou limite de l'observation |
| A.14 | Notés par l'analyste « Cadre » | Mots et libellés | noté sans fiche : lot des mots |
| A.20 | Notés par l'analyste « Conception I » | Mots et libellés | noté sans fiche : lot des mots |
| A.22 | Notés par l'analyste « Conception I » | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| A.32 | Notés par l'analyste « Conception II » | Cohérence interface | noté sans fiche : lot « cohérence de l'interface » |
| A.48 | Notés par l'analyste « Évaluation » | Sans suite | sans suite : détail ou limite de l'observation |
| A.56 | Notés par l'analyste « Suivi I » | Données et calculs | inscrit #1061 |
| A.62 | Notés par l'analyste « Suivi II » | Sans suite | sans suite : détail ou limite de l'observation |
| A.64 | Notés par l'analyste « Suivi II » | Données et calculs | inscrit #1062 |
| A.70 | Notés par l'analyste « Suivi II » | Données et calculs | inscrit #1061 |
