# Consigne du jour – chantier du démo, dernier lot : T3 et T6 (1.187.0)

> Écrite par Cowork le 7 octobre 2026 à 6 h 03 (Toronto, mesurée par `date`). Remplace la consigne de 1.186.6, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-06-demo-t2-t4-t7.md`.

## Où on en est

1.186.6 est en ligne (`b59cc7fd`, relais `2060d42f`). Du chantier du démo (`Rapports/AUDIT-2026-10-05-chantier-demo.md`), T1, T2, T4, T5, T7 sont livrés. Ce lot est le dernier : à sa mise en ligne, le chantier est clos (#1035 et #1033 restent inscrits à part, hors chantier).

Relecture de Cowork sur `b5eeff85` (tests #1013 et A3 sous un trimestre réel fictif) : faite le 6 au soir, acceptée, rien à reprendre.

**Décisions de Grégoire (7 oct., 5 h 50 à 6 h 03, par Cowork)** :
- **G3** : un bouton dans le bandeau vert du démo, à côté de « Quitter la démo », visible seulement s'il y a des copies importées à retirer. Libellé : « Retirer les copies (N) ». Confirmation : « Retirer les N copies importées dans la démo ? Tes vraies copies et tes données ne sont pas touchées. Pour les retrouver, il faudra les importer de nouveau. » Boutons « Annuler » (sélectionné au départ, Entrée le suit) et « Retirer ». Pluriel accordé pour N = 1.
- **Le retrait supprime pour de bon les copies du démo** : c'est une décision explicite de Grégoire, qui lève pour ce seul geste sa limite sur les suppressions irréversibles. Elle ne couvre que les copies importées dans le démo.
- **Les évaluations ne sont pas touchées** par le retrait : elles sont rattachées à l'élève et à la production, pas à la copie, et le pack fournit les siennes.
- **G4 / T6** : accepté que le démo soit provisoire. Phrase validée, à ajouter à l'aide du mode démonstration (`accompagnement-contenu-popup.js`, entrée `accueil-donnees-demo`, une section de type texte) : « Ce que tu fais dans la démo est provisoire : une nouvelle version du pack démo remplace tes évaluations, et « Retirer les copies » efface les copies importées. »

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md` et `SUIVI-BUGS.md`, et à faire la release sur `main` local. **Pas de push avant la relecture de Cowork.**

## Ce que tu fais, dans cet ordre

1. **Commite** cette consigne et son archive.
2. **Mesure avant d'écrire** : le pack livre-t-il lui-même des copies dans `demo_fichiersTravaux` ? Si oui, le retrait ne touche que les copies importées (celles que le pack ne porte pas), et le compte N les exclut. Dis ce que tu as mesuré en une ligne.
3. **T3 – le retrait, par identité** (skill `hygiene-donnees-partagees`, précision C4 de l'audit) : lire les ids de `demo_fichiersTravaux`, `demo_corbeilleFichiers` et `demo_annotationsTravaux` (par `fichierId`) ; passe à blanc qui compte d'abord ; puis supprimer ces fichiers seulement, leurs `thumbnail_<id>`, et retirer leurs entrées des trois listes. Jamais un filtre par drapeau, jamais une clé hors `demo_` ni hors de ces vignettes. Un id que porte aussi une liste réelle n'est pas supprimé (même règle que `_partDuDemo`). Suppression par `supprimerBlob` : en démo, elle passe par IndexedDB seulement (T4), le dossier sur disque n'est jamais touché. Le bouton est absent hors démo et pendant un import (`importEnCours`).
4. **Trouvaille à inscrire, ne pas corriger** : avant 1.186.6, un import en démo avec le dossier branché écrivait les copies du démo dans le dossier réel. Ces fichiers éventuels restent ; on n'y touche pas (inscris-le, à mesurer chez Grégoire s'il le souhaite).
5. **L'affichage du rangement en démo** : en démo, les deux affichages de `travaux-ui.js` (~l. 975 « Stockage sur disque actif » et ~l. 3707 « Rangement : … ») disent ce qui est vrai, c'est-à-dire « Rangement : dans le navigateur » (mots existants, rien de neuf) ; le statut « Stockage sur disque actif » ne s'affiche pas en démo. Décision technique de Cowork.
6. **T6** : la phrase validée dans l'aide du mode démonstration, telle quelle.
7. Tests : banc du retrait avec une copie réelle et une copie du démo côte à côte, et un id partagé ; la réelle et le fichier partagé survivent ; break-tests sur le filtre par identité et sur la garde hors démo. Banc de l'affichage du rangement. Specs voisins, Vitest complet. Noms manifestement fictifs.
8. **Release 1.187.0** (nouveau geste visible) par `scripts/release.mjs`, commits séparés, relais écrit. Ligne des Nouvelles proposée dans ton rapport, à part, non écrite : elle remonte à Grégoire. Puis arrête-toi : relecture de Cowork, verdict, push.

## Rappel mémoire du Mac

Avant le verdict complet : Chrome et Safari fermés (cause mesurée le 6 au soir : 12,4 Go de mémoire de secours, retombée à 2,2 Go une fois fermés).

## Ton rapport à Grégoire

En gestes d'utilisateur, numéros entre parenthèses en fin de ligne. Le geste à vérifier à l'écran en une ligne.
