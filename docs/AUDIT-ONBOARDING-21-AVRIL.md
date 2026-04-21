# Audit onboarding — Phase 1 du plan de consolidation

**Date** : 21 avril 2026
**Build de référence** : 0421-1430 · Beta 99.21
**Livrable** : Phase 1 de `plans de travail/PLAN-CONSOLIDATION-ONBOARDING.md`
**Statut** : document temporaire, à retirer en Phase 8

Ce document dresse la carte complète des appels (JS + HTML `data-action`) pour
chaque fonction exposée par les modules d'onboarding candidats au retrait, et
attribue une décision A/B/C à chacune :

- **A** — migrer : la fonction offre une capacité utile, la réimplanter / déplacer
- **B** — remplacer : l'accueil V3, le tour guidé, ou un bouton existant couvre le besoin
- **C** — supprimer : redondante ou morte

---

## 0. Inventaire physique (tailles)

```
  631  js/primo-accueil.js
 2518  js/primo-modal.js
 2306  js/primo-questions.js
  281  js/primo-validation-champs.js
  530  js/tutoriel-interactif.js
 1280  js/parcours-apprentissage.js
 2566  js/wizard-pratique-v2.js   ← PRÉSERVÉ
  317  js/accueil.js              ← PRÉSERVÉ (entry point V3)
 1667  js/accompagnement.js       ← PRÉSERVÉ (tour guidé + popups ✴️)
```

Scripts chargés dans `index.html` (lignes 15811-15889) :
`wizard-pratique-v2.js`, `primo-questions.js`, `primo-modal.js`,
`primo-accueil.js`, `primo-validation-champs.js`, `tutoriel-interactif.js`,
`parcours-apprentissage.js`.

**Périmètre retirable estimé** : `primo-accueil` (631) + `primo-modal` (2518)
+ `primo-questions` (2306) + `primo-validation-champs` (281)
+ `tutoriel-interactif` (530) = **6266 lignes JS** + CSS orphelin + retraits
de `<script>` + nettoyage de `parcours-apprentissage.js`.

---

## 1. Wizard à préserver — `js/wizard-pratique-v2.js` ✅

Le **wizard de pratique de notation** (2566 lignes) est **autonome** — sa
présence dans l'écosystème Primo était purement légacy (lancé par un wrapper
`demarrerWizard` dans `primo-accueil.js` qui appelait `ouvrirWizardV2()`).

**Entry points externes actifs** :

| Caller | Fichier:ligne | Statut |
|---|---|---|
| Bouton Réglages › Pratique | `js/pratiques.js:2646-2647` | ✅ actif, conservé |
| Carte « pratique de notation » accueil V3 | `js/accueil.js:298` (via `ouvrirWizardPratique`) | ✅ actif, conservé |
| Wrapper legacy `demarrerWizard` | `js/primo-accueil.js:392-405` | ❌ à retirer (wrapper mort) |
| Data-actions de la modale wizard elle-même | `index.html:16014-16053` | ✅ auto-contenus (fermerWizardV2, etapeSuivanteV2, etapePrecedenteV2, creerPratiqueV2) |

**Fonctions exposées sur `window`** (toutes utilisées) :
`ouvrirWizardV2`, `fermerWizardV2`, `etapeSuivanteV2`, `etapePrecedenteV2`,
`creerPratiqueV2`, `deduireTypePratique`, `wizardV2GererExclusionCheckbox`,
`wizardV2CreerGrilleDemo`.

**Décision** : aucune modification. Le module survit intégralement.

**Note** : `wizard-pratique-v2.js:2251` lit `modalitesEvaluation` (écrit
historiquement par Primo). Ce champ est maintenant aussi écrit par le flow
natif du wizard — aucune dépendance à primo-modal au runtime.

---

## 2. Carte des décisions par fonction

### 2.1 `primo-accueil.js` (631 l.)

