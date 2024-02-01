# 12d Programming Language for Visual Studio Code

Visual Studio Code Extension providing language support for the 12d Programming
Language.

Supports declarations across `#include` files if the `Includes Dir` setting is
configured, see [configuration](#configuration).

## Requirements

- Visual Studio Code v1.75.0+.

## Features

### Syntax Highlighting

![syntax highlighting](https://github.com/kelly-lin/vscode-12dpl/assets/19686599/51b6f6a1-040d-44ed-8787-3c8bcea855c3)

### Go to definition

Jump to or peek at definition of symbol.

![go to definition](https://github.com/kelly-lin/vscode-12dpl/assets/19686599/e8ef36a1-0aa3-45d2-a76b-4feccb0d7229)

### Hover support

Get symbol information (type, signature and documentation) on hover over symbol.
Works for built in 12d and user defined symbols. Function documentation for
user defined functions are provided if a comment block ends directly above the
function declaration. Documentation can be in Markdown or plain text.

![hover support](https://github.com/kelly-lin/vscode-12dpl/assets/19686599/1e821cc2-b97c-4764-a0ad-e9aea7c296e5)

12d Macro Library documentation shown on hover.
![lib hover](https://github.com/kelly-lin/vscode-12dpl/assets/19686599/f3124aaa-fdc5-447a-8fb9-7186820cb093)

### Autocompletion

Provide completion suggestions as you write your code.

![lib completion](https://github.com/kelly-lin/vscode-12dpl/assets/19686599/c8f9352d-9342-47ed-b40f-b0b061507c9c)
![user func completion](https://github.com/kelly-lin/vscode-12dpl/assets/19686599/ef94af3f-3f11-4d93-8748-33c15e537da9)

## Planned Features

- Find references.
- Autoformatting.

## Configuration

You can configure the extension by [editing the settings inside of VS
Code](https://code.visualstudio.com/docs/getstarted/settings#_settings-editor).
![settings](https://github.com/kelly-lin/vscode-12dpl/assets/19686599/5edb575f-824d-4882-80e7-cb0f50459c27)

## Contributing

See [contributing](https://github.com/kelly-lin/12d-lang-server?tab=readme-ov-file#contributing).
