# Module Depistage, Suivi et Interventions

**Fichiers principaux** :
- `js/profil-etudiant.js` — profil individuel, IPB, patterns, diagnostic, accompagnement
- `js/interventions.js` — planification et suivi des interventions RaI
- `js/consolidation.js` — matrice de consolidation des apprentissages
- `js/graphiques-progression.js` — graphiques d'evolution des criteres

**Skill de reference** : `.claude/skills/depistage-rai/SKILL.md`
**Plan de refonte** : `plans de travail/PLAN-REFONTE-MODULE-INTERVENTIONS.md`
**Derniere mise a jour** : 11 avril 2026 (Beta 99.11)

---

## Vue d'ensemble

Le systeme de depistage et de suivi de Labo Codex forme une chaine :

```
Grille de criteres (enseignant)
    → niveauSOLO par critere (multistructurel / relationnel / abstrait etendu)
        → Evaluation des artefacts (indices A-C-P-E)
            → IPB sur criteres multistructurels
                → Diagnostic croise (IPB x direction)
                    → Patterns d'apprentissage
                        → Niveau RaI pedagogique (1 / 2 / 3)
                            → Accompagnement (profil etudiant)
                                → Planification d'intervention
                                    → Bilan et suivi
```

Le tout repose sur la **taxonomie SOLO** comme fondement universel. Les criteres
de l'enseignant (par exemple SRPNF pour la litterature) sont une couche
configurable — ce qui compte pour le depistage, c'est le niveau SOLO de
chaque critere, pas son nom.

---

## 1. Grille de depistage

### Configuration

L'enseignant definit sa grille dans les Reglages > Depistage :
- **Grille de criteres** : chaque critere a un nom, un type, une ponderation
  et un attribut `niveauSOLO` (multistructurel, relationnel, abstrait_etendu)
- **Fenetre d'analyse** : nombre de dernieres productions (defaut : 4)
- **Seuils configurables** :
  - Progression des artefacts : difference minimale pour progression/regression (defaut : 5 pts)
  - Direction du risque : variation minimale pour tendance (defaut : 5 pts)
  - Seuil de defi specifique : score sous lequel un critere est en defi (defaut : 70%)
- **Seuils d'interpretation** : Fragile (< 65%), Acceptable (< 70%), Bon (>= 75%)
- **Option P/R decouples** : P pour la notation, R pour le depistage

### Fonction cle

```
obtenirGrilleReferenceDepistage()  →  profil-etudiant.js
```
Retourne la grille configuree avec les criteres et leurs attributs SOLO.
Exportee sur `window.*` — accessible depuis tous les modules.

### Exemple de grille (litterature 601-101)

| Critere | niveauSOLO | Ponderation |
|---------|-----------|-------------|
| Structure | multistructurel | 20% |
| Rigueur | multistructurel | 20% |
| Plausibilite | relationnel | 15% |
| Nuance | abstrait_etendu | 25% |
| Francais ecrit | relationnel | 20% |

**Universel** : un enseignant de chimie ou de philosophie aurait d'autres
criteres, mais le meme mecanisme de depistage s'appliquerait via SOLO.

---

## 2. Indice de Persistance du Blocage (IPB)

### Definition

L'IPB mesure le nombre d'artefacts consecutifs recents dont le score pondere
des **criteres multistructurels** est sous le seuil de defi configurable.

### Calcul

```
calculerIPB(da)  →  profil-etudiant.js (lignes 5217+)
```

1. Filtrer les criteres dont `niveauSOLO === 'multistructurel'`
2. Pour chaque artefact recent, calculer la moyenne ponderee de ces criteres
3. Compter les artefacts consecutifs sous le seuil (en partant du plus recent)
4. Calculer la direction (progression ↗, stable →, regression ↘)

### Resultat

```javascript
{
  ipb: 3,                    // Nombre d'artefacts consecutifs sous le seuil
  direction: '→',            // Tendance
  scoreActuel: 0.65,         // Score moyen actuel des criteres multistructurels
  criteresMulti: ['Structure', 'Rigueur']  // Criteres surveilles
}
```

### Note historique

L'ancien Indice de Blocage (IB) — formule ponderee fixe `IB = 0.35×NS + 0.35×NF + 0.30×NR`
— a ete supprime en Phase 6. Les documents dans `references tableur/` qui le
mentionnent sont marques obsoletes (11 avril 2026).

---

## 3. Diagnostic croise (IPB x direction)

### Definition

Croise l'IPB avec la direction pour produire un diagnostic actionnable.

### Calcul

```
diagnostiquerSuiviApprentissage(da)  →  profil-etudiant.js (lignes 5377+)
```

### Matrice de diagnostic

