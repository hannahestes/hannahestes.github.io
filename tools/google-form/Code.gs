/**
 * Website updater: a Google Form that edits this Jekyll site.
 *
 * setup()          builds the form and installs the submit trigger (run once).
 * onFormSubmit(e)  turns a response into one commit on GitHub (YAML edits + uploaded files).
 * refreshChoices() re-reads the repo and updates the dropdowns (runs after every submit).
 *
 * YAML files are edited as text, never re-serialized, so comments and formatting survive.
 * See README.md in this folder for setup.
 */

const DEFAULTS = {
  GITHUB_REPO: 'hannahestes/hannahestes.github.io',
  GITHUB_BRANCH: 'main',
  ALLOWED_EMAILS: 'hmestes@ncsu.edu',
  MY_NAME: 'Hannah Estes',
};

const FILES = {
  updates: '_data/updates.yaml',
  research: '_data/research.yaml',
  gallery: '_data/gallery.yaml',
  resources: '_data/resources.yaml',
  about: '_data/about.yaml',
};

// Question titles double as the keys used to read responses, so they must stay unique.
const Q = {
  kind: 'What are you adding?',

  updDesc: 'Update text',
  updTime: 'When',
  updHighlight: 'Text to highlight',
  updLinkText: 'Text to turn into a link',
  updLinkUrl: 'Link URL',
  updPicture: 'Update picture',

  paperTitle: 'Paper title',
  paperSystem: 'System name',
  paperVenue: 'Venue',
  paperVenueUrl: 'Venue website',
  paperStatus: 'Status',
  paperAuthors: 'Authors',
  paperAbstract: 'Abstract',
  paperCategory: 'Paper category',
  paperTag: 'Paper tag',
  paperCode: 'Code link',
  paperDemo: 'Demo link',
  paperTalk: 'Talk video link',
  paperDoi: 'DOI link',
  paperGraphic: 'Paper graphic',
  paperPdf: 'Paper PDF',
  paperSlides: 'Slides file',
  paperPoster: 'Poster file',

  editPaper: 'Which paper?',
  editField: 'Field to change',
  editValue: 'New value',
  editFile: 'Replacement file',

  photo: 'Gallery photo',
  photoCaption: 'Photo caption',
  photoYear: 'Photo year',
  photoCategory: 'Photo category',

  resTitle: 'Resource title',
  resSummary: 'Resource summary',
  resContent: 'Resource content',
  resCategory: 'Resource category',

  cv: 'CV PDF',

  aboutField: 'Profile field',
  aboutValue: 'New profile value',
  aboutPic: 'Profile picture',
};

const KINDS = [
  { key: 'update', label: 'News update (timeline)', handler: addUpdate_ },
  { key: 'paper', label: 'New paper / research project', handler: addPaper_ },
  { key: 'editPaper', label: 'Change an existing paper (status, links, files)', handler: editPaper_ },
  { key: 'photo', label: 'Gallery photo', handler: addPhoto_ },
  { key: 'resource', label: 'Resource / helpful-link card', handler: addResource_ },
  { key: 'cv', label: 'New CV (PDF)', handler: replaceCv_ },
  { key: 'about', label: 'Profile / about info', handler: editAbout_ },
];

// "Field to change" choices for existing papers. Entries with `dir` accept a file upload.
const PAPER_FIELDS = {
  'Status': { key: 'status' },
  'Title': { key: 'title' },
  'Venue': { key: 'conference' },
  'Venue website': { key: 'conference-web' },
  'Authors': { key: 'authors' },
  'System name': { key: 'system-name' },
  'Code link': { key: 'code' },
  'Demo link': { key: 'demo' },
  'Talk video link': { key: 'talk' },
  'DOI link': { key: 'doi' },
  'Paper PDF': { key: 'pdf', dir: 'assets/papers' },
  'Slides': { key: 'slides', dir: 'assets/slides' },
  'Poster': { key: 'poster', dir: 'assets/papers' },
  'Graphic': { key: 'gif', dir: 'assets/img' },
};

// Top-level about.yaml keys the form does not offer (lists, or handled by their own questions).
const ABOUT_SKIP = ['research-interests', 'profile-pic', 'resume'];

const FILE_HELP = '📎 In the form editor, change this question\'s type to "File upload" (keep the title). ' +
  'Until then you can paste a Google Drive link here.';

