// =======================================================================
// LE NEUVIÈME PARCOURS, « SUIVRE TON GROUPE PAR CIBLES », « JE REGARDE » — 23 NOVEMBRE 2026 : LES MOTS, DANS LES DEUX SENS
// =======================================================================
// plans de travail/CONSIGNE-2026-11-22-parcours-9-je-regarde.md. Ce banc lit la consigne elle-même et le VRAI
// js/parcours-cibles.js, chargé dans un bac à sable, et exige, bulle par bulle, les mêmes titres, confirmations, phrases
// du lieu, explications, gestes, lignes en gris et formes successives (les crochets de la consigne), dans le même ordre :
// ce que la consigne dit et que le code ne dit pas rougit, et l'inverse.
//
// LA LECTURE DE LA CONSIGNE. « Bulle N « Titre ». … » ouvre une bulle ; « (petit) » : l'entrée à la bulle 1, la
// confirmation ensuite ; « (gris) » : une ligne en petit, grise ; « → » : le geste ; « [ … ] » ouvre la forme suivante de
// la bulle, et ce qui suit le crochet en est la première ligne ; une parenthèse qui FINIT une ligne de geste ou de
// boutons est une note pour Claude Code, pas un mot de la bulle (la règle du 22 nov.) ; « ─── Objectif atteint ─── »,
// « Suite suggérée : … » et « Boutons : … » sont la fin, que le moteur pose.
//
// BREAK-TESTS (23 nov. 2026), chacun rouge puis remis à l'identique :
//   BT1. un mot de la bulle 9 changé dans le code (« le meilleur inscrit » → « le plus haut inscrit ») → bulle 9 rouge.
//   BT2. la seconde forme de la bulle 5 retirée du code → bulle 5 rouge.
//   BT3. la ligne grise de la bulle 7 retirée du code → bulle 7 rouge.
//   BT4. `lancer` ajouté à la définition (un second temps) → « un seul temps » rouge.
//   BT5. 'cibles' retiré de PARCOURS_OUVERTS → « ouvert » rouge.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-2026-11-22-parcours-9-je-regarde.md');

/** Une ligne de la consigne, en ligne du code : ['c', geste] (sans la note finale), ['gris', …], ['n', explication]. */
function ligneDe(l) {
    if (/^→ /.test(l)) return ['c', l.slice(2).replace(/ \([^()]*\)$/, '')];
    if (/^\(gris\) /.test(l)) return ['gris', l.slice('(gris) '.length)];
    return ['n', l];
}

/** Les douze bulles de la consigne : { rang, titre, petit, objectif, lieu, lignes, puis, atteint, suite, boutons }. */
function bullesDeLaConsigne() {
    const debut = CONSIGNE.indexOf('\nBulle 1 «');
    const fin = CONSIGNE.indexOf('\nVÉRIFIER :');
    if (debut === -1 || fin === -1) throw new Error('la consigne a changé de forme');
    const bulles = [];
    let b = null, forme = null;
    for (const brut of CONSIGNE.slice(debut, fin).split('\n')) {
        const l = brut.trim();
        if (!l) continue;
        const tete = /^Bulle (\d+) « (.+?) »/.exec(l);
        if (tete) {
            b = { rang: Number(tete[1]), titre: tete[2], petit: null, objectif: null, lieu: null, lignes: [], puis: [], atteint: false, suite: null, boutons: null };
            forme = b.lignes;
            bulles.push(b);
            continue;
        }
        if (/^\(petit\) /.test(l)) { b.petit = l.slice('(petit) '.length); continue; }
        if (/^─── Objectif atteint ───$/.test(l)) { b.atteint = true; continue; }
        if (/^Suite suggérée : /.test(l)) { b.suite = l; continue; }
        if (/^Boutons : /.test(l)) { b.boutons = l.replace(/ \([^()]*\)\.?$/, ''); continue; }
        const crochet = /^\[[^\]]*\] (.*)$/.exec(l);
        if (crochet) { forme = []; b.puis.push(forme); forme.push(ligneDe(crochet[1])); continue; }
        if (forme === b.lignes && !b.lignes.length) {
            if (/^À la fin de ce parcours, /.test(l)) { b.objectif = l; continue; }
            if (!b.lieu && /^Tu es (dans «|au profil) /.test(l)) { b.lieu = l; continue; }
        }
        forme.push(ligneDe(l));
    }
    return bulles;
}

