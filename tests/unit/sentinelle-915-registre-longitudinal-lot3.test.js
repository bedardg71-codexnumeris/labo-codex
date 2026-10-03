/**
 * SENTINELLE #915 — REGISTRE LONGITUDINAL, LOT 3 : la saisie, la reprise du stock de #913, le retrait (18 sept. 2026).
 *
 * Ce que le lot tient (cadrage v2, § 5.2 (c) (d), § 6, § 7 lot 3, § 9 bis) :
 *   1. un résultat ultérieur se range SOUS L'ÉLÈVE INSCRIT·E, trois champs et pas un de plus ; la note est un nombre de 0 à
 *      100 à une décimale ; « Cours » et « Trimestre » sont bornés à 40 caractères (le trou R3 du relais de 1.143.0) ;
 *   2. SEULE ÉCRITURE : `registreLongitudinal`. Le stock de #913 (`<trim>_resultatsUlterieurs`) est LU, jamais réécrit ni
 *      effacé — identique octet pour octet après chaque geste ;
 *   3. la reprise : ouvrir l'écran n'écrit rien et MONTRE l'union (« saisi dans le Cadre ») ; le premier geste qui écrit pour
 *      l'élève recopie le stock dans le registre et pose `reprise913` ; après quoi un résultat retiré ne revient pas ;
 *   4. les élèves NON inscrit·es dont le Cadre porte des résultats sont NOMMÉ·ES à l'écran ;
 *   5. « Retirer du registre » (décision 3.1 de Grégoire) : la confirmation DIT ce qu'elle emporte ; le geste efface l'élève,
 *      ses résultats, et les modèles devenus orphelins — pas ceux qu'un autre dossier référence ;
 *   6. les pluriels sont ACCORDÉS (« 1 séance », « 32 séances ») : plus aucun point médian de pluriel non calculé ;
 *   7. aucun mot en « captur* » dans ce que l'écran écrit (décision 3.2).
 *
 * Les gestes du vrai écran (Entrée, focus, mode archive, 768 px) sont jugés par le banc WebKit registre-longitudinal-915.spec.js.
 * La sortie dans l'export de recherche est tenue par sentinelle-913-resultats-ulterieurs.test.js.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase } from './_helpers/bac-suivi.js';

const NOM_CLE = 'registreLongitudinal';
const DA = '2000001';   // Alice Assidu : a2024 ET h2026
const DA2 = '2000002';  // Bruno Absent : a2024 seulement
const DA3 = '2000003';  // Chloé Cadre : a2024, jamais inscrite, mais le Cadre porte un résultat pour elle

function stock({ avecCadre = false } = {}) {
    const s = storeBase();
    Object.keys(s).filter((k) => k.startsWith('test_')).forEach((k) => delete s[k]);
    Object.assign(s, {
        trimestres: [
            { id: 'a2024', nom: 'Automne 2024', session: 'A', annee: 2024, actif: true, archive: true },
            { id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: false, archive: false }
        ],
        cours: [{ id: 'C101', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }],
        a2024_groupeEtudiants: [
            { da: DA, nom: 'Assidu', prenom: 'Alice', groupe: '00001', coursId: 'C101' },
            { da: DA2, nom: 'Absent', prenom: 'Bruno', groupe: '00001', coursId: 'C101' },
            { da: DA3, nom: 'Cadre', prenom: 'Chloé', groupe: '00001', coursId: 'C101' }
        ],
        h2026_groupeEtudiants: [{ da: DA, nom: 'Assidu', prenom: 'Alice', groupe: '00002', coursId: 'C101' }],
        a2024_evaluationsSauvegardees: [
            { id: 'E1', etudiantDA: DA, coursId: 'C101', grilleId: 'G1', echelleId: 'ECH1', criteres: [] },
            { id: 'E2', etudiantDA: DA2, coursId: 'C101', grilleId: 'G1', echelleId: 'ECH1', criteres: [] },
            { id: 'E3', etudiantDA: DA2, coursId: 'C101', grilleId: 'G2', criteres: [] }
        ],
        a2024_grillesTemplates: [{ id: 'G1', nom: 'Grille partagée', criteres: [] }, { id: 'G2', nom: 'Grille de Bruno', criteres: [] }],
        a2024_echellesTemplates: [{ id: 'ECH1', nom: 'IDME', niveaux: [] }],
        a2024_presences: [{ date: '2024-08-26', da: DA, coursId: 'C101', statut: 'present', heures: 2 }]
    });
    if (avecCadre) {
        s.a2024_resultatsUlterieurs = {
            [DA]: [{ cours: '601-102-MQ', trimestre: 'H2025', note: 78.5, intrus: 'ne voyage pas' }],
            [DA3]: [{ cours: '601-102-MQ', trimestre: 'H2025', note: 61 }]
        };
        // Le même résultat saisi aussi dans l'autre trimestre, plus un second : l'union ne double rien.
        s.h2026_resultatsUlterieurs = { [DA]: [{ cours: '601-102-MQ', trimestre: 'H2025', note: 78.5 }, { cours: '601-103-MQ', trimestre: 'A2025', note: 70 }] };
    }
    return s;
}

function banc(store) {
    store = store || stock();
    const b = monter(store, {
        modules: ['js/registre-longitudinal.js'],
        objetsExportes: ['registreLongitudinal'],
        globaux: {
            cle: (k) => 'a2024_' + k,
            cleSource: (k, t) => t + '_' + k,
            obtenirTrimestres: () => JSON.parse(JSON.stringify(store.trimestres))
        }
    });
    return Object.assign(b, { api: b.win.registreLongitudinal, mots: b.win.MOTS_REGISTRE_LONGITUDINAL });
}

const horsRegistre = (store) => JSON.stringify(Object.keys(store).filter((k) => k !== NOM_CLE).sort().map((k) => [k, store[k]]));
/** Tout le texte d'un sous-arbre du faux DOM (qui ne vide pas `children` : on lit le DERNIER rendu). */
const texteDe = (el) => [el.textContent].concat((el.children || []).map(texteDe)).filter(Boolean).join(' | ');
const dernier = (zone, classe) => zone.children.filter((c) => c.className === classe).pop();
const tous = (el, test, trouves = []) => { if (test(el)) trouves.push(el); (el.children || []).forEach((c) => tous(c, test, trouves)); return trouves; };