// ───────────────────────────── setup ─────────────────────────────

function setup() {
  const props = PropertiesService.getScriptProperties();
  const existing = props.getProperty('FORM_ID');
  if (existing) {
    throw new Error('A form already exists: ' + FormApp.openById(existing).getEditUrl() +
      '\nRun refreshChoices() to update its dropdowns, or delete the FORM_ID script property to build a new one.');
  }
  if (!prop_('GITHUB_TOKEN')) throw new Error('Set the GITHUB_TOKEN script property first (see README.md).');

  const choices = readChoiceData_(new Repo_());
  const form = FormApp.create('Website updater');
  form.setDescription('Each submission becomes one commit to ' + prop_('GITHUB_REPO') +
    '. You get an email with the commit link (or the error) a minute later.');
  form.setConfirmationMessage('Got it! Watch your inbox for the commit link. The site rebuilds a minute or two after that.');
  requireVerifiedEmail_(form);

  const kindItem = form.addMultipleChoiceItem().setTitle(Q.kind).setRequired(true);
  const pages = {};
  const section = (key, title, help) => {
    const page = form.addPageBreakItem().setTitle(title).setHelpText(help || '');
    // A page break's goTo applies to the section *before* it, so every section after the
    // first ends the form for the one above it.
    if (Object.keys(pages).length) page.setGoToPage(FormApp.PageNavigationType.SUBMIT);
    pages[key] = page;
  };
  const text = (title, help, required) =>
    form.addTextItem().setTitle(title).setHelpText(help || '').setRequired(!!required);
  const para = (title, help, required) =>
    form.addParagraphTextItem().setTitle(title).setHelpText(help || '').setRequired(!!required);
  const file = (title, help, required) => text(title, (help ? help + '\n' : '') + FILE_HELP, required);
  const pick = (title, values, help, required) => form.addMultipleChoiceItem().setTitle(title)
    .setHelpText(help || '').setChoiceValues(values).showOtherOption(true).setRequired(!!required);
  const dropdown = (title, values, help, required) => form.addListItem().setTitle(title)
    .setHelpText(help || '').setChoiceValues(values).setRequired(!!required);

  section('update', 'News update', 'Added to the top of the updates timeline (_data/updates.yaml).');
  para(Q.updDesc, 'HTML is allowed, e.g. <highlight>accepted</highlight> or <a target="_blank" href="…">…</a>.', true);
  text(Q.updTime, 'e.g. "July 2026". Leave blank for the current month.');
  text(Q.updHighlight, 'Optional: this exact text will be wrapped in <highlight>.');
  text(Q.updLinkText, 'Optional: this exact text becomes the link (otherwise a "link" is appended).');
  text(Q.updLinkUrl, 'Optional.');
  file(Q.updPicture, 'Optional image, saved to assets/img/updates/.');

  section('paper', 'New paper / research project', 'Added to the top of the research list (_data/research.yaml).');
  text(Q.paperTitle, '', true);
  text(Q.paperAuthors, 'Comma-separated. "' + prop_('MY_NAME') + '" gets bolded automatically.', true);
  text(Q.paperVenue, 'e.g. "VL/HCC" or "FSE-SEET (Trondheim, Norway)".');
  text(Q.paperVenueUrl);
  text(Q.paperStatus, 'e.g. "Accepted!" or "Currently Under Review". Leave blank once published.');
  para(Q.paperAbstract, 'Paste the whole abstract. It is split automatically at the "See More" link.', true);
  pick(Q.paperCategory, choices.paperCats, 'Pick "Other" to create a new category.', true);
  text(Q.paperSystem, 'Optional.');
  text(Q.paperTag, 'Optional short id, e.g. "spm_edu". Generated from the title if blank.');
  text(Q.paperCode, 'Optional URL.');
  text(Q.paperDemo, 'Optional URL.');
  text(Q.paperTalk, 'Optional URL.');
  text(Q.paperDoi, 'Optional, e.g. https://doi.org/10.1145/…');
  file(Q.paperGraphic, 'Image shown beside the paper. Saved to assets/img/.');
  file(Q.paperPdf, 'Saved to assets/papers/. Leave blank to use the "not yet" placeholder.');
  file(Q.paperSlides, 'Optional. Saved to assets/slides/.');
  file(Q.paperPoster, 'Optional. Saved to assets/papers/.');

  section('editPaper', 'Change an existing paper', 'Changes one field of a paper already on the site.');
  dropdown(Q.editPaper, choices.paperTitles, '', true);
  dropdown(Q.editField, Object.keys(PAPER_FIELDS), '', true);
  text(Q.editValue, 'New text or URL. Leave blank if you are uploading a file below, or to clear the field.');
  file(Q.editFile, 'For Paper PDF / Slides / Poster / Graphic only.');

  section('photo', 'Gallery photo', 'Added to the top of the gallery (_data/gallery.yaml).');
  file(Q.photo, 'Saved to assets/memo/.', true);
  text(Q.photoCaption, '', true);
  text(Q.photoYear, 'Leave blank for this year.');
  pick(Q.photoCategory, choices.photoCats, 'Pick "Other" to create a new category.', true);

  section('resource', 'Resource card', 'Added to the end of the resources list (_data/resources.yaml).');
  text(Q.resTitle, '', true);
  text(Q.resSummary, 'Optional one-liner shown on the card.');
  para(Q.resContent, 'Markdown, shown when the card is opened. e.g. "- <https://example.com> : what it is"', true);
  pick(Q.resCategory, choices.resCats, 'Pick "Other" to create a new category.', true);

  section('cv', 'New CV', 'Replaces the PDF linked from the CV icon.');
  file(Q.cv, 'PDF only.', true);

  section('about', 'Profile / about info', 'Changes a value in _data/about.yaml. Fill in a field, a picture, or both.');
  dropdown(Q.aboutField, choices.aboutKeys, 'Optional.');
  para(Q.aboutValue, 'The new value. HTML is allowed in the paragraphs. Leave blank to clear the field.');
  file(Q.aboutPic, 'Optional new profile picture (square works best).');

  kindItem.setChoices(KINDS.map(k => kindItem.createChoice(k.label, pages[k.key])));

  props.setProperty('FORM_ID', form.getId());
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();

  const fileQuestions = [Q.updPicture, Q.paperGraphic, Q.paperPdf, Q.paperSlides, Q.paperPoster,
    Q.editFile, Q.photo, Q.cv, Q.aboutPic];
  console.log('Form created.\n  Edit: ' + form.getEditUrl() + '\n  Fill: ' + form.getPublishedUrl() +
    '\n\nLast step: in the editor, change these questions to "File upload" (keep their titles):\n  - ' +
    fileQuestions.join('\n  - '));
}

