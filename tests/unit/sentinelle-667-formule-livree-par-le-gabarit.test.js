/**
 * #667 · LA FORMULE APPARTIENT AU GABARIT, PAS AU CODE
 *
 * Ce que cette sentinelle verrouille, dans l'ordre où ça peut se perdre :
 *
 *   A. Le calcul d'avant #667 est reproduit AU CENTIÈME pour un critère qui
 *      n'a ni modèle ni paramètres — c'est-à-dire toutes les grilles déjà
 *      enregistrées. Une migration de formule qui décale les notes déjà
 *      données est une perte de données, pas une amélioration.
 *   B. Le texte affiché DÉRIVE du calcul. C'est l'invariant central : avant
 *      #667 le texte était une chaîne littérale, libre de décrire une formule
 *      que le code n'appliquait pas.
 *   C. Le paramètre saisi dans le gabarit est bien celui qui note.
 *   D. Plus aucun site ne réécrit la formule à la main.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

// Le registre est un module pur : require direct, sans faux DOM.
const F = require(path.join(racine, 'js/evaluation-formules.js'));

/** Retire commentaires de bloc et de ligne — sans quoi un commentaire QUI PARLE
 *  de la formule ferait échouer une assertion qui cherche la formule ÉCRITE. */
function sansCommentaires(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

describe('#667 · A — le calcul historique est reproduit à l\'identique', () => {
    // Cas réel, relevé à l'écran le 31 août 2026 : 59 erreurs, 460 mots,
    // pondération 100, facteur 500 → 35,87/100 (35,9 %).
    const critereAncien = { type: 'algorithmique', facteurNormalisation: 500 };

    it('un critère d\'AVANT #667 (aucun modeleFormule) donne la même note qu\'avant', () => {
        const r = F.calculer(critereAncien, { ponderation: 100, erreurs: 59, mots: 460 });
        expect(r.applicable).toBe(true);
        expect(r.note.toFixed(2)).toBe('35.87');
        expect(r.pctBorne.toFixed(1)).toBe('35.9');
    });

    // ⚠ CE TEST EXISTE PARCE QU'UNE MUTATION N'ÉTAIT TUÉE PAR PERSONNE.
    // Tous les cas ci-dessus portaient un facteur de 500 — qui est AUSSI le
    // défaut déclaré du modèle. Une migration à la lecture qui ignorerait
    // complètement `critere.facteurNormalisation` passait donc au vert : les
    // grilles réelles réglées à 300 ou 750 auraient été relues à 500, et
    // toutes leurs notes déplacées, sans qu'un seul test bronche.
    it('le facteur NON DÉFAUT d\'une grille existante est bien celui qui note', () => {
        const grilleReelle = { type: 'algorithmique', facteurNormalisation: 300 };
        expect(F.normaliser(grilleReelle).params.facteurNormalisation).toBe(300);
        // 100 − (59 ÷ 460 × 300) = 61,52 — et surtout PAS 35,87 (facteur 500).
        const r = F.calculer(grilleReelle, { ponderation: 100, erreurs: 59, mots: 460 });
        expect(r.note.toFixed(2)).toBe('61.52');
        expect(F.libelleSymbolique(grilleReelle)).toContain('300');
    });

    it('un critère SANS facteur du tout retombe sur 500, comme le faisait `|| 500`', () => {
        const r = F.calculer({ type: 'algorithmique' }, { ponderation: 100, erreurs: 59, mots: 460 });
        expect(r.note.toFixed(2)).toBe('35.87');
    });

    it('le repli est SIGNALÉ (`herite`), il ne se fait pas en douce', () => {
        expect(F.normaliser(critereAncien).herite).toBe(true);
        expect(F.normaliser({ modeleFormule: 'penalite_normalisee' }).herite).toBe(false);
    });

    it('un modèle INCONNU (grille venue d\'une version plus récente) ne casse pas le calcul', () => {
        const r = F.calculer({ modeleFormule: 'formule_du_futur', facteurNormalisation: 500 },
                             { ponderation: 100, erreurs: 59, mots: 460 });
        expect(r.note.toFixed(2)).toBe('35.87');
        expect(F.normaliser({ modeleFormule: 'formule_du_futur' }).herite).toBe(true);
    });

    it('le bornage [0, 100] tient des deux côtés', () => {
        expect(F.calculer(critereAncien, { ponderation: 100, erreurs: 500, mots: 460 }).pctBorne).toBe(0);
        expect(F.calculer(critereAncien, { ponderation: 100, erreurs: 0, mots: 460 }).pctBorne).toBe(100);
    });

    it('sans mots, le code DIT qu\'il ne peut pas conclure — il n\'invente pas de note', () => {
        const r = F.calculer(critereAncien, { ponderation: 100, erreurs: 59, mots: 0 });
        expect(r.applicable).toBe(false);
        expect(r.raison).toBe('mots-absents');
        expect(r.note).toBeUndefined();
        expect(F.libelleChiffre(critereAncien, { ponderation: 100, erreurs: 59, mots: 0 })).toBe('');
    });
});

describe('#667 · B — le texte affiché dérive du calcul', () => {
    it('le libellé chiffré se termine sur la note RÉELLEMENT calculée', () => {
        const critere = { modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 } };
        const donnees = { ponderation: 100, erreurs: 59, mots: 460 };
        const note = F.calculer(critere, donnees).note;
        expect(F.libelleChiffre(critere, donnees)).toContain(note.toFixed(2).replace(".", ","));
    });

    // LE test de la régression que #667 corrige : changer le paramètre doit
    // déplacer le texte ET la note ENSEMBLE. Quand le texte était une chaîne
    // littérale, seule la note bougeait.
    it('changer le paramètre déplace le texte ET la note ensemble', () => {
        const donnees = { ponderation: 100, erreurs: 59, mots: 460 };
        const a = { modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 } };
        const b = { modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 250 } };

        const noteA = F.calculer(a, donnees).note;
        const noteB = F.calculer(b, donnees).note;
        expect(noteA).not.toBeCloseTo(noteB, 2);

        expect(F.libelleSymbolique(a)).toContain('500');
        expect(F.libelleSymbolique(b)).toContain('250');
        expect(F.libelleSymbolique(b)).not.toContain('500');
        expect(F.libelleChiffre(a, donnees)).toContain(noteA.toFixed(2).replace(".", ","));
        expect(F.libelleChiffre(b, donnees)).toContain(noteB.toFixed(2).replace(".", ","));
    });

    it('chaque modèle offert sait se calculer ET se dire', () => {
        const donnees = { ponderation: 100, erreurs: 10, mots: 500 };
        const modeles = F.listerModeles();
        expect(modeles.length).toBeGreaterThanOrEqual(3);
        modeles.forEach((m) => {
            const critere = F.appliquerAuCritere({ type: 'algorithmique' }, m.id, null);
            const r = F.calculer(critere, donnees);
            expect(r.applicable, m.id).toBe(true);
            expect(Number.isFinite(r.note), m.id).toBe(true);
            expect(F.libelleSymbolique(critere).length, m.id).toBeGreaterThan(0);
            expect(F.libelleChiffre(critere, donnees), m.id).toContain(r.note.toFixed(2).replace(".", ","));
        });
    });

    it('un modèle qui n\'utilise pas les mots se calcule SANS mots', () => {
        const critere = F.appliquerAuCritere({ type: 'algorithmique' }, 'penalite_par_erreur', { pointsParErreur: 2 });
        const r = F.calculer(critere, { ponderation: 100, erreurs: 7, mots: 0 });
        expect(r.applicable).toBe(true);
        expect(r.note).toBe(86);
    });
});

