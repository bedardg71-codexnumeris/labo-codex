# Rapport – Les barres colorées de l'Aperçu

> Claude Code, vendredi 30 octobre 2026, 22 h 20 (Toronto). Exécute `CONSIGNE-LOT-2026-10-30-barres-apercu.md`. Pas de release, pas de push : relecture de Cowork d'abord.

## Ce qui est livré

| Point de la consigne | Fait | Où |
|---|---|---|
| § 1 Passages larges, centrés sur le seuil | Oui, pour A, C et P | `fondDeLaBarre`, `js/tableau-bord-apercu.js` |
| § 2 Voile gardé | Inchangé, gardé par une sentinelle | `.barre-indicateur-overlay`, `styles.css` |
| § 3 Axe de A et C : deux choix, proportionnel par défaut | Oui ; P reste proportionnel | `cassureDeLaBarre`, `positionSurEchelleDistribution`, `valeurSurEchelleDistribution` |
| § 3 Seuil lu à sa source | Oui, `borneBasseAssiduiteCompletion` | même fichier |
| § 3 Réglage et exemples dans Labo › Outils d'observation | Oui, sous « Seuils d'interprétation » | `index.html`, `js/preferences-v2.js` |
| § 3 Rien d'écrit sans geste | Oui : `sauvegarderAxeBarresV2` a son propre geste | `js/preferences-v2.js` |
| § 4 Captures Mac (Chrome) | Oui, Chrome 156, pack de démo (données fictives) | `plans de travail/captures/barres-apercu-*-chrome-mac.png` |

## Les mots à valider par Grégoire

Rien d'autre que ces textes n'est soumis. Ils sont en ligne dans le code, à l'état de proposition.

- Intertitre : « Axe des barres de l'Aperçu »
- Étiquette d'effet : « Aperçu › barres Assiduité et Complétion »
- Présentation : « Comment les barres Assiduité et Complétion répartissent leur largeur. La barre Performance reste proportionnelle. Ce choix ne change ni les seuils, ni les couleurs, ni aucun calcul. »
- Premier choix : « Proportionnel (par défaut) » – « Chaque point de pourcentage a la même largeur, de 30 à 100 %. Les distances se comparent à l'œil, mais un groupe régulier se tasse à droite. »
- Second choix : « Deux segments » – « De 30 % à ton seuil le plus bas, l'axe tient dans le premier quart de la barre ; de ce seuil à 100 %, dans les trois autres. Un groupe régulier s'étale, mais les distances de part et d'autre du seuil ne se comparent plus. »
- Info-bulle de la graduation du seuil : « L'axe change d'échelle à ce seuil »

## Ce que la mesure a corrigé de la consigne

**L'Aperçu n'a aucune graduation aujourd'hui.** La consigne en parle comme d'un élément existant (« les graduations disent la cassure ») ; `grep graduation js/ styles.css` ne rendait rien, et une décision antérieure dit que rien ne s'écrit sous les barres (#821, bloc 6b, sentinelle `sentinelle-821a`).

**Le `fond()` de l'ébauche ne tient pas sa promesse à la cassure.** Il pose les deux bornes du passage et laisse le navigateur interpoler. En deux segments, un point n'a pas la même largeur des deux côtés du seuil : à 85 %, le milieu du passage tomberait à 30,7 % de la barre, pas à 25 %. Le code pose donc un arrêt explicite au seuil, à la couleur du mélange.

## Ce que j'ai décidé seul (suppositions à corriger au besoin)

