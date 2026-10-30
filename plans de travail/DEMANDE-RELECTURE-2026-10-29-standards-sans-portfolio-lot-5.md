# Demande de relecture – Des standards sans portfolio, lot 5 : l'assistant et les mots (#1178)

> Claude Code, vendredi 30 oct. 2026. Consigne : `CONSIGNE-LOT-2026-10-29-standards-sans-portfolio-lot-5.md` ; mots : `TEXTES-2026-10-29-standards-lot-5.md`, posés mot pour mot. Code : `e08e6c03`. Non poussé, pas de release ; les Nouvelles reviennent à Grégoire.

## 1. La fonction de variante et ses lecteurs

`js/pratiques/pratique-registre.js` :
- `lireProductionsStdDuCoursActif()` : `obtenirDonneesSelonMode('productions')`, diagnostiques retirées, terminale identifiée ;
- `coursActifFaitDArtefacts()` : LA règle, sur `poolStdFaitDArtefacts` ; aucune production → faux ;
- `motsPoolStd(avecArtefacts = coursActifFaitDArtefacts())` : la table des mots des deux variantes.

| Lecteur | Comment |
|---|---|
| Assistant (`wizard-pratique-v2.js`) | des accesseurs (`get label()`…) dans `ETAPES_WIZARD` : les lecteurs existants ne changent pas, le mot se lit à l'affichage |
| Récapitulatif | `motsPoolStd()` |
| Fiche (`pratiques-gestion.js`) | `poserLesMotsDeLaFicheStd()`, appelée par `remplirFormulairePratique` ; `index.html` laisse ces cinq libellés vides, une seule source |
| `obtenirTermeProduction`, `genreTermeProduction` | `coursActifFaitDArtefacts()`. La lecture de `termeProduction` est retirée (mesuré : aucun écrivain, un seul lecteur) |
| Liste du lot 4 (`_etatProductionsQuiComptent`) | `lireProductionsStdDuCoursActif()`, au lieu de sa propre lecture |
| Récit | garde son `avecArtefacts`, calculé par `poolStdFaitDArtefacts` sur les productions du calcul : la même règle, et le Comparateur passe par là |

## 2. Les champs morts

Remesuré avant de retirer (`grep` de `nombreTotal`, `.utiliser`) : aucun lecteur hors de ces écrans.

| Pratique existante, enregistrée | Avant | Après |
|---|---|---|
| Porte `utiliser: true, nombreTotal: 6`, par la fiche | `nombreTotal` réécrit depuis le champ ; `utiliser` **perdu** | les deux gardés tels quels |
| Les porte, par l'assistant | réécrits depuis les réponses | les deux gardés (`conserverReglagesSansLecteur`) |
| Ne les porte pas, par la fiche | `nombreTotal: 10` ajouté | rien d'ajouté |
| Neuve, par l'assistant | les deux écrits | aucun |

**Source ou stock ?** Source seulement. Le stock garde ses valeurs, sans lecteur, et c'est voulu.

**Ajouts à la consigne, tranchés** : les deux gabarits (`pratiques-bibliotheque.js`), le portfolio par défaut (`pratiques.js:~94`) et la copie de `pratique-pan-standards.js:~537` ne portent plus `nombreTotal`, sinon une pratique neuve l'aurait encore. **Gardés** : le pack de démo (des données) et les schémas `regles.nombreTotal` (`import-export.js`, `partage-schemas.js`), ce qui voyage.

## 3. Les douze textes posés

