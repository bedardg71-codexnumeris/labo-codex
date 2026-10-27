# Demande de relecture – L'Aide, lot 2a : Commencer et Cadre (#1152)

> Claude Code, mardi 27 octobre 2026, sur `main` (base `ef55001b`, le commit de docs du §0). Consigne : `CONSIGNE-LOT-2026-10-27-aide-lot-2a-commencer-cadre.md`. Non poussé, pas de release.
> Les lignes `index.html:N` sont celles de l'arbre livré ; les preuves dans `js/` sont au HEAD (`2fef338a` pour le code, que ce lot ne touche pas).

## En bref

- Commencer et le Cadre passent de **15 entrées à 11, plus 2 neuves** (« La bibliothèque », « Les chaînes d'étapes »).
- **2 309 mots → 1 443** (mesurés : texte visible des 17 ids, commentaires retirés). La cible estimée était ~1 300 ; l'écart vient surtout de « La bibliothèque » (295 mots, dont ~170 de texte validé recopié mot pour mot).
- **Aucun fichier `js/` touché** ; donc pas de bloc de jetons à refaire. `js/config.js` et `js/navigation.js` : non touchés.
- Tests : Vitest complet **9 948 / 9 948** ; sentinelles de l'Aide 184/184 ; Playwright ciblé **8/8** (la spec neuve et les quatre specs de l'Aide nommées par la consigne). Le verdict complet n'est pas lancé (attend le signal de Grégoire).

## Entrée par entrée

| # | Id | Titre | Mots avant → après | Ce qui a changé |
|---|---|---|---|---|
| 1 | `presentation` | Présentation de l'application | 646 → 128 | D1 : ne reste que « Où vont tes données ? » (« un collègue » → « un·e collègue »). Ajout de la phrase venue de `monitorage`, recalée (voir « Pour Grégoire »). |
| 2 | `prise-en-main` | Prendre en main l'application | 130 → 93 | Une ligne par outil ; Assistance dit sa portée réelle et son bouton d'en-tête ; renvoi cassé corrigé (« Étapes de configuration », dans le Cadre). |
| 3 | `demo` | Explorer la démonstration | 186 → 122 | Activation (une case « Données démo »), arrivée (Suivi › Suivi du groupe), « 9 cartouches » au lieu de 3, 101 évaluations ; la phrase validée du provisoire ; la sortie (bandeau ou case). Slogan, « Recommandation » et « passe en Mode Normal » retirés. |
| 4 | `modes` (+ `modes-formation`) | Le mode anonymisé | 141 + 98 → 92 | Fusion. Emplacement mesuré à l'écran ; « Afficher DA réels » ; écrit dans les vraies données ; la démo n'est pas un mode. Pseudonymes « Élève 1 » inchangés (D6 attend Grégoire). |
| 5 | `bibliotheque` (neuve) | La bibliothèque | 0 → 295 | Les quatre listes de la popup validée, mot pour mot ; tampons ; listes simples. |
| 6 | `chaines-etapes` (neuve) | Les chaînes d'étapes | 0 → 117 | Tout neuf. |
| 7 | `preferences` | Personnaliser les préférences | 140 → 106 | Les cinq cartes réelles ; thème clair par défaut ; la case des chaînes ; « Options de thème » et « Aide contextuelle » (réglages absents) retirés ; la note Labo › Outils d'observation gardée. |
| 8 | `etapes-config` (+ `trimestre`, + définition de `groupe-cours`) | Étapes de configuration | 103 + 161 + 156 → 152 | Les six accordéons dans l'ordre de l'écran, la chaîne, la rangée, les trois résumés ; le groupe-cours en une définition juste ; #1038. « Workflow », « dropdown », « modal », l'astuce « La carte suivante… » partis. |
| 9 | `cours` | Configurer le cours | 65 → 45 | Libellés de l'écran (nom du cours, heures d'enseignement = total) ; nature et discipline ; les deux lignes d'horaire passent à `horaire`. L'exemple « 601-101-MQ » part (aucun exemple propre à une discipline). |
| 10 | `horaire` | Établir l'horaire | 60 → 57 | La reprise se déclare ; « Groupe associé » ; les périodes, venues de `cours`. |
| 11 | `etudiants` (+ `groupe`) | Gérer la liste des étudiant·es | 147 + 51 → 102 | Fusion ; « Mesure d'aide » sans l'historique ; l'écran d'aujourd'hui (rangée, bande, trois boutons en tête) ; « Groupe » = numéro du groupe. |
| 12 | `presences-calendrier` | Lire le calendrier scolaire | 85 → 43 | Titre ; couleurs = type de journée et échéances ; tous les mois ; le clic ouvre la saisie. |
| 13 | `archivage` | Qu'est-ce que clore un trimestre ? | 140 → 125 | Première phrase inchangée (épinglée) ; le chemin d'aujourd'hui ; le trimestre actif ne se clôt pas ; « Clos (n) », « Rouvrir » ; « Permission d'écriture ». La capture des ressources et l'encadré « Important » partis ; « Quand clore ? » gardé. Aucun mot en « archiv ». |

