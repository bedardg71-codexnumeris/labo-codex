# Plan E — Nettoyage du wizard V1 fantôme dans `pratiques.js`

**Date** : 28 avril 2026
**Contexte** : la fonction `ouvrirWizardPratique` et ses helpers (V1) cherchent un DOM `#modalWizardPratique` qui n'existe plus dans `index.html` depuis la migration V2. Le wizard actif est V2 dans `js/wizard-pratique-v2.js` avec DOM `#modalWizardPratiqueV2`. La fragilité actuelle : `pratiques.js:4938` exporte `window.ouvrirWizardPratique` qui peut masquer la version V2-déléguée d'`accueil.js:330` selon l'ordre de chargement.

**Scope** : suppression de 31 fonctions + 3 variables globales + ~21 exports `window.*` dans `pratiques.js`. **Aucune modification** de `wizard-pratique-v2.js`, `accueil.js`, ou `index.html`.

**Tous les call-sites externes ont été vérifiés** : aucune référence externe aux fonctions V1 (grep complet sur `*.js` et `*.html`). Le seul export concurrent est `window.ouvrirWizardPratique` qui sera désormais fourni uniquement par `accueil.js` (qui délègue à `ouvrirWizardV2`).

---

## Inventaire détaillé

### Bloc 1 — lignes 2261 à ~4106 (~1845 lignes)

**Fonctions V1** (28 fonctions) :

| Ligne | Fonction | Type |
|---|---|---|
| 2261 | `ouvrirWizardPratique(modeEdition, idPratique)` | Entrée principale V1 (DOM absent → return silencieux) |
| 2317 | `preremplirWizardPourEdition(config)` | Helper V1 |
| 2662 | `fermerWizardPratique()` | Helper V1 |
| 2680 | `chargerGrillesWizard()` | Helper V1 |
| 2714 | `afficherPreviewGrilleWizard()` | Helper V1 |
| 2788 | `chargerEchellesWizard()` | Helper V1 |
| 2821 | `afficherPreviewEchelleWizard()` | Helper V1 |
| 2926 | `resetterWizard()` | Helper V1 |
| 2978 | `onWizardPortfolioSelectionChange()` | Handler V1 |
| 3005 | `afficherEtapeWizard(numeroEtape)` | Navigation V1 |
| 3069 | `suivantEtapeWizard()` | Navigation V1 |
| 3085 | `precedentEtapeWizard()` | Navigation V1 |
| 3095 | `validerEtapeWizard(numeroEtape)` | Validation V1 |
| 3201 | `ajouterNiveauWizard(niveauDefaut)` | Édition V1 |
| 3230 | `retirerNiveauWizard(btn)` | Édition V1 |
| 3271 | `ajouterEvaluationWizard()` | Édition V1 |
| 3291 | `retirerEvaluationWizard(btn)` | Édition V1 |
| 3327 | `chargerEnsembleWizard()` | Édition V1 |
| 3374 | `ajouterObjectifWizard()` | Édition V1 |
| 3398 | `retirerObjectifWizard(btn)` | Édition V1 |
| 3495 | `afficherSeuilsActuelsWizard()` | Affichage V1 |
| 3526 | `toggleResumeJetonsWizard()` | Affichage V1 |
| 3647 | `creerPratiqueDepuisWizard()` (async) | Submit V1 |
| 3773 | `construireEchelle()` | Helper de creer V1 |
| 3818 | `construireStructure()` | Helper de creer V1 |
| 3888 | `construireCalcul()` | Helper de creer V1 |
| 3912 | `construireReprises()` | Helper de creer V1 |
| 3940 | `construireCriteres()` | Helper de creer V1 |
| 3954 | `construireSeuils()` | Helper de creer V1 |
| 3973 | `construireInterface()` | Helper de creer V1 |
| 3991 | `construireSpecifications()` | Helper de creer V1 |

**Variables globales V1** (3) :

| Ligne | Variable |
|---|---|
| 2628 | `let wizardEtapeActuelle = 1;` |
| 2629 | `const wizardNbEtapes = 8;` |
| 2634 | `const wizardTitresEtapes = { ... };` |

### Bloc 2 — lignes 4551 à ~4569 (~19 lignes)

**Fonction V1 isolée** :

| Ligne | Fonction |
|---|---|
| 4551 | `supprimerPratiqueDepuisWizard()` (async) |

(Cette fonction est entre `retirerPratiqueDeBibliotheque` ligne 4527 — **NON V1, à conserver** — et `ajouterPratiqueIndividuelle` ligne 4574 — **NON V1, à conserver**.)

### Exports `window.*` V1 à retirer

**Ligne 3000** : `window.onWizardPortfolioSelectionChange = onWizardPortfolioSelectionChange;`
**Ligne 4232** : `window.retirerNiveauWizard = retirerNiveauWizard;`
**Lignes 4932-4954 (bloc final)** :
- 4932 : `window.fermerWizardPratique`
- 4933 : `window.supprimerPratiqueDepuisWizard`
- 4934 : `window.suivantEtapeWizard`
- 4935 : `window.precedentEtapeWizard`
- 4936 : `window.chargerEchellesWizard`
- 4937 : `window.afficherPreviewEchelleWizard`
- 4938 : `window.ouvrirWizardPratique` ← **élimine la concurrence avec accueil.js**
- 4939 : `window.preremplirWizardPourEdition`
- 4940 : `window.chargerGrillesWizard`
- 4941 : `window.afficherPreviewGrilleWizard`
- 4945 : `window.toggleResumeJetonsWizard`
- 4946 : `window.afficherSeuilsActuelsWizard`
- 4949 : `window.ajouterEvaluationWizard`
- 4950 : `window.retirerEvaluationWizard`
- 4951 : `window.ajouterObjectifWizard`
- 4952 : `window.retirerObjectifWizard`
- 4954 : `window.creerPratiqueDepuisWizard`

