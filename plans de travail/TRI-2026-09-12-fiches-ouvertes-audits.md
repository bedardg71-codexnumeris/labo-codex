# Tri des fiches ouvertes des audits — 12 septembre 2026, soir

> Demandé par Grégoire (option A de l'état des lieux du soir). Exécuté par Claude Code, en lecture du code
> et du BACKLOG ; aucun fichier de `js/` touché.
> **Une seule question par fiche** : « empêche-t-elle un des huit énoncés d'`OBJECTIF-COHORTE-1.md` ? »
> Les huit sont verts depuis le 3 septembre (`OU-EN-EST-ON.md`, section « PAS FAIT » : « Rien »). La question
> devient donc : **peut-elle en refaire rougir un ?**
> Ce tri remplace, pour les 18 fiches du 21 août, la priorité « Maintenant » donnée au triage de ce jour-là.

## Périmètre

Les **37 fiches ouvertes** issues des audits des quatre onglets :

| Source | Fiches ouvertes |
|---|---|
| Triage des audits Cadre et Conception du 20 août (`TRIAGE-audits-2026-08-21.md`) | #463, #465, #467, #469-#481, #483, #484 (18) |
| Plan du modèle d'objets de Conception, 30 août | #622, #624, #627, #628, #629 (5) |
| Audit du moteur d'évaluation, 5 septembre | #700-#705 (6) |
| Audit de la pratique de notation, 5 septembre | #707, #710-#716 (8) |

## Résultat

| Verdict | Fiches | Nombre |
|---|---|---|
| **Périmée** — déjà corrigée, fiche cochée | #473 | 1 |
| **Hors des huit, gardée avant les partages de la cohorte** (sécurité) | #467 | 1 |
| **Après la cohorte** — n'empêche aucun des huit | les 35 autres | 35 |

**Aucune fiche ne peut refaire rougir un énoncé**, d'après ce qui a été mesuré. Cases ouvertes du BACKLOG : 243 → 242.

## Ce qui a été mesuré au code ce soir

Quatre fiches touchent un énoncé ou la sécurité : elles ont été vérifiées dans le code, pas seulement lues.

**#473 (énoncé 1, les présences) — périmée.** La 2ᵉ séance d'un même jour n'est plus perdue :
`fusionnerSeancesHoraires` (`js/horaire-fusion.js:46`) dédoublonne par (jour, heure), et elle est appelée aux
deux écritures de `horaireHebdo` (`js/trimestre-v2-horaires.js:943` et `:1007`, commentaire « CT-04 (21 août
2026) »). Un test existe : `tests/unit/horaire-fusion-CT04.test.js`. Corrigé avec L4 (#466) le 21 août ; la fiche
n'avait pas suivi. ⚠ Test présent, pas cassé exprès ce soir.

**#467 (sécurité, hors des huit) — gardée.** Deux constats sont encore vivants :
- **CO-14** : le nom d'une échelle et celui d'une pratique entrent bruts dans le `innerHTML` des barres
  latérales (`js/echelles.js:2373` `${nomEchelle}`, `js/pratiques-gestion.js:149` `${nomPratique}`) ;
- **CO-39** : les imports JSON de cartouches et de productions font `JSON.parse` puis fusionnent, sans
  `assainirObjet` (`js/cartouches.js:2032`, `:2971`, `:4060` ; `js/productions-import-export.js:196`, `:314`).

CT-09 et CT-29 (Cadre), eux, sont traités : commentaires dans huit fichiers, module `js/securite-echappement.js`.
**Motif de la garde** : avec la cohorte, grilles, échelles et cartouches passent d'un enseignant à l'autre ; un
nom reçu arrive dans le `innerHTML` du destinataire. La CSP bloque les scripts, pas l'injection de HTML. C'est la
règle n° 1 de `CLAUDE.md`. **Supposition nommée** : je n'ai pas vérifié si `assainirObjet`, sur le chemin `.lcz`,
retire le HTML d'un nom. Première étape du lot : le mesurer ; si oui, le risque se réduit aux imports JSON.
Décision de classement prise par Claude Code, renversable par Grégoire.

**#483 (énoncé 5, la pondération) — après la cohorte.** Mesurée le 5 septembre (banc D1-D3 de
`Rapports/AUDIT-pratique-de-notation-2026-09-05.md`, constat D-1) et **tenue** par Grégoire ce jour-là. Pas
rouverte. Un fait à garder en tête : en sommative, une production pondérée à 0 (une formative, par exemple)
dont l'évaluation est verrouillée compte **au poids 1**. `evaluationEntreDansLaNote`
(`js/pratiques/pratique-registre.js`) ne lit pas la pondération, et le repli `|| 1` est à
`js/pratiques/pratique-sommative.js:120`, `:169`, `:333`. Le récit de calcul le dit (« poids 1 % ») ; l'écran
principal, non.

**#624 (énoncé 8, les suppressions) — après la cohorte.** Son texte donnait #648 et #649 pour ouverts : ils sont
livrés (3 et 2 septembre), et l'énoncé 8 tient. La fiche est corrigée. Le reste (`ECHELLE_DEMO` résiduelles,
cause de #542, chemins nus côté échelles, homonymes de `donnees-v2.js`) n'empêche aucun énoncé.

## Après la cohorte — les 35, avec leur motif

| Fiches | Motif |
|---|---|
| #700-#705, #710-#716 | Déjà « à trancher après le 14 » depuis le 5 septembre. Rien ne change. #701 et #704 sont des règles pédagogiques (Grégoire). |
| #707 | « Programme : » vide au profil — symptôme vécu, hors des huit. Petit. |
| #463 | Suppressions gardées, 7 familles. L'énoncé 8 tient (#560, #647-#649 livrés). |
| #465 | Moteur des pratiques « configuré ≠ calculé ». Recoupe #710-#713 : à fusionner quand on y viendra. |
| #469, #470, #471 | Code mort, vitesse, docs — dette invisible à l'usage (hors ligne, `OBJECTIF-COHORTE-1.md`). |
| #472, #474, #475, #477, #479, #480, #481 | Cadre et Conception : confort ou robustesse, aucun des huit parcours bloqué d'après la fiche. |
| #476 | Le socle est sur `main` (deux moteurs de duplication, convergence D0). Restent : les 12 autres voies, le script de réparation à passer par Grégoire, trois portes. |
| #478 | Micro-UX de la rentrée — premier lancement à froid, hors ligne par décision de Grégoire. |
| #483 | Voir plus haut. |
| #484 | Portes de l'assistant — confort. |
| #622 | Attend le test manuel T4.3 et la **levée du moratoire D1, décision de Grégoire**. L'archivage ne sert qu'en fin de trimestre. |
| #624 | Voir plus haut. |
| #627, #628, #629 | Remaps d'import de la Réserve, legacy, mineurs — hors des huit. |

## Ce que ce tri ne fait pas

- Les **31 autres fiches** ont été classées sur la lecture de leur texte, pas remesurées au code.
- L'audit **Conception gabarits du 25 août** (`Rapports/AUDIT-conception-gabarits-2026-08-25.md`) n'a toujours
  **aucune disposition** dans son fichier : il reste un audit sans suite, à fermer séparément.
- Les audits Cadre et Conception du 20 août ont leurs dispositions dans `TRIAGE-audits-2026-08-21.md` (27/27),
  pas dans leurs propres fichiers.
