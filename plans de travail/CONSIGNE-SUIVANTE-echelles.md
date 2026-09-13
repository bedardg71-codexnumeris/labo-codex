# Consigne SUIVANTE – La grappe `js/echelles.js` (#659 fermée par la mesure, #658 comme lot)

> **Écrite par Cowork le dimanche 13 septembre 2026, 17 h (Toronto), PENDANT que le lot #858/#801 est en cours.**
>
> ⛔ **Ce n'est pas la consigne du jour.** Ne l'ouvre pas avant d'avoir commité le LOT B (#801).
> Quand ce sera le moment : archive `CONSIGNE-DU-JOUR.md`, renomme ce fichier à sa place, et reprends la mesure de §1 sur le
> sommet du moment — les numéros de ligne ci-dessous datent de `873ffe2c` et ton propre lot va les bouger.
>
> **Mesuré par Cowork le 13 sept. à 16 h 45 sur `873ffe2c`.** Tout compte ci-dessous est écrit avec sa commande.

---

## 0 · Ce que la mesure change du plan

La grappe `js/echelles.js` porte six fiches. **Aujourd'hui il n'en reste qu'une qui soit un lot de code.**

| Fiche | Ce qu'elle devient | Pourquoi |
|---|---|---|
| #659 | **fermée par la mesure, sans code** | sa source est tarie par #520 (§2) |
| #658 | **LE LOT** | vivante, et la mesure l'élargit (§3) |
| #586 | ⛔ **hors de portée** | arbitrage de Grégoire du 28 août (§5) |
| #624, #601 | reportées | données déjà écrites chez Grégoire |
| #574 | reportée | question de pédagogie, pas de code |

---

## 1 · Ce qui est mesuré

- `index.html` **5217–5226** : le bloc `<!-- Conteneurs cachés pour compatibilité --> <div class="u-hide">` contient
  **huit `<div>` vides** : `vueEchellesNiveaux`, `selectEchelleTemplate`, `nomEchelleContainer`, `typeEchelle`,
  `seuilReussite`, `champAutreEchelle`, `tableauNiveaux`, `apercuEchelle`.
- **Chacun de ces huit identifiants n'existe qu'UNE fois dans `index.html`, et cette fois-là est dans ce bloc.**
  `grep -c 'id="typeEchelle"' index.html` ⮕ 1. ⮕ **Il n'y a pas d'éditeur vivant derrière ces identifiants. Il n'y en a plus.**
- Lecteurs JS, `getElementById` : `selectEchelleTemplate` 4, `typeEchelle` 3, `seuilReussite` 2, `tableauNiveaux` 2,
  `vueEchellesNiveaux` 1, `nomEchelleContainer` 1, `apercuEchelle` 1, **`champAutreEchelle` 0**.
- `configEchelle` : **aucun lecteur hors `js/echelles.js`** (`grep -rn configEchelle js/ tests/`, hors le banc de #520).
- `docs/DATA-OWNERSHIP.md` **ne porte d'entrée ni pour `configEchelle` ni pour `niveauxEchelle`**. Le registre est en retard
  sur ces deux clés ; à corriger dans ce lot, quoi qu'il advienne du reste.

---

## 2 · #659 — à FERMER, sans écrire une ligne de code

La chaîne que décrit la fiche est **coupée**. `sauvegarderConfigEchelle` et `changerTypeEchelle` **n'existent plus**
(`grep -c 'function sauvegarderConfigEchelle' js/echelles.js` ⮕ 0) : elles sont parties avec #520 (`d4e2923f`).

`chargerConfigurationEchelle()` (`:1020`) ne fait plus que **lire** (`db.get('configEchelle')`) et poser des `.value`.
L'écriture inconditionnelle au bout du chemin de lecture n'existe plus. La seule écriture restante est `:859`, dans
`chargerEchelleTemplate` — elle suit **le choix d'une échelle**, c'est-à-dire un geste volontaire, pas l'entrée dans la section.

⮕ **Coche #659 en citant ces trois mesures.** Ne la traite pas comme un lot.

### ⛔ Ce que tu ne fais PAS, et qui monte à Grégoire

**TARIR N'EST PAS RÉPARER.** La source est tarie ; le stock ne l'est pas. Les bases où `configEchelle` a déjà été aplatie à
`{typeEchelle: undefined, seuilReussite: 60}` le restent — **y compris la sienne**.

⮕ **Mesure-le et écris-le dans la fiche : combien de clés, quelles valeurs, quel écran s'en sert.** Puis arrête-toi.
Écrire dans ses données est un geste qui lui revient. Ne propose pas de script de réparation dans ce lot.

---

## 3 · #658 — LE LOT · le rendu qui s'adresse à personne

La fiche dit : `afficherToutesLesEchellesNiveaux` (`js/echelles.js:213`) écrit dans `vueEchellesNiveaux`, qui est caché, donc
le bouton « Modifier » qu'elle génère (`:323`, `data-action="chargerEchelleTemplate"`) est inatteignable.

**C'est toujours vrai, et la mesure l'élargit** : ce n'est pas un conteneur caché, ce sont **les huit**.

### Ce qu'il faut mesurer AVANT de couper

Pour chacun des huit, et pour chaque lecteur JS recensé au §1 : **le code qui le lit fait-il quelque chose d'observable ?**
Poser `.value` sur un `<div>` ne fait rien. Lire `.value` d'un `<div>` rend `undefined`. **Écris le verdict des huit, un par un.**

⚠ **`chargerEchelleTemplate` (`:817`) est candidate à l'inatteignabilité complète** : ses deux appelants sont `:323` (le bouton
rendu dans le conteneur caché) et `:356`, dans `ajouterNiveauAEchelle` que l'audit Z3 §2.4 classe sans appelant.
**Mesure-le, ne le suppose pas** — et si c'est le cas, c'est du code mort qui part avec le lot, pas une trouvaille à inscrire.

