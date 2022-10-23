module.exports = {
  presets: [["@babel/env", "@babel/preset-env"]],
  plugins: [
    ["@babel/plugin-proposal-class-properties"],
    ["@babel/plugin-transform-typescript"],
  ],
  sourceType: "unambiguous",
};
