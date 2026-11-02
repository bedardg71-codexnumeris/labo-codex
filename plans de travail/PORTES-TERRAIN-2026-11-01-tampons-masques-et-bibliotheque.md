# Portes terrain – Tes tampons personnalisés restent (1er novembre 2026)

> **La trace.** L'artefact à cocher est à publier par Cowork, **après le push** de la mise en ligne : avant, tu jugerais la version d'avant.
> **État : pas encore due.** Le lot est commité sur `main`, pas poussé.
> Ce qui échoue devient un item de `Retours des testeurs/SUIVI-BUGS.md`, pas une note mentale.
> Détail : `RAPPORT-2026-11-01-tampons-masques-et-bibliotheque.md`.

## § 0 · Préalable

**0.1** · iPad · Ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
⮕ Attendu : le numéro annoncé par la mise en ligne (1.230 est prévu, à confirmer ici). Si tu lis 1.229, arrête-toi : le correctif n'est pas encore chez toi.

**0.2** · `⚠⚠ Données` · Enregistre ton codex avant de toucher à tes tampons.
⮕ Attendu : le codex est à jour.

## § 1 · ⚠⚠ Données – ta personnalisation, sur l'iPad

**Pourquoi** : après un rechargement, tes noms revenaient au défaut, tes tampons créés perdaient leur image, et les tampons par défaut que tu avais retirés revenaient. Si tu enregistrais à ce moment-là, les noms par défaut s'écrivaient pour de bon.

**1.1** · `⚠⚠ Données` `iPad` · Dans Annoter, ouvre la personnalisation des tampons. Retape tes noms s'ils sont revenus au défaut, retire les tampons par défaut dont tu ne veux pas, puis touche « Enregistrer ».
⮕ Attendu : la palette montre tes noms, tes tampons créés et leurs images.

**1.2** · `⚠⚠ Données` `iPad` · Recharge la page deux fois de suite, puis rouvre une copie dans Annoter.
⮕ Attendu : tes noms, tes tampons créés avec leurs images, et les tampons retirés toujours absents. Avant, tout revenait au deuxième rechargement au plus tard.

**1.3** · `⚠⚠ Données` `iPad` · Ouvre la bibliothèque de tampons, descends jusqu'à un tampon à image SVG dans « Dans ta palette », et touche « Garder dans ma bibliothèque ».
⮕ Attendu : dans « Dans ta bibliothèque », son aperçu montre ton image, pas l'image par défaut. Si ce tampon y était déjà, avec le mauvais nom ou la mauvaise image : « Supprimer de ma bibliothèque », puis « Garder ».

## § 2 · Interface

Rien : les autres vérifications d'écran sont faites par les essais automatiques.

## § 3 · Décisions

Rien ici. Cowork te soumettra séparément la question du tampon gardé dans la bibliothèque avant d'être personnalisé : aujourd'hui, la bibliothèque garde l'ancien nom et l'ancienne image, sans offrir de mise à jour.

## § 4 · Ce que je n'ai pas pu vérifier

- **Le vrai iPad et tes vraies données** : tout est mesuré dans WebKit et Chrome sur le Mac, avec des données fictives.
- **« Mes tampons créés n'apparaissent dans aucune des deux colonnes » n'est pas reproduit.** Au banc, ils y sont toujours, au bas d'une longue liste. Si tu ne les trouves toujours pas en bas de la colonne, dis-le : ce serait un autre défaut.
- **Les tampons sortis pendant un enregistrement avant ce correctif ne reviennent pas**, s'il y en a eu ; je ne peux pas le savoir d'ici.
- **La suite complète du navigateur** n'a pas tourné sur ce lot : elle part avec la mise en ligne.
