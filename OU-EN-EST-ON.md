# Où en est-on ?

> **Ce fichier répond à une seule question : qu'est-ce qui marche, et qu'est-ce
> qui ne marche pas encore, pour quelqu'un qui utilise l'application ?**
>
> Il est écrit **sans numéros de fiche** et sans vocabulaire de chantier. Les
> numéros (`#612`, `#674`…) sont des étiquettes d'archivage, pas une échelle de
> progression : ils servent aux sessions, pas à Grégoire. Quand il en faut un
> pour retrouver le détail, il est entre parenthèses, en fin de ligne.
>
> **À lire au début de toute session, Cowork ou Claude Code**, avant `CLAUDE.md`
> et `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, qui eux disent *comment*
> travailler. Celui-ci dit *où on en est*.
>
> **Mis à jour à la fin de chaque journée de travail.** Une ligne ne change
> d'état que si quelqu'un écrit **comment** il l'a vérifié.

**Dernière mise à jour : 1er septembre 2026, en soirée.**

---

## La règle de lecture

Trois états, et un seul est confortable :

- **Fait** : vérifié, et la façon de le vérifier est écrite à côté.
- **Pas fait** : on sait ce qui cloche, et c'est nommé.
- **Jamais vérifié** : personne n'a regardé. **Ce n'est pas « probablement
  correct ».** C'est la confusion qui a coûté le plus cher dans ce projet.

---

## Le compte du jour : 3 faits, 3 pas faits, 2 jamais vérifiés

---

## FAIT

### Importer des productions, et savoir ce qui se passe quand ça rate
Un import lancé sans groupe-cours actif est refusé, et le refus est dit. Un
fichier dont le numéro d'élève n'existe pas dans le groupe apparaît maintenant
dans la liste au lieu de disparaître sans trace.
**Vérifié comment** : quatre tests automatiques qui rejouent les quatre cas, plus
une relecture du rendu à l'écran (les tests seuls ne voient pas les couleurs).
**Reste** : l'essai à la main de Grégoire, pour juger l'écran réel. *(#612)*

### Une grille partagée arrive complète chez le destinataire
Les sous-critères, leurs rétroactions et les réglages de projection voyagent
maintenant avec la grille. L'évaluation du destinataire ne bascule plus de mode
à son insu.
**Vérifié comment** : tests automatiques sur le transport. *(#669)*

### Le numéro de version affiché correspond au code qui tourne
Sans ça, aucun rapport de bug n'est interprétable, ni le sien ni celui d'un
utilisateur.
**Vérifié comment** : tests sur le bandeau de version.
⚠ **Fragile** : ça se re-périme à chaque changement de version fait à la main.
*(#665)*

---

## PAS FAIT

### Une rétroaction ne parle que de la discipline de celui qui l'écrit
Un enseignant de chimie qui compte des erreurs voit encore « **Français écrit** »
imprimé dans le PDF remis à son élève. Le même mot est gravé dans les
identifiants de champs du volet confidentiel.
**C'est le prochain lot.** *(#581, #539)*

### Aucune note remise ne repose sur une pondération incomplète sans le dire
Un critère laissé sans niveau donne **0,0 %**, sans un mot, et ce zéro
s'enregistre comme une vraie note.
**Mesuré le 1er septembre en soirée**, avec un témoin qui isole la cause : ce
n'était plus un soupçon. *(#674)*

### Ce qu'un utilisateur détruit, il l'a voulu ; ce qu'il garde, il le retrouve
Trois défauts ouverts sur les messages de suppression : ils annoncent des pertes
qui n'ont pas lieu, et taisent des survivances qui ont lieu.
**Attend une décision de Grégoire** : que doit emporter la suppression d'un
fichier ? *(#647, #648, #649)*

---

## JAMAIS VÉRIFIÉ

⚠ **Ce sont les deux premiers pas d'un nouvel enseignant.** Aucune trace de
vérification n'existe, nulle part, pour l'un ni pour l'autre.

### Créer un trimestre, créer un groupe-cours, prendre les présences
**Ce qu'on sait déjà qui tombe dedans** : des fenêtres d'alerte bloquantes sur ce
parcours exact. *(#678)*

### Créer une grille, une échelle, une cartouche
**Ce qu'on sait déjà qui tombe dedans** : les huit échelles « disciplinaires » de
la bibliothèque (Chimie, Bio, Philo, Info, Géo…) donnent **zéro à la première
évaluation**, en silence. Un enseignant de chimie qui fait la chose sensée
obtient 0,0 %. *(mesuré le 1er septembre, plan du semis §1)*

---

## CE QUI N'APPARTIENT QU'À GRÉGOIRE

Aucune session ne peut trancher ces points à sa place.

- **La règle de suppression d'un fichier** : que doit-elle emporter ?
- **Le facteur de normalisation 500 → 600** sur sa grille de première session.
  ⚠ Entre deux évaluations, jamais au milieu d'une correction.
- **Le nom du service d'aide** pendant la transition du CAF vers « Passerelle + ».
- **Les essais à la main** que les tests ne remplacent pas : l'écran réel sur Mac
  et sur iPad.

---

## CE QU'ON NE SAIT PAS, ET QUI COMPTE

⚠ **Des utilisateurs sont DÉJÀ dans l'application. Combien : inconnu.**
Le trafic n'est mesuré ni sur Netlify ni sur Cloudflare. On ne sait pas s'il y en
a un, vingt, ou aucun aujourd'hui.

⮕ **Ce que ça change pour toute session** : on ne développe plus « avant les
utilisateurs ». Un défaut livré est un défaut que quelqu'un rencontre peut-être
déjà. Un enseignant de littérature, hors communauté de pratique, a signalé un
bug ; il a été corrigé. C'est la preuve que la porte est ouverte et qu'elle sert.

⮕ **La communauté de pratique Labo Codex se réunit le 14 septembre 2026.** Ce
n'est pas la date où les utilisateurs arrivent : c'est la date où ils se parlent.

---

## COMMENT CE FICHIER SE MET À JOUR

1. Une ligne passe à **Fait** seulement avec la phrase « vérifié comment ».
2. Une ligne ne quitte **Jamais vérifié** que par un passage réel dans l'écran,
   pas par une lecture de code.
3. Les huit gestes viennent d'`OBJECTIF-COHORTE-1.md`, arrêté par Grégoire. **Ce
   fichier-ci ne les amende pas** : il les traduit et les date.
4. Si un état change et que ce fichier ne bouge pas, c'est ce fichier qui a tort.
