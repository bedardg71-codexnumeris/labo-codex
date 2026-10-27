# Demande de relecture – L'Aide, lot 2b, la retouche (#1152)

> Claude Code, mardi 27 octobre 2026, sur `main`. Verdict : `VERDICT-RELECTURE-2026-10-27-aide-lot-2b.md` (lu à 17 h 39, avec le § 4.3 ajouté à 17 h 58, puis le § 4.4 ajouté après la décision de 18 h 06). Commits : `87b35ccf` pour l'échelle de départ (§ 4.1, code), `0eff1eaa` pour la retouche de l'Aide (§ 1, § 2, § 3, § 4.2), `049c257f` pour la première version de cette demande (§ 4.3 arrêté), `e316b1bc` pour le § 4.3 repris par le § 4.4 (le niveau « PS »). Cette mise à jour part dans un commit de docs. Non poussé, pas de release.

## En bref

- **§ 1 et § 2 : faits.** Les réponses de Grégoire sont posées mot pour mot, et `TEXTES-2026-10-27-aide-critere-algorithmique.md` passe à « validés ».
- **§ 3 : deux inscriptions** au tableau « Trouvé hors de la section Aide ».
- **§ 4.1 : fait.** L'échelle de départ se sème avec les valeurs ponctuelles 40, 65, 75 et 100. Le stock ne bouge pas, et un essai le prouve.
- **§ 4.2 : fait.** Les quatre icônes SOLO sont posées dans les deux tableaux, en clair et en sombre.
- **§ 4.3 : d'abord arrêté avant le code** (le « 0 » était déjà le non recevable ; voir plus bas). **Puis fait, repris par le § 4.4** (décision de Grégoire, 18 h 06) : le Préstructurel prend le code « PS », et le « 0 » reste au non recevable. Commit `e316b1bc`.
- Mots de la Conception : 2 698 → **2 759** (2 746 après le § 1, puis les rangées PS de `solo`). Les « À régler » de `pratique` nomment maintenant les libellés de leurs champs.
- Tests, au dernier commit :
  - Vitest complet : **9 975 sur 9 975** ;
  - Playwright ciblé : **35 réussis, 1 sauté** (le saut existait déjà). Il comprend la spec neuve du niveau PS, les specs de l'échelle de départ et du guide, et celles de l'Aide.

## § 1 et § 2, point par point

1. **`pratique`** : chaque « À régler » ne nomme que ce qu'un champ règle.
   - **Sommative** : une règle spéciale, s'il y a lieu (« Verrou sur une évaluation » ou « Portfolio de progression »). La pondération de chaque production se règle dans Conception → Productions étudiantes. « Le traitement d'un travail non remis » est retiré.
     - Preuves : `js/wizard-pratique-v2.js:465-500` ; `js/pratiques/construction-attributs.js:261-267` ; `index.html:5945-5957`.
   - **Standards** : l'échelle ; la « Construction de la note » et ses quatre choix ; le nombre d'artefacts retenus pour la note finale. « Les occasions de reprise… » est retiré, aucun champ de ce nom n'existant.
     - Preuves : `js/wizard-pratique-v2.js:655-672` ; `index.html:5815-5830`.
   - **Spécifications** : le « Seuil d'acceptabilité (%) », un seul pour la pratique ; les « Types de productions », par leur nom et leur description ; la « Table des forfaits (bundles) ».
     - Preuve : `index.html:5966-5995`.
   - **Dénotation** : les « Cibles d'apprentissage », la « Méthode de suggestion » et, au besoin, une « Grille de critères (optionnelle) ». La garde est fixe : aucun champ ne la règle.
     - Preuves : `index.html:6005-6030` ; `js/pratiques/construction-attributs.js:427`.
2. **`creer-productions`** : « le champ texte « Activité d'apprentissage » est marqué recommandé ».
3. **`creer-grilles`** : « À « Créer la grille », un message rappelle un total qui n'est pas à 100 %, sans bloquer ; une grille existante s'enregistre à chaque changement, sans message. »
   - Preuve : `js/grilles.js:813-834`. Le bouton « Sauvegarder la grille » que cite le commentaire n'existe plus dans `index.html`.