describe('#667 · C — ce que le gabarit écrit est ce qui note', () => {
    it('le paramètre saisi est celui qui sert au calcul', () => {
        const critere = F.appliquerAuCritere({ type: 'algorithmique' }, 'penalite_normalisee', { facteurNormalisation: 300 });
        expect(critere.paramsFormule.facteurNormalisation).toBe(300);
        // 100 − (59 ÷ 460 × 300) = 61,52
        expect(F.calculer(critere, { ponderation: 100, erreurs: 59, mots: 460 }).note.toFixed(2)).toBe('61.52');
    });

    it('une valeur hors bornes est ramenée dans les bornes, pas acceptée telle quelle', () => {
        expect(F.appliquerAuCritere({}, 'penalite_normalisee', { facteurNormalisation: -50 })
            .paramsFormule.facteurNormalisation).toBe(1);
        expect(F.appliquerAuCritere({}, 'penalite_normalisee', { facteurNormalisation: 'abc' })
            .paramsFormule.facteurNormalisation).toBe(500);
    });

    it('changer de modèle EMPORTE le miroir `facteurNormalisation`', () => {
        // Sans ce retrait, une grille passée à un autre modèle garderait un
        // facteur périmé que la migration à la lecture relirait comme la vérité.
        const critere = F.appliquerAuCritere({ type: 'algorithmique' }, 'penalite_normalisee', { facteurNormalisation: 400 });
        expect(critere.facteurNormalisation).toBe(400);
        F.appliquerAuCritere(critere, 'penalite_par_erreur', { pointsParErreur: 2 });
        expect(critere.facteurNormalisation).toBeUndefined();
        expect(critere.paramsFormule.facteurNormalisation).toBeUndefined();
    });

    it('le miroir suit le paramètre pour le modèle historique', () => {
        const critere = F.appliquerAuCritere({}, 'penalite_normalisee', { facteurNormalisation: 750 });
        expect(critere.facteurNormalisation).toBe(750);
        expect(critere.paramsFormule.facteurNormalisation).toBe(750);
    });
});

