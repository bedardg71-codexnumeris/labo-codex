# Revue du plan Accueil et demo — Rapport pour Cowork

**Date** : 6 fevrier 2026
**Document revise** : `docs/Plan - Accueil et demo.md`
**Documents de reference** : `docs/rapport-demo-2026-02-06.md` (audit technique)
**Auteur** : Claude Opus 4.6 (session Claude Code)
**Contexte** : Le plan a ete redige par Cowork le 6 fevrier 2026 apres une session d'analyse conjointe. Cette revue examine sa faisabilite technique, identifie les risques et propose des ajustements appuyes par l'etat reel du code.

---

## 1. Evaluation globale

**Le plan est solide.** La vision est claire, les principes directeurs sont les bons, et le sequencement (nettoyer avant de reconstruire) est la seule approche viable. Le MVP pour l'AQPC est bien cadre.

**Trois risques majeurs** meritent attention :
1. L'architecture "en memoire seule" pour la demo est sous-estimee en complexite
2. Le dataset de 25 etudiants est un chantier de donnees significatif
3. Le calendrier est serre pour 4 chantiers en 4 mois

---

## 2. Revue chantier par chantier

### Chantier 1 : Demantelement — VALIDE, PRET A EXECUTER

Le chantier 1 est le plus clair et le plus actionnable du plan. La liste des actions est precise, les fichiers sont identifies, et le rapport d'audit fournit les numeros de ligne.

**Estimation** : 1 session Claude Code. C'est principalement de la suppression de code.

**Aucune modification recommandee.**

### Chantier 2 : Nouvelle demo — RISQUES IDENTIFIES

#### Risque A : Architecture "en memoire, pas dans IndexedDB"

Le plan dit :
> *Ses donnees sont chargees en memoire (pas dans IndexedDB). Quand l'utilisateur quitte la demo, tout est libere — rien ne persiste.*

**Etat du code** : Toute l'application accede aux donnees via une seule fonction centrale :

```
obtenirDonneesSelonMode(cle)   // modes.js, ligne 521
```

Cette fonction appelle `window.cle(key)` qui lit IndexedDB/localStorage avec un prefixe de trimestre. Elle est utilisee par **tous les modules** sans exception : tableau de bord, presences, evaluations, profil etudiant, travaux, construction de la note.

Pour que la demo fonctionne "en memoire seule", il faudrait :

| Option | Description | Effort |
|--------|-------------|--------|
| A. Proxy complet | Intercepter `obtenirDonneesSelonMode()` et `db.getSync()` pour retourner des donnees en memoire quand on est en demo | Refonte de `modes.js` + `db.js` (~1400 lignes combinees). Risque de regression sur toute l'application. |
| B. Namespace dedie | Ecrire les donnees demo dans IndexedDB sous un namespace `demo_` avec un trimestre `"demo"`, et nettoyer a la sortie | Simple. C'est ce que le Systeme 2 (trimestre.js) *tentait* de faire. Le probleme n'etait pas l'approche mais l'execution (10 bugs). |
| C. Iframe isolee | Charger la demo dans une iframe avec son propre contexte de stockage | Isolation parfaite mais complexite d'integration (navigation, CSS, evenements). |

**Recommandation** : Option B. Le vrai probleme du systeme actuel n'est pas IndexedDB — c'est la qualite du code qui ecrit dedans (presences corrompues, infoCours oublie, nettoyage incomplet, deux packs contradictoires). Un seul pack valide, un chargement propre, un dechargement complet sous un namespace `demo_` resout le probleme sans refondre la couche de donnees.

L'option B permet aussi de reutiliser `obtenirDonneesSelonMode()` tel quel, ce qui signifie que **tous les modules existants fonctionnent dans la demo sans modification**.

