# Plan — une pratique « Par standards » en simulation, à côté de la pratique officielle (23 nov. 2026)

**Branche** : `lot/pratique-en-simulation`, partie de `origin/main` à `4d1043c`.
**Source** : `plans de travail/RAPPORT-2026-11-23-pratique-a-cote-mesure.md` (branche `lot/pratique-a-cote-mesure`, `514d9866b`), dont ce lot est le « lot 1 ».
**Mot d'écran décidé par Grégoire** : « Simulation ». Tous les autres mots sont PROPOSÉS (`TEXTES-2026-11-23-pratique-en-simulation.md`).

## Ce que la lecture du code confirme

Les choix de Cowork tiennent tous devant le code. Aucun n'est renversé.

- Le lien : un champ de plus sur le groupe-cours. La fiche garde le champ à l'enregistrement (`...groupesCours[index]`).
- Le tableau des cibles, « Observer » et l'écriture d'une case travaillent sur le contexte qu'on leur passe.
- Le stock des inscriptions est rangé par `da` et `ensembleId` : retirer le lien ne retire rien.

## Trois gardes que la lecture ajoute (décidées ici, dites au rapport)

1. **Le contexte du tableau des cibles vit dans une variable du module, une seule pour tous les hôtes** (`_contexteCourant`,
   `js/tableau-cibles.js`). Si le tableau officiel se redessine derrière la simulation (la Liste rechargée), un clic dans la
   simulation écrirait sous la pratique officielle. ⮕ Le contexte est rangé sur l'hôte ; un clic lit celui de SON hôte.
2. **Deux pratiques « Par standards » peuvent partager le même ensemble de cibles.** Si l'officielle du groupe et la simulée
   partageaient le leur, une inscription faite en simulation compterait dans la note officielle. ⮕ Une telle simulation est
   refusée à la pose et, si elle existe déjà, lue « aucune simulation », avec son motif.
3. **À la fusion, un conflit de groupe-cours ne dit que « Modifiée le… » de chaque côté.** Si seule la simulation diffère,
   les deux côtés se liraient pareil. ⮕ Chaque côté dit sa simulation (« Simulation : « nom » » ou « Aucune simulation »).

## Le modèle

- `groupesCours[].simulationPratiqueId` : l'id d'une pratique du trimestre, ou absent. Écrivain unique : la fiche du
  groupe-cours (`js/trimestre-v2-groupes-cours.js`). Jamais dans `infoCours` ni `groupeCoursActif`.
- `groupesCours[].pratiqueId` n'est écrit par aucun code de ce lot.
- Lecture unique : `SimulationPratique.lire()` (`js/simulation-pratique.js`). États : `aucune`, `ok`, `introuvable`
  (pratique supprimée), `autre-famille`, `officielle` (elle est devenue l'officielle), `meme-ensemble`. Tout état autre
  que `ok` se lit « aucune simulation », avec son motif en clair. Aucune écriture à la lecture : le pointeur reste.

## Les écrans

| Geste | Où | Fichier |
|---|---|---|
| Poser, retirer | Fiche du groupe-cours, un champ « Simulation » sous la pratique de notation | `index.html`, `js/trimestre-v2.js`, `js/trimestre-v2-groupes-cours.js` |
| Ouvrir | Tableau de notation, une entrée à part sous le tableau officiel ; elle ouvre un écran distinct, dans son propre hôte | `index.html`, `js/simulation-pratique.js`, `js/tableau-notation.js` |
| Inscrire, annuler, Observer | Le tableau des cibles, sur le contexte de la simulation | `js/tableau-cibles.js`, `js/observation-cibles.js` |
| La marque | Bandeau fixe de l'écran, titre du tableau, titre de chaque fenêtre (inscription, par production, Observer) | idem, `css/tableau-cibles.css` |

- Vue étendue seulement : la vue simple ne reçoit ni l'entrée ni le champ.
- Rouvrir la sous-section montre toujours le tableau officiel : la simulation s'ouvre par son entrée, chaque fois.
- Sous la simulation : aucun bouton d'export ; le redessin après écriture repasse par la simulation.
- « Inscrire pour une production » reste offert : il n'écrit que des inscriptions et lit les productions.
- « Cibles que cette production renseigne » n'est pas étendu.

## Ordre des étapes (un fichier à la fois)

1. `js/simulation-pratique.js` : la lecture, les candidates, le refus de pose ; son banc unitaire.
2. `js/tableau-notation.js` : le contexte des cibles bâti pour une pratique donnée ; l'appel de l'entrée.
3. `js/tableau-cibles.js`, `js/observation-cibles.js` : contexte par hôte, redessin, marque, export absent.
4. La fiche du groupe-cours : le champ, sa lecture, son écriture.
5. `js/codex.js` : le conflit de fusion dit la simulation.
6. Bancs : unitaire (lecture, gardes, fusion), navigateur (les quatre gestes, la marque, l'identité des sorties officielles).
7. `docs/DATA-OWNERSHIP.md`, textes, rapport.

## Mac et iPad, séparément

- **Mac** : rien de propre au poste. Flèches du clavier et Échap : inchangés, repris du tableau des cibles.
- **iPad** : la marque ne repose sur aucun survol ; le bandeau reste visible quand le tableau défile ; le bouton de retour
  a une cible tactile de 44 px. Le champ de la fiche est un `select` natif. Non vu sur iPad d'ici : à essayer par Grégoire.

## Les preuves (tests)

- Simulation posée et niveaux inscrits : note officielle, indices, dépistage, export des résultats, note au PDF d'une copie,
  identiques octet pour octet à l'état d'avant.
- Retirer puis reposer : même tableau.
- Fusion, un seul codex porte la simulation : le conflit est montré et dit la simulation ; les inscriptions sont unies.
- Groupe sans simulation : aucune entrée, même HTML du tableau qu'avant.

## Hors du lot

Le Comparateur, le profil, la définition d'« en usage », le refus de suppression.
