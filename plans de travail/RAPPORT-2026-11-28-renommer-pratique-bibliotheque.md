# Rapport · renommer une pratique depuis la bibliothèque (28 nov. 2026)

**Relais.** Branche `claude/renommer-pratique-bibliotheque-q7aesx` (la session du nuage y est assignée ; le mandat nommait
`lot/renommer-pratique-bibliotheque-2026-11-28`), partie de `lot/renommage-second-lot-2026-11-28` à `6cff76e6`.
**Fait** : « Renommer » au menu ⋮ des deux colonnes de Conception › Pratiques › Bibliothèque, les onze textes de Cowork,
la règle c gardée à deux endroits, les bancs, le break-test. Vitest complet vert (986 fichiers, 12 722 tests, lancé
depuis `tests/`). La spec neuve et ses deux voisines vertes sous Chromium (35 essais, deux passes ; la spec neuve 40 sur
40 en quatre répétitions).
**Reste** : le feu vert de Grégoire sur les textes et sur les deux décisions du § 3 ; le verdict WebKit (aucun essai
n'a été joué sous WebKit : il n'existe pas dans le nuage) ; les gestes du § 6 sous Safari. Pas de fusion vers `main`,
pas de bump, pas de changelog (mandat).
**Aucun calcul de note ne change.** Aucune écriture hors du trimestre ouvert et de `bibliothequePratiques`.
**Jetons `?v=`** : cinq fichiers reçoivent dans `index.html` le jeton que propose le garde anti-cache
(`bibliotheque-ui`, `pratiques-bibliotheque`, `pratiques-gestion`, `ui-dialogues`, `styles.css`). `version.json` ne bouge pas.

## 1. Ce qui est fait

| Règle du mandat | Où | Preuve |
|---|---|---|
| a. « Renommer » en tête des deux menus | `preparerDonneesBibliothequePratiques`, `ligneMenuRenommer` (js/pratiques-gestion.js) | spec, essai 1 |
| b. Absent d'un modèle fourni intact, à droite | même endroit (`estFourniIntact`) | spec, essai 1 |
| c. Pratique adoptée d'un modèle fourni : la rangée du trimestre seule | `cibleRenommagePratique` et `renommerExemplairePratique` (js/pratiques-bibliotheque.js) | Vitest « RÈGLE c », spec essais 4 à 7, break-test § 4 |
| d. Les deux noms s'écrivent ; l'échec de la seconde écriture se dit | `renommerPratiqueDepuisBibliotheque` | spec, essais 2, 3 et 10 |
| e. Vide refusé, inchangé non écrit, espaces de bord retirés | `jugerNomPratique`, option `valider` de la fenêtre | Vitest, spec essai 8 |
| f. Nom déjà porté : la note du texte 7, sans blocage | `jugerNomPratique` (`dejaPorte`), option `noteSelonSaisie` | Vitest, spec essai 9 |
| g. Fenêtre, liste de la fiche, titre de la fiche | `reporterNomDansLaFiche`, puis les deux rafraîchissements habituels | spec, essais 2 et 3 |
| h. Sécurité | fenêtre en `textContent`, menu par `echapperHtml` (existant), aucun handler inline, aucun `console.log` | spec essai 9 (nom hostile) |

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
| `pratique.config.nom`, à l'intérieur de la pratique elle-même | posé par « Dupliquer » de l'ancienne page et par « Dériver une maquette » (js/pratiques.js:694), gardé par le clone de `dupliquerPratiqueMateriel` ; lu AVANT `pratique.nom` par le moteur (js/pratiques/pratique-registre.js:402) | **Oui**, voir § 3, point A |
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

**Source** : le geste n'écrit que `nom` (et `dateModification` sur l'exemplaire). **Stock** : toutes les copies du § 2.1
restent à l'ancien nom. Deux points demandent sa décision.

