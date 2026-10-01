#!/usr/bin/env python3
"""
SENSORIUM — Physical LED Controller (Hardware UX)
Target: Raspberry Pi 4/5, NVIDIA Jetson Orin, Silicium X1
GPIO Library: gpiod (universal) with RPi.GPIO fallback

LED States:
  RED   (solid)    : Power ON, system booting
  BLUE  (blinking) : Ready, searching for PC connection
  BLUE  (solid)    : PC connected, AI inference active
  GREEN (pulse)    : Processing / inference running
  RED   (blinking) : Error / firmware update

Wiring (BCM numbering):
  GPIO 17  --> LED RED    (anode via 330 ohm resistor)
  GPIO 27  --> LED BLUE   (anode via 330 ohm resistor)
  GPIO 22  --> LED GREEN  (anode via 330 ohm resistor)
  GND      --> All LED cathodes
"""

import time
import threading
import logging
import signal
import sys
import os
from enum import Enum

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s %(message)s",
    datefmt="%H:%M:%S"
)
log = logging.getLogger("sensorium.leds")

# ─── GPIO Pin Configuration (BCM) ────────────────────────────────────────────
PIN_RED   = 17
PIN_BLUE  = 27
PIN_GREEN = 22

# ─── LED State Machine ────────────────────────────────────────────────────────
class LedState(Enum):
    BOOTING       = "BOOTING"         # Red solid
    SEARCHING     = "SEARCHING"       # Blue blinking (0.5Hz)
    CONNECTED     = "CONNECTED"       # Blue solid
    PROCESSING    = "PROCESSING"      # Green pulse
    ERROR         = "ERROR"           # Red fast blink (2Hz)
    FIRMWARE_OTA  = "FIRMWARE_OTA"    # All blink in sequence
    OFF           = "OFF"

# ─── GPIO Backend Detection ──────────────────────────────────────────────────
GPIO_BACKEND = None

def _init_gpio():
    """Initialize GPIO backend: gpiod preferred, RPi.GPIO fallback, mock for dev."""
    global GPIO_BACKEND

    # Try gpiod first (universal Linux GPIO, works on Jetson + Pi)
    try:
        import gpiod
        chip = gpiod.Chip("gpiochip0")
        GPIO_BACKEND = "gpiod"
        log.info("GPIO backend: gpiod (universal Linux GPIO)")
        return chip
    except (ImportError, FileNotFoundError):
        pass

    # Try RPi.GPIO (Raspberry Pi specific)
    try:
        import RPi.GPIO as GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        GPIO.setup([PIN_RED, PIN_BLUE, PIN_GREEN], GPIO.OUT, initial=GPIO.LOW)
        GPIO_BACKEND = "RPi.GPIO"
        log.info("GPIO backend: RPi.GPIO")
        return GPIO
    except (ImportError, RuntimeError):
        pass

    # Mock backend for development/PC testing
    GPIO_BACKEND = "MOCK"
    log.warning("GPIO backend: MOCK (no hardware GPIO detected - dev mode)")
    return None


