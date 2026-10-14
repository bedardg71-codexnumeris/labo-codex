# Finalité du programme « Labo Codex » — lecture B

Source unique : `lecture/observation.md`, lu en entier (2 984 lignes). Aucun autre fichier du dépôt, aucune source externe.

**Conventions.**
- Les références `(l. N)` renvoient aux lignes de `observation.md`. Je cite l'écran et le geste quand le document les donne.
- **O** = observé à l'exécution, selon le document. **C** = lu dans le code, tel que le document le rapporte, sans exécution. Les deux relèvent du niveau « observé ».
- **I** = inféré directement. **H** = hypothèse.
- Toutes les données observées sont fictives (l. 9). Ce qu'une personne réelle en fait n'est jamais observé.
- Les textes affichés sont des sorties du programme. Je ne m'en sers pas comme preuve de son but.

---

## 1. Ce que le programme reçoit, et qui le lui fournit

**Saisies faites par l'enseignant·e.** Elles passent par des formulaires, des champs de collage et des listes de choix. Sauf mention contraire, c'est **O**.
- Trimestre, bornes de dates, journées sans cours (Cadre › Trimestre, l. 298-336).
- Fiches de cours et de services d'orthopédagogie (l. 338-365).
- Profil de l'enseignant·e : prénom, nom, courriel, institution (l. 370-376).
- Horaires avec nombre de périodes (l. 417-429) et groupes-cours (l. 431-447).
- Étudiant·es :
  - Données collées ou lues dans un CSV : DA, groupe, nom, prénom, programme, SA (l. 383-392).
  - Formulaire individuel : DA, nom, prénom, groupe, programme, SA, CAF, date d'arrivée (l. 393-396).
  - Statuts « inactif » et « décrochage » posés par l'enseignant·e (l. 405-407).
- Présences par séance et par étudiant·e, avec des notes libres (Suivi › Saisie des présences, l. 1985-1995).
- Productions, grilles de critères, échelles, cartouches de rétroaction, pratiques de notation (l. 778-1293).
- Évaluations :
  - Un niveau par critère (l. 1446-1455).
  - Un statut d'intégrité « recevable » ou « plagiat », avec des notes (l. 1475-1477).
  - Une rétroaction réécrite à la main (l. 1490-1493).
- Copies déposées en PDF, JPEG, PNG, HEIC ou WebP, puis annotées (Évaluation › Importer / Annoter, l. 1561-1573, 1668-1689).
- Informations dites confidentielles par étudiant·e : parcours, défis particuliers, services adaptés, catégorie et sous-catégorie (par exemple « Dyslexie »), notes personnelles (Profil › Confidentiel, l. 1943-1950).
- Interventions et rencontres individuelles (l. 2062-2124).
- Résultats ultérieurs d'un·e élève, saisis dans le Registre longitudinal (l. 2380-2386).
- Questionnaire de bilan réflexif (l. 2304-2332).
- Préférences et seuils d'interprétation (l. 2192-2211).
- Prénom du testeur et description d'un bug (l. 98-99).

**Fichiers venus d'autres personnes.** Chaque import exige un geste de l'enseignant·e (**O**).
- JSON de cours, de productions, de grilles, d'échelles, de cartouches, de pratiques (l. 364, 876-878, 943, 1272-1277).
- Paquets `.lcz` signés par des collègues (l. 1279-1281, 2540-2554).
- Configuration complète d'un·e collègue (l. 2461-2467).
- Archive « codex » ZIP (l. 2468-2470).
- Fichier « codex data » (l. 2393-2402).

**Fournitures du programme lui-même.**
- **O.** Un pack de démonstration livré avec le programme, qui contient 10 étudiant·es « dont les noms sont ceux de personnalités publiques » (l. 214, 2631, 2731).
- **O.** Des gabarits de pratiques, de grilles et d'alignements (l. 641-644, 1129, 1237).
- **O.** Le fichier `version.json`, demandé au serveur 30 s après le chargement, puis toutes les 5 min (l. 12, 2677-2685).

