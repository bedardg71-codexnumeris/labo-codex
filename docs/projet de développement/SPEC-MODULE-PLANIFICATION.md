# Module Planification - Enseignement Explicite

> **Statut** : Brouillon - En cours de reflexion
> **Date** : 23 janvier 2026
> **Backlog** : #34

---

## 1. Le probleme a resoudre

### Constat actuel
L'application Monitorage aide a **suivre** l'apprentissage (presences, evaluations, indices).
Mais elle n'aide pas a **planifier** l'enseignement en amont.

### Besoin identifie
Un enseignant qui adopte l'enseignement explicite doit :
- Decouper sa matiere en lecons progressives (simple → complexe)
- Planifier les 5 phases de chaque lecon (ouverture, modelage, pratique guidee, pratique autonome, cloture)
- Repartir les lecons sur le calendrier du trimestre
- Prevoir les revisions espacees pour la memorisation
- Placer les evaluations au bon moment

**Public cible** : Enseignants novices qui decouvrent l'enseignement explicite.

**Concepteur** : Gregoire Bedard (5-6 ans de pratique, formation universitaire TELUQ en enseignement efficace).

L'outil doit donc :
- Guider pas a pas (le novice ne sait pas par ou commencer)
- Enseigner la methode en meme temps qu'il aide a planifier
- Eviter le jargon ou l'expliquer
- Proposer des exemples concrets

---

## 2. Vision du module

### Primo comme wizard de planification

L'idee : Primo guide l'enseignant etape par etape pour construire son plan de cours.

**Flux envisage** (a valider) :

```
Etape 1 : Definir les objectifs du cours
    → Quels sont les grands objectifs d'apprentissage du trimestre ?

Etape 2 : Decouper en lecons
    → Chaque objectif se decompose en combien de lecons ?
    → Ordre logique (prerequis → notion → application)

Etape 3 : Planifier chaque lecon
    → Pour chaque lecon : objectif, prerequis, duree estimee
    → Structure : ouverture / modelage / pratique guidee / pratique autonome / cloture

Etape 4 : Placer sur le calendrier
    → Associer les lecons aux seances du trimestre
    → Visualiser la progression

Etape 5 : Placer les evaluations
    → Quand evaluer ? (formatif, sommatif)
    → Lier aux productions existantes
```

**Questions a clarifier** :
- [ ] Primo pose des questions simples ou on propose un formulaire plus structure ?
- [ ] Niveau de detail souhaite pour chaque lecon ?
- [ ] Import possible depuis un plan de cours existant ?

---

## 3. Structure d'une lecon

Basee sur le livret de l'Academie de Paris :

### Les 5 phases

| Phase | Duree type | Ce que fait l'enseignant | Ce que font les eleves |
|-------|------------|--------------------------|------------------------|
| **Ouverture** | 5 min | Capte attention, presente objectif, reactive prerequis | Ecoute active |
| **Modelage** | 10 min | Montre en verbalisant sa pensee ("je fais") | Observe |
| **Pratique guidee** | 15 min | Guide, questionne, verifie comprehension ("nous faisons") | Pratique avec aide |
| **Pratique autonome** | 15 min | Supervise, donne retroaction ("vous faites") | Pratique seul |
| **Cloture** | 5 min | Synthetise, annonce suite, donne travail | Consolide |

### Donnees a stocker pour une lecon

```javascript
{
  id: "LECON_xxx",
  titre: "Introduction aux fractions",
  objectif: "L'eleve sera capable de...",
  prerequis: ["notion A", "notion B"],
  dureeEstimee: 50, // minutes
  phases: {
    ouverture: { duree: 5, notes: "..." },
    modelage: { duree: 10, notes: "..." },
    pratiqueGuidee: { duree: 15, notes: "..." },
    pratiqueAutonome: { duree: 15, notes: "..." },
    cloture: { duree: 5, notes: "..." }
  },
  materiel: ["document X", "exercice Y"],
  evaluationPrevue: null, // ou lien vers une production
  seanceAssociee: "2026-02-03" // date dans le calendrier
}
```

**Questions a clarifier** :
- [ ] Ce niveau de detail est-il utile ou trop lourd ?
- [ ] Faut-il des templates de lecons pre-remplis ?
- [ ] Lien avec les "productions" actuelles : une production = une evaluation de fin de sequence ?

---

## 4. Integration avec l'existant

### Liens naturels

| Module actuel | Lien avec la planification |
|---------------|---------------------------|
| **Calendrier** | Visualiser les lecons planifiees sur les seances |
| **Productions** | Une production = evaluation sommative d'une sequence |
| **Objectifs d'apprentissage** | Les objectifs des lecons alimentent les grilles |
| **Presences** | Suivi : la lecon prevue a-t-elle eu lieu ? |

### Nouvelles entites a creer

- **Sequence** : groupe de lecons vers un objectif commun
- **Lecon** : unite d'enseignement (1 seance = 1 ou plusieurs lecons)
- **Plan de cours** : ensemble des sequences du trimestre

---

## 5. Questions ouvertes

### Sur le besoin
1. Est-ce que tu utilises deja un outil pour planifier tes cours ? (Word, Excel, papier ?)
2. Quel est le plus gros irritant actuel dans la planification ?
3. A quel moment de l'annee fait-on cette planification ? (avant le trimestre ? au fil de l'eau ?)

### Sur l'interface
4. Wizard Primo (questions guidees) ou formulaire libre ?
5. Vue calendrier (Gantt) ou vue liste ?
6. Export du plan de cours en PDF ?

### Sur le niveau de detail
7. Planifier au niveau de la sequence suffit, ou faut-il descendre a chaque lecon ?
8. Les notes sur chaque phase (modelage, pratique guidee...) sont-elles utiles ou superflues ?

---

## 6. Prochaines etapes

1. [ ] Repondre aux questions ouvertes (discussion)
2. [ ] Esquisser les ecrans principaux (maquettes papier ou description)
3. [ ] Valider le modele de donnees
4. [ ] Identifier les modifications aux modules existants
5. [ ] Planifier le developpement (Beta 96 ? 97 ?)

---

**Notes de session** :
- 23 jan 2026 : Creation du document, premiere reflexion avec Gregoire