## Preuves (fichier:ligne)

**Commencer**
- Données locales, hors-ligne, signature exigée : `js/partage-import.js:700, 707` ; licence CC BY-NC-SA : `js/cc-license.js:17`.
- Ce que l'application sème : « Grille de départ » `js/grilles.js:1753` ; « Échelle de départ (IDME) » `js/echelles.js:376` ; « Cartouche de départ » `js/cartouches.js:162` (si la grille de départ existe, l. 149). SRPNF n'existe que dans la démo (aucun gabarit hors `js/pack-demo-10.js`).
- Assistance : carte d'accueil « Info-bulles, aide à l’écran et visite guidée. » `js/accueil.js:263-264` ; bouton d'en-tête `index.html:3902` (« Assistance »). Visite guidée : `index.html:3901`. « Données démo » : `js/accueil.js:274`.
- Démo, compté au HEAD (aucun commit sur le pack depuis le 20 oct.) : 10 DA, 11 productions (1 portfolio, 9 artefacts, 1 terminale), 101 évaluations, 32 dates du 2025-08-25 au 2025-12-10, 3 grilles, 2 échelles, 9 cartouches (4 + 4 + 1) — `js/pack-demo-10.js` exécuté ; carte : `js/demo-namespace.js:56-58`. Arrivée : `js/demo-activation.js:373-376`. Bandeau, « Quitter la démo » : `index.html:3993-4000`. Phrase du provisoire : `js/accompagnement-contenu-popup.js:1265`. « Tes vraies données reviennent » : popup, l. 1289. Démo en mode normal : `js/demo-activation.js:314-315`.
- Mode anonymisé : bouton au masque, première ligne `index.html:3896` (titre « Mode normal / anonymisé ») ; menu ⋯ › « Anonymisation » `index.html:3940-3942`, sous 1 024 px (`styles.css:1446, 1481`) ; captures ci-dessous. « Élève N » `js/modes.js:368` ; « Gr. A » `js/modes.js:1405` ; « Afficher DA réels » `index.html:4012` ; textes libres masqués `js/evaluation.js:1449`, fiche confidentielle popup l. 1691 ; écriture dans les vraies données `js/modes.js:844-890`.
- Bibliothèque : popup `js/accompagnement-contenu-popup.js:404-445` ; les six fenêtres qui l'ouvrent : `js/cartouches.js:3928`, `js/echelles.js:1123`, `js/grilles.js:2416`, `js/pratiques-gestion.js:427`, `js/planification-bibliotheque.js:199`, `js/productions-bibliotheque-ui.js:275`. Tampons : bouton de la palette `js/travaux-outils.js:2058` ; « Dans ta palette » `js/tampons-bibliotheque.js:459` ; « Utiliser dans ma palette » l. 437. Listes simples : cours `js/cours.js:319, 331, 349` ; groupes-cours `js/trimestre-v2-groupes-cours.js:1072, 1079, 1101` ; trimestres `js/trimestre-v2-liste.js:222, 263` ; boutons « Consulter la bibliothèque » `index.html` (accordéons Trimestre, Cours et services, Groupe-cours : dans la rangée de chacun).
- Chaînes : composant `js/chaine-etapes.js:1-30, 122-126` ; appelants `js/trimestre-v2.js:575`, `js/productions.js:2283`, `js/grilles.js:1345`, `js/echelles.js:2391`, `js/cartouches.js:1426`, `js/pratiques-gestion.js:1148`, `js/planification-carte.js:2237`, `js/atelier-algo.js:835`. « Le clic conduit, il n'agit pas », « Méthode » rouvre l'assistant : `js/pratiques-gestion.js:1158-1166`. Carte : `ouvrirGuide(idEtape)`, `js/planification-carte.js:2239`. Trimestre : `ouvrirAccordeonDeLEtape`, `js/trimestre-v2.js:589`. Case : `index.html` (Préférences, « Afficher les chaînes d'étapes », cochée par défaut) ; `js/preferences.js:71` ; masque toute `.barre-convergence` : `styles.css:6496`.
- **La case et le critère algorithmique (mesuré, demandé par la consigne)** : l'atelier dessine sa chaîne par `ChaineEtapes.dessiner` (`js/atelier-algo.js:835`), qui pose la classe `barre-convergence` (`js/chaine-etapes.js:126`) ; la case la masque donc aussi, avec les crayons qui montrent où poser un bloc. Les cinq étapes restent atteignables : chaque titre d'étape est un bouton qui l'ouvre (`js/atelier-algo.js:705, 868-874`). C'est ce que dit l'entrée.
- Préférences : cartes Expérience visuelle, Navigation, Outils de saisie, Système d'information scolaire, Sécurité (`index.html`, section `reglages-preferences`) ; thème clair par défaut `js/preferences.js:78`.

**Cadre**
- Six accordéons, titres : Trimestre, Cours et services, Enseignant·e, Groupe d'étudiant·es, Horaire, Groupe-cours (`index.html`, accordéons de Cadre › Trimestre) ; chaîne `index.html:6199`, clic `js/trimestre-v2.js:575, 589`.
- Rangées : « Consulter la bibliothèque » pour Trimestre (`index.html:6213`), Cours et services (6421), Groupe-cours (7203) ; « + Nouveau trimestre » (6220), « + Nouveau cours » (6428), « + Nouveau profil » (6699), « + Nouveau groupe » (6936), « + Nouvel horaire » (7109), « + Nouveau groupe-cours » (7210).
- Trois résumés : Trimestre (`index.html:6223-6227`), Groupe d'étudiant·es (6939-6950), Groupe-cours (`js/trimestre-v2-groupes-cours.js:492-496`).
- Groupe-cours : « 5 éléments obligatoires : trimestre, cours, numéro de groupe, horaire et enseignant·e. La pratique de notation est facultative. » `index.html:7196` (le texte change pour un service, `data-mot-nature`) ; un seul actif `js/trimestre-v2-groupes-cours.js:1066, 1086` ; menu de l'en-tête `index.html` (`selectGroupeCoursHeader`, ligne 2 de l'en-tête). #1038 : `js/trimestre-v2-groupes-cours.js:761-792, 849`.
- Cours : Nature (6453), Code du cours * (6465), Nom du cours (6469), Pondération * (6487), Heures d'enseignement, « Total d'heures d'enseignement (RREC) » (6492-6494), Discipline * (6501).
- Horaire : « Groupe associé » * (`index.html:7126`) ; séance sans périodes refusée `js/trimestre-v2-horaires.js:901` ; les périodes font l'assiduité `js/indices.js:394-435` ; « Journées sans cours », « Horaire de reprise », « Date de reprise » `index.html:6336, 6364, 6375`.
- Étudiant·es : « Coller les données », « Prévisualiser », « Fichier CSV/TSV », format `index.html:7046-7060` ; « Ajouter l'étudiant·e » 7031 ; « Mesure d'aide » (Non / Oui) 7017-7021 ; rangée « Groupe : » 6930-6936 ; « Exporter CSV », « Supprimer un groupe… », « Vider la liste » 6962-6969.
- Calendrier : types de journée et cliquable seulement le jour de cours `js/calendrier-vue.js:305-345` ; échéances l. 214-262, 347 ; clic → `ouvrirSaisiePresence` `js/saisie-presences.js:2071` ; onglet « Calendrier scolaire » `js/config.js:66`.
- Clore : `js/trimestre-v2-liste.js:238-248` (« Clore » dans ⋮ d'un trimestre ouvert non actif ; l'actif n'a ni bouton ni ⋮) ; refus côté données `js/trimestres.js:693` ; « Clos (n) », « Rouvrir » `js/trimestre-v2-liste.js:222, 263` ; « Rouvrir » = « Cela permettra de modifier à nouveau les données de ce trimestre. » (l. 154), il ne rend pas le trimestre actif (`js/trimestres.js:1298-1317`) ; « Permission d'écriture » `index.html:3979`, « corrections ponctuelles » `js/trimestres.js:2749-2754`.

## Les ids

- Lecteurs mesurés avant la fusion : dans `js/`, aucun (le seul, le commentaire de `allerVersAide`, `js/trimestre-v2.js:512`, cite `aide-archivage`, id gardé). Dans `tests/`, `sentinelle-aide-2026-10-24-forme.test.js` (liste `PLACES`, test « CAF » sur `groupe`) et `sentinelle-audit-aide-lot-A-chemins-et-libelles.test.js` (`prise-en-main`, gardé).
- `accordeon-aide-bibliotheque` et `accordeon-aide-chaines-etapes` : aucun id ne les portait avant. La recherche de l'Aide les trouve (spec neuve).

## Tests

**Neufs**
- `tests/unit/sentinelle-aide-2026-10-27-lot-2a.test.js` (5 essais) : les quatre listes de l'entrée égalent celles de la popup, lue en exécutant `js/accompagnement-contenu-popup.js` ; aucun mot de l'ancien écran ni jargon (sidebar, barre latérale, colonne de gauche, dropdown, Workflow, modal) dans Commencer et le Cadre ; les quatre ids absorbés absents ; les entrées du §2 dans l'ordre. **Break-test : 8 ablations, 8 rouges** (Commencer introuvable ; une entrée renommée ; `accordeon-aide-groupe` réintroduit hors de l'Aide ; « dropdown » dans `cours` ; « barre latérale » dans `etudiants` ; un mot changé côté Aide ; un mot changé côté popup ; une liste de moins), **arbre restauré par sha256**.
- `tests/integration/aide-lot-2a-1152.spec.js` : la recherche trouve « bibliothèque » et « chaînes d'étapes » ; la popup « Comment fonctionne la bibliothèque » et l'entrée montrent les mêmes neuf `li`. `CAPTURES_AIDE_2A=<dossier>` produit les captures.

