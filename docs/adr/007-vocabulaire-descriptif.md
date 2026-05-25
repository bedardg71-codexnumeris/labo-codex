# ADR-007 : Vocabulaire descriptif (« difficulté émergente / plateau / persistante »)

**Statut** : Acté rétroactivement
**Date de décision originale** : printemps 2026 (formalisation : 14 mai 2026)
**Auteur** : Grégoire Bédard

---

## Contexte

Les outils de suivi des apprentissages tendent à employer un vocabulaire **prédictif** ou **alarmiste** :
- « À risque », « en échec », « décrocheur potentiel »
- « Élève faible », « problématique »
- « Niveau critique », « urgence »

Ce vocabulaire :
- **Étiquette** l'étudiant plutôt que de décrire un état observé à un moment donné.
- **Médicalise** ou **pathologise** une trajectoire qui peut être transitoire.
- **Préjuge** de l'évolution future à partir d'un signal présent.
- **Risque de produire des effets Pygmalion** (les étiquettes s'auto-réalisent).

Le sous-audit 1.3 (cohérence lexicale, 12 mai 2026) a confirmé que ces patterns existent encore dans certaines classes CSS et strings UI (13+ classes alarmistes recensées sous T-L1, partiellement résolues par la passe 2 du design system).

Le projet Labo Codex s'aligne sur une **posture descriptive** issue de la recherche-action et de l'enseignement explicite : observer un état présent sans préjuger d'une trajectoire ni étiqueter la personne.

---

## Décision

**Le vocabulaire de Labo Codex est descriptif, non-prédictif et non-pathologisant.**

Vocabulaire **admis** :
- « Difficulté émergente » (un signal récent qui pourrait évoluer)
- « Plateau » (stagnation observée, sans jugement sur la cause)
- « Difficulté persistante » (signal qui perdure à travers plusieurs observations)
- « Compréhension globale », « points pertinents sans liens » (vocabulaire SOLO)
- « Engagement », « assiduité », « mobilisation » (mesures comportementales factuelles)
- « Intervention préventive », « intervention intensive » (mesures pédagogiques, pas états)

Vocabulaire **proscrit** :
- « À risque », « risque d'échec », « décrocheur »
- « Élève faible », « problématique », « difficile »
- « Critique », « alarme », « urgence » (sauf cas opérationnels rares signalés explicitement)
- Tout vocable qui qualifie la **personne** plutôt qu'un **état observé**.

Cette règle s'applique :
- Aux **strings UI** affichées à l'enseignant.
- Aux **noms de classes CSS** quand le nom porte une sémantique métier (`difficulte-emergente` vs `eleve-en-difficulte`).
- Aux **labels d'API et de structures de données** (`niveauRaI`, pas `niveauAlerte`).
- À la **documentation utilisateur** et aux **publications académiques**.

---

## Conséquences

### Positives

- **Pédagogiquement aligné** avec la recherche-action et la philosophie de l'enseignement explicite.
- **Réduit le risque Pygmalion** : l'enseignant pense en termes de signal observé, pas en termes d'étiquette d'élève.
- **Communicable** aux étudiants et aux parents sans charge émotionnelle disproportionnée.
- **Cohérent avec la posture descriptive** revendiquée dans les publications académiques de l'auteur (*Pédagogie collégiale*, 2024).

### Négatives

- **Vocabulaire moins « parlant »** pour un enseignant non familier avec la posture descriptive — un « à risque » est plus immédiatement compréhensible que « difficulté émergente ». Mitigation : section Aide intégrée et publications académiques.
- **Discipline lexicale** : le vocabulaire prédictif resurgit naturellement quand on tape du code rapidement. Source de dette technique récurrente (cf. T-L1 du sous-audit 1.3).
- **Reformulations à faire** dans le code historique : classes CSS, strings UI, commentaires. Chantier de plusieurs heures par vague.

### Neutres

- **Cas opérationnels** où un terme alarmiste est techniquement légitime (par exemple, une « alerte » CSP dans la console de debug). Ces cas sont distingués du vocabulaire métier — l'alarmisme technique reste admis, l'alarmisme pédagogique non.

---

## Alternatives considérées

### Option A : Conserver le vocabulaire prédictif standard

**Écartée** parce qu'elle contredit la posture pédagogique du projet et le travail de recherche-action de l'auteur.

### Option B : Vocabulaire purement neutre (codes numériques)

Type « état 1, état 2, état 3 ». **Écartée** parce qu'elle est illisible et qu'elle n'aide pas l'enseignant à comprendre ce qu'il observe.

### Option C : Vocabulaire descriptif avec exception sur les niveaux RàI

Garder « préventif / intensif » comme niveaux RàI mais autoriser ailleurs un vocabulaire plus alarmiste. **Écartée** parce qu'elle est incohérente — la posture descriptive est binaire (on adopte ou on n'adopte pas).

---

## Références

- Bédard, G. (2024). « Observer pour mieux accompagner ». *Pédagogie collégiale*, vol. 37, n° 3.
- `SKILL_RaI.md` — patterns et vocabulaire descriptif.
- `SKILL_Ecosysteme_classe.md` §"Posture" — déclaration officielle.
- Audit annuel 2026, sous-audit 1.3 Cohérence lexicale — recensement T-L1 et chantiers de correction.
- `ds-update/passe-2-diff/decisions-actees-*.md` — décisions D-D6, 01a:Q9, 02c:Q2/Q14, 05:Q4/Q7 (renommages de classes alarmistes).

---

## Notes de révision

À réviser si :
- Une co-pratique avec une autre institution exige un alignement vocabulaire différent (peu probable dans le périmètre actuel).
- Un cas d'usage opérationnel non anticipé exige un vocabulaire plus alarmiste (ex. : signalement de protection de la jeunesse — hors scope actuel).

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
