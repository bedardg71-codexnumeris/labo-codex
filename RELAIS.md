# RELAIS — où vit le travail en cours

> **Ce fichier ne dit qu'une chose : sur quelle branche se trouve le travail
> le plus récent.** Il est mis à jour au rituel de FIN de session et lu au
> rituel de DÉBUT. Il vit **toujours sur `main`**, et c'est toute sa raison
> d'être.

---

## État

| | |
|---|---|
| **Branche à ouvrir** | **`main`** — tout y est. Aucun travail en avance ailleurs. |
| **Version** | **1.106.0** — build `0829-0303`, **POUSSÉE le 29 août à 3 h 20** (`59c615bb`). Minor : les repères de maîtrise se posent partout où l'échelle se pense (#555 lot 2 complet, #577), plus #556, #563, #572 partiel, retrait « Alléger ». Entrée 1.106 du changelog écrite, son jeton bumpé à la main. **Vitest 4011/4011 · Playwright vert** (verdict enregistré au SHA par `pousser.sh`). ⚠ **Grégoire doit recharger sa session `file://`** : 27 jetons ont changé. |
| **Version précédente** | **1.105.0** — build `0828-1405`, **DÉPLOYÉE le 28 août à 14 h 05**. Minor : une échelle porte ses deux **repères de maîtrise**, et les **32 comparaisons IDME écrites en dur** ont disparu des DEUX documents remis à l'élève (PDF de synthèse : 14 → 0 ; bilan à l'écran : 18 → 0). **Vitest 3887/3887 (364 fichiers) · Playwright 199** au moment du bump. ⚠ **Grégoire doit recharger sa session `file://`** : 28 jetons ont changé. |
| **Version précédente** | **1.104.0** — build `0827-1245` (`588debf1`). Minor : la carte « Observation de la structure » rend un bloc par niveau de l'échelle, et le SOLO d'un critère vient du champ configuré. **Vitest 3715/3715 (350 fichiers) · Playwright 193/193**, verdict vert enregistré au SHA par `scripts/pousser.sh`. ✅ **AUCUN BUMP DÛ** : rien de code applicatif n'a changé depuis — seuls un test de constat et de la documentation. ⚠ **Grégoire doit recharger sa session `file://`** : huit jetons anti-cache ont changé au bump. |
| **Avant-dernière** | **1.103.1** — build `0827-0953`, qui a porté six changements de code sans bump (pas 3c-3, pas 4, #547, #550, #551) : la session `file://` de Grégoire était ouverte, et la règle du projet interdit de bumper pendant. **C'est la seconde fois de la journée que l'application annonce un numéro plus ancien que son code.** |
| **Travail en avance sur `main`** | ✅ **NON — TOUT EST POUSSÉ** au rituel du 28 août, 21 h 15 (un commit de code : #555 (d)+(e) et #577, voir l'entrée de tête). Avant cela : poussé au rituel de 20 h 15. `origin/main` = **`9d4e...`** (voir le dernier commit), arbre propre. **QUATRE commits partis d'un coup, produits par TROIS sessions parallèles coordonnées par messages** : `e1e66566` (#587/#578, session 70), `c1710065` (les 21 décisions, onze détaillées), `e348a42a` (six décisions, session 5b), plus le relais. ⚠ **Aucun fichier `js/` ni `index.html` dans ces commits** — de la documentation seule : le code n'a pas bougé depuis `44a5aeeb` (17 h 22), donc les verdicts de 17 h tiennent, et ils ont été **refaits** avant ce push. |
| **Suite Playwright** | ⚠⚠ **LA LEÇON DE LA NUIT DU 27-28 AOÛT, ET ELLE VAUT POUR TOUT CHANTIER DE RENDU.** Les DEUX régressions de la nuit ont été invisibles à Vitest — 3767/3767 puis 3780/3780, verts pendant que Playwright rougissait. Vitest tourne dans `node`, sans navigateur ; **Playwright tourne dans WebKit, le moteur de Safari, contre le vrai `index.html`**. ⮕ **Sur un lot qui touche l'affichage, la suite navigateur n'est pas une formalité de fin : c'est la seule qui voit.** ⮕ Corollaire découvert le 28 : une vérification qu'on croyait réservée à Grégoire (« porte terrain ») est souvent automatisable en spec WebKit — la porte 2.6 l'a été. |
| ⚠ **AVANT TOUTE SUITE PLAYWRIGHT** | **fermer GitHub Desktop.** Les specs lisent l'arbre de travail en direct ; une commande git lancée pendant la suite change les fichiers sous leurs pieds et fait rougir des specs au hasard. Trouvé le 26 août (#523), règle versée au skill `portes-terrain`. |
| ⚠ **LE CLONE DE GRÉGOIRE EST L'ARBRE DE TRAVAIL** | `/Users/kuekatsheu/Documents/GitHub/Monitorage_v6` sert à la fois de dépôt de travail et de source `file://` pour son app. Il voit les modifications dès qu'il recharge, **avant tout push** — et peut donc tomber sur un état intermédiaire. Le `git pull` des portes terrain lui est inutile. |
| 📐 **CHANTIER MAJEUR — LIVRÉ, ET CETTE LIGNE ÉTAIT FAUSSE** | **#529 est LIVRÉ depuis le 26 août** (1.101.0 → 1.101.1, quatre lots : conversion, calcul, affichage, aide). Cette ligne l'annonçait encore « en attente » le 27 après-midi, et une session s'apprêtait à rouvrir un chantier fait. ⮕ **CE QUI RESTE EN SONT LES QUATRE SUCCESSEURS**, et aucun n'est un oubli : ~~**#537**~~ et ~~**#535**~~ (**LIVRÉS le 27 août** avec #552 — voir ci-dessous), **#539** (les clés du volet confidentiel — des CLÉS DE DONNÉES, pas des libellés), **#536** (`idmeMoyen` à 0 vs « pas de donnée », risque très réduit depuis #529). Audit d'origine : `Rapports/AUDIT-srpnf-code-en-dur-2026-08-26.md`. |
| ⏳ **ÉCHÉANCE DATÉE — 1er SEPTEMBRE, DANS 4 JOURS** | **#427** + **#508**. ✅ **GRÉGOIRE TIENT LA DATE** (arbitré le 28 août au soir, option A ; « repousser » posé et écarté). ⮕ **DÛ PAR LUI, ET PAR PERSONNE D'AUTRE** : les trois noms Cloudflare, la durée de session, la règle `Include` de la policy dormante. ⮕ **MESURÉ le 28 août** : l'avis est bien en ligne aux deux endroits (`accueil.js`, `transitions.js`), et **le bandeau s'éteint SEUL le 1er septembre** — rien à retirer à la main. Reste à réécrire le paragraphe d'accueil **au présent**. |
| ⚠ **DEUX SESSIONS ONT TRAVAILLÉ DANS CE DÉPÔT LE 26 AOÛT** | Et elles ne se voyaient pas. Un `git add -A` de la session « audit Conception » a emporté le `js/saisie-presences.js` de l'autre dans son commit de relais ; sorti et rendu avant le push. ⮕ **La consigne du projet vaut : ajouter par chemins EXPLICITES**, jamais `-A`, sur ce dépôt. ⮕ Et le hook pré-push teste l'ARBRE DE TRAVAIL, pas les commits envoyés : tant qu'une autre session y travaille, il rend un verdict sur un mélange des deux — le rouge qu'il annonce peut n'avoir aucun rapport avec ce qu'on pousse. ⮕ **ET C'EST ARRIVÉ UNE SECONDE FOIS LE MÊME JOUR, dans l'autre sens.** Le commit `38c6b574` (« #529 lots 3-4 », profil étudiant) a emporté les `BACKLOG.md` et `SESSION.md` de la session « présences » — l'inscription de l'item **#538** et la renumérotation **#534 → #537** vivent donc dans un commit qui parle d'autre chose. Rien n'est perdu, la trace est fausse ; poussé, donc non réécrit. **Deux avertissements en un jour : sur ce dépôt, `git add` par chemins explicites n'est pas une préférence, c'est la seule méthode qui tienne.** |
| ⚠ **TROIS SESSIONS ONT TRAVAILLÉ DANS CE DÉPÔT LE 26 AOÛT AU SOIR** | Et une **quatrième journée de collisions d'index** s'y est ajoutée : un `git add` suivi d'un `git commit` a emporté le travail d'une autre session entre les deux gestes. Défait et rendu avant tout push. ⮕ **La méthode qui tient : `git add -N <fichiers neufs>` puis `git commit -- <chemins explicites>` DANS LA MÊME COMMANDE.** `--only` seul refuse un fichier neuf (« did not match any file(s) known to git ») ; `git add` puis `commit` rouvre la fenêtre. ⮕ **Et le même oubli d'anti-cache s'est produit QUATRE fois en deux jours, sur trois sessions et trois chantiers sans rapport** : un fichier modifié dont le `?v=` ne suit pas. Ce n'est plus une étourderie — **c'est une lacune du filet**, inscrite en **#547** : la sentinelle compare des COMMITS, elle ne peut donc rien voir tant que le travail est dans l'arbre, et le hook `pre-push` la lit trop tard. Le geste correcteur est connu de tous et appliqué correctement à chaque fois ; ce qui manque, c'est le RAPPEL AU BON MOMENT. |
| **Dernière mise à jour** | **29 août 2026, 3 h 40** — session unique (nuit). **1.106.0 poussée** ; **#578 : le diagnostic console est LIVRÉ** (`await _diagnostiquerEchellesGrilles()`), sentinelle 6 cas / 4 mutations rouges ; **le chiffre est DÛ par Grégoire**. Fait mesuré : l'éditeur de grille n'écrit jamais `echelleId`. Entrée précédente : **28 août, 21 h 15** — session unique (soir). **#555 lot 2 (d) et (e) + #577 LIVRÉS** ; #579 livré pour le cas de l'assistant ; **#592** inscrit. **Vitest 4011/4011** (377 fichiers) · **Playwright 201** (198 verts + 3 instables pré-existantes, vertes au second essai), sur arbre gelé. ⚠ **AUCUN BUMP** : du code a changé (6 fichiers `js/`, `?v=` bougés) mais je ne sais pas si la session `file://` de Grégoire est ouverte — **1.106.0 (minor) est DUE**, à lancer par `node scripts/release.mjs minor` au prochain démarrage. Entrée précédente : **20 h 15** — fin de journée, **trois sessions**. Les **21 arbitrages de Grégoire sont TRANCHÉS et consignés dans leurs items**. Livré : #555 lot 2 (b), #556, #557, l'audit des copies d'échelle, le diagnostic des résolveurs. **Vitest 3983/3983** (374 fichiers) · **Playwright 199/199**, relancés sur arbre gelé avant le push. **Aucun bump** : 1.105.0 tient — que de la documentation, aucun `?v=` à bouger. |

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 29 août 2026, 3 h 40 (NUIT, SESSION UNIQUE)

### ✅ 1.106.0 EST POUSSÉE — ET LA SENTINELLE ANTI-CACHE ROUGIT SI ON LA LANCE AVANT LE COMMIT DE RELEASE

`node scripts/release.mjs minor` puis Vitest : **1 rouge sur 4011**, `sentinelle-anticache-fichiers-modifies`,
qui nommait 13 fichiers « périmés ». Vérifié sur pièces : les 13 sont ceux de **1.105.0 elle-même**, aucun
n'a changé depuis `c255dace`. ⮕ **Cause** : le repère de la sentinelle est l'AVANT-DERNIER commit de
`version.json` — tant que le commit de release n'existe pas, c'est `fbeffdad`, deux releases en arrière.
Celui du script est le DERNIER. **Ordre juste : script → changelog → commit de release → sentinelle.**
Elle est verte après le commit. Ce n'est pas un défaut du script ni de la sentinelle, c'est un ordre.
Le jeton de `changelog-data.js` a de nouveau été bumpé À LA MAIN (l'entrée s'écrit après le script).

### ✅ #578 — LE DIAGNOSTIC EST LIVRÉ, LE CHIFFRE EST DÛ

`await _diagnostiquerEchellesGrilles()` en console (`cartouches.js`, lecture seule). Tous trimestres par
`db.get` (pas le cache), copie archivée `{trim}_grillesTemplates` sondée avant la clé globale, une clé
partagée comptée UNE fois. Rend `{ total, avec, sans, resolues, introuvables, parCle, lignes }` et un
`console.table`. Sentinelle `sentinelle-578-diagnostic-echelles-grilles` : 6 cas, 4 mutations rouges
(porte inversée, dédoublonnage, écriture ajoutée, lecture par `getSync`).

⚠ **FAIT MESURÉ EN L'ÉCRIVANT** : l'éditeur de grille (`grilles.js`) n'écrit **jamais** `echelleId` ;
le seul littéral du dépôt est `GRILLE_GENERIQUE`. La prémisse « une grille PORTE un `echelleId` » vient
de la grille semée. Attendre un compte « sans » majoritaire ; alors le correctif commence par ÉCRIRE
l'identifiant (éditeur + rétro-remplissage), pas par le lire. Inscrit à l'item.

### ⚠ DEUX PIÈGES D'OUTILLAGE PAYÉS CETTE NUIT

1. `chargerScript` a déjà `console` (et `document`) en paramètres du sandbox : un stub `console` dans
   `globaux` fait « Duplicate parameter name » sur les six cas, sans nommer le coupable.
2. `cleSource` sonde la copie archivée par `getSync`, qui ne voit que le trimestre actif : pour une
   lecture inter-trimestres fiable, sonder les deux clés candidates par `await db.get`.

### 🔴 DÛ, ET PAR QUI

- **Grégoire** : recharger `file://` ; **lancer `await _diagnostiquerEchellesGrilles()` et rapporter
  avec / sans / introuvables** (#578) ; Cloudflare #427 ; `_diagnostiquerResolutionEchelles()` (#590) ;
  paragraphe d'accueil au présent (#508, **1er septembre = dans 3 jours**).
- **La session suivante** : #592 ; #555 : deux décisions restantes (zone intermédiaire comme progrès ;
  intention P1) ; correctif #578 UNE FOIS le chiffre connu.

### 📌 RÉFÉRENCE UNIQUE CONCEPTION / ÉVALUATIONS — `Rapports/SUIVI-conception-evaluations-2026-08.md` (29 août, 9 h)

Grégoire : « je ne sais plus où nous en sommes par rapport à la situation de départ ». Mesuré : la référence
n'existait pas — deux audits du 25 août (photos), une seconde passe le 27 (couche), un backlog dispersé.
⮕ **Créé** (option A, point zéro = 25 août) : constat par constat → item → statut → preuve, plus le bloc de la
seconde passe et la liste de travail ordonnée. Chiffres : **Conception 11 réglés / 15, Évaluations 9 réglés /
20 + 1 partiel**. Les quatre constats sans item de la seconde passe sont inscrits sous **#593**.
**Règle** : chaque livraison coche sa ligne là-bas ; ce relais n'y redit rien.

### 📌 ARBITRAGES — UN SEUL ARTEFACT, APRÈS LE CHIFFRE #578 (décision de Grégoire, 29 août 4 h)

Les skills métier (`ecosysteme-classe`, `pratiques-notation`, `depistage-rai`) ont été lus à 4 h — pas avant
la livraison : hors du dépôt, ils ne se chargent pas. Consigne de Grégoire : tout arbitrage lui est remis en
**artefact** (Artifact + skill `artifact-design` : fait mesuré → options fermées → recommandation → ce que ça
ne tranche pas), jamais en prose de chat. ✅ **CHIFFRE RAPPORTÉ** (10 grilles, 1 avec / 9 sans, 0 introuvable —
la seule « avec » est GRILLE_GENERIQUE). ✅ **ARTEFACT REMIS, 29 août ~4 h 30** :
`https://claude.ai/code/artifact/89f28423-e48a-4d62-b15c-91e6e4f48cca` — trois décisions : #555·1 zone
intermédiaire comme progrès (reco C), #555·2 intention « Outils d'observation » (reco A : clore, le repère de
l'échelle EST le réglage), #578 colonnes de la cartouche neuve (reco A : ne plus deviner, échelle choisie au
formulaire, `echelleId` écrit sur la cartouche ; la grille reste agnostique). ✅ **RÉPONSES DE GRÉGOIRE,
29 août 8 h 18, enregistrées DANS l'artefact (v3, capacité `artifact`)** : **#555·1 = C, #555·2 = A, #578 = A**,
sans note. Consignées aux items. ⮕ Trois chantiers d'exécution distincts, UN par session : (1) #578 A dans
`initialiserNouveauCartouche` ; (2) #555·1 C dans `synthese-retroaction-data.js` + `evaluation-retroaction.js`
(ligne « Progrès », deux documents, libellés = ses mots) ; (3) #555·2 A = texte d'aide du curseur « Seuil de
défi » (`index.html:8764`). ⚠ L'artefact porte désormais la seule copie de ses réponses : LIRE avant toute
republication (cf. mémoire `republier-artefact-ecriture-destructive`).

### 📌 IDs — **#593 PRIS** le 29 août (reliquats Conception) ; prochain libre : **#594**

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 21 h 15 (SOIR, SESSION UNIQUE)

### ✅ LIVRÉ : #555 LOT 2 (d) + (e), ET #577 — LES REPÈRES SE POSENT PARTOUT OÙ L'ÉCHELLE SE PENSE

Mandat de Grégoire : « rendre l'application plus cohérente et plus souple (rien de ma pratique codé
en dur) pour les utilisateurs de la communauté de pratique ». Option 1 choisie sur question fermée :
finir les échelles. Un seul commit de code, trois sous-lots, chacun avec sa sentinelle et son break-test.

- **(d) le nommage** — `seuilMaitrise` ne désigne plus que le CODE de niveau porté par l'échelle.
  `consolidation.js` : `scoreMaitrise` / `scoreMaitriseDeduit` / `scoreMaitriseRaison`,
  `_detecterScoreMaitrise`, `_scoreParConvention`. `profil-etudiant-helpers.js` / `-calculs.js` :
  `seuilIdmeMaitrise` (+ `seuilIdmeInsuffisant`, `seuilIdmeDeveloppement`). Le 4ᵉ sens (pourcentage
  0-100, `pratique-notation-v2.js`) est du CODE MORT → **#592**, pas un renommage.
  ⮕ `sentinelle-555-d-seuil-maitrise-un-seul-sens` est un **CLIQUET** (liste fermée fichier → compte,
  commentaires retirés). **Il a rougi UNE FOIS pour de vrai ce soir** : #577 a ajouté trois lectures
  dans le wizard, la liste a été mise à jour. C'est le comportement voulu — ne pas l'affaiblir.
- **(e) l'éditeur d'échelle NEUVE** porte le bloc des repères sur un tampon (`_reperesNouvelleEchelle`),
  mêmes refus, revérification à l'enregistrement, jamais de clé vide. Aperçu unique pour les deux
  éditeurs (`apercuNiveauxEchelleHtml`). `blocReperesEchelle(echelle, { handler })`.
- **#577 l'assistant** : l'étape « Échelle de performance » rend le bloc de l'éditeur pour l'échelle
  choisie, écrit par **`ecrireRepereEchelle`** (extraite : écriture pure, sans redessiner l'éditeur),
  re-rend l'étape après écriture, avertit si un repère manque, le récapitulatif le redit. Jamais le mot
  « seuil » à l'écran. **DEN volontairement exclu** (autre sens, non tranché). **#579 clos pour le cas
  de l'assistant** — mesuré : il n'embarque jamais d'échelle, il la RÉFÉRENCE (`configuration.echelleId`).

### ⚠ TROIS CHOSES QUE J'AI PAYÉES, POUR QUE LA SUIVANTE NE LES PAIE PAS

1. **`git checkout <fichier>` pour défaire une MUTATION efface aussi le travail non commité.** J'ai
   perdu deux renommages ainsi et dû les refaire. ⮕ Restaurer une mutation par **copie** depuis une
   sauvegarde faite AVANT (`cp js/x.js $S/ ; …muter… ; cp $S/x.js js/`), jamais par git tant que
   l'arbre porte du travail.
2. **Un refus ne se voit PAS par la valeur de la liste.** Sur refus, le `<select>` garde la valeur
   refusée et porte `champ-refuse` (`marquerChampRefuseEchelle`) — l'éditeur vivant fait pareil. Ma
   première assertion WebKit attendait la valeur précédente ; c'est l'assertion qui avait tort.
3. **Le dispatcher `data-on-change` est prouvé par la spec, pas par le grep.** Je n'ai pas trouvé son
   code en cherchant le nom de l'attribut ; les deux specs WebKit prouvent qu'un `change` natif atteint
   le handler par son NOM, avec l'élément en argument. Ne pas re-chercher.

### 🔴 DÛ, ET PAR QUI

- **Grégoire** : recharger `file://` (6 jetons bougés) ; **décider le bump** — 1.106.0 (minor) est due,
  je ne l'ai pas lancée faute de savoir si sa session était ouverte. Reste aussi tout ce qui est listé
  à l'entrée de 20 h 15 (Cloudflare #427, `_diagnostiquerResolutionEchelles()` #590).
- **La session suivante** : **#578** (diagnostic console des grilles avec/sans `echelleId`, option 3
  du cadrage de ce soir, non entamée) ; **#592** ; #555 : deux décisions restantes (zone intermédiaire
  comme progrès ; intention P1).

