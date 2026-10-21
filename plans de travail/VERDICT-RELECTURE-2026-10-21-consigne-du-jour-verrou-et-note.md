# Verdict de relecture – « Verrouiller la saisie » et la note du profil

> Cowork, mercredi 21 octobre 2026, 11 h 02 (Toronto, mesuré par `date`). Commits relus : `67298d08` (lot 1) et `90809966` (lot 2) sur `main`, non poussés. Demandes : `DEMANDE-RELECTURE-2026-10-21-verrouiller-la-saisie.md`, `DEMANDE-RELECTURE-2026-10-21-note-du-profil.md`.

## Lot 1 : accepté, sans correction

- Diff relu : la case, son libellé, son icône, « Fermer » et `fermerSaisiePresences` sont partis ; `grep` des quatre identifiants retirés et de la fonction dans `js/`, `index.html`, `styles.css` : zéro reste. Le bouton passe par la porte existante (`basculerVerrouillageDateActive` → `basculerVerrouillageDate`), qui n'a pas changé. Le `innerHTML` de « Séance verrouillée » est statique : conforme à la règle 1.
- **L'écart sur la sentinelle #768/#782 : retenu, et l'erreur est celle de la consigne.** Cowork avait écrit « doit rester verte sans modification » sans voir que ses cas 2 et 4 nommaient « Fermer » et la case. Les cas 1 et 3 (la barre définie à un seul endroit, le rendu n'y touche pas) sont intacts. Le cas 4 réécrit vérifie que le sous-onglet « Liste » existe : moins fort qu'avant, suffisant, puisque plus rien dans la barre ne vise une sous-section.
- Le point 5 mesuré dans WebKit (la minuterie écrit 1,5 s après le départ vers « Liste », un rechargement garde la note) et devenu un essai permanent : c'est la preuve demandée.

## Lot 2 : accepté, sans correction

- `js/note-pourcentage.js` : chargé avant ses six lecteurs dans `index.html` (seule page qui charge ces modules ; aucun service worker à mettre à jour), sans dépendance, sans `console.log`. La valeur stockée n'est pas touchée.
- Comportements aux bords relus : `'--%'` du message de `travaux-ui.js` (l. 3823) quand la note vaut 0 ou manque, comme avant ; `'-'` de la Liste pour 0, comme avant.
- Limite connue de la sentinelle B, acceptée : elle lit ligne par ligne et ne voit que `noteFinale` ; une note copiée dans une autre variable (`ligne.note`) lui échappe. La mesure dans WebKit sur le profil démo couvre le cas vu par Grégoire.

## Les deux trouvailles

1. **« Note de la copie : X % » sur le PDF de l'élève** (`synthese-retroaction-rendu.js`, l. 449) : mots que les élèves lisent, **remonté à Grégoire** le 11 h 02. Rien à faire avant sa réponse.
2. **« 89.0% » de la note finale du profil** contre « 89% » ailleurs : écran de l'enseignant, **inscrire et continuer** (tranché par Cowork). Il se réglera avec la réponse au point 1, qui peut changer la forme de toutes les notes affichées.

## À la release

Les deux lots partent avec la version de ce soir, après le verdict complet, au signal de Grégoire. Les deux items « Nouvelles » proposés sont à lui faire valider à ce moment.

## Suite

Grégoire a répondu au point 1 à 11 h 07 : **la norme française** (« 89,2 % », virgule et espace insécable). La trouvaille 2 est réglée dans le même lot : `CONSIGNE-DU-JOUR.md` de l'après-midi.
