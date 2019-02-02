// WARNING: This is an auto-generated file.

exports["archiveIndex"] = {
    "alias": [
        "archive_index",
        "arci"
    ],
    "title": "Archive.org Index",
    "description": "Obtain archive.org index for specific URL.",
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
    "types": [
        "brand"
    ],
    "options": {},
    "noise": 1
}

exports["awsIamEndpoints"].load = function () { return require("./aws")["awsIamEndpoints"] }

// WARNING: This is an auto-generated file.

exports["builtwithScrapeRelationships"] = {
    "alias": [
        "builtwith_scrape_relationships",
        "bwsr"
    ],
    "title": "Scrape Builtwith Relationships",
    "description": "Performs scrape of builtwith.com relationships",
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
    "types": [
        "domain",
        "ipv4",
        "ipv6"
    ],
    "options": {
        "type": {
            "description": "Record type",
            "type": "string",
            "default": "A"
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
    "types": [
        "domain"
    ],
    "options": {},
    "noise": 1
}

exports["crtshDomainReport"].load = function () { return require("./crtsh")["crtshDomainReport"] }

// WARNING: This is an auto-generated file.

exports["dockerhubListRepos"] = {
    "alias": [
        "dockerhub_list_repos",
        "dhlr"
    ],
    "title": "List DockerHub Repos",
    "description": "List the first 100 DockerHub repositories.",
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

exports["hibpReport"] = {
    "alias": [
        "hibp_report",
        "hibpr"
    ],
    "title": "HIBP Report",
    "description": "Obtain haveibeenpwned.com breach report.",
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
    "types": [
        "domain"
    ],
    "options": {},
    "noise": 1
}

exports["riddlerDomainSearch"].load = function () { return require("./riddler")["riddlerDomainSearch"] }

// WARNING: This is an auto-generated file.

exports["threatcrowdDomainReport"] = {
    "alias": [
        "threatcrowd_domain_report",
        "tcdr"
    ],
    "title": "Threatcrowd Domain Report",
    "description": "Obtain threatcrowd domain report which helps enumerating potential target subdomains and email addresses.",
    "types": [
        "*"
    ],
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
    "types": [],
    "options": {},
    "noise": 1
}

exports["nop"].load = function () { return require("./utils")["nop"] }

// WARNING: This is an auto-generated file.

exports["splitEmail"] = {
    "alias": [
        "se"
    ],
    "title": "Split Email",
    "description": "Split email.",
    "types": [
        "email"
    ],
    "options": {},
    "noise": 20
}

exports["splitEmail"].load = function () { return require("./utils")["splitEmail"] }

// WARNING: This is an auto-generated file.

exports["splitUri"] = {
    "alias": [
        "su"
    ],
    "title": "Split URI",
    "description": "Split URI.",
    "types": [
        "uri"
    ],
    "options": {},
    "noise": 20
}

exports["splitUri"].load = function () { return require("./utils")["splitUri"] }

// WARNING: This is an auto-generated file.

exports["buildUri"] = {
    "alias": [
        "bu"
    ],
    "title": "Build URI",
    "description": "Build URI.",
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
    "noise": 20
}

exports["buildUri"].load = function () { return require("./utils")["buildUri"] }

// WARNING: This is an auto-generated file.

exports["wappalyzerProfile"] = {
    "alias": [
        "wappalyzer_profile",
        "wzp"
    ],
    "title": "Wappalyzer Profile",
    "description": "Enumerate technologies with api.wappalyzer.com.",
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
    "types": [],
    "options": {},
    "noise": 9
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
    "types": [
        "domain",
        "ipv4",
        "ipv6"
    ],
    "options": {},
    "noise": 1
}

exports["zoomeyeScrapeSearchResults"].load = function () { return require("./zoomeye")["zoomeyeScrapeSearchResults"] }
