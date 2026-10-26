# Verdict de relecture – Les bibliothèques en deux colonnes, lot 5 : les tampons (#1158), et la retouche du lot 4 (#1157)

> Cowork, dimanche 25 octobre 2026, 18 h 10 (Toronto). Relu : `DEMANDE-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-5.md`, le rapport de Claude Code relayé par Grégoire, `b481e947` (l'aide, lue au diff contre le texte validé à 16 h 53), le plan à `d8cbe5dd`. Pas relancé par Cowork. **À commiter sur la branche `bibliotheques-deux-colonnes`.**

## Verdict

- **La retouche du lot 4 : acceptée.** L'aide est le texte validé, mot pour mot ; « de ce trimestre » et le menu « Actions » sont posés ; la livraison passe après le lot 6.
- **Le lot 5 : accepté, avec une retouche** (§ 2). Les deux colonnes, les mots validés à 16 h 55 et la phrase de 16 h 47 sont posés ; aucune écriture de données ajoutée ni retirée (le tri du diff de la demande, § 6).

## 1. Les décisions prises seul, les écarts, les corrections

| Point | Cowork |
|---|---|
| Les mots neufs (§ 7.1), dont « Ta bibliothèque est vide. Garde-y un tampon de ta palette pour le retrouver plus tard. » | **Acceptés** : le patron des autres fenêtres, des mots lus par l'enseignant·e. |
| Écart 1, l'image dans l'aperçu, sur un carré blanc | **Accepté.** Les sources sont filtrées (`autocollants/` ou `data:image/...;base64`), le banc refuse une adresse externe et un chemin remontant. |
| Écart 2, les jetons hors de « Dans ta palette » | **Accepté.** Ils ne sont pas dans la palette d'Annoter, et ce sont des éléments de l'application : les garder dans une bibliothèque ou les exporter ne servait à personne. |
| Écarts 3 à 5 (ordre des catégories, spécimen, bouton de la palette) | **Acceptés.** |
| § 6.1, « + Ajouter une catégorie » réparé | **Accepté, issue 1** : la phrase validée de Grégoire invite à ce geste, qui ne faisait rien. Le défaut est aussi dans l'application en ligne ; la réparation part avec la mise en ligne groupée. |
| § 6.2, la palette relue après « ← Utiliser » | **Accepté** : trois fonctions existantes, rien d'écrit. |
| #1166 (l'image perdue), #1167 (le doublon d'un tampon intégré) | **D'accord : inscrites**, non corrigées (écrire autrement des données). |

## 2. La retouche

1. **Productions, « le ramène » sur la rangée de l'exemplaire.** Aujourd'hui, « ← Utiliser » sur l'exemplaire d'une production venue de la bibliothèque, puis retirée, répond « « X » est déjà dans ce trimestre. », ce qui est faux, et ne fait rien. Grilles, échelles et cartouches la retrouvent par `id` **ou** `idOriginal` ; les productions par `id` seul (`ajouterProductionIndividuelle`). **Corriger** : la même recherche que les trois autres ; elle remet le drapeau, comme le fait déjà la rangée « Retirée de ce trimestre ». Aucune écriture neuve. Break-test.
2. **« Tout garder dans ma bibliothèque » d'une catégorie** (⋮ de l'intertitre) : il n'envoie que les tampons qui n'y sont pas encore. Aujourd'hui, chaque tampon déjà gardé lève une notification d'erreur « Doublon » : c'est ce lot qui offre le geste sur une catégorie en partie gardée. Aucune écriture changée (les doublons n'écrivaient rien).
3. **« tampon(s) »** : les notifications que les gestes de cette fenêtre déclenchent disent « 1 tampon », « 3 tampons » (règle du plan : pas de « (s) »).
4. **L'aide des tampons** (§ 7.2 de la demande) : **une variante courte**, sur le bouton ⓘ de cette fenêtre seulement. Le texte validé par Grégoire est au § 3, mot pour mot.
5. Ce verdict, dans le même commit.

## 3. L'aide des tampons : le texte validé par Grégoire (25 oct., 18 h 42), mot pour mot

Sur le bouton ⓘ de la fenêtre des tampons seulement ; l'aide commune des six fenêtres de la Conception ne change pas. Même forme que l'aide du lot 4 (des sections `liste` titrées). Titre de la fenêtre d'aide : celui de l'aide commune, « bibliothèque » devenant « bibliothèque des tampons » s'il s'y écrit.

**Deux colonnes**
- « Dans ta palette » : les tampons que tu poses sur les copies, dans tous tes trimestres.
- « Dans ta bibliothèque » : les tampons que tu gardes de côté pour les retrouver plus tard.

**Passer d'une colonne à l'autre**
- « Garder dans ma bibliothèque → » copie un tampon de ta palette dans ta bibliothèque.
- « ← Utiliser dans ma palette » ajoute à ta palette un tampon de ta bibliothèque.

**Les catégories**
- Dans ta palette, les tampons sont rangés par catégorie. Le menu ⋮ d'une catégorie la garde tout entière dans ta bibliothèque, ou l'exporte.

**Supprimer**
- « Supprimer de ma bibliothèque » (dans le menu ⋮) efface l'exemplaire de ta bibliothèque ; ta palette n'est pas touchée.

Preuve : le banc 1158 ouvre l'aide par le vrai bouton ⓘ de la fenêtre des tampons, lit le titre d'une section et deux phrases, et vérifie que « Dans ce trimestre » et « Retirer » n'y sont pas ; le banc 1157 lit toujours l'aide commune. Break-test. Si une phrase se révèle fausse à la mesure, ne la change pas : dis-le dans la demande.

## 4. Les trouvailles restantes

« Les notifications des tampons disent « tampon(s) » » : voir § 2.3. Les autres : d'accord avec leur issue.
