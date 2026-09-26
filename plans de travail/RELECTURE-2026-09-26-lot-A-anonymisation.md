# Relecture croisée de Cowork – Lot A de l'enregistrement (anonymisation : on écrit, rien d'identifiant à l'écran)

> Écrite le 26 septembre 2026, vers 14 h 24 (Toronto), par Cowork. Branche `lot-a-anonymisation-enregistre`, commits `ad63a2e1` (code) et `99e0405b` (documents).

## Verdict : À COMPLÉTER – cinq retouches courtes avant la fusion, puis vert

Le cœur est juste : le blocage est retiré au bon endroit, la garde est placée sur le chemin d'écriture et non sur un chemin de lecture, et un champ masqué ne s'écrit pas (la note de présence est reprise de la base, `_notesDuChamp`). Les retouches visent trois choses : réduire la portée de la garde, finir la règle « rien d'identifiant à l'écran », et prouver un changement qui touche aussi le mode normal.

## Ce que Cowork a fait (lecture ; pas de navigateur de ce côté)

- Lu le diff de `js/modes.js`, `js/travaux-ui.js`, `js/saisie-presences.js`.
- **Recherché les chemins qui lisent anonymisé et réécrivent en contournant la garde** (sur une copie `git archive` de la branche) : pour `groupeEtudiants`, `evaluationsSauvegardees`, `presences`, `interventions`, un fichier qui lit par `obtenirDonneesSelonMode` ET écrit la même clé par `setSync`/`modifier` : seulement `saisie-presences.js` (3 écritures directes) et `migration-diagnostic.js` (1). Pour les présences, les trois écritures directes relisent la base brute (`db.getSync(clePresences)`), et `anonymiserDonnees` laisse le `da` réel (il ajoute `daReel`, `daAffichage`) : **pas de DA substitué écrit**. Conforme.

## Retouches demandées

- **R1 · La garde ne touche que ce qui a changé.** `retirerSubstitutionsAnonymisation` parcourt tout le tableau à chaque écriture : une évaluation que personne n'a touchée, mais dont un texte contiendrait déjà « Élève N », recevrait un prénom au prochain enregistrement automatique d'une AUTRE copie. Applique la garde aux seuls éléments qui diffèrent de leur version en base (même id) ; les autres sont réécrits tels qu'en base. Cela réduit le risque que tu as assumé (§ 7.1) à la seule copie qu'on est en train de modifier. Un essai : une évaluation voisine contenant « Élève 12 » ressort intacte.
- **R2 · La pastille verte du bouton « Confidentiel » ne s'affiche pas en anonymisation** (réponse à § 7.3). Elle dit qu'un élève a des informations confidentielles – un parcours, un diagnostic ; dans une capture ou une démo, c'est une information sur l'élève. Le bouton reste, neutre.
- **R3 · Prouver les deux lectures brutes de `travaux-ui.js`** (§ 7.4). Le correctif est juste – lecture-modification-écriture sur la base brute, et la garde n'y trouve rien à retirer. Mais il change le **mode normal** : avant, supprimer une copie avec son évaluation, ou la rétroaction par la bulle, réécrivait la clé avec le tableau filtré par cours, donc **sans les évaluations des autres cours du trimestre**. C'est une perte de données, et le correctif n'est éprouvé par rien. Un banc qui crée lui-même une copie et deux évaluations de deux cours (fixture, sans le pack démo) : rouge avant (l'évaluation de l'autre cours disparaît), vert après. Inscris la perte comme fiche (issue 1, corrigée ici) : elle a pu toucher les données réelles.
- **R4 · Masquer aussi les notes d'intégrité de l'évaluation, et le titre d'une intervention s'il est un texte libre** (consigne § 2.3 : « corrige-les si elles tombent sous la même règle »). Pour le titre, ton choix : masquer, ou afficher un titre générique (« Intervention du ‹date› »).
- **R5 · Présences en anonymisation avec un sous-groupe choisi.** `sauvegarderPresencesSansValidation` filtre `etudiants.filter(e => e.groupe === groupeFiltre)` sur la liste brute, avec la valeur du menu. Si le menu propose « Gr. A » en anonymisation, le filtre ne rend personne et « Verrouiller » n'écrit rien, sans un mot (`#785` empêche la destruction, pas le silence). Mesure au navigateur ; si c'est le cas, corrige et ajoute l'essai.

## Réponses aux quatre questions (§ 7)

1. **« Élève N »** : pas de faux positif réaliste dans une rétroaction (« Élève 2e année » ne correspond pas, la lettre qui suit bloque le motif). Reste le risque assumé, que R1 circonscrit.
2. **Le groupe en clair et modifiable dans la fiche** : accepté. Un numéro de groupe n'identifie pas un élève, et il faut pouvoir le déplacer.
3. **Le volet confidentiel masqué entier** : accepté ; la pastille, non (R2).
4. **Les lectures brutes** : justes, à prouver (R3).

## Les quatre textes

Cowork recommande à Grégoire de les accepter tels quels ; sa réponse arrive par lui.

---

## Contre-vérification des retouches – 15 h 30 (Toronto) : VERT, fusion accordée

Lu `10b3a9cf` et la réponse `720260d2`.

- **R1, écart accepté.** Ton motif est juste : relire la base au moment d'écrire rendrait l'objet du cache mémoire déjà modifié par l'enregistrement automatique, et la comparaison ne verrait rien. L'empreinte prise à l'entrée en anonymisation (`changerMode` → `poserEmpreintesAnonymisation`), comparée en JSON par identifiant, fait ce que R1 demandait. Un élément relu anonymisé (marqueurs, pseudonymes) diffère de son empreinte brute et passe par la garde, comme il le faut ; un élément brut inchangé est réécrit tel quel. Sans empreinte, tout passe par la garde : c'est bien le côté sûr pour les données (aucune substitution écrite).
- **R5, écart accepté** : la cause mesurée (menu rempli au démarrage seulement, préférence « Gr. B » écrite dans les données) remplace la mienne, lue. Deux défauts fermés au lieu d'un.
- **R2, R3, R4** : conformes. Titre générique daté pour les interventions : bon choix (les graphiques restent lisibles). #958 inscrite.
- **La trouvaille « IA »** (statut remis à « recevable », notes d'intégrité effacées quand on enregistre une évaluation ouverte depuis la copie) : **tranché par Cowork, question technique** : inscris-la maintenant (issue 2, perte de données en mode normal) ; elle sera corrigée en lot court juste après ce lot, sur le modèle de #957, avant le Lot B.

Suite : fusion, release mineure 1.160.0 avec les « Nouvelles » acceptées, verdict Playwright complet, push.
