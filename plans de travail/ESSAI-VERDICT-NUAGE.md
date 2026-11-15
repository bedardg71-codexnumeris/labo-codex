# Essai du régime « le nuage juge » — journal des verdicts

**Ce fichier est exigé par la règle 7 de `PROTOCOLE.md`** (condition de Cowork, 15 nov. 2026). Le régime est à l'essai pour **trois lots**, comptés après la fusion de `lot/verdict-nuage`. Les verdicts de ce lot-là sont consignés aussi, sans compter.

**Qui écrit, et quand** : la session qui a lancé le verdict, dès qu'il a conclu, dans un commit qui ne touche rien d'observable (le verdict vaut pour lui, `jugeSur`).

**Les trois issues** :

- **vert** : aucun essai rouge hors de `scripts/playwright-baseline-linux.json` ;
- **rouge par intermittent** : un rouge hors liste qui ne tient pas au lot (vert au Mac, ou vert à la relance sur le même SHA) ; l'essai est classé dans la liste, avec sa cause, dans ce lot ;
- **rouge vrai** : un rouge hors liste que le lot a amené ; il se corrige.

**Le repli** : pendant l'essai, le verdict complet du Mac (`node scripts/verdict-en-morceaux.mjs`) reste permis. Son emploi se consigne ici, avec son motif.

## Les verdicts du nuage

| Date | Lot (branche) | SHA | Run | Durée | Issue | Essais en cause |
|---|---|---|---|---|---|---|

## Le complément du Mac

| Date | SHA | Essais | Durée | Issue | Essais en cause |
|---|---|---|---|---|---|

## Les replis sur le verdict complet du Mac

| Date | SHA | Durée | Issue | Motif du repli |
|---|---|---|---|---|

## Le bilan, après le troisième lot

À écrire par Claude Code, pour Cowork, qui le porte à Grégoire : combien de verdicts, combien de chaque issue, la durée, ce que les rouges par intermittent ont coûté, et ce que le repli a servi. Le régime se confirme, se corrige ou se retire.
