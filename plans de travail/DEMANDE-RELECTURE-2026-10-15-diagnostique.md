# Demande de relecture – la production diagnostique (#1055)

> Écrite par Claude Code le 15 octobre 2026 à 15 h 03 (Toronto, mesuré par `date`), sur `CONSIGNE-LOT-2026-10-15-diagnostique.md` (Cowork, 14 h 02). Pour Cowork.
> Rien n'est poussé, aucune release, aucun verdict Playwright : on attend le signal du soir.

## En bref

Un commit de code, `7543b298`. Partie 1 : la case ne se reporte plus. Partie 2 : treize sites lisaient le diagnostic comme une production ordinaire ; ils passent maintenant par l'entité, et la marque « Diagnostique » s'affiche dans quatre listes. Partie 3 : rien n'est écrit dans les données ; une porte d'une rangée, après la version du soir.

**Remonté, non touché (§ 4)** : en sommative, les moyennes par critère du profil comptent encore le diagnostic, et elles alimentent le défi, donc le pattern, donc le palier RàI. La consigne interdit de toucher au palier RàI hors de la porte 4.

## 1. Partie 1 – le choix

**Tranché** : « + Nouvelle production » (`creerNouvelleProduction`, `productions-liste.js`) appelle `reinitialiserFormulaireProduction` (`productions.js`), désormais exportée, et n'a plus sa propre liste de champs. Motif : cette liste avait déjà oublié les consignes (#509), les échéances par groupe (#468/CO-17), puis la case. Les trois champs que seul ce chemin vidait (contexte facultatif, panneau des métadonnées, zone portfolio) passent dans la remise à neuf commune. Effet de bord nommé : « + Nouvelle production » remet aussi l'échelle, la cartouche et les deux champs portfolio (3 et 7) à leur valeur de départ, comme le faisait déjà la fiche d'ajout. Complexité de `creerNouvelleProduction` : 17 → 9 (le cliquet des fonctions au-dessus de 15 passe à 454).

**Les autres chemins, mesurés** : « Ajouter une production de ce type » passe par `afficherFormProduction(null)` puis par la même remise à neuf. La duplication, la bibliothèque et les imports copient l'objet source tel quel : une copie de diagnostic reste un diagnostic, et c'est sa propre case, pas celle de la fiche précédente. La carte d'alignement ne crée pas de production (elle ne fait que s'y rattacher).

## 2. Partie 2 – l'inventaire

