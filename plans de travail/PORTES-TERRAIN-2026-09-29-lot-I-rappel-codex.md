# Portes terrain – lot I : le rappel mène au codex (#985)

> Écrites le 29 septembre 2026, vers 21 h, par Claude Code (le markdown ; **Cowork publie l'artefact**, bouton « Copier mes résultats »). Sur tes **données réelles**, à l'adresse `https://app.codexnumeris.org`, sur l'iPad. Ce qui échoue devient une fiche du BACKLOG.
>
> ⚠ **La porte attend 1.170.0 en ligne** (release, verdict WebKit complet, puis push ; « en ligne » se lit chez Netlify).
>
> **Artefact publié par Cowork le 30 sept. à 5 h 10** : https://claude.ai/artifact/LxDGLt7eyMMVYYJKgWtYcz (six rangées). Rangée 0.2 ajoutée par Cowork : un rappel déjà dû, fermé par la croix au chargement, aurait rendu le §1 vert sans rien prouver.
>
> **Pourquoi une seule porte, par les deux règles de tête** : le banc WebKit du Mac (`lot-i-rappel-mene-au-codex`) juge déjà les mots du rappel, la croix, l'échec, « Il n'y est pas », « Il y est » et « Ne plus rappeler ». Il ne peut pas juger ton iPad avec ton codex réel et ta date de rappel déjà posée : c'est le seul cas que tu as vécu.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | Sur l'iPad, ouvre `https://app.codexnumeris.org`, recharge, lis le numéro en bas de page. | **1.170.0 ou plus récent.** Un numéro plus ancien : arrête-toi. |
| 0.2 | Une fenêtre s'est-elle ouverte au chargement ? | Possible : le rappel était dû. Titre « Mets ton codex à jour ». **Ne la ferme ni par la croix ni par « Plus tard »** (14 jours de silence : le §1 ne prouverait plus rien) ; touche « Mettre à jour le codex » et fais 1.1 depuis l'aperçu. Pas de fenêtre : ✓, puis 1.1 par le menu. |

## §1 · Après une mise à jour du codex, aucun rappel `iPad`

*Pourquoi : le 29 sept., après avoir mis ton codex à jour à 15 h 03, l'invitation à faire une copie de secours revenait à l'ouverture de l'application.*

| | Geste | Attendu |
|---|---|---|
| 1.1 | Bouton « Codex » › « Mettre à jour le codex » (ou le bouton de la fenêtre de 0.2), « Télécharger », enregistre dans Fichiers. | « Codex mis à jour » ; le menu dit « Ton codex est à jour ». |
| 1.2 | Ferme l'onglet de l'application, rouvre `https://app.codexnumeris.org`, attends deux secondes. | Aucune fenêtre de rappel (ni « Fais une copie de secours », ni « Mets ton codex à jour »). |
| 1.3 | Refais 1.2 une seconde fois. | Toujours aucun rappel. |

## §2 · La carte « Ton codex » de l'Accueil `iPad`

*Pourquoi : cette carte s'appelait « Copie de secours » et ouvrait déjà ce rappel ; son titre ne disait plus ce qu'elle fait.*

| | Geste | Attendu |
|---|---|---|
| 2.1 | Sur l'Accueil, touche la carte « Ton codex » (sous « Utilitaires »). | La fenêtre « Mets ton codex à jour » s'ouvre. Ferme-la par « Plus tard ». |

## §3 · Décisions

Aucune : les mots du rappel (D8), de la carte et des Nouvelles sont acceptés (29 sept., vers 20 h 50).

## §4 · Ce que je n'ai pas pu vérifier

- **Ton iPad, au doigt** : le banc passe par WebKit sur le Mac, avec un faux partage vers Fichiers.
- **Ta date de rappel déjà posée** (le stock) : si tu avais choisi « Dans 30 jours », une mise à jour du codex ne la rapproche pas (au banc) ; si tu avais choisi « Ne plus rappeler », il reste éteint (au banc). Ce que ton iPad contient réellement n'est pas mesuré.
- **Un rappel déjà dû à l'ouverture**, avant toute mise à jour : il s'affiche une fois, avec les nouveaux mots ; la croix le repousse de 14 jours (au banc, pas sur l'iPad).

## Relevé de Grégoire – 30 sept. 2026, 5 h 18 (lu par Cowork le 30 sept. à 5 h 18)

Coché : 6 passées, 0 échec. **Lecture de Cowork : porte NON CONCLUANTE, 1.1 en échec réel.**
- Captures de l'iPad : 5 h 11, le rappel « Mets ton codex à jour » s'ouvre au chargement (0.2 : le nouveau rappel s'affiche, conforme) ; 5 h 12, « Génération du codex – Compression du ZIP… 2 % compressé » ; 5 h 12 et 5 h 15, le menu dit toujours « Ton codex n'a pas tes derniers changements », dernier fichier `codex-601-101-A26-A25H26-2026-09-29-15h00.zip`. Grégoire : « Le codex ne semble pas avoir été remplacé par un plus récent. L'horodatage est le même. »
- Donc la mise à jour n'a pas abouti. Si aucun message « Codex non mis à jour » n'est apparu, c'est le symptôme du 29 au matin (#988) qui revient, malgré 1.169.0.
- §1 (1.2, 1.3) ne prouve rien : sans mise à jour réussie, aucun report ne vient du codex ; l'absence de rappel vient d'un autre report (croix ou « Plus tard » à 5 h 11 ?), non établi.
- Demandé à Grégoire : la section « DERNIÈRE MISE À JOUR DU CODEX » du rapport de bug.
- **Rapport de bug de 5 h 22** (seconde tentative, début 5 h 20 min 32 s) : étape atteinte « compression », taille estimée 1 331 788 225 octets, 0 essai d'écriture, **issue « interrompue (la page a été rechargée pendant la tentative) »**. Cause probable, non prouvée : Safari tue l'onglet par manque de mémoire. Lot J0 ouvert (`CONSIGNE-DU-JOUR.md`). §0 et §2 passés ; §1 à refaire après J0.
- Constaté par Grégoire à 5 h 27 (capture de Fichiers › Téléchargements) : seul le rapport de bug de 5 h 22 s'y trouve, aucun codex. Concorde avec « 0 essai d'écriture ». (Ajouté par Cowork à 5 h 28.)
