# Consigne du jour — le texte « Qu'est-ce que Labo Codex ? » de l'Aide, réécrit

> **Écrite le 9 septembre 2026, 19 h 05 (Toronto), par Cowork, sur une décision de Grégoire du même soir.** Elle remplace la consigne du dépistage du français en semaine 1, archivée à côté sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-07-depistage-francais-semaine-1.md` — commets l'archivage avec ton premier commit.
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`, `TZ=America/Toronto date`.
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Le bloc visé a été lu le 9 septembre au soir aux lignes 10094-10104 d'`index.html` ; vérifie les numéros avant d'écrire.

## Pourquoi

Le texte d'accueil de l'Aide affirme aujourd'hui : « Il est gratuit, **son code est ouvert** et il fonctionne hors ligne. Tes données restent **en sécurité** chez toi. »

Deux de ces affirmations ne tiennent plus :

1. **« son code est ouvert »** — le dépôt est privé depuis le 23 juin 2026 (`DEPLOY.md` §1.2). Un utilisateur qui vérifie trouve une affirmation fausse. C'est le motif principal de cette réécriture.
2. **« en sécurité chez toi »** — il n'y a aucun chiffrement au repos (`docs/securite/PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` décrit le plan, rien n'est implémenté). Les données restent *chez* l'enseignant, ce qui est vrai ; *en sécurité* promet une protection que l'application n'assure pas.

Deux ajouts, décidés le même soir :

3. **La passerelle IA est assumée** plutôt que seulement niée. Le module d'import du bilan réflexif porte un bouton « Copier le prompt pour IA » (`js/bilan-reflexif-import-export-texte.js:734`) et les cartouches ont `telechargerModeleCartouche` (`js/cartouches.js:2691`, commentaire du 26 août : « LE MODÈLE VIDE, À DONNER À UNE IA »). Un utilisateur qui trouve ces boutons ne doit pas croire que le texte lui a menti.
4. **Le partage signé et la licence** n'apparaissaient nulle part dans ce texte, alors que le refus d'import d'un fichier non signé est livré et bloquant (`js/partage-import.js:652-661`).

## Ce qu'il faut faire

Dans `index.html`, carte « Présentation de l'application » (repère : `<!-- Carte: Présentation de l'application -->`), remplacer le contenu des paragraphes ci-dessous. **Les trois blocs « À quoi sert ce labo ? », « Qu'est-ce que ça change ? » et « Qu'est-ce que ça demande ? » ne changent pas** — n'y touche pas.

### 1. Deuxième paragraphe (celui qui commence par « Il n'y a aucune intelligence artificielle »)

Remplacer par :

> Il n'y a aucune intelligence artificielle dans l'application. Aucune décision n'est prise à ta place. Ton jugement professionnel est souverain ; l'outil ne fait que l'éclairer. Si tu veux t'aider d'une IA pour rédiger un questionnaire ou une cartouche de rétroactions, l'application te fournit un gabarit vide à lui confier : ce qui sort d'ici est un modèle, jamais les données de tes élèves.

### 2. Nouveau paragraphe, à insérer AVANT « Labo Codex est un commun à construire »

> **Où vont tes données ?** Nulle part. Elles restent dans le navigateur, sur ton appareil ; aucun serveur ne les reçoit. Une fois la page ouverte, l'application n'a plus besoin du réseau. Tu transportes ton travail d'un appareil à l'autre par un fichier que tu déplaces toi-même, sans passer par un nuage. Et le matériel que tu partages avec un collègue — une grille, une échelle, une cartouche, une pratique — est signé cryptographiquement et porte une licence Creative Commons : l'application refuse d'importer un fichier non signé ou modifié en chemin.

Le « Où vont tes données ? » est en `<strong>`, comme les autres intertitres du bloc.

### 3. Dernier paragraphe (« Labo Codex est un commun à construire »)

Remplacer la première phrase après le gras. Le reste du paragraphe est inchangé.

> **Labo Codex est un commun à construire.** Il est gratuit, il fonctionne sur ton appareil et son développement est guidé par une communauté de pratique. En retour, tu peux apporter ton expérience : ce qui fonctionne, ce qui manque, ce que tu découvres. Chaque contexte disciplinaire apporte quelque chose de nouveau. En expérimentant ensemble, on peut faire avancer la réflexion, l'évaluation et l'accompagnement au collégial.

⚠ **Ne pas écrire « le code sera rouvert »**, même si c'est l'intention de Grégoire. Une promesse dans un texte d'aide devient une dette ; la phrase reviendra quand l'historique du dépôt aura été purgé.

## Contraintes d'écriture

- Le fichier est en entités HTML (`&eacute;`, `&agrave;`, `&nbsp;`…). **Respecte l'encodage existant** du bloc : les accents s'écrivent en entités, et les espaces insécables avant `?` et `:` sont des `&nbsp;`.
- Les tirets longs dans le nouveau paragraphe sont des demi-cadratins (`&ndash;` ou `–`), pas des cadratins.
- Chaque `<p>` ajouté prend `class="mt-10"` comme ses voisins.
- Aucun changement de structure, de classe CSS ou de script. C'est une réécriture de texte.

## Vérification attendue

1. Ouvrir l'Aide, déplier « Présentation de l'application », lire le bloc en entier : aucune entité cassée, aucun accent en clair, les espaces insécables tiennent avant les `?`.
2. `grep -c "code est ouvert" index.html` doit rendre 0.
3. `grep -c "en s&eacute;curit&eacute; chez toi" index.html` doit rendre 0.
4. Le geste à vérifier à l'écran : **ouvrir l'Aide et lire le bloc**. C'est un texte, la preuve est la lecture.

## Ce qui reste hors de ce lot

- La réouverture du dépôt et la purge de son historique : chantier distinct, traité par Grégoire.
- Le second bloc de l'Aide (après le `<hr>`, « Cette application permet de capturer les micro données… ») : non revu ce soir, à cadrer une autre fois s'il fait doublon.
