[![Follow on Twitter](https://img.shields.io/twitter/follow/pownjs.svg?logo=twitter)](https://twitter.com/pownjs)

# Pown Recon

Pown Recon is a target reconnaissance framework powered by graph theory. The benefit of using graph theory instead of flat table representation is that it is easier to find relationship between different types of information which comes quite handy in many situations. Graph theory algorithms also help with diffing, searching, like finding the shortest path, and many more interesting tasks.

## Quickstart

If installed globally as part of [Pown.js](https://github.com/pownjs/pown) invoke like this:

```sh
$ pown recon
```

Otherwise install this module from the root of your project:

```sh
$ npm install @pown/recon --save
```

Once done, invoke pown recon like this:

```sh
$ ./node_modules/.bin/pown-cli recon
```

## Usage

> **WARNING**: This pown command is currently under development and as a result will be subject to breaking changes.

```
pown-cli recon [options] <command>

Target recon

Commands:
  pown-cli recon transform <transform>  Perform inline transformation
                                                                    [aliases: t]
  pown-cli recon select <expression>    Perform a selection         [aliases: s]
  pown-cli recon diff <fileA> <fileB>   Perform a diff between two recon files
                                                                    [aliases: d]

Options:
  --version      Show version number                                   [boolean]
  --modules, -m  Load modules                                           [string]
  --help         Show help                                             [boolean]
```

### Transform Usage

```
pown-cli recon transform <transform>

Perform inline transformation

Commands:
  pown-cli recon transform pkslookupkeys    Look the the PKS database at
  [options] <nodes...>                      pool.sks-keyservers.net which
                                            pgp.mit.edu is part of.
                                               [aliases: pks_lookup_keys, pkslk]
  pown-cli recon transform hibpreport       Obtain haveibeenpwned.com breach
  [options] <nodes...>                      report.[aliases: hibp_report, hibpr]
  pown-cli recon transform                  Obtain crt.sh domain report which
  crtshdomainreport [options] <nodes...>    helps enumerating potential target
                                            subdomains.
                                         [aliases: crtsh_domain_report, crtshdr]
  pown-cli recon transform githublistrepos  List the first 100 GitHub
  [options] <nodes...>                      repositories
                                              [aliases: github_list_repos, ghlr]
  pown-cli recon transform                  List the first 100 GitHub members in
  githublistmembers [options] <nodes...>    org
                                            [aliases: github_list_members, ghlm]
  pown-cli recon transform gravatar         Get gravatar
  [options] <nodes...>
  pown-cli recon transform                  List the first 100 DockerHub
  dockerhublistrepos [options] <nodes...>   repositories
                                           [aliases: dockerhub_list_repos, dhlr]
  pown-cli recon transform                  Query CloudFlare DNS API
  cloudflarednsquery [options] <nodes...>  [aliases: cloudflare_dns_query, cfdq]
  pown-cli recon transform                  Obtain threatcrowd domain report
  threatcrowddomainreport [options]         which helps enumerating potential
  <nodes...>                                target subdomains and email
                                            addresses.
                                      [aliases: threatcrowd_domain_report, tcdr]
  pown-cli recon transform                  Obtain threatcrowd ip report which
  threatcrowdipreport [options] <nodes...>  helps enumerating virtual hosts.
                                          [aliases: threatcrowd_ip_report, tcir]
  pown-cli recon transform                  Obtain reverse IP information from
  hackertargetreverseiplookup [options]     hackertarget.com.
  <nodes...>                    [aliases: hackertarget_reverse_ip_lookup, htril]

Options:
  --version      Show version number                                   [boolean]
  --modules, -m  Load modules                                           [string]
  --help         Show help                                             [boolean]
  --read, -r     Read file
  --write, -w    Write file
```

### Select Usage

```
pown-cli recon select <expression>

Perform a selection

Options:
  --version      Show version number                                   [boolean]
  --modules, -m  Load modules                                           [string]
  --help         Show help                                             [boolean]
  --read, -r     Read file
  --write, -w    Write file
  --format, -f   Output format
                   [string] [choices: "table", "json", "csv"] [default: "table"]
```

### Diff Usage

```
pown-cli recon diff <fileA> <fileB>

Perform a diff between two recon files

Options:
  --version      Show version number                                   [boolean]
  --modules, -m  Load modules                                           [string]
  --help         Show help                                             [boolean]
  --subset, -s   The subset to select
                            [choices: "left", "right", "both"] [default: "left"]
  --write, -w    Write file
  --format, -f   Output format
                   [string] [choices: "table", "json", "csv"] [default: "table"]
```

## Transforms

* GitHub Search of Repos and Members
* CloudFlare 1.1.1.1 DNS API
* CRTSH
* DockerHub Repo Search
* Gravatar URLs
* Hacker Target Reverse IP Lookup
* Have I Been Pwned Lookup
* PKS Lookup
* Threatcrowd Lookup

## Tutorial

To demonstrate the power of Pown Recon and graph-based OSINT (Open Source Intelligence), let's have a look at the following trivial example.

Let's start by quering everyone who is a member of Google's engineering team and contributes to their GitHub account.

```sh
$ pown recon t -w google.network ghlm google
```

This command will generate a table similar to this:

```
┌──────────────────────────────────────────┬───────────────────────┬───────────────────────────────────────────────────────┐
│ uri                                      │ login                 │ avatar                                                │
├──────────────────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/3rf                   │ 3rf                   │ https://avatars1.githubusercontent.com/u/1242478?v=4  │
├──────────────────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/aaroey                │ aaroey                │ https://avatars0.githubusercontent.com/u/31743510?v=4 │
├──────────────────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/aarongable            │ aarongable            │ https://avatars3.githubusercontent.com/u/2474926?v=4  │
├──────────────────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/aaronj1335            │ aaronj1335            │ https://avatars2.githubusercontent.com/u/787066?v=4   │
├──────────────────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────┤
...
...
...
├──────────────────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/alexwhouse            │ alexwhouse            │ https://avatars3.githubusercontent.com/u/1448490?v=4  │
├──────────────────────────────────────────┼───────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/alexwoz               │ alexwoz               │ https://avatars3.githubusercontent.com/u/501863?v=4   │
└──────────────────────────────────────────┴───────────────────────┴───────────────────────────────────────────────────────┘
```

You just created your first network!

The representation is tabular for convinience but underneath we've got a model which consists of nodes connected by edges. 

If you are wondering what that looks like you can use [SecApps Recon](https://recon.secapps.com). The command line does not have the necessery level of interactivity to present the complexity of graphs.

The `-w google.network` command line option exported the network to a file. You can load the file directly into SecApps Recon with the file open feature. The result will look like this:

![screenshot](https://media.githubusercontent.com/media/pownjs/pown-recon/master/screenshots/01.png)

Now imagine that we want to query what repositories these gooogle engineers are working on...

## Improvements

This is a great start but there are a number of things that the original author would like to improve. In no particular order here is the current wish list:

* More transforms
* Shell-like environment
* Common Search-engine support will be nice
  - will be used for finding various types of disclousures like trello boards etc
