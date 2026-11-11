import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// LES PAGES D'UNE PRODUCTION SE SUIVENT, À L'IMPORT (10 nov. 2026)
// =======================================================================
// Vécu par Grégoire (1.241.0, iPad puis Mac) : déposées d'un coup, les remises Léa d'un
// groupe gardaient l'ordre du dépôt. Les pages d'une même production se dispersaient dans
// la file ; « Originaux » ouvrait le cadre d'une production à son premier fichier et ne le
// fermait qu'au dernier, si bien que les cadres s'emboîtaient en escalier. « Réunir », fait
// pour séparer deux pages d'une production, ne faisait rien, sans un mot.
//
// Ce que Grégoire a accepté (18 h 41 à 18 h 45) :
//   A. la file d'un seul tenant dès le dépôt, dans l'ordre de remise ;
//   B. « Réunir » prend exactement les pages cochées (il sait donc détacher) ; si elles
//      forment déjà une production entière, rien ne bouge et un message le dit ;
//   C. deux personnes du groupe au même nom de famille : « Nom, Prénom » dans l'Aperçu.
// Et une décision technique : la liste fait foi, l'assemblage suit l'ordre de la file.
//
// Noms manifestement fictifs (règle 6). Break-tests : journal en fin de fichier.

const ETUDIANTS = [
    { da: '2412345', nom: 'Nomfictif', prenom: 'Alice' },
    { da: '2498765', nom: 'Nomfictif', prenom: 'Bruno' },
    { da: '2400011', nom: 'Exemplaire', prenom: 'Chloé' },
    { da: '2400022', nom: 'Témoin', prenom: 'Dario' },
    { da: '2400033', nom: 'TEMOIN', prenom: 'Élie' }
];
const OCTETS_PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

/** Un nom Léa : NOM_DA_Production-pN_Remis_le_AAAA-MM-JJ_HHhMMmSSs.pdf */
function lea(nom, da, page, heure) {
    return `${nom}_${da}_Journal-3-p${page}_Remis_le_2026-11-03_${heure}.pdf`;
}
function faireFichier(nomFichier) {
    const blob = new Blob([OCTETS_PDF], { type: 'application/pdf' });
    blob.name = nomFichier;
    blob.lastModified = Date.UTC(2026, 10, 3, 10, 0, 0);
    return blob;
}

/** Le dépôt entrelacé : Alice, Bruno (même nom de famille), Chloé, pages dans le désordre. */
const DEPOT_ENTRELACE = [
    lea('Nomfictif_Alice', '2412345', 2, '09h00m10s'),
    lea('Nomfictif_Bruno', '2498765', 1, '09h05m00s'),
    lea('Nomfictif_Alice', '2412345', 1, '09h00m00s'),
    lea('Exemplaire_Chloe', '2400011', 1, '09h07m00s'),
    lea('Nomfictif_Bruno', '2498765', 2, '09h05m10s'),
    lea('Nomfictif_Alice', '2412345', 3, '09h00m20s')
];
const court = (f) => f.nomFichier.split('_')[1] + ' ' + f.nomFichier.match(/-(p\d)_/)[1];

function stockageDeSession() {
    const m = new Map();
    return {
        getItem: (k) => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => { m.set(k, String(v)); },
        removeItem: (k) => { m.delete(k); },
        clear: () => m.clear(),
        key: (i) => Array.from(m.keys())[i] ?? null,
        get length() { return m.size; }
    };
}