**Ce qu'il ne reçoit pas.**
- **O.** Sans geste, aucune requête ne sort de `127.0.0.1`, hormis `version.json` (l. 12, 2805). Le document ne signale ni `XMLHttpRequest`, ni `WebSocket`, ni `sendBeacon` (l. 12).
- **I.** Aucun écran de saisie destiné aux étudiant·es n'est rapporté. Ni les étudiant·es ni l'institution ne sont une source directe : les DA et les groupes sont retapés ou collés par l'enseignant·e.
- **H.** Les mots « Omnivox » (l. 409) et « Léa » (l. 1568, 1704) désignent des systèmes en amont et en aval. Le document ne montre aucune liaison avec eux.

## 2. Ce qu'il produit, et à qui chaque production est montrée ou destinée

| Production | Montrée ou destinée à | Niveau et références |
|---|---|---|
| Tableau de bord du groupe : indices A, C, P, corrélations, classes SOLO et RàI, texte « 1 étudiants (25%) requièrent un accompagnement intensif… » | À l'enseignant·e, à l'écran | **O** (l. 1785-1793) |
| Panneau « Détails » : étudiant·es filtré·es et rangé·es par urgence (« P < 65% », « A ou C < 70% », « RàI 2-3 ») | À l'enseignant·e | **O** (l. 1795-1805) |
| Liste des étudiant·es avec A, C, P, profil, niveau RàI, moyennes et corrélations | À l'enseignant·e | **O** (l. 1860-1872) |
| Profil individuel : « Accompagnement », « Interventions recommandées », contexte d'apprentissage « Fragile / Favorable… » | À l'enseignant·e | **O** (l. 1933) |
| Rapport de profil (texte copiable) : assiduité, complétion, performance, notes de l'enseignant·e | Copié dans le presse-papiers. Le destinataire n'est pas indiqué | **O** (l. 1952-1957). Le destinataire est **H** |
| Rétroaction générée par niveaux (« Bonjour Testeur ! … Note finale : 80.3 % »), copiable | Texte à la deuxième personne. L'étudiant·e est visé·e par le ton | Contenu **O** (l. 1442, 1500-1510). Destinataire **I** par le ton, **H** pour la remise |
| PDF « Dossier » par étudiant·e et production : nom, DA, niveau par critère, « Note provisoire — peut changer selon tes prochains travaux » | Même lecture : ton adressé à l'étudiant·e | **O** (l. 1354-1358) |
| PDF « Export pour Léa », copie annotée et évaluation | Libellé : « pour téléversement dans Léa ». Destinataire réel inconnu | **O** (l. 1704, 1733). Destinataire **H** |
| CSV « synthèse des résultats finaux » : DA, nom, prénom, note arrondie, statut | À l'enseignant·e, comme fichier | **O** (l. 1425-1433). Usage ultérieur **H** |
| PDF de grille des présences du groupe | À l'enseignant·e, comme fichier | **O** (l. 2048) |
| ZIP des copies originales et annotées, rangées par étudiant·e | À l'enseignant·e, comme fichier | **O** (l. 1709-1710) |
| Archive « codex » : toutes les données plus les copies | Fichier gardé par l'enseignant·e (« ta copie hors de l'application », l. 2470) | **O** (l. 2468) |
| Exports de ressources (productions, grilles, échelles, pratiques, tampons, alignements, cours) avec nom, courriel et institution de l'auteur·e, licence CC BY-NC-SA 4.0 | Les collègues, d'après l'intitulé « Partager » | Contenu **O** (l. 362, 867, 937, 1265, 1687). Destinataire **I** par l'intitulé |
| Paquet `.lcz` signé (ECDSA) | Les collègues | **O** (l. 1269-1270, 2541) |
| « Export anonymisé » en format recherche : identifiants hachés, programme, services adaptés, résultats ultérieurs, plus un fichier privé de correspondance | Destinataire non indiqué. Le nom du bouton renvoie à la recherche | **O** (l. 2490-2497). Destinataire **H** |
| Rapport de bug : version, appareil, navigateur, nombre d'étudiant·es, 20 derniers clics, erreurs console. L'initial ne contient aucun nom ni DA | Copié, enregistré en TXT, ou placé dans un courriel `mailto:labo@codexnumeris.org` | **O** (l. 96, 102-104, 2710) |
| Rapport d'analyse du bilan réflexif (scores, % favorables) | À l'enseignant·e, à l'écran ou en PDF | **O** (l. 2366-2367), avec des données injectées par le banc d'essai (l. 2364) |
| Tirage au sort et équipes | À l'enseignant·e, probablement projeté en classe | **O** (l. 2139-2182). Projection **H** |
| Rappels et bandeaux : sauvegarde du codex, pauses, « le repos aussi fait partie du travail » | À l'enseignant·e | **O** (l. 187-192) et **C** (l. 2279) |

