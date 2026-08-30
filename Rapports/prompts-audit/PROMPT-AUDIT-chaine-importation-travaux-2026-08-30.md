---
serie : Revue des onglets par audit cadré
onglet : Travaux — chaîne d'importation
destinataire : Fable 5 (accès complet au dépôt)
executant_des_correctifs : Opus 5
type : audit de robustesse
livrable_attendu : rapport de constats + correctifs proposés, NON appliqués
rapport_produit : Rapports/AUDIT-chaine-importation-travaux-2026-08-30.md
date : 2026-08-30
statut : exécuté
---

# Audit — chaîne d'importation des travaux (Labo Codex)

## Contexte

Labo Codex est une application web hors-ligne (HTML/CSS/JS ES6+ pur, aucune
dépendance sauf Chart.js) qui numérise le flux de travail d'un enseignant :
recevoir les travaux, les évaluer, les retourner. Elle a été développée en
solo par un enseignant, pour son seul usage, pendant un an.

Une cohorte d'une vingtaine d'enseignants va commencer à l'utiliser en
septembre 2026. C'est le premier usage réel par des gens qui n'ont pas les
habitudes de nommage, les réflexes ni la tolérance à l'erreur de l'auteur.

L'enjeu de cet audit est là : ce qui tient parce qu'un seul utilisateur
connaît les angles morts va-t-il tenir avec vingt utilisateurs qui ne les
connaissent pas ? Les données en jeu sont des travaux d'étudiants et des
évaluations — une perte ou une corruption silencieuse est le pire scénario.

## Périmètre

Deux chaînes, de bout en bout :

1. Préparation et importation des travaux
2. Organisation des travaux importés dans la liste des évaluations

Fichiers principaux (environ 20 000 lignes au total) :

  js/travaux-preparation.js     js/travaux-import.js
  js/travaux-doublons-ui.js     js/travaux-resolution.js
  js/travaux-stockage.js        js/liste-evaluations.js
  js/evaluation-jetons.js       js/evaluation-chargement.js
  js/import-export.js

Élargis si le flux te mène ailleurs, mais dis-le explicitement.

## Hors périmètre

- Le zoom de la visionneuse et toute question d'interaction gestuelle
  (`travaux-visionneuse.js`) — traité séparément.
- L'annotation, la notation, le calcul des indices.
- Le style, la mise en page, la cohérence visuelle.

## Méthode attendue

Ne procède pas fichier par fichier. Trace les flux :

  fichier déposé par l'enseignant
    → préparation / nommage
    → détection de doublon
    → appariement à un étudiant
    → stockage (localStorage < 200 Ko / IndexedDB au-delà, via db.js)
    → apparition dans la liste des évaluations
    → cas de la reprise après jeton

Pour chaque étape, demande-toi ce qui se passe quand l'entrée n'est pas
celle attendue.

Lis d'abord, dans cet ordre :
  docs/00-START-HERE.md
  docs/architecture/ECOSYSTEME-DONNEES.md  (Codex, Archives, Codex data, Voûte)
  docs/DATA-OWNERSHIP.md                   (registre des clés et propriétaires)
  docs/modules/evaluations-productions.md
  docs/modules/pipeline-annotation-evaluation.md

/!\ SESSION.md (~7 600 lignes) et BACKLOG.md (~1 300) ne se lisent JAMAIS en
entier : en-tête puis lectures ciblées avec offset/limit.

## Ce qu'il faut vérifier

### A. Détection des doublons
Sur quoi repose-t-elle exactement — nom de fichier, taille, empreinte du
contenu, date ? Un même travail renommé est-il détecté ? Deux travaux
différents portant le même nom sont-ils distingués ? Que valent les notions
de « signature de fichiers », « pattern », « cas valide » et « livrable
additionnel » dans travaux-doublons-ui.js, et sont-elles cohérentes avec ce
que fait réellement travaux-import.js ?

### B. Collisions de noms
Deux étudiants qui remettent « devoir.pdf ». Un même étudiant qui remet deux
fichiers de même nom. Un fichier dont le nom entre en collision avec un
travail déjà stocké dans une autre évaluation, ou un autre trimestre
(rappel : les clés sont préfixées par trimestre via window.cle()). Y a-t-il
écrasement silencieux quelque part ?