| N° | Où |
|---|---|
| 1 | Assistant, carte et information ; récapitulatif, `approcheLabels` |
| 2 | Assistant, titre et description de `config-portfolio` |
| 3 | Assistant, récapitulatif, fiche (les trois modes ; « Hybride » inchangé) |
| 4 | Assistant, fiche, récapitulatif |
| 5 | Assistant, aide de « Hybride » |
| 6 | Assistant et fiche, deux variantes |
| 7 | Fiche, en tête de « Structure des évaluations » |
| 8 | Aide PAN – Standards ; encadré « À vérifier » des Productions |
| 9 | Aide, bloc « PAN – Standards » des familles |
| 10 | `_formuleRecitStd` : `portfolio × 100 %`, `productions retenues × 100 %` (avec l'insécable de `formaterPourcentage`) |
| 11, 12 | Aide PAN – Standards |

## 4. Trois points à juger

1. **Le « › » du texte 5 contredit une sentinelle.** #899 (lot N6) a imposé « → » et interdit « › » dans le code de `wizard-pratique-v2.js` ; le texte validé dit « dans Conception › Pratiques de notation ». Posé mot pour mot, et deux sentinelles (`lot-n6`, `lot-29`) n'admettent que cette occurrence. Le même écran dit donc « Conception → Pratiques de notation » au récapitulatif d'une spécification. Si « → » doit l'emporter, c'est un mot à repasser à Grégoire.
2. **Un mot hors de la table du § 3.** Le récapitulatif a aussi une ligne « Variante : Par artefacts » (`varianteLabels`), que le § 1 de la consigne interdit pour CHIM. Elle suit la variante : « Par productions » (le mot du texte 1), « Par artefacts » pour GREG, inchangé.
3. **L'effet de `obtenirTermeProduction`.** En standards sans artefact, une cinquantaine de lignes hors de son fichier (profil, tableau de bord, graphiques, liste des étudiant·es, rapport) disent maintenant « production », accords compris. Il relit les productions à chaque appel : mémoïsé pendant un pipeline, pas mesuré sur un gros corpus hors pipeline.

## 5. Les preuves

- **Vitest complet**, depuis `tests/` : 852 fichiers, 10 348 verts.
- **Sentinelle** `sentinelle-standards-sans-portfolio`, section I (13 cas, textes lus dans TEXTES par la forme `lire(f)`) : CHIM, GREG, corpus vide, autre cours, terme et accords, récit et 84,8, pratique neuve, « les garde » (fiche et assistant), « ne les gagne pas », textes statiques.
- **Break-tests** (arbre restauré, sha256 identique, journal en fin de sentinelle) :

| Mutation | Résultat |
|---|---|
| Variante forcée à « artefacts » | 5 rouges, tous CHIM ou corpus vide ; GREG vert |
| Récit rendu à « moyenne du … » | 3 rouges |
| Patron retiré pour `nombreTotal`, fiche | 1 rouge (« les garde ») |
| Le même, assistant | 1 rouge (« les garde ») |
| Variante lue sur tout le trimestre | 5 rouges |

- **WebKit** : `standards-sans-portfolio-lot-5.spec.js` (neuf, sans `waitForTimeout`) vert ; les 34 specs qui nomment « artefact », `nombreTotal` ou `utiliserPortfolio` : 100 verts, 1 sauté. La suite complète n'a pas tourné : elle attend le signal de Grégoire.

**Tests rendus aux nouveaux mots** : `sentinelle-aide-2026-10-28-lot-4` (les retouches 8, 11, 12 lues dans TEXTES, appliquées au texte du lot 4, et chacune doit s'appliquer), `-lot-3` (les modes lus dans le registre), `sentinelle-construction-de-la-note`, `lot-3.spec` (texte 8), `audit-pratiques-notation-*` (spec et unitaire), `golden-319`, `roundtrip-317`. Cliquets, tous à la baisse : `sentinelle-467` 40 → 39 ; complexité `remplirFormulairePratique` 60 → 58, `appliquerFormulaireDansCollection` 33 → 31, `genererRecapitulatif` 44 → 43, `creerPratiqueV2` 77 → 76.

Le banc commun (`charger-script.js`) donne, à un harnais sans registre, la variante « artefacts » et les mots du vrai registre.

## 6. Non vu

Chrome, l'iPad, et le rendu des libellés dans les modes sombre et clair. Le profil et le PDF d'une vraie pratique de chimie : le récit n'est jugé qu'au niveau du calcul.

## 7. L'inventaire (§ 5 de la consigne)

**Inscrits** : #1187 (l'Exploration et `construction-attributs.js`), #1188 (le message du profil).

**Autres chaînes croisées, rien de corrigé** :
- `pratiques-gestion.js:2654` : « Toutes les évaluations du portfolio comptent, sans sélection. », sous « Mode de sélection », y compris pour CHIM ;
- `accompagnement-contenu-hover.js:485` : la bulle de l'étape de l'assistant, « Ici, tu dis quels artefacts comptent… », y compris pour CHIM ;
- `construction-attributs.js:142, 185` : « Selon la sélection d'artefacts », « Artefacts (instruments d'évaluation) » ;
- le glossaire, terme « portfolio », cite les modes en « artefacts » : juste, il définit le portfolio.

Les deux premières se lisent sur les écrans de ce lot, mais aucun texte validé ne les couvre : elles attendent des mots de Grégoire.
