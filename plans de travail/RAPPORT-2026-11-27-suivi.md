# Rapport : Suivi, quatre fiches décidées par Grégoire (27 novembre 2026)

Branche `lot/suivi-2026-11-27`, partie de `lot/file-sans-gregoire-2026-11-27` à `951de3f8`. **Aucune fusion vers `main`, aucun bump, rien au changelog.** Un commit par fiche : `bb13738b` (fiche 1), `24bc8a44` (fiche 3), `528f68a6` (fiche 4). La fiche 2 s'est arrêtée à la mesure, comme le mandat le prévoyait : elle attend Grégoire. Textes posés mot pour mot ; aucun autre texte lu par l'utilisateur ou par l'élève n'a changé.

**Reste** : la décision de Grégoire sur la fiche 2 (section 2) ; le regard à l'écran (section 6) ; le verdict du Mac avant toute fusion.

## 1. Fiche 1 : la phrase sous la bande de performance (#1190), faite

`genererInterpretationPerformance` (`js/tableau-bord-apercu.js`) ne lit plus aucun code de niveau. Elle reçoit les repères que rend `reperesPerformance()` (`js/contexte-qualification.js`, la source unique de la famille P, déjà lue par les pastilles et la bande) et range chaque étudiant·e : au seuil de maîtrise ou au-dessus ; entre le seuil minimal de réussite et le seuil de maîtrise ; sous le seuil minimal. Les conditions (les patterns) ne changent pas.

| Avant | Après |
|---|---|
| « 12 étudiant·es (48 %) ont atteint ou dépassé le niveau de maîtrise » | « 12 étudiant·es (48 %) ont atteint ou dépassé le seuil de maîtrise » |
| « 4 étudiant·es en Développement montrent une progression favorable et pourraient atteindre la maîtrise prochainement » | « 4 étudiant·es entre le seuil minimal de réussite et le seuil de maîtrise montrent une progression favorable et pourraient atteindre la maîtrise prochainement » |
| « Parmi les 5 étudiant·es en difficulté, 2 montrent des signes de progrès » | « Parmi les 5 étudiant·es sous le seuil minimal de réussite, 2 montrent des signes de progrès » |
| « 5 étudiant·es en difficulté nécessitent un accompagnement intensif » | « 5 étudiant·es sous le seuil minimal de réussite nécessitent un accompagnement intensif » |

Les accords passent par `window.pluriel`, comme avant (« 1 étudiant·e … a atteint », « montre », « pourrait », « nécessite »). « Parmi les 1 étudiant·e » reste tel qu'il était.

**Une échelle sans l'un des deux seuils (mesuré).** `reperesPerformance` rend `null` pour un repère que l'échelle ne porte pas : rien n'est deviné. La phrase qui nomme ce seuil ne se dit donc pas, et aucun texte n'a été ajouté :
- sans seuil de maîtrise : seule la phrase « sous le seuil minimal de réussite » reste ;
- sans seuil minimal de réussite : seule la phrase de la maîtrise reste ;
- sans aucun des deux : la phrase entière se tait.