| IPB | Direction | Diagnostic | Niveau RaI suggere |
|-----|-----------|------------|-------------------|
| 0 | — | Maitrise acquise | 1 |
| 1 | ↗ | Difficulte resolue | 1 |
| 1 | → ou ↘ | Difficulte emergente | 1 |
| 2 | ↗ | Progression | 2 |
| 2 | → | Plateau | 2 |
| 2 | ↘ | Difficulte constante | 2 |
| >= 3 | ↗ | Progression lente | 2 |
| >= 3 | → ou ↘ | Difficulte persistante | 3 |

---

## 4. Patterns d'apprentissage

### Definition

Le pattern est une synthese de la performance et des defis de l'eleve.

### Calcul

```
identifierPatternActuel(performancePAN3, aUnDefi)  →  profil-etudiant.js (lignes 5831+)
```

### Patterns

| Pattern | Condition | Badge CSS |
|---------|-----------|-----------|
| Difficulte persistante | P < 64% (Insuffisant) | `badge-pattern-difficulte-persistante` |
| Difficulte emergente | P < 75% (Developpement) ET defi present | `badge-pattern-difficulte-emergente` |
| Defi specifique | P >= 75% mais defi recurrent | `badge-pattern-defi-specifique` |
| Stable | Pas de defi identifie | `badge-pattern-stable` |
| En progression | Amelioration sur la fenetre d'analyse | (via tableau de bord) |

---

## 5. Niveau RaI pedagogique

### Definition

Derive le niveau d'intervention suggere a partir des patterns et de P.

### Calcul

```
determinerNiveauRaiPedagogique(da)  →  profil-etudiant.js (lignes 5868+)
```

### Niveaux

| Niveau | Condition | Signification |
|--------|-----------|--------------|
| 3 — Intensif | Difficulte persistante OU P < seuil insuffisant | Soutien individualise, reference possible |
| 2 — Preventif | P < seuil developpement OU Difficulte emergente OU Defi specifique | Intervention ciblee en sous-groupe |
| 1 — Universel | P >= 75% et stable | Enseignement regulier, pas d'intervention speciale |

Cas speciaux : «Non-participation» (present mais aucune production → Niveau 3),
«En attente» (aucune donnee).

---

## 6. Profil etudiant — Onglet Accompagnement

### Definition

L'onglet Accompagnement est le **lieu de decision** pour les interventions.
C'est la que l'enseignant voit le portrait complet de l'eleve et decide d'agir.

### Calcul

```
genererSectionAccompagnement(da)  →  profil-etudiant.js (lignes 1611+)
```

### Contenu affiche

**Carte 1 — Modele de la Reponse a l'intervention (RaI)**
- Badge du niveau RaI (1, 2, ou 3)
- Performance globale (P) avec niveau IDME et pourcentage
- Nombre d'artefacts sur lequel repose le diagnostic
- Progression par critere avec moyennes ET directions (↗→↘)
- Pattern d'apprentissage (badge)
- Defi principal

**Carte 2 — Contexte d'apprentissage**
- Badge favorable / fragile / defavorable
- Assiduite (A) et Completion (C)
- Recommandation contextuelle
- Statut services adaptes
- Bouton Confidentiel (notes chiffrees)

**Carte 3 — Observation SOLO des resultats**
- Defis en developpement (niveau D) avec description SOLO
- Defis critiques (niveau I) avec description SOLO
- Forces (niveaux M et E)

**Consolidation individuelle** (apres les cartes)
- Par critere : consolide (a quel artefact) / fragile / non consolide
- Source : `calculerConsolidationIndividuelle(da)` (consolidation.js)

**Historique des interventions**
- Liste des interventions passees avec type, titre, date, note individuelle
- Bouton «+ Nouvelle intervention» → `naviguerVersNouvelleIntervention(da)`

### Fonctions appelees

| Fonction | Donnee produite |
|----------|----------------|
| `determinerNiveauRaiPedagogique(da)` | Niveau RaI, pattern, defi principal |
| `determinerAlerteContextuelle(da)` | Contexte favorable/fragile/defavorable |
| `calculerIndicesNDerniersArtefacts(da, true)` | Niveaux IDME pour le depistage |
| `calculerProgressionEleve(da)` | Direction globale et par critere |
| `identifierDefiSpecifique(da)` | Defi principal avec score |
| `calculerDirectionRisque(da)` | Direction du risque |
| `obtenirCriteresAvecValeurs(da)` | Criteres avec pourcentages |
| `calculerConsolidationIndividuelle(da)` | Points de consolidation par critere |

---

## 7. Profil etudiant — Developpement des habiletes

### Definition

L'onglet Developpement des habiletes montre la trajectoire dans le temps.

### Contenu affiche

**Graphique d'evolution** (graphiques-progression.js)
- Courbe de chaque critere au fil des productions
- Criteres toggleables dans la legende

