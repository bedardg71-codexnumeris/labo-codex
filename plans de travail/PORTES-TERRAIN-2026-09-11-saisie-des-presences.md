# Portes terrain — 11 septembre 2026 (Saisie des présences : le verrou par groupe-cours, les préférences par trimestre, la démo sans « Configuration incomplète » — lot 3 du cadrage 11, 1.133.0)

> **Version à l'écran attendue : `1.133.0`** (le build est écrit par la release ; lis-le en bas de page).
> Couvre : une date verrouillée ne l'est plus que pour le groupe-cours et le trimestre où tu la verrouilles (S-4) ; la date, le
> sous-groupe, le tri et la recherche de l'écran ne fuient plus d'un trimestre à l'autre (S-6) ; la démonstration n'ouvre plus sur
> « Configuration incomplète » et pose une date de séance (S-6). Le reste du lot (la garde sans cours actif, S-3 ; l'inventaire
> Données qui montre la clé réelle) n'a **aucune porte** : invisible, mesuré par la sentinelle du lot et la suite complète.
>
> **Ce qui échoue ici devient un item de backlog, avec son numéro de porte.** Jamais une note mentale.

**Pourquoi cette liste est courte.** Cinq rangées, fixées par la consigne. Chaque brique est prouvée au banc (douze essais, dix fois
cassés exprès, dix rouges) et le parcours de la démo est joué dans un vrai navigateur (WebKit, `index.html` réel, stockage vide :
aucun bandeau, une date posée, vingt élèves). Reste ce que seul ton écran tranche : **tes deux groupes réels**, Safari, et l'adresse
en ligne.

---

## §0 · Préalable — deux gestes, une minute

| | Geste | Attendu |
|---|---|---|
| **0.1** | Ouvre **https://app.codexnumeris.org** dans un **nouvel onglet** (si un onglet de l'app était déjà ouvert : recharge-le avec vidage de cache, Cmd+Maj+R) | — |
| **0.2** | Lis le **numéro de version en bas de page** | **`1.133.0`**. Sinon, arrête-toi : la liste jugerait la version d'avant. |

---

## §1 · ⚠⚠ Tes données — la rangée 1 écrit chez toi

**Verrouiller une date sauvegarde d'abord la grille affichée** (c'est le filet du 3 février, gardé tel quel ; c'est aussi l'une des
portes hors du mode anonymisation, `#736`, réglée après le 14). Pour que cette sauvegarde n'écrive que ce qui existe déjà :
**choisis une date passée DÉJÀ SAISIE, et PAS ENCORE verrouillée.** Déverrouiller remet tout comme avant : la grille de cette date
reste celle que tu avais.

⚠ Les dates que tu avais verrouillées **avant** cette version restent verrouillées **dans chacun de tes groupes** (elles l'étaient
partout ; on ne change rien au passé — voir § 3). Seules les dates que tu verrouilles **à partir de maintenant** ne valent que pour
le groupe et le trimestre où tu le fais.

---

## §2 · Ce que seul ton écran peut trancher

### 2.1 · Le verrou ne vaut que pour ce groupe-cours

**Pourquoi.** Tu as deux groupes cet automne. Jusqu'ici, le 8 septembre verrouillé dans le groupe A l'était aussi dans le groupe B,
et le serait resté l'an prochain.

| | Geste | Attendu |
|---|---|---|
| **2.1a** | Groupe **A** actif, `Suivi › Saisie des présences`, une date passée **déjà saisie et pas encore verrouillée** : clique le cadenas (« Verrouiller ») | « Verrouillée » ; la grille de cette date passe en lecture seule |
| **2.1b** | Passe au groupe **B** (sélecteur d'en-tête), même date | **Pas verrouillée** — cadenas ouvert, grille modifiable (avant : elle l'était) |
| **2.1c** | Reviens au groupe **A**, même date : clique le cadenas (« Verrouillée ») | Déverrouillée ; **ses présences sont intactes** — la même grille qu'avant le verrou |