describe('#915 lot 3 — ajouter un résultat ultérieur', () => {
    it('se range sous l\'élève inscrit·e, trois champs et pas un de plus ; une seule écriture, sur le registre', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        b.journal.length = 0;
        const avant = horsRegistre(b.store);
        expect(await b.api.ajouterResultat(DA, { cours: ' 601-102-MQ ', trimestre: 'H2026', note: '78,5' })).toEqual({ ok: true });
        expect(await b.api.ajouterResultat(DA, { cours: '601-103-MQ', trimestre: 'A2026', note: '64' })).toEqual({ ok: true });
        expect(b.store[NOM_CLE].eleves[DA].resultatsUlterieurs).toEqual([
            { cours: '601-102-MQ', trimestre: 'H2026', note: 78.5 },
            { cours: '601-103-MQ', trimestre: 'A2026', note: 64 }
        ]);
        expect(b.journal.map((j) => j.k)).toEqual([NOM_CLE, NOM_CLE]);
        // Le trimestre ACTIF est archivé : rien n'y est écrit, et aucune permission n'est demandée — le registre n'est pas un trimestre.
        expect(horsRegistre(b.store)).toBe(avant);
    });

    it('un·e élève qui n\'est pas au registre est refusé·e, sans écriture', async () => {
        const b = banc();
        expect(await b.api.ajouterResultat(DA, { cours: '601-102-MQ', trimestre: 'H2026', note: '70' })).toEqual({ ok: false, refus: b.mots.refusEleve });
        expect(await b.api.ajouterResultat('', { cours: '601-102-MQ', trimestre: 'H2026', note: '70' })).toEqual({ ok: false, refus: b.mots.refusEleve });
        expect(b.journal).toEqual([]);
    });

    it.each([['0', 0], ['100', 100], ['78,5', 78.5], ['78.5', 78.5], [' 60 ', 60], ['78.56', 78.6]])('la note « %s » est lue %s', (saisie, attendu) => {
        expect(banc().api.lireNote(saisie)).toBe(attendu);
    });

    it.each(['-1', '100,1', '101', '1000', 'abc', '', '7e1', '78,5,2', '1 000', null, undefined])('la note « %s » n\'est pas écrite, et l\'écran le dit', async (saisie) => {
        const b = banc();
        await b.api.inscrire(DA);
        b.journal.length = 0;
        expect(await b.api.ajouterResultat(DA, { cours: '601-102-MQ', trimestre: 'H2026', note: saisie })).toEqual({ ok: false, refus: 'La note doit être un nombre entre 0 et 100.' });
        expect(b.journal).toEqual([]);
    });

    it('sans cours ou sans trimestre, rien n\'est écrit', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        b.journal.length = 0;
        expect(await b.api.ajouterResultat(DA, { cours: '  ', trimestre: 'H2026', note: '70' })).toEqual({ ok: false, refus: b.mots.refusTexte });
        expect(await b.api.ajouterResultat(DA, { cours: '601-102-MQ', trimestre: '', note: '70' })).toEqual({ ok: false, refus: b.mots.refusTexte });
        expect(b.journal).toEqual([]);
    });

    // Le trou R3 nommé au relais de 1.143.0 : `nettoyerTexte` pouvait perdre son .slice() sans qu'aucun essai rougisse.
    it('R3 · « Cours » et « Trimestre » sont bornés à 40 caractères AU STOCK, pas seulement par le maxlength du champ', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        await b.api.ajouterResultat(DA, { cours: 'C'.repeat(60), trimestre: '  ' + 'T'.repeat(55) + '  ', note: '70' });
        const [r] = b.store[NOM_CLE].eleves[DA].resultatsUlterieurs;
        expect(r.cours).toBe('C'.repeat(40));
        expect(r.trimestre).toBe('T'.repeat(40));
    });
});

