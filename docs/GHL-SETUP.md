# Connecting FreshGen Link to GoHighLevel

Two ways to plug FreshGen Link into GoHighLevel. Pick based on what you're building — most people only need Path 1.

Quick context: MCP (Model Context Protocol) is just the plumbing that lets GHL's AI call outside tools — in this case, your FreshGen Link server. You don't need to understand how it works to use it. You just need your MCP URL and one of the two paths below.

**Contents:** [Which path do I need?](#which-path-do-i-need) · [Before you start](#before-you-start) · [Path 1: Ask AI](#path-1-ask-ai-primary) · [Path 2: Workflow AI Agent](#path-2-workflow-ai-agent) · [If a connection won't work](#if-a-connection-wont-work) · [Notes](#notes) · [What each tool does](#what-each-tool-does)

## Which path do I need?

| Path | Use it for |
|---|---|
| **1. Ask AI** (primary) | Everyday chat — you or your team asking the AI to generate images or video on demand. Start here. |
| **2. Workflow AI Agent** | Automations — generation as a step inside a workflow, e.g. auto-creating a hero image when a new contact comes in. |

If you're not sure, you want Path 1. It covers the vast majority of real use — someone typing a request into Ask AI and getting media back. Path 2 exists for when generation needs to run without a person asking for it in the moment.

## Before you start

Have these two things ready:

- **Your MCP URL** — copy it from your dashboard at `https://your-app.vercel.app/s/<your-secret>`. Use the copy button there rather than typing it from memory.
- **A name for the connector** — "FreshGen" works fine.

That's it. Every path below uses that same URL — you're just pasting it into a different part of GHL depending on how you want to use it.

**Lite or Full?** Both paths work on both tiers. Lite has no video tool.

---

## Path 1: Ask AI (primary)

<!-- screenshot: GHL Ask AI panel with the + connector icon highlighted -->

1. Open **Ask AI** in GoHighLevel.
2. Click the **+** icon → **Manage Connectors**.
3. Click **+ Add custom MCP**.
4. Fill in:
   - **Name:** "FreshGen"
   - **MCP server URL:** your `https://your-app.vercel.app/mcp/<secret>` URL
5. Click **Add MCP**. Leave the Advanced section alone — the defaults are correct.
6. If GHL shows a tool list after adding, tick every tool.

<!-- screenshot: Add custom MCP form filled in with name and URL -->

Done. Two fields, and your AI agent can generate images and video whenever it's asked.

### Try it

Paste these into Ask AI, one at a time:

- **"Generate a 16:9 image of a modern kitchen at golden hour."**
  Expect an image back in under a minute — the agent shares the link (and shows the image inline where GHL supports it).

- **"Make a 5-second video of steam rising from a coffee cup."**
  Expect the agent to say the render has started and will take **2–5 minutes.** That's correct — it won't come back instantly. Ask again shortly: *"is my video ready?"* — the agent checks and returns the finished clip. (If you've connected a GHL Private Integration Token, the finished clip also lands in **Media Storage** automatically — no need to ask at all.)

- **"How many credits do I have left?"**
  Instant answer — your Kie.ai balance in both credits and dollars.

---

## Path 2: Workflow AI Agent

<!-- screenshot: Workflow builder with the AI Agent action's Add Tools panel open -->

Use this when generation needs to happen automatically inside a workflow, not just on request in chat.

1. Open the **Workflow** you want to add this to, or create a new one.
2. Add an **AI Agent** action.
3. Inside that action, click **Add Tools**.
4. Go to the **MCP** tab → **Add Connection**.
5. Fill in:
   - **Connection Name:** "FreshGen"
   - **Server URL:** your `https://your-app.vercel.app/mcp/<secret>` URL
   - **Transport Type:** `HTTP Streamable`
   - **Authentication:** `None` — the URL itself carries your secret, there's nothing else to authenticate
6. Click **Test Connection** — should succeed right away.
7. Tick the tools you want available in this workflow.
8. Click **Save**.

<!-- screenshot: MCP connection form showing Transport Type and Authentication fields -->

### Try it

Run the workflow (or use its test-run feature) so it reaches the AI Agent step, with a prompt that triggers a generation — e.g. auto-generating a follow-up image for a new lead. Same behavior as Path 1: images come back fast, video takes 2–5 minutes.

---

## If a connection won't work

Same fixes apply no matter which path you used — full detail is in the README's troubleshooting table. Two that come up most during GHL setup specifically:

- **"Test Connection" fails in Path 2** — almost always Transport Type isn't set to `HTTP Streamable`, or Authentication isn't set to `None`. Double-check both fields.
- **Tools list is empty right after adding the connection** — give it a few seconds and reopen the tool picker. If it's still empty, remove the connection and re-add it.

One more that's specific to how GHL handles connections:

**Can I connect the same server to more than one GHL location?**
Yes — paste the exact same MCP URL into multiple sub-accounts. They'll share one Kie.ai balance and one Media Library destination (whatever `GHL_LOCATION_ID` is set to, or none). If each location needs its own Media Library or its own billing, deploy a separate copy per location instead.

## Notes

- **Tick every tool during setup.** There are only five or six of them — no reason to leave any unchecked.
- **Authentication is always "None."** That's not a gap in security — your secret is already baked into the URL. Anyone with the URL can use the tools; nobody without it can even find the endpoint. That's the whole reason the URL is treated like a password.
- **If tools that used to show up disappear,** remove the connection and re-add it — the tool list can be cached from your first connection.
- **Your dashboard has this same walkthrough**, path-specific, if you'd rather follow it on-screen next to your actual GHL tab.

## What each tool does

| Tool | What it does |
|---|---|
| `generate_image` | Generates an AI image from a text prompt. Returns the finished image URL, usually within 45 seconds. |
| `generate_video` | Starts a 5–10 second AI video render. Returns a task ID right away — the agent checks back in 2–5 minutes for the finished clip. |
| `check_status` | Checks whether a generation is finished, using its task ID. |
| `check_credits` | Checks the remaining Kie.ai balance, in credits and dollars. Free and instant. |
| `list_models` | Lists every available image and video model — what each is best at and roughly what it costs. |
| `save_to_media_library` | Only appears if `GHL_PIT` and `GHL_LOCATION_ID` are set. Copies any file URL into the GHL Media Library so it never expires. Finished generations are saved there automatically — this tool is for manual/extra saves. |

## Next steps

- Run the three test prompts above in whichever path you set up.
- Ask `check_credits` once so you know your starting balance.
- Keep the [README](../README.md) handy for cost breakdowns and troubleshooting once you're live.

Starting from scratch? Go back to the [README](../README.md) for deploy steps.
