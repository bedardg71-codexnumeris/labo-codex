# Consigne du jour — les suppressions disent vrai *(énoncé 8, volets A · C · D)*

> **Écrite le 2 septembre 2026 à 21 h 30 (heure de Grégoire), par Cowork, POUR LA NUIT.**
> **Application au moment de l'écriture : `1.111.0`, build `0902-1959`.**
> Elle **remplace** la consigne écrite plus tôt ce soir, mise de côté dans
> `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-02-soir.md`.
> ⛔ **Ne la lis pas comme un complément : elle la contredit sur le volet C.**
>
> ▣ **État à l'écriture, mesuré** : `HEAD` = `1402a17c` (2026-09-02 20:00:57 -0400), **CI verte**.
> `git rev-list --count origin/main..HEAD` rend **0** — témoin, `HEAD..origin/main` rend **0**
> lui aussi, et `git rev-list --count HEAD` rend **4457** : les deux branches sont au même
> point, et la commande sait compter.
>
> ▣ **Six notes non suivies dans `plans de travail/` sont à Grégoire et à Cowork.
> Ne les commite pas.** Ce fichier-ci, oui : il est la spécification du lot (règle 6).

---

## ⚠ LIS CECI AVANT TOUT : C'EST UNE SÉANCE DE NUIT

**Grégoire dort. Il ne regardera aucun écran avant le matin.**

⮕ **Conséquence, et elle n'est pas négociable** : `PROTOCOLE.md` règle 6, forme 4 —
*une seule livraison par séance, et il regarde avant.* La nuit, « il regarde avant » ne
peut pas avoir lieu. Donc :

- ⛔ **Aucune release. Aucun push. Aucun bump de version.**
- ⛔ **Aucun verdict Playwright au jeton** : il se prend APRÈS son coup d'œil, jamais avant.
- ⮕ **Tu commites, et tu t'arrêtes.** Ton rapport l'attend au réveil.
- ⮕ **Et tu écris, à la fin, CE QU'IL DOIT ALLER VOIR À L'ÉCRAN** : quel onglet, quel geste,
  ce qui devrait être différent. C'est sa façon de vérifier, et rien ne la remplace.

⚠ **Le motif, mesuré le 2 septembre** : quatre versions sont parties avant midi et aucune
n'avait été regardée par lui. À 8 h, il ne savait plus où il en était dans son propre projet.

⛔ **Et la règle qui commande tout le reste** : *jamais un numéro de fiche sans sa phrase en
français.* « #647 » ne lui dit rien. « L'avertissement qui annonce une perte qui n'a pas
lieu » lui dit tout.

---

## Le mandat — le dernier énoncé encore ouvert

*« Ce qu'un utilisateur détruit, il l'a voulu ; ce qu'il garde, il le retrouve. Les messages
de suppression disent vrai, et la portée d'une suppression est celle qu'on annonce. »*

▣ **C'est le seul des huit qui reste.** Cinq sont finis, deux sont éprouvés par Grégoire.

---

## ⚠⚠ CE QUE LA REMESURE DE COWORK A TROUVÉ CE SOIR — ET QUI CHANGE LE LOT

*Règle 1(b) de `PROTOCOLE.md` : une connaissance transportée se remesure avant usage.
La consigne écrite plus tôt ce soir transportait une mesure du 31 août au MATIN. Elle
était périmée depuis le 31 août à 14 h 13.*

### ▣ La moitié du volet C est DÉJÀ FAITE — ne la refais pas

