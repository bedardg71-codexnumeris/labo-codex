/**
 * SENTINELLE #902 — L'EXPORT ANONYMISÉ POUR LA RECHERCHE REND LES VRAIS INDICES (lot 33, 17 sept. 2026).
 *
 * MESURÉ AVANT DE CODER :
 *   - `indices_finaux` lisait `indicesCP[da].actuel.PAN || .SOM`, format retiré en Beta 95.5 : `A_final`, `C_final` et
 *     `P_final` valaient 0 pour CHAQUE élève, alors que la carte des Réglages promet « Indices A-C-P anonymisés » ;
 *   - A n'a jamais vécu dans `indicesCP` : sa source est `indicesAssiduite.sommatif[da]` (objet `{ indice }`, ou l'ancien
 *     format « nombre ») ;
 *   - le tri par liste déroulante de la liste des évaluations (`#tri-evaluations`, `trierLignes`,
 *     `obtenirIndicesEtudiant`, `trierListeEvaluations`) n'avait ni élément, ni appelant : retiré.
 *
 * CHOIX : le bloc lit par `calculerTousLesIndices` (le lecteur unique de l'app) — A, C, P de 0 à 100, comme les snapshots
 * du même fichier. Règle #394 : un P non constructible s'exporte `null` (jamais 0), avec `note_constructible: false`.
 *
 * Ce banc fait tourner le VRAI `exporterFormatRecherche` et lit le fichier qu'il fabrique (le premier Blob).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const DA = { CONSTRUIT: '2000001', NON_CONSTRUIT: '2000002', A_NOMBRE: '2000003', EXCLU: '2000005' };

function storeDuBanc() {
    const store = storeBase();
    store.trimestres = [{ id: 'test', nom: 'Automne banc', session: 'A', annee: 2026, actif: true }];
    store.cours = [{ id: 'GC1', sigle: '601-101', titre: 'Cours banc', groupe: '01', actif: true }];
    store.test_groupeEtudiants = [
        { da: DA.CONSTRUIT, nom: 'Tremblay-Banc', prenom: 'Alice', groupe: '01', coursId: 'GC1', statut: 'actif' },
        { da: DA.NON_CONSTRUIT, nom: 'Gagnon-Banc', prenom: 'Bruno', groupe: '01', coursId: 'GC1', statut: 'actif' },
        { da: DA.A_NOMBRE, nom: 'Roy-Banc', prenom: 'Chloé', groupe: '01', coursId: 'GC1', statut: 'actif' },
        { da: DA.EXCLU, nom: 'Parti-Banc', prenom: 'Émile', groupe: '01', coursId: 'GC1', statut: 'abandon' }
    ];
    // Le format PLAT, celui que les producteurs écrivent. Le leurre `A: 11` n'est lu par personne : il fait rougir un
    // retour à « A pris dans indicesCP ».
    store.test_indicesCP = {
        [DA.CONSTRUIT]: { actuel: { A: 11, C: 80, P: 72, noteConstructible: true } },
        [DA.NON_CONSTRUIT]: { actuel: { A: 11, C: 50, P: 0, noteConstructible: false } },
        [DA.A_NOMBRE]: { actuel: { A: 11, C: 100, P: 88 } },
        [DA.EXCLU]: { actuel: { A: 11, C: 40, P: 55, noteConstructible: true } }
    };
    store.test_indicesAssiduite = { sommatif: {
        [DA.CONSTRUIT]: { indice: 0.9, nombreSeances: 10 },
        [DA.NON_CONSTRUIT]: { indice: 0.6, nombreSeances: 10 },
        [DA.A_NOMBRE]: 0.75, // l'ancien format « nombre »
        [DA.EXCLU]: { indice: 0.2, nombreSeances: 10 }
    } };
    store.test_snapshots = { hebdomadaires: [], interventions: [] };
    return store;
}

/** Fait tourner le vrai export ; rend le fichier anonymisé (le premier Blob) en texte et en objet. */
async function exporter(store, globauxEnPlus) {
    const blobs = [];
    function Blob(parts) { blobs.push(parts.join('')); }
    const banc = monter(store || storeDuBanc(), {
        modules: ['js/indices.js', 'js/trimestres.js'],
        globaux: {
            // Le `document` du banc sait déjà créer un lien cliquable ; on ne fournit que ce que le navigateur apporte.
            Blob, URL: { createObjectURL: () => 'blob:banc', revokeObjectURL() {} }, crypto: globalThis.crypto, TextEncoder,
            ...(globauxEnPlus || {})   // #908 : la version chargée, que `init-inline.js` pose sur window dans la page
        }
    });
    try {
        const resultat = await banc.win.exporterFormatRecherche({ cleSecrete: 'CLE-DE-BANC-0123456789abcdefghij' });
        expect(resultat, JSON.stringify(resultat)).toMatchObject({ success: true });
        expect(blobs.length, 'le fichier anonymisé et la table de correspondance').toBe(2);
        return { texte: blobs[0], fichier: JSON.parse(blobs[0]), table: JSON.parse(blobs[1]) };
    } finally {
        banc.restaurerHorloge();
    }
}

