# Demande de relecture légère – carte d'alignement : la pastille « ? » et la page 5 du guide

> Écrite le 28 septembre 2026 par Claude Code, pour Cowork. Ton § 8 de `RELECTURE-2026-09-28-carte-alignement-apres-rebase.md`. Branche locale `carte-alignement-963-966`, un seul commit à relire : **`43bfa9a5`** (sur `43977338`, R6). `git show 43bfa9a5` suffit.

## Ce qui est posé

- **Pastille « ? »** (`js/planification-carte.js`) : état `incertain`, symbole `?`, texte mot pour mot (le « ? – » du texte accepté est la pastille suivie de son libellé, comme les quatre autres états dans la consigne #965). Préséance : ✕, ⚠, ?, ✓. `position()` rend `'inconnu'` là où elle rendait `'avant'` avec `inconclusif` ; un objectif est `incertain` quand aucun bloc ne le sert sûrement avant et qu'au moins un ne peut pas être situé. Le drapeau `inconclusif` garde son sens.
- **Légende** : cinq états, « ? » entre ⚠ et ✓ ; l'Inspecteur et la page 8 du guide la suivent seules (vérifié : banc navigateur de chacun).
- **Couleur** : `--gris-moyen` (5,7:1 sur blanc en mode clair), trait plein pour ne pas se confondre avec le « ! » en pointillé. Proposition ; Grégoire juge à l'écran.
- **Page 5** : points 3 et 4 mot pour mot, `<strong>` sur « Inspecteur », « objectifs servis », « objectifs vérifiés ». **Apostrophes typographiques (’)**, celles de toute la page, là où ton texte a des apostrophes droites : même mots, pas mêmes octets. Dis-moi si tu veux les droites.

## Preuves

- Vitest **649 fichiers, 7 582 / 7 582** ; WebKit, bancs `planif-*`, **27 / 27**.
- Essais de « ? » : leçon (du bloc) sans semaine, leçon de l'évaluation sans semaine, séance non posée, évaluation hors leçon → « ? » ; « ? » + ⚠ → ⚠ et « ? » + ✕ → ✕, dans les deux ordres ; « ? » + ✓ → « ? » ; tout « avant » sans incertitude → ✓ ; texte, symbole et classe ; légende à cinq. Au navigateur : l'état « ? » ajouté au parcours des états de la pastille, et la page 8 du guide à cinq pastilles.
- Page 5 : les deux phrases, une fois chacune ; l'ancienne absente ; **en remettant les deux anciennes phrases, on retrouve l'empreinte d'avant le lot** (`8fe3a8e048b00535`) : rien d'autre n'a bougé.
- **Mutations, rouges** : « ? » rendu ✓ (six essais rougissent) ; « ? » qui l'emporte sur ⚠ (un essai).
- Jetons : `planification-carte.js` `20260927g`, `styles.css` `20260927l` (lettres jamais servies).

## Un écart avec ton § 8, à trancher

**« Le bloc qui sert l'objectif, hors de toute leçon » ne peut pas arriver** : `objectifsServisPar` rend `[]` pour un bloc sans leçon parente (un bloc sert les objectifs de SA leçon). Un tel bloc ne rend rien incertain ; l'objectif qu'il croyait servir reste ✕ s'il est seul. Écrit en essai sous cette forme. La branche `!leconBloc` de `position()` reste, sans effet (issue 3).
**Et un quatrième cas incertain existe** : même semaine, **séance non posée** (déjà marqué `inconclusif` au lot, R4). Il donne « ? » lui aussi. Le texte accepté (« une leçon n'a pas encore de semaine, ou l'évaluation n'est dans aucune leçon ») ne le nomme pas : c'est à Grégoire de dire si le texte doit le couvrir. Je ne l'ai pas touché.

## Pas fait

Pas de release, pas de Nouvelles, pas de push. RELAIS.md non retouché.
