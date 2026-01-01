# Module Etudiants et Groupes

**Fichier principal** : `js/groupe.js`, `js/etudiants.js`
**Version** : Beta 95
**Derniere mise a jour** : 1er janvier 2026

---

## Objectif

Gerer les etudiants et leur association aux cours-groupes.

---

## Structure d'un etudiant

```javascript
{
    da: "2234567",              // Numero d'admission (unique)
    prenom: "Emilie",
    nom: "Tremblay",
    groupe: "01",               // Numero de groupe
    coursId: "601-101-h2026-01", // Lien vers cours-groupe
    codeProgramme: "300.A0",    // Programme d'etudes
    servicesAdaptes: false,     // Flag SA
    statut: "actif"             // actif, inactif, archive
}
```

---

## coursId obligatoire (Beta 93.5+)

**Regle** : Tous les etudiants DOIVENT avoir un `coursId`.

**Filtrage automatique** : `modes.js` filtre automatiquement par coursId du cours actif.

```javascript
// Dans modes.js - obtenirDonneesSelonMode()
const clesAvecCoursId = ['groupeEtudiants', 'productions', 'presences', 'evaluationsSauvegardees'];
if (clesAvecCoursId.includes(cle) && Array.isArray(donnees)) {
    const coursActif = db.getSync('infoCours', null);
    if (coursActif && coursActif.id) {
        donnees = donnees.filter(item => item.coursId === coursActif.id);
    }
}
```

---

## Import depuis fichier .txt

Format supporte :
```
2234567    Tremblay, Emilie    300.A0    SA
2234568    Gagnon, Marc        200.B1
```

Colonnes separees par tabulation :
1. Numero DA
2. Nom, Prenom
3. Code programme (optionnel)
4. SA si services adaptes (optionnel)

---

## API principale

```javascript
// Ajout
addStudent(etudiant)           // Ajoute un etudiant

// Import
parseAndPreview(texte)         // Parse fichier .txt et preview
confirmerImport(etudiants)     // Confirme l'import

// Lecture
obtenirEtudiants()             // Retourne tous les etudiants du cours actif
obtenirEtudiantParDA(da)       // Retourne un etudiant specifique
```

---

## Stockage

**Cle** : `groupeEtudiants`
**Type** : Tableau d'objets etudiant
**Filtrage** : Automatique par coursId

---

## Validation

- DA unique (pas de doublons)
- Prenom et nom requis
- coursId ajoute automatiquement a la creation
