# Plan de Tests Beta 95 : Multi-Cours, Multi-Groupes, Multi-Trimestres

**Date de création** : 24 décembre 2025
**Statut** : En cours
**Trimestre de test** : H2026

---

## Objectif

Valider le fonctionnement complet de la Beta 95 avec :
- 4 pratiques d'évaluation différentes
- 4 groupes fictifs distincts
- 4 cours dans des disciplines variées
- Isolation complète des données entre trimestres (A2025 archivé vs H2026 actif)

---

## Structure des données de test

### Vue d'ensemble

| Groupe | Discipline | Pratique | Code cours | Étudiants | DA |
|--------|------------|----------|------------|-----------|-----|
| **98** | Littérature | `pan-maitrise` | 601-101-MQ | litt-01 à litt-10 | 9800001-9800010 |
| **97** | Philosophie | `pan-maitrise` | 340-101-MQ | philo-01 à philo-10 | 9700001-9700010 |
| **96** | Chimie | `pan-specifications` | 202-NYA-05 | chim-01 à chim-10 | 9600001-9600010 |
| **95** | Biologie | `sommative` | 101-NYA-05 | bio-01 à bio-10 | 9500001-9500010 |

**Total** : 40 étudiants fictifs répartis en 4 groupes

---

## Détail des cours

### Cours 1 : Littérature (Groupe 98)

| Propriété | Valeur |
|-----------|--------|
| **Code** | 601-101-MQ |
| **Titre** | Écriture et littérature |
| **Pratique** | `pan-maitrise` (PAN-Standard) |
| **Groupe** | 00098 |
| **Trimestre** | H2026 |
| **Horaire** | 2x2h (4h/sem) |
| **Référence** | Cartographie Marie-Hélène L. |

**Étudiants** :
```
DA        Nom         Prénom
9800001   Test-98     litt-01
9800002   Test-98     litt-02
9800003   Test-98     litt-03
9800004   Test-98     litt-04
9800005   Test-98     litt-05
9800006   Test-98     litt-06
9800007   Test-98     litt-07
9800008   Test-98     litt-08
9800009   Test-98     litt-09
9800010   Test-98     litt-10
```

---

### Cours 2 : Philosophie (Groupe 97)

| Propriété | Valeur |
|-----------|--------|
| **Code** | 340-101-MQ |
| **Titre** | Philosophie et rationalité |
| **Pratique** | `pan-maitrise` (PAN-Standard) |
| **Groupe** | 00097 |
| **Trimestre** | H2026 |
| **Horaire** | 3x1h (3h/sem) |
| **Référence** | Cartographie Hélène C. |

**Étudiants** :
```
DA        Nom         Prénom
9700001   Test-97     philo-01
9700002   Test-97     philo-02
9700003   Test-97     philo-03
9700004   Test-97     philo-04
9700005   Test-97     philo-05
9700006   Test-97     philo-06
9700007   Test-97     philo-07
9700008   Test-97     philo-08
9700009   Test-97     philo-09
9700010   Test-97     philo-10
```

---

### Cours 3 : Chimie (Groupe 96)

| Propriété | Valeur |
|-----------|--------|
| **Code** | 202-NYA-05 |
| **Titre** | Chimie générale |
| **Pratique** | `pan-specifications` (PAN-Spécifications) |
| **Groupe** | 00096 |
| **Trimestre** | H2026 |
| **Horaire** | 2x2h30 (5h/sem) |
| **Référence** | Cartographie François A.-H. |

**Étudiants** :
```
DA        Nom         Prénom
9600001   Test-96     chim-01
9600002   Test-96     chim-02
9600003   Test-96     chim-03
9600004   Test-96     chim-04
9600005   Test-96     chim-05
9600006   Test-96     chim-06
9600007   Test-96     chim-07
9600008   Test-96     chim-08
9600009   Test-96     chim-09
9600010   Test-96     chim-10
```

