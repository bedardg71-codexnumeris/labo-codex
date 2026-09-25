# Consigne du jour – #583 + #680 : partager une échelle transporte ses repères de maîtrise (et ce qu'elle perdait d'autre)

> Écrite le 25 septembre 2026, vers 15 h 45 (Toronto), par Cowork, sur `origin/main` = `ad06d508` (1.159.8 en ligne). **À remesurer avant tout code.**
> La précédente (#947, livrée en 1.159.7) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-25-bug-947-visionneuse.md` (déplacée par Cowork, à commiter avec ce lot).
> Fiches existantes : **#583** (les deux repères partent sans un mot, à l'émission) et **#680** (les autres champs d'échelle laissés en chemin, sans registre d'exclusion). Lot choisi par Grégoire le 25 sept. après-midi : c'est la condition pour que la synthèse des rétroactions (bilan « Présentement » et « Points récurrents », qui lisent les repères) fonctionne chez un·e collègue qui reçoit une échelle partagée.

## 0 · La décision de Grégoire (25 sept. 2026, 15 h 40) – elle fait foi, et remplace celle du 28 août

**« On prolonge le format actuel. La version ne viendra pas avant juin 2027. »** Pas de `labo-codex-partage-v2`. Les champs manquants sont ajoutés au schéma `v1`, comme l'ont été la formule d'un critère algorithmique (#667, 31 août), la projection EUF (#668, 1er sept.) et `valeur` (1er sept.). Ligne à poser sous la fiche #583, à la place de la décision du 28 août (garde celle-ci barrée, avec sa date) :
> « 25 sept. 2026 – Grégoire : on prolonge le format `v1` (option A du 28 août abandonnée) ; un format `v2` ne viendra pas avant juin 2027. Motif mesuré par Cowork : le `v1` a déjà été étendu trois fois depuis le 28 août. »

**Et ce qui manque dans les deux cas** : un paquet qui porte un champ que l'application ne connaît pas (une page restée ouverte sur une version plus ancienne) est refusé aujourd'hui par un message technique (« champ inconnu (schéma fermé) », `partage-validation.js` ≈ l. 219, relayé par `partage-import.js` ≈ l. 511). Ce refus doit dire à l'enseignant·e quoi faire. **Texte proposé par Cowork, à soumettre à Grégoire avant le push** : « Ce fichier vient d'une version plus récente de Labo Codex. Recharge la page (Cmd+Maj+R), puis importe-le de nouveau. » Le détail technique peut rester dessous, en second.

## 1 · Ce que Cowork a lu (lecture seule, sur `ad06d508` – non exécuté)

- `SCHEMA_ENTITE.echelle` (`js/partage-schemas.js` ≈ l. 356) : niveaux `code, nom, min, max, valeurCalcul, valeur, couleur` ; racine `config, dateCreation, dateModification, dansBibliotheque…`. **Ni `seuilSuffisance` ni `seuilMaitrise`.** `projeterEntite` (`partage-format.js` ≈ l. 137) ne copie que le déclaré.
- Le canal d'import-export, lui, les porte (`SCHEMAS_IMPORT.echelle`, `import-export.js` ≈ l. 790 : **codes** de niveau, `string` ≤ 20) et tient un registre de ce qu'il ne transporte pas, avec la raison (`CLES_ECHELLE_NON_TRANSPORTEES`, ≈ l. 428).
- #680 a mesuré les autres écarts : au niveau `description`, `niveauSOLO` ; à la racine `description`, `discipline` ; et des champs LOCAUX qui ne doivent pas voyager (`auteur`, `auteurOriginal`, `dateImport`, `dateAjoutBiblio`, `estDemo`, `isDemo`, `verrouille`, `idOriginal`).
- Audit d'origine : `Rapports/AUDIT-copies-echelle-reperes-2026-08-28.md` (§5).

## 2 · Le lot

1. **Mesure d'abord, en WebKit** : partager une échelle à repères (fictive), la recevoir sur un espace vierge. Note ce qui arrive, et ce que lit le bilan d'une copie évaluée avec elle chez le destinataire (rouge attendu : « Présentement » muet).
2. **Émission** : ajouter au schéma de partage les deux repères, et les champs de #680 qui doivent voyager (`niveauSOLO`, les `description`, `discipline` : à trancher par toi un à un selon ce que l'application en fait chez le destinataire – technique). Même type que le canal d'import-export (codes de niveau).
3. **Réception** : un repère qui ne désigne aucun `code` des niveaux transportés ne doit pas arriver tel quel ; ta règle (retirer ce repère et le dire au bilan d'import, ou refuser) – décide et nomme-la.
4. **Registre d'exclusion côté partage**, comme `CLES_ECHELLE_NON_TRANSPORTEES` : chaque champ d'échelle connu de l'application et non transporté y figure avec sa raison. **Idéalement une seule source pour les deux canaux** (zéro-dette) ; si c'est trop, dis pourquoi. Un banc qui rougit si un champ d'échelle n'est ni transporté ni exclu – c'est ce qui empêche la cinquième fois.
5. **Le message de refus** du § 0, pour tout champ inconnu d'un paquet (pas seulement l'échelle).

## 3 · Limites

- **Tarir n'est pas réparer.** Les échelles déjà partagées et reçues sont arrivées sans repères ; rien ne les reconnaît comme telles chez le destinataire. **Aucune donnée réécrite.** Stock assumé, écrit dans la fiche : le destinataire peut poser ses repères à la main dans l'éditeur d'échelle.
- La signature des paquets (`signature.js`) ne doit pas changer de comportement : un paquet signé avant ce lot se vérifie encore. Prouve-le.
- Le format reste `labo-codex-partage-v1` (décision du § 0) ; ne change pas la chaîne.
- Aucun nom d'élève réel dans les bancs ni dans le rapport (règle 6).

## 4 · Preuve attendue

- Vitest : émission (les repères et les champs retenus partent) ; réception (ils arrivent ; un repère orphelin suit ta règle) ; un paquet d'avant ce lot (sans repères) s'importe toujours ; le registre (tout champ connu est transporté ou exclu) ; le message de refus d'un champ inconnu.
- WebKit : le § 2.1, rouge avant, vert après – le bilan de la copie évaluée chez le destinataire parle.
- Break-tests de ton choix, chacun rouge ; nomme-les.
- « Nouvelles » : **proposition de Cowork, à soumettre à Grégoire avant le push** : « Partage : une échelle partagée emporte maintenant ses repères de maîtrise ; chez la personne qui la reçoit, le bilan de la rétroaction (« Présentement… », « Points récurrents ») fonctionne comme chez toi. Les échelles reçues avant cette version n'ont pas leurs repères : on peut les poser dans l'éditeur d'échelle. »
- Relecture croisée de Cowork **avant** la fusion (le lot touche ce qui voyage entre enseignants) : branche, `DEMANDE-RELECTURE-2026-09-25-lot-583-680.md`, puis verdict, fusion, push.

## 5 · Porte terrain

Probable, à décider par toi après la mesure : un partage réel entre deux comptes, ou entre le Mac et l'iPad, si le banc WebKit ne couvre pas le fichier réellement échangé. Aucune donnée fictive à créer par Grégoire sur ses vraies données.
