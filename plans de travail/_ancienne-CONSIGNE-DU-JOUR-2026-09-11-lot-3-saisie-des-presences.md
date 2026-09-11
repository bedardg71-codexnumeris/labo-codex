# Consigne du jour — Saisie des présences : une date verrouillée ne l'est que pour ce groupe et ce trimestre, les préférences ne fuient plus, la démo ne dit plus « Configuration incomplète » (lot 3 du cadrage 11)

> **Écrite le 11 septembre 2026 à 17 h 07 (Toronto, `TZ=America/Toronto date`) par Cowork, À FROID, pour la prochaine session Claude
> Code** (une instance neuve : la précédente a été compactée). Application au moment de l'écriture : **`1.132.0`**, build `0911-1547`,
> `main` = `origin/main` = `8a6ddc92`. Elle remplace la consigne du lot 2 (livrée en `1.132.0`, porte relevée 10/10 dont un vrai abandon),
> archivée à côté sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-lot-2-liste-des-etudiants.md`.
>
> ⚠ **Tu es une session neuve. D'abord le rituel** : `OU-EN-EST-ON.md` (tête), `PROTOCOLE.md`, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`
> (l'état mesuré du 11 à 16 h 30 et le MANDAT), puis le subagent `audit-debut-session`. **Remesure** : `git --no-optional-locks log
> --oneline -5`, `cat version.json`, `TZ=America/Toronto date`. ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** L'audit qui
> fonde ce lot date du 6 (`1.123.5`) ; les numéros de ligne ci-dessous sont remesurés le 11 à 17 h sur `1.132.0`.
>
> **Préalables** : `plans de travail/CADRAGE-2026-09-11-onglet-suivi-lecture-du-depistage.md` (§ 7 : la décision de Grégoire, les sept
> lots, deux livrés) ; `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md` **§ 3 seulement** (l. 176-222 : S-1 à S-7, le tableau des
> gestes) ; `BACKLOG.md`, `#736` et `#747` (grep ciblé — **cités, pas rejugés** : ce sont des règles, après le 14). Le patron du lot 1
> pour une clé par trimestre et par groupe-cours : `cleEtudiantsSuivis` dans `js/tableau-bord-apercu.js` (semis d'une clé nue, jamais
> réécrite). Skills : `labo-codex`, `integrite-globaux`, `verification-adverse` § 4, `portes-terrain`.

---

## AVANT TOUT — un commit documentaire séparé

Modifiés, non commis, de Cowork : la porte du lot 2 (relevée 10/10, note de 17 h 04), l'entrée 10 de `00-CADRAGES-OUVERTS.md`,
`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` (MANDAT réécrit), `CONSIGNE-DEMARRAGE-COWORK.md`, l'archivage de la consigne du lot 2, la
présente. **Commets-les d'abord, seuls, `git add` ciblé.** Le `D` sur la capture du 9 (à Grégoire) et les `Formation/*.html` restent hors
de tes commits.

---

## 0 · CE QUE CE LOT CHANGE POUR GRÉGOIRE ET SES COLLÈGUES

1. **Une date verrouillée ne l'est que pour ce groupe-cours et ce trimestre.** Aujourd'hui `datesVerrouillees` est une clé **nue**
   (`saisie-presences.js:718`, `:726-738`) : le 8 septembre verrouillé dans le groupe A l'est dans le groupe B, et le restera l'an
   prochain. Grégoire a deux groupes cet automne.
2. **Les préférences de l'écran (date, groupe, tri, recherche) ne fuient plus d'un trimestre à l'autre** : quatre clés nues
   (`:67-69`, `:926-932`, `:998`, `:1916`).
3. **La démonstration n'ouvre plus sur « Configuration incomplète — Aucune séance n'est rattachée à l'horaire de ce cours »** alors
   que l'horaire démo porte deux séances : le bandeau `#alerteFormatHoraire` est évalué **une fois, au démarrage** (`:55` → `:880-899`).
   Vingt collègues ouvriront la démo le 14.

Rien de ce lot n'écrit dans les données de personne, sauf un semis nommé (§ A.3), réversible.

---

## 1 · LE LOT — `js/saisie-presences.js`, `js/donnees-v2.js`, `js/trimestres.js`

### A. Les dates verrouillées par trimestre et par groupe-cours (S-4)
1. La clé devient composée, **même patron que `cleEtudiantsSuivis`** (lot 1) : `cle('datesVerrouillees') + '_gc_' + <id>`, inscrite à
   `CLES_NAMESPACEES` (`trimestres.js`) avec le même commentaire que `etudiantsSuivis` (les boucles de copie ne voient pas les clés
   suffixées — dis-le), et dans `docs/DATA-OWNERSHIP.md`. **`donnees-v2.js:831`** déclare déjà `ns: true` pour cette clé : l'écran Données
   annonce une `<trim>_datesVerrouillees` que personne n'écrit — **aligne l'inventaire sur la clé réelle** (suffixée), comme `snapshots`.
2. **Le stock — tranché par Cowork, nommé, réversible** : à la première lecture d'un groupe-cours dont la clé n'existe pas, si la clé
   nue existe, **sa liste entière** devient celle du groupe (une date verrouillée l'était partout : on ne change rien au passé, on cesse
   de propager l'avenir). La clé nue **n'est ni effacée ni réécrite** ; inscris-la dans `scripts/diagnostic-353-cles-orphelines.js`.
   Une lecture qui écrit une fois : dis-le dans le code, daté.
3. `basculerVerrouillageDateActive` (`:745` → `:725`) sauvegarde d'abord la grille par `sauvegarderPresencesSansValidation` (`:787` →
   `db.setSync(clePresences)`), **une porte hors du mode anonymisation (`#736`)** : **ne la rejuge pas** — cite la fiche dans le code et
   passe. Le lot change la CLÉ du verrou, pas la porte.
4. **Sentinelle, break-testée** : (a) verrouiller le 8 septembre sous A ne verrouille pas sous B ; (b) le semis lit la clé nue sans
   l'écrire (valeur nue identique avant/après) ; (c) déverrouiller rend la liste vide, idempotent. Rouges montrés.

### B. Les préférences de l'écran par trimestre (S-6, première moitié)
`presences_date`, `presences_groupe`, `presences_tri`, `recherchePresences` passent sous `cle()` (par trimestre — **pas** par
groupe-cours : `presences_groupe` EST le choix de groupe). **Pas de semis** : ce sont des états d'écran, un trimestre neuf part à vide ;
les clés nues deviennent orphelines (diagnostic-353). Elles restent **hors de l'inventaire d'export** (`donnees-v2.js`) : un état
d'écran ne voyage pas — décision de Cowork, dis-la dans le code si tu la gardes. La garde « date restaurée seulement si ≤ aujourd'hui »
(`:73`) reste.

### C. Le bandeau « Configuration incomplète » dit vrai (S-6, seconde moitié)
Évaluer `#alerteFormatHoraire` **à chaque initialisation de la saisie** (`initialiserSaisiePresences:903`, et au changement de
groupe-cours / de trimestre / d'activation de la démo — mesure d'où viennent ces trois signaux : `grep -n "surEcriture\|demo" js/saisie-presences.js`),
et sur **les séances complètes du cours actif** (`genererSeancesCompletes`, `:907`), pas seulement `obtenirSeancesHoraire().length`.
En démo : le bandeau ne s'affiche pas, la date se pose sur la séance la plus proche ≤ aujourd'hui quand elle est vide (l'audit mesurait
« date vide, (0 étudiant·e), et ← Précédent la laisse vide » — remesure ce dernier point, `:1730`, avant de le corriger). Sentinelle :
horaire à deux séances + 30 séances complètes → aucun bandeau ; horaire vide → bandeau.

### D. Une garde qui n'efface pas les fiches des autres cours (S-3 — commenter, mais la garde vaut trois lignes)
`enregistrerPresences` (`:1490-1494` au 6, remesure) : `coursId === null` fait tomber la garde et remplace la fiche d'un autre cours par
une fiche `coursId: null`. Ajoute `if (!coursId) { console.warn(...); return; }` avant l'écriture — **rien de nouveau à l'écran**
(cas incohérent, jamais vu par Grégoire) ; un commentaire daté explique. Pas de notification : pas de mot neuf.

### E. Cité, pas touché
S-7 (`heures` écrit par le transfert de rattrapage, `interventions.js:1409-1416` ; les trois portes hors du mode) : `#747`, `#736`,
règles après le 14. S-1 fonctionne. S-5 livré (`#768`). Les 8 cibles tactiles sous 44 px : lot 7. La grille de 30 × 15 à 1024 px :
l'audit la dit lisible, fonctionne.

---

## 2 · CE QUI REMONTE À GRÉGOIRE — rien de neuf à lire, une décision de stock nommée
Aucun mot neuf : le bandeau garde son texte, les notifications existantes aussi. **La décision de stock du § A.2** (les dates
verrouillées d'avant deviennent celles de chaque groupe à sa première ouverture, l'ancienne liste intacte) est nommée dans la
conversation par Cowork ; **son silence vaut « tel quel »** (sa règle du 11). Si Grégoire veut plutôt repartir à vide par groupe, une
ligne à changer.

---

## 3 · LIVRER — `minor` (`1.133.0`) : le verrou par groupe est un comportement que les collègues verront
Changelog, une phrase : « Dans Suivi › Saisie des présences, verrouiller une date ne vaut plus que pour le groupe-cours et le trimestre
où tu le fais ; la démonstration n'annonce plus une configuration incomplète. » Rituel : `release.mjs`, Vitest depuis `tests/` (pas
`npm test`), relecture croisée sur le diff (règle 2 : un semis écrit une fois chez les gens), verdict, `pousser.sh`.