`git log -1 -L 1170,1180:js/donnees-v2.js` rend **`183b515b`, 31 août 14:13:38 -0400,
« fix(#647): la modal annonçait une perte qui n'a pas lieu, et taisait une survivance qui
a lieu »**.

⮕ **`verifierDependancesCartouche` (`js/donnees-v2.js:1137`) dit déjà vrai aujourd'hui.**
Elle mesure la survivance dans l'ancrage au lieu de la supposer, et elle annonce, mot pour
mot : *« Retrait de la bibliothèque partagée seulement : la cartouche reste attachée à la
grille « X ». »* et *« N évaluation(s) l'emploient — leurs rétroactions restent intactes. »*

⛔ **N'y touche pas.** Si tu « corriges » ce chemin, tu défais un correctif livré.

### ▣ Mais il y a un SECOND chemin, et le problème y est PIRE que ce qu'on croyait

`grep -rn "supprimerCartoucheDefinitivement" js/ index.html` rend **deux corps de fonction**,
pas deux appels d'une seule :

| chemin | fichier | ce qu'il écrit | ce qu'il annonce |
|---|---|---|---|
| onglet **Données** | `js/donnees-v2.js:1667` | la bibliothèque **seulement** | ✅ la vérité, depuis `183b515b` |
| **Conception › cartouches** | `js/cartouches.js:4753` | **l'ancrage `cle('cartouches_<grilleId>')` ET la bibliothèque** | ❌ « Cette action est irréversible. » — rien d'autre |

▣ **Témoin du périmètre** : le bouton qui l'appelle est à `js/cartouches.js:4097`
(`action: 'supprimerCartoucheDefinitivement'`), et un troisième chemin existe à côté,
`supprimerCartoucheDeBibliothequePartagee` (`js/cartouches.js:4794`).

⚠⚠ **Ce ne sont donc pas deux messages différents pour un même geste : ce sont deux gestes
de portées RÉELLEMENT différentes, dont un seul le dit.** Le chemin de Conception détruit
la cartouche partout, et ne l'annonce pas. Le texte exact qu'il affiche aujourd'hui, à citer
dans ton rapport avant de le remplacer :

```
Supprimer définitivement la cartouche «NOM» ?

Cette action est irréversible.
```

⮕ **C'est un `confirm()` natif** (`js/cartouches.js:4761`), pas une modale de l'application.

⚠ **REMESURE-LE TOI-MÊME.** Ces lignes ont bougé une fois entre le 31 août et ce soir.
**Chaque `grep` de cette consigne est à rejouer, pas à croire.**

---

## Volet C — le second chemin cesse de se taire *(#647, moitié restante)*

⮕ **Le travail** : `supprimerCartoucheDefinitivement` de `js/cartouches.js` annonce la
portée qu'elle a réellement — la cartouche part **de la grille et de la bibliothèque
partagée**, partout — avant le geste.

⚠ **Décide seul de la forme** (`confirm()` conservé ou modale de l'application) : c'est
technique, ça se tranche par une mesure de ce que fait le reste de l'écran. **Dis ce que tu
as choisi et pourquoi.**

⛔ **N'ÉLARGIS NI NE RESTREINS AUCUNE PORTÉE.** Tu ne changes pas ce qui est supprimé.
Tu changes ce qui en est dit.

⚠ **Et vérifie le troisième chemin** (`supprimerCartoucheDeBibliothequePartagee`) : s'il ne
retire que de la bibliothèque, son texte doit le dire aussi. **Corriger un chemin sur trois
laisserait les deux tiers du silence en place.**

---

## Volet D — un garde mort *(#649)*

`js/donnees-v2.js:1718` teste `typeof retirerProductionDeLaBibliotheque === 'function'`.

▣ **Remesuré ce soir** : `grep -rn "retirerProductionDeLaBibliotheque" js/` rend **2**
occurrences — le garde (1718) et son propre appel (1719). **Aucune déclaration.**
▣ **Témoin, le motif trouve bien ce qui existe** : `retirerPratiqueDeLaBibliotheque` rend
**5**. Le 2 mesure donc une absence réelle, pas un motif cassé.

⮕ **Rassurant** : le repli écrit `'bibliothequeProductions'`, la clé canonique. Aucun
décalage aujourd'hui.
⚠ **Latent** : le jour où quelqu'un déclare une fonction de ce nom, le chemin bascule **en
silence**. Un garde mort est une bascule armée.
⮕ **Remède** : retirer le branchement mort, appeler directement le chemin réel.
⚠ **Zéro symptôme ⮕ c'est le DERNIER des trois**, et il ne justifie rien à lui seul.

---

## Volet A — la copie d'un élève : dire la portée réelle *(#560 résiduel)*

↻ **TRANCHÉ PAR GRÉGOIRE le 2 septembre.** Quand on supprime définitivement la copie d'un
élève, **TOUT ce qui touche le couple (cet élève, cette production) part** — l'originale,
les reprises, l'évaluation d'un fichier réimporté.

▣ **Donc le comportement actuel du code est le BON.** Le constat **B5** de l'audit du
25 août décrivait cette portée comme « trop large » : **elle ne l'est pas.**
⛔ **N'ÉLARGIS NI NE RESTREINS RIEN.** Ce volet ne touche pas au modèle de données.

### ▣ Ce que la modale dit aujourd'hui — mesuré, à citer dans ton rapport

`js/liste-evaluations.js:2851`, `supprimerFichierDefinitivement()` :

```
Supprimer définitivement ?

Le fichier sera supprimé de façon permanente.
Cette action est irréversible.
```

### ▣ Ce qui part réellement — mesuré dans le même corps de fonction

1. le blob, la miniature (`travaux-stockage.js:1011`) ;
2. **les annotations du fichier** (`supprimerAnnotationsFichiers([id])`, #572) ;
3. l'entrée de corbeille ;
4. **toutes les évaluations du couple `etudiantDA` + `productionId`**
   (`js/liste-evaluations.js:2888-2895`).

⮕ **La modale dit « le fichier ». Elle emporte les annotations et les évaluations.**
C'est un mensonge par omission, et c'est exactement ce que l'énoncé 8 interdit.

### ↻ LA PHRASE, ARRÊTÉE PAR GRÉGOIRE LE 2 SEPTEMBRE À 21 h 45

**Trois formulations lui ont été proposées. Il a retenu celle-ci, mot pour mot :**

```
Supprimer définitivement ?

Le fichier, ses annotations et toutes les évaluations de cet élève pour cette
production seront effacés.

Cette action est irréversible.
```

⛔ **ÉCRIS-LA TELLE QUELLE.** Pas de reformulation, pas de synonyme, pas d'ajout « utile ».
Les mots qu'il lit au moment de détruire quelque chose lui appartiennent (`CLAUDE.md`, ce qui
remonte jusqu'à lui, point 3), et il vient de les trancher.

⚠ **Ce que tu peux décider seul** : le découpage en paragraphes et le style des éléments
(`<p>`, couleur d'alerte sur la dernière ligne comme aujourd'hui). **Le texte, non.**

---

## Fini quand

**Une fenêtre de suppression annonce ce qui va réellement disparaître, et ce qui va survivre.**

▣ **Le témoin** : pour chaque volet traité, cite **la phrase AVANT et la phrase APRÈS**, et
le chemin de code qui la produit.
⚠ **Et le témoin négatif, qui compte autant** : une suppression **complète et sans surprise**
doit continuer de se faire **sans un mot de plus**. Une fenêtre qui avertit partout n'avertit
nulle part.

---

## L'ordre

1. ▣ **Le verdict de GitHub sur `1402a17c` est DÉJÀ RENDU, et il est VERT.** Cowork l'a lu
   dans le navigateur à 22 h (`gh` n'est pas installé sur le poste) : **passage n°785 du
   workflow « Tests », `completed successfully`, 32 min 10 s**,
   `https://github.com/bedardg71-codexnumeris/Monitorage_v6/actions/runs/33698317119`.
   ▣ **Témoin que l'étiquette distingue** : dans la même liste, les passages **783, 782, 780
   et 779 sont `failed`** et le **781 `cancelled`**. Le vert du 785 mesure donc quelque chose.
   ⮕ **Reconfirme-le au démarrage** (le rituel §2.1 l'exige de toi, pas de Cowork), et signale
   tout écart avec cette ligne.
2. **Rejoue les mesures de cette consigne avant de coder.** Elles ont été prises par
   Cowork en lecture seule, à 21 h 30 ; elles ne sont pas les tiennes.
3. **Volet C d'abord** (le seul qui a un symptôme visible), **puis A** (sa phrase est arrêtée),
   **puis D** — zéro symptôme, il ne justifie rien à lui seul.
4. Ce lot touche `js/` ⮕ **bump du bloc de jetons d'`index.html`**.
5. `cd tests && npm run test:unit` pour travailler ; **`npm test` complet avant de dire que
   c'est prêt** — ce lot touche des chemins de destruction.
   ⚠ Vitest se lance **depuis `tests/`**.
6. ⛔ **Tu commites, puis tu t'arrêtes.** Pas de release, pas de push, pas de verdict au jeton.
7. **Ce fichier se commite avec ton lot.** Nomme tes fichiers au commit ; pas de `git add -A`.

⮕ **CE QUE GRÉGOIRE DOIT ALLER VOIR AU RÉVEIL, et c'est un vrai geste** : ouvrir
**Conception › cartouches**, cliquer « Supprimer » sur une cartouche, et **lire ce que la
fenêtre annonce**. Elle doit dire que la cartouche part de la grille ET de la bibliothèque.
⚠ **Qu'il ne confirme pas.** Lire suffit.
