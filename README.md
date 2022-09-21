[![License](https://img.shields.io/badge/license-MIT-_red.svg)](https://opensource.org/licenses/MIT)
[![Follow on Twitter](https://img.shields.io/twitter/follow/pownjs.svg?logo=twitter)](https://twitter.com/pownjs)
[![NPM](https://img.shields.io/npm/v/@pown/recon.svg)](https://www.npmjs.com/package/@pown/recon)
[![Fury](https://img.shields.io/badge/version-2x%20Fury-red.svg)](https://github.com/pownjs/lobby)
![default workflow](https://github.com/pownjs/git/actions/workflows/default.yaml/badge.svg)
[![SecApps](https://img.shields.io/badge/credits-SecApps-black.svg)](https://secapps.com)

# Recon

Recon is a target reconnaissance framework powered by knowledge graphs. Using knowledge graphs instead of flat table representation is easier to find the relationships between different types of information, which comes quite handy in many situations. Knowledge graphs algorithms also help with diffing, searching, finding the shortest path, and many other helpful tasks to aid information discovery and intelligence gathering.

## Credits

This tool is part of [secapps.com](https://secapps.com) open-source initiative.

```
  ___ ___ ___   _   ___ ___  ___
 / __| __/ __| /_\ | _ \ _ \/ __|
 \__ \ _| (__ / _ \|  _/  _/\__ \
 |___/___\___/_/ \_\_| |_|  |___/
  https://secapps.com
```

> **NB**: Recon is the result of an almost direct copy of SecApps' excellent [Recon](https://recon.secapps.com) tool.

## Quickstart

This tool is meant to be used as part of [Pown.js](https://github.com/pownjs/pown) but it can be invoked separately as an independent tool.

Install Pown first as usual:

```sh
$ npm install -g pown@latest
```

Install recon:

```sh
$ pown modules install @pown/recon
```

Invoke directly from Pown:

```sh
$ pown recon
```

## Standalone Use

Install this module locally from the root of your project:

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

## Library Use

The module is also a library. Check out the code and examples for idea how to use. Documentation is coming soon.

## Usage

> **WARNING**: This pown command is currently under development and as a result will be subject to breaking changes.

```
pown-cli recon <command>

Target recon

Commands:
  pown-cli recon transform <transform>          Perform inline transformation  [aliases: t]
  pown-cli recon template <command>             Recon template commands  [aliases: p, templates]
  pown-cli recon select <expressions...>        Select nodes  [aliases: s]
  pown-cli recon traverse <expressions...>      Traverse nodes  [aliases: v]
  pown-cli recon options <command>              Manage options  [aliases: option]
  pown-cli recon cache <command>                Manage cache
  pown-cli recon add <nodes...>                 Add nodes  [aliases: a]
  pown-cli recon remove <expressions...>        Remove nodes  [aliases: r]
  pown-cli recon edit <expressions...>          Edit nodes  [aliases: e]
  pown-cli recon merge <files...>               Perform a merge between at least two recon files  [aliases: m]
  pown-cli recon diff <fileA> <fileB>           Perform a diff between two recon files  [aliases: d]
  pown-cli recon group <name> <expressions...>  Group nodes  [aliases: g]
  pown-cli recon ungroup <expressions...>       Ungroup nodes  [aliases: u]
  pown-cli recon load <file>                    Load a file  [aliases: l]
  pown-cli recon save <file>                    Save to file  [aliases: o]
  pown-cli recon import <file>                  Import file  [aliases: i]
  pown-cli recon export <file>                  Export to file  [aliases: x]
  pown-cli recon remote <command>               Remote managment  [aliases: remotes, f]
  pown-cli recon layout <name>                  Layout the graph  [aliases: k]
  pown-cli recon summary [options]              Create a summary  [aliases: y]
  pown-cli recon exec <files...>                Execute js file  [aliases: c]

Options:
  --version  Show version number  [boolean]
  --help     Show help  [boolean]

pown-cli recon transform <transform>

Perform inline transformation

Commands:
  pown-cli recon transform bitbucketlistrepos [options] <nodes...>            List Bitbucket repositories  [aliases: bitbucket_list_repos, bblr]
  pown-cli recon transform bitbucketlistsnippets [options] <nodes...>         List Bitbucket snippets  [aliases: bitbucket_list_snippets, bbls]
  pown-cli recon transform bitbucketlistteamrepos [options] <nodes...>        List Bitbucket team repos  [aliases: bitbucket_list_team_repos, bbltr]
  pown-cli recon transform bitbucketlistteammembers [options] <nodes...>      List Bitbucket team members  [aliases: bitbucket_list_team_members, bbltm]
  pown-cli recon transform bufferoverrunsubdomainsearch [options] <nodes...>  Obtain a list of subdomains using bufferover.run DNS service  [aliases: bufferoverrun_subdomain_search, brss]
  pown-cli recon transform certspotterissuances [options] <nodes...>          Obtain issuances from Certspotter  [aliases: certspotter_issuances, csi]
  pown-cli recon transform cloudflarednsquery [options] <nodes...>            Query CloudFlare DNS API  [aliases: cloudflare_dns_query, cfdq]
  pown-cli recon transform crtshcndomainreport [options] <nodes...>           Obtain crt.sh domain report which helps enumerating potential target subdomains  [aliases: crtsh_cn_domain_report, crtshcdr]
  pown-cli recon transform crtshsandomainreport [options] <nodes...>          Obtain crt.sh domain report which helps enumerating potential target subdomains  [aliases: crtsh_san_domain_report, crtshsdr]
  pown-cli recon transform dnsresolve [options] <nodes...>                    Performs DNS resolution  [aliases: dns_resolve, dr, dns]
  pown-cli recon transform dockerhublistrepos [options] <nodes...>            List DockerHub repositories for a given member or org  [aliases: dockerhub_list_repos, dhlr]
  pown-cli recon transform gravatar [options] <nodes...>                      Get gravatar
  pown-cli recon transform hackertargetreverseiplookup [options] <nodes...>   Obtain reverse IP information from hackertarget.com  [aliases: hackertarget_reverse_ip_lookup, htril]
  pown-cli recon transform hackertargetonlineportscan [options] <nodes...>    Obtain port information from hackertarget.com  [aliases: hackertarget_online_port_scan, htps]
  pown-cli recon transform httpfingerprint [options] <nodes...>               Performs a fingerprint on the HTTP server and application  [aliases: http_fingerprint, hf]
  pown-cli recon transform ipinfoiowidgetsearch [options] <nodes...>          Obtain ipinfo.io whois report via the web widget  [aliases: ipinfoio_widget_search, iiiows]
  pown-cli recon transform omnisintsubdomainreport [options] <nodes...>       Obtain omnisint domain report which helps enumerating target subdomains  [aliases: omnisint_subdomain_report]
  pown-cli recon transform pkslookupkeys [options] <nodes...>                 Look the the PKS database at pool.sks-keyservers.net which pgp.mit.edu is part of  [aliases: pks_lookup_keys, pkslk]
  pown-cli recon transform pwndbsearch [options] <nodes...>                   Searching the PwnDB database  [aliases: pwndb_search, pds]
  pown-cli recon transform riddleripsearch [options] <nodes...>               Searches for IP references using F-Secure riddler.io  [aliases: riddler_ip_search, rdis]
  pown-cli recon transform riddlerdomainsearch [options] <nodes...>           Searches for Domain references using F-Secure riddler.io  [aliases: riddler_domain_search, rdds]
  pown-cli recon transform script [options] <nodes...>                        Perform transformation with external script  [aliases: script]
  pown-cli recon transform scyllasearch [options] <nodes...>                  Searching the Scylla database  [aliases: scylla_search, scys]
  pown-cli recon transform securitytrailssuggestions [options] <nodes...>     Get a list of domain suggestions from securitytrails.com  [aliases: securitytrails_domain_suggestions, stds]
  pown-cli recon transform shodanorgsearch [options] <nodes...>               Performs search using ORG filter  [aliases: shodan_org_search, sos]
  pown-cli recon transform shodansslsearch [options] <nodes...>               Performs search using SSL filter  [aliases: shodan_ssl_search, sss]
  pown-cli recon transform spysesubdomains [options] <nodes...>               Performs subdomain searching with Spyse  [aliases: spyse_subdomains, ssds]
  pown-cli recon transform tcpportscan [options] <nodes...>                   Simple, full-handshake TCP port scanner (very slow and sometimes inaccurate)  [aliases: tcp_port_scan, tps]
  pown-cli recon transform threatcrowddomainreport [options] <nodes...>       Obtain threatcrowd domain report which helps enumerating potential target subdomains and email addresses  [aliases: threatcrowd_domain_report, tcdr]
  pown-cli recon transform threatcrowdipreport [options] <nodes...>           Obtain threatcrowd ip report which helps enumerating virtual hosts  [aliases: threatcrowd_ip_report, tcir]
  pown-cli recon transform urlscanliveshot [options] <nodes...>               Generates a liveshot of any public site via urlscan  [aliases: urlscan_liveshot, usls]
  pown-cli recon transform urlscansubdomains [options] <nodes...>             Find subdomains via urlscan  [aliases: urlscan_subdomains, uss]
  pown-cli recon transform noop [options] <nodes...>                          Does not do anything  [aliases: nop]
  pown-cli recon transform sleep [options] <nodes...>                         Sleeps for predefined time  [aliases: sleep, wait]
  pown-cli recon transform duplicate [options] <nodes...>                     Duplicate node  [aliases: dup]
  pown-cli recon transform extract [options] <nodes...>                       Extract property  [aliases: excavate]
  pown-cli recon transform prefix [options] <nodes...>                        Creates a new node with a prefix  [aliases: prepand]
  pown-cli recon transform suffix [options] <nodes...>                        Creates a new node with a suffix  [aliases: append]
  pown-cli recon transform augment [options] <nodes...>                       Update node with prefix or suffix
  pown-cli recon transform splitemail [options] <nodes...>                    Split email at the @ sign  [aliases: split_email]
  pown-cli recon transform buildemail [options] <nodes...>                    Build email from node label  [aliases: build_email]
  pown-cli recon transform splitdomain [options] <nodes...>                   Split domain at the first dot  [aliases: split_domain]
  pown-cli recon transform builddomain [options] <nodes...>                   Build domain from node label  [aliases: build_domain]
  pown-cli recon transform splituri [options] <nodes...>                      Split URI to corresponding parts  [aliases: split_uri]
  pown-cli recon transform builduri [options] <nodes...>                      Build URI from node label  [aliases: build_uri]
  pown-cli recon transform bakeimages [options] <nodes...>                    Convert external image into data URIs for self-embedding purposes  [aliases: bake_images, bes]
  pown-cli recon transform virustotalsubdomains [options] <nodes...>          Obtain subdomains from Virustotal  [aliases: virustotal_subdomains, vtsd]
  pown-cli recon transform vulnerssearch [options] <nodes...>                 Obtain vulnerability information via vulners.com  [aliases: vulners_search, vs]
  pown-cli recon transform wappalyzerprofile [options] <nodes...>             Enumerate technologies with api.wappalyzer.com  [aliases: wappalyzer_profile, wzp]
  pown-cli recon transform worker [options] <nodes...>                        Perform transformation with external worker  [aliases: worker]
  pown-cli recon transform zonecrunchersubdomains [options] <nodes...>        Performs subdomain searching with Zonecruncher  [aliases: zonecruncher_subdomains, zcss]
  pown-cli recon transform auto [options] <nodes...>                          Select the most appropriate methods of transformation

Options:
      --version  Show version number  [boolean]
      --help     Show help  [boolean]
  -r, --read     Read file  [string]
  -w, --write    Write file  [string]
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

## Scripting

Pown recon is designed to be scripted either via your favorite shell environment, [Pown Script](https://github.com/pownjs/script), [Pown Engine Templates](https://github.com/pownjs/engine) and JavaScript. Scripts benefit from preserved context between each command execution. This means that you can build a graph without then need to save and restore into intermediate files.

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

For more information, see the `./examples` for more ideas how to use scripts.

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

## Traversals

A complex type of selection is known as traversal.

## Transforms

Here are some of the transforms available in Recon. Additional transforms are available in optional pown modules.

* GitHub Search of Repos, Gists and Members (via @pown/github)
* Bitbucket Search of Repos, Snippets and Members
* CloudFlare 1.1.1.1 DNS API
* CRTSH (CN & SAN)
* DockerHub Repo Search
* Gravatar URLs
* Hacker Target Reverse IP Lookup
* PKS Lookup
* Bufferover.run
* Urlscan
* Threatcrowd
* Wappalyzer
* Riddler
* Shodan
* WhoAreThey(via @pown/whoarethey)
* Certspotter
* Virustotal
* Security Trails
* Utility Transforms
* Auto Recon

## Tutorial

To demonstrate the power of Recon and graph-based OSINT (Open Source Intelligence), let's have a look at the following trivial example.

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
