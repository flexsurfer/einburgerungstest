import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@ebtest/shared": path.resolve(import.meta.dirname, "../shared/src"),
      "react-native": path.resolve(
        import.meta.dirname,
        "./test/mocks/react-native.ts",
      ),
      "@react-native-async-storage/async-storage": path.resolve(
        import.meta.dirname,
        "./test/mocks/async-storage.ts",
      ),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
