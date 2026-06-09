# Plan : découvrabilité des guides pédagogiques (accueil, visite guidée, assistance)

**Date** : 4 juin 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Statut** : ✅ VALIDÉ par Grégoire le 4 juin 2026 — prêt à exécuter (après commit du chantier guides)
**Prérequis** : module `js/guides-pedagogiques.js` livré le 4 juin (3 guides : SOLO, ACP, RàI), chantier non encore commité au moment de la rédaction — vérifier qu'il est en place avant d'exécuter ce plan.

---

## 0. Contexte et objectif

Les trois guides pédagogiques (SOLO 5 pages, ACP 3 pages, RàI 4 pages) sont accessibles par des boutons contextuels : cartes de **Labo → Outils d'observation**, bouton « ? » de la catégorie Compréhension (palette d'annotation), bouton « Guide RàI » (module Interventions). C'est une découvrabilité **contextuelle** : on trouve les guides si on fréquente déjà ces zones. L'entrée changelog 1.1 les annonce, mais une annonce de Nouveautés est éphémère.

Objectif : ancrer l'existence des guides à trois endroits **proactifs** — la bannière de bienvenue de l'accueil, la visite guidée, le système d'assistance (popups + glossaire).

## 1. Décisions actées (Grégoire, 4 juin 2026)

1. **Accueil** : mention + bouton dans la **bannière de bienvenue** (pas de 5e demi-carte — la grille 2×2 Utilitaires|Aide reste intacte).
2. **Visite guidée** : **7e étape « Labo »** couvrant les sous-sections `labo-*` — règle en même temps le trou de couverture actuel (aucune étape ne couvre la section Labo).
3. **Assistance** : boutons « Ouvrir le guide » dans les **popups** pertinentes **et** renvois dans les entrées de **glossaire** SOLO / RàI / ACP.

Compromis assumé : chez les utilisateurs qui ont replié la bannière (`banniereAccueilRepliee`), la mention accueil ne sera vue qu'au dépliage. Les deux autres ancrages compensent.

---

## 2. Lot 0 — Préalable moteur : `data-param` sur les sections de type `action`

**Fichier** : `js/accompagnement.js`, fonction `rendreSectionAide`, `case 'action'` (~ligne 778-779).

**État actuel** :
```javascript
case 'action':
    return `<div class="aide-action"><button class="btn btn-primaire" data-action="${section.action}">${section.libelle}</button></div>`;
```

Le bouton ne porte pas de `data-param` : impossible d'appeler `ouvrirGuidePedagogique('solo')`. **Modification** (rétro-compatible, le champ est optionnel) :

```javascript
case 'action':
    return `<div class="aide-action"><button class="btn btn-primaire" data-action="${section.action}"${section.param ? ` data-param="${section.param}"` : ''}>${section.libelle}</button></div>`;
```

Sécurité : `section.action` / `section.param` / `section.libelle` viennent exclusivement des catalogues statiques (`accompagnement-contenu-*.js`) — aucune donnée utilisateur, pas d'`echapperHtml()` requis (même statut que le reste du moteur). Ne pas introduire de mécanisme d'évaluation dynamique.

**Vérifier après coup** : les popups existantes utilisant `type: 'action'` (au moins `demarrerTourDepuisAide`) fonctionnent toujours (le champ `param` absent → aucun attribut ajouté).

---

## 3. Lot 1 — Bannière de bienvenue (accueil)

**Fichier** : `js/accueil.js`, fonction `genererBanniereBienvenue()` (~lignes 55-90).

Insérer un court paragraphe **entre** le paragraphe « Par où commencer ? » et le bloc Communauté, et un bouton secondaire à côté du bouton « Commencer la visite guidée » :

```javascript
<p><strong>Comprendre les cadres de l'app.</strong> Trois guides pédagogiques expliquent en quelques pages la taxonomie SOLO, les micro-données ACP et le modèle RàI — accessibles en tout temps par les boutons « Guide » des Outils d'observation.</p>
```

Dans `banniere-bienvenue-actions`, après le bouton existant :

```javascript
<button class="btn btn-secondaire" data-action="naviguerAccueilCarte" data-param="labo|labo-accompagnement">
    Voir les guides pédagogiques
</button>
```

**Points à vérifier à l'exécution** :
- Le format exact du `data-param` de `naviguerAccueilCarte` : les cartes existantes utilisent `"suivi|suivi-groupe"` (section|sous-section préfixée). Pour Labo → Outils d'observation, l'id de sous-section dans `config.js` est `accompagnement` (ligne ~67) ; confirmer si la forme attendue est `labo|labo-accompagnement` ou `labo|accompagnement` en lisant `naviguerAccueilCarte()` (`accueil.js` ~ligne 314).
- Disposition des deux boutons dans `banniere-bienvenue-actions` sur mobile (<768px) : empilage acceptable, pas de débordement.
- Ton : tutoiement, « étudiant·es », pas d'anglicismes (conventions de la refonte des textes).

