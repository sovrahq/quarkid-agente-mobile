type SchemaType = "string" | "boolean" | "number" | "integer";
type SchemaFormat =
  | "date-time"
  | "time"
  | "date"
  | "email"
  | "idn-email"
  | "hostname"
  | "idn-hostname"
  | "ipv4"
  | "ipv6"
  | "uri"
  | "uri-reference"
  | "iri"
  | "iri-reference";

interface DisplayMappingSchema {
  type: SchemaType;
  format?: SchemaFormat; // Solo se permite si el tipo es "string"
}

interface DisplayMappingObject {
  path?: string[]; // Es opcional si "text" está presente
  schema?: DisplayMappingSchema; // Es opcional si "text" está presente
  fallback?: string;
  text?: string; // Es opcional si "path" está presente
}
interface DisplayProperties extends DisplayMappingObject {
  label?: string;
}
type CredentialDisplay = {
  title?: DisplayMappingObject;
  subtitle?: DisplayMappingObject;
  description?: DisplayMappingObject;
  properties?: DisplayProperties[];
};
type Issuer =
  | {
      name: string;
      id: string;
    }
  | string;
enum CredentialStatusType {
  RevocationList2020Status = "RevocationList2020Status",
  CredentialStatusList2017 = "CredentialStatusList2017",
}

interface CredentialStatus {
  id: string;
  type: CredentialStatusType;
  revocationListIndex: string;
  revocationListCredential: string;
}
interface IdType {
  id: string;
  type: string;
}

interface VerifiableCredential {
  "@context"?: string[];
  id: string;
  type: string[];
  issuer: Issuer;
  name?: string;
  description?: string;
  issuanceDate: Date;
  expirationDate?: Date;
  credentialStatus?: CredentialStatus;
  credentialSubject: any;
  refreshService?: IdType;
  credentialSchema?: IdType;
}
type ImageDescriptor = {
  uri: string;
  alt: string;
};
type ColorDescriptor = {
  color: string;
};
export type CredentialManifestStyles = {
  thumbnail?: ImageDescriptor;
  hero?: ImageDescriptor;
  background?: ColorDescriptor;
  text?: ColorDescriptor;
};
export type VerifiableCredentialWithInfo = {
  data: VerifiableCredential;
  styles?: CredentialManifestStyles;
  display?: CredentialDisplay;
};