### C. Doublon contre reprise — le nœud
Une reprise après jeton EST un doublon légitime. La chaîne distingue-t-elle
« même travail réimporté par erreur » de « version 2 après jeton de
reprise » ? Que devient la version précédente : écrasée, versionnée,
orpheline ? Si l'enseignant importe la reprise avant d'accorder le jeton,
ou accorde le jeton après l'import, l'état reste-t-il cohérent ?
appliquerJetonReprise / retirerJetonReprise ont-ils un effet sur les
travaux déjà stockés, et retirerJetonReprise laisse-t-il des données
orphelines ?

### D. Appariement fichier → étudiant
Comment un fichier trouve-t-il son étudiant ? Que se passe-t-il en cas de
typo, d'accent, de nom composé, de nom inversé, d'étudiant absent du
groupe, de fichier appartenant à un autre groupe ? L'enseignant est-il
averti, ou le fichier disparaît-il silencieusement ?

### E. Organisation dans la liste des évaluations
Ordre, regroupement, comptage. Le compteur de travaux reçus reflète-t-il
l'état réel après un import partiel, après une résolution de doublons,
après une suppression ? Y a-t-il des chemins où l'affichage et le stockage
divergent (violation du Single Source of Truth) ?

### F. Robustesse
- Import interrompu à mi-parcours (iPad en veille, onglet fermé) : l'état
  reste-t-il cohérent ? Peut-on reprendre ? Annuler ?
- Réversibilité : un enseignant qui importe dans la mauvaise évaluation
  peut-il défaire sans dégât ?
- Volume : 5 groupes x 30 étudiants x plusieurs fichiers — quel est le
  point de rupture (quota localStorage, temps d'import, mémoire) ?
- Messages d'erreur : un enseignant qui n'a pas écrit ce code comprend-il
  ce qui a échoué et ce qu'il doit faire ?
- Mac et iPad séparément : Safari/iPadOS a des contraintes propres
  (quotas, éviction du stockage, gestion des fichiers). Signale ce qui
  diverge.

### G. Sécurité et invariants
Tout import ZIP doit passer par validerZipSecurite(). Tout import
image/PDF par validerMagicBytes(). Tout innerHTML recevant une donnée
utilisateur — nom d'étudiant, titre de production, nom de fichier importé —
doit passer par echapperHtml(). Zéro handler inline (onclick=, onchange=) :
data-action / data-on-change uniquement. Zéro console.log.
Cherche les chemins d'import qui contournent ces défenses.

## Rigueur exigée

Pour chaque constat, distingue explicitement :
- ce que tu as VÉRIFIÉ dans le code (avec fichier:ligne et l'extrait),
- ce que tu INFÈRES du code sans l'avoir prouvé,
- ce que tu SUPPOSES et qui demanderait un test réel.

Un constat sans scénario de défaillance concret — entrées précises →
comportement fautif observable par l'enseignant — n'a pas sa place dans le
rapport. Ne comble pas les trous par de la plausibilité : dis « je n'ai pas
pu établir ».

Signale aussi ce qui est solide. Un audit qui ne trouve que des problèmes
est un audit qui n'a pas cherché à se contredire.

## Livrable

Un rapport en français, en Markdown, structuré ainsi :

1. **Synthèse** — 10 lignes maximum. Les trois risques qui menacent
   vraiment la cohorte de septembre.
2. **Constats**, classés par gravité :
   - BLOQUANT — perte ou corruption de données, ou blocage sans issue
   - SÉRIEUX — l'enseignant se retrouve avec un état faux sans le savoir
   - MINEUR — friction, message obscur, incohérence sans conséquence
   Chaque constat : titre, fichier:ligne, scénario de défaillance concret,
   niveau de certitude (vérifié / inféré / supposé).
3. **Correctifs proposés** — pour les constats BLOQUANT et SÉRIEUX
   uniquement, sous forme de diff. NE LES APPLIQUE PAS. Le dépôt reste
   intact ; l'auteur les relira et les appliquera un fichier à la fois.
   Quand un correctif remplace un mécanisme existant, indique ce qui doit
   être RETIRÉ : le projet est en politique zéro-dette, pas d'alias « au
   cas où », pas de code mort.
4. **Angles morts** — ce que tu n'as pas pu vérifier et ce qu'il faudrait
   tester en conditions réelles, sur Mac et sur iPad séparément.

N'écris rien dans SESSION.md, BACKLOG.md ni dans aucun fichier du dépôt.
Ne touche pas à js/config.js, js/navigation.js ni noms_stables.json.
Rends le rapport, rien d'autre.
