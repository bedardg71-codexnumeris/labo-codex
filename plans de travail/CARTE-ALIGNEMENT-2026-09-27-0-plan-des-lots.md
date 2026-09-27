# Carte d'alignement : plan des lots (27 sept. 2026)

> Plan rédigé par Grégoire et Cowork (projet claude.ai), ordre validé par Grégoire le 27 sept. 2026 ; déposé dans le dépôt par Cowork le 27 sept. 2026. Le plan est reproduit tel quel ; les deux sections qui suivent la ligne de séparation sont de Cowork.
> Le document cité, « Guide d'alignement : Anderson et Biggs (27 sept. 2026) », n'est pas déposé : les textes validés dont les lots ont besoin sont déjà dans les quatre consignes.

Ordre validé par Grégoire le 27 sept. 2026. Contenu détaillé et textes validés : voir « Guide d'alignement : Anderson et Biggs (27 sept. 2026) ».

1. **« Je fais relire ma carte par une IA »** : bouton « Télécharger un modèle » (protocole validé, aller simple) et principe affiché dans le module Alignement. Indépendant des autres lots. Relayé le 27 sept.
2. **« Mes badges suivent mes objectifs »** : nouveau calcul des badges à partir des objectifs ; retrait du seul geste « se vérifie par » vers l'évaluation (les liens existants restent stockés et comptés) ; l'Exposé rejoint le calcul des activités. Les trois changements partent ensemble.
3. **« Mon évaluation me dit si elle arrive trop tôt »** : quatre pastilles des évaluations, qui lisent la semaine. Arbitrage visuel de Grégoire : les symboles.
4. **« Le guide dit ce que fait la carte »** : textes validés des pages 1, 2, 4, 6 et 8 ; publié avec le lot 3, jamais avant.

Garde-fous communs : aucune suppression de données d'utilisateur ; rien de disciplinaire codé en dur ; noms manifestement fictifs dans les tests et exemples.

---

## Les fichiers du chantier (`plans de travail/`)

| Lot | Consigne |
|---|---|
| 1 | `CARTE-ALIGNEMENT-2026-09-27-1-relire-ma-carte-par-une-IA.md` |
| 2 | `CARTE-ALIGNEMENT-2026-09-27-2-mes-badges-suivent-mes-objectifs.md` |
| 3 | `CARTE-ALIGNEMENT-2026-09-27-3-mon-evaluation-arrive-trop-tot.md` (fichier d'origine : « Évaluer ce qui est enseigné » ; nommé ici comme dans le plan) |
| 4 | `CARTE-ALIGNEMENT-2026-09-27-4-le-guide-dit-ce-que-fait-la-carte.md` |

Les lots 1 et 2 citent `mesure-carte-alignement.md` (racine du dépôt, écrit par Claude Code le 27 sept., non suivi) : à commiter tel quel avec ce chantier, à sa place.

## À inscrire au BACKLOG – pour Claude Code

Motif d'entrée (règle du 24 août) : un chantier ouvert par Grégoire, lots et textes validés par lui le 27 sept. 2026. Paliers lus dans les consignes, pas mesurés au code.

⚠ Numéros proposés par Cowork d'après la ligne « Dernier ID utilisé : #962 » (lue le 27 sept. à 11 h 13, `main` à `18f6c759`). **Relis cette ligne sur `main` et grep les deux registres avant de les prendre** ; si un numéro est déjà pris, décale les quatre et dis-le. Mets la ligne « Dernier ID utilisé » à jour dans le même commit. Place les quatre fiches en tête de « ## A faire », dans cet ordre.

- [ ] **#963 – Carte d'alignement, lot 1 : « Je fais relire ma carte par une IA ».** Un bouton « Télécharger un modèle » de la carte d'alignement produit un fichier .md (les consignes validées par Grégoire, puis la carte en l'état) que l'enseignant·e colle dans l'IA de son choix ; aller simple, aucune écriture dans la carte. Le principe « Évaluer ce qu'on enseigne, et enseigner ce qu'on évalue, au même niveau d'exigence. » s'affiche dans le module Alignement. Origine : retour testeur de Grégoire du 27 sept. 2026, 7 h 44 ; sa ligne au suivi des retours nomme #963 (à poser au début du lot). Consigne : `plans de travail/CARTE-ALIGNEMENT-2026-09-27-1-relire-ma-carte-par-une-IA.md`. Intermédiaire, `js/planification-carte.js`. Indépendant des lots 2 à 4.
- [ ] **#964 – Carte d'alignement, lot 2 : « Mes badges suivent mes objectifs ».** Décision didactique de Grégoire (27 sept. 2026) : une évaluation se relie uniquement à des objectifs, cochés dans son Inspecteur. `evaluerBadge` et `evaluerObjectif` lisent les objectifs cochés ; seules les paires automatiques `…>evaluation` sortent de `VERBES_AUTO` ; l'Exposé rejoint le calcul des activités. Les liens « se vérifie par » déjà tracés restent stockés, affichés et comptés (non négociable). Consigne : `plans de travail/CARTE-ALIGNEMENT-2026-09-27-2-mes-badges-suivent-mes-objectifs.md`. Laborieuse (données déjà écrites : une carte existante ne change d'état que par les deux effets voulus), `js/planification-carte.js`. Après #963.
- [ ] **#965 – Carte d'alignement, lot 3 : « Mon évaluation me dit si elle arrive trop tôt ».** Chaque évaluation porte une pastille à quatre états (!, ✕, ⚠, ✓ ; infobulles validées) qui dit si chaque objectif qu'elle vérifie a été enseigné, et avant elle (semaine, puis rang de séance). Calcul en lecture seule ; couleurs à juger par Grégoire à l'écran. Consigne : `plans de travail/CARTE-ALIGNEMENT-2026-09-27-3-mon-evaluation-arrive-trop-tot.md`. Intermédiaire, `js/planification-carte.js`. Après #964.
- [ ] **#966 – Carte d'alignement, lot 4 : « Le guide dit ce que fait la carte ».** Les pages 1, 2, 4, 6 et 8 de `GUIDE_PAGES` reprennent les textes validés par Grégoire le 27 sept. 2026 ; le guide garde neuf pages. **Publié dans la même version que #964 et #965, jamais avant.** Consigne : `plans de travail/CARTE-ALIGNEMENT-2026-09-27-4-le-guide-dit-ce-que-fait-la-carte.md`. Rapide (des mots), `js/planification-carte.js`.

Aucune release : inscription et dépôt seulement.
