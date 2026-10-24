# Demande de relecture – le profil individuel : la rangée de sélection au lieu de la barre latérale (lot 2 bis, #1151)

> Claude Code, samedi 24 octobre 2026 (Toronto). Pour Cowork (`PROTOCOLE.md`). Consigne exécutée : `CONSIGNE-LOT-2026-10-24-profil-individuel-rangee.md` ; plan `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md`, lot 2 bis. Maquette : https://claude.ai/artifact/VB2a6v7wB3yPXgg2rDfopp.
> En ligne : la **1.217.0** (`973ad366`). Sur `main`, **non poussés** : les lots 1 et 2 (jusqu'à `2e19fddb`), `8c446b6f` (ta consigne, la ligne du plan, la fiche #1151, seuls, § 0), puis ce lot. Pas de release, ni verdict complet, ni push (consigne § 7).

## 0. Ce que la mesure a contredit ou précisé (consigne § 2)

| Décision de Cowork | Mesuré | Ce que j'ai fait |
|---|---|---|
| § 2.5 : un seul rendu de l'en-tête ; « dis quelle cible d'aide tu gardes » | `details-calculs-risque-<da>` (l'en-tête à l'ouverture) n'est rendu **nulle part** : l'icône de l'ouverture ne visait rien (un clic : « Élément target non trouvé » en console). `details-calculs-<section>-<da>` existe pour trois sections : Engagement, Développement, Accompagnement (l. 582, 902/1076, 4201). | **Je garde `details-calculs-<section>-<da>`**, sur ces trois sections seulement, à l'ouverture comme au changement. Ailleurs, pas d'icône (l'en-tête vide est caché). Les titres suivent ceux de `changerSectionProfil` (« Progression temporelle ACP », pas « Progression »). |
| § 2.5 / § 2.6 : le même code pour les deux chemins | Le `switch` de `changerSectionProfil` ignorait les réglages : appelé par programme sur une section cachée (Engagement sans le dépistage ACP, par ex.), il la rendait quand même, sans bouton. | Une table, `SECTIONS_PROFIL` (libellé, titre, infobulle, aide, réglage, contenu), lue par la rangée, l'ouverture et le changement. **Supposition** : une section cachée demandée par programme rend Productions et marque son bouton ; `sectionProfilActive` garde la demande (comme l'ouverture le faisait déjà). |
| § 2.7 : « mesuré : le profil seul les emploie » | Aussi dans `design-system.html` (§ 15, le spécimen de la barre), et dans `Design system - Modules/03b-cartes-sidebars.html` et `05-patterns-pedagogiques.html` (l'ancien système, hors `_archives`). | CSS retiré ; le spécimen de `design-system.html` perd ces trois blocs (reste la barre de l'Animation). Les deux fichiers de l'ancien système : non touchés (voir § 6). |

## 1. Le lot

