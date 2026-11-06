// Contre-épreuve « cause tardive » : pour chaque pause gardée, une cause qui arrive DANS la fenêtre,
// après ce qu'une attente sur condition aurait déjà rendu. L'essai doit la voir (rouge).
const ERR = "throw new Error('cause tardive du banc')";
const Q = "const t = document.getElementById('ui-dialogue-titre') || document.body.appendChild(Object.assign(document.createElement('h2'), { id: 'ui-dialogue-titre' })); t.textContent = 'Question tardive du banc';";
const TOAST = "window.__toasts.push('modifié tardif du banc')";
const SUCCES = "window.temoinEnregistrement.enregistre('banc-tardif')";
const ECHEC = "window.temoinEnregistrement.nonEnregistre('cause tardive du banc', 'Banc', 'banc-tardif')";
const ALERTE = "alert('refus tardif du banc')";
const AJOUT = (c) => `const k = cle('${c}'); db.setSync(k, [...(db.getSync(k, []) || []), { id: 'TARDIF_BANC', nom: 'Tardif banc', titre: 'Tardif banc', da: '9999999' }]);`;
const AJOUT_GLOBAL = (c) => `db.setSync('${c}', [...(db.getSync('${c}', []) || []), { id: 'TARDIF_BANC', nom: 'Tardif banc' }]);`;
const CLE = "db.setSync('cleTardiveDuBanc', 1)";
const DEFAIRE = "const k = cle('grillesTemplates'); const gs = db.getSync(k, []) || []; gs.forEach((g) => { if ((g.criteres || []).length) g.criteres.pop(); }); db.setSync(k, gs);";
export const CAUSES = {
  'bibliotheque-deux-colonnes-1157.spec.js': [["window.__metadonnees.push(['tardive'])"], ["window.__questions.push('tardive')"]],
  'cartouche-copie-evaluee-fait-foi-946.spec.js': [["window._journal946.push('CT946R')", 2500, 137]],
  'chaines-etapes-1149-lot-3b.spec.js': [[CLE, 500, 'Échelles : la chaîne paraît'], [ERR], [CLE, 250], [ERR], [ERR, 250], [ERR], [ERR]],
  'chaines-etapes-1149.spec.js': [[ERR, 450], [ERR, 250], [ERR]],
  'compte-erreurs-autre-copie-1142.spec.js': [["const k = 't1142_evaluationsSauvegardees'; const l = db.getSync(k, []); l.find((x) => x.id === 'EVA1142').donneesAlgorithmiques.c2.erreurs = 11; db.setSync(k, l);", 2500, 144]],
  'ecraser-homonyme-employe-967.spec.js': [[ALERTE, 800], [ALERTE], [ALERTE, 800], [ALERTE], [ALERTE, 800], [ALERTE], [ALERTE]],
  'evaluation-959-neutralite-chargeur.spec.js': [["window.evaluationEnCours.cartoucheId = 'TARDIF'; const k = 't959_evaluationsSauvegardees'; const l = db.getSync(k, []); l.find((x) => x.id === 'EV959').cartoucheId = 'TARDIF'; db.setSync(k, l);", 2500, 166]],
  'evaluation-961-retroaction-ne-suit-plus-les-niveaux.spec.js': [["document.body.appendChild(Object.assign(document.createElement('div'), { id: 'overlay-ui-dialogue' }))", 2500, 'R2 · stock sans clé']],
  'grille-critere-ajoute-enregistrer-957.spec.js': [[DEFAIRE, 600, 93], [DEFAIRE, 600]],
  'lot-e1-conception-creer-ou-modifier.spec.js': [[AJOUT('grillesTemplates')], [AJOUT('grillesTemplates')], [Q], [AJOUT('grillesTemplates'), 250], [AJOUT('grillesTemplates'), 250], [SUCCES], [TOAST], ["document.getElementById('nomCartouche').value = 'Renommée tardive'"], ["const k = cle('echellesTemplates'); db.setSync(k, []);"]],
  'lot-e2-cadre-creer-ou-modifier.spec.js': [[TOAST, 600], [ECHEC], [AJOUT_GLOBAL('trimestres')], ["db.setSync('trimestres', [{ id: 'TARDIF_BANC', actif: true }, ...(db.getSync('trimestres', []) || [])])"], [AJOUT('cours')], [AJOUT('cours'), 300], [AJOUT('horaires')], [AJOUT('horaires'), 300], [AJOUT('groupesCours')], [AJOUT('groupesCours'), 300], [AJOUT('groupeEtudiants'), 300], [SUCCES], [TOAST, 300], [CLE.replace('cleTardiveDuBanc', 'trimestreActif')]],
  'lot-e3-creer-ou-modifier.spec.js': [[TOAST, 700], [Q], [AJOUT('productions')], [AJOUT('productions')], [Q], [AJOUT('productions')], [SUCCES], ["const k = cle('productions'); const l = db.getSync(k, []); l.forEach((p) => { p.titre = 'Tardif'; }); db.setSync(k, l);"], [AJOUT('presences')], [AJOUT('presences')], [AJOUT('presences'), 700], ["const k = cle('presences'); const l = db.getSync(k, []) || []; const r = l.find((p) => p.facultatif && p.date === '2026-09-10'); if (r) { l.push({ ...r }); db.setSync(k, l); } else { throw new Error('banc : aucun report à doubler'); }", 900], [AJOUT('interventions')], [AJOUT('interventions')], [Q], [AJOUT('interventions'), 500], ["const k = cle('confidentielEtudiants'); const c = db.getSync(k, {}) || {}; c.TARDIF_BANC = { epgc: true }; db.setSync(k, c);"], [SUCCES]],
  'note-remise-1173.spec.js': [["document.getElementById('noteProduction1').textContent = '99 %'", 2500, 153]],
  'ouverture-sans-geste-981-983.spec.js': [["db.setSync('cours', db.getSync('cours', null))", 4000, 83]],
  'solo-suit-le-reglage-1117.spec.js': [["const k = cle('grillesTemplates'); const gs = db.getSync(k, []) || []; gs.forEach((g) => (g.criteres || []).forEach((c) => { if (c.niveauSOLO) c.niveauSOLO = 'tardif'; })); db.setSync(k, gs);", 800]]
};
