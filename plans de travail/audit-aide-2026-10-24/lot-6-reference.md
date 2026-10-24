# Lot 6 : Référence rapide (`aide-reference`), index.html:13447-14126

Base : commit 35745bd (1.216.2), lecture seule. Le clone est superficiel (historique depuis le 4 oct. 2026) : l'histoire d'un texte antérieur n'a pas été reconstituée. Les mots comptés sont ceux de l'inventaire.

**Une prémisse de la consigne est périmée.** « Suppression d'un trimestre refusée tant que le codex n'est pas à jour » : ce refus du lot I bis a été remplacé par #1007 (2 oct.). Avant les confirmations, l'application écrit un codex à part, sous un autre nom (`js/trimestre-v2-liste.js:313-346`, `Codex.ecrireAPartAvantSuppression`). Aucune entrée de ce lot ne décrit la suppression d'un trimestre.

---

### glossaire — « Glossaire — 48 termes du parcours » (index.html:13452-13464, 21 mots)
- Vrai ? : à corriger
  - Nombre de termes. Aide : « 48 termes ». Code : le catalogue affiché compte **59** entrées (`js/accompagnement-contenu-terme.js`, dénombré en exécutant le fichier). Son en-tête dit encore « 48 termes validés » (l. 3).
  - Filtres. Aide : « filtrable par étape du parcours (Numérisation → Croisement → Observation → Compétence) ». Code : sept boutons, soit Tous plus six étapes, dont « Pratiques de notation » et « Interface » (`js/accompagnement.js:1368-1376, 1499-1500`).
  - Le contenu de cette entrée, c'est `terme.js`. Erreurs qui s'y trouvent :
    - Portfolio : « ce sont les N meilleures démonstrations de compétence qui comptent » (`terme.js:72`). Artefact : « seuls les meilleurs sont retenus pour la note » (`:81`). C'est l'erreur #803, corrigée dans index.html le 10 sept. mais restée ici : `sentinelle-803` ne lit que la section Aide. Les modes réels sont N meilleurs, N derniers, Tous, Hybride (index.html:5839-5842).
    - Trimestre : « Période de 15 semaines » (`:18`). La durée découle de trois dates obligatoires (index.html:6333-6342).
    - Seuils de dépistage : « Progression 5 points » (`:337`). Le défaut est de 10 (`interpretation-config.js:28`, index.html:8875, `preferences-v2.js:465`).
    - Mode assistance : « icônes 📍 » et « activé dans les Préférences » (`:501`). Le caractère 📍 n'apparaît nulle part (index.html, `accompagnement*.js`, styles.css : 0 occurrence). Réglages › Préférences n'a pas d'interrupteur d'assistance (index.html:9326-9437). On l'active par le bouton « Assistance » de l'en-tête (index.html:3895) ou par la case « Assistance » de l'accueil (`accueil.js:260-268`).
    - Jeton : « Reprise ciblée (nouvelle tentative sur des critères spécifiques) » (`:232`). L'écran dit « Refaire UN critère spécifique » (index.html:6162).
    - Trimestres séparés : « voir Réglages > Données » (`:529`). L'import se fait dans chaque bibliothèque, par « Importer depuis un autre trimestre » (`grilles.js:2329`, `echelles.js:1127`, `cartouches.js:4071`, `pratiques-gestion.js:435`, `productions-bibliotheque-ui.js:204`).
    - Chemins « Voir : » périmés : 21 champs sur 59 (l. 220-399 et 535-563). Ils citent « Évaluations > Saisie », « Présences > Saisie », « Tableau de bord > Aperçu / Liste / Interventions / Profil », « Travaux > Annoter », « Évaluations > Jetons », « Labo > Comparateur de pratiques ». Les libellés actuels sont Évaluation › Annoter et évaluer ; Suivi › Saisie des présences / Suivi du groupe / Liste des étudiant·es / Interventions / Profils individuels ; Labo › Exploration des pratiques (`config.js:69-92`).
    - Évaluation : « attribuer un niveau de performance à chaque critère » (`:214`). Un critère analytique reçoit des points et un critère algorithmique, une formule : c'est ce que dit l'entrée « Type de critère » du même fichier.
    - Niveau RàI : « sauf ceux marqués « Aucun » » (`:327`). Cette restriction n'est vraie que si la case « Activer l'observation de la structure des résultats d'apprentissage » est cochée (#1117 suite, 20 oct. ; `profil-etudiant-helpers.js:923-938`). **Redevenu faux depuis le 15 oct.**
    - Prescription et langage hors application : Cartouche, « idéalement entre 50 et 75 mots » (`:196`) ; DEN, « PRÉN », « RREC » sans définition (`:483`).