**Suivi de l'apprentissage des fondamentaux**
- Diagnostic IPB : pastilles colorees pour chaque artefact recent
- Diagnostic textuel (Difficulte persistante, Plateau, Amelioration...)
- Criteres multistructurels surveilles
- Score actuel et direction

**Forces et defis parmi les criteres** (lignes 6780+)
- Barres horizontales sur l'echelle IDME (I-D-M-E)
- Chaque barre montre : nom du critere, pourcentage, direction (↗→↘)
- Gradient de couleur selon les seuils

### Fonction cle

```
_genererBarresSRPNF(da, graphiqueCriteres)  →  profil-etudiant.js (lignes 6780+)
```

Utilise :
- `calculerMoyennesCriteres(da)` — scores actuels (exportee `window.*`)
- `calculerDirectionsCriteres(da)` — directions par critere (exportee `window.*`)
- `diagnostiquerSuiviApprentissage(da)` — IPB et diagnostic

---

## 8. Consolidation des apprentissages

### Definition

La consolidation mesure si les acquis tiennent dans le temps. Un critere est
«consolide» quand un etudiant (ou un groupe) atteint la maitrise (>= M) a une
production ET maintient ce niveau sur >= 75% des productions suivantes.

### Calcul individuel

```
calculerConsolidationIndividuelle(da)  →  consolidation.js
```

Retour :
```javascript
{
  pointsConsolidation: {
    'Structure': { artefact: 2, maintenusSur: 5, totalSuivants: 6 },
    'Rigueur': null  // jamais atteint M
  },
  resume: {
    'Structure': { type: 'consolide', artefact: 2, artefactNom: '...', maintenusSur: 5, totalSuivants: 6 },
    'Rigueur': { type: 'jamais-atteint-m' }
  }
}
```

Types de resume : `'consolide'`, `'non-consolide-avec-tentatives'`, `'jamais-atteint-m'`

### Calcul groupe (Labo > Suivi)

```
calculerMatriceConsolidation()  →  consolidation.js
```

Matrice : Productions (lignes) x Criteres (colonnes). Chaque cellule :
```javascript
{
  tauxRetention: 0.78,   // % du groupe qui maintient la maitrise
  nMaitrise: 9,          // Etudiants ayant atteint M a cette production
  nRetenu: 7,            // Etudiants ayant maintenu M ensuite
  nTotal: 15             // Etudiants evalues
}
```

### Seuils

| Seuil | Valeur | Signification |
|-------|--------|--------------|
| Retention individuelle | >= 75% des productions suivantes | L'etudiant consolide |
| Consolidation durable (groupe) | >= 75% | Vert fonce |
| Consolidation fragile (groupe) | 65-74% | Vert pale |
| Non consolide | < 65% | Rouge |

### Point de consolidation

Premier artefact ou >= 75% du groupe retient la maitrise sur ce critere.
Affiche dans la ligne de synthese du tableau Labo > Suivi.

---

## 9. Module interventions

### Structure de donnees

```javascript
{
  id, date, heure, duree,
  type: 'groupe' | 'individuel' | 'mio',
  niveauRai: 2 | 3,
  titre, description, contexte,
  seanceConcernee, marquerNonParticipantsMotives,
  etudiants: [DAs],
  analyse: { defisCommuns, patternsCommuns, progressions,
             niveauxRai, engagementMoyen, engagementDistribution },
  observations, notesIndividuelles,
  statut: 'planifiee' | 'en-cours' | 'completee',
  // Champs ajoutes (refonte avril 2026)
  criteresCibles: [],         // Criteres de la grille cibles par l'intervention
  objectifVise: '',           // Objectif mesurable (texte libre avec suggestion)
  snapshotAvant: {},          // { DA: { P, criteres: { nom: score } } }
  bilan: {                    // Rempli a la completion
    atteint: 'oui' | 'partiellement' | 'non',
    suite: 'reconduire' | 'ajuster' | 'referer' | 'aucune',
    observationsBilan: '',
    dateBilan: timestamp
  },
  jamaisSauvegardee: false,   // Flag pour nettoyage des interventions orphelines
  dateCreation, dateModification
}
```

### Workflow unifie (apres refonte)

```
Profil etudiant > Accompagnement > «+ Nouvelle intervention»
    → Creation en memoire avec valeurs par defaut
    → Ouverture immediate de la vue complete
        Section 1 : Logistique (titre, niveau RaI, contexte, date, statut, absences)
        Section 2 : Apercu sous-groupe + etudiants avec checkboxes et notes
        Section 3 : Criteres cibles + Objectif (pre-remplis par le depistage)
        Section 4 : Observations generales
        Section 5 : Bilan (visible a la completion — comparaison avant/apres)
    → Sauvegarde unique
```