/** Updates the dropdowns (categories, paper titles, profile fields) from the repo. */
function refreshChoices() {
  const form = FormApp.openById(prop_('FORM_ID'));
  const c = readChoiceData_(new Repo_());
  const item = title => form.getItems().find(i => i.getTitle() === title);
  const setMc = (title, values) => { const i = item(title); if (i && values.length) i.asMultipleChoiceItem().setChoiceValues(values); };
  const setList = (title, values) => { const i = item(title); if (i && values.length) i.asListItem().setChoiceValues(values); };
  setMc(Q.paperCategory, c.paperCats);
  setMc(Q.photoCategory, c.photoCats);
  setMc(Q.resCategory, c.resCats);
  setList(Q.editPaper, c.paperTitles);
  setList(Q.aboutField, c.aboutKeys);
}

function readChoiceData_(repo) {
  const research = repo.readText(FILES.research);
  return {
    paperCats: parseCategories_(research).map(c => c.name),
    photoCats: parseCategories_(repo.readText(FILES.gallery)).map(c => c.name),
    resCats: parseCategories_(repo.readText(FILES.resources)).map(c => c.name),
    paperTitles: [...research.matchAll(/^  - title:\s*(.*)$/gm)].map(m => unquote_(m[1])),
    aboutKeys: [...repo.readText(FILES.about).matchAll(/^([\w-]+):/gm)]
      .map(m => m[1]).filter(k => !ABOUT_SKIP.includes(k)),
  };
}

function requireVerifiedEmail_(form) {
  try {
    form.setEmailCollectionType(FormApp.EmailCollectionType.VERIFIED);
  } catch (err) {
    form.setCollectEmail(true);
  }
}

// ───────────────────────────── submit ─────────────────────────────