describe('#915 lot 3 — retirer un résultat', () => {
    it('retire celui qu\'on vise et garde les autres ; un rang qui n\'existe pas n\'écrit rien', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        await b.api.ajouterResultat(DA, { cours: '601-102-MQ', trimestre: 'H2026', note: '78' });
        await b.api.ajouterResultat(DA, { cours: '601-103-MQ', trimestre: 'A2026', note: '64' });
        b.journal.length = 0;
        expect((await b.api.retirerResultat(DA, 5)).ok).toBe(false);
        expect((await b.api.retirerResultat(DA, -1)).ok).toBe(false);
        expect((await b.api.retirerResultat(DA2, 0)).ok).toBe(false);
        expect(b.journal).toEqual([]);
        expect(await b.api.retirerResultat(DA, 0)).toEqual({ ok: true });
        expect(b.store[NOM_CLE].eleves[DA].resultatsUlterieurs).toEqual([{ cours: '601-103-MQ', trimestre: 'A2026', note: 64 }]);
        expect(b.journal.map((j) => j.k)).toEqual([NOM_CLE]);
    });
});

describe('#915 lot 3 — la reprise du stock de #913 : lu, recopié au geste, jamais réécrit', () => {
    /** Un registre où Alice est inscrite DEPUIS LE LOT 2 (avant ce code) : pas de drapeau, pas de résultat. */
    async function inscriteAuLot2(store) {
        const b = banc(store);
        await b.api.inscrire(DA);
        delete store[NOM_CLE].eleves[DA].reprise913;
        store[NOM_CLE].eleves[DA].resultatsUlterieurs = [];
        b.journal.length = 0;
        return b;
    }

    it('ouvrir l\'écran N\'ÉCRIT RIEN, et montre l\'union sans doublon, en disant d\'où elle vient', async () => {
        const store = stock({ avecCadre: true });
        const b = await inscriteAuLot2(store);
        b.win.initialiserRegistreLongitudinal();
        expect(b.journal).toEqual([]);
        // h2026 est lu d'abord (le plus récent) : ses deux résultats, puis rien de a2024 — le sien est un doublon.
        expect(b.api.resultatsDe(store[NOM_CLE].eleves[DA])).toEqual([
            { cours: '601-102-MQ', trimestre: 'H2025', note: 78.5, origine: 'cadre' },
            { cours: '601-103-MQ', trimestre: 'A2025', note: 70, origine: 'cadre' }
        ]);
        const zone = b.elements['registre-longitudinal-conteneur'].children.find((c) => c.id === 'rl-zone-inscrits');
        const texte = texteDe(dernier(zone, 'rl-eleves'));
        expect(texte).toContain('601-102-MQ · H2025 · 78,5 — saisi dans le Cadre');
        expect(texte).toContain('601-103-MQ · A2025 · 70 — saisi dans le Cadre');
        expect(texte.match(/601-102-MQ · H2025/g)).toHaveLength(1);
    });

    it('le premier ajout recopie le stock dans le registre, pose le drapeau, et laisse l\'ancienne clé identique octet pour octet', async () => {
        const store = stock({ avecCadre: true });
        const b = await inscriteAuLot2(store);
        const avant = horsRegistre(store);
        await b.api.ajouterResultat(DA, { cours: '601-103-MQ', trimestre: 'A2026', note: '64' });
        const fiche = store[NOM_CLE].eleves[DA];
        expect(fiche.reprise913).toBe(true);
        expect(fiche.resultatsUlterieurs.map((r) => r.cours + ' ' + r.note + ' ' + (r.origine || ''))).toEqual([
            '601-102-MQ 78.5 cadre', '601-103-MQ 70 cadre', '601-103-MQ 64 '
        ]);
        expect(JSON.stringify(fiche)).not.toContain('intrus');
        expect(horsRegistre(store)).toBe(avant);
        expect(b.journal.map((j) => j.k)).toEqual([NOM_CLE]);
    });

    it('retirer un résultat venu du Cadre : il ne revient pas, ni à l\'écran ni au second geste — et le Cadre n\'a pas bougé', async () => {
        const store = stock({ avecCadre: true });
        const b = await inscriteAuLot2(store);
        const avant = horsRegistre(store);
        const vue = b.api.resultatsDe(store[NOM_CLE].eleves[DA]);
        const rang = vue.findIndex((r) => r.note === 78.5);
        expect(await b.api.retirerResultat(DA, rang)).toEqual({ ok: true });
        expect(b.api.resultatsDe(store[NOM_CLE].eleves[DA]).map((r) => r.note)).toEqual([70]);
        await b.api.inscrire(DA); // « Refaire la copie » ne ressuscite rien
        expect(b.api.resultatsDe(store[NOM_CLE].eleves[DA]).map((r) => r.note)).toEqual([70]);
        expect(horsRegistre(store)).toBe(avant);
    });

    it('« Inscrire » reprend le stock du Cadre au même geste, une seule écriture', async () => {
        const store = stock({ avecCadre: true });
        const b = banc(store);
        const avant = horsRegistre(store);
        await b.api.inscrire(DA3);
        expect(store[NOM_CLE].eleves[DA3].resultatsUlterieurs).toEqual([{ cours: '601-102-MQ', trimestre: 'H2025', note: 61, origine: 'cadre' }]);
        expect(store[NOM_CLE].eleves[DA3].reprise913).toBe(true);
        expect(b.journal.map((j) => j.k)).toEqual([NOM_CLE]);
        expect(horsRegistre(store)).toBe(avant);
    });

    it('les élèves NON inscrit·es dont le Cadre porte des résultats sont nommé·es à l\'écran, avec un compte accordé', async () => {
        const store = stock({ avecCadre: true });
        const b = banc(store);
        expect(b.api.enAttenteDuCadre()).toEqual([
            { da: DA, nom: 'Assidu', prenom: 'Alice', nb: 2 },
            { da: DA3, nom: 'Cadre', prenom: 'Chloé', nb: 1 }
        ]);
        await b.api.inscrire(DA);
        b.win.initialiserRegistreLongitudinal();
        const zone = b.elements['registre-longitudinal-conteneur'].children.find((c) => c.id === 'rl-zone-inscrits');
        const bloc = texteDe(dernier(zone, 'rl-en-attente'));
        expect(bloc).toContain(b.mots.enAttenteTitre);
        expect(bloc).toContain('Cadre, Chloé | 1 résultat ultérieur');
        expect(bloc).not.toContain('Assidu'); // inscrite : ses résultats sont sous son nom
        // Sans stock du Cadre : le bloc n'existe pas.
        const sans = banc();
        sans.win.initialiserRegistreLongitudinal();
        const zoneSans = sans.elements['registre-longitudinal-conteneur'].children.find((c) => c.id === 'rl-zone-inscrits');
        expect(dernier(zoneSans, 'rl-en-attente')).toBeUndefined();
    });
});

