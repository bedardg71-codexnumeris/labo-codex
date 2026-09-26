# Relecture croisée de Cowork – lot #960 (ouvrir une copie ne réécrit plus rien ; D6 jusqu'au PDF)

> Écrite le 26 septembre 2026, à 18 h 12 (Toronto), par Cowork. Branche `lot-960-retroaction-a-la-main`, relue sur `988c6249` (code `c0255246` + `a749e717`). Relue par lecture du diff `99b022aa..988c6249 -- js/` ET par exécution dans un clone (`git clone --shared`, Vitest complet vert : 642 / 7 459, puis mutations de Cowork, restaurées par `git checkout -- js`, arbre vérifié propre).

## Verdict : À COMPLÉTER – une frontière à aligner, deux preuves, une mesure

Le choix est le bon : les deux sources d'écriture à l'ouverture sont fermées à la source, et D6 passe par une seule règle pour l'écran, le PDF et « Copier tout ». Le complément de « Copier tout » (`null` sans div) et le témoin « amorce en stock → cartouche » sont justes. Mais la frontière « rien d'enregistré » n'est pas la même à l'écran et au PDF, et le réarmement de l'auto-save n'est prouvé par rien.

## Ce qui est demandé

- **R1 · Frontière identique : absent = rien d'enregistré, partout** `[lecture]`. `_commentaireEnregistreDuCritere` rend `critere.retroaction || ''` : un critère enregistré SANS clé `retroaction` (ou avec `null`) devient `''`, donc « enregistré vide » à l'écran ; le PDF, lui, reçoit `c.retroaction` = `undefined` et imprime la cartouche. Au premier « Enregistrer », le vide de l'écran s'écrit, et le PDF bascule à son tour. Corrige : `typeof critere.retroaction === 'string' ? critere.retroaction : null` (seule une chaîne est un enregistré). Essai : un critère stocké sans la clé → écran = cartouche, PDF = cartouche, « Enregistrer » écrit la cartouche. Prouve-le rouge par la mutation qui rétablit `|| ''`.
- **R2 · L'auto-save se réarme après l'ouverture** `[à exécuter]`. Aucun essai ne tient la décrémentation du compteur dans le `finally` de `modifierEvaluation` : si elle disparaissait, l'auto-save serait muet pour toute la session, sans un mot – la pire perte possible pour ce lot. Essai WebKit, par la copie ET par la Liste : ouvrir, attendre la fin du chargement, changer un niveau, attendre > 1,5 s, **la base porte le nouveau niveau**. Mutation : retirer la décrémentation → rouge. Et dis en une ligne si `travauxUI.ouvrirVueCoteACote` (attendu dans le `try`) peut attendre un geste de l'utilisateur sans borne ; les deux autres attentes sont bornées (`_attendreOptionSelect` 2 s, premier critère 3 s, rejet → `finally`), lu par Cowork.
- **R3 · Mutation survivante, MX2** `[exécuté]`. Dans `_rendreCommentairesCriteres`, `commDiv ? commDiv.textContent : null` → `… : ''` : **Vitest complet vert** (642 / 7 459). Soit un essai qui la tue (un critère sans div `comm_` : « Copier tout » garde la cartouche), soit une ligne dans la demande qui dit pourquoi elle est équivalente (chaque critère rendu a toujours son div – à vérifier contre ce que `renderCriteres` dessine, y compris pour un critère ajouté à la grille après l'évaluation).
- **M1 · Les chemins sans copie** `[à exécuter]`. Ta question 8.2 : lance aussi les specs WebKit de la flèche d'élève et du chemin sans copie (`evaluation-920-naviguer-sans-copie`, `evaluation-911-relire-sans-copie`, `dossier-912-synthese-sans-copie`), absentes de ta liste de voisines. Rouge → arrête-toi et dis-le.

## Hors de cause

- **MX7** (`estCommentaireEnregistreVide` sans `trim`) : rouge, 1 essai (#939, l'ordre de la cascade). Le vide fait de blancs est tenu.
- **Ta décision seule : le vide réel seulement** ; l'amorce et « [Non défini] » en stock gardent #939 : retenue.
- **Ta décision seule : le choix sans question vaut remplacement** (`_remplacementConfirme`) : retenue ; l'effet de bord (`cartoucheId` écrit avec les commentaires) est la cohérence que #944 voulait.
- **Le banc du 6 sept. ajusté** (amorce dans le faux écran) : juste, c'est ce que `renderCriteres` pose.
- **Le stock** : une LECTURE change, rien n'est écrit. C'est le cas que D6 visait ; assumé, non mesuré (demande de Grégoire).
- **Point 4 de la consigne** (un niveau changé remplace la rétroaction réécrite à la main) : mesuré, rien changé. Cowork le porte à Grégoire après la fusion, pas dans ce lot.

## Ensuite

R1, R2, R3, M1 sur la branche, un commit, puis complète la demande avec le SHA et arrête-toi : Cowork contre-vérifie (R1 et R3 par exécution dans son clone). Les « Nouvelles » : la phrase tient, garde-la.

---

## Contre-vérification – 26 sept., 18 h 22 (Toronto), sur `82a4f1b8`

**Verdict : VERTE, fusion accordée sous une condition (B1), sans repasser par Cowork.**

`[exécuté]` Clone `--shared` de la branche : Vitest complet **642 / 7 462** vert. Mutations de Cowork, chacune seule, restaurées (`git checkout -- js`, arbre propre) :

| | Mutation | Résultat |
|---|---|---|
| MX2 | « Copier tout » sans div : `''` au lieu de `null` | rouge, 1 (R3) – tuée |
| MR1b | écran : `critere.retroaction ?? ''` (absent redevient vide) | rouge, 2 (R1, les deux formes) |
| MR1c | PDF : `c.retroaction ?? ''` (absent devient vide au PDF seul) | rouge, 2 (R1) |

R2 et M1 sont WebKit : pris sur ta parole (tests nommés, mutation rapportée rouge), hors de portée de Cowork.

**B1 · Borne sur le compteur, à ajouter avant la fusion (tranché par Cowork).** Ta réponse à R2 : `_ouvrirVueCoteACoteModif` attend la lecture du fichier et PDF.js **sans délai maximal**. Avant ce lot, un PDF.js muet ne coûtait que la vue ; maintenant il garde le compteur armé et **l'auto-save reste muet pour la séance, sans un mot** – une perte silencieuse introduite par ce lot, même improbable. Ajoute une borne : le compteur est rendu au plus tard ~15 s après son armement, même si le `finally` n'arrive pas, **une seule fois** (le `finally` et la borne ne décrémentent pas deux fois ; un drapeau par chargement suffit), avec un `console.warn` qui le dit. Essai : une vue côte à côte qui ne résout jamais → après la borne, un niveau changé s'écrit seul. Mutation : borne retirée → rouge. Puis fusionne, prends le verdict, pousse, selon la procédure habituelle ; la phrase des « Nouvelles » : la réponse de Grégoire arrive par lui, avec cette relecture.