class LedController:
    """
    Thread-safe LED controller with state machine.
    Manages Red / Blue / Green LEDs via GPIO.
    """

    def __init__(self):
        self._state = LedState.BOOTING
        self._lock  = threading.Lock()
        self._stop  = threading.Event()
        self._thread = None
        self._gpio   = _init_gpio()
        self._pins   = {}

        # Setup pins based on backend
        if GPIO_BACKEND == "gpiod":
            import gpiod
            for name, pin in [("red", PIN_RED), ("blue", PIN_BLUE), ("green", PIN_GREEN)]:
                line = self._gpio.get_line(pin)
                line.request(consumer="sensorium-led", type=gpiod.LINE_REQ_DIR_OUT, default_vals=[0])
                self._pins[name] = line
        elif GPIO_BACKEND == "RPi.GPIO":
            self._pins = {"red": PIN_RED, "blue": PIN_BLUE, "green": PIN_GREEN}

    # ─── Raw GPIO Write ───────────────────────────────────────────────────────
    def _set(self, name: str, value: int):
        if GPIO_BACKEND == "gpiod":
            self._pins[name].set_value(value)
        elif GPIO_BACKEND == "RPi.GPIO":
            import RPi.GPIO as GPIO
            GPIO.output(self._pins[name], value)
        elif GPIO_BACKEND == "MOCK":
            symbols = {0: "○", 1: "●"}
            colors  = {"red": "\033[31m", "blue": "\033[34m", "green": "\033[32m"}
            reset   = "\033[0m"
            print(f"\r  LED {colors[name]}{name.upper()}{reset} {symbols[value]}   ", end="", flush=True)

    def _all_off(self):
        for name in ["red", "blue", "green"]:
            self._set(name, 0)

    # ─── Animation Loops ──────────────────────────────────────────────────────
    def _loop_booting(self):
        """Red solid — booting."""
        self._all_off()
        self._set("red", 1)
        while not self._stop.is_set() and self._state == LedState.BOOTING:
            time.sleep(0.1)

    def _loop_searching(self):
        """Blue blinking 1Hz — searching for PC."""
        self._all_off()
        while not self._stop.is_set() and self._state == LedState.SEARCHING:
            self._set("blue", 1)
            time.sleep(0.5)
            self._set("blue", 0)
            time.sleep(0.5)

    def _loop_connected(self):
        """Blue solid — PC connected, ready."""
        self._all_off()
        self._set("blue", 1)
        while not self._stop.is_set() and self._state == LedState.CONNECTED:
            time.sleep(0.1)

    def _loop_processing(self):
        """Green pulse — AI inference running."""
        self._all_off()
        while not self._stop.is_set() and self._state == LedState.PROCESSING:
            # Soft pulse effect via rapid on/off cycles
            for _ in range(10):
                if self._state != LedState.PROCESSING: break
                self._set("green", 1)
                time.sleep(0.05)
                self._set("green", 0)
                time.sleep(0.05)
            time.sleep(0.3)

    def _loop_error(self):
        """Red fast blink 4Hz — error state."""
        self._all_off()
        while not self._stop.is_set() and self._state == LedState.ERROR:
            self._set("red", 1)
            time.sleep(0.12)
            self._set("red", 0)
            time.sleep(0.12)

    def _loop_firmware_ota(self):
        """Sequential RGB blink — firmware update in progress."""
        while not self._stop.is_set() and self._state == LedState.FIRMWARE_OTA:
            for name in ["red", "blue", "green"]:
                self._all_off()
                self._set(name, 1)
                time.sleep(0.2)
        self._all_off()

    def _loop_off(self):
        self._all_off()
        while not self._stop.is_set() and self._state == LedState.OFF:
            time.sleep(0.1)

    # ─── State Machine ────────────────────────────────────────────────────────
    _state_loops = {
        LedState.BOOTING:      "_loop_booting",
        LedState.SEARCHING:    "_loop_searching",
        LedState.CONNECTED:    "_loop_connected",
        LedState.PROCESSING:   "_loop_processing",
        LedState.ERROR:        "_loop_error",
        LedState.FIRMWARE_OTA: "_loop_firmware_ota",
        LedState.OFF:          "_loop_off",
    }

    def _run(self):
        log.info(f"LED thread started. Initial state: {self._state.value}")
        while not self._stop.is_set():
            with self._lock:
                current = self._state
            loop_name = self._state_loops.get(current, "_loop_off")
            getattr(self, loop_name)()
        self._all_off()
        log.info("LED thread stopped. All LEDs off.")

    def start(self):
        self._stop.clear()
        self._thread = threading.Thread(target=self._run, daemon=True, name="led-controller")
        self._thread.start()

    def stop(self):
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=2)

    def set_state(self, state: LedState):
        with self._lock:
            if self._state != state:
                log.info(f"LED State: {self._state.value} --> {state.value}")
                self._state = state

    def cleanup(self):
        self.stop()
        if GPIO_BACKEND == "gpiod":
            for line in self._pins.values():
                line.release()
            if self._gpio:
                self._gpio.close()
        elif GPIO_BACKEND == "RPi.GPIO":
            import RPi.GPIO as GPIO
            GPIO.cleanup()


# ─── Connection Monitor ───────────────────────────────────────────────────────
class ConnectionMonitor:
    """
    Polls the local Sensorium backend to detect PC connection status
    and drives the LED state machine accordingly.
    """

    BACKEND_URL  = "http://localhost:3000/healthcheck"
    POLL_SECS    = 3
    INFERENCE_EP = "http://localhost:3000/api/v1/ai/status"

    def __init__(self, leds: LedController):
        self._leds = leds
        self._running = False

    def _check_backend(self) -> dict:
        try:
            import urllib.request
            import json
            req = urllib.request.Request(
                self.BACKEND_URL,
                headers={"User-Agent": "SensoriumLEDMonitor/1.0"}
            )
            with urllib.request.urlopen(req, timeout=2) as resp:
                return json.loads(resp.read())
        except Exception:
            return {}

    def _check_pc_connected(self) -> bool:
        """Check if a PC client has queried the backend recently (via active connections)."""
        try:
            import subprocess
            result = subprocess.run(
                ["ss", "-tn", "state", "established", "dport", ":3000"],
                capture_output=True, text=True, timeout=2
            )
            return len(result.stdout.strip().splitlines()) > 1
        except Exception:
            return False

    def _check_inference_active(self) -> bool:
        """Check if an AI inference is currently running."""
        try:
            import urllib.request, json
            with urllib.request.urlopen(self.INFERENCE_EP, timeout=1) as r:
                d = json.loads(r.read())
                return d.get("active", False)
        except Exception:
            return False

    def run(self):
        self._running = True
        log.info("Connection monitor started.")

        while self._running:
            backend = self._check_backend()

            if not backend:
                # Backend not running yet
                log.debug("Backend not responding — SEARCHING state")
                self._leds.set_state(LedState.SEARCHING)
            elif self._check_inference_active():
                # AI inference in progress
                self._leds.set_state(LedState.PROCESSING)
            elif self._check_pc_connected():
                # PC is connected via USB / LAN
                self._leds.set_state(LedState.CONNECTED)
            else:
                # Backend alive but no PC client
                self._leds.set_state(LedState.SEARCHING)

            time.sleep(self.POLL_SECS)

    def stop(self):
        self._running = False


# ─── Entry Point ─────────────────────────────────────────────────────────────
def main():
    leds    = LedController()
    monitor = ConnectionMonitor(leds)

    # Initial boot state
    leds.set_state(LedState.BOOTING)
    leds.start()

    # Simulate boot sequence (3s red, then switch to searching)
    log.info("Boot sequence: RED solid for 3s...")
    time.sleep(3)
    leds.set_state(LedState.SEARCHING)

    # Graceful shutdown on SIGTERM / SIGINT
    def shutdown(sig, frame):
        log.info("Shutdown signal received. Cleaning up...")
        monitor.stop()
        leds.cleanup()
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    # Start connection monitor (blocking)
    try:
        monitor.run()
    except KeyboardInterrupt:
        shutdown(None, None)


if __name__ == "__main__":
    main()
