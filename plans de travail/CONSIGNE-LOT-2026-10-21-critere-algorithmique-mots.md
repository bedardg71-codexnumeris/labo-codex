# Consigne – Le critère algorithmique, le lot de mots : l'aide dit vrai pour toute discipline, et la liste du français écrit est celle de Grégoire

> Écrite par Cowork le mercredi 21 octobre 2026 à 9 h 59 (Toronto, mesuré par `date`), sur `main` à `a32bdb41` (étape 0, non poussée, relue et acceptée : `VERDICT-RELECTURE-2026-10-21-critere-algorithmique-etape-0.md`, lis ses deux écarts). Textes : `TEXTES-2026-10-21-critere-algorithmique.md`, réglés par Grégoire à 9 h 51, ajustés par Cowork à 9 h 58 (D5, D6, F1). Décision de Grégoire de 9 h 55 et 9 h 57 sur la liste du français écrit : même fichier, dernière section.

## Ce qu'il faut

1. **Poser les textes A1 à F1, mot pour mot**, aux sites que le fichier nomme. Apostrophes : la convention de chaque site. D9 : la liste « Avantages pédagogiques » part. D2 : une ligne par modèle.
2. **La liste du français écrit est celle de Grégoire.** « Partir de la liste du français écrit » crée les sous-critères 1 à 10 du critère « Français écrit » de la grille démo « Grille-5 FR-ALGO-20 H26 » (`js/pack-demo-10.js`) : codes, noms, pondérations et observations à l'identique, **sans le code 0**. Le bouton dit « Partir de la liste du français écrit (codes 1 à 10) ». Les onze sous-critères d'aujourd'hui (`initialiserSousCriteresParDefaut`) partent : une seule définition de la liste dans le code applicatif. Le pack démo est une donnée et garde sa grille telle quelle ; s'il peut lire la même définition sans changer à l'octet près, fais-le, sinon dis pourquoi.
3. **Ce qui ne doit plus rester dans `js/`** : « Méthodes quantitatives », « Annexe de grammaire de ton manuel », « Activer la catégorisation des erreurs », « 3;3;1 », « depuis l’origine pour le français écrit », « nombre d’erreurs / nombre de mots × 100 ». Mesure par `grep` avant et après.

## Le stock

Une grille qui porte déjà des sous-critères les garde, textes compris : seul ce que le bouton crée change. Rien ne change dans ce que lisent les élèves de Grégoire (ses grilles portent déjà sa liste). Dis-le dans la demande.

## Les bancs

- **Vitest** : chaque texte à son site, par sa chaîne exacte ; le bouton crée dix sous-critères, codes 1 à 10, identiques à ceux de la grille démo (hors code 0) ; aucune des chaînes du point 3 dans `js/` ni dans la section 5c d'`index.html`.
- **WebKit** : dans une grille neuve, « Partir de la liste du français écrit (codes 1 à 10) » donne les dix sous-critères, et Annoter les offre comme codes ; la section 5c de l'onglet Aide s'affiche, sans « Avantages pédagogiques ».
- **Break-test** : l'ancienne liste remise → rouge ; un texte remis à l'ancien → rouge. Code restauré, vérifié par `cmp`.
- Vitest complet vert ; specs WebKit de l'aide, de Grilles, d'Annoter et des codes vertes. Le verdict complet tourne ce soir, au signal de Grégoire.

## Ce qu'il ne faut pas

- Changer les sous-critères d'une grille existante ; toucher au pack démo autrement que pour lire la liste.
- Nommer les données (« erreurs », « mots ») : étape 2.
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, `TEXTES-2026-10-21-critere-algorithmique.md`, le verdict de l'étape 0 (non suivi), le correctif, les bancs, une capture (la section 5c ; les dix sous-critères créés par le bouton) et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-21-critere-algorithmique-mots.md`. Par leur chemin, jamais `git add -A`. **Lance `/fin-de-session` avant le commit**, sans le verdict complet, ou dis pourquoi tu ne peux pas. **Puis arrête-toi.**
