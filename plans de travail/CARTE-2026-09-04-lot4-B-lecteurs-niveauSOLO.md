# Carte du volet B (lot 4) — « Aucun » au menu « Niveau SOLO » : les neuf fichiers qui lisent `niveauSOLO`

> **Mesurée et écrite le 4 septembre 2026 par Claude Code**, sur la branche `claude/lot-4-gabarit-algo-paliers`
> (partie de `e5d9c71f`), avant d'écrire une ligne du volet — ce que la consigne du jour (§3, volet B)
> demande de rendre à Cowork. `grep -rn -c "niveauSOLO" js/` sur `e5d9c71f` : neuf fichiers, 42 occurrences.
>
> **Le sens arrêté** : « Aucun » (`'aucun'` en base) veut dire *ce critère ne nourrit pas la lecture SOLO* —
> il compte dans la note comme les autres, le dépistage le saute. **Le défaut ne bouge pas** : un critère
> sans étiquette reste `multistructurel` (une fondation), comme `calculerIPB`, l'export et l'éditeur le
> lisent depuis #542.

## Deux objets portent le même mot — un seul est concerné

`niveauSOLO` étiquette **un critère de grille** (ce volet) ET **un niveau d'échelle** (`echelles.js`, #542
lot 2). Les lecteurs d'un niveau d'échelle ne voient jamais un critère : ils sont hors du volet.

| Fichier | Occ. | Ce qu'il lit | Ce qu'il fait d'un critère `'aucun'` | Disposition |
|---|---|---|---|---|
| `grilles.js` | 9 | le défaut d'un critère neuf (`:330`), les deux menus (création `:3399`, édition `:4121`) | rien à lire : c'est l'ÉCRITURE | **modifié** — `<option value="aucun">Aucun</option>` aux deux menus, en dernier ; défaut inchangé |
| `profil-etudiant-calculs.js` | 9 | `calculerIPB` (`:1186`) filtre les multistructurels ; `identifierDefiSpecifique` (`:1366`) porte l'étiquette sur chaque défi ; `libelleNiveauSOLO` (`:2011`) ; la cible d'intensité (`:2127`) | `calculerIPB` le SAUTE déjà (filtre `=== 'multistructurel'`) ✓ ; `libelleNiveauSOLO('aucun')` rendait **« multistructurel »** ✗ ; la cible aurait dit « Langue (multistructurel) » ✗ | **modifié** — `libelleNiveauSOLO('aucun')` rend `''` ; `nommerDefiAvecSOLO` (neuve, pure) omet la parenthèse quand le libellé est vide |
| `trimestres.js` | 6 | l'export du trimestre : `niveau_solo` (`:2129`) et `type` par `typeCritereSelonSOLO` (`:2130`, `:2380`) ; `:2160` = niveau d'échelle | `niveau_solo` porte `'aucun'` tel quel ✓ ; `type` rendait **« fondamental »** ✗ | **modifié** — `typeCritereSelonSOLO` rend `'aucun'`. ⚠ **Format qui voyage** : les deux colonnes gagnent une quatrième valeur (`aucun`) — un lecteur qui n'en attend que trois doit l'apprendre ; dit dans le code |
| `tableau-bord-apercu.js` | 1 | le sous-titre de la barre des patterns (`:2077`) : les critères multistructurels surveillés | le SAUTE ✓ ; mais quand plus aucun critère n'est multistructurel, le sous-titre était **vide** | **modifié** — `libelleCriteresMultiSurveilles` (pure, exportée) : la phrase « Aucun critère multistructurel dans la grille de dépistage : le suivi des fondations ne surveille rien. » (⚠ mots proposés, à Grégoire) |
| `interventions.js` | 1 | le badge SOLO de chaque critère ciblable (`:715`) | badge **« multistructurel »** sur un critère « Aucun » ✗ | **modifié** — pas de badge quand le libellé est vide ; le critère reste ciblable |
| `import-export.js` | 2 | le schéma d'assainissement (`:622`, `:782`) : `niveauSOLO: { type: 'string', maxLen: 50 }` | `'aucun'` passe (chaîne de 5) ✓ — **mesuré par la sentinelle** (`assainirObjet`) | rien |
| `partage-schemas.js` | 1 | le schéma du partage (`:337`) : `{ type: 'chaine', max: 50 }` | `'aucun'` passe ✓ — **mesuré par la sentinelle** (`projeterEntite`) | rien |
| `profil-etudiant-helpers.js` | 2 | `:358` — `niveau.niveauSOLO` d'un **niveau d'échelle** ; `:222` commentaire | hors volet | rien |
| `echelles.js` | 11 | les niveaux d'échelle (défauts `:91-121`, menus `:3313`, `:3652`, `optionsNiveauSOLOEchelle`) | hors volet | rien |

Total : **cinq fichiers modifiés**, quatre sans changement (dont deux mesurés par test). Aucune donnée
de personne n'est touchée : l'option n'existe que pour qui la choisit.

## Ce que le dépistage dit d'une grille dont TOUS les critères sont « Aucun » — mesuré

- **`calculerIPB` rend `null`** (aucun critère multistructurel, `:1189`) → `diagnostiquerSuiviApprentissage`
  rend `null` → le **profil** affiche déjà « Intensité non calculable — aucun suivi des fondations
  disponible » (`profil-etudiant-calculs.js:2111`, texte de #550) ; le **tableau de bord** montre un score
  multi « — » (`scoreMulti` nul).
- Ce qui manquait : la barre des patterns se taisait. Elle dit maintenant la phrase ci-dessus.
- ⚠ **À Grégoire (mots que ses collègues liront)** : la phrase du tableau de bord, la phrase d'aide sous
  le menu (« “Aucun” retire le critère de la lecture SOLO : il compte dans la note comme les autres, mais
  le dépistage des fondations ne le surveille pas et aucune étiquette ne l’accompagne dans les exports. »
  — ↻ arrêtée par Grégoire le 4 sept. à 15 h 50 SANS sa dernière phrase, « C’est le choix d’une méthode
  traditionnelle, sans taxonomie. », retirée : l'aide ne qualifie pas le choix du collègue), et le mot du
  menu (« Aucun »).

## Témoins

`tests/unit/sentinelle-lot4-B-solo-aucun.test.js` : les deux menus ; le libellé et la parenthèse ;
l'IPB nul sur une grille toute « Aucun » ; le sous-titre du tableau de bord ; le transport (import et
partage) ; l'export du trimestre et le badge (statiques, fonctions privées).