/** indices_finaux, rangés par DA grâce à la table de correspondance (privée, elle). */
function parDA({ fichier, table }) {
    const versDA = table.correspondances;
    return Object.fromEntries(fichier.calculs.indices_finaux.map((l) => [versDA[l.id_etudiant], l]));
}

describe('#902 — indices_finaux porte les valeurs stockées', () => {
    it('un P constructible : A de indicesAssiduite, C et P du format plat, de 0 à 100', async () => {
        const lignes = parDA(await exporter());
        expect(lignes[DA.CONSTRUIT]).toMatchObject({ A_final: 90, C_final: 80, P_final: 72, note_constructible: true });
    });

    it('un P non constructible s\'exporte null — jamais 0 — et le fichier dit pourquoi', async () => {
        const sortie = await exporter();
        const ligne = parDA(sortie)[DA.NON_CONSTRUIT];
        expect(ligne.P_final).toBeNull();
        expect(ligne.note_constructible).toBe(false);
        // A et C restent des mesures : la règle #394 ne vise que la note.
        expect(ligne).toMatchObject({ A_final: 60, C_final: 50 });
        // Dans le texte du fichier, c'est bien le mot JSON `null` qu'un outil statistique lira comme valeur manquante.
        expect(sortie.texte).toMatch(/"P_final": null/);
    });

    it('A en ancien format « nombre » est lu', async () => {
        const lignes = parDA(await exporter());
        expect(lignes[DA.A_NOMBRE]).toMatchObject({ A_final: 75, C_final: 100, P_final: 88, note_constructible: true });
    });

    it('A ne vient jamais de indicesCP (le leurre 11 n\'apparaît nulle part)', async () => {
        const { fichier } = await exporter();
        for (const l of fichier.calculs.indices_finaux) expect(l.A_final).not.toBe(11);
    });

    it('aucune ligne ne porte trois zéros quand le stock porte des valeurs', async () => {
        const { fichier } = await exporter();
        for (const l of fichier.calculs.indices_finaux) expect([l.A_final, l.C_final, l.P_final]).not.toEqual([0, 0, 0]);
    });

    it('l\'élève exclu reste hors de indices_finaux (#745 : hors des moyennes du groupe)', async () => {
        const sortie = await exporter();
        expect(sortie.fichier.calculs.indices_finaux).toHaveLength(3);
        expect(parDA(sortie)[DA.EXCLU]).toBeUndefined();
    });

    it('le fichier annonce ses unités et la forme du « non constructible »', async () => {
        const { fichier } = await exporter();
        expect(fichier.calculs.unites).toMatch(/0 à 100/);
        expect(fichier.calculs.unites).toMatch(/null/);
        expect(fichier.calculs.unites).toMatch(/note_constructible/);
        // 1.147.1 : depuis #743 (lot D), A_final peut aussi valoir null — la note le dit aux chercheurs.
        expect(fichier.calculs.unites).toMatch(/A_final vaut null/);
        expect(fichier.meta.version_format).toBe('1.2'); // 1.1 = #902 ; 1.2 = #913 (resultats_ulterieurs, additif)
    });
});