---

### Cours 4 : Biologie (Groupe 95)

| Propriété | Valeur |
|-----------|--------|
| **Code** | 101-NYA-05 |
| **Titre** | Biologie générale |
| **Pratique** | `sommative` (Sommative traditionnelle) |
| **Groupe** | 00095 |
| **Trimestre** | H2026 |
| **Horaire** | 2x2h (4h/sem) |
| **Référence** | Cartographie Isabelle M. |

**Étudiants** :
```
DA        Nom         Prénom
9500001   Test-95     bio-01
9500002   Test-95     bio-02
9500003   Test-95     bio-03
9500004   Test-95     bio-04
9500005   Test-95     bio-05
9500006   Test-95     bio-06
9500007   Test-95     bio-07
9500008   Test-95     bio-08
9500009   Test-95     bio-09
9500010   Test-95     bio-10
```

---

## Scénarios de test à valider

### 1. Isolation des trimestres
- [ ] A2025 archivé affiche 30 étudiants (groupe 00001)
- [ ] H2026 actif affiche les 4 groupes de test (40 étudiants)
- [ ] Changer de trimestre ne contamine pas les données
- [ ] Le mode lecture seule fonctionne pour A2025

### 2. Multi-cours
- [ ] Dropdown cours affiche les 4 cours H2026
- [ ] Sélectionner un cours filtre les étudiants correctement
- [ ] Chaque cours a sa propre pratique d'évaluation

### 3. Multi-groupes
- [ ] Filtre par groupe fonctionne
- [ ] Statistiques par groupe correctes
- [ ] Un même cours pourrait avoir plusieurs groupes (futur)

### 4. Pratiques d'évaluation
- [ ] `pan-maitrise` : Indices A-C-P calculés correctement
- [ ] `pan-specifications` : Pass/fail sur objectifs
- [ ] `sommative` : Moyenne pondérée

### 5. Fonctionnalités transversales
- [ ] Saisie des présences par cours
- [ ] Évaluation des productions
- [ ] Profil étudiant complet
- [ ] Tableau de bord avec filtres

---

## Scripts de génération

### Script 1 : Créer les 3 nouveaux cours

```javascript
// À exécuter dans la console après avoir activé H2026
const coursH2026 = db.getSync('listeCours') || [];
const coursExistantId = 'COURS1766455789356'; // Cours Littérature existant

// Cours Philosophie
coursH2026.push({
    id: 'COURS-PHILO-H2026',
    sigle: '340-101-MQ',
    titre: 'Philosophie et rationalité',
    session: 'H',
    annee: '2026',
    trimestreId: 'h2026',
    groupe: '00097',
    pratiqueId: 'pan-maitrise',
    formatHoraire: '3x1h',
    actif: true
});

// Cours Chimie
coursH2026.push({
    id: 'COURS-CHIMIE-H2026',
    sigle: '202-NYA-05',
    titre: 'Chimie générale',
    session: 'H',
    annee: '2026',
    trimestreId: 'h2026',
    groupe: '00096',
    pratiqueId: 'pan-specifications',
    formatHoraire: '2x2h30',
    actif: true
});

// Cours Biologie
coursH2026.push({
    id: 'COURS-BIO-H2026',
    sigle: '101-NYA-05',
    titre: 'Biologie générale',
    session: 'H',
    annee: '2026',
    trimestreId: 'h2026',
    groupe: '00095',
    pratiqueId: 'sommative',
    formatHoraire: '2x2h',
    actif: true
});

db.setSync('listeCours', coursH2026);
console.log('✅ 3 cours créés pour H2026');
```

### Script 2 : Créer les 30 nouveaux étudiants

