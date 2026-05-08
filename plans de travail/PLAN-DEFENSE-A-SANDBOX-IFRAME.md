# PLAN — Défense A · Sandbox iframe pour l'aperçu d'objets importés

> **Contexte sécurité** : Phase 1 du modèle de menaces.
> **Référence** : `docs/securite/MODELE-MENACES.md` §7 (scénario D-01, défense P1) + `§8.2 Phase 1` + `docs/securite/audits/AUDIT-INNERHTML-FINDINGS-2026-05-06.md` (recommandation principale).
> **Validé** : 8 mai 2026 par Grégoire.
> **Effort estimé** : 4-5 jours.

---

## 1. Pourquoi Défense A

L'audit `innerHTML` du 6 mai (E-β) a montré que :

- La dette `innerHTML` réelle est **faible** (la quasi-totalité des cas suspects sont des faux positifs ou utilisent déjà `echapperHtml`).
- Mais **103 cas suspects restent à examiner** dans les modules non prioritaires — surface trop large pour migrer un par un.
- **Recommandation principale du rapport E-β** : prioriser Défense A (sandbox iframe) plutôt que la migration unitaire — la sandbox neutralise la **mécanique** I-01 sous-jacente, pas chaque exploitation individuelle.

Conséquences :
- **Couvre simultanément D-01, X-01 et I-01** (cf. tableau §6 du modèle de menaces).
- **Indépendante du taux de couverture `echapperHtml`** : même si on en oublie, le payload n'a aucun accès au contexte parent.
- **Élimine la fenêtre vulnérable critique** : actuellement, `genererBadgeCC` est appelé par les 6 modals d'aperçu d'import **avant** le passage par le pipeline d'assainissement (la sanitisation se fait au moment d'`ajouter*ALaBibliotheque`, pas au chargement initial pour l'aperçu). Le fix `echapperHtmlCC` du 6 mai mitige déjà ce trou, mais la sandbox élimine la mécanique d'exploitation entière.

---

## 2. Surface couverte (v1)

**6 modals d'aperçu d'import** (un par bibliothèque) qui appellent tous `genererBadgeCC(donnees.metadata)` :

| Module | Ligne (au 8 mai) | Bibliothèque |
|---|---|---|
| `js/grilles.js` | :1958 | Grilles |
| `js/echelles.js` | :2166 | Échelles |
| `js/productions.js` | :2966 | Productions |
| `js/cartouches.js` | :1785 | Cartouches |
| `js/pratiques-materiel.js` | :2024 | Pratiques |
| `js/travaux-outils.js` | :2917 | Tampons |

**Hors scope v1** (à reporter en v2 si besoin) :
- Aperçu interne de grille existante dans `evaluation.js`, `wizard-pratique-v2.js`. Risque secondaire (pas de payload externe à l'usage normal — les grilles déjà installées sont passées par la sanitisation à l'import).

---

## 3. Décisions validées (8 mai 2026)

1. **Périmètre v1** : 6 modals d'aperçu d'import seulement.
2. **Mécanisme d'injection** : `srcdoc` (HTML inline dans l'iframe). Plus simple, fonctionne en `file://`, pas de cleanup `URL.revokeObjectURL` à gérer.
3. **Fix existants conservés** : `echapperHtmlCC` ajouté dans `genererBadgeCC` le 6 mai reste en place (défense en profondeur).
4. **Style de l'iframe** : minimal mais cohérent avec le DS — on injecte un petit `<style>` dans le srcdoc avec les variables CSS nécessaires, passé en option par le parent (pour propagation dark/light).

---

## 4. Architecture cible

### 4.1 Composant `js/securite-apercu-sandbox.js` (nouveau, ~200-300 lignes)

API publique :

```js
window.ApercuSandbox = {
    afficher: function(conteneur, htmlContenu, opts) { ... },
    fermer: function(conteneur) { ... }
};
```

Paramètres :
- `conteneur` (DOM element) : où monter l'iframe
- `htmlContenu` (string) : le HTML à afficher (le badge CC + le contenu pédagogique)
- `opts` (object) :
  - `themeClair` (bool) : forcer le mode clair pour les variables CSS injectées
  - `hauteurMin` (number, default 100) : hauteur minimum de l'iframe
  - `hauteurMax` (number, default 600) : hauteur maximum (au-delà, scroll interne)

Construction de l'iframe :

```js
var iframe = document.createElement('iframe');
iframe.setAttribute('sandbox', 'allow-scripts');  // sans allow-same-origin
iframe.style.width = '100%';
iframe.style.border = 'none';
iframe.style.minHeight = (opts.hauteurMin || 100) + 'px';

var srcdoc = _construireSrcdoc(htmlContenu, opts);
iframe.setAttribute('srcdoc', srcdoc);
```

Le `srcdoc` contient :
- Un `<style>` inline avec les variables CSS du DS (--bleu-principal, --texte-principal, --surface-carte, etc.)
- Le `htmlContenu` injecté tel quel (rappel : sans `allow-same-origin`, même un payload XSS qui réussit ne peut rien faire)
- Un petit script de communication parent ↔ iframe pour la hauteur dynamique :

