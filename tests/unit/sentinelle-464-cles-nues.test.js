import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #464 (lot L2 « clés nues », 21 août 2026) — verrouille :
//   1. le REGISTRE : les 16 clés inscrites par l'inventaire CT-26 (dont
//      dureePeriode/CT-07 et les 4 clés du bilan réflexif, #365 rouvert) sont
//      réellement namespacées par cle() ;
//   2. le FALLTHROUGH BRUYANT de cle() (CT-26) : une clé hors registres émet un
//      warn — une seule fois par clé ;
//   3. forcerMigration (CO-10) : copie-si-cible-vide, JAMAIS d'écrasement des
//      données vivantes, purge du résidu dans tous les cas ;
//   4. migrerResidusClesNues (#464) : rapatriement one-shot (dureePeriode vers
//      TOUS les trimestres, le reste vers l'actif si vide), flag, no-op
//      pré-trimestre sans brûler le flag ;
//   5. les RATCHETS statiques : plus aucun repli de lecture vers la clé nue
//      pratiquesConfigurables (CO-09, 86 sites retirés), plus de semis des
//      échelles collègues dans echelles.js (CO-11/D2), plus d'écriture miroir
//      nue de seancesHoraire (CT-11) ;
//   6. le versement one-shot des 8 échelles collègues dans la bibliothèque
//      partagée (D2) : push sans replace, tombstones respectés, flag.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

function dbDepuisStore(store) {
    return {
        // #599 : les bibliothèques partagées écrivent par la file. Le stub la
        // reproduit fidèlement, refus compris — un mutateur qui rend `undefined`
        // n'écrit RIEN, ce qui est le chemin du « déjà présent ».
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        },
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        removeSync: (c) => { delete store[c]; }
    };
}

function chargerTrimestres(store) {
    return chargerScript('js/trimestres.js', { db: dbDepuisStore(store) });
}

describe('#464 · 1-2 — registre et fallthrough bruyant de cle()', () => {
    it('les clés de l\'inventaire CT-26 sont namespacées (échantillon + dureePeriode)', () => {
        const store = { trimestres: [{ id: 'a2026', actif: true }] };
        const win = chargerTrimestres(store);
        for (const k of ['dureePeriode', 'autoreflexionBilan', 'parcoursBilan', 'questionnaireBilan',
                         'resultatsBilan', 'chronoEvaluations', 'confidentielEtudiants', 'groupeSelectionne']) {
            expect(win.cle(k), k).toBe('a2026_' + k);
        }
    });

    it('une clé HORS registres émet un console.warn — une seule fois', () => {
        const store = { trimestres: [{ id: 'a2026', actif: true }] };
        const win = chargerTrimestres(store);
        const espion = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            expect(win.cle('cle-inconnue-test-464')).toBe('cle-inconnue-test-464');
            const warnsAvant = espion.mock.calls.filter(c => String(c[0]).includes('cle-inconnue-test-464')).length;
            expect(warnsAvant).toBe(1);
            win.cle('cle-inconnue-test-464');
            const warnsApres = espion.mock.calls.filter(c => String(c[0]).includes('cle-inconnue-test-464')).length;
            expect(warnsApres, 'un seul warn par clé et par session').toBe(1);
        } finally { espion.mockRestore(); }
    });
});

describe('#464 · 3 — forcerMigration (CO-10) : copie-si-vide, jamais d\'écrasement, purge', () => {
    it('cible vide : le résidu est copié puis purgé', () => {
        const store = {
            trimestres: [{ id: 'a2026', actif: true }],
            presences: [{ da: 'D1', date: '2026-08-20' }]
        };
        const win = chargerTrimestres(store);
        win.forcerMigration('a2026');
        expect(store.a2026_presences).toEqual([{ da: 'D1', date: '2026-08-20' }]);
        expect('presences' in store, 'résidu nu purgé').toBe(false);
    });

    it('cible OCCUPÉE : les données vivantes ne sont JAMAIS écrasées ; le résidu est purgé', () => {
        const store = {
            trimestres: [{ id: 'a2026', actif: true }],
            presences: [{ da: 'RESIDU' }],
            a2026_presences: [{ da: 'VIVANTE-1' }, { da: 'VIVANTE-2' }]
        };
        const win = chargerTrimestres(store);
        const espion = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try { win.forcerMigration('a2026'); } finally { espion.mockRestore(); }
        expect(store.a2026_presences, 'données vivantes intactes').toEqual([{ da: 'VIVANTE-1' }, { da: 'VIVANTE-2' }]);
        expect('presences' in store, 'résidu purgé même sans copie').toBe(false);
    });
});

