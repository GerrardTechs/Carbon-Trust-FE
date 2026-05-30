import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "auth");
const legacy = fs.readFileSync(path.join(root, "AuthFlow.jsx"), "utf8");
const lines = legacy.split("\n");

function slice(start, end) {
  return lines.slice(start - 1, end).join("\n");
}

function write(rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

write("constants/tokens.js", slice(5, 23).replace("const G =", "export const G ="));

const langsBody = slice(26, 358).replace("const LANGS =", "export const LANGS =");
write("i18n/langs.js", langsBody);

write(
  "styles/authStyles.js",
  `import { G } from "../constants/tokens.js";\n\nexport const authCss = \`${slice(361, 946).replace(/^const css = `/, "").replace(/`;$/, "")}\`;\n`
);

const iconsHeader = `import { G } from "../constants/tokens.js";\n\nexport const Icons = `;
write("utils/icons.jsx", iconsHeader + slice(949, 1011).replace(/^const Icons = /, ""));

write(
  "utils/passwordStrength.js",
  `import { G } from "../constants/tokens.js";\n\n${slice(1014, 1029).replace("function pwStrength", "export function pwStrength")}`
);

write(
  "utils/institutionId.js",
  slice(1201, 1217).replace("function generateInstitutionId", "export function generateInstitutionId")
);

const compImports = `import { LANGS } from "../i18n/langs.js";\n`;

write(
  "components/LangSwitcher.jsx",
  `${compImports}\n${slice(1032, 1046).replace("function LangSwitcher", "export function LangSwitcher")}`
);

write(
  "components/ProgressDots.jsx",
  `${slice(1048, 1050)}\n\n${slice(1052, 1064).replace("function ProgressDots", "export function ProgressDots")}`
);

const pageHeader = (extra = "") =>
  `import { useState, useRef, useEffect } from "react";\nimport { API } from "../../carbontrust/shared.jsx";\nimport { G } from "../constants/tokens.js";\nimport { LANGS } from "../i18n/langs.js";\nimport { Icons } from "../utils/icons.jsx";\nimport { ProgressDots } from "../components/ProgressDots.jsx";\n${extra}\n`;

write(
  "pages/WelcomePage.jsx",
  `${pageHeader(`import { LangSwitcher } from "../components/LangSwitcher.jsx";`)}\n${slice(1067, 1111).replace("function WelcomePage", "export function WelcomePage")}`
);

write(
  "pages/RolePage.jsx",
  `${pageHeader()}\n${slice(1114, 1198).replace("function RolePage", "export function RolePage")}`
);

write(
  "pages/RegisterPage.jsx",
  `${pageHeader(`import { pwStrength } from "../utils/passwordStrength.js";\nimport { generateInstitutionId } from "../utils/institutionId.js";`)}\n${slice(1221, 1514).replace("function RegisterPage", "export function RegisterPage")}`
);

write(
  "pages/VerifyEmailPage.jsx",
  `${pageHeader()}\n${slice(1517, 1641).replace("function VerifyEmailPage", "export function VerifyEmailPage")}`
);

write(
  "pages/OperationalPage.jsx",
  `${pageHeader()}\n${slice(1645, 1754).replace("function OperationalPage", "export function OperationalPage")}`
);

write(
  "pages/CalcMethodPage.jsx",
  `${pageHeader()}\n${slice(1758, 1873).replace("function CalcMethodPage", "export function CalcMethodPage")}`
);

write(
  "pages/SuccessPage.jsx",
  `${pageHeader()}\n${slice(1876, 1901).replace("function SuccessPage", "export function SuccessPage")}`
);

console.log("Auth modules extracted.");
