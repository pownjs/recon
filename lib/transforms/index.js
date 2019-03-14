// WARNING: This is an auto-generated file.

exports["archiveIndex"] = {
    "alias": [
        "archive_index",
        "arci"
    ],
    "title": "Archive.org Index",
    "description": "Obtain archive.org index for specific URL.",
    "tags": [],
    "types": [
        "domain",
        "uri"
    ],
    "options": {},
    "noise": 100
}

exports["archiveIndex"].load = function () { return require("./archive")["archiveIndex"] }

// WARNING: This is an auto-generated file.

exports["awsIamEndpoints"] = {
    "alias": [
        "aws_iam_endpoints",
        "awsie"
    ],
    "title": "AWS Endpoints",
    "description": "Enumerate AWS IAM endpoints.",
    "tags": [],
    "types": [
        "brand"
    ],
    "options": {},
    "noise": 1
}

exports["awsIamEndpoints"].load = function () { return require("./aws")["awsIamEndpoints"] }

// WARNING: This is an auto-generated file.

exports["bitbucketListRepos"] = {
    "alias": [
        "bitbucket_list_repos",
        "bblr"
    ],
    "title": "List Bitbucket Repos",
    "description": "List Bitbucket repositories.",
    "tags": [],
    "types": [
        "brand",
        "bitbucket:member"
    ],
    "options": {},
    "noise": 1
}

exports["bitbucketListRepos"].load = function () { return require("./bitbucket")["bitbucketListRepos"] }

// WARNING: This is an auto-generated file.

exports["bitbucketListSnippets"] = {
    "alias": [
        "bitbucket_list_snippets",
        "bbls"
    ],
    "title": "List Bitbucket Snippets",
    "description": "List Bitbucket snippets.",
    "tags": [],
    "types": [
        "brand",
        "bitbucket:member"
    ],
    "options": {},
    "noise": 1
}

exports["bitbucketListSnippets"].load = function () { return require("./bitbucket")["bitbucketListSnippets"] }

// WARNING: This is an auto-generated file.

exports["bitbucketListTeamRepos"] = {
    "alias": [
        "bitbucket_list_team_repos",
        "bbltr"
    ],
    "title": "List Bitbucket Team Repos",
    "description": "List Bitbucket team repos.",
    "tags": [],
    "types": [
        "brand",
        "bitbucket:member"
    ],
    "options": {},
    "noise": 1
}

exports["bitbucketListTeamRepos"].load = function () { return require("./bitbucket")["bitbucketListTeamRepos"] }

// WARNING: This is an auto-generated file.

exports["bitbucketListTeamMembers"] = {
    "alias": [
        "bitbucket_list_team_members",
        "bbltm"
    ],
    "title": "List Bitbucket Team Members",
    "description": "List Bitbucket team members.",
    "tags": [],
    "types": [
        "brand",
        "bitbucket:member"
    ],
    "options": {},
    "noise": 1
}

exports["bitbucketListTeamMembers"].load = function () { return require("./bitbucket")["bitbucketListTeamMembers"] }

// WARNING: This is an auto-generated file.

exports["builtwithScrapeRelationships"] = {
    "alias": [
        "builtwith_scrape_relationships",
        "bwsr"
    ],
    "title": "Scrape Builtwith Relationships",
    "description": "Performs scrape of builtwith.com relationships.",
    "tags": [],
    "types": [
        "domain"
    ],
    "options": {},
    "noise": 5
}

exports["builtwithScrapeRelationships"].load = function () { return require("./builtwith")["builtwithScrapeRelationships"] }

// WARNING: This is an auto-generated file.

