import { Request, Response, NextFunction } from "express";
import { db } from "../config/firebase.js";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";

export const executeSecurityAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ip, action, reason } = req.body;
    
    if (!ip || !action) {
      res.status(400).json({ success: false, error: "IP and action are required" });
      return;
    }

    // 1. Log the security event
    const eventsRef = collection(db, "securityEvents");
    const newEvent = {
      timestamp: new Date().toISOString(),
      sourceIp: ip,
      country: "Unknown", // Would be resolved via GeoIP
      action: action,
      ruleId: "API-Triggered-Block",
      reason: reason || "Manual intervention"
    };
    
    const docRef = await addDoc(eventsRef, newEvent);
    
    // Also append the ID back to the document for consistency with frontend
    await updateDoc(doc(db, "securityEvents", docRef.id), { id: docRef.id });

    // 2. Audit log
    const auditRef = collection(db, "auditLogs");
    const auditLog = {
      timestamp: new Date().toISOString(),
      action: `Executed ${action} on IP ${ip}`,
      user: "system_admin",
      status: "Success"
    };
    const auditDocRef = await addDoc(auditRef, auditLog);
    await updateDoc(doc(db, "auditLogs", auditDocRef.id), { id: auditDocRef.id });

    res.json({ 
      success: true, 
      data: {
        message: `Security action ${action} applied to ${ip}`,
        eventId: docRef.id
      }
    });
  } catch (error) {
    next(error);
  }
};
