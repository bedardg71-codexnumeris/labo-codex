# Plan : Organisateur — Refonte layout deux colonnes

> **Statut** : En attente (bugs a resoudre d'abord)
> **Date** : 10 fevrier 2026
> **Prerequis** : Organisateur fonctionnel (implemente le 10 fev 2026)

---

## Probleme

L'Organisateur actuel empile tout verticalement :
selecteurs, en-tete calendrier, objectif, prerequis, productions,
enseignement explicite (5 etapes avec textareas + zones de depot), vue calendrier.

Resultat : trop de scroll vertical, perte de contexte lors de la navigation.

---

## Solution proposee : layout deux colonnes

```
┌─────────────────────────────────────────────────────────┐
│  Selecteurs : [Sequence v]  [Lecon v]       [Exporter]  │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│   COLONNE GAUCHE (~55%)  │   PANNEAU DROIT (~45%)       │
│   Vue d'ensemble         │   Detail contextuel          │
│                          │                              │
│   En-tete calendrier     │   Change selon le clic :     │
│   Objectif (editable)    │   - Detail d'une activite    │
│   Prerequis              │   - Etapes EE (5 etapes)     │
│   Productions associees  │   - Vue calendrier           │
│   Liste des activites    │   - Options d'export         │
│   (vue compacte)         │                              │
│                          │                              │
├──────────────────────────┴──────────────────────────────┤
│  (responsive : empile sur < 900px)                      │
└─────────────────────────────────────────────────────────┘
```

---

## Colonne gauche — Vue d'ensemble de la lecon

Contenu toujours visible quand une lecon est selectionnee :

1. **En-tete calendrier** — date, heure, local (derive automatiquement)
2. **Objectif** — auto-derive ou personnalise (contenteditable)
3. **Prerequis** — derives des liens de la carte (lecture seule)
4. **Productions associees** — nom, ponderation, echeance
5. **Liste compacte des activites** — pastille couleur + titre + type + duree
   - Chaque activite est cliquable → ouvre le detail dans le panneau droit
   - Si EE est coche, les activites affichent leur etape assignee (badge)

La colonne gauche sert de "table des matieres" cliquable.

---

## Panneau droit — Detail contextuel

Le panneau droit affiche un seul "mode" a la fois :

### Mode 1 : Detail d'une activite
- Retroaction (select)
- Production associee (select)
- Details de la production (grille, echelle, echeance)
- Declencheur : clic sur une activite dans la colonne gauche

### Mode 2 : Enseignement explicite
- Checkbox principal EE
- 5 etapes en accordeon (ouverture, modelisation, pratique guidee, pratique autonome, cloture)
- Chaque etape : checkbox actif/inactif, textarea notes, zone de depot activites
- Liste des activites non assignees (en haut)
- Declencheur : clic sur le bouton "Enseignement explicite" ou checkbox EE

### Mode 3 : Vue calendrier
- Vue semaines (reuse genererSeancesHTML)
- Clic sur une lecon → la selectionne dans la colonne gauche
- Declencheur : clic sur "Vue calendrier"

### Mode 4 : Export (optionnel — peut rester en modale)
- Audience (eleve/enseignant) x Format (TXT/MD)
- Declencheur : bouton Exporter

### Etat par defaut
- Si EE est coche : afficher le mode Enseignement explicite
- Sinon : afficher la vue calendrier
- Si aucune lecon selectionnee : message d'accueil

---

## Navigation dans le panneau droit

Barre de boutons en haut du panneau droit (onglets internes) :

```
[ Activite ]  [ Ens. explicite ]  [ Calendrier ]
```

- Le bouton actif est mis en surbrillance
- Cliquer sur une activite dans la gauche bascule automatiquement sur "Activite"
- Le panneau droit conserve son etat (scroll, contenu) quand on switch

---

## Responsive (< 900px)

- Les deux colonnes s'empilent verticalement
- Le panneau droit devient un accordeon sous la colonne gauche
- Ou : le panneau droit se transforme en bottom sheet glissant
- Priorite basse — la majorite des utilisateurs sont sur desktop/laptop

---

## Fichiers a modifier

| Fichier | Action | Ampleur |
|---------|--------|---------|
| `js/organisateur.js` | Refactorer en 2 colonnes, gestion modes panneau | Majeure |
| `index.html` | Restructurer HTML de `planification-organisateur` | Moyenne |
| `styles.css` | Nouveau layout flexbox/grid, media queries | Moyenne |

Les fichiers `config.js`, `navigation.js`, `planification.js`, `planification-carte.js`
ne sont PAS touches (infrastructure deja en place).

---

## Etapes d'implementation

1. **HTML** : Restructurer la sous-section en 2 colonnes (`org-gauche` + `org-droite`)
2. **CSS** : Layout grid/flex, panneau droit sticky, media query < 900px
3. **JS** : Systeme de modes pour le panneau droit (activite, ee, calendrier)
4. **JS** : Clic sur activite → bascule mode dans le panneau droit
5. **JS** : Etat par defaut intelligent (EE si coche, calendrier sinon)
6. **Test** : Verifier que les donnees sont conservees, drag-drop fonctionne, exports ok

---

## Points de decision (a confirmer avec Gregoire)

- [ ] Proportions exactes des colonnes (55/45 ? 60/40 ?)
- [ ] Le panneau droit doit-il etre sticky (fixe au scroll) ou scroller avec la page ?
- [ ] Le mode "Activite" : afficher une seule activite ou toutes avec un accordeon ?
- [ ] Responsive : empilage simple ou bottom sheet ?
- [ ] L'export reste en modale ou migre dans le panneau droit ?
