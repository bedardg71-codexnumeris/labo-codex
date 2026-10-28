# Demande de relecture – L'Aide, lot 2c bis, la retouche (#1152)

> Claude Code, mercredi 28 octobre 2026, sur `main` (base `c397bc47`). Verdict : `VERDICT-RELECTURE-2026-10-28-aide-lot-2c-bis.md` (Cowork, 12 h 05). Commit de la retouche : `967a365f`. Non poussé, pas de release, pas de verdict Playwright complet.

## En bref

- **Retouche 1 faite** : le paragraphe « Détails » de `tableau-bord` est la phrase de Grégoire, mot pour mot. Plus de « seul endroit », plus d'« urgence ».
- **Retouche 2** : les quatre titres et D4 étaient déjà posés tels que Grégoire les a validés ; rien n'a bougé dans leur texte. La validation (« validé par Grégoire le 28 oct. 2026 à 12 h 07 (« on garde »), mot pour mot ») est notée dans le commentaire HTML des quatre entrées : `tableau-bord` (titre et « Détails »), `profil-etudiant` (titre et D4), `diagnostics`, `tirage-sort`.
- **Aucun fichier `js/` touché.**
- Tests : Vitest complet, depuis `tests/`, **840 fichiers, 10 064 sur 10 064** (10 063 + 1 essai neuf) ; Playwright ciblé, **3 sur 3** (`aide-lot-2c-bis-1152`, `aide-lot-2c-1152`, `aide-forme-1152`).

## Le texte posé

« « Détails » montre A, C et P sur chaque étudiant·e, et un clic sur l'un d'eux ouvre son profil. Les filtres « P < 65 % », « A ou C < 70 % », « Suivi » et « RàI 2-3 » se combinent : ils ne gardent que les étudiant·es qui répondent à tous, et mettent en tête ceux qui cumulent les plus grands écarts ; sans filtre, l'ordre est alphabétique. »

Mesuré contre le code (`js/tableau-bord-apercu.js`, `appliquerFiltres`) :
- sans filtre, tri par `localeCompare` sur le nom (`:314-320`) ;
- avec filtres, un score qui s'additionne d'un filtre actif à l'autre (quatre `score +=`, `:357-365`), le plus grand en tête (`urgence(b) - urgence(a)`, `:370`), le nom en cas d'égalité. « cumulent les plus grands écarts » tient : pour P et pour A ou C, le score est l'écart sous la borne ; pour « Suivi » et « RàI 2-3 », c'est un poids tiré de l'IPB, de la direction ou du niveau, pas un écart au sens strict. La phrase étant celle de Grégoire, je ne l'ai pas retouchée ; je le signale.

## La sentinelle

`tests/unit/sentinelle-aide-2026-10-28-lot-2c-bis.test.js` :
- « seul endroit » et « urgence » ajoutés aux mots interdits de tout le Suivi ;
- l'essai des filtres de « Détails » lit maintenant la phrase entière, et le tri d'`appliquerFiltres` (alphabétique sans filtre, score additionné, plus grand en tête) ; « A ou C < 70 % » reste lu à la borne ;
- un essai neuf : les quatre titres validés, et la mention de la validation dans le commentaire qui précède chaque entrée.

**Break-test** : 8 mutations, 8 rouges (« seul endroit » remis, « urgence » remis, « mettent en tête » changé, un titre changé, la mention du commentaire retirée, un `score +=` changé en `score =`, le tri alphabétique retiré, l'ordre du tri inversé). Arbre restauré, sha256 identique.

## Ce que j'ai supposé

- « Note la validation dans le commentaire HTML de chaque entrée touchée » : les quatre entrées qui portaient « à Grégoire » dans leur commentaire. `acp`, `rai`, `planifier-rai`, etc., portent aussi des phrases soumises dans la demande, mais le verdict ne les nomme pas parmi les mots validés : leur commentaire n'a pas bougé.

## Trouvé en chemin

- Les deux vocabulaires des niveaux RàI (« Préventif », « Intensif » ; « Groupe ciblé », « Individuel ») n'étaient pas au tableau du lot 5 : **inscrit** (AUDIT-AIDE-2026-10-24.md, « Trouvé hors de la section Aide »).

## Le geste à vérifier à l'écran après la mise en ligne

Aide › Suivi › « Consulter le suivi du groupe » : la phrase de « Détails » ne dit plus « seul endroit » ni « urgence ».
