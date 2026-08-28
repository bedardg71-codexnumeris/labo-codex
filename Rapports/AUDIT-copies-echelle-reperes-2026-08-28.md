# AUDIT — les chemins de copie d'une échelle et les deux repères de maîtrise

**Date** : 28 août 2026 (fin d'après-midi) · **Périmètre** : tout code qui copie,
reconstruit ou projette un objet échelle · **Méthode** : lecture fonction par
fonction, aucune conclusion tirée d'un grep.

## 0. Pourquoi cet audit

Le relais du 28 août 15 h 10 consignait, en réponse à une question de Grégoire sur
le namespacing des deux repères (`seuilSuffisance`, `seuilMaitrise`, #555 lot 1) :
« treize chemins copient ou reconstruisent une échelle, un seul a été corrigé ». Ce
comptage venait d'un balayage par heuristique dont le relais disait lui-même qu'il
rendait des faux positifs. **La liste n'existait nulle part.** Elle est établie ici.

⮕ Et le comptage était trompeur dans les deux sens : le balayage avait manqué
**trois fonctions de duplication d'échelle** (`dupliquerEchelleBibliotheque`,
`dupliquerEchelleDepuisSidebar`, `dupliquerEchelleActive`), qui ne portent pas le
mot « copie » et n'apparaissent pas dans une recherche sur `niveaux:`.

## 1. Critère d'inclusion

Est retenu tout code qui produit un objet lu ensuite COMME une échelle, autrement
que par référence directe à l'objet stocké. Deux familles, et elles ne coûtent pas
la même chose :

| Famille | Ce qui se passe si les repères manquent |
|---|---|
| **Copie persistée** | La perte est DURABLE : l'échelle écrite n'a plus les repères, et rien ne le dit. |
| **Vue reconstruite** | Rien n'est perdu en base, mais un lecteur des repères voit une échelle qui n'en a pas — et conclut « non posés ». |

## 2. Verdict d'ensemble — dix-sept sites lus

### Copies persistées

| # | Site | Mécanisme | Verdict |
|---|---|---|---|
| 1 | `js/echelles.js:378` `dupliquerEchelle` | liste blanche explicite | **SAIN** — corrigé le 28 août, sentinelle posée |
| 2 | `js/echelles.js:774` `enregistrerCommeEchelle`, branche mise à jour | `{...echelleTemplateActuelle}` | **SAIN** (voir §3) |
| 3 | `js/echelles.js:774` idem, branche création | objet neuf | sans objet — échelle neuve |
| 4 | `js/echelles.js:4136` `sauvegarderEchelleComplete` | objet neuf | sans objet — échelle neuve |
| 5 | `js/echelles.js:2356` `ajouterEchelleIndividuelle` | `{...echelleSource}` | **SAIN** |
| 6 | `js/echelles.js:2534` `dupliquerEchelleBibliotheque` | délègue à `BibliothequeUI.dupliquerVersBibliotheque` | **SAIN** pour les repères (`Object.assign`) — voir §7 |
| 7 | `js/echelles.js:3947` `dupliquerEchelleDepuisSidebar` | `{...echelle}` | **SAIN** pour les repères — voir §7 |
| 8 | `js/echelles.js:4114` `dupliquerEchelleActive` | délègue au précédent | **SAIN** pour les repères — voir §7 |
| 9 | `js/echelles.js:2583` `ajouterEchellesABibliotheque` | `{...echelleBiblio}` | **SAIN** |
| 10 | `js/partage-section.js:269` `copiePropre` | clone JSON intégral | **SAIN** |
| 11 | `js/trimestres.js:812` `_peuplerCopieModeleNamespace` | référence à l'objet entier | **SAIN** |
| 12 | `js/trimestres.js:728` `creerSnapshotRessources` | `filter` sur la liste | **SAIN** |
| 13 | `js/import-export.js:2282` `executerImportConfigComplete` | `{...echelle}` | **SAIN** |
| 14 | `js/import-export.js:2548` `executerImportLocalStorageBrut` | écriture de clés brutes | **SAIN** |
| 15 | `js/import-export.js:2615` `executerImportSelectif` | `assainirObjet` + `SCHEMAS_IMPORT.echelle` | **PERTE — §4** |
| 16 | `js/partage-format.js:137` `projeterEntite` | schéma fermé `partage-schemas.js:225` | **PERTE — §5** |
| 17 | `js/trimestres.js:1872` `exporterFormatRecherche` | liste blanche de projection | **PERTE — §6** |

### Vues reconstruites

| Site | Ce qu'elle rend | Repères |
|---|---|---|
| `js/evaluation-chargement.js:253` `_resoudreEchellePratique` | `{id: 'pratique-<id>', nom, niveaux, type, source}` | absents, et **impossibles à poser** — §8 |
| `js/pratiques/pratique-registre.js:254` `construireConfigComplete` | `{type, echelle_id, echelle_nom, niveaux}` | absents ; `echelle_id` permet de remonter à la source |
| `js/codex-data.js:222` `_extraireBibliotheques` | passe-plat depuis l'archive | conservés — **SAIN** |
| `js/cartouches.js:434` et `:3455` | `{code, nom}` par niveau | hors périmètre : une cartouche ne calcule pas |

⮕ **Bilan : trois pertes, pas douze chemins à auditer.** Neuf des chemins de copie
persistée passent par un étalement ou un clone intégral et emportent donc tout
champ métier ajouté à une échelle, aujourd'hui comme demain.

## 3. Pourquoi la branche « mise à jour » de `enregistrerCommeEchelle` est saine

Elle fait `{...echelleTemplateActuelle, ...}` : elle ne conserve les repères que si
l'objet en cours d'édition les porte. **Les seize affectations de
`echelleTemplateActuelle` ont donc été lues une par une**, et aucune ne reconstruit
une échelle partielle :

| Affectations | Ce qu'elles posent | Effet sur les repères |
|---|---|---|
| l. 619, 2794, 3161, 4323 | `null` | sans objet |
| l. 662 (`chargerEchelleTemplate`), 3172 (`chargerEchellePourModif`), 3808, 3858, 3896, 3929 | `find` sur la liste stockée | objet complet |
| l. 707 (`sauvegarderNomEchelle`) | étalement de l'objet stocké | complet |
| l. 3687 (`modifierRepereEchelle`), 3751 (`modifierNiveauEchelle`) | l'objet que `db.modifier` vient d'écrire | complet |
| l. 723 (`sauvegarderNomEchelle`) | retour de `ajouterContributeurSiNecessaire` (`cc-license.js:342`) — mutation sur place, rend le même objet | complet |
| l. 814, 4218 | échelle NEUVE créée sur place | aucun repère, et c'est normal |

⮕ Le spread est donc sûr — mais il l'est par une propriété de ses seize sources,
**pas par construction**. Une dix-septième affectation qui reconstruirait une échelle
partielle ferait perdre les repères au premier enregistrement, sans rien casser
d'autre. Rien ne l'empêche aujourd'hui.

## 4. PERTE 1 — l'import sélectif

`js/import-export.js:2739` :

```js
...assainirObjet(e, SCHEMAS_IMPORT.echelle),
```

`assainirObjet` (l. 408) est une **liste blanche** : « seules les clés du schéma sont
conservées ». Le fichier le dit lui-même en tête du §511 : « une clé oubliée n'est
pas signalée, elle disparaît. C'est ainsi que tout le contenu pédagogique des
productions a voyagé vide pendant des mois. »

`SCHEMAS_IMPORT.echelle` (l. 619-647) ne connaît **ni `seuilSuffisance`, ni
`seuilMaitrise`**. Une échelle qui passe par l'import sélectif arrive donc sans ses
repères, en silence.

### Ce que ce même schéma perd EN PLUS, et qui n'a rien à voir avec #555

| Champ perdu | Ce qu'il vaut | Preuve qu'il est vivant |
|---|---|---|
| `config` | `typeEchelle`, `seuilReussite`, `notePassage`, `codesPersonnalises` | relu à l'ouverture d'une échelle (`echelles.js:646-656`) et imprimé sur trois PDF (`export-pdf.js:517, 867, 945`) |
| `niveaux[].valeurCalcul` | la note chiffrée du niveau | écrite par l'éditeur (`echelles.js:1100, 3031, 3323`), lue par `profil-etudiant-calculs.js:395` et `consolidation.js:217` ; le schéma ne transporte que `valeur`, le champ des échelles de catalogue |
| `niveaux[].niveauSOLO` | l'étiquette SOLO du niveau | exportée par `trimestres.js:1882` |

⮕ **Une échelle importée par ce chemin retombe sur le repli `(min + max) / 2`** pour
toutes ses valeurs de calcul. Les notes ne sont pas fausses au sens du code : elles
sont calculées avec des valeurs que l'utilisateur n'a pas choisies. C'est la même
famille de défaut que #574 (« l'échelle générique et les gabarits sont NON
CALCULABLES »), par un autre chemin.