describe('#915 lot 3 — retirer du registre (décision 3.1 : un geste de réparation)', () => {
    it('efface l\'élève et ses résultats ; purge les modèles orphelins, GARDE ceux qu\'un autre dossier référence ; les trimestres ne bougent pas', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        await b.api.inscrire(DA2);
        await b.api.ajouterResultat(DA2, { cours: '601-102-MQ', trimestre: 'H2026', note: '51' });
        expect(Object.keys(b.store[NOM_CLE].modeles.grilles).sort()).toEqual(['a2024:G1', 'a2024:G2']);
        const avant = horsRegistre(b.store);
        b.journal.length = 0;
        expect(await b.api.retirerDuRegistre(DA2)).toEqual({ ok: true });
        expect(Object.keys(b.store[NOM_CLE].eleves)).toEqual([DA]);
        expect(Object.keys(b.store[NOM_CLE].modeles.grilles)).toEqual(['a2024:G1']);   // G2 n'était qu'à Bruno
        expect(Object.keys(b.store[NOM_CLE].modeles.echelles)).toEqual(['a2024:ECH1']); // ECH1 sert encore à Alice
        expect(JSON.stringify(b.store[NOM_CLE])).not.toContain(DA2);
        expect(b.journal.map((j) => j.k)).toEqual([NOM_CLE]);
        expect(horsRegistre(b.store)).toBe(avant);
        expect((await b.api.retirerDuRegistre(DA2)).ok).toBe(false);
        expect((await b.api.retirerDuRegistre('')).ok).toBe(false);
        expect(b.journal.map((j) => j.k)).toEqual([NOM_CLE]);
    });

    it('la confirmation DIT ce qu\'elle emporte : l\'élève, la copie, et chaque résultat ultérieur déjà saisi', async () => {
        const b = banc(stock({ avecCadre: true }));
        await b.api.inscrire(DA);
        await b.api.ajouterResultat(DA, { cours: '601-104-MQ', trimestre: 'A2026', note: '82,5' });
        b.win.initialiserRegistreLongitudinal();
        const zone = b.elements['registre-longitudinal-conteneur'].children.find((c) => c.id === 'rl-zone-inscrits');
        const [bouton] = tous(dernier(zone, 'rl-eleves'), (el) => el.getAttribute && el.getAttribute('data-action') === 'retirerEleveLongitudinal');
        expect(bouton.textContent).toBe('Retirer du registre');
        expect(bouton.dataset.da).toBe(DA);
        // Ni .btn-ajouter ni .btn-supprimer : la garde CSS du mode archive les fermerait, et le registre n'est pas un trimestre.
        expect(bouton.className).not.toMatch(/btn-supprimer|btn-ajouter|btn-modifier/);
        // #1007 (2a-2) : la question est posée par la fonction (après le codex proposé), plus par
        // le dispatcher ; l'attribut change de nom, les mots non.
        expect(bouton.getAttribute('data-confirm')).toBeNull();
        const dialogue = bouton.getAttribute('data-question');
        // Texte de Grégoire (1.146.1, relu avec Cowork le 18 sept.).
        expect(dialogue).toMatch(/^Retirer Assidu, Alice du registre \? Sa copie du \d{4}-\d{2}-\d{2} \(2 dossiers\) sera effacée et ne pourra pas être retrouvée\. Ses 3 résultats ultérieurs seront effacés aussi : /);
        expect(dialogue).toContain('601-102-MQ · H2025 · 78,5');
        expect(dialogue).toContain('601-103-MQ · A2025 · 70');
        expect(dialogue).toContain('601-104-MQ · A2026 · 82,5');
        expect(dialogue).toContain('Ce qui avait été saisi dans le Cadre reste rangé dans son trimestre.');
        expect(dialogue).toMatch(/Tes trimestres ne sont pas modifiés\.$/);
    });

    it('sans résultat ultérieur : la confirmation le dit aussi, au singulier quand il n\'y a qu\'un dossier', () => {
        const b = banc();
        const texte = b.mots.confirmerRetrait('Absent, Bruno', b.api.accorder(1, b.mots.dossiers), '2026-09-18', [], 0);
        expect(texte).toContain('Sa copie du 2026-09-18 (1 dossier) sera effacée');
        expect(texte).toContain('Aucun résultat ultérieur n\'a été saisi pour cet·te élève.');
        expect(texte).not.toContain('Cadre');
        // UN résultat : toute la phrase s'accorde au singulier ; sans date de copie, la phrase n'invente pas de date.
        const unSeul = b.mots.confirmerRetrait('X, Y', '1 dossier', '', ['A · B · 60'], 0);
        expect(unSeul).toContain('Sa copie (1 dossier) sera effacée');
        expect(unSeul).toContain('Son résultat ultérieur sera effacé aussi : A · B · 60. ');
        expect(unSeul).not.toMatch(/Ses \d|seront/);
        expect(b.mots.confirmerRetrait('X, Y', '1 dossier', '', ['A · B · 60', 'C · D · 70'], 0)).toContain('Ses 2 résultats ultérieurs seront effacés aussi : A · B · 60 ; C · D · 70. ');
    });

    it('le geste passe par le dispatcher fn(el), et l\'élève retiré·e quitte la liste ET le sélecteur de la saisie', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        await b.api.inscrire(DA2);
        b.win.initialiserRegistreLongitudinal();
        expect(await b.win.retirerEleveLongitudinal({ dataset: { da: DA2 } })).toEqual({ ok: true });
        expect(texteDe(dernier(b.elements['rl-zone-inscrits'], 'rl-eleves'))).not.toContain('Absent, Bruno');
        const selecteur = tous(dernier(b.elements['rl-zone-saisie'], 'rl-saisie'), (el) => el.name === 'eleve')[0];
        expect(selecteur.children.map((o) => o.value)).toEqual([DA]);
    });
});