1. **Graduations seulement sur A et C, seulement en deux segments.** En proportionnel et sous P, rien sous la barre : c'est ce qui rend le défaut identique à aujourd'hui. Les deux exemples du réglage les montrent, pour comparer.
2. **Le passage reste symétrique en points, pas en largeur à l'écran.** En deux segments, le passage autour de 85 % va de 82,5 à 87,5 : 1,1 % de la barre à gauche du seuil, 12,5 % à droite. Le rouge s'arrête donc presque net, et l'orange s'étale. C'est visible sur la capture. La couleur au seuil est exacte ; si l'effet déplaît, le calcul peut passer en largeur à l'écran.
3. **Le minimum de 1,5 point cède devant le milieu d'une zone.** Sur des seuils collés (85, 86), deux passages de 1,5 point se croiseraient. Chacun s'arrête donc au milieu de la zone partagée, qui garde sa couleur pure. La consigne ne prévoit pas ce cas.
4. **Le réglage vaut pour tous les trimestres** : `axeBarresApercu` dans `preferencesUtilisateur`, clé globale, comme les autres préférences d'affichage.
5. **Un seuil hors de l'axe (30 % ou moins) laisse l'axe proportionnel.** Les champs refusent de toute façon moins de 50.
6. **Une graduation à moins de 10 % de la barre de sa voisine s'efface.** Le début de l'axe, la cassure et 100 % restent. Conséquence : l'exemple proportionnel n'affiche que 30, 85 et 100 (la première version faisait se chevaucher 95 et 100).
7. **Les points des exemples viennent d'un groupe fictif écrit dans le code**, sans aucune donnée d'élève.

## Source ou stock

Aucun stock : la préférence est neuve, absente chez tout le monde, et son absence vaut le défaut. Le fond se recalcule à chaque rendu. Rien à réparer chez personne. En revanche, le changement du § 1 s'applique à tout le monde dès la mise en ligne, en proportionnel aussi : c'est la décision de Grégoire (« pour tout le monde »), donc à annoncer aux Nouvelles de la prochaine version.

## Vérifié comment

- **Vitest entier** : 856 fichiers, 10 507 verts, 0 rouge (`npm run test:unit`, 22 h 15).
- **Specs WebKit** : `barres-apercu-axe` (neuve), 2 essais répétés 5 fois sans reprise, 10 verts ; `seuils-une-source` et `bulles-au-doigt-540`, 10 verts ; `solo-suit-le-reglage-1117` et `guidage-demo-29-oct` aussi lancées avant la dernière retouche de la spec neuve, vertes.
- **29 mutations dans une copie jetable** : toutes rougissent une garde, le code restauré après chacune (journal en fin de `tests/unit/sentinelle-barres-apercu-2026-10-30.test.js`). La mutation M17 (le fond de l'Aperçu sans la cassure) rendait 0 rouge à la première passe : une garde a été ajoutée, 1 rouge depuis.
- **La couleur au seuil** : la sentinelle lit le fond CSS comme un navigateur (ses arrêts, puis une interpolation), sans connaître le code, pour A, C et P, sur quatre jeux de seuils, dans les deux axes.
- **Modes clair et sombre** : regardés sur capture, dans Chrome. Seul le mode clair est versionné.
- **Audit de sécurité sur le diff** : un seul `innerHTML` neuf (`rendreExemplesAxeBarres`), qui ne contient que des chiffres et des couleurs du code ; aucun handler inline, `eval` ou `console.log` ; ni `config.js`, ni `navigation.js`, ni `noms_stables.json` touchés.

## Pas éprouvé

- La vérification complète du navigateur : pas prise, elle se prend après la relecture, Cowork fermé, et avant un push.
- L'iPad, et Safari hors banc. La cible tactile des deux boutons du réglage n'est pas mesurée : ils suivent le patron des cases voisines (`bloc-option-label`).
- Le rendu sur le codex réel de Grégoire : les captures sont sur le pack de démo.

## Trouvailles en chemin (hors lot, code étranger)

Aucune n'entre au BACKLOG : aucune n'a de symptôme vécu par Grégoire et aucune ne bloque un chantier. Issue 3 des trois issues, notées ici plutôt que commentées dans le code pour que Cowork puisse les arbitrer.

1. `tests/integration/seuils-une-source.spec.js` appelle `naviguerVers('tableau-bord', 'apercu')`, section qui n'existe plus (console : « section inconnue »). La spec reste verte, parce qu'elle lit les barres déjà dessinées à l'activation de la démo.
2. L'Aperçu écrit « 1 étudiant·e en Développement montrent une progression favorable » : le verbe ne s'accorde pas au singulier. Visible sur les captures.
3. `design-system.html` décrit encore la barre « orange → vert → bleu », périmé depuis la 1.227.