### Fonctions principales

| Fonction | Role | Lignes |
|----------|------|--------|
| `afficherFormulaireIntervention(da)` | Point d'entree — cree l'intervention et ouvre la vue | 657+ |
| `ouvrirIntervention(id, options)` | Vue complete unifiee (creation et edition) | 697+ |
| `sauvegarderPresencesIntervention(id)` | Sauvegarde unifiee (infos + presences + criteres + objectif) | 1258+ |
| `analyserSousGroupe(dasEtudiants)` | Analyse des defis communs du sous-groupe | 185+ |
| `afficherAnalyseTempsReel(id)` | Apercu du sous-groupe en temps reel | 1054+ |
| `mettreAJourCriteresCibles(id)` | Mise a jour des criteres cibles quand la selection change | 1084+ |
| `suggererObjectifIntervention(id)` | Suggestion automatique d'objectif mesurable | 1143+ |
| `transfererPresencesVersModule(id)` | Transfert des presences vers le module presences | 1390+ |

### Retrocompatibilite

Les interventions existantes n'ont pas les nouveaux champs. Des valeurs par
defaut sont ajoutees dans `obtenirIntervention()` :
```javascript
if (!intervention.criteresCibles) intervention.criteresCibles = [];
if (!intervention.objectifVise) intervention.objectifVise = '';
if (!intervention.bilan) intervention.bilan = null;
if (!intervention.snapshotAvant) intervention.snapshotAvant = {};
```

### Nettoyage des interventions orphelines

Si une intervention est creee mais que l'enseignant navigue ailleurs sans
sauvegarder, le flag `jamaisSauvegardee: true` reste. Un guard dans
`afficherListeInterventions()` purge ces interventions au prochain affichage.

---

## 10. Flux complet : de la grille a l'intervention

```
1. CONFIGURATION
   Enseignant definit sa grille → criteres avec niveauSOLO
   Enseignant configure les seuils de depistage

2. EVALUATION
   Chaque artefact evalue → scores par critere stockes

3. DEPISTAGE AUTOMATIQUE
   calculerIPB(da) → nombre d'artefacts consecutifs sous le seuil (multistructurels)
   diagnostiquerSuiviApprentissage(da) → croise IPB x direction
   identifierPatternActuel() → pattern d'apprentissage
   determinerNiveauRaiPedagogique(da) → niveau RaI (1/2/3)

4. AIDE A LA DECISION (profil > Accompagnement)
   Carte RaI : niveau, P, moyennes par critere + directions, pattern, defi
   Carte Contexte : A, C, contexte favorable/fragile/defavorable
   Carte SOLO : defis classes par niveau taxonomique
   Consolidation individuelle : acquis durables vs fragiles
   → L'enseignant voit tout au meme endroit et decide d'intervenir

5. PLANIFICATION (formulaire unifie)
   Logistique (titre, niveau RaI, contexte, date, duree, statut)
   Selection des etudiants → apercu du sous-groupe
   Criteres cibles pre-remplis depuis les defis communs
   Objectif vise suggere depuis les trajectoires
   Snapshot des indices capture a la premiere sauvegarde

6. PENDANT L'INTERVENTION
   Notes individuelles et observations
   Gestion des presences

7. BILAN (a la completion)
   Comparaison automatique avant/apres sur les criteres cibles
   Objectif atteint ? → Oui / Partiellement / Non
   Suite → Reconduire / Ajuster / Referer / Aucune
   → Le cycle recommence (teach-test-revise-test de Fuchs)
```

---

## Exports globaux necessaires

Les fonctions suivantes doivent etre accessibles sur `window.*` pour le
fonctionnement cross-modules :

| Fonction | Module source | Consommateurs |
|----------|--------------|---------------|
| `calculerConsolidationIndividuelle` | consolidation.js | profil-etudiant.js (Accompagnement) |
| `calculerDirectionsCriteres` | profil-etudiant.js | profil-etudiant.js (Accompagnement), snapshots.js |
| `calculerMoyennesCriteres` | profil-etudiant.js | interventions.js (criteres cibles, snapshot) |
| `obtenirGrilleReferenceDepistage` | profil-etudiant.js | interventions.js (criteres cibles) |
| `calculerTousLesIndices` | profil-etudiant.js | interventions.js (snapshot) |

---

## References

- **Skill pedagogique** : `.claude/skills/depistage-rai/SKILL.md`
- **Plan de refonte** : `plans de travail/PLAN-REFONTE-MODULE-INTERVENTIONS.md`
- **Spec consolidation** : `SPEC-CONSOLIDATION-APPRENTISSAGES.md`
- **Desrochers (2021)** : L'approche de la reponse a l'intervention
- **Fuchs, Fuchs & Malone (2017)** : Taxonomy of Intervention Intensity
