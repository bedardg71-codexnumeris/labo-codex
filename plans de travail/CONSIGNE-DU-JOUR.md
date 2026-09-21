# Consigne du jour – l'en-tête du fichier envoyé aux chercheurs dit ce que l'application calcule (#908)

> Écrite le 21 septembre 2026, 9 h 28 (Toronto), par Cowork. **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (#909, #903, poussée en 1.152.0) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-909-903-creer-adopter-pratique.md` (déplacée par Cowork, à commiter avec ce lot).

## 0 · Conditions de départ – mesure-les

- `git fetch && git log --oneline -1 origin/main` porte **1.152.0** (`7c199e45` ou un commit de journal après). Sinon, arrête-toi.
- Aucune autre session n'écrit, aucun `pousser.sh` en cours ; arbre propre hors des non-suivis anciens et des fichiers de Cowork (§4).

## 1 · Ce qui change – `js/trimestres.js`, `exporterFormatRecherche`, rien d'autre

Mesuré par Cowork le 21 sept. à 9 h 28 (lignes à remesurer) :

| Champ | Aujourd'hui | Devient | Qui l'a décidé |
|---|---|---|---|
| `meta.version_monitorage` (l. 2103) | `'6.0.0-beta95'` en dur | la version du code chargé, lue à la source unique existante (`version.js` / `VERSION_MAJEURE`, #849 – ou `version.json` si c'est ce que la chaîne tient pour vrai ; **dis laquelle et pourquoi**) | Grégoire, 17 sept. 13 h 34 (technique) |
| `calculs.description` (l. 2311) | « Indices calculés selon formules Monitorage v6 » | **« Indices calculés par Labo Codex »** | Grégoire, 21 sept. 9 h 28 |
| `calculs.formules.indice_A` (l. 2313) | « Heures présentes / Heures offertes (cumulatif) » | **« assiduité : périodes présentes ÷ périodes offertes, cumulées depuis le début du trimestre (%) »** | Grégoire, 21 sept. 9 h 28 |
| `calculs.formules.indice_C` (l. 2314) | « % artefacts évalués >= Maîtrisé (M) » | **« complétion : artefacts remis ÷ artefacts attendus (%) »** | Grégoire, 17 sept. 13 h 34 |
| `calculs.formules.indice_P` (l. 2315) | « Moyenne pondérée des N meilleurs artefacts (IDME → %) » | **« performance calculée par la pratique de notation du cours ; la méthode varie selon la pratique »** | Grégoire, 17 sept. 13 h 34 |

- Textes **tels quels**, casse et ponctuation comprises (minuscule initiale voulue : ce sont des définitions dans un JSON).
- **Aucun champ ajouté ni retiré** (écarté par Grégoire le 17 : nommer la pratique employée ; retirer les formules). Décision de Cowork : `version_format` reste **1.2** – la structure ne bouge pas, seules des valeurs de texte changent. Si tu mesures qu'un lecteur dépend de ces textes, dis-le.
- **À remesurer avant de poser** : que A est bien le ratio de périodes (`calculerAssiduite`, `js/indices.js:197`, « A = Σ periodesPresentes / Σ periodesOffertes ») et que C compte bien remis ÷ attendus au sens de #871 / #904 (terminale comprise, copie non recevable exclue). Si l'un des deux ne dit pas ce que le texte dit, **arrête-toi** : ça remonte à Grégoire.
- Stock : un export déjà produit ne se réécrit pas (comme au lot 33). Rien n'est écrit dans les données.

## 2 · Preuves attendues

- Sur le **vrai** `exporterFormatRecherche` (banc de `sentinelle-902-export-recherche-vrais-indices` ou voisin) : le fichier produit est relu ; les cinq valeurs exactes ; `version_monitorage` = la version courante (pas une constante recopiée dans le test) ; l'ensemble des clés de `meta` et de `calculs` identique à avant (cliquet).
- Mutations, une clause à la fois, toutes rouges : la version remise en dur ; un mot changé dans chacune des quatre définitions ; un champ ajouté.
- Vitest complet vert. **Release : patch** (rien ne change à l'écran). **Phrase de « Nouvelles » : à PROPOSER à Grégoire** avant de l'écrire (le fichier va aux chercheurs, l'enseignant·e ne voit rien).
- Relecture croisée par Cowork avant le verdict et le push ; push sur le mot de Grégoire seulement.

## 3 · Ce que Grégoire verra (en tête d'`OU-EN-EST-ON.md`)

Rien à l'écran. Réglages › Captures et recherche › export anonymisé : l'en-tête du fichier porte la vraie version et décrit A, C et P comme l'application les calcule, sous le nom Labo Codex.

## 4 · Fichiers de Cowork à commiter avec ce lot

`plans de travail/CONSIGNE-DU-JOUR.md` (celle-ci), `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-909-903-creer-adopter-pratique.md`.
