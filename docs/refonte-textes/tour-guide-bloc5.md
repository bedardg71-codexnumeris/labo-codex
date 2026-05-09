# Bloc 5 — Tour guidé (scénario, textes, specs techniques)

**Statut** : Validé (19 avril 2026)  
**Charte de référence** : `plans de travail/PLAN-REFONTE-TEXTES-ACCOMPAGNEMENT.md`, section 1  
**Approche retenue** : C — Parcours guidé par étapes (hybride)

---

## Principes

- **Parcours en 6 étapes** suivant la progression naturelle (Numérisation → Croisement → Observation → Compétence)
- **Jamais bloquant** : l'utilisateur peut quitter, sauter une étape, y revenir
- **Contextuel** : chaque étape se déclenche quand l'utilisateur arrive dans la section concernée
- **Coexistence** : le toggle «Mode assistance» (icônes 📍) reste indépendant du parcours
- **Panneau flottant** : pas une modale bloquante — positionné en bas ou sur le côté

---

## Scénario

| Étape | Déclencheur | Section | Objectif |
|-------|-------------|---------|----------|
| 0 | Premier lancement | Accueil | Présenter Labo Codex et orienter vers Réglages |
| 1 | Entrée dans Réglages | Réglages | Configurer trimestre, cours, groupe, horaire |
| 2 | Entrée dans Structure | Structure | Créer productions, grilles, échelles, cartouche, pratique |
| 3 | Première évaluation | Évaluations | Comprendre le flux évaluation → rétroaction |
| 4 | Première visite TdB | Tableau de bord | Lire les indices A-C-P, repérer les signaux |
| 5 | Visite Planification | Planification | Découvrir la carte mentale (optionnel, étape avancée) |

---

## Textes

### Étape 0 — Accueil

Labo Codex numérise le travail que tu fais déjà. Ce parcours te guide à travers les étapes essentielles. Tu peux le quitter à tout moment et y revenir depuis les Préférences. Commence par configurer ton espace de travail dans Réglages.

`[Aller aux Réglages]` · `[Explorer seul·e]`

### Étape 1 — Réglages

C'est ici que tu poses les fondations : ton trimestre (dates, congés), ton cours (compétence, éléments), ton groupe d'étudiant·es et ton horaire. Ce sont les mêmes informations que dans ton plan de cours. Tu les saisis une fois et l'application génère automatiquement le calendrier de tes séances.

Les icônes 📍 t'en disent plus sur chaque section. Quand ton groupe-cours est assemblé, tu es prêt·e pour la suite.

`[J'ai compris]` · `[Passer cette étape]`

### Étape 2 — Structure

Tu construis ici tes outils d'évaluation — les mêmes que sur papier, mais réutilisables. Les productions définissent les occasions d'apprentissage de tes étudiant·es. Les grilles fixent tes critères. Les échelles établissent les niveaux de performance. Les cartouches préparent la rétroaction. La pratique assemble le tout.

L'ordre n'est pas imposé, mais les productions et les grilles sont un bon point de départ.

`[J'ai compris]` · `[Passer cette étape]`

### Étape 3 — Évaluations

C'est le geste quotidien : tu sélectionnes une production, tu attribues un niveau à chaque critère et la rétroaction se construit au fur et à mesure. Tu peux importer les copies de tes étudiant·es (PDF ou images), les annoter avec des tampons / estampes ou des codes, puis les évaluer — tout sur le même document.

Les jetons (Délai, Reprise, Reprise ciblée) offrent à l'étudiant·e une nouvelle occasion de démontrer sa compétence.

`[J'ai compris]` · `[Passer cette étape]`

### Étape 4 — Tableau de bord

Le tableau de bord te montre ce que tu ne verrais pas facilement sur papier : le portrait de ton groupe en un coup d'œil. Les indices Assiduité (A), Complétion (C) et Performance (P) résument le contexte d'apprentissage observé de chaque étudiant·e. Les zones de couleur t'aident à repérer qui a besoin d'attention.

Explore les quatre vues : aperçu, liste, profil individuel et interventions RàI.

`[J'ai compris]` · `[Passer cette étape]`

### Étape 5 — Planification *(optionnelle)*

La carte mentale rend visible l'alignement pédagogique de ton cours : ce que tu vises, comment tu l'enseignes et comment tu le vérifies. L'organisateur structure tes leçons sur les 15 semaines du trimestre. Ce module est complémentaire. Tu peux l'explorer quand tu te sens à l'aise avec les autres sections.

`[Terminer le parcours]` · `[Relancer plus tard]`

---

## Specs techniques

### Stockage

| Clé localStorage | Type | Description |
|------------------|------|-------------|
| `tourGuide_etape` | number | Numéro de l'étape courante (0-5), `null` si non démarré |
| `tourGuide_complete` | boolean | `true` quand le parcours est terminé ou quitté volontairement |
| `tourGuide_etapes_vues` | array | Liste des étapes déjà affichées (évite les répétitions) |

### Déclenchement

- Vérifier `tourGuide_etape` à chaque changement de vue dans `navigation.js`
- Si l'étape courante correspond à la section affichée et n'a pas encore été vue → afficher le panneau
- Si l'utilisateur clique «Explorer seul·e» ou «Passer» → marquer l'étape comme vue, ne pas avancer automatiquement
- Si l'utilisateur clique «J'ai compris» → marquer l'étape comme vue, incrémenter `tourGuide_etape`

### Composant UI

- **Type** : panneau flottant non bloquant (pas de backdrop sombre)
- **Position** : bas de l'écran ou côté droit, selon la largeur disponible
- **Contenu** : titre de l'étape, texte, boutons d'action
- **Animation** : apparition douce (fadeIn), disparition au clic
- **Responsive** : pleine largeur sur iPad, panneau latéral sur desktop
- **Z-index** : au-dessus du contenu mais en dessous des modales existantes

### Coexistence avec le Mode assistance

- Le toggle «Mode assistance» (icônes 📍) reste dans les Préférences
- Les deux systèmes sont indépendants : le parcours guidé affiche des panneaux contextuels, le mode assistance affiche les icônes 📍
- Recommandation UX : activer automatiquement le mode assistance quand le parcours guidé est en cours

### Relance

- Case à cocher dans Préférences : «Relancer le parcours guidé»
- Remet `tourGuide_etape` à 0, vide `tourGuide_etapes_vues`, met `tourGuide_complete` à `false`
