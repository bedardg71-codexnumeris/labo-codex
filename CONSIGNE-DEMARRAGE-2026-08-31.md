# Consigne de démarrage à froid — 31 août 2026

> Réécrite le 30 août 2026 à 20 h 20 par `kuekatsheu-0d`, sur le modèle de
> `Modèle de consigne de démarrage à froid.txt`. **La version de 19 h 50 était
> périmée en une heure** — elle annonçait la release comme à faire et six tests
> manuels comme dus ; les deux ont changé. Tous les chiffres ci-dessous ont été
> mesurés, aucun n'est repris d'un rapport de session.

--

Ouvre le dépôt Monitorage_v6. Rituel d'abord : délègue l'audit de début de session
au subagent `audit-debut-session`, puis lis la section « POUR LA SESSION QUI PREND
LE RELAIS » en tête de RELAIS.md. On est à la **1.106.12** (build `0830-1947`),
poussée hier soir.

ÉTAT MESURÉ AU 30 AOÛT, 20 h 20 — ne le refais pas si l'arbre n'a pas bougé
- `main` porte **6 commits d'avance** sur `origin/main`, et **l'un d'eux est du
  CODE** : `15ef1c45` (#612, T6.3 — `detecterFichiersDAInconnu`). Les cinq autres
  sont documentaires.
  ⚠ **Conséquence, et c'est pour ça que le chiffre compte** : le dernier verdict
  Playwright a été obtenu AVANT ce commit. **Relance la suite WebKit avant de
  pousser**, sinon tu pousses du code qu'aucune suite navigateur n'a vu. Vitest,
  lui, couvre bien `15ef1c45` (412 fichiers / 4344 tests, code de sortie 0).
  *(Une version antérieure de cette consigne disait « 5 commits, tous
  documentaires » : les deux moitiés étaient fausses.)*
- Arbre propre, hors deux fichiers non suivis à trier : `_sauvegarde-20260830-1905/`
  et `ETAT-AVANT-REDEMARRAGE-2026-08-30.md`. Leur condition de suppression est
  remplie ; demande-moi avant de les retirer.
- **Vitest 412 fichiers / 4344 tests, code de sortie 0**, suite entière.
- Playwright WebKit 210/210 mesuré à 19 h 40 sur un état antérieur de trois
  commits de code : **à relancer** avant tout push de code.
- Deux sessions étaient encore vivantes hier soir : `kuekatsheu-ff` et
  `kuekatsheu-00`. **Lance `ListAgents` avant d'écrire dans un `js/`** ; si elles
  sont là, mets-toi d'accord sur les fichiers, sinon vérifie que leur travail est
  commité.

⚠ CE QUE J'AI DÉCIDÉ HIER SOIR, ET QUI ANNULE DU TRAVAIL DÉJÀ PRÉPARÉ
**Les portes terrain préventives du cycle d'importation sont ABANDONNÉES.** Elles
existent (`plans de travail/PORTES-TERRAIN-2026-08-30.md` + un artefact), elles
sont complètes, et je ne les jouerai pas. Motif, appliqué avec la règle 2 du skill
`portes-terrain` : aucun des quatre ratés possibles n'est irréversible — un fichier
en corbeille se restaure, des doublons se suppriment, un statut écrasé est une
perte d'information, pas de travail. Et la porte P3 me demandait d'importer dans
mon corpus réel, de recharger en plein milieu et de confirmer un re-dépôt : **le
test coûtait le risque qu'il mesurait**, à trois jours de la rentrée.
⮕ **Ce qui les remplace, et c'est tout** : au premier import d'un vrai lot en
septembre, je regarde l'attribution des copies. C'est le seul défaut *silencieux*
du lot — une copie sous le nom d'un autre élève ne se signale pas. Le reste, je le
verrai en usage normal et je le dirai.
⮕ **Ne me repropose pas de portes terrain pour du préventif.** Une porte n'existe
que si aucune machine ne peut répondre ET qu'un raté est irréversible.

PRIORITÉ DATÉE — LE 1er SEPTEMBRE, DANS DEUX JOURS
#427 + #508, décision déjà prise (option A, je tiens la date). Deux versants : ce
qui est dû par moi dans la console Cloudflare (les trois noms, la durée de session,
la règle Include), et ce qui est dû côté code le jour même — réécrire le paragraphe
d'accueil au présent dans `js/accueil.js`. Les deux textes sont écrits d'avance au
§7 de `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`. Le bandeau
s'éteint seul, il n'y a rien à retirer à la main.

LES DEUX AUDITS DU 30 AOÛT — OÙ ILS EN SONT
Chacun a son plan, et **le tableau d'état en tête de chaque plan est la seule vue
d'ensemble**. Ne crois pas un `LIVRÉ` sur parole : vérifie qu'il est dans `main`.

**1 · Chaîne d'importation** (`PLAN-chaine-importation-travaux-2026-08-30.md`) —
presque fermé. S0, S1, S2, S3, S4, S5, S7, S8 LIVRÉS et poussés. De S6, **T6.6 et
T6.3 sont livrées**, le reste est explicitement remis par moi hier soir : T6.2,
T6.4, T6.5, T6.7, T6.8. S9 (#615) n'est pas entamée. S10 est annulée par ma
décision ci-dessus.
⚠ **Deux inexactitudes mesurées, à corriger dans T6.4** :
· Le plan ET l'audit nomment une fonction `confirmerImportPipeline` qui **n'existe
  pas**. La vraie est `appliquerEtImporter` (`js/travaux-ui.js:3641`). Les deux
  gardes de T6.4 s'y posent.
· Le bandeau « sans DA » annonce « l'association devra être faite manuellement » :
  faux depuis #611 pour un fichier dont l'élève a été trouvé par son nom. Le
  message reste juste pour le regroupement multi-pages.

**2 · Modèle d'objets de l'onglet Conception**
(`PLAN-modele-objets-conception-2026-08-30.md`) — **pas commencé, et il ne peut
pas l'être sans moi**. S0 est EN COURS : il attend **cinq décisions D1 à D5** et la
réservation des identifiants. Sa séquence est en trois temps — d'abord trois audits
ciblés en lecture seule (Z1 cartouches et archivage, Z2 suppressions et orphelins,
Z3 legacy vivant), qui PRODUISENT les diffs ; les correctifs viennent après. Ne
saute pas les audits Z : le rapport de temps 1 ne propose délibérément aucun diff.

ENSUITE — propose-moi un choix fermé entre :
(a) **Finir T6.4 et T6.5** (#612) — le bandeau « DA sans élève dans ce groupe », la
    garde de groupe absent, les lignes de rattrapage, plus les deux messages
    inexacts ci-dessus. Ferme un chantier déjà ouvert plutôt que d'en rouvrir un ;
    les fichiers et les décisions sont connus (D2 = A, refus dit). **Le meilleur
    rapport effort/fermeture du reste.**
(b) **S9 / #615** — les mineurs de l'audit d'importation (M1 à M4, M10). Sept
    tâches, aucune décision, D3 déjà tranchée. Ferme le plan d'importation côté
    code. ⚠ Touche `travaux-ui.js` et `travaux-import.js` : à ne pas mener en même
    temps que (a).
(c) **Ouvrir le plan Conception par S0** — les cinq décisions D1–D5, avec moi, puis
    l'audit Z1 en lecture seule. C'est le chantier le plus lourd des deux, et le
    seul qui touche des constats de CORRUPTION possible (cartouches partagées entre
    trimestres, archivage qui écrase du vivant, l'incident #542).
(d) **#616** — les 31 sentinelles qui bornent par DISTANCE et non par branche.
    Verte aujourd'hui, fausse demain au premier commentaire ajouté. Le helper
    `corpsSansCommentaires(src, signature)` existe déjà, écrit pour #613.

DEUX ITEMS À NE PAS OUVRIR SANS MESURER D'ABORD
#618 : `supprimerEvaluation` traite `'quota'` comme un succès —
`sauvegarderDonneesSelonMode` rend `false`, `true` OU la chaîne `'quota'`
(`js/modes.js:751`), et `liste-evaluations.js` teste en truthy. Compte les autres
appelants qui font le même test AVANT d'ouvrir : le nombre décide de la taille.
#596 : l'énoncé dit « 6 clés, 5 fichiers » ; la mesure du 30 août donne 11 fichiers
et ~17 clés. Tranche le périmètre avant de commencer.

PIÈGES DÉJÀ PAYÉS — ne les réapprends pas
· **Les diffs de l'audit d'importation sont des ESQUISSES, pas des spécifications.**
  Quatre appliqués le 30 août, quatre corrigés à l'application : deux retours non
  convertis, une garde omise, un `.every()` sur liste vide qui rend `true`, un ordre
  de correctif qui fabriquait un état incohérent. Ouvre le code de référence que le
  diff invoque, et grep TOUS les `return` avant de changer une forme de retour.
· **Un refus RENDU n'est pas une exception.** Lis la valeur rendue AVANT tout geste
  destructeur — inverser l'ordre ne suffit pas, il faut le test explicite.
· **Un placeholder de commit dans un tableau d'état se retire AVANT de committer**,
  pas après. Deux fois le même défaut le 30 août (`COMMIT_S4`, `COMMIT_S5`).
· getSync ne protège d'aucune course : dans `db.set`, l'écriture IndexedDB est
  attendue AVANT le rafraîchissement de localStorage.
· Node n'a pas d'IndexedDB : force `db.useIndexedDB` avec une fausse connexion,
  sinon le test est vert sur du code cassé. Patron dans
  `sentinelle-522-pratiques-serialisees`.
· **Un corpus de test monté sans copie et muté en place par le code sous test donne
  un faux rouge**, puis un faux vert. Vu le 30 août sur la sentinelle #607.
· Vitest ne voit pas le rendu ; il se lance depuis `tests/` ; lis le CODE DE SORTIE,
  pas « passed ». Et si tu dois exclure un fichier, **colle l'exclusion au chiffre**
  — sans elle, ta mesure honnête devient une fausse attestation.
· Ferme GitHub Desktop avant Playwright, et n'ÉCRIS pas dans `js/`, `index.html` ou
  `tests/` pendant qu'il tourne. En revanche `git status`, `git log` et `git diff`
  ne modifient rien : ils sont sans danger.
· Sur `BACKLOG.md`, `SESSION.md`, `RELAIS.md` et les plans, `--stat` repère un
  fichier étranger, PAS un bloc étranger dans un fichier attendu : lis le diff
  stagé ENTIER. Et `git commit` SANS nommer de chemin quand tu commites un index
  préparé — tout chemin passé au commit reprend l'ARBRE.
· `git commit -m "…"` : zsh exécute les backticks. Toujours `-F -` avec `<<'EOF'`.
· Une seule release à la fois, et jamais pendant qu'une autre session a du code non
  commité : `release.mjs` bumpe les `?v=` de tout l'arbre.
· Inscris un `#NNN` dans `BACKLOG.md` AVANT de l'employer. **Dernier utilisé : #618.**
