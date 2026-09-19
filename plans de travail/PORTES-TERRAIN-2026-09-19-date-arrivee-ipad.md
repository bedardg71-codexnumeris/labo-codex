# Portes terrain — la date d'arrivée sur la fiche d'un·e élève (#735, lot D du dépistage)

**19 septembre 2026 · version attendue : 1.147.0 · 1 geste, ≈ 2 minutes, sur l'iPad.**

> ⚠ **À N'ENVOYER QU'APRÈS LE PUSH.** Au moment d'écrire ce fichier, 1.146.10 et 1.147.0 sont commitées
> en local, pas poussées (Claude Code pousse sur demande de Grégoire). Une porte jouée avant le
> déploiement jugerait 1.146.9 : le champ n'y existe pas, faux rouge garanti.
>
> **Deux livrables jumeaux** : ce markdown est la TRACE. **L'artefact publié, avec son bouton
> « Copier mes résultats », revient à Cowork.** La rangée 1.1 porte un **champ de saisie** en plus de
> la bascule : ce que tu vois compte plus que la case.
>
> **Cette porte ne bloque rien.** Rien d'irréversible dans ce lot : le champ est facultatif, vide par
> défaut, et aucune fiche existante ne reçoit de date. Tu peux la reporter ; le push ne l'attend pas.

## Pourquoi cette liste tient en une rangée

Les deux règles de tête du modèle : une porte n'existe que si aucune machine ne peut répondre, et une
vérification préalable n'est due que si un raté est irréversible.

- **Le calcul** (l'assiduité comptée depuis l'arrivée, le tiret tant que rien n'est noté, les deux
  moyennes du groupe qui s'accordent, le filtre « A ou C < 70% ») : le banc WebKit fait les gestes et
  lit les écrans ; la sentinelle Vitest tient les règles. Pas de porte.
- **La mise en page à 768 px** (le champ dans la grille du formulaire, sans débordement, de la
  hauteur de ses voisins) : mesurée dans WebKit. Pas de porte.
- **Ce qu'aucune machine ici ne voit : le sélecteur de date d'iPadOS, clavier ouvert.** Le WebKit de
  bureau n'ouvre pas la roue de dates de Safari sur iPad. C'est l'objet du geste.

## §0 · Préalable

- [ ] Ouvre `https://app.codexnumeris.org` sur l'iPad, recharge, lis le numéro en bas de page.
  ⮕ Attendu : **1.147.0**. Si c'est 1.146.x, le lot n'est pas encore en ligne : arrête ici.

Aucun backup n'est exigé : le geste se joue sur le pack de démonstration.

## §2 · Interface — un geste

### 1.1 · Saisir une date d'arrivée sur l'iPad `iPad`

**Pourquoi.** Tu as choisi le libellé « Date d'arrivée » et sa bulle le 17 septembre. Le champ
apparaît dans le formulaire « Ajouter un·e étudiant·e » (Cadre › liste du groupe), après « SA ». Sur
iPad, toucher un champ de date ouvre le sélecteur du système : personne ne l'a encore vu dans ce
formulaire.

- [ ] En mode démonstration, va dans le Cadre, à la liste du groupe ; touche « Modifier » sur un·e
  élève, puis touche le champ « Date d'arrivée ».
  ⮕ Attendu : le sélecteur de date s'ouvre ; le champ et le bouton « Enregistrer les modifications » restent
  atteignables (rien n'est caché sous le sélecteur ou le clavier sans qu'on puisse faire défiler).
- [ ] Choisis une date, enregistre, puis rouvre la même fiche.
  ⮕ Attendu : la date choisie est relue dans le champ. Avant ce lot : le champ n'existait pas.
- **Ce que tu as vu** (champ de saisie) : ……

## §3 · Décisions — ce ne sont pas des vérifications

Deux mots **proposés, pas posés** (la consigne du lot demandait de ne pas les poser) ; chacun attend
ton verdict écrit, pas une case :

- **3.1 · La carte « Contexte d'apprentissage » d'un·e élève qui a des copies mais aucune assiduité
  connue.** Aujourd'hui : un tiret à la place du palier, « Assiduité (A) : — », la complétion, et
  aucune phrase dessous. Proposition de phrase : « L'assiduité n'est pas encore connue : le contexte
  se qualifiera dès qu'une séance sera saisie pour cet·te étudiant·e. » — ton verdict : **validée, retouchée : « s'affichera »** (Grégoire, 19 sept. 2026, 11 h 44 ; posée en 1.147.1, lue à l'écran par le banc WebKit du lot D).
- **3.2 · La bulle du badge « A — » dans le Suivi du groupe › Détails.** Aujourd'hui : aucune bulle
  (celle de P, « Note non constructible… », ne s'applique pas à une assiduité). Proposition :
  « Assiduité inconnue : aucune séance saisie ne compte encore pour cet·te étudiant·e. » — ton
  verdict : **validée telle quelle** (Grégoire, 19 sept. 2026, 11 h 44 ; posée en 1.147.1, lue à l'écran par le banc WebKit du lot D).

## §4 · Ce que je n'ai pas pu vérifier

- **Le sélecteur de date d'iPadOS** (objet de 1.1), et le même champ dans Safari sur Mac.
- **L'aller-retour d'export et d'import par les fenêtres de l'application** : prouvé par la structure
  (la fiche voyage entière, sans liste de champs permis, à l'export comme à l'import) et par une
  sérialisation dans le banc, pas en cliquant « Exporter » puis « Importer ».
- **Tes trimestres réels** : aucune sonde n'a lu A2025 ni H2026. Ce qui y changera d'affichage est
  déduit de la règle : un·e élève qui lisait « 100 % » faute de séance lira un tiret. Aucune note
  n'entre dans ce calcul.
- **Le tri par assiduité** (Liste, Saisie des présences) range une assiduité inconnue comme un 0 :
  c'est un ordre de lignes, aucun chiffre n'est affiché ; non corrigé, dit ici.

## Relevé de Grégoire — 19 sept. 2026, 12 h 01 (reçu par Cowork le 19 sept. 2026, 12 h 01)

**3 passées · 0 échec · 0 non traitée**, sur l'iPad, en 1.147.0 (artefact « Porte — Date d'arrivée »).

- [x] 0.1 — numéro en bas de page lu (1.147.0 ou plus récent).
- [x] 1.1 — le sélecteur de date s'ouvre ; champ et « Enregistrer les modifications » atteignables.
- [x] 1.2 — date choisie, enregistrée, relue à la réouverture. Constat écrit : aucun (case cochée seule).

⮕ Porte close. Aucune fiche à inscrire. Relevé à commiter avec le prochain lot (Cowork ne commite pas).
