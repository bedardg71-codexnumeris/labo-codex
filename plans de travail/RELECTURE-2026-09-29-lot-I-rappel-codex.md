# Relecture croisée – lot I : le rappel mène au codex (#985)

> Écrite le 29 septembre 2026 à 20 h 48 (Toronto) par Cowork, sur `2efa12cf` (branche `lot-i-rappel-codex`). Relue à la LECTURE (diff de `js/codex.js`, `js/modal-backup-reminder.js`, `index.html`, demande de relecture) et en scénarios ; aucune mutation rejouée par Cowork (banc WebKit hors de sa portée). Lot réversible (une date dans le stockage local) : la relecture en scénarios suffit.

## Verdict : à compléter avant la release

Conforme à D8 et à la consigne : mots mot pour mot, crochet au point « à jour » (`_marquerCodexAJour`, seul appelant ligne 3064), croix à 14 jours, « Ne plus rappeler » et date plus lointaine respectés. Les suppositions techniques du § 2 sont retenues.

## 1 · Défaut trouvé en scénario (technique, tranché par Cowork)

`delaiApresMiseAJour` est un état du module qui n'est jamais remis au défaut. Scénario : l'usager choisit « 30 jours » dans le rappel, clique « Mettre à jour le codex », la mise à jour échoue ou il annule ; plus tard, dans la même page, il met le codex à jour par le menu → report de 30 jours au lieu de 14. Même chose avec « 7 jours ».
⮕ Correction : remettre `delaiApresMiseAJour` à `DELAI_PAR_DEFAUT` dès qu'il a servi (dans `reporterApresMiseAJourDuCodex`, y compris quand le report est écarté par « Ne plus rappeler » ou une date plus lointaine), et à chaque ouverture du rappel. Un essai au banc : 30 choisi → échec → mise à jour par le menu → 14 jours. Break-test : sans la remise à zéro, l'essai rougit.

## 2 · La carte « Copie de secours » de l'Accueil (§ 4.2 de la demande)

Elle ouvre ce rappel (`js/accueil.js` l. 235, `ouvrirModalBackup`). Livrer 1.170.0 sans y toucher montrerait une carte « Copie de secours » qui ouvre « Mets ton codex à jour » : une contradiction à l'écran, dans une version dont le but est de dire vrai. ⮕ **Pas de release avant que Grégoire ait tranché**, et la retouche va dans CE lot plutôt qu'au lot I bis. Question posée à Grégoire le 29 au soir.

## 3 · La ligne des Nouvelles

« plus de faire une copie de secours » se lit aussi « davantage » : réécriture proposée à Grégoire, après la question de la carte (la ligne en dépend).

## 4 · Tranché par Grégoire, le 29 à 20 h 49 : la carte de l'Accueil devient celle du codex (option a)

Dans CE lot, avant la release. Mots acceptés tels quels : titre « Ton codex », sous-titre « Mets-le à jour : une copie complète de tes données. » Le geste ne change pas (`ouvrirModalBackup`). L'icône de clé USB peut rester (technique, à Claude Code).
