import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// LOT 1 du planificateur en grille (plan du 6 août 2026, exécuté le 6 août).
//
// Point de départ : l'ordre des séquences n'était stocké nulle part. La palette
// Navigation triait par position verticale sur le canevas (`a.y - b.y`), la Vue
// calendrier par `metadata.semaineDebut` — un champ saisi sur la SÉQUENCE que
// personne ne remplissait, si bien que tous les tris retombaient sur leur repli
// 999. Résultat observé sur le 601-101 : deux vues du même plan affichées dans
// des ordres différents (Navigation commençait par « Sem. 10 », Vue calendrier
// par « Sem. 1 »). Le numéro de semaine, lui, vivait dans le TITRE en texte
// libre — invisible pour l'outil, qui ne peut ni trier ni compter dessus.
//
// D3 : l'ancrage temporel appartient à la LEÇON. `metadata.semaine` sur la
// leçon ; les niveaux supérieurs DÉRIVENT leur étendue (première → dernière).
// Les champs `semaineDebut` / `semaineFin` de la séquence sont RETIRÉS.
//
// Cette sentinelle verrouille :
//   A. la dérivation d'étendue (leçons dispersées, séquence vide, imbrication) ;
//   B. la migration (idempotente, purge sèche, garde de persistance) ;
//   C. l'interdit d'extraction depuis les titres ;
//   D. l'écriture par la porte unique et le tri qui en découle.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const sourceOrganisateur = readFileSync(path.join(racineProjet, 'js', 'organisateur.js'), 'utf8');

// --- Sandbox ------------------------------------------------------------
let store;
let cartesSauvees;
let indexCourant;

function monterModule({ index = { active: 'carte_1' }, sauvegardeLance = false } = {}) {
    store = {};
    cartesSauvees = [];
    indexCourant = index;

    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };

    const planificationDonnees = {
        getIndex: () => indexCourant,
        sauvegarderCarte: (id, donnees) => {
            if (sauvegardeLance) throw new Error('échec de persistance simulé');
            cartesSauvees.push({ id, donnees });
        },
        chargerCarte: () => null
    };

    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t === null || t === undefined ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
        requestAnimationFrame: (fn) => { fn(); return 0; }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = planificationDonnees;
    return win.planificationCarte;
}

function poserLecon(api, id, metadata = {}, parent = null) {
    api.etat.noeuds.set(id, { id, type: 'lecon', titre: 'Leçon', metadata, enfants: [], parent });
}

function poserSequence(api, id, enfants = [], titre = 'Séquence', parent = null) {
    api.etat.noeuds.set(id, { id, type: 'sequence', titre, metadata: {}, enfants, parent });
}

