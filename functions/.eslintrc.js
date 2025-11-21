module.exports = {
  root: true,
  ignorePatterns: ["../"],
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2020,
    "sourceType": "module",
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "max-len": ["error", {"code": 200, "ignoreUrls": true, "ignoreStrings": true, "ignoreTemplateLiterals": true}],
    "require-jsdoc": "off",
    "no-empty": "warn",
    "no-unused-vars": "warn",
    "no-useless-escape": "warn",
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