exports["cloudflareDnsQuery"] = {
    "alias": [
        "cloudflare_dns_query",
        "cfdq"
    ],
    "title": "CloudFlare DNS Query",
    "description": "Query CloudFlare DNS API.",
    "tags": [
        "dns"
    ],
    "types": [
        "domain",
        "ipv4",
        "ipv6"
    ],
    "options": {
        "type": {
            "description": "Record type",
            "type": "string",
            "default": "ALL",
            "choices": [
                "ALL",
                "A",
                "AAAA",
                "CNAME",
                "MX",
                "NS",
                "TXT"
            ]
        }
    },
    "noise": 1
}

exports["cloudflareDnsQuery"].load = function () { return require("./cloudflare")["cloudflareDnsQuery"] }

// WARNING: This is an auto-generated file.

exports["commoncrawlIndex"] = {
    "alias": [
        "commoncrawl_index",
        "cci"
    ],
    "title": "CommonCrawl Index",
    "description": "Obtain a CommonCraw index for specific URL.",
    "tags": [],
    "types": [
        "domain",
        "uri"
    ],
    "options": {},
    "noise": 100
}

exports["commoncrawlIndex"].load = function () { return require("./commoncrawl")["commoncrawlIndex"] }

// WARNING: This is an auto-generated file.

exports["crtshDomainReport"] = {
    "alias": [
        "crtsh_domain_report",
        "crtshdr"
    ],
    "title": "CRT.SH Domain Report",
    "description": "Obtain crt.sh domain report which helps enumerating potential target subdomains.",
    "tags": [],
    "types": [
        "domain"
    ],
    "options": {},
    "noise": 1
}

exports["crtshDomainReport"].load = function () { return require("./crtsh")["crtshDomainReport"] }

// WARNING: This is an auto-generated file.

exports["bakeImages"] = {
    "alias": [
        "bake_images",
        "be"
    ],
    "title": "Bake Images",
    "description": "Convert external image into data URIs for self-embedding purposes.",
    "tags": [],
    "types": [
        "image",
        "screenshot",
        "gravatar"
    ],
    "options": {},
    "noise": 1000
}

exports["bakeImages"].load = function () { return require("./data")["bakeImages"] }

// WARNING: This is an auto-generated file.

exports["dnsResolve"] = {
    "alias": [
        "dr",
        "dns"
    ],
    "title": "DNS Resolve",
    "description": "Does not do anything.",
    "tags": [
        "local",
        "dns"
    ],
    "types": [
        "domain",
        "ipv4",
        "ipv6"
    ],
    "options": {
        "type": {
            "description": "Record type",
            "type": "string",
            "default": "ALL",
            "choices": [
                "ALL",
                "A",
                "AAAA",
                "CNAME",
                "MX",
                "NS",
                "TXT"
            ]
        },
        "servers": {
            "description": "DNS servers",
            "type": "string",
            "default": ""
        }
    },
    "noise": 1
}

exports["dnsResolve"].load = function () { return require("./dns")["dnsResolve"] }

// WARNING: This is an auto-generated file.

exports["dockerhubListRepos"] = {
    "alias": [
        "dockerhub_list_repos",
        "dhlr"
    ],
    "title": "List DockerHub Repos",
    "description": "List the first 100 DockerHub repositories.",
    "tags": [],
    "types": [
        "brand"
    ],
    "options": {},
    "noise": 1
}

exports["dockerhubListRepos"].load = function () { return require("./dockerhub")["dockerhubListRepos"] }

// WARNING: This is an auto-generated file.

exports["githubListRepos"] = {
    "alias": [
        "github_list_repos",
        "ghlr"
    ],
    "title": "List GitHub Repos",
    "description": "List GitHub repositories.",
    "tags": [],
    "types": [
        "brand",
        "github:member"
    ],
    "options": {
        "count": {
            "description": "Results per page",
            "type": "number",
            "default": 100
        },
        "type": {
            "description": "Repository type",
            "type": "string",
            "default": "owner"
        }
    },
    "noise": 1
}

exports["githubListRepos"].load = function () { return require("./github")["githubListRepos"] }

// WARNING: This is an auto-generated file.

