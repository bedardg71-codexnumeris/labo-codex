# Mesure — les specs vertes au second essai (#685, #833)

> Écrit le 19 septembre 2026 par Claude Code, en réponse à `CONSIGNE-DU-JOUR.md`
> (« les specs qui passent au second essai »). SHA mesuré : `80661049` (code = `fc1c012d`,
> 1.146.8). Machine : 8 cœurs. Les §1 à §6 sont la mesure que le §7 de la consigne demande AVANT toute réécriture
> (commit `ffb447f3`, aucune spec modifiée) ; le §7 d'ici dit ce qui a été fait ensuite.
> Statut des énoncés : `[mesuré]` = compte obtenu ce jour ; `[lu]` = lu dans un relais ou
> dans le code ; `[inférence]` = déduit, non éprouvé.

## 1 · Ce que la mesure dit, en quatre lignes

1. **Les attentes fixes ne sont la cause mesurée d'AUCUNE des trois specs nommées.** `[mesuré]`
2. `triptyque` : 10/10 au repos, 10/10 sous charge 32–83. **Non reproduite**, ni par la charge
   processeur ni autrement. À ne pas toucher (§4, premier cas d'arrêt).
3. `planif-toolbar` : 10/10 au repos, 9/10 sous charge 78–186. Ce qui rougit n'est pas une
   assertion après une attente : c'est **le budget de 30 s par essai**, crevé par la lenteur
   générale (« Tearing down "context" exceeded the test timeout of 30000ms »). À ne pas toucher.
4. `liste-651` : **9/10 AU REPOS** (charge 2,9). Cause lue : **une course entre la spec et la
   fin de la chaîne « Consulter »** de l'application, sans rapport avec la charge ni avec un
   `waitForTimeout`. C'est la seule des trois dont la cause est dans la spec — et dans `js/`.

⮕ Conséquence pour le lot : voir §6. Le remplacement des 24 attentes de `planif-toolbar`
n'aurait rien changé à ce qui l'a fait rougir.

## 2 · Remesure des chiffres de Cowork `[mesuré]`

| Énoncé de la consigne | Mesuré |
|---|---|
| 295 `waitForTimeout` dans 113 des 135 specs | 295 / 113 / 135 — conforme |
| `planif-toolbar` = 24, maximum du dépôt | 24 — conforme (suivants : 11, 10, 9, 9) |
| `triptyque` = 4 | 4 — conforme |
| `liste-651` = 1 | 1 occurrence du MOT, dans un commentaire qui dit qu'elle n'en porte aucun ; elle porte trois attentes fixes maison (`attendre(page, 400)` et deux `attendre(page, 1500)`, un `setTimeout` dans la page) |
| « second essai » quatorze fois dans `RELAIS.md` | 16 dans `RELAIS.md`, 7 dans `SESSION.md` |
| La boucle d'attente de charge de `pousser.sh` abandonne après 5 min | **`pousser.sh` ne contient aucune garde de charge** (grep `charge\|uptime\|loadavg\|sysctl` sur `scripts/` et les hooks : 0 ligne). La boucle du 18 était improvisée en session ; la règle « plafonner et NE PAS lancer » n'est verrouillée nulle part. |

## 3 · Les comptes — 10 passes par spec, `--retries=0`, une invocation par passe

Charge 1 min relevée avant chaque passe (`sysctl -n vm.loadavg`).

### Au repos (charge 2,3 – 3,9)

| Spec | Passes vertes | Essais verts | Durée d'une passe |
|---|---|---|---|
| `triptyque-seme-produit-une-note` | 10/10 | 40/40 | 7–9 s |
| `planif-toolbar` | 10/10 | 60/60 | 39–40 s |
| `liste-651-annoter-depuis-le-mode-evaluer` | **9/10** | 29/30 | 16–17 s (26 s la passe rouge) |

La passe rouge de `liste-651` (passe 5, charge 2,92) : « le trajet direct », `TimeoutError`
à la **ligne 157**, l'attente de `#evaluations-liste.sous-section.active` — la même ligne que
celle nommée au relais du 18 sept.

### Sous charge fabriquée (32 processus `yes` ; charge relevée 32 – 186)

| Spec | Charge relevée | Passes vertes | Durée d'une passe |
|---|---|---|---|
| `triptyque` | 32 – 83 | 10/10 | 36–56 s (≈ 7 fois le repos) |
| `planif-toolbar` | 78 – 186 | **9/10** | 121–209 s (≈ 3 à 5 fois le repos) |

La passe rouge de `planif-toolbar` (passe 10, charge 125) : deux essais, même message,
« Tearing down "context" exceeded the test timeout of 30000ms ». Sous cette charge, chaque
essai dure 22 à 37 s contre ≈ 6,5 s au repos : le plafond de 30 s par essai est franchi
sans qu'aucune assertion ait échoué. Les attentes fixes de la spec totalisent 3 à 5 s par
essai (2,3 s pour ouvrir la démo, 0,8 s pour montrer la carte, le reste par gestes) : les retirer ne ramène pas 37 s sous 30 s.

⚠ Limite de cette contre-épreuve : la charge fabriquée est une charge **processeur**. La
sauvegarde Time Machine du 18 est une charge **disque**, et l'application se charge par
`file://`. Non mesuré ici. `[inférence]` : le mécanisme final est le même (un essai plus lent
que son plafond), mais ce n'est pas éprouvé.

## 4 · La cause lue de `liste-651` `[mesuré par sonde, 20 rejeux au repos]`

Sonde jetable (copie de la spec, retirée) : `window.afficherSousSection` enveloppée pour
journaliser chaque appel, son instant et sa pile. 20 rejeux du « trajet direct » : 10 verts,
10 rouges (l'enveloppe déplace le minutage de quelques millisecondes : la course est au
couteau). Journal d'un rouge, en ms depuis l'enveloppement :

| Instant | Appel | Appelant |
|---|---|---|
| 23 | `evaluations-annoter` | `consulterEvaluationDepuisListe` (`liste-evaluations.js:1863`) |
| 1266 | `evaluations-liste` | **la spec** (ligne 156) |
| 1286 | `evaluations-annoter` | **`modifierEvaluation`** (`evaluation.js:1151`), lancée par la minuterie de 600 ms de `_apresOuvertureFichier` (`liste-evaluations.js:1859`) |

Dans les dix verts, le dernier appel est absent : `modifierEvaluation` est passée AVANT la
spec, a trouvé la sous-section déjà sur « annoter », et n'a pas navigué.

**Lecture.** « Consulter » est une chaîne de minuteries : +500 ms `ouvrirFichier`, puis
+600 ms `modifierEvaluationParId`, puis +200 ms le chargement. La spec juge la chaîne finie
quand `evaluationEnCours.idModification === 'EVAL651'` — or cette condition est remplie
AVANT l'appel de `modifierEvaluation` (fait mesuré : 1266 < 1286 ; par qui, `[inférence]` :
le pré-remplissage du mode Évaluer à l'ouverture de la copie). La spec part donc vers la
liste une vingtaine de millisecondes avant que la queue de la chaîne ne la ramène de force
sur « Annoter et évaluer ». L'attente de la ligne 157 ne peut plus jamais être satisfaite.

**Ce que c'est.** Deux choses, à ne pas confondre :

- *Dans la spec* : une condition de fin qui ne dit pas la fin. Réparable sans affaiblir quoi
  que ce soit — l'assertion (`ETAT_ANNOTER`) ne change pas, seule l'attente change de forme.
- *Dans l'application* : un enseignant qui clique « Consulter » puis l'onglet « Liste » dans
  la seconde qui suit est ramené sur la copie. Réel, reproductible, jamais vécu par
  Grégoire, conséquence faible. **Issue : commenter et oublier** (règle du 24 août : ni vécu,
  ni bloquant) — décrit dans la spec ; et la consigne interdit `js/` dans ce lot.

## 5 · Inventaire daté des vertes au second essai depuis le 1er sept. `[lu]`

Source : `RELAIS.md`, `SESSION.md`, `BACKLOG.md`. La colonne « cause » distingue ce qui est
mesuré de ce qui ne l'est pas ; « non lue » veut dire que le rapport du verdict n'a pas été
conservé.

| Date | Spec(s) | Charge connue | Cause |
|---|---|---|---|
| 1er sept., soir | `triptyque-seme-produit-une-note` (#685) | inconnue | non lue ; hypothèse des 700 ms **non reproduite** le 19 (20/20, dont 10 sous charge 32–83) |
| ≈ 11 sept. (CI Linux) | `lot4-gabarit-algo-cartes:81`, `profil-travaux-761` (#833) | runner GitHub | non lue ; 761 réécrite au lot 4 ; job tué (`exit 143`) |
| ≈ 12 sept. | une « instable connue » non nommée | inconnue | non lue |
| sept. (non daté au relais) | huit specs de Conception | Cowork ouvert | non lue |
| 5 sept., soir (verdict local) | `cartouches-import-trimestre`, `grilles-suppression-orphelinage`, `planif-toolbar`, `source-unique-codes` | « machine chargée » | non lue ; pour `planif-toolbar`, le 19 : budget de 30 s crevé sous charge `[mesuré]` |
| 5 sept., soir (CI, run 34001941420) | `planif-objectifs-espacement-157` | runner GitHub | lue : 793,98 px contre 800,17 — une mesure de rendu, pas une attente |
| 17 sept. | `liste-651`, `texte-troue 3` | 15 | `liste-651` rejouée 15/15 verte ce jour-là ; le 19 : course `[mesuré]` |
| 17 sept., soir | `planif-toolbar` (push bloqué) | inconnue | non lue |
| 17–18 sept. | `registre-longitudinal-915 › R1` | inconnue | non lue ; suspect nommé : attente fixe de 500 ms sur le recalcul des indices |
| 18 sept., matin | cinq specs en début d'alphabet (`bibliotheques-import-persistance`, `carac-476-volet2-duplication`, `cartouches-dropdown-selection`, `comparateur-pratiques-rendu`, `cours-actif-hors-bibliotheque-916`) | 8,8 juste après | non lue ; toutes vertes du premier coup 20 min plus tard, même SHA |
| 18 sept. | `cours-neuf-saisie-presences` (rouge deux fois), `lot2-analytique-points` | **48** au lancement | non lue (rapport effacé) ; même SHA vert 3/3 à charge 3 |
| 18 sept., 13 h 20 / 14 h 20 / 15 h 20 | `liste-651` ×3 | 25–33, puis basse | course `[mesuré le 19]` — cohérent avec une occurrence à charge basse |
| 18 sept., ≈ 17 h 15 – 18 h 27 | `accueil-640`, `portes-relais-cadre`, `portes-terrain-vague3`, `pratiques-898`, `profil-871`, `texte-troue-paliers` | **93** (Time Machine) | non lue ; `profil-871` seule ×5 à charge 42 : 4 vertes, 1 blocage de 180 s dans `activerModeDemo`, aucune assertion — même famille que le budget crevé |

**Ce que l'inventaire montre.** Sur treize épisodes, une seule spec revient à charge basse :
`liste-651`. Tous les épisodes à plusieurs specs « sans rapport entre elles » portent une
charge connue élevée ou un contexte de charge (Cowork ouvert, Vitest d'une autre session,
Time Machine). Donnée du jour qui va dans le même sens : **le Vitest complet, à lui seul,
porte la charge 1 min à 78** (mesuré à 7 h 52 pendant l'audit de début de session).

⚠ Rattachements au registre : `liste-651` est rangée sous **#685** dans les relais, mais
#685 nomme `triptyque` et porte une hypothèse (700 ms) qui ne s'applique pas à `liste-651`.
#833 est la CI WebKit Linux. `liste-651` mérite sa propre fiche. Corrigé au registre le 19 sept. (note sous #685).

## 6 · Ce que ça change au lot — la décision demandée par le §7

Les cas d'arrêt du §4 de la consigne s'appliquent à deux specs sur trois (10/10 avant toute
modification : « ne la touche pas, inscris la mesure »). Restent deux suites possibles, qui
ne s'excluent pas :

- **A — la garde de charge de `pousser.sh`** (le lot que le §7 annonce). Le script refuse de
  lancer le verdict au-dessus d'un seuil, attend, et s'il plafonne il NE LANCE PAS. Couvre
  la famille de loin la plus nombreuse de l'inventaire. Seuil à fixer sur mesure : vert
  jusqu'à 83 pour une spec courte, rouge à 125 pour une spec de 40 s.
- **B — `liste-651` seule** : faire attendre à la spec la vraie fin de la chaîne
  « Consulter », 10 rejeux avant (fait : 9/10) et après ; inscrire la fiche du retour forcé
  sur « Annoter » côté application. Une spec, bien sous le plafond de six.

Non proposé : réécrire les attentes de `planif-toolbar` et de `triptyque`. La mesure ne le
justifie pas, et la consigne l'interdit dans ce cas.

## 7 · Ce qui a été fait ensuite, le même jour — B, `liste-651`

Décidé par Claude Code et dit à Grégoire : B entre dans la consigne du jour (une spec, cause dans
la spec) ; A en sort (c'est `scripts/pousser.sh`) et reste proposé comme lot suivant.

`consulterDepuisLaListe` attend désormais que `modifierEvaluationParId` ait été APPELÉE par ce
« Consulter »-ci, puis qu'elle ait FINI (`_modifierEvaluationEnCours` retombe dans son `finally`).
Aucune attente fixe ajoutée ni allongée, aucune assertion changée, `js/` intact.

| | Passes vertes (`--retries=0`, repos) | Essais verts |
|---|---|---|
| AVANT | 9/10 (charge 2,4–3,4) | 29/30 |
| APRÈS | 10/10 (charge 2,2–3,5) | 30/30 |
| APRÈS, « le trajet direct » seul, `--repeat-each=30` | — | 30/30 |

Avec un taux d'échec de 1 sur 10 avant, 40 verts de suite sur le trajet direct ont ≈ 1,5 % de chances
d'arriver par hasard : le compte soutient la lecture, il ne la prouve pas seul — c'est la sonde du §4
qui nomme le mécanisme. **Contre-épreuve** : compteur d'appels muté (l'incrément retiré) ⮕ rouge,
`TimeoutError` sur la nouvelle attente ; spec restaurée par copie, empreinte vérifiée.

Dette nommée, laissée en place : les trois attentes fixes maison de la spec (400 ms, 1 500 ms ×2)
gardent leur commentaire d'origine (« une fois TOUTES les minuteries de l'ouverture passées ») —
aucune n'est en cause dans le rouge mesuré.

## 7 bis · A, la garde de charge — posée le même matin

Décision de Grégoire relayée par Cowork (option 2 : avant tout push, pour qu'un seul verdict juge la
spec et la garde). `scripts/garde-charge.sh` + seuils nommés en tête de `scripts/pousser.sh` : seuil 8,
plafond 900 s, relevé toutes les 30 s. Preuve : sentinelle `tests/unit/sentinelle-685-garde-de-charge.test.js` (12 essais, 4 mutations / 4 rouges : plafond qui lance quand même, refus ignoré par `pousser.sh`, borne large, illisible pris pour un refus) ; et le VRAI `pousser.sh` sous charge fabriquée (32 brûleurs, plafond raccourci à 60 s, push en `--dry-run`) : quatre relevés de 34,65 à 60,71, puis « Verdict NON LANCÉ […] charge 75.40 après 60 s d'attente », code 3, aucun processus Playwright, jeton de verdict et `origin/main` inchangés.
Décidé seul : une charge illisible n'est pas un refus (dit en une ligne, la garde ne juge pas).

## 8 · Dispositions

| Constat | Disposition |
|---|---|
| `triptyque` non reproduite (20/20) | *inscrit* — #685, note du 19 sept. ; spec non touchée |
| `planif-toolbar` : budget de 30 s crevé sous charge | *inscrit* — #685, note du 19 sept. ; spec non touchée ; couvert par la garde (§7 bis) |
| `liste-651` : course spec / chaîne « Consulter » | *inscrit et corrigé* — #685 (rattachement corrigé), spec réparée |
| Retour forcé sur « Annoter » dans la seconde qui suit « Consulter » (application) | *refusé* — jamais vécu par Grégoire, ne bloque rien (règle du 24 août) ; décrit dans la spec |
| Aucune garde de charge dans `pousser.sh` | *inscrit et corrigé* — #685 ; garde posée le 19 (§7 bis) |
| #833 (CI WebKit Linux) | *relu* — rattachement juste, aucune de ses specs rejouée ici |
| Charge disque (Time Machine) non éprouvée | *refusé pour l'instant* — aucune mesure ne la demande ; nommée NON ÉPROUVÉE en tête de `pousser.sh` ; à reprendre si la garde ne suffit pas |