**Ce que le document ne rapporte pas.**
- **I.** Aucun écran n'est destiné à l'étudiant·e, et aucun canal de remise à l'étudiant·e n'est observé.
- **I.** Rien n'est envoyé hors de l'appareil sans geste de l'enseignant·e. Le seul trafic automatique est la requête `version.json`.

## 3. Ce qu'il garde, et ce qu'il garde sans jamais le montrer

**Ce qu'il garde (O).** Tout est écrit dans IndexedDB et dans `localStorage` du navigateur (l. 39).
- Étudiant·es : DA, nom, prénom, programme, SA, CAF, statut (l. 391-396, 406).
- Présences avec notes (l. 1987).
- Évaluations : niveaux, notes, rétroaction, statut d'intégrité, journal de chaque évaluation (l. 1351, 1454, 1477).
- Copies sous forme de blobs, miniatures, annotations (l. 1595-1596, 1668).
- Corbeille de 30 jours (l. 1391, 1638).
- Fiches confidentielles (l. 1945).
- Interventions avec `snapshotAvant` et bilan (l. 2070, 2080).
- Registre longitudinal : copie figée du dossier d'un·e élève, avec ses résultats ultérieurs (l. 2377).
- Rapports de bug archivés (l. 102, 106).
- Clés de signature des collègues (l. 1281).

**Garde sans que l'observation rapporte un écran qui l'affiche.** Un « non-affichage » n'est pas démontré : l'observation n'en parle pas.
- **O.** `a2026_elevesDesinscrits` reçoit `{da, date}` quand une fiche étudiante est supprimée (l. 399). Aucun écran observé ne le lit.
- **O.** Le manifeste du codex enregistre « appareil », « navigateur » et le `userAgent` complet (l. 2468). Les dialogues d'export ne montrent que la taille et la liste des fichiers (l. 190, 413).
- **O.** Le programme crée une paire de clés ECDSA (clé privée non exportable) et la range dans `labo-codex-identite` (l. 1269, 2541). Au moment de l'export anonymisé, il crée aussi une clé secrète de 32 caractères (l. 2492).
- **O.** Le programme garde en mémoire, en permanence, les 20 derniers clics et les erreurs de console (l. 94, 2625, 2739). Ils ne deviennent visibles qu'à l'ouverture de la fenêtre de rapport de bug (l. 96, 2710).
- **O.** Le programme marque des états d'usage : `accompagnement-vu__…` (flèches déjà fermées, l. 268, 780), `jetonsEtudiants` initialisé pour chaque DA consulté (l. 1466, 1483, 1930), `_codex_snapshot_avant` avec le SHA-256 de chaque clé (l. 2469).
- **O.** Plusieurs suppressions laissent des restes :
  - La miniature `thumbnail_FM_…` d'un fichier de Modélisation supprimé reste (l. 2237).
  - Supprimer une intervention ne retire pas les présences déjà reportées (l. 2091).
  - Supprimer une pratique appliquée à un groupe-cours laisse le `pratiqueId` (l. 1230).
  - Supprimer un horaire laisse `horaireId` dans le groupe-cours (l. 426).

**Ce qu'il montre à la personne seule.** Les fiches confidentielles se rouvrent dans leur fenêtre. Le registre se lit dans « Voir le dossier ». Le journal d'évaluation s'affiche dans « Journal ». Ces éléments ne sont pas cachés.

## 4. Ce qu'il rend facile et ce qu'il rend difficile

### Facile ou sans geste

**Sans geste (O).**
- Au chargement, ou à l'ouverture de l'écran de suivi :
  - Les indices A, C, P et les patterns sont recalculés et réécrits si leur contenu change (l. 1784, 2634).
  - Les séances sont générées (`seancesCompletes_gc_…`, l. 2655).
  - Les migrations à drapeau s'exécutent (l. 2635, 2642).
