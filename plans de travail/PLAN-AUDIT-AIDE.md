# Plan d'audit — Section Aide

> **Date** : 3 avril 2026
> **Contexte** : Post-consolidation (Tiers 0→7.8 + navigation reorganisee + Labo)
> **Objectif** : S'assurer que les 65+ articles thematiques refletent l'etat actuel de l'application
> **Priorite** : Avant le colloque AQPC (juin 2026)

---

## Ce qui a deja ete fait (Tier 7.7, 3 avril 2026)

- 44 lignes de terminologie navigation mises a jour (Tableau de bord → Apercu, etc.)
- Acronymes verifies (PAN, ELLAC, SOLO, SRPNF, IDME → tous dans le glossaire)
- Articles Codex : 4 phases couvertes
- Jetons de reprise : 43 occurrences, couverture adequate

## Inventaire des corrections a faire (3 avril 2026)

20 instructions de navigation obsoletes dans la zone aide (lignes ~12200-16000) :

| Ancien chemin | Occ. | Nouveau chemin |
|---|---|---|
| Reglages → Trimestre | 10 | Contexte → Trimestre |
| Reglages → Cours | 1 | Contexte → Trimestre (consolide) |
| Construction → Pratiques de notation | 1 | Contexte → Pratiques de notation |
| Construction → Productions etudiantes | 1 | Structure → Productions etudiantes |
| Construction → Grilles de criteres | 1 | Structure → Grilles de criteres |
| Construction → Echelles de performance | 1 | Structure → Echelles de performance |
| Construction → Cartouches de retroaction | 1 | Structure → Cartouches de retroaction |
| Planification → Carte | 1 | Structure → Alignement pedagogique |
| Mode Assiste (references) | 3 | Reformuler (aide contextuelle via checkbox Accueil) |

Non corrigeable automatiquement :
- 5 noms de fichiers image (`img/aide/Tableau de bord - ...`) — retaker les screenshots
- 1 commentaire HTML (« Carte: Tableau de bord Apercu ») — cosmetique

Deja correct (ne pas toucher) :
- Reglages → Preferences (3 occ.) — chemin inchange

---

## Ce qui reste a verifier

---

### Passe 1 — Contenu obsolete (references a des fonctionnalites disparues ou deplacees)

Pour chaque article, verifier :

1. **Captures d'ecran** — les images dans `img/aide/` montrent-elles encore la bonne interface ?
   - Les images referent « Tableau de bord » dans leurs noms de fichiers (non renommees)
   - Les screenshots montrent l'ancienne navigation (9 boutons avec anciens noms)
   - A retaker apres la stabilisation de l'UI

2. **Instructions de navigation** — les chemins « va dans X → Y » sont-ils corrects ?
   - Tier 7.7 a corrige les principaux, mais verifier les articles thematiques restants
   - Grep : « Reglages → Trimestre » (maintenant Contexte → Trimestre)
   - Grep : « Presences → Saisie » (maintenant Suivi → Saisie)

3. **Fonctionnalites retirees ou deplacees** :
   - Les 4 sous-sections Apercu supprimees (presences, evaluations, construction, reglages)
   - Le mode « Assisté » (supprime, remplace par aide contextuelle)
   - Anciens noms d'onglets Reglages (cours, horaire, groupe → consolides dans Trimestre)

4. **Introduction** — Mise a jour avec le manifeste (fait le 3 avril).
   Verifier que le reste de l'article « Presentation » est coherent avec le nouveau texte.

---

### Passe 2 — Coherence pedagogique

Les articles doivent refleter la terminologie actuelle du projet :

| Ancien terme | Terme actuel | Verifier dans |
|---|---|---|
| « portfolio » (comme section) | « indices C-P » ou « pratique de notation » | Articles utilisation |
| « matériel pédagogique » | « Structure » (section) | Articles configuration |
| « ensembles d'objectifs » | Supprime depuis Beta 95 | Tous les articles |
| « mode simulation » | « mode démonstration » | Articles formation |
| « reglages-cours » | Consolide dans Contexte → Trimestre | Articles configuration |

---

### Passe 3 — Contenu manquant

Fonctionnalites ajoutees depuis la derniere mise a jour des articles (janvier 2026) :

| Fonctionnalite | Article existant ? | Action |
|---|---|---|
| Section Labo (correlations, impact jetons) | Non | Creer ou integrer dans un article existant |
| Jetons de reprise (workflow complet) | Partiellement (14314) | Verifier exhaustivite |
| Bilan reflexif | Non | Evaluer si un article est necessaire |
| Sous-section Labo dans Suivi | Non | Documenter dans les articles « Utilisation hebdomadaire » |
| Nouvelles sous-sections Accueil (toggles) | Non | Verifier si la section Formation le couvre |
| Manifeste sur la page d'accueil | Non (dans l'app directement) | OK, pas besoin d'article |

---

## Methode d'execution

1. **Automatise** : grep pour les termes obsoletes dans `index.html` (zone aide, lignes ~12200-16000)
2. **Lecture humaine** : parcourir chaque accordeon dans Safari, verifier la coherence avec l'app actuelle
3. **Corrections** : editer directement dans index.html, un commit par passe

## Effort estime

- Passe 1 (obsolete) : ~2-3h (grep + corrections)
- Passe 2 (terminologie) : ~1-2h (systematique)
- Passe 3 (manquant) : ~2-3h (redaction de contenu)
- **Total** : ~5-8h sur 2 sessions

---

## Recommandations d'execution avec Claude Code

### Passe 1 — Largement automatisable

Claude Code fait les greps systematiques dans `index.html` (lignes ~12200-16000) :
- « Tableau de bord » (→ Apercu), « Reglages → Trimestre » (→ Contexte → Trimestre)
- « Presences → Saisie » (→ Suivi → Saisie), « mode Assiste », « ensembles d'objectifs »
- Anciens noms d'onglets Reglages

Livrable : inventaire chiffre (occurrences × lignes) AVANT toute correction.
Corrections textuelles : mecaniques, fiables avec Claude Code.

**Captures d'ecran** : Claude Code peut lister les fichiers image references et verifier
leur existence physique, mais la comparaison visuelle avec l'app actuelle necessite
un humain. Retaker les screenshots apres stabilisation de l'UI.

### Passe 2 — Automatisable avec verification humaine

Approche elargie : croiser les termes de la zone aide (12200-16000) avec le code
fonctionnel. Si un terme existe dans l'aide mais plus dans le code applicatif
→ candidat obsolete. Exemples additionnels a chercher : « portfolio » (hors indice C-P),
« materiel pedagogique », « mode simulation », « reglages-cours ».

Verifier aussi la coherence des identifiants d'articles (id des accordeons, ancres)
avec les `data-aide` utilises par le systeme d'aide contextuelle.

### Passe 3 — Redaction assistee, pas autonome

Prudence sur le contenu pedagogique. Methode :
1. Claude Code lit le code des fonctionnalites pour extraire le comportement exact
2. Propose un squelette d'article (structure, points a couvrir)
3. Gregoire valide ou corrige
4. Claude Code redige le contenu final (tutoiement, vocabulaire A-C-P-E)

Evite la confabulation de contenu pedagogique.

### Ordre recommande

Passe 1 d'abord → produit un inventaire concret qui informe la Passe 2
(on decouvrira des termes obsoletes non listes dans le tableau actuel).

---

**Derniere mise a jour** : 3 avril 2026
