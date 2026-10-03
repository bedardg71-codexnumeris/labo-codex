# Portes terrain – 3 octobre 2026 : un codex à part avant de supprimer (#1007, premier lot)

> Écrit par Claude Code le 3 octobre 2026 (Toronto), sur la consigne de Cowork de 3 h 25.
> Version visée : **1.175.0**, build **1003-0331**. Cowork publie l'artefact jumeau (bouton « Copier mes résultats »).
> Ce qui échoue devient une ligne au `BACKLOG.md`, sous #1007, avec le numéro de la porte.

**Pourquoi une porte.** Supprimer un trimestre efface ses données pour de bon. Le banc du lot rejoue tout le parcours dans un navigateur imité ; il ne voit ni la vraie fenêtre « Enregistrer sous » de Chrome, ni un vrai fichier rouvert. Un raté ici serait une perte de données : c'est la seule raison de cette porte.

**Rien ne touche tes vraies données** : tout se fait dans une fenêtre de navigation privée de Chrome, sur le Mac. Pas d'iPad dans cette porte.

---

## §0 · Préalable

| # | Geste | Attendu |
|---|---|---|
| 0.1 | Dans Chrome sur le Mac, ouvre une **fenêtre de navigation privée** (Cmd+Maj+N), et seulement elle. | Une fenêtre sombre « Navigation privée ». |
| 0.2 | Va à `https://app.codexnumeris.org` et lis le numéro en bas de page. | **1.175.0**. Sinon, recharge ; s'il reste plus bas, arrête-toi : la porte jugerait l'ancienne version. |
| 0.3 | Laisse l'application ouvrir son espace (la démo, ou un espace neuf). | L'accueil s'affiche. |
| 0.4 | Réglages › Trimestre › « + Nouveau trimestre » : crée un trimestre nommé **Essai à supprimer**. Garde l'autre trimestre comme trimestre actif. | « Essai à supprimer » apparaît dans la Bibliothèque, **sans** être le trimestre actif. (Le trimestre actif ne peut pas être supprimé : c'est voulu.) |

## §1 · ⚠⚠ Données – supprimer un trimestre (en fenêtre privée)

**Pourquoi.** Avant cette version, supprimer un trimestre exigeait un codex à jour, que ta mise à jour suivante effaçait. Désormais, l'application écrit d'abord un codex à part, sous un autre nom, et ne supprime rien tant qu'il n'est pas écrit.

| # | Geste | Attendu |
|---|---|---|
| 1.1 | Réglages › Trimestre › « Bibliothèque » ; sur la ligne **Essai à supprimer**, clique « Supprimer… ». | Une fenêtre titrée **« Avant de supprimer, un codex à part »**. |
| 1.2 | Lis la première phrase. | « Supprimer le trimestre « Essai à supprimer » efface pour de bon ses étudiant·es, ses évaluations, ses présences, ses productions, ses captures et ses modèles. » |
| 1.3 | Lis la suite. | « L'application va d'abord écrire un codex à part, sous un autre nom. Tes prochaines mises à jour n'y toucheront pas : il te permettra de revenir en arrière. » Deux boutons : « Annuler » et « Écrire le codex à part » (rouge). |
| 1.4 | Clique **« Annuler »**. | La fenêtre se ferme. Aucun fichier n'est demandé. |
| 1.5 | Rouvre la Bibliothèque. | **Essai à supprimer** est toujours là. |
| 1.6 | Refais « Supprimer… » sur la même ligne, puis clique « Écrire le codex à part ». | L'application prépare le fichier (un aperçu peut s'afficher : confirme-le), puis **te demande où l'enregistrer**. |
| 1.7 | Regarde le nom proposé dans la fenêtre d'enregistrement, et note-le. ✍ | Il commence par `codex-` et contient **`avant-suppression`**, suivi de la date et de l'heure (forme `codex-‹nom›-avant-suppression-2026-10-03-HHhMM.zip`). |
| 1.8 | Enregistre-le sur le Bureau. | Une notification « Codex à part écrit », avec le nom du fichier. Le fichier est sur le Bureau. |
| 1.9 | Lis la confirmation qui suit. | « Supprimer définitivement le trimestre « Essai à supprimer » ? Toutes ses données seront effacées : … ». Clique OK. |
| 1.10 | Retape le nom exact, **Essai à supprimer**, puis OK. | « Trimestre "Essai à supprimer" supprimé (… clés de données effacées). » |
| 1.11 | Rouvre la Bibliothèque. | **Essai à supprimer** n'y est plus. |

## §2 · Le codex à part rouvert ailleurs ramène le trimestre

**Pourquoi.** C'est la promesse de la fenêtre : « il te permettra de revenir en arrière ». Faisable sans tes données : un espace privé neuf sert d'« ailleurs ».

| # | Geste | Attendu |
|---|---|---|
| 2.1 | Ferme **toutes** les fenêtres de navigation privée (ce qu'elles contenaient s'efface). Rouvre-en une seule, et va à `https://app.codexnumeris.org`. | Un espace qui n'a jamais vu **Essai à supprimer**. |
| 2.2 | Réglages › Données › « Ouvrir un Codex… » ; choisis le fichier du Bureau (1.8). Accepte le remplacement. | L'ouverture va au bout, sans bandeau « Erreur ». |
| 2.3 | Réglages › Trimestre › Bibliothèque. | **Essai à supprimer** est de retour. |

## §3 · Décisions

Aucune : les mots ont été acceptés le 3 octobre à 3 h 25.

## §4 · Ce que je n'ai pas pu vérifier

- **La vraie fenêtre « Enregistrer sous » de Chrome** : le banc l'imite. C'est l'objet des rangées 1.6 à 1.8.
- **Le fichier rouvert** : le banc n'a pas rouvert un codex à part écrit dans un vrai navigateur. C'est l'objet du §2.
- **Les quatre autres gestes** (un groupe-cours, un groupe d'élèves, « Vider la liste », « Réinitialiser toutes les données ») passent par la même fenêtre et la même écriture ; ils sont couverts par le banc (`tests/integration/1007-codex-a-part-avant-suppression.spec.js`), pas par cette porte.
- **L'iPad** : la feuille de partage (« Enregistrer dans Fichiers ») est imitée par le banc, jamais vue sur un vrai iPad. Hors de cette porte ; à voir en usage normal.
- **Supposé** : un espace neuf en navigation privée laisse créer un trimestre non actif à côté du trimestre de départ (0.4). Si l'écran ne le permet pas, dis-le : la porte s'arrête là.
