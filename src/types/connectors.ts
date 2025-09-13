export type ConnectorRole = 'source' | 'destination';

export type ConnectorCredentials = {
  mandatory: string[];
  optional?: string[];
};

export type ConnectorSpec = {
  name: string;
  category: string;
  roles: { source: boolean; destination: boolean };
  credentials: ConnectorCredentials;
};

export type ConnectorInstance = {
  role: ConnectorRole;
  spec: ConnectorSpec;
  values?: Record<string, string>;
};
