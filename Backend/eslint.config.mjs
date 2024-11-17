
import globals  from "globals";
import pluginJs from "@eslint/js";
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import jest  from "eslint-plugin-jest";

// export default [
//   {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}}, 
//   {languageOptions: { globals: {...globals.browser, ...globals.node} }},
//   pluginJs.configs.recommended,
// ];

export default [
    {
      files: ["src/*.js"]
    }, 
    { 
      languageOptions: { 
      sourceType: "commonjs",
      globals: { ...globals.browser, ...globals.node, ...globals.jest,}
      }
    },
    pluginJs.configs.recommended,
    prettierRecommended,
    {
      rules: {
        'no-console' : 'warn',
        'prettier/prettier':'error',
      }
    },
    { 
      files: ["test/**/*.js"]
    }, 
    { 
      languageOptions: { 
      sourceType: "commonjs",
      globals: { ...globals.browser, ...globals.node, ...globals.jest,}
      }
    },
    pluginJs.configs.recommended,
    prettierRecommended,
    {
      rules: {
        'no-console' : 'warn',
        'prettier/prettier':'error',
        'no-undef':'off',
        'no-unused-vars': 'off'
      }
    }
];