exports["githubListGists"] = {
    "alias": [
        "github_list_gists",
        "ghlg"
    ],
    "title": "List GitHub Gists",
    "description": "List GitHub gists.",
    "tags": [],
    "types": [
        "brand",
        "github:member"
    ],
    "options": {
        "count": {
            "description": "Results per page",
            "type": "number",
            "default": 100
        }
    },
    "noise": 1
}

exports["githubListGists"].load = function () { return require("./github")["githubListGists"] }

// WARNING: This is an auto-generated file.

exports["githubListMembers"] = {
    "alias": [
        "github_list_members",
        "ghlm"
    ],
    "title": "List GitHub Members",
    "description": "List the first 100 GitHub members in org",
    "tags": [],
    "types": [
        "brand"
    ],
    "options": {
        "count": {
            "description": "Results per page",
            "type": "number",
            "default": 100
        }
    },
    "noise": 1
}

exports["githubListMembers"].load = function () { return require("./github")["githubListMembers"] }

// WARNING: This is an auto-generated file.

exports["gravatar"] = {
    "alias": [],
    "title": "Gravatar",
    "description": "Get gravatar.",
    "tags": [],
    "types": [
        "email"
    ],
    "options": {},
    "noise": 1
}

exports["gravatar"].load = function () { return require("./gravatar")["gravatar"] }

// WARNING: This is an auto-generated file.

exports["hackertargetReverseIpLookup"] = {
    "alias": [
        "hackertarget_reverse_ip_lookup",
        "htril"
    ],
    "title": "HackerTarget Reverse IP Lookup",
    "description": "Obtain reverse IP information from hackertarget.com.",
    "tags": [],
    "types": [
        "domain",
        "ipv4",
        "ipv6"
    ],
    "options": {},
    "noise": 1
}

exports["hackertargetReverseIpLookup"].load = function () { return require("./hackertarget")["hackertargetReverseIpLookup"] }

// WARNING: This is an auto-generated file.

exports["hackertargetOnlinePortScan"] = {
    "alias": [
        "hackertarget_online_port_scan",
        "htps"
    ],
    "title": "HackerTarget Online Port Scan",
    "description": "Obtain port information from hackertarget.com.",
    "tags": [],
    "types": [
        "domain",
        "ipv4",
        "ipv6"
    ],
    "options": {},
    "noise": 1
}

exports["hackertargetOnlinePortScan"].load = function () { return require("./hackertarget")["hackertargetOnlinePortScan"] }

// WARNING: This is an auto-generated file.

exports["hibpReport"] = {
    "alias": [
        "hibp_report",
        "hibpr"
    ],
    "title": "HIBP Report",
    "description": "Obtain haveibeenpwned.com breach report.",
    "tags": [],
    "types": [
        "email"
    ],
    "options": {},
    "noise": 1
}

exports["hibpReport"].load = function () { return require("./hibp")["hibpReport"] }

// WARNING: This is an auto-generated file.

exports["pksLookupKeys"] = {
    "alias": [
        "pks_lookup_keys",
        "pkslk"
    ],
    "title": "PKS Lookup",
    "description": "Look the the PKS database at pool.sks-keyservers.net which pgp.mit.edu is part of.",
    "tags": [],
    "types": [
        "domain",
        "email"
    ],
    "options": {},
    "noise": 1
}

exports["pksLookupKeys"].load = function () { return require("./pks")["pksLookupKeys"] }

// WARNING: This is an auto-generated file.

exports["riddlerIpSearch"] = {
    "alias": [
        "riddler_ip_search",
        "rdis"
    ],
    "title": "Riddler IP Search",
    "description": "Searches for IP references using F-Secure riddler.io.",
    "tags": [],
    "types": [
        "ipv4",
        "ipv6"
    ],
    "options": {}
}

exports["riddlerIpSearch"].load = function () { return require("./riddler")["riddlerIpSearch"] }

// WARNING: This is an auto-generated file.