### 📌 IDs — prochain libre : **#593**

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 20 h 15 (FIN DE JOURNÉE, TROIS SESSIONS)

### ✅ LES 21 ARBITRAGES SONT TRANCHÉS — ET C'EST LE FAIT PRINCIPAL DE LA JOURNÉE

Grégoire a répondu aux vingt et un arbitrages relevés dans les skills métier et dans l'audit
du jour. **Chaque décision est consignée DANS SON ITEM**, pas dans un document à part : un item
lu dans six mois porte son arbitrage sans qu'il faille retrouver l'artefact qui l'a recueilli.

⮕ Registre complet, avec ses formulations : artefact **« Arbitrages Labo Codex »**
`https://claude.ai/code/artifact/59ed2fe9-fa0a-49d7-9f97-b0d0e46c4b8b`

**Items portant une décision** : #427, #508, #543, #555 (deux), #563, #571, #574, #577, #578,
#579, #581, #583, #584, #585, #586, #587, #588, #589, #590, #591.

### 🔴 CE QUI EST DÛ PAR GRÉGOIRE, ET PAR PERSONNE D'AUTRE

1. **Les trois valeurs Cloudflare** (#427) — échéance **1er septembre**. Aucune session ne peut
   les relever : elles vivent dans sa console, pas dans le dépôt.
2. **`_diagnostiquerResolutionEchelles()`** en console (#590) — le chantier des trois résolveurs
   ne s'ouvre PAS avant ce chiffre. S'il rend zéro divergent, il attend sans risque.

⮕ Et un troisième, à produire d'abord : **le diagnostic de #578 n'est pas écrit**. La mesure
(compter les grilles avec et sans `echelleId`) suppose une fonction console sur le patron
d'`oracle542` — livrable à produire, pas une inscription.

### ⚠ QUATRE PIÈGES QUE LA SESSION SUIVANTE NE DOIT PAS REPAYER

1. **`RELAIS.md` EXISTAIT, ET AUCUNE DES TROIS SESSIONS NE L'A LU.** Une page d'arbitrages était
   consignée ici depuis 15 h 10 ; nous en avons publié trois autres, dont deux **portant le même
   titre**. La question « quelqu'un a-t-il déjà fait ça ? » avait sa réponse écrite à l'endroit
   prévu pour ça. ⮕ **Lire ce fichier AVANT de produire un livrable, pas seulement au démarrage.**
2. **Un break-test peut ne pas POUVOIR rendre rouge.** `local obtenu="VERT"; [ $? -ne 0 ]` lit le
   code de `local`, pas celui du test : 5 mutations « conformes » sur 5, toutes fausses. Les
   TÉMOINS ne l'attrapent pas (ils attendent du vert, un harnais mort n'en produit que).
   ⮕ **Un bilan « N conformes » n'est établi que si le lot contient au moins un ROUGE obtenu.**
3. **Un commit n'est PAS une écriture.** Un `git commit` lit l'arbre et écrit dans `.git` ; il ne
   touche aucun fichier testé. J'ai invalidé un verdict Playwright à tort en déduisant des heures
   d'écriture depuis des heures de commit. ⮕ **Seuls les `mtime` tranchent** (`stat -f "%Sm %N"`).
4. **Republier un artefact est une écriture destructive** sur la seule copie lisible de
   l'extérieur. Lire l'artefact AVANT de republier par-dessus un état que quelqu'un a pu remplir :
   la lecture dépose une copie datée sous `tool-results/`, seule trace de l'avant.

### 🔒 TROIS GARDES QUI ROUGIRONT — ET QUI ONT RAISON

- **`sentinelle-transport-echelles`** est un **RATCHET** : elle rougit dès qu'un champ est ajouté
  à une échelle sans être transporté par `SCHEMAS_IMPORT.echelle`. Son message dit quoi faire.
  ⮕ **Ne pas l'affaiblir pour la faire taire.**
- **Le cliquet de #557** (`DOUBLONS_CONNUS`, 9 noms) ne descend pas seul : chaque paire réglée doit
  être **retirée de la liste**, sinon le banc rougit. C'est voulu.
- **Le test qui garde `retirerJetonRepriseCiblee`** devient **caduc** quand la case « Reprise
  ciblée » sera retirée (#563, décision C). Le retirer avec la case, pas le laisser en sentinelle
  d'un comportement disparu.

⮕ Et une **exception nommée** : le `console.log` du diagnostic (`profil-etudiant-calculs.js`) porte
son motif en commentaire. Ne pas le « corriger » en `warn` — un diagnostic qui rend son compte n'a
rien d'anormal.

### 📎 CE QUI RESTE OUVERT, PAR CHANTIER

- **#555 lot 2** : (b) le lecteur unique est LIVRÉ (`zoneDuCodeDansNiveaux`). Restent (d) le
  nommage — **tranché**, à exécuter avec #577 — et (e) l'éditeur d'échelle NEUVE, qui ne porte
  toujours pas le bloc des repères (`blocReperesEchelle` n'a qu'un appelant).
- **#587** : huit paires sur neuf **non mesurées**. Seule `creerNouvellePratique` l'est — et elle
  n'a **jamais pu s'exécuter**, pas une fois depuis le 2 janvier 2026 (nom pris depuis le
  25 novembre 2025, fichier chargé avant). Quelqu'un l'a pourtant corrigée le 20 janvier.
  ⮕ **Méthode pour les huit autres** : lire l'ordre de chargement **à l'époque où la perdante a été
  écrite**, pas seulement aujourd'hui — c'est ce qui distingue une fonction *devenue* morte d'une
  fonction **morte-née**, et le geste n'est pas le même (déduplication contre retrait).
  ⮕ **Réserve à ne pas perdre** : la longue créait une pratique en un clic, sans assistant. Rien
  n'est perdu du comportement (il n'y en a jamais eu), mais l'**intention** a existé.
- **`modifierEvaluationParId`** : alias dont la justification est **périmée** depuis `26be0d9b`.
  8 appelants dans 4 fichiers — chantier, pas retouche.
- **#591 (anonymisation)** : ⚠ **le seul des vingt et un qui ne se referme PAS par la réponse.**
  Position prise (pseudonymisation réversible), **à valider avec les contacts Loi 25** — et la
  limite n'est pas juridique : « lui seul peut inverser » cesse d'être vrai dès qu'un fichier
  anonymisé circule vers un tiers. **Ne pas le relire comme clos.**
- **#543** : décision « **ne rien réécrire** ». Aucune écriture sur les 55 évaluations : l'écart
  note↔critères est la trace d'un **jugement d'enseignant** (il arrondit ses notes finales), pas un
  défaut de données. Le geste est de faire cesser la qualification d'incohérence.
  ⮕ **Fausse piste déjà écartée** : `_diagnostiquerNoteNonCalculable` n'est PAS le site — il
  explique pourquoi une note n'est pas *calculable*, il ne compare jamais note et critères.

### 📄 DOCUMENTS À LIRE AVANT DE ROUVRIR CES CHANTIERS

- `Rapports/AUDIT-copies-echelle-reperes-2026-08-28.md` — porte le périmètre mesuré de #590 (deux
  sites, deux coûts d'échec) et les trois pertes de l'audit. **#583, #584 et #586 y renvoient.**
- Les trois artefacts d'arbitrages **clos** (`84660742`, `36b1ee77`, `971736ee`) sont archives ou
  muets, capacité révoquée. **Un seul circuit de réponse** : `59ed2fe9`.


## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 15 h 10 (fin d'après-midi)

### 🔴 QUATRE DÉCISIONS SONT DUES PAR GRÉGOIRE — ET RIEN N'AVANCE SANS ELLES

| # | Ce qui est dû | Pourquoi personne ne peut le faire à sa place |
|---|---|---|
| **#563** | Le retrait du jeton de reprise ciblée | `retirerJetonRepriseCiblee` n'existe NULLE PART, et défaire une reprise ciblée suppose de **supprimer l'évaluation qu'elle a créée**. Le pendant pour la reprise normale est une opération à confirmations multiples avec risque de perte de note (#141, #360). Trois options posées : garder le refus explicite actuel, implémenter sur le patron de la reprise normale, ou retirer la case. |
| **#427 + #508** | ⏳ **ÉCHÉANCE 1er SEPTEMBRE — dans 4 jours** | Les trois noms Cloudflare, la durée de session et la règle `Include` réellement en place dans la policy dormante. Fiche opératoire prête : `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`. |
| **`lancerAllegement`** | ✅ **TRANCHÉ le 28 août** : retrait de la fonctionnalité « Alléger ». | — |
| **`js/config.js`** | ✅ **TRANCHÉ le 28 août** : autorisation d'y toucher pour `echapperHtml`. | — |

### ✅ CE QUI A ÉTÉ FAIT CET APRÈS-MIDI — SIX ITEMS ÉVALUATIONS

Tous issus de l'audit du 25 août, aucun n'avait été engagé jusque-là.

| # | État | En une phrase |
|---|---|---|
| **#564** | ✅ LIVRÉ | Une rétroaction saisie SEULE n'est plus perdue : il ne manquait que le déclencheur, `_autoSauvegarderCriteres` lisait déjà le texte. |
| **#565** | ✅ LIVRÉ | Un étudiant en échec n'avorte plus le lot d'export, et une copie livrée SANS sa page de rétroaction est nommée — c'est ce qui partait en silence sur Léa. |
| **#559** | ✅ LIVRÉ | Les options d'import ne marquent plus un fichier ÉTRANGER. **Trois fonctions concernées, pas deux** : `syncOptImport` avait le même défaut en LECTURE. |
| **#558** | ✅ LIVRÉ | La file d'import survit au rechargement (B1, B1-aggravé, B2, B3 traités ensemble). |
| **#563** | 🟠 PARTIEL | Les six écritures muettes sont traitées. Le retrait du jeton reste DÛ (voir décisions). |
| **#572** | 🟠 PARTIEL | Volets Import et Export faits, plus `echapperHtml`. Restent Liste, Annoter, Design mineur. |

⮕ **`echapperHtml` échappe enfin les guillemets** (`js/config.js`, zone protégée, autorisation
explicite). **C'est la dépendance bloquante de #562** : poser l'échappement ailleurs ne fermait
AUCUN attribut tant que la fonction laissait passer le `"`.

⮕ **« Alléger » est RETIRÉ** (219 lignes). Toute la chaîne était morte — le bouton n'existait dans
aucun HTML, aucune fonction n'avait d'appelant. ⚠ **Le statut `facsimile` et son badge sont
CONSERVÉS** : des copies de Grégoire peuvent déjà le porter. On a retiré la capacité d'alléger,
pas la lecture de ce qui a été allégé.

### ⚠ TROIS SOUS-CONSTATS SORTIS DE #572 — NE PAS LES ROUVRIR SANS LIRE CECI

1. **Les « ~25 `console.log` » de `travaux-resolution.js` NE SONT PAS DE LA DETTE.** Il y en a 20,
   et ils sont dans `diagnostiquer`, `diagnostiquerDoublons` et `nettoyerDoublonsExacts` — des
   outils de diagnostic dont **la sortie console EST le produit**. Les retirer casserait l'outil.
2. **Les clés sessionStorage non namespacées = chantier À PART.** 21 sites, 6 clés, 5 fichiers dont
   deux hors du périmètre Évaluations. Namespacer à moitié casserait les lectures.
   ⮕ Au passage : **`travaux-mode-courant` est ÉCRITE et JAMAIS LUE.**
3. **Les couleurs utilisateur dans des attributs `style`** (~8 sites dans
   `synthese-retroaction-rendu.js`, 1 dans `evaluation.js`) : laissées, zone d'une session parallèle.

### 📐 LA QUESTION DE GRÉGOIRE SUR LE NAMESPACING — RÉPONSE MESURÉE, ET CE QU'ELLE OUVRE

**Question** : les deux champs de maîtrise ajoutés à l'échelle sont-ils namespacés par trimestre ?

**Réponse** : `echelle.seuilSuffisance` et `echelle.seuilMaitrise` sont des **propriétés de l'objet
échelle**, pas des objets séparés. L'échelle vit sous `cle('echellesTemplates')`, qui EST au registre
`CLES_NAMESPACEES` (`js/trimestres.js` l. 112, depuis #358). ⮕ **Oui, par héritage de leur porteur.**

⚠ **MAIS LE RISQUE N'EST PAS LÀ — IL EST DANS LA COPIE.** **Treize chemins** copient ou reconstruisent
une échelle (duplications, imports inter-trimestre, exports, bibliothèque). **Un seul a été corrigé**
(`dupliquerEchelle`, 28 août). Les douze autres n'ont PAS été audités : un balayage automatique par
heuristique a rendu des faux positifs (deux « suspects » vérifiés à la main se sont révélés sains —
l'un délègue à une fonction exhaustive, l'autre sérialise l'objet entier).
⮕ **Distinguer une vraie liste blanche d'un faux positif demande de LIRE chaque fonction.**
C'est un chantier, pas une mesure de passage. **Ne pas conclure depuis un grep.**

### 🧭 CE QUI RESTE EN STAND-BY, MESURÉ CE JOUR

- **#573** ✅ LIVRÉ (ce matin) — la cartouche n'est plus remplacée après « Enregistrer ». C'était le
  symptôme « des fois ça enregistre, des fois non » qui a déclenché l'audit du 25 août.
- **#574** ⏳ ouvert — l'échelle générique et les gabarits sont NON CALCULABLES (aucun `valeurCalcul`).
- **#556, #557** 🔴 ouverts, marqués CRITIQUES, **jamais engagés**. ⚠ **#557 est à moitié caduc** :
  #575 a retiré le doublon `rechargerFiltreProduction`, mais `supprimerEvaluation` existe toujours
  en double. Énoncé corrigé le 28 août.
- **#560, #561, #562, #566 à #571** ⏳ ouverts. **#562 est maintenant DÉBLOCABLE** (`echapperHtml` fait).
- **`plans de travail/PLAN-mi-aout-2026.md`** — document narratif, sans cases. Dernière modification
  le **8 août**. Les validations qui traînent depuis juillet sont **toutes « terrain Grégoire »**,
  pas Claude Code : **#334** (iPad), **#336**, **#340**. Le code est livré ; il ne reste que le geste.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 10 h 45

### 🔴 UNE ACTION DE GRÉGOIRE BLOQUE LA SUITE — À LIRE EN PREMIER

**#555 lot 1 est livré : une échelle peut enfin porter ses deux repères de maîtrise.** Mais
**aucune échelle existante ne les porte**, et **aucun lecteur n'est branché** tant qu'elles ne
les portent pas. Brancher avant retirerait la fonction chez tout le monde, Grégoire compris.

⮕ **Ce qui est dû par lui, et par personne d'autre** : ouvrir chacune de ses échelles et poser
« Suffisant à partir de » et « Maîtrisé à partir de ». Sur son échelle IDME, il a déjà dit
lesquels : **D** et **M**.

### ✅ #555 — LA DÉCISION D'ARCHITECTURE EST PRISE : DEUX REPÈRES, PAS UN

Question fermée en 3 options, tranchée par Grégoire le 28 août. **Son motif, et il commande tout
le reste** : sa gradation PAN-Standards distingue **trois** états, pas deux.

| Zone | Chez lui | Ce que la rétroaction en dit |
|---|---|---|
| sous le seuil de suffisance | I | priorité |
| entre les deux | D — « maîtrisé, **mais en développement** », non durable | signalé, pas prioritaire |
| au seuil de maîtrise et au-dessus | M, E | acquis |

⮕ **Une seule frontière aurait forcé « en développement » dans l'une ou l'autre case**, et le
bilan remis à l'élève aurait dit autre chose que ce qu'il pense.

⮕ **ET UNE DISTINCTION À NE PAS PERDRE** : dans ses mots, « maîtrise **durable** » recouvre DEUX
choses que le mot confond. Un **cran d'échelle** (M) — ordinal, ça se marque sur l'échelle, c'est
ce que le lot 1 livre. Et une **propriété temporelle** — « pérenne », « pas encore acquise » —
qui ne se lit sur AUCUN niveau : elle se lit sur la **répétition**. Un M obtenu une fois et un M
obtenu trois fois occupent le même cran et ne disent pas la même chose. Le skill
`pratiques-notation` le documente côté recherche (Clark exige deux démonstrations), et le code en
a déjà des traces : « tous les critères sont maîtrisés **depuis plus d'un artefact** »,
`identifierPatrons` sur trois productions. ⮕ **Ne pas les mélanger dans un même champ** : le
repère marque le cran, la durabilité reste une règle de suivi.

### ✅ CE QUE LE LOT 1 A LIVRÉ

`echelle.seuilSuffisance` / `echelle.seuilMaitrise` — des CODES, portés par **l'échelle** et non
par ses niveaux (un marqueur par niveau autoriserait zéro marque, ou trois : un état incohérent
que rien ne rattraperait). **L'égalité est permise** — les deux sur le même niveau = le modèle à
une frontière, sans champ de plus.

Bloc « Repères de maîtrise » dans l'éditeur vivant, **sous** les niveaux, masqué si l'ordre des
plages n'est pas lisible. L'aperçu nomme la zone de chaque niveau. Refus : code absent de
l'échelle ; suffisance au-dessus de la maîtrise (dans les deux sens) ; ordre illisible. Le vide
**retire** le repère au lieu d'écrire une chaîne creuse — une clé présente et vide se lit
« défini », et c'est faux.

⚠ **L'éditeur d'échelle NEUVE n'a pas le bloc.** Il écrit dans un tampon avant création ; les
repères s'y posent après enregistrement. Acceptable, inscrit au lot 2, **pas oublié**.

### ⚠ L'ÉDITEUR D'ÉCHELLE VIVANT EST `#tableauNiveauxEchelle` — l'autre est mort

Vérifié, et le dépôt le documentait déjà (`echelles.js`, note #524) : `index.html` porte **deux**
`id="tableauNiveaux"`, dont le premier est dans un bloc « Conteneurs cachés pour compatibilité ».
`getElementById` rend le premier : **`afficherTableauNiveaux` écrit donc dans un conteneur
caché**, et le bouton « Enregistrer » de l'ANCIEN SYSTÈME est sans effet. C'est #520 au backlog.
⮕ **Ne rien brancher sur cet écran.** Le doublon d'id relève de #481, laissé en place.

### 📌 #580 EST PRIS — prochain ID libre : **#581**

**#577 — l'assistant de configuration des pratiques ignore les deux repères de maîtrise.** Demandé
par Grégoire à la livraison du lot 1 : `wizard-pratique-v2.js` fait choisir une échelle
(`'echelle-performance'`, `required: true` pour toute pratique non sommative) et passe à la suite,
alors que c'est le moment où l'utilisateur PENSE sa pratique. PAN-STD d'abord — c'est la famille dont
le calcul repose sur les niveaux.

⚠⚠ **Un piège de vocabulaire est déjà dans cet écran** : l'assistant a une étape `'seuils-personnels'`
où « seuil » désigne le **dépistage** (`seuilVaBien`, `seuilDifficulte`, `seuilGrandeDifficulte`, plus
`seuilVerrou`). Y ajouter « seuil de suffisance » et « seuil de maîtrise » sans les distinguer
mettrait deux notions sous un même mot, dans le même parcours. **Trancher le vocabulaire avec Grégoire
avant d'écrire l'écran.** ⏳ Dépend de #555 lot 2 : sans lecteur, l'assistant n'aurait rien à garantir.

### ⏳ RESTE DU LOT 2, DANS L'ORDRE

1. **Grégoire pose ses repères** (bloquant, voir en tête).
2. Le **lecteur unique** « zone d'un code » — une seule règle, comme `niveauDuCodeDansEchelle`.
3. **Brancher** : B10b (6 sites / 14 comparaisons), `evaluation-retroaction.js` (8 lignes / 18).
   Les deux tests qui CONSTATENT ces comptes rougiront alors : **c'est le signal voulu.**
4. **Unifier les quatre replis divergents** (`|| 0.70` ×2, `|| 0.75` ×2) — le pas de #555 qui n'a
   jamais demandé de décision.
5. L'éditeur d'échelle **neuve**.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 14 h 30 (FIN DE SESSION)

### ⚠⚠ LES CINQ PREMIÈRES MINUTES

1. **Audit d'entrée AVANT de croire la prémisse.** Deux sessions ont écrit dans ce dépôt toute la
   journée. `git log --oneline origin/main..HEAD`, `find .git -name '*.lock'`, `git status`.
2. **Committer par chemins EXPLICITES.** ⚠ `git commit -- <chemin>` est en mode `--only` et committe
   l'ARBRE : sur un fichier partagé comme `index.html`, il emporte le travail de l'autre session. La
   méthode qui tient : `git show HEAD:index.html` → réappliquer SES SEULES lignes → `git hash-object -w`
   → `git update-index --cacheinfo` → `git commit` SANS chemins. Employée trois fois aujourd'hui, dans
   les deux sens.
3. **Lire cette entrée MAINTENANT, pas dans une heure.** Une ligne recopiée d'un relais lu trois heures
   plus tôt a produit une erreur signalée par Grégoire le 28 au matin.

### ✅ CE QUE LA JOURNÉE A LIVRÉ — 1.105.0 EST EN LIGNE

**#555 (les deux lots) et #575 B10 sont clos.** Une échelle porte `seuilSuffisance` et `seuilMaitrise`,
posés par l'utilisateur dans l'éditeur. `zoneDuNiveau(code, echelleId)` rend `'priorite'` / `'signale'` /
`'acquis'` / `null`, et les **32 comparaisons IDME en dur** ont disparu des deux documents remis à
l'élève. Deux **ratchets à zéro** les empêchent de revenir.

Aussi livrés : **#573** (la cause du « des fois ça enregistre, des fois non »), **#576**, la mise en page
de l'éditeur d'échelle, et — par la session parallèle — **#564, #565, #559, #563 (moitié), #557**, plus
sept énoncés du backlog rectifiés par mesure.

### ⚠⚠ CINQ CHOSES QUE SEUL LE BREAK-TEST A VUES, SUR DU CODE DÉJÀ VERT

C'est le fait marquant de la journée. **Aucune n'était visible à la lecture.**

1. **Une régression de condition.** « avant = priorité » au lieu de « avant ≠ acquis » : sur l'échelle
   de Grégoire, D → M et D → E cessaient d'être annoncés à l'élève. Mes mutations portaient toutes sur
   le côté DROIT de la condition. ⮕ **Muter les deux côtés d'un `&&`.**
2. **Sept mutations vertes sur dix** après le branchement du bilan à l'écran : les bancs existants
   couvraient l'ordre et le nommage, jamais les zones. **Un module peut être entièrement rebranché sans
   qu'une seule sentinelle s'en aperçoive.**
3. **Deux remises à zéro d'un drapeau SANS EFFET** — les neutraliser ne rougissait rien.
4. **Un montage de test qui mesurait des zéros** : `vueRetroGenerale` manquait, la fonction sortait
   immédiatement, et deux cas passaient par vacuité — **un `not.toContain` est satisfait par une chaîne
   vide.**
5. **Une spec WebKit verte pour la mauvaise raison** : elle lisait une cartouche EXISTANTE alors que le
   repli ne joue qu'à la CRÉATION.

⮕ **Et deux fois, WebKit a vu ce que Vitest ne voyait pas** : la zone intermédiaire ajoutée au seul PDF
(le bilan à l'écran laissait son titre suivi du VIDE — le symptôme de la porte 2.6, réintroduit), et
« ta force » qui exigeait des défis alors qu'un élève peut n'avoir que des signalés.

### ⚠ TROIS PIÈGES D'OUTILLAGE, PAYÉS AUJOURD'HUI

- **`release.mjs` bumpe ce qui est COMMITÉ, pas ce qui est dans l'arbre.** Deux symptômes opposés, une
  cause : un fichier modifié APRÈS le script garde un jeton périmé (`changelog-data.js`, corrigé à la
  main) ; un fichier non commité PENDANT n'est pas bumpé du tout. Versé à #547.
- **Le hook pré-push teste l'ARBRE, pas les commits envoyés.** Le travail non commité d'une autre
  session est donc dans le verdict — et peut bloquer votre push.
- **`u-hide` porte un `!important`** qu'un `style.display` inline n'écrase pas : une spec qui ouvre un
  écran caché doit retirer la CLASSE.

### 📌 ARTEFACT DE DÉCISION REMIS À GRÉGOIRE

**Sept décisions en attente**, chacune avec son fait mesuré et ses options :
`https://claude.ai/code/artifact/971736ee-f346-48c5-999a-8a12e97aadca`

Aucune ne bloque les autres. La seule datée est **#427 · #508 — 1er septembre**, et ce qui manque ne
peut être relevé que par lui (trois noms Cloudflare, durée de session, règle `Include`, envoi du message
à la CoP).

### ⏳ CE QUI RESTE DU LOT 2 — ordonné

| | Objet | Bloqué par |
|---|---|---|
| 1 | `_detecterSeuilMaitrise` (`consolidation.js`) — devine par « avant-dernier niveau », **juste chez Grégoire par coïncidence**, repli `0.75` | rien |
| 2 | Les **quatre replis divergents** `0,70` ×2 / `0,75` ×2 (+ le 5e ci-dessus) | rien |
| 3 | Le **nommage** — `seuilMaitrise` porte quatre sens, j'en ai ajouté un cinquième | décision (#555 · #577) |
| 4 | **#579** (pratiques configurables sans éditeur de repères), **#580** (deux listes blanches) | décision |

⮕ **Les points 1 et 2 ne demandent AUCUNE décision** : c'est par là qu'il faut reprendre.

### 📌 IDs — prochain libre : **#583**

#581 (EUF/CAF dans le moteur) et #582 (devis « théorie + labo ») inscrits ce soir : les trois sites qui
ne vivaient que dans le rapport d'audit sont désormais tous au backlog ou qualifiés hors famille.

### ⚠ SIGNALÉ PAR LA SESSION PARALLÈLE, NON TRAITÉ

- **`echapperHtml` n'échappe pas les guillemets** (`js/config.js`, **zone protégée**) — autorisation de
  Grégoire requise. Compte pour tout texte utilisateur posé dans un ATTRIBUT.
- **Couleurs utilisateur interpolées dans des attributs `style`** sans échappement : ~8 sites dans
  `synthese-retroaction-rendu.js`, 1 dans `evaluation.js`. #575 ne les a pas clos.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 12 h 20

### ✅ B10b EST CLOS — la marque de maîtrise se lit dans l'échelle

Grégoire a posé ses deux repères ce midi ; le lot 2 était bloqué là-dessus et rien d'autre.
`zoneDuNiveau(code, echelleId)` rend `'priorite'` / `'signale'` / `'acquis'` / `null`, et
`synthese-retroaction-data.js` passe de **14 comparaisons IDME en dur à ZÉRO**.

⚠ **`null` N'EST PAS UNE QUATRIÈME ZONE**, c'est un refus de répondre — échelle non résolue, code
étranger, ou échelle sans repères. Le module ne rend alors RIEN, **et sans note technique** :
`copierToutRetroaction` copie ce bilan dans ce qui est remis à l'élève.

⚠⚠ **CHAQUE ÉVALUATION EST LUE DANS SON ÉCHELLE.** L'historique, l'antérieure et la courante peuvent
porter des barèmes différents. Lire le passé avec le barème du présent efface des progrès réels ou en
invente. **Les DEUX fautes de ce type ont été trouvées par le break-test seul**, sur un lot déjà vert.

### ⚠ CE QUI RESTE DE #555 LOT 2

| | Objet | Note |
|---|---|---|
| a | `evaluation-retroaction.js` — 8 lignes / 18 comparaisons | le bilan à l'écran, même geste |
| b | `_detecterSeuilMaitrise` (`consolidation.js`) | devine par « avant-dernier niveau » |
| c | les quatre replis `0,70` / `0,75` | le pas qui n'a jamais demandé de décision |
| d | le nommage — `seuilMaitrise` porte **quatre** sens | décision de Grégoire, avec #577 |
| e | **#579** et **#580**, ouverts par ce lot | voir ci-dessous |

### 📌 #579 ET #580 SONT PRIS — deux trous que ce lot a révélés

**#579 — l'échelle embarquée d'une pratique configurable ne peut PAS recevoir ses repères.** Le bloc
d'édition ne vit que sur `echellesTemplates` ; ces échelles-là vivent dans
`pratiquesConfigurables[].config.echelle`. ⮕ Pour toute évaluation produite sous une pratique
configurable, `zoneDuNiveau` rend `null` : pas de priorités, pas de force, pas de « tous maîtrisés ».
Visible, pas silencieux — mais réel.

**#580 — deux reconstructions d'échelle à liste blanche** dans `evaluation-chargement.js`. Elles ne
cassent pas le lecteur, mais amputent tout champ métier neuf. Même famille que le défaut de
`dupliquerEchelle`.

### ⚠ UNE QUESTION DE GRÉGOIRE A TROUVÉ CE QU'AUCUNE RELECTURE N'AVAIT VU

Il a demandé si les repères étaient **namespacés par trimestre** comme les échelles. Réponse : oui —
ils vivent DANS l'objet échelle, écrit et lu par `cle('echellesTemplates')`. Mais la question a fait
regarder les chemins de COPIE, et **`dupliquerEchelle` les PERDAIT** : elle reconstruit l'échelle par
une liste blanche qui ne les connaissait pas.

⮕ La liste blanche est **conservée** — un spread emporterait `idOriginal` et la copie répondrait à
l'identifiant de la source (#542). Le prix est que tout champ métier neuf doit y être ajouté à la
main ; le commentaire le dit désormais, et deux cas de sentinelle le verrouillent.
⮕ **La leçon** : demander « où cette donnée est-elle copiée ? » trouve ce que « où est-elle lue ? »
ne trouve pas.

### ⏳ UNE DÉCISION EN ATTENTE, PETITE MAIS RÉELLE

« Tu as progressé » reste `priorite → acquis` : passer d'une priorité à **« signalé »** n'est pas
annoncé à l'élève. C'est la règle d'origine, préservée volontairement — un refactor ne change pas la
sémantique. Mais dans les mots de Grégoire, « D est quand même une maîtrise » : il voudra peut-être
que ce passage compte. **À lui de trancher, pas à nous.**

---

## ▶ B10b — ÉTAT AU 28 AOÛT, 11 h 50 (mesuré, pas rapporté)

**B10b n'a pas bougé, et c'est l'état attendu** : il attend #555 lot 2, qui attend un geste de
Grégoire. Comptes re-mesurés au code exécutable, commentaires filtrés :

| Fichier | Sites | Comparaisons |
|---|---|---|
| `synthese-retroaction-data.js` | 6 | 14 |
| `evaluation-retroaction.js` | 8 | 18 |

Identiques à ce matin — les deux tests qui les CONSTATENT sont donc toujours verts, ce qui est le
comportement voulu.

### ⚠⚠ MAIS LA MESURE A SORTI UN SITE QUE PERSONNE N'AVAIT VU

`consolidation.js` **DEVINE déjà** ce que le lot 1 vient de rendre explicite.
`_detecterSeuilMaitrise(echelle)` porte sa convention en commentaire :
« **avant-dernier niveau = maîtrise**. Son `min / 100` = seuil. Fallback : **0.75** ».

- Sur l'échelle de Grégoire (I, D, M, E), l'avant-dernier **est** M : la convention tombe juste **par
  coïncidence**. C'est pour cela qu'elle a survécu à deux audits.
- Sur trois paliers, elle désigne le niveau du milieu. Avec un « 0 » de jugement suspendu, elle se
  décale. Sur des lettres ordonnées autrement, elle désigne n'importe quoi.
- Son repli `0.75` est un **cinquième** repli divergent, en plus des quatre déjà listés à #555.

⮕ **Chemin VIVANT, rendu à l'écran** : `calculerConsolidationIndividuelle` ←
`profil-etudiant-diagnostics.js:612`. Vérifié au grep, pas supposé.
⮕ C'est le consommateur le plus direct des deux repères — au lot 2, la convention disparaît.

### ⚠⚠ ET UNE COLLISION DE VOCABULAIRE QUE LE LOT 1 A AGGRAVÉE

`seuilMaitrise` désigne aujourd'hui **quatre choses de types différents** :

| Où | Ce que c'est |
|---|---|
| `echelles.js` (#555 lot 1) | un **CODE** de niveau (« M ») |
| `consolidation.js` | un **score 0-1** deviné |
| `obtenirSeuil('idme.maitrise')` | un **seuil de préférence 0-1** (défaut 0,85) |
| `pratique-notation-v2.js:279` | un **pourcentage 0-100** |

Aucune collision d'exécution — mais quatre sens sous un mot, et j'en ai ajouté un cinquième en
nommant le champ. ⮕ **Trancher le nommage avec Grégoire au lot 2**, en même temps que celui de
l'assistant (#577) : c'est le même arbitrage, sur le même mot.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 11 h 45

### ✅ #573 — « DES FOIS ÇA ENREGISTRE, DES FOIS NON » A UNE CAUSE, ET ELLE EST FERMÉE

C'est le symptôme rapporté par Grégoire qui avait déclenché l'audit du 25 août. L'audit du 27 l'avait
désigné comme candidat, reproduit en harnais Node, et notait **« non vérifié en navigateur »**. Les
deux manques sont levés.

**La mécanique, en trois temps, tous silencieux :**

1. `sauvegarderCartouche` appelait `chargerCartouchesRetroaction()`, qui finit par
   `initialiserNouveauCartouche()` — `cartoucheActuel` devenait une cartouche **neuve jamais écrite**.
2. La ligne suivante lisait `cartoucheActuel.id` : l'id NEUF, absent des options. Le `<select>`
   retombait sur « -- Nouvelle cartouche -- ».
3. La cellule tapée ensuite passait par `persisterCartouchePartielle` (#517), qui cherche en base par
   cet id absent et rend `false`. **Les deux appelants ignoraient ce verdict.** La frappe était perdue.

⮕ **Correctifs** : `chargerCartouchesRetroaction(cartoucheIdAGarder)` rouvre la cartouche enregistrée
par le chemin d'ouverture déjà existant ; l'autosave **dit** quand elle n'écrit rien, une fois par
cartouche ; et le repli `niveauxDefaut` (les plages I/D/M/E de Grégoire, §3 n° 18) est supprimé.

⚠ **Après une SUPPRESSION, l'appel reste SANS argument** — la cartouche ouverte n'existe plus, en
rouvrir une neuve est le geste juste. Le défaut n'était pas d'initialiser, c'était de le faire aussi
quand l'objet venait d'être enregistré.

### ⚠⚠ CE QUE LE BREAK-TEST A TROUVÉ, ET QUE LA LECTURE N'AURAIT PAS VU

**Quatre choses, sur un lot qui passait déjà au vert :**

1. **Deux remises à zéro du drapeau d'avertissement étaient SANS EFFET.** Les neutraliser laissait la
   sentinelle verte : le drapeau mémorise un *id*, donc changer de cartouche le réarme déjà. Retirées —
   du code qui ne change rien finit par être lu comme s'il changeait quelque chose.
2. **Le second site de l'autosave n'était pas couvert.** Les cas ne testaient que
   `sauvegarderCommentaire` ; `sauvegarderContexteCartouche` pouvait redevenir muet sans rien rougir.
3. **Une mutation « équivalente » n'est pas une faille de la sentinelle.** Déplacer la lecture de l'id
   après l'appel restait vert parce que l'argument est évalué AVANT — mais l'analyse a montré que la
   ligne `selectCartouche.value = …` qui suivait était devenue **redondante**. Retirée.
4. **Dans la spec WebKit, une assertion ne prouvait rien** : elle lisait les colonnes d'une cartouche
   EXISTANTE alors que le repli ne joue qu'à la CRÉATION. Le scénario a été étendu.

⮕ **Et un piège de mesure, dans la spec** : `nomEnMemoire` était lu dans le `return`, donc APRÈS que le
scénario ait ouvert une autre cartouche — il décrivait le mauvais objet, avec aplomb. **Capturer la
mesure au moment où elle a un sens, pas à la fin.**

### 📌 #578 EST PRIS — le reste de #573

**Une cartouche neuve prend les colonnes de la PREMIÈRE échelle du trimestre**
(`find(e => !e.estDemo) || echelles[0]`), sans `echelleId`. La source non arbitraire existe : **une
grille porte un `echelleId`**. ⚠ **Préalable mesurable avant de coder** : compter les grilles réelles
de Grégoire avec et sans `echelleId`. Sans ce compte, passer par `obtenirEchelleResolue` pourrait le
laisser sans colonnes — une régression pire que le défaut.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 09 h 30

### ✅ B10 EST SCINDÉ, ET SA MOITIÉ « ORDRE » EST LIVRÉE

**#575 n'attend plus que la décision #555.** B10 était porté au backlog ET dans l'entrée
précédente de ce fichier comme « BUTE SUR #555 » — donc reporté EN ENTIER sur une décision
qui appartient à Grégoire. C'était vrai de la moitié seulement.

| | Ce qui était mêlé dans les mêmes lignes | Dépend de #555 ? |
|---|---|---|
| **L'ORDRE** | `ORDRE_NIV = { E:4, M:3, D:2, I:1, '0':0 }` | **Non** — se dérive des PLAGES de l'échelle |
| **LA MARQUE** | `=== 'I' \|\| === 'D'` / `=== 'M' \|\| === 'E'` | **Oui** — « faible » et « maîtrisé » ne se dérivent d'aucune échelle |

⮕ **LA RÈGLE À REPASSER SUR LES QUATRE AUTRES ITEMS QUI ATTENDENT #555** : avant de reporter
un item sur une décision, mesurer ce qui, DEDANS, n'en dépend pas. Ici un item entier était
bloqué par la moitié de son contenu.

### ⚠ POURQUOI CE DÉFAUT ÉTAIT SILENCIEUX — le patron à reconnaître ailleurs

`ORDRE_NIV[code] || 0` **ne levait pas.** Il rendait 0. Hors IDME, tous les niveaux recevaient
donc le MÊME rang, dans le bilan **remis à l'élève** (`synthese-retroaction-data.js` alimente
la page de synthèse du PDF) :

- les deux « priorités » affichées étaient les deux **premières du tableau**, pas les deux plus faibles ;
- « ta force » revenait au **premier critère saisi** ;
- la ligne « Progrès : X → Y » ne pouvait **jamais** s'afficher.

C'est le même défaut, dans le même document, que celui corrigé à 7 h dans `evaluation-retroaction.js`.
⮕ **Un repli `|| 0` sur une table de codes ne casse rien : il ment.**

### ✅ `echellesComparables` EST EXTRAIT — un seul endroit pour la garde « même barème »

La garde livrée à 7 h dans `evaluation-retroaction.js` après la porte terrain 2.7 était nécessaire
**mot pour mot** pour la ligne « Progrès » du PDF. Elle vit maintenant dans
`profil-etudiant-calculs.js` et les deux modules la consomment. La recopier, c'était fabriquer le
patron de replis divergents que **#555 constate ailleurs** (`|| 0.70` ici, `|| 0.75` là).

⚠ Son repli est passé de PERMISSIF à **RESTRICTIF** : sans le lecteur, on n'annonce pas un progrès
qu'on n'a pas mesuré. Un repli permissif aurait rendu la garde muette au premier changement d'ordre
de chargement — et un test l'aurait trouvée verte pour la mauvaise raison.

### ⚠⚠ TROIS ASSERTIONS NE PROUVAIENT RIEN, ET SEUL LE BREAK-TEST L'A DIT

Première passe : **16 cas verts, mais 3 mutations sur 12 restaient VERTES.** Les trois cas étaient
mal construits, pas le code. À lire avant d'écrire une sentinelle d'échelle :

1. **« un niveau illisible se range en dernier »** — mes deux critères étaient TOUS DEUX lisibles.
   Il faut une échelle qui connaisse « D » mais **pas** « I » : le seul montage où un code franchit
   la butée #555 (`I || D` = un défi) **sans avoir de rang à lire**.
2. **« aucun progrès sur un code étranger »** — testé sur l'évaluation COURANTE, où une autre garde
   sortait déjà. Le cas qui mord est le code étranger côté **ANTÉRIEUR** : sans garde, `rang > null`
   est vrai et **tout devient un progrès**.
3. **« la comparabilité ne porte pas sur les ids bruts »** — aucun cas n'avait deux ids DIFFÉRENTS
   résolvant vers la MÊME échelle. C'est pourtant l'état exact du trimestre de Grégoire après la
   réparation de #542 (`idOriginal`), et la cause de la porte 2.7.

⮕ **Verte n'est pas prouvée.** Final : **12 mutations, 12 rouges**, restauration vérifiée à chaque fois.

⮕ **Et la suite navigateur a été lancée AVANT d'annoncer la fin**, comme la leçon de la nuit l'impose :
**Playwright 193 passées** (3 réussies au second essai — `confirmations-conception-uniformes`,
`partage-import-rendu`, `sandbox-isolation`, aucune liée à ce lot). **Vitest 3796/3796, 356 fichiers**,
lue après le dernier changement.

⮕ **Et le montage compte** : une échelle W-X-Y-Z ne prouve RIEN sur l'ordre — hors IDME, l'ancienne
table rendait 0 partout, donc « pas de tri » : un **faux vert par égalité**. Les fixtures reprennent
les lettres I/D/M/E **dans un autre ordre** (« E » = Émergent, le plus faible), le seul montage où
table en dur et lecture d'échelle donnent des réponses OPPOSÉES.

### ⚠ UNE MESURE FAUSSE, CORRIGÉE AVANT DE S'INSTALLER

Le test qui CONSTATE les butées #555 restantes comptait par un motif en `===` seul : il annonçait 6.
Le vrai compte est **6 sites / 14 comparaisons** — `construireForce` filtre par `!== 'M' && !== 'E'`,
**un site entier qu'un motif en `===` rate**. Le chiffre a été REMESURÉ au grep, pas ajusté pour
faire passer le test. ⮕ Même piège partout où une sentinelle compte des comparaisons.

### ⏳ CE QUI RESTE — inchangé, sauf B10

- **B10b** : 6 sites / 14 comparaisons dans `synthese-retroaction-data.js`, plus les 8 lignes /
  18 comparaisons jumelles d'`evaluation-retroaction.js`. Les deux portent un test qui CONSTATE ces
  comptes et **rougira le jour de la décision #555** — c'est le signal voulu, pas une régression.
- **Porte terrain 2.7** (Grégoire) — la ligne « Progrès » chez un élève monté d'un niveau.
- **1er septembre** : #427 + #508. Il n'y a NI liste nominale, NI personne à inviter.
- ⚠ **`git config maintenance.auto` n'est TOUJOURS pas positionné.** Le relais le recommande depuis
  trois crashs en trois jours ; personne ne l'a fait. Ce n'est pas un oubli de plus, c'est un geste
  d'une ligne que chaque session repousse.
- ⚠ **Le bump est dû dès que la session `file://` de Grégoire sera fermée** : le code applicatif a
  maintenant **huit commits** d'avance sur le numéro annoncé (1.104.1 / `0827-1418`).

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 28 août 2026, 07 h 45

### ⚠⚠ LES CINQ PREMIÈRES MINUTES — dans cet ordre, avant toute promesse

1. **Déléguer le rituel de début** au subagent `audit-debut-session` (CLAUDE.md).
   Ne pas prendre la prémisse de relance pour argent comptant : **elle est fausse une
   fois sur deux en ce moment**, parce que deux sessions écrivent dans ce dépôt.
2. **`git log --oneline origin/main..HEAD`** — s'il reste des commits locaux, la garde
   `scripts/pousser.sh` n'a pas été passée. Ne rien construire dessus avant de savoir
   pourquoi.
3. **`find .git -name '*.lock'`** — `git maintenance` a crashé **trois fois en trois
   jours** (27 août 15 h 46, 28 août 04 h 53, plus juillet). Vérifier l'âge des verrous
   ET l'absence de git actif avant de retirer quoi que ce soit. C'est un défaut
   RÉCURRENT du dépôt : la vraie réponse est de trancher `git config maintenance.auto false`,
   pas de re-nettoyer.
4. **`git status`** — si des fichiers modifiés ne sont pas les tiens, **une autre session
   travaille**. Committer par chemins EXPLICITES, jamais `-A`. Pour un fichier PARTAGÉ
   comme `index.html` : reconstruire « HEAD + tes seules modifications » dans un fichier
   à part, `git hash-object -w`, `git update-index --cacheinfo`, puis **`git commit` SANS
   chemins**. ⚠ `git commit -- <chemins>` est en mode `--only` et recommite le contenu de
   l'**arbre** : il emporterait le travail de l'autre. Méthode éprouvée le 28 août.
5. **Lire `RELAIS.md` MAINTENANT, pas au début de la session.** Le 28 août, une session a
   recopié dans une porte terrain une ligne lue trois heures plus tôt ; entre-temps trois
   commits l'avaient corrigée. Grégoire a dû relever l'erreur lui-même.

### ⚠⚠ CE QUI A CHANGÉ DANS LA FAÇON DE VÉRIFIER — le point le plus important

**Vitest ne voit pas les régressions d'affichage.** Les deux régressions de la nuit du
27-28 août sont passées sous 3767/3767 puis 3780/3780 de Vitest, et n'ont été vues que par
Playwright, au moment du push. Vitest tourne dans `node`, sans navigateur ; **Playwright
tourne dans WebKit — le moteur de Safari — contre le vrai `index.html`**.

⮕ **Sur tout chantier qui touche du rendu : lancer la suite navigateur AVANT d'annoncer
que c'est fini.** Conditions : GitHub Desktop fermé, aucune autre session écrivant dans
l'arbre. Une seule spec se lance vite :
`cd tests && npx playwright test integration/<fichier>.spec.js --reporter=list`

⮕ **Et le corollaire, découvert le 28 août** : une vérification qu'on croyait réservée à
Grégoire est souvent automatisable en spec WebKit. La porte terrain 2.6 a été convertie en
`#576 · le bilan nomme les critères quand la grille d'origine a disparu` — elle rejoue son
cas réel contre le vrai `index.html`. C'est la règle 1 du skill `portes-terrain` : **une
porte n'existe que si aucune machine ne peut répondre.** Avant d'écrire une porte, demander
si une spec peut la remplacer.

---

### ✅ #575 — LOT 4 DU PLAN SOLO : FINI, SAUF B10

**L'ORDRE DES NIVEAUX SE DÉRIVE MAINTENANT DE L'ÉCHELLE.** Deux tables IDME écrites en dur
vivaient dans deux modules, en ordres opposés, toutes deux RENDUES à l'écran. Elles sont
remplacées par un lecteur unique — `niveauxOrdonnesDeLEchelle` / `niveauDuCodeDansEchelle`
(`profil-etudiant-calculs.js`) — qui résout par le chemin de #542 lot 3 et classe par la
**borne inférieure** des plages, puis par la borne supérieure à égalité (le cas des échelles
« IDME et niv 0 »). Pas de repli sur `valeurCalcul` : plage et valeur ponctuelle sont deux
conversions inverses.

| Pas | Geste | Sentinelle |
|---|---|---|
| **B7** (filtre `['I','D','M','E']`) | **SUPPRIMÉ** — le `<select id="filtre-note-eval">` qu'il peuplait **n'a jamais existé** dans `index.html`, `git log -S` ne trouve rien depuis le premier commit | `sentinelle-575-ordre-niveaux-derive-echelle` |
| **Tri de la colonne « Niveau »** (trouvé en chemin, VIVANT) | Le rang se lit dans l'échelle de chaque évaluation ; une ligne sans niveau reste en fin **dans les deux sens** | idem — 26 cas, **18 mutations, 18 rouges** |
| **n° 10** (bilan de rétroaction) | Les deux tables retirées ; nom et rang viennent de l'échelle | idem |
| **n° 11** (`convertirNoteEnValeur`, `I = 3`) | **SUPPRIMÉ avec toute la vue « accordéon »** — 12 fonctions, 584 lignes, `evaluation.js` de 3894 à 3295 | — |

⮕ **DEUX DOUBLONS `window` SONT PARTIS AVEC L'ACCORDÉON**, et c'est le patron
`feedback-double-definition-window-derniere-gagne` : `trierListeEvaluations` et
`rechargerFiltreProduction` étaient définis dans **les deux** modules et, `evaluation.js`
étant chargé APRÈS `liste-evaluations.js`, **c'était la version morte qui gagnait**.
`window.rechargerFiltreProduction` résout désormais vers celle qui exclut le portfolio.

### ⚠ CE QUI RESTE DE #575 : **B10 SEUL, ET IL BUTE SUR #555**

`synthese-retroaction-data.js` teste les codes EN TOUTES LETTRES à six endroits. Et le même
patron subsiste dans `evaluation-retroaction.js` : **8 lignes / 18 comparaisons**
(`=== 'I' || === 'D'` pour les défis, `=== 'M' || === 'E'` pour « tous maîtrisés »).
L'ORDRE se dérive d'une échelle ; **« faible » et « maîtrisé », non** — c'est la marque de
maîtrise de **#555**. Le faire sans elle remplacerait un arbitrage codé en dur par un autre.
⮕ **Un test CONSTATE le compte de 18** : il rougira le jour où #555 les retirera, et c'est
le signal voulu. Ne pas le « réparer » en changeant le chiffre.

### ✅ #576 — LE BILAN SURVIT À LA DISPARITION DE LA GRILLE (livré le 28 août)

Trouvé par la porte terrain 2.6 sur les données réelles d'H2026, captures à l'appui. Le
bilan affichait « Présentement, il faut se concentrer sur : » puis **RIEN**. Cause :
`_collecterCriteresBilan` exigeait la grille template et rendait `[]` quand elle avait
disparu. La donnée était pourtant là — l'évaluation enregistrée porte ses critères AVEC leur
nom, et le panneau voisin les lisait déjà.

⚠⚠ **UNE CONTRAINTE À NE PAS OUBLIER EN TOUCHANT À CE BLOC** : `copierToutRetroaction` copie
le `textContent` du bilan sous « === BILAN === » **dans ce qui est remis à l'élève**. Aucune
note technique ne doit y figurer. Deux sentinelles le verrouillent.

### ⚠ TROIS DÉFAUTS QUE LES TESTS N'ONT PAS VUS, ET COMMENT ILS SONT SORTIS

1. **Une faille d'injection ouverte par le correctif lui-même.** Remplacer des libellés
   écrits en dur par le nom SAISI par l'utilisateur fait passer du texte utilisateur dans un
   `innerHTML`. Trois échappements posés, puis un quatrième — le repli #576 ne fournit aucune
   description, donc la ligne d'un défi retombait sur le nom, par une branche restée non
   échappée. **Trouvé par la sentinelle, pas par relecture.**
2. **Le nom d'un critère écrit deux fois** — « Plausibilité (Plausibilité En développement) ».
   Les assertions cherchaient la présence des mots, **pas leur nombre**. Sorti en RENDANT le
   bilan, pas en le testant.
3. **Une spec verte pour la mauvaise raison.** `evaluation-rendu.spec.js` ne seedait aucune
   échelle et passait quand même, parce que la table IDME en dur en fournissait une à tout le
   monde. Corrigé — et deux assertions ajoutées : le niveau porte le nom de l'échelle, et
   aucun libellé IDME n'est connu d'avance.

⮕ **La leçon commune** : une assertion de PRÉSENCE ne dit rien de la FORME. Sur un texte
lu par un humain, rendre et lire.

### ⏳ CE QUI RESTE DÛ À GRÉGOIRE

- **Porte terrain 2.7** — la ligne « Progrès : X → Y » chez un élève qui est monté d'un
  niveau. Elle dépend de ses données ; aucune machine ne peut dire si le cas existe chez lui.
- **Décision #555** (la marque de maîtrise) — elle débloque B10 et les 18 comparaisons.
- **1er septembre** : #427 + #508. ⚠ **Il n'y a NI liste nominale, NI personne à inviter** —
  la policy est ouverte. Ce qui reste : insérer le paragraphe d'annonce dans le message de
  rentrée à la CoP (rédigé, non envoyé), et relever dans la console les trois noms
  Cloudflare, la durée de session et la règle `Include`.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 27 août 2026, 22 h 40 (entrée précédente)

### ✅ LOT 4 DU PLAN SOLO — OUVERT SOUS #575, QUATRE PAS LIVRÉS (`c85ec85b`)

Le lot 4 n'avait **jamais eu d'item** ; c'est le §9 n° 1 de l'audit Fable 5. Il est ouvert
sous **#575**, avec sa liste, et quatre pas sont livrés :

| Pas | Ce qui est parti | Sentinelle |
|---|---|---|
| **B1+B2+B3+B4** | 4ᵉ repli IDME (`32/69,5/79,5/92,5`), sa clé morte `echellesPerformance`, les cinq noms de critères de Grégoire | `sentinelle-575-lot4-b1b2-b3b4` (8 cas, 8 mutations rouges) |
| **`SCALE_FALLBACK`** | l'échelle de Grégoire dans le **PDF remis à l'élève** | `…-synthese-pdf-sans-echelle-imposee` (7 cas, 6 rouges) |
| **`determinerLettreIDME`** | la lettre IDME **rendue à l'écran** (« E 87 % ») | `…-niveau-note-globale-une-seule-regle` (8 cas, 7 rouges) |
| **Badges + barres** | 5ᵉ **et 6ᵉ** tables IDME, échelles devinées, couleur non filtrée | `…-couleurs-badges-barres` (13 cas, 11 rouges) |

**Le geste central : SUPPRIMER plutôt que RÉPARER.** `intervention.analyse.defisCommuns`
était écrit en base et **lu par aucun écran depuis la Beta 0.85** (grep sur tout le dépôt).
Le besoin est déjà servi, et correctement, par `mettreAJourCriteresCibles`. Réparer le
doublon aurait été un correctif sans effet. Diff du lot : **+502 / −556**.

**Trois choses que l'audit n'avait pas vues**, trouvées en corrigeant :
1. Une **SIXIÈME table IDME** (`_obtenirNiveauxEtGradientSRPNF`), jumelle de la cinquième,
   qui peignait le dégradé du bloc « Forces et défis » — que l'audit cite pourtant en
   exemple de code proprement configurable. Les deux copies sont remplacées par
   `niveauxEtGradientDesEvaluations`.
2. Un **SEPTIÈME site** qui devine l'échelle : le graphique de progression
   (`sections-affichage.js:3400`), avec son texte « Zones colorées basées sur l'échelle
   IDME par défaut ». **Non corrigé**, mais l'état connu est verrouillé par un test
   « exactement UNE occurrence restante » — il rougira quand on y touchera, c'est voulu.
3. La moitié du **constat §5.5** : `couleurSure` était juste mais **enfermée dans une
   fermeture locale** ; badges et barres posaient la couleur utilisateur BRUTE dans un
   `style`. Extraite en `couleurCssSure`, partagée, testée (elle n'avait aucun test).

### 🔴 #508 — LE BANDEAU D'AVIS BLOQUE LES CLICS SOUS LUI. CORRECTIF PRÊT, **NON COMMITÉ**

**Trouvé le 28 août au petit matin, en tentant de pousser** : `scripts/pousser.sh` a refusé
avant d'ouvrir la connexion — 1 spec nouvellement rouge,
`planif-alignement › un bloc glissé près d'un autre COLLE`.

**Ce n'est PAS un artefact de test, et ce n'est pas le lot #575.** Prouvé par trois mesures
en worktrees jetables :

| Base | Spec |
|---|---|
| `fbeffdad` (dernier verdict vert) | ✅ verte |
| `f41c6118` (**#508**, bandeau d'avis) | ❌ rouge |
| `f41c6118` + condition de date forcée à `false` | ✅ verte |

⮕ Le bandeau est `position: fixed`, ancré **en bas, centré, 600 px, `z-index: 950`**. Il
**recouvre la zone de travail** : le `mouse.down()` du glisser atterrit sur lui, jamais sur le
bloc, qui ne bouge pas d'un pixel (reçu 400 = sa position de départ). ⮕ **Conséquence réelle
pour l'utilisateur** : tout ce qui se trouve sous le bandeau — un nœud de carte mentale, un
bouton — est inatteignable au clic **tant que l'avis n'est pas fermé**. Portée limitée (il se
ferme d'un clic et ne revient plus, et la condition `new Date() < 1er septembre 2026` l'éteint
d'elle-même dans trois jours), mais réelle d'ici là.

**LE CORRECTIF EST ÉCRIT ET VÉRIFIÉ, IL VIT DANS L'ARBRE, NON COMMITÉ** (`styles.css`) :
`pointer-events: none` sur `.transition-bandeau`, `auto` sur `.transition-bandeau-fermer` — le
patron des bandeaux NON MODAUX. **Aucun changement d'apparence.** Les 4 specs concernées
passent, dont `avis-identification-bandeau-508` (visibilité + fermeture). Contrepartie assumée
et documentée dans le CSS : le texte de l'avis n'est plus sélectionnable.

✅ **COMMITÉ le 28 août à 07 h 15 (`84661fc8`), APRÈS COORDINATION DIRECTE ENTRE LES DEUX
SESSIONS** — Grégoire ayant dit « tu peux communiquer avec l'autre session ».

Le blocage : le hook anti-cache exigeait de stager `index.html`, que la session parallèle
tenait avec ses propres modifications. Stager le fichier entier aurait emporté son travail —
l'incident que ce fichier documente trois fois. Elle a commité (`e2819cea`) **ses seuls
hunks**, méthode qu'elle a transmise et qui mérite d'être retenue : reconstruire « HEAD + ses
changements » dans un fichier à part, `git hash-object -w`, `git update-index --cacheinfo`,
puis `git commit` **sans chemins** — surtout pas `git commit -- <paths>`, qui repasse en mode
`--only` et recommite le contenu de l'ARBRE.

⚠ **UNE DE MES PRÉMISSES ÉTAIT FAUSSE, elle l'a corrigée** : le bump `styles.css` `c` → `d`
n'était pas d'elle. Les quatre jetons orphelins (`styles.css`, `preferences.js`, `accueil.js`,
`transitions.js`) étaient déjà dans l'arbre, non commités, posés par la session **#508**
elle-même. Ils sont partis avec `84661fc8` et **referment le rouge `sentinelle-anticache`**
qui traînait depuis la veille. ⮕ Vitest est repassé à **3767/3767, 354 fichiers, ZÉRO rouge**.

#### Le correctif, en clair — pour qu'il soit reconstructible si l'arbre le perd

Deux déclarations dans `styles.css`, rien d'autre. Elles vivent dans l'arbre non commité ;
un `git add -A` d'une autre session pourrait les emporter, et le scratchpad qui en garde une
copie est éphémère.

```css
/* dans .transition-bandeau, à côté de `z-index: 950` */
pointer-events: none;

/* dans .transition-bandeau-fermer, en première déclaration */
pointer-events: auto;
```

**Sa sentinelle** : `tests/integration/bandeau-non-modal-508.spec.js` (non commitée elle aussi).
Elle ne lit pas le CSS — elle pose un TÉMOIN sous le bandeau et vérifie qu'un **vrai clic** le
traverse, que le bouton de fermeture reste atteignable, et qu'il ferme encore l'avis.
**2 mutations, 2 rouges** (retirer l'un ou l'autre `pointer-events`). ⚠ Le correctif et sa
sentinelle doivent partir **dans le même commit** : commiter la spec seule la rendrait rouge
sur `HEAD` pour quiconque récupère le dépôt.

### 🔴 LE PUSH RESTE BLOQUÉ — UNE SECONDE RÉGRESSION, DANS `e2819cea`

Après le correctif #508, `scripts/pousser.sh` a refusé une deuxième fois, sur une AUTRE spec :
`evaluation-rendu.spec.js › Chantier I · evaluation rend la rétroaction Bilan`, ligne 197 —
`expect(resultat.aMentionForce).toBe(true)` reçoit `false`. Les deux assertions voisines
(`aTitrePresentement`, `aDefi`) passent : **c'est la mention de force, elle seule, qui a
disparu.**

Mesuré en worktrees, comme pour #508 : ✅ verte à `299afb32`, ❌ rouge à `e2819cea`, rouge
ensuite par héritage. ⮕ **Elle appartient au chantier n° 10 de la session parallèle**, qui a
remplacé `_NOMS_NIV_BILAN` / `_ORDRE_NIV_BILAN` par une dérivation depuis l'échelle et ajouté
un paramètre `niveauDe` à `_rendreForceBilan`. Hypothèse transmise : le montage de la spec ne
fournit pas d'échelle résolvable, donc plus d'ordre, donc aucun « meilleur » critère — l'ancienne
table en dur en fournissait un à tout le monde. **Diagnostic envoyé à la session parallèle ;
correction non engagée de ce côté-ci — c'est son fichier.** ⚠ `86475adf` (#576) ne l'a pas
réglée : vérifié après coup, la spec est toujours rouge.

⚠ **CE QUE CES DEUX RÉGRESSIONS DISENT, ET QUI VAUT POUR LES DEUX SESSIONS.** Les deux — le
bandeau #508 et celle-ci — sont passées sous un **Vitest vert** (3767/3767 des deux côtés) et
n'ont été vues **que par Playwright, au moment du push**. Sur un lot qui touche du RENDU, la
suite navigateur n'est pas une formalité de fin de course : c'est la seule qui regarde.

### ✅ LES DEUX LECTURES DE B10 SONT COMPATIBLES — VÉRIFIÉ AVEC L'AUTRE SESSION

Point de conception levé par échange direct, le 28 août. **Elle n'a PAS touché B10** :
`synthese-retroaction-data.js` est intact, toujours bloqué par #555, exactement comme inscrit
plus haut. Son chantier était le **n° 10** — `evaluation-retroaction.js`, un fichier DIFFÉRENT
de forme identique : 8 lignes, 18 comparaisons littérales, qu'elle a **toutes laissées**, pour
la même raison que moi. Ce qu'elle a dérivé de l'échelle : le **rang** (par `min`, puis `max` à
égalité — le cas des échelles « IDME et niv 0 ») et le **nom** du niveau, qui se lisent sans
arbitrage. Un test constate le compte de 18 et rougira quand #555 les retirera.
⮕ **La réserve « B10 bute sur #555 » tient, pour les deux fichiers.**

### ⚠ SON AVERTISSEMENT TERRAIN — VÉRIFIÉ SUR MES QUATRE PAS, SANS EFFET SUR EUX

Elle a créé puis corrigé une garde qui comparait les `echelleId` **BRUTS**. Chez Grégoire,
l'échelle courante (« IDME et niv 0 (RESTAURÉE) », recréée par la réparation #542) et les
`echelleId` que portent ses évaluations d'H2026 ne coïncident pas : la ligne « Progrès » ne
pouvait plus jamais s'afficher. Trouvé par la porte terrain 2.7, sur ses données réelles.
⮕ **Mes quatre pas ne comparent aucun id brut** (vérifié au grep sur `c85ec85b`) : ils passent
tous par `obtenirEchelleResolue` (5 appels) et `obtenirEchelleCommuneDesEvaluations` (3), qui
comparent les échelles **résolues** et traitent une échelle introuvable comme une ABSENCE, pas
comme un barème concurrent. C'est la règle qu'elle recommande.

### 📌 ~~#576 EST PRIS — prochain ID libre : #577~~ — **PÉRIMÉ, #577 a été pris le 28 août. Voir l'entrée du 28 août en tête de ce fichier.**

Par elle, le 28 août : « le bilan de rétroaction est VIDE quand la grille d'origine est
introuvable » (`_chargerGrilleDefBilan` → null, `_collecterCriteresBilan` → [], tout le bilan
personnalisé disparaît, alors que le panneau Évaluation voisin a un repli explicite).
Antérieur à nos deux lots, trouvé par la porte 2.6 avec captures.

### ⚠ DEUX SESSIONS SUR LE MÊME ITEM #575, LE 28 AOÛT AU PETIT MATIN

La session parallèle travaille **sur le lot 4 lui-même** : `evaluation-retroaction.js` (n° 10),
`liste-evaluations.js` (B7), `profil-etudiant-calculs.js`, et une sentinelle neuve
`sentinelle-575-ordre-niveaux-derive-echelle` — soit **B10**, que le bloc ci-dessus déclare
bloqué par #555. ⮕ **À vérifier au moment de la reprise** : ce que cette session a tranché
pour « quel niveau est faible / maîtrisé » sans #555, et si les deux lectures se contredisent.

### ⚠ `git maintenance` A RE-CRASHÉ — DEUXIÈME FOIS EN DOUZE HEURES

Trois nouveaux verrous à **04:53** (`index.lock`, `next-index-11.lock`,
`objects/maintenance.lock`), après ceux de 15:46 la veille. Retirés après la même vérification
(aucun git réel, aucune opération en cours). Ils bloquaient vraisemblablement AUSSI la session
parallèle, dont la dernière écriture date de 04:50.

⮕ **PISTE SUR LA CAUSE, mesurée deux fois** : `lsof` montre le même processus tenant les
fichiers `.lock` — **PID 47120,
`/System/Library/Frameworks/Virtualization.framework/…/XPCServices/com.apple…`**. Un service de
virtualisation qui garde des descripteurs ouverts sur `.git` expliquerait qu'une tâche de
maintenance meure en cours d'écriture. À instruire avant de re-nettoyer une troisième fois.

---

### ⚠ ERRATUM SUR LE MESSAGE DE `c85ec85b` — 35 → **32 mutations**

Le message du commit annonce « 36 cas, **35** mutations toutes rouges ». Le compte
re-dérivé au rituel de fin est **32** (8 + 6 + 7 + 11, un script de break-test par
sentinelle). Les 36 cas sont justes, « toutes rouges » est juste, et **les quatre comptes
par sentinelle inscrits au BACKLOG sont justes** (8/8, 6/6, 7/7, 11/11) : c'est le total
agrégé, et lui seul, qui était faux — recopié sans être re-dérivé.

⮕ Trouvé par le §4.2 du rituel (« confrontation des affirmations au diff »), pas par
relecture. C'est exactement le motif de `feedback-total-tests-lu-apres-dernier-changement` :
un chiffre plausible, jamais recompté. **L'historique n'a pas été réécrit** — le commit
n'est pas poussé, la réécriture reste possible et c'est la décision de Grégoire.

---

### ⚠ CE QUI RESTE DE #575, ET CE QUI BLOQUE

- **B7** (filtre `['I','D','M','E']`, `liste-evaluations.js:368`), **n° 10** (bilan de
  rétroaction, `evaluation-retroaction.js:488`), **n° 11** (`convertirNoteEnValeur`,
  `evaluation.js:284` — une **échelle ancienne où `I = 3`**, qui contredit IDME). Aucun ne
  dépend d'un arbitrage : ils sont faisables tels quels.
- **B10 — BUTE SUR #555.** `synthese-retroaction-data.js` ne compare pas seulement par
  `ORDRE_NIV` : il teste les codes **en toutes lettres à six endroits** (`=== 'I' || === 'D'`
  pour les défis, `=== 'M' || === 'E'` pour « tous maîtrisés »). L'ordre se dérive d'une
  échelle ; « faible » et « maîtrisé », non — c'est exactement la marque de maîtrise de
  **#555**. Le faire sans elle remplacerait un arbitrage en dur par un autre.

### ⚠ CE QUI DEMANDE LES YEUX DE GRÉGOIRE

Trois rendus modifiés, **non vérifiés** (l'environnement de test est `node`, sans navigateur) :
la **lettre du niveau** dans « Développement des habiletés », les **badges d'artefacts**
(couleur), les **barres de critères** des deux blocs (dégradé + légende). Sans échelle
résolue, le comportement voulu est : **pas de lettre, badge neutre, fond de barre neutre,
cause au survol** — jamais un repère inventé.

### ⚠ TROIS VERROUS GIT ORPHELINS — ET C'EST RÉCURRENT, PAS UN ACCIDENT

`git maintenance` a crashé et laissé `.git/index.lock`, `.git/HEAD.lock` et
`.git/objects/maintenance.lock` — **tout commit était impossible** jusqu'à leur retrait
(vérifié d'abord : zéro processus git actif, aucune opération en cours, locks vides et
vieux de sept heures). Si une session retrouve « Unable to create '.git/index.lock' », le
diagnostic est là : `find .git -name '*.lock'`, vérifier l'âge et l'absence de git actif
**avant** de retirer quoi que ce soit.

⮕ **CE N'EST PAS LA PREMIÈRE FOIS.** Le signet en tête de `SESSION.md` demandait **exactement
le même `rm` depuis JUILLET**, et le 28 juin en portait déjà un (« crash git du 28 juin 21:17 »).
Trois occurrences sur trois mois : le geste de nettoyage est connu, c'est la CAUSE qui ne l'est
pas. ⮕ **À trancher par Grégoire** : désactiver la maintenance automatique
(`git config maintenance.auto false`), ou inscrire le contrôle des locks au rituel de DÉBUT de
session. Re-nettoyer à chaque fois n'est pas une réponse.

---

## ▶ POUR LA SESSION QUI PREND LE RELAIS — 27 août 2026, fin de journée (entrée précédente)

### ✅ L'AUDIT FABLE 5 EST RENDU — 27 août 2026, 15 h 45

`Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`. Périmètre élargi par Grégoire au 27 août et à
l'onglet Conception. **Verdict en une ligne** : les correctifs des 26-27 août font ce qu'ils annoncent
et mordent (25/31 sentinelles sur chacune de leurs assertions) ; la réparation de l'échelle orpheline n'a touché
aucune note ; **mais le lot 4 du plan SOLO n'a jamais été livré**, et il produit des chiffres faux chez
Grégoire aujourd'hui (`analyserSousGroupe` → repli IDME de `portfolio.js` derrière une clé jamais écrite).

⮕ **Ce qui attend Grégoire** (rapport §9, une décision) : par quoi ouvrir — **A** lot 4 du plan SOLO en
item propre (recommandé) · **B** Conception, #573 + #574 · **C** volet données (commande de vérification
du §6, un Codex enregistré, garde référentielle à la suppression d'échelle, #545).

⚠ **Trois affirmations du 27 août sont fausses, ne pas les recopier** : « plus aucun ternaire `>= 85` »
(`determinerLettreIDME` est rendu à l'écran) ; « `_identifierPatternActuel` vivant » (mort) ; « 3695/3695
lu à l'écran » (3678 au SHA — l'écran montrait l'arbre d'une autre session). Et **`_genererBarresSRPNF`
est VIVANT**, pas « probablement mort ». Détail §2.2 du rapport.

⚠ **Le hook lot C verrouille le `|| 2`** de durée d'intervention qu'il croit retiré
(`interventions.js:1345` l'écrit en base). Sentinelles à renforcer : rapport §4.


### ⚠⚠ LA RÈGLE QUI COMMANDE LE PROCHAIN CHANTIER

> **Grégoire, 27 août 2026** : « Ce qui est important, ici, c'est surtout de ne rien coder
> en dur. Les utilisateurs auront tous des besoins et des conditions différentes et je ne
> veux pas imposer mon contexte. »

Ce n'est pas une préférence de style : c'est le **critère qui tranche** chaque question
ouverte du chantier, et il élimine des options avant qu'on en discute. ⮕ **Distinguer
conséquence logique et valeur arbitraire** : dériver un libellé d'une donnée que
l'utilisateur a saisie est une conséquence ; écrire « au-dessus de 75 %, c'est la maîtrise »
est un arbitraire, **même configurable**. La règle vise le second.

### ✅ LE CHANTIER #552 · #537 · #535 EST LIVRÉ — 1.104.1, 27 août 2026

**Décision de Grégoire** : rebrancher sur le **niveau SOLO configuré** du critère et sur
l'**IPB × direction**. Consigne complète, avec son §10 « ce que le chantier a donné » :
`plans de travail/CONSIGNE-552-537-535-cibles-intervention-sans-contexte-impose.md`.

⚠⚠ **DEUX MESURES ONT DÉPLACÉ LE SUJET, et la consigne elle-même se trompait dessus.**

1. **`determinerCibleIntervention` n'alimentait PAS l'écran d'accompagnement.** L'appel existait
   bien, mais son résultat n'y remplissait que `badgeClasse` et `badgeLabel` — **assignés quatre
   fois, jamais lus**. Le badge RàI rendu vient de `niveauRai`, donc de
   `determinerNiveauRaiPedagogique`. L'appel mort est retiré ; la sentinelle #551 (test 3), qui
   verrouillait sa présence, est corrigée.
2. **Son seul appelant vivant, `tableau-bord-apercu.js`, n'en lit que `.pattern`** — et tous les
   chemins de retour rendaient `pattern: M`, calculé AVANT les résolveurs. ⮕ **Aucun libellé de
   cible n'atteignait un écran.** Les trois options A/B/C du §8 portaient donc sur une chaîne que
   personne n'affichait ; ce qu'il fallait refonder, c'était le CALCUL DE L'INTENSITÉ.

⮕ **Et sa source non arbitraire existait déjà, à côté, vivante** : `diagnostiquerSuiviApprentissage`
(IPB × direction — la table du modèle RàI documentée dans le skill `depistage-rai`), consommée par
le tableau de bord. Les résolveurs en produisaient une seconde, concurrente, sur des notes sur 30
comparées à des pourcentages.

**Ce qui est en place**

| | |
|---|---|
| **L'intensité** | `diagnostiquerSuiviApprentissage` — artefacts consécutifs sous le seuil de défi CONFIGURÉ, croisés avec la direction. Aucun seuil écrit dans la cible |
| **La cause** | **NOMMÉE, pas prescrite** : « Difficulté persistante — Structure (multistructurel) ». Le nom vient de la grille de l'utilisateur, le niveau SOLO du champ qu'il a configuré |
| **Retirés** | Les 4 résolveurs · `I` · les seuils `17/18/20/21/25/27` · « CAF », « Dépistage SA », « Remédiation en X », « Pratique guidée en X » · `francaisMoyen` et `NOM_CRITERE_LANGUE` dans `profil-etudiant-calculs.js` · **l'exclusion `c.nom !== 'Français'`** de la carte « Observation de la structure » |
| ⮕ **CE QUI CHANGE À L'ÉCRAN, et c'est le SEUL changement visible du chantier** | **Son critère Français apparaît maintenant dans la carte « Observation de la structure »**, dont il était exclu. Conséquence qu'il a assumée et confirmée explicitement le 27 août — mais elle se verra dès le rechargement |
| **Ajoutés** | `niveauSOLO` remonté par `diagnostiquerForcesChallenges` (il était jeté) · `libelleNiveauSOLO` exportée, qui déduplique la table SOLO écrite aussi dans `interventions.js` |
| **La preuve** | `tests/unit/sentinelle-552-cible-independante-du-critere-de-langue.test.js` — 5 tests. Le CONSTAT **réécrit et renommé**, pas supprimé. Trois élèves identiques sauf leur langue (15/60/90 %) : **même intensité**, difficulté nommée dans les trois cas. Une grille « Méthode / Résultats / Discussion » produit une cible complète. **2 break-tests rouges**, restauration vérifiée par `diff -q` |

**Ce qui en sort — inscrit, pas oublié**

- **#553** — le **rabotage de clé** `startsWith('francais')`, 8 sites. Pas de la didactique : un
  pansement sur un appariement qui échoue. **Tout critère dont le nom varie entre deux écritures a
  le même bug, en silence, avec des 0 %.**
- **#554** — la branche « Décrochage » de la cible **n'est jamais atteinte** :
  `interpreterMobilisation(A, C, statutDecrochage)` n'est appelée qu'avec deux arguments, alors que
  le statut existe dans le modèle. Constaté et **volontairement non corrigé** : brancher un site
  mort est un geste distinct.
- **#555** — le **seuil de défi** : défaut à 0,70, et des replis en dur qui **divergent selon les
  fichiers** (0,70 dans `calculs.js` et `interventions.js`, 0,75 dans `sections-affichage.js` et
  `pratique-pan-standards.js`). ⮕ **Le §6 se resserre** : il ne manque pas une marque de maîtrise
  pour PRODUIRE une intensité — l'IPB × direction en produit une — il en manque une pour FONDER ce
  seuil. Premier pas possible sans décision : unifier les quatre replis.

### ✅ L'AUDIT DE L'ONGLET ÉVALUATIONS EST RETROUVÉ ET VERSÉ — 27 août 2026

Il avait été demandé à **Fable 5** (session cloud « Audit onglet Évaluation ») et **il était resté
sur sa branche**, `claude/audit-evaluation-tab-txocw7`, jamais fusionnée — pendant que son **rapport
jumeau**, l'audit Conception du même jour, l'avait été. Personne ne l'avait vu depuis le 25 août.

- **Rapport fusionné sur `main`** : `Rapports/AUDIT-evaluation-onglet-2026-08-25.md` (commit
  `b7f46938`, cherry-pick, auteur d'origine conservé).
- **17 items versés au backlog : #556 à #572.** ⮕ **Dernier ID pris : #572.**
- **Deux critiques, revérifiés sur 1.104.1 le 27 août — ils tiennent encore** :
  **#556** « Vider la corbeille » détruit les fichiers de TOUS les groupes-cours alors que la modale
  n'a compté que le groupe actif (perte de données) · **#557** `supprimerEvaluation` existe en
  double et c'est la version SANS restauration de l'originale qui gagne l'export `window`
  (`liste-evaluations.js` ligne 14580 contre `evaluation.js` ligne 14595 dans `index.html`).

⚠ **CE QUE CET AUDIT N'EST PAS.** Il se déclare **lecture seule** : tous ses verdicts sont
`[lecture]`, aucun Chromium n'a été lancé, les deux critiques ont été contre-vérifiés par une
seconde lecture et non par un essai. Sa base est **1.99.0**, cinq versions en arrière : **ses
numéros de ligne sont périmés** et seuls A1/A2 ont été revérifiés. ⮕ **Reproduire avant de
corriger**, et regreper avant de suivre une ligne.

⮕ **Leçon de méthode** : un audit commandé à une session cloud ne revient pas tout seul. Vérifier
la branche `claude/*` correspondante à la fin du travail, sinon le livrable existe sans que
personne ne le sache.

### Ce qui attend encore un verdict de Grégoire

- **Étiqueter son échelle en SOLO** — il a répondu « oui, maintenant » (D3), le geste est à
  lui. ⮕ **Ce n'est plus un confort** : les consignes du modèle de cartouche (#549) font
  dépendre toute leur rédaction du « seuil de maîtrise », et l'étiquette SOLO est aujourd'hui
  la seule donnée du dépôt qui puisse en approcher.
- **Le niveau « 0 » dans le modèle de cartouche** — la matrice génère une ligne par niveau, et
  la consigne demande de décrire « ce qu'un travail de ce niveau présente ». Un jugement
  suspendu ne présente rien.
- **Deux points de vocabulaire** — « préstructurel » garde une formulation courte parmi
  quatre longues ; les quatre longues emploient « il/elle », un accord lourd que sa convention
  demande de reformuler.
- ⏳ **ÉCHÉANCE DATÉE, DANS 5 JOURS — le 1er septembre** : #427 et #508. ⚠ **Les décisions du
  26 août ont été renversées le 27** : policy **ouverte** (`Everyone`) + OTP, session d'un mois,
  **aucune liste blanche** — le motif est d'identifier les utilisateurs, pas de filtrer l'entrée.
  Trois faits erronés corrigés au passage (quota jamais saturé, mesure d'usage possible via
  `My Team → Users`, 15 connexions postérieures à fin février). ADR-008, `DEPLOY.md` v1.6,
  `PRIVACY.md` v1.2, `SECURITY.md` et la fiche opératoire sont alignés. **Dû par lui, et personne
  ne peut le préparer à sa place** : les trois noms Cloudflare pour les `[À COMPLÉTER]` de
  `DEPLOY.md` §3.1-§3.3, la durée de session et la règle `Include` réellement en place, et
  l'arbitrage sur l'URL Netlify directe (elle contourne peut-être Access — non testé).

### Trois pièges qui coûteront à qui les ignore

1. ⚠⚠ **NE JAMAIS ÉCRIRE « fais un `git pull` » DANS UNE PORTE TERRAIN.** Le clone
   `~/Documents/GitHub/Monitorage_v6` est **à la fois** l'arbre de travail des sessions et la
   source `file://` de son application. Quand la session commite là — le cas courant — ses
   commits sont **déjà chez lui**. GitHub Desktop affiche « No local changes » et ne propose
   aucun pull. **Il s'est bloqué là-dessus le 27 août**, et le gabarit portait la consigne
   fautive : corrigé dans `.claude/skills/portes-terrain`. La rangée juste est « recharge
   l'application, et lis le numéro en bas de page ».
2. ⚠ **L'anti-cache ne se vérifie qu'UNE FOIS PAR CYCLE DE RELEASE.** La sentinelle contrôle
   que le `?v=` a changé depuis la release précédente ; une fois qu'il a changé, elle reste
   verte quel que soit le nombre de modifications suivantes du même fichier. Un correctif est
   parti sous un `?v=` déjà servi le 27 — le navigateur de Grégoire aurait rendu l'ancien
   fichier. **Bumper le `?v=` à chaque commit qui touche le fichier**, pas une fois par cycle.
   Versé à **#547**.
3. ⚠ **Un script de garde qui échoue sans bloquer la suite ne garde rien.** Le même jour, un
   script de bump a levé une exception, la commande suivante s'est exécutée quand même, et le
   commit est parti en croyant l'anti-cache posé. **Chaîner avec `&&`**, et faire sortir le
   script en erreur explicite.

---

## ✅ PORTE TERRAIN DU 27 AOÛT — RELEVÉE, LES QUATRE DÉCISIONS SONT PRISES

| Décision | Verdict de Grégoire | Suite |
|---|---|---|
| **D1** survol SOLO sur iPad | « confort réservé au Mac » | **CLOS**, aucun code |
| **D2** le niveau disparaît sous sommative | « le niveau disparaît » | **CLOS**, comportement confirmé |
| **D3** étiqueter son échelle en SOLO | « oui, maintenant » | ⏳ **son geste** — et ce n'est plus un confort : la consigne du modèle de cartouche (#549) fait dépendre toute sa rédaction du seuil de maîtrise, que seule l'étiquette SOLO peut donner |
| **D4** laquelle des trois formulations SOLO | « les longues » | ✅ **APPLIQUÉ** dans `NIVEAUX_SOLO_ECHELLE` |

⚠ **Ce que la porte a attrapé, et qu'aucun test ne pouvait voir** : le niveau global ne
s'affichait PAS chez lui. Une évaluation désignant une échelle disparue était comptée comme
« une deuxième échelle », et le code refusait de choisir. Corrigé le matin même.

⏳ **Deux écarts signalés sur D4, non tranchés** : « préstructurel » garde sa formulation
courte (aucune longue n'existait) ; les quatre longues emploient « il/elle », un accord lourd
que la convention d'écriture inclusive demande de reformuler.

---

## ⏳ ANCIENNE ENTRÉE — porte terrain ouverte (remplacée ci-dessus)

`plans de travail/PORTES-TERRAIN-2026-08-27-niveau-global-selon-pratique.md`
(jumeau interactif : le `.html` de même nom, publié comme artefact).

**3 vérifications, 3 décisions.** Volontairement courte : les deux règles de tête du skill
`portes-terrain` l'exigent — aucune porte si une machine peut répondre, et pas de préalable
si un raté n'est pas irréversible. **Rien de ce qui a été livré le 27 n'écrit dans les
données**, d'où l'absence de §1.

⚠ **Ce que la porte annonce en tête, et qu'une session suivante doit savoir** : dans la
carte Accompagnement, **deux lignes ne suivent pas encore la même règle**. « Performance
globale » lit l'échelle de la pratique (pas 3c-1, fait) ; « Progression par critère », juste
en dessous, calcule encore avec le ternaire en dur (pas 3c, reste). Sur une échelle non-IDME,
**deux codes différents peuvent s'afficher pour le même élève**. Ce n'est pas un défaut à
corriger en urgence, c'est le chantier à moitié fait — mais il ne faut pas le découvrir par
surprise.

⏳ **Les trois décisions attendent un verdict ÉCRIT** : (D1) le survol SOLO est inaccessible
sur iPad ; (D2) le niveau disparaît sous sommative, est-ce ce qu'il veut voir ; (D3)
étiqueter son échelle en SOLO maintenant ou pas.

---

## Les arbitrages de Grégoire, 27 août 2026 — quatre dossiers refermés

| Dossier | Verdict | Effet |
|---|---|---|
| **#538** | Les **trois** portes terrain sont conformes — cours ordinaire, **reprise** (le cas critique), et **groupe-cours sans horaire** | **CLOS.** La troisième porte est la seule qu'aucun test ne pouvait trancher : sans horaire, l'application affiche **0 et le dit**, au lieu du `2` inventé |
| **#534** | Durcir la SEULE spec qui a un manque objectif | **CLOS.** `cours-refonte-rendu.spec.js` attend désormais `window.dbReady` au lieu d'un `waitForTimeout(500)` sans marge. **Quatre** montages, pas deux comme l'item l'annonçait. 4/4 verts en 4,4 s — plus rapide qu'avant |
| **#533** | L'item du backlog change de numéro (1 fichier) | **Renuméroté #533 → #548.** ⚠ L'arbitrage disait « #540 » : **il n'était plus libre**, pris la veille au soir par l'assiduité. Appliqué à la lettre, il recréait la collision qu'il éteignait |
| **#542** | « Aucun aspect pertinent n'est traité » est retenue | Les **cinq** descriptions SOLO sont désormais de sa main ou de son accord. Inscrit dans `echelles.js` |

⚠ **LA LEÇON DU #533, ET ELLE VAUT POUR TOUT ARBITRAGE DIFFÉRÉ.** Entre le moment où un
numéro est tranché et celui où il est appliqué, **le dernier ID a bougé**. C'est le cas
d'école de `feedback-id-backlog-inscrire-avant-usage`, vu depuis l'autre bout : ce n'est
plus deux sessions qui prennent le même numéro, c'est une décision qui vieillit d'une
soirée. ⮕ **Vérifier le dernier ID au moment d'APPLIQUER, jamais celui qu'un document —
ou une décision — annonce.**

---

## Ce que la matinée du 27 août a livré

**#542 lot 3, pas 1 et 2** — `4d04dd21`, `750e7c3f`. Le nombre de pas était plafonné à deux
par la consigne ; deux ont été faits.

**La décision qui commandait tout, prise avant la première ligne de code — OPTION B** :
l'étiquette SOLO est facultative, et son absence est DITE. Sans étiquette, le dépistage
rend le **nom du niveau atteint** et nomme ce qui manque. Il ne se tait pas (A), il
n'invente pas (C). ⮕ **Conséquence pour le pas 5 : les seuils `idme.*` n'ont plus aucun
rôle de repli possible.**

- **Pas 1** — `situerPourcentageDansEchelle` : la moyenne se situe dans les plages de
  l'échelle de l'UTILISATEUR. Hors plage rend `null`, **sans repli « plus proche »** — un
  repli par distance fabrique une réponse que l'échelle ne donne pas.
- **Pas 2** — `interpreterNiveauAtteint` : l'interprétation vient de l'étiquette SOLO. Les
  quatre descriptions rapatriées dans `NIVEAUX_SOLO_ECHELLE` (`echelles.js`), leur source
  unique.

⚠ **RIEN N'EST BRANCHÉ À L'ÉCRAN** — les deux fonctions n'ont aucun appelant, et
l'application se comporte exactement comme avant. C'est délibéré : le branchement est le
pas 3. **Playwright n'a rien de neuf à observer ; il en aura au pas 3.**

⏳ **DÛ PAR GRÉGOIRE avant le pas 3** : valider **« Aucun aspect pertinent n'est traité »**
(description de « préstructurel »). Seul texte écrit à neuf du lot — l'ancien code n'en
produisait que quatre pour cinq niveaux SOLO.

⮕ **Une donnée neuve versée à #547** : la sentinelle anti-cache exige un `?v=` du **jour du
build**, pas du jour de la modification. Poser `20260827a` sous un build `0826-1658` la fait
rougir. Les deux règles du projet se contredisent dès qu'on travaille le lendemain d'un
build — ce qui **écarte la piste (b)** de #547 et laisse la piste (a), un contrôle qui
SIGNALE au pre-commit.

**Vitest 3635/3635 (340 fichiers)**, lu après le dernier changement. 20 tests neufs,
**8 break-tests rouges vérifiés**, restauration confirmée par `diff -q`.

---

## Ce que la soirée du 26 août a livré (21e cycle)

**Trois chantiers, trois sessions, tout sur `main`.**

### #540 — CLOS. L'assiduité comptait des périodes qui n'existaient pas.

Parti d'une capture de Grégoire : « le nombre d'heures de cours par semaine n'est pas
dans les formulaires ». L'audit a montré l'inverse — il y était, dérivé et jamais
vérifié — puis a découvert bien pire en chemin.

| Lot | Ce qu'il a fait |
|---|---|
| **A** | La pondération devient obligatoire (astérisque, refus dit), normalisation vers « 2-2-3 ». **Un export orphelin trouvé** : `proposerHeuresEnseignementDepuisPonderation` n'a JAMAIS fonctionné — jamais exportée sur `window`, le dispatcher ne la trouvait pas. |
| **B** | Le `× 15 semaines` en dur retiré : les semaines se comptent au calendrier. Un 2-2-3 sur onze semaines vaut 44 h, pas 60. |
| **C** | L'écran Horaire cesse d'afficher `nbSeances × periodesParSeance` et affiche ce qu'il compte. Les replis à `2` taris. |
| **E1** | **Chaque séance porte SON nombre de périodes**, saisi et jamais déduit. Le champ global disparaît. |
| **E2** | **Plus aucune division** ne convertit une durée en périodes. Les deux migrations cessent de deviner. |
| **E3** | Le réglage « Durée d'une période » disparaît. La saisie n'écrit plus le champ `heures`. |
| **D** | L'horaire est confronté au devis du cours, et le dit. Jamais bloquant. |

⮕ **CE QUE GRÉGOIRE A APPORTÉ, ET QUI N'ÉTAIT NULLE PART DANS LE CODE** : « une heure
qui dure 60 minutes, c'est une période de 50 minutes plus 10 minutes de pause. Dans
d'autres collèges, 55 plus 5. » Tout le dépôt divisait un temps d'horloge par la seule
durée d'enseignement : `08:00 → 11:00` rendait **4 périodes au lieu de 3**, et un bloc
de quatre heures — cas courant en littérature — en comptait **5 pour 4**. L'erreur
croissait avec la durée, et ce nombre EST le dénominateur de l'assiduité : **un élève
pouvait être compté absent d'une période qui n'existe pas.**

⮕ Puis sa question a tranché le chantier : « je me demande si la durée de la période est
pertinente et si elle ne crée pas davantage de confusion. » L'audit lui a donné raison —
ce champ n'existait que comme **pont entre deux unités**, et un ratio est invariant par
unité. Il ne servait pas à calculer l'assiduité, seulement à réconcilier deux modes de
saisie.

⮕ **EN UNE PHRASE** : l'application ne convertit plus jamais une durée en périodes, parce
qu'elle ne le peut pas. Elle demande les deux, et les confronte.

### ⚠ CE QUE #540 LAISSE, ET QUI DEMANDE UNE DÉCISION

- **Les `nombrePeriodes` déjà écrits en base par les migrations** peuvent être gonflés.
  Elles ont tourné à chaque démarrage pendant des mois. Irréparables sans savoir ce que
  `duree` signifiait — personne ne peut le dire après coup.
- **Les horaires existants de Grégoire** ont des séances sans `nombrePeriodes`. Le
  chargement pré-remplit avec `periodesParSeance` (sa propre déclaration, pas une
  déduction), mais il doit **ouvrir chaque horaire et enregistrer** pour que ce soit
  écrit sur les séances.
- **Cinq `alert()`** subsistent dans `trimestre-v2-cours.js`, sur d'autres gestes
  qu'« Enregistrer ». Et `mettreAJourLigne` (`saisie-presences.js`) est **du code mort** :
  elle lit un champ `heures_${da}` que plus personne ne génère.

### #541 — le dépistage classait TOUT LE MONDE en « Étendu »

Livré et poussé (`69ce1483`) par la session « audit dépistage ».
`obtenirNiveauIDMEDepuisPourcentage` recevait un pourcentage 0-100 et le comparait à des
seuils 0-1 : **tout critère au-dessus de 1 % ressortait « Étendu »**, y compris à 12 %.
Le bloc « Forces et défis » ne pouvait afficher que des forces exceptionnelles, pour tout
le monde. Défaut antérieur à #529, au moins depuis le 17 mai. Aucun test ne l'exerçait.

Plan versé : `plans de travail/PLAN-SOLO-echelle-et-depistage.md` (`43cc4faa`), six lots.

### #542 — EN COURS, session encore active au moment d'écrire

Lots 0 et 1 livrés, oracle écrit. **Lots 2-3 en cours.** Ses fichiers :
`js/interventions.js`, `js/profil-etudiant-calculs.js`,
`js/profil-etudiant-sections-affichage.js`, `js/echelles.js`.

⮕ **LA DÉCOUVERTE QUI DÉPASSE LES TROIS CHANTIERS, et qui n'est de personne :**

> **383 évaluations sur 670 — 57 % des niveaux — désignent une échelle introuvable**,
> dont 339 sous le seul id `1767389426695` en H2026. Les valeurs survivent sous deux
> autres ids. Même patron que les grilles désappariées du 5 août.

**Le dépistage de Grégoire tourne aujourd'hui sur moins de la moitié de ses données, sans
le dire.** Antérieur à tous les chantiers de la soirée. Aucune réparation engagée : c'est
une décision sur ses données réelles, avec sauvegarde et dry-run. L'oracle du 26 sert à
identifier laquelle avant d'y toucher.

⮕ **Prochain ID libre : #548.** ⚠ Ce chiffre a bougé QUATRE FOIS pendant la rédaction de ce
relais — il annonçait #543, déjà pris, puis #547 l'a été à son tour. Les collisions ont été
évitées en inscrivant chaque item au backlog AVANT de l'employer ; **vérifier le dernier ID
au moment d'écrire, jamais celui qu'un document annonce.**

### ⚠ Une leçon qui vaut pour ce fichier lui-même

**Les documents de coordination se périment plus vite que le travail qu'ils décrivent.**
Constat de la session #541 sur son propre cadrage d'audit : quatre de ses affirmations
étaient fausses deux heures après l'avoir écrit, dont « aucune réparation n'a été engagée »
alors qu'elle venait de l'être sur les données réelles. Son périmètre avait doublé — 11
commits devenus 22. Elle a inscrit les corrections DANS le document plutôt que de les
effacer, et c'est le bon geste : dans un dépôt à trois sessions, la vitesse de péremption
d'un cadrage est une donnée en soi.

⮕ **Ce relais-ci ne fait pas exception.** Le lire au début d'une session, oui ; le croire
sur les chiffres, non — vérifier `git log`, `BACKLOG.md` et l'arbre.

### L'audit externe des 26-27 août — ✅ RENDU le 27 août, 15 h 45

Cadrage : `Rapports/CADRAGE-AUDIT-FABLE5-2026-08-27.md`. Rapport : `Rapports/AUDIT-decouplage-srpnf-idme-conception-2026-08-27.md`.
Périmètre finalement **élargi** par Grégoire (27 août et onglet Conception inclus ; la didactique
reste hors jugement). Voir le bloc « L'AUDIT FABLE 5 EST RENDU » en tête de ce fichier.

### Défauts trouvés et NON corrigés (inscrits, pas oubliés)

- `interventions.js:221` — `seuils.acceptable` est `undefined` (la clé vit sous
  `interpretation.acceptable`) : `score < undefined` est toujours faux, donc **la liste
  des défis communs d'un sous-groupe est toujours vide**.
- `portfolio.js:543` et `:554` — un quatrième repli IDME en dur, dont la clé de lecture
  `echellesPerformance` n'est **jamais écrite** nulle part : le repli est toujours actif.

---

## Ce que le cycle a livré

**Cinq versions, toutes nées de son travail réel** — il préparait son 601-101 dans
la Carte d'alignement, et chaque friction est devenue une livraison le jour même :

| | |
|---|---|
| **1.72.0** | ⌘D duplique toute la multi-sélection (Supprimer la traitait déjà — c'était une asymétrie, pas un manque) |
| **1.73.0** | « Tout voir » + **loupe de navigation** (sa carte est illisible à 25 %, qui était le plancher du zoom) |
| **1.74.0** | Guides magnétiques + six commandes d'alignement |
| **1.74.1** | Le clic dans la carte atterrit · le pointeur devient la zone examinée |
| **1.75.0** | **#448** — une collision d'id à l'import n'est plus un accident à renommer |

Plus : **#451 clos** (a2026 porté dans Safari), **#450** et **#449** documentés
sur mesures, `SKILL_portes_terrain.md` amendé, et trois outils de console
(`diagnostic-448`, `reparation-448`, `inspecterOrphelins448`).

---

## ⚠ CE QUI RESTE DÛ, ET QUI N'EST PAS DU CODE

**Sa rentrée est dans trois semaines.**

0. ✅ ~~**SES CARTOUCHES ORPHELINES — à récupérer.**~~ **FAIT le 24 août au
   soir, par Grégoire lui-même.** Les 6 cartouches A26 de sa soirée (lots 16 et
   5 du dry-run) sont rattachées à « Grille-5 FR-HOLIS A26 » via
   `scripts/reparation-cartouches-orphelines.js`. Les lots d'origine sont
   CONSERVÉS — filet volontaire, à retirer seulement après vérification à
   l'écran.

   ⏳ **Ce qui reste de son côté, et qui n'est pas du code :**
   · **trois paires à départager** sur cette grille — « Description d'un
     personnage » / « … A26 », « Carte mentale » / « … A26 », « Plan de
     rédaction » / « … A26 ». La garde d'identité conserve les deux exemplaires
     par construction ; c'est à lui de comparer et de retirer la périmée ;
   · « Stratégies de lecture A26 » a suivi son lot vers A, alors que
     « Stratégies de lecture » vit sur B (Grille-4 A26). S'il veut l'y déplacer,
     il faut un rattachement À LA PIÈCE — le script ne sait déplacer qu'un lot
     entier.

   ⏳ **16 lots orphelins restants, laissés À DESSEIN** : matériel démo
   (générique, Démo, les deux « rapport de laboratoire » chimie/bio), trimestres
   passés, et trois piles de doublons (le lot 12 contient « Description d'un
   personnage » DEUX fois, le 13 a « Carte mentale » en triple). Les rattacher
   inonderait ses trois grilles et recréerait les doublons fermés en 1.92. Le
   ménage est une décision séparée, avec un dry-run par lot.

0 bis. ⏳ **PORTES TERRAIN 1.95.2 — 20 rangées + 4 décisions, non relevées.**
   `plans de travail/PORTES-TERRAIN-2026-08-24-cartouches-inter-trimestre.md`
   (jumeau interactif : le `.html` de même nom). La rangée 1.1 confirme que la
   section apparaît bien chez lui après le correctif de la 1.95.1 — c'est elle
   qui avait échoué sur sa capture. Les rangées 2.0.x couvrent la persistance de
   la section pour les TROIS bibliothèques dont le rendu n'a pas été joué au
   navigateur (échelles, pratiques, productions). 10 comportements retirés de la
   liste sur preuve mesurée (`cartouches-import-trimestre.spec.js` +
   `bibliotheques-import-persistance.spec.js`).

   ⚠ **La leçon du lot, et elle vaut au-delà.** La porte 1.1 que j'avais écrite
   prévoyait l'échec et l'attribuait à SES données (« ses archives n'ont
   peut-être pas de copies »). C'était faux, et c'était mon bug. Une porte
   terrain qui pré-explique un échec par les données de l'utilisateur est une
   porte qui invite la session suivante à ne pas chercher. **Reproduire avant de
   conclure**, même — surtout — quand on a soi-même écrit l'explication qui
   arrange.

0 bis. ⏳ **PORTES TERRAIN 1.94.1 — 18 rangées + 5 décisions, non relevées.**
   `plans de travail/PORTES-TERRAIN-2026-08-24-confirmations-conception.md`
   (jumeau interactif : le `.html` de même nom). Le tri a déjà été fait —
   12 rangées ont été retirées **sur preuve mesurée** (§2 bis, harnais Chromium
   dans `tests/integration/confirmations-conception-uniformes.spec.js`). Ce qui
   reste est **structurellement invérifiable en conteneur** : Safari, l'iPad, le
   corpus réel, et les trois éditeurs (production, cartouche, pratique) dont le
   formulaire est trop lié à l'état de l'app pour être piloté. **Les 5 décisions
   du §3 attendent un verdict ÉCRIT de Grégoire**, pas une coche — deux touchent
   au libellé (guillemets droits ou français ; « sauvegardée » ou « créée » pour
   un objet neuf), une au périmètre (≈165 `alert()` de validation et d'erreur
   laissés en fenêtres natives, à migrer ou non).

1. ✅ ~~⚠️ **#368 — vérifier EN PREMIER que la carte 601-101 est bien passée en
   A26.**~~ **VÉRIFIÉ PAR GRÉGOIRE le 18 août** : « oui, la carte 601-101 est
   vraiment en A26. » Le préalable de la rentrée est levé ; l'entrée #368 est
   cochée au BACKLOG (restes optionnels : ménage des cartes, confirmation
   Safari — la carte y voyage par codex).
2. ⚠️ **#450** — renommer les deux échelles « IDME et niv 0 » d'a2025, **dans les
   deux navigateurs**. Citées 344 et 72 fois : renommer, jamais fusionner.
3. ⏳ **Safari** — les 5 copies muettes y sont encore. Chrome est nettoyé (83 → 78).
4. ⏳ **6 magasins orphelins** — décision humaine, pas de script.

---

## ⚠⚠ LA LEÇON DU CYCLE, ET ELLE COMMANDE LA SUIVANTE

**CINQ FOIS, C'EST MON PROPRE OUTIL QUI MENTAIT — et chaque fois c'est une MESURE
qui l'a dit, jamais une relecture.**

1. La barre d'alignement partait **hors écran** : offset du canevas oublié. **Le
   même oubli que la loupe deux heures plus tôt**, dans la même session.
2. « Tout voir » tombait au plancher **en silence** quand la zone n'avait pas de
   taille.
3. La loupe restait **vide** sous la grille du Planificateur — écouteur posé sur
   la zone au lieu du document. Symptôme « ça marche parfois ».
4. Mon inspecteur d'orphelins déclarait « CONTENU UNIQUE » huit fois dans un
   magasin de quatre paires : j'excluais le magasin courant de sa propre
   recherche. **Et son verdict conseillait de SUPPRIMER un contenu qui n'existait
   que là.**
5. Mon garde a refusé cinq retraits légitimes sur `dateImport` — le projet avait
   déjà une liste canonique de ces champs (`securite-hash.js:34`) ; je
   réinventais une règle à côté d'une règle existante.

⮕ **Sur les données et sur le DOM, un diagnostic lu au code est une HYPOTHÈSE.**
Le conteneur a Chromium ; reproduire coûte trois minutes, et ça a payé cinq fois.

**ET TROIS BREAK-TESTS SONT RESTÉS VERTS — trois tests trop lâches :**

- **piège `indexOf`** : rend `-1` quand le motif est absent, et `-1` est inférieur
  à tout index — une assertion d'ORDRE passe donc quand le code qu'elle protège
  DISPARAÎT. **Deux autres assertions du dépôt portaient le même piège** ;
- **valeurs non discriminantes** : 4 px et 40 px répondent pareil avec ou sans
  division par le zoom ;
- **assertion qui nomme l'invariant et en teste un plus faible** — démasquée par
  le rituel de fin, sur l'arbre final.

⮕ **Les trois ont en commun d'avoir été écrits en même temps que le code qu'ils
protègent.** Le break-test n'est pas une formalité de clôture : c'est la seule
chose qui distingue un test d'une décoration.

---

## ⚠ CE QUI N'EST PAS VALIDÉ

- **Safari et iPad** — WebKit n'existe pas dans le conteneur. Tout a été éprouvé
  dans Chromium, y compris les gestes tactiles, mais ce n'est pas son matériel.
- **Deux specs Playwright neuves n'ont JAMAIS été exécutées**
  (`planif-tout-voir-loupe.spec.js`, `planif-alignement.spec.js`) → CI.
- **Le parcours d'import COMPLET (vrai ZIP) n'a pas été rejoué.** Le correctif
  #448 est prouvé sur la ligne de fusion, en bac à sable et au navigateur — pas
  de bout en bout.

⚠ **Et un piège de harnais, noté pour la prochaine fois** : des ids de test
courts (`f1`, `v1`) apparaissent par hasard dans d'autres données. Le comptage de
citations par sous-chaîne les déclare « cités », aucun orphelin n'est détecté, et
les scénarios passent **sans rien exercer**. Utiliser des ids réalistes.

---

## Pourquoi ce fichier existe

Le 8 août 2026, **deux sessions sont parties du même commit sans se voir**.
Chacune a livré une version « 1.55.0 » différente et pris les mêmes
identifiants de backlog. La journée s'est terminée par une réconciliation
manuelle : sept conflits, une renumérotation complète, trois numéros de
version à fondre en un.

Ce n'était pas un défaut d'attention. La session du matin **a fait le rituel
de début, a vérifié la prémisse, et a trouvé zéro écart** — parce que la
prémisse qu'elle lisait, sur `main`, avait été périmée par une branche qu'elle
ne pouvait pas voir.

▣ **La cause est structurelle, et elle est circulaire** : la consigne de relais
(le §3 de `SESSION.md`) est un fichier **versionné**. Quand le travail vit sur
une branche non mergée, la consigne qui le dit vit sur cette branche **aussi**.
La session suivante, elle, lit celle de `main`. *Une session qui ne démarre pas
sur la bonne branche ne peut pas lire l'instruction qui lui dit quelle branche
prendre.* Aucun soin apporté au rituel ne compense ça.

---

## La règle adoptée (décision de Grégoire, 8 août 2026)

**On fusionne vers `main` à la fin de CHAQUE session.** C'est le remède : c'est
le report du merge qui ouvre la fenêtre de divergence, et il avait été reporté
trois fois dans la semaine avant de coûter une journée.

**Ce fichier est le filet**, pour les cas où un merge doit vraiment attendre —
travail à mi-chemin, validation terrain en suspens, décision de Grégoire non
prise. Dans ce cas, et dans ce cas seulement :

1. le remplir en nommant la branche et ce qu'elle porte ;
2. le **committer et le pousser sur `main`**, seul, sans le reste du travail.

Un `RELAIS.md` qui pointe vers une branche est le signal qu'une dette de fusion
existe. Il doit repasser à « aucun » dès que la fusion est faite.