⚠ La sentinelle #511 qui garde ce risque **ne couvre que `production`** : elle relit
les clés de `construireProductionData` et exige que chacune soit transportée ou
inscrite avec sa raison. Rien d'équivalent pour `echelle`.

## 5. PERTE 2 — la projection de partage

`js/partage-format.js:121` `projeterChamps` ne copie que les champs déclarés au
schéma, récursivement. Le schéma `SCHEMA_ENTITE.echelle`
(`js/partage-schemas.js:225-257`) connaît `valeurCalcul` et `config` — mais **pas
les deux repères**.

Partager une échelle la prive donc de ses repères **à l'émission**, pas à la
réception : le paquet part sans eux. Le destinataire ne voit aucune anomalie, et
l'émetteur non plus.

⮕ Le format se dit « fermé » et rejette tout champ inconnu à l'entrée. C'est
cohérent — mais cela signifie qu'ajouter les repères au schéma est une **évolution
de format** (`labo-codex-partage-v1`), pas une simple ligne. À trancher.

## 6. PERTE 3 — l'export au format recherche

`js/trimestres.js:1872` projette les échelles du trimestre pour l'export analytique :
`{id, nom, niveaux: [{code, nom, min, max, valeur_calcul, niveau_solo}]}`. Pas de
repères.