4. **`apporter-grille`** : « Selon ta grille, « Aller plus loin avec ta grille » peut proposer une piste… »
   - Preuve : `js/materiel.js:80-84`.
5. **`bareme`** : « …quand aucune tranche ne couvre les points, le chiffre, sans texte de tranche. »
6. **`sous-criteres`** : D2e, D7a et D7 sont corrigés mot pour mot comme le § 2 les donne ; D0, D2, D2d, D7b et D8 sont inchangés. L'en-tête des TEXTES passe à « validés », avec les heures (17 h 41 à 17 h 43).
7. **`solo`**, remesuré :
   - Cochée, l'option fait écarter au dépistage les critères à « Aucun » (`js/profil-etudiant-helpers.js:923-927`). Seul le **suivi des fondations** se limite aux multistructurels (`960-964`), et un critère sans étiquette en est un (#542).
   - Décochée, tout est lu (`:924`), suivi des fondations compris. « Suivi des fondations » est le mot de l'écran, `js/tableau-bord-apercu.js:2313`.
   - La phrase D2 garde seulement sa première phrase (réponse de Grégoire, 17 h 48).
   - **Pour Grégoire** : la parenthèse « (un critère sans étiquette en est un) » est neuve ; elle dit le défaut #542.

## § 3, inscrit

Au tableau « Trouvé hors de la section Aide » de l'audit, disposition « inscrit #1152, lot 5 » :

- le nom court du palier que l'atelier promet dans le PDF ;
- « Système de jetons » affiché pour toute famille.

La bordure gauche des encadrés n'est pas inscrite, comme le dit le verdict.

## § 4.1, l'échelle de départ (commit `87b35ccf`)

- **Lecteurs mesurés de l'échelle par défaut** :
  - `niveauxDefaut` n'a **qu'un lecteur**, le semis (`js/echelles.js:382`). `import-export.js:547` et le banc `sentinelle-transport-echelles` lisent seulement ses **clés**.
  - Les autres « 32 / 69,5 / 79,5 / 92,5 » de `js/` sont des **commentaires** de replis déjà supprimés : `js/portfolio.js:224-230` et `js/interventions.js:364`.
  - Le repli de `afficherCriteresDepuisGrille` (`js/evaluation-chargement.js:1340-1347`) ne porte que les codes et les noms, sans valeur.
  - **Aucun site ne recalcule une note enregistrée** avec ces valeurs.
- **Non changés, listés** :
  - les pratiques prédéfinies, qui ont leurs propres échelles et tables de conversion : `js/pratiques/pratiques-predefines.js:36` (un niveau « 0 », « Données insuffisantes »), `93`, `404`, `426` (table 50 / 70 / 80 / 92,5), `519` et `746` ;
  - le pack démo, qui sème ses propres échelles (`js/pack-demo-10.js:7285` et suivantes, déjà en 0 / 40 / 65…).
- **Le changement** :
  - seul `valeurCalcul` change dans la constante ;
  - le commentaire cite la décision de Grégoire et l'autorisation du verdict ;
  - le bloc de jetons d'`index.html` passe à `echelles.js?v=20261027a`.
- **Le stock, essai neuf** (`tests/unit/sentinelle-echelle-idme-de-depart-valeurs-1152.test.js`) :
  - un trimestre neuf reçoit 40, 65, 75 et 100, avec bornes, codes, noms, paliers SOLO et couleurs inchangés ;
  - un trimestre qui a déjà `ECHELLE_IDME_DEPART` aux anciennes valeurs la garde à l'identique (`toEqual` sur le stockage) ;
  - **break-test 3 sur 3** : le semis qui réécrit le stock, une ancienne valeur revenue et une borne changée donnent chacun un rouge ; fichier restauré par sha256.
- **Recalé** : `sentinelle-echelle-idme-de-depart.test.js`, essai F. Il attendait la valeur semée 32 pour « I » ; il attend 40, et cite la décision.
- **L'Aide** : le tableau de `solo` suit dans le même commit, pour qu'aucun commit ne laisse la sentinelle du lot 2b rouge. C'est un écart avec « l'Aide dans l'autre commit » du § 5, dit ici.
- **Une ligne des Nouvelles** sera due à la prochaine version ; ses mots reviennent à Grégoire.

