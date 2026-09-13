# Consigne du jour – La suggestion d'objectif ne nomme plus une lettre d'échelle (#551, moitié affichée)

> **Écrite par Cowork le dimanche 13 septembre 2026, 14 h 05 (Toronto).** Elle remplace la consigne #847, exécutée et releasée
> en `1.140.3`, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-13-847-exemples-gris.md`.
> **Les trois textes sont approuvés par Grégoire** (13 sept., 14 h). Ce sont des mots qu'un collègue lit **et qui s'enregistrent
> dans le dossier de son élève** – pas un exemple gris. Vingt collègues découvrent l'application **mardi 15**.
>
> ⚠ **CETTE CONSIGNE RENVERSE UNE INTERDICTION DE LA PRÉCÉDENTE.** La consigne #847 disait : « ⛔ Ne touche à aucune des
> assertions `'Amener Structure au seuil M (75%)'` / `'(66%)'` / `'(64%)'` : ce sont des SORTIES calculées. Si l'une d'elles
> bouge, RECULER. » **Elle valait pour ce lot-là, où le calcul ne devait pas bouger.** Ici, ce sont précisément ces sorties
> qu'on change. Les assertions doivent suivre, dans le même commit. Ne recule pas.

---

## 0 · Ce que ce lot livre

Le bouton « Suggérer » d'une intervention écrit aujourd'hui « Amener Structure **au seuil D** (64%) ». D et M sont les lettres de
l'échelle de Grégoire. Après ce lot, le texte dit le pourcentage sans nommer de niveau. **Aucun calcul ne change** : les mêmes
seuils, les mêmes branches, les mêmes nombres. **Release patch.**

## 1 · Ce qui est mesuré (Cowork, le 13 sept. sur `325dabcd`)

`suggererObjectifIntervention` (`js/interventions.js:1358-1368`) choisit entre trois phrases selon `scorePlusFaible` :

| aujourd'hui | après |
|---|---|
| `Amener <critère> au seuil D (64%)` | `Amener <critère> à 64 %` |
| `Amener <critère> au seuil M (75%)` | `Amener <critère> à 75 %` |
| `Stabiliser <critère> au-dessus du seuil M (75%)` | `Stabiliser <critère> au-dessus de 75 %` |

⛔ **N'invente pas de reformulation** : ces trois textes sont ceux que Grégoire a approuvés, au caractère près, y compris
l'espace avant le `%`.

## 2 · Portée

`js/interventions.js`, les trois lignes de `suggestion = …`, et rien d'autre dans `js/`.
⛔ Les seuils gardent leurs noms `idme.*`, leurs valeurs et leur calibrage : le renommage interne est **parqué** (réponse de
Grégoire, 13 sept. : il ne sert plus à rien une fois les lettres retirées de l'écran).
⛔ **Ne va PAS chercher le niveau dans l'échelle de l'utilisateur.** C'était ma première proposition ; la mesure l'a réfutée –
la grille de dépistage dit les CRITÈRES, pas l'échelle, et l'éditeur de grille n'écrit jamais d'`echelleId` (mesuré sur les trois
trimestres réels pendant le chantier des cartouches, `js/cartouches.js:438-450`). Il n'y a pas de source fiable ici. Parqué aussi.

## 3 · Stock – nommer, ne rien réparer

Les objectifs **déjà enregistrés** portent l'ancienne phrase, lettre comprise. ⛔ **Aucune réécriture, aucune proposition d'en
faire une** : ce sont les mots que Grégoire a mis dans le dossier de ses élèves. Dire dans le journal du commit combien il en
reste si c'est mesurable sans écrire, sinon dire qu'on ne l'a pas mesuré.

## 4 · LE PIÈGE – quatre assertions figent les anciennes sorties

⚠⚠ Elles rougiront toutes, et c'est attendu. **Elles se mettent à jour dans le même commit** :

- `tests/unit/sentinelle-746-551-interventions-suivent-le-groupe.test.js` – `:111`, `:112`, `:115`, `:118` (dont
  `'Stabiliser Structure au-dessus du seuil M (0%)'`, le cas du seuil à zéro).
- `tests/unit/sentinelle-lot-5-interventions-cadrage-11.test.js` – `:169` et `:176`.

⚠ **Le bloc B de `sentinelle-lot-5-interventions-cadrage-11` ne vérifie PAS un libellé : il vérifie que le bilan et la suggestion
bougent ENSEMBLE quand on déplace un seuil** (`:165`, « 0,645 → D 65 % avant ET après »). Ce couplage passait par la lettre.
**Il doit continuer de se vérifier, par le nombre.** Si tu te contentes de remplacer la chaîne attendue, tu gardes le cas mais tu
perds ce qu'il prouvait : dis-le, et refais-le tenir sur le pourcentage.

⛔ **NE TOUCHE PAS** à `tests/unit/sentinelle-audit-aide-lot-E-exemples-restent-des-exemples.test.js:95`
(`expect(AIDE).not.toContain('Amener Structure au seuil D')`) : elle porte sur l'AIDE, pas sur la sortie, et elle doit rester vraie.

## 5 · La preuve

- **Mutation qui prouve** : remettre l'une des trois anciennes phrases ⮕ rouge, en nommant laquelle.
- **Contre-épreuve de non-régression du calcul** : les seuils lus et les branches ne bougent pas. Le cas du seuil à zéro
  (`:118`) doit continuer de distinguer le correctif de l'ancien code – s'il devient vert sous l'ancienne forme `|| 0.75`,
  le lot a défait #551 : **RECULER**.
- **Contre-épreuve d'exhaustivité** : après le lot, `grep -rn "au seuil D\|au seuil M" js/` ne rend plus rien.
- ⛔ Un essai qui reste vert sous sa mutation ne compte pas : dis lequel et pourquoi.

Vitest complet. Puis `scripts/release.mjs patch`.

## 6 · Écritures de backlog, dans le même commit

- **#551** reste OUVERTE, et sa fiche reçoit la réponse de Grégoire du 13 sept. : *la moitié affichée est livrée (la suggestion ne
  nomme plus de lettre d'échelle) ; le renommage interne des trois seuils est PARQUÉ – il ne sert plus à rien une fois les lettres
  retirées de l'écran ; nommer le niveau dans l'échelle de chacun est parqué aussi, faute de source fiable ici, et se rouvre avec
  la question de l'étiquetage SOLO.*
- **#742** reçoit son verrou, réponse de Grégoire du 13 sept. (option C) : *ces bornes restent en dur et documentées comme bornes
  d'alerte du projet. Elles ne deviennent réglables que si un usage réel le réclame – les siens à partir d'octobre, ou ceux d'un
  collègue. Motif : trois seuils réglables existent déjà et n'ont encore servi à personne.* **La fiche reste ouverte, datée comme
  #836.**
- **#857 EST UN DOUBLON DE #553** – erreur de Cowork, inscrite ce midi sans voir que #553 portait déjà le même constat depuis le
  27 août, avec une mesure du 31 août qui va plus loin (les normalisations sont déjà identiques ; le désaccord est entre deux
  chaînes source ; un diagnostic est dû avant tout correctif). **Fusionner #857 dans #553** : reporter dans #553 les numéros de
  ligne à jour (`js/interventions.js:1088`, `:1289`, `:1340` en 1.140.3 – ceux de #553 datent d'août), puis **cocher #857 en
  renvoyant à #553**, sans reprendre son numéro.

## 7 · Ce qu'on annonce

**Une entrée « Nouvelles »**, en un item : la suggestion d'objectif dit maintenant le pourcentage visé sans nommer de niveau.
⮕ Contrairement à #847, ce texte s'enregistre dans les données : ça se voit, donc ça s'annonce.

## 8 · Livraison

**RELECTURE CROISÉE DE COWORK AVANT LA RELEASE** ; verdict Playwright Cowork fermé (PROTOCOLE règle 8).
⚠ **#657 passe AVANT** : il est commité (`325dabcd`) et attend sa release. Deux bumps concurrents se marchent dessus.
