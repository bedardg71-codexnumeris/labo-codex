# Consigne de lot – Un fichier `js/` neuf ne peut plus entrer sans être chargé (#657)

> **Écrite par Cowork le dimanche 13 septembre 2026, 13 h 34 (Toronto).**
> ⚠ **CE N'EST PAS `CONSIGNE-DU-JOUR.md`.** Celle-là porte le lot #847 (les exemples gris), en cours d'exécution. Ce lot-ci est
> le SUIVANT ; il a son propre fichier pour que les deux ne se marchent pas dessus.
> ⛔ **Ce lot n'écrit PAS une ligne dans `index.html` ni dans `js/`** – uniquement dans `tests/`. C'est ce qui le rend
> exécutable pendant que #847 touche `index.html`. **S'il te vient l'envie de corriger quoi que ce soit dans `index.html`
> depuis ce lot : non. Inscris et continue.**

---

## 0 · Ce que ce lot livre

Rien à l'écran. Un contrôle de plancher : **un fichier `js/` neuf qui n'est déclaré nulle part fait rougir la suite**, au lieu
d'entrer en silence et de produire un `undefined` au premier usage réel chez un utilisateur.

C'est une prévention, pas une réparation – la fiche le dit, et la mesure le confirme (§ 1). **Release patch.**

## 1 · Ce qui est mesuré (Cowork, le 13 sept. sur `07f0d74d`) – la fiche tient, mais pas pour la raison qu'elle donne

La fiche dit « aucun défaut ouvert aujourd'hui ». **Vrai – et c'est vrai de justesse** : sur 197 fichiers `.js` sous `js/`,
**193 sont déclarés par un `<script src>` d'`index.html`, et QUATRE ne le sont pas.** Aucun n'est un défaut, mais chacun l'est
pour un motif DIFFÉRENT, et c'est ce qui décide de la forme du contrôle :

1. **`js/pack-demo-10.js`** – injecté au vol par `js/demo-namespace.js:134` (`script.src = 'js/pack-demo-10.js?v=' + …`).
   `index.html:14507` porte même un commentaire qui l'annonce.
2. **`js/heic-worker.js`** – chargé en travailleur par `js/heic-decodeur.js:113` (`new Worker('js/heic-worker.js?v=' + …)`).
3. **`js/pratiques/pratique-interface.js`** – documentation pure, JAMAIS servie, et **sciemment** : elle porte un `export {}`
   au fond d'une IIFE, illégal en script classique. `tests/unit/sentinelle-scripts-parsables.test.js` (§ « LE PÉRIMÈTRE ») la
   nomme déjà et explique pourquoi elle en est exclue.
4. **`js/_archives/entites-ui.js`** – un dossier d'archives.

## 2 · Où ça vit – et pourquoi ce n'est pas un fichier neuf

⚠ **`tests/unit/sentinelle-scripts-parsables.test.js` fait DÉJÀ la moitié du travail, dans l'autre sens** : « tout script que
`index.html` charge existe sur le disque et se compile ». #657 est **le sens inverse** : « tout fichier du disque est atteint
par quelque chose ». Les deux ferment la même boucle par ses deux bouts.

⮕ **Le contrôle neuf va DANS ce fichier**, dans un second `describe`. Un fichier séparé qui relit `index.html` avec sa propre
regex, c'est deux vérités pour un même parsing – exactement la dette que le zéro-dette interdit.
⚠ Renomme le fichier si son nom ne couvre plus son contenu, et mets à jour l'en-tête : un libellé qui ment sur son contenu est
un défaut à part entière (c'est ce qu'a fait la sentinelle #552 le 27 août).

## 3 · LA FORME DU CONTRÔLE – et le piège qui l'attend

⛔ **N'écris PAS une liste d'exceptions par nom de fichier.** C'est le réflexe naturel ici, et c'est un contrôle qui se périme
le jour où quelqu'un l'allonge d'un cinquième nom pour faire passer un vrai oubli. **Un fichier compte comme atteint s'il est
NOMMÉ quelque part**, et ça se mesure :

- son chemin apparaît dans un `<script src>` d'`index.html` (la liste que la fonction existante fabrique déjà), **OU**
- son chemin apparaît dans un littéral de chaîne d'un fichier `js/` (c'est ce qui attrape le travailleur et l'injection, sans
  les nommer) ;
