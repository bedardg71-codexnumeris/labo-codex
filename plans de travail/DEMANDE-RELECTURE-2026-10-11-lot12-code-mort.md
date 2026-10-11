# Demande de relecture – lot 12 : le code mort

> Claude Code, 11 octobre 2026, 13 h 53 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, enchaînement des lots 10 à 13 (Cowork, 13 h 32).
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert après chaque retrait (723 fichiers, 8 585 essais au dernier passage). Aucun spec Playwright ne nomme une fonction retirée (grep de `tests/integration`).

## 1 · Ce qui change pour l'usager

Rien à l'écran. Le navigateur charge deux fichiers de moins (`groupe.js`, `pratique-test.js`), et la pratique factice « test » ne s'enregistre plus au registre à chaque chargement.

## 2 · Retrait par retrait – chacun prouvé par grep d'appelants et Vitest

| Fiche | Commit | Ce qui part | Preuve de mort |
|---|---|---|---|
| #641 | `18e4253f` | `migrerCartouchesVersBibliotheque(cleSource)`, l'exportée de `cartouches-bibliotheque.js` | aucun appelant ; la privée de `cartouches.js` (vivante) reste |
| #688 | `7585b7c2` | `MODELES_SPECIFICATIONS` (38 lignes) | zéro lecture |
| #1047 | `567072f7` | `executerImportLocalStorageBrut` et sa branche `_format === 'localStorage-brut'` | le format brut ouvre sa propre modale → `executerImportSelectif` ; aucune exportation n'écrit `_format` |
| #469 | `283bc3bd` | `comptesDansDepistage`, puis `obtenirModePratique` (son seul usage) | aucun appelant |
| #469 (trouvaille de #792) | `ee9a0e1d` | `js/groupe.js` entier, sa balise, ses deux appels gardés (`main.js`, `contexte.js`) | aucun de ses éléments cibles n'existe dans la page ; aucun nom de premier niveau lu ailleurs (homonyme privé dans `partage-import.js`) |
| #469 | `9d0b0071` | `js/pratiques/pratique-test.js` (pratique factice auto-enregistrée) | aucun lecteur hors de ses essais et de `testerPratiqueTest` (console) |

**Sentinelles mises à jour, avec le motif écrit dans chacune.** Ce sont des comptes ou des listes de fichiers ; aucune n'a été affaiblie sur ce qu'elle protège :
- #795 : rechargements d'import, de 3 à 2 ;
- flush avant rechargement : de 6 à 5 ;
- #393 : « Import interrompu », de 2 à 1 ;
- #383 : l'essai du bilan partiel de la fonction retirée ;
- #790 : lit maintenant la fiche vivante au lieu de l'import CSV mort ;
- #871 : trois essais de `PratiqueTest` ;
- #745 et #551 : la liste de fichiers ;
- #824 : `identifierPattern`, de 5 à 4.

## 3 · Coupé : le reste de #469

La fiche déborde, je la coupe comme prévu. Restent, remesurés aujourd'hui :
- `pratique-notation-v2.js` : 1 098 lignes, ses 14 cibles DOM absentes. Trois appels gardés depuis `pratiques-bibliotheque.js` sont sans effet. **Dix fichiers de `tests/unit` le lisent.**
- L'îlot de `pratiques.js` : `#listePratiquesSidebar` est absent.
- La grappe `calculerNoteFinale` de `pratique-configurable.js`.
- `initialiserPratiquesPredefines`.
- L'ancienne génération des grilles, échelles et cartouches.
- `HorairesEntite` : il ne survit que dans `js/_archives/`, qui n'est pas chargé.
- L'outil de diagnostic (I14).

C'est un lot à lui seul. Tout est écrit dans la fiche.

## 4 · Trouvaille, sans fiche neuve (aucun symptôme vécu)

**L'import CSV vivant des élèves ne lit pas la colonne « Mesure d'aide ».** Son seul lecteur était l'import de `groupe.js`, mort. La donnée entre désormais par la fiche (#792, lot 10). Je le dis ici pour que la décision soit prise en connaissance de cause. Ce n'est pas corrigé.

## 5 · Ce que j'ai supposé – une ligne chacune

- La pratique « test » n'est assignée à aucun groupe-cours chez un utilisateur ; ses données ne sont pas mesurables d'ici. Une assignation de ce genre deviendrait « introuvable », comme toute pratique absente.
- `js/_archives/` reste en place : ce sont des archives voulues, pas du code chargé.
- Les commentaires qui nommaient `groupe.js` disent maintenant « l'ancien groupe.js, retiré le 11 oct. 2026 » ; ceux des enveloppes de notifications ne nomment plus que `evaluation.js`.

## 6 · Item de Nouvelles proposé

Aucun. Rien ne change pour l'usager, et un nettoyage interne ne s'annonce pas.
