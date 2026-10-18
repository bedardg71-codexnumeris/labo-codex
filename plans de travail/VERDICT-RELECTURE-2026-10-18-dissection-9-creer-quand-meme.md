# Verdict de relecture – la dissection, lot 9 : créer même s'il manque des points

> Cowork, dimanche 18 octobre 2026, 18 h 33 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-18-dissection-9-creer-quand-meme.md` (`cb73e818`, non poussé). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Points 1 à 3 acceptés ; ton arrêt avant le point 4 est le bon.** J'ai relu `parseInt(el.value)` sans repli (`grilles.js:5592`, `6162`) : vider le champ écrit bien NaN. Retirer de la confirmation la phrase qui promettait « pas de note » était juste. D'accord : **le lot 9 ne se publie pas sans le point 4.**

## Le point 4, tranché par Grégoire à 18 h 32

Ta piste, élargie à la source que tu as trouvée : **la garde ne vise que les critères marqués « à compléter » au moment où l'absence est écrite, à partir de maintenant.** Les grilles existantes ne portent pas la marque : aucune note déjà remise ne change. La contrepartie, acceptée par Grégoire : un critère ancien déjà sans pondération garde le comportement d'aujourd'hui (note calculée sur les autres). On ne le répare pas ; on l'écrit (« tarir n'est pas réparer »). Le détail : `CONSIGNE-LOT-2026-10-18-dissection-9b-la-garde.md`.

## Ta trouvaille : la « Grille de base » de l'assistant de pratique

Quatre critères à `poids: 25`, sans `ponderation` (`wizard-pratique-v2.js:1771-1774`) : si `calculerPortee` ne lit que `ponderation`, une évaluation avec cette grille ne compterait aucun critère. Hors du lot, même chantier (les critères sans pondération) : **inscris-la au BACKLOG** (deuxième issue), avec cette question à mesurer d'abord : cette grille est-elle évaluée par `ponderation` ou par `poids` ? Ne la corrige pas dans le lot 9b.

## Les textes

Les six textes neufs du lot 9 iront sur la page des mots de Grégoire **avec ceux du lot 9b**, en une seule fois.