function onFormSubmit(e) {
  const answers = {};
  e.response.getItemResponses().forEach(r => { answers[r.getItem().getTitle()] = r.getResponse(); });
  const email = e.response.getRespondentEmail();
  const lock = LockService.getScriptLock();
  lock.waitLock(5 * 60 * 1000);
  try {
    const allowed = prop_('ALLOWED_EMAILS').toLowerCase().split(/[\s,]+/).filter(Boolean);
    if (!email || !allowed.includes(email.toLowerCase())) {
      throw new Error('Submission from "' + (email || 'unknown') + '" is not in ALLOWED_EMAILS, so it was ignored.');
    }
    const kind = KINDS.find(k => k.label === answers[Q.kind]);
    if (!kind) throw new Error('Unknown choice for "' + Q.kind + '": ' + answers[Q.kind]);

    const result = commitWithRetry_(repo => kind.handler(repo, answers));
    let body = 'Commit: ' + result.url + '\n\nThe site rebuilds in a minute or two. Run `git pull` before editing locally.';
    if (result.warnings.length) body += '\n\nWarnings:\n- ' + result.warnings.join('\n- ');
    notify_('✅ Website: ' + result.summary, body);
    try { refreshChoices(); } catch (err) { console.warn('refreshChoices failed: ' + err); }
  } catch (err) {
    console.error(err);
    notify_('❌ Website update failed', String(err.stack || err) + '\n\nYour answers:\n' + JSON.stringify(answers, null, 2));
  } finally {
    lock.releaseLock();
  }
}

/** Runs `build` against a fresh view of the branch and commits; retries once if main moved underneath. */
function commitWithRetry_(build) {
  for (let attempt = 1; ; attempt++) {
    const repo = new Repo_();
    const out = build(repo);
    try {
      const url = repo.commit('Website form: ' + out.summary);
      return { url, summary: out.summary, warnings: out.warnings || [] };
    } catch (err) {
      if (attempt >= 2 || err.status !== 422) throw err;
    }
  }
}

function notify_(subject, body) {
  const to = prop_('NOTIFY_EMAIL') || Session.getEffectiveUser().getEmail();
  MailApp.sendEmail(to, subject, body);
}

// ───────────────────────────── handlers ─────────────────────────────
// Each takes (repo, answers), stages changes on `repo`, and returns { summary, warnings }.

function addUpdate_(repo, a) {
  const warnings = [];
  let desc = oneLine_(a[Q.updDesc]);
  if (a[Q.updHighlight]) {
    desc = wrapFirst_(desc, oneLine_(a[Q.updHighlight]), t => '<highlight>' + t + '</highlight>', warnings);
  }
  const url = oneLine_(a[Q.updLinkUrl]);
  if (url) {
    const link = t => '<a target="_blank" href="' + url + '">' + t + '</a>';
    const linkText = oneLine_(a[Q.updLinkText]);
    desc = linkText && desc.includes(linkText) ? wrapFirst_(desc, linkText, link, warnings) : desc + ' ' + link(linkText || 'link');
  }
  const picture = uploadFile_(repo, a[Q.updPicture], 'assets/img/updates');
  const entry = [
    '  - picture: ' + yamlScalar_(picture),
    '    desc: ' + yamlScalar_(desc),
    '    time: ' + yamlScalar_(oneLine_(a[Q.updTime]) || monthYear_(new Date())),
  ];
  repo.writeText(FILES.updates, listInsertTop_(repo.readText(FILES.updates), 'updates:', entry));
  return { summary: 'add update "' + truncate_(desc.replace(/<[^>]+>/g, ''), 50) + '"', warnings };
}

