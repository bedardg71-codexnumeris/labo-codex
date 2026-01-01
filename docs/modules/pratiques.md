# Module Pratiques de Notation

**Fichiers principaux** : `js/pratiques/`
**Version** : Beta 95
**Derniere mise a jour** : 1er janvier 2026

---

## Objectif

Supporter plusieurs pratiques de notation sans modifier le coeur de l'application.

---

## Architecture modulaire

### Principe

Toute nouvelle pratique DOIT implementer l'interface `IPratique`.
JAMAIS coder en dur des calculs specifiques dans le module principal.

### Structure des fichiers

```
js/pratiques/
    pratique-interface.js        # Documentation du contrat IPratique
    pratique-registre.js         # Registre central (detection auto)
    pratique-pan-maitrise.js     # PAN-Maitrise (IDME + SRPNF)
    pratique-sommative.js        # Sommative traditionnelle
    pratique-pan-standards.js    # PAN-Standards (objectifs/artefacts)
```

---

## Interface IPratique

Chaque pratique doit implementer :

```javascript
interface IPratique {
    // Identification
    id: string;
    nom: string;
    description: string;

    // Calculs obligatoires
    calculerPerformance(da: string): number;     // 0-1
    calculerCompletion(da: string): number;      // 0-1

    // Diagnostic
    identifierPattern(da: string): string;
    calculerNiveauRai(da: string): number;       // 1, 2 ou 3
    determinerCibleIntervention(da: string): object;

    // Affichage
    obtenirDonneesProfil(da: string): object;
}
```

---

## Pratiques implementees

### PAN-Maitrise (Gregoire Bedard)
- **Echelle** : IDME (Insuffisant, Developpement, Maitrise, Etendu)
- **Criteres** : SRPNF (Structure, Rigueur, Plausibilite, Nuance, Francais)
- **Calcul P** : Moyenne des N meilleurs artefacts
- **Fichier** : `pratique-pan-maitrise.js`

### Sommative
- **Calcul P** : Moyenne ponderee de toutes les evaluations
- **Defis** : Detection generique (< 65%)
- **Fichier** : `pratique-sommative.js`

### PAN-Standards
- **Variantes** : Par objectifs ou par artefacts
- **4 modes de calcul** :
  1. Comptage (nb objectifs maitrises)
  2. Moyenne ponderee
  3. Seuils critiques (Xavier C.-T.)
  4. Holistique (jugement professionnel)
- **Fichier** : `pratique-pan-standards.js`

---

## Configuration

La pratique active est stockee dans :

```javascript
modalitesEvaluation: {
    pratique: 'pan-maitrise',  // ou 'sommative', 'pan-standards'
    // ... autres parametres
}
```

---

## Ajouter une nouvelle pratique

1. Creer `js/pratiques/pratique-[nom].js`
2. Implementer l'interface `IPratique`
3. Enregistrer dans `pratique-registre.js`
4. Ajouter option dans le wizard Primo

Voir `GUIDE_AJOUT_PRATIQUE.md` pour guide detaille.

---

## Systeme universel (Beta 93+)

Le systeme est 100% universel :
- Criteres lus dynamiquement depuis la grille de reference
- Detection forces/defis pour n'importe quels criteres
- Recommandations RaI configurables avec fallback generique
