# Relecture croisée – lot S3 de #941 (1.159.1)

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `lot-941-s3-ce-que-la-synthese-tait` = `3d08d222`.

## 1 · Verdict : code lu, VERT sous réserve d'UNE mesure sur les données de Grégoire avant le push

Relecture par lecture ciblée de `jetonsDeclares` (`evaluation-jetons.js`) et de ses lecteurs ; pas de mutation de Cowork cette fois (tes sept mutations font foi), l'attention portée sur le risque ci-dessous.

## 2 · Le risque – ce que tu as toi-même signalé, et qui pèse plus qu'une note

`jetonsDeclares` ne rend des jetons que si `obtenirConfigJetonsPratique()` reconnaît un bloc actif sur la pratique active (`configuration.jetons` → `config.jetons` → `jetons`, via `_normaliserConfigJetons`), ou si `modalitesEvaluation.configurationJetons` existe. **Indice** : la capture PDF de Grégoire de ce matin montrait « Délai 0 / 2 · Reprise 0 / 2 · Reprise ciblée 0 / 2 » – exactement `jetonsDefaut` (2 / 2 / 2, reprise ciblée active). Or #854 a mesuré qu'une pratique créée par l'assistant peut porter un bloc de jetons de forme non reconnue (→ `null` → défauts). Si c'est son cas, **S3 retire le bloc « Jetons utilisés » de la rétroaction de ses élèves**, alors qu'il offre des jetons.

**Mesure demandée à Grégoire, lecture seule, sur la version en ligne** (console du navigateur, dans l'application) :
`obtenirConfigJetonsPratique()` et `(db.getSync(cle('modalitesEvaluation'), null) || {}).configurationJetons`
- le premier rend un objet avec `actif: true` → S3 ne change rien pour lui : **fusionne**.
- les deux rendent `null` / `undefined` → **ne pousse pas** : ses jetons n'existent que par défaut ; la décision (déclarer ses jetons dans sa pratique, ou autre) lui revient, et S3 attend.

## 3 · Mots

La ligne ajoutée à « Nouvelles » 1.159 : validée (voir sa réponse). Le ruban sans étiquette vide pour l'objectif et la tâche aussi : pris, même défaut.
