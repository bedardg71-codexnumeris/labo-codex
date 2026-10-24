import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #486 (24 août 2026) — UN GABARIT DE PRODUCTION S'ENREGISTRE SANS
// DATE D'ÉCHÉANCE.
//
// Le fil : Grégoire prépare TOUTES ses productions avant de les transmettre à
// ses groupes. Or poser l'échéance EST l'acte de transmission. Depuis Beta 94,
// la sauvegarde exigeait la date — donc exigeait d'avoir déjà distribué le
// travail pour avoir le droit de le préparer. Sa planification était bloquée
// sur un `alert()`.
//
// La garde contredisait aussi l'écran qu'elle gardait : sous « Échéances par
// groupe », l'interface annonce depuis Beta 98.3 que « Décoché = les
// étudiant·es n'ont pas encore reçu le travail ». Cet état, déclaré légitime
// par l'interface, était refusé par la sauvegarde.
//
// Ce que cette sentinelle tient :
//   S1 — `aucuneEcheanceAssignee` lit correctement les deux modes (legacy et
//        multi-groupe), y compris le cas qui porte tout le sens : une date
//        saisie sur un groupe DÉCOCHÉ n'est pas une échéance assignée.
//   S2 — LE POINT DÉCISIF : le badge ne peut pas mentir. Chaque fois que
//        `aucuneEcheanceAssignee` rend true, AUCUN groupe ne doit obtenir
//        d'échéance due via `obtenirEcheanceEffective` — le résolveur dont
//        dépendent le calendrier, les indices C et P, les jetons et l'export.
//        Sans cet accord, un gabarit marqué « à planifier » pourrait apparaître
//        au calendrier, ou l'inverse.
//   S3 — `validerChampsObligatoiresProduction` ne bloque PLUS sur la date, et
//        bloque TOUJOURS sur titre / type / pondération.
//   S4 — le menu de la sélection pose réellement « (à planifier) » (#1147 : c'était un badge de la barre latérale)
//        sur les gabarits sans échéance, et le refuse au portfolio conteneur
//        (dispensé de date par construction : seuls ses artefacts en ont une).

/* ------------------------------------------------------------------ harnais */