describe('#915 lot 3 — la ligne de saisie unique', () => {
    const formulaireDe = (b) => dernier(b.elements['rl-zone-saisie'], 'rl-saisie');
    const champ = (b, nom) => tous(formulaireDe(b), (el) => el.name === nom)[0];
    /** Le geste tel que le dispatcher le livre : fn(el), `el` = le bouton, dont closest('form') rend le formulaire. */
    const soumettre = (b, valeurs) => b.win.ajouterResultatLongitudinal({ closest: () => ({ elements: {
        eleve: { value: valeurs.eleve }, cours: { value: valeurs.cours }, trimestre: { value: valeurs.trimestre }, note: { value: valeurs.note } } }) });

    it('aucun·e inscrit·e : la zone dit d\'inscrire d\'abord, sans formulaire', () => {
        const b = banc();
        b.win.initialiserRegistreLongitudinal();
        const zone = b.elements['registre-longitudinal-conteneur'].children.find((c) => c.id === 'rl-zone-saisie');
        expect(texteDe(zone)).toContain(b.mots.saisieSansInscrit);
        expect(dernier(zone, 'rl-saisie')).toBeUndefined();
    });

    it('[ Élève ] [ Cours ] [ Trimestre ] [ Note ] [ Ajouter ] : une seule ligne pour tous les inscrits, champs .rl-champ, zéro handler inline', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        await b.api.inscrire(DA2);
        b.win.initialiserRegistreLongitudinal();
        const zone = b.elements['registre-longitudinal-conteneur'].children.find((c) => c.id === 'rl-zone-saisie');
        const formulaire = dernier(zone, 'rl-saisie');
        const champs = tous(formulaire, (el) => !!el.name);
        expect(champs.map((c) => c.name)).toEqual(['eleve', 'cours', 'trimestre', 'note']);
        for (const c of champs) expect(c.className).toBe('controle-form rl-champ');
        expect(champs[0].children.map((o) => o.textContent)).toEqual(['Absent, Bruno', 'Assidu, Alice']);
        expect(champs[1].getAttribute('maxlength')).toBe('40');
        expect(champs[3].getAttribute('inputmode')).toBe('decimal');
        const bouton = tous(formulaire, (el) => el.getAttribute && el.getAttribute('data-action') === 'ajouterResultatLongitudinal')[0];
        expect(bouton.type).toBe('submit');
        expect(bouton.hasAttribute('data-prevent')).toBe(true);
        expect(bouton.className).not.toMatch(/btn-ajouter|btn-supprimer/);
    });

    it('après un ajout : le cours et le trimestre restent, l\'élève passe au suivant, le résultat paraît sous le bon nom', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        await b.api.inscrire(DA2);
        b.win.initialiserRegistreLongitudinal();
        expect(await soumettre(b, { eleve: DA2, cours: '601-102-MQ', trimestre: 'H2026', note: '51' })).toEqual({ ok: true });
        expect(champ(b, 'cours').value).toBe('601-102-MQ');
        expect(champ(b, 'trimestre').value).toBe('H2026');
        expect(champ(b, 'note').value).toBe('');
        expect(champ(b, 'eleve').children.filter((o) => o.selected).map((o) => o.value)).toEqual([DA]); // Bruno → Alice
        const lignes = dernier(b.elements['rl-zone-inscrits'], 'rl-eleves').children;
        expect(texteDe(lignes[0])).toContain('Absent, Bruno');
        expect(texteDe(lignes[0])).toContain('601-102-MQ · H2026 · 51');
        expect(texteDe(lignes[1])).not.toContain('601-102-MQ');
        // La dernière de la liste reste sur elle-même.
        await soumettre(b, { eleve: DA, cours: '601-102-MQ', trimestre: 'H2026', note: '80' });
        expect(champ(b, 'eleve').children.filter((o) => o.selected).map((o) => o.value)).toEqual([DA]);
    });

    it('un refus se dit sous la ligne, n\'écrit rien, et garde l\'élève choisi·e', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        await b.api.inscrire(DA2);
        b.win.initialiserRegistreLongitudinal();
        b.journal.length = 0;
        expect((await soumettre(b, { eleve: DA, cours: '601-102-MQ', trimestre: 'H2026', note: '140' })).ok).toBe(false);
        expect(b.journal).toEqual([]);
        const refus = b.elements['rl-zone-saisie'].children.filter((c) => c.className === 'rl-refus').pop();
        expect(refus.textContent).toBe('La note doit être un nombre entre 0 et 100.');
        expect(refus.getAttribute('role')).toBe('alert');
        expect(champ(b, 'eleve').children.filter((o) => o.selected).map((o) => o.value)).toEqual([DA]);
    });
});

