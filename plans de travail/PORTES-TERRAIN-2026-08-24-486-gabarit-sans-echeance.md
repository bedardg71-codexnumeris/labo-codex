# PORTES TERRAIN — #486 · un gabarit s'enregistre sans date d'échéance

**Version à éprouver** : **1.94.0** · build `0824-1141`
**Date d'émission** : 24 août 2026 · **révisée le jour même** (voir « Ce qui a été retiré »)
**Artefact interactif** : https://claude.ai/code/artifact/886278b4-72e8-43b3-ba74-cb8116eefded
**Jumeau HTML versionné** : `plans de travail/portes-terrain-2026-08-24-486-gabarit-sans-echeance.html`
**Volume** : **4 vérifications · 1 décision** — environ trois minutes
**État** : ⏳ **DUE**

> **Cette porte a d'abord été émise à 34 rangées, puis ramenée à 4.** Grégoire :
> « je suis complètement découragé par les portes terrain nombreuses […] ma
> préparation de cours n'avance pas pendant ce temps ». Il avait raison : 34
> vérifications pour un chantier qui retire un `if` et ajoute une pastille,
> c'était disproportionné. **Trente rangées ont été RETIRÉES parce qu'elles
> étaient prouvables en session — et elles l'ont été.** Le détail de chaque
> preuve est plus bas : une rangée retirée n'est pas une rangée sautée.

---

## Ce que le cycle a livré

Tu m'as écrit : *« j'ai besoin de pouvoir enregistrer un gabarit même s'il
n'est pas entièrement complété. Ici, je ne peux faire de sauvegarde parce que
je n'ai pas de date d'échéance. Ça me bloque dans ma planification. »*

1. **La date d'échéance n'empêche plus d'enregistrer.** Titre, type et
   pondération restent exigés.
2. **Un badge « à planifier »** sur les productions sans échéance, dans la
   liste de gauche.
3. **Le texte d'aide** ne prétend plus l'inverse.

**Ce qui n'a PAS changé** : une production sans échéance n'apparaît ni au
calendrier ni dans les indices C et P. C'était déjà le cas, et c'est voulu.

> **Pas de sauvegarde d'archive exigée pour cette porte.** Tu modifies UNE
> fiche que tu possèdes déjà, et le geste se défait en retapant la date.
> Aucune migration, aucune écriture de masse. Exiger un export complet pour ça
> serait du théâtre.

---

## Les 4 rangées

| | Geste | Attendu | Tags |
|---|---|---|---|
| **1** | `git pull`, recharge l'app, lis le **bas de page** | **`1.94.0 · build 0824-1141`**. Si tu lis 1.93.0, ton app est celle d'AVANT et les trois rangées suivantes seront de **faux rouges** | Terminal |
| **2** | Ouvre **ta production de la capture** (« Description de personnage »), ne touche pas à la date, clique **Enregistrer** | **Aucune alerte.** « Production modifiée avec succès ! » — c'est ton déblocage, rends-toi compte qu'il est là | ⚠ Données |
| **3** | Sur **iPad**, regarde le badge « à planifier » en mode clair **puis** en mode sombre | Lisible du premier coup d'œil, et il ne déborde pas de la carte | iPad |
| **4** | Compte les productions qui portent le badge, et combien te surprennent | **Portent : \_\_\_\_ · Surprennent : \_\_\_\_** — c'est un relevé, aucun chiffre n'est un échec | |

> **Pourquoi la 3 est la seule vraiment obligatoire.** Les contrastes sont
> calculés (5,63:1 clair · 5,20:1 sombre · au-dessus du seuil AA même au
> survol), mais **je n'ai aucun navigateur Safari en session** : le binaire
> WebKit est bloqué par la politique réseau de l'environnement. Ton œil sur ton
> matériel est la seule mesure qui existe.

---

## La décision

> Ce n'est pas une vérification. C'est un choix posé faute de pouvoir le
> trancher à ta place — et tu y répondras en préparant tes cours, pas en
> cochant une case.

| | Question | Ton verdict |
|---|---|---|
| **D** | Tu as choisi que **seule la date** cesse de bloquer. Après avoir préparé quelques productions : la **pondération à 0** t'a-t-elle rebloqué ? Faut-il la libérer aussi ? | \_\_\_\_ |

---

## Ce qui a été retiré, et la preuve qui le permet

**Une rangée retirée n'est pas une rangée sautée.** Chacune a été éprouvée en
session, le 24 août, avant d'être coupée. Une prochaine session qui se demande
« mais ça, l'a-t-on vérifié ? » trouve la réponse ici.

