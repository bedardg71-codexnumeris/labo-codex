# Consigne — lot « L'accueil épuré » (7 nov. 2026) et correction du menu de l'en-tête

Reçue de Grégoire le 7 novembre 2026, en fin d'après-midi. Maquette : toile « En-tête et accueil », esquisse 64.
Même branche que l'en-tête épuré (`lot/en-tete-epure`). Mêmes règles : pas de fusion vers `main` ni de publication
sans son accord, rien au changelog, verdict Playwright complet seulement après son approbation. Ne modifier aucun
texte lu par l'utilisateur autre que ceux nommés ici.

## 1. Correction au lot « L'en-tête épuré », le menu

Nouvel ordre : Visite guidée, Assistance, Aide, Signaler, Soutenir, puis Réglages en dernier. Largeur du panneau
~210 px au total. La ligne Assistance et son interrupteur tiennent sans couper le mot.

## 2. Lot « L'accueil épuré » — à commencer quand Grégoire aura approuvé les captures de l'en-tête

### Avant de coder, vérifier et rendre compte

- La carte « Tu es conseiller·ère pédagogique ? » (Explorer) fait-elle le même geste que l'interrupteur « Données
  démo » ? Comment quitte-t-on la démo ? Si l'interrupteur est le seul moyen d'en sortir, ne pas le retirer et le
  signaler.
- Où mène chaque carte de tâche aujourd'hui. Si une destination diffère de celle indiquée, garder le comportement
  actuel et signaler l'écart.

### Ce qui disparaît de l'accueil

Les sections « Utilitaires » (Ton codex, Nouveautés) et « Aide » (Assistance, Données démo). Ton codex et
Assistance existent dans l'en-tête et le menu ; Nouveautés passe au pied de page.

### « À propos »

- Reste repliable. Ouvert tant qu'aucun trimestre n'existe ; ensuite, l'application retient le choix de la personne.
- Titre du contenu : « Suivre l'apprentissage. Soutenir l'enseignement. », en grand, graisse légère.
- Retirer « Bienvenue dans Labo Codex ! Labo Codex est un outil de soutien à l'enseignement et au suivi des
  apprentissages. »
- « C'est une application qui te propose… » devient « Labo Codex est une application qui te propose… » ; le reste
  du texte ne change pas.
- Les quatre paragraphes sur deux colonnes, chacun sous un intertitre, dans cet ordre : « Ce que fait
  l'application » (Labo Codex est une application…), « Ton jugement d'abord » (Une de ses particularités…), « Un
  commun éducatif » (Tu peux faire les mêmes gestes…), « Tes données chez toi » (Tu entres ton adresse de courriel…).
- Sous un filet, deux colonnes : à gauche, « Certains concepts sont nouveaux ? » suivi de trois liens texte qui
  remplacent les trois boutons (Visite guidée, Guides pédagogiques, Tutoriels ↗, mêmes actions) ; à droite,
  l'encadré de la CoP, inchangé.
- Sous un second filet, l'intitulé « Par où commencer ? » (petites capitales, comme « Tâches ») et les trois cartes
  de profil, déplacées ici. Vrais boutons : Commencer, Commencer, Explorer. Nouveau texte de la carte du
  conseiller : « Explore un cours de démonstration déjà configuré, aux données fictives mais réalistes. »
- Sous ~820 px, les colonnes s'empilent.

### Les tâches

- Neuf cartes sur trois colonnes tant que chaque carte garde ~260 px ; sinon deux, puis une.
- Neuvième carte : « Organiser tes rencontres », « Service d'orthopédagogie : suivi en petit groupe ou en
  individuel. », vers Suivi › Rencontres. Icône : deux bulles de dialogue, au même trait que les autres.
- En bas de chaque carte, en petit, où elle mène : Adopter ta pratique → Conception › Pratiques ; Planifier ton
  cours → Conception › Alignement ; Saisir les présences → Suivi › Présences ; Importer des copies → Évaluation ›
  Préparer ; Annoter et évaluer → Évaluation › Annoter ; Observer le groupe → Suivi › Groupe ; Consulter un profil →
  Suivi › Profils ; Différencier les interventions → Suivi › Interventions ; Organiser tes rencontres → Suivi ›
  Rencontres.
- Les icônes des tâches d'une seule couleur, celle des liens de la page.

### Le pied de page

Deux moitiés symétriques séparées par un filet vertical. À gauche : « Bêta publique » et le numéro de version, puis
un lien « Nouveautés » (ce que la carte Nouveautés ouvrait), alignés à droite contre le logo de l'application
(`Logo/labo-codex-logo-blanc.svg`, ~46 px). À droite : le logo de Codex Numeris, puis « Le blog : codexnumeris.org »
(lien) et la devise « Réfléchir, expérimenter, partager. ». Les deux logos à la même hauteur, légèrement atténués.

### La visite guidée

- Titre de la première étape : « Bienvenue » → « Bienvenue dans la visite guidée ».
- « le relancer depuis le bouton de l'en-tête » → « le relancer depuis le menu, en haut à droite ».

### Backlog

L'entrée « Le slogan dans À propos » (#1238) est couverte par ce lot : la marquer comme telle.

### Livraison

Captures Playwright WebKit de l'accueil, sombre et clair, à 1180, 820 et 390 px : « À propos » ouvert, puis replié ;
plus le pied de page à 1180. Constats sur la démo et les destinations des tâches ; vérifications habituelles.
