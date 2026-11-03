# La boucle sans relais : traiter la file des correctifs

Pour Claude Code. Essai décidé par Grégoire le 3 nov. 2026 à 6 h 52, du 3 au 10 nov. (plan validé : `PROPOSITION-2026-11-02-routine-de-travail.md`, point 2). Écrit par Cowork le 3 nov. au matin.

Grégoire te lance une fois : « Lis plans de travail/BOUCLE-SANS-RELAIS.md et traite la file. » Ensuite, tu travailles sans lui jusqu'à la fin de la file.

## Pourquoi

Mesuré le 2 nov. (`MESURE-2026-11-02-routine-de-travail.md`) : jusqu'à 44 consignes, demandes de relecture et verdicts de relecture par jour, chacun relayé à la main par Grégoire entre Cowork et toi. Il attend sans cesse l'une des deux machines. Le but de l'essai : qu'il n'intervienne qu'aux moments où son expertise compte (la didactique, ses données, les mots, ce qui l'engage publiquement). Chaque fois que tu as besoin de lui, ça se compte (§ 6).

## 1. Ce que tu lis, et ce que tu vérifies avant de commencer

- `CLAUDE.md` s'applique en entier (sécurité, zones protégées, ce qui remonte jusqu'à Grégoire), sauf sa lecture obligatoire : pendant l'essai, ce document et `FILE-DES-CORRECTIFS.md` la remplacent. `OU-EN-EST-ON.md`, `RELAIS.md`, `BACKLOG.md`, `SUIVI-BUGS.md` : greps ciblés seulement.
- Aucune autre session n'écrit dans `js/` ni ne fait tourner Playwright (`pgrep -fl playwright`). Sinon, arrête-toi et dis-le.
- Tu travailles sur `main`. Le lot des 30 pauses vit dans sa propre copie de travail ; ne le touche pas.

## 2. Remplir la file

- Lis les rapports de `Retours des testeurs/gregoire/` plus récents que le repère en tête de la file. Chacun devient une entrée (date, appareil, version, gravité, sa phrase telle quelle, le nom du fichier). Avance le repère.
- Inscris chaque entrée au `BACKLOG.md` sous le prochain numéro, comme d'habitude.
- Les entrées ajoutées par Cowork sont déjà dans la file.

## 3. Ce qui entre dans la boucle, et ce qui n'y entre pas

**Dans la boucle** : un correctif d'ergonomie, d'affichage, de geste, de comportement, de performance, ou un essai.

**Hors de la boucle**, dès que le correctif :
1. écrit, migre ou réinterprète des données déjà enregistrées, les siennes ou celles d'un usager ;
2. touche un format d'échange (codex, imports, exports, grilles partagées) ou `js/import-export.js`, `js/db.js`, `js/travaux-stockage.js`, `js/securite-*.js` ;
3. touche une zone protégée : `js/config.js`, `js/navigation.js`, `noms_stables.json` ;
4. change ce qu'une note, un critère ou un niveau de dépistage veut dire, ou la façon dont une note se calcule ;
5. retire une fonctionnalité ou efface quoi que ce soit ;
6. demanderait une version majeure ;
7. change les mots que lisent les élèves (rétroaction, PDF de l'élève, nom d'une grille).

Une entrée hors de la boucle passe dans « Mises de côté », avec ce que tu as mesuré et ta question en français d'utilisateur ; la file continue. Pour ces entrées, la règle 2 de `PROTOCOLE.md` reste entière. Un doute qui se lève par une mesure n'est pas un cas hors boucle : mesure.

**Les mots d'écran** : tout texte neuf ou changé que l'écran ou l'Aide affiche se rédige avec le lot et se soumet à Grégoire en fin de file (§ 5), avec les Nouvelles. Le lot ne s'arrête pas pour ça.

## 4. Pour chaque entrée, dans l'ordre

