# Portes terrain – archiver l'hiver 2026 (E1, #1022)

> Écrite par Claude Code le 4 octobre 2026 (Toronto), pour **1.183.0**. **Pas à faire maintenant** : cette porte attend le jour où tu auras décidé de clore l'hiver 2026 (consigne de Cowork de 17 h 19, point 8). Clore est réversible (« Rouvrir »), et archiver n'écrit rien dans tes données : la porte n'a aucun geste irréversible.
> Ce qui échoue devient une fiche du BACKLOG, pas une note mentale. L'artefact jumeau (cases à cocher, « Copier mes résultats ») est publié par Cowork.

**Une seule surface** : Safari sur le Mac. Aucune console, aucun Terminal.

## §0 · Préalable

| # | Geste | Attendu |
|---|---|---|
| 0.1 | Ouvre `https://app.codexnumeris.org` dans Safari, recharge la page, et lis le numéro en bas de page. | **1.183.0** ou plus. Un numéro plus ancien : arrête-toi, la porte jugerait la version d'avant. |
| 0.2 | Si ton codex n'est pas à jour, mets-le à jour d'abord. | « Codex à jour ». *(Prudence : archiver n'écrit rien, mais clore change l'état du trimestre.)* |

## §1 · Ce que tu fais sur tes données

| # | Geste | Attendu |
|---|---|---|
| 1.1 | Bibliothèque des trimestres → menu ⋮ de l'hiver 2026 → « Clore ». *(C'est ta décision : ne le fais que le jour où tu veux le clore.)* | L'hiver 2026 passe dans « Trimestres clos ». |

## §2 · À l'écran

**2.1 – Archiver l'hiver 2026 tout entier** · #1022

> **POURQUOI** — Jusqu'ici, on ne pouvait archiver qu'un groupe-cours à la fois, et rien ne gardait le trimestre en entier (ses élèves, ses évaluations, ses copies, y compris celles de la corbeille) hors de l'application. C'est la première pièce du « livre de bibliothèque » : avant de pouvoir un jour rendre l'hiver 2026, il faut un exemplaire vérifié.

| # | Geste | Attendu | Mesure |
|---|---|---|---|
| 2.1.a | Ouvre le menu ⋮ de l'hiver 2026 (clos). | Une entrée « Archiver le trimestre… ». *(Elle n'existe pas sur un trimestre en cours.)* | |
| 2.1.b | Clique « Archiver le trimestre… ». | Une fenêtre « Archiver Hiver 2026 ? » qui dit combien d'étudiant·es, de groupes et de copies partent (dont celles de la corbeille), et la taille. Elle finit par « Rien n'est retiré de l'application : le trimestre reste là, clos. » | **Recopie les chiffres de la fenêtre.** Attendu d'après le codex du 3 oct. : environ 394 copies, environ 1,1 Go (une prédiction, pas un seuil). |
| 2.1.c | Clique « Archiver ». | Une fenêtre « Confirmer l'export… » qui liste le contenu de l'archive. | Durée entre le clic et cette fenêtre : |
| 2.1.d | Confirme le téléchargement. | Safari télécharge `archive-h2026-trimestre-2026-…zip`, puis une fenêtre « Téléchargement lancé » te demande s'il est dans tes Téléchargements. | Durée du téléchargement : |
| 2.1.e | Attends la fin du téléchargement, vérifie que le fichier est dans tes Téléchargements, puis clique « Il y est ». | Le message « Trimestre archivé : fichier téléchargé ». | **Taille du fichier dans le Finder :** |
| 2.1.f | Range le fichier où tu gardes tes archives (ton dossier d'archives, ou un disque). | Le fichier est là où tu l'as rangé. | |

**2.2 – Le retrouver dans la liste, et le vérifier** · #1022

> **POURQUOI** — Un fichier qu'on n'a jamais relu peut être incomplet sans que personne le sache. « Vérifier » relit chaque copie et chaque donnée du trimestre contre son empreinte. C'est cette vérification qui permettra un jour de rendre le trimestre.

| # | Geste | Attendu | Mesure |
|---|---|---|---|
| 2.2.a | Réglages › Données › Archives. | Une ligne « h2026 », colonne Cours « Trimestre entier », « Non vérifiée ». Pas de bouton « Faire revenir » sur cette ligne. | |
| 2.2.b | Clique « Vérifier » sur cette ligne, puis choisis le fichier rangé en 2.1.f. | « Archive vérifiée » : « Les N copies et les données du trimestre sont présentes et intactes. » | **N =** ; durée de la vérification : |
| 2.2.c | Ferme la fenêtre, recharge la page, et reviens sur la ligne. | « Vérifiée le » et la date du jour. | |

⚠ Si 2.2.b dit « Archive incomplète » : **recopie le message en entier**. Une fiche dont la copie manquait déjà dans Safari au moment d'archiver est dite « fiche du trimestre sans copie dans l'archive ». C'est un vrai manque, pas une panne de la porte, et il deviendra une fiche.

## §3 · Décisions

Aucune : les mots ont été acceptés le 4 oct.

## §4 · Ce que je n'ai pas pu vérifier

- **Un vrai téléchargement dans Safari** : au banc, le fichier restait dans la page, et le « Il y est » était accepté d'office. Le parcours est le même que celui de l'archive d'un groupe (lot A1), dont le chemin Safari n'a pas encore été prouvé non plus.
- **La mémoire de Safari sur ton Mac** : je l'ai mesurée sous WebKit, le moteur de Safari, piloté par les tests. Sur 1,1 Go de copies, la mémoire de la page est passée de 161 à 215 Mo, en 5,4 s. Ton Safari n'a pas été mesuré.
- **L'iPad** : pas mesuré du tout. Archiver depuis l'iPad n'est pas demandé par cette porte.
- **Chrome en mode dossier** : jugé seulement sur un faux dossier en mémoire.
- **Tes vraies copies** : le banc utilise des octets fictifs, rangés comme les tiens. Le compte réel (394 copies, 1,1 Go) vient du codex du 3 oct., lu sans rien ouvrir dans l'application.