// =======================================================================
// A. DÉRIVATION DE L'ÉTENDUE
// =======================================================================
describe('lot 1 · étendue temporelle dérivée des leçons', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('une leçon planifiée a pour étendue sa propre semaine', () => {
        poserLecon(api, 'planif-l1', { semaine: 4 });
        expect(api.etendueTemporelleParId('planif-l1')).toEqual({ debut: 4, fin: 4 });
    });

    it('une leçon sans semaine n’est pas ancrée (non planifiée)', () => {
        poserLecon(api, 'planif-l1', {});
        expect(api.etendueTemporelleParId('planif-l1')).toBeNull();
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l1'))).toBeNull();
    });

    it('une séquence dérive min/max de ses leçons, même dans le désordre', () => {
        poserLecon(api, 'planif-l1', { semaine: 7 }, 'planif-s1');
        poserLecon(api, 'planif-l2', { semaine: 2 }, 'planif-s1');
        poserLecon(api, 'planif-l3', { semaine: 5 }, 'planif-s1');
        poserSequence(api, 'planif-s1', ['planif-l1', 'planif-l2', 'planif-l3']);

        expect(api.etendueTemporelleParId('planif-s1')).toEqual({ debut: 2, fin: 7 });
    });

    it('les leçons non planifiées d’une séquence ne tirent pas son étendue vers le bas', () => {
        poserLecon(api, 'planif-l1', { semaine: 6 }, 'planif-s1');
        poserLecon(api, 'planif-l2', {}, 'planif-s1');
        poserSequence(api, 'planif-s1', ['planif-l1', 'planif-l2']);

        expect(api.etendueTemporelleParId('planif-s1')).toEqual({ debut: 6, fin: 6 });
    });

    it('une séquence VIDE n’a aucune étendue (zone « non planifié », Q1)', () => {
        poserSequence(api, 'planif-s1', []);
        expect(api.etendueTemporelleParId('planif-s1')).toBeNull();
    });

    it('une séquence dont AUCUNE leçon n’est planifiée n’a aucune étendue (Q2)', () => {
        poserLecon(api, 'planif-l1', {}, 'planif-s1');
        poserLecon(api, 'planif-l2', {}, 'planif-s1');
        poserSequence(api, 'planif-s1', ['planif-l1', 'planif-l2']);

        expect(api.etendueTemporelleParId('planif-s1')).toBeNull();
    });

    it('la dérivation est RÉCURSIVE — une séquence de séquences agrège ses petites-filles', () => {
        // La voie A (séquences de séquences) n'est pas encore livrée ; la
        // dérivation doit déjà la porter pour n'avoir rien à réécrire ici.
        poserLecon(api, 'planif-l1', { semaine: 3 }, 'planif-s1');
        poserLecon(api, 'planif-l2', { semaine: 9 }, 'planif-s2');
        poserSequence(api, 'planif-s1', ['planif-l1'], 'Séquence A', 'planif-s0');
        poserSequence(api, 'planif-s2', ['planif-l2'], 'Séquence B', 'planif-s0');
        poserSequence(api, 'planif-s0', ['planif-s1', 'planif-s2'], 'Ensemble');

        expect(api.etendueTemporelleParId('planif-s0')).toEqual({ debut: 3, fin: 9 });
    });

    it('un cycle dans enfants ne fait pas boucler la dérivation', () => {
        poserSequence(api, 'planif-s1', ['planif-s2']);
        poserSequence(api, 'planif-s2', ['planif-s1', 'planif-l1']);
        poserLecon(api, 'planif-l1', { semaine: 5 }, 'planif-s2');

        expect(api.etendueTemporelleParId('planif-s1')).toEqual({ debut: 5, fin: 5 });
    });

    it('la leçon fait foi sur son propre contenu (elle est aussi un conteneur)', () => {
        // Une activité n'a pas d'ancrage : la semaine de la leçon ne doit pas
        // être écrasée par une descente dans ses enfants.
        api.etat.noeuds.set('planif-a1', {
            id: 'planif-a1', type: 'activite', titre: 'Atelier',
            metadata: { semaine: 12 }, enfants: [], parent: 'planif-l1'
        });
        poserLecon(api, 'planif-l1', { semaine: 3 });
        api.etat.noeuds.get('planif-l1').enfants = ['planif-a1'];

        expect(api.etendueTemporelleParId('planif-l1')).toEqual({ debut: 3, fin: 3 });
    });

    it('une semaine 0 ou négative vaut « non planifiée », pas semaine 0', () => {
        poserLecon(api, 'planif-l1', { semaine: 0 });
        poserLecon(api, 'planif-l2', { semaine: -3 });
        expect(api.etendueTemporelleParId('planif-l1')).toBeNull();
        expect(api.etendueTemporelleParId('planif-l2')).toBeNull();
    });

    it('formaterEtendue rend « Sem. N », « Sem. N–M », ou rien', () => {
        expect(api.formaterEtendue(null)).toBe('');
        expect(api.formaterEtendue({ debut: 4, fin: 4 })).toBe('Sem. 4');
        expect(api.formaterEtendue({ debut: 2, fin: 7 })).toBe('Sem. 2–7');
    });
});

