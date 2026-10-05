# Certificate and Event ID Formats for 5 Scenarios

## Overview
This document shows the Event Reference ID and Certificate Reference ID formats for all 5 certificate scenarios.

---

## Format Structure

### Event Reference ID Format
```
{PREFIX}-RSM-2026-PDL-RHL-EVT-{CONTEXT}-{NUMBER}
```

**Components:**
- `PREFIX`: TGSG (statewide) or District Code (regional)
- `RSM`: Road Safety Month (hardcoded)
- `2026`: Year (hardcoded)
- `PDL`: Officer code (Padala)
- `RHL`: Officer code (Rahul)
- `EVT`: Event identifier
- `CONTEXT`: ON (Online) or OF (Offline) - Events are always OF (created by organizers)
- `NUMBER`: 5-digit sequential number (00001-100000)

**Note:** TGSG prefix already indicates statewide, district code indicates regional. ON/OF distinguishes online vs offline participation.

### Certificate Reference ID Format
```
{PREFIX}-RSM-2026-PDL-RHL-{CERT_TYPE}-{CONTEXT}-{NUMBER}
```

**Components:**
- `PREFIX`: TGSG (statewide), District Code (regional), or KRMR (online without event)
- `RSM`: Road Safety Month (hardcoded)
- `2026`: Year (hardcoded)
- `PDL`: Officer code (Padala)
- `RHL`: Officer code (Rahul)
- `CERT_TYPE`: PARTICIPANT, MERIT, or ORGANIZER
- `CONTEXT`: ON (Online) or OF (Offline) - Based on participation context
- `NUMBER`: 5-digit number (random 10000-99999 for online without event, or sequential)

---

## Scenario 1: Online Without Event ID

**Participation Context:** `online`  
**Event Type:** `null`  
**Event Reference ID:** `N/A` (no event)

### Certificate Reference ID Example:
```
KRMR-RSM-2026-PDL-RHL-PARTICIPANT-ON-45231
KRMR-RSM-2026-PDL-RHL-MERIT-ON-78294
KRMR-RSM-2026-PDL-RHL-ORGANIZER-ON-15678
```

**Notes:**
- Uses `KRMR` (Karimnagar) as default prefix
- Certificate ID has `-ON-` (Online - no event, direct online participation)
- Certificate number is random (10000-99999)
- No event ID associated

---

## Scenario 2: Online With Statewide Event ID

**Participation Context:** `online`  
**Event Type:** `statewide`  
**Event Reference ID:** `TGSG-RSM-2026-PDL-RHL-EVT-OF-00001` (Event is offline, but participant is online)

### Event Reference ID Example:
```
TGSG-RSM-2026-PDL-RHL-EVT-OF-00001
TGSG-RSM-2026-PDL-RHL-EVT-OF-00002
TGSG-RSM-2026-PDL-RHL-EVT-OF-00123
```

### Certificate Reference ID Example:
```
TGSG-RSM-2026-PDL-RHL-PARTICIPANT-ON-00001
TGSG-RSM-2026-PDL-RHL-MERIT-ON-00015
TGSG-RSM-2026-PDL-RHL-ORGANIZER-ON-00008
```

**Notes:**
- Event ID uses `TGSG` prefix (Telangana State Government) - indicates statewide
- Event ID has `EVT-OF-` (Offline Event - events are always offline)
- Certificate ID uses `TGSG` prefix matching the event
- Certificate ID has `-ON-` (Online - participant participated online)
- Certificate number can be sequential or random

---

## Scenario 3: Online With Regional Event ID

**Participation Context:** `online`  
**Event Type:** `regional`  
**Event Reference ID:** `{DISTRICT_CODE}-RSM-2026-PDL-RHL-EVT-OF-00001` (Event is offline, but participant is online)

### Event Reference ID Examples:
```
KRMR-RSM-2026-PDL-RHL-EVT-OF-00001  (Karimnagar)
HYDR-RSM-2026-PDL-RHL-EVT-OF-00001  (Hyderabad)
WRGL-RSM-2026-PDL-RHL-EVT-OF-00001  (Warangal)
```

### Certificate Reference ID Examples:
```
KRMR-RSM-2026-PDL-RHL-PARTICIPANT-ON-00001  (Karimnagar)
HYDR-RSM-2026-PDL-RHL-MERIT-ON-00015       (Hyderabad)
WRGL-RSM-2026-PDL-RHL-ORGANIZER-ON-00008   (Warangal)
```

**Notes:**
- Event ID uses district code prefix (e.g., `KRMR` for Karimnagar) - indicates regional
- Event ID has `EVT-OF-` (Offline Event - events are always offline)
- Certificate ID uses same district code prefix as the event
- Certificate ID has `-ON-` (Online - participant participated online)
- Certificate number can be sequential or random

---

## Scenario 4: Offline With Statewide Event ID

**Participation Context:** `offline`  
**Event Type:** `statewide`  
**Event Reference ID:** `TGSG-RSM-2026-PDL-RHL-EVT-OF-00001`

### Event Reference ID Example:
```
TGSG-RSM-2026-PDL-RHL-EVT-OF-00001
TGSG-RSM-2026-PDL-RHL-EVT-OF-00002
TGSG-RSM-2026-PDL-RHL-EVT-OF-00123
```

