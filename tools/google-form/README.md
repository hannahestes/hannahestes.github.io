# Website updater (Google Form → GitHub)

A Google Form whose submissions commit straight to this repo. Each submission becomes one commit on `main`
(the YAML edit plus any uploaded files), and GitHub Pages rebuilds the site. You get an email with the
commit link, or with the error and your answers if something went wrong.

| Form choice | Edits | Files go to |
|---|---|---|
| News update | top of `_data/updates.yaml` | `assets/img/updates/` |
| New paper / research project | top of `_data/research.yaml` | `assets/img/`, `assets/papers/`, `assets/slides/` |
| Change an existing paper | one field of a paper in `_data/research.yaml` | same as above |
| Gallery photo | top of `_data/gallery.yaml` | `assets/memo/` |
| Resource / helpful-link card | end of `_data/resources.yaml` | n/a |
| New CV (PDF) | overwrites the file `resume:` points to | `assets/doc/` |
| Profile / about info | any top-level value in `_data/about.yaml`, plus the profile picture | `assets/img/` |

Picking "Other" for a category creates the category too. After each submission the dropdowns (categories,
paper titles) refresh from the repo automatically.

## One-time setup (~10 min)

1. **Create a GitHub token.** GitHub → Settings → Developer settings → Fine-grained tokens → *Generate new token*.
   - Repository access: *Only select repositories* → `hannahestes.github.io`
   - Permissions: *Contents* → **Read and write**
   - Pick an expiration and set a reminder to renew it; submissions fail with a 401 once it expires.
2. **Create the script.** Go to <https://script.google.com> → *New project*, name it "Website updater", and
   replace `Code.gs` with the contents of [`Code.gs`](Code.gs).
3. **Add the token.** ⚙️ *Project Settings* → *Script Properties* → add `GITHUB_TOKEN` = your token.
   Optional properties (defaults in brackets):
   - `ALLOWED_EMAILS` [`hmestes@ncsu.edu`]: comma-separated; submissions from anyone else are ignored
   - `NOTIFY_EMAIL` [the script owner]
   - `GITHUB_REPO` [`hannahestes/hannahestes.github.io`], `GITHUB_BRANCH` [`main`]
   - `MY_NAME` [`Hannah Estes`]: bolded automatically in author lists
4. **Build the form.** In the editor pick `setup` from the function dropdown → *Run* → approve the permissions.
   The execution log prints the form's edit and fill-in links.
5. **Turn on file uploads.** Apps Script can't create File upload questions, so the file questions start out as
   short-answer questions marked 📎. Open the form's edit link and, for each of these, change the question
   type to **File upload** (keep the title exactly as is; allow the file types you want):
   `Update picture`, `Paper graphic`, `Paper PDF`, `Slides file`, `Poster file`, `Replacement file`,
   `Gallery photo`, `CV PDF`, `Profile picture`.
   Until you do this you can paste a Google Drive link into those questions instead.
6. Bookmark the fill-in link. Keep it private: the email check blocks others from committing, but there's
   no reason to hand out the link.

## Notes

- Uploaded files keep their original name (spaces → `_`) and get `_2`, `_3`, … appended if the name is taken.
  Uploads also stay in your Google Drive under the form's upload folder.
- The script edits the YAML as text, so comments and formatting are preserved. It never deletes entries;
  remove or reorder things by editing the files directly.
- **Run `git pull` before editing locally**, since the form commits to `main` behind your back.
- If you add a new question or content type, add its title to `Q` and a handler to `KINDS` in `Code.gs`.
  The titles are how responses are matched up, so don't rename questions in the form editor.
- To start over, delete the `FORM_ID` script property and run `setup` again. The old form and trigger stay
  until you delete them (*Triggers* ⏰ in the left sidebar).
