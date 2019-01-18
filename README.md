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
$ ./node_modules/.bin/pown     recon
```

## Usage

```
pown recon [options] <command>

Target recon

Commands:
  pown recon transform <transform>  Perform inline transformation
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
  pown     recon transform pkslookupkeys    Look the the PKS database at
  [options] <nodes...>                      pool.sks-keyservers.net which
                                            pgp.mit.edu is part of.
                                               [aliases: pks_lookup_keys, pkslk]
  pown     recon transform hibpreport       Obtain haveibeenpwned.com breach
  [options] <nodes...>                      report.[aliases: hibp_report, hibpr]
  pown     recon transform                  Obtain crt.sh domain report which
  crtshdomainreport [options] <nodes...>    helps enumerating potential target
                                            subdomains.
                                         [aliases: crtsh_domain_report, crtshdr]
  pown     recon transform githublistrepos  List the first 100 GitHub
  [options] <nodes...>                      repositories
                                              [aliases: github_list_repos, ghlr]
  pown     recon transform                  List the first 100 GitHub members in
  githublistmembers [options] <nodes...>    org
                                            [aliases: github_list_members, ghlm]
  pown     recon transform gravatar         Get gravatar
  [options] <nodes...>
  pown     recon transform                  List the first 100 DockerHub
  dockerhublistrepos [options] <nodes...>   repositories
                                           [aliases: dockerhub_list_repos, dhlr]
  pown     recon transform                  Query CloudFlare DNS API
  cloudflarednsquery [options] <nodes...>  [aliases: cloudflare_dns_query, cfdq]
  pown     recon transform                  Obtain threatcrowd domain report
  threatcrowddomainreport [options]         which helps enumerating potential
  <nodes...>                                target subdomains and email
                                            addresses.
                                      [aliases: threatcrowd_domain_report, tcdr]
  pown     recon transform                  Obtain threatcrowd ip report which
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