| # | Fonction | Exposée | Callers externes | Décision |
|---|---|---|---|---|
| 1 | `initialiserPrimoAccueil` | `window` | aucun (auto-init désactivée le 21 avril, commit `8940088`) | **C** supprimer |
| 2 | `reafficherAccueilPrimo` | `window` | aucun (ref textuelles : BETA_93_CHANGELOG, pas de code) | **C** supprimer |
| 3 | `fermerModalAccueil` | `window` | aucun externe (utilisée en interne par toutes les options) | **C** supprimer (avec module) |
| 4 | `naviguerVersImportDemo` | `window` | aucun (pas de data-action hors primo-accueil) | **C** supprimer |
| 5 | `demarrerConfigComplete` | `window` | aucun externe | **C** supprimer |
| 6 | `demarrerWizard` | `window` | aucun externe (wrapper `→ ouvrirWizardV2`) | **C** supprimer — accueil V3 `ouvrirWizardPratique` couvre |
| 7 | `demarrerCreationMateriel` | `window` | `js/main.js:217` (via wrapper `demarrerCreationMaterielSafe` sans caller), `js/parcours-apprentissage.js:1210` (legacy) | **C** supprimer — le mode exercice de PLAN-AUTONOMISATION remplacera |
| 8 | `demarrerCodex` | `window` | aucun externe (wrapper `alert()` + `Codex.toggleMenu()`) | **C** supprimer — bouton Codex d'en-tête suffit |
| 9 | `demarrerEvaluation` | `window` | aucun externe (navigue `afficherSection('evaluations')`) | **C** supprimer — nav directe |
| 10 | `explorerLibrement` | `window` | aucun externe | **C** supprimer — ferme juste la modale |
| 11 | `consulterAide` | `window` | aucun externe (navigue `afficherSection('aide')`) | **C** supprimer — onglet Aide de la nav couvre |
| — | `genererBandeauRecommandation`, `afficherModalAccueil`, `estPremiereUtilisation`, `marquerAccueilVu`, `verifierEtAfficherAccueil` | interne | — | **C** supprimer (internes au module) |

**Bilan module** : aucune capacité utile unique. Fichier entier → **suppression**.

### 2.2 `primo-modal.js` (2518 l.)

| # | Fonction | Exposée | Callers externes | Décision |
|---|---|---|---|---|
| 1 | `_primoRadioHighlight` | `window` | data-on-change interne `primo-modal.js:576` | **C** supprimer (avec module) |
| 2 | `_primoTerminerConfig` | `window` | data-action interne `primo-modal.js:669` | **C** supprimer |
| 3 | `_primoSauterEtContinuer` | `window` | data-action interne `primo-modal.js:905` | **C** supprimer |
| 4 | `ouvrirModalConversationnel` | `window` | `js/primo-accueil.js:415, 503` UNIQUEMENT (démarrerConfigComplete, démarrerCreationMateriel) — tous deux supprimés en 2.1 | **C** supprimer |
| 5 | `fermerModalConversationnel` | `window` | aucun externe | **C** supprimer |
| 6 | `primoQuestionSuivante` / `primoQuestionPrecedente` | `window` | data-action interne `primo-modal.js:650, 707` | **C** supprimer |
| 7 | `confirmerAnnulation` | `window` | aucun externe | **C** supprimer |
| 8 | `terminerConfiguration` | `window` | aucun externe | **C** supprimer |
| 9 | `passerEnModeNotification` / `demarrerModeNotification` | `window` | aucun externe | **C** supprimer |

**Bilan module** : n'est appelé que par primo-accueil.js (lui-même supprimé). Fichier entier → **suppression**.