let notes;
function monter(sessionStorage, { anonyme = null } = {}) {
    notes = [];
    const travauxStockage = {
        obtenirFichiersGroupeActif: () => [],
        genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 }),
        genererMiniatureImage: async () => '',
        stockerThumbnail: () => {},
        obtenirThumbnailSync: () => ''
    };
    const globaux = {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? ETUDIANTS : []),
        obtenirEtudiantsCoursActif: () => ETUDIANTS,
        travauxStockage,
        sessionStorage,
        db: { getSync: (_k, d) => (d === undefined ? null : d), setSync: () => {} },
        echapperHtml: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        notifications: { succes: (m) => notes.push(m), erreur: (m) => notes.push(m), info: (m) => notes.push(m) },
        anonymiserNom: () => anonyme
    };
    const win = chargerScript('js/travaux-import.js', globaux, {
        addEventListener: () => {}, removeEventListener: () => {},
        TailleFichier: { dire: () => '1 Ko' }
    });
    globaux.travauxImport = win.travauxImport;
    globaux.document = { addEventListener: () => {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
    chargerScript('js/travaux-ui.js', globaux, win);
    return win;
}

let session, win, ti;
beforeEach(() => {
    session = stockageDeSession();
    win = monter(session);
    ti = win.travauxImport;
});

/** Les cadres de « Originaux » : leur clé, leurs lignes, et s'ils sont emboîtés. */
function lireLesCadres(html) {
    const doc = new JSDOM(html).window.document;
    return [...doc.querySelectorAll('.pipeline-groupe-encadre')].map((c) => ({
        cle: c.getAttribute('data-groupe-id'),
        emboite: !!c.parentElement.closest('.pipeline-groupe-encadre'),
        lignes: [...c.querySelectorAll('.pipeline-fichier-ligne')].map((l) => Number(l.getAttribute('data-param')))
    }));
}

describe('A. dès le dépôt, les pages d\'une production se suivent, dans l\'ordre de remise', () => {
    it('une file entrelacée devient d\'un seul tenant : chaque production à la place de sa première page, ses pages par numéro', () => {
        ti.ajouterFichiersEnAttente(DEPOT_ENTRELACE.map(faireFichier));
        expect(ti.obtenirFileDAttente().map(court)).toEqual([
            'Alice p1', 'Alice p2', 'Alice p3', 'Bruno p1', 'Bruno p2', 'Chloe p1'
        ]);
    });

    it('les deux homonymes gardent deux productions distinctes (DA différents)', () => {
        ti.ajouterFichiersEnAttente(DEPOT_ENTRELACE.map(faireFichier));
        const cles = ti.obtenirFileDAttente().map((f) => f.groupeDocumentId);
        expect(cles.slice(0, 3).every((c) => c === '2412345_Journal-3')).toBe(true);
        expect(cles.slice(3, 5).every((c) => c === '2498765_Journal-3')).toBe(true);
    });

    it('un second dépôt range ses pages avec la production déjà en file, et un fichier seul garde sa place', () => {
        ti.ajouterFichiersEnAttente([lea('Nomfictif_Alice', '2412345', 2, '09h00m10s'), 'IMG_0412.pdf', lea('Nomfictif_Bruno', '2498765', 1, '09h05m00s')].map(faireFichier));
        ti.ajouterFichiersEnAttente([lea('Nomfictif_Alice', '2412345', 1, '09h00m00s'), 'IMG_0413.pdf'].map(faireFichier));
        expect(ti.obtenirFileDAttente().map((f) => (f.groupeDocumentId ? court(f) : f.nomFichier))).toEqual([
            'Alice p1', 'Alice p2', 'IMG_0412.pdf', 'Bruno p1', 'IMG_0413.pdf'
        ]);
    });

    it('la file rangée est persistée : rechargée, elle revient dans le même ordre', () => {
        ti.ajouterFichiersEnAttente(DEPOT_ENTRELACE.map(faireFichier));
        const apres = monter(session).travauxImport.obtenirFileDAttente();
        expect(apres.map(court)).toEqual(['Alice p1', 'Alice p2', 'Alice p3', 'Bruno p1', 'Bruno p2', 'Chloe p1']);
    });

    it('une file entrelacée persistée AVANT le correctif est rassemblée à la restauration, sans retri', () => {
        // L'ancienne file, telle que la persistait la 1.241.0 : l'ordre du dépôt.
        const ancienne = DEPOT_ENTRELACE.map((n) => {
            const parseLea = ti.parserNomFichierLea(n);
            return { nomFichier: n, typeMIME: 'application/pdf', estPDF: true, parseLea, groupeDocumentId: parseLea.da + '_Journal-3', etudiantDA: parseLea.da };
        });
        session.setItem('pipeline_queue', JSON.stringify(ancienne));
        const apres = monter(session).travauxImport.obtenirFileDAttente();
        // Rassemblée à la place de la première page de chacune, dans l'ordre où elles étaient : p2 avant p1 pour Alice.
        expect(apres.map(court)).toEqual(['Alice p2', 'Alice p1', 'Alice p3', 'Bruno p1', 'Bruno p2', 'Chloe p1']);
        // Et persistée telle quelle.
        expect(JSON.parse(session.getItem('pipeline_queue')).map((d) => d.nomFichier)).toEqual(apres.map((f) => f.nomFichier));
    });
});

describe('« Originaux » n\'emboîte jamais deux cadres', () => {
    it('une file entrelacée en entrée : aucun cadre dans un autre, chaque cadre ne contient que les lignes de sa clé', () => {
        // Rendue telle quelle, sans passer par le dépôt : le rendu doit tenir même devant une file qui ne l'est pas.
        const file = DEPOT_ENTRELACE.map((n) => {
            const parseLea = ti.parserNomFichierLea(n);
            return { nomFichier: n, parseLea, groupeDocumentId: parseLea.da + '_Journal-3', estPDF: true, tailleFichier: 8 };
        });
        const cadres = lireLesCadres(win.travauxUI.genererColonneOriginaux(file));
        expect(cadres.length, 'garde de non-vide (règle 10)').toBeGreaterThan(0);
        cadres.forEach((c) => {
            expect(c.emboite, `cadre ${c.cle} emboîté`).toBe(false);
            expect(c.lignes.length).toBeGreaterThan(0);
            c.lignes.forEach((i) => expect(file[i].groupeDocumentId, `ligne ${i + 1} dans le cadre ${c.cle}`).toBe(c.cle));
        });
    });

    it('la file déposée : un cadre par production, toutes ses pages dedans, le badge dit leur nombre', () => {
        ti.ajouterFichiersEnAttente(DEPOT_ENTRELACE.map(faireFichier));
        const file = ti.obtenirFileDAttente();
        const html = win.travauxUI.genererColonneOriginaux(file);
        const cadres = lireLesCadres(html);
        expect(cadres.map((c) => [c.cle, c.lignes])).toEqual([
            ['2412345_Journal-3', [0, 1, 2]],
            ['2498765_Journal-3', [3, 4]]
        ]);
        const badges = [...new JSDOM(html).window.document.querySelectorAll('.pipeline-groupe-badge')].map((b) => b.textContent.trim());
        expect(badges[0]).toMatch(/^3 /);
    });
});

describe('B. « Réunir » prend exactement les pages cochées', () => {
    beforeEach(() => ti.ajouterFichiersEnAttente(DEPOT_ENTRELACE.map(faireFichier)));
    const cles = () => ti.obtenirFileDAttente().map((f) => f.groupeDocumentId);

    it('deux pages d\'une production de trois : elles s\'en détachent, la troisième y reste', () => {
        // Alice p1, p2, p3 aux rangs 0, 1, 2 : cocher p2 et p3.
        const r = ti.reunirEnUneCopie([1, 2]);
        expect(r).toMatchObject({ debut: 1, nombre: 2 });
        const file = ti.obtenirFileDAttente();
        expect(file.map(court)).toEqual(['Alice p1', 'Alice p2', 'Alice p3', 'Bruno p1', 'Bruno p2', 'Chloe p1']);
        expect(file[0].groupeDocumentId).toBe('2412345_Journal-3');
        expect(ti.estCopieReunie(file[1].groupeDocumentId)).toBe(true);
        expect(file[2].groupeDocumentId).toBe(file[1].groupeDocumentId);
        expect(file[3].groupeDocumentId).toBe('2498765_Journal-3');
    });

    it('détacher au milieu : la production d\'origine se referme, la nouvelle se place juste après', () => {
        // Alice p1 et p3 restent ensemble ; p2 et Bruno p1 deviennent une production.
        ti.reunirEnUneCopie([1, 3]);
        const file = ti.obtenirFileDAttente();
        expect(file.map(court)).toEqual(['Alice p1', 'Alice p3', 'Alice p2', 'Bruno p1', 'Bruno p2', 'Chloe p1']);
        expect(cles().slice(0, 2)).toEqual(['2412345_Journal-3', '2412345_Journal-3']);
        expect(cles()[2]).toBe(cles()[3]);
        expect(ti.estCopieReunie(cles()[2])).toBe(true);
        expect(cles()[4]).toBe('2498765_Journal-3');
    });

    it('réunir deux productions par les seules pages cochées : les autres pages restent dans la leur', () => {
        // Alice p3 (rang 2) et Bruno p1 (rang 3).
        ti.reunirEnUneCopie([2, 3]);
        const file = ti.obtenirFileDAttente();
        expect(file.map(court)).toEqual(['Alice p1', 'Alice p2', 'Alice p3', 'Bruno p1', 'Bruno p2', 'Chloe p1']);
        expect(cles().slice(0, 2)).toEqual(['2412345_Journal-3', '2412345_Journal-3']);
        expect(cles()[2]).toBe(cles()[3]);
        expect(cles()[4]).toBe('2498765_Journal-3');
        // L'élève de la nouvelle production : le premier fichier coché qui en porte (Alice).
        expect(file[3].etudiantDA).toBe('2412345');
    });

    it('les pages cochées forment déjà une production entière : rien ne bouge, et le retour le dit', () => {
        const avant = cles();
        const r = ti.reunirEnUneCopie([3, 4]);
        expect(r).toMatchObject({ dejaUneProduction: true, debut: 3 });
        expect(cles()).toEqual(avant);
    });

    it('le geste à l\'écran : « Ces pages forment déjà une production. »', () => {
        win.travauxUI.cocherPourReunir(3);
        win.travauxUI.cocherPourReunir(4);
        const avant = cles();
        win.travauxUI.reunirCopiePipeline();
        expect(cles()).toEqual(avant);
        expect(notes).toContain('Ces pages forment déjà une production.');
    });
});

describe('La liste fait foi : l\'assemblage suit l\'ordre de la file', () => {
    it('une page de production Léa montée aux flèches reste à sa place dans le PDF', () => {
        ti.ajouterFichiersEnAttente(DEPOT_ENTRELACE.map(faireFichier));
        // Alice p3 monte deux fois : p3, p1, p2.
        ti.monterFichier(2);
        ti.monterFichier(1);
        const alice = ti.regrouperParDocument().get('2412345_Journal-3').map(court);
        expect(alice).toEqual(['Alice p3', 'Alice p1', 'Alice p2']);
    });
});

describe('C. deux personnes au même nom de famille : « Nom, Prénom » dans l\'Aperçu', () => {
    const fichierDe = (da) => ({ etudiantDA: da, etudiantAssocie: ETUDIANTS.find((e) => e.da === da) });

    it('les homonymes (Nomfictif) sont nommés « Nom, Prénom »', () => {
        expect(win.travauxUI.nomDansLApercu(fichierDe('2412345'))).toBe('Nomfictif, Alice');
        expect(win.travauxUI.nomDansLApercu(fichierDe('2498765'))).toBe('Nomfictif, Bruno');
    });

    it('comparés sans accents ni casse (Témoin, TEMOIN)', () => {
        expect(win.travauxUI.nomDansLApercu(fichierDe('2400022'))).toBe('Témoin, Dario');
    });

    it('un nom unique reste le nom seul', () => {
        expect(win.travauxUI.nomDansLApercu(fichierDe('2400011'))).toBe('Exemplaire');
    });

    it('l\'anonymisation garde la priorité', () => {
        const w = monter(stockageDeSession(), { anonyme: 'Élève 7' });
        expect(w.travauxUI.nomDansLApercu(fichierDe('2412345'))).toBe('Élève 7');
    });
});

// Break-tests : voir le rapport du lot (plans de travail/RAPPORT-2026-11-10-import-productions-d-un-tenant.md).