function charger() {
    const enregistres = [];
    const win = { addEventListener() {}, removeEventListener() {}, Assistance: { enregistrer: (d) => enregistres.push(d) } };
    chargerScript('js/parcours-cibles.js', { db: { getSync: (k, d) => d } }, win);
    return { P: win.ParcoursCibles, def: enregistres[0] };
}

const { P, def } = charger();
const consigne = bullesDeLaConsigne();
// Devant « % », le code écrit l'espace insécable (la règle des nombres à la française, #1137) : ramenée à une espace ici.
const plat = (lignes) => lignes.map(([g, t]) => [g, t.replace(/\u00a0/g, ' ')]);
const vuDuCode = (t, k) => ({ titre: t.titre, petit: k === 0 ? null : (t.confirme || null), lieu: t.lieu || null, lignes: plat(t.lignes), puis: (t.puis || []).map(plat) });
const vuDeLaConsigne = (c, k) => ({ titre: c.titre, petit: k === 0 ? null : c.petit, lieu: c.lieu, lignes: c.lignes, puis: c.puis });

describe('« Je regarde », les douze bulles, mot pour mot', () => {
    it('douze bulles, de part et d\'autre, dans l\'ordre', () => {
        expect(consigne.map((b) => b.rang)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        expect(P.textes).toHaveLength(12);
        expect(P.etapesModele).toHaveLength(12);
        expect(def.totalModele).toBe(12);
        expect(P.etapesModele.map((e) => e.titre)).toEqual(consigne.map((b) => b.titre));
    });

    it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])('bulle %i : mêmes mots, même ordre, mêmes formes, dans les deux sens', (n) => {
        expect(vuDuCode(P.textes[n - 1], n - 1)).toEqual(vuDeLaConsigne(consigne[n - 1], n - 1));
    });

    it('ce que la lecture de la consigne retient : les formes, les lignes grises, les notes hors des bulles', () => {
        expect(consigne.map((b) => b.puis.length)).toEqual([0, 0, 0, 1, 2, 0, 1, 2, 1, 0, 0, 0]);
        expect(consigne.filter((b) => b.lignes.some((l) => l[0] === 'gris')).map((b) => b.rang)).toEqual([4, 7]);
        expect(consigne[3].lignes[2]).toEqual(['gris', P.poignee]);
        expect(consigne[9].lignes[2], 'la parenthèse qui finit le geste de la bulle 10 est une note, pas un mot de la bulle').toEqual(['c', 'Touche « Suivant »']);
        expect(consigne.map((b) => b.lieu ? b.rang : 0).filter(Boolean)).toEqual([1, 3, 11]);
    });

    it('l\'entrée, l\'objectif, l\'objectif atteint, la ligne du panneau', () => {
        expect(consigne[0].petit).toBe(`Parcours ${def.rang} · ${def.titre} · Je regarde`);
        expect(def.rang).toBe(9);
        expect(consigne[0].objectif).toBe(P.objectif);
        expect([P.definitionModele.objectif, P.definitionModele.objectifAtteint]).toEqual([P.objectif, P.objectifAtteint]);
        // « ─── Objectif atteint ─── » : la phrase suit la règle des autres parcours (l'objectif, repris).
        expect(consigne[11].atteint).toBe(true);
        expect(P.objectifAtteint).toBe(P.objectif.replace('À la fin de ce parcours, tu seras en mesure de', 'Objectif atteint : tu es en mesure de'));
        expect(CONSIGNE).toContain(`sous son titre, la ligne : « ${def.ligne} »`);
        expect(CONSIGNE).toContain(`LE PARCOURS 9 devient « ${def.titre} »`);
    });

    it('la fin : la suite suggérée est le parcours 6, « Mettre tes données à l\'abri » ; deux boutons, pas de « Le refaire avec ma classe »', () => {
        expect(consigne[11].suite).toBe('Suite suggérée : le parcours 6, « Mettre tes données à l\'abri ».');
        expect(consigne[11].boutons).toBe('Boutons : « Voir le parcours 6 » · « Terminer »');
        expect(def.suite).toBe('donnees');
        const donnees = lire('js/parcours-donnees.js');
        expect(donnees).toMatch(/var ID = 'donnees';/);
        expect(donnees).toContain('titre: "Mettre tes données à l\'abri",');
        // La phrase et le libellé sont composés par le panneau, à partir du rang et du titre du parcours nommé.
        const panneau = lire('js/assistance.js');
        expect(panneau).toContain("libelle: 'Voir le parcours ' + n,");
        expect(panneau).toContain("phrase: 'Suite suggérée : le parcours ' + n + ', « ' + s.titre + ' ».',");
        expect(panneau).toMatch(/var nommee = def && def\.suite \? definitionDe\(def\.suite\) : null;/);
        expect(lire('js/parcours-cibles.js')).not.toContain('mots.refaire');
    });
});

