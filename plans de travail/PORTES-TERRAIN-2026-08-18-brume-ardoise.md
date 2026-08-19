# Portes terrain — Brume ardoise (mode anonymisation, 1.87.6)

> **Chantier** : palette désaturée du mode anonymisation dans les DEUX thèmes
> (branche `claude/labo-codex-anonyme-colors-ztk8gl`, 18 août 2026).
> Avant : en thème clair, la désaturation n'existait pas — il ne restait
> qu'une sidebar quasi noire dans le profil étudiant. Maintenant : tout
> l'écran prend une teinte « brume ardoise » quand les identités sont
> masquées, en clair comme en sombre.
>
> **Ce qui échoue devient un item de BACKLOG avec son numéro de porte,
> pas une note mentale.**
>
> Artefact jumeau (cases, compteur, export) : lien donné dans la conversation.

## État

- [x] Exécutée le : **19 août 2026** (relevé exporté par l'artefact)
- Résultat : **8 passées / 0 échec / 0 non traitée** — PORTE CLOSE, les deux
  appareils, zéro item de backlog à verser.
- Verdicts : **D1** « oui, garde. » — **D2** « oui, on garde, mais pourrait-on
  désaturer toute l'interface ? Même l'entête ? » ⮕ tranché en discussion
  (option A) et **livré en 1.87.7** : l'en-tête, la nav et la sous-nav suivent
  la brume dans les deux thèmes ; les couleurs de section et les signaux
  pédagogiques restent vifs (repérage). Vérifié en Chromium : le mode normal
  est inchangé au pixel (conversion des marine codés en dur vers
  `var(--bleu-principal)` etc., valeurs identiques hors anonymisation).

---

## §0 · Préalable

- **0.1** `git pull` dans le clone (Terminal — seule commande de Terminal de
  toute la liste). ⚠ Ton app se lance en `file://` depuis ton clone : sans ce
  geste, tu testes la version d'AVANT le correctif, et chaque porte semblera
  échouer en décrivant exactement l'ancien comportement.
- **0.2** Ouvrir l'app et vérifier le numéro **en bas de page**.
  ⮕ Attendu : `1.87.6` (build `0818-1826`). Si un autre numéro s'affiche,
  s'arrêter ici : le reste de la liste teste le mauvais build.
- Aucune porte de cette liste ne touche tes données — pas de backup requis.

## §2 · Interface

- **2.1** Mac, thème clair : activer le mode anonymisation, ouvrir un profil
  étudiant (Suivi ▸ Profils individuels).
  ⮕ Attendu : la colonne de gauche (Observations) est **gris-bleu très pâle**,
  comme en mode normal. Avant : un bloc quasi noir.
- **2.2** Même écran : regarder l'en-tête du tableau des productions et les
  boutons « Consulter ».
  ⮕ Attendu : bleu-gris ardoise (éteint), plus le bleu marine vif du mode
  normal. C'est le signal « identités masquées ».
- **2.3** Décocher le mode anonymisation (bandeau du bas ou bouton d'en-tête).
  ⮕ Attendu : les couleurs vives reviennent immédiatement, sans recharger.
- **2.4** Thème sombre + mode anonymisation.
  ⮕ Attendu : l'ambiance désaturée est toujours là. La teinte a très
  légèrement glissé (moins verte, plus ardoise) — une différence à peine
  perceptible n'est PAS un échec.
- **2.5** iPad : refaire 2.1 et 2.2. `[iPad]`
- **2.6** Balayer 2 ou 3 écrans en brume claire (groupe, productions, accueil).
  ⮕ Attendu : aucun texte devenu trop pâle pour être lu (titres, dates,
  pourcentages). Signaler tout texte qui force à plisser les yeux.

## §3 · Décisions — ce qui attend ton verdict

> Ce ne sont PAS des vérifications : ce sont des choix posés faute de pouvoir
> les trancher à ta place. Écrire le verdict, pas cocher.

- **D1** La teinte de la brume claire (ardoise sur fond gris perle) te
  convient-elle pour la présentation de demain ? Sinon, dire dans quel sens :
  plus grise ? plus foncée ? plus contrastée ?
  ⮕ Verdict : ______
- **D2** Les grands titres suivent maintenant la brume (avant, ils restaient
  bleu vif même en mode anonymisé). Garder ce comportement ?
  ⮕ Verdict : ______

## §4 · Ce que la session n'a pas pu vérifier

- **Safari et iPad** : structurellement invérifiables en conteneur (pas de
  WebKit). Tout a été validé dans Chromium seulement.
- **Ton corpus réel** : la page Profils individuels avec données n'existe pas
  dans le conteneur. La sidebar a été vérifiée sur une page à sidebar
  générique (couleur calculée : gris perle `#e9edf1`, plus le noir `#0e1e28`).
- **Les graphiques Chart.js en mode anonymisé** : non regardés (aucune donnée
  à tracer ici).
- **Erreur de session, rattrapée** : la première version laissait les grands
  titres bleu vif en brume claire (accent oublié). Vue sur capture d'écran,
  corrigée avant commit — c'est l'origine de la décision D2.

---

## Détail technique (pour la prochaine session, pas pour l'exécution)

- `styles.css` : bloc « MODE ANONYMISÉ - BRUME ARDOISE » — deux palettes
  scopées par thème (`body[data-mode="anonymisation"]:not(.mode-clair)` et
  `body.mode-clair[data-mode="anonymisation"]`), teinte commune ~hue 205.
  Contrastes AA vérifiés (9,2:1 / 5,1:1 sur `#e9edf1`).
- Retiré (zéro-dette) : la règle sidebar `--sous-nav-bg-anonymisation`
  (cause de la sidebar noire), la variable elle-même (styles.css +
  `index.html`), la variable morte `--sous-nav-bg-normal`, et le bloc inline
  `body[data-mode="anonymisation"]` d'`index.html` (consolidé dans
  styles.css).
- Vitest 2738/2738 verts après modification ; Playwright WebKit non lançable
  en conteneur (état connu, #456).