**Modifiés, par décision**
- `sentinelle-aide-2026-10-24-forme.test.js` : `PLACES` de Commencer et du Cadre selon le §2 ; décompte « 61 rangées » devenu « 61 − 4 absorbées + 2 neuves », l'invariant des 75 entrées de l'audit gardé ; le test « CAF » passe de `groupe` à `etudiants` (qui l'absorbe) et vérifie en plus que « Mesure d'aide » y est. Commentaire : audit du 24 oct., remesure du 27 oct., consigne du lot 2a, fusion confirmée par Grégoire.
- `sentinelle-audit-aide-lot-E-exemples-restent-des-exemples.test.js` : le garde « au moins une mention de 601-101 » tombait parce que les deux dernières (dans `cours` et `groupe-cours`) sont parties avec la correction (consigne §3 : aucun exemple propre à une discipline). Garde retiré, boucle gardée pour une mention qui reviendrait sans marqueur. ⚠ La boucle est désormais vide : l'assertion ne rougit que si une mention revient ; je le signale plutôt que de la durcir en « aucune mention » (ce serait un choix de règle).
- `sentinelle-1002-mots-clos` : **non modifiée**. La tranche d'`archivage` reste au-dessus de 1 500 caractères (elle court jusqu'au premier commentaire « Carte: » de la Conception) ; première phrase et titre intacts ; aucun « archiv ».
- Aucune autre assertion n'est tombée. Un seul rouge intermédiaire de ma main : le motif interdit des formats d'horaire figurait dans un commentaire que j'avais écrit (le banc lit les commentaires) ; reformulé.

