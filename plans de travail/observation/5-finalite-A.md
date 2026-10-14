# « Labo Codex » : ce que le programme fait, et sa finalité

Ce texte part uniquement de `lecture/observation.md`.

## Conventions

- **Références.** Chaque renvoi « l. N » désigne une ligne de `observation.md`. Il est suivi de l'écran et du geste concernés (« Écran › geste »).
- **Trois niveaux de lecture.**
  - **[O] Observé** : le fichier le rapporte. Cela vaut pour « observé à l'exécution » comme pour « lu dans le code ». Je précise « (code) » quand la source n'est que le code.
  - **[I] Inféré directement** : la conclusion découle sans détour de plusieurs faits observés.
  - **[H] Hypothèse** : une lecture plausible, que les observations ne suffisent pas à établir.
- **Textes à l'écran.** Les phrases citées entre guillemets sont des sorties du programme. Elles disent ce que le programme affiche, pas ce qu'il fait. Je ne les prends comme fait que lorsque le comportement observé les recoupe.

---

## 1. Ce que le programme reçoit, et qui le lui fournit

### 1.1 De l'enseignant·e : toutes les données passent par ses gestes

**Le cadre du cours**
- [O] Le trimestre : dates, congés, reprises, semaines spéciales (l. 300-335, Cadre › Trimestre › « Créer le trimestre », champs de dates, « + Ajouter » une journée sans cours).
- [O] Le cours : code, discipline, compétence et pondération « Format du devis ministériel : 2-2-3 » (l. 341-342, Cadre › Cours › « Créer le cours »).
- [O] Le profil de l'enseignant·e. Prénom, nom, courriel et institution sont obligatoires (l. 372-373, Cadre › Enseignant·e › « Créer le profil »).
- [O] L'horaire. Le nombre de périodes est exigé parce que « C'est lui qui compte au dénominateur de l'assiduité » (l. 420, Cadre › Horaire › « Créer l'horaire »).

**La liste des étudiant·es**
- [O] Elle arrive collée ou en CSV, avec les colonnes DA, groupe, nom, prénom, programme et SA (l. 385-391, Cadre › Groupe d'étudiant·es › « Prévisualiser » / « Confirmer »).
- [O] Elle peut aussi être saisie fiche par fiche, avec en plus « CAF » et une date d'arrivée (l. 393-395, formulaire « Ajouter un·e étudiant·e »).
- [O] Le DA « est celui du collège : sept chiffres » (l. 387, l. 394). Le numéro de groupe s'écrit « comme dans Omnivox » (l. 409, « + Nouveau groupe »).

**Le matériel d'évaluation**
- [O] Les productions demandées, avec pondération, grille, échelle, échéance et la case « Consignes transmises » (l. 781-804, Conception › Productions › « Créer la production »).
- [O] Les grilles de critères (l. 888-896), les échelles de niveaux (l. 953-960) et les cartouches, c'est-à-dire des commentaires rédigés d'avance pour chaque couple critère × niveau (l. 1006-1013).
- [O] Les pratiques de notation (SOM, STD, SPE, DEN) (l. 1103-1126, Conception › Pratiques › assistant « Créer la pratique »).
- [O] La carte d'alignement : nœuds, liens, objectifs, semaines, durées (l. 471-570, Conception › Carte d'alignement).

**Les présences**
- [O] Les périodes de présence sont saisies par séance et par étudiant·e, avec des notes libres (l. 1985-1992, Suivi › Saisie des présences › champ périodes, champ notes).

**Les copies des étudiant·es**
- [O] Ce sont des fichiers PDF, JPEG, PNG ou HEIC déposés par l'enseignant·e (l. 1561-1571, Évaluation › Préparer et importer › zone de dépôt).
- [O] Le programme rattache chaque fichier à un·e étudiant·e d'après le DA, le nom et le prénom, ou le format « LÉA » `…_Remis_le_AAAA-MM-JJ…` (l. 1566-1568).

**L'évaluation**
- [O] Un niveau par critère (l. 1446-1454, Évaluation › Évaluer › listes de niveau).
- [O] Le statut d'intégrité « plagiat » et des notes d'intégrité (l. 1475-1477).
- [O] Des jetons de délai et de reprise (l. 1531-1538).
- [O] Des annotations sur la copie : traits, tampons « Unistructurel … Étendu », « Soupçon IA », codes d'erreurs de français (l. 1668-1684, Annoter › palettes).

**Le dossier de chaque étudiant·e**
- [O] Informations confidentielles : parcours (« Échec », « Abandon »…), « Défis particuliers », catégories et sous-catégories comme « apprentissage → Dyslexie », « santé mentale », notes (l. 1944-1946, Suivi › Profil › « Confidentiel »).
- [O] Notes pour le rapport (l. 1955, Profil › Rapport › « Mes notes »).
- [O] Interventions et rencontres : participant·es, notes individuelles, bilan (l. 2069-2086, Suivi › Interventions ; l. 2121, Rencontres).
- [O] Résultats obtenus plus tard dans d'autres cours et trimestres (l. 2380-2383, Labo › Suivi longitudinal › « Ajouter »).

**Les réponses des étudiant·es à un questionnaire**
- [O] Elles arrivent sous forme de fichier CSV importé par l'enseignant·e (l. 2355-2356, Labo › Bilan réflexif › « Importer les résultats »).

**Des fichiers de collègues ou de sauvegarde**
- [O] Exports JSON, paquets `.lcz` signés, codex `.zip`, « codex data » (l. 1272-1281 Pratiques › bibliothèque › import ; l. 2455-2470 Réglages › « Ouvrir un Codex… » ; l. 2540-2552 Réglages › partage ; l. 2393-2395 menu Codex › « Charger un codex data… »).

