import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      colors: {
        coffee: {
          50: "#faf6f2",
          100: "#f4ebe2",
          200: "#e8d5c4",
          300: "#d6b594",
          400: "#c28f62",
          500: "#a6703f",
          600: "#87562f",
          700: "#6b4528",
          800: "#573923",
          900: "#472f1e",
        },
        cream: "#f6efe7",
        slateDark: "#111827",
      },
      boxShadow: {
        card: "0 12px 30px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [forms, typography],
};
