# Consigne – Une copie non recevable vaut ce que la règle dit, dans le calcul (28 octobre 2026)

> Écrite par Cowork le mercredi 28 octobre 2026 à 6 h 13 (Toronto, mesuré par `date`), sur `main` = `78e538b3`. Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> **Issue 1, corriger maintenant** : le défaut touche des notes que des étudiant·es ont en main (CLAUDE.md, trois issues). Il interrompt le lot 2c de l'Aide, dont la retouche (`2692fd48`) est relue par Cowork : **acceptée** ; seule la ligne « 0 - Aucun » de la procédure attend ce lot.
> Sources : `VERDICT-RELECTURE-2026-10-28-aide-lot-2c.md` (§ « Suite de la retouche 2 ») et `DEMANDE-RELECTURE-2026-10-28-aide-lot-2c-retouche.md` (ta mesure).

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Rituel de début de session.
- Commit de docs seul, fichiers nommés : ce fichier et `VERDICT-RELECTURE-2026-10-28-aide-lot-2c.md`.

## 1. La règle, déjà décidée par Grégoire

Le 15 oct. 2026, 13 h 47 et 14 h 36 (`CONSIGNE-LOT-2026-10-15-aide-face-a-l-audit.md:10`, `CONSIGNE-LOT-2026-10-15-aide-plagiat.md`, § 2), telle que l'Aide la dit aujourd'hui (`accordeon-aide-irrecevables`) :

- dans la complétion (C), une copie non recevable compte comme non remise ; elle reste au total attendu ;
- en sommative, elle vaut 0, sauf si une reprise la remplace ou si la pratique ne retient que les meilleures productions et qu'elle n'en fait pas partie ;
- en spécifications, elle compte comme un travail non satisfaisant ;
- en standards, elle sort du portfolio ; une terminale non recevable vaut 0 ; en mode hybride, une fois les notes finales cochées, une obligatoire non recevable aussi ;
- en dénotation, la copie n'entre pas dans la note par calcul.

**Grégoire, 28 oct., 6 h 16** : la règle sur la complétion est confirmée pour sa pratique (« non remis, parce que non fait par l'élève ») ; mais **cette règle est sa pratique personnelle, et elle ne doit pas être codée en dur**. La question devrait être posée à l'utilisateur, à la création de la pratique de notation, avec ce qu'il attend explicitement d'un travail recevable ou non recevable. Décision de Cowork pour ce lot : la règle ci-dessus devient le **comportement par défaut**, posé à **un seul endroit** (le prédicat du registre et une fonction unique « ce que vaut une copie non recevable », lue par chaque famille), pour qu'un réglage de la pratique puisse la remplacer sans toucher aux familles. Le réglage lui-même est un chantier à part, à concevoir avec Grégoire : **pas dans ce lot**, aucune case ni aucun texte neuf.

Ce lot ne change pas la règle : il fait que le calcul la suive. **Si une famille ne peut pas la suivre sans changer ce qu'elle calcule ailleurs, arrête-toi sur cette famille et dis-le.**

## 2. Le mandat

1. **Mesure d'abord, famille par famille**, sur un banc à données fictives : une copie non recevable verrouillée, avec sa note calculée (ton cas : E et M, 87,5), dans chaque famille et chacun de ses chemins de calcul (l'indice P, la note finale du profil `calculerDetailsNoteFinale`, le Comparateur, les captures). Lu par Cowork, non éprouvé : la note du portfolio en standards écarte déjà la copie (`js/profil-etudiant-actions.js:211-213`) ; l'indice P de `js/pratiques/pratique-pan-standards.js` (`calculerPerformance`, ~l. 150) ne lit que `evaluationEntreDansLaNote`, qui ne regarde pas l'intégrité (`js/pratiques/pratique-registre.js:863-871`). Un tableau famille × chemin : ce que fait le code, ce que dit la règle.
2. **Corrige dans le calcul, à une seule source.** La règle se lit sur `statutIntegrite` au moment du calcul (le prédicat `evaluationNonRecevable` du registre existe déjà, `pratique-registre.js:900-902`), pas sur la valeur des menus. Décision de Cowork : c'est ce qui fait suivre aussi les copies déjà verrouillées, **sans écrire dans les données de personne** (tarir et stock, par la lecture). Les captures hebdomadaires déjà prises gardent leurs valeurs : écris-le, ne les recalcule pas.
3. **Les menus** (`js/evaluation-sauvegarde.js:604-612`) : ils ne trouvent rien (`select[id^="critere"]` au lieu de `eval_…`, `js/evaluation-chargement.js:421`), et une échelle sans niveau « 0 », comme l'Échelle de départ, n'a pas de choix « 0 ». La règle vit désormais dans le calcul : décide si ce bloc se corrige (le bon sélecteur, l'état désactivé) ou se retire, et dis-le. Ne pose pas de « 0 » qui n'existe pas dans l'échelle.
4. **Ce que voient l'enseignant·e et l'étudiant·e** pour cette copie : la note de la copie (la Liste dit « -- » et « 0 » sous « Statut »), la note remise d'une copie verrouillée (#1173), le PDF. **Mesure et rapporte, ne change rien** : ce qu'une note veut dire, et les mots que l'étudiant·e lit, remontent à Grégoire.
5. **Le message de l'écran** « Cette évaluation sera exclue des calculs de moyenne. » (`js/evaluation-sauvegarde.js:624`) contredit la règle en sommative. Ne le change pas : propose un texte dans la demande de relecture, section « Pour Grégoire ».
6. **Le lot 2c de l'Aide** : une fois le calcul corrigé, la ligne de la procédure (« Non recevable, tous les critères passent à « 0 - Aucun » ») dit ce que fait l'écran après ton point 3 ; les quatre lignes par famille et le « 7/9 » restent mot pour mot.

## 3. Les tests

- Un essai par famille et par chemin du tableau du § 2.1, qui rougit sans le correctif (break-test, arbre restauré par sha256) ; un témoin : une copie recevable garde sa note.
- La copie déjà verrouillée avant le correctif (le stock) : un essai montre qu'elle suit la règle sans qu'aucune écriture n'ait lieu.
- Vitest depuis `tests/` ; Playwright ciblé : ton scénario de mesure, de bout en bout, en sommative.
- `BACKLOG.md` : inscris le défaut (il bloque un chantier en cours, l'Aide), coché par ce lot s'il est fait ; et, à part, le chantier de Grégoire du 28 oct. (6 h 16), dans ses mots : demander à l'utilisateur, à la création de la pratique de notation, ce que vaut une copie non recevable, et préciser ce qui est explicitement attendu d'un travail recevable ou non recevable ; ne pas coder en dur sa pratique personnelle.
- Un essai vérifie la source unique : aucune famille ne relit `statutIntegrite` elle-même, toutes passent par la fonction du registre.

## 4. Clôture

- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-copie-non-recevable-note.md` (le tableau du § 2.1 avant et après, les preuves `fichier:ligne`, les tests, ce que voient l'enseignant·e et l'étudiant·e, « Pour Grégoire »).
- Un commit pour le code, un pour les docs. Pas de release, de verdict ni de push sans le signal de Grégoire.
