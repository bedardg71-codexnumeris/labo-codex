# Portes terrain – la 1.230 (2 novembre 2026)

> **La trace.** L'opération est l'artefact « Portes terrain 1.230 », publié par Cowork le 2 nov. après le push de `97f0189a` (1.230.0, build 1102-0522).
> **Elle réunit et remplace, pour l'opération**, les portes des quatre lots du 1er nov. (`PORTES-TERRAIN-2026-11-01-barre-outils-et-codes-compacts.md`, `-palette-evaluation-compacte.md`, `-palette-retroaction-compacte.md`, `-tampons-masques-et-bibliotheque.md`) et la porte proposée par le lot de la copie du 2 nov. Tri de Cowork selon les deux règles de tête du skill `portes-terrain` : les gestes d'apparence et de confort (barre d'outils, palettes compactes, bulles, contrastes) n'ont pas de porte ; Grégoire signale ce qui cloche en évaluant.
> Retiré par Cowork : la porte « Garder dans ma bibliothèque » (le lot suivant mettra tous les tampons dans la bibliothèque, sans geste) ; la question de la place de la copie à 272 pt (corrigée au lot de la Rétroaction).
> Ce qui échoue devient un item de `Retours des testeurs/SUIVI-BUGS.md`, pas une note mentale.

## §0 · Préalable
- [ ] 0.1 · iPad · Ouvre app.codexnumeris.org, recharge, lis le numéro en bas de page. ⮕ 1.230.0.
- [ ] 0.2 · ⚠⚠ Données · Enregistre ton codex avant de toucher à tes tampons. ⮕ le codex se dit à jour.

## §1 · ⚠⚠ Données : ses tampons
Pourquoi : dans la 1.229, sur l'iPad, ses noms revenaient au défaut au rechargement, les tampons retirés revenaient, et « Enregistrer » inscrivait les noms par défaut (#1216). Ne pas supprimer un tampon créé : il disparaîtrait des copies (lu dans le code, à mesurer au lot suivant).
- [ ] 1.1 · Ouvre la personnalisation des tampons, lis les noms. ⮕ ses noms ; échec si « Id. directrice ».
- [ ] 1.2 · Retape les noms revenus au défaut, retire les tampons par défaut non voulus, « Enregistrer ». ⮕ ses noms, ses tampons créés et leurs images.
- [ ] 1.3 · Recharge deux fois, rouvre une copie dans Annoter. ⮕ tout tient ; les tampons retirés restent absents.
- [ ] 1.4 · Mesure · Une copie évaluée avant le 1er nov. au soir, avec des tampons : montrent-ils les anciens ou les nouveaux ? Réponse : ______ (entrée du plan des tampons, aucun échec possible).

## §3 · Décisions
- 3.1 · La hauteur hors plein écran, pour la copie et la Rétroaction, convient-elle à l'usage ? Verdict : ______
- 3.2 · Rétroaction à 200 pt (« Copier tout » seul sur une seconde rangée) ou à 222 pt (+34 px de texte, −22 pt de copie) ? Recommandation de Cowork : 200. Verdict : ______

## §4 · Ce que je n'ai pas pu vérifier
- Le vrai Safari de l'iPad ; tout est mesuré dans WebKit et Chrome sur le Mac.
- La largeur de la copie à l'ouverture sur l'iPad lui-même (`innerHeight` pour `100vh`) : 510 px au banc.
- Les champs Erreurs et Mots en mode sombre : correctif non éprouvé.
- Ses tampons absents de la bibliothèque : non reproduit.
- Une copie verrouillée suit encore les réglages actuels de tampons (règle du 2 nov., 4 h 52, à venir).
- Erreurs de Cowork rattrapées : la copie réduite deux fois par ses consignes (468 → 272 pt, puis −43 % hors plein écran), corrigées avant la mise en ligne.

## Retour du terrain (relevé de Grégoire, 2 nov., 8 h 02)

**Passées 8 / échec 0 / non traitées 0.** Toutes les portes sont closes.

- 1.4 · Mesure : une copie évaluée avant le 1er nov. au soir montre **ses anciens tampons**. L'inférence de Cowork (elle afficherait déjà les nouveaux) est démentie sur ce cas ; à reprendre dans le plan des tampons, qui mesure pourquoi.
- 3.1 · « oui. c'est surtout la largeur visible entre les palettes qui m'importe. Je dois pouvoir bien lire l'écriture manuscrite des élèves d'une marge à l'autre. Le défilement vertical ne me gêne pas, d'autant plus qu'il se fait maintenant à deux doigts sur l'iPad. »
- 3.2 · « On peut aller plus large avec la palette Rétroaction, car j'ai besoin de lire le texte que l'élève recevra. À ce stade du travail, l'annotation est terminée et la relecture de la copie est plus globale. C'est le retour à l'élève qui compte plus. » ⮕ `CONSIGNE-LOT-2026-11-02-retroaction-plus-large.md`.