- Sert ? : oui. Ce glossaire est la cible de « En savoir plus » quand on touche un terme souligné dans une aide (`accompagnement.js:797, 1425-1433, 1595-1607`). Le statique n'a pas ce rôle. À voir à l'écran : `afficherTermeGlossaire` appelle `afficherSection('aide')`, qui ouvre la première sous-section, l'Introduction (`navigation.js:445`). La fiche visée est dans Référence rapide, sous un accordéon fermé. « En savoir plus » n'y mènerait donc pas. Aucun test ne couvre ce chemin.
- Verdict proposé : corriger (~21 mots → ~12 : titre sans nombre ; phrase sans la liste des étapes), plus les corrections de `terme.js` listées ci-dessus.
- Motif : c'est le seul glossaire branché sur l'aide contextuelle ; il porte encore #803 et quatre valeurs fausses.
- Tests qui l'épinglent : aucun sur l'id ou le titre. Le contenu de `terme.js` est épinglé dans tests/unit/ par : sentinelle-audit-aide-15-oct-ce-que-fait-l-application, sentinelle-audit-aide-lot-B-surfaces-concordent, sentinelle-aide-apporter-mon-materiel (six définitions validées le 19 oct.), bareme-1-editeur, bareme-2-pieces-d-aide, critere-algorithmique-mots, sentinelle-textes-relus-15-oct, sentinelle-lot-29-cinq-textes-901-899, sentinelle-descriptions-denotation-343, sentinelle-carte-alignement-421-426, sentinelle-823-fenetre-analyse-rebranchee.

#### Comparaison des deux glossaires, terme par terme (statique : 36 termes ; `terme.js` : 59)

**Définitions qui divergent :**

| Terme | Statique (index.html) | `terme.js` | Code / décision |
|---|---|---|---|
| PAN | trois familles, « PAN – Standards, PAN – Spécifications et PAN – Dénotation » (13834) | STD et SPE ; « la Dénotation (DEN) est une PRÉN » (`:492`) | Les deux sont épinglés : sentinelle-803 exige « PAN – Dénotation » dans le statique, sentinelle-lot-29 (choix de Grégoire, 17 sept.) exige « PRÉN » dans `terme.js`. **À trancher par Grégoire.** |
| Pondération | poids d'une **production** dans la note finale (13840) | poids d'un **critère** dans la grille (`:187`, mots validés le 19 oct.) | Même mot, deux objets ; l'aide contextuelle renvoie toujours à la définition « critère ». |
| Sous-critère | « catégories de ce que compte un critère algorithmique » (13878, validé les 21-22 oct.) | « Élément observable… On dit aussi sous-critère » (`:131`, validé le 19 oct.) | Depuis 1.211, un critère non algorithmique a aussi des sous-critères (353834f). Deux textes validés : **à arbitrer par Grégoire.** |
| Assiduité | « Reflète l'engagement cognitif » (13741) | « Ce n'est pas un jugement sur la qualité de sa participation » (`:259`) | Contradictoires. La formule juste (séances saisies) n'est que dans le statique. |
| Échelle IDME | Insuffisant, Développement, **Maîtrisé**, Étendu (13777) | Incomplet, Développement, Maîtrise, Étendu (`:346`) | Code : Incomplet / Maîtrise (`echelles.js:82-112`). Le statique a tort. |
| Trimestre | « date de début, date de fin, et un nombre de semaines » (13885) | « Période de 15 semaines » (`:18`) | Les deux ont tort : trois dates obligatoires, nombre de semaines calculé (index.html:6333-6342, 6288). |
| Portfolio / Artefact | modalité réglée dans la pratique (13738, 13843) | « les N meilleures » (`:72`, `:81`) | Le statique est plus juste, mais sa liste de méthodes est périmée (voir plus bas). |
| Jeton / reprise ciblée | « UN SEUL critère » (13810) | « des critères spécifiques » (`:232`) | Écran : « Refaire UN critère spécifique » (index.html:6162). |
| Cartouche | « Peut être verrouillée » (13758) | « idéalement entre 50 et 75 mots » (`:196`) | Le verrou d'une cartouche est un champ inerte (`cartouches.js:1523-1524`, #864). |