function addPaper_(repo, a) {
  const warnings = [];
  const title = oneLine_(a[Q.paperTitle]);
  const category = resolveCategory_(repo, FILES.research, oneLine_(a[Q.paperCategory]) || 'other');
  const existing = repo.readText(FILES.research);
  const tags = [...existing.matchAll(/^\s+tag:\s*(\S+)/gm)].map(m => m[1]);
  const tag = uniqueName_(slug_(a[Q.paperTag] || title.split(/\s+/).slice(0, 5).join(' '), '_'), tags);
  const [less, more] = splitAbstract_(a[Q.paperAbstract]);
  const pdf = uploadFile_(repo, a[Q.paperPdf], 'assets/papers');
  if (!pdf) warnings.push('No PDF uploaded, so the paper links to assets/papers/blank_notyet.pdf.');

  const entry = [
    '  - title: ' + yamlScalar_(title),
    '    system-name: ' + yamlScalar_(oneLine_(a[Q.paperSystem])),
    '    gif: ' + yamlScalar_(uploadFile_(repo, a[Q.paperGraphic], 'assets/img')),
    '    conference: ' + yamlScalar_(oneLine_(a[Q.paperVenue])),
    '    conference-web: ' + yamlScalar_(oneLine_(a[Q.paperVenueUrl])),
    '    status: ' + yamlScalar_(oneLine_(a[Q.paperStatus])),
    '    authors: ' + yamlScalar_(boldMe_(oneLine_(a[Q.paperAuthors]))),
    '    pdf: ' + yamlScalar_(pdf || 'assets/papers/blank_notyet.pdf'),
    '    code: ' + yamlScalar_(oneLine_(a[Q.paperCode])),
    '    demo: ' + yamlScalar_(oneLine_(a[Q.paperDemo])),
    '    slides: ' + yamlScalar_(uploadFile_(repo, a[Q.paperSlides], 'assets/slides')),
    '    talk: ' + yamlScalar_(oneLine_(a[Q.paperTalk])),
    '    doi: ' + yamlScalar_(oneLine_(a[Q.paperDoi])),
    '    poster: ' + yamlScalar_(uploadFile_(repo, a[Q.paperPoster], 'assets/papers')),
    ...blockScalar_('    ', 'abstract-less', less, '>-'),
    ...blockScalar_('    ', 'abstract-more', more, '>-'),
    '    tag: ' + tag,
    '    category: ' + category,
  ];
  repo.writeText(FILES.research, listInsertTop_(existing, 'projects:', entry));
  return { summary: 'add paper "' + truncate_(title, 50) + '"', warnings };
}

function editPaper_(repo, a) {
  const warnings = [];
  const title = a[Q.editPaper];
  const field = PAPER_FIELDS[a[Q.editField]];
  if (!field) throw new Error('Unknown field: ' + a[Q.editField]);

  let value = oneLine_(a[Q.editValue]);
  if (a[Q.editFile]) {
    if (!field.dir) throw new Error('"' + a[Q.editField] + '" does not take a file.');
    value = uploadFile_(repo, a[Q.editFile], field.dir);
  }
  if (field.key === 'authors') value = boldMe_(value);
  if (field.key === 'title' && !value) throw new Error('A paper title cannot be blank.');

  const lines = repo.readText(FILES.research).split('\n');
  const start = lines.findIndex(l => { const m = l.match(/^  - title:\s*(.*)$/); return m && unquote_(m[1]) === title; });
  if (start < 0) throw new Error('Could not find a paper titled "' + title + '".');
  let end = start + 1;
  while (end < lines.length && !/^ {0,2}\S/.test(lines[end])) end++;

  const prefix = field.key === 'title' ? '  - title:' : '    ' + field.key + ':';
  const newLine = prefix + ' ' + yamlScalar_(value);
  const at = field.key === 'title' ? start : lines.slice(start, end).findIndex(l => l.startsWith(prefix)) + start;
  if (at >= start) {
    lines[at] = newLine;
  } else {
    let last = end - 1;
    while (last > start && !lines[last].trim()) last--;
    lines.splice(last + 1, 0, newLine);
  }
  repo.writeText(FILES.research, lines.join('\n'));
  return { summary: 'set ' + field.key + ' of "' + truncate_(title, 40) + '"', warnings };
}

function addPhoto_(repo, a) {
  const source = uploadFile_(repo, a[Q.photo], 'assets/memo');
  if (!source) throw new Error('No photo was uploaded.');
  const category = resolveCategory_(repo, FILES.gallery, oneLine_(a[Q.photoCategory]));
  const caption = oneLine_(a[Q.photoCaption]);
  const entry = [
    '  - source: ' + yamlScalar_(source),
    '    caption: ' + yamlScalar_(caption),
    '    year: ' + yamlScalar_(oneLine_(a[Q.photoYear]) || String(new Date().getFullYear())),
    '    category: ' + category,
  ];
  repo.writeText(FILES.gallery, listInsertTop_(repo.readText(FILES.gallery), 'pictures:', entry));
  return { summary: 'add photo "' + truncate_(caption, 50) + '"', warnings: [] };
}

