import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// #626 / S8 du plan « modèle d'objets de l'onglet Conception » — retraits sûrs
// statiquement (constats S5 partie morte, M2, M3, M4, M5, M8, M11 de
// `Rapports/AUDIT-modele-objets-conception-2026-08-30.md`).
//
// Ce banc verrouille les DEUX côtés, et c'est délibéré : une assertion d'absence
// seule ne distingue pas « le symbole a été retiré » de « je regarde le mauvais
// fichier ». Chaque retrait est donc apparié à un témoin — l'implémentation
// VIVANTE qui gagnait déjà par l'ordre de chargement, ou le consommateur qui
// justifiait de garder le symbole.
//
// ⚠ DEUX CONSTATS DE L'AUDIT ONT ÉTÉ RÉFUTÉS À LA MESURE, et ce banc les fige
// pour que personne ne les réapplique sur la foi du rapport :
//   · M11 disait `planificationCarte.etat` « exposé sans consommateur ». FAUX :
//     `js/planification-export.js` le lit trois fois (l.336, l.363, l.375) via
//     `carte()`. Le retirer casserait l'export du plan de cours.
//   · M5 disait `sauvegarderModeCalculObjectifs` « exporté, zéro appelant ».
//     Il n'était pas exporté du tout, et il avait un appelant
//     (`changerModeCalculObjectifs`). Retiré AVEC sa ligne d'appel.
//
// BREAK-TEST — TROIS mutations, une par côté, le 31 août 2026. Un rouge obtenu
// sur le seul côté « retrait » ne prouverait que la moitié : il resterait
// possible que les témoins passent parce qu'ils n'assertent rien.
//   1. côté RETRAIT — remettre `window.creerNouvellePratique` dans
//      pratiques-gestion.js …………………………………………………… code de sortie 1
//   2. côté RÉFUTATION — retirer `etat: etat,` de l'export de
//      planification-carte.js ………………………………………………… code de sortie 1
//   3. côté FUSION — donner à `supprimerProduction` le geste de l'implémentation
//      MORTE (`afficherTableauProductions`) au lieu de celui du survivant
//      (`afficherListeProductions`) : se tromper de survivant dans une fusion se
//      lit ici, et nulle part ailleurs ………………………… code de sortie 1
// Restauration PAR COPIE (jamais `git checkout` : l'arbre porte du travail non
// commité) → code de sortie 0.

const src = {};
const FICHIERS = [
    'js/pratiques-gestion.js',
    'js/pratiques.js',
    'js/pratique-notation-v2.js',
    'js/pratiques/pratique-interface.js',
    'js/cc-license.js',
    'js/tableau-bord-apercu.js',
    'js/main.js',
    'js/grilles-bibliotheque.js',
    'js/grilles.js',
    'js/cartouches-bibliotheque.js',
    'js/cartouches.js',
    'js/productions.js',
    'js/guidage-demo.js',
    'js/accompagnement-contenu-popup.js',
    'js/planification-carte.js',
    'js/planification-export.js'
];

beforeAll(() => {
    for (const f of FICHIERS) src[f] = readFileSync(path.join(racine, f), 'utf8');
    src['index.html'] = readFileSync(path.join(racine, 'index.html'), 'utf8');
});

// Les assertions de PRÉSENCE portent sur le code seul : un nom cité dans un
// commentaire d'historique ne prouve pas qu'il est encore appelé, et un nom
// retiré reste souvent mentionné dans la note qui explique son retrait.
function sansCommentaires(code) {
    return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}
function code(f) {
    return sansCommentaires(src[f]);
}