## § 4.2, les icônes (commit `0eff1eaa`)

- Les quatre SVG sont commités.
- Une `<img alt="">` est placée devant le nom de chaque niveau, dans les deux tableaux de `solo`.
- Une classe neuve, `.aide-icone-solo`, dans `styles.css` :
  - la hauteur est de 1,1 em et la largeur suit l'image ;
  - c'est nécessaire parce que les quatre SVG n'ont pas la même largeur (viewBox de 18 à 126 pour 70 de haut) ;
  - le jeton de la feuille passe à `styles.css?v=20261027b`.
- **Lisibilité** : les quatre se lisent en sombre. En clair, le **jaune du multistructurel (`#FFCC00`)** est pâle sur fond blanc ; son nom, à côté, porte le sens. C'est la couleur du fichier, que je n'ai pas changée ; le choix revient à Grégoire.
- **Sentinelle étendue** :
  - les huit cellules ont chacune leur icône, son `src`, `alt=""`, l'icône en premier nœud, et un fichier existant ;
  - la règle CSS est vérifiée ;
  - les libellés de `pratique` passent au contrôle des libellés ;
  - « travail non remis » et « occasions de reprise » sont absents, et la garde est dite fixe ;
  - **break-test 8 sur 8**. Le premier passage donnait 7 sur 8 : l'icône placée après le nom passait. J'ai durci l'assertion sur le premier nœud, puis l'ablation a rougi.
- Captures dans `plans de travail/captures-2026-10-27-aide-lot-2b-retouche/` :
  - `aide-solo-1440.png`, `aide-solo-820.png` (clair) ;
  - `aide-solo-1440-sombre.png`, `aide-solo-820-sombre.png` ;
  - `aide-sous-criteres-1440.png`, `aide-sous-criteres-820.png`.

## § 4.3, le niveau 0 : d'abord arrêté, avec ce qui a été mesuré (historique)

**Le conflit** : dans le code, le niveau de code « 0 » veut déjà dire « **non recevable** », une copie réservée à l'intégrité académique. Le code le décrit comme « réservé à l'intégrité académique et ne se déduit jamais d'un chiffre » (`js/echelles.js:2344-2345`). Donner ce code à « Préstructurel », un niveau qui se déduit d'un pourcentage, change ce que fait chacun de ces sites :

1. **La note d'un critère algorithmique ou analytique ne trouve jamais le niveau 0.**
   - `niveauDuPourcentage(…, { sansNiveauZero: true })` : `js/evaluation-calcul.js:638-640`, appelé en `691` et `1707`, ainsi que par `js/comptes-erreurs-stock.js:124`.
   - Une copie à 30 % tomberait dans la plage du 0 (0 à 39,99 %). Le niveau est écarté, et le repli « le plus proche » lui **donne I** : le lecteur invente une valeur pour « 0 ».
   - Ce niveau choisit le commentaire de la cartouche.
2. **La chaîne de l'échelle de départ se briserait.**
   - `couvertureDesPourcentages` écarte le « 0 » (`js/echelles.js:2349-2351`). Avec le 0 sur 0 à 39,99 % et le I sur 40 à 64,99 %, les entiers de 0 à 39 n'auraient plus de plage.
   - L'étape « Pourcentages » de la chaîne signalerait un **trou à 0** sur l'échelle que l'application installe.
3. **Le tableau de bord ne montre jamais le niveau 0.**
   - `js/tableau-bord-apercu.js:808` et `926` l'écartent (« Exclure niveau 0 (plagiat) »).
   - Les étudiant·es au niveau Préstructurel disparaîtraient des deux distributions.
4. **Le non recevable deviendrait « Préstructurel ».**
   - Marquer une copie « plagiat » ou « IA » met tous les critères à `'0'` (`js/evaluation-sauvegarde.js:610`, « Mettre à "0 - Aucun" »).
   - Avec une échelle qui a un niveau « 0 », la copie fraudée afficherait « 0 – Préstructurel », niveau qui porte un sens pédagogique. Le message dit pourtant qu'elle « sera exclue des calculs de moyenne » (déjà inscrit au lot 5 pour la sommative).