function addResource_(repo, a) {
  const category = resolveCategory_(repo, FILES.resources, oneLine_(a[Q.resCategory]));
  const title = oneLine_(a[Q.resTitle]);
  const entry = [
    '  - title: ' + yamlScalar_(title),
    '    summary: ' + yamlScalar_(oneLine_(a[Q.resSummary])),
    ...blockScalar_('    ', 'content', a[Q.resContent], '|-'),
    '    category: ' + category,
  ];
  repo.writeText(FILES.resources, listAppend_(repo.readText(FILES.resources), 'links:', entry));
  return { summary: 'add resource "' + truncate_(title, 50) + '"', warnings: [] };
}

function replaceCv_(repo, a) {
  const warnings = [];
  const file = driveFile_(a[Q.cv]);
  if (!file) throw new Error('No CV was uploaded.');
  if (file.getMimeType() !== MimeType.PDF) warnings.push('The uploaded file is ' + file.getMimeType() + ', not a PDF.');

  const m = repo.readText(FILES.about).match(/^resume:\s*(\S+)/m);
  const path = m && !/^https?:/.test(m[1]) ? m[1] : null;
  if (path) {
    repo.writeBytes(path, file.getBlob().getBytes());
  } else {
    const newPath = uploadFile_(repo, a[Q.cv], 'assets/doc');
    repo.writeText(FILES.about, setTopLevel_(repo.readText(FILES.about), 'resume', newPath));
  }
  return { summary: 'update CV', warnings };
}

function editAbout_(repo, a) {
  const changed = [];
  let text = repo.readText(FILES.about);
  const pic = uploadFile_(repo, a[Q.aboutPic], 'assets/img');
  if (pic) {
    text = setTopLevel_(text, 'profile-pic', pic);
    changed.push('profile-pic');
  }
  const key = a[Q.aboutField];
  if (key) {
    text = setTopLevel_(text, key, String(a[Q.aboutValue] || '').trim());
    changed.push(key);
  }
  if (!changed.length) throw new Error('Nothing to change: pick a profile field or upload a picture.');
  repo.writeText(FILES.about, text);
  return { summary: 'update ' + changed.join(', '), warnings: [] };
}

// ───────────────────────────── YAML text editing ─────────────────────────────

const isComment_ = line => line.trim().startsWith('#');
const isTopLevelKey_ = line => /^\S/.test(line) && !isComment_(line);

function findKey_(lines, key) {
  const i = lines.findIndex(l => l === key || l.startsWith(key + ' ') || l.startsWith(key + '#'));
  if (i < 0) throw new Error('Could not find "' + key + '" in the file.');
  return i;
}

/** Inserts `entry` (lines) as the first item of the list under top-level `key`. */
function listInsertTop_(text, key, entry) {
  const lines = text.split('\n');
  let i = findKey_(lines, key) + 1;
  while (i < lines.length && !isTopLevelKey_(lines[i]) && !(/^\s*- /.test(lines[i]) && !isComment_(lines[i]))) i++;
  const atItem = i < lines.length && !isTopLevelKey_(lines[i]);
  lines.splice(i, 0, ...entry, ...(atItem ? [''] : []));
  return lines.join('\n');
}

/** Appends `entry` (lines) as the last item of the list under top-level `key`. */
function listAppend_(text, key, entry) {
  const lines = text.split('\n');
  const start = findKey_(lines, key);
  let end = start + 1;
  while (end < lines.length && !isTopLevelKey_(lines[end])) end++;
  let last = end - 1;
  while (last > start && !lines[last].trim()) last--;
  lines.splice(last + 1, 0, '', ...entry);
  return lines.join('\n');
}

/** Replaces (or appends) a top-level `key: value`, including any indented continuation lines. */
function setTopLevel_(text, key, value) {
  const lines = text.split('\n');
  const newLines = value.length > 80 || value.includes('\n')
    ? blockScalar_('', key, value, '>-')
    : [key + ': ' + yamlScalar_(value)];
  const start = lines.findIndex(l => l.startsWith(key + ':'));
  if (start < 0) {
    lines.push(...newLines);
    return lines.join('\n');
  }
  let end = start + 1;
  for (let j = end; j < lines.length; j++) {
    if (/^\s+\S/.test(lines[j])) end = j + 1;
    else if (lines[j].trim()) break;
  }
  lines.splice(start, end - start, ...newLines);
  return lines.join('\n');
}

