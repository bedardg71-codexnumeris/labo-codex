# Consigne – Trouver pourquoi l'essai (g) des présences perd parfois le geste, puis mettre la 1.229 en ligne (31 octobre 2026)

> Écrite par Cowork le samedi 31 octobre 2026 à 16 h 24 (Toronto, mesuré par `date`), sur `main` = `ea5dd046` (release `b554565d` + le relais), `origin/main` = `eb08f1af` (1.228.0 en ligne). Suite de `RAPPORT-2026-10-31-verdict-rouge-1229.md` (#1212).
> **Décision de Grégoire, 16 h 23** : un seul lot pour établir la cause, puis le verdict ce soir **quoi qu'il arrive**. Motif : le défaut est mesuré à 3 sur 20 sur la 1.228 comme sur la 1.229, et aucun commit du lot ne touche `js/saisie-presences.js`, `js/modes.js`, `js/presences.js` ni la spec (remesuré par Cowork : `git log eb08f1af..b554565d -- …` vide). Garder la 1.229 hors ligne ne protège donc personne.

## 0. Avant tout

- Aucune autre session ne tourne ; pas de `git stash`.
- **Commit de docs seul d'abord** : ce fichier, et les trois preuves de relecture du lot 1.229 restées hors commit (`VERDICT-RELECTURE-2026-10-31-palettes-annotation.md`, `TEXTES-2026-10-31-palettes-annotation.md`, `TEXTES-2026-10-31-note-actuelle-sommative.md`). Décision de Cowork : elles sont citées par la consigne de mise en ligne, leur place est au dépôt. Le reste (`CONSIGNE-DEMARRAGE-COWORK.md`, `REFLEXION-2026-10-30-…`, `captures/fenetre-de-fusion-*.png`) reste hors commit.

## 1. Le diagnostic, borné

**Question** : dans les essais rouges, pourquoi `_armerEnregistrementPresences` n'est-il jamais appelé après `fill` + `blur` ?

**Piste de Cowork, lue dans le code, non mesurée** :
- `ouvrirSaisieDemo` n'attend que le premier `#tbody-saisie-presences input[id^="periodes_"]` **attaché** (`toBeAttached`), pas un tableau stable.
- Si le tableau est rendu plus d'une fois après `naviguerVers('suivi', 'saisie')`, `fill` peut tomber sur un nœud qu'un second rendu remplace aussitôt.
- Le `change` d'un nœud détaché ne remonte pas jusqu'à la délégation de `document` (`js/main.js`, l. ~1395, `data-on-change`) : `mettreAJourLignePeriodesHandler` ne part pas, rien n'est armé, le témoin reste vide.
- Cela expliquerait aussi ton écouteur `change` à 0 dans des essais verts, s'il était posé sur le nœud et non sur `document`.

**Mesure qui départage** (copie jetable, comme ce midi, retirée après) : sur 20 répétitions de (g) sans reprise, journaliser avec horodatage chaque écriture dans `#tbody-saisie-presences` (`chargerTableauPresences`, l. 1454, et les autres écrivains du tbody, l. 1280, 1318, 2170, 2201), et au moment du `blur`, `isConnected` du nœud qui a reçu le `fill`. Si les rouges coïncident avec un nœud détaché, la piste tient ; sinon, elle tombe, et tu le dis.

**Borne** : une heure de mesure. Au-delà, branche C.

## 2. Trois issues

**A. Le banc perd le geste** (nœud remplacé, ou autre cause propre au banc) :
- Corrige le banc pour qu'il agisse sur un tableau stable (dans `ouvrirSaisieDemo` ou `changerPeriodes`, selon ce que la mesure montre). Les quatre `expect` de (g) restent inchangés.
- Contre-épreuve : neutraliser `_armerEnregistrementPresences` fait rougir (g).
- (g) seul, 20 répétitions sans reprise : 0 rouge attendu.
- Puis une mesure d'exposition : à quel moment, après l'ouverture de la saisie, tombe le dernier rendu ? Si un rendu peut arriver pendant qu'une personne tape (au-delà de la première seconde, ou déclenché par autre chose que la navigation), c'est une saisie perdue possible chez un vrai utilisateur : **inscris-la** (issue 2, numéro au rapport), ne la corrige pas dans ce lot.

**B. L'application perd la saisie, hors du banc** :
- Correctif qui tarit la source, avec un test qui échoue sans lui.
- Source ou stock : une saisie jamais écrite ne se répare pas après coup ; écris-le au rapport, et dis si quelque chose permettrait à Grégoire de repérer une séance touchée.
- **Arrête-toi avant le verdict** : rapport à Cowork pour relecture croisée (une écriture dans ses données réelles).

**C. Rien d'établi au bout de la borne** :
- Aucun changement de code ni de spec. Rapport de ce qui est écarté.
- Verdict relancé tel quel : HEAD ne diffère de `b554565d` que par des docs. La garde (g) reste en place, rien dans `playwright-baseline.json`.

## 3. Le verdict, ce soir

Au signal de Grégoire, quand sa journée est finie (A et C ; B après la relecture). `node scripts/verdict-en-morceaux.mjs` (skill `fin-de-session`, § 4.5). **Avant de lancer**, dis-lui : « ferme Cowork, Chrome et Safari sur le Mac, je lance la vérification » ; Mac sur secteur (vérifie-le), sans veille.

- **Vert** : `git push`.
- **Rouge** : ne pousse pas ; rapport à Cowork. Si c'est encore (g) seul en branche C, dis-le en tête : le taux serait alors plus haut que les 3 sur 20 mesurés.

## 4. Après le push

- Les gestes du § 4 de `CONSIGNE-LOT-2026-10-31-mise-en-ligne-1229.md`, tels quels.
- #1212 : sa disposition au BACKLOG (fait en A ou B, avec la phrase « vérifié comment » ; ouvert en C, avec ce qui est écarté).
- `OU-EN-EST-ON.md` en fin de session.
