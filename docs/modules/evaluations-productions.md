# Module Evaluations et Productions

**Fichiers principaux** : `js/productions.js`, `js/evaluation.js`
**Version** : Beta 95
**Derniere mise a jour** : 1er janvier 2026

> ⚠ **DOCUMENT PÉRIMÉ** (bandeau du 11 oct. 2026, #471 ; écarts mesurés par l'audit du 20 août, constat CO-30).
> Faux au moins sur : le champ `nom` d'une production (le code écrit `titre` et `activiteApprentissage`) ;
> `grillesTemplates` dite globale (namespacée par trimestre depuis #358) ; les types de production
> (manquent `terminale`, `portfolio`, `laboratoire`…) ; des champs non documentés (`echelleId`, `cartoucheId`,
> `echeancesParGroupe`, `metadata_cc`…). **Fait foi** : le code, et `docs/DATA-OWNERSHIP.md` pour les clés.

---

## Objectif

Gerer les productions (artefacts) et leur evaluation.

---

## Structure d'une production

```javascript
{
    id: "PROD_ART1",
    nom: "Artefact 1 - Description",
    type: "artefact-portfolio",      // ou examen, travail, etc.
    dateEcheance: "2026-02-15",
    ponderation: 15,                 // en %
    grilleId: "GRILLE_DEMO",         // lien vers grille d'evaluation
    coursId: "601-101-h2026-01",     // lien vers cours
    verrouille: false
}
```

---

## Types de productions

### Sommatives
- `examen` : Examen en classe
- `travail` : Travail ecrit
- `presentation` : Presentation orale
- `quiz` : Quiz ou test

### Formatives
- `examen-formatif`
- `travail-formatif`
- `quiz-formatif`

### Portfolio (PAN)
- `artefact-portfolio` : Artefact pour portfolio

---

## Structure d'une evaluation

```javascript
{
    etudiantDA: "2234567",
    productionId: "PROD_ART1",
    coursId: "601-101-h2026-01",
    grilleId: "GRILLE_DEMO",
    cartoucheId: "CART_DEMO",
    criteres: {
        structure: { niveau: "M", commentaire: "..." },
        rigueur: { niveau: "D", commentaire: "..." }
    },
    noteFinale: 75,
    niveauFinal: "M",
    statutRemise: "remis",           // remis, non-remis, retard
    dateSauvegarde: "2026-01-15T10:00:00"
}
```

---

## Echelle IDME

| Code | Nom | Score % |
|------|-----|---------|
| I | Insuffisant | < 64% |
| D | Developpement | 65-74% |
| M | Maitrise | 75-84% |
| E | Etendu | >= 85% |

Niveau special :
- `0` : Aucun/Nul (plagiat, IA non autorisee)

---

## Criteres SRPNF

| Critere | Ponderation | Description |
|---------|-------------|-------------|
| Structure | 15% | Organisation logique des idees |
| Rigueur | 20% | Exhaustivite des observations |
| Plausibilite | 10% | Credibilite de l'interpretation |
| Nuance | 25% | Qualite du raisonnement |
| Francais | 30% | Maitrise linguistique |

---

## statutRemise (Single Source of Truth)

**Regle** : `statutRemise` est LA source de verite pour savoir si un travail est remis.

```javascript
// Priorite 1 : Verifier statutRemise D'ABORD
if (statutRemise === 'non-remis' || statutRemise === 'retard') {
    affichage = 'Non remis';
} else if (statut === 'evalue') {
    affichage = note;
}
```

---

## Grilles de criteres

Stockage : `grillesTemplates` (cle globale)

```javascript
{
    id: "GRILLE_SRPNF",
    nom: "Grille SRPNF",
    criteres: [
        { id: "CR_STRUCTURE", nom: "Structure", ponderation: 15 },
        { id: "CR_RIGUEUR", nom: "Rigueur", ponderation: 20 }
        // ...
    ]
}
```

---

## Cartouches de retroaction

Stockage : `cartouches_{grilleId}` (cle globale)

Commentaires predéfinis par critere et niveau.

---

## API principale

```javascript
// Productions
afficherTableauProductions()
sauvegarderProduction(production)

// Evaluations
chargerEvaluation(da, productionId)
sauvegarderEvaluation(evaluation)
chargerProductionsDansSelect()        // Utilise obtenirDonneesSelonMode()
```
