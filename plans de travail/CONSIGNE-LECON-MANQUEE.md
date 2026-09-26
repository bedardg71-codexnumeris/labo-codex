# Consigne – Profil › Engagement : chaque absence nomme la leçon manquée

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `origin/main` = `a67890fe`. **À lancer après l'audit du parcours sommatif** (`CONSIGNE-AUDIT-PARCOURS-SOMMATIF.md`), une session à la fois.
> Demande de Grégoire (24 sept., captures du profil « Engagement » et de l'Inspecteur de sa leçon « La carte mentale », S5, A, vendredi 18 septembre) : « Je voudrais que dans l'écran « Engagement » du profil étudiant les absences indiquent le titre de la leçon manquée (afin de me donner une idée de la matière qui n'a pas été vue par l'élève). » **Symptôme vécu** : inscris une fiche au BACKLOG à l'ouverture, coche-la à la livraison ; ajoute le lot à `FILE-DES-LOTS.md`.

## 0 · Le geste

Dans le profil › Engagement › carte « Assiduité », sous « N absences ou retards », chaque pastille (« ven. 18 sept. · 2 pér. ») porte aussi le **titre de la leçon** que la carte d'alignement place à cette date pour **le groupe de l'élève** (ex. « La carte mentale »). Texte vu par l'enseignant·e seulement : forme et emplacement exacts décidés par toi (skill `design-interface`), lisibles sur iPad (768 px) ; dis en une ligne ce que tu as retenu.

## 1 · Le calcul : l'inverse de celui de l'Inspecteur, pas un second

#695 (1.155.0) calcule leçon → date, une ligne par groupe (`lignesDateDeLecon`, même calcul que l'export du plan et que « Productions étudiantes »). Il faut ici date + groupe → leçon. **Réutilise ce calcul** (ou sa source commune) ; zéro-dette, pas une seconde résolution semaine/séance/congé.

Cas à dire plutôt que deviner :
- aucune leçon à cette date pour ce groupe → pas de titre (rien d'inventé) ;
- deux séances le même jour, deux leçons → mesure si l'absence porte sa séance ; sinon les deux titres, séparés ;
- un retard (présence partielle) → le titre aussi : la matière a été en partie manquée ;
- leçon sans titre → « Leçon sans titre » ou rien : décide et dis-le.

## 2 · Limites

- **Aucune donnée écrite** : lecture des présences et de la carte.
- Pas de nom d'élève réel (règle 6).
- Hors lot : le Suivi du groupe, les exports, le PDF.

## 3 · Preuve

- Vitest : date → leçon pour chaque cas du §1, deux groupes aux horaires différents (la même date donne deux leçons différentes), congé, séance déplacée.
- WebKit : un profil avec deux absences → deux pastilles, deux titres ; une absence sans leçon → pastille sans titre.
- Break-tests de ton choix, chacun rouge.
- « Nouvelles » : **proposition de Cowork, à soumettre à Grégoire avant le push** : « Profil › Engagement : chaque absence nomme la leçon prévue ce jour-là dans ta carte d'alignement, pour voir d'un coup d'œil la matière manquée. »
- Relecture croisée de Cowork avant la fusion, puis verdict, fusion, push.
- Porte terrain : une rangée, sur ses données (le profil de sa capture : l'absence du 18 sept. doit nommer « La carte mentale »).