describe('#915 lot 3 — les mots : pluriels accordés, et plus un seul « captur* »', () => {
    it('un helper, pas onze conditions : 0 et 1 au singulier, 2 et plus au pluriel', () => {
        const b = banc();
        expect([0, 1, 2, 32].map((n) => b.api.accorder(n, b.mots.seances))).toEqual(['0 séance', '1 séance', '2 séances', '32 séances']);
    });

    it('la ligne de résumé de la copie : « 1 évaluation · 1 séance · 1 grille : … · 2 dossiers », sans point médian', async () => {
        const b = banc();
        b.win.initialiserRegistreLongitudinal();
        b.win.choisirEleveLongitudinal({ dataset: { da: DA } });
        await b.win.inscrireEleveLongitudinal({ dataset: { da: DA } });
        const resume = b.elements['rl-choix'].children.filter((c) => c.className === 'rl-resume').pop().textContent;
        expect(resume).toMatch(/^1 évaluation · 1 séance · 1 grille : Grille partagée · 2 dossiers, \d+ Ko — Copie du \d{4}-\d{2}-\d{2}$/);
        await b.win.inscrireEleveLongitudinal({ dataset: { da: DA2 } });
        b.win.choisirEleveLongitudinal({ dataset: { da: DA2 } });
    });

    it('aucun mot de l\'écran ne porte un pluriel non calculé (« ·s ») ni « captur* »', () => {
        const b = banc();
        const aPlat = (v) => (typeof v === 'function' ? v('Nom, Prénom', '2 dossiers', '2026-09-18', ['A · B · 60'], 1) : Array.isArray(v) ? v.join(' ') : String(v));
        const mots = Object.values(b.mots).map(aPlat).join(' \n ');
        expect(mots).not.toMatch(/·s\b/);
        expect(mots).not.toMatch(/captur/i);
    });
});
