# Demande de relecture – Le critère algorithmique, étape 2a : les trois retouches

> Claude Code, jeudi 22 octobre 2026, 17 h 55 (Toronto). Consigne : `CONSIGNE-DU-JOUR.md` (Cowork, 17 h 44). Verdict de départ : `VERDICT-RELECTURE-2026-10-22-critere-algorithmique-noms.md`. Docs de Cowork commitées d'abord (`e6e69f6e`), puis un commit des retouches sur `main`, **non poussé**. Pas de verdict complet ni de release.

## Retouche 1 – une marque propre aux noms

- `evaluation-enonces.js` : la clé `nomsAttendus`, posée par `marquerNomsAttendus` (sur un critère algorithmique seulement). `_estNeuf`, donc `noms`, `nomsManquants` et `estNeuf`, ne lit **qu'elle**. L'ancienne constante `MARQUE_NEUF` (qui nommait la marque des codes) est partie.
- `grilles.js`, `avecProjectionNeuve` : posée au même geste et sous la même condition (`neuf`) que `codesAnnotation.marquerNeuf`. Mesuré par `grep` : c'est le seul site qui pose la marque des codes.
- Schémas : `nomsAttendus` booléen, à l'import et au partage.
- **Rien n'est écrit dans le stock.** Un critère né en 1.213 ou 1.214 (la marque des codes seule) lit « erreur » et « mot », et rien ne lui manque.

## Retouche 2 – trois surfaces que l'élève lit

1. **Le critère effondré, dans le bilan** (`_rendreAlgoA0Bilan`) : les deux noms, accordés par `accorder`, échappés. La structure ne change pas.
2. **« Tous les critères sont maîtrisés »**, dans le bilan de l'app et dans le PDF de synthèse : « (3 erreurs) », « (3 unités manquantes) ». Le participe part (décision de Grégoire, 17 h 43). Les deux sites lisent une seule fonction, `enoncesAlgo.nombreEtNom` : les mêmes mots par construction. Le PDF l'échappe au rendu (`esc(messageGlobal)`), le bilan par `ech`.
3. Les trois sites suivent la règle unique du pluriel.

Bancs et specs mesurés par `grep` : **aucun** ne figeait « annotée(s) » ni « Incomplet) » dans ces phrases. « Erreurs annotées » (`LIBELLE_SANS_CRITERE`) n'est pas touché.

Le cliquet de complexité descend : `construireConcentration` passe de 16 à 15, et le compte figé passe de 454 à 453.

## Retouche 3 – les textes

`TEXTES-2026-10-22-noms-critere-algorithmique.md` :
- § 1.3 : le repli ne vaut que sous `nomsAttendus` ;
- § 1.4 : le bilan d'un critère effondré ;
- § 1.5 : « Tous les critères sont maîtrisés », sans participe ;
- § 2 : le refus « Un nom fait 40 caractères au plus ».

## Bancs

`critere-algorithmique-noms.test.js` passe de 37 à 45 essais.

- **S.e, la sentinelle du stock de la 1.213** : un critère qui porte la marque des codes sans celle des noms rend les chaînes de `5bd643c3`, sauf la parenthèse, et `nomsManquants` rend `[]`.
- **E.b2 et A.b** : ce critère n'a ni invitation dans l'éditeur, ni invitation dans Annoter.
- **E.g, la naissance** : un critère qui devient algorithmique reçoit les deux marques.
- **B, le bilan** :
  - B.a : sans noms, les phrases de `5bd643c3` (mesurées en chargeant `evaluation-retroaction.js` de `5bd643c3`), « annotée(s) » en moins ;
  - B.b : la rédaction et la chimie, les deux noms accordés ;
  - B.c : le PDF de synthèse passe par la même fonction, sans participe ;
  - B.d : un nom piégé reste du texte.
- Les critères « neufs » des bancs N, D, E, A et X portent désormais `nomsAttendus`.
- Pour les bancs, `evaluation-retroaction.js` expose `window.bilanAlgoNoms`.

**Break-tests** (chacun rougit, fichier restauré) :
1. `_estNeuf` qui relit `codesSousCriteresSeulement` : S.e, B.a, E.b2, A.b et N.b rougissent.
2. Le site 1 remis à « erreur » en dur : B.b (chimie) rougit.
3. Le participe remis dans `nombreEtNom` : B.a et B.b rougissent. Remis au site 3 du PDF : B.c rougit.
4. `avecProjectionNeuve` qui ne pose plus la marque des noms : E.g rougit.

**Vitest** : 9 514 / 9 514. **WebKit** : 18 specs, 47 essais, tous verts. Ce sont les 17 du critère algorithmique, du texte troué et du PDF, plus `audit-parcours-sommatif-2026-09-24`.

## Item des Nouvelles

Une phrase de plus à la proposition de 17 h 35 : « « Tous les critères sont maîtrisés » dit le compte sans « annotées » : « (3 erreurs) ». »

## Le geste à vérifier à l'écran

Ouvre une grille créée hier en 1.213, avec un critère algorithmique : ses champs disent « erreur » et « mot », sans invitation. Puis crée un critère algorithmique neuf : l'invitation à le nommer paraît.
