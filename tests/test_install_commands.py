import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
README = ROOT / "README.md"


class InstallCommandDocsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.readme_text = README.read_text(encoding="utf-8")

    def test_has_current_slash_plugin_commands(self) -> None:
        self.assertIn(
            "/plugin marketplace add forrestchang/andrej-karpathy-skills",
            self.readme_text,
        )
        self.assertIn(
            "/plugin install andrej-karpathy-skills@karpathy-skills",
            self.readme_text,
        )

    def test_has_current_cli_plugin_commands(self) -> None:
        self.assertIn(
            "claude plugin marketplace add forrestchang/andrej-karpathy-skills",
            self.readme_text,
        )
        self.assertIn(
            "claude plugin install andrej-karpathy-skills@karpathy-skills",
            self.readme_text,
        )

    def test_mentions_deprecated_plural_command(self) -> None:
        self.assertIn("`claude plugins add`", self.readme_text)
        self.assertIn("deprecated", self.readme_text.lower())


if __name__ == "__main__":
    unittest.main()
