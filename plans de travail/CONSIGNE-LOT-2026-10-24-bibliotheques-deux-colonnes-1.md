# Consigne – Les bibliothèques en deux colonnes, lot 1 : le composant et la bibliothèque des grilles

> Écrite par Cowork le samedi 24 octobre 2026 vers 20 h (Toronto), sur `main` = `914a0d31`.
> **Remesurée par Cowork le dimanche 25 octobre 2026 à 7 h 30, sur `main` = `05843aba`** : `js/bibliotheque-ui.js` et `js/grilles-bibliotheque.js` inchangés depuis `914a0d31` ; dans `js/grilles.js`, aucun changement ne touche la fenêtre de bibliothèque (seule la chaîne des grilles a bougé, #1149 lot 3b). La consigne tient.
> Plan : `PLAN-2026-10-24-bibliotheques-deux-colonnes.md` (lis ses sections « Ce que la mesure a établi » et « Les règles qui valent pour tous les lots » : elles font partie de cette consigne).
> **La référence visuelle est la maquette** `plans de travail/MAQUETTE-2026-10-24-bibliotheque-deux-colonnes.html`. Ouvre-la dans un navigateur, en clair et en sombre, à 1440 px et à 820 px. Ses données sont fictives et son code n'est pas à recopier : c'est l'apparence et les gestes qui comptent.

## 0. Avant tout

- **Sur une branche partie de `main`** (règle 7 § 5 de `PROTOCOLE.md`, nom à ton choix). La version du soir part de `main` avec les lots relus du 24 (#1148, #1151, #1149, #1153, #1152, #1150) et ne doit pas porter celui-ci, qui attend la fin du lot 3 (plan, « La livraison »). Les lots 2 et 3 continuent sur la même branche ; elle ne rejoint `main` qu'une fois le lot 3 relu et la version du soir en ligne. Le merge attend : note-le dans `RELAIS.md` (règle de relais de `CLAUDE.md`).
- **Un seul lot à la fois.** Ne commence que lorsque le lot en cours (chaînes d'étapes 3b, Aide, ou autre) est commité, sur un `main` à jour, et qu'aucune suite ne tourne.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, le plan, la maquette, l'audit `AUDIT-2026-10-24-apparence-des-bibliotheques.md` et ses captures `captures-2026-10-24-audit-bibliotheques/`.
- **Les fiches** : pose au BACKLOG une fiche par lot du plan (six), à partir du compteur « Dernier ID utilisé » (règle 9), avec la phrase de l'utilisateur de chaque lot ; reporte les numéros dans la colonne « Fiche » du plan.

## 1. Ce que le lot livre, en gestes

Conception › Grilles de critères › « Consulter la bibliothèque ». **Les neuf autres fenêtres de bibliothèque ne changent pas.**

1. **La fenêtre** s'élargit (environ 1100 px au plus). En-tête sur une ligne : le titre « Bibliothèque de grilles de critères », le bouton d'aide existant, **« Importer ou exporter ▾ »**, la fermeture.
   - Le menu porte les gestes de fichier d'aujourd'hui, avec leurs actions d'aujourd'hui : « Importer des grilles » (l'import JSON), « Importer le partage d'une ou d'un collègue » (`partageImport.ouvrirSelecteurFichier`), un séparateur, « Exporter les grilles de ce trimestre » (l'export JSON), et une note « Fichiers .json et .lcz ».
   - Les quatre boutons du milieu disparaissent. « Ajouter mes grilles à la bibliothèque » devient « Tout garder dans ma bibliothèque » (point 3).
2. **Deux colonnes côte à côte**, chacune dans son panneau :
   - **« Dans ce trimestre »** (compte entre parenthèses), sous le titre : « Les grilles que le menu de l'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l'exemplaire de ta bibliothèque. » Elle liste ce que la section 1 liste aujourd'hui.
   - **« Dans ta bibliothèque »** (compte), sous le titre : « Les grilles que tu gardes pour tous tes trimestres. C'est d'ici que tu peux les partager. » Elle liste ce que la section 2 liste aujourd'hui, **y compris les grilles déjà présentes dans le trimestre** (état calme, point 3), sauf quand « Masquer » est coché.
   - ⚠ La seconde phrase de « Dans ce trimestre » n'est vraie que si les deux sens du passage créent des objets séparés. Le sens bibliothèque → trimestre est mesuré (plan, n° 5). **Mesure l'autre sens** (`importerGrillesDansBibliotheque`). S'il partage l'objet, retire la phrase et dis-le dans la demande de relecture.
3. **Le passage, un seul geste par rangée** (bouton principal, la seule couleur forte de la fenêtre) :
   - rangée du trimestre : **« Garder dans ma bibliothèque → »**, qui fait pour UNE grille ce que « Ajouter mes grilles à la bibliothèque » fait pour toutes. Si la grille y est déjà : **« ✓ Aussi dans ta bibliothèque »**, en texte, sans bouton ;
   - rangée de la bibliothèque : **« ← Utiliser dans ce trimestre »** (`ajouterGrilleIndividuelle`). Si elle y est déjà (le `dejaPresent` d'aujourd'hui) : **« ✓ Déjà dans ce trimestre »** ;
   - **« Tout garder dans ma bibliothèque »** (`ajouterMesGrillesALaBibliotheque`), bouton-texte dans l'en-tête de « Dans ce trimestre », affiché quand au moins deux grilles du trimestre n'y sont pas encore ;
   - « Aussi dans ta bibliothèque » se décide par **le critère qu'utilise déjà** `importerGrillesDansBibliotheque` pour compter ses « existantes ». Aucune règle d'identité neuve (#476).
4. **Les rangées compactes** : le nom, puis une ligne en clair, puis à droite le passage et ⋮.
   - La ligne : les types des critères en mots (« Holistique », « Holistique et algorithmique » ; les libellés de type existants de l'app), puis « 1 critère » ou « 5 critères » (jamais « critère(s) »), puis « par <auteur> » seulement quand l'auteur n'est pas l'utilisateur actif (le « par Labo Codex » existant).
   - **Plus de badges** HOLIS, MIXTE… **Plus de puce d'identifiant**, sauf sur une rangée que le bandeau des doublons nomme (#291 : elle sert à la retrouver).
   - **Le nom est un bouton** qui déplie l'aperçu sous la rangée : la description s'il y en a une, puis les critères (nom, type, pondération) et le total. `aria-expanded`. Plusieurs aperçus peuvent être ouverts.
5. **⋮, les gestes d'aujourd'hui, à leur place** :
   - rangée du trimestre : « Dupliquer » (`dupliquerGrilleBibliotheque`, le bouton vert d'aujourd'hui), « Exporter pour partager », **« Retirer de ce trimestre »** (`retirerGrilleDeBibliotheque`), **« Supprimer définitivement »** (`supprimerGrilleDefinitivement`), ces deux derniers en rouge ;
   - rangée de la bibliothèque : « Classer dans : … » et « Retirer du dossier » (les dossiers, #327), **« Supprimer de ma bibliothèque »** (`supprimerGrilleDeBibliothequePartagee`), en rouge ;
   - **⚠ Vérifie la correspondance** (plan, mesure n° 6) : si « Retirer » ou l'un des « Supprimer » ne fait pas ce que son nouveau libellé dit, **n'invente pas de mot**. Garde le libellé d'aujourd'hui et pose la question dans la demande de relecture : Cowork la soumettra à Grégoire.
6. **La barre de la bibliothèque**, au-dessus de ses rangées : un menu « Tous les dossiers » / « Non classées » / les dossiers / « Gérer les dossiers… » (qui ouvre, à la demande, la création et le renommage d'aujourd'hui), et la case **« Masquer ce qui est déjà dans ce trimestre »** (même clé de préférence, `biblio-masquer-deja-present`). La boîte « Mes dossiers » dépliée par défaut disparaît. **Le libellé de la case ne change que dans la nouvelle fenêtre** : les quatre autres qui l'emploient gardent le leur jusqu'à leur lot.
7. **Ce qui existe et doit continuer de marcher, et où il va** :
   - le bandeau des doublons (#291) : en haut de la fenêtre, au-dessus des colonnes ; son « Voir » mène à la rangée (garde l'ancre `data-biblio-item-id`) ;
   - « Importer depuis un autre trimestre » : au pied de « Dans ce trimestre », replié sur une ligne, ses mots et son comportement d'aujourd'hui (garde D-C7 comprise) ;
   - « Partagés par des collègues » (#329 P4, `partageSection.genererSectionHTML('grille')`) : dans « Dans ta bibliothèque », sous son propre intertitre, avec son geste « Dupliquer vers mes documents » d'aujourd'hui ;
   - après chaque passage, la fenêtre reste ouverte **à la même position de défilement** (la plainte du 24 août ; `capturerImportTrimestre` / `restaurerImportTrimestre` montrent le patron), et les aperçus ouverts le restent si c'est simple ; sinon, dis-le.
8. **Sous 760 px de largeur de fenêtre** (iPad en portrait) : les panneaux s'empilent, « Dans ce trimestre » d'abord, et les flèches tournent : « Garder dans ma bibliothèque ↓ », « ↑ Utiliser dans ce trimestre ». Une requête de conteneur sur la fenêtre, pas sur l'écran.

## 2. Comment

- **Le composant impose la structure ; `js/grilles.js` ne fournit plus que des données** (plan, « Le principe technique »). Nom et forme de l'API : à ton choix, dis-les dans la demande de relecture.
- **Aucun style en ligne** dans le HTML généré. Des classes dans `styles.css`, les jetons existants des deux modes (la maquette n'en emploie pas d'autres ; `design-system.html` fait foi). Cibles de 44 px. Focus visible. Échap ferme d'abord un menu ouvert, puis la fenêtre.
- **Sécurité** : `echapperHtml` sur tout nom, description et nom de critère (aperçu compris) ; `echapperAttribut` dans les attributs ; `data-action` (aucun gestionnaire en ligne).
- **Réemploie** : `renderMenuActions`, le moteur des dossiers (`BibliothequeUI.repertoires`), `filtrerParModeDemo`, `filtrerParDejaPresent`, les notifications existantes pour dire qu'un passage est fait. Pas de doublon de ces aides.
- `creerModal`, `renderCarteSelection` et `renderCarteDisponible` restent : neuf fenêtres s'en servent encore.

## 3. Fichiers

`js/bibliotheque-ui.js`, `js/grilles.js` (la fenêtre de bibliothèque et ses préparations seulement), `js/grilles-bibliotheque.js` si le passage à l'unité l'exige, `styles.css`, `index.html` (le jeton), les bancs. Un autre fichier à toucher : dis lequel et pourquoi dans la demande de relecture. **Jamais** `js/config.js` ni `js/navigation.js`.

## 4. Les pièges connus

1. **Trois gestes, deux mots validés** (§ 1.5). Ne force pas la correspondance.
2. **Une grille retirée** (`dansBibliotheque = false`) **qui n'est pas dans la bibliothèque** : réapparaît-elle quelque part ? Mesure-le. Si elle devient introuvable, **ne corrige pas** : inscris-le (issue 2) et dis-le.
3. **Le drapeau `dansBibliotheque`** veut dire « dans le menu de l'écran » sur une grille du trimestre, pas « dans la bibliothèque ». Ne t'y fie pas pour l'état « Aussi dans ta bibliothèque » (§ 1.3).
4. **Tarir n'est pas réparer** : ce lot ne change que la présentation. Si une écriture de données change, arrête-toi.
5. **Les bancs** : environ vingt fichiers touchent cette fenêtre (plan, mesure n° 7). Ceux qui parlent de la fenêtre des grilles se réancrent sur la nouvelle structure, motif écrit dans le fichier ; ceux des autres fenêtres ne bougent pas. Les sentinelles #291, #458, #468, #476 et #793 doivent prouver la même défense qu'avant : break-test pour chacune que tu touches.
6. **Le `<select>` des dossiers sous WebKit** ignore `min-height` : patron de `.rangee-selection` (hauteur fixée, apparence retirée, chevron redessiné).
7. **Le mode démo** : les grilles démo restent filtrées comme aujourd'hui hors démo.

## 5. La preuve exigée

- **Un banc Playwright neuf**, dans le vrai `index.html`, depuis la démonstration, à 1440 px puis à 820 px :
  - les deux titres de colonne, mot pour mot ; plus aucun des quatre boutons du milieu ; « Importer ou exporter ▾ » ouvre un menu dont chaque entrée porte l'action d'aujourd'hui ;
  - « ← Utiliser dans ce trimestre » sur une grille de la bibliothèque : elle apparaît dans « Dans ce trimestre » et sa rangée de bibliothèque dit « ✓ Déjà dans ce trimestre » ; le sens inverse, de même ; « Tout garder dans ma bibliothèque », de même ;
  - l'aperçu : le nom déplie les critères et le total ; `aria-expanded` suit ;
  - ⋮ : les libellés et leurs actions (§ 1.5) ;
  - aucune puce d'identifiant ni badge de type visible sans doublon ; avec un doublon semé, la puce apparaît sur la rangée nommée et « Voir » y mène ;
  - à 820 px, les panneaux sont l'un sous l'autre (boîtes mesurées) et les flèches sont ↓ et ↑ ;
  - toutes les cibles de la fenêtre font au moins 44 px ; la position de défilement survit à un passage.
- **Break-test** pour chaque famille d'assertions neuve ; une assertion négative porte sur une tranche prouvée non vide (règle 10).
- **Les captures pour Grégoire** : `plans de travail/captures-<date>-bibliotheques-deux-colonnes-1/`, Mac 1440 clair et sombre (un aperçu et un ⋮ ouverts), iPad 820 clair.
- Vitest, puis les specs Playwright de bibliothèque et de grilles. Le verdict complet suit la règle 7 (le soir, au signal de Grégoire).

## 6. Ce qui n'entre pas

- Les neuf autres fenêtres (lots 2 à 6) et leurs bancs.
- Tout geste neuf (pas de « Dupliquer » sur une rangée de bibliothèque s'il n'existe pas aujourd'hui ; pas de confirmation dans la rangée : « Retirer » et les « Supprimer » gardent les leurs).
- L'aide « Comment fonctionne la bibliothèque » (fin du lot 3).
- Les données, les clés, les règles d'identité.
- La rangée de sélection et la chaîne d'étapes de l'écran.

## 7. Clôture

- Un commit `feat(bibliotheques)`, qui nomme la fiche du lot 1.
- **Pas de release, ni verdict, ni push** : la release attend la fin du lot 3 (plan, « La livraison »), au signal de Grégoire.
- La ligne du lot 1 au plan (« codé, en relecture », le SHA).
- **Demande de relecture** : `plans de travail/DEMANDE-RELECTURE-<date>-bibliotheques-deux-colonnes-1.md`. Elle dit : ce que tu as mesuré et ce que tu as supposé ; la correspondance des trois gestes de ⋮ (§ 1.5) ; ce que tu as trouvé pour une grille retirée (piège 2) ; si la phrase sur l'exemplaire est restée (§ 1.2) ; l'API choisie ; chaque banc réancré, avec son motif ; tes écarts avec cette consigne ; les trouvailles et leur issue.