// =======================================================================
// B. TRI — les non planifiés en FIN de liste
// =======================================================================
describe('lot 1 · rang temporel', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('une séquence non planifiée passe APRÈS toutes les planifiées', () => {
        poserLecon(api, 'planif-l1', { semaine: 12 }, 'planif-s1');
        poserSequence(api, 'planif-s1', ['planif-l1']);
        poserSequence(api, 'planif-s2', []);

        const rangPlanifie = api.rangTemporel(api.etat.noeuds.get('planif-s1'));
        const rangNonPlanifie = api.rangTemporel(api.etat.noeuds.get('planif-s2'));

        expect(rangPlanifie).toBe(12);
        expect(rangNonPlanifie).toBeGreaterThan(rangPlanifie);
        // L'ancien repli 999 était atteignable par un cadre long : plus maintenant.
        expect(rangNonPlanifie).toBe(Number.MAX_SAFE_INTEGER);
    });
});

// =======================================================================
// C. MIGRATION — purge sèche, idempotente, gardée
// =======================================================================
describe('lot 1 · migration de l’ancrage vers la leçon', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('retire semaineDebut/semaineFin de la séquence', () => {
        poserSequence(api, 'planif-s1', []);
        api.etat.noeuds.get('planif-s1').metadata = { semaineDebut: 3, semaineFin: 5, autre: 'garder' };

        expect(api.migrerAncrageTemporelVersLecon()).toBe(1);

        const meta = api.etat.noeuds.get('planif-s1').metadata;
        expect(meta.semaineDebut).toBeUndefined();
        expect(meta.semaineFin).toBeUndefined();
        // Le reste de la metadata n'est pas touché.
        expect(meta.autre).toBe('garder');
    });

    it('NE REPORTE PAS l’ancienne semaine sur les leçons (ne rien deviner)', () => {
        poserLecon(api, 'planif-l1', {}, 'planif-s1');
        poserSequence(api, 'planif-s1', ['planif-l1']);
        api.etat.noeuds.get('planif-s1').metadata = { semaineDebut: 3, semaineFin: 3 };

        api.migrerAncrageTemporelVersLecon();

        // Tout repart non planifié : l'enseignant assigne, l'outil n'invente pas.
        expect(api.etat.noeuds.get('planif-l1').metadata.semaine).toBeUndefined();
        expect(api.etendueTemporelleParId('planif-s1')).toBeNull();
    });

    it('est idempotente — une carte déjà migrée ne repasse pas par sauvegarder()', () => {
        poserSequence(api, 'planif-s1', []);
        api.etat.noeuds.get('planif-s1').metadata = { semaineDebut: 3 };

        expect(api.migrerAncrageTemporelVersLecon()).toBe(1);
        const apresPremiere = cartesSauvees.length;

        expect(api.migrerAncrageTemporelVersLecon()).toBe(0);
        expect(cartesSauvees.length).toBe(apresPremiere);
    });

    it('ne touche à rien sans cible de persistance (pas de mutation orpheline)', () => {
        api = monterModule({ index: null });
        poserSequence(api, 'planif-s1', []);
        api.etat.noeuds.get('planif-s1').metadata = { semaineDebut: 3 };

        expect(api.migrerAncrageTemporelVersLecon()).toBe(0);
        // La donnée survit : mieux vaut un champ périmé qu'une purge non persistée.
        expect(api.etat.noeuds.get('planif-s1').metadata.semaineDebut).toBe(3);
    });

    it('préserve les semaines DÉJÀ portées par les leçons', () => {
        poserLecon(api, 'planif-l1', { semaine: 8 }, 'planif-s1');
        poserSequence(api, 'planif-s1', ['planif-l1']);
        api.etat.noeuds.get('planif-s1').metadata = { semaineDebut: 1 };

        api.migrerAncrageTemporelVersLecon();

        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l1'))).toBe(8);
        expect(api.etendueTemporelleParId('planif-s1')).toEqual({ debut: 8, fin: 8 });
    });
});

