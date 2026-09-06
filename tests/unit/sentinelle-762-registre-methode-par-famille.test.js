import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #762 (volet registre) — UNE PRATIQUE QUI NE DÉCLARE PAS SA MÉTHODE DE CALCUL EST LUE
// SELON SA FAMILLE, PAS COMME UNE PAN-STANDARDS.
//
// Console de Grégoire, 6 septembre 2026, 7 h 34 (BUG_grégoire_2026-09-06_07-48-42) :
// « Erreur lors du chargement de la pratique configurable "pratique_1788364991518_1_…" : Champ
// obligatoire manquant : echelle ». Ses données : cette pratique est le « Modèle sommatif »
// adopté le 2 septembre — `type: 'sommative'`, sans `echelleId`, et (comme le gabarit qu'elle
// clone) sans `calcul_note`. `construireConfigComplete` (pratique-registre.js) défautait alors la
// méthode à `conversion_niveaux`, celle des PAN-Standards, qui exige une échelle : le registre
// refusait une pratique sommative pour une échelle qu'une sommative n'utilise pas. Partout où le
// registre résout (comparateur, activation, calculs), elle était « introuvable ».
//
// ⮕ Sans `calcul_note`, la méthode se déduit de la famille canonique : sommative →
// moyenne_ponderee, specifications → specifications, denotation → jugement_global, standards →
// conversion_niveaux (l'ancien défaut, gardé pour la seule famille qui le mérite). Aucune écriture
// de données : c'est une lecture, elle vaut pour le stock déjà adopté.
// Modules RÉELS : pratique-configurable.js et pratique-registre.js.

function bac(pratiques) {
    const win = { PratiqueManager: {} };   // la branche « configurable » du registre exige sa présence
    const globaux = {
        db: { getSync: (k, d) => (String(k).indexOf('pratiquesConfigurables') !== -1 ? JSON.parse(JSON.stringify(pratiques)) : (d !== undefined ? d : null)),
            get: async () => null, set: async () => {}, setSync() {} },
        cle: (k) => 'test_' + k
    };
    chargerScript('js/pratiques/pratique-configurable.js', globaux, win);
    chargerScript('js/pratiques/pratique-registre.js', Object.assign({ PratiqueConfigurable: win.PratiqueConfigurable }, globaux), win);
    return win;
}

// La forme exacte du « Modèle sommatif » adopté : le gabarit `SOM-simple` cloné par le wizard
// (id neuf, nom, auteur, dansBibliotheque) — `type`, `configuration.methodeCalcul`, pas de
// `calcul_note`, pas d'échelle.
const MODELE_SOMMATIF_ADOPTE = {
    id: 'pratique_1788364991518_1_f79a585f3c32', nom: 'Modèle sommatif', type: 'sommative',
    auteur: 'Grégoire Bédard', pratiques: ['SOM'], dansBibliotheque: true,
    configuration: { methodeCalcul: 'moyenne-ponderee', parts: [] }
};
const SPE_SANS_METHODE = { id: 'p_spe', nom: 'SPE adoptée', type: 'specifications', configuration: { seuilAcceptabilite: 100 } };
const DEN_SANS_METHODE = { id: 'p_den', nom: 'DEN adoptée', type: 'denotation', configuration: {} };
const STD_SANS_ECHELLE = { id: 'p_std', nom: 'STD sans échelle', type: 'standards', configuration: { portfolio: { nombreARetenir: 4 } } };
const STD_LEGACY_SANS_ECHELLE = { id: 'p_std_legacy', nom: 'STD legacy', type: 'pan-standards', configuration: {} };

describe('#762 · le registre lit une pratique sans calcul_note selon sa famille', () => {

    it('le « Modèle sommatif » adopté (les données de Grégoire) se charge, méthode moyenne_ponderee, sans exiger d\'échelle', () => {
        const erreurs = vi.spyOn(console, 'error').mockImplementation(() => {});
        const win = bac([MODELE_SOMMATIF_ADOPTE]);
        const instance = win.obtenirPratiqueParId(MODELE_SOMMATIF_ADOPTE.id);
        expect(instance, 'avant : null, et « Champ obligatoire manquant : echelle » en console').not.toBeNull();
        expect(instance.config.calcul_note.methode).toBe('moyenne_ponderee');
        expect(erreurs).not.toHaveBeenCalled();
        erreurs.mockRestore();
    });

    it('une SPE et une DEN sans calcul_note se chargent selon leur famille', () => {
        const win = bac([SPE_SANS_METHODE, DEN_SANS_METHODE]);
        expect(win.obtenirPratiqueParId('p_spe').config.calcul_note.methode).toBe('specifications');
        expect(win.obtenirPratiqueParId('p_den').config.calcul_note.methode).toBe('jugement_global');
    });

    it('une PAN-Standards sans échelle reste REFUSÉE (l\'échelle est ce qui convertit ses niveaux), type canonique ou legacy', () => {
        const erreurs = vi.spyOn(console, 'error').mockImplementation(() => {});
        const win = bac([STD_SANS_ECHELLE, STD_LEGACY_SANS_ECHELLE]);
        expect(win.obtenirPratiqueParId('p_std')).toBeNull();
        expect(win.obtenirPratiqueParId('p_std_legacy')).toBeNull();
        expect(erreurs).toHaveBeenCalledTimes(2);
        erreurs.mockRestore();
    });

    it('une pratique qui DÉCLARE sa méthode la garde (non-régression)', () => {
        const win = bac([Object.assign({}, MODELE_SOMMATIF_ADOPTE, { id: 'p_decl', calcul_note: { methode: 'moyenne_ponderee' } })]);
        expect(win.obtenirPratiqueParId('p_decl').config.calcul_note.methode).toBe('moyenne_ponderee');
    });
});