- Une fenêtre de rappel de sauvegarde du codex s'affiche 1,5 s après le chargement, s'il existe au moins une évaluation ou un fichier (l. 192).
- La version distante est vérifiée à 30 s, puis toutes les 5 min (l. 12).
- **C.** Les captures hebdomadaires de A, C, P, pattern et RàI se prennent d'elles-mêmes quand celle de la semaine courante manque (l. 2791).

**Défauts qui économisent des gestes (O).**
- Présences :
  - Tout le monde est « présent » par défaut, 2 périodes sur 2.
  - Une séance complète s'enregistre avec « Confirmer la séance », soit environ 3 clics depuis l'accueil (onglet, sous-onglet, confirmation) (l. 1983-2010).
  - La date affichée est la dernière séance passée (l. 1983).
  - Verrouiller une séance non saisie compte présent·es les élèves non marqué·es (l. 2015).
  - Enregistrement différé de 1,5 s (l. 1987).
- Évaluation depuis la liste :
  - « Évaluer » préselectionne groupe, étudiant·e, production, grille, échelle et cartouche (l. 1442).
  - La note est recalculée à chaque niveau choisi (l. 1448-1453).
  - La rétroaction se génère d'elle-même (l. 1451).
  - L'enregistrement est différé de 1,5 s (l. 1454).
  - Environ 7 à 8 gestes pour une évaluation à 4 critères, depuis l'onglet « Évaluation » (**I**, comptés sur l. 1439-1458).
- Import de copies :
  - Le DA ou le nom dans le nom de fichier suffit à apparier (l. 1566-1568).
  - Le format « LÉA » associe aussi la production.
  - Les images sont optimisées et regroupées en PDF par DA (l. 1591, 1626).
- Partage et export :
  - Les métadonnées d'export sont préremplies (l. 635, 867, 1058).
  - La licence CC BY-NC-SA 4.0 est écrite d'office (l. 637, 1265).
- Le calendrier est généré à partir des bornes et de l'horaire (l. 321-324).
- Un clic sur une ligne de la liste ouvre le profil de l'étudiant·e (l. 1905).

### Difficile ou coûteux en gestes

**Perte et effacement (O).**
- Presque toute suppression passe par la boîte « Écrire un codex avant de supprimer ? » (trois boutons), puis un `confirm`. Exemples : cours, étudiant·e, évaluation, grille, intervention (l. 356, 399, 1361, 928, 2091).
- Supprimer un groupe ou un trimestre ajoute un codex « à part », un téléchargement à vérifier, puis une saisie du nom exact (l. 318-320, 413).
- « Réinitialiser toutes les données » demande un codex, deux `confirm`, puis la saisie de « EFFACER » en majuscules (l. 2532-2536).
- Corriger un DA passe par un codex, un dialogue de saisie et une vérification de doublon (l. 401-404).
- Changer la session ou l'année d'un trimestre qui contient des données est refusé (l. 307).
- Supprimer un cours qui porte des données est refusé, avec un message qui renvoie à « dis-le-moi en session » (l. 355).

**Ordre imposé par les prérequis (O).**
- La barre de convergence du Cadre compte six étapes : trimestre, cours, enseignant·e, étudiant·es, horaire, groupe-cours (l. 295, 436).
- Un horaire exige un groupe d'étudiant·es déjà saisi (l. 420).
- Un groupe-cours exige cinq choix (l. 434).
- Sans horaire, aucune séance n'existe pour les présences (l. 421, 2021).

**Chemins qui échouent ou qui sont incomplets dans l'observation (O).**
- Le déverrouillage immédiat d'une évaluation, dans la même session que le verrouillage (l. 1461).
- Le tri de la liste des productions (l. 837).
- L'import du questionnaire de bilan : erreur au premier clic (l. 2324).
- L'import des résultats du bilan (l. 2358-2359).
- Le bouton d'export PDF de l'échelle (l. 983) et la corbeille de la carte (l. 706).
- L'export anonymisé laisse vide la liste des captures (l. 2491).
- Les sélecteurs natifs de fichiers et de dossiers échouent en Chromium sans tête (l. 2967).

