# Portes terrain — la copie de référence (#1229)

> Écrite par Claude Code le 4 novembre 2026, au soir. **Le markdown (la trace) ; l'artefact (l'opération, bouton « Copier mes résultats ») est à publier par Cowork.**
> **Le lot n'est pas en ligne** : il part avec la prochaine mise en ligne, après le verdict unique du Mac. Cette porte attend ce push ; avant, elle jugerait la version d'avant.
> Ce qui échoue devient un item du BACKLOG, pas une note mentale.

**Trois gestes, tous sur l'iPad.** Le reste est mesuré par la machine (`tests/integration/copie-de-reference-1229.spec.js`, 8 essais WebKit) : l'original proposé d'office pour une reprise, ses annotations dessinées, le zoom de l'une qui ne touche pas l'autre, la bascule d'axe retenue, la fermeture qui rend ses gestes à la copie annotée, en Annoter comme en Évaluer, et aucune donnée écrite. Ce qu'aucune machine ne prouve, c'est le doigt réel sur le verre.

## §0 · Préalable

- [ ] Ouvre `https://app.codexnumeris.org` sur l'iPad, recharge, lis le numéro en bas de page.
  ⮕ Attendu : la version de la prochaine mise en ligne (1.233.0, si Grégoire valide la mineure) ou plus récente. Une version plus ancienne : la porte attend.

## §2 · Interface

### 2.1 · Zoomer dans les deux copies, chacune pour soi — iPad

> **POURQUOI** — « J'ai besoin de pouvoir zoomer dans les deux écrans. » Et le 2 nov., deux doigts ne faisaient plus défiler la copie après un détour : la copie de référence ne doit pas ramener ce défaut.

- [ ] Ouvre une reprise (★) en Annoter, puis menu **Actions › Copie de référence**.
  ⮕ Attendu : sous la copie, l'original du même élève, avec les annotations de la première évaluation.
- [ ] Pince pour zoomer dans la copie de référence, puis dans la copie annotée.
  ⮕ Attendu : chaque pincement ne change que la copie sous les doigts ; la page entière de Safari ne zoome pas.
- [ ] Ferme la référence (×), puis glisse à deux doigts sur la copie annotée.
  ⮕ Attendu : la copie défile, comme avant l'ouverture.
  `iPad`

## §3 · Décisions — ce ne sont pas des vérifications

Les mots d'écran sont au rapport (`RAPPORT-2026-11-04-copie-de-reference.md`) ; Grégoire les valide avant la mise en ligne. Champ de saisie, pas de case.

## §4 · Ce que je n'ai pas pu vérifier

- Le pincement et le glissé réels sur le verre : les événements sont fabriqués au banc.
- Un PDF de plusieurs pages dans la référence : le banc ouvre des images (en `file://`, PDF.js ne répond pas au banc ; un essai demanderait un serveur, comme `visionneuse-pdf-worker-echec-non-memorise`). Le chemin PDF reprend celui de la visionneuse, sans essai propre. À regarder en usage : pages précédente et suivante d'une copie de plusieurs pages.
- L'iPad en portrait : côte à côte, chaque copie n'a plus que la moitié de 820 px.
- Les palettes flottantes déplacées ailleurs que leur place d'origine : la barre de la référence passe au-dessus d'elles, mesurée à 1280 px seulement.
