import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #583 + #680 — UNE ÉCHELLE PARTAGÉE EMPORTE SES REPÈRES DE MAÎTRISE (25 sept. 2026).
//
// Le trajet réel, de bout en bout, entre DEUX espaces : un·e collègue fabrique le .lcz
// signé de son échelle à repères (vraie chaîne d'export), le fichier passe d'un contexte
// de navigateur à un autre (stockage vierge, comme sur un autre poste), la personne qui le
// reçoit l'importe par la prévisualisation, le copie dans ses documents, évalue une copie
// avec — et lit le bilan de la rétroaction. Sans les repères, « Présentement » est muet :
// le bilan classe les critères par rapport aux deux repères de l'échelle.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estErreurAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => {
        if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estErreurAttendue(m)) erreurs.push(m); }
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

const AUTEUR = 'Collègue fictive 583';

async function ouvrir(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(700);
}

test('#583 · une échelle partagée arrive avec ses repères, et le bilan de la copie évaluée chez le destinataire parle', async ({ browser }) => {
    const erreurs = [];

    // 1. L'ÉMETTRICE — son échelle à repères, le .lcz signé par la vraie chaîne d'export.
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    attacherCaptureErreurs(pageA, erreurs);
    await ouvrir(pageA);
    const lcz = await pageA.evaluate(async (auteur) => {
        // security-ok: fixture littérale du banc, aucune source externe.
        const echelle = { id: 'E583', nom: 'IDME partagée', description: 'Échelle du département', discipline: 'Littérature',
            niveaux: [
                { code: 'I', nom: 'Insuffisant', description: 'Unistructurel', niveauSOLO: 'unistructurel', min: 0, max: 54, valeurCalcul: 40, couleur: '#aa0000' },
                { code: 'D', nom: 'En développement', description: 'Multistructurel', niveauSOLO: 'multistructurel', min: 55, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
                { code: 'M', nom: 'Maîtrisé', description: 'Relationnel', niveauSOLO: 'relationnel', min: 75, max: 89, valeurCalcul: 80, couleur: '#00aa00' },
                { code: 'E', nom: 'Étendu', description: 'Abstrait étendu', niveauSOLO: 'abstrait_etendu', min: 90, max: 100, valeurCalcul: 95, couleur: '#0000aa' }
            ], seuilSuffisance: 'D', seuilMaitrise: 'M' };
        const pkg = await window.partageFormat.construirePackageSigne(echelle, { type: 'echelle', identiteAuteur: auteur });
        const blob = await window.partageExport.genererLcz(pkg);
        const octets = new Uint8Array(await blob.arrayBuffer());
        let binaire = '';
        octets.forEach((o) => { binaire += String.fromCharCode(o); });
        return { base64: btoa(binaire), emise: pkg.entites.echelles[0] };
    }, AUTEUR);
    await ctxA.close();
    console.log('ÉMISE →', JSON.stringify(lcz.emise));

    // 2. LA DESTINATAIRE — un AUTRE contexte : stockage vierge.
    const ctxB = await browser.newContext();
    const page = await ctxB.newPage();
    attacherCaptureErreurs(page, erreurs);
    await ouvrir(page);
    const recu = await page.evaluate(async (base64) => {
        window.db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
        window.db.setSync('trimestreActif', 'a2026');
        const binaire = atob(base64);
        const octets = new Uint8Array(binaire.length);
        for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
        const promesse = window.partageImport.importerFichier(new File([octets], 'echelle-583.lcz'));
        await new Promise(r => setTimeout(r, 500));
        const previz = document.getElementById('modalPartagePreviz');
        const bouton = previz ? previz.querySelector('[data-decision="importer"]') : null;
        if (bouton) bouton.click();
        const issue = await promesse;
        const partagee = (window.db.getSync('partage_echelles', []) || [])[0] || null;
        const copie = partagee ? window.partageSection.dupliquerVersMesDocuments('echelle', partagee.id) : null;
        const mesEchelles = window.db.getSync(cle('echellesTemplates'), []) || [];
        return { statut: issue.statut, partagee, copie: mesEchelles[mesEchelles.length - 1] || null, retourDupliquer: !!copie };
    }, lcz.base64);
    console.log('REÇUE →', JSON.stringify({ statut: recu.statut, partagee: recu.partagee }));
    expect(recu.statut).toBe('importe');
    expect(recu.copie, 'la copie dans « Mes documents » existe').not.toBeNull();

    // 3. Elle évalue une copie avec l'échelle reçue (même semis que le banc #940).
    const ecran = await page.evaluate(async (echelleId) => {
        const k = (b) => (typeof cle === 'function' ? cle(b) : b);
        window.db.setSync('groupeCoursActif', { id: 'GC1', trimestreId: 'a2026', nom: 'Groupe 00007' });
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('groupeEtudiants'), [{ da: '1234567', prenom: 'Daniel', nom: 'Témoin', groupe: '00007', groupeCoursId: 'GC1' }]);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('grillesTemplates'), [{ id: 'G9', nom: 'Analyse', type: 'holistique', criteres: [
            { id: 'c1', nom: 'Structure', ponderation: 30, type: 'holistique', description: 'La structure du texte' },
            { id: 'c2', nom: 'Rigueur', ponderation: 30, type: 'holistique', description: 'La rigueur de la démonstration' },
            { id: 'c3', nom: 'Nuance', ponderation: 40, type: 'holistique', description: '' }
        ] }]);
        window.db.setSync(k('cartouches_G9'), []);
        // security-ok: fixture littérale du banc, aucune source externe.
        window.db.setSync(k('productions'), [{ id: 'P1', titre: 'Analyse 1', grilleId: 'G9', echelleId, groupeCoursId: 'GC1', cartoucheId: '' }]);
        window.db.setSync(k('evaluationsSauvegardees'), []);
        window.chargerListeEtudiantsEval();
        window.chargerGroupesEval();
        window.chargerProductionsDansSelect();
        window.chargerGrillesDansSelect();
        window.chargerEchellePerformance();
        await window.demarrerEvaluationDepuisFichier({ id: 'F1', etudiantDA: '1234567', productionId: 'P1', nomFichier: 'analyse1.pdf' });
        const dormir = (ms) => new Promise(r => setTimeout(r, ms));
        await dormir(200);
        const selE = document.getElementById('selectEtudiantEval');
        selE.value = '1234567';
        window.chargerEvaluationsEtudiant();
        const selP = document.getElementById('selectProduction1');
        selP.value = 'P1';
        selP.dispatchEvent(new Event('change', { bubbles: true }));
        await dormir(900);
        const selG = document.getElementById('selectGrille1');
        if (!selG.value) { selG.value = 'G9'; selG.dispatchEvent(new Event('change', { bubbles: true })); }
        const selEch = document.getElementById('selectEchelle1');
        if (!selEch.value) { selEch.value = echelleId; selEch.dispatchEvent(new Event('change', { bubbles: true })); }
        const selR = document.getElementById('remiseProduction1');
        if (selR) { selR.value = 'importe'; if (typeof window.changerStatutRemise === 'function') window.changerStatutRemise(1); }
        await dormir(400);
        const menus = { c1: 'D', c2: 'I', c3: 'M' };
        Object.keys(menus).forEach((id) => {
            const menu = document.getElementById('eval_' + id);
            menu.value = menus[id];
            menu.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await dormir(300);
        window.basculerVueRetroaction('bilan');
        const html = document.getElementById('contenuRetroBilan').innerHTML;
        const [avant] = html.split('<h5>Points récurrents</h5>');
        const puces = (m) => ((m || '').match(/<p>- (.*?)<\/p>/g) || []).map(p => {
            const t = document.createElement('textarea'); t.innerHTML = p.slice(5, -4); return t.value;
        });
        return { echelleChoisie: selEch.value, presentement: puces(avant), aLeTitre: html.includes('Présentement') };
    }, recu.copie.id);
    console.log('BILAN →', JSON.stringify(ecran));
    await ctxB.close();

    // Ce qui voyage : les deux repères, et les champs de #680 retenus.
    expect(recu.partagee.seuilSuffisance).toBe('D');
    expect(recu.partagee.seuilMaitrise).toBe('M');
    expect(recu.partagee.description).toBe('Échelle du département');
    expect(recu.partagee.discipline).toBe('Littérature');
    expect(recu.partagee.niveaux.map(n => n.niveauSOLO)).toEqual(['unistructurel', 'multistructurel', 'relationnel', 'abstrait_etendu']);
    expect(recu.partagee.niveaux.map(n => n.description)).toEqual(['Unistructurel', 'Multistructurel', 'Relationnel', 'Abstrait étendu']);
    // Et la copie dans « Mes documents » les garde.
    expect([recu.copie.seuilSuffisance, recu.copie.seuilMaitrise]).toEqual(['D', 'M']);

    // Le sens : le bilan de la copie évaluée chez la destinataire parle.
    expect(ecran.echelleChoisie).toBe(recu.copie.id);
    expect(ecran.aLeTitre).toBe(true);
    expect(ecran.presentement).toEqual([
        'Rigueur (Insuffisant) : La rigueur de la démonstration',
        'Structure (En développement) : La structure du texte'
    ]);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#583 · à l\'écran : un repère orphelin est dit dans la prévisualisation ; un champ inconnu dit quoi faire', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    // Les rejets VOLONTAIRES du second cas se loguent en console.error.
    page.removeAllListeners('console');
    page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const m = `console.error: ${msg.text()}`;
        if (!estErreurAttendue(m) && !/\[partage-import\]/.test(m)) erreurs.push(m);
    });
    await ouvrir(page);

    const r = await page.evaluate(async (auteur) => {
        window.db.setSync('partage_packagesImportes', []);
        window.db.setSync('partage_echelles', []);
        const echelle = { id: 'E583B', nom: 'IDME orpheline', niveaux: [
            { code: 'I', nom: 'Insuffisant', min: 0, max: 59, valeurCalcul: 40 },
            { code: 'M', nom: 'Maîtrisé', min: 60, max: 100, valeurCalcul: 80 }
        ], seuilSuffisance: 'I', seuilMaitrise: 'X' };
        const dormir = (ms) => new Promise(res => setTimeout(res, ms));

        // 1. Repère orphelin : le paquet est signé APRÈS la projection — il est authentique.
        const pkg = await window.partageFormat.construirePackageSigne(echelle, { type: 'echelle', identiteAuteur: auteur });
        const p1 = window.partageImport.importerFichier(new File([await window.partageExport.genererLcz(pkg)], 'orphelin.lcz'));
        await dormir(500);
        const previz = document.getElementById('modalPartagePreviz');
        const avert = document.getElementById('partage-previz-avertissements');
        const texteAvert = avert ? avert.textContent : null;
        const classeAvert = avert && avert.firstElementChild ? avert.firstElementChild.className : null;
        previz.querySelector('[data-decision="importer"]').click();
        const issue1 = await p1;
        const recue = (window.db.getSync('partage_echelles', []) || [])[0] || {};

        // 2. Champ inconnu : un paquet d'une version « future ».
        const futur = await window.partageFormat.construirePackageSigne(echelle, { type: 'echelle', identiteAuteur: auteur });
        futur.entites.echelles[0].champDuFutur = 'x';
        const p2 = window.partageImport.importerFichier(new File([await window.partageExport.genererLcz(futur)], 'futur.lcz'));
        await dormir(500);
        const rejet = document.getElementById('modalPartageRejet');
        const puces = rejet ? [...rejet.querySelectorAll('li')].map(li => li.textContent) : [];
        rejet.querySelector('[data-decision="fermer"]').click();
        const issue2 = await p2;
        window.trustTofu.oublierAuteur(auteur);
        return { statut1: issue1.statut, texteAvert, classeAvert, recue: { s: recue.seuilSuffisance, m: recue.seuilMaitrise, a: 'seuilMaitrise' in recue },
            statut2: issue2.statut, puces };
    }, AUTEUR);
    console.log('ÉCRAN →', JSON.stringify(r));

    expect(r.statut1).toBe('importe');
    expect(r.texteAvert).toBe('Échelle « IDME orpheline » : le repère « Maîtrisé à partir de » désigne le niveau « X », qui n\'existe pas dans cette échelle. Ce repère n\'est pas importé ; tu pourras le poser dans l\'éditeur d\'échelle.');
    expect(r.classeAvert).toBe('alerte alerte-attention');
    expect(r.recue).toEqual({ s: 'I', m: undefined, a: false });

    expect(r.statut2).toBe('rejete_validation');
    expect(r.puces[0]).toBe('Ce fichier vient d\'une version plus récente de Labo Codex. Recharge la page, puis importe-le de nouveau.');
    expect(r.puces.slice(1).join(' ')).toContain('champ inconnu');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