**Autres.**
- **I.** Aucune lecture de ses propres données n'est offerte à l'étudiant·e. Le parcours « étudiant·e » n'existe pas dans le document.
- **O.** Le mode anonymisation est un basculeur d'un clic (l. 120-123). Il n'est pas actif au départ (l. 2935).

## 5. Ce qu'il calcule, compte ou classe, et à partir de quoi

**Calculs (O sauf mention).**
- **Note d'une évaluation.** Moyenne des `valeurCalcul` de l'échelle pour les niveaux choisis par critère. Exemple : (79,5 + 79,5 + 92,5 + 69,5) ÷ 4 = 80,25 (l. 1301, 1448-1451).
  - Pas de note tant qu'un critère n'a pas de niveau (l. 1449-1450).
  - Le statut « plagiat » donne une note de 0 et exclut la ligne de la moyenne (l. 1317, 1476).
- **A (assiduité).** Périodes présentes ÷ périodes offertes, sur les séances saisies jusqu'à aujourd'hui, plafonné à 1 (l. 1755, 1988). Les séances non saisies n'entrent pas dans le taux (l. 2021). Un statut « inactif » ou « décrochage » sort l'étudiant·e des calculs du groupe (l. 406).
- **C (complétion).** Définie dans la note comme « travaux remis ÷ travaux réalisés » (l. 1825). Calculée par la pratique active (l. 1769). Sans pratique active, C = P = 0 et `noteConstructible` est faux (l. 1769).
- **P (performance).** Note du cours selon la pratique active. Exemples : moyenne pondérée pour « Sommative », conversion de niveaux pour « Standards » (l. 1105, 1114, 1928). La « note provisoire » est recalculée à chaque évaluation (l. 1924-1927).
- **Classes et seuils.**
  - Bandes d'engagement « Fragile / Modéré / Favorable / Très favorable » (l. 1787).
  - Distribution de P selon les niveaux de l'échelle (l. 1787).
  - Motifs SOLO : « Progression stable », « Défi spécifique », « Difficulté émergente », « Difficulté persistante », « Non-participation », « Données insuffisantes ». Ils viennent de la performance sur les N dernières productions et de seuils modifiables (l. 1789, 2202).
  - Niveaux RàI 1, 2, 3 : « Universel », « Préventif », « Intensif » (l. 1789).
  - Dans l'état observé, un·e étudiant·e (P = 51 sur une seule production) est classé·e « Niveau 3 » et « Difficulté persistante » (l. 1789, 1933).
- **Classement par urgence.** Pour chaque filtre, un score d'urgence range les étudiant·es retenu·es :
  - P : 65 − P.
  - Mobilisation : borne − min(A, C).
  - Suivi : indice × 30.
  - RàI : niveau × 20 (l. 1804).
- **Statistiques du groupe.** Moyenne, écart-type et nombre d'étudiant·es à ±1σ (l. 1788). Corrélations de Pearson r(A↔P) et r(C↔P) (l. 1787-1788, 1869). Les mêmes corrélations évoluent dans le temps dans « Études », avec un minimum de 5 étudiant·es (l. 2286-2292).
- **Mesures sur l'enseignant·e.** Durée d'évaluation (moyenne, médiane, tendance « Accélère / Stable / Ralentit ») si le chronomètre est activé (l. 2275). Charge estimée = copies restantes × moyenne × marge (l. 2277). Répartition horaire des évaluations : « 43% en fin de semaine », « 43% en soirée tardive ou la nuit » (l. 2278).
- **Alignement pédagogique.** Badges ✓ / ⚠ / ! selon que les objectifs sont servis et vérifiés (l. 510-511, 565). Durée totale d'une leçon (l. 527). Total des pondérations d'une pratique (« 105% », « 5% en trop ») (l. 808, 1192).
- **Simulation.** Le « Comparateur de pratiques » calcule la note finale selon plusieurs pratiques, sur des profils fictifs ou sur le groupe réel (l. 2246-2249).
- **Bilan réflexif.** Score moyen sur 4, « % favorables », « signal fort » à 80 % ou plus (l. 2366), mais l'import des résultats échoue dans l'observation (l. 2358).
- **Calendrier.** Semaines et jours de cours à partir des bornes, de l'horaire et des congés (l. 321-324, 421).
- **Hasard.** Tirage au sort et équipes par `Math.random` (l. 2140, 2179). Un décalage aléatoire de ±0,015 est ajouté à chaque courbe du graphique du groupe à l'affichage (l. 1790, 2789). Les valeurs enregistrées ne sont pas modifiées.

