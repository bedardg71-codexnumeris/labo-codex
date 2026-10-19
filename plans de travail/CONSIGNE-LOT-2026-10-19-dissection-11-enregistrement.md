# Consigne – la dissection, lot 11 : elle s'enregistre toute seule, à chaque geste

> Écrite par Cowork le lundi 19 octobre 2026 à 07 h 41 (Toronto, mesuré par `date`). **Symptôme vécu par Grégoire ce matin (7 h 37)** : en reprenant sa dissection d'hier sur la 1.207.0, tout était perdu (étiquettes, coupes, liens) ; il recommence du début. Écart à sa règle du 26 septembre : « par défaut tout s'enregistre tout seul, tout le temps, et l'écran le dit de la même façon partout ». La dissection avait été bâtie pour ne rien écrire avant « Créer ma grille » : c'est ce principe qui est révisé ici, pas l'autre (rien n'entre dans ses **grilles** avant « Créer ma grille »). Règles 2 et 7 de `PROTOCOLE.md`. **Pas de verdict complet** avant ce soir : Vitest et les specs `materiel-*` seulement.

## Ce que l'enseignant fait à la fin de ce lot

Il colle sa grille, l'étiquette, coupe, rattache, saisit ses niveaux ; il recharge la page, ferme Safari, revient le lendemain après une nouvelle version : « Apporter mon matériel » rouvre sa dissection **telle qu'il l'a laissée**. Après chaque geste, le témoin dit « Enregistré », comme dans Grilles de critères. « Coller une autre grille » (avec sa confirmation) repart à neuf.

## Ce qu'il faut

1. **Le brouillon de la dissection en cours**, écrit à chaque geste (collage, étiquette posée ou retirée, « Retirer les étiquettes », coupe et son annulation, lien et son retrait, nom de la grille, choix points ou niveaux, valeurs saisies) : le document **déjà disséqué** (jamais le HTML brut collé), les étiquettes, les coupes (avec ce qu'il faut pour « Annuler la dernière coupe »), les rattachements, la saisie. Une seule clé, par `db.js` (le document peut dépasser 200 Ko), inscrite à `docs/DATA-OWNERSHIP.md` avec son propriétaire ; trimestre ou non, à toi de trancher et de le dire.
2. **Le retour** : à l'ouverture de l'onglet, un brouillon lisible rouvre la dissection directement, sans question ; le rendu passe par les mêmes chemins qu'aujourd'hui (`textContent`, aucun `innerHTML` de données collées). Un brouillon illisible (format inconnu, abîmé) n'empêche pas l'onglet de s'ouvrir à l'accueil, et **n'est pas effacé sans geste** de l'enseignant.
3. **Le témoin** : celui que partagent Grilles de critères, Échelles et Cartouches, avec leurs mots, sans texte neuf si possible.
4. **La fin du brouillon** : « Coller une autre grille » (après sa confirmation) le remplace par le nouveau collage. Après « Créer ma grille », il **reste** (supposition de Cowork : rien ne s'efface tout seul ; le nom déjà pris empêche une seconde création identique) ; dis-le dans la demande.
5. **Le démo** : en mode démo, le brouillon ne touche pas celui de l'enseignant (mesure-le, `demo-namespace.js`).
6. **Les commentaires** qui disent « rien n'est écrit avant « Créer ma grille » » deviennent justes : rien n'entre dans les grilles avant elle ; le brouillon, oui.
7. **Les bancs.** Vitest : l'aller-retour du brouillon (document, étiquettes, coupes et leur annulation, liens, saisie : identiques après restauration) ; un brouillon illisible ignoré, sans effacement. WebKit : coller (d7), étiqueter, couper, rattacher, saisir le nom ; **recharger la page** → tout est là, le témoin a parlé ; « Coller une autre grille » confirmé → l'accueil ; recharger → toujours l'accueil. Break-test : la restauration qui oublie les liens.

## Les textes

Le témoin existant, tel quel. Tout texte neuf (un brouillon illisible, par exemple) : provisoire, listé dans la demande.

## Ce qu'il ne faut pas

- Écrire dans les grilles, échelles ou autres données avant « Créer ma grille ».
- Effacer un brouillon sans geste de l'enseignant.
- Le verdict complet, un numéro de version : ce soir, après la relecture et la porte de Grégoire.

## Livrer

Un commit sur `main` (avec `RELAIS.md`, `VERDICT-RELECTURE-2026-10-18-version-1.207.0.md` et l'inscription au BACKLOG qu'il demande, cette consigne, la consigne du jour et son archive) ; Vitest complet vert ; `materiel-*` vertes dans WebKit ; la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-19-dissection-11-enregistrement.md`. **Puis arrête-toi.**
