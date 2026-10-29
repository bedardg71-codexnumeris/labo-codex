# Demande de relecture – Des standards sans portfolio, lot 3 : les Productions ne poussent plus vers une terminale (#1178)

> Claude Code, jeudi 29 octobre 2026. Consigne : `plans de travail/CONSIGNE-LOT-2026-10-29-standards-sans-portfolio-lot-3.md`.
> Textes : `plans de travail/TEXTES-2026-10-29-standards-lot-3.md` (textes 1 et 2, posés mot pour mot).
> Commits : `d0a0e6cf` (docs du § 0), `3674b919` (code), puis celui de cette demande. **Pas de release, de verdict ni de push.**

## Vue d'ensemble

Un seul fichier de code, `js/productions.js` (plus son jeton anti-cache dans `index.html`). Trois gestes : la pondération
n'est plus exigée en Standards ; la zone « À vérifier » dit le texte 1 quand la pratique n'a aucun « Artefact » ; les
définitions « Évaluation terminale » (texte 2) et « Artefact » (« va dans »). **Pour la pratique de Grégoire, la zone dit
mot pour mot ce qu'elle disait.** Aucune donnée réécrite : la règle se lit à l'enregistrement et à l'affichage. Le stock
n'a rien à réparer (une production déjà enregistrée n'a pas changé, elle est seulement jugée autrement).

## 1. Avant → après

| Cas | Avant | Après |
|---|---|---|
| CHIM-1 (5 labos et examens pondérés, aucun artefact, aucune terminale) | « 5 productions pondérées sans évaluation terminale typée : … Choisis laquelle est l'évaluation terminale… » | Texte 1, une ligne, sans bouton |
| CHIM-2 (les mêmes, non pondérés) | zone muette | Texte 1 |
| CHIM-4 (X2 typé terminale, 30 %) | quatre lignes « … n'entre pas dans le calcul STD : seuls le pool d'artefacts et l'évaluation terminale comptent », plus le complément (70 %) | Texte 1 |
| CHIM-4, terminale sans pondération | quatre lignes « n'entre pas… » + « n'a pas de pondération : … non constructible » | Texte 1 + « n'a pas de pondération : … non constructible » (inchangée) |
| CHIM, un labo enregistré à 0 % | refus du témoin : « la pondération est requise : plus de 0 % » | enregistré |
| GREG (6 artefacts, conteneur 60, terminale 40) | muette | muette |
| GREG + un exercice pondéré 10 % | « « Exercice 1 » porte une pondération (10 %) mais n'entre pas dans le calcul STD… » | idem, mot pour mot |
| GREG sans conteneur / sans terminale / terminale sans pondération | complément 60 % / « Typer comme terminale » / non constructible | idem, mot pour mot |
| Sommative, un labo à 0 % | refus | refus (inchangé) |

## 2. La mesure du point 2.2

**L'avertissement « … n'a pas de pondération : la note finale n'est pas constructible » reste vrai sans artefact.**
`calculerDetailsNoteFinale` (`profil-etudiant-actions.js`, bloc des pondérations) pose `erreurConfiguration` dès que la
terminale existe avec `ponderation == null`, sans regarder le pool. Épinglé : CHIM-4 sans pondération de terminale → note
`null`, erreur « Pondération manquante (pondération de l'évaluation terminale)… ». Il reste donc, après le texte 1.

## 3. Ce que j'ai supposé

- **Le texte 1 paraît toujours** dans une Standards sans artefact, même quand l'ancienne zone se taisait (CHIM-2). La
  consigne dit que les règles 3a, 3b et 5 « cèdent la place » au texte 1 ; j'ai lu que le texte décrit le calcul, pas
  une anomalie. Si la zone doit se taire quand aucune de ces règles n'aurait parlé, c'est une condition à ajouter.
- **La famille** se lit par `obtenirTypePratiqueActive` (la désignation du groupe-cours, en stockage), pas par
  l'instance : une Standards « illisible » (adoptée sans échelle, #898) n'exige pas non plus la pondération. La zone,
  elle, garde `_pratiqueActiveEstStd` (l'instance) : sans instance, elle se tait, comme avant.
- **Sans registre chargé** (certains bancs), la règle d'avant s'applique (`typeof … === 'function'`).

## 4. Les trouvailles

| Trouvaille | Issue |
|---|---|
| L'astérisque « Champ obligatoire » de la pondération reste en Standards, où elle n'est plus exigée | Inscrire (#1178, au lot 5 : les mots) |
| En Standards, une terminale ou un conteneur à 0 % s'enregistre : la terminale compte pour rien ; conteneur 0 + terminale 0 → « Pondérations nulles » | Inscrire (#1178) : conséquence du « quel que soit le type » de la consigne, à confirmer par Cowork |
| La note sous la pondération dit « Pour une évaluation formative, utilisez une pondération de 0 % » (toutes familles), alors que 0 % est refusé hors Standards ; et elle vouvoie | Inscrire (ici seulement : aucun symptôme vécu, hors #1178) |
| Lire `plans de travail/` depuis un test : le cliquet `sentinelle-ci-paths-ignore` attrape `path.join(…, 'plans de travail', …)` mais pas `lire('plans de travail/…')`. J'ai suivi le patron de `bareme-2` et `critere-algorithmique-mots`. Effet : un commit qui ne toucherait que TEXTES ne relance pas ces tests | Inscrire (ici seulement) ; à trancher par Cowork si le patron reste |

## 5. Les preuves

- Vitest complet (depuis `tests/`) : 850 fichiers, 10 300 / 10 301 verts. Le seul rouge, `sentinelle-825-ouverture-immuable`
  (`pack-demo-10.js` changé par #1180 sans release), était là au début de session et tombera avec la release.
- `sentinelle-standards-sans-portfolio`, section G : 5 essais. Break-tests (copie de référence, mutation, `-t "G ·"`,
  restauration, sha256 identique) : C1, l'ancien `validerProductionsStd` → 2 rouges (CHIM, mesure 2.2), GREG vert ;
  C2, l'ancien `raisonChampsObligatoiresProduction` → 1 rouge ; C3, les anciennes définitions → 1 rouge.
- `sentinelle-reunification-std-394` : inchangée dans ses cas (le corpus L2 a quatre artefacts) ; son en-tête renvoie à
  la consigne du lot 3.
- Playwright WebKit, `standards-sans-portfolio-lot-3.spec.js` : 2 verts ; sous C1, CHIM-1 rouge, GREG vert. Attente sur
  l'élément, aucun `waitForTimeout`.
- Non lancé : la suite Playwright complète (le verdict du soir).