describe('un seul temps, ouvert, à la place de l\'ancien neuvième parcours', () => {
    it('un seul temps : « Je regarde », aucune Pratique guidée ; « Refaire » défait ce que le modèle a posé', () => {
        expect(typeof def.lancerModele).toBe('function');
        expect(typeof def.defaireModele).toBe('function');
        expect('lancer' in def, 'aucun « Nous faisons »').toBe(false);
        expect('total' in def).toBe(false);
        const panneau = lire('js/assistance.js');
        expect(panneau).toMatch(/function seulementModele\(def\) \{\s*return !!def && typeof def\.lancerModele === 'function' && typeof def\.lancer !== 'function';/);
        expect(panneau).toContain("li.dataset.temps = unSeul ? 'un' : 'deux';");
    });

    it('ouvert : PARCOURS_OUVERTS porte « cibles », plus « notation-alternative »', () => {
        const liste = /var PARCOURS_OUVERTS = \[([^\]]*)\];/.exec(lire('js/assistance.js'))[1];
        expect(liste.split(',').map((x) => x.trim().replace(/'/g, ''))).toEqual(
            ['decouvrir', 'classe', 'evaluer', 'recevoir', 'monter', 'donnees', 'lire-ta-classe', 'commentaires', 'cibles']);
        expect(def.id).toBe('cibles');
    });

    it('l\'ancien parcours est retiré, pas gardé à côté', () => {
        expect(existsSync(path.join(RACINE, 'js/parcours-notation-alternative.js'))).toBe(false);
        const html = lire('index.html');
        expect(html).not.toContain('parcours-notation-alternative');
        expect(html).toMatch(/<script src="js\/parcours-cibles\.js\?v=[^"]+"><\/script>/);
        expect(lire('js/preferences.js')).not.toMatch(/^\s*parcoursNotationAlternative:/m);
    });

    it('l\'histoire vient du pack ; « Remplir » passe par celui des modèles (rien hors de la démo) ; la date de (a) est celle de l\'histoire', () => {
        const code = lire('js/parcours-cibles.js');
        expect(code).toContain('bloc.histoire.inscriptions');
        expect(code).toMatch(/function remplir\(geste\) \{ return K\(\) && typeof K\(\)\.remplir === 'function' \? K\(\)\.remplir\(geste\) : false; \}/);
        expect(code).toContain('window.ObservationCibles.dater(a.date)');
        expect(code).toContain("if (cleI.indexOf('demo_') !== 0) return false;");
        expect(lire('js/observation-cibles.js')).toMatch(/function dater\(date\) \{/);
        // Les mots de l'histoire que les bulles citent sont ceux du pack.
        const pack = chargerScript('js/pack-demo-10.js').PACK_DEMARRAGE.groupeParStandards;
        const [a, b, c] = pack.histoire.inscriptions;
        const dit = (k, forme) => P.textes[k].puis[forme].map((l) => l[1]).join(' ');
        expect(dit(4, 0)).toContain(`« ${a.noteBreve} »`);
        expect(dit(6, 0)).toContain(`« ${b.noteBreve} »`);
        expect(dit(7, 1)).toContain(`« ${c.noteBreve} »`);
        const titres = pack.productions.map((p) => p.titre.replace(/ /g, ' '));
        expect(dit(6, 0)).toContain(`« ${titres[0]} »`);
        expect(dit(7, 1)).toContain(`« ${titres[1]} »`);
        expect([a.date, b.date, c.date]).toEqual(['2025-09-11', '2025-09-17', '2025-10-01']);
    });
});
