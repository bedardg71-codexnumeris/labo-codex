# Consigne de démarrage — Session d'audit et uniformisation du système d'accompagnement

**Copier-coller ce texte comme premier message dans la nouvelle session Claude Code.**

---

## Contexte

Tu travailles sur Labo Codex (application pédagogique HTML/CSS/JS pur, hors ligne). Une refonte complète des textes d'accompagnement vient d'être implémentée. Un audit de vérification a été conduit. Le rapport d'audit est dans `docs/refonte-textes/RAPPORT-AUDIT-ACCOMPAGNEMENT.md`. Lis-le en premier.

## Lecture obligatoire AVANT de commencer

1. `CLAUDE.md` (racine) — contraintes techniques, sécurité, procédures
2. `docs/refonte-textes/RAPPORT-AUDIT-ACCOMPAGNEMENT.md` — résultats de l'audit, constats précis avec fichiers et numéros de lignes
3. `docs/refonte-textes/palette-accompagnement.md` — les 26 variables CSS `--acc-*` à ajouter, composants concernés, règles d'application
4. `docs/refonte-textes/AUDIT-POST-IMPLEMENTATION.md` — checklist détaillée (6 axes), critères de réussite

## Ta mission

Corriger les écarts identifiés par l'audit, dans cet ordre :

### Phase 1 — Palette visuelle (critique)

Le système d'accompagnement doit avoir une apparence orange identique en mode sombre et mode clair. Les 26 variables `--acc-*` définies dans `palette-accompagnement.md` n'existent pas encore dans `styles.css`.

1. **Ajouter les 26 variables `--acc-*` dans `:root`** de `styles.css` (PAS dans `.mode-clair`). Copier exactement les valeurs de `palette-accompagnement.md`.

2. **Remplacer les couleurs en dur** des composants d'accompagnement dans `styles.css` par les variables `--acc-*`. Composants concernés (avec les lignes approximatives du rapport) :
   - `.primo-popup-header` (~l.10611) : fond `#244858` → `var(--acc-surface)`, texte `white` → `var(--acc-btn-prim-txt)`
   - `.primo-popup-close` (~l.10631) : `white` → `var(--acc-btn-prim-txt)`
   - `.primo-overlay` (~l.10676) : `rgba(0,0,0,0.5)` → garder tel quel (c'est un overlay global, pas spécifique à l'accompagnement)
   - `.panneau-tour-guide .tour-header` (~l.22930) : fond → `var(--acc-surface)`, texte → `var(--acc-btn-prim-txt)`
   - `.tour-dot` (3 états ~l.22949-22959) : inactif → `var(--acc-dot-inactif)`, actif → `var(--acc-dot-actif)`, vu → `var(--acc-dot-vu)`
   - `.tour-fermer` (~l.22968-22977) : `#fff` → `var(--acc-btn-prim-txt)`
   - `.etat-vide-banniere` (~l.22792) : fond → `var(--acc-fond)`, bordure → `var(--acc-bordure)`, texte → `var(--acc-texte)`
   - `.glossaire-fiche-etape-*` (~l.23217-23221) : les badges d'étape par couleur sémantique — à adapter aux variables `--acc-*` ou garder comme couleurs sémantiques si justifié (ce sont des badges de catégorie, pas de l'accompagnement orange pur)
   - `.mode-clair .primo-popup-header` (~l.20016) : **SUPPRIMER cette redéfinition** — la palette accompagnement ne change pas entre les modes