**A. `config.nom` (trouvaille, issue 2 : inscrire et continuer).** Une pratique née de « Dupliquer » sur l'ancienne page
ou d'une maquette porte une seconde copie de son nom, que le moteur lit en premier. Après un renommage, elle garde
l'ancien nom à trois endroits de l'enseignant·e : le récit du calcul au profil d'un élève, la colonne « Pratique (nom) »
du CSV des résultats finaux, le libellé de l'échelle « ‹nom› (Pratique active) » dans Évaluer. La bibliothèque, la fiche,
le tableau de notation et le Comparateur, eux, suivent. **Ce défaut existe déjà dans la fiche** (même écriture) : ce lot
ne l'a ni créé ni corrigé, parce que le mandat demande de ne réécrire aucune copie. Non mesuré : combien de ses
pratiques portent un `config.nom`. Une pratique créée par l'assistant ou adoptée d'un modèle fourni n'en porte pas ; sa
pratique du 2 sept. ne devrait donc pas être touchée (inférence, pas une mesure sur ses données).

**B. Deux textes d'écran écrits par la session.** Le mandat demande de dire l'échec de la seconde écriture, sans donner
les mots : « Pratique renommée dans ce trimestre seulement. Son exemplaire de ta bibliothèque n'a pas pu être
renommé. » (et son symétrique depuis la bibliothèque) ; « La pratique n'a pas pu être renommée. » quand la première
écriture échoue. Ils sont dans `TEXTES_RENOMMER_PRATIQUE` (js/pratiques-gestion.js), avec les onze de Cowork.

**Suppositions de la session, à corriger si elles sont fausses.**
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

## 5. Ce qui n'a pas pu être joué

- **WebKit : rien.** Les 10 essais de `renommer-pratique-bibliotheque.spec.js` et les specs voisines n'ont tourné que
  sous le Chromium du conteneur. Un vert Chromium est un indice, pas un verdict Safari.
- **iPad** : ni la fenêtre de saisie avec le clavier à l'écran, ni la taille des cibles.
- **Un rouge non reproduit.** L'essai « depuis la bibliothèque, avec la jumelle du trimestre ouverte dans la fiche » a
  rougi une fois, dans une passe groupée de quatre fichiers ; le message n'a pas été gardé. Rejoué seul puis 4 fois de
  suite dans sa spec : vert à chaque fois. Cause inconnue.
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
8. Ouvre une pratique dans la fiche, renomme-la par la bibliothèque : le titre et le champ « nom » de la fiche suivent.
9. Change de trimestre (2024 ou 2025) : la même pratique y porte encore son ancien nom.
10. Sur l'iPad : la fenêtre reste lisible quand le clavier monte, et les deux boutons se touchent sans peine.

## 7. Trouvailles hors lot, et leur issue

| Trouvaille | Issue |
|---|---|
| Échap dans une fenêtre `uiDialogues` ouverte par-dessus une bibliothèque en deux colonnes fermait aussi la bibliothèque (`uiDialogues` se retire en capture, avant le gestionnaire de `bibliotheque-ui.js`) | **1, corrigé maintenant** : il cassait le parcours livré. Une ligne, `if (e.defaultPrevented) return;`, essai 8 de la spec |
| `config.nom`, lu avant `pratique.nom` (§ 3, point A) | **2, à inscrire** : décision de Grégoire, c'est du stock |
| `dupliquerPratiqueMateriel` clone aussi `config.id` de la source ; `construireConfigComplete` lit `config.id` avant l'id de la pratique. Inférence de lecture, non vérifiée à l'exécution | **2, à inscrire** après vérification : si c'est vrai, une copie pourrait se résoudre sous l'id de sa source |
| Deux essais rouges sous Chromium sur la base (§ 5) | **2, à inscrire** |
| `mettreAJourConfigurationPratique` (js/pratiques-bibliotheque.js) n'a aucun appelant dans `js/` ; il n'annonce pas son écriture | **3, laissé** : sans conséquence observable. Non utilisé ici (il n'aurait pas porté la garde de la règle c) |

Rien n'a été inscrit au BACKLOG par cette session : aucune de ces trouvailles n'a de symptôme vécu par Grégoire.