```html
<script>
  // Dans l'iframe : envoie sa hauteur au parent quand le contenu change
  function envoyerHauteur() {
    parent.postMessage({
      source: 'apercu-sandbox',
      type: 'hauteur',
      valeur: document.documentElement.scrollHeight
    }, '*');
  }
  new ResizeObserver(envoyerHauteur).observe(document.body);
  envoyerHauteur();
</script>
```

Côté parent : écouteur `postMessage` qui ajuste `iframe.style.height` (clamp entre hauteurMin et hauteurMax).

### 4.2 Sécurité

- **`sandbox="allow-scripts"` sans `allow-same-origin`** : l'iframe a son propre origin (`null`). Pas d'accès à IndexedDB du parent, pas de `localStorage`, pas de cookies, pas de DOM parent.
- **`postMessage` filtré** : le parent vérifie `event.data.source === 'apercu-sandbox'` et `event.data.type === 'hauteur'` avant d'agir. La valeur de hauteur est clampée numériquement (pas d'effet de bord possible).
- **Pas de communication retour** : on n'envoie jamais de données du parent vers l'iframe après création (le contenu est dans le `srcdoc` initial).

---

## 5. Sous-phases

### SP1 — Composant autonome + démo (~1 j)

**Livrable** :
- `js/securite-apercu-sandbox.js` (composant complet)
- `prototype-apercu-sandbox.html` à la racine (démo autonome avec test payload XSS)
- Tag `<script>` ajouté dans index.html (à charger après init-inline)
- Test manuel : injecter `<img src=x onerror="alert('XSS dans iframe — devrait être ALERT bloqué par CSP iframe ou exécuté dans bulle vide')">` dans le démo → vérifier qu'aucun effet ne touche le parent (pas d'accès `localStorage`, pas de `parent.document`).

**Validation** :
- L'iframe affiche correctement le contenu HTML (badge CC + grille).
- Hauteur dynamique fonctionne (scroll interne au-delà de `hauteurMax`).
- Mode clair / sombre cohérents.
- Test payload XSS : `try { parent.localStorage.getItem('h2026_groupeEtudiants') } catch(e) { ... }` lève une `SecurityError` (cross-origin).

### SP2 — Intégration dans les 6 modals d'aperçu d'import (~2 j)

Pattern à appliquer dans chacun des 6 fichiers identifiés :

**Avant** (exemple `grilles.js:1958`) :
```js
modal.querySelector('.contenu-modal').innerHTML =
    '<div class="u-mb-15">' + genererBadgeCC(donnees.metadata) + '</div>' +
    '<div class="contenu-grille">' + html + '</div>';
```

**Après** :
```js
var conteneur = modal.querySelector('.contenu-modal');
conteneur.innerHTML = '';  // vider
var htmlAutonome =
    '<div class="u-mb-15">' + genererBadgeCC(donnees.metadata) + '</div>' +
    '<div class="contenu-grille">' + html + '</div>';
window.ApercuSandbox.afficher(conteneur, htmlAutonome, {
    themeClair: document.body.classList.contains('mode-clair')
});
```

**Sites à adapter** (commande de localisation à jour à faire avant SP2) :
```bash
grep -nE "genererBadgeCC\s*\(" js/*.js
```

Modifications par fichier (~20-30 min chacun) :
1. `js/grilles.js`
2. `js/echelles.js`
3. `js/productions.js`
4. `js/cartouches.js`
5. `js/pratiques-materiel.js`
6. `js/travaux-outils.js`