describe('#902 — le fichier anonymisé reste anonyme', () => {
    it('ni DA, ni nom, ni prénom dans le fichier qui voyage', async () => {
        const store = storeDuBanc();
        const { texte, table } = await exporter(store);
        for (const e of store.test_groupeEtudiants) {
            expect(texte, 'DA ' + e.da).not.toContain(e.da);
            expect(texte, 'nom ' + e.nom).not.toContain(e.nom);
            expect(texte, 'prénom ' + e.prenom).not.toContain(e.prenom);
        }
        // Les DA vivent dans la table de correspondance — le second fichier, privé.
        expect(Object.values(table.correspondances)).toContain(DA.CONSTRUIT);
    });

    it('chaque ligne de indices_finaux ne porte que des champs attendus', async () => {
        const { fichier } = await exporter();
        for (const l of fichier.calculs.indices_finaux) {
            expect(Object.keys(l).sort()).toEqual(['A_final', 'C_final', 'P_final', 'id_etudiant', 'note_constructible']);
            expect(l.id_etudiant).toMatch(/^[0-9a-f]{8}$/);
        }
    });
});

/**
 * #908 (21 sept. 2026) — L'EN-TÊTE DU FICHIER DIT CE QUE L'APPLICATION CALCULE.
 *
 * MESURÉ AVANT DE CODER : `version_monitorage` valait « 6.0.0-beta95 » en dur (l'application est en 1.152.0) ; les
 * trois formules décrivaient un calcul qui n'existe plus (A en heures, C en « % >= M », P en « N meilleurs »).
 * A relu dans `calculerAssiduite` (Σ périodes présentes ÷ Σ périodes offertes). description, A et P : mots de Grégoire, tels
 * quels ; C : proposé par Claude Code, validé par Grégoire le 21 sept. 2026. La structure ne bouge pas : `version_format` reste 1.2, aucun champ ajouté ni retiré (cliquet plus bas).
 */
