import { SignedXml } from 'xml-crypto';
import forge from 'node-forge';

export class GinfesSigner {
    private p12: any;
    private key: any;
    private cert: any;

    constructor(pfxBase64: string, password?: string) {
        const pfxDer = forge.util.decode64(pfxBase64);
        const p12Asn1 = forge.asn1.fromDer(pfxDer);
        this.p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password || '');

        // Extrair chave privada e certificado
        const keyBags = this.p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const certBags = this.p12.getBags({ bagType: forge.pki.oids.certBag });

        this.key = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
        this.cert = certBags[forge.pki.oids.certBag][0].cert;
    }

    public signXml(xml: string, tagToSign: string): string {
        const sig = new SignedXml();

        // Na v6, o método addReference mudou para aceitar um objeto
        (sig as any).addReference({
            xpath: `//*[local-name(.)='${tagToSign}']`,
            transforms: [
                "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
                "http://www.w3.org/2001/10/xml-exc-c14n#"
            ],
            digestAlgorithm: "http://www.w3.org/2000/09/xmldsig#sha1"
        });

        const privateKeyPem = forge.pki.privateKeyToPem(this.key);
        const certPem = forge.pki.certificateToPem(this.cert);

        (sig as any).signingKey = Buffer.from(privateKeyPem);
        (sig as any).keyInfoProvider = {
            getKeyInfo: () => `<X509Data><X509Certificate>${this.cleanCert(certPem)}</X509Certificate></X509Data>`,
            getKey: () => Buffer.from(privateKeyPem)
        };

        sig.computeSignature(xml, {
            location: {
                reference: `//*[local-name(.)='${tagToSign}']`,
                action: 'after'
            }
        });

        return sig.getSignedXml();
    }

    private cleanCert(certPem: string): string {
        return certPem
            .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
            .replace(/\s+/g, '');
    }
}
