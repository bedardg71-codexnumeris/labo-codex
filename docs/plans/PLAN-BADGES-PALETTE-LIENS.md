# Plan — Badges de validation, palette pédagogique et verbes de liens

> Document autonome destiné à Claude Code.
> Contexte : module Planification pédagogique (carte mentale + Organisateur).
> Ce plan ne remplace pas les documents existants ; il décrit des améliorations ciblées.

---

## 1. Catégories pédagogiques dans la palette

La palette d'éléments est réorganisée en trois catégories pédagogiques plus une catégorie de structure. Les sous-titres explicites aident l'enseignant à comprendre le rôle de chaque famille d'éléments.

```
POURQUOI enseigner          (intention curriculaire)
  ● Compétence
  ● Idée maîtresse

QUOI enseigner              (contenu de la leçon)
  ● Information
  ● Stratégie
  ● Condition

COMMENT enseigner           (mise en action)
  ● Apprentissage
  ● Soutien
  ● Révision

STRUCTURE                   (organisation)
  ⬡ Séquence
  ⬡ Leçon
```

### Règles d'affichage

- Le titre de catégorie (POURQUOI, QUOI, COMMENT, STRUCTURE) est affiché en petites capitales au-dessus de chaque groupe, avec le sous-titre explicite en gris italique en dessous.
- Les pastilles de couleur restent identiques à celles déjà en place pour chaque type.
- Le mot « CONTENEURS » actuel est remplacé par « STRUCTURE ». Ce terme reste provisoire et pourra être changé plus tard.

---

## 2. Couleur du nom de l'élément

Sur chaque carte dans la carte mentale, le **nom de l'élément** (le libellé de type affiché au-dessus du titre, par exemple « INFORMATION PRÉALABLE », « STRATÉGIE », « APPRENTISSAGE ») prend la même couleur que le contour de la carte.

Concrètement :
- Le label de type en haut de la carte utilise `color: <couleur-du-contour>` au lieu du gris actuel.
- Le titre saisi par l'enseignant reste en noir (ou en couleur foncée pour le contraste).
- Cela permet d'identifier visuellement la famille d'un élément sans chercher la pastille dans la palette.

---

## 3. Badges de validation (alignement pédagogique)

### Principe

Chaque carte affiche un petit badge circulaire (coin supérieur droit). Ce badge indique si l'élément est correctement relié dans la carte selon les règles d'alignement pédagogique.

