# Relecture croisée de Cowork – lot #953 (grilles, échelles et pratiques d'une archive rouverte)

> Écrite le 26 septembre 2026, vers 10 h (Toronto), par Cowork. Branche `lot-953-grilles-echelles-archive`, commits `5b2c91a5` (code) et `3d30bf0c` (demande), sur `14314530`.

## Verdict : VERT, sans retouche demandée avant la fusion

## Ce que Cowork a fait

- **Lecture** du diff de `js/reserve-ouvrir.js` et d'`index.html` (jeton remonté).
- **Remesure de la portée** : le versement ne copie que les clés d'UN trimestre (`js/reserve.js` l. 503-514 et 776-779, `prefixe = trimestre + '_'`) ; le trimestre `demo` est écarté (l. 1377). Une archive ne peut donc pas porter deux préfixes concurrents : la règle « la namespacée l'emporte en bloc » n'a jamais à arbitrer entre deux trimestres.
- **Pratiques, décision de Claude Code, acceptée** : la migration du 24 mai (`js/main.js` ≈ l. 631-640) a copié la forme nue dans la clé de chaque trimestre, et aucun code ne réécrit la nue depuis (seule occurrence hors `cle()` : le pack de démonstration). La namespacée est donc la bibliothèque vivante ; la nue, figée, ressusciterait une pratique supprimée depuis mai. La règle protège aussi contre ça. Pas besoin des données réelles de Grégoire pour trancher.
- **Exécution** (Node, sur la fonction extraite de la branche, non sur l'application) : `_lireDeuxFormes` rend la namespacée quand les deux existent (et dédoublonne un id répété) ; la nue seule quand la namespacée manque ; ignore une clé à préfixe composé (`x_y_grillesTemplates`) et une namespacée qui n'est pas un tableau ; pour `cartouches_G_1` (id de grille avec « _ »), rend `a2025_cartouches_G_1` et ne confond pas `a2025_cartouches_XG_1`. Cinq cas, cinq conformes.
- ⚠ **Non exécuté par Cowork : WebKit** (pas de navigateur dans ce shell). Les sept cas du banc et les quatre mutations reposent sur l'exécution de Claude Code.

## Observations

- **O1 – note.** La refonte des cartouches sur `_lireDeuxFormes` garde la sémantique de #637 : même règle, même dédoublonnage (déplacé dans la fonction commune). Le regex restant (`grillesDesCartouches`) ne sert plus qu'à énumérer les grilles.
- **O2 – note.** « La namespacée l'emporte en bloc » écarte un élément présent seulement dans la nue. Pour les grilles et les échelles, le versement n'écrit plus la nue ; pour les pratiques, c'est l'effet voulu (cf. ci-dessus).
- Les deux trouvailles de Claude Code (le rouge Playwright du 25 sur GitHub, #892 et #929 ; la forme nue des pratiques encore copiée au versement) sont à inscrire, hors lot, comme il le propose.

## Suite

Fusion après l'accord de Grégoire sur la ligne des « Nouvelles », puis verdict Playwright complet et push dans l'ordre du `PROTOCOLE.md`.
