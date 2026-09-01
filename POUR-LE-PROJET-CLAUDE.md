# Labo Codex — le contexte, pour un Claude qui n'a ni le dépôt ni le terminal

> **À qui ce fichier s'adresse.** À une conversation Claude qui n'a accès à AUCUN
> fichier du projet : depuis l'iPad, depuis le web, depuis un Projet claude.ai.
> Les sessions qui atteignent le dépôt lisent `CLAUDE.md` et
> `OU-EN-EST-ON.md` à la place ; celui-ci ne leur sert à rien.
>
> ⚠ **C'est une COPIE FIGÉE**, déposée à la main dans un Projet. Elle ne se met
> pas à jour toute seule. **Écrit le 1er septembre 2026.** Passé quelques
> semaines, traite chaque état comme une indication, jamais comme une mesure —
> et dis-le à Grégoire plutôt que de deviner.

---

## Ce qu'est Labo Codex

Une application d'évaluation pédagogique que Grégoire Bédard, enseignant de
littérature au collégial, développe seul. HTML, CSS et JavaScript purs : aucun
cadriciel, aucune étape de compilation, fonctionnement hors-ligne. Elle sert
d'abord sa propre pratique, et depuis 2026 celle d'autres enseignants.

Une communauté de pratique du même nom, hébergée par l'AQPC, se réunit pour la
première fois le **14 septembre 2026**. Des utilisateurs sont **déjà** dans
l'application, en nombre inconnu : le trafic n'est pas mesuré.

---

## Son vocabulaire, à employer tel quel

- **Trimestre** : le contenant de tout. Les données sont préfixées par lui.
- **Groupe-cours** : un groupe d'élèves dans un cours.
- **Grille** : les critères d'évaluation d'une production.
- **Échelle** : les niveaux de performance et leurs valeurs.
- **Cartouche** : le bloc d'identification d'une évaluation.
- **Production** : ce que l'élève remet.
- **Chronique** : un article de son blog qui décrit un parcours dans
  l'application, du premier geste au dernier.
- **SOLO** : la taxonomie qu'il applique, à quatre niveaux — incomplet, en
  développement, maîtrisé, abstrait étendu.
- **RàI** : la réponse à l'intervention, trois niveaux, qu'il croise avec SOLO
  pour son dépistage.
- **EUF** : l'épreuve uniforme de français. Sa norme officielle : au plus 30
  fautes pour 900 mots.
- **PAN** : les pratiques alternatives de notation. Celle **par spécifications**
  et celle **par standards** sont des pratiques à part entière, codées et
  configurables. Elles restent.

---

## Les quatre choses qui remontent à lui — et rien d'autre

Depuis le 1er septembre 2026, la règle est **décide, puis dis-le en une ligne**,
en nommant ce que tu as supposé. Tranche seul le technique et tout ce qui se
lève par une mesure. Ne lui demande que :

1. **la pédagogie et sa didactique** — ce qu'une note veut dire, ce qu'un critère
   mesure, ce qu'une suppression doit emporter ;
2. **ses données réelles** — tout geste irréversible sur ses trimestres, ses
   grilles, ses évaluations ;
3. **les mots que ses élèves liront** — la prose des rétroactions ;
4. **ce qui l'engage publiquement** — une version majeure, un partage, une
   communication.

Motif : il arbitrait une quinzaine de décisions par session et terminait ses
journées épuisé.

---

## Ce qui est arrêté, et qu'on ne rouvre pas

- **Les notes de l'automne 2025 et de l'hiver 2026 ne sont pas rouvertes.**
  Décision pédagogique, explicitement sans retour. Ne pas proposer de les
  recompter, ne pas les signaler.
- **La cible de la cohorte 1 est une liste fermée de huit gestes.** Elle ne
  s'amende que par lui. Une trouvaille reçoit une seule question : est-ce que ça
  empêche un des huit ? Non → on l'inscrit et on continue.
- **Le matériel fictif se retire, il ne se répare pas.** Du contenu d'exemple
  associé à une discipline finit par embêter les enseignants de cette discipline.

---

## Comment on travaille

Grégoire parle à Cowork ; c'est lui, et lui seul, qui transmet les consignes à
Claude Code dans son terminal. Aucun canal direct n'existe entre les deux.
Cowork mesure, tient le fil et rédige ; Claude Code exécute, teste et livre ;
Grégoire décide, transmet, et fait tourner l'application sur ses vraies données.

La coordination vit dans les **fichiers du dépôt**, pas dans les conversations —
délibérément, pour survivre à la fin d'une session.

---

## Ce qu'une conversation sans le dépôt ne doit PAS faire

- **Affirmer un état du code.** Sans le fichier sous les yeux, une ligne, un nom
  de fonction ou un compte est un souvenir, pas une mesure. Trois cibles périmées
  ont été trouvées dans les documents du projet en une seule journée.
- **Cocher quoi que ce soit.** Un état ne change qu'avec la phrase qui dit
  comment il a été vérifié.
- **Confondre « je n'ai rien vu » et « il n'y a rien ».** C'est la confusion qui
  a coûté le plus cher dans ce projet. Grégoire vérifie beaucoup de choses
  lui-même, en écrivant ses chroniques, et le dépôt n'en garde pas la trace.
  Demande-lui plutôt que de conclure.
