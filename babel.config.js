/*
 * @Author: bluefox
 * @Date: 2020-01-02 11:30:19
 * @LastEditors  : bluefox
 * @LastEditTime : 2020-01-02 11:30:47
 * @Description: babel compile config
 */
var config = {
  presets: [
    [
      "@babel/env", {
        "modules": false
      }
    ]
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": 3
      }
    ]
  ]
};
if (process.env.BABEL_ENV === 'test') {
  config.plugins.push("istanbul");
}

module.exports = config;