## Pour Grégoire (phrases qui disent ce que l'Aide ne disait pas)

**`presentation`** — la phrase venue de `monitorage`, recalée : l'audit proposait « SRPNF et IDME sont des exemples », mais hors démo l'application ne sème pas de grille SRPNF.
> « Tes grilles, tes échelles et ta pratique de notation sont les tiennes. La « Grille de départ », l'« Échelle de départ (IDME) » et la « Cartouche de départ » que l'application installe, comme le matériel de la démonstration, sont des exemples. »

**`prise-en-main`**
> « **Assistance**, une case de la page d'accueil et un bouton de l'en-tête : les info-bulles, l'aide à l'écran et la visite guidée. »

**`demo`**
> « Cocher « Données démo » sur la page d'accueil ouvre un cours fictif, à part de tes vraies données, dans Suivi › Suivi du groupe ; le bandeau vert « Mode démonstration » reste au bas de l'écran. »
> « Pour en sortir : « Quitter la démo » dans le bandeau, ou décoche « Données démo ». Tes vraies données reviennent telles quelles. »
- Note : la consigne écrit « Retirer les copies (N) » ; j'ai repris la phrase validée telle quelle (« Retirer les copies »), le bouton portant le nombre à l'écran (`js/demo-activation.js:673`).

**`modes`**
> « Le bouton au masque, parmi les icônes de la première ligne de l'en-tête (sur un écran étroit : menu ⋯ › « Anonymisation »), passe du mode normal au mode anonymisé et en revient. »
> « … le DA est masqué, sauf si tu coches « Afficher DA réels » dans le bandeau … »
> « La démonstration n'est pas un mode : elle s'ouvre en mode normal. »

