"""Build index.html from index.src.html and projects.json.

The 11 project cards live in projects.json so that the same text feeds the page
(real HTML, readable without JavaScript and by search engines) and the 3D scene.

    python build.py
"""
from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
GITHUB = "https://github.com/martinezramirezaxelalejandro04-ui/"


def stop(index: int, project: dict, themes: dict) -> str:
    number = f"{index + 1:02d}"
    # Towers alternate sides of the avenue; the card sits on the opposite side.
    side = "right" if index % 2 == 0 else "left"
    esc = lambda text: html.escape(text, quote=True)
    return f"""      <article class="stop project {side}" data-stop data-project="{project['id']}" id="p-{project['id']}">
        <div class="card">
          <p class="kicker"><span class="num">{number}</span><span data-p="theme">{esc(themes[project['theme']]['es'])}</span></p>
          <p class="figure" data-p="figure">{esc(project['figure']['es'])}</p>
          <p class="label" data-p="label">{esc(project['label']['es'])}</p>
          <h3 data-p="title">{esc(project['title']['es'])}</h3>
          <p class="question" data-p="question">{esc(project['question']['es'])}</p>
          <div class="actions">
            <button type="button" class="btn primary" data-open="{project['id']}" data-i="open">Explorar la torre</button>
            <a class="link" href="{GITHUB}{project['id']}" rel="noopener" data-i="code">Código ↗</a>
          </div>
        </div>
      </article>"""


def menu_item(index: int, project: dict) -> str:
    title = html.escape(project["title"]["es"], quote=True)
    return (f'      <li><button type="button" data-open="{project["id"]}">'
            f'<span class="mn">{index + 1:02d}</span><span class="mt">{title}</span></button></li>')


def main() -> None:
    data = json.loads((ROOT / "projects.json").read_text(encoding="utf-8"))
    source = (ROOT / "index.src.html").read_text(encoding="utf-8")
    projects = data["projects"]
    stops = "\n".join(stop(i, p, data["themes"]) for i, p in enumerate(projects))
    menu = "\n".join(menu_item(i, p) for i, p in enumerate(projects))
    page = source.replace("<!--PROJECT_STOPS-->", stops).replace("<!--PROJECT_MENU-->", menu)
    (ROOT / "index.html").write_text(page, encoding="utf-8", newline="\n")
    print(f"index.html written with {len(projects)} project stops")


if __name__ == "__main__":
    main()