⚠ **À savoir (inférence tirée du code, non vue à l'écran) : l'« Échelle de départ (IDME) » ne porte aucun des deux seuils** (`assurerEchelleIdmeDeDepart`, `js/echelles.js:397`, ni `seuilSuffisance` ni `seuilMaitrise`). Chez qui ne les a pas posés, Vue simple comprise (« Mes niveaux » en est la copie), la phrase disparaît alors qu'elle parlait avant par les codes M, E, D, PS et I. La bande, elle, reste déjà neutre dans ce cas depuis le 30 oct. La démo porte ses deux seuils (D et M) : elle ne change que de mots.

Preuve : `tests/unit/apercu-phrase-performance-seuils-1190.test.js`, six essais, sur une échelle aux niveaux N1 à N4 (aucun ne s'appelle M, E, D, PS ni I) et la vraie `reperesPerformance`. Rouge avant le correctif (6 sur 6) ; break-test de la borne (`>=` changé en `>`) : 4 rouges. Six essais existants mis aux nouvelles phrases, dont la sentinelle du 22 nov. qui figeait les deux lignes retirées (le code « 0 » écarté et « PS » lu dans cette fonction) et l'essai Playwright `niveau-sans-seuils.spec.js`, qui attend maintenant le silence de la phrase (**non joué** : aucun navigateur ici).

## 2. Fiche 2 : le seuil de défi d'un critère, ARRÊTÉE à la mesure

**La question : le code distingue-t-il un 70 % choisi d'un 70 % laissé par défaut ? Réponse mesurée : non, sauf chez qui n'a jamais rien enregistré dans la page.**
- Les sept champs de Labo › Observation appellent tous `sauvegarderSeuilsV2` (`index.html:8794-8935`), qui écrit l'objet entier : changer la fenêtre des patterns ou un palier d'assiduité écrit aussi `defiSpecifique: 0.70`, lu dans le champ prérempli (`js/preferences-v2.js:429`).
- Les deux boutons « Restaurer » écrivent 0,70 de même (`:463`, `:484`).
- `chargerSeuilsInterpretation` (`js/interpretation-config.js:145`) complète un objet enregistré auquel il manque une clé et le réécrit : un 0,70 posé ainsi n'a pas été choisi non plus.
- L'export et l'import des réglages le transportent (`js/donnees-v2.js:748`). La clé est globale, commune aux trimestres.
- Seul cas lisible : aucun objet enregistré (ou un objet sans la clé), qui veut dire « jamais touché ».

Rien n'a été codé ni réécrit.

**Ma proposition, à Grégoire :**
1. *La source* : le champ n'écrit `defiSpecifique` que si la personne change CE champ ; « Restaurer les seuils de détection » retire la clé. Sans clé, le seuil suit le seuil de maîtrise de l'échelle, lu par `reperesPerformance` (une seule source).
2. *Le stock* : un 0,70 déjà enregistré ne se lit ni comme un choix ni comme un défaut. Je propose de le traiter comme **laissé par défaut** : 70 est le seul défaut depuis le 28 août 2026 (#555, lot 2) et le champ s'ouvre déjà à 70, donc taper 70 ne se voit pas. Le prix : quelqu'un qui aurait voulu 70 exactement verrait son seuil suivre l'échelle (rien n'est réécrit ; il le repose d'un geste). L'autre lecture, « tout 0,70 enregistré est un choix », réduirait la décision « partout dès maintenant » aux seules personnes qui n'ont jamais touché la page.
3. *Une échelle sans seuil de maîtrise* (l'échelle de départ, d'abord) : je propose que le seuil reste 70 %. C'est une question de pédagogie : à Grégoire.

**Ce que la mesure dit aussi, pour décider :**
- Sur la démo, le seuil de maîtrise est le niveau M, à 75 % (`ECH_DEMO_1759264511178`) : le défi passerait de 70 à 75 %. L'écart en nombre de critères en défi n'est **pas mesuré** (il faudrait le calcul réel sur la démo, à faire si la proposition est retenue).
- **Le champ ne peut pas contenir toutes les valeurs** : `index.html:8830` le borne à `min="60" max="80"`. Une échelle dont la maîtrise commence à 85 % donnerait un défaut que le champ refuse. L'aide « De 60 % (plus exigeant) à 80 % (moins exigeant) » deviendrait fausse dans ce cas ; je n'y ai pas touché.
- Écrans qui en dépendent (lecture du code, `obtenirSeuil('defiSpecifique')`) : le défi principal et les forces du profil (`js/profil-etudiant-calculs.js:1162, 1288, 1656` ; `js/profil-etudiant-sections-affichage.js:3959`), les critères pré-cochés « en défi » et leur compteur dans une intervention (`js/interventions.js:1372`), la pratique Standards (`js/pratiques/pratique-pan-standards.js:817`). Le niveau RàI en dépend par le pattern « Défi spécifique ».

La fiche #1260 au BACKLOG porte maintenant un renvoi à cette section.

## 3. Fiche 3 : les critères au nom presque pareil, faite

Dans le suivi, deux noms ne diffèrent que par les majuscules, les accents ou les espaces : un seul critère. « Structure » et « Structure du texte » restent deux.

**Les endroits mesurés qui comparaient le nom brut** (quatre comparaisons, trois écrans) :
1. `js/graphiques-progression.js`, `obtenirDonneesCriteres` : l'ensemble des critères du graphique d'un profil (`Set` des noms bruts) ;
2. même fonction : la valeur d'une copie (`find(c => c.critereNom === nomCritere)`) ;
3. `js/profil-etudiant-sections-affichage.js`, `_genererGraphiqueCriteresHTML` : la légende de ce graphique (son propre `Set`) ;
4. `js/interventions.js`, `ouvrirIntervention` : les critères cochés d'une intervention rouverte (`criteresCibles.indexOf(c.nom)`).

Hors compte : la bascule d'une courbe (`toggleCritereIndiv`, `ds.label === critere`) compare deux noms tirés de la même liste ; `js/parcours-lire-ta-classe.js:1046` compare la constante « Rigueur » du parcours à la grille de la démo. Ni l'un ni l'autre ne compare deux noms écrits par l'enseignant·e : laissés.

**L'outil réemployé** : `cleCritere` (`js/profil-etudiant-helpers.js`, exportée), même règle que `_normaliserNomCritere`, qui sert `trouverCritereDepistage`. Aucune troisième écriture. Une seule fonction neuve, `criteresDistinctsDesEvaluations` (même fichier) : la liste que lisent le graphique ET sa légende, qui avaient chacun la leur. Supposé : le nom montré est celui de la copie la plus récente (l'orthographe que l'enseignant·e emploie maintenant). Aucune donnée réécrite ; les bancs `bac-suivi.js` et l'audit du 6 sept. fournissent la vraie `cleCritere`.

Preuve : `tests/unit/suivi-criteres-nom-presque-pareil.test.js`, six essais (5 rouges avant ; le sixième garde la frontière « Structure du texte »). Break-tests : comparaison brute remise dans l'intervention puis dans le graphique, un rouge chacun.

## 4. Fiche 4 : « Terminée » à la place de « Complétée », faite

La valeur enregistrée (`completee`), la classe `badge-statut-completee` et les identifiants ne changent pas : aucune intervention n'est réécrite. Les Nouvelles publiées restent telles quelles.

| Où | Avant | Après |
|---|---|---|
| `js/interventions.js`, la pastille | « Complétée » | « Terminée » |
| `js/interventions.js`, le choix du statut (à côté de « En préparation ») | « Complétée » | « Terminée » |
| `js/interventions.js`, la liste vide | « Aucune intervention planifiée ou complétée. » | « Aucune intervention planifiée ou terminée. » |
| `js/parcours-lire-ta-classe.js`, « Je regarde », bulle « Après l'intervention » | « Tu choisis ensuite « Complétée » : le « Bilan post-intervention » apparaît. Pour chaque critère ciblé, il compare ses résultats avant et après. » | « Tu choisis ensuite « Terminée » : le « Bilan post-intervention » apparaît. Pour chaque critère ciblé, il compare ses résultats avant et après. » |
| `js/parcours-lire-ta-classe.js`, « Nous faisons », bulle « Après l'intervention » | « Tu choisis ensuite « Complétée ». » | « Tu choisis ensuite « Terminée ». » |
| `js/accompagnement-contenu-popup.js`, aide « i » des interventions | « Bilan — Apparaît quand tu marques l'intervention comme complétée. Comparaison automatique avant/après sur les critères ciblés. » | « Bilan — Apparaît quand tu marques l'intervention comme terminée. Comparaison automatique avant/après sur les critères ciblés. » |
| `js/accompagnement-contenu-popup.js`, même aide, l'exemple | « … Quand tu marques l’intervention comme complétée, le bilan compare les scores avant et après sur les critères ciblés. … » | « … Quand tu marques l’intervention comme terminée, le bilan compare les scores avant et après sur les critères ciblés. … » |
| `index.html`, carte d'aide « Planifier une intervention » | « … et le statut, « En préparation » ou « Complétée ». » | « … et le statut, « En préparation » ou « Terminée ». » |

`js/accompagnement-contenu-hover.js` (mesuré) : aucune bulle ne nomme le statut d'une intervention. Son seul « complétée » (« pour chaque évaluation complétée », clé de la ligne 448) parle d'une évaluation : laissé, fichier non touché.

Preuve : `tests/unit/intervention-statut-terminee-2026-11-27.test.js` (break-test : 6 rouges). Le banc du parcours 7 (`sentinelle-parcours-lire-ta-classe-2026-11-22`), qui compare les bulles aux consignes du 22 nov. mot pour mot, applique la retouche du 27 nov. en citant ce rapport ; sur l'ancien code, 2 rouges.

## 5. Trouvailles en chemin, et leur issue

- **`trouverCritereDepistage` et `calculerIPB` acceptent aussi un préfixe** (`js/profil-etudiant-calculs.js:873` et `:1075`, `startsWith`) : au dépistage, « Structure » répond à « Structure du texte ». C'est le contraire du « rien de plus » de la fiche 3, mais y toucher change des défis calculés. **Remonte à Grégoire** (ce qu'un critère mesure). Non touché.
- **La légende du graphique des critères insère le nom sans `echapperHtml`** (`js/profil-etudiant-sections-affichage.js`, `${critere}` dans `_genererGraphiqueCriteresHTML`), et son `data-critere` échappe l'apostrophe par une barre oblique que la bascule relit telle quelle : un critère nommé « Qualité de l'expression » ne se masquerait pas (lu au code, non vécu). Règle de sécurité n° 1. **Inscrire et continuer**, mais je n'ai pas pris de numéro : le compteur est commun et deux sessions tournent en parallèle. À Cowork.
- **La même règle de nom s'écrit à plusieurs endroits** : `_normaliserNomCritere` (calculs), `cleCritere` (helpers), trois copies en ligne dans `js/interventions.js` (bilan, pré-cochage, suggestion) et `normaliserNomCritere` dans `js/trimestres.js`. Même règle partout aujourd'hui : **sans conséquence observable**, noté ici seulement.
- **Un « complétées » sur le statut, hors de la liste de la fiche 4** : `js/profil-etudiant-sections-affichage.js:3333`, « Les captures sont enregistrées automatiquement chaque semaine et lors d'interventions RàI complétées. » Le mandat bornait les fichiers : **laissé, à Grégoire** (des mots qu'il lit).
- `js/accompagnement-contenu-popup.js:608` et `:615` (« complétées », « Complété ») parlent des évaluations : laissés.
- **Au BACKLOG** : #1190 est cochée avec sa preuve. Les fiches 3 et 4 n'y ont pas d'entrée (mesuré) ; je n'en ai pas créé, même motif que plus haut. La fiche 2 n'est pas cochée.

## 6. Vérifié, et pas vérifié

- Vitest complet depuis `tests/` : voir la dernière ligne de ce rapport. Les jetons anti-cache des sept fichiers touchés portent le jour du build en ligne (`20261126d` ; `20261126e` pour `js/interventions.js` et `js/profil-etudiant-helpers.js`, que deux commits touchent : le garde pre-commit veut une lettre neuve à chaque commit) ; la sentinelle anti-cache et le garde pre-commit passent.
- **Rien sous WebKit ni sous Chromium** (aucun navigateur dans le conteneur). À regarder à l'écran :
  - la phrase sous la bande P de Suivi › Aperçu, sur la démo (seuils D et M) et sur un groupe à l'échelle de départ (attendu : la phrase se tait) ;
  - le graphique des critères d'un profil : une courbe par critère quand deux copies écrivent le nom autrement, la légende pareille, la bascule d'une courbe ;
  - une intervention rouverte : ses critères cochés ;
  - la pastille « Terminée », le choix du statut, la liste vide, les bulles « Après l'intervention » du parcours 7 et l'aide « i » ;
  - l'essai Playwright `niveau-sans-seuils.spec.js`, modifié et non joué.
- Écart à noter : dans le commit de la fiche 3, le commentaire de `criteresDistinctsDesEvaluations` portait ses accents en séquences `\u00e8` littérales (un défaut de mon outil d'écriture) ; corrigé dans le commit de clôture, commentaire seulement.
- Avant toute fusion : le verdict du Mac.

**Vitest complet** (27 nov., conteneur, depuis `tests/`, sur `528f68a6` plus le commentaire corrigé) : 967 fichiers, 12 497 essais verts.
