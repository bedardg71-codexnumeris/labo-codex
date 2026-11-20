# Rapport — les noms des deux seuils (19 nov. 2026, soir)

**Dernier relais.** Branche `lot/autoevaluation-consignes` (PR n° 33), même session que la grille d'autoévaluation.
Consigne : `plans de travail/CONSIGNE-LOT-2026-11-19-noms-des-seuils.md` (copiée avant de coder, `7182a083`). Les
retouches de 9 h 16 étaient faites (`9a523cc7`). Fait : les cinq points. **`main` rapproché** (`39555902`, voir
« Suppositions », 1) : la branche contient la 1.250.0. Ni fusion vers `main`, ni release, ni Nouvelles écrites.
Reste : le regard de Grégoire sur l'aperçu de la PR n° 33 ; les signalements de la fin de ce rapport.

## Ce qui est fait

1. **L'écran de l'échelle** (`js/echelles.js`). Titre « Seuils de réussite et de maîtrise » (une constante,
   `TITRE_SEUILS_ECHELLE`, pour le bloc et le refus à l'enregistrement) ; menus « Seuil minimal de réussite » et
   « Seuil de maîtrise » (`REPERES_ECHELLE`, clés inchangées) ; le paragraphe, mot pour mot. Alignés dans la même
   fiche : l'étape de la chaîne « Repères » → « Seuils » ; le refus d'ordre « Le seuil minimal de réussite ne peut pas
   être plus haut que le seuil de maîtrise. » ; « Repère inconnu. » → « Seuil inconnu. » (garde, jamais vue sans DOM
   trafiqué).
2. **L'éditeur de grilles** (`js/grilles.js`, `styles.css`). Dans « Ce qui est attendu à chaque niveau », la case du
   niveau qui porte le `seuilSuffisance` de l'échelle montrée dit « Seuil minimal de réussite » à côté du nom ; celle du
   `seuilMaitrise`, « Seuil de maîtrise » ; les deux sur le même niveau : les deux, réussite puis maîtrise. Échelle sans
   seuils : aucune étiquette, la case d'avant au caractère près (banc E.c). L'étiquette se lit, rien ne s'y règle. Forme :
   texte secondaire de 0,75 rem, un filet de 2 px à gauche (`--bordure-moyenne`, un ton au-dessus du filet de la case) ;
   elle passe sous le nom quand la case est étroite. Les mots viennent de `REPERES_ECHELLE` (exposé sur `window`), une
   seule source.
   **#1294 mesuré** : la rangée des cases a la même largeur avec et sans étiquettes, à 1 180, 820 et 390 px ; aucune
   case, ni la carte, ni la page ne débordent ; aucune étiquette ne dépasse sa case. #1294 lui-même reste (la rangée va
   plus loin que la colonne des champs, comme avant).
3. **La page d'autoévaluation** (`js/export-pdf.js`) : « Le seuil minimal de réussite correspond au niveau D de
   l'échelle ; le seuil de maîtrise, au niveau M. » Les étiquettes « Réussite : » et « Maîtrise : » restent.
4. **Le mot de l'aperçu** (`index.html`) : « Grille d'autoévaluation : dans Conception › Échelles de performance,
   indique pour cette échelle le « Seuil minimal de réussite » et le « Seuil de maîtrise ». »
5. **Le reste de l'application** : les textes que lit l'enseignant·e, alignés (liste ci-dessous) ; les autres,
   signalés sans y toucher (plus bas).

### Point 5 — ce qui est aligné (lu par l'enseignant·e)

- **Aide** (`index.html`) : « Créer une échelle » (« Sous les niveaux, « Seuil minimal de réussite » et « Seuil de
  maîtrise » posent les deux seuils de l'échelle ; l'étape « Seuils » de la chaîne dit s'ils sont posés. ») ; tableau
  de bord (« Le filtre sur P part du « Seuil minimal de réussite » de ton échelle, ou de la note de passage sans ce
  seuil ») ; table des paliers (« P se lit dans les seuils de ton échelle, « Seuil minimal de réussite » et « Seuil de
  maîtrise » ; sans ces seuils, seule la note de passage… ») ; RàI (« Ce seuil est le « Seuil minimal de réussite » de
  l'échelle de tes copies ») ; patterns (quatre lignes : « sous le seuil minimal de réussite (sans ce seuil, sous la
  note de passage) », « sous le seuil de maîtrise », « au seuil de maîtrise ou au-dessus », « au seuil minimal de
  réussite ou au-dessus »).
