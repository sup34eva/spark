module.exports = {
    parser: 'babel-eslint',
    extends: 'airbnb',
    env: {
        browser: true,
        mocha: true,
        node: true,
    },
    rules: {
        'linebreak-style': ['off', 'windows'],
        'indent': ['error', 4, {
            SwitchCase: 1,
        }],
        'arrow-parens': ['off'],
        'consistent-return': 'error',
        'comma-dangle': ['error', 'always-multiline'],
        'no-use-before-define': 'off',
        'no-duplicate-imports': 'off',
        'no-plusplus': 'off',
        'class-methods-use-this': 'off',
        'no-console': 'off',
        'no-restricted-syntax': 'off',

        'flowtype-errors/show-errors': 'error',

        'jsx-a11y/media-has-caption': 'off',
        'react/jsx-max-props-per-line': 'off',
        'react/require-default-props': 'off',
        'react/jsx-first-prop-new-line': 'off',
        'react/jsx-closing-bracket-location': 'off',
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-filename-extension': ['error', {
            extensions: ['.js', '.jsx'],
        }],

        'import/first': ['error', {
            'absolute-first': false,
        }],
        'import/order': ['error', {
            'newlines-between': 'always',
            'groups': [
                'builtin',
                'external',
                'internal',
                'parent',
                ['sibling', 'index'],
            ],
        }],

        'promise/prefer-await-to-then': 'error',
        'promise/param-names': 'error',
        'promise/always-return': 'error',
        'promise/catch-or-return': 'error',
  },
    plugins: [
        'flowtype-errors',
        'react',
        'import',
        'promise',
    ],
    settings: {
        'import/resolver': {
            'babel-module': {},
            webpack: {
                config: 'webpack.config.js',
            },
        },
    },
};