### 2.2 · La démonstration ouvre sur une saisie qui se saisit

**Pourquoi.** Le 6 septembre, la démo ouvrait `Saisie des présences` sur « Configuration incomplète — Aucune séance n'est rattachée
à l'horaire de ce cours », la date vide et « (0 étudiant·e) », alors que l'horaire démo porte deux séances. Vingt collègues
l'ouvriront le 14. Le parcours est déjà joué par une machine (WebKit) ; cette rangée le confirme dans **Safari, sur l'adresse en
ligne** — la seule que tes collègues verront.

| | Geste | Attendu |
|---|---|---|
| **2.2a** | Note la **date** et le **tri** affichés dans ta saisie réelle (tu les compares en 2.3). Puis `Labo › Démo`, active la démonstration, `Suivi › Saisie des présences` | **Aucun** bandeau « Configuration incomplète » ; une date de séance est proposée ; la grille montre les **20 élèves** |

### 2.3 · Tes préférences reviennent avec ton trimestre

**Pourquoi.** La date, le sous-groupe, le tri et la recherche de l'écran étaient partagés entre tous les trimestres et la démo.

| | Geste | Attendu |
|---|---|---|
| **2.3a** | Désactive la démonstration, reviens à `Suivi › Saisie des présences` | La **date et le tri sont ceux que tu as notés en 2.2a**, pas ceux de la démo |

---

## §3 · Décisions — ce qui attend ton verdict

**Ce ne sont pas des vérifications.** Une décision de stock, nommée par Cowork dans la conversation ; **ton silence vaut « tel quel »**
(ta règle du 11).

| | Décision | Verdict (à écrire) |
|---|---|---|
| **3.1** | **Tes dates verrouillées d'avant deviennent celles de chaque groupe à sa première ouverture** (la liste entière, parce qu'elles étaient verrouillées partout) ; l'ancienne liste reste en place, intacte. L'autre lecture possible : repartir **à vide** par groupe — une ligne à changer. | _tel quel par défaut_ |

---

## §4 · Ce que je n'ai pas pu vérifier

- **Safari et l'iPad** : le parcours de la démo est joué dans WebKit headless (Chromium n'est pas Safari, WebKit headless non plus tout
  à fait) ; rien de ce lot ne touche au CSS ni à la mise en page.
- **Tes deux groupes réels et ton stock de dates verrouillées** : le semis (§ 3) est prouvé au banc sur une liste de deux dates ; pas sur
  la tienne. Sa réversibilité tient : la clé nue `datesVerrouillees` n'est ni effacée ni réécrite (`scripts/diagnostic-353-cles-orphelines.js`
  la connaît).
- **L'adresse en ligne** : le lot est jugé sur l'arbre local (Vitest 538 fichiers, 5875 essais ; verdict Playwright sur le SHA poussé). Ce
  que Netlify sert se lit en bas de page (§ 0).
- **Pas de bandeau ≠ rien à dire** : si un trimestre réel n'a **ni** horaire **ni** séances, le bandeau s'affiche toujours — c'est voulu, et
  la sentinelle le tient. Ce qui n'est pas mesuré : un horaire à séances dont le calendrier est vide (le bandeau se tait parce que
  l'horaire a des séances ; la grille dit « Pas de cours pour ce groupe à cette date »).
- **Ta démonstration** : le semis n'y entre pas (relecture croisée) — tes dates verrouillées réelles n'y apparaîtront pas. Prouvé au
  banc ; pas vu dans ta démo à toi (le Playwright part d'un stockage vide).
- **Erreur de la session, rattrapée** : le cliquet `#398` (nombre d'appels à la date locale) a rougi sur la suite complète — un second
  appel, légitime, dans la date par défaut ; le cliquet est monté à 2 avec son motif. Rien n'a été découvert « trois jours plus tard ».
