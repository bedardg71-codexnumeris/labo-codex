# Consigne – Les sept rouges de la Carte d'alignement (#1148), puis le verdict de la 1.219.1 (26 octobre 2026)

> Écrite par Cowork le lundi 26 octobre 2026 à 7 h 15 (Toronto), sur `main` local = `4987b3fb` (65 commits d'avance sur `origin/main` = `973ad366`). Rapport lu : `RAPPORT-2026-10-26-verdict-rouge-1219.md`. Relu par Cowork : le diff CSS de `27056905` sur `#planif-selecteur-cartes` et `.planif-btn-bibliotheque`, `planif-tout-voir-loupe.spec.js` (l. 113-162), les `getBoundingClientRect` de `js/planification-carte.js`.

## 0. Ce que Cowork a mesuré, et son hypothèse

- **Mesuré** : #1148 a grandi la barre de la Carte. Le bouton « Consulter la bibliothèque » passe de 28 px à 44 px de haut, le menu des cartes à 44 px, et le couple prend 6 px de marge intérieure. Le canevas commence donc environ 20 px plus bas.
- **Mesuré** : l'application relit la position de la zone de travail à chaque geste (`zoneTravail.getBoundingClientRect()`, `planification-carte.js` l. ~2849 à ~9414). Un canevas plus bas ne devrait pas, à lui seul, décaler un geste réel.
- **Mesuré** : la spec de la loupe prend le centre du nœud **avant** deux clics dans le menu « Vue », puis déplace la souris à ces coordonnées.
- **Hypothèse de Cowork (inférence, non mesurée)** : avec la barre plus haute, la page de la Carte déborde maintenant la fenêtre du banc ; Playwright fait défiler la page pour cliquer le menu, et les coordonnées prises avant sont décalées d'autant. Si c'est vrai, la Carte a aussi gagné **un défilement de page que l'utilisateur voit** (le bas du canevas caché d'une vingtaine de pixels).

## 1. Départager, avant de corriger

Sur `27056905` puis sur `28f379d5`, à la taille de fenêtre des trois specs :
1. `document.scrollingElement.scrollHeight - innerHeight` sur la Carte ouverte (déborde-t-elle ? de combien ?) ;
2. `scrollY` avant et après les clics de chaque essai rouge ;
3. dans chaque essai rouge, relis la boîte de la cible **juste avant** le geste : passe-t-il alors ?

Trois issues :
- **La page déborde depuis #1148** : c'est un défaut de l'application. **Corrige le code** : la Carte retrouve la hauteur qu'elle avait (le canevas tient compte de la barre plus haute), sans défilement de page, à 1440 et à 820 px. Les specs ne changent pas, sauf si une autre cause s'ajoute.
- **La page ne déborde pas, et le geste rate même avec la boîte relue** : c'est un défaut de l'application dans la conversion du pointeur. Corrige le code.
- **La page ne déborde pas, et le geste passe avec la boîte relue** : ce sont les specs qui prenaient leurs coordonnées trop tôt. Corrige les specs (la boîte relue juste avant le geste), motif écrit dans chaque fichier, break-test.

Dis laquelle, chiffres à l'appui.

## 2. La preuve

- Les trois specs rejouées seules : 40 sur 40.
- Si le code change : un essai qui dit « la Carte ne fait pas défiler la page » (ou le défaut trouvé), avec son break-test ; les bancs de #1148 (`bibliotheques-menu-cadre-1148.spec.js`) verts.
- Vitest.

## 3. La mise en ligne

- **Une version de correction** : `scripts/release.mjs patch` → **1.219.1** (le patch se consolide dans l'entrée 1.219 des Nouvelles, sans item neuf ; skill `release-et-changelog`, § 5).
- **La vérification complète sur le commit de 1.219.1**, en dix morceaux comme cette nuit (`scripts/morceau-playwright.mjs`, les rapports fusionnés et jugés contre la baseline du Mac). Avant de lancer : dis à Grégoire de fermer Cowork, Mac sur secteur, pression mémoire relevée avant chaque morceau.
- Verte : écris le jeton de verdict comme le fait `pousser.sh` et pousse par `scripts/pousser.sh`. Rouge : ne pousse pas, rapport à Cowork.
- Puis le § 4 de `CONSIGNE-LOT-2026-10-25-mise-en-ligne-du-soir.md` (Netlify, le run GitHub contre la baseline Linux, `RELAIS.md`, `OU-EN-EST-ON.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, la branche des bibliothèques supprimée en local).
