# Consigne du jour — la phrase qui attend, puis « bibliothèque partagée » sort du vocabulaire

> **Écrite le 3 septembre 2026 à 5 h 15 (heure de Grégoire), par Cowork, avec lui.**
> ▣ **Grégoire est ÉVEILLÉ et disponible** : il a arbitré le mandat lui-même à 5 h, et il
> regardera l'écran dès que tu diras que c'est prêt. Le cycle est court, pas différé.
> **Application au moment de l'écriture : `1.111.1`, build `0903-0459`, POUSSÉE.**
> Elle remplace la consigne de la nuit, exécutée et livrée (`393e1e54`, `ec111072`).
>
> ▣ **État à l'écriture, mesuré** : `HEAD` = `ec111072`,
> `git rev-list --count origin/main..HEAD` rend **0** — témoin, `HEAD..origin/main` rend **0**
> lui aussi. Arbre propre, sauf `OU-EN-EST-ON.md` et `PROTOCOLE.md`, qui sont à Cowork :
> **ne les commite pas.**
>
> ⚠ **REMESURE TOUT** (règle 1). Les comptes ci-dessous ont été pris par Cowork en lecture
> seule ; ils ne sont pas les tiens.

---

## Le mandat — décision de Grégoire, 3 septembre

**L'expression « bibliothèque partagée » disparaît de tout ce que l'utilisateur lit.
Elle est remplacée par « la Bibliothèque ».**

▣ **Le motif, dans ses mots** : *« Les documents partagés sont des copies indépendantes.
Ce ne sont pas des originaux. Si un collègue m'envoie une cartouche, que je l'utilise et que
je la supprime, ça n'a aucun effet sur l'original de mon collègue. »*

⮕ **Le mot ment donc deux fois.** Il suggère un dépôt commun à plusieurs personnes — il n'y
en a pas. Et il fait craindre à un enseignant de détruire l'exemplaire d'un collègue en
supprimant sa propre copie. **C'est l'inverse de ce que fait le code.**

▣ **Témoin que le mot est étranger à l'écran** : `grep -n "Bibliothèque" index.html` rend
« Bibliothèque » et « Bibliothèque groupe-cours ». **« Partagée » n'y est jamais un libellé.**

↻ **Note d'avenir, à ne PAS anticiper** : quand la Voûte existera, l'expression pourra
revenir — elle décrira alors quelque chose de réel. **Aujourd'hui, non.** Ne prépare rien
pour ce futur, ne laisse pas d'alias « au cas où » (zéro-dette).

---

## Le périmètre — et les trois choses à ne PAS toucher

`grep -rni "bibliothèque partagée" js/ index.html` rend **89** occurrences dans **23**
fichiers (46 dans des chaînes, 50 dans des commentaires — les deux comptes se recouvrent,
refais-les). Les plus fournis : `productions-bibliotheque-ui.js` (11), `cartouches.js` (10),
`echelles.js` (8), `planification-bibliotheque.js` (7), `grilles.js` (6),
`echelles-bibliotheque.js` (6), `donnees-v2.js` (6).

### ⛔ 1. LES CLÉS DE STOCKAGE NE CHANGENT PAS. C'EST LA RÈGLE QUI PRIME.

`bibliothequeCartouches`, `bibliothequeGrilles`, `bibliothequeEchelles`,
`bibliothequePratiques`, `bibliothequeProductions`, `bibliothequeTampons`,
`bibliothequeAlignements`, et toute constante `CLE_BIBLIOTHEQUE_*`.

⚠⚠ **Ce sont les adresses des données réelles de Grégoire.** Une seule renommée et son
contenu devient introuvable — sans erreur, sans message, silencieusement. **C'est un chantier
de PROSE, pas de structure.** Si une modification touche autre chose qu'une chaîne affichée
ou un commentaire, **arrête-toi et dis-le.**

### ⛔ 2. LE CHANGELOG DÉJÀ LU NE SE RÉÉCRIT PAS.