Si la persistance derange (l'utilisateur ne devrait pas retrouver ses modifications demo au prochain lancement), il suffit d'appeler `dechargerDonneesDemo()` au demarrage si le mode n'est plus demo. C'est 3 lignes de code.

#### Risque B : Dataset de 25 etudiants

Le plan dit :
> *Un cours 601-101-MQ avec ~25 etudiants anonymises, 15 semaines de donnees completes, indicateurs ACPE calcules et visibles, patterns d'apprentissage et niveaux RaI visibles.*

**Etat du code** : Le pack actuel (`pack-demarrage.js`) contient 5 etudiants avec des donnees simplifiees. Pour 25 etudiants credibles, il faut produire :

| Entite | Volume | Contraintes de coherence |
|--------|--------|-------------------------|
| Etudiants | 25 profils | Noms/prenoms/DA uniques |
| Presences | 375 entrees (25 x 15 sem.) | Patterns varies (assidu, irregulier, decrocheur) |
| Productions | 5-6 productions | Liees au cours, avec types varies |
| Evaluations | ~125 (25 x 5) | Niveaux de criteres coherents avec les indices |
| Indices ACPE | Calcules | A (assiduite) derive des presences, C (completion) des evaluations, P (performance) des niveaux, E combine |
| Patterns | Derives des indices | Stable, progression, defi, blocage emergent, blocage critique |
| Niveaux RaI | Derives des patterns | Fragile, modere, favorable, tres favorable |

La difficulte n'est pas le volume mais la **coherence** : un etudiant absent 8 semaines sur 15 doit avoir un indice A bas, ce qui impacte son pattern, ce qui determine son niveau RaI. Tout doit se tenir.

**Recommandation** : Generer les donnees **programmatiquement** avec un script Node.js. Definir 5 archetypes :

| Archetype | Profil | Nb etudiants | A | C | P |
|-----------|--------|-------------|---|---|---|
| Assidu performant | Present, notes elevees | 5 | 0.90+ | 0.85+ | 0.80+ |
| Regulier moyen | Present, notes moyennes | 8 | 0.80+ | 0.70+ | 0.55+ |
| Irregulier en progression | Absences ponctuelles, notes en hausse | 5 | 0.65+ | 0.60+ | 0.50+ |
| En difficulte | Absences frequentes, notes basses | 5 | 0.50+ | 0.45+ | 0.35+ |
| Decrocheur | Tres absent, peu d'evaluations | 2 | 0.30- | 0.25- | 0.20- |

Le script produit un fichier `pack-demo-25.js` deterministe (meme seed = memes donnees). Avantage : reproductible, modifiable, et les indices ACPE sont coherents par construction.

#### Risque C : Quatre scenarios

Le plan decrit 4 scenarios detailles mais le MVP n'en requiert qu'un seul ("Vue d'ensemble"). Les scenarios 2-4 (Travaux, Evaluation, Presences) demandent chacun des micro-interactions specifiques et du contenu Primo dedie.

**Recommandation** : Marquer explicitement les scenarios 2-4 comme **post-AQPC** dans le plan, pas seulement dans le sequencement. Leur description detaillee dans le document cree une attente implicite.

### Chantier 3 : Page d'accueil — VALIDE, BIEN CADRE

Le chantier 3 est bien defini et relativement independant. La structure a deux etats (premier lancement vs retour) est claire.

**Etat du code** : L'application demarre actuellement sur `afficherSection('tableau-bord')` dans `main.js` ligne 327. Ajouter une section `accueil` est direct :
- Nouveau `<section id="section-accueil">` dans `index.html`
- Entree dans `configurationsOnglets` (ou section sans sous-onglets)
- Logique de demarrage : si aucun cours → accueil ; si mode expert → tableau-bord ; sinon → accueil

**Un ajout recommande** : Lier le formulaire d'acces beta (`formulaire-acces-beta.html`, present a la racine du projet) depuis la page d'accueil. Si l'objectif est de recruter des testeurs pour le colloque, c'est un levier direct.

**Estimation** : 1-2 sessions Claude Code pour une version fonctionnelle sans design final.

### Chantier 4 : Primo revu — SOUS-ESTIME EN COMPLEXITE

Le plan dit :
> *Primo est le narrateur. A chaque etape du scenario, il commente ce que l'utilisateur voit. Il n'est pas un popup qu'on ferme — il est integre a l'interface de demo.*

**Etat du code** : Le Primo actuel represente ~3100 lignes de code :
- `primo-questions.js` : ~2000 lignes (arbre de questions, actions, logique de parcours)
- `primo-modal.js` : ~1100 lignes (UI modale, animations, gestion d'etat)

Le transformer en "guide narratif integre" est essentiellement un **nouveau module**. L'arbre de questions actuel est concu pour un dialogue interactif (question → reponse → branchement), pas pour une narration lineaire contextuelle.

**Recommandation pour l'AQPC** : Remplacer Primo par des **encarts textuels statiques** dans la demo. Le pattern existe deja dans l'application :

```html
<div class="info-box info-box--info">
    <strong>Titre</strong> — Texte explicatif contextuel.
</div>
```

Concretement : quand l'utilisateur entre dans la demo, chaque section affiche un encart qui explique ce qu'on voit. Pas d'etat, pas de modal, pas d'arbre de questions. C'est livrable en quelques heures.

Le "vrai" Primo revu (narrateur interactif avec parcours structures) viendrait en post-AQPC, quand la demo et la page d'accueil sont stables.

---

## 3. Point manquant : le selecteur de mode

Le plan ne precise pas ce qui arrive au selecteur de mode dans l'en-tete (Normal / Assiste / Anonymise).

**Etat du code** : Le selecteur est cree par `creerSelecteurMode()` dans `modes.js` (ligne 74). Il offre 3 options. Le mode "Assiste" (`simulation`) declenche actuellement le chargement des donnees demo.

**Si la demo devient une route separee** (et non un mode), le mode "Assiste" n'a plus de raison d'etre. En revanche, le mode "Anonymise" reste utile (projection en classe, respect de la vie privee).

**Recommandation** : Le plan devrait expliciter :
- Le mode "Assiste" (`simulation`) est supprime
- Le selecteur passe a 2 options : Normal / Anonymise
- L'entree dans la demo se fait via la page d'accueil (bouton "Explorer la demo"), pas via le selecteur de mode
- La sortie de la demo se fait via un bouton "Quitter la demo" qui ramene a la page d'accueil

---

## 4. Calendrier et estimation

| Chantier | Effort estime | Dependances | Cible AQPC |
|----------|--------------|-------------|------------|
| 1. Demantelement | 1 session | Aucune | Oui |
| 2. Demo (scenario Vue d'ensemble) | 3-4 sessions | Chantier 1 + script de generation de donnees | Oui |
| 3. Page d'accueil | 1-2 sessions | Aucune (parallelisable) | Oui |
| 4. Primo encarts statiques | 1 session | Chantier 2 | Oui |
| 4b. Primo narrateur complet | 4-6 sessions | Chantiers 2 + 3 | Post-AQPC |
| 2b. Scenarios 2-4 | 2-3 sessions chacun | Chantier 2 | Post-AQPC |

**Total pour MVP AQPC** : ~6-8 sessions Claude Code
**Marge** : ~4 mois = ~16 semaines. Avec 1-2 sessions par semaine, c'est faisable avec de la marge pour les imprevus.

---

## 5. Synthese des recommandations

| # | Recommandation | Justification technique | Impact sur le plan |
|---|---------------|------------------------|-------------------|
| 1 | **Utiliser IndexedDB avec namespace `demo_`** au lieu de "memoire seule" | `obtenirDonneesSelonMode()` est appele par tous les modules via IndexedDB. Le contourner demande une refonte de `modes.js` + `db.js` (~1400 lignes). Le namespace dedie reutilise toute l'infrastructure existante. | Reduit l'effort du chantier 2 de ~50% |
| 2 | **Generer le dataset de 25 etudiants par script** avec 5 archetypes | Garantit la coherence ACPE/patterns/RaI par construction. Reproductible et modifiable. | Ajoute une etape (ecrire le script) mais securise la qualite des donnees |
| 3 | **Marquer les scenarios 2-4 comme post-AQPC** explicitement | 4 scenarios = 4x le travail de contenu + micro-interactions. Le scenario Vue d'ensemble vend le mieux l'application (montre la valeur ajoutee sans demander d'interaction). | Reduit le scope AQPC, clarifie les attentes |
| 4 | **Utiliser des encarts statiques au lieu de Primo** pour la demo v1 | Le Primo actuel est ~3100 lignes. Le transformer en narrateur integre = nouveau module. Les `info-box` existent deja et sont le bon pattern. | Elimine le chantier 4 du chemin critique AQPC |
| 5 | **Expliciter la suppression du mode Assiste** | Le selecteur 3 options (Normal/Assiste/Anonymise) entre en conflit avec la demo comme "route separee". Garder les deux systemes recree le probleme actuel. | Clarifie l'architecture, evite les ambiguites |
| 6 | **Lier le formulaire d'acces beta** depuis la page d'accueil | `formulaire-acces-beta.html` existe a la racine. Si l'objectif est de recruter des testeurs, c'est un levier direct. | Ajout mineur avec impact potentiel sur le recrutement |

---

## 6. Proposition de plan revise (MVP AQPC)

```
Semaine 1-2 : Chantier 1 — Demantelement
    Supprimer le code mort, unifier sur un seul pack
    Resultat : terrain propre

Semaine 2-3 : Script de generation de donnees
    Creer un script Node.js qui genere pack-demo-25.js
    5 archetypes x 5 etudiants = 25 profils coherents
    Resultat : dataset demo credible

Semaine 3-5 : Chantier 2 — Demo (scenario Vue d'ensemble)
    Nouveau donnees-demo.js simplifie (namespace demo_, chargement/dechargement propre)
    Entree via bouton "Explorer la demo" → charge le pack, bascule sur trimestre demo
    Sortie via "Quitter la demo" → dechargement, retour accueil
    Bandeau discret "Mode demonstration"
    Encarts textuels contextuels (pas de Primo)
    Resultat : demo fonctionnelle en lecture + micro-interactions

Semaine 4-6 : Chantier 3 — Page d'accueil
    (en parallele du chantier 2)
    Nouvelle section "accueil" dans la navigation
    Deux etats : premier lancement / retour
    Portes d'entree par intention
    Lien vers formulaire beta
    Mode expert dans Reglages
    Resultat : premiere impression claire

Semaine 6-7 : Integration et tests
    Connecter page d'accueil ↔ demo
    Supprimer le mode "Assiste" du selecteur
    Tests avec 2-3 testeurs reels
    Resultat : MVP pret pour l'AQPC

Post-AQPC :
    Scenarios 2-4 (Travaux, Evaluation, Presences)
    Primo narrateur interactif
    Design visuel final (maquettes Figma)
```

---

## 7. Conclusion

Le plan "Accueil et demo" pose les bonnes questions et propose les bonnes reponses. Les principes directeurs (page permanente, demo isolee, langage d'intention) sont exactement ce qu'il faut. Les ajustements recommandes ici ne changent pas la vision — ils reduisent le risque technique et le scope pour garantir que le MVP AQPC soit livrable.

Le facteur de succes le plus important est la **qualite du dataset demo**. Une demo avec 25 etudiants credibles, des indices ACPE varies, des patterns visibles et des niveaux RaI distribues de facon realiste sera convaincante. C'est la qu'il faut investir le plus de soin.

---

*Revue completee le 6 fevrier 2026*
*Base sur l'analyse du code source (Beta 97.1, build 0206-1820) et le rapport d'audit technique du meme jour*
