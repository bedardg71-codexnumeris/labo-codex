# Demande de relecture – la version 1.208.0 (« Rattacher sans ordre, et une dissection qui s'enregistre »)

> Claude Code, lundi 19 octobre 2026, vers 9 h 15 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-19-version-1.208.md` (9 h 08), **temps A**. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Sur `main`, **non poussés** : les lots 12 (`8eebd2e7`) et 11 (`c908c4a2`), puis la release 1.208.0 (`b0f3e2a6`) ; ce fichier suit dans un commit de documents. **Pas de verdict Playwright, pas de push** : c'est le temps B.

## Avant tout : le lot 13

**Il n'était pas commencé** : aucun fichier de code modifié au départ, seuls `CONSIGNE-DU-JOUR.md` et la porte l'étaient. Pas de branche `lot-13-en-cours`, rien de mis de côté.

## Ce qui est fait

1. **Les onze textes**, tels quels, marqués « validé G. 19 oct. 9 h 06 » :
   - les huit du lot 12 (`TEXTES_LIEN` de `materiel-dissection.js` : `bandeau`, `bandeauChoix`, `enMain`, `choisi`, `reportee`, `rien`, `nomEntier`, `sansEtiquette`) ;
   - deux du lot 11 dans `TEXTES_BROUILLON` (`geste`, `reprise`), et le troisième, `MESSAGE_BROUILLON_ILLISIBLE`, dans `materiel.js`.
   Plus aucun « PROVISOIRE » dans `materiel-dissection*.js`. Seuls les commentaires changent.
2. **L'entrée 1.208 des Nouvelles**, en tête, `vert`, mot pour mot. Espaces insécables et apostrophes typographiques (’) comme la 1.207, titre compris (comme « La grille des présences s’imprime »). Les entrées 1.207 et 1.206 sont inchangées.
3. **La release** : `scripts/release.mjs minor` (aperçu d'abord) → **1.208.0**, build **1019-0911**. Les quatre points (`version.json`, `version.js`, `js/init-inline.js`, `js/main.js`) portent le même numéro et le même build.
4. **La porte** : ton §8 et le relevé de 8 h 34, commités tels quels.

## Le rituel de fin de session

- **Audit statique** sur tout le code depuis la 1.207.0 (`e76e65fe`) : aucun `innerHTML`, handler inline, `eval` ni `console.log` ajouté. Un seul `JSON.parse`, la copie profonde `JSON.parse(JSON.stringify(x))` du brouillon : ce n'est pas un import. Aucune zone protégée ni module sensible touché. Aucun `page.click`, `waitForTimeout`, `.only` ni `.skip` dans les specs des lots 7, 11 et 12.
- **Break-tests refaits** sur `materiel-dissection-lecture.js`, restauré ensuite (`cmp` identique, diff vide) :
  - la tête prise sur le second touché : O.a, O.b, E.b et D.a rougissent ;
  - `lireBrouillon` qui oublie les rattachements : A.a, A.b et A.c rougissent.
  Ce sont les mêmes rouges que dans les demandes des lots.
- **Passe « connexions »** : `brouillonDissection` n'a qu'un écrivain, `materiel-dissection.js`. Le registre (`trimestres.js`), l'exclusion de l'archive (`reserve.js`) et `DATA-OWNERSHIP` le nomment.
- **Vitest complet, après le commit de release** : 781 fichiers, **9 273 essais, tous verts** (54 s).
- **WebKit** : non lancé. C'est le temps B.

## Ce que j'ai supposé (une ligne chacun)

- « La consigne du jour et son archive » : j'ai commité les **deux** archives du 19, non suivies (`…-dissection-12-et-11.md` et `…-lot-13.md`).
- Les autres fichiers non suivis de `plans de travail/` (du 15 au 17 oct.) ne sont pas dans la consigne : je ne les ai pas commités.

## Ce qu'aucune machine n'a éprouvé

- Le brouillon qui reste après « Créer ma grille » : c'est la rangée 8.4 de la porte.
- Les rangées 8.2 et 8.3 sur la vraie grille de Grégoire, dans Safari.
