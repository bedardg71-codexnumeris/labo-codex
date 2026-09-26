# Consigne du jour – Lot A de l'enregistrement : en mode anonymisation, on travaille normalement, et rien d'identifiant ne s'affiche

> Écrite le 26 septembre 2026, vers 13 h 45 (Toronto), par Cowork, sur `main` = `fd9d1dc7` (1.159.13 en ligne). La précédente (#957) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-26-lot-957-grille.md` (déplacée par Cowork, à commiter).
> **Fait foi** : `plans de travail/DECISIONS-2026-09-26-enregistrement.md` (D0 à D5, et l'ordre des lots), à commiter avec ce lot. Source des constats : `INVENTAIRE-ENREGISTREMENT-2026-09-26.md`.

## 0 · La décision de Grégoire (D5, « Je choisis A »)

En anonymisation, **on travaille normalement et tout s'enregistre** ; seul l'affichage protège l'identité des élèves. Son usage : « captures d'écran pour Claude ou démos live avec mes vraies données ». Donc deux exigences, aussi fortes l'une que l'autre :

1. **Rien ne se perd** : une écriture faite en anonymisation va dans les vraies données, comme en mode normal.
2. **Rien d'identifiant ne s'affiche**, et **aucune valeur de substitution n'est écrite** dans les vraies données.

## 1 · Ce que l'inventaire a mesuré (à remesurer avant tout code)

- `sauvegarderDonneesSelonMode` (`js/modes.js` ≈ l. 848-855) rend `false` en anonymisation (« Bloquer toute écriture ») ; seuls l'évaluation, les présences (« Enregistrer »), la suppression d'une évaluation, les jetons et la modification d'un élève passent par elle. Le reste écrit déjà (384 appels directs dans 78 fichiers, inventaire A2).
- **Perte vécue** `[exécuté]` : une évaluation faite en anonymisation paraît enregistrée pendant la séance, puis disparaît au rechargement, sans message (inventaire l. 225-228).
- Présences : « Verrouiller » écrit en anonymisation, « Enregistrer » refuse (l. 219-220). Rétroaction par la bulle du badge : texte perdu en silence (l. 81).
- **#751** (affichage) : `anonymiserDonnees` ne traite ni `confidentielEtudiants` ni `interventions` ; le volet « Confidentiel » lit le store brut, sans garde de mode – notes libres, portraits et notes de présences s'affichent tels quels (`modes.js` ≈ l. 865, `profil-etudiant-confidentiel.js` l. 87/146, `sections-affichage.js` l. 1172). Lignes de la fiche, à remesurer.

## 2 · Ce qui est attendu

1. **Écrire en anonymisation comme en mode normal.** Le blocage de `sauvegarderDonneesSelonMode` et les refus « Modification impossible – … mode anonymisation » disparaissent. #736 devient sans objet : dis-le dans la fiche et coche-la.
2. **La garde contre les substitutions – c'est le cœur du lot, mesure d'abord.** Recense chaque écran où, en anonymisation, un champ **modifiable** affiche une valeur de substitution (nom, prénom, DA, groupe…) ou pré-remplit un texte avec elle (par exemple une rétroaction qui commence par « Bonjour ‹prénom› »). Pour chacun, au navigateur : l'enregistrer écrit-il la substitution dans les vraies données ? Le remède est ton choix, champ par champ, dit en une ligne : ne pas écrire un champ resté inchangé, ou rendre ce champ non modifiable en anonymisation avec la mention « Masqué en anonymisation ». **La fiche d'élève** (nom, prénom, DA) est le cas le plus probable : si tu ne peux pas garantir simplement qu'aucune substitution n'y est écrite, laisse ces champs d'identité non modifiables en anonymisation, et dis-le.
3. **Rien d'identifiant à l'écran (#751).** Le volet confidentiel, les notes libres des interventions, les portraits et les notes de présences ne s'affichent pas en anonymisation. Un texte libre ne se dé-identifie pas de façon fiable : préfère masquer (« Masqué en anonymisation ») plutôt qu'essayer d'anonymiser. Si tu trouves d'autres fuites d'identité à l'écran en chemin, corrige-les si elles tombent sous la même règle, sinon inscris-les.
4. **Ne touche pas au témoin commun ni aux autres messages** : c'est le Lot B. Ici, une écriture en anonymisation se comporte exactement comme en mode normal, messages compris.

## 3 · Preuves

- Bancs WebKit, rouges avant, verts après : (a) une évaluation faite en anonymisation est encore là après rechargement ; (b) des présences enregistrées en anonymisation sont écrites ; (c) pour chaque champ recensé au § 2.2 : après enregistrement en anonymisation, les vraies données ne contiennent aucune valeur de substitution ; (d) volet confidentiel et notes : aucun texte réel à l'écran en anonymisation, visible en mode normal (témoin).
- Mutations : rétablir le blocage → (a) rouge ; retirer la garde d'un champ → (c) rouge ; retirer le masque du volet → (d) rouge.
- Suite complète Vitest. Données fictives seulement (règle du 22 sept.).

## 4 · Livraison

- **Relecture croisée de Cowork obligatoire** (vraies données, identité des élèves). `DEMANDE-RELECTURE-2026-09-26-lot-A-anonymisation.md`, puis l'ordre du `PROTOCOLE.md`.
- Mineure (le comportement d'un mode change).
- **Textes à soumettre à Grégoire avant le push** : la mention « Masqué en anonymisation » là où tu l'emploies ; l'aide du mode anonymisation si elle dit « lecture seule » ou l'équivalent (relève-la) ; et les « Nouvelles », proposition de Cowork : « Mode anonymisation : tu travailles normalement et tout s'enregistre ; seuls les noms, et tout ce qui pourrait identifier un·e élève, sont cachés à l'écran. »
- Fin de lot : cocher #751 et #736 ; FILE-DES-LOTS à jour.