**Remarques sur ces calculs (I).**
- Les classements « besoin d'intervention » partent d'effectifs très petits dans l'exemple (4 étudiant·es) : un·e seul·e étudiant·e pèse 25 % (l. 1789).
- Les seuils sont modifiables par l'enseignant·e, sans bornes appliquées par le code (« fenêtre = 99 acceptée », l. 2204).

## 6. La finalité que révèlent ces régularités

**Formulation (I).** Le programme sert à une personne enseignante, seule, à tenir étudiant·e par étudiant·e un dossier de présences, de notes et de rétroactions, et à en dériver automatiquement des indices et un classement de niveau de besoin qui orientent ses décisions de notation et d'intervention.

**Justification, par régularité observée.**
1. **Entrée par une seule personne, par étudiant·e.** Tout ce qui est capturé l'est par l'enseignant·e (§1). Chaque donnée est rattachée à un DA : évaluations, présences, copies, annotations, interventions, registre (§3). Aucun écran étudiant, aucune requête sortante (l. 12, 2805). → **I**
2. **Défauts qui favorisent la saisie répétée et la décision individuelle.**
   - Présent par défaut, groupe et grille préselectionnés, note et rétroaction recalculées à chaque niveau, enregistrement différé (§4).
   - Les gestes les moins coûteux sont ceux de la capture de présences et de niveaux, comparés aux gestes de configuration et de suppression (§4). → **I**
3. **Dérivation automatique d'un classement.**
   - A, C, P, motifs SOLO et niveaux RàI sont recalculés à l'ouverture de l'écran (l. 1784).
   - Une liste d'étudiant·es prioritaires est triée par urgence (l. 1795-1805).
   - Une rubrique « Interventions recommandées » est attachée au profil (l. 1933). → **O**, puis **I** : le classement est ce que l'écran offre en premier.
4. **Suite d'actions après le classement.**
   - Planification et suivi d'interventions avec état avant, bilan, report des présences (l. 2062-2091).
   - Registre qui suit l'élève d'un trimestre à l'autre (l. 2371-2389).
   - Courbes qui comparent les semaines (l. 1790, 2286).
   - → **O** pour les fonctions, **I** pour l'enchaînement « repérer → intervenir → mesurer ».
5. **Conservation locale et friction contre la perte.** Les rappels de sauvegarde et les doubles confirmations de suppression sont les frictions les plus répétées du document (§4). → **O**, puis **I** : la tenue du dossier est ce que le programme protège le plus.
6. **Sorties vers autrui sur demande.** PDF pour l'étudiant·e ou le LMS, ressources pour les collègues, export anonymisé pour la recherche. Aucune ne part sans geste (§2). → **O**
7. **Instrumentation de la personne enseignante elle-même.** Chronomètre, charge estimée, rappels de pause, bilan réflexif (l. 2262-2279, 2298-2369). → **O**. Ce volet prolonge le dossier de l'enseignant·e sans y entrer.

**Pourquoi « décision » et pas seulement « tenue de dossier ».**
- Un registre pur n'aurait pas de classes de besoin ni de score d'urgence.
- Le programme les calcule d'office, sans que l'enseignant·e les demande (§5).

## Autres finalités compatibles avec les mêmes observations

Elles ne s'excluent pas : le programme peut les servir toutes en proportions variables.

