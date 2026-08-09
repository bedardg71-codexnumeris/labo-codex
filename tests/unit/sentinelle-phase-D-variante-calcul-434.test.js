import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE — #434 / Phase D : retrait du champ legacy `mat-variante-calcul`
// =======================================================================
//
// Bug 5 du plan (24 mai 2026) : « Comment construis-tu la note finale ? »
// dédoublait « Mode de sélection », avec un autre vocabulaire — les deux
// pouvaient diverger sans que rien ne le signale.
//
// ⚠ CE QUI REND CE RETRAIT DANGEREUX, et que ce fichier verrouille.
// Le plan qualifiait ce champ de « legacy » et prescrivait un « retrait pur ».
// La vérification au code a montré DEUX raisons de ne pas le retirer sèchement :
//
//   1. Son handler était le SEUL chemin qui révélait `mat-config-par-objectifs`.
//      Un retrait sec rendait le mode « Par objectifs » INATTEIGNABLE.
//   2. `varianteCalcul` n'est pas un champ d'UI : `pratique-pan-standards.js`
//      y route `calculerPerformance` vers le calcul par objectifs. C'est un
//      FLAG DE CALCUL, et une pratique déjà enregistrée le porte.
//
// D'où la forme retenue : une seule commande (le mode de sélection), dont
// `varianteCalcul` devient une PROJECTION ; plus une reprise à la lecture pour
// que les pratiques existantes rouvrent sur le bon panneau.
//
// ⮕ Le cas qui fait le plus mal si ça casse : une pratique « par objectifs »
// qui s'ouvre sur le panneau Portfolio. Rien ne plante — mais la première
// sauvegarde la reclasse en silence et sa configuration d'objectifs est perdue.

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

    it('son handler et son export ont disparu du JS', () => {
        // Zéro-dette : on ne laisse pas un handler orphelin « au cas où ».
        expect(sourceGestion).not.toMatch(/function changerVariantePANStandardsMat/);
        expect(sourceGestion).not.toMatch(/window\.changerVariantePANStandardsMat/);
    });

    it('plus aucun code ne LIT le champ disparu', () => {
        // Un `getValeurChamp('mat-variante-calcul')` survivant rendrait ''
        // en silence — et reclasserait toute pratique en « portfolio ».
        expect(sourceGestion).not.toMatch(/getValeurChamp\('mat-variante-calcul'\)/);
        expect(sourceGestion).not.toMatch(/setValeurChamp\('mat-variante-calcul'/);
    });

    it('le bloc de rafraîchissement V2, mort avec son DOM, est retiré', () => {
        // Ses six getElementById visaient des ids absents d'index.html :
        // du code qui ne pouvait ni agir ni échouer.
        for (const mort of ["getElementById('v2-variante-calcul')",
                            "getElementById('v2-portfolio-selection')",
                            "getElementById('v2-decoupler-pn')"]) {
            expect(sourceBiblio, mort).not.toContain(mort);
        }
    });
});

describe('#434 · « Par objectifs » reste atteignable', () => {
    it('le mode de sélection porte l’option', () => {
        expect(sourceIndex).toMatch(/<option value="par-objectifs">/);
    });

    it('et c’est bien le mode de sélection qui bascule les deux panneaux', () => {
        expect(sourceGestion).toMatch(/function appliquerModeSelectionMat/);
        expect(sourceGestion).toMatch(/if \(mode === 'par-objectifs'\)/);
        expect(sourceGestion).toContain("getElementById('mat-config-par-objectifs')");
        expect(sourceGestion).toContain('chargerConfigParObjectifsMat()');
    });

    it('la révélation lève AUSSI le `display:none` inline, pas seulement la classe', () => {
        // ⚠ Le défaut trouvé en faisant la Phase D : l'ancien handler ne faisait
        // que `classList.remove('u-hide')`. Or `#mat-config-par-objectifs` porte
        // un `style="display: none;"` INLINE, et n'a aucune classe. Retirer une
        // classe absente ne lève pas un style inline : le panneau ne pouvait
        // donc JAMAIS s'afficher dans le formulaire `mat-*`. Le champ legacy
        // n'était pas seulement un doublon — son unique fonction propre était
        // cassée, sans erreur ni trace.
        expect(sourceIndex).toMatch(/id="mat-config-par-objectifs" style="display: none;"/);
        const bloc = sourceGestion.slice(
            sourceGestion.indexOf('function appliquerModeSelectionMat'),
            sourceGestion.indexOf('function appliquerModeSelectionMat') + 1600
        );
        expect(bloc).toMatch(/configParObjectifs\.style\.display = ''/);
    });

    it('le handler du sélecteur applique le mode, il ne se contente pas de sauvegarder', () => {
        const bloc = sourceGestion.slice(
            sourceGestion.indexOf('function onPortfolioSelectionChangeMat'),
            sourceGestion.indexOf('function appliquerModeSelectionMat')
        );
        expect(bloc).toContain('appliquerModeSelectionMat(mode)');
    });
});

