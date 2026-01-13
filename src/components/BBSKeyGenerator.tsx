"use dom";

import React from "react";
import { Buffer } from "buffer";
import { Base, BaseConverter } from "@extrimian/kms-core";
import { BbsBls2020Suite } from "@extrimian/kms-suite-bbsbls2020";

// Make Buffer available globally in DOM Component
(globalThis as any).Buffer = Buffer;

export interface BBSKeyMaterial {
  id: string;
  vmKey: number;
  publicKeyJWK: any;
  secrets: {
    publicKey: string;
    privateKey: string;
    keyType: string;
  };
}

interface BBSKeyGeneratorProps {
  onKeyGenerated: (keyMaterial: BBSKeyMaterial) => Promise<void>;
  onError: (error: string) => Promise<void>;
  onReady: () => Promise<void>;
}

export default function BBSKeyGenerator({
  onKeyGenerated,
  onError,
  onReady,
}: BBSKeyGeneratorProps) {
  const generateBBSKeys = async () => {
    try {
      // Real BBS+ key generation using @extrimian libraries
      const bbsBls2020Suite = new BbsBls2020Suite();
      const bbsKeySecrets = await bbsBls2020Suite.create();

      if (!bbsKeySecrets.publicKey || !bbsKeySecrets.privateKey) {
        throw new Error(
          "BBS+ key generation failed: missing public or private key"
        );
      }

      // Convert to JWK format like original implementation
      const jwk = BaseConverter.convert(
        bbsKeySecrets.publicKey,
        Base.Base58,
        Base.JWK,
        bbsKeySecrets.keyType
      );

      const keyMaterial: BBSKeyMaterial = {
        id: "vc-bbs",
        vmKey: 2, // VMKey.BBSBls
        publicKeyJWK: jwk,
        secrets: {
          publicKey: bbsKeySecrets.publicKey,
          privateKey: bbsKeySecrets.privateKey,
          keyType: bbsKeySecrets.keyType,
        },
      };

      // Send results back to React Native via async JSON bridge
      await onKeyGenerated(keyMaterial);
    } catch (error: any) {
      console.error("❌ BBS+ key generation failed in DOM Component:", error);
      await onError(error.message || "Unknown error during key generation");
    }
  };

  // Auto-generate keys when component loads
  React.useEffect(() => {
    const autoGenerateKeys = async () => {
      try {
        await onReady();

        await generateBBSKeys();
      } catch (error) {
        console.error("❌ Auto-generation failed:", error);
        await onError(`Auto-generation failed: ${error}`);
      }
    };

    autoGenerateKeys();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f0f0f0",
        minHeight: "150px",
        border: "2px solid #007acc",
      }}
    >
      <h1 style={{ color: "#007acc", margin: "0 0 10px 0" }}>
        🔑 DOM Component Loaded!
      </h1>
      <p style={{ color: "#333", fontSize: "16px" }}>
        Auto-generating BBS+ keys...
      </p>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#e8f4fd",
          borderRadius: "5px",
          color: "#007acc",
          fontSize: "14px",
        }}
      >
        ⚡ Keys are being generated automatically. No user interaction required.
      </div>
    </div>
  );
}
