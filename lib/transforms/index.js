exports["awsIamEndpoints"] = {
    "alias": [
        "aws_iam_endpoints",
        "awsie"
    ],
    "title": "AWS Endpoints",
    "description": "Enumeration AWS IAM Endpoints",
    "types": [
        "*"
    ],
    "options": {}
}

exports["awsIamEndpoints"].load = function () { return require("./aws.js")["awsIamEndpoints"] }

exports["builtwithScrapeRelationships"] = {
    "alias": [
        "builtwith_scrape_relationships",
        "bwsr"
    ],
    "title": "Scrape Builtwith Relationships",
    "description": "Performs scrape of builtwith relationships",
    "types": [
        "*"
    ],
    "options": {}
}

exports["builtwithScrapeRelationships"].load = function () { return require("./builtwith.js")["builtwithScrapeRelationships"] }

exports["cloudflareDnsQuery"] = {
    "alias": [
        "cloudflare_dns_query",
        "cfdq"
    ],
    "title": "CloudFlare DNS Query",
    "description": "Query CloudFlare DNS API",
    "types": [
        "*"
    ],
    "options": {
        "type": {
            "description": "Record type",
            "default": "A"
        }
    }
}

exports["cloudflareDnsQuery"].load = function () { return require("./cloudflare.js")["cloudflareDnsQuery"] }

exports["crtshDomainReport"] = {
    "alias": [
        "crtsh_domain_report",
        "crtshdr"
    ],
    "title": "CRT.SH Domain Report",
    "description": "Obtain crt.sh domain report which helps enumerating potential target subdomains.",
    "types": [
        "*"
    ],
    "options": {}
}

exports["crtshDomainReport"].load = function () { return require("./crtsh.js")["crtshDomainReport"] }

exports["dockerhubListRepos"] = {
    "alias": [
        "dockerhub_list_repos",
        "dhlr"
    ],
    "title": "List DockerHub Repos",
    "description": "List the first 100 DockerHub repositories",
    "types": [
        "*"
    ],
    "options": {}
}

exports["dockerhubListRepos"].load = function () { return require("./dockerhub.js")["dockerhubListRepos"] }

exports["githubListRepos"] = {
    "alias": [
        "github_list_repos",
        "ghlr"
    ],
    "title": "List GitHub Repos",
    "description": "List the first 100 GitHub repositories",
    "types": [
        "*"
    ],
    "options": {}
}

exports["githubListRepos"].load = function () { return require("./github.js")["githubListRepos"] }

exports["githubListMembers"] = {
    "alias": [
        "github_list_members",
        "ghlm"
    ],
    "title": "List GitHub Members",
    "description": "List the first 100 GitHub members in org",
    "types": [
        "*"
    ],
    "options": {}
}

exports["githubListMembers"].load = function () { return require("./github.js")["githubListMembers"] }

exports["gravatar"] = {
    "alias": [],
    "title": "Gravatar",
    "description": "Get gravatar",
    "types": [
        "*"
    ],
    "options": {}
}

exports["gravatar"].load = function () { return require("./gravatar.js")["gravatar"] }

exports["hackertargetReverseIpLookup"] = {
    "alias": [
        "hackertarget_reverse_ip_lookup",
        "htril"
    ],
    "title": "HackerTarget Reverse IP Lookup",
    "description": "Obtain reverse IP information from hackertarget.com.",
    "types": [
        "*"
    ],
    "options": {}
}

exports["hackertargetReverseIpLookup"].load = function () { return require("./hackertarget.js")["hackertargetReverseIpLookup"] }

exports["hibpReport"] = {
    "alias": [
        "hibp_report",
        "hibpr"
    ],
    "title": "HIBP Report",
    "description": "Obtain haveibeenpwned.com breach report.",
    "types": [
        "*"
    ],
    "options": {}
}

exports["hibpReport"].load = function () { return require("./hibp.js")["hibpReport"] }

exports["pksLookupKeys"] = {
    "alias": [
        "pks_lookup_keys",
        "pkslk"
    ],
    "title": "PKS Lookup",
    "description": "Look the the PKS database at pool.sks-keyservers.net which pgp.mit.edu is part of.",
    "types": [
        "*"
    ],
    "options": {}
}

exports["pksLookupKeys"].load = function () { return require("./pks.js")["pksLookupKeys"] }

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
    "options": {}
}

exports["threatcrowdDomainReport"].load = function () { return require("./threatcrowd.js")["threatcrowdDomainReport"] }

exports["threatcrowdIpReport"] = {
    "alias": [
        "threatcrowd_ip_report",
        "tcir"
    ],
    "title": "Threatcrowd IP Report",
    "description": "Obtain threatcrowd ip report which helps enumerating virtual hosts.",
    "types": [
        "*"
    ],
    "options": {}
}

exports["threatcrowdIpReport"].load = function () { return require("./threatcrowd.js")["threatcrowdIpReport"] }

exports["urlscanLiveshot"] = {
    "alias": [
        "usls"
    ],
    "title": "Urlscan Liveshot",
    "description": "Generates a liveshot of any public site via urlscan.",
    "types": [
        "*"
    ],
    "options": {}
}

exports["urlscanLiveshot"].load = function () { return require("./urlscan.js")["urlscanLiveshot"] }

exports["wappalyzerProfile"] = {
    "alias": [
        "wappalyzer_profile",
        "wzp"
    ],
    "title": "Wappalyzer Profile",
    "description": "Enumerate technologies with api.wappalyzer.com",
    "types": [
        "*"
    ],
    "options": {}
}

exports["wappalyzerProfile"].load = function () { return require("./wappalyzer.js")["wappalyzerProfile"] }

exports["zoomeyeScrapeSearchResults"] = {
    "alias": [
        "zoomeye_scrape_search_results",
        "zyssr"
    ],
    "title": "Scrape ZoomEye Search Results",
    "description": "Performs first page scrape on ZoomEye search results",
    "types": [
        "*"
    ],
    "options": {}
}

exports["zoomeyeScrapeSearchResults"].load = function () { return require("./zoomeye.js")["zoomeyeScrapeSearchResults"] }