- **`js/profil-etudiant-sections-affichage.js`** : `afficherProfilComplet` rend la rangée (`_rendreRangeeProfil`, `_etiquettesEleveProfil`) puis la section ; `changerSectionProfil` ne fait plus que résoudre, rendre, marquer (`_marquerSectionProfil`, par `data-param`, sans le global `event`). Le menu garde `#selecteurEtudiantProfil` et `data-on-change="afficherProfilComplet"` ; son texte d'option ne change pas. ‹ et › : `#profilElevePrecedent`, `#profilEleveSuivant`, 44 × 44 px, `aria-label` et `title` d'avant ; au bout, `disabled` et plus de `data-param="undefined"`. Au clavier, la flèche garde le focus après le rendu. « Liste des étudiant·es » : `data-action="naviguerVers"` `suivi` / `liste` (la navigation existante, appelée). Les vignettes des travaux se chargent dès le rendu sur les deux chemins (l'ouverture attendait 100 ms).
- **`index.html`** : `h2.titre-avec-emoji-toggles` « Profils individuels » avec les deux aides d'avant.
- **`styles.css`** : la variante à deux lignes (`.rangee-selection-profil`, `-ligne`, `-pas`, `-fleche`, `-compte`, `-etiquettes`, `-etiquette` et ses deux variantes, `-sections`, `-section`), bordure égale sur les quatre côtés ; sous 760 px, ‹ menu › prend sa ligne. Le titre de la section ouverte en `u-lecteur-ecran`, son infobulle sur le bouton.
- **`js/accompagnement-contenu-hover.js`** : la bulle du menu dit « Les flèches ‹ et › parcourent la liste dans l'ordre alphabétique. » ; celle d'« OBSERVATIONS » part avec son titre.
- **`design-system.html`** : spécimen « Rangée du profil, sur deux lignes » (§ 15, deux modes).
- Jetons `?v=` : `styles.css` d, la section du profil et les bulles, a du 24.

## 2. Ce qui est parti (un `grep` avant chaque retrait)

- Le gabarit de la barre (`.layout-sidebar-2col` › `.sidebar-navigation`, la carte d'identité, « ← Préc. » / « Suiv. → », « OBSERVATIONS », les `.sidebar-item`).
- `_resoudreSectionContenu` et le `switch` de `changerSectionProfil` (remplacés par la table) ; l'appel mort à `calculerTousLesIndices` du changement de section (une lecture, résultat jamais lu).
- CSS : `.sidebar-filtre`, `.sidebar-info-card`, `-nom`, `-details`, `.sidebar-nav-buttons` (et `.btn`), `.sidebar-section-titre`. **Restent** `.layout-sidebar-2col`, `.sidebar-navigation`, `.sidebar-item*`, `.sidebar-liste` (l'Animation, `index.html` l. ~8078).

## 3. Les pièges de la consigne (§ 4)

1. **#754** : `profil-754-un-seul-rendu` vert ; `navigation.js` non touché.
2. La section suit l'élève (essai dédié) ; l'onglet interne de Développement : inchangé.
3. Les sous-onglets de Développement gardent leur style souligné (capture 820 et 1440).
4. Le rapport garde le texte tapé : `profil-866-notes-rapport` vert ; les vignettes : `profil-travaux-761` vert.
5. **iPad** : 44 px, sans débordement à 1180, 820 et 700 px ; ‹ menu › sur sa ligne sous 760 px (essais dédiés).
6. **Sécurité** : nom, prénom, DA, groupe, programme, statut par `echapperHtml` ; les libellés de la table aussi (#467) ; aucun gestionnaire en ligne.
7. **Stock** : de l'affichage, aucune donnée ne change.

## 4. Preuves

- **Vitest** : 9 594 sur 9 594, 813 fichiers. **Recalés, pas affaiblis** : `sentinelle-lot-E-745` (k : le nom dans l'option choisie, le statut PREMIÈRE étiquette, avant le groupe ; n : ‹ / › sautent l'exclu, la flèche du bout `disabled`) ; `sentinelle-824` (le témoin lit la table, et refuse une entrée `id: 'cible'`) ; `sentinelle-contenir-complexite` (`afficherProfilComplet` 32 sort de la liste figée ; 449 → 447) ; `sentinelle-467` (libellés échappés).
- **Playwright (WebKit)** : `profil-rangee-1151.spec.js`, 9 essais : plus de barre, le titre et ses deux aides ; l'ordre de la rangée, 44 px, le compte « 2 sur 10 », les étiquettes, les sept sections dans l'ordre, une seule pleine, la section à la largeur de la rangée, son titre au lecteur d'écran seul ; le menu, ‹ et ›, les bouts, le focus au clavier ; chaque bouton, puis `changerSectionProfil('mobilisation')` par programme, puis la section qui suit l'élève ; Jugement après Productions avec une dénotation, absent sans ; « Liste des étudiant·es » ; en anonymisation, aucun `DEMO…` (témoin : présent hors anonymisation) ; 1180, 820, 700 px.
- **Specs recalées** : `profil-etudiant-rendu` (la rangée, plus la barre), `profil-745-eleve-exclu` (le nom dans le menu, le statut première étiquette, à 768 px de la hauteur de celle du groupe), `profil-866`, `profil-867` (les boutons de section ; l'actif par `aria-current`), `evaluer-868`, `evaluation-911`, `profil-travaux-761` (l'attente du rendu). **Le périmètre** (28 specs qui ouvrent le profil, dont `profil-754`, `profil-922`, `denotation-saisie-DEN2`, `animation-equipes-1039`, `lot-a-anonymisation-enregistre`) : 95 sur 95, `--retries=0`.
- **Break-test** : `_marquerSectionProfil` réduit au clic (`if (event)`, l'ancien comportement) → les clics passent, l'appel programmatique rougit (« rapport » resté plein, l. 172). Restauré.
- **Non fait** : le verdict complet, ni GitHub (Linux). Réservés au signal de Grégoire.
- **Captures** : `plans de travail/captures-2026-10-24-profil-individuel-rangee/` — Productions et Développement des habiletés à 1440, 1180, 820 px (clair), et à 1440 en sombre.

## 5. Portes terrain

`PORTES-TERRAIN-2026-10-24-profil-individuel-rangee.md` : **aucune porte due** (règle 2 : de l'affichage, aucune donnée). Ses angles morts y sont dits. Cowork : rien à publier, sauf si tu juges autrement.

## 6. Trouvailles (trois issues)

- **Inscrire et continuer** : **GitHub est rouge sur `973ad366`** (la 1.217.0 poussée) : le run 40128243995 juge 32 essais rouges absents de la baseline (codex et fichiers 1007-*, codex-1011/1012/991, exporter-895, matériel, dissection, planif-*), alors que le Mac est vert sur le même commit. Mesuré par l'audit de début de session, non analysé. Ressemble à la famille Linux du 19 oct. (#1114-#1116) — **supposition**. Pèsera sur le prochain push ; écrit au relais.
- **Commenter et oublier** : `Design system - Modules/03b-cartes-sidebars.html` et `05-patterns-pedagogiques.html` décrivent encore les classes retirées. Ancien système, que le skill `design-interface` dit de ne plus consulter.
- **Commenter et oublier** : `afficherProfilComplet` calcule encore `interpM` (et `A`, `C`) sans le lire. Antérieur au lot, sans effet.
