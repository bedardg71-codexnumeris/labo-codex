# Implémentation des tooltips — Navigation principale et secondaire

**Scope** : Tous les boutons de la navigation principale (8) et de la sous-navigation contextuelle (26) = 34 clés
**Prérequis** : Le moteur `tooltips.js` et le CSS `tooltips.css` doivent être en place (voir plan principal).
**Action** : Ajouter les clés dans `tooltips-contenu.js` et les attributs `data-tooltip` dans le HTML.

**⚠️ Consigne pour Claude Code — Clés obsolètes à retirer** :
Ce plan remplace 6 clés génériques par 34 clés individuelles. Lors de l'implémentation, **retirer** les 6 clés suivantes de `tooltips-contenu.js` et de tout attribut `data-tooltip` associé dans le HTML :
- `entete-nav-principale` et `entete-sous-nav` (définies dans Plan_Implementation_Tooltips.md, section En-tête — Zone 4)
- `reglages-sous-nav` (définie dans Plan_Implementation_Tooltips.md, section Réglages — Sous-navigation)
- `pref-sous-nav` (définie dans Tooltips_Reglages_Preferences.md, 1re clé du bloc)
- `depist-sous-nav` (définie dans Tooltips_Reglages_Depistage.md, 1re clé du bloc)
- `donnees-sous-nav` (définie dans Tooltips_Reglages_Donnees.md, 1re clé du bloc)

La clé `entete-reglages` est **conservée** — elle couvre l'icône ⚙️ et n'est pas dupliquée ici.

---

## Clés à ajouter dans tooltips-contenu.js

```javascript
    // =================================================================
    // NAVIGATION PRINCIPALE — Onglets principaux
    // =================================================================

    'nav-accueil':
        'Retour à la page d\'accueil du système.',

    'nav-tableau-bord':
        'Vue d\'ensemble du groupe : indices A-C-E-P, patterns d\'apprentissage, niveaux RàI et profils individuels.',

    'nav-presences':
        'Suivi de l\'assiduité : statistiques de présence, calendrier des séances et saisie des présences.',

    'nav-evaluations':
        'Évaluation des productions : grilles critériées, niveaux IDME et rétroaction différenciée automatique.',

    'nav-construction':
        'Configuration de l\'évaluation : productions, grilles, échelles, cartouches et pratiques de notation.',

    'nav-boite-outils':
        'Utilitaires complémentaires pour l\'enseignement.',

    'nav-planification':
        'Planification pédagogique : alignement objectifs-activités-évaluations et organisation des leçons.',

    'nav-aide':
        'Documentation, tutoriels et ressources d\'aide.',

    // =================================================================
    // SOUS-NAVIGATION — Tableau de bord
    // =================================================================

    'nav-tdb-apercu':
        'Observer les indices A-C-E-P, les patterns, les niveaux RàI et le développement du groupe via des graphiques.',

    'nav-tdb-liste':
        'Tableau complet des étudiants avec indices, patterns et niveaux RàI. Filtrable et triable par colonne.',

    'nav-tdb-profil':
        'Fiche individuelle d\'un étudiant : productions, engagement, progression, habiletés, accompagnement et rapport.',

    'nav-tdb-interventions':
        'Planifier et documenter les interventions RàI de niveaux 2 (préventif) et 3 (intensif).',

    // =================================================================
    // SOUS-NAVIGATION — Présences
    // =================================================================

    'nav-pres-apercu':
        'Statistiques synthétiques : taux d\'assiduité moyen, séances données, prochaine séance et effectif.',

    'nav-pres-calendrier':
        'Calendrier du trimestre : grilles mensuelles, jours de cours, congés et reprises.',

    'nav-pres-saisie':
        'Saisir les présences et absences pour chaque séance du groupe.',

    // =================================================================
    // SOUS-NAVIGATION — Évaluations
    // =================================================================

    'nav-eval-apercu':
        'Statistiques synthétiques : taux de complétion moyen, productions réalisées et configurées.',

    'nav-eval-liste':
        'Tableau exhaustif des évaluations : résultats, niveaux IDME, jetons et dossiers PDF.',

    'nav-eval-evaluer':
        'Interface d\'évaluation critériée avec grille, échelle, cartouche, jetons et rétroaction automatique.',

    'nav-eval-annoter':
        'Annoter les travaux soumis par les étudiants.',

    'nav-eval-archivage':
        'Archiver les évaluations et les données du trimestre.',

    // =================================================================
    // SOUS-NAVIGATION — Construction de la note
    // =================================================================

    'nav-cn-apercu':
        'Décompte des ressources configurées : productions, grilles, échelles, pratiques et cartouches.',

    'nav-cn-productions':
        'Définir les productions étudiantes : portfolio, artefacts et travaux avec pondérations et échéances.',

    'nav-cn-grilles':
        'Créer des grilles réutilisables avec critères nommés, typés et pondérés.',

    'nav-cn-echelles':
        'Configurer les échelles IDME : seuils, valeurs ponctuelles, couleurs et aperçu visuel.',

    'nav-cn-cartouches':
        'Créer des matrices de commentaires automatiques (critères × niveaux) pour la rétroaction différenciée.',

    'nav-cn-pratiques':
        'Assembler une pratique complète (SOM, STD, SPE, DEN) en associant échelle, structure et jetons.',

    // =================================================================
    // SOUS-NAVIGATION — Boîte à outils
    // =================================================================

    'nav-bao-tirage':
        'Tirage au sort aléatoire dans le groupe d\'étudiants.',

    // =================================================================
    // SOUS-NAVIGATION — Planification
    // =================================================================

    'nav-planif-alignement':
        'Carte mentale interactive : visualiser l\'alignement objectifs → activités → évaluations.',

    'nav-planif-organisateur':
        'Calendrier des séquences sur 15 semaines et plans de leçons avec enseignement explicite en 5 étapes.',

    // =================================================================
    // SOUS-NAVIGATION — Réglages
    // =================================================================

    'nav-reg-trimestre':
        'Configuration du trimestre, du cours, de l\'enseignant, du groupe d\'étudiants, de l\'horaire et du groupe-cours.',

    'nav-reg-preferences':
        'Personnaliser l\'interface : outils actifs, ressources affichées, effets visuels et comportement de navigation.',

    'nav-reg-depistage':
        'Configurer les seuils de détection des patterns et d\'interprétation des indices A-C-P.',

    'nav-reg-donnees':
        'Sauvegarde, restauration, snapshots A-C-P-E, export anonymisé, réinitialisation et maintenance.',

    'nav-reg-apropos':
        'Notes de version du système.',
```

