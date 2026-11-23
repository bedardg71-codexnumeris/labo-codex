# Rapport — une pratique « Par standards » en simulation, à côté de la pratique officielle d'un groupe (23 nov. 2026)

**Branche** : `lot/pratique-en-simulation`, partie de `origin/main` à `4d1043c`. **Aucune fusion dans `main`.**
**PR en brouillon** : à venir (second commit du rapport)
**Aperçu** : à venir (second commit du rapport)
**Plan** : `plans de travail/PLAN-2026-11-23-pratique-en-simulation.md`. **Textes à corriger** : `plans de travail/TEXTES-2026-11-23-pratique-en-simulation.md` (22 textes).
**Où ce lot a été fait** : dans un conteneur infonuagique, pas sur le Mac. Ni arbre à part ni WebKit ici.

## En tête

1. Les quatre gestes demandés existent, dans le groupe dont la pratique officielle est « Par sélection de productions » : poser, ouvrir et inscrire (niveaux, annulation, « Observer »), voir la marque en permanence, retirer puis reposer.
2. Aucun choix de Cowork n'est renversé par le code.
3. La lecture du code a imposé trois gardes de plus, décidées ici (§ « Ce qui contredit ou complète le relais »).
4. Rien de ce lot n'a été vu sur Safari ni sur iPad.

## Ce qui est fait

