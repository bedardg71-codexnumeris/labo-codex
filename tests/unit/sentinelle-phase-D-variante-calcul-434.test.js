import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — #434 Phase D (sélecteur unique) · #435 ablation par-objectifs
// =======================================================================
//
// Deux décisions successives, un seul verrou :
//
// #434 (9 août, matin) — Phase D du plan note finale : le champ legacy
// « Comment construis-tu la note finale ? » (`mat-variante-calcul`) dédoublait
// « Mode de sélection » et les deux pouvaient diverger. Le mode de sélection
// devient l'UNIQUE commande ; `varianteCalcul` en est une projection.
//
// #435 (9 août, après vérification demandée par Grégoire) — la Phase D avait
// rendu atteignable le mode « par-objectifs »… dont la famille avait été
// CONDAMNÉE le 5 août (#396, décision D2 : retirer les chemins par objectifs
// jamais fonctionnels). Vérifié : ce moteur-ci portait le même défaut de
// naissance — appariement production→objectif par un `objectifId` qu'AUCUN
// code n'écrit, ou par égalité stricte texte-libre ↔ nom. Et son panneau ne
// s'était jamais affiché (style inline jamais levé). Décision Grégoire du
// 9 août : étendre le retrait de #396. Sont partis : le routage et les quatre
// modes du moteur STD, le panneau `mat-config-par-objectifs`, les dix
// fonctions d'édition, les quatre gabarits du catalogue (zéro objectif défini
// chacun — jamais calculables), et les projections `parObjectifs`.
//
// SURVIVENT, et c'est le piège du prochain nettoyage : `_calculerNiveauxParObjectif`
// et `suggererNoteHolistique` — la suggestion holistique DEN s'en sert
// (denotation-saisie-ui.js). Leur survie est verrouillée par
// denotation-moteur-DEN1.test.js ; leur cliquet d'absence inverse est ici.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

const sourceIndex = lire('index.html');
const sourceGestion = lire('js', 'pratiques-gestion.js');
const sourceBiblio = lire('js', 'pratiques-bibliotheque.js');
const sourcePanStd = lire('js', 'pratiques', 'pratique-pan-standards.js');

