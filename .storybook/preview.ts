import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../src/design-system/styles.css";

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: {
        Light: "",
        Dark: "dark",
      },
      defaultTheme: "Light",
    }),
  ],
  parameters: {
    actions: { argTypesRegex: "^on.*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
    backgrounds: {
      disable: true,
    },
    a11y: {
      test: "todo",
      options: {
        checks: { "color-contrast": { enabled: true } },
      },
    },
  },
};

export default preview;