---

## Cartographie HTML — où placer les data-tooltip

### Navigation principale

| Clé | Élément cible |
|-----|---------------|
| `nav-accueil` | Icône 🏠 (bouton ou lien à gauche de la barre de navigation) |
| `nav-tableau-bord` | Onglet « Tableau de bord » |
| `nav-presences` | Onglet « Présences » |
| `nav-evaluations` | Onglet « Évaluations » |
| `nav-construction` | Onglet « Construction de la note » |
| `nav-boite-outils` | Onglet « Boîte à outils » |
| `nav-planification` | Onglet « Planification » |
| `nav-aide` | Onglet « Aide » |

**Note** : L'icône ⚙️ (Réglages) est déjà couverte par la clé existante `entete-reglages`. Ne pas la dupliquer.

### Sous-navigation — Tableau de bord

| Clé | Élément cible |
|-----|---------------|
| `nav-tdb-apercu` | Sous-onglet « Aperçu » |
| `nav-tdb-liste` | Sous-onglet « Liste des individus » |
| `nav-tdb-profil` | Sous-onglet « Profil » |
| `nav-tdb-interventions` | Sous-onglet « Interventions RàI » |

### Sous-navigation — Présences

| Clé | Élément cible |
|-----|---------------|
| `nav-pres-apercu` | Sous-onglet « Aperçu » |
| `nav-pres-calendrier` | Sous-onglet « Vue calendaire » |
| `nav-pres-saisie` | Sous-onglet « Saisie » |

### Sous-navigation — Évaluations

| Clé | Élément cible |
|-----|---------------|
| `nav-eval-apercu` | Sous-onglet « Aperçu » |
| `nav-eval-liste` | Sous-onglet « Liste des évaluations » |
| `nav-eval-evaluer` | Sous-onglet « Évaluer une production » |
| `nav-eval-annoter` | Sous-onglet « Annoter des travaux » |
| `nav-eval-archivage` | Sous-onglet « Archivage » |

### Sous-navigation — Construction de la note

| Clé | Élément cible |
|-----|---------------|
| `nav-cn-apercu` | Sous-onglet « Aperçu » |
| `nav-cn-productions` | Sous-onglet « Productions étudiantes » ◆ |
| `nav-cn-grilles` | Sous-onglet « Grilles de critères » ◆ |
| `nav-cn-echelles` | Sous-onglet « Échelles de performance » ◆ |
| `nav-cn-cartouches` | Sous-onglet « Cartouches de rétroaction » ◆ |
| `nav-cn-pratiques` | Sous-onglet « Pratiques de notation » ◆ |

### Sous-navigation — Boîte à outils

| Clé | Élément cible |
|-----|---------------|
| `nav-bao-tirage` | Sous-onglet « Tirage au sort » |

### Sous-navigation — Planification

| Clé | Élément cible |
|-----|---------------|
| `nav-planif-alignement` | Sous-onglet « Alignement pédagogique » ◆ |
| `nav-planif-organisateur` | Sous-onglet « Organisateur » ◆ |

