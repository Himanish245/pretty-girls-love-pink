"""Tests for the Pretty Girls Love Pink Spicetify theme.

Ruling: Node is not installed on this machine, so file checks use Python's
unittest and JS unit tests run through macOS's built-in `jsc`.
Run: python3 -m unittest discover -s tests -v
"""
import json
import os
import re
import subprocess
import unittest
import xml.dom.minidom

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THEME = os.path.join(ROOT, "pretty-girls-love-pink")
JSC = "/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc"


def read(*parts):
    with open(os.path.join(THEME, *parts), encoding="utf-8") as f:
        return f.read()


def parse_scheme(name):
    ini = read("color.ini")
    m = re.search(r"\[%s\]([\s\S]*?)(?=\n\[|$)" % re.escape(name), ini)
    assert m, "[%s] section missing" % name
    out = {}
    for line in m.group(1).splitlines():
        kv = re.match(r"^\s*([\w-]+)\s*=\s*(\S+)\s*$", line)
        if kv:
            out[kv.group(1)] = kv.group(2)
    return out


REQUIRED_KEYS = ["text", "subtext", "main", "sidebar", "player", "card", "shadow",
                 "selected-row", "button", "button-active", "button-disabled",
                 "tab-active", "notification", "notification-error", "misc"]


class PaletteTests(unittest.TestCase):  # Task 1
    def test_every_required_key_is_6_digit_hex(self):
        s = parse_scheme("pink")
        for k in REQUIRED_KEYS:
            self.assertRegex(s.get(k, ""), r"^[0-9A-Fa-f]{6}$", "key " + k)

    def test_palette_uses_spec_colors(self):
        s = parse_scheme("pink")
        self.assertEqual(s["main"].upper(), "FFE4EC")
        self.assertEqual(s["button"].upper(), "E8467C")
        self.assertEqual(s["text"].upper(), "5A0F24")
        self.assertEqual(s["card"].upper(), "FFD1DF")


class AssetTests(unittest.TestCase):  # Task 2
    def test_each_asset_svg_has_viewbox_and_is_valid_xml(self):
        for name in ["heart", "bow", "cherries", "gingham"]:
            svg = read("assets", name + ".svg")
            doc = xml.dom.minidom.parseString(svg)  # raises if unbalanced
            root = doc.documentElement
            self.assertEqual(root.tagName, "svg", name)
            self.assertTrue(root.getAttribute("viewBox"), name + " viewBox")


class CssTests(unittest.TestCase):  # Task 3
    def test_css_defines_hooks_and_reduced_motion_block(self):
        css = read("user.css")
        for hook in [".pglp-burst", ".pglp-heart-big", ".pglp-sticker-layer",
                     ".pglp-sticker", ".pglp-toggle", ".pglp-quote", "--pglp-tilt"]:
            self.assertIn(hook, css, hook)
        self.assertIn("prefers-reduced-motion", css)

    def test_sticker_layer_never_blocks_clicks(self):
        css = read("user.css")
        m = re.search(r"\.pglp-sticker-layer\s*\{([^}]*)\}", css)
        self.assertTrue(m)
        self.assertIn("pointer-events: none", m.group(1))


def run_js(expr):
    """Load theme.js in jsc and evaluate expr, returning parsed JSON."""
    script = 'load(%s); print(JSON.stringify(%s));' % (
        json.dumps(os.path.join(THEME, "theme.js")), expr)
    r = subprocess.run([JSC, "-e", script], capture_output=True, text=True)
    if r.returncode != 0:
        raise AssertionError(r.stdout + r.stderr)
    return json.loads(r.stdout.strip().splitlines()[-1])


class JsTests(unittest.TestCase):  # Task 4
    def test_clamp_particles(self):
        self.assertEqual(run_js("PGLP.clampParticles(28, 10)"), 2)
        self.assertEqual(run_js("PGLP.clampParticles(0, 10)"), 10)
        self.assertEqual(run_js("PGLP.clampParticles(40, 10)"), 0)

    def test_repel_zero_outside_radius(self):
        self.assertEqual(run_js("PGLP.repel({x:0,y:0},{x:500,y:0})"), {"dx": 0, "dy": 0})

    def test_repel_points_away_from_cursor(self):
        r = run_js("PGLP.repel({x:100,y:100},{x:60,y:100})")
        self.assertGreater(r["dx"], 0)
        self.assertEqual(r["dy"], 0)

    def test_effects_default_on_when_storage_missing_or_throws(self):
        self.assertTrue(run_js("PGLP.loadEffectsEnabled(undefined)"))
        self.assertTrue(run_js(
            "PGLP.loadEffectsEnabled({getItem:function(){throw new Error('x')}})"))
        self.assertFalse(run_js(
            "PGLP.loadEffectsEnabled({getItem:function(){return 'off'}})"))

    def test_pick_quote_cycles(self):
        self.assertTrue(run_js("PGLP.pickQuote(0)"))
        self.assertTrue(run_js("PGLP.pickQuote(100)"))
        quotes = [run_js("PGLP.pickQuote(%d)" % i) for i in range(10)]
        self.assertIn("buy me books & tell me I'm pretty", quotes)
        self.assertIn("pretty girls love pink!", quotes)

    def test_init_is_noop_without_spicetify(self):
        # No Spicetify/document in jsc: init must not throw.
        self.assertEqual(run_js("(PGLP.init(), 'ok')"), "ok")


class ReadmeTests(unittest.TestCase):  # Task 5
    def test_readme_has_install_commands(self):
        r = read("README.md")
        self.assertIn("spicetify config current_theme pretty-girls-love-pink", r)
        self.assertIn("spicetify apply", r)


if __name__ == "__main__":
    unittest.main()