`js/changelog-data.js:364` (les huit échelles d'exemple) est une annonce **ancienne**, lue par
des utilisateurs. **Laisse-la.** Réécrire ce qui a été annoncé, c'est falsifier l'historique.

⮕ **L'exception, et une seule** : `js/changelog-data.js:35` — l'annonce de **1.111.1**, publiée
il y a quelques heures, qui emploie l'expression trois fois. C'est l'annonce du lot qu'on
corrige ; **récris-la** avec le nouveau mot.

### ⛔ 3. PAS DE `sed` GLOBAL.

L'expression apparaît dans au moins quatre positions grammaticales différentes :

| aujourd'hui | demain |
|---|---|
| `Bibliothèque partagée (12)` *(titre de section)* | `Bibliothèque (12)` |
| `ajouter tes N échelle(s) à la bibliothèque partagée` | `…à la Bibliothèque` |
| `Supprimer définitivement «X» de la bibliothèque partagée ?` | `…de la Bibliothèque ?` |
| `Aucun tampon dans la bibliothèque partagée.` | `Aucun tampon dans la Bibliothèque.` |

⚠ **La casse suit la position** : « la Bibliothèque » en cours de phrase, « Bibliothèque » seul
en titre. **Relis chaque occurrence.** Un remplacement automatique produira « à la la
Bibliothèque » et des majuscules au mauvais endroit.

⮕ **Les commentaires de code** : change-les aussi, ils décrivent l'architecture et un nom
périmé s'y réinstalle tout seul. **Mais compte-les à part** dans ton rapport : visible d'un
côté, commentaire de l'autre. Les deux comptes n'ont pas la même valeur.

---

## ↻ ET UNE CORRECTION DANS LA MÊME PASSE — décidée par Cowork, à contredire s'il le faut

`js/cartouches.js:4786-4791`, `supprimerCartoucheDefinitivement`.

▣ **Mesuré ce matin sur la capture de Grégoire** : la fenêtre annonce « 89 évaluation(s)
l'emploient » et « Cette action est irréversible » — **mais elle ne dit pas de quelle grille
la cartouche part.** Le nom de la grille n'est écrit que si la cartouche est AUSSI dans la
bibliothèque ; quand elle n'y est pas, la ligne saute entièrement.

▣ **Témoin que ce n'est pas la règle partout** : `supprimerCartoucheConfirm` (l. 1810) met la
grille dans la question elle-même, **toujours** — « Supprimer la cartouche «X» de sa grille
« G » ? ».

⮕ **Deux chemins vident le même ancrage, un seul dit lequel.** C'est mot pour mot l'énoncé 8.
⮕ **Remède** : la grille se nomme dans TOUS les cas où l'ancrage est vidé. Le fragment sur la
Bibliothèque reste conditionnel, lui.
⚠ **Ce n'est pas un texte neuf** : c'est une phrase déjà arrêtée par Grégoire, appliquée au cas
où elle manquait. **Si tu juges que ça change ses mots plutôt que de les étendre, arrête-toi et
demande.**

---

## ⚠⚠ ET D'ABORD — LE VOLET A ATTEND UNE PHRASE QUI EXISTE DÉJÀ

`plans de travail/PATCH-560-portee-suppression-fichier-EN-ATTENTE-DES-MOTS.diff`

▣ **Ton rapport de cette nuit dit** : *« la règle est tranchée, les mots ne sont pas arrêtés,
je n'ai pas composé. »* ⮕ **C'était vrai quand tu as lu la consigne. Ça ne l'est plus.**
**Grégoire a tranché la phrase le 2 septembre à 21 h 45**, parmi trois formulations proposées.
Elle a été inscrite dans la consigne quelques minutes après ta lecture — d'où le décalage.

⛔ **Ne pas avoir composé était le bon geste.** Voici les mots, arrêtés par lui, à écrire tels
quels :

```
Supprimer définitivement ?

Le fichier, ses annotations et toutes les évaluations de cet élève pour cette
production seront effacés.

Cette action est irréversible.
```

⮕ **Applique ton propre patch** (`git apply --3way`), remplace la phrase marquée « Mots
PROVISOIRES » par celle-ci, bumpe le jeton de `js/liste-evaluations.js`, et écris la sentinelle
que ton préambule décrit.
⚠ **Le témoin négatif que tu as toi-même prévu tient** : sans évaluation liée, la fenêtre
reprend la phrase d'avant, mot pour mot.

▣ **Fais ce volet EN PREMIER** : il est prêt, il ferme le dernier tiers d'un énoncé, et il ne
touche pas les mêmes fichiers que le chantier du vocabulaire. **Deux lots, deux commits.**

---

## ⏳ CE QUI N'EST PAS DANS CE LOT

**Dire que les documents partagés sont des copies indépendantes.** Grégoire veut que ce soit
précisé quelque part — mais **pas dans une fenêtre de suppression**, qui n'est pas le moment
de l'expliquer. ⮕ **Inscris-le** : le bon endroit est le geste de partage ou de réception,
et ça se décide à froid.

---

## Fini quand

**Un enseignant qui lit un message de l'application ne peut plus croire qu'il touche au
document d'un collègue.**

▣ **Le témoin** : `grep -rni "bibliothèque partagée" js/ index.html` ne rend plus que
`js/changelog-data.js:364` — l'annonce ancienne, laissée exprès.
▣ **Le témoin inverse, qui compte autant** : `grep -rn "bibliothequeCartouches" js/` rend le
MÊME compte qu'avant ton lot. Cite les deux nombres. **Si celui-là a bougé, tu as touché aux
données.**

---

## L'ordre

1. **Rapporte le verdict de GitHub sur `ec111072`** (rituel d'ouverture, §2.1).
2. **Le volet A d'abord** — le patch est prêt, la phrase est arrêtée. Commit séparé.
3. **Recompte les 89 occurrences toi-même**, et sépare visible / commentaire.
3. **Vérifie d'abord la liste des clés intouchables**, avant la première modification.
4. Ce lot touche `js/` ⮕ **bump du bloc de jetons d'`index.html`**.
5. `cd tests && npm run test:unit` pour travailler ; **`npm test` complet avant de dire que
   c'est prêt.** ⚠ Vitest se lance **depuis `tests/`**.
6. ⛔ **Tu commites, puis tu t'arrêtes.** Pas de release, pas de push, pas de verdict au jeton :
   Grégoire regarde l'écran d'abord.
7. **Ce fichier se commite avec ton lot.** Nomme tes fichiers au commit ; pas de `git add -A`.

⮕ **CE QUE GRÉGOIRE DOIT ALLER VOIR** : ouvrir **Conception › cartouches**, section 2 de la
bibliothèque, et lire la question. Puis la même chose sur une **échelle** et sur une **grille**
— trois familles, trois écrans, un seul mot. ⚠ **Qu'il ne confirme rien.** Lire suffit.
