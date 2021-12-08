An Awesome VSCode Extension
===========================

[![Tests](https://github.com/stateful/vscode-awesome-ux/actions/workflows/test.yaml/badge.svg)](https://github.com/stateful/vscode-awesome-ux/actions/workflows/test.yaml)
![vscode version](https://vsmarketplacebadge.apphb.com/version/activecove.marquee.svg)
![number of installs](https://vsmarketplacebadge.apphb.com/installs/activecove.marquee.svg)
![average user rating](https://vsmarketplacebadge.apphb.com/rating/activecove.marquee.svg)
![license](https://img.shields.io/github/license/stateful/vscode-awesome-ux.svg)

This extension is a best practices guide for writing great VSCode extensions. It can be used as boilerplate template to start of with a new extension.

## Features

In itself this extension doesn't do much. It has some webviews, panels and commands implemented to show you how to interact with the [VSCode APIs](https://code.visualstudio.com/api/references/vscode-api).

The current version looks as follows:

![Demo](./.github/assets/vscode.gif)

## Best Practices

We have accumulated a set of best practices while developing VSCode extensions. Please note that these are just recommendations, sometimes based on personal preference. There are many ways to write an extension, and we found the following allow you to write them in a scaleable and testable way:

- [Initiate Extensions through an `ExtensionController`](./docs/ExtensionController.md)
- [Building WebViews](./docs/WebViews.md)

If you have more best practices, please share them with us by raising a PR or [filing an issue](https://github.com/stateful/vscode-awesome-ux/issues/new).

## Extension Settings

This extension contributes the following settings:

* `vscode-awesome-ux.configuration.defaultNotifications`: The default value of received example notification (default `0`)

<!--
ToDo(Christian); https://github.com/stateful/vscode-awesome-ux/issues/9
## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.
-->
