# Cadrage — Premier essai de `SKILL_verification_adverse` sur #338 (double test)

> **But de la session** : traiter #338 (retirer le vieil éditeur de pratique mort)
> **et**, dans le même mouvement, éprouver `SKILL_verification_adverse.md` en
> conditions réelles. Double test : on vérifie un item du backlog **et** on teste le
> skill lui-même. Noter toute friction du skill → co-évolution (`SKILL_verification_adverse.md`
> §10). Préparé le 14 juin 2026 à la fin de la session qui a créé le skill.
> **Statut #338** : 🟢, `BACKLOG.md:242-245`. **Gate humain** : le périmètre d'ablation
> se valide avec Grégoire AVANT de supprimer (cf. BACKLOG).

---

## 0. Skills à charger en ouverture
- `SKILL_verification_adverse.md` (le sujet du test — mode A, auto-vérification).
- `SKILL_Debut_de_session.md` puis, en clôture, `SKILL_Fin_de_session.md` (§4 = l'étape adverse).
- `SKILL_pratiques_notation.md` + `SKILL_labo_codex.md` (le domaine touché : `js/pratiques/`, calcul de la note).
- `SKILL_integrite_globaux.md` / `SKILL_hygiene_donnees_partagees.md` (l'ablation touche du code qui écrivait `pratiquesConfigurables` — invariant partagé).

---

## 1. Pourquoi #338 comme premier essai
Item **borné** et de nature **données/SSOT** (donc le skill « mord »), à **faible risque**
(suppression de code mort). Il exerce les **deux** mouvements porteurs du skill :
- **Passe connexions (P4)** = la star : prouver que le code est vraiment mort avant de
  l'enlever (zéro-dette), et que rien d'autre n'écrit les clés concernées.
- **Break-test (P2/§4)** : un **sentinel-ratchet** verrouille l'ablation (les symboles
  retirés restent retirés), break-testé en réintroduisant un symbole → doit rougir.

Alternative si #338 se révèle bloqué par le gate Grégoire : **#332 Constat 1** (enquête
déjà vérifiée, `Rapports/ENQUETE-332-CONSTAT1-2026-06-11.md` ; appliquer le fix +
sentinel break-testable). Garder **#340** pour plus tard (cause racine = hypothèse de
race, trop d'incertitude pour roder le skill ; groundwork connexions déjà fait :
7 écrivains de `productions`).

---

## 2. Échauffement (P1, gratuit) — réconcilier l'incohérence #340
Au démarrage, le rituel de début de session re-dérive l'état réel. **Constat connu à
acter** : `BACKLOG.md` dit `#340 RÉPARÉ` en en-tête (ligne 8) MAIS l'item lui-même
(ligne 38) affiche encore `🔴 RÉPARATION EN ATTENTE`, case non cochée. C'est une couture
récit↔code. La corriger (synchroniser l'item sur l'en-tête, pointer vers l'enquête de
cause racine ouverte) est un premier geste propre qui prouve le skill day-one.

---

## 3. Faits #338 — vérifiés le 14 juin (à RE-vérifier en ouverture, P1)
Ne pas reprendre ces faits sur parole : les re-dériver est *précisément* la passe
connexions. État au 14 juin (`HEAD` au moment du cadrage) :

- **Bug dormant CONFIRMÉ** : `sauvegarderDansConfiguration(cle, valeur)` à
  `js/pratiques.js:1845`. Le paramètre `cle` masque `window.cle` ; ligne 1857
  `cle('pratiquesConfigurables')` appellerait une **string** → `TypeError`. Mort
  aujourd'hui (appelants `pratiques.js:1063-1064` en chemin mort post-L2-b2).
- **Vieil éditeur « Pratique de notation »** : 10 ids DOM (`pratiqueNotation`, `typePAN`,
  `colonnePAN`, `btnSauvegarderPratiqueNotation`, `jetonsActif`, `portfolioActif`, …)
  réputés absents de `index.html` et du HTML généré ; fonctions servant ces ids
  (`changerPratiqueNotation`, `sauvegarderPratiqueNotation`, `chargerModalites`,
  `mettreAJourStatutModalites`, `sauvegarderConfigurationPAN`) tournant à vide derrière
  des gardes DOM. **À re-vérifier**, c'est le cœur de l'ablation.
- **`pratique-notation-v2.js`** : trio `chargerValeursDepuisStorage` /
  `sauvegarderPratiqueBaseV2` / `sauvegarderStructureV2` dans le même cas
  (`v2-pratique-type` absent) — MAIS le BACKLOG note **13 exports vivants ailleurs**
  (`pratiques-gestion`, `pratiques-bibliotheque`, `objectifs`…). **Ablation chirurgicale,
  PAS de suppression de fichier.**

---

## 4. Passe connexions à exécuter (P4) — l'inventaire de deadness
Pour CHAQUE symbole candidat à l'ablation, prouver qu'il est mort avant de le retirer :

