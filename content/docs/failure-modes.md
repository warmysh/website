# Failure modes and recovery (public matrix)

## Matrix

| Failure mode | Detection | Automatic reaction | Recovery action |
| --- | --- | --- | --- |
| Absolute/relative overtemperature | Temperature threshold logic | Immediate STOP, heating OFF, ABORT latch | Check process and sensor path, explicit operator reset |
| Thermocouple fault (MAX31856 fault bits) | Sensor fault flags | Immediate STOP, heating OFF, ABORT latch | Repair sensor wiring/sensor, rerun SELFTEST |
| SSR stuck ON / current when command is OFF | Current diagnostics | Power path shutdown via safety contour, ABORT latch | Inspect SSR/power stage, replace faulty part, rerun SELFTEST |
| Heater open circuit / low current at high duty | Current below expected range | STOP with fault state, heating blocked | Check heater and wiring continuity, rerun SELFTEST |
| Sensor freeze / no expected thermal response | Delta-temperature watchdog logic | STOP with fault state, heating blocked | Fix sensor placement/connection, validate response |
| Logic inconsistency (e.g. temperature growth with OFF command) | Safety plausibility checks | Immediate STOP, ABORT latch | Diagnose power stage/control path, explicit operator reset |
| Power interruption during run | Boot-time resume logic + SELFTEST gate | Safe reboot; resume allowed only under strict conditions | Confirm resume preconditions or start from safe IDLE |
| Watchdog reset | Hardware watchdog timeout | Automatic reset to safe state (heating OFF) | Diagnose stall reason, verify stability before restart |
| SELFTEST failed | Pre-start checks | Heating remains blocked | Remove root cause and pass SELFTEST |
| Slow/overloaded network client | Service time budget monitor | Client disconnect, control loop priority preserved | Fix network side; heating contour keeps deterministic behavior |

## Common recovery policy

- Safety contour has priority over UI and network.
- Recovery requires explicit operator action for critical faults.
- No remote bypass of safety gates is provided.

## Related docs

- [Technical specification](/docs/technical-specification/)
- [SELFTEST scope](/docs/selftest-scope/)
- [Integration checklist](/docs/integration-checklist/)
