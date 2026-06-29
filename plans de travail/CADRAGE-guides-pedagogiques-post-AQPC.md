# Cadrage — Chantier « Guides pédagogiques » (post-AQPC)

**Date** : 2 juin 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Statut** : Document de cadrage — à valider avec Grégoire avant exécution
**Déclenchement** : post-AQPC (planification anticipée)
**Source de l'état des lieux** : audit du code (`index.html`, `js/`) + dossier `Plan Accompagnement/` (Cowork), le 2 juin 2026.

> But : réconcilier les **plans de mai** (encore valides sur le fond) avec **l'état réel du code** et avec les **décisions de la refonte des textes (2 juin)**, puis proposer une séquence d'exécution révisée. Ce document **remplace** le `LISEZ-MOI_orchestration_chantiers.md` (23 mai) comme point d'entrée du chantier guides — l'orchestration originale est dépassée par l'avancement et par l'évolution du périmètre.

---

## 1. Résumé exécutif

- L'**infrastructure des guides est à construire** : le module unifié `js/guides-pedagogiques.js` prévu par le plan-maître **n'existe pas**.
- Le **contenu est largement rédigé** dans les plans (SOLO, RàI, ACP, Enseignement explicite, PAN), mais il est **daté terminologiquement** (antérieur à la refonte des textes du 2 juin).
- Un **guide fonctionne déjà** : la carte d'alignement (8 pages, autonome dans `planification-carte.js`, partagé avec le Plan de la leçon).
- Le **périmètre PAN a grossi** depuis le plan-maître : 1 guide → 2 guides (RREC + CSÉ), plus un mini-guide « balises du cours ».
- Le **risque central** est de réintroduire, en intégrant les guides, le vocabulaire qu'on vient de corriger. Un **filtre terminologique** doit précéder toute intégration.

---

## 2. État réel vérifié

Légende : **[FAIT]** = vérifié dans le code ; **[INFÉRENCE]** = déduit de l'état observé.

### 2.1 Déjà implémenté