Rien n'est perdu en base. Mais le commentaire qui précède ce bloc énonce exactement
la règle qui les réclamerait : « les PLAGES et l'étiquette SOLO partent avec, parce
que sans elles un code de niveau reste illisible : "M" ne dit ni à quel pourcentage
il correspond, ni ce qu'il signifie. » **Sans les repères, le fichier ne dit pas non
plus où l'enseignant a placé la suffisance et la maîtrise** — la donnée même que
#555 lot 1 a rendue explicite. C'est un choix de conception à faire, pas un bug.

## 7. Constat latéral — `idOriginal` est propagé par trois chemins sur quatre

Hors sujet initial, mais trouvé en lisant, et il touche #542.

`dupliquerEchelle` emploie une liste blanche **précisément** pour ne pas emporter
`idOriginal` : « un spread de `echelle` emporterait `idOriginal`, et la COPIE se
mettrait à répondre à l'identifiant de la source dans `obtenirEchelleResolue` »
(`echelles.js:390-394`). Sa sentinelle vérifie `expect(copie.idOriginal).toBeUndefined()`.

Or les trois autres chemins de duplication emportent tout :

- `dupliquerEchelleDepuisSidebar` (`echelles.js:3957`) — `{...echelle}` ; il supprime
  `metadata_cc` et `auteurOriginal`, **pas `idOriginal`** ;
- `dupliquerEchelleActive` — délègue au précédent ;
- `dupliquerVersBibliotheque` (`bibliotheque-ui.js:576`) — `Object.assign({}, source)`,
  mêmes suppressions, même omission.

