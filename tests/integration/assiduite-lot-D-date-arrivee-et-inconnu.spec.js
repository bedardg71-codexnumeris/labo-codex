import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// LOT D DU CADRAGE DU DÉPISTAGE (#735, #743, #750), 19 sept. 2026 — L'ASSIDUITÉ QUI MANQUE, DANS LA VRAIE PAGE.
//
// Tranché par Grégoire le 16 sept. : une date d'arrivée facultative sur la fiche ; l'assiduité INCONNUE tant
// qu'aucune séance saisie ne compte (un tiret, plus 100 %) ; les deux moyennes A du groupe (Liste et Suivi du
// groupe) suivent la même règle — l'inconnu n'y entre pas, l'absent total à 0 % y entre.
//
// Le banc FAIT LE GESTE : trois élèves ajoutés par le formulaire du Cadre (champs remplis, bouton cliqué).
//   · TARDIF  — sans date d'abord, puis la MÊME fiche éditée avec une date d'arrivée en semaine 6 ;
//   · ABSENT  — sans date, aucune présence : l'absent total, 0 %, CONNU ;
//   · INCONNU — arrivé après la dernière séance saisie : rien ne compte encore pour lui.
// Les présences de TARDIF (toutes les séances depuis le 6 octobre) sont posées par le banc : le pack démo n'a
// personne d'arrivé en cours de trimestre.
// ⚠ Stockage vidé UNE fois, avant le reload (pas en addInitScript : il se rejouerait au reload).

const ARRIVEE = '2025-10-06';