// =======================================================================
// D. ÉCRITURE — porte unique
// =======================================================================
describe('lot 1 · definirSemaineLecon', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('écrit la semaine et persiste', () => {
        poserLecon(api, 'planif-l1', {});
        expect(api.definirSemaineLecon('planif-l1', 6)).toBe(true);
        expect(api.etat.noeuds.get('planif-l1').metadata.semaine).toBe(6);
        expect(cartesSauvees.length).toBeGreaterThan(0);
    });

    it('accepte une chaîne (valeur d’un <input type=number>)', () => {
        poserLecon(api, 'planif-l1', {});
        expect(api.definirSemaineLecon('planif-l1', '9')).toBe(true);
        expect(api.etat.noeuds.get('planif-l1').metadata.semaine).toBe(9);
    });

    it('vider le champ repasse la leçon en non planifiée (champ SUPPRIMÉ, pas mis à null)', () => {
        poserLecon(api, 'planif-l1', { semaine: 4 });
        expect(api.definirSemaineLecon('planif-l1', '')).toBe(true);
        expect('semaine' in api.etat.noeuds.get('planif-l1').metadata).toBe(false);
    });

    it('refuse d’ancrer autre chose qu’une leçon', () => {
        poserSequence(api, 'planif-s1', []);
        expect(api.definirSemaineLecon('planif-s1', 3)).toBe(false);
        expect(api.etat.noeuds.get('planif-s1').metadata.semaine).toBeUndefined();
    });

    it('une valeur inchangée ne déclenche pas de sauvegarde', () => {
        poserLecon(api, 'planif-l1', { semaine: 5 });
        const avant = cartesSauvees.length;
        expect(api.definirSemaineLecon('planif-l1', 5)).toBe(false);
        expect(cartesSauvees.length).toBe(avant);
    });
});

// =======================================================================
// E. ALLER-RETOUR MARKDOWN — la semaine voyage sur la LEÇON
// =======================================================================
function monterOrganisateur() {
    const win = chargerScript('js/organisateur.js', {
        db: { getSync: (k, d) => d, setSync: () => {} },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t === null || t === undefined ? '' : t),
        document: { getElementById: () => null, querySelectorAll: () => [] }
    });
    return win.organisateur;
}

describe('lot 1 · marqueurs Markdown', () => {
    let org;
    beforeEach(() => { org = monterOrganisateur(); });

    // Formats de durée réellement émis par `formatDuree` : « 45 min », « 1h50 ».
    it('lit « Sem. N » sur la leçon, avec ou sans durée, dans les deux ordres', () => {
        const md = [
            '## Ouverture [Séquence]',
            '### Accueil [Leçon | 1h50 | Sem. 1]',
            '### Diagnostic [Leçon | Sem. 2]',
            '### Inversé [Leçon | Sem. 4 | 45 min]',
            '### Sans ancrage [Leçon | 45 min]',
            '### Nu [Leçon]'
        ].join('\n');

        const lecons = org.parserPlanMD(md).sequences[0].lecons;

        expect(lecons.map((l) => l.semaine)).toEqual([1, 2, 4, null, null]);
        // La durée continue d'être lue, quelle que soit sa place dans le marqueur.
        expect(lecons.map((l) => l.dureeMin)).toEqual([110, 0, 45, 45, 0]);
    });

    it('aller-retour : ce que l’export écrit, l’import le relit à l’identique', () => {
        // Le marqueur exporté est `[Leçon | <formatDuree> | Sem. N]`.
        const md = '### Atelier [Leçon | 1h50 | Sem. 6]';
        const lecon = org.parserPlanMD(md).orphelines[0];
        expect(lecon.dureeMin).toBe(110);
        expect(lecon.semaine).toBe(6);
    });

    it('IGNORE l’étendue restée sur une ligne de séquence (vieux fichier)', () => {
        const md = [
            '## Ouverture [Séquence | Sem. 3–5]',
            '### Accueil [Leçon]'
        ].join('\n');

        const seq = org.parserPlanMD(md).sequences[0];

        // Le fichier reste lisible…
        expect(seq.titre).toBe('Ouverture');
        expect(seq.lecons).toHaveLength(1);
        // …mais l'étendue n'est ni conservée, ni répartie sur les leçons.
        expect(seq.semaineDebut).toBeUndefined();
        expect(seq.semaineFin).toBeUndefined();
        expect(seq.lecons[0].semaine).toBeNull();
    });

    it('une leçon hors séquence garde son ancrage', () => {
        const md = [
            '## Divers [Orphelines]',
            '### Rattrapage [Leçon | Sem. 12]'
        ].join('\n');

        expect(org.parserPlanMD(md).orphelines[0].semaine).toBe(12);
    });

    it('une semaine 0 dans le Markdown ne devient pas un ancrage', () => {
        const md = '### Test [Leçon | Sem. 0]';
        expect(org.parserPlanMD(md).orphelines[0].semaine).toBeNull();
    });
});