exports["riddlerDomainSearch"] = {
    "alias": [
        "riddler_domain_search",
        "rdds"
    ],
    "title": "Riddler Domain Search",
    "description": "Searches for Domain references using F-Secure riddler.io.",
    "tags": [],
    "types": [
        "domain"
    ],
    "options": {},
    "noise": 1
}

exports["riddlerDomainSearch"].load = function () { return require("./riddler")["riddlerDomainSearch"] }

// WARNING: This is an auto-generated file.

exports["securitytrailsSuggestions"] = {
    "alias": [
        "securitytrails_domain_suggestions",
        "stds"
    ],
    "title": "Security Trails Domain Suggestions",
    "description": "Get a list of domain suggestions from securitytrails.com.",
    "tags": [],
    "types": [
        "brand"
    ],
    "options": {},
    "noise": 9
}

exports["securitytrailsSuggestions"].load = function () { return require("./securitytrails")["securitytrailsSuggestions"] }

// WARNING: This is an auto-generated file.

exports["securitytrailsDomainReport"] = {
    "alias": [
        "securitytrails_domain_report",
        "stdr"
    ],
    "title": "Securitytrails Domain Report",
    "description": "Get a domain report from securitytrails.com.",
    "tags": [],
    "types": [
        "domain"
    ],
    "options": {},
    "noise": 1
}

exports["securitytrailsDomainReport"].load = function () { return require("./securitytrails")["securitytrailsDomainReport"] }

// WARNING: This is an auto-generated file.

exports["threatcrowdDomainReport"] = {
    "alias": [
        "threatcrowd_domain_report",
        "tcdr"
    ],
    "title": "Threatcrowd Domain Report",
    "description": "Obtain threatcrowd domain report which helps enumerating potential target subdomains and email addresses.",
    "tags": [],
    "types": [],
    "options": {},
    "noise": 1
}

exports["threatcrowdDomainReport"].load = function () { return require("./threatcrowd")["threatcrowdDomainReport"] }

// WARNING: This is an auto-generated file.

exports["threatcrowdIpReport"] = {
    "alias": [
        "threatcrowd_ip_report",
        "tcir"
    ],
    "title": "Threatcrowd IP Report",
    "description": "Obtain threatcrowd ip report which helps enumerating virtual hosts.",
    "tags": [],
    "types": [
        "ipv4",
        "ipv6"
    ],
    "options": {}
}

exports["threatcrowdIpReport"].load = function () { return require("./threatcrowd")["threatcrowdIpReport"] }

// WARNING: This is an auto-generated file.

exports["urlscanLiveshot"] = {
    "alias": [
        "usls"
    ],
    "title": "Urlscan Liveshot",
    "description": "Generates a liveshot of any public site via urlscan.",
    "tags": [],
    "types": [
        "uri"
    ],
    "options": {},
    "noise": 1
}

exports["urlscanLiveshot"].load = function () { return require("./urlscan")["urlscanLiveshot"] }

// WARNING: This is an auto-generated file.

exports["nop"] = {
    "alias": [],
    "title": "No Op",
    "description": "Does not do anything.",
    "tags": [],
    "types": [],
    "options": {},
    "noise": 1
}

exports["nop"].load = function () { return require("./utils")["nop"] }

// WARNING: This is an auto-generated file.

exports["splitEmail"] = {
    "alias": [
        "split_email",
        "se"
    ],
    "title": "Split Email",
    "description": "Split email.",
    "tags": [],
    "types": [
        "email"
    ],
    "options": {},
    "noise": 1000
}

exports["splitEmail"].load = function () { return require("./utils")["splitEmail"] }

// WARNING: This is an auto-generated file.

exports["buildEmail"] = {
    "alias": [
        "build_email",
        "be"
    ],
    "title": "Build Email",
    "description": "Build email.",
    "tags": [],
    "types": [
        "domain"
    ],
    "options": {
        "protocol": {
            "type": "nick",
            "description": "The email nick.",
            "default": "root"
        }
    },
    "noise": 1000
}