---

## 4. Lot 2 — Visite guidée : 7e étape « Labo »

**Fichier** : `js/accompagnement.js`, constante `ETAPES_TOUR` (~ligne 1052).

### 4.1 Décision de structure : ajouter en fin, ne PAS renuméroter

Les étapes persistent leur état (`tourGuide_etape`, `tourGuide_etapes_vues`) par **id numérique**. Renuméroter casserait l'état des utilisateurs en cours de visite. La nouvelle étape prend **l'id 6**, après « Alignement et plan de leçon (optionnel) » (id 5). Les deux étapes finales sont « optionnelles », la cohérence narrative est préservée : le tronc commun (0-4) puis deux approfondissements.

### 4.2 Contenu proposé

```javascript
{
    id: 6,
    titre: 'Labo (optionnel)',
    texte: "Le Labo regroupe les outils d'observation et d'analyse : c'est là que tu actives la taxonomie SOLO, les micro-données ACP et le dépistage RàI, et que tu règles leurs seuils.\n\nChaque cadre est expliqué par un guide pédagogique de quelques pages — bouton « Guide » sur chaque carte des Outils d'observation. Tu y trouveras aussi la modélisation, le rythme de travail, les études et le bilan réflexif.",
    correspond: function(idSousSection) {
        return typeof idSousSection === 'string' && idSousSection.indexOf('labo-') === 0;
    }
}
```