### Forme du lot

Zéro dette : **on retire, on ne neutralise pas.** Pas de stub « au cas où » — c'est exactement ce que ce bloc est devenu.

---

## 4 · ⚠ LE PIÈGE — le bord C de la sentinelle de #520

`tests/unit/sentinelle-520-aucun-id-duplique.test.js:71-72` compte les écritures de `configEchelle` dans `echelles.js` et
**exige exactement 1**.

- **Retirer les `.value` sur les stubs ne touche pas à ce compte** : l'écriture est à `:859`, les stubs sont à `:861-870`.
- **Mais si ton lot conclut que la clé `configEchelle` n'a plus de lecteur et doit partir**, ce banc rougit à `0`.
  Alors **réancre-le délibérément, et écris pourquoi dans le fichier de test** — ne le « répare » pas en changeant le nombre.
  Un banc qu'on ajuste pour qu'il repasse au vert a cessé de prouver quoi que ce soit.

⮕ Et applique la **règle 10** que tu viens de poser : toute assertion négative neuve de ce lot porte sa garde de non-vide.

---

## 5 · ⛔ CE QUI N'ENTRE PAS

- **#586.** ✅ **Arbitré par Grégoire le 28 août 2026, option B** : les cinq familles de duplication ensemble, au titre de
  **#476** — grilles, cartouches, productions, pratiques, échelles. Sa fiche le dit en toutes lettres : « **ne pas l'ouvrir
  comme une retouche** ». Le faire ici renverserait son arbitrage. **Ne le propose même pas.**
- **#624** (suppression et évaluations orphelines) et **#601** (niveaux partagés entre trimestres) : données déjà écrites.
- **#574** (valeurs de départ d'un niveau neuf) : question de pédagogie.
- Le second bloc « ANCIEN SYSTÈME », zone des cartouches : hors sujet, comme au lot #520.

---

## 6 · La preuve

Une sentinelle : **`index.html` ne porte plus de conteneur de compatibilité pour les échelles**, et rien dans `js/echelles.js`
ne rend dans un élément absent du document.

Break-test obligatoire : **repose un des huit `<div>`, montre le rouge.** Sans ce témoin, le banc n'a rien prouvé.

⚠ Le lot est **invisible à l'écran** — tout ce qui part est déjà caché. Il ne demande à Grégoire ni arbitrage ni
vérification à l'écran. **Si, en mesurant, tu découvres qu'un de ces huit est lu par un écran vivant, le lot s'arrête et tu
remontes** : ce ne serait plus un retrait, ce serait une régression.

---

## 7 · Écritures de backlog, dans le même commit

- **#659** : cocher, avec les trois mesures du §2, et la question du stock écrite noir sur blanc — non réparée, à Grégoire.
- **#658** : cocher, avec le verdict des huit conteneurs un par un.
- **`docs/DATA-OWNERSHIP.md`** : inscrire `configEchelle` et `niveauxEchelle` avec leur propriétaire.
- Ne touche ni à #586, ni à #624, ni à #601, ni à #574 — sinon pour écrire, sur #586, que l'arbitrage du 28 août tient.

## 8 · Livraison

Un commit. **Release : patch**, ou aucune si le lot du jour en a déjà emporté une — il n'y a rien à annoncer, rien ne change
à l'écran. `/fin-de-session` porte le rituel. ⚠ **C'est Grégoire qui pousse** : le dépôt est en SSH.
