const relationalDatabases = {
    MaxDB: [7210],
    MySQL: [3306],
    OracleDB: [1521, 1830],
    PostgreSQL: [5432],
    MSSQL: [1433, 1434],
    Sphinx: [9306]
}

const nosqlDatabases = {
    ArangoDB: [8529],
    Cassandra: [7000, 7001, 9042],
    CouchDB: [5984],
    Elasticsearch: [9200, 9243, 9300],
    MongoDB: [27017, 27018, 27019, 28017],
    Neo4J: [7473, 7474],
    Redis: [6379],
    Riak: [8087, 8098],
    RethinkDB: [8080, 28015, 29015],
    Solr: [7574, 8983]
}

const webApplicationServers = {
    JBoss: [3528, 3529, 4447, 8009, 8080, 8443, 9990, 9999],
    Jetty: [8080],
    Tomcat: [8005, 8009, 8080],
    WildFly: [4712, 4713, 8009, 8080, 8443, 9990, 9993],
    WebLogic: [5556, 7001, 7002, 8001],
    WebSphere: [8008, 9043, 9060, 9080, 9443]
}

const containerStores = {
    Consul: [8300, 8301, 8302, 8400, 8500, 8600],
    etcd: [2379, 2380],
    Kubernetes: [6443, 8080],
    Mesos: [5050, 5051],
    ZooKeeper: [2181, 2888, 3888]
}

const defaultProtocols = {
    DNS: [53],
    DNSTLS: [853],
    FTP: [20, 21],
    FTPS: [989, 990],
    HTTP: [80],
    HTTPS: [443],
    IMAP: [143],
    IMAPS: [993],
    Kerberos: [543, 544, 749, 750, 751, 752, 753, 754, 760],
    LDAP: [389, 636],
    NetBIOS: [137, 138, 139],
    NFS: [944],
    NTP: [123],
    RPC: [530],
    RSH: [514],
    rsync: [873],
    SMB: [445],
    SNMP: [161, 162, 199],
    SSH: [22],
    Telnet: [23, 992],
    SMTP: [25],
    SMTPTLS: [465],
    WHOIS: [43]
}

const categories = {
    relationalDatabases,

    nosqlDatabases,

    webApplicationServers,

    containerStores,

    defaultProtocols
}

const services = Object.assign({}, ...Object.values(categories))

const ports = Object.entries(services).reduce((acc, [service, ports]) => {
    ports.forEach((port) => {
        if (!acc[port]) {
            acc[port] = []
        }

        acc[port].push(service)
    })

    return acc
}, {})

const protocols = {
    'HTTP': [80, 9200],
    'HTTPS': [443, 6443, 7443, 8443, 9243, 9443]
}

module.exports = { categories, services, ports, protocols }