**`bibliotheque`** (hors des quatre listes validées)
> « Dans la Conception (Carte d'alignement, productions, grilles, échelles, cartouches, pratiques), « Consulter la bibliothèque » ouvre une fenêtre à deux colonnes. »
> « La bibliothèque des tampons, dans la palette Annotation, a les mêmes deux colonnes, mais la première s'appelle « Dans ta palette » au lieu de « Dans ce trimestre », et son bouton « ← Utiliser dans ma palette » : la palette sert dans tous tes trimestres. »
> « Les cours, les trimestres et les groupes-cours ont une bibliothèque d'une seule liste, ouverte par « Consulter la bibliothèque » de leur accordéon, dans Cadre › Trimestre. Dans ⋮, « Mettre de côté » range un cours ou un groupe-cours en bas, dans le repli « Mis de côté (n) » ; « Remettre dans mes cours » ou « Remettre dans le menu » l'en sort. Les trimestres clos sont dans le repli « Clos (n) », avec « Rouvrir ». »

**`chaines-etapes`** (toute l'entrée)
> « En haut de plusieurs outils, une chaîne montre les étapes qui le rendent prêt à servir ; une étape réglée est cochée. On en trouve dans Cadre › Trimestre, sur les fiches de production, de grille, d'échelle, de cartouche et de pratique, sur la Carte d'alignement et dans un critère algorithmique. »
> « Un clic sur une étape mène où elle se règle, sans rien modifier ; « Méthode » rouvre l'assistant d'une pratique, et sur la Carte d'alignement, le clic ouvre le guide à la page de l'étape. »
> « La case « Afficher les chaînes d'étapes » (Réglages › Préférences, Expérience visuelle) les masque toutes ; les étapes d'un critère algorithmique s'ouvrent alors par leur titre. »

**`preferences`**
> « **Expérience visuelle** : l'animation des points du tableau de bord, les informations contextuelles des graphiques, « Afficher les chaînes d'étapes » et le thème, clair (par défaut) ou sombre. »
> « **Système d'information scolaire** et **Sécurité** : le SIS de ton cégep ; l'accès au dossier Travaux entre les sessions. »

**`etapes-config`**
> « Chaque accordéon commence par une rangée : le menu de ce qui est choisi et « + Nouveau… » ; pour Trimestre, Cours et services et Groupe-cours, aussi « Consulter la bibliothèque ». Sous la rangée, trois résumés : Trimestre (semaines et jours de cours), Groupe d'étudiant·es (total, groupes, SA), Groupe-cours (« Complet » ou « n/5 configurés »). »
> « Un seul est actif à la fois ; le menu de l'en-tête change de groupe-cours. » (corrige « plusieurs groupes-cours actifs »)
> #1038 : « Si le groupe choisi n'a aucun·e étudiant·e dans ce cours mais en a dans un autre, une question le dit avant de créer le groupe-cours. »

**`cours`**
> « Choisis la nature, cours ou service. Pour un cours, le code, la pondération et la discipline sont obligatoires ; le nom du cours et les heures d'enseignement (le total du cours) s'ajoutent. »

**`horaire`**
> « Un horaire a un « Groupe associé », obligatoire. »

**`etudiants`**
> « La rangée « Groupe : » filtre la liste, et « + Nouveau groupe » en crée un ; la bande dessous résume le total, les groupes et les SA. « Exporter CSV », « Supprimer un groupe… » et « Vider la liste » sont en tête de la liste. »

**`archivage`**
> « Quand tu le consultes, son bandeau offre « Permission d'écriture », pour une correction ponctuelle. »
- **Reformulation proposée de la première phrase** (acceptée le 4 oct., épinglée ; elle inverse l'ordre du code, où il faut d'abord activer un autre trimestre) :
  > « Clore un trimestre le fige en lecture seule, une fois terminé. Le trimestre actif ne se clôt pas : commence ou active d'abord le suivant. Clore ne libère aucun espace. »
  
  Si Grégoire l'accepte, la phrase du « Comment clore » qui le redit se raccourcit, et `sentinelle-1002-mots-clos.test.js:119` se recale. Même inversion dans « Quand clore ? », troisième puce (« Tu souhaites commencer un nouveau trimestre ») : gardée, comme le veut la consigne ; à revoir avec la phrase.

## Captures (`plans de travail/captures-2026-10-27-aide-lot-2a/`)

- `en-tete-mode-anonymise-1440.png` : le masque est la 3ᵉ icône des utilitaires de la première ligne (après le bogue et le cœur).
- `en-tete-mode-anonymise-820.png` : les utilitaires sont dans le menu ⋯ (≤ 1 024 px).
- `aide-bibliotheque-1440.png`, `aide-bibliotheque-820.png`, `aide-chaines-etapes-1440.png`, `aide-chaines-etapes-820.png`.

## Trouvé en chemin

- Les deux fonctions sans appelant signalées par Cowork (`allerVersAide`, `ouvrirAideGroupeCours`) : **inscrites** au tableau « Trouvé hors de la section Aide » de l'audit, « inscrit #1152, lot 5 (code mort) ».
- La popup « Données démo » dit « 10 étudiants », renvoie à « l'aperçu » et parle de « dropdowns » (`js/accompagnement-contenu-popup.js:1260, 1275, 1285`) : **inscrit** au même tableau, lot 5.
- Dans la popup comme dans l'entrée, « « ← Utiliser… » » peut se couper entre « et ← (aucune espace insécable) : **commenter et oublier** — sans conséquence de sens, et le texte est validé mot pour mot.
- Rituel de début de session : un sixième fichier non suivi que la prémisse ne nomme pas, `icons/icons8-inactive-state-80.png` (laissé tel quel, comme `icons/icons8-circle-80.png`). La consigne `CONSIGNE-LOT-2026-10-24-correction-noms-fictifs.md` reste non exécutée (rappel du plan).

## Le geste à vérifier à l'écran après la mise en ligne

Ouvrir l'Aide › Commencer, lire « La bibliothèque » et « Les chaînes d'étapes » ; chercher « Clore » trouve le chemin d'aujourd'hui (« Consulter la bibliothèque », ⋮ › « Clore »).
