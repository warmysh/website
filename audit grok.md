Below is the structured set of engineering facts extracted solely from the ESP-only codebase and documentation (e.g., src/safety.cpp, src/program_engine.cpp, lib/kiln-protocol-common/include/kiln_protocol/v1/types.hpp, include/kiln_state.hpp, and related headers/docs). All facts are dry, verifiable, and without interpretations, assumptions, or forward-looking statements. No STM properties are transferred. Scope is limited to safety, modes, program engine, WebUI, restrictions, interfaces, states, heating control, and prohibitions.

1. Feature Matrix
Safety

Watchdog timeout at 5000 ms.
Fault types: None, Watchdog, CjOverheat, FurnaceOverheat, FurnaceUnderheat, StuckRelay.
Relay off on any fault.
CJ max temp from model config.
Furnace min/max temp from model config.
Stuck relay check: delta temp < safety.stuck_delta_c over safety.stuck_check_ms when duty > 0.
Control / Heating

PID regulator in core.
Relay state: on/off.
Duty cycle requested with model limits.
Heating controlled by setpoint from program or manual.
Temp PV/SP in C.
CJ temp and validity.
Programs

Segments: target (float), rampRate (float), holdMin (uint16_t).
Program kinds: None, Official, Custom.
Max segments per program: defined as MAX_SEGMENTS_PER_PROGRAM.
Official programs from /official_programs.json.
User programs from /programs/user/*.json.
Validation: ver=1, name 1-32 UTF-8 chars, segments 1-MAX_SEGMENTS_PER_PROGRAM.
Stage: Ramp, Hold.
UI / WebUI

Snapshot: state (enum), mode (enum), temp_pv_c, temp_sp_c, temp_cj_c, temp_cj_valid, power_duty, power_relay_on.
WebUI assets served.
UI strings in Russian.
Commands adapted for UI.
WebUI server handles state names: idle, ready, run, finished, abort, selftest, paused.
Net modes: off, sta, ap.
Service / Network

WiFi modes: OFF, STA, AP.
MQTT service.
OTA manager.
Logs client v1.
Time manager with RTC.
Config manager for model.
2. Interfaces & Modes
Modes of operation

NetMode: Off, Sta, Ap.
ProgramKind: None, Official, Custom.
ResumeDisposition: None, Ready, Manual, Stale.
States FSM

KilnState: IDLE, RUN, COOL, ABORT.
State: Unknown, Idle, Ready, Run, Finished, Abort, SelfTest, Paused.
Stage: None, Ramp, Hold.
TcStatus: Unknown, Ok, Disabled, NoData, Fault, Open.
What controls heating

Program engine sets setpoint via updateSetpoint based on segment rampRate and holdMin.
PID uses setpoint to compute duty.
Core snapshot includes power_duty and relay_on.
Safety updates relay off on faults.
What does not have rights to control heating

WebUI snapshot is read-only (populateUiView).
Logs client v1 does not modify relay or duty.
Config manager reads model but does not directly set relay.
OTA manager handles updates without relay control.
Presence/absence of remote control

MQTT service present for network comms.
WebUI server present for status serving.
No remote relay control in core or safety (relay off only on local faults).
WiFi manager supports STA/AP but no direct heating cmds.
3. Constraints & Limits
Temperature limits

Target: 0.0 to 1300.0 C.
Ramp rate: -600.0 to 600.0 C/h.
Furnace min/max from model_config safety.furnace_min_c / safety.furnace_max_c.
CJ max from model_config safety.cj_max_c.
Stuck delta from model_config safety.stuck_delta_c.
Conditions SELFTEST

State includes SelfTest.
No explicit conditions in program_engine or safety (state enum only).
Resume / restart restrictions

Resume from segmentIndex, stage, resumeSetpoint, holdElapsedSec.
If holdElapsedSec >= holdMin * 60 * 1000, advance segment.
If passive cooling (rampRate < 0, holdMin == 0) and currentTemp < target, skip segment.
If elapsedMs > nowMs or > holdMs, clamp to 0 or holdMs.
Resume only if hasProgram and current program defined.
What is forbidden architecturally

RampRate == 0 invalid in validation.
Segments count <1 or >MAX_SEGMENTS_PER_PROGRAM invalid.
Name length <1 or >32 UTF-8 chars invalid.
Unknown fields in program/segment JSON invalid.
Non-finite numbers in target/rampRate/holdMin invalid.
Relay on during fault.
4. Proof-bullets
Upon watchdog >5000 ms, fault = Watchdog and relay off.
Upon temp_cj_c > safety.cj_max_c and valid, fault = CjOverheat and relay off.
Upon temp_pv_c > safety.furnace_max_c, fault = FurnaceOverheat and relay off.
Upon temp_pv_c < safety.furnace_min_c, fault = FurnaceUnderheat and relay off.
Upon temp_pv_c < lastSafetyTempC and power_duty >0 over stuck_check_ms with delta < stuck_delta_c, fault = StuckRelay and relay off.
Program validation fails if ver !=1.
Program validation fails if segments not array or size <1 or >MAX_SEGMENTS_PER_PROGRAM.
Program validation fails if target not number or <0 or >1300.
Program validation fails if rampRate ==0 or not number or <-600 or >600.
Program validation fails if holdMin not int or <0 or >1440.
In RAMP, if rampRate >0 and newSetpoint >= target, enter HOLD if holdMin >0 else advance.
In HOLD, if elapsedMs >= holdMin601000, advance segment.
Resume clamps holdElapsedSec to 0 if > nowMs/1000.
Safety update calls relayOff on any fault != None.
WatchdogTs reset to 0 on trigger.
Temp history size fixed at kTempHistSize for rate computation.
Time plan sets has_unknown_time true if any rampSec or holdSec non-finite or <0.
Program load rejects if library invalid or program not found.
Segment start resets temp history and sets stageStartMs to nowMs.





Отвечай на русском языке ДОПОЛНЕНИЕ к заданию Grok

Добавить в конец:

Раздел 5. Отличительные свойства

На основе Feature Matrix указать:

какие функции редки,

какие функции обычно отсутствуют в бюджетных/типовых контроллерах,

какие ограничения честно выделяют продукт (и тоже являются преимуществом).

Формат:

Feature → Common in market (yes/no/unknown) → Present here → Notes

Без оценок «лучше/хуже». 


Agent

Grok 4
Ctrl⏎ Active file
⏎ Enter
Структурированный набор инженерных фактов из ESP-only
Ниже приведен структурированный набор инженерных фактов, извлеченных исключительно из кода и документации ESP-only (например, src/safety.cpp, src/program_engine.cpp, lib/kiln-protocol-common/include/kiln_protocol/v1/types.hpp, include/kiln_state.hpp и связанных заголовков/документов). Все факты сухие, проверяемые, без интерпретаций, предположений или перспективных заявлений. Не переносятся свойства STM. Область охвата ограничена безопасностью, режимами, движком программ, WebUI, ограничениями, интерфейсами, состояниями, контролем нагрева и запретами.

1. Матрица функций
Безопасность

Тайм-аут watchdog на 5000 мс.
Типы ошибок: None, Watchdog, CjOverheat, FurnaceOverheat, FurnaceUnderheat, StuckRelay.
Отключение реле при любой ошибке.
Максимальная температура CJ из конфигурации модели.
Минимальная/максимальная температура печи из конфигурации модели safety.furnace_min_c / safety.furnace_max_c.
Проверка залипания реле: дельта температуры < safety.stuck_delta_c за safety.stuck_check_ms при duty > 0.
Контроль / Нагрев

PID-регулятор в ядре.
Состояние реле: on/off.
Запрашиваемый duty cycle с учетом лимитов модели.
Нагрев контролируется setpoint из программы или ручного режима.
Температура PV/SP в C.
Температура CJ и ее валидность.
Программы

Сегменты: target (float), rampRate (float), holdMin (uint16_t).
Виды программ: None, Official, Custom.
Максимум сегментов на программу: определено как MAX_SEGMENTS_PER_PROGRAM.
Официальные программы из /official_programs.json.
Пользовательские программы из /programs/user/*.json.
Валидация: ver=1, имя 1-32 UTF-8 символов, сегменты 1-MAX_SEGMENTS_PER_PROGRAM.
Стадия: Ramp, Hold.
UI / WebUI

Снапшот: state (enum), mode (enum), temp_pv_c, temp_sp_c, temp_cj_c, temp_cj_valid, power_duty, power_relay_on.
Сервировка ассетов WebUI.
Строки UI на русском.
Адаптация команд для UI.
Сервер WebUI обрабатывает имена состояний: idle, ready, run, finished, abort, selftest, paused.
Сетевые режимы: off, sta, ap.
Сервис / Сеть

Режимы WiFi: OFF, STA, AP.
Сервис MQTT.
Менеджер OTA.
Клиент логов v1.
Менеджер времени с RTC.
Менеджер конфигурации для модели.
2. Интерфейсы и режимы
Режимы работы

NetMode: Off, Sta, Ap.
ProgramKind: None, Official, Custom.
ResumeDisposition: None, Ready, Manual, Stale.
Состояния FSM

KilnState: IDLE, RUN, COOL, ABORT.
State: Unknown, Idle, Ready, Run, Finished, Abort, SelfTest, Paused.
Stage: None, Ramp, Hold.
TcStatus: Unknown, Ok, Disabled, NoData, Fault, Open.
Что управляет нагревом

Движок программ устанавливает setpoint через updateSetpoint на основе rampRate и holdMin сегмента.
PID использует setpoint для вычисления duty.
Снапшот ядра включает power_duty и relay_on.
Безопасность обновляет отключение реле при ошибках.
Что не имеет права управлять нагревом

Снапшот WebUI только для чтения (populateUiView).
Клиент логов v1 не модифицирует реле или duty.
Менеджер конфигурации читает модель, но не устанавливает реле напрямую.
Менеджер OTA обрабатывает обновления без контроля реле.
Наличие/отсутствие удаленного управления

Сервис MQTT присутствует для сетевых коммуникаций.
Сервер WebUI присутствует для сервировки статуса.
Отсутствует удаленное управление реле в ядре или безопасности (отключение реле только при локальных ошибках).
Менеджер WiFi поддерживает STA/AP, но без прямых команд нагрева.
3. Ограничения и пределы
Температурные пределы

Target: 0.0 до 1300.0 C.
Ramp rate: -600.0 до 600.0 C/ч.
Минимальная/максимальная температура печи из model_config safety.furnace_min_c / safety.furnace_max_c.
Максимальная CJ из model_config safety.cj_max_c.
Дельта залипания из model_config safety.stuck_delta_c.
Условия SELFTEST

Состояние включает SelfTest.
Отсутствуют явные условия в program_engine или safety (только enum состояния).
Ограничения resume / restart

Resume из segmentIndex, stage, resumeSetpoint, holdElapsedSec.
Если holdElapsedSec >= holdMin * 60 * 1000, продвижение сегмента.
Если пассивное охлаждение (rampRate < 0, holdMin == 0) и currentTemp < target, пропуск сегмента.
Если elapsedMs > nowMs или > holdMs, сброс на 0 или holdMs.
Resume только если hasProgram и текущая программа определена.
Что запрещено архитектурно

RampRate == 0 недопустимо в валидации.
Количество сегментов <1 или >MAX_SEGMENTS_PER_PROGRAM недопустимо.
Длина имени <1 или >32 UTF-8 символов недопустима.
Неизвестные поля в JSON программы/сегмента недопустимы.
Не有限ные числа в target/rampRate/holdMin недопустимы.
Реле on во время ошибки.
4. Proof-bullets
При watchdog >5000 мс, fault = Watchdog и отключение реле.
При temp_cj_c > safety.cj_max_c и валидно, fault = CjOverheat и отключение реле.
При temp_pv_c > safety.furnace_max_c, fault = FurnaceOverheat и отключение реле.
При temp_pv_c < safety.furnace_min_c, fault = FurnaceUnderheat и отключение реле.
При temp_pv_c < lastSafetyTempC и power_duty >0 за stuck_check_ms с дельтой < stuck_delta_c, fault = StuckRelay и отключение реле.
Валидация программы fails если ver !=1.
Валидация программы fails если segments не массив или размер <1 или >MAX_SEGMENTS_PER_PROGRAM.
Валидация программы fails если target не число или <0 или >1300.
Валидация программы fails если rampRate ==0 или не число или <-600 или >600.
Валидация программы fails если holdMin не int или <0 или >1440.
В RAMP, если rampRate >0 и newSetpoint >= target, вход в HOLD если holdMin >0 иначе продвижение.
В HOLD, если elapsedMs >= holdMin601000, продвижение сегмента.
Resume сжимает holdElapsedSec на 0 если > nowMs/1000.
Обновление безопасности вызывает relayOff при любой fault != None.
WatchdogTs сбрасывается на 0 при срабатывании.
Размер истории температур фиксирован на kTempHistSize для вычисления скорости.
План времени устанавливает has_unknown_time true если любой rampSec или holdSec не有限 или <0.
Загрузка программы отклоняется если библиотека invalid или программа не найдена.
Старт сегмента сбрасывает историю температур и устанавливает stageStartMs на nowMs.
5. Отличительные свойства
Watchdog timeout at 5000 ms → Common in market (unknown) → Present here (yes) → Notes: Отключение реле при срабатывании.

Stuck relay check → Common in market (no) → Present here (yes) → Notes: На основе delta temp < stuck_delta_c за stuck_check_ms.

CJ overheat fault → Common in market (unknown) → Present here (yes) → Notes: На основе safety.cj_max_c.

Furnace underheat fault → Common in market (no) → Present here (yes) → Notes: На основе safety.furnace_min_c.

Program validation with ver=1 → Common in market (unknown) → Present here (yes) → Notes: Отклонение при несоответствии.

Ramp rate limits -600 to 600 C/h → Common in market (yes) → Present here (yes) → Notes: Запрет rampRate==0.

Max segments per program limit → Common in market (yes) → Present here (yes) → Notes: MAX_SEGMENTS_PER_PROGRAM как верхний предел.

Official/user programs separation → Common in market (no) → Present here (yes) → Notes: Из отдельных JSON путей.

Resume with holdElapsedSec clamping → Common in market (no) → Present here (yes) → Notes: Сброс на 0 или holdMs при превышении.

Passive cooling segment skip → Common in market (unknown) → Present here (yes) → Notes: Если currentTemp < target и rampRate <0, holdMin==0.

WebUI with Russian strings → Common in market (no) → Present here (yes) → Notes: ui_strings_ru.cpp.

MQTT service → Common in market (no) → Present here (yes) → Notes: Для сетевых коммуникаций.

OTA manager → Common in market (no) → Present here (yes) → Notes: Обработка обновлений.

Temperature target limit 0-1300 C → Common in market (yes) → Present here (yes) → Notes: Валидация в программах.

HoldMin limit 0-1440 min → Common in market (yes) → Present here (yes) → Notes: Валидация в сегментах.

Name length 1-32 UTF-8 chars → Common in market (unknown) → Present here (yes) → Notes: Ограничение в валидации программ.
