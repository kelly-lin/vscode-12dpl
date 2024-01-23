# 12d Programming Language for Visual Studio Code

Visual Studio Code Extension providing language support for the 12d Programming
Language.

Supports declarations across `#include` files if the `includesDir` is
configured, see [configuration](#configuration).

## Requirements

- Visual Studio Code v1.75.0+.

## Features

### Go to definition

Jump to or peek at definition of symbol.

![go to definition](./asset/doc/go-to-definition.gif)

### Hover support

Get symbol information (type, signature and documentation) on hover over symbol.
Works for built in 12d and user defined symbols. Function documentation for
user defined functions are provided if a comment block ends directly above the
function declaration.

![hover support](./asset/doc/hover-user-func.gif)
![lib hover](./asset/doc/lib-hover.gif)

### Autocompletion

Provide completion suggestions as you write your code.

![lib completion](./asset/doc/lib-completion-doc.png)
![user func completion](./asset/doc/user-func-completion.gif)

## Planned Features

- Find references.
- Autoformatting.

## Configuration

You can configure the extension by [editing the settings inside of VS
Code](https://code.visualstudio.com/docs/getstarted/settings#_settings-editor).
![settings](https://github.com/kelly-lin/vscode-12dpl/assets/19686599/5edb575f-824d-4882-80e7-cb0f50459c27)