- **Badge gris** (⚪) : il manque un lien attendu — l'élément est isolé ou incomplet.
- **Badge coloré** (●, couleur de l'élément) : tous les liens attendus sont présents — l'alignement est bon.

### Règles de validation par type

| Type | Condition pour badge coloré | Message au survol si gris |
|---|---|---|
| Compétence | Au moins une Idée maîtresse la développe | « Aucune idée maîtresse ne développe cette compétence » |
| Idée maîtresse | (1) Au moins une Leçon la vise (lien entrant « vise ») ET (2) elle est reliée à au moins une Compétence (lien sortant « développe ») | « Cette idée n'est visée par aucune leçon » ou « Cette idée ne développe aucune compétence » |
| Information | Se trouve à l'intérieur d'une Leçon (conteneur) | « Cette information n'est associée à aucune leçon » |
| Stratégie | Se trouve à l'intérieur d'une Leçon (conteneur) | « Cette stratégie n'est associée à aucune leçon » |
| Condition | Se trouve à l'intérieur d'une Leçon (conteneur) | « Cette condition n'est associée à aucune leçon » |
| Apprentissage | Se trouve à l'intérieur d'une Leçon ET au moins une Connaissance (Information, Stratégie ou Condition) existe dans la même leçon | « Cette activité n'a pas de connaissance associée » |
| Soutien | Se trouve à l'intérieur d'une Leçon ET au moins une Connaissance existe dans la même leçon | « Cette activité n'a pas de connaissance associée » |
| Révision | Se trouve à l'intérieur d'une Leçon ET au moins une Connaissance existe dans la même leçon | « Cette activité n'a pas de connaissance associée » |
| Séquence | Contient au moins une Leçon | « Cette séquence ne contient aucune leçon » |
| Leçon | Au moins une Idée maîtresse est visée (lien) ET contient au moins une Connaissance ET contient au moins une Activité | Trois messages possibles selon ce qui manque |

### Implémentation

```
function evaluerBadge(noeud) {
  // Retourne { valide: boolean, message: string }
  // Appelée à chaque modification de la carte : ajout/suppression de noeud,
  // ajout/suppression de lien, déplacement d'un noeud dans/hors d'un conteneur.

  const type = noeud.type;
  const conteneur = trouverConteneurParent(noeud.id);
  const liensEntrants = etat.liens.filter(l => l.noeudCible === noeud.id);
  const liensSortants = etat.liens.filter(l => l.noeudSource === noeud.id);

  switch (type) {
    case 'competence':
      // Au moins un lien entrant de type 'developpe' depuis une idée maîtresse
      const devParIM = liensEntrants.some(l => l.verbe === 'developpe');
      return devParIM
        ? { valide: true }
        : { valide: false, message: 'Aucune idée maîtresse ne développe cette compétence' };

    case 'idee-maitresse':
      // Lien sortant 'developpe' vers une compétence
      const devComp = liensSortants.some(l => l.verbe === 'developpe');
      // Lien entrant 'vise' depuis une leçon
      const viseeParLecon = liensEntrants.some(l => l.verbe === 'vise');
      if (!devComp) return { valide: false, message: "Cette idée ne développe aucune compétence" };
      if (!viseeParLecon) return { valide: false, message: "Cette idée n'est visée par aucune leçon" };
      return { valide: true };

    case 'information':
    case 'strategie':
    case 'condition':
      // Doit être dans un conteneur de type 'lecon'
      const labelType = { information: 'information', strategie: 'stratégie', condition: 'condition' }[type];
      if (!conteneur || conteneur.type !== 'lecon')
        return { valide: false, message: `Cette ${labelType} n'est associée à aucune leçon` };
      return { valide: true };

    case 'apprentissage':
    case 'soutien':
    case 'revision':
      if (!conteneur || conteneur.type !== 'lecon')
        return { valide: false, message: "N'est associé(e) à aucune leçon" };
      // Vérifier qu'il existe au moins une connaissance dans la même leçon
      const connaissancesDansLecon = etat.noeuds.values()
        .filter(n => ['information','strategie','condition'].includes(n.type))
        .filter(n => trouverConteneurParent(n.id)?.id === conteneur.id);
      if (connaissancesDansLecon.length === 0)
        return { valide: false, message: "Aucune connaissance dans cette leçon" };
      return { valide: true };

    case 'sequence':
      const contientLecon = etat.noeuds.values()
        .some(n => n.type === 'lecon' && trouverConteneurParent(n.id)?.id === noeud.id);
      return contientLecon
        ? { valide: true }
        : { valide: false, message: "Cette séquence ne contient aucune leçon" };

    case 'lecon':
      const messages = [];
      // Lien sortant 'vise' vers au moins une idée maîtresse
      const viseIM = liensSortants.some(l => l.verbe === 'vise');
      if (!viseIM) messages.push("Aucun objectif (aucune idée maîtresse visée)");
      // Contient au moins une connaissance
      const connaissances = etat.noeuds.values()
        .filter(n => ['information','strategie','condition'].includes(n.type))
        .filter(n => trouverConteneurParent(n.id)?.id === noeud.id);
      if (connaissances.length === 0) messages.push("Aucune connaissance dans la leçon");
      // Contient au moins une activité
      const activites = etat.noeuds.values()
        .filter(n => ['apprentissage','soutien','revision'].includes(n.type))
        .filter(n => trouverConteneurParent(n.id)?.id === noeud.id);
      if (activites.length === 0) messages.push("Aucune activité dans la leçon");
      return messages.length === 0
        ? { valide: true }
        : { valide: false, message: messages.join(' · ') };
  }
}
```

### Rendu visuel du badge

```
function rendreBadge(noeud, resultat) {
  const badge = noeud.elementDOM.querySelector('.badge-validation')
    || creerElementBadge(noeud);

  if (resultat.valide) {
    badge.style.backgroundColor = COULEURS[noeud.type]; // couleur du type
    badge.title = 'Alignement complet';
  } else {
    badge.style.backgroundColor = '#ccc'; // gris
    badge.title = resultat.message;
  }
}