describe('#667 · D — plus aucun site ne réécrit la formule à la main', () => {
    const SITES_DE_CALCUL = [
        'js/evaluation-calcul.js',
        'js/evaluation-retroaction.js',
        'js/grilles.js'
    ];

    it('aucune expression `/ mots * facteur` ne subsiste hors du registre', () => {
        SITES_DE_CALCUL.forEach((f) => {
            const code = sansCommentaires(lire(f));
            expect(code, f).not.toMatch(/\/\s*mots\s*\*\s*facteur/);
            expect(code, f).not.toMatch(/motsEstime\s*\*\s*facteur/);
        });
    });

    it('le texte « Note = Pondération − (Erreurs » n\'est plus écrit en dur dans le gabarit', () => {
        const code = sansCommentaires(lire('js/grilles.js'));
        expect(code).not.toContain('Note = Pondération − (Erreurs');
    });

    it('les deux écrans de grille passent par le MÊME rendu', () => {
        const code = lire('js/grilles.js');
        // `${...}` : on compte les APPELS dans les gabarits, pas la déclaration.
        // Lot 4 (4 sept. 2026) : les deux écrans appellent `rendreCartesGabaritAlgo`, qui
        // seul rend le bloc (dans sa carte « Formule ») — un rendu, deux contextes, toujours.
        expect((code.match(/\$\{rendreCartesGabaritAlgo\(critere,/g) || []).length).toBe(2);
        expect((code.match(/(?<!function )rendreBlocFormuleAlgo\(critere, ctx\)/g) || []).length).toBe(1);   // l'appel, pas la déclaration
    });

    it('les trois blocs résultat du module Évaluer portent la ligne de formule', () => {
        const code = lire('js/evaluation-chargement.js');
        expect((code.match(/id="formule_algo_\$\{critere\.id\}"/g) || []).length).toBe(3);
    });

    it('les quatre handlers du gabarit sont exportés (sinon le bloc ne réagit à rien)', () => {
        const code = lire('js/grilles.js');
        ['modifierModeleFormuleTempHandler', 'modifierParamFormuleTempHandler',
         'modifierModeleFormuleGrilleHandler', 'modifierParamFormuleGrilleHandler'
        ].forEach((h) => {
            expect(code, h).toContain('window.' + h + ' = ' + h + ';');
        });
    });

    it('le registre est chargé AVANT ses deux consommateurs dans index.html', () => {
        const html = lire('index.html');
        const posRegistre = html.indexOf('js/evaluation-formules.js');
        expect(posRegistre).toBeGreaterThan(-1);
        expect(posRegistre).toBeLessThan(html.indexOf('js/grilles.js?'));
        expect(posRegistre).toBeLessThan(html.indexOf('js/evaluation-calcul.js?'));
    });

    it('le modèle et ses paramètres traversent les DEUX schémas de transport', () => {
        expect(lire('js/import-export.js')).toContain('modeleFormule');
        expect(lire('js/partage-schemas.js')).toContain('modeleFormule');
        // paramsFormule doit être un schéma FERMÉ des deux côtés : `type:
        // 'object'` nu recopierait un objet arbitraire venu d'un fichier.
        expect(lire('js/import-export.js')).not.toMatch(/paramsFormule:\s*\{\s*type:\s*'object'\s*\}/);
    });
});
