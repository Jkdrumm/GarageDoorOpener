import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = path.join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../"
);

export default __dirname;
