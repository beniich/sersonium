package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"time"
)

// Ingestion Télémétrie Kafka
type KafkaThermalMetric struct {
	Timestamp   time.Time `json:"timestamp"`
	RackID      string    `json:"rack_id"`
	Temperature float64   `json:"temperature"`
	MetricName  string    `json:"metric_name"`
}

type KafkaListener struct {
	topic             string
	criticalThreshold float64
}

func NewKafkaListener(topic string, threshold float64) *KafkaListener {
	return &KafkaListener{topic: topic, criticalThreshold: threshold}
}

// StartConsume simule l'écoute réactive du stream Kafka
func (k *KafkaListener) StartConsume(ctx context.Context, socketOut chan<- string) {
	log.Printf("[KAFKA] Écoute active sur le topic '%s' (Seuil critique : %.1f°C)", k.topic, k.criticalThreshold)

	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// Simulation d'une anomalie survenant sur le Rack B
			mockMetric := KafkaThermalMetric{
				Timestamp:   time.Now(),
				RackID:      "rack_b",
				Temperature: 92.4,
				MetricName:  "rack_temperature_celsius",
			}

			if mockMetric.Temperature >= k.criticalThreshold {
				log.Printf("[⚠️ KAFKA ALERT] Seuil dépassé sur %s : %.1f°C !", mockMetric.RackID, mockMetric.Temperature)
				
				// Appel synchrone du pipeline de l'Enclave IA + HSM Signer
				signedPayload, err := k.triggerNeuralCoreSigner(mockMetric.RackID)
				if err != nil {
					log.Printf("[❌ ERROR] Échec du Neural Core : %v", err)
					continue
				}

				// Envoi immédiat vers Socket.IO pour alimenter le SelfHealingModal
				socketOut <- signedPayload
			}
		}
	}
}

func (k *KafkaListener) triggerNeuralCoreSigner(rackID string) (string, error) {
	log.Printf("[NEURAL CORE] Invocation de l'Enclave IA pour %s...", rackID)
	
	// Exécution du moteur combiné avec le HSM Enclave Signer (Python)
	cmd := exec.Command("python", "server/neural_core/hsm_enclave_signer.py", rackID)
	out, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("neural core failure: %w", err)
	}
	return string(out), nil
}