- **[FAIT] Guide « carte d'alignement »** — `GUIDE_PAGES` dans `planification-carte.js` : 8 pages (7 pédagogiques + 1 technique import/export), ouvert par `ouvrirGuide()`. Référence Anderson (2026). **Partagé** avec le Plan de la leçon (`organisateur.js`, bouton `org-btn-guide` → `planificationCarte.ouvrirGuide()`).
- **[FAIT] Chrome unifié** — navigation « Cadre / Conception / … » en place (ÉTAPE 1 de l'orchestration).
- **[FAIT] Page Outils d'observation uniformisée** — boutons « Guide » SOLO / ACP / RàI présents avec le patron `option-accompagnement-guide-btn` (`index.html` ~ l. 8793, 8962, 9076). ÉTAPE 2 largement réalisée.

### 2.2 Planifié mais NON implémenté

- **[FAIT] Module unifié `js/guides-pedagogiques.js` : ABSENT.** Pièce centrale (ÉTAPE 3). Jamais créé. La structure `GUIDES_PEDAGOGIQUES`, le panneau `#guide-pedagogique-panel` et les styles `guide-pedagogique-*` n'existent pas.
- **[FAIT] Boutons SOLO / ACP / RàI : morts.** `ouvrirGuideSolo`, `ouvrirGuideAcp`, `ouvrirGuideRai` n'apparaissent **que** comme `data-action` dans `index.html` — aucune définition JS. Cliquer ne fait rien.
- **[FAIT] Guides SOLO, RàI, ACP, Enseignement explicite, PAN** : contenu présent **dans les plans uniquement**, pas dans le code.

### 2.3 Conclusion d'étape

**[INFÉRENCE]** Le chantier s'est arrêté **entre l'ÉTAPE 2 (faite) et l'ÉTAPE 3 (jamais commencée)** de l'orchestration du 23 mai. Tout ce qui dépend du module unifié reste à faire.

---

## 3. Inventaire des plans et évolution du périmètre

### 3.1 Plans présents (`Plan Accompagnement/`)

| Document | Date | Rôle | Validité actuelle |
|---|---|---|---|
| `LISEZ-MOI_orchestration_chantiers.md` | 23 mai | Coordination maître | **Dépassé** (remplacé par le présent doc) |
| `PLAN_guides_pedagogiques.md` | 23 mai | Architecture du module + contenus Ens. explicite & PAN | Valide pour l'archi ; **§5 PAN partiellement dépassé** |
| `PLAN_taxonomie_SOLO.md` | 23 mai | SOLO : tampons + guide + éditeur d'échelle | Valide (contenu) |
| `PLAN_guide_RaI.md` | 23 mai | Guide RàI (contenu + accès) | Valide (contenu) |
| `PLAN_uniformisation_Accompagnement.md` | 23 mai | UI Accompagnement + guide ACP | UI **faite** ; contenu ACP valide |
| `PLAN_chrome_unifie_Labo_Codex.md` | 23 mai | Chrome/navigation | **Réalisé** |
| `PLAN_guide_PAN_refonte_RREC.md` | 29 mai | Guide PAN — cadre réglementaire RREC (id `pan-rrec`) | Valide ; **postérieur au plan-maître** |
| `PLAN_guide_PAN_pedagogique_CSE.md` | 29 mai | Guide PAN — pédagogique CSÉ + les 2 PAN (id `pan`) | Valide ; **postérieur au plan-maître** |
| `SPEC_mini-guide_cours_balises.md` | 29 mai | Mini-guide popup « balises du cours » (Cadre) | Valide ; **type différent** (popup, pas guide à pages) |

### 3.2 Inventaire des guides visés

Plan-maître (23 mai) : Alignement (**fait**), SOLO (5 p.), RàI (4 p.), ACP (3 p.), Enseignement explicite (4 p., nouveau), PAN (4 p., nouveau).
Cadres **exclus** par décision : ELLAC, SRPNF, RLO (personnels/expérimentaux).

### 3.3 Trois évolutions depuis le plan-maître (à intégrer)

1. **PAN : 1 → 2 guides.** Les specs du 29 mai scindent le guide PAN en deux : réglementaire (`pan-rrec`) et pédagogique (`pan`). **Le §5 du plan-maître est à considérer comme remplacé** par ces deux specs.
2. **Nouveau type — mini-guide popup.** `SPEC_mini-guide_cours_balises.md` cible l'**aide contextuelle** (`accompagnement-contenu-popup.js`), pas le module à pages. À traiter séparément du module unifié.
3. **Audit en attente — SRPNF codé en dur** (§7 du plan-maître). Hors-périmètre du chantier guides, mais à garder au radar.

---

## 4. Le décalage terminologique (risque central)

**Tous les plans sont antérieurs à la refonte des textes du 2 juin.** Leur contenu emploie encore le vocabulaire corrigé depuis. Avant **toute** intégration de contenu de guide, appliquer le **filtre terminologique** suivant (décisions des sessions de refonte, voir `RELAI-SESSION-refonte-textes.md` et `refonte-textes-aide.md`) :

| Dans les plans (daté) | Forme canonique (post-2 juin) |
|---|---|
| « carte mentale » | **carte d'alignement** |
| « PAN-Standards » / « PAN-Spécifications » | **PAN – Standards** / **PAN – Spécifications** (demi-cadratin) |
| sigle « PAN » développé en « Pratiques d'Appréciation Nuancée » | **Pratique Alternative de Notation** |
| « Dénombrement » | **Dénotation** (« PAN – Dénotation ») |
| « apprenant » | **étudiant·e** |
| « Réserve » (nom du concept) | **Archives** |
| « étudiants » / « étudiant·e·s » (deux points) | **étudiant·es** (un point) ; **enseignant·e** |
| renvois « Calendrier → … », « Structure », « Accompagnement » | **Cadre**, **Conception**, **Labo → Outils d'observation** (voir table dans `refonte-textes-aide.md` §A.1) |
| « snapshot » | **capture** / « Captures de progression » |

**Conséquence de planification** : prévoir une **passe de relecture terminologique du contenu de chaque guide** comme étape intégrée à l'extraction depuis les plans — pas comme correction après coup.

---

## 5. Décisions à prendre avant exécution

Recommandations indiquées ; **à valider par Grégoire**.

| # | Question | Options | Recommandation |
|---|---|---|---|
| D1 | Guide Alignement : migrer dans le module unifié ou laisser autonome ? | A : laisser dans `planification-carte.js` ; B : migrer dans `GUIDES_PEDAGOGIQUES.alignement` | **B** à terme (cohérence/maintenance unique), mais **après** que le module ait fait ses preuves sur 1-2 guides. Sinon A pour l'instant. |
| D2 | PAN : confirmer 2 guides (`pan` + `pan-rrec`) et l'abandon du §5 du plan-maître ? | Oui / Non | **Oui** — les specs du 29 mai sont plus récentes et plus précises. |
| D3 | Mini-guide « balises du cours » : dans ce chantier ou avec la passe guides (popups) ? | Chantier guides / Passe guides | **Passe guides** (c'est un popup d'aide contextuelle, infrastructure différente). |
| D4 | Reconfirmer les cadres exclus (ELLAC, SRPNF, RLO = pas de guide) ? | Oui / Réviser | **Oui** (cohérent avec la décision de mai), à reconfirmer. |
| D5 | Filtre terminologique : intégré à l'extraction ou passe séparée ? | Intégré / Séparé | **Intégré** (éviter une seconde passe). |
| D6 | Le module unifié absorbe-t-il aussi le glossaire dynamique (`accompagnement-contenu-terme.js`) ou reste-t-il distinct ? | Fusionner / Distinct | **Distinct** pour ce chantier (le glossaire relève de la passe guides du relai) — à réévaluer ensuite. |

---

## 6. Séquence d'exécution révisée

Tient compte de l'état réel (ÉTAPE 1-2 faites) et du périmètre élargi.

```
ÉTAPE A — Construire l'infrastructure (ex-ÉTAPE 3)
          js/guides-pedagogiques.js : structure GUIDES_PEDAGOGIQUES,
          panneau #guide-pedagogique-panel, styles guide-pedagogique-*,
          ouvrirGuidePedagogique('id'). Tester avec un guide factice.
          ↓ (validation Grégoire)
ÉTAPE B — Activer les boutons morts en branchant les guides existants
          Définir ouvrirGuideSolo/Acp/Rai → ouvrirGuidePedagogique(...).
          Intégrer les contenus SOLO (5 p.), RàI (4 p.), ACP (3 p.)
          AVEC filtre terminologique (section 4).
          ↓ (validation Grégoire)
ÉTAPE C — Nouveaux guides de planification/évaluation
          Enseignement explicite (4 p.) + préférence par défaut/override.
          PAN : 2 guides (pan, pan-rrec) selon specs du 29 mai.
          AVEC filtre terminologique.
          ↓ (validation Grégoire)
ÉTAPE D — (optionnel/différé) Migration du guide Alignement (D1=B)
          + tampons SOLO et intégration éditeur d'échelle
          (PLAN_taxonomie_SOLO.md §3 et §5, indépendants du module).
          ↓ (validation Grégoire)
ÉTAPE E — Tests fonctionnels, accessibilité (2 modes), commit.
```

**Hors de cette séquence** (passe guides du relai) : mini-guide « balises du cours », fusion des glossaires, tooltips `data-tooltip`, réconciliation du naming dans `accompagnement-contenu-terme.js`.

---

## 7. Articulation avec la « passe guides » de la refonte des textes

Le `RELAI-SESSION-refonte-textes.md` (§7) a différé une **passe guides** qui chevauche ce chantier. Pour éviter le double travail :

- **Ce chantier** = créer/intégrer les guides **à pages** (module unifié + contenus).
- **Passe guides du relai** = prose dynamique d'aide contextuelle (`*-contenu-*.js`), tooltips, fusion des glossaires, mini-guide popup.
- **Point commun** : le filtre terminologique (section 4) s'applique aux deux. Le faire une fois, de façon cohérente.

**Recommandation** : traiter ce chantier guides **avant** la passe guides contextuelle, car le module unifié peut clarifier où va quel contenu (guide à pages vs popup vs tooltip).

---

## 8. Contraintes projet (rappel — `CLAUDE.md`)

- **Zones protégées** : ne pas toucher `config.js`, `navigation.js`, `noms_stables.json`. Aucun guide n'en a besoin ; si un besoin apparaît, **arrêter et demander**.
- **Sécurité** : `echapperHtml()` sur tout `innerHTML` de données utilisateur ; zéro handler inline (`data-action`/`data-on-change`) ; pas de `console.log` ; tests sécurité si module sensible touché (a priori non).
- **Design** : variables CSS de `styles.css` (pas de couleur en dur) ; contraste WCAG AA dans les deux modes ; cibles tactiles ≥ 44 px ; focus clavier visible.
- **Zéro-dette** : si on migre le guide Alignement (D1=B), **retirer** l'ancien code de `planification-carte.js` dans la même étape (pas d'alias « au cas où »).
- **Commit** : demander le numéro de beta ; mettre à jour `version.json`, les fallback `js/init-inline.js`, le snapshot `js/main.js`, et le changelog (`js/changelog-data.js`).

---

## 9. Points ouverts à confirmer avec Grégoire

- D1 à D6 (section 5).
- Validité finale du contenu des plans (certains passages pédagogiques peuvent avoir évolué dans la tête de Grégoire depuis mai — à relire avant intégration).
- Référence académique du **sigle PAN** : le plan-maître note « interne, à confirmer » pour la catégorie PAN ; les specs du 29 mai (RREC/CSÉ) apportent des références — vérifier la cohérence.
- Calendrier réel : « post-AQPC » — fixer la fenêtre d'exécution.

---

*À conserver à la racine du dépôt comme point d'entrée du chantier guides. Met à jour ce document si les décisions D1-D6 changent la séquence.*