| Quoi | Où |
|---|---|
| Le lien : `groupesCours[].simulationPratiqueId`, absent quand il n'y a pas de simulation | écrit par la fiche du groupe-cours (`js/trimestre-v2-groupes-cours.js`, `_rangerSimulationV2`), lu par `js/simulation-pratique.js` (`lire`) |
| Poser, retirer : un champ « 7. Simulation (facultatif) » dans la fiche du groupe-cours, sous la pratique de notation. Il n'offre que les pratiques « Par standards » du trimestre. Il s'enregistre comme les autres champs de la fiche | `index.html`, `js/trimestre-v2.js`, `js/trimestre-v2-groupes-cours.js` |
| Ouvrir : une entrée sous le tableau de notation (« Ce groupe a une pratique en simulation… », bouton « Ouvrir la simulation »). Elle ouvre un écran à part, dans son propre hôte ; le contenu du tableau officiel n'est jamais remplacé. Rouvrir la sous-section montre toujours le tableau officiel | `js/simulation-pratique.js`, `js/tableau-notation.js`, `index.html` |
| Inscrire un niveau, annuler une inscription, « Inscrire pour une production », « Observer » : les écrans du tableau des cibles, sur le contexte de la simulation | `js/tableau-cibles.js`, `js/observation-cibles.js` |
| La marque « Simulation » : au bandeau de l'écran (il reste en vue quand la page défile), devant le titre du tableau, devant le titre de chaque fenêtre ; un liseré sur toute la hauteur de l'écran | `css/tableau-cibles.css` |
| Le redessin après écriture garde la simulation (inscription, annulation, fermeture d'« Observer ») | `js/tableau-cibles.js` (`_rerendre`) |
| Aucun bouton d'export sous la simulation | `js/tableau-cibles.js` (`_bandeauHTML`) |
| Une pratique simulée supprimée : « Aucune simulation. », avec le motif en clair ; le lien et les inscriptions restent ; la fiche montre « Pratique supprimée » et ne retire pas le lien quand on l'enregistre pour autre chose | `js/simulation-pratique.js`, `js/trimestre-v2-groupes-cours.js` |
| À la fusion, chaque côté d'un conflit de groupe-cours dit sa simulation | `js/codex.js` (`_direLaSimulation`) |
| Le registre des clés | `docs/DATA-OWNERSHIP.md` |

**Non fait, et voulu** : le Comparateur, le profil, la définition d'« en usage », le refus de suppression, la vue simple, « Cibles que cette production renseigne ».

## Ce qui est prouvé (par des tests, vus rouges puis verts)

Bancs neufs : `tests/unit/sentinelle-pratique-en-simulation.test.js` (19 tests) et `tests/integration/pratique-en-simulation.spec.js` (7 tests, Chromium).

| Preuve demandée | Comment | Éprouvée par mutation |
|---|---|---|
| Simulation posée et niveaux inscrits : la sortie officielle est identique, octet pour octet | Navigateur. Instantané avant et après (pose par la fiche, trois niveaux, une annulation, une observation) : désignation, note et décomposition de chaque élève (`simulerIndices` sur la pratique désignée), indices C et P recalculés et rangés, dépistage (indices et niveau de RàI), CSV des résultats, notes du tableau officiel, document PDF d'une copie, évaluations, productions, miroirs du groupe. Comparés comme textes | Oui, deux fois : pointeur officiel basculé à l'ouverture ; note d'une évaluation changée par une inscription. Rouge les deux fois |
| Retirer puis reposer rend le même tableau | Navigateur. HTML du tableau comparé à l'octet ; stock des inscriptions comparé à l'octet après le retrait | Non (comparaison d'égalité sur un tableau non vide, vérifié non vide) |
| Deux codex fusionnés, un seul porte la simulation | Unitaire, sur le vrai `codex.js` : un conflit montré sur le groupe-cours ; chaque côté dit « Simulation : « nom » » ou « Aucune simulation » ; les inscriptions sont unies sans conflit | Oui (`_direLaSimulation` retiré : rouge) |
| Un groupe sans simulation se comporte comme aujourd'hui | Unitaire : HTML du tableau des cibles identique à l'octet hors simulation. Navigateur : aucune entrée, aucun écran ; la fiche enregistrée n'ajoute pas le champ au groupe-cours | Non |
| Un clic dans la simulation écrit sous la simulation, même si le tableau officiel s'est redessiné derrière | Unitaire, deux hôtes dans un vrai DOM | Oui (code d'avant le lot : l'inscription partait sous l'ensemble de l'officielle) |
| Aucun export sous la simulation | Unitaire et navigateur | Oui |
| Mêmes cibles que l'officielle : refusé, et lu « aucune simulation » | Unitaire et navigateur (fiche) | Oui |
| Le pointeur officiel n'est jamais écrit par ce lot | Unitaire : le module de la simulation ne contient aucune écriture ; le champ n'est nommé que par trois fichiers. Navigateur : `pratiqueId` relu après tous les gestes | — |

**Ce que l'instantané porte** (mesuré, pour qu'on ne compare pas du vide) : deux notes officielles construites (88 et 38), une non constructible, les niveaux de dépistage 1 et 2, le CSV, un document PDF de 306 Ko.

**Limite de la preuve « octet pour octet »** : les horodatages du recalcul des indices sont retirés avant comparaison (ils changent d'un appel à l'autre, simulation ou non). Le PDF est comparé comme objet de document, pas comme fichier téléchargé.

## Verdict

À venir : Vitest complet vert (958 fichiers, 12 349 tests) ; la batterie Chromium tourne.

**Reste à passer sur le Mac (WebKit)** : `tests/integration/pratique-en-simulation.spec.js`, puis le verdict habituel (`node scripts/verdict-en-morceaux.mjs`), Cowork fermé, quand aucun autre verdict ne tourne. Rien de WebKit n'a été lancé d'ici.

## Ce qui est supposé

1. **L'écran de la simulation remplace le tableau officiel à l'écran tant qu'il est ouvert**, dans la même sous-section, avec un bouton « Revenir au tableau de notation ». J'ai lu « une entrée à part, jamais un interrupteur » ainsi : rien ne change ce que le tableau officiel affiche ; l'entrée mène à un autre écran. Si tu voulais les deux tableaux visibles ensemble, c'est à dire.
2. **« Poser » passe par la fiche du groupe-cours**, qui s'enregistre au changement d'un champ. Pas de bouton à part.
3. **« Inscrire pour une production » reste offert sous la simulation.** Il n'écrit que des inscriptions et ne fait que lire les productions.
4. **« Régler » (le lien du bandeau) reste offert** : il ouvre les réglages de la pratique simulée.
5. **Une simulation devenue invalide n'est pas nettoyée** : le lien reste au stock, l'écran dit pourquoi il ne s'ouvre pas. Aucune écriture d'office.
6. **Pour essayer dans l'aperçu**, tu y ouvres ton codex : l'aperçu est une autre adresse, son espace est vide au départ et séparé de tes données réelles. Non vérifié d'ici.

## Ce qui contredit ou complète le relais

Rien n'est contredit. Trois ajouts, que le relais ne prévoyait pas :

1. **Le contexte du tableau des cibles vivait dans une seule variable pour tous les tableaux.** Le tableau officiel peut se redessiner derrière la simulation ; un clic dans la simulation aurait alors écrit sous la pratique officielle (quand elle est aussi « Par standards »). Le contexte est maintenant rangé sur chaque hôte. C'est plus large que « le redessin de la ligne 430 ».
2. **Deux pratiques « Par standards » peuvent partager un ensemble de cibles.** Simuler une pratique qui partage ses cibles avec l'officielle ferait compter la simulation dans la note. Refusé à la pose ; lu « aucune simulation » si le cas existe déjà.
3. **« Ce qui arrive est dit » demandait du code** : sans lui, un conflit de groupe-cours ne montrait que « Modifiée le… » des deux côtés.

Deux précisions sur les décisions de Cowork :

- « Le bouton d'export n'existe pas sous la simulation » : ce bouton n'existe qu'en vue simple, où la simulation n'entre pas. La garde est posée quand même, et testée.
- « À la fusion, rien ne se perd » : les inscriptions sont unies. Le lien, lui, suit le côté choisi : si tu gardes le côté sans simulation, le lien part, et le reposer dans la fiche rend tout.

## Tarir ou réparer

Lot neuf : aucun stock existant n'est touché. Un groupe-cours sans simulation garde sa forme d'avant, à l'octet.

## Trouvailles en chemin

| Trouvaille | Disposition |
|---|---|
| Sous la simulation, la zone du texte d'une inscription s'appelle « Rétroaction » (« Ce qui est acquis, ce qui reste à travailler »), alors que ce texte reste une note pour toi | Question à Grégoire (ses mots) : garder, ou un autre mot sous la simulation ? |
| La règle de relais demande de pousser `RELAIS.md` sur `main` quand une fusion attend ; le mandat dit « aucune fusion dans `main` » et cette session n'a pas la permission d'y pousser | Non fait. À Cowork de dire si une entrée de `RELAIS.md` est due |
| Aucune porte terrain n'est produite : rien d'irréversible (les inscriptions ne font que s'ajouter), et les bancs répondent au reste | Décidé (deux règles de tête du skill `portes-terrain`). Les gestes ci-dessous en tiennent lieu |

## Les gestes à essayer sur l'iPad

Dans l'aperçu, vue étendue, avec ton groupe d'automne (pratique officielle « Par sélection de productions »).

1. Ouvre Cadre, la fiche de ton groupe-cours : le champ « 7. Simulation (facultatif) » est sous la pratique de notation.
2. Choisis-y une pratique « Par standards » : la fiche s'enregistre, la pratique de notation n'a pas changé.
3. Ouvre Évaluation, Tableau de notation : ton tableau habituel est là, et dessous une entrée marquée « Simulation ».
4. Touche « Ouvrir la simulation » : le bandeau « Simulation » est en haut, le tableau des cibles dessous.
5. Fais défiler la page vers le bas : le bandeau « Simulation » reste visible.
6. Touche une case, choisis un niveau, touche « Inscrire le niveau » : la case montre le niveau, et tu es toujours dans la simulation.
7. Regarde le titre de la fenêtre d'inscription : il porte « Simulation ».
8. Touche la même case, puis « Annuler cette inscription » : elle reste dans l'historique, barrée. Ferme la fenêtre : la case n'a plus de niveau.
9. Touche « Observer », choisis une cible, coche un critère, écris un mot, inscris : la fenêtre porte « Simulation » à chaque étape.
10. Ferme « Observer » : tu reviens au tableau de la simulation, pas au tableau officiel.
11. Touche « Revenir au tableau de notation » : ton tableau officiel reparaît, ses notes sont celles d'avant.
12. Retourne à la fiche du groupe-cours, choisis « — Aucune simulation — » : au tableau de notation, l'entrée a disparu.
13. Remets la même pratique en simulation, rouvre-la : toutes tes inscriptions sont là, celle que tu as annulée aussi.
14. Passe en mode clair, puis en mode sombre : l'étiquette « Simulation » se lit dans les deux.

## Questions

**À Grégoire**
1. Les 22 textes (`TEXTES-2026-11-23-pratique-en-simulation.md`).
2. « Rétroaction », sous la simulation : garder ce mot ?

**À Cowork**
1. La supposition 1 (l'écran de la simulation prend la place du tableau officiel tant qu'il est ouvert) tient-elle ?
2. Une entrée de `RELAIS.md` sur `main` est-elle due pour cette branche ?
