[![Follow on Twitter](https://img.shields.io/twitter/follow/pownjs.svg?logo=twitter)](https://twitter.com/pownjs)
[![NPM](https://img.shields.io/npm/v/@pown/recon.svg)](https://www.npmjs.com/package/@pown/recon)
[![Fury](https://img.shields.io/badge/version-2x%20Fury-red.svg)](https://github.com/pownjs/lobby)

# Pown Recon

Pown Recon is a target reconnaissance framework powered by graph theory. The benefit of using graph theory instead of flat table representation is that it is easier to find the relationships between different types of information which comes quite handy in many situations. Graph theory algorithms also help with diffing, searching, like finding the shortest path, and many other helpful tasks to aid information discovery and intelligence gathering.

| ![screenshot](https://media.githubusercontent.com/media/pownjs/pown-recon/master/screenshots/01.png) | ![screenshot](https://media.githubusercontent.com/media/pownjs/pown-recon/master/screenshots/02.png) | ![screenshot](https://media.githubusercontent.com/media/pownjs/pown-recon/master/screenshots/03.png) |
|-|-|-|

## Credits

This tool is part of [secapps.com](https://secapps.com) open-source initiative.

```
  ___ ___ ___   _   ___ ___  ___
 / __| __/ __| /_\ | _ \ _ \/ __|
 \__ \ _| (__ / _ \|  _/  _/\__ \
 |___/___\___/_/ \_\_| |_|  |___/
  https://secapps.com
```

> **NB**: Pown Recon is the result of an almost direct copy of SecApps' excellent [Recon](https://recon.secapps.com) tool.

## Quickstart

This tool is meant to be used as part of [Pown.js](https://github.com/pownjs/pown) but it can be invoked separately as an independent tool.

Install Pown first as usual:

```sh
$ npm install -g pown@latest
```

Invoke directly from Pown:

```sh
$ pown recon
```

Otherwise, install this module locally from the root of your project:

```sh
$ npm install @pown/recon --save
```

Once done, invoke pown cli:

```sh
$ POWN_ROOT=. ./node_modules/.bin/pown-cli recon
```

You can also use the global pown to invoke the tool locally:

```sh
$ POWN_ROOT=. pown recon
```

## Usage

> **WARNING**: This pown command is currently under development and as a result will be subject to breaking changes.

```
pown recon <command>

Target recon

Commands:
  pown recon transform <transform>          Perform inline transformation  [aliases: t]
  pown recon select <expressions...>        Select nodes  [aliases: s]
  pown recon traverse <expressions...>      Traverse nodes  [aliases: v]
  pown recon add <nodes...>                 Add nodes  [aliases: a]
  pown recon remove <selectors...>          Remove nodes  [aliases: r]
  pown recon merge <files...>               Perform a merge between at least two recon files  [aliases: m]
  pown recon diff <fileA> <fileB>           Perform a diff between two recon files  [aliases: d]
  pown recon group <name> <expressions...>  Group nodes  [aliases: g]
  pown recon ungroup <selectors...>         Ungroup nodes  [aliases: u]
  pown recon save <file>                    Save to file  [aliases: a]
  pown recon import <file>                  Import file  [aliases: i]
  pown recon export <file>                  Export to file  [aliases: e]

Options:
  --version  Show version number  [boolean]
  --help     Show help  [boolean]
```

### `pown recon transform`

```
pown recon transform <transform>

Perform inline transformation

Commands:
  pown recon transform archiveindex [options] <nodes...>                  Obtain archive.org index for specific URL.  [aliases: archive_index, arci]
  pown recon transform awsiamendpoints [options] <nodes...>               Enumerate AWS IAM endpoints.  [aliases: aws_iam_endpoints, awsie]
  pown recon transform bitbucketlistrepos [options] <nodes...>            List Bitbucket repositories.  [aliases: bitbucket_list_repos, bblr]
  pown recon transform bitbucketlistsnippets [options] <nodes...>         List Bitbucket snippets.  [aliases: bitbucket_list_snippets, bbls]
  pown recon transform bitbucketlistteamrepos [options] <nodes...>        List Bitbucket team repos.  [aliases: bitbucket_list_team_repos, bbltr]
  pown recon transform bitbucketlistteammembers [options] <nodes...>      List Bitbucket team members.  [aliases: bitbucket_list_team_members, bbltm]
  pown recon transform builtwithscraperelationships [options] <nodes...>  Performs scrape of builtwith.com relationships.  [aliases: builtwith_scrape_relationships, bwsr]
  pown recon transform cloudflarednsquery [options] <nodes...>            Query CloudFlare DNS API.  [aliases: cloudflare_dns_query, cfdq]
  pown recon transform commoncrawlindex [options] <nodes...>              Obtain a CommonCraw index for specific URL.  [aliases: commoncrawl_index, cci]
  pown recon transform crtshcndomainreport [options] <nodes...>           Obtain crt.sh domain report which helps enumerating potential target subdomains.  [aliases: crtsh_cn_domain_report, crtshcdr]
  pown recon transform crtshsandomainreport [options] <nodes...>          Obtain crt.sh domain report which helps enumerating potential target subdomains.  [aliases: crtsh_san_domain_report, crtshsdr]
  pown recon transform bakeimages [options] <nodes...>                    Convert external image into data URIs for self-embedding purposes.  [aliases: bake_images, be]
  pown recon transform dnsresolve [options] <nodes...>                    Does not do anything.  [aliases: dr, dns]
  pown recon transform dockerhublistrepos [options] <nodes...>            List the first 100 DockerHub repositories.  [aliases: dockerhub_list_repos, dhlr]
  pown recon transform githublistrepos [options] <nodes...>               List GitHub repositories.  [aliases: github_list_repos, ghlr]
  pown recon transform githublistgists [options] <nodes...>               List GitHub gists.  [aliases: github_list_gists, ghlg]
  pown recon transform githublistmembers [options] <nodes...>             List the first 100 GitHub members in org  [aliases: github_list_members, ghlm]
  pown recon transform gravatar [options] <nodes...>                      Get gravatar.
  pown recon transform hackertargetreverseiplookup [options] <nodes...>   Obtain reverse IP information from hackertarget.com.  [aliases: hackertarget_reverse_ip_lookup, htril]
  pown recon transform hackertargetonlineportscan [options] <nodes...>    Obtain port information from hackertarget.com.  [aliases: hackertarget_online_port_scan, htps]
  pown recon transform hibpreport [options] <nodes...>                    Obtain haveibeenpwned.com breach report.  [aliases: hibp_report, hibpr]
  pown recon transform httpfingerprint [options] <nodes...>               Performs a fingerprint on the HTTP server and application.  [aliases: http_fingerprint, hf]
  pown recon transform pkslookupkeys [options] <nodes...>                 Look the the PKS database at pool.sks-keyservers.net which pgp.mit.edu is part of.  [aliases: pks_lookup_keys, pkslk]
  pown recon transform pwndbsearch [options] <nodes...>                   Searching the PownDB database  [aliases: pwndb_search, pds]
  pown recon transform riddleripsearch [options] <nodes...>               Searches for IP references using F-Secure riddler.io.  [aliases: riddler_ip_search, rdis]
  pown recon transform riddlerdomainsearch [options] <nodes...>           Searches for Domain references using F-Secure riddler.io.  [aliases: riddler_domain_search, rdds]
  pown recon transform securitytrailssuggestions [options] <nodes...>     Get a list of domain suggestions from securitytrails.com.  [aliases: securitytrails_domain_suggestions, stds]
  pown recon transform securitytrailsdomainreport [options] <nodes...>    Get a domain report from securitytrails.com.  [aliases: securitytrails_domain_report, stdr]
  pown recon transform shodansslsearch [options] <nodes...>               Performs search using SSL filter.  [aliases: shodan_ssl_search, sss]
  pown recon transform tcpportscan [options] <nodes...>                   Simple port scanner  [aliases: tcp_port_scan, tps]
  pown recon transform threatcrowddomainreport [options] <nodes...>       Obtain threatcrowd domain report which helps enumerating potential target subdomains and email addresses.  [aliases: threatcrowd_domain_report, tcdr]
  pown recon transform threatcrowdipreport [options] <nodes...>           Obtain threatcrowd ip report which helps enumerating virtual hosts.  [aliases: threatcrowd_ip_report, tcir]
  pown recon transform urlscanliveshot [options] <nodes...>               Generates a liveshot of any public site via urlscan.  [aliases: urlscan_liveshot, usls]
  pown recon transform urlscanliveshotsearchengines [options] <nodes...>  Generates a liveshot of a number of search engines.  [aliases: urlscan_liveshot_search_engines, uslsse]
  pown recon transform nop [options] <nodes...>                           Does not do anything.
  pown recon transform splitemail [options] <nodes...>                    Split email.  [aliases: split_email, se]
  pown recon transform buildemail [options] <nodes...>                    Build email.  [aliases: build_email, be]
  pown recon transform splitdomain [options] <nodes...>                   Split domain.  [aliases: split_domain, ss]
  pown recon transform builddomain [options] <nodes...>                   Build domain.  [aliases: build_domain, bd]
  pown recon transform splituri [options] <nodes...>                      Split URI.  [aliases: split_uri, su]
  pown recon transform builduri [options] <nodes...>                      Build URI.  [aliases: build_uri, bu]
  pown recon transform analyzeip [options] <nodes...>                     Analyze IP.  [aliases: analyze_ip, ai]
  pown recon transform wappalyzerprofile [options] <nodes...>             Enumerate technologies with api.wappalyzer.com.  [aliases: wappalyzer_profile, wzp]
  pown recon transform whoaretheyreport [options] <nodes...>              Find social accounts with the help of whoarethey database.  [aliases: whoarethey_report, whoarethey, wmnr, wmn]
  pown recon transform auto [options] <nodes...>                          Select the most appropriate methods of transformation

Options:
  --version    Show version number  [boolean]
  --help       Show help  [boolean]
  --read, -r   Read file  [string]
  --write, -w  Write file  [string]
```

### `pown recon select`

```
pown recon select <expressions...>

Select nodes

Options:
  --version            Show version number  [boolean]
  --help               Show help  [boolean]
  --read, -r           Read file  [string]
  --write, -w          Write file  [string]
  --output-format, -o  Output format  [string] [choices: "table", "grid", "csv", "json"] [default: "table"]
  --output-fields      Output fields  [string] [default: ""]
  --output-ids         Output ids  [boolean] [default: false]
  --output-labels      Output labels  [boolean] [default: false]
  --output-images      Output images  [boolean] [default: false]
  --output-parents     Output parents  [boolean] [default: false]
  --output-tags        Output tags  [boolean] [default: false]
```

### `pown recon traverse`

```
pown recon traverse <expressions...>

Traverse nodes

Options:
  --version            Show version number  [boolean]
  --help               Show help  [boolean]
  --read, -r           Read file  [string]
  --write, -w          Write file  [string]
  --output-format, -o  Output format  [string] [choices: "table", "grid", "csv", "json"] [default: "table"]
  --output-fields      Output fields  [string] [default: ""]
  --output-ids         Output ids  [boolean] [default: false]
  --output-labels      Output labels  [boolean] [default: false]
  --output-images      Output images  [boolean] [default: false]
  --output-parents     Output parents  [boolean] [default: false]
  --output-tags        Output tags  [boolean] [default: false]
```

### `pown recon add`

```
pown recon add <nodes...>

Add nodes

Options:
  --version            Show version number  [boolean]
  --help               Show help  [boolean]
  --group, -g          Group nodes  [string] [default: ""]
  --node-type          The type for new nodes from the command line  [string] [default: "string"]
  --read, -r           Read file  [string]
  --write, -w          Write file  [string]
  --output-format, -o  Output format  [string] [choices: "table", "grid", "csv", "json"] [default: "table"]
  --output-fields      Output fields  [string] [default: ""]
  --output-ids         Output ids  [boolean] [default: false]
  --output-labels      Output labels  [boolean] [default: false]
  --output-images      Output images  [boolean] [default: false]
  --output-parents     Output parents  [boolean] [default: false]
  --output-tags        Output tags  [boolean] [default: false]
```

### `pown recon remove`

```
pown recon remove <selectors...>

Remove nodes

Options:
  --version            Show version number  [boolean]
  --help               Show help  [boolean]
  --read, -r           Read file  [string]
  --write, -w          Write file  [string]
  --output-format, -o  Output format  [string] [choices: "table", "grid", "csv", "json"] [default: "table"]
  --output-fields      Output fields  [string] [default: ""]
  --output-ids         Output ids  [boolean] [default: false]
  --output-labels      Output labels  [boolean] [default: false]
  --output-images      Output images  [boolean] [default: false]
  --output-parents     Output parents  [boolean] [default: false]
  --output-tags        Output tags  [boolean] [default: false]
```

### `pown recon merge`

```
pown recon merge <files...>

Perform a merge between at least two recon files

Options:
  --version    Show version number  [boolean]
  --help       Show help  [boolean]
  --write, -w  Write file  [string]
```

### `pown recon diff`

```
pown recon diff <fileA> <fileB>

Perform a diff between two recon files

Options:
  --version            Show version number  [boolean]
  --help               Show help  [boolean]
  --subset, -s         The subset to select  [choices: "left", "right", "both"] [default: "left"]
  --write, -w          Write file  [string]
  --output-format, -o  Output format  [string] [choices: "table", "grid", "csv", "json"] [default: "table"]
  --output-fields      Output fields  [string] [default: ""]
  --output-ids         Output ids  [boolean] [default: false]
  --output-labels      Output labels  [boolean] [default: false]
  --output-images      Output images  [boolean] [default: false]
  --output-parents     Output parents  [boolean] [default: false]
  --output-tags        Output tags  [boolean] [default: false]
```

### `pown recon group`

```
pown recon group <name> <expressions...>

Group nodes

Options:
  --version            Show version number  [boolean]
  --help               Show help  [boolean]
  --read, -r           Read file  [string]
  --write, -w          Write file  [string]
  --output-format, -o  Output format  [string] [choices: "table", "grid", "csv", "json"] [default: "table"]
  --output-fields      Output fields  [string] [default: ""]
  --output-ids         Output ids  [boolean] [default: false]
  --output-labels      Output labels  [boolean] [default: false]
  --output-images      Output images  [boolean] [default: false]
  --output-parents     Output parents  [boolean] [default: false]
  --output-tags        Output tags  [boolean] [default: false]
```

### `pown recon ungroup`

```
pown recon ungroup <selectors...>

Ungroup nodes

Options:
  --version            Show version number  [boolean]
  --help               Show help  [boolean]
  --read, -r           Read file  [string]
  --write, -w          Write file  [string]
  --output-format, -o  Output format  [string] [choices: "table", "grid", "csv", "json"] [default: "table"]
  --output-fields      Output fields  [string] [default: ""]
  --output-ids         Output ids  [boolean] [default: false]
  --output-labels      Output labels  [boolean] [default: false]
  --output-images      Output images  [boolean] [default: false]
  --output-parents     Output parents  [boolean] [default: false]
  --output-tags        Output tags  [boolean] [default: false]
```

### `pown recon save`

```
pown recon save <file>

Save to file

Options:
  --version   Show version number  [boolean]
  --help      Show help  [boolean]
  --read, -r  Read file  [string]
```

## Preview

Generated graphs can be previewed in [SecApps Recon](https://recon.secapps.com) for convenience, which this tool is based on. You can access SecApps Recon from your browser but you can also invoke it from the command line.

First you need `@pown/apps` installed:

```sh
$ pown modules install @pown/apps
```

This will install the optional apps command package.

Generate your graph using the write options:

```sh
$ pown recon transform auto -w path/to/file.network --node-type brand target
```

Once the recon is complete, open the graph for preview in SecApps Recon:

```sh
$ pown apps recon < path/to/file.network
```

You will see a screen similar to the following:

![screenshot](https://media.githubusercontent.com/media/pownjs/pown-recon/master/screenshots/02.png)

## Scripting

Pown recon is designed to be scripted either via your favorite shell environment or [Pown Script](https://github.com/pownjs/pown-script). If you use Pown Script you will benefit from preserved context between each command execution. This means that you can build a graph without then need to save and restore into intermediate files.

Using your favourite editor create a file called `example.pown` with the following contents:

```sh
echo This is script
recon add --node-type brand target
recon t auto
```

Execute the script from pown:

```sh
$ pown script path/to/example.pown
```

For more information, see the examples.

## Selectors

> Some commands expect graph selectors. The rest of the documentation is copy of cytoscape.js selectors manual with some minor differences.

A selector functions similar to a CSS selector on DOM elements, but selectors in Recon instead work on collections of graph elements. This mechanism is provided by the powerful cytoscape.js.

The selectors can be combined together to make powerful queries, for example:

```
pown select 'node[weight >= 50][height < 180]'
```

Selectors can be joined together (effectively creating a logical OR) with commas:

```
pown select 'node#j, edge[source = "j"]'
```

It is important to note that strings need to be enclosed by quotation marks:

```
pown select 'node[type = "domain"]'
```

Note that metacharacters `( ^ $ \ / ( ) | ? + * [ ] { } , . )` need to be escaped:

pown select '#some\\$funky\\@id'

### Group, class, & ID

* `node`, `edge`, or `*` (group selector) Matches elements based on group (node for nodes, edge for edges, * for all).
* `.className` Matches elements that have the specified class (e.g. use .foo for a class named "foo").
* The `#id` Matches element with the matching ID (e.g. `#foo` is the same as `[id = 'foo']`)

### Data

* `[name]` Matches elements if they have the specified data attribute defined, i.e. not undefined (e.g. `[foo]` for an attribute named “foo”). Here, null is considered a defined value.
* `[^name]` Matches elements if the specified data attribute is not defined, i.e. undefined (e.g `[^foo]`). Here, null is considered a defined value.
* `[?name]` Matches elements if the specified data attribute is a truthy value (e.g. `[?foo]`).
* `[!name]` Matches elements if the specified data attribute is a falsey value (e.g. `[!foo]`).
* `[name = value]` Matches elements if their data attribute matches a specified value (e.g. `[foo = 'bar']` or `[num = 2]`).
* `[name != value]` Matches elements if their data attribute doesn’t match a specified value (e.g. `[foo != 'bar']` or `[num != 2]`).
* `[name > value]` Matches elements if their data attribute is greater than a specified value (e.g. `[foo > 'bar']` or `[num > 2]`).
* `[name >= value]` Matches elements if their data attribute is greater than or equal to a specified value (e.g. `[foo >= 'bar']` or `[num >= 2]`).
* `[name < value]` Matches elements if their data attribute is less than a specified value (e.g. `[foo < 'bar']` or `[num < 2]`).
* `[name <= value]` Matches elements if their data attribute is less than or equal to a specified value (e.g. `[foo <= 'bar']` or `[num <= 2]`).
* `[name *= value]` Matches elements if their data attribute contains the specified value as a substring (e.g. `[foo *= 'bar']`).
* `[name ^= value]` Matches elements if their data attribute starts with the specified value (e.g. `[foo ^= 'bar']`).
* `[name $= value]` Matches elements if their data attribute ends with the specified value (e.g. `[foo $= 'bar']`).
* `@` (data attribute operator modifier) Prepended to an operator so that is case insensitive (e.g. `[foo @$= 'ar']`, `[foo @>= 'a']`, `[foo @= 'bar']`)
* `!` (data attribute operator modifier) Prepended to an operator so that it is negated (e.g. `[foo !$= 'ar']`, `[foo !>= 'a']`)
* `[[]]` (metadata brackets) Use double square brackets in place of square ones to match against metadata instead of data (e.g. `[[degree > 2]]` matches elements of degree greater than 2). The properties that are supported include `degree`, `indegree`, and `outdegree`.

### Compound nodes

* `>` (child selector) Matches direct children of the parent node (e.g. `node > node`).
* ` ` (descendant selector) Matches descendants of the parent node (e.g. `node node`).
* `$` (subject selector) Sets the subject of the selector (e.g. `$node > node` to select the parent nodes instead of the children).

## Transforms

* GitHub Search of Repos, Gists and Members
* Bitbucket Search of Repos, Snippets and Members
* CloudFlare 1.1.1.1 DNS API
* CRTSH (CN & SAN)
* DockerHub Repo Search
* Gravatar URLs
* Hacker Target Reverse IP Lookup
* Have I Been Pwned Lookup
* PKS Lookup
* Urlscan Live Shot
* Threatcrowd Lookup
* Wappalyzer
* AWS IAM Pages
* Builtwith
* Riddler
* CommonCraw
* Archive.org
* Shodan
* WhatsMyName
* Utility Transforms
* Security Trails
* Auto Recon

## Tutorial

To demonstrate the power of Pown Recon and graph-based OSINT (Open Source Intelligence), let's have a look at the following trivial example.

Let's start by querying everyone who is a member of Google's engineering team and contributes to their GitHub account.

```sh
pown recon t -w google.network ghlm google
```

This command will generate a table similar to this:

```
   github:member
┌─────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┐
│ uri                                                     │ login                                                   │ avatar                                                  │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ https://github.com/3rf                                  │ 3rf                                                     │ https://avatars1.githubusercontent.com/u/1242478?v=4    │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ https://github.com/aaroey                               │ aaroey                                                  │ https://avatars0.githubusercontent.com/u/31743510?v=4   │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ https://github.com/aarongable                           │ aarongable                                              │ https://avatars3.githubusercontent.com/u/2474926?v=4    │
...
...
...
│ https://github.com/alexpennace                          │ alexpennace                                             │ https://avatars1.githubusercontent.com/u/2506548?v=4    │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ https://github.com/alexv                                │ alexv                                                   │ https://avatars0.githubusercontent.com/u/30807372?v=4   │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ https://github.com/alexwhouse                           │ alexwhouse                                              │ https://avatars3.githubusercontent.com/u/1448490?v=4    │
└─────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────┘
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

```
   github:repo
┌──────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────┐
│ uri                                                                                  │ fullName                                                                             │
├──────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
│ https://github.com/3rf/2015-talks                                                    │ 3rf/2015-talks                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
│ https://github.com/3rf/codecoroner                                                   │ 3rf/codecoroner                                                                      │
├──────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
│ https://github.com/3rf/DefinitelyTyped                                               │ 3rf/DefinitelyTyped                                                                  │
...
...
...
│ https://github.com/agau4779/ultimate-tic-tac-toe                                     │ agau4779/ultimate-tic-tac-toe                                                        │
├──────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
│ https://github.com/agau4779/worm_scraper                                             │ agau4779/worm_scraper                                                                │
├──────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────┤
│ https://github.com/agau4779/zsearch                                                  │ agau4779/zsearch                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────┘
```

Since now we have two files `google.network` and `google2.network` you might be wondering what is the difference between them. Well, we have a tool for doing just that.

```sh
pown recon diff google.network google2.network
```

Now we know! This feature is quite useful if you are building large recon maps and you would like to know what are the key differences. Imagine your cron job performs the same recon every day and you would like to know if something new just appeared which might be worth exploring further. Hello, bug bounty hunters!
