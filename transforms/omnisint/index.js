const { SubdomainTransform } = require('../../lib//common')

const { DOMAIN_TYPE } = require('../../lib//types')

class OmnisintSubdomainReport extends SubdomainTransform {
    static alias = ['omnisint_subdomain_report'];

    static title = 'Omnisint Subdomain Report';

    static description = 'Obtain omnisint domain report which helps enumerating target subdomains';

    static types = [DOMAIN_TYPE];

    static group = 'Omnisint Subdomain Report';

    static tags = ['ce'];

    static options = {};

    static priority = 1;

    static noise = 1;

    async getResults(domain) {
        const json = await this.scheduler.tryRequest({ uri: `https://sonar.omnisint.io/subdomains/${domain}`, toJson: true })

        return { subdomains: [...new Set(json)].map((subdomain) => ({ subdomain })) }
    }
}

module.exports = { OmnisintSubdomainReport }
