# Demande de relecture – Le critère algorithmique, étape 2a : les deux noms de l'enseignant

> Claude Code, jeudi 22 octobre 2026, 17 h 35 (Toronto). Consigne : `CONSIGNE-DU-JOUR.md` (Cowork, 17 h 05). Base : `10e42815` (le commit de docs de la consigne, fait en premier). Un commit sur `main`, **non poussé**, sans numéro de version ni verdict complet (consigne § 4). Textes provisoires : `TEXTES-2026-10-22-noms-critere-algorithmique.md`.

## Ce qui a changé

1. **Le modèle** (`evaluation-enonces.js`). Les noms vivent sur le critère : `critere.noms = { erreurs: {singulier, pluriel}, mots: {singulier, pluriel} }`. Les clés sont les identifiants des données (`erreurs`, `mots`), qui ne changent pas. Trois lectures, par paire : les deux formes écrites ; sinon, critère d'avant, « erreur / mot » ; sinon, critère neuf (la marque `codesSousCriteresSeulement`), un repli **provisoire** (« élément relevé », « unité »). **Une paire à moitié écrite se lit absente.** Nouvelles fonctions : `noms`, `nomsSaisis`, `nomsManquants`, `appliquerNoms`, `accorder`, `estPluriel`, `enEtiquette`, `nomsFrancaisEcrit`.
2. **La règle du pluriel, une seule** : `estPluriel`, le singulier sous 2. `{s}`, la ligne du PDF, le miroir, le total d'Annoter et la copie fictive d'un palier la lisent tous.
3. **La parenthèse** : `mentionPonderee` rend « (3,5 après pondération) ». L'aide du repère `{points}` suit. Les Nouvelles 1.213 n'ont pas été touchées.
4. **Le décompte du modèle Générique** : `Ta production contient {erreurs} {nomErreurs}{points} pour {mots} {nomMots}.` C'est la structure du 2 sept., sans « de » devant les noms. « Aucune annotation » devient `Aucun tampon ni {nomErreurs} annotés.` Le modèle Français garde ses mots, et les textes de `critere.enonces` restent tels quels.
5. **Les deux jetons sont offerts** dans la palette du décompte (et `{nomErreurs}` dans « Aucune annotation »), famille « écrit dans la grille », comme `{critere}`. ⚠ **Supposition nommée** : j'ai lu « `REPERES` gardent leur forme » comme « les quatre repères existants ne changent pas de libellé avant 2b ». Je n'y ai pas lu « aucun repère neuf ». Motif, mesuré : hors palette, le composeur montrait `{nomErreurs}` **en texte brut** dans le décompte par défaut de toute grille. `{s}` n'est plus offert, comme le demande la consigne.
6. **L'éditeur de grille** : un bloc en tête du gabarit, avant les sous-critères, avec deux rangées (« Ce que tu comptes », « Ce à quoi tu le rapportes ») de deux champs chacune (singulier, pluriel).
   - Un critère **neuf** a ses champs vides, l'exemple grisé « unité manquante / calcul », l'invitation, et sa rangée manquante en orange.
   - Un critère **d'avant** montre ce qu'il lit (« erreur », « mot ») et n'écrit rien au rendu.
   - **Le geste écrit les quatre formes affichées.** Écrire seulement le champ changé aurait laissé une paire à moitié écrite, donc lue absente. Pour un critère d'avant, « erreur / erreurs » s'écrit donc à côté du nom changé, ce que la consigne permet.
   - Une forme de plus de 40 caractères est refusée par le témoin.
   - Après le geste, le gabarit se redessine et le focus revient au champ des noms où il était.
   - « Partir de la liste du français écrit » pose « erreur » et « mot » sur toute paire qui n'est pas déjà nommée.
7. **Ce que j'ai mesuré pour le refus** (§ 2.3) : l'éditeur ne refuse **pas** d'enregistrer un critère neuf sans sous-critères (`sauvegarderGrilleTemplate` ne refuse qu'un nom de grille vide). J'ai donc retenu la même chose pour les noms : **aucun refus**, seulement l'invitation (éditeur et Annoter) et le repli provisoire.
8. **Partout où « erreur » et « mot » s'écrivaient pour un critère algorithmique** :
   - les champs de l'évaluation, dans les deux modes et en consultation : l'étiquette est le nom au pluriel avec sa majuscule (« Erreurs », « Unités manquantes »), et la ligne de résultat porte les noms ;
   - l'aide sous la formule, avec les noms du critère ;
   - la bulle du badge et la section 5c (D3, D4b, D6, D7), en textes fixes ;
   - le miroir : les copies, « champ « Mots » vide », la phrase du facteur ;
   - la copie fictive d'un palier ;
   - la ligne du PDF, sortie de `renderCritere` dans `ligneCalculAlgo`, avec les noms lus par `synthese-retroaction-data.js` ;
   - le total de la palette d'Annoter.
9. **Annoter** : sous un critère neuf sans noms, la palette le dit et nomme le repli que l'élève lit en attendant.
10. **Le voyage** : `noms` entre dans `SCHEMAS_IMPORT.grille` et dans le schéma de partage. Les deux schémas sont fermés et bornent chaque chaîne à 40 caractères ; l'import retire les balises.

Jetons anti-cache à `20261022c` : les dix fichiers JS touchés, plus `evaluation-calcul.js` (un commentaire) et `styles.css`.

## Pour la relecture (règle 2 du PROTOCOLE : un format qui voyage)

