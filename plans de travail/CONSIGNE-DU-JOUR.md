# Consigne du jour – chantier de l'enregistrement, lot 7 : « Corriger le DA… » (#976)

> Écrite par Cowork le 8 octobre 2026 à 14 h 18 (Toronto, mesurée par `date`). Remplace la consigne du petit lot #1042, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-08-verrou-exemple-1042.md`.

## Où on en est

1.190.1 est en ligne (`4cca460e`, Netlify à 11 h 22) ; porte de #1042 passée par Grégoire à 14 h 16. Dernier lot du chantier de l'enregistrement : plan `PLAN-2026-10-07-chantier-enregistrement-suite.md`, **lot 7**. Décisions : `DECISIONS-2026-10-05-chantier-enregistrement.md`, § #976 (forme, 5 oct. ; **portée, 8 oct. : le trimestre actif seulement**). Lis-les d'abord.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md` et `SUIVI-BUGS.md`, et à faire la release sur `main` local. **Pas de push avant la relecture de Cowork** : ce lot déplace des données d'élèves, la relecture croisée est obligatoire (règle 2 de `PROTOCOLE.md`).

## 0 · Avant tout

Si le résultat de la sonde de Mathieu (#1038) est arrivé dans `Retours des testeurs/`, arrête-toi et dis-le en une ligne.

## 1 · Mesurer d'abord (sans écrire)

Inventaire **par clé** de tout ce qui porte un DA dans le trimestre actif : évaluations, présences, indices (A, C, P), portfolios, interventions et RàI, rencontres, dépistage, suivi, jetons, copies (magasin `fichiers`, index `etudiantDA`), correspondance d'anonymisation, tout autre. Pour chaque clé : son écrivain propriétaire (`docs/DATA-OWNERSHIP.md`), et si le DA y est une clé d'objet, un champ, ou une partie de nom de fichier. Écris l'inventaire dans `plans de travail/MESURE-2026-10-08-976-cles-qui-portent-un-DA.md`. ⚠ Une clé globale (non préfixée par le trimestre) qui porte un DA : **ne la touche pas**, signale-la dans ton rapport (la portée est le trimestre actif).

## 2 · Le geste, selon la décision

- Un bouton « Corriger le DA… » dans la fiche de l'étudiant·e (Cadre › Groupe d'étudiant·es), là où le DA est en lecture seule depuis 1.166.0.
- Sa fenêtre : l'ancien et le nouveau DA ; **ce qui sera déplacé, compté pour de vrai** (évaluations, présences, copies, résultats) ; la portée (« dans ce trimestre seulement »).
- Refus : un DA qui n'a pas 7 chiffres ; un DA déjà porté par un·e autre étudiant·e du trimestre.
- **Le codex proposé avant** (règle du 1er oct. pour ce qui touche les élèves ; même mécanisme que les suppressions de 1.176.0).
- **Rien ne reste sous l'ancien DA ; rien n'est effacé** : on déplace, on ne copie pas puis efface. Ordre : passe à blanc qui compte → écriture → vérification qui recompte sous le nouveau DA et confirme zéro sous l'ancien. Un échec en cours de route ne doit laisser **ni doublon ni perte** (dis comment tu le garantis ; si une écriture partielle reste possible, arrête-toi et dis-le).
- Le témoin commun dit l'issue (« Enregistré », ou « Non enregistré » et pourquoi).

## 3 · Les mots

Propose-les dans ton rapport, à part, **non écrits ailleurs que dans le code de la branche** : libellé du bouton, titre et texte de la fenêtre, les deux refus, le bouton de confirmation, la ligne des Nouvelles. Ils passent par Grégoire avant la release.

## 4 · Tests

Bancs avec break-test : un DA corrigé garde évaluations, présences, indices et copies (même nombre avant/après, zéro sous l'ancien) ; les deux refus ; un autre trimestre n'est pas touché ; un échec simulé au milieu ne laisse ni doublon ni perte. Spec WebKit sur le pack démo (noms et DA manifestement fictifs). Specs voisins, Vitest complet.

## 5 · Puis arrête-toi

Commits séparés, **pas de release avant les mots** : rapport à Grégoire, relecture de Cowork, mots, release minor, verdict (Chrome et Safari fermés), push.

## Ton rapport à Grégoire

En gestes d'utilisateur, numéros entre parenthèses en fin de ligne. Le geste à l'écran **en démo** (jamais sur ses vraies données). Ce que tu as supposé, une ligne par supposition.

## Suite – relecture de #976 et décisions de Grégoire (8 oct. 2026, 14 h 50, Toronto)

**Relecture de `11bc90ad` : rien ne bloque.** Lus : `js/correction-da.js` en entier (familles, `cleDObjet` et ses conflits, passe à blanc, refus, marque, reprise, recompte avant la fiche, fiche en dernier), la mesure `MESURE-2026-10-08-976-…`. Tests non relancés par Cowork.

**Décision 1 – les trois clés globales suivent** (« oui » ; consignée dans `DECISIONS-2026-10-05-chantier-enregistrement.md`, § #976). `registreLongitudinal` (`eleves[da]`), `jetonsEtudiants` (`[da]`) et `jugementsDenotation` (`[…][da]`) passent sous le nouveau DA pour l'étudiant·e corrigé·e, **avec les mêmes garanties** que les clés du trimestre : écriture d'un bloc par clé, conflit (les deux DA présents) = refus sans écriture, comptées dans la passe à blanc et dans le recompte, reprise possible. Le refus « L'ancien DA figure aussi dans … » disparaît. Banc avec break-test (un jeton, un jugement de dénotation, une entrée longitudinale suivent ; un conflit refuse sans rien écrire ; un échec simulé sur une globale se reprend). Inscris au backlog la trouvaille « jetons et jugements de dénotation rangés en global alors qu'ils appartiennent à un trimestre », sans la corriger.

**Décision 2 – les mots, validés tels quels sauf :**
- Phrase d'aide sous le DA (`index.html`, `v2-etudiantDAAide`) : « Le DA relie les évaluations et les présences de l'étudiant·e. Pour corriger une coquille, utilise « Corriger le DA… » : ses données suivent. »
- La liste de la fenêtre compte aussi, quand il y en a : les jetons, les jugements de dénotation, l'entrée au suivi longitudinal (libellés au même modèle que les autres lignes, accordés).
- Nouvelles, entrée 1.191, couleur vert, avec le commentaire de provenance : titre « Corriger un DA mal tapé » ; ligne : « Une coquille dans un DA se corrige maintenant depuis la fiche de l'étudiant·e (Cadre › Groupe d'étudiant·es, « Corriger le DA… ») : ses évaluations, présences, copies et résultats du trimestre suivent le nouveau DA. »
- Tous les autres mots de ton rapport : tels quels.

Typographie : guillemets français, espaces insécables (`&nbsp;`) dans le changelog.

**Puis** : release minor par `scripts/release.mjs`, commits séparés, relais. **Arrête-toi avant le verdict** : Cowork relit le volet des globales (il déplace des données d'élèves). Rapport en gestes d'utilisateur, avec le geste en démo (« DEMO004 » vers 7654321).
