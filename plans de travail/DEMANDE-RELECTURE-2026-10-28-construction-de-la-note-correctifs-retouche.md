# Demande de relecture – La retouche des correctifs de la note (E15, E16, l'index ; plus E14) (#1152, trou 2 ; #1177)

> Claude Code, mercredi 28 octobre 2026, fin d'après-midi. Consigne : `CONSIGNE-LOT-2026-10-28-construction-de-la-note-correctifs-retouche.md` (avec `CONSIGNE-LOT-2026-10-28-denotation-jugement-sans-note.md` pour E14). Décisions : `DECISIONS-2026-10-28-construction-de-la-note.md`, §§ E14 à E16.
> Commits : `f72580ba` (docs seuls, les sept fichiers nommés par la consigne) ; le commit du code suit celui-ci. Pas de release, de verdict ni de push.
> ⚠ Pendant la session, **le lot de l'accueil a été commité par une autre main** (`d5aef7d3`, « trois portes d'entrée »). Je n'y ai pas touché. `index.html` étant libre après ce commit, j'y ai changé les jetons anti-cache des huit scripts du lot, rien d'autre.

## Vue d'ensemble

| Point | Avant | Après | Essai qui rougit sans le correctif |
|---|---|---|---|
| E15 | L'originale gardée n'était pas une remise pendant la fenêtre | Elle l'est jusqu'à ce que sa reprise la remplace | E15-a, E15-b, E15-d |
| E16 | « Remplacée », grisée, dès l'octroi du jeton | « Compte jusqu'à sa reprise », sans grisé, pendant la fenêtre | E16-a ; Playwright E16 |
| Index | Gardé par tableau, pour toujours | Gardé le temps d'un lot de calculs ou d'une simulation | IDX-a, IDX-b |
| E14 | Jugement sans note = 0 (ou 0 plafonné) | Non calculable | DEN-4, E14-STOCK |

Tout se lit au calcul ou à l'affichage : aucune écriture dans les données de personne.

## 1. E15 – L'originale qui compte compte aussi comme remise

