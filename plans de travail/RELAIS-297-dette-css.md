# Relais #297 — Dette technique : duplication CSS inline (index.html) ↔ styles.css

> **Pour** : une prochaine session dédiée (PAS un lot express). **Préparé le** : 15 juin 2026.
> **Priorité** : 🟢 basse, **post-AQPC** (décision backlog). **Risque** : MOYEN-HAUT — overrides
> CSS silencieux, risque de FOUC/perte de rendu si mal fait. Aucun test automatisé ne couvre
> le CSS → vérification **visuelle** obligatoire (clair + sombre + iPad), donc **session Mac**.
> **Phase 1 (audit) déjà livrée** : rapport `Rapports/audit-duplication-css-2026-05-28.md`,
> script reproductible `Rapports/_outils/audit-duplication-css.py`. Ce relais cadre les
> phases 2 (traitement) et 3 (convention).

---

## 0. Pourquoi c'est son propre chantier (et pas un lot rapide)

- **Pas de filet automatisé** : Vitest ne teste pas le rendu CSS ; Playwright (WebKit) n'est
  pas lançable en cloud. La seule vérification fiable est l'œil humain dans les **deux modes**
  + iPad → ça impose une session Mac, pas iPad/cloud.
- **Overrides silencieux** : 33 sélecteurs divergent entre les deux fichiers. Retirer le
  mauvais côté change le rendu sans erreur. Cas d'école déjà vécu : bug `.contenu min-height`
  du 28 mai (override inline masquant styles.css).
- **CSS critique délibéré** : le bloc inline existe pour **mitiger Safari `file://`** (cache
  CSS externe non invalidé après bump de build). On ne peut pas « tout sortir » : les
  variables `:root`, le bandeau, la nav, l'accueil DOIVENT rester inline (premier rendu).

## 1. ÉTAPE 0 obligatoire — re-générer l'audit (les chiffres ont DÉRIVÉ)

Le rapport date du 28 mai ; le bloc inline a **grossi depuis**. Vérifié le 15 juin :
`<style>` ouvre l. 16, ferme désormais l. **3825** (l'audit codait `INLINE_FIN_LIGNE = 3806`,
soit **+19 lignes** de CSS inline ajoutées entre-temps). **Avant toute décision** :

1. Mettre à jour `Rapports/_outils/audit-duplication-css.py` : `INLINE_FIN_LIGNE = 3825`
   (et re-vérifier `<style>`/`</style>` au moment de la session — ça peut avoir encore bougé).
2. Faire écrire la sortie dans un fichier **daté du jour** (ne PAS écraser le rapport du
   28 mai, c'est un artefact historique) — changer `SORTIE` ou copier après coup.
3. `python3 Rapports/_outils/audit-duplication-css.py` → nouveaux compteurs.

**Chiffres de référence (28 mai, à rafraîchir)** : 625 règles inline, 3947 dans styles.css ;
48 sélecteurs communs → **15 identiques** + **33 divergents** ; 575 inline-seul, 3896 externe-seul.

## 2. Découpage proposé

- **Lot A — les 15 IDENTIQUES (le plus sûr)** : retirer du bloc inline **uniquement** les
  règles « profondes » (modales, panels, composants non above-the-fold) ; **garder inline**
  les critiques (`:root`, `body`, bandeau, nav, accueil) même si dupliquées. Réduit le HTML
  sans changer le rendu tant que styles.css charge. Vérif visuelle deux modes après chaque
  retrait par grappe.
- **Lot B — les 33 DIVERGENTES (cas par cas, le cœur du risque)** : pour chacune, lire les
  deux versions, **décider laquelle est correcte**, retirer l'obsolète → source unique. Si
  les deux servent intentionnellement (override délibéré), commenter aux DEUX endroits
  (« cf. autre définition index.html:NNNN »). La plus sensible = **`:root`** (l'inline est en
  retard de plusieurs lots de variables : manque acc-*, section-*, idme-*, focus-ring-*,
  rai-niveau-* d'après l'audit → si styles.css échoue, ces variables manquent). Diffs des 10
  plus volumineuses : §3.2 du rapport (`:root`, `.carte`, `body`, `.conteneur`,
  `.notification-succes`, `.badge-jeton`, `.section.active`, `.controle-form`, `.tableau th`,
  `.carte-metrique-violette`).
- **Lot C — convention** (§5.3 du rapport) : une fois A+B traités, inscrire en tête du bloc
  inline l'encart « CSS critique inliné délibérément » + la règle « toute règle dupliquée
  DOIT exister à l'identique des deux côtés ». C'est ce qui empêche la dette de revenir.

## 3. Grille de décision (rappel §5)

- **Identiques** : (a) retrait inline pour les règles profondes [défaut] ; (c) garder les deux
  + discipline pour les critiques. (b) retrait externe = non recommandé.
- **Divergentes** : lire les deux, trancher la vérité, retirer l'obsolète, ou commenter si
  override délibéré.

## 4. Vérification (pas de Vitest possible)

- Après **chaque grappe** de retraits : recharger l'app, vérifier **mode clair ET sombre**,
  desktop + iPad. Cibler en priorité le premier rendu (bandeau/nav/accueil) et les écrans
  denses (tableau de bord, profil).
- Test du pire cas Safari `file://` : si possible, simuler styles.css non chargé pour
  confirmer que les règles critiques restées inline suffisent au rendu de base.
- Sentinelle envisageable (statique) : un test qui **échoue si une règle dupliquée diverge**
  entre inline et externe (réutiliser la logique du script d'audit en assertion). À cadrer en
  Lot C — ce serait le premier filet automatisé de cette dette.

## 5. Séquencement / dépendances

- Indépendant des chantiers données (#339, #328…). Aucun couplage fonctionnel.
- Bas de pile : à faire quand le rythme le permet, sur Mac. Bump `patch` (UI/perf, pas de
  rupture). Pas de changement de format de données.

## 6. Pointeurs

- Rapport d'audit : `Rapports/audit-duplication-css-2026-05-28.md` (§3 divergences, §4
  identiques, §5 reco, §6 annexe complète).
- Script : `Rapports/_outils/audit-duplication-css.py` (corriger `INLINE_FIN_LIGNE` d'abord).
- BACKLOG : item #297.
