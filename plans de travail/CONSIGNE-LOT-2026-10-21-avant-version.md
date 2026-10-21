# Consigne – Avant la version : la spec du texte troué (#1138), la phrase du profil

> Écrite par Cowork le mercredi 21 octobre 2026 à 12 h 10 (Toronto, mesuré par `date`), sur `main` à `01b40658`. Verdict : `VERDICT-RELECTURE-2026-10-21-note-norme-francaise.md` (non suivi). Petit lot : la version et le verdict complet suivent vers 13 h, au signal de Grégoire. **Le miroir ne se fait pas aujourd'hui** (`CONSIGNE-LOT-2026-10-21-critere-algorithmique-miroir.md` attend demain) : n'y touche pas.

## 1. #1138 : la spec `texte-troue-reperes-enonces`

Décision de Cowork : **la spec est périmée, pas l'application**, sous une condition à mesurer d'abord. #1131 a voulu que le gabarit des sous-critères se rende en création, « Quand la copie ne porte aucun code » compris (demande du 21 oct., 9 h 15). La spec encode l'ancienne règle de la carte « Bilan » (1.120) : « en création, « Aucune annotation » n'est pas rendue ».
- **Mesure d'abord** que la quatrième zone trouvée en création est bien `textarea[data-enonce-cle="aucune"]`, rendue une seule fois, dans le pli « Quand la copie ne porte aucun code ». Si c'est autre chose (une zone en double, un décompte de trop), **arrête-toi** : c'est alors l'application, et tu le dis.
- Si c'est bien elle : réécris les attentes de la spec pour la règle d'aujourd'hui. En création, quatre zones, dont « Aucune annotation » ; la saisir écrit dans `window.tempCriteres[0].enonces.aucune`, sans écriture IndexedDB ; ses repères sont ceux qu'elle offre en modification. Garde tout le reste de la spec.
- **Break-test** : retire le rendu de la zone en création → la spec réécrite rougit. Code restauré, `cmp`.
- Note la règle au commentaire d'en-tête de la spec, avec la date et #1131.

## 2. La phrase de la note finale du profil, à l'écran

`profil-etudiant-sections-affichage.js` (l. 3109) : les points prennent la norme du PDF, « Note finale = 44,5 pts + 28,4 pts = 72,9 % » (virgule, espace insécable avant « pts » comme avant « % » si c'est la règle du PDF : reprends exactement celle du PDF, par la même fonction s'il y en a une). Banc : la phrase rendue, par sa chaîne exacte ; break-test.

## Ensemble

Vitest complet vert ; la spec #1138 verte en WebKit ; les specs du profil touchées vertes. Mets #1138 à « fait » au BACKLOG, avec sa phrase « vérifié comment ».

## Ce qu'il ne faut pas

Le miroir ; les indices A, C, P (#1137) ; le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, le verdict de la note à la norme française (non suivi), les verdicts du critère algorithmique non encore suivis s'il en reste, le plan et la consigne du miroir s'ils ne sont pas suivis (ils servent demain), le correctif, les bancs, et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-21-avant-version.md`. Par leur chemin. `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**
