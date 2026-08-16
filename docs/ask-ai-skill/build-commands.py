#!/usr/bin/env python3
"""Split the master SKILL.md into one skill file per slash command.

GoHighLevel's Ask AI shows ONE slash-menu entry per uploaded skill, so to get
/image, /adset, /video … as real menu items, each command needs its own file.
Each generated file is self-contained (GHL only injects the invoked skill):
what FreshGen is + that command's procedure + only the shared sections that
command needs + the BRAND block for generating commands + money/retry/delivery
rules. Everything is copied verbatim from the master, so editing the master
and re-running this script keeps all of them in sync.

Usage:  python3 build-commands.py   (from this directory)
Output: ./commands/<command>/SKILL.md
"""

import re
from pathlib import Path

HERE = Path(__file__).parent
MASTER = (HERE / "SKILL.md").read_text()
OUT = HERE / "commands"

# ── Parse the master into sections ─────────────────────────────────────────
# Strip the frontmatter: file starts with "---\n", frontmatter ends at the next "\n---\n".
body = re.sub(r"\A---\n.*?\n---\n", "", MASTER, count=1, flags=re.S)

sections = {}
for m in re.finditer(r"^## (\d+)\. (.+?)\n(.*?)(?=^## \d+\. |\Z)", body, re.S | re.M):
    sections[int(m.group(1))] = (m.group(2).strip(), m.group(3).strip())

commands_body = sections[2][1]
cmd_blocks = {}
for m in re.finditer(r"^### `/(\w+)([^`]*)`\n(.*?)(?=^### `/|\Z)", commands_body, re.S | re.M):
    cmd_blocks[m.group(1)] = (m.group(2).strip(), m.group(3).strip())

def sec(n: int) -> str:
    title, text = sections[n]
    return f"## {title}\n\n{text}"

# ── Per-command metadata ───────────────────────────────────────────────────
GENERATING = {"image", "variations", "adset", "video", "animate"}
NEEDS_SIZES = {"image", "variations", "adset"}
NEEDS_MODELS = GENERATING | {"models"}

DESCRIPTIONS = {
    "image": "image — FreshGen /image: generate ONE AI image with generate_image. Use when the user types /image, or asks to create, make, generate, design or render a single picture, photo, graphic, hero image, banner, thumbnail, product shot or social visual.",
    "variations": "variations — FreshGen /variations: several genuinely different takes on one image concept. Use when the user types /variations, or asks for options, alternatives, a few versions, or 'show me some ideas' for an image.",
    "adset": "adset — FreshGen /adset: one concept rendered across ad/social sizes (1:1, 9:16, 16:9 by default). Use when the user types /adset, or asks for an ad set, campaign creatives, all the sizes, or the same image for feed + story + banner.",
    "video": "video — FreshGen /video: start a short AI video render with generate_video. Use when the user types /video, or asks for a clip, reel, short video, motion ad, or animation from a text description.",
    "animate": "animate — FreshGen /animate: turn an existing image URL into a short video. Use when the user types /animate, or asks to animate, bring to life, or add motion to an image they already have.",
    "status": "status — FreshGen /status: check whether an image or video generation is finished, using its taskId. Use when the user types /status, asks 'is my video ready', or wants the result of an earlier generation.",
    "credits": "credits — FreshGen /credits: report the connected Kie.ai balance in credits and dollars. Use when the user types /credits or asks about balance, spend, or how much generation is left.",
    "models": "models — FreshGen /models: list the available image and video models, what each is best at, and what they cost. Use when the user types /models or asks which model to use, what's available, or prices.",
    "save": "save — FreshGen /save: copy an image or video URL into the GoHighLevel Media Library permanently. Use when the user types /save or asks to keep, store, or save a generated or external media file.",
    "brand": "brand — FreshGen /brand: show the brand style block that gets applied to every generation. Use when the user types /brand or asks what brand settings, colors, or style FreshGen is using.",
    "help": "help — FreshGen /help: list every FreshGen slash command and what it does. Use when the user types /help or asks what FreshGen can do.",
}

TITLES = {
    "image": "one image", "variations": "several different takes", "adset": "one concept, every size",
    "video": "short video from text", "animate": "video from an existing image", "status": "check a render",
    "credits": "Kie.ai balance", "models": "which model, what cost", "save": "save to the Media Library",
    "brand": "show the brand block", "help": "list the commands",
}

# ── Assemble ───────────────────────────────────────────────────────────────
OUT.mkdir(exist_ok=True)
written = []
for cmd, (sig, proc) in cmd_blocks.items():
    parts = [
        f"# {cmd}",
        "",
        f"**Skill name:** `{cmd}` — FreshGen /{cmd}: {TITLES[cmd]}.",
        "",
        sec(1),
        "",
        f"## The `/{cmd}` command",
        "",
        f"Signature: `/{cmd} {sig}`" if sig else f"Signature: `/{cmd}`",
        "",
        "When a message begins with this command, follow the procedure below exactly. It also applies when the request is phrased naturally.",
        "",
        proc,
    ]
    if cmd == "help":
        # /help needs the full command table to print.
        table = commands_body.split("### `/", 1)[0].strip()
        parts += ["", "## All FreshGen commands", "", table,
                  "", "Each command is its own skill in this workspace — the user can pick any of them from the slash menu."]
    if cmd in GENERATING:
        parts += ["", sec(3)]
    if cmd in NEEDS_MODELS:
        parts += ["", sec(4)]
    if cmd in NEEDS_SIZES:
        parts += ["", sec(5)]
    if cmd in GENERATING or cmd == "brand":
        parts += ["", sec(6)]
    parts += ["", sec(7), "", sec(8), "", sec(9)]

    text = "\n".join(parts).rstrip() + "\n"
    fm = f"---\nname: {cmd}\ndescription: {DESCRIPTIONS[cmd]}\n---\n\n"
    dest = OUT / cmd / "SKILL.md"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(fm + text)
    written.append((cmd, len(text.split())))

for cmd, words in written:
    print(f"commands/{cmd}/SKILL.md  {words} words")