S'y ajoutent deux constats :

- `js/profil-etudiant-helpers.js:150-160` a une couleur par défaut pour « 0 » ;
- les pratiques prédéfinies ont déjà un « 0 » qui veut dire autre chose encore, « Données insuffisantes » (`js/pratiques/pratiques-predefines.js:36`).

**Ce que je n'ai pas fait**, puisque tout dépend du sens de « 0 » : le cinquième niveau du semis, l'icône `solo-pre-couleur.svg`, la rangée « Préstructurel » des deux tableaux de l'Aide, la ligne du guide SOLO.

**La question pour Grégoire**, à soumettre par Cowork, revient à ce qu'une note veut dire. Le code « 0 » peut-il désigner à la fois le non recevable et le Préstructurel ?

- **(a) Non : le Préstructurel prend un autre code** (par exemple « P »). Le non recevable garde le « 0 ». Les quatre sites ci-dessus n'ont pas à changer ; le Préstructurel s'y comporte comme I, D, M ou E.
- **(b) Oui, le « 0 » devient Préstructurel partout.** Le non recevable reçoit alors autre chose qu'un niveau « 0 ». Les quatre sites changent, avec leurs bancs. Le stock pose question : des copies déjà marquées non recevables portent le niveau « 0 » dans les données de Grégoire. C'est un plus gros lot, avec une mesure du stock d'abord.
- **(c) Garder l'échelle de départ à quatre niveaux** et ajouter seulement la rangée Préstructurel au tableau SOLO de l'Aide (la théorie), sans toucher au semis.

Recommandation de Claude Code : **(a)**. C'est la seule qui ne réécrit le sens d'aucune donnée déjà enregistrée. Ce sont toutefois les mots que liront ses élèves : la décision lui revient.

## § 4.3 repris par le § 4.4 : le niveau « PS – Préstructurel » (commit `e316b1bc`)

### Le semis

`niveauxDefaut` passe à cinq niveaux, avec la même autorisation qu'au § 4.1 ; le commentaire cite la décision.

- **Le niveau neuf, en tête** :
  - code « PS », nom « Préstructurel », description « Préstructurel » ;
  - palier `prestructurel` ;
  - plage 0 à 39,99 %, valeur ponctuelle 0 ;
  - couleur **`var(--gris-moyen)`**. C'est une variable existante, redéfinie en clair et en sombre ; elle se distingue du rouge de I et dit « aucun aspect pertinent ».
- **« I »** : sa plage va de 40 à 64,99 % et sa description devient « Unistructurel ». Le reste ne change pas.
- **Le commentaire du 26 août sur le « I » composite** suit : la nuance a quitté la prose, puisque le préstructurel a son niveau.
- **La description de l'échelle semée** passe de « Quatre niveaux — … » à « Cinq niveaux — Préstructurel, Incomplet, Développement, Maîtrise, Étendu. ». C'est un texte que lit l'enseignant·e : il serait devenu faux. Le stock garde sa description.
- **Pour Grégoire** : `sentinelle-542-lot2-solo-echelle` rappelle que les `description` des niveaux partent dans les PDF des élèves. PS dira donc « Préstructurel » et I dira « Unistructurel », les mots du § 4.3.
- Les jetons d'`index.html` passent à `echelles.js?v=20261027b` et `guides-pedagogiques.js?v=20261027a`.

### Le non recevable ne change en rien

Le code « 0 » reste écarté :

- de la déduction par pourcentage (`sansNiveauZero`) ;
- de la couverture des plages ;
- des distributions du tableau de bord.

Un essai le vérifie : un niveau « 0 » posé à côté de PS reste écarté, et 0 % donne PS.

### Les lecteurs, mesurés

- **`[IDME]` des cartouches** (`importerCommentaires`, `parserMarkdownCartouche`) : il ne reste que dans des commentaires. Depuis #531, les deux lisent les codes **de l'échelle**, par alternance, jusqu'à trois caractères (`js/cartouches.js:853-859`).
  - Il n'y avait rien à élargir. L'essai neuf le prouve : « **Analyse (PS)** : … » se lit.
  - Break-test : une alternance remise à `I|D|M|E` donne un rouge.