describe('#908 — l\'en-tête du fichier dit ce que l\'application calcule', () => {
    // Les clés du fichier AVANT #908 (le diff du lot ne touche que des valeurs : mesuré sur le fichier produit).
    const CLES_META = ['version_monitorage', 'version_format', 'date_export', 'trimestre', 'anonymisation'];
    const CLES_CALCULS = ['description', 'formules', 'snapshots_hebdomadaires', 'unites', 'indices_finaux', 'performance_par_critere'];

    // La version du dépôt, lue là où `release.mjs` l'écrit — jamais une constante recopiée ici.
    const versionDuDepot = JSON.parse(readFileSync(path.join(RACINE, 'version.js'), 'utf8').match(/window\.__VERSION__\s*=\s*(\{.*?\});/)[1]).beta;

    it('la lecture de version.js rend bien une version (garde contre une comparaison vide)', () => {
        expect(versionDuDepot).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('version_monitorage est la version du code chargé', async () => {
        const { fichier } = await exporter(null, { VERSION_MAJEURE: versionDuDepot });
        expect(fichier.meta.version_monitorage).toBe(versionDuDepot);
    });

    it('version_monitorage SUIT la version chargée : une autre version chargée, une autre valeur', async () => {
        const { fichier } = await exporter(null, { VERSION_MAJEURE: '9.98.7' });
        expect(fichier.meta.version_monitorage).toBe('9.98.7');
    });

    it('sans version chargée, le fichier dit « inconnue » — jamais une version inventée', async () => {
        const { fichier } = await exporter();
        expect(fichier.meta.version_monitorage).toBe('inconnue');
    });

    it('la description et les définitions de A, de C et de P, mot pour mot', async () => {
        const { calculs } = (await exporter()).fichier;
        expect(calculs.description).toBe('Indices calculés par Labo Codex');
        expect(calculs.formules.indice_A).toBe('assiduité : périodes présentes ÷ périodes offertes, cumulées depuis le début du trimestre (%)');
        // C : proposé par Claude Code, validé par Grégoire (21 sept.) — « productions étudiantes » et la réserve sont de lui ;
        // la réserve vaut pour la classe PAN-Spécifications (acceptables ÷ requis).
        expect(calculs.formules.indice_C).toBe('complétion : productions étudiantes remises ÷ productions étudiantes attendues (%) ; en pratique par spécifications, productions acceptables ÷ productions requises');
        expect(calculs.formules.indice_P).toBe('performance calculée par la pratique de notation du cours ; la méthode varie selon la pratique');
    });

    it('cliquet : les clés de meta, de calculs et de formules sont celles d\'avant #908', async () => {
        const { fichier } = await exporter();
        expect(Object.keys(fichier.meta)).toEqual(CLES_META);
        expect(Object.keys(fichier.calculs)).toEqual(CLES_CALCULS);
        expect(Object.keys(fichier.calculs.formules)).toEqual(['indice_A', 'indice_C', 'indice_P']);
        expect(fichier.meta.version_format).toBe('1.2');
    });
});

describe('#902 — verrou structurel : l\'ancien format n\'est plus lu, le tri mort est parti', () => {
    // Le code seul : une ligne entièrement en commentaire (« // », « * », « /* ») ne lit rien.
    const codeDe = (src) => src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
    const dossier = (rel) => readdirSync(path.join(RACINE, rel), { withFileTypes: true })
        .flatMap((d) => (d.isDirectory() ? dossier(path.join(rel, d.name)) : (d.name.endsWith('.js') ? [path.join(rel, d.name)] : [])));
    const fichiers = dossier('js');

    it('le balayage voit bien le dossier js/ (garde contre une comparaison vide)', () => {
        expect(fichiers.length).toBeGreaterThan(80);
        expect(fichiers).toContain(path.join('js', 'trimestres.js'));
        expect(fichiers.some((f) => f.startsWith(path.join('js', 'pratiques')))).toBe(true);
    });

    it('aucun fichier de js/ ne lit `actuel.PAN`, `actuel.SOM` ni `actuel?.[…]`', () => {
        const fautifs = [];
        for (const f of fichiers) {
            const code = codeDe(readFileSync(path.join(RACINE, f), 'utf8'));
            if (/actuel\??\.(PAN|SOM)\b|actuel\??\.\[|actuel\[/.test(code)) fautifs.push(f);
        }
        expect(fautifs).toEqual([]);
    });

    it('le tri par liste déroulante n\'a plus ni lecture, ni fonction, ni export', () => {
        const code = codeDe(readFileSync(path.join(RACINE, 'js/liste-evaluations.js'), 'utf8'));
        const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
        for (const mot of ['tri-evaluations', 'obtenirIndicesEtudiant', 'trierListeEvaluations']) {
            expect(code, mot).not.toContain(mot);
            expect(html, mot + ' (index.html)').not.toContain(mot);
        }
        expect(code).not.toMatch(/\btrierLignes\s*\(/);
        // Le tri VIVANT, celui des en-têtes de colonne, est toujours là.
        expect(code).toMatch(/function trierLignesParColonne\(/);
        expect(code).toMatch(/window\.trierTableauParColonne = trierTableauParColonne/);
    });

    it('l\'export lit A à sa source et passe par le lecteur unique', () => {
        const code = codeDe(readFileSync(path.join(RACINE, 'js/trimestres.js'), 'utf8'));
        expect(code).toMatch(/cle\('indicesAssiduite'\)/);
        expect(code).toMatch(/calculerTousLesIndices\(e\.da, indicesAssiduite, indicesCP\)/);
    });
});