// Badge : cercle de 10px, position absolute, top: 4px, right: 4px
// Transition douce entre gris et couleur (transition: background-color 0.3s)
```

---

## 4. Verbes de liens simplifiés

Les verbes actuels (« soutenu par », « vise ») sont remplacés par des verbes plus lisibles. Le verbe est déterminé automatiquement par le couple (type source → type cible).

### Table des verbes

| Source | Cible | Verbe affiché | Direction de lecture |
|---|---|---|---|
| Idée maîtresse | Compétence | **développe** | « L'idée maîtresse *développe* la compétence » |
| Leçon | Idée maîtresse | **vise** | « La leçon *vise* l'idée maîtresse » |
| Activité (tout type) | Connaissance (tout type) | **mobilise** | « L'activité *mobilise* la connaissance » |
| Connaissance | Connaissance | **requiert** | « Cette connaissance *requiert* cette autre connaissance » |
| Idée maîtresse | Idée maîtresse | **s'appuie sur** | « Cette idée maîtresse *s'appuie sur* cette autre idée » |

### Règles

1. Quand l'enseignant tire un lien entre deux nœuds, le verbe est attribué automatiquement selon la table ci-dessus.
2. Si le couple (source, cible) n'est pas dans la table, le lien est refusé (pas de lien arbitraire).
3. Le verbe s'affiche au milieu de la flèche, en italique, taille réduite (0.75em), couleur gris moyen.
4. La flèche pointe de la source vers la cible (direction de lecture naturelle).
5. Si l'enseignant tire un lien dans le sens inverse d'un couple valide (par exemple, de Compétence vers Idée maîtresse), le système inverse automatiquement la direction et applique le bon verbe.

### Liens invalides (exemples)

Ces combinaisons ne produisent pas de lien :

- Compétence → Leçon (il manque l'intermédiaire Idée maîtresse)
- Activité → Activité (pas de relation pédagogique directe)
- Séquence → Compétence (la séquence est structurelle, pas curriculaire)

Un message discret apparaît si l'enseignant tente un lien invalide : « Ce lien n'est pas possible. Essayez de relier [type source] à [types cibles valides]. »

---

## 5. Objectifs multiples dans l'Organisateur

### Comportement actuel (à corriger)

La dérivation d'objectif prend la première Idée maîtresse trouvée via un lien « vise ». Si la leçon vise plusieurs idées maîtresses, une seule apparaît.

### Nouveau comportement

```
function deriverObjectifs(leconId) {
  const seanceData = chargerSeance(leconId);

  // Si l'enseignant a personnalisé l'objectif, le conserver
  if (seanceData?.objectifPersonnalise) {
    return seanceData.objectifPersonnalise; // texte libre
  }

  // Sinon, dériver de TOUS les liens 'vise' vers des idées maîtresses
  const ideesVisees = etat.liens
    .filter(l => l.noeudSource === leconId && l.verbe === 'vise')
    .map(l => etat.noeuds.get(l.noeudCible))
    .filter(n => n?.type === 'idee-maitresse');

  if (ideesVisees.length === 0) {
    return null; // Pas d'objectif — le badge sera gris
  }

  return ideesVisees.map(im => im.titre.toLowerCase());
}
```

### Affichage dans le panneau Organisateur

```
OBJECTIF DE LA LEÇON
Au terme de la leçon, l'élève sera capable :
  — d'adopter une posture analytique ;
  — d'appliquer différentes stratégies de lecture.
```

Règles d'affichage :
- Si un seul objectif : « Au terme de la leçon, l'élève sera capable de [objectif]. »
- Si plusieurs objectifs : « Au terme de la leçon, l'élève sera capable : » suivi d'une liste avec tirets cadratins.
- Le préfixe « de » ou « d' » est ajouté automatiquement selon la première lettre (voyelle → d', consonne → de).
- Un bouton crayon (✏️) à côté permet de passer en mode édition libre. Un bouton réinitialiser (↺) restaure la dérivation automatique.

---

## 6. Résumé des fichiers à modifier

| Fichier | Modification |
|---|---|
| Palette (HTML/JS) | Renommer les catégories, ajouter les sous-titres POURQUOI/QUOI/COMMENT/STRUCTURE |
| Carte — rendu des nœuds | Couleur du label de type = couleur du contour ; ajout du badge |
| Carte — gestion des liens | Table de verbes automatiques, validation des couples, inversion auto |
| Carte — validation | Nouvelle fonction `evaluerBadge()` appelée à chaque mutation de la carte |
| Organisateur — objectif | `deriverObjectifs()` parcourt tous les liens « vise », gère le pluriel |
| CSS | Styles pour badges (taille, position, transition), labels de type colorés |