---

## 4 · LA PORTE TERRAIN — ses deux groupes réels ; le verrou se pose puis se retire
Tu écris le markdown (`plans de travail/PORTES-TERRAIN-2026-09-12-saisie-des-presences.md` — date du jour de la livraison) ; Cowork
publie l'artefact. Rangées sur `app.codexnumeris.org`, `1.133.0` en bas de page :

| # | Geste | Attendu |
|---|---|---|
| 1 | Groupe A, `Suivi › Saisie des présences`, une date passée **déjà saisie** : verrouille-la (cadenas) | verrouillée ; la grille de cette date en lecture seule |
| 2 | Groupe B, même date | **pas verrouillée** (avant : elle l'était) |
| 3 | Retour A : déverrouille la date | déverrouillée ; **ses présences sont intactes** (la même grille qu'avant le verrou) |
| 4 | `Labo › Démo`, active la démonstration, `Suivi › Saisie des présences` | **aucun** bandeau « Configuration incomplète » ; une date de séance est proposée, la grille montre les 20 élèves |
| 5 | Désactive la démo : la date et le tri de ta saisie réelle | ceux d'avant la démo (préférences par trimestre) |

⚠ **La rangée 1 écrit chez lui** (le verrou, et la sauvegarde de la grille qui l'accompagne — `#736`) : dis-le dans la porte, en §1,
avec « déverrouiller remet tout comme avant ». Choisir une date **déjà saisie** pour que la sauvegarde n'écrive que ce qui existe.

---

## 5 · TROUVAILLES ET RAPPORT
Trois issues de `CLAUDE.md`, nommées. Rapport : tête d'`OU-EN-EST-ON.md`, le rapport du 6 (§ 3 : lot 3 livré), l'ÉTAT MESURÉ de
`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, l'entrée 10 des cadrages ouverts (lot 3 livré, lot 4 suivant : les Profils individuels), la
présente consigne commise avec le lot. **Écris l'état mesuré à la clôture du lot, pas de la session** (règle 4).