Le scénario est atteignable : `ajouterEchelleIndividuelle` **pose** `idOriginal`
(`echelles.js:2373`) sur toute échelle ajoutée depuis la bibliothèque. Dupliquer
ensuite cette échelle par la barre latérale produit deux entrées portant le même
`idOriginal`, et `obtenirEchelleResolue` (`profil-etudiant-calculs.js:129-131`)
résout par `find(e => e.id === echelleId || e.idOriginal === echelleId)` — **le
premier du tableau gagne**.

⮕ Une même famille de gestes, quatre implémentations, deux doctrines opposées sur
le même champ. Ce n'est pas un arbitrage : c'est une divergence. À verser à #476,
qui recense déjà les neuf écarts entre les cinq familles de duplication.

## 8. Constat de portée — l'échelle de pratique n'a pas de repères, et n'en aura pas

`_resoudreEchellePratique` (`evaluation-chargement.js:253`) fabrique une échelle
`{id: 'pratique-<pratiqueId>', …}` quand la pratique active est CONFIGURABLE — les
quatre pratiques codées en dur (`pan-standards`, `pan-maitrise`, `sommative`,
`pan-specifications`) sont écartées l. 256. Elle est offerte en tête du sélecteur
(l. 276) et `_lireChampsDOMAutoSave` (l. 1322) persiste sa valeur telle quelle sur
l'évaluation.

Cette échelle ne vit pas dans `echellesTemplates` : **l'éditeur ne permet donc pas
d'y poser de repères.** Et les deux résolveurs du dépôt n'en font pas la même
lecture :

- `obtenirEchelleResolue` traite le cas EN PREMIER (`profil-etudiant-calculs.js:120`) ;
- `_detecterEchelle` (`consolidation.js`) ne le traite pas — il cherche par id dans
  `echellesTemplates`, où un id `pratique-*` n'est jamais, et rend `null`.

⮕ Conséquence sur le lot 2 de #555, livré ce jour : chez un utilisateur en pratique
configurable, la matrice aurait affiché « seuil calculé, non lu » **en permanence**,
et il n'aurait eu aucun geste pour lever la réserve. Le message est exact ; ce qu'il
suggère de faire est impossible. **Le cas ne concerne pas Grégoire** (ses pratiques
sont dans la liste écartée) — c'est un enjeu d'expérimentateurs.

### Corrigé le jour même, dans le lot 2

Signalé à la session parallèle avant son commit, vérifié par elle au code, corrigé
dans le même lot : `_idEchelleMajoritaire` est extrait de `_detecterEchelle` (une
seule implémentation du comptage), `_detecterSeuilMaitrise` reçoit l'identifiant et
rend la raison `echelle-de-pratique`, distincte de `echelle-non-resolue`, et le
libellé dédié **ne renvoie pas vers l'éditeur d'échelle** — un cas de sentinelle
vérifie l'absence du mot « retrouvée », celui qui enverrait chercher une échelle qui
n'a jamais existé.

⚠ **Limite signalée par la session qui l'a écrit, reprise ici telle quelle** : son
break-test 8 (retirer la branche `pratique-`) fait rougir le cas de DÉTECTION, pas
celui du LIBELLÉ, qui reçoit la raison directement. Les deux maillons ont chacun leur
test ; **aucun ne couvre la chaîne entière**. Assumé, pas oublié.

### Ce que ce correctif ne règle pas

**Les deux résolveurs restent parallèles.** `obtenirEchelleResolue` et
`_detecterEchelle` continuent de répondre différemment au même identifiant ; le
second sait maintenant DIRE qu'il ne sait pas, il n'a pas appris à résoudre. C'est
le chantier qui survit au correctif — et le commentaire de `obtenirEchelleResolue`
(`profil-etudiant-calculs.js:103-110`) dit lui-même pourquoi il compte : « la
recopier pour obtenir les plages aurait recréé exactement le patron que #529 a passé
une session à défaire — deux chemins parallèles qui finissent par diverger, et un
même identifiant qui résout différemment selon l'appelant. »

