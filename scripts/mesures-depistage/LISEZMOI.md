# Mesures du chantier dépistage

Scripts qui rejouent le dépistage du module Suivi sur un codex. **Scripts seulement** : aucune donnée, aucun résultat, aucun agrégat dans le dépôt. Les résultats restent privés tant que le comité d'éthique du cégep ne s'est pas prononcé (décision de Grégoire, 30 oct. 2026).

| Script | Ce qu'il mesure |
|---|---|
| `rejeu-rai.mjs` | La répartition des niveaux RàI, semaine par semaine, et ce que retient chaque test |
| `double-discordance.mjs` | La double discordance (niveau ET pente sous le groupe), sa stabilité, ce que deviennent les signalés |
| `comparaison-au-groupe.mjs` | Le niveau comparé au groupe-cours, avec plancher à la note de passage, à côté du modèle en place |
| `niveaux-sans-plancher.mjs` | Les niveaux 2 et 3 relatifs au groupe-cours, sans plancher, avec et sans la condition du repère de maîtrise, et le signal de groupe |
| `rejeu-demo.mjs` | Le rejeu sur le pack de démonstration (élèves fictifs, sans codex) |

## Relancer une mesure

Il faut Node et le WebKit de Playwright installés par `tests/` (`cd tests && npx playwright install webkit`).

```sh
# 1. Le code d'un commit exact, hors du dépôt
git worktree add /chemin/hors-depot/site <commit>

# 2. Un dossier privé pour l'agrégat, hors du dépôt
mkdir -p /chemin/hors-depot/resultats

# 3. La mesure, depuis la racine du dépôt
MESURE_CODEX=/chemin/du/codex.zip \
MESURE_SITE=/chemin/hors-depot/site \
MESURE_SORTIE=/chemin/hors-depot/resultats \
node scripts/mesures-depistage/rejeu-rai.mjs

# 4. Le ménage
git worktree remove /chemin/hors-depot/site
```

`rejeu-demo.mjs` ne demande pas `MESURE_CODEX`. `comparaison-au-groupe.mjs` exige un commit qui porte le lot 1 du 30 oct. 2026.

Chaque script affiche l'empreinte SHA-256 du codex et le commit du code. Il refuse un site ou une sortie placés dans le dépôt, et un site qui a des changements non commités.

## Ce que les scripts font des données

- Chaque trimestre tourne dans un navigateur WebKit vierge, jamais dans un profil réel. Rien n'écrit dans le codex d'origine.
- Seul `donnees.json` sort du ZIP, le temps de le lire : les copies numérisées restent dedans. Les clés inutiles au calcul n'entrent pas dans le navigateur (`EXCLUS`, `commun.mjs`).
- Les valeurs par élève restent dans le navigateur. Le terminal et l'agrégat ne reçoivent que des effectifs et des médianes, sans nom ni numéro d'élève.

## La règle, pour toute mesure de ce chantier

1. Le script est conservé ici.
2. Les résultats ne vont que dans une page privée, jamais dans le dépôt.
3. Chaque rapport cite l'empreinte du codex et le commit du code.

Les générateurs de pages ne sont pas conservés ici : ils contiennent des résultats.