(Au total : **20 exports V1 à retirer**. Les autres exports du bloc 4932-4960 sont à conserver — ils concernent la bibliothèque, l'import, etc.)

---

## Vérifications de sécurité effectuées

1. **Aucun call-site externe** — grep complet sur `*.js` et `*.html` pour les 31 fonctions V1 : zéro match en dehors de `pratiques.js`. Le seul match `afficherEtapeWizardV2` dans `wizard-pratique-v2.js` est un faux positif (sous-chaîne de `afficherEtapeWizard`).
2. **Aucun helper partagé avec V2** — V1 utilise les IDs DOM `wizard-*` ; V2 utilise `wizard-v2-*`. Strictement disjoint. V2 est dans un fichier séparé `wizard-pratique-v2.js`.
3. **Pas de DOM V1 dans `index.html`** — `id="modalWizardPratique"` (sans V2) absent depuis la migration. Seul `id="modalWizardPratiqueV2"` existe.
4. **`construire*` sont uniquement appelés par `creerPratiqueDepuisWizard`** (V1, lignes 3656/3670/3676/3679/3682/3685/3688/3691). Aucun appel ailleurs.
5. **Concurrence sur `window.ouvrirWizardPratique`** — `accueil.js:330` et `pratiques.js:4938` exportent tous deux. Après nettoyage, seul `accueil.js` exporte → fragilité éliminée.

---

## Phasage d'exécution recommandé

**1 commit unique, atomique, ciblé** — pas de découpage par phase. Soit on supprime tout, soit rien (le code mort se tient ensemble : variables, fonctions, exports). Découpage = risque de laisser un état incohérent entre commits.

### Étapes opérationnelles (à exécuter en une passe)

1. Supprimer les exports `window.*` V1 (lignes 3000, 4232, 4932-4954 ciblées) — ~21 lignes
2. Supprimer `supprimerPratiqueDepuisWizard` (lignes 4548-4570 environ, incluant le commentaire JSDoc d'avant) — ~22 lignes
3. Supprimer le bloc V1 principal (lignes 2253-4106 environ, incluant tous les commentaires JSDoc qui précèdent chaque fonction V1) — ~1855 lignes
4. Vérifier `node --check` : syntaxe OK
5. Vérifier que `pratiques.js` n'a plus aucune occurrence de `wizardEtapeActuelle`, `modalWizardPratique`, `wizardNbEtapes` :
   ```
   grep -n "wizardEtapeActuelle\|modalWizardPratique\|wizardNbEtapes\|wizardTitresEtapes" js/pratiques.js
   ```
   Doit retourner 0 résultat.

### Estimation

- **Lignes supprimées** : ~1900 lignes (le fichier passe de ~4970 à ~3070, soit -38 %)
- **Effort** : ~30 min (3 blocs Edit avec marqueurs de début/fin clairs)
- **Risque** : faible si checklist suivie

---

## Tests post-suppression

**Tests obligatoires** (par toi, sur le navigateur) :

1. **Boot de l'app** : aucune erreur JavaScript dans la console ? (le fichier doit charger sans crash de parse)
2. **Création d'une pratique** :
   - Accueil → bouton « Créer une pratique de notation » → wizard V2 s'ouvre
   - Naviguer les 8 étapes du wizard
   - Cliquer « Créer la pratique » → la pratique apparaît dans la bibliothèque
3. **Édition d'une pratique existante** :
   - Bibliothèque pratiques → clic sur une pratique → wizard V2 s'ouvre en mode édition
   - Modifier un champ, sauvegarder → modifications persistées
4. **Suppression d'une pratique depuis le wizard V2** (si V2 expose ce bouton — à vérifier) :
   - Si bouton présent : test ; si absent : non applicable
5. **Vérification du localStorage** : l'export/import de pratiques fonctionne (importerPratiqueJSON ligne 4107 — non V1, à conserver)

**Tests automatiques** (par moi) :
- `node --check js/pratiques.js` (syntaxe)
- `grep` post-suppression (vérification qu'aucun reste V1)

---

## Plan de fallback

Si un test post-suppression révèle un appel à une fonction V1 que j'ai raté :

1. **Cas A — La fonction manquante est aussi présente en V2** : remplacer l'appel par la V2 équivalente. ~5 min.
2. **Cas B — Aucun équivalent V2** : `git revert` du commit. ~1 min, retour à l'état actuel sans dégât.

**Pas de migration de données concernée** — le wizard V1 ne lit ni n'écrit dans IndexedDB ou localStorage différemment de V2 ; les deux produisent des objets `pratique` du même format dans `pratiquesConfigurables`. Aucun risque pour tes données.

---

## Décision attendue

- ✅ **Procéder** — je fais les 3 Edits ciblés, commit atomique, push. Tu testes après dans le navigateur.
- ⏸ **Reporter** — on garde ce plan en archive pour plus tard. Risque latent : l'ordre de chargement reste fragile.
- ❌ **Annuler** — on accepte la dette indéfiniment.

Mon avis : **procéder**. Les vérifications sont solides, le scope est clair, le fallback est simple (git revert), et le bénéfice est réel (élimination d'une fragilité de chargement + -38 % de lignes dans `pratiques.js`).
