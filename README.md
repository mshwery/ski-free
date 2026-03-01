## Scratch Pad Environment

This repository includes a lightweight scratch-pad environment bootstrap.

### Setup

1. Make the loader executable:
   - `chmod +x ./scratchpad-env.sh`
2. Run any command inside the scratchpad env:
   - `./scratchpad-env.sh -- env | rg '^SCRATCHPAD_'`

### Files

- `.env.scratchpad.example`: template values.
- `.env.scratchpad`: generated from the template on first run.
- `scratchpad-env.sh`: loads `.env.scratchpad` and runs your command.
