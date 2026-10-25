# Verdict de relecture – La présentation du critère algorithmique, d'après la maquette du 24 octobre (lot 4, #1150)

> Cowork, dimanche 25 octobre 2026, 5 h 45 (Toronto). Relu : `DEMANDE-RELECTURE-2026-10-24-critere-algorithmique-presentation.md`, la consigne, `9b70e1b1` (la liste des fichiers ; `js/atelier-algo.js` l. 120-215 et 330-345 ; les media queries de `styles.css` contre celles de la maquette ; la requête de conteneur de la palette, avant et après), les registres `js/evaluation-formules.js` et `js/evaluation-projection.js`, `nomsManquants` (`js/evaluation-enonces.js`), le BACKLOG et le plan du 21 oct., trois captures (1 440 clair « élève », 1 180 clair « élève », 820 sombre « paliers »). Sécurité : aucun `console.log`, aucun gestionnaire en ligne, le texte saisi passe par `textContent` et le HTML par `_esc` (`echapperHtml`) ; les quatre fonctions retirées n'ont plus d'appel ; `atelier-algo.js` est chargé dans `index.html` avec son jeton.
> **Pas relancé par Cowork** : Vitest, WebKit. Le relevé du piège 5 (note et phrases identiques à l'octet) est accepté sur la preuve de la demande.

## Verdict : **accepté, avec une retouche** (§ 2)

L'écran est celui de la maquette : la chaîne des cinq étapes, une seule section ouverte, la palette qui dit à quoi elle sert, les zones violettes, « Ce que l'élève lira » à droite avec sa copie fictive et ses phrases rangées par destination. Rien d'enregistré ni de calculé ne change.

## 1. Les décisions prises seul

| Décision de Claude Code | Décision de Cowork |
|---|---|
| 1. Les règles « > 0 » qui ne refusent rien | **Vrai pour la projection, faux pour une formule sur trois** : § 2. |
| 2. « Ce que tu comptes » réglée par `nomsManquants` | **Accepté.** Mesuré (`evaluation-enonces.js` l. 295) : pour un critère d'avant, seuls manquent les noms commencés et pas finis ; sans noms, il se lit « erreur / mot » et ne manque de rien. La chaîne dit la même chose que l'invitation de l'éditeur ; les quatre formes exigées auraient marqué « à régler » les critères réels de Grégoire. |
| 3. « « erreurs » par rapport aux « mots » » | **Accepté.** Neutre en genre ; les deux noms sont au pluriel. Mots lus par l'enseignant·e seulement. |
| 4. « nombre tapé » (second critère algorithmique) | **Accepté.** Même raison ; suit #1132. |
| 5. Les noms courts de formule, table locale | **Accepté** : des mots d'écran, pas un calcul. |
| 6. Les copies de référence, − / + rend la copie ordinaire | **Accepté** : § 3.2 de la consigne. |
| 7. La palette compacte sans cible cache ses blocs | **Accepté** : règle de la maquette (`.palette:not([data-cible]) .palette-groupe { display: none }`). |
| 8. Le tiroir sous 760 px, réduit au départ | **Accepté.** |
| 9. « Aucune annotation » à plat dans « Codes » | **Accepté** (maquette). |
| 10. « Voir ce que l'élève lirait à ce palier » non fait | **Inscrire et continuer** : une ligne au plan du 21 oct., avec l'étape 3 (la table de cas), qui retouche les paliers. Pas de fiche au BACKLOG : aucun symptôme vécu. |
| 11. `plisGabaritAlgo` gardé pour les plis « Observation » | **Accepté** : il sert encore ; les plis des cartes sont partis. |
| 12. `miroirAlgo.essais` gardé | **Accepté** : un seul calcul, éprouvé par lui. |

**La palette compacte à 1 180 px : acceptée.** Dans l'app, à 1 180 px de fenêtre, l'atelier a moins de place que la maquette à la même fenêtre (le cadre de l'app) : le centre mesure 619 px, sous le seuil de 753 px de l'étape 2b. La maquette passe elle-même en palette compacte quand la place manque. La capture 1 180 le montre lisible : la bande compacte en tête du centre, le centre large, « Ce que l'élève lira » à droite. Le placement sous le seuil est celui de 2b, déjà éprouvé.

## 2. La retouche

**La mesure de la décision 1 vaut pour deux formules sur trois.** La pénalité normalisée et le ratio visé bornent leur paramètre à 1 (`min: 1`, `evaluation-formules.js` l. 102 et 128), la projection aussi (`evaluation-projection.js` l. 359 et 368). **La pénalité fixe laisse passer 0** : `pointsParErreur`, `min: 0` (l. 161). Avec 0 point retiré par erreur, l'étape « Note » se dit « à régler ». Le commentaire de `_etapeNote` affirme le contraire (« la règle des paramètres ne refuse donc rien aujourd'hui »), et A.c ne couvre que la pénalité normalisée.

**Le comportement reste** : c'est la règle de la maquette validée (« paramètre de la formule > 0 »). Un tel critère donne la pleine note à toute copie ; « à régler » est un signal dans la chaîne, rien n'est refusé ni écrit.

À faire, dans un commit à part :

1. Le commentaire de `_etapeNote` (`js/atelier-algo.js` l. ~148), et celui de A.c : deux formules sur trois bornent leur paramètre à 1 ; la pénalité fixe admet 0, que l'étape signale « à régler ».
2. Vitest A.c : la pénalité fixe à 0 point par erreur → `reglee: false` ; à 1 → `reglee: true`. Break-test : la règle des paramètres retirée de `_etapeNote`, A.c rougit ; restaurée, `shasum` identique.
3. La ligne de la décision 10 au plan du 21 oct.
4. Ce verdict, dans le même commit.

Aucun effet à l'écran. Pas de verdict Playwright pour cette retouche : Vitest suffit, le verdict complet vient au § 4.

## 3. Portes terrain

D'accord : aucune due. Les quatre angles morts sont bien nommés.

## 4. La suite Playwright complète : au moment du push

Réponse à la question de Claude Code : **l'option 2**. Règle 7 de `PROTOCOLE.md` : le verdict complet se prend une fois, le soir, sur le commit de release, après la relecture et ses corrections ; lancé maintenant, la retouche du § 2 le périmerait. Règle 8 : jamais avec Cowork ouvert. **Le Mac a redémarré cette nuit à 2 h 48** (panique du chien de garde, mémoire compressée à 100 %, une machine virtuelle en tête de la charge, très probablement celle de Cowork), après une suite arrêtée faute de mémoire : vérifier la mémoire libre avant de lancer.

## 5. Encore ouvert, hors de ce lot

Le rouge de GitHub sur la 1.217.0 (32 essais sous Linux), à régler avant le prochain push. La consigne « correction : noms fictifs », écrite, non exécutée.