3. **Appliquer `var(--acc-fond)` (#e8923a) comme fond principal** de tous les composants d'accompagnement :
   - `.primo-popup` (popup 📍)
   - `.panneau-tour-guide`
   - `.etat-vide-banniere`
   - `.banniere-bienvenue` (bannière d'accueil)
   - `.transition-toast`
   - `.tooltip-bulle`
   - `.glossaire-popup`

4. **Consulter l'ébauche visuelle** `ebauches-accompagnement.html` (racine) pour la référence visuelle de chaque composant.

### Phase 2 — Éliminer les styles inline

5. **`aide-contextuelle-contenu.js` lignes 391-393** : remplacer les 3 `style='color: var(--xxx)'` par des classes CSS. Créer dans `styles.css` :
   ```css
   .badge-locale { color: var(--vert-succes); }
   .badge-bibliotheque { color: var(--bleu-clair); }
   .badge-retiree { color: var(--orange-accent); }
   ```
   Et dans le JS : `<strong class="badge-locale">` etc.

6. **`accueil.js`** : les ~15 attributs `style=` (margin, display, font-size, gap, etc.) doivent être convertis en classes CSS dans `styles.css`. Identifier chaque `style=`, créer une classe nommée, appliquer la classe.

### Phase 3 — Terminologie IPB → ACO

7. **`tooltips-contenu.js` ligne 119** : remplacer «profil RLO» par «profil ACO».

8. **`profil-etudiant.js` ligne 6190** : remplacer le titre UI `Profil RLO (actions cognitives observées)` par `Profil ACO (actions cognitives observées)`.

9. **`aide-contextuelle-contenu.js` lignes 627 et 635** : remplacer les mentions d'«IPB» par «le nombre d'artefacts consécutifs sous le seuil» ou une formulation équivalente en langage clair (pas de sigle technique pour l'utilisateur).

10. **Commentaires** dans `evaluation.js` (l.2286, 5955), `profil-etudiant.js` (l.6177, 6441), `actions-rlo.js` (l.2, 13, 25, 146, 207) : remplacer «Profil RLO» par «Profil ACO» dans les commentaires. Le nom de la fonction `calculerIPB()` peut rester (c'est interne).

### Phase 4 — Vérification

11. **Tester les deux modes** (sombre et clair) — les composants d'accompagnement doivent avoir la même apparence dans les deux.

12. **Vérifier** qu'aucun `console.log` n'a été ajouté (seulement `console.warn` / `console.error`).

13. **Vérifier** qu'aucun handler inline (`onclick=`, `onchange=`) n'a été introduit.

## Règles strictes

- **Zéro couleur en dur** dans les composants d'accompagnement — uniquement des `var(--acc-*)`.
- **Zéro `style=` inline** dans le HTML généré par les fichiers d'accompagnement (sauf positionnement dynamique `.style.left`/`.style.top` pour les popups).
- **Zéro redéfinition** des variables `--acc-*` dans `.mode-clair` — elles sont globales.
- **Ne pas toucher au contenu textuel** des tooltips, du tour guidé, des états vides, des transitions, du glossaire — il est validé et conforme.
- **Ne pas inventer de texte** — si un texte doit changer (IPB→ACO), utiliser exactement les formulations indiquées ci-dessus.
- Respecter les contraintes de `CLAUDE.md` : `echapperHtml()` pour innerHTML avec données utilisateur, pas de `console.log`, pas de handlers inline.

## Ce qui est HORS PÉRIMÈTRE de cette session

- Les 26 entrées hors périmètre de `aide-contextuelle-contenu.js` (sauf les 2 mentions d'IPB à corriger) — Grégoire décidera plus tard.
- L'entrée `interventions-planification` (cycle teach-test-revise-test) — à traiter séparément.
- Les tests fonctionnels des états vides (Axe 2 de l'audit) — requièrent un test en contexte avec données démo.
- Les 4 clés COMPLEMENT des tooltips — elles sont valides, pas besoin de les modifier.

## Fichiers à modifier

| Fichier | Modifications |
|---------|--------------|
| `styles.css` | Ajouter 26 variables `--acc-*` dans `:root`, remplacer couleurs en dur, supprimer redéfinition `.mode-clair`, ajouter classes pour badges et accueil |
| `js/aide-contextuelle-contenu.js` | Lignes 391-393 (classes au lieu de style=), lignes 627+635 (IPB→langage clair) |
| `js/accueil.js` | Remplacer ~15 `style=` par des classes |
| `js/tooltips-contenu.js` | Ligne 119 (RLO→ACO) |
| `js/profil-etudiant.js` | Ligne 6190 (titre UI RLO→ACO), commentaires |
| `js/evaluation.js` | Commentaires (RLO→ACO) |
| `js/actions-rlo.js` | Commentaires (RLO→ACO) |