- **`js/profil-etudiant-calculs.js:1596`** : ce n'est qu'un commentaire, une expression retirée par #529.
- **Le rang des niveaux, les zones de maîtrise, PAN-Standards** : ils lisent l'échelle (plages et `valeurCalcul` par code, `js/profil-etudiant-calculs.js:149-152, 552-567`). PS y vaut 0 et compte.
- **Les bornes fixes de la RàI et du dépistage** (64, 75, 85 %) portent sur des pourcentages, pas sur des codes. PS (moins de 40 %) tombe sous la première ; inchangées, comme le veut D3.
- **Le repli I/D/M/E** d'`afficherCriteresDepuisGrille` (`js/evaluation-chargement.js:1340-1347`) et celui d'`evaluation.js:999` ne servent que sans échelle. Ils ne touchent pas l'échelle de départ.
- **Inscrire et continuer** (issue 2, code étranger, antérieur) : l'export anonymisé compte `nb_I`, `nb_D`, `nb_M`, `nb_E` en dur (`js/trimestres.js:2578-2610`). Une évaluation PS compte dans le total mais dans aucune case, comme tout code hors IDME, A/B/C comprises. Cela touche ce qui sort de l'application (trou n° 6 du lot 4). Je ne l'ai pas inscrit moi-même au tableau : **je le propose à Cowork**.
- **Issue 3** (sans conséquence observable, noté ici) :
  - `obtenirNoteAffichee` (`js/liste-evaluations.js:1319-1326`) prend une note de 0 pour une absence (`noteFinale !== 0`). Son champ `note` n'a aucun lecteur : la cellule affichée passe par `_noteChiffreeAffichee`, qui compte le zéro.
  - `js/travaux-ui.js:3872` écrit « --% » pour une note de 0, dans une question de confirmation de suppression ; c'est antérieur et cela vaut pour toute note nulle.
- **Non changés, listés** :
  - les pratiques prédéfinies (`js/pratiques/pratiques-predefines.js`, leur propre « 0 – Données insuffisantes » et leurs tables) ;
  - le pack démo ;
  - le lexique `idme` (`js/accompagnement-contenu-terme.js:352`, « Quatre niveaux de performance… »). Ce dernier relève du glossaire, au lot 3 : **à inscrire**, au choix de Cowork.

### « Elle vaut 0, elle compte, elle s'affiche »

La spec neuve `tests/integration/echelle-depart-prestructurel-1152.spec.js` part du vrai semis (grille, échelle et cartouche de départ).

- **À l'évaluation** :
  - le menu du critère offre « PS - Préstructurel » ;
  - tous les critères à PS donnent une note de **0 %**, un vrai zéro (`noteCalculeeCourante === 0`), et le niveau « PS ».
- **Enregistrée et verrouillée** :
  - **P sommative = 0** : la copie compte ;
  - **la Liste** montre « PS » et « 0 % », chacun dans sa cellule ;
  - **le PDF** est construit sur 0 et PS, chaque critère au code PS.
- **Break-test, 4 sur 4** :
  - PS à 20 ;
  - PS recodé « 0 » ;
  - la sommative qui prend 0 pour une absence ;
  - la cellule de la Liste qui prend 0 pour une absence.
  - Mon premier contrôle de la Liste passait à tort : « 100 % » contient « 0 % ». Je l'ai resserré sur les cellules.
- **Le profil** : les indices et le dépistage passent par les lecteurs ci-dessus (P sommative, table de conversion, rang par plage), éprouvés. Aucun essai ne rend l'écran du profil lui-même : **je le dis plutôt que de l'affirmer**.

Le banc neuf `tests/unit/sentinelle-echelle-depart-prestructurel-1152.test.js` compte 6 essais :

- 0 à 39,99 % donne PS, avec ou sans `sansNiveauZero`, et 40 % donne I ;
- le non recevable reste écarté ;
- l'étape « Pourcentages » ne voit aucun trou ;
- `valeurNumeriqueDuNiveau(PS) === 0` ;
- la table de conversion de PAN-Standards donne PS = 0 ;
- l'import des cartouches lit PS.

