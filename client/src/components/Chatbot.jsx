import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "system", content: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch tenant-specific Firestore data
  const fetchTenantData = async (userId) => {
    try {
      // Fetch tenant data
      const tenantRef = doc(db, "users", userId);
      const tenantSnap = await getDoc(tenantRef);
      const tenantData = tenantSnap.exists() ? tenantSnap.data() : null;

      if (!tenantData) return null;

      // Fetch property data
      const propertyRef = doc(db, "properties", tenantData.propertyId);
      const propertySnap = await getDoc(propertyRef);
      const propertyData = propertySnap.exists() ? propertySnap.data() : null;

      // Fetch units under the property
      const unitsRef = collection(db, "properties", tenantData.propertyId, "units");
      const unitsSnapshot = await getDocs(unitsRef);
      const units = unitsSnapshot.docs.map((doc) => ({
        id: doc.id,
        number: doc.data().number,
        occupied: doc.data().occupied,
      }));

      // Fetch notifications
      const notificationsRef = collection(db, "notifications");
      const notificationsQuery = query(notificationsRef, where("userId", "==", userId));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notifications = notificationsSnapshot.docs.map((doc) => doc.data());

      // Fetch maintenance requests
      const maintenanceRef = collection(db, "maintenanceRequests");
      const maintenanceQuery = query(maintenanceRef, where("userId", "==", userId));
      const maintenanceSnapshot = await getDocs(maintenanceQuery);
      const maintenanceRequests = maintenanceSnapshot.docs.map((doc) => doc.data());

      return {
        tenantData,
        propertyData,
        units,
        notifications,
        maintenanceRequests,
      };
    } catch (error) {
      console.error("Error fetching tenant data:", error);
      return null;
    }
  };

  // Fetch admin-specific Firestore data (aggregated statistics)
  const fetchAdminData = async () => {
    try {
      // Get count and list of all properties
      const propertiesRef = collection(db, "properties");
      const propertiesSnapshot = await getDocs(propertiesRef);
      const propertiesCount = propertiesSnapshot.size;
      const propertiesList = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        address: doc.data().address
      }));
      
      // Total unit count and occupancy data
      let totalUnits = 0;
      let occupiedUnits = 0;
      
      // Process each property to get its units
      for (const property of propertiesList) {
        const unitsRef = collection(db, "properties", property.id, "units");
        const unitsSnapshot = await getDocs(unitsRef);
        
        const propertyUnits = unitsSnapshot.docs.map(doc => ({
          id: doc.id,
          number: doc.data().number,
          occupied: doc.data().occupied
        }));
        
        totalUnits += propertyUnits.length;
        occupiedUnits += propertyUnits.filter(unit => unit.occupied).length;
      }
      
      // Get tenant count
      const tenantsQuery = query(collection(db, "users"), where("role", "==", "tenant"));
      const tenantsSnapshot = await getDocs(tenantsQuery);
      const tenantsCount = tenantsSnapshot.size;
      const tenantsList = tenantsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        propertyId: doc.data().propertyId,
        unitId: doc.data().unitId
      }));
      
      // Get maintenance requests summary
      const maintenanceRef = collection(db, "maintenanceRequests");
      const maintenanceSnapshot = await getDocs(maintenanceRef);
      const maintenanceRequests = maintenanceSnapshot.docs.map(doc => ({
        id: doc.id,
        issue: doc.data().issue,
        status: doc.data().status,
        userId: doc.data().userId,
        propertyId: doc.data().propertyId,
        createdAt: doc.data().createdAt
      }));
      
      const pendingMaintenance = maintenanceRequests.filter(req => req.status === "pending").length;
      const inProgressMaintenance = maintenanceRequests.filter(req => req.status === "in-progress").length;
      const completedMaintenance = maintenanceRequests.filter(req => req.status === "completed").length;
      
      // Calculate vacancy rate
      const vacancyRate = totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits * 100).toFixed(1) : "0.0";
      
      return {
        propertiesCount,
        propertiesList,
        totalUnits,
        occupiedUnits,
        vacancyRate,
        tenantsCount,
        tenantsList,
        pendingMaintenance,
        inProgressMaintenance,
        completedMaintenance,
        totalMaintenance: maintenanceRequests.length,
        maintenanceRequests
      };
    } catch (error) {
      console.error("Error fetching admin data:", error);
      return null;
    }
  };

  // Check user role
  const checkUserRole = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data().role || "tenant"; // Default to tenant if role field doesn't exist
      }
      return "tenant"; // Default if user doc doesn't exist
    } catch (error) {
      console.error("Error checking user role:", error);
      return "tenant"; // Default on error
    }
  };

  // Send message handler
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMessage = { role: "user", content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Please log in to access your information." },
        ]);
        setLoading(false);
        return;
      }

      // Determine user role
      const userRole = await checkUserRole(userId);
      
      // Fetch appropriate data based on role
      let prompt;
      if (userRole === "admin") {
        const adminData = await fetchAdminData();
        if (!adminData) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Failed to fetch administrative data. Please try again." },
          ]);
          setLoading(false);
          return;
        }
        
        // Construct admin-specific prompt
        prompt = `
          You are a helpful assistant for property management administrators. Below is the admin's query and relevant data:

          Admin Query: "${trimmedInput}"

          System Data:
          - Total Properties: ${adminData.propertiesCount}
          - Property Names: ${adminData.propertiesList.map(p => p.name).join(", ")}
          - Total Units: ${adminData.totalUnits}
          - Occupied Units: ${adminData.occupiedUnits}
          - Vacancy Rate: ${adminData.vacancyRate}%
          - Total Tenants: ${adminData.tenantsCount}
          - Maintenance Requests: ${adminData.totalMaintenance} (${adminData.pendingMaintenance} pending, ${adminData.inProgressMaintenance} in progress, ${adminData.completedMaintenance} completed)

          Instructions:
          1. If asked about property counts, units, or vacancies, provide the exact statistics.
          2. If asked about specific properties, provide details from the property list.
          3. If asked to calculate metrics like occupancy rates, perform the calculation.
          4. If asked about maintenance requests, provide summaries by status.
          5. Always provide concise, data-driven responses suitable for management decisions.
          6. **Never include <think> tags or internal reasoning in the response.**
        `;
      } else {
        // Tenant role - use existing tenant data fetching
        const tenantData = await fetchTenantData(userId);
        if (!tenantData) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Failed to fetch your tenant data. Please try again." },
          ]);
          setLoading(false);
          return;
        }
        
        // Use existing tenant prompt structure
        prompt = `
          You are a helpful assistant for a property management system. Below is the user's query and relevant data from Firestore. Generate a precise response based on the data.

          User Query: "${trimmedInput}"

          Firestore Data:
          - Tenant Name: ${tenantData.tenantData.name}
          - Tenant Email: ${tenantData.tenantData.email}
          - Tenant Phone: ${tenantData.tenantData.phone}
          - Property Name: ${tenantData.propertyData.name}
          - Property Address: ${tenantData.propertyData.address}
          - Unit Number: ${tenantData.tenantData.unitId}
          - Units: ${tenantData.units.map((unit) => unit.number).join(", ")}
          - Notifications: ${tenantData.notifications.map((n) => n.message).join(", ")}
          - Maintenance Requests: ${tenantData.maintenanceRequests.map((r) => r.issue).join(", ")}

          Instructions:
          1. Respond only to the specific query. Do not list all data unless asked.
          2. If the user asks about their property, respond with the property name and address.
          3. If the user asks about their unit, respond with the unit number (not the unit ID).
          4. If the user asks about units, list all available units by their numbers.
          5. If the user asks about notifications, list their recent notifications.
          6. If the user asks about maintenance requests, provide the status of their requests.
          7. If the query is unclear, ask for clarification.
          8. **Never include <think> tags or internal reasoning in the response.**
        `;
      }

      const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (!API_KEY) throw new Error("GROQ_API_KEY is missing!");

      // Add empty assistant message placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen-qwq-32b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          stream: true,
        }),
      });

      if (!response.body) throw new Error("Response body is empty");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";
      let fullResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line === "data: [DONE]") break;

          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.replace("data: ", "").trim());
              const delta = json.choices?.[0]?.delta?.content || "";
              
              // Add to full response first
              fullResponse += delta;
              
              // Only update the UI when we have a complete response or periodically
              // This allows us to process the entire <think> tags before displaying
              if (done || lines.length === 1) {
                // Remove all think tags and their content from the full response
                const cleanedResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/g, "");
                assistantReply = cleanedResponse;
                
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantReply,
                  };
                  return newMessages;
                });
              } else {
                // For streaming updates, we still need to clean each chunk
                const cleanedDelta = delta.replace(/<think>[\s\S]*?<\/think>/g, "");
                assistantReply += cleanedDelta;
                
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantReply,
                  };
                  return newMessages;
                });
              }
            } catch (error) {
              console.error("Error parsing stream chunk:", error);
            }
          }
        }
      }
      
      // Final cleanup to ensure all think tags are removed
      const finalCleanedResponse = fullResponse.replace(/<think>[\s\S]*?<\/think>/g, "");
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: finalCleanedResponse,
        };
        return newMessages;
      });
      
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "400px", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
      <div style={{ height: "300px", overflowY: "auto", padding: "10px", background: "#f9f9f9" }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              padding: "5px",
              marginBottom: "5px",
              background: msg.role === "user" ? "#dcf8c6" : "#e0e0e0",
              borderRadius: "5px",
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: "center", margin: "10px 0" }}>
            <div
              style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "8px", borderRadius: "3px", border: "1px solid #ccc" }}
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            marginLeft: "5px",
            padding: "8px",
            background: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Send
        </button>
      </div>
      <style>
        {
          `@keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`
        }
      </style>
    </div>
  );
};

export default Chatbot;