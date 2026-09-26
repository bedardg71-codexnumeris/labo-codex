# Consigne du jour – une grille ne perd plus le critère qu'on vient d'ajouter quand on clique « Enregistrer »

> Écrite le 26 septembre 2026, vers 11 h 52 (Toronto), par Cowork, sur `main` = `9b575769`. La précédente (l'inventaire) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-26-inventaire-enregistrement.md` (déplacée par Cowork, à commiter).
> **Tranché par Cowork** (question technique, règle du 1er sept.) : inscrire maintenant et corriger dans un lot court, AVANT la décision d'ensemble sur l'enregistrement. Motif : une perte de données active, silencieuse, dans un écran que Grégoire utilise, et qu'un message « sauvegardée ! » recouvre.

## 0 · Inscrire

Inscris la fiche au `BACKLOG.md` (issue 2, trouvaille de l'inventaire du 26 sept., `INVENTAIRE-ENREGISTREMENT-2026-09-26.md` § 2 et annexe l. 275).

## 1 · Le constat (le tien, `[exécuté]` pour les critères, `[lu]` pour les sous-critères)

`js/grilles.js` ≈ l. 5013-5210 : ajouter ou gérer un critère ou un sous-critère écrit en base par `db.modifier`, sans mettre à jour `grilleTemplateActuelle`. Puis « Enregistrer » (`sauvegarderGrilleComplete` ≈ l. 5430 → `sauvegarderGrilleTemplate` ≈ l. 690-710) réécrit cet objet mémoire périmé par-dessus la base, et affiche « Grille "…" sauvegardée ! » (≈ l. 772). 5 → 6 → 5.

## 2 · Ce qui est attendu – le périmètre est étroit

1. **« Enregistrer » ne réécrit plus jamais une copie périmée par-dessus la base.** Le principe à tenir : le bouton écrit ce que le formulaire possède (nom, champs du formulaire) **sur la version actuelle de la grille en base**, ou l'objet mémoire est tenu à jour à chaque écriture partielle. Le mécanisme est ton choix ; dis-le en une ligne, et pourquoi. Préférence de Cowork : que l'écriture du bouton parte de la base (lecture-modification-écriture, comme `db.modifier`), parce qu'elle protège aussi contre les chemins d'écriture qu'on ne connaît pas encore.
2. **Couvre les sous-critères** (ajout, modification, suppression, « par défaut ») : confirme-les d'abord au navigateur ; s'ils ne perdent rien, dis-le.
3. **Regarde si les échelles ont le même patron** (écriture partielle en base + bouton qui réécrit un objet mémoire). Si oui et que le même correctif s'y applique sans rien changer d'autre, inclus-les ; sinon, inscris.
4. **Ne change RIEN à l'interface** : le bouton reste, ses mots restent, le toast reste. L'harmonisation « automatique / manuel » attend la décision de Grégoire sur l'inventaire.

**Stock** : une grille qui a déjà perdu un critère ne le retrouvera pas ; rien n'est réécrit. **Rien n'est effacé.**

## 3 · Preuves

- Banc WebKit : grille de 5 critères, « + Ajouter un critère », « Enregistrer » → **6 en base**, rouge sur le code d'avant. Idem pour un sous-critère (et une échelle si incluse).
- Un cas témoin : modifier le nom de la grille, puis « Enregistrer » → le nom est écrit (le bouton sert encore à quelque chose).
- Mutations : rétablir la réécriture de l'objet mémoire → rouge.
- Suite complète Vitest.

## 4 · Livraison

- **Relecture croisée de Cowork obligatoire** (écriture des grilles). `DEMANDE-RELECTURE-2026-09-26-grille-critere.md`, puis l'ordre du `PROTOCOLE.md`.
- Correctif (patch).
- **Nouvelles, proposition de Cowork, à soumettre à Grégoire avant le push** : « Grilles : un critère ajouté n'est plus perdu quand on clique « Enregistrer » ensuite. »