**Doublons sans divergence de fond** (le statique peut partir) : Complétion / Indice C, Performance / Indice P, Production, Grille de critères (que `terme.js` dit mieux, avec les trois types), SOLO, RàI, Indice RàI / Niveau RàI, Visite guidée / Parcours guidé, Jetons.

**Seulement dans le statique**, avec leur état :
- Exacts, absents de `terme.js`, à y porter :
  - Codex, mais corriger « menu Codex, en haut à droite » (13761) : le bouton est à gauche (index.html:3815-3818).
  - Anonymisation (`modes.js` : « Élève N » ; bouton du masque, index.html:3889).
  - Bac à sable (Démo), sous le nom affiché « Données démo » (`accueil.js:274`).
  - Local (stockage).
  - SRPNF (épinglé).
- Faux ou périmés :
  - Calendrier complet : « début à fin + 10 jours » ; le calendrier va du début du trimestre à sa fin (`trimestre.js`, `genererCalendrierComplet`). Terme interne, absent de l'écran.
  - Congé imprévu / Congé prévu : l'écran dit « Journées sans cours », de nature Institutionnel, Férié ou Personnel (index.html:6400-6424). « N'affecte pas le calcul des semaines » est faux : un jour institutionnel ou férié ne compte pas dans la numérotation des semaines (`trimestre.js`, boucle de `numSemParDate`). Seule la légende garde « Congé prévu » (`calendrier-vue.js:528`).
  - Jetons de délai : « par défaut : 7 jours ». Le défaut est 2 (index.html:6114, `pratiques-gestion.js:1309, 1708`).
  - Jetons de reprise ciblée : « par défaut : M - Maîtrisé, 75-84 % ». Il n'y a pas de défaut (`pratiques-gestion.js:1320, 1712`).
  - Mode provisoire / final : l'écran dit « Notes finalisées » (index.html:5785-5788). « sinon retourne 0 » est faux : un manque d'artefacts déclenche le plafonnement de conformité, s'il est réglé (`profil-etudiant-actions.js:304-327`) ; le mode final agit sur le titre du PDF et, en hybride, sur les obligatoires non remises (`:476-482`).
  - Verrouillage : « productions, grilles de critères, échelles ». Le verrou d'une production a été retiré le 15 oct. (#489, 8a79d7d), **redevenu faux depuis l'audit**. Restent le verrou d'un critère (`grilles.js:1185`), celui d'une évaluation, et celui d'une séance (« Verrouiller la saisie », 67298d0).
  - Portfolio : « les meilleurs parmi les récents ». Ce mode n'a plus d'option à l'écran (`portfolio.js:118-119`), et « Hybride » manque (index.html:5842).
  - Grille de critères : pondérations SRPNF « 15/20/10/25/30 ». Aucune grille du pack démo n'a ces valeurs (20/20/15/25/20, `pack-demo-10.js`, `grillesTemplates`). La grille semée hors démo est la « Grille de départ », à quatre critères égaux (`grilles.js:1644-1670`).
  - Échelle IDME : « voir Conception → Pratiques de notation ». Les échelles sont dans Conception › Échelles de performance (`config.js:60`).
- Encastrement de la pratique de Grégoire :
  - ELLAC : « L'application s'en inspire pour l'organisation des activités et des séquences dans le module Alignement pédagogique » (13780). Le code dit le contraire : « AUCUN VOCABULAIRE DISCIPLINAIRE ICI… (littérature, ELLAC…) » (`planification-export.js:1789-1791`).
  - Échelle IDME : « Utilisée dans la pratique PAN – Standards ». L'échelle sert toute pratique qui a des critères holistiques.
- Sans usage à l'écran : Séances complètes, Single Source of Truth (anglais, triple doublon avec `ssot` et `architecture`), Suivi de l'apprentissage (théorie, rangé sous « M »). « Visite guidée » est rangé sous « P ». La note finale du glossaire (13896-13898, ~25 mots) est un renvoi.

**Absents des deux glossaires**, alors que ce sont des mots tranchés par Grégoire : *clos*, *archive / aux archives*, *Faire revenir*, *réassigner*, *observation* (critère algorithmique). Les ajouter, c'est écrire de la prose neuve : à proposer à Grégoire.

