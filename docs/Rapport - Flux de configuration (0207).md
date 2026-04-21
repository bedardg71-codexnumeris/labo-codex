# Rapport d'audit : Flux de configuration et guidage utilisateur

> **OBSOLETE depuis Beta 99.21 (21 avril 2026)** — Les modules primo-* et
> parcours-apprentissage decrits ici ont ete retires lors de la consolidation
> onboarding. Document conserve comme archive historique. Pour l'etat actuel,
> voir SESSION.md et docs/00-START-HERE.md.

> Audit du 7 fevrier 2026 — Pour discussion Cowork
> Contexte : Le Mode Assiste et Primo ont ete desactives (Chantiers 1-4, Beta 97.2). Quel guidage reste-t-il pour un nouvel utilisateur ?

---

## 1. Etat des lieux

### Ce qui a ete retire (Chantiers 1-4)

| Element | Statut | Lignes de code |
|---------|--------|----------------|
| Mode Assiste (mode d'affichage) | Desactive — `estModeAssiste()` retourne toujours `false` | modes.js:773 |
| Pastille Primo dans l'en-tete | Supprimee (HTML + CSS + JS) | — |
| Modal « Premiers pas » | Supprime (HTML + JS) | — |
| Bouton Primo dans l'en-tete (cercle pulsant) | Supprime (HTML + JS) | — |
| Boutons d'aide contextuelle (22 emplacements) | Masques — conditionnes a `estModeAssiste()` | primo-tooltips.js:111 |
| Guide visuel 4 etapes dans Trimestre | Supprime dans une refonte anterieure | — |
| Selecteur de mode Normal/Assiste | Remplace par Normal/Anonymisation | modes.js |

### Ce qui reste en place (code actif mais inaccessible)

| Element | Fichier | Lignes |
|---------|---------|--------|
| `primo-accueil.js` — Detection premier lancement, 4 modules | js/primo-accueil.js | 480 |
| `primo-modal.js` — Moteur conversationnel, mode notification | js/primo-modal.js | ~2500 |
| `primo-questions.js` — Arbre de 70+ questions | js/primo-questions.js | 2060 |
| `primo-tooltips.js` — Systeme de boutons d'aide | js/primo-tooltips.js | 172 |
| `primo-validation-champs.js` — Validation visuelle | js/primo-validation-champs.js | 282 |
| `wizard-pratique-v2.js` — Wizard creation de pratique | js/wizard-pratique-v2.js | ~600 |
| `aide-contextuelle.js` — Affichage des popups d'aide | js/aide-contextuelle.js | ~200 |
| `aide-contextuelle-contenu.js` — 22+ contenus d'aide | js/aide-contextuelle-contenu.js | ~500 |
| **Total code dormant** | | **~6800 lignes** |

### Ce qui a ete ajoute en remplacement

| Element | Fichier | Description |
|---------|---------|-------------|
| Page d'accueil permanente | js/accueil.js (173 lignes) | 2 etats : premier lancement (2 cartes) / retour (4 cartes par intention) |
| Systeme de demo isole | js/donnees-demo.js | Route demo avec pack 20 etudiants, entree/sortie libre |
| Guidage contextuel demo | js/guidage-demo.js (102 lignes) | 16 encarts explicatifs dans chaque sous-section en mode demo |
| Bandeau demo | index.html | Barre verte fixe avec bouton « Quitter la demo » |
| Mode expert | Reglages > Preferences | Court-circuite l'accueil vers le tableau de bord |
| Section Aide visible | Navigation | Bouton Aide toujours accessible (plus conditionne au mode) |
| Notes de version | Reglages > A propos | Deplacees depuis Aide > Versions |

---

## 2. Le flux de travail complet

### Vue d'ensemble : du macro au micro

Le flux de configuration suit une logique d'alignement pedagogique descendante. Chaque niveau depend du precedent.

```
NIVEAU MACRO — Contexte institutionnel (Reglages > Trimestre)
    │
    ├─ 1. Trimestre ........... Session, annee, dates, calendrier 15 semaines
    ├─ 2. Cours ............... Code (601-101-MQ), titre, competence visee
    ├─ 3. Enseignant·e ........ Profil auteur (prenom, nom, courriel, institution)
    ├─ 4. Horaire ............. Seances hebdomadaires (jours, heures, local)
    └─ 5. Groupe-cours ........ ASSEMBLAGE : cours + enseignant + horaire + pratique
                                    │
                                    │ Le groupe-cours reference une pratique →
                                    ▼
NIVEAU MESO — Dispositif d'evaluation (Construction de la note)
    │
    │  FONDATION
    ├─ 6. Pratique de notation ... Philosophie (SOM, STD, SPE, DEN)
    │                              Definit : comment la note est construite
    │
    │  OUTILS (independants, ordre libre)
    ├─ 7. Echelle de performance . Niveaux (ex: I-D-M-E, A-B-C-D-E)
    │                              Definit : les seuils de maitrise
    ├─ 8. Grille de criteres ..... Criteres ponderes (total = 100%)
    │                              Definit : sur quoi on evalue
    │
    │  MATRICE (depend de 7 + 8)
    ├─ 9. Cartouches de retroaction . Grille × Echelle → textes par cellule
    │                                  Definit : quoi dire a l'etudiant
    │
    │  EPREUVES (depend de 8)
    └─ 10. Productions etudiantes ... Associe une grille, ponderation, echeance
                                      Definit : quoi evaluer
                                    │
                                    ▼
NIVEAU MICRO — Evaluation au quotidien (Evaluations)
    │
    ├─ 11. Annoter des travaux ... Import PDF/images, annotation stylet, tampons
    ├─ 12. Evaluer ............... Appliquer la grille, selectionner les niveaux
    ├─ 13. Generer la retroaction  Cartouches assemblees automatiquement
    └─ 14. Exporter le PDF ....... Pages annotees + page de synthese
```

### Chaine de dependances des donnees

```
pratiquesConfigurables (bibliotheque)
    ↓ referencee par
modalitesEvaluation (configuration active du cours)
    ↓ influence
echellesTemplates ←─┐
    ↓               │ chacun verifie la compatibilite avec la pratique
grillesTemplates ←──┘
    ↓ requises par
cartouchesTemplates (grille + echelle → matrice)
    ↓ requise par
{trimestre}_productions (associe une grille)
    ↓ utilisee par
Evaluations (note + retroaction)
```

### Cles de stockage

| Donnee | Cle | Namespace | Pattern |
|--------|-----|-----------|---------|
| Pratiques configurables | `pratiquesConfigurables` | Global | Bibliotheque |
| Pratique active | `modalitesEvaluation` | Global | Assemblage |
| Echelles | `echellesTemplates` | Global | Bibliotheque |
| Grilles | `grillesTemplates` | Global | Bibliotheque |
| Cartouches | `cartouchesTemplates` | Global | Bibliotheque |
| Productions | `{trimestre}_productions` | Par trimestre | Assemblage |
| Groupe-cours | `{trimestre}_groupesCours` | Par trimestre | Assemblage |
| Etudiants | `{trimestre}_groupeEtudiants` | Par trimestre | Donnees |
| Presences | `{trimestre}_presences` | Par trimestre | Donnees |

---

## 3. Ce que Primo faisait (et que plus rien ne fait)

### Les 4 modules de Primo

**MODULE 1 : Creer un groupe-cours** (3 min)
- Flux conversationnel (modal plein ecran avec avatar)
- Questions : nom, courriel → code cours, titre → session, annee, groupe → horaire → liste etudiants (coller depuis Omnivox)
- Resultat : entites cours, enseignant, horaire, groupe-cours creees et assemblees
- Acces : `demarrerConfigComplete()` → `ouvrirModalConversationnel()`

**MODULE 2 : Evaluer une production** (5 min)
- Mode notification (bulles flottantes non-bloquantes)
- Guide pas a pas : importer echelle → importer grille → creer production → evaluer un etudiant
- Resultat : echelle IDME + grille SRPNF importees, production creee, evaluation completee
- Acces : `demarrerEvaluation()` → `passerEnModeNotification()`

**MODULE 3 : Explorer les diagnostics** (desactive)
- Jamais implemente

**MODULE 4 : Creer ma pratique de notation** (8 min)
- Wizard par etapes (sidebar + formulaire)
- 8 etapes : infos de base → type → mode config → approche → calcul → reprises → criteres → seuils
- Resultat : pratique sauvee dans la bibliotheque
- Acces : `demarrerWizard()` → `ouvrirWizardV2()`

### Le flux conversationnel detaille (primo-questions.js)

L'arbre contient ~70 questions avec branchement conditionnel (`sautSi`). Voici les branches principales :

```
Enseignant existe ?
  ├─ Oui → Confirmer identite
  └─ Non → Nom, courriel, site web
      ↓
Cours existe ?
  ├─ Oui → Selectionner le cours
  └─ Non → Titre, code, discipline
      ↓
Session, annee, groupe
      ↓
Horaire (nombre de seances, jours, heures)
      ↓
Liste etudiants (coller un tableau)
      ↓
Pratique de notation ?
  ├─ Sommative → parametres sommative
  ├─ PAN-Standards → approche (objectifs/artefacts), mode calcul
  ├─ PAN-Specifications → seuil acceptabilite, jetons
  └─ PAN-Denotation → [desactive]
      ↓
Portfolio ?
  ├─ Oui → nombre artefacts, N meilleurs, ponderations
  └─ Non → ponderations simples
      ↓
FIN MODULE 1
```

### L'aide contextuelle (22 emplacements)

Chaque bouton affiche un popup avec :
- Titre de la section
- Texte explicatif (2-3 paragraphes)
- Conseils pratiques
- Liens « Voir aussi » vers d'autres sujets

Emplacements documentes :
- Tableau de bord (apercu, liste, profil, interventions)
- Presences (apercu, calendrier, saisie)
- Evaluations (apercu, liste, formulaire)
- Construction (productions, grilles, echelles, pratiques, retroactions)
- Reglages (cours, horaire, groupe)

---

## 4. Le probleme actuel pour un debutant

### Scenario : nouvel utilisateur, 7 fevrier 2026

1. Ouvre l'application → **Page d'accueil** (premier lancement)
2. Voit 2 cartes : « Creer mon premier cours » et « Explorer la demo »
3. Clique « Creer mon premier cours » → `ouvrirModalConversationnel()` → **Primo se lance !**
   - C'est le seul chemin qui active encore Primo (via accueil.js)
   - Le flux conversationnel fonctionne (Module 1)
   - Il cree le cours, le groupe-cours, l'horaire, les etudiants
4. Primo termine → l'utilisateur est devant le tableau de bord
5. **Et maintenant ?** Aucun guidage vers les etapes suivantes :
   - Ou configurer l'echelle ?
   - Ou creer la grille de criteres ?
   - Comment associer une production ?
   - Dans quel ordre ?
6. Le seul indice : un paragraphe dans Construction > Apercu (ligne 4846) :
   > « Commence par configurer la pratique de notation dans la section Reglages, puis cree tes grilles de criteres et ton echelle de performance. »
   - Ce texte est enfoui dans une sous-section que l'utilisateur n'a aucune raison de visiter
   - Il mentionne « Reglages » alors que les pratiques sont dans « Construction »

### Les ruptures dans le parcours

| Etape | Ce que l'utilisateur devrait faire | Ce que l'application montre |
|-------|-----------------------------------|-----------------------------|
| Apres creation du cours | Choisir une pratique de notation | Rien — tableau de bord vide |
| Apres choix de pratique | Creer ou importer une echelle | Rien — pas de lien vers Echelles |
| Apres creation d'echelle | Creer ou importer une grille | Rien — pas de lien vers Grilles |
| Apres creation de grille | Creer une production | Rien — pas de lien vers Productions |
| Apres creation de production | Evaluer un etudiant | Le bouton « Evaluer » existe mais ou est-il ? |

### Ce qui fonctionne deja pour les utilisateurs experimentes

- Le pattern Bibliotheque + Assemblage est solide
- Chaque sous-section a une sidebar navigable
- Les formulaires sont fonctionnels et validants
- L'import de materiel (echelle, grille, cartouches) fonctionne
- Le wizard V2 pour les pratiques existe et fonctionne

---

## 5. Inventaire du code Primo — Decision a prendre

### ~6800 lignes de code dormant

| Fichier | Lignes | Etat | Valeur |
|---------|--------|------|--------|
| primo-accueil.js | 480 | Partiellement actif (Module 1 via accueil) | Le flux conversationnel pour creer un cours fonctionne |
| primo-modal.js | ~2500 | Fonctionnel mais non declenche | Moteur generique reutilisable |
| primo-questions.js | 2060 | Fonctionnel | Arbre de questions bien structure |
| primo-tooltips.js | 172 | Masque (estModeAssiste = false) | Systeme d'aide reutilisable |
| primo-validation-champs.js | 282 | Fonctionnel | Validation visuelle reutilisable |
| wizard-pratique-v2.js | ~600 | Fonctionnel | Wizard autonome pour les pratiques |
| aide-contextuelle.js | ~200 | Masque | Systeme de popup reutilisable |
| aide-contextuelle-contenu.js | ~500 | Complet | 22+ contenus d'aide rediges |

### Options

**A. Retirer Primo completement**
- Supprimer les 6800 lignes
- Reconstruire un guidage minimal dans l'UI existante (info-box, progression visuelle)
- Risque : perdre un investissement significatif en contenu et en logique

**B. Reactiver selectivement**
- Garder le flux conversationnel pour la creation de cours (deja actif via accueil)
- Reactiver les boutons d'aide contextuelle sans conditionner au Mode Assiste
- Supprimer le reste (tooltips Primo, mode notification)
- Avantage : 22 contenus d'aide deja rediges, reutilisables immediatement

**C. Transformer Primo en guidage statique**
- Extraire les textes de primo-questions.js et aide-contextuelle-contenu.js
- Les injecter comme info-box dans chaque sous-section (comme le guidage demo)
- Ajouter une barre de progression visuelle dans Construction
- Supprimer le moteur conversationnel
- Avantage : guidage permanent, pas conditionne a un mode

**D. Refonte architecturale**
- Concevoir un systeme de guidage integre a la navigation
- Chaque section sait ou en est l'utilisateur dans le flux macro → micro
- Indicateurs visuels de progression (comme le guide 4 etapes qui existait dans Trimestre)
- Le plus ambitieux, mais le plus coherent avec l'alignement pedagogique

---

## 6. L'alignement pedagogique : la vraie question

### Le flux technique reflecte un alignement pedagogique

Le parcours de configuration n'est pas arbitraire. Il suit une logique d'alignement constructif (Biggs, 1996) :

```
Competence visee (cours)
    ↓ se decline en
Criteres d'evaluation (grille)
    ↓ se mesurent sur
Niveaux de performance (echelle)
    ↓ qui determinent
Retroaction ciblee (cartouches)
    ↓ qui s'appliquent a
Productions evaluees (artefacts)
    ↓ selon une
Pratique de notation (philosophie)
```

### Ce que l'application devrait rendre explicite

L'utilisateur ne configure pas des « outils techniques ». Il construit un **dispositif d'evaluation aligne** :

1. **Qu'est-ce que je veux que mes etudiants apprennent ?** → Competence (cours)
2. **Comment vais-je savoir s'ils l'ont appris ?** → Criteres (grille)
3. **A quel niveau de maitrise ?** → Niveaux (echelle)
4. **Comment je leur communique ou ils en sont ?** → Retroaction (cartouches)
5. **A travers quelles taches ?** → Productions
6. **Comment je construis la note finale ?** → Pratique de notation

Cette logique devrait etre **visible dans l'interface**, pas cachee dans un paragraphe de conseil.

---

## 7. Materiel pedagogique disponible

### Pratiques predefinies (7 enseignants)

| Enseignant | Discipline | Pratique | Fichier disponible |
|-----------|------------|----------|-------------------|
| Bruno V. | Chimie | PAN-Standards 5 niveaux | Oui |
| Marie-Helene L. | Litterature | Sommative traditionnelle | Oui |
| Francois A.-H. | Chimie | PAN-Specifications | Oui |
| Gregoire Bedard | Litterature | PAN-Maitrise IDME | Oui |
| Michel B. | Mathematiques | PAN-Objectifs ponderes | Oui |
| Jordan R. | Philosophie | Sommative + remplacement | Oui |
| Isabelle M. | Biologie | PAN-Jugement global | Oui |

### Fichiers d'import dans materiel-demo/

- `echelle-idme.json` — Echelle Insuffisant-Developpement-Maitrise-Etendu
- `grille-srpnf.json` — Grille Structure-Raisonnement-Pertinence-Nuance-Francais
- `cartouches-srpnf.json` — Retroaction pour chaque cellule grille × echelle

### 12 gabarits de pratiques predefinies

Stockes dans `js/pratiques/pratiques-predefines.js` :
- 4 types : Sommative (SOM), Standards (STD), Specifications (SPE), Denotation (DEN)
- 4 modes STD : Comptage, Moyenne ponderee, Seuils critiques, Holistique
- Chaque gabarit inclut : parametres, seuils, description

---

## 8. Documentation existante

### Guides utilisateur

| Document | Contenu |
|----------|---------|
| `docs/utilisateur/DEMARRAGE_RAPIDE.md` | 4 etapes en 5 minutes (charge demo, charge pratique, explore) |
| `docs/utilisateur/GUIDE_TESTEURS.md` | 3 niveaux de test (basique 15 min, intermediaire 30 min, avance 1-2 sem) |
| `docs/utilisateur/README_DONNEES_DEMO.md` | 8 etapes pour creer un pack de donnees demo |

### Architecture

| Document | Contenu |
|----------|---------|
| `docs/00-START-HERE.md` | Point d'entree, hierarchie de verite, navigation par contexte |
| `docs/architecture/pattern-bibliotheque-assemblage.md` | Pattern Bibliotheque + Assemblage detaille |
| `docs/modules/pratiques.md` | Interface IPratique, workflow de creation |
| `docs/decisions/2025-11-systeme-pratiques.md` | ADR : pourquoi une architecture modulaire pour les pratiques |

### Pedagogie

| Document | Contenu |
|----------|---------|
| README.md | Indices A-C-P, modele RaI, taxonomie SOLO/IDME |
| `docs/projet de developpement/SPEC-MODULE-PLANIFICATION.md` | Spec future : module de planification (enseignement explicite, 5 phases) |

---

## 9. Questions pour Cowork

### Decisions architecturales

1. **Le code Primo (~6800 lignes) : garder, adapter ou supprimer ?**
   - Le flux conversationnel Module 1 (creation de cours) est le seul encore actif
   - Les 22 contenus d'aide contextuelle sont reutilisables
   - Le wizard V2 pour les pratiques est autonome et fonctionnel

2. **Le guidage post-creation de cours : quelle forme ?**
   - Barre de progression dans Construction (comme le guide 4 etapes qui existait) ?
   - Info-box statiques a chaque etape (pattern du guidage demo) ?
   - Checklist interactive dans l'Apercu de Construction ?
   - Navigation suggeree (« Prochaine etape → ») ?

3. **L'alignement pedagogique : doit-il etre visible dans l'interface ?**
   - Montrer le lien competence → criteres → niveaux → retroaction → productions ?
   - Renommer les sous-sections pour refleter la logique (ex: « Que vais-je evaluer ? » au lieu de « Grilles de criteres ») ?
   - Ou garder la terminologie technique pour les utilisateurs experimentes ?

4. **Le materiel pedagogique : comment le rendre accessible ?**
   - Les 7 pratiques predefinies et les fichiers d'import existent
   - Primo les importait automatiquement dans Module 2
   - Sans Primo, l'utilisateur doit les trouver et les importer manuellement

### Priorite suggeree

Si l'objectif est l'AQPC (juin 2026), le minimum viable serait :
- Un guidage post-creation de cours (les etapes suivantes explicites)
- L'acces simplifie au materiel pedagogique (import en un clic)
- Les contenus d'aide contextuelle reactives (sans Mode Assiste)

---

*Rapport genere le 7 fevrier 2026*
*Base sur l'audit du code source Beta 97.2 (Build 0206-2045)*