**Break-test, 6 sur 6** :

- PS recodé « 0 » ;
- I qui recommence à 0 ;
- PS à 10 ;
- le zéro pris pour une absence dans `valeurNumeriqueDuNiveau` ;
- PS écarté comme le non recevable ;
- l'alternance des cartouches réduite à I/D/M/E.

Chaque fichier est restauré par sha256.

### Le stock

Une échelle de départ déjà semée ne change pas : l'essai du § 4.1 couvre aussi le cinquième niveau, car le semis s'arrête dès que `ECHELLE_IDME_DEPART` existe.

### Ce que lit l'étudiant·e au niveau PS avec la « Cartouche de départ » (mesuré, rien écrit)

**Pour Grégoire** : la cartouche n'a aucun commentaire pour PS. Ses niveaux portent I, D, M, E (`js/cartouches.js:149-175`).

- La spec le relève : les quatre commentaires de critère du PDF sont **vides** (`["","","",""]`).
- L'étudiant·e lit donc, pour chaque critère, son code « PS » sans aucune phrase ; la note est 0 %.
- Ce sont des mots que l'étudiant·e lit : je n'en ai écrit aucun.

### L'Aide, le guide, l'icône

- **`solo`, le tableau SOLO** : la rangée « Préstructurel » en tête, avec la description de l'application, « Aucun aspect pertinent n'est traité » (`js/echelles.js`, `NIVEAUX_SOLO_ECHELLE`). La phrase d'introduction ne compte pas les niveaux : inchangée.
- **`solo`, le tableau de l'échelle de départ** :
  - la rangée « PS – Préstructurel » : 0 à 39,99 %, valeur 0 ;
  - la rangée de I : 40 à 64,99 %.
  - Les plages s'écrivent toutes « min à max % », sauf E (« 85 % et plus »). « Moins de 65 % » est parti.
  - La sentinelle du lot 2b compare les cinq rangées au semis ; `sentinelle-audit-aide-15-oct` vérifie la plage de I.
- **Le guide SOLO** (`js/guides-pedagogiques.js:96`) : « **PS** ↔ Préstructurel, **I** ↔ Unistructurel, … ». « 0 (Non recevable) » en sort.
- **L'icône `icons/solo-pre-couleur.svg`** :
  - un point plein `#CC0000`, dans le même gabarit que celle de l'unistructurel (viewBox 18 × 70, centré sur les barres), placé dans les deux tableaux ;
  - **le rayon passe de 5 à 8**, le plus grand que permettent les 18 de large : au rayon 5, le point rendu à 1,1 em faisait à peine un pixel (capture). C'est mon choix, à retoucher si besoin.
  - En sombre, le rouge foncé reste lisible, mais il est plus discret que les autres.
- Captures dans `captures-2026-10-27-aide-lot-2b-retouche/` : `aide-solo-1440.png`, `aide-solo-820.png`, et `-sombre`.

### Recalés, par décision (§ 4.3-4.4)

- `sentinelle-542-lot2-solo-echelle` : cinq étiquettes, les descriptions « Préstructurel » et « Unistructurel ».
- `sentinelle-echelle-idme-de-depart` : B (cinq niveaux), I (les noms et la description), F (le premier niveau est PS, valeur 0).
- `sentinelle-echelle-idme-de-depart-valeurs-1152` : le cinquième niveau.
- `triptyque-seme-produit-une-note.spec.js` : cinq niveaux semés.
- La sentinelle du lot 2b et celle du 15 oct.

## Clôture

- `BACKLOG.md` : sous #1152, la retouche du lot 2b. Le plan reste « codé, en relecture ».
- Pas de release, de verdict ni de push sans le signal de Grégoire. Sur ce Mac, dix commits ne sont pas poussés (lots 2a et 2b, ce commit de docs compris).
- **Une ligne des Nouvelles** sera due à la prochaine version : les valeurs ponctuelles 40, 65, 75 et 100, puis le niveau « PS – Préstructurel ». Ses mots reviennent à Grégoire.
