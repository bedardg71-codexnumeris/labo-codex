# Demande de relecture finale : lot F de l'enregistrement, les mots (D4)

> Écrite le 29 septembre 2026 par Claude Code, sur la branche `lot-f-les-mots` (partie de `main` = `053d96cb`, 1.167.0). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md`. Réponse d'étape de Cowork : `RELECTURE-2026-09-29-lot-F-etape-1.md` (non suivie, sur `main`). Compte rendu d'étape : `DEMANDE-RELECTURE-2026-09-28-lot-F-etape-1.md`. **Aucune release, aucun push.** Relecture croisée de Cowork exigée avant la fusion ; puis les mots et les Nouvelles vont à Grégoire.

Commits : `5a6831a3` consigne · `1393e54a` étape 1 (le témoin) · `6ddc20b8` l'automatique retiré · `1ec9ea09` les mots · `0241d8ea` les gestes hors témoin · (ce commit) la demande, #981, le banc de placement.

⚠ **Deux fichiers modifiés, pas encore commités** : `js/import-export.js` (trois textes de l'import, lignes 51 à 53 du tableau § 3) et `js/cc-license.js` (le bouton « Enregistrer », un raccord). CLAUDE.md exige `cd tests && npm test` (Vitest et Playwright) avant tout commit qui les touche : ils partent avec la suite complète, qui demande Cowork, Chrome, Safari et GitHub Desktop fermés. Ils sont lisibles dans l'arbre de travail.

## 1 · Ce que Grégoire verra

- **Le menu du codex** dit « Ton codex est à jour » ou « Ton codex n'a pas tes derniers changements ». Son bouton s'appelle « Mettre à jour le codex », le second « Mettre à jour dans un autre fichier… ». Après la mise à jour : « Codex mis à jour ». Plus d'enregistrement automatique, ni de ligne « Enregistrement auto » dans le menu.
- **Codex › Archiver** : « Groupe archivé » (ou « Groupe archivé : fichier téléchargé » sous Safari), « Groupe non archivé » sur un échec. Sous Safari, une archive dont on annule l'aperçu n'apparaît plus dans la liste des archives.
- **La copie de secours** : la carte de l'Accueil s'appelle « Copie de secours » ; dans Réglages › Données, la carte « Copie de secours » a le bouton « Faire une copie de secours ». Le rappel s'intitule « Fais une copie de secours », et son bouton ouvre vraiment la fenêtre de la copie de secours.
- **L'Aide** : la FAQ répond selon D0 à D4 ; « sauvegardé » ne veut plus dire « écrit dans l'application » nulle part ; l'aide des présences ne liste plus « Justifié » ni « Retard » ; la bulle du Rapport dit la vérité.
- **Sans rien voir de neuf** : une annotation, une carte d'alignement modifiée, un tampon, un cours retiré… rendent maintenant le codex « pas à jour ».

## 2 · Les deux décisions de la réponse d'étape, appliquées

**L'enregistrement automatique est retiré** (Grégoire, option 1) : minuteur, mode silencieux de `genererCodex` (qui sautait l'aperçu), bloc du menu, sa règle CSS et son icône. **Mesuré : aucun réglage n'était persisté** (ni préférence ni clé : le minuteur démarrait dès qu'un fichier était tenu, sous Chrome). Il n'y a donc rien à « ignorer à la lecture ». L'aide du codex ne le décrit plus (tableau, lignes 18 à 27). Essai : un fichier tenu, le codex pas à jour, chaque minuteur long de l'application déclenché trois fois, et le fichier n'est pas écrit ; mutation (minuteur rebranché) → rouge.

**Les gestes hors témoin sont raccordés** (Cowork). Inventaire complet des 531 écritures directes : `plans de travail/INVENTAIRE-2026-09-29-lot-F-ecritures-hors-temoin.md` (fait par un agent en lecture seule, relu et appliqué par moi). Décompte : 165 gestes vivants, 34 gestes sans déclencheur (code mort), 14 déjà couverts, 202 écritures de la machine, 59 d'affichage, 53 hors codex, 4 sous moratoire.

**Le mécanisme, et ce que j'ai supposé** : un geste raccordé appelle `window.signalerEcritureUsager(cle)` après son écriture réussie. C'est le même événement que le témoin commun, **sans rien afficher**. L'écriture ne change pas, l'écran non plus. Afficher « Enregistré » sur ces écrans serait étendre D0 : cette décision revient à Grégoire. Si elle vient, un appel à `temoinEnregistrement.enregistre` remplacerait celui-ci aux mêmes 101 endroits.

**Là où un écrivain sert aussi la machine**, une option `{ discret: true }` le fait taire : purge de la corbeille au démarrage, migrations, drapeau « exporté », questionnaire de démo et parcours vide du bilan à l'ouverture, pratiques prédéfinies, mode démo, migrations des modalités. Deux cas demandaient mieux qu'une option :
- **la carte d'alignement** : `sauvegarder()` réécrit toute la carte à 56 endroits, dont le changement d'onglet. `sauvegarderCarte` compare donc le contenu avant et après, et ne signale qu'une carte qui a changé ;
- **l'annotation** : elle se réécrit à la désactivation et à la fermeture de l'onglet, même sans trait. Elle ne signale que s'il restait un trait en attente.

**Mes arbitrages sur la section « À trancher » de l'inventaire** (techniques, à contrôler) :

| Cas | Décision | Motif |
|---|---|---|
| État du tirage (qui a été tiré, exclusions, remise) | non raccordé (affichage) | pas un changement de données de l'enseignant ; les **questions saisies**, elles, sont raccordées |
| Changer de groupe-cours, de cours ou de trimestre actif (drapeaux `actif`) | non raccordé (affichage) | contexte d'affichage |
| Masquer / afficher un groupe-cours dans la barre | non raccordé (affichage) | idem |
| Drapeau « exporté » d'une copie | discret | effet de bord d'un export |
| Mode de synthèse des erreurs, raccourcis clavier | **raccordés** | réglages qui changent ce que l'app produit ; les réglages de Réglages passent déjà par le témoin |
| Import d'un fichier de configuration (import-export) | raccordé (par les modalités) | le codex ouvert n'a plus ce qui est à l'écran |
| Réglages d'affichage ou d'export (mode expert, options du rapport, rythme, rapports de bug) | non raccordés | interface |
| Captures A-C-P reconstruites, démo du bilan | machine | données dérivées ou démo |

**Non raccordés, et pourquoi** : les 34 gestes sans déclencheur (issue 3 : pas de geste, rien à dire ; liste dans l'inventaire, § « Trouvailles », point 1) ; l'assistant de migration des catégories de productions et la fenêtre « Sauvegarder la configuration » des pratiques (plus aucun appelant) ; **le moratoire #622** : `trimestres.js` et `trimestre-v2-liste.js` ne changent pas. Deux gestes restent donc sans signal, assumé : **créer un trimestre depuis la liste des trimestres** et **l'export « format recherche »**. Ils se raccorderont quand le moratoire tombera, par un appel dans `creerTrimestre` et un dans `exporterFormatRecherche`.

## 3 · Tableau complet des textes (Grégoire les relit tous)

Tutoiement, sans tiret cadratin. Les tirets cadratins des textes touchés ont été retirés ; ceux des textes voisins, non touchés, restent. « ‹…› » marque une valeur variable.

### Codex (menu, messages, détails, aide)

Déjà décidés par D4, posés à l'étape 1 (hors numérotation) : la ligne d'état du menu, « Tout est enregistré » → « Ton codex est à jour » et « Modifications non enregistrées » → « Ton codex n'a pas tes derniers changements ». La fermeture d'un codex pas à jour figure en ligne 17.

| # | Où | Avant | Après |
|---|---|---|---|
| 1 | Menu du codex, libellé du bouton (`js/codex.js`) | Enregistrer le codex | Mettre à jour le codex |
| 2 | Menu du codex, sous-texte (Chrome, fichier déjà choisi) (`js/codex.js`) | Vers le même emplacement | Dans le même fichier |
| 3 | Message après « Mettre à jour le codex » (`js/codex.js`) | Codex enregistré (taille – même emplacement / emplacement choisi / Fichiers / Téléchargements) | Codex mis à jour (taille – même fichier / fichier choisi / Fichiers / Téléchargements) |
| 4 | Message après « Mettre à jour le codex », lieu (`js/codex.js`) | même emplacement / emplacement choisi | même fichier / fichier choisi |
| 5 | Message après « Mettre à jour dans un autre fichier… » (`js/codex.js`) | Codex enregistré (taille – nouvel emplacement / Fichiers / Téléchargements) | Codex mis à jour (taille – nouveau fichier / Fichiers / Téléchargements) |
| 6 | Détails du codex, mode Chrome (`js/codex.js`) | Mode : enregistrement direct sur le fichier ouvert (Chrome/Edge). | Mode : mise à jour directe du fichier ouvert (Chrome/Edge). |
| 7 | Détails du codex, mode Safari/iPad (`js/codex.js`) | Mode : téléchargement d'un nouveau fichier à chaque enregistrement (Safari/iPad). Pense à remplacer manuellement le fichier précédent sur ta clé USB. | Mode : téléchargement d'un nouveau fichier à chaque mise à jour (Safari/iPad). Pense à remplacer toi-même le fichier précédent sur ta clé USB. |
| 8 | Détails, aucun codex actif (`js/codex.js`) | Pour commencer : • « Ouvrir un codex »… • « Nouveau codex »… • « Enregistrer le codex » pour sauvegarder tes données actuelles | Pour commencer : • « Ouvrir un codex »… • « Nouveau codex »… • « Mettre à jour le codex » pour mettre tes données actuelles dans un fichier |
| 9 | Détails du codex, date (`js/codex.js`) | Dernière sauvegarde : ‹date› | Dernière mise à jour : ‹date› |
| 10 | Fin de la fusion (`js/codex.js`) | Pense à enregistrer le codex pour sauvegarder la fusion. | Pense à mettre à jour le codex pour y mettre la fusion. |
| 11 | Comparer deux codex, codex local (`js/codex.js`) | Dernière sauvegarde : ‹date› | Dernière mise à jour : ‹date› |
| 12 | Comparer deux codex, codex externe (`js/codex.js`) | Dernière sauvegarde : ‹date› | Dernière mise à jour : ‹date› |
| 13 | Export sélectif, un seul trimestre (`js/codex.js`) | Utilise « Enregistrer le codex » pour un export complet. | Utilise « Mettre à jour le codex » pour un export complet. |
| 14 | Export sélectif, message final (`js/codex.js`) | Export sélectif enregistré | Export sélectif terminé |
| 15 | Fusionner sans codex actif (`js/codex.js`) | Ouvre d'abord un codex (ou enregistre tes données), puis utilise « Fusionner »… | Ouvre d'abord un codex (ou mets à jour le codex avec tes données), puis utilise « Fusionner »… |
| 16 | Comparer sans codex actif (`js/codex.js`) | Ouvre d'abord un codex (ou enregistre tes données), puis utilise « Comparer »… | Ouvre d'abord un codex (ou mets à jour le codex avec tes données), puis utilise « Comparer »… |
| 17 | Fermer le codex pas à jour, titre (`js/codex.js`) | Modifications non enregistrées / Des modifications ne sont pas enregistrées. Fermer quand même ? | Ton codex n'a pas tes derniers changements / Tes données restent dans l'application ; seul le fichier du codex n'est pas à jour. Fermer le codex quand même ? |
| 18 | Aide › Codex, flux de travail (bureau) (`index.html`) | Au bureau (MacBook) : Travaille normalement. Avant de partir, enregistre le codex sur ta clé USB (Codex → Enregistrer) | Au bureau (MacBook) : Travaille normalement. Avant de partir, mets à jour le codex sur ta clé USB (Codex → Mettre à jour le codex) |
| 19 | Aide › Codex, flux de travail (classe) (`index.html`) | En classe (iPad ou autre poste) : … Saisis tes présences, évalue. Enregistre avant de partir | En classe (iPad ou autre poste) : … Saisis tes présences, évalue. Mets à jour le codex avant de partir |
| 20 | Aide › Codex, fonctions du menu (`index.html`) | Enregistrer le codex : Sauvegarde vers le même emplacement (Chrome/Edge : sans dialogue grâce à l'auto-save) / Enregistrer sous : Sauvegarde vers un nouvel emplacement | Mettre à jour le codex : Écrit tes données actuelles dans le fichier du codex. Chrome et Edge réécrivent le même fichier, sans fenêtre ; Safari et l'iPad téléchargent un nouveau fichier / Mettre à jour dans un autre fichier : Écrit tes données actuelles dans un nouveau fichier, à l'endroit que tu choisis |
| 21 | Aide › Codex, section « Auto-save (Chrome et Edge) » (`index.html`) | Auto-save (Chrome et Edge) / Sur Chrome et Edge, quand tu ouvres un codex avec le sélecteur de fichier natif, l'application obtient un accès en écriture au fichier. L'auto-save se déclenche alors automatiquement toutes les 5 minutes — tes données sont écrites directement sur la clé USB sans aucune intervention. Le statut apparaît dans le menu Codex. / Sur Safari et iPad, l'auto-save n'est pas disponible (limitation du navigateur). Tu dois enregistrer manuellement. | Ton codex est-il à jour ? / Tout ce que tu fais s'enregistre dans l'application, sur cet appareil. Le fichier du codex, lui, ne change que lorsque tu choisis « Mettre à jour le codex ». Le menu Codex te dit où il en est : « Ton codex est à jour », ou « Ton codex n'a pas tes derniers changements ». |
| 22 | Aide › Codex, titre du tableau comparatif (`index.html`) | Codex vs Sauvegarde — quelle différence ? | Codex ou copie de secours : quelle différence ? |
| 23 | Aide › Codex, tableau, en-tête de colonne (`index.html`) | Sauvegarde (Réglages → Données) | Copie de secours (Réglages → Données) |
| 24 | Aide › Codex, tableau, ligne « Contenu » (`index.html`) | Données seulement (pas de fichiers) | Les données que tu coches ; les fichiers de travaux s'y ajoutent si tu les coches |
| 25 | Aide › Codex, tableau, ligne « Format » (`index.html`) | .json (texte brut) | .json (texte brut), ou .zip avec les fichiers de travaux |
| 26 | Aide › Codex, tableau, ligne « Auto-save » (retirée) (`index.html`) | Auto-save \| Oui (Chrome/Edge, toutes les 5 min) \| Non (rappel périodique seulement) | Mise à jour \| Quand tu choisis « Mettre à jour le codex » \| Quand tu la fais ; un rappel te la propose |
| 27 | Aide › Codex, en résumé (`index.html`) | En résumé : le codex est ton outil de travail quotidien. La sauvegarde JSON est ton filet de sécurité. Les deux sont complémentaires — utilise le codex pour travailler, fais une sauvegarde JSON de temps en temps comme assurance. | En résumé : le codex est ton outil de travail quotidien. La copie de secours est ton filet de sécurité. Les deux se complètent : utilise le codex pour travailler, et fais une copie de secours de temps en temps, par précaution. |

### Réserve (archives)

| # | Où | Avant | Après |
|---|---|---|---|
| 28 | Codex › Archiver, message de réussite (Chrome, dossier sur disque) (`js/reserve.js`) | Archive enregistrée (N étudiant(s), N fichier(s) — dossier) | Groupe archivé (N étudiant(s), N fichier(s) : dossier) |
| 29 | Codex › Archiver, message de réussite (Safari, fichier téléchargé) (`js/reserve.js`) | Archive téléchargée (N étudiant(s), N fichier(s) (taille)) | Groupe archivé : fichier téléchargé (N étudiant(s), N fichier(s) (taille)) |
| 30 | Codex › Archiver, échec (`js/reserve.js`) | Erreur de archive (‹raison›) | Groupe non archivé (‹raison›) |
| 31 | Codex › Archiver, mode automatique (Chrome), premier archivage (`js/reserve.js`) | Mode automatique (Chrome/Edge) — au premier archivage, choisis le dossier Archives où enregistrer. Les archives suivants iront automatiquement au même endroit. | Mode automatique (Chrome/Edge) : au premier archivage, choisis le dossier Archives où ranger tes archives. Les suivantes iront automatiquement au même endroit. |
| 32 | Réglages › Données › Archives, liste vide (`js/reserve-reglages.js`) | Aucune archive enregistrée. Utilise Codex › Archiver… pour archiver un groupe-cours. | Aucune archive pour l’instant. Utilise Codex › Archiver… pour archiver un groupe-cours. |
| 33 | Réglages › Données › Archives, titre du tableau (`index.html`) | Archives enregistrées | Archives |

### Copie de secours (Accueil, Réglages › Données, rappel, import)

| # | Où | Avant | Après |
|---|---|---|---|
| 34 | Réglages › Données, carte 1, titre (`index.html`) | Codex (espace de travail actif) | Copie de secours, ouverture et partage |
| 35 | Réglages › Données, carte 1, présentation (`index.html`) | Le Codex est ton espace de travail trimestriel. Exporte-le pour le transporter sur clé USB, ouvre-en un existant, ou exporte ta configuration pédagogique pour la partager. | Fais une copie de secours de tes données, ouvre un fichier (codex, copie de secours ou configuration partagée), ou exporte ta configuration pédagogique pour la partager. Pour transporter ton travail sur ta clé USB, utilise le menu Codex, en haut de l'écran. |
| 36 | Réglages › Données, copie de secours, titre (`index.html`) | Exporter le Codex | Copie de secours |
| 37 | Réglages › Données, copie de secours, description (`index.html`) | ZIP complet du trimestre actif : données, bibliothèques et fichiers étudiants. / Pour transporter sur clé USB ou restaurer ailleurs. | Un fichier avec les données que tu choisis ; coche « Toutes les clés » pour tout garder. / Pour restaurer tes données sur cet appareil ou un autre. |
| 38 | Réglages › Données, copie de secours, bouton (`index.html`) | Exporter le Codex | Faire une copie de secours |
| 39 | Réglages › Données, ouvrir un fichier, description (`index.html`) | Importe un Codex complet ou une configuration partagée. | Ouvre un codex, une copie de secours ou une configuration partagée. |
| 40 | Fenêtre de la copie de secours, titre (`index.html`) | Exporter les données | Copie de secours |
| 41 | Rappel, titre (`js/modal-backup-reminder.js`) | Protège tes données | Fais une copie de secours |
| 42 | Rappel, solution (`js/modal-backup-reminder.js`) | Solution : Exporte régulièrement tes données via Réglages → Données. Le fichier JSON peut être réimporté à tout moment pour restaurer tes données. | Solution : fais régulièrement une copie de secours (Réglages → Données). Ce fichier se réimporte à tout moment pour restaurer tes données. |
| 43 | Rappel, bouton principal (`js/modal-backup-reminder.js`) | Exporter maintenant (ouvrait Réglages › Données, sans rien exporter) | Faire une copie de secours (ouvre Réglages › Données et la fenêtre de la copie de secours) |
| 44 | Accueil, carte des utilitaires, titre (`js/accueil.js`) | Sauvegarder | Copie de secours |
| 45 | Bulle, Réglages › Données, carte 1 (`js/accompagnement-contenu-hover.js`) | Le Codex est ton espace de travail trimestriel. Exporte-le, ouvre un Codex existant, ou exporte ta configuration pédagogique pour la partager. | Fais une copie de secours de tes données, ouvre un fichier (codex, copie de secours ou configuration partagée), ou exporte ta configuration pédagogique pour la partager. |
| 46 | Bulle, Réglages › Données, copie de secours (`js/accompagnement-contenu-hover.js`) | ZIP complet de ton trimestre actif : données, bibliothèques et fichiers étudiants. Pour transporter sur clé USB ou restaurer ailleurs. | Un fichier avec les données que tu choisis ; coche « Toutes les clés » pour tout garder. Pour restaurer tes données sur cet appareil ou un autre. |
| 47 | Bulle, Réglages › Données, ouvrir un fichier (`js/accompagnement-contenu-hover.js`) | Importe un Codex complet ou une configuration partagée. Le type est détecté automatiquement. | Ouvre un codex, une copie de secours ou une configuration partagée. Le type est détecté automatiquement. |
| 48 | Bulle, menu Réglages › Données (`js/accompagnement-contenu-hover.js`) | Sauvegarde, restauration, captures A-C-P, export anonymisé, réinitialisation et maintenance. | Copie de secours, restauration, captures A-C-P, export anonymisé, réinitialisation et maintenance. |
| 49 | Aide de la copie de secours, titre (`js/accompagnement-contenu-popup.js`) | Exporter une sauvegarde sélective | Faire une copie de secours |
| 50 | Aide de la copie de secours, texte (`js/accompagnement-contenu-popup.js`) | Cette modale permet de choisir précisément quelles clés de stockage exporter dans un fichier JSON (ou ZIP si tu inclus les fichiers travaux). Pour une sauvegarde complète, préfère le Codex (Réglages > Données). | Cette fenêtre te laisse choisir quelles clés de stockage mettre dans ta copie de secours : un fichier JSON, ou ZIP si tu inclus les fichiers de travaux. Coche « Toutes les clés » pour une copie complète. Pour transporter ton travail d'un appareil à l'autre, préfère le codex (menu Codex, en haut). |
| 51 | Import, titre d'une restauration sur un nouvel appareil (`js/import-export.js`) | Restauration de ‹prénom› (à défaut : ta sauvegarde) | Restauration de ‹prénom› (à défaut : ta copie de secours) |
| 52 | Import, titre d'un fichier personnel (`js/import-export.js`) | Sauvegarde personnelle | Copie de secours personnelle |
| 53 | Import, case de confirmation (`js/import-export.js`) | C'est ma propre sauvegarde – Je confirme que ce fichier m'appartient | C'est ma propre copie de secours – Je confirme que ce fichier m'appartient |

### FAQ, glossaire et aides de sections (index.html)

| # | Où | Avant | Après |
|---|---|---|---|
| 54 | Menu du codex, libellé du bouton (HTML) (`index.html`) | Enregistrer le codex | Mettre à jour le codex |
| 55 | Menu du codex, second bouton (`index.html`) | Enregistrer sous… | Mettre à jour dans un autre fichier… |
| 56 | Aide, archivage d'un trimestre (`index.html`) | Les statistiques finales sont calculées et sauvegardées | Les statistiques finales sont calculées et enregistrées |
| 57 | Aide › Préférences (`index.html`) | Les préférences te permettent d'adapter l'application à ton style de travail. Tout changement est sauvegardé automatiquement. | Les préférences te permettent d'adapter l'application à ton style de travail. Tout changement s'enregistre automatiquement. |
| 58 | Aide, mode normal (`index.html`) | Données sauvegardées localement sur ton appareil | Données enregistrées sur ton appareil |
| 59 | Aide, import des travaux, stockage (`index.html`) | Stockage : Les fichiers sont sauvegardés automatiquement. Sur Mac, ils peuvent aussi être stockés directement sur ton disque. | Stockage : Les fichiers s'enregistrent automatiquement dans l'application. Sur Mac, ils peuvent aussi être rangés directement sur ton disque. |
| 60 | Aide › Cartouches, import d'un texte (`index.html`) | Sauvegarder au format .txt avec structure Markdown | Enregistrer au format .txt avec structure Markdown |
| 61 | Aide › Interventions, présences (`index.html`) | Si tu sauvegardes sans compléter, les données restent dans le module Interventions seulement | Si tu enregistres sans compléter, les données restent dans le module Interventions seulement |
| 62 | Aide › Annotation, persistance (`index.html`) | Persistance : Les annotations sont sauvegardées sur ton appareil et persistent entre les séances. Tu retrouves ton document annoté à la prochaine ouverture. | Persistance : Les annotations s'enregistrent sur ton appareil et restent d'une séance à l'autre. Tu retrouves ton document annoté à la prochaine ouverture. |
| 63 | Aide, dépannage (données perdues), solution (`index.html`) | Solution : Utiliser Réglages → Données régulièrement pour créer des sauvegardes JSON | Solution : Restaurer ta dernière copie de secours (Réglages → Données → Ouvrir un Codex…) |
| 64 | Aide, dépannage (données perdues), prévention (`index.html`) | Prévention : Exporter tes données régulièrement via le Codex ou Réglages → Données | Prévention : Faire une copie de secours régulièrement (Réglages → Données), et mettre à jour ton codex |
| 65 | FAQ, question (`index.html`) | Mes données sont-elles sauvegardées automatiquement ? | Mes données s'enregistrent-elles toutes seules ? |
| 66 | FAQ, réponse (`index.html`) | Oui, toutes les modifications sont sauvegardées automatiquement dans ton navigateur. | Oui, dans l'application. Ce que tu fais s'enregistre dans ton navigateur, sur cet appareil, et le témoin « Enregistré », en bas de l'écran, te le confirme. Quelques écrans de création (une production, une intervention, une fiche du Cadre) attendent leur bouton : tant que tu ne l'as pas cliqué, rien n'est écrit, et l'application te prévient si tu quittes sans l'avoir fait. / Le codex est un fichier, sur ta clé USB par exemple. Il ne change que lorsque tu choisis « Mettre à jour le codex », et le menu Codex te dit s'il est à jour. / La copie de secours (Réglages → Données) est un fichier que tu gardes par précaution, pour retrouver tes données si le navigateur les perd. |
| 67 | FAQ, recommandation (`index.html`) | Recommandation : Exporte tes données régulièrement via Réglages → Données pour créer des sauvegardes JSON. | Recommandation : Fais une copie de secours régulièrement (Réglages → Données). |
| 68 | Glossaire, Codex (`index.html`) | Fichier de sauvegarde portable (format ZIP) contenant toutes les données d'un trimestre. Permet le transfert entre appareils via clé USB et la sauvegarde hors-ligne. Géré par le module Codex (menu en haut à droite). | Fichier portable (format ZIP) contenant toutes tes données et les fichiers de travaux. Permet de passer d'un appareil à l'autre avec une clé USB. Il ne change que lorsque tu choisis « Mettre à jour le codex » (menu Codex, en haut à droite). |
| 69 | Glossaire, terme sous la lettre L (`index.html`) | Sauvegarde locale | Local (stockage) |
| 70 | Glossaire, définition (`index.html`) | Espace de sauvegarde dans ton navigateur. … Pense à exporter régulièrement via le Codex. | L'espace de ton navigateur où tes données s'enregistrent. … Pense à faire une copie de secours régulièrement. |
| 71 | Aide › Données, titre de la section (`index.html`) | Exporter et sauvegarder tes données | Copie de secours et partage de tes données |
| 72 | Aide › Données, introduction (`index.html`) | La section Données offre trois options de sauvegarde et restauration : | La section Données offre trois options pour protéger, restaurer et partager tes données : |
| 73 | Aide › Données, option 1 (`index.html`) | Sauvegarde complète : Toutes tes données (cours, étudiant·es, présences, évaluations, configurations). Pour restaurer sur cet appareil ou un autre. | Copie de secours : Les données que tu coches, toutes si tu veux (cours, étudiant·es, présences, évaluations, configurations). Pour restaurer sur cet appareil ou un autre. |
| 74 | Aide › Données, option 3 (`index.html`) | Importer un fichier : Restaure une sauvegarde personnelle ou importe la configuration d'un collègue. | Importer un fichier : Restaure une copie de secours ou importe la configuration d'un collègue. |
| 75 | Aide › Données, bonne pratique 1 (`index.html`) | Exporte régulièrement : Clique « Exporter le Codex » pour créer une sauvegarde JSON complète | Fais une copie de secours régulièrement : Clique « Faire une copie de secours » et coche « Toutes les clés » |
| 76 | Aide › Données, bonne pratique 2 (`index.html`) | Avant un changement majeur : Sauvegarde avant de modifier tes pratiques ou grilles | Avant un changement majeur : Fais une copie de secours avant de modifier tes pratiques ou grilles |
| 77 | Aide › Données, avertissement (`index.html`) | … tes données seront perdues. L'export JSON est ta seule protection. | … tes données seront perdues. Ta copie de secours et ton codex sont tes seules protections. |
| 78 | Aide › Données, Loi 25 (#862, texte approuvé par Grégoire) (`index.html`) | Personne ne sauvegarde à ta place : utilise « Exporter le Codex » régulièrement. | Personne ne fait de copie de secours à ta place : utilise « Faire une copie de secours » régulièrement. |

### Bulles et fenêtres d'aide

| # | Où | Avant | Après |
|---|---|---|---|
| 79 | Bulle de l'en-tête, bouton Codex (`js/accompagnement-contenu-hover.js`) | Ton cahier de travail portable sur clé USB — toutes tes données dans un fichier que tu enregistres et ouvres manuellement. Pastille verte = enregistré, orange = modifications non enregistrées. | Ton cahier de travail portable sur clé USB : toutes tes données dans un fichier que tu mets à jour et ouvres toi-même. Pastille verte : ton codex est à jour. Orange : il n'a pas tes derniers changements. |
| 80 | Bulle, bilan post-intervention (`js/accompagnement-contenu-hover.js`) | Bilan post-intervention. … L'«avant» est capturé au moment de la première sauvegarde, l'«après» est calculé en temps réel. | Bilan post-intervention. … L'«avant» est capturé au premier enregistrement, l'«après» est calculé en temps réel. |
| 81 | Aide du volet confidentiel (`js/accompagnement-contenu-popup.js`) | Cette information voyage avec ton Codex (la sauvegarde complète). Si tu partages un Codex avec quelqu'un, vérifie d'abord que ces données ne doivent pas y être. | Cette information voyage avec ton codex et tes copies de secours. Si tu partages un codex avec quelqu'un, vérifie d'abord que ces données ne doivent pas y être. |
| 82 | Aide de l'import, texte (`js/accompagnement-contenu-popup.js`) | … L'import écrase les clés correspondantes — utilise-le pour restaurer une sauvegarde ou migrer un trimestre d'un appareil à l'autre. | … L'import écrase les clés correspondantes : utilise-le pour restaurer une copie de secours ou migrer un trimestre d'un appareil à l'autre. |
| 83 | Aide de l'import, format .json (`js/accompagnement-contenu-popup.js`) | .json — sauvegarde sélective sans fichiers travaux. | .json : copie de secours sans fichiers de travaux. |
| 84 | Aide de l'import, format .zip (`js/accompagnement-contenu-popup.js`) | .zip — sauvegarde sélective avec fichiers travaux, ou export configuration complète. | .zip : copie de secours avec fichiers de travaux, ou configuration partagée. |
| 85 | Aide de l'import, conseil (`js/accompagnement-contenu-popup.js`) | Fais toujours un Codex de sauvegarde avant un import — c'est ton filet de sécurité… | Fais toujours une copie de secours avant un import : c'est ton filet de sécurité… |
| 86 | Aide « Saisir les présences efficacement », états (`js/accompagnement-contenu-popup.js`) | Présent : l'étudiant était présent au cours / Absent : absence non justifiée / Justifié : absence avec motif valide (maladie, etc.) / Retard : arrivée tardive au cours | Présent : toutes les périodes de la séance / Absent : 0 période / Présence partielle : moins de périodes que la séance (arrivée tardive, départ hâtif) |
| 87 | Profil › Rapport, bulle « À propos du rapport » (`js/profil-etudiant-rapport.js`) | Le rapport est généré à la demande avec les données actuelles et n'est pas sauvegardé automatiquement. Tu peux modifier le texte avant de le copier. | Le rapport est généré à la demande avec les données actuelles. Son texte ne s'enregistre nulle part : si tu le modifies, copie-le avant de quitter l'écran. Tes notes, dans le champ du dessous, s'enregistrent. |
| 88 | Aide des bibliothèques, bouton Exporter (`js/accompagnement-contenu-popup.js`) | Exporter : télécharge l'élément en fichier JSON pour le partager ou le sauvegarder | Exporter : télécharge l'élément en fichier JSON pour le partager ou le garder |
| 89 | Aide, contenu d'un groupe-cours (`js/accompagnement-contenu-popup.js`) | Les étudiant·es du groupe (liste, présences, évaluations sauvegardées) | Les étudiant·es du groupe (liste, présences, évaluations enregistrées) |
| 90 | Aide, statistiques (`js/accompagnement-contenu-popup.js`) | Évaluations : nombre total d'évaluations sauvegardées. | Évaluations : nombre total d'évaluations enregistrées. |
| 91 | Aide de l'assistant de pratique, étape 8 (`js/accompagnement-contenu-popup.js`) | 8. Récapitulatif — relecture avant sauvegarde. | 8. Récapitulatif : relecture avant l'enregistrement. |
| 92 | Aide de l'assistant de pratique, quitter (`js/accompagnement-contenu-popup.js`) | Tu peux quitter l'assistant à tout moment avec la croix — rien n'est sauvegardé tant que tu n'as pas atteint la dernière étape. … | Tu peux quitter l'assistant à tout moment avec la croix : rien n'est enregistré tant que tu n'as pas atteint la dernière étape. … |

### Écrans (boutons et messages)

| # | Où | Avant | Après |
|---|---|---|---|
| 93 | Métadonnées d'une ressource (licence), bouton (`js/cc-license.js`) | Sauvegarder | Enregistrer |
| 94 | Évaluation, grille d'origine introuvable (`js/evaluation.js`) | Grille d'origine introuvable dans les modèles actuels — affichage depuis les données sauvegardées. | Grille d'origine introuvable dans les modèles actuels : affichage depuis les données enregistrées. |
| 95 | Grilles, critère ajouté (`js/grilles.js`) | Critère « ‹nom› » ajouté et grille « ‹grille› » sauvegardée ! | Critère « ‹nom› » ajouté et grille « ‹grille› » enregistrée ! |
| 96 | Grilles, catégories d'erreurs, bouton (`js/grilles.js`) | Sauvegarder | Enregistrer |
| 97 | Grilles, catégories d'erreurs, message (`js/grilles.js`) | Catégories d'erreurs sauvegardées ! | Catégories d'erreurs enregistrées ! |
| 98 | Horaire, séances ajoutées, message (`js/horaire.js`) | Séance sauvegardée avec succès / N séances sauvegardées avec succès | Séance enregistrée / N séances enregistrées |
| 99 | Horaire, modifier une séance, bouton (`js/horaire.js`) | Sauvegarder | Enregistrer |
| 100 | Liste, propriétés d'un fichier, bouton (`js/liste-evaluations.js`) | Sauvegarder | Enregistrer |
| 101 | Objectifs, ensemble, bouton (`js/objectifs.js`) | Sauvegarder | Enregistrer |
| 102 | Objectifs, ensemble modifié, bouton (`js/objectifs.js`) | Sauvegarder * | Enregistrer * |
| 103 | Objectifs, pondérations ≠ 100 % (`js/objectifs.js`) | Le total des pondérations est de N % au lieu de 100 %. Veux-tu quand même sauvegarder ? | Le total des pondérations est de N % au lieu de 100 %. Veux-tu quand même enregistrer ? |
| 104 | Objectifs, ensemble enregistré (`js/objectifs.js`) | ✅ Ensemble d'objectifs sauvegardé ! | ✅ Ensemble d'objectifs enregistré ! |
| 105 | Portfolio, échec d'une case (`js/portfolio.js`) | Erreur lors de la sauvegarde | Erreur lors de l'enregistrement |
| 106 | Suivi longitudinal, pérennité du registre (`js/registre-longitudinal.js`) | Le registre est sauvegardé par l'export complet seulement (Réglages › Données), pas par l'archive d'un trimestre. | Le registre voyage dans ton codex, et dans ta copie de secours si tu coches toutes les clés (Réglages › Données) ; pas dans l'archive d'un trimestre. |
| 107 | Éditeur de pages d'une copie, bouton (`js/travaux-ui.js`) | Sauvegarder | Enregistrer |
| 108 | Éditeur de pages d'une copie, échec (`js/travaux-ui.js`) | Erreur lors de la sauvegarde : ‹raison› | Erreur lors de l'enregistrement : ‹raison› |
| 109 | Rétroaction d'une copie (fenêtre), bouton (`js/travaux-ui.js`) | Sauvegarder | Enregistrer |
| 110 | Rétroaction d'une copie (fenêtre), message (`js/travaux-ui.js`) | Rétroaction sauvegardée | Rétroaction enregistrée |
| 111 | Cadre › Élèves, groupe importé (`js/trimestre-v2-etudiants.js`) | Groupe N sauvegardé (N étudiants) | Groupe N enregistré (N étudiants) |
| 112 | README du dépôt, mise en garde Beta (`README.md`) | Effectuez des sauvegardes régulières de vos données : Réglages → Archives → Archiver le groupe-cours ; ou Réglages → Codex → Enregistrer le codex (export ZIP portable) | Effectuez des copies de secours régulières de vos données : Réglages → Données → Faire une copie de secours ; ou Codex (menu du haut) → Mettre à jour le codex (fichier ZIP portable) ; et, en fin de trimestre, Codex → Archiver (un groupe-cours dans les archives) |
**Non modifiés, à signaler** :
- `js/trimestre-v2-liste.js` (moratoire #622) garde « Un export de sauvegarde sera téléchargé automatiquement avant la suppression » et « L'export de sauvegarde a échoué ».
- `js/changelog-data.js` : annonces déjà lues, non réécrites (exception de la sentinelle).
- Les noms de fichiers ne changent pas : la copie de secours s'appelle encore `sauvegarde-‹auteur›-‹date›.json` ou `.zip`. Ce nom voyage, et l'import le reconnaît par son contenu ; le renommer est une question à part pour Grégoire.
- La liste de synonymes de la recherche de l'Aide garde « sauvegarde portable » : quelqu'un qui tape « sauvegarde » doit encore trouver le codex.
- L'aide du codex dit « un fichier `.codex.zip` », alors que le fichier réel finit par `.zip` (`codex-‹nom›-‹date›.zip`). C'est hors D4 et je ne l'ai pas touché : issue 2 si Grégoire le veut.
- **Hors dépôt** : le blogue et ses tutoriels. Aucun lien du dépôt n'y renvoie pour « Codex → Enregistrer ». Grégoire devra relire lui-même les pages qui décrivent le menu du codex.
- **Dans le dépôt, anciens guides** (`docs/utilisateur/DEMARRAGE_RAPIDE.md`, `GUIDE_TESTEURS.md`, au vouvoiement, écrans périmés) : non touchés. À trancher : les retirer, ou les réécrire comme un chantier à part. Le `README.md` du dépôt est corrigé (ligne 112 du tableau). Une ADR et un paragraphe historique d'`ECOSYSTEME-DONNEES.md` citent « Enregistrer le codex » : ce sont des récits datés, laissés tels quels.

## 4 · Mesures faites en chemin

- **Le rappel** (étape 3) : la prémisse disait que « Exporter maintenant » ne faisait rien. Mesuré : il **ouvrait** Réglages › Données et repoussait le rappel de 7 jours, sans rien exporter ni ouvrir de fenêtre ; son repli (`[data-sous-section="import-export"]`) n'était jamais atteint. Il ouvre maintenant la section **et** la fenêtre de la copie de secours ; le repli mort est retiré.
- **Le mensonge Safari de la Réserve** (`reserve.js`, mode ZIP) : l'archive était inscrite à la liste AVANT l'aperçu ; un aperçu annulé ou une compression échouée la laissait listée sans fichier. Elle est maintenant **calculée** avant (le ZIP garde l'historique complet, #248) et **inscrite** après le téléchargement. C'est la même écriture, dans la même clé, plus tard : rien de neuf n'est écrit ni effacé. Corrigé dans le lot, comme le permettait la consigne.
- **La bulle du Rapport** : le texte du rapport ne s'enregistre nulle part, mais les notes du champ du dessous s'enregistrent (#866). La bulle dit les deux.
- **L'aide des présences** : l'écran fait saisir un nombre de périodes (toutes : présent ; 0 : absent ; moins : couleur à part). L'aide liste maintenant ces trois cas.

## 5 · Stock : ce que le lot tarit, et ce qu'il laisse

- **L'état « à jour » déjà enregistré chez les usagers n'est pas fiable.** Avant le lot, rien ne marquait les changements : un codex actif dit « à jour » depuis sa dernière écriture, même si des semaines de travail ont suivi. À l'ouverture de 1.168.0, le témoin dira donc « Ton codex est à jour » **jusqu'au premier geste**, et ce sera peut-être faux. **Question pour Grégoire** (écrire dans l'état de quelqu'un remonte à lui) :
  - (a) laisser faire : le premier geste corrige l'état ;
  - (b) une seule fois, au premier chargement de la nouvelle version, poser « pas à jour » si un codex est actif. Cela écrit `_codex_etat` seulement, jamais les données pédagogiques.

  Je recommande (b) : c'est la seule façon que le premier message soit vrai. Rien n'est fait tant qu'il n'a pas répondu.
- **Les archives fantômes déjà listées sous Safari** (une entrée sans fichier) restent dans `_manifesteReserve`. La source est tarie, le stock n'est ni mesuré ni réparé.
- Aucun fichier codex n'est écrit par le lot sans le geste de l'usager (l'automatique n'existe plus).

## 6 · Preuves

| Banc (WebKit) | Résultat | Mutations |
|---|---|---|
| `codex-temoin-dit-vrai-lot-f.spec.js` : ouverture sans effet, trois chemins du témoin, écriture discrète, mise à jour, aperçu annulé, écriture pendant la génération, « autre fichier » annulé, aucun minuteur n'écrit le fichier | 1/1 | 7/7 rouges (écoute retirée, émission retirée, état avant l'écriture, aperçu lu comme succès, compteur ignoré, automatique rallumé, minuteur rebranché) |
| `lot-f-rappel-et-reserve.spec.js` : le rappel ouvre la copie de secours ; archive annulée non listée, archive acceptée listée après le téléchargement | 2/2 | 2/2 rouges |
| `lot-f-gestes-hors-temoin.spec.js` : un geste par famille atteignable signale, la machine se tait (purge, carte inchangée, onglet, `discret`) ; la chaîne jusqu'au témoin du codex | 2/2 | 4/4 rouges (accroche muette, un raccord retiré, purge non discrète, carte sans comparaison) |
| `lot-f-placement-mots.spec.js` : menu du codex, carte de la copie de secours, carte de l'Accueil, à 768, 1024, 1180 et 1470 px, sans débordement ni sortie d'écran | 4/4 | aucune (mesure) |

- **Sentinelles Vitest** : `sentinelle-lot-F-les-mots-d4.test.js` refuse les sept anciens textes dans `js/` et `index.html` (mutation « Erreur de archive » remise → rouge) ; `sentinelle-lot-F-gestes-hors-temoin.test.js` fige les 101 raccords de 46 fichiers et tient le moratoire (mutations → rouge). Deux sentinelles existantes remises au nouveau vocabulaire (#862, audit de l'Aide), une au `discret` de la purge (#572).
- **Vitest** depuis `tests/` : 661 fichiers, 7 756/7 756.
- **Placement** : à 768 px, « Mettre à jour dans un autre fichier… » tient sur deux lignes dans le menu, comme « Fusionner avec un codex… » ; « Faire une copie de secours » passe sur deux lignes dans sa carte. C'est lisible, sans débordement. Captures faites pendant le banc, non versionnées ; je les régénère sur demande.
- **Pas fait** : le verdict WebKit complet, qui vient avec la release ; un geste réel au doigt par famille (le banc appelle les fonctions des gestes, pas les boutons) ; les familles tenues seulement par la sentinelle (élèves suivis, questions du tirage, verrou d'une date, outils d'annotation, bilan).

## 7 · Trouvailles

| Trouvaille | Issue |
|---|---|
| La liste des cours se réécrit, contenu changé, à chaque ouverture | **inscrite : #981** (décision de Cowork) |
| La sélection automatique du portfolio s'écrit à l'ouverture du détail, sans geste (`portfolio.js:277`) : une donnée pédagogique écrite sans geste | à trancher par Cowork (aucun symptôme vécu : je ne l'inscris pas) |
| 34 gestes sans déclencheur, deux fenêtres sans appelant (migration des catégories, « Sauvegarder la configuration ») | issue 3 (leur retrait est un autre chantier) |
| Deux fonctions globales `supprimerPratiqueDefinitivement` (donnees-v2, pratiques-gestion) qui ne font pas la même chose | issue 3 (sans conséquence observée) |
| L'aide du codex dit `.codex.zip` pour un fichier `.zip` | à Grégoire (mot d'écran) |

## 8 · Nouvelles proposées (pour Grégoire, après la relecture)

```javascript
{ version: '1.168', couleur: 'bleu', titre: 'Des mots qui disent vrai : enregistré, codex, copie de secours', items: [
    '« Enregistré » ne veut plus dire qu’une chose : écrit dans l’application, sur ton appareil.',
    'Le codex a son verbe : « Mettre à jour le codex ». Son menu te dit si ton codex est à jour ou s’il n’a pas tes derniers changements.',
    'L’enregistrement automatique du codex toutes les 5 minutes est retiré : ton fichier ne change que lorsque tu le mets à jour.',
    'La sauvegarde de Réglages › Données s’appelle maintenant « Copie de secours », sur l’Accueil comme dans le rappel, qui t’y mène directement.',
    'Archiver un groupe dit « Groupe archivé » ; sous Safari, une archive annulée n’apparaît plus dans la liste.',
    'L’Aide, la foire aux questions et plusieurs écrans ont été relus selon ces mots.'
] }
```

Release proposée : `minor` (1.168.0).

## 9 · Ce que je demande à Cowork

1. La relecture croisée par exécution : le témoin du codex sur un vrai geste, par écran ; la liste des non-raccordés ; les arbitrages du § 2.
   `[à vérifier]` La FAQ proposée (ligne de la réponse) dit que l'application te prévient si tu quittes un écran de création sans avoir cliqué son bouton : c'est vrai pour les écrans des lots E1 à E3 (`beforeunload` commun, `quitterCreationSiConfirme`) ; je ne l'ai pas éprouvé écran par écran.
2. Porter à Grégoire, une question à la fois : le tableau des textes (§ 3), la question du stock (§ 5), les Nouvelles (§ 8), et, s'il le veut, l'extension de D0 (afficher « Enregistré » là où les gestes n'avaient pas de témoin).
3. Me dire quand la machine est libre (Cowork, Chrome, Safari et GitHub Desktop fermés) pour la suite complète, le commit des deux fichiers de sécurité, la release, le verdict et le push.