// ↻ Lot E3 (D0 point 2, 28 sept. 2026) : un refus ne passe plus par `alert` mais par le
// témoin commun (« Non enregistré – Créer la production : ‹raison› »). `alertes` recueille
// désormais l'une ET l'autre voie : le compte de ces essais garde son sens (un refus, dit
// une fois ; aucun refus, rien de dit).
function chargerProductions(alertes = []) {
    const win = { temoinEnregistrement: { nonEnregistre: (raison, geste) => alertes.push(String(geste) + ' : ' + String(raison)) } };
    return chargerScript('js/productions.js', {
        db: {
            get: async () => null,
            getSync: (_k, d) => (d !== undefined ? d : null),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'h2026_' + k,
        obtenirCoursActifId: () => null,
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: (msg) => alertes.push(String(msg)),
        document: {
            getElementById: () => null, querySelector: () => null,
            querySelectorAll: () => [], addEventListener() {}
        },
        echapperHtml: (t) => String(t == null ? '' : t)
    }, win);
}

// Formulaire complet et valide : chaque test n'en retire QUE ce qu'il éprouve.
const FORMULAIRE = (extra = {}) => ({
    titre: 'Description de personnage', activiteApprentissage: 'Écriture',
    type: 'travail', ponderation: 20, objectif: '', tache: '', detailTache: '',
    grilleId: '', echelleId: '', cartoucheId: '',
    dateEcheance: '2026-11-15', echeancesParGroupe: null, ...extra
});

/**
 * Rend la sélection des productions (#1147 : un menu déroulant, plus une barre latérale) et retourne
 * le HTML injecté dans son emplacement.
 *
 * `aucuneEcheanceAssignee` est injectée explicitement comme globale. Dans le
 * navigateur, productions-liste.js la résout par la chaîne de portées jusqu'à
 * `window` (productions.js l'y expose) ; dans le sandbox `new Function`, seuls
 * les paramètres nommés existent. On rebranche donc la VRAIE fonction — pas un
 * double — pour que ce test éprouve la logique livrée et non une imitation.
 */
async function rendreListe(productions, fnAucuneEcheance) {
    const conteneur = { innerHTML: '' };
    const win = chargerScript('js/productions-liste.js', {
        db: { get: async (c) => (String(c).endsWith('productions') ? productions : []),
              getSync: (_k, d) => (d !== undefined ? d : null),
              set: async () => {}, setSync: () => {} },
        cle: (k) => 'h2026_' + k,
        aucuneEcheanceAssignee: fnAucuneEcheance,
        productionEnEdition: null,   // #1147 : le menu lit la fiche ouverte (config.js)
        BibliothequeUI: { filtrerParModeDemo: (arr) => arr },
        GabaritsUtils: { genererBadgesPratiques: () => '' },
        echapperHtml: (t) => String(t == null ? '' : t),
        document: {
            getElementById: (id) => (id === 'selectionProductions' ? conteneur : null),
            querySelector: () => null, querySelectorAll: () => [], addEventListener() {}
        }
    });
    await win.afficherListeProductions();
    return conteneur.innerHTML;
}

/* -------------------------------------------- S1 · lecture des deux modes */

describe('#486 · S1 — aucuneEcheanceAssignee lit les deux modes', () => {
    it('mode legacy : sans date ⇒ à planifier ; avec date ⇒ non', () => {
        const win = chargerProductions();
        expect(win.aucuneEcheanceAssignee({ dateEcheance: null })).toBe(true);
        expect(win.aucuneEcheanceAssignee({ dateEcheance: '' })).toBe(true);
        expect(win.aucuneEcheanceAssignee({})).toBe(true);
        expect(win.aucuneEcheanceAssignee({ dateEcheance: '2026-11-15' })).toBe(false);
    });

    it('mode multi-groupe : au moins un groupe assigné avec date ⇒ non', () => {
        const win = chargerProductions();
        expect(win.aucuneEcheanceAssignee({
            echeancesParGroupe: {
                gc_1: { assignee: true, date: '2026-11-15' },
                gc_2: { assignee: false, date: null }
            }
        })).toBe(false);
    });

    it('LE CAS QUI PORTE LE SENS : date saisie mais groupe DÉCOCHÉ ⇒ à planifier', () => {
        // « Décoché = les étudiant·es n'ont pas encore reçu le travail ».
        // La date est préparée, elle n'est pas transmise : rien n'est dû.
        const win = chargerProductions();
        expect(win.aucuneEcheanceAssignee({
            echeancesParGroupe: {
                gc_1: { assignee: false, date: '2026-11-15' },
                gc_2: { assignee: false, date: '2026-11-20' }
            }
        })).toBe(true);
    });

    it('groupe assigné SANS date ⇒ à planifier', () => {
        const win = chargerProductions();
        expect(win.aucuneEcheanceAssignee({
            echeancesParGroupe: { gc_1: { assignee: true, date: null } }
        })).toBe(true);
    });

    it('entrée muette sur `assignee` ⇒ assignée (accord avec obtenirEcheanceEffective)', () => {
        const win = chargerProductions();
        expect(win.aucuneEcheanceAssignee({
            echeancesParGroupe: { gc_1: { date: '2026-11-15' } }
        })).toBe(false);
    });

    it('absence de production : pas de badge (et pas de plantage)', () => {
        const win = chargerProductions();
        expect(win.aucuneEcheanceAssignee(null)).toBe(false);
        expect(win.aucuneEcheanceAssignee(undefined)).toBe(false);
    });
});

/* ---------------------- S2 · le badge ne peut pas contredire le calendrier */

describe('#486 · S2 — accord strict avec obtenirEcheanceEffective', () => {
    // Le résolveur `obtenirEcheanceEffective` est ce que lisent le calendrier,
    // les indices C et P, les jetons, la synthèse et l'export PDF. Si le badge
    // et lui divergent, l'interface ment quelque part. On l'éprouve sur un
    // échantillon qui couvre les deux modes ET les combinaisons mixtes.
    const CAS = [
        { nom: 'legacy vide',            prod: { dateEcheance: null } },
        { nom: 'legacy daté',            prod: { dateEcheance: '2026-11-15' } },
        { nom: 'un groupe assigné daté', prod: { echeancesParGroupe: { gc_1: { assignee: true, date: '2026-11-15' } } } },
        { nom: 'tous décochés, datés',   prod: { echeancesParGroupe: { gc_1: { assignee: false, date: '2026-11-15' },
                                                                      gc_2: { assignee: false, date: '2026-11-20' } } } },
        { nom: 'assignés sans date',     prod: { echeancesParGroupe: { gc_1: { assignee: true, date: null },
                                                                      gc_2: { assignee: true, date: '' } } } },
        { nom: 'mixte',                  prod: { echeancesParGroupe: { gc_1: { assignee: false, date: '2026-11-15' },
                                                                      gc_2: { assignee: true, date: '2026-12-01' } } } },
        { nom: 'entrée muette datée',    prod: { echeancesParGroupe: { gc_1: { date: '2026-11-15' } } } }
    ];
    const GROUPES = ['gc_1', 'gc_2'];

    for (const cas of CAS) {
        it(`${cas.nom} — « à planifier » ⇔ aucun groupe n'a d'échéance due`, () => {
            const win = chargerProductions();
            const aPlanifier = win.aucuneEcheanceAssignee(cas.prod);

            const groupesDus = GROUPES.filter(gc => {
                const r = win.obtenirEcheanceEffective(cas.prod, gc);
                return r.assignee && !!r.date;
            });

            // Équivalence dans LES DEUX SENS : ni badge sur une production due,
            // ni production due laissée sans badge.
            expect(aPlanifier).toBe(groupesDus.length === 0);
        });
    }
});

/* ------------------------------------------- S3 · la garde de sauvegarde */

describe('#486 · S3 — la date ne bloque plus, le reste bloque toujours', () => {
    it('LE CŒUR DU CHANGEMENT : sans date, la sauvegarde passe, sans alerte', () => {
        const alertes = [];
        const win = chargerProductions(alertes);
        expect(win.validerChampsObligatoiresProduction(FORMULAIRE({ dateEcheance: null }))).toBe(true);
        expect(alertes).toEqual([]);
    });

    it('multi-groupe entièrement décoché : la sauvegarde passe', () => {
        const alertes = [];
        const win = chargerProductions(alertes);
        const d = FORMULAIRE({
            dateEcheance: null,
            echeancesParGroupe: { gc_1: { assignee: false, date: null },
                                  gc_2: { assignee: false, date: '2026-11-15' } }
        });
        expect(win.validerChampsObligatoiresProduction(d)).toBe(true);
        expect(alertes).toEqual([]);
    });

    it('aucune alerte du dépôt ne parle encore d\'échéance obligatoire', () => {
        const alertes = [];
        const win = chargerProductions(alertes);
        win.validerChampsObligatoiresProduction(FORMULAIRE({ dateEcheance: null }));
        win.validerChampsObligatoiresProduction(FORMULAIRE({ titre: '' }));
        expect(alertes.join(' ')).not.toMatch(/échéance/i);
    });

    it('titre manquant : toujours bloqué, avec alerte', () => {
        const alertes = [];
        const win = chargerProductions(alertes);
        expect(win.validerChampsObligatoiresProduction(FORMULAIRE({ titre: '' }))).toBe(false);
        expect(alertes.length).toBe(1);
    });

    it('type manquant : toujours bloqué', () => {
        const alertes = [];
        const win = chargerProductions(alertes);
        expect(win.validerChampsObligatoiresProduction(FORMULAIRE({ type: '' }))).toBe(false);
        expect(alertes.length).toBe(1);
    });

    it('pondération à 0 : toujours bloquée…', () => {
        const alertes = [];
        const win = chargerProductions(alertes);
        expect(win.validerChampsObligatoiresProduction(FORMULAIRE({ ponderation: 0 }))).toBe(false);
        expect(alertes.length).toBe(1);
    });

    it('…sauf pour un artefact de portfolio, qui n\'a pas de pondération propre', () => {
        const alertes = [];
        const win = chargerProductions(alertes);
        const d = FORMULAIRE({ type: 'artefact-portfolio', ponderation: 0, dateEcheance: null });
        expect(win.validerChampsObligatoiresProduction(d)).toBe(true);
        expect(alertes).toEqual([]);
    });
});

/* ---------------------------------------- S4 · l'état dans le menu (#1147 : il était un badge de la barre) */

describe('#486 · S4 — le menu de la sélection signale les gabarits à planifier', () => {
    it('un gabarit sans échéance porte « (à planifier) » après son titre', async () => {
        const win = chargerProductions();
        const html = await rendreListe(
            [{ id: 'PROD_1', titre: 'Description de personnage', type: 'travail',
               ponderation: 20, dateEcheance: null }],
            win.aucuneEcheanceAssignee
        );
        expect(html).toContain('>Description de personnage (à planifier)</option>');
    });

    it('un gabarit daté n\'en porte pas', async () => {
        const win = chargerProductions();
        const html = await rendreListe(
            [{ id: 'PROD_1', titre: 'Description de personnage', type: 'travail',
               ponderation: 20, dateEcheance: '2026-11-15' }],
            win.aucuneEcheanceAssignee
        );
        expect(html).not.toContain('(à planifier)');
    });

    it('le portfolio conteneur est exclu : il n\'a JAMAIS de date propre', async () => {
        const win = chargerProductions();
        const html = await rendreListe(
            [{ id: 'PROD_P', titre: 'Portfolio', type: 'portfolio', dateEcheance: null }],
            win.aucuneEcheanceAssignee
        );
        expect(html).not.toContain('(à planifier)');
    });

    it('un artefact sans date le porte (les artefacts, eux, ont une échéance)', async () => {
        const win = chargerProductions();
        const html = await rendreListe(
            [{ id: 'PROD_A', titre: 'Artefact 3', type: 'artefact-portfolio', dateEcheance: null }],
            win.aucuneEcheanceAssignee
        );
        expect(html).toContain('>Artefact 3 (à planifier)</option>');
    });

    it('le badge se pose par production, pas sur la liste entière', async () => {
        const win = chargerProductions();
        const html = await rendreListe([
            { id: 'PROD_1', titre: 'Sans date', type: 'travail', ponderation: 10, dateEcheance: null },
            { id: 'PROD_2', titre: 'Datée', type: 'travail', ponderation: 10, dateEcheance: '2026-11-15' },
            { id: 'PROD_3', titre: 'Décochée', type: 'travail', ponderation: 10,
              echeancesParGroupe: { gc_1: { assignee: false, date: '2026-11-15' } } }
        ], win.aucuneEcheanceAssignee);
        expect((html.match(/\(à planifier\)/g) || []).length).toBe(2);
        expect(html).toContain('>Sans date (à planifier)</option>');
        expect(html).toContain('>Décochée (à planifier)</option>');
    });
});
