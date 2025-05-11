<!--
Title: Privacy guides docs
Description: Learn how to contribute, get help and sign privacy guides pull requests.
Author: Sun Knudsen <https://github.com/sunknudsen>
Contributors: Sun Knudsen <https://github.com/sunknudsen>
Reviewers:
Publication date: 2020-09-10T14:14:21.000Z
Listed: false
Pinned:
-->

# Privacy guides docs

## How to contribute

Thanks for contributing. 🙌

**Like project?** Please star [repository](https://github.com/sunknudsen/privacy-guides).

**Found a bug?** Please submit [issue](https://github.com/sunknudsen/privacy-guides/issues) or [signed](#how-to-sign-pull-requests) [pull request](https://github.com/sunknudsen/privacy-guides/pulls).

**Found a security vulnerability?** Please disclose vulnerability privately using the PGP public key and email found on [https://sunknudsen.com/contact](https://sunknudsen.com/contact).

**Wish to support the project?** Please visit [https://sunknudsen.com/donate](https://sunknudsen.com/donate).

## How to get help

Check out [discussions](https://github.com/sunknudsen/privacy-guides/discussions).

## How to sign pull requests

### Step 1: add PGP public key to GitHub account

Go to https://github.com/settings/keys, click “New GPG key”, paste your PGP public key and click “Add GPG key”.

### Step 2: enable Git [signing](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)

> Heads-up: replace `0x8C9CA674C47CA060` with your PGP public key ID.

```shell
git config --global commit.gpgsign true
git config --global gpg.program $(which gpg)
git config --global user.signingkey 0x8C9CA674C47CA060
```

### Step 3: submit pull request

👍