- **Avant** : `evaluationCompteCommeRemise` rendait `false` pour toute copie qui porte `remplaceeParId`. Pendant la fenêtre, la reprise est un brouillon (non remise), donc la production n'était remise par aucune copie.
- **Après** : `if (evaluation.remplaceeParId && originaleEstRemplacee(evaluation, evaluations)) return false;`, puis la règle habituelle (non recevable : jamais ; « Incomplet » : oui ; sinon, compte dans la note et n'est pas non remise). La fonction prend la liste en second paramètre, comme `evaluationEntreDansLaNote`. Les cinq lecteurs (trois familles, deux sites des snapshots) la lui passent. Le commentaire « question posée au relais » est retiré.
- **Ce qui ne change pas** : une originale gardée non recevable reste non remise ; une originale dont la reprise est introuvable reste remplacée, donc non remise (témoins E15-c).
- **Les C qui changent (pour les Nouvelles)** : seul l'indice C d'un·e élève dont une originale est gardée et dont la reprise n'est pas encore réévaluée change. Cette production compte de nouveau comme remise. Au banc, en sommative à deux productions : **50 → 100**. En spécifications et en standards, le C pendant la fenêtre redevient celui d'avant la reprise. **Aucune note (P) ne change.** Le stock suit au prochain calcul. Les captures déjà prises gardent leur C jusqu'à « Recalculer les captures ».

## 2. E16 – Le badge de l'originale pendant la fenêtre

- **La Liste des évaluations** (`liste-evaluations.js`) : `_statutEtBadgeDeLigne` lit la règle par `_badgeDeLOriginale` (`originaleEstRemplacee`, avec la liste de la Liste). On a `'originale-compte'` pendant la fenêtre et `'originale-reprise'` une fois la reprise dans la note. Le badge « Compte jusqu'à sa reprise » est rangé dans la table `BADGES_STATUT_COPIE`, sans classe `eval-remplacee`. Mesuré au navigateur (WebKit) : pendant la fenêtre, « Compte jusqu'à sa reprise · Évalué · M · 80 % », non grisée ; après la réévaluation, « Remplacée », grisée.
- **Supposition nommée** : le statut interne de la ligne reste `remplacee`, et les actions du menu ne changent donc pas. On garde « Modifier l'évaluation » ; « Annoter », « Modifier », « Renommer », « Transférer » et « Dossier PDF » restent absents, comme pour une originale verrouillée par le jeton. Seuls le badge et le grisé changent.
- **Le filtre « Remplacée »** lit maintenant le badge : il ne montre plus les originales qui comptent encore. Le tri par jeton range « Compte jusqu'à sa reprise » avec les remplacées.
- **Le profil** (`profil-etudiant-sections-affichage.js`, `_determinerBadgeTypeEvaluation`) lit la même règle. **Mesuré : rien de visible ne change.** Pendant la fenêtre, la ligne de la production montre la **reprise** (`_trouverEvaluationActive`, priorité 2, badge « Reprise »), jamais l'originale. Une copie marquée n'y arrive que si sa reprise est introuvable, et elle est alors remplacée. Voir la question 1.
- **Les autres lecteurs d'un badge ou d'un grisé de l'originale**, mesurés et non changés (aucun mot neuf) :

| Lecteur | Ce qu'il montre pendant la fenêtre |
|---|---|
| Récit sommative (`pratique-sommative.js:235`) et récit standards (`profil-etudiant-actions.js:605`) | Déjà la règle (E4) : l'originale y est comptée, pas « remplacée » |
| Tuile du registre longitudinal (`registre-longitudinal.js:775`) | « remplacée par une reprise » pour toute copie marquée, donc aussi pendant la fenêtre. Déjà inscrite par Cowork au lot 1 du chantier Standards (question 3 de la relecture précédente) ; le cas de la fenêtre y va avec |
| Jeton de délai (`evaluation-jetons.js:374`) | Refuse un délai sur l'originale marquée, avec « Cette évaluation a été remplacée par une reprise ». Le refus est juste, mais la phrase est fausse pendant la fenêtre |
| Restauration (`evaluation-jetons.js:715`) | La confirmation dit « Cette évaluation est l'ORIGINALE, remplacée par une reprise ». Inexact pendant la fenêtre |
| Badge du fichier (`travaux-ui.js:2784`) | Ne lit pas `remplaceeParId` : hors de la règle, inchangé |

## 3. L'index des évaluations

- **Mesure** : oui, un chemin réel modifie le tableau en place. `appliquerJetonReprise` (`evaluation-jetons.js:503-635`) lit `db.getSync(cle('evaluationsSauvegardees'))`, pose `remplaceeParId` sur l'originale **dans ce tableau**, fait `push` de la reprise, puis réécrit le même tableau. Hors cours actif, `memoryCache` rend cette même référence à la lecture suivante. L'ancien index, gardé par tableau dans une `WeakMap` sans fin, ne connaissait pas la reprise. L'originale lisait donc sa reprise « introuvable » et sortait de la note, alors qu'E4 dit le contraire. Même chose d'un pipeline à l'autre : `calculerEtStockerIndicesCP`, lancé juste après le jeton, aurait relu l'index périmé.
- **Correctif** : l'index vit le temps d'un lot de calculs (`jetonCacheLecture`, `modes.js` : l'objet du cache de lecture, neuf à chaque lot et à chaque invalidation totale) ou d'un jeu simulé (`obtenirDonneesSimulationOuNull`). Partout ailleurs, il est reconstruit à chaque lecture. Les trois lots (`indices.js`, `portfolio.js`, `tableau-bord-apercu.js`) sont synchrones et n'écrivent pas les évaluations : rien ne modifie le tableau pendant leur durée. C'est dit en commentaire au site.
- **Essais** : IDX-a, sur un `obtenirDonneesSelonMode` qui rend la même référence. Une reprise ajoutée en place laisse compter l'originale (et la laisse remise). Verrouillée en place, la reprise la remplace : jamais les deux. IDX-b : dans un lot, l'index se construit une fois ; un lot neuf le reconstruit ; hors lot, chaque lecture le reconstruit. Le banc commun (`bac-suivi.js`) clone à chaque `getSync` et ne pouvait pas voir ce défaut.

## 4. E14 – En dénotation, un jugement sans note n'est pas calculable

- **Avant** : `_calculerPerformanceDenotation` lisait `noteFinale` absente comme 0 (ou `Math.min(0, 59)`).
- **Après** : une note qui n'est pas un nombre fini donne `null`, comme l'absence de jugement. La garde des cibles ne s'applique qu'à une note saisie, et une note saisie de 0 reste 0 (témoin E14-b). Le contrat en tête de fonction le dit.
- **Les autres lecteurs de `noteFinale` d'un jugement**, mesurés : le récit (`decrireCalcul`) donne `noteFinale: null` et `plafonnement: null`, sans `NaN` ni 0. Le profil, l'export et le Comparateur passent par le calcul et disent « non constructible ». Les captures (`snapshots.js:291`) n'ont pas de P historique en dénotation (inchangé). Le panneau de saisie (`denotation-saisie-ui.js`) n'est pas touché : il accepte toujours un champ vide.
- **Le stock** : un jugement déjà enregistré sans note passe de 0 à « non calculable » sans réécriture (E14-STOCK). À dire aux Nouvelles si la mise en ligne le porte.

## 5. Les tests

- Banc de la mesure (`sentinelle-construction-de-la-note-2026-10-28`) : **DEN-4** ajouté (trois jeux de cibles, sans note : P, Comparateur et export « non constructible »). **Aucun autre cas ne bouge** (53 verts).
- Sentinelle des correctifs : 10 essais neufs. **7 rougissent sans leur correctif** (E15-a, E15-b, E15-d, IDX-a, IDX-b, E16-a, E14-STOCK) ; **3 sont des témoins** de ce qui ne doit pas bouger (E15-c, E16-b, E14-b). Break-tests : chaque correctif retiré, l'arbre est restauré et vérifié par sha256.
- Playwright ciblé (`construction-de-la-note-correctifs-28-oct.spec.js`, WebKit) : E16, « Compte jusqu'à sa reprise » puis « Remplacée », C 100 pendant la fenêtre. Il rougit sans E16. Les 4 essais du spec sont verts.
- Trois sentinelles statiques suivent le code : l'appel attendu devient `evaluationCompteCommeRemise(e, evaluations)` (audit Aide 15 oct., lot A 737). Pour le cliquet de complexité, le choix du badge est extrait (`_badgeDeLOriginale`) et le badge va dans la table : `_statutEtBadgeDeLigne` reste à 14 et `genererLigneHTML` à 39.
- Vitest complet, depuis `tests/` : **844 fichiers, 10 183 essais verts.** Pas de Playwright complet : le verdict attend le signal de Grégoire.

## 6. Les questions

1. **Le profil pendant la fenêtre** (affichage, lu par l'enseignant·e seulement) : la ligne de la production montre la reprise, encore brouillon, avec la note de ce brouillon (au départ, celle de l'originale, recopiée). Pendant ce temps, la note du cours compte l'originale. E16 supposait que le profil montre l'originale. Faut-il qu'il la montre pendant la fenêtre, avec « Compte jusqu'à sa reprise » ? Je n'ai rien changé à ce choix de ligne.
2. **Les deux phrases de `evaluation-jetons.js`** (le refus du délai, `:374`, et la confirmation de restauration, `:715`) disent « remplacée » pendant la fenêtre. Ce sont des mots lus par l'enseignant·e, et la consigne ne demandait aucun mot neuf : **inscrit ici, disposition à Cowork** (aucun symptôme vécu, rien de bloqué).
