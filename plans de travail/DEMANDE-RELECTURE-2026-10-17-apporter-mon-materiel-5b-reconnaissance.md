# Demande de relecture – « Apporter mon matériel », étape 5b du plan : la reconnaissance, d'après douze grilles réelles

> Claude Code, samedi 17 octobre 2026, vers 13 h 45 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5b-reconnaissance.md` (12 h 48), tirée de `PROPOSITION-2026-10-17-reconnaissance-des-grilles.md` (numéros repris). Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Un commit local, non poussé : `d75d8f09`**, au-dessus de l'étape 6 (`1c1868e0`, sa demande `4353ed99`). Aucun push, aucune release, aucun verdict complet (étape 8).

## État mesuré

- Vitest complet, depuis `tests/` : **770 fichiers, 9 125 essais, verts** (sentinelle de complexité comprise : aucune fonction du matériel au-dessus de 15, comme avant le lot).
- Banc neuf `tests/unit/materiel-etape5b-reconnaissance.test.js` : 40 essais — F1 à F8 et F8-texte avec leur lecture **attendue** (celle de la proposition), les règles une à une, la création, l'interface, l'exemple. **55 mutations, une par règle, 55 rouges**. Quatre survivaient au premier passage : chacune a fait ajouter l'essai qui manquait (R.2d, R.7b, R.8, R.10).
- Les grilles fictives, textes inventés : `tests/unit/_helpers/grilles-fictives-5b.js`, partagées avec la spec.
- Spec neuve `tests/integration/materiel-etape5b-reconnaissance.spec.js`, seule dans WebKit : F1 et F6 collées → rôles sans geste → À classer écartés → Vérification juste → « Créer ma grille » → ce qui est écrit ; pour F1, le bloc de Grilles de critères montre « Débutant ». **3 mutations, 3 rouges**. Specs du matériel : **20/20**. Ce n'est pas le verdict.
- **Gestes au menu des rôles : zéro** pour les huit grilles (F.z).
- Quatre essais anciens ajustés à la règle neuve, et à elle seule : **L.a** et **A.b** (étape 5 : lignes à puce → sous-critères ; « / 0 » accepté), **G.d** et **S.a** (lot 3a : « selon les puces » par défaut ; quatre options).

## Ce que j'ai fait, et ce que j'ai supposé

Points 1 à 11 faits (10 et 11, « si le temps le permet », aussi : F4a, F6, F8 et F3 en avaient besoin pour se lire sans geste). 12 non fait.

1. **Point 4, la forme choisie** (tu me demandais de la dire). Une grille dont **chaque** critère tire ses points de ses cases de niveau ou de sa réglette est **en points** (`enPoints`) : analytique, sans échelle (#941). Ses niveaux ne gardent que leur **nom**, qui range les descripteurs : `descripteurs: { parNiveau: { ‹nom du niveau›: texte } }`, **sans `echelleId`**.
   - Mesuré : le schéma de partage est fermé (`echelleId`, `parNiveau`) ; un champ neuf serait refusé, et **`echelleId: null` aussi** (« null non accepté ») ; l'omettre passe (essai C.e : projeté tel quel, paquet valide, import gardé).
   - Grilles de critères montre la clé quand aucune échelle ne la connaît (`rendreAttenduNiveaux`) : le **nom** s'affiche (essai C.d ; spec F1).
   - Le nom de niveau devient requis, unique (sans la casse), sans « _ » en tête (clé refusée au partage). Ni plage, ni note retenue, ni code.
   - ⚠ Effet assumé : un nom de niveau fait de chiffres seuls (« 1 », « 2 ») serait trié par JavaScript avant les autres clés.
2. **Supposé (point 4)** : il faut un texte **puis** les points (une case de deux lignes au moins), la forme de la proposition (« un descripteur ou un qualificatif, puis les points »). Motif : les bancs des lots 1 et 5 emploient « 1 », « 2 » comme cases de niveau, et la consigne exige qu'ils se lisent comme avant. Une grille « Clarté | 10 | 7 | 4 » (des nombres seuls) reste donc à niveaux, ses nombres en descripteurs.
3. **Grille mixte** (des critères à points, d'autres non) : elle reste à niveaux, les points deviennent la pondération du critère → #1101.
4. **Point 7** : la suite par case de nom vide n'est proposée que sous un critère **resté critère** (pas sous une ligne allée à classer) : sinon le cas I.i du lot 1 (« orphelin ») changeait. Le recollage exige une ligne de part et d'autre, sans ponctuation finale en haut, une minuscule en bas, et aucun point dans la rangée du bas.
5. **Point 2** : la ligne de calcul exige « erreurs » **et** « mots » **et** des blancs « ___ » : sans les blancs, un descripteur de langue (« moins de 5 erreurs par 100 mots ») resterait un critère (essai R.2b). La pénalité et « Note : » ne se lisent qu'en tête de ligne.
6. **Point 10** : une partie en rangée = majuscules seules, suivie d'un vrai critère ; ou l'en-tête recopié. Elle court jusqu'à la partie suivante, **jusqu'à une ligne de pied** (F6 : « LANGUE / 40 » sous le total n'est pas dans « DÉVELOPPEMENT »), ou, quand ses critères s'écrivent à puce, jusqu'au premier nom sans puce (F8 : « Conclusion »). La partie garde la casse du document (« INTRODUCTION – Sujet amené »).
7. **Point 11** : « / 40 » au bout du nom compte aussi (F6, « LANGUE / 40 »), seulement précédé d'une espace (« Analyse 1/2 » reste un nom). Une colonne de pondération passe devant.
8. **Une bande de codes seule** (sans sa rangée de textes) n'est « Nom d'un critère » que si elle reprend les codes d'une bande appariée (la langue de F2) ; sinon, « X | 1 | 2 » restait « Nom d'un critère » et le lot 1 changeait.
9. **« Aller plus loin » (étape 6)** : une grille en points qui décrit déjà ses niveaux n'a que la phrase commune, comme la grille à rétroactions (même raison : le paragraphe proposerait ce qui est fait). **Supposition de Claude Code, à dire à Grégoire.**
10. **« Aussi »** : l'encadré « Dans l'application » de l'étape des rôles a deux variantes pour une grille en points (20.13, 20.14 de l'inventaire).
11. Découpage de la lecture (`rolesCorps`, `modeleDepuisRoles`) en petites fonctions : la sentinelle de complexité rougissait (une fonction à 36, trois au-dessus de 15). Aucune hausse assumée.

## Disposition des trouvailles

- **Inscrit** : #1097 (point 12, plusieurs tableaux), #1098 à #1101 (points 13 à 16), sur ta consigne.
- **Non fait, non inscrit — à toi de dire** : le titre de grille écrit dans la **case d'angle** (F3) n'est pas proposé comme nom de la grille ; la proposition le décrit dans la forme de F3, sans le mettre dans la lecture attendue.
- **F8-texte** : épinglé tel qu'il se lit aujourd'hui (avec tabulations : 4 critères, les autres lignes à classer ; sans : « pas de tableau »), point de départ de l'exploration du texte brut ; aucune règle neuve.

## Textes provisoires neufs (pour l'étape 7)

Tous dans l'inventaire, **§ 20** (20.7 à 20.18), et corrigés sur place là où 5b les a changés (8.6, 8.8, 8.15, 12.2, 15.19). En bref : le rôle « Partie » ; « selon les puces : … » ; trois raisons à classer (calcul, pénalité, commentaires) ; deux encadrés « Dans l'application » ; « …, avec ce qui est attendu à chaque niveau. » ; deux manques de noms de niveau ; « de 0 à 100 ». ⚠ Deux noms fabriqués s'impriment sur le PDF des élèves : « ‹partie› – ‹critère› » et le nom recollé.

## Pour toi

Relecture de 5b (et de 6, si ce n'est fait). Puis l'étape 7, avec Grégoire.