| Surface | Où | Disposition |
|---|---|---|
| Note du cours, détail, portfolio, indice P | familles de `js/pratiques/`, `calculerDetailsNoteFinale`, `calculerNoteDuCours` | **Déjà exclu en amont** (portes 1 et 3, 7 sept.) |
| Indice C du jour, fraction du profil | les quatre `calculerCompletion`, `obtenirDetailsCompletion` | **Déjà exclu en amont** |
| Fenêtre des patterns, IPB, défi spécifique, N derniers artefacts | `obtenirIdsProductionsEvaluables` | **Déjà exclu en amont** (porte 2) |
| Jugement de non-participation | `depistagePeutJugerLaNonParticipation` | **Déjà exclu** (porte 4) |
| Export des résultats finaux (Léa) | `simulerIndices` → familles | **Déjà exclu en amont** |
| Synthèse de rétroaction, PDF de l'élève | `synthese-retroaction-data.js` | **Déjà exclu** |
| P historique des captures | `calculerNoteDuCours` | **Déjà exclu en amont** |
| **C historique des captures** (courbes du profil, graphiques de complétion) | `snapshots.js`, `calculerIndicesHistoriques` | **Le comptait — corrigé** |
| **C du groupe des captures** (« dernier travail dû ») | `snapshots.js`, `capturerSnapshotSeance` | **Le comptait — corrigé** (en semaine 1, le diagnostic est souvent le seul dû) |
| **« sur N » de l'Accompagnement** | `genererSectionAccompagnement` | **Le comptait — corrigé** ; noté sous #1083 (6.65) |
| **Artefacts remis et retenus, section Engagement** | `genererSectionMobilisationEngagement` | **Le comptait — corrigé** |
| **Flèches par critère, progression de l'élève** | `calculerDirectionsCriteres` | **Le comptait — corrigé** |
| **Graphique par critère du profil** | `_genererGraphiqueCriteresHTML`, `obtenirDonneesCriteres` | **Le comptait — corrigé** |
| **Trajectoires par production** (tableau de bord) | `chargerProductionsTrajectoires` | **Le comptait — corrigé** |
| **Productions évaluées du groupe** (message de fiabilité) | `afficherMetriquesGlobales` | **Le comptait — corrigé** |
| **Liste des étudiant·es, « ≥ Min. »** | `afficherListeEtudiantsConsultation` | **Le comptait — corrigé** |
| **Comparateur, colonne « Niveau atteint » et fiche** | `_donnees` | **Le comptait — corrigé** (les notes passaient déjà par les familles) |
| **Export de recherche, distribution par critère** | `trimestres.js`, `performance_par_critere` | **Le comptait — corrigé** |
| **Moyenne de la Liste des évaluations** | `afficherTableauEvaluations` | **La comptait — corrigé** ; la ligne reste affichée, avec sa marque |
| Moyennes par critère en sommative (forces, défis, « Progression par critère », capture d'intervention) | `calculerMoyennesCriteres` | **Le compte — remonté** (§ 4, a) |
| Échelle commune, diagnostic de conversion | `obtenirEchelleCommuneDesEvaluations`, `diagnostiquerConversionNiveaux` | **Le compte** : un diagnostic sur une autre échelle peut faire dire « échelles mélangées ». Aucun chiffre. **Issue 2** |
| Export de recherche, liste brute des évaluations et des artefacts | `trimestres.js` | **Le compte**, sans marqueur : un chercheur ne saura pas qu'une évaluation est diagnostique. Ajouter un champ change un format qui voyage. **Remonté** (§ 4, b), avec #1060/#1074 |
| Signalement « Aide en français recommandée » | `SignalementDepistage` | **Le lit, voulu** (7 sept.) |
| Registre longitudinal | `registre-longitudinal.js` | **Garde tout, voulu** : c'est le dossier figé de l'élève |
| Impact des jetons (Labo) | `impact-jetons.js` | Le compte, seulement si une reprise porte sur un diagnostic. **Issue 3** |
| Liste des critères des graphiques | `listerCriteresHabiletes` | Des noms, aucun chiffre. **Issue 3** |
| Rythme d'évaluation | `rythme.js` | Le temps de l'enseignant·e, pas le parcours d'un élève : hors de la règle |

**Passer par l'entité** : chaque site corrigé appelle `ProductionDiagnostique.filtrerProductions` ou `filtrerEvaluations`, sans filtre local. Le harnais commun des bancs (`tests/unit/_helpers/charger-script.js`) fournit désormais la vraie entité à tout banc qui ne la charge pas, comme il le fait déjà pour `motsNature`. Je l'ai préféré aux gardes `window.ProductionDiagnostique ? … : …` : la garde cachait l'absence (un repli sur la liste brute ferait recompter le diagnostic en silence) et faisait monter sept fonctions déjà figées au cliquet de complexité (mesuré).

**« Vue autrement »** : la marque `ProductionDiagnostique.marqueHTML` (le mot de la case, « Diagnostique » ; la bulle reprend son libellé, « Travail diagnostique — ne compte dans aucun calcul ») s'affiche dans Conception › Productions (liste de gauche), la Liste des évaluations, le profil (liste des productions, travaux soumis). Style `.marque-diagnostique` : neutre, bordure pointillée, même gabarit que « À planifier » ; ajouté à `design-system.html`. Aucune section ni aucun graphique neuf.

**Supposé, à confirmer** : quand la Liste des évaluations est filtrée sur la seule production diagnostique, la « Moyenne » disparaît (aucune ligne n'y entre). Si Grégoire veut lire la moyenne du diagnostic à cet endroit, il faudra la lui rendre dans ce cas seulement.

## 3. Les chiffres qui bougent

**Sur la démonstration telle qu'elle est livrée : aucun.** Elle ne porte aucune production diagnostique (`pack-demo-10.js` : 0 champ `diagnostique`).

**Démonstration, « Artefact 1 » marqué diagnostique** (pratique standards ; mesuré au navigateur WebKit, ancien code `77621c98` contre nouveau, script jetable retiré) :

| Lecture | Avant → après |
|---|---|
| Note du cours, C du jour | inchangées pour les 10 élèves (déjà exclues) |
| C historique (dernière capture) | 4 élèves sur 10 : 80 → 78 (deux élèves), 90 → 89 (deux élèves) ; 6 inchangés |
| Flèches par critère | inchangées (l'artefact 1 n'est pas dans la fenêtre des 3 derniers) |
| « sur N » de l'Accompagnement | −1 pour chaque élève dont l'artefact 1 est évalué — **déduit de la règle, pas lu à l'écran** |

**Mesuré par le banc C** (deux élèves, le diagnostic est le dernier travail dû et seule une élève l'a remis) : C historique de l'autre élève 50 → 100 ; C du groupe de la capture 50 → 100. Témoin : décochée, la production redonne 50 et 50.

**Chez Grégoire** (automne 2026) : pas mesuré. Les captures déjà écrites gardent leur C jusqu'à « Recalculer les captures » (tarir n'est pas réparer : c'est assumé, rien n'est réécrit d'office).

## 4. Ce qui remonte

- **a) Les moyennes par critère en sommative** (`calculerMoyennesCriteres`, `profil-etudiant-calculs.js`) lisent toutes les copies qui comptent, diagnostic compris. Elles donnent la liste « Progression par critère » du profil et les forces et défis, mais aussi `diagnostiquerForcesChallenges`, donc le pattern « Défi spécifique » et le palier RàI de la sommative. En standards, la même lecture passe déjà par la porte 2 (`calculerMoyennesCriteresRecents`). La décision de 14 h 00 demande l'exclusion ; la consigne interdit de bouger le palier hors de la porte 4. **Question** : a) on l'exclut (un palier peut changer en sommative, à mesurer sur la démo) ; b) on la laisse.
  - ⮕ **Tranché par Cowork (15 h 07), fait le 15 oct.** (`4125759f`) : exclu. `calculerMoyennesCriteres` passe par l'entité. Mesuré sur la démo (« Artefact 1 » marqué, ancien code contre nouveau) : moyennes par critère changées pour les 10 élèves (de 0,001 à 0,03) ; forces et défis changés pour 2 élèves (les défis de l'un passent de « Plausibilité, Nuance, Rigueur » à « Plausibilité » ; ceux de l'autre, de « Structure, Nuance, Rigueur » à « Structure ») ; défi principal, pattern et palier RàI inchangés pour les 10, sous la pratique active de la démo (standards). Une seconde passe, type de pratique forcé à « sommative » dans la page, rend les mêmes chiffres, mais je n'ai pas vérifié que le forçage a pris : elle ne prouve rien pour la sommative. Banc : bloc F de `sentinelle-1055` (4 essais, témoin compris) ; 2 mutations, 2 rouges ; Vitest 761 fichiers, 8 888 verts.
- **b) L'export de recherche** garde la liste brute des évaluations sans dire lesquelles sont diagnostiques : ajouter un champ change un fichier qui voyage. À décider avec #1060/#1074. ⮕ **Tranché par Cowork (15 h 07)** : reste tel quel ; la phrase est sous #1074 au BACKLOG.