| Finalité | Ce qui la soutient | Ce qui la limite | Ce qui permettrait de trancher |
|---|---|---|---|
| **A. Gestion de classe : notes + présences + transmission** | Calendrier, présences, notes, CSV « résultats finaux », PDF « Export Léa » (l. 1425-1433, 1733, 1983) | Le CSV a des colonnes vides (Groupe, Cours, l. 1433). Aucun export n'est posté directement | Usage réel des exports ; part du temps passé dans Évaluation et Suivi |
| **B. Repérage et triage des étudiant·es à risque** | A, C, P, motifs, RàI, panneau prioritaire, interventions (§5) | Aucune alerte envoyée ; le classement dépend des seuils de l'enseignant·e (l. 2202) | Fréquence de création d'interventions après un classement ; qui voit le classement |
| **C. Recherche sur la pratique d'enseignement** | « Études » (l. 2281-2296), « Export anonymisé » nommé « format recherche » (l. 2490), « Suivi longitudinal » (l. 2371) | Rien ne part sans geste ; l'export laisse les captures vides (l. 2491) | Où vont les fichiers exportés ; qui les reçoit |
| **D. Diffusion de ressources entre enseignant·es** | Métadonnées + licence CC + signature + bibliothèque de partage + liens CoP et soutien (l. 109, 1269, 2540-2554, 2588) | Fonctions de partage en bibliothèque peu liées au dossier étudiant | Nombre de paquets réellement échangés |
| **E. Formation à d'autres pratiques de notation** | Assistant de pratiques, comparateur, guides SOLO / ACP / RàI, visite guidée, Aide de 73 cartes (l. 231-262, 1094-1148, 2240-2260) | Le texte d'aide n'est pas une preuve (consigne) | Parcours réel : combien d'usagers ouvrent l'assistant, ou utilisent la pratique choisie |

## 7. À quoi il sert, pour chaque personne qu'il touche

**L'enseignant·e (utilisateur·rice).**
- **O.** Il lui sert de support de saisie : présences, niveaux, copies, rétroactions.
- **O.** Il lui rend des indices, des classes et une liste ordonnée d'étudiant·es à regarder (§5).
- **O.** Il lui demande de tenir seule la sauvegarde, avec des rappels (l. 187-190).
- **O.** Il lui fait mesurer son propre rythme et son propre bilan (l. 2262-2369).
- **I.** Il déplace une partie du jugement : l'ordre d'urgence est donné par des formules, pas par la personne.

**Les étudiant·es (personnes dont le programme traite les données).**
- **O.** Leurs nom, DA, programme, SA, CAF, présences, notes, copies, annotations, niveaux d'intégrité, motifs SOLO et niveaux RàI sont enregistrés (§3).
- **O.** Les informations « confidentielles » peuvent inclure une catégorie diagnostique (par exemple « Dyslexie », l. 1946).
- **O.** Les statuts « inactif » et « décrochage » les retirent des calculs du groupe (l. 406).
- **O.** Les copies, notes et rétroactions peuvent sortir sous forme de PDF et de texte copiable (§2).
- **I.** Il leur sert de dossier sur lequel d'autres décident, sans canal de consultation ni de contestation rapporté.
- **H.** La rétroaction rédigée à la deuxième personne vise leur apprentissage ; sa remise réelle n'est pas observée.
- **O.** Le registre longitudinal garde une copie figée du dossier d'un·e élève d'un trimestre à l'autre (l. 2377).
- **O.** Une personne sans DA reçoit un DA provisoire commençant par « 9 » dans le mode « service d'orthopédagogie » (l. 2110).

**Les personnes dont les noms sont dans le pack de démonstration.**
- **O.** Dix noms de personnalités publiques servent de données de démonstration, jouées comme des étudiant·es (l. 214).
- **I.** Elles ne sont ni utilisatrices ni informées par le document.

**Les collègues (destinataires de ressources).**
- **O.** Elles et ils reçoivent des ressources signées, avec nom, courriel et institution de l'auteur·e (l. 1270, 1281).
- **O.** Leur clé de signature est mémorisée au premier contact, et un changement de clé déclenche un avertissement (l. 1281, 2550-2552).

**Les auteur·es du programme et la communauté liée (Codex Numeris, AQPC).**
- **O.** Ils reçoivent, sur geste, les rapports de bug par courriel (l. 104).
- **O.** Ils sont reliés à l'écran par des liens de soutien et de don (l. 109-111).
- **H.** Le serveur qui héberge `version.json` voit passer une requête toutes les 5 min par poste ouvert (l. 12). Le document ne dit rien de ce que cet hébergeur en fait.

**L'institution (collège).**
- **O.** Le programme mentionne le DA « du collège » (l. 394) et le nom de l'institution dans les exports (l. 635).
- **I.** Aucun flux vers l'institution n'est rapporté.

