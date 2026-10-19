> **Note de Cowork (session « Apporter mon matériel »), 19 h 05** : cette consigne a été écrite à 18 h 51 par la session Cowork de l'orthopédagogie comme `CONSIGNE-DU-JOUR.md`. À 19 h 02, l'autre session l'a remplacée par erreur sans la lire ; elle est rétablie ici, mot pour mot sous cette note, et la consigne du jour l'exécute en premier. Son § 4 (le temps B) est remplacé par la consigne du jour.

# Consigne du jour – ranger le travail de l'après-midi sur l'orthopédagogie (lundi 19 octobre, soir)

> Écrite par Cowork le lundi 19 octobre 2026 à 18 h 51 (Toronto, mesuré par `date`). Elle remplace celle de 13 h 52 (retrait des écrans de l'ancien assistant : fait, `d0183549`), archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-19-retrait-ancien-assistant.md`. **Le temps B prévu ce soir dans la consigne archivée reste dû** (voir § 4).

## 1 · Contexte

Après la 2e rencontre de la CoP (19 oct., matin), Grégoire et Cowork ont relancé le volet orthopédagogie, en lecture seule sur le dépôt. Résultat : un plan d'essai de trois semaines et un mode d'emploi pour Isabelle (l'orthopédagogue), publiés hors dépôt (liens en tête de `docs/orthopedagogie/2026-10-19 Pour elle — ébauche du plan de suivi (SQUELETTE).md`), et quatre fichiers de travail dans le dépôt, non commités. **Aucun code n'a été touché ; cette consigne n'en touche pas non plus.**

## 2 · Le mandat : trois gestes, aucun code

**2.1 Commiter les fichiers de Cowork, tels quels** (un commit `docs:`) :
- `docs/orthopedagogie/2026-10-19 Lecture — Référentiel d'intervention en écriture (MEES 2017).md`
- `docs/orthopedagogie/2026-10-19 Mesure — ce que l'application offre déjà au suivi de l'orthopédagogue.md`
- `docs/orthopedagogie/2026-10-19 Pour elle — ébauche du plan de suivi (SQUELETTE).md`
- `plans de travail/IDEE-2026-10-19-interface-simple-d-abord.md`
- cette consigne et l'archive de la précédente.

⛔ **Pas** `docs/orthopedagogie/référentiel (ignorés)/` : il contient le PDF du référentiel (« © Gouvernement du Québec », aucune licence de reproduction) et un relevé verbatim de ses outils. Vérifie qu'il reste ignoré (`git check-ignore -v --no-index` sur ses deux fichiers ; motifs `*ignorés*/` et `docs/**/*.pdf`) et nomme le résultat dans ton rapport.

**2.2 Consigner le retour d'Isabelle** (testeuse, CoP du 19 oct., initiales IS), selon la règle des retours testeurs de `CLAUDE.md` (lecture ciblée de `SUIVI-BUGS.md`) : sur un service, elle n'a pas de dossier d'élève (« j'ai pas de profil élève. Où est-ce qu'on peut voir le suivi ? »). Cause mesurée par Cowork, à remesurer : sans évaluation, A inconnu, complétion vide et P = 0 réduisent la section Accompagnement du profil à trois cartes « En attente de données », ce qui cache l'historique des rencontres et le bouton Confidentiel (`profil-etudiant-sections-affichage.js:896-935` ; `indices.js:548` ; `portfolio.js:408-430`). Classe-le toi-même (défaut ou besoin) ; **ne le corrige pas ce soir** : c'est la piste 1 du plan d'Isabelle, à cadrer.

**2.3 Disposer d'une trouvaille de sécurité** : le commentaire de `js/evaluation-retroaction.js:75-81` dit que des noms venus de l'utilisateur (critères, tampons, cartouches) traversent encore `innerHTML` sans `echapperHtml` (#575 n'en a traité que trois), « les autres restent à traiter ». Écart à la règle de sécurité 1. Mesure les sites, puis applique les trois issues de `CLAUDE.md` ; Cowork recommande **inscrire** (aucune fiche ouverte trouvée au BACKLOG). Nomme l'issue retenue et le compte de sites.

## 3 · Interdits

Aucune écriture dans `js/`, `css/`, `index.html` ; aucune donnée ; aucun nom d'élève réel. Le chantier « interface simple d'abord » (`IDEE-2026-10-19-…`) **ne s'ouvre pas ce soir** : il se cadre demain avec Grégoire.

## 4 · Ensuite : le temps B de ce soir, tel que prévu

Après ces trois gestes, reprends le temps B que la consigne archivée réservait à ce soir : verdict complet du Mac (seulement quand Grégoire te dit que Chrome, Safari et Claude sont fermés), version, push. Le commit `docs:` de § 2.1 part avec. Si Grégoire préfère remettre le temps B, arrête-toi après § 2 : rien de ce qui précède ne l'exige.

## 5 · Rapport attendu

En français d'utilisateur : ce qui est commité (et ce qui est resté ignoré, vérifié comment), où est rangé le retour d'Isabelle et sous quelle forme, l'issue de la trouvaille de sécurité, puis l'état du temps B.