**Sur l'enseignant·e elle-même ou lui-même**
- [O] La durée de chaque évaluation, si la préférence chronomètre est activée. Elle est désactivée par défaut (`chronoEvaluation:false`, l. 2194, l. 2421).
- [O] Ses préférences d'horaire de travail (l. 2268-2269, Labo › Rythme de travail).

### 1.2 De l'orthopédagogue (second rôle d'utilisateur)
- [O] Un « service d'orthopédagogie » se crée avec une liste d'élèves. Un DA provisoire est attribué quand il manque (l. 2105-2115, Suivi › Rencontres › « Créer mon service d'orthopédagogie »).

### 1.3 Du programme lui-même
- [O] Un jeu de démonstration : « 10 étudiant·es », 11 productions, 101 évaluations, 313 présences, écrits au premier chargement (l. 149 ; l. 2629, chargement).
- [O] Des gabarits de grilles, d'échelles et de pratiques (l. 934, l. 1129).
- [O] Une carte d'alignement de démonstration signée « Grégoire Bédard · CC BY-NC-SA 4.0 » (l. 631, Carte › « Consulter la bibliothèque »).
- [O] Les textes des guides et de l'aide (l. 147, l. 2212-2215).

### 1.4 De l'environnement
- [O] L'horloge du système, qui fixe la date de séance et la notion de « Date future » (l. 1983, l. 2021).
- [O] `version.json`, lu sur le même serveur 30 s après le chargement puis toutes les 5 min (l. 12, l. 2677-2685, sans geste).

### 1.5 Ce que les étudiant·es fournissent directement
- [I] **Rien.** Aucun écran observé n'est destiné à un·e étudiant·e. Toutes leurs données entrent par un geste de l'enseignant·e ou de l'orthopédagogue : coller une liste, déposer des copies, choisir un niveau, importer un CSV (sections 1.1 et 1.2).

---

## 2. Ce que le programme produit, et à qui chaque production est montrée ou destinée

Un point commun à toutes les productions :

- [O] Aucune ne quitte le navigateur sans geste. Le seul échange automatique est `GET version.json` vers le même serveur. Il n'y a ni `XMLHttpRequest`, ni `WebSocket`, ni `sendBeacon` (l. 12, Conditions ; l. 2595 la CSP `default-src 'self'` ; l. 2805).
- [O] Tout ce qui sort passe par un téléchargement, le presse-papiers ou un lien `mailto:` déclenché par l'enseignant·e.

| Production | Destinataire | Niveau | Source (écran › geste) |
|---|---|---|---|
| Tableaux de bord : A, C, P, μ, σ, r, bandes « Fragile … Très favorable », RàI 1-2-3, « Difficulté persistante » | Enseignant·e (écran) | O | l. 1786-1789, Suivi du groupe › affichage |
| Liste des étudiant·es avec A, C, P, Profils, RàI, Interv. et corrélations | Enseignant·e | O | l. 1863-1870, Suivi › Liste |
| Profil individuel : absences datées, « Niveau 3 - Intensif », « Interventions recommandées » | Enseignant·e | O | l. 1929-1933, Suivi › Profil |
| Rétroaction texte (« Bonjour Testeur ! »), à copier | L'étudiant·e, à qui le texte s'adresse au « tu » | O (texte), I (destinataire) | l. 1442, l. 1451, l. 1500-1509, Évaluer › « Copier » |
| PDF de copie annotée et synthèse, « pour téléversement dans Léa » | L'étudiant·e, via la plateforme Léa | O (texte « pour téléversement dans Léa »), I | l. 1704, l. 1733, Exporter et archiver › « Exporter pour Léa » |
| « Dossier PDF » : rétroaction par critère, progression, « Note provisoire — peut changer selon tes prochains travaux. » | L'étudiant·e (tutoiement) | O, I | l. 1357, Liste des évaluations › « Dossier PDF » |
| PDF consignes + grille + échelle (« Date de remise ») | L'étudiant·e, avant la tâche | O, I | l. 854-855, Productions › « Préparer le PDF » |
| CSV « Synthèse des résultats finaux » : DA, nom, note arrondie, statut | Hors du programme ; destinataire non dit | O (fichier), H (établissement) | l. 1425-1433, l. 1850, Suivi du groupe › « Exporter la synthèse (CSV) » |
| PDF « Grille des présences » avec DA, programme, SA | Non dit | O, H (dossier administratif) | l. 2046-2048, Saisie › « Rapport » › « Générer le PDF » |
| Rapport de profil texte (A, C, P + « Notes de l'enseignant ») | Non dit | O, H | l. 1953-1956, Profil › Rapport › « Copier » |
| Plan de cours / déroulement / calendrier (txt, tsv, md) | Non dit | O, H (étudiant·es ou institution) | l. 588-604, Carte › « Exporter le plan… » |
| Fichiers « à coller dans l'IA de ton choix » : carte, cartouche, prompt de questionnaire | Une IA externe, par copier-coller de l'enseignant·e | O | l. 610-611 Carte › « Télécharger un modèle… » ; l. 1003 Rétroactions › « Télécharger un modèle » ; l. 2327 Bilan › « Copier le prompt pour IA » |
| Questionnaire « Bilan réflexif » en texte (« Le système d'évaluation me permet de me situer… ») | Les étudiant·es, via un outil externe | O (texte), I | l. 2301, l. 2322, Bilan réflexif › « Copier les questions » |
| Rapport d'analyse du bilan (score /4, % favorables), PDF | Enseignant·e | O | l. 2366-2367 |
| Exports JSON / `.lcz` de grilles, échelles, cartouches, productions, pratiques, tampons, cartes, sous licence CC BY-NC-SA 4.0, avec nom, courriel et institution | Des collègues | O | l. 867, 937, 1058, 1259-1270, 1687, 637 ; l. 2447-2450 Réglages › « Exporter ma config » |
| « Export anonymisé » `monitorage_<trim>_anonyme` (programme, services adaptés, résultats ultérieurs, id haché) et « table_correspondance… PRIVE » | Non dit ; rangé sous l'accordéon « captures-recherche » | O, H (recherche) | l. 2490-2496, Réglages › Données › « Générer l'export anonymisé » |
| « Codex data » : données de plusieurs groupes archivés (« contient des données personnelles d'étudiant·es. Ne le partage pas tel quel. ») | Labo du même programme ; au-delà, non dit | O | l. 2583, l. 2393-2398 |
| Codex `.zip` : `donnees.json`, `travaux/`, manifeste avec appareil, navigateur, `userAgent` | L'enseignant·e (sauvegarde) | O | l. 190, l. 2468, menu Codex / rappel « Mets ton codex à jour » |
| Rapport de bogue : environnement, nombre d'étudiant·es, 20 derniers clics et erreurs, « Aucun nom ni DA » | Les auteur·es (`mailto:labo@codexnumeris.org`) | O | l. 94-105, en-tête › « Signaler un bug » › « Envoyer par courriel » |
| Liens « Soutenir » : abonnement au blogue, abonnement de soutien, don, communauté de pratique de l'AQPC (CoP AQPC) | Le projet Codex Numeris et l'AQPC | O | l. 108-111, en-tête › « Soutenir » |
| Tirage au sort, questions flash, équipes | La classe, affiché en séance | O, I | l. 2139-2180, Suivi › Animation |
| Rappels « une pause de 5 min ? », « Portrait temporel » (« 43% … en fin de semaine ») | L'enseignant·e, sur son propre travail | O (code pour les rappels) | l. 2278-2279, Labo › Rythme |

---

## 3. Ce que le programme garde, et ce qu'il garde sans jamais le montrer

### 3.1 Ce qu'il garde, et où

**Le lieu de conservation**
- [O] Tout est gardé dans le navigateur, dans IndexedDB `MonitoragePedagogique` avec une copie dans `localStorage` (l. 39). Les fichiers de copies sont dans le magasin `fichiers` (l. 1595).
- [O] L'écran le dit : « Tes données vivent dans ce navigateur : elles peuvent être perdues si tu effaces les données de sites… » (l. 187, Accueil › « Ton codex »).
- [O] L'espace affiché : « Rangement : dans le navigateur » (l. 1704).

**Les données personnelles conservées**
- [O] DA, noms, programme, SA, CAF (l. 391, l. 395).
- [O] Présences avec notes (l. 1754, l. 1981).
- [O] Évaluations : le nom de l'étudiant·e est recopié dans chaque évaluation (`etudiantNom`, l. 1454). Chaque évaluation a son journal horodaté (l. 1351, l. 1458).
- [O] Annotations (l. 1668).
- [O] Données confidentielles (l. 1945).
- [O] Interventions et notes individuelles (l. 2070).
- [O] Indices calculés A, C, P et patterns RàI (l. 1754, l. 1768, l. 2784).

**Ce qu'il garde d'un trimestre à l'autre**
- [O] Le registre longitudinal garde « une copie figée de leur dossier, et les notes qu'ils obtiennent ensuite ». La copie contient évaluations, présences, interventions, captures et indices, et « Le registre voyage dans ton codex » (l. 2373-2377, Labo › Suivi longitudinal › « Inscrire au registre »).
- [O] Des captures hebdomadaires des indices sont faites automatiquement pour la semaine courante (l. 2791, sans geste). Elles peuvent aussi être reconstruites rétroactivement (l. 2480-2482).

**Ce qui est durci contre l'effacement**
- [O] La plupart des suppressions ouvrent d'abord la question « Écrire un codex avant de supprimer ? » (l. 356, 379, 399, 845, 1361, 1677, 2003, 2091…).
- [O] Pour un groupe, un trimestre ou une réinitialisation complète, le programme écrit d'abord un « codex à part ». **Si le fichier ne peut pas être écrit, rien n'est supprimé** (l. 413, l. 439, l. 2533, Réglages › « Réinitialiser toutes les données »).
- [O] Certaines suppressions exigent de retaper un nom ou « EFFACER » (l. 318-320, l. 2518-2519, l. 2534).
- [O] Un cours qui porte des données ne peut pas être supprimé (l. 355). Une grille ou une échelle employée non plus (l. 929, l. 980).

### 3.2 Ce qu'il garde sans que l'observation montre un écran qui l'affiche

| Donnée gardée | Ce qui la produit | Réf. |
|---|---|---|
| `a2026_elevesDesinscrits` : DA et date d'un·e étudiant·e après la suppression de sa fiche | Groupe › « Supprimer » | l. 399 [O] |
| Tables de correspondance d'anonymisation (« Élève N » ↔ DA), conservées après le retour au mode normal | En-tête › Anonymisation | l. 121 [O] |
| `tableCorrespondance_a2026` avec la clé secrète en clair, qui relie id anonyme et DA | Réglages › « Générer l'export anonymisé » | l. 2492 [O] |
| Les 20 derniers clics et erreurs, en mémoire seulement. Ils ne réapparaissent que dans le texte du rapport de bogue | Chargement (sans geste) | l. 2625, 2739, 2710 [O] |
| Identité de l'appareil (`appareil`, `navigateur`, `userAgent` complet) écrite dans le manifeste du codex | Mise à jour du codex | l. 2468 [O] |
| Journal des tentatives de sauvegarde (`issue:"fenêtre de choix refusée par l'usager"`) dans `sessionStorage` | Codex | l. 190, 413, 2533 [O] |
| Empreintes SHA-256 de chaque clé avant ouverture d'un codex (`_codex_snapshot_avant`) | « Ouvrir un Codex… » | l. 2469 [O] |
| `ressourcesSupprimees` : liste des gabarits supprimés | Suppression d'une grille ou d'une cartouche | l. 928, 941, 1054 [O] |
| `rapportsBugArchives[].envoye:true`, posé même quand le rapport a seulement été copié | « Copier le rapport » | l. 102 [O] |
| `clesConnues` : clé publique, dates du premier et du dernier contact, nombre d'imports, anciennes clés de chaque collègue | Import `.lcz` | l. 1281, 2552 [O] ; seul « 2 imports acceptés » apparaît dans un dialogue (l. 2550) |
| `snapshotAvant` (P et critères de chaque participant·e) dans une intervention | « Créer l'intervention » | l. 2070 [O] ; le tableau « Avant / Après » n'a pas été observé (l. 2947) |
| `preferencesRythme` : après rechargement, le formulaire affiche les valeurs par défaut alors que la clé garde les valeurs saisies | Rythme › champs | l. 2271 [O] |
| `sisDefaut` et `modeExpert`, gardés sans aucun lecteur | Réglages › Préférences | l. 2423, 2433 [O] |
| Blobs et miniatures après suppression ou remplacement : blob après « Remplacer l'existant », miniature après suppression d'un fichier de Modélisation, blobs après archivage | Import, Modélisation, Archivage | l. 1638, 2237, 1711 [O] |
| Références orphelines : `pratiqueId` d'une pratique supprimée, `horaireId` d'un horaire supprimé | Suppression | l. 1230, 426 [O] |
| Clés `demo_*` restantes après la sortie de la démo | « Quitter la démo » | l. 222 [O] |
| `jetonsEtudiants` créé à la simple consultation d'une évaluation | « Consulter » | l. 1466, 1930 [O] |

[I] La conservation déborde la suppression apparente. Après qu'un objet est « supprimé » à l'écran, des traces restent : DA désinscrit, correspondances, blobs, références.

---

## 4. Ce que le programme rend facile et ce qu'il rend difficile

### 4.1 Ce qui se fait sans geste
- [O] L'enregistrement se fait tout seul 1,5 s après chaque changement : évaluation (l. 1454), présences (l. 1987), fiche de production (l. 816), carte (l. 460, l. 495). Il n'y a pas de bouton « Enregistrer ».
- [O] A, C, P et les patterns RàI sont recalculés et stockés à chaque affichage de Suivi du groupe (l. 1784, l. 2784). A est aussi recalculé à chaque saisie de présence (l. 1981).
- [O] Une capture hebdomadaire des indices est faite automatiquement (l. 2791).
- [O] Le rappel de sauvegarde s'ouvre seul 1,5 s après le chargement s'il existe des évaluations ou des fichiers. La périodicité par défaut est de 14 jours (l. 188-192).
- [O] La vérification de version a lieu toutes les 5 min (l. 2667).
- [O] Le journal des clics et des erreurs est tenu en mémoire (l. 2739).

### 4.2 Les chemins par défaut
- [O] **Présences.**
  - Une séance non saisie s'affiche avec chaque étudiant·e à 2/2, « 100% » (l. 1983).
  - « ✓ 2 pér. » met tout le monde présent en un geste (l. 1996).
  - Verrouiller une séance non saisie fait que « les élèves non marqué·es comptent présent·es » (l. 2015).
  - Une séance jamais saisie n'entre pas dans le taux (l. 2021).
  - [I] Une absence demande un geste par étudiant·e. La présence est l'état par défaut.
- [O] **Évaluation.**
  - Grille, échelle, cartouche, statut « recu » et intégrité « Recevable » sont posés d'office (l. 1442).
  - La rétroaction se rédige toute seule à partir des niveaux choisis (l. 1451).
  - Une flèche passe à « Élève 2 de 4 » (l. 1470-1471).
  - [I] Évaluer un critère coûte un choix dans une liste. Le texte rendu à l'étudiant·e s'écrit sans autre geste.
- [O] **Assistance et visite guidée.**
  - L'assistance est active au premier chargement (l. 2737).
  - Des flèches didactiques pointent « créer ta première production », « ta première pratique », « saisir des périodes de présence » (l. 267).
  - La visite suit l'ordre Cadre → Conception → Évaluation → Suivi. La carte d'alignement et le Labo y sont marqués « (optionnel) » (l. 128).
- [O] **Indicateurs.**
  - `activerRai:true` et `depistageAcp:true` sont les valeurs écrites au premier enregistrement des préférences (l. 2194, l. 2418).
  - Le panneau « Détails » filtre « P < 65% », « A ou C < 70% », « RàI 2-3 » en un clic et trie par « score d'urgence » (l. 1798-1804).
- [O] **Import des copies.** L'appariement par DA, par nom ou par format LÉA est automatique (l. 1566-1568). Le dernier choix de production est réutilisé pour les dépôts suivants (l. 1604).
- [O] **Démo.** L'activer mène directement à Suivi › Suivi du groupe (l. 215).

### 4.3 Ce qui est rendu difficile
- [O] **Supprimer.**
  - La boîte « codex » s'ajoute à un `confirm` (sections 3.1 et 3.2).
  - Groupe, trimestre ou réinitialisation : un codex à part doit être écrit d'abord, sinon rien n'est supprimé (l. 413, l. 2533).
  - Certaines suppressions exigent de retaper un nom ou « EFFACER » (l. 320, l. 2519, l. 2534).
  - Un cours, une grille ou une échelle en usage sont bloqués (l. 355, l. 929, l. 980).
  - Changer la session d'un trimestre qui porte des données est refusé (l. 307).
- [O] **Obtenir une note.**
  - Pas de note « tant qu'un critère est sans niveau » (l. 1449).
  - Pas de note de cours sans pratique appliquée : « non constructible » (l. 1769, l. 1430).
  - Pour SPE, « Tant qu'ils manquent, aucune note ne peut être calculée » (l. 1119).
  - Pour DEN sans cible, « aucune note ne peut dépasser 59 » (l. 1214).
- [O] **Partager du matériel.**
  - Une description est obligatoire (l. 867, l. 1263).
  - Il faut cocher « Tu dois accepter de partager sous licence CC BY-NC-SA 4.0 » (l. 2447).
  - Le matériel démo et le matériel importé de collègues sont exclus de « Exporter ma config » (l. 2444-2446).
- [O] **Faire sortir des données.** Il n'existe aucune voie réseau. Tout sort par fichier ou presse-papiers (l. 12).
  - [I] Transmettre quoi que ce soit (notes, copies, rapports) demande un geste hors du programme : téléverser dans Léa, envoyer un fichier, coller.
- [O] **Mesurer son propre temps de travail.** Le chronomètre est désactivé par défaut (l. 2194). La section Rythme affiche « Active le chronomètre… » (l. 2267).

### 4.4 Asymétries notables
- [I] **Le calendrier tolère, la suppression bloque.** Les avertissements du calendrier sont « À vérifier (rien n'est bloqué) » (l. 325). Les suppressions, elles, sont verrouillées.
- [I] **Entrer est facile, enlever est coûteux.** Ajouter, dupliquer, importer et enregistrer coûtent un geste ou aucun. Retirer en coûte plusieurs.
- [O] **Exceptions où retirer est facile.**
  - « Retirer » un résultat longitudinal : « sans confirmation » (l. 2385).
  - « Retirer » une cartouche de la sélection : « sans dialogue » (l. 1059).
  - Supprimer une pratique appliquée se fait « sans avertissement supplémentaire » et laisse une référence orpheline (l. 1230).

---

## 5. Ce que le programme calcule, compte ou classe, et à partir de quoi

| Calcul | Entrées | Réf. |
|---|---|---|
| Semaines et jours de cours, congés, reprises, numéros de semaine | Bornes du trimestre, journées sans cours, horaire | l. 301, 324, 330-332, 421 |
| Heures attendues ; écart entre l'horaire et le devis | Pondération « 2-2-3 » × semaines ; périodes de l'horaire | l. 346, 425 |
| Badges d'alignement (« Aucune évaluation ne vérifie cette compétence »), durées → périodes, total planifié | Nœuds et liens de la carte, durées, horaire | l. 511, 527, 763 |
| Somme des pondérations (« 70% manquant », « 5% en trop »), total d'une grille | Productions, critères | l. 808, 892, 905 |
| Note d'une copie = moyenne pondérée des valeurs ponctuelles des niveaux (I 32, D 69,5, M 79,5, E 92,5) | Niveaux par critère, échelle | l. 1301, 1451 |
| Note « algorithmique » = Pondération − (Erreurs ÷ Mots × 500) ; projection à l'EUF | Sous-critères d'erreurs, nombre de mots | l. 920-922 (non exécuté sur une copie, l. 2900) |
| Note de cours selon la pratique : moyenne pondérée, N meilleures + obligatoires, forfaits, médiane | Évaluations verrouillées ou non, pratique appliquée | l. 1192, 1924-1928, 1107-1126 |
| Moyenne de la liste (excluant plagiat et IA, incluant les non verrouillées) | Notes finales | l. 1312, 1317 |
| A = périodes présentes ÷ périodes offertes (séances saisies seulement) | Présences, horaire | l. 1755, 2021 |
| C = travaux remis ÷ travaux demandés ; P = note du cours | Évaluations, productions, pratique | l. 1769, 1825, 1929 |
| μ, σ, nombre dans ±1σ, r de Pearson A↔P et C↔P, distribution I-D-M-E, bandes « Fragile / Modéré / Favorable / Très favorable » | A, C, P du groupe (inactif·ves et décrocheur·ses exclu·es) | l. 1787-1788, 1870, 406 |
| Pattern (« Progression stable », « Défi spécifique », « Difficulté émergente », « Difficulté persistante », « Non-participation ») ; niveau RàI 1, 2 ou 3 | P des N dernières productions, seuils `idme`, A, échéances | l. 1789, 2200-2203 |
| Score d'urgence et tri des « prioritaires » | P, min(A, C), suivi, RàI | l. 1804 |
| Trajectoires, quartiles, médiane ; habiletés par critère | Notes par production, niveaux par critère | l. 1841, 1843 |
| Simulation : mêmes profils sous plusieurs pratiques (fictifs ou « Mon groupe actif (données réelles) ») | Échelle, pratiques, groupe | l. 2244-2251 |
| Corrélations longitudinales ; « P contrôle » (étudiant·es sans intervention) ; P avec ou sans jetons | Captures hebdomadaires, interventions, jetons | l. 2287-2292 |
| Bilan : score moyen /4, % favorables, « Signal fort » | Réponses Likert importées | l. 2366 |
| Durée moyenne et médiane d'évaluation, tendance « Accélère / Ralentit », charge estimée, « Portrait temporel » | Chronomètre des évaluations, horaire | l. 2275-2278 |
| Identifiant anonyme = 8 caractères de SHA-256(DA:clé) | DA, clé aléatoire | l. 2496 |
| Tirage au hasard, équipes (absent·es écarté·es, paires déjà formées évitées) | Liste, présences du jour, équipes retenues | l. 2140, 2176-2180 |

**Remarques**
- [O] Le graphique hebdomadaire ajoute à chaque valeur un décalage aléatoire `(Math.random() − 0.5) × 0.03`, différent à chaque rendu (l. 1790, l. 2789). [I] La valeur affichée n'est pas exactement la valeur calculée.
- [I] **Ce qui est classé, ce sont des personnes.** Bandes, patterns, niveaux RàI et priorités portent sur chaque étudiant·e, à partir de trois mesures : présence (A), remise (C) et niveau des travaux (P).
- [I] **Ce que le programme ne calcule pas sur les données sensibles.** Rien dans l'observation n'indique que les données « Confidentiel » entrent dans un calcul. La section Accompagnement n'affiche que « Services adaptés : SA » (l. 1933).

---

## 6. La finalité que ces régularités révèlent

### 6.1 Formulation

**Labo Codex fait du poste de l'enseignant·e le lieu, seul et fermé, où ce que l'enseignant·e saisit sur chaque étudiant·e (présences, copies, niveaux par critère) se convertit sans cesse en notes et rétroactions à rendre et en indices qui classent chaque étudiant·e selon un besoin d'intervention. Ce dossier est conservé et protégé bien plus qu'il n'est mis en circulation.**

### 6.2 Justification par les régularités

1. **La conversion est automatique, la saisie reste humaine.**
   - [O] Les entrées exigent un geste : niveau, période, dépôt de fichier (section 1).
   - [O] Les sorties dérivées n'en exigent aucun : rétroaction rédigée (l. 1451), note (l. 1451), A, C, P et RàI recalculés à l'affichage (l. 2784), capture hebdomadaire (l. 2791).
   - [I] Le programme est construit pour que chaque saisie produise immédiatement un jugement chiffré et un classement.

2. **La sortie la plus outillée est celle qui va vers l'étudiant·e.**
   - [O] Rétroaction au « tu », PDF « pour téléversement dans Léa », « Dossier PDF » avec « Note provisoire — peut changer selon tes prochains travaux. » (l. 1442, 1733, 1357).
   - [I] Évaluer et rendre est le parcours le plus court. La visite guidée suit Cadre → Conception → Évaluation → Suivi, et marque la carte et le Labo « (optionnel) » (l. 128). Le bandeau d'Évaluation dit « Tu peux maintenant saisir les présences et évaluer les productions » (l. 51).

3. **Le classement oriente l'attention vers certain·es étudiant·es.**
   - [O] Filtres « P < 65% », « RàI 2-3 », tri par score d'urgence (l. 1803-1804).
   - [O] « Niveau 3 - Intensif … Interventions recommandées : Rencontrer l'étudiant·e… » (l. 1933).
   - [O] Les interventions reportent des présences et des « absences motivées » dans la saisie (l. 2081).
   - [I] Le tableau de bord sert à décider auprès de qui intervenir.

4. **La conservation prime sur la circulation.**
   - [O] Aucune transmission réseau (l. 12).
   - [O] Les suppressions sont bloquées tant qu'aucun codex n'est écrit (l. 413, 2533).
   - [O] Des traces persistent après suppression (section 3.2).
   - [O] Un registre suit des étudiant·es « d'un trimestre à l'autre » et y joint « les notes qu'ils obtiennent ensuite » (l. 2373).
   - [I] Ce qui est saisi est fait pour durer et pour s'accumuler, sous la garde de l'enseignant·e.

5. **La circulation encouragée concerne le matériel, pas les données d'étudiant·es.**
   - [O] Les exports de matériel sont facilités, signés et placés sous licence (l. 1267-1270, 2447).
   - [O] À l'inverse, le seul export de données d'étudiant·es destiné à circuler est anonymisé (l. 2494). L'autre porte l'avertissement « Ne le partage pas tel quel » (l. 2583).

### 6.3 Les autres finalités compatibles avec les observations

Les observations admettent plusieurs finalités. Aucune n'exclut les autres.

| Finalité possible | Ce qui l'appuie | Ce qui la limite | Ce qui permettrait de trancher |
|---|---|---|---|
| **A. Outil de travail de l'enseignant·e : planifier → évaluer → noter → rendre** | Ordre de la visite (l. 128) ; autosave ; exports Léa et PDF ; plan de cours (l. 588-604) | Une bonne part du programme dépasse ce cycle : Labo, registre, Études | Mesurer quels écrans sont réellement utilisés et à quelle fréquence (inaccessible ici) |
| **B. Dépistage et suivi des étudiant·es « à risque »** (RàI, « Fragile », « Non-participation », confidentiel, longitudinal) | Calcul automatique A, C, P et RàI (l. 2784) ; filtres de priorité (l. 1803) ; catégories de handicap (l. 1946) ; registre inter-trimestres (l. 2373) ; `activerRai:true` par défaut (l. 2194) | Les calculs ne sont pas transmis ; le dépistage par critères exige une grille désignée, absente par défaut (l. 1933) | Savoir si les classements déclenchent des actions hors programme, et qui les voit |
| **C. Faire changer les pratiques de notation** : sortir de la moyenne cumulée vers PAN, standards, spécifications, dénotation | 4 familles de pratiques et assistant (l. 1094-1136) ; comparateur « seules les règles changent » (l. 2244, 2249) ; guide « Pourquoi sortir du cumul de points ? » (l. 1089) ; liens gradingforgrowth et « cop-pratiques_notation » (l. 2588) | Ces textes sont des sorties, pas des preuves d'effet ; SOM est un gabarit comme les autres (l. 1129) | Comparer les pratiques adoptées avant et après usage, hors programme |
| **D. Produire des données pour la recherche** | Onglet « Labo » ; « Études » (corrélations, « P contrôle ») (l. 2283-2293) ; « export anonymisé » au format versionné (l. 2494) ; « codex data » multi-groupes (l. 2393-2398) ; résultats ultérieurs (l. 2380) ; bilan des étudiant·es (l. 2301-2366) | Aucune collecte automatique (l. 12) ; l'aide dit « des pistes de réflexion, pas des preuves » (l. 2293) ; deux voies d'import du bilan échouent (l. 2358-2359) | Savoir si ces fichiers sont remis à des chercheur·es, avec quel protocole ou consentement : rien dans le programme ne le dit |
| **E. Bâtir une communauté et une économie autour du projet** | Partage CC BY-NC-SA signé (l. 2541) ; carte démo d'un auteur nommé (l. 631) ; CoP AQPC, abonnement, don (l. 109) ; courriel de rapport (l. 104) | Aucun compte, aucune inscription, aucune requête externe sans clic | Compter les échanges `.lcz`, les abonnements, l'activité de la CoP (hors programme) |
| **F. Réflexivité de l'enseignant·e sur sa propre pratique et sur sa charge** | Auto-réflexion « avant / après résultats » (l. 2348) ; bilan des étudiant·es sur « le système d'évaluation » (l. 2301) ; Rythme et rappels de repos (l. 2278-2279) | Chronomètre désactivé par défaut (l. 2194) ; import du bilan en panne (l. 2358) | Savoir si ces sections sont utilisées |

**Mon choix.** La formulation retenue (6.1) relie A et B par la régularité la plus constante : saisie → conversion automatique → classement → conservation.

**Ce qui la ferait réviser :**
- Si l'on observait que les exports « recherche » et « codex data » sont régulièrement transmis à un tiers, D deviendrait centrale.
- Si les indices et classements n'étaient jamais consultés, B s'affaiblirait au profit de A.

---

## 7. À quoi le programme sert, pour chacune des personnes qu'il touche

**L'enseignant·e** (utilisateur ou utilisatrice principal·e)
- [O] Organiser un trimestre, préparer et évaluer des copies, produire des notes et des rétroactions, repérer qui est en difficulté, garder une trace durable (sections 1 à 5).
- [O] Partager du matériel signé et sous licence (l. 2541).
- [O] Observer son propre rythme de travail, si le chronomètre est activé (l. 2275-2278).
- [O] Ses propres données sont aussi traitées : nom, courriel et institution sont écrits dans tous les exports partagés (l. 362, 637, 867, 2450). Ses clics et erreurs figurent dans le rapport de bogue (l. 2710). Ses heures d'évaluation alimentent le « Portrait temporel » (l. 2278).

**L'orthopédagogue**
- [O] Ouvrir un « service » sans code ni horaire, inscrire des élèves, même sans DA, et noter des rencontres (l. 2101-2123).
- [O] Effet de bord observé : la création du service remplace les indices des étudiant·es du trimestre par ceux des seuls élèves du service (l. 2114).

**Les étudiant·es** (jamais utilisateurs ou utilisatrices ; personnes dont les données sont traitées)
- [I] Pour elles et eux, le programme est l'endroit où leur présence, leurs copies et leurs niveaux sont convertis en :
  - notes et rétroactions qui leur reviennent par Léa, en PDF ou par copier-coller (l. 1733, 1357, 1500) ;
  - catégories qu'elles et ils ne voient pas dans les sorties observées : « Fragile », « Difficulté persistante », « Niveau 3 - Intensif », « Non-participation » (l. 1787-1789, 1933). Le « Dossier PDF » observé ne contient ni A, ni RàI, ni pattern (l. 1357).
- [O] Des données de santé ou de handicap et le parcours scolaire peuvent être consignés (l. 1945-1946).
- [O] Leur dossier peut être figé et suivi d'un trimestre à l'autre avec leurs notes ultérieures (l. 2377-2383).
- [O] Leur dossier peut sortir sous une forme anonymisée (programme, services adaptés, résultats ultérieurs) avec une table de correspondance (l. 2494-2495).
- [O] En classe, ils et elles sont tiré·es au sort ou mis·es en équipes. L'absence du jour écarte des équipes (l. 2177).
- [O] Ils et elles peuvent répondre au questionnaire de bilan, hors du programme (l. 2322).
- [O] Leur DA reste dans `elevesDesinscrits` après la suppression de leur fiche (l. 399).

**Les collègues**
- [O] Recevoir et donner du matériel. Leur clé publique, leurs dates de contact et leur nombre d'imports sont mémorisés chez qui importe (l. 1281, l. 2548-2552).

**L'établissement** ([H] destinataire implicite)
- [O] Le programme reprend ses formats : DA du collège, Omnivox, Léa, devis ministériel, EUF (l. 387, 409, 1568, 341, 922).
- [O] Il produit une synthèse CSV des notes finales et une grille des présences (l. 1425, l. 2048).
- [H] Ces fichiers servent à la remise des notes ou au dossier administratif. Le programme ne le dit pas. Le champ « remise des notes » du cadre (l. 322) va dans ce sens.

**Les auteur·es du projet Codex Numeris et l'AQPC**
- [O] Ils et elles reçoivent des rapports de bogue (sans nom ni DA) seulement quand l'enseignant·e clique « Envoyer par courriel » (l. 96, 104).
- [O] Des liens mènent à l'abonnement, au don et à la communauté de pratique (l. 109).
- [O] Un texte de refus de suppression s'adresse à quelqu'un « en session » : « dis-le-moi en session s'il s'agit de données de test à nettoyer » (l. 355). [H] C'est la trace d'un échange direct entre auteur·es et utilisateur·rices en phase bêta.

**Des chercheur·es** ([H])
- [O] Les exports « anonymisé » et « codex data » et la section « Études » leur fourniraient une matière (l. 2490-2496, 2583, 2283).
- [H] Aucune remise à des chercheur·es n'est observée.

**Une IA externe** ([O] par copier-coller)
- [O] Elle reçoit, si l'enseignant·e les colle, des modèles qui contiennent le cours, la carte, les consignes et des grilles (l. 611, 1003, 2327).
- [O] Les modèles observés ne contiennent pas de noms d'étudiant·es.

**Des personnalités publiques**
- [O] Leurs noms servent d'étudiant·es fictif·ves dans la démo (l. 214).

---

## 8. Contradictions relevées, non lissées

1. **Confidentialité affichée et export du codex.**
   - [O] La fenêtre « Confidentiel » dit « Ces informations sont stockées localement et ne sont jamais partagées. » (l. 1944).
   - [O] Or le codex exporte `donnees.json` (49 clés) sans chiffrement (l. 2468). L'extraction « codex data » avertit que le fichier « contient des données personnelles d'étudiant·es » (l. 2583).
   - [?] L'observation ne dit pas si `confidentielEtudiants` fait partie du codex.

2. **Démo « anonymisée ».**
   - [O] Le pack démo se déclare « 10 étudiants anonymisés » (l. 2731).
   - [O] La démo contient « 10 étudiant·es dont les noms sont ceux de personnalités publiques » (l. 214).

3. **Licence.**
   - [O] Les noms de fichier portent « CC-BY-SA ».
   - [O] Les métadonnées et le texte disent « CC BY-NC-SA 4.0 » (l. 867, 937, 1058, 1259, 1687, 2448).

4. **Infolettre.**
   - [O] L'Accueil annonce « Ton courriel, une fois par mois… tu reçois un code… ». Aucun champ, aucun bouton, aucune requête n'y correspond (l. 164).

5. **Graphique et valeurs.**
   - [O] La courbe hebdomadaire affiche des valeurs bruitées au hasard, différentes à chaque rendu (l. 1790, 1833).

6. **Rapport « envoyé ».**
   - [O] `envoye:true` est écrit quand le rapport est seulement copié (l. 102).

7. **Export « recherche » incomplet.**
   - [O] `snapshots_hebdomadaires: []` alors que 15 captures existent (l. 2491).
   - [O] Le CSV de synthèse a des colonnes Groupe et Cours vides (l. 1433).

8. **Protection inégale.**
   - [O] Un cours avec données est indélébile (l. 355).
   - [O] Une pratique appliquée se supprime sans avertissement et laisse un `pratiqueId` orphelin (l. 1230).
   - [O] Un résultat longitudinal se retire sans confirmation (l. 2385).

9. **Préférences sans effet.**
   - [O] `modeExpert` et `sisDefaut` n'ont aucun lecteur (l. 2423, 2433).
   - [O] `preferencesRythme` est enregistrée mais n'est pas réaffichée (l. 2271).

10. **Écrans qui annoncent une chose et en font une autre.**
    - [O] « ZIP léger… » alors que les fichiers produits sont un JSON et un TXT (l. 2448).
    - [O] Le tri des productions n'agit pas (l. 837).
    - [O] La corbeille de la carte déplace le bloc sans le supprimer (l. 706).
    - [O] L'import texte d'une cartouche n'est pas persisté (l. 1034).
    - [O] L'import CSV du bilan échoue (l. 2358-2359).
    - [O] Le déverrouillage échoue dans la session « Évaluer » (l. 1461).

11. **Moyenne de liste.**
    - [O] Elle exclut le plagiat mais inclut des évaluations non verrouillées (l. 1317).

---

## 9. Ce que l'observation ne permet pas de savoir

- **L'usage réel.** Qui utilise le programme, combien de personnes, quels écrans, à quelle fréquence. Si les indices et les classements sont lus, si les PDF sont réellement téléversés dans Léa, si le CSV de notes va à l'établissement. Toutes les données observées sont fictives (l. 9).
- **Le déploiement.** Le programme a été servi depuis `127.0.0.1` (l. 8).
  - [H] Hébergé ailleurs, la requête `version.json` toutes les 5 min (l. 2667) atteindrait le serveur d'hébergement. Ce serveur pourrait alors constater les sessions actives. Rien ne permet de le vérifier ici.
- **La destination des fichiers exportés.** Vers qui vont les fichiers « anonymisé », « codex data », codex, `.lcz` et les rapports de profil. Sous quel protocole, avec quel consentement des étudiant·es.
- **Le contenu exact du codex.** La liste complète des 49 clés de `donnees.json` n'est pas donnée, en particulier la présence ou non des données confidentielles (l. 2468).
- **Les chemins non exécutés.**
  - L'écriture réelle par sélecteur natif : codex, archives, « Faire revenir », « Emprunter » (l. 2851-2852, 2967-2970).
  - Les signalements de dépistage par critères et les blocs SOLO/RLO (l. 2930).
  - Le tableau « Avant / Après » des interventions (l. 2947).
  - Le mode anonymisation appliqué aux profils (l. 2935).
  - Les critères algorithmiques appliqués à une copie (l. 2900).
- **Les intentions des auteur·es.** Le document dit expressément n'en rien dire (l. 3). Les textes d'aide et les guides sont des sorties du programme, non des déclarations vérifiées.
- **Les effets sur les personnes.** Ce que produisent, chez les étudiant·es et chez les enseignant·es, les classements, les rétroactions générées et les notes provisoires.
