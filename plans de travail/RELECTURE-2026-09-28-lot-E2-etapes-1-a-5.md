# Relecture d'étape – lot E2, étapes 1 à 5 (réponses aux questions de la demande)

> Écrite le 28 septembre 2026, à 13 h 29 (Toronto), par Cowork. Répond au § 10 de `DEMANDE-RELECTURE-2026-09-28-lot-E2-cadre-eleves.md` (`4d282162`). **Pas un verdict** : la relecture croisée, par exécution et mutations, se fait sur la demande finale, après l'étape 6. Fichier non suivi sur `main`.

## Tranché par Cowork (technique)

1. **Le piège « dates d'abord » : gardé tel quel.** Aucune migration de clés : c'était la condition du lot. Le cas est étroit (la session et l'année sont exigées à « Créer le trimestre », l'identifiant naît donc juste ; le piège ne vise que la correction d'une session erronée après avoir saisi des dates), et il existait déjà avant le lot pour tout trimestre dont le cadre était enregistré. Le refus parle par le témoin et dit quoi faire (« Crée plutôt un nouveau trimestre »). À écrire dans la demande finale (§ 4, stock et limites), pas de porte.
2. **Les dates partielles s'écrivent** : d'accord. Perdre en silence la première date saisie serait pire, et le calendrier généré est retiré tant qu'il en manque une (règle #390 B5). Un essai doit le garder : dates incomplètes → aucun calendrier ; la troisième date → calendrier régénéré. S'il existe, cite-le dans la demande finale ; sinon, ajoute-le.
3. **Cours → service, la question avant l'effacement** : d'accord. L'effacement existait déjà au bouton (#834) ; la question le rend consenti. Grégoire a posé le 20 sept. qu'aucun code ne supprime de données sans lui : ici, c'est l'usager qui confirme, comme pour « Supprimer ». « Annuler » remet le menu à « cours » et n'écrit rien : un essai.
4. **« + Nouveau trimestre » de la bibliothèque (§ 8.6) : hors du lot E2.** Le fichier porte l'archivage, sous moratoire (#622) ; ses 19 `alert` et son `prompt` relèvent du lot F (les mots) ou d'après le moratoire. Inscris une fiche (issue 2) : « le second chemin de création d'un trimestre ignore D3 (prompt, alert, message de réussite) ».
5. **Les deux trouvailles corrigées (§ 8.1, 8.2)** : justes, et bien classées « issue 1 ». Pour la 8.2 (ligne de séance régénérée qui garde les valeurs de la précédente, WebKit), l'essai doit être dans le banc WebKit du lot, pas seulement dans Vitest (Node ne régénère pas un formulaire comme WebKit).
6. **Mots, typographie** : dans « Non enregistré – Créer le trimestre : choisis la session et l'année du trimestre — elles déterminent où ses données sont rangées. », le tiret cadratin est réservé aux dialogues chez Grégoire : **« … l'année du trimestre ; elles déterminent où ses données sont rangées. »**. Même correction partout où une phrase neuve du lot porte « — ».

## À Grégoire (Cowork les lui pose, une à la fois)

- **Le bouton de l'élève (§ 9.1) : tranché par Grégoire à 13 h 30** – on garde **« Ajouter l'étudiant·e »** (l'application dit « étudiant·e » partout, l'écran parle de « groupe d'étudiant·es »). Question de sortie, mot pour mot : **« Cet·te étudiant·e n'est pas encore ajouté·e. »**, boutons **« Rester »** / **« Quitter sans ajouter »**. Message après l'ajout, sur le patron du lot : « Étudiant·e « … » ajouté·e. ». Plus aucun « élève » dans les mots neufs de l'étape 6.
- Les autres mots neufs du § 5 : soumis avec la demande finale, avant le push.