exports["buildEmail"].load = function () { return require("./utils")["buildEmail"] }

// WARNING: This is an auto-generated file.

exports["splitDomain"] = {
    "alias": [
        "split_domain",
        "ss"
    ],
    "title": "Split Domain",
    "description": "Split domain.",
    "tags": [],
    "types": [
        "domain"
    ],
    "options": {},
    "noise": 1000
}

exports["splitDomain"].load = function () { return require("./utils")["splitDomain"] }

// WARNING: This is an auto-generated file.

exports["buildDomain"] = {
    "alias": [
        "build_domain",
        "bd"
    ],
    "title": "Build Domain",
    "description": "Build domain.",
    "tags": [],
    "types": [
        "domain"
    ],
    "options": {
        "protocol": {
            "type": "string",
            "description": "The brand",
            "default": "nic"
        }
    },
    "noise": 1000
}

exports["buildDomain"].load = function () { return require("./utils")["buildDomain"] }

// WARNING: This is an auto-generated file.

exports["splitUri"] = {
    "alias": [
        "split_uri",
        "su"
    ],
    "title": "Split URI",
    "description": "Split URI.",
    "tags": [],
    "types": [
        "uri"
    ],
    "options": {},
    "noise": 1000
}

exports["splitUri"].load = function () { return require("./utils")["splitUri"] }

// WARNING: This is an auto-generated file.

exports["buildUri"] = {
    "alias": [
        "build_uri",
        "bu"
    ],
    "title": "Build URI",
    "description": "Build URI.",
    "tags": [],
    "types": [
        "domain"
    ],
    "options": {
        "protocol": {
            "type": "string",
            "description": "The URI protocol.",
            "default": "http"
        }
    },
    "noise": 1000
}

exports["buildUri"].load = function () { return require("./utils")["buildUri"] }

// WARNING: This is an auto-generated file.

exports["analyzeIp"] = {
    "alias": [
        "analyze_ip",
        "ai"
    ],
    "title": "Analyze IP",
    "description": "Analyze IP.",
    "tags": [],
    "types": [
        "ipv4",
        "ipv6"
    ],
    "options": {},
    "noise": 5
}

exports["analyzeIp"].load = function () { return require("./utils")["analyzeIp"] }

// WARNING: This is an auto-generated file.

exports["wappalyzerProfile"] = {
    "alias": [
        "wappalyzer_profile",
        "wzp"
    ],
    "title": "Wappalyzer Profile",
    "description": "Enumerate technologies with api.wappalyzer.com.",
    "tags": [],
    "types": [
        "uri"
    ],
    "options": {},
    "noise": 1
}

exports["wappalyzerProfile"].load = function () { return require("./wappalyzer")["wappalyzerProfile"] }

// WARNING: This is an auto-generated file.

exports["whatsmynameReport"] = {
    "alias": [
        "whatsmyname_report",
        "whatsmyname",
        "wmnr",
        "wmn"
    ],
    "title": "Whatsmyname Report",
    "description": "Find social accounts with the help of whatsmyname database.",
    "tags": [],
    "types": [],
    "options": {},
    "noise": 5
}

exports["whatsmynameReport"].load = function () { return require("./whatsmyname")["whatsmynameReport"] }

// WARNING: This is an auto-generated file.

exports["zoomeyeScrapeSearchResults"] = {
    "alias": [
        "zoomeye_scrape_search_results",
        "zyssr"
    ],
    "title": "Scrape ZoomEye Search Results",
    "description": "Performs first page scrape on ZoomEye search results",
    "tags": [],
    "types": [
        "domain",
        "ipv4",
        "ipv6"
    ],
    "options": {},
    "noise": 1
}

exports["zoomeyeScrapeSearchResults"].load = function () { return require("./zoomeye")["zoomeyeScrapeSearchResults"] }