1. **Reproduire d'abord.** Non reproduit : dis-le dans la file, avec ce que tu as essayé, et passe à la suivante.
2. **Corriger à la source** (« tarir n'est pas réparer », `CLAUDE.md`). Un commit par entrée, ou plusieurs ; jamais deux entrées dans un même commit, pour qu'un verdict rouge nomme son lot.
3. **Tester.** Vitest complet ; les specs Playwright des fichiers touchés, en entier. Un essai neuf va dans Vitest si le défaut se voit sans navigateur. Au plus un essai Playwright neuf par correctif, seulement pour ce qui exige l'écran (pointeur, mise en page, iPad). Les essais qui ont servi à reproduire ou à mesurer ne restent pas dans la suite, sauf celui qui garde le correctif. Break-test de l'essai gardé (skill `verification-adverse`). Motif : les essais Playwright ont été multipliés par 5,7 depuis le 31 août, le code a grossi de 17 % ; c'est ce qui allonge la vérification.
4. **Relecture par un agent neuf.** Lance un sous-agent qui n'a pas vu ton travail. Donne-lui seulement l'entrée de la file (la phrase de Grégoire) et le diff du lot (`git show`), ni ton raisonnement ni ton rapport. Demande-lui de charger le skill `verification-adverse` et de répondre : le diff corrige-t-il ce que Grégoire a décrit ? Que pourrait-il casser ailleurs ? L'essai gardé peut-il échouer ? Le lot sort-il de la boucle (§ 3) ? Corrige ce qu'il trouve, commite, et note son verdict en une ligne dans la file.
5. **Marque l'entrée « faite »**, avec une phrase en gestes d'utilisateur (ce que Grégoire verra à l'écran), les commits et le numéro entre parenthèses, en fin de ligne.

## 5. Quand la file est vide, que tout ce qui reste est mis de côté, ou après dix entrées faites

Dix entrées au plus par passage : la mise en ligne reste quotidienne et ton contexte reste léger. La file garde l'état ; le passage suivant reprend où tu t'es arrêté.

Un seul moment avec Grégoire, une chose à la fois :
1. les questions mises de côté, une à la fois, avec ta recommandation ;
2. les mots d'écran neufs ou changés, puis les Nouvelles proposées (skill `release-et-changelog`), à valider ;
3. son signal pour la vérification. Release par `scripts/release.mjs` (patch ou mineure, à ton jugement ; tu dis lequel en une ligne), puis le verdict du Mac (`node scripts/verdict-en-morceaux.mjs`) dans les conditions du skill `fin-de-session-labo-codex`, § 4.5 et § 4.6 : Grégoire ferme Cowork, Chrome et Safari. Push seulement si vert. Rouge : les commits séparés disent quel lot ; nomme-le et arrête-toi, sans le réparer dans la foulée ;
4. après le push, écris `PORTES-TERRAIN-<date>-boucle.md` (skill `portes-terrain`) : les gestes à vérifier sur l'iPad. Cowork publie la page à son passage.

Si Grégoire n'est pas là, ne lance pas la vérification : écris où tu en es dans la file et arrête-toi.

## 6. Le journal des interventions

Chaque fois que tu as besoin de Grégoire, une ligne dans `JOURNAL-DES-INTERVENTIONS.md` : date et heure (`TZ=America/Toronto date` ; l'horloge du montage est en UTC), raison, et catégorie : didactique · données · mots · engagement public · machine (fermer des applications, redémarrer, attendre la fin d'une vérification) · autre. Les lignes « machine » sont celles que la bascule de la vérification vers GitHub doit faire disparaître. Au bout de la semaine, on compte.

## 7. Ce que tu ne fais pas pendant l'essai

- Pas de demande de relecture à Cowork ni de consigne de démarrage à réécrire : l'état vit dans la file, section « Fait ».
- Pas de mise à jour de la page du tri : Cowork la fait à son passage.
- Pas de lot hors de la file.

Pendant l'essai, la relecture croisée de la règle 2 de `PROTOCOLE.md` se fait, pour les lots de la boucle, par l'agent neuf du § 4, et Cowork relit après coup : c'est la décision de Grégoire du 3 nov. Tout ce qui sort de la boucle (§ 3) garde la règle 2 entière.

## 8. Le passage de Cowork, une fois par jour

Grégoire ouvre Cowork quand il veut : « Relecture du jour ». Cowork lit les commits du jour, la file et le journal ; publie la page de la porte terrain ; met la page du tri à jour ; ajoute à la file les retours que Grégoire lui donne de vive voix. Ce que Cowork trouve devient une entrée de la file.