### Sous-navigation — Réglages

| Clé | Élément cible |
|-----|---------------|
| `nav-reg-trimestre` | Sous-onglet « Trimestre » |
| `nav-reg-preferences` | Sous-onglet « Préférences » |
| `nav-reg-depistage` | Sous-onglet « Dépistage » |
| `nav-reg-donnees` | Sous-onglet « Données » |
| `nav-reg-apropos` | Sous-onglet « À propos » |

---

## Règles de placement

### Navigation principale
- Placer `data-tooltip` directement sur chaque élément cliquable (`<button>`, `<a>` ou `<li>`) de la barre de navigation principale.
- Ne pas placer de `data-tooltip` sur le conteneur `<nav>` ou `<ul>` englobant — chaque bouton a son propre tooltip.
- Le curseur `help` ne doit pas remplacer le curseur `pointer` sur les onglets de navigation. **Ajouter une exception CSS** :

```css
nav [data-tooltip],
.sous-navigation [data-tooltip] {
    cursor: pointer;
}
```

### Sous-navigation contextuelle
- Placer `data-tooltip` sur chaque bouton/onglet individuel de la sous-navigation.
- La sous-navigation est générée dynamiquement selon le module actif. Les attributs `data-tooltip` doivent être ajoutés **dans le code JS qui génère les sous-onglets**, pas en HTML statique.
- Les losanges (◆) présents sur certains sous-onglets (Construction de la note, Planification) font partie du texte du bouton et ne reçoivent pas de traitement tooltip spécifique.

### Masquage au clic
- Les tooltips de navigation doivent se masquer **instantanément** au clic sur l'onglet (pas d'attente du délai de disparition), pour éviter que le tooltip persiste pendant le changement de vue.
- Le moteur `tooltips.js` gère déjà ce cas via le `mouseleave`, mais si le changement de module est assez rapide pour que le tooltip reste affiché, ajouter un `masquer()` explicite dans le gestionnaire de clic de la navigation.

---

## Clés remplacées

Ce plan remplace 6 clés existantes dans d'autres fichiers de plans. Claude Code doit **retirer** ces 6 anciennes clés de `tooltips-contenu.js` et les remplacer par les 34 clés `nav-*` ci-dessus.

| Ancienne clé | Fichier source | Remplacée par |
|-------------|----------------|---------------|
| `entete-nav-principale` | Plan_Implementation_Tooltips.md | 8 clés `nav-*` individuelles (principale) |
| `entete-sous-nav` | Plan_Implementation_Tooltips.md | 26 clés `nav-*-*` individuelles (sous-nav) |
| `reglages-sous-nav` | Plan_Implementation_Tooltips.md | `nav-reg-trimestre` à `nav-reg-apropos` |
| `pref-sous-nav` | Tooltips_Reglages_Preferences.md | `nav-reg-preferences` |
| `depist-sous-nav` | Tooltips_Reglages_Depistage.md | `nav-reg-depistage` |
| `donnees-sous-nav` | Tooltips_Reglages_Donnees.md | `nav-reg-donnees` |

**Note** : la clé `entete-reglages` (Plan_Implementation_Tooltips.md) est **conservée** telle quelle — elle couvre l'icône ⚙️ dans la barre principale, ce qui est son rôle précis.

---

## Inventaire

| Zone | Clés |
|------|------|
| Navigation principale | 8 |
| Sous-nav Tableau de bord | 4 |
| Sous-nav Présences | 3 |
| Sous-nav Évaluations | 5 |
| Sous-nav Construction de la note | 6 |
| Sous-nav Boîte à outils | 1 |
| Sous-nav Planification | 2 |
| Sous-nav Réglages | 5 |
| **Total** | **34** |
| Clés remplacées (à retirer) | -6 |
| **Variation nette** | **+28** |

---

## Vérification

- [ ] 34 tooltips apparaissent au survol des boutons de navigation
- [ ] 8 tooltips sur la navigation principale (🏠 + 7 onglets textuels)
- [ ] L'icône ⚙️ conserve son tooltip existant (`entete-reglages`)
- [ ] 26 tooltips sur les sous-onglets (4+3+5+6+1+2+5)
- [ ] Les 6 anciennes clés (`entete-nav-principale`, `entete-sous-nav`, `reglages-sous-nav`, `pref-sous-nav`, `depist-sous-nav`, `donnees-sous-nav`) sont retirées
- [ ] Le clic sur un onglet masque le tooltip immédiatement
- [ ] Le changement de module met à jour les sous-onglets avec les bons `data-tooltip`
- [ ] Le curseur reste `pointer` sur les éléments de navigation (pas `help`)
- [ ] Les losanges (◆) sur certains sous-onglets sont affichés normalement
- [ ] La sous-navigation de l'Aide fonctionne si/quand elle sera implémentée