- **Une grille partagée avec ses noms, ouverte par une version qui ne les connaît pas**, se lit « erreur » et « mot » : l'ancien schéma, une liste blanche, laisse tomber le champ.
- ⚠ **Le cas qui ne se lit pas proprement.** Un enseignant a réécrit son décompte et y a posé `{nomErreurs}` ou `{nomMots}`. Une version antérieure qui reçoit ce texte ne connaît pas le jeton : `rendre` le laisse tel quel, et l'élève lit « {nomErreurs} ». Le décompte par défaut n'est pas concerné, puisqu'il n'est jamais écrit dans la grille (`appliquerAuCritere`). Je n'ai rien fait pour ce cas. Il n'existe qu'entre deux versions, et la 1.214 est la seule en ligne.

## Le stock

**Rien n'est écrit** sans geste : ni au chargement, ni par migration. Le banc N.f et l'éditeur (E.b) le vérifient. Pour un critère sans noms, les phrases et la ligne du PDF sont identiques au caractère près à celles de `5bd643c3`, **sauf la parenthèse**. Je l'ai mesuré en chargeant les modules de `5bd643c3` ; la sentinelle S porte ces chaînes mesurées.

**Deux écarts, nommés :**
- **une étendue de 0 ou 1** se lit désormais au singulier : « sur 1 mot », « pour 0 mot ». Avant, c'était toujours « mots ». La règle unique de la consigne l'impose. Le cas réel est une copie notée par « Pénalité fixe par erreur » sans nombre de mots : « 5 erreurs sur 0 mot » ;
- **un nombre d'erreurs entre 1 et 2** prend le singulier. Ce cas est inatteignable aujourd'hui : le champ est lu par `parseInt`.

## Bancs

**Vitest**, nouveau banc `critere-algorithmique-noms.test.js` (37 essais) :
- N, le modèle (7 essais) ;
- S, l'invariant du stock, avec des chaînes mesurées sur `5bd643c3` (4 essais) ;
- D, le garde-fou du plan : une rédaction et une chimie (« unité manquante » sur « calcul ») sur chaque surface (11 essais) ;
- E, l'éditeur (6 essais) ;
- A, Annoter (2 essais) ;
- X, un nom piégé `<img src=x onerror=…>` dans l'éditeur, l'évaluation, le PDF et l'import (4 essais) ;
- V, l'aller-retour par l'export et par le partage, avec et sans noms (3 essais).

**Bancs existants mis à jour** :
- la parenthèse : `critere-algorithmique-dit-vrai`, `-etape-0`, `sentinelle-miroir-critere-algo` ;
- les textes : `critere-algorithmique-mots`, qui lit désormais les deux fichiers de textes, et la chimie du miroir, qui reçoit ses noms ;
- la palette, de quatre à six repères : `sentinelle-texte-troue-etape-1`, `-etape-2-gabarit`, `-etape-2-une-seule-carte`, `sentinelle-composeur-badges`, `sentinelle-carte-bilan`.

Pour ne pas monter les sentinelles de qualité, la ligne du PDF est sortie de `renderCritere` dans `ligneCalculAlgo`, et trois interpolations sont échappées.

**Résultat : 809 fichiers, 9 506 essais, tous verts.**

**Break-tests** (chacun rougit, fichier restauré) :
1. Le nom par défaut d'hier changé (« faute ») : N.a, N.b, N.d, S.a, S.c, D.f, E.b et E.c rougissent.
2. Le nom non échappé dans la ligne du PDF : X.c rougit.
3. `noms` retiré du schéma de partage : V.a et V.c rougissent.
4. `noms` retiré du schéma d'import : X.d et V.b rougissent.
5. La règle du pluriel ramenée à `> 1` : N.d rougit.
6. Le geste qui n'écrit que le champ changé : E.c et E.f rougissent.

**WebKit** : 17 specs du critère algorithmique, du texte troué et du PDF, soit **46 essais, tous verts**.
- Specs mises à jour : `critere-algorithmique-miroir` (la chimie tape ses quatre noms au clavier, de champ en champ ; la grille neuve passe par la liste du français écrit), `texte-troue-reperes-enonces`, `texte-troue-badges-dans-la-phrase`.
- Je n'ai pas rendu de verdict complet : il se rend à la release.

## Trouvailles hors du lot (inscrire et continuer)

- **Les textes de la projection EUF** (« Tu fais en moyenne 1 erreur à chaque 39 mots », les paliers) disent encore « erreur » et « mots ». Ils relèvent de l'étape 3 (la table de cas). Un critère neuf naît sans projection.
- **La formule** (« Erreurs pondérées ÷ Mots × Facteur », section 5c D2a) parle encore en erreurs et en mots : c'est l'étape 4.
- **L'amorce `Saisissez les erreurs et le nombre de mots`** (`evaluation-chargement.js`) est un texte caché que `estAmorceDeSaisie` reconnaît. La changer briserait cette reconnaissance. Issue retenue : commenter et oublier, rien d'écrit dans le code.

## Item des Nouvelles proposé (non écrit)

> **Nomme ce que tu comptes.** Un critère algorithmique porte deux noms, au singulier et au pluriel : ce que tu comptes et ce à quoi tu le rapportes (« unité manquante » sur des « calculs »). Ils s'écrivent dans les champs de l'évaluation, la phrase de l'élève et son PDF. Un critère existant garde « erreur » et « mot ». La parenthèse devient « (3,5 après pondération) ».

## Le geste à vérifier à l'écran

Dans une grille neuve, crée un critère algorithmique, écris « unité manquante / unités manquantes » et « calcul / calculs » sous lui, puis évalue une copie : les champs disent « Unités manquantes » et « Calculs », et le PDF de l'élève dit « … unités manquantes sur 12 calculs ».
