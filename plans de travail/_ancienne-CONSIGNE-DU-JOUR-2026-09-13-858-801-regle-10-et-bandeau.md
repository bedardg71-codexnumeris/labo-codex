# Consigne du jour – La règle 10 posée dans le filet (#858), puis le bandeau qui mène (#801)

> **Écrite par Cowork le dimanche 13 septembre 2026, 16 h 20 (Toronto).** Elle remplace la consigne #520, livrée et poussée,
> archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-13-520-ancien-systeme-echelles.md`.
>
> ✅ **#520 est terminé** : `7afa62b9` puis `d4e2923f` sur `origin/main`, sans release (lot invisible). #551 est livré en
> 1.140.5. `origin/main` porte 1.140.5 / `0913-1457`.
>
> ⚠ **Deux commits de documentation attendent le push de Grégoire** (`7b68d9a4`, `873ffe2c`) : le dépôt est en SSH et aucune
> de nos deux sessions n'a la clé. **Ne les recommite pas, ne les rebase pas** — ils partiront avec le tien.
>
> **DEUX LOTS, dans cet ordre.** Le second ne s'ouvre qu'une fois le premier commité. Aucun des deux ne demande à Grégoire
> d'arbitrage ni de vérification à l'écran (règle de sélection du 13 sept.).

---

# LOT A · #858 — une découpe qui refuse de rendre une tranche vide

## A.0 · Ce que ce lot livre

**À l'écran : rien.** Le lot vit dans `tests/`. Ce qui change : trente assertions négatives qui passent aujourd'hui **sans
rien éprouver** se mettent à pouvoir échouer, et l'idiome qui les rend muettes cesse de pouvoir entrer.

C'est l'application de la **règle 10 du `PROTOCOLE.md`**, posée dans `eecaa703` le jour même.

## A.1 · Ce qui est mesuré (Cowork, le 13 sept. à 16 h, sur `873ffe2c`)

Chaque compte est écrit avec la commande qui le produit, depuis `tests/`.

- Corpus : **666 fichiers** `*.test.js` / `*.spec.js`.
- L'idiome, toutes formes confondues :
  `grep -rnE '\.slice\(\s*[A-Za-z_$][A-Za-z0-9_$.]*\.indexOf\(' --include='*.js' .`
  ⮕ **112 occurrences dans 60 fichiers.**
- `.substring(…indexOf(` ⮕ **0**. Inutile de le couvrir.
- Sous-ensemble dangereux, celui de la fiche : **30 assertions négatives sans garde de non-vide, dans 23 fichiers**.

### ⚠ CE QUE LA MESURE CORRIGE DE LA FICHE #858

La fiche demande « un cliquet qui interdit `slice(indexOf(` dans `tests/` ». **Prise au mot, cette phrase porte sur 112 sites
dans 60 fichiers, pas sur 30 dans 23.** C'est presque quatre fois le lot annoncé, et la plupart de ces 112 sont déjà gardés.

⮕ **Décision de Cowork, technique, renversable par Grégoire** : le cliquet est **un cliquet de compte, pas une interdiction**.

- Les **30 dangereuses** sont routées par la fonction qui refuse, et sortent du compte.
- Les **82 déjà gardées** restent où elles sont, figées à leur compte du jour. Le cliquet ne peut que descendre.
- Motif : réécrire 82 sites corrects pour la forme, c'est l'élargissement de scope que la révision du 1er sept. a fermé.

## A.2 · Le premier geste, AVANT tout code

Pour chacune des 30, **vérifier que son marqueur existe encore dans le fichier qu'elle lit.**

**Combien sont mortes aujourd'hui, et pas seulement fragiles, n'est pas mesuré.** C'est ce qui départage une réparation d'une
prophylaxie, et ça ne s'estime pas. Écris le compte dans ton rapport, et cite les fichiers.

⚠ Si l'une est morte, elle a cessé d'éprouver quelque chose que quelqu'un croyait tenu : **c'est une trouvaille de niveau 1**
(corriger maintenant), pas de niveau 2 — la sentinelle concernée est à réancrer dans ce lot.

## A.3 · Le geste

1. Une fonction de découpe partagée — **elle jette en nommant le marqueur manquant**, elle ne rend jamais une tranche vide.
   Emplacement, nom et signature : à toi. Zéro dette : on retire l'idiome, on ne le rapièce pas.
2. Les 30 assertions routées à travers elle.
3. Le cliquet de compte décrit en A.1.

## A.4 · Le cas déjà connu, à router avec les trente

`tests/unit/sentinelle-520-aucun-id-duplique.test.js`, **bord C** : il découpe `echelles.js` par
`indexOf('async function chargerEchelleTemplate(')` puis `indexOf('\nasync function ', …)`. Il porte **déjà** son garde de
non-vide (ajouté à ma relecture croisée du 13, mutation « fonction renommée » : rouge). Il n'est pas dangereux — il est à
router quand même, pour que la garde vive dans la fonction et pas dans le banc.

## A.5 · ⛔ Ce qui N'entre PAS

- **La seconde famille : une preuve qui passe par du code mort** (`sentinelle-506` le 13 sept., après #516 et #524). Elle ne
  se détecte pas par motif — il faut savoir ce qui est atteignable. **Non mesurée, donc non inscrite.** L'inscrire serait
  inscrire un soupçon, et c'est l'erreur payée avec #857.
- Tout fichier hors de `tests/`.

## A.6 · La preuve

La règle 10 s'applique à elle-même : **toute assertion négative neuve de ce lot porte son garde de non-vide.**

Le break-test qui compte : **prends une des 30, rends son marqueur introuvable, et montre que le banc ROUGIT maintenant alors
qu'il restait vert avant.** Sans ce témoin, le lot n'a rien prouvé. Un par famille de découpe suffit.

---

# LOT B · #801 — le bandeau mène aux nouveautés au lieu de les décrire

⛔ **N'ouvre ce lot qu'une fois le LOT A commité.**

## B.0 · Ce que ce lot livre

Au chargement d'une version neuve, le bandeau porte **un bouton qui ouvre les nouveautés**, au lieu d'une phrase qui dit où
elles sont. C'est le défaut d'origine de la fiche, jamais livré ni écarté, mesuré le 13 sept. sur `d07e963d`.

Les gestes 1 et 3 de la fiche sont livrés (1.127.3, `1a7205ee`), le geste 2 est écarté à dessein. **Il ne reste que celui-ci.**

## B.1 · ⚠ CE QUE LA MESURE CORRIGE DE MA PROPRE CONSIGNE

À la relecture croisée du 13 sept., j'ai écrit que le bouton devait « MENER à la carte « Nouveautés » (défilement + focus) ».
**C'est faux, et c'est ma supposition, pas une mesure.** `js/init-inline.js:180` définit `afficherModalNouveautes`, exposée en
`:493`, et elle ouvre la **modale** `#modalNouveautes` (`index.html:4075`). La carte de l'accueil (`js/accueil.js:235`) ne fait
rien d'autre que l'appeler.

⮕ **Le bouton appelle `afficherModalNouveautes`. Il n'y a ni défilement ni focus à écrire.** Corrige la fiche en même temps.

## B.2 · Où, exactement

`index.html` **4058–4074** : `<div id="bandeau-mise-a-jour">`. Son pied (`bandeau-mise-a-jour-footer`, l. 4065–4070) porte
déjà `<button data-action="rechargerPage" class="bandeau-mise-a-jour-btn">Recharger</button>`.

**`js/init-inline.js:410-412` masque « Recharger » quand la mise à jour est LOCALE** (`btnRecharger.hidden = !distant`).

## B.3 · La règle qui évite d'empiler

La fiche porte un ⚠ « Ne pas empiler » : trois boutons dans une fenêtre transitoire, c'est trop.

⮕ **Décision de Cowork, technique, renversable par Grégoire** : le bouton des nouveautés suit la règle inverse de
« Recharger ». **Il ne paraît que dans le cas LOCAL**, celui où « Recharger » est masqué — donc **jamais deux boutons côte à
côte**, et le pied n'en porte qu'un dans les deux cas. Le cas distant ne parle pas de nouveautés : son texte annonce un
déploiement en arrière-plan, pas un changement déjà chargé.

## B.4 · Le texte du bandeau

Avec un bouton qui mène, la seconde moitié de la phrase ne sert plus.

`js/init-inline.js:406`, cas local — proposé, **à corriger par Grégoire s'il veut d'autres mots** :

> `Nouvelle version chargée. Tes données persistent.`

Le cas distant (l. 405) ne change pas.

⚠ Ce sont des mots que lisent ses collègues, pas ses élèves : je tranche, et je le nomme. S'il les reprend, c'est une ligne.

## B.5 · La preuve

`tests/unit/sentinelle-801-canal-de-retour-se-voit.test.js` **n'a pas à changer de portée** : elle interdit
`ouvrirModalRapportBug` dans le bandeau, et cette interdiction tient.

Elle **gagne un cas** : le bandeau porte un déclencheur de `afficherModalNouveautes`, et le banc rougit s'il disparaît.
Mutation obligatoire : retire le bouton, montre le rouge.

Un banc Playwright pour le comportement : version locale neuve ⮕ le bandeau paraît, « Recharger » est masqué, le bouton des
nouveautés est là, un clic ouvre `#modalNouveautes`.

---

# Écritures de backlog, dans le même commit

- **#858** : cocher, avec le compte des assertions mortes trouvées en A.2, et la décision A.1 (cliquet de compte) écrite noir
  sur blanc. Si une sentinelle a été réancrée, la nommer.
- **#801** : cocher, en citant le banc qui tient le bouton. **Corriger la ligne « défilement + focus »** de la disposition du
  13 sept. — c'est une modale, pas une carte.
- **Ne touche pas** à #766 (décision de Grégoire du 6 sept., 11 h : « laissé inscrit, pas de lot ; ne pas le reposer ») ni aux
  autres doubles `class` de #787 : ceux-là changent un rendu et se jugent à l'écran, avec lui. **La grappe `index.html` se
  réduit donc aujourd'hui à #801 seul**, et c'est voulu.

# Livraison

Deux commits, un par lot. **Release : patch**, une seule, après le LOT B — le LOT A ne se voit pas, le LOT B se voit.
`/fin-de-session` porte le rituel ; l'ordre du §4.5 tient (commit, relecture, verdict, push). ⚠ Le push part avec les deux
commits de documentation déjà en attente : c'est Grégoire qui pousse.
