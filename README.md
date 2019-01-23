[![Follow on Twitter](https://img.shields.io/twitter/follow/pownjs.svg?logo=twitter)](https://twitter.com/pownjs)

# Pown Recon

Pown Recon is a target reconnaissance framework powered by graph theory. The benefit of using graph theory instead of flat table representation is that it is easier to find the relationships between different types of information which comes quite handy in many situations. Graph theory algorithms also help with diffing, searching, like finding the shortest path, and many more interesting tasks.

## Quickstart

If installed globally as part of [Pown.js](https://github.com/pownjs/pown) invoke like this:

```sh
$ pown recon
```

Otherwise, install this module from the root of your project:

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
pown recon [options] <command>

Target recon

Commands:
  pown recon transform <transform>  Perform inline transformation  [aliases: t]
  pown recon select <expression>    Perform a selection  [aliases: s]
  pown recon diff <fileA> <fileB>   Perform a diff between two recon files  [aliases: d]

Options:
  --version      Show version number  [boolean]
  --modules, -m  Load modules  [string]
  --debug, -d    Debug mode  [boolean]
  --help         Show help  [boolean]
```

### Transform Usage

```
pown recon transform <transform>

Perform inline transformation

Commands:
  pown recon transform pkslookupkeys [options] <nodes...>                Look the the PKS database at pool.sks-keyservers.net which pgp.mit.edu is part of.  [aliases: pks_lookup_keys, pkslk]
  pown recon transform hibpreport [options] <nodes...>                   Obtain haveibeenpwned.com breach report.  [aliases: hibp_report, hibpr]
  pown recon transform crtshdomainreport [options] <nodes...>            Obtain crt.sh domain report which helps enumerating potential target subdomains.  [aliases: crtsh_domain_report, crtshdr]
  pown recon transform githublistrepos [options] <nodes...>              List the first 100 GitHub repositories  [aliases: github_list_repos, ghlr]
  pown recon transform githublistmembers [options] <nodes...>            List the first 100 GitHub members in org  [aliases: github_list_members, ghlm]
  pown recon transform urlscanliveshot [options] <nodes...>              Generates a liveshot of any public site via urlscan.  [aliases: usls]
  pown recon transform gravatar [options] <nodes...>                     Get gravatar
  pown recon transform dockerhublistrepos [options] <nodes...>           List the first 100 DockerHub repositories  [aliases: dockerhub_list_repos, dhlr]
  pown recon transform cloudflarednsquery [options] <nodes...>           Query CloudFlare DNS API  [aliases: cloudflare_dns_query, cfdq]
  pown recon transform threatcrowddomainreport [options] <nodes...>      Obtain threatcrowd domain report which helps enumerating potential target subdomains and email addresses.  [aliases: threatcrowd_domain_report, tcdr]
  pown recon transform threatcrowdipreport [options] <nodes...>          Obtain threatcrowd ip report which helps enumerating virtual hosts.  [aliases: threatcrowd_ip_report, tcir]
  pown recon transform hackertargetreverseiplookup [options] <nodes...>  Obtain reverse IP information from hackertarget.com.  [aliases: hackertarget_reverse_ip_lookup, htril]

Options:
  --version      Show version number  [boolean]
  --modules, -m  Load modules  [string]
  --debug, -d    Debug mode  [boolean]
  --help         Show help  [boolean]
  --read, -r     Read file
  --write, -w    Write file
```

### Select Usage

```
pown recon select <expression>

Perform a selection

Options:
  --version      Show version number  [boolean]
  --modules, -m  Load modules  [string]
  --debug, -d    Debug mode  [boolean]
  --help         Show help  [boolean]
  --read, -r     Read file
  --write, -w    Write file
  --format, -f   Output format  [string] [choices: "table", "json", "csv"] [default: "table"]
  --with-ids     Output ids as well  [boolean] [default: false]
```

### Diff Usage

```
pown recon diff <fileA> <fileB>

Perform a diff between two recon files

Options:
  --version      Show version number  [boolean]
  --modules, -m  Load modules  [string]
  --debug, -d    Debug mode  [boolean]
  --help         Show help  [boolean]
  --subset, -s   The subset to select  [choices: "left", "right", "both"] [default: "left"]
  --write, -w    Write file
  --format, -f   Output format  [string] [choices: "table", "json", "csv"] [default: "table"]
  --with-ids     Output ids as well  [boolean] [default: false]
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
* Urlscan Live Shot
* Threatcrowd Lookup
* ZoomEye Scraper
* Wappalyzer
* AWS Landing Pages
* Builtwith
* Riddler
* Commoncraw

## Tutorial

To demonstrate the power of Pown Recon and graph-based OSINT (Open Source Intelligence), let's have a look at the following trivial example.

Let's start by querying everyone who is a member of Google's engineering team and contributes to their GitHub account.

```sh
pown recon t -w google.network ghlm google
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

The representation is tabular for convenience but underneath we've got a model which consists of nodes connected by edges.

If you are wondering what that looks like you can use [SecApps Recon](https://recon.secapps.com). The command line does not have the necessary level of interactivity to present the complexity of graphs.

The `-w google.network` command line option exported the network to a file. You can load the file directly into SecApps Recon with the file open feature. The result will look like this:

![screenshot](https://media.githubusercontent.com/media/pownjs/pown-recon/master/screenshots/01.png)

Now imagine that we want to query what repositories these Google engineers are working on. This is easy. First, we need to select the nodes in the graph and then transform them with the "GitHub List Repositories" transformation. This is how we do it from the command line:

```sh
pown recon t ghlr -r google.network -w google2.nework -s 'node[type="github:member"]'
```

If you don't hit GitHub API rate limits, you will be presented with this:

```sh
┌──────────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┐
│ uri                                                                      │ fullName                                              │
├──────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/3rf/2015-talks                                        │ 3rf/2015-talks                                        │
├──────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/3rf/codecoroner                                       │ 3rf/codecoroner                                       │
├──────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
...
...
...
├──────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/alexpennace/rvm                                       │ alexpennace/rvm                                       │
├──────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/alexpennace/simple-security-organizer                 │ alexpennace/simple-security-organizer                 │
├──────────────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────┤
│ https://github.com/alexpennace/walibot                                   │ alexpennace/walibot                                   │
└──────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┘
```

Since now we have two files `google.network` and `google2.network` you might be wondering what is the difference between them. Well, we have a tool for doing just that. This is how we do it.

```sh
pown recon diff google.network google2.network
```

Now we know! This feature is quite useful if you are building large recon maps and you are just curious to know what are the key differences. Imagine your cron job performs the same recon every day and you would like to know if something new just appeared which might be worth exploring further. Hello, bug bounty hunters!

## Sponsors

This work is the result of an almost direct copy of SecApps excellent [Recon](https://recon.secapps.com) tool. While you can perform the same transformations from Pown now, Recon gives you a nice GUI which helps a lot. Also, the sharing features of SecApps are pretty cool.

## Improvements

This is a great start but there are a number of things that the original author would like to improve. In no particular order here is the current wishlist:

* More transforms
* Shell-like environment
* Builtin Graphical Preview
  - SecApps Recon is nice but how about a built-in server/app for previewing the networks
* Common Search-engine support will be nice
  - will be used for finding various types of disclosures like Trello boards etc
