# Rapport – Le verdict de la 1.219.0 est rouge : la Carte d'alignement, depuis #1148 (26 octobre 2026)

> Écrit par Claude Code le lundi 26 octobre 2026 à 5 h 20 (Toronto), pour Cowork. Consigne :
> `CONSIGNE-LOT-2026-10-25-mise-en-ligne-du-soir.md`, § 3 (« Rouge : ne pousse pas ; nomme le lot
> fautif par les commits ; le rapport va à Cowork »). **Rien n'a été poussé** : `origin/main` reste
> `973ad366` (1.217.0).

## 1. Ce qui a été fait

- Fusion `f2ac8e64` (sans rebase), 1.218.0 `726d200f`, 1.219.0 `d4d78d34`, sur `main` local.
- Premier verdict (`pousser.sh`, le 25 au soir) : arrêté par Claude Code pour mémoire basse en cours
  de suite, aucun jugement rendu.
- Second verdict, décision de Grégoire (option B) : la suite en **10 morceaux** joués l'un après
  l'autre (`scripts/morceau-playwright.mjs i 10`, l'alternance de la CI), `workers: 1` (déjà dans
  la config), sous `caffeinate -d -i -s`, sur secteur. Relevé avant chaque morceau : pression 1,
  78 à 81 % de mémoire libre, échange ~500 Mo, charge sous 4 — **la mémoire n'a jamais monté**.
  Rapports blob fusionnés par `playwright merge-reports`, jugés par `scripts/juger-rapport-playwright.mjs`
  contre la baseline du Mac (`playwright-baseline.json`).
- ⚠ Ce verdict n'a pas écrit `scripts/.verdict-playwright.json` : il n'en fallait pas pour un rouge.

## 2. Le verdict

1 027 essais : 1 019 verts, 1 vert au second essai (`grilles-sous-criteres-condense`), **7 rouges**,
11 sautés. Les 7 sont absents de la baseline, tous sur la Carte d'alignement :

| Spec | Essai | Ce qui échoue |
|---|---|---|
| `planif-drag-pointer-148` | CAS B, tirer une évaluation hors de sa leçon | reste dans `p148L` |
| `planif-drag-pointer-148` | CAS D, un drag souris déplace un nœud libre | `-1575`, attendu `> -1475` |
| `planif-menu-vue` | raccourcis « glisser », « alt-glisser », « alt-glisser-clone », « multi-selection » | le geste ne prend pas (0 au lieu de 1 ; 899 au lieu de > 959 ; 1 sélectionné sur 4) |
| `planif-tout-voir-loupe` | la loupe montre ce qu'on vise | écart 26,1, attendu < 20 |

Lecture (inférence, non mesurée) : un geste de pointeur n'atterrit plus là où il vise, décalé de
quelques dizaines de pixels, ce que ferait une bande plus haute au-dessus du canevas.

## 3. Le lot fautif, par les commits

Les trois specs rejouées seules (`--retries=0`, worktree jetable par commit) :

| Commit | Ce que c'est | Résultat |
|---|---|---|
| `973ad366` | 1.217.0 (verdict vert le 24) | 40 / 40 |
| `28f379d5` | relais de la 1.217.0 | 40 / 40 |
| **`27056905`** | **#1148 : les six accordéons du Trimestre prennent la rangée de sélection ; la Carte d'alignement à l'apparence de la rangée** | **7 rouges** |
| `05843aba` | base commune de la fusion | 7 rouges |
| `f113cdd3` | `main` avant la fusion | 7 rouges |
| `50ecd37f` | la branche des bibliothèques | 7 rouges |

⮕ **Le fautif est `27056905` (#1148, lot 2 du Cadre)**, sur `main` depuis le 24 oct. Les
bibliothèques en deux colonnes n'y sont pour rien. Il touche l'item 1 des Nouvelles 1.218
(« La Carte d'alignement prend la même apparence »). Sa retouche `2e19fddb` ne le répare pas.

## 4. Ce qui n'a pas été fait

Rien n'a été corrigé (consigne : on reprend au réveil). Pas de push, pas de jeton de verdict. À
trancher par Cowork : le code (la Carte à rendre aux gestes) ou les specs (des coordonnées
périmées par la bande), avant un nouveau verdict sur le commit qui suivra.

Rapport fusionné conservé hors dépôt (bloc-notes de la session) : non versionné.
