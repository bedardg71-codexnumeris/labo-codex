# Carte des lecteurs et écrivains de `evaluation.criteres[]` — lot 3 des trois types de grille

> **Mesurée le 4 septembre 2026 au matin, par Claude Code, sur l'arbre du lot 3** (HEAD `37660b76`
> + le lot 3 non encore commité au moment de la mesure). Livrable demandé par la consigne du jour
> (§4) pour la relecture croisée de Cowork : *pour chaque fichier où `criteres[]` se construit ou
> se lit, le critère analytique y entre / y est lu / n'a pas à y être*.
>
> ▣ **Commande** : `grep -rn "niveauSelectionne" js/ | grep -v "data-on-change\|function niveauSelectionne\|window.niveauSelectionne\|niveauSelectionne("` rend **18 fichiers** (compte par fichier : `… | cut -d: -f1 | sort | uniq -c`). Témoin : sans le filtre, le motif rend aussi le handler et ses appels (`evaluation-chargement.js`, `main.js`).
> ⚠ La consigne parlait de « seize fichiers hors calcul » : le compte brut en rend dix-huit, dont deux
> qui n'ont pas à y être (un commentaire dans `echelles.js`, les données de démo de `pack-demo-20.js`).

## Ce que le lot 3 change, en une phrase

`calculerNote` déduit le niveau des points par les bornes de l'échelle (`_deduireNiveauxAnalytiques`,
`evaluation-calcul.js`) et l'écrit dans `evaluationEnCours.criteres[critereId]` — **sous le même nom
que les niveaux choisis au menu**. Tout ce qui lit ce tableau voit donc le critère analytique **sans
qu'aucun lecteur change** ; seuls les trois collecteurs (ils ajoutent `points`) et les trois rendus
que l'élève lit (ils impriment « 24 / 30 » à la place du niveau) ont bougé.

## Les ÉCRIVAINS de `criteres[]` en base — le critère analytique **y entre**

| Fichier | Fonction | Ce qui entre | Changé au lot 3 |
|---|---|---|---|
| `js/evaluation-sauvegarde.js` | `_collecterCriteresSauv` (enregistrement) | `{critereId, critereNom, niveauSelectionne: <déduit>, points: 24, ponderation: 30, retroaction}` | oui : `points` |
| `js/evaluation.js` | `_collecterCriteresMod` (modification) | idem | oui : `points` |
| `js/evaluation-chargement.js` | `_collecterCriteresAutoSave` (les deux écrivains de l'auto-save) | idem | oui : `points` |
| `js/evaluation-calcul.js` | `_deduireNiveauxAnalytiques` ← `calculerNote` | la SOURCE du niveau déduit, dans l'évaluation en cours (pas en base) | oui : neuf |

Les points restent dans `pointsAnalytiques` (lot 2) : `criteres[].points` en est une **lecture**, la source
ne change pas de place. `points` n'existe que si `critere.type === 'analytique'` et que des points sont
saisis ; un critère holistique ou algorithmique entre exactement comme avant.

## Les LECTEURS de `criteres[]` — le critère analytique **y est lu**, sans changement

| Fichier (lignes) | Ce qu'il en fait | Disposition |
|---|---|---|
| `js/consolidation.js` (118) | matrice de dépistage : `conversion(c.niveauSelectionne)` | **y est lu** — le niveau déduit entre dans le dépistage |
| `js/profil-etudiant-calculs.js` (861, 1010, 1105, 1688) | profil, scores par critère | y est lu |
| `js/profil-etudiant-sections-affichage.js` (2146) | affichage du profil | y est lu |
| `js/pratiques/pratique-pan-standards.js` (964, 1146) | pratique PAN : score par critère | y est lu |
| `js/graphiques-progression.js` (2449-2451, 3819) | progression ; `niveauHabiletesVersDecimal` lit un code lettre | y est lu |
| `js/trimestres.js` (2223, 2537) | archives, longitudinal | y est lu |
| `js/journal.js` (129, 366) | journal | y est lu |
| `js/liste-evaluations.js` (2195) | liste des évaluations (`{critereId, niveau}`) | y est lu |
| `js/evaluation.js` (743, 1873) | réouverture d'une copie (restaure le niveau, puis les points le redéduisent) ; reprise ciblée | y est lu |
| `js/evaluation-retroaction.js` (688-733, 826-1101) | **bilan** : `_collecterCriteresBilan` lit `ec.criteres` (et l'enregistrement en repli) ; zones priorité / acquis | y est lu — ⚠ voir la question ci-dessous |
| `js/travaux-ui.js` (6701) | tableau de révision, **côté enseignant·e** : `<span class="niveau">` | y est lu — le niveau reste visible à l'enseignant·e, laissé |
| `js/synthese-retroaction-data.js` (`construireCriteres`, 437-501) | données du PDF de l'élève : clé de cartouche `critereId_niveau`, commentaire | y est lu **et changé** : `points` passe au rendu ; amorce « Saisis les points » déclarée à la garde #672 |

## Les RENDUS que l'élève lit — **changés** : le chiffre, rien d'autre (arrêté 4)

| Fichier | Avant | Après |
|---|---|---|
| `js/synthese-retroaction-rendu.js` `renderCritere` | rangée de l'échelle I·D·M·E, niveau du critère surligné ; « 30% » sous le nom | **« 24 / 30 »** à la place de la rangée ; pas de « 30% » (le maximum EST le poids) |
| `js/evaluation-retroaction.js` `_rendreCommentairesCriteres` | « Critère 2 (Langue) — M » (texte copié vers LÉA) | **« Critère 2 (Langue) — 24 / 30 »** ; le commentaire de la cartouche choisi par M suit |
| `js/travaux-export-pdf.js` (949) `afficherRevisionExport` | « Langue — M » | **« Langue — 24 / 30 »** |

⚠ **Précision sur la prémisse de la consigne** : `travaux-export-pdf.js:949` n'est pas le PDF remis,
c'est **l'aperçu de révision de l'enseignant·e** (le commentaire #672 du fichier le dit : « APERÇU
ENSEIGNANT, pas le PDF remis »). Le PDF remis à l'élève est la synthèse (`synthese-retroaction-data.js`
→ `synthese-retroaction-rendu.js`). Les deux sont changés pour dire la même chose.

## N'a pas à y être

| Fichier | Motif |
|---|---|
| `js/echelles.js` (4394) | un commentaire qui nomme le champ |
| `js/pack-demo-20.js` (917 occurrences) | données de démonstration figées |

## Ce qui reste ouvert — à Grégoire (les mots que ses élèves lisent)

Le **bilan** (`evaluation-retroaction.js`, `_rendreDefisBilan` / `_rendreSignalesBilan`, copié sous
« === BILAN === » dans ce que l'élève reçoit) nomme un critère avec le **nom de son niveau** :
« - Langue (Maîtrisé) ». Pour un critère analytique, c'est le niveau déduit qui s'y lit, pas le
chiffre. Le lot 3 le laisse tel quel — la consigne borne le périmètre au PDF et au chiffre — mais
c'est une phrase que l'élève lit : **garder « Langue (Maîtrisé) », ou dire « Langue (24 / 30) » ?**
