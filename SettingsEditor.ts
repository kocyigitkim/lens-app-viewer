import fs from 'fs';
import path from 'path';
import { v4 } from 'uuid';
const currentDir: string = __dirname;
export class ServicePortSettings {
    public port: number;
    public targetPort: number;
    public name: string;
    public protocol: string;
    public constructor(initial?: any) {
        if (initial) {
            this.port = initial.port;
            this.targetPort = initial.targetPort;
            this.name = initial.name;
            this.protocol = initial.protocol;
        }
    }
}
export class ClusterServiceSettings {
    public Name: string;
    public Logo: string;
    public Namespace: string;
    public ServiceName: string;
    public Labels: any;
    public Port: ServicePortSettings;
    public Id: string;
    public constructor(initial?: any) {
        if (initial) {
            this.Id = initial.Id || initial.id;
            this.Name = initial.Name || initial.name;
            this.Logo = initial.Logo || initial.logo;
            this.Namespace = initial.Namespace || initial.namespace;
            this.ServiceName = initial.ServiceName || initial.serviceName;
            this.Labels = initial.Labels || initial.labels;
            this.Port = new ServicePortSettings(initial.Port || initial.port);
        }
    }
}
export class ClusterSettings {
    public Name: string;
    public Id: string;
    public Services: ClusterServiceSettings[] = [];
    public registerService(service: any, port: any) {
        var item: ClusterServiceSettings = new ClusterServiceSettings();
        item.Id = v4();
        item.Name = service.metadata.name;
        item.Namespace = service.metadata.namespace;
        item.ServiceName = service.metadata.name;
        item.Labels = service.metadata.labels;
        item.Port = port;
        this.Services.push(item);
    }
    public constructor(initial?: any) {
        if (initial) {
            this.Name = initial.Name || initial.name;
            this.Id = initial.Id || initial.id;
            this.Services = initial.Services.map((item: any) => new ClusterServiceSettings(item));
        }
    }
}
export class Settings {
    public Clusters: ClusterSettings[] = [];
    public constructor(initial?: any) {
        if (initial) {
            this.Clusters = initial.Clusters.map((cluster: any) => new ClusterSettings(cluster));
        }
    }
    public getCluster(id: string): ClusterSettings {
        var cluster: ClusterSettings = this.Clusters.find(c => c.Id === id);
        if (!cluster) {
            this.Clusters.push(cluster = new ClusterSettings());
            cluster.Id = id;
        }
        return cluster;
    }
}
export class SettingsEditor {
    public data: Settings;
    public path: string;
    public content: string;
    constructor() {
        this.path = path.join(path.dirname(currentDir), "settings.json");
        this.reload();
    }
    reload() {
        try {
            this.content = fs.readFileSync(this.path, 'utf8');
            this.data = new Settings(JSON.parse(this.content));
            if (!this.data) {
                this.data = new Settings();
            }
        } catch (err) {
            this.data = new Settings();
        }
    }
    save() {
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }
}