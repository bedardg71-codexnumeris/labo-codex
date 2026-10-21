# Demande de relecture – Le critère algorithmique, lot de mots 2

> Claude Code, 21 octobre 2026, 10 h 45. Consigne : `CONSIGNE-LOT-2026-10-21-critere-algorithmique-mots-2.md` ; verdict du lot précédent : `VERDICT-RELECTURE-2026-10-21-critere-algorithmique-mots.md`. Un commit sur `main`, non poussé, sans numéro de version ni verdict complet.

## Ce qui a changé

1. **Le lexique** (`index.html`) : le terme « Sous-critères (critère algorithmique) » et sa définition, mot pour mot. Aucune ancre ni aucun lien ne pointait vers l'ancien terme : le `grep` de « Sous-critères ( » ne trouve que cette entrée, et la recherche de l'onglet Aide lit le texte affiché.
2. **Sous les sous-critères** (`grilles.js`) : « 💡 La pondération dit ce que pèse un code posé : 1 par défaut, 0,5 pour le compter à moitié. »
3. **Sous la formule** (`grilles.js`) : le texte remplace la phrase des modèles qui emploient les mots, comme « Pénalité normalisée ». Les deux autres modèles gardent leur phrase : « seul le nombre d'erreurs entre dans la note. Le nombre de mots reste saisi pour la rétroaction. » Elle ne parle ni de rédaction ni de la façon de remplir le nombre, et je l'ai laissée telle quelle. C'est une supposition à confirmer.
4. **L'« Astuce professionnelle »** est retirée, encadré compris.

Apostrophes ASCII aux deux sites, comme leurs voisins. Le jeton `?v=` de `grilles.js` passe à `20261020j`, jamais servi auparavant. Le vérificateur anti-cache est vert.

## Le stock

Rien n'est écrit dans les données : ce sont des textes d'interface.

## Bancs

**Vitest** : le banc du lot de mots (`critere-algorithmique-mots.test.js`) passe de 11 à 14 essais.
- **G1** vérifie le terme et la définition au lexique.
- **G2 et G3** vérifient les deux textes dans le gabarit rendu par le vrai `grilles.js`, après la pression du bouton.
- **X.b** vérifie qu'il n'y a plus d'« Astuce professionnelle » dans la section 5c, ni d'encadré « succès ».
- **X.c** vérifie qu'il n'y a plus de « pondération différenciée » dans `index.html`, sans égard à la casse. Il vérifie aussi qu'il n'y a plus de « ponctuation = 0.5 » ni de « de la rédaction » dans le gabarit rendu ni dans `grilles.js`. Je ne cherche pas dans tout `js/`, parce que le pack démo, qui est une donnée, contient encore « de la rédaction ».

**Break-tests** (code restauré, vérifié par `cmp`) :
- G3 remis à l'ancien → 2 rouges ;
- l'ancien lexique remis → 2 rouges ;
- l'Astuce remise → 1 rouge.

**Ensemble** :
- Vitest complet : vert, 794 fichiers, 9 355 essais.
- WebKit : 21 specs d'aide, de Grilles, du barème et du critère algorithmique, 59 essais verts.

**`/fin-de-session`** a été lancé avant le commit, sans le verdict complet. L'audit statique du diff ne relève aucun motif, et aucune zone protégée n'est touchée.

## Ce que j'ai mesuré en chemin

**Le gabarit vide dit encore « Aucun sous-critère défini. Utilise les sous-critères par défaut ou crée les tiens. »** (`grilles.js`, juste au-dessus de G2). Il n'existe plus de « sous-critères par défaut », et le bouton s'appelle désormais « Partir de la liste du français écrit ». C'est un texte lu par l'enseignant, à trancher par Cowork. Je propose *inscrire et continuer*, sans l'inscrire au BACKLOG : aucun symptôme n'a été vécu.

## Ce que je demande à la relecture

La phrase des deux autres modèles, que j'ai gardée sous la formule (point 3).
