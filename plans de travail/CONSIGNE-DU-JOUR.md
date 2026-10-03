# Consigne du jour – avant une grosse suppression, un codex à part (#1007, premier lot)

> Écrite par Cowork le 2 octobre 2026 à 20 h 29 (Toronto, mesurée par `date`). Remplace la consigne de mise en ligne de 1.174.6, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-02-1014-release-1.174.6.md`. Commite d'abord, tels quels, les fichiers de Cowork qui traînent dans l'arbre (dont `DECISIONS-2026-10-02-1007-suppressions.md`), et pousse les commits de documents de `main` (Grégoire t'y autorise en te transmettant cette consigne).

## Ce que Grégoire a décidé

Lis **`plans de travail/DECISIONS-2026-10-02-1007-suppressions.md` en entier** : toutes les questions du § 3 de ton inventaire y sont tranchées, et les mots des deux fenêtres y sont acceptés. Ce lot-ci ne fait que **les § 5, 6 et 7** : les cinq gestes où le codex est **exigé**, par un **fichier à part**. Le second lot (les gestes où il est proposé, § 1 à 4 et 8) viendra ensuite, sur une autre consigne.

## Ce que tu fais, sur une branche

1. **Les cinq gestes** de ton inventaire (§ 2.1 : X1 trimestre, X2 groupe-cours, X3 « Supprimer un groupe… », X4 « Vider la liste », X5 « Réinitialiser toutes les données ») : remesure où chacun vit et ce qu'il fait aujourd'hui.
2. **Un parcours commun**, une seule fonction appelée par les cinq : la fenêtre des § 7 (mots exacts ; « Annuler » a le focus et n'écrit rien) ; puis `genererCodex` → écriture **sans adoption** sous un autre nom (proposition : le nom habituel du codex suivi de « avant-suppression » et de la date ; à toi de le dire), destination **toujours demandée** ; puis la confirmation « Il y est » (`FichierSortant.confirmerTelechargement` ou son équivalent sur chaque navigateur) ; **seulement après**, la confirmation et la saisie de nom existantes du geste. Un échec ou un « Annuler » à n'importe quelle étape : rien n'est supprimé.
3. **Le trimestre** : le refus « codex pas à jour » est retiré pour ce geste (§ 7), ainsi que la phrase « Ton codex à jour les contient encore… fais d'abord une copie de ce fichier. ». Le refus du trimestre actif reste.
4. **L'avertissement de 1.174.0** passe dans ce parcours comme dans toute écriture de codex (des copies qui manquent, il le dit). Ne le contourne pas.
5. **Sur l'iPad** (Safari, partage) : le chemin d'écriture est le même que celui de « Mettre à jour le codex » ; dis ce que ton banc imite et ce qui reste inféré.
6. **Les quatre variantes de la première phrase** (§ 7) : propose-les exactes dans ta demande, sur le modèle accepté ; si l'une d'elles demande un mot neuf, n'invente pas : rends-la à Cowork.

## La preuve

Un banc par le geste pour chacun des cinq (la fenêtre, ses mots ; « Annuler » à chaque étape ne supprime rien ; le fichier à part est écrit sous un autre nom et le fichier tenu n'est pas touché ; après « Il y est », la suppression se fait comme avant) ; un témoin (le second lot n'est pas commencé : une évaluation se supprime comme aujourd'hui) ; des mutations rouges ; Vitest complet.

## Arrête-toi à la demande de relecture

`plans de travail/DEMANDE-RELECTURE-2026-10-02-1007-codex-a-part.md`, avec une proposition de ligne pour les Nouvelles. Ni release, ni push du code : ce chemin précède l'effacement des données de l'usager, relecture croisée (règle 2).

## Ce que tu rends

À Grégoire, trois lignes en gestes : ce qui se passe désormais quand il supprime un trimestre ou un groupe ; ce qui l'attend ; ce que tu as supposé, en une ligne.
