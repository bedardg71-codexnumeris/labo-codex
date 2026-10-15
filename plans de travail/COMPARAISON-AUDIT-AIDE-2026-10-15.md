# L'Aide face à l'audit du 15 octobre

*15 octobre 2026, après-midi. Comparaison faite par Claude dans le projet « Application Labo Codex ». Elle confronte la description consolidée de l'audit (`audit-2026-10-15/10-description-application.md`) à l'Aide telle qu'elle est aujourd'hui dans le dépôt.*

## Ce qui a été comparé, et comment

- **D'un côté**, les 103 conclusions de la description consolidée : ce que les deux lectures de l'observation à l'aveugle disent toutes deux, que tu as classé « voulu et fait ». Elles décrivent la version 1.199.0, observée dans Chromium.
- **De l'autre**, toute l'Aide de la branche principale au 15 octobre, 13 h 08 : la section Aide (six sous-sections, de l'Introduction à la Référence), 277 infobulles, 61 aides contextuelles, 48 termes du glossaire, la visite guidée, les flèches, les guides pédagogiques et la bannière « À propos ».
- **Méthode.** J'ai lu les deux textes en entier et classé chaque conclusion. Quand l'Aide et l'audit divergeaient, j'ai lu le code actuel pour trancher (fichiers cités en fin de ligne).

## Le résultat

**L'Aide décrit bien les gestes, mal plusieurs calculs du Suivi.** Configurer, concevoir, importer, annoter, évaluer, archiver : c'est juste. Ce qui est faux se concentre sur ce que l'application calcule à partir des élèves : l'assiduité, le niveau RàI, le sort d'une copie plagiée. Plusieurs cartes de la section Aide décrivent aussi un indice de risque que le code n'a plus depuis près d'un an.

| Verdict | Conclusions |
|---|---|
| L'Aide dit la même chose | 49 |
| L'Aide le dit en partie | 19 |
| L'Aide n'en dit rien | 15 |
| L'Aide dit autre chose | 9 |
| Hors du champ de l'Aide (mécanique interne) | 11 |

Sur les 92 conclusions qui concernent l'enseignant·e, un peu plus de la moitié sont dites correctement. Le Labo est l'écran le moins couvert : 5 conclusions sur 11 n'y ont aucun écho dans l'Aide.

## Ce que l'Aide affirme et que l'application ne fait pas

Classé par conséquence pour l'enseignant·e. Chaque ligne dit ce que l'Aide affirme, ce que fait l'application, et la suite que je propose.

### Ce qui touche à la note et au dépistage

1. **Une copie plagiée et la complétion.** L'Aide dit qu'une copie non recevable sort du total attendu (son exemple : C = 7/8). L'application la garde au dénominateur et la compte non remise, comme tu l'as tranché le 17 septembre : C = 7/9. *Correction factuelle : aligner l'Aide sur ta décision.* (section Aide › Utilisation › « Travail NON RECEVABLE » ; `pratiques/pratique-registre.js:868`, `pratique-sommative.js:300-316`)
2. **Une copie plagiée et la note.** L'Aide dit qu'elle sort du calcul de P et « n'est pas une note de 0 % ». En sommative, le calcul de P ne lit pas le statut d'intégrité : la copie verrouillée y entre avec sa note, et l'audit observe qu'elle vaut 0. La liste des évaluations, elle, l'exclut de la moyenne affichée. Deux traitements selon l'écran. **Tranché par Grégoire le 15 octobre** : une copie plagiée vaut 0, sauf si une reprise la remplace ou si la pratique ne retient que les meilleures productions et qu'elle n'en fait pas partie. C'est ce que fait déjà l'application en sommative ; c'est l'Aide qui change, en présentant la règle comme celle de l'application, pas comme un principe. Vérifié en sommative seulement. (même carte, et infobulle « Intégrité » ; `pratique-sommative.js:74-110`, `liste-evaluations.js:594-596` ; Q5-02)
3. **L'indice de risque R, le « risque d'échec » et l'indice E.** Sept endroits de la section Aide expliquent une formule R = (2×A + C + P) / 4, un risque d'échec 1 − A×C×P, une « échelle de risque » à six zones, un « niveau d'attention N » et une corrélation « E ↔ P ». Rien de cela n'existe dans le code. D'après ses commentaires, l'échelle de risque a été remplacée le 14 novembre 2025 et l'indice E retiré le 16 avril 2026. *Retrait : correction factuelle. Ce qui le remplace dans le texte est de la prose neuve, à te proposer.* (Vérification hebdomadaire ; Interpréter le profil ; Guide détaillé du profil ; Labo › Études ; Seuils critiques d'alerte ; FAQ RàI ; Glossaire « Indice composite (R) » ; `js/contexte-qualification.js:60-70`, en-tête de `js/snapshots.js`)
4. **Ce qui décide du niveau RàI.** L'Aide en donne quatre versions : la performance globale P, tous critères (infobulle et Introduction) ; les seuls critères multistructurels (glossaire) ; l'indice de persistance IPB (Introduction, dans la même carte que la première version, et guide RàI) ; l'indice R (FAQ). L'application décide d'après P, quand la note existe, et d'après le pattern des derniers artefacts (trois par défaut). Ce pattern surveille tous les critères de la grille de référence, sauf ceux marqués « aucun ». Depuis le 17 septembre, l'IPB nomme la cible de l'intervention, il ne fixe plus de palier. *Correction factuelle.* (`profil-etudiant-calculs.js:1765-1900` et commentaire de `determinerCibleIntervention` ; `profil-etudiant-helpers.js:905`)
5. **Le pattern « Non-participation ».** Partout, l'Aide énumère quatre patterns. L'application en a un cinquième : présent·e en classe, rien de remis, niveau 3. S'y ajoute « En attente » quand rien n'est encore jugeable. *Correction factuelle.* (`profil-etudiant-calculs.js:1801-1830` ; Q5-16)
6. **L'assiduité ne compte que les séances saisies.** L'Aide la définit comme la proportion des périodes « du trimestre », ou des présences sur les séances, « depuis le début du trimestre ». L'application ne compte que les séances saisies ; tant qu'aucune ne compte, A est « inconnue ». Une séance non saisie s'affiche à 100 % sans entrer dans A. *Correction factuelle.* (guide ACP, glossaire de la section Aide, infobulle « Assiduité » ; `trimestres.js:2295`, `tableau-bord-apercu.js:571` ; Q5-09, Q4-11)
7. **Les seuils A, C, P.** La FAQ affirme qu'ils « ne sont pas modifiables dans l'interface ». Le glossaire et une infobulle disent qu'ils se règlent dans Labo › Outils d'observation, ce que l'audit du 10 septembre avait mesuré (70/80/85). La section Aide en donne en plus trois tables qui ne s'accordent ni sur les bornes ni sur les mots (« Favorable » à 85 % dans l'une, à 90 % dans l'autre). *Correction factuelle.* (FAQ ; Comprendre les diagnostics ; Seuils critiques d'alerte ; Interpréter A et C)

### Ce qui touche aux données qui sortent

8. **Le rapport de bogue.** L'infobulle annonce que « le numéro de build part automatiquement ». Le rapport contient aussi l'appareil et le navigateur, le nombre d'étudiant·es, de cours et de productions, les 20 dernières actions et les 20 dernières erreurs. Aucun nom ni DA. L'Aide dit moins que ce qui part. *Correction factuelle.* (`js/rapport-bug.js` ; Q2-23)
9. **L'export anonymisé.** L'infobulle annonce « les indices A-C-P et des statistiques agrégées ». L'audit observe des identifiants hachés par élève, avec le programme, les services adaptés et les résultats ultérieurs. Il observe aussi un fichier privé de correspondance et une clé secrète, produits au même clic. *Déjà inscrit côté application (#1060, #1074). Reste à décider qui rejoint qui : le code l'Aide, ou l'inverse.* Je ne l'ai pas revérifié dans le code. (Q2-20, Q3-22)
10. **Réinitialiser.** L'infobulle annonce une « triple confirmation et mot de passe ». L'application propose d'abord d'écrire un codex à part, demande deux confirmations, puis la saisie de « EFFACER ». Aucun mot de passe. *Correction factuelle.* (`import-export.js:1959-1980` ; Q3-15)
11. **Les captures.** Une carte de la section Aide dit qu'une capture se crée « à chaque saisie de présences ». Elles sont hebdomadaires, comme le dit la carte Référence de la même section. *Correction factuelle.* (`js/snapshots.js` ; Q3-12)

### Ce qui touche aux gestes

12. **Les formats d'horaire.** Une aide contextuelle, un terme du glossaire et deux cartes de la section Aide décrivent encore les formats 2×2h / 1×4h (« saisir 2h par bloc »). Cette configuration a été retirée : l'horaire se règle en périodes par séance. *Correction factuelle.* (commentaire d'`index.html:7834-7838` ; Q1-04)
13. **Partager une grille.** La section Aide décrit un fichier `.json` envoyé par courriel, et la FAQ un transfert d'appareil par fichier JSON. Grilles, échelles et cartouches partent en `.lcz` signé, et le transfert d'appareil passe par le codex. L'Introduction de la même section le dit déjà. *Correction factuelle.* (`grilles.js:2185`, `echelles.js:1029`, `cartouches.js:3797` ; Q2-19)
14. **Le bilan réflexif.** Le glossaire le définit comme « un espace pour consigner tes observations » sur ta démarche. C'est un questionnaire aux élèves, avec import des réponses et rapport (score sur 4, signaux forts), complété par une auto-réflexion de l'enseignant·e. La section Aide le décrit correctement. *Correction factuelle.* (glossaire « Bilan réflexif » ; `js/bilan-reflexif-rapport.js` ; Q2-17)

## Ce que l'audit voit et dont l'Aide ne dit rien

Rangé par utilité pour l'enseignant·e. Combler ces trous, c'est écrire, pas corriger.

- **Le comparateur de pratiques** (Labo) : aucune mention dans l'Aide. C'est pourtant la fonction que la lecture « la plus flatteuse » met en avant (« comparer des façons de noter »). (Q5-20)
- **Le registre longitudinal et les résultats ultérieurs** : aucune mention. (Q1-22, Q3-11)
- **Le panneau « Détails » du Suivi du groupe** : qui y entre (P sous 65 %, A ou C sous 70 %, RàI 2 ou 3) et l'ordre dans lequel il range les élèves. C'est le seul endroit où l'application range les élèves par un score d'urgence, et l'Aide ne l'explique pas. (Q2-04, Q5-18)
- **Ce que produit l'export anonymisé** : le fichier de correspondance et la clé secrète, à garder hors de portée. (Q3-22)
- **La mention « Note provisoire — peut changer selon tes prochains travaux »** sur le Dossier PDF, que l'élève lit. (Q2-08)
- **Le DA provisoire commençant par 9** pour un élève suivi en orthopédagogie sans DA connu. (Q1-31)
- **Le statut « décrochage »**, qui retire l'élève des calculs du groupe ; la FAQ parle d'« Inactif » ou d'« Abandon ». (Q5-17)
- **Le chronomètre et le « Portrait temporel »** : durée des évaluations, charge estimée, rappels de pause. (Q5-24, Q2-26)
- De moindre portée : un cours qui porte des données ne se supprime pas (Q3-17), le journal horodaté des évaluations (Q3-05), les 20 derniers clics gardés en mémoire (Q3-24), la demande de `version.json` toutes les 5 minutes (Q1-36), le léger décalage aléatoire des points du graphique hebdomadaire (Q5-27).

## Trouvé en chemin, hors de l'audit

Ces écarts sont internes à l'Aide. Ils ne viennent pas des 103 conclusions. Suite proposée : les inscrire.

- Le glossaire présente la grille de critères comme « structurée selon 5 critères » (Structure 15 %, Rigueur 20 %…), alors que l'entrée SRPNF du même glossaire dit que c'est un exemple, « non une structure du logiciel ».
- Le mode anonymisé est décrit trois fois, de trois façons : pseudonymes (« Cerf agile ») activés depuis l'accueil dans le glossaire, « Élève 1, Élève 2 » activés depuis l'en-tête dans la section Formation, « noms fictifs ou numéros » dans l'infobulle. Je n'ai pas vérifié lequel est actuel.
- Le niveau 2 du RàI s'appelle tantôt « préventif », tantôt « ciblé ».
- L'entrée « Visite guidée » du glossaire décrit la préférence d'assistance, pas la visite. Le terme « Parcours guidé » annonce 6 étapes à relancer depuis les Préférences ; la visite en compte 7 avec l'accueil et se relance depuis l'en-tête.
- L'échelle IDME d'exemple laisse un trou entre 64 % et 65 % (« < 64 % », puis « 65-74 % »).
- Deux cartes parlent le langage du code : « Ce module GÉNÈRE les indicesAssiduiteDetailles », « Ce module LIT indicesAssiduiteDetailles et indicesCP ».
- Deux cartes (« Grille de référence » et « Valider ta configuration ») affirment que le dépistage « analyse tes rétroactions écrites ». Il lit les niveaux enregistrés par critère, pas le texte. (`profil-etudiant-calculs.js:895-912`)
- La carte SOLO affirme que le niveau M « prédit la réussite dans le cours suivant ». C'est une affirmation empirique dont je ne connais pas l'appui. *À ton jugement.*

## Ce que je recommande

**D'abord un seul lot de corrections factuelles par Claude Code, pour les points 1 à 8 et 10 à 14.** Ils sont mesurables, et pour le point 1 tu as déjà tranché. Deux d'entre eux (rapport de bogue, export anonymisé) touchent à ce que l'enseignant·e croit de ses données. Le patron existe : celui de l'audit du 10 septembre, avec une sentinelle qui lit la valeur dans le code plutôt que de la recopier. Pour le retrait de l'indice R, il faudra un peu de prose de remplacement, que je peux te proposer à corriger.

**Le point 2 est tranché** (15 octobre) et rejoint le lot. **Le point 9 attend ta réponse**, puisque l'application doit changer d'un côté ou de l'autre.

**Les trous viennent ensuite**, sous forme de textes proposés : d'abord le panneau « Détails » et le comparateur, les deux endroits où l'application range ou compare sans que l'Aide dise comment.

## Limites

- L'audit décrit la 1.199.0 du 11 octobre, l'Aide est celle d'aujourd'hui. Quand l'Aide est en avance sur l'audit, je l'ai comptée concordante : la colonne CAF devenue « Mesure d'aide », ou la fiche confidentielle qui « voyage avec ton codex ».
- « Concorde » veut dire que l'Aide dit la même chose que l'audit. Je n'ai pas revérifié ces 49 passages dans le code.
- Les écarts, je les ai vérifiés dans le code par lectures ciblées, sauf le point 9 (repris de l'audit) et la note d'une copie plagiée hors sommative.
- L'audit du 10 septembre partait du texte de l'Aide vers le code. Il ne mentionne pas l'indice R (mesuré : le mot « risque » n'y paraît qu'une fois, pour un filtre retiré). Hypothèse sur la raison : un balayage qui cherche des valeurs et des noms connus ne voit pas un concept entier devenu fantôme. Ici, c'est l'absence de toute trace de R dans les 103 conclusions qui m'a mis sur la piste.

## Annexe : les 103 conclusions une par une

« Dit pareil » : l'Aide dit la même chose. « En partie » : elle en dit une partie. « Rien » : elle n'en parle pas. « Autre chose » : elle dit le contraire ou autre chose (détail plus haut). « Hors champ » : mécanique interne, sans usage pour l'enseignant·e.


### En-tête, Accueil et Aide

| Conclusion de l'audit | L'Aide | Où |
|---|---|---|
| Le programme apporte lui-même un jeu de démonstration (10 étudiant·es, dont les noms sont ceux de personnalités publiques). (Q1-32) | dit pareil | popup Données démo ; section Aide › Formation |
| Un rapport de bogue (version, appareil, nombre d'étudiant·es, 20 derniers clics, erreurs ; aucun nom ni DA) est copié ou envoyé par mailto:labo@codexnumeris.org sur geste. (Q2-23) | **autre chose** | infobulle « Signaler » : ne nomme que le numéro de build |
| Des liens de soutien mènent à l'abonnement au blogue, à l'abonnement de soutien, au don et à la communauté de pratique de l'AQPC. (Q2-24) | dit pareil | infobulle Soutien |
| Les 20 derniers clics et erreurs sont gardés en mémoire ; ils n'apparaissent que dans le rapport de bogue. (Q3-24) | rien | nulle part |
| Une fenêtre de rappel de sauvegarde s'ouvre 1,5 s après le chargement s'il existe une évaluation ou un fichier. (Q4-05) | rien | nulle part (se comprend à l'écran) |
| Il existe une visite guidée. (Q4-18) | dit pareil | infobulle, popup, carte « Prendre en main » |
| Des noms de personnalités publiques servent d'étudiant·es dans la démo. (Q7-13) | hors champ | choix des noms de la démo |

### Cadre

| Conclusion de l'audit | L'Aide | Où |
|---|---|---|
| L'enseignant·e saisit le trimestre : bornes de dates, journées sans cours (A ajoute reprises et semaines spéciales). (Q1-01) | dit pareil | glossaire Trimestre ; infobulles Trimestre |
| L'enseignant·e saisit la fiche de cours : code, discipline, compétence, pondération « 2-2-3 ». (Q1-02) | dit pareil | popup « Comprendre les balises du cours » |
| Le profil de l'enseignant·e est saisi ; prénom, nom, courriel et institution sont requis. (Q1-03) | en partie | infobulle Profil ; les champs requis ne sont pas dits |
| L'horaire est saisi avec un nombre de périodes par séance, exigé. (Q1-04) | **autre chose** | popup Horaire, glossaire Horaire et section Aide décrivent encore les formats 2×2h / 1×4h, retirés |
| La liste des étudiant·es est collée ou lue d'un CSV (DA, groupe, nom, prénom, programme, SA). (Q1-06) | dit pareil | popup Groupe d'étudiant·es ; section Aide › Utilisation |
| Un·e étudiant·e s'ajoute fiche par fiche, avec CAF et date d'arrivée. (Q1-07) | dit pareil | infobulle Date d'arrivée ; section Aide (« Mesure d'aide », ex-CAF) |
| Les textes du programme emploient le DA « du collège », Omnivox et Léa. (Q1-40) | dit pareil | popups Import et Annoter |
| Les données d'identité des étudiant·es sont gardées (DA, nom, prénom, programme, SA, CAF). (Q3-03) | dit pareil | implicite partout |
| Presque toute suppression ouvre d'abord « Écrire un codex avant de supprimer ? ». (Q3-14) | en partie | popup Suppression : « si tu as un Codex récent » ; la proposition d'écrire un codex n'est pas annoncée |
| Supprimer un groupe ou un trimestre, ou tout réinitialiser, exige un codex à part et la saisie d'un nom ou de « EFFACER ». (Q3-15) | **autre chose** | infobulle Réinitialiser : « mot de passe requis » |
| Un cours qui porte des données ne peut pas être supprimé. (Q3-17) | rien | nulle part |
| Changer la session ou l'année d'un trimestre qui porte des données est refusé. (Q3-19) | en partie | popup Trimestre : « peut créer des incohérences » ; le refus n'est pas dit |
| a2026_elevesDesinscrits (DA et date) est écrit à la suppression d'une fiche ; aucun écran observé ne le lit. (Q3-20) | hors champ | clé interne sans lecteur |
| Le calendrier calcule semaines et jours de cours à partir des bornes, congés, reprises et horaire. (Q5-05) | dit pareil | glossaire, infobulles, section Aide |
| Les statuts inactif/décrochage excluent l'étudiant·e des calculs du groupe. (Q5-17) | en partie | FAQ : « Inactif » ou « Abandon » ; le statut « décrochage » n'est pas nommé |

### Conception

| Conclusion de l'audit | L'Aide | Où |
|---|---|---|
| Productions, grilles, échelles, cartouches et pratiques de notation sont saisies par l'enseignant·e. (Q1-09) | dit pareil | visite guidée, section Aide › Configuration |
| Le programme apporte des gabarits de grilles, d'échelles et de pratiques. (Q1-33) | dit pareil | popups Échelles et Bibliothèque |
| Un paquet .lcz signé (ECDSA) est produit. (Q2-19) | **autre chose** | section Aide › Utilisation : « Ressources partageables (JSON) » ; l'Introduction dit pourtant « signé » |
| Des badges d'alignement (✓ ⚠ !) et des durées (minutes → périodes, Σ de leçon) sont calculés sur la carte. (Q5-07) | en partie | popup Carte : signalements d'incohérence ; badges ✓ ⚠ ! non expliqués |
| Des sommes de pondérations sont calculées (« 70% manquant », « 5% en trop »). (Q5-08) | dit pareil | popups Productions et Grilles |

### Évaluation

| Conclusion de l'audit | L'Aide | Où |
|---|---|---|
| Des copies sont déposées en fichiers (A nomme PDF, JPEG, PNG, HEIC ; B ajoute WebP). (Q1-12) | dit pareil | popups Import ; section Aide (WebP, HEIC) |
| Chaque fichier est rattaché à un·e étudiant·e d'après le DA, le nom/prénom ou le format « LÉA ». (Q1-13) | dit pareil | popups Import et Annoter (DA, format Léa) |
| Un niveau par critère est choisi par l'enseignant·e à l'évaluation. (Q1-14) | dit pareil | partout |
| Un statut d'intégrité (« plagiat ») et des notes d'intégrité sont saisis. (Q1-15) | dit pareil | infobulle Intégrité ; section Aide |
| Des annotations sont posées sur les copies (traits, tampons, codes d'erreurs). (Q1-18) | dit pareil | glossaire Tampon ; section Aide › Annoter |
| La rétroaction générée par niveaux est rédigée au « tu », copiable ; l'étudiant·e est la personne visée. (Q2-07) | dit pareil | infobulles Rétroaction |
| Un « Dossier PDF » par étudiant·e et production est rédigé au « tu » et porte « Note provisoire — peut changer selon tes prochains travaux ». (Q2-08) | en partie | « Dossier PDF » nommé ; la mention « Note provisoire » lue par l'élève ne l'est pas |
| Les évaluations sont gardées, avec un journal horodaté. (Q3-05) | rien | le journal horodaté n'est pas mentionné |
| Les copies (blobs, miniatures) et les annotations sont gardées. (Q3-07) | dit pareil | popups Archives, Annoter |
| jetonsEtudiants est créé à la simple consultation d'une évaluation. (Q3-37) | hors champ | clé interne |
| L'enregistrement est différé de 1,5 s et se fait sans geste (évaluation, présences). (Q4-01) | dit pareil | infobulle Verrouiller ; FAQ « Mes données s'enregistrent-elles toutes seules ? » |
| « Évaluer » préselectionne groupe, étudiant·e, production, grille, échelle, cartouche (A : aussi statut de remise et intégrité). (Q4-13) | dit pareil | infobulle « Évaluer » |
| La note est recalculée et la rétroaction rédigée automatiquement à chaque niveau choisi. (Q4-14) | dit pareil | partout |
| Il n'y a pas de note tant qu'un critère est sans niveau. (Q4-24) | en partie | implicite (« attribue un niveau à chaque critère pour calculer la note ») |
| Saisir ou ajouter coûte moins de gestes que supprimer ou retirer (entrer facile, enlever coûteux). (Q4-29) | hors champ | propriété de conception, pas une consigne |
| La note d'une évaluation est la moyenne des valeurs ponctuelles des niveaux choisis (I 32, D 69,5, M 79,5, E 92,5), pondérée par les critères. (Q5-01) | en partie | popup Valeur ponctuelle (« en sommative, c'est la note ») ; la règle n'est pas énoncée |
| Une évaluation au statut « plagiat » vaut 0 et sa ligne est exclue de la moyenne de la liste. (Q5-02) | **autre chose** | section Aide › « Travail NON RECEVABLE » et infobulle Intégrité : exclu de P, « pas une note de 0 % » |
| L'enseignant·e, utilisateur·rice principal·e : organiser, saisir, évaluer, produire notes et rétroactions, repérer qui est en difficulté, garder une trace. (Q7-01) | dit pareil | À propos ; section Aide › Introduction |

### Suivi

| Conclusion de l'audit | L'Aide | Où |
|---|---|---|
| Les présences sont saisies par séance et par étudiant·e, avec des notes libres. (Q1-11) | dit pareil | popup Saisie des présences |
| Des informations « confidentielles » sont saisies par étudiant·e (parcours, défis, catégories comme « Dyslexie », notes). (Q1-19) | dit pareil | popup Confidentiel ; infobulles Profil |
| Interventions et rencontres sont saisies (participant·es, notes individuelles, bilan). (Q1-21) | dit pareil | popup Interventions ; infobulle Rencontres |
| Un service d'orthopédagogie se crée à partir d'une liste d'élèves ; un DA provisoire (commençant par 9) est attribué quand il manque. (Q1-31) | en partie | infobulle Rencontres (« en trois questions ») ; le DA provisoire n'est pas dit |
| Un tableau de bord du groupe (A, C, P, bandes, corrélations, SOLO, RàI) est montré à l'enseignant·e à l'écran. (Q2-03) | dit pareil | popup Aperçu ; visite guidée |
| Un panneau « Détails » filtre (P < 65 %, A ou C < 70 %, RàI 2-3) et range les étudiant·es par urgence. (Q2-04) | rien | qui entre au panneau « Détails » et dans quel ordre n'est dit nulle part ; la section Aide donne d'autres seuils (P < 60 %) |
| Une liste des étudiant·es montre A, C, P, profil, RàI et corrélations, pour l'enseignant·e. (Q2-05) | dit pareil | infobulles Liste |
| Un profil individuel, pour l'enseignant·e, comporte une rubrique d'accompagnement avec « Interventions recommandées ». (Q2-06) | dit pareil | popup Accompagner depuis le profil |
| Un rapport de profil en texte copiable est produit (A, C, P, notes de l'enseignant·e). (Q2-13) | en partie | infobulle : texte copiable ; popup Profil : « Exporter un rapport PDF » |
| Les présences sont gardées, avec leurs notes. (Q3-04) | dit pareil | implicite |
| Les fiches confidentielles sont gardées. (Q3-08) | dit pareil | popup Confidentiel |
| Les interventions sont gardées, avec notes individuelles, snapshotAvant et bilan. (Q3-09) | dit pareil | infobulle Bilan d'intervention (« l'avant est capturé… ») |
| Les indices A, C, P et les patterns RàI calculés sont stockés. (Q3-10) | hors champ | stockage interne |
| A, C, P et les patterns RàI sont recalculés, et réécrits si leur contenu change, au chargement ou à l'affichage du suivi. (Q4-03) | hors champ | mécanique interne |
| Aux présences, tout le monde est présent par défaut (2/2, 100 %). (Q4-07) | dit pareil | infobulle Saisie des présences |
| Verrouiller une séance non saisie compte présent·es les élèves non marqué·es. (Q4-10) | en partie | infobulle : « les élèves non marqué·es comptent présent·es » ; le verrouillage n'est pas mentionné |
| Une séance non saisie s'affiche à 100 % mais n'entre pas dans le taux A. (Q4-11) | rien | nulle part ; les définitions de A laissent croire le contraire (voir Q5-09) |
| Sans pratique appliquée, la note de cours n'est pas constructible (C = P = 0). (Q4-25) | en partie | infobulle « Appliquer » : « conditionne tous les calculs » ; C = P = 0 n'est pas dit |
| A = périodes présentes ÷ périodes offertes, sur les séances saisies seulement. (Q5-09) | **autre chose** | guide ACP, glossaire, infobulle : « depuis le début du trimestre », « présences / séances » |
| C est une part de travaux remis (calculée par la pratique active). (Q5-10) | dit pareil | guide ACP : C = remis / attendus échus |
| P = note du cours selon la pratique active (ex. moyenne pondérée pour SOM). (Q5-12) | dit pareil | guide ACP ; section Aide › Introduction |
| μ, σ, le nombre d'étudiant·es à ±1σ et le r de Pearson A↔P et C↔P sont calculés sur le groupe. (Q5-13) | en partie | corrélations expliquées ; moyenne, écart-type et ±1σ non |
| Des bandes d'engagement « Fragile / Modéré / Favorable / Très favorable » sont calculées. (Q5-14) | dit pareil | infobulle Zones de couleur, avec bornes |
| La distribution de P est calculée selon les niveaux de l'échelle. (Q5-15) | en partie | à peine évoqué |
| Des patterns SOLO (« Progression stable » … « Non-participation ») et des niveaux RàI 1-2-3 sont calculés par étudiant·e. (Q5-16) | **autre chose** | quatre patterns énumérés partout ; « Non-participation » manque ; ce qui fixe le niveau RàI a quatre versions |
| Un score d'urgence range les étudiant·es retenu·es (P, min(A, C), suivi, RàI). (Q5-18) | rien | nulle part |
| Le tirage au sort et les équipes utilisent Math.random (A : absent·es écarté·es, paires déjà formées évitées). (Q5-26) | dit pareil | infobulles Tirage ; section Aide › Tirage |
| Le graphique hebdomadaire ajoute un décalage aléatoire (±0,015) à l'affichage. (Q5-27) | rien | nulle part (mineur) |
| Ce qui est classé, ce sont des personnes (bandes, patterns, RàI, priorités). (Q5-28) | hors champ | énoncé de finalité ; l'Aide dit à la fois « pas de classer » (Introduction) et « classe automatiquement » (guide RàI) |
| Le dossier est tenu étudiant·e par étudiant·e. (Q6-02) | dit pareil | À propos ; Introduction |
| Ce que l'enseignant·e saisit : présences et niveaux/notes (A nomme aussi les copies ; B nomme aussi les rétroactions). (Q6-03) | dit pareil | Introduction (« micro-données ») |
| Le programme dérive automatiquement des indices et un classement des étudiant·es selon un besoin (d'intervention). (Q6-05) | dit pareil | guide RàI ; Introduction |
| Des données de santé ou de handicap (catégorie diagnostique comme « Dyslexie ») et le parcours scolaire peuvent être consignés. (Q7-09) | dit pareil | infobulle Diagnostic (« Confidentiel ») |

### Labo

| Conclusion de l'audit | L'Aide | Où |
|---|---|---|
| Les résultats ultérieurs d'un·e élève sont saisis dans le registre longitudinal. (Q1-22) | rien | nulle part |
| Un rapport d'analyse du bilan (score /4, % favorables) est produit, à l'écran et en PDF, pour l'enseignant·e. (Q2-17) | dit pareil | section Aide › Bilan réflexif (5 onglets) ; le glossaire le contredit (« espace pour consigner tes observations ») |
| Des rappels (sauvegarde, pause) et un « Portrait temporel » s'adressent à l'enseignant·e sur son propre travail. (Q2-26) | rien | rappels de pause et « Portrait temporel » non mentionnés |
| Un registre longitudinal garde une copie figée du dossier d'un·e élève, d'un trimestre à l'autre, avec ses résultats ultérieurs. (Q3-11) | rien | nulle part |
| La miniature d'un fichier de Modélisation supprimé reste. (Q3-34) | hors champ | résidu technique |
| Le comparateur de pratiques calcule la note finale de mêmes profils (fictifs ou groupe réel) sous plusieurs pratiques. (Q5-20) | rien | le comparateur de pratiques n'apparaît nulle part dans l'Aide |
| Des corrélations longitudinales (Pearson) sont calculées dans « Études » (B : minimum de 5 étudiant·es). (Q5-21) | dit pareil | infobulle Corrélations ; section Aide (minimum 5) |
| Le bilan calcule un score moyen /4, un % favorables et un « signal fort ». (Q5-23) | dit pareil | section Aide › Bilan (signaux forts ≥ 80 %) |
| Durée moyenne/médiane d'évaluation, tendance, charge estimée et « Portrait temporel » sont calculés. (Q5-24) | rien | seul le chrono est nommé |
| Le programme instrumente aussi le travail de l'enseignant·e (rythme, charge, bilan). (Q6-11) | en partie | chrono et bilan nommés, pas comme instrument du travail enseignant |
| Il lui sert aussi à observer son propre rythme de travail (si le chronomètre est activé). (Q7-02) | en partie | Préférences : « active le chrono d'évaluation » |

### Réglages et données

| Conclusion de l'audit | L'Aide | Où |
|---|---|---|
| Des fichiers de collègues ou de sauvegarde sont importés (JSON, paquets .lcz signés, configuration, codex .zip, codex data). (Q1-25) | dit pareil | popup Import ; infobulles Voûte et Codex |
| Un « export anonymisé » (identifiants hachés, programme, services adaptés, résultats ultérieurs) est produit avec un fichier privé de correspondance. (Q2-20) | **autre chose** | infobulle Export anonymisé : « indices A-C-P et statistiques agrégées » |
| Une archive « codex » .zip (donnees.json, travaux/, manifeste) est produite et gardée par l'enseignant·e comme sauvegarde. (Q2-22) | dit pareil | carte Codex ; glossaire Codex |
| À l'export anonymisé, une clé secrète aléatoire (32 caractères) et la table de correspondance sont créées. (Q3-22) | rien | le fichier de correspondance et la clé secrète ne sont pas annoncés |
| Le manifeste du codex enregistre l'appareil, le navigateur et le userAgent complet. (Q3-25) | en partie | carte Codex : « date, appareil, version » ; navigateur et userAgent non |
| _codex_snapshot_avant : des empreintes SHA-256 de chaque clé sont écrites à l'ouverture d'un codex. (Q3-27) | hors champ | mécanique interne |
| clesConnues garde la clé publique, les dates et le nombre d'imports de chaque collègue. (Q3-30) | en partie | infobulle Voûte : « continuité de la clé de la personne » |
| L'identifiant anonyme est un hachage SHA-256 tronqué à 8 caractères du DA et d'une clé. (Q5-25) | hors champ | mécanique interne |

### Fonctionnement général

| Conclusion de l'audit | L'Aide | Où |
|---|---|---|
| Le fichier version.json est demandé au même serveur 30 s après le chargement, puis toutes les 5 min. (Q1-36) | rien | nulle part ; compatible avec « aucune donnée n'est envoyée » |
| Rien ne quitte le navigateur sans geste de l'enseignant·e ; le seul échange automatique est GET version.json. (Q2-01) | dit pareil | Introduction (« Où vont tes données ? Nulle part ») ; carte Loi 25 |
| Un CSV « synthèse des résultats finaux » est produit (DA, nom, prénom, note arrondie, statut). (Q2-11) | en partie | popup Historique : « exporte les résultats filtrés en CSV » |
| Tout est gardé dans le navigateur : IndexedDB, avec copie dans localStorage. (Q3-01) | dit pareil | glossaire Local ; À propos |
| Des captures hebdomadaires des indices sont prises automatiquement pour la semaine courante. (Q3-12) | **autre chose** | section Aide › Utilisation : « à chaque saisie de présences » ; la carte Référence dit juste (« hebdomadaires ») |
| Les sélecteurs natifs de fichiers et de dossiers échouent dans le banc d'essai ; les chemins qui suivent n'ont pas été exécutés. (Q4-41) | hors champ | limite du banc d'essai |
