/*
 * @Author: bluefox
 * @Date: 2020-01-02 11:30:19
 * @LastEditors  : bluefox
 * @LastEditTime : 2020-01-02 11:47:59
 * @Description: babel compile config
 */
var config = {
  presets: [
    [
      "@babel/env", {
        "modules": false
      }
    ],
    "@babel/typescript"
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": 3
      }
    ],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-numeric-separator"
  ]
};
if (process.env.BABEL_ENV === 'test') {
  config.plugins.push("istanbul");
}

module.exports = config;