describe('#464 · 4 — migrerResidusClesNues : one-shot, dureePeriode vers tous', () => {
    it('dureePeriode nue → copiée vers TOUS les trimestres dépourvus, puis purgée', () => {
        const store = {
            trimestres: [{ id: 'a2025', actif: false }, { id: 'a2026', actif: true }],
            dureePeriode: 75,
            a2025_dureePeriode: 60   // valeur existante : jamais écrasée
        };
        const win = chargerTrimestres(store);
        win.migrerResidusClesNues();
        expect(store.a2026_dureePeriode).toBe(75);
        expect(store.a2025_dureePeriode, 'valeur existante préservée').toBe(60);
        expect('dureePeriode' in store, 'clé nue purgée').toBe(false);
    });

    it('résidu pratiquesConfigurables → rapatrié vers l\'actif si vide, refusé si occupé ; flag one-shot', () => {
        const store = {
            trimestres: [{ id: 'a2026', actif: true }],
            pratiquesConfigurables: [{ id: 'P_LEGACY' }]
        };
        const win = chargerTrimestres(store);
        const espion = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            win.migrerResidusClesNues();
            expect(store.a2026_pratiquesConfigurables).toEqual([{ id: 'P_LEGACY' }]);
            expect('pratiquesConfigurables' in store).toBe(false);
            expect(store.migration_residus_cles_nues_done).toBe(true);
            // 2e passage : no-op même avec un nouveau résidu (one-shot)
            store.pratiquesConfigurables = [{ id: 'P_TARDIF' }];
            win.migrerResidusClesNues();
            expect(store.pratiquesConfigurables, 'flag posé : plus de rapatriement').toEqual([{ id: 'P_TARDIF' }]);
        } finally { espion.mockRestore(); }
    });

    it('sans trimestre actif : no-op ET le flag n\'est PAS brûlé (capture pré-trimestre préservée)', () => {
        const store = { trimestres: [], dureePeriode: 55 };
        const win = chargerTrimestres(store);
        win.migrerResidusClesNues();
        expect(store.dureePeriode, 'résidu intact').toBe(55);
        expect(store.migration_residus_cles_nues_done).toBeUndefined();
    });
});

describe('#464 · 5 — ratchets statiques (CO-09, CO-11, CT-11)', () => {
    const js = (f) => readFileSync(path.join(racineProjet, 'js', f), 'utf8');

    it('CO-09 : plus AUCUN repli de lecture vers la clé nue pratiquesConfigurables dans js/', () => {
        const { readdirSync } = require('node:fs');
        const fichiers = readdirSync(path.join(racineProjet, 'js')).filter(f => f.endsWith('.js'));
        const fautifs = [];
        for (const f of fichiers) {
            const src = js(f);
            if (src.includes("|| db.getSync('pratiquesConfigurables'") ||
                src.includes('|| db.getSync(CLE_PRATIQUES_CONFIGURATIONS')) fautifs.push(f);
        }
        expect(fautifs, 'replis nus réintroduits').toEqual([]);
    });

    it('suite de porte 2.5 : plus AUCUN appel cle(\'\') dans js/ (il rend \'\' — jamais un préfixe)', () => {
        const { readdirSync } = require('node:fs');
        const fichiers = readdirSync(path.join(racineProjet, 'js')).filter(f => f.endsWith('.js'));
        const fautifs = fichiers.filter(f => js(f).includes("cle('')"));
        expect(fautifs, 'cle(chaîne vide) réintroduit').toEqual([]);
    });

    it('CO-11/D2 : echelles.js ne porte plus le semis des échelles collègues', () => {
        const src = js('echelles.js');
        expect(src.includes('async function assurerEchellesPersonnalisees')).toBe(false);
        expect(src.includes("id: 'ECHELLE_BRUNO_CHIMIE'"), 'définitions retirées du semis').toBe(false);
    });

    it('CT-11 : plus d\'écriture MIROIR nue de seancesHoraire (orchestre + entité GC), et plus de fallback nue en lecture n°5', () => {
        expect(js('trimestre-v2-orchestre.js').includes("db.setSync('seancesHoraire'")).toBe(false);
        expect(js('entites/groupe-cours.js').includes("db.set('seancesHoraire'")).toBe(false);
        // horaire.js : la seule lecture nue restante est la legacy :422 (chemin mort, lot L7)
        const h = js('horaire.js');
        expect(h.includes("// 5. Fallback sur clé legacy non namespacée")).toBe(false);
    });
});