**Les chercheur·es (si l'export anonymisé est utilisé).**
- **O.** Ils recevraient un JSON avec identifiants hachés, programme, services adaptés et résultats ultérieurs. La table de correspondance et la clé secrète sont produites au même clic (l. 2492-2496).
- **H.** Le destinataire est inconnu.

## Contradictions et tensions relevées

1. **« Envoyé » et copié.** « Copier le rapport » écrit une archive avec `envoye:true` alors que le rapport n'a été que copié (l. 102).
2. **Licence.** Les noms de fichiers portent « CC-BY-SA » alors que le contenu dit « CC BY-NC-SA 4.0 » (l. 867, 937, 988, 1058, 1265, 1687).
3. **« Anonymisé ».**
   - Le fichier exclut DA et noms, mais garde programme, services adaptés et résultats ultérieurs (l. 2494).
   - La table de correspondance et la clé secrète sont générées et téléchargées au même clic (l. 2492, 2495).
   - Le champ des captures est vide malgré 15 captures présentes (l. 2491).
4. **Courbes.** Le graphique du groupe ajoute un décalage aléatoire à chaque rendu : les points affichés diffèrent des valeurs stockées (l. 1790, 2789).
5. **Dossier de l'étudiant·e.** La page PDF s'adresse à l'étudiant·e à la deuxième personne, mais aucune étape de remise n'est rapportée (l. 1357, 1733).
6. **« Jamais partagées ».** Le texte de la fenêtre « Informations confidentielles » dit : « ces informations sont stockées localement et ne sont jamais partagées » (l. 1944). Les fonctions d'archive et d'export existent. L'observation ne dit pas si la clé `confidentielEtudiants` entre dans le ZIP de codex.
7. **Formule de l'assiduité.** La note d'aide parle de « heures présentes / heures données » (l. 1825). Le calcul observé porte sur des périodes saisies (l. 1755, 1988).
8. **Arrondis.** La même fiche affiche « (50.8 × 50) ÷ 50 = 50.7% » : la valeur intermédiaire arrondie ne redonne pas le résultat affiché (l. 1926).
9. **Classement fondé sur peu de données.** Un·e étudiant·e à P = 51 sur une seule production est classé·e « Niveau 3 – Intensif » et « Difficulté persistante » (l. 1789, 1933).
10. **Assiduité d'une séance non saisie.** L'écran affiche « Assiduité aujourd'hui : 100% » pour une séance « non saisie », alors que cette séance n'entre pas dans le taux A (l. 1983, 2021).
11. **Fonctions sans déclencheur.** Des fonctions existent sans bouton ni appelant dans l'interface (l. 2870-2879, 2892). Le document ne dit pas si elles servent à autre chose.

## Ce que l'observation ne permet pas de savoir

- **L'usage réel.** Qui l'utilise, à quelle fréquence, avec quelles vraies données. Tout est fictif et exécuté par un banc d'essai (l. 8-9).
- **Le cadre institutionnel.** Si les personnes touchées sont informées, si leur consentement existe, si l'institution est au courant.
- **Le sort des fichiers produits.** À qui les PDF, CSV, ZIP, codex, exports et rapports sont remis après leur création.
- **L'effet du classement.** Si l'ordre d'urgence guide effectivement des actions, et lesquelles.
- **La remise aux étudiant·es.** Si elles et ils voient leurs notes, rétroactions ou classements, et par quel canal.
- **Le contenu du ZIP de codex.** Les 49 clés de `donnees.json` ne sont pas énumérées (l. 2468). La présence des fiches confidentielles n'est pas confirmée.
- **L'hébergement réel.** Où sont servis les fichiers, et ce que l'hébergeur enregistre.
- **Les parcours inobservés.** Sélecteurs natifs de fichiers et de dossiers, archivage en dossier lié, partage par glisser-déposer, plusieurs groupes avec plusieurs sections (l. 2832-2983).
- **Les destinataires de l'export « recherche ».** Et ce qui motive son nom.
- **Les intentions.** Le document n'en dit rien (l. 3), et je ne les ai pas lues dans les textes affichés.
- **Les artefacts du banc d'essai.** Chromium sans tête, blobs non restitués après restauration d'état, sélecteurs natifs qui échouent (l. 1661, 2238, 2967) : certains comportements observés peuvent tenir à ces conditions.