**Points à vérifier à l'exécution** :
- Le préfixe réel des ids de sous-sections Labo (`labo-accompagnement` ? consulter `config.js` et la fonction de navigation — même vérification que Lot 1).
- Que le rendu du panneau de tour (`panneau-tour-guide`, dots, compteur d'étapes) dérive bien sa longueur de `ETAPES_TOUR.length` et n'a aucun « 6 » codé en dur (étapes 0-5). Grep `ETAPES_TOUR.length`, et chercher des littéraux `5` ou `6` suspects autour des lignes 1125-1300.
- Que `tourEstComplete()` / la logique de complétion ne suppose pas un nombre fixe d'étapes vues. Si la complétion est déjà enregistrée chez des utilisateurs (`tourGuide_complete === true`), l'ajout d'une étape ne doit PAS les faire repasser en « visite incomplète » — vérifier le calcul et documenter le comportement choisi.
- Le texte de l'étape 0 (« Bienvenue ») énumère un parcours ; vérifier s'il faut y toucher (probablement non).

---

## 5. Lot 3 — Assistance : boutons « Ouvrir le guide » dans les popups

**Fichiers** : `js/accompagnement-contenu-popup.js` (catalogue), aucun changement moteur au-delà du Lot 0.

### 5.1 Forme de l'ajout

Dans chaque entrée retenue, ajouter en **dernière section** :

```javascript
{ type: 'action', action: 'ouvrirGuidePedagogique', param: 'rai', libelle: 'Ouvrir le guide RàI' }
```

(adapter `param` et `libelle` : `solo` / `acp` / `rai`).

### 5.2 Entrées candidates (inventaire à compléter à l'exécution)

Repérées par grep le 4 juin — l'exécutant DOIT refaire l'inventaire (`grep -n "solo\|rai\|acp\|depistage" js/accompagnement-contenu-popup.js`) :

| Clé popup | Guide à lier | Justification |
|---|---|---|
| `tableau-bord-rai` (~l. 274) | `rai` | Explique le dépistage RàI du tableau de bord |
| `interventions-planification` (~l. 678) | `rai` | Planification d'intervention = cœur RàI |
| `depistage-interpretation` (~l. 854) | `rai` (et/ou `solo`) | Interprétation du dépistage — juger sur pièce |
| `grille-niveau-solo` (~l. 1066) | `solo` | Attribut niveau SOLO des critères de grille |
| Popups des cartes de Labo → Outils d'observation (si existantes) | selon carte | Compléter l'inventaire |

Critère d'inclusion : la popup explique un concept que le guide approfondit. Ne PAS l'ajouter aux popups purement opérationnelles (boutons, formulaires) — maximum ~6 popups au total pour éviter la dilution.

**Interaction à tester** : ouvrir un guide depuis une popup d'aide → la popup d'aide doit se fermer ou laisser le guide lisible au-dessus (z-index du panneau guides : 600 ; vérifier le z-index des popups d'aide ; ajuster le comportement — fermer la popup avant d'ouvrir le guide est probablement le plus propre, par exemple en faisant pointer `action` vers une mini-fonction du module guides qui ferme la popup puis ouvre le guide, OU en vérifiant l'empilement réel).

---

## 6. Lot 4 — Glossaire : renvois vers les guides

**Fichiers** : `js/accompagnement-contenu-terme.js` (catalogue) + `js/accompagnement.js` (rendu des fiches de terme).

### 6.1 Mécanisme

Ajouter un champ optionnel `guide: 'solo' | 'acp' | 'rai'` aux entrées de terme. Dans la fonction de rendu des fiches (à localiser : celle qui affiche `terme`, `definition`, `voir`), si `entree.guide` est présent, ajouter sous la définition :

```javascript
<button class="btn btn-secondaire" data-action="ouvrirGuidePedagogique" data-param="${entree.guide}">Ouvrir le guide</button>
```

(contenu de catalogue statique — pas de donnée utilisateur).

### 6.2 Entrées candidates (inventaire à refaire à l'exécution)

- `solo` (terme « SOLO », ~l. 270) → `guide: 'solo'`
- entrée IDME (~l. 266, « Quatre niveaux de performance alignés sur la taxonomie SOLO ») → `guide: 'solo'`
- « Pattern d'apprentissage » (~l. 218) → `guide: 'rai'`
- entrées RàI / palier / intervention si elles existent → `guide: 'rai'`
- entrées ACP / Assiduité / Complétion / Performance si elles existent → `guide: 'acp'`

Attention : `ACO` (Actions Cognitives Observées, ~l. 279) ≠ ACP — ne pas lier.

**Couplage signalé** : la « passe guides » différée de la refonte des textes (fusion des glossaires statique/dynamique, cf. SESSION.md) touchera ce même fichier. Si elle est exécutée d'abord, refaire l'inventaire ; les deux chantiers sont compatibles mais ne pas les exécuter en parallèle.

---

## 7. Ordre d'exécution recommandé

1. Lot 0 (moteur `data-param`) — tout le reste en dépend pour les popups/glossaire.
2. Lot 3 (popups) puis Lot 4 (glossaire) — valident le Lot 0.
3. Lot 2 (visite guidée).
4. Lot 1 (bannière accueil).
5. Tests fonctionnels (§8), changelog, version.

## 8. Tests fonctionnels

1. **Popups** : chaque popup enrichie affiche le bouton ; le clic ouvre le bon guide à la page 1 ; gestion de l'empilement popup/guide validée ; les popups `action` préexistantes (sans `param`) fonctionnent toujours.
2. **Glossaire** : chaque terme enrichi affiche le bouton ; le clic ouvre le bon guide ; les termes sans `guide` sont inchangés.
3. **Visite guidée** : la 7e étape apparaît en naviguant vers une sous-section Labo ; dots/compteur cohérents ; un utilisateur avec visite déjà complétée ne régresse pas ; étape accessible au clavier.
4. **Bannière accueil** : paragraphe + bouton visibles dépliée ; le bouton navigue vers Labo → Outils d'observation ; état replié inchangé ; mobile <768px sans débordement.
5. **Modes** : sombre et clair pour chaque surface touchée.
6. **Modes spéciaux** : anonymisation, démo, trimestre archivé — tout reste accessible.

## 9. Hors-périmètre et vigilance

- **Zones protégées intouchées** : `js/config.js`, `js/navigation.js`, `noms_stables.json` — la 7e étape vit dans `accompagnement.js`, la navigation de la bannière passe par le helper existant.
- Pas de nouvelle préférence, pas de nouveau panneau, pas de modification du module `guides-pedagogiques.js` (sauf si l'option « fermer la popup avant d'ouvrir le guide » du §5.2 est retenue — la documenter alors dans l'en-tête du module).
- `console.warn`/`console.error` uniquement ; aucun module sensible touché → pas de test Vitest/Playwright requis, mais lancer `cd tests && npm test` avant commit (sentinelles globales).
- **Changelog** : si exécuté avant la release du chantier guides, compléter l'entrée `1.1` existante (1 item : « Les guides sont signalés dans l'accueil, la visite guidée et l'aide contextuelle ») ; sinon, entrée du minor suivant. Numéro de version : intention `minor`, à confirmer avec Grégoire avant `node scripts/release.mjs`.
- **Fin de session** : mettre à jour SESSION.md (relais) et exécuter le rituel de fin de session.

---

**Fin du plan**

*Ce plan complète le chantier guides du 4 juin 2026 (module `js/guides-pedagogiques.js` + conditionnement de la catégorie Compréhension). Contenu de référence des guides : `REVISION_contenu_guides_SOLO-ACP-RAI.md`.*