### glossaire-statique — « Glossaire des termes » (index.html:13722-13902, 1770 mots)
- Vrai ? : à corriger. 17 termes sur 36 portent un écart (détail dans le tableau ci-dessus) :
  - valeurs fausses : délai 7 jours, plafond M, « + 10 jours », noms de l'échelle IDME, pondérations SRPNF, « retourne 0 » ;
  - fonctions retirées ou inertes : verrou des productions, verrou des cartouches ;
  - vocabulaire périmé : Congé imprévu, Mode provisoire, Bac à sable ;
  - chemins : Codex « en haut à droite », IDME « Pratiques de notation » ;
  - affirmation ELLAC contredite par le code ;
  - définitions contradictoires avec `terme.js` : PAN, Pondération, Assiduité, Sous-critère ;
  - règle RàI incomplète depuis #1117 (13794, 13859).
  - Forme : « étudiant » non inclusif à 13735, 13738, 13741, 13748, 13764.
- Sert ? : non comme second glossaire. ~1 000 mots doublent `terme.js`, l'Introduction ou d'autres cartes : Indice RàI et RàI répètent la même phrase deux fois dans ce glossaire, et une troisième fois dans `terme.js` ; viennent ensuite SSOT, Jetons ×4, Suivi de l'apprentissage. ~300 mots portent sur des termes absents de l'écran. Il n'est relié à aucun terme souligné.
- Verdict proposé : fusionner avec glossaire (~1 770 mots → 0 dans le HTML ; ~500 mots portés dans `terme.js` : Codex, Anonymisation, Données démo, Local, Journée sans cours et Reprise, Verrouillage, SRPNF, Sous-critère, formule de A, Notes finalisées, méthodes du portfolio).
- Motif : deux glossaires qui se contredisent sur PAN, Pondération et Assiduité laissent l'utilisateur sans réponse ; un seul est relié à l'aide contextuelle.
- Tests qui l'épinglent (tests/unit/) : sentinelle-803-aide-pan-famille-pas-mecanique (PAN 13834, « modalité de sélection que tu as réglée » 13738) ; sentinelle-audit-aide-lot-E-exemples-restent-des-exemples (SRPNF 13875, seule occurrence) ; sentinelle-audit-aide-15-oct-ce-que-fait-l-application (« Séance non saisie » 13741 et « Parcours en 7 étapes » 13849, seules occurrences dans l'Aide ; la phrase RàI, 13794 et 13859, est comptée au moins trois fois) ; critere-algorithmique-mots (Sous-critères, 13877-13878, test G1). Une fusion déplace ces ancres ; les tests de 803 et de lot-29 se contredisent sur PAN.

