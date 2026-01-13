import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import {
  Agent,
  AgentModenaUniversalRegistry,
  AgentModenaUniversalResolver,
  WebsocketClientTransport,
  DWNTransport,
  WACIProtocol,
  OpenIDProtocol,
} from "@extrimian/agent";
import agentConfig from "../config/agent";
import { Storage } from "../storage/Storage";
import { SecureStorage } from "../storage/SecureStorage";
import BBSKeyGenerator, { BBSKeyMaterial } from "./BBSKeyGenerator";

interface EventLog {
  timestamp: string;
  event: string;
  data?: any;
}

export const MessageProcessingTest: React.FC = () => {
  const [status, setStatus] = useState<string>("Initializing...");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [eventsInitialized, setEventsInitialized] = useState(false);
  const [didCreated, setDidCreated] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [showBBSGenerator, setShowBBSGenerator] = useState(false);
  const [bbsKeyMaterial, setBbsKeyMaterial] = useState<BBSKeyMaterial | null>(
    null
  );
  const [currentDID, setCurrentDID] = useState<string>("");

  const websocketTransportRef = useRef<WebsocketClientTransport | null>(null);
  const dwnTransportRef = useRef<DWNTransport | null>(null);
  const agentStorageRef = useRef<Storage | null>(null);
  const agentSecureStorageRef = useRef<SecureStorage | null>(null);
  const vcStorageRef = useRef<Storage | null>(null);
  const waciStorageRef = useRef<Storage | null>(null);
  const openidStorageRef = useRef<Storage | null>(null);

  const addLog = (event: string, data?: any) => {
    const log: EventLog = {
      timestamp: new Date().toLocaleTimeString(),
      event,
      data,
    };
    setEventLogs((prev) => [log, ...prev]);
  };

  // DOM Component callbacks
  const handleKeyGenerated = async (keyMaterial: BBSKeyMaterial) => {
    setBbsKeyMaterial(keyMaterial);
    setShowBBSGenerator(false);
    setStatus("✅ BBS+ keys generated!");
    setIsLoading(false);
    addLog("BBS+ Keys Generated", "Keys ready for DID creation");
  };

  const handleKeyGenerationError = async (error: string) => {
    console.error("❌ BBS+ key generation error:", error);
    setStatus(`❌ BBS+ key generation failed: ${error}`);
    setShowBBSGenerator(false);
    setIsLoading(false);
    addLog("BBS+ Key Generation Error", error);
  };

  const handleBBSGeneratorReady = async () => {
    setStatus("🔑 DOM Component ready for key generation");
  };

  // Initialize Agent Events (similar to AppContext.js initializeEvents)
  const initializeEvents = () => {
    if (!agent) return;

    addLog("Initializing Agent Events");

    // Credential Arrived Event
    const handleCredentialArrived = (data: any) => {
      // Extract detailed credential information
      const credentialDetails = data.credentials?.map((cred: any) => ({
        id: cred.data?.id || cred.id,
        type: cred.data?.type || cred.type,
        issuer: cred.data?.issuer || cred.issuer,
        issuanceDate: cred.data?.issuanceDate || cred.issuanceDate,
        credentialSubject:
          cred.data?.credentialSubject || cred.credentialSubject,
        styles: cred.styles,
        display: cred.display,
      }));

      addLog("Credential Arrived", {
        credentialCount: data.credentials?.length || 0,
        issuerName: data.issuer?.name || data.issuer || "Unknown",
        messageId: data.messageId,
        credentials: credentialDetails,
        rawData: data, // Include full raw data for debugging
      });
      setStatus(`✅ ${data.credentials?.length || 0} credential(s) received!`);
    };

    // ACK Completed Event
    const handleAckCompleted = (data: any) => {
      addLog("ACK Completed", {
        status: data.status,
        messageId: data.messageId,
      });
      setStatus("✅ ACK received!");
    };

    // Problem Report Event
    const handleProblemReport = (data: any) => {
      addLog("Problem Report", {
        code: data.code,
        message: data.codeMessage,
      });
      setStatus("⚠️ Problem report received");
    };

    // Transport Events
    const handleConnect = () => {
      addLog("Transport Connected");
      setStatus("🔌 Connected to transport");
    };

    const handleDisconnect = () => {
      addLog("Transport Disconnected");
      setStatus("🔌 Disconnected from transport");
    };

    // Register event listeners
    try {
      agent.vc.credentialArrived.on(handleCredentialArrived);
      agent.vc.ackCompleted.on(handleAckCompleted);
      agent.vc.problemReport.on(handleProblemReport);
      agent.transport.connected.on(handleConnect);
      agent.transport.disconnected.on(handleDisconnect);

      setEventsInitialized(true);
      setStatus("✅ Events initialized successfully");
      addLog("Events Registered", "All event listeners active");

      // Cleanup function
      return () => {
        agent.vc.credentialArrived.off(handleCredentialArrived);
        agent.vc.ackCompleted.off(handleAckCompleted);
        agent.vc.problemReport.off(handleProblemReport);
        agent.transport.connected.off(handleConnect);
        agent.transport.disconnected.off(handleDisconnect);
        addLog("Events Unregistered", "All event listeners removed");
      };
    } catch (error: any) {
      addLog("Event Initialization Error", error.message);
      setStatus(`❌ Event initialization error: ${error.message}`);
    }
  };

  // Check for existing DID and initialize agent on mount
  useEffect(() => {
    const initializeAgentWithStorage = async () => {
      setIsLoading(true);
      setStatus("Checking for existing DID...");
      addLog("App Started", "Checking storage for existing agent data");

      try {
        // Create storage instances (reuse them)
        agentStorageRef.current = new Storage("agent");
        agentSecureStorageRef.current = new SecureStorage("agent-secure");
        vcStorageRef.current = new Storage("vc");
        waciStorageRef.current = new Storage("waci");
        openidStorageRef.current = new Storage("openid");

        websocketTransportRef.current = new WebsocketClientTransport();
        dwnTransportRef.current = new DWNTransport({
          dwnPollMilliseconds: 10000,
        });

        const newAgent = new Agent({
          didDocumentRegistry: new AgentModenaUniversalRegistry(
            agentConfig.universalResolverUrl
          ),
          didDocumentResolver: new AgentModenaUniversalResolver(
            agentConfig.universalResolverUrl
          ),
          vcProtocols: [
            new WACIProtocol({
              holder: {
                credentialApplication: async (
                  inputs,
                  _,
                  message,
                  issuer,
                  credentialsToReceive
                ) => {
                  // Log the credential offer/request
                  addLog("Credential Application Request", {
                    inputs: inputs?.length || 0,
                    messageId: message.id,
                    issuer: issuer?.name || "Unknown",
                    credentialsToReceive: credentialsToReceive?.length || 0,
                  });

                  // For testing: automatically accept all credentials
                  // In production, you'd show a UI to the user for approval
                  if (credentialsToReceive) {
                    addLog(
                      "Auto-accepting credential offer",
                      "No credentials to present"
                    );
                    return [];
                  }

                  // If credentials are requested, return empty array for now
                  // In production, you'd select credentials from storage
                  addLog(
                    "Presentation requested",
                    "Would show credential selector"
                  );
                  return [];
                },
              },
              storage: waciStorageRef.current,
            }),
            new OpenIDProtocol({
              storage: openidStorageRef.current,
            }),
          ],
          agentPlugins: [],
          agentStorage: agentStorageRef.current,
          secureStorage: agentSecureStorageRef.current,
          vcStorage: vcStorageRef.current,
          supportedTransports: [
            websocketTransportRef.current,
            dwnTransportRef.current,
          ],
        });

        await newAgent.initialize();
        setAgent(newAgent);
        addLog("Agent Initialized", "Agent loaded from storage");

        // Check if DID exists
        const existingDID = newAgent.identity.getOperationalDID();
        if (existingDID) {
          setDidCreated(true);
          setCurrentDID(existingDID.value);
          setStatus(
            `✅ DID restored: ${existingDID.value.substring(0, 30)}...`
          );
          addLog("DID Restored", existingDID.value);

          // Auto-initialize events if DID exists
          setTimeout(() => {
            initializeEvents();
          }, 500);
        } else {
          setStatus("Ready - No DID found. Create a new one.");
          addLog("No Existing DID", "Ready to create new DID");
        }
      } catch (error: any) {
        setStatus(`❌ Initialization error: ${error.message}`);
        addLog("Initialization Error", error.message);
        console.error("Agent initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAgentWithStorage();
  }, []);

  // Create Agent (now just for manual reset)
  const createAgent = async () => {
    setIsLoading(true);
    setStatus("Creating agent...");
    addLog("Agent Creation Started");

    try {
      // Use existing storage instances or create new ones
      if (!agentStorageRef.current) {
        agentStorageRef.current = new Storage("agent");
        agentSecureStorageRef.current = new SecureStorage("agent-secure");
        vcStorageRef.current = new Storage("vc");
        waciStorageRef.current = new Storage("waci");
        openidStorageRef.current = new Storage("openid");
      }

      if (!websocketTransportRef.current) {
        websocketTransportRef.current = new WebsocketClientTransport();
        dwnTransportRef.current = new DWNTransport({
          dwnPollMilliseconds: 10000,
        });
      }

      const newAgent = new Agent({
        didDocumentRegistry: new AgentModenaUniversalRegistry(
          agentConfig.universalResolverUrl
        ),
        didDocumentResolver: new AgentModenaUniversalResolver(
          agentConfig.universalResolverUrl
        ),
        vcProtocols: [
          new WACIProtocol({
            holder: {
              credentialApplication: async (
                inputs,
                _,
                message,
                issuer,
                credentialsToReceive
              ) => {
                // Log the credential offer/request
                addLog("Credential Application Request", {
                  inputs: inputs?.length || 0,
                  messageId: message.id,
                  issuer: issuer?.name || "Unknown",
                  credentialsToReceive: credentialsToReceive?.length || 0,
                });

                // For testing: automatically accept all credentials
                // In production, you'd show a UI to the user for approval
                if (credentialsToReceive) {
                  addLog(
                    "Auto-accepting credential offer",
                    "No credentials to present"
                  );
                  return [];
                }

                // If credentials are requested, return empty array for now
                // In production, you'd select credentials from storage
                addLog(
                  "Presentation requested",
                  "Would show credential selector"
                );
                return [];
              },
            },
            storage: waciStorageRef.current!,
          }),
          new OpenIDProtocol({
            storage: openidStorageRef.current!,
          }),
        ],
        agentPlugins: [],
        agentStorage: agentStorageRef.current!,
        secureStorage: agentSecureStorageRef.current!,
        vcStorage: vcStorageRef.current!,
        supportedTransports: [
          websocketTransportRef.current!,
          dwnTransportRef.current!,
        ],
      });

      await newAgent.initialize();
      setAgent(newAgent);
      setStatus("✅ Agent created successfully!");
      addLog("Agent Created", "Ready for events and DID creation");
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      addLog("Agent Creation Error", error.message);
      console.error("Agent creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate BBS+ Keys
  const generateBBSKeys = async () => {
    if (!agent) {
      setStatus("❌ No agent available. Create an agent first.");
      return;
    }

    setIsLoading(true);
    setBbsKeyMaterial(null);
    setStatus("🔑 Initializing DOM Component for BBS+ key generation...");
    addLog("BBS+ Key Generation Started");
    setShowBBSGenerator(true);
  };

  // Create DID
  const createDID = async () => {
    if (!agent) {
      setStatus("❌ No agent available. Create an agent first.");
      return;
    }

    if (!bbsKeyMaterial) {
      setStatus("❌ No BBS+ keys available. Generate BBS+ keys first.");
      return;
    }

    setIsLoading(true);
    setStatus("Creating DID with BBS+ keys...");
    addLog("DID Creation Started");

    try {
      await agent.identity.createNewDID({
        dwnUrl: agentConfig.dwnUrl,
        preventCredentialCreation: true,
        didMethod: agentConfig.didMethod,
        keysToImport: [bbsKeyMaterial],
        keysToCreate: [{ id: "didcomm", vmKey: 1 }],
      });

      const did = agent.identity.getOperationalDID();
      if (did) {
        setCurrentDID(did.value);
        setStatus(`✅ DID Created: ${did.value}`);
        addLog("DID Created Successfully", did.value);
        setDidCreated(true);
      } else {
        setStatus("⚠️ DID creation completed but DID not available");
        addLog("DID Creation Warning", "DID not available after creation");
      }
    } catch (error: any) {
      setStatus(`❌ Error creating DID: ${error.message}`);
      addLog("DID Creation Error", error.message);
      console.error("DID creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process Message
  const processMessage = async () => {
    if (!agent) {
      setStatus("❌ No agent available");
      addLog("Process Message Error", "No agent available");
      return;
    }

    if (!testMessage.trim()) {
      setStatus("❌ No message to process");
      return;
    }

    setIsLoading(true);
    setStatus("Processing message...");
    addLog("Processing Message", testMessage.substring(0, 50) + "...");

    try {
      // Process the message - this will trigger events if it's a valid DIDComm message
      await agent.processMessage({ message: testMessage });
      setStatus("✅ Message processed successfully");
      addLog("Message Processed", "Check events above for results");
    } catch (error: any) {
      setStatus(`❌ Error processing message: ${error.message}`);
      addLog("Message Processing Error", error.message);
      console.error("Message processing error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setEventLogs([]);
    addLog("Logs Cleared");
  };

  // Clear all storage and reset
  const clearStorage = async () => {
    setIsLoading(true);
    setStatus("Clearing all storage...");
    addLog("Storage Clear Started", "Removing all agent data");

    try {
      if (agentStorageRef.current) {
        await agentStorageRef.current.clear();
      }
      if (agentSecureStorageRef.current) {
        await agentSecureStorageRef.current.clear();
      }
      if (vcStorageRef.current) {
        await vcStorageRef.current.clear();
      }
      if (waciStorageRef.current) {
        await waciStorageRef.current.clear();
      }
      if (openidStorageRef.current) {
        await openidStorageRef.current.clear();
      }

      setAgent(null);
      setBbsKeyMaterial(null);
      setShowBBSGenerator(false);
      setEventsInitialized(false);
      setDidCreated(false);
      setCurrentDID("");
      setEventLogs([]);
      setTestMessage("");
      setStatus("✅ Storage cleared! Restart app to create new DID.");
      addLog("Storage Cleared", "All data removed. Restart app.");
    } catch (error: any) {
      setStatus(`❌ Error clearing storage: ${error.message}`);
      addLog("Storage Clear Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setAgent(null);
    setBbsKeyMaterial(null);
    setShowBBSGenerator(false);
    setEventsInitialized(false);
    setDidCreated(false);
    setCurrentDID("");
    setIsLoading(false);
    setEventLogs([]);
    setTestMessage("");
    setStatus("Ready");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Message Processing Test</Text>
        <Text style={styles.subtitle}>
          Testing agent events and message processing
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text
          style={[
            styles.statusText,
            {
              color: status.includes("✅")
                ? "#4CAF50"
                : status.includes("❌")
                ? "#F44336"
                : "#FF9800",
            },
          ]}
        >
          {status}
        </Text>
        {currentDID && (
          <>
            <Text style={[styles.statusLabel, { marginTop: 12 }]}>
              Current DID:
            </Text>
            <Text
              style={[
                styles.statusText,
                { fontSize: 12, fontFamily: "monospace" },
              ]}
            >
              {currentDID}
            </Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 1: Setup</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={createAgent}
            disabled={isLoading || !!agent}
          >
            <Text style={styles.buttonText}>
              {agent ? "✅ Agent Created" : "Create Agent"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.generateButton,
              (!agent || isLoading) && styles.buttonDisabled,
            ]}
            onPress={generateBBSKeys}
            disabled={!agent || isLoading || !!bbsKeyMaterial}
          >
            <Text style={styles.buttonText}>
              {bbsKeyMaterial ? "✅ Keys Generated" : "Generate BBS+ Keys"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.createButton,
              (!agent || !bbsKeyMaterial || isLoading) && styles.buttonDisabled,
            ]}
            onPress={createDID}
            disabled={!agent || !bbsKeyMaterial || isLoading || didCreated}
          >
            <Text style={styles.buttonText}>
              {didCreated ? "✅ DID Created" : "Create DID"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 2: Initialize Events</Text>
        <TouchableOpacity
          style={[
            styles.button,
            styles.eventsButton,
            (!agent || !didCreated || isLoading) && styles.buttonDisabled,
          ]}
          onPress={initializeEvents}
          disabled={!agent || !didCreated || isLoading || eventsInitialized}
        >
          <Text style={styles.buttonText}>
            {eventsInitialized ? "✅ Events Initialized" : "Initialize Events"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 3: Process Message</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter DIDComm message or URL to process..."
          value={testMessage}
          onChangeText={setTestMessage}
          multiline
          numberOfLines={4}
          editable={eventsInitialized && !isLoading}
        />
        <TouchableOpacity
          style={[
            styles.button,
            styles.processButton,
            (!eventsInitialized || !testMessage.trim() || isLoading) &&
              styles.buttonDisabled,
          ]}
          onPress={processMessage}
          disabled={!eventsInitialized || !testMessage.trim() || isLoading}
        >
          <Text style={styles.buttonText}>Process Message</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.logsHeader}>
          <Text style={styles.sectionTitle}>Event Logs</Text>
          <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.logsContainer} nestedScrollEnabled>
          {eventLogs.length === 0 ? (
            <Text style={styles.noLogs}>No events yet</Text>
          ) : (
            eventLogs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                <Text style={styles.logEvent}>{log.event}</Text>
                {log.data && (
                  <Text style={styles.logData}>
                    {typeof log.data === "string"
                      ? log.data
                      : JSON.stringify(log.data, null, 2)}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.clearStorageButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={clearStorage}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Clear Storage & Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showBBSGenerator && (
        <View style={styles.domComponentContainer}>
          <BBSKeyGenerator
            onKeyGenerated={handleKeyGenerated}
            onError={handleKeyGenerationError}
            onReady={handleBBSGeneratorReady}
            dom={{ style: { height: 300, backgroundColor: "#ffffff" } }}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  statusContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  generateButton: {
    backgroundColor: "#FF9800",
  },
  createButton: {
    backgroundColor: "#4CAF50",
  },
  eventsButton: {
    backgroundColor: "#9C27B0",
  },
  processButton: {
    backgroundColor: "#00BCD4",
  },
  resetButton: {
    backgroundColor: "#FF5722",
  },
  clearStorageButton: {
    backgroundColor: "#D32F2F",
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
  },
  logsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FF5722",
    borderRadius: 4,
  },
  clearButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  logsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  noLogs: {
    textAlign: "center",
    color: "#999",
    padding: 20,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
    marginBottom: 8,
  },
  logTimestamp: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  logEvent: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  logData: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  domComponentContainer: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 300,
  },
});