describe('#434 · le champ legacy est parti, sans reste', () => {
    it('le bloc et son sélecteur ont disparu du DOM', () => {
        expect(sourceIndex).not.toContain('id="mat-variante-pan-standards"');
        expect(sourceIndex).not.toContain('id="mat-variante-calcul"');
        expect(sourceIndex).not.toContain('id="mat-variante-description"');
    });

    it('son handler et tout lecteur du champ ont disparu du JS', () => {
        expect(sourceGestion).not.toMatch(/function changerVariantePANStandardsMat/);
        expect(sourceGestion).not.toMatch(/getValeurChamp\('mat-variante-calcul'\)/);
        expect(sourceGestion).not.toMatch(/setValeurChamp\('mat-variante-calcul'/);
    });

    it('le bloc de rafraîchissement V2, mort avec son DOM, est retiré', () => {
        for (const mort of ["getElementById('v2-variante-calcul')",
                            "getElementById('v2-portfolio-selection')",
                            "getElementById('v2-decoupler-pn')"]) {
            expect(sourceBiblio, mort).not.toContain(mort);
        }
    });

    it('le mode de sélection est posé même SANS bloc portfolio', () => {
        // Une pratique sans `config.portfolio` doit quand même voir son
        // sélecteur posé — sinon il reste sur la valeur par défaut.
        const avant = sourceGestion.indexOf("setValeurChamp('mat-portfolio-selection', modeSelection)");
        const garde = sourceGestion.indexOf('if (config.portfolio) {', sourceGestion.indexOf("typeCanon === 'standards'"));
        expect(avant).toBeGreaterThan(-1);
        expect(garde).toBeGreaterThan(-1);
        expect(avant, 'la pose doit précéder le garde `if (config.portfolio)`').toBeLessThan(garde);
    });

    // #900 (lot N6, 23 sept. 2026) — la projection `varianteCalculDepuisMode` est RETIRÉE avec le champ qu'elle
    // écrivait : depuis #435, le moteur ne lit plus `varianteCalcul`. Le mode de sélection reste l'unique commande.
    it('la projection vers `varianteCalcul` est partie avec son champ (#900)', () => {
        expect(sourceGestion).not.toContain('function varianteCalculDepuisMode');
        expect(sourceGestion).not.toMatch(/configuration\.varianteCalcul\s*=/);
    });
});

describe('#435 · cliquet d’absence — le chemin par-objectifs ne revient pas', () => {
    it('le moteur STD ne route plus et n’a plus les quatre modes', () => {
        expect(sourcePanStd).not.toMatch(/varianteCalcul === 'par-objectifs'[\s\S]{0,120}_calculerPerformanceParObjectifs/);
        for (const morte of ['_calculerPerformanceParObjectifs(da)', '_calculerModeComptage(da',
                             '_calculerModeMoyennePonderee(da', '_calculerModeSeuilsCritiques(da',
                             '_calculerModeHolistique(da', '_convertirNoteEnNiveau(note)']) {
            expect(sourcePanStd, morte).not.toContain(morte);
        }
    });

    it('les DEUX dépendances DEN survivent à l’ablation', () => {
        // Le piège du prochain nettoyage : ces helpers ont l'air morts avec le
        // moteur parti — ils ne le sont pas, denotation-saisie-ui.js les appelle.
        expect(sourcePanStd).toMatch(/_calculerNiveauxParObjectif\(da, objectifs\)/);
        expect(sourcePanStd).toMatch(/function suggererNoteHolistique/);
        expect(sourcePanStd).toMatch(/window\.suggererNoteHolistique = suggererNoteHolistique/);
    });

    it('le panneau et l’option ont disparu du DOM', () => {
        expect(sourceIndex).not.toContain('id="mat-config-par-objectifs"');
        expect(sourceIndex).not.toMatch(/<option value="par-objectifs">/);
    });

    it('les dix fonctions d’édition et leurs exports sont partis', () => {
        for (const morte of ['function chargerConfigParObjectifsMat', 'function changerModeCalculObjectifsMat',
                             'function ajouterObjectifMat', 'function supprimerObjectifMat',
                             'function genererGrilleConversionMat', 'window.ajouterObjectifMat',
                             'window.chargerConfigParObjectifsMat']) {
            expect(sourceGestion, morte).not.toContain(morte);
        }
    });

    it('la sauvegarde n’a plus de branche par-objectifs, et le portfolio est TOUJOURS écrit', () => {
        expect(sourceGestion).not.toMatch(/modeSelection [!=]== 'par-objectifs'\) \{/);
        // Le garde retiré : l'écriture du bloc portfolio n'est plus conditionnelle.
        expect(sourceGestion).toMatch(/le portfolio est LA configuration STD, toujours écrite/);
    });

    it('les quatre gabarits jamais calculables ont quitté le catalogue', () => {
        for (const gid of ['STD-par-objectifs-pondere', 'STD-chimie-organique',
                           'STD-info-interfaces-bd', 'STD-anatomie']) {
            expect(sourceBiblio, gid).not.toContain("'" + gid + "'");
        }
    });

    it('plus aucune projection `parObjectifs` vers ou depuis les modalités', () => {
        expect(sourceBiblio).not.toMatch(/modalites\.parObjectifs = JSON\.parse/);
        expect(sourceBiblio).not.toMatch(/parObjectifs: modalites\.parObjectifs/);
    });

    it('la liste des pratiques n’affiche plus de badge « par objectifs »', () => {
        // ⚠ Le cas qui échappe le plus facilement à une ablation : les pratiques
        // STOCKÉES portent encore `varianteCalcul: 'par-objectifs'`. Un badge qui
        // le lit continue d'annoncer un mode retiré — et, pire, son test inverse
        // masquait le badge portfolio de ces mêmes pratiques, le seul vrai.
        expect(sourceGestion).not.toMatch(/caracteristiques\.push\('par objectifs'\)/);
        expect(sourceGestion).not.toMatch(/pratique\.configuration\.varianteCalcul !== 'par-objectifs'/);
    });
});

describe('#435 · les pratiques legacy sont normalisées, jamais réécrites en douce', () => {
    it('une pratique stockée en par-objectifs est SIGNALÉE et affichée sur son mode réel', () => {
        // Même patron que la normalisation de pan_par_objectif (#396) :
        // avertissement console, lecture seule, aucune écriture spontanée.
        const bloc = sourceGestion.slice(
            sourceGestion.indexOf("config.varianteCalcul === 'par-objectifs' || config.parObjectifs"),
            sourceGestion.indexOf("config.varianteCalcul === 'par-objectifs' || config.parObjectifs") + 600
        );
        expect(bloc).toContain('console.warn');
        // Et surtout : plus AUCUNE bascule du sélecteur vers le mode retiré.
        expect(sourceGestion).not.toMatch(/modeSelection = 'par-objectifs'/);
    });
});
