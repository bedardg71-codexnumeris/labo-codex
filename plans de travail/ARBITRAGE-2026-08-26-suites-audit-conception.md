# Fiche d'arbitrage — les suites de l'audit Conception

**Date** : 26 août 2026 · **Base** : 1.99.1, build `0826-0636`
**Sources** : `Rapports/AUDIT-conception-gabarits-2026-08-25.md` et `plans de travail/TRIAGE-audits-2026-08-21.md`
**Artefact jumeau** (l'OPÉRATION — ce fichier est la TRACE) : <https://claude.ai/code/artifact/6ba06b23-b992-40d5-9339-e6b2804a89e6>

> ⚠ **Aucune de ces lignes ne se coche.** Chacune attend un verdict ÉCRIT. Une case cochée dirait
> « j'ai tranché » sans dire *quoi* — c'est l'erreur relevée le 11 août, où cinq décisions sont
> revenues « prises » et introuvables.

---

## Ce que ce document est

Six questions que je ne peux pas trancher à la place de Grégoire. Trois viennent de l'audit
Conception du 25 août, une de son recoupement avec l'audit du 20, deux de l'outillage de test.

**Chaque question porte une recommandation, avec ce qui la fonde.** Ce n'est pas un avis de pair :
c'est une lecture argumentée, à écarter si elle ne tient pas devant l'usage réel.

---

## D1 · #516 — L'astérisque du « Nom du critère » promet un refus qui n'existe pas

**Ce qu'il vit** : la légende validée le 25 août dit « Champ obligatoire — l'enregistrement est
refusé sans lui ». Or une grille dont un critère n'a pas de nom s'enregistre très bien.

**Ce qu'il y a dessous** : la « preuve » qu'en donnait la sentinelle #506 vit dans
`sauvegarderCritere()`, qui lit `#critereNom` — un id **absent d'index.html**, dans une fonction
sans appelant vivant. Le test passait donc *à vide*, en gardant du code mort. C'est plus grave que
l'astérisque : c'est un garde-fou qui ne gardait rien.

| | Option | Ce que ça implique |
|---|---|---|
| A | Refuser vraiment l'enregistrement d'un critère sans nom | La marque dit la vérité. ⚠ Ces champs s'enregistrent SEULS au blur : le refus doit se faire sans empêcher de continuer à taper. |
| B | Retirer l'astérisque de ce champ | Plus rapide, et honnête : un critère sans nom n'a jamais rien cassé. Mais un garde-fou cru acquis disparaît. |

**Recommandation : A.** La légende a été validée en la lisant comme une promesse. Dans les deux
cas, la preuve du test est réancrée sur le chemin vivant — non négociable.

**VERDICT** : ________________________________________________

---

## D2 · #517 — La matrice d'une cartouche ne s'enregistre qu'au bouton

**Ce qu'il vit** : dans une grille ou une échelle, ce qu'on tape est gardé au fil de la saisie.
Dans une cartouche, rien n'est écrit tant qu'on n'a pas cliqué « Enregistrer », tout en bas d'un
long écran. Changer de cartouche, d'onglet, ou fermer l'app perd la matrice entière, en silence.

**Ce qu'il y a dessous** : c'est le modèle **inverse** de ses trois voisins, dans le même onglet.
Cette incohérence suffit à produire la perception « des fois ça enregistre, des fois non » — celle
qui a déclenché l'audit. L'écran cartouche est aussi le seul des quatre sans barre d'actions en tête
(#503 visait « les trois écrans » ; l'utilisateur en voit quatre).

| | Option | Ce que ça implique |
|---|---|---|
| A | Enregistrement automatique, comme grilles et échelles | Les quatre écrans se comportent pareil — le sens même du chantier « des gabarits qui se ressemblent ». |
| B | Garder le bouton + avertir avant de perdre la saisie | Moins de travail, mais l'écran reste le mouton noir des quatre. |

**Recommandation : A.** L'uniformité est ce qui était demandé pour cet onglet, et le bouton ne
protège de rien qu'un enregistrement automatique ne protège mieux.

**VERDICT** : ________________________________________________

---

## D3 · CO-33 / D1 du 21 août — Le régime des cartouches, décidé mais jamais planifié

**Ce qu'il vit** : grilles, échelles et productions appartiennent chacune à un trimestre. Les
cartouches, non : partagées entre tous, mêlées à celles de la démo, et orphelines quand la grille
qui les portait est supprimée.

**Ce qu'il y a dessous** : **la décision est déjà prise** — « namespacer par trimestre », triage du
21 août. Elle n'a jamais reçu de numéro de backlog ni de place dans l'ordre des chantiers, et dort
depuis. Elle touche le même écran que D2.

| | Option | Ce que ça implique |
|---|---|---|
| A | D2 et D3 dans le même chantier | Un seul passage sur l'écran cartouche. On n'y revient pas. |
| B | D2 maintenant, D3 plus tard | ⚠ Une migration de données doit pouvoir être annulée SEULE. |
| C | D3 d'abord, D2 ensuite | Le rangement avant le confort. |

**Recommandation : B.** Non par prudence de principe : parce que si une migration est mêlée à un
changement d'interface, on ne sait plus ce qui a cassé quoi quand ça tourne mal.

**VERDICT** : ________________________________________________

---

## D4 · #518 — Un bloc rempli mais sans nom disparaît à l'enregistrement

**Ce qu'il vit** : un bloc ajouté à une production, du texte écrit dedans, pas de nom — le bloc et
son contenu sont écartés à l'enregistrement, sans un mot.

**Ce qu'il y a dessous** : la règle se défend (un bloc sans nom ferait un bandeau vide au-dessus du
vide dans le document remis aux étudiant·es). Mais c'est du texte **tapé** qui disparaît.

| | Option | Ce que ça implique |
|---|---|---|
| A | Avertir avant d'enregistrer | « Un bloc sans nom ne sera pas conservé » — l'utilisateur tranche. |
| B | Refuser d'enregistrer tant que le bloc n'est pas nommé | Rien ne se perd, mais on est bloqué. |
| C | Garder le bloc avec un nom par défaut | ⚠ « Bloc 2 » se retrouverait dans le document distribué. |

**Recommandation : A.** Le seul des trois qui laisse décider, et le contenu d'un bloc appartient à
son auteur. B arrête pour une règle de mise en page ; C écrit dans le document un mot non choisi.

**VERDICT** : ________________________________________________

---

## D5 · #495 — Huit tests rouges parce que Safari refuse de lire `version.json`

**Ce qu'il vit** : rien de visible dans l'app. Mais le garde-fou des envois de code compte huit
tests rouges en permanence — ce qui l'a rendu inutilisable le 26 août, jusqu'à deux contournements
en deux jours.

**Ce qu'il y a dessous** (mesuré le 26) : lecture **synchrone** de `version.json` que WebKit refuse
en `file://`. L'exception est attrapée, mais WebKit la signale quand même, et ces huit specs exigent
zéro erreur console. ⚠ **Conséquence réelle au-delà des tests** : sur Safari et sur l'iPad,
`version.json` n'est probablement jamais lu — l'app tourne sur les valeurs de repli inscrites dans
`init-inline.js` et `main.js`. Ça marche (le script de release les synchronise), mais la détection
des scripts périmés en cache (#285) repose sur cette lecture.

| | Option | Ce que ça implique |
|---|---|---|
| A | Corriger la lecture de `version.json` | Ferme les huit tests ET répare la détection de cache sur l'iPad. |
| B | Apprendre aux specs à ignorer ce bruit | Plus court, mais on éteint le voyant sans réparer ce qu'il signale. |

**Recommandation : A.** Ce n'est pas qu'un problème de tests : si Safari refuse cette lecture,
l'iPad la refuse aussi.

**VERDICT** : ________________________________________________

---

## D6 · Par quoi on enchaîne

**L'état** : le triage du 21 août a séquencé dix chantiers ; quatre sont franchis, le plan s'est
arrêté au rang 5 depuis cinq jours — le terrain a été occupé par les demandes directes et par
l'audit. Rang 5 = **#463**, les suppressions gardées : sept familles supprimables sans garde-fou, à
traiter avec le patron #449 déjà validé.

| | Option | Ce que ça implique |
|---|---|---|
| A | Reprendre le plan au rang 5 (#463) | Le morceau structurant, pendant qu'il reste du temps avant la rentrée. |
| B | D'abord D1, D2, D4 | Correctifs bornés, sur l'onglet qu'il vient d'éprouver. |
| C | D'abord l'outillage (D5 puis #523) | Réparer le garde-fou avant de livrer davantage. |

**Recommandation : B, puis C, puis A.** Les décisions ci-dessus sont courtes et l'onglet Conception
vient d'être éprouvé : c'est le meilleur moment. L'outillage ensuite, sinon chaque chantier paiera
le même prix. Le rang 5 après, avec une session entière devant lui.

**VERDICT** : ________________________________________________

---

## Ce que je n'ai pas mis dans cette fiche

- **#519 (passe design)** et **#520 (ablation de l'« ANCIEN SYSTÈME » des échelles)** : pas de
  décision à prendre, seulement du travail à faire. Ils attendent leur tour.
- **#522 (audit des autres autosaves)** : idem — `db.modifier` existe, reste à recenser qui devrait
  y passer.
- **#523 (deux specs rouges en suite)** : ce n'est pas une décision, c'est une enquête. La condition
  du prochain essai est écrite dans l'item : machine au repos **et GitHub Desktop fermé**.
- **C2 (la légende des astérisques sur les trois autres écrans)** : dépend de D1. Si l'astérisque du
  nom de critère est retiré, la légende à poser n'est plus la même.