**Attention** : `primo-modal.js` est référencé comme propriétaire secondaire dans
`js/db.js:1211-1233` (registre DATA-OWNERSHIP) pour `groupeEtudiants`, `productions`,
`groupeCoursActif`. **À nettoyer** en Phase 6 (les champs restent, mais
l'ownership shift vers `trimestre-v2.js` / `productions.js` seuls).

### 2.3 `primo-questions.js` (2306 l.)

Fonctions exposées : `copierListeEtudiantsFictifs`, `obtenirQuestion`,
`obtenirToutesLesQuestions`, `obtenirQuestionsActives`, `validerReponse`,
`transformerReponse`, `obtenirOptions`.

| # | Fonction | Callers externes | Décision |
|---|---|---|---|
| 1 | `obtenirQuestionsActives` | `js/primo-accueil.js:479, 493` UNIQUEMENT | **C** supprimer (avec primo-accueil) |
| 2 | Autres (`obtenirQuestion`, `validerReponse`, etc.) | aucun externe (consommées uniquement par primo-modal.js) | **C** supprimer |
| — | Collision de nom : `obtenirToutesLesQuestions` existe aussi dans `bilan-reflexif.js:2018`. Scopes séparés (primo-questions.js est un IIFE ? à vérifier avant suppression). | — | — |

**Bilan module** : catalogue de questions du wizard conversationnel. Aucun
caller survit. Fichier entier → **suppression**.

**Attention** : vérifier en Phase 3 que primo-questions.js est bien un module
isolé et que la suppression ne perturbe pas `bilan-reflexif.js`
(même nom de fonction, mais scopes IIFE distincts attendus).

### 2.4 `primo-validation-champs.js` (281 l.)

Fonctions exposées : `validerChampsSousSection`, `validerSousSectionActuelle`,
`retirerValidationVisuelle`, `initialiserValidationChamps`.

| # | Fonction | Callers externes | Décision |
|---|---|---|---|
| Toutes | aucun caller externe (grep `js/!primo-*.js` vide) | **C** supprimer |

Utilise le flag `primo_accueil_vu` à la ligne 214 — cohérent avec
primo-accueil.js (suppression combinée, flag à nettoyer en Phase 6).

**Bilan module** : fichier entier → **suppression**.

### 2.5 `tutoriel-interactif.js` (530 l.)

Fonctions exposées : `demarrerTutoriel`, `demarrerTutorielParcours`,
`terminerTutoriel`, `etapeSuivante`, `etapePrecedente`,
`verifierDemarrageAutoTutoriel`.

| # | Fonction | Callers externes | Décision |
|---|---|---|---|
| 1 | `terminerTutoriel` | `js/navigation.js:70-71` (hook sur changement de section) | **B** remplacer — navigation.js vérifie si la fonction existe avant de l'appeler (`if typeof...`), suppression sans migration nécessaire |
| 2 | `demarrerTutorielParcours` | `js/parcours-apprentissage.js:979-980` (legacy) | **C** supprimer (avec parcours simplifié en Phase 5) |
| 3 | `demarrerTutoriel`, `etapeSuivante`, `etapePrecedente`, `verifierDemarrageAutoTutoriel` | aucun externe | **C** supprimer |

**Bilan module** : fonctionnalité couverte par le **tour guidé 6 étapes**
intégré à `accompagnement.js` depuis le 19 avril. Fichier entier → **suppression**.
Après retrait, nettoyer le call-site défensif dans navigation.js.

### 2.6 `parcours-apprentissage.js` (1280 l.) — `window.parcours`

C'est le cas le plus nuancé : l'objet `window.parcours` EST appelé depuis
plusieurs fichiers actifs. Simplification partielle, pas suppression totale.

| # | Méthode | Callers externes actifs | Décision |
|---|---|---|---|
| 1 | `estInitialise`, `estAutonome`, `getProgression` | `js/primo-accueil.js:67-70` UNIQUEMENT | **C** supprimer (caller disparaît) |
| 2 | `changerModeParcours` | `js/init-inline.js:104-106` | **A** migrer ou simplifier — à auditer Phase 5 |
| 3 | `initialiserPreferencesParcours` | `js/navigation.js:547-548`, `js/main.js:194-196` | **A** à auditer Phase 5 |
| 4 | `onNavigationChange` | `js/navigation.js:614-615` | **A** à auditer Phase 5 |
| 5 | `reinitialiser` | `js/main.js:194` | **A** à auditer Phase 5 |
| 6 | Wrappers délégation data-action : `continuerJalonNotification`, `fermerNotificationJalon`, `confirmerModalBienvenue`, `choisirModeExplicite`, `choisirModeDecouverte`, `relancerParcours`, `changerModeParcoursAction`, `lancerAssistantCreation`, `executerSuggestionCallback`, `naviguerSuggestionJalon`, `fermerSuggestion` | data-actions internes du module (modales qu'il génère) | **C** supprimer avec les modales associées si redondantes |
| 7 | `naviguerVersJalon`, `marquerJalon`, `verifierJalons`, `genererPanneauParcours`, `mettreAJourUI` | internes au module | **C** supprimer si module simplifié |

**Action Phase 5** :
- Auditer si le **mode « parcours guidé »** (jalons, progression, panneau)
  apporte encore quelque chose par-dessus le tour guidé 6 étapes + accueil V3
  + flèches didactiques (A.16 livrée 18 avril)
- Si redondant : suppression totale, et migration des 5 call-sites (init-inline,
  navigation×2, main×1) vers des no-op ou simplifications
- Si utile : extraction du noyau minimal (200-300 l.) et suppression du reste

**Remarque** : `parcours-apprentissage.js` génère des modales qui réutilisent
le CSS `.modal-bienvenue-*` (déjà orphelin côté JS depuis le retrait de
`modal-bienvenue.js` le 20 avril). À nettoyer aussi en Phase 7.

---

## 3. Flags localStorage à migrer (Phase 6)

| Flag | Source | Action |
|---|---|---|
| `primo_accueil_vu` | `primo-accueil.js:30, 55` + `primo-validation-champs.js:214` | Suppression silencieuse au démarrage |
| `bienvenue_vu` | `modal-bienvenue.js` (déjà supprimé 20 avril) | Déjà orphelin — vérifier que plus aucun code le lit |
| Préfs parcours (`modeParcours`, `jalonsVus`, etc.) | `parcours-apprentissage.js` | Selon décision Phase 5 |

---

## 4. CSS orphelin anticipé (Phase 7)

Sélecteurs à auditer (`styles.css`) :
- `.primo-modal-*` (primo-modal)
- `.primo-accueil-*` (primo-accueil)
- `.tutoriel-*` (tutoriel-interactif)
- `.parcours-*` (si parcours simplifié ou retiré)
- `.modal-bienvenue-*` (déjà orphelin JS, à confirmer)

**À conserver** :
- `.primo-aide`, `.primo-popup`, `.primo-overlay`, `.primo-icon`,
  `.primo-popup-*` — utilisés MASSIVEMENT par `accompagnement.js` pour les
  popups d'aide contextuelle (icône ✴️). Le nom « primo » survit comme
  marqueur de la mascotte d'aide, dissocié du wizard primo supprimé.

---

## 5. data-actions HTML — scan complet

Résultat du grep `data-action="(primo|parcours|tutoriel|wizard|demarrer...|...)"` :

| Fichier | Nombre | Destination |
|---|---|---|
| `index.html` | 4 (wizard-v2 uniquement) | ✅ conservés (modale wizard) |
| `js/primo-accueil.js` | 7 (HTML généré interne) | ❌ disparaissent avec le module |
| `js/primo-modal.js` | 3 (HTML généré interne) | ❌ disparaissent |
| `js/parcours-apprentissage.js` | 13 (HTML généré interne, `parcours.XXX`) | ❌ selon Phase 5 |
| `js/wizard-pratique-v2.js` | 2 (HTML généré interne) | ✅ conservés |

**Aucun data-action externe dans `index.html` ne pointe vers les modules à
supprimer** — excellente nouvelle, la suppression est atomique.

---

## 6. Autres points d'attention

### 6.1 `js/main.js:216-218`

```js
window.demarrerCreationMaterielSafe = function() {
    if (typeof demarrerCreationMateriel === 'function') demarrerCreationMateriel();
};
```

Exporté mais **aucun caller trouvé** — dead code. À supprimer en Phase 3
(ou Phase 6 nettoyage).

### 6.2 `js/db.js:1211-1233` — registre DATA-OWNERSHIP

Mentions de `primo-modal.js` à retirer pour trois clés :
`groupeEtudiants`, `productions`, `groupeCoursActif`.

### 6.3 Collision de nom `obtenirToutesLesQuestions`

Définie dans `primo-questions.js:2298` ET `bilan-reflexif.js:2018`. Vérifier
que les deux fichiers sont bien des IIFE (scopes séparés) avant suppression
de primo-questions.js — le module bilan-reflexif doit survivre intact.

### 6.4 Documentation à mettre à jour (Phase 8)

- `docs/Rapport - Flux de configuration (0207).md` — devient obsolète
- `docs/audit-premier-contact.md` — devient obsolète
- `docs/utilisateur/Changelogs/BETA_92_CHANGELOG.md`, `BETA_93_CHANGELOG.md` — historique, laisser tel quel
- `NOTES-DE-VERSION.md:107, 115, 119, 122` — mentions primo à retirer
- `BACKLOG.md:1231` — mention `demarrerCreationMateriel` à retirer ou mettre à jour
- `CLAUDE.md` — ajouter principe « stabilité zéro-dette »

---

## 7. Synthèse — plan de suppression (Phase 3 à 5)

### Phase 3 — retrait primo-* (suppression atomique)

Suppression physique, aucune migration nécessaire (tous les callers sont
internes au sous-système) :

1. `js/primo-accueil.js`
2. `js/primo-modal.js`
3. `js/primo-questions.js`
4. `js/primo-validation-champs.js`
5. 4 `<script src>` dans `index.html:15880-15883`
6. `window.demarrerCreationMaterielSafe` dans `js/main.js:216-218`
7. Mentions `primo-modal.js` dans `js/db.js:1211-1233`

**Gain** : ~5700 lignes JS supprimées + 4 scripts en moins.

### Phase 4 — retrait tutoriel-interactif

1. `js/tutoriel-interactif.js`
2. `<script src>` dans `index.html:15886`
3. Bloc defensif `if (typeof terminerTutoriel === 'function')` dans
   `js/navigation.js:70-71`

**Gain** : 530 lignes JS supprimées.

### Phase 5 — décision parcours-apprentissage

Deux scénarios à trancher avec Grégoire :

**Scénario A — suppression totale** (recommandé si le module est jugé
redondant avec tour guidé + accueil V3 + flèches didactiques) :
- Suppression `js/parcours-apprentissage.js`
- Migration des 5 call-sites (`init-inline.js`, `navigation.js`×2,
  `main.js`×1, `primo-accueil.js` déjà retiré) vers des no-op
- Retrait du `<script src>` dans `index.html:15889`
- Nettoyage des placeholders DOM (`index.html:3744, 10359`)
- Gain : 1280 lignes JS

**Scénario B — extraction du noyau** :
- Conservation minimale (200-300 l.) : juste `getMode`, `setMode`,
  `onNavigationChange`
- Suppression de toute la logique jalons / modales bienvenue / suggestions
- Gain : ~1000 lignes JS

À discuter avant d'entamer la Phase 5.

---

## 8. Checklist de validation post-consolidation

Au terme des Phases 3-5, vérifier :

- [ ] Installation vierge : 0 modale auto au 1er démarrage hors accueil V3
- [ ] Console silencieuse (pas de `ReferenceError` sur fonctions retirées)
- [ ] `grep -r "primo-" js/ index.html` ne trouve plus que `.primo-aide` /
      `.primo-popup` / `.primo-overlay` (popups d'aide) et quelques mentions
      docs/historiques
- [ ] Le wizard de pratique de notation s'ouvre toujours depuis :
      (a) accueil V3 carte « pratique », (b) Réglages › Pratique
- [ ] Tous les flows métier (Réglages / Structure / Évaluations / Suivi)
      fonctionnent sans régression
- [ ] Données personnelles (trimestres H2026/A2025) intactes
- [ ] 1 seul script d'onboarding dans `index.html` (accueil + accompagnement)

---

*Fin de l'audit Phase 1. Document à retirer en Phase 8.*