- **Guide pédagogique** (`js/guides-pedagogiques.js`) : les trois patterns (mêmes mots) et la phrase du niveau
  d'intervention (« le « Seuil minimal de réussite » de ton échelle, ou la note de passage sans ce seuil »).
- **Glossaire et infobulles** : `accompagnement-contenu-terme.js` (« P, lui, se lit dans les seuils de l'échelle » ;
  RàI « sous le seuil minimal de réussite (celui de l'échelle, la note de passage sans ce seuil) ») ;
  `accompagnement-contenu-hover.js` (« P suit les seuils de ton échelle » ; « (la note de passage, sans ce seuil) ») ;
  `accompagnement-contenu-popup.js` (« Suggérer » vise « le prochain seuil de ton échelle »).
- **Réponse du groupe** (`js/profil-etudiant-calculs.js`, textes validés le 31 oct.) : « Seuil minimal de réussite :
  65 %, celui de ton échelle. » ; « … la note de passage (ton échelle n'a pas de seuil minimal de réussite). »
- **Assistant de pratique** (`js/wizard-pratique-v2.js`) : « Les seuils de réussite et de maîtrise de cette échelle se
  posent dans… » ; « … ses seuils de réussite et de maîtrise se posent dans… » ; « Sans ces deux seuils, la
  rétroaction… » ; récapitulatif « Seuils de réussite et de maîtrise : seuil minimal de réussite D, seuil de maîtrise
  M » et « … : non posés — … ». L'étape reprend le bloc de l'éditeur d'échelles (point 1).
- **Aperçu d'un partage reçu** (`js/partage-validation.js`, texte validé le 25 sept.) : les libellés copiés de l'écran,
  et « Échelle « X » : le « Seuil de maîtrise » désigne le niveau « Z », qui n'existe pas dans cette échelle. Ce seuil
  n'est pas importé ; tu pourras le poser dans l'éditeur d'échelle. »

### Signalés, non touchés (à Cowork)

- **Ce que lit l'IA qui écrit les cartouches** (`js/cartouches.js`, `composerModeleCartouche`, le fichier .md que
  l'enseignant·e télécharge) : « cette échelle ne porte PAS de repère « Maîtrisé à partir de » » (l. 2433) ;
  « ← « Maîtrisé à partir de » : à partir d'ici » et « ← « Suffisant à partir de » : à partir d'ici » (l. 2494-2495).
  Ces noms n'existent plus à l'écran. Rangé sous « cartouches » faute de mieux ; un banc (`sentinelle-593`) interdit
  aussi « seuil de maîtrise » dans ce modèle. Aucun texte que reçoit l'élève ne porte un ancien nom (mesuré).
- **Les Nouvelles passées** (`js/changelog-data.js`) : douze lignes, 1.105 à 1.228 (« Le niveau RàI suit ton seuil de
  réussite », « Suffisant à partir de », « repères de maîtrise »…). Laissées telles quelles.
- **`config.seuilReussite` et la note de passage de 60 %**, nommée « seuil de réussite » : `index.html` (aide de la
  note, l. 10275), `guides-pedagogiques.js` (l. 264, 348). Laissés.
- **Ambiguïtés, à trancher si besoin** : les zones « suffisant » / « maîtrisé » écrites sous chaque niveau dans
  l'aperçu de l'échelle (`LIBELLE_ZONE`, `echelles.js`) : des zones, pas les seuils, laissées ; « le prochain seuil
  IDME atteignable » (`accompagnement-contenu-hover.js`, l. 620) ; « seuil » au sens des bornes min et max d'un niveau
  (`accompagnement-contenu-hover.js` l. 290, 294, 350 ; `accompagnement-contenu-terme.js` l. 118 ; `etats-vides.js`
  l. 120) et les « seuils personnels » du dépistage : le mot « seuil » sert maintenant aussi ces deux seuils.

## Suppositions nommées

1. **`main` rapproché maintenant** (fusion `39555902`). La consigne de 9 h 16 disait de ne pas reprendre `main` pendant la
   mise en ligne de midi ; elle est faite (1.250.0, `ade09e93`), et le point 2 s'appuie sur le filet de 2 px de la case
   et sur #1294, qui n'existaient que sur `main`. Conséquence : `main` avait pris #1289 à #1295 entre-temps ;
   l'inscription de la branche (les neuf rouges d'import sous Chromium) est renumérotée **#1296**, l'en-tête du
   BACKLOG le dit. (Puis **#1300** à l'assemblage de la release : `lot/glisser-alignement` avait pris #1296.)
2. **Les étiquettes** paraissent sur les cases de l'échelle montrée d'un critère par niveaux. Ni les « textes gardés
   d'une autre échelle », ni un critère en points. Les codes se comparent sans casse ni espaces.
3. **La règle #577** (« l'assistant ne dit jamais « seuil » : le mot appartient au dépistage », 28 août) est levée par la
   décision : son banc garde désormais l'inverse (l'étape nomme les deux seuils, ne dit plus « repère »).
4. **Les reformulations** du point 5 sont les miennes, là où remplacer mot pour mot donnait « le repère « Seuil minimal
   de réussite » », ou une redite (« Seuil minimal de réussite : 65 %, le « Seuil minimal de réussite »… » devenu
   « … 65 %, celui de ton échelle. »). Deux textes validés par Grégoire changent ainsi (31 oct., 25 sept.).
5. **L'étiquette de « Développement »**, à 1 180 px, ne tient pas à côté du nom et passe dessous : son champ descend
   d'une ligne, celui de « Maîtrise » non (capture `etiquettes-1180x820-*`). Laissé tel quel ; à son regard.

## Ligne de Nouvelles proposée

« Les deux repères de tes échelles portent maintenant leur nom, « Seuil minimal de réussite » et « Seuil de
maîtrise », et la case du niveau qui porte un seuil le dit dans l'éditeur de grilles. »

## Bancs

- **Vitest** `tests/unit/noms-des-seuils.test.js` : 9 essais (N l'écran de l'échelle, E les étiquettes). Break-tests,
  code restauré à l'octet : seul le seuil de réussite étiqueté → E.a à E.d ; en-tête posé sans étiquette → E.c ; codes
  comparés tels quels → E.d ; anciens noms des menus → N.a, N.b, E.a à E.c ; étiquette non échappée → E.f ; étiquette
  sur toutes les cases → 5 rouges.
- **Playwright Chromium** `tests/integration/noms-des-seuils.spec.js` : 3/3, paysage 1 180 × 820, portrait 820 × 1 180,
  téléphone 390 × 844 (l'écran de l'échelle, ses menus ; avec, sans, deux seuils sur le même niveau ; #1294).
  Break-test : seul le seuil de réussite étiqueté → rouge (l. 106).
- **Bancs ajustés aux mots neufs** (↻ 19 nov., chaque ligne marquée) : `sentinelle-aide-2026-10-28-lot-2c-bis`,
  `sentinelle-niveau-au-critere-2026-10-30`, `sentinelle-reponse-du-groupe-2026-10-31`, `chaines-etapes-1149-lot-3b`,
  `sentinelle-555-e`, `sentinelle-577`, `sentinelle-aide-2026-10-28-lot-5`, `partage-echelle-reperes-583` (unité et
  spec), `echelle-reperes-maitrise-rendu.spec`, `wizard-577-reperes-echelle-rendu.spec`, `autoevaluation-consignes`
  (unité et spec) ; cliquet `sentinelle-555-d` (`grilles.js` lit `seuilMaitrise` une fois).
- **Suite Vitest complète** : 934 fichiers, 11 957 essais, verts. **Chromium** (onze fichiers : seuils, autoévaluation,
  échelle, assistant, partage, réponse du groupe, tableau de notation, descripteurs) : 62/62. Pas de verdict WebKit.
- **Anti-cache** : les onze fichiers touchés à `?v=20261119d` (build 1119-0906, `version.json` intact).

## Captures

`plans de travail/captures-2026-11-19-noms-des-seuils/` : `etiquettes-*` (D et M) et `deux-seuils-meme-niveau-*`, à
1 180 × 820, 820 × 1 180 et 390 × 844 (téléphone), sombre et clair (Chromium).

## Complément du 19 nov., 17 h 40 — deux mesures (rien codé)

Décision de Grégoire (17 h 38) : les descripteurs restent dans la grille ; il aura peut-être une grille par
production (mêmes critères, descripteurs propres à la tâche). Deux mesures demandées par Cowork, sans correction.

### (a) Deux grilles aux mêmes critères : une série, ou deux ? — LU AU CODE

Inventaire fait par un agent de lecture, points porteurs revérifiés au code (les lignes citées). Ce qui suit est LU,
sauf ce qui est marqué inférence.

**Le rapprochement se fait par le NOM du critère, jamais par son identifiant.** Chaque évaluation garde, par critère
noté, un instantané `{ critereId, critereNom, niveauSelectionne, … }` pris dans la grille au moment d'enregistrer
(`evaluation-sauvegarde.js`, `_collecterCriteresSauv`) ; tout ce qui cumule lit `critereNom`. Aucun lecteur vivant
ne regroupe par `critereId` ; aucun par position, code ou palier SOLO. Deux manières de comparer les noms :

1. **Nom normalisé, rapporté à LA grille de référence du dépistage** (une préférence unique,
   `grilleReferenceDepistage`) : minuscules, sans accents, sans espaces (`_normaliserNomCritere`,
   `profil-etudiant-calculs.js`), puis égalité **ou préfixe** (`trouverCritereDepistage` : « Structure » rejoindrait
   « Structure du texte »). Lecteurs : les moyennes par critère du profil, forces et défis, défi principal, pattern,
   IPB (suivi des fondations), carte RàI et « critère de fondation », les directions et « progrès » du profil (égalité
   normalisée, sans préfixe), les « défis communs du sous-groupe » et l'avant/après des interventions, l'aperçu du
   tableau de bord, l'export de recherche (`trimestres.js`, avec sa propre normalisation, espaces → `_`).
   ⮕ **Une seule série** pour deux grilles dont les critères portent le même nom, **à condition que ce nom existe dans
   la grille de référence du dépistage** : un critère qui n'y est pas est ignoré (avertissement en console seulement).
2. **Nom brut, à l'octet près** : le bilan de la rétroaction, « Points récurrents… depuis N productions »
   (`synthese-retroaction-data.js`, `lignesRecurrentes`, et son jumeau à l'écran `evaluation-retroaction.js`), « Tu as
   progressé en… » / « à consolider » (copie précédente seulement) ; le graphique « Critères » du profil
   (`graphiques-progression.js`, `obtenirDonneesCriteres`) et celui des trajectoires du groupe.
   ⮕ **Une seule série si les deux noms sont identiques à l'octet** ; **deux séries** dès qu'ils diffèrent d'une
   majuscule, d'un accent ou d'une espace. Le bilan lit toutes les copies antérieures du trimestre et du cours, quelle
   que soit leur grille.

**Ne cumulent pas par critère** : le tableau de notation (ses copies n'ont pas de critères), les indices A, C et P (P
vient de la note de chaque copie), « Présentement » et « Ta force » (copie courante seulement), le signalement de
dépistage (par critère dans la grille de la copie, sans série). **D'un trimestre à l'autre : rien ne compare des
critères** ; tout se lit dans le trimestre actif, et le registre longitudinal garde une tuile par copie.

**Où deux grilles feraient deux séries** : (i) le bilan de la rétroaction (« Points récurrents », « Tu as progressé
en ») et les deux graphiques, si les noms ne sont pas identiques à l'octet ; (ii) `identifierDefiSpecifique`, seule
clé par identifiant (`critereId || critereNom`), mais elle n'a plus d'appelant (retirée le 11 sept., #824). Et une
absence plutôt qu'une série : tout critère dont le nom manque à la grille de référence du dépistage disparaît du
profil, du dépistage et des interventions.

**Ce qu'il faudrait pour « une grille par production »** (non fait, consigne) : en l'état, rien d'obligatoire, si
Grégoire garde **les mêmes noms, au caractère près**, dans toutes ses grilles, et si **sa grille de référence du
dépistage porte ces noms**. Pour que ce ne soit plus une discipline à tenir : une seule règle de rapprochement pour tous
les lecteurs (le nom normalisé du profil, appliqué aussi au bilan et aux graphiques) ; et, s'il veut que le lien
survive à un renommage, une identité de critère stable entre grilles (la duplication garde déjà les identifiants,
mais rien ne les lit). Deux nuances à trancher alors : le rapprochement par préfixe peut fondre deux critères voisins ;
et un critère renommé dans la grille ne renomme pas les copies déjà notées (`critereNom` est un instantané).

### (b) Dupliquer une grille — MESURÉ, et un défaut de données

**Le geste existe**, à deux endroits atteignables : le bouton « Dupliquer » de l'éditeur d'une grille
(`#btnDupliquerGrille` → `dupliquerGrilleActive` → `dupliquerGrilleDepuisSidebar`, `js/grilles.js`) et « Dupliquer »
dans la bibliothèque des grilles (`dupliquerGrilleBibliotheque` → `BibliothequeUI.dupliquerVersBibliotheque`). Un
troisième, « Dupliquer pour créer ma grille » sur une grille de démonstration (`dupliquerEtEditerGrille` →
`forkerItem`), fait un clone profond. Un quatrième, `dupliquerGrille` (identifiants de critères neufs), n'est rendu que
dans des conteneurs cachés (`vueGrillesCriteres`, « Conteneurs cachés pour compatibilité », et un `#listeGrilles` qui
n'existe plus) : il n'est pas atteignable à l'écran.

**Ce que la copie garde** (mesuré au navigateur, Chromium, les deux chemins atteignables) : une grille neuve
(`GRILLE_…`, nom « … (copie) »), ses critères **avec leurs identifiants d'origine** (`CR_…` identiques à la source),
leur type, leur pondération, leurs descripteurs (`echelleId` et `parNiveau`) et leur « Pour vérifier ». La grille n'a
pas d'échelle à elle : chaque critère garde l'échelle de ses descripteurs. **Ce qu'elle perd** : ses cartouches (elles
vivent sous `cartouches_<id de la source>` ; aucun des deux gestes ne les copie, lu au code), `metadata_cc`,
`auteurOriginal`, `idOriginal` ; elle prend l'auteur actif et `inspireDe`.

**⚠ LE DÉFAUT, mesuré.** Les deux chemins atteignables copient la grille par étalement (`{ ...grille }`,
`Object.assign`) : la copie ne reçoit pas SES critères, elle reçoit LE MÊME tableau `criteres` que la source.
IndexedDB, qui enregistre par clonage structuré, garde ce partage tel quel : relus par `db.get`, les deux grilles
pointent vers les mêmes objets critères (`source.criteres === copie.criteres`, mesuré dans IndexedDB même, petite et
grande collection). Conséquence mesurée : **modifier le texte du niveau D dans la copie l'a modifié dans la source**, en
une seule écriture, et c'est encore vrai après rechargement. Tout ce qui s'écrit sur un critère par la file commune
(descripteurs, « Pour vérifier », nom, pondération, sous-critères…) suit le même chemin (inférence : même
`_modifierCritereCible`, non mesuré geste par geste). Le JSON de `localStorage` (lu par `getSync` sur une petite
collection) montre, lui, deux tableaux distincts : un écran peut afficher des grilles séparées pendant que l'écriture
les modifie ensemble.
- **Le stock** : toute grille déjà dupliquée par ces deux gestes, chez Grégoire, est peut-être liée à sa source de la
  même façon (inférence : dépend de l'ancienneté du stockage IndexedDB chez lui ; non mesuré sur ses données). Un export
  puis import (JSON) défait le lien.
- **Même forme de code ailleurs** (non mesuré) : la duplication d'une échelle (`{ ...echelle }`, `niveaux` partagé),
  et celles des cartouches et des productions par la même séquence de la bibliothèque. Seules les pratiques font un
  clone profond (`cloneProfond: true`).
- **Ce qu'il faudrait** (non fait, consigne) : copier en profondeur (clone JSON, comme `forkerItem`) dans
  `dupliquerGrilleDepuisSidebar` et `dupliquerVersBibliotheque` ; puis, pour le stock, un diagnostic en lecture seule
  des grilles qui partagent leurs critères, et une réparation proposée à Grégoire (écrire dans ses données lui revient).
  Un banc : dupliquer, modifier la copie, la source ne bouge pas, après rechargement. Disposition proposée : **à
  inscrire, en priorité** (le plan « une grille par production » passe par ce geste) ; non inscrit ici (consigne :
  mesures seulement), à Cowork.
- **Pour (a)** : la copie garde les identifiants des critères de sa source.
