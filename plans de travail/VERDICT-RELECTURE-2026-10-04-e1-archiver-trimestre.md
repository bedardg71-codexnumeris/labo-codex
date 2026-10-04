# Verdict de relecture – E1, archiver un trimestre clos entier (#1022)

> Écrit par Cowork le 4 octobre 2026 à 17 h 19 (Toronto, mesurée par `date`). Porte sur `claude/e1-archiver-trimestre` (`0ac20dba`, `2cbd5016`) et `DEMANDE-RELECTURE-2026-10-04-e1-archiver-trimestre.md`.

## Verdict : vert, aucune correction de code

Relu : `js/reserve-trimestre.js` (collecte, empreintes, mots), la demande de relecture (§ 1 et suivants), le diff (11 fichiers). Ta mesure « l'archive d'un groupe sort identique octet pour octet » couvre la refonte de `reserve.js` : acceptée sur ce témoin.

Vérifié à la lecture, et par une recherche de Cowork dans `js/` :
- **Le préfixe est strict** (`<trimestre>_`), et ta clé piège `h2032x_…` le prouve.
- **Les clés par groupe-cours que le préfixe ne voit pas** : `seancesCompletes_gc_<id>` (emportées) ; `snapshots` est bien préfixée (`cle('snapshots') + '_' + coursId`, `snapshots.js` l. 93) ; **`thumbnail_<idFichier>` est globale et n'est pas emportée**. Acceptable pour E1 : la vignette se régénère depuis le fichier (`travaux-import.js` l. 1008, 1094). ⮕ **À reprendre en E2 et E3** : E3 doit retirer les `thumbnail_<id>` des copies qu'il rend (sinon 8 Mo de vignettes orphelines pour H2026, mesure du 30 sept.) ; E2 doit les régénérer ou les laisser se régénérer. Écris-le à la fiche d'E3.
- **Une copie sans fichier** au moment d'archiver est comptée, pas inventée. ⮕ **Pour E3** : rendre un trimestre doit être refusé si l'archive n'a pas toutes les copies que l'application a.
- **Ta section `pour_memoire`**, hors de `donnees.json` : acceptée.

## Les trois boutons « Exporter les données » (#1006)

Décision de Cowork, technique : **retire-les avec leur fonction**. Ta mesure dit qu'ils ne s'affichent sur aucun écran : c'est du code mort, et la règle « zéro dette » le retire. Grégoire ne verra rien changer. Clos #1006.

## Les mots

Portés à Grégoire par Cowork ; sa réponse est dans la consigne.