**Validation par fichier** :
- Aperçu d'import s'affiche correctement (badge CC visible + contenu pédagogique lisible).
- Mode clair / sombre OK.
- Bouton « Importer » fonctionne toujours (pas de régression sur le pipeline d'import).

### SP3 — Tests sécurité (~½ j)

**Tests manuels avec payloads XSS** :
- Préparer 3-4 fichiers `.json` malveillants avec payload dans :
  - `metadata.nom`
  - `metadata.auteur_original`
  - `metadata.contributeurs[0].nom`
  - `criteres[0].nom` (pour grille)
- Pour chaque payload, vérifier dans la console qu'aucun effet ne touche le parent :
  - Pas de modification du `localStorage`
  - Pas d'accès aux clés de l'app
  - Pas de modification du DOM parent
  - Erreur SecurityError visible dans la console iframe (signe positif)

**Documentation des tests** :
- Petit fichier `docs/securite/audits/TESTS-DEFENSE-A-2026-05-XX.md` avec les payloads testés et le résultat (pass/fail).

### SP4 — Documentation + bump + PR (~½ j)

**Mise à jour `docs/securite/MODELE-MENACES.md` v1.4** :
- §6 tableau récapitulatif : passer D-01, X-01, I-01 de « Partiel » à « Bon » ou « Complet » (à arbitrer selon l'examen post-livraison).
- §7 D-01 défense P1 : marquer livrée.
- §8.2 Phase 1 : marquer Défense A livrée.
- Historique : entrée v1.4.

**Mise à jour `SESSION.md`** :
- Récap du chantier + bilan.
- Nouvelle consigne de démarrage pour la session suivante.

**Mise à jour `BACKLOG.md`** :
- Aucun item à marquer (Défense A ne figurait pas dans le backlog métier — c'est dans le modèle de menaces).
- Optionnel : ajouter un item pour la **v2** (aperçu interne dans evaluation.js + wizard-pratique-v2.js) si jugé pertinent.

**Bump version** : la beta sera décidée par Grégoire au moment du commit final.

**Branche + PR** :
```bash
git checkout -b feature/securite-defense-a-sandbox
# travail SP1-SP4
git push -u origin feature/securite-defense-a-sandbox
gh pr create --title "feat(securite): Défense A — sandbox iframe pour l'aperçu d'objets importés"
```

### SP5 — Review + merge (~½ j)

- `/ultrareview <PR#>` (cloud, facturé) — vaut le coup pour un chantier sécurité.
- Review manuelle ciblée en parallèle.
- Corrections selon findings.
- Merge `--merge --delete-branch`.

---

## 6. Critères de réussite

- ✅ Composant `ApercuSandbox` exposé globalement, testable en standalone.
- ✅ Les 6 modals d'aperçu d'import utilisent la sandbox.
- ✅ Test payload XSS : aucun effet sur le parent (vérifié manuellement).
- ✅ Aucune régression visuelle sur les aperçus (badge CC + contenu lisibles, modes clair/sombre OK).
- ✅ Pipeline d'import inchangé fonctionnellement (bouton « Importer » → ressource importée correctement).
- ✅ Documentation à jour (MODELE-MENACES v1.4, SESSION.md, rapport de tests).
- ✅ PR mergée sur main.

---

## 7. Risques identifiés et mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Style de l'iframe ne ressemble pas au DS (badge CC moche) | Moyenne | Mineur | Itérer sur les variables CSS injectées en SP1, valider visuellement |
| Hauteur dynamique mal calibrée (iframe trop courte ou scroll superflu) | Moyenne | Mineur | ResizeObserver + clamp, tester avec contenus de tailles variées |
| Régression sur les aperçus (rendu cassé) | Faible | Moyen | Tester chaque modal après modification (SP2 fait module par module) |
| Performance : 6 iframes en mémoire si l'utilisateur ouvre plusieurs aperçus | Faible | Mineur | `ApercuSandbox.fermer(conteneur)` appelé à la fermeture de chaque modal |
| Payload qui exploite `postMessage` pour parler au parent | Faible | Critique | Filtrage strict côté parent (`event.data.source === 'apercu-sandbox'` + clamp numérique) |

---

## 8. Annexes

### 8.1 Convention `srcdoc` minimal

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  :root {
    --bleu-principal: #1a4a5e;
    --texte-principal: #e8f1f5;
    --surface-carte: #1a3a48;
    /* ... variables nécessaires copiées de styles.css */
  }
  body {
    margin: 0;
    padding: 12px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--texte-principal);
    background: transparent;
  }
  /* Styles pour les éléments du badge CC + contenu pédagogique */
</style>
</head>
<body>
<div id="contenu">${htmlContenu}</div>
<script>
  function envoyerHauteur() {
    parent.postMessage({
      source: 'apercu-sandbox',
      type: 'hauteur',
      valeur: document.documentElement.scrollHeight
    }, '*');
  }
  new ResizeObserver(envoyerHauteur).observe(document.body);
  envoyerHauteur();
</script>
</body>
</html>
```

### 8.2 Filtrage `postMessage` côté parent

```js
window.addEventListener('message', function(event) {
    var data = event.data;
    if (!data || data.source !== 'apercu-sandbox') return;
    if (data.type !== 'hauteur') return;
    var hauteur = parseInt(data.valeur, 10);
    if (isNaN(hauteur) || hauteur < 0) return;
    hauteur = Math.max(opts.hauteurMin || 100, Math.min(hauteur, opts.hauteurMax || 600));
    iframe.style.height = hauteur + 'px';
});
```

---

## 9. Ressources

- `docs/securite/MODELE-MENACES.md` v1.3 — modèle de menaces complet (§7 D-01, §8.2 Phase 1).
- `docs/securite/audits/AUDIT-INNERHTML-FINDINGS-2026-05-06.md` — recommandation E-β qui justifie Défense A.
- `js/cc-license.js:genererBadgeCC` (ligne 224) — fonction qui génère le badge actuellement (fix `echapperHtmlCC` du 6 mai à conserver).
- `Skills pour Claude Code/SKILL_Securite_donnees.md` — référence sécurité projet.

---

**Statut** : ⏳ À démarrer
**Dernière mise à jour** : 8 mai 2026