```javascript
// À exécuter après le Script 1
const etudiants = db.getSync('groupeEtudiants') || [];

const nouveauxEtudiants = [
    // Groupe 97 - Philosophie (10 étudiants)
    ...Array.from({length: 10}, (_, i) => ({
        da: `970000${i + 1}`,
        nom: 'Test-97',
        prenom: `philo-0${i + 1}`,
        groupe: '00097',
        coursId: 'COURS-PHILO-H2026',
        programme: '300.A1',
        statut: 'actif'
    })),

    // Groupe 96 - Chimie (10 étudiants)
    ...Array.from({length: 10}, (_, i) => ({
        da: `960000${i + 1}`,
        nom: 'Test-96',
        prenom: `chim-0${i + 1}`,
        groupe: '00096',
        coursId: 'COURS-CHIMIE-H2026',
        programme: '200.B1',
        statut: 'actif'
    })),

    // Groupe 95 - Biologie (10 étudiants)
    ...Array.from({length: 10}, (_, i) => ({
        da: `950000${i + 1}`,
        nom: 'Test-95',
        prenom: `bio-0${i + 1}`,
        groupe: '00095',
        coursId: 'COURS-BIO-H2026',
        programme: '200.B1',
        statut: 'actif'
    }))
];

etudiants.push(...nouveauxEtudiants);
db.setSync('groupeEtudiants', etudiants);
console.log(`✅ ${nouveauxEtudiants.length} étudiants créés`);
```

### Script 3 : Mettre à jour le groupe 98 existant

```javascript
// Mettre à jour le coursId du groupe 98 pour pointer vers le bon cours
const etudiants = db.getSync('groupeEtudiants');
const coursLitt = db.getSync('listeCours').find(c => c.sigle === '601-101-MQ' && c.trimestreId === 'h2026');

if (coursLitt) {
    etudiants.forEach(e => {
        if (e.groupe === '00098') {
            e.coursId = coursLitt.id;
        }
    });
    db.setSync('groupeEtudiants', etudiants);
    console.log('✅ Groupe 98 mis à jour');
}
```

---

## Vérification finale

```javascript
// Script de vérification
const etudiants = db.getSync('groupeEtudiants');
const cours = db.getSync('listeCours').filter(c => c.trimestreId === 'h2026');

console.log('=== VÉRIFICATION H2026 ===');
console.log('Cours H2026:', cours.length);
cours.forEach(c => {
    const nb = etudiants.filter(e => e.coursId === c.id).length;
    console.log(`  - ${c.sigle} (${c.groupe}): ${nb} étudiants, pratique: ${c.pratiqueId}`);
});
console.log('Total étudiants H2026:', etudiants.filter(e =>
    cours.some(c => c.id === e.coursId)
).length);
```

---

## Notes importantes

### Convention de nommage
- **DA** : `GG0000N` où GG = numéro de groupe, N = numéro étudiant
- **Nom** : `Test-GG` (permet identification rapide)
- **Prénom** : `discipline-0N` (discipline + numéro)

### Groupes réservés
- **99** : Groupe démo système (NE PAS UTILISER)
- **98-95** : Groupes de test Beta 95
- **01** : Groupe réel A2025 (archivé)

### Pratiques testées
| ID | Nom | Fichier |
|----|-----|---------|
| `pan-maitrise` | PAN-Standard (IDME) | `pratique-pan-maitrise.js` |
| `pan-specifications` | PAN-Spécifications | `pratique-pan-specifications.js` |
| `sommative` | Sommative traditionnelle | `pratique-sommative.js` |

---

## Historique

| Date | Action | Résultat |
|------|--------|----------|
| 2025-12-24 | Création du plan | Document créé |
| 2025-12-24 | Archivage A2025 | 30 étudiants protégés |
| 2025-12-24 | Transfert groupe 98 vers H2026 | 10 étudiants |
| | Création cours Philo/Chimie/Bio | À faire |
| | Création 30 étudiants (97, 96, 95) | À faire |
| | Tests fonctionnels | À faire |

---

*Document de référence pour les tests Beta 95 - À maintenir à jour*