## 9. Couverture de tests, mesurée

`tests/unit/sentinelle-555-reperes-maitrise-echelle.test.js` couvre **`dupliquerEchelle`
seul** (« dupliquer une échelle CONSERVE ses deux repères », l. 215). Aucun test ne
couvre l'import sélectif, la projection de partage, ni les trois autres chemins de
duplication.

## 10. Ce que cet audit N'A PAS vérifié

- Le comportement à l'exécution : tout ce qui précède est établi par lecture. Aucune
  des trois pertes n'a été reproduite dans l'application ni couverte par un test.
- Les chemins de copie des GRILLES, qui présentent probablement la même asymétrie
  (`grilles.js:2528` pose `idOriginal` comme son jumeau échelle).
- Si `config` a jamais été transporté par l'import sélectif : le champ est absent du
  schéma depuis au moins la version courante du fichier ; l'historique n'a pas été
  remonté.

## 11. Ce qui a été corrigé dans la foulée de cet audit

**La perte 1 (§4), décision de Grégoire du 28 août.** Deux gestes :

1. `SCHEMAS_IMPORT.echelle` (`js/import-export.js`) transporte désormais
   `seuilSuffisance`, `seuilMaitrise`, `config` (avec son sous-schéma), et
   `pratiquesCompatibles` ; son sous-schéma `niveaux` transporte `valeurCalcul` et
   `niveauSOLO` en plus de `valeur`, qui reste — les données réelles portent l'un ou
   l'autre selon leur origine.
2. `tests/unit/sentinelle-transport-echelles.test.js` — la jumelle de #511 pour les
   échelles. Elle ne se contente pas de vérifier les champs d'aujourd'hui : elle lit
   la liste blanche de `dupliquerEchelle` et la constante `niveauxDefaut`, et exige
   que **toute clé qui y sera ajoutée demain** soit transportée ou inscrite avec sa
   raison. Chaque volet porte sa garde de validité, pour qu'une regex devenue muette
   ne rende pas un ratchet vide qui passe sans rien vérifier.

⮕ **Les pertes 2 (partage) et 3 (export recherche) ne sont PAS corrigées**, et
aucune ne peut l'être sans décision : la première fait évoluer un format fermé, la
seconde change ce que les fichiers de recherche contiennent.

## 12. Constat de sécurité trouvé en écrivant la sentinelle — NON corrigé

`assainirChaine` (`js/import-export.js:365-371`) **tronque avant de retirer les
balises** :

```js
let resultat = str.length > maxLen ? str.substring(0, maxLen) : str;
resultat = resultat.replace(/<[^>]*>/g, '');
```

Une balise coupée par la troncature perd son `>`, et `/<[^>]*>/` ne mord plus.
Mesuré : `'<img src=x onerror=alert(1)>M'` (29 caractères) passé avec `maxLen: 20`
ressort **`'<img src=x onerror=a'`** — un `<` survit au filtre censé les retirer.

⮕ Les champs les plus exposés sont ceux à petit `maxLen` : `code` (20), `couleur`
(30), `notePassage` (20), les deux repères (20), `niveauSOLO` (50).

Ce n'est pas une faille par soi : il faut encore que le champ parte dans un
`innerHTML` pour que le fragment compte. Mais c'est un **affaiblissement silencieux
du filtre**, sur la fonction que TOUS les schémas d'import appellent.

⚠ **Non corrigé, et délibérément.** Inverser les deux lignes touche l'assainissement
de chaque type importé, pas seulement les échelles — et la leçon du 28 août au matin
est encore chaude : renforcer `echapperHtml` a immédiatement cassé un affichage
(« L'atelier » devenu `L&#39;atelier`) parce que le résultat allait dans un
`textContent`. Une modification de sécurité se mesure avant de se poser. **Décision
due par Grégoire.**