test('lot D · date d\'arrivée par le formulaire, tiret de l\'assiduité inconnue, moyennes accordées, filtre « A ou C < 70% »', async ({ page }) => {
    test.setTimeout(240000);
    const dialogues = [];
    const erreurs = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.dismiss(); });
    page.on('pageerror', (e) => erreurs.push(String(e)));
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    const m = await page.evaluate(async (ARRIVEE) => {
        const pause = (ms) => new Promise((res) => setTimeout(res, ms));
        const texte = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
        // L'Accompagnement sans son bloc masqué « À propos de cette section » (`.carte-info-toggle`) : depuis les textes
        // du lot 5 de l'Aide (#1152), il nomme la carte « Contexte d'apprentissage » avant elle.
        const texteSansAPropos = (el) => {
            if (!el) return null;
            const copie = el.cloneNode(true);
            copie.querySelectorAll('.carte-info-toggle').forEach((n) => n.remove());
            return texte(copie);
        };
        await window.activerModeDemo();
        await pause(1500);

        const dasDemo = (obtenirDonneesSelonMode('groupeEtudiants') || []).map(e => e.da);
        const groupeDemo = (obtenirDonneesSelonMode('groupeEtudiants') || [])[0].groupe;
        const indicesDemoAvant = dasDemo.map(da => { const i = calculerTousLesIndices(da); return [da, i.A, i.C, i.P]; });

        // LE GESTE : le formulaire du Cadre, rempli et soumis par son bouton.
        const champ = (id) => document.getElementById(id);
        const soumettre = async ({ da, nom, prenom, date }) => {
            champ('v2-etudiantDA').value = da;
            champ('v2-etudiantNom').value = nom;
            champ('v2-etudiantPrenom').value = prenom;
            champ('v2-etudiantGroupe').value = groupeDemo;      // le groupe du pack : les séances saisies se lisent par groupe (#330)
            champ('v2-etudiantDateArrivee').value = date || '';
            champ('v2-btnSoumettreEtudiant').click();
            await pause(900);
        };
        // ⚠ Montage, pas geste : le formulaire écrit un numéro de groupe padé (« demo » → « 0demo », L-9 de #749), or les
        // séances saisies se lisent PAR GROUPE (#330). Le banc remet ses élèves dans le groupe du pack, puis recalcule.
        const recaler = async () => {
            const tous = obtenirDonneesSelonMode('groupeEtudiants') || [];
            tous.forEach(e => { if (['9100001', '9100002', '9100003', 'DEMO004'].includes(e.da)) e.groupe = groupeDemo; });
            sauvegarderDonneesSelonMode('groupeEtudiants', tous);
            calculerEtSauvegarderIndicesAssiduite(); await pause(300);
        };
        const fiche = (da) => (obtenirDonneesSelonMode('groupeEtudiants') || []).find(e => e.da === da) || null;

        await soumettre({ da: '9100001', nom: 'Tardif', prenom: 'Théo' });
        await recaler();
        const ficheSansDate = JSON.parse(JSON.stringify(fiche('9100001')));

        // Ses présences : toutes les séances saisies depuis son arrivée, périodes complètes.
        const presences = obtenirDonneesSelonMode('presences') || [];
        const modele = presences.find(p => dasDemo.includes(p.da));
        // Les séances qui comptent : saisies ET au calendrier des séances (une date de présence hors calendrier ne compte pas).
        const auCalendrier = new Set(Object.keys(obtenirSeancesCompletes()));
        const datesSaisies = [...new Set(presences.map(p => p.date))].filter(d => auCalendrier.has(d)).sort();
        const datesDepuis = datesSaisies.filter(d => d >= ARRIVEE);
        datesDepuis.forEach(date => {
            presences.push(Object.assign({}, modele, { da: '9100001', date, periodesPresentes: obtenirNombrePeriodesSeance(date), facultatif: false }));
        });
        sauvegarderDonneesSelonMode('presences', presences);
        calculerEtSauvegarderIndicesAssiduite(); await pause(300);
        const sansDate = { indices: calculerTousLesIndices('9100001'), magasin: obtenirDonneesSelonMode('indicesAssiduite').sommatif['9100001'] };

        // La MÊME fiche, éditée : la date d'arrivée saisie dans le champ.
        editerEtudiantV2('9100001'); await pause(300);
        const champRelu = champ('v2-etudiantDateArrivee').value;
        champ('v2-etudiantDateArrivee').value = ARRIVEE;
        champ('v2-btnSoumettreEtudiant').click(); await pause(900);
        await recaler();
        const avecDate = { fiche: JSON.parse(JSON.stringify(fiche('9100001'))), indices: calculerTousLesIndices('9100001'), magasin: obtenirDonneesSelonMode('indicesAssiduite').sommatif['9100001'] };
        editerEtudiantV2('9100001'); await pause(300);
        const champReluApres = champ('v2-etudiantDateArrivee').value;
        fermerFicheEtudiantV2(); await pause(200);   // lot E2 : « Annuler » devient « Fermer »

        // L'aller-retour : la fiche sérialisée comme un export l'écrit, relue comme un import la pose (clé entière, sans liste blanche).
        const allerRetour = JSON.parse(JSON.stringify(obtenirDonneesSelonMode('groupeEtudiants'))).find(e => e.da === '9100001').dateArrivee;

        await soumettre({ da: '9100002', nom: 'Absent', prenom: 'Abel' });
        await soumettre({ da: '9100003', nom: 'Inconnue', prenom: 'Inès', date: '2025-12-31' });
        await recaler();
        const indicesAbsent = calculerTousLesIndices('9100002');
        const indicesInconnu = calculerTousLesIndices('9100003');

        // LA LISTE : colonne A de chacun, moyenne A.
        afficherListeEtudiantsConsultation(); await pause(700);
        const ligneDe = (nom) => Array.from(document.querySelectorAll('#tbody-suivi-liste tr')).find(tr => tr.textContent.includes(nom));
        const cellules = (tr) => (tr ? Array.from(tr.querySelectorAll('td')).map(td => texte(td)) : null);
        const liste = { moyA: texte(document.getElementById('moy-a')), tardif: cellules(ligneDe('Tardif')), absent: cellules(ligneDe('Absent')), inconnu: cellules(ligneDe('Inconnue')) };

        // LE SUIVI DU GROUPE : la barre A, puis le panneau Détails et le filtre « A ou C < 70% ».
        chargerTableauBordApercu(); await pause(900);
        const carte = texte(document.getElementById('carte-indicateurs-acpe')) || '';
        const barreA = (carte.match(/Assiduité \(A\) (\d+) % μ=(\d+) %/) || []).slice(1, 3);
        document.getElementById('btn-toggle-panneau-prioritaire').click(); await pause(600);
        const badges = (nom) => { const el = Array.from(document.querySelectorAll('#liste-etudiants-suivi > *')).find(n => n.textContent.includes(nom)); return el ? Array.from(el.querySelectorAll('.prioritaire-indice')).map(b => ({ t: texte(b), bulle: b.getAttribute('title') })) : null; };
        const badgesInconnu = badges('Inconnue');
        const boutonM = document.querySelector('.prioritaire-tri-btn[data-tri="M"]');
        const libelleM = texte(boutonM);
        boutonM.click(); await pause(600);
        const retenus = Array.from(document.querySelectorAll('#liste-etudiants-suivi .suivi-est-prioritaire')).map(n => texte(n));
        const filtre = { libelleM, absentRetenu: retenus.some(t => t.includes('Absent')), inconnuRetenu: retenus.some(t => t.includes('Inconnue')), nbRetenus: retenus.length };

        // LE PROFIL de l'inconnue : Engagement (méthodologie), puis Accompagnement (carte de contexte).
        afficherProfilComplet('9100003'); await pause(900);
        changerSectionProfil('mobilisation'); await pause(800);
        const engagement = texte(document.getElementById('profil-contenu-dynamique')) || '';
        changerSectionProfil('accompagnement'); await pause(800);
        const accompagnement = texteSansAPropos(document.getElementById('profil-contenu-dynamique')) || '';
        // Le profil de Tardif : aucune absence listée avant son arrivée.
        const absencesTardif = obtenirDetailsAssiduite('9100001').absences.map(a => a.date);

        const indicesDemoApres = dasDemo.map(da => { const i = calculerTousLesIndices(da); return [da, i.A, i.C, i.P]; });

        // LE FILTRE, JUGÉ SUR LE SEUL A : un élève du pack à C = 80 %, dont la date d'arrivée (saisie au formulaire)
        // suit la dernière séance — A inconnu, C au-dessus de la borne. Fait APRÈS la mesure « le pack ne bouge pas ».
        editerEtudiantV2('DEMO004'); await pause(300);
        champ('v2-etudiantDateArrivee').value = '2025-12-31';
        champ('v2-btnSoumettreEtudiant').click(); await pause(900);
        await recaler();
        const demo004 = calculerTousLesIndices('DEMO004');
        chargerTableauBordApercu(); await pause(900);
        if (!document.getElementById('btn-toggle-panneau-prioritaire').classList.contains('actif')) { document.getElementById('btn-toggle-panneau-prioritaire').click(); await pause(600); }
        // Le filtre est REJOUÉ (A→Z, puis « A ou C < 70% ») : le panneau se redessine sur les indices du moment. Sans ce
        // geste, la liste lue serait celle d'avant le changement de DEMO004 — break-test M8 resté vert le 19 sept., d'où ce témoin.
        document.querySelector('.prioritaire-tri-btn[data-tri="alpha"]').click(); await pause(500);
        document.querySelector('.prioritaire-tri-btn[data-tri="M"]').click(); await pause(700);
        const nomDemo004 = (obtenirDonneesSelonMode('groupeEtudiants').find(e => e.da === 'DEMO004') || {}).nom;
        const retenus2 = Array.from(document.querySelectorAll('#liste-etudiants-suivi .suivi-est-prioritaire')).map(n => texte(n));
        const ligne004 = Array.from(document.querySelectorAll('#liste-etudiants-suivi > *')).find(n => n.textContent.includes(nomDemo004));
        const filtreSurA = { demo004, nom: nomDemo004, badgeA: ligne004 ? texte(ligne004.querySelector('.prioritaire-indice')) : null, retenu: retenus2.some(t => t.includes(nomDemo004)), absentRetenu: retenus2.some(t => t.includes('Absent')), filtreActif: !!document.querySelector('.prioritaire-tri-btn[data-tri="M"].prioritaire-tri-actif') };

        // La carte de contexte de cet élève (des copies, pas d'assiduité) : un tiret à la place du palier.
        afficherProfilComplet('DEMO004'); await pause(900);
        changerSectionProfil('accompagnement'); await pause(800);
        const accompagnement004 = texteSansAPropos(document.getElementById('profil-contenu-dynamique')) || '';
        filtreSurA.contexte = (accompagnement004.match(/Contexte d'apprentissage (.{0,45})/) || [null, null])[1];
        filtreSurA.profilNul = /null|NaN|undefined/.test(accompagnement004);
        // 1.147.1 : la phrase de Grégoire sous le tiret, lue à l'écran (de « L'assiduité » au point final).
        filtreSurA.phrase = (accompagnement004.match(/L'assiduité n'est pas encore connue[^.]*\./) || [null])[0];

        // Le champ à 768 px : dans la grille, sans débordement, cible tactile.
        naviguerVers('calendrier', 'trimestre'); await pause(900);
        champ('v2-formEtudiant').scrollIntoView();
        const r = champ('v2-etudiantDateArrivee').getBoundingClientRect();
        const grille = document.querySelector('.grille-ajout-etudiant');
        return {
            groupeDemo, ficheSansDate, sansDate, champRelu, avecDate, champReluApres, allerRetour, nbDatesDepuis: datesDepuis.length, nbDatesSaisies: datesSaisies.length,
            indicesAbsent, indicesInconnu, liste, barreA, badgesInconnu, filtre,
            engagement: (engagement.match(/Indice A = (\S+) — /) || [null, null])[1], engagementNul: /null|NaN|undefined/.test(engagement),
            contexte: (accompagnement.match(/Contexte d'apprentissage (.{0,60})/) || [null, null])[1], accompagnementNul: /null|NaN|undefined/.test(accompagnement),
            absencesTardif, indicesDemoAvant, indicesDemoApres, filtreSurA,
            champ: { largeur: Math.round(r.width), hauteur: Math.round(r.height), hauteurVoisin: Math.round(champ('v2-etudiantProgramme').getBoundingClientRect().height), deborde: grille.scrollWidth > grille.clientWidth + 1, libelle: texte(document.querySelector('label[for="v2-etudiantDateArrivee"]')) }
        };
    }, ARRIVEE);

    expect(erreurs).toEqual([]);
    expect(dialogues).toEqual([]);

    // (1) #735 — sans date : la fiche ne porte PAS la clé, et les séances d'avant sont des absences.
    expect(m.ficheSansDate).not.toBeNull();
    expect('dateArrivee' in m.ficheSansDate).toBe(false);
    expect(m.nbDatesDepuis).toBeGreaterThan(0);
    expect(m.nbDatesDepuis).toBeLessThan(m.nbDatesSaisies);
    expect(m.sansDate.magasin.nombreSeances).toBe(m.nbDatesSaisies);
    expect(m.sansDate.indices.A).toBe(Math.round(100 * m.sansDate.magasin.periodesPresentes / m.sansDate.magasin.periodesOffertes));
    expect(m.sansDate.indices.A).toBeLessThan(100);
    //     avec la date, saisie dans le champ : comptée depuis l'arrivée — présent partout depuis, 100 %.
    expect(m.champRelu).toBe('');
    expect(m.avecDate.fiche.dateArrivee).toBe(ARRIVEE);
    expect(m.avecDate.magasin.nombreSeances).toBe(m.nbDatesDepuis);
    expect(m.avecDate.indices.A).toBe(100);
    expect(m.champReluApres).toBe(ARRIVEE);
    expect(m.allerRetour).toBe(ARRIVEE);
    expect(m.absencesTardif.filter(d => d < ARRIVEE)).toEqual([]);

    // (2) #743 — l'inconnue : null partout, un tiret à l'écran ; l'absent total, lui, est CONNU à 0 %.
    expect(m.indicesInconnu).toMatchObject({ A: null });
    expect(m.indicesInconnu, 'l\'indice composite M est retiré le 15 oct. 2026 (#1083, 6.46)').not.toHaveProperty('M');
    expect(m.indicesAbsent.A).toBe(0);
    expect(m.liste.inconnu).toContain('—');
    expect(m.liste.inconnu.some(c => /%/.test(c))).toBe(false);
    expect(m.liste.absent).toContain('0 %');
    expect(m.liste.tardif).toContain('100 %');
    expect(m.engagement).toBe('—');                       // « Indice A = — — 0 périodes présentes / 0 périodes offertes »
    expect(m.engagementNul).toBe(false);
    expect(m.contexte).toMatch(/^En attente de données/);      // ni présence ni copie : l'état « aucune donnée », pas « Très favorable »
    expect(m.accompagnementNul).toBe(false);
    //     la bulle du badge « A — » : les mots de Grégoire (19 sept. 2026), au caractère près ; le badge C, lui, n'en a pas.
    expect(m.badgesInconnu[0]).toEqual({ t: 'A —', bulle: 'Assiduité inconnue : aucune séance saisie ne compte encore pour cet·te étudiant·e.' });

    // (3) #750 — les deux moyennes disent le même chiffre : dix élèves du pack (93), Tardif (100), l'absent (0) ; l'inconnue n'y entre pas.
    const attendue = Math.round((m.indicesDemoAvant.reduce((s, l) => s + l[1], 0) + 100 + 0) / 12);
    expect(m.liste.moyA).toBe('moy=' + attendue + ' %');
    expect(m.barreA).toEqual([String(attendue), String(attendue)]);

    // (4) Le filtre « A ou C < 70% » : l'absent total (A = 0 %) est retenu ; un A INCONNU ne l'est pas — jugé sur
    //     un élève à C = 80 %, pour que le seul A décide (l'inconnue sans copie, elle, est retenue par son C à 0 %).
    expect(m.filtre.libelleM).toBe('A ou C < 70 %');
    expect(m.filtre.absentRetenu).toBe(true);
    expect(m.filtreSurA.demo004).toMatchObject({ A: null, C: 80 });
    expect(m.filtreSurA.filtreActif).toBe(true);
    expect(m.filtreSurA.badgeA).toBe('A —');                // témoin de fraîcheur : le panneau lu est celui d'APRÈS le changement
    expect(m.filtreSurA.absentRetenu).toBe(true);
    expect(m.filtreSurA.retenu).toBe(false);
    //     … et sa carte de contexte : un tiret à la place du palier (avant : « Très favorable », A lu 100 %), C lisible.
    expect(m.filtreSurA.contexte).toMatch(/^— Assiduité \(A\) : — Complétion \(C\) : 80\s%/);
    expect(m.filtreSurA.profilNul).toBe(false);
    //     … et, sous le tiret, la phrase de Grégoire (19 sept. 2026, « s'affichera »), au caractère près.
    expect(m.filtreSurA.phrase).toBe('L\'assiduité n\'est pas encore connue : le contexte s\'affichera dès qu\'une séance sera saisie pour cet·te étudiant·e.');

    // (5) Aucun élève du pack ne bouge : ni A, ni C, ni P.
    expect(m.indicesDemoApres).toEqual(m.indicesDemoAvant);

    // (6) Le champ à 768 px.
    expect(m.champ.libelle).toBe('Date d\'arrivée');
    expect(m.champ.deborde).toBe(false);
    expect(m.champ.largeur).toBeGreaterThan(120);
    expect(Math.abs(m.champ.hauteur - m.champ.hauteurVoisin)).toBeLessThanOrEqual(2);      // même gabarit que ses voisins (arrondi : WebKit rend des hauteurs sous-pixel)
});