## 5. Les bancs

- `tests/unit/sentinelle-1055-un-diagnostic-se-lit-autrement.test.js`, 25 essais : A, la marque (le mot de la case, ses variables CSS existent) ; B, la fiche neuve par chaque chemin (comportement : la case cochée à l'écran revient décochée) ; C, les captures (comportement, avec témoin) ; D, chaque site par l'entité, fonction par fonction ; E, la marque rendue dans la Liste des évaluations (comportement) et posée par l'entité ailleurs.
- **Break-test par ablation** : 25 mutations (une par site, plus la marque vide, la marque partout, un mot neuf, une variable CSS fantôme, la liste de champs revenue), **25 rouges**, fichiers restaurés par copie et empreinte vérifiée.
- Bancs suivis : `sentinelle-509` (harnais : `productionEnEdition` et `closest` ; AC.a vérifie maintenant la délégation et l'absence d'une liste propre), `sentinelle-468` (le cliquet lit la remise à neuf commune), `sentinelle-562` (la marque entre dans la liste fermée : constante de l'entité), `sentinelle-contenir-complexite` (454).
- **Playwright, écrit et non lancé** : `tests/integration/diagnostique-1055-lu-autrement.spec.js` (3 essais, listés par `--list`). Il compare chaque lecture à un oracle : la même lecture sans la production ni ses copies. Il vérifie aussi la marque dans les deux listes et la case décochée après « + Nouvelle production ». Aucun spec existant ne citait le champ `diagnostique` (grep de `tests/integration`).
- **Vitest complet** depuis `tests/` sur `7543b298` : 761 fichiers, 8 884 essais verts, aucune ligne « Errors » ni « Unhandled ».

## 6. Trouvailles, avec leur issue

1. `calculerEtSauvegarderIndiceCompletion` (`liste-evaluations.js`) calcule deux complétions à chaque ouverture de la Liste et les jette (la clé qu'elle écrivait a été retirée en avril). → **Issue 3**.
2. `selectionnerArtefactsSelonModalite` et `calculerPerformanceParObjectif` (`portfolio.js`) n'ont aucun appelant. → **Issue 3**.
3. L'avertissement des rangées de la Liste des évaluations pour un fichier sans production (« Non associé ») ne porte pas de marque : sans production, il n'y a rien à marquer. Sans suite.

## 7. La ligne des Nouvelles, proposée

> Une production marquée « Diagnostique » porte maintenant cette étiquette dans tes listes, et ne compte plus nulle part : ni dans la note, ni dans la complétion, ni dans les courbes et les graphiques du profil. Une nouvelle production ne reprend plus la case de la précédente : jette un œil à tes productions marquées et décoche celles qui ne sont pas des diagnostics.

## 8. La porte terrain

`plans de travail/PORTES-TERRAIN-2026-10-15-diagnostique.md` : une porte (§ 1.1), après la version du soir. Grégoire relève les productions marquées de l'automne 2026 et décoche lui-même celles qui ne sont pas des diagnostics. Deux champs de saisie, pas de bascule. Cowork publie l'artefact.
