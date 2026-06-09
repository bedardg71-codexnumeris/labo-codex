# Cadrage #327 — Classement par dossiers dans toutes les bibliothèques

> **Statut** : cadrage (conception), 9 juin 2026. Prolonge #320 (livré en 1.5.0 pour les pratiques).
> **Origine** : demande Grégoire (9 juin, captures grilles/productions/échelles/cartouches) —
> « implémenter ce système de classement/navigation dans les autres bibliothèques aussi ».
> Reprend l'intention initiale de #320 (« même chose dans toutes les bibliothèques d'ailleurs »).

---

## 1. Objectif

Étendre le système de répertoires de #320 (dossiers exclusifs, « Mes dossiers » repliable, pool
groupé en selects compacts, assignation) aux **4 autres bibliothèques** : grilles, échelles,
cartouches, productions.

## 2. Acquis (rien à réécrire côté moteur)

`js/repertoires-bibliotheque.js` est **déjà transversal** : paramètre `biblio` partout
(`obtenir/creer/assigner/retirer/grouper`), `getId` paramétrable, dossiers exclusifs, helper
`grouper`. La clé globale `repertoiresBibliotheques` stocke les dossiers de toutes les biblios
(discriminées par `biblio`). Donc **stockage + logique + groupage = prêts**.

Les 4 modales passent par `BibliothequeUI` (comme les pratiques), donc l'UI est mutualisable :
- Grilles — `afficherBibliothequeGrilles` (`js/grilles.js`), filtre discipline, clé `grillesTemplates`.
- Échelles — `afficherBibliothequeEchelles` (`js/echelles.js`), filtres discipline + pratique, `echellesTemplates`.
- Cartouches — `afficherBibliothequeCartouches` (`js/cartouches.js`), filtre par grille, `bibliothequeCartouches`/`cartouches_*`.
- Productions — `afficherBibliothequeProductions` (`js/productions-bibliotheque-ui.js`), filtre discipline + import trimestre + ordre perso, `bibliothequeProductions`.

> Revérifier les numéros de ligne au moment du code (convention projet — modales modifiées depuis).

## 3. Le vrai travail = UI, à NE PAS dupliquer 4×

Aujourd'hui les handlers de classement sont **spécifiques aux pratiques**
(`creerRepertoirePratiques`, `classerPratiqueSelectionnee`, `genererZoneRepertoiresPratiques`,
`basculerZoneRepertoires`, etc., dans `pratiques-gestion.js`). Copier ce code 4 fois = 4× la dette.

**Stratégie : généraliser d'abord, câbler ensuite.**

1. **Extraire un helper UI générique** (paramétré par `biblio`) — pressenti dans `bibliotheque-ui.js`
   (module UI partagé des biblios) : rend la zone « Mes dossiers » repliable, le pool groupé en
   selects compacts (`renderLigneDossierSelect`), et expose les handlers génériques.
2. **Refactorer les pratiques** pour utiliser ce helper (preuve de généricité, **zéro régression** —
   les 3 sentinelles #320 doivent rester vertes).
3. **Câbler chaque bibliothèque** une par une (quasi gratuit une fois le helper en place).

### Architecture proposée (à valider au code)

- Handlers **génériques** prenant la `biblio` en paramètre via `data-param` :
  `creerRepertoireBiblio(biblio)`, `classerItemSelectionne(selectId, repId)` (le selectId encode la
  biblio), `retirerItemSelectionne(selectId)`, `basculerZoneRepertoires(biblio)`…
- **Registre de rafraîchissement** : chaque modale enregistre sa fonction de ré-affichage
  (`BibliothequeUI.enregistrerRafraichissement('grilles', afficherBibliothequeGrilles)`). Les
  handlers génériques rafraîchissent la bonne modale après une mutation.
- État de dépliage **par biblio** (un drapeau par `biblio`, pas un global).
- Hook de cohérence : chaque biblio appelle `repertoiresBibliotheque.retirerItem(id, biblio)` quand
  un item est supprimé (comme `retirerPratiqueDeLaBibliotheque` le fait pour les pratiques).

## 4. Découpage en lots

| Lot | Contenu | Test |
|---|---|---|
| **T0** | Extraction du helper UI générique dans `bibliotheque-ui.js` + refacto **pratiques** dessus | Sentinelles #320 vertes (non-régression) |
| **T1** | Câblage **grilles** (structure la plus proche des pratiques) | Rendu |
| **T2** | Câblage **échelles** | Rendu |
| **T3** | Câblage **productions** (cohabiter avec import trimestre + ordre perso) | Rendu |
| **T4** | Câblage **cartouches** (cohabiter avec la relation « par grille ») | Rendu |
| **T5** | Hygiène + release `minor` (+ éventuel répertoire d'exemple démo, cf. #320) | — |

## 5. Décisions à trancher (au cadrage fin / au code)

1. **Sort des filtres existants par biblio** : comme pour les pratiques, les filtres
   (discipline / pratique / grille) redeviennent incohérents avec les selects par dossier.
   Recommandation : les retirer là où ils sont de simple commodité (discipline, pratique). **Cas à
   part : le filtre « par grille » des cartouches** est une relation structurelle (une cartouche
   appartient à une grille) — à conserver ou repenser, pas un simple filtre. À décider avec Grégoire.
2. **Ordre** : grilles → échelles → productions → cartouches (du plus simple au plus spécifique).
3. **Volume** : cartouches/productions peuvent être nombreuses — vérifier le select compact en vrai.
4. **getId** : toutes les biblios ont `.id` → `getId` par défaut convient.

## 6. Garde-fous

- Le classement reste une **couche par-dessus** : ne modifie jamais les items (clé séparée
  `repertoiresBibliotheques`, range par identité). `SKILL_integrite_globaux` respecté de fait.
- `config.js` / `navigation.js` non touchés.
- `echapperHtml()` sur les noms, `data-action` (CSP), ≥ 1 test par lot.
- Refacto pratiques = **non-régression obligatoire** (sentinelles L0/L1/L2 vertes).
