# Rapport · renommer une pratique depuis la bibliothèque (28 nov. 2026)

**Relais.** Branche `claude/renommer-pratique-bibliotheque-q7aesx` (la session du nuage y est assignée ; le mandat nommait
`lot/renommer-pratique-bibliotheque-2026-11-28`), partie de `lot/renommage-second-lot-2026-11-28` à `6cff76e6`.
**Fait** : « Renommer » au menu ⋮ des deux colonnes de Conception › Pratiques › Bibliothèque, les onze textes de Cowork,
la règle c gardée à deux endroits, les bancs, le break-test. **Second passage (réponse de Cowork, 8 h 00)** : le nom
s'écrit en entier, `config.nom` compris, dans les deux écrivains et dans la fiche (§ 3, point A ; break-test § 4 bis).
Vitest complet vert (986 fichiers, 12 725 tests, lancé depuis `tests/`). La spec neuve (13 essais) et ses deux voisines
sous Chromium : voir le § 5 pour les essais instables.
**Reste** : le feu vert de Grégoire sur les textes ; le verdict WebKit (aucun essai n'a été joué sous WebKit : il
n'existe pas dans le nuage) ; les gestes du § 6 sous Safari. Pas de fusion vers `main`, pas de bump, pas de changelog
(mandat). La branche `lot/…` n'est pas poussée (décision de Cowork, 8 h 00).
**Aucun calcul de note ne change.** Aucune écriture hors du trimestre ouvert et de `bibliothequePratiques`.
**Jetons `?v=`** : cinq fichiers reçoivent dans `index.html` le jeton que propose le garde anti-cache
(`bibliotheque-ui`, `pratiques-bibliotheque`, `pratiques-gestion`, `ui-dialogues`, `styles.css`). `version.json` ne bouge pas.

## 1. Ce qui est fait

| Règle du mandat | Où | Preuve |
|---|---|---|
| Le nom s'écrit en entier (`config.nom`) | `poserNomDeLaPratique` (js/pratiques-bibliotheque.js), les deux écrivains | Vitest, spec essais 8 à 10, break-test § 4 bis |
| a. « Renommer » en tête des deux menus | `preparerDonneesBibliothequePratiques`, `ligneMenuRenommer` (js/pratiques-gestion.js) | spec, essai 1 |
| b. Absent d'un modèle fourni intact, à droite | même endroit (`estFourniIntact`) | spec, essai 1 |
| c. Pratique adoptée d'un modèle fourni : la rangée du trimestre seule | `cibleRenommagePratique` et `renommerExemplairePratique` (js/pratiques-bibliotheque.js) | Vitest « RÈGLE c », spec essais 4 à 7, break-test § 4 |
| d. Les deux noms s'écrivent ; l'échec de la seconde écriture se dit | `renommerPratiqueDepuisBibliotheque` | spec, essais 2, 3 et 13 |
| e. Vide refusé, inchangé non écrit, espaces de bord retirés | `jugerNomPratique`, option `valider` de la fenêtre | Vitest, spec essai 11 |
| f. Nom déjà porté : la note du texte 7, sans blocage | `jugerNomPratique` (`dejaPorte`), option `noteSelonSaisie` | Vitest, spec essai 12 |
| g. Fenêtre, liste de la fiche, titre de la fiche | `reporterNomDansLaFiche`, puis les deux rafraîchissements habituels | spec, essais 2 et 3 |
| h. Sécurité | fenêtre en `textContent`, menu par `echapperHtml` (existant), aucun handler inline, aucun `console.log` | spec essai 12 (nom hostile) |

**Un seul écrivain du nom du trimestre.** `ecrireNomPratiqueDuTrimestre` porte l'écriture qui était dans
`mettreAJourNomPratiqueMat` (même `modifierEtAnnoncer`, même geste « Modifier la pratique ») ; la fiche et le menu y
passent tous les deux. Un trimestre clos refuse comme avant, et le témoin le dit.

**La fenêtre de saisie** est `uiDialogues.demanderSaisie`, le patron qui existe déjà (codex, élèves, liste). Elle
reçoit quatre options neuves, toutes facultatives : `valider` (un refus s'écrit sous le champ, la fenêtre reste),
`notes`, `noteSelonSaisie`, `noteBas`. Sans elles, son comportement est celui d'avant (essai Vitest dédié).

**La jumelle** : celle du même id d'abord, sinon la première que `BibliothequeUI.lieeAExemplaire` lie (par `idOriginal`).

## 2. Les trois mesures demandées

### 2.1 Où le nom d'une pratique est recopié (lecture du code de `js/`, pas des données de Grégoire)

Chaque ligne reste à l'ancien nom après le geste. Rien n'est réécrit ici.

| Copie | Où | Se voit à l'écran ? |
|---|---|---|
| `pratique.config.nom`, à l'intérieur de la pratique elle-même | posé par « Dupliquer » de l'ancienne page et par « Dériver une maquette » (js/pratiques.js:694), gardé par le clone de `dupliquerPratiqueMateriel` ; lu AVANT `pratique.nom` par le moteur (js/pratiques/pratique-registre.js:402) | **Corrigé au second passage** : le geste et la fiche l'écrivent, § 3, point A |
| `modalitesEvaluation.specifications.modeleNom` et `modalitesEvaluation.configurationSTDAppliquee.nom` | posés par `appliquerConfigurationPratique` (js/pratiques-bibliotheque.js), seul écrivain | Non : aucun lecteur dans `js/` (grep du 28 nov.). Reste à l'ancien nom, sans effet visible |
| `inspireDe.nom` dans chaque copie faite d'une pratique | `BibliothequeUI.forgerInspireDe` (js/bibliotheque-ui.js:212) | Oui : « Inspiré de … » dans l'aperçu d'une rangée et dans le bloc de licence. Instantané voulu (« figé au moment du fork ») |
| Le nom d'une maquette, « ‹nom› · maquette N » | js/pratiques.js:748 | Oui, dans Labo › Exploration. C'est le nom propre de la maquette |
| Le nom d'une pratique importée d'un autre trimestre, « ‹nom› (importée) » | js/pratiques-gestion.js, import inter-trimestre | Oui. C'est le nom propre de la copie |
| Le registre des partages reçus (`partage_packagesImportes`, `itemPrincipal.nom`) | js/partage-import.js:278 | Oui, dans la liste des partages reçus. C'est le nom donné par le ou la collègue |
| Les autres trimestres (même id, autre clé) | `…_pratiquesConfigurables` de chaque trimestre | Oui, quand on ouvre ce trimestre. Décision 3 : voulu |

Ne recopient PAS le nom (l'id seul) : le groupe-cours (`pratiqueId`), les captures du Suivi et les indices
(`pratique: <id>`), le registre longitudinal (aucune pratique), les dossiers de la bibliothèque, les évaluations
enregistrées. Les exports (JSON, .lcz, codex) emportent l'objet pratique : ils portent le nom du moment de l'export.
Le Comparateur n'écrit rien et lit le nom en direct.

### 2.2 Un texte reçu par l'élève nomme-t-il la pratique ? Non, confirmé

Le PDF de rétroaction (`construireNoteSommative`, `construireNoteProvisoire`, js/synthese-retroaction-data.js) lit du
récit la famille, les résultats et la synthèse ; `pratiqueNom` n'y est jamais lu. Les titres sont fixes (« Note actuelle
du cours », « Note provisoire », « Note finale »). Rien dans `travaux-export-pdf.js`, `export-pdf.js`,
`evaluation-retroaction.js`, `profil-etudiant-rapport.js`, `bilan-reflexif*.js`. Limite : c'est une lecture du code,
aucun PDF n'a été généré pour le vérifier.

### 2.3 Pratique de la démo, pratique d'un·e collègue

- **Démo** : dans la fiche, une pratique de la démo est en lecture seule, et seulement dans la démo
  (`BibliothequeUI.estPratiqueDeDemo`). Ici, pareil : elle n'offre pas « Renommer », dans aucune des deux colonnes, et une
  jumelle de la démo garde son nom.
- **Collègue** (auteur différent) : la fiche la laisse renommer, sans condition sur l'auteur. Ici, pareil : « Renommer »
  est offert. Son `metadata_cc` et son « Inspiré de » ne bougent pas.

## 3. Source ou stock, et ce qui attend Grégoire

**Source** : le geste écrit `nom`, sa seconde copie `config.nom` quand elle existe, et `dateModification` sur l'exemplaire. **Stock** : toutes les copies du § 2.1
restent à l'ancien nom. Deux points demandent sa décision.

**A. `config.nom` : corrigé dans ce lot (décision de Cowork, 28 nov., 8 h 00).** Ce n'est pas la copie de quelqu'un
d'autre : c'est la même pratique qui porte deux fois son nom.
- **Les emplacements que le moteur lit avant `nom`** (grep de `js/`, 28 nov.) : un seul, `config.nom`. Deux lecteurs :
  `construireConfigComplete` (`config.nom || pratiqueData.nom`, js/pratiques/pratique-registre.js), d'où viennent le
  récit du calcul et la colonne « Pratique (nom) » du CSV, par `obtenirNom()` ; et `_resoudreEchellePratique`
  (js/evaluation-chargement.js), qui lit `config.nom` directement pour le libellé « ‹nom› (Pratique active) ».
  `configuration` (la forme de l'assistant et des modèles fournis) ne porte pas de nom.
- **L'écriture** : `poserNomDeLaPratique` (js/pratiques-bibliotheque.js) pose `nom` et, quand elle existe, `config.nom`,
  dans la même transaction. Les deux écrivains y passent : `ecrireNomPratiqueDuTrimestre` (le geste ET la fiche, un
  seul écrivain du nom du trimestre) et `renommerExemplairePratique`.
- **Aucune migration** : seule une copie qui existe est mise à jour, rien n'est créé, une pratique qu'on ne renomme
  pas n'est pas touchée (essais dédiés).
- **L'instance gardée en mémoire** de la pratique active portait l'ancien nom : l'écrivain du trimestre appelle
  `invaliderCachePratique` après son écriture. Non couvert par un break-test séparé.
- **Source ou stock** : source tarie. Stock : une pratique déjà renommée par la fiche AVANT ce correctif garde un
  `config.nom` ancien, donc l'ancien nom aux trois écrans, jusqu'à ce qu'on la renomme de nouveau (même par son nom
  actuel suivi d'une retouche : « nom inchangé » n'écrit rien). Non mesuré : combien de ses pratiques sont dans ce cas.
  Rien n'est réparé d'office.

**B. Deux textes d'écran écrits par la session (acceptés par Cowork, 8 h 00).** Le mandat demande de dire l'échec de la seconde écriture, sans donner
les mots : « Pratique renommée dans ce trimestre seulement. Son exemplaire de ta bibliothèque n'a pas pu être
renommé. » (et son symétrique depuis la bibliothèque) ; « La pratique n'a pas pu être renommée. » quand la première
écriture échoue. Ils sont dans `TEXTES_RENOMMER_PRATIQUE` (js/pratiques-gestion.js), avec les onze de Cowork.

**Suppositions de la session** (les deux premières acceptées par Cowork, 8 h 00).
- « Nom inchangé » se juge sur la rangée d'où part le geste. Si la jumelle porte un autre nom et que la rangée ne
  change pas, rien n'est écrit, la jumelle garde le sien.
- Quand plusieurs pratiques du trimestre sont liées au même exemplaire, une seule est la jumelle (même id, sinon la
  première). Les autres ne sont pas renommées.
- La note 7 compare sans tenir compte des majuscules ni des espaces de bord, dans le trimestre ouvert et la bibliothèque.
- Une copie MODIFIÉE d'un modèle fourni est un exemplaire à lui : elle se renomme (elle offre déjà « Supprimer »).

## 4. Break-test de la règle c

Le témoin, code intact : 4 essais « RÈGLE c » verts.

**Casse B' : la garde de l'écrivain retirée** (`if (estModeleFourniIntact(bibliotheque[index])) return undefined;`).

```
✘ RÈGLE c — l'écrivain de l'exemplaire, appelé directement, refuse la copie rangée intacte d'un modèle fourni
    Expected: false
    Received: true
1 failed, 3 passed
```

**Casse B : les deux gardes retirées** (celle de l'écrivain et la branche `'fournie'` de la règle pure). Les 4 essais
rougissent, et sur l'écriture elle-même :

```
Error: la copie rangée du modèle fourni n'est pas réécrite
Expected: "[{"id":"SOM-litterature","nom":"Modèle sommatif", …}]"
Received: "[{"id":"SOM-litterature","nom":"Ma pratique cumulative fictive", … "dateModification":"2026-11-28T12:00:19.488Z"}]"
```

**Casse A : la règle pure seule.** Vitest : `× RÈGLE c — pratique adoptée d'un modèle fourni : la jumelle est le modèle,
elle garde son nom` (1 rouge sur 17). Playwright : les 3 essais du geste rougissent sur la note et la confirmation ; la
copie rangée reste intacte, la garde de l'écrivain tenant encore.

Code restauré après chaque casse, puis rejoué vert. Les deux assertions de note et de confirmation sont `soft`, pour que
l'assertion d'écriture soit toujours jugée.

## 4 bis. Break-test de la seconde copie du nom (second passage)

Le témoin, code intact : 3 essais verts (le geste parti de chaque colonne, puis la fiche).
**Casse** : la ligne `config.nom = nom` retirée de `poserNomDeLaPratique`.

```
✘ la seconde copie du nom (config.nom) suit, geste parti de la colonne trimestre …
✘ la seconde copie du nom (config.nom) suit, geste parti de la colonne bibliotheque …
    Error: trimestre : nom et config.nom
    -   "Pratique Banc Naïade",
    +   "Copie Banc Dryade",
✘ la fiche écrit aussi la seconde copie du nom (même écrivain) …
    -     "Pratique Ondin",
    +     "Pratique Sirène",
3 failed
```

Vitest, même casse : 2 rouges sur 20 (`poserNomDeLaPratique — le nom s'écrit en entier`). Code restauré, rejoué vert.

Ce que l'essai du geste lit, après une vraie duplication (`dupliquerPratique`) et l'activation de la copie : le nom du
récit (`calculerDetailsNoteFinale(da).recit.pratiqueNom`), le nom que l'export CSV met dans « Pratique (nom) »
(`obtenirPratiqueParId(…).obtenirNom()`, la lecture de `_collecterContexteActif`) et l'option « … (Pratique active) »
du menu d'échelle d'Évaluer (`chargerEchellePerformance`). Limite : le fichier CSV lui-même n'est pas téléchargé, ni le
profil d'un élève ouvert à l'écran ; ce sont leurs lectures qui sont jugées.

## 5. Ce qui n'a pas pu être joué

- **WebKit : rien.** Les 13 essais de `renommer-pratique-bibliotheque.spec.js` et les specs voisines n'ont tourné que
  sous le Chromium du conteneur. Un vert Chromium est un indice, pas un verdict Safari.
- **iPad** : ni la fenêtre de saisie avec le clavier à l'écran, ni la taille des cibles.
- **Essais INSTABLES sous le Chromium du conteneur, en passe groupée de plusieurs fichiers. Aucun n'est neutralisé.**
  Chacun a rougi une fois, puis repassé vert sans changement de code ; la cause n'est pas trouvée.
  - `renommer-pratique-bibliotheque.spec.js` › « depuis la bibliothèque, avec la jumelle du trimestre ouverte dans la
    fiche : les deux noms, le titre et le champ de la fiche » : rouge une fois (message non gardé) ; seul, puis 4
    répétitions de la spec : vert.
  - `renommer-pratique-bibliotheque.spec.js` › « RÈGLE c — pratique adoptée d'un modèle fourni (sans copie rangée) :
    seule la rangée du trimestre change, rien ne s'écrit dans la bibliothèque » : rouge une fois (message non gardé) ;
    trois passes groupées suivantes : vert.
  - `bibliotheque-deux-colonnes-1156.spec.js:218` › « productions : « Tout garder dans ma bibliothèque »… » : rouge
    deux passes sur trois (`Expected: 13, Received: 0`). Ce lot ne touche pas les productions : l'instabilité n'est pas
    propre à la spec neuve. Non jugé sous WebKit.
- **Déjà rouges sur `6cff76e6` sous Chromium, sans lien avec ce lot** (mesuré sur la base, mon travail mis de côté) :
  `pratique-std-voyage.spec.js:160` et `pratiques-898-echelle-a-l-adoption.spec.js:25`. Deux autres essais de
  `pratique-std-voyage` (111 et 263) ont rougi chacun une fois sur trois passes, pas les mêmes d'une passe à l'autre.
  Issue 2, inscrire : ce sont des échelles, pas ce lot. Non vérifié sous WebKit.

## 6. Les gestes à faire sous Safari (Mac, puis iPad)

Dans Conception › Pratiques, bouton de la bibliothèque.

1. Sur ta pratique du 2 sept. (« Modèle sommatif », colonne « Dans ce trimestre »), ouvre ⋮. « Renommer » est en
   premier. La fenêtre dit « Le modèle fourni avec l'application garde son nom. » Donne un nom, « Renommer ». La rangée
   change à gauche ; à droite, « Modèle cumulatif » garde son nom et sa mention « fourni avec l'application ».
2. À droite, sur « Modèle cumulatif » : ⋮ n'offre pas « Renommer » (ou il n'y a pas de ⋮).
3. Sur une pratique qui porte « Aussi dans ta bibliothèque » et qui n'est pas un modèle fourni : renomme-la à gauche. La
   fenêtre annonce que l'exemplaire suivra ; les deux rangées changent ; le message dit « dans ce trimestre et dans ta
   bibliothèque ».
4. Même chose en partant de la droite, sur une pratique « Déjà dans ce trimestre ».
5. Efface le nom et valide : « Donne un nom à la pratique. », la fenêtre reste ouverte.
6. Tape le nom d'une autre pratique : la note « Une autre pratique porte déjà ce nom… » paraît, et le geste passe.
7. Appuie sur Échap dans la fenêtre « Renommer la pratique » : elle se ferme, la bibliothèque reste ouverte.
8. Sur une pratique que tu as déjà dupliquée et qui est la pratique active d'un groupe-cours : renomme-la, puis ouvre
   le profil d'un élève. Le récit du calcul porte le nouveau nom.
9. Ouvre une pratique dans la fiche, renomme-la par la bibliothèque : le titre et le champ « nom » de la fiche suivent.
10. Change de trimestre (2024 ou 2025) : la même pratique y porte encore son ancien nom.
11. Sur l'iPad : la fenêtre reste lisible quand le clavier monte, et les deux boutons se touchent sans peine.

## 7. Trouvailles hors lot, et leur issue

| Trouvaille | Issue |
|---|---|
| Échap dans une fenêtre `uiDialogues` ouverte par-dessus une bibliothèque en deux colonnes fermait aussi la bibliothèque (`uiDialogues` se retire en capture, avant le gestionnaire de `bibliotheque-ui.js`) | **1, corrigé maintenant** : il cassait le parcours livré. Une ligne, `if (e.defaultPrevented) return;`, essai 11 de la spec |
| `config.nom`, lu avant `pratique.nom` (§ 3, point A) | **Corrigé dans ce lot** au second passage (décision de Cowork, 8 h 00) |
| Évaluer lit la pratique du COURS (`getPratiqueCours`, clé `cours`), pas celle du groupe-cours que `changerPratiqueActive` écrit : après une activation, l'échelle « (Pratique active) » peut ne pas paraître. Vu en écrivant le banc, dans la démo ; non vérifié sur un trimestre réel | **2, à inscrire** |
| `_resoudreEchellePratique` écrit « undefined (Pratique active) » si une pratique porte `config.echelle` sans `config.nom`. Lecture du code, aucun cas produit | **3, laissé** |
| `dupliquerPratiqueMateriel` clone aussi `config.id` de la source ; `construireConfigComplete` lit `config.id` avant l'id de la pratique. Inférence de lecture, non vérifiée à l'exécution | **2, à inscrire** après vérification : si c'est vrai, une copie pourrait se résoudre sous l'id de sa source |
| Deux essais rouges sous Chromium sur la base (§ 5) | **2, à inscrire** |
| `mettreAJourConfigurationPratique` (js/pratiques-bibliotheque.js) n'a aucun appelant dans `js/` ; il n'annonce pas son écriture | **3, laissé** : sans conséquence observable. Non utilisé ici (il n'aurait pas porté la garde de la règle c) |

Rien n'a été inscrit au BACKLOG par cette session : aucune de ces trouvailles n'a de symptôme vécu par Grégoire.