/** [{ filter, name }] for each uncommented category in a file's `categories:` list. */
function parseCategories_(text) {
  const cats = [];
  text.split('\n').filter(l => !isComment_(l)).forEach(l => {
    let m;
    if ((m = l.match(/^\s*-\s*data-filter:\s*(.*)$/))) cats.push({ filter: unquote_(m[1]), name: '' });
    else if ((m = l.match(/^\s+category-name:\s*(.*)$/)) && cats.length) cats[cats.length - 1].name = unquote_(m[1]);
  });
  return cats.map(c => ({ filter: c.filter, name: c.name || c.filter }));
}

/** Returns the data-filter for a category name, adding the category to the file if it is new. */
function resolveCategory_(repo, path, name) {
  if (!name) throw new Error('A category is required.');
  const text = repo.readText(path);
  const hit = parseCategories_(text).find(c => c.name.toLowerCase() === name.toLowerCase() || c.filter === name);
  if (hit) return hit.filter;
  const filter = slug_(name, '-');
  repo.writeText(path, listAppend_(text, 'categories:', [
    '  - data-filter: ' + filter,
    '    category-name: ' + yamlScalar_(name),
  ]));
  return filter;
}

/** A single-line YAML value: bare when unambiguous, otherwise single-quoted. */
function yamlScalar_(value) {
  const s = oneLine_(value);
  if (!s) return '';
  const safe = /^[A-Za-z0-9][^'"#]*$/.test(s) && !/:(\s|$)/.test(s) && !/^(true|false|yes|no|on|off|null|~)$/i.test(s);
  return safe ? s : "'" + s.replace(/'/g, "''") + "'";
}

/** `key: >-` (folded, wrapped at ~80 cols) or `key: |-` (lines kept) block scalar. */
function blockScalar_(indent, key, value, style) {
  const body = indent + '  ';
  const raw = String(value || '').replace(/\r\n?/g, '\n').replace(/^\s*\n/, '').replace(/\s+$/, '');
  if (!raw.trim()) return [indent + key + ': '];
  if (style === '|-') {
    return [indent + key + ': |-', ...raw.replace(/^[ \t]+/, '').split('\n').map(l => (l.trim() ? body + l : ''))];
  }
  const out = [indent + key + ': >-'];
  let line = '';
  raw.split(/\s+/).forEach(word => {
    if (line && line.length + word.length + 1 > 80) { out.push(body + line); line = word; } else line = line ? line + ' ' + word : word;
  });
  if (line) out.push(body + line);
  return out;
}

function unquote_(s) {
  s = String(s).replace(/\s+#.*$/, '').trim();
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
  return s;
}

// ───────────────────────────── text helpers ─────────────────────────────

const oneLine_ = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
const truncate_ = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const monthYear_ = d => Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMMM yyyy');

function slug_(s, sep) {
  return oneLine_(s).toLowerCase().replace(/[^a-z0-9]+/g, sep).replace(new RegExp('^\\' + sep + '+|\\' + sep + '+$', 'g'), '').slice(0, 40) || 'item';
}

function uniqueName_(name, taken) {
  let out = name;
  for (let n = 2; taken.includes(out); n++) out = name + '_' + n;
  return out;
}

function wrapFirst_(text, needle, wrap, warnings) {
  const i = text.indexOf(needle);
  if (i < 0) {
    warnings.push('"' + needle + '" was not found in the text, so it was not wrapped.');
    return text;
  }
  return text.slice(0, i) + wrap(needle) + text.slice(i + needle.length);
}

function boldMe_(authors) {
  const me = prop_('MY_NAME');
  return authors.includes(me) && !authors.includes('<b>' + me + '</b>') ? authors.replace(me, '<b>' + me + '</b>') : authors;
}

/** Splits an abstract into the part shown up front and the part behind "See More". */
function splitAbstract_(abstract, shownWords) {
  const words = oneLine_(abstract).split(' ').filter(Boolean);
  const cut = shownWords || 65;
  if (words.length <= cut + 15) return [words.join(' '), ''];
  return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
}

// ───────────────────────────── files ─────────────────────────────

/** The Drive file from a File-upload answer (array of ids) or a pasted Drive link. */
function driveFile_(answer) {
  if (!answer || (Array.isArray(answer) && !answer.length)) return null;
  const id = Array.isArray(answer) ? answer[0] : (String(answer).match(/[-\w]{25,}/) || [])[0];
  if (!id) throw new Error('Could not find a Google Drive file id in "' + answer + '".');
  return DriveApp.getFileById(id);
}

/** Stages an uploaded file under `dir` and returns its repo path ('' if no file was given). */
function uploadFile_(repo, answer, dir) {
  const file = driveFile_(answer);
  if (!file) return '';
  // Forms names uploads "original - Respondent Name.ext"; drop the respondent part.
  const name = file.getName().replace(/ - [^.]*(\.[A-Za-z0-9]+)$/, '$1');
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name).replace(/\s+/g, '_').replace(/[^\w.-]/g, '') || 'file';
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : '';
  let path = dir + '/' + base + ext;
  for (let n = 2; repo.exists(path); n++) path = dir + '/' + base + '_' + n + ext;
  repo.writeBytes(path, file.getBlob().getBytes());
  return path;
}

// ───────────────────────────── GitHub ─────────────────────────────

function prop_(key) {
  return PropertiesService.getScriptProperties().getProperty(key) || DEFAULTS[key] || '';
}

/** A snapshot of the branch head that stages changes and commits them all at once. */
class Repo_ {
  constructor() {
    this.name = prop_('GITHUB_REPO');
    this.branch = prop_('GITHUB_BRANCH');
    this.headSha = this.api_('GET', '/git/ref/heads/' + this.branch).object.sha;
    this.baseTree = this.api_('GET', '/git/commits/' + this.headSha).tree.sha;
    this.changes = new Map();
    this.paths_ = null;
  }

  api_(method, path, body) {
    const options = {
      method,
      muteHttpExceptions: true,
      headers: {
        Authorization: 'Bearer ' + prop_('GITHUB_TOKEN'),
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };
    if (body) {
      options.contentType = 'application/json';
      options.payload = JSON.stringify(body);
    }
    const res = UrlFetchApp.fetch('https://api.github.com/repos/' + this.name + path, options);
    const code = res.getResponseCode();
    if (code >= 300) {
      const err = new Error('GitHub ' + method + ' ' + path + ' → ' + code + ': ' + res.getContentText().slice(0, 500));
      err.status = code;
      throw err;
    }
    return JSON.parse(res.getContentText());
  }

  exists(path) {
    if (!this.paths_) {
      this.paths_ = new Set(this.api_('GET', '/git/trees/' + this.baseTree + '?recursive=1').tree.map(t => t.path));
    }
    return this.changes.has(path) || this.paths_.has(path);
  }

  readText(path) {
    const staged = this.changes.get(path);
    if (staged) return staged.text;
    const res = this.api_('GET', '/contents/' + path.split('/').map(encodeURIComponent).join('/') + '?ref=' + this.headSha);
    return Utilities.newBlob(Utilities.base64Decode(res.content.replace(/\n/g, ''))).getDataAsString('UTF-8');
  }

  writeText(path, text) { this.changes.set(path, { text }); }

  writeBytes(path, bytes) { this.changes.set(path, { bytes }); }

  /** Commits every staged change as one commit and returns its URL. */
  commit(message) {
    if (!this.changes.size) throw new Error('Nothing to commit.');
    const tree = [];
    this.changes.forEach((c, path) => {
      const blob = c.bytes
        ? this.api_('POST', '/git/blobs', { content: Utilities.base64Encode(c.bytes), encoding: 'base64' })
        : this.api_('POST', '/git/blobs', { content: c.text, encoding: 'utf-8' });
      tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
    });
    const newTree = this.api_('POST', '/git/trees', { base_tree: this.baseTree, tree });
    const commit = this.api_('POST', '/git/commits', { message, tree: newTree.sha, parents: [this.headSha] });
    this.api_('PATCH', '/git/refs/heads/' + this.branch, { sha: commit.sha });
    return commit.html_url;
  }
}
