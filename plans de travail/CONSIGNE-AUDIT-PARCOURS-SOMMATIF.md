# Consigne – Audit du parcours d'un·e enseignant·e en sommative traditionnelle : ce que son élève reçoit

> Écrite le 24 septembre 2026 (Toronto), par Cowork. **À lancer APRÈS le lot du bilan** (`CONSIGNE-DU-JOUR.md` du 24, définitions et « Points récurrents »), sur le `main` qui le porte : le bilan qu'on audite doit être celui qui sort de ce lot.
> **Audit, lecture seule : aucun correctif.** Rapport dans `Rapports/AUDIT-parcours-sommatif-<date>.md`, avec les trois dispositions par constat (inscrit / refusé / périmé), comme le veut `CLAUDE.md`.

## 0 · Pourquoi, dans les mots de Grégoire (24 sept. 2026)

« Dans le réseau actuellement, la plupart des enseignants ont une pratique sommative traditionnelle. Je voudrais qu'ils puissent bénéficier évidemment des retours, des rétroactions et des synthèses de rétroaction que leur permet Labo Codex. Il faudrait vérifier si ces pratiques sont compatibles. »

**Précision de Grégoire (24 sept. 2026), qui fixe le cas central de l'audit** : « Je parle ici évidemment de pratiques sommatives traditionnelles où il n'y a pas nécessairement d'échelle de performance, mais des points accordés pour chacun des critères (ce qui remplace ni plus ni moins l'échelle de performance). » ⮕ **Le cas à auditer en premier : une grille en points, SANS échelle de performance.** Le pourcentage d'un critère (points / pondération) y est la seule mesure, et elle est toujours définie. Les variantes avec échelle sont secondaires.

## 1 · L'hypothèse de Cowork à éprouver (lue, pas mesurée)

Le bilan de la synthèse range les critères par la ZONE de leur niveau (`zoneDuNiveau`, `profil-etudiant-calculs.js` ≈ l. 352), qui ne se lit que dans les deux repères de l'échelle (`seuilSuffisance`, `seuilMaitrise`). `git grep` ne trouve aucune échelle livrée (modèles, pack, défauts) qui les porte. Si c'est vrai, un·e enseignant·e qui démarre – sommative ou Standards – obtient un bilan où « Présentement, il faut se concentrer sur », « Ta force » et « Points récurrents » sont vides, sans un mot. **Confirme ou réfute par l'exécution, d'abord.**

## 2 · Le parcours à faire, avec les outils de l'application (pas de données fabriquées à la main hors de ce qu'un·e utilisateur·rice ferait)

Sur un espace vierge, comme un·e collègue qui arrive :
1. une grille **en points** (critères analytiques, pondérations qui totalisent 100) – le cas central ;
2. une pratique **sommative** créée par l'assistant (le « Modèle sommatif » et/ou le parcours par défaut) ;
3. **sans échelle de performance** : l'application le permet-elle de bout en bout (grille, pratique, évaluation, synthèse) ? Si elle impose ou glisse une échelle quelque part, dis où, laquelle, et ce qu'elle change à ce que l'élève lit. Variante secondaire seulement ensuite : la même grille avec l'échelle proposée par défaut ;
4. une cartouche si le parcours en propose une, sinon sans ;
5. deux ou trois copies du même élève fictif, annotées (tampons, codes), évaluées, dont au moins un critère sous 60 % ;
6. le « Dossier PDF » (synthèse) et « Copier tout ».

Pour chaque étape : ce que l'enseignant·e voit, où il ou elle pourrait bloquer, et ce qui manque.

## 3 · Ce que le rapport montre

**Bloc par bloc de la synthèse PDF** (le squelette du rapport du 6 sept., `Rapports/MESURE-ce-que-l-eleve-lit-dans-le-pdf-2026-09-06.md`, section A) : ce que l'élève en sommative lit, en regard de ce que lit un élève de Grégoire (Standards, échelle à repères). Chaque bloc vide, muet ou faux, nommé. Idem pour la note : ce que « Note provisoire » dit en sommative.

## 4 · La proposition de Grégoire à éprouver – NE PAS CODER

« Par défaut, on pourrait tout de même considérer que tout critère qui est inférieur à 60 % (donc un échec) pourrait recevoir un commentaire spécifique (comme un défi ou une cible à relever). »

Mesure, sans rien changer :
- **Le cas central, points sans échelle** : le pourcentage d'un critère = points / pondération, toujours défini. Dis ce que la règle « sous 60 % = prioritaire » y produirait, bloc par bloc.
- **Où un pourcentage de critère existe aussi** : un critère holistique dont le niveau porte une valeur en % dans l'échelle (dis si les échelles livrées en portent, et lesquelles) ; un critère algorithmique (sa note).
- **Où il n'existe pas** (niveau sans valeur) : dis-le, sans inventer de correspondance lettre → %.
- **Ce que la règle changerait** dans chaque bloc : « Présentement » (le critère sous 60 % devient prioritaire, avec sa définition), « Points récurrents » (sous 60 % sur deux copies de suite), « Ta force » (rien : 60 % ne dit pas où commence l'acquis). Et **comment elle cohabite** avec une échelle qui a ses repères (lesquels l'emportent ?) : pose la question, ne la tranche pas.
- ⚠ Cette règle contredit un principe écrit le 28 août dans `zoneDuNiveau` (« aucune valeur n'est devinée : ni par les lettres, ni par une position, ni par un pourcentage »). Cite-le dans le rapport : c'est à Grégoire de réviser ce principe, pas au code.

## 5 · Limites

- Lecture seule, dans un espace de banc ou un profil de navigateur vierge ; **aucune donnée réelle lue ni écrite**.
- Pas de nom d'élève réel (règle 6).
- Aucune porte terrain : c'est un audit.
