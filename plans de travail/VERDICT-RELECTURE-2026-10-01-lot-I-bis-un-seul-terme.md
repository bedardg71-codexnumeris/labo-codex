# Verdict de relecture – lot I bis : un seul terme (chantier du codex)

> Écrit le 1 octobre 2026 à 2 h 07 (Toronto) par Cowork. Porte sur `820fe58e`, branche `lot-i-bis-un-seul-terme`.

## Verdict : le lot part après DEUX corrections, et les mots de Grégoire sur trois textes.

## Ce que j'ai fait, et ce que je n'ai pas fait

- **Lu** : ta demande en entier ; le diff de `js/trimestre-v2-liste.js` ; `Codex.etat`, `marquerModification`, `_marquerCodexAJour` (`js/codex.js`) pour savoir ce que « à jour » veut dire ; `previsualiserImport` (l. 1057) ; le cliquet.
- **Rejoué dans un clone de la branche** (Linux, Node, hors du dépôt, effacé ensuite) : les trois sentinelles du lot, vertes (21 essais) ; **huit mutations à moi**, autres que les tiennes (ci-dessous).
- **Mesuré** : aucun fichier servi ne porte plus le terme hors des Nouvelles (`grep -rliE` sur `.html .js .json .css .md .txt`, hors essais, plans et documents) ; les fixtures ne contiennent que des noms fictifs (trois fiches : « Alix Fictif », « Maude Inventée », et la démo).
- **Pas fait** : ton banc WebKit, tes dix mutations, Playwright ; les empreintes avant / après des deux anciens fichiers, que je tiens de ton rapport ; le vrai Chrome, le vrai Safari.

## Mes mutations

| Mutation | Résultat |
|---|---|
| Le bouton du refus ne fait plus rien | rouge |
| Un mot du refus changé (« pour de bon » → « définitivement ») | rouge |
| « garde ce fichier » retiré de la confirmation | rouge |
| Sans codex, la garde laisse passer | rouge (2) |
| Prédicat réécrit à l'identique logique (`!(x === true)`) | survit : **équivalente**, lu |
| Le terme revient dans `js/` avec des espaces en échappement (`copie\u00a0de\u00a0secours`) | **survit** |
| Le terme revient dans `index.html` avec l'entité de l'espace fine (`&#8239;`) | **survit** |
| Un synonyme (« sauvegarde de secours ») | survit : hors de la règle écrite, noté seulement |

## Les deux corrections demandées

**1 · La case « Ouvrir un Codex » doit ouvrir un codex.** Ta trouvaille 3, confirmée à la lecture (`js/import-export.js`, l. 1057) : un fichier de codex déposé là reçoit une alerte qui renvoie au menu. Les mots validés par Grégoire disent « Ouvre un codex ou une configuration partagée. » ; avec « un seul terme », la case ne peut pas refuser la seule chose qu'elle nomme. L'erreur est à moi : j'ai proposé ces mots sans vérifier ce que la case fait (erreurs 2 et 18 de ma consigne de démarrage).
⮕ Un codex choisi dans cette case s'ouvre par le chemin du menu Codex, avec ses confirmations habituelles ; l'alerte disparaît. Un essai de comportement, une mutation. ⛔ Si le chemin du menu ne peut pas recevoir un fichier déjà choisi sans réécriture lourde : arrête-toi et dis-le, je proposerai d'autres mots à Grégoire.

**2 · Le cliquet ne voit pas deux écritures de l'espace.** Le code de l'application emploie des échappements (`\u00e9`, l. 1057). ⮕ L'aplatissement prend aussi `\u00a0`, `\xa0`, `\u202f`, `&#8239;`, `&#x202f;` et le caractère U+202F ; un cas de plus dans l'essai du motif. Deux lignes.

## Ce qui monte à Grégoire (Cowork s'en charge, une question à la fois)

1. **La confirmation promet plus que Chrome ne tient** (ta trouvaille 1, la plus importante du lot). « Ton codex à jour les contient encore : garde ce fichier » : dans Chrome, la mise à jour suivante réécrit ce même fichier, et le trimestre supprimé n'y est plus. Le filet que j'ai recommandé à Grégoire tient donc jusqu'à sa prochaine mise à jour, pas au-delà. Des mots plus vrais lui sont soumis ; un filet plus fort (un codex écrit à part avant la suppression) sera inscrit s'il le veut, hors de ce lot.
2. **La variante « sans codex »** (ton § 4).
3. **L'encadré de la Loi 25**, son texte du 15 septembre.
4. La ligne des Nouvelles.

## Tranché par Cowork (les ⚠ de ta table)

- FAQ, « C'est lui qui te rend tes données si le navigateur les perd. » : gardée, elle est vraie et dit où est le filet.
- Formats, « fichier de données d'une version antérieure » : gardée, c'est le mot « fichier » que Grégoire a validé pour la fenêtre d'ouverture.

## Remarques sans correction

1. « À jour » repose sur `marquerModification`, donc sur l'événement du témoin et sur les 101 gestes raccordés au lot F : la garde vaut ce que vaut ce raccord, déjà relu.
2. Ta trouvaille 4 (un ancien fichier ne remet pas chaque clé à sa place) : d'accord pour ne pas l'inscrire, pas de symptôme vécu. Le lot promet « comme avant », et le prouve.
3. Tes choix « décidé seul » sont retenus : le cliquet étendu aux commentaires, la garde dans le parcours d'écran (un seul appelant, mesuré), la confirmation et le nom laissés en dialogues natifs.
4. « Restauration de tes données » n'est atteinte par aucun geste (ton constat) : c'est du texte mort ; retire-le si le repli ne peut pas se produire, sinon laisse.