### Certificate Reference ID Example:
```
TGSG-RSM-2026-PDL-RHL-PARTICIPANT-OF-00001
TGSG-RSM-2026-PDL-RHL-MERIT-OF-00015
TGSG-RSM-2026-PDL-RHL-ORGANIZER-OF-00008
```

**Notes:**
- Event ID uses `TGSG` prefix (Telangana State Government) - indicates statewide
- Event ID has `EVT-OF-` (Offline Event)
- Certificate ID uses `TGSG` prefix matching the event
- Certificate ID has `-OF-` (Offline - participant participated offline)
- Certificate number can be sequential or random

---

## Scenario 5: Offline With Regional Event ID

**Participation Context:** `offline`  
**Event Type:** `regional`  
**Event Reference ID:** `{DISTRICT_CODE}-RSM-2026-PDL-RHL-EVT-OF-00001`

### Event Reference ID Examples:
```
KRMR-RSM-2026-PDL-RHL-EVT-OF-00001  (Karimnagar)
HYDR-RSM-2026-PDL-RHL-EVT-OF-00001  (Hyderabad)
WRGL-RSM-2026-PDL-RHL-EVT-OF-00001  (Warangal)
```

### Certificate Reference ID Examples:
```
KRMR-RSM-2026-PDL-RHL-PARTICIPANT-OF-00001  (Karimnagar)
HYDR-RSM-2026-PDL-RHL-MERIT-OF-00015       (Hyderabad)
WRGL-RSM-2026-PDL-RHL-ORGANIZER-OF-00008   (Warangal)
```

**Notes:**
- Event ID uses district code prefix (e.g., `KRMR` for Karimnagar) - indicates regional
- Event ID has `EVT-OF-` (Offline Event)
- Certificate ID uses same district code prefix as the event
- Certificate ID has `-OF-` (Offline - participant participated offline)
- Certificate number can be sequential or random

---

## District Code Reference

Common district codes:
- `KRMR` - Karimnagar
- `HYDR` - Hyderabad
- `WRGL` - Warangal
- `NLGD` - Nalgonda
- `KHMM` - Khammam
- `MDML` - Medchal–Malkajgiri
- `RNGR` - Ranga Reddy
- `SNGR` - Sangareddy
- `ADLB` - Adilabad
- `BHDK` - Bhadradri Kothagudem
- `JAGT` - Jagtial
- `JNGO` - Jangaon
- `JSBP` - Jayashankar Bhupalpally
- `JGLG` - Jogulamba Gadwal
- `KMRD` - Kamareddy
- `KMBA` - Kumuram Bheem Asifabad
- `MHBB` - Mahabubabad
- `MHBN` - Mahabubnagar
- `MNCH` - Mancherial
- `MEDK` - Medak
- `MLGU` - Mulugu
- `NGKN` - Nagarkurnool
- `NRYP` - Narayanpet
- `NRML` - Nirmal
- `NZBD` - Nizamabad
- `PDDL` - Peddapalli
- `RJSR` - Rajanna Sircilla
- `SDDP` - Siddipet
- `SRYP` - Suryapet
- `VKBD` - Vikarabad
- `WNPR` - Wanaparthy
- `HNKD` - Hanumakonda
- `YDBG` - Yadadri Bhuvanagiri

---

## Summary Table

| Scenario | Participation | Event Type | Event ID Prefix | Certificate ID Prefix | Event ID Format | Certificate ID Format |
|----------|--------------|------------|----------------|----------------------|-----------------|----------------------|
| 1 | Online | None | N/A | `KRMR` | N/A | `KRMR-RSM-2026-PDL-RHL-{TYPE}-ON-{RANDOM}` |
| 2 | Online | Statewide | `TGSG` | `TGSG` | `TGSG-RSM-2026-PDL-RHL-EVT-OF-{NUM}` | `TGSG-RSM-2026-PDL-RHL-{TYPE}-ON-{NUM}` |
| 3 | Online | Regional | District Code | District Code | `{DIST}-RSM-2026-PDL-RHL-EVT-OF-{NUM}` | `{DIST}-RSM-2026-PDL-RHL-{TYPE}-ON-{NUM}` |
| 4 | Offline | Statewide | `TGSG` | `TGSG` | `TGSG-RSM-2026-PDL-RHL-EVT-OF-{NUM}` | `TGSG-RSM-2026-PDL-RHL-{TYPE}-OF-{NUM}` |
| 5 | Offline | Regional | District Code | District Code | `{DIST}-RSM-2026-PDL-RHL-EVT-OF-{NUM}` | `{DIST}-RSM-2026-PDL-RHL-{TYPE}-OF-{NUM}` |

**Legend:**
- `{TYPE}` = PARTICIPANT, MERIT, or ORGANIZER
- `{NUM}` = 5-digit number (00001-100000)
- `{RANDOM}` = Random 5-digit number (10000-99999)
- `{DIST}` = District code (e.g., KRMR, HYDR, WRGL)
- `ON` = Online participation context
- `OF` = Offline participation context

