# Consigne – En Évaluer, toucher la copie du doigt ne ramène plus en Annoter (2 novembre 2026)

> Écrite par Cowork le lundi 2 novembre 2026 à 8 h 05 (Toronto, mesuré par `date`), sur `main` = `2acef748` (1.230.0 en ligne). **Retour de testeur : priorité absolue.** Si le lot de mesure des tampons tourne, Grégoire l'a interrompu ; il reprendra après celui-ci.
> **Rapport de bug de Grégoire** (8 h 04, iPad, Safari 27.2, 1.230.0, gravité « GÊNANT ») : « En mode Évaluer, aussitôt que je touche au canevas je retombe en mode Annoter. » Ses dernières actions : un code choisi en Annoter (7 h 57), puis Évaluer.
> Il évalue sur l'iPad toute la journée. Pour lui, en Évaluer, « l'annotation est terminée et la relecture de la copie est plus globale » (8 h 02), et il fait défiler la copie à deux doigts.

## 0. Avant tout

- Commit de docs seul : cette consigne. Inscris la fiche au BACKLOG et le bug dans `Retours des testeurs/SUIVI-BUGS.md`.

## 1. La cause probable, lue par Cowork (à reproduire d'abord)

`js/travaux-annotation.js`, `onPointerDown` : sous l'outil Sélection, un doigt est accepté, et le **premier** doigt appelle `avantPremiereAnnotation()`, qui ramène en Annoter dès qu'on est en Évaluer (vers 460). Un défilement à deux doigts commence par un doigt : il bascule avant que le second arrive. Sous un code ou un tampon, un toucher pose (#1123, 20 oct.) et bascule aussi (vers 502). Sous « Déplacer la page » (`position`), rien ne se passe. Depuis ce matin, la copie dépasse son cadre et se fait défiler : il touche la copie bien plus souvent.

Reproduis d'abord, WebKit au doigt, 1180 × 820 : en Évaluer, outil Sélection, un toucher ; un défilement à deux doigts ; un code actif, un toucher. Écris le résultat au rapport.

## 2. Le correctif (décision de Cowork)

**En Évaluer, un doigt sur la copie sert à la parcourir, jamais à annoter** : il ne sélectionne pas, ne pose ni code ni tampon, et ne ramène pas en Annoter ; le défilement et le pincement à deux doigts marchent. **Le stylet ne change pas** : il annote et ramène en Annoter, comme depuis février. **En Annoter, rien ne change.**

## 3. Les tests

- WebKit au doigt : en Évaluer, sous Sélection puis sous un code actif, un toucher et un défilement à deux doigts laissent en Évaluer, sans rien poser ; le stylet, lui, pose et ramène en Annoter ; en Annoter, un toucher sous un code pose toujours (#1123).
- Contre-épreuves (skill `verification-adverse`).

## 4. Fin

Commit, Vitest entier, specs touchées (`annotation-*`, `palette-*`, `evaluer-*`). **Pas de release** : rapport `RAPPORT-2026-11-02-evaluer-un-doigt.md` à Cowork, qui écrira la mise en ligne (un point de Nouvelles à faire valider par Grégoire, puis la vérification complète à son signal).
