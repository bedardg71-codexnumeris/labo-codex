# Relecture croisée du cadrage #915 — recommandations à Cowork

> **Destinataire : Cowork.** Relecture de `CADRAGE-2026-09-17-soir-registre-longitudinal.md`
> par Claude Code, 17 septembre 2026 au soir, AVANT toute ligne de code, à la demande
> de Grégoire (« contre-vérifie ce plan avant de l'appliquer »). Chaque point est
> **mesuré dans le dépôt** (fichier et ligne), sauf mention « inférence ».
> Grégoire revient avec une version corrigée du cadrage ; ce fichier dit quoi corriger,
> section par section, et propose le texte de remplacement quand il y en a un.

État au moment de la relecture : HEAD = origin/main = e7f554f0 (1.143.0), Vitest
590 fichiers / 6 704 essais verts, un seul arbre, aucun test en cours. Les fiches
#914 et #915 et le cadrage ne sont pas commités.

---

## A. Trous à combler — le plan ne peut pas se livrer tel quel sans ces réponses

### A1. § 6 et § 7 lot 3 — l'export de recherche perd les résultats ultérieurs

**Fait.** `js/trimestres.js:2025` lit `cle('resultatsUlterieurs')` et sort
`observations.etudiants[].resultats_ulterieurs` (l. 2245, `version_format` 1.2). Deux
sentinelles le figent : `tests/unit/sentinelle-913-resultats-ulterieurs.test.js` et
`sentinelle-902-export-recherche-vrais-indices.test.js:122`.

**Trou.** Le lot 3 cesse d'écrire `<trim>_resultatsUlterieurs` ; le cadrage ne dit
pas ce que devient l'export. Sans décision, toute note saisie après le lot 3 est
absente du fichier de recherche, en silence.

**À écrire au § 6** : « L'export de recherche (`exporterFormatRecherche`) lit désormais
le registre par DA pour chaque élève du trimestre exporté, et l'ancienne clé
`<trim>_resultatsUlterieurs` en repli (union, sans doublon) tant qu'elle existe.
Le DA ne sort toujours pas. `version_format` reste 1.2 : la forme de sortie ne change
pas. » Et au lot 3 de la table du § 7, colonne preuve : « l'export porte une note
saisie dans le registre ET une note du stock #913 ».

### A2. § 4.1 — ce que la capture n'emporte pas est perdu pour de bon

**Fait.** Le but déclaré (§ 2, § 8) est de survivre à la suppression du trimestre.
`supprimerTrimestre` (`js/trimestres.js:1509`) efface toute clé qui contient l'id du
trimestre. Sont donc effacées avec lui, et **absentes de la liste « Emporte »** :

| Clé namespacée | Ce que c'est | Par DA ? |
|---|---|---|
| `interventions` | RàI, rencontres (chantier « Rencontres », lots A-F) | oui |
| `snapshots` | indices hebdomadaires — la trajectoire dans le trimestre, ce que « Études » et `correlations-longitudinales.js` lisent | par semaine, puis par DA |
| `portfoliosEleves` | portfolio par élève | oui |
| `etudiantsSuivis` | liste de suivi | oui |
| `notesRapport` | notes du rapport | à vérifier |

**Inférence.** Un dossier « pour comprendre son parcours » (§ 5.3) sans les
interventions ni la trajectoire hebdomadaire est un dossier de fin de trimestre, pas
un parcours. Et aucune re-capture n'est possible une fois le trimestre supprimé.

**À décider avec Grégoire — c'est pédagogique** (ce qu'un dossier veut dire, règle 1
de CLAUDE.md), puis à écrire au § 4.1 : la liste « Emporte » complétée, ou la liste
« Laisse » complétée **avec le motif**. Recommandation de Claude Code : emporter
`interventions` et `snapshots` filtrés par DA (quelques Ko) ; `portfoliosEleves`
après mesure de poids.

### A3. § 5.2 (a) et § 9 — les trois mesures ne se font pas depuis le disque

**Fait.** Aucune donnée réelle dans le dépôt : `_sauvegarde-20260830-1905/` contient
des fichiers de code et des patchs, pas un Codex. `scripts/` porte des diagnostics
qui tournent **dans le navigateur** de Grégoire. Le stock `<trim>_resultatsUlterieurs`
n'existe que depuis ce matin, donc seulement dans le navigateur où il a saisi.

