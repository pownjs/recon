[![Follow on Twitter](https://img.shields.io/twitter/follow/pownjs.svg?logo=twitter)](https://twitter.com/pownjs)

# Pown Recon

Pown Recon is a target reconnaissance framework powered by graph theory.

## Quickstart

If installed globally as part of [Pown.js](https://github.com/pownjs/pown) invoke like this:

```sh
$ pown reon
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

```
pown recon <subcommand>

Target recon

Commands:
  pown-cli recon transform <transform>  Perform inline transformation
                                                                    [aliases: t]

Options:
  --version      Show version number                                   [boolean]
  --modules, -m  Load modules                                           [string]
  --help         Show help                                             [boolean]
```

```
pown recon transform <transform>

Perform inline transformation

Commands:
  pown-cli recon transform githublistrepos  List the first 100 GitHub
  [options] <nodes...>                      repositories
                                              [aliases: github_list_repos, ghlr]
  pown-cli recon transform                  List the first 100 GitHub members in
  githublistmembers [options] <nodes...>    org
                                            [aliases: github_list_members, ghlm]
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

Options:
  --version      Show version number                                   [boolean]
  --modules, -m  Load modules                                           [string]
  --help         Show help                                             [boolean]
```

## Transforms

The transform is a core concept behind Recon. The purpose of the transform is take an input of one type and expand. If you are familiar with tools such as Maltego or SecApps Recon you know the drill.

## Improvements

This is a great start but there are a number of things that the original author would like to improve. In no particular order here is the current wish list:

* More transforms
* Shell-like environment
