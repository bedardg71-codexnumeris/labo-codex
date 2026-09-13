# Consigne du jour – Les interventions d'un élève suivent son groupe, et un seuil à zéro reste à zéro (#746 moitié restante, #551 garde seule)

> **Écrite par Cowork le dimanche 13 septembre 2026, début d'après-midi (Toronto).** Elle remplace la consigne du lot 5 des
> interventions, exécutée le 12 et archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-12-interventions-lot-5.md`.
> **Demandée par Grégoire comme « le lot qui touche `js/interventions.js` (6/6) ».** La mesure au code l'a réduit à DEUX gestes :
> deux des six fiches ont quitté ce fichier, une doit être cochée, une attend son mois d'usage, une est une question d'une phrase.
> ⮕ Les quatre questions que ces fiches adressent vraiment à Grégoire sont dans `QUESTIONS-EN-ATTENTE-2026-09-13.md`.

---

## 0 · Ce que ce lot livre

Deux choses, dans un seul fichier.

1. Le profil d'un élève, son historique d'accompagnement, ses graphiques et le compteur de la Liste montrent les interventions du
   groupe-cours où l'on est – comme la liste des interventions le fait déjà depuis le 12 septembre. Les interventions écrites avant
   cette date, qui ne portent pas encore de groupe, restent visibles partout, comme aujourd'hui.
2. Un seuil de dépistage délibérément réglé à zéro cesse d'être remplacé en douce par la valeur du projet.

Aucun calibrage ne bouge, aucun mot affiché ne change, aucune donnée n'est réécrite. **Release patch.**

## 1 · Ce qui est mesuré (Cowork, dans le code, le 13 sept. sur `8ff669c0`)

**#746, moitié restante.** `obtenirInterventionsEtudiant` (`js/interventions.js:173-176`) filtre encore `i.etudiants.includes(da)`
ET RIEN D'AUTRE. `interventionsDuContexteActif` (défini `:492-497`, avec sa traversée des deux modes `_estampillesAcceptees`
`:500-514`) n'a que **deux appelants dans tout `js/`** : `:374` (la liste, déjà réparée) et son export `window` (`:1740`).
Huit lecteurs suivront sans une ligne de modification : `js/profil-etudiant-sections-affichage.js:334`, `:770`, `:2183` ;
`js/etudiants.js:1054` et `:1271` (le compteur de la Liste) ; `js/graphiques-progression.js:521` et `:2259`.

⚠ **Le format de données a DÉJÀ bougé et n'est plus en cause** : `groupeCoursId` est entré au dossier intervention le 12 sept.
(`js/interventions.js:42` dans le JSDoc du format, `:236` à la création), il n'apparaît nulle part ailleurs dans `js/`, et
`js/import-export.js` ne touche les interventions qu'en anonymisation (`:1209`).

**#551, garde seule.** `js/interventions.js:1326-1327` porte encore la forme `? obtenirSeuil('idme.…') : null) || 0.75` et `|| 0.64` –
celle que #555 lot 2 a démontée **quinze lignes plus haut** (`:1255-1264`) parce qu'elle confond « la fonction n'existe pas » et
« la fonction a rendu une valeur falsy ». Le cliquet `tests/unit/sentinelle-555-replis-seuil-defi.test.js:113-118` interdit déjà ce
motif, mais son filtre (`:81`) ne vise que `defiSpecifique` : les deux `idme.*` y échappent.

## 2 · Portée

UN SEUL fichier de `js/` : `js/interventions.js`, deux sites (`:173`, `:1326-1327`). Aucun appelant à retoucher. Aucune zone protégée.
Aucune valeur en base ne change, aucune migration.

⛔ **NE RENOMME RIEN** : les seuils gardent leurs noms `idme.*`, leur valeur et leur calibrage. Le devenir de ces noms est une question
posée à Grégoire (Q4 du fichier des questions), hors de ce lot.

## 3 · Stock – nommer, ne rien réparer

Les interventions écrites avant le 12 septembre n'ont pas de `groupeCoursId` : elles sont visibles partout, par choix explicite
(`js/interventions.js:496`, la clause `!i.groupeCoursId ||`), et prennent leur contexte au premier « Enregistrer » (`:1507-1510`).
Ce lot conserve ce contrat tel quel. ⛔ Aucune réécriture en masse, aucune proposition d'en faire une.

## 4 · Ordre, et le montage qui ISOLE chaque contrôle

⚠ Lis ce paragraphe en entier : trois garde-fous peuvent attraper avant celui qu'on croit éprouver et rendre un essai vert pour la
mauvaise raison.

**(1) #746, `js/interventions.js:173`** – faire passer la lecture par `interventionsDuContexteActif`.
*Mutation qui prouve* : revenir au filtre par DA seul ; l'essai neuf doit rougir.
*Montage isolant, trois précautions cumulatives* :
- (a) aucune intervention du montage ne porte `jamaisSauvegardee: true`, sinon `_interventionsLisibles` (`:174`, la même ligne) les
  fait disparaître par un autre chemin ;
- (b) le témoin de l'autre groupe porte EXPLICITEMENT `groupeCoursId: 'GC2'`, ET une seconde intervention SANS le champ doit rester
  visible dans le même essai – c'est cette seconde assertion qui empêche « j'ai tout filtré » de passer pour un succès ;
- (c) le montage se pose en mode groupe-cours STRICT (`groupeCoursActif.modeCours` faux, `infoCours._modeCours` faux, `coursId`
  distincts), sinon `_estampillesAcceptees` accepte les deux groupes du même cours et le filtre ne cache rien.

Le harnais des deux modes existe déjà : `tests/unit/sentinelle-834-intervention-porte-son-contexte.test.js:106-146`, à reprendre.
*Contre-épreuve obligatoire* : faire tomber la mutation sur AU MOINS UN lecteur réel (`js/etudiants.js:1271`, le compteur de la
Liste), pas seulement sur l'appel direct – sinon on éprouve une fonction, pas un écran.

**(2) #551, `js/interventions.js:1326-1327`** – séparer la garde de chargement du repli de valeur, exactement comme `:1255-1264`.
*Mutation qui prouve* : remettre la forme d'origine.
⚠ *DEUX montages sont nécessaires, et le second seul distingue le correctif du code actuel* :
- (a) `obtenirSeuil` ABSENTE (`typeof !== 'function'`) – la garde doit tenir, aucune valeur inventée ;
- (b) `obtenirSeuil` PRÉSENTE et rendant `0` (un seuil délibérément mis à zéro) – le correctif doit propager `0`, pas `0.75`.

Un essai qui ne monte que (a) passe identiquement avant et après le correctif. Étendre `sentinelle-555-replis-seuil-defi.test.js` aux
deux `idme.*` comme cliquet de forme, ET ajouter (b) comme essai de comportement – les deux, jamais l'un à la place de l'autre.

## 5 · Filet existant, et un trou mesuré

⚠ **AUCUN banc n'éprouve `obtenirInterventionsEtudiant` aujourd'hui** : les six essais qui la nomment la remplacent par `() => []`
(`sentinelle-749-lot2:132`, `sentinelle-lot4-profils:81`, `audit-sous-onglets-suivi-2026-09-06:438`), et le seul qui l'appelle
vraiment (`sentinelle-lot-5-interventions-cadrage-11:145`) le fait sur un seul élève sans contexte. C'est précisément la configuration
où un correctif peut passer sans mordre : **le banc neuf est obligatoire, pas optionnel.**

À garder verts et à relancer : `sentinelle-834-intervention-porte-son-contexte` (8 cas, le banc de #746) ·
`sentinelle-772-intervention-conserve-ce-que-le-formulaire-ne-montre-pas` (son cas « GC2 rouverte sous GC1 », `:42`, croise le même
terrain – **à relire AVANT de toucher `:173`**) · `sentinelle-lot-5-interventions-cadrage-11` bloc B (`:154-186` : il déplace
`idme.insuffisant` à 0,66 et exige que le bilan et la suggestion suivent ensemble – **s'il bouge, le geste a débordé sur le calibrage :
RECULER**) · `sentinelle-733` · `sentinelle-575-lot4-b1b2-b3b4` · `audit-onglet-suivi-2026-09-05:761-766`.

## 6 · Écritures de backlog, sans code, dans le même commit

- **COCHER #542.** Son symptôme dans `js/interventions.js` est mort depuis le 27 août (`js/interventions.js:300-327` porte la pierre
  tombale du bloc « défis » ; `js/portfolio.js:582-588` atteste le retrait de `convertirNiveauEnPourcentage`). Son pas 3 est livré
  (`interpreterScoreIDME` supprimée, `js/profil-etudiant-sections-affichage.js:927` ; un bloc par niveau `:1210-1225` ;
  `situerPourcentageDansEchelle` branchée `:1114`, `:1330`). Son pas 4 est verrouillé par
  `tests/unit/sentinelle-542-pas4-solo-critere-configure.test.js:51`. Ses traînes de données sont portées par #544, #545 et #546.
  Son unique reste – le pas 5, le devenir des seuils – EST la question de #551 : la transférer en une ligne. *Motif à écrire : la
  garder ouverte fait compter deux fois le même arbitrage.*
- **CORRIGER le goulot de #742.** Elle dit `interventions.js:918-919`, qui est du HTML de case à cocher. La règle vit depuis le
  10 sept. dans `js/contexte-qualification.js:239-242` (`BORNES_CONTEXTE`), `:330-334` (`BORNES_MOBILISATION`), `:107`
  (`BORNE_FIXE_INSUFFISANT`), plus cinq littéraux dans `js/tableau-bord-apercu.js` (`:321`, `:324`, `:344`, `:345`, `:536`).
  Cocher aussi ses **deux volets déjà faits** : les lettres du bilan (lot 5, `js/interventions.js:1117-1120`) et
  `interpreterAssiduite`/`interpreterCompletion`, qui lisent déjà les réglages de l'utilisateur (`js/contexte-qualification.js:109-119`).
  Écrire dans la fiche qu'elle appartient à un futur lot `contexte-qualification.js`, avec #821 et #822 qui vivent au même endroit.
- **COCHER la première moitié de #746** (la liste, réparée le 12 sept. par `js/interventions.js:374`).
- **INSCRIRE un constat neuf, dans aucune fiche** : `cleNorm.startsWith('francais')` en dur, trois fois
  (`js/interventions.js:1085`, `:1286`, `:1334`) – un sixième nom de critère de Grégoire, cette fois dans un chemin de CALCUL et non
  dans un exemple. Inscrire et continuer ; ne pas coder dans ce lot.

## 7 · Hors lot, et pourquoi

- **#847** (les deux exemples gris du formulaire) sort du lot de code malgré son coût presque nul : ce sont des mots que vingt
  collègues liront le 15, et choisir nous-mêmes un exemple « neutre » serait le même défaut à l'envers. → Q1 du fichier des questions.
- **#836** reste ouverte et datée : six décisions hétérogènes sous un numéro, avec un verrou de calendrier écrit dans la fiche
  (« tout est manuel pour un mois, ses retours d'octobre trancheront »). La mesurer davantage avant son mois d'usage serait du
  travail perdu.
- **#742** et **#542** : voir § 6.

## 8 · Preuve et livraison

Break-test sur chaque essai neuf, avec les montages isolants du § 4 – **un essai qui reste vert sous sa mutation ne compte pas**, et il
faut alors dire lequel et pourquoi. Vitest complet. Puis `scripts/release.mjs patch`. L'entrée « Nouvelles » se rédige en gestes : un
item suffit, sur les interventions du profil ; le second geste ne se voit pas.
**RELECTURE CROISÉE DE COWORK AVANT LA RELEASE** ; verdict Playwright Cowork fermé (PROTOCOLE règle 8).