// =======================================================================
// F. INVARIANTS DE SOURCE — l'interdit d'extraction depuis les titres
// =======================================================================
describe('lot 1 · invariants statiques', () => {
    it('aucune expression régulière n’extrait « Sem. N » d’un TITRE de nœud', () => {
        // La migration ne doit RIEN deviner : les « Sem. 3 - … » qui vivent
        // aujourd'hui dans les titres du 601-101 restent du texte libre.
        const corpsMigration = sourceCarte.slice(
            sourceCarte.indexOf('function migrerAncrageTemporelVersLecon'),
            sourceCarte.indexOf('// === INDEX INVERSE CLONES')
        );
        expect(corpsMigration.length).toBeGreaterThan(100);
        expect(corpsMigration).not.toMatch(/\.titre/);
        expect(corpsMigration).not.toMatch(/Sem\\?\./);
        expect(corpsMigration).not.toMatch(/match\(/);
    });

    it('plus aucune lecture de semaineDebut/semaineFin hors de la migration', () => {
        // Toute occurrence résiduelle est dans la purge elle-même ou son commentaire.
        for (const ligne of sourceCarte.split('\n')) {
            if (!/semaineDebut|semaineFin/.test(ligne)) continue;
            expect(ligne).toMatch(/delete n\.metadata\.|in n\.metadata|^\/\//);
        }
        expect(sourceOrganisateur).not.toMatch(/semaineDebut|semaineFin/);
    });

    it('l’import Markdown lit la semaine sur la LEÇON, jamais sur la séquence', () => {
        // Le marqueur de séquence reste toléré (vieux fichiers) mais sa valeur
        // n'est plus capturée : aucun groupe de capture pour « Sem. » sur ##.
        expect(sourceOrganisateur).toMatch(/\[Séquence\(\?:\\s\*\\\|\\s\*Sem\\\.\\s\*\\d\+\(\?:\\s\*\[–-\]\\s\*\\d\+\)\?\)\?\\\]/);
        expect(sourceOrganisateur).toMatch(/leconNoeud\.metadata\.semaine = lecon\.semaine/);
        expect(sourceOrganisateur).toMatch(/orpNoeud\.metadata\.semaine = orp\.semaine/);
    });

    it('l’Organisateur passe par la dérivation exposée, jamais par un champ de séquence', () => {
        expect(sourceOrganisateur).toMatch(/carte\.etendueTemporelle\(seq\)/);
        expect(sourceOrganisateur).toMatch(/function ancrageLeconPourDates/);
        expect(sourceOrganisateur).toMatch(/carte\.semaineDeLecon\(lecon\)/);
    });
});
