# Demande de relecture – « Apporter mon matériel », étape 6 du plan : « Aller plus loin avec ta grille »

> Claude Code, samedi 17 octobre 2026, vers 13 h 05 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-6-aller-plus-loin.md` (12 h 07), via `CONSIGNE-DU-JOUR.md` (12 h 48). Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Un commit local, non poussé : `1c1868e0`**, au-dessus de `af523ee5`. Aucun push, aucune release, aucun verdict complet (étape 8). Je passe à l'étape 5b sans attendre ta relecture, comme le veut la consigne du jour.

## État mesuré

- Vitest complet, depuis `tests/` : **769 fichiers, 9 085 essais, verts**.
- Banc neuf `tests/unit/materiel-etape6-plus-loin.test.js` : 8 essais, sur le résumé que rend la **vraie** création (`materielCreation.creer`) pour trois grilles : en points, à niveaux, à niveaux avec rétroactions. **11 mutations, 11 rouges**, restaurées.
- Spec neuve `tests/integration/materiel-etape6-plus-loin.spec.js`, lancée seule dans WebKit : une grille en points collée → « Créer ma grille » → l'encadré, ses textes, le lien (≥ 44 px de haut) → l'aide « Type de critère d'évaluation » s'ouvre, avec ses trois types → « Fermer ». Deux fois : **assistance active** (le défaut) et **désactivée**. **3 mutations, 3 rouges** dans les deux états. Ce n'est pas le verdict.
- Avec ce commit, les fichiers de Cowork : la consigne du jour et son archive, les consignes 6 et 5b, la proposition (relue : structure seulement), le plan. `CONSIGNE-DEMARRAGE-COWORK.md` : laissé.

## Ce que j'ai fait, et ce que j'ai supposé

1. **L'encadré**, `<aside>` nommé par son titre (`h3`), sous les cartes et avant « Pour t'en servir… », dans les deux confirmations. Bordure gauche d'accent, comme une information ; il ne concurrence pas « Aller aux productions ».
2. **Le paragraphe** : `resume.enPoints` → « en points » ; sinon, `resume.retro` faux → « à niveaux » ; `resume.retro` vrai → rien, la phrase commune seule (**ta supposition, appliquée**, à dire à Grégoire).
3. **Les textes**, mot pour mot, avec une seule différence : l'apostrophe typographique (’), celle de tout l'onglet, au lieu de la droite de la consigne.
4. ⚠ **Le lien n'emprunte pas `.primo-aide[data-target]`**, contre la lettre de la consigne. Mesuré :
   - `gererClicPrimo` (`accompagnement.js` ~938) cherche `document.getElementById('grille-type-critere-detail')`. Aucun élément ne porte cet identifiant : la clé vit au **catalogue** (`accompagnement-contenu-popup.js`), qu'ouvre `afficherAideContextuelle(clé)`.
   - Et `.primo-aide` est `display: none !important` quand l'assistance est désactivée.
   - La mutation « forme de la consigne » (un `span.primo-aide` avec `data-target`) fait échouer la spec **même assistance active** : le clic n'ouvre rien.
   - Choisi : un bouton `materiel-btn-lien`, `data-action="afficherAideContextuelle"`, `data-param="grille-type-critere-detail"`, par le dispatcher de `main.js`. Même aide, même clé, aucun code neuf dans l'accompagnement.

## Disposition des trouvailles

- **L'icône « i » du type de critère dans Grilles de critères** (`grilles.js` ~3406 et ~4780) emprunte le même `.primo-aide[data-target="grille-type-critere-detail"]` : **d'après la mutation ci-dessus, elle n'ouvre rien non plus**. C'est une inférence : je ne l'ai pas cliquée dans l'éditeur. Code étranger, symptôme que Grégoire n'a pas signalé : **ni inscrit ni corrigé** (règle du BACKLOG du 24 août). À toi de voir si elle mérite une mesure.
- **Commenter et oublier** : `afficherAideContextuelle` note son déclencheur *après* avoir focalisé « Fermer » ; à la fermeture, le focus ne revient donc pas au lien. Clavier seulement, toutes les aides de l'application. Non touché.

## Textes provisoires neufs (pour l'étape 7)

Aucun : les textes de l'encadré sont ceux que Grégoire a validés à 12 h 07.

## Pour toi

Relecture de l'étape 6. L'étape 5b est en cours.