### seuils-critiques — « Seuils critiques d'alerte » (index.html:13465-13481, 39 mots)
- Vrai ? : à corriger
  - Aide : « Règle d'or : Un étudiant avec un indice < 70 % nécessite UNE action ». Code : 70 % n'est que la borne de départ « acceptable », réglable (`interpretation-config.js:58`, Labo › Outils d'observation). La phrase prescrit, alors que l'application parle au conditionnel ; elle fige un seuil réglable et n'est pas inclusive.
- Sert ? : non. La première phrase (~25 mots) ne fait que renvoyer à `diagnostics` (12825), comme la FAQ des seuils (13713).
- Verdict proposé : couper (~39 → 0)
- Motif : un renvoi et une règle prescriptive en dur, sans geste à faire.
- Tests qui l'épinglent : aucun.

### architecture — « Une donnée, une seule source (rappel) » (index.html:13482-13520, 62 mots)
- Vrai ? : à corriger
  - « Évaluations » au pluriel : l'onglet s'appelle « Évaluation » (index.html:4114). « Aperçu » et « Profil étudiant » s'appellent maintenant Suivi du groupe et Profils individuels (`config.js:69, 72`). C et P ne viennent pas de l'onglet Évaluation : ils sont calculés par la pratique de notation (`js/pratiques/*.js`). L'entrée `ssot` (10484) dit la même chose inexacte.
- Sert ? : non. C'est un doublon de `ssot` (10475-10490), qui donne le même exemple (A à la Saisie des présences, C et P « aux Évaluations ») ; c'en est aussi un du glossaire « Single Source of Truth » (13868). Le titre dit lui-même « (rappel) ».
- Verdict proposé : couper (~62 → 0)
- Motif : troisième description d'un principe de conception qui ne commande aucun geste.
- Tests qui l'épinglent : aucun.

### problemes — « Résolution de problèmes courants » (index.html:13521-13562, 130 mots)
- Vrai ? : à corriger
  - Calendrier vide. Aide : « Aller dans Cadre → Trimestre → Régénérer le calendrier ». Code : aucun bouton de ce nom. Le seul « Régénérer » de l'interface régénère la rétroaction (index.html:8701, `regenererRetroactionAvecFeedback`). Le calendrier se régénère tout seul quand les trois dates obligatoires sont remplies (`trimestre-v2-init.js:437-446`, `data-on-change="sauvegarderCadreCalendrierV2"`, index.html:6334-6342).
  - « Invalid Date » : « Bug connu lié à un conflit interne ». Aucune fiche ouverte dans SUIVI-BUGS.md ni BACKLOG.md (`grep "Invalid Date"` = 0) : à voir à l'écran. La solution renvoie au même bouton inexistant.
  - Indices A non calculés : le chemin Suivi › Saisie des présences existe. « Saisir au moins une présence » : A ne compte que les séances saisies, et l'écran nomme le geste « Confirmer la séance » (`saisie-presences.js:1126-1150`). À voir à l'écran si une seule présence suffit.
  - Données perdues : exact (« Ouvrir un codex… », index.html:3827).
- Sert ? : oui pour « Données perdues » et « Indices A ». « Invalid Date » double la FAQ (13646-13659). La prévention, « mettre ton codex à jour », figure aussi dans la FAQ (13616), dans `export-import` (13926) et dans le glossaire Local (13817).
- Verdict proposé : resserrer (~130 → ~70), avec la correction du geste pour le calendrier
- Motif : deux des quatre solutions renvoient à un bouton qui n'existe pas.
- Tests qui l'épinglent : tests/unit/sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js exige que « Régénérer » figure dans l'Aide. Ses deux seules occurrences sont 13532 et 13654. Ce test est un faux vert : il trouve « Régénérer » dans l'interface grâce au bouton de rétroaction.

### faq — « Questions fréquentes (FAQ) » (index.html:13563-13721, 880 mots)
- Vrai ? : à corriger (cinq questions sur dix)

| Question (mots) | Exacte ? | Doublon | Proposition |
|---|---|---|---|
| A, C, P (~100) | non. « présence physique et **cognitive** » : A compte des périodes de présence sur les séances saisies | `acp` (10119), glossaire ×2, `terme.js` ×4 | couper |
| RàI (~130) | en partie. « sauf ceux marqués « Aucun » » n'est vrai que si l'observation SOLO est cochée (#1117 suite, `profil-etudiant-helpers.js:923-938`) ; les 80/15/5 % relèvent de la théorie | `rai` (10149), glossaire ×2, `terme.js` ×2 | couper |
| Enregistrement automatique (~150) | oui : témoin « Enregistré » en bas (`temoin-enregistrement.js` ; styles.css:6302-6304) ; garde des fiches (`ui-dialogues.js:410`) | liste « perdues si… » = `export-import` 13933, glossaire Local 13817, `problemes` 13553 | resserrer (~90) |
| Plusieurs appareils (~63) | oui (`.zip`, `codex.js:31` ; menu, index.html:3826-3837) | flux de travail de `codex` (13976-13981) | garder. Signaler à Grégoire : « courriel » comme moyen de transfert d'un fichier de données nominatives côtoie l'encadré Loi 25 (13938) |
| Hors ligne (~39) | en partie. Exact pour le fichier local (`init-inline.js:295`) ; la conversion HEIC n'y est pas offerte (`heic-decodeur.js:81`) ; la version hébergée sans connexion est à voir à l'écran. `presentation` (10032) le dit plus juste : « Une fois la page ouverte… » | `presentation` 10032, `apropos` | couper |
| « Invalid Date » (~49) | non. Pas de champ « nb semaines » (trois dates, index.html:6333-6342) ; pas de bouton « Régénérer » pour le calendrier | `problemes` 13546-13550 | couper (garder dans `problemes`) |
| Ordre de configuration (~73) | en partie. Omet Pratiques de notation, sans laquelle aucune note n'est constructible ; l'astuce « exporter tout le matériel » est dépassée par « Importer depuis un autre trimestre » | `etapes-config` (10591), `checklist` (11213) | couper |
| Abandon (~53) | non. Colonne « Remarque », choix « Inactivité » / « Décrochage » (`trimestre-v2-etudiants.js:377, 409-413`). L'étudiant·e reste visible, grisé·e, et n'est retiré·e que des statistiques du groupe (`etudiants.js:636-640`, `main.js:105-114`) ; on réactive avec « Aucune » | aucun | corriger (~40) |
| Pondération ≠ 100 % (~69) | en partie. « Le calcul de la note finale nécessite… exactement 100 % » : en sommative, P se normalise sur la somme des pondérations des productions évaluées (`pratique-sommative.js:101-104`) ; l'écran signale « manquant / en trop » sans bloquer (`productions.js:2794-2814`) | glossaire Pondération | corriger (~40) |
| Seuils A, C, M (~77) | oui (défauts lus par la sentinelle) ; le titre dit « M », le texte ne traite que de A et de C | `diagnostics` | garder |

- Sert ? : ~390 mots doublent l'Introduction ou d'autres cartes (A/C/P, RàI, ordre, hors ligne) ; ~50 mots doublent `problemes`.
- Verdict proposé : resserrer (~880 → ~310)
- Motif : la moitié des questions répète une carte voisine, et quatre réponses décrivent un geste ou une règle que le code ne fait pas.
- Tests qui l'épinglent (tests/unit/) : sentinelle-audit-aide-15-oct-ce-que-fait-l-application, sur la question des seuils (13710-13716), sur « Transférer le fichier codex » (13626) et sur la phrase RàI (13595), comptée au moins trois fois dans l'Aide : 10178, 10332, 13595, 13794, 13859. Couper la FAQ RàI et le glossaire statique en laisserait deux : seuil du test à revoir. Aussi sentinelle-audit-aide-lot-A-chemins-et-libelles (« Régénérer », 13654).

### export-import — « Ouverture et partage de tes données » (index.html:13903-13950, 325 mots)
- Vrai ? : à corriger
  - « Partage entre trimestres : Utilise l'export de configuration pédagogique… ». Le geste prévu est « Importer depuis un autre trimestre », dans chaque bibliothèque (`grilles.js:2329` etc. ; popup `import-autre-trimestre`, `accompagnement-contenu-popup.js:1785`).
  - Navigation (Réglages › Données, `config.js:104`), les deux options et « Captures hebdomadaires + interventions » (index.html:9644-9651) : exacts.
  - Mot tranché : l'encadré Loi 25 dit « les données de tes **élèves** » (13938). Texte approuvé par Grégoire (#862) et épinglé mot pour mot : **à lui de trancher**.
- Sert ? :
  - « Deux options » (~45 mots) et la phrase « Pour mettre ton travail en sûreté… » redisent l'écran presque mot pour mot (index.html:9479, 9486-9504 ; infobulles `donnees-codex`, `donnees-codex-ouvrir`, `donnees-config-export`).
  - L'avertissement « Important » (13932-13934, ~35 mots) répète la FAQ, le glossaire Local et l'encadré Loi 25 qui le suit.
  - « Captures (Snapshots) » (~30 mots, anglicisme) double `snapshots` (12105, 457 mots).
  - Les cartes Archives, Codex data et Partage (.lcz) de la même page d'écran ne sont pas évoquées.
- Verdict proposé : resserrer (~325 → ~150 : l'encadré Loi 25 et deux lignes)
- Motif : ce qui n'est pas l'encadré Loi 25 répète l'écran ou une autre carte, et le conseil entre trimestres est dépassé.
- Tests qui l'épinglent : tests/unit/sentinelle-862-aide-loi-25.test.js (titre de la carte, encadré mot pour mot, lien, contact).

### codex — « Le Codex — Espace de travail portable » (index.html:13951-14001, 426 mots)
- Vrai ? : à corriger
  - Aide : « Pour archiver l'historique d'un trimestre terminé, utilise plutôt les Archives (menu Codex → « Archiver ») ». Code : « Archiver… » du menu archive **un groupe-cours** (fenêtre « Archive d'un groupe-cours », index.html:14857-14858). L'archive d'un trimestre entier se fait par Cadre › Trimestre, bibliothèque, trimestre **clos**, « Archiver le trimestre… » (`trimestre-v2-liste.js:226-228`, `reserve-trimestre.js:53`). Le mot tranché est « clos », pas « terminé ».
  - Menu. « Archiver » s'écrit « Archiver… ». « dans tes archives locales (voir l'onglet Archives) » : c'est un accordéon, « Archives (dépôt local) », dans Réglages › Données (index.html:9516-9519). Les items « Détails du codex », « Comparer avec un codex… » et « Charger un codex data… » ne sont pas nommés (index.html:3843-3864). Fusionner, Comparer, Détails et Fermer n'apparaissent qu'avec un codex actif (`codex.js:3177-3196`).
  - Absents : « Vérifier », « Faire revenir », « Renvoyer aux archives… », « Archiver les copies… », « Terminer le renvoi » (`reserve-reglages.js`, `reserve-copies.js:83`, `reserve-renvoyer.js:78`). Aucune entrée du lot ne décrit ce cycle. Le combler, c'est de la prose neuve.
  - « copie de secours » : absent (conforme). « Ton codex est à jour » / « n'a pas tes derniers changements » : exact (`codex.js:3148`). Chrome et Edge réécrivent le fichier, Safari en télécharge un nouveau : exact (`codex.js:3201-3209`).
- Sert ? :
  - « Qu'est-ce qu'un Codex ? » (~60 mots) redit le paragraphe d'ouverture ; le « manifeste » est un détail technique, incomplet par ailleurs (navigateur et userAgent, `codex.js:591-592`).
  - « Ton codex est-il à jour ? » (~45 mots) double la FAQ (13607) et l'infobulle `entete-codex`. Le flux typique (~80 mots) double la FAQ « Plusieurs appareils ».
- Verdict proposé : resserrer (~426 → ~220), en corrigeant le renvoi aux archives
- Motif : la carte renvoie le trimestre entier à un geste qui ne traite qu'un groupe-cours, et elle se répète trois fois.
- Tests qui l'épinglent : aucun.

### ressources — « Ressources et documentation » (index.html:14002-14071, 441 mots)
- Vrai ? : à corriger
  - « Détails complets : Voir LICENSE.md dans le dépôt du projet » : aucun lien, et le dépôt n'est pas accessible depuis l'application. Le détail des licences est à l'écran dans Réglages › À propos.
  - Liens externes :
    - eduq.info, trois PDF, références bibliographiques (14012, 14014, 14016) ;
    - cdc.qc.ca, rapport PAREA (14018) ;
    - codexnumeris.org/apropos (14043).
    - Ailleurs dans le lot : codexnumeris.org/labo-codex-ou-vivent-vos-donnees (13938).
    - Les cinq liens de cette carte n'ont pas `rel="noopener noreferrer"`, contrairement à 13938 et à l'accueil.
  - Lien qui tient lieu d'explication : le site Labo Codex, présenté par « Approche systémique complète » et « Ressources additionnelles et outils ». Ces deux puces renvoient l'approche au site, alors que l'Aide l'explique (`presentation`, `monitorage`). Les quatre liens bibliographiques sont des sources, pas des explications manquantes. Le lien Loi 25 complète un encadré qui dit l'essentiel.
- Sert ? : le bloc « Licence et partage » (~70 mots) double l'écran Réglages › À propos (licences, « En pratique ») et l'entrée `apropos`. La bibliographie (~317 mots) est de la référence théorique ; aucune carte n'y renvoie.
- Verdict proposé : resserrer (~441 → ~330 : retirer les deux puces du site et le bloc licence, remplacer LICENSE.md par « Réglages › À propos »)
- Motif : seule la bibliographie n'existe nulle part ailleurs.
- Tests qui l'épinglent : tests/unit/sentinelle-audit-aide-lot-E-exemples-restent-des-exemples.test.js exige au moins une mention « Bédard » dans l'Aide, marquée par « Pédagogie collégiale » ou par l'année ; ce sont les entrées 14014 et 14016. Couper la bibliographie le ferait échouer.
- Noms de personnes : seulement des auteur·rices publié·es et le développeur, déjà jugés conformes par le lot E (10 sept.). Aucun nom d'élève.

### apropos — « À propos de l'application » (index.html:14072-14126, 86 mots)
- Vrai ? : à corriger
  - Aide : « Aucune dépendance externe sauf Chart.js ». Code : l'application charge, en copies locales, Chart.js et son greffon d'annotation, jsPDF et jspdf-autotable, pdf.js, JSZip et html2canvas (index.html:14167-14353), plus libheif (`libs/libheif-bundle.js`). « Aucune dépendance réseau » serait exact.
  - Version (`init-inline.js:246`) et renvoi à Réglages › À propos (`config.js:105`) : exacts.
- Sert ? : non. Version, auteur et licences sont dans Réglages › À propos (écran), qui en dit plus. Ligne Technologies : langue technique. La citation finale n'est pas attribuée.
- Verdict proposé : couper (~86 → ~15 : une ligne de renvoi vers Réglages › À propos)
- Motif : doublon d'un écran, avec une affirmation technique fausse.
- Tests qui l'épinglent : aucun.

---

## Trouvé en chemin (hors des entrées, pour inscription)
- Faux vert : `sentinelle-audit-aide-lot-A` vérifie que « Régénérer » existe dans l'interface, et le trouve grâce au bouton de rétroaction (index.html:8701). L'Aide renvoie ce mot vers le calendrier.
- La phrase RàI « sauf ceux marqués « Aucun » » est aussi à 10178 et 10332, hors de ce lot. Depuis #1117 suite (20 oct.), elle est incomplète.
- Texte d'écran, Réglages › Données : « Triple confirmation requise + mot de passe «EFFACER» » (index.html:9722). Le code fait : un codex à part, deux confirmations, « EFFACER » (`import-export.js`, `reinitialiserDonnees`). C'est le point 10 du 15 oct., corrigé dans l'infobulle mais pas à l'écran.
- `modes.js` affiche « Élève N » en mode anonymisé. Le mot affiché tranché est « étudiant·e » ; c'est du code, pas l'Aide.
- « En savoir plus » d'un terme souligné mène probablement à Aide › Introduction plutôt qu'à la fiche (voir `glossaire`) : à voir à l'écran.

## Bilan du lot

| Verdict | Entrées |
|---|---|
| corriger | 1 (glossaire) |
| resserrer | 5 (problemes, faq, export-import, codex, ressources) |
| couper | 3 (seuils-critiques, architecture, apropos) |
| fusionner | 1 (glossaire-statique → glossaire / `terme.js`) |
| garder tel quel | 0 |

**Mots** : ~4 180 aujourd'hui → ~1 100 dans le HTML de la sous-section, plus ~500 mots portés dans `js/accompagnement-contenu-terme.js`.

**Les trois constats qui comptent le plus**
1. **Les deux glossaires se contredisent, et des tests épinglent chacun des deux côtés.** Sur PAN, sentinelle-803 et sentinelle-lot-29 exigent l'une « PAN – Dénotation », l'autre « PRÉN ». Ils divergent aussi sur Pondération, Sous-critère et Assiduité. `terme.js`, le seul relié à l'aide contextuelle, porte encore l'erreur #803 (« les N meilleurs »), un faux défaut (Progression 5 au lieu de 10) et 21 chemins périmés. Le statique porte six valeurs fausses (délai 7 jours, plafond M, « + 10 jours », noms IDME, pondérations SRPNF, « retourne 0 »). Aucun des deux ne définit codex, clos, archive ni Faire revenir. Les arbitrages PAN et sous-critère relèvent de Grégoire.
2. **La solution du calendrier renvoie à un bouton qui n'existe pas**, dans `problemes` et dans la FAQ. Le banc du lot A reste vert grâce au bouton « Régénérer » de la rétroaction. Les deux glossaires décrivent aussi le trimestre par « date de fin et nombre de semaines » ou « 15 semaines » ; l'écran demande trois dates.
3. **Ce qui a changé depuis le 15 octobre a déjà rendu trois textes faux, et le cycle des archives n'est décrit nulle part dans le lot.**
   - La règle RàI a changé (#1117 suite, 20 oct.) : trois endroits dans le lot, deux hors lot.
   - Le verrou des productions a été retiré (#489, 15 oct.).
   - `codex` envoie l'archive d'un trimestre vers « Archiver… », qui ne traite qu'un groupe-cours. Clos, Archiver le trimestre, Vérifier, Faire revenir et Renvoyer aux archives restent sans explication.