```bash
# a) Les ids DOM sont-ils vraiment absents partout ?
for id in pratiqueNotation typePAN colonnePAN btnSauvegarderPratiqueNotation \
          jetonsActif portfolioActif v2-pratique-type; do
  echo "== $id =="; grep -rn "$id" index.html js/ | grep -v test
done

# b) Chaque fonction candidate : a-t-elle un appelant VIVANT (hors elle-même,
#    hors code déjà mort) ?
for fn in sauvegarderDansConfiguration changerPratiqueNotation sauvegarderPratiqueNotation \
          chargerModalites mettreAJourStatutModalites sauvegarderConfigurationPAN \
          chargerValeursDepuisStorage sauvegarderPratiqueBaseV2 sauvegarderStructureV2; do
  echo "== $fn =="; grep -rn "\b$fn\b" js/ | grep -v test
done

# c) Invariant partagé : qui écrit encore pratiquesConfigurables ? (le maillon §4.2 du skill)
grep -rnE "(db\.(set|setSync))\([^)]*pratiquesConfigurables" js/ | grep -v test

# d) Exports window à retirer en cohérence
grep -rnE "window\.(sauvegarderDansConfiguration|changerPratiqueNotation|chargerModalites)" js/
```

→ Un symbole avec **0 appelant vivant** = retirable. Un symbole avec un appelant
**surprise** = ce n'est PAS mort : escalader (réserve, ne pas supprimer) — c'est
exactement le genre de défaut transversal que la passe connexions doit attraper.

---

## 5. Proportionnalité (P3/§5) — où mettre la profondeur
| Élément | Surface | Vérification |
|---|---|---|
| Ablation des fonctions/ids morts | Code mort + zéro-dette | Passe connexions (preuve de deadness) + `node --check` après chaque retrait |
| Bug dormant `sauvegarderDansConfiguration` | Données (écrit `pratiquesConfigurables`) | Décider : **retirer** (si mort prouvé) ou **corriger** (renommer le param). Si corrigé : break-test obligatoire |
| Sentinel-ratchet d'ablation | Garde-fou anti-régression | **Break-test obligatoire** (réintroduire un symbole → rouge) |

---

## 6. Break-test à produire (P2/§4) — le geste à ancrer
Écrire un **sentinel-ratchet** (sur le modèle de `sentinelle-ssot-pratique-type-L2b1.test.js`)
qui balaie `js/` et échoue si un symbole retiré réapparaît (ou si `sauvegarderDansConfiguration`
masque encore `window.cle`). Puis **le break-tester** :
```
1. cp <fichier> /tmp/bak ; réintroduire un symbole retiré (ou le param cle masquant).
2. cd tests && npx vitest run <le-nouveau-sentinel>   → ATTENDU : ROUGE.
3. cp /tmp/bak <fichier> ; git status propre.
```
Si le sentinel reste **vert** après réintroduction → il est tautologique : le corriger
avant de lui faire confiance. **Ne pas conclure « ablation verrouillée » sans avoir vu ce rouge.**

---

## 7. Orchestration (skill §7)
Un seul chantier → **instance principale, en série**. Pas de fan-out sous-agents.
Option d'apprentissage : une fois le bug `cle` traité et commité, lancer **un** sous-agent
frais pour re-vérifier l'ablation (regard non biaisé, quasi-mode B) — exiger ses
**artefacts** (greps, rouge), pas un « ✅ ». Optionnel.

---

## 8. Critères de réussite du DOUBLE test
**Item #338 réussi si** : symboles morts retirés (deadness prouvée par connexions),
bug dormant traité, `node --check` OK, suite verte, sentinel-ratchet présent ET
break-testé (rouge vu), fichiers vivants intacts (13 exports de `pratique-notation-v2.js`
préservés), gate Grégoire respecté sur le périmètre.

**Skill réussi si** : la passe connexions a produit l'inventaire de deadness sans
souvenir (P1) ; au moins un break-test a viré au rouge avant restauration (P2) ; chaque
affirmation du bilan de session est adossée à un artefact, pas à un sentiment (P7) ;
l'arbre est resté propre tout du long (P5) ; les limites sont nommées (P6).

**Instrumentation skill (à noter en clôture)** : tout point du skill ambigu, lourd, ou
manquant rencontré pendant le travail → consigner dans le bilan + envisager une retouche
(§10 co-évolution). Le premier essai EST un test du skill : s'il ne révèle rien à
améliorer, se méfier (un audit qui ne fait que confirmer est suspect).

---

## 9. Garde-fous / stops
- **Gate humain** : valider le périmètre d'ablation avec Grégoire avant toute suppression.
- **Zéro-dette** : retirer ce qui est prouvé mort dans la même session ; pas d'alias « au cas où ».
- **Données préservées** : aucune migration destructive ; `sauvegarderDansConfiguration`
  écrit `pratiquesConfigurables` — confirmer qu'il est mort AVANT de toucher (sinon le
  retrait change un comportement de persistance).
- **Clôture** : `SKILL_Fin_de_session` §4 (break-test + confrontation récit↔diff), puis
  bump `release.mjs` si le retrait change l'UI/comportement (sinon `--build-only` ou rien).