- le dossier `js/_archives/` est hors périmètre, **par dossier**, avec son motif en commentaire ;
- il reste alors **UNE seule exception nommée** : `js/pratiques/pratique-interface.js`, avec son motif – documentation jamais
  servie, `export {}` illégal en script. **Une seule, et elle porte sa raison dans le code.** Si la mesure t'en donne plus
  d'une, ne l'ajoute pas à la liste : c'est ta règle qui est trop étroite, ou c'est un vrai défaut à inscrire.

## 4 · Le garde qui empêche l'essai de passer à vide

⚠⚠ **C'est LA panne probable de ce contrôle, et aucune autre assertion ne peut la voir** : un `it.each([])` est VERT. Si le
parcours du dossier rend une liste vide – mauvais chemin, mauvaise extension, `readdir` non récursif – le contrôle ne vérifie
plus rien et la suite reste verte.

⮕ **Reprends le garde que le fichier porte déjà** (« trouve bien la liste des scripts (sinon le test ne prouve RIEN) ») et
donne-lui son jumeau : la liste des fichiers du disque compte plus de 150 entrées, et elle contient un fichier témoin nommé
en clair. ⚠ Prends un témoin **stable** – pas un fichier du chantier courant.

## 5 · La preuve

**Trois mutations, et les trois doivent rougir :**

1. **Un fichier neuf non déclaré** : créer `js/zzz-banc-657.js` dans un arbre JETABLE (`$HOME`, jamais le dépôt de Grégoire),
   relancer ⮕ rouge, en NOMMANT le fichier fautif dans le message. Un message qui dit seulement « un fichier manque » oblige
   à rechercher à la main : la valeur du contrôle est dans le nom qu'il rend.
2. **Le garde du § 4** : vider la liste des fichiers ⮕ rouge (sans lui, ce serait vert).
3. **L'exception trop large** : élargir l'exception nommée à `js/pratiques/` en entier ⮕ un fichier réel de ce dossier doit
   alors échapper au contrôle. ⚠ Si rien ne rougit, c'est que l'exception ne protégeait rien : dis-le.

⛔ **Ne compte pas un rouge que tu n'as pas vu.** Le journal du 13 a montré deux fois qu'un compte de rouges non reproductible
ne prouve rien : décris chaque mutation assez précisément pour qu'un tiers la repose à l'identique.

Vitest complet. Puis `scripts/release.mjs patch`.

## 6 · Écritures de backlog, dans le même commit

- **COCHER #657**, en écrivant les quatre cas mesurés du § 1 : c'est ce qui évitera qu'on rouvre la fiche en croyant que le
  contrôle a des trous.
- **RIEN d'autre.**

## 7 · Ce qu'on n'annonce pas

**Pas d'entrée « Nouvelles ».** Rien ne change pour un utilisateur.

## 8 · Livraison

**RELECTURE CROISÉE DE COWORK AVANT LA RELEASE** ; verdict Playwright Cowork fermé (PROTOCOLE règle 8).
⚠ **Ce lot ne peut pas partir avant #847** : les deux releasent, et deux bumps concurrents se marchent dessus. #847 d'abord.

---

## Ce qui reste sur `index.html`, et pourquoi ce n'est pas ce lot-ci

`#520` (l'ancien éditeur caché qui duplique des identifiants de page) est l'autre fiche d'`index.html` qui ne demande aucun
arbitrage à Grégoire. **Elle attend après mardi** : c'est une ablation d'un bloc de DOM dans `index.html`, donc un conflit
direct avec #847 en cours, et le jour où vingt collègues découvrent l'accueil n'est pas celui où on retire un bloc de page.
Les sept autres fiches d'`index.html` demandent toutes soit ses mots, soit un arbitrage, soit son iPad.