| Rangées retirées | Ce qui les remplace |
|---|---|
| **1.1, 1.2, 1.3** (10) — enregistrer sans date, garde-fous titre/type/pondération, multi-groupes tout décoché | Logique pure, sans DOM ni navigateur. **25 cas Vitest** dans `sentinelle-486-gabarit-sans-echeance.test.js` + **4 break-tests rouges** (remettre le blocage → 4 rouges ciblés ; ignorer la case décochée → 3 ; retirer le badge → 3 ; retirer l'exclusion du portfolio → 1) |
| **2.1** (5) — badge présent/absent selon le type | **Exécuté dans Chromium contre le vrai `index.html`**, données semées dans la clé namespacée réelle : badge présent sur « sans échéance », « artefact sans date » et « groupe décoché » ; absent sur « datée » et « portfolio conteneur ». Style calculé par le navigateur : fond `rgb(255,255,255)` opaque, texte `rgb(102,102,119)`, 75 × 20 px. Zéro erreur de page |
| **2.3** (3) — les trois microcopies | **Relues dans Chromium via l'API réelle** `accompagnement.obtenirEntree()` : `cn-prod-echeance` et `echeance-indices` contiennent bien « facultative » ; la note sous le champ aussi, après appel de `gererChangementTypeProduction()` |
| **2.4a, 2.4b** (2) — le calendrier ignore puis reprend | **Exécuté dans Chromium avec le filtre exact du calendrier** (`assignee && !!date` via `obtenirEcheanceEffective`) : 0 production retenue sans date, 1 avec date |
| **2.4c** (1) — la confirmation « hors trimestre » | `validerEcheancesDansTrimestre` et son site d'appel `productions.js:1222` **n'apparaissent pas dans le diff du commit `4970f11`** : fonction et appel intacts |
| **2.4d** (1) — export PDF sans date | `export-pdf.js:556` traite déjà le cas nul (`dateEcheanceExp ? … : '—'`), et **ce chemin n'est pas neuf** : les portfolios conteneurs n'ont jamais eu de date et sont exportés depuis toujours |
| **§0.3** (1) — sauvegarde d'archive | Retirée par **tri de risque** : une écriture réversible sur une seule fiche ne justifie pas un export complet |
| **§3.1, 3.2, 3.4, 3.5** (4) — mot du badge, registre, badge ailleurs, portfolio | Retirées : ce sont des questions de goût qui se répondent **à l'usage**. Si le mot ou la couleur te déplaît en t'en servant, dis-le en une phrase — pas besoin d'un formulaire |

---

## Ce que je n'ai toujours pas pu vérifier

1. **Aucun verdict Safari/WebKit.** J'ai tenté d'installer WebKit : refusé par
   la **politique réseau de l'environnement** (`cdn.playwright.dev` et
   `playwright.download.prss.microsoft.com` bloqués en 403). Ce n'est pas une
   limite technique — c'est un réglage. ⮕ **Si tu ouvres ces deux hôtes, cette
   catégorie de portes disparaît presque entièrement.**

2. **La voie Chromium existe et elle est réparable.** Suite d'intégration sur
   le Chromium local : 57 passés / 54 échoués — mais **39 des 54 ont une cause
   unique**, mesurée : les 36 fichiers de specs portent une liste blanche
   d'erreurs console copiée-collée qui ne connaît que la formulation *WebKit*
   d'un non-événement (image absente en `file://`). Chromium dit
   `net::ERR_FAILED`. **Une ligne ajoutée à un spec l'a fait passer de rouge à
   vert** (essai fait puis restauré). ⮕ Chantier proposé : un helper partagé au
   lieu de 36 copies.

3. **L'iPad n'existe pas en session.** C'est la rangée 3, et c'est la seule
   raison pour laquelle cette porte existe encore.

4. **Ton corpus n'est pas là.** C'est la rangée 4.

5. **Mon erreur de la journée, à consigner.** J'ai produit 34 rangées pour un
   chantier qui en méritait 4, alors que j'avais déjà prouvé la moitié dans
   Chromium sans m'en servir pour alléger la liste. Le défaut n'est pas dans le
   modèle des portes : il est dans l'absence d'une étape de tri obligatoire
   avant d'écrire une rangée.

---

## Au retour du terrain

1. Un échec en rangée 1 = build en retard, pas un défaut. Refais `git pull`.
2. Tout autre échec devient un item de BACKLOG avec son numéro de rangée.
3. Reporter ici l'état, la date du relevé, et le verdict de la décision **D**.