describe('#626 · S5 partie morte — la définition perdante de `creerNouvellePratique` est retirée', () => {

    it('pratiques-gestion.js ne définit ni n\'expose plus `creerNouvellePratique`', () => {
        const c = code('js/pratiques-gestion.js');
        expect(c).not.toMatch(/function\s+creerNouvellePratique\s*\(/);
        expect(c).not.toMatch(/window\.creerNouvellePratique\s*=/);
    });

    // TÉMOIN — celle qui gagnait déjà par l'ordre de chargement (position 80
    // contre 44 dans index.html) doit rester, et le bouton doit encore la viser.
    it('TÉMOIN · pratiques.js reste le seul à définir et exposer `creerNouvellePratique`', () => {
        const c = code('js/pratiques.js');
        expect(c).toMatch(/function\s+creerNouvellePratique\s*\(/);
        expect(c).toMatch(/window\.creerNouvellePratique\s*=/);
    });

    it('TÉMOIN · le bouton d\'index.html vise toujours `creerNouvellePratique`', () => {
        expect(src['index.html']).toContain('data-action="creerNouvellePratique"');
    });
});

describe('#626 · M3 — les deux clusters shadowés morts sont retirés', () => {

    // Ils scannaient les suffixes obsolètes `_grilles` / `_cartouches`, quand la
    // clé réelle est `<id>_grillesTemplates`. Shadowés en plus par une définition
    // chargée après : le `window.X` de la bibliothèque n'a jamais gagné.
    const CLUSTER_GRILLES = ['listerTrimestresAvecGrilles', 'formaterNomTrimestreGrilles', 'obtenirGrillesTrimestre'];
    const CLUSTER_CARTOUCHES = ['listerTrimestresAvecCartouches', 'formaterNomTrimestreCartouches', 'obtenirCartouchesTrimestre'];

    it('grilles-bibliotheque.js ne porte plus le cluster `_grilles`', () => {
        const c = code('js/grilles-bibliotheque.js');
        for (const nom of CLUSTER_GRILLES) {
            expect(c, `${nom} ne doit plus être défini`).not.toMatch(new RegExp(`function\\s+${nom}\\s*\\(`));
            expect(c, `window.${nom} ne doit plus être exposé`).not.toMatch(new RegExp(`window\\.${nom}\\s*=`));
        }
        expect(c, 'le suffixe obsolète _grilles ne doit plus être scanné').not.toContain("endsWith('_grilles')");
    });

    it('cartouches-bibliotheque.js ne porte plus le cluster `_cartouches`', () => {
        const c = code('js/cartouches-bibliotheque.js');
        for (const nom of CLUSTER_CARTOUCHES) {
            expect(c, `${nom} ne doit plus être défini`).not.toMatch(new RegExp(`function\\s+${nom}\\s*\\(`));
            expect(c, `window.${nom} ne doit plus être exposé`).not.toMatch(new RegExp(`window\\.${nom}\\s*=`));
        }
    });

    // TÉMOIN — les implémentations vivantes, celles qui lisent la clé namespacée.
    it('TÉMOIN · grilles.js et cartouches.js gardent leur implémentation vivante', () => {
        expect(code('js/grilles.js')).toMatch(/function\s+listerTrimestresAvecGrilles\s*\(/);
        expect(code('js/cartouches.js')).toMatch(/function\s+listerTrimestresAvecCartouches\s*\(/);
    });

    // Le reste des deux bibliothèques n'est PAS mort : ne pas l'emporter au passage.
    it('TÉMOIN · le reste des deux modules bibliothèque est intact', () => {
        expect(code('js/grilles-bibliotheque.js')).toMatch(/function\s+ajouterGrilleALaBibliotheque\s*\(/);
        expect(code('js/cartouches-bibliotheque.js')).toMatch(/function\s+ajouterCartoucheALaBibliotheque\s*\(/);
    });
});

describe('#626 · M4 — deux des trois couches d\'override de productions.js sont fusionnées', () => {

    // Le motif retiré : une fonction définie puis re-enveloppée plus bas « pour le
    // nouveau layout », l'originale capturée dans un `const …Originale`.
    //
    // ⚠ LE TROISIÈME CAS, `annulerFormProduction`, EST DEHORS — inscrit #633, et
    // ce n'est pas un report en silence. S8 s'appelle « retraits sûrs
    // STATIQUEMENT » ; celui-là ne l'est pas. Ses DEUX corps sont vivants : le
    // wrapper depuis `window` (data-action, productions-liste.js:420),
    // l'originale depuis l'IIFE (fin de `sauvegarderProduction`, et le wrapper de
    // `supprimerProduction`). Fusionner change quatre sites d'appel et RÉPARE au
    // passage un défaut latent (surlignage mort de la barre latérale après
    // suppression de la production affichée) — un correctif de comportement porte
    // son propre item, et exige un test manuel qu'un smoke console ne remplace pas.
    const FUSIONNES = ['sauvegarderProduction', 'supprimerProduction'];

    it('plus aucune capture `…Originale` pour les deux couches fusionnées', () => {
        const c = code('js/productions.js');
        expect(c).not.toMatch(/const\s+sauvegarderProductionOriginale\s*=/);
        expect(c).not.toMatch(/const\s+supprimerProductionOriginale\s*=/);
    });

    it('chacun des deux noms n\'a plus qu\'UNE définition dans productions.js', () => {
        const c = code('js/productions.js');
        for (const nom of FUSIONNES) {
            const definitions = c.match(new RegExp(`(?:^|\\n)\\s*(?:async\\s+)?function\\s+${nom}\\s*\\(`, 'g')) || [];
            const reaffectations = c.match(new RegExp(`(?:^|\\n)\\s*window\\.${nom}\\s*=\\s*(?:async\\s+)?function\\b`, 'g')) || [];
            expect(definitions.length, `${nom} : une seule déclaration attendue`).toBe(1);
            expect(reaffectations.length, `${nom} : plus de réaffectation sur window`).toBe(0);
        }
    });

    // TÉMOIN — la surface d'exports du dispatcher data-action ne bouge pas, et
    // `annulerFormProduction` reste exposé, wrapper compris, jusqu'à #633.
    it('TÉMOIN · les trois noms restent exposés, chacun atteignable depuis window', () => {
        const c = code('js/productions.js');
        for (const nom of FUSIONNES) {
            const exports = c.match(new RegExp(`(?:^|\\n)\\s*window\\.${nom}\\s*=\\s*${nom}\\s*;`, 'g')) || [];
            expect(exports.length, `window.${nom} doit être posé exactement une fois`).toBe(1);
        }
        expect(c).toMatch(/window\.annulerFormProduction\s*=/);
    });

    // TÉMOIN — ce que la fusion de `sauvegarderProduction` devait CONSERVER : le
    // rafraîchissement de la barre latérale que seul le wrapper ajoutait.
    it('TÉMOIN · la couche unique de `sauvegarderProduction` garde le geste du wrapper', () => {
        const c = code('js/productions.js');
        const debut = c.indexOf('async function sauvegarderProduction');
        expect(debut, 'sauvegarderProduction doit exister').toBeGreaterThan(-1);
        const corps = c.slice(debut, c.indexOf('\n}', debut));
        expect(corps).toContain('afficherListeProductions()');
    });

    // TÉMOIN — ce que la fusion de `supprimerProduction` devait CONSERVER : la
    // suppression dans la file (#522) du wrapper, et non le `filter` hors file de
    // l'originale morte. Se tromper de survivant se lit ici.
    it('TÉMOIN · la couche unique de `supprimerProduction` garde la version dans la file', () => {
        const c = code('js/productions.js');
        const debut = c.indexOf('async function supprimerProduction');
        expect(debut, 'supprimerProduction doit exister').toBeGreaterThan(-1);
        const corps = c.slice(debut, c.indexOf('\n}', debut));
        expect(corps).toContain('db.modifier(getCleProductions()');
        expect(corps).toContain('findIndex');
        expect(corps).not.toContain('afficherTableauProductions()');
    });

    // ⚠ TÉMOIN DE MISE À L'ÉCART — tant que #633 n'est pas livré, les DEUX corps
    // d'`annulerFormProduction` doivent être là. Si l'un disparaît sans l'autre,
    // c'est que quelqu'un a fusionné à moitié en lisant M4 sans lire #633.
    it('MISE À L\'ÉCART #633 · les deux couches d\'`annulerFormProduction` sont encore là', () => {
        const c = code('js/productions.js');
        expect(c).toMatch(/function\s+annulerFormProduction\s*\(/);
        expect(c).toMatch(/window\.annulerFormProduction\s*=\s*function\b/);
        expect(c).toMatch(/const\s+annulerFormProductionOriginale\s*=/);
    });
});

describe('#626 · M5 — les écrivains morts sur DOM disparu sont retirés', () => {

    // Leurs cibles `v2-*` ont quitté index.html avec #434 (9 août 2026). Rappelés,
    // ils écrasaient les champs de `modalitesEvaluation` avec des chaînes vides.
    it('pratique-notation-v2.js ne porte plus le trio mort', () => {
        const c = code('js/pratique-notation-v2.js');
        for (const nom of ['changerVariantePANStandards', 'sauvegarderPratiqueBaseV2', 'sauvegarderModeCalculObjectifs']) {
            expect(c, `${nom} ne doit plus être défini`).not.toMatch(new RegExp(`function\\s+${nom}\\s*\\(`));
            expect(c, `${nom} ne doit plus être appelé`).not.toMatch(new RegExp(`(?<!function\\s)\\b${nom}\\s*\\(`));
            expect(c, `window.${nom} ne doit plus être exposé`).not.toMatch(new RegExp(`window\\.${nom}\\s*=`));
        }
    });

    it('aucune cible `v2-*` PROPRE AU TRIO n\'est plus lue', () => {
        // ⚠ La borne est le TRIO, pas le préfixe `v2-`. `v2-objectifs-mode-calcul`
        // reste lu par `chargerConfigParObjectifs` et `changerModeCalculObjectifs`,
        // que la sentinelle #338 verrouille comme vivants : l'assertion doit
        // porter sur les ids que les fonctions retirées lisaient, sinon elle
        // réclamerait un retrait que le plan n'a pas demandé.
        const c = code('js/pratique-notation-v2.js');
        for (const id of ['v2-variante-calcul', 'v2-variante-description', 'v2-pratique-nom', 'v2-pratique-type', 'v2-echelle-id']) {
            expect(c, `${id} ne doit plus être lu`).not.toContain(id);
        }
    });

    // TÉMOIN — le moteur de config consommé par la bibliothèque reste entier.
    it('TÉMOIN · le flux vivant de pratique-notation-v2.js est intact', () => {
        const c = code('js/pratique-notation-v2.js');
        for (const nom of ['chargerConfigParObjectifs', 'chargerConfigSpecifications', 'afficherTypesTravauxSpec', 'afficherForfaitsSpec']) {
            expect(c, `${nom} doit rester défini`).toMatch(new RegExp(`function\\s+${nom}\\s*\\(`));
        }
    });

    it('la doc de structure périmée de pratique-interface.js est retirée', () => {
        // ⚠ CE QUI EST RETIRÉ ICI EST DE LA DOCUMENTATION, PAS DU CODE MORT, et
        // la nuance décide de ce qu'un futur lecteur croira pouvoir supprimer :
        // `js/pratiques/pratique-interface.js` n'est référencé NULLE PART — ni
        // dans index.html, ni par un autre `js/`. Ce n'est pas un orphelin : le
        // fichier EST le contrat `IPratique`, servi comme documentation, et
        // `sentinelle-scripts-atteints-et-parsables.test.js` le nomme comme tel
        // (c'est son unique exception nommée, #657).
        // Ne pas le supprimer parce qu'il ne se charge pas.
        //
        // Ce que ce bloc décrivait était faux sur ses trois champs : `pratique`
        // et `configPAN` sont des miroirs MORTS, purgés par
        // modalites-evaluation.js ; `seuils` y portait des clés
        // (fragile/acceptable/bon) qui n'existent nulle part — les vraies vivent
        // sur la config de pratique (va_bien/difficulte/grande_difficulte).
        expect(src['js/pratiques/pratique-interface.js']).not.toContain("STRUCTURE : Modalités d'évaluation");
    });

    // TÉMOIN — le reste du contrat documenté n'est pas emporté avec le bloc faux.
    it('TÉMOIN · le contrat `IPratique` documenté reste dans pratique-interface.js', () => {
        expect(src['js/pratiques/pratique-interface.js']).toContain("STRUCTURE : Indices CP");
    });
});

describe('#626 · M2 / D5 — les clés mortes ne sont plus lues', () => {

    it('`pratiques_configurations` n\'est plus lue par cc-license.js', () => {
        expect(code('js/cc-license.js')).not.toContain('pratiques_configurations');
    });

    it('`bibliotheque-pratiques` (kebab, jamais écrite) n\'est plus lue', () => {
        expect(code('js/tableau-bord-apercu.js')).not.toContain('bibliotheque-pratiques');
    });

    it('la migration `pratiquesPersonnalisees` de main.js est retirée', () => {
        expect(code('js/main.js')).not.toContain('pratiquesPersonnalisees');
    });

    // TÉMOIN — le volet VIVANT de la même migration reste. Le retrait de #626
    // visait le volet 3 seul. Le volet `preferencesUtilisateur` est parti à son
    // tour au #823 (10 sept. 2026), avec la préférence « Découpler P et N » que
    // personne ne lisait : il ne reste que le volet des pratiques.
    // #900 (lot N6, 23 sept. 2026) : le dernier volet part à son tour — il renommait `decouplerPR` en `decouplerPN`,
    // un champ que personne ne lit sous l'un ou l'autre nom. Rien n'est effacé chez les gens.
    it('la migration `decouplerPR` → `decouplerPN` est retirée, volets des pratiques et des préférences (#823, #900)', () => {
        const c = code('js/main.js');
        expect(c).not.toContain("db.setSync('migration_decoupler_pn_done'");
        expect(c).not.toContain("db.getSync('bibliothequePratiques'");
        expect(c).not.toContain("db.getSync('preferencesUtilisateur'");
    });

    // TÉMOIN — la vraie clé de la bibliothèque n'est pas emportée au passage.
    it('TÉMOIN · `bibliothequePratiques` reste la clé du module propriétaire', () => {
        expect(code('js/tableau-bord-apercu.js')).toContain("cle('pratiquesConfigurables')");
    });
});

describe('#626 · M8 — les deux entrées `conception-apercu-legacy` sont retirées', () => {

    it('ni le guidage de démo ni la fiche d\'aide ne portent l\'entrée', () => {
        expect(src['js/guidage-demo.js']).not.toContain('conception-apercu-legacy');
        expect(src['js/accompagnement-contenu-popup.js']).not.toContain('conception-apercu-legacy');
    });

    // TÉMOIN — un `voirAussi` qui pointe vers une fiche absente est un lien mort
    // silencieux : toutes les cibles doivent exister.
    it('TÉMOIN · toute cible de `voirAussi` correspond à une fiche définie', () => {
        const brut = src['js/accompagnement-contenu-popup.js'];
        const fiches = new Set([...brut.matchAll(/^\s{4}'([a-z0-9-]+)':\s*\{/gm)].map(m => m[1]));
        expect(fiches.size, 'des fiches doivent être détectées, sinon ce témoin ne prouve rien').toBeGreaterThan(5);
        const cibles = new Set();
        for (const m of brut.matchAll(/voirAussi:\s*\[([^\]]*)\]/g)) {
            for (const c of m[1].matchAll(/'([a-z0-9-]+)'/g)) cibles.add(c[1]);
        }
        const orphelines = [...cibles].filter(c => !fiches.has(c)).sort();
        expect(orphelines).toEqual([]);
    });

    // TÉMOIN — les cinq autres entrées de guidage de la section restent.
    it('TÉMOIN · les entrées de guidage vivantes de Conception restent', () => {
        for (const cle of ['conception-grille-criteres', 'conception-echelle-performance', 'conception-retroactions']) {
            expect(src['js/guidage-demo.js'], `${cle} doit rester`).toContain(cle);
        }
    });
});

describe('#626 · M11 — menus résidus', () => {

    it('`onChangeGrilleCartouche` (deprecated, zéro appelant) est retiré', () => {
        const c = code('js/cartouches.js');
        expect(c).not.toMatch(/function\s+onChangeGrilleCartouche\s*\(/);
        expect(c).not.toMatch(/window\.onChangeGrilleCartouche\s*=/);
    });

    it('`exporterCartoucheActive` n\'est plus exposée deux fois', () => {
        const c = code('js/cartouches.js');
        const poses = c.match(/(?:^|\n)\s*window\.exporterCartoucheActive\s*=/g) || [];
        expect(poses.length, 'exactement une pose attendue').toBe(1);
    });

    // TÉMOIN — la fonction elle-même, et la nouvelle unifiée vers laquelle
    // l'obsolète redirigeait, restent.
    it('TÉMOIN · `exporterCartoucheActive` et `onChangeSelectionCartouche` restent définies', () => {
        const c = code('js/cartouches.js');
        expect(c).toMatch(/function\s+exporterCartoucheActive\s*\(/);
        expect(c).toMatch(/function\s+onChangeSelectionCartouche\s*\(/);
        expect(c).toMatch(/window\.onChangeSelectionCartouche\s*=/);
    });

    it('l\'aller-retour no-op `lire()` → `remplacer()` de pratiques.js est retiré', () => {
        // `chargerConfigurationPratique` lisait `modalitesEvaluation` puis la
        // réécrivait telle quelle : les deux miroirs qui mutaient l'objet entre
        // les deux ont été retirés par #436 G2-b et #328 L2-c.
        const c = code('js/pratiques.js');
        const debut = c.indexOf('function chargerConfigurationPratique');
        expect(debut, 'chargerConfigurationPratique doit exister').toBeGreaterThan(-1);
        const corps = c.slice(debut, c.indexOf('\nfunction ', debut + 10));
        expect(corps).not.toContain('window.modalitesEvaluation.remplacer(modalites)');
        expect(corps).not.toContain('const modalites = window.modalitesEvaluation.lire()');
    });

    // TÉMOIN — le reste de la fonction fait un vrai travail : ne pas la vider.
    it('TÉMOIN · `chargerConfigurationPratique` garde son travail réel', () => {
        const c = code('js/pratiques.js');
        const debut = c.indexOf('function chargerConfigurationPratique');
        const corps = c.slice(debut, c.indexOf('\nfunction ', debut + 10));
        expect(corps).toContain('afficherSectionsSelonConfig(config)');
        expect(corps).toContain("sessionStorage.setItem('pratiqueSelectionnee'");
    });

    it('la copie fantôme `js/.fuse_hidden*` a disparu de l\'arbre', () => {
        const restants = readdirSync(path.join(racine, 'js')).filter(n => n.startsWith('.fuse_hidden'));
        expect(restants).toEqual([]);
    });

    // ⚠ TÉMOIN DE RÉFUTATION — M11 réclamait le retrait de `planificationCarte.etat`
    // « exposé sans consommateur ». Il en a trois, dans l'export du plan de cours.
    // Ce banc fige la réfutation : le prochain qui lira le rapport rougira ici
    // avant de casser l'export.
    it('RÉFUTATION M11 · `planificationCarte.etat` reste exposé — il a trois consommateurs', () => {
        expect(code('js/planification-carte.js')).toMatch(/\betat:\s*etat\b/);
        const exportPlan = code('js/planification-export.js');
        expect(exportPlan).toContain('c.etat');
        expect((exportPlan.match(/\bc\.etat\b/g) || []).length).toBeGreaterThanOrEqual(3);
    });
});

describe('#626 · le piège du §13 — aucun `/**` orphelin dans les fichiers touchés', () => {

    // Retirer une fonction sans emporter son bloc JSDoc laisse un `/**` qui
    // n'ouvre plus rien : il avale silencieusement le code suivant jusqu'au
    // prochain `*/`. `node --check` ne le voit pas ; l'exécution rend une
    // ReferenceError.
    it('chaque `/**` est refermé avant le suivant, et aucun n\'avale une déclaration', () => {
        const fautifs = [];
        for (const f of FICHIERS) {
            const lignes = src[f].split('\n');
            let ouvert = -1;
            for (let i = 0; i < lignes.length; i++) {
                const l = lignes[i];
                if (ouvert === -1) {
                    if (/^\s*\/\*\*/.test(l) && !/\*\//.test(l)) ouvert = i;
                } else {
                    if (/^\s*\/\*\*/.test(l)) { fautifs.push(`${f}:${ouvert + 1} — rouvert en ${i + 1} sans fermeture`); ouvert = i; continue; }
                    if (/^\s*(?:async\s+)?function\s|^\s*window\.[A-Za-z_$]|^\s*const\s|^\s*\}/.test(l)) {
                        fautifs.push(`${f}:${ouvert + 1} — avale la ligne ${i + 1} : ${l.trim().slice(0, 60)}`);
                        ouvert = -1;
                        continue;
                    }
                    if (/\*\//.test(l)) ouvert = -1;
                }
            }
            if (ouvert !== -1) fautifs.push(`${f}:${ouvert + 1} — jamais refermé`);
        }
        expect(fautifs).toEqual([]);
    });
});