**À écrire au § 9, comme premier point** : la source des mesures, choisie par
Grégoire — (1) son app ouverte dans Chrome sur le Mac, mesures en lecture seule par
l'extension ; (2) un export complet (Réglages › Données) déposé pour Claude Code ;
(3) le pack démo pour l'ordre de grandeur, le réel à la porte terrain du lot 2.
Sans cette ligne, les « trois mesures avant de coder » de la consigne sont
impossibles.

### A4. § 1 et § 3 — le codex data existe déjà en code, sous une autre forme

**Fait.** `js/codex-data.js` (#251, 6 mai 2026) produit le format `codex-data` v1 :
`groupes.<dossier>.{ uuid, trimestre, cours, groupe, <clés namespacées> }` plus
`bibliotheques`, avec hash SHA-256 ; `js/labo-codex-data.js` le charge dans le Labo
(bandeau, `lireDonneesNamespacees`). La structure du § 3 (`eleves[da].dossiers[]`)
n'a aucun lien avec ce format ni avec son extracteur.

**Conséquence.** La phrase du § 1 « on n'invente pas un quatrième concept — on
ajoute une granularité à un format déjà spécifié » est vraie pour la SPEC
(`ECOSYSTEME-DONNEES.md` § 3) et fausse pour le CODE : ce sera un second format à
côté de `codex-data` v1, et le futur export `.codex-data.json` (§ 8) devra convertir.

**À écrire au § 3** : un en-tête `format: 'registre-longitudinal', version: 1` dans
l'objet, et une phrase : « Format distinct de `codex-data` v1 (`js/codex-data.js`),
qui est par groupe-cours archivé et lu depuis la Réserve ; le registre est par élève
et lu depuis les trimestres vivants. La conversion vers `.codex-data.json` est le lot
d'export, hors périmètre. » Claude Code retient la forme du cadrage (inférence : plus
simple, l'extracteur existant lit la Réserve, pas les trimestres vivants).

### A5. § 5.1 — `navigation.js` doit bouger, ou le plan doit nommer le contournement

**Fait.** `js/navigation.js` porte `INITIALISATEURS_SOUS_SECTION` (l. 205 et suiv.),
consommée à la l. 629 : c'est le hook d'affichage d'un sous-onglet. Son commentaire
dit « pour ajouter une sous-section : 1. config.js, 2. cette table ». La seconde
table (`TOOLTIPS_SOUS_NAV`, l. 149) est facultative : `labo-comparateur` n'y est pas.
`index.html` doit recevoir un conteneur `<div id="labo-longitudinal" class="sous-section">`
(les six autres sont aux l. 8645-9073).

**Contournement sans toucher `navigation.js`** : l'événement public `sectionAffichee`
(l. 668, `detail.idSousSection`), prévu pour « les modules externes ». Le module
l'écoute et rend quand l'id est `labo-longitudinal`.

**À écrire au § 5.1** : soit « `navigation.js` n'a pas à bouger : le module écoute
`sectionAffichee` », soit l'autorisation explicite de Grégoire pour une entrée dans
`INITIALISATEURS_SOUS_SECTION`. Et ajouter `index.html` à la liste des fichiers
touchés au lot 1.

---

## B. Erreurs de fait à corriger dans le texte

| § | Le cadrage dit | Mesuré | Correction |
|---|---|---|---|
| 4.1 bis, tableau | source assiduité : `<trim>_indicesAssiduiteDetailles` | aucune écriture de cette clé dans `js/` ; une seule mention, `js/modes.js:723` | retirer ; assiduité = `indicesAssiduite[da]` |
| 3, `statut` | « actif ou abandon » | `js/main.js:113` : `inactif`, `décrochage`, `abandon` | « copié tel quel depuis `groupeEtudiants` » |
| 3, `presences` | « par séance » | `<trim>_presences` est un **tableau** (`saisie-presences.js:911`), filtré par DA à la capture | dire « les entrées de ce DA, telles quelles » |
| 3, clé globale | « même statut que `cartouchesBibliotheque` » | `cle()` (`trimestres.js:412`) **avertit** sur toute clé absente de `CLES_GLOBALES` (l. 196) | inscrire `registreLongitudinal` à `CLES_GLOBALES` |
| 5.2 (a) | « un même DA … apparaît une fois » | #914 : `da: da \|\| \`DA${Date.now()}\`` (`trimestre-v2-etudiants.js:397`) — un élève ajouté à la main dans deux trimestres a deux DA | dire que la règle vaut pour les DA du collège seulement ; les autres apparaissent tels quels |
| 5.2 (a) | « tous les trimestres répertoriés » | le registre des trimestres contient `demo` (`trimestres.js:325`) | « tous les trimestres, **sauf la démo** » |
| 4.1 | « quelques centaines de Ko par élève » | non mesuré (A3) ; les évaluations n'ont pas de blob (l'objet de `evaluation-sauvegarde.js` porte des ids et du texte) | laisser « à mesurer », retirer l'estimation |