describe('#574 étendu · 6 — le versement des 8 échelles collègues est RETIRÉ (1er sept. 2026)', () => {

    // ⚰ Ce bloc REMPLACE celui qui gardait le versement de #464/D2. Il n'est pas
    // « réaligné » : la fonctionnalité est partie, donc son test part avec elle —
    // un test réaligné sur du code absent devient un vert qui n'exclut rien.
    //
    // POURQUOI LE RETRAIT. Les 32 niveaux des huit échelles portaient `valeur:` et
    // jamais `valeurCalcul:`. Depuis #527, `valeurNumeriqueDuNiveau` rend alors
    // `null`, tous les critères sortent du total, et l'écran affiche 0,0 % sans un
    // mot. Décision de Grégoire : les RETIRER, pas leur poser des valeurs — ce
    // serait refabriquer l'arbitrage pédagogique que #526/#527 ont supprimé.
    //
    // Break-test du 1er septembre, sur la source EN MÉMOIRE : remettre une seule
    // des huit définitions → A rougit ; remettre l'appel dans `echelles.js` → B
    // rougit ; retirer la sonde → C rougit. Trois assertions, trois sujets.

    // `js` est défini dans le describe voisin : il n'en sort pas. On le redéfinit
    // ici plutôt que de le hisser — hisser un helper hors de son bloc change la
    // portée de tests qu'on ne relit pas.
    const js = (f) => readFileSync(path.join(racineProjet, 'js', f), 'utf8');

    const IDS_DISCIPLINAIRES = ['ECHELLE_BRUNO_CHIMIE', 'ECHELLE_XAVIER_INFO', 'ECHELLE_ISABELLE_BIO',
        'ECHELLE_HELENE_PHILO', 'ECHELLE_MARIEHELENE_LITT', 'ECHELLE_ETIENNE_ADMIN',
        'ECHELLE_OLIVIER_GEO', 'ECHELLE_JORDAN_PHILO'];

    it('A — plus AUCUNE des huit définitions n\'est écrite dans js/ (hors commentaires)', () => {
        const { readdirSync } = require('node:fs');
        const fichiers = readdirSync(path.join(racineProjet, 'js')).filter(f => f.endsWith('.js'));
        const fautifs = [];
        for (const f of fichiers) {
            // Une définition, c'est `id: 'ECHELLE_X'` — pas un identifiant cité dans
            // une phrase, une liste de tombstones ou une sonde. Les commentaires
            // sont retirés d'abord : c'est la leçon des assertions statiques.
            const src = js(f)
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
            for (const id of IDS_DISCIPLINAIRES) {
                if (src.includes("id: '" + id + "'")) fautifs.push(f + ' → ' + id);
            }
        }
        expect(fautifs, 'une échelle disciplinaire est re-semée quelque part').toEqual([]);
    });

    it('B — plus aucun chemin du code ne verse ces échelles : la fonction et son appel sont partis', () => {
        const biblio = js('echelles-bibliotheque.js');
        expect(biblio.includes('async function migrerEchellesColleguesVersBibliotheque'),
            'la fonction de versement est revenue').toBe(false);
        expect(biblio.includes('window.migrerEchellesColleguesVersBibliotheque ='),
            'son export est revenu').toBe(false);
        const src = js('echelles.js')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
        expect(src.includes('migrerEchellesColleguesVersBibliotheque'),
            'initialiserModuleEchelles rappelle le versement').toBe(false);
    });

    it('C — la sonde de mesure reste offerte : un retrait de semis ne mesure pas les données déjà en place', () => {
        const biblio = js('echelles-bibliotheque.js');
        expect(biblio).toContain('async function _sonderEchellesDisciplinaires');
        expect(biblio).toContain('window._sonderEchellesDisciplinaires = _sonderEchellesDisciplinaires;');
        // Elle ne DOIT rien écrire : c'est ce qui autorise Grégoire à la lancer
        // sur ses données réelles sans préalable.
        const corps = biblio.slice(biblio.indexOf('async function _sonderEchellesDisciplinaires'));
        const fin = corps.indexOf('\nwindow._sonderEchellesDisciplinaires');
        const code = corps.slice(0, fin)
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
        for (const ecriture of ['db.set(', 'db.setSync(', 'db.modifier(', 'db.supprimer(']) {
            expect(code.includes(ecriture), 'la sonde ÉCRIT (' + ecriture + ') — elle doit être en lecture seule').toBe(false);
        }
    });

    it('D — les identifiants restent dans IDS_GABARITS_HARDCODES : une suppression doit rester durable', () => {
        // ⚠ Retirer le semis n'emporte PAS la durabilité d'une suppression. Chez
        // qui a déjà lancé l'application, les huit échelles sont dans sa
        // bibliothèque : sans tombstone, celle qu'il supprime reviendrait au
        // prochain import. Deux sujets, et le second survit au premier.
        const source = readFileSync(path.join(racineProjet, 'js', 'main.js'), 'utf8');
        const debut = source.indexOf('window.IDS_GABARITS_HARDCODES = [');
        const bloc = source.slice(debut, source.indexOf('];', debut));
        for (const id of IDS_DISCIPLINAIRES) {
            expect(bloc, id + ' a quitté la liste des tombstones').toContain(id);
        }
    });
});
