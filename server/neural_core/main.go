package main

import (
	"context"
	"fmt"
	"log"
	"time"
)

func main() {
	log.Println("=============================================================")
	log.Println("SENSORIUM NEURAL CORE & ACTION LAYER DAEMON (DORA Art. 12)")
	log.Println("=============================================================")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	socketChannel := make(chan string, 10)
	listener := NewKafkaListener("telemetry.rack_b.thermal", 90.0)
	deployer := NewActionLayerDeployer("wg-anycast-mesh0")

	// Lancement de l'écouteur Kafka en arrière-plan
	go listener.StartConsume(ctx, socketChannel)

	// Simulation du traitement des événements signés par le Neural Core
	go func() {
		for signedJSON := range socketChannel {
			log.Println("[DISPATCHER] Enveloppe signée reçue du Neural Core. Prête pour validation opérateur ou auto-action:")
			fmt.Println(signedJSON[:min(200, len(signedJSON))] + "... (tronqué)")

			// Simulation de déploiement approuvé
			err := deployer.DeploySignedPatch(signedJSON)
			if err != nil {
				log.Printf("[DEPLOY FAIL] %v", err)
			} else {
				log.Println("[DEPLOY OK] Patch appliqué avec succès sur le mesh Anycast")
			}
			break // Test run de démonstration
		}
	}()

	time.Sleep(5 * time.Second)
	log.Println("[SENSORIUM DAEMON] Cycle de vérification initial terminé.")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