---

## C. Ambiguïtés à trancher dans le texte (Claude Code tranche ainsi si rien n'est dit)

1. **« Inscrire » capture quoi ?** Tous les trimestres où le DA figure, un dossier
   par trimestre-cours, en un seul geste.
2. **« Re-capturer remplace la capture précédente »** avec `dossiers[]` : remplace le
   dossier du même `trimestre` + `coursId`, garde les autres ; `inscritLe` ne bouge
   pas, `capteLe` oui.
3. **Grilles « par copie »** : `<trim>_grillesTemplates` et `<trim>_echellesTemplates`
   sont déjà namespacées par trimestre (#358) ; la copie prend celles que les
   évaluations du DA référencent par `grilleId`, pas tout le catalogue.
4. **Pérennité du registre** : il est dans l'export complet (`import-export.js:1025`
   énumère `db.keys()`), il survit à `supprimerTrimestre` (filtre `includes(id)`,
   mesuré), il n'est **pas** dans la Réserve (`CLES_GLOBALES_INCLUSES`, `reserve.js:53`,
   par trimestre). À écrire au § 3 : « sauvegardé par l'export complet seulement,
   jusqu'à l'export `.codex-data.json` ».
5. **`db.js`** : le seuil IndexedDB est automatique (`SEUIL_IDB_FIRST` = 25 Ki,
   `db.js:120`) ; pas de « passer par IndexedDB » à décider, `db.set` suffit. Retirer
   la phrase du § 3 ou la reformuler en « `db.set`, asynchrone ».

---

## D. À ajouter au découpage (§ 7)

- **Lot 3** : le trou R3 nommé au relais de 1.143.0 — `nettoyerTexte` de
  `js/resultats-ulterieurs.js` peut perdre son `.slice(0, LONGUEUR_MAX_TEXTE)` sans
  qu'aucun essai rougisse. Le relais dit « au prochain lot qui passe par ce fichier » :
  c'est le lot 3. Une ligne dans la colonne preuve.
- **Lot 3** : `sentinelle-913-resultats-ulterieurs.test.js` attend l'écriture
  namespacée (l. 41, 52-53) ; elle rougira et se réancre. Le dire pour que ce ne soit
  pas pris pour une régression.
- **Lot 2, preuve** : « aucun indice n'est recalculé » se prouve par une mutation :
  envelopper `calculerEtStockerIndicesCP` et compter zéro appel pendant une capture.
- **Avant le lot 1** : commiter les fiches #914/#915 et le cadrage corrigé (ils ne
  vivent que sur ce disque, mesuré par l'audit).

---

## E. Ce qui est confirmé tel quel

Le nom du sous-onglet, le DA comme clé, l'instantané figé, la lecture seule prouvée
octet pour octet, les indices lus et jamais recalculés (avec `noteConstructible` qui
voyage), l'empreinte de grille minimale, l'exclusion des blobs, le hors-périmètre du
§ 8, la note Loi 25 du § 10. Rien à changer.

## F. Ce que Grégoire a à trancher, et rien d'autre (remplace le § 9)

1. La source des trois mesures (A3).
2. Interventions et snapshots dans la capture, oui ou non (A2).
3. `navigation.js` : contournement par l'événement, ou entrée autorisée (A5).
4. Restent du § 9 actuel : le champ de recherche si plus de ~50 élèves ; les mots
   de l'avertissement de dérive, le jour venu.