describe('#434 · les pratiques déjà enregistrées ne se perdent pas', () => {
    it('une pratique portant l’ancien flag rouvre en « par objectifs »', () => {
        // Sans cette reprise, elle s'ouvre sur le panneau Portfolio et la
        // première sauvegarde efface sa configuration d'objectifs.
        expect(sourceGestion).toMatch(
            /config\.varianteCalcul === 'par-objectifs' \|\| config\.parObjectifs/
        );
        expect(sourceGestion).toMatch(/modeSelection = 'par-objectifs'/);
    });

    it('le mode de sélection est posé même SANS bloc portfolio', () => {
        // Cas exact d'une pratique par objectifs : elle n'a pas de
        // `config.portfolio`. Si la pose restait sous ce garde, le sélecteur
        // resterait sur sa valeur par défaut.
        const avant = sourceGestion.indexOf("setValeurChamp('mat-portfolio-selection', modeSelection)");
        const garde = sourceGestion.indexOf('if (config.portfolio) {', sourceGestion.indexOf('typeCanon === \'standards\''));
        expect(avant).toBeGreaterThan(-1);
        expect(garde).toBeGreaterThan(-1);
        expect(avant, 'la pose doit précéder le garde `if (config.portfolio)`').toBeLessThan(garde);
    });
});

describe('#434 · la projection vers le flag de calcul est exacte', () => {
    it('le moteur lit toujours `varianteCalcul` — la projection lui est due', () => {
        // Si un jour cette assertion rougit parce que le moteur lit autre
        // chose, c'est G2-b qui aura eu lieu : alors la projection peut partir.
        expect(sourcePanStd).toMatch(/modalites\.varianteCalcul === 'par-objectifs'/);
        expect(sourceGestion).toMatch(/function varianteCalculDepuisMode/);
        expect(sourceGestion).toMatch(/varianteCalcul = varianteCalculDepuisMode\(modeSelection\)/);
    });

    it('chaque mode se projette sur la valeur historique attendue', () => {
        // Table extraite du source et évaluée : le test lit la vraie fonction,
        // il ne redécrit pas une table parallèle qui pourrait diverger.
        const debut = sourceGestion.indexOf('function varianteCalculDepuisMode');
        expect(debut).toBeGreaterThan(-1);
        const fin = sourceGestion.indexOf('\n}\n', debut);   // accolade fermante en colonne 0
        expect(fin).toBeGreaterThan(debut);
        const src = sourceGestion.slice(debut, fin + 2);
        // eslint-disable-next-line no-new-func
        const projeter = new Function(src + '; return varianteCalculDepuisMode;')();
        expect(projeter('par-objectifs')).toBe('par-objectifs');
        expect(projeter('hybride')).toBe('hybride');
        expect(projeter('meilleurs')).toBe('n-meilleurs');
        expect(projeter('derniers')).toBe('n-recents');
        expect(projeter('tous')).toBe('');
    });

    it('la branche « par objectifs » de la sauvegarde suit le sélecteur, plus le champ mort', () => {
        expect(sourceGestion).toMatch(/if \(modeSelection !== 'par-objectifs'\)/);
        expect(sourceGestion).toMatch(/if \(modeSelection === 'par-objectifs'\)/);
    });
});
